import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AuditService } from '../audit/audit.service.js';
import { User } from '../../database/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const cleanUsername = (username || '').trim().toLowerCase();
    const user = await this.usersService.findByUsername(cleanUsername);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (isMatch) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<{
    accessToken: string;
    user: {
      id: number;
      username: string;
      displayName: string;
      role: string;
    };
  }> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Username ya password galat hai.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Yeh account band hai. Kripya dusre owner se sampark karein.');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    await this.auditService.log({
      entityType: 'AUTH',
      entityId: String(user.id),
      action: 'LOGIN',
      performedBy: user.displayName,
      details: { ip: ipAddress || 'localhost' },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async logout(user: User): Promise<{ success: boolean; message: string }> {
    await this.auditService.log({
      entityType: 'AUTH',
      entityId: String(user.id),
      action: 'LOGOUT',
      performedBy: user.displayName,
    });

    return {
      success: true,
      message: 'Aap safaltapoorvak logout ho chuke hain.',
    };
  }
}
