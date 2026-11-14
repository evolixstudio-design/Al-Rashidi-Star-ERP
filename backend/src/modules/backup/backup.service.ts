import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from '../audit/audit.service.js';

const execFileAsync = promisify(execFile);
const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;

export interface BackupFileInfo {
  fileName: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  type: 'SQL_PG_DUMP' | 'JSON_SNAPSHOT';
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.resolve(process.cwd(), 'backups');

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {
    fs.mkdirSync(this.backupDir, { recursive: true });
  }

  private getConnection() {
    const configuredUrl = this.configService.get<string>('DATABASE_URL');
    const url = configuredUrl ? new URL(configuredUrl) : null;
    const host = url?.hostname || this.configService.get<string>('DB_HOST', '127.0.0.1');
    return {
      host: host.endsWith('.neon.tech') ? host.replace('-pooler', '') : host,
      port: url?.port || this.configService.get<string>('DB_PORT', '5432'),
      username: url ? decodeURIComponent(url.username) : this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: url ? decodeURIComponent(url.password) : this.configService.get<string>('DB_PASSWORD'),
      database: url ? decodeURIComponent(url.pathname.slice(1)) : this.configService.get<string>('DB_DATABASE', 'rashidi_erp'),
      ssl: host.endsWith('.neon.tech') || this.configService.get<string>('DB_SSL') === 'true' || Boolean(url?.searchParams.has('sslmode')),
    };
  }

  async createPgDump(user?: any): Promise<{ success: boolean; fileName: string; path: string; message: string }> {
    const connection = this.getConnection();
    const fileName = `rashidi_pg_dump_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    const filePath = path.join(this.backupDir, fileName);
    const partialPath = `${filePath}.partial`;
    const pgDumpBin = [18, 17, 16, 15, 14]
      .map((version) => `C:\\Program Files\\PostgreSQL\\${version}\\bin\\pg_dump.exe`)
      .find((candidate) => fs.existsSync(candidate)) || 'pg_dump';

    try {
      await execFileAsync(pgDumpBin, ['--format=plain', '--no-owner', '--no-privileges', '--lock-wait-timeout=10000', '--file', partialPath], {
        timeout: 120000,
        env: {
          ...process.env,
          PGHOST: connection.host,
          PGPORT: connection.port,
          PGUSER: connection.username,
          PGPASSWORD: connection.password,
          PGDATABASE: connection.database,
          PGSSLMODE: connection.ssl ? 'require' : 'disable',
          PGCONNECT_TIMEOUT: '10',
        },
      });
      await fs.promises.rename(partialPath, filePath);
    } catch {
      await fs.promises.rm(partialPath, { force: true });
      this.logger.warn('Native pg_dump unavailable or failed; creating a complete JSON backup.');
      const snapshot = await this.exportJsonSnapshot(user);
      return {
        success: true,
        fileName: snapshot.meta.fileName,
        path: path.join(this.backupDir, snapshot.meta.fileName),
        message: 'Complete JSON backup created. PostgreSQL command-line tools were unavailable; download this file for safekeeping.',
      };
    }

    await this.auditService.log({
      action: 'CREATE_BACKUP', entityType: 'DATABASE', entityId: fileName,
      performedBy: user?.displayName || 'System Admin', details: { fileName, type: 'PG_DUMP' },
    }).catch(() => this.logger.warn('Backup saved, but its audit entry could not be recorded.'));
    return { success: true, fileName, path: filePath, message: 'Complete PostgreSQL backup created. Download it for safekeeping.' };
  }

  async exportJsonSnapshot(user?: any): Promise<any> {
    const data = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      await manager.query('SET TRANSACTION READ ONLY');
      const tables: { tablename: string }[] = await manager.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
      const textColumns: { table_name: string; column_name: string }[] = await manager.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND data_type IN ('timestamp without time zone', 'timestamp with time zone', 'date', 'bytea')");
      const snapshot: Record<string, any[]> = {};
      for (const { tablename } of tables) {
        // Fail the whole export rather than silently publish an incomplete backup.
        // Preserve timestamp precision and encode image bytes compactly as PostgreSQL hex text.
        const textValues = textColumns.filter((column) => column.table_name === tablename).map((column) => `, ${quoteIdentifier(column.column_name)}::text AS ${quoteIdentifier(column.column_name)}`).join('');
        snapshot[tablename] = await manager.query(`SELECT *${textValues} FROM ${quoteIdentifier(tablename)}`);
      }
      return snapshot;
    });
    const fileName = `rashidi_snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const payload = {
      meta: {
        system: 'Rashidi Traders Kuwait ERP', currency: 'Kuwait Dinar (KD)', version: '1.0.0',
        exportedAt: new Date().toISOString(), exportedBy: user?.displayName || 'Owner', fileName, timestampFormat: 'postgres-text',
        totalTables: Object.keys(data).length,
        totalRecords: Object.values(data).reduce((total, rows) => total + rows.length, 0),
      },
      data,
    };
    const filePath = path.join(this.backupDir, fileName);
    await fs.promises.writeFile(`${filePath}.partial`, JSON.stringify(payload, null, 2), { flag: 'wx' });
    await fs.promises.rename(`${filePath}.partial`, filePath);
    await this.auditService.log({
      action: 'CREATE_BACKUP', entityType: 'DATABASE', entityId: fileName,
      performedBy: user?.displayName || 'Owner', details: { fileName, type: 'JSON_SNAPSHOT' },
    }).catch(() => this.logger.warn('Backup saved, but its audit entry could not be recorded.'));
    return payload;
  }

  async restoreJsonSnapshot(payload: any, user: any): Promise<{ success: boolean; message: string; rowsRestored: number }> {
    if (!payload?.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      throw new BadRequestException('Invalid backup payload. Expected { meta: {...}, data: {...} }.');
    }

    const rowsRestored = await this.dataSource.transaction(async (manager) => {
      const columns: { table_name: string; column_name: string; sequence: string | null }[] = await manager.query(
        "SELECT table_name, column_name, pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) AS sequence FROM information_schema.columns WHERE table_schema = 'public' ORDER BY ordinal_position",
      );
      const tableColumns = new Map<string, Set<string>>();
      for (const column of columns) {
        if (!tableColumns.has(column.table_name)) tableColumns.set(column.table_name, new Set());
        tableColumns.get(column.table_name)!.add(column.column_name);
      }
      const remaining = Object.keys(payload.data);
      for (const table of remaining) {
        if (!tableColumns.has(table) || !Array.isArray(payload.data[table])) {
          throw new BadRequestException(`Invalid backup table: ${table}`);
        }
      }
      const dependencies: { child: string; parent: string }[] = await manager.query(
        "SELECT child.relname AS child, parent.relname AS parent FROM pg_constraint fk JOIN pg_class child ON child.oid = fk.conrelid JOIN pg_class parent ON parent.oid = fk.confrelid JOIN pg_namespace ns ON ns.oid = child.relnamespace WHERE fk.contype = 'f' AND ns.nspname = 'public'",
      );
      const ordered: string[] = [];
      while (remaining.length) {
        const index = remaining.findIndex((table) => !dependencies.some((fk) => fk.child === table && fk.parent !== table && remaining.includes(fk.parent)));
        if (index < 0) throw new BadRequestException('Backup contains circular table dependencies. Use a PostgreSQL restore.');
        ordered.push(...remaining.splice(index, 1));
      }

      let inserted = 0;
      for (const table of ordered) {
        const records = payload.data[table];
        for (let offset = 0; offset < records.length; offset += 100) {
          const chunk = records.slice(offset, offset + 100);
          if (chunk.some((row: any) => !row || typeof row !== 'object' || Array.isArray(row))) {
            throw new BadRequestException(`Invalid record in ${table}`);
          }
          const keys = Object.keys(chunk[0]);
          if (!keys.length || keys.some((key) => !tableColumns.get(table)!.has(key)) || chunk.some((row: any) => Object.keys(row).length !== keys.length || keys.some((key) => !Object.hasOwn(row, key)))) {
            throw new BadRequestException(`Invalid columns in ${table}`);
          }
          const parameters: any[] = [];
          const values = chunk.map((row: any) => `(${keys.map((key) => {
            let value = row[key];
            if (value?.type === 'Buffer' && Array.isArray(value.data)) {
              if (!value.data.every((byte: any) => Number.isInteger(byte) && byte >= 0 && byte <= 255)) throw new BadRequestException('Invalid image data in backup');
              value = Buffer.from(value.data);
            } else if (value !== null && typeof value === 'object') {
              value = JSON.stringify(value);
            }
            parameters.push(value);
            return `$${parameters.length}`;
          }).join(', ')})`);
          const result = await manager.query(
            `INSERT INTO ${quoteIdentifier(table)} (${keys.map(quoteIdentifier).join(', ')}) OVERRIDING SYSTEM VALUE VALUES ${values.join(', ')} ON CONFLICT DO NOTHING RETURNING 1`, parameters,
          );
          inserted += result.length;
        }
        for (const column of columns.filter((column) => column.table_name === table && column.sequence)) {
          // Keep existing sequence progress while making restored IDs safe for the next insert.
          await manager.query(`SELECT setval($1::regclass, GREATEST((SELECT last_value FROM ${column.sequence}), COALESCE((SELECT MAX(${quoteIdentifier(column.column_name)}) FROM ${quoteIdentifier(table)}), 1)), true)`, [column.sequence]);
        }
      }
      await manager.query('INSERT INTO audit_events (entity_type, entity_id, action, performed_by, details) VALUES ($1, $2, $3, $4, $5)', [
        'DATABASE', 'ALL', 'RESTORE_DATABASE', user?.displayName || 'Owner', JSON.stringify({ rowsRestored: inserted, backupExportedAt: payload.meta?.exportedAt }),
      ]);
      return inserted;
    });
    return { success: true, message: `Database restored. ${rowsRestored} new records added; existing records preserved.`, rowsRestored };
  }

  async listBackups(): Promise<BackupFileInfo[]> {
    const result: BackupFileInfo[] = [];
    for (const fileName of await fs.promises.readdir(this.backupDir)) {
      if (!/\.(sql|json|dump)$/.test(fileName) || fileName.endsWith('.manifest.json')) continue;
      const filePath = path.join(this.backupDir, fileName);
      const stats = await fs.promises.stat(filePath);
      if (!stats.isFile() || !stats.size) continue;
      result.push({
        fileName, filePath, sizeBytes: stats.size, sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
        createdAt: stats.mtime.toISOString(), type: fileName.endsWith('.json') ? 'JSON_SNAPSHOT' : 'SQL_PG_DUMP',
      });
    }
    return result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  getBackupFilePath(fileName: string): string {
    if (path.basename(fileName) !== fileName || !/\.(sql|json|dump)$/.test(fileName)) throw new BadRequestException('Invalid backup filename.');
    const fullPath = path.join(this.backupDir, fileName);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) throw new NotFoundException('Backup file not found.');
    return fullPath;
  }

  getDisasterRecoveryGuide() {
    const { host, port, username, database } = this.getConnection();
    return {
      databaseEngine: 'PostgreSQL', host, port, database, username,
      commands: {
        manualBackup: `pg_dump -h ${host} -p ${port} -U ${username} -F c -b -v -f "rashidi_backup.dump" ${database}`,
        manualRestore: `pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -v "rashidi_backup.dump"`,
        plainSqlBackup: `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f rashidi_backup.sql`,
        plainSqlRestore: `psql -h ${host} -p ${port} -U ${username} -d ${database} -f rashidi_backup.sql`,
      },
      scheduledStrategy: 'Download backups to a safe external location. Files stored on the application server can be lost when the hosting service restarts or redeploys.',
    };
  }
}
