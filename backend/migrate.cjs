const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}
const c = new pg.Client({ connectionString });

async function main() {
  await c.connect();
  console.log('Connected. Running migration...');

  // 1. Add missing columns to customers
  await c.query(`
    ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS "openingBalanceOriginalKd" DECIMAL(12,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "openingOutstandingKd" DECIMAL(12,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "openingBalanceDate" DATE,
      ADD COLUMN IF NOT EXISTS "openingBalanceNote" VARCHAR(500)
  `);
  console.log('✓ customers: added opening balance columns');

  // 2. Add missing columns to sales_invoices
  await c.query(`
    ALTER TABLE sales_invoices
      ADD COLUMN IF NOT EXISTS "totalReturnedKd" DECIMAL(12,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "totalRefundedKd" DECIMAL(12,3) DEFAULT 0
  `);
  console.log('✓ sales_invoices: added totalReturnedKd, totalRefundedKd');

  // 3. Create customer_receipt_allocations table if missing
  await c.query(`
    CREATE TABLE IF NOT EXISTS customer_receipt_allocations (
      id SERIAL PRIMARY KEY,
      "receiptId" INT NOT NULL,
      "invoiceId" INT NOT NULL,
      "allocatedAmountKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
      CONSTRAINT fk_cra_receipt FOREIGN KEY ("receiptId") REFERENCES customer_receipts(id) ON DELETE RESTRICT,
      CONSTRAINT fk_cra_invoice FOREIGN KEY ("invoiceId") REFERENCES sales_invoices(id) ON DELETE RESTRICT
    )
  `);
  console.log('✓ customer_receipt_allocations table created');

  // 4. Create customer_opening_balance_adjustments table if missing
  await c.query(`
    CREATE TABLE IF NOT EXISTS customer_opening_balance_adjustments (
      id SERIAL PRIMARY KEY,
      "customerId" INT NOT NULL,
      "adjustmentAmountKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
      "adjustmentDate" DATE NOT NULL,
      "notes" VARCHAR(500),
      "createdBy" VARCHAR(100) NOT NULL DEFAULT 'system',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT fk_coba_customer FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE RESTRICT
    )
  `);
  console.log('✓ customer_opening_balance_adjustments table created');

  // 5. Create sales_returns table
  await c.query(`
    CREATE TABLE IF NOT EXISTS sales_returns (
      id SERIAL PRIMARY KEY,
      "returnNumber" VARCHAR(50) UNIQUE NOT NULL,
      "invoiceId" INT NOT NULL,
      "customerId" INT NOT NULL,
      "returnDate" DATE NOT NULL,
      "totalReturnAmountKd" DECIMAL(12,3) DEFAULT 0,
      "outstandingReductionKd" DECIMAL(12,3) DEFAULT 0,
      "refundRequiredKd" DECIMAL(12,3) DEFAULT 0,
      "totalReturnPcs" INT DEFAULT 0,
      "returnReason" VARCHAR(50) DEFAULT 'CUSTOMER_RETURN',
      "notes" VARCHAR(500),
      "status" VARCHAR(20) DEFAULT 'POSTED',
      "createdBy" VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT fk_sr_invoice FOREIGN KEY ("invoiceId") REFERENCES sales_invoices(id) ON DELETE RESTRICT,
      CONSTRAINT fk_sr_customer FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE RESTRICT
    )
  `);
  console.log('✓ sales_returns table created');

  // 6. Create sales_return_lines table
  await c.query(`
    CREATE TABLE IF NOT EXISTS sales_return_lines (
      id SERIAL PRIMARY KEY,
      "salesReturnId" INT NOT NULL,
      "invoiceLineId" INT NOT NULL,
      "productId" INT NOT NULL,
      "returnDozen" INT DEFAULT 0,
      "returnPieces" INT DEFAULT 0,
      "returnTotalPcs" INT DEFAULT 0,
      "originalUnitPriceKd" DECIMAL(12,3) DEFAULT 0,
      "returnLineAmountKd" DECIMAL(12,3) DEFAULT 0,
      CONSTRAINT fk_srl_return FOREIGN KEY ("salesReturnId") REFERENCES sales_returns(id) ON DELETE RESTRICT,
      CONSTRAINT fk_srl_invoice_line FOREIGN KEY ("invoiceLineId") REFERENCES sales_invoice_lines(id) ON DELETE RESTRICT,
      CONSTRAINT fk_srl_product FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE RESTRICT
    )
  `);
  console.log('✓ sales_return_lines table created');

  // 7. Create customer_refunds table
  await c.query(`
    CREATE TABLE IF NOT EXISTS customer_refunds (
      id SERIAL PRIMARY KEY,
      "refundNumber" VARCHAR(50) UNIQUE NOT NULL,
      "salesReturnId" INT NOT NULL,
      "customerId" INT NOT NULL,
      "amountKd" DECIMAL(12,3) NOT NULL,
      "refundMethod" VARCHAR(50) DEFAULT 'CASH',
      "refundDate" DATE NOT NULL,
      "notes" VARCHAR(500),
      "status" VARCHAR(20) DEFAULT 'POSTED',
      "performedBy" VARCHAR(100) NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT fk_cref_return FOREIGN KEY ("salesReturnId") REFERENCES sales_returns(id) ON DELETE RESTRICT,
      CONSTRAINT fk_cref_customer FOREIGN KEY ("customerId") REFERENCES customers(id) ON DELETE RESTRICT
    )
  `);
  console.log('✓ customer_refunds table created');

  console.log('\n=== MIGRATION COMPLETE ===');
  await c.end();
}

main().catch(async (e) => { console.error('MIGRATION FAILED:', e.message); await c.end(); process.exit(1); });
