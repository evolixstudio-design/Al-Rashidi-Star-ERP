import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { PurchaseReceipt } from '../../database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from '../../database/entities/purchase-line.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { Expense } from '../../database/entities/expense.entity.js';
import { Category } from '../../database/entities/category.entity.js';
import { SalesReturn } from '../../database/entities/sales-return.entity.js';
import { SalesReturnLine } from '../../database/entities/sales-return-line.entity.js';

function getDefaultDates(from?: string, to?: string) {
  const now = new Date();
  const defaultTo = to || now.toISOString().split('T')[0];
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  // If from is empty string or 'all', allow wide history
  const defaultFrom = from === '' ? '1970-01-01' : (from || `${year}-${month}-01`);
  const effectiveTo = to === '' ? '2099-12-31' : defaultTo;
  return { from: defaultFrom, to: effectiveTo };
}

@Injectable()
export class ReportsService {
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
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SalesReturn)
    private readonly salesReturnRepo: Repository<SalesReturn>,
    @InjectRepository(SalesReturnLine)
    private readonly salesReturnLineRepo: Repository<SalesReturnLine>,
  ) {}

  /**
   * 1. Sales Summary Report
   */
  async getSalesSummary(fromDate?: string, toDate?: string) {
    const { from, to } = getDefaultDates(fromDate, toDate);

    // Posted invoices in range
    const invoices = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .where('invoice.invoiceDate >= :from', { from })
      .andWhere('invoice.invoiceDate <= :to', { to })
      .orderBy('invoice.invoiceDate', 'ASC')
      .getMany();

    let totalSalesKd = 0;
    let totalReceivedKd = 0;
    let totalOutstandingKd = 0;
    let postedCount = 0;
    let cancelledCount = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    const dailyMap = new Map<string, { date: string; invoiceCount: number; totalKd: number; receivedKd: number }>();
    const paymentMethodMap = new Map<string, { method: string; count: number; totalKd: number }>();

    for (const inv of invoices) {
      if (inv.status === 'CANCELLED') {
        cancelledCount++;
        continue;
      }

      postedCount++;
      const total = Number(inv.totalAmountKd) || 0;
      const received = Number(inv.amountReceivedKd) || 0;
      const outstanding = Number(inv.outstandingKd) || 0;

      totalSalesKd += total;
      totalReceivedKd += received;
      totalOutstandingKd += outstanding;

      if (inv.paymentStatus === 'PAID') paidCount++;
      else if (inv.paymentStatus === 'PARTIAL') partialCount++;
      else pendingCount++;

      // Daily aggregation
      const dateKey = inv.invoiceDate;
      const dayData = dailyMap.get(dateKey) || { date: dateKey, invoiceCount: 0, totalKd: 0, receivedKd: 0 };
      dayData.invoiceCount++;
      dayData.totalKd += total;
      dayData.receivedKd += received;
      dailyMap.set(dateKey, dayData);

      // Payment method aggregation
      const method = inv.paymentMethod || 'Unspecified';
      const pmData = paymentMethodMap.get(method) || { method, count: 0, totalKd: 0 };
      pmData.count++;
      pmData.totalKd += total;
      paymentMethodMap.set(method, pmData);
    }

    // Get total returns in date range
    const returnSumRaw = await this.salesReturnRepo
      .createQueryBuilder('sr')
      .select('SUM(sr.totalReturnAmountKd)', 'totalReturn')
      .where('sr.status = :status', { status: 'POSTED' })
      .andWhere('sr.returnDate >= :from', { from })
      .andWhere('sr.returnDate <= :to', { to })
      .getRawOne();
      
    const totalReturnedKd = Number(returnSumRaw?.totalReturn || 0);

    // Top selling products in date range
    const topProductsRaw = await this.invoiceLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.invoice', 'inv')
      .innerJoin('line.product', 'prod')
      .select('prod.id', 'productId')
      .addSelect('prod.articleNumber', 'articleNumber')
      .addSelect('prod.nameEn', 'nameEn')
      .addSelect('SUM(line.totalPcs)', 'totalPcs')
      .addSelect('SUM(line.lineTotalKd)', 'totalKd')
      .where('inv.status = :status', { status: 'POSTED' })
      .andWhere('inv.invoiceDate >= :from', { from })
      .andWhere('inv.invoiceDate <= :to', { to })
      .groupBy('prod.id')
      .addGroupBy('prod.articleNumber')
      .addGroupBy('prod.nameEn')
      .orderBy('SUM(line.lineTotalKd)', 'DESC')
      .limit(10)
      .getRawMany();

    const topSellingProducts = topProductsRaw.map((p) => ({
      productId: Number(p.productId),
      articleNumber: p.articleNumber,
      nameEn: p.nameEn,
      totalPcs: Number(p.totalPcs) || 0,
      totalDozen: Math.floor((Number(p.totalPcs) || 0) / 12),
      remainderPcs: (Number(p.totalPcs) || 0) % 12,
      totalKd: Number(Number(p.totalKd || 0).toFixed(3)),
    }));

    const dailyTrend = Array.from(dailyMap.values()).map((d) => ({
      ...d,
      totalKd: Number(d.totalKd.toFixed(3)),
      receivedKd: Number(d.receivedKd.toFixed(3)),
    }));

    const paymentMethods = Array.from(paymentMethodMap.values()).map((p) => ({
      ...p,
      totalKd: Number(p.totalKd.toFixed(3)),
    }));

    const summary = {
      totalGrossSalesKd: Number(totalSalesKd.toFixed(3)),
      totalReturnedKd: Number(totalReturnedKd.toFixed(3)),
      totalSalesKd: Number((totalSalesKd - totalReturnedKd).toFixed(3)),
      totalReceivedKd: Number(totalReceivedKd.toFixed(3)),
      totalOutstandingKd: Number(totalOutstandingKd.toFixed(3)),
      postedCount,
      totalInvoices: postedCount,
      cancelledCount,
      cancelledInvoices: cancelledCount,
      paidCount,
      paidInvoices: paidCount,
      partialCount,
      partialInvoices: partialCount,
      pendingCount,
      pendingInvoices: pendingCount,
    };

    const formattedTopSellingProducts = topSellingProducts.map((p) => ({
      ...p,
      productName: p.nameEn,
      quantitySoldDisplay: `${p.totalDozen} dz${p.remainderPcs > 0 ? ` ${p.remainderPcs} pcs` : ''}`,
      totalRevenueKd: p.totalKd,
    }));

    const byPaymentMethod = paymentMethods.map((p) => ({
      ...p,
      paymentMethod: p.method,
    }));

    const dailySales = dailyTrend.map((d) => ({
      ...d,
      totalRevenueKd: d.totalKd,
      count: d.invoiceCount,
    }));

    return {
      dateRange: { from, to },
      metrics: summary,
      summary,
      dailyTrend,
      dailySales,
      paymentMethods: byPaymentMethod,
      byPaymentMethod,
      topSellingProducts: formattedTopSellingProducts,
    };
  }

  /**
   * 2. Purchase Summary Report
   */
  async getPurchaseSummary(fromDate?: string, toDate?: string) {
    const { from, to } = getDefaultDates(fromDate, toDate);

    const receipts = await this.purchaseRepo
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.supplier', 'supplier')
      .where('receipt.receiptDate >= :from', { from })
      .andWhere('receipt.receiptDate <= :to', { to })
      .orderBy('receipt.receiptDate', 'ASC')
      .getMany();

    let totalPurchasesKd = 0;
    let totalPcs = 0;
    const supplierMap = new Map<string, { supplierId: number; supplierName: string; receiptCount: number; totalKd: number; totalPcs: number }>();
    const dailyMap = new Map<string, { date: string; receiptCount: number; totalKd: number; totalPcs: number }>();

    for (const r of receipts) {
      const amount = Number(r.totalAmountKd) || 0;
      const pcs = Number(r.totalPcs) || 0;
      totalPurchasesKd += amount;
      totalPcs += pcs;

      // Supplier
      const supName = r.supplier?.name || 'Unknown Supplier';
      const supId = r.supplierId || 0;
      const sData = supplierMap.get(supName) || {
        supplierId: supId,
        supplierName: supName,
        receiptCount: 0,
        totalKd: 0,
        totalPcs: 0,
      };
      sData.receiptCount++;
      sData.totalKd += amount;
      sData.totalPcs += pcs;
      supplierMap.set(supName, sData);

      // Daily
      const dKey = r.receiptDate;
      const dData = dailyMap.get(dKey) || { date: dKey, receiptCount: 0, totalKd: 0, totalPcs: 0 };
      dData.receiptCount++;
      dData.totalKd += amount;
      dData.totalPcs += pcs;
      dailyMap.set(dKey, dData);
    }

    // Top purchased products in date range
    const topPurchasedRaw = await this.purchaseLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.receipt', 'rec')
      .innerJoin('line.product', 'prod')
      .select('prod.id', 'productId')
      .addSelect('prod.articleNumber', 'articleNumber')
      .addSelect('prod.nameEn', 'nameEn')
      .addSelect('SUM(line.totalPcs)', 'totalPcs')
      .addSelect('SUM(line.lineTotalKd)', 'totalKd')
      .where('rec.receiptDate >= :from', { from })
      .andWhere('rec.receiptDate <= :to', { to })
      .groupBy('prod.id')
      .addGroupBy('prod.articleNumber')
      .addGroupBy('prod.nameEn')
      .orderBy('SUM(line.lineTotalKd)', 'DESC')
      .limit(10)
      .getRawMany();

    const topPurchasedProducts = topPurchasedRaw.map((p) => ({
      productId: Number(p.productId),
      articleNumber: p.articleNumber,
      nameEn: p.nameEn,
      totalPcs: Number(p.totalPcs) || 0,
      totalDozen: Math.floor((Number(p.totalPcs) || 0) / 12),
      remainderPcs: (Number(p.totalPcs) || 0) % 12,
      totalKd: Number(Number(p.totalKd || 0).toFixed(3)),
    }));

    const summary = {
      totalPurchasesKd: Number(totalPurchasesKd.toFixed(3)),
      totalReceiptsCount: receipts.length,
      receiptCount: receipts.length,
      totalPieces: totalPcs,
      totalDozen: Math.floor(totalPcs / 12),
      remainderPcs: totalPcs % 12,
    };

    const bySupplier = Array.from(supplierMap.values()).map((s) => ({
      ...s,
      count: s.receiptCount,
      totalKd: Number(s.totalKd.toFixed(3)),
    }));

    const formattedTopPurchasedProducts = topPurchasedProducts.map((p) => ({
      ...p,
      productName: p.nameEn,
      quantityPurchasedDisplay: `${p.totalDozen} dz${p.remainderPcs > 0 ? ` ${p.remainderPcs} pcs` : ''}`,
      totalCostKd: p.totalKd,
    }));

    return {
      dateRange: { from, to },
      metrics: summary,
      summary,
      supplierBreakdown: bySupplier,
      bySupplier,
      dailyTrend: Array.from(dailyMap.values()).map((d) => ({
        ...d,
        totalKd: Number(d.totalKd.toFixed(3)),
      })),
      topPurchasedProducts: formattedTopPurchasedProducts,
    };
  }

  /**
   * 3. Stock Valuation Report
   */
  async getStockValuation() {
    const products = await this.productRepo.find({
      relations: { category: true },
      order: { articleNumber: 'ASC' },
    });

    let totalStockPcs = 0;
    let totalCostValuationKd = 0;
    let totalRetailValuationKd = 0;
    let lowStockCount = 0;

    const categoryMap = new Map<string, {
      categoryName: string;
      productCount: number;
      totalStockPcs: number;
      costValuationKd: number;
      retailValuationKd: number;
    }>();

    const lowStockItems: any[] = [];

    for (const p of products) {
      const stock = Number(p.currentStockPcs) || 0;
      const reorder = Number(p.reorderLevelPcs) || 12;
      const costPrice = Number(p.purchasePrice) || 0; // per dozen
      const sellPrice = Number(p.sellingPrice) || 0;   // per dozen

      totalStockPcs += stock;

      // Valuation = (pcs / 12) * price_per_dozen
      const costVal = (stock / 12) * costPrice;
      const retailVal = (stock / 12) * sellPrice;

      totalCostValuationKd += costVal;
      totalRetailValuationKd += retailVal;

      if (stock <= reorder && p.isActive) {
        lowStockCount++;
        lowStockItems.push({
          id: p.id,
          articleNumber: p.articleNumber,
          nameEn: p.nameEn,
          currentStockPcs: stock,
          currentStockDozen: Math.floor(stock / 12),
          currentStockRemainder: stock % 12,
          reorderLevelPcs: reorder,
          costPriceKd: Number(costPrice.toFixed(3)),
          sellingPriceKd: Number(sellPrice.toFixed(3)),
        });
      }

      // Category breakdown
      const catName = p.category?.nameEn || 'Uncategorized';
      const cData = categoryMap.get(catName) || {
        categoryName: catName,
        productCount: 0,
        totalStockPcs: 0,
        costValuationKd: 0,
        retailValuationKd: 0,
      };
      cData.productCount++;
      cData.totalStockPcs += stock;
      cData.costValuationKd += costVal;
      cData.retailValuationKd += retailVal;
      categoryMap.set(catName, cData);
    }

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      ...c,
      totalDozen: Math.floor(c.totalStockPcs / 12),
      remainderPcs: c.totalStockPcs % 12,
      costValuationKd: Number(c.costValuationKd.toFixed(3)),
      retailValuationKd: Number(c.retailValuationKd.toFixed(3)),
    })).sort((a, b) => b.costValuationKd - a.costValuationKd);

    const items = products.map((p) => {
      const stock = Number(p.currentStockPcs) || 0;
      const costPrice = Number(p.purchasePrice) || 0;
      const sellPrice = Number(p.sellingPrice) || 0;
      const costVal = (stock / 12) * costPrice;
      const dozen = Math.floor(stock / 12);
      const rem = stock % 12;
      return {
        id: p.id,
        articleNumber: p.articleNumber,
        productName: p.nameEn,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        stockPcs: stock,
        stockDisplay: `${dozen} dz${rem > 0 ? ` ${rem} pcs` : ''}`,
        costPriceKd: Number(costPrice.toFixed(3)),
        sellingPriceKd: Number(sellPrice.toFixed(3)),
        totalValuationKd: Number(costVal.toFixed(3)),
        retailValuationKd: Number(((stock / 12) * sellPrice).toFixed(3)),
      };
    });

    const metrics = {
      totalProducts: products.length,
      totalStockPcs,
      totalStockDozen: Math.floor(totalStockPcs / 12),
      remainderPcs: totalStockPcs % 12,
      totalCostValuationKd: Number(totalCostValuationKd.toFixed(3)),
      totalRetailValuationKd: Number(totalRetailValuationKd.toFixed(3)),
      potentialProfitKd: Number((totalRetailValuationKd - totalCostValuationKd).toFixed(3)),
      lowStockCount,
    };

    return {
      metrics,
      totalCostValuationKd: metrics.totalCostValuationKd,
      totalRetailValuationKd: metrics.totalRetailValuationKd,
      potentialProfitKd: metrics.potentialProfitKd,
      categoryBreakdown,
      items,
      lowStockItems: lowStockItems.sort((a, b) => a.currentStockPcs - b.currentStockPcs),
    };
  }

  /**
   * 4. Customer Outstanding Report
   */
  async getCustomerOutstanding() {
    const customers = await this.customerRepo.find({
      relations: { invoices: true },
      order: { totalOutstanding: 'DESC' },
    });

    let totalOutstandingKd = 0;
    let totalSalesKd = 0;
    let totalReceivedKd = 0;
    let withOutstandingCount = 0;

    let aging0to30 = 0;
    let aging31to60 = 0;
    let aging61to90 = 0;
    let agingOver90 = 0;

    const today = new Date();

    const customerList = customers.map((c) => {
      const out = Number(c.totalOutstanding) || 0;
      const opening = Number(c.openingOutstandingKd) || 0;
      const sales = Number(c.totalSales) || 0;
      const received = Number(c.totalReceived) || 0;

      totalOutstandingKd += out;
      totalSalesKd += sales;
      totalReceivedKd += received;

      if (out > 0) withOutstandingCount++;

      // Find unpaid invoices for aging & oldest unpaid
      const unpaidInvoices = (c.invoices || []).filter(
        (inv) => inv.status === 'POSTED' && Number(inv.outstandingKd || 0) > 0,
      );

      let oldestUnpaidDate: string | null = null;
      let oldestDaysAgo = 0;

      for (const inv of unpaidInvoices) {
        const invDate = new Date(inv.invoiceDate);
        const diffDays = Math.floor((today.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
        const invOut = Number(inv.outstandingKd) || 0;

        if (diffDays <= 30) aging0to30 += invOut;
        else if (diffDays <= 60) aging31to60 += invOut;
        else if (diffDays <= 90) aging61to90 += invOut;
        else agingOver90 += invOut;

        if (!oldestUnpaidDate || invDate < new Date(oldestUnpaidDate)) {
          oldestUnpaidDate = inv.invoiceDate;
          oldestDaysAgo = diffDays;
        }
      }

      return {
        id: c.id,
        customerId: c.id,
        name: c.name,
        customerName: c.name,
        phone: c.phone || null,
        totalSalesKd: Number(sales.toFixed(3)),
        totalReceivedKd: Number(received.toFixed(3)),
        openingOutstandingKd: Number(opening.toFixed(3)),
        invoiceOutstandingKd: Number(Math.max(0, out - opening).toFixed(3)),
        outstandingKd: Number(out.toFixed(3)),
        unpaidInvoiceCount: unpaidInvoices.length,
        oldestUnpaidDate,
        oldestDaysAgo,
      };
    });

    const metrics = {
      totalOutstandingKd: Number(totalOutstandingKd.toFixed(3)),
      totalSalesKd: Number(totalSalesKd.toFixed(3)),
      totalReceivedKd: Number(totalReceivedKd.toFixed(3)),
      totalCustomers: customers.length,
      withOutstandingCount,
      customersWithBalanceCount: withOutstandingCount,
      settledCustomersCount: Math.max(0, customers.length - withOutstandingCount),
      aging: {
        days0to30Kd: Number(aging0to30.toFixed(3)),
        days31to60Kd: Number(aging31to60.toFixed(3)),
        days61to90Kd: Number(aging61to90.toFixed(3)),
        daysOver90Kd: Number(agingOver90.toFixed(3)),
      },
    };

    return {
      metrics,
      totalOutstandingKd: metrics.totalOutstandingKd,
      totalSalesKd: metrics.totalSalesKd,
      totalReceivedKd: metrics.totalReceivedKd,
      customersWithBalanceCount: metrics.customersWithBalanceCount,
      settledCustomersCount: metrics.settledCustomersCount,
      customers: customerList.sort((a, b) => b.outstandingKd - a.outstandingKd),
    };
  }

  /**
   * 5. Expense Summary Report
   */
  async getExpenseSummary(fromDate?: string, toDate?: string) {
    const { from, to } = getDefaultDates(fromDate, toDate);

    const expenses = await this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.expenseDate >= :from', { from })
      .andWhere('expense.expenseDate <= :to', { to })
      .andWhere("expense.status != 'CANCELLED'")
      .orderBy('expense.expenseDate', 'ASC')
      .getMany();

    let totalExpensesKd = 0;
    const categoryMap = new Map<string, { category: string; totalKd: number; count: number }>();
    const dailyMap = new Map<string, { date: string; totalKd: number; count: number }>();
    const paymentMap = new Map<string, { method: string; totalKd: number; count: number }>();

    for (const exp of expenses) {
      const amt = Number(exp.amountKd) || 0;
      totalExpensesKd += amt;

      // Category
      const cat = exp.category || 'Miscellaneous';
      const cData = categoryMap.get(cat) || { category: cat, totalKd: 0, count: 0 };
      cData.totalKd += amt;
      cData.count++;
      categoryMap.set(cat, cData);

      // Daily
      const d = exp.expenseDate;
      const dData = dailyMap.get(d) || { date: d, totalKd: 0, count: 0 };
      dData.totalKd += amt;
      dData.count++;
      dailyMap.set(d, dData);

      // Payment method
      const pm = exp.paymentMethod || 'Cash';
      const pData = paymentMap.get(pm) || { method: pm, totalKd: 0, count: 0 };
      pData.totalKd += amt;
      pData.count++;
      paymentMap.set(pm, pData);
    }

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      category: c.category,
      totalKd: Number(c.totalKd.toFixed(3)),
      count: c.count,
      percentage: totalExpensesKd > 0 ? Number(((c.totalKd / totalExpensesKd) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalKd - a.totalKd);

    const summary = {
      totalExpensesKd: Number(totalExpensesKd.toFixed(3)),
      totalExpenseCount: expenses.length,
    };

    return {
      dateRange: { from, to },
      metrics: summary,
      summary,
      categoryBreakdown,
      byCategory: categoryBreakdown,
      dailyTrend: Array.from(dailyMap.values()).map((d) => ({
        ...d,
        totalKd: Number(d.totalKd.toFixed(3)),
      })),
      paymentMethodBreakdown: Array.from(paymentMap.values()).map((p) => ({
        ...p,
        totalKd: Number(p.totalKd.toFixed(3)),
      })),
    };
  }

  /**
   * 6. Profit & Loss Report
   */
  async getProfitLoss(fromDate?: string, toDate?: string) {
    const { from, to } = getDefaultDates(fromDate, toDate);

    // 1. Total Revenue from posted invoices in range
    const invoiceSumRaw = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmountKd)', 'totalRevenue')
      .addSelect('COUNT(invoice.id)', 'invoiceCount')
      .where('invoice.status = :status', { status: 'POSTED' })
      .andWhere('invoice.invoiceDate >= :from', { from })
      .andWhere('invoice.invoiceDate <= :to', { to })
      .getRawOne();

    const totalRevenueKd = Number(invoiceSumRaw?.totalRevenue || 0);
    const invoiceCount = Number(invoiceSumRaw?.invoiceCount || 0);

    const returnSumRaw = await this.salesReturnRepo
      .createQueryBuilder('sr')
      .select('SUM(sr.totalReturnAmountKd)', 'totalReturn')
      .where('sr.status = :status', { status: 'POSTED' })
      .andWhere('sr.returnDate >= :from', { from })
      .andWhere('sr.returnDate <= :to', { to })
      .getRawOne();
      
    const totalReturnsKd = Number(returnSumRaw?.totalReturn || 0);
    const netRevenueKd = totalRevenueKd - totalReturnsKd;

    // 2. Cost of Goods Sold (COGS) for lines belonging to posted invoices in range
    const cogsLines = await this.invoiceLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.invoice', 'inv')
      .innerJoinAndSelect('line.product', 'prod')
      .where('inv.status = :status', { status: 'POSTED' })
      .andWhere('inv.invoiceDate >= :from', { from })
      .andWhere('inv.invoiceDate <= :to', { to })
      .getMany();

    let totalCogsKd = 0;
    let totalItemsSoldPcs = 0;

    for (const line of cogsLines) {
      const pcs = Number(line.totalPcs) || 0;
      totalItemsSoldPcs += pcs;
      const costPricePerDozen = Number(line.product?.purchasePrice) || 0;
      const lineCogs = (pcs / 12) * costPricePerDozen;
      totalCogsKd += lineCogs;
    }

    const cogsReturnsLines = await this.salesReturnLineRepo
      .createQueryBuilder('srl')
      .innerJoin('srl.salesReturn', 'sr')
      .innerJoinAndSelect('srl.product', 'prod')
      .where('sr.status = :status', { status: 'POSTED' })
      .andWhere('sr.returnDate >= :from', { from })
      .andWhere('sr.returnDate <= :to', { to })
      .getMany();

    let totalReturnedCogsKd = 0;
    for (const line of cogsReturnsLines) {
      const pcs = Number(line.returnTotalPcs) || 0;
      const costPricePerDozen = Number(line.product?.purchasePrice) || 0;
      const lineCogs = (pcs / 12) * costPricePerDozen;
      totalReturnedCogsKd += lineCogs;
    }

    const netCogsKd = totalCogsKd - totalReturnedCogsKd;
    const grossProfitKd = netRevenueKd - netCogsKd;
    const grossMarginPercent = netRevenueKd > 0
      ? Number(((grossProfitKd / netRevenueKd) * 100).toFixed(2))
      : 0;

    // 3. Operating Expenses in range
    const expenseSumRaw = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('SUM(expense.amountKd)', 'totalExpenses')
      .addSelect('COUNT(expense.id)', 'expenseCount')
      .where('expense.expenseDate >= :from', { from })
      .andWhere('expense.expenseDate <= :to', { to })
      .andWhere("expense.status != 'CANCELLED'")
      .getRawOne();

    const totalExpensesKd = Number(expenseSumRaw?.totalExpenses || 0);
    const expenseCount = Number(expenseSumRaw?.expenseCount || 0);

    // Detailed expenses by category
    const expenseCategoriesRaw = await this.expenseRepo
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amountKd)', 'totalKd')
      .addSelect('COUNT(expense.id)', 'count')
      .where('expense.expenseDate >= :from', { from })
      .andWhere('expense.expenseDate <= :to', { to })
      .andWhere("expense.status != 'CANCELLED'")
      .groupBy('expense.category')
      .orderBy('SUM(expense.amountKd)', 'DESC')
      .getRawMany();

    const expenseCategories = expenseCategoriesRaw.map((e) => ({
      category: e.category,
      totalKd: Number(Number(e.totalKd || 0).toFixed(3)),
      count: Number(e.count) || 0,
    }));

    // 4. Net Profit
    const netProfitKd = grossProfitKd - totalExpensesKd;
    const netMarginPercent = netRevenueKd > 0
      ? Number(((netProfitKd / netRevenueKd) * 100).toFixed(2))
      : 0;

    return {
      dateRange: { from, to },
      revenue: {
        totalGrossRevenueKd: Number(totalRevenueKd.toFixed(3)),
        totalReturnsKd: Number(totalReturnsKd.toFixed(3)),
        totalRevenueKd: Number(netRevenueKd.toFixed(3)),
        invoiceCount,
        totalItemsSoldPcs,
        totalItemsSoldDozen: Math.floor(totalItemsSoldPcs / 12),
      },
      cogs: {
        grossCogsKd: Number(totalCogsKd.toFixed(3)),
        returnedCogsKd: Number(totalReturnedCogsKd.toFixed(3)),
        totalCogsKd: Number(netCogsKd.toFixed(3)),
      },
      costOfGoodsSold: {
        totalCogsKd: Number(netCogsKd.toFixed(3)),
      },
      grossProfit: {
        grossProfitKd: Number(grossProfitKd.toFixed(3)),
        grossMarginPercent,
      },
      grossProfitKd: Number(grossProfitKd.toFixed(3)),
      operatingExpenses: {
        totalExpensesKd: Number(totalExpensesKd.toFixed(3)),
        expenseCount,
        categories: expenseCategories,
      },
      netProfit: {
        netProfitKd: Number(netProfitKd.toFixed(3)),
        netMarginPercent,
        isProfitable: netProfitKd >= 0,
      },
      netProfitKd: Number(netProfitKd.toFixed(3)),
    };
  }
}
