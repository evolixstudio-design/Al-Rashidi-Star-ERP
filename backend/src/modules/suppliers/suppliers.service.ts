import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../database/entities/supplier.entity.js';
import { AuditService } from '../audit/audit.service.js';

export class CreateSupplierDto {
  name!: string;
  contactPerson?: string;
  phone?: string;
  country?: string;
  address?: string;
}

export class UpdateSupplierDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  country?: string;
  address?: string;
  isActive?: boolean;
}

export class BulkImportSupplierDto {
  name!: string;
  contactPerson?: string;
  phone?: string;
  country?: string;
  address?: string;
  openingPayableKd?: number;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const suppliers = await this.supplierRepo
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.purchases', 'purchases')
      .orderBy('supplier.name', 'ASC')
      .getMany();

    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      country: s.country,
      address: s.address,
      totalPayable: Number(s.totalPayable || 0),
      isActive: s.isActive,
      shipmentCount: s.purchases?.length || 0,
      createdAt: s.createdAt,
    }));
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
      relations: { purchases: true },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }
    return {
      ...supplier,
      totalPayable: Number(supplier.totalPayable || 0),
      shipmentCount: supplier.purchases?.length || 0,
    };
  }

  async create(dto: CreateSupplierDto, user: any) {
    const supplier = this.supplierRepo.create({
      name: dto.name.trim(),
      contactPerson: dto.contactPerson?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      country: dto.country?.trim() || 'China',
      address: dto.address?.trim() || undefined,
      totalPayable: 0,
    });

    const saved = await this.supplierRepo.save(supplier);

    await this.auditService.log({
      action: 'CREATE',
      entityType: 'SUPPLIER',
      entityId: String(saved.id),
      performedBy: user?.displayName || 'Owner',
      details: { name: saved.name, country: saved.country },
    });

    return saved;
  }

  async update(id: number, dto: UpdateSupplierDto, user: any) {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }

    if (dto.name !== undefined) supplier.name = dto.name.trim();
    if (dto.contactPerson !== undefined) supplier.contactPerson = dto.contactPerson.trim();
    if (dto.phone !== undefined) supplier.phone = dto.phone.trim();
    if (dto.country !== undefined) supplier.country = dto.country.trim();
    if (dto.address !== undefined) supplier.address = dto.address.trim();
    if (dto.isActive !== undefined) supplier.isActive = dto.isActive;

    await this.supplierRepo.save(supplier);

    await this.auditService.log({
      action: 'UPDATE',
      entityType: 'SUPPLIER',
      entityId: String(supplier.id),
      performedBy: user?.displayName || 'Owner',
      details: { name: supplier.name, changes: dto },
    });

    return supplier;
  }

  async bulkImport(items: BulkImportSupplierDto[], user: any) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Import list cannot be empty.');
    }

    const seenNames = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.name.trim()) {
        throw new BadRequestException(`Row #${i + 1}: Supplier name is required.`);
      }
      const norm = item.name.trim().toLowerCase();
      if (seenNames.has(norm)) {
        throw new BadRequestException(`Duplicate supplier name "${item.name}" found in import list.`);
      }
      seenNames.add(norm);
    }

    const savedSuppliers: Supplier[] = [];
    for (const item of items) {
      const opening = Math.max(0, Number(item.openingPayableKd || 0));
      const supplier = this.supplierRepo.create({
        name: item.name.trim(),
        contactPerson: item.contactPerson?.trim() || undefined,
        phone: item.phone?.trim() || undefined,
        country: item.country?.trim() || 'China',
        address: item.address?.trim() || undefined,
        totalPayable: Number(opening.toFixed(3)),
        isActive: true,
      });

      const saved = await this.supplierRepo.save(supplier);
      savedSuppliers.push(saved);
    }

    await this.auditService.log({
      action: 'BULK_IMPORT',
      entityType: 'SUPPLIER',
      entityId: 'BATCH',
      performedBy: user?.displayName || 'Owner',
      details: {
        count: savedSuppliers.length,
        names: savedSuppliers.map((s) => s.name),
      },
    });

    return {
      success: true,
      importedCount: savedSuppliers.length,
      suppliers: savedSuppliers,
    };
  }
}
