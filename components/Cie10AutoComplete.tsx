import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface Cie10Entry {
  code: string;
  description: string;
}

interface Cie10AutoCompleteProps {
  label: string;
  id: string;
  value: string; 
  onChange: (value: string) => void; 
  suggestions: Cie10Entry[];
  placeholder?: string;
  required?: boolean;
}

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const Cie10AutoComplete: React.FC<Cie10AutoCompleteProps> = ({
  label,
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value); 
  const [filteredSuggestions, setFilteredSuggestions] = useState<Cie10Entry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value !== inputValue ) { 
       setInputValue(value);
       if (!value) { 
          setShowSuggestions(false);
          setFilteredSuggestions([]);
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);

    if (query.length > 1) {
      const normalizedQuery = normalizeText(query);
      const filtered = suggestions.filter(
        suggestion =>
          normalizeText(suggestion.code).includes(normalizedQuery) ||
          normalizeText(suggestion.description).includes(normalizedQuery)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [suggestions]);

  const handleSelectSuggestion = useCallback((suggestion: Cie10Entry) => {
    const displayValue = `${suggestion.code} - ${suggestion.description}`;
    setInputValue(displayValue);
    onChange(displayValue); 
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prevIndex =>
          prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prevIndex =>
          prevIndex > 0 ? prevIndex - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < filteredSuggestions.length) {
          handleSelectSuggestion(filteredSuggestions[activeSuggestionIndex]);
        } else if (filteredSuggestions.length > 0) { 
           handleSelectSuggestion(filteredSuggestions[0]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }
  }, [showSuggestions, filteredSuggestions, activeSuggestionIndex, handleSelectSuggestion]);

  useEffect(() => {
    if (activeSuggestionIndex >= 0 && suggestionsRef.current) {
      const activeItem = suggestionsRef.current.children[activeSuggestionIndex] as HTMLLIElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeSuggestionIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        
        const isValidSelection = suggestions.some(s => `${s.code} - ${s.description}` === inputValue);
        if (!isValidSelection && inputValue.trim() !== '') {
            const normalizedInput = normalizeText(inputValue);
            const couldBeValid = suggestions.some(s => 
                normalizeText(s.code).startsWith(normalizedInput) || 
                normalizeText(s.description).includes(normalizedInput)
            );

            if (!couldBeValid) {
                 // Do not clear. Let blur handle final validation.
            }
        }
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputValue, suggestions, onChange]);

  const handleBlur = () => {
    setTimeout(() => {
        if (!showSuggestions) { 
            const isValidSelection = suggestions.some(s => `${s.code} - ${s.description}` === inputValue);
            if (!isValidSelection && inputValue.trim() !== '') {
                // Design choice: leave invalid input for user to correct or parent form to validate
            }
        }
    }, 150);
  };


  return (
    <div className="w-full relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={id}
        name={id}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm"
        autoComplete="off"
        ref={inputRef}
        aria-autocomplete="list"
        aria-expanded={showSuggestions && filteredSuggestions.length > 0}
        aria-controls={`${id}-suggestions`}
        aria-activedescendant={activeSuggestionIndex >=0 ? `${id}-suggestion-${activeSuggestionIndex}` : undefined}
        aria-required={required}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          ref={suggestionsRef}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              id={`${id}-suggestion-${index}`}
              key={`${suggestion.code}-${index}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-4 py-2.5 cursor-pointer text-sm font-sans
                ${index === activeSuggestionIndex ? 'bg-sky-500 text-white' : 'text-slate-800 hover:bg-sky-50 font-sans'}
              `}
              role="option"
              aria-selected={index === activeSuggestionIndex}
            >
              <span className="font-semibold">{suggestion.code}</span> - {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cie10AutoComplete;
