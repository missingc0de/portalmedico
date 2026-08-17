
import React from 'react';
import { CertificateType, Profession } from '../types';

interface UnderConstructionProps {
  certificateType: CertificateType | Profession | string; 
  onBackToMenu: () => void;
}

const getCertificateName = (type: CertificateType | Profession | string): string => {
  switch (type) {
    case 'constanciaAtencion': return 'Constancia de Atención';
    case 'certificadoEscolar': return 'Certificado Escolar';
    case 'ordenExamenRadiologico': return 'Orden de Examen Radiológico';
    case 'ordenLaboratorio': return 'Orden de Laboratorio'; // Added
    case 'derivacionesPscv': return 'Derivaciones PSCV';
    // Clinical Record Templates
    case 'fichaControlPscv': return 'Ficha Control PSCV';
    case 'fichaPreingresoEcicep': return 'Ficha Preingreso ECICEP';
    case 'fichaIngresoEcicep': return 'Ficha Ingreso ECICEP';
    case 'fichaControlEcicep': return 'Ficha Control ECICEP';
    case 'fichaSeguimientoEcicep': return 'Ficha Seguimiento ECICEP';
    case 'fichaControlHipotiroidismo': return 'Ficha Control Hipotiroidismo';
    case 'fichaControlEpilepsia': return 'Ficha Control Epilepsia';
    case 'fichaControlArtrosis': return 'Ficha Control Artrosis';
    case 'fichaIngresoSm': return 'Ficha Ingreso Salud Mental';
    case 'fichaControlSm': return 'Ficha Control Salud Mental';
    case 'fichaControlSalaEra': return 'Ficha Control Sala ERA';
    case 'fichaControlSalaIra': return 'Ficha Control Sala IRA';
    case 'fichaControlNinoSano': return 'Ficha Control Niño Sano';
    case 'fichaControlNinoSano1Mes': return 'Ficha Control Niño Sano 1° Mes';
    case 'fichaControlNinoSano3Mes': return 'Ficha Control Niño Sano 3° Mes';
    case 'fichaControlNinoSano6Anos': return 'Ficha Control Niño Sano 6 Años';
    case 'fichaMorbilidad': return 'Ficha Morbilidad';
    case 'fichaPolichoque': return 'Ficha Polichoque';
    case 'fichaFondoOjo': return 'Ficha Fondo de Ojo';
    // Calculators
    case 'calculoLeches': return 'Cálculo de Leches';
    case 'dosisPediatria': return 'Dosis en Pediatría';
    case 'ajusteDosisErc': return 'Ajuste de Dosis en ERC';
    // Main Menu Sections
    case 'abordajes': return 'Abordajes Clínicos';
    case 'arsenalFarmacologico': return 'Arsenal Farmacológico';
    // Hospital Digital Templates
    case 'hdDermatologia': return 'Plantilla Hospital Digital: Dermatología';
    case 'hdDiabetes': return 'Plantilla Hospital Digital: Diabetes';
    case 'hdEndocrinologia': return 'Plantilla Hospital Digital: Endocrinología';
    case 'hdGeriatria': return 'Plantilla Hospital Digital: Geriatría';
    case 'hdReumatologia': return 'Plantilla Hospital Digital: Reumatología';
    case 'hojaDiariaRem': return 'Hoja Diaria REM';
    // Discipline Portals
    case 'medicina': return 'Portal de Medicina';
    case 'enfermeria': return 'Portal de Enfermería';
    case 'psicologia': return 'Portal de Psicología';
    case 'odontologia': return 'Portal de Odontología';
    case 'matroneria': return 'Portal de Matronería';
    case 'nutricion': return 'Portal de Nutrición';
    case 'tens': return 'Portal de TENS';
    case 'asistente_social': return 'Portal de Asistente Social';
    default: return `Documento (${type})`; 
  }
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ certificateType, onBackToMenu }) => {
  const name = getCertificateName(certificateType);
  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 w-full text-center">
      <svg className="mx-auto h-20 w-20 text-yellow-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 className="text-3xl font-semibold text-slate-700 mb-4">
        ¡En Construcción!
      </h2>
      <p className="text-slate-600 mb-8 text-lg">
        La funcionalidad para "{name}" aún no está disponible.
        <br />
        Estamos trabajando para traerla pronto.
      </p>
      <button
        onClick={onBackToMenu}
        className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
        aria-label="Volver al menú principal"
      >
        Volver
      </button>
    </div>
  );
};

export default UnderConstruction;
