import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { User } from '../../database/entities/user.entity.js';
import { Company } from '../../database/entities/company.entity.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  async getCompany() {
    return this.settingsService.getCompany();
  }

  @Put('company')
  async updateCompany(
    @Body() body: Partial<Company>,
    @CurrentUser() user: User,
  ) {
    return this.settingsService.updateCompany(body, user.username);
  }

  @Get()
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() body: { value: any },
    @CurrentUser() user: User,
  ) {
    return this.settingsService.setSetting(key, body.value, user.username);
  }
}
