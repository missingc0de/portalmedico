
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FichaControlSalaEraFormData, FormStatus, User, PccObjetivo } from '../types';
import FormField from './FormField';
import CopyButton from './CopyButton';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import { generateClinicalRecordPdf, generateAtencionResumenPdf } from '../services/pdfGenerator';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';
import ImportModal from './ImportModal';
import { canUseAI } from '../utils/aiRestrictions';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';
import DateField from './DateField';
import { Printer, Trash2, FileText, Plus } from 'lucide-react';
import { predefinedPccPlansEraIra } from '../data/pccPlanesEraIra';

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
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 ease-in-out text-slate-700 placeholder-slate-400 overflow-hidden min-h-[42px] text-sm"
      />
    </div>
  );
};

const initialExamenFisicoText = `- Buenas condiciones generales.
- Hidratado, bien perfundido.
- Faringe sin lesiones.
- Cuellos sin adenopatías palpables, yugulares planas.
- Cardiovascular: RR2T, SS.
- Pulmonar: MP(+) SRA.
- Abdomen: RHA (+), blando, deprimible, indoloro, sin signos de irritación peritoneal.
- Extremidades: EEII simétricas, sin edema, sin signos de TVP. Sensibilidad (+), bien perfundido a distal. Sin lesiones.
- Neurológico: Conservado, GCS 15/15.`;

const antecedenteMedicoEraTexts: Record<keyof Pick<FichaControlSalaEraFormData, 'antecedeEraAsma' | 'antecedeEraEpoc' | 'antecedeEraErge' | 'antecedeEraCancerPulmon'>, string> = {
  antecedeEraAsma: "Asma",
  antecedeEraEpoc: "EPOC (Enfermedad Pulmonar Obstructiva Crónica)",
  antecedeEraErge: "ERGE (Enfermedad por Reflujo Gastroesofágico)",
  antecedeEraCancerPulmon: "Cáncer de pulmón",
};

const mMRCOptions = [
    { score: '0', text: 'Me ahogo solo con el ejercicio intenso.' },
    { score: '1', text: 'Me ahogo al apurarme en lo plano o al subir una pendiente poco pronunciada.' },
    { score: '2', text: 'Camino más lento que la gente de mi misma edad en lo plano debido a la falta de aire, o tengo que parar para respirar al caminar a mi propio paso en lo plano.' },
    { score: '3', text: 'Me detengo para respirar después de caminar unos 100 metros o después de unos pocos minutos en lo plano.' },
    { score: '4', text: 'La falta de aire mi impide salir de casa o me ahogo al vestirme.' },
];

const initialFormData: FichaControlSalaEraFormData = {
  edad: '',
  acompanante: 'Sin acompañante',
  acompananteOtroAclaracion: '',
  antecedentesMedicos: '',
  antecedeEraAsma: false,
  antecedeEraEpoc: false,
  antecedeEraErge: false,
  antecedeEraCancerPulmon: false,
  alergias: false, 
  alergiasAclaracion: '',
  farmacos: '',
  adherenciaTratamiento: 'Sí',
  hospitalizaciones: false,
  hospitalizacionesAclaracion: '',
  neumonia: false,
  pneumoniaAclaracion: '',
  exacerbaciones: false,
  exacerbacionesAclaracion: '',
  corticoidesSistemicosAntecedente: false,
  corticoidesSistemicosAntecedenteAclaracion: '',
  tabaquismo: false,
  tabaquismoAclaracion: '',
  ipaNroCigarrillos: '',
  ipaNroAnos: '',
  ipaResultado: '',
  alcohol: false,
  alcoholAclaracion: '',
  drogas: false,
  drogasAclaracion: '',
  exposicionVolatiles: false,
  exposicionVolatilesAclaracion: '',
  antecedentesFamiliaresResp: false,
  antecedentesFamiliaresRespAclaracion: '',
  laboratorioFecha: '',
  laboratorioResultados: '',
  historiaActual: 'Buen control de su patología respiratoria. Sin exacerbaciones recientes. Refiere tolerancia adecuada a las actividades de la vida diaria, sin limitación funcional significativa. Sin efectos adversos atribuibles al tratamiento y con uso correcto de la técnica inhalatoria. Sin otros síntomas de relevancia en la anamnesis actual.',
  sintomasTosRisaEjercicioFrio: false,
  sintomasTosRisaEjercicioFrioAclaracion: '',
  sintomasSensacionOpresionToracica: false,
  sintomasSensacionOpresionToracicaAclaracion: '',
  sintomasRinorrea: false,
  sintomasRinorreaAclaracion: '',
  sintomasEstornudosSalva: false,
  sintomasEstornudosSalvaAclaracion: '',
  sintomasPruritoNasalOcular: false,
  sintomasPruritoNasalOcularAclaracion: '',
  sintomasLimitanActividades: false,
  sintomasLimitanActividadesAclaracion: '',
  sintomasDiarios: false, 
  sintomasDiariosAclaracion: '',
  sintomasNocturnos: false,
  sintomasNocturnosAclaracion: '',
  sintomasRequerimientoSbtSos: false,
  sintomasRequerimientoSbtSosAclaracion: '',
  sintomasConsultasSapuUrgencias: false,
  sintomasConsultasSapuUrgenciasAclaracion: '',
  sintomasUsoCorticoidesSistemicos: false,
  sintomasUsoCorticoidesSistemicosAclaracion: '',
  mMRCScore: '',
  desencadenantesMascotas: false,
  desencadenantesMascotasAclaracion: '',
  desencadenantesHigieneHogar: false,
  desencadenantesHigieneHogarAclaracion: '',
  desencadenantesAlfombras: false,
  desencadenantesAlfombrasAclaracion: '',
  desencadenantesHabitoTabaquicoAmbiental: false,
  desencadenantesHabitoTabaquicoAmbientalAclaracion: '',
  desencadenantesCocinaLenaCarbon: false,
  desencadenantesCocinaLenaCarbonAclaracion: '',
  desencadenantesCalefaccion: false,
  desencadenantesCalefaccionAclaracion: '',
  efPielMucosas: '',
  efMucosaNasal: '',
  efCavidadOral: '',
  efCardiologico: '',
  efPulmonar: '',
  efGeneralAdicional: initialExamenFisicoText,
  planEducacionPatologiaPrevencion: '',
  planEducacionUsoAerocamara: '',
  planVacunas: 'Se indica vacuna anti-influenza, neumococo, COVID 19.',
  planConsultarUrgenciasSos: '',
  planOtros: `- Educación sobre patología.
- Prevención de exposición a alérgenos.
- Se deriva a vacunatorio.
- Pautas de alarma.
- Acudir a urgencias SOS.`,
  espirometriaResultados: [],
  espirometriaInterpretacion: '',
  pccPersonaFamilia: '',
  pccEquipoSalud: '',
  tomaDecisionesCompartidas: '',
  opcionesConversadas: '',
  pccObjetivos: [],
  indicaciones: '',
};

interface CheckboxClarificationItem {
  keyBase: keyof FichaControlSalaEraFormData; 
  label: string;
  subLabel?: string; 
}

const antecedenteMedicoEraCheckboxConfig: Array<{ key: keyof FichaControlSalaEraFormData, label: string, text: string }> = [
    { key: 'antecedeEraAsma', label: 'Asma', text: antecedenteMedicoEraTexts.antecedeEraAsma },
    { key: 'antecedeEraEpoc', label: 'EPOC', text: antecedenteMedicoEraTexts.antecedeEraEpoc },
    { key: 'antecedeEraErge', label: 'ERGE', text: antecedenteMedicoEraTexts.antecedeEraErge },
    { key: 'antecedeEraCancerPulmon', label: 'Cáncer de Pulmón', text: antecedenteMedicoEraTexts.antecedeEraCancerPulmon },
];

const generalCheckboxConfig: CheckboxClarificationItem[] = [
    { keyBase: 'hospitalizaciones', label: 'Hospitalizaciones' },
    { keyBase: 'neumonia', label: 'Cuadros neumónicos' },
    { keyBase: 'exacerbaciones', label: 'Exacerbaciones' },
    { keyBase: 'alergias', label: 'Alergias' },
];

const habitsCheckboxConfig: CheckboxClarificationItem[] = [
    { keyBase: 'tabaquismo', label: 'Tabaquismo' },
    { keyBase: 'alcohol', label: 'Alcohol' },
    { keyBase: 'drogas', label: 'Drogas' },
    { keyBase: 'exposicionVolatiles', label: 'Exposición laboral y/o ambiental a volátiles' },
    { keyBase: 'antecedentesFamiliaresResp', label: 'Antecedentes familiares de enfermedad respiratoria' },
];

const sintomasConfig: CheckboxClarificationItem[] = [
    { keyBase: 'sintomasTosRisaEjercicioFrio', label: 'Tos con risa/ejercicio/frío' },
    { keyBase: 'sintomasSensacionOpresionToracica', label: 'Sensación opresión torácica' },
    { keyBase: 'sintomasRinorrea', label: 'Rinorrea' },
    { keyBase: 'sintomasEstornudosSalva', label: 'Estornudos en salva' },
    { keyBase: 'sintomasPruritoNasalOcular', label: 'Prurito nasal/ocular' },
    { keyBase: 'sintomasLimitanActividades', label: 'Limitan actividades' },
    { keyBase: 'sintomasDiarios', label: 'Síntomas diarios', subLabel: '(>2 veces/semana)' },
    { keyBase: 'sintomasNocturnos', label: 'Síntomas nocturnos' },
    { keyBase: 'sintomasRequerimientoSbtSos', label: 'Requerimiento SBT SOS' },
    { keyBase: 'sintomasUsoCorticoidesSistemicos', label: 'Uso de corticoides sistémicos (actual/reciente)' },
];

const desencadenantesAmbientalesConfig: CheckboxClarificationItem[] = [
  { keyBase: 'desencadenantesMascotas', label: 'Mascotas' },
  { keyBase: 'desencadenantesHigieneHogar', label: 'Higiene de hogar' },
  { keyBase: 'desencadenantesAlfombras', label: 'Alfombras' },
  { keyBase: 'desencadenantesHabitoTabaquicoAmbiental', label: 'Hábito tabáquico ambiental' },
  { keyBase: 'desencadenantesCocinaLenaCarbon', label: 'Cocina a leña/carbón' },
  { keyBase: 'desencadenantesCalefaccion', label: 'Calefacción' },
];

interface FichaControlSalaEraProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<{ exportPdf: () => void; newForm: () => void; remClick?: () => void } | null>;
}

const FichaControlSalaEra: React.FC<FichaControlSalaEraProps> = ({ onBackToMenu, loggedInUser, actionsRef }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlSalaEraFormData>('local_FichaControlSalaEra', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  // Use stable handler refs to avoid infinite re-render loops
  const salaEraHandlersRef = React.useRef<{
    exportPdf?: () => void;
    newForm?: () => void;
    remClick?: () => void;
  }>({});

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: () => salaEraHandlersRef.current.exportPdf?.(),
        newForm: () => salaEraHandlersRef.current.newForm?.(),
        remClick: () => salaEraHandlersRef.current.remClick?.(),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isSpiroLoading, setIsSpiroLoading] = useState(false);
  const [spiroError, setSpiroError] = useState<string | null>(null);
  const spiroFileRef = useRef<HTMLInputElement>(null);
  const [proximosControles, setProximosControles] = useState<{ id: number; tiempo: string; profesional: string }[]>([{ id: Date.now(), tiempo: '3 meses', profesional: 'médico' }]);
  const [showRemActive, setShowRemActive] = useState(false);

  // PCI & Toma de decisiones compartidas states
  const [isPredefinedPlanOpen, setIsPredefinedPlanOpen] = useState(false);
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const predefinedPlanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (predefinedPlanRef.current && !predefinedPlanRef.current.contains(event.target as Node)) {
        setIsPredefinedPlanOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPredefinedPlans = React.useMemo(() => {
    if (!planSearchTerm.trim()) return predefinedPccPlansEraIra;
    const term = planSearchTerm.toLowerCase();
    return predefinedPccPlansEraIra.filter(p =>
      p.objetivo.toLowerCase().includes(term) ||
      p.acuerdo.toLowerCase().includes(term) ||
      p.acciones.toLowerCase().includes(term)
    );
  }, [planSearchTerm]);

  const handleAddPccObjetivo = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [
        ...(prev.pccObjetivos || []),
        { objetivo: '', acuerdo: '', acciones: '', plazo: 'Próximo control ERA/IRA.', responsables: 'Persona.', seguimiento: 'En 2 meses.' }
      ]
    }));
  }, [setFormData]);

  const handleAddPredefinedPlan = useCallback((plan: PccObjetivo) => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [...(prev.pccObjetivos || []), { ...plan }]
    }));
    setIsPredefinedPlanOpen(false);
    setPlanSearchTerm('');
  }, [setFormData]);

  const handleRemovePccObjetivo = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: (prev.pccObjetivos || []).filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const handleUpdatePccObjetivo = useCallback((index: number, field: keyof PccObjetivo, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.pccObjetivos || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pccObjetivos: updated };
    });
  }, [setFormData]);

  const tiempoControlOptions = ['1 mes', '2 meses', '3 meses', '4 meses', '5 meses', '6 meses', '12 meses'];
  const profesionalOptions = ['médico', 'kinesiólogo'];

  const addControl = useCallback(() => {
    setProximosControles(prev => {
      if (prev.length >= 2) return prev;
      return [...prev, { id: Date.now(), tiempo: '', profesional: 'médico' }];
    });
  }, []);

  const updateControl = useCallback((id: number, field: 'tiempo' | 'profesional', value: string) => {
    setProximosControles(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  }, []);

  const removeControl = useCallback((id: number) => {
    setProximosControles(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleSpirometryFileAnalysis = async (file: File | null) => {
    if (!file) return;
    
    // Check AI restrictions
    const check = canUseAI(loggedInUser);
    if (!check.allowed) {
        setSpiroError(check.reason || 'No tiene permiso para usar esta función.');
        return;
    }

    setIsSpiroLoading(true);
    setSpiroError(null);
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
        if (!event.target?.result) return;
        try {
            const dataUrl = event.target.result as string;
            const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
            const ai = getAiClient();
            const response = await ai.models.generateContent({
              model: 'Groq-flash-latest',
              contents: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: "Analiza la espirometría y extrae parámetros en JSON (results: [], interpretation: string)." }],
              config: { responseMimeType: 'application/json' },
            });
            const parsedData = JSON.parse(response.text.trim());
            setFormData(prev => ({ ...prev, espirometriaResultados: parsedData.results, espirometriaInterpretacion: parsedData.interpretation }));
        } catch (apiError) { setSpiroError('Error al analizar espirometría.'); } finally { setIsSpiroLoading(false); }
    };
    fileReader.readAsDataURL(file);
  };

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert(`'${partName}' copiado al portapapeles.`))
      .catch(err => alert('Error al copiar texto.'));
  };

  const handleNewDocument = () => {
    if (window.confirm("¿Seguro que desea borrar todo el contenido de la ficha actual?")) {
        setFormData(initialFormData);
        setAnamnesisText('');
        setExploracionText('');
        setActuacionText('');
        setProximosControles([{ id: Date.now(), tiempo: '3 meses', profesional: 'Médico' }]);
        setStatus(FormStatus.Idle);
    }
  };

  const handleRemClick = () => {
    setShowRemActive(true);
    setTimeout(() => {
        setShowRemActive(false);
    }, 3000);
  };

  useEffect(() => {
    const cigs = parseInt(formData.ipaNroCigarrillos, 10);
    const years = parseInt(formData.ipaNroAnos, 10);
    if (!isNaN(cigs) && !isNaN(years) && cigs > 0 && years > 0) {
        setFormData(prev => ({ ...prev, ipaResultado: ((cigs * years) / 20).toFixed(1) }));
    }
  }, [formData.ipaNroCigarrillos, formData.ipaNroAnos]);

  const isIraAge = useCallback(() => {
    const numericPart = parseInt(formData.edad, 10);
    if (isNaN(numericPart)) return false;
    if (formData.edad.toLowerCase().includes('m')) return true;
    return numericPart >= 0 && numericPart <= 17;
  }, [formData.edad]);

  const calculateGeneratedTextParts = useCallback(() => {
    const isIra = isIraAge();
    let anam = `FICHA CONTROL SALA ${isIra ? 'IRA' : 'ERA'}\n---------------------------------------\nFECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) anam += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    
    const formattedCompanion = formData.acompanante === 'Otro (aclare)' && formData.acompananteOtroAclaracion 
      ? formData.acompananteOtroAclaracion 
      : formData.acompanante;

    anam += `---------------------------------------\n\nDATOS GENERALES:\nEdad: ${formData.edad || 's/i'} | Acompañante: ${formattedCompanion}\n`;
    anam += `Antecedentes médicos:\n${formData.antecedentesMedicos.trim() || 'No ingresado.'}\n`;
    const farmacosVal = formData.farmacos.trim();
    if (farmacosVal) {
        anam += `Fármacos:\n${farmacosVal}\n`;
    } else {
        anam += `Fármacos: No ingresado.\n`;
    }
    const checkAlergias = formData.alergias as boolean;
    const aclAlergias = formData.alergiasAclaracion;
    if (checkAlergias) {
        anam += `Alergias: Sí.${aclAlergias ? ` ${aclAlergias}` : ''}\n`;
    } else {
        anam += `Alergias: Niega.\n`;
    }
    anam += `Adherencia a tratamiento: ${formData.adherenciaTratamiento || 's/i'}\n`;
    
    const addCheckbox = (label: string, key: keyof FichaControlSalaEraFormData, prefix: string = '- ') => {
        const check = formData[key] as boolean;
        const acl = formData[`${String(key)}Aclaracion` as keyof FichaControlSalaEraFormData] as string;
        
        const isHabit = ['tabaquismo', 'alcohol', 'drogas', 'exposicionVolatiles', 'antecedentesFamiliaresResp'].includes(String(key));
        const isPeriodNiega = isHabit || String(key).startsWith('sintomas') || String(key).startsWith('desencadenantes');
        const defaultText = isPeriodNiega ? 'Niega.' : 'Niega';

        if (check) {
            if (isHabit) {
                anam += `${prefix}${label}: Sí.${acl ? ` ${acl}` : ''}\n`;
            } else {
                anam += `${prefix}${label}: Sí${acl ? ` (${acl})` : ''}\n`;
            }
        } else {
            anam += `${prefix}${label}: ${defaultText}\n`;
        }
    };

    addCheckbox("Hospitalizaciones", "hospitalizaciones", "");
    addCheckbox("Cuadros neumónicos", "neumonia", "");
    addCheckbox("Exacerbaciones", "exacerbaciones", "");

    anam += `\nFACTORES DE RIESGO:\n`;
    addCheckbox("Tabaquismo", "tabaquismo");
    addCheckbox("Alcohol", "alcohol");
    addCheckbox("Drogas", "drogas");
    addCheckbox("Exposición laboral y/o ambiental a volátiles", "exposicionVolatiles");
    addCheckbox("Antecedentes familiares de enfermedad respiratoria", "antecedentesFamiliaresResp");
    if (formData.tabaquismo && formData.ipaResultado) anam += `  IPA: ${formData.ipaResultado}\n`;
    
    anam += `\nHISTORIA ACTUAL:\n${formData.historiaActual || 's/i'}\n\nSÍNTOMAS:\n`;
    sintomasConfig.forEach(s => addCheckbox(s.label, s.keyBase));
    if (formData.mMRCScore) anam += `mMRC: ${formData.mMRCScore}\n`;
    
    anam += `\nDESENCADENANTES:\n`;
    desencadenantesAmbientalesConfig.forEach(d => addCheckbox(d.label, d.keyBase));

    const formatToDDMMYYYY = (isoDate: string) => {
        if (!isoDate) return '';
        const parts = isoDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return isoDate;
    };

    let expl = ``;
    if (formData.laboratorioFecha || formData.laboratorioResultados) {
        expl += `ÚLTIMO LABORATORIO ${formatToDDMMYYYY(formData.laboratorioFecha)}\n${formData.laboratorioResultados || 'No ingresado.'}\n\n`;
    }
    expl += `EXAMEN FÍSICO:\n${formData.efGeneralAdicional || 's/i'}\n`;

    let planText = formData.planOtros;
    const defaultControlLine = '- Próximo control con médico/kinesiólogo en X meses.';
    const controlLines = proximosControles
        .filter(c => c.tiempo)
        .map(c => `- Próximo control con ${c.profesional.toLowerCase()} en ${c.tiempo}.`)
        .join('\n');

    if (controlLines) {
        if (planText.includes(defaultControlLine)) {
            planText = planText.replace(defaultControlLine, controlLines);
        } else {
            planText = controlLines + '\n' + planText;
        }
    }

    let pciText = '';
    const hasPciData = formData.pccPersonaFamilia || formData.pccEquipoSalud || formData.tomaDecisionesCompartidas || formData.opcionesConversadas || ((formData.pccObjetivos || []).length > 0);
    if (hasPciData) {
        pciText += `PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS:\n`;
        if (formData.pccPersonaFamilia || formData.pccEquipoSalud) {
            pciText += `Problemas visualizados:\n`;
            if (formData.pccPersonaFamilia) pciText += `- Persona y familia: ${formData.pccPersonaFamilia}\n`;
            if (formData.pccEquipoSalud) pciText += `- Equipo de salud: ${formData.pccEquipoSalud}\n`;
        }
        if (formData.tomaDecisionesCompartidas) {
            pciText += `Priorización de problemas: ${formData.tomaDecisionesCompartidas}\n`;
        }
        if (formData.opcionesConversadas) {
            pciText += `Opciones conversadas: ${formData.opcionesConversadas}\n`;
        }
        if ((formData.pccObjetivos || []).length > 0) {
            pciText += `Objetivos / Metas respiratorias acordadas:\n`;
            (formData.pccObjetivos || []).forEach((obj, idx) => {
                pciText += `#${idx + 1}: ${obj.objetivo || 's/i'}\n`;
                if (obj.acuerdo) pciText += `  Acuerdo: ${obj.acuerdo}\n`;
                if (obj.acciones) pciText += `  Acciones: ${obj.acciones}\n`;
                if (obj.plazo) pciText += `  Plazo: ${obj.plazo}\n`;
                if (obj.responsables) pciText += `  Responsable: ${obj.responsables}\n`;
            });
        }
        pciText += `\n`;
    }

    let actu = (pciText + planText).trim();
    
    return { anamnesis: anam.trim(), exploracion: expl.trim(), actuacion: actu.trim() };
  }, [formData, loggedInUser, proximosControles, isIraAge]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
    setStatus(FormStatus.TextGenerated);
  }, [calculateGeneratedTextParts]);

  const handleExportPdf = async () => {
    if (!loggedInUser) {
      alert('Error: Usuario no identificado.');
      return;
    }
    setStatus(FormStatus.Generating);
    const titleText = isIraAge() ? 'RESUMEN CONTROL SALA IRA' : 'RESUMEN CONTROL SALA ERA';
    const firstControl = proximosControles.find(c => c.tiempo) || proximosControles[0];
    try {
      await generateAtencionResumenPdf({
        ...formData,
        proximoControlTiempo: firstControl?.tiempo,
        proximoControlDupla: firstControl?.profesional,
        indicaciones: formData.planOtros || formData.indicaciones,
        actuacionText,
      }, loggedInUser, {
        title: titleText,
        hasPci: true,
        filePrefix: isIraAge() ? 'Resumen_Sala_IRA' : 'Resumen_Sala_ERA'
      });
    } finally { 
      setStatus(FormStatus.Idle); 
    }
  };

  // Update stable handler refs with latest implementations (no re-render triggered)
  salaEraHandlersRef.current.exportPdf = handleExportPdf;
  salaEraHandlersRef.current.newForm = handleNewDocument;
  salaEraHandlersRef.current.remClick = handleRemClick;

  const renderCheckboxField = (item: CheckboxClarificationItem) => {
    const isChecked = formData[item.keyBase] as boolean;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaControlSalaEraFormData;
    return (
        <div key={String(item.keyBase)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
                <input type="checkbox" id={String(item.keyBase)} name={String(item.keyBase)} checked={isChecked} onChange={handleChange as any} className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
                <label htmlFor={String(item.keyBase)} className="text-sm font-normal text-slate-700">{item.label} {item.subLabel && <span className="text-[10px] text-slate-500">{item.subLabel}</span>}</label>
            </div>
            {isChecked && (
                <textarea name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange as any} placeholder="Detalle..." className="mt-2 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-900" />
            )}
        </div>
    );
  };

  const renderCompactCheckbox = (item: CheckboxClarificationItem) => {
    const isChecked = formData[item.keyBase] as boolean;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaControlSalaEraFormData;
    return (
        <div key={String(item.keyBase)} className="mb-2 last:mb-0">
            <div className="flex items-center gap-3">
                <input type="checkbox" id={String(item.keyBase)} name={String(item.keyBase)} checked={isChecked} onChange={handleChange as any} className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
                <label htmlFor={String(item.keyBase)} className="text-sm font-normal text-slate-700">{item.label} {item.subLabel && <span className="text-[10px] text-slate-500">{item.subLabel}</span>}</label>
            </div>
            {isChecked && (
                <textarea name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange as any} placeholder="Detalle..." className="mt-1.5 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-900" />
            )}
        </div>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val = value;
    if (name === 'edad') {
      if (val.toLowerCase().endsWith('m')) {
        const num = val.slice(0, -1).trim();
        if (num && !isNaN(parseInt(num, 10))) {
          val = `${num} meses`;
        }
      }
    }
    if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    else setFormData(prev => ({ ...prev, [name]: val as any }));
  };

  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
                <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">
                <section id="sec-anamnesis-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Antecedentes Generales</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange as any} inputClassName="text-slate-900" />
                      <div>
                        <label htmlFor="acompanante" className="block text-sm font-medium text-slate-700 mb-1.5">Acompañante</label>
                        <select
                          id="acompanante"
                          name="acompanante"
                          value={formData.acompanante}
                          onChange={handleChange as any}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 leading-normal font-sans text-sm"
                        >
                          <option value="Sin acompañante">Sin acompañante</option>
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Otro (aclare)">Otro (aclare)</option>
                        </select>
                        {formData.acompanante === 'Otro (aclare)' && (
                          <input
                            type="text"
                            name="acompananteOtroAclaracion"
                            value={formData.acompananteOtroAclaracion}
                            onChange={handleChange as any}
                            placeholder="Aclare quién..."
                            className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <SmartAntecedentesTextarea
                        label="Antecedentes médicos"
                        id="antecedentesMedicos"
                        name="antecedentesMedicos"
                        value={formData.antecedentesMedicos}
                        onChange={(val) => setFormData(prev => ({ ...prev, antecedentesMedicos: val }))}
                        placeholder="Escriba antecedentes médicos..."
                        bulletListMode={true}
                      />
                    </div>

                    <div className="mt-2">
                      <SmartFarmacosTextarea
                        label="Fármacos"
                        id="farmacos"
                        name="farmacos"
                        value={formData.farmacos}
                        onChange={(val) => setFormData(prev => ({ ...prev, farmacos: val }))}
                        placeholder="Escriba fármacos..."
                      />
                    </div>

                    <div className="mt-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Adherencia a tratamiento:</label>
                      <div className="flex gap-4">
                        {[
                          { value: 'Sí', label: 'Sí' },
                          { value: 'No', label: 'No' },
                        ].map((opt) => (
                          <label key={opt.value} className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="adherenciaTratamiento"
                              value={opt.value}
                              checked={formData.adherenciaTratamiento === opt.value}
                              onChange={handleChange}
                              className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-slate-700 text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-4">
                        {generalCheckboxConfig.map(renderCheckboxField)}
                    </div>
                </section>

                <section id="sec-habitos-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Factores de riesgo</h3>
                    <div className="flex flex-col gap-2">
                      {habitsCheckboxConfig.map(renderCompactCheckbox)}
                    </div>
                </section>

                <section id="sec-historia-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Sintomatología</h3>
                    <AutoExpandingTextArea label="Historia actual" id="historiaActual" name="historiaActual" value={formData.historiaActual} onChange={handleChange as any} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2">
                        {sintomasConfig.map(renderCheckboxField)}
                    </div>
                </section>

                <section id="sec-disnea-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Escala de disnea mMRC</h3>
                    <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm mt-1 w-full bg-white">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 text-xs font-bold uppercase">
                            <th className="px-4 py-2.5 border-r border-slate-300 w-20 text-center">Grado</th>
                            <th className="px-4 py-2.5">Descripción de la Disnea</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mMRCOptions.map((o) => {
                            const isSelected = formData.mMRCScore === o.score;
                            
                            let rowBg = '';
                            if (o.score === '0') rowBg = isSelected ? 'bg-[#EAE8DE]' : 'hover:bg-[#EAE8DE]/30';
                            else if (o.score === '1') rowBg = isSelected ? 'bg-[#DDE9D1]' : 'hover:bg-[#DDE9D1]/30';
                            else if (o.score === '2') rowBg = isSelected ? 'bg-[#D2E0F1]' : 'hover:bg-[#D2E0F1]/30';
                            else if (o.score === '3') rowBg = isSelected ? 'bg-[#FAD0AF]' : 'hover:bg-[#FAD0AF]/30';
                            else if (o.score === '4') rowBg = isSelected ? 'bg-[#E5B5B5]' : 'hover:bg-[#E5B5B5]/30';

                            let gradeCellBg = '';
                            if (o.score === '0') gradeCellBg = 'bg-[#F2F0EA]';
                            else if (o.score === '1') gradeCellBg = 'bg-[#EAF2E6]';
                            else if (o.score === '2') gradeCellBg = 'bg-[#E0EAF6]';
                            else if (o.score === '3') gradeCellBg = 'bg-[#FCDCC6]';
                            else if (o.score === '4') gradeCellBg = 'bg-[#E0A3A3]';

                            return (
                              <tr 
                                key={o.score} 
                                onClick={() => setFormData(prev => ({ ...prev, mMRCScore: o.score }))}
                                className={`cursor-pointer transition-colors border-b border-slate-200 last:border-b-0 ${rowBg}`}
                              >
                                <td className={`px-4 py-3 border-r border-slate-350 text-center font-black text-slate-800 text-sm ${gradeCellBg}`}>
                                  {o.score}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-750 leading-relaxed font-semibold">
                                  {o.text}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                </section>

                <section id="sec-examenes-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Exámenes y exploración física</h3>
                    <div className="mb-0.5">
                      <DateField label="Fecha Examen Laboratorio" id="laboratorioFecha" name="laboratorioFecha" value={formData.laboratorioFecha || ''} onChange={handleChange as any} containerClassName="mb-3" />
                      <FormField label="Resultados de Laboratorio" id="laboratorioResultados" name="laboratorioResultados" value={formData.laboratorioResultados || ''} onChange={handleChange as any} isTextArea rows={4} placeholder="Resultados del último laboratorio..." inputClassName="text-black" />
                    </div>
                    <div className="border-t border-slate-100 pt-1.5 mt-1">
                      <FormField
                        label="Examen Físico General/Segmentario"
                        id="efGeneralAdicional"
                        name="efGeneralAdicional"
                        value={formData.efGeneralAdicional || ''}
                        onChange={handleChange as any}
                        isTextArea
                        rows={10}
                      />
                    </div>
                </section>

                {/* PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS */}
                <section id="sec-pci-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2 flex items-center justify-between">
                    <span>Plan de Cuidado Integral (PCI) y Toma de Decisiones Compartidas</span>
                    <span className="text-xs font-normal text-slate-500 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      Sala ERA / IRA
                    </span>
                  </h3>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Problemas Visualizados</h4>
                    <div className="space-y-2">
                      <AutoExpandingTextArea
                        label="Persona y familia"
                        id="pccPersonaFamilia"
                        name="pccPersonaFamilia"
                        value={formData.pccPersonaFamilia || ''}
                        onChange={handleChange as any}
                        placeholder="Problemas visualizados por el usuario o su familia..."
                      />
                      <AutoExpandingTextArea
                        label="Equipo de salud"
                        id="pccEquipoSalud"
                        name="pccEquipoSalud"
                        value={formData.pccEquipoSalud || ''}
                        onChange={handleChange as any}
                        placeholder="Problemas respiratorios y clínicos identificados por el equipo..."
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Priorización de Problemas</h4>
                    <AutoExpandingTextArea
                      label=""
                      id="tomaDecisionesCompartidas"
                      name="tomaDecisionesCompartidas"
                      value={formData.tomaDecisionesCompartidas || ''}
                      onChange={handleChange as any}
                      placeholder="Acuerdos sobre qué problema abordar en primer lugar..."
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Opciones Conversadas</h4>
                    <AutoExpandingTextArea
                      label=""
                      id="opcionesConversadas"
                      name="opcionesConversadas"
                      value={formData.opcionesConversadas || ''}
                      onChange={handleChange as any}
                      placeholder="Alternativas de tratamiento, medidas ambientales, talleres comunitarios conversados..."
                    />
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Priorización de Objetivos, Dimensiones y Metas Respiratorias
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative" ref={predefinedPlanRef}>
                          <button
                            type="button"
                            onClick={() => setIsPredefinedPlanOpen(!isPredefinedPlanOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>AGREGAR PLAN RESPIRATORIO</span>
                          </button>
                          {isPredefinedPlanOpen && (
                            <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 sm:w-96 bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                              <div className="p-2.5 bg-slate-100 border-b border-slate-200">
                                <input
                                  type="text"
                                  value={planSearchTerm}
                                  onChange={(e) => setPlanSearchTerm(e.target.value)}
                                  placeholder="Buscar plan respiratorio (asma, epoc, aerocámara, tabaco)..."
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                {filteredPredefinedPlans.length > 0 ? (
                                  filteredPredefinedPlans.map((plan, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleAddPredefinedPlan(plan)}
                                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border-b border-slate-100 last:border-b-0 transition-colors"
                                    >
                                      <span className="font-bold block leading-snug">{plan.objetivo}</span>
                                      <span className="text-[11px] text-slate-600 block mt-0.5"><strong className="text-emerald-700">Acuerdo:</strong> {plan.acuerdo}</span>
                                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">{plan.acciones}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-xs text-slate-400 italic">No se encontraron planes respiratorios.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddPccObjetivo}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>AGREGAR OBJETIVO</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mt-2">
                      {(formData.pccObjetivos || []).length === 0 ? (
                        <div className="p-3 bg-white border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-400 italic">
                          No hay objetivos respiratorios agregados aún. Puede añadir uno manual o seleccionar un plan predeterminado.
                        </div>
                      ) : (
                        (formData.pccObjetivos || []).map((obj, index) => (
                          <div key={index} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs relative space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                                OBJETIVO / META RESPIRATORIA #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemovePccObjetivo(index)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar objetivo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <AutoExpandingTextArea
                              label="Objetivo"
                              id={`obj-objetivo-${index}`}
                              name={`obj-objetivo-${index}`}
                              value={obj.objetivo || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'objetivo', e.target.value)}
                              placeholder="Ej: Optimizar técnica inhalatoria..."
                            />
                            <AutoExpandingTextArea
                              label="Acuerdo consensuado"
                              id={`obj-acuerdo-${index}`}
                              name={`obj-acuerdo-${index}`}
                              value={obj.acuerdo || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'acuerdo', e.target.value)}
                              placeholder="Ej: Usar aerocámara diariamente..."
                            />
                            <AutoExpandingTextArea
                              label="Acciones específicas"
                              id={`obj-acciones-${index}`}
                              name={`obj-acciones-${index}`}
                              value={obj.acciones || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'acciones', e.target.value)}
                              placeholder="Ej: Realizar 1 disparo por vez, 10 respiraciones lentas..."
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Plazo</label>
                                <input
                                  type="text"
                                  value={obj.plazo || ''}
                                  onChange={(e) => handleUpdatePccObjetivo(index, 'plazo', e.target.value)}
                                  placeholder="Ej: Próximo control"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsables</label>
                                <input
                                  type="text"
                                  value={obj.responsables || ''}
                                  onChange={(e) => handleUpdatePccObjetivo(index, 'responsables', e.target.value)}
                                  placeholder="Ej: Persona / Cuidador"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Seguimiento</label>
                                <input
                                  type="text"
                                  value={obj.seguimiento || ''}
                                  onChange={(e) => handleUpdatePccObjetivo(index, 'seguimiento', e.target.value)}
                                  placeholder="Ej: En 2 meses"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>

                <section id="sec-plan-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Próximo Control</h3>
                    <div className="space-y-3 mt-1">
                        {proximosControles.map((c) => (
                            <div key={c.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm relative">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                                    <select
                                        value={c.tiempo}
                                        onChange={e => updateControl(c.id, 'tiempo', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none"
                                    >
                                        <option value="">Seleccione...</option>
                                        {tiempoControlOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Profesional para próximo control</label>
                                    <select
                                        value={c.profesional}
                                        onChange={e => updateControl(c.id, 'profesional', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none"
                                    >
                                        {profesionalOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                {proximosControles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeControl(c.id)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-750 font-bold text-lg leading-none"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        {proximosControles.length < 2 && (
                            <button
                                type="button"
                                onClick={addControl}
                                className="w-full py-2 border-2 border-dashed border-sky-200 rounded-xl text-[10px] font-black text-sky-600 uppercase hover:bg-sky-50 transition-colors mt-2"
                            >
                                + Añadir otro control
                            </button>
                        )}
                    </div>
                </section>

                <section id="sec-indicaciones-era" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Indicaciones</h3>
                    <AutoExpandingTextArea label="" id="planOtros" name="planOtros" value={formData.planOtros} onChange={handleChange as any} />
                </section>
                </form>
          </div>

          <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
                <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                {/* Anamnesis */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                    <CopyButton textToCopy={anamnesisText} />
                  </div>
                  <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
                {/* Exploración */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                    <CopyButton textToCopy={exploracionText} />
                  </div>
                  <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
                {/* Actuación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                    <CopyButton textToCopy={actuacionText} />
                  </div>
                  <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
              </div>
            </div>
            {/* Botones de Acción: EXPORTAR PDF, BORRAR TODO */}
            <div className="grid grid-cols-2 gap-1.5 w-full shrink-0 mt-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={status === FormStatus.Generating}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Imprimir PDF Resumen"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{status === FormStatus.Generating ? 'Generando...' : 'RESUMEN PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Seguro que desea borrar todos los datos ingresados?")) {
                    handleNewDocument();
                  }
                }}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Restablecer todos los campos del formulario"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">BORRAR TODO</span>
              </button>
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default FichaControlSalaEra;

