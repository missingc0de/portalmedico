import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlEpilepsiaFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import RutInput from './RutInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';
import ImportModal from './ImportModal';
import CopyButton from './CopyButton';

const initialExamenFisicoText = `- Buenas condiciones generales, bien hidratado y perfundido.
- Tiroides sin alteraciones.
- Tórax simétrico, sin retracciones.
- RR2TSS.
- MP(+)SRA.
- Abdomen: RHA(+), BDI, sin masas ni visceromegalias.
- EEII: pulsos (+), simétricos, edema (-), TVP (-).
- Neurológico: Sin alteraciones`;

const initialFormData: FichaControlEpilepsiaFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  patologias: '',
  // FIX: Added missing thisTreatmentActual to initialFormData to match FichaControlEpilepsiaFormData interface
  thisTreatmentActual: '',
  tratamiento: '',
  adherenciaTratamiento: false,
  tabaco: false,
  oh: false,
  drogas: false,
  mac: false,
  ultimaCrisis: '',
  desencadenante: '',
  controlNeurologo: '',
  indicacionesSecundaria: '',
  examenes: '',
  examenFisico: initialExamenFisicoText,
  planProximoControl: '',
  planTratamiento: '',
  planExamenes: '',
};

interface FichaControlEpilepsiaProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const checkboxConfig: Array<{ key: keyof FichaControlEpilepsiaFormData, label: string }> = [
  { key: 'adherenciaTratamiento', label: 'Buena adherencia a tratamiento' },
  { key: 'tabaco', label: 'Tabaco' },
  { key: 'oh', label: 'OH' },
  { key: 'drogas', label: 'Drogas' },
  { key: 'mac', label: 'MAC (Método Anticonceptivo)' },
];

import { canUseAI } from '../utils/aiRestrictions';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const FichaControlEpilepsia: React.FC<FichaControlEpilepsiaProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlEpilepsiaFormData>('local_FichaControlEpilepsia', initialFormData);
  const [generatedText, setGeneratedText] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);

  const handleAiImport = async (pastedText: string) => {
    // Check AI restrictions
    const check = canUseAI(loggedInUser);
    if (!check.allowed) {
        alert(check.reason || 'No tiene permiso para usar esta función.');
        return;
    }

    setIsAiImporting(true);
    try {
        const ai = getAiClient();
        const schema = {
            type: Type.OBJECT,
            properties: {
                patologias: { type: Type.STRING, description: "Lista de patologías crónicas del paciente." },
                tratamiento: { type: Type.STRING, description: "Lista de medicamentos que el paciente está tomando actualmente." },
                adherenciaTratamiento: { type: Type.BOOLEAN, description: "Si el paciente adhiere al tratamiento." },
                tabaco: { type: Type.BOOLEAN, description: "Si el paciente consume tabaco." },
                oh: { type: Type.BOOLEAN, description: "Si el paciente consume alcohol (OH)." },
                drogas: { type: Type.BOOLEAN, description: "Si el paciente consume drogas." },
                mac: { type: Type.BOOLEAN, description: "Si el paciente usa método anticonceptivo (MAC)." },
                ultimaCrisis: { type: Type.STRING, description: "Fecha o descripción de la última crisis convulsiva." },
                desencadenante: { type: Type.STRING, description: "Desencadenantes de crisis reportados por el paciente." },
                controlNeurologo: { type: Type.STRING, description: "Fecha o estado del último control con neurólogo." },
                indicacionesSecundaria: { type: Type.STRING, description: "Indicaciones recibidas desde el nivel secundario." },
                examenes: { type: Type.STRING, description: "Resultados de exámenes relevantes." },
                examenFisico: { type: Type.STRING, description: "Descripción del examen físico del control anterior." },
                planTratamiento: { type: Type.STRING, description: "El plan de tratamiento del control anterior." },
                planExamenes: { type: Type.STRING, description: "Los exámenes solicitados en el control anterior." }
            },
        };

        const response = await ai.models.generateContent({
            model: 'Groq-2.5-flash',
            contents: `Analiza el siguiente texto de un registro clínico de un control de epilepsia anterior y extrae la información relevante. Devuelve solo un objeto JSON. Si una información no está presente en el texto, omite la clave del JSON. Texto a analizar: "${pastedText}"`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        setFormData(prev => ({ ...prev, ...parsedData }));
        alert('Datos importados exitosamente.');
        setIsImportModalOpen(false);

    } catch (error) {
        console.error("Error al importar datos:", error);
        alert("No se pudo procesar el texto. Verifique el formato o intente de nuevo.");
    } finally {
        setIsAiImporting(false);
    }
  };

  const generateSummary = useCallback(() => {
    let summary = `FICHA CONTROL EPILEPSIA (NO CARDIO)\n`;
    summary += `---------------------------------------\n`;
    summary += `FECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) {
      summary += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    }
    summary += `PACIENTE: ${formData.nombrePaciente || '(No ingresado)'}\n`;
    summary += `RUT: ${formData.rutPaciente || '(No ingresado)'}\n`;
    summary += `---------------------------------------\n\n`;

    const addField = (label: string, value: string) => {
      if (value && value.trim()) {
        summary += `- ${label}: ${value.trim()}\n`;
      }
    };
    
    const addBooleanField = (label: string, value: boolean) => {
      summary += `- ${label}: ${value ? 'Sí' : 'Niega'}\n`;
    }

    summary += `ANAMNESIS:\n`;
    addField('Patologías', formData.patologias);
    addField('Tratamiento', formData.tratamiento);
    addBooleanField('Buena adherencia a tratamiento', formData.adherenciaTratamiento);
    addBooleanField('Tabaco', formData.tabaco);
    addBooleanField('OH', formData.oh);
    addBooleanField('Drogas', formData.drogas);
    addBooleanField('MAC', formData.mac);
    addField('Última crisis', formData.ultimaCrisis);
    addField('Desencadenante', formData.desencadenante);
    addField('Control con neurólogo', formData.controlNeurologo);
    addField('Indicaciones desde atención secundaria', formData.indicacionesSecundaria);
    addField('Exámenes', formData.examenes);
    summary += '\n';

    summary += `EXAMEN FÍSICO:\n`;
    summary += `${formData.examenFisico.trim()}\n\n`;

    summary += `PLAN:\n`;
    addField('PRÓXIMO CONTROL', formData.planProximoControl);
    addField('TRATAMIENTO', formData.planTratamiento);
    addField('EXÁMENES', formData.planExamenes);
    
    return summary.trim();
  }, [formData, loggedInUser]);

  useEffect(() => {
    setGeneratedText(generateSummary());
  }, [formData, generateSummary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          title: 'Ficha Clínica: Control Epilepsia',
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
    <>
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Epilepsia</h2>
        <p className="text-slate-500 mt-2">Complete los campos. El resumen se generará automáticamente.</p>
      </header>
        {isAiImporting && (
        <div className="w-full text-center p-3 mb-4 bg-sky-100 border border-sky-300 rounded-lg animate-pulse">
          <p className="text-sky-700 font-semibold">Importando datos... Esto puede tardar unos segundos.</p>
        </div>
      )}
      <div className="mb-6">
          <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
              disabled={isAiImporting || loggedInUser?.profession !== 'medicina'}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loggedInUser?.profession === 'medicina' ? 'IMPORTAR DESDE CONTROL ANTERIOR' : 'No disponible'}
          </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
        <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
          
          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} required />
              <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={handleRutChange} required />
            </div>
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
            <FormField label="Patologías" id="patologias" name="patologias" value={formData.patologias} onChange={handleChange} isTextArea rows={2} />
            <div>
              <FormField label="Tratamiento" id="tratamiento" name="tratamiento" value={formData.tratamiento} onChange={handleChange} isTextArea rows={3} />
              <MedicamentoArsenalInput currentValue={formData.tratamiento} onValueChange={(newValue) => setFormData(prev => ({...prev, tratamiento: newValue}))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-2">
                {checkboxConfig.map(item => (
                    <div key={String(item.key)} className="flex items-center my-2">
                        <input type="checkbox" id={String(item.key)} name={String(item.key)} checked={formData[item.key as keyof FichaControlEpilepsiaFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                        <label htmlFor={String(item.key)} className="ml-2 text-sm text-slate-700">{item.label}</label>
                    </div>
                ))}
            </div>
            <FormField label="Última crisis" id="ultimaCrisis" name="ultimaCrisis" value={formData.ultimaCrisis} onChange={handleChange} />
            <FormField label="Desencadenante" id="desencadenante" name="desencadenante" value={formData.desencadenante} onChange={handleChange} />
            <FormField label="Control con neurólogo" id="controlNeurologo" name="controlNeurologo" value={formData.controlNeurologo} onChange={handleChange} />
            <FormField label="Indicaciones desde atención secundaria" id="indicacionesSecundaria" name="indicacionesSecundaria" value={formData.indicacionesSecundaria} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Exámenes" id="examenes" name="examenes" value={formData.examenes} onChange={handleChange} isTextArea rows={2} />
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Físico</h3>
            <FormField label="" id="examenFisico" name="examenFisico" value={formData.examenFisico} onChange={handleChange} isTextArea rows={8} />
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Plan</h3>
            <FormField label="Próximo Control" id="planProximoControl" name="planProximoControl" value={formData.planProximoControl} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Tratamiento" id="planTratamiento" name="planTratamiento" value={formData.planTratamiento} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Exámenes" id="planExamenes" name="planExamenes" value={formData.planExamenes} onChange={handleChange} isTextArea rows={2} />
          </section>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-120px)]">
          <h3 className="text-xl font-semibold mb-2 text-sky-700">Resumen Ficha Clínica</h3>
          <div className="flex justify-end mb-2">
            <CopyButton textToCopy={generatedText} />
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
     <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleAiImport}
        isImporting={isAiImporting}
        title="Importar desde Control de Epilepsia Anterior"
        description="Pegue aquí el texto del control anterior para autocompletar la ficha."
    />
    </>
  );
};

export default FichaControlEpilepsia;
