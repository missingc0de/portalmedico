import React, { useState, useCallback, useEffect } from 'react';
import { CertificadoEscolarFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import { generateCertificadoEscolarPdf } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: CertificadoEscolarFormData = {
  nombrePaciente: '',
  diagnostico: '',
  asistioCentroSalud: false,
  noRequiereReposo: false,
  reposo: false,
  reposoDesde: '',
  reposoHasta: '',
  noEducacionFisica: false,
  noEducacionFisicaDesde: '',
  noEducacionFisicaHasta: '',
  otro: false,
  otroDetalle: '',
  fechaDocumento: new Date().toISOString().split('T')[0], 
};

interface CertificadoEscolarFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const CertificadoEscolarForm: React.FC<CertificadoEscolarFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<CertificadoEscolarFormData>('local_CertificadoEscolarForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const { nombrePaciente, diagnostico, fechaDocumento } = formData;
    let optionsValid = formData.asistioCentroSalud || formData.noRequiereReposo || formData.reposo || formData.noEducacionFisica || formData.otro;
    
    if (formData.reposo && (!formData.reposoDesde || !formData.reposoHasta || new Date(formData.reposoDesde) > new Date(formData.reposoHasta))) {
      optionsValid = false;
    }
    if (formData.noEducacionFisica && (!formData.noEducacionFisicaDesde || !formData.noEducacionFisicaHasta || new Date(formData.noEducacionFisicaDesde) > new Date(formData.noEducacionFisicaHasta))) {
      optionsValid = false;
    }
    if (formData.otro && !formData.otroDetalle.trim()) {
      optionsValid = false;
    }

    setIsFormValid(
      nombrePaciente.trim() !== '' &&
      diagnostico.trim() !== '' &&
      fechaDocumento.trim() !== '' &&
      optionsValid
    );
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        ...(name === 'reposo' && !checked && { reposoDesde: '', reposoHasta: '' }),
        ...(name === 'noEducacionFisica' && !checked && { noEducacionFisicaDesde: '', noEducacionFisicaHasta: '' }),
        ...(name === 'otro' && !checked && { otroDetalle: '' }),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete todos los campos requeridos y asegúrese de que las fechas sean válidas y al menos una opción de certificado esté seleccionada.");
      return;
    }
    if (!loggedInUser) {
        alert("Error: Usuario no autenticado. No se puede generar el certificado.");
        return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateCertificadoEscolarPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar el certificado PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData({...initialFormData, fechaDocumento: new Date().toISOString().split('T')[0]});
    setStatus(FormStatus.Idle);
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Certificado Escolar</h2>
        <p className="text-slate-500 mt-2">Complete los datos para emitir el certificado.</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
          <div className="space-y-6">
            <FormField label="Nombre Completo del Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} placeholder="Ej: Juanito Pérez González" required />
            <FormField label="Diagnóstico" id="diagnostico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} placeholder="Ej: Resfrío común" required />
          </div>
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Certificando que:</h3>
          <div className="space-y-4">
            {[
              { name: 'asistioCentroSalud', label: 'Asistió al Centro de Salud' },
              { name: 'noRequiereReposo', label: 'No requiere reposo' },
            ].map(cb => (
              <div key={cb.name} className="flex items-center">
                <input type="checkbox" id={cb.name} name={cb.name} checked={formData[cb.name as keyof CertificadoEscolarFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                <label htmlFor={cb.name} className="ml-2 text-sm text-slate-700">{cb.label}</label>
              </div>
            ))}

            <div className="flex items-start space-x-2">
              <input type="checkbox" id="reposo" name="reposo" checked={formData.reposo} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-1" />
              <div className="flex-grow">
                <label htmlFor="reposo" className="text-sm text-slate-700">Reposo</label>
                {formData.reposo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pl-2 border-l-2 border-sky-200">
                    <DateField label="Desde" id="reposoDesde" name="reposoDesde" value={formData.reposoDesde} onChange={handleChange} required={formData.reposo} max={formData.reposoHasta} />
                    <DateField label="Hasta" id="reposoHasta" name="reposoHasta" value={formData.reposoHasta} onChange={handleChange} required={formData.reposo} min={formData.reposoDesde} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" id="noEducacionFisica" name="noEducacionFisica" checked={formData.noEducacionFisica} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-1" />
              <div className="flex-grow">
                <label htmlFor="noEducacionFisica" className="text-sm text-slate-700">No realizar Educación Física</label>
                {formData.noEducacionFisica && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pl-2 border-l-2 border-sky-200">
                    <DateField label="Desde" id="noEducacionFisicaDesde" name="noEducacionFisicaDesde" value={formData.noEducacionFisicaDesde} onChange={handleChange} required={formData.noEducacionFisica} max={formData.noEducacionFisicaHasta} />
                    <DateField label="Hasta" id="noEducacionFisicaHasta" name="noEducacionFisicaHasta" value={formData.noEducacionFisicaHasta} onChange={handleChange} required={formData.noEducacionFisica} min={formData.noEducacionFisicaDesde} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <input type="checkbox" id="otro" name="otro" checked={formData.otro} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 mt-1" />
              <div className="flex-grow">
                <label htmlFor="otro" className="text-sm text-slate-700">Otro (Indicar cuál)</label>
                {formData.otro && (
                  <div className="mt-2 pl-2 border-l-2 border-sky-200">
                    <FormField label="" id="otroDetalle" name="otroDetalle" value={formData.otroDetalle} onChange={handleChange} placeholder="Especifique..." required={formData.otro} isTextArea />
                  </div>
                )}
              </div>
            </div>
             <p className="text-xs text-slate-500 mt-2">Debe seleccionar al menos una opción de certificado.</p>
          </div>
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Fecha del Documento</h3>
            <DateField label="Fecha de Emisión del Certificado" id="fechaDocumento" name="fechaDocumento" value={formData.fechaDocumento} onChange={handleChange} required />
        </section>

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
              aria-label="Limpiar formulario y empezar nuevo certificado"
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
              aria-label="Emitir certificado escolar en formato PDF"
            >
              {status === FormStatus.Generating ? 'Generando PDF...' : 'Emitir Certificado'}
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

export default CertificadoEscolarForm;
