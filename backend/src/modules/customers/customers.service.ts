import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, EntityManager } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { CustomerOpeningBalanceAdjustment } from '../../database/entities/customer-opening-balance-adjustment.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class CreateCustomerDto {
  name!: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  notes?: string;
  openingOutstandingKd?: number;
  openingBalanceDate?: string;
  openingBalanceNote?: string;
}

export class UpdateCustomerDto {
  name?: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export class AdjustOpeningBalanceDto {
  amountKd!: number;
  reason!: string;
}

export class BulkImportCustomerDto {
  name!: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  openingOutstandingKd?: number;
  notes?: string;
}

const toFils = (kd: number | string): number => Math.round(Number(kd) * 1000);
const toKd = (fils: number): number => Number((fils / 1000).toFixed(3));

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(CustomerReceipt)
    private readonly receiptRepo: Repository<CustomerReceipt>,
    @InjectRepository(CustomerOpeningBalanceAdjustment)
    private readonly adjustmentRepo: Repository<CustomerOpeningBalanceAdjustment>,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const customers = await this.customerRepo.find({
      order: { name: 'ASC' },
    });
    return customers.map((c) => this.formatCustomer(c));
  }

  async findOne(id: number) {
    const customer = await this.customerRepo.findOne({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    // Get pending invoices for this customer
    const pendingInvoices = await this.invoiceRepo.find({
      where: { customerId: id, status: 'POSTED' },
      order: { createdAt: 'DESC' },
    });

    const formatted = this.formatCustomer(customer);
    return {
      ...formatted,
      pendingInvoices: pendingInvoices
        .filter((inv) => Number(inv.outstandingKd) > 0)
        .map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          totalAmountKd: Number(inv.totalAmountKd),
          amountReceivedKd: Number(inv.amountReceivedKd),
          outstandingKd: Number(inv.outstandingKd),
          paymentStatus: inv.paymentStatus,
          dueDate: inv.dueDate,
        })),
    };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return this.findAll();
    }

    const q = query.trim();
    const customers = await this.customerRepo.find({
      where: [
        { name: ILike(`%${q}%`) },
        { phone: ILike(`%${q}%`) },
      ],
      order: { name: 'ASC' },
    });

    return customers.map((c) => this.formatCustomer(c));
  }

  async recalculateCustomerTotals(customerId: number, manager?: EntityManager) {
    const { reconcileCustomerFinancials } = await import('../../utils/finance.util.js');
    if (manager) {
      return reconcileCustomerFinancials(customerId, manager);
    } else {
      return this.customerRepo.manager.transaction(async (txManager) => {
        return reconcileCustomerFinancials(customerId, txManager);
      });
    }
  }

  async create(dto: CreateCustomerDto, user: any) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Customer name is required.');
    }

    const openingKd = Math.max(0, Number(dto.openingOutstandingKd || 0));

    const customer = this.customerRepo.create({
      name: dto.name.trim(),
      nameAr: dto.nameAr?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      address: dto.address?.trim() || undefined,
      notes: dto.notes?.trim() || undefined,
      openingBalanceOriginalKd: openingKd,
      openingOutstandingKd: openingKd,
      openingBalanceDate: dto.openingBalanceDate || undefined,
      openingBalanceNote: dto.openingBalanceNote || undefined,
      totalSales: 0,
      totalReceived: 0,
      totalOutstanding: openingKd,
      isActive: true,
    });

    const saved = await this.customerRepo.save(customer);

    await this.auditService.log({
      action: 'CREATE',
      entityType: 'CUSTOMER',
      entityId: String(saved.id),
      performedBy: user?.displayName || 'Owner',
      details: { name: saved.name, phone: saved.phone, openingBalance: openingKd },
    });

    return this.formatCustomer(saved);
  }

  async update(id: number, dto: UpdateCustomerDto, user: any) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    if (dto.name !== undefined) customer.name = dto.name.trim();
    if (dto.nameAr !== undefined) customer.nameAr = dto.nameAr.trim() || undefined;
    if (dto.phone !== undefined) customer.phone = dto.phone.trim() || undefined;
    if (dto.address !== undefined) customer.address = dto.address.trim() || undefined;
    if (dto.notes !== undefined) customer.notes = dto.notes.trim() || undefined;
    if (dto.isActive !== undefined) customer.isActive = dto.isActive;

    const saved = await this.customerRepo.save(customer);

    await this.auditService.log({
      action: 'UPDATE',
      entityType: 'CUSTOMER',
      entityId: String(saved.id),
      performedBy: user?.displayName || 'Owner',
      details: { name: saved.name, changes: dto },
    });

    return this.formatCustomer(saved);
  }

  async adjustOpeningBalance(id: number, dto: AdjustOpeningBalanceDto, user: any) {
    return this.customerRepo.manager.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, { 
        where: { id }, 
        lock: { mode: 'pessimistic_write' } 
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found.`);
      }

      if (!dto.reason || !dto.reason.trim()) {
        throw new BadRequestException('Reason is required for opening balance adjustments.');
      }

      const adjustmentFils = toFils(dto.amountKd);
      const currentFils = toFils(customer.openingOutstandingKd || 0);

      if (currentFils + adjustmentFils < 0) {
        throw new BadRequestException('Adjustment cannot cause remaining opening balance to become negative.');
      }

      const newRemainingFils = currentFils + adjustmentFils;
      customer.openingOutstandingKd = toKd(newRemainingFils);

      // Create adjustment record
      const adj = manager.create(CustomerOpeningBalanceAdjustment, {
        customerId: customer.id,
        amountKd: toKd(adjustmentFils),
        reason: dto.reason.trim(),
        performedBy: user?.displayName || 'Owner',
      });
      await manager.save(adj);

      await manager.save(customer);
      await this.recalculateCustomerTotals(customer.id, manager);

      const savedCustomer = await manager.findOne(Customer, { where: { id } });

      await this.auditService.log({
        action: 'CUSTOMER_OPENING_BALANCE_ADJUSTED',
        entityType: 'CUSTOMER',
        entityId: String(id),
        performedBy: user?.displayName || 'Owner',
        details: { 
          adjustment: toKd(adjustmentFils), 
          reason: dto.reason,
          newOpeningOutstanding: savedCustomer?.openingOutstandingKd 
        },
      });

      return this.formatCustomer(savedCustomer!);
    });
  }

  async delete(id: number, user: any) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    return this.customerRepo.manager.transaction(async (manager) => {
      // Check for posted financial transactions
      const invoiceCount = await manager.count(SalesInvoice, { where: { customerId: id } });
      const receiptCount = await manager.count(CustomerReceipt, { where: { customerId: id } });
      
      // Need to dynamically import SalesReturn and CustomerRefund to avoid circular dependencies if they are not imported
      const { SalesReturn } = await import('../../database/entities/sales-return.entity.js');
      const { CustomerRefund } = await import('../../database/entities/customer-refund.entity.js');
      
      const returnCount = await manager.count(SalesReturn, { where: { customerId: id } });
      const refundCount = await manager.count(CustomerRefund, { where: { customerId: id } });

      if (invoiceCount > 0 || receiptCount > 0 || returnCount > 0 || refundCount > 0) {
        throw new BadRequestException('Customer cannot be deleted because financial transactions exist.');
      }

      try {
        // Safe to delete: only opening balance adjustments might exist. Clean them up first.
        await manager.delete(CustomerOpeningBalanceAdjustment, { customerId: id });
        
        await manager.remove(Customer, customer);

        await this.auditService.log({
          action: 'DELETE',
          entityType: 'CUSTOMER',
          entityId: String(id),
          performedBy: user?.displayName || 'Owner',
          details: { name: customer.name, reason: 'Customer hard deleted' },
        });

        return { success: true, message: `Customer ${id} deleted successfully` };
      } catch (error: any) {
        throw new BadRequestException('Cannot delete customer due to existing relational data.');
      }
    });
  }

  async bulkImport(items: BulkImportCustomerDto[], user: any) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Import list cannot be empty.');
    }

    const seenNames = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.name.trim()) {
        throw new BadRequestException(`Row #${i + 1}: Customer name is required.`);
      }
      const norm = item.name.trim().toLowerCase();
      if (seenNames.has(norm)) {
        throw new BadRequestException(`Duplicate customer name "${item.name}" found in import file.`);
      }
      seenNames.add(norm);
    }

    const savedCustomers: Customer[] = [];
    for (const item of items) {
      const openingKd = Math.max(0, Number(item.openingOutstandingKd || 0));
      const customer = this.customerRepo.create({
        name: item.name.trim(),
        nameAr: item.nameAr?.trim() || undefined,
        phone: item.phone?.trim() || undefined,
        address: item.address?.trim() || undefined,
        totalSales: 0,
        totalReceived: 0,
        totalOutstanding: openingKd,
        openingBalanceOriginalKd: openingKd,
        openingOutstandingKd: openingKd,
        notes: item.notes?.trim() || undefined,
        isActive: true,
      });

      const saved = await this.customerRepo.save(customer);
      savedCustomers.push(saved);
    }

    await this.auditService.log({
      action: 'BULK_IMPORT',
      entityType: 'CUSTOMER',
      entityId: 'BATCH',
      performedBy: user?.displayName || 'Owner',
      details: {
        count: savedCustomers.length,
        names: savedCustomers.map((c) => c.name),
      },
    });

    return {
      success: true,
      importedCount: savedCustomers.length,
      customers: savedCustomers.map((c) => this.formatCustomer(c)),
    };
  }

  private formatCustomer(customer: Customer) {
    const totalOut = Number(customer.totalOutstanding || 0);
    const openingOut = Number(customer.openingOutstandingKd || 0);
    
    return {
      ...customer,
      openingBalanceOriginalKd: Number(customer.openingBalanceOriginalKd || 0),
      openingOutstandingKd: openingOut,
      invoiceOutstandingKd: Number((toFils(totalOut) - toFils(openingOut)) / 1000),
      totalSales: Number(customer.totalSales || 0),
      totalReceived: Number(customer.totalReceived || 0),
      totalOutstanding: totalOut,
      totalSalesKd: Number(customer.totalSales || 0),
      totalReceivedKd: Number(customer.totalReceived || 0),
      totalOutstandingKd: totalOut,
    };
  }

  async getPendingInvoices(customerId: number) {
    const invoices = await this.invoiceRepo.find({
      where: { customerId, status: 'POSTED' },
      order: { id: 'DESC' },
    });

    return invoices
      .filter((inv) => Number(inv.outstandingKd) > 0)
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        grandTotalAmountKd: Number(inv.totalAmountKd || 0),
        amountReceivedKd: Number(inv.amountReceivedKd || 0),
        balanceKd: Number(inv.outstandingKd || 0),
        paymentStatus: inv.paymentStatus,
      }));
  }

  async getLedger(customerId: number) {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found.`);
    }

    const invoices = await this.invoiceRepo.find({
      where: { customerId },
      order: { invoiceDate: 'ASC', createdAt: 'ASC' },
    });

    const receipts = await this.receiptRepo.find({
      where: { customerId },
      order: { receiptDate: 'ASC', createdAt: 'ASC' },
    });

    const adjustments = await this.adjustmentRepo.find({
      where: { customerId },
      order: { createdAt: 'ASC' },
    });

    type RawEntry = {
      date: string;
      createdAt: Date;
      type: string;
      reference: string;
      debit: number;
      credit: number;
      notes: string;
      status: string;
      id: string | number;
    };

    const rawEntries: RawEntry[] = [];

    // 1. Initial Opening Balance
    if (Number(customer.openingBalanceOriginalKd) > 0) {
      const obDate = customer.openingBalanceDate || customer.createdAt.toISOString().split('T')[0];
      rawEntries.push({
        date: obDate,
        createdAt: new Date(0), // Place it at the very beginning
        type: 'Opening Balance',
        reference: 'OPENING',
        debit: Number(customer.openingBalanceOriginalKd),
        credit: 0,
        notes: customer.openingBalanceNote || 'Previous Outstanding Balance',
        status: 'POSTED',
        id: 'ob-initial',
      });
    }

    // 2. Adjustments
    for (const adj of adjustments) {
      const amt = Number(adj.amountKd);
      rawEntries.push({
        date: adj.createdAt.toISOString().split('T')[0],
        createdAt: adj.createdAt,
        type: 'Balance Adjustment',
        reference: `ADJ-${adj.id}`,
        debit: amt > 0 ? amt : 0,
        credit: amt < 0 ? Math.abs(amt) : 0,
        notes: adj.reason,
        status: 'POSTED',
        id: `adj-${adj.id}`,
      });
    }

    // 3. Invoices
    for (const inv of invoices) {
      const isCancelled = inv.status === 'CANCELLED';
      rawEntries.push({
        date: inv.invoiceDate,
        createdAt: inv.createdAt,
        type: isCancelled ? 'Invoice (Cancelled)' : 'Invoice',
        reference: inv.invoiceNumber,
        debit: isCancelled ? 0 : Number(inv.totalAmountKd || 0),
        credit: 0,
        notes: isCancelled ? (inv.notes || 'Cancelled / Reversed') : `Sales Invoice [${inv.paymentStatus}]`,
        status: inv.status,
        id: `inv-${inv.id}`,
      });
    }

    // 4. Receipts
    for (const r of receipts) {
      const isCancelled = r.status === 'CANCELLED';
      rawEntries.push({
        date: r.receiptDate,
        createdAt: r.createdAt,
        type: isCancelled ? 'Payment (Cancelled)' : 'Payment',
        reference: r.receiptNumber,
        debit: 0,
        credit: isCancelled ? 0 : Number(r.amountKd || 0),
        notes: isCancelled ? 'Payment Reversed' : `Received via ${r.paymentMethod}${r.notes ? ' - ' + r.notes : ''}`,
        status: r.status,
        id: `rec-${r.id}`,
      });
    }

    // Sort chronologically
    rawEntries.sort((a, b) => {
      const cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (cmp !== 0) return cmp;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let runningBalance = 0;
    const ledger = rawEntries.map((e) => {
      runningBalance += e.debit - e.credit;
      return {
        ...e,
        debitKd: Number(e.debit.toFixed(3)),
        creditKd: Number(e.credit.toFixed(3)),
        balanceKd: Number(runningBalance.toFixed(3)),
      };
    });

    return {
      customer: this.formatCustomer(customer),
      totalSalesKd: Number(customer.totalSales || 0),
      totalReceivedKd: Number(customer.totalReceived || 0),
      outstandingKd: Number(customer.totalOutstanding || 0),
      ledger,
    };
  }
}
