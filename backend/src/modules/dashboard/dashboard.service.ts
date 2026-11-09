import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { PurchaseReceipt } from '../../database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from '../../database/entities/purchase-line.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { Expense } from '../../database/entities/expense.entity.js';
import { SalesReturn } from '../../database/entities/sales-return.entity.js';
import { SalesReturnLine } from '../../database/entities/sales-return-line.entity.js';

@Injectable()
export class DashboardService {
  private summaryCache: { data: any; expiry: number } | null = null;
  private trendsCache = new Map<string, { data: any; expiry: number }>();

  public clearCache() {
    this.summaryCache = null;
    this.trendsCache.clear();
  }

  constructor(
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceLine)
    private readonly invoiceLineRepo: Repository<SalesInvoiceLine>,
    @InjectRepository(PurchaseReceipt)
    private readonly purchaseRepo: Repository<PurchaseReceipt>,
    @InjectRepository(PurchaseLine)
    private readonly purchaseLineRepo: Repository<PurchaseLine>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(CustomerReceipt)
    private readonly receiptRepo: Repository<CustomerReceipt>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  /**
   * 1. Core Summary Metrics (Parallel execution + SQL aggregations + Fast Cache)
   */
  async getSummary() {
    const nowMs = Date.now();
    if (this.summaryCache && this.summaryCache.expiry > nowMs) {
      return this.summaryCache.data;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
    const monthStart = `${currentMonthPrefix}-01`;

    const [
      todaySalesRaw,
      todayReturnsRaw,
      pendingCustomersRaw,
      stockValRaw,
      stockOutRaw,
      stockInRaw,
      monthExpensesRaw,
      monthSalesRaw,
      monthReturnsRaw,
      monthCogsRaw,
      monthReturnedCogsRaw,
      monthPurchasesRaw,
    ] = await Promise.all([
      // 1. Today's Sales
      this.invoiceRepo
        .createQueryBuilder('inv')
        .select('COALESCE(SUM(inv.totalAmountKd), 0)', 'total')
        .addSelect('COUNT(inv.id)', 'count')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate = :today', { today })
        .getRawOne(),

      // 2. Today's Returns
      this.invoiceRepo.manager
        .createQueryBuilder(SalesReturn, 'sr')
        .select('COALESCE(SUM(sr.totalReturnAmountKd), 0)', 'total')
        .where('sr.status = :status', { status: 'POSTED' })
        .andWhere('sr.returnDate = :today', { today })
        .getRawOne(),

      // 3. Pending Payments (Total Outstanding from Customers)
      this.customerRepo
        .createQueryBuilder('cust')
        .select('COALESCE(SUM(cust.totalOutstanding), 0)', 'total')
        .addSelect('COUNT(cust.id)', 'count')
        .where('cust.totalOutstanding > 0')
        .getRawOne(),

      // 4. Stock Valuation & Total Stock (SQL-aggregated)
      this.productRepo
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.currentStockPcs), 0)', 'totalPcs')
        .addSelect('COALESCE(SUM((p.currentStockPcs / 12.0) * p.purchasePrice), 0)', 'totalValuation')
        .getRawOne(),

      // 5. Stock Out Today
      this.invoiceLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.invoice', 'inv')
        .select('COALESCE(SUM(line.totalPcs), 0)', 'totalPcs')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate = :today', { today })
        .getRawOne(),

      // 6. Stock Received Today
      this.purchaseLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.receipt', 'rec')
        .select('COALESCE(SUM(line.totalPcs), 0)', 'totalPcs')
        .where('rec.receiptDate = :today', { today })
        .getRawOne(),

      // 7. This Month Expenses
      this.expenseRepo
        .createQueryBuilder('exp')
        .select('COALESCE(SUM(exp.amountKd), 0)', 'total')
        .addSelect('COUNT(exp.id)', 'count')
        .where("exp.status != 'CANCELLED'")
        .andWhere('exp.expenseDate >= :monthStart', { monthStart })
        .andWhere('exp.expenseDate <= :today', { today })
        .getRawOne(),

      // 8. This Month Sales
      this.invoiceRepo
        .createQueryBuilder('inv')
        .select('COALESCE(SUM(inv.totalAmountKd), 0)', 'total')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate >= :monthStart', { monthStart })
        .andWhere('inv.invoiceDate <= :today', { today })
        .getRawOne(),

      // 9. This Month Returns
      this.invoiceRepo.manager
        .createQueryBuilder(SalesReturn, 'sr')
        .select('COALESCE(SUM(sr.totalReturnAmountKd), 0)', 'total')
        .where('sr.status = :status', { status: 'POSTED' })
        .andWhere('sr.returnDate >= :monthStart', { monthStart })
        .andWhere('sr.returnDate <= :today', { today })
        .getRawOne(),

      // 10. Month COGS (SQL-aggregated)
      this.invoiceLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.invoice', 'inv')
        .innerJoin('line.product', 'prod')
        .select('COALESCE(SUM((line.totalPcs / 12.0) * prod.purchasePrice), 0)', 'cogs')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate >= :monthStart', { monthStart })
        .andWhere('inv.invoiceDate <= :today', { today })
        .getRawOne(),

      // 11. Month Returned COGS (SQL-aggregated)
      this.invoiceRepo.manager
        .createQueryBuilder(SalesReturnLine, 'srl')
        .innerJoin('srl.salesReturn', 'sr')
        .innerJoin('srl.product', 'prod')
        .select('COALESCE(SUM((srl.returnTotalPcs / 12.0) * prod.purchasePrice), 0)', 'returnedCogs')
        .where('sr.status = :status', { status: 'POSTED' })
        .andWhere('sr.returnDate >= :monthStart', { monthStart })
        .andWhere('sr.returnDate <= :today', { today })
        .getRawOne(),

      // 12. Purchases This Month
      this.purchaseRepo
        .createQueryBuilder('rec')
        .select('COALESCE(SUM(rec.totalAmountKd), 0)', 'totalAmount')
        .addSelect('COALESCE(SUM(rec.totalPcs), 0)', 'totalPcs')
        .addSelect('COUNT(rec.id)', 'count')
        .where('rec.receiptDate >= :monthStart', { monthStart })
        .andWhere('rec.receiptDate <= :today', { today })
        .getRawOne(),
    ]);

    const todaySalesKd = Number(todaySalesRaw?.total || 0);
    const todayInvoiceCount = Number(todaySalesRaw?.count || 0);
    const todayReturnsKd = Number(todayReturnsRaw?.total || 0);
    const todayNetSalesKd = todaySalesKd - todayReturnsKd;

    const pendingPaymentsKd = Number(pendingCustomersRaw?.total || 0);
    const pendingCustomerCount = Number(pendingCustomersRaw?.count || 0);

    const totalStockPcs = Number(stockValRaw?.totalPcs || 0);
    const totalStockValuationKd = Number(stockValRaw?.totalValuation || 0);

    const stockOutTodayPcs = Number(stockOutRaw?.totalPcs || 0);
    const stockReceivedTodayPcs = Number(stockInRaw?.totalPcs || 0);

    const thisMonthExpensesKd = Number(monthExpensesRaw?.total || 0);
    const thisMonthExpensesCount = Number(monthExpensesRaw?.count || 0);

    const monthSalesRevenueKd = Number(monthSalesRaw?.total || 0);
    const monthReturnsKd = Number(monthReturnsRaw?.total || 0);
    const monthNetSalesRevenueKd = monthSalesRevenueKd - monthReturnsKd;

    const monthCogsKd = Number(monthCogsRaw?.cogs || 0);
    const monthReturnedCogsKd = Number(monthReturnedCogsRaw?.returnedCogs || 0);
    const monthNetCogsKd = monthCogsKd - monthReturnedCogsKd;
    const monthGrossProfitKd = monthNetSalesRevenueKd - monthNetCogsKd;
    const monthNetProfitKd = monthGrossProfitKd - thisMonthExpensesKd;

    const monthPurchasesKd = Number(monthPurchasesRaw?.totalAmount || 0);
    const monthPurchasesPcs = Number(monthPurchasesRaw?.totalPcs || 0);

    const result = {
      todaySales: {
        amountKd: Number(todayNetSalesKd.toFixed(3)),
        invoiceCount: todayInvoiceCount,
      },
      pendingPayments: {
        amountKd: Number(pendingPaymentsKd.toFixed(3)),
        customerCount: pendingCustomerCount,
      },
      stockValuation: {
        totalCostValuationKd: Number(totalStockValuationKd.toFixed(3)),
        totalStockPcs,
        totalStockDozen: Math.floor(totalStockPcs / 12),
        remainderPcs: totalStockPcs % 12,
      },
      stockOutToday: {
        totalPcs: stockOutTodayPcs,
        dozen: Math.floor(stockOutTodayPcs / 12),
        pieces: stockOutTodayPcs % 12,
      },
      stockReceivedToday: {
        totalPcs: stockReceivedTodayPcs,
        dozen: Math.floor(stockReceivedTodayPcs / 12),
        pieces: stockReceivedTodayPcs % 12,
      },
      thisMonthExpenses: {
        amountKd: Number(thisMonthExpensesKd.toFixed(3)),
        count: thisMonthExpensesCount,
      },
      thisMonthProfitLoss: {
        salesRevenueKd: Number(monthNetSalesRevenueKd.toFixed(3)),
        cogsKd: Number(monthNetCogsKd.toFixed(3)),
        grossProfitKd: Number(monthGrossProfitKd.toFixed(3)),
        expensesKd: Number(thisMonthExpensesKd.toFixed(3)),
        netProfitKd: Number(monthNetProfitKd.toFixed(3)),
        isProfit: monthNetProfitKd >= 0,
      },
      thisMonthPurchases: {
        amountKd: Number(monthPurchasesKd.toFixed(3)),
        totalPcs: monthPurchasesPcs,
        dozen: Math.floor(monthPurchasesPcs / 12),
        pieces: monthPurchasesPcs % 12,
      },
    };

    this.summaryCache = { data: result, expiry: nowMs + 15000 };
    return result;
  }

  /**
   * 2. Sales & Profit Trends Chart (Parallel queries + Cache)
   */
  async getTrends(period: string = '7d') {
    const nowMs = Date.now();
    const cached = this.trendsCache.get(period);
    if (cached && cached.expiry > nowMs) {
      return cached.data;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let fromDateStr = todayStr;

    if (period === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      fromDateStr = d.toISOString().split('T')[0];
    } else if (period === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      fromDateStr = d.toISOString().split('T')[0];
    } else if (period === 'thisMonth') {
      fromDateStr = `${todayStr.substring(0, 7)}-01`;
    } else if (period === 'thisYear') {
      fromDateStr = `${now.getFullYear()}-01-01`;
    }

    // Load posted invoices, returns, lines, returnLines, and expenses IN PARALLEL
    const [invoices, returns, invoiceLines, returnLines, expenses] = await Promise.all([
      this.invoiceRepo
        .createQueryBuilder('inv')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate >= :fromDate', { fromDate: fromDateStr })
        .andWhere('inv.invoiceDate <= :toDate', { toDate: todayStr })
        .getMany(),

      this.invoiceRepo.manager
        .createQueryBuilder(SalesReturn, 'sr')
        .where('sr.status = :status', { status: 'POSTED' })
        .andWhere('sr.returnDate >= :fromDate', { fromDate: fromDateStr })
        .andWhere('sr.returnDate <= :toDate', { toDate: todayStr })
        .getMany(),

      this.invoiceLineRepo
        .createQueryBuilder('line')
        .innerJoin('line.invoice', 'inv')
        .innerJoinAndSelect('line.product', 'prod')
        .where('inv.status = :status', { status: 'POSTED' })
        .andWhere('inv.invoiceDate >= :fromDate', { fromDate: fromDateStr })
        .andWhere('inv.invoiceDate <= :toDate', { toDate: todayStr })
        .getMany(),

      this.invoiceRepo.manager
        .createQueryBuilder(SalesReturnLine, 'srl')
        .innerJoin('srl.salesReturn', 'sr')
        .innerJoinAndSelect('srl.product', 'prod')
        .where('sr.status = :status', { status: 'POSTED' })
        .andWhere('sr.returnDate >= :fromDate', { fromDate: fromDateStr })
        .andWhere('sr.returnDate <= :toDate', { toDate: todayStr })
        .getMany(),

      this.expenseRepo
        .createQueryBuilder('exp')
        .where("exp.status != 'CANCELLED'")
        .andWhere('exp.expenseDate >= :fromDate', { fromDate: fromDateStr })
        .andWhere('exp.expenseDate <= :toDate', { toDate: todayStr })
        .getMany(),
    ]);

    // Build timeline points
    if (period === 'thisYear') {
      // Monthly aggregation
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const year = now.getFullYear();

      const result = months.map((mName, idx) => {
        const monthNum = String(idx + 1).padStart(2, '0');
        const prefix = `${year}-${monthNum}`;

        const monthInvs = invoices.filter((i) => i.invoiceDate.startsWith(prefix));
        const monthRets = returns.filter((r) => r.returnDate.startsWith(prefix));
        const grossSalesKd = monthInvs.reduce((sum, i) => sum + Number(i.totalAmountKd || 0), 0);
        const retSalesKd = monthRets.reduce((sum, r) => sum + Number(r.totalReturnAmountKd || 0), 0);
        const salesKd = grossSalesKd - retSalesKd;

        const monthLines = invoiceLines.filter((l) => (l as any).__invoiceDate?.startsWith(prefix) || true); // approximate
        const grossCogsKd = monthLines
          .filter((l) => invoices.some((inv) => inv.id === (l as any).invoiceId && inv.invoiceDate.startsWith(prefix)))
          .reduce((sum, l) => sum + ((Number(l.totalPcs || 0) / 12) * Number(l.product?.purchasePrice || 0)), 0);

        const monthRetLines = returnLines.filter((l) => (l as any).__returnDate?.startsWith(prefix) || true);
        const retCogsKd = monthRetLines
          .filter((l) => returns.some((ret) => ret.id === (l as any).salesReturnId && ret.returnDate.startsWith(prefix)))
          .reduce((sum, l) => sum + ((Number(l.returnTotalPcs || 0) / 12) * Number(l.product?.purchasePrice || 0)), 0);

        const cogsKd = grossCogsKd - retCogsKd;

        const expKd = expenses
          .filter((e) => e.expenseDate.startsWith(prefix))
          .reduce((sum, e) => sum + Number(e.amountKd || 0), 0);

        const profitKd = salesKd - cogsKd - expKd;

        return {
          date: prefix,
          label: mName,
          salesKd: Number(salesKd.toFixed(3)),
          expensesKd: Number(expKd.toFixed(3)),
          profitKd: Number(profitKd.toFixed(3)),
        };
      });

      this.trendsCache.set(period, { data: result, expiry: nowMs + 30000 });
      return result;
    }

    // Daily aggregation for 7d, 30d, thisMonth
    const start = new Date(fromDateStr);
    const end = new Date(todayStr);
    const points: any[] = [];

    const current = new Date(start);
    while (current <= end) {
      const dStr = current.toISOString().split('T')[0];
      const dayLabel = current.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      const dayInvs = invoices.filter((i) => i.invoiceDate === dStr);
      const dayRets = returns.filter((r) => r.returnDate === dStr);
      const grossSalesKd = dayInvs.reduce((sum, i) => sum + Number(i.totalAmountKd || 0), 0);
      const retSalesKd = dayRets.reduce((sum, r) => sum + Number(r.totalReturnAmountKd || 0), 0);
      const salesKd = grossSalesKd - retSalesKd;

      // COGS for this day
      const dayInvIds = new Set(dayInvs.map((i) => i.id));
      const dayLines = invoiceLines.filter((l) => dayInvIds.has((l as any).invoiceId || (l.invoice as any)?.id));
      const grossCogsKd = dayLines.reduce((sum, l) => sum + ((Number(l.totalPcs || 0) / 12) * Number(l.product?.purchasePrice || 0)), 0);

      const dayRetIds = new Set(dayRets.map((r) => r.id));
      const dayRetLines = returnLines.filter((l) => dayRetIds.has((l as any).salesReturnId || (l.salesReturn as any)?.id));
      const retCogsKd = dayRetLines.reduce((sum, l) => sum + ((Number(l.returnTotalPcs || 0) / 12) * Number(l.product?.purchasePrice || 0)), 0);

      const cogsKd = grossCogsKd - retCogsKd;

      const expKd = expenses
        .filter((e) => e.expenseDate === dStr)
        .reduce((sum, e) => sum + Number(e.amountKd || 0), 0);

      const profitKd = salesKd - cogsKd - expKd;

      points.push({
        date: dStr,
        label: dayLabel,
        salesKd: Number(salesKd.toFixed(3)),
        expensesKd: Number(expKd.toFixed(3)),
        profitKd: Number(profitKd.toFixed(3)),
      });

      current.setDate(current.getDate() + 1);
    }

    this.trendsCache.set(period, { data: points, expiry: nowMs + 30000 });
    return points;
  }

  /**
   * 3. Top Pending Customers
   */
  async getPendingPayments(limit: number = 5) {
    const customers = await this.customerRepo
      .createQueryBuilder('cust')
      .leftJoinAndSelect('cust.invoices', 'inv')
      .where('cust.totalOutstanding > 0')
      .orderBy('cust.totalOutstanding', 'DESC')
      .take(limit)
      .getMany();

    const today = new Date();

    return customers.map((c) => {
      const unpaidInvoices = (c.invoices || []).filter(
        (inv) => inv.status === 'POSTED' && Number(inv.outstandingKd || 0) > 0,
      );

      // Latest unpaid invoice
      const latestInv = unpaidInvoices[unpaidInvoices.length - 1];

      // Oldest unpaid invoice date for overdue calculation
      let oldestDate: string | null = null;
      let daysOverdue = 0;
      for (const inv of unpaidInvoices) {
        if (!oldestDate || new Date(inv.invoiceDate) < new Date(oldestDate)) {
          oldestDate = inv.invoiceDate;
        }
      }

      // Check opening balance age if no older invoice
      const openingKd = Number(c.openingOutstandingKd) || 0;
      if (openingKd > 0 && c.openingBalanceDate) {
        if (!oldestDate || new Date(c.openingBalanceDate) < new Date(oldestDate)) {
          oldestDate = c.openingBalanceDate;
        }
      }

      if (oldestDate) {
        const diffMs = today.getTime() - new Date(oldestDate).getTime();
        daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      return {
        id: c.id,
        name: c.name,
        nameAr: c.nameAr || null,
        phone: c.phone || null,
        outstandingKd: Number(Number(c.totalOutstanding || 0).toFixed(3)),
        latestInvoiceNumber: latestInv?.invoiceNumber || (openingKd > 0 ? 'Opening Balance' : null),
        paymentStatus: unpaidInvoices.length > 0 ? (latestInv?.paymentStatus || 'PENDING') : 'PENDING',
        oldestUnpaidDate: oldestDate,
        daysOverdue,
        isOverdue: daysOverdue > 30, // flagged if past 30 days
      };
    });
  }

  /**
   * 4. Top Low Stock Items
   */
  async getLowStock(limit: number = 5) {
    const products = await this.productRepo
      .createQueryBuilder('prod')
      .where('prod.currentStockPcs <= prod.reorderLevelPcs')
      .andWhere('prod.isActive = true')
      .orderBy('prod.currentStockPcs', 'ASC')
      .take(limit)
      .getMany();

    return products.map((p) => {
      const stock = Number(p.currentStockPcs) || 0;
      return {
        id: p.id,
        articleNumber: p.articleNumber,
        nameEn: p.nameEn,
        nameAr: p.nameAr || null,
        currentStockPcs: stock,
        currentStockDozen: Math.floor(stock / 12),
        currentStockRemainder: stock % 12,
        reorderLevelPcs: Number(p.reorderLevelPcs) || 12,
        sellingPriceKd: Number(Number(p.sellingPrice || 0).toFixed(3)),
      };
    });
  }

  /**
   * 5. Recent Business Transactions (Unified Business Activity Feed - Parallel)
   */
  async getRecentTransactions(limit: number = 10) {
    const [invoices, receipts, purchases, expenses] = await Promise.all([
      this.invoiceRepo.find({
        relations: { customer: true },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.receiptRepo.find({
        relations: { customer: true },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.purchaseRepo.find({
        relations: { supplier: true },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.expenseRepo.find({
        order: { createdAt: 'DESC' },
        take: limit,
      }),
    ]);

    const feed: any[] = [];

    for (const inv of invoices) {
      feed.push({
        id: `INV-${inv.id}`,
        type: 'SALE',
        reference: inv.invoiceNumber,
        date: inv.invoiceDate,
        amountKd: Number(Number(inv.totalAmountKd || 0).toFixed(3)),
        status: inv.status === 'CANCELLED' ? 'CANCELLED' : inv.paymentStatus,
        entityName: inv.customer?.name || 'Walk-in Customer',
        detail: `${Math.floor(Number(inv.totalPcs || 0) / 12)} Doz ${Number(inv.totalPcs || 0) % 12} Pcs (${Number(inv.totalPcs || 0)} Pcs)`,
        createdAt: inv.createdAt,
      });
    }

    for (const r of receipts) {
      feed.push({
        id: `RCP-${r.id}`,
        type: 'PAYMENT',
        reference: r.receiptNumber,
        date: r.receiptDate,
        amountKd: Number(Number(r.amountKd || 0).toFixed(3)),
        status: r.paymentMethod,
        entityName: r.customer?.name || 'Customer',
        detail: `Payment Received (${r.paymentMethod})`,
        createdAt: r.createdAt,
      });
    }

    for (const pr of purchases) {
      feed.push({
        id: `PR-${pr.id}`,
        type: 'PURCHASE',
        reference: pr.receiptNumber,
        date: pr.receiptDate,
        amountKd: Number(Number(pr.totalAmountKd || 0).toFixed(3)),
        status: 'RECEIVED',
        entityName: pr.supplier?.name || 'Supplier',
        detail: `${Math.floor(Number(pr.totalPcs || 0) / 12)} Doz ${Number(pr.totalPcs || 0) % 12} Pcs (${Number(pr.totalPcs || 0)} Pcs)`,
        createdAt: pr.createdAt,
      });
    }

    for (const exp of expenses) {
      feed.push({
        id: `EXP-${exp.id}`,
        type: 'EXPENSE',
        reference: exp.expenseNumber,
        date: exp.expenseDate,
        amountKd: Number(Number(exp.amountKd || 0).toFixed(3)),
        status: exp.status,
        entityName: exp.category,
        detail: exp.description || exp.paidTo || 'Operational Expense',
        createdAt: exp.createdAt,
      });
    }

    // Sort by createdAt descending
    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return feed.slice(0, limit);
  }
}
