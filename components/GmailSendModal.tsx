import React, { useState, useEffect } from 'react';

interface GmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, body: string) => void;
  isSending: boolean;
  patientName: string;
}

const GmailSendModal: React.FC<GmailSendModalProps> = ({ isOpen, onClose, onSend, isSending, patientName }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Pre-fill fields when the modal opens
      setSubject(`Constancia de Atención - ${patientName}`);
      setBody(`Estimado/a,\n\nAdjunto encontrará la constancia de atención solicitada para ${patientName}.\n\nAtentamente,\n[Su Nombre]`);
      setTo(''); // Clear recipient field for each new send
    }
  }, [isOpen, patientName]);

  if (!isOpen) return null;

  const handleSendClick = () => {
    if (!to.trim() || !subject.trim()) {
      alert('Por favor, complete los campos "Destinatario" y "Asunto".');
      return;
    }
    onSend(to, subject, body);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmail-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 id="gmail-modal-title" className="text-xl font-semibold text-sky-700">Enviar Constancia por Gmail</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </header>
        <main className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4">
          <div>
            <label htmlFor="emailTo" className="block text-sm font-medium text-slate-700 mb-1">Destinatario (Para):</label>
            <input type="email" id="emailTo" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" placeholder="ejemplo@correo.com" required />
          </div>
          <div>
            <label htmlFor="emailSubject" className="block text-sm font-medium text-slate-700 mb-1">Asunto:</label>
            <input type="text" id="emailSubject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="emailBody" className="block text-sm font-medium text-slate-700 mb-1">Cuerpo del Mensaje:</label>
            <textarea id="emailBody" value={body} onChange={(e) => setBody(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" rows={6}></textarea>
            <p className="text-xs text-slate-500 mt-1">El PDF se adjuntará automáticamente.</p>
          </div>
        </main>
        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSending} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">Cancelar</button>
          <button onClick={handleSendClick} disabled={isSending} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md flex items-center disabled:bg-slate-400">
            {isSending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isSending ? 'Enviando...' : 'Enviar Correo'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GmailSendModal;
