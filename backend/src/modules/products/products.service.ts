import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, DataSource } from 'typeorm';
import sharp from 'sharp';
import { Product } from '../../database/entities/product.entity.js';
import { Category } from '../../database/entities/category.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { Supplier } from '../../database/entities/supplier.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class BulkImportProductDto {
  articleNumber!: string;
  nameEn!: string;
  nameAr?: string;
  categoryName?: string;
  color?: string;
  size?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  reorderLevelPcs?: number;
  openingDozen?: number;
  openingPieces?: number;
  notes?: string;
}

export class CreateProductDto {
  articleNumber!: string;
  nameEn!: string;
  nameAr?: string;
  categoryId?: number;
  color?: string;
  size?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  reorderLevelPcs?: number;
  initialDozen?: number;
  initialPieces?: number;
  notes?: string;
}

export class UpdateProductDto {
  nameEn?: string;
  nameAr?: string;
  categoryId?: number;
  color?: string;
  size?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  reorderLevelPcs?: number;
  isActive?: boolean;
  notes?: string;
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(StockLedger)
    private readonly stockLedgerRepo: Repository<StockLedger>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Demo inventory seeding disabled for clean production deployment
  }

  private async seedInitialInventory() {
    const productCount = await this.productRepo.count();
    if (productCount > 0) return;

    // 1. Categories
    const textilesCat = await this.categoryRepo.save(
      this.categoryRepo.create({ nameEn: 'Textiles & Cotton', nameAr: 'أقمشة وقطن' }),
    );
    const scarvesCat = await this.categoryRepo.save(
      this.categoryRepo.create({ nameEn: 'Scarves & Shemagh', nameAr: 'شماغ وشالات' }),
    );
    const garmentsCat = await this.categoryRepo.save(
      this.categoryRepo.create({ nameEn: 'Ready-to-Wear', nameAr: 'ملابس جاهزة' }),
    );
    const accessoriesCat = await this.categoryRepo.save(
      this.categoryRepo.create({ nameEn: 'Accessories & Trims', nameAr: 'إكسسوارات ومستلزمات' }),
    );

    // 2. Suppliers
    const supplierCount = await this.supplierRepo.count();
    if (supplierCount === 0) {
      await this.supplierRepo.save([
        this.supplierRepo.create({
          name: 'Guangzhou Shengli Textile Co., China',
          contactPerson: 'Mr. Zhang Chen',
          phone: '+86 20 8899 1122',
          country: 'China',
          address: 'Haizhu District, Guangzhou, Guangdong, China',
          totalPayable: 0,
        }),
        this.supplierRepo.create({
          name: 'Yiwu International Wholesale Trade, China',
          contactPerson: 'Ms. Lin Mei',
          phone: '+86 579 8555 4433',
          country: 'China',
          address: 'District 4, Yiwu International Trade City, Zhejiang, China',
          totalPayable: 0,
        }),
        this.supplierRepo.create({
          name: 'Shuwaikh Central Trading Co., Kuwait',
          contactPerson: 'Abu Fahad',
          phone: '+965 2481 9900',
          country: 'Kuwait',
          address: 'Street 12, Shuwaikh Industrial 1, Kuwait',
          totalPayable: 0,
        }),
      ]);
    }

    // 3. Products with realistic Dozen + Pieces opening stock
    const sampleProducts = [
      {
        articleNumber: 'ART-101',
        nameEn: 'Pure Japanese Cotton White 58"',
        nameAr: 'قطن ياباني أبيض فاخر 58 إنش',
        categoryId: textilesCat.id,
        color: 'Pure White',
        size: '58 Inch / 30m',
        purchasePrice: 2.5,
        sellingPrice: 3.75,
        currentStockPcs: 294, // 24 Doz 6 Pcs
        reorderLevelPcs: 24,
      },
      {
        articleNumber: 'ART-102',
        nameEn: 'Embroidered Cashmere Scarf Navy',
        nameAr: 'شال كشمير مطرز كحلي ملكي',
        categoryId: scarvesCat.id,
        color: 'Navy Blue',
        size: 'Standard 200x70cm',
        purchasePrice: 4.2,
        sellingPrice: 6.5,
        currentStockPcs: 180, // 15 Doz 0 Pcs
        reorderLevelPcs: 36,
      },
      {
        articleNumber: 'ART-103',
        nameEn: 'Traditional Kuwaiti Shemagh Red/White',
        nameAr: 'شماغ كويتي أحمر وأبيض قطن 100%',
        categoryId: scarvesCat.id,
        color: 'Red & White',
        size: 'Size 58',
        purchasePrice: 1.8,
        sellingPrice: 2.75,
        currentStockPcs: 424, // 35 Doz 4 Pcs
        reorderLevelPcs: 48,
      },
      {
        articleNumber: 'ART-201',
        nameEn: 'Linen Men Kurta Cream M',
        nameAr: 'ثوب كتان رجالي سكري مقاس وسط',
        categoryId: garmentsCat.id,
        color: 'Cream',
        size: 'Medium (M)',
        purchasePrice: 5.0,
        sellingPrice: 7.5,
        currentStockPcs: 104, // 8 Doz 8 Pcs
        reorderLevelPcs: 24,
      },
      {
        articleNumber: 'ART-305',
        nameEn: 'Golden Metallic Buttons Gross',
        nameAr: 'أزرار معدنية مذهبة للثياب',
        categoryId: accessoriesCat.id,
        color: 'Gold',
        size: '18L / Gross Box',
        purchasePrice: 0.75,
        sellingPrice: 1.25,
        currentStockPcs: 18, // 1 Doz 6 Pcs (Low stock warning!)
        reorderLevelPcs: 24,
      },
      {
        articleNumber: 'ART-404',
        nameEn: 'Silk Blend Shawl Emerald Green',
        nameAr: 'شال حرير مخلوط أخضر زمردي',
        categoryId: scarvesCat.id,
        color: 'Emerald Green',
        size: 'Free Size',
        purchasePrice: 3.5,
        sellingPrice: 5.0,
        currentStockPcs: 0, // Out of stock warning!
        reorderLevelPcs: 24,
      },
    ];

    for (const p of sampleProducts) {
      const prod = await this.productRepo.save(this.productRepo.create(p));
      if (p.currentStockPcs > 0) {
        await this.stockLedgerRepo.save(
          this.stockLedgerRepo.create({
            productId: prod.id,
            quantityChangePcs: p.currentStockPcs,
            balanceAfterPcs: p.currentStockPcs,
            sourceType: 'OPENING_BALANCE',
            sourceReference: 'Opening Stock',
            notes: `Initial stock setup (${Math.floor(p.currentStockPcs / 12)} Doz ${p.currentStockPcs % 12} Pcs)`,
            performedBy: 'System Seed',
          }),
        );
      }
    }
  }

  async findAll(query?: { search?: string; categoryId?: number; lowStock?: boolean }) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.articleNumber', 'ASC');

    if (query?.search) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere(
        '(product.articleNumber ILIKE :search OR product.nameEn ILIKE :search OR product.nameAr ILIKE :search)',
        { search: s },
      );
    }

    if (query?.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query?.lowStock) {
      qb.andWhere('product.currentStockPcs <= product.reorderLevelPcs');
    }

    const items = await qb.getMany();

    return items.map((item) => this.formatProduct(item));
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return this.formatProduct(product);
  }

  async findByArticle(articleNumber: string) {
    const product = await this.productRepo.findOne({
      where: { articleNumber },
      relations: { category: true },
    });
    return product ? this.formatProduct(product) : null;
  }

  async create(dto: CreateProductDto, user: any) {
    const existing = await this.productRepo.findOne({
      where: { articleNumber: dto.articleNumber.trim() },
    });
    if (existing) {
      throw new BadRequestException(
        `Article number "${dto.articleNumber}" already exists in the system.`,
      );
    }

    const dozen = Number(dto.initialDozen || 0);
    const pcs = Number(dto.initialPieces || 0);
    const initialStockPcs = dozen * 12 + pcs;

    const product = this.productRepo.create({
      articleNumber: dto.articleNumber.trim().toUpperCase(),
      nameEn: dto.nameEn.trim(),
      nameAr: dto.nameAr?.trim() || undefined,
      categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
      color: dto.color?.trim() || undefined,
      size: dto.size?.trim() || undefined,
      purchasePrice: Number(dto.purchasePrice || 0),
      sellingPrice: Number(dto.sellingPrice || 0),
      currentStockPcs: initialStockPcs,
      reorderLevelPcs: Number(dto.reorderLevelPcs || 12),
      notes: dto.notes?.trim() || undefined,
    });

    const saved = await this.productRepo.save(product);

    // If opening stock > 0, write an initial StockLedger movement
    if (initialStockPcs > 0) {
      await this.stockLedgerRepo.save(
        this.stockLedgerRepo.create({
          productId: saved.id,
          quantityChangePcs: initialStockPcs,
          balanceAfterPcs: initialStockPcs,
          sourceType: 'OPENING_BALANCE',
          sourceReference: 'Initial Setup',
          notes: 'Opening inventory balance',
          performedBy: user?.displayName || 'System',
        }),
      );
    }

    await this.auditService.log({
      action: 'CREATE',
      entityType: 'PRODUCT',
      entityId: String(saved.id),
      performedBy: user?.displayName || 'Owner',
      details: {
        articleNumber: saved.articleNumber,
        nameEn: saved.nameEn,
        initialStockPcs,
      },
    });

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductDto, user: any) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    if (dto.nameEn !== undefined) product.nameEn = dto.nameEn.trim();
    if (dto.nameAr !== undefined) product.nameAr = dto.nameAr.trim();
    if (dto.categoryId !== undefined) product.categoryId = dto.categoryId ? Number(dto.categoryId) : undefined;
    if (dto.color !== undefined) product.color = dto.color.trim();
    if (dto.size !== undefined) product.size = dto.size.trim();
    if (dto.purchasePrice !== undefined) product.purchasePrice = Number(dto.purchasePrice);
    if (dto.sellingPrice !== undefined) product.sellingPrice = Number(dto.sellingPrice);
    if (dto.reorderLevelPcs !== undefined) product.reorderLevelPcs = Number(dto.reorderLevelPcs);
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.notes !== undefined) product.notes = dto.notes.trim();

    await this.productRepo.save(product);

    await this.auditService.log({
      action: 'UPDATE',
      entityType: 'PRODUCT',
      entityId: String(product.id),
      performedBy: user?.displayName || 'Owner',
      details: { articleNumber: product.articleNumber, changes: dto },
    });

    return this.findOne(product.id);
  }

  async delete(id: number, user: any) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    try {
      await this.productRepo.remove(product);

      await this.auditService.log({
        action: 'DELETE',
        entityType: 'PRODUCT',
        entityId: String(id),
        performedBy: user?.displayName || 'Owner',
        details: { articleNumber: product.articleNumber, reason: 'Product hard deleted' },
      });

      return { success: true, message: `Product ${id} deleted successfully` };
    } catch (error: any) {
      // TypeORM throws QueryFailedError for foreign key constraints
      if (error.code === '23503' || error.message?.includes('foreign key')) {
        throw new BadRequestException('Cannot delete product because it is being used in sales or purchases.');
      }
      throw error;
    }
  }

  async uploadImage(id: number, file: any, user: any) {
    if (!file) throw new BadRequestException('No image file provided');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Unsupported image format');

    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found.`);

    let webpBuffer: Buffer;
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      if (!metadata.format) {
        throw new Error('Not a decodable image');
      }

      // Initial optimization target
      webpBuffer = await image
        .rotate() // auto-orient based on EXIF
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ effort: 4, quality: 80 })
        .toBuffer();

      // Adaptive quality reduction if too large
      if (webpBuffer.length > 400 * 1024) {
        webpBuffer = await sharp(webpBuffer).webp({ quality: 60 }).toBuffer();
      }
    } catch (error) {
      throw new BadRequestException('Could not process this image. Please choose another image.');
    }

    product.imageData = webpBuffer;
    product.imageMimeType = 'image/webp';
    product.imageUpdatedAt = new Date();

    await this.productRepo.save(product);

    await this.auditService.log({
      action: product.imageUpdatedAt ? 'PRODUCT_IMAGE_CHANGED' : 'PRODUCT_IMAGE_ADDED',
      entityType: 'PRODUCT',
      entityId: String(product.id),
      performedBy: user?.displayName || 'Owner',
      details: { articleNumber: product.articleNumber },
    });

    return { success: true, message: 'Image uploaded successfully', imageUpdatedAt: product.imageUpdatedAt };
  }

  async getImage(id: number) {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .select(['product.id', 'product.imageData', 'product.imageMimeType', 'product.imageUpdatedAt'])
      .where('product.id = :id', { id })
      .getOne();

    if (!product || !product.imageData) {
      throw new NotFoundException('Image not found');
    }

    return {
      buffer: product.imageData,
      mimeType: product.imageMimeType || 'image/webp',
      updatedAt: product.imageUpdatedAt,
    };
  }

  async deleteImage(id: number, user: any) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found.`);

    product.imageData = null;
    product.imageMimeType = null;
    product.imageUpdatedAt = null;

    await this.productRepo.save(product);

    await this.auditService.log({
      action: 'PRODUCT_IMAGE_REMOVED',
      entityType: 'PRODUCT',
      entityId: String(product.id),
      performedBy: user?.displayName || 'Owner',
      details: { articleNumber: product.articleNumber },
    });

    return { success: true, message: 'Image removed successfully' };
  }

  // Categories
  async getCategories() {
    return this.categoryRepo.find({ order: { nameEn: 'ASC' } });
  }

  async createCategory(data: { nameEn: string; nameAr?: string }) {
    const cat = this.categoryRepo.create({
      nameEn: data.nameEn.trim(),
      nameAr: data.nameAr?.trim() || undefined,
    });
    return this.categoryRepo.save(cat);
  }

  /**
   * Bulk import products with Opening Stock in Dozen + Pieces
   * Executes in an atomic transaction to ensure data integrity.
   */
  async bulkImport(items: BulkImportProductDto[], user: any) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Import list khali hai. Kam se kam ek product hona chahiye.');
    }

    // Check duplicate article numbers in batch
    const seenArticles = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.articleNumber || !item.articleNumber.trim()) {
        throw new BadRequestException(`Row #${i + 1}: Article number required hai.`);
      }
      if (!item.nameEn || !item.nameEn.trim()) {
        throw new BadRequestException(`Row #${i + 1} (${item.articleNumber}): Product name required hai.`);
      }

      const art = item.articleNumber.trim().toUpperCase();
      if (seenArticles.has(art)) {
        throw new BadRequestException(`Duplicate article number "${art}" import list me ek se zyada baar hai.`);
      }
      seenArticles.add(art);
    }

    return this.dataSource.transaction(async (manager) => {
      // Check existing articles in database
      const existingArticles = await manager
        .createQueryBuilder(Product, 'p')
        .where('p.articleNumber IN (:...articles)', { articles: Array.from(seenArticles) })
        .getMany();

      if (existingArticles.length > 0) {
        const conflictArts = existingArticles.map((p) => p.articleNumber).join(', ');
        throw new BadRequestException(
          `Ye article numbers pehle se system me moujood hain: ${conflictArts}. Duplicate create nahi ho sakte.`,
        );
      }

      // Pre-fetch categories
      const existingCategories = await manager.find(Category);
      const categoryMap = new Map<string, Category>();
      for (const cat of existingCategories) {
        categoryMap.set(cat.nameEn.trim().toLowerCase(), cat);
      }

      let grandTotalPiecesAdded = 0;
      const savedProducts: Product[] = [];

      for (const item of items) {
        // Find or create category if provided
        let categoryId: number | undefined;
        if (item.categoryName && item.categoryName.trim()) {
          const catKey = item.categoryName.trim().toLowerCase();
          let cat = categoryMap.get(catKey);
          if (!cat) {
            cat = manager.create(Category, { nameEn: item.categoryName.trim() });
            cat = await manager.save(Category, cat);
            categoryMap.set(catKey, cat);
          }
          categoryId = cat.id;
        }

        const dozen = Math.max(0, Number(item.openingDozen || 0));
        const pieces = Math.max(0, Number(item.openingPieces || 0));
        const totalPcs = dozen * 12 + pieces;

        const purchasePrice = Math.max(0, Number(item.purchasePrice || 0));
        const sellingPrice = Math.max(0, Number(item.sellingPrice || 0));
        const reorderLevel = Math.max(0, Number(item.reorderLevelPcs || 12));

        const product = manager.create(Product, {
          articleNumber: item.articleNumber.trim().toUpperCase(),
          nameEn: item.nameEn.trim(),
          nameAr: item.nameAr?.trim() || undefined,
          categoryId,
          color: item.color?.trim() || undefined,
          size: item.size?.trim() || undefined,
          purchasePrice: Number(purchasePrice.toFixed(3)),
          sellingPrice: Number(sellingPrice.toFixed(3)),
          currentStockPcs: totalPcs,
          reorderLevelPcs: reorderLevel,
          notes: item.notes?.trim() || undefined,
        });

        const saved = await manager.save(Product, product);
        savedProducts.push(saved);

        if (totalPcs > 0) {
          grandTotalPiecesAdded += totalPcs;
          const ledger = manager.create(StockLedger, {
            productId: saved.id,
            quantityChangePcs: totalPcs,
            balanceAfterPcs: totalPcs,
            sourceType: 'OPENING_BALANCE',
            sourceReference: 'Opening Stock Import',
            notes: `Opening stock: ${dozen} Doz ${pieces} Pcs (${totalPcs} Total Pcs)`,
            performedBy: user?.displayName || 'Owner',
          });
          await manager.save(StockLedger, ledger);
        }
      }

      // Audit trail
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'OPENING_STOCK_IMPORT',
        entityId: 'BATCH',
        performedBy: user?.displayName || 'Owner',
        details: {
          totalProductsImported: savedProducts.length,
          totalPiecesAdded: grandTotalPiecesAdded,
          dozenPiecesDisplay: `${Math.floor(grandTotalPiecesAdded / 12)} Dozen ${grandTotalPiecesAdded % 12} Pcs`,
        },
      });

      return {
        success: true,
        totalImported: savedProducts.length,
        totalPiecesAdded: grandTotalPiecesAdded,
        displayDozPcs: `${Math.floor(grandTotalPiecesAdded / 12)} Doz ${grandTotalPiecesAdded % 12} Pcs (${grandTotalPiecesAdded} Total Pcs)`,
        products: savedProducts.map((p) => this.formatProduct(p)),
      };
    });
  }

  /** Helper to append Dozen + Pieces breakdown to product responses */
  public formatProduct(product: Product) {
    const stockPcs = Number(product.currentStockPcs || 0);
    const dozen = Math.floor(stockPcs / 12);
    const pieces = stockPcs % 12;
    const isLowStock = stockPcs <= Number(product.reorderLevelPcs || 12);

    return {
      ...product,
      purchasePrice: Number(product.purchasePrice || 0),
      sellingPrice: Number(product.sellingPrice || 0),
      stockBreakdown: {
        dozen,
        pieces,
        totalPcs: stockPcs,
        displayDozPcs: `${dozen} Doz ${pieces} Pcs`,
      },
      isLowStock,
      hasImage: !!product.imageUpdatedAt,
      imageUpdatedAt: product.imageUpdatedAt,
      status: stockPcs <= 0 ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
    };
  }
}
