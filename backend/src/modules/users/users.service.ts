import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../database/entities/user.entity.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedOwners();
  }

  async seedOwners(): Promise<void> {
    const existingOwner1 = await this.userRepo.findOne({ where: { username: 'owner1' } });
    if (!existingOwner1) {
      const hashOwner1 = await bcrypt.hash('Mohammed53', 10);
      const owner1 = this.userRepo.create({
        username: 'owner1',
        passwordHash: hashOwner1,
        displayName: 'Yusuf ali jath wala',
        role: UserRole.OWNER,
        isActive: true,
      });
      await this.userRepo.save(owner1);
    }

    const existingOwner2 = await this.userRepo.findOne({ where: { username: 'owner2' } });
    if (!existingOwner2) {
      const hashOwner2 = await bcrypt.hash('Aliasgar5253', 10);
      const owner2 = this.userRepo.create({
        username: 'owner2',
        passwordHash: hashOwner2,
        displayName: 'Aliasgar jath wala',
        role: UserRole.OWNER,
        isActive: true,
      });
      await this.userRepo.save(owner2);
    }

    const existingEvolix = await this.userRepo.findOne({ where: { username: 'evolixstudio@gmail.com' } });
    if (!existingEvolix) {
      const hashEvolix = await bcrypt.hash('Qusai5253', 10);
      const evolix = this.userRepo.create({
        username: 'evolixstudio@gmail.com',
        passwordHash: hashEvolix,
        displayName: 'Evolix Admin',
        role: UserRole.ADMIN,
        isActive: true,
      });
      await this.userRepo.save(evolix);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const clean = (username || '').trim().toLowerCase();
    return this.userRepo
      .createQueryBuilder('user')
      .where('LOWER(user.username) = :clean', { clean })
      .getOne();
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepo.find({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }
}
