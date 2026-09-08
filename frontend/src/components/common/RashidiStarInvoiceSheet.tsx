import React from 'react';

export interface InvoiceLineItem {
  id?: number;
  productId?: number;
  dozen?: number;
  pieces?: number;
  totalPieces?: number;
  unitPriceKd: number;
  lineTotalKd: number;
  product?: {
    articleNumber?: string;
    nameEn?: string;
    nameAr?: string;
  };
}

export interface InvoiceData {
  id?: number;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType?: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  invoiceStatus?: 'POSTED' | 'CANCELLED';
  totalPcs?: number;
  grandTotalAmountKd: number;
  amountReceivedKd: number;
  amountOutstandingKd: number;
  dueDate?: string;
  notes?: string;
  customer?: {
    id?: number;
    name: string;
    nameAr?: string;
    phone?: string;
  };
  lines?: InvoiceLineItem[];
}

interface RashidiStarInvoiceSheetProps {
  invoice: InvoiceData;
  innerRef?: React.Ref<HTMLDivElement>;
  isExport?: boolean;
}

export const RashidiStarInvoiceSheet: React.FC<RashidiStarInvoiceSheetProps> = ({
  invoice,
  innerRef,
  isExport = false,
}) => {
  // Real payment status logic
  const invoiceTotal = Number(invoice.grandTotalAmountKd || 0);
  const amountPaid = Number(invoice.amountReceivedKd || 0);
  const pendingAmount = Math.max(0, invoiceTotal - amountPaid);

  const paymentState: 'FULLY PAID' | 'PARTIALLY PAID' | 'PENDING' =
    pendingAmount <= 0.0001
      ? 'FULLY PAID'
      : amountPaid > 0
      ? 'PARTIALLY PAID'
      : 'PENDING';

  // Format date helper: returns D / M / YYYY
  const formatDateParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day} / ${month} / ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatStampDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Split KD and Fils with exact 3 decimals precision
  const splitKdFils = (amount: number) => {
    const total = Number(amount || 0);
    const kd = Math.floor(total);
    const filsNum = Math.round((total - kd) * 1000);
    const fils = filsNum === 0 ? '—' : String(filsNum).padStart(3, '0');
    return { kd: String(kd), fils };
  };

  const lines = invoice.lines || [];
  // Ensure table maintains physical bill book height (14 rows fills standard A4 balance)
  const minRows = 14;
  const emptyRowsCount = Math.max(0, minRows - lines.length);
  const totalSplit = splitKdFils(invoiceTotal);

  return (
    <div
      ref={innerRef}
      className="rashidi-invoice-paper"
      style={{
        width: '794px',
        minWidth: '794px',
        maxWidth: '794px',
        height: '1123px',
        minHeight: '1123px',
        maxHeight: '1123px',
        backgroundColor: '#ffffff',
        color: '#164680',
        padding: '24px 30px',
        borderRadius: isExport ? '0' : '4px',
        boxShadow: isExport ? 'none' : '0 12px 36px rgba(0, 0, 0, 0.35)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Section */}
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          {/* English Company Header (Left) */}
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '0.2px',
                lineHeight: '1.1',
                color: '#164680',
              }}
            >
              Rashidi Star
            </div>
            <div
              style={{
                fontSize: '14.5px',
                fontWeight: 800,
                marginTop: '2px',
                color: '#164680',
              }}
            >
              General Trading Co.
            </div>
            <div
              style={{
                fontSize: '12px',
                marginTop: '5px',
                lineHeight: '1.35',
                color: '#164680',
                fontWeight: 600,
              }}
            >
              <div>Souk Al-Fahad</div>
              <div>Opp. Masjid Al-Fahad - Shop No. 36</div>
            </div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                marginTop: '5px',
                lineHeight: '1.35',
                color: '#164680',
              }}
            >
              <div>Mob.: 99598297</div>
              <div style={{ marginLeft: '42px' }}>97488405</div>
            </div>
          </div>

          {/* Centered Cash / Credit Invoice Box */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                border: '1.8px solid #164680',
                borderRadius: '8px',
                width: '210px',
                margin: '0 auto',
                padding: '5px 0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#164680',
                  lineHeight: '1.25',
                  fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                فاتورة نقداً/بالحساب
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#164680',
                  letterSpacing: '0.4px',
                  lineHeight: '1.2',
                  marginTop: '3px',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                CASH / CREDIT INVOICE
              </span>
            </div>
          </div>

          {/* Arabic Company Header (Right) */}
          <div
            style={{
              textAlign: 'right',
              direction: 'rtl',
              fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: '27px',
                fontWeight: 900,
                letterSpacing: '0',
                lineHeight: '1.1',
                color: '#164680',
              }}
            >
              شركة الرشيدي ستار
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                marginTop: '2px',
                color: '#164680',
              }}
            >
              للتجارة العامة
            </div>
            <div
              style={{
                fontSize: '12px',
                marginTop: '5px',
                lineHeight: '1.35',
                color: '#164680',
                fontWeight: 700,
              }}
            >
              <div>سوق الفهد - مقابل مسجد الفهد - محل رقم ٣٦</div>
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                marginTop: '5px',
                lineHeight: '1.35',
                color: '#164680',
              }}
            >
              <div>نقال : ٩٩٥٩٨٢٩٧</div>
              <div style={{ marginRight: '36px' }}>٩٧٤٨٨٤٠٥</div>
            </div>
          </div>
        </div>

        {/* No. & Date Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: '16px',
            padding: '2px 4px 6px 4px',
          }}
        >
          {/* Dynamic Invoice Number in Crisp Red */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#164680' }}>
              No.
            </span>
            <span
              style={{
                fontSize: '19px',
                fontWeight: 900,
                color: '#dc2626',
                letterSpacing: '1px',
                fontFamily: "'Courier New', Courier, monospace, sans-serif",
              }}
            >
              {invoice.invoiceNumber.replace(/^INV-?/i, '')}
            </span>
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#164680' }}>
              Date
            </span>
            <span
              style={{
                fontSize: '14.5px',
                fontWeight: 800,
                color: '#164680',
                minWidth: '110px',
                textAlign: 'center',
                borderBottom: '1.2px dotted #164680',
                padding: '0 8px',
              }}
            >
              {formatDateParts(invoice.invoiceDate)}
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#164680',
                direction: 'rtl',
                fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
              }}
            >
              التاريخ
            </span>
          </div>
        </div>

        {/* Customer (Mr. / Messrs) Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            padding: '4px 4px 8px 4px',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#164680',
              whiteSpace: 'nowrap',
            }}
          >
            Mr. / Messrs
          </span>

          {/* Dotted Customer Line */}
          <div
            style={{
              flex: 1,
              borderBottom: '1.2px dotted #164680',
              padding: '0 8px',
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{invoice.customer?.name || 'Walk-in Customer'}</span>
            {invoice.customer?.nameAr && (
              <span
                style={{
                  direction: 'rtl',
                  fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
                  color: '#164680',
                }}
              >
                {invoice.customer.nameAr}
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#164680',
              direction: 'rtl',
              whiteSpace: 'nowrap',
              fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
            }}
          >
            المطلوب من السيد / السادة
          </span>
        </div>

        {/* ───────────────────── MAIN ITEM TABLE ───────────────────── */}
        <div
          style={{
            border: '1.8px solid #164680',
            borderRadius: '6px 6px 0 0',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Table Header Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '42px 1fr 68px 120px 130px',
              borderBottom: '1.8px solid #164680',
              textAlign: 'center',
              fontWeight: 800,
              color: '#164680',
              fontSize: '11.5px',
              backgroundColor: '#f8fafc',
              height: '66px',
              minHeight: '66px',
              boxSizing: 'border-box',
            }}
          >
            {/* Sr. No. */}
            <div
              style={{
                borderRight: '1.5px solid #164680',
                height: '66px',
                paddingTop: '16px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '12px', lineHeight: '15px' }}>رقم</div>
              <div style={{ fontSize: '11px', lineHeight: '15px' }}>Sr.No.</div>
            </div>

            {/* Description */}
            <div
              style={{
                borderRight: '1.5px solid #164680',
                height: '66px',
                paddingTop: '16px',
                paddingLeft: '6px',
                paddingRight: '6px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '13px', lineHeight: '15px' }}>
                التفــــاصيل
              </div>
              <div style={{ fontSize: '11px', lineHeight: '15px' }}>DESCRIPTION</div>
            </div>

            {/* Qty */}
            <div
              style={{
                borderRight: '1.5px solid #164680',
                height: '66px',
                paddingTop: '16px',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '12px', lineHeight: '15px' }}>الكمية</div>
              <div style={{ fontSize: '11px', lineHeight: '15px' }}>QTY.</div>
            </div>

            {/* Unit Price (KD | Fils) */}
            <div
              style={{
                borderRight: '1.5px solid #164680',
                height: '66px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  height: '34px',
                  borderBottom: '1.2px solid #164680',
                  paddingTop: '3px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '11px', lineHeight: '14px' }}>
                  سعر الوحدة
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 800, lineHeight: '13px' }}>
                  Unit Price
                </div>
              </div>
              <div
                style={{
                  height: '32px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    borderRight: '1px solid #164680',
                    paddingTop: '2px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '10px', lineHeight: '13px' }}>دينار</div>
                  <div style={{ fontSize: '9px', fontWeight: 800, lineHeight: '12px' }}>K.D.</div>
                </div>
                <div
                  style={{
                    paddingTop: '2px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '10px', lineHeight: '13px' }}>فلس</div>
                  <div style={{ fontSize: '9px', fontWeight: 800, lineHeight: '12px' }}>Fils</div>
                </div>
              </div>
            </div>

            {/* Total Amount (KD | Fils) */}
            <div
              style={{
                height: '66px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  height: '34px',
                  borderBottom: '1.2px solid #164680',
                  paddingTop: '3px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '11px', lineHeight: '14px' }}>
                  المبلغ الاجمالي
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 800, lineHeight: '13px' }}>
                  Total Amount
                </div>
              </div>
              <div
                style={{
                  height: '32px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    borderRight: '1px solid #164680',
                    paddingTop: '2px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '10px', lineHeight: '13px' }}>دينار</div>
                  <div style={{ fontSize: '9px', fontWeight: 800, lineHeight: '12px' }}>K.D.</div>
                </div>
                <div
                  style={{
                    paddingTop: '2px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif", fontSize: '10px', lineHeight: '13px' }}>فلس</div>
                  <div style={{ fontSize: '9px', fontWeight: 800, lineHeight: '12px' }}>Fils</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Data Rows */}
          {lines.map((line, idx) => {
            const unitSplit = splitKdFils(line.unitPriceKd);
            const lineTotal = splitKdFils(line.lineTotalKd);
            const artNum = line.product?.articleNumber;
            const nameEn = line.product?.nameEn;
            const nameAr = line.product?.nameAr;

            return (
              <div
                key={line.id || `line-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42px 1fr 68px 120px 130px',
                  borderBottom: '1px solid #cbd5e1',
                  minHeight: '34px',
                  fontSize: '12px',
                  color: '#0f172a',
                  alignItems: 'stretch',
                }}
              >
                {/* Sr. No. */}
                <div
                  style={{
                    borderRight: '1.5px solid #164680',
                    textAlign: 'center',
                    padding: '6px 2px',
                    fontWeight: 700,
                    color: '#164680',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Description */}
                <div
                  style={{
                    borderRight: '1.5px solid #164680',
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{nameEn || 'Item'}</span>
                    {nameAr && (
                      <span
                        style={{
                          direction: 'rtl',
                          fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {nameAr}
                      </span>
                    )}
                  </div>
                  {artNum && (
                    <div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#164680',
                          backgroundColor: '#eff6ff',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontSize: '10.5px',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        Art No: {artNum}
                      </span>
                    </div>
                  )}
                </div>

                {/* Qty */}
                <div
                  style={{
                    borderRight: '1.5px solid #164680',
                    textAlign: 'center',
                    padding: '6px 2px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {line.dozen ? `${line.dozen} dz ` : ''}
                  {line.pieces ? `${line.pieces} pcs` : ''}
                  {!line.dozen && !line.pieces ? `${line.totalPieces || 1} pcs` : ''}
                </div>

                {/* Unit Price (KD | Fils) */}
                <div
                  style={{
                    borderRight: '1.5px solid #164680',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    textAlign: 'center',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      borderRight: '1px solid #164680',
                      padding: '6px 2px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unitSplit.kd}
                  </div>
                  <div
                    style={{
                      padding: '6px 2px',
                      color: '#64748b',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unitSplit.fils}
                  </div>
                </div>

                {/* Total Amount (KD | Fils) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    textAlign: 'center',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      borderRight: '1px solid #164680',
                      padding: '6px 2px',
                      fontWeight: 800,
                      color: '#164680',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {lineTotal.kd}
                  </div>
                  <div
                    style={{
                      padding: '6px 2px',
                      color: '#64748b',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {lineTotal.fils}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty Padding Rows to preserve exact physical invoice proportions */}
          {Array.from({ length: emptyRowsCount }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '42px 1fr 68px 120px 130px',
                borderBottom: '1px solid #cbd5e1',
                height: '34px',
              }}
            >
              <div style={{ borderRight: '1.5px solid #164680' }} />
              <div style={{ borderRight: '1.5px solid #164680' }} />
              <div style={{ borderRight: '1.5px solid #164680' }} />
              <div
                style={{
                  borderRight: '1.5px solid #164680',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <div style={{ borderRight: '1px solid #164680' }} />
                <div />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ borderRight: '1px solid #164680' }} />
                <div />
              </div>
            </div>
          ))}

          {/* Authentic Boxed PAID Stamp Overlay (Only visible when invoice is FULLY PAID!) */}
          {paymentState === 'FULLY PAID' && (
            <div
              style={{
                position: 'absolute',
                left: '26%',
                bottom: '24px',
                border: '3px solid #1d4ed8',
                borderRadius: '6px',
                padding: '6px 24px',
                textAlign: 'center',
                color: '#1d4ed8',
                backgroundColor: 'rgba(239, 246, 255, 0.9)',
                transform: 'rotate(-4deg)',
                boxShadow: '0 2px 10px rgba(29, 78, 216, 0.25)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  lineHeight: '1.2',
                }}
              >
                RASHIDI STAR
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  lineHeight: '1.2',
                  margin: '2px 0',
                }}
              >
                - {formatStampDate(invoice.invoiceDate)} -
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  letterSpacing: '5px',
                  lineHeight: '1.2',
                }}
              >
                PAID
              </div>
            </div>
          )}
        </div>

        {/* Subtotal Row */}
        <div
          style={{
            border: '1.8px solid #164680',
            borderTop: 'none',
            display: 'grid',
            gridTemplateColumns: '1fr 130px',
            backgroundColor: '#f8fafc',
            color: '#164680',
            fontWeight: 800,
            fontSize: '13.5px',
            alignItems: 'stretch',
            minHeight: '36px',
          }}
        >
          {/* Total KD .......................................... المجموع د.ك */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 16px',
              borderRight: '1.5px solid #164680',
              gap: '8px',
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Total K.D.</span>
            <div
              style={{
                flex: 1,
                borderBottom: '1.5px dotted #164680',
                margin: '0 8px',
                height: '1px',
              }}
            />
            <span
              style={{
                fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
                fontSize: '15px',
                whiteSpace: 'nowrap',
                direction: 'rtl',
              }}
            >
              المجموع د.ك.
            </span>
          </div>

          {/* Total Amount Split (KD | Fils) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              textAlign: 'center',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                borderRight: '1px solid #164680',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '16px',
                padding: '4px 0',
              }}
            >
              {totalSplit.kd}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#64748b',
                padding: '4px 0',
              }}
            >
              {totalSplit.fils}
            </div>
          </div>
        </div>

        {/* ───────────────────── COMPACT COMPUTER-GENERATED PAYMENT SUMMARY ───────────────────── */}
        <div
          style={{
            marginTop: '10px',
            border: '1.5px solid #164680',
            borderRadius: '6px',
            padding: '8px 14px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#164680',
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Payment Status:</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 900,
                fontSize: '11.5px',
                letterSpacing: '0.3px',
                backgroundColor:
                  paymentState === 'FULLY PAID'
                    ? '#dcfce7'
                    : paymentState === 'PARTIALLY PAID'
                    ? '#fef3c7'
                    : '#fee2e2',
                color:
                  paymentState === 'FULLY PAID'
                    ? '#15803d'
                    : paymentState === 'PARTIALLY PAID'
                    ? '#b45309'
                    : '#b91c1c',
                border: `1px solid ${
                  paymentState === 'FULLY PAID'
                    ? '#86efac'
                    : paymentState === 'PARTIALLY PAID'
                    ? '#fde68a'
                    : '#fca5a5'
                }`,
              }}
            >
              {paymentState}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ color: '#64748b', marginRight: '4px' }}>Invoice Total:</span>
              <span style={{ fontWeight: 800 }}>{invoiceTotal.toFixed(3)} K.D.</span>
            </div>
            <div>
              <span style={{ color: '#64748b', marginRight: '4px' }}>Amount Paid:</span>
              <span style={{ fontWeight: 800, color: '#059669' }}>{amountPaid.toFixed(3)} K.D.</span>
            </div>
            <div>
              <span style={{ color: '#64748b', marginRight: '4px' }}>Pending Amount:</span>
              <span
                style={{
                  fontWeight: 800,
                  color: pendingAmount > 0 ? '#dc2626' : '#64748b',
                }}
              >
                {pendingAmount.toFixed(3)} K.D.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── FOOTER AREA ───────────────────── */}
      <div style={{ marginTop: '16px' }}>
        {/* Cheque Instruction Line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: '11px',
            fontWeight: 800,
            color: '#164680',
            padding: '0 4px',
            lineHeight: '1.3',
          }}
        >
          <div>
            Please Issue Cheque in name of Yusuf Ali Jatwala Taher Ali Jatwala
          </div>
          <div
            style={{
              direction: 'rtl',
              fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
              fontSize: '12px',
            }}
          >
            يرجى إصدار الشيكات في اسم يوسف علي جاتوالا طاهر علي جاتوالا
          </div>
        </div>

        {/* Signature Line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '16px',
            padding: '0 6px',
            color: '#164680',
            fontWeight: 800,
            fontSize: '13px',
          }}
        >
          {/* Salesman Sign. (Left) */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span>Salesman Sign.</span>
            <span style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif" }}>توقيع البائع</span>
          </div>

          {/* Customer Sign. (Right) */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span>Customer Sign.</span>
            <span style={{ fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif" }}>توقيع المشتري</span>
          </div>
        </div>

        {/* Computer Generated Copy Notice */}
        <div
          style={{
            marginTop: '14px',
            textAlign: 'center',
            borderTop: '1px dashed #cbd5e1',
            paddingTop: '6px',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.3px' }}>
            Computer Generated Copy - No Signature Required
          </div>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              direction: 'rtl',
              fontFamily: "'Amiri', 'Cairo', 'Traditional Arabic', Tahoma, sans-serif",
              marginTop: '1px',
            }}
          >
            نسخة مولدة إلكترونياً - لا يتطلب توقيع
          </div>
        </div>
      </div>
    </div>
  );
};
