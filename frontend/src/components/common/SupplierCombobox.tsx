import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search as SearchIcon, Check } from 'lucide-react';
import { normalizeSearchText } from '../../utils/searchUtils';
import { useViewportDropdown } from '../../hooks/useViewportDropdown';

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
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isOpen, setIsOpen, style } = useViewportDropdown(containerRef);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setHighlightedIndex(0);
    } else {
      setSearch('');
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setIsOpen]);

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
    <>
      <div className="relative" ref={containerRef}>
        <div 
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
          className={`w-full px-4 py-3 border rounded-xl text-sm font-bold flex items-center justify-between transition-all min-h-touch ${disabled ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : isOpen ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 cursor-pointer' : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'}`}
        >
          <div className="truncate flex-1">
            {selectedSupplier ? (
              <div className="flex flex-col text-left">
                <span>{selectedSupplier.name} {selectedSupplier.country && `(${selectedSupplier.country})`}</span>
              </div>
            ) : (
              <span className="text-slate-600 font-medium">
                {lang === 'hi' ? '-- Direct Purchase / Local Market (Bina Supplier) --' : '-- Direct Purchase / Local Market (No Supplier) --'}
              </span>
            )}
          </div>
          <ChevronDown size={18} className={`text-slate-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="bg-white border border-slate-300 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ ...style, maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50 shrink-0">
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
              placeholder={lang === 'hi' ? "Supplier search karein..." : "Search supplier..."}
              className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 py-1"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar touch-scroll flex-1 py-1">
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
                  className={`px-4 py-2 cursor-pointer flex justify-between items-center min-h-touch ${highlightedIndex === idx ? 'bg-emerald-50' : 'hover:bg-slate-50'} ${(s.id === '' ? value === '' : value === s.id) ? 'bg-emerald-50/50' : ''}`}
                >
                  <div className="min-w-0 pr-4">
                    <div className={`font-bold text-sm truncate ${s.id === '' ? 'text-slate-600 italic' : 'text-slate-900'}`}>
                      {s.name} {s.country && <span className="font-normal text-slate-500 ml-1">({s.country})</span>}
                    </div>
                    {s.phone && <div className="text-xs text-slate-500 mt-0.5">{s.phone}</div>}
                  </div>
                  <div className="text-right shrink-0 flex items-center justify-end">
                    {(s.id === '' ? value === '' : value === s.id) && <Check size={18} className="text-emerald-600 shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
