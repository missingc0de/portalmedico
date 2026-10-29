import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, Profession } from '../types';
import { users } from '../data/userData';

interface SmartDuplaProfesionalProps {
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
}

const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const getProfessionLabel = (user: User): string => {
  const prof = user.profession;
  const sig = user.electronicSignature || '';

  if (prof === 'medicina') {
    return 'MÉDICO';
  } else if (prof === 'enfermeria') {
    return sig.toUpperCase().includes('ENFERMERO') ? 'ENFERMERO' : 'ENFERMERA';
  } else if (prof === 'nutricion') {
    return 'NUTRICIONISTA';
  } else if (prof === 'psicologia') {
    return sig.toUpperCase().includes('PSICÓLOGO') || sig.toUpperCase().includes('PSICOLOGO') ? 'PSICÓLOGO' : 'PSICÓLOGA';
  } else if (prof === 'kinesiologo') {
    return sig.toUpperCase().includes('KINESIÓLOGA') || sig.toUpperCase().includes('KINESIOLOGA') ? 'KINESIÓLOGA' : 'KINESIÓLOGO';
  } else if ((prof as string) === 'matrona' || prof === 'matroneria') {
    return sig.toUpperCase().includes('MATRÓN') || sig.toUpperCase().includes('MATRON') ? 'MATRÓN' : 'MATRONA';
  } else if (prof === 'tens') {
    return 'TENS';
  } else if ((prof as string) === 'trabajadorsocial' || prof === 'asistente_social') {
    return 'ASISTENTE SOCIAL';
  } else if ((prof as string) === 'quimicofarmaceutico' || prof === 'quimico_farmaceutico') {
    return 'QUÍMICO FARMACÉUTICO';
  }
  return prof ? prof.toUpperCase() : 'PROFESIONAL';
};

export const SmartDuplaProfesional: React.FC<SmartDuplaProfesionalProps> = ({
  value = '',
  onChange,
  rows = 3,
  placeholder = "Escribe @ para citar un profesional (ej: @Carolina Madariaga)...",
  label = "Dupla Profesional / Profesionales Participantes",
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Lista de profesionales disponibles
  const professionalList = useMemo(() => {
    return users.map(u => ({
      user: u,
      fullNameUpper: u.fullName.toUpperCase(),
      professionTitle: getProfessionLabel(u),
      displayText: `${u.fullName.toUpperCase()} (${getProfessionLabel(u)})`
    }));
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!query) {
      return professionalList.slice(0, 20);
    }
    const norm = normalizeText(query);
    return professionalList.filter(p =>
      normalizeText(p.user.fullName).includes(norm) ||
      normalizeText(p.user.username).includes(norm) ||
      normalizeText(p.professionTitle).includes(norm)
    ).slice(0, 20);
  }, [query, professionalList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSignIndex !== -1) {
      const potentialQuery = textBeforeCursor.slice(lastAtSignIndex + 1);
      // Activar si no hay saltos de línea ni espacios largos
      if (!potentialQuery.includes('\n') && !potentialQuery.includes('  ')) {
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

  const selectProfessional = (profItem: { fullNameUpper: string; professionTitle: string }) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtSignIndex = textBeforeCursor.lastIndexOf('@');

    const prefix = value.slice(0, lastAtSignIndex);
    const suffix = value.slice(cursorPosition);

    // Formato exacto requerido: - NOMBRE (PROFESIÓN).
    const formattedItem = `- ${profItem.fullNameUpper} (${profItem.professionTitle}).`;

    // Si el prefix ya tiene texto y no termina en salto de línea, agregar salto
    let newPrefix = prefix;
    if (newPrefix.length > 0 && !newPrefix.endsWith('\n')) {
      // Si la línea actual no tiene el guión inicial, o si estaba a mitad de texto
      const lastLineBreak = newPrefix.lastIndexOf('\n');
      const currentLine = lastLineBreak === -1 ? newPrefix : newPrefix.slice(lastLineBreak + 1);
      if (currentLine.trim() === '') {
        // Estaba vacío o solo espacios
        newPrefix = newPrefix.trimEnd() + (newPrefix.includes('\n') ? '\n' : '');
      } else {
        newPrefix = newPrefix + '\n';
      }
    }

    // Salto de línea después para completar el siguiente profesional
    let newSuffix = suffix;
    if (newSuffix.startsWith(' ')) {
      newSuffix = newSuffix.trimStart();
    }
    if (!newSuffix.startsWith('\n')) {
      newSuffix = '\n' + newSuffix;
    }

    const nextValue = newPrefix + formattedItem + newSuffix;
    onChange(nextValue);
    setShowSuggestions(false);
    setQuery('');

    setTimeout(() => {
      if (textareaRef.current) {
        const nextCursor = (newPrefix + formattedItem + '\n').length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextCursor, nextCursor);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectProfessional(filteredSuggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const activeEl = suggestionsRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, showSuggestions]);

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor="smart-dupla-textarea" className="block text-sm font-semibold text-slate-700">
          {label} <span className="text-[11px] font-bold text-sky-600 ml-1.5">(Escribe @ para citar al profesional)</span>
        </label>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id="smart-dupla-textarea"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 text-sm font-sans leading-relaxed resize-y custom-scrollbar"
        />

        {showSuggestions && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fadeIn">
            <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
              <span>Profesionales disponibles (@)</span>
              <span className="lowercase font-normal">↑↓ navegar · Enter seleccionar</span>
            </div>
            <ul ref={suggestionsRef} className="overflow-y-auto max-h-52 divide-y divide-slate-100">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item, idx) => (
                  <li
                    key={item.user.username + idx}
                    onClick={() => selectProfessional(item)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      idx === activeIndex ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-black">
                        @
                      </span>
                      <span className="font-semibold">{item.fullNameUpper}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.professionTitle}
                    </span>
                  </li>
                ))
              ) : (
                <li className="p-3 text-xs text-slate-400 text-center italic">
                  No se encontraron profesionales que coincidan.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDuplaProfesional;
