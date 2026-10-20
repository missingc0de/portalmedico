import { Trash2, FileText } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { RecetaMedicaFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import { generateRecetaMedicaPdf } from '../services/pdfGenerator';
import { formatRutChilean } from './RutInput';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import { getSharedGeneratorPatient, setSharedGeneratorPatient, subscribeSharedGeneratorPatient, clearSharedGeneratorPatient } from '../services/sharedGeneratorPatient';

const initialFormData: RecetaMedicaFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  direccionPaciente: '',
  edadPaciente: '',
  diagnostico: '',
  rp: '',
  hideLogos: false,
};

interface RecetaMedicaFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const RecetaMedicaForm: React.FC<RecetaMedicaFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<RecetaMedicaFormData>('local_RecetaMedicaForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  // Sync from shared patient store
  useEffect(() => {
    const shared = getSharedGeneratorPatient();
    setFormData(prev => ({
      ...prev,
      nombrePaciente: prev.nombrePaciente || shared.nombrePaciente || '',
      rutPaciente: prev.rutPaciente || shared.rutPaciente || '',
      direccionPaciente: prev.direccionPaciente || shared.direccion || '',
      edadPaciente: prev.edadPaciente || shared.edad || '',
      diagnostico: prev.diagnostico || shared.diagnostico || '',
    }));

    const unsubscribe = subscribeSharedGeneratorPatient((updated) => {
      setFormData(prev => ({
        ...prev,
        nombrePaciente: updated.nombrePaciente !== undefined ? updated.nombrePaciente : prev.nombrePaciente,
        rutPaciente: updated.rutPaciente !== undefined ? updated.rutPaciente : prev.rutPaciente,
        direccionPaciente: updated.direccion !== undefined ? updated.direccion : prev.direccionPaciente,
        edadPaciente: updated.edad !== undefined ? updated.edad : prev.edadPaciente,
        diagnostico: updated.diagnostico !== undefined ? updated.diagnostico : prev.diagnostico,
      }));
    });
    return unsubscribe;
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'nombrePaciente') setSharedGeneratorPatient({ nombrePaciente: value });
        if (name === 'direccionPaciente') setSharedGeneratorPatient({ direccion: value });
        if (name === 'edadPaciente') setSharedGeneratorPatient({ edad: value });
        if (name === 'diagnostico') setSharedGeneratorPatient({ diagnostico: value });
    }
  }, [setFormData]);

  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, rutPaciente: value }));
    setSharedGeneratorPatient({ rutPaciente: value });
  }, [setFormData]);

  const handleSubmit = async () => {
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateRecetaMedicaPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar la receta PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData({ ...initialFormData, hideLogos: false });
    clearSharedGeneratorPatient();
    setStatus(FormStatus.Idle);
  };

  return (
    <div className="w-full h-full bg-white p-2 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 overflow-hidden">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full gap-2">
        <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-2.5 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              <FormField label="Nombre completo" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} placeholder="Ej: Juan Pérez González" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
            <div className="md:col-span-3">
              <RutInput label="RUT" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={handleRutChange} placeholder="Ej: 12.345.678-9" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="block text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
            <div className="md:col-span-3">
              <FormField label="Edad" id="edadPaciente" name="edadPaciente" value={formData.edadPaciente} onChange={handleChange} placeholder="Ej: 30 años" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField label="Dirección" id="direccionPaciente" name="direccionPaciente" value={formData.direccionPaciente} onChange={handleChange} placeholder="Ej: Calle Falsa 123, Coquimbo" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
            <FormField label="Diagnóstico" id="diagnostico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} placeholder="Ej: Hipertensión Arterial" inputClassName="!py-1.5 !px-2.5 text-xs" labelClassName="text-xs font-semibold text-slate-800 mb-1.5" />
          </div>
        </section>

        <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-2.5 flex flex-col gap-2 flex-1 min-h-0">
          <FormField
            label="RP (Prescripción)"
            id="rp"
            name="rp"
            value={formData.rp}
            onChange={handleChange}
            placeholder="1. Medicamento A - Dosis - Frecuencia - Duración..."
            isTextArea
            containerClassName="h-full flex flex-col"
            inputClassName="!py-1.5 !px-2.5 text-xs h-full flex-1 resize-none"
            labelClassName="text-xs font-semibold text-slate-800 mb-1.5"
          />
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
            disabled={status === FormStatus.Generating}
            className={`px-3 py-1.5 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white ${
              status === FormStatus.Generating ? "opacity-70 cursor-wait" : ""
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            {status === FormStatus.Generating ? "GENERANDO..." : "EMITIR RECETA"}
          </button>
        </div>
        {status === FormStatus.Error && (
          <p role="alert" className="text-red-500 text-center text-xs shrink-0">Hubo un error al generar el PDF. Por favor, intente de nuevo.</p>
        )}
      </form>
    </div>
  );
};

export default RecetaMedicaForm;
