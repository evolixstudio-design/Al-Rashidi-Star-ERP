import 'dotenv/config';
import { DataSource } from 'typeorm';

import { SalesInvoice } from './src/database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from './src/database/entities/sales-invoice-line.entity.js';
import { PurchaseReceipt } from './src/database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from './src/database/entities/purchase-line.entity.js';
import { Product } from './src/database/entities/product.entity.js';
import { Customer } from './src/database/entities/customer.entity.js';
import { CustomerReceipt } from './src/database/entities/customer-receipt.entity.js';
import { Expense } from './src/database/entities/expense.entity.js';
import { Supplier } from './src/database/entities/supplier.entity.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [
    SalesInvoice, SalesInvoiceLine, PurchaseReceipt, PurchaseLine, 
    Product, Customer, CustomerReceipt, Expense, Supplier
  ],
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected');
    
    const invoiceRepo = AppDataSource.getRepository(SalesInvoice);
    const receiptRepo = AppDataSource.getRepository(CustomerReceipt);
    const purchaseRepo = AppDataSource.getRepository(PurchaseReceipt);
    const expenseRepo = AppDataSource.getRepository(Expense);
    const customerRepo = AppDataSource.getRepository(Customer);

    console.log('Testing getPendingPayments...');
    const customers = await customerRepo
      .createQueryBuilder('cust')
      .leftJoinAndSelect('cust.invoices', 'inv')
      .where('cust.totalOutstanding > 0')
      .orderBy('cust.totalOutstanding', 'DESC')
      .take(5)
      .getMany();
    console.log(`Success! Found ${customers.length} pending customers.`);

    console.log('Testing getRecentTransactions...');
    const invoices = await invoiceRepo.find({ relations: { customer: true }, order: { createdAt: 'DESC' }, take: 10 });
    const receipts = await receiptRepo.find({ relations: { customer: true }, order: { createdAt: 'DESC' }, take: 10 });
    const purchases = await purchaseRepo.find({ relations: { supplier: true }, order: { createdAt: 'DESC' }, take: 10 });
    const expenses = await expenseRepo.find({ order: { createdAt: 'DESC' }, take: 10 });
    console.log(`Success! Invoices: ${invoices.length}, Receipts: ${receipts.length}, Purchases: ${purchases.length}, Expenses: ${expenses.length}`);

    console.log('All tests passed!');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
