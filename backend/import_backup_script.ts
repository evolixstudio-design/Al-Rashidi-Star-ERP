import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';
import { BackupService } from './src/modules/backup/backup.service.js';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const backupService = app.get(BackupService);
  
  const payloadStr = fs.readFileSync(path.join(process.cwd(), 'backup_data.json'), 'utf8');
  const payload = JSON.parse(payloadStr);

  try {
    console.log('Restoring JSON snapshot...');
    const result = await backupService.restoreJsonSnapshot(payload, { username: 'SystemAdmin' });
    console.log('Restore completed successfully.', result);
  } catch (error) {
    console.error('Error restoring data:', error);
  } finally {
    await app.close();
  }
}

run();
