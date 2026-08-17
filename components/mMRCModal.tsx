import React, { useState, useEffect } from 'react';

interface mMRCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: string) => void;
  currentScore: string;
}

const mMRCOptions = [
    { score: '0', text: 'Me ahogo solo con el ejercicio intenso.' },
    { score: '1', text: 'Me ahogo al apurarme en lo plano o al subir una pendiente poco pronunciada.' },
    { score: '2', text: 'Camino más lento que la gente de mi misma edad en lo plano debido a la falta de aire, o tengo que parar para respirar al caminar a mi propio paso en lo plano.' },
    { score: '3', text: 'Me detengo para respirar después de caminar unos 100 metros o después de unos pocos minutos en lo plano.' },
    { score: '4', text: 'La falta de aire me impide salir de casa o me ahogo al vestirme.' },
];

const mMRCModal: React.FC<mMRCModalProps> = ({ isOpen, onClose, onSave, currentScore }) => {
    const [selectedScore, setSelectedScore] = useState(currentScore);

    useEffect(() => {
        if (isOpen) {
            setSelectedScore(currentScore);
        }
    }, [isOpen, currentScore]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedScore);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mmrc-modal-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <h2 id="mmrc-modal-title" className="text-xl font-semibold text-sky-700">Escala de Disnea mMRC</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <p className="text-sm text-slate-600 mb-4">Seleccione el grado de disnea que mejor describa la situación del paciente.</p>
                    {mMRCOptions.map(option => (
                        <div key={option.score} className="p-3 border border-slate-200 rounded-lg hover:bg-sky-50 transition-colors">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="radio"
                                    name="mmrcScore"
                                    value={option.score}
                                    checked={selectedScore === option.score}
                                    onChange={() => setSelectedScore(option.score)}
                                    className="form-radio h-5 w-5 text-sky-600 mt-1 flex-shrink-0"
                                />
                                <div className="ml-3">
                                    <span className="font-bold text-slate-800">Grado {option.score}</span>
                                    <p className="text-sm text-slate-600">{option.text}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </main>

                <footer className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md" disabled={!selectedScore}>
                        Guardar Escala
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default mMRCModal;
