import { DataSource } from 'typeorm';

const databaseUrl = "postgresql://neondb_owner:npg_hJCe9Rq0aBGj@ep-odd-rain-b3eddtev-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // 1. Check Row Counts Before
    console.log('\n--- ROW COUNTS BEFORE MIGRATION ---');
    const invCount = await AppDataSource.query('SELECT COUNT(*) FROM sales_invoices;');
    const invLineCount = await AppDataSource.query('SELECT COUNT(*) FROM sales_invoice_lines;');
    const custCount = await AppDataSource.query('SELECT COUNT(*) FROM customers;');
    const prodCount = await AppDataSource.query('SELECT COUNT(*) FROM products;');
    const stockCount = await AppDataSource.query('SELECT COUNT(*) FROM stock_ledger;');
    
    console.log(`sales_invoices: ${invCount[0].count}`);
    console.log(`sales_invoice_lines: ${invLineCount[0].count}`);
    console.log(`customers: ${custCount[0].count}`);
    console.log(`products: ${prodCount[0].count}`);
    console.log(`stock_ledger: ${stockCount[0].count}`);
    console.log('-----------------------------------\n');

    // 2. Exact SQL
    const migrationSql = `
-- Safe Number Sequence Table for concurrency
CREATE TABLE IF NOT EXISTS document_sequences (
  id VARCHAR(50) PRIMARY KEY,
  "nextValue" INT NOT NULL DEFAULT 1
);

-- Sales Returns
CREATE TABLE IF NOT EXISTS sales_returns (
  id SERIAL PRIMARY KEY,
  "returnNumber" VARCHAR(50) UNIQUE NOT NULL,
  "invoiceId" INT NOT NULL REFERENCES sales_invoices(id) ON DELETE RESTRICT,
  "customerId" INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  "returnDate" DATE NOT NULL,
  "totalReturnAmountKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "outstandingReductionKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "refundRequiredKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "totalReturnPcs" INT NOT NULL DEFAULT 0,
  "returnReason" VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER_RETURN',
  notes VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'POSTED',
  "createdBy" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_sr_total_amount CHECK ("totalReturnAmountKd" >= 0),
  CONSTRAINT chk_sr_out_red CHECK ("outstandingReductionKd" >= 0),
  CONSTRAINT chk_sr_ref_req CHECK ("refundRequiredKd" >= 0),
  CONSTRAINT chk_sr_total_pcs CHECK ("totalReturnPcs" > 0),
  CONSTRAINT chk_sr_status CHECK (status IN ('POSTED', 'CANCELLED')),
  CONSTRAINT chk_sr_reason CHECK ("returnReason" IN ('CUSTOMER_RETURN', 'WRONG_ITEM', 'SIZE_TYPE_ISSUE', 'OTHER'))
);

-- Sales Return Lines
CREATE TABLE IF NOT EXISTS sales_return_lines (
  id SERIAL PRIMARY KEY,
  "salesReturnId" INT NOT NULL REFERENCES sales_returns(id) ON DELETE RESTRICT,
  "invoiceLineId" INT NOT NULL REFERENCES sales_invoice_lines(id) ON DELETE RESTRICT,
  "productId" INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  "returnDozen" INT NOT NULL DEFAULT 0,
  "returnPieces" INT NOT NULL DEFAULT 0,
  "returnTotalPcs" INT NOT NULL DEFAULT 0,
  "originalUnitPriceKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "returnLineAmountKd" DECIMAL(12,3) NOT NULL DEFAULT 0,

  CONSTRAINT chk_srl_dozen CHECK ("returnDozen" >= 0),
  CONSTRAINT chk_srl_pieces CHECK ("returnPieces" >= 0 AND "returnPieces" <= 11),
  CONSTRAINT chk_srl_total_pcs CHECK ("returnTotalPcs" > 0),
  CONSTRAINT chk_srl_amount CHECK ("returnLineAmountKd" >= 0)
);

-- Customer Refunds
CREATE TABLE IF NOT EXISTS customer_refunds (
  id SERIAL PRIMARY KEY,
  "refundNumber" VARCHAR(50) UNIQUE NOT NULL,
  "salesReturnId" INT NOT NULL REFERENCES sales_returns(id) ON DELETE RESTRICT,
  "customerId" INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  "amountKd" DECIMAL(12,3) NOT NULL,
  "refundMethod" VARCHAR(50) NOT NULL DEFAULT 'CASH',
  "refundDate" DATE NOT NULL,
  notes VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'POSTED',
  "performedBy" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_cr_amount CHECK ("amountKd" > 0),
  CONSTRAINT chk_cr_status CHECK (status IN ('POSTED', 'CANCELLED'))
);

-- Invoices Additions
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS "totalReturnedKd" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS "totalRefundedKd" DECIMAL(12,3) NOT NULL DEFAULT 0;

-- Indexes & Constraints
CREATE INDEX IF NOT EXISTS idx_sales_returns_invoice ON sales_returns("invoiceId");
CREATE INDEX IF NOT EXISTS idx_sales_returns_customer ON sales_returns("customerId");
CREATE INDEX IF NOT EXISTS idx_sales_return_lines_return ON sales_return_lines("salesReturnId");
CREATE INDEX IF NOT EXISTS idx_sales_return_lines_invoice_line ON sales_return_lines("invoiceLineId");
CREATE INDEX IF NOT EXISTS idx_customer_refunds_customer ON customer_refunds("customerId");
CREATE INDEX IF NOT EXISTS idx_customer_refunds_return ON customer_refunds("salesReturnId");

-- Only one POSTED refund per Sales Return allowed
CREATE UNIQUE INDEX IF NOT EXISTS "uq_customer_refunds_active_return" 
ON customer_refunds("salesReturnId") WHERE status = 'POSTED';
    `;

    console.log('Executing Migration SQL:\n', migrationSql);
    await AppDataSource.query(migrationSql);
    console.log('Migration SQL executed successfully.\n');

    // 3. Check Row Counts After
    console.log('--- ROW COUNTS AFTER MIGRATION ---');
    const invCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM sales_invoices;');
    const invLineCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM sales_invoice_lines;');
    const custCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM customers;');
    const prodCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM products;');
    const stockCountAfter = await AppDataSource.query('SELECT COUNT(*) FROM stock_ledger;');
    
    console.log(`sales_invoices: ${invCountAfter[0].count}`);
    console.log(`sales_invoice_lines: ${invLineCountAfter[0].count}`);
    console.log(`customers: ${custCountAfter[0].count}`);
    console.log(`products: ${prodCountAfter[0].count}`);
    console.log(`stock_ledger: ${stockCountAfter[0].count}`);
    console.log('-----------------------------------\n');

  } catch (err) {
    console.error('Error during Data Source initialization or migration:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
