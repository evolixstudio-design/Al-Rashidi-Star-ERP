import 'dotenv/config';
import { DataSource } from 'typeorm';
import { PurchaseReceipt } from './src/database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from './src/database/entities/purchase-line.entity.js';
import { Supplier } from './src/database/entities/supplier.entity.js';
import { Product } from './src/database/entities/product.entity.js';
import { Category } from './src/database/entities/category.entity.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [PurchaseReceipt, PurchaseLine, Supplier, Product, Category],
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to DB.');
    
    const purchaseRepo = AppDataSource.getRepository(PurchaseReceipt);

    const fromDate = '2026-09-01';
    const toDate = '2026-09-12';

    console.log(`Querying purchases between ${fromDate} and ${toDate}...`);
    
    const count = await purchaseRepo.count({
      where: {} // count all
    });
    console.log(`Total purchases in entire DB: ${count}`);

    const allPurchases = await purchaseRepo.find();
    if (allPurchases.length > 0) {
      console.log('Date of the single purchase:', allPurchases[0].receiptDate);
    }
      

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
