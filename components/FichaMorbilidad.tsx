import React, { useState, useCallback, useEffect } from 'react';
import { FormStatus, User, BaseFichaData } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { UniversalAIClient } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

interface FichaMorbilidadFormData extends BaseFichaData {
    edad: string;
    sexo: string;
    antecedentes: string;
    farmacos: string;
    historiaActual: string;
    examenFisico: string;
    diagnostico: string;
    plan: string;
}

const initialFormData: FichaMorbilidadFormData = {
    nombrePaciente: '',
    rutPaciente: '',
    edad: '',
    sexo: '',
    antecedentes: '',
    farmacos: '',
    historiaActual: '',
    examenFisico: '',
    diagnostico: '',
    plan: '',
};

const FichaMorbilidad: React.FC<{ onBackToMenu: () => void; loggedInUser: User | null }> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaMorbilidadFormData>('local_FichaMorbilidad', initialFormData);
    const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
    const [aiSuggestions, setAiSuggestions] = useState<{ differentials: string[], redFlags: string[], tips: string } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiAnalysis = async () => {
        if (!formData.historiaActual.trim()) return;
        
        setIsAiLoading(true);
        try {
            const ai = getAiClient();
            const prompt = `Actúa como un consultor médico senior. Analiza este caso clínico de morbilidad en APS y devuelve sugerencias.
            EDAD: ${formData.edad}
            SEXO: ${formData.sexo}
            ANTECEDENTES: ${formData.antecedentes}
            HISTORIA ACTUAL: ${formData.historiaActual}

            Devuelve un JSON estrictamente con este formato:
            {
              "differentials": ["diagnostico 1", "diagnostico 2"],
              "redFlags": ["alerta 1", "alerta 2"],
              "tips": "un consejo breve de manejo"
            }
            Responde en ESPAÑOL.`;

            const response = await ai.models.generateContent({
                model: 'llama-3.2-90b-vision-preview',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const result = JSON.parse(response.text || '{}');
            setAiSuggestions(result);
        } catch (error) {
            console.error("AI Analysis error", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleExportPdf = async () => {
        if (!loggedInUser) return;
        setStatus(FormStatus.Generating);
        const content = `
            MORBILIDAD GENERAL
            PACIENTE: ${formData.nombrePaciente} RUT: ${formData.rutPaciente}
            EDAD: ${formData.edad} SEXO: ${formData.sexo}
            ---------------------------------------
            ANAMNESIS:
            Antecedentes: ${formData.antecedentes}
            Fármacos: ${formData.farmacos}
            Historia Actual: ${formData.historiaActual}
            ---------------------------------------
            EXAMEN FÍSICO:
            ${formData.examenFisico}
            ---------------------------------------
            DIAGNÓSTICO: ${formData.diagnostico}
            PLAN: ${formData.plan}
        `;
        await generateClinicalRecordPdf({ title: 'Ficha Morbilidad', content }, loggedInUser);
        setStatus(FormStatus.Idle);
    };

    return (
        <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
            <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Ficha de Morbilidad General</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleAiAnalysis} 
                        disabled={isAiLoading || !formData.historiaActual || loggedInUser?.profession !== 'medicina'} 
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 disabled:bg-slate-300 flex items-center gap-2"
                    >
                        {isAiLoading ? 'Analizando...' : (loggedInUser?.profession === 'medicina' ? '✨ Analizar Caso (IA)' : 'No disponible')}
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 space-y-4">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                        <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} />
                        <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={(v) => setFormData(p => ({...p, rutPaciente: v}))} />
                        <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                            <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                                <option value="">Seleccione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <FormField label="Antecedentes Mórbidos" id="antecedentes" name="antecedentes" value={formData.antecedentes} onChange={handleChange} isTextArea rows={2} />
                        <div>
                            <FormField label="Fármacos Habituales" id="farmacos" name="farmacos" value={formData.farmacos} onChange={handleChange} isTextArea rows={2} />
                            <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={(v) => setFormData(p => ({...p, farmacos: v}))} />
                        </div>
                        <FormField label="Historia Actual / Motivo de Consulta" id="historiaActual" name="historiaActual" value={formData.historiaActual} onChange={handleChange} isTextArea rows={4} placeholder="Describa síntomas, tiempo de evolución..." />
                        <FormField label="Examen Físico" id="examenFisico" name="examenFisico" value={formData.examenFisico} onChange={handleChange} isTextArea rows={4} />
                        <FormField label="Diagnóstico" id="diagnostico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} />
                        <FormField label="Plan e Indicaciones" id="plan" name="plan" value={formData.plan} onChange={handleChange} isTextArea rows={3} />
                    </section>
                </div>

                <div className="lg:w-1/3">
                    <div className="sticky top-20 space-y-4">
                        <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg border-t-4 border-purple-500">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                ðŸ§  Copiloto Clínico
                            </h3>
                            {!aiSuggestions ? (
                                <p className="text-sm text-slate-400 italic">Complete la "Historia Actual" y presione el botón de análisis para recibir sugerencias de la IA.</p>
                            ) : (
                                <div className="space-y-4 animate-fadeIn">
                                    {aiSuggestions.redFlags.length > 0 && (
                                        <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg">
                                            <p className="text-xs font-bold text-red-400 uppercase mb-1">ðŸš© Red Flags / Alertas</p>
                                            <ul className="text-xs list-disc list-inside text-red-100">
                                                {aiSuggestions.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-purple-400 uppercase mb-1">ðŸ” Diferenciales Sugeridos</p>
                                        <div className="flex flex-wrap gap-1">
                                            {aiSuggestions.differentials.map((d, i) => (
                                                <span key={i} className="text-[10px] bg-slate-700 px-2 py-0.5 rounded border border-slate-600">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg">
                                        <p className="text-xs font-bold text-blue-400 uppercase mb-1">ðŸ’¡ Tip de Manejo</p>
                                        <p className="text-xs text-blue-100 italic">{aiSuggestions.tips}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <button onClick={handleExportPdf} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md">
                                EXPORTAR A PDF
                            </button>
                            <button onClick={onBackToMenu} className="w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">
                                VOLVER AL MENÚ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default FichaMorbilidad;
