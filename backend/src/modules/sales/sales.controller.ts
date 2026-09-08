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
import { AuthGuard } from '@nestjs/passport';
import { SalesService, CreateInvoiceDto } from './sales.service.js';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Post()
  async createInvoice(@Body() dto: CreateInvoiceDto, @Request() req: any) {
    return this.salesService.createInvoice(dto, req.user);
  }

  @Post(':id/cancel')
  async cancelInvoice(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.salesService.cancelInvoice(id, req.user);
  }
}
