import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminOnlyGuard } from '../../common/guards/admin-only.guard.js';
import { BackupService } from './backup.service.js';

@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create-dump')
  async createPgDump(@Request() req: any) {
    return this.backupService.createPgDump(req.user);
  }

  @Get('export-json')
  async exportJson(@Request() req: any) {
    return this.backupService.exportJsonSnapshot(req.user);
  }

  @Post('restore-json')
  async restoreJson(@Body() payload: any, @Request() req: any) {
    return this.backupService.restoreJsonSnapshot(payload, req.user);
  }

  @Get('list')
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Get('download/:fileName')
  async downloadBackup(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = this.backupService.getBackupFilePath(fileName);
    return res.download(filePath, fileName);
  }

  @Get('disaster-recovery-guide')
  async getGuide() {
    return this.backupService.getDisasterRecoveryGuide();
  }
}
