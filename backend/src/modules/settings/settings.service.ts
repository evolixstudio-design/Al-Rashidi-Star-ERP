import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities/company.entity.js';
import { Setting } from '../../database/entities/setting.entity.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
    private readonly auditService: AuditService,
  ) {}

  async getCompany(): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: {} });
    if (!company) {
      const defaultCompany = this.companyRepo.create({
        nameEn: 'Rashidi Traders',
        nameAr: 'شركة الرشيدي للتجارة',
        address: 'Kuwait City, Kuwait',
        phone: '+965 00000000',
        invoiceTermsEn: 'Goods once sold will not be returned or exchanged without valid reason.',
        invoiceTermsAr: 'البضاعة المباعة لا ترد ولا تستبدل إلا بسبب وجيه.',
      });
      return this.companyRepo.save(defaultCompany);
    }
    return company;
  }

  async updateCompany(data: Partial<Company>, username: string): Promise<Company> {
    const company = await this.getCompany();
    Object.assign(company, data);
    const updated = await this.companyRepo.save(company);

    await this.auditService.log({
      entityType: 'COMPANY',
      entityId: String(updated.id),
      action: 'UPDATE_COMPANY',
      performedBy: username,
      details: data,
    });

    return updated;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.settingRepo.find();
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: any, username: string): Promise<Setting> {
    let setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingRepo.create({ key, value });
    } else {
      setting.value = value;
    }
    const saved = await this.settingRepo.save(setting);

    await this.auditService.log({
      entityType: 'SETTING',
      entityId: key,
      action: 'UPDATE_SETTING',
      performedBy: username,
      details: { key, value },
    });

    return saved;
  }
}
