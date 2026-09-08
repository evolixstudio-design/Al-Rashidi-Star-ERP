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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { PurchasesService, ReceiveShipmentDto } from './purchases.service.js';

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  async getPurchases() {
    return this.purchasesService.findAll();
  }

  @Get(':id')
  async getPurchase(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @Post()
  async receiveShipment(@Body() dto: ReceiveShipmentDto, @Request() req: any) {
    return this.purchasesService.receiveShipment(dto, req.user);
  }

  @Post('receive')
  async receiveShipmentAlias(@Body() dto: ReceiveShipmentDto, @Request() req: any) {
    return this.purchasesService.receiveShipment(dto, req.user);
  }

  @Post(':id/cancel')
  async cancelPurchase(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.purchasesService.cancelReceipt(id, req.user);
  }
}
