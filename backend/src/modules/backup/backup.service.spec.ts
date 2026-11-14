import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BackupService } from './backup.service.js';

vi.mock('child_process', () => ({
  exec: vi.fn((_command, _options, callback) => callback(Object.assign(new Error('not installed'), { code: 'ENOENT' }))),
  execFile: vi.fn((_file, _args, _options, callback) => callback(Object.assign(new Error('not installed'), { code: 'ENOENT' }))),
}));

describe('database backups', () => {
  let directory: string;
  let service: BackupService;
  let query: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), 'rashidi-backup-test-'));
    vi.spyOn(process, 'cwd').mockReturnValue(directory);
    query = vi.fn(async (sql: string) => {
      if (sql.includes('pg_tables')) return [{ tablename: 'users' }, { tablename: 'new_ledger' }];
      if (sql.includes('information_schema.columns')) return [];
      if (sql.startsWith('SET TRANSACTION')) return [];
      if (sql.includes('"users"')) return [{ id: 1 }];
      if (sql.includes('"new_ledger"')) return [{ id: 2, amount: '1.234' }];
      throw new Error('Unexpected table');
    });
    service = new BackupService(
      { get: (_key: string, fallback?: string) => fallback } as any,
      { query, transaction: async (...args: any[]) => args.at(-1)({ query }) } as any,
      { log: vi.fn().mockResolvedValue({}) } as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(directory, { recursive: true, force: true });
  });

  it('exports every actual table, including newly added ledgers', async () => {
    const snapshot = await service.exportJsonSnapshot();
    expect(Object.keys(snapshot.data)).toEqual(['users', 'new_ledger']);
    expect(snapshot.meta.totalRecords).toBe(2);
    expect(query).toHaveBeenCalledWith('SET TRANSACTION READ ONLY');
    const saved = JSON.parse(readFileSync(path.join(directory, 'backups', snapshot.meta.fileName), 'utf8'));
    expect(saved.data).toEqual(snapshot.data);
  });

  it('fails the backup if any table cannot be read', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('pg_tables')) return [{ tablename: 'products' }];
      if (sql.startsWith('SET TRANSACTION')) return [];
      throw new Error('Database connection lost');
    });
    await expect(service.exportJsonSnapshot()).rejects.toThrow('Database connection lost');
  });

  it('returns an honest complete JSON backup when pg_dump is unavailable', async () => {
    const result = await service.createPgDump();
    expect(result.fileName).toMatch(/\.json$/);
    expect(JSON.parse(readFileSync(result.path, 'utf8')).data.new_ledger).toHaveLength(1);
  });
});
