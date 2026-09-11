--
-- PostgreSQL database dump
--

\restrict leiuLiejH9NJ07JXNSgmPh6x64YcBP2egkcRHDEhLSbXSYcH6jlStqGfeIK3K0R

-- Dumped from database version 18.6 (2078fcb)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.sales_returns DROP CONSTRAINT "sales_returns_invoiceId_fkey";
ALTER TABLE ONLY public.sales_returns DROP CONSTRAINT "sales_returns_customerId_fkey";
ALTER TABLE ONLY public.sales_return_lines DROP CONSTRAINT "sales_return_lines_salesReturnId_fkey";
ALTER TABLE ONLY public.sales_return_lines DROP CONSTRAINT "sales_return_lines_productId_fkey";
ALTER TABLE ONLY public.sales_return_lines DROP CONSTRAINT "sales_return_lines_invoiceLineId_fkey";
ALTER TABLE ONLY public.customer_refunds DROP CONSTRAINT "customer_refunds_salesReturnId_fkey";
ALTER TABLE ONLY public.customer_refunds DROP CONSTRAINT "customer_refunds_customerId_fkey";
ALTER TABLE ONLY public.products DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926";
ALTER TABLE ONLY public.customer_receipt_allocations DROP CONSTRAINT "FK_f40f1aa3a5e074ecc2dfbe8f252";
ALTER TABLE ONLY public.customer_receipt_allocations DROP CONSTRAINT "FK_d71ebf01e3d54910032b6f7abdf";
ALTER TABLE ONLY public.purchase_receipts DROP CONSTRAINT "FK_d50c3b1f0ffc59d5116d8e3247f";
ALTER TABLE ONLY public.purchase_lines DROP CONSTRAINT "FK_c540bfa65f596352384a09aa7cc";
ALTER TABLE ONLY public.sales_invoice_lines DROP CONSTRAINT "FK_be32733f32e01ecbdc988ca4d86";
ALTER TABLE ONLY public.sales_invoices DROP CONSTRAINT "FK_a6c1cffd5c82f7e41f7ec95ab43";
ALTER TABLE ONLY public.customer_receipts DROP CONSTRAINT "FK_97776b88271e070f233afe94708";
ALTER TABLE ONLY public.customer_receipt_allocations DROP CONSTRAINT "FK_7e9742a01a78dfda5f1527248ec";
ALTER TABLE ONLY public.purchase_lines DROP CONSTRAINT "FK_37daea8c3e0fc90c3b85a29d941";
ALTER TABLE ONLY public.stock_ledger DROP CONSTRAINT "FK_3362dc085414b7786495e57631c";
ALTER TABLE ONLY public.customer_receipts DROP CONSTRAINT "FK_286a6a8526e95115fe983d018c5";
ALTER TABLE ONLY public.customer_opening_balance_adjustments DROP CONSTRAINT "FK_2098860888353530d951604e1fa";
ALTER TABLE ONLY public.sales_invoice_lines DROP CONSTRAINT "FK_1e9ff62650b3245f1cbb668bd27";
DROP INDEX public.uq_customer_refunds_active_return;
DROP INDEX public.idx_sales_returns_invoice;
DROP INDEX public.idx_sales_returns_customer;
DROP INDEX public.idx_sales_return_lines_return;
DROP INDEX public.idx_sales_return_lines_invoice_line;
DROP INDEX public.idx_customer_refunds_return;
DROP INDEX public.idx_customer_refunds_customer;
DROP INDEX public."IDX_f52fb01c27607bb74ba05abf16";
DROP INDEX public."IDX_f40f1aa3a5e074ecc2dfbe8f25";
DROP INDEX public."IDX_e069bf5f4d4aaab62a84f24ca4";
DROP INDEX public."IDX_cfccd59893ea43968695f259f7";
DROP INDEX public."IDX_cc7edcca87758d59aff1636b39";
DROP INDEX public."IDX_7e9742a01a78dfda5f1527248e";
DROP INDEX public."IDX_6249a93b3d33bc7834cd7ea389";
DROP INDEX public."IDX_57552c177da550b3271a2cfb64";
DROP INDEX public."IDX_393bb9fcce4ad62ebc6efb2fe7";
DROP INDEX public."IDX_3362dc085414b7786495e57631";
DROP INDEX public."IDX_2098860888353530d951604e1f";
ALTER TABLE ONLY public.sales_returns DROP CONSTRAINT "sales_returns_returnNumber_key";
ALTER TABLE ONLY public.sales_returns DROP CONSTRAINT sales_returns_pkey;
ALTER TABLE ONLY public.sales_return_lines DROP CONSTRAINT sales_return_lines_pkey;
ALTER TABLE ONLY public.document_sequences DROP CONSTRAINT document_sequences_pkey;
ALTER TABLE ONLY public.customer_refunds DROP CONSTRAINT "customer_refunds_refundNumber_key";
ALTER TABLE ONLY public.customer_refunds DROP CONSTRAINT customer_refunds_pkey;
ALTER TABLE ONLY public.customer_receipt_allocations DROP CONSTRAINT customer_receipt_allocations_pkey;
ALTER TABLE ONLY public.customer_opening_balance_adjustments DROP CONSTRAINT customer_opening_balance_adjustments_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710";
ALTER TABLE ONLY public.settings DROP CONSTRAINT "UQ_c8639b7626fa94ba8265628f214";
ALTER TABLE ONLY public.purchase_receipts DROP CONSTRAINT "PK_e98baf4459530343eebf88fdbdf";
ALTER TABLE ONLY public.sales_invoices DROP CONSTRAINT "PK_be0576afbf66c353a8a4435a45b";
ALTER TABLE ONLY public.stock_ledger DROP CONSTRAINT "PK_bb04575ee2ff52f72028f669701";
ALTER TABLE ONLY public.suppliers DROP CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e";
ALTER TABLE ONLY public.sales_invoice_lines DROP CONSTRAINT "PK_aeb2029d20ce3a41df372ebd255";
ALTER TABLE ONLY public.users DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE ONLY public.expenses DROP CONSTRAINT "PK_94c3ceb17e3140abc9282c20610";
ALTER TABLE ONLY public.audit_events DROP CONSTRAINT "PK_910f64d901a5c3e9878f0d4a407";
ALTER TABLE ONLY public.customer_receipts DROP CONSTRAINT "PK_83a250e247754cbe819c1e5d4f2";
ALTER TABLE ONLY public.purchase_lines DROP CONSTRAINT "PK_82dbfeeccbf8830ed076014dedd";
ALTER TABLE ONLY public.categories DROP CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b";
ALTER TABLE ONLY public.customers DROP CONSTRAINT "PK_133ec679a801fab5e070f73d3ea";
ALTER TABLE ONLY public.products DROP CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d";
ALTER TABLE ONLY public.settings DROP CONSTRAINT "PK_0669fe20e252eb692bf4d344975";
ALTER TABLE ONLY public.company DROP CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20";
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.suppliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stock_ledger ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sales_returns ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sales_return_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sales_invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.sales_invoice_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.purchase_receipts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.purchase_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.expenses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.customer_refunds ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.customer_receipts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.customer_receipt_allocations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.customer_opening_balance_adjustments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.company ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.audit_events ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.suppliers_id_seq;
DROP TABLE public.suppliers;
DROP SEQUENCE public.stock_ledger_id_seq;
DROP TABLE public.stock_ledger;
DROP SEQUENCE public.settings_id_seq;
DROP TABLE public.settings;
DROP SEQUENCE public.sales_returns_id_seq;
DROP TABLE public.sales_returns;
DROP SEQUENCE public.sales_return_lines_id_seq;
DROP TABLE public.sales_return_lines;
DROP SEQUENCE public.sales_invoices_id_seq;
DROP TABLE public.sales_invoices;
DROP SEQUENCE public.sales_invoice_lines_id_seq;
DROP TABLE public.sales_invoice_lines;
DROP SEQUENCE public.purchase_receipts_id_seq;
DROP TABLE public.purchase_receipts;
DROP SEQUENCE public.purchase_lines_id_seq;
DROP TABLE public.purchase_lines;
DROP SEQUENCE public.products_id_seq;
DROP TABLE public.products;
DROP SEQUENCE public.expenses_id_seq;
DROP TABLE public.expenses;
DROP TABLE public.document_sequences;
DROP SEQUENCE public.customers_id_seq;
DROP TABLE public.customers;
DROP SEQUENCE public.customer_refunds_id_seq;
DROP TABLE public.customer_refunds;
DROP SEQUENCE public.customer_receipts_id_seq;
DROP TABLE public.customer_receipts;
DROP SEQUENCE public.customer_receipt_allocations_id_seq;
DROP TABLE public.customer_receipt_allocations;
DROP SEQUENCE public.customer_opening_balance_adjustments_id_seq;
DROP TABLE public.customer_opening_balance_adjustments;
DROP SEQUENCE public.company_id_seq;
DROP TABLE public.company;
DROP SEQUENCE public.categories_id_seq;
DROP TABLE public.categories;
DROP SEQUENCE public.audit_events_id_seq;
DROP TABLE public.audit_events;
DROP FUNCTION pgrst.pre_config();
DROP SCHEMA pgrst;
DROP EXTENSION pg_session_jwt;
--
-- Name: pg_session_jwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_session_jwt WITH SCHEMA public;


--
-- Name: EXTENSION pg_session_jwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_session_jwt IS 'pg_session_jwt: manage authentication sessions using JWTs';


--
-- Name: pgrst; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgrst;


--
-- Name: pre_config(); Type: FUNCTION; Schema: pgrst; Owner: -
--

CREATE FUNCTION pgrst.pre_config() RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  SELECT
      set_config('pgrst.db_schemas', 'public', true)
    , set_config('pgrst.db_aggregates_enabled', 'true', true)
    , set_config('pgrst.db_anon_role', 'anonymous', true)
    , set_config('pgrst.jwt_role_claim_key', '.role', true)
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_events (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(100),
    action character varying(100) NOT NULL,
    details jsonb,
    performed_by character varying(100) NOT NULL,
    performed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_events_id_seq OWNED BY public.audit_events.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    "nameEn" character varying(100) NOT NULL,
    "nameAr" character varying(100),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company (
    id integer NOT NULL,
    name_en character varying(255) DEFAULT 'Rashidi Traders'::character varying NOT NULL,
    name_ar character varying(255) DEFAULT 'شركة الرشيدي للتجارة'::character varying NOT NULL,
    address text,
    phone character varying(50),
    logo_url text,
    invoice_terms_en text,
    invoice_terms_ar text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- Name: customer_opening_balance_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_opening_balance_adjustments (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    "amountKd" numeric(12,3) NOT NULL,
    reason character varying(500) NOT NULL,
    "performedBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customer_opening_balance_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_opening_balance_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_opening_balance_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_opening_balance_adjustments_id_seq OWNED BY public.customer_opening_balance_adjustments.id;


--
-- Name: customer_receipt_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_receipt_allocations (
    id integer NOT NULL,
    "receiptId" integer NOT NULL,
    "customerId" integer NOT NULL,
    "allocationType" character varying(50) NOT NULL,
    "invoiceId" integer,
    "amountKd" numeric(12,3) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customer_receipt_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_receipt_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_receipt_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_receipt_allocations_id_seq OWNED BY public.customer_receipt_allocations.id;


--
-- Name: customer_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_receipts (
    id integer NOT NULL,
    "receiptNumber" character varying(50) NOT NULL,
    "customerId" integer NOT NULL,
    "invoiceId" integer,
    "amountKd" numeric(12,3) NOT NULL,
    "paymentMethod" character varying(50) NOT NULL,
    "receiptDate" date NOT NULL,
    notes character varying(500),
    "performedBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customer_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_receipts_id_seq OWNED BY public.customer_receipts.id;


--
-- Name: customer_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_refunds (
    id integer NOT NULL,
    "refundNumber" character varying(50) NOT NULL,
    "salesReturnId" integer NOT NULL,
    "customerId" integer NOT NULL,
    "amountKd" numeric(12,3) NOT NULL,
    "refundMethod" character varying(50) DEFAULT 'CASH'::character varying NOT NULL,
    "refundDate" date NOT NULL,
    notes character varying(500),
    status character varying(20) DEFAULT 'POSTED'::character varying NOT NULL,
    "performedBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_cr_amount CHECK (("amountKd" > (0)::numeric)),
    CONSTRAINT chk_cr_status CHECK (((status)::text = ANY ((ARRAY['POSTED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: customer_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_refunds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_refunds_id_seq OWNED BY public.customer_refunds.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    "nameAr" character varying(200),
    phone character varying(50),
    address character varying(500),
    "totalSales" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "totalReceived" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "totalOutstanding" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes character varying(500),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_sequences (
    id character varying(50) NOT NULL,
    "nextValue" integer DEFAULT 1 NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    "expenseNumber" character varying(50) NOT NULL,
    category character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    "amountKd" numeric(12,3) NOT NULL,
    "expenseDate" date NOT NULL,
    "paymentMethod" character varying(50) DEFAULT 'Cash'::character varying NOT NULL,
    "paidTo" character varying(200),
    "receiptRef" character varying(100),
    notes character varying(1000),
    "recordedBy" character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'POSTED'::character varying NOT NULL,
    "cancellationReason" character varying(500),
    "cancelledAt" timestamp with time zone,
    "cancelledBy" character varying(100),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    "articleNumber" character varying(100) NOT NULL,
    "nameEn" character varying(200) NOT NULL,
    "nameAr" character varying(200),
    "categoryId" integer,
    color character varying(50),
    size character varying(50),
    "purchasePrice" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "sellingPrice" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "currentStockPcs" integer DEFAULT 0 NOT NULL,
    "reorderLevelPcs" integer DEFAULT 12 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes character varying(500),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_lines (
    id integer NOT NULL,
    "receiptId" integer NOT NULL,
    "productId" integer NOT NULL,
    dozen integer DEFAULT 0 NOT NULL,
    pieces integer DEFAULT 0 NOT NULL,
    "totalPcs" integer NOT NULL,
    "unitCostKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "lineTotalKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: purchase_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_lines_id_seq OWNED BY public.purchase_lines.id;


--
-- Name: purchase_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_receipts (
    id integer NOT NULL,
    "receiptNumber" character varying(50) NOT NULL,
    "supplierId" integer,
    "shipmentContainerNo" character varying(100),
    "supplierInvoiceRef" character varying(100),
    "receiptDate" date NOT NULL,
    "totalPcs" integer DEFAULT 0 NOT NULL,
    "totalAmountKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    status character varying(30) DEFAULT 'COMPLETED'::character varying NOT NULL,
    "receivedBy" character varying(100) NOT NULL,
    notes character varying(500),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: purchase_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_receipts_id_seq OWNED BY public.purchase_receipts.id;


--
-- Name: sales_invoice_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoice_lines (
    id integer NOT NULL,
    "invoiceId" integer NOT NULL,
    "productId" integer NOT NULL,
    dozen integer DEFAULT 0 NOT NULL,
    pieces integer DEFAULT 0 NOT NULL,
    "totalPcs" integer DEFAULT 0 NOT NULL,
    "unitPriceKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "lineTotalKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: sales_invoice_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_invoice_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_invoice_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_invoice_lines_id_seq OWNED BY public.sales_invoice_lines.id;


--
-- Name: sales_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoices (
    id integer NOT NULL,
    "invoiceNumber" character varying(50) NOT NULL,
    "customerId" integer NOT NULL,
    "invoiceDate" date NOT NULL,
    "totalPcs" integer DEFAULT 0 NOT NULL,
    "totalAmountKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "amountReceivedKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "outstandingKd" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "paymentStatus" character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    "paymentMethod" character varying(50),
    "dueDate" date,
    status character varying(20) DEFAULT 'POSTED'::character varying NOT NULL,
    notes character varying(500),
    "createdBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_invoices_id_seq OWNED BY public.sales_invoices.id;


--
-- Name: sales_return_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_return_lines (
    id integer NOT NULL,
    "salesReturnId" integer NOT NULL,
    "invoiceLineId" integer NOT NULL,
    "productId" integer NOT NULL,
    "returnDozen" integer DEFAULT 0 NOT NULL,
    "returnPieces" integer DEFAULT 0 NOT NULL,
    "returnTotalPcs" integer DEFAULT 0 NOT NULL,
    "originalUnitPriceKd" numeric(12,3) DEFAULT 0 NOT NULL,
    "returnLineAmountKd" numeric(12,3) DEFAULT 0 NOT NULL,
    CONSTRAINT chk_srl_amount CHECK (("returnLineAmountKd" >= (0)::numeric)),
    CONSTRAINT chk_srl_dozen CHECK (("returnDozen" >= 0)),
    CONSTRAINT chk_srl_pieces CHECK ((("returnPieces" >= 0) AND ("returnPieces" <= 11))),
    CONSTRAINT chk_srl_total_pcs CHECK (("returnTotalPcs" > 0))
);


--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_return_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_return_lines_id_seq OWNED BY public.sales_return_lines.id;


--
-- Name: sales_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_returns (
    id integer NOT NULL,
    "returnNumber" character varying(50) NOT NULL,
    "invoiceId" integer NOT NULL,
    "customerId" integer NOT NULL,
    "returnDate" date NOT NULL,
    "totalReturnAmountKd" numeric(12,3) DEFAULT 0 NOT NULL,
    "outstandingReductionKd" numeric(12,3) DEFAULT 0 NOT NULL,
    "refundRequiredKd" numeric(12,3) DEFAULT 0 NOT NULL,
    "totalReturnPcs" integer DEFAULT 0 NOT NULL,
    "returnReason" character varying(50) DEFAULT 'CUSTOMER_RETURN'::character varying NOT NULL,
    notes character varying(500),
    status character varying(20) DEFAULT 'POSTED'::character varying NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_sr_out_red CHECK (("outstandingReductionKd" >= (0)::numeric)),
    CONSTRAINT chk_sr_reason CHECK ((("returnReason")::text = ANY ((ARRAY['CUSTOMER_RETURN'::character varying, 'WRONG_ITEM'::character varying, 'SIZE_TYPE_ISSUE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT chk_sr_ref_req CHECK (("refundRequiredKd" >= (0)::numeric)),
    CONSTRAINT chk_sr_status CHECK (((status)::text = ANY ((ARRAY['POSTED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT chk_sr_total_amount CHECK (("totalReturnAmountKd" >= (0)::numeric)),
    CONSTRAINT chk_sr_total_pcs CHECK (("totalReturnPcs" > 0))
);


--
-- Name: sales_returns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_returns_id_seq OWNED BY public.sales_returns.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: stock_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_ledger (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "movementDate" timestamp with time zone DEFAULT now() NOT NULL,
    "quantityChangePcs" integer NOT NULL,
    "balanceAfterPcs" integer NOT NULL,
    "sourceType" character varying(50) NOT NULL,
    "sourceId" integer,
    "sourceReference" character varying(100),
    notes character varying(500),
    "performedBy" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_ledger_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_ledger_id_seq OWNED BY public.stock_ledger.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    "contactPerson" character varying(100),
    phone character varying(50),
    country character varying(50) DEFAULT 'China'::character varying NOT NULL,
    address character varying(300),
    "totalPayable" numeric(12,3) DEFAULT '0'::numeric NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying NOT NULL,
    display_name character varying(150) NOT NULL,
    role character varying DEFAULT 'OWNER'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events ALTER COLUMN id SET DEFAULT nextval('public.audit_events_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: company id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- Name: customer_opening_balance_adjustments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_opening_balance_adjustments ALTER COLUMN id SET DEFAULT nextval('public.customer_opening_balance_adjustments_id_seq'::regclass);


--
-- Name: customer_receipt_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipt_allocations ALTER COLUMN id SET DEFAULT nextval('public.customer_receipt_allocations_id_seq'::regclass);


--
-- Name: customer_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts ALTER COLUMN id SET DEFAULT nextval('public.customer_receipts_id_seq'::regclass);


--
-- Name: customer_refunds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_refunds ALTER COLUMN id SET DEFAULT nextval('public.customer_refunds_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_lines ALTER COLUMN id SET DEFAULT nextval('public.purchase_lines_id_seq'::regclass);


--
-- Name: purchase_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipts ALTER COLUMN id SET DEFAULT nextval('public.purchase_receipts_id_seq'::regclass);


--
-- Name: sales_invoice_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_lines ALTER COLUMN id SET DEFAULT nextval('public.sales_invoice_lines_id_seq'::regclass);


--
-- Name: sales_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices ALTER COLUMN id SET DEFAULT nextval('public.sales_invoices_id_seq'::regclass);


--
-- Name: sales_return_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_lines ALTER COLUMN id SET DEFAULT nextval('public.sales_return_lines_id_seq'::regclass);


--
-- Name: sales_returns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns ALTER COLUMN id SET DEFAULT nextval('public.sales_returns_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: stock_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_ledger ALTER COLUMN id SET DEFAULT nextval('public.stock_ledger_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_events (id, entity_type, entity_id, action, details, performed_by, performed_at) FROM stdin;
1	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 07:44:33.253168
2	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 07:50:30.45268
3	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 07:53:14.156486
4	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 07:56:22.06244
5	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 08:01:09.362222
6	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 08:04:30.857812
7	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 08:07:49.263141
8	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 08:11:19.452032
9	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 09:55:10.305607
10	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-08 10:17:11.69936
11	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 10:17:36.211688
12	AUTH	3	LOGOUT	\N	Evolix Admin	2026-09-08 10:18:42.114817
13	AUTH	2	LOGIN	{"ip": "127.0.0.1"}	Aliasgar jath wala	2026-09-08 10:22:51.000246
14	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 10:23:18.908455
15	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-08 10:24:26.511584
16	AUTH	2	LOGIN	{"ip": "127.0.0.1"}	Aliasgar jath wala	2026-09-08 10:24:48.49927
17	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 10:35:56.30705
18	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 12:32:09.613579
19	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 13:42:02.202035
20	PRODUCT	1	CREATE	{"nameEn": "fustan", "articleNumber": "99086", "initialStockPcs": 96}	Yusuf ali jath wala	2026-09-08 14:51:07.160354
21	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 14:55:21.415646
22	PRODUCT	1	UPDATE	{"changes": {"size": "free", "color": "mix", "notes": "dxb hasan bngli", "nameEn": "fustan", "isActive": true, "sellingPrice": 24, "purchasePrice": 20, "reorderLevelPcs": 1}, "articleNumber": "99086"}	Yusuf ali jath wala	2026-09-08 14:57:07.926107
23	STOCK_ADJUSTMENT	1	UPDATE	{"type": "ADD", "reason": "Recount", "articleNumber": "99086", "balanceAfterPcs": 102, "quantityChangePcs": 6}	Aliasgar jath wala	2026-09-08 15:01:02.851421
24	CUSTOMER	1	CREATE	{"name": "abbas bhai aashiq bhai", "phone": "60983441"}	Yusuf ali jath wala	2026-09-08 15:16:40.526602
25	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-08 15:16:51.285951
26	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 15:17:15.220475
27	CUSTOMER	2	CREATE	{"name": "ashan online", "phone": "50751050"}	Yusuf ali jath wala	2026-09-08 15:18:07.656733
28	CUSTOMER	3	CREATE	{"name": "ashly u&i  online", "phone": "51722748"}	Yusuf ali jath wala	2026-09-08 15:20:27.317174
29	CUSTOMER	4	CREATE	{"name": "aruni lanka online", "phone": "66387216"}	Yusuf ali jath wala	2026-09-08 15:21:42.412292
30	CUSTOMER	5	CREATE	{"name": "asanka maliya", "phone": "66389021"}	Yusuf ali jath wala	2026-09-08 15:23:14.346117
31	CUSTOMER	6	CREATE	{"name": "girlly philipini", "phone": "66451194"}	Yusuf ali jath wala	2026-09-08 15:24:47.822344
32	CUSTOMER	7	CREATE	{"name": "imran maliya", "phone": "60484860"}	Yusuf ali jath wala	2026-09-08 15:26:01.442766
33	CUSTOMER	8	CREATE	{"name": "nimali imran", "phone": "67781910"}	Yusuf ali jath wala	2026-09-08 15:27:19.219552
34	CUSTOMER	9	CREATE	{"name": "irfan u&i online", "phone": "66740422"}	Yusuf ali jath wala	2026-09-08 15:28:34.115125
35	CUSTOMER	10	CREATE	{"name": "isha lanka online", "phone": "55702356"}	Yusuf ali jath wala	2026-09-08 15:30:07.719838
36	CUSTOMER	11	CREATE	{"name": "isnayra philipini", "phone": "67001419"}	Yusuf ali jath wala	2026-09-08 15:31:11.751241
37	CUSTOMER	12	CREATE	{"name": "jem philipini mohsin", "phone": null}	Yusuf ali jath wala	2026-09-08 15:32:03.027015
38	CUSTOMER	13	CREATE	{"name": "lovely ziya fashion", "phone": "94130911"}	Yusuf ali jath wala	2026-09-08 15:33:15.88766
39	CUSTOMER	14	CREATE	{"name": "m.nafil lanka online", "phone": "99824538"}	Yusuf ali jath wala	2026-09-08 15:34:27.628865
40	CUSTOMER	15	CREATE	{"name": "marwan philipini", "phone": "50443349"}	Yusuf ali jath wala	2026-09-08 15:35:30.179828
41	CUSTOMER	16	CREATE	{"name": "may phlpni mufaddal online", "phone": "65593237"}	Yusuf ali jath wala	2026-09-08 15:36:58.8688
42	CUSTOMER	17	CREATE	{"name": "mufaddal online", "phone": "51259648"}	Yusuf ali jath wala	2026-09-08 15:37:51.118759
43	PRODUCT	2	CREATE	{"nameEn": "fustan", "articleNumber": "ART-99086", "initialStockPcs": 102}	Aliasgar jath wala	2026-09-08 15:41:03.877285
44	STOCK_ADJUSTMENT	2	UPDATE	{"type": "REMOVE", "reason": "Other", "articleNumber": "ART-99086", "balanceAfterPcs": 0, "quantityChangePcs": -102}	Aliasgar jath wala	2026-09-08 15:41:21.993182
45	CUSTOMER	18	CREATE	{"name": "nilu selani", "phone": "98797697"}	Yusuf ali jath wala	2026-09-08 15:48:58.450745
46	CUSTOMER	19	CREATE	{"name": "raj kumar nepali", "phone": "51764950"}	Yusuf ali jath wala	2026-09-08 15:49:48.837353
47	CUSTOMER	20	CREATE	{"name": "RATNA LAMA NEPALI", "phone": "65926484"}	Yusuf ali jath wala	2026-09-08 15:50:47.437172
48	CUSTOMER	21	CREATE	{"name": "RAJENDER NEPALI", "phone": "98928244"}	Yusuf ali jath wala	2026-09-08 15:51:44.700735
49	CUSTOMER	22	CREATE	{"name": "SADUNI LANKA ONLINE", "phone": "50593624"}	Yusuf ali jath wala	2026-09-08 15:52:38.197947
50	CUSTOMER	23	CREATE	{"name": "SANGITA NEPALI", "phone": "+9779704940794"}	Yusuf ali jath wala	2026-09-08 15:54:01.232014
51	CUSTOMER	24	CREATE	{"name": "SHANTA SIRAJ NEPALI", "phone": "60045311"}	Yusuf ali jath wala	2026-09-08 15:54:52.668715
52	CUSTOMER	25	CREATE	{"name": "BELLA CHO VAYIL", "phone": "66914136"}	Yusuf ali jath wala	2026-09-08 15:56:45.23155
53	CUSTOMER	26	CREATE	{"name": "YUNA LAMA NEPALI", "phone": "65993896"}	Yusuf ali jath wala	2026-09-08 15:57:48.884757
54	CUSTOMER	27	CREATE	{"name": "Z&Y DELMA ONLINE", "phone": "99718538"}	Yusuf ali jath wala	2026-09-08 15:59:01.820793
55	CUSTOMER	28	CREATE	{"name": "ZIYA ON LINE", "phone": null}	Yusuf ali jath wala	2026-09-08 16:00:08.761583
56	CUSTOMER	29	CREATE	{"name": "ZOYA FASHION", "phone": "51662522"}	Yusuf ali jath wala	2026-09-08 16:00:50.128528
57	CUSTOMER	30	CREATE	{"name": "M.T.B KHOJEMA", "phone": "65143287"}	Yusuf ali jath wala	2026-09-08 16:02:43.355571
58	CUSTOMER	31	CREATE	{"name": "MONA IRSHAN ONLINE", "phone": "60647373"}	Yusuf ali jath wala	2026-09-08 16:03:36.869699
59	CUSTOMER	32	CREATE	{"name": "MHD LYKE", "phone": "66850853"}	Yusuf ali jath wala	2026-09-08 16:04:22.148925
60	CUSTOMER	33	CREATE	{"name": "AKBAR Z&Y", "phone": "99598396"}	Yusuf ali jath wala	2026-09-08 16:05:14.748095
61	CUSTOMER	34	CREATE	{"name": "RAMESH NEPALI", "phone": "67723504"}	Yusuf ali jath wala	2026-09-08 16:05:57.644437
62	CUSTOMER	35	CREATE	{"name": "CHINTU", "phone": "66172315"}	Yusuf ali jath wala	2026-09-08 16:06:31.76486
63	CUSTOMER	36	CREATE	{"name": "MADHU ( RMD FASHION)", "phone": "55161887"}	Yusuf ali jath wala	2026-09-08 16:07:51.758687
64	CUSTOMER	37	CREATE	{"name": "NOOR PHILIPINI", "phone": "66331105"}	Yusuf ali jath wala	2026-09-08 16:08:31.206114
65	CUSTOMER	38	CREATE	{"name": "ABBAS UDAIPUR", "phone": "56528358"}	Yusuf ali jath wala	2026-09-08 16:09:16.828424
66	CUSTOMER	39	CREATE	{"name": "MAHMOOD MASRI", "phone": "55116891"}	Yusuf ali jath wala	2026-09-08 16:09:58.968784
67	CUSTOMER	40	CREATE	{"name": "SWEETY PHILIPINI", "phone": "60915827"}	Yusuf ali jath wala	2026-09-08 16:10:39.581546
68	CUSTOMER	41	CREATE	{"name": "HIDEOUT LANKA", "phone": "65138706"}	Yusuf ali jath wala	2026-09-08 16:11:30.936053
69	CUSTOMER	42	CREATE	{"name": "HUSAIN DALAL", "phone": "66471354"}	Yusuf ali jath wala	2026-09-08 16:12:02.288898
70	CUSTOMER	43	CREATE	{"name": "SUDDI LANKA", "phone": "66447335"}	Yusuf ali jath wala	2026-09-08 16:12:41.664353
71	CUSTOMER	44	CREATE	{"name": "NISHA LANKA", "phone": "51642121"}	Yusuf ali jath wala	2026-09-08 16:13:12.898492
72	CUSTOMER	45	CREATE	{"name": "NILUPA LANKA MOHAN", "phone": "50765693"}	Yusuf ali jath wala	2026-09-08 16:14:14.401148
73	CUSTOMER	46	CREATE	{"name": "DB COLLECTION NEPALI", "phone": "66587333"}	Yusuf ali jath wala	2026-09-08 16:15:37.777847
74	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 16:16:05.057351
75	CUSTOMER	47	CREATE	{"name": "MUSKAN NEPALI", "phone": "65878861"}	Yusuf ali jath wala	2026-09-08 16:16:11.08998
76	CUSTOMER	48	CREATE	{"name": "SUJI LANKA", "phone": "97527205"}	Yusuf ali jath wala	2026-09-08 16:16:43.959408
77	CUSTOMER	49	CREATE	{"name": "ABU ALI SURI", "phone": "94984064"}	Yusuf ali jath wala	2026-09-08 16:17:24.534177
78	CUSTOMER	50	CREATE	{"name": "VIJAYA SINGHA LANKA", "phone": "50209710"}	Yusuf ali jath wala	2026-09-08 16:17:59.61795
79	CUSTOMER	51	CREATE	{"name": "ORMI NEPALI", "phone": "66994276"}	Yusuf ali jath wala	2026-09-08 16:18:29.643303
80	CUSTOMER	52	CREATE	{"name": "CHAMUNDA LANKA", "phone": "94190021"}	Yusuf ali jath wala	2026-09-08 16:19:25.385766
81	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 16:19:49.268413
82	CUSTOMER	53	CREATE	{"name": "PARDEEP NEPALI", "phone": "61002674"}	Yusuf ali jath wala	2026-09-08 16:20:04.265994
83	CUSTOMER	54	CREATE	{"name": "SAMEERA NEPALI", "phone": "69018528"}	Yusuf ali jath wala	2026-09-08 16:20:52.206753
84	CUSTOMER	55	CREATE	{"name": "SEVANDI LANKA", "phone": "65977892"}	Yusuf ali jath wala	2026-09-08 16:21:45.5723
85	CUSTOMER	56	CREATE	{"name": "SAIFULLA BANGALI", "phone": "97639161"}	Yusuf ali jath wala	2026-09-08 16:22:31.214562
86	CUSTOMER	57	CREATE	{"name": "MOIZE BHAI BARNAGAR", "phone": "50706252"}	Yusuf ali jath wala	2026-09-08 16:23:13.68303
87	CUSTOMER	58	CREATE	{"name": "DEBS  PHILIPINI ONLINE", "phone": "55936401"}	Yusuf ali jath wala	2026-09-08 16:25:54.748446
88	CUSTOMER	59	CREATE	{"name": "GRESS  PHILIPINI ONLINE", "phone": "69674647"}	Yusuf ali jath wala	2026-09-08 16:26:59.895588
89	CUSTOMER	60	CREATE	{"name": "LAHIRU LANKA", "phone": "56573221"}	Yusuf ali jath wala	2026-09-08 16:27:28.800801
90	CUSTOMER	61	CREATE	{"name": "CHAYA LANKA", "phone": "65745093"}	Yusuf ali jath wala	2026-09-08 16:28:06.758899
91	CUSTOMER	62	CREATE	{"name": "LAKMALI  LANKA", "phone": "99868473"}	Yusuf ali jath wala	2026-09-08 16:28:53.975976
92	CUSTOMER	63	CREATE	{"name": "QAYUM BANGALI", "phone": "60739946"}	Yusuf ali jath wala	2026-09-08 16:29:30.468605
93	CUSTOMER	64	CREATE	{"name": "AASHIRWAD NEPALI", "phone": "97958728"}	Yusuf ali jath wala	2026-09-08 16:30:18.755784
94	CUSTOMER	65	CREATE	{"name": "SANJU LANKA", "phone": "55193849"}	Yusuf ali jath wala	2026-09-08 16:30:50.275239
95	CUSTOMER	66	CREATE	{"name": "SUQ AL ASMAR ( TONY)", "phone": "65077128"}	Yusuf ali jath wala	2026-09-08 16:31:56.555362
96	CUSTOMER	67	CREATE	{"name": "RAJU BHAI ONLINE", "phone": "67043733"}	Yusuf ali jath wala	2026-09-08 16:32:41.462952
97	CUSTOMER	68	CREATE	{"name": "ANITA NEPALI", "phone": "41001898"}	Yusuf ali jath wala	2026-09-08 16:33:26.588873
98	CUSTOMER	69	CREATE	{"name": "NARAYAN NEPALI", "phone": "65127513"}	Yusuf ali jath wala	2026-09-08 16:34:02.777674
99	CUSTOMER	70	CREATE	{"name": "NOOR MOHAMMED", "phone": "69993585"}	Yusuf ali jath wala	2026-09-08 16:34:33.969325
100	CUSTOMER	71	CREATE	{"name": "AASHIQ FASHION", "phone": "95571720"}	Yusuf ali jath wala	2026-09-08 16:35:07.006858
101	CUSTOMER	72	CREATE	{"name": "AASHIQ BHAI KATKA", "phone": "67609264"}	Yusuf ali jath wala	2026-09-08 16:36:07.205581
102	CUSTOMER	73	CREATE	{"name": "YUNA LAMA BROTHER", "phone": "67754500"}	Yusuf ali jath wala	2026-09-08 16:37:14.758736
103	CUSTOMER	74	CREATE	{"name": "SHILPA COLLECTIONS", "phone": "55927064"}	Yusuf ali jath wala	2026-09-08 16:38:24.873094
104	CUSTOMER	75	CREATE	{"name": "VINU LANKA", "phone": "95563899"}	Yusuf ali jath wala	2026-09-08 16:38:49.339122
105	CUSTOMER	76	CREATE	{"name": "MAHENDRA NEPALI", "phone": "65970090"}	Yusuf ali jath wala	2026-09-08 16:39:22.624168
106	CUSTOMER	77	CREATE	{"name": "SHIMOUL ONLINE", "phone": null}	Yusuf ali jath wala	2026-09-08 16:40:32.554755
107	CUSTOMER	78	CREATE	{"name": "SUQ NASEEM  ( AYSHA)", "phone": "50496587"}	Yusuf ali jath wala	2026-09-08 16:41:31.744949
108	CUSTOMER	79	CREATE	{"name": "SUQ NASEEM ( ABU SAMRA )", "phone": "97496451"}	Yusuf ali jath wala	2026-09-08 16:42:20.109471
109	CUSTOMER	80	CREATE	{"name": "JN PHILIPINI ONLINE", "phone": "94132966"}	Yusuf ali jath wala	2026-09-08 16:43:12.062528
110	CUSTOMER	81	CREATE	{"name": "SAMEER ONLINE", "phone": "55852151"}	Yusuf ali jath wala	2026-09-08 16:43:56.558881
111	CUSTOMER	82	CREATE	{"name": "MARYAM PHILIPINI", "phone": "66007026"}	Yusuf ali jath wala	2026-09-08 16:45:02.059245
112	CUSTOMER	83	CREATE	{"name": "NORA PHILIPINI", "phone": "65770120"}	Yusuf ali jath wala	2026-09-08 16:45:39.544989
113	CUSTOMER	84	CREATE	{"name": "RENU LANKA", "phone": "50522026"}	Yusuf ali jath wala	2026-09-08 16:46:24.888614
114	CUSTOMER	85	CREATE	{"name": "NELKA SELANI LANKA", "phone": "98532374"}	Yusuf ali jath wala	2026-09-08 16:47:02.769177
115	CUSTOMER	86	CREATE	{"name": "CITY BAZAR ( MAHESH )", "phone": "96056131"}	Yusuf ali jath wala	2026-09-08 16:47:54.555956
116	CUSTOMER	87	CREATE	{"name": "HANSI LANKA", "phone": "+94764014701"}	Yusuf ali jath wala	2026-09-08 16:49:10.224579
117	CUSTOMER	88	CREATE	{"name": "BINITA NEPALI", "phone": "67758360"}	Yusuf ali jath wala	2026-09-08 16:50:19.860797
118	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 16:50:51.554515
119	CUSTOMER	89	CREATE	{"name": "IRSHAN LANKA", "phone": "99597919"}	Yusuf ali jath wala	2026-09-08 16:51:06.525819
120	CUSTOMER	90	CREATE	{"name": "SAMEER PARDESI", "phone": "+919109323586"}	Yusuf ali jath wala	2026-09-08 16:52:07.773341
121	CUSTOMER	91	CREATE	{"name": "TIPTOP ONLINE NEPALI", "phone": "99697351"}	Yusuf ali jath wala	2026-09-08 16:53:10.502091
122	CUSTOMER	92	CREATE	{"name": "AMJAD PAK", "phone": "69989060"}	Yusuf ali jath wala	2026-09-08 16:53:44.188099
123	CUSTOMER	93	CREATE	{"name": "HAZIQ SHOP", "phone": "55099782"}	Yusuf ali jath wala	2026-09-08 16:54:30.49638
124	CUSTOMER	94	CREATE	{"name": "AITA NEPALI", "phone": "99413771"}	Yusuf ali jath wala	2026-09-08 16:55:04.557704
125	CUSTOMER	95	CREATE	{"name": "KHALID MASRI", "phone": "60705180"}	Yusuf ali jath wala	2026-09-08 16:55:31.783002
126	CUSTOMER	96	CREATE	{"name": "AL KHAMSIN CO.", "phone": "97453933 /  67723504"}	Yusuf ali jath wala	2026-09-08 16:57:50.149172
127	CUSTOMER	97	CREATE	{"name": "ALI & RAZZAK BHAI", "phone": "65107793"}	Yusuf ali jath wala	2026-09-08 16:59:07.46553
128	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-08 17:27:52.638417
129	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 17:28:20.726812
130	PRODUCT	3	CREATE	{"nameEn": "Dfhjj", "articleNumber": "ART3", "initialStockPcs": 0}	Evolix Admin	2026-09-08 17:28:58.841499
131	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 17:30:23.133859
132	AUTH	2	LOGOUT	\N	Aliasgar jath wala	2026-09-08 17:34:13.484788
133	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-08 17:34:22.532468
134	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 17:36:14.728092
135	STOCK_ADJUSTMENT	1	UPDATE	{"type": "REMOVE", "reason": "Other", "articleNumber": "99086", "balanceAfterPcs": 0, "quantityChangePcs": -102}	Yusuf ali jath wala	2026-09-08 17:54:48.581409
136	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-08 17:56:15.930819
137	PRODUCT	1	UPDATE	{"changes": {"size": "free", "color": "mix", "notes": "dxb hasan bngli", "nameEn": "fustan", "isActive": true, "sellingPrice": 24, "purchasePrice": 20, "reorderLevelPcs": 102}, "articleNumber": "99086"}	Yusuf ali jath wala	2026-09-08 18:04:59.224611
138	STOCK_ADJUSTMENT	1	UPDATE	{"type": "ADD", "reason": "Return", "articleNumber": "99086", "balanceAfterPcs": 102, "quantityChangePcs": 102}	Yusuf ali jath wala	2026-09-08 18:05:52.454497
139	PRODUCT	2	DELETE	{"reason": "Product hard deleted", "articleNumber": "ART-99086"}	Yusuf ali jath wala	2026-09-08 18:30:44.564661
140	PRODUCT	3	DELETE	{"reason": "Product hard deleted", "articleNumber": "ART3"}	Yusuf ali jath wala	2026-09-08 18:30:47.418015
141	PRODUCT	1	DELETE	{"reason": "Product hard deleted", "articleNumber": "99086"}	Yusuf ali jath wala	2026-09-08 18:31:12.060684
142	PRODUCT	4	CREATE	{"nameEn": "fustan", "articleNumber": "ART-1", "initialStockPcs": 102}	Yusuf ali jath wala	2026-09-08 18:32:28.484101
143	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-09 06:41:51.371613
144	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-09 07:08:32.638967
145	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-09 07:11:02.841442
146	PRODUCT	5	CREATE	{"nameEn": "LADEAS DRESS", "articleNumber": "99085", "initialStockPcs": 48}	Yusuf ali jath wala	2026-09-09 07:13:29.260559
147	PRODUCT	6	CREATE	{"nameEn": "DOTS 2PCS TARNO", "articleNumber": "993", "initialStockPcs": 84}	Yusuf ali jath wala	2026-09-09 07:17:49.444835
148	PRODUCT	7	CREATE	{"nameEn": "LADES DRESS", "articleNumber": "850", "initialStockPcs": 36}	Yusuf ali jath wala	2026-09-09 07:25:11.747739
149	PRODUCT	8	CREATE	{"nameEn": "LADIES DRESS", "articleNumber": "99081", "initialStockPcs": 24}	Yusuf ali jath wala	2026-09-09 07:29:40.258246
150	PRODUCT	9	CREATE	{"nameEn": "SKIRT BLOUS", "articleNumber": "6604", "initialStockPcs": 240}	Yusuf ali jath wala	2026-09-09 07:33:09.240696
151	PRODUCT	10	CREATE	{"nameEn": "DRESS", "articleNumber": "1920", "initialStockPcs": 24}	Yusuf ali jath wala	2026-09-09 07:34:52.836766
152	PRODUCT	11	CREATE	{"nameEn": "LADEES DRESS", "articleNumber": "928", "initialStockPcs": 60}	Yusuf ali jath wala	2026-09-09 07:36:03.653164
153	PRODUCT	12	CREATE	{"nameEn": "2 PCS TARNO", "articleNumber": "6618", "initialStockPcs": 180}	Yusuf ali jath wala	2026-09-09 07:37:55.17009
154	PRODUCT	13	CREATE	{"nameEn": "L/S BLACK T SHIRT", "articleNumber": "SFR  T SHIRT", "initialStockPcs": 84}	Yusuf ali jath wala	2026-09-09 07:40:38.81536
155	PRODUCT	14	CREATE	{"nameEn": "ROUND NECK 2 PCS TARNO", "articleNumber": "8045", "initialStockPcs": 18}	Yusuf ali jath wala	2026-09-09 07:43:29.056743
156	PRODUCT	15	CREATE	{"nameEn": "2 PCS SPORT TARNO", "articleNumber": "8057", "initialStockPcs": 48}	Yusuf ali jath wala	2026-09-09 07:45:13.869927
157	PRODUCT	16	CREATE	{"nameEn": "3PCS SET TARNO", "articleNumber": "SM 5267", "initialStockPcs": 108}	Yusuf ali jath wala	2026-09-09 07:47:04.358441
158	PRODUCT	17	CREATE	{"nameEn": "SKIRT BLOUSE", "articleNumber": "6199", "initialStockPcs": 36}	Yusuf ali jath wala	2026-09-09 07:48:40.138084
159	PRODUCT	18	CREATE	{"nameEn": "SKIRT BLOUSE", "articleNumber": "943", "initialStockPcs": 168}	Yusuf ali jath wala	2026-09-09 07:52:43.553077
160	PRODUCT	19	CREATE	{"nameEn": "SHIRT LADEIS", "articleNumber": "2306", "initialStockPcs": 96}	Yusuf ali jath wala	2026-09-09 07:54:48.268202
161	PRODUCT	20	CREATE	{"nameEn": "BLOUSE", "articleNumber": "FMD", "initialStockPcs": 108}	Yusuf ali jath wala	2026-09-09 07:58:08.979091
162	PRODUCT	21	CREATE	{"nameEn": "HAFER DRESS", "articleNumber": "927", "initialStockPcs": 54}	Yusuf ali jath wala	2026-09-09 08:00:17.878311
163	PRODUCT	22	CREATE	{"nameEn": "SHIRT L / S", "articleNumber": "053", "initialStockPcs": 60}	Yusuf ali jath wala	2026-09-09 08:04:54.940101
164	PRODUCT	23	CREATE	{"nameEn": "SHIRT", "articleNumber": "2342", "initialStockPcs": 66}	Yusuf ali jath wala	2026-09-09 08:07:04.477959
165	PRODUCT	24	CREATE	{"nameEn": "JEANS DREES", "articleNumber": "2643", "initialStockPcs": 144}	Yusuf ali jath wala	2026-09-09 08:10:44.675047
166	PRODUCT	25	CREATE	{"nameEn": "2 PICES TARNO V", "articleNumber": "6632", "initialStockPcs": 96}	Yusuf ali jath wala	2026-09-09 08:14:03.279792
167	PRODUCT	26	CREATE	{"nameEn": "2PCS HAFER  TARNO", "articleNumber": "6633", "initialStockPcs": 132}	Yusuf ali jath wala	2026-09-09 08:17:59.215782
168	PRODUCT	27	CREATE	{"nameEn": "3 PCS SUIT", "articleNumber": "LL2549", "initialStockPcs": 66}	Yusuf ali jath wala	2026-09-09 08:23:19.503088
169	CUSTOMER	98	CREATE	{"name": "MB MURTAZA", "phone": "99375046"}	Yusuf ali jath wala	2026-09-09 08:26:09.908761
170	CUSTOMER	99	CREATE	{"name": "HAKIM NOMAN", "phone": "97572962 / 94012854"}	Yusuf ali jath wala	2026-09-09 08:28:34.674635
171	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-09 08:40:51.095907
172	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-09 08:41:01.738696
173	EXPENSE	1	CREATE_EXPENSE	{"amountKd": 1, "category": "Miscellaneous", "description": "test", "expenseDate": "2026-09-09"}	evolixstudio@gmail.com	2026-09-09 09:22:28.573272
174	EXPENSE	1	CANCEL_EXPENSE	{"reason": "Duplicate or erroneous entry", "amountKd": 1, "category": "Miscellaneous", "cancelledAt": "2026-09-09T09:22:42.134Z", "expenseNumber": "EXP-2026-0001"}	Evolix Admin	2026-09-09 09:22:42.15391
175	SALES_INVOICE	1	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 24, "amountReceivedKd": 24}	Yusuf ali jath wala	2026-09-09 09:45:20.89284
176	WHATSAPP_SHARE	INV-2026-0001	WHATSAPP_CHAT_OPENED	{"customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 09:50:04.111694
177	WHATSAPP_SHARE	INV-2026-0001	WHATSAPP_CHAT_OPENED	{"customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 09:50:04.710198
178	WHATSAPP_SHARE	INV-2026-0001	WHATSAPP_CHAT_OPENED	{"customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 09:51:45.771716
179	WHATSAPP_SHARE	INV-2026-0001	WHATSAPP_CHAT_OPENED	{"customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 09:53:27.523324
180	WHATSAPP_SHARE	INV-2026-0001	WHATSAPP_CHAT_OPENED	{"customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0001", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 09:55:27.681041
181	SALES_INVOICE	1	CANCEL	{"reason": "Invoice cancelled", "invoiceNumber": "INV-2026-0001", "totalAmountKd": 24}	Yusuf ali jath wala	2026-09-09 10:01:02.80746
182	DATABASE	ALL	RESTORE_DATABASE	{"rowsRestored": 337, "backupExportedAt": "2026-09-09T11:01:18.005Z"}	Evolix Admin	2026-09-09 11:02:03.315457
183	SALES_INVOICE	2	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "HAKIM NOMAN", "invoiceNumber": "INV-2026-0002", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 24, "amountReceivedKd": 24}	Yusuf ali jath wala	2026-09-09 14:50:42.041746
184	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-09 17:15:45.966654
185	SALES_INVOICE	2	CANCEL	{"reason": "Invoice cancelled", "invoiceNumber": "INV-2026-0002", "totalAmountKd": 24}	Yusuf ali jath wala	2026-09-09 17:16:26.681855
186	SALES_INVOICE	3	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "ABBAS UDAIPUR", "invoiceNumber": "INV-2026-0003", "outstandingKd": 24, "paymentStatus": "PENDING", "totalAmountKd": 24, "amountReceivedKd": 0}	Yusuf ali jath wala	2026-09-09 17:24:58.192534
187	WHATSAPP_SHARE	INV-2026-0003	WHATSAPP_REMINDER_OPENED	{"customerName": "ABBAS UDAIPUR", "invoiceNumber": "INV-2026-0003", "paymentStatus": "PENDING"}	owner1	2026-09-09 17:25:29.546762
188	WHATSAPP_SHARE	INV-2026-0003	WHATSAPP_REMINDER_OPENED	{"customerName": "ABBAS UDAIPUR", "invoiceNumber": "INV-2026-0003", "paymentStatus": "PENDING"}	owner1	2026-09-09 17:29:20.047902
189	SALES_INVOICE	3	CANCEL	{"reason": "Invoice cancelled", "invoiceNumber": "INV-2026-0003", "totalAmountKd": 24}	Yusuf ali jath wala	2026-09-09 17:31:46.589219
190	SALES_INVOICE	4	CREATE	{"totalPcs": 24, "itemCount": 2, "customerName": "SHANTA SIRAJ NEPALI", "invoiceNumber": "INV-2026-0004", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 42, "amountReceivedKd": 42}	Yusuf ali jath wala	2026-09-09 17:39:21.276893
191	WHATSAPP_SHARE	INV-2026-0004	WHATSAPP_CHAT_OPENED	{"customerName": "SHANTA SIRAJ NEPALI", "invoiceNumber": "INV-2026-0004", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 17:39:42.259928
192	WHATSAPP_SHARE	INV-2026-0004	WHATSAPP_CHAT_OPENED	{"customerName": "SHANTA SIRAJ NEPALI", "invoiceNumber": "INV-2026-0004", "paymentStatus": "FULLY PAID"}	owner1	2026-09-09 17:39:42.406662
193	SALES_INVOICE	4	CANCEL	{"reason": "Invoice cancelled", "invoiceNumber": "INV-2026-0004", "totalAmountKd": 42}	Yusuf ali jath wala	2026-09-09 17:40:47.770386
194	AUTH	2	LOGIN	{"ip": "127.0.0.1"}	Aliasgar jath wala	2026-09-09 18:54:59.71881
195	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-09 19:44:43.914243
196	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-10 06:11:40.567861
197	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-10 07:56:59.817844
198	PRODUCT	28	CREATE	{"nameEn": "LADEAS DRESS", "articleNumber": "6281", "initialStockPcs": 84}	Yusuf ali jath wala	2026-09-10 07:58:29.847603
199	PRODUCT	29	CREATE	{"nameEn": "T SHIRT", "articleNumber": "8204", "initialStockPcs": 336}	Yusuf ali jath wala	2026-09-10 08:02:07.931379
200	PRODUCT	30	CREATE	{"nameEn": "PHOTO BLOUSE", "articleNumber": "9023", "initialStockPcs": 600}	Yusuf ali jath wala	2026-09-10 08:04:44.136298
201	PRODUCT	31	CREATE	{"nameEn": "LINE SHIRT", "articleNumber": "6613", "initialStockPcs": 144}	Yusuf ali jath wala	2026-09-10 08:08:12.816678
202	PRODUCT	32	CREATE	{"nameEn": "LINE SHIRT", "articleNumber": "6615", "initialStockPcs": 120}	Yusuf ali jath wala	2026-09-10 08:09:29.636061
203	PRODUCT	33	CREATE	{"nameEn": "SHIRT LINE", "articleNumber": "6616", "initialStockPcs": 216}	Yusuf ali jath wala	2026-09-10 08:10:50.618943
204	PRODUCT	34	CREATE	{"nameEn": "SHIRT FLOWER", "articleNumber": "1133", "initialStockPcs": 84}	Yusuf ali jath wala	2026-09-10 08:11:50.918501
205	PRODUCT	35	CREATE	{"nameEn": "JACKET LONG", "articleNumber": "WINTER HUDI", "initialStockPcs": 180}	Yusuf ali jath wala	2026-09-10 08:14:48.028536
206	PRODUCT	36	CREATE	{"nameEn": "WINTER TRACKSUIT", "articleNumber": "3006", "initialStockPcs": 468}	Yusuf ali jath wala	2026-09-10 08:16:39.325787
207	PRODUCT	37	CREATE	{"nameEn": "PLAZO PANT", "articleNumber": "K07", "initialStockPcs": 84}	Yusuf ali jath wala	2026-09-10 08:19:39.160428
208	PRODUCT	38	CREATE	{"nameEn": "PLAZO PANT", "articleNumber": "2604", "initialStockPcs": 108}	Yusuf ali jath wala	2026-09-10 08:21:42.923165
209	PRODUCT	39	CREATE	{"nameEn": "2PCS TARNO", "articleNumber": "6636", "initialStockPcs": 180}	Yusuf ali jath wala	2026-09-10 08:24:03.221356
210	PRODUCT	40	CREATE	{"nameEn": "TIGER JUMPSUIT", "articleNumber": "808", "initialStockPcs": 276}	Yusuf ali jath wala	2026-09-10 08:28:17.154668
211	PRODUCT	41	CREATE	{"nameEn": "2PCS TARNO", "articleNumber": "6663", "initialStockPcs": 348}	Yusuf ali jath wala	2026-09-10 08:31:55.050733
212	PRODUCT	42	CREATE	{"nameEn": "NET BLOUSE", "articleNumber": "067", "initialStockPcs": 12}	Yusuf ali jath wala	2026-09-10 08:33:29.824031
213	PRODUCT	43	CREATE	{"nameEn": "M 2PCS SET", "articleNumber": "M-9023", "initialStockPcs": 240}	Yusuf ali jath wala	2026-09-10 08:37:38.130782
214	PRODUCT	44	CREATE	{"nameEn": "BLACK SKIRT", "articleNumber": "810", "initialStockPcs": 96}	Yusuf ali jath wala	2026-09-10 08:39:35.144551
215	PRODUCT	45	CREATE	{"nameEn": "2PCS TARNO", "articleNumber": "6662", "initialStockPcs": 216}	Yusuf ali jath wala	2026-09-10 08:40:54.623056
216	PRODUCT	46	CREATE	{"nameEn": "FLOWER SKIRT", "articleNumber": "6665", "initialStockPcs": 216}	Yusuf ali jath wala	2026-09-10 08:42:07.329172
217	PRODUCT	47	CREATE	{"nameEn": "PLAZO", "articleNumber": "6666", "initialStockPcs": 300}	Yusuf ali jath wala	2026-09-10 08:48:11.518061
218	PRODUCT	48	CREATE	{"nameEn": "2PCS SET TERNO", "articleNumber": "6658", "initialStockPcs": 0}	Yusuf ali jath wala	2026-09-10 08:49:27.065936
219	RECEIVE_SHIPMENT	1	CREATE	{"totalPcs": 1146, "itemCount": 2, "containerNo": "REC NO. -36251", "supplierName": "Direct / Local Purchase", "receiptNumber": "PR-2026-0001", "totalAmountKd": 1050.5}	Yusuf ali jath wala	2026-09-10 09:01:47.725462
220	SUPPLIER	1	CREATE	{"name": "2PCS PLAZO", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:06:26.671599
221	SUPPLIER	2	CREATE	{"name": "CODRY FUSTAN", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:09:03.512235
222	SUPPLIER	3	CREATE	{"name": "ALNA BLAZER", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:10:48.611945
223	SUPPLIER	4	CREATE	{"name": "JEANS LONG JACKET& PANT", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:13:23.921769
224	SUPPLIER	5	CREATE	{"name": "PIC BLOUSE", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:15:44.421627
225	SUPPLIER	6	CREATE	{"name": "2PCS WINTER PAJAMA", "country": "China"}	Yusuf ali jath wala	2026-09-10 09:18:31.819049
226	PRODUCT	13	UPDATE	{"changes": {"size": "FREE", "color": "BLACK", "nameAr": "تي شيرت أسود L/S", "nameEn": "L/S BLACK T SHIRT", "isActive": true, "sellingPrice": 8, "purchasePrice": 8, "reorderLevelPcs": 12}, "articleNumber": "SFR  T SHIRT"}	Yusuf ali jath wala	2026-09-10 09:24:06.943792
227	SALES_INVOICE	5	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "Walk-in Customer", "invoiceNumber": "INV-2026-0005", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 8, "amountReceivedKd": 8}	Yusuf ali jath wala	2026-09-10 09:24:52.025054
228	CUSTOMER	32	UPDATE	{"name": "MALIK LYKE FAHEEL", "changes": {"name": "MALIK LYKE FAHEEL", "phone": "66850853", "nameAr": "مالك ليك فحيل", "address": "FAHEEL", "isActive": true}}	Yusuf ali jath wala	2026-09-10 09:30:19.341783
229	CUSTOMER	90	UPDATE	{"name": "SAMEER PARDESI FAHEEL", "changes": {"name": "SAMEER PARDESI FAHEEL", "phone": "+919109323586", "nameAr": "سمير بارديسي فحيل", "address": "FAHEEL", "isActive": true}}	Yusuf ali jath wala	2026-09-10 09:31:31.732868
230	CUSTOMER	53	UPDATE	{"name": "PARDEEP NEPALI", "changes": {"name": "PARDEEP NEPALI", "phone": "61002674", "nameAr": "بارديب نيبالي", "address": "FAHEEL", "isActive": true}}	Yusuf ali jath wala	2026-09-10 09:32:13.129807
231	CUSTOMER	35	UPDATE	{"name": "CHINTU FAHEEL", "changes": {"name": "CHINTU FAHEEL", "phone": "66172315", "nameAr": "شينتو فحيل", "address": "FAHEEL", "isActive": true}}	Yusuf ali jath wala	2026-09-10 09:32:40.618665
232	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-10 10:05:52.270681
233	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-10 10:06:05.290553
234	DATABASE	ALL	RESTORE_DATABASE	{"rowsRestored": 462, "backupExportedAt": "2026-09-10T10:07:45.099Z"}	Evolix Admin	2026-09-10 10:07:57.370727
235	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-10 10:12:09.171633
236	PRODUCT	22	PRODUCT_IMAGE_CHANGED	{"articleNumber": "053"}	Evolix Admin	2026-09-10 10:13:51.775802
237	PRODUCT	22	PRODUCT_IMAGE_REMOVED	{"articleNumber": "053"}	Evolix Admin	2026-09-10 10:14:03.406229
238	PRODUCT	51	CREATE	{"nameEn": "choclate", "articleNumber": "003", "initialStockPcs": 0}	Evolix Admin	2026-09-10 10:16:24.735863
239	PRODUCT	51	PRODUCT_IMAGE_CHANGED	{"articleNumber": "003"}	Evolix Admin	2026-09-10 10:16:26.925699
240	PRODUCT	51	UPDATE	{"changes": {"nameAr": "شوكولاتة", "nameEn": "choclate", "isActive": true, "sellingPrice": 5, "purchasePrice": 2, "reorderLevelPcs": 12}, "articleNumber": "003"}	Evolix Admin	2026-09-10 10:16:51.94338
241	STOCK_ADJUSTMENT	51	UPDATE	{"type": "ADD", "reason": "Recount", "articleNumber": "003", "balanceAfterPcs": 12, "quantityChangePcs": 12}	Evolix Admin	2026-09-10 10:17:15.995906
242	SALES_INVOICE	6	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "saifuddin wadla", "invoiceNumber": "INV-2026-0006", "outstandingKd": 2, "paymentStatus": "PARTIAL", "totalAmountKd": 5, "amountReceivedKd": 3}	Evolix Admin	2026-09-10 10:18:59.480429
243	SALES_INVOICE	6	DELETE	{"reason": "Invoice hard deleted", "invoiceNumber": "INV-2026-0006", "totalAmountKd": 5}	Evolix Admin	2026-09-10 10:19:40.16071
244	CUSTOMER	101	DELETE	{"name": "saifuddin wadla", "reason": "Customer hard deleted"}	Evolix Admin	2026-09-10 10:19:57.950466
245	PRODUCT	51	DELETE	{"reason": "Product hard deleted", "articleNumber": "003"}	Evolix Admin	2026-09-10 10:20:04.085412
246	CUSTOMER	102	CREATE	{"name": "Qusai Haider", "phone": "8827757253", "openingBalance": 0}	Evolix Admin	2026-09-10 12:35:52.477999
247	CUSTOMER	103	CREATE	{"name": "saifuddin", "phone": "9098173239", "openingBalance": 1}	Evolix Admin	2026-09-10 13:09:36.494622
248	CUSTOMER	102	CUSTOMER_OPENING_BALANCE_ADJUSTED	{"reason": "hhhl", "adjustment": 1, "newOpeningOutstanding": "1.000"}	Evolix Admin	2026-09-10 13:25:51.466484
249	WHATSAPP_SHARE	INV	WHATSAPP_REMINDER_OPENED	{"customerName": "Qusai Haider", "invoiceNumber": "INV", "paymentStatus": "PENDING"}	evolixstudio@gmail.com	2026-09-10 13:25:58.359195
250	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-10 13:38:36.305218
251	WHATSAPP_SHARE	INV	WHATSAPP_REMINDER_OPENED	{"customerName": "Qusai Haider", "invoiceNumber": "INV", "paymentStatus": "PENDING"}	evolixstudio@gmail.com	2026-09-10 13:46:12.750652
252	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-10 14:26:43.514205
253	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-10 14:26:43.775097
254	AUTH	2	LOGIN	{"ip": "127.0.0.1"}	Aliasgar jath wala	2026-09-10 14:29:48.722013
255	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-10 16:37:06.555269
256	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-10 16:49:18.046936
257	PRODUCT	52	CREATE	{"nameEn": "2pcs tarno", "articleNumber": "66658", "initialStockPcs": 72}	Yusuf ali jath wala	2026-09-10 16:51:05.665312
258	SALES_INVOICE	7	CREATE	{"totalPcs": 60, "itemCount": 5, "customerName": "HAZIQ SHOP", "invoiceNumber": "INV-2026-0006", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 106, "amountReceivedKd": 106}	Aliasgar jath wala	2026-09-10 16:57:27.553712
259	STOCK_ADJUSTMENT	52	UPDATE	{"type": "ADD", "reason": "Recount", "articleNumber": "66658", "balanceAfterPcs": 72, "quantityChangePcs": 12}	Aliasgar jath wala	2026-09-10 17:12:23.752828
260	PRODUCT	48	UPDATE	{"changes": {"size": "FREE", "color": "ASST", "nameAr": "2 قطعة مجموعة تيرنو", "nameEn": "2PCS SET TERNO", "isActive": true, "sellingPrice": 30, "purchasePrice": 21, "reorderLevelPcs": 12}, "articleNumber": "6658"}	Aliasgar jath wala	2026-09-10 17:30:02.645729
261	STOCK_ADJUSTMENT	48	UPDATE	{"type": "ADD", "reason": "Recount", "articleNumber": "6658", "balanceAfterPcs": 72, "quantityChangePcs": 72}	Aliasgar jath wala	2026-09-10 17:30:41.257118
262	STOCK_ADJUSTMENT	52	UPDATE	{"type": "REMOVE", "reason": "Other", "articleNumber": "66658", "balanceAfterPcs": 0, "quantityChangePcs": -72}	Aliasgar jath wala	2026-09-10 17:41:40.364671
263	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-11 06:29:06.755985
264	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-11 06:45:35.351565
265	CUSTOMER	104	CREATE	{"name": "MADHU NILU LANKA", "phone": "65016232"}	Yusuf ali jath wala	2026-09-11 06:50:39.351305
266	SALES_INVOICE	8	CREATE	{"totalPcs": 12, "itemCount": 2, "customerName": "MADHU NILU LANKA", "invoiceNumber": "INV-2026-0007", "outstandingKd": 10, "paymentStatus": "PARTIAL", "totalAmountKd": 22.5, "amountReceivedKd": 12.5}	Yusuf ali jath wala	2026-09-11 07:02:52.292274
269	CUSTOMER	105	CREATE	{"name": "ABULI BHAI", "phone": "66567538"}	Yusuf ali jath wala	2026-09-11 07:13:40.540086
267	WHATSAPP_SHARE	INV-2026-0007	WHATSAPP_CHAT_OPENED	{"customerName": "MADHU NILU LANKA", "invoiceNumber": "INV-2026-0007", "paymentStatus": "PARTIALLY PAID"}	owner1	2026-09-11 07:04:01.172239
268	WHATSAPP_SHARE	INV-2026-0007	WHATSAPP_CHAT_OPENED	{"customerName": "MADHU NILU LANKA", "invoiceNumber": "INV-2026-0007", "paymentStatus": "PARTIALLY PAID"}	owner1	2026-09-11 07:06:57.109247
270	SALES_INVOICE	9	CREATE	{"totalPcs": 12, "itemCount": 1, "customerName": "ABULI BHAI", "invoiceNumber": "INV-2026-0008", "outstandingKd": 0, "paymentStatus": "PAID", "totalAmountKd": 17, "amountReceivedKd": 17}	Yusuf ali jath wala	2026-09-11 07:14:45.047084
271	SALES_INVOICE	10	CREATE	{"totalPcs": 24, "itemCount": 1, "customerName": "isha lanka online", "invoiceNumber": "INV-2026-0009", "outstandingKd": 54, "paymentStatus": "PENDING", "totalAmountKd": 54, "amountReceivedKd": 0}	Yusuf ali jath wala	2026-09-11 08:38:27.033858
272	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-11 09:29:08.073998
273	AUTH	1	LOGOUT	\N	Yusuf ali jath wala	2026-09-11 09:34:28.838036
274	AUTH	3	LOGIN	{"ip": "127.0.0.1"}	Evolix Admin	2026-09-11 09:34:43.262301
275	DATABASE	ALL	RESTORE_DATABASE	{"rowsRestored": 163, "backupExportedAt": "2026-09-11T06:45:54.153Z"}	Evolix Admin	2026-09-11 09:35:46.984976
276	AUTH	1	LOGIN	{"ip": "127.0.0.1"}	Yusuf ali jath wala	2026-09-11 10:03:57.369679
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, "nameEn", "nameAr", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company (id, name_en, name_ar, address, phone, logo_url, invoice_terms_en, invoice_terms_ar, created_at, updated_at) FROM stdin;
1	Rashidi Traders	شركة الرشيدي للتجارة	Kuwait City, Kuwait	+965 00000000	\N	Goods once sold will not be returned or exchanged without valid reason.	البضاعة المباعة لا ترد ولا تستبدل إلا بسبب وجيه.	2026-09-08 07:50:31.270079	2026-09-08 07:50:31.270079
\.


--
-- Data for Name: customer_opening_balance_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_opening_balance_adjustments (id, "customerId", "amountKd", reason, "performedBy", "createdAt") FROM stdin;
1	102	1.000	hhhl	Evolix Admin	2026-09-10 13:25:49.374366+00
\.


--
-- Data for Name: customer_receipt_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_receipt_allocations (id, "receiptId", "customerId", "allocationType", "invoiceId", "amountKd", "createdAt") FROM stdin;
\.


--
-- Data for Name: customer_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_receipts (id, "receiptNumber", "customerId", "invoiceId", "amountKd", "paymentMethod", "receiptDate", notes, "performedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: customer_refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_refunds (id, "refundNumber", "salesReturnId", "customerId", "amountKd", "refundMethod", "refundDate", notes, status, "performedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, name, "nameAr", phone, address, "totalSales", "totalReceived", "totalOutstanding", "isActive", notes, "createdAt", "updatedAt") FROM stdin;
1	abbas bhai aashiq bhai	\N	60983441	farwaniya	0.000	0.000	0.000	t	\N	2026-09-08 15:16:40.510259+00	2026-09-08 15:16:40.510259+00
2	ashan online	\N	50751050	hawally	0.000	0.000	0.000	t	\N	2026-09-08 15:18:07.647748+00	2026-09-08 15:18:07.647748+00
3	ashly u&i  online	\N	51722748	hawally	0.000	0.000	0.000	t	\N	2026-09-08 15:20:27.266459+00	2026-09-08 15:20:27.266459+00
4	aruni lanka online	\N	66387216	farwaniya	0.000	0.000	0.000	t	\N	2026-09-08 15:21:42.354812+00	2026-09-08 15:21:42.354812+00
5	asanka maliya	\N	66389021	salmiya	0.000	0.000	0.000	t	\N	2026-09-08 15:23:14.338808+00	2026-09-08 15:23:14.338808+00
6	girlly philipini	\N	66451194	salmiya	0.000	0.000	0.000	t	\N	2026-09-08 15:24:47.775094+00	2026-09-08 15:24:47.775094+00
7	imran maliya	\N	60484860	maliya	0.000	0.000	0.000	t	\N	2026-09-08 15:26:01.433637+00	2026-09-08 15:26:01.433637+00
8	nimali imran	\N	67781910	maliya	0.000	0.000	0.000	t	\N	2026-09-08 15:27:19.211803+00	2026-09-08 15:27:19.211803+00
9	irfan u&i online	\N	66740422	hawally	0.000	0.000	0.000	t	\N	2026-09-08 15:28:34.057302+00	2026-09-08 15:28:34.057302+00
11	isnayra philipini	\N	67001419	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:31:11.741383+00	2026-09-08 15:31:11.741383+00
12	jem philipini mohsin	\N	\N	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:32:03.016409+00	2026-09-08 15:32:03.016409+00
13	lovely ziya fashion	\N	94130911	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:33:15.880651+00	2026-09-08 15:33:15.880651+00
14	m.nafil lanka online	\N	99824538	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:34:27.620818+00	2026-09-08 15:34:27.620818+00
15	marwan philipini	\N	50443349	farwaniya	0.000	0.000	0.000	t	\N	2026-09-08 15:35:30.171659+00	2026-09-08 15:35:30.171659+00
16	may phlpni mufaddal online	\N	65593237	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:36:58.862696+00	2026-09-08 15:36:58.862696+00
17	mufaddal online	\N	51259648	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:37:51.109659+00	2026-09-08 15:37:51.109659+00
18	nilu selani	\N	98797697	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:48:58.440784+00	2026-09-08 15:48:58.440784+00
19	raj kumar nepali	\N	51764950	farwaniya	0.000	0.000	0.000	t	\N	2026-09-08 15:49:48.828141+00	2026-09-08 15:49:48.828141+00
20	RATNA LAMA NEPALI	\N	65926484	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 15:50:47.428687+00	2026-09-08 15:50:47.428687+00
21	RAJENDER NEPALI	\N	98928244	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:51:44.692371+00	2026-09-08 15:51:44.692371+00
22	SADUNI LANKA ONLINE	\N	50593624	\N	0.000	0.000	0.000	t	\N	2026-09-08 15:52:38.189325+00	2026-09-08 15:52:38.189325+00
23	SANGITA NEPALI	\N	+9779704940794	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 15:54:01.223916+00	2026-09-08 15:54:01.223916+00
25	BELLA CHO VAYIL	\N	66914136	MALIYA  (UTC)	0.000	0.000	0.000	t	\N	2026-09-08 15:56:45.224427+00	2026-09-08 15:56:45.224427+00
26	YUNA LAMA NEPALI	\N	65993896	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 15:57:48.875284+00	2026-09-08 15:57:48.875284+00
27	Z&Y DELMA ONLINE	\N	99718538	SHARQ	0.000	0.000	0.000	t	\N	2026-09-08 15:59:01.813349+00	2026-09-08 15:59:01.813349+00
28	ZIYA ON LINE	\N	\N	98702125	0.000	0.000	0.000	t	\N	2026-09-08 16:00:08.715319+00	2026-09-08 16:00:08.715319+00
29	ZOYA FASHION	\N	51662522	ABBASIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:00:50.118855+00	2026-09-08 16:00:50.118855+00
30	M.T.B KHOJEMA	\N	65143287	MUBARAKIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:02:43.312107+00	2026-09-08 16:02:43.312107+00
31	MONA IRSHAN ONLINE	\N	60647373	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:03:36.862526+00	2026-09-08 16:03:36.862526+00
33	AKBAR Z&Y	\N	99598396	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:05:14.739499+00	2026-09-08 16:05:14.739499+00
34	RAMESH NEPALI	\N	67723504	SALMIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:05:57.636273+00	2026-09-08 16:05:57.636273+00
36	MADHU ( RMD FASHION)	\N	55161887	MALIYA (SUQ AL WATIYA)	0.000	0.000	0.000	t	\N	2026-09-08 16:07:51.686231+00	2026-09-08 16:07:51.686231+00
37	NOOR PHILIPINI	\N	66331105	HAWALLY	0.000	0.000	0.000	t	\N	2026-09-08 16:08:31.198027+00	2026-09-08 16:08:31.198027+00
39	MAHMOOD MASRI	\N	55116891	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:09:58.954668+00	2026-09-08 16:09:58.954668+00
40	SWEETY PHILIPINI	\N	60915827	HAWALLY	0.000	0.000	0.000	t	\N	2026-09-08 16:10:39.574259+00	2026-09-08 16:10:39.574259+00
41	HIDEOUT LANKA	\N	65138706	MAHABOOLA	0.000	0.000	0.000	t	\N	2026-09-08 16:11:30.928175+00	2026-09-08 16:11:30.928175+00
42	HUSAIN DALAL	\N	66471354	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:12:02.280908+00	2026-09-08 16:12:02.280908+00
43	SUDDI LANKA	\N	66447335	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:12:41.655108+00	2026-09-08 16:12:41.655108+00
44	NISHA LANKA	\N	51642121	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:13:12.890917+00	2026-09-08 16:13:12.890917+00
45	NILUPA LANKA MOHAN	\N	50765693	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:14:14.392898+00	2026-09-08 16:14:14.392898+00
46	DB COLLECTION NEPALI	\N	66587333	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:15:37.770557+00	2026-09-08 16:15:37.770557+00
47	MUSKAN NEPALI	\N	65878861	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:16:11.08153+00	2026-09-08 16:16:11.08153+00
48	SUJI LANKA	\N	97527205	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:16:43.951357+00	2026-09-08 16:16:43.951357+00
49	ABU ALI SURI	\N	94984064	SALMIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:17:24.525489+00	2026-09-08 16:17:24.525489+00
50	VIJAYA SINGHA LANKA	\N	50209710	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:17:59.609741+00	2026-09-08 16:17:59.609741+00
51	ORMI NEPALI	\N	66994276	JAHRA	0.000	0.000	0.000	t	\N	2026-09-08 16:18:29.636136+00	2026-09-08 16:18:29.636136+00
52	CHAMUNDA LANKA	\N	94190021	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:19:25.379429+00	2026-09-08 16:19:25.379429+00
54	SAMEERA NEPALI	\N	69018528	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:20:52.199273+00	2026-09-08 16:20:52.199273+00
55	SEVANDI LANKA	\N	65977892	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:21:45.56478+00	2026-09-08 16:21:45.56478+00
56	SAIFULLA BANGALI	\N	97639161	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:22:31.206998+00	2026-09-08 16:22:31.206998+00
57	MOIZE BHAI BARNAGAR	\N	50706252	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:23:13.674517+00	2026-09-08 16:23:13.674517+00
58	DEBS  PHILIPINI ONLINE	\N	55936401	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:25:54.739074+00	2026-09-08 16:25:54.739074+00
59	GRESS  PHILIPINI ONLINE	\N	69674647	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:26:59.886458+00	2026-09-08 16:26:59.886458+00
60	LAHIRU LANKA	\N	56573221	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:27:28.791048+00	2026-09-08 16:27:28.791048+00
61	CHAYA LANKA	\N	65745093	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:28:06.73082+00	2026-09-08 16:28:06.73082+00
62	LAKMALI  LANKA	\N	99868473	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:28:53.966225+00	2026-09-08 16:28:53.966225+00
63	QAYUM BANGALI	\N	60739946	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:29:30.46017+00	2026-09-08 16:29:30.46017+00
64	AASHIRWAD NEPALI	\N	97958728	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:30:18.748595+00	2026-09-08 16:30:18.748595+00
65	SANJU LANKA	\N	55193849	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:30:50.266743+00	2026-09-08 16:30:50.266743+00
66	SUQ AL ASMAR ( TONY)	\N	65077128	MALIYA ( UTC )	0.000	0.000	0.000	t	\N	2026-09-08 16:31:56.485087+00	2026-09-08 16:31:56.485087+00
67	RAJU BHAI ONLINE	\N	67043733	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:32:41.454179+00	2026-09-08 16:32:41.454179+00
68	ANITA NEPALI	\N	41001898	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:33:26.578329+00	2026-09-08 16:33:26.578329+00
69	NARAYAN NEPALI	\N	65127513	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:34:02.767948+00	2026-09-08 16:34:02.767948+00
70	NOOR MOHAMMED	\N	69993585	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:34:33.961336+00	2026-09-08 16:34:33.961336+00
71	AASHIQ FASHION	\N	95571720	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:35:06.998106+00	2026-09-08 16:35:06.998106+00
72	AASHIQ BHAI KATKA	\N	67609264	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:36:07.195736+00	2026-09-08 16:36:07.195736+00
73	YUNA LAMA BROTHER	\N	67754500	MAHABOOLA	0.000	0.000	0.000	t	\N	2026-09-08 16:37:14.748146+00	2026-09-08 16:37:14.748146+00
74	SHILPA COLLECTIONS	\N	55927064	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:38:24.864354+00	2026-09-08 16:38:24.864354+00
75	VINU LANKA	\N	95563899	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:38:49.330267+00	2026-09-08 16:38:49.330267+00
76	MAHENDRA NEPALI	\N	65970090	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:39:22.616457+00	2026-09-08 16:39:22.616457+00
77	SHIMOUL ONLINE	\N	\N	65010138	0.000	0.000	0.000	t	\N	2026-09-08 16:40:32.487787+00	2026-09-08 16:40:32.487787+00
78	SUQ NASEEM  ( AYSHA)	\N	50496587	JAHRA	0.000	0.000	0.000	t	\N	2026-09-08 16:41:31.737598+00	2026-09-08 16:41:31.737598+00
79	SUQ NASEEM ( ABU SAMRA )	\N	97496451	JAHRA	0.000	0.000	0.000	t	\N	2026-09-08 16:42:20.100818+00	2026-09-08 16:42:20.100818+00
80	JN PHILIPINI ONLINE	\N	94132966	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:43:12.054497+00	2026-09-08 16:43:12.054497+00
81	SAMEER ONLINE	\N	55852151	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:43:56.549325+00	2026-09-08 16:43:56.549325+00
82	MARYAM PHILIPINI	\N	66007026	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:45:02.018709+00	2026-09-08 16:45:02.018709+00
32	MALIK LYKE FAHEEL	مالك ليك فحيل	66850853	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:04:22.139101+00	2026-09-10 09:30:19.332136+00
53	PARDEEP NEPALI	بارديب نيبالي	61002674	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:20:04.259542+00	2026-09-10 09:32:13.12191+00
35	CHINTU FAHEEL	شينتو فحيل	66172315	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:06:31.75571+00	2026-09-10 09:32:40.570918+00
10	isha lanka online	\N	55702356	mahaboola	54.000	0.000	54.000	t	\N	2026-09-08 15:30:07.711489+00	2026-09-11 08:38:26.849987+00
83	NORA PHILIPINI	\N	65770120	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:45:39.536086+00	2026-09-08 16:45:39.536086+00
84	RENU LANKA	\N	50522026	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:46:24.87852+00	2026-09-08 16:46:24.87852+00
85	NELKA SELANI LANKA	\N	98532374	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:47:02.760408+00	2026-09-08 16:47:02.760408+00
86	CITY BAZAR ( MAHESH )	\N	96056131	SALMIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:47:54.545716+00	2026-09-08 16:47:54.545716+00
87	HANSI LANKA	\N	+94764014701	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:49:10.215443+00	2026-09-08 16:49:10.215443+00
88	BINITA NEPALI	\N	67758360	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:50:19.853065+00	2026-09-08 16:50:19.853065+00
89	IRSHAN LANKA	\N	99597919	MALIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:51:06.51872+00	2026-09-08 16:51:06.51872+00
91	TIPTOP ONLINE NEPALI	\N	99697351	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:53:10.494805+00	2026-09-08 16:53:10.494805+00
92	AMJAD PAK	\N	69989060	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:53:44.176508+00	2026-09-08 16:53:44.176508+00
94	AITA NEPALI	\N	99413771	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:55:04.498403+00	2026-09-08 16:55:04.498403+00
95	KHALID MASRI	\N	60705180	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:55:31.774582+00	2026-09-08 16:55:31.774582+00
96	AL KHAMSIN CO.	\N	97453933 /  67723504	SALMIYA	0.000	0.000	0.000	t	\N	2026-09-08 16:57:50.142401+00	2026-09-08 16:57:50.142401+00
97	ALI & RAZZAK BHAI	\N	65107793	MALIYA ( SUQ AL WATIYA )	0.000	0.000	0.000	t	\N	2026-09-08 16:59:07.458181+00	2026-09-08 16:59:07.458181+00
98	MB MURTAZA	ام بي مرتضى	99375046	MUBARAKIYA ( BHINDER MARKET)	0.000	0.000	0.000	t	\N	2026-09-09 08:26:09.897495+00	2026-09-09 08:26:09.897495+00
99	HAKIM NOMAN	حكيم نعمان	97572962 / 94012854	MUBARKIYA( BHINDER MARKET)	0.000	0.000	0.000	t	\N	2026-09-09 08:28:34.666698+00	2026-09-09 17:16:26.426718+00
38	ABBAS UDAIPUR	\N	56528358	\N	0.000	0.000	0.000	t	\N	2026-09-08 16:09:16.821289+00	2026-09-09 17:31:46.416477+00
24	SHANTA SIRAJ NEPALI	\N	60045311	FARWANIYA	0.000	0.000	0.000	t	\N	2026-09-08 15:54:52.661546+00	2026-09-09 17:40:47.572826+00
100	Walk-in Customer	\N	\N	\N	8.000	8.000	0.000	t	\N	2026-09-10 09:24:51.826736+00	2026-09-10 09:24:51.826736+00
90	SAMEER PARDESI FAHEEL	سمير بارديسي فحيل	+919109323586	FAHEEL	0.000	0.000	0.000	t	\N	2026-09-08 16:52:07.764685+00	2026-09-10 09:31:31.724766+00
103	saifuddin	ساي	9098173239	cc	0.000	0.000	1.000	t	x	2026-09-10 13:09:36.079801+00	2026-09-10 13:09:36.079801+00
102	Qusai Haider	قصي حيدر	8827757253	sal3m	0.000	0.000	1.000	t	\N	2026-09-10 12:35:52.092942+00	2026-09-10 13:25:49.374366+00
93	HAZIQ SHOP	\N	55099782	MALIYA	106.000	106.000	0.000	t	\N	2026-09-08 16:54:30.488536+00	2026-09-10 16:57:27.222573+00
104	MADHU NILU LANKA	مادو نيلو لانكا	65016232	\N	22.500	12.500	10.000	t	\N	2026-09-11 06:50:39.320532+00	2026-09-11 07:02:52.118813+00
105	ABULI BHAI	أبولي بهاي	66567538	FAHEEL	17.000	17.000	0.000	t	\N	2026-09-11 07:13:40.531713+00	2026-09-11 07:14:44.903588+00
\.


--
-- Data for Name: document_sequences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_sequences (id, "nextValue") FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, "expenseNumber", category, description, "amountKd", "expenseDate", "paymentMethod", "paidTo", "receiptRef", notes, "recordedBy", status, "cancellationReason", "cancelledAt", "cancelledBy", "createdAt") FROM stdin;
1	EXP-2026-0001	Miscellaneous	test	1.000	2026-09-09	Cash	me	\N	\N	evolixstudio@gmail.com	CANCELLED	Duplicate or erroneous entry	2026-09-09 09:22:42.134+00	Evolix Admin	2026-09-09 09:22:28.516316+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, "articleNumber", "nameEn", "nameAr", "categoryId", color, size, "purchasePrice", "sellingPrice", "currentStockPcs", "reorderLevelPcs", "isActive", notes, "createdAt", "updatedAt") FROM stdin;
44	810	BLACK SKIRT	تنورة سوداء	\N	\N	FREE	13.000	18.000	96	12	t	\N	2026-09-10 08:39:35.130962+00	2026-09-10 08:39:35.130962+00
5	99085	LADEAS DRESS	فستان لادياس	\N	ASST.	FREE	20.000	24.000	48	12	t	\N	2026-09-09 07:13:29.190312+00	2026-09-09 07:13:29.190312+00
6	993	DOTS 2PCS TARNO	دوتس 2 قطعة تارنو	\N	ASST	FREE	20.000	27.000	84	12	t	\N	2026-09-09 07:17:49.386011+00	2026-09-09 07:17:49.386011+00
7	850	LADES DRESS	فستان لاديس	\N	ASST	FREE	20.000	24.000	36	12	t	\N	2026-09-09 07:25:11.714392+00	2026-09-09 07:25:11.714392+00
8	99081	LADIES DRESS	فستان للسيدات	\N	AAST	FREE	20.000	24.000	24	12	t	\N	2026-09-09 07:29:40.241385+00	2026-09-09 07:29:40.241385+00
9	6604	SKIRT BLOUS	تنورة بلوز	\N	ASST	FREE	20.000	27.000	240	12	t	\N	2026-09-09 07:33:09.198722+00	2026-09-09 07:33:09.198722+00
11	928	LADEES DRESS	فستان ليديز	\N	ASST.	FREE	20.000	24.000	60	12	t	\N	2026-09-09 07:36:03.614194+00	2026-09-09 07:36:03.614194+00
12	6618	2 PCS TARNO	2 قطعة تارنو	\N	ASST	FREE	20.000	27.000	180	12	t	\N	2026-09-09 07:37:55.153569+00	2026-09-09 07:37:55.153569+00
14	8045	ROUND NECK 2 PCS TARNO	رقبة مستديرة 2 قطعة تارنو	\N	ASST.	L XL XXL	20.000	24.000	18	12	t	\N	2026-09-09 07:43:29.039363+00	2026-09-09 07:43:29.039363+00
15	8057	2 PCS SPORT TARNO	2 قطعة سبورت تارنو	\N	ASST.	LXL XXL	20.000	24.000	48	12	t	\N	2026-09-09 07:45:13.854304+00	2026-09-09 07:45:13.854304+00
17	6199	SKIRT BLOUSE	بلوزة تنورة	\N	ASST.	FREE	20.000	24.000	36	12	t	\N	2026-09-09 07:48:40.057308+00	2026-09-09 07:48:40.057308+00
19	2306	SHIRT LADEIS	قميص نسائي	\N	ASST.	\N	10.000	15.000	96	12	t	\N	2026-09-09 07:54:48.248993+00	2026-09-09 07:54:48.248993+00
21	927	HAFER DRESS	فستان هافر	\N	ASST.	FREE	15.000	18.000	54	12	t	\N	2026-09-09 08:00:17.857238+00	2026-09-09 08:00:17.857238+00
23	2342	SHIRT	قميص	\N	ASST.	FREE	13.000	15.000	66	12	t	\N	2026-09-09 08:07:04.461244+00	2026-09-09 08:07:04.461244+00
24	2643	JEANS DREES	جينز دريس	\N	3	S M L XL	22.500	27.000	144	12	t	\N	2026-09-09 08:10:44.658684+00	2026-09-09 08:10:44.658684+00
25	6632	2 PICES TARNO V	2 قطعة تارنو V	\N	ASST	FREE	21.000	27.000	96	12	t	\N	2026-09-09 08:14:03.26507+00	2026-09-09 08:14:03.26507+00
26	6633	2PCS HAFER  TARNO	2PISES تارنو	\N	ASST.	FREE11	20.000	27.000	132	12	t	\N	2026-09-09 08:17:59.200771+00	2026-09-09 08:17:59.200771+00
27	LL2549	3 PCS SUIT	بدلة 3 قطع	\N	ASST	M L XL XXL	27.000	36.000	66	12	t	\N	2026-09-09 08:23:19.469842+00	2026-09-09 08:23:19.469842+00
4	ART-1	fustan	فستان	\N	mix	free	20.000	24.000	102	12	t	\N	2026-09-08 18:32:28.45748+00	2026-09-09 10:01:02.550932+00
49	2408	CROP TOP	\N	\N	\N	\N	11.000	14.300	684	12	t	\N	2026-09-10 09:01:47.416974+00	2026-09-10 09:01:47.416974+00
50	7179	CROPTOP	\N	\N	\N	\N	11.000	14.300	462	12	t	\N	2026-09-10 09:01:47.416974+00	2026-09-10 09:01:47.416974+00
10	1920	DRESS	فستان	\N	ASST.	FREE	20.000	24.000	24	12	t	\N	2026-09-09 07:34:52.793282+00	2026-09-09 17:31:46.416477+00
43	M-9023	M 2PCS SET	م 2 قطعة مجموعة	\N	ASST	FREE	21.000	27.000	234	12	t	\N	2026-09-10 08:37:38.112536+00	2026-09-11 07:02:52.118813+00
13	SFR  T SHIRT	L/S BLACK T SHIRT	تي شيرت أسود L/S	\N	BLACK	FREE	8.000	8.000	72	12	t	\N	2026-09-09 07:40:38.796978+00	2026-09-10 09:24:51.826736+00
16	SM 5267	3PCS SET TARNO	مجموعة 3 قطع تارنو	\N	ASST.	\N	20.000	24.000	108	12	t	\N	2026-09-09 07:47:04.337395+00	2026-09-09 17:40:47.572826+00
28	6281	LADEAS DRESS	فستان لادياس	\N	ASST.	FREE	18.000	24.000	84	12	t	\N	2026-09-10 07:58:29.81745+00	2026-09-10 07:58:29.81745+00
29	8204	T SHIRT	تي شيرت	\N	ASST.	FREE	8.000	12.000	336	12	t	\N	2026-09-10 08:02:07.914372+00	2026-09-10 08:02:07.914372+00
31	6613	LINE SHIRT	قميص خط	\N	ASST	FREE	13.500	18.000	144	12	t	\N	2026-09-10 08:08:12.750002+00	2026-09-10 08:08:12.750002+00
32	6615	LINE SHIRT	قميص خط	\N	ASST	\N	13.500	18.000	120	12	t	\N	2026-09-10 08:09:29.616014+00	2026-09-10 08:09:29.616014+00
33	6616	SHIRT LINE	خط القميص	\N	ASST.	\N	13.500	18.000	216	12	t	\N	2026-09-10 08:10:50.603789+00	2026-09-10 08:10:50.603789+00
34	1133	SHIRT FLOWER	زهرة القميص	\N	ASST.	FREE	12.000	18.000	84	12	t	\N	2026-09-10 08:11:50.899069+00	2026-09-10 08:11:50.899069+00
35	WINTER HUDI	JACKET LONG	سترة طويلة	\N	4	L XL XXL	12.000	15.000	180	12	t	\N	2026-09-10 08:14:48.013489+00	2026-09-10 08:14:48.013489+00
36	3006	WINTER TRACKSUIT	بدلة رياضية شتوية	\N	ASST	L XL XXL	15.000	18.000	468	12	t	\N	2026-09-10 08:16:39.281033+00	2026-09-10 08:16:39.281033+00
37	K07	PLAZO PANT	بنطلون بلازو	\N	ASST	S M L XL	13.000	18.000	84	12	t	\N	2026-09-10 08:19:39.145117+00	2026-09-10 08:19:39.145117+00
38	2604	PLAZO PANT	بنطلون بلازو	\N	ASST	S M L XL	13.000	18.000	108	12	t	\N	2026-09-10 08:21:42.846602+00	2026-09-10 08:21:42.846602+00
39	6636	2PCS TARNO	2 قطعة تارنو	\N	ASST	FREE	21.000	27.000	180	12	t	\N	2026-09-10 08:24:03.207622+00	2026-09-10 08:24:03.207622+00
40	808	TIGER JUMPSUIT	بذلة النمر	\N	3	FREE	10.000	12.000	276	12	t	STOCK	2026-09-10 08:28:17.135511+00	2026-09-10 08:28:17.135511+00
41	6663	2PCS TARNO	2 قطعة تارنو	\N	ASST	FREE	20.000	27.000	348	12	t	\N	2026-09-10 08:31:55.033724+00	2026-09-10 08:31:55.033724+00
42	067	NET BLOUSE	بلوزة صافية	\N	ASST	FREE	10.000	12.000	12	12	t	\N	2026-09-10 08:33:29.780775+00	2026-09-10 08:33:29.780775+00
22	053	SHIRT L / S	قميص	\N	ASST.	FREE	13.000	15.000	60	12	t	\N	2026-09-09 08:04:54.877734+00	2026-09-10 10:14:03.126131+00
20	FMD	BLOUSE	بلوزة	\N	ASST.	FREE	6.500	7.500	96	12	t	\N	2026-09-09 07:58:08.961084+00	2026-09-10 16:57:27.222573+00
47	6666	PLAZO	بلازو	\N	3	FREE	11.000	18.000	282	12	t	\N	2026-09-10 08:48:11.481218+00	2026-09-11 07:02:52.118813+00
48	6658	2PCS SET TERNO	2 قطعة مجموعة تيرنو	\N	ASST	FREE	21.000	30.000	72	12	t	\N	2026-09-10 08:49:27.056184+00	2026-09-10 17:30:41.16773+00
46	6665	FLOWER SKIRT	تنورة زهرة	\N	4	FREE	21.000	27.000	204	12	t	\N	2026-09-10 08:42:07.314275+00	2026-09-10 16:57:27.222573+00
45	6662	2PCS TARNO	2 قطعة تارنو	\N	ASST	FREE	21.000	27.000	204	12	t	\N	2026-09-10 08:40:54.553515+00	2026-09-10 16:57:27.222573+00
52	66658	2pcs tarno	2 قطعة ترننو	\N	ASST	Free	21.000	30.000	0	12	t	\N	2026-09-10 16:51:05.634912+00	2026-09-10 17:41:40.280071+00
30	9023	PHOTO BLOUSE	بلوزة الصورة	\N	ASST	FREE	11.000	18.000	588	12	t	MIX PRINT	2026-09-10 08:04:44.118439+00	2026-09-11 07:14:44.903588+00
18	943	SKIRT BLOUSE	بلوزة تنورة	\N	ASST.	FREE	20.000	27.000	144	12	t	\N	2026-09-09 07:52:43.531081+00	2026-09-11 08:38:26.849987+00
\.


--
-- Data for Name: purchase_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_lines (id, "receiptId", "productId", dozen, pieces, "totalPcs", "unitCostKd", "lineTotalKd") FROM stdin;
1	1	49	57	0	684	11.000	627.000
2	1	50	38	6	462	11.000	423.500
\.


--
-- Data for Name: purchase_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_receipts (id, "receiptNumber", "supplierId", "shipmentContainerNo", "supplierInvoiceRef", "receiptDate", "totalPcs", "totalAmountKd", status, "receivedBy", notes, "createdAt") FROM stdin;
1	PR-2026-0001	\N	REC NO. -36251	0000931	2026-09-23	1146	1050.500	COMPLETED	Yusuf ali jath wala	\N	2026-09-10 09:01:47.416974+00
\.


--
-- Data for Name: sales_invoice_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoice_lines (id, "invoiceId", "productId", dozen, pieces, "totalPcs", "unitPriceKd", "lineTotalKd") FROM stdin;
1	1	4	1	0	12	24.000	24.000
2	2	22	1	0	12	24.000	24.000
3	3	10	1	0	12	24.000	24.000
4	4	16	1	0	12	27.000	27.000
5	4	22	1	0	12	15.000	15.000
6	5	13	1	0	12	8.000	8.000
8	7	20	1	0	12	10.000	10.000
9	7	46	1	0	12	18.000	18.000
10	7	47	1	0	12	18.000	18.000
11	7	45	1	0	12	30.000	30.000
12	7	52	1	0	12	30.000	30.000
13	8	43	0	6	6	27.000	13.500
14	8	47	0	6	6	18.000	9.000
15	9	30	1	0	12	17.000	17.000
16	10	18	2	0	24	27.000	54.000
\.


--
-- Data for Name: sales_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoices (id, "invoiceNumber", "customerId", "invoiceDate", "totalPcs", "totalAmountKd", "amountReceivedKd", "outstandingKd", "paymentStatus", "paymentMethod", "dueDate", status, notes, "createdBy", "createdAt") FROM stdin;
1	INV-2026-0001	99	2026-09-09	12	24.000	24.000	0.000	PAID	Cash	\N	CANCELLED	\N	Yusuf ali jath wala	2026-09-09 09:45:20.698767+00
2	INV-2026-0002	99	2026-09-09	12	24.000	24.000	0.000	PAID	Cash	\N	CANCELLED	\N	Yusuf ali jath wala	2026-09-09 14:50:41.759759+00
3	INV-2026-0003	38	2026-09-09	12	24.000	0.000	0.000	PENDING	\N	\N	CANCELLED	\N	Yusuf ali jath wala	2026-09-09 17:24:58.071834+00
4	INV-2026-0004	24	2026-09-09	24	42.000	42.000	0.000	PAID	Cash	\N	CANCELLED	\N	Yusuf ali jath wala	2026-09-09 17:39:21.018078+00
5	INV-2026-0005	100	2026-09-10	12	8.000	8.000	0.000	PAID	Cash	\N	POSTED	\N	Yusuf ali jath wala	2026-09-10 09:24:51.826736+00
7	INV-2026-0006	93	2026-09-10	60	106.000	106.000	0.000	PAID	Cash	\N	POSTED	\N	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
8	INV-2026-0007	104	2026-09-11	12	22.500	12.500	10.000	PARTIAL	Cash	\N	POSTED	\N	Yusuf ali jath wala	2026-09-11 07:02:52.118813+00
9	INV-2026-0008	105	2026-09-11	12	17.000	17.000	0.000	PAID	Cash	\N	POSTED	\N	Yusuf ali jath wala	2026-09-11 07:14:44.903588+00
10	INV-2026-0009	10	2026-09-11	24	54.000	0.000	54.000	PENDING	\N	\N	POSTED	\N	Yusuf ali jath wala	2026-09-11 08:38:26.849987+00
\.


--
-- Data for Name: sales_return_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_return_lines (id, "salesReturnId", "invoiceLineId", "productId", "returnDozen", "returnPieces", "returnTotalPcs", "originalUnitPriceKd", "returnLineAmountKd") FROM stdin;
\.


--
-- Data for Name: sales_returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_returns (id, "returnNumber", "invoiceId", "customerId", "returnDate", "totalReturnAmountKd", "outstandingReductionKd", "refundRequiredKd", "totalReturnPcs", "returnReason", notes, status, "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_ledger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_ledger (id, "productId", "movementDate", "quantityChangePcs", "balanceAfterPcs", "sourceType", "sourceId", "sourceReference", notes, "performedBy", "createdAt") FROM stdin;
7	4	2026-09-08 18:32:28.470672+00	102	102	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-08 18:32:28.470672+00
8	5	2026-09-09 07:13:29.246761+00	48	48	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:13:29.246761+00
9	6	2026-09-09 07:17:49.436912+00	84	84	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:17:49.436912+00
10	7	2026-09-09 07:25:11.732378+00	36	36	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:25:11.732378+00
11	8	2026-09-09 07:29:40.25032+00	24	24	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:29:40.25032+00
12	9	2026-09-09 07:33:09.207569+00	240	240	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:33:09.207569+00
13	10	2026-09-09 07:34:52.801372+00	24	24	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:34:52.801372+00
14	11	2026-09-09 07:36:03.645005+00	60	60	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:36:03.645005+00
15	12	2026-09-09 07:37:55.161401+00	180	180	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:37:55.161401+00
16	13	2026-09-09 07:40:38.806496+00	84	84	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:40:38.806496+00
17	14	2026-09-09 07:43:29.047896+00	18	18	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:43:29.047896+00
18	15	2026-09-09 07:45:13.862598+00	48	48	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:45:13.862598+00
19	16	2026-09-09 07:47:04.348188+00	108	108	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:47:04.348188+00
20	17	2026-09-09 07:48:40.067209+00	36	36	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:48:40.067209+00
21	18	2026-09-09 07:52:43.543946+00	168	168	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:52:43.543946+00
22	19	2026-09-09 07:54:48.258881+00	96	96	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:54:48.258881+00
23	20	2026-09-09 07:58:08.970032+00	108	108	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 07:58:08.970032+00
24	21	2026-09-09 08:00:17.868284+00	54	54	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:00:17.868284+00
25	22	2026-09-09 08:04:54.885766+00	60	60	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:04:54.885766+00
26	23	2026-09-09 08:07:04.470032+00	66	66	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:07:04.470032+00
27	24	2026-09-09 08:10:44.667292+00	144	144	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:10:44.667292+00
28	25	2026-09-09 08:14:03.272045+00	96	96	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:14:03.272045+00
29	26	2026-09-09 08:17:59.208409+00	132	132	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:17:59.208409+00
30	27	2026-09-09 08:23:19.488476+00	66	66	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-09 08:23:19.488476+00
31	4	2026-09-09 09:45:20.698767+00	-12	90	SALES_INVOICE	1	INV-2026-0001	Sale to HAKIM NOMAN (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-09 09:45:20.698767+00
32	4	2026-09-09 10:01:02.550932+00	12	102	SALES_INVOICE	1	CANCEL-INV-2026-0001	Invoice INV-2026-0001 cancelled — stock restored	Yusuf ali jath wala	2026-09-09 10:01:02.550932+00
33	22	2026-09-09 14:50:41.759759+00	-12	48	SALES_INVOICE	2	INV-2026-0002	Sale to HAKIM NOMAN (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-09 14:50:41.759759+00
34	22	2026-09-09 17:16:26.426718+00	12	60	SALES_INVOICE	2	CANCEL-INV-2026-0002	Invoice INV-2026-0002 cancelled — stock restored	Yusuf ali jath wala	2026-09-09 17:16:26.426718+00
35	10	2026-09-09 17:24:58.071834+00	-12	12	SALES_INVOICE	3	INV-2026-0003	Sale to ABBAS UDAIPUR (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-09 17:24:58.071834+00
36	10	2026-09-09 17:31:46.416477+00	12	24	SALES_INVOICE	3	CANCEL-INV-2026-0003	Invoice INV-2026-0003 cancelled — stock restored	Yusuf ali jath wala	2026-09-09 17:31:46.416477+00
37	16	2026-09-09 17:39:21.018078+00	-12	96	SALES_INVOICE	4	INV-2026-0004	Sale to SHANTA SIRAJ NEPALI (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-09 17:39:21.018078+00
38	22	2026-09-09 17:39:21.018078+00	-12	48	SALES_INVOICE	4	INV-2026-0004	Sale to SHANTA SIRAJ NEPALI (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-09 17:39:21.018078+00
39	16	2026-09-09 17:40:47.572826+00	12	108	SALES_INVOICE	4	CANCEL-INV-2026-0004	Invoice INV-2026-0004 cancelled — stock restored	Yusuf ali jath wala	2026-09-09 17:40:47.572826+00
40	22	2026-09-09 17:40:47.572826+00	12	60	SALES_INVOICE	4	CANCEL-INV-2026-0004	Invoice INV-2026-0004 cancelled — stock restored	Yusuf ali jath wala	2026-09-09 17:40:47.572826+00
41	28	2026-09-10 07:58:29.83184+00	84	84	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 07:58:29.83184+00
42	29	2026-09-10 08:02:07.922845+00	336	336	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:02:07.922845+00
43	30	2026-09-10 08:04:44.1275+00	600	600	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:04:44.1275+00
44	31	2026-09-10 08:08:12.77191+00	144	144	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:08:12.77191+00
45	32	2026-09-10 08:09:29.626194+00	120	120	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:09:29.626194+00
46	33	2026-09-10 08:10:50.61179+00	216	216	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:10:50.61179+00
47	34	2026-09-10 08:11:50.906276+00	84	84	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:11:50.906276+00
48	35	2026-09-10 08:14:48.021197+00	180	180	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:14:48.021197+00
49	36	2026-09-10 08:16:39.317996+00	468	468	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:16:39.317996+00
50	37	2026-09-10 08:19:39.152608+00	84	84	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:19:39.152608+00
51	38	2026-09-10 08:21:42.915705+00	108	108	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:21:42.915705+00
52	39	2026-09-10 08:24:03.214859+00	180	180	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:24:03.214859+00
53	40	2026-09-10 08:28:17.144207+00	276	276	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:28:17.144207+00
54	41	2026-09-10 08:31:55.042517+00	348	348	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:31:55.042517+00
55	42	2026-09-10 08:33:29.81561+00	12	12	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:33:29.81561+00
56	43	2026-09-10 08:37:38.12161+00	240	240	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:37:38.12161+00
57	44	2026-09-10 08:39:35.138379+00	96	96	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:39:35.138379+00
58	45	2026-09-10 08:40:54.61592+00	216	216	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:40:54.61592+00
59	46	2026-09-10 08:42:07.321944+00	216	216	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:42:07.321944+00
60	47	2026-09-10 08:48:11.501073+00	300	300	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 08:48:11.501073+00
61	49	2026-09-10 09:01:47.416974+00	684	684	RECEIVE_SHIPMENT	1	REC NO. -36251	Shipment (Direct / Local Purchase) (57 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-10 09:01:47.416974+00
62	50	2026-09-10 09:01:47.416974+00	462	462	RECEIVE_SHIPMENT	1	REC NO. -36251	Shipment (Direct / Local Purchase) (38 Doz 6 Pcs)	Yusuf ali jath wala	2026-09-10 09:01:47.416974+00
63	13	2026-09-10 09:24:51.826736+00	-12	72	SALES_INVOICE	5	INV-2026-0005	Sale to Walk-in Customer (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-10 09:24:51.826736+00
67	52	2026-09-10 16:51:05.651873+00	72	72	OPENING_BALANCE	\N	Initial Setup	Opening inventory balance	Yusuf ali jath wala	2026-09-10 16:51:05.651873+00
68	20	2026-09-10 16:57:27.222573+00	-12	96	SALES_INVOICE	7	INV-2026-0006	Sale to HAZIQ SHOP (1 Doz 0 Pcs)	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
69	46	2026-09-10 16:57:27.222573+00	-12	204	SALES_INVOICE	7	INV-2026-0006	Sale to HAZIQ SHOP (1 Doz 0 Pcs)	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
70	47	2026-09-10 16:57:27.222573+00	-12	288	SALES_INVOICE	7	INV-2026-0006	Sale to HAZIQ SHOP (1 Doz 0 Pcs)	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
71	45	2026-09-10 16:57:27.222573+00	-12	204	SALES_INVOICE	7	INV-2026-0006	Sale to HAZIQ SHOP (1 Doz 0 Pcs)	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
72	52	2026-09-10 16:57:27.222573+00	-12	60	SALES_INVOICE	7	INV-2026-0006	Sale to HAZIQ SHOP (1 Doz 0 Pcs)	Aliasgar jath wala	2026-09-10 16:57:27.222573+00
73	52	2026-09-10 17:12:23.641175+00	12	72	STOCK_ADJUSTMENT	\N	Recount	Reason: Recount	Aliasgar jath wala	2026-09-10 17:12:23.641175+00
74	48	2026-09-10 17:30:41.16773+00	72	72	STOCK_ADJUSTMENT	\N	Recount	Reason: Recount	Aliasgar jath wala	2026-09-10 17:30:41.16773+00
75	52	2026-09-10 17:41:40.280071+00	-72	0	STOCK_ADJUSTMENT	\N	Other	Reason: Other	Aliasgar jath wala	2026-09-10 17:41:40.280071+00
76	43	2026-09-11 07:02:52.118813+00	-6	234	SALES_INVOICE	8	INV-2026-0007	Sale to MADHU NILU LANKA (0 Doz 6 Pcs)	Yusuf ali jath wala	2026-09-11 07:02:52.118813+00
77	47	2026-09-11 07:02:52.118813+00	-6	282	SALES_INVOICE	8	INV-2026-0007	Sale to MADHU NILU LANKA (0 Doz 6 Pcs)	Yusuf ali jath wala	2026-09-11 07:02:52.118813+00
78	30	2026-09-11 07:14:44.903588+00	-12	588	SALES_INVOICE	9	INV-2026-0008	Sale to ABULI BHAI (1 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-11 07:14:44.903588+00
79	18	2026-09-11 08:38:26.849987+00	-24	144	SALES_INVOICE	10	INV-2026-0009	Sale to isha lanka online (2 Doz 0 Pcs)	Yusuf ali jath wala	2026-09-11 08:38:26.849987+00
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, "contactPerson", phone, country, address, "totalPayable", "isActive", "createdAt", "updatedAt") FROM stdin;
1	2PCS PLAZO	\N	+8615907550715	China	SAHU JINMA MARKET	0.000	t	2026-09-10 09:06:26.661841+00	2026-09-10 09:06:26.661841+00
2	CODRY FUSTAN	LIU YAFEI	+8618027253965	China	SAHU JINMA MARKET	0.000	t	2026-09-10 09:09:03.495156+00	2026-09-10 09:09:03.495156+00
3	ALNA BLAZER	ALINA	+8615013097909	China	LHUA MARKET	0.000	t	2026-09-10 09:10:48.595934+00	2026-09-10 09:10:48.595934+00
4	JEANS LONG JACKET& PANT	\N	+8615889957989	China	YULONG MARKET SUNYALI	0.000	t	2026-09-10 09:13:23.913155+00	2026-09-10 09:13:23.913155+00
5	PIC BLOUSE	\N	+8613129331135	China	SAHU JINMA MARKET	0.000	t	2026-09-10 09:15:44.412131+00	2026-09-10 09:15:44.412131+00
6	2PCS WINTER PAJAMA	TING	+8615967974650	China	YIWU MARKET	0.000	t	2026-09-10 09:18:31.752967+00	2026-09-10 09:18:31.752967+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, display_name, role, is_active, created_at, updated_at) FROM stdin;
1	owner1	$2b$10$nbxHm4Qk3Z6RWyUy3NB2bOPumwcRKIZcUNDCHhGeX/nOtazBDkXqS	Yusuf ali jath wala	OWNER	t	2026-09-08 07:33:40.667762	2026-09-11 11:26:26.801567
2	owner2	$2b$10$nbxHm4Qk3Z6RWyUy3NB2bOb7qMhUyxi5No7nm0nssr19i8CvAQ97K	Aliasgar jath wala	OWNER	t	2026-09-08 07:33:40.764461	2026-09-11 11:26:26.823003
3	evolixstudio@gmail.com	$2b$10$nbxHm4Qk3Z6RWyUy3NB2bOpOSm7oSAJKQsAuHqEe660aPx58ciLOe	Evolix Admin	ADMIN	t	2026-09-08 07:33:40.773958	2026-09-11 11:26:26.902485
\.


--
-- Name: audit_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_events_id_seq', 276, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: company_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_id_seq', 1, true);


--
-- Name: customer_opening_balance_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_opening_balance_adjustments_id_seq', 1, true);


--
-- Name: customer_receipt_allocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_receipt_allocations_id_seq', 1, false);


--
-- Name: customer_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_receipts_id_seq', 1, false);


--
-- Name: customer_refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_refunds_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 105, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 52, true);


--
-- Name: purchase_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_lines_id_seq', 2, true);


--
-- Name: purchase_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_receipts_id_seq', 1, true);


--
-- Name: sales_invoice_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_invoice_lines_id_seq', 16, true);


--
-- Name: sales_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_invoices_id_seq', 10, true);


--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_return_lines_id_seq', 1, false);


--
-- Name: sales_returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_returns_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: stock_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_ledger_id_seq', 79, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: company PK_056f7854a7afdba7cbd6d45fc20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY (id);


--
-- Name: settings PK_0669fe20e252eb692bf4d344975; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: purchase_lines PK_82dbfeeccbf8830ed076014dedd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_lines
    ADD CONSTRAINT "PK_82dbfeeccbf8830ed076014dedd" PRIMARY KEY (id);


--
-- Name: customer_receipts PK_83a250e247754cbe819c1e5d4f2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT "PK_83a250e247754cbe819c1e5d4f2" PRIMARY KEY (id);


--
-- Name: audit_events PK_910f64d901a5c3e9878f0d4a407; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT "PK_910f64d901a5c3e9878f0d4a407" PRIMARY KEY (id);


--
-- Name: expenses PK_94c3ceb17e3140abc9282c20610; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: sales_invoice_lines PK_aeb2029d20ce3a41df372ebd255; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_lines
    ADD CONSTRAINT "PK_aeb2029d20ce3a41df372ebd255" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: stock_ledger PK_bb04575ee2ff52f72028f669701; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_ledger
    ADD CONSTRAINT "PK_bb04575ee2ff52f72028f669701" PRIMARY KEY (id);


--
-- Name: sales_invoices PK_be0576afbf66c353a8a4435a45b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT "PK_be0576afbf66c353a8a4435a45b" PRIMARY KEY (id);


--
-- Name: purchase_receipts PK_e98baf4459530343eebf88fdbdf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipts
    ADD CONSTRAINT "PK_e98baf4459530343eebf88fdbdf" PRIMARY KEY (id);


--
-- Name: settings UQ_c8639b7626fa94ba8265628f214; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE (key);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: customer_opening_balance_adjustments customer_opening_balance_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_opening_balance_adjustments
    ADD CONSTRAINT customer_opening_balance_adjustments_pkey PRIMARY KEY (id);


--
-- Name: customer_receipt_allocations customer_receipt_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipt_allocations
    ADD CONSTRAINT customer_receipt_allocations_pkey PRIMARY KEY (id);


--
-- Name: customer_refunds customer_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_refunds
    ADD CONSTRAINT customer_refunds_pkey PRIMARY KEY (id);


--
-- Name: customer_refunds customer_refunds_refundNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_refunds
    ADD CONSTRAINT "customer_refunds_refundNumber_key" UNIQUE ("refundNumber");


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (id);


--
-- Name: sales_return_lines sales_return_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT sales_return_lines_pkey PRIMARY KEY (id);


--
-- Name: sales_returns sales_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT sales_returns_pkey PRIMARY KEY (id);


--
-- Name: sales_returns sales_returns_returnNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_returnNumber_key" UNIQUE ("returnNumber");


--
-- Name: IDX_2098860888353530d951604e1f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2098860888353530d951604e1f" ON public.customer_opening_balance_adjustments USING btree ("customerId");


--
-- Name: IDX_3362dc085414b7786495e57631; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3362dc085414b7786495e57631" ON public.stock_ledger USING btree ("productId");


--
-- Name: IDX_393bb9fcce4ad62ebc6efb2fe7; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_393bb9fcce4ad62ebc6efb2fe7" ON public.purchase_receipts USING btree ("receiptNumber");


--
-- Name: IDX_57552c177da550b3271a2cfb64; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_57552c177da550b3271a2cfb64" ON public.expenses USING btree ("expenseNumber");


--
-- Name: IDX_6249a93b3d33bc7834cd7ea389; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_6249a93b3d33bc7834cd7ea389" ON public.customer_receipts USING btree ("receiptNumber");


--
-- Name: IDX_7e9742a01a78dfda5f1527248e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7e9742a01a78dfda5f1527248e" ON public.customer_receipt_allocations USING btree ("receiptId");


--
-- Name: IDX_cc7edcca87758d59aff1636b39; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_cc7edcca87758d59aff1636b39" ON public.products USING btree ("articleNumber");


--
-- Name: IDX_cfccd59893ea43968695f259f7; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_cfccd59893ea43968695f259f7" ON public.sales_invoices USING btree ("invoiceNumber");


--
-- Name: IDX_e069bf5f4d4aaab62a84f24ca4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e069bf5f4d4aaab62a84f24ca4" ON public.expenses USING btree (category);


--
-- Name: IDX_f40f1aa3a5e074ecc2dfbe8f25; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f40f1aa3a5e074ecc2dfbe8f25" ON public.customer_receipt_allocations USING btree ("customerId");


--
-- Name: IDX_f52fb01c27607bb74ba05abf16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f52fb01c27607bb74ba05abf16" ON public.expenses USING btree ("expenseDate");


--
-- Name: idx_customer_refunds_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_refunds_customer ON public.customer_refunds USING btree ("customerId");


--
-- Name: idx_customer_refunds_return; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_refunds_return ON public.customer_refunds USING btree ("salesReturnId");


--
-- Name: idx_sales_return_lines_invoice_line; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_return_lines_invoice_line ON public.sales_return_lines USING btree ("invoiceLineId");


--
-- Name: idx_sales_return_lines_return; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_return_lines_return ON public.sales_return_lines USING btree ("salesReturnId");


--
-- Name: idx_sales_returns_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_returns_customer ON public.sales_returns USING btree ("customerId");


--
-- Name: idx_sales_returns_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_returns_invoice ON public.sales_returns USING btree ("invoiceId");


--
-- Name: uq_customer_refunds_active_return; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_customer_refunds_active_return ON public.customer_refunds USING btree ("salesReturnId") WHERE ((status)::text = 'POSTED'::text);


--
-- Name: sales_invoice_lines FK_1e9ff62650b3245f1cbb668bd27; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_lines
    ADD CONSTRAINT "FK_1e9ff62650b3245f1cbb668bd27" FOREIGN KEY ("invoiceId") REFERENCES public.sales_invoices(id) ON DELETE CASCADE;


--
-- Name: customer_opening_balance_adjustments FK_2098860888353530d951604e1fa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_opening_balance_adjustments
    ADD CONSTRAINT "FK_2098860888353530d951604e1fa" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: customer_receipts FK_286a6a8526e95115fe983d018c5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT "FK_286a6a8526e95115fe983d018c5" FOREIGN KEY ("invoiceId") REFERENCES public.sales_invoices(id) ON DELETE SET NULL;


--
-- Name: stock_ledger FK_3362dc085414b7786495e57631c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_ledger
    ADD CONSTRAINT "FK_3362dc085414b7786495e57631c" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchase_lines FK_37daea8c3e0fc90c3b85a29d941; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_lines
    ADD CONSTRAINT "FK_37daea8c3e0fc90c3b85a29d941" FOREIGN KEY ("receiptId") REFERENCES public.purchase_receipts(id) ON DELETE CASCADE;


--
-- Name: customer_receipt_allocations FK_7e9742a01a78dfda5f1527248ec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipt_allocations
    ADD CONSTRAINT "FK_7e9742a01a78dfda5f1527248ec" FOREIGN KEY ("receiptId") REFERENCES public.customer_receipts(id) ON DELETE RESTRICT;


--
-- Name: customer_receipts FK_97776b88271e070f233afe94708; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT "FK_97776b88271e070f233afe94708" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: sales_invoices FK_a6c1cffd5c82f7e41f7ec95ab43; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT "FK_a6c1cffd5c82f7e41f7ec95ab43" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: sales_invoice_lines FK_be32733f32e01ecbdc988ca4d86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_lines
    ADD CONSTRAINT "FK_be32733f32e01ecbdc988ca4d86" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: purchase_lines FK_c540bfa65f596352384a09aa7cc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_lines
    ADD CONSTRAINT "FK_c540bfa65f596352384a09aa7cc" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: purchase_receipts FK_d50c3b1f0ffc59d5116d8e3247f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_receipts
    ADD CONSTRAINT "FK_d50c3b1f0ffc59d5116d8e3247f" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: customer_receipt_allocations FK_d71ebf01e3d54910032b6f7abdf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipt_allocations
    ADD CONSTRAINT "FK_d71ebf01e3d54910032b6f7abdf" FOREIGN KEY ("invoiceId") REFERENCES public.sales_invoices(id) ON DELETE RESTRICT;


--
-- Name: customer_receipt_allocations FK_f40f1aa3a5e074ecc2dfbe8f252; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipt_allocations
    ADD CONSTRAINT "FK_f40f1aa3a5e074ecc2dfbe8f252" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: products FK_ff56834e735fa78a15d0cf21926; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: customer_refunds customer_refunds_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_refunds
    ADD CONSTRAINT "customer_refunds_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: customer_refunds customer_refunds_salesReturnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_refunds
    ADD CONSTRAINT "customer_refunds_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES public.sales_returns(id) ON DELETE RESTRICT;


--
-- Name: sales_return_lines sales_return_lines_invoiceLineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT "sales_return_lines_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES public.sales_invoice_lines(id) ON DELETE RESTRICT;


--
-- Name: sales_return_lines sales_return_lines_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT "sales_return_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: sales_return_lines sales_return_lines_salesReturnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT "sales_return_lines_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES public.sales_returns(id) ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: sales_returns sales_returns_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_returns
    ADD CONSTRAINT "sales_returns_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.sales_invoices(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict leiuLiejH9NJ07JXNSgmPh6x64YcBP2egkcRHDEhLSbXSYcH6jlStqGfeIK3K0R

