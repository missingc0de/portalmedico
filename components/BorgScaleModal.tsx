
import React from 'react';

interface BorgScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (borgValue: string) => void;
}

const borgOptions = [
  { value: '0', label: '0 - Reposo total / Sin disnea' },
  { value: '0.5', label: '0.5 - Muy, muy ligero (apenas perceptible)' },
  { value: '1', label: '1 - Muy ligero' },
  { value: '2', label: '2 - Ligero (suave)' },
  { value: '3', label: '3 - Moderado' },
  { value: '4', label: '4 - Un poco pesado' },
  { value: '5', label: '5 - Pesado (fuerte)' },
  { value: '7', label: '7 - Muy pesado (muy fuerte)' },
  { value: '9', label: '9 - Muy, muy pesado (casi máximo)' },
  { value: '10', label: '10 - Máximo / Agotamiento' },
];

const BorgScaleModal: React.FC<BorgScaleModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[120] p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <header className="p-4 bg-emerald-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg uppercase tracking-tighter">Escala de Borg Modificada (0-10)</h3>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition-colors text-2xl leading-none">&times;</button>
        </header>
        <div className="p-4 space-y-2">
          <p className="text-xs text-slate-500 mb-3 italic">Seleccione el nivel de esfuerzo o disnea percibido por el paciente:</p>
          {borgOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onSave(`Escala de Borg: ${opt.label}.`);
                onClose();
              }}
              className="w-full text-left p-3 hover:bg-emerald-50 border border-slate-100 rounded-xl transition-all font-medium text-slate-700 text-sm flex justify-between items-center group"
            >
              <span>{opt.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
          ))}
        </div>
        <footer className="p-3 bg-slate-50 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase">Cerrar</button>
        </footer>
      </div>
    </div>
  );
};

export default BorgScaleModal;

