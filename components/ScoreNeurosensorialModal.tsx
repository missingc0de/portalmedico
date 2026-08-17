import React, { useState, useEffect } from 'react';
import FormField from './FormField';

interface ScoreNeurosensorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evaluation: string) => void;
  edadMeses: 1 | 3;
}

const hitosDelDesarrollo = {
    1: [
        "Sigue objetos en línea media.",
        "Alerta a los sonidos.",
        "Reflejo de Moro presente.",
        "Reflejo de prensión palmar y plantar presentes.",
        "Postura en flexión.",
        "Vocalizaciones guturales."
    ],
    3: [
        "Sostén cefálico.",
        "Sonrisa social.",
        "Sigue objetos 180°.",
        "Vocaliza (gorgogeo).",
        "Manos a la línea media.",
        "Eleva la cabeza y el pecho en prono."
    ]
};

const ScoreNeurosensorialModal: React.FC<ScoreNeurosensorialModalProps> = ({ isOpen, onClose, onSave, edadMeses }) => {
    const [observaciones, setObservaciones] = useState('');
    const [conclusion, setConclusion] = useState('Adecuado para la edad');
    const [hitosSeleccionados, setHitosSeleccionados] = useState<Record<string, boolean>>({});

    const hitosActuales = hitosDelDesarrollo[edadMeses];

    useEffect(() => {
        if (isOpen) {
            setObservaciones('');
            setConclusion('Adecuado para la edad');
            const initialHitos = hitosActuales.reduce((acc, hito) => ({ ...acc, [hito]: false }), {});
            setHitosSeleccionados(initialHitos);
        }
    }, [isOpen, edadMeses, hitosActuales]);

    const handleHitoToggle = (hito: string) => {
        setHitosSeleccionados(prev => ({ ...prev, [hito]: !prev[hito] }));
    };
    
    const handleSave = () => {
        let summary = `DSM: ${conclusion}.`;
        const hitosPresentes = Object.entries(hitosSeleccionados).filter(([, presente]) => presente).map(([hito]) => hito);
        
        if (hitosPresentes.length > 0) {
            summary += ` Hitos presentes: ${hitosPresentes.join(', ')}.`;
        }
        if (observaciones.trim()) {
            summary += ` Observaciones: ${observaciones.trim()}.`;
        }
        onSave(summary);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <h2 className="text-xl font-semibold text-purple-700">Evaluación del Desarrollo Psicomotor ({edadMeses} Meses)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-slate-700 mb-2">Hitos del Desarrollo Esperados:</h4>
                        <div className="space-y-2">
                            {hitosActuales.map(hito => (
                                <div key={hito} className="flex items-center p-2 bg-slate-100 rounded-md">
                                    <input
                                        type="checkbox"
                                        id={`hito-${hito}`}
                                        checked={hitosSeleccionados[hito] || false}
                                        onChange={() => handleHitoToggle(hito)}
                                        className="h-4 w-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor={`hito-${hito}`} className="ml-3 text-sm text-slate-800">{hito}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <FormField
                        label="Observaciones adicionales"
                        id="neuro-observaciones"
                        name="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        isTextArea
                        rows={3}
                        placeholder="Describa otros hallazgos relevantes..."
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Conclusión de la Evaluación:</label>
                        <select
                            value={conclusion}
                            onChange={(e) => setConclusion(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="Adecuado para la edad">Adecuado para la edad</option>
                            <option value="Alerta">Alerta</option>
                            <option value="Reevaluar en próximo control">Reevaluar en próximo control</option>
                        </select>
                    </div>
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">Cancelar</button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md">Guardar Evaluación</button>
                </footer>
            </div>
        </div>
    );
};

export default ScoreNeurosensorialModal;
