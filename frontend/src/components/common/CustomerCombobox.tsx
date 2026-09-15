import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search as SearchIcon, Check } from 'lucide-react';
import { normalizeSearchText } from '../../utils/searchUtils';
import { useViewportDropdown } from '../../hooks/useViewportDropdown';

interface CustomerOption {
  id: number;
  name: string;
  nameAr?: string;
  phone?: string;
  totalOutstandingKd: number | string;
}

interface CustomerComboboxProps {
  customers: CustomerOption[];
  value: number | '';
  onChange: (id: number | '') => void;
  disabled?: boolean;
}

export const CustomerCombobox: React.FC<CustomerComboboxProps> = ({
  customers,
  value,
  onChange,
  disabled,
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
      // Small delay to allow portal to render
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
    let sorted = [...customers];
    // Outstanding priority: sort > 0 first
    sorted.sort((a, b) => {
      const aOut = Number(a.totalOutstandingKd) > 0 ? 1 : 0;
      const bOut = Number(b.totalOutstandingKd) > 0 ? 1 : 0;
      return bOut - aOut;
    });

    if (!search.trim()) return sorted;
    const q = normalizeSearchText(search);
    return sorted.filter(c => 
      normalizeSearchText(c.name).includes(q) ||
      normalizeSearchText(c.nameAr).includes(q) ||
      normalizeSearchText(c.phone).includes(q)
    );
  }, [customers, search]);

  const selectedCustomer = customers.find(c => c.id === value);

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
        onChange(filtered[highlightedIndex].id);
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
          className={`w-full px-3.5 py-2.5 border rounded-xl text-sm flex items-center justify-between transition-all min-h-touch ${disabled ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : isOpen ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 text-slate-900 cursor-pointer' : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer'}`}
        >
          <div className="truncate flex-1">
            {selectedCustomer ? (
              <div className="flex flex-col">
                <span className="font-semibold">{selectedCustomer.name}</span>
                {selectedCustomer.phone && <span className="text-xs text-slate-500">{selectedCustomer.phone}</span>}
              </div>
            ) : (
              <span className="text-slate-500">-- Choose Customer --</span>
            )}
          </div>
          <ChevronDown size={16} className={`text-slate-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="bg-white border border-slate-300 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ ...style, maxWidth: 'calc(100vw - 32px)' }} // ensure it doesn't overflow screen horizontally
        >
          <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50 shrink-0">
            <SearchIcon size={16} className="text-slate-400 ml-2 mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search customer..."
              className="w-full bg-transparent border-none text-sm focus:outline-none focus:ring-0 py-1"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar touch-scroll flex-1 py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No customer found</div>
            ) : (
              filtered.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-2 cursor-pointer flex justify-between items-center min-h-touch ${highlightedIndex === idx ? 'bg-blue-50' : 'hover:bg-slate-50'} ${value === c.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {c.name} {c.nameAr && <span className="font-arabic font-normal text-slate-500 ml-1">({c.nameAr})</span>}
                    </div>
                    {c.phone && <div className="text-xs text-slate-500 mt-0.5">{c.phone}</div>}
                  </div>
                  <div className="text-right shrink-0 flex items-center justify-end">
                    <div className={`text-xs font-bold ${Number(c.totalOutstandingKd) > 0 ? 'text-amber-700' : 'text-slate-400'} ${value === c.id ? 'mr-2' : ''} whitespace-nowrap`}>
                      KD {Number(c.totalOutstandingKd).toFixed(3)}
                    </div>
                    {value === c.id && <Check size={16} className="text-blue-600 shrink-0" />}
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
