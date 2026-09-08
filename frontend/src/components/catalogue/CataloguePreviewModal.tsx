import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { type TemporaryCatalogueProduct } from '../../utils/catalogueUtils';
import { CataloguePages } from './CataloguePages';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CataloguePreviewModalProps {
  products: TemporaryCatalogueProduct[];
  onClose: () => void;
}

export const CataloguePreviewModal: React.FC<CataloguePreviewModalProps> = ({ products, onClose }) => {
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const totalPages = products.length === 0 ? 0 : Math.ceil(products.length / 2) + 2; // Cover + (Prods / 2) + Contact
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Focus trap / escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isExporting]);

  /**
   * Helper: Wait for all web fonts and images inside an element to be completely loaded.
   */
  const waitForElementAssets = async (element: HTMLElement): Promise<void> => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          const onDone = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
            resolve();
          };
          img.addEventListener('load', onDone);
          img.addEventListener('error', onDone);
          setTimeout(onDone, 3500); // Safety fallback timeout
        });
      })
    );
  };

  /**
   * Safe, Dedicated Fixed A4 PDF Exporter
   */
  const handleExportPdf = async () => {
    if (isExporting || products.length === 0) return;
    setIsExporting(true);
    setStatusMessage(null);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 1; i <= totalPages; i++) {
        const pageEl = document.getElementById(`export-catalogue-page-${i}`);
        if (!pageEl) {
          throw new Error(`Catalogue export page ${i} not found in DOM.`);
        }

        // Wait for all fonts and images (including object URLs) to be fully ready
        await waitForElementAssets(pageEl);

        // Capture the raw, unscaled, fixed A4 element directly
        const canvas = await html2canvas(pageEl, {
          scale: 2, // High resolution (1588 x 2246)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          allowTaint: true,
        });

        // 9. Prevent blank exports: verify canvas dimensions and data
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error(`Catalogue page ${i} produced a blank canvas.`);
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (!imgData || imgData === 'data:,' || imgData.length < 200) {
          throw new Error(`Catalogue page ${i} image data was empty.`);
        }

        if (i > 1) {
          pdf.addPage('a4', 'portrait');
        }

        // Insert as exact full A4 page (no auto-scaling that shifts proportions)
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const dateStr = new Date().toISOString().split('T')[0];
      try {
        (window as any).__lastCataloguePdfBase64 = pdf.output('datauristring');
      } catch (e) {
        console.warn('Could not store pdf base64 on window:', e);
      }
      pdf.save(`Rashidi-Star-Wholesale-Catalogue-${dateStr}.pdf`);

      setStatusMessage({ text: 'Catalogue PDF downloaded successfully.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error) {
      console.error('Catalogue PDF Export failed:', error);
      setStatusMessage({
        text: 'Catalogue PDF could not be generated. Please try again.',
        type: 'error',
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex flex-col">
      {/* Top Header Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="font-semibold text-slate-100 flex items-center gap-2">
            <span>Catalogue Preview</span>
            <span className="text-xs bg-sky-950 border border-sky-800 text-sky-400 px-2 py-0.5 rounded font-mono">
              A4 Portrait (2 Products/Page)
            </span>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex items-center gap-6">
          {/* Pagination Controls */}
          <div className="flex items-center gap-3 text-white">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isExporting}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium w-28 text-center text-slate-300">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isExporting}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting || products.length === 0}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Generating Catalogue PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900 p-6 flex flex-col items-center">
        {/* Mobile status banner if present */}
        {statusMessage && (
          <div
            className={`md:hidden mb-4 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 
          1. PREVIEW WRAPPER:
          Scales visually on screen for easy reading, but does NOT affect the raw A4 document.
        */}
        <div
          className="preview-wrapper"
          style={{
            transform: 'scale(0.82)',
            transformOrigin: 'top center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {/* Renders ONLY the current page for the preview UI */}
          <CataloguePages products={products} singlePage={currentPage} idPrefix="preview-catalogue-page" />
        </div>
      </div>

      {/* 
        2. DEDICATED FIXED A4 EXPORT CONTAINER:
        - NEVER uses display: none, visibility: hidden, or opacity: 0.
        - Part of the DOM layout, placed offscreen at left: -10000px.
        - Exactly 794px width (A4 at 96 DPI).
        - Contains ALL pages without ANY CSS transforms so html2canvas captures raw fixed A4.
      */}
      <div
        id="catalogue-pdf-export-container"
        ref={exportContainerRef}
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          visibility: 'visible',
          display: 'block',
          opacity: 1,
          zIndex: -9999,
          pointerEvents: 'none',
        }}
      >
        <CataloguePages products={products} idPrefix="export-catalogue-page" />
      </div>
    </div>
  );
};
