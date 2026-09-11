import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { CustomerReceiptAllocation } from '../../database/entities/customer-receipt-allocation.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class ReceivePaymentDto {
  customerId!: number;
  allocateTo?: 'auto' | 'opening_balance' | 'invoice';
  invoiceId?: number;
  amountKd!: number;
  paymentMethod!: string;
  receiptDate!: string;
  notes?: string;
}

const toFils = (kd: number | string): number => Math.round(Number(kd) * 1000);
const toKd = (fils: number): number => Number((fils / 1000).toFixed(3));

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(CustomerReceipt)
    private readonly receiptRepo: Repository<CustomerReceipt>,
    @InjectRepository(CustomerReceiptAllocation)
    private readonly allocationRepo: Repository<CustomerReceiptAllocation>,
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const receipts = await this.receiptRepo
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.customer', 'customer')
      .leftJoinAndSelect('receipt.invoice', 'invoice')
      .orderBy('receipt.id', 'DESC')
      .getMany();

    return receipts.map((r) => this.formatReceipt(r));
  }

  async findOne(id: number) {
    const receipt = await this.receiptRepo.findOne({
      where: { id },
      relations: { customer: true, invoice: true },
    });
    if (!receipt) {
      throw new NotFoundException(`Payment receipt with ID ${id} not found.`);
    }

    const allocations = await this.allocationRepo.find({
      where: { receiptId: id }
    });

    return { ...this.formatReceipt(receipt), allocations };
  }

  async findByCustomer(customerId: number) {
    const receipts = await this.receiptRepo.find({
      where: { customerId },
      relations: { invoice: true },
      order: { createdAt: 'DESC' },
    });
    return receipts.map((r) => this.formatReceipt(r));
  }

  async receivePayment(dto: ReceivePaymentDto, user: any) {
    const amountKd = Number(dto.amountKd);
    if (!amountKd || amountKd <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    if (!dto.paymentMethod || dto.paymentMethod.trim().length === 0) {
      throw new BadRequestException('Payment method is required.');
    }

    const allocateMode = dto.allocateTo || 'auto';
    if (allocateMode === 'invoice' && !dto.invoiceId) {
      throw new BadRequestException('invoiceId is required when allocating to a specific invoice.');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      // 1. Lock customer
      const customer = await manager.findOne(Customer, {
        where: { id: dto.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${dto.customerId} not found.`);
      }

      const amountFils = toFils(amountKd);

      // 2. Lock invoices & calculate limits
      let unpaidInvoices: SalesInvoice[] = [];
      let maxAllowedFils = 0;

      if (allocateMode === 'invoice') {
        const invoice = await manager.findOne(SalesInvoice, {
          where: { id: dto.invoiceId, customerId: dto.customerId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!invoice || invoice.status === 'CANCELLED' || Number(invoice.outstandingKd) <= 0) {
          throw new BadRequestException('The selected invoice is not valid for payment or has no outstanding balance.');
        }
        unpaidInvoices = [invoice];
        maxAllowedFils = toFils(invoice.outstandingKd);

      } else if (allocateMode === 'opening_balance') {
        maxAllowedFils = toFils(customer.openingOutstandingKd || 0);

      } else {
        // Auto mode
        unpaidInvoices = await manager.find(SalesInvoice, {
          where: { customerId: customer.id, status: 'POSTED', outstandingKd: MoreThan(0) },
          order: { invoiceDate: 'ASC', id: 'ASC' },
          lock: { mode: 'pessimistic_write' },
        });
        const invOutFils = unpaidInvoices.reduce((sum, inv) => sum + toFils(inv.outstandingKd), 0);
        maxAllowedFils = toFils(customer.openingOutstandingKd || 0) + invOutFils;
      }

      if (amountFils > maxAllowedFils) {
        throw new BadRequestException(`Payment amount (${toKd(amountFils)} KD) exceeds allowed balance for this allocation (${toKd(maxAllowedFils)} KD).`);
      }

      // Generate receipt number: CR-YYYY-XXXX
      const currentYear = new Date().getFullYear();
      const count = await manager.count(CustomerReceipt);
      const receiptNumber = `CR-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      // Create Receipt
      const receipt = manager.create(CustomerReceipt, {
        receiptNumber,
        customerId: customer.id,
        amountKd: amountKd,
        paymentMethod: dto.paymentMethod.trim(),
        receiptDate: dto.receiptDate || new Date().toISOString().split('T')[0],
        notes: dto.notes?.trim() || undefined,
        performedBy: user?.displayName || 'Owner',
        status: 'POSTED',
      });
      const savedReceipt = await manager.save(CustomerReceipt, receipt);

      // Create Allocations
      let remainingFils = amountFils;
      let allocatedTotalFils = 0;
      const allocationsToSave: CustomerReceiptAllocation[] = [];

      // A. Allocate to opening balance if allowed
      if (allocateMode === 'auto' || allocateMode === 'opening_balance') {
        const obFils = toFils(customer.openingOutstandingKd || 0);
        if (obFils > 0 && remainingFils > 0) {
          const applyFils = Math.min(remainingFils, obFils);
          customer.openingOutstandingKd = toKd(obFils - applyFils);
          remainingFils -= applyFils;
          allocatedTotalFils += applyFils;

          allocationsToSave.push(manager.create(CustomerReceiptAllocation, {
            receiptId: savedReceipt.id,
            customerId: customer.id,
            allocationType: 'OPENING_BALANCE',
            amountKd: toKd(applyFils)
          }));
        }
      }

      // B. Allocate to invoices if allowed
      if ((allocateMode === 'auto' || allocateMode === 'invoice') && remainingFils > 0) {
        for (const inv of unpaidInvoices) {
          if (remainingFils <= 0) break;
          const invOutFils = toFils(inv.outstandingKd);
          if (invOutFils <= 0) continue;

          const applyFils = Math.min(remainingFils, invOutFils);
          
          inv.amountReceivedKd = toKd(toFils(inv.amountReceivedKd) + applyFils);
          await manager.save(SalesInvoice, inv);
          
          const { reconcileInvoiceFinancials } = await import('../../utils/finance.util.js');
          await reconcileInvoiceFinancials(inv.id, manager);

          remainingFils -= applyFils;
          allocatedTotalFils += applyFils;

          allocationsToSave.push(manager.create(CustomerReceiptAllocation, {
            receiptId: savedReceipt.id,
            customerId: customer.id,
            allocationType: 'INVOICE',
            invoiceId: inv.id,
            amountKd: toKd(applyFils)
          }));
        }
      }

      // Assert Allocation Invariant
      if (allocatedTotalFils !== amountFils) {
        throw new InternalServerErrorException(`Allocation invariant failed: Allocated amount (${toKd(allocatedTotalFils)}) does not match receipt amount (${toKd(amountFils)}). Transaction aborted.`);
      }

      for (const a of allocationsToSave) {
        await manager.save(CustomerReceiptAllocation, a);
      }

      // Update customer totalReceived incrementally
      customer.totalReceived = toKd(toFils(customer.totalReceived || 0) + amountFils);
      await manager.save(Customer, customer);

      // Reconcile total balances safely
      const { reconcileCustomerFinancials } = await import('../../utils/finance.util.js');
      await reconcileCustomerFinancials(customer.id, manager);

      // Audit
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'CUSTOMER_RECEIPT',
        entityId: String(savedReceipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          receiptNumber,
          customerName: customer.name,
          amountKd,
          paymentMethod: dto.paymentMethod,
          allocateMode,
          allocationsCount: allocationsToSave.length,
        },
      });

      return savedReceipt.id;
    });

    return this.findOne(savedId);
  }

  async cancelPayment(id: number, user: any) {
    await this.dataSource.transaction(async (manager) => {
      const receipt = await manager.findOne(CustomerReceipt, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!receipt) {
        throw new NotFoundException(`Payment receipt with ID ${id} not found.`);
      }

      if (receipt.status === 'CANCELLED') {
        throw new BadRequestException('This payment receipt is already cancelled.');
      }

      const allocations = await manager.find(CustomerReceiptAllocation, {
        where: { receiptId: id }
      });

      const customer = await manager.findOne(Customer, {
        where: { id: receipt.customerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (customer) {
        // Reverse allocations
        for (const alloc of allocations) {
          const allocFils = toFils(alloc.amountKd);
          
          if (alloc.allocationType === 'OPENING_BALANCE') {
            customer.openingOutstandingKd = toKd(toFils(customer.openingOutstandingKd || 0) + allocFils);
          } else if (alloc.allocationType === 'INVOICE' && alloc.invoiceId) {
            const invoice = await manager.findOne(SalesInvoice, {
              where: { id: alloc.invoiceId },
              lock: { mode: 'pessimistic_write' }
            });
            if (invoice) {
              const currentReceivedFils = toFils(invoice.amountReceivedKd || 0);
              const currentOutFils = toFils(invoice.outstandingKd || 0);
              
              invoice.amountReceivedKd = toKd(Math.max(0, currentReceivedFils - allocFils));
              await manager.save(SalesInvoice, invoice);
              
              const { reconcileInvoiceFinancials } = await import('../../utils/finance.util.js');
              await reconcileInvoiceFinancials(invoice.id, manager);
            }
          }
        }

        // Reduce totalReceived incrementally
        const receiptFils = toFils(receipt.amountKd);
        const curRecFils = toFils(customer.totalReceived || 0);
        customer.totalReceived = toKd(Math.max(0, curRecFils - receiptFils));
        await manager.save(Customer, customer);

        // Safely recalculate global caches
        const { reconcileCustomerFinancials } = await import('../../utils/finance.util.js');
        await reconcileCustomerFinancials(customer.id, manager);
      }

      // Mark cancelled
      receipt.status = 'CANCELLED';
      await manager.save(CustomerReceipt, receipt);

      // Audit
      await this.auditService.log({
        action: 'PAYMENT_CANCELLED',
        entityType: 'CUSTOMER_RECEIPT',
        entityId: String(receipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          receiptNumber: receipt.receiptNumber,
          amountKd: receipt.amountKd,
          reason: 'Payment cancelled / reversed',
        },
      });
      await this.auditService.log({
        action: 'PAYMENT_ALLOCATION_REVERSED',
        entityType: 'CUSTOMER_RECEIPT',
        entityId: String(receipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          allocationsCount: allocations.length,
        },
      });

      return receipt.id;
    });

    return this.findOne(id);
  }

  private formatReceipt(receipt: CustomerReceipt) {
    return {
      ...receipt,
      amountKd: Number(receipt.amountKd || 0),
    };
  }
}
