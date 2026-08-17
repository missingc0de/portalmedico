import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlArtrosisFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import RutInput from './RutInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { UniversalAIClient, Type } from '../utils/aiClient';
import ImportModal from './ImportModal';
import CopyButton from './CopyButton';

const initialExamenFisicoText = `- Buenas condiciones generales, bien hidratado y perfundido.
- Tórax simétrico, sin retracciones
- RR2TSS
- MP(+)SRA
- Abdomen: RHA(+), BDI, sin masas ni visceromegalias.
- EEII: pulsos (+), simétricos, edema (-), TVP (-).`;

const initialFormData: FichaControlArtrosisFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  patologias: '',
  tratamiento: '',
  dolor: '',
  rigidezArticular: '',
  respuestaAnalgesia: '',
  kinesiterapia: '',
  actividadFisica: '',
  tabaco: false,
  oh: false,
  radiografia: '',
  examenFisico: initialExamenFisicoText,
  articulacionesAfectadas: '',
  planProximoControl: '',
  planTratamiento: '',
  planExamenes: '',
};

interface FichaControlArtrosisProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

import { canUseAI } from '../utils/aiRestrictions';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

export const FichaControlArtrosis: React.FC<FichaControlArtrosisProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlArtrosisFormData>('local_FichaControlArtrosis', initialFormData);
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
        const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });
        const schema = {
            type: Type.OBJECT,
            properties: {
                patologias: { type: Type.STRING, description: "Lista de patologías crónicas del paciente." },
                tratamiento: { type: Type.STRING, description: "Lista de medicamentos que el paciente está tomando actualmente." },
                dolor: { type: Type.STRING, description: "Descripción del dolor del paciente (EVA, características)." },
                rigidezArticular: { type: Type.STRING, description: "Descripción de la rigidez articular." },
                respuestaAnalgesia: { type: Type.STRING, description: "Respuesta del paciente a la analgesia actual." },
                kinesiterapia: { type: Type.STRING, description: "Estado de la kinesiterapia (en curso, finalizada, pendiente)." },
                actividadFisica: { type: Type.STRING, description: "Tipo y frecuencia de actividad física." },
                tabaco: { type: Type.BOOLEAN, description: "Si el paciente consume tabaco." },
                oh: { type: Type.BOOLEAN, description: "Si el paciente consume alcohol (OH)." },
                radiografia: { type: Type.STRING, description: "Resultados de radiografías relevantes." },
                examenFisico: { type: Type.STRING, description: "Descripción del examen físico del control anterior." },
                articulacionesAfectadas: { type: Type.STRING, description: "Lista de articulaciones afectadas." },
                planTratamiento: { type: Type.STRING, description: "El plan de tratamiento del control anterior." },
                planExamenes: { type: Type.STRING, description: "Los exámenes solicitados en el control anterior." }
            },
        };

        const response = await ai.models.generateContent({
            model: 'llama-3.2-90b-vision-preview',
            contents: `Analiza el siguiente texto de un registro clínico de un control de artrosis anterior y extrae la información relevante. Devuelve solo un objeto JSON. Si una información no está presente en el texto, omite la clave del JSON. Texto a analizar: "${pastedText}"`,
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
    let summary = `FICHA CONTROL ARTROSIS\n`;
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
    addField('Dolor', formData.dolor);
    addField('Rigidez articular', formData.rigidezArticular);
    addField('Respuesta analgesia', formData.respuestaAnalgesia);
    addField('Kinesiterapia', formData.kinesiterapia);
    addField('Actividad física', formData.actividadFisica);
    addBooleanField('Tabaco', formData.tabaco);
    addBooleanField('OH', formData.oh);
    addField('Radiografía', formData.radiografia);
    summary += '\n';

    summary += `EXAMEN FÍSICO:\n`;
    summary += `${formData.examenFisico.trim()}\n`;
    addField('Articulaciones afectadas', formData.articulacionesAfectadas);
    summary += '\n';

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
          title: 'Ficha Clínica: Control Artrosis',
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
        <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Artrosis</h2>
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
            <FormField label="Dolor" id="dolor" name="dolor" value={formData.dolor} onChange={handleChange} />
            <FormField label="Rigidez articular" id="rigidezArticular" name="rigidezArticular" value={formData.rigidezArticular} onChange={handleChange} />
            <FormField label="Respuesta analgesia" id="respuestaAnalgesia" name="respuestaAnalgesia" value={formData.respuestaAnalgesia} onChange={handleChange} />
            <FormField label="Kinesiterapia" id="kinesiterapia" name="kinesiterapia" value={formData.kinesiterapia} onChange={handleChange} />
            <FormField label="Actividad física" id="actividadFisica" name="actividadFisica" value={formData.actividadFisica} onChange={handleChange} />
            <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center">
                    <input type="checkbox" id="tabaco" name="tabaco" checked={formData.tabaco} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                    <label htmlFor="tabaco" className="ml-2 text-sm text-slate-700">Tabaco</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="oh" name="oh" checked={formData.oh} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                    <label htmlFor="oh" className="ml-2 text-sm text-slate-700">OH</label>
                </div>
            </div>
            <FormField label="Radiografía" id="radiografia" name="radiografia" value={formData.radiografia} onChange={handleChange} isTextArea rows={2} />
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Físico</h3>
            <FormField label="" id="examenFisico" name="examenFisico" value={formData.examenFisico} onChange={handleChange} isTextArea rows={7} />
            <FormField label="Articulaciones afectadas" id="articulacionesAfectadas" name="articulacionesAfectadas" value={formData.articulacionesAfectadas} onChange={handleChange} isTextArea rows={3} />
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Plan</h3>
            <FormField label="Próximo Control" id="planProximoControl" name="planProximoControl" value={formData.planProximoControl} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Tratamiento" id="planTratamiento" name="planTratamiento" value={formData.planTratamiento} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Exámenes" id="planExamenes" name="planExamenes" value={formData.planExamenes} onChange={handleChange} isTextArea rows={2} />
          </section>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            <CopyButton textToCopy={generatedText} />
          </div>
          <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
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
        title="Importar desde Control de Artrosis Anterior"
        description="Pegue aquí el texto del control anterior para autocompletar la ficha."
    />
    </>
  );
};
