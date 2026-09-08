import React, { useState } from 'react';
import api from '../../services/api';
import { Upload, Download, CheckCircle2, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';

interface ColumnDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number';
}

interface CsvImportModalProps {
  title: string;
  description: string;
  columns: ColumnDef[];
  sampleRows: Record<string, any>[];
  endpoint: string;
  onSuccess: (importedCount: number) => void;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  title,
  description,
  columns,
  sampleRows,
  endpoint,
  onSuccess,
  onClose,
}) => {
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate and download sample CSV template
  const downloadTemplate = () => {
    const header = columns.map((c) => c.key).join(',');
    const sampleLines = sampleRows.map((row) =>
      columns.map((c) => `"${row[c.key] ?? ''}"`).join(','),
    );
    const csvContent = [header, ...sampleLines].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse CSV string into objects
  const parseCsvText = (text: string) => {
    try {
      setError('');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setError('CSV must contain at least a header row and one data row.');
        setParsedRows([]);
        return;
      }

      // Simple CSV header parser
      const headers = lines[0]
        .split(/[,;\t]/)
        .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

      const results: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rawCols = lines[i].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (rawCols.every((c) => c === '')) continue;

        const rowObj: Record<string, any> = {};
        for (const col of columns) {
          const colKeyLower = col.key.toLowerCase();
          const matchIdx = headers.findIndex((h) => h === colKeyLower || h.replace(/[^a-z]/g, '') === colKeyLower);
          if (matchIdx !== -1 && matchIdx < rawCols.length) {
            const rawVal = rawCols[matchIdx];
            if (col.type === 'number') {
              rowObj[col.key] = rawVal === '' ? 0 : Number(rawVal);
            } else {
              rowObj[col.key] = rawVal;
            }
          } else {
            rowObj[col.key] = col.type === 'number' ? 0 : '';
          }
        }
        results.push(rowObj);
      }

      if (results.length === 0) {
        setError('No valid data rows could be extracted.');
      }
      setParsedRows(results);
    } catch (err: any) {
      setError(`Failed to parse CSV: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (parsedRows.length === 0) {
      setError('Please provide at least one row to import.');
      return;
    }

    // Client validation
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      for (const col of columns) {
        if (col.required && (!row[col.key] || String(row[col.key]).trim() === '')) {
          setError(`Row #${i + 1}: Required field "${col.label}" is missing.`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post(endpoint, parsedRows);
      const count = res.data?.importedCount || parsedRows.length;
      onSuccess(count);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit bulk import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{title}</h2>
              <p className="text-xs text-slate-300">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Action Header: Download Template & File Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="font-bold text-slate-800 text-sm">Download Template or Upload File</div>
              <div className="text-slate-500 mt-0.5">
                Download a clean CSV template with the expected column headers.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Sample CSV</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Paste or Text Input Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                parseCsvText(e.target.value);
              }}
              placeholder={`Paste CSV content here with headers:\n${columns.map((c) => c.key).join(',')}`}
              className="w-full p-2.5 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">
                  Ready to Import ({parsedRows.length} Rows)
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid structure</span>
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      {columns.map((col) => (
                        <th key={col.key} className="py-2 px-3 whitespace-nowrap">
                          {col.label} {col.required && <span className="text-rose-600">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                        {columns.map((col) => (
                          <td key={col.key} className="py-1.5 px-3 text-slate-700 max-w-xs truncate">
                            {row[col.key] !== undefined && row[col.key] !== '' ? String(row[col.key]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || parsedRows.length === 0}
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Importing...' : `Confirm & Import ${parsedRows.length} Records`}
          </button>
        </div>
      </div>
    </div>
  );
};
