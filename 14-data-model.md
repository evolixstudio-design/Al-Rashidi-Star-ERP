# Data Model

## Core entities

Company, User, Customer, Supplier, Category, Product, StockLedger, PurchaseReceipt, PurchaseLine, SalesInvoice, SalesInvoiceLine, CustomerReceipt, SupplierPayment, Expense, Attachment, AuditEvent, Settings.

Optional future entities may include PurchaseOrder and SalesOrder, but neither is required in the default Version 1 daily workflow.

## User model

There are two owner user records with equal full application access. Keep separate identities for audit history.

## Product and stock

- Product has unique article number.
- Base quantity is stored as integer total pieces.
- Human-readable dozen/piece values are calculated from total pieces using 12 pieces per dozen.
- Stock balance is derived from stock ledger movements or maintained with transactional consistency plus ledger reconciliation.

## Purchase relationships

PurchaseReceipt has supplier, reference, date, totals and one or more PurchaseLine records. Posting creates positive StockLedger entries.

## Sales relationships

SalesInvoice has customer, payment status, totals and one or more SalesInvoiceLine records. Posting creates negative StockLedger entries.

## Payment relationships

CustomerReceipt may allocate fully or partially to one or more pending invoices. Invoice outstanding equals invoice total minus allocated valid receipts/reversals.

## Money

Use fixed decimal values suitable for Kuwaiti Dinar precision. Never use floating-point arithmetic for money.

## Audit

Every sensitive record contains created_by / updated_by where appropriate and audit events for posting, cancellation, reversal, price change, stock adjustment and printing.
