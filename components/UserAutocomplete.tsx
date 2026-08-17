
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';
import { users } from '../data/userData';

interface UserAutocompleteProps {
  value: string;
  onSelect: (user: User) => void;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const UserAutocomplete: React.FC<UserAutocompleteProps> = ({
  value = '',
  onSelect,
  onChange,
  onClear,
  placeholder,
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query); // Notificar al padre del cambio de texto libre

    if (query.length > 0) {
      const normalizedQuery = normalizeText(query);
      const filtered = users.filter(user =>
        normalizeText(user.fullName).includes(normalizedQuery) ||
        normalizeText(user.username).includes(normalizedQuery)
      );
      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
      setActiveIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onClear();
    }
  }, [onChange, onClear]);

  const handleSelect = useCallback((user: User) => {
    onChange(user.fullName);
    onSelect(user);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, [onChange, onSelect]);

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
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul ref={suggestionsRef} className="absolute border border-slate-300 z-[110] w-full mt-1 bg-white rounded-md shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((user, index) => (
            <li
              key={`${user.username}-${index}`}
              onClick={() => handleSelect(user)}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors flex flex-col ${activeIndex === index ? 'bg-sky-500 text-white' : 'text-slate-800 hover:bg-sky-50 font-sans'}`}
            >
              <span className="font-bold text-sm uppercase">{user.fullName}</span>
              <span className={`text-[10px] uppercase font-black tracking-widest ${activeIndex === index ? 'text-sky-100' : 'text-slate-400'}`}>
                {user.profession.replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserAutocomplete;

