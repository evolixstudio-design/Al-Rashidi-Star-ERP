import React, { useState, useRef } from 'react';
import { Printer, MessageCircle, Download, Check, BellRing, History, Ban, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TransactionAuditModal } from './TransactionAuditModal';
import {
  RashidiStarInvoiceSheet,
  type InvoiceData,
  type InvoiceLineItem,
} from './RashidiStarInvoiceSheet';
import {
  generateInvoiceJpg,
  downloadJpg,
  resolveMessageType,
  openWhatsAppChat,
} from '../../services/whatsappService';

export type { InvoiceData, InvoiceLineItem };

interface RashidiStarInvoiceProps {
  invoice: InvoiceData;
  onClose?: () => void;
  onPrint?: () => void;
  onCancel?: () => void;
}

export const RashidiStarInvoice: React.FC<RashidiStarInvoiceProps> = ({
  invoice,
  onClose,
  onPrint,
  onCancel,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const invoicePaperRef = useRef<HTMLDivElement>(null);
  const exportInvoicePaperRef = useRef<HTMLDivElement>(null);

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

  // Build payment data for text message generation
  const buildPaymentData = () => ({
    customerName: invoice.customer?.name,
    customerPhone: invoice.customer?.phone,
    date: invoice.invoiceDate,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    invoiceNumber: invoice.invoiceNumber,
    invoiceTotal: invoiceTotal,
    totalPaid: amountPaid,
    amountReceived: amountPaid,
    outstandingAmount: pendingAmount,
    paymentMethod: invoice.paymentType,
    paymentStatus: paymentState,
  });

  // High-Resolution Fixed A4 PDF Generator using html2canvas & jsPDF
  const generatePdfBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    const element = exportInvoicePaperRef.current || invoicePaperRef.current;
    if (!element) return null;
    try {
      setIsGeneratingPdf(true);

      // 1. Wait for web fonts
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // 2. Wait for all images inside element
      const images = Array.from(element.querySelectorAll('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const onDone = () => {
              img.removeEventListener('load', onDone);
              img.removeEventListener('error', onDone);
              resolve();
            };
            img.addEventListener('load', onDone);
            img.addEventListener('error', onDone);
            setTimeout(onDone, 3500);
          });
        })
      );

      // 3. Capture raw unscaled fixed A4 renderer directly
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution (1985 x 2808)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        allowTaint: true,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Invoice canvas was empty');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (!imgData || imgData === 'data:,' || imgData.length < 200) {
        throw new Error('Invoice image data was empty');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Exactly full A4 page (210mm x 297mm) - NO auto-scaling to half-page
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      const cleanInvNum = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9_-]/g, '');
      const filename = `Rashidi-Star-${cleanInvNum}.pdf`;
      const blob = pdf.output('blob');
      return { blob, filename };
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      return null;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Action: Download Invoice PDF
  const handleDownloadPdf = async () => {
    const res = await generatePdfBlob();
    if (!res) {
      alert('Invoice PDF could not be generated. Please try again.');
      return;
    }
    const url = URL.createObjectURL(res.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPdfSuccessMessage('Invoice PDF downloaded successfully!');
    setTimeout(() => setPdfSuccessMessage(null), 4000);
  };

  // Action: Download Invoice Photo (JPG)
  const handleDownloadPhoto = async () => {
    const element = exportInvoicePaperRef.current || invoicePaperRef.current;
    if (!element) return;
    setIsGeneratingPdf(true);
    try {
      const res = await generateInvoiceJpg(element, invoice.invoiceNumber);
      if (!res) {
        alert('Invoice image could not be generated. Please try again.');
        return;
      }
      downloadJpg(res.blob, res.filename);
      console.log(`Invoice JPG downloaded: ${res.filename} (${res.width}x${res.height}, ${(res.sizeBytes / 1024).toFixed(1)} KB)`);
      setPdfSuccessMessage(`Invoice photo downloaded: ${res.filename} (${res.width}x${res.height})`);
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Centralized WhatsApp Action
  const handleWhatsAppAction = async (isReminderOnly = false) => {
    if (!invoice.customer?.phone) {
      setPdfSuccessMessage('Customer phone number is missing. Cannot send WhatsApp message.');
      setTimeout(() => setPdfSuccessMessage(null), 5000);
      return;
    }

    try {
      const messageType = resolveMessageType(paymentState, isReminderOnly);
      const paymentData = buildPaymentData();
      await openWhatsAppChat(invoice.invoiceNumber, paymentData, messageType);
    } catch (err: any) {
      setPdfSuccessMessage(err.message || 'WhatsApp action failed.');
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div
      className="rashidi-invoice-wrapper"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        overflowY: 'auto',
        padding: '24px 16px',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Print Styles: strictly vector-crisp, exact 1-page A4 portrait, hides all dialog controls & background flow */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #root {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          .rashidi-invoice-wrapper {
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            backdrop-filter: none !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }
          .rashidi-invoice-wrapper * {
            visibility: hidden;
          }
          .rashidi-invoice-preview-container {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            display: block !important;
          }
          .rashidi-invoice-preview-container .rashidi-invoice-paper,
          .rashidi-invoice-preview-container .rashidi-invoice-paper * {
            visibility: visible !important;
          }
          .rashidi-invoice-preview-container .rashidi-invoice-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            min-height: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 6mm 10mm !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Control & Action Bar (Hidden on Print) */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '820px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #334155',
          }}
        >
          {/* Left: Invoice info & dynamic payment badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.3px' }}>
              Invoice: {invoice.invoiceNumber}
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                backgroundColor:
                  paymentState === 'FULLY PAID'
                    ? '#059669'
                    : paymentState === 'PARTIALLY PAID'
                    ? '#d97706'
                    : '#dc2626',
                color: '#ffffff',
              }}
            >
              {paymentState}
            </span>
            {invoice.invoiceStatus === 'CANCELLED' && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontWeight: 800,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                }}
              >
                CANCELLED
              </span>
            )}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* Print Button */}
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Print standard A4 invoice"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            {/* Download Invoice PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                opacity: isGeneratingPdf ? 0.7 : 1,
              }}
              title="Download official digital PDF"
            >
              <Download size={15} />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download Invoice PDF'}</span>
            </button>

            {/* Download Invoice Photo (JPG) */}
            <button
              onClick={handleDownloadPhoto}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0369a1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                opacity: isGeneratingPdf ? 0.7 : 1,
              }}
              title="Download high-resolution invoice photo (JPG)"
            >
              <ImageIcon size={15} />
              <span>Download Invoice Image</span>
            </button>

            {/* WhatsApp Customer */}
            {invoice.invoiceStatus !== 'CANCELLED' && (
              <button
                onClick={() => handleWhatsAppAction(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Send pre-filled WhatsApp message"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Customer</span>
              </button>
            )}

            {/* Payment Reminder */}
            {invoice.invoiceStatus !== 'CANCELLED' && paymentState !== 'FULLY PAID' && (
              <button
                onClick={() => handleWhatsAppAction(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Send pre-filled payment reminder"
              >
                <BellRing size={15} />
                <span>Payment Reminder</span>
              </button>
            )}

            {/* Audit History */}
            <button
              onClick={() => setShowHistoryModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="View Complete Audit Trail"
            >
              <History size={15} />
              <span>History</span>
            </button>

            {/* Done */}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#475569',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Check size={15} />
                <span>Done</span>
              </button>
            )}

            {/* Cancel invoice button */}
            {onCancel && invoice.invoiceStatus !== 'CANCELLED' && (
              <button
                onClick={onCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Ban size={15} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* PDF/Photo Toast */}
        {pdfSuccessMessage && (
          <div
            style={{
              backgroundColor: '#064e3b',
              border: '1.5px solid #34d399',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Check size={18} color="#34d399" />
            <span style={{ flex: 1 }}>{pdfSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* ───────────────────── PREVIEW WRAPPER (ON-SCREEN) ───────────────────── */}
      <div
        className="rashidi-invoice-preview-container"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          paddingBottom: '24px',
        }}
      >
        <RashidiStarInvoiceSheet
          invoice={invoice}
          innerRef={invoicePaperRef}
          isExport={false}
        />
      </div>

      {/* ───────────────────── DEDICATED FIXED A4 EXPORT CONTAINER (OFFSCREEN) ───────────────────── */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '794px',
          height: '1123px',
          minHeight: '1123px',
          maxHeight: '1123px',
          backgroundColor: '#ffffff',
          visibility: 'visible',
          display: 'block',
          opacity: 1,
          zIndex: -9999,
          pointerEvents: 'none',
        }}
      >
        <RashidiStarInvoiceSheet
          invoice={invoice}
          innerRef={exportInvoicePaperRef}
          isExport={true}
        />
      </div>

      {showHistoryModal && (
        <TransactionAuditModal
          reference={invoice.invoiceNumber}
          isOpen={true}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

export default RashidiStarInvoice;
