import React, { useState, useMemo } from 'react';

interface ScoreRMNModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: string) => void;
}

const scoreOptions = {
    frecuenciaCardiaca: [
        { label: '< 120 lpm', value: 0 },
        { label: '120-150 lpm', value: 1 },
        { label: '> 150 lpm', value: 2 },
    ],
    frecuenciaRespiratoria: [
        { label: '< 30 rpm', value: 0 },
        { label: '31-45 rpm', value: 1 },
        { label: '> 45 rpm', value: 2 },
    ],
    sibilancias: [
        { label: 'No', value: 0 },
        { label: 'Espiratorias', value: 1 },
        { label: 'Inspiratorias y espiratorias', value: 2 },
    ],
    retracciones: [
        { label: 'No', value: 0 },
        { label: 'Subcostal (+)', value: 1 },
        { label: 'Generalizadas (++)', value: 2 },
    ]
};


const ScoreRMNModal: React.FC<ScoreRMNModalProps> = ({ isOpen, onClose, onSave }) => {
  const [scores, setScores] = useState({
    fc: -1,
    fr: -1,
    sibilancias: -1,
    retracciones: -1,
  });

  const totalScore = useMemo(() => {
    const { fc, fr, sibilancias, retracciones } = scores;
    if (fc === -1 || fr === -1 || sibilancias === -1 || retracciones === -1) {
      return null;
    }
    return fc + fr + sibilancias + retracciones;
  }, [scores]);

  const classification = useMemo(() => {
    if (totalScore === null) return 'Incompleto';
    if (totalScore <= 5) return 'Obstrucción Leve';
    if (totalScore >= 6 && totalScore <= 9) return 'Obstrucción Moderada';
    if (totalScore >= 10) return 'Obstrucción Severa';
    return '';
  }, [totalScore]);

  const handleSelect = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };
  
  const handleSave = () => {
      if (totalScore === null) {
          alert("Por favor, seleccione una opción para cada categoría.");
          return;
      }
      onSave(`Score de Tal: ${totalScore} (${classification})`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-semibold text-sky-700">Calculadora Score RMN (Score de Tal modificado)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div className="space-y-4">
              {Object.entries({
                  FC: { options: scoreOptions.frecuenciaCardiaca, stateKey: 'fc' as const },
                  FR: { options: scoreOptions.frecuenciaRespiratoria, stateKey: 'fr' as const },
                  Sibilancias: { options: scoreOptions.sibilancias, stateKey: 'sibilancias' as const },
                  Retracciones: { options: scoreOptions.retracciones, stateKey: 'retracciones' as const },
              }).map(([categoryName, data]) => (
                <div key={categoryName} className="p-3 border border-slate-200 rounded-lg">
                    <h4 className="text-md font-semibold text-slate-700 mb-2">{categoryName}</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.options.map(option => (
                           <button
                             key={option.value}
                             onClick={() => handleSelect(data.stateKey, option.value)}
                             className={`flex-1 px-3 py-2 text-sm rounded-md shadow-sm transition-all duration-150 ${
                               scores[data.stateKey] === option.value
                                 ? 'bg-sky-600 text-white font-semibold ring-2 ring-sky-400'
                                 : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                             }`}
                           >
                             {option.label} ({option.value} pts)
                           </button>
                        ))}
                    </div>
                </div>
              ))}
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center gap-3">
          <div className="text-lg font-semibold">
              <span className="text-slate-600">Puntaje Total: </span>
              <span className={`px-3 py-1 rounded-full text-white ${totalScore === null ? 'bg-slate-400' : 'bg-sky-600'}`}>
                {totalScore !== null ? `${totalScore} (${classification})` : '...'}
              </span>
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
                Cancelar
             </button>
             <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:bg-slate-300" disabled={totalScore === null}>
                Guardar Score
             </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ScoreRMNModal;
