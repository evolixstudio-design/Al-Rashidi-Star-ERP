import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Product } from './src/database/entities/product.entity.js';
import { Category } from './src/database/entities/category.entity.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [Product, Category],
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected');
    
    const productRepo = AppDataSource.getRepository(Product);

    console.log('Testing getLowStock query...');
    const products = await productRepo
      .createQueryBuilder('prod')
      .where('prod.currentStockPcs <= prod.reorderLevelPcs')
      .andWhere('prod.isActive = true')
      .orderBy('prod.currentStockPcs', 'ASC')
      .take(5)
      .getMany();
      
    console.log(`Success! Found ${products.length} low stock products.`);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
