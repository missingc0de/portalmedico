
import React, { useState, useCallback, useEffect } from 'react';
import { FichaDemenciaFormData, User, FormStatus } from '../types';
import FormField from './FormField';
import { UniversalAIClient, Type } from '../utils/aiClient';
import ImportModal from './ImportModal';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaDemenciaFormData & { proximoControlMeses: string } = {
  nombrePaciente: '',
  rutPaciente: '',
  edad: '',
  sexo: '',
  omitOptional: false,
  hospitalizacionesRecientes: '',
  eventosCardiovasculares: '',
  antecedentesFamiliares: '',
  farmacosHabituales: '',
  cirugias: '',
  alergias: '',
  oh: '',
  tabaco: '',
  drogas: '',
  historiaTEC: '',
  viveCon: '',
  cuidadorPrincipal: '',
  redesApoyo: '',
  actividadesComunitarias: '',
  actividadesFamiliares: '',
  alimentacion: '',
  deglucion: '',
  deposiciones: '',
  miccion: '',
  dolor: '',
  caidas: '',
  examenesDemenciaSecundaria: 'Perfil lipídico, función renal, hemograma, TSH, B12, VDRL, VIH (test rápido), ECG de reposo, EOC, UC, RAC, perfil hepático',
  historiaDeficitCognitivo: '',
  olvidosFrecuentes: '',
  orientacionTemporoEspacial: '',
  atencion: '',
  organizacionMental: '',
  sueno: '',
  npiq_delirios: false,
  npiq_alucinaciones: false,
  npiq_agitacion: false,
  npiq_depresion: false,
  npiq_ansiedad: false,
  npiq_euforia: false,
  npiq_apatia: false,
  npiq_inhibicion: false,
  npiq_irritabilidad: false,
  npiq_motor: false,
  npiq_nocturnas: false,
  npiq_apetito: false,
  animo_phq9: '',
  animo_yesavage: '',
  impacto_zarit: '',
  impacto_readiness: '',
  funcional_biografia: '',
  escolaridad: '',
  alfabetismo: '',
  abvd_barthel: '',
  aivd_lawton: '',
  tAdlq: '',
  examenFisico_general: 'Mucosa oral y palpebral rosada e hidratada. Llene capilar menor a dos segundos.\nYugulares no ingurgitadas\nRitmo regular en dos tiempos, sin soplos.\nMurmullo pulmonar presente, sin ruidos agregados.\nAbdomen blando, depresible e indoloro. Ruidos hidroaéreos presentes. No palpo masas ni visceromegalias. Sin signos de irritación peritoneal.\nExtremidades sin edema ni signos de TVP. Pulsos periféricos presentes.',
  neuro_paresia: 'Minima paresia EESS y EEll negativo.',
  neuro_rot: 'ROT conservados, simétricos. Tono muscular conservado.',
  neuro_diadococinesia: 'Diadococinesia y metria conservadas.',
  neuro_marcha: 'Marcha conservada.',
  neuro_paresCraneales: 'Pares craneales conservados.',
  test_mmse: false,
  test_mis: false,
  test_moca: false,
  test_reloj: false,
  test_fototest: false,
  test_rudas: false,
  diagnostico: '',
  demencia_tipo_alzheimer: false,
  demencia_tipo_vascular: false,
  demencia_tipo_lewy: false,
  demencia_tipo_frontotemporal: false,
  demencia_tipo_pseudodemencia: false,
  demencia_severidad: '',
  demencia_sintomasAsociados: '',
  demencia_funcionalidad: '',
  sg_caidas: false,
  sg_incontinencia: false,
  sg_hipotension: false,
  sg_polifarmacia: false,
  sg_fragilidad: false,
  sg_sarcopenia: false,
  comorbilidades: '',
  plan_ges: false,
  plan_taller_cuidadores: false,
  plan_taller_cuidadores_lugar: 'CESFAM (lugar por confirmar)',
  plan_taller_caidas: false,
  plan_manejo_multidisciplinario: false,
  plan_manejo_especifico: false,
  plan_derivacion_cedem: false,
  proximoControlMeses: '',
};

const npiqItems = [
  { key: 'npiq_delirios', label: 'Delirios' },
  { key: 'npiq_alucinaciones', label: 'Alucinaciones' },
  { key: 'npiq_agitacion', label: 'Agitación' },
  { key: 'npiq_depresion', label: 'Depresión' },
  { key: 'npiq_ansiedad', label: 'Ansiedad' },
  { key: 'npiq_euforia', label: 'Euforia' },
  { key: 'npiq_apatia', label: 'Apatía' },
  { key: 'npiq_inhibicion', label: 'Inhibición' },
  { key: 'npiq_irritabilidad', label: 'Irritabilidad' },
  { key: 'npiq_motor', label: 'Motor' },
  { key: 'npiq_nocturnas', label: 'Nocturnas' },
  { key: 'npiq_apetito', label: 'Apetito' },
];

const testNeurocognitivosItems = [
  { key: 'test_mmse', label: 'MMSE' },
  { key: 'test_mis', label: 'MIS' },
  { key: 'test_moca', label: 'MoCA' },
  { key: 'test_reloj', label: 'Reloj' },
  { key: 'test_fototest', label: 'Foto-test' },
  { key: 'test_rudas', label: 'RUDAS' },
];

const demenciaTipoItems = [
  { key: 'demencia_tipo_alzheimer', label: 'Alzheimer' },
  { key: 'demencia_tipo_vascular', label: 'Vascular' },
  { key: 'demencia_tipo_lewy', label: 'Lewy' },
  { key: 'demencia_tipo_frontotemporal', label: 'Frontotemporal' },
  { key: 'demencia_tipo_pseudodemencia', label: 'Pseudodemencia' },
];

const sindromesGeriatricosItems = [
  { key: 'sg_caidas', label: 'Caídas' },
  { key: 'sg_incontinencia', label: 'Incontinencia' },
  { key: 'sg_hipotension', label: 'Hipotensión' },
  { key: 'sg_polifarmacia', label: 'Polifarmacia' },
  { key: 'sg_fragilidad', label: 'Fragilidad' },
  { key: 'sg_sarcopenia', label: 'Sarcopenia' },
];

const planesItems = [
  { key: 'plan_ges', label: 'Notificación GES' },
  { key: 'plan_taller_cuidadores', label: 'Taller Cuidadores' },
  { key: 'plan_taller_caidas', label: 'Taller Caídas' },
  { key: 'plan_manejo_multidisciplinario', label: 'Manejo Multidisc.' },
  { key: 'plan_manejo_especifico', label: 'Manejo Específico' },
  { key: 'plan_derivacion_cedem', label: 'Derivación CEDEM' },
];

const tiempoControlOptions = ['1 mes', '2 meses', '3 meses', '4 meses', '5 meses', '6 meses', '12 meses'];

interface IngresoDemenciasFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const IngresoDemenciasForm: React.FC<IngresoDemenciasFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaDemenciaFormData & { proximoControlMeses: string }>('local_IngresoDemenciasForm', initialFormData);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);

  const getVal = (key: keyof (FichaDemenciaFormData & { proximoControlMeses: string })) => {
    const val = formData[key];
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    return (val && String(val).trim()) ? val : 'No explorado.';
  };

  const handleAiImport = async (pastedText: string) => {
    setIsAiImporting(true);
    try {
      const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });
      const schema = {
        type: Type.OBJECT,
        properties: {
          edad: { type: Type.STRING },
          sexo: { type: Type.STRING },
          hospitalizacionesRecientes: { type: Type.STRING },
          eventosCardiovasculares: { type: Type.STRING },
          antecedentesFamiliares: { type: Type.STRING },
          farmacosHabituales: { type: Type.STRING },
          viveCon: { type: Type.STRING },
          cuidadorPrincipal: { type: Type.STRING },
          redesApoyo: { type: Type.STRING },
          alimentacion: { type: Type.STRING },
          historiaDeficitCognitivo: { type: Type.STRING },
          diagnostico: { type: Type.STRING },
          comorbilidades: { type: Type.STRING }
        },
      };

      const response = await ai.models.generateContent({
        model: 'llama-3.2-90b-vision-preview',
        contents: `Analiza el siguiente texto de un registro anterior de demencia y extrae JSON. Texto: "${pastedText.replace(/"/g, "'")}"`,
        config: { responseMimeType: 'application/json', responseSchema: schema },
      });

      const parsedData = JSON.parse(response.text.trim());
      setFormData(prev => ({ ...prev, ...parsedData }));
      setIsImportModalOpen(false);
      alert('Datos importados.');
    } catch (error) {
      alert("Error al importar.");
    } finally {
      setIsAiImporting(false);
    }
  };

  const calculateSummary = useCallback(() => {
    let anam = `FICHA INGRESO DEMENCIAS\n`;
    anam += `---------------------------------------\n`;
    anam += `FECHA INGRESO: ${new Date().toLocaleDateString('es-ES')}\n`;
    anam += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || 'No especificado'}\n`;
    anam += `MOTIVO DE CONSULTA: INGRESO DEMENCIAS\n`;
    anam += `---------------------------------------\n\n`;

    anam += `ANTECEDENTES:\n`;
    anam += `- Edad: ${getVal('edad')}\n`;
    anam += `- Sexo: ${getVal('sexo')}\n`;
    anam += `- Hosp. recientes: ${getVal('hospitalizacionesRecientes')}\n`;
    anam += `- Eventos CV: ${getVal('eventosCardiovasculares')}\n`;
    anam += `- Ant. familiares: ${getVal('antecedentesFamiliares')}\n`;
    anam += `- Fármacos: ${getVal('farmacosHabituales')}\n`;
    anam += `- Hábitos: ${getVal('oh')}\n`;
    anam += `- Historia TEC: ${getVal('historiaTEC')}\n\n`;

    anam += `SOCIAL Y BIOLÓGICO:\n`;
    anam += `- Entorno: ${getVal('viveCon')}\n`;
    anam += `- Cuidador: ${getVal('cuidadorPrincipal')}\n`;
    anam += `- Alimentación: ${getVal('alimentacion')}\n`;
    anam += `- Sueño: ${getVal('sueno')}\n\n`;

    anam += `MENTAL Y CONDUCTUAL:\n`;
    anam += `- Historia déficit: ${getVal('historiaDeficitCognitivo')}\n`;
    anam += `- Orientación: ${getVal('orientacionTemporoEspacial')}\n`;
    const npiq = npiqItems.filter(i => formData[i.key as keyof FichaDemenciaFormData]).map(i => i.label);
    anam += `- NPI-Q: ${npiq.length > 0 ? npiq.join(', ') : 'No explorado.'}\n\n`;

    let expl = `EXPLORACIÓN:\n`;
    expl += `- Exámenes 2aria: ${getVal('examenesDemenciaSecundaria')}\n`;
    expl += `- Examen Físico: ${getVal('examenFisico_general')}\n`;
    expl += `- Neurológico: ${getVal('neuro_paresia')}, ${getVal('neuro_marcha')}\n`;
    const tests = testNeurocognitivosItems.filter(i => formData[i.key as keyof FichaDemenciaFormData]).map(i => i.label);
    expl += `- Tests: ${tests.length > 0 ? tests.join(', ') : 'No explorado.'}\n`;

    let actu = `DIAGNÓSTICO Y PLAN:\n`;
    actu += `- DG: ${getVal('diagnostico')}\n`;
    const tipos = demenciaTipoItems.filter(i => formData[i.key as keyof FichaDemenciaFormData]).map(i => i.label);
    actu += `- Tipo: ${tipos.length > 0 ? tipos.join(', ') : 'No explorado.'}\n`;
    actu += `- Severidad: ${getVal('demencia_severidad')}\n`;
    const sGeriatricos = sindromesGeriatricosItems.filter(i => formData[i.key as keyof FichaDemenciaFormData]).map(i => i.label);
    actu += `- S. Geriátricos: ${sGeriatricos.length > 0 ? sGeriatricos.join(', ') : 'No explorado.'}\n\n`;
    actu += `PLANES:\n`;
    planesItems.forEach(item => { if (formData[item.key as keyof FichaDemenciaFormData]) actu += `- ${item.label}\n`; });
    if (formData.proximoControlMeses) actu += `- Próximo control en ${formData.proximoControlMeses}.\n`;

    setAnamnesisText(anam.trim());
    setExploracionText(expl.trim());
    setActuacionText(actu.trim());
  }, [formData, loggedInUser]);

  useEffect(() => { calculateSummary(); }, [formData, calculateSummary]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExportPdf = async () => {
    if (!loggedInUser) return;
    setStatus(FormStatus.Generating);
    try {
      await generateClinicalRecordPdf({
        title: 'Ficha Ingreso Demencias',
        content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}`
      }, loggedInUser);
    } finally {
      setStatus(FormStatus.Idle);
    }
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2 uppercase tracking-tight text-sm">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );

  const renderCheckboxGrid = (title: string, items: { key: string, label: string }[]) => (
    <div className="p-3 bg-white border border-slate-200 rounded-md">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{title}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-2">
            <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaDemenciaFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" />
            <label htmlFor={item.key} className="text-xs text-slate-700 cursor-pointer">{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center lg:text-left border-b border-slate-100 pb-4">
        <h2 className="text-3xl font-bold text-slate-700">Ficha Ingreso Demencias</h2>
        <p className="text-slate-500 mt-1">Complete los datos de la ficha. El resumen se actualizará automáticamente.</p>
      </header>

      <div className="mb-6">
        <button
          onClick={() => setIsImportModalOpen(true)}
          disabled={loggedInUser?.profession !== 'medicina'}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-colors disabled:bg-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          {loggedInUser?.profession === 'medicina' ? (isAiImporting ? 'PROCESANDO...' : 'IMPORTAR DESDE CONTROL ANTERIOR') : 'No disponible'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Form Column */}
        <div className="lg:w-3/5 xl:w-7/12 space-y-6 flex-shrink-0 lg:max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar pr-3">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            
            {renderSection("Antecedentes", (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 75 años" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700">
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>
                <FormField isTextArea rows={2} id="hospitalizacionesRecientes" label="Hospitalizaciones recientes" name="hospitalizacionesRecientes" value={formData.hospitalizacionesRecientes} onChange={handleChange} />
                <FormField isTextArea rows={2} id="eventosCardiovasculares" label="Eventos cardiovasculares" name="eventosCardiovasculares" value={formData.eventosCardiovasculares} onChange={handleChange} />
                <FormField isTextArea rows={2} id="farmacosHabituales" label="Fármacos de uso habitual" name="farmacosHabituales" value={formData.farmacosHabituales} onChange={handleChange} />
                <FormField label="OH / Tabaco / Drogas" id="oh" name="oh" value={formData.oh} onChange={handleChange} />
              </div>
            ))}

            {renderSection("Social y Biológico", (
              <div className="grid grid-cols-1 gap-4">
                <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon} onChange={handleChange} />
                <FormField label="Cuidador Principal" id="cuidadorPrincipal" name="cuidadorPrincipal" value={formData.cuidadorPrincipal} onChange={handleChange} />
                <FormField label="Alimentación" id="alimentacion" name="alimentacion" value={formData.alimentacion} onChange={handleChange} />
                <FormField label="Sueño" id="sueno" name="sueno" value={formData.sueno} onChange={handleChange} />
              </div>
            ))}

            {renderSection("Estado Mental", (
              <div className="grid grid-cols-1 gap-4">
                <FormField isTextArea rows={2} label="Historia Déficit" id="historiaDeficitCognitivo" name="historiaDeficitCognitivo" value={formData.historiaDeficitCognitivo} onChange={handleChange} />
                <FormField label="Orientación T-E-P" id="orientacionTemporoEspacial" name="orientacionTemporoEspacial" value={formData.orientacionTemporoEspacial} onChange={handleChange} />
                {renderCheckboxGrid("Síntomas Psico-Conductuales (NPI-Q)", npiqItems)}
              </div>
            ))}

            {renderSection("Examen Físico y Exploración", (
              <div className="grid grid-cols-1 gap-4">
                <FormField isTextArea rows={3} label="Exámenes Demencia 2aria" id="examenesDemenciaSecundaria" name="examenesDemenciaSecundaria" value={formData.examenesDemenciaSecundaria} onChange={handleChange} />
                <FormField isTextArea rows={5} label="Examen Físico General" id="examenFisico_general" name="examenFisico_general" value={formData.examenFisico_general} onChange={handleChange} />
                <FormField label="Neurológico (Paresia/Marcha)" id="neuro_marcha" name="neuro_marcha" value={formData.neuro_marcha} onChange={handleChange} />
                {renderCheckboxGrid("Tests Aplicados", testNeurocognitivosItems)}
              </div>
            ))}

            {renderSection("Diagnóstico y Plan", (
              <div className="grid grid-cols-1 gap-4">
                <FormField label="Diagnóstico" id="diagnostico" name="diagnostico" value={formData.diagnostico} onChange={handleChange} />
                {renderCheckboxGrid("Tipo de Demencia", demenciaTipoItems)}
                <FormField label="Severidad (GDS-FAST)" id="demencia_severidad" name="demencia_severidad" value={formData.demencia_severidad} onChange={handleChange} />
                {renderCheckboxGrid("Síndromes Geriátricos", sindromesGeriatricosItems)}
                {renderCheckboxGrid("Planes", planesItems)}
                
                <div className="p-3 bg-white border border-slate-200 rounded-md">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Próximo Control en:</label>
                   <select id="proximoControlMeses" name="proximoControlMeses" value={formData.proximoControlMeses} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700 text-sm">
                      <option value="">Seleccione tiempo...</option>
                      {tiempoControlOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>
              </div>
            ))}
          </form>
        </div>

        {/* Summary Column */}
        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-24 flex flex-col lg:max-h-[calc(100vh-380px)]">
          <h3 className="text-xl font-bold mb-4 text-sky-800 flex-shrink-0 uppercase tracking-tight text-sm">Resumen Ficha Clínica (Editable)</h3>
          <div className="flex-grow w-full space-y-4 overflow-y-auto custom-scrollbar pr-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anamnesis</label>
                <button onClick={() => navigator.clipboard.writeText(anamnesisText)} className="text-[10px] bg-slate-200 px-3 py-0.5 font-bold text-slate-600 rounded hover:bg-slate-300">COPIAR</button>
              </div>
              <textarea value={anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-xs text-slate-800 min-h-[150px]" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exploración</label>
                <button onClick={() => navigator.clipboard.writeText(exploracionText)} className="text-[10px] bg-slate-200 px-3 py-0.5 font-bold text-slate-600 rounded hover:bg-slate-300">COPIAR</button>
              </div>
              <textarea value={exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-xs text-slate-800 min-h-[150px]" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actuación</label>
                <button onClick={() => navigator.clipboard.writeText(actuacionText)} className="text-[10px] bg-slate-200 px-3 py-0.5 font-bold text-slate-600 rounded hover:bg-slate-300">COPIAR</button>
              </div>
              <textarea value={actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-xs text-slate-800 min-h-[120px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-8 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all active:scale-95">
          Volver al Menú
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button onClick={handleExportPdf} disabled={status === FormStatus.Generating} className="w-full sm:w-auto px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6V4.414L14.586 8H11z" clipRule="evenodd" /></svg>
            {status === FormStatus.Generating ? 'EXPORTANDO...' : 'EXPORTAR A PDF'}
          </button>
          <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-8 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-95">
            LIMPIAR FORMULARIO
          </button>
        </div>
      </div>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onConfirmImport={handleAiImport} isImporting={isAiImporting} title="Importar Registro Anterior" description="Pegue el texto del registro anterior para autocompletar mediante IA." />
    </div>
  );
};

export default IngresoDemenciasForm;

