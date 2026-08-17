import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';

interface EmailGeneratorProps {
  loggedInUser: User | null;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ loggedInUser }) => {
  const [specialty, setSpecialty] = useState('DERMATOLOGÍA');
  const [modality, setModality] = useState('no presencial');
  const [patientName, setPatientName] = useState('');
  const [patientRut, setPatientRut] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');

  const specialtyOptions = ['DERMATOLOGÍA', 'DIABETOLOGÍA', 'ENDOCRINOLOGÍA', 'NEFROLOGÍA', 'REUMATOLOGÍA', 'GERIATRÍA'];
  const modalityOptions = ['presencial', 'no presencial'];

  useEffect(() => {
    const tratante = loggedInUser?.fullName || '[Su Nombre]';
    const cesfam = loggedInUser?.cesfam || '[CESFAM no especificado]';
    const emailBody = `Estimado: Solicito hora para tele-${specialty.toLowerCase()} ${modality} para subir caso de interconsulta a hospital digital de paciente.

CÉLULA: ${specialty}
NOMBRE PACIENTE: ${patientName}
RUT: ${patientRut}
FONO CONTACTO: ${patientPhone}
TRATANTE: ${tratante} (${cesfam})

De antemano muchas gracias, saludos cordiales.`;
    setGeneratedEmail(emailBody);
  }, [specialty, modality, patientName, patientRut, patientPhone, loggedInUser]);

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail)
      .then(() => alert('Correo copiado al portapapeles.'))
      .catch(err => alert('Error al copiar el texto.'));
  };

  const handleReset = () => {
    setSpecialty('DERMATOLOGÍA');
    setModality('no presencial');
    setPatientName('');
    setPatientRut('');
    setPatientPhone('');
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="border-b border-slate-150 pb-2 mb-3 w-full">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generador de Correos</h3>
      </div>
      <div className="flex flex-col gap-3 flex-grow">

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email-specialty" className="block text-xs font-semibold text-slate-800 mb-1">Especialidad</label>
              <select
                id="email-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs text-slate-700"
              >
                {specialtyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="email-modality" className="block text-xs font-semibold text-slate-800 mb-1">Modalidad</label>
              <select
                id="email-modality"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-xs text-slate-700"
              >
                {modalityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <FormField
            label="Nombre"
            id="email-patient-name"
            name="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nombre completo"
            inputClassName="text-xs py-1.5 px-3"
            labelClassName="block text-xs font-semibold text-slate-800 mb-1"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Fono Contacto"
              id="email-patient-phone"
              name="patientPhone"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="9 1234 5678"
              inputClassName="text-xs py-1.5 px-3"
              labelClassName="block text-xs font-semibold text-slate-800 mb-1"
            />
            <RutInput
              label="RUT"
              id="email-patient-rut"
              name="patientRut"
              value={patientRut}
              onChange={setPatientRut}
              placeholder="12.345.678-9"
              inputClassName="text-xs py-1.5 px-3"
              labelClassName="block text-xs font-semibold text-slate-800 mb-1"
            />
          </div>
        </div>

        <div className="flex flex-col flex-grow min-h-[200px] mt-2">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="email-output" className="block text-xs font-semibold text-slate-800">Correo Generado</label>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleCopy}
                disabled={!generatedEmail}
                className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>
          <textarea
            id="email-output"
            value={generatedEmail}
            readOnly
            className="w-full flex-grow p-3 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-xs text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator;

