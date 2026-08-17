import React, { useState, useMemo } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  items: { id: string; label: string; points: number }[];
}

const categories: Category[] = [
  {
    id: 'sm',
    name: 'Salud Mental y Psiquiatría',
    icon: 'ðŸ§ ',
    items: [
      { id: 'sm_drogas', label: 'Consumo perjudicial o dependiente de droga', points: 1 },
      { id: 'sm_alcohol', label: 'Consumo perjudicial o dependiente de alcohol', points: 1 },
      { id: 'sm_depresion_grave', label: 'Depresión Grave / Ideación Suicida', points: 2 },
      { id: 'sm_depresion_leve', label: 'Depresión leve o moderada', points: 2 },
      { id: 'sm_esquizofrenia', label: 'Esquizofrenia', points: 2 },
      { id: 'sm_sueno', label: 'Trastornos del Sueño', points: 1 },
      { id: 'sm_violencia', label: 'Maltrato / Violencia Intrafamiliar', points: 2 },
      { id: 'sm_ansiedad', label: 'Trastorno de Ansiedad', points: 1 },
      { id: 'sm_personalidad', label: 'Trastorno de la personalidad', points: 1 },
      { id: 'sm_tabaquismo', label: 'Tabaquismo', points: 1 },
    ]
  },
  {
    id: 'metabolica',
    name: 'Enfermedades Metabólicas',
    icon: 'ðŸ§ª',
    items: [
      { id: 'met_dm', label: 'Diabetes mellitus', points: 2 },
      { id: 'met_dlp', label: 'Dislipidemias', points: 1 },
      { id: 'met_obesidad', label: 'Obesidad', points: 1 },
      { id: 'met_tiroides', label: 'Trastornos Tiroídeos', points: 1 },
      { id: 'met_hiperuricemia', label: 'Hiperuricemia (Gota)', points: 1 },
    ]
  },
  {
    id: 'cv',
    name: 'Enfermedades Cardiovasculares',
    icon: '❤️',
    items: [
      { id: 'cv_hta', label: 'Hipertensión Arterial', points: 1 },
      { id: 'cv_iam', label: 'Enfermedad CV / IAM / Cardiopatía Isquémica', points: 2 },
      { id: 'cv_fa', label: 'Fibrilación Auricular / Flutter', points: 2 },
      { id: 'cv_ic', label: 'Insuficiencia Cardíaca', points: 2 },
      { id: 'cv_acv', label: 'Enfermedad Cerebrovascular / ACV / AVE', points: 2 },
      { id: 'cv_tia', label: 'Isquemia Cerebral Transitoria (TIA)', points: 2 },
      { id: 'cv_arritmia', label: 'Arritmia cardiaca / Taquicardia paroxística', points: 1 },
    ]
  },
  {
    id: 'resp',
    name: 'Enfermedades Respiratorias',
    icon: 'ðŸ«',
    items: [
      { id: 'resp_asma', label: 'Asma', points: 1 },
      { id: 'resp_epoc', label: 'EPOC', points: 2 },
    ]
  },
  {
    id: 'renal',
    name: 'Renales y Urológicas',
    icon: 'ðŸ§¬',
    items: [
      { id: 'ren_erc', label: 'Enfermedad renal crónica', points: 2 },
      { id: 'ren_erc_av', label: 'Enfermedad renal crónica avanzada', points: 2 },
      { id: 'ren_hprostatica', label: 'Hipertrofia prostática benigna', points: 1 },
    ]
  },
  {
    id: 'musculo',
    name: 'Músculo Esqueléticas',
    icon: 'ðŸ¦´',
    items: [
      { id: 'mus_ar', label: 'Artritis reumatoídea', points: 2 },
      { id: 'mus_artrosis', label: 'Artrosis (cadera, rodilla u otro)', points: 1 },
      { id: 'mus_fibro', label: 'Dolor neuropático / Fibromialgia', points: 1 },
      { id: 'mus_lupus', label: 'Lupus', points: 2 },
    ]
  },
  {
    id: 'neuro',
    name: 'Enfermedades Neurológicas',
    icon: 'ðŸ§ ',
    items: [
      { id: 'neu_demencia', label: 'Demencia', points: 2 },
      { id: 'neu_epilepsia', label: 'Epilepsia', points: 2 },
      { id: 'neu_parkinson', label: 'Parkinsonismo', points: 2 },
      { id: 'neu_retraso', label: 'Retraso Mental', points: 2 },
    ]
  },
  {
    id: 'otros',
    name: 'Social, Funcional y Otros',
    icon: 'ðŸ¥',
    items: [
      { id: 'soc_econ', label: 'Dificultades socioeconómicas o psicosociales', points: 1 },
      { id: 'func_limit', label: 'Función limitada / discapacidad / dependencia', points: 2 },
      { id: 'onco_malignidad', label: 'Malignidad (Cáncer activo)', points: 2 },
      { id: 'derma_ulcera', label: 'Úlcera Crónica de la Piel', points: 2 },
      { id: 'inf_vih', label: 'Infección por VIH / SIDA', points: 2 },
    ]
  }
];

interface EcicepRiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (result: string) => void;
}

const EcicepRiskCalculatorModal: React.FC<EcicepRiskCalculatorModalProps> = ({ isOpen, onClose, onCalculate }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const totalPoints = useMemo(() => {
    let pts = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (selectedItems.has(item.id)) {
          pts += item.points;
        }
      });
    });
    return pts;
  }, [selectedItems]);

  const stratificationResult = useMemo(() => {
    if (totalPoints === 0) return { label: 'G0 Sin Riesgo', code: '' };
    if (totalPoints <= 2) return { label: 'G1 Riesgo Bajo', code: 'G1' };
    if (totalPoints <= 4) return { label: 'G2 Riesgo Moderado', code: 'G2' };
    return { label: 'G3 Riesgo Alto', code: 'G3' };
  }, [totalPoints]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleClean = () => setSelectedItems(new Set());

  const handleApply = () => {
    if (stratificationResult.code) {
      onCalculate(stratificationResult.code);
      onClose();
    } else {
      alert("Seleccione al menos una condición para estratificar.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110] p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-sky-800">Estratificación de Riesgo ECICEP</h2>
            <p className="text-slate-500 text-sm">Seleccione las patologías y factores de riesgo del paciente.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="flex flex-col items-center mb-8">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total de puntos</div>
            {/* FIX: Changed totalScore to totalPoints to match the memoized value definition */}
            <div className="text-6xl font-black text-sky-600 mb-2">{totalPoints}</div>
            <div className={`px-6 py-2 rounded-full text-lg font-bold shadow-sm ${totalPoints === 0 ? 'bg-slate-200 text-slate-600' : totalPoints <= 2 ? 'bg-green-100 text-green-700 border border-green-200' : totalPoints <= 4 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {stratificationResult.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                  <span className="text-2xl bg-sky-50 p-2 rounded-lg">{cat.icon}</span>
                  <h3 className="font-bold text-slate-700 uppercase text-sm tracking-tight">{cat.name}</h3>
                </div>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <label key={item.id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedItems.has(item.id) ? 'bg-sky-50 border-sky-100' : 'hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleToggle(item.id)}
                        className="mt-1 h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <div className="flex-grow">
                        <span className={`text-sm ${selectedItems.has(item.id) ? 'text-sky-800 font-medium' : 'text-slate-600'}`}>{item.label}</span>
                        {item.points >= 2 && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Complejo</span>}
                      </div>
                      <span className="text-xs font-bold text-slate-400">{item.points} pts</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="p-6 border-t border-slate-200 bg-white rounded-b-2xl flex justify-between items-center">
          <button onClick={handleClean} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors uppercase text-sm">
            LIMPIAR TODO
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors">
              CANCELAR
            </button>
            <button
              onClick={handleApply}
              className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 transition-all transform hover:scale-105"
            >
              APLICAR ESTRATIFICACIÓN
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EcicepRiskCalculatorModal;
