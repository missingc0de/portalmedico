import React, { useMemo } from 'react';
import { FichaIngresoEcicepFormData, FichaControlEcicepFormData } from '../types';

const phq9Questions = [
    { key: 'phq9_interes', text: '¿Pocas ganas o interés en hacer las cosas?' },
    { key: 'phq9_animo', text: '¿Sentirse desanimada(o), deprimida(o), triste o sin esperanza?' },
    { key: 'phq9_sueno', text: '¿Problemas para dormir o mantenerse dormida(o), o en dormir demasiado?' },
    { key: 'phq9_energia', text: '¿Sentirse cansada(o) o tener poca energía sin motivo que lo justifique?' },
    { key: 'phq9_apetito', text: '¿Poco apetito o comer en exceso?' },
    { key: 'phq9_culpa', text: '¿Sentirse mal acerca de si misma(o) o sentir que es una(un) fracasada(o) o que se ha fallado a sí misma(o) o a su familia?' },
    { key: 'phq9_concentracion', text: '¿Dificultad para poner atención o concentrarse en las cosas que hace?' },
    { key: 'phq9_motor', text: '¿Moverse más lento o hablar más lento de lo normal o sentirse más inquieta(o) o intranquila(o) de lo normal?' },
    { key: 'phq9_suicidio', text: '¿Pensamientos de que sería mejor estar muerta(o) o que quisiera hacerse daño de alguna forma buscando morir?' },
];

const phq9Options = [
    { label: "Para nada", value: "0" },
    { label: "Varios días (1 a 6 días)", value: "1" },
    { label: "La mayoría de días (7 a 11 días)", value: "2" },
    { label: "Casi todos los días (12 a + días)", value: "3" },
];

interface PHQ9ModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FichaIngresoEcicepFormData | FichaControlEcicepFormData;
  handleRadioChange: (name: keyof (FichaIngresoEcicepFormData | FichaControlEcicepFormData), value: string) => void;
}

const PHQ9Modal: React.FC<PHQ9ModalProps> = ({ isOpen, onClose, formData, handleRadioChange }) => {
    if (!isOpen) return null;

    const phq9Score = useMemo(() => {
        return phq9Questions.reduce((total, question) => {
            const value = formData[question.key as keyof typeof formData];
            return total + (parseInt(value as string, 10) || 0);
        }, 0);
    }, [formData]);

    const phq9Interpretation = useMemo(() => {
        const score = phq9Score;
        let severity = '';
        let action = '';

        if (score >= 0 && score <= 4) {
            severity = 'Depresión mínima';
            action = 'No requiere acción. Reevaluar si hay cambios.';
        } else if (score >= 5 && score <= 9) {
            severity = 'Depresión Leve';
            action = 'Vigilancia; reevaluar en seguimiento. Considerar consejería.';
        } else if (score >= 10 && score <= 14) {
            severity = 'Depresión Moderada';
            action = 'Considerar tratamiento activo (psicoterapia y/o farmacoterapia).';
        } else if (score >= 15 && score <= 19) {
            severity = 'Depresión Moderadamente Severa';
            action = 'Iniciar tratamiento activo (farmacoterapia y/o psicoterapia).';
        } else if (score >= 20) {
            severity = 'Depresión Severa';
            action = 'Tratamiento activo inmediato (farmacoterapia y psicoterapia). Considerar derivación a especialista.';
        }

        const suicidioScore = parseInt(formData.phq9_suicidio as string, 10) || 0;
        if (suicidioScore > 0) {
            action += '\n¡ATENCIÓN! Respuesta positiva a ideación suicida. Evaluar riesgo y tomar medidas inmediatas según protocolo.';
        }

        return { score, severity, action };
    }, [phq9Score, formData.phq9_suicidio]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="phq9-modal-title"
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                    <h2 id="phq9-modal-title" className="text-xl font-semibold text-sky-700">Cuestionario de Salud del Paciente (PHQ-9)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </header>

                <main className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border border-slate-300">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider w-2/5">Durante las últimas 2 semanas, ¿con qué frecuencia ha tenido molestias por los siguientes problemas?</th>
                                    {phq9Options.map(opt => (
                                        <th key={opt.value} scope="col" className="px-3 py-2 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">{opt.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-sm">
                                {phq9Questions.map((q, index) => (
                                    <tr key={q.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="px-3 py-2 text-xs sm:text-sm text-slate-800">{q.text}</td>
                                        {phq9Options.map(opt => (
                                            <td key={opt.value} className="px-3 py-2 text-center">
                                                <input
                                                    type="radio"
                                                    name={q.key}
                                                    value={opt.value}
                                                    checked={formData[q.key as keyof typeof formData] === opt.value}
                                                    onChange={(e) => handleRadioChange(q.key as keyof typeof formData, e.target.value)}
                                                    className="form-radio h-4 w-4 text-sky-600 transition duration-150"
                                                    aria-label={`${q.text}, ${opt.label}`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 p-4 border-t border-slate-200 bg-sky-50 rounded-b-lg">
                        <h4 className="text-md font-semibold text-sky-800">Resultado PHQ-9</h4>
                        <p className="text-slate-700 text-sm"><strong>Puntaje Total:</strong> <span className="font-bold text-lg">{phq9Interpretation.score}</span></p>
                        <p className="text-slate-700 text-sm"><strong>Nivel de Severidad:</strong> <span className="font-bold">{phq9Interpretation.severity}</span></p>
                        <p className="text-slate-700 mt-1 whitespace-pre-wrap text-sm"><strong>Acción Recomendada:</strong> {phq9Interpretation.action.split('\n')[0]}</p>
                        {(parseInt(formData.phq9_suicidio as string, 10) || 0) > 0 && (
                             <p className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md font-semibold text-xs">
                                {phq9Interpretation.action.split('\n')[1]}
                             </p>
                        )}
                    </div>
                </main>
                
                <footer className="p-4 border-t border-slate-200 bg-slate-50 text-right">
                    <button onClick={onClose} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">Cerrar</button>
                </footer>
            </div>
        </div>
    );
};

export default PHQ9Modal;

