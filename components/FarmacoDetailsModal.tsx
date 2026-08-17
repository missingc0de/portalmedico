
import React, { useState, useEffect } from 'react';
import { Farmaco } from '../types';
import { vademecumData, VademecumInfo } from '../data/vademecumData';

interface FarmacoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmaco: Farmaco | null;
}

const DetailSection: React.FC<{ title: string; content?: string }> = ({ title, content }) => {
    if (!content) return null;
    return (
        <div className="mb-4">
            <h3 className="text-md font-bold text-sky-800 border-b border-sky-200 pb-1 mb-2">{title}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line">{content}</p>
        </div>
    );
};

const FarmacoDetailsModal: React.FC<FarmacoDetailsModalProps> = ({ isOpen, onClose, farmaco }) => {
  const [drugInfo, setDrugInfo] = useState<VademecumInfo | null>(null);

  useEffect(() => {
    if (isOpen && farmaco) {
      const key = farmaco.medicamento.toLowerCase();
      const info = vademecumData[key] || null;
      setDrugInfo(info);
    } else {
      setDrugInfo(null);
    }
  }, [isOpen, farmaco]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="farmaco-details-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 id="farmaco-details-title" className="text-xl font-semibold text-sky-700">
            {farmaco ? `${farmaco.medicamento} - ${farmaco.dosificacion}` : 'Detalles del Fármaco'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-200"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {drugInfo ? (
            <div className="space-y-4">
                <DetailSection title="Mecanismo de Acción" content={drugInfo.mecanismoAccion} />
                <DetailSection title="Indicaciones Terapéuticas" content={drugInfo.indicaciones} />
                <DetailSection title="Posología" content={drugInfo.posologia} />
                <DetailSection title="Modo de Administración" content={drugInfo.modoAdministracion} />
                <DetailSection title="Contraindicaciones" content={drugInfo.contraindicaciones} />
                <DetailSection title="Advertencias y Precauciones" content={drugInfo.advertencias} />
                <DetailSection title="Insuficiencia Hepática" content={drugInfo.insuficienciaHepatica} />
                <DetailSection title="Insuficiencia Renal" content={drugInfo.insuficienciaRenal} />
                <DetailSection title="Interacciones" content={drugInfo.interacciones} />
                <DetailSection title="Embarazo" content={drugInfo.embarazo} />
                <DetailSection title="Lactancia" content={drugInfo.lactancia} />
                <DetailSection title="Efectos sobre la Capacidad de Conducir" content={drugInfo.efectosConduccion} />
                <DetailSection title="Reacciones Adversas" content={drugInfo.reaccionesAdversas} />
            </div>
          ) : (
            <p className="text-slate-500 text-center">No se encontró información detallada para este medicamento en la base de datos local.</p>
          )}
        </div>
        <footer className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FarmacoDetailsModal;

