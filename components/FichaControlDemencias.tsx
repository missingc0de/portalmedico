import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FichaControlDemencias2026FormData, FormStatus, User, PccObjetivo, ObjetivoAnterior } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import PHQ9Modal from './PHQ9Modal';
import RutInput from './RutInput';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import ImportModal from './ImportModal';
import EcicepRiskCalculatorModal from './EcicepRiskCalculatorModal';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

// Componente interno para textareas que se expanden automáticamente
const AutoExpandingTextArea: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  containerClassName?: string;
}> = ({ label, id, name, value, onChange, placeholder, containerClassName }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={`w-full ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={1}
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 ease-in-out text-slate-700 placeholder-slate-400 overflow-hidden min-h-[42px]"
      />
    </div>
  );
};

interface PlanCheckboxConfig {
  key: keyof FichaControlDemencias2026FormData; 
  label: string;
  textPrefix: string; 
  textSuffix?: string; 
  detailKey?: keyof FichaControlDemencias2026FormData; 
  detailPlaceholder?: string; 
}

const planCheckboxItemsConfig: PlanCheckboxConfig[] = [
  { key: 'planEcicepLabsRutina', label: 'Laboratorios de Rutina', textPrefix: '- Solicito laboratorios de rutina (Perfil Lipídico, Glucemia, HBA1C, Cr, Orina C).' },
  { key: 'planEcicepEKG', label: 'EKG', textPrefix: '- Solicito EKG.' },
  { key: 'planEcicepHBA1C', label: 'HBA1C (Meta/Tiempo)', textPrefix: '- Solicito Hemoglobina Glicosilada, realizar en ', detailKey: 'planEcicepHBA1CTiempo', detailPlaceholder: 'X meses (o según meta)', textSuffix: '.' },
  { key: 'planEcicepFondoOjo', label: 'Fondo de Ojo', textPrefix: '- Solicito Fondo de Oio.' },
  { key: 'planEcicepCtrlPiesEnf', label: 'Control de Pies (Enf.)', textPrefix: '- Solicito Control de Pies con Enfermera.' },
  { key: 'planEcicepInterconsulta', label: 'Interconsulta', textPrefix: '- Solicito Interconsulta con ', detailKey: 'planEcicepInterconsultaEspecialidad', detailPlaceholder: 'especialidad', textSuffix: '.' },
];

const phq9Questions = [
    { key: 'phq9_interes', text: '¿Pocas ganas o interés en hacer las cosas?' },
    { key: 'phq9_animo', text: '¿Sentirse desanimada(o), deprimida(o), triste o sin esperanza?' },
    { key: 'phq9_sueno', text: '¿Problemas para dormir o mantenerse dormida(o), o en dormir demasiado?' },
    { key: 'phq9_energia', text: '¿Sentirse cansada(o) o tener poca energía sin motivo que lo justifique?' },
    { key: 'phq9_apetito', text: '¿Poco apetito o comer en exceso?' },
    { key: 'phq9_culpa', text: '¿Sentirse mal acerca de si misma(o) o sentir que es una(un) fracasada(o) o que se ha fallado a sí misma(o) o a su familia?' },
    { key: 'phq9_concentracion', text: '¿Dificultad para poner atención o concentrarse en las cosas que hace?' },
    { key: 'phq9_motor', text: '¿Moverse más lento o hablar más lento de lo normal o sentirse más inquieta(o) o intranquila(o) de lo normal?' },
    { key: 'phq9_suicidio', text: '¿Pensamientos de que sería mejor estar muerta(o) o que quisiera hacerse daño de alguna forma buscando morir?' },
];

const initialExamenFisicoText = `- Buenas condiciones generales.
- Hidratado, bien perfundido.
- Faringe sin lesiones.
- Cuellos sin adenopatías palpables, yugulares planas.
- Cardiovascular: RR2T, SS.
- Pulmonar: MP(+) SRA.
- Abdomen: RHA (+), blando, deprimible, indoloro, sin signos de irritación peritoneal.
- Extremidades: EEII simétricas, sin edema, sin signos de TVP. Sensibilidad (+), bien perfundido a distal. Sin lesiones.
- Neurológico: Conservado, GCS 15/15.`;

// FIX: Updated initialFormData to correctly match FichaControlDemencias2026FormData type definition (inherited from FichaIngresoEcicepFormData)
const initialFormData: FichaControlDemencias2026FormData = {
  fechaIngreso: new Date().toISOString().split('T')[0],
  duplaProfesionalOtro: '',
  duplaProfesionalOtroNombre: '',
  estratificacion: '',
  incluirControlCardiovascular: false,
  incluirControlHipotiroidismo: false,
  incluirControlArtrosis: false,
  incluirControlEpilepsia: false,
  incluirControlSalaEra: false,
  incluirControlSalaIra: false,
  incluirControlDemencias: false,
  incluirControlSm: false,
  edad: '',
  sexo: '',
  opcionesConversadas: '',
  anamnesisGeneral: '',
  antecedentesPersonales: '',
  morbilidad: '',
  farmacos: '',
  adherenciaTratamiento: '',
  ramFarmacos: 'No',
  ramFarmacosAclaracion: '',

  // Corrected properties to match FichaIngresoEcicepFormData strings
  alergias: 'Niega',
  cirugias: 'Niega',
  hospitalizaciones: 'Niega',
  controlExtrasistema: 'Niega',
  controlExtrasistemaAclaracion: '',

  empam: '',
  fondoOjo: '',
  podologo: '',
  evaluacionPie: '',
  atencionesPsa: '',
  factoresRiesgo: [],
  vacunas: 'Al día',
  antecedentesGineco: '',
  fum: '',
  sintomasClimaterio: '',
  mamografiaDia: '',
  papVigente: '',
  alcohol: false,
  alcoholAclaracion: '',
  tabaco: false,
  tabacoAclaracion: '',
  ipaNroCigarrillos: '',
  ipaNroAnos: '',
  ipaResultado: '',
  drogas: false,
  drogasAclaracion: '',
  actividadFisicaHabito: '',
  habitoMiccional: 'Normal',
  habitoDefecatorio: 'Normal',
  actividadSexualProteccion: '',
  encuestaAlimentaria: '',
  estadoSueno: 'Conservado',
  horasSueno: '',
  dificultadConciliacion: 'Niega',
  dificultadMantencion: 'Niega',
  
  phq9_interes: '',
  phq9_animo: '',
  phq9_sueno: '',
  phq9_energia: '',
  phq9_apetito: '',
  phq9_culpa: '',
  phq9_concentracion: '',
  phq9_motor: '',
  phq9_suicidio: '',

  animo_estadoAnimo: '',
  animo_habitoSueno: '',
  animo_percepcionSalud: 'Salud, autonomía y funcionalidad conservadas.',
  animo_ideacionSuicida: '',

  escolaridad: '',
  ocupacion: '',
  antecedentesFamiliaresRelevantes: '',
  viveCon: '',
  factoresProtectores: '',
  estadoCivilHijos: '',
  redesApoyo: '',
  percepcionSituacionEconomica: '',
  espiritualidad: '',
  laboratorioFecha: '',
  laboratorioResultados: '', 
  ekgFecha: '',
  ekgResultado: '',
  otrasImagenesFecha: '',
  otrasImagenesResultados: '',
  peso: '',
  talla: '',
  imc: '',
  pa: '',
  fc: '',
  cc: '',
  efGeneralSegmentario: initialExamenFisicoText,
  
  integralIndividual: '',
  integralFamiliar: '',
  integralTipologia: '',
  integralCronicas: '',
  integralRiesgoCv: '',

  pccPersonaFamilia: '',
  pccEquipoSalud: '',
  tomaDecisionesCompartidas: '',
  pccObjetivos: [],

  acuerdoPlanEquipo: 'Sí',
  acuerdoContactoSeguimiento: 'Sí',
  
  planEcicepLabsRutina: false,
  planEcicepEKG: false,
  planEcicepHBA1C: false,
  planEcicepHBA1CTiempo: '',
  planEcicepFondoOjo: false,
  planEcicepCtrlPiesEnf: false,
  planEcicepInterconsulta: false,
  planEcicepInterconsultaEspecialidad: '',
  
  planProximoControlDupla: '',
  planProximoControlTiempo: '',

  indicaciones: '', 
  cv_sintoma_ortopnea: false,
  cv_sintoma_dpn: false,
  cv_sintoma_nicturia: false,
  cv_sintoma_edema: false,
  cv_sintoma_angor: false,
  cv_sintoma_palpitaciones: false,
  cv_sintoma_polidipsia: false,
  cv_sintoma_poliuria: false,
  cv_sintoma_polifagia: false,
  cv_sintoma_perdida_peso: false,
  era_sintoma_tos: false,
  era_sintoma_opresion: false,
  era_sintoma_rinorrea: false,
  era_sintoma_estornudos: false,
  era_sintoma_prurito: false,
  era_sintoma_limitan: false,
  era_sintoma_diarios: false,
  era_sintoma_nocturnos: false,
  era_sintoma_sbt_sos: false,
  era_sintoma_urgencias: false,
  era_sintoma_corticoides: false,
  era_desencadenante_mascotas: false,
  era_desencadenante_higiene: false,
  era_desencadenante_alfombras: false,
  era_desencadenante_tabaco_ambiental: false,
  era_desencadenante_cocina: false,
  era_desencadenante_calefaccion: false,
  sm_sintoma_animo: '',
  sm_sintoma_ansiosos: '',
  sm_sintoma_somatizaciones: '',
  sm_sintoma_sueno: '',
  sm_sintoma_psicoticos: '',
  sm_sintoma_suicidio: '',
  sm_em_descripcion: '',
  sm_em_conciencia: '',
  sm_em_lenguaje: '',
  sm_em_psicomotricidad: '',
  sm_em_pensamiento: '',
  sm_em_percepcion: '',
  sm_em_intelectual: '',
  sm_em_juicio: '',
  sm_em_insight: '',
  // Initialized for control form
  objetivosAnteriores: [
    { acuerdo: '', acciones: '', plazo: '', responsables: '', cumplio: '', aclaracionNoCumplimiento: '', seguimiento: '' },
    { acuerdo: '', acciones: '', plazo: '', responsables: '', cumplio: '', aclaracionNoCumplimiento: '', seguimiento: '' }
  ],
};

interface CheckboxClarificationItem {
  keyBase: keyof FichaControlDemencias2026FormData; 
  label: string;
}

const habitosCheckboxConfig: CheckboxClarificationItem[] = [
    { keyBase: 'alcohol', label: 'Alcohol' },
    { keyBase: 'tabaco', label: 'Tabaco' },
    { keyBase: 'drogas', label: 'Drogas' },
];

interface FichaControlDemenciasProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlDemencias: React.FC<FichaControlDemenciasProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlDemencias2026FormData>('local_FichaControlDemencias', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isPhq9ModalOpen, setIsPhq9ModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);
  const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);
  
  const [isLabLoading, setIsLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const handleAiImport = async (pastedText: string) => {
    setIsAiImporting(true);
    try {
        const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });
        const response = await ai.models.generateContent({
            model: 'llama-3.2-90b-vision-preview',
            contents: `Analiza el registro clínico y extrae JSON para Ficha de Demencias: "${pastedText.replace(/"/g, "'")}"`,
            config: { responseMimeType: 'application/json' },
        });
        const parsedData = JSON.parse(response.text.trim());
        setFormData(prev => ({ ...prev, ...parsedData }));
        alert('Datos importados.');
        setIsImportModalOpen(false); 
    } catch (error) {
        alert("Error al importar.");
    } finally { setIsAiImporting(false); }
  };

  const calculateIMC = (pesoStr: string, tallaStr: string): string => {
    const peso = parseFloat(pesoStr);
    const tallaCm = parseFloat(tallaStr);
    if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
      const tallaM = tallaCm / 100;
      return (peso / (tallaM * tallaM)).toFixed(2);
    }
    return '';
  };
  
  useEffect(() => {
    const newImc = calculateIMC(formData.peso, formData.talla);
    if (newImc !== formData.imc) {
        setFormData(prev => ({ ...prev, imc: newImc }));
    }
  }, [formData.peso, formData.talla, formData.imc]);
  
  useEffect(() => {
    const cigs = parseInt(formData.ipaNroCigarrillos, 10);
    const years = parseInt(formData.ipaNroAnos, 10);
    if (!isNaN(cigs) && !isNaN(years) && cigs > 0 && years > 0) {
        setFormData(prev => ({ ...prev, ipaResultado: ((cigs * years) / 20).toFixed(1) }));
    }
  }, [formData.ipaNroCigarrillos, formData.ipaNroAnos]);

  const phq9Score = useMemo(() => {
    return phq9Questions.reduce((total, q) => total + (parseInt(formData[q.key as keyof FichaControlDemencias2026FormData] as string, 10) || 0), 0);
  }, [formData]);

  const phq9Interpretation = useMemo(() => {
    const score = phq9Score;
    let severity = score <= 4 ? 'Mínima' : score <= 9 ? 'Leve' : score <= 14 ? 'Moderada' : score <= 19 ? 'Moderadamente Severa' : 'Severa';
    return { score, severity, action: 'Reevaluar según evolución.' };
  }, [phq9Score]);

  const calculateGeneratedTextParts = useCallback(() => {
    let anam = `FICHA CONTROL DEMENCIAS\n`;
    anam += `---------------------------------------\n`;
    anam += `FECHA CONTROL: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) anam += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    anam += `MOTIVO DE CONSULTA: CONTROL DEMENCIAS\n`;
    anam += `---------------------------------------\n\n`;

    const getVal = (key: keyof FichaControlDemencias2026FormData) => {
      const val = formData[key];
      if (typeof val === 'boolean') return val ? 'Sí' : 'No';
      return (val && String(val).trim()) ? val : 'No explorado.';
    };

    anam += `ANTECEDENTES:\n- Morbilidad: ${getVal('morbilidad')}\n- Fármacos: ${getVal('farmacos')}\n\n`;
    anam += `ESTADO ÁNIMO: PHQ-9 Score ${phq9Interpretation.score} (${phq9Interpretation.severity})\n`;

    let expl = `EXPLORACIÓN:\n- Peso: ${getVal('peso')}kg, PA: ${getVal('pa')}mmHg\n- Ex. Físico:\n${getVal('efGeneralSegmentario')}\n\n`;
    let actu = `VALORACIÓN Y PLAN:\n- Indicaciones:\n${getVal('indicaciones')}\n`;

    setAnamnesisText(anam.trim());
    setExploracionText(expl.trim());
    setActuacionText(actu.trim());
  }, [formData, loggedInUser, phq9Interpretation]);

  useEffect(() => { calculateGeneratedTextParts(); }, [calculateGeneratedTextParts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleRadioChange = useCallback((name: keyof FichaControlDemencias2026FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleExportPdf = async () => {
    if (!loggedInUser) return;
    setStatus(FormStatus.Generating);
    try {
      await generateClinicalRecordPdf({ title: 'CONTROL DEMENCIAS (2026)', content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}` }, loggedInUser);
    } finally { setStatus(FormStatus.Idle); }
  };

  const renderRadioGroup = (label: string, name: keyof FichaControlDemencias2026FormData, options: {value: string, label: string}[]) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}:</label>
      <div className="flex items-center space-x-4">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center text-sm">
            <input type="radio" name={name} value={opt.value} checked={formData[name] === opt.value} onChange={handleChange as any} className="form-radio h-4 w-4 text-sky-600" />
            <span className="ml-2 text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const handleUpdateObjetivoAnterior = (index: number, field: keyof ObjetivoAnterior, value: string) => {
    setFormData(prev => {
        const newObjetivos = [...prev.objetivosAnteriores];
        newObjetivos[index] = { ...newObjetivos[index], [field]: value };
        return { ...prev, objetivosAnteriores: newObjetivos };
    });
  };

  const handleUpdatePccObjetivo = (index: number, field: keyof PccObjetivo, value: string) => {
    setFormData(prev => {
        const newObjetivos = [...(prev.pccObjetivos || [])];
        newObjetivos[index] = { ...newObjetivos[index], [field]: value };
        return { ...prev, pccObjetivos: newObjetivos };
    });
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">CONTROL DEMENCIAS (2026)</h2>
        <p className="text-slate-500 mt-2 font-medium">Formulario de seguimiento clínico especializado.</p>
      </header>
      
      <div className="mb-6">
          <button 
              onClick={() => setIsImportModalOpen(true)} 
              disabled={loggedInUser?.profession !== 'medicina'}
              className="w-full px-6 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
              {loggedInUser?.profession === 'medicina' ? 'IMPORTAR CONTROL ANTERIOR' : 'No disponible'}
          </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
        <div className="lg:w-3/5 xl:w-7/12 space-y-6 flex-shrink-0 pr-3 pb-16">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            
            <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-sky-700 border-b border-sky-100 pb-2 mb-4">IDENTIFICACIÓN</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateField label="Fecha Control" id="fechaIngreso" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange as any} />
                    <FormField label="Estratificación" id="estratificacion" name="estratificacion" value={formData.estratificacion} onChange={handleChange as any} />
                </div>
            </section>

            <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-sky-700 border-b border-sky-100 pb-2 mb-4">ANAMNESIS Y EVOLUCIÓN</h3>
                <FormField label="Morbilidad" id="morbilidad" name="morbilidad" value={formData.morbilidad} onChange={handleChange as any} isTextArea rows={2} />
                <div className="mt-4">
                    <FormField label="Fármacos" id="farmacos" name="farmacos" value={formData.farmacos} onChange={handleChange as any} isTextArea rows={3} />
                    <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={(v) => setFormData(p => ({...p, farmacos: v}))} />
                </div>
                <div className="mt-6">
                    <button type="button" onClick={() => setIsPhq9ModalOpen(true)} className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow hover:bg-sky-700 transition-all">EVALUAR PHQ-9</button>
                </div>
            </section>

            <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-sky-700 border-b border-sky-100 pb-2 mb-4">EXAMEN FÍSICO</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange as any} type="number" />
                    <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa} onChange={handleChange as any} />
                    <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc} onChange={handleChange as any} type="number" />
                </div>
                <FormField label="Hallazgos Examen Físico" id="efGeneralSegmentario" name="efGeneralSegmentario" value={formData.efGeneralSegmentario} onChange={handleChange as any} isTextArea rows={6} containerClassName="mt-4" />
            </section>

            <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-sky-700 border-b border-sky-100 pb-2 mb-4">PLAN E INDICACIONES</h3>
                <FormField label="Indicaciones" id="indicaciones" name="indicaciones" value={formData.indicaciones} onChange={handleChange as any} isTextArea rows={6} />
            </section>
          </form>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">RESUMEN CONTROL DEMENCIAS</h3>
          <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden w-full">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                <label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                <button onClick={() => navigator.clipboard.writeText(anamnesisText)} className="text-[10px] bg-slate-200 px-2 py-0.5 font-bold text-slate-600 rounded uppercase">Copiar</button>
              </div>
              <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                <button onClick={() => navigator.clipboard.writeText(exploracionText)} className="text-[10px] bg-slate-200 px-2 py-0.5 font-bold text-slate-600 rounded uppercase">Copiar</button>
              </div>
              <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                <button onClick={() => navigator.clipboard.writeText(actuacionText)} className="text-[10px] bg-slate-200 px-2 py-0.5 font-bold text-slate-600 rounded uppercase">Copiar</button>
              </div>
              <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-10 border-t border-slate-200">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl transition-all">VOLVER AL MENÚ</button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button onClick={handleExportPdf} disabled={status === FormStatus.Generating} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6V4.414L14.586 8H11z" clipRule="evenodd" /></svg>
            {status === FormStatus.Generating ? 'EXPORTANDO...' : 'EXPORTAR A PDF'}
          </button>
          <button onClick={() => setFormData(initialFormData)} className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-black rounded-xl shadow-lg transition-all">LIMPIAR FORMULARIO</button>
        </div>
      </div>
      
      <PHQ9Modal isOpen={isPhq9ModalOpen} onClose={() => setIsPhq9ModalOpen(false)} formData={formData} handleRadioChange={handleRadioChange as any} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onConfirmImport={handleAiImport} isImporting={isAiImporting} title="Importar Control Demencias" description="Pegue aquí el texto del control anterior para autocompletar la ficha." />
    </div>
  );
};

export default FichaControlDemencias;
