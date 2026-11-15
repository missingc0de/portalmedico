
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
    'PRAMIPEXOL', 'LITIO', 'METILFENIDATO'
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
    'VERAPAMILO', 'NITROGLICERINA', 'ISOSORBIDA', 'JARDIANCE', 'TRAYENTA', 'NPH',
    'VILDAGLIPTINA', 'EMPAGLIFLOZINA', 'DAPAGLIFLOZINA', 'LINAGLIPTINA', 'TOUJEO', 'APIDRA'
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
  const [isSos, setIsSos] = useState(false);
  const [nphAm, setNphAm] = useState('');
  const [nphPm, setNphPm] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const amInputRef = useRef<HTMLInputElement>(null);
  const nphAmInputRef = useRef<HTMLInputElement>(null);
  const nphPmInputRef = useRef<HTMLInputElement>(null);

  // Determinar si el fármaco es una insulina que usa dosificación AM/PM (NPH, Toujeo, Apidra)
  const isAmPmInsulin = (drug: Farmaco | null) => {
    if (!drug) return false;
    const m = drug.medicamento.toUpperCase();
    return m.includes('INSULINA') || m.includes('NPH') || m.includes('TOUJEO') || m.includes('APIDRA');
  };

  // Filtrar fármacos crónicos (omitir inyectables agudos, ampollas, jabones, etc., permitiendo insulinas crónicas)
  const chronicDrugs = useMemo(() => {
    return arsenalFarmacologicoData.filter(d => {
      const med = d.medicamento.toLowerCase();
      // Permitir insulinas de uso crónico ambulatorio
      if (med.includes('insulina') || med.includes('nph') || med.includes('toujeo') || med.includes('apidra')) {
        return true;
      }
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
    if (selectedDrug) {
      if (isAmPmInsulin(selectedDrug)) {
        nphAmInputRef.current?.focus();
      } else if (amInputRef.current) {
        amInputRef.current.focus();
        amInputRef.current.select(); // Selecciona el texto (el '0') para que sea fácil de sobrescribir
      }
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
    setIsSos(false);
    setNphAm('');
    setNphPm('');
  };

  const confirmAddition = () => {
    if (!selectedDrug) return;

    let drugString = '';

    if (isAmPmInsulin(selectedDrug)) {
      const parts: string[] = [];
      const cleanAm = nphAm.trim().replace(/[^0-9.]/g, '');
      const cleanPm = nphPm.trim().replace(/[^0-9.]/g, '');
      if (cleanAm && cleanAm !== '0') parts.push(`${cleanAm} UI AM`);
      if (cleanPm && cleanPm !== '0') parts.push(`${cleanPm} UI PM`);
      
      const doseText = parts.length > 0 ? ` ${parts.join(' / ')}` : '';
      const medName = selectedDrug.medicamento.toUpperCase().includes('NPH')
        ? 'INSULINA NPH'
        : selectedDrug.medicamento.toUpperCase();
      drugString = `- ${medName}${doseText}.`;
    } else {
      const scheme = isSos ? 'SOS' : `${am}-${pm}-${noche}`;
      let cleanDosage = selectedDrug.dosificacion ? selectedDrug.dosificacion.trim().replace(/\.$/, '') : '';
      // Si la dosificación contiene UI/mL o U.I./mL (ej. insulinas de frasco/lápiz), se omite para evitar redundancia
      if (/ui\/ml/i.test(cleanDosage)) {
        cleanDosage = '';
      }
      const dosageStr = cleanDosage ? `${cleanDosage} ` : '';
      drugString = `- ${selectedDrug.medicamento.toUpperCase()} ${dosageStr}${scheme}.`;
    }
    
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
              const m = line.match(/^(-\s*)([A-ZÁÉÍÓÚÑa-zñáéíóú0-9\s\+\.\/]+?)(?=\s+\d+|\s+SOS|\s*$)/i);
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
            <div className="text-sm font-bold text-slate-800">
              {selectedDrug.medicamento} {isAmPmInsulin(selectedDrug) ? '' : selectedDrug.dosificacion}
            </div>
          </div>
          
          {isAmPmInsulin(selectedDrug) ? (
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex-wrap sm:flex-nowrap justify-center">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-sky-700 uppercase mb-1">Dosis AM</span>
                <div className="flex items-center">
                  <input
                    ref={nphAmInputRef}
                    type="text"
                    value={nphAm}
                    onKeyDown={handleDoseKeyDown}
                    onChange={(e) => setNphAm(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-14 h-10 px-2 rounded-lg text-center font-black outline-none focus:ring-2 focus:ring-sky-400 shadow-sm transition-all bg-sky-600 text-white placeholder-sky-200 text-sm"
                    placeholder="UI"
                  />
                  <span className="ml-1.5 text-xs font-bold text-slate-600">UI</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-indigo-700 uppercase mb-1">Dosis PM</span>
                <div className="flex items-center">
                  <input
                    ref={nphPmInputRef}
                    type="text"
                    value={nphPm}
                    onKeyDown={handleDoseKeyDown}
                    onChange={(e) => setNphPm(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-14 h-10 px-2 rounded-lg text-center font-black outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all bg-indigo-600 text-white placeholder-indigo-200 text-sm"
                    placeholder="UI"
                  />
                  <span className="ml-1.5 text-xs font-bold text-slate-600">UI</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex-wrap sm:flex-nowrap justify-center">
              {[
                { label: 'AM', val: am, set: setAm, ref: amInputRef },
                { label: 'Tarde', val: pm, set: setPm },
                { label: 'Noche', val: noche, set: setNoche }
              ].map((slot) => (
                <div key={slot.label} className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">{slot.label}</span>
                  <input
                    ref={slot.ref}
                    type="text"
                    value={slot.val}
                    disabled={isSos}
                    onKeyDown={handleDoseKeyDown}
                    onChange={(e) => slot.set(e.target.value.replace(/[^0-9.]/g, ''))}
                    className={`w-10 h-10 rounded-lg text-center font-black outline-none focus:ring-2 focus:ring-sky-400 shadow-sm transition-all ${
                      isSos
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-sky-600 text-white'
                    }`}
                    placeholder="0"
                  />
                </div>
              ))}

              <div className="h-8 w-px bg-slate-200 mx-0.5 hidden sm:block" />

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">SOS</span>
                <label 
                  htmlFor="smart-farmaco-sos"
                  className={`h-10 px-3 rounded-lg flex items-center gap-2 cursor-pointer border transition-all shadow-sm select-none ${
                    isSos
                      ? 'bg-amber-500 border-amber-600 text-white font-black ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Marcar para uso SOS"
                >
                  <input
                    id="smart-farmaco-sos"
                    type="checkbox"
                    checked={isSos}
                    onChange={(e) => setIsSos(e.target.checked)}
                    onKeyDown={handleDoseKeyDown}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-black tracking-wider">SOS</span>
                </label>
              </div>
            </div>
          )}

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

