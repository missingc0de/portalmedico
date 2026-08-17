import React, { useState } from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (pastedText: string) => void;
  isImporting: boolean;
  title: string;
  description: string;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onConfirmImport, isImporting, title, description }) => {
  const [pastedText, setPastedText] = useState('');

  const handleConfirmClick = () => {
    if (!pastedText.trim()) {
      alert('Por favor, pegue el texto a importar.');
      return;
    }
    onConfirmImport(pastedText);
    // The parent component will handle closing the modal upon success/failure.
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="import-modal-title" className="text-xl font-semibold text-sky-700">{title}</h2>
          <button onClick={onClose} disabled={isImporting} className="text-slate-500 hover:text-slate-700 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </header>
        <main className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          <p className="text-sm text-slate-600 mb-4">{description}</p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Pegue aquí el texto..."
            className="w-full h-64 p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500"
            disabled={isImporting}
          />
        </main>
        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={isImporting} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm disabled:bg-slate-300">Cancelar</button>
          <button onClick={handleConfirmClick} disabled={isImporting} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md flex items-center disabled:bg-slate-400">
            {isImporting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isImporting ? 'Importando...' : 'Importar y Autocompletar'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ImportModal;

