/**
 * Rashidi Star ERP — Versioned Migration Runner
 *
 * Usage:
 *   npx tsx migrate.ts                       # localhost only
 *   ALLOW_PRODUCTION_MIGRATIONS=true npx tsx migrate.ts --production   # Neon
 *
 * Safety features:
 *   - Production guard: refuses to run against neon.tech without explicit flags
 *   - SHA-256 checksum: detects modified migration files
 *   - Transaction: migration SQL + tracking record are atomic
 *   - Idempotent: already-applied migrations are skipped
 *   - Never prints DATABASE_URL or passwords
 */

import 'dotenv/config';
import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { Client } from 'pg';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = join(import.meta.dirname ?? __dirname, 'migrations');

const SCHEMA_MIGRATIONS_DDL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    VARCHAR(10)  PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  checksum   VARCHAR(64)  NOT NULL,
  applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  applied_by VARCHAR(100) NOT NULL DEFAULT 'system'
);
`;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Parse V001__some_name.sql → { version: 'V001', name: 'some_name' } */
function parseMigrationFilename(filename: string): { version: string; name: string } | null {
  const match = filename.match(/^(V\d{3})__(.+)\.sql$/);
  if (!match) return null;
  return { version: match[1], name: match[2] };
}

function log(msg: string) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function fatal(msg: string): never {
  console.error(`\n❌ FATAL: ${msg}\n`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// Production Guard
// ─────────────────────────────────────────────────────────────

function checkProductionGuard(databaseUrl: string): void {
  // Extract host without exposing the full URL
  let host = '';
  try {
    const url = new URL(databaseUrl);
    host = url.hostname;
  } catch {
    // If URL parsing fails, check raw string
    host = databaseUrl;
  }

  const isNeon = host.includes('neon.tech');

  if (!isNeon) {
    log(`Database host: localhost/local — no production guard needed.`);
    return;
  }

  // Neon detected — require both protections
  const hasFlag = process.argv.includes('--production');
  const hasEnv = process.env.ALLOW_PRODUCTION_MIGRATIONS === 'true';

  if (!hasFlag || !hasEnv) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  PRODUCTION MIGRATION BLOCKED                               ║
║                                                             ║
║  Database host contains 'neon.tech'.                        ║
║  Explicit authorization required:                           ║
║                                                             ║
║  1. Set env: ALLOW_PRODUCTION_MIGRATIONS=true               ║
║  2. Run with: npx tsx migrate.ts --production               ║
║                                                             ║
║  Both conditions must be met.                               ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }

  log(`⚠️  PRODUCTION MODE — Running against Neon with explicit authorization.`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  // 1. Resolve DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    fatal('DATABASE_URL environment variable is not set.');
  }

  // 2. Production guard
  checkProductionGuard(databaseUrl);

  // 3. Determine SSL
  const needsSsl =
    databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=');

  // 4. Connect
  const client = new Client({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    log('Connected to database.');

    // 5. Ensure schema_migrations table exists
    await client.query(SCHEMA_MIGRATIONS_DDL);
    log('schema_migrations table ensured.');

    // 6. Read migration files
    let files: string[];
    try {
      files = readdirSync(MIGRATIONS_DIR)
        .filter((f) => /^V\d{3}__.*\.sql$/.test(f))
        .sort();
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        log('No migrations/ directory found. Nothing to do.');
        return;
      }
      throw err;
    }

    if (files.length === 0) {
      log('No migration files found. Nothing to do.');
      return;
    }

    log(`Found ${files.length} migration file(s): ${files.join(', ')}`);

    // 7. Process each migration
    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      const parsed = parseMigrationFilename(file);
      if (!parsed) {
        log(`⚠️  Skipping unrecognized file: ${file}`);
        continue;
      }

      const { version, name } = parsed;
      const filePath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(filePath, 'utf8');
      const checksum = sha256(sql);

      // Check if already applied
      const existing = await client.query(
        'SELECT checksum FROM schema_migrations WHERE version = $1',
        [version],
      );

      if (existing.rows.length > 0) {
        const recordedChecksum = existing.rows[0].checksum;

        if (recordedChecksum === checksum) {
          log(`✅ ${version} (${name}) — already applied, checksum matches. Skipping.`);
          skipped++;
          continue;
        } else {
          fatal(
            `Applied migration ${version} has been modified since it was applied.\n` +
            `   Recorded checksum: ${recordedChecksum}\n` +
            `   Current checksum:  ${checksum}\n` +
            `   Committed migrations must be immutable. Aborting.`,
          );
        }
      }

      // Apply migration inside a transaction
      log(`▶️  Applying ${version} (${name})...`);

      try {
        await client.query('BEGIN');

        // Execute the migration SQL
        await client.query(sql);

        // Record in tracking table
        await client.query(
          `INSERT INTO schema_migrations (version, name, checksum, applied_by)
           VALUES ($1, $2, $3, $4)`,
          [version, name, checksum, process.env.USER || process.env.USERNAME || 'system'],
        );

        await client.query('COMMIT');
        log(`✅ ${version} (${name}) — applied successfully.`);
        applied++;
      } catch (err: any) {
        await client.query('ROLLBACK').catch(() => {});
        fatal(`Migration ${version} failed:\n   ${err.message}`);
      }
    }

    log(`\nDone. Applied: ${applied}, Skipped: ${skipped}, Total: ${files.length}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration runner error:', err.message);
  process.exit(1);
});
