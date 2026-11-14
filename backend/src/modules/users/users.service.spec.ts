import { expect, it, vi } from 'vitest';
import { UsersService } from './users.service.js';

it('preserves existing account passwords, names and roles when the server restarts', async () => {
  const existing = { username: 'existing', passwordHash: 'changed-password', displayName: 'Updated name', role: 'OWNER' };
  const repository = { findOne: vi.fn().mockResolvedValue({ ...existing }), save: vi.fn(), create: vi.fn() };
  await new UsersService(repository as any).seedOwners();
  expect(repository.findOne).toHaveBeenCalledTimes(3);
  expect(repository.save).not.toHaveBeenCalled();
});
