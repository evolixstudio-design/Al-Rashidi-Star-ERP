import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service.js';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  async getSalesSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getSalesSummary(from, to);
  }

  @Get('purchase-summary')
  async getPurchaseSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getPurchaseSummary(from, to);
  }

  @Get('stock-valuation')
  async getStockValuation() {
    return this.reportsService.getStockValuation();
  }

  @Get('customer-outstanding')
  async getCustomerOutstanding() {
    return this.reportsService.getCustomerOutstanding();
  }

  @Get('expense-summary')
  async getExpenseSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getExpenseSummary(from, to);
  }

  @Get('profit-loss')
  async getProfitLoss(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getProfitLoss(from, to);
  }
}
