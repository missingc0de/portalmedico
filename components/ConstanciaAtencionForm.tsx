import React, { useState, useCallback, useEffect } from 'react';
import { FormData, FormStatus, User } from '../types'; 
import FormField from './FormField';
import RutInput from './RutInput';
import Cie10AutoComplete from './Cie10AutoComplete';
import { generateCertificatePdf } from '../services/pdfGenerator';
import { cie10Data } from '../data/cie10data';
import { formatRutChilean } from './RutInput'; // Import for display
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FormData = {
  fullName: '',
  rut: '',
  address: '',
  city: '',
  diagnosis: '',
  docName: '', 
  docTitle: '', 
  docRut: '', 
  isCustomDiagnosis: false,
  customDiagnosisText: '',
  hideLogos: false, // Default to show logos
};

interface ConstanciaAtencionFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null; 
}

const ConstanciaAtencionForm: React.FC<ConstanciaAtencionFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FormData>('local_ConstanciaAtencionForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    if (loggedInUser) {
      setFormData(prev => ({
        ...prev,
        docName: loggedInUser.fullName,
        docTitle: "Médico Cirujano", 
        docRut: loggedInUser.rut || '', // Use user's actual RUT
        hideLogos: prev.hideLogos || false, // Preserve hideLogos if already set
      }));
    }
  }, [loggedInUser]);

  useEffect(() => {
    const { fullName, rut, address, city, diagnosis, isCustomDiagnosis, customDiagnosisText } = formData;
    const diagnosisValid = isCustomDiagnosis ? customDiagnosisText.trim() !== '' : diagnosis.trim() !== '';
    setIsFormValid(
      fullName.trim() !== '' &&
      rut.trim() !== '' &&
      address.trim() !== '' &&
      city.trim() !== '' &&
      diagnosisValid
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

  const handleRutChange = useCallback((name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDiagnosisChange = useCallback((value: string) => { 
    setFormData(prev => ({ ...prev, diagnosis: value, customDiagnosisText: '' }));
  }, []);

  const handleCustomDiagnosisTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, customDiagnosisText: e.target.value, diagnosis: '' }));
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete todos los campos requeridos del paciente y diagnóstico.");
      return;
    }
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      const currentDate = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const pdfHeaderText = `Coquimbo, ${currentDate}`;

      let finalDiagnosis = '';
      if (formData.isCustomDiagnosis) {
        finalDiagnosis = formData.customDiagnosisText.toLowerCase();
      } else {
        const parts = formData.diagnosis.split(' - ');
        finalDiagnosis = parts.length > 1 ? parts.slice(1).join(' - ').trim() : formData.diagnosis;
      }
      
      const dataForPdf: FormData = {
        ...formData, 
        diagnosis: finalDiagnosis,
      };

      await generateCertificatePdf(dataForPdf, pdfHeaderText, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar el certificado PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData(prev => ({
        ...initialFormData, 
        docName: loggedInUser?.fullName || '',
        docTitle: "Médico Cirujano",
        docRut: loggedInUser?.rut || '',
        hideLogos: false, // Ensure hideLogos is reset
    }));
    setStatus(FormStatus.Idle);
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Constancia de Atención</h2>
        <p className="text-slate-500 mt-2">Complete los datos para emitir la constancia.</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nombre Completo del Paciente" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Ej: Juan Pérez González" required />
            <RutInput label="RUT del Paciente" id="rut" name="rut" value={formData.rut} onChange={(value) => handleRutChange('rut', value)} placeholder="Ej: 12.345.678-9" required />
            <FormField label="Dirección del Paciente" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Av. Siempre Viva 123" required />
            <FormField label="Ciudad del Paciente" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Ej: Coquimbo" required />
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCustomDiagnosis"
                name="isCustomDiagnosis"
                checked={formData.isCustomDiagnosis}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 bg-white"
                aria-describedby="customDiagnosisHelp"
              />
              <label htmlFor="isCustomDiagnosis" className="ml-2 text-sm text-slate-700">
                Usar diagnóstico personalizado (texto libre)
              </label>
            </div>
             <p id="customDiagnosisHelp" className="sr-only">Marque esta casilla si desea ingresar un diagnóstico manualmente en lugar de seleccionarlo de la lista CIE-10.</p>

            {formData.isCustomDiagnosis ? (
              <FormField
                label="Diagnóstico Personalizado"
                id="customDiagnosisText"
                name="customDiagnosisText"
                value={formData.customDiagnosisText}
                onChange={handleCustomDiagnosisTextChange}
                placeholder="Ingrese diagnóstico (ej: cuadro gripal leve)"
                required={formData.isCustomDiagnosis}
              />
            ) : (
              <Cie10AutoComplete
                label="Diagnóstico (CIE-10)"
                id="diagnosis"
                value={formData.diagnosis}
                onChange={handleDiagnosisChange}
                suggestions={cie10Data}
                placeholder="Escriba código o descripción CIE-10"
                required={!formData.isCustomDiagnosis}
              />
            )}
          </div>
        </section>

        <section className="p-6 bg-slate-100 rounded-lg border border-slate-300">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Médico Emisor (Para PDF)</h3>
          {loggedInUser ? (
            <div className="space-y-2 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {loggedInUser.electronicSignature || `${loggedInUser.fullName}\n${loggedInUser.rut ? formatRutChilean(loggedInUser.rut) : ''}\nMédico Cirujano`}
            </div>
          ) : (
            <p className="text-red-500">Error: No se pudo cargar la información del médico.</p>
          )}
        </section>

        <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-700 mb-3">Opciones de PDF</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideLogos"
                name="hideLogos"
                checked={formData.hideLogos || false}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="hideLogos" className="ml-2 block text-sm text-slate-700">
                No usar logotipos en encabezado del PDF
              </label>
            </div>
        </div>

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
              aria-label="Emitir un nuevo documento y limpiar formulario"
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
              aria-label="Emitir certificado en formato PDF"
            >
              {status === FormStatus.Generating ? 'Generando PDF...' : 'Emitir Constancia'}
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

export default ConstanciaAtencionForm;
