import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // List active owners for quick-selection on login screen
  @Get('public-owners')
  async getPublicOwners() {
    const users = await this.usersService.findAll();
    return users
      .filter((u) => u.role === 'OWNER')
      .map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
      }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
