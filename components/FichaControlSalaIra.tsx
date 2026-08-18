
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FichaControlSalaIraFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import CopyButton from './CopyButton';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';
import ImportModal from './ImportModal';
import { canUseAI } from '../utils/aiRestrictions';
import ScoreRMNModal from './ScoreRMNModal';
import ScoreNeurosensorialModal from './ScoreNeurosensorialModal';
import DateField from './DateField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import { Printer, Trash2 } from 'lucide-react';

const initialExamenFisicoPielMucosas = "hidratadas, perfundidas";
const initialExamenFisicoCardiologico = "RR2TSS";
const initialExamenFisicoPulmonar = "Murmullo pulmonar (+) SRA.";
const initialExamenFisicoText = `- Buenas condiciones generales.
- Hidratado, bien perfundido.
- Faringe sin lesiones.
- Cuellos sin adenopatías palpables, yugulares planas.
- Cardiovascular: RR2T, SS.
- Pulmonar: MP(+) SRA.
- Abdomen: RHA (+), blando, deprimible, indoloro, sin signos de irritación peritoneal.
- Extremidades: EEII simétricas, sin edema, sin signos de TVP. Sensibilidad (+), bien perfundido a distal. Sin lesiones.
- Neurológico: Conservado, GCS 15/15.`;
const initialPlanEducacionPatologia = "Educación sobre patología y prevención de exposición a alérgenos/irritantes.";
const initialPlanEducacionAerocamara = "Educación uso de aerocámara y técnica inhalatoria.";
const initialPlanVacunas = "Se indica vacuna anti-influenza, neumococo, COVID 19 según corresponda.";
const initialPlanConsultarSos = "Consultar en Urgencias SOS ante: dificultad respiratoria marcada, cianosis, retracción costal severa, compromiso de conciencia, fiebre persistente.";

const antecedenteMedicoIraTexts: Record<string, string> = {
  antecedenteSBOA: "SBOA",
  antecedenteSBOR: "SBOR",
  antecedenteAsma: "Asma Bronquial",
  antecedenteRinitis: "Rinitis Alérgica",
  antecedenteDermatitis: "Dermatitis Atópica",
  antecedentePrurigo: "Prurigo Insectario",
};

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
      {label && (
        <label htmlFor={id} className="block text-[10px] font-black text-sky-800 uppercase mb-1 tracking-widest leading-none">
            {label}
        </label>
      )}
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

const initialFormData: FichaControlSalaIraFormData = {
  edad: '',
  acompanante: '',
  acompananteOtroAclaracion: '',
  antecedentesMedicos: '',
  antecedeEraAsma: false,
  antecedeEraEpoc: false,
  antecedeEraErge: false,
  antecedeEraCancerPulmon: false,
  antecedenteSBOA: false,
  antecedenteSBOR: false,
  antecedenteAsma: false,
  antecedenteRinitis: false,
  antecedenteDermatitis: false,
  antecedentePrurigo: false,
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
  historiaActual: '',
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
  efPielMucosas: initialExamenFisicoPielMucosas,
  efMucosaNasal: '',
  efCavidadOral: '',
  efCardiologico: initialExamenFisicoCardiologico,
  efPulmonar: initialExamenFisicoPulmonar,
  efGeneralAdicional: initialExamenFisicoText,
  planEducacionPatologiaPrevencion: initialPlanEducacionPatologia,
  planEducacionUsoAerocamara: initialPlanEducacionAerocamara,
  planVacunas: initialPlanVacunas,
  planConsultarUrgenciasSos: initialPlanConsultarSos,
  planOtros: '',
  espirometriaResultados: [],
  espirometriaInterpretacion: '',
  scoreRMN: '',
  scoreNeurosensorial: '',
};

interface CheckboxClarificationItem {
  keyBase: keyof FichaControlSalaIraFormData; 
  label: string;
  subLabel?: string; 
}

const antecedenteMedicoIraCheckboxConfig: Array<{ key: keyof FichaControlSalaIraFormData, label: string, text: string }> = [
    { key: 'antecedenteSBOA', label: 'SBOA', text: antecedenteMedicoIraTexts.antecedenteSBOA },
    { key: 'antecedenteSBOR', label: 'SBOR', text: antecedenteMedicoIraTexts.antecedenteSBOR },
    { key: 'antecedenteAsma', label: 'Asma Bronquial', text: antecedenteMedicoIraTexts.antecedenteAsma },
    { key: 'antecedenteRinitis', label: 'Rinitis Alérgica', text: antecedenteMedicoIraTexts.antecedenteRinitis },
    { key: 'antecedenteDermatitis', label: 'Dermatitis Atópica', text: antecedenteMedicoIraTexts.antecedenteDermatitis },
    { key: 'antecedentePrurigo', label: 'Prurigo Insectario', text: antecedenteMedicoIraTexts.antecedentePrurigo },
];

const generalAndHabitsCheckboxConfig: CheckboxClarificationItem[] = [
    { keyBase: 'hospitalizaciones', label: 'Hospitalizaciones' },
    { keyBase: 'neumonia', label: 'Neumonía' },
    { keyBase: 'exacerbaciones', label: 'Exacerbaciones' },
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
    { keyBase: 'sintomasConsultasSapuUrgencias', label: 'Consultas en SAPU/S. Urgencias' },
];

const desencadenantesAmbientalesConfig: CheckboxClarificationItem[] = [
  { keyBase: 'desencadenantesMascotas', label: 'Mascotas' },
  { keyBase: 'desencadenantesHigieneHogar', label: 'Higiene de hogar' },
  { keyBase: 'desencadenantesAlfombras', label: 'Alfombras' },
  { keyBase: 'desencadenantesHabitoTabaquicoAmbiental', label: 'Hábito tabáquico ambiental' },
  { keyBase: 'desencadenantesCocinaLenaCarbon', label: 'Cocina a leña/carbón' },
  { keyBase: 'desencadenantesCalefaccion', label: 'Calefacción' },
];

interface FichaControlSalaIraProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlSalaIra: React.FC<FichaControlSalaIraProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlSalaIraFormData>('local_FichaControlSalaIra', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isRmnModalOpen, setIsRmnModalOpen] = useState(false);
  const [isNeuroModalOpen, setIsNeuroModalOpen] = useState(false);
  
  const [isSpiroLoading, setIsSpiroLoading] = useState(false);
  const [spiroError, setSpiroError] = useState<string | null>(null);
  const spiroFileRef = useRef<HTMLInputElement>(null);

  const [proximosControles, setProximosControles] = useState<{ id: number; tiempo: string; profesional: string }[]>([{ id: Date.now(), tiempo: '3 meses', profesional: 'Médico' }]);

  const tiempoControlOptions = ['1 mes', '2 meses', '3 meses', '4 meses', '5 meses', '6 meses', '12 meses'];
  const profesionalOptions = ['Médico', 'Kinesiólogo'];

  const addControl = useCallback(() => {
    setProximosControles(prev => (prev.length >= 2 ? prev : [...prev, { id: Date.now(), tiempo: '', profesional: 'Médico' }]));
  }, []);

  const updateControl = useCallback((id: number, field: 'tiempo' | 'profesional', value: string) => {
    setProximosControles(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
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
    setFormData(prev => ({ ...prev, espirometriaResultados: [], espirometriaInterpretacion: '' }));

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
        if (!event.target?.result) {
            setSpiroError('Error al leer el archivo.');
            setIsSpiroLoading(false);
            return;
        }

        try {
            const dataUrl = event.target.result as string;
            const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
            const ai = getAiClient();
            
            const filePart = { inlineData: { mimeType: file.type, data: base64Data } };

            const schema = {
              type: Type.OBJECT,
              properties: {
                results: {
                  type: Type.ARRAY,
                  description: "Array of spirometry parameter results.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      parametro: { type: Type.STRING, description: "Name of the parameter (e.g., FVC (L))." },
                      mejorPrevia: { type: Type.STRING, description: "The 'Mejor previa' value." },
                      prePrev: { type: Type.STRING, description: "The '% pre. prev.' value." },
                      mejorPost: { type: Type.STRING, description: "The 'Mejor post.' value." },
                      prePostChange: { type: Type.STRING, description: "The '% pre/post' value." }
                    },
                    required: ["parametro", "mejorPrevia", "prePrev", "mejorPost", "prePostChange"]
                  }
                },
                interpretation: {
                  type: Type.STRING,
                  description: "A brief, one to two sentence summary interpreting the results. Mention potential patterns (obstructive, restrictive) and significant bronchodilator response."
                }
              }
            };
            
            const prompt = `Analiza el informe de espirometría adjunto. OMITE ABSOLUTAMENTE TODOS los datos personales del paciente.
1. Extrae los datos de la tabla de 'Resultados'. Para cada 'Parámetro' (FVC, FEV1, etc.), extrae: 'Mejor previa', '% pre. prev.', 'Mejor post.', '% pre/post'.
2. Genera una breve interpretación sobre los hallazgos.`;

            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
              model: 'Groq-flash-latest',
              contents: { parts: [filePart, textPart] },
              config: { responseMimeType: 'application/json', responseSchema: schema },
            });

            const jsonString = response.text.trim();
            const parsedData = JSON.parse(jsonString);

            if (parsedData.results && parsedData.interpretation) {
                setFormData(prev => ({
                    ...prev,
                    espirometriaResultados: parsedData.results,
                    espirometriaInterpretacion: parsedData.interpretation,
                }));
            } else {
                throw new Error("La respuesta de la IA no tiene el formato esperado.");
            }
        } catch (apiError) {
            console.error("Error en la API de Groq:", apiError);
            setSpiroError('Ocurrió un error al analizar el documento. Intente de nuevo.');
        } finally {
            setIsSpiroLoading(false);
            if (spiroFileRef.current) spiroFileRef.current.value = '';
        }
    };
    fileReader.onerror = () => {
        setSpiroError('Error al leer el archivo.');
        setIsSpiroLoading(false);
    };
    fileReader.readAsDataURL(file);
  };

  const calculateGeneratedTextParts = useCallback(() => {
    let anam = `FICHA CONTROL SALA IRA\n`;
    anam += `---------------------------------------\n`;
    anam += `FECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) anam += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    anam += `---------------------------------------\n\n`;

    const addCheckboxFieldToSummary = (label: string, valueKey: keyof FichaControlSalaIraFormData, aclaracionKey: keyof FichaControlSalaIraFormData, subLabel?: string) => {
        const isChecked = formData[valueKey] as boolean;
        const aclaracion = formData[aclaracionKey] as string;
        let line = `${label}${subLabel ? ` ${subLabel}` : ''}: ${isChecked ? 'Sí' : 'Niega'}`;
        if (isChecked && aclaracion) {
            line += ` - Aclaración: ${aclaracion}`;
        }
        return line + '\n';
    }

    anam += `DATOS GENERALES:\n`;
    anam += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    anam += `Acompañante: ${formData.acompanante || '(No ingresado)'}\n`;
    anam += `Antecedentes Médicos:\n`;
    const antecedentesContent = formData.antecedentesMedicos.trim();
    anam += antecedentesContent ? `${antecedentesContent}\n` : `(Sin antecedentes predefinidos o personalizados)\n`;
    
    anam += `Alergias: ${formData.alergias || '(No seleccionado)'}${formData.alergiasAclaracion ? ` - Aclaración: ${formData.alergiasAclaracion}` : ''}\n`;
    anam += `Fármacos: ${formData.farmacos || '(No ingresado)'}\n`;
    anam += addCheckboxFieldToSummary("Hospitalizaciones", "hospitalizaciones", "hospitalizacionesAclaracion");
    anam += addCheckboxFieldToSummary("Neumonía", "neumonia", "pneumoniaAclaracion");
    anam += addCheckboxFieldToSummary("Exacerbaciones", "exacerbaciones", "exacerbacionesAclaracion");
    anam += `\n`;

    anam += `HÁBITOS:\n`;
    anam += addCheckboxFieldToSummary("Tabaquismo (Pasivo/Activo)", "tabaquismo", "tabaquismoAclaracion");
    anam += addCheckboxFieldToSummary("Alcohol", "alcohol", "alcoholAclaracion");
    anam += addCheckboxFieldToSummary("Drogas", "drogas", "drogasAclaracion");
    anam += `\n`;
    
    anam += `HISTORIA ACTUAL:\n${formData.historiaActual || '(No ingresado)'}\n\n`;

    anam += `SÍNTOMAS:\n`;
    sintomasConfig.forEach(item => {
        anam += addCheckboxFieldToSummary(item.label, item.keyBase, `${String(item.keyBase)}Aclaracion` as keyof FichaControlSalaIraFormData, item.subLabel);
    });
    anam += `\n`;

    anam += `DESENCADENANTES AMBIENTALES:\n`;
    desencadenantesAmbientalesConfig.forEach(item => {
        anam += addCheckboxFieldToSummary(item.label, item.keyBase, `${String(item.keyBase)}Aclaracion` as keyof FichaControlSalaIraFormData);
    });
    anam += `\n`;

    let expl = `EXAMEN FÍSICO:\n`;
    expl += `- Piel y mucosas: ${formData.efPielMucosas}\n`;
    expl += `- Mucosa nasal: ${formData.efMucosaNasal || '(No seleccionado)'}\n`;
    expl += `- Cavidad oral: ${formData.efCavidadOral || '(No seleccionado)'}\n`;
    expl += `- Examen cardiológico: ${formData.efCardiologico}\n`;
    expl += `- Examen pulmonar: ${formData.efPulmonar}\n`;
    if (formData.efGeneralAdicional.trim()) expl += `Observaciones Adicionales Ex. Físico:\n${formData.efGeneralAdicional}\n`;
    
    if (formData.scoreRMN) expl += `\n${formData.scoreRMN}\n`;
    if (formData.scoreNeurosensorial) expl += `${formData.scoreNeurosensorial}\n`;

    if (formData.espirometriaResultados && formData.espirometriaResultados.length > 0) {
        expl += '\nESPIROMETRÍA:\n';
        const headers = ['Parámetro', 'Mejor Pre', '% Pred', 'Mejor Post', '% Cambio'];
        const colWidths = [17, 12, 8, 12, 10]; 
        const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('| ');
        const separator = '-'.repeat(headerLine.length);
        expl += `${separator}\n${headerLine}\n${separator}\n`;
        formData.espirometriaResultados.forEach(row => {
            const rowData = [row.parametro || '', row.mejorPrevia || '', row.prePrev || '', row.mejorPost || '', row.prePostChange || ''];
            expl += `${rowData.map((d, i) => d.padEnd(colWidths[i])).join('| ')}\n`;
        });
        expl += `${separator}\n`;
        if (formData.espirometriaInterpretacion) expl += `Interpretación: ${formData.espirometriaInterpretacion}\n`;
    }

    let actu = `PLAN:\n`;
    const planLines = [];
    planLines.push(initialPlanEducacionPatologia);
    planLines.push(initialPlanEducacionAerocamara);
    proximosControles.forEach(c => { if(c.tiempo) planLines.push(`Próximo control con ${c.profesional} en ${c.tiempo}.`); });
    planLines.push(`Vacunas: ${formData.planVacunas || initialPlanVacunas}`);
    planLines.push(initialPlanConsultarSos);
    if (formData.planOtros.trim()) {
        const others = formData.planOtros.trim().split('\n').filter(l => l.trim());
        planLines.push(...others);
    }
    
    actu += planLines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');

    setAnamnesisText(anam.trim());
    setExploracionText(expl.trim());
    setActuacionText(actu.trim());
  }, [formData, loggedInUser, proximosControles]);

  useEffect(() => { calculateGeneratedTextParts(); }, [calculateGeneratedTextParts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        const iraMedConfig = antecedenteMedicoIraCheckboxConfig.find(c => c.key === name);
        if (iraMedConfig) {
            setFormData(prev => {
                let ants = prev.antecedentesMedicos;
                if (checked) {
                    if (!ants.includes(iraMedConfig.text)) {
                        ants = ants ? `${ants}\n- ${iraMedConfig.text}` : `- ${iraMedConfig.text}`;
                    }
                }
                else ants = ants.split('\n').filter(l => !l.includes(iraMedConfig.text)).join('\n');
                return { ...prev, [name]: checked, antecedentesMedicos: ants.trim() };
            });
        } else { setFormData(prev => ({ ...prev, [name]: checked })); }
    } else { setFormData(prev => ({ ...prev, [name]: value as any })); }
  };

  const handleRadioChange = useCallback((name: keyof FichaControlSalaIraFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => alert(`'${partName}' copiado al portapapeles.`));
  };

  const handleExportPdf = async () => {
    if(!loggedInUser) return;
    setStatus(FormStatus.Generating);
    try {
      await generateClinicalRecordPdf({ title: 'Ficha Control Sala IRA', content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}` }, loggedInUser);
    } finally { setStatus(FormStatus.Idle); }
  };

  const handleNewDocument = () => {
    if (window.confirm("¿Está seguro de borrar todo y limpiar el formulario?")) {
        setFormData(initialFormData);
        setProximosControles([{ id: Date.now(), tiempo: '3 meses', profesional: 'Médico' }]);
        setStatus(FormStatus.Idle);
    }
  };

  const renderCheckboxWithClarification = (item: CheckboxClarificationItem) => {
    const isChecked = formData[item.keyBase] as boolean;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaControlSalaIraFormData;
    return (
        <div key={String(item.keyBase)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3">
                <input type="checkbox" id={String(item.keyBase)} name={String(item.keyBase)} checked={isChecked} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" aria-labelledby={`${String(item.keyBase)}-label`} />
                <label id={`${String(item.keyBase)}-label`} htmlFor={String(item.keyBase)} className="text-sm font-normal text-slate-700 tracking-tight">
                    {item.label} {item.subLabel && <span className="text-[10px] text-slate-500">{item.subLabel}</span>}
                </label>
            </div>
            {isChecked && <textarea name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange as any} placeholder="Especifique..." className="mt-2 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 min-h-[60px] text-slate-900" />}
        </div>
    );
  };

  const renderTriStateField = (label: string, valueKey: keyof FichaControlSalaIraFormData, aclaracionKey: keyof FichaControlSalaIraFormData) => {
    const currentVal = formData[valueKey] as string;
    const aclaracionVal = formData[aclaracionKey] as string;

    return (
      <div key={String(valueKey)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}:</label>
        <div className="flex items-center space-x-4 mb-2">
          {[{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}].map(opt => (
            <label key={opt.value} className="flex items-center text-sm cursor-pointer">
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
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 font-medium text-black h-[38px]"
        />
      </div>
    );
  };

  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">
                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Datos Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 8 años" inputClassName="text-black" />
                        <FormField label="Acompañante" id="acompanante" name="acompanante" value={formData.acompanante} onChange={handleChange} placeholder="Ej: Madre" inputClassName="text-black" />
                    </div>
                    
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Antecedentes Médicos:</label>
                        <textarea 
                            id="antecedentesMedicos" 
                            name="antecedentesMedicos" 
                            value={formData.antecedentesMedicos} 
                            onChange={handleChange as any} 
                            rows={3} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-xs font-medium"
                            placeholder="Antecedentes médicos relevantes..." 
                        />
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {antecedenteMedicoIraCheckboxConfig.map(cb => (
                                <label key={String(cb.key)} className="flex items-center text-xs text-slate-700 bg-white p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors shadow-sm">
                                    <input type="checkbox" name={String(cb.key)} checked={formData[cb.key as keyof FichaControlSalaIraFormData] as boolean} onChange={handleChange} className="mr-2 h-3.5 w-3.5 text-sky-600 rounded" />
                                    {cb.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-2">
                        {renderTriStateField("Alergias", "alergias", "alergiasAclaracion")}
                    </div>

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Fármacos:</label>
                        <textarea 
                            id="farmacos" 
                            name="farmacos" 
                            value={formData.farmacos} 
                            onChange={handleChange as any} 
                            rows={3} 
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-xs font-medium"
                            placeholder="Fármacos actuales..." 
                        />
                        <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={v => setFormData(p => ({...p, farmacos: v}))} />
                    </div>

                    <div className="mt-4 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Antecedentes Respiratorios</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            {generalAndHabitsCheckboxConfig.map(renderCheckboxWithClarification)}
                        </div>
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Hábitos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        {renderCheckboxWithClarification({ keyBase: 'tabaquismo', label: 'Tabaquismo (Pasivo/Activo)' })}
                        {renderCheckboxWithClarification({ keyBase: 'alcohol', label: 'Alcohol' })}
                        {renderCheckboxWithClarification({ keyBase: 'drogas', label: 'Drogas' })}
                    </div>
                </section>
                
                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Historia Actual</h3>
                    <AutoExpandingTextArea 
                        label=""
                        id="historiaActual" 
                        name="historiaActual" 
                        value={formData.historiaActual} 
                        onChange={handleChange as any} 
                        placeholder="Detalle de evolución de síntomas..." 
                    />
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Síntomas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        {sintomasConfig.map(renderCheckboxWithClarification)}
                    </div>
                </section>
                
                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Escalas de Evaluación</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsRmnModalOpen(true)} 
                            className="flex-1 px-4 py-3 bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-sky-700 transition-all active:scale-95"
                        >
                            Evaluar mMRC / Tal
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setIsNeuroModalOpen(true)} 
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            Evaluación DSM
                        </button>
                    </div>
                    {(formData.scoreRMN || formData.scoreNeurosensorial) && (
                        <div className="mt-4 p-4 bg-white border border-sky-100 rounded-xl text-xs space-y-3 shadow-inner">
                            {formData.scoreRMN && (
                                <div className="flex items-start gap-2">
                                    <span className="font-black text-sky-800 uppercase tracking-tighter">Puntaje:</span>
                                    <span className="text-black font-medium">{formData.scoreRMN}</span>
                                </div>
                            )}
                            {formData.scoreNeurosensorial && (
                                <div className="flex items-start gap-2">
                                    <span className="font-black text-indigo-800 uppercase tracking-tighter">DSM:</span>
                                    <span className="text-black font-medium">{formData.scoreNeurosensorial}</span>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Desencadenantes Ambientales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        {desencadenantesAmbientalesConfig.map(renderCheckboxWithClarification)}
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-3 border-b border-sky-200 pb-1">
                        <h3 className="text-lg font-semibold text-sky-700">Análisis de Espirometría</h3>
                        <button 
                            type="button" 
                            onClick={() => spiroFileRef.current?.click()} 
                            disabled={isSpiroLoading}
                            className="text-[9px] bg-sky-600 text-white px-3 py-1 rounded-full font-black uppercase hover:bg-sky-700 transition-colors"
                        >
                            {isSpiroLoading ? 'Analizando...' : 'Cargar Archivo'}
                        </button>
                        <input type="file" ref={spiroFileRef} onChange={(e) => handleSpirometryFileAnalysis(e.target.files ? e.target.files[0] : null)} className="hidden" accept="application/pdf,image/*" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
                            <table className="w-full text-[10px] text-left">
                                <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-tighter">
                                    <tr>
                                        <th className="px-3 py-2.5">Parámetro</th>
                                        <th className="px-2 py-2.5 text-center">M. Previa</th>
                                        <th className="px-2 py-2.5 text-center">% Pred</th>
                                        <th className="px-2 py-2.5 text-center">M. Post</th>
                                        <th className="px-2 py-2.5 text-center">% Cambio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.espirometriaResultados && formData.espirometriaResultados.length > 0 ? (
                                        formData.espirometriaResultados.map((row, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-2 font-bold text-slate-800 uppercase">{row.parametro}</td>
                                                <td className="px-2 py-2 text-center text-slate-700 font-medium">{row.mejorPrevia}</td>
                                                <td className="px-2 py-2 text-center text-slate-700 font-medium">{row.prePrev}</td>
                                                <td className="px-2 py-2 text-center text-slate-700 font-medium">{row.mejorPost}</td>
                                                <td className="px-2 py-2 text-center text-slate-700 font-medium">{row.prePostChange}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-slate-400 italic text-xs">No hay datos cargados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {formData.espirometriaInterpretacion && (
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
                                <h5 className="text-[10px] font-black text-sky-800 uppercase tracking-widest mb-1.5">Interpretación IA:</h5>
                                <p className="text-xs text-sky-900 font-medium italic leading-relaxed">{formData.espirometriaInterpretacion}</p>
                            </div>
                        )}
                        {spiroError && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{spiroError}</p>}
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Examen Físico</h3>
                    <div className="space-y-4">
                        <FormField label="Piel y Mucosas" id="efPielMucosas" name="efPielMucosas" value={formData.efPielMucosas} onChange={handleChange} inputClassName="text-black text-sm" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mucosa Nasal:</label>
                                <select name="efMucosaNasal" value={formData.efMucosaNasal} onChange={handleChange as any} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 text-black text-sm font-medium h-[42px]">
                                    <option value="">Seleccione...</option>
                                    <option value="sin alteraciones">Sin alteraciones</option>
                                    <option value="pálida/blanquecina">Pálida/blanquecina</option>
                                    <option value="rinorrea acuosa">Rinorrea acuosa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cavidad Oral:</label>
                                <select name="efCavidadOral" value={formData.efCavidadOral} onChange={handleChange as any} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 text-black text-sm font-medium h-[42px]">
                                    <option value="">Seleccione...</option>
                                    <option value="faringe no congestiva, sin exudado">Faringe no congestiva</option>
                                    <option value="congestiva, eritematosa">Congestiva/Eritematosa</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Examen Cardiológico" id="efCardiologico" name="efCardiologico" value={formData.efCardiologico} onChange={handleChange} inputClassName="text-black text-sm" />
                            <FormField label="Examen Pulmonar" id="efPulmonar" name="efPulmonar" value={formData.efPulmonar} onChange={handleChange} inputClassName="text-black text-sm" />
                        </div>
                        <AutoExpandingTextArea 
                            label="Observaciones Adicionales" 
                            id="efGeneralAdicional" 
                            name="efGeneralAdicional" 
                            value={formData.efGeneralAdicional} 
                            onChange={handleChange as any} 
                            placeholder="Hallazgos adicionales..." 
                        />
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Próximo Control</h3>
                    <div className="space-y-3 mt-1">
                        {proximosControles.map((control) => (
                            <div key={control.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm relative">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                                    <select
                                        value={control.tiempo}
                                        onChange={e => updateControl(control.id, 'tiempo', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none"
                                    >
                                        <option value="">Seleccione...</option>
                                        {tiempoControlOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Profesional para próximo control</label>
                                    <select
                                        value={control.profesional}
                                        onChange={e => updateControl(control.id, 'profesional', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none"
                                    >
                                        {profesionalOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                {proximosControles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeControl(control.id)}
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

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-3.5 sm:p-4 flex flex-col gap-2">
                    <h3 className="text-lg font-semibold mb-1.5 text-sky-700 border-b border-sky-200 pb-1">Indicaciones</h3>
                    <div className="space-y-4">
                        <FormField label="Vacunas Indicadas" id="planVacunas" name="planVacunas" value={formData.planVacunas} onChange={handleChange} isTextArea rows={2} inputClassName="text-black" />
                        <AutoExpandingTextArea label="Otros Planes/Indicaciones" id="planOtros" name="planOtros" value={formData.planOtros} onChange={handleChange as any} placeholder="Instrucciones específicas..." />
                        
                        <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-xl shadow-inner space-y-2">
                            <h5 className="text-[10px] font-black text-sky-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Educación Constante (Automática)
                            </h5>
                            <div className="text-[10px] text-sky-700 font-medium space-y-1.5">
                                <p className="flex items-start gap-2"><span className="text-sky-400">•</span> {initialPlanEducacionPatologia}</p>
                                <p className="flex items-start gap-2"><span className="text-sky-400">•</span> {initialPlanEducacionAerocamara}</p>
                                <p className="flex items-start gap-2"><span className="text-sky-400">•</span> {initialPlanConsultarSos}</p>
                            </div>
                        </div>
                    </div>
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
                <span className="truncate">{status === FormStatus.Generating ? 'Generando...' : 'EXPORTAR PDF'}</span>
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

      {/* Footer Fijo */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-6 rounded-xl shadow-sm">
        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-8 py-3 bg-slate-200 text-slate-700 font-black rounded-xl shadow-sm hover:bg-slate-300 transition-all uppercase text-xs tracking-widest"
        >
          Volver al Menú
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={status === FormStatus.Generating}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-red-600 text-white font-black rounded-xl shadow-xl hover:bg-red-700 transition-all active:scale-95 disabled:bg-slate-300 uppercase text-xs tracking-widest"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6V4.414L14.586 8H11z" clipRule="evenodd" /></svg>
             {status === FormStatus.Generating ? 'EXPORTANDO...' : 'EXPORTAR A PDF'}
          </button>
          <button
            type="button"
            onClick={handleNewDocument}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-slate-700 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            NUEVA FICHA
          </button>
        </div>
      </div>

      <ScoreRMNModal isOpen={isRmnModalOpen} onClose={() => setIsRmnModalOpen(false)} onSave={score => setFormData(p => ({...p, scoreRMN: score}))} />
      <ScoreNeurosensorialModal isOpen={isNeuroModalOpen} onClose={() => setIsNeuroModalOpen(false)} onSave={evalu => setFormData(p => ({...p, scoreNeurosensorial: evalu}))} edadMeses={1} />
    </>
  );
};

export default FichaControlSalaIra;

