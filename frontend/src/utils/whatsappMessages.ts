/**
 * Rashidi Star - Plain-Text WhatsApp Payment Messages & URLs
 *
 * Strict Rules:
 * - Business name: "Rashidi Star" ONLY (Do NOT use "Rashidi Traders Kuwait")
 * - NO emojis, NO unicode decorative symbols, NO broken/corrupted glyphs
 * - Pure plain text with standard alphanumeric characters, punctuation, and newlines
 * - Amounts in K.D. with exactly 3 decimal places
 * - Clean Kuwait phone normalization to 965
 * - Omit optional fields when empty/missing:
 *   - Due Date omitted if empty
 *   - Payment Method omitted if missing
 *   - Receipt No omitted if unavailable
 *   - Invoice No omitted if unavailable
 *   - Customer defaults to "Dear Customer," or "Customer" if empty or walk-in
 * - Never output undefined, null, NaN, or N/A
 */

export type PaymentWhatsAppType =
  | 'FULL_PAYMENT_RECEIPT'
  | 'PARTIAL_PAYMENT_RECEIPT'
  | 'PENDING_REMINDER'
  | 'PARTIAL_REMINDER'
  | 'SIMPLE_CONFIRMATION'
  | 'OUTSTANDING_BALANCE_REMINDER';

export interface WhatsAppPaymentData {
  receiptNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  date?: string | null;
  amountReceived?: number | string | null;
  paymentMethod?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  invoiceTotal?: number | string | null;
  totalPaid?: number | string | null;
  outstandingAmount?: number | string | null;
  dueDate?: string | null;
  paymentStatus?: 'PAID' | 'PARTIAL' | 'PENDING' | string | null;
}

/**
 * Format numeric amount to Kuwait Dinar with exactly 3 decimal places.
 * Guarantees no NaN, null, or undefined strings.
 */
export function formatKd(val?: number | string | null): string {
  if (val === null || val === undefined || val === '') return '0.000';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? '0.000' : num.toFixed(3);
}

/**
 * Format date string safely (defaults to today's YYYY-MM-DD if omitted)
 */
export function formatSafeDate(d?: string | null): string {
  if (!d || d.trim() === '' || d === 'null' || d === 'undefined' || d.toUpperCase() === 'N/A') {
    return new Date().toISOString().split('T')[0];
  }
  return d.trim();
}

/**
 * Helper to check if an optional string field has a meaningful value.
 */
function isValidField(val?: string | null): boolean {
  if (!val) return false;
  const t = val.trim();
  if (!t || t === 'null' || t === 'undefined' || t.toUpperCase() === 'N/A' || t.toUpperCase() === 'NAN') {
    return false;
  }
  return true;
}

/**
 * Human readable payment method label. Returns empty string if missing.
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!isValidField(method)) return '';
  const m = method!.toUpperCase().trim();
  if (m === 'CASH') return 'Cash';
  if (m === 'KNET') return 'K-Net';
  if (m === 'BANK_TRANSFER' || m === 'BANK') return 'Bank Transfer';
  if (m === 'CHEQUE' || m === 'CHECK') return 'Cheque';
  return method!.trim();
}

/**
 * Normalize phone numbers to Kuwait international format (965XXXXXXXX)
 * Strips all spaces, brackets, hyphens, plus signs, and leading 00s.
 */
export function normalizeKuwaitPhone(phone?: string | null): string {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';

  if (clean.startsWith('00965')) {
    clean = clean.substring(2);
  } else if (clean.startsWith('965')) {
    // Already has 965 prefix
  } else if (clean.length === 8) {
    clean = `965${clean}`;
  }

  return clean;
}

/**
 * Helper to determine customer greeting for reminders:
 * "Dear {customerName}," or "Dear Customer," if name is walk-in or empty.
 */
function getCustomerGreeting(customerName?: string | null): string {
  const raw = (customerName || '').trim();
  if (!raw || raw.toLowerCase().includes('walk-in') || raw.toLowerCase() === 'customer' || !isValidField(raw)) {
    return 'Dear Customer,';
  }
  return `Dear ${raw},`;
}

/**
 * Helper to format customer field in receipts:
 * "{customerName}" or "Customer" if empty/walk-in.
 */
function getCustomerDisplayName(customerName?: string | null): string {
  const raw = (customerName || '').trim();
  if (!raw || raw.toLowerCase().includes('walk-in') || raw.toLowerCase() === 'customer' || !isValidField(raw)) {
    return 'Customer';
  }
  return raw;
}

// ─────────────────────────────────────────────────────────────
// 1. FULL PAYMENT RECEIPT / INVOICE MESSAGE
// ─────────────────────────────────────────────────────────────
export function generateFullPaymentReceipt(data: WhatsAppPaymentData): string {
  const customer = getCustomerDisplayName(data.customerName);
  const date = formatSafeDate(data.invoiceDate || data.date);
  const invTotal = formatKd(data.invoiceTotal ?? data.amountReceived ?? data.totalPaid);
  const paid = formatKd(data.totalPaid ?? data.amountReceived ?? data.invoiceTotal);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Payment Receipt',
    '',
  ];

  if (isValidField(data.receiptNumber)) {
    lines.push(`Receipt No: ${data.receiptNumber!.trim()}`);
  }
  lines.push(`Customer: ${customer}`);
  lines.push(`Date: ${date}`);

  lines.push('');

  if (isValidField(data.invoiceNumber)) {
    lines.push(`Invoice No: ${data.invoiceNumber!.trim()}`);
  }
  lines.push(`Invoice Total: ${invTotal} K.D.`);
  lines.push(`Amount Paid: ${paid} K.D.`);
  lines.push('Pending Amount: 0.000 K.D.');
  lines.push('Payment Status: FULLY PAID');

  lines.push('');
  lines.push('Payment received in full.');
  lines.push('');
  lines.push('Thank you for your payment.');
  lines.push('Shukran.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 2. PARTIALLY PAID RECEIPT / INVOICE MESSAGE
// ─────────────────────────────────────────────────────────────
export function generatePartialPaymentReceipt(data: WhatsAppPaymentData): string {
  const customer = getCustomerDisplayName(data.customerName);
  const date = formatSafeDate(data.invoiceDate || data.date);
  const invTotal = formatKd(data.invoiceTotal);
  const paid = formatKd(data.totalPaid ?? data.amountReceived);
  const outstanding = formatKd(data.outstandingAmount);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Partial Payment Receipt',
    '',
  ];

  if (isValidField(data.receiptNumber)) {
    lines.push(`Receipt No: ${data.receiptNumber!.trim()}`);
  }
  lines.push(`Customer: ${customer}`);
  lines.push(`Date: ${date}`);

  lines.push('');

  if (isValidField(data.invoiceNumber)) {
    lines.push(`Invoice No: ${data.invoiceNumber!.trim()}`);
  }
  lines.push(`Invoice Total: ${invTotal} K.D.`);
  lines.push(`Amount Paid: ${paid} K.D.`);
  lines.push(`Pending Amount: ${outstanding} K.D.`);
  lines.push('Payment Status: PARTIALLY PAID');

  lines.push('');
  lines.push('Partial payment received successfully.');
  lines.push('');
  lines.push('Thank you.');
  lines.push('Shukran.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 3. PENDING PAYMENT REMINDER
// ─────────────────────────────────────────────────────────────
export function generatePendingPaymentReminder(data: WhatsAppPaymentData): string {
  const greeting = getCustomerGreeting(data.customerName);
  const invNo = isValidField(data.invoiceNumber) ? data.invoiceNumber!.trim() : '';
  const invDate = formatSafeDate(data.invoiceDate || data.date);
  const invTotal = formatKd(data.invoiceTotal);
  const paid = formatKd(data.totalPaid || 0);
  const outstanding = formatKd(data.outstandingAmount ?? data.invoiceTotal);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Payment Reminder',
    '',
    greeting,
    '',
  ];

  if (invNo) {
    lines.push(`Invoice No: ${invNo}`);
  }
  lines.push(`Invoice Date: ${invDate}`);
  lines.push(`Invoice Total: ${invTotal} K.D.`);
  lines.push(`Amount Paid: ${paid} K.D.`);
  lines.push(`Pending Amount: ${outstanding} K.D.`);
  lines.push('Payment Status: PENDING');

  if (isValidField(data.dueDate)) {
    lines.push('');
    lines.push(`Due Date: ${data.dueDate!.trim()}`);
  }

  lines.push('');
  lines.push('Kindly arrange the pending payment at your convenience.');
  lines.push('');
  lines.push('Thank you,');
  lines.push('Rashidi Star');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 4. PARTIALLY PAID BALANCE REMINDER
// ─────────────────────────────────────────────────────────────
export function generatePartialBalanceReminder(data: WhatsAppPaymentData): string {
  const greeting = getCustomerGreeting(data.customerName);
  const invNo = isValidField(data.invoiceNumber) ? data.invoiceNumber!.trim() : '';
  const invTotal = formatKd(data.invoiceTotal);
  const paid = formatKd(data.totalPaid ?? data.amountReceived);
  const outstanding = formatKd(data.outstandingAmount);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Balance Payment Reminder',
    '',
    greeting,
    '',
  ];

  if (invNo) {
    lines.push(`Invoice No: ${invNo}`);
  }
  lines.push(`Invoice Total: ${invTotal} K.D.`);
  lines.push(`Amount Paid: ${paid} K.D.`);
  lines.push(`Pending Amount: ${outstanding} K.D.`);
  lines.push('Payment Status: PARTIALLY PAID');

  if (isValidField(data.dueDate)) {
    lines.push('');
    lines.push(`Due Date: ${data.dueDate!.trim()}`);
  }

  lines.push('');
  lines.push('Kindly arrange the remaining payment at your convenience.');
  lines.push('');
  lines.push('Thank you,');
  lines.push('Rashidi Star');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 5. OUTSTANDING BALANCE REMINDER
// ─────────────────────────────────────────────────────────────
export function generateOutstandingBalanceReminder(data: WhatsAppPaymentData): string {
  const greeting = getCustomerGreeting(data.customerName);
  const outstanding = formatKd(data.outstandingAmount);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Outstanding Balance Reminder',
    '',
    greeting,
    '',
    `Total Outstanding Balance: ${outstanding} K.D.`,
  ];

  if (isValidField(data.dueDate)) {
    lines.push('');
    lines.push(`Due Date: ${data.dueDate!.trim()}`);
  }

  lines.push('');
  lines.push('Kindly arrange the payment at your earliest convenience.');
  lines.push('');
  lines.push('Thank you,');
  lines.push('Rashidi Star');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 6. SIMPLE PAYMENT CONFIRMATION
// ─────────────────────────────────────────────────────────────
export function generateSimplePaymentConfirmation(data: WhatsAppPaymentData): string {
  const customer = getCustomerDisplayName(data.customerName);
  const amountRec = formatKd(data.amountReceived);
  const method = formatPaymentMethod(data.paymentMethod);
  const outstanding = formatKd(data.outstandingAmount || 0);

  const lines: string[] = [
    'Rashidi Star',
    '',
    'Payment Confirmation',
    '',
    `Customer: ${customer}`,
  ];

  if (isValidField(data.receiptNumber)) {
    lines.push(`Receipt No: ${data.receiptNumber!.trim()}`);
  }
  if (isValidField(data.invoiceNumber)) {
    lines.push(`Invoice No: ${data.invoiceNumber!.trim()}`);
  }

  lines.push('');
  lines.push(`Amount Received: ${amountRec} K.D.`);

  if (method) {
    lines.push(`Payment Method: ${method}`);
  }

  lines.push(`Remaining Balance: ${outstanding} K.D.`);
  lines.push('');
  lines.push('Payment received successfully.');
  lines.push('');
  lines.push('Thank you for your payment.');
  lines.push('Shukran.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER & URL BUILDER
// ─────────────────────────────────────────────────────────────

/**
 * Resolves the plain-text message based on requested type or invoice/payment status.
 */
export function buildWhatsAppMessage(
  data: WhatsAppPaymentData,
  explicitType?: PaymentWhatsAppType,
): string {
  if (explicitType === 'FULL_PAYMENT_RECEIPT') {
    return generateFullPaymentReceipt(data);
  }
  if (explicitType === 'PARTIAL_PAYMENT_RECEIPT') {
    return generatePartialPaymentReceipt(data);
  }
  if (explicitType === 'PENDING_REMINDER') {
    return generatePendingPaymentReminder(data);
  }
  if (explicitType === 'PARTIAL_REMINDER') {
    return generatePartialBalanceReminder(data);
  }
  if (explicitType === 'SIMPLE_CONFIRMATION') {
    return generateSimplePaymentConfirmation(data);
  }
  if (explicitType === 'OUTSTANDING_BALANCE_REMINDER') {
    return generateOutstandingBalanceReminder(data);
  }

  // Automatic detection based on status:
  const status = (data.paymentStatus || '').toUpperCase();
  const outstanding = typeof data.outstandingAmount === 'number'
    ? data.outstandingAmount
    : parseFloat(String(data.outstandingAmount || 0));

  if (status === 'PAID' || outstanding <= 0) {
    return generateFullPaymentReceipt(data);
  }
  if (status === 'PARTIAL') {
    if (data.receiptNumber) {
      return generatePartialPaymentReceipt(data);
    }
    return generatePartialBalanceReminder(data);
  }
  return generatePendingPaymentReminder(data);
}

/**
 * Builds a valid WhatsApp click-to-chat URL with normalized phone and encoded message.
 */
export function buildWhatsAppUrl(
  data: WhatsAppPaymentData,
  explicitType?: PaymentWhatsAppType,
): string {
  const message = buildWhatsAppMessage(data, explicitType);
  const normalizedPhone = normalizeKuwaitPhone(data.customerPhone);
  const encodedText = encodeURIComponent(message);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // On desktop browsers, using web.whatsapp.com directly opens WhatsApp Web
  // with multi-line layout and full plain text preserved, avoiding the intermediary
  // wa.me/api.whatsapp.com preview card which collapses newlines into spaces.
  if (!isMobile && typeof window !== 'undefined') {
    if (normalizedPhone) {
      return `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedText}`;
    }
    return `https://web.whatsapp.com/send?text=${encodedText}`;
  }

  if (normalizedPhone) {
    return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
