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
import { SalesReturn } from './src/database/entities/sales-return.entity.js';
import { SalesReturnLine } from './src/database/entities/sales-return-line.entity.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [
    SalesInvoice, SalesInvoiceLine, PurchaseReceipt, PurchaseLine, 
    Product, Customer, CustomerReceipt, Expense, SalesReturn, SalesReturnLine
  ],
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected');
    
    const invoiceRepo = AppDataSource.getRepository(SalesInvoice);
    const invoiceLineRepo = AppDataSource.getRepository(SalesInvoiceLine);
    const purchaseRepo = AppDataSource.getRepository(PurchaseReceipt);
    const purchaseLineRepo = AppDataSource.getRepository(PurchaseLine);
    const productRepo = AppDataSource.getRepository(Product);
    const customerRepo = AppDataSource.getRepository(Customer);
    const receiptRepo = AppDataSource.getRepository(CustomerReceipt);
    const expenseRepo = AppDataSource.getRepository(Expense);

    const today = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = today.substring(0, 7);
    const monthStart = `${currentMonthPrefix}-01`;

    console.log('Testing todaySalesRaw...');
    const todaySalesRaw = await invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.totalAmountKd)', 'total')
      .addSelect('COUNT(inv.id)', 'count')
      .where('inv.status = :status', { status: 'POSTED' })
      .andWhere('inv.invoiceDate = :today', { today })
      .getRawOne();
    console.log('todaySalesRaw:', todaySalesRaw);

    console.log('Testing pendingCustomersRaw...');
    const pendingCustomersRaw = await customerRepo
      .createQueryBuilder('cust')
      .select('SUM(cust.totalOutstanding)', 'total')
      .addSelect('COUNT(cust.id)', 'count')
      .where('cust.totalOutstanding > 0')
      .getRawOne();
    console.log('pendingCustomersRaw:', pendingCustomersRaw);

    console.log('Testing monthCogsLines...');
    const monthCogsLines = await invoiceLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.invoice', 'inv')
      .innerJoinAndSelect('line.product', 'prod')
      .where('inv.status = :status', { status: 'POSTED' })
      .andWhere('inv.invoiceDate >= :monthStart', { monthStart })
      .andWhere('inv.invoiceDate <= :today', { today })
      .getMany();
    console.log(`monthCogsLines count: ${monthCogsLines.length}`);

    console.log('All tests passed!');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
