import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from '../../database/entities/audit-event.entity.js';

export interface AuditFilterDto {
  search?: string;
  module?: string;
  action?: string;
  performedBy?: string;
  from?: string;
  to?: string;
  reference?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
  ) {}

  async log(params: {
    entityType: string;
    entityId?: string | null;
    action: string;
    performedBy: string;
    details?: any;
  }): Promise<AuditEvent> {
    const event = new AuditEvent();
    event.entityType = params.entityType;
    event.entityId = params.entityId ?? null;
    event.action = params.action;
    event.performedBy = params.performedBy;
    event.details = params.details ?? null;
    return this.auditRepo.save(event);
  }

  async findAll(filter?: AuditFilterDto): Promise<{ items: AuditEvent[]; total: number }> {
    const limit = filter?.limit ? Math.min(filter.limit, 200) : 50;
    const offset = filter?.offset || 0;

    const qb = this.auditRepo.createQueryBuilder('audit');

    if (filter?.module && filter.module !== 'ALL') {
      qb.andWhere('audit.entityType = :module', { module: filter.module });
    }

    if (filter?.action && filter.action !== 'ALL') {
      qb.andWhere('audit.action = :action', { action: filter.action });
    }

    if (filter?.performedBy && filter.performedBy !== 'ALL') {
      qb.andWhere('audit.performedBy = :performedBy', { performedBy: filter.performedBy });
    }

    if (filter?.from) {
      qb.andWhere('audit.performedAt >= :from', { from: `${filter.from}T00:00:00.000Z` });
    }

    if (filter?.to) {
      qb.andWhere('audit.performedAt <= :to', { to: `${filter.to}T23:59:59.999Z` });
    }

    if (filter?.reference && filter.reference.trim()) {
      const ref = filter.reference.trim();
      qb.andWhere(
        "(audit.entityId = :ref OR audit.details->>'invoiceNumber' = :ref OR audit.details->>'reference' = :ref OR audit.details->>'expenseNumber' = :ref OR audit.details->>'receiptNumber' = :ref OR audit.details->>'purchaseNumber' = :ref OR audit.details->>'articleNumber' = :ref)",
        { ref },
      );
    }

    if (filter?.search && filter.search.trim()) {
      const term = `%${filter.search.trim()}%`;
      qb.andWhere(
        "(audit.entityType ILIKE :term OR audit.action ILIKE :term OR audit.performedBy ILIKE :term OR audit.entityId ILIKE :term OR CAST(audit.details AS TEXT) ILIKE :term)",
        { term },
      );
    }

    qb.orderBy('audit.performedAt', 'DESC').take(limit).skip(offset);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return this.auditRepo.find({
      where: { entityType, entityId },
      order: { performedAt: 'ASC' },
    });
  }

  async findByReference(reference: string): Promise<AuditEvent[]> {
    const ref = reference.trim();
    const term = `%${ref}%`;
    return this.auditRepo
      .createQueryBuilder('audit')
      .where(
        "(audit.entityId = :ref OR audit.details->>'invoiceNumber' = :ref OR audit.details->>'reference' = :ref OR audit.details->>'expenseNumber' = :ref OR audit.details->>'receiptNumber' = :ref OR audit.details->>'purchaseNumber' = :ref OR audit.details->>'articleNumber' = :ref OR CAST(audit.details AS TEXT) ILIKE :term)",
        { ref, term },
      )
      .orderBy('audit.performedAt', 'ASC')
      .getMany();
  }
}
