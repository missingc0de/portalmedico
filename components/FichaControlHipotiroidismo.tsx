import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlHipotiroidismoFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField'; // Import DateField
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import RutInput from './RutInput';
import { UniversalAIClient, Type } from '../utils/aiClient';
import ImportModal from './ImportModal';
import CopyButton from './CopyButton';

const initialExamenFisicoText = `- Buenas condiciones generales, bien hidratado y perfundido.
- Tiroides sin alteraciones.
- Tórax simétrico, sin retracciones
- RR2TSS
- MP(+)SRA
- Abdomen: RHA(+), BDI, sin masas ni visceromegalias.
- EEII: pulsos (+), simétricos, edema (-), TVP (-).`;

const initialFormData: FichaControlHipotiroidismoFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  edad: '',
  patologias: '',
  // FIX: Changed 'tratamientoActual' to 'treatmentActual' to match FichaControlHipotiroidismoFormData type.
  treatmentActual: '',
  adherenciaTratamiento: '',
  adherenciaTratamientoAclaracion: '',
  constipacion: '',
  constipacionAclaracion: '',
  intoleranciaFrio: '',
  intoleranciaFrioAclaracion: '',
  debilidadFanereos: '',
  debilidadFanereosAclaracion: '',
  gananciaPeso: '',
  gananciaPesoAclaracion: '',
  adinamia: '',
  adinamiaAclaracion: '',
  ramLvt: '',
  ramLvtAclaracion: '',
  tabaco: false,
  tabacoAclaracion: '',
  oh: false,
  ohAclaracion: '',
  actividadFisica: '',
  actividadFisicaAclaracion: '',
  controlTsh: '',
  controlTshAclaracion: '',
  ultimoLaboratorioFecha: '',
  ultimoLaboratorioResultados: '',
  estudiosImagenesFecha: '',
  estudiosImagenesResultados: '',
  examenFisico: initialExamenFisicoText,
  proximoControl: '',
  tratamientoPlan: '',
  examenesPlan: '',
};

interface TriStateItem {
  keyBase: keyof FichaControlHipotiroidismoFormData; 
  label: string;
  options?: { value: string; label: string }[]; 
}

interface CheckboxClarificationItem {
  key: keyof FichaControlHipotiroidismoFormData;
  clarificationKey: keyof FichaControlHipotiroidismoFormData;
  label: string;
}

interface FichaControlHipotiroidismoProps {
  onBackToMenu: () => void;
  loggedInUser: User | null; 
}

import { canUseAI } from '../utils/aiRestrictions';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const FichaControlHipotiroidismo: React.FC<FichaControlHipotiroidismoProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlHipotiroidismoFormData>('local_FichaControlHipotiroidismo', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);


  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    // Assuming dateString is YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day || year.length !== 4 || month.length !== 2 || day.length !== 2) return '(Fecha inválida)';
    return `${day}/${month}/${year}`;
  };

    const handleAiImport = async (pastedText: string) => {
    // Check AI restrictions
    const check = canUseAI(loggedInUser);
    if (!check.allowed) {
        alert(check.reason || 'No tiene permiso para usar esta función.');
        return;
    }

    setIsAiImporting(true);
    try {
        const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });
        const schema = {
            type: Type.OBJECT,
            properties: {
                patologias: { type: Type.STRING, description: "Lista de patologías crónicas del paciente." },
                // FIX: Changed 'tratamientoActual' to 'treatmentActual' to match the type definition in types.ts.
                treatmentActual: { type: Type.STRING, description: "Lista de medicamentos que el paciente está tomando actualmente." },
                adherenciaTratamiento: { type: Type.STRING, description: "Adherencia al tratamiento, debe ser 'Buena' o 'Mala'." },
                constipacion: { type: Type.STRING, description: "Si el paciente reporta constipación, debe ser 'Sí' o 'No'." },
                intoleranciaFrio: { type: Type.STRING, description: "Si el paciente reporta intolerancia al frío, debe ser 'Sí' o 'No'." },
                debilidadFanereos: { type: Type.STRING, description: "Si el paciente reporta debilidad de fanéreos, debe ser 'Sí' o 'No'." },
                gananciaPeso: { type: Type.STRING, description: "Si el paciente reporta ganancia de peso, debe ser 'Sí' o 'No'." },
                adinamia: { type: Type.STRING, description: "Si el paciente reporta adinamia, debe ser 'Sí' o 'No'." },
                ramLvt: { type: Type.STRING, description: "Si el paciente reporta RAM a Levotiroxina (LVT), debe ser 'Sí' o 'No'." },
                tabacoAclaracion: { type: Type.STRING, description: "Detalles sobre el hábito de tabaco. Si no fuma, omite esta clave." },
                ohAclaracion: { type: Type.STRING, description: "Detalles sobre el consumo de alcohol. Si no consume, omite esta clave." },
                actividadFisicaAclaracion: { type: Type.STRING, description: "Detalles sobre la actividad física." },
                ultimoLaboratorioResultados: { type: Type.STRING, description: "Resumen de los resultados del último laboratorio." },
                examenFisico: { type: Type.STRING, description: "Descripción del examen físico del control anterior." },
                tratamientoPlan: { type: Type.STRING, description: "El plan de tratamiento del control anterior." },
                // FIX: Changed 'planExamenes' to 'examenesPlan' to match the type definition in types.ts.
                examenesPlan: { type: Type.STRING, description: "Los exámenes solicitados en el control anterior." }
            },
        };

        const response = await ai.models.generateContent({
            model: 'Groq-flash-latest',
            contents: `Analiza el siguiente texto de un registro clínico de un control de hipotiroidismo anterior y extrae la información relevante. Devuelve solo un objeto JSON. Si una información no está presente en el texto, omite la clave del JSON. Texto a analizar: "${pastedText}"`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        const updatedFields: Partial<FichaControlHipotiroidismoFormData> = {};
        
        // Map all string fields directly
        const stringFields: (keyof FichaControlHipotiroidismoFormData)[] = [
            'patologias',
            // FIX: Changed 'tratamientoActual' to 'treatmentActual' to match FichaControlHipotiroidismoFormData type.
            'treatmentActual',
            'adherenciaTratamiento', 'constipacion', 
            'intoleranciaFrio', 'debilidadFanereos', 'gananciaPeso', 'adinamia', 'ramLvt',
            'tabacoAclaracion', 'ohAclaracion', 'actividadFisicaAclaracion', 
            'ultimoLaboratorioResultados', 'examenFisico', 'tratamientoPlan', 
            // FIX: Changed 'planExamenes' to 'examenesPlan' to match the type definition in types.ts.
            'examenesPlan'
        ];

        for (const key of stringFields) {
            if (parsedData[key]) {
                (updatedFields as any)[key] = parsedData[key];
            }
        }
        
        // Map boolean fields based on presence of clarification
        if (parsedData.tabacoAclaracion) updatedFields.tabaco = true;
        if (parsedData.ohAclaracion) updatedFields.oh = true;
        if (parsedData.actividadFisicaAclaracion) updatedFields.actividadFisica = 'Sí';


        setFormData(prev => ({ ...prev, ...updatedFields }));
        alert('Datos importados exitosamente.');
        setIsImportModalOpen(false);

    } catch (error) {
        console.error("Error al importar datos:", error);
        alert("No se pudo procesar el texto. Verifique el formato o intente de nuevo.");
    } finally {
        setIsAiImporting(false);
    }
  };

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    anamnesis += `FICHA CONTROL HIPOTIROIDISMO\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) {
      anamnesis += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    }
    anamnesis += `PACIENTE: ${formData.nombrePaciente || '(No ingresado)'} - RUT: ${formData.rutPaciente || '(No ingresado)'}\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `ANAMNESIS:\n`;
    anamnesis += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    anamnesis += `Patologías: ${formData.patologias || '(No ingresado)'}\n`;
    // FIX: Changed 'tratamientoActual' to 'treatmentActual'.
    anamnesis += `Tratamiento actual: ${formData.treatmentActual || '(No ingresado)'}\n\n`;

    const symptomsAndSigns = [
      { label: "Adherencia al tratamiento", value: formData.adherenciaTratamiento, aclaracion: formData.adherenciaTratamientoAclaracion, options:true },
      { label: "Constipación", value: formData.constipacion, aclaracion: formData.constipacionAclaracion },
      { label: "Intolerancia al frío", value: formData.intoleranciaFrio, aclaracion: formData.intoleranciaFrioAclaracion },
      { label: "Debilidad de fanéreos", value: formData.debilidadFanereos, aclaracion: formData.debilidadFanereosAclaracion },
      { label: "Ganancia de peso", value: formData.gananciaPeso, aclaracion: formData.gananciaPesoAclaracion },
      { label: "Adinamia", value: formData.adinamia, aclaracion: formData.adinamiaAclaracion },
      { label: "RAM a LVT", value: formData.ramLvt, aclaracion: formData.ramLvtAclaracion },
    ];
    anamnesis += `SÍNTOMAS / SIGNOS:\n`;
    symptomsAndSigns.forEach(item => {
      anamnesis += `${item.label}: ${item.value || '(No seleccionado)'}`;
      if (item.aclaracion) anamnesis += ` - Aclaración: ${item.aclaracion}`;
      anamnesis += `\n`;
    });
    anamnesis += `\n`;

    anamnesis += `HÁBITOS:\n`;
    anamnesis += `Tabaco: ${formData.tabaco ? 'Sí' : 'Niega'}${formData.tabacoAclaracion ? ` - Aclaración: ${formData.tabacoAclaracion}` : ''}\n`;
    anamnesis += `OH: ${formData.oh ? 'Sí' : 'Niega'}${formData.ohAclaracion ? ` - Aclaración: ${formData.ohAclaracion}` : ''}\n`;
    anamnesis += `Actividad Física: ${formData.actividadFisica || '(No seleccionado)'}${formData.actividadFisicaAclaracion ? ` - Aclaración: ${formData.actividadFisicaAclaracion}` : ''}\n`;
    anamnesis += `\n`;

    const controls = [
      { label: "Control TSH", value: formData.controlTsh, aclaracion: formData.controlTshAclaracion },
    ];
    anamnesis += `CONTROLES:\n`;
    controls.forEach(item => {
      anamnesis += `${item.label}: ${item.value || '(No seleccionado)'}`;
      if (item.aclaracion) anamnesis += ` - Aclaración: ${item.aclaracion}`;
      anamnesis += `\n`;
    });
    anamnesis += `\n`;

    exploracion += `ÚLTIMO LABORATORIO:\n`;
    exploracion += `Fecha: ${formatDateForDisplay(formData.ultimoLaboratorioFecha)}\n`;
    exploracion += `Resultados: ${formData.ultimoLaboratorioResultados || '(No ingresado)'}\n\n`;

    exploracion += `ESTUDIOS DE IMÁGENES:\n`;
    exploracion += `Fecha: ${formatDateForDisplay(formData.estudiosImagenesFecha)}\n`;
    exploracion += `Resultados/Aclaraciones: ${formData.estudiosImagenesResultados || '(No ingresado)'}\n\n`;

    exploracion += `EXAMEN FÍSICO:\n${formData.examenFisico || '(No ingresado)'}\n\n`;

    actuacion += `PLAN:\n`;
    actuacion += `PRÓXIMO CONTROL: ${formData.proximoControl || '(No ingresado)'}\n`;
    actuacion += `TRATAMIENTO: ${formData.tratamientoPlan || '(No ingresado)'}\n`;
    actuacion += `EXÁMENES: ${formData.examenesPlan || '(No ingresado)'}\n`;
    
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
    
    const hasText = anamnesis.length > 0 || exploracion.length > 0 || actuacion.length > 0;
    if (hasText && status !== FormStatus.TextGenerated) {
        setStatus(FormStatus.TextGenerated);
    } else if (!hasText && status === FormStatus.TextGenerated) {
        setStatus(FormStatus.Idle);
    }
  }, [formData, calculateGeneratedTextParts, status]); 

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            const configItem = checkboxClarificationConfig.find(item => item.key === name);
            if(configItem && !checked) {
                (newState as any)[configItem.clarificationKey] = '';
            }
            return newState;
        });
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRadioChange = useCallback((name: keyof FichaControlHipotiroidismoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any}));
  }, []);

  const handleRutChange = useCallback((name: keyof FichaControlHipotiroidismoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);
  


  const handleNewDocument = () => {
    setFormData(initialFormData);
    setAnamnesisText('');
    setExploracionText('');
    setActuacionText('');
    setStatus(FormStatus.Idle);
  };
  
  const triStateFieldsConfig: TriStateItem[] = [
      { keyBase: 'adherenciaTratamiento', label: 'Adherencia al tratamiento', options: [{value: 'Buena', label: 'Buena'}, {value: 'Mala', label: 'Mala'}] },
      { keyBase: 'constipacion', label: 'Constipación' },
      { keyBase: 'intoleranciaFrio', label: 'Intolerancia al frío' },
      { keyBase: 'debilidadFanereos', label: 'Debilidad de fanéreos' },
      { keyBase: 'gananciaPeso', label: 'Ganancia de peso' },
      { keyBase: 'adinamia', label: 'Adinamia' },
      { keyBase: 'ramLvt', label: 'RAM a LVT' },
      { keyBase: 'actividadFisica', label: 'Actividad Física' },
      { keyBase: 'controlTsh', label: 'Control TSH' },
  ];

  const checkboxClarificationConfig: CheckboxClarificationItem[] = [
    { key: 'tabaco', clarificationKey: 'tabacoAclaracion', label: 'Tabaco' },
    { key: 'oh', clarificationKey: 'ohAclaracion', label: 'OH (Alcohol)' },
  ];

  const renderTriStateField = (item: TriStateItem) => {
    const valueKey = item.keyBase as keyof FichaControlHipotiroidismoFormData;
    const aclaracionKey = `${item.keyBase}Aclaracion` as keyof FichaControlHipotiroidismoFormData;
    
    const currentVal = formData[valueKey] as string;
    const aclaracionVal = formData[aclaracionKey] as string;

    const optionsToRender = item.options || [{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}];

    return (
      <div key={item.keyBase} className="mb-4 p-3 border border-slate-200 rounded-md bg-white">
        <label className="block text-sm font-medium text-slate-700 mb-1">{item.label}:</label>
        <div className="flex items-center space-x-4">
          {optionsToRender.map(opt => (
            <label key={opt.value} className="flex items-center text-sm">
              <input
                type="radio"
                name={String(valueKey)}
                value={opt.value}
                checked={currentVal === opt.value}
                onChange={() => handleRadioChange(valueKey, opt.value)}
                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        <input
          type="text"
          name={String(aclaracionKey)}
          value={aclaracionVal}
          onChange={handleChange}
          placeholder="Aclare (opcional)"
          className="mt-2 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400"
        />
      </div>
    );
  };

  const renderCheckboxClarificationField = (item: CheckboxClarificationItem) => (
    <div key={String(item.key)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={String(item.key)}
          name={String(item.key)}
          checked={formData[item.key] as boolean}
          onChange={handleChange}
          className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
        />
        <label htmlFor={String(item.key)} className="ml-2 text-sm font-medium text-slate-700">
          {item.label}
        </label>
      </div>
      {(formData[item.key] as boolean) && (
        <FormField
          label="Aclaración:"
          id={String(item.clarificationKey)}
          name={String(item.clarificationKey)}
          value={formData[item.clarificationKey] as string}
          onChange={handleChange}
          placeholder="Aclare aquí..."
          isTextArea
          rows={1}
          containerClassName="mt-2"
        />
      )}
    </div>
  );


  return (
    <>
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Hipotiroidismo</h2>
        <p className="text-slate-500 mt-2">Complete los datos de la ficha. El resumen se actualizará automáticamente.</p>
      </header>
       {isAiImporting && (
        <div className="w-full text-center p-3 mb-4 bg-sky-100 border border-sky-300 rounded-lg animate-pulse">
          <p className="text-sky-700 font-semibold">Importando datos... Esto puede tardar unos segundos.</p>
        </div>
      )}
      <div className="mb-6">
          <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
              disabled={isAiImporting || loggedInUser?.profession !== 'medicina'}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loggedInUser?.profession === 'medicina' ? 'IMPORTAR DESDE CONTROL ANTERIOR' : 'No disponible'}
          </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-6 mt-6">
        {/* Columna del Formulario (Izquierda) */}
        <div className="lg:w-3/5 xl:w-7/12 space-y-6 flex-shrink-0 pr-3">
          <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} required />
              <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={(value) => handleRutChange('rutPaciente', value)} required />
            </div>
          </section>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
              <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} placeholder="Edad del paciente" />
              <div className="mt-3">
                <FormField label="Patologías" id="patologias" name="patologias" value={formData.patologias} onChange={handleChange} placeholder="Patologías preexistentes" isTextArea rows={2} />
              </div>
              <div className="mt-3">
                {/* FIX: Changed 'tratamientoActual' to 'treatmentActual' to match types.ts */}
                <FormField label="Tratamiento actual" id="treatmentActual" name="treatmentActual" value={formData.treatmentActual} onChange={handleChange} placeholder="Tratamiento actual" isTextArea rows={2} />
                {/* FIX: Changed 'tratamientoActual' to 'treatmentActual' to match types.ts */}
                <MedicamentoArsenalInput currentValue={formData.treatmentActual} onValueChange={(newValue) => setFormData(prev => ({...prev, treatmentActual: newValue}))} />
              </div>
            </section>

            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Síntomas / Signos / Hábitos / Controles</h3>
              {triStateFieldsConfig.filter(item => item.keyBase !== 'tabaco' && item.keyBase !== 'oh').map(renderTriStateField)}
              {checkboxClarificationConfig.map(renderCheckboxClarificationField)}
            </section>

            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Último Laboratorio</h3>
              <DateField label="Fecha del Estudio" id="ultimoLaboratorioFecha" name="ultimoLaboratorioFecha" value={formData.ultimoLaboratorioFecha} onChange={handleChange} />
              <div className="mt-3">
                <FormField label="Resultados del Estudio" id="ultimoLaboratorioResultados" name="ultimoLaboratorioResultados" value={formData.ultimoLaboratorioResultados} onChange={handleChange} isTextArea rows={3} placeholder="Resultados del último laboratorio..." />
              </div>
            </section>

            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Estudios de Imágenes</h3>
              <DateField label="Fecha del Estudio" id="estudiosImagenesFecha" name="estudiosImagenesFecha" value={formData.estudiosImagenesFecha} onChange={handleChange} />
              <div className="mt-3">
                <FormField label="Resultados/Aclaraciones del Estudio" id="estudiosImagenesResultados" name="estudiosImagenesResultados" value={formData.estudiosImagenesResultados} onChange={handleChange} isTextArea rows={3} placeholder="Resultados o aclaraciones de estudios de imágenes..." />
              </div>
            </section>

            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Físico</h3>
              <FormField label="" id="examenFisico" name="examenFisico" value={formData.examenFisico} onChange={handleChange} isTextArea rows={10} />
            </section>

            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Plan</h3>
              <FormField label="Próximo Control" id="proximoControl" name="proximoControl" value={formData.proximoControl} onChange={handleChange} isTextArea rows={2} />
              <div className="mt-3">
                <FormField label="Tratamiento" id="tratamientoPlan" name="tratamientoPlan" value={formData.tratamientoPlan} onChange={handleChange} isTextArea rows={3} />
              </div>
              <div className="mt-3">
                <FormField label="Exámenes" id="examenesPlan" name="examenesPlan" value={formData.examenesPlan} onChange={handleChange} isTextArea rows={2} />
              </div>
            </section>
          </form>
        </div>

        {/* Columna del Resumen (Derecha - Sticky) */}
        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">Resumen Ficha Clínica (Editable)</h3>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden w-full">
                
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                        <label htmlFor="anamnesisText" className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                        <CopyButton textToCopy={anamnesisText} />
                    </div>
                    <textarea
                        id="anamnesisText"
                        value={anamnesisText}
                        onChange={(e) => setAnamnesisText(e.target.value)}
                        className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        aria-label="Anamnesis - editable"
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                        <label htmlFor="exploracionText" className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                        <CopyButton textToCopy={exploracionText} />
                    </div>
                    <textarea
                        id="exploracionText"
                        value={exploracionText}
                        onChange={(e) => setExploracionText(e.target.value)}
                        className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        aria-label="Exploración - editable"
                    />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                        <label htmlFor="actuacionText" className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                        <CopyButton textToCopy={actuacionText} />
                    </div>
                    <textarea
                        id="actuacionText"
                        value={actuacionText}
                        onChange={(e) => setActuacionText(e.target.value)}
                        className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        aria-label="Actuación - editable"
                    />
                </div>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Volver al menú principal"
        >
          Volver al Menú
        </button>
        <button
          type="button"
          onClick={handleNewDocument}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Limpiar formulario y empezar nueva ficha"
        >
          Limpiar Formulario (Nueva Ficha)
        </button>
      </div>
    </div>
    <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirmImport={handleAiImport}
        isImporting={isAiImporting}
        title="Importar desde Control de Hipotiroidismo Anterior"
        description="Pegue aquí el texto del control anterior para autocompletar la ficha."
    />
    </>
  );
};

export default FichaControlHipotiroidismo;
