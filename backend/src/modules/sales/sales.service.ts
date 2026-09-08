import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class InvoiceLineDto {
  productId!: number;
  dozen!: number;
  pieces!: number;
  unitPriceKd!: number;
}

export class CreateInvoiceDto {
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  invoiceDate!: string;
  paymentStatus!: 'PAID' | 'PARTIAL' | 'PENDING';
  paymentMethod?: string;
  amountReceivedKd?: number;
  dueDate?: string;
  notes?: string;
  items!: InvoiceLineDto[];
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const invoices = await this.invoiceRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.customer', 'customer')
      .leftJoinAndSelect('inv.lines', 'lines')
      .leftJoinAndSelect('lines.product', 'product')
      .orderBy('inv.id', 'DESC')
      .getMany();

    return invoices.map((inv) => this.formatInvoice(inv));
  }

  async findOne(id: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: { customer: true, lines: { product: true } },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }
    return this.formatInvoice(invoice);
  }

  async createInvoice(dto: CreateInvoiceDto, user: any) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Invoice must contain at least one product line.');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      let customer: Customer | null = null;

      if (dto.customerId) {
        customer = await manager.findOne(Customer, {
          where: { id: dto.customerId },
          lock: { mode: 'pessimistic_write' },
        });
      }

      if (!customer) {
        const custName = dto.customerName?.trim() || 'Walk-in Customer';
        customer = await manager.findOne(Customer, {
          where: { name: custName },
          lock: { mode: 'pessimistic_write' },
        });

        if (!customer) {
          customer = manager.create(Customer, {
            name: custName,
            phone: dto.customerPhone?.trim() || undefined,
            address: dto.customerAddress?.trim() || undefined,
            totalSales: 0,
            totalReceived: 0,
            totalOutstanding: 0,
          });
          customer = await manager.save(Customer, customer);
        } else if (dto.customerPhone?.trim() && !customer.phone) {
          customer.phone = dto.customerPhone.trim();
          await manager.save(Customer, customer);
        }
      }

      // Generate next invoice number: INV-YYYY-XXXX
      const currentYear = new Date().getFullYear();
      const count = await manager.count(SalesInvoice);
      const invoiceNumber = `INV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      let grandTotalPcs = 0;
      let grandTotalAmountKd = 0;
      const linesToSave: SalesInvoiceLine[] = [];
      const stockLedgersToSave: StockLedger[] = [];

      for (const item of dto.items) {
        const dozen = Number(item.dozen || 0);
        const pieces = Number(item.pieces || 0);
        const totalPcs = dozen * 12 + pieces;
        const unitPriceKd = Number(item.unitPriceKd || 0);
        
        // Price is per dozen: dozQty = dozen + (pieces / 12)
        const dozQty = dozen + (pieces / 12);
        const lineTotalKd = dozQty * unitPriceKd;

        if (totalPcs <= 0) {
          throw new BadRequestException('Each line must have a quantity greater than zero.');
        }

        if (unitPriceKd <= 0) {
          throw new BadRequestException('Selling price must be greater than zero.');
        }

        // Find product and lock for stock update
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found.`);
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.nameEn}" (${product.articleNumber}) is inactive and cannot be sold.`,
          );
        }

        // Check sufficient stock — no negative stock allowed
        const currentStock = Number(product.currentStockPcs || 0);
        if (currentStock < totalPcs) {
          const availDoz = Math.floor(currentStock / 12);
          const availPcs = currentStock % 12;
          throw new BadRequestException(
            `Insufficient stock for "${product.nameEn}" (${product.articleNumber}). ` +
            `Available: ${availDoz} Doz ${availPcs} Pcs (${currentStock} Pcs). ` +
            `Requested: ${dozen} Doz ${pieces} Pcs (${totalPcs} Pcs).`,
          );
        }

        // Deduct stock
        const newStock = currentStock - totalPcs;
        product.currentStockPcs = newStock;
        await manager.save(Product, product);

        grandTotalPcs += totalPcs;
        grandTotalAmountKd += lineTotalKd;

        // Invoice line
        const line = manager.create(SalesInvoiceLine, {
          productId: product.id,
          dozen,
          pieces,
          totalPcs,
          unitPriceKd,
          lineTotalKd: Number(lineTotalKd.toFixed(3)),
        });
        linesToSave.push(line);

        // Stock ledger movement (negative for sale)
        const ledger = manager.create(StockLedger, {
          productId: product.id,
          quantityChangePcs: -totalPcs,
          balanceAfterPcs: newStock,
          sourceType: 'SALES_INVOICE',
          sourceReference: invoiceNumber,
          notes: `Sale to ${customer.name} (${dozen} Doz ${pieces} Pcs)`,
          performedBy: user?.displayName || 'Owner',
        });
        stockLedgersToSave.push(ledger);
      }

      // Calculate payment amounts
      grandTotalAmountKd = Number(grandTotalAmountKd.toFixed(3));
      let amountReceivedKd = 0;
      let outstandingKd = grandTotalAmountKd;
      let paymentStatus = dto.paymentStatus;

      if (paymentStatus === 'PAID') {
        amountReceivedKd = grandTotalAmountKd;
        outstandingKd = 0;
      } else if (paymentStatus === 'PARTIAL') {
        amountReceivedKd = Number(dto.amountReceivedKd || 0);
        if (amountReceivedKd <= 0 || amountReceivedKd >= grandTotalAmountKd) {
          throw new BadRequestException(
            'Partial payment amount must be greater than 0 and less than the total invoice amount.',
          );
        }
        outstandingKd = Number((grandTotalAmountKd - amountReceivedKd).toFixed(3));
      } else {
        // PENDING
        amountReceivedKd = 0;
        outstandingKd = grandTotalAmountKd;
      }

      // Create invoice
      const invoice = manager.create(SalesInvoice, {
        invoiceNumber,
        customerId: customer.id,
        invoiceDate: dto.invoiceDate || new Date().toISOString().split('T')[0],
        totalPcs: grandTotalPcs,
        totalAmountKd: grandTotalAmountKd,
        amountReceivedKd,
        outstandingKd,
        paymentStatus,
        paymentMethod: dto.paymentMethod?.trim() || undefined,
        dueDate: dto.dueDate || undefined,
        status: 'POSTED',
        notes: dto.notes?.trim() || undefined,
        createdBy: user?.displayName || 'Owner',
      });

      const savedInvoice = await manager.save(SalesInvoice, invoice);

      // Save lines
      for (const line of linesToSave) {
        line.invoiceId = savedInvoice.id;
        await manager.save(SalesInvoiceLine, line);
      }

      // Save stock movements
      for (const ledger of stockLedgersToSave) {
        ledger.sourceId = savedInvoice.id;
        await manager.save(StockLedger, ledger);
      }

      // Update customer balances
      customer.totalSales = Number((Number(customer.totalSales || 0) + grandTotalAmountKd).toFixed(3));
      customer.totalReceived = Number((Number(customer.totalReceived || 0) + amountReceivedKd).toFixed(3));
      customer.totalOutstanding = Number((Number(customer.totalOutstanding || 0) + outstandingKd).toFixed(3));
      await manager.save(Customer, customer);

      // Audit log
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'SALES_INVOICE',
        entityId: String(savedInvoice.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          invoiceNumber: savedInvoice.invoiceNumber,
          customerName: customer.name,
          totalPcs: grandTotalPcs,
          totalAmountKd: grandTotalAmountKd,
          paymentStatus,
          amountReceivedKd,
          outstandingKd,
          itemCount: linesToSave.length,
        },
      });

      return savedInvoice.id;
    });

    return this.findOne(savedId);
  }

  async cancelInvoice(id: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(SalesInvoice, {
        where: { id },
        relations: { lines: { product: true }, customer: true },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found.`);
      }

      if (invoice.status === 'CANCELLED') {
        throw new BadRequestException('Invoice is already cancelled.');
      }

      // Reverse stock for each line
      if (invoice.lines) {
        for (const line of invoice.lines) {
          const product = await manager.findOne(Product, {
            where: { id: line.productId },
            lock: { mode: 'pessimistic_write' },
          });
          if (product) {
            const prevStock = Number(product.currentStockPcs || 0);
            const newStock = prevStock + Number(line.totalPcs);
            product.currentStockPcs = newStock;
            await manager.save(Product, product);

            // Reversal stock ledger entry
            const ledger = manager.create(StockLedger, {
              productId: product.id,
              quantityChangePcs: Number(line.totalPcs),
              balanceAfterPcs: newStock,
              sourceType: 'SALES_INVOICE',
              sourceId: invoice.id,
              sourceReference: `CANCEL-${invoice.invoiceNumber}`,
              notes: `Invoice ${invoice.invoiceNumber} cancelled — stock restored`,
              performedBy: user?.displayName || 'Owner',
            });
            await manager.save(StockLedger, ledger);
          }
        }
      }

      // Reverse customer balances
      if (invoice.customer) {
        const customer = await manager.findOne(Customer, {
          where: { id: invoice.customerId },
          lock: { mode: 'pessimistic_write' },
        });
        if (customer) {
          customer.totalSales = Number((Number(customer.totalSales || 0) - Number(invoice.totalAmountKd)).toFixed(3));
          customer.totalReceived = Number((Number(customer.totalReceived || 0) - Number(invoice.amountReceivedKd)).toFixed(3));
          customer.totalOutstanding = Number((Number(customer.totalOutstanding || 0) - Number(invoice.outstandingKd)).toFixed(3));
          // Prevent negative balances
          if (customer.totalSales < 0) customer.totalSales = 0;
          if (customer.totalReceived < 0) customer.totalReceived = 0;
          if (customer.totalOutstanding < 0) customer.totalOutstanding = 0;
          await manager.save(Customer, customer);
        }
      }

      // Mark invoice as cancelled
      invoice.status = 'CANCELLED';
      invoice.outstandingKd = 0;
      await manager.save(SalesInvoice, invoice);

      await this.auditService.log({
        action: 'CANCEL',
        entityType: 'SALES_INVOICE',
        entityId: String(invoice.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          invoiceNumber: invoice.invoiceNumber,
          totalAmountKd: Number(invoice.totalAmountKd),
          reason: 'Invoice cancelled',
        },
      });

      return invoice.id;
    });

    return this.findOne(id);
  }

  async deleteInvoice(id: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(SalesInvoice, {
        where: { id },
        relations: { lines: { product: true }, customer: true },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${id} not found.`);
      }

      // If not already cancelled, we need to reverse stock and balances first
      if (invoice.status !== 'CANCELLED') {
        // Reverse stock for each line
        if (invoice.lines) {
          for (const line of invoice.lines) {
            const product = await manager.findOne(Product, {
              where: { id: line.productId },
              lock: { mode: 'pessimistic_write' },
            });
            if (product) {
              const prevStock = Number(product.currentStockPcs || 0);
              const newStock = prevStock + Number(line.totalPcs);
              product.currentStockPcs = newStock;
              await manager.save(Product, product);

              const ledger = manager.create(StockLedger, {
                productId: product.id,
                quantityChangePcs: Number(line.totalPcs),
                balanceAfterPcs: newStock,
                sourceType: 'SALES_INVOICE',
                sourceId: invoice.id,
                sourceReference: `DELETE-${invoice.invoiceNumber}`,
                notes: `Invoice ${invoice.invoiceNumber} deleted — stock restored`,
                performedBy: user?.displayName || 'Owner',
              });
              await manager.save(StockLedger, ledger);
            }
          }
        }

        // Reverse customer balances
        if (invoice.customer) {
          const customer = await manager.findOne(Customer, {
            where: { id: invoice.customerId },
            lock: { mode: 'pessimistic_write' },
          });
          if (customer) {
            customer.totalSales = Number((Number(customer.totalSales || 0) - Number(invoice.totalAmountKd)).toFixed(3));
            customer.totalReceived = Number((Number(customer.totalReceived || 0) - Number(invoice.amountReceivedKd)).toFixed(3));
            customer.totalOutstanding = Number((Number(customer.totalOutstanding || 0) - Number(invoice.outstandingKd)).toFixed(3));
            if (customer.totalSales < 0) customer.totalSales = 0;
            if (customer.totalReceived < 0) customer.totalReceived = 0;
            if (customer.totalOutstanding < 0) customer.totalOutstanding = 0;
            await manager.save(Customer, customer);
          }
        }
      }

      // We should safely remove ledger entries pointing to this sourceId first if there is a constraint,
      // but in this app StockLedger sourceType and sourceId are loose references (no FK constraint).
      await manager.remove(SalesInvoice, invoice);

      await this.auditService.log({
        action: 'DELETE',
        entityType: 'SALES_INVOICE',
        entityId: String(id),
        performedBy: user?.displayName || 'Owner',
        details: {
          invoiceNumber: invoice.invoiceNumber,
          totalAmountKd: Number(invoice.totalAmountKd),
          reason: 'Invoice hard deleted',
        },
      });
    });
    return { success: true, message: `Invoice ${id} deleted successfully` };
  }

  private formatInvoice(invoice: SalesInvoice) {
    const totalPcs = Number(invoice.totalPcs || 0);
    const dozen = Math.floor(totalPcs / 12);
    const pieces = totalPcs % 12;

    return {
      ...invoice,
      grandTotalAmountKd: Number(invoice.totalAmountKd || 0),
      totalAmountKd: Number(invoice.totalAmountKd || 0),
      amountReceivedKd: Number(invoice.amountReceivedKd || 0),
      amountOutstandingKd: Number(invoice.outstandingKd || 0),
      outstandingKd: Number(invoice.outstandingKd || 0),
      invoiceStatus: invoice.status,
      totalPcsBreakdown: {
        dozen,
        pieces,
        totalPcs,
        display: `${dozen} Doz ${pieces} Pcs`,
      },
      lines: invoice.lines?.map((line) => {
        const linePcs = Number(line.totalPcs || 0);
        return {
          ...line,
          unitPriceKd: Number(line.unitPriceKd || 0),
          lineTotalKd: Number(line.lineTotalKd || 0),
          displayBreakdown: `${line.dozen} Doz ${line.pieces} Pcs (${linePcs} Pcs)`,
        };
      }),
    };
  }
}
