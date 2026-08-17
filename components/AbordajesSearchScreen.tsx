import React, { useState, useMemo, useCallback } from 'react';
import { availableProtocolsData } from '../data/protocolosData'; // Import from centralized data file
import { Protocol } from '../data/protocolosData'; // Import the type as well

interface AbordajesSearchScreenProps {
  onBackToMenu: () => void; 
}

const AbordajesSearchScreen: React.FC<AbordajesSearchScreenProps> = ({ onBackToMenu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizeText = (text: string): string => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredProtocols = useMemo(() => {
    if (searchTerm.length < 2) {
      return [];
    }
    const normalizedSearch = normalizeText(searchTerm);
    return availableProtocolsData.filter(protocol =>
      normalizeText(protocol.title).includes(normalizedSearch) ||
      protocol.keywords.some(keyword => normalizeText(keyword).includes(normalizedSearch))
    ).sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setSearchTerm(''); 
    setShowSuggestions(false);
  };

  const handleBackToSearch = () => {
    setSelectedProtocol(null);
    setSearchTerm(''); 
  };
  
  const handleInputFocus = () => {
    if (searchTerm.length >= 2 && filteredProtocols.length > 0) {
        setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
        setShowSuggestions(false);
    }, 150);
  };


  if (selectedProtocol) {
    const ProtocolComponent = selectedProtocol.component;
    return (
      <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 flex flex-col min-h-[70vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700">{selectedProtocol.title}</h2>
          <button
            onClick={handleBackToSearch}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Volver a la búsqueda de protocolos"
          >
            &lt; Volver a la Búsqueda
          </button>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <ProtocolComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-sky-700 mb-8 text-center">
        Buscador de Abordajes Clínicos
      </h2>
      <div className="relative w-full max-w-2xl">
        <div className="relative">
            <input
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Buscar protocolo (ej: Diabetes, HTA, ITU...)"
            className="w-full px-6 py-4 text-lg text-slate-700 bg-white border-2 border-sky-500 rounded-full shadow-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-600 outline-none transition-all placeholder-slate-400"
            aria-label="Buscar protocolos clínicos"
            aria-haspopup="listbox"
            aria-expanded={showSuggestions && filteredProtocols.length > 0}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>

        {showSuggestions && filteredProtocols.length > 0 && (
          <ul 
            className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-xl max-h-72 overflow-y-auto custom-scrollbar"
            role="listbox"
            aria-label="Sugerencias de protocolos"
          >
            {filteredProtocols.map(protocol => (
              <li key={protocol.id}>
                <button
                  onClick={() => handleSelectProtocol(protocol)}
                  onMouseDown={(e) => e.preventDefault()} 
                  className="w-full text-left px-5 py-3.5 text-slate-700 hover:bg-sky-100 hover:text-sky-600 transition-colors duration-100 ease-in-out focus:outline-none focus:bg-sky-100"
                  role="option"
                >
                  {protocol.title}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showSuggestions && searchTerm.length >=2 && filteredProtocols.length === 0 && (
            <p className="text-center text-slate-500 mt-4">No se encontraron protocolos para "{searchTerm}".</p>
        )}
      </div>
      <p className="text-slate-500 mt-8 text-sm text-center">
        Ingrese el nombre o palabras clave del protocolo que desea consultar.
      </p>
    </div>
  );
};

export default AbordajesSearchScreen;

