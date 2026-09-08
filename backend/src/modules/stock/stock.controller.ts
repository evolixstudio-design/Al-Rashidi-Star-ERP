import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { StockService, AdjustStockDto } from './stock.service.js';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('ledger')
  async getLedger(
    @Query('productId') productId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.getLedger({
      productId: productId ? parseInt(productId, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('adjust')
  async adjustStock(@Body() dto: AdjustStockDto, @Request() req: any) {
    return this.stockService.adjustStock(dto, req.user);
  }
}
