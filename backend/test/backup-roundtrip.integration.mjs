import 'reflect-metadata';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import pg from 'pg';
import { parse } from 'dotenv';
import { DataSource } from 'typeorm';
import { BackupService } from '../dist/modules/backup/backup.service.js';

// Run from backend after npm run build. Only creates and removes its own localhost test database.
const directory = process.cwd();
const env = parse(readFileSync(path.join(directory, '.env')));
const manifestPath = readdirSync('backups').filter((file) => file.startsWith('production_before_fixes_') && file.endsWith('.manifest.json')).sort().at(-1);
assert(manifestPath, 'A verified safety backup is required');
const manifest = JSON.parse(readFileSync(path.join('backups', manifestPath), 'utf8'));
assert(manifest.restoreVerified && manifest.jsonVerified);
const snapshot = JSON.parse(readFileSync(manifest.jsonFile, 'utf8'));
const name = `rashidi_backup_test_${process.pid}_${Date.now()}`;
assert(/^rashidi_backup_test_\d+_\d+$/.test(name));
const local = { host: '127.0.0.1', port: Number(env.DB_PORT || 5432), user: env.DB_USERNAME, password: env.DB_PASSWORD };
const admin = new pg.Client({ ...local, database: 'postgres' });
const source = new DataSource({ type: 'postgres', host: local.host, port: local.port, username: local.user, password: local.password, database: name, entities: [], synchronize: false });
const temporary = mkdtempSync(path.join(tmpdir(), 'rashidi-backup-roundtrip-'));
const run = promisify(execFile);
const pgRestore = 'C:/Program Files/PostgreSQL/18/bin/pg_restore.exe';
let created = false;
try {
  await admin.connect();
  assert.equal((await admin.query('SELECT host(inet_server_addr()) AS address')).rows[0].address, '127.0.0.1');
  await admin.query(`CREATE DATABASE "${name}"`);
  created = true;
  const list = (await run(pgRestore, ['--list', manifest.file])).stdout;
  const listPath = path.join(temporary, 'schema.list');
  writeFileSync(listPath, list.split('\n').filter((line) => !line.includes('EXTENSION') || !line.includes('pg_session_jwt')).join('\n'));
  await run(pgRestore, ['--schema-only', '--exit-on-error', '--single-transaction', '--no-owner', '--no-privileges', `--use-list=${listPath}`, `--dbname=${name}`, manifest.file], {
    env: { ...process.env, PGHOST: local.host, PGPORT: String(local.port), PGUSER: local.user, PGPASSWORD: local.password, PGSSLMODE: 'disable', PGOPTIONS: '', PGCONNECT_TIMEOUT: '10' },
  });
  await source.initialize();
  process.chdir(temporary);
  const service = new BackupService({ get: () => undefined }, source, { log: async () => {} });
  const result = await service.restoreJsonSnapshot(snapshot, { displayName: 'Local restore test' });
  assert.equal(result.rowsRestored, manifest.totalRows);
  const roundtrip = await service.exportJsonSnapshot();
  for (const [table, records] of Object.entries(snapshot.data)) {
    const restored = roundtrip.data[table];
    const relevant = table === 'audit_events' ? restored.filter((row) => records.some((original) => original.id === row.id)) : restored;
    assert.equal(relevant.length, records.length, `Record count mismatch: ${table}`);
    for (let index = 0; index < records.length; index++) {
      const record = records[index];
      const row = Object.hasOwn(record, 'id') ? relevant.find((candidate) => candidate.id === record.id) : relevant[index];
      const normalized = JSON.parse(JSON.stringify(row));
      const differentColumns = Object.keys(record).filter((key) => {
        const expected = record[key]?.type === 'Buffer' ? `\\x${Buffer.from(record[key].data).toString('hex')}` : record[key];
        return !isDeepStrictEqual(normalized[key], expected);
      });
      assert.equal(differentColumns.join(', '), '', `Data mismatch in ${table}, columns`);
    }
  }
  const duplicate = await service.restoreJsonSnapshot(snapshot, { displayName: 'Local restore test' });
  assert.equal(duplicate.rowsRestored, 0, 'Merging a backup twice must not duplicate records');
  const compact = await service.restoreJsonSnapshot(JSON.parse(JSON.stringify(roundtrip)), { displayName: 'Local restore test' });
  assert.equal(compact.rowsRestored, 0, 'Compact image backups must also restore without errors');
  const auditCount = Number((await source.query('SELECT COUNT(*) AS count FROM audit_events'))[0].count);
  assert.equal(auditCount, snapshot.data.audit_events.length + 3, 'Audit history must be preserved');
  await assert.rejects(service.restoreJsonSnapshot({ data: { settings: [{ key: 'rollback_check', value: { test: true } }], products: [{ id: 999999, invalid_column: 'rejected' }] } }, {}), /Invalid columns/);
  assert.equal(Number((await source.query("SELECT COUNT(*) AS count FROM settings WHERE key = 'rollback_check'"))[0].count), 0, 'A failed restore must roll back every inserted row');
  const exported = await service.exportJsonSnapshot();
  assert.equal(exported.meta.totalTables, Object.keys(snapshot.data).length);
  assert.equal(exported.data.audit_events.length, auditCount);
  console.log(JSON.stringify({ passed: true, tables: exported.meta.totalTables, originalRows: manifest.totalRows, checks: ['all records and image bytes restored', 'audit history preserved', 'repeat restore adds no duplicates', 'invalid restore rolls back', 'all tables exported'] }));
} finally {
  process.chdir(directory);
  if (source.isInitialized) await source.destroy();
  if (created) await admin.query(`DROP DATABASE "${name}"`);
  await admin.end();
  rmSync(temporary, { recursive: true, force: true });
}
