import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('trends')
  async getTrends(@Query('period') period?: string) {
    return this.dashboardService.getTrends(period || '7d');
  }

  @Get('pending-payments')
  async getPendingPayments(@Query('limit') limit?: string) {
    return this.dashboardService.getPendingPayments(limit ? parseInt(limit, 10) : 5);
  }

  @Get('low-stock')
  async getLowStock(@Query('limit') limit?: string) {
    return this.dashboardService.getLowStock(limit ? parseInt(limit, 10) : 5);
  }

  @Get('recent-transactions')
  async getRecentTransactions(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentTransactions(limit ? parseInt(limit, 10) : 10);
  }
}
