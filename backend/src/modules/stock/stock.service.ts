import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class AdjustStockDto {
  productId!: number;
  dozen?: number;
  pieces?: number;
  type!: 'ADD' | 'REMOVE';
  reason!: string; // Recount, Damage, Shortage, Return, Other
  notes?: string;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockLedger)
    private readonly stockLedgerRepo: Repository<StockLedger>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async getLedger(query?: { productId?: number; limit?: number }) {
    const qb = this.stockLedgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.product', 'product')
      .orderBy('ledger.id', 'DESC')
      .take(query?.limit || 50);

    if (query?.productId) {
      qb.andWhere('ledger.productId = :productId', { productId: query.productId });
    }

    const items = await qb.getMany();

    return items.map((item) => {
      const changePcs = Number(item.quantityChangePcs);
      const absPcs = Math.abs(changePcs);
      const doz = Math.floor(absPcs / 12);
      const rem = absPcs % 12;

      return {
        ...item,
        quantityChangeDisplay: `${changePcs >= 0 ? '+' : '-'}${doz} Doz ${rem} Pcs (${changePcs >= 0 ? '+' : ''}${changePcs} Pcs)`,
        balanceAfterDisplay: `${Math.floor(item.balanceAfterPcs / 12)} Doz ${item.balanceAfterPcs % 12} Pcs (${item.balanceAfterPcs} Total Pcs)`,
      };
    });
  }

  async adjustStock(dto: AdjustStockDto, user: any) {
    const dozen = Number(dto.dozen || 0);
    const pieces = Number(dto.pieces || 0);
    const totalPcs = dozen * 12 + pieces;

    if (totalPcs <= 0) {
      throw new BadRequestException('Adjustment quantity must be greater than zero.');
    }

    if (!dto.reason || dto.reason.trim() === '') {
      throw new BadRequestException('A reason for stock adjustment is required.');
    }

    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${dto.productId} not found.`);
      }

      const signedChange = dto.type === 'ADD' ? totalPcs : -totalPcs;
      const newStock = Number(product.currentStockPcs) + signedChange;

      if (newStock < 0) {
        throw new BadRequestException(
          `Cannot reduce stock by ${totalPcs} Pcs. Current stock is only ${product.currentStockPcs} Pcs.`,
        );
      }

      product.currentStockPcs = newStock;
      await manager.save(Product, product);

      const noteText = `Reason: ${dto.reason.trim()}${dto.notes ? ' • Notes: ' + dto.notes.trim() : ''}`;

      const ledger = manager.create(StockLedger, {
        productId: product.id,
        quantityChangePcs: signedChange,
        balanceAfterPcs: newStock,
        sourceType: 'STOCK_ADJUSTMENT',
        sourceReference: dto.reason.trim(),
        notes: noteText,
        performedBy: user?.displayName || 'Owner',
      });
      await manager.save(StockLedger, ledger);

      await this.auditService.log({
        action: 'UPDATE',
        entityType: 'STOCK_ADJUSTMENT',
        entityId: String(product.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          articleNumber: product.articleNumber,
          type: dto.type,
          quantityChangePcs: signedChange,
          balanceAfterPcs: newStock,
          reason: dto.reason,
        },
      });

      return {
        product: {
          id: product.id,
          articleNumber: product.articleNumber,
          nameEn: product.nameEn,
          currentStockPcs: newStock,
          stockBreakdown: {
            dozen: Math.floor(newStock / 12),
            pieces: newStock % 12,
            totalPcs: newStock,
          },
        },
        movement: ledger,
      };
    });
  }
}
