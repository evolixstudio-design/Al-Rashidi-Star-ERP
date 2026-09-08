import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class CreateCustomerDto {
  name!: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export class UpdateCustomerDto {
  name?: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export class BulkImportCustomerDto {
  name!: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  openingOutstandingKd?: number;
  notes?: string;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(CustomerReceipt)
    private readonly receiptRepo: Repository<CustomerReceipt>,
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

  async create(dto: CreateCustomerDto, user: any) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Customer name is required.');
    }

    const customer = this.customerRepo.create({
      name: dto.name.trim(),
      nameAr: dto.nameAr?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      address: dto.address?.trim() || undefined,
      notes: dto.notes?.trim() || undefined,
      totalSales: 0,
      totalReceived: 0,
      totalOutstanding: 0,
      isActive: true,
    });

    const saved = await this.customerRepo.save(customer);

    await this.auditService.log({
      action: 'CREATE',
      entityType: 'CUSTOMER',
      entityId: String(saved.id),
      performedBy: user?.displayName || 'Owner',
      details: { name: saved.name, phone: saved.phone },
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
      const opening = Math.max(0, Number(item.openingOutstandingKd || 0));
      const customer = this.customerRepo.create({
        name: item.name.trim(),
        nameAr: item.nameAr?.trim() || undefined,
        phone: item.phone?.trim() || undefined,
        address: item.address?.trim() || undefined,
        totalSales: Number(opening.toFixed(3)),
        totalReceived: 0,
        totalOutstanding: Number(opening.toFixed(3)),
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
    return {
      ...customer,
      totalSales: Number(customer.totalSales || 0),
      totalReceived: Number(customer.totalReceived || 0),
      totalOutstanding: Number(customer.totalOutstanding || 0),
      totalSalesKd: Number(customer.totalSales || 0),
      totalReceivedKd: Number(customer.totalReceived || 0),
      totalOutstandingKd: Number(customer.totalOutstanding || 0),
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

    type RawEntry = {
      date: string;
      createdAt: Date;
      type: string;
      reference: string;
      debit: number;
      credit: number;
      notes: string;
      status: string;
      id: number;
    };

    const rawEntries: RawEntry[] = [];

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
        id: inv.id,
      });
    }

    for (const r of receipts) {
      rawEntries.push({
        date: r.receiptDate,
        createdAt: r.createdAt,
        type: 'Payment',
        reference: r.receiptNumber,
        debit: 0,
        credit: Number(r.amountKd || 0),
        notes: `Received via ${r.paymentMethod}${r.notes ? ' - ' + r.notes : ''}`,
        status: 'POSTED',
        id: r.id,
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

