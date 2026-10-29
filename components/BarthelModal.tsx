import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

export interface BarthelDetailItem {
  id: string;
  activity: string;
  label: string;
  score: number;
}

interface BarthelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScore: (score: number, interpretation: string, details: BarthelDetailItem[]) => void;
  initialScore?: number;
}

interface BarthelQuestion {
  id: string;
  activity: string;
  title: string;
  options: { label: string; score: number }[];
}

export const BARTHEL_QUESTIONS: BarthelQuestion[] = [
  {
    id: 'comer',
    activity: 'Comer',
    title: '1. Comer / Alimentación',
    options: [
      { label: 'Totalmente independiente (capaz de usar cualquier instrumento necesario)', score: 10 },
      { label: 'Necesita ayuda para cortar la carne, extender mantequilla, etc.', score: 5 },
      { label: 'Dependiente (necesita ser alimentado)', score: 0 },
    ],
  },
  {
    id: 'lavarse',
    activity: 'Lavarse / Baño',
    title: '2. Lavarse / Baño',
    options: [
      { label: 'Independiente (entra y sale solo del baño, se lava completamente)', score: 5 },
      { label: 'Dependiente (necesita alguna ayuda o supervisión)', score: 0 },
    ],
  },
  {
    id: 'vestirse',
    activity: 'Vestirse',
    title: '3. Vestirse',
    options: [
      { label: 'Independiente (capaz de ponerse y quitarse la ropa, abotonarse, atarse cordones)', score: 10 },
      { label: 'Necesita ayuda (hace al menos la mitad del trabajo en un tiempo razonable)', score: 5 },
      { label: 'Dependiente', score: 0 },
    ],
  },
  {
    id: 'arreglarse',
    activity: 'Arreglarse / Cuidado personal',
    title: '4. Arreglarse / Cuidado personal',
    options: [
      { label: 'Independiente (se lava la cara, las manos, se peina, se afeita, se maquilla)', score: 5 },
      { label: 'Dependiente (necesita alguna ayuda)', score: 0 },
    ],
  },
  {
    id: 'deposiciones',
    activity: 'Deposiciones (continencia fecal)',
    title: '5. Deposiciones (continencia fecal)',
    options: [
      { label: 'Continente (ningún episodio de incontinencia)', score: 10 },
      { label: 'Accidente ocasional (máximo 1 episodio/semana o necesita ayuda para enemas)', score: 5 },
      { label: 'Incontinente (más de un episodio semanal)', score: 0 },
    ],
  },
  {
    id: 'miccion',
    activity: 'Micción (continencia urinaria)',
    title: '6. Micción (continencia urinaria)',
    options: [
      { label: 'Continente (seco día y noche, capaz de cuidar de su sonda si la lleva)', score: 10 },
      { label: 'Accidente ocasional (máximo 1 episodio en 24 horas)', score: 5 },
      { label: 'Incontinente', score: 0 },
    ],
  },
  {
    id: 'retrete',
    activity: 'Uso del retrete',
    title: '7. Uso del retrete / Inodoro',
    options: [
      { label: 'Independiente (entra, sale, se limpia, se viste, usa papel sin ayuda)', score: 10 },
      { label: 'Necesita ayuda (capaz de manejarse con pequeña ayuda o sostén)', score: 5 },
      { label: 'Dependiente', score: 0 },
    ],
  },
  {
    id: 'traslado',
    activity: 'Traslado cama-sillón',
    title: '8. Traslado cama - sillón',
    options: [
      { label: 'Independiente (se levanta, se sienta, pasa de la cama al sillón sin ayuda)', score: 15 },
      { label: 'Mínima ayuda (física o verbal de 1 persona)', score: 10 },
      { label: 'Gran ayuda (capaz de sentarse, pero necesita mucha ayuda de 1 o 2 personas)', score: 5 },
      { label: 'Dependiente (incapaz de mantenerse sentado)', score: 0 },
    ],
  },
  {
    id: 'deambulacion',
    activity: 'Deambulación',
    title: '9. Deambulación / Desplazamiento',
    options: [
      { label: 'Independiente (camina al menos 50 metros solo o con bastón/andador)', score: 15 },
      { label: 'Necesita ayuda (física o verbal de 1 persona para caminar 50 metros)', score: 10 },
      { label: 'Independiente en silla de ruedas (se desplaza 50m propulsando la silla)', score: 5 },
      { label: 'Dependiente (inmóvil o requiere más de una persona)', score: 0 },
    ],
  },
  {
    id: 'escaleras',
    activity: 'Subir y bajar escaleras',
    title: '10. Subir y bajar escaleras',
    options: [
      { label: 'Independiente (sube y baja un tramo de escaleras sin ayuda ni supervisión)', score: 10 },
      { label: 'Necesita ayuda (física o supervisión verbal)', score: 5 },
      { label: 'Dependiente (incapaz de salvar escalones)', score: 0 },
    ],
  },
];

export const BarthelModal: React.FC<BarthelModalProps> = ({
  isOpen,
  onClose,
  onApplyScore,
}) => {
  const [selectedScores, setSelectedScores] = useState<Record<string, number>>({
    comer: 10,
    lavarse: 5,
    vestirse: 10,
    arreglarse: 5,
    deposiciones: 10,
    miccion: 10,
    retrete: 10,
    traslado: 15,
    deambulacion: 15,
    escaleras: 10,
  });

  if (!isOpen) return null;

  const totalScore = Object.values(selectedScores).reduce((acc, curr) => acc + curr, 0);

  const getInterpretation = (score: number) => {
    if (score === 100) return 'Independencia total';
    if (score >= 60) return 'Dependencia leve';
    if (score >= 40) return 'Dependencia moderada';
    if (score >= 20) return 'Dependencia severa';
    return 'Dependencia total';
  };

  const handleSelectOption = (questionId: string, score: number) => {
    setSelectedScores(prev => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleConfirm = () => {
    const interpretation = getInterpretation(totalScore);
    const details: BarthelDetailItem[] = BARTHEL_QUESTIONS.map(q => {
      const currentScore = selectedScores[q.id] ?? 0;
      const matchedOption = q.options.find(opt => opt.score === currentScore);
      return {
        id: q.id,
        activity: q.activity,
        label: matchedOption ? matchedOption.label : '',
        score: currentScore,
      };
    });

    onApplyScore(totalScore, interpretation, details);
    onClose();
  };

  const interpretation = getInterpretation(totalScore);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Encabezado */}
        <header className="px-5 py-3.5 bg-gradient-to-r from-sky-700 to-sky-800 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold tracking-tight">Calculadora: Índice de Barthel</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Resumen del puntaje */}
        <div className="px-5 py-3 bg-sky-50 border-b border-sky-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Puntaje Total:</span>
            <div className="text-2xl font-black text-sky-800">{totalScore} <span className="text-sm font-semibold text-slate-500">/ 100</span></div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel de Dependencia:</span>
            <div className="text-sm font-bold text-sky-900 bg-sky-100/80 px-3 py-1 rounded-full border border-sky-200">
              {interpretation}
            </div>
          </div>
        </div>

        {/* Listado de preguntas */}
        <main className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-4 custom-scrollbar">
          {BARTHEL_QUESTIONS.map(q => (
            <div key={q.id} className="pt-3 first:pt-0">
              <p className="text-xs font-bold text-slate-800 mb-2">{q.title}</p>
              <div className="space-y-1.5">
                {q.options.map(opt => {
                  const isChecked = selectedScores[q.id] === opt.score;
                  return (
                    <label
                      key={opt.label}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-sky-50/80 border-sky-400 text-sky-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={q.id}
                          checked={isChecked}
                          onChange={() => handleSelectOption(q.id, opt.score)}
                          className="h-3.5 w-3.5 text-sky-600 focus:ring-sky-500"
                        />
                        <span>{opt.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-2">
                        {opt.score} pts
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Aplicar Puntaje ({totalScore} pts)
          </button>
        </footer>
      </div>
    </div>
  );
};

export default BarthelModal;
