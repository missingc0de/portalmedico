import React, { useState, useCallback, useEffect } from 'react';
import { FichaGrupalDiabetesFormData, User, FormStatus } from '../types';
import FormField from './FormField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import RutInput from './RutInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaGrupalDiabetesFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  edad: '',
  sexo: '',
  antecedentesMedicos: 'DM2',
  medicacionActual: '',
  hba1c: '',
  perfilHemoglucotest: '',
  planMantenerTratamiento: false,
  planAltaGrupal: false,
  planAgendarHoraMedico: false,
  planAsistirProximoEncuentro: false,
  planSolicitarHba1c: false,
  planSolicitarNuevoHgt: false,
};

const planCheckboxesConfig = [
  { key: 'planMantenerTratamiento', label: 'Mantener tratamiento', text: '- Se indica mantener tratamiento farmacológico actual.' },
  { key: 'planAltaGrupal', label: 'Alta de grupal', text: '- Se da de alta de actividad grupal por criterios cumplidos.' },
  { key: 'planAgendarHoraMedico', label: 'Agendar hora para control cardiovascular con médico', text: '- Se indica agendar hora para control cardiovascular con médico.' },
  { key: 'planAsistirProximoEncuentro', label: 'Asistir a próximo encuentro del grupal', text: '- Se refuerza la importancia de asistir al próximo encuentro del grupal.' },
  { key: 'planSolicitarHba1c', label: 'Se solicita HBA1C', text: '- Se solicita HBA1C de control.' },
  { key: 'planSolicitarNuevoHgt', label: 'Se solicita nuevo HGT', text: '- Se solicita nuevo perfil de hemoglucotest (HGT).' },
];

interface FichaGrupalDiabetesProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaGrupalDiabetes: React.FC<FichaGrupalDiabetesProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaGrupalDiabetesFormData>('local_FichaGrupalDiabetes', initialFormData);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    anamnesis += `ACTIVIDAD GRUPAL DIABETES\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) {
      anamnesis += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    }
    anamnesis += `PACIENTE: ${formData.nombrePaciente || '(No ingresado)'}\n`;
    anamnesis += `RUT: ${formData.rutPaciente || '(No ingresado)'}\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `ANAMNESIS:\n`;
    anamnesis += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    anamnesis += `Sexo: ${formData.sexo || '(No seleccionado)'}\n`;
    anamnesis += `Antecedentes médicos: ${formData.antecedentesMedicos || '(No ingresado)'}\n`;
    anamnesis += `Medicación actual: ${formData.medicacionActual || '(No ingresado)'}\n\n`;

    exploracion += `EXPLORACIÓN:\n`;
    exploracion += `HBA1C: ${formData.hba1c || '(No ingresado)'}\n`;
    exploracion += `Perfil de hemoglucotest: ${formData.perfilHemoglucotest || '(No ingresado)'}\n\n`;

    actuacion += `ACTUACIÓN:\n`;
    let planAdded = false;
    planCheckboxesConfig.forEach(item => {
      if (formData[item.key as keyof FichaGrupalDiabetesFormData]) {
        actuacion += `${item.text}\n`;
        planAdded = true;
      }
    });
    if (!planAdded) {
      actuacion += '(Sin indicaciones seleccionadas)\n';
    }

    return { 
        anamnesis: anamnesis.trim(), 
        exploracion: exploracion.trim(), 
        actuacion: actuacion.trim() 
    };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
  }, [formData, calculateGeneratedTextParts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, rutPaciente: value }));
  }, []);

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert(`'${partName}' copiado al portapapeles.`))
      .catch(err => alert('Error al copiar texto.'));
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };
  
  const handleExportPdf = async () => {
    if (!formData.nombrePaciente || !formData.rutPaciente) {
      alert('Por favor, ingrese el nombre y RUT del paciente antes de exportar.');
      return;
    }
    if (!loggedInUser) {
      alert('Error: Usuario no identificado. No se puede generar el PDF.');
      return;
    }

    setStatus(FormStatus.Generating);
    try {
      const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
      const fullContent = `${anamnesis}\n\n${exploracion}\n\n${actuacion}`;
      await generateClinicalRecordPdf(
        {
          title: 'Ficha Actividad Grupal de Diabetes',
          content: fullContent,
        },
        loggedInUser
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF.");
    } finally {
      setStatus(FormStatus.Idle);
    }
  };


  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha Actividad Grupal de Diabetes</h2>
        <p className="text-slate-500 mt-2">Complete los campos para generar el registro de la actividad.</p>
      </header>

      <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
        <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} required />
              <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={handleRutChange} required />
            </div>
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                    <div className="flex items-center space-x-4 mt-2.5">
                        <label className="flex items-center text-sm">
                            <input
                                type="radio"
                                name="sexo"
                                value="Masculino"
                                checked={formData.sexo === 'Masculino'}
                                onChange={handleChange}
                                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-slate-700">Masculino</span>
                        </label>
                        <label className="flex items-center text-sm">
                            <input
                                type="radio"
                                name="sexo"
                                value="Femenino"
                                checked={formData.sexo === 'Femenino'}
                                onChange={handleChange}
                                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-slate-700">Femenino</span>
                        </label>
                    </div>
                </div>
            </div>
            <FormField label="Antecedentes médicos" id="antecedentesMedicos" name="antecedentesMedicos" value={formData.antecedentesMedicos} onChange={handleChange} isTextArea rows={3} />
            <div className="mt-3">
                <FormField label="Medicación actual" id="medicacionActual" name="medicacionActual" value={formData.medicacionActual} onChange={handleChange} isTextArea rows={3} />
                <MedicamentoArsenalInput currentValue={formData.medicacionActual} onValueChange={(newValue) => setFormData(prev => ({...prev, medicacionActual: newValue}))} />
            </div>
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Exploración</h3>
            <FormField label="HBA1C" id="hba1c" name="hba1c" value={formData.hba1c} onChange={handleChange} isTextArea rows={2} />
            <FormField label="Perfil de hemoglucotest" id="perfilHemoglucotest" name="perfilHemoglucotest" value={formData.perfilHemoglucotest} onChange={handleChange} isTextArea rows={3} containerClassName="mt-3" />
          </section>

          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Actuación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {planCheckboxesConfig.map(item => (
                    <div key={item.key} className="flex items-center p-2 bg-white rounded-md border">
                        <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaGrupalDiabetesFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                        <label htmlFor={item.key} className="ml-2 text-sm text-slate-700">{item.label}</label>
                    </div>
                ))}
            </div>
          </section>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">Resumen Ficha Clínica (Editable)</h3>
          <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden w-full">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label><button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Exploración</label><button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Actuación</label><button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">Volver al Menú</button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
              type="button"
              onClick={handleNewDocument}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm"
            >
              Limpiar Formulario
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={status === FormStatus.Generating}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300"
          >
            {status === FormStatus.Generating ? 'Exportando...' : 'Exportar como PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FichaGrupalDiabetes;
