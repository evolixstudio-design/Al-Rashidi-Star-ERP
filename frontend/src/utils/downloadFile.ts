export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  // Keep the URL alive until the browser has started saving the file.
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 60000);
}
