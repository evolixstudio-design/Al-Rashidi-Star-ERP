import { afterEach, expect, it, vi } from 'vitest';
import { downloadFile } from '../../frontend/src/utils/downloadFile';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps a download available while the browser starts saving it, then cleans up', () => {
  vi.useFakeTimers();
  const link = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
  const appendChild = vi.fn();
  vi.stubGlobal('document', { createElement: () => link, body: { appendChild } });
  vi.stubGlobal('window', { setTimeout });
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:invoice');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  downloadFile(new Blob(['%PDF-1.4']), 'invoice.pdf');
  expect(link.download).toBe('invoice.pdf');
  expect(link.click).toHaveBeenCalledOnce();
  expect(revoke).not.toHaveBeenCalled();
  vi.advanceTimersByTime(60000);
  expect(link.remove).toHaveBeenCalledOnce();
  expect(revoke).toHaveBeenCalledWith('blob:invoice');
});
