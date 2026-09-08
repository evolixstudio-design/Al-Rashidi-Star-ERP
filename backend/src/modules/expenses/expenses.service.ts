import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from '../../database/entities/expense.entity.js';
import { AuditService } from '../audit/audit.service.js';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent',
  'Salaries',
  'Transport/Shipping',
  'Utilities',
  'Office Supplies',
  'Visa/Iqama',
  'Packaging',
  'Miscellaneous',
];

export class CreateExpenseDto {
  category!: string;
  description!: string;
  amountKd!: number;
  expenseDate!: string;
  paymentMethod?: string;
  paidTo?: string;
  receiptRef?: string;
  notes?: string;
}

export class UpdateExpenseDto {
  category?: string;
  description?: string;
  amountKd?: number;
  expenseDate?: string;
  paymentMethod?: string;
  paidTo?: string;
  receiptRef?: string;
  notes?: string;
}

export class ExpenseFilterDto {
  category?: string;
  from?: string;
  to?: string;
  search?: string;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter?: ExpenseFilterDto) {
    const qb = this.expenseRepo.createQueryBuilder('expense');

    if (filter?.category && filter.category !== 'ALL') {
      qb.andWhere('expense.category = :category', { category: filter.category });
    }

    if (filter?.from) {
      qb.andWhere('expense.expenseDate >= :from', { from: filter.from });
    }

    if (filter?.to) {
      qb.andWhere('expense.expenseDate <= :to', { to: filter.to });
    }

    if (filter?.search && filter.search.trim()) {
      const term = `%${filter.search.trim()}%`;
      qb.andWhere(
        '(expense.expenseNumber ILIKE :term OR expense.description ILIKE :term OR expense.paidTo ILIKE :term OR expense.receiptRef ILIKE :term)',
        { term },
      );
    }

    qb.orderBy('expense.expenseDate', 'DESC').addOrderBy('expense.id', 'DESC');

    const expenses = await qb.getMany();
    return expenses.map((e) => this.formatExpense(e));
  }

  async findOne(id: number) {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    }
    return this.formatExpense(expense);
  }

  async getCategories(): Promise<string[]> {
    const rawCategories = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('DISTINCT expense.category', 'category')
      .getRawMany();

    const dbCategories = rawCategories.map((r) => r.category).filter(Boolean);
    const set = new Set([...DEFAULT_EXPENSE_CATEGORIES, ...dbCategories]);
    return Array.from(set).sort();
  }

  async getSummary(from?: string, to?: string) {
    const qb = this.expenseRepo.createQueryBuilder('expense');

    qb.andWhere("expense.status != 'CANCELLED'");

    if (from) {
      qb.andWhere('expense.expenseDate >= :from', { from });
    }
    if (to) {
      qb.andWhere('expense.expenseDate <= :to', { to });
    }

    const expenses = await qb.getMany();

    let totalKd = 0;
    const categoryMap = new Map<string, { totalKd: number; count: number }>();
    const paymentMethodMap = new Map<string, { totalKd: number; count: number }>();

    for (const exp of expenses) {
      const amt = Number(exp.amountKd) || 0;
      totalKd += amt;

      // Category breakdown
      const cat = exp.category || 'Miscellaneous';
      const existingCat = categoryMap.get(cat) || { totalKd: 0, count: 0 };
      existingCat.totalKd += amt;
      existingCat.count += 1;
      categoryMap.set(cat, existingCat);

      // Payment method breakdown
      const pm = exp.paymentMethod || 'Cash';
      const existingPm = paymentMethodMap.get(pm) || { totalKd: 0, count: 0 };
      existingPm.totalKd += amt;
      existingPm.count += 1;
      paymentMethodMap.set(pm, existingPm);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      totalKd: Number(stats.totalKd.toFixed(3)),
      count: stats.count,
    })).sort((a, b) => b.totalKd - a.totalKd);

    const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(([paymentMethod, stats]) => ({
      paymentMethod,
      totalKd: Number(stats.totalKd.toFixed(3)),
      count: stats.count,
    })).sort((a, b) => b.totalKd - a.totalKd);

    return {
      totalKd: Number(totalKd.toFixed(3)),
      totalCount: expenses.length,
      byCategory,
      byPaymentMethod,
    };
  }

  async create(dto: CreateExpenseDto, user: any) {
    const amount = Number(dto.amountKd);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Expense amount must be greater than zero.');
    }

    if (!dto.category || !dto.category.trim()) {
      throw new BadRequestException('Expense category is required.');
    }

    if (!dto.description || !dto.description.trim()) {
      throw new BadRequestException('Expense description is required.');
    }

    if (!dto.expenseDate) {
      throw new BadRequestException('Expense date is required.');
    }

    const username = user?.username || 'SYSTEM';

    const savedId = await this.dataSource.transaction(async (manager) => {
      const currentYear = new Date().getFullYear();
      const count = await manager.count(Expense);
      const expenseNumber = `EXP-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      const newExpense = manager.create(Expense, {
        expenseNumber,
        category: dto.category.trim(),
        description: dto.description.trim(),
        amountKd: Number(amount.toFixed(3)),
        expenseDate: dto.expenseDate,
        paymentMethod: dto.paymentMethod?.trim() || 'Cash',
        paidTo: dto.paidTo?.trim() || undefined,
        receiptRef: dto.receiptRef?.trim() || undefined,
        notes: dto.notes?.trim() || undefined,
        recordedBy: username,
      });

      const saved = await manager.save(Expense, newExpense);
      return saved.id;
    });

    await this.auditService.log({
      action: 'CREATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: String(savedId),
      performedBy: username,
      details: {
        amountKd: amount,
        category: dto.category,
        description: dto.description,
        expenseDate: dto.expenseDate,
      },
    });

    return this.findOne(savedId);
  }

  async update(id: number, dto: UpdateExpenseDto, user: any) {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    }

    if (dto.amountKd !== undefined) {
      const amount = Number(dto.amountKd);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException('Expense amount must be greater than zero.');
      }
      expense.amountKd = Number(amount.toFixed(3));
    }

    if (dto.category !== undefined) {
      if (!dto.category.trim()) throw new BadRequestException('Category cannot be empty.');
      expense.category = dto.category.trim();
    }

    if (dto.description !== undefined) {
      if (!dto.description.trim()) throw new BadRequestException('Description cannot be empty.');
      expense.description = dto.description.trim();
    }

    if (dto.expenseDate !== undefined) {
      if (!dto.expenseDate) throw new BadRequestException('Expense date cannot be empty.');
      expense.expenseDate = dto.expenseDate;
    }

    if (dto.paymentMethod !== undefined) {
      expense.paymentMethod = dto.paymentMethod.trim() || 'Cash';
    }

    if (dto.paidTo !== undefined) {
      expense.paidTo = dto.paidTo?.trim() || undefined;
    }

    if (dto.receiptRef !== undefined) {
      expense.receiptRef = dto.receiptRef?.trim() || undefined;
    }

    if (dto.notes !== undefined) {
      expense.notes = dto.notes?.trim() || undefined;
    }

    const updated = await this.expenseRepo.save(expense);
    const username = user?.username || 'SYSTEM';

    await this.auditService.log({
      action: 'UPDATE_EXPENSE',
      entityType: 'EXPENSE',
      entityId: String(id),
      performedBy: username,
      details: {
        expenseNumber: expense.expenseNumber,
        updatedFields: Object.keys(dto),
      },
    });

    return this.formatExpense(updated);
  }

  async cancel(id: number, reason: string, user: any) {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    }

    if (expense.status === 'CANCELLED') {
      throw new BadRequestException(`Expense ${expense.expenseNumber} is already cancelled.`);
    }

    const performer = user?.displayName || user?.username || 'Owner';
    const cancelReason = reason?.trim() || 'Cancelled by owner';
    const now = new Date();

    expense.status = 'CANCELLED';
    expense.cancellationReason = cancelReason;
    expense.cancelledAt = now;
    expense.cancelledBy = performer;

    const saved = await this.expenseRepo.save(expense);

    await this.auditService.log({
      action: 'CANCEL_EXPENSE',
      entityType: 'EXPENSE',
      entityId: String(id),
      performedBy: performer,
      details: {
        expenseNumber: expense.expenseNumber,
        amountKd: Number(expense.amountKd),
        category: expense.category,
        reason: cancelReason,
        cancelledAt: now.toISOString(),
      },
    });

    return this.formatExpense(saved);
  }

  async delete(id: number, user: any) {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found.`);
    }

    // Per ERP policy: Do NOT hard delete financial expenses. Only true DRAFT can be deleted.
    if (expense.status !== 'DRAFT') {
      throw new BadRequestException('Posted financial transactions cannot be permanently deleted. Please cancel the expense instead.');
    }

    const username = user?.username || 'SYSTEM';
    const expenseNumber = expense.expenseNumber;

    await this.expenseRepo.remove(expense);
    return { success: true, message: `Draft expense ${expenseNumber} deleted.` };
  }

  private formatExpense(expense: Expense) {
    return {
      id: expense.id,
      expenseNumber: expense.expenseNumber,
      category: expense.category,
      description: expense.description,
      amountKd: Number(Number(expense.amountKd || 0).toFixed(3)),
      expenseDate: expense.expenseDate,
      paymentMethod: expense.paymentMethod,
      paidTo: expense.paidTo || null,
      receiptRef: expense.receiptRef || null,
      notes: expense.notes || null,
      status: expense.status || 'POSTED',
      cancellationReason: expense.cancellationReason || null,
      cancelledAt: expense.cancelledAt || null,
      cancelledBy: expense.cancelledBy || null,
      recordedBy: expense.recordedBy,
      createdAt: expense.createdAt,
    };
  }
}
