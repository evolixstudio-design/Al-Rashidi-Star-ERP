import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const username = (user?.username || '').toLowerCase();
    const role = user?.role || '';

    if (username === 'evolixstudio@gmail.com' || role === 'ADMIN') {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. Database backup and recovery operations are strictly restricted to the system administrator (Evolixstudio@gmail.com).'
    );
  }
}
