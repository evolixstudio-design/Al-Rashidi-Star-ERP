import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService, CreateCustomerDto, UpdateCustomerDto, AdjustOpeningBalanceDto } from './customers.service.js';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll() {
    return this.customersService.findAll();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.customersService.search(q);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Get(':id/pending-invoices')
  async getPendingInvoices(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.getPendingInvoices(id);
  }

  @Get(':id/ledger')
  async getLedger(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.getLedger(id);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto, @Request() req: any) {
    return this.customersService.create(dto, req.user);
  }

  @Post('bulk-import')
  async bulkImport(@Body() items: any[], @Request() req: any) {
    return this.customersService.bulkImport(items, req.user);
  }

  @Post(':id/opening-balance')
  async adjustOpeningBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustOpeningBalanceDto,
    @Request() req: any,
  ) {
    return this.customersService.adjustOpeningBalance(id, dto, req.user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
    @Request() req: any,
  ) {
    return this.customersService.update(id, dto, req.user);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.customersService.delete(id, req.user);
  }
}
