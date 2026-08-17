import { Trash2, FileText, Check } from 'lucide-react';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { RecetaMedicaFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import { generateCertificadoMedicoPdf } from '../services/pdfGenerator';
import { formatRutChilean } from './RutInput';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import { patientStore } from '../services/patientStore';

const initialFormData: RecetaMedicaFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  direccionPaciente: '',
  edadPaciente: '',
  diagnostico: '',
  rp: '',
  hideLogos: false,
};

interface CertificadoMedicoFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const CertificadoMedicoForm: React.FC<CertificadoMedicoFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<RecetaMedicaFormData>('local_CertificadoMedicoForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Smart Autocomplete State
  const [showSmartMenu, setShowSmartMenu] = useState(false);
  const [smartMenuQuery, setSmartMenuQuery] = useState('');
  const [menuIndex, setMenuIndex] = useState(0);
  const rpRef = useRef<HTMLTextAreaElement>(null);

  const smartOptions = useMemo(() => {
    const options = [
      { trigger: 'constancia', label: '@constancia', desc: 'Certificado de atención con reposo' },
      { trigger: 'antecedentes', label: '@antecedentes', desc: 'Listado de diagnósticos y fármacos del paciente' }
    ];
    if (!smartMenuQuery) return options;
    return options.filter(opt => opt.trigger.startsWith(smartMenuQuery.toLowerCase()));
  }, [smartMenuQuery]);

  useEffect(() => {
    const nombrePaciente = formData?.nombrePaciente || '';
    const rutPaciente = formData?.rutPaciente || '';
    const direccionPaciente = formData?.direccionPaciente || '';
    const diagnostico = formData?.diagnostico || '';
    const rp = formData?.rp || '';
    setIsFormValid(
      nombrePaciente.trim() !== '' &&
      rutPaciente.trim() !== '' &&
      direccionPaciente.trim() !== '' &&
      diagnostico.trim() !== '' &&
      rp.trim() !== ''
    );
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, rutPaciente: value }));
  }, []);

  const handleRpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const selectionStart = e.target.selectionStart;
    
    // Find text before the cursor to check if user is typing a shortcut starting with @
    const textBeforeCursor = text.substring(0, selectionStart);
    const lastWordMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (lastWordMatch) {
      setShowSmartMenu(true);
      setSmartMenuQuery(lastWordMatch[1]);
      setMenuIndex(0);
    } else {
      setShowSmartMenu(false);
    }
    
    setFormData(prev => ({ ...prev, rp: text }));
  };

  const insertTemplate = (templateType: 'constancia' | 'antecedentes') => {
    const text = formData.rp;
    const selectionStart = rpRef.current ? rpRef.current.selectionStart : text.length;
    const textBeforeCursor = text.substring(0, selectionStart);
    const textAfterCursor = text.substring(selectionStart);
    
    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex === -1) return;
    
    const preText = text.substring(0, atIndex);
    let insertedText = '';
    const nombre = formData.nombrePaciente || '[Nombre Paciente]';
    const diag = formData.diagnostico || '[Diagnóstico]';
    
    if (templateType === 'constancia') {
      const todayStr = new Date().toLocaleDateString('es-CL');
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toLocaleDateString('es-CL');
      
      insertedText = `CERTIFICO que el paciente ${nombre} fue atendido en el día de la fecha por un cuadro de ${diag}. Se recomienda reposo desde ${todayStr} hasta ${nextWeekStr}.\n\nSe extiende el presente certificado para presentar ante quien estime conveniente.`;
    } else if (templateType === 'antecedentes') {
      insertedText = `CERTIFICO que el paciente ${nombre} es un usuario del CESFAM San Juan.\n\nCERTIFICO que el paciente cuenta con los siguientes diagnósticos confirmados en ficha clínica:\n- \nCERTIFICO que el paciente cuenta con la siguiente pauta farmacológica:\n- \nSe extiende el presente certificado para presentar ante quien estime conveniente.`;
    }
    
    const newText = preText + insertedText + textAfterCursor;
    setFormData(prev => ({ ...prev, rp: newText }));
    setShowSmartMenu(false);
    
    // Focus back on textarea and position cursor
    setTimeout(() => {
      if (rpRef.current) {
        rpRef.current.focus();
        const newCursorPos = atIndex + insertedText.length;
        rpRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const handleRpKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSmartMenu && smartOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuIndex(prev => (prev + 1) % smartOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuIndex(prev => (prev - 1 + smartOptions.length) % smartOptions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertTemplate(smartOptions[menuIndex].trigger as any);
      } else if (e.key === 'Escape') {
        setShowSmartMenu(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete todos los campos requeridos: Nombre, RUT, Dirección, Diagnóstico y Contenido del certificado.");
      return;
    }
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateCertificadoMedicoPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar el certificado PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData({...initialFormData, hideLogos: false });
    setStatus(FormStatus.Idle);
  };

  return (
    <div className="w-full h-full bg-white p-2 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 overflow-hidden">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full gap-2">
        <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-2.5 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              <FormField label="Nombre completo" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente || ''} onChange={handleChange} placeholder="Ej: Juan Pérez González" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
            <div className="md:col-span-3">
              <RutInput label="RUT" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente || ''} onChange={handleRutChange} placeholder="Ej: 12.345.678-9" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="block text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
            <div className="md:col-span-3">
              <FormField label="Edad" id="edadPaciente" name="edadPaciente" value={formData.edadPaciente || ''} onChange={handleChange} placeholder="Ej: 30 años" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField label="Dirección" id="direccionPaciente" name="direccionPaciente" value={formData.direccionPaciente || ''} onChange={handleChange} placeholder="Ej: Calle Falsa 123, Coquimbo" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            <FormField label="Diagnóstico" id="diagnostico" name="diagnostico" value={formData.diagnostico || ''} onChange={handleChange} placeholder="Ej: Hipertensión Arterial" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
          </div>
        </section>

        <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-2.5 flex flex-col gap-2 flex-1 min-h-0 relative">
          <div className="flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>Contenido del Certificado</span>
              <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">
                Tip: Escribe @ para autocompletar plantillas
              </span>
            </span>
          </div>

          <div className="relative flex-1 min-h-0">
            <textarea
              id="rp"
              name="rp"
              value={formData.rp || ''}
              onChange={handleRpChange}
              onKeyDown={handleRpKeyDown}
              placeholder="Escriba aquí el contenido del certificado..."
              ref={rpRef}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-xs h-full resize-none"
            />

            {/* Smart Autocomplete Dropdown */}
            {showSmartMenu && smartOptions.length > 0 && (
              <div className="absolute left-2 bottom-full mb-1 z-50 w-72 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
                <div className="bg-slate-50 px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plantillas Disponibles</span>
                  <span className="text-[9px] text-slate-400">↑↓ para mover · Enter para insertar</span>
                </div>
                <ul className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {smartOptions.map((opt, idx) => (
                    <li
                      key={opt.trigger}
                      onClick={() => insertTemplate(opt.trigger as any)}
                      className={`p-2.5 cursor-pointer flex flex-col text-left transition-colors ${
                        idx === menuIndex ? 'bg-sky-50 border-l-2 border-sky-500' : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="text-xs font-bold text-sky-700">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">{opt.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <div className="pt-2 border-t border-slate-200 shrink-0">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideLogos"
              name="hideLogos"
              checked={formData.hideLogos || false}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 bg-white cursor-pointer"
            />
            <label htmlFor="hideLogos" className="ml-2 block text-xs font-semibold text-slate-700 cursor-pointer">
              No usar logotipos en encabezado del PDF
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-0.5 shrink-0 mb-2">
          <button
            type="button"
            onClick={handleNewDocument}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            LIMPIAR FORMULARIO
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === FormStatus.Generating || !isFormValid}
            className={`px-3 py-1.5 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              isFormValid ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"
            } ${status === FormStatus.Generating ? "opacity-70 cursor-wait" : ""}`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            {status === FormStatus.Generating ? "GENERANDO..." : "EMITIR CERTIFICADO"}
          </button>
        </div>
        {status === FormStatus.Error && (
          <p role="alert" className="text-red-500 text-center text-xs shrink-0">Hubo un error al generar el PDF. Por favor, intente de nuevo.</p>
        )}
      </form>
    </div>
  );
};

export default CertificadoMedicoForm;
