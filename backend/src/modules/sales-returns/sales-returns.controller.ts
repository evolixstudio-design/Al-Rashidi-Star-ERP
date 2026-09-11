import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { SalesReturnsService, CreateSalesReturnDto, ProcessRefundDto } from './sales-returns.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('sales-returns')
@UseGuards(JwtAuthGuard)
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Get()
  async findAll() {
    return this.salesReturnsService.findAll();
  }

  @Get('invoice/:invoiceId')
  async findByInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.salesReturnsService.findByInvoice(invoiceId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesReturnsService.findOne(id);
  }

  @Post()
  async createReturn(@Body() dto: CreateSalesReturnDto, @Request() req: any) {
    return this.salesReturnsService.createReturn(dto, req.user);
  }

  @Post(':id/refund')
  async processRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessRefundDto,
    @Request() req: any,
  ) {
    return this.salesReturnsService.processRefund(id, dto, req.user);
  }

  @Post(':id/cancel')
  async cancelReturn(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.salesReturnsService.cancelReturn(id, req.user);
  }

  @Post('refunds/:id/cancel')
  async cancelRefund(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.salesReturnsService.cancelRefund(id, req.user);
  }
}
