
import React from 'react';

interface PhoneDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const phoneEntries = [
  { name: 'SAMU (Emergencias Médicas)', number: '131' },
  { name: 'Carabineros de Chile (Policía)', number: '133' },
  { name: 'Bomberos de Chile', number: '132' },
  { name: 'Ambulancia CESFAM San Juan', number: '51 2 XXXXXX' }, 
  { name: 'SAPU Tierras Blancas', number: '51 2 YYYYYY' },
];

const PhoneDirectoryModal: React.FC<PhoneDirectoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-directory-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 id="phone-directory-modal-title" className="text-xl font-semibold text-sky-700">Directorio Telefónico</h2>
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
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Institución / Contacto
                </th>
                <th scope="col" className="px-6 py-3">
                  Número
                </th>
              </tr>
            </thead>
            <tbody>
              {phoneEntries.map((entry, index) => (
                <tr key={index} className={`border-b ${index === phoneEntries.length - 1 ? 'border-transparent' : 'border-slate-200'} hover:bg-slate-50 transition-colors`}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {entry.name}
                  </td>
                  <td className="px-6 py-4">
                    <a href={`tel:${entry.number.replace(/\s/g, '')}`} className="text-sky-600 hover:text-sky-700 hover:underline">
                      {entry.number}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           <p className="text-xs text-slate-500 mt-4 px-1">
            Nota: Los números de CESFAM San Juan y SAPU Tierras Blancas son ejemplos. Reemplace con los números correctos.
          </p>
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

export default PhoneDirectoryModal;

