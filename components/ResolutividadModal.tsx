import React from 'react';

interface ResolutividadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string[];
  notPerformedTitle: string;
  notPerformedContent: string[];
}

const ResolutividadModal: React.FC<ResolutividadModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  content,
  notPerformedTitle,
  notPerformedContent
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolutividad-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 id="resolutividad-modal-title" className="text-xl font-semibold text-sky-700">{title}</h2>
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
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4">
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {content[0]}
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 pl-4">
            {content.slice(1).map((item, index) => (
              <li key={`content-${index}`}>{item.startsWith('- ') ? item.substring(2) : item}</li>
            ))}
          </ul>
          
          <h3 className="text-md font-semibold text-sky-600 pt-3">{notPerformedTitle}</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 pl-4">
            {notPerformedContent.map((item, index) => (
              <li key={`not-performed-${index}`}>{item.startsWith('- ') ? item.substring(2) : item}</li>
            ))}
          </ul>
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

export default ResolutividadModal;

