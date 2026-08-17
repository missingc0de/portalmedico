import React, { useState, useCallback, useEffect } from 'react';
import { DerivacionesPscvFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import { generateDerivacionesPscvPdf } from '../services/pdfGenerator';

const initialFormData: Omit<DerivacionesPscvFormData, 'fecha'> = {
  nombrePaciente: '', 
  rutPaciente: '',    
  ingresoCardiovascular: false,
  controlCardiovascular: false,
  ingresoEcicep: false,
  controlNutricionista: false,
  controlEnfermero: false,
  podologo: false,
  evaluacionPieDiabetico: false,
  empaEmpamEfam: false,
  poliChoque: false,
  pedirHoraMorbilidad: false,
  electrocardiograma: false,
  perfilPresionArterial: false,
  observaciones: '',
};

interface DerivacionesPscvFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const getCurrentDateFormatted = () => {
  return new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const DerivacionesPscvForm: React.FC<DerivacionesPscvFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useState<DerivacionesPscvFormData>({
    ...initialFormData,
    fecha: getCurrentDateFormatted(),
  });
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const { nombrePaciente, rutPaciente } = formData;
    const atLeastOneCheckbox = Object.keys(formData).some(key => {
        if (typeof formData[key as keyof DerivacionesPscvFormData] === 'boolean') {
            return formData[key as keyof DerivacionesPscvFormData] as boolean;
        }
        return false;
    });
    const observacionesFilled = formData.observaciones.trim() !== '';
    
    setIsFormValid(
      nombrePaciente.trim() !== '' &&
      rutPaciente.trim() !== '' &&
      (atLeastOneCheckbox || observacionesFilled)
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

  const handleRutChange = useCallback((name: keyof DerivacionesPscvFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);


  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete Nombre y RUT del paciente, y marque al menos una derivación o ingrese observaciones.");
      return;
    }
    if (!loggedInUser) {
        alert("Error: Usuario no autenticado. No se puede generar el documento.");
        return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateDerivacionesPscvPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar el PDF de derivaciones. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData({
        ...initialFormData,
        fecha: getCurrentDateFormatted(),
    });
    setStatus(FormStatus.Idle);
  };

  const checkboxOptionsCol1 = [
    { name: 'ingresoCardiovascular', label: 'Ingreso cardiovascular (médico/a)' },
    { name: 'controlCardiovascular', label: 'Control cardiovascular (médico/a)' },
    { name: 'ingresoEcicep', label: 'Ingreso a ECICEP' },
    { name: 'controlNutricionista', label: 'Control con nutricionista' },
    { name: 'controlEnfermero', label: 'Control con enfermero/a' },
  ];

  const checkboxOptionsCol2 = [
    { name: 'podologo', label: 'Podólogo/a' },
    { name: 'evaluacionPieDiabetico', label: 'Evaluación de pie diabético (enfermero/a)' },
    { name: 'empaEmpamEfam', label: 'EMPA/EMPAM/EFAM' },
    { name: 'poliChoque', label: 'Poli choque' },
    { name: 'pedirHoraMorbilidad', label: 'Pedir hora de morbilidad' },
  ];
  
  const checkboxOptionsCentered = [
    { name: 'electrocardiograma', label: 'Electrocardiograma' },
    { name: 'perfilPresionArterial', label: 'Perfil de presión arterial' },
  ];

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-6 text-center">
        <p className="text-lg font-semibold text-slate-600">CESFAM SAN JUAN</p>
        <h2 className="text-3xl font-bold text-slate-700 mt-1">DERIVACIONES</h2>
        <p className="text-sm text-slate-500 mt-2">Fecha: {formData.fecha}</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Nombre" 
              id="nombrePaciente" 
              name="nombrePaciente" 
              value={formData.nombrePaciente} 
              onChange={handleChange} 
              placeholder="Ej: Juan Pérez González" 
              required 
            />
            <RutInput 
              label="RUT" 
              id="rutPaciente" 
              name="rutPaciente" 
              value={formData.rutPaciente} 
              onChange={(value) => handleRutChange('rutPaciente', value)} 
              placeholder="Ej: 12.345.678-9" 
              required 
            />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="space-y-3">
            {checkboxOptionsCol1.map(cb => (
              <div key={cb.name} className="flex items-center">
                <input type="checkbox" id={cb.name} name={cb.name} checked={formData[cb.name as keyof Omit<DerivacionesPscvFormData, 'fecha' | 'nombrePaciente' | 'rutPaciente' | 'observaciones'>] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                <label htmlFor={cb.name} className="ml-2 text-sm text-slate-700">{cb.label}</label>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {checkboxOptionsCol2.map(cb => (
              <div key={cb.name} className="flex items-center">
                <input type="checkbox" id={cb.name} name={cb.name} checked={formData[cb.name as keyof Omit<DerivacionesPscvFormData, 'fecha' | 'nombrePaciente' | 'rutPaciente' | 'observaciones'>] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                <label htmlFor={cb.name} className="ml-2 text-sm text-slate-700">{cb.label}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
             <div className="space-y-3 md:space-y-0 md:flex md:justify-around">
                {checkboxOptionsCentered.map(cb => (
                <div key={cb.name} className="flex items-center">
                    <input type="checkbox" id={cb.name} name={cb.name} checked={formData[cb.name as keyof Omit<DerivacionesPscvFormData, 'fecha' | 'nombrePaciente' | 'rutPaciente' | 'observaciones'>]as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                    <label htmlFor={cb.name} className="ml-2 text-sm text-slate-700">{cb.label}</label>
                </div>
                ))}
            </div>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <FormField
            label="Observaciones:"
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Ingrese observaciones adicionales aquí..."
            isTextArea
          />
        </div>
        
        <p className="text-xs text-slate-500 mt-1 text-center">Debe completar Nombre y RUT, y seleccionar al menos una derivación o completar el campo de observaciones.</p>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-300">
          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Volver al menú principal"
          >
            Volver al Menú
          </button>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleNewDocument}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Limpiar formulario y empezar nuevo documento"
            >
              Limpiar Formulario
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === FormStatus.Generating || !isFormValid}
              className={`w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400
                ${isFormValid ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                ${status === FormStatus.Generating ? 'opacity-70 cursor-wait' : ''}`}
              aria-label="Emitir hoja de derivaciones en formato PDF"
            >
              {status === FormStatus.Generating ? 'Generando PDF...' : 'Emitir Derivaciones'}
            </button>
          </div>
        </div>
        {status === FormStatus.Error && (
          <p role="alert" className="text-red-500 text-center mt-4">Hubo un error al generar el PDF. Por favor, intente de nuevo.</p>
        )}
      </form>
    </div>
  );
};

export default DerivacionesPscvForm;
