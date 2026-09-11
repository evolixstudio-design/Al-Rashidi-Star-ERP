import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import {
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
  BulkImportProductDto,
} from './products.service.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.productsService.findAll({
      search,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      lowStock: lowStock === 'true',
    });
  }

  @Get('by-article/:articleNumber')
  async getByArticle(@Param('articleNumber') articleNumber: string) {
    return this.productsService.findByArticle(articleNumber);
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  async createProduct(@Body() dto: CreateProductDto, @Request() req: any) {
    return this.productsService.create(dto, req.user);
  }

  @Post('bulk-import')
  async bulkImport(
    @Body() body: { items: BulkImportProductDto[] },
    @Request() req: any,
  ) {
    return this.productsService.bulkImport(body.items, req.user);
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.productsService.update(id, dto, req.user);
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productsService.delete(id, req.user);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    return this.productsService.uploadImage(id, file, req.user);
  }

  @Get(':id/image')
  @Header('Cache-Control', 'public, max-age=31536000')
  @Header('X-Content-Type-Options', 'nosniff')
  async getImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const image = await this.productsService.getImage(id);
    res.setHeader('Content-Type', image.mimeType);
    res.send(image.buffer);
  }

  @Delete(':id/image')
  async deleteImage(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.productsService.deleteImage(id, req.user);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Post()
  async createCategory(@Body() body: { nameEn: string; nameAr?: string }) {
    return this.productsService.createCategory(body);
  }
}
