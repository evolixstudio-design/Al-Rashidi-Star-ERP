import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity.js';
import { Company } from './database/entities/company.entity.js';
import { Setting } from './database/entities/setting.entity.js';
import { AuditEvent } from './database/entities/audit-event.entity.js';
import { Category } from './database/entities/category.entity.js';
import { Product } from './database/entities/product.entity.js';
import { StockLedger } from './database/entities/stock-ledger.entity.js';
import { Supplier } from './database/entities/supplier.entity.js';
import { PurchaseReceipt } from './database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from './database/entities/purchase-line.entity.js';
import { Customer } from './database/entities/customer.entity.js';
import { SalesInvoice } from './database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from './database/entities/sales-invoice-line.entity.js';
import { CustomerReceipt } from './database/entities/customer-receipt.entity.js';
import { Expense } from './database/entities/expense.entity.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { StockModule } from './modules/stock/stock.module.js';
import { SuppliersModule } from './modules/suppliers/suppliers.module.js';
import { PurchasesModule } from './modules/purchases/purchases.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { SalesModule } from './modules/sales/sales.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { ExpensesModule } from './modules/expenses/expenses.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { BackupModule } from './modules/backup/backup.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isSsl =
          configService.get<string>('DB_SSL') === 'true' ||
          Boolean(databaseUrl && (databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=')));

        return {
          type: 'postgres',
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: isSsl ? { rejectUnauthorized: false } : false,
              }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'Qusai5253'),
                database: configService.get<string>('DB_DATABASE', 'rashidi_erp'),
                ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
              }),
          entities: [
            User,
            Company,
            Setting,
            AuditEvent,
            Category,
            Product,
            StockLedger,
            Supplier,
            PurchaseReceipt,
            PurchaseLine,
            Customer,
            SalesInvoice,
            SalesInvoiceLine,
            CustomerReceipt,
            Expense,
          ],
          synchronize: true, // Automatically creates tables on first deploy to Neon
        };
      },
    }),
    AuditModule,
    UsersModule,
    SettingsModule,
    AuthModule,
    ProductsModule,
    StockModule,
    SuppliersModule,
    PurchasesModule,
    CustomersModule,
    SalesModule,
    PaymentsModule,
    ExpensesModule,
    ReportsModule,
    BackupModule,
    DashboardModule,
    WhatsAppModule,
  ],
})
export class AppModule {}
