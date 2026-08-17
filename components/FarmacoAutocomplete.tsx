
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Farmaco } from '../types';
import { arsenalFarmacologicoData } from '../data/farmaciaData';

interface FarmacoAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (farmaco: Farmaco) => void;
  placeholder?: string;
}

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const FarmacoAutocomplete: React.FC<FarmacoAutocompleteProps> = ({
  value,
  onValueChange,
  onSelect,
  placeholder,
}) => {
  const [suggestions, setSuggestions] = useState<Farmaco[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onValueChange(query);

    if (query.length > 1) {
      const normalizedQuery = normalizeText(query);
      const filtered = arsenalFarmacologicoData.filter(farmaco =>
        normalizeText(farmaco.medicamento).includes(normalizedQuery)
      );
      setSuggestions(filtered.slice(0, 10)); // Limit suggestions
      setShowSuggestions(true);
      setActiveIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  }, [onValueChange]);

  const handleSelect = useCallback((farmaco: Farmaco) => {
    onSelect(farmaco);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(suggestions[activeIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  }, [showSuggestions, suggestions, activeIndex, handleSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul ref={suggestionsRef} className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((farmaco, index) => (
            <li
              key={`${farmaco.registroISP}-${farmaco.medicamento}-${index}`}
              onClick={() => handleSelect(farmaco)}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-3 py-2 cursor-pointer text-sm ${activeIndex === index ? 'bg-sky-500 text-white font-sans' : 'text-slate-800 hover:bg-sky-50 font-sans'}`}
            >
              {farmaco.medicamento} <span className="text-xs text-slate-500">({farmaco.dosificacion})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FarmacoAutocomplete;

