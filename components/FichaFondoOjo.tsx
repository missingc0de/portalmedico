import React, { useState, useCallback, useEffect } from 'react';
import { FichaFondoOjoFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import RutInput from './RutInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaFondoOjoFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  sexo: '',
  edad: '',
  tipoAtencion: '',
  antecedentes: 'DM2',
  farmacos: 'Metformina 850mg 1c/12h',
  fechaExamen: new Date().toISOString().split('T')[0],
  resultado: '',
  indicacionEducacion: true,
  indicacionSeguimientoPscv: true,
  indicacionOftalmoUapo: true,
  indicacionOftalmoHospital: true,
  indicacionControlesPeriodicos: true,
  fono: '',
};

const resultadoOptions = [
    { value: '', label: 'Seleccione resultado...' },
    { value: 'FO Sin Retinopatía Diabética', label: 'Sin Retinopatía Diabética' },
    { value: 'FO Con Retinopatía Leve', label: 'Con Retinopatía Leve' },
    { value: 'FO Retinopatía Diabética Moderada', label: 'Retinopatía Diabética Moderada' },
    { value: 'FO Retinopatía Severa', label: 'Retinopatía Severa' },
    { value: 'FO Retinopatía Proliferativa', label: 'Retinopatía Proliferativa' },
];

interface FichaFondoOjoProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaFondoOjo: React.FC<FichaFondoOjoProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaFondoOjoFormData>('local_FichaFondoOjo', initialFormData);
  const [generatedText, setGeneratedText] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    if (isNaN(date.getTime())) return '(Fecha inválida)';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const generateSummary = useCallback(() => {
    let summary = `ENTREGA RESULTADO DE FONDO DE OJO\n\n`;
    summary += `PACIENTE: ${formData.nombrePaciente || '(No ingresado)'}\n`;
    summary += `RUT: ${formData.rutPaciente || '(No ingresado)'}\n\n`;

    summary += `ANAMNESIS\n`;
    summary += `Sexo: ${formData.sexo || '(No seleccionado)'}\n`;
    summary += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    
    let tipoAtencionText = `Tipo de atención: ${formData.tipoAtencion || '(No seleccionado)'}`;
    if (formData.tipoAtencion === 'Presencial') {
        tipoAtencionText += '\nAsiste para retroalimentación de resultado de fondo de ojo.';
    } else if (formData.tipoAtencion === 'Telefónico') {
        tipoAtencionText += '\nSe contacta vía telefónica para retroalimentación de resultado de fondo de ojo.';
    }
    summary += `${tipoAtencionText}\n`;

    summary += `Antecedentes: ${formData.antecedentes || '(No ingresado)'}\n`;
    summary += `Fármacos: ${formData.farmacos || '(No ingresado)'}\n`;
    summary += `Fecha de toma de examen: ${formatDateForDisplay(formData.fechaExamen)}\n\n`;

    summary += `RESULTADO:\n${formData.resultado || '(No seleccionado)'}\n\n`;

    summary += `INDICACIONES:\n`;
    let hasIndications = false;
    if (formData.indicacionEducacion) { summary += '- Educación sobre su patología.\n'; hasIndications = true; }
    if (formData.indicacionSeguimientoPscv) { summary += '- Seguimiento en PSCV.\n'; hasIndications = true; }
    
    const isModerada = formData.resultado === 'FO Retinopatía Diabética Moderada';
    if (isModerada && formData.indicacionOftalmoUapo) {
        summary += '- Realizo IC Oftalmología UAPO.\n';
        hasIndications = true;
    }
    const isSeveraOProliferativa = formData.resultado === 'FO Retinopatía Severa' || formData.resultado === 'FO Retinopatía Proliferativa';
    if (isSeveraOProliferativa && formData.indicacionOftalmoHospital) {
        summary += '- Realizo IC a Oftalmología Hospital de La Serena con informe de FO.\n';
        hasIndications = true;
    }
    if (formData.fono.trim()) {
        summary += `- Fono: ${formData.fono.trim()}\n`;
        hasIndications = true;
    }
    if (formData.indicacionControlesPeriodicos) {
        summary += '- Mantener controles periódicos o derivar ECICEP (recordar su fecha de próximo control según antecedentes de ficha clínica).\n';
        hasIndications = true;
    }
    if (!hasIndications) {
        summary += '(Sin indicaciones seleccionadas)\n';
    }
    summary += `\n`;

    summary += `DIAGNÓSTICO:\nRetinopatía diabética (DG presuntivo).\n`;

    return summary.trim();
  }, [formData]);

  useEffect(() => {
    setGeneratedText(generateSummary());
  }, [formData, generateSummary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, rutPaciente: value }));
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
      .then(() => alert('Resumen copiado al portapapeles.'))
      .catch(err => alert('Error al copiar texto.'));
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };
  
  const handleExportPdf = async () => {
    if (!formData.nombrePaciente || !formData.rutPaciente) {
      alert('Por favor, ingrese el nombre y RUT del paciente antes de exportar.');
      return;
    }
    if (!loggedInUser) {
      alert('Error: Usuario no identificado. No se puede generar el PDF.');
      return;
    }

    setStatus(FormStatus.Generating);
    try {
      await generateClinicalRecordPdf(
        {
          title: 'Ficha Clínica: Entrega Resultado Fondo de Ojo',
          content: generatedText,
        },
        loggedInUser
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF.");
    } finally {
      setStatus(FormStatus.Idle);
    }
  };


  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Entrega Resultado de Fondo de Ojo</h2>
        <p className="text-slate-500 mt-2">Complete los campos para generar el registro clínico.</p>
      </header>

      <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
        <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
             <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} required />
                  <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={handleRutChange} required />
                </div>
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                        <div className="flex items-center space-x-4">
                            {['Masculino', 'Femenino'].map(opt => (
                                <label key={opt} className="flex items-center text-sm">
                                    <input type="radio" name="sexo" value={opt} checked={formData.sexo === opt} onChange={handleChange} className="form-radio h-4 w-4 text-sky-600"/>
                                    <span className="ml-2 text-slate-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} />
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Atención</label>
                    <div className="flex items-center space-x-4">
                        {['Presencial', 'Telefónico'].map(opt => (
                            <label key={opt} className="flex items-center text-sm">
                                <input type="radio" name="tipoAtencion" value={opt} checked={formData.tipoAtencion === opt} onChange={handleChange} className="form-radio h-4 w-4 text-sky-600"/>
                                <span className="ml-2 text-slate-700">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <FormField label="Antecedentes" id="antecedentes" name="antecedentes" value={formData.antecedentes} onChange={handleChange} isTextArea rows={2} containerClassName="mt-4"/>
                 <div>
                    <FormField label="Fármacos" id="farmacos" name="farmacos" value={formData.farmacos} onChange={handleChange} isTextArea rows={3} containerClassName="mt-4"/>
                    <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={(newValue) => setFormData(prev => ({...prev, farmacos: newValue}))} />
                </div>
                <DateField label="Fecha de Toma de Examen" id="fechaExamen" name="fechaExamen" value={formData.fechaExamen} onChange={handleChange} containerClassName="mt-4" />
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Resultado</h3>
                <select id="resultado" name="resultado" value={formData.resultado} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500">
                    {resultadoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </section>

             <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Indicaciones</h3>
                <div className="space-y-3">
                    <div className="flex items-center"><input type="checkbox" id="indicacionEducacion" name="indicacionEducacion" checked={formData.indicacionEducacion} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" /><label htmlFor="indicacionEducacion" className="ml-2 text-sm text-slate-700">Educación sobre su patología</label></div>
                    <div className="flex items-center"><input type="checkbox" id="indicacionSeguimientoPscv" name="indicacionSeguimientoPscv" checked={formData.indicacionSeguimientoPscv} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" /><label htmlFor="indicacionSeguimientoPscv" className="ml-2 text-sm text-slate-700">Seguimiento en PSCV</label></div>
                    {formData.resultado === 'FO Retinopatía Diabética Moderada' && <div className="flex items-center"><input type="checkbox" id="indicacionOftalmoUapo" name="indicacionOftalmoUapo" checked={formData.indicacionOftalmoUapo} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" /><label htmlFor="indicacionOftalmoUapo" className="ml-2 text-sm text-slate-700">Realizo IC Oftalmología UAPO</label></div>}
                    {(formData.resultado === 'FO Retinopatía Severa' || formData.resultado === 'FO Retinopatía Proliferativa') && <div className="flex items-center"><input type="checkbox" id="indicacionOftalmoHospital" name="indicacionOftalmoHospital" checked={formData.indicacionOftalmoHospital} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" /><label htmlFor="indicacionOftalmoHospital" className="ml-2 text-sm text-slate-700">Realizo IC a Oftalmología Hospital de La Serena con informe de FO</label></div>}
                    <div className="flex items-center"><input type="checkbox" id="indicacionControlesPeriodicos" name="indicacionControlesPeriodicos" checked={formData.indicacionControlesPeriodicos} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" /><label htmlFor="indicacionControlesPeriodicos" className="ml-2 text-sm text-slate-700">Mantener controles periódicos o derivar ECICEP</label></div>
                    <FormField label="Fono" id="fono" name="fono" value={formData.fono} onChange={handleChange} />
                </div>
            </section>
          </form>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-120px)]">
          <h3 className="text-xl font-semibold mb-2 text-sky-700">Resumen Ficha Clínica</h3>
          <div className="flex justify-end mb-2">
            <button onClick={handleCopyToClipboard} className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300">Copiar</button>
          </div>
          <textarea value={generatedText} readOnly className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-xs flex-grow text-slate-800" rows={30} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">Volver al Menú</button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
              type="button"
              onClick={handleNewDocument}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm"
            >
              Limpiar Formulario
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={status === FormStatus.Generating}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300"
          >
            {status === FormStatus.Generating ? 'Exportando...' : 'Exportar como PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaFondoOjo;
