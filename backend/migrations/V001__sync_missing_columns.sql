-- V001__sync_missing_columns.sql
-- Date: 2026-09-11
-- Purpose: Add 9 missing columns to align Neon with current entity definitions
-- Safety: All ADD COLUMN IF NOT EXISTS with safe defaults
-- Transaction: Managed by migrate.ts (do NOT add BEGIN/COMMIT here)

-- ========================================
-- CUSTOMERS: Opening Balance columns (4)
-- ========================================
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceOriginalKd" numeric(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingOutstandingKd" numeric(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceDate" date;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "openingBalanceNote" varchar(500);

-- ========================================
-- SALES_INVOICES: Return tracking columns (2)
-- ========================================
ALTER TABLE "sales_invoices" ADD COLUMN IF NOT EXISTS "totalReturnedKd" numeric(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "sales_invoices" ADD COLUMN IF NOT EXISTS "totalRefundedKd" numeric(12,3) NOT NULL DEFAULT 0;

-- ========================================
-- PRODUCTS: Image storage columns (3)
-- ========================================
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageData" bytea;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageMimeType" varchar(50);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageUpdatedAt" timestamp;
