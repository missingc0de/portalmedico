
import React from 'react';

interface UrgenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const urgenciasEntries = [
  { situation: 'Paro Cardiorrespiratorio (PCR) Adulto', action: 'RCP 30:2, DEA, O2, Adrenalina 1mg EV c/3-5 min. SAMU (131).' },
  { situation: 'Anafilaxia Severa', action: 'Adrenalina 0.3-0.5mg IM (muslo anterolateral). O2, Salbutamol NBZ. Clorfenamina + Hidrocortisona EV. SAMU (131).' },
  { situation: 'Crisis Hipoglicémica Severa (Glasgow < 8)', action: 'Glucosa 25g EV (50ml SG30%). Si no hay vía EV: Glucagón 1mg IM/SC. SAMU (131).' },
  { situation: 'Convulsión Activa (>5 min)', action: 'Asegurar vía aérea. Lorazepam 0.1 mg/kg EV lento (max 4mg) o Midazolam 0.2 mg/kg IM/IN (max 10mg). SAMU (131).' },
  { situation: 'ACV Agudo (Escala FAST)', action: 'Asegurar vía aérea, O2 SOS, Glicemia capilar. Posición semisentado. Activar Código ACV. SAMU (131).' },
  { situation: 'Crisis Hipertensiva (Emergencia)', action: 'Captopril 25mg SL (si PA > 180/120 con daño órgano blanco). Monitorizar PA. SAMU (131) si no cede o hay D.O.B.'},
  { situation: 'Edema Pulmonar Agudo Cardiogénico', action: 'M.O.N.A (Morfina EV, O2 alto flujo, Nitroglicerina SL/EV, AAS). Furosemida EV. SAMU (131).'},
];


const UrgenciasModal: React.FC<UrgenciasModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="urgencias-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-red-50">
          <h2 id="urgencias-modal-title" className="text-xl font-semibold text-red-700">Información de Urgencias</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        <div className="p-5 overflow-y-auto custom-scrollbar flex-grow">
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4">
            <strong>¡ATENCIÓN!</strong> Esta es una guía rápida y no reemplaza el juicio clínico ni los protocolos institucionales completos. Active siempre la cadena de ayuda (SAMU 131) según corresponda.
          </p>
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-700 uppercase bg-red-100">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Situación de Urgencia
                </th>
                <th scope="col" className="px-4 py-3">
                  Manejo Inicial / Protocolo Rápido
                </th>
              </tr>
            </thead>
            <tbody>
              {urgenciasEntries.map((entry, index) => (
                <tr key={index} className={`border-b ${index === urgenciasEntries.length - 1 ? 'border-transparent' : 'border-slate-200'} hover:bg-red-50 transition-colors`}>
                  <td className="px-4 py-3 font-medium text-slate-900 align-top">
                    {entry.situation}
                  </td>
                  <td className="px-4 py-3 whitespace-pre-line align-top">
                    {entry.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="p-4 border-t border-slate-200 bg-red-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default UrgenciasModal;

