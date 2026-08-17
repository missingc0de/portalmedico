import React, { useState, useEffect, useRef, useMemo } from 'react';

interface ColegioAutocompleteProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
}

const ColegioAutocomplete: React.FC<ColegioAutocompleteProps> = ({ label, id, name, value, onChange, options }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!value) return options;
    const query = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return options.filter(opt => 
      opt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)
    ).slice(0, 10);
  }, [value, options]);

  const selectOption = (opt: string) => {
    onChange({ target: { name, value: opt } } as React.ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectOption(filteredOptions[activeIndex]);
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
    <div className="flex flex-col w-full relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm leading-normal transition-all duration-150 ease-in-out"
        placeholder="Escriba para buscar..."
        autoComplete="off"
      />
      
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute z-[100] w-full top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
          <ul>
            {filteredOptions.map((opt, index) => (
              <li
                key={opt}
                onClick={() => selectOption(opt)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-b-0 ${
                  index === activeIndex ? 'bg-sky-500 text-white' : 'text-slate-800 hover:bg-sky-50 font-sans'
                }`}
              >
                {opt}
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

export default ColegioAutocomplete;
