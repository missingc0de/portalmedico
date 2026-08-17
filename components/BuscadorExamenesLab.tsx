
import React from 'react';

const copyToClipboard = (text: string, fieldName: string) => {
  if (!text) {
    alert(`No hay ${fieldName} para copiar.`);
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => alert(`${fieldName} copiado al portapapeles.`),
    () => alert('Error al copiar al portapapeles.')
  );
};

interface LabPortal {
  id: string;
  name: string;
  url: string;
  user: string;
  pass: string;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    buttonBg: string;
    buttonHoverBg: string;
    buttonRing: string;
  };
}

const labPortals: LabPortal[] = [
  {
    id: 'cyb',
    name: 'Laboratorio CYB',
    url: 'http://mvlabcyb.sistemadecontrol.cl:8080/LoginConveniosX.aspx',
    user: 'csanjuan',
    pass: 'csanjuan',
    colorClasses: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      buttonBg: 'bg-sky-600',
      buttonHoverBg: 'hover:bg-sky-700',
      buttonRing: 'focus:ring-sky-400',
    },
  },
  {
    id: 'imagensalud',
    name: 'Laboratorio ImagenSalud',
    url: 'https://resultados.laboratorioimagensalud.cl/Convenios.aspx',
    user: 'CMC SAN JUAN',
    pass: 'JUAN2023',
    colorClasses: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-800',
      buttonBg: 'bg-teal-600',
      buttonHoverBg: 'hover:bg-teal-700',
      buttonRing: 'focus:ring-teal-400',
    },
  },
  {
    id: 'hcoquimbo',
    name: 'Imágenes Hospital de Coquimbo',
    url: 'https://sscssl.synapsetimed.cl/Synapse',
    user: 'clinicoser',
    pass: 'Hospital123',
    colorClasses: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      buttonBg: 'bg-purple-600',
      buttonHoverBg: 'hover:bg-purple-700',
      buttonRing: 'focus:ring-purple-400',
    },
  },
  {
    id: 'sar_tb',
    name: 'Imágenes SAR Tierras Blancas',
    url: 'https://ris.chile.telemedicina.com/',
    user: 'sar.tierrasbl',
    pass: 'Informes2!',
    colorClasses: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      buttonBg: 'bg-amber-600',
      buttonHoverBg: 'hover:bg-amber-700',
      buttonRing: 'focus:ring-amber-400',
    },
  },
];


interface BuscadorExamenesLabProps {
  onBackToMenu: () => void;
}

const BuscadorExamenesLab: React.FC<BuscadorExamenesLabProps> = ({ onBackToMenu }) => {
  // FIX: Explicitly type LabCard as React.FC to correctly handle React's special `key` prop and resolve the TypeScript error.
  const LabCard: React.FC<{ portal: LabPortal }> = ({ portal }) => (
    <div className={`flex flex-col space-y-4 p-5 ${portal.colorClasses.bg} border ${portal.colorClasses.border} rounded-lg shadow-sm`}>
      <h3 className={`text-2xl font-bold ${portal.colorClasses.text} mb-3 text-center`}>{portal.name}</h3>
      
      <div>
        <h4 className="font-semibold text-slate-700 mb-2">Paso 1: Abrir Portal</h4>
        <a
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full inline-flex items-center justify-center px-6 py-3 ${portal.colorClasses.buttonBg} ${portal.colorClasses.buttonHoverBg} text-white font-bold rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 ${portal.colorClasses.buttonRing}`}
        >
          Abrir Portal {portal.name.split(' ')[0]}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div>
        <h4 className="font-semibold text-slate-700 mb-2">Paso 2: Copiar Credenciales</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <span className="font-semibold text-slate-700">Usuario:</span>
              <code className="ml-2 px-2 py-1 bg-slate-200 rounded-md text-sm text-slate-900">{portal.user}</code>
            </div>
            <button onClick={() => copyToClipboard(portal.user, `Usuario ${portal.name}`)} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md" aria-label={`Copiar usuario ${portal.name}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-md border">
            <div>
              <span className="font-semibold text-slate-700">Contraseña:</span>
              <code className="ml-2 px-2 py-1 bg-slate-200 rounded-md text-sm text-slate-900">{portal.pass}</code>
            </div>
            <button onClick={() => copyToClipboard(portal.pass, `Contraseña ${portal.name}`)} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md" aria-label={`Copiar contraseña ${portal.name}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Revisión de Exámenes</h2>
        <p className="text-slate-500 mt-2">Guía para acceder a los portales de resultados de laboratorios externos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {labPortals.map(portal => (
          <LabCard key={portal.id} portal={portal} />
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          type="button"
          onClick={onBackToMenu}
          className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Volver al menú principal"
        >
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};

export default BuscadorExamenesLab;

