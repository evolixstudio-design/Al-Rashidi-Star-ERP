require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fullBackup() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL not found in backend/.env');
  }

  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Neon Database successfully.');

  // Fetch all user tables in public schema
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log(`Found ${tables.length} tables:`, tables.join(', '));

  const backupDir = path.resolve('backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFileName = `neon_full_backup_${timestamp}.json`;
  const sqlFileName = `neon_full_backup_${timestamp}.sql`;
  const jsonFilePath = path.join(backupDir, jsonFileName);
  const sqlFilePath = path.join(backupDir, sqlFileName);

  const snapshotData = {
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'Neon PostgreSQL (production)',
      version: '1.0',
      totalTables: tables.length,
      tables: {},
    },
    tables: {},
  };

  let sqlContent = `-- ========================================================\n`;
  sqlContent += `-- Al-Rashidi Star ERP - Full Neon Database Backup\n`;
  sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
  sqlContent += `-- Tables: ${tables.join(', ')}\n`;
  sqlContent += `-- ========================================================\n\n`;

  let grandTotal = 0;

  for (const table of tables) {
    try {
      const res = await client.query(`SELECT * FROM "${table}"`);
      const rows = res.rows;
      snapshotData.tables[table] = rows;
      snapshotData.metadata.tables[table] = rows.length;
      grandTotal += rows.length;
      console.log(`[BACKUP] Table "${table}": ${rows.length} rows`);

      sqlContent += `-- Table: "${table}" (${rows.length} rows)\n`;
      if (rows.length > 0) {
        for (const row of rows) {
          const cols = Object.keys(row).map(k => `"${k}"`).join(', ');
          const vals = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sqlContent += `INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`;
        }
      }
      sqlContent += `\n`;
    } catch (err) {
      console.error(`Error backing up table "${table}":`, err.message);
    }
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(snapshotData, null, 2), 'utf-8');
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf-8');

  const jsonStat = fs.statSync(jsonFilePath);
  const sqlStat = fs.statSync(sqlFilePath);

  console.log(`\n================ BACKUP COMPLETED ================`);
  console.log(`Total Records: ${grandTotal}`);
  console.log(`JSON Backup: ${jsonFileName} (${(jsonStat.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`SQL Backup:  ${sqlFileName} (${(sqlStat.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Directory:   ${backupDir}`);
  console.log(`==================================================\n`);

  await client.end();
}

fullBackup().catch(err => {
  console.error('BACKUP FAILED:', err);
  process.exit(1);
});

