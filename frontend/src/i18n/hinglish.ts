export type Language = 'en' | 'hi';

export interface Translations {
  app: {
    title: string;
    arabicTitle: string;
    subtitle: string;
    copyright: string;
  };
  auth: {
    welcome: string;
    loginPrompt: string;
    selectOwner: string;
    username: string;
    password: string;
    passwordPlaceholder: string;
    loginButton: string;
    loggingIn: string;
    logout: string;
    confirmLogout: string;
    sessionExpired: string;
    invalidCredentials: string;
    passwordRequired: string;
    fullAccess: string;
    secureAccess: string;
    defaultPasswordHint: string;
    yesLogout: string;
    confirm: string;
  };
  nav: {
    home: string;
    sales: string;
    purchases: string;
    stock: string;
    payments: string;
    expenses: string;
    customers: string;
    suppliers: string;
    reports: string;
    settings: string;
    mainMenu: string;
    menu: string;
  };
  home: {
    welcomeBanner: string;
    quickActionsTitle: string;
    quickActionsSubtitle: string;
    actions: {
      newSale: { title: string; subtitle: string };
      receiveShipment: { title: string; subtitle: string };
      receivePayment: { title: string; subtitle: string };
      addExpense: { title: string; subtitle: string };
      searchStock: { title: string; subtitle: string };
    };
    securityTitle: string;
    securitySubtitle: string;
    securityItems: {
      ownerModel: string;
      auditTrail: string;
      doubleClickSafe: string;
      seniorUx: string;
    };
    recentAuditTitle: string;
    recentAuditSubtitle: string;
    viewAll: string;
    noAuditEvents: string;
    currentLocation: string;
    currency: string;
    ownerSessionActive: string;
    step: string;
  };
  settings: {
    title: string;
    subtitle: string;
    companyProfile: string;
    auditTrail: string;
    companyBasicInfo: string;
    companyBasicInfoDesc: string;
    companyNameEn: string;
    companyNameAr: string;
    phone: string;
    address: string;
    invoiceTermsEn: string;
    invoiceTermsAr: string;
    saveSuccess: string;
    saving: string;
    auditHistory: string;
    auditHistoryDesc: string;
    refresh: string;
    timestamp: string;
    action: string;
    performedBy: string;
    module: string;
    details: string;
    noAuditEvents: string;
    language: string;
    languageDesc: string;
  };
  stock: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    lowStockOnly: string;
    addProduct: string;
    articleNo: string;
    product: string;
    category: string;
    stockDozPcs: string;
    totalPcs: string;
    sellingPrice: string;
    statusCol: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    noProducts: string;
    editProduct: string;
    adjustStock: string;
    viewLedger: string;
    productName: string;
    productNameAr: string;
    color: string;
    size: string;
    purchasePrice: string;
    reorderLevel: string;
    initialDozen: string;
    initialPieces: string;
    notes: string;
    activeStatus: string;
    adjustType: string;
    addStock: string;
    removeStock: string;
    adjustDozen: string;
    adjustPieces: string;
    reason: string;
    reasonRecount: string;
    reasonDamage: string;
    reasonShortage: string;
    reasonReturn: string;
    reasonOther: string;
    ledgerTitle: string;
    ledgerDate: string;
    ledgerChange: string;
    ledgerBalance: string;
    ledgerSource: string;
    ledgerBy: string;
    noLedgerEntries: string;
    productCreated: string;
    productUpdated: string;
    stockAdjusted: string;
    closeLedger: string;
    importStock: string;
    importStockDesc: string;
    downloadTemplate: string;
    uploadCsv: string;
    pasteCsv: string;
    readyToImport: string;
    importSuccess: string;
    actions: string;
  };
  suppliers: {
    title: string;
    subtitle: string;
    addSupplier: string;
    name: string;
    contactPerson: string;
    phone: string;
    country: string;
    address: string;
    totalPayable: string;
    shipments: string;
    status: string;
    active: string;
    inactive: string;
    editSupplier: string;
    noSuppliers: string;
    supplierCreated: string;
    supplierUpdated: string;
    viewShipments: string;
    actions: string;
  };
  purchases: {
    title: string;
    subtitle: string;
    shipmentHistory: string;
    receiveShipment: string;
    receiptNo: string;
    supplier: string;
    date: string;
    containerNo: string;
    supplierInvoice: string;
    items: string;
    totalKd: string;
    totalPcs: string;
    status: string;
    noPurchases: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    step3Title: string;
    step3Subtitle: string;
    selectSupplier: string;
    containerPlaceholder: string;
    invoiceRefPlaceholder: string;
    notesPlaceholder: string;
    next: string;
    previous: string;
    articleSearch: string;
    productNameCol: string;
    dozen: string;
    pieces: string;
    unitCostKd: string;
    lineTotalKd: string;
    addItem: string;
    removeItem: string;
    noItemsAdded: string;
    grandTotal: string;
    receiveAndAddToStock: string;
    processing: string;
    shipmentSuccess: string;
    shipmentSuccessDetail: string;
    viewReceipt: string;
    newShipment: string;
    receiptDetail: string;
    receivedBy: string;
  };
  customers: {
    title: string;
    subtitle: string;
    addCustomer: string;
    name: string;
    nameAr: string;
    phone: string;
    address: string;
    totalSales: string;
    totalReceived: string;
    totalOutstanding: string;
    status: string;
    active: string;
    inactive: string;
    editCustomer: string;
    noCustomers: string;
    customerCreated: string;
    customerUpdated: string;
    searchPlaceholder: string;
    viewDetail: string;
    newSale: string;
    whatsappReminder: string;
    pendingInvoices: string;
    noPendingInvoices: string;
    actions: string;
    notes: string;
  };
  sales: {
    title: string;
    subtitle: string;
    invoiceHistory: string;
    newInvoice: string;
    invoiceNo: string;
    customer: string;
    date: string;
    totalKd: string;
    totalPcs: string;
    received: string;
    outstanding: string;
    paymentStatus: string;
    invoiceStatus: string;
    noInvoices: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    step3Title: string;
    step3Subtitle: string;
    selectCustomer: string;
    createCustomer: string;
    customerOutstanding: string;
    articleSearch: string;
    productNameCol: string;
    availableStock: string;
    dozen: string;
    pieces: string;
    sellingPriceKd: string;
    lineTotalKd: string;
    addItem: string;
    removeItem: string;
    noItemsAdded: string;
    grandTotal: string;
    next: string;
    previous: string;
    paymentChoiceTitle: string;
    paid: string;
    partial: string;
    pending: string;
    paymentMethod: string;
    amountReceived: string;
    dueDate: string;
    dueDateOptional: string;
    postInvoice: string;
    processing: string;
    invoiceSuccess: string;
    invoiceSuccessDetail: string;
    viewInvoice: string;
    printInvoice: string;
    whatsappReminder: string;
    done: string;
    cancelInvoice: string;
    cancelled: string;
    posted: string;
    draft: string;
    cash: string;
    bankTransfer: string;
    cheque: string;
    insufficientStock: string;
    notesPlaceholder: string;
  };
  payments: {
    title: string;
    subtitle: string;
    receivePayment: string;
    paymentHistory: string;
    receiptNo: string;
    customer: string;
    date: string;
    amountKd: string;
    paymentMethod: string;
    allocatedInvoice: string;
    noPayments: string;
    searchCustomer: string;
    customerOutstanding: string;
    selectInvoice: string;
    enterAmount: string;
    savePayment: string;
    processing: string;
    paymentSuccess: string;
    paymentSuccessDetail: string;
    viewReceipt: string;
    newPayment: string;
    performedBy: string;
    generalPayment: string;
    notes: string;
  };
  expenses: {
    title: string;
    subtitle: string;
    addExpense: string;
    editExpense: string;
    expenseHistory: string;
    expenseNo: string;
    category: string;
    description: string;
    amountKd: string;
    date: string;
    paymentMethod: string;
    paidTo: string;
    receiptRef: string;
    notes: string;
    recordedBy: string;
    noExpenses: string;
    totalExpenses: string;
    thisMonthExpenses: string;
    todayExpenses: string;
    averageExpense: string;
    categoryBreakdown: string;
    filterByCategory: string;
    allCategories: string;
    dateRange: string;
    from: string;
    to: string;
    searchPlaceholder: string;
    saveExpense: string;
    deleteExpense: string;
    confirmDelete: string;
    expenseSaved: string;
    expenseDeleted: string;
    processing: string;
    actions: string;
  };
  reports: {
    title: string;
    subtitle: string;
    tabs: {
      sales: string;
      purchases: string;
      stockValuation: string;
      customerOutstanding: string;
      expenses: string;
      profitLoss: string;
    };
    dateRange: string;
    from: string;
    to: string;
    presets: {
      today: string;
      thisWeek: string;
      thisMonth: string;
      lastMonth: string;
      thisYear: string;
      allTime: string;
    };
    refresh: string;
    print: string;
    loading: string;
    noData: string;
    salesSummary: string;
    totalSales: string;
    totalReceived: string;
    totalOutstanding: string;
    invoicesCount: string;
    cancelledInvoices: string;
    dailySalesTrend: string;
    topSellingProducts: string;
    paymentMethods: string;
    purchaseSummary: string;
    totalPurchases: string;
    receiptsCount: string;
    totalPiecesBought: string;
    supplierBreakdown: string;
    topPurchasedProducts: string;
    stockValuation: string;
    costValuation: string;
    retailValuation: string;
    potentialProfit: string;
    categoryBreakdown: string;
    lowStockAlerts: string;
    customerOutstandingTitle: string;
    totalDue: string;
    customersWithDue: string;
    agingAnalysis: string;
    days0to30: string;
    days31to60: string;
    days61to90: string;
    daysOver90: string;
    oldestInvoice: string;
    unpaidCount: string;
    expensesSummary: string;
    operationalCosts: string;
    percentage: string;
    pnlStatement: string;
    revenue: string;
    cogs: string;
    cogsDesc: string;
    grossProfit: string;
    grossMargin: string;
    operatingExpenses: string;
    netProfit: string;
    netMargin: string;
    profitable: string;
    lossMaking: string;
  };
  placeholder: {
    upcomingModule: string;
    nextPhase: string;
    scheduledDesc: string;
    backToDashboard: string;
  };
  common: {
    save: string;
    cancel: string;
    confirm: string;
    back: string;
    loading: string;
    success: string;
    error: string;
    currency: string;
    dozen: string;
    pcs: string;
    totalPcs: string;
    activeOwner: string;
    version: string;
    english: string;
    hinglish: string;
    switchLanguage: string;
    close: string;
    edit: string;
    delete: string;
    add: string;
    search: string;
    noResults: string;
    required: string;
  };
}

const en: Translations = {
  app: {
    title: 'Rashidi Star',
    arabicTitle: 'شركة الرشيدي ستار للتجارة العامة',
    subtitle: 'General Trading Co. — Kuwait',
    copyright: '© 2026 Rashidi Star. All rights reserved.',
  },
  auth: {
    welcome: 'Welcome!',
    loginPrompt: 'Please select your account and log in',
    selectOwner: 'Who are you?',
    username: 'Username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Log In',
    loggingIn: 'Logging in...',
    logout: 'Log Out',
    confirmLogout: 'Are you sure you want to log out?',
    sessionExpired: 'Your session has expired. Please log in again.',
    invalidCredentials: 'Username or password is incorrect.',
    passwordRequired: 'Please enter your password.',
    fullAccess: 'Full Access',
    secureAccess: 'Secure access for business owners only.',
    defaultPasswordHint: 'Default password:',
    yesLogout: 'Yes, Log Out',
    confirm: 'Please confirm',
  },
  nav: {
    home: 'Dashboard',
    sales: 'Sales',
    purchases: 'Purchases',
    stock: 'Stock',
    payments: 'Payments',
    expenses: 'Expenses',
    customers: 'Customers',
    suppliers: 'Suppliers',
    reports: 'Reports',
    settings: 'Settings',
    mainMenu: 'Main Menu',
    menu: 'Menu',
  },
  home: {
    welcomeBanner: 'Welcome',
    quickActionsTitle: 'Quick Actions',
    quickActionsSubtitle: '5 Main Actions',
    actions: {
      newSale: { title: 'New Sale / Invoice', subtitle: 'Create a new customer invoice' },
      receiveShipment: { title: 'Receive Shipment', subtitle: 'Add received goods to stock' },
      receivePayment: { title: 'Receive Payment', subtitle: 'Record customer payment' },
      addExpense: { title: 'Add Expense', subtitle: 'Record a business expense' },
      searchStock: { title: 'Search Stock', subtitle: 'Check product and stock by article number' },
    },
    securityTitle: 'Security & Foundation',
    securitySubtitle: 'PostgreSQL + JWT + Idempotency',
    securityItems: {
      ownerModel: '2 Owners Model: Both owners have full application access.',
      auditTrail: 'Audit Trail: Every sensitive action is recorded.',
      doubleClickSafe: 'Double-Click Safe: Idempotency keys prevent double billing.',
      seniorUx: 'Accessible UX: Clear text and easy navigation.',
    },
    recentAuditTitle: 'Recent Audit Events',
    recentAuditSubtitle: 'Latest recorded events',
    viewAll: 'View All →',
    noAuditEvents: 'No audit events recorded yet.',
    currentLocation: 'Current Location',
    currency: 'Currency: K.D. (Kuwaiti Dinar)',
    ownerSessionActive: 'Owner Session Active',
    step: 'Step',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage company details and view system audit logs',
    companyProfile: 'Company Profile',
    auditTrail: 'Audit Trail',
    companyBasicInfo: 'Company Information',
    companyBasicInfoDesc: 'This information appears on printed customer invoices',
    companyNameEn: 'Company Name (English)',
    companyNameAr: 'Company Name (Arabic)',
    phone: 'Phone Number',
    address: 'Address',
    invoiceTermsEn: 'Invoice Terms (English)',
    invoiceTermsAr: 'Invoice Terms (Arabic)',
    saveSuccess: 'Company details saved successfully!',
    saving: 'Saving...',
    auditHistory: 'Audit Event History',
    auditHistoryDesc: 'Complete record of all sensitive transactions and logins',
    refresh: 'Refresh',
    timestamp: 'Timestamp',
    action: 'Action',
    performedBy: 'Performed By',
    module: 'Module / Entity',
    details: 'Details',
    noAuditEvents: 'No audit events found',
    language: 'Language',
    languageDesc: 'Switch between English and Hinglish',
  },
  stock: {
    title: 'Stock & Inventory',
    subtitle: 'Manage products, stock levels, and inventory movements',
    searchPlaceholder: 'Search by article number or product name...',
    allCategories: 'All Categories',
    lowStockOnly: 'Low Stock Only',
    addProduct: 'Add Product',
    articleNo: 'Article No.',
    product: 'Product',
    category: 'Category',
    stockDozPcs: 'Stock (Doz + Pcs)',
    totalPcs: 'Total Pcs',
    sellingPrice: 'Selling Price',
    statusCol: 'Status',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    noProducts: 'No products found. Add your first product to get started.',
    editProduct: 'Edit Product',
    adjustStock: 'Adjust Stock',
    viewLedger: 'View Ledger',
    productName: 'Product Name (English)',
    productNameAr: 'Product Name (Arabic)',
    color: 'Color',
    size: 'Size',
    purchasePrice: 'Purchase Price (K.D.)',
    reorderLevel: 'Reorder Level (Pcs)',
    initialDozen: 'Opening Stock (Dozen)',
    initialPieces: 'Opening Stock (Pieces)',
    notes: 'Notes',
    activeStatus: 'Active',
    adjustType: 'Adjustment Type',
    addStock: 'Add Stock',
    removeStock: 'Remove Stock',
    adjustDozen: 'Dozen',
    adjustPieces: 'Pieces',
    reason: 'Reason',
    reasonRecount: 'Recount',
    reasonDamage: 'Damage',
    reasonShortage: 'Shortage',
    reasonReturn: 'Return',
    reasonOther: 'Other',
    ledgerTitle: 'Stock Ledger',
    ledgerDate: 'Date',
    ledgerChange: 'Change',
    ledgerBalance: 'Balance After',
    ledgerSource: 'Source',
    ledgerBy: 'By',
    noLedgerEntries: 'No stock movements recorded yet.',
    productCreated: 'Product created successfully!',
    productUpdated: 'Product updated successfully!',
    stockAdjusted: 'Stock adjusted successfully!',
    closeLedger: 'Close Ledger',
    importStock: 'Import Opening Stock',
    importStockDesc: 'Bulk import products and opening stock from Excel/CSV',
    downloadTemplate: 'Download Template CSV',
    uploadCsv: 'Upload CSV File',
    pasteCsv: 'Or Paste CSV Text',
    readyToImport: 'Ready to import',
    importSuccess: 'Opening stock imported successfully!',
    actions: 'Actions',
  },
  suppliers: {
    title: 'Suppliers',
    subtitle: 'Manage supplier directory and payable balances',
    addSupplier: 'Add Supplier',
    name: 'Supplier Name',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    country: 'Country',
    address: 'Address',
    totalPayable: 'Total Payable (K.D.)',
    shipments: 'Shipments',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    editSupplier: 'Edit Supplier',
    noSuppliers: 'No suppliers found. Add your first supplier to get started.',
    supplierCreated: 'Supplier created successfully!',
    supplierUpdated: 'Supplier updated successfully!',
    viewShipments: 'View Shipments',
    actions: 'Actions',
  },
  purchases: {
    title: 'Purchases & Shipments',
    subtitle: 'Receive shipments and view purchase history',
    shipmentHistory: 'Shipment History',
    receiveShipment: 'Receive Shipment',
    receiptNo: 'Receipt No.',
    supplier: 'Supplier',
    date: 'Date',
    containerNo: 'Container / Shipment No.',
    supplierInvoice: 'Supplier Invoice Ref.',
    items: 'Items',
    totalKd: 'Total (K.D.)',
    totalPcs: 'Total Pcs',
    status: 'Status',
    noPurchases: 'No purchase receipts found.',
    step1Title: 'Step 1: Shipment Details',
    step1Subtitle: 'Enter supplier and shipment information',
    step2Title: 'Step 2: Add Products',
    step2Subtitle: 'Add received products with quantities and prices',
    step3Title: 'Step 3: Review & Confirm',
    step3Subtitle: 'Review all items before adding to stock',
    selectSupplier: 'Select Supplier',
    containerPlaceholder: 'e.g. CONT-2026-0045',
    invoiceRefPlaceholder: 'e.g. INV-GZ-8811',
    notesPlaceholder: 'Optional notes about this shipment...',
    next: 'Next →',
    previous: '← Previous',
    articleSearch: 'Enter article number...',
    productNameCol: 'Product Name',
    dozen: 'Dozen',
    pieces: 'Pieces',
    unitCostKd: 'Unit Cost (K.D.)',
    lineTotalKd: 'Line Total',
    addItem: 'Add Item',
    removeItem: 'Remove',
    noItemsAdded: 'No items added yet. Search by article number to add products.',
    grandTotal: 'Grand Total',
    receiveAndAddToStock: 'Receive & Add to Stock',
    processing: 'Processing...',
    shipmentSuccess: 'Shipment received successfully!',
    shipmentSuccessDetail: 'pcs added to stock.',
    viewReceipt: 'View Receipt',
    newShipment: 'New Shipment',
    receiptDetail: 'Receipt Details',
    receivedBy: 'Received By',
  },
  customers: {
    title: 'Customers',
    subtitle: 'Manage customer directory and outstanding balances',
    addCustomer: 'Add Customer',
    name: 'Customer Name',
    nameAr: 'Customer Name (Arabic)',
    phone: 'Phone',
    address: 'Address',
    totalSales: 'Total Sales (K.D.)',
    totalReceived: 'Total Received (K.D.)',
    totalOutstanding: 'Outstanding (K.D.)',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    editCustomer: 'Edit Customer',
    noCustomers: 'No customers found. Add your first customer to get started.',
    customerCreated: 'Customer created successfully!',
    customerUpdated: 'Customer updated successfully!',
    searchPlaceholder: 'Search by customer name or phone...',
    viewDetail: 'View Details',
    newSale: 'New Sale',
    whatsappReminder: 'WhatsApp Reminder',
    pendingInvoices: 'Pending Invoices',
    noPendingInvoices: 'No pending invoices for this customer.',
    actions: 'Actions',
    notes: 'Notes',
  },
  sales: {
    title: 'Sales & Invoices',
    subtitle: 'Create invoices and manage sales history',
    invoiceHistory: 'Invoice History',
    newInvoice: 'New Invoice',
    invoiceNo: 'Invoice No.',
    customer: 'Customer',
    date: 'Date',
    totalKd: 'Total (K.D.)',
    totalPcs: 'Total Pcs',
    received: 'Received (K.D.)',
    outstanding: 'Outstanding (K.D.)',
    paymentStatus: 'Payment',
    invoiceStatus: 'Status',
    noInvoices: 'No invoices found.',
    step1Title: 'Step 1: Select Customer',
    step1Subtitle: 'Choose or create a customer for this invoice',
    step2Title: 'Step 2: Add Products',
    step2Subtitle: 'Add products with quantities and selling prices',
    step3Title: 'Step 3: Review & Payment',
    step3Subtitle: 'Review all items and select payment status',
    selectCustomer: 'Select Customer',
    createCustomer: 'Create New Customer',
    customerOutstanding: 'Current Outstanding',
    articleSearch: 'Enter article number...',
    productNameCol: 'Product Name',
    availableStock: 'Available Stock',
    dozen: 'Dozen',
    pieces: 'Pieces',
    sellingPriceKd: 'Selling Price (K.D.)',
    lineTotalKd: 'Line Total',
    addItem: 'Add Item',
    removeItem: 'Remove',
    noItemsAdded: 'No items added yet. Search by article number to add products.',
    grandTotal: 'Grand Total',
    next: 'Next →',
    previous: '← Previous',
    paymentChoiceTitle: 'How is this invoice being paid?',
    paid: 'PAID',
    partial: 'PARTIAL',
    pending: 'PENDING',
    paymentMethod: 'Payment Method',
    amountReceived: 'Amount Received (K.D.)',
    dueDate: 'Due Date',
    dueDateOptional: 'Due date (optional)',
    postInvoice: 'Post Invoice',
    processing: 'Processing...',
    invoiceSuccess: 'Invoice posted successfully!',
    invoiceSuccessDetail: 'Stock has been deducted and customer balance updated.',
    viewInvoice: 'View Invoice',
    printInvoice: 'Print Invoice',
    whatsappReminder: 'WhatsApp Reminder',
    done: 'Done',
    cancelInvoice: 'Cancel Invoice',
    cancelled: 'Cancelled',
    posted: 'Posted',
    draft: 'Draft',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    cheque: 'Cheque',
    insufficientStock: 'Insufficient stock',
    notesPlaceholder: 'Optional notes for this invoice...',
  },
  payments: {
    title: 'Payments',
    subtitle: 'Receive customer payments and view payment history',
    receivePayment: 'Receive Payment',
    paymentHistory: 'Payment History',
    receiptNo: 'Receipt No.',
    customer: 'Customer',
    date: 'Date',
    amountKd: 'Amount (K.D.)',
    paymentMethod: 'Payment Method',
    allocatedInvoice: 'Allocated Invoice',
    noPayments: 'No payment receipts found.',
    searchCustomer: 'Search customer...',
    customerOutstanding: 'Total Outstanding',
    selectInvoice: 'Select Invoice',
    enterAmount: 'Enter Amount (K.D.)',
    savePayment: 'Save Payment',
    processing: 'Processing...',
    paymentSuccess: 'Payment received successfully!',
    paymentSuccessDetail: 'Customer balance has been updated.',
    viewReceipt: 'View Receipt',
    newPayment: 'New Payment',
    performedBy: 'Received By',
    generalPayment: 'General Payment',
    notes: 'Notes',
  },
  expenses: {
    title: 'Expenses',
    subtitle: 'Track operational and administrative expenditures',
    addExpense: 'Add Expense',
    editExpense: 'Edit Expense',
    expenseHistory: 'Expense History',
    expenseNo: 'Expense #',
    category: 'Category',
    description: 'Description',
    amountKd: 'Amount (K.D.)',
    date: 'Date',
    paymentMethod: 'Payment Method',
    paidTo: 'Paid To',
    receiptRef: 'Receipt Ref / Voucher',
    notes: 'Notes',
    recordedBy: 'Recorded By',
    noExpenses: 'No expenses recorded yet.',
    totalExpenses: 'Total Expenses',
    thisMonthExpenses: 'This Month',
    todayExpenses: 'Today',
    averageExpense: 'Average / Entry',
    categoryBreakdown: 'Expense by Category',
    filterByCategory: 'Filter Category',
    allCategories: 'All Categories',
    dateRange: 'Date Range',
    from: 'From',
    to: 'To',
    searchPlaceholder: 'Search by description, ref, or recipient...',
    saveExpense: 'Save Expense',
    deleteExpense: 'Delete Expense',
    confirmDelete: 'Are you sure you want to delete this expense?',
    expenseSaved: 'Expense saved successfully!',
    expenseDeleted: 'Expense deleted successfully.',
    processing: 'Processing...',
    actions: 'Actions',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Comprehensive business insights and financial performance',
    tabs: {
      sales: 'Sales Summary',
      purchases: 'Purchases',
      stockValuation: 'Stock Valuation',
      customerOutstanding: 'Customer Balances',
      expenses: 'Expenses',
      profitLoss: 'Profit & Loss (P&L)',
    },
    dateRange: 'Date Range',
    from: 'From',
    to: 'To',
    presets: {
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisYear: 'This Year',
      allTime: 'All Time',
    },
    refresh: 'Refresh',
    print: 'Print Report',
    loading: 'Generating report...',
    noData: 'No records found for the selected period.',
    salesSummary: 'Sales Summary',
    totalSales: 'Total Sales',
    totalReceived: 'Total Received',
    totalOutstanding: 'Total Outstanding',
    invoicesCount: 'Posted Invoices',
    cancelledInvoices: 'Cancelled',
    dailySalesTrend: 'Daily Sales Trend',
    topSellingProducts: 'Top Selling Products',
    paymentMethods: 'Payment Methods',
    purchaseSummary: 'Purchase Summary',
    totalPurchases: 'Total Purchases',
    receiptsCount: 'Shipments / Receipts',
    totalPiecesBought: 'Total Pieces Received',
    supplierBreakdown: 'Purchases by Supplier',
    topPurchasedProducts: 'Top Purchased Products',
    stockValuation: 'Stock Valuation',
    costValuation: 'Total Cost Valuation',
    retailValuation: 'Total Retail Valuation',
    potentialProfit: 'Potential Gross Margin',
    categoryBreakdown: 'Stock by Category',
    lowStockAlerts: 'Low Stock Alert Items',
    customerOutstandingTitle: 'Customer Balances & Aging',
    totalDue: 'Total Balance Due',
    customersWithDue: 'Customers with Outstanding',
    agingAnalysis: 'Aging Analysis',
    days0to30: '0 - 30 Days',
    days31to60: '31 - 60 Days',
    days61to90: '61 - 90 Days',
    daysOver90: 'Over 90 Days',
    oldestInvoice: 'Oldest Due Invoice',
    unpaidCount: 'Unpaid Invoices',
    expensesSummary: 'Operational Expenses',
    operationalCosts: 'Total Operating Costs',
    percentage: 'Share %',
    pnlStatement: 'Profit & Loss Statement',
    revenue: 'Total Revenue (Sales)',
    cogs: 'Cost of Goods Sold (COGS)',
    cogsDesc: 'Direct cost of inventory sold',
    grossProfit: 'Gross Profit',
    grossMargin: 'Gross Margin',
    operatingExpenses: 'Operating Expenses',
    netProfit: 'Net Profit',
    netMargin: 'Net Margin',
    profitable: 'Profitable Operation',
    lossMaking: 'Operating Loss',
  },
  placeholder: {
    upcomingModule: 'Upcoming Module',
    nextPhase: 'Next Phase',
    scheduledDesc: 'This module is scheduled in the roadmap.',
    backToDashboard: 'Back to Dashboard',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    loading: 'Loading...',
    success: 'Done!',
    error: 'An error occurred.',
    currency: 'K.D.',
    dozen: 'Dozen',
    pcs: 'Pcs',
    totalPcs: 'Total Pcs',
    activeOwner: 'Active Owner',
    version: 'Rashidi ERP v1.0',
    english: 'English',
    hinglish: 'Hinglish',
    switchLanguage: 'Switch Language',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    noResults: 'No results found.',
    required: 'This field is required.',
  },
};

const hi: Translations = {
  app: {
    title: 'Rashidi Star',
    arabicTitle: 'شركة الرشيدي ستار للتجارة العامة',
    subtitle: 'General Trading Co. — Kuwait',
    copyright: '© 2026 Rashidi Star. All rights reserved.',
  },
  auth: {
    welcome: 'Khush-amdeed!',
    loginPrompt: 'Kripya apna account chunein aur login karein',
    selectOwner: 'Aap kaun hain?',
    username: 'Username',
    password: 'Password',
    passwordPlaceholder: 'Apna password darj karein',
    loginButton: 'Login Karein',
    loggingIn: 'Login ho raha hai...',
    logout: 'Logout Karein',
    confirmLogout: 'Kya aap sach me logout karna chahte hain?',
    sessionExpired: 'Aapka session expire ho gaya hai. Kripya dobara login karein.',
    invalidCredentials: 'Username ya password galat hai.',
    passwordRequired: 'Kripya password enter karein.',
    fullAccess: 'Full Access',
    secureAccess: 'Kewal Business Owners ke liye surakshit access.',
    defaultPasswordHint: 'Default password:',
    yesLogout: 'Haan, Logout Karein',
    confirm: 'Kripya confirm karein',
  },
  nav: {
    home: 'Home (Dashboard)',
    sales: 'Sales (Bikri)',
    purchases: 'Purchases (Kharidari)',
    stock: 'Stock (Mal Ledger)',
    payments: 'Payments (Hisaab)',
    expenses: 'Expenses (Kharcha)',
    customers: 'Customers (Grahak)',
    suppliers: 'Suppliers (Sellers)',
    reports: 'Reports (Hisaab-Kitab)',
    settings: 'Settings (Vyavastha)',
    mainMenu: 'Mukhya Menu',
    menu: 'Menu',
  },
  home: {
    welcomeBanner: 'Khush-amdeed',
    quickActionsTitle: 'Quick Actions (Jaldi Kaam Karein)',
    quickActionsSubtitle: '5 Main Actions (Bada Button)',
    actions: {
      newSale: { title: 'New Sale / Invoice', subtitle: 'Grahak ko naya bill banakar dein' },
      receiveShipment: { title: 'Receive Shipment', subtitle: 'China se aaya maal stock me darj karein' },
      receivePayment: { title: 'Receive Payment', subtitle: 'Grahak se baaki paisa jama karein' },
      addExpense: { title: 'Add Expense', subtitle: 'Kiraya, bijli, ya koi bhi kharcha likhein' },
      searchStock: { title: 'Search Product / Stock', subtitle: 'Article number se maal aur dozen check karein' },
    },
    securityTitle: 'Security & Foundation (Module 01)',
    securitySubtitle: 'TypeORM PostgreSQL + JWT + Idempotency Interceptor',
    securityItems: {
      ownerModel: '2 Owners Model: Rashid Bhai & Farooq Bhai full application access.',
      auditTrail: 'Audit Trail: Har sensitive action record hota hai.',
      doubleClickSafe: 'Double-Click Safe: Idempotency keys prevent double billing.',
      seniorUx: '50+ Senior UX: Bada font, clear text, Hinglish labels.',
    },
    recentAuditTitle: 'Recent Audit Events',
    recentAuditSubtitle: 'Taza audit record',
    viewAll: 'Sab Dekhein →',
    noAuditEvents: 'Abhi tak koi audit event record nahi hua hai.',
    currentLocation: 'Current Location',
    currency: 'Currency: K.D. (Kuwaiti Dinar)',
    ownerSessionActive: 'Owner Session Active',
    step: 'Step',
  },
  settings: {
    title: 'Settings & Company Profile',
    subtitle: 'Company ki details aur system audit log yahan dekhein aur badlein',
    companyProfile: 'Company Profile',
    auditTrail: 'Audit Trail',
    companyBasicInfo: 'Company Ki Buniyadi Jankari',
    companyBasicInfoDesc: 'Yeh jankari print hone wale customer invoices par aayegi',
    companyNameEn: 'Company Name (English)',
    companyNameAr: 'Company Name (Arabic / عربي)',
    phone: 'Phone Number',
    address: 'Address (Kuwait)',
    invoiceTermsEn: 'Invoice Terms (English)',
    invoiceTermsAr: 'Invoice Terms (Arabic / عربي)',
    saveSuccess: 'Company details safaltapoorvak save ho gayi hain!',
    saving: 'Save ho raha hai...',
    auditHistory: 'Audit Event History',
    auditHistoryDesc: 'Har sensitive transaction aur login ka mukammal record',
    refresh: 'Refresh',
    timestamp: 'Waqt (Timestamp)',
    action: 'Action',
    performedBy: 'Kisne Kiya (Performed By)',
    module: 'Module / Entity',
    details: 'Tafseelat (Details)',
    noAuditEvents: 'Koi audit events nahi mile',
    language: 'Bhasha (Language)',
    languageDesc: 'English aur Hinglish ke beech badlein',
  },
  stock: {
    title: 'Stock & Inventory (Mal Ledger)',
    subtitle: 'Products, stock level, aur inventory movement yahan dekhein',
    searchPlaceholder: 'Article number ya product naam se search karein...',
    allCategories: 'Sab Categories',
    lowStockOnly: 'Kam Stock Wale',
    addProduct: 'Naya Product Darj Karein',
    articleNo: 'Article No.',
    product: 'Product',
    category: 'Category',
    stockDozPcs: 'Stock (Doz + Pcs)',
    totalPcs: 'Total Pcs',
    sellingPrice: 'Selling Price',
    statusCol: 'Status',
    inStock: 'Stock Hai',
    lowStock: 'Kam Stock',
    outOfStock: 'Stock Khatam',
    noProducts: 'Koi product nahi mila. Pehla product darj karein.',
    editProduct: 'Product Badlein',
    adjustStock: 'Stock Adjust Karein',
    viewLedger: 'Ledger Dekhein',
    productName: 'Product Naam (English)',
    productNameAr: 'Product Naam (Arabic)',
    color: 'Rang (Color)',
    size: 'Size',
    purchasePrice: 'Khareed Keemat (K.D.)',
    reorderLevel: 'Reorder Level (Pcs)',
    initialDozen: 'Opening Stock (Dozen)',
    initialPieces: 'Opening Stock (Pieces)',
    notes: 'Notes',
    activeStatus: 'Active',
    adjustType: 'Adjustment Type',
    addStock: 'Stock Badhayein',
    removeStock: 'Stock Ghataayein',
    adjustDozen: 'Dozen',
    adjustPieces: 'Pieces',
    reason: 'Wajah (Reason)',
    reasonRecount: 'Ginti Dubara (Recount)',
    reasonDamage: 'Nuqsaan (Damage)',
    reasonShortage: 'Kami (Shortage)',
    reasonReturn: 'Wapsi (Return)',
    reasonOther: 'Aur Wajah (Other)',
    ledgerTitle: 'Stock Ledger (Mal Ki History)',
    ledgerDate: 'Tarikh',
    ledgerChange: 'Badlav',
    ledgerBalance: 'Baad Ka Balance',
    ledgerSource: 'Source',
    ledgerBy: 'Kisne Kiya',
    noLedgerEntries: 'Abhi tak koi stock movement record nahi hui.',
    productCreated: 'Product kamiyabi se darj ho gaya!',
    productUpdated: 'Product kamiyabi se badal gaya!',
    stockAdjusted: 'Stock kamiyabi se adjust ho gaya!',
    closeLedger: 'Ledger Band Karein',
    importStock: 'Opening Stock Import Karein (CSV)',
    importStockDesc: 'Excel ya CSV se products aur opening stock ek sath daalein',
    downloadTemplate: 'Template CSV Download Karein',
    uploadCsv: 'CSV File Upload Karein',
    pasteCsv: 'Ya CSV Text Paste Karein',
    readyToImport: 'Import ke liye taiyaar',
    importSuccess: 'Opening stock kamiyabi se import ho gaya!',
    actions: 'Actions',
  },
  suppliers: {
    title: 'Suppliers (Sellers)',
    subtitle: 'Supplier directory aur dene baqi hisaab yahan dekhein',
    addSupplier: 'Naya Supplier Darj Karein',
    name: 'Supplier Naam',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    country: 'Mulk (Country)',
    address: 'Pata (Address)',
    totalPayable: 'Dene Baqi (K.D.)',
    shipments: 'Shipments',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    editSupplier: 'Supplier Badlein',
    noSuppliers: 'Koi supplier nahi mila. Pehla supplier darj karein.',
    supplierCreated: 'Supplier kamiyabi se darj ho gaya!',
    supplierUpdated: 'Supplier kamiyabi se badal gaya!',
    viewShipments: 'Shipments Dekhein',
    actions: 'Actions',
  },
  purchases: {
    title: 'Purchases & Shipments (Kharidari)',
    subtitle: 'Shipment receive karein aur purchase history dekhein',
    shipmentHistory: 'Shipment History',
    receiveShipment: 'Shipment Receive Karein',
    receiptNo: 'Receipt No.',
    supplier: 'Supplier',
    date: 'Tarikh',
    containerNo: 'Container / Shipment No.',
    supplierInvoice: 'Supplier Invoice Ref.',
    items: 'Items',
    totalKd: 'Total (K.D.)',
    totalPcs: 'Total Pcs',
    status: 'Status',
    noPurchases: 'Koi purchase receipt nahi mili.',
    step1Title: 'Step 1: Shipment Ki Tafseelat',
    step1Subtitle: 'Supplier aur shipment ki jankari darj karein',
    step2Title: 'Step 2: Products Darj Karein',
    step2Subtitle: 'Maal ki tadaad aur keemat darj karein',
    step3Title: 'Step 3: Check Karein aur Confirm',
    step3Subtitle: 'Stock me dalne se pehle sab check karein',
    selectSupplier: 'Supplier Chunein',
    containerPlaceholder: 'e.g. CONT-2026-0045',
    invoiceRefPlaceholder: 'e.g. INV-GZ-8811',
    notesPlaceholder: 'Is shipment ke baare me koi notes...',
    next: 'Aage →',
    previous: '← Peeche',
    articleSearch: 'Article number darj karein...',
    productNameCol: 'Product Naam',
    dozen: 'Dozen',
    pieces: 'Pieces',
    unitCostKd: 'Per Piece Keemat (K.D.)',
    lineTotalKd: 'Line Total',
    addItem: 'Item Darj Karein',
    removeItem: 'Hataayein',
    noItemsAdded: 'Abhi koi item nahi darj hua. Article number se search karein.',
    grandTotal: 'Grand Total',
    receiveAndAddToStock: 'Receive Karein & Stock Me Daalein',
    processing: 'Processing ho raha hai...',
    shipmentSuccess: 'Shipment successfully receive ho gaya!',
    shipmentSuccessDetail: 'pcs stock me add hue.',
    viewReceipt: 'Receipt Dekhein',
    newShipment: 'Nayi Shipment',
    receiptDetail: 'Receipt Ki Tafseelat',
    receivedBy: 'Kisne Receive Kiya',
  },
  customers: {
    title: 'Customers (Grahak)',
    subtitle: 'Grahak directory aur baaki hisaab yahan dekhein',
    addCustomer: 'Naya Grahak Darj Karein',
    name: 'Grahak Naam',
    nameAr: 'Grahak Naam (Arabic)',
    phone: 'Phone',
    address: 'Pata (Address)',
    totalSales: 'Total Bikri (K.D.)',
    totalReceived: 'Total Mila (K.D.)',
    totalOutstanding: 'Baaki Hisaab (K.D.)',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    editCustomer: 'Grahak Badlein',
    noCustomers: 'Koi grahak nahi mila. Pehla grahak darj karein.',
    customerCreated: 'Grahak kamiyabi se darj ho gaya!',
    customerUpdated: 'Grahak kamiyabi se badal gaya!',
    searchPlaceholder: 'Grahak naam ya phone se search karein...',
    viewDetail: 'Tafseelat Dekhein',
    newSale: 'Nayi Bikri',
    whatsappReminder: 'WhatsApp Yaaddaasht',
    pendingInvoices: 'Baaki Invoices',
    noPendingInvoices: 'Is grahak ka koi baaki invoice nahi hai.',
    actions: 'Actions',
    notes: 'Notes',
  },
  sales: {
    title: 'Sales & Invoices (Bikri)',
    subtitle: 'Invoice banaayein aur bikri history dekhein',
    invoiceHistory: 'Invoice History',
    newInvoice: 'Naya Invoice',
    invoiceNo: 'Invoice No.',
    customer: 'Grahak',
    date: 'Tarikh',
    totalKd: 'Total (K.D.)',
    totalPcs: 'Total Pcs',
    received: 'Mila (K.D.)',
    outstanding: 'Baaki (K.D.)',
    paymentStatus: 'Payment',
    invoiceStatus: 'Status',
    noInvoices: 'Koi invoice nahi mila.',
    step1Title: 'Step 1: Grahak Chunein',
    step1Subtitle: 'Is invoice ke liye grahak chunein ya naya banaayein',
    step2Title: 'Step 2: Products Darj Karein',
    step2Subtitle: 'Maal ki tadaad aur bikri keemat darj karein',
    step3Title: 'Step 3: Check Karein aur Payment',
    step3Subtitle: 'Sab check karein aur payment status chunein',
    selectCustomer: 'Grahak Chunein',
    createCustomer: 'Naya Grahak Banaayein',
    customerOutstanding: 'Current Baaki Hisaab',
    articleSearch: 'Article number darj karein...',
    productNameCol: 'Product Naam',
    availableStock: 'Available Stock',
    dozen: 'Dozen',
    pieces: 'Pieces',
    sellingPriceKd: 'Bikri Keemat (K.D.)',
    lineTotalKd: 'Line Total',
    addItem: 'Item Darj Karein',
    removeItem: 'Hataayein',
    noItemsAdded: 'Abhi koi item nahi darj hua. Article number se search karein.',
    grandTotal: 'Grand Total',
    next: 'Aage →',
    previous: '← Peeche',
    paymentChoiceTitle: 'Is invoice ka payment kaise hoga?',
    paid: 'PAID (Poora Mila)',
    partial: 'PARTIAL (Kuch Mila)',
    pending: 'PENDING (Abhi Nahi Mila)',
    paymentMethod: 'Payment Method',
    amountReceived: 'Kitna Mila (K.D.)',
    dueDate: 'Due Date',
    dueDateOptional: 'Due date (agar ho toh)',
    postInvoice: 'Invoice Post Karein',
    processing: 'Processing ho raha hai...',
    invoiceSuccess: 'Invoice kamiyabi se post ho gaya!',
    invoiceSuccessDetail: 'Stock ghata diya gaya hai aur grahak ka hisaab update ho gaya.',
    viewInvoice: 'Invoice Dekhein',
    printInvoice: 'Invoice Print Karein',
    whatsappReminder: 'WhatsApp Yaaddaasht',
    done: 'Ho Gaya',
    cancelInvoice: 'Invoice Radd Karein',
    cancelled: 'Radd',
    posted: 'Posted',
    draft: 'Draft',
    cash: 'Cash (Naqd)',
    bankTransfer: 'Bank Transfer',
    cheque: 'Cheque',
    insufficientStock: 'Stock kami',
    notesPlaceholder: 'Is invoice ke baare me koi notes...',
  },
  payments: {
    title: 'Payments (Hisaab)',
    subtitle: 'Grahak se paisa lein aur payment history dekhein',
    receivePayment: 'Payment Lein',
    paymentHistory: 'Payment History',
    receiptNo: 'Receipt No.',
    customer: 'Grahak',
    date: 'Tarikh',
    amountKd: 'Raqam (K.D.)',
    paymentMethod: 'Payment Method',
    allocatedInvoice: 'Invoice',
    noPayments: 'Koi payment receipt nahi mili.',
    searchCustomer: 'Grahak search karein...',
    customerOutstanding: 'Total Baaki Hisaab',
    selectInvoice: 'Invoice Chunein',
    enterAmount: 'Raqam Darj Karein (K.D.)',
    savePayment: 'Payment Save Karein',
    processing: 'Processing ho raha hai...',
    paymentSuccess: 'Payment kamiyabi se mil gayi!',
    paymentSuccessDetail: 'Grahak ka hisaab update ho gaya.',
    viewReceipt: 'Receipt Dekhein',
    newPayment: 'Nayi Payment',
    performedBy: 'Kisne Liya',
    generalPayment: 'General Payment',
    notes: 'Notes',
  },
  expenses: {
    title: 'Expenses (Kharcha)',
    subtitle: 'Rozmarra ke business aur office kharche ka hisaab',
    addExpense: 'Kharcha Darj Karein',
    editExpense: 'Kharcha Badlein',
    expenseHistory: 'Kharcha Ka Hisaab',
    expenseNo: 'Kharcha #',
    category: 'Category',
    description: 'Tafseel (Description)',
    amountKd: 'Raqam (K.D.)',
    date: 'Tareekh',
    paymentMethod: 'Payment Ka Tareeqa',
    paidTo: 'Kisko Diya',
    receiptRef: 'Voucher / Bill No.',
    notes: 'Khaas Baatein (Notes)',
    recordedBy: 'Kisne Darj Kiya',
    noExpenses: 'Abhi tak koi kharcha darj nahi kiya gaya.',
    totalExpenses: 'Kul Kharcha',
    thisMonthExpenses: 'Is Mahine Ka Kharcha',
    todayExpenses: 'Aaj Ka Kharcha',
    averageExpense: 'Ausat Kharcha',
    categoryBreakdown: 'Category ke hisaab se Kharcha',
    filterByCategory: 'Category Filter',
    allCategories: 'Sabhi Categories',
    dateRange: 'Tareekh Ki Muddat',
    from: 'Kab Se',
    to: 'Kab Tak',
    searchPlaceholder: 'Tafseel, receipt number ya naam se search karein...',
    saveExpense: 'Kharcha Save Karein',
    deleteExpense: 'Kharcha Hatayein',
    confirmDelete: 'Kya aap sach me is kharche ko hatana chahte hain?',
    expenseSaved: 'Kharcha kamiyabi se save ho gaya!',
    expenseDeleted: 'Kharcha kamiyabi se hata diya gaya.',
    processing: 'Processing ho raha hai...',
    actions: 'Action',
  },
  reports: {
    title: 'Reports & Analytics (Hisaab-Kitab)',
    subtitle: 'Business ki poori report, bikri, munafa aur kharche ka jayza',
    tabs: {
      sales: 'Bikri (Sales)',
      purchases: 'Kharidari (Purchases)',
      stockValuation: 'Stock Ki Qeemat',
      customerOutstanding: 'Customer Baqaya',
      expenses: 'Kharche (Expenses)',
      profitLoss: 'Munafa & Nuqsaan (P&L)',
    },
    dateRange: 'Tareekh Ki Muddat',
    from: 'Kab Se',
    to: 'Kab Tak',
    presets: {
      today: 'Aaj',
      thisWeek: 'Is Hafte',
      thisMonth: 'Is Mahine',
      lastMonth: 'Pichle Mahine',
      thisYear: 'Is Saal',
      allTime: 'Shuru Se',
    },
    refresh: 'Taaza Karein (Refresh)',
    print: 'Print Report',
    loading: 'Report ban rahi hai...',
    noData: 'Chuni gayi muddat ke liye koi record nahi mila.',
    salesSummary: 'Bikri Ka Khulasa',
    totalSales: 'Kul Bikri',
    totalReceived: 'Mili Hui Raqam',
    totalOutstanding: 'Kul Baqaya',
    invoicesCount: 'Kul Invoices',
    cancelledInvoices: 'Radd Ki Gayi Invoices',
    dailySalesTrend: 'Rozana Ki Bikri',
    topSellingProducts: 'Sabse Zyada Bikne Wale Mal',
    paymentMethods: 'Payment ke Tareeqe',
    purchaseSummary: 'Kharidari Ka Khulasa',
    totalPurchases: 'Kul Kharidari',
    receiptsCount: 'Kul Shipments',
    totalPiecesBought: 'Aaye Hue Pieces',
    supplierBreakdown: 'Supplier ke hisaab se Mal',
    topPurchasedProducts: 'Sabse Zyada Kharida Gaya Mal',
    stockValuation: 'Godown Stock Ki Qeemat',
    costValuation: 'Kharid Qeemat (Cost Value)',
    retailValuation: 'Bechne Ki Qeemat (Retail Value)',
    potentialProfit: 'Mumkina Munafa (Gross Margin)',
    categoryBreakdown: 'Category ke hisaab se Stock',
    lowStockAlerts: 'Kam Stock Wali Items',
    customerOutstandingTitle: 'Grahakon Ka Baqaya Hisaab',
    totalDue: 'Kul Baqaya Raqam',
    customersWithDue: 'Baqaya Wale Grahak',
    agingAnalysis: 'Baqaya Kitna Purana Hai',
    days0to30: '0 - 30 Din',
    days31to60: '31 - 60 Din',
    days61to90: '61 - 90 Din',
    daysOver90: '90 Din Se Zyada',
    oldestInvoice: 'Sabse Purana Baqaya Invoice',
    unpaidCount: 'Baqaya Invoices',
    expensesSummary: 'Dukan Ke Kharche',
    operationalCosts: 'Kul Karobari Kharcha',
    percentage: 'Hissa %',
    pnlStatement: 'Munafa & Nuqsaan Ka Bayan (P&L)',
    revenue: 'Kul Bikri (Revenue)',
    cogs: 'Beche Gaye Mal Ki Kharid Lagat (COGS)',
    cogsDesc: 'Beche gaye maal ki asal kharid keemat',
    grossProfit: 'Kacha Munafa (Gross Profit)',
    grossMargin: 'Gross Margin %',
    operatingExpenses: 'Karobari Kharche',
    netProfit: 'Asal Munafa (Net Profit)',
    netMargin: 'Net Margin %',
    profitable: 'Munafa Me Hai Karobar',
    lossMaking: 'Nuqsaan Me Hai Karobar',
  },
  placeholder: {
    upcomingModule: 'Upcoming Module',
    nextPhase: 'Next Phase',
    scheduledDesc: 'This module is scheduled in the roadmap.',
    backToDashboard: 'Dashboard par Wapas Jayein',
  },
  common: {
    save: 'Save Karein',
    cancel: 'Radd Karein',
    confirm: 'Confirm Karein',
    back: 'Peeche Jayein',
    loading: 'Loading ho raha hai...',
    success: 'Kaam kamiyab raha!',
    error: 'Koi khata aayi hai.',
    currency: 'K.D.',
    dozen: 'Dozen',
    pcs: 'Pcs',
    totalPcs: 'Total Pcs',
    activeOwner: 'Active Owner',
    version: 'Rashidi ERP v1.0',
    english: 'English',
    hinglish: 'Hinglish',
    switchLanguage: 'Bhasha Badlein',
    close: 'Band Karein',
    edit: 'Badlein',
    delete: 'Mitaayein',
    add: 'Darj Karein',
    search: 'Search Karein',
    noResults: 'Koi nateeja nahi mila.',
    required: 'Yeh zaruri hai.',
  },
};

const translations: Record<Language, Translations> = { en, hi };

// Persistent language state
let currentLang: Language = (localStorage.getItem('erp_lang') as Language) || 'en';
const listeners: Set<() => void> = new Set();

export function getLang(): Language {
  return currentLang;
}

export function setLang(lang: Language): void {
  currentLang = lang;
  localStorage.setItem('erp_lang', lang);
  listeners.forEach((fn) => fn());
}

export function t(): Translations {
  return translations[currentLang];
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Reactive proxy so any direct references like hinglish.app.title work seamlessly with the current language */
export const hinglish: Translations = new Proxy({} as Translations, {
  get(_target, prop: string | symbol) {
    return (translations[currentLang] as any)[prop];
  },
});
