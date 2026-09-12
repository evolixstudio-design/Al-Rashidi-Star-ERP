-- Add missing status columns to receipt and return tables
ALTER TABLE public.customer_receipts ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';
ALTER TABLE public.customer_refunds ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';
ALTER TABLE public.sales_returns ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';
ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'POSTED';
