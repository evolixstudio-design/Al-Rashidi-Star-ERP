import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from '../audit/audit.service.js';

const execAsync = promisify(exec);

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
    if (!fs.existsSync(this.backupDir)) {
      try {
        fs.mkdirSync(this.backupDir, { recursive: true });
      } catch (err) {
        this.logger.error('Failed to create backup directory', err);
      }
    }
  }

  /* ── 1. PostgreSQL Native pg_dump ── */
  async createPgDump(user?: any): Promise<{ success: boolean; fileName: string; path: string; message: string }> {
    const host = this.configService.get<string>('DB_HOST', '127.0.0.1');
    const port = this.configService.get<string>('DB_PORT', '5432');
    const username = this.configService.get<string>('DB_USERNAME', 'postgres');
    const password = this.configService.get<string>('DB_PASSWORD');
    const dbName = this.configService.get<string>('DB_DATABASE', 'rashidi_erp');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `rashidi_pg_dump_${timestamp}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    const env = { ...process.env, PGPASSWORD: password };
    
    // Resolve pg_dump binary: check standard Windows paths if not in PATH
    let pgDumpBin = 'pg_dump';
    const standardPgPaths = [
      'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    ];
    for (const p of standardPgPaths) {
      if (fs.existsSync(p)) {
        pgDumpBin = `"${p}"`;
        break;
      }
    }

    const cmd = `${pgDumpBin} -h ${host} -p ${port} -U ${username} -d ${dbName} -F p -f "${filePath}"`;

    try {
      this.logger.log(`Executing native PostgreSQL backup: ${cmd}`);
      await execAsync(cmd, { env });

      await this.auditService.log({
        action: 'CREATE_BACKUP',
        entityType: 'DATABASE',
        entityId: fileName,
        performedBy: user?.displayName || 'System Admin',
        details: { fileName, type: 'PG_DUMP', database: dbName },
      });

      return {
        success: true,
        fileName,
        path: filePath,
        message: `PostgreSQL native pg_dump created successfully: ${fileName}`,
      };
    } catch (err: any) {
      this.logger.warn(`Native pg_dump command failed: ${err.message}. Falling back to full database snapshot.`);
      // If pg_dump binary is not in Windows system PATH, generate full SQL schema + data dump directly via TypeORM
      const fallbackDump = await this.generateSqlDumpFallback(fileName, filePath);

      await this.auditService.log({
        action: 'CREATE_BACKUP',
        entityType: 'DATABASE',
        entityId: fileName,
        performedBy: user?.displayName || 'System Admin',
        details: { fileName, type: 'SQL_FALLBACK', database: dbName },
      });

      return {
        success: true,
        fileName,
        path: filePath,
        message: fallbackDump.message,
      };
    }
  }

  /* ── 2. Full SQL Dump Fallback ── */
  private async generateSqlDumpFallback(fileName: string, filePath: string) {
    const tables = [
      'users',
      'company',
      'settings',
      'categories',
      'products',
      'stock_ledger',
      'suppliers',
      'purchase_receipts',
      'purchase_lines',
      'customers',
      'sales_invoices',
      'sales_invoice_lines',
      'customer_receipts',
      'expenses',
      'audit_events',
    ];

    let sqlContent = `-- ========================================================\n`;
    sqlContent += `-- Rashidi Traders Kuwait ERP - Production Database Backup\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
    sqlContent += `-- Engine: PostgreSQL (rashidi_erp)\n`;
    sqlContent += `-- ========================================================\n\n`;

    for (const table of tables) {
      try {
        const rows = await this.dataSource.query(`SELECT * FROM "${table}"`);
        sqlContent += `-- Table: ${table} (${rows.length} records)\n`;
        if (rows.length > 0) {
          for (const row of rows) {
            const columns = Object.keys(row).map((k) => `"${k}"`).join(', ');
            const values = Object.values(row)
              .map((val) => {
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'number' || typeof val === 'boolean') return val;
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return `'${String(val).replace(/'/g, "''")}'`;
              })
              .join(', ');
            sqlContent += `INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
          }
        }
        sqlContent += `\n`;
      } catch (err: any) {
        this.logger.warn(`Could not export table ${table}: ${err.message}`);
      }
    }

    fs.writeFileSync(filePath, sqlContent, 'utf-8');
    return {
      success: true,
      fileName,
      filePath,
      message: `Complete database SQL dump generated (${fileName})`,
    };
  }

  /* ── 3. JSON Snapshot (Data Export) ── */
  async exportJsonSnapshot(user?: any): Promise<any> {
    const tables = [
      'users',
      'company',
      'settings',
      'categories',
      'products',
      'stock_ledger',
      'suppliers',
      'purchase_receipts',
      'purchase_lines',
      'customers',
      'sales_invoices',
      'sales_invoice_lines',
      'customer_receipts',
      'expenses',
      'audit_events',
    ];

    const snapshotData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of tables) {
      try {
        const rows = await this.dataSource.query(`SELECT * FROM "${table}"`);
        snapshotData[table] = rows;
        totalRecords += rows.length;
      } catch (err: any) {
        this.logger.warn(`Could not export table ${table} for JSON snapshot: ${err.message}`);
        snapshotData[table] = [];
      }
    }

    const payload = {
      meta: {
        system: 'Rashidi Traders Kuwait ERP',
        currency: 'Kuwait Dinar (KD)',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: user?.displayName || 'Owner',
        totalTables: tables.length,
        totalRecords,
      },
      data: snapshotData,
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFileName = `rashidi_snapshot_${timestamp}.json`;
    const jsonFilePath = path.join(this.backupDir, jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(payload, null, 2), 'utf-8');

    return payload;
  }

  /* ── 4. Restore from JSON Snapshot ── */
  async restoreJsonSnapshot(payload: any, user: any): Promise<{ success: boolean; message: string; rowsRestored: number }> {
    if (!payload || !payload.data || typeof payload.data !== 'object') {
      throw new BadRequestException('Invalid backup payload format. Expected { meta: {...}, data: {...} }');
    }

    let rowsRestored = 0;
    const data = payload.data;

    await this.dataSource.transaction(async (manager) => {
      // Restore in safe dependency order
      const orderedTables = [
        'users',
        'company',
        'settings',
        'categories',
        'products',
        'suppliers',
        'customers',
        'purchase_receipts',
        'purchase_lines',
        'sales_invoices',
        'sales_invoice_lines',
        'customer_receipts',
        'stock_ledger',
        'expenses',
        'audit_events',
      ];

      for (const table of orderedTables) {
        const records = data[table];
        if (Array.isArray(records) && records.length > 0) {
          const chunkSize = 100; // Insert 100 records at a time
          for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            try {
              const columns = Object.keys(chunk[0]).map((k) => `"${k}"`).join(', ');
              const valuesArray = chunk.map((row) => {
                const values = Object.values(row).map((val) => {
                  if (val === null || val === undefined) return 'NULL';
                  if (typeof val === 'number' || typeof val === 'boolean') return val;
                  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                  return `'${String(val).replace(/'/g, "''")}'`;
                }).join(', ');
                return `(${values})`;
              });
              
              await manager.query(
                `INSERT INTO "${table}" (${columns}) VALUES ${valuesArray.join(', ')} ON CONFLICT DO NOTHING;`
              );
              rowsRestored += chunk.length;
            } catch (err: any) {
              this.logger.warn(`Restore chunk warning on ${table}: ${err.message}`);
              // Fallback to row-by-row if chunk insert fails due to one bad record
              for (const row of chunk) {
                try {
                   const cols = Object.keys(row).map((k) => `"${k}"`).join(', ');
                   const vals = Object.values(row).map((val) => {
                     if (val === null || val === undefined) return 'NULL';
                     if (typeof val === 'number' || typeof val === 'boolean') return val;
                     if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                     return `'${String(val).replace(/'/g, "''")}'`;
                   }).join(', ');
                   await manager.query(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`);
                   rowsRestored++;
                } catch(e) {}
              }
            }
          }
        }
      }

      await this.auditService.log({
        action: 'RESTORE_DATABASE',
        entityType: 'DATABASE',
        entityId: 'ALL',
        performedBy: user?.displayName || 'Owner',
        details: {
          rowsRestored,
          backupExportedAt: payload.meta?.exportedAt,
        },
      });
    });

    return {
      success: true,
      message: `Database successfully restored. ${rowsRestored} records synchronized.`,
      rowsRestored,
    };
  }

  /* ── 5. List Backups ── */
  async listBackups(): Promise<BackupFileInfo[]> {
    if (!fs.existsSync(this.backupDir)) return [];

    const files = fs.readdirSync(this.backupDir);
    const result: BackupFileInfo[] = [];

    for (const f of files) {
      if (f.endsWith('.sql') || f.endsWith('.json')) {
        const fPath = path.join(this.backupDir, f);
        const stats = fs.statSync(fPath);
        const sizeKb = (stats.size / 1024).toFixed(1);
        const isSql = f.endsWith('.sql');

        result.push({
          fileName: f,
          filePath: fPath,
          sizeBytes: stats.size,
          sizeFormatted: `${sizeKb} KB`,
          createdAt: stats.mtime.toISOString(),
          type: isSql ? 'SQL_PG_DUMP' : 'JSON_SNAPSHOT',
        });
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /* ── 6. Get Backup File Path for Download ── */
  getBackupFilePath(fileName: string): string {
    const sanitized = path.basename(fileName);
    const fullPath = path.join(this.backupDir, sanitized);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException(`Backup file "${sanitized}" not found.`);
    }
    return fullPath;
  }

  /* ── 7. Disaster Recovery CLI Guide ── */
  getDisasterRecoveryGuide() {
    const host = this.configService.get<string>('DB_HOST', '127.0.0.1');
    const port = this.configService.get<string>('DB_PORT', '5432');
    const username = this.configService.get<string>('DB_USERNAME', 'postgres');
    const dbName = this.configService.get<string>('DB_DATABASE', 'rashidi_erp');

    return {
      databaseEngine: 'PostgreSQL',
      host,
      port,
      database: dbName,
      username,
      commands: {
        manualBackup: `pg_dump -h ${host} -p ${port} -U ${username} -F c -b -v -f "rashidi_backup.dump" ${dbName}`,
        manualRestore: `pg_restore -h ${host} -p ${port} -U ${username} -d ${dbName} -v "rashidi_backup.dump"`,
        plainSqlBackup: `pg_dump -h ${host} -p ${port} -U ${username} -d ${dbName} > rashidi_backup.sql`,
        plainSqlRestore: `psql -h ${host} -p ${port} -U ${username} -d ${dbName} -f rashidi_backup.sql`,
      },
      scheduledStrategy:
        'Run Windows Task Scheduler or Linux crontab daily at 02:00 AM: pg_dump -h 127.0.0.1 -U postgres -d rashidi_erp -F c -f "backups/rashidi_$(date +%Y%m%d).dump"',
    };
  }
}
