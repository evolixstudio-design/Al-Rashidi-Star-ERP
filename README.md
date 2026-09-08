# Al-Rashidi-Star-ERP

> **شركة الرشيدي ستار للتجارة العامة (دولة الكويت)**  
> **Al-Rashidi Star General Trading Co. W.L.L. (State of Kuwait)**  
> Production-Ready Bilingual Wholesale & Retail Enterprise Resource Planning (ERP) System

---

## 🌟 Overview

**Al-Rashidi Star ERP** is a modern enterprise management platform engineered specifically for the Kuwait textile, apparel, and wholesale trading market. It provides end-to-end management of sales invoicing, purchase orders, inventory tracking with dual-unit Dozen & Piece conversions, customer credit ledgers, expense tracking, WhatsApp customer sharing, and financial reporting in Kuwaiti Dinar (KWD).

---

## 🚀 Key Features

- **Kuwait Wholesale Arithmetic**: Native support for Dozens & Pieces (1 Dozen = 12 Pieces). Automatic conversion of stock, carton/dozen prices, and piece breakdowns.
- **Bilingual Experience**: Built-in support for English and Hindi/Hinglish interfaces, with automatic Arabic typography for official invoices and customer titles.
- **Sales & 1-Click WhatsApp Invoicing**: Generate professional Kuwait-standard bilingual tax invoices. One-click sharing of formatted WhatsApp text summaries and high-resolution invoice images directly to customer phones.
- **Voucher & Thermal Printing**: Seamless printing for standard A4 commercial invoices and 80mm POS thermal roll receipts.
- **Catalogue Builder**: Interactive wholesale digital catalogue creator with Kuwait skyline branding, product imagery, and downloadable buyer PDF brochures.
- **Customer & Supplier Ledgers**: Real-time balance calculations, credit management, K-Net/cash receipt vouchers, and transaction audit trails.
- **Role-Based Security**: Strict separation of roles between executive Owners and operational Admins with bcrypt password hashing and JWT authentication.
- **Automated Data Protection**: PostgreSQL database with automated hourly snapshots, JSON export utilities, and one-click SQL dumps.
- **Production Compliance**: Integrated Cookie Consent banner, Help & FAQ Center, Terms of Service, and Data Privacy Policy.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS + Lucide Icons
- **State & Data**: TanStack React Query, Zustand, React Hook Form
- **Export Engines**: jsPDF, html2canvas, DOMPurify
- **Deployment**: Netlify (`netlify.toml` included for SPA routing)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: NestJS 12
- **ORM & Database**: TypeORM + PostgreSQL 18
- **Authentication**: Passport JWT + bcrypt password encryption
- **Port**: `3000` (configurable via `.env`)

---

## 📦 Project Structure

```
.
├── backend/                  # NestJS API backend
│   ├── src/
│   │   ├── database/         # Entities & migrations
│   │   └── modules/          # Auth, Sales, Purchases, Stock, Users, WhatsApp, etc.
│   ├── .env.example          # Safe configuration template
│   └── package.json
├── frontend/                 # React Vite frontend application
│   ├── src/
│   │   ├── components/       # Layout, common UI, modals, vouchers
│   │   ├── context/          # AuthContext, LegalHelpContext
│   │   ├── pages/            # Sales, Purchases, Stock, Ledger, Catalogue, etc.
│   │   └── services/         # Axios API client & endpoints
│   ├── netlify.toml          # Frontend Netlify deployment configuration
│   └── package.json
├── netlify.toml              # Root Netlify monorepo configuration
├── README.md                 # System documentation
└── .gitignore                # Production ignore patterns
```

---

## ⚙️ Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env     # Configure your PostgreSQL credentials
npm install
npm run build
node dist/main.js        # Runs API on http://127.0.0.1:3000/api
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Runs web app on http://localhost:5173
```

### 3. Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

---

## 🌐 Production Deployment (Netlify)

This repository includes pre-configured `netlify.toml` files at both the repository root and the `frontend/` directory.

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects**: `/* -> /index.html 200` (SPA routing supported)

---

## 📄 License & Legal

Proprietary commercial software engineered by **Evolix Studio** for **Al-Rashidi Star General Trading Co. W.L.L.** (State of Kuwait).  
All rights reserved © 2026.
