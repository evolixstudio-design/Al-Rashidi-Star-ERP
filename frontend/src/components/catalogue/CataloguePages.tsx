import React, { forwardRef } from 'react';
import { type TemporaryCatalogueProduct, chunkProducts } from '../../utils/catalogueUtils';
import rashidiLuxuryLogo from '../../assets/catalogue/rashidi_logo_lockup_clean.png';
import kuwaitSkyline from '../../assets/catalogue/kuwait_skyline_pure.png';

interface CataloguePagesProps {
  products: TemporaryCatalogueProduct[];
  singlePage?: number;
  idPrefix?: string;
}

// 4-Point Gold Sparkle Star Icon for Dividers
const GoldSparkle: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 20, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path
      d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
      fill="url(#goldSparkleGrad)"
    />
    <defs>
      <linearGradient id="goldSparkleGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d8b974" />
        <stop offset="50%" stopColor="#c5a059" />
        <stop offset="100%" stopColor="#9a7b3c" />
      </linearGradient>
    </defs>
  </svg>
);

// Large faint star watermark for background
const FaintStarWatermark: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width="400" height="400" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', opacity: 0.03, pointerEvents: 'none', zIndex: 1, ...style }}>
    <path
      d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
      fill="#c5a059"
    />
  </svg>
);

// Central Page Divider
const CentralDivider: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      ...style,
    }}
  >
    <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, transparent, #c5a059 70%, #c5a059)' }} />
    <GoldSparkle size={30} style={{ margin: '0 16px', flexShrink: 0 }} />
    <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, #c5a059, #c5a059 30%, transparent)' }} />
  </div>
);

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.029 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z"/>
  </svg>
);

// Frame Wrapper for All Pages (A4 Portrait, clean white)
const CataloguePageFrame: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <div
      id={id}
      className="catalogue-page"
      style={{
        width: '794px',
        height: '1123px',
        minWidth: '794px',
        minHeight: '1123px',
        maxWidth: '794px',
        maxHeight: '1123px',
        backgroundColor: '#ffffff',
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle Pattern & Watermark Background */}
      <svg
        width="794"
        height="1123"
        viewBox="0 0 794 1123"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '794px',
          height: '1123px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          <pattern id="islamic-geo-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M40 8 L48 24 L66 16 L56 32 L72 40 L56 48 L66 64 L48 56 L40 72 L32 56 L14 64 L24 48 L8 40 L24 32 L14 16 L32 24 Z"
              fill="none"
              stroke="#c5a059"
              strokeWidth="0.3"
              opacity="0.04"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-geo-pattern)" />
      </svg>
      
      {/* Large faint decorative stars to match reference */}
      <FaintStarWatermark style={{ right: '-100px', top: '150px', transform: 'scale(1.5)' }} />
      <FaintStarWatermark style={{ right: '-50px', bottom: '150px', transform: 'scale(1.2)' }} />

      {/* Page Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '24px 32px', // Tighter outer padding to allow content to breathe
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Legacy Frame for exactly matching the Cover & Contact screenshots
const LegacyPageFrame: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <div
      id={id}
      className="catalogue-page"
      style={{
        width: '794px',
        height: '1123px',
        minWidth: '794px',
        minHeight: '1123px',
        maxWidth: '794px',
        maxHeight: '1123px',
        backgroundColor: '#ffffff',
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <svg
        width="794"
        height="1123"
        viewBox="0 0 794 1123"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        <rect width="100%" height="100%" fill="url(#islamic-geo-pattern)" />
      </svg>
      
      <div style={{ padding: '16px', boxSizing: 'border-box', width: '100%', height: '100%', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', height: '100%', border: '1px solid #d8b974', padding: '6px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: '100%', border: '1.5px solid #d8b974', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
            {/* Corner Diamonds */}
            <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '4px', height: '4px', backgroundColor: '#d8b974', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '4px', height: '4px', backgroundColor: '#d8b974', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '4px', height: '4px', backgroundColor: '#d8b974', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '4px', height: '4px', backgroundColor: '#d8b974', transform: 'rotate(45deg)' }} />

            {/* Top Texts */}
            <div style={{ position: 'absolute', top: '24px', left: '32px', textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 600, color: '#a88c52', letterSpacing: '2px', lineHeight: 1.6 }}>
              QUALITY<br/>PRODUCTS<br/>BRIGHTER<br/>TOMORROWS
            </div>
            <div style={{ position: 'absolute', top: '24px', right: '32px', textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '9px', fontWeight: 600, color: '#a88c52', letterSpacing: '2px', lineHeight: 1.6 }}>
              TRUST<br/>TRADE<br/>TOGETHER
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {children}
            </div>

            {/* Skyline */}
            <div style={{ position: 'absolute', bottom: '60px', left: 0, width: '100%', zIndex: 5 }}>
              <img src={kuwaitSkyline} alt="Kuwait Skyline" style={{ width: '100%', height: '180px', objectFit: 'cover', objectPosition: 'bottom center', opacity: 0.15 }} />
            </div>

            {/* Footer Bar */}
            <div style={{ position: 'absolute', bottom: '32px', left: 0, width: '100%', zIndex: 10, backgroundColor: 'rgba(253, 251, 247, 0.95)', borderTop: '1px solid #d8b974', borderBottom: '1px solid #d8b974', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" /></svg>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#0c2340', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 800 }}>RASHIDI STAR</span><br/>General Trading Co.
                </div>
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#e5d3ab' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#0c2340', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 800 }}>Souk Al-Fahad</span><br/>Opp. Masjid Al-Fahad - Shop No. 36<br/>Kuwait
                </div>
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#e5d3ab' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#0c2340', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 800 }}>Mob.: 99598297</span><br/><span style={{ fontWeight: 800 }}>Mob.: 97488405</span>
                </div>
              </div>
              
            </div>

            {/* Bottom text outside footer */}
            <div style={{ position: 'absolute', bottom: '10px', left: 0, width: '100%', textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '8px', fontWeight: 700, color: '#a88c52', letterSpacing: '4px' }}>
              PEOPLE &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; PRODUCTS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; POSSIBILITIES
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};


export const CataloguePages = forwardRef<HTMLDivElement, CataloguePagesProps>(
  ({ products, singlePage, idPrefix = 'catalogue-page' }, ref) => {
    // Exactly 2 products per product page
    const productPages = chunkProducts(products, 2);
    const totalPages = Math.ceil(products.length / 2) + 2;

    // Helper: Render a Single Product Half-Section (Top or Bottom)
    const renderProductHalf = (product?: TemporaryCatalogueProduct) => {
      if (!product) {
        return (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Elegant placeholder for empty half */}
            <div style={{ opacity: 0.2, transform: 'scale(0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FaintStarWatermark style={{ position: 'relative', opacity: 0.1 }} />
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: '#cbd5e1',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginTop: '16px',
              }}
            >
              PREMIUM WHOLESALE COLLECTION
            </div>
          </div>
        );
      }

      const hasPrice = product.wholesalePrice !== undefined && product.wholesalePrice !== null;
      const hasDetails = !!(product.size || product.colour || product.quality);
      const autoHighlights = ["Premium Quality", "Soft & Durable", "Ideal for Wholesale"];

      // Small generic highlight icons (simple SVG shapes)
      const highlightIcons = [
        // Diamond
        <svg key="h-diamond" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M8 1 L15 8 L8 15 L1 8 Z" fill="none" stroke="#c5a059" strokeWidth="1.5" />
        </svg>,
        // Circle
        <svg key="h-circle" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6" fill="none" stroke="#c5a059" strokeWidth="1.5" />
        </svg>,
        // Star
        <svg key="h-star" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M8 1 L9.8 6 L15 6.5 L11 10 L12.2 15 L8 12.5 L3.8 15 L5 10 L1 6.5 L6.2 6 Z" fill="none" stroke="#c5a059" strokeWidth="1.2" />
        </svg>,
      ];

      // Price or Contact box
      const renderPriceOrContactBox = () => (
        <div
          style={{
            width: '100%',
            border: '1.5px solid #d8b974',
            borderRadius: '8px',
            backgroundColor: '#faf8f2',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(197, 160, 89, 0.04)',
            overflow: 'hidden',
          }}
        >
          {hasPrice ? (
            <div
              style={{
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '32px',
                fontWeight: 800,
                color: '#0c2340',
              }}
            >
              K.D. {product.wholesalePrice!.toFixed(3)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#9a7b3c',
                  letterSpacing: '0.5px',
                }}
              >
                CONTACT FOR PRICE
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#e0c78a' }} />
              <div
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0c2340',
                }}
              >
                <WhatsAppIcon />
                WhatsApp: +965 99598297 / 97488405
              </div>
            </div>
          )}
        </div>
      );

      // Detail info row (Size / Colour / Quality)
      const renderDetailRow = (label: string, value: string) => (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {label}:
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              color: '#0c2340',
            }}
          >
            {value}
          </span>
        </div>
      );

      return (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            boxSizing: 'border-box',
            gap: '28px',
          }}
        >
          {/* Left Column: Product Image */}
          <div
            style={{
              flex: '0 0 44%',
              height: '100%',
              maxHeight: '420px',
              borderRadius: '16px',
              border: '1.5px solid #d8b974',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              padding: '6px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f8f8',
              }}
            >
              <img
                src={product.imageObjUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div
            style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingRight: '4px',
            }}
          >
            {/* Product Name */}
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '38px',
                fontWeight: 800,
                color: '#0c2340',
                lineHeight: 1.1,
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px',
                wordBreak: 'break-word',
              }}
            >
              {product.name}
            </h3>

            {/* Optional Article Number */}
            {product.articleNo && (
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '17px',
                  color: '#64748b',
                  marginBottom: '12px',
                  fontWeight: 500,
                }}
              >
                Article No: <span style={{ fontWeight: 800, color: '#0c2340' }}>{product.articleNo}</span>
              </div>
            )}

            {/* Optional Product Details (Size / Colour / Quality) */}
            {hasDetails && (
              <div
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#faf9f6',
                  border: '1px solid #e8e2d4',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              >
                {product.quality && renderDetailRow('Quality', product.quality)}
                {product.size && renderDetailRow('Size', product.size)}
                {product.colour && renderDetailRow('Colour', product.colour)}
              </div>
            )}

            {/* Auto-generated Highlight Badges for Clothes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: '12px',
                width: '100%',
              }}
            >
              {autoHighlights.map((hl, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '80px',
                    maxWidth: '110px',
                  }}
                >
                  {highlightIcons[i % highlightIcons.length]}
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#0c2340',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {hl}
                  </span>
                </div>
              ))}
            </div>

            {/* Price / Contact Box */}
            <div style={{ marginTop: '24px', width: '100%' }}>
              {renderPriceOrContactBox()}
            </div>
          </div>
        </div>
      );
    };

    // 1. Render Cover Page (Page 1)
    const renderCoverPage = (pageNumber = 1) => (
      <LegacyPageFrame id={`${idPrefix}-${pageNumber}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-40px)' }}>
          <img
            src={rashidiLuxuryLogo}
            alt="Rashidi Star Logo"
            style={{ width: '380px', height: 'auto', maxHeight: '260px', objectFit: 'contain', display: 'block' }}
          />
          <div style={{ width: '400px', margin: '40px 0' }}>
            <div style={{ width: '100%', height: '1.5px', background: '#c5a059' }} />
          </div>
          
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '56px',
              fontWeight: 800,
              color: '#0c2340',
              letterSpacing: '3px',
              margin: 0,
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            WHOLESALE
          </h1>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              fontWeight: 700,
              color: '#0c2340',
              letterSpacing: '5px',
              margin: '12px 0 0 0',
              textTransform: 'uppercase',
            }}
          >
            PRODUCT CATALOGUE
          </h2>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700, color: '#0c2340', fontStyle: 'italic', marginTop: '4px' }}>
            Kuwait
          </div>

          <div style={{ width: '400px', height: '1.5px', background: '#e0c78a', marginTop: '24px' }} />

          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#a88c52',
              letterSpacing: '4px',
              marginTop: '32px',
              textTransform: 'uppercase',
            }}
          >
            GLOBAL PRODUCTS
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#a88c52',
              letterSpacing: '4px',
              marginTop: '8px',
              textTransform: 'uppercase',
            }}
          >
            STRONGER TOMORROWS
          </div>
        </div>
      </LegacyPageFrame>
    );

    // 2. Render Product Page
    const renderProductPage = (pageProducts: TemporaryCatalogueProduct[], pageNumber: number) => {
      const prod1 = pageProducts[0];
      const prod2 = pageProducts[1];

      return (
        <CataloguePageFrame
          key={`product-page-${pageNumber}`}
          id={`${idPrefix}-${pageNumber}`}
        >
          {/* Header */}
          <div style={{ width: '100%', flexShrink: 0, marginBottom: '16px' }}>
            {/* Top row with logo and catalogue title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={rashidiLuxuryLogo}
                  alt="Rashidi Star"
                  style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#0c2340',
                    letterSpacing: '3.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  WHOLESALE PRODUCT CATALOGUE
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    letterSpacing: '3px',
                    marginTop: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  QUALITY PRODUCTS &nbsp;&nbsp;|&nbsp;&nbsp; TRUSTED PARTNER
                </div>
              </div>
            </div>
            {/* Double gold line header divider */}
            <div style={{ width: '100%', height: '2px', backgroundColor: '#c5a059', marginBottom: '8px' }} />
            {/* Sub-header text */}
            <div
              style={{
                textAlign: 'right',
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              KUWAIT &nbsp;&nbsp;|&nbsp;&nbsp; GLOBAL TRADE &nbsp;&nbsp;|&nbsp;&nbsp; A STRONGER TOMORROW
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top Half */}
            {renderProductHalf(prod1)}

            {/* Central Elegant Gold Divider */}
            <div style={{ margin: '12px 0', flexShrink: 0 }}>
              <CentralDivider />
            </div>

            {/* Bottom Half */}
            {renderProductHalf(prod2)}
          </div>

          {/* Footer */}
          <div
            style={{
              width: '100%',
              flexShrink: 0,
              marginTop: '16px',
            }}
          >
            <div style={{ width: '100%', height: '1.5px', backgroundColor: '#c5a059', marginBottom: '16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0c2340',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                }}
              >
                RASHIDI STAR GENERAL TRADING CO.<br/>
                <span style={{ color: '#64748b', fontWeight: 600 }}>KUWAIT</span>
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: '#c5a059', margin: '0 12px' }}>|</span> QUALITY PRODUCTS FOR A BRIGHTER TOMORROW
              </div>
            </div>
          </div>
        </CataloguePageFrame>
      );
    };

    // 3. Render Contact Us Page
    const renderContactPage = (pageNumber: number) => (
      <LegacyPageFrame id={`${idPrefix}-${pageNumber}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-40px)' }}>
          <img
            src={rashidiLuxuryLogo}
            alt="Rashidi Star Logo"
            style={{ width: '380px', height: 'auto', maxHeight: '260px', objectFit: 'contain', display: 'block' }}
          />

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '56px',
              fontWeight: 800,
              color: '#0c2340',
              letterSpacing: '4px',
              margin: '40px 0 0 0',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            CONTACT US
          </h1>
          <div style={{ fontFamily: "'Arial', sans-serif", fontSize: '32px', color: '#0c2340', fontWeight: 'bold', marginTop: '16px' }}>
            اتصل بنا
          </div>
          <div style={{ width: '280px', height: '1.5px', background: '#e0c78a', margin: '24px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: '#0c2340', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 800 }}>RASHIDI STAR</span><br/>General Trading Co.<br/>Souk Al-Fahad<br/>Opp. Masjid Al-Fahad - Shop No. 36<br/>Kuwait
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0c2340', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', color: '#0c2340', lineHeight: 1.5, fontWeight: 800 }}>
                Mob.: 99598297<br/>Mob.: 97488405
              </div>
            </div>
          </div>

          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 700, color: '#a88c52', fontStyle: 'italic', marginTop: '60px' }}>
            Thank you for your business.
          </div>
        </div>
      </LegacyPageFrame>
    );

    // Render logic
    if (singlePage !== undefined) {
      if (singlePage === 1) {
        return <div ref={ref} className="catalogue-pages-container">{renderCoverPage(1)}</div>;
      }
      if (singlePage === totalPages) {
        return <div ref={ref} className="catalogue-pages-container">{renderContactPage(totalPages)}</div>;
      }
      const prodPageIdx = singlePage - 2;
      const pageProducts = productPages[prodPageIdx] || [];
      return (
        <div ref={ref} className="catalogue-pages-container">
          {renderProductPage(pageProducts, singlePage)}
        </div>
      );
    }

    let pageCounter = 1;
    return (
      <div ref={ref} className="catalogue-pages-container" style={{ width: '794px' }}>
        {renderCoverPage(pageCounter++)}
        {productPages.map((pageProducts) => {
          const pNum = pageCounter++;
          return renderProductPage(pageProducts, pNum);
        })}
        {renderContactPage(pageCounter++)}
      </div>
    );
  }
);
