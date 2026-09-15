import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to DB.');
    
    await AppDataSource.query(`ALTER TABLE customer_receipts ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to customer_receipts.');

    await AppDataSource.query(`ALTER TABLE customer_refunds ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to customer_refunds.');

    await AppDataSource.query(`ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to sales_returns.');

    // Also verify invoices just in case
    await AppDataSource.query(`ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to sales_invoices.');

    // And expenses
    await AppDataSource.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';`);
    console.log('Added status to expenses.');

    console.log('All patches applied successfully.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
