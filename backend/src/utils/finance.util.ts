import { EntityManager } from 'typeorm';
import { SalesInvoice } from '../database/entities/sales-invoice.entity.js';
import { Customer } from '../database/entities/customer.entity.js';
import { SalesReturn } from '../database/entities/sales-return.entity.js';
import { CustomerRefund } from '../database/entities/customer-refund.entity.js';
import { CustomerReceipt } from '../database/entities/customer-receipt.entity.js';

export const toFils = (kd: number | string): number => Math.round(Number(kd) * 1000);
export const toKd = (fils: number): number => Number((fils / 1000).toFixed(3));

/**
 * Deterministic integer HALF-UP calculation for partial pieces.
 */
export function calculatePartialReturnFils(pricePerDozenFils: number, returnPcs: number): number {
  // numerator = pricePerDozenFils * returnPcs
  // roundedFils = floor((numerator + 6) / 12)
  const numerator = BigInt(pricePerDozenFils) * BigInt(returnPcs);
  const rounded = (numerator + 6n) / 12n;
  return Number(rounded);
}

/**
 * Reconciles the invoice financial state and updates the invoice record.
 */
export async function reconcileInvoiceFinancials(
  invoiceId: number,
  manager: EntityManager,
): Promise<SalesInvoice> {
  const invoice = await manager.findOne(SalesInvoice, { where: { id: invoiceId } });
  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

  // 1. Calculate Returned = SUM(POSTED SalesReturn.totalReturnAmountKd)
  const returnsResult = await manager
    .createQueryBuilder(SalesReturn, 'sr')
    .select('COALESCE(SUM(sr.totalReturnAmountKd), 0)', 'total')
    .where('sr.invoiceId = :invoiceId', { invoiceId })
    .andWhere('sr.status = :status', { status: 'POSTED' })
    .getRawOne();

  const returnedFils = toFils(returnsResult.total);

  // 2. Calculate Refunded = SUM(POSTED CustomerRefund.amountKd) for this invoice's returns
  const refundsResult = await manager
    .createQueryBuilder(CustomerRefund, 'cr')
    .innerJoin('cr.salesReturn', 'sr')
    .select('COALESCE(SUM(cr.amountKd), 0)', 'total')
    .where('sr.invoiceId = :invoiceId', { invoiceId })
    .andWhere('cr.status = :status', { status: 'POSTED' })
    .getRawOne();

  const refundedFils = toFils(refundsResult.total);

  const grossSaleFils = toFils(invoice.totalAmountKd);
  const netSaleFils = grossSaleFils - returnedFils;

  const grossReceivedFils = toFils(invoice.amountReceivedKd);
  const netReceivedFils = grossReceivedFils - refundedFils;

  const outstandingFils = Math.max(netSaleFils - netReceivedFils, 0);
  const refundDueFils = Math.max(netReceivedFils - netSaleFils, 0);

  invoice.totalReturnedKd = toKd(returnedFils);
  invoice.totalRefundedKd = toKd(refundedFils);
  invoice.outstandingKd = toKd(outstandingFils);

  // Determine Payment Status
  if (outstandingFils > 0 && netReceivedFils === 0) {
    invoice.paymentStatus = 'PENDING';
  } else if (outstandingFils > 0 && netReceivedFils > 0) {
    invoice.paymentStatus = 'PARTIAL';
  } else if (outstandingFils === 0) {
    invoice.paymentStatus = 'PAID';
  }

  await manager.save(SalesInvoice, invoice);
  return invoice;
}

/**
 * Reconciles the customer financial state.
 */
export async function reconcileCustomerFinancials(
  customerId: number,
  manager: EntityManager,
): Promise<Customer> {
  const customer = await manager.findOne(Customer, { where: { id: customerId } });
  if (!customer) throw new Error(`Customer ${customerId} not found`);

  // SUM(POSTED invoices totalAmountKd)
  const invoicesResult = await manager
    .createQueryBuilder(SalesInvoice, 'inv')
    .select('COALESCE(SUM(inv.totalAmountKd), 0)', 'total')
    .addSelect('COALESCE(SUM(inv.outstandingKd), 0)', 'outstanding')
    .where('inv.customerId = :customerId', { customerId })
    .andWhere('inv.status = :status', { status: 'POSTED' })
    .getRawOne();

  // SUM(POSTED Sales Returns totalReturnAmountKd)
  const returnsResult = await manager
    .createQueryBuilder(SalesReturn, 'sr')
    .select('COALESCE(SUM(sr.totalReturnAmountKd), 0)', 'total')
    .where('sr.customerId = :customerId', { customerId })
    .andWhere('sr.status = :status', { status: 'POSTED' })
    .getRawOne();

  // SUM(POSTED Customer Receipts amountKd)
  const receiptsResult = await manager
    .createQueryBuilder(CustomerReceipt, 'cr')
    .select('COALESCE(SUM(cr.amountKd), 0)', 'total')
    .where('cr.customerId = :customerId', { customerId })
    .andWhere('cr.status = :status', { status: 'POSTED' })
    .getRawOne();

  // SUM(POSTED Customer Refunds amountKd)
  const refundsResult = await manager
    .createQueryBuilder(CustomerRefund, 'ref')
    .select('COALESCE(SUM(ref.amountKd), 0)', 'total')
    .where('ref.customerId = :customerId', { customerId })
    .andWhere('ref.status = :status', { status: 'POSTED' })
    .getRawOne();

  const totalSalesFils = toFils(invoicesResult.total) - toFils(returnsResult.total);
  const totalReceivedFils = toFils(receiptsResult.total) - toFils(refundsResult.total);
  const invoiceOutstandingFils = toFils(invoicesResult.outstanding);
  const openingOutstandingFils = toFils(customer.openingOutstandingKd || 0);

  customer.totalSales = toKd(totalSalesFils);
  customer.totalReceived = toKd(totalReceivedFils);
  customer.totalOutstanding = toKd(openingOutstandingFils + invoiceOutstandingFils);

  await manager.save(Customer, customer);
  return customer;
}
