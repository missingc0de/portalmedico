import React, { useState } from 'react';
import { X, HeartHandshake } from 'lucide-react';

interface ZaritModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScore: (score: number, interpretation: string) => void;
  initialScore?: number;
}

interface ZaritQuestion {
  id: number;
  text: string;
}

export const ZARIT_QUESTIONS: ZaritQuestion[] = [
  { id: 1, text: '¿Siente que su familiar le pide más ayuda de la que realmente necesita?' },
  { id: 2, text: '¿Siente que debido al tiempo que dedica a su familiar no tiene suficiente tiempo para usted?' },
  { id: 3, text: '¿Se siente estresado/a entre cuidar a su familiar y tratar de cumplir con otras responsabilidades familiares o laborales?' },
  { id: 4, text: '¿Siente vergüenza por la conducta de su familiar?' },
  { id: 5, text: '¿Se siente enojado/a o irritable cuando está cerca de su familiar?' },
  { id: 6, text: '¿Siente que su familiar afecta negativamente sus relaciones con otros miembros de la familia o amigos?' },
  { id: 7, text: '¿Tiene miedo por el futuro que le espera a su familiar?' },
  { id: 8, text: '¿Siente que su familiar depende de usted?' },
  { id: 9, text: '¿Se siente tenso/a o agobiado/a cuando está cerca de su familiar?' },
  { id: 10, text: '¿Siente que su salud se ha resentido a causa de su dedicación como cuidador/a?' },
  { id: 11, text: '¿Siente que no tiene tanta privacidad como le gustaría debido a su familiar?' },
  { id: 12, text: '¿Siente que su vida social se ha visto afectada negativamente por cuidar a su familiar?' },
  { id: 13, text: '¿Se siente incómodo/a para invitar amigos a su casa a causa de su familiar?' },
  { id: 14, text: '¿Siente que su familiar espera que usted lo cuide como si fuera la única persona de la que depende?' },
  { id: 15, text: '¿Siente que no tiene suficientes recursos económicos para los gastos del cuidado además de sus propios gastos?' },
  { id: 16, text: '¿Siente que no será capaz de cuidar a su familiar por mucho más tiempo?' },
  { id: 17, text: '¿Siente que ha perdido el control de su vida desde que comenzó la dependencia de su familiar?' },
  { id: 18, text: '¿Desearía poder encargar el cuidado de su familiar a otra persona?' },
  { id: 19, text: '¿Se siente inseguro/a acerca de qué hacer con su familiar?' },
  { id: 20, text: '¿Siente que debería hacer más por su familiar?' },
  { id: 21, text: '¿Siente que podría cuidar mejor a su familiar?' },
  { id: 22, text: 'Globalmente, ¿qué grado de sobrecarga siente por el hecho de cuidar a su familiar?' },
];

const ZARIT_OPTIONS = [
  { label: 'Nunca (0)', value: 0 },
  { label: 'Rara vez (1)', value: 1 },
  { label: 'A veces (2)', value: 2 },
  { label: 'Bastante a menudo (3)', value: 3 },
  { label: 'Casi siempre (4)', value: 4 },
];

export const ZaritModal: React.FC<ZaritModalProps> = ({
  isOpen,
  onClose,
  onApplyScore,
}) => {
  // Estado local para las 22 respuestas (por defecto 0: Nunca)
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    for (let i = 1; i <= 22; i++) {
      init[i] = 0;
    }
    return init;
  });

  if (!isOpen) return null;

  const totalScore = Object.values(answers).reduce((acc, curr) => acc + (curr || 0), 0);

  const getInterpretation = (score: number) => {
    if (score <= 46) {
      return {
        label: 'Sin sobrecarga',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        detail: 'Puntaje ≤ 46: Ausencia de sobrecarga en el cuidador principal.'
      };
    } else if (score <= 55) {
      return {
        label: 'Sobrecarga leve',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        detail: 'Puntaje 47 - 55: Sobrecarga leve. Sugiere medidas de apoyo y autocuidado.'
      };
    } else {
      return {
        label: 'Sobrecarga intensa',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        detail: 'Puntaje ≥ 56: Sobrecarga intensa. Requiere intervención activa del equipo PADDS y relevo de tareas.'
      };
    }
  };

  const interpretation = getInterpretation(totalScore);

  const handleSelectOption = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSetAll = (val: number) => {
    const updated: Record<number, number> = {};
    for (let i = 1; i <= 22; i++) {
      updated[i] = val;
    }
    setAnswers(updated);
  };

  const handleConfirm = () => {
    onApplyScore(totalScore, interpretation.label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Escala de Sobrecarga del Cuidador (Zarit)
              </h2>
              <p className="text-xs text-slate-500">
                Instrumento de 22 ítems para evaluar el impacto y sobrecarga del cuidador principal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Puntaje e Interpretación en Vivo */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Puntaje Total:</span>
            <span className="text-2xl font-black text-indigo-700">{totalScore}</span>
            <span className="text-xs text-slate-500">/ 88 puntos</span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${interpretation.badgeColor}`}>
              {interpretation.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetAll(0)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
            >
              Marcar todo: Nunca (0)
            </button>
          </div>
        </div>

        {/* Lista de Preguntas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {ZARIT_QUESTIONS.map((q) => {
            const currentVal = answers[q.id] ?? 0;
            return (
              <div
                key={q.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-200 transition-colors"
              >
                <p className="text-sm font-semibold text-slate-800 mb-2.5">
                  <span className="text-indigo-600 mr-1.5 font-bold">{q.id}.</span>
                  {q.text}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {ZARIT_OPTIONS.map((opt) => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.value)}
                        className={`px-2.5 py-2 text-xs rounded-lg border font-medium text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-700 text-white font-bold shadow-xs scale-[1.02]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de modal con acciones */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            {interpretation.detail}
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Aplicar Zarit: {totalScore} pts ({interpretation.label})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaritModal;
