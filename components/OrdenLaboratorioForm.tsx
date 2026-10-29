import React, { useState, useCallback, useEffect, useRef } from 'react';
import { OrdenLaboratorioFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import DateField from './DateField';
import { generateOrdenLaboratorioPdf } from '../services/pdfGenerator';
import { labTestDetails } from '../data/labTestData';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import { Trash2 } from 'lucide-react';
import { getSharedGeneratorPatient, setSharedGeneratorPatient, subscribeSharedGeneratorPatient, clearSharedGeneratorPatient } from '../services/sharedGeneratorPatient';

// ... existing helpers ...

// Helper to calculate age exclusively in years
const calculateAgeInYears = (birthDateString: string): string => {
  if (!birthDateString) return '';
  try {
    const birthDate = new Date(birthDateString + 'T00:00:00');
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years >= 0 ? `${years} años` : '0 años';
  } catch (e) {
    return '';
  }
};

const getCategoryName = (key: string): string => {
  const cat = key.split('_')[0];
  switch (cat) {
    case 'hematologia': return 'Hematología';
    case 'bioquimica': return 'Bioquímica';
    case 'hormonas': return 'Hormonas';
    case 'orina': return 'Orina';
    case 'deposiciones': return 'Deposiciones';
    case 'inmunologia': return 'Inmunología';
    case 'microbiologia': return 'Microbiología';
    case 'parasitologia': return 'Parasitología';
    case 'epilepsia': return 'Epilepsia / Niveles';
    default: return cat.toUpperCase();
  }
};

const getCategoryBadgeStyle = (category: string): string => {
  switch (category) {
    case 'Hematología': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Bioquímica': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Hormonas': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Orina': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Deposiciones': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Inmunología': return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'Microbiología': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Parasitología': return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Epilepsia / Niveles': return 'bg-violet-50 text-violet-700 border-violet-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// Flatten all exams from labTestDetails for @ autocompletion
const allExamsList = Object.entries(labTestDetails).map(([key, value]) => ({
  key: key as keyof OrdenLaboratorioFormData,
  code: value.code,
  label: value.label,
  group: value.group,
  category: getCategoryName(key),
}));

const initialFormData: OrdenLaboratorioFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  numeroFicha: '',
  procedencia: 'CESFAM San Juan',
  edad: '',
  fechaNacimiento: '',
  fechaExamen: '',

  nroSolicitud: '',
  horaExamen: '',
  sectorPaciente: 'NO INFORMADO',
  nhcPaciente: '',
  prevision: 'DESCONOCIDO',
  direccion: '',
  telefono: '',
  diagnostico: 'CONTROL GENERAL DE SALUD DE RUTINA DE SUBPOBLACIONES DEFINIDAS',
  programaSalud: '--- NO DISPONIBLE ---',
  laboratorioNombre: '--- NO DISPONIBLE ---',
  laboratorioTipo: 'EXTERNO',
  laboratorioDireccion: '--- NO DISPONIBLE ---',
  laboratorioTelefono: '--- NO DISPONIBLE ---',
  prioridadGlobal: 'Normal',
  observacionesGlobales: '',
  customExams: [],
};

interface OrdenLaboratorioFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const OrdenLaboratorioForm: React.FC<OrdenLaboratorioFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<OrdenLaboratorioFormData>('local_OrdenLaboratorioForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  // Sync from shared patient store
  useEffect(() => {
    const shared = getSharedGeneratorPatient();
    setFormData(prev => ({
      ...prev,
      nombrePaciente: prev.nombrePaciente || shared.nombrePaciente || '',
      rutPaciente: prev.rutPaciente || shared.rutPaciente || '',
      direccion: prev.direccion || shared.direccion || '',
      diagnostico: prev.diagnostico || shared.diagnostico || '',
      fechaNacimiento: prev.fechaNacimiento || shared.fechaNacimiento || '',
      edad: prev.edad || shared.edad || '',
    }));

    const unsubscribe = subscribeSharedGeneratorPatient((updated) => {
      setFormData(prev => ({
        ...prev,
        nombrePaciente: updated.nombrePaciente !== undefined ? updated.nombrePaciente : prev.nombrePaciente,
        rutPaciente: updated.rutPaciente !== undefined ? updated.rutPaciente : prev.rutPaciente,
        direccion: updated.direccion !== undefined ? updated.direccion : prev.direccion,
        diagnostico: updated.diagnostico !== undefined ? updated.diagnostico : prev.diagnostico,
        fechaNacimiento: updated.fechaNacimiento !== undefined ? updated.fechaNacimiento : prev.fechaNacimiento,
        edad: updated.edad !== undefined ? updated.edad : prev.edad,
      }));
    });
    return unsubscribe;
  }, []);

  // Input value for adding exam with @ support
  const [examInputValue, setExamInputValue] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedMentionPos, setSelectedMentionPos] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate age in years automatically
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const calculatedAge = calculateAgeInYears(formData.fechaNacimiento);
      if (calculatedAge && calculatedAge !== formData.edad) {
        setFormData(prev => ({ ...prev, edad: calculatedAge }));
        setSharedGeneratorPatient({ edad: calculatedAge });
      }
    }
  }, [formData.fechaNacimiento, formData.edad, setFormData]);

  // Calculate NHC from RUTPaciente
  useEffect(() => {
    if (formData.rutPaciente) {
      const cleanRut = formData.rutPaciente.replace(/[^0-9Kk]/g, '');
      if (cleanRut && cleanRut !== formData.nhcPaciente) {
        setFormData(prev => ({ ...prev, nhcPaciente: cleanRut }));
      }
    }
  }, [formData.rutPaciente, formData.nhcPaciente, setFormData]);

  // Close mention popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMentionQuery(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected Db Exams & Custom Exams lists
  const selectedDbExams = allExamsList.filter(exam => formData[exam.key] === true);
  const selectedCustomExams = formData.customExams || [];
  const totalExamsCount = selectedDbExams.length + selectedCustomExams.length;

  // Add exam by label
  const addExamItem = (itemLabel: string) => {
    let clean = itemLabel.trim();
    if (clean.startsWith('@')) clean = clean.slice(1).trim();
    if (clean.startsWith('-')) clean = clean.slice(1).trim();
    if (!clean) return;

    const itemLower = clean.toLowerCase();
    const matchedDbExam = allExamsList.find(e => e.label.toLowerCase() === itemLower);

    setFormData(prev => {
      const next = { ...prev };
      if (matchedDbExam) {
        next[matchedDbExam.key] = true;
      } else {
        const currentCustom = next.customExams || [];
        if (!currentCustom.some(c => c.toLowerCase() === itemLower)) {
          next.customExams = [...currentCustom, clean];
        }
      }
      return next;
    });

    setExamInputValue('');
    setMentionQuery(null);
  };

  // Remove exam by label
  const removeExamItem = (label: string) => {
    const itemLower = label.toLowerCase();
    setFormData(prev => {
      const next = { ...prev };
      const matchedDbExam = allExamsList.find(e => e.label.toLowerCase() === itemLower);
      if (matchedDbExam) {
        next[matchedDbExam.key] = false;
      }
      if (next.customExams) {
        next.customExams = next.customExams.filter(c => c.toLowerCase() !== itemLower);
      }
      return next;
    });
  };

  const clearExams = () => {
    setFormData(prev => {
      const reset = { ...prev };
      Object.keys(reset).forEach(k => {
        if (
          k !== 'customExams' &&
          (k.startsWith('hematologia_') ||
          k.startsWith('bioquimica_') ||
          k.startsWith('hormonas_') ||
          k.startsWith('orina_') ||
          k.startsWith('deposiciones_') ||
          k.startsWith('inmunologia_') ||
          k.startsWith('microbiologia_') ||
          k.startsWith('parasitologia_') ||
          k.startsWith('epilepsia_'))
        ) {
          reset[k] = false;
        }
      });
      reset.customExams = [];
      return reset;
    });
    setExamInputValue('');
    setMentionQuery(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'nombrePaciente') setSharedGeneratorPatient({ nombrePaciente: value });
    if (name === 'direccion') setSharedGeneratorPatient({ direccion: value });
    if (name === 'diagnostico') setSharedGeneratorPatient({ diagnostico: value });
    if (name === 'fechaNacimiento') setSharedGeneratorPatient({ fechaNacimiento: value });
  }, [setFormData]);

  const handleRutChange = useCallback((name: keyof OrdenLaboratorioFormData, value: string) => {
    const cleanRut = value.replace(/[^0-9Kk]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: value,
      nhcPaciente: cleanRut
    }));
    setSharedGeneratorPatient({ rutPaciente: value });
  }, [setFormData]);

  // Input change handler for exam search / @ autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExamInputValue(val);

    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1) {
      const query = val.slice(lastAt + 1).toLowerCase();
      setMentionQuery(query);
      setSelectedMentionPos(0);
    } else {
      setMentionQuery(null);
    }
  };

  const filteredExams = mentionQuery !== null
    ? allExamsList.filter(exam => {
        const query = mentionQuery.toLowerCase();
        const matchLabel = exam.label.toLowerCase().includes(query);
        const matchCode = exam.code.toLowerCase().includes(query);
        const matchCat = exam.category.toLowerCase().includes(query);
        return matchLabel || matchCode || matchCat;
      }).slice(0, 8)
    : [];

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && filteredExams.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionPos(prev => (prev + 1) % filteredExams.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionPos(prev => (prev - 1 + filteredExams.length) % filteredExams.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        addExamItem(filteredExams[selectedMentionPos].label);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (examInputValue.trim()) {
        addExamItem(examInputValue);
      }
    }
  };

  const handleSubmit = async () => {
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateOrdenLaboratorioPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar la orden de laboratorio PDF.");
    }
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
    clearSharedGeneratorPatient();
    setStatus(FormStatus.Idle);
    setExamInputValue('');
    setMentionQuery(null);
  };

  return (
    <div className="w-full h-full bg-white p-2 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden gap-1.5 text-xs font-sans">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full gap-1.5 overflow-hidden justify-between">
        {/* SECTION 1: DATOS DEL PACIENTE (2 REGLONES) */}
        <section className="bg-[#F8FAFC] rounded-xl shadow-2xs border border-slate-200 p-2.5 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-6">
              <FormField
                label="Nombre Completo"
                id="nombrePaciente"
                name="nombrePaciente"
                value={formData.nombrePaciente}
                onChange={handleChange}
                placeholder="Nombre completo del paciente"
                required
                inputClassName="!py-1.5 !px-2.5 text-xs"
                labelClassName="text-xs font-semibold text-slate-800 mb-1"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <RutInput
                label="RUT Paciente"
                id="rutPaciente"
                name="rutPaciente"
                value={formData.rutPaciente}
                onChange={(value) => handleRutChange('rutPaciente', value)}
                required
                inputClassName="!py-1.5 !px-2.5 text-xs"
                labelClassName="block text-xs font-semibold text-slate-800 mb-1"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <DateField
                label="Fecha Nacimiento"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                inputClassName="!py-1.5 !px-2.5 text-xs"
                labelClassName="text-xs font-semibold text-slate-800 mb-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12 md:col-span-5">
              <FormField
                label="Dirección"
                id="direccion"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleChange}
                placeholder="Ej: Coquimbo"
                inputClassName="!py-1.5 !px-2.5 text-xs"
                labelClassName="text-xs font-semibold text-slate-800 mb-1"
              />
            </div>
            <div className="col-span-12 md:col-span-7">
              <FormField
                label="Diagnóstico"
                id="diagnostico"
                name="diagnostico"
                value={formData.diagnostico}
                onChange={handleChange}
                placeholder="Escriba el diagnóstico..."
                inputClassName="!py-1.5 !px-2.5 text-xs"
                labelClassName="text-xs font-semibold text-slate-800 mb-1"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: SOLICITUD DE EXÁMENES (DEBAJO) */}
        <section className="bg-[#F8FAFC] rounded-xl shadow-2xs border border-slate-200 p-2.5 flex flex-col gap-2 flex-1 min-h-0 relative">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold text-sky-800 flex items-center">
              <span className="bg-sky-100 text-sky-700 w-4.5 h-4.5 rounded-full flex items-center justify-center font-black mr-1.5 text-[11px]">@</span>
              Solicitud de Exámenes ({totalExamsCount})
            </h3>
            {totalExamsCount > 0 && (
              <button
                type="button"
                onClick={clearExams}
                className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Quitar Todos
              </button>
            )}
          </div>

          <div className="flex-1 bg-white border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between min-h-0 relative overflow-hidden" ref={dropdownRef}>
            {/* Exam Chips Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1 min-h-0">
              {totalExamsCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center text-xs italic p-4">
                  <span>No hay exámenes agregados.</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Escriba abajo o utilice @ para buscar en el catálogo.</span>
                </div>
              ) : (
                <>
                  {selectedDbExams.map(exam => (
                    <div
                      key={exam.key}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-sky-50/80 border border-sky-200 text-sky-900 rounded-md text-xs font-semibold shadow-2xs group hover:bg-sky-100 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span>{exam.label}</span>
                        <span className="text-[10px] text-sky-600/70 ml-1.5 font-mono">({exam.code})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExamItem(exam.label)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-400 font-bold transition-colors cursor-pointer shrink-0"
                        title="Eliminar examen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedCustomExams.map((customText, idx) => (
                    <div
                      key={`custom-${idx}`}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-md text-xs font-semibold shadow-2xs group hover:bg-amber-100 transition-colors"
                    >
                      <span className="truncate pr-2">{customText}</span>
                      <button
                        type="button"
                        onClick={() => removeExamItem(customText)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-400 font-bold transition-colors cursor-pointer shrink-0"
                        title="Eliminar examen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Input Field with @ trigger for Adding Exams */}
            <div className="relative shrink-0 pt-2 border-t border-slate-100 mt-1.5">
              <input
                ref={inputRef}
                type="text"
                value={examInputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Escriba @ para catálogo o examen libre + Enter..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-colors"
              />

              {/* Autocomplete Mention Popup */}
              {mentionQuery !== null && filteredExams.length > 0 && (
                <div className="absolute left-0 bottom-10 right-0 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-44 overflow-y-auto">
                  {filteredExams.map((exam, idx) => (
                    <button
                      key={exam.key}
                      type="button"
                      onClick={() => addExamItem(exam.label)}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between text-xs ${
                        idx === selectedMentionPos ? 'bg-sky-100 font-bold text-sky-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800">{exam.label}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">CÓD: {exam.code}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getCategoryBadgeStyle(exam.category)}`}>
                        {exam.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={handleNewDocument}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Limpiar Formulario"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Limpiar Formulario</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === FormStatus.Generating}
            className={`px-4 py-1.5 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white ${
              status === FormStatus.Generating ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {status === FormStatus.Generating ? (
              <>
                <svg className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Emitir Solicitud PDF
              </>
            )}
          </button>
        </div>
        {status === FormStatus.Error && (
          <p role="alert" className="text-red-500 text-center font-semibold text-xs shrink-0">
            Hubo un error al generar el PDF. Por favor, intente de nuevo.
          </p>
        )}
      </form>
    </div>
  );
};

export default OrdenLaboratorioForm;
