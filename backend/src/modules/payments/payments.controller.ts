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
import { PaymentsService, ReceivePaymentDto } from './payments.service.js';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.paymentsService.findByCustomer(customerId);
  }

  @Post()
  async receivePayment(@Body() dto: ReceivePaymentDto, @Request() req: any) {
    return this.paymentsService.receivePayment(dto, req.user);
  }
}
