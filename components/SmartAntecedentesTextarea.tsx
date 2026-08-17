
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { antecedentesCronicosData } from '../data/antecedentesData';

interface SmartAntecedentesTextareaProps {
  label: string;
  id: string;
  name?: string;
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
  placeholder?: string;
  customData?: string[];
  customTitle?: string;
  bulletListMode?: boolean;
}

const getConditionHighlightClass = (text: string): string => {
  const textUpper = text.toUpperCase();
  
  // Términos de Salud Mental -> Morado (un poquitito menos intenso)
  const mentalTerms = [
    'DEPRESIÓN', 'DEPRESION', 'ANSIEDAD', 'TRASTORNO', 'ESQUIZOFRENIA', 'BIPOLAR', 
    'DEMENCIA', 'ALZHEIMER', 'EPILEPSIA', 'PARKINSON', 'PSICOSIS', 'CONSUMO', 
    'ALCOHOLISMO', 'ADICCIÓN', 'ADICCION', 'SUICIDIO', 'INSOMNIO', 'STRESS', 
    'ESTRÉS', 'ESTRES', 'AOD', 'SALUD MENTAL'
  ];
  if (mentalTerms.some(term => textUpper.includes(term))) {
    return 'bg-purple-300/80 rounded text-transparent px-0.5 inline';
  }

  // Términos de Riesgo Cardiovascular -> Naranjo
  const cvTerms = [
    'HIPERTENSIÓN', 'HIPERTENSION', 'DIABETES', 'DISLIPIDEMIA', 'CARDIO', 'INFARTO', 
    'CARDIOPATÍA', 'CARDIOPATIA', 'ANGINA', 'ACV', 'CEREBROVASCULAR', 'CARDÍACA', 'CARDIACA', 
    'ARRITMIA', 'FIBRILACIÓN', 'FIBRILACION', 'METABÓLICO', 'METABOLICO', 'OBESIDAD', 
    'PSCV', 'HIPERCOLESTEROL', 'HIPERTRIGLICERID'
  ];
  if (cvTerms.some(term => textUpper.includes(term))) {
    return 'bg-orange-200/85 rounded text-transparent px-0.5 inline';
  }

  // Términos Respiratorios -> Azulado (incluye RINITIS)
  const respTerms = [
    'ASMA', 'EPOC', 'ERA', 'BRONQUI', 'ENFISEMA', 'NEUMO', 'FIBROSIS PULMONAR', 
    'IRA', 'TUBERCULOSIS', 'TBC', 'SILICOSIS', 'SAHOS', 'APNEA', 'RINITIS'
  ];
  if (respTerms.some(term => textUpper.includes(term))) {
    return 'bg-sky-200/85 rounded text-transparent px-0.5 inline';
  }

  // Por defecto -> Amarillo
  return 'bg-yellow-200/85 rounded text-transparent px-0.5 inline';
};

const SmartAntecedentesTextarea: React.FC<SmartAntecedentesTextareaProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  rows = 4,
  placeholder,
  customData,
  customTitle = 'Patologías Crónicas',
  bulletListMode = true,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const minH = rows * 24;
      const targetH = Math.max(textareaRef.current.scrollHeight, minH);
      textareaRef.current.style.height = `${targetH}px`;
      if (backdropRef.current) {
        backdropRef.current.style.height = `${targetH}px`;
      }
    }
  }, [value, rows]);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const dataToSearch = customData || antecedentesCronicosData;
    return dataToSearch.filter(d => 
      d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
    ).slice(0, 8);
  }, [query, customData]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSignIndex !== -1) {
      const potentialQuery = textBeforeCursor.slice(lastAtSignIndex + 1);
      if (!potentialQuery.includes(' ')) {
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

  const selectCondition = (condition: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');
    
    const prefix = value.slice(0, lastAtSignIndex);
    const suffix = value.slice(cursorPosition);
    
    const isFirstEntry = prefix.trim().length === 0;
    let formattedCondition = condition;

    if (bulletListMode) {
      const cleanCond = condition.trim().replace(/\.$/, '').toUpperCase() + ".";
      const newLinePrefix = isFirstEntry ? "" : (prefix.endsWith('\n') ? "" : "\n");
      formattedCondition = newLinePrefix + "- " + cleanCond + "\n";
    } else {
      if (!isFirstEntry) {
        formattedCondition = ", " + condition.charAt(0).toLowerCase() + condition.slice(1);
      }
    }

    const newValue = prefix + formattedCondition + suffix;
    
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
        selectCondition(filteredSuggestions[activeIndex]);
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

  return (
    <div className="w-full relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-[10px] text-sky-600 font-bold ml-1">(Escribe @ para buscar)</span>
      </label>
      
      <div className="relative w-full">
        {/* Layer de Fondo: Marcadores de Colores por Categoria (Sin duplicado de texto) */}
        <div 
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 px-4 py-2.5 bg-white pointer-events-none overflow-hidden font-sans text-sm leading-normal whitespace-pre-wrap break-words rounded-lg select-none z-0 border border-slate-300 shadow-sm"
        >
          {value.split('\n').map((line, lIdx) => {
            if (!line.trim().startsWith('-')) {
              return <div key={lIdx} className="text-transparent min-h-[1.25rem]">{line || ' '}</div>;
            }

            const m = line.match(/^(-\s*)(.+?)(\s*)$/);
            if (m && m[2] && m[2].trim().length > 0) {
              const prefix = m[1];
              const condText = m[2].trim();
              const suffixSpaces = line.slice(prefix.length + condText.length);
              const colorClass = getConditionHighlightClass(condText);

              return (
                <div key={lIdx} className="min-h-[1.25rem]">
                  <span className="text-transparent">{prefix}</span>
                  <span className={colorClass}>
                    {condText}
                  </span>
                  <span className="text-transparent">{suffixSpaces}</span>
                </div>
              );
            }

            return <div key={lIdx} className="text-transparent min-h-[1.25rem]">{line}</div>;
          })}
        </div>

        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          rows={rows}
          className="relative z-10 w-full px-4 py-2.5 bg-transparent border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[100] w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 overflow-hidden animate-fadeIn">
          <div className="bg-sky-50 px-3 py-1.5 border-b border-sky-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">{customTitle}</span>
            <span className="text-[9px] text-sky-600 font-bold uppercase">Enter para añadir</span>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredSuggestions.map((condition, index) => (
              <li
                key={`${condition}-${index}`}
                onClick={() => selectCondition(condition)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-b-0 ${
                  index === activeIndex ? 'bg-sky-500 text-white' : 'text-slate-800 hover:bg-sky-50 font-sans'
                }`}
              >
                <div className="font-medium">{condition}</div>
              </li>
            ))}
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

export default SmartAntecedentesTextarea;

