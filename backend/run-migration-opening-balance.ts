import 'dotenv/config';
import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';
const ssl = isProduction ? { rejectUnauthorized: false } : false;

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl,
  extra: {
    max: 1, // Single connection for migration
  },
});

async function run() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected.');

    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Starting transaction...');
    await queryRunner.startTransaction();

    try {
      console.log('1. Adding columns to customers...');
      await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceOriginalKd" decimal(12,3) DEFAULT 0;`);
      await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingOutstandingKd" decimal(12,3) DEFAULT 0;`);
      await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceDate" date;`);
      await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceNote" varchar(500);`);

      console.log('2. Adding status to customer_receipts...');
      await queryRunner.query(`ALTER TABLE "customer_receipts" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'POSTED';`);

      console.log('3. Creating customer_receipt_allocations table...');
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "customer_receipt_allocations" (
          "id" SERIAL PRIMARY KEY,
          "receiptId" integer NOT NULL,
          "customerId" integer NOT NULL,
          "allocationType" varchar(50) NOT NULL,
          "invoiceId" integer,
          "amountKd" decimal(12,3) NOT NULL CHECK ("amountKd" > 0),
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT "fk_cra_receipt" FOREIGN KEY ("receiptId") REFERENCES "customer_receipts"("id") ON DELETE RESTRICT,
          CONSTRAINT "fk_cra_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT,
          CONSTRAINT "fk_cra_invoice" FOREIGN KEY ("invoiceId") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT,
          CONSTRAINT "chk_cra_invoice_type" CHECK (
            ("allocationType" = 'OPENING_BALANCE' AND "invoiceId" IS NULL) OR
            ("allocationType" = 'INVOICE' AND "invoiceId" IS NOT NULL)
          )
        );
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cra_receipt" ON "customer_receipt_allocations"("receiptId");`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_cra_customer" ON "customer_receipt_allocations"("customerId");`);

      console.log('4. Creating customer_opening_balance_adjustments table...');
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "customer_opening_balance_adjustments" (
          "id" SERIAL PRIMARY KEY,
          "customerId" integer NOT NULL,
          "amountKd" decimal(12,3) NOT NULL,
          "reason" varchar(500) NOT NULL,
          "performedBy" varchar(100) NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT "fk_coba_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT
        );
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_coba_customer" ON "customer_opening_balance_adjustments"("customerId");`);

      await queryRunner.commitTransaction();
      console.log('Migration successful and committed.');
    } catch (err) {
      console.error('Error during migration, rolling back...', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
