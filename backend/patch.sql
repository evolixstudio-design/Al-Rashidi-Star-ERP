-- 1. Customers (Opening Balance fields)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceOriginalKd" decimal(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingOutstandingKd" decimal(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceDate" date;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceNote" varchar(500);

-- 2. Customer Receipts
ALTER TABLE "customer_receipts" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'POSTED';

-- 3. Sales Invoices (Returns fields)
ALTER TABLE "sales_invoices" ADD COLUMN IF NOT EXISTS "totalReturnedKd" decimal(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "sales_invoices" ADD COLUMN IF NOT EXISTS "totalRefundedKd" decimal(12,3) NOT NULL DEFAULT 0;

-- 4. Products (Image fields)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageData" bytea;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageMimeType" varchar(50);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageUpdatedAt" timestamp;

-- 5. Opening Balance Tables (Safeguard)
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
CREATE INDEX IF NOT EXISTS "idx_cra_receipt" ON "customer_receipt_allocations"("receiptId");
CREATE INDEX IF NOT EXISTS "idx_cra_customer" ON "customer_receipt_allocations"("customerId");

CREATE TABLE IF NOT EXISTS "customer_opening_balance_adjustments" (
  "id" SERIAL PRIMARY KEY,
  "customerId" integer NOT NULL,
  "amountKd" decimal(12,3) NOT NULL,
  "reason" varchar(500) NOT NULL,
  "performedBy" varchar(100) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "fk_coba_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "idx_coba_customer" ON "customer_opening_balance_adjustments"("customerId");

-- 6. Sales Return Tables (Safeguard)
CREATE TABLE IF NOT EXISTS "document_sequences" (
  "id" VARCHAR(50) PRIMARY KEY,
  "nextValue" INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "sales_returns" (
  "id" SERIAL PRIMARY KEY,
  "returnNumber" VARCHAR(50) UNIQUE NOT NULL,
  "invoiceId" INT NOT NULL REFERENCES "sales_invoices"("id") ON DELETE RESTRICT,
  "customerId" INT NOT NULL REFERENCES "customers"("id") ON DELETE RESTRICT,
  "returnDate" DATE NOT NULL,
  "totalReturnAmountKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "outstandingReductionKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "refundRequiredKd" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "totalReturnPcs" INT NOT NULL DEFAULT 0,
  "returnReason" VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER_RETURN',
  "notes" VARCHAR(500),
  "status" VARCHAR(20) NOT NULL DEFAULT 'POSTED',
  "createdBy" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_sr_total_amount CHECK ("totalReturnAmountKd" >= 0),
  CONSTRAINT chk_sr_out_red CHECK ("outstandingReductionKd" >= 0),
  CONSTRAINT chk_sr_ref_req CHECK ("refundRequiredKd" >= 0),
  CONSTRAINT chk_sr_total_pcs CHECK ("totalReturnPcs" > 0),
  CONSTRAINT chk_sr_status CHECK (status IN ('POSTED', 'CANCELLED')),
  CONSTRAINT chk_sr_reason CHECK ("returnReason" IN ('CUSTOMER_RETURN', 'WRONG_ITEM', 'SIZE_TYPE_ISSUE', 'OTHER'))
);

CREATE TABLE IF NOT EXISTS "sales_return_lines" (
  "id" SERIAL PRIMARY KEY,
  "salesReturnId" INT NOT NULL REFERENCES "sales_returns"("id") ON DELETE RESTRICT,
  "invoiceLineId" INT NOT NULL REFERENCES "sales_invoice_lines"("id") ON DELETE RESTRICT,
  "productId" INT NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
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

CREATE TABLE IF NOT EXISTS "customer_refunds" (
  "id" SERIAL PRIMARY KEY,
  "refundNumber" VARCHAR(50) UNIQUE NOT NULL,
  "salesReturnId" INT NOT NULL REFERENCES "sales_returns"("id") ON DELETE RESTRICT,
  "customerId" INT NOT NULL REFERENCES "customers"("id") ON DELETE RESTRICT,
  "amountKd" DECIMAL(12,3) NOT NULL,
  "refundMethod" VARCHAR(50) NOT NULL DEFAULT 'CASH',
  "refundDate" DATE NOT NULL,
  "notes" VARCHAR(500),
  "status" VARCHAR(20) NOT NULL DEFAULT 'POSTED',
  "performedBy" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_cr_amount CHECK ("amountKd" > 0),
  CONSTRAINT chk_cr_status CHECK (status IN ('POSTED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS "idx_sales_returns_invoice" ON "sales_returns"("invoiceId");
CREATE INDEX IF NOT EXISTS "idx_sales_returns_customer" ON "sales_returns"("customerId");
CREATE INDEX IF NOT EXISTS "idx_sales_return_lines_return" ON "sales_return_lines"("salesReturnId");
CREATE INDEX IF NOT EXISTS "idx_sales_return_lines_invoice_line" ON "sales_return_lines"("invoiceLineId");
CREATE INDEX IF NOT EXISTS "idx_customer_refunds_customer" ON "customer_refunds"("customerId");
CREATE INDEX IF NOT EXISTS "idx_customer_refunds_return" ON "customer_refunds"("salesReturnId");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_customer_refunds_active_return" ON "customer_refunds"("salesReturnId") WHERE status = 'POSTED';
