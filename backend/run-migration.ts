import { DataSource } from 'typeorm';

const databaseUrl = "postgresql://neondb_owner:npg_hJCe9Rq0aBGj@ep-odd-rain-b3eddtev-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

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
