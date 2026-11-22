"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  sublabel?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  options: CustomSelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  monospace?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  options,
  placeholder = 'â€” SeÃ§iniz â€”',
  onChange,
  allowClear = false,
  monospace = false,
  size = 'md',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const idx = options.findIndex((o) => o.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      } else if (highlightedIndex >= 0 && options[highlightedIndex]) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-1.5">
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between gap-2.5 rounded-xl border-2 text-left transition-all shadow-sm focus:outline-none ${
            size === 'sm' ? 'px-3 py-2 text-xs sm:text-sm' : 'px-3.5 py-2.5 text-sm'
          } ${
            disabled
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : isOpen
              ? 'bg-white border-brand-purple ring-4 ring-brand-purple/15 text-brand-navy'
              : selectedOption
              ? 'bg-white hover:bg-slate-50 border-brand-navy/30 text-brand-navy'
              : 'bg-slate-50 hover:bg-white border-slate-300 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedOption?.badge && (
              <span className="px-2 py-0.5 rounded-md bg-brand-navy text-brand-orange text-xs font-extrabold shrink-0">
                {selectedOption.badge}
              </span>
            )}
            <span
              className={`truncate font-bold ${
                monospace ? 'font-mono text-sm' : ''
              } ${selectedOption ? 'text-brand-navy' : 'text-slate-500 font-semibold'}`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
              isOpen
                ? 'bg-brand-purple text-white rotate-180'
                : 'bg-slate-100 text-brand-navy'
            }`}
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </span>
        </button>

        {allowClear && selectedOption && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 shrink-0 transition-colors"
            title="SeÃ§imi Temizle"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Custom Dropdown Listbox */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1.5 w-full max-h-64 overflow-y-auto rounded-2xl bg-white border-2 border-brand-navy/20 shadow-xl p-1.5 space-y-1"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-start justify-between gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-navy text-white font-extrabold'
                    : isHighlighted
                    ? 'bg-purple-50 text-brand-navy font-bold'
                    : 'text-slate-800 hover:bg-slate-100 font-semibold'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {opt.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-extrabold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-brand-orange text-brand-navy'
                          : 'bg-slate-200 text-brand-navy'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs sm:text-sm leading-snug break-words ${
                        monospace ? 'font-mono' : ''
                      }`}
                    >
                      {opt.label}
                    </div>
                    {opt.sublabel && (
                      <div
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check
                    className="w-4 h-4 text-brand-orange shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

