import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  prefix?: string;
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  prefix,
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active option into view when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {label && (
        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2 text-xs rounded-md transition-all text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          fullWidth ? 'w-full' : ''
        } ${
          isOpen
            ? 'border-[#143D2B] ring-1 ring-[#143D2B] dark:border-emerald-500 dark:ring-emerald-500'
            : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } ${
          triggerClassName
            ? triggerClassName
            : 'bg-slate-50 dark:bg-slate-800 border px-2.5 py-1.5 text-slate-800 dark:text-slate-200 shadow-2xs'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {prefix && (
            <span className="text-slate-500 dark:text-slate-400 font-normal shrink-0">
              {prefix}
            </span>
          )}
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] text-slate-400 truncate">
              {selectedOption.sublabel}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#143D2B] dark:text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 top-full mt-1.5 z-50 min-w-full w-max max-w-xs sm:max-w-md max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-[#121820] border border-slate-200 dark:border-slate-700/80 shadow-lg py-1 text-xs focus:outline-hidden animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-slate-400 italic text-center">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#143D2B] text-white font-bold hover:bg-[#0F2D1F]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 hover:text-[#143D2B] dark:hover:text-emerald-400 font-normal'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        className={`text-[10px] truncate ${
                          isSelected
                            ? 'text-emerald-200'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
