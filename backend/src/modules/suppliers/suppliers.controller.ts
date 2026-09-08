import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SuppliersService, CreateSupplierDto, UpdateSupplierDto } from './suppliers.service.js';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async getSuppliers() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  async getSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  async createSupplier(@Body() dto: CreateSupplierDto, @Request() req: any) {
    return this.suppliersService.create(dto, req.user);
  }

  @Post('bulk-import')
  async bulkImport(@Body() items: any[], @Request() req: any) {
    return this.suppliersService.bulkImport(items, req.user);
  }

  @Put(':id')
  async updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
    @Request() req: any,
  ) {
    return this.suppliersService.update(id, dto, req.user);
  }

  @Delete(':id')
  async deleteSupplier(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.suppliersService.delete(id, req.user);
  }
}
