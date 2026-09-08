import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class ReceivePaymentDto {
  customerId!: number;
  invoiceId?: number;
  amountKd!: number;
  paymentMethod!: string;
  receiptDate!: string;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(CustomerReceipt)
    private readonly receiptRepo: Repository<CustomerReceipt>,
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
    return this.formatReceipt(receipt);
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
    const amount = Number(dto.amountKd);
    if (!amount || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    if (!dto.paymentMethod || dto.paymentMethod.trim().length === 0) {
      throw new BadRequestException('Payment method is required.');
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { id: dto.customerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${dto.customerId} not found.`);
      }

      // Generate receipt number: CR-YYYY-XXXX
      const currentYear = new Date().getFullYear();
      const count = await manager.count(CustomerReceipt);
      const receiptNumber = `CR-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      let allocatedInvoiceNumber: string | undefined;

      // If allocating to a specific invoice
      if (dto.invoiceId) {
        const invoice = await manager.findOne(SalesInvoice, {
          where: { id: dto.invoiceId, customerId: dto.customerId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found for this customer.`);
        }

        if (invoice.status === 'CANCELLED') {
          throw new BadRequestException('Cannot accept payment for a cancelled invoice.');
        }

        const currentOutstanding = Number(invoice.outstandingKd || 0);
        if (currentOutstanding <= 0) {
          throw new BadRequestException('This invoice has no outstanding balance.');
        }

        // Apply payment to invoice
        const newReceived = Number((Number(invoice.amountReceivedKd || 0) + amount).toFixed(3));
        const newOutstanding = Number((Number(invoice.totalAmountKd) - newReceived).toFixed(3));

        invoice.amountReceivedKd = newReceived;
        invoice.outstandingKd = Math.max(0, newOutstanding);

        // Update payment status
        if (invoice.outstandingKd <= 0) {
          invoice.paymentStatus = 'PAID';
          invoice.outstandingKd = 0;
        } else if (newReceived > 0) {
          invoice.paymentStatus = 'PARTIAL';
        }

        await manager.save(SalesInvoice, invoice);
        allocatedInvoiceNumber = invoice.invoiceNumber;
      }

      // Create receipt record
      const receipt = manager.create(CustomerReceipt, {
        receiptNumber,
        customerId: customer.id,
        invoiceId: dto.invoiceId || undefined,
        amountKd: amount,
        paymentMethod: dto.paymentMethod.trim(),
        receiptDate: dto.receiptDate || new Date().toISOString().split('T')[0],
        notes: dto.notes?.trim() || undefined,
        performedBy: user?.displayName || 'Owner',
      });

      await manager.save(CustomerReceipt, receipt);

      // Update customer balances
      customer.totalReceived = Number((Number(customer.totalReceived || 0) + amount).toFixed(3));
      customer.totalOutstanding = Number((Number(customer.totalOutstanding || 0) - amount).toFixed(3));
      if (customer.totalOutstanding < 0) customer.totalOutstanding = 0;
      await manager.save(Customer, customer);

      // Audit
      await this.auditService.log({
        action: 'CREATE',
        entityType: 'CUSTOMER_RECEIPT',
        entityId: String(receipt.id),
        performedBy: user?.displayName || 'Owner',
        details: {
          receiptNumber,
          customerName: customer.name,
          amountKd: amount,
          paymentMethod: dto.paymentMethod,
          allocatedInvoice: allocatedInvoiceNumber || 'General payment',
        },
      });

      return receipt.id;
    });

    return this.findOne(savedId);
  }

  private formatReceipt(receipt: CustomerReceipt) {
    return {
      ...receipt,
      amountKd: Number(receipt.amountKd || 0),
    };
  }
}
