import 'dotenv/config';
import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';
const ssl = isProduction ? { rejectUnauthorized: false } : false;

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl,
  extra: {
    max: 1,
  },
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('--- READ-ONLY ANALYSIS OF INFLATED BULK IMPORTS ---');

    // Find customers whose totalSales == totalOutstanding and have no invoices
    const results = await AppDataSource.query(`
      SELECT 
        id, 
        name, 
        "totalSales", 
        "totalOutstanding"
      FROM customers 
      WHERE "totalSales" > 0 
        AND "totalSales" = "totalOutstanding" 
        AND id NOT IN (SELECT "customerId" FROM sales_invoices)
    `);

    if (results.length === 0) {
      console.log('No suspect bulk-imported customers found.');
    } else {
      console.table(results.map((r: any) => ({
        'Customer ID': r.id,
        'Name': r.name,
        'Current totalSales': r.totalSales,
        'Current totalOutstanding': r.totalOutstanding,
        'Status': 'POSSIBLE CANDIDATE for correction',
      })));
      console.log('\nNOTE: These are POSSIBLE candidates. Verify against source records before making manual adjustments.');
      console.log('NO ROW UPDATES HAVE BEEN EXECUTED.');
    }

  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

run();
