import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Search as SearchIcon, Check } from 'lucide-react';
import { normalizeSearchText } from '../../utils/searchUtils';

interface SupplierOption {
  id: number;
  name: string;
  country: string;
  phone?: string;
  totalPayable?: number | string;
}

interface SupplierComboboxProps {
  suppliers: SupplierOption[];
  value: number | '';
  onChange: (id: number | '') => void;
  disabled?: boolean;
  lang?: 'en' | 'hi';
}

export const SupplierCombobox: React.FC<SupplierComboboxProps> = ({
  suppliers,
  value,
  onChange,
  disabled,
  lang = 'en',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      inputRef.current?.focus();
      setHighlightedIndex(0);
    } else {
      setSearch('');
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filtered = useMemo(() => {
    // Add "no supplier" option at the top
    const noSupplierOption = {
      id: '' as any, // Special case for "no supplier"
      name: lang === 'hi' ? '-- Direct Purchase / Local Market (Bina Supplier) --' : '-- Direct Purchase / Local Market (No Supplier) --',
      country: '',
      phone: '',
    };

    let sorted = [...suppliers];
    
    if (!search.trim()) return [noSupplierOption, ...sorted];
    
    const q = normalizeSearchText(search);
    const matchedSuppliers = sorted.filter(s => 
      normalizeSearchText(s.name).includes(q) ||
      normalizeSearchText(s.country).includes(q) ||
      normalizeSearchText(s.phone).includes(q)
    );
    
    // Always show the no-supplier option if it matches or if search is related
    if (normalizeSearchText(noSupplierOption.name).includes(q) || normalizeSearchText('direct local no supplier bina').includes(q)) {
        return [noSupplierOption, ...matchedSuppliers];
    }
    return matchedSuppliers;
  }, [suppliers, search, lang]);

  const selectedSupplier = value === '' ? null : suppliers.find(s => s.id === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        onChange(filtered[highlightedIndex].id === '' ? '' : Number(filtered[highlightedIndex].id));
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {!isOpen ? (
        <div 
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => { if (!disabled) setIsOpen(true); }}
          className={`w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-bold text-base flex items-center justify-between transition-all ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'}`}
        >
          <div className="truncate flex-1">
            {selectedSupplier ? (
              <div className="flex flex-col text-left">
                <span>{selectedSupplier.name} ({selectedSupplier.country})</span>
              </div>
            ) : (
              <span className="text-slate-600 font-medium">
                {lang === 'hi' ? '-- Direct Purchase / Local Market (Bina Supplier) --' : '-- Direct Purchase / Local Market (No Supplier) --'}
              </span>
            )}
          </div>
          <ChevronDown size={18} className="text-slate-400 shrink-0 ml-2" />
        </div>
      ) : (
        <div className="w-full bg-white border border-slate-300 rounded-xl shadow-lg z-50 overflow-hidden absolute top-0 left-0">
          <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50">
            <SearchIcon size={18} className="text-slate-400 ml-2 mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'hi' ? "Supplier search karein..." : "Search supplier by name, country, or phone..."}
              className="w-full bg-transparent border-none text-base focus:outline-none focus:ring-0 py-1"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No supplier found</div>
            ) : (
              filtered.map((s, idx) => (
                <div
                  key={s.id === '' ? 'none' : s.id}
                  onClick={() => {
                    onChange(s.id === '' ? '' : Number(s.id));
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-2.5 cursor-pointer flex justify-between items-center ${highlightedIndex === idx ? 'bg-emerald-50' : 'hover:bg-slate-50'} ${(s.id === '' ? value === '' : value === s.id) ? 'bg-emerald-50/50' : ''}`}
                >
                  <div>
                    <div className={`font-bold text-sm ${s.id === '' ? 'text-slate-600 italic' : 'text-slate-900'}`}>
                      {s.name} {s.country && <span className="font-normal text-slate-500 ml-1">({s.country})</span>}
                    </div>
                    {s.phone && <div className="text-xs text-slate-500 mt-0.5">{s.phone}</div>}
                  </div>
                  <div className="text-right shrink-0 ml-4 flex items-center justify-end">
                    {(s.id === '' ? value === '' : value === s.id) && <Check size={18} className="text-emerald-600" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
