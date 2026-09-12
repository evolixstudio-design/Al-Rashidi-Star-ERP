import { DataSource } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    await AppDataSource.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageData" BYTEA;`);
    console.log('Added imageData column');
    
    await AppDataSource.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageMimeType" character varying(50);`);
    console.log('Added imageMimeType column');
    
    await AppDataSource.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageUpdatedAt" TIMESTAMP;`);
    console.log('Added imageUpdatedAt column');
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Error during Data Source initialization or migration:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
