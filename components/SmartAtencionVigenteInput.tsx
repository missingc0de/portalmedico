import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface SmartAtencionOption {
  status: 'NORMAL' | 'ALTERADO' | 'NO VIGENTE';
  description: string;
}

interface SmartAtencionVigenteInputProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  options: SmartAtencionOption[];
  placeholder?: string;
  rows?: number;
}

/**
 * Strips [STATUS] prefix from the stored value, returning only the description.
 * Used when building text for PDF/summary generation.
 */
export const stripStatusBracket = (value: string): string => {
  return value.replace(/^\s*\[(NORMAL|ALTERADO|NO VIGENTE)\]\s*/i, '').trim();
};

/**
 * Extracts the status from a value that may begin with [STATUS].
 */
const extractStatus = (value: string): 'NORMAL' | 'ALTERADO' | 'NO VIGENTE' | null => {
  const m = value.match(/^\s*\[(NORMAL|ALTERADO|NO VIGENTE)\]/i);
  if (!m) return null;
  return m[1].toUpperCase() as 'NORMAL' | 'ALTERADO' | 'NO VIGENTE';
};

const getStatusStyles = (status: 'NORMAL' | 'ALTERADO' | 'NO VIGENTE') => {
  switch (status) {
    case 'NORMAL':
      return {
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-xs',
        dot: 'bg-emerald-500'
      };
    case 'ALTERADO':
      return {
        badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold px-2 py-0.5 rounded-md text-xs',
        dot: 'bg-yellow-500'
      };
    case 'NO VIGENTE':
      return {
        badge: 'bg-orange-100 text-orange-800 border border-orange-300 font-bold px-2 py-0.5 rounded-md text-xs',
        dot: 'bg-orange-500'
      };
  }
};

const SmartAtencionVigenteInput: React.FC<SmartAtencionVigenteInputProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  disabled = false,
  options,
  placeholder,
  rows = 2
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const currentStatus = extractStatus(value);

  useEffect(() => {
    if (!textareaRef.current) return;
    const minH = Math.max(rows * 24, 42);
    if (disabled) {
      // Cuando está deshabilitado (No aplica), mantener altura mínima
      textareaRef.current.style.height = `${minH}px`;
    } else {
      textareaRef.current.style.height = 'auto';
      const targetH = Math.max(textareaRef.current.scrollHeight, minH);
      textareaRef.current.style.height = `${targetH}px`;
    }
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.style.height = textareaRef.current.style.height;
    }
  }, [value, rows, disabled]);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!query) return options;
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return options.filter(opt => {
      const normStatus = opt.status.toLowerCase();
      const normDesc = opt.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normStatus.includes(normalizedQuery) || normDesc.includes(normalizedQuery);
    });
  }, [query, options]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSignIndex !== -1) {
      const potentialQuery = textBeforeCursor.slice(lastAtSignIndex + 1);
      if (!potentialQuery.includes(' ') && !potentialQuery.includes('\n')) {
        setQuery(potentialQuery);
        setShowSuggestions(true);
        setActiveIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    onChange(val);
  };

  const selectOption = (opt: SmartAtencionOption) => {
    const newValue = `[${opt.status}] ${opt.description}`;
    onChange(newValue);
    setShowSuggestions(false);
    setQuery('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectOption(filteredSuggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderHighlightedText = (val: string) => {
    if (!val) return null;
    const match = val.match(/^(\s*\[(NORMAL|ALTERADO|NO VIGENTE)\])(.*)$/i);
    if (match) {
      const fullPrefix = match[1];
      const statusType = match[2].toUpperCase() as 'NORMAL' | 'ALTERADO' | 'NO VIGENTE';
      const rest = match[3];

      let colorClass = 'bg-yellow-200/80 text-transparent rounded px-0.5 inline';
      if (statusType === 'NORMAL') {
        colorClass = 'bg-emerald-200 text-transparent rounded px-0.5 inline';
      } else if (statusType === 'NO VIGENTE') {
        colorClass = 'bg-orange-200 text-transparent rounded px-0.5 inline';
      }

      return (
        <>
          <span className={colorClass}>{fullPrefix}</span>
          <span>{rest}</span>
        </>
      );
    }
    return <span>{val}</span>;
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-[10px] text-sky-600 font-bold ml-1">(Escribe @ para seleccionar estado)</span>
      </label>

      <div className={`w-full bg-white rounded-lg border border-slate-300 shadow-sm transition-all relative overflow-hidden ${disabled ? 'bg-slate-50/60' : 'focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500'}`}>
        {/* Layer de Fondo: Destacador de estado detras del texto */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 px-3.5 py-2 pointer-events-none overflow-hidden font-sans text-sm leading-normal whitespace-pre-wrap break-words select-none z-0 bg-transparent text-transparent"
        >
          {renderHighlightedText(value)}
        </div>

        {/* Textarea con el valor completo */}
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className="relative z-10 w-full px-3.5 py-2 bg-transparent border-0 outline-none focus:ring-0 text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm font-normal resize-none"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
        <div className="absolute z-[100] w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 overflow-hidden animate-fadeIn">
          <div className="bg-sky-50 px-3 py-1.5 border-b border-sky-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">Estado {label}</span>
            <span className="text-[9px] text-sky-600 font-bold uppercase">Usa flechas y Enter</span>
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {filteredSuggestions.map((opt, index) => {
              let badgeStyle = 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold px-2 py-0.5 rounded-md text-xs';
              if (opt.status === 'NORMAL') {
                badgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-xs';
              } else if (opt.status === 'NO VIGENTE') {
                badgeStyle = 'bg-orange-100 text-orange-800 border border-orange-300 font-bold px-2 py-0.5 rounded-md text-xs';
              }
              return (
                <li
                  key={`${opt.status}-${index}`}
                  onClick={() => selectOption(opt)}
                  className={`p-3 cursor-pointer text-xs transition-colors flex flex-col gap-1 ${
                    index === activeIndex ? 'bg-sky-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={badgeStyle}>{opt.status}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] leading-relaxed font-normal">
                    {opt.description}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SmartAtencionVigenteInput;
