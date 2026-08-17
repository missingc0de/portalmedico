import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View } from '../types';
import { cie10Data } from '../data/cie10data';
import { availableProtocolsData } from '../data/protocolosData';
import { siteToolsData } from '../data/siteToolsData';

type SearchType = 'cie10' | 'ges' | 'protocolos' | 'herramientas';

interface ResultItem {
  key: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  data: any;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve the "Cannot find namespace 'JSX'" error.
const searchTypeConfig: Record<SearchType, { label: string; icon: React.ReactElement; }> = {
  cie10: {
    label: 'CIE-10',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
  },
  ges: {
    label: 'GES',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 0012 21.055a12 12 0 008.618-4.991 11.955 11.955 0 01-2.28 3.04z" /></svg>,
  },
  protocolos: {
    label: 'Protocolos',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  herramientas: {
    label: 'Herramientas',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
};

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const GlobalSearchBar: React.FC<{ navigateTo: (view: View) => void }> = ({ navigateTo }) => {
  const [searchType, setSearchType] = useState<SearchType>('cie10');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    
    let searchResults: ResultItem[] = [];
    const normalizedSearch = normalizeText(searchTerm);

    switch(searchType) {
      case 'cie10':
        searchResults = cie10Data
          .filter(item => normalizeText(item.description).includes(normalizedSearch) || normalizeText(item.code).toLowerCase().startsWith(normalizedSearch))
          .slice(0, 10)
          .map(item => ({ key: item.code, type: 'cie10', title: item.description, subtitle: item.code, data: item }));
        break;
      case 'protocolos':
        searchResults = availableProtocolsData
          .filter(p => normalizeText(p.title).includes(normalizedSearch) || p.keywords.some(k => normalizeText(k).includes(normalizedSearch)))
          .slice(0, 7)
          .map(p => ({ key: p.id, type: 'protocolos', title: p.title, data: p }));
        break;
      case 'herramientas':
        searchResults = siteToolsData
          .filter(t => normalizeText(t.name).includes(normalizedSearch) || t.keywords.some(k => normalizeText(k).includes(normalizedSearch)))
          .slice(0, 7)
          .map(t => ({ key: t.view, type: 'herramientas', title: t.name, subtitle: t.description, data: t }));
        break;
      case 'ges':
      default:
        searchResults = [];
        break;
    }
    setResults(searchResults);
  }, [searchTerm, searchType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectType = (type: SearchType) => {
    setSearchType(type);
    setIsDropdownOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const handleResultClick = (item: ResultItem) => {
    if (item.type === 'protocolos' || item.type === 'herramientas') {
      navigateTo(item.data.view || item.data.id);
    } else if (item.type === 'cie10') {
      navigator.clipboard.writeText(`${item.data.code} - ${item.data.title}`)
        .then(() => alert(`'${item.data.code} - ${item.data.title}' copiado al portapapeles.`));
    }
    setSearchTerm('');
    setResults([]);
  };

  return (
    <div className="w-full" ref={searchContainerRef}>
      <div className="relative flex items-center w-full">
        <div ref={dropdownRef} className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex-shrink-0 z-10 inline-flex items-center justify-between py-2.5 px-4 w-40 text-sm font-medium text-center text-slate-900 bg-slate-100 border border-slate-300 rounded-l-lg hover:bg-slate-200 focus:ring-2 focus:outline-none focus:ring-sky-500" type="button">
            <div className="flex items-center">
              {searchTypeConfig[searchType].icon}
              <span className="ml-2">{searchTypeConfig[searchType].label}</span>
            </div>
            <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/></svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-20 mt-1 bg-white divide-y divide-slate-100 rounded-lg shadow w-40">
              <ul className="py-2 text-sm text-slate-700">
                {Object.entries(searchTypeConfig).map(([key, config]) => (
                  <li key={key}>
                    <button type="button" onClick={() => handleSelectType(key as SearchType)} className="inline-flex w-full px-4 py-2 hover:bg-slate-100">
                      <div className="inline-flex items-center">{config.icon}<span className="ml-2">{config.label}</span></div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="relative w-full">
          <input 
            type="search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block p-2.5 w-full z-20 text-sm text-slate-900 bg-slate-50 rounded-r-lg border-l-slate-100 border-l-2 border border-slate-300 focus:ring-sky-500 focus:border-sky-500" 
            placeholder={`Buscar ${searchTypeConfig[searchType].label}...`}
            aria-label="Campo de búsqueda" 
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="relative w-full mx-auto">
          <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-80 overflow-y-auto custom-scrollbar">
            {results.map(item => (
              <li key={item.key}>
                <button onClick={() => handleResultClick(item)} className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-b-0">
                  <p className="font-semibold text-sky-700 text-sm">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchTerm.length >= 2 && results.length === 0 && (
         <div className="relative w-full mx-auto">
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 text-center">
              <p className="text-sm text-slate-500">
                {searchType === 'ges' ? 'La búsqueda GES no está implementada aún.' : `No se encontraron resultados para "${searchTerm}".`}
              </p>
            </div>
         </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;

