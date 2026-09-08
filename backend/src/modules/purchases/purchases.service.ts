import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseReceipt } from '../../database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from '../../database/entities/purchase-line.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { Supplier } from '../../database/entities/supplier.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class ReceiveShipmentItemDto {
  productId?: number;
  articleNumber?: string;
  nameEn?: string;
  dozen!: number;
  pieces!: number;
  unitCostKd!: number;
}

export class ReceiveShipmentDto {
  supplierId?: number | null;
  shipmentContainerNo?: string;
  supplierInvoiceRef?: string;
  receiptDate?: string;
  notes?: string;
  items!: ReceiveShipmentItemDto[];
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseReceipt)
    private readonly receiptRepo: Repository<PurchaseReceipt>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const receipts = await this.receiptRepo
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.supplier', 'supplier')
      .leftJoinAndSelect('receipt.lines', 'lines')
      .leftJoinAndSelect('lines.product', 'product')
      .orderBy('receipt.id', 'DESC')
      .getMany();

    return receipts.map((r) => this.formatReceipt(r));
  }

  async findOne(id: number) {
    const receipt = await this.receiptRepo.findOne({
      where: { id },
      relations: { supplier: true, lines: { product: true } },
    });
    if (!receipt) {
      throw new NotFoundException(`Purchase receipt with ID ${id} not found.`);
    }
    return this.formatReceipt(receipt);
  }

  async receiveShipment(dto: ReceiveShipmentDto, user: any) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Shipment must contain at least one product line.');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      let supplier: Supplier | null = null;
      if (dto.supplierId) {
        supplier = await manager.findOne(Supplier, {
          where: { id: dto.supplierId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!supplier) {
          throw new NotFoundException(`Supplier with ID ${dto.supplierId} not found.`);
        }
      }

      // Generate next receipt number: PR-YYYY-XXXX
      const currentYear = new Date().getFullYear();
      const count = await manager.count(PurchaseReceipt);
      const receiptNumber = `PR-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      let grandTotalPcs = 0;
      let grandTotalAmountKd = 0;
      const linesToSave: PurchaseLine[] = [];
      const stockLedgersToSave: StockLedger[] = [];

      for (const item of dto.items) {
        const dozen = Number(item.dozen || 0);
        const pieces = Number(item.pieces || 0);
        const totalPcs = dozen * 12 + pieces;
        const unitCostKd = Number(item.unitCostKd || 0);
        
        // Cost is per dozen: dozQty = dozen + (pieces / 12)
        const dozQty = dozen + (pieces / 12);
        const lineTotalKd = dozQty * unitCostKd;

        if (totalPcs <= 0) {
          throw new BadRequestException(
            `Product line has zero total quantity. Provide dozen or pieces.`,
          );
        }

        // Find or create product
        let product: Product | null = null;
        if (item.productId) {
          product = await manager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });
        } else if (item.articleNumber) {
          product = await manager.findOne(Product, {
            where: { articleNumber: item.articleNumber.trim().toUpperCase() },
            lock: { mode: 'pessimistic_write' },
          });
        }

        if (!product) {
          const artNum = item.articleNumber?.trim().toUpperCase() || `ART-${Date.now().toString().slice(-4)}`;
          const prodName = item.nameEn?.trim() || `Product ${artNum}`;
          product = manager.create(Product, {
            articleNumber: artNum,
            nameEn: prodName,
            purchasePrice: unitCostKd,
            sellingPrice: unitCostKd > 0 ? Number((unitCostKd * 1.3).toFixed(3)) : 0,
            currentStockPcs: 0,
            reorderLevelPcs: 12,
          });
          product = await manager.save(Product, product);
        } else {
          // Update purchase price if provided
          if (unitCostKd > 0) {
            product.purchasePrice = unitCostKd;
          }
        }

        // Increment stock balance
        const prevStock = Number(product.currentStockPcs || 0);
        const newStock = prevStock + totalPcs;
        product.currentStockPcs = newStock;
        await manager.save(Product, product);

        grandTotalPcs += totalPcs;
        grandTotalAmountKd += lineTotalKd;

        // Line record
        const line = manager.create(PurchaseLine, {
          productId: product.id,
          dozen,
          pieces,
          totalPcs,
          unitCostKd,
          lineTotalKd: Number(lineTotalKd.toFixed(3)),
        });
        linesToSave.push(line);

        // Stock ledger movement
        const ledger = manager.create(StockLedger, {
          productId: product.id,
          quantityChangePcs: totalPcs,
          balanceAfterPcs: newStock,
          sourceType: 'RECEIVE_SHIPMENT',
          sourceReference: dto.shipmentContainerNo || receiptNumber,
          notes: `Shipment ${supplier ? `from ${supplier.name}` : '(Direct / Local Purchase)'} (${dozen} Doz ${pieces} Pcs)`,
          performedBy: user?.displayName || 'Owner',
        });
        stockLedgersToSave.push(ledger);
      }

      // Create Receipt header
      const receipt = manager.create(PurchaseReceipt, {
        receiptNumber,
        supplierId: supplier ? supplier.id : null,
        shipmentContainerNo: dto.shipmentContainerNo?.trim() || undefined,
        supplierInvoiceRef: dto.supplierInvoiceRef?.trim() || undefined,
        receiptDate: dto.receiptDate || new Date().toISOString().split('T')[0],
        totalPcs: grandTotalPcs,
        totalAmountKd: Number(grandTotalAmountKd.toFixed(3)),
        status: 'COMPLETED',
        receivedBy: user?.displayName || 'Owner',
        notes: dto.notes?.trim() || undefined,
      });

      const savedReceipt = await manager.save(PurchaseReceipt, receipt);

      // Save lines with receipt reference
      for (const line of linesToSave) {
        line.receiptId = savedReceipt.id;
        await manager.save(PurchaseLine, line);
      }

      // Save stock movements with receipt id
      for (const ledger of stockLedgersToSave) {
        ledger.sourceId = savedReceipt.id;
        await manager.save(StockLedger, ledger);
      }

      // Update supplier balance payable (if supplier linked)
      if (supplier) {
        supplier.totalPayable = Number((Number(supplier.totalPayable || 0) + grandTotalAmountKd).toFixed(3));
        await manager.save(Supplier, supplier);
      }

      // Audit log
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'RECEIVE_SHIPMENT',
        entityId: String(savedReceipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          receiptNumber: savedReceipt.receiptNumber,
          supplierName: supplier ? supplier.name : 'Direct / Local Purchase',
          containerNo: savedReceipt.shipmentContainerNo,
          totalPcs: grandTotalPcs,
          totalAmountKd: grandTotalAmountKd,
          itemCount: linesToSave.length,
        },
      });

      return savedReceipt.id;
    });

    return this.findOne(savedId);
  }

  async cancelReceipt(id: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const receipt = await manager.findOne(PurchaseReceipt, {
        where: { id },
        relations: { lines: { product: true }, supplier: true },
      });

      if (!receipt) {
        throw new NotFoundException(`Purchase receipt with ID ${id} not found.`);
      }

      if (receipt.status === 'CANCELLED') {
        throw new BadRequestException('Purchase receipt is already cancelled.');
      }

      // Check sufficient stock exists to reverse this receipt without going negative
      if (receipt.lines) {
        for (const line of receipt.lines) {
          const product = await manager.findOne(Product, {
            where: { id: line.productId },
            lock: { mode: 'pessimistic_write' },
          });
          if (product) {
            const currentStock = Number(product.currentStockPcs || 0);
            const deductPcs = Number(line.totalPcs || 0);
            if (currentStock < deductPcs) {
              throw new BadRequestException(
                `Cannot cancel purchase: product "${product.nameEn}" (${product.articleNumber}) only has ${currentStock} Pcs in stock, but ${deductPcs} Pcs were received. Some stock has already been sold.`,
              );
            }
          }
        }

        // Now reverse stock for each product
        for (const line of receipt.lines) {
          const product = await manager.findOne(Product, {
            where: { id: line.productId },
            lock: { mode: 'pessimistic_write' },
          });
          if (product) {
            const currentStock = Number(product.currentStockPcs || 0);
            const deductPcs = Number(line.totalPcs || 0);
            const newStock = currentStock - deductPcs;
            product.currentStockPcs = newStock;
            await manager.save(Product, product);

            // Reversal stock ledger entry
            const ledger = manager.create(StockLedger, {
              productId: product.id,
              quantityChangePcs: -deductPcs,
              balanceAfterPcs: newStock,
              sourceType: 'RECEIVE_SHIPMENT',
              sourceId: receipt.id,
              sourceReference: `CANCEL-${receipt.receiptNumber}`,
              notes: `Purchase ${receipt.receiptNumber} cancelled — stock reversed`,
              performedBy: user?.displayName || 'Owner',
            });
            await manager.save(StockLedger, ledger);
          }
        }
      }

      // Reverse supplier payable balance safely (handling payments and ensuring non-negative balance)
      let payableDeducted = 0;
      let paymentCreditRemaining = 0;
      if (receipt.supplier && receipt.supplierId) {
        const supplier = await manager.findOne(Supplier, {
          where: { id: receipt.supplierId },
          lock: { mode: 'pessimistic_write' },
        });
        if (supplier) {
          const currentPayable = Number(supplier.totalPayable || 0);
          const receiptTotal = Number(receipt.totalAmountKd || 0);

          if (currentPayable >= receiptTotal) {
            supplier.totalPayable = Number((currentPayable - receiptTotal).toFixed(3));
            payableDeducted = receiptTotal;
          } else {
            // Payments were already made towards supplier
            payableDeducted = currentPayable;
            paymentCreditRemaining = Number((receiptTotal - currentPayable).toFixed(3));
            supplier.totalPayable = 0;
          }
          await manager.save(Supplier, supplier);
        }
      }

      // Mark receipt as CANCELLED
      receipt.status = 'CANCELLED';
      await manager.save(PurchaseReceipt, receipt);

      // Audit log
      await this.auditService.log({
        action: 'CANCEL',
        entityType: 'PURCHASE_RECEIPT',
        entityId: String(receipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          receiptNumber: receipt.receiptNumber,
          totalAmountKd: Number(receipt.totalAmountKd),
          supplierName: receipt.supplier?.name,
          payableDeducted,
          paymentCreditRemaining,
          reason: 'Purchase receipt cancelled and reversed',
        },
      });

      return receipt.id;
    });

    return this.findOne(id);
  }

  private formatReceipt(receipt: PurchaseReceipt) {
    const totalPcs = Number(receipt.totalPcs || 0);
    const dozen = Math.floor(totalPcs / 12);
    const pieces = totalPcs % 12;

    return {
      ...receipt,
      totalAmountKd: Number(receipt.totalAmountKd || 0),
      totalPcsBreakdown: {
        dozen,
        pieces,
        totalPcs,
        display: `${dozen} Doz ${pieces} Pcs`,
      },
      lines: receipt.lines?.map((line) => {
        const linePcs = Number(line.totalPcs || 0);
        return {
          ...line,
          unitCostKd: Number(line.unitCostKd || 0),
          lineTotalKd: Number(line.lineTotalKd || 0),
          displayBreakdown: `${line.dozen} Doz ${line.pieces} Pcs (${linePcs} Pcs)`,
        };
      }),
    };
  }
}
