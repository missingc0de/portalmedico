
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { arsenalFarmacologicoData } from '../data/farmaciaData';
import { Farmaco } from '../types';

interface SmartFarmacosTextareaProps {
  label: string;
  id: string;
  name?: string;
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
  placeholder?: string;
}

const getDrugHighlightClass = (drugText: string): string => {
  const textUpper = drugText.toUpperCase();
  
  // Salud Mental -> Morado
  const mentalTerms = [
    'SERTRALINA', 'FLUOXETINA', 'CITALOPRAM', 'PAROXETINA', 'AMITRIPTILINA', 'IMIPRAMINA', 
    'VENLAFAXINA', 'TRAZODONA', 'RISPERIDONA', 'QUETIAPINA', 'HALOPERIDOL', 'CLORPROMAZINA', 
    'CLONAZEPAM', 'DIAZEPAM', 'LORAZEPAM', 'ALPRAZOLAM', 'CLOTIAZEPAM', 'ARIPIPRAZOL', 
    'CARBAMAZEPINA', 'VALPROICO', 'DIVALPROATO', 'FENITOÍNA', 'FENITOINA', 'LAMOTRIGINA', 
    'LEVETIRACETAM', 'MELATONINA', 'TRIHEXIFENIDILO', 'LEVODOPA', 'CARBIDOPA', 'BENSERAZIDA', 
    'PRAMIPEXOL', 'LITIO'
  ];
  if (mentalTerms.some(t => textUpper.includes(t))) {
    return 'bg-purple-300/80 rounded text-transparent px-0.5 inline';
  }

  // Cardiovascular -> Naranjo
  const cvTerms = [
    'LOSARTÁN', 'LOSARTAN', 'ENALAPRIL', 'AMLODIPINO', 'ATENOLOL', 'CARVEDILOL', 
    'HYDROCLOROTIAZIDA', 'HIDROCLOROTIAZIDA', 'FUROSEMIDA', 'GLIBENCLAMIDA', 'METFORMINA', 
    'INSULINA', 'ATORVASTATINA', 'SIMVASTATINA', 'GEMFIBROZILO', 'ASPIRINA', 'ACETILSALICILICO', 
    'ACETILSALICÍLICO', 'CLOPIDOGREL', 'CAPTOPRIL', 'ESPIRONOLACTONA', 'DILTIAZEM', 
    'VERAPAMILO', 'NITROGLICERINA', 'ISOSORBIDA', 'JARDIANCE', 'TRAYENTA', 'NPH'
  ];
  if (cvTerms.some(t => textUpper.includes(t))) {
    return 'bg-orange-200/85 rounded text-transparent px-0.5 inline';
  }

  // Inhaladores y Antialérgicos -> Azulado
  const respTerms = [
    'SALBUTAMOL', 'BUDESONIDA', 'FLUTICASONA', 'SALMETEROL', 'IPRATROPIO', 'TIOTROPIO', 
    'RACEEPINEFRINA', 'DESLORATADINA', 'LORATADINA', 'LEVOCETIRIZINA', 'CETIRIZINA', 
    'RUPATADINA', 'CLORFENAMINA', 'MONTELUKAST', 'MOMETASONA', 'INTRANASAL', 'AEROSOL', 'INHALA'
  ];
  if (respTerms.some(t => textUpper.includes(t))) {
    return 'bg-sky-200/85 rounded text-transparent px-0.5 inline';
  }

  // Por defecto -> Amarillo
  return 'bg-yellow-200/85 rounded text-transparent px-0.5 inline';
};

const SmartFarmacosTextarea: React.FC<SmartFarmacosTextareaProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  rows = 4,
  placeholder,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDrug, setSelectedDrug] = useState<Farmaco | null>(null);
  
  // Estados para la franja horaria
  const [am, setAm] = useState('0');
  const [pm, setPm] = useState('0');
  const [noche, setNoche] = useState('0');

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const amInputRef = useRef<HTMLInputElement>(null);

  // Filtrar fármacos crónicos (omitir inyectables, ampollas, jabones, etc.)
  const chronicDrugs = useMemo(() => {
    return arsenalFarmacologicoData.filter(d => {
      const form = d.formaFarmaceutica.toLowerCase();
      return !form.includes('inyectable') && 
             !form.includes('ampolla') && 
             !form.includes('jabón') && 
             !form.includes('liofilizado') &&
             !form.includes('vial');
    });
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return chronicDrugs.filter(d => 
      d.medicamento.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
    ).slice(0, 8);
  }, [query, chronicDrugs]);

  // Efecto para enfocar automáticamente el input AM cuando se selecciona un fármaco
  useEffect(() => {
    if (selectedDrug && amInputRef.current) {
      amInputRef.current.focus();
      amInputRef.current.select(); // Selecciona el texto (el '0') para que sea fácil de sobrescribir
    }
  }, [selectedDrug]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSignIndex !== -1) {
      const potentialQuery = textBeforeCursor.slice(lastAtSignIndex + 1);
      // Solo activar si no hay espacios después del @
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

  const selectDrug = (drug: Farmaco) => {
    setSelectedDrug(drug);
    setShowSuggestions(false);
    setQuery('');
    // Resetear franja
    setAm('0');
    setPm('0');
    setNoche('0');
  };

  const confirmAddition = () => {
    if (!selectedDrug) return;

    const scheme = `${am}-${pm}-${noche}`;
    // Agregar prefijo "- " y asegurar formato
    const drugString = `- ${selectedDrug.medicamento.toUpperCase()} ${selectedDrug.dosificacion} ${scheme}.`;
    
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');
    
    // Mejorar lógica de saltos de línea antes y después
    const prefix = value.slice(0, lastAtSignIndex);
    const suffix = value.slice(cursorPosition);
    
    let newValue = prefix + drugString;
    
    // Asegurar que termine en salto de línea
    newValue = newValue.trim() + '\n' + suffix.trim();

    onChange(newValue.trim() + '\n');
    setSelectedDrug(null);
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
        selectDrug(filteredSuggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Permitir confirmar con Enter en los campos de dosis
  const handleDoseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmAddition();
    }
  };

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

  return (
    <div className="w-full relative" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-[10px] text-sky-600 font-bold ml-1">(Escribe @ para buscar)</span>
      </label>
      
      <div className="relative w-full">
        {/* Layer de Fondo: Marcador Azul Tenue detras del texto (Sin texto visible para evitar duplicados) */}
        <div 
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 px-4 py-2.5 bg-white pointer-events-none overflow-hidden font-sans text-sm leading-normal whitespace-pre-wrap break-words rounded-lg select-none z-0 border border-slate-300 shadow-sm"
        >
          {value.split('\n').map((line, lIdx) => {
            if (!line.trim().startsWith('-')) {
              return <div key={lIdx} className="text-transparent min-h-[1.25rem]">{line || ' '}</div>;
            }

            // Buscar el nombre del fármaco en la línea
            const lineUpper = line.toUpperCase();
            let matchedName = '';
            for (const drug of chronicDrugs) {
              const dUpper = drug.medicamento.toUpperCase();
              if (lineUpper.includes(dUpper) && dUpper.length > matchedName.length) {
                matchedName = dUpper;
              }
            }

            if (!matchedName) {
              const m = line.match(/^(-\s*)([A-ZÁÉÍÓÚÑa-zñáéíóú0-9\s\+\.\/]+?)(?=\s+\d+|\s*$)/);
              if (m && m[2] && m[2].trim().length > 2) {
                matchedName = m[2];
              }
            }

            if (matchedName) {
              matchedName = matchedName.trim();
              const idx = lineUpper.indexOf(matchedName);
              if (idx !== -1) {
                const before = line.slice(0, idx);
                const target = line.slice(idx, idx + matchedName.length);
                const after = line.slice(idx + matchedName.length);
                const colorClass = getDrugHighlightClass(target);
                return (
                  <div key={lIdx} className="min-h-[1.25rem]">
                    <span className="text-transparent">{before}</span>
                    <span className={colorClass}>
                      {target}
                    </span>
                    <span className="text-transparent">{after}</span>
                  </div>
                );
              }
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

      {/* Menú de sugerencias */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 overflow-hidden animate-fadeIn">
          <div className="bg-sky-50 px-3 py-1.5 border-b border-sky-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">Sugerencias APS</span>
            <span className="text-[9px] text-sky-600 font-bold">Usa flechas y Enter</span>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredSuggestions.map((drug, index) => (
              <li
                key={`${drug.medicamento}-${index}`}
                onClick={() => selectDrug(drug)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-b-0 ${
                  index === activeIndex ? 'bg-sky-500 text-white' : 'text-slate-800 hover:bg-sky-50 font-sans'
                }`}
              >
                <div className="font-bold">{drug.medicamento}</div>
                <div className={`text-[10px] ${index === activeIndex ? 'text-sky-100' : 'text-slate-400'}`}>
                  {drug.dosificacion} • {drug.formaFarmaceutica}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interfaz de Esquema Horario */}
      {selectedDrug && (
        <div className="mt-3 p-4 bg-sky-50 border-2 border-sky-200 rounded-xl shadow-inner animate-fadeIn flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-grow">
            <div className="text-[10px] font-black text-sky-800 uppercase mb-1 tracking-widest">Añadiendo Dosis:</div>
            <div className="text-sm font-bold text-slate-800">{selectedDrug.medicamento} {selectedDrug.dosificacion}</div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
            {[
              { label: 'AM', val: am, set: setAm, ref: amInputRef },
              { label: 'Tarde', val: pm, set: setPm },
              { label: 'Noche', val: noche, set: setNoche }
            ].map((slot, idx) => (
              <div key={slot.label} className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{slot.label}</span>
                <input
                  ref={slot.ref}
                  type="text"
                  value={slot.val}
                  onKeyDown={handleDoseKeyDown}
                  onChange={(e) => slot.set(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-10 h-10 bg-sky-600 text-white rounded-lg text-center font-black outline-none focus:ring-2 focus:ring-sky-400 shadow-sm transition-all"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDrug(null)}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAddition}
              className="px-5 py-2 bg-sky-600 text-white text-xs font-black rounded-lg shadow-md hover:bg-sky-700 transition-transform active:scale-95 uppercase tracking-widest"
            >
              Agregar
            </button>
          </div>
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

export default SmartFarmacosTextarea;

