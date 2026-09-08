import React, { forwardRef } from 'react';
import { type TemporaryCatalogueProduct, chunkProducts } from '../../utils/catalogueUtils';
import rashidiLuxuryLogo from '../../assets/catalogue/rashidi_logo_lockup_clean.png';
import kuwaitSkyline from '../../assets/catalogue/kuwait_skyline_pure.png';

interface CataloguePagesProps {
  products: TemporaryCatalogueProduct[];
  /** Optional single page number to render for preview mode (1-indexed) */
  singlePage?: number;
  /** ID prefix for the page elements (defaults to "catalogue-page") */
  idPrefix?: string;
}

// 4-Point Gold Sparkle Star Icon
const GoldSparkle: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 15, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path
      d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
      fill="url(#goldSparkleGrad)"
    />
    <defs>
      <linearGradient id="goldSparkleGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f3deb3" />
        <stop offset="45%" stopColor="#c5a059" />
        <stop offset="100%" stopColor="#8e6d33" />
      </linearGradient>
    </defs>
  </svg>
);

// Gold divider line with centered sparkle
const GoldDivider: React.FC<{ width?: string; style?: React.CSSProperties }> = ({ width = '100%', style }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width,
      margin: '0 auto',
      ...style,
    }}
  >
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #c5a059 70%, #c5a059)' }} />
    <GoldSparkle size={13} style={{ margin: '0 10px', flexShrink: 0 }} />
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #c5a059, #c5a059 30%, transparent)' }} />
  </div>
);

// Classical Folio Corner Flourish
const CornerFlourish: React.FC<{ x: number; y: number; rotate: number }> = ({ x, y, rotate }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotate})`}>
    <path
      d="M 6 34 L 6 10 C 6 7.8 7.8 6 10 6 L 34 6"
      fill="none"
      stroke="#c5a059"
      strokeWidth="1.6"
    />
    <path
      d="M 12 28 L 12 14 C 12 12.9 12.9 12 14 12 L 28 12"
      fill="none"
      stroke="#d8b974"
      strokeWidth="1"
    />
    <circle cx="19" cy="19" r="2.2" fill="#c5a059" />
    <path d="M 6 6 L 2 2 M 10 2 L 2 10" stroke="#c5a059" strokeWidth="1" />
  </g>
);

// Navy Circular Badges
const BuildingBadge: React.FC = () => (
  <div
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#0c2340',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d8b974" strokeWidth="1.8">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  </div>
);

const LocationBadge: React.FC = () => (
  <div
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#0c2340',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d8b974" strokeWidth="1.8">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  </div>
);

const PhoneBadge: React.FC = () => (
  <div
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#0c2340',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d8b974" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  </div>
);

// Frame Wrapper for All Pages (A4 Portrait, Double Gold Border, Corner Flourishes, Arabesque Background)
const CataloguePageFrame: React.FC<{
  id: string;
  children: React.ReactNode;
  showKuwaitSkyline?: boolean;
}> = ({ id, children, showKuwaitSkyline = false }) => {
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
        backgroundColor: '#faf6ee',
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. Vector Geometric Arabesque Pattern & Gold Border Frame */}
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
          <pattern id="islamic-geo-pattern" width="84" height="84" patternUnits="userSpaceOnUse">
            <path
              d="M42 8 L50 25 L67 17 L59 34 L76 42 L59 50 L67 67 L50 59 L42 76 L34 59 L17 67 L25 50 L8 42 L25 34 L17 17 L34 25 Z"
              fill="none"
              stroke="#c5a059"
              strokeWidth="0.65"
              opacity="0.08"
            />
            <circle cx="42" cy="42" r="13" fill="none" stroke="#c5a059" strokeWidth="0.5" opacity="0.06" />
          </pattern>
        </defs>

        {/* Subtle geometric pattern overlay across background */}
        <rect width="100%" height="100%" fill="url(#islamic-geo-pattern)" />

        {/* Double Gold Outer/Inner Borders */}
        <rect x="18" y="18" width="758" height="1087" fill="none" stroke="#c5a059" strokeWidth="1.8" />
        <rect x="23" y="23" width="748" height="1077" fill="none" stroke="#e0c78a" strokeWidth="0.8" />

        {/* 4 Corner Flourishes */}
        <CornerFlourish x={18} y={18} rotate={0} />
        <CornerFlourish x={776} y={18} rotate={90} />
        <CornerFlourish x={776} y={1105} rotate={180} />
        <CornerFlourish x={18} y={1105} rotate={270} />
      </svg>

      {/* 2. Kuwait Skyline Graphic (For Cover & Contact pages) */}
      {showKuwaitSkyline && (
        <img
          src={kuwaitSkyline}
          alt="Kuwait Skyline"
          style={{
            position: 'absolute',
            left: '24px',
            bottom: '105px',
            width: '746px',
            height: '240px',
            objectFit: 'cover',
            objectPosition: 'bottom center',
            pointerEvents: 'none',
            zIndex: 2,
            opacity: 0.95,
          }}
        />
      )}

      {/* 3. Page Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '28px',
        }}
      >
        {children}
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
    const renderProductHalf = (product?: TemporaryCatalogueProduct, isTopHalf = true) => {
      if (!product) {
        // Empty half when odd number of products
        return (
          <div
            style={{
              flex: 1,
              height: '455px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        );
      }

      return (
        <div
          style={{
            flex: 1,
            height: '455px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Column 1: Left Decorative Vertical Motto */}
          <div
            style={{
              width: '85px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ width: '26px', height: '1px', backgroundColor: '#c5a059', marginBottom: '10px' }} />
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '8.5px',
                fontWeight: 600,
                color: '#8a704c',
                letterSpacing: '2.5px',
                lineHeight: 1.8,
              }}
            >
              {isTopHalf ? (
                <>
                  ELEGANCE
                  <br />
                  IN EVERY
                  <br />
                  DETAIL
                </>
              ) : (
                <>
                  COMFORT
                  <br />
                  MEETS
                  <br />
                  TRADITION
                </>
              )}
            </div>
            <div style={{ width: '26px', height: '1px', backgroundColor: '#c5a059', marginTop: '10px' }} />
          </div>

          {/* Column 2: Architectural Arch Niche Showcase */}
          <div
            style={{
              width: '280px',
              height: '400px',
              borderRadius: '140px 140px 8px 8px',
              background: 'radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f4eee2 75%, #ebdcc6 100%)',
              border: '1.5px solid rgba(197, 160, 89, 0.4)',
              boxShadow: 'inset 0 4px 18px rgba(184, 142, 68, 0.12), 0 6px 16px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <img
              src={product.imageObjUrl}
              alt={product.name}
              style={{
                maxWidth: '92%',
                maxHeight: '92%',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.08))',
              }}
            />
          </div>

          {/* Column 3: Dynamic Product Details Stack */}
          <div
            style={{
              width: '290px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 10px',
              boxSizing: 'border-box',
            }}
          >
            {/* Dynamic Product Name */}
            <h3
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#0c2340',
                letterSpacing: '1.2px',
                margin: '0 0 6px 0',
                textTransform: 'uppercase',
                lineHeight: 1.25,
                maxWidth: '280px',
              }}
            >
              {product.name}
            </h3>

            {/* Dynamic Article No */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '14.5px',
                fontWeight: 600,
                color: '#0c2340',
                margin: '0 0 18px 0',
                letterSpacing: '0.4px',
              }}
            >
              Article No: <span style={{ fontWeight: 700 }}>{product.articleNo}</span>
            </div>

            {/* Wholesale Price Label */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#8a704c',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              W H O L E S A L E &nbsp; P R I C E
            </div>

            {/* Dynamic Price in KD */}
            <div
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '38px',
                fontWeight: 800,
                color: '#0c2340',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              K.D. {product.wholesalePrice.toFixed(3)}
            </div>

            {/* Gold Sparkle Star */}
            <GoldSparkle size={15} style={{ margin: '12px auto 8px auto' }} />

            {/* Luxury Editorial Subtitle */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '8px',
                fontWeight: 600,
                color: '#8a704c',
                letterSpacing: '2px',
                lineHeight: 1.7,
              }}
            >
              {isTopHalf ? (
                <>
                  TIMELESS STYLE
                  <br />
                  FOR A BRIGHTER TOMORROW
                </>
              ) : (
                <>
                  NATURAL FABRICS
                  <br />
                  FOR A BRIGHTER TOMORROW
                </>
              )}
            </div>
          </div>
        </div>
      );
    };

    // 1. Render Cover Page (Page 1)
    const renderCoverPage = (pageNumber = 1) => (
      <CataloguePageFrame
        key="cover-page"
        id={`${idPrefix}-${pageNumber}`}
        showKuwaitSkyline={true}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
          {/* Top Corner Mottos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px 0 16px' }}>
            <div style={{ textAlign: 'center', width: '130px' }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#8a704c',
                  letterSpacing: '2.5px',
                  lineHeight: 1.6,
                }}
              >
                QUALITY
                <br />
                PRODUCTS
                <br />
                BRIGHTER
                <br />
                TOMORROWS
              </div>
              <div style={{ width: '28px', height: '1px', backgroundColor: '#c5a059', margin: '8px auto 0 auto' }} />
            </div>

            <div style={{ textAlign: 'center', width: '130px' }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#8a704c',
                  letterSpacing: '2.5px',
                  lineHeight: 1.6,
                }}
              >
                TRUST
                <br />
                TRADE
                <br />
                TOGETHER
              </div>
              <div style={{ width: '28px', height: '1px', backgroundColor: '#c5a059', margin: '8px auto 0 auto' }} />
            </div>
          </div>

          {/* Central Logo Lockup */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <img
              src={rashidiLuxuryLogo}
              alt="Rashidi Star Logo"
              style={{
                width: '260px',
                height: 'auto',
                maxHeight: '190px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {/* Gold Star Divider Line */}
            <div style={{ width: '240px', marginTop: '6px' }}>
              <GoldDivider width="240px" />
            </div>
          </div>

          {/* Main Titles */}
          <div style={{ textAlign: 'center', marginTop: '22px' }}>
            <h1
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '48px',
                fontWeight: 800,
                color: '#0c2340',
                letterSpacing: '4px',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              WHOLESALE
            </h1>
            <h2
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '25px',
                fontWeight: 700,
                color: '#0c2340',
                letterSpacing: '5px',
                margin: '8px 0 0 0',
                textTransform: 'uppercase',
              }}
            >
              PRODUCT CATALOGUE
            </h2>

            {/* Kuwait Italic Accent with flanking gold lines */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                width: '320px',
                margin: '14px auto 0 auto',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#c5a059' }} />
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: '22px',
                  color: '#0c2340',
                  letterSpacing: '2px',
                  fontWeight: 600,
                }}
              >
                Kuwait
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#c5a059' }} />
            </div>

            {/* Secondary Motto */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '10.5px',
                fontWeight: 600,
                color: '#8a704c',
                letterSpacing: '3.5px',
                marginTop: '36px',
                lineHeight: 1.8,
              }}
            >
              GLOBAL PRODUCTS
              <br />
              STRONGER TOMORROWS
              <div style={{ width: '38px', height: '1px', backgroundColor: '#c5a059', margin: '12px auto 0 auto' }} />
            </div>
          </div>

          {/* Bottom Contact Strip (Gold Framed Card with 3 Columns) */}
          <div
            style={{
              marginTop: 'auto',
              marginBottom: '4px',
              borderTop: '1px solid #c5a059',
              borderBottom: '1px solid #c5a059',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(250, 246, 238, 0.92)',
              backdropFilter: 'blur(2px)',
            }}
          >
            {/* Left: Building Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <BuildingBadge />
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 800, color: '#0c2340' }}>
                  Rashidi Star
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                  General Trading Co.
                </div>
              </div>
            </div>

            <div style={{ width: '1px', height: '42px', backgroundColor: '#c5a059', margin: '0 10px' }} />

            {/* Center: Location Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1.3 }}>
              <LocationBadge />
              <div style={{ fontSize: '11px', color: '#0c2340', lineHeight: 1.35 }}>
                <div style={{ fontWeight: 700 }}>Souk Al-Fahad</div>
                <div style={{ color: '#475569', fontSize: '10.5px' }}>Opp. Masjid Al-Fahad - Shop No. 36</div>
                <div style={{ color: '#475569', fontSize: '10.5px' }}>Kuwait</div>
              </div>
            </div>

            <div style={{ width: '1px', height: '42px', backgroundColor: '#c5a059', margin: '0 10px' }} />

            {/* Right: Phone Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <PhoneBadge />
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0c2340', lineHeight: 1.4 }}>
                <div>Mob.: 99598297</div>
                <div>Mob.: 97488405</div>
              </div>
            </div>
          </div>

          {/* Bottom-most Footer Sub-line */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '8.5px',
              fontWeight: 600,
              color: '#8a704c',
              letterSpacing: '3px',
              paddingTop: '8px',
            }}
          >
            PEOPLE &nbsp; • &nbsp; PRODUCTS &nbsp; • &nbsp; POSSIBILITIES
          </div>
        </div>
      </CataloguePageFrame>
    );

    // 2. Render Product Page (2 Products per Page: Top Half & Bottom Half)
    const renderProductPage = (pageProducts: TemporaryCatalogueProduct[], pageNumber: number) => {
      const prod1 = pageProducts[0];
      const prod2 = pageProducts[1]; // undefined if single product remaining

      return (
        <CataloguePageFrame
          key={`product-page-${pageNumber}`}
          id={`${idPrefix}-${pageNumber}`}
          showKuwaitSkyline={false}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Bar */}
            <div
              style={{
                height: '84px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px 10px 12px',
                borderBottom: '1.2px solid #c5a059',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {/* Left Motto */}
              <div style={{ textAlign: 'center', width: '105px' }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '8px',
                    fontWeight: 600,
                    color: '#8a704c',
                    letterSpacing: '1.6px',
                    lineHeight: 1.5,
                  }}
                >
                  PEOPLE
                  <br />
                  PRODUCTS
                  <br />
                  POSSIBILITIES
                </div>
                <div style={{ width: '22px', height: '1px', backgroundColor: '#c5a059', margin: '6px auto 0 auto' }} />
              </div>

              {/* Center-Left: Logo Lockup */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={rashidiLuxuryLogo}
                  alt="Rashidi Star"
                  style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                />
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '50px', backgroundColor: '#c5a059', margin: '0 12px' }} />

              {/* Center-Right: Wholesale Product Catalogue Title */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: '21px',
                    fontWeight: 800,
                    color: '#0c2340',
                    letterSpacing: '2.5px',
                    lineHeight: 1.1,
                  }}
                >
                  WHOLESALE
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0c2340',
                    letterSpacing: '3px',
                    marginTop: '2px',
                  }}
                >
                  PRODUCT CATALOGUE
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '7.5px',
                    fontWeight: 600,
                    color: '#8a704c',
                    letterSpacing: '1.5px',
                    marginTop: '4px',
                  }}
                >
                  QUALITY PRODUCTS &nbsp; • &nbsp; BRIGHTER TOMORROWS
                </div>
              </div>

              {/* Right Motto */}
              <div style={{ textAlign: 'center', width: '105px' }}>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '8px',
                    fontWeight: 600,
                    color: '#8a704c',
                    letterSpacing: '1.6px',
                    lineHeight: 1.5,
                  }}
                >
                  TRUST
                  <br />
                  TRADE
                  <br />
                  TOGETHER
                </div>
                <div style={{ width: '22px', height: '1px', backgroundColor: '#c5a059', margin: '6px auto 0 auto' }} />
              </div>
            </div>

            {/* Main Product Area: Exactly 2 Products (Top Half & Bottom Half) */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* Top Half: Product 1 */}
              {renderProductHalf(prod1, true)}

              {/* Center Gold Line Divider with Star */}
              <GoldDivider width="95%" style={{ margin: '4px auto' }} />

              {/* Bottom Half: Product 2 (or placeholder if odd) */}
              {renderProductHalf(prod2, false)}
            </div>

            {/* Footer Bar */}
            <div
              style={{
                height: '62px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '1.2px solid #c5a059',
                padding: '4px 12px 0 12px',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left: Building Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BuildingBadge />
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', fontWeight: 800, color: '#0c2340' }}>
                      Rashidi Star
                    </div>
                    <div style={{ fontSize: '9.5px', fontWeight: 600, color: '#334155' }}>
                      General Trading Co.
                    </div>
                  </div>
                </div>

                <div style={{ width: '1px', height: '28px', backgroundColor: '#c5a059' }} />

                {/* Center: Phone Contacts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PhoneBadge />
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0c2340' }}>
                    99598297 | 97488405
                  </div>
                </div>

                <div style={{ width: '1px', height: '28px', backgroundColor: '#c5a059' }} />

                {/* Right: Page Number */}
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#0c2340',
                    letterSpacing: '0.5px',
                  }}
                >
                  Page {pageNumber}
                </div>
              </div>

              {/* Bottom Sub-line */}
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '8px',
                  fontWeight: 600,
                  color: '#8a704c',
                  letterSpacing: '2.5px',
                  paddingTop: '6px',
                }}
              >
                KUWAIT &nbsp; • &nbsp; GLOBAL PRODUCTS &nbsp; • &nbsp; STRONGER TOMORROWS
              </div>
            </div>
          </div>
        </CataloguePageFrame>
      );
    };

    // 3. Render Contact Us Page (Last Page)
    const renderContactPage = (pageNumber: number) => (
      <CataloguePageFrame
        key="contact-page"
        id={`${idPrefix}-${pageNumber}`}
        showKuwaitSkyline={true}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
          {/* Top Corner Mottos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px 0 16px' }}>
            <div style={{ textAlign: 'center', width: '130px' }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#8a704c',
                  letterSpacing: '2.5px',
                  lineHeight: 1.6,
                }}
              >
                QUALITY
                <br />
                PRODUCTS
                <br />
                BRIGHTER
                <br />
                TOMORROWS
              </div>
              <div style={{ width: '28px', height: '1px', backgroundColor: '#c5a059', margin: '8px auto 0 auto' }} />
            </div>

            <div style={{ textAlign: 'center', width: '130px' }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#8a704c',
                  letterSpacing: '2.5px',
                  lineHeight: 1.6,
                }}
              >
                TRUST
                <br />
                TRADE
                <br />
                TOGETHER
              </div>
              <div style={{ width: '28px', height: '1px', backgroundColor: '#c5a059', margin: '8px auto 0 auto' }} />
            </div>
          </div>

          {/* Central Logo Lockup */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <img
              src={rashidiLuxuryLogo}
              alt="Rashidi Star Logo"
              style={{
                width: '260px',
                height: 'auto',
                maxHeight: '190px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {/* Gold Star Divider Line */}
            <div style={{ width: '240px', marginTop: '6px' }}>
              <GoldDivider width="240px" />
            </div>
          </div>

          {/* Main Title Section */}
          <div style={{ textAlign: 'center', marginTop: '26px' }}>
            <h1
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                fontSize: '46px',
                fontWeight: 800,
                color: '#0c2340',
                letterSpacing: '4px',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              CONTACT US
            </h1>
            <h2
              style={{
                fontFamily: "'Amiri', 'Cairo', serif",
                fontSize: '36px',
                fontWeight: 700,
                color: '#0c2340',
                margin: '6px 0 0 0',
                lineHeight: 1.2,
              }}
            >
              اتصل بنا
            </h2>

            {/* Gold Star Divider Line */}
            <div style={{ width: '280px', margin: '14px auto 0 auto' }}>
              <GoldDivider width="280px" />
            </div>
          </div>

          {/* Central Contact Information Card */}
          <div
            style={{
              width: '380px',
              margin: '28px auto 0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Address Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <LocationBadge />
              <div style={{ color: '#0c2340', lineHeight: 1.4 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 800 }}>
                  Rashidi Star
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  General Trading Co.
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>Souk Al-Fahad</div>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>Opp. Masjid Al-Fahad - Shop No. 36</div>
                <div style={{ fontSize: '12.5px', color: '#334155' }}>Kuwait</div>
              </div>
            </div>

            {/* Phone Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <PhoneBadge />
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0c2340', lineHeight: 1.5 }}>
                <div>Mob.: 99598297</div>
                <div>Mob.: 97488405</div>
              </div>
            </div>
          </div>

          {/* Thank You Note & Star */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <div style={{ width: '200px', margin: '0 auto 12px auto' }}>
              <div style={{ height: '1px', backgroundColor: '#c5a059', opacity: 0.7 }} />
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '18px',
                color: '#7a633c',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Thank you for your business.
            </div>
            <GoldSparkle size={14} style={{ margin: '10px auto 0 auto' }} />
          </div>

          {/* Bottom-most Footer Sub-line */}
          <div
            style={{
              marginTop: 'auto',
              textAlign: 'center',
              fontFamily: "'Cinzel', serif",
              fontSize: '8.5px',
              fontWeight: 600,
              color: '#8a704c',
              letterSpacing: '3px',
              paddingBottom: '6px',
            }}
          >
            PEOPLE &nbsp; • &nbsp; PRODUCTS &nbsp; • &nbsp; POSSIBILITIES
          </div>
        </div>
      </CataloguePageFrame>
    );

    // If singlePage is requested (for preview mode):
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

    // Default: render ALL pages (for export container)
    let pageCounter = 1;
    return (
      <div ref={ref} className="catalogue-pages-container" style={{ width: '794px' }}>
        {/* Page 1: Cover */}
        {renderCoverPage(pageCounter++)}

        {/* Middle: Product Pages (2 products each) */}
        {productPages.map((pageProducts) => {
          const pNum = pageCounter++;
          return renderProductPage(pageProducts, pNum);
        })}

        {/* Last Page: Contact Us */}
        {renderContactPage(pageCounter++)}
      </div>
    );
  }
);
