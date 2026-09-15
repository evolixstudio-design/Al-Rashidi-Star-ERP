import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to DB natively.');
    
    await client.query(`ALTER TABLE customer_receipts ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to customer_receipts.');

    await client.query(`ALTER TABLE customer_refunds ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to customer_refunds.');

    await client.query(`ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to sales_returns.');

    await client.query(`ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to sales_invoices.');

    await client.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to expenses.');

    console.log('All patches applied successfully via native pg.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.end();
  }
}

run();
