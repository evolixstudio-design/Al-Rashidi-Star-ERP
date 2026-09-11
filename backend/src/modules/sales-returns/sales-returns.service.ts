import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { SalesReturn } from '../../database/entities/sales-return.entity.js';
import { SalesReturnLine } from '../../database/entities/sales-return-line.entity.js';
import { CustomerRefund } from '../../database/entities/customer-refund.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { DocumentSequence } from '../../database/entities/document-sequence.entity.js';
import { AuditService } from '../audit/audit.service.js';
import { reconcileInvoiceFinancials, reconcileCustomerFinancials, toFils, toKd, calculatePartialReturnFils } from '../../utils/finance.util.js';

export class ReturnLineDto {
  invoiceLineId!: number;
  returnDozen!: number;
  returnPieces!: number;
}

export class CreateSalesReturnDto {
  invoiceId!: number;
  returnDate!: string;
  returnReason!: string;
  notes?: string;
  lines!: ReturnLineDto[];
}

export class ProcessRefundDto {
  refundMethod!: string;
  refundDate!: string;
  notes?: string;
}

@Injectable()
export class SalesReturnsService {
  constructor(
    @InjectRepository(SalesReturn)
    private readonly returnRepo: Repository<SalesReturn>,
    @InjectRepository(CustomerRefund)
    private readonly refundRepo: Repository<CustomerRefund>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const returns = await this.returnRepo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.customer', 'customer')
      .leftJoinAndSelect('sr.invoice', 'invoice')
      .leftJoinAndSelect('sr.lines', 'lines')
      .leftJoinAndSelect('lines.product', 'product')
      .orderBy('sr.id', 'DESC')
      .getMany();

    return returns.map((r) => this.formatReturn(r));
  }

  async findOne(id: number) {
    const salesReturn = await this.returnRepo.findOne({
      where: { id },
      relations: { 
        customer: true, 
        invoice: true, 
        lines: { product: true, invoiceLine: true },
        refunds: true 
      },
    });
    if (!salesReturn) {
      throw new NotFoundException(`Sales Return with ID ${id} not found.`);
    }
    return this.formatReturn(salesReturn);
  }

  async findByInvoice(invoiceId: number) {
    const returns = await this.returnRepo.find({
      where: { invoiceId },
      relations: { customer: true, invoice: true },
      order: { createdAt: 'DESC' },
    });
    return returns.map((r) => this.formatReturn(r));
  }

  private async generateNextSequence(manager: EntityManager, sequenceType: string, prefix: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const sequenceId = `${sequenceType}:${currentYear}`;
    
    // Use raw query with ON CONFLICT DO UPDATE for atomic increment
    const res = await manager.query(`
      INSERT INTO document_sequences (id, "nextValue") 
      VALUES ($1, 2) 
      ON CONFLICT (id) 
      DO UPDATE SET "nextValue" = document_sequences."nextValue" + 1 
      RETURNING "nextValue" - 1 as "currentValue"
    `, [sequenceId]);
    
    const value = res[0].currentValue;
    return `${prefix}-${currentYear}-${String(value).padStart(4, '0')}`;
  }

  async createReturn(dto: CreateSalesReturnDto, user: any) {
    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('Return must contain at least one line.');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      // 1. Lock invoice
      const invoice = await manager.findOne(SalesInvoice, {
        where: { id: dto.invoiceId },
        relations: { lines: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) throw new NotFoundException(`Invoice ID ${dto.invoiceId} not found.`);
      if (invoice.status === 'CANCELLED') throw new BadRequestException('Cannot return items on a cancelled invoice.');

      // 2. Lock customer
      const customer = await manager.findOne(Customer, {
        where: { id: invoice.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) throw new InternalServerErrorException('Invoice customer not found.');

      const returnNumber = await this.generateNextSequence(manager, 'SALES_RETURN', 'SR');

      let grandTotalReturnPcs = 0;
      let grandTotalReturnAmountFils = 0;
      const linesToSave: SalesReturnLine[] = [];
      const stockLedgersToSave: StockLedger[] = [];

      // Validate lines and calculate exact amounts
      for (const reqLine of dto.lines) {
        const returnDozen = Number(reqLine.returnDozen || 0);
        const returnPieces = Number(reqLine.returnPieces || 0);
        const returnTotalPcs = returnDozen * 12 + returnPieces;

        if (returnTotalPcs <= 0) continue; // Skip zero-quantity lines

        const invLine = invoice.lines!.find(l => l.id === reqLine.invoiceLineId);
        if (!invLine) throw new BadRequestException(`Invoice line ID ${reqLine.invoiceLineId} not found in this invoice.`);

        // Find how many pcs are ALREADY returned for this invoice line (POSTED only)
        const previousReturns = await manager.createQueryBuilder(SalesReturnLine, 'srl')
          .innerJoin('srl.salesReturn', 'sr')
          .select('COALESCE(SUM(srl.returnTotalPcs), 0)', 'total')
          .where('srl.invoiceLineId = :lineId', { lineId: invLine.id })
          .andWhere('sr.status = :status', { status: 'POSTED' })
          .getRawOne();
          
        const alreadyReturnedPcs = Number(previousReturns.total || 0);
        const remainingPcs = Number(invLine.totalPcs) - alreadyReturnedPcs;

        if (returnTotalPcs > remainingPcs) {
          throw new BadRequestException(`Cannot return ${returnTotalPcs} pcs for line ID ${invLine.id}. Only ${remainingPcs} pcs remain returnable.`);
        }

        // Exact original price per dozen
        const pricePerDozenFils = toFils(invLine.unitPriceKd);
        let returnLineAmountFils = 0;

        if (alreadyReturnedPcs + returnTotalPcs === Number(invLine.totalPcs)) {
          // Final quantity rule: remainder of line total
          const previousReturnAmounts = await manager.createQueryBuilder(SalesReturnLine, 'srl')
            .innerJoin('srl.salesReturn', 'sr')
            .select('COALESCE(SUM(srl.returnLineAmountKd), 0)', 'total')
            .where('srl.invoiceLineId = :lineId', { lineId: invLine.id })
            .andWhere('sr.status = :status', { status: 'POSTED' })
            .getRawOne();
            
          const alreadyReturnedFils = toFils(previousReturnAmounts.total);
          const originalLineTotalFils = toFils(invLine.lineTotalKd);
          returnLineAmountFils = originalLineTotalFils - alreadyReturnedFils;
        } else {
          // Normal partial return calculation
          returnLineAmountFils = calculatePartialReturnFils(pricePerDozenFils, returnTotalPcs);
        }

        grandTotalReturnPcs += returnTotalPcs;
        grandTotalReturnAmountFils += returnLineAmountFils;

        // Lock product
        const product = await manager.findOne(Product, {
          where: { id: invLine.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) throw new InternalServerErrorException(`Product ID ${invLine.productId} not found.`);

        // Add to stock
        const currentStock = Number(product.currentStockPcs || 0);
        const newStock = currentStock + returnTotalPcs;
        product.currentStockPcs = newStock;
        await manager.save(Product, product);

        linesToSave.push(manager.create(SalesReturnLine, {
          invoiceLineId: invLine.id,
          productId: product.id,
          returnDozen,
          returnPieces,
          returnTotalPcs,
          originalUnitPriceKd: invLine.unitPriceKd,
          returnLineAmountKd: toKd(returnLineAmountFils),
        }));

        stockLedgersToSave.push(manager.create(StockLedger, {
          productId: product.id,
          quantityChangePcs: returnTotalPcs, // positive for return
          balanceAfterPcs: newStock,
          sourceType: 'SALES_RETURN',
          sourceReference: returnNumber,
          notes: `Sales Return from Invoice ${invoice.invoiceNumber}`,
          performedBy: user?.displayName || 'Owner',
        }));
      }

      if (grandTotalReturnPcs <= 0) {
        throw new BadRequestException('No valid quantities to return.');
      }

      // Calculate Outstanding Reduction & Refund Required
      const grossSaleFils = toFils(invoice.totalAmountKd);
      const grossReceivedFils = toFils(invoice.amountReceivedKd);
      const netSaleBeforeReturnFils = grossSaleFils - toFils(invoice.totalReturnedKd || 0);
      const netReceivedBeforeFils = grossReceivedFils - toFils(invoice.totalRefundedKd || 0);
      
      const currentOutstandingFils = Math.max(0, netSaleBeforeReturnFils - netReceivedBeforeFils);
      
      const outstandingReductionFils = Math.min(grandTotalReturnAmountFils, currentOutstandingFils);
      const refundRequiredFils = Math.max(0, grandTotalReturnAmountFils - outstandingReductionFils);

      // Create Return
      const salesReturn = manager.create(SalesReturn, {
        returnNumber,
        invoiceId: invoice.id,
        customerId: customer.id,
        returnDate: dto.returnDate || new Date().toISOString().split('T')[0],
        totalReturnAmountKd: toKd(grandTotalReturnAmountFils),
        outstandingReductionKd: toKd(outstandingReductionFils),
        refundRequiredKd: toKd(refundRequiredFils),
        totalReturnPcs: grandTotalReturnPcs,
        returnReason: dto.returnReason || 'CUSTOMER_RETURN',
        notes: dto.notes?.trim(),
        status: 'POSTED',
        createdBy: user?.displayName || 'Owner',
      });

      const savedReturn = await manager.save(SalesReturn, salesReturn);

      // Save related
      for (const line of linesToSave) {
        line.salesReturnId = savedReturn.id;
        await manager.save(SalesReturnLine, line);
      }
      for (const ledger of stockLedgersToSave) {
        ledger.sourceId = savedReturn.id;
        await manager.save(StockLedger, ledger);
      }

      // Reconcile globally
      await reconcileInvoiceFinancials(invoice.id, manager);
      await reconcileCustomerFinancials(customer.id, manager);

      // Audit
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'SALES_RETURN',
        entityId: String(savedReturn.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          returnNumber,
          invoiceNumber: invoice.invoiceNumber,
          totalReturnAmountKd: toKd(grandTotalReturnAmountFils),
          refundRequiredKd: toKd(refundRequiredFils),
          totalReturnPcs: grandTotalReturnPcs,
        },
      });

      return savedReturn.id;
    });

    return this.findOne(savedId);
  }

  async processRefund(returnId: number, dto: ProcessRefundDto, user: any) {
    const savedId = await this.dataSource.transaction(async (manager) => {
      // 1. Lock Sales Return
      const salesReturn = await manager.findOne(SalesReturn, {
        where: { id: returnId },
        relations: { invoice: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!salesReturn) throw new NotFoundException(`Sales Return ID ${returnId} not found.`);
      if (salesReturn.status !== 'POSTED') throw new BadRequestException('Sales Return is not POSTED.');

      // Check if refund already exists
      const existingRefund = await manager.findOne(CustomerRefund, {
        where: { salesReturnId: returnId, status: 'POSTED' }
      });
      if (existingRefund) {
        throw new BadRequestException('A POSTED refund already exists for this Sales Return.');
      }

      // Lock Customer
      const customer = await manager.findOne(Customer, {
        where: { id: salesReturn.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) throw new InternalServerErrorException('Customer not found.');

      // RECALCULATE EXACT REFUND AMOUNT AT REFUND TIME based on authoritative formula
      // Refund Due = MAX(Net Received - Net Sale, 0)
      const invoice = salesReturn.invoice;
      const grossSaleFils = toFils(invoice.totalAmountKd);
      const grossReceivedFils = toFils(invoice.amountReceivedKd);
      const returnedFils = toFils(invoice.totalReturnedKd);
      const refundedFils = toFils(invoice.totalRefundedKd);
      
      const netSaleFils = grossSaleFils - returnedFils;
      const netReceivedFils = grossReceivedFils - refundedFils;
      
      const refundDueFils = Math.max(0, netReceivedFils - netSaleFils);

      if (refundDueFils <= 0) {
        throw new BadRequestException('No refund is due for this invoice according to current financial state.');
      }

      const refundNumber = await this.generateNextSequence(manager, 'CUSTOMER_REFUND', 'RF');

      const refund = manager.create(CustomerRefund, {
        refundNumber,
        salesReturnId: salesReturn.id,
        customerId: customer.id,
        amountKd: toKd(refundDueFils),
        refundMethod: dto.refundMethod || 'CASH',
        refundDate: dto.refundDate || new Date().toISOString().split('T')[0],
        notes: dto.notes?.trim(),
        status: 'POSTED',
        performedBy: user?.displayName || 'Owner',
      });

      const savedRefund = await manager.save(CustomerRefund, refund);

      // Reconcile globally
      await reconcileInvoiceFinancials(invoice.id, manager);
      await reconcileCustomerFinancials(customer.id, manager);

      await this.auditService.log({
        action: 'CREATE',
        entityType: 'CUSTOMER_REFUND',
        entityId: String(savedRefund.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          refundNumber,
          returnNumber: salesReturn.returnNumber,
          amountKd: toKd(refundDueFils),
          refundMethod: dto.refundMethod,
        },
      });

      return savedRefund.id;
    });

    return savedId;
  }

  async cancelRefund(refundId: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const refund = await manager.findOne(CustomerRefund, {
        where: { id: refundId },
        relations: { salesReturn: { invoice: true } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!refund) throw new NotFoundException(`Refund ID ${refundId} not found.`);
      if (refund.status === 'CANCELLED') throw new BadRequestException('Refund is already cancelled.');

      // Lock Customer
      const customer = await manager.findOne(Customer, {
        where: { id: refund.customerId },
        lock: { mode: 'pessimistic_write' },
      });

      refund.status = 'CANCELLED';
      await manager.save(CustomerRefund, refund);

      if (refund.salesReturn && refund.salesReturn.invoice) {
        await reconcileInvoiceFinancials(refund.salesReturn.invoiceId, manager);
      }
      if (customer) {
        await reconcileCustomerFinancials(customer.id, manager);
      }

      await this.auditService.log({
        action: 'CANCEL',
        entityType: 'CUSTOMER_REFUND',
        entityId: String(refund.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          refundNumber: refund.refundNumber,
          amountKd: Number(refund.amountKd),
          reason: 'Refund cancelled',
        },
      });
    });
    return { success: true, message: `Refund ${refundId} cancelled.` };
  }

  async cancelReturn(returnId: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const salesReturn = await manager.findOne(SalesReturn, {
        where: { id: returnId },
        relations: { lines: true, invoice: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!salesReturn) throw new NotFoundException(`Sales Return ID ${returnId} not found.`);
      if (salesReturn.status === 'CANCELLED') throw new BadRequestException('Return is already cancelled.');

      // Check for active refunds
      const existingRefund = await manager.findOne(CustomerRefund, {
        where: { salesReturnId: returnId, status: 'POSTED' }
      });
      if (existingRefund) {
        throw new BadRequestException('Cannot cancel this Sales Return because it has a POSTED refund. Cancel the refund first.');
      }

      // Reverse stock
      if (salesReturn.lines) {
        for (const line of salesReturn.lines) {
          const product = await manager.findOne(Product, {
            where: { id: line.productId },
            lock: { mode: 'pessimistic_write' },
          });
          if (product) {
            const currentStock = Number(product.currentStockPcs || 0);
            const newStock = currentStock - Number(line.returnTotalPcs); // deduct because we are reversing a return
            product.currentStockPcs = newStock;
            await manager.save(Product, product);

            const ledger = manager.create(StockLedger, {
              productId: product.id,
              quantityChangePcs: -Number(line.returnTotalPcs), // negative
              balanceAfterPcs: newStock,
              sourceType: 'SALES_RETURN',
              sourceId: salesReturn.id,
              sourceReference: `CANCEL-${salesReturn.returnNumber}`,
              notes: `Sales Return ${salesReturn.returnNumber} cancelled — stock restored to customer`,
              performedBy: user?.displayName || 'Owner',
            });
            await manager.save(StockLedger, ledger);
          }
        }
      }

      salesReturn.status = 'CANCELLED';
      await manager.save(SalesReturn, salesReturn);

      if (salesReturn.invoice) {
        await reconcileInvoiceFinancials(salesReturn.invoiceId, manager);
      }
      const customer = await manager.findOne(Customer, {
        where: { id: salesReturn.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (customer) {
        await reconcileCustomerFinancials(customer.id, manager);
      }

      await this.auditService.log({
        action: 'CANCEL',
        entityType: 'SALES_RETURN',
        entityId: String(salesReturn.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          returnNumber: salesReturn.returnNumber,
          totalReturnAmountKd: Number(salesReturn.totalReturnAmountKd),
          reason: 'Sales return cancelled',
        },
      });
    });

    return this.findOne(returnId);
  }

  private formatReturn(r: SalesReturn) {
    const totalPcs = Number(r.totalReturnPcs || 0);
    const dozen = Math.floor(totalPcs / 12);
    const pieces = totalPcs % 12;

    return {
      ...r,
      totalReturnAmountKd: Number(r.totalReturnAmountKd || 0),
      outstandingReductionKd: Number(r.outstandingReductionKd || 0),
      refundRequiredKd: Number(r.refundRequiredKd || 0),
      totalReturnPcsBreakdown: { dozen, pieces, totalPcs, display: `${dozen} Doz ${pieces} Pcs` },
      lines: r.lines?.map((line) => {
        const linePcs = Number(line.returnTotalPcs || 0);
        return {
          ...line,
          originalUnitPriceKd: Number(line.originalUnitPriceKd || 0),
          returnLineAmountKd: Number(line.returnLineAmountKd || 0),
          displayBreakdown: `${line.returnDozen} Doz ${line.returnPieces} Pcs (${linePcs} Pcs)`,
        };
      }),
      refunds: r.refunds?.map(ref => ({
        ...ref,
        amountKd: Number(ref.amountKd || 0),
      })),
    };
  }
}
