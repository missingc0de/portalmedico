import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FichaControlEcicepFormData, FormStatus, User, PccObjetivo, ObjetivoAnterior } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import PHQ9Modal from './PHQ9Modal';
import RutInput from './RutInput';
import CopyButton from './CopyButton';
import { GoogleGenAI, Type } from '@google/genai';
import { getAiClient } from '../utils/aiClient';
import { generateClinicalRecordPdf, generateEcicepResumenPdf } from '../services/pdfGenerator';
import ImportModal from './ImportModal';
import EcicepRiskCalculatorModal from './EcicepRiskCalculatorModal';
import UserAutocomplete from './UserAutocomplete';
import { Printer, ExternalLink, Trash2 } from 'lucide-react';
import SmartAtencionVigenteInput, { SmartAtencionOption, stripStatusBracket } from './SmartAtencionVigenteInput';

const empamSmartOptions: SmartAtencionOption[] = [
  {
    status: 'NORMAL',
    description: 'Vigente, sin hallazgos o alteraciones relevantes. Minimental normal. Funcionalidad y autonomía conservada. Vigencia por un año.'
  },
  {
    status: 'ALTERADO',
    description: 'Vigente con hallazgos o alteraciones que requieren seguimiento o intervención.'
  },
  {
    status: 'NO VIGENTE',
    description: 'No realizado o fuera del período de vigencia established. Se deriva.'
  }
];

const fondoOjoSmartOptions: SmartAtencionOption[] = [
  {
    status: 'NORMAL',
    description: 'Vigente, sin signos de retinopatía diabética u otras alteraciones relevantes.'
  },
  {
    status: 'ALTERADO',
    description: 'Vigente con retinopatía diabética u otra alteración oftalmológica relevante.'
  },
  {
    status: 'NO VIGENTE',
    description: 'Fondo de ojo no realizado o fuera del período de vigencia established. Se deriva.'
  }
];

const podologoSmartOptions: SmartAtencionOption[] = [
  {
    status: 'NORMAL',
    description: 'Vigente, sin alteraciones relevantes.'
  },
  {
    status: 'ALTERADO',
    description: 'Vigente con hallazgos que requieren manejo, tratamiento o seguimiento.'
  },
  {
    status: 'NO VIGENTE',
    description: 'Evaluación por podólogo no realizada o fuera del período de vigencia establecido.'
  }
];

const evaluacionPieSmartOptions: SmartAtencionOption[] = [
  {
    status: 'NORMAL',
    description: 'Vigente. Sensibilidad conservada, sin deformidad, sin antecedente de amputación o ulceraciones. Riesgo bajo, vigencia por un año.'
  },
  {
    status: 'ALTERADO',
    description: 'Vigente con alteraciones, factores de riesgo, lesiones o hallazgos que requieren seguimiento o intervención.'
  },
  {
    status: 'NO VIGENTE',
    description: 'No vigente. Se realiza en consulta.'
  }
];

const initialIndicaciones = `- Se solicitan exámenes.
- Se renueva su receta crónica.
- Traer exámenes extrasistema y documentos importantes.
- Traer medicamentos (para verificar).`;

const professionLabels: Record<string, string> = {
  medicina: 'Médico',
  enfermeria: 'Enfermera',
  nutricion: 'Nutricionista',
  psicologia: 'Psicóloga',
  kinesiologia: 'Kinesiólogo',
  matroneria: 'Matrona',
  tens: 'TENS',
  quimico_farmaceutico: 'Químico farmacéutico',
  asistente_social: 'Asistente social',
  tecnologo_medico: 'Tecnólogo médico',
  administrativo: 'Administrativo',
  otro: 'Otro'
};

// Componente interno para textareas que se expanden automáticamente con estilo unificado
const AutoExpandingTextArea: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  containerClassName?: string;
}> = ({ label, id, name, value = '', onChange, onKeyDown, placeholder, containerClassName }) => {
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
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 ease-in-out text-slate-700 placeholder-slate-400 overflow-hidden min-h-[42px]"
      />
    </div>
  );
};

const predefinedPccPlans: PccObjetivo[] = [
  {
    objetivo: 'Perder peso.',
    acuerdo: 'Aumentar actividad física y ejercicios.',
    acciones: 'Asistir a taller de actividad física, iniciar caminata diaria, hacer ejercicios de estiramientos.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Mejorar adherencia a fármacos.',
    acuerdo: 'Seguir pauta escrita en horario y frecuencia.',
    acciones: 'Seguir pauta escrita en horario y frecuencia, poner alarmas y/o armar pastillero.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Retomar controles.',
    acuerdo: 'Asistir a citas programadas y toma de exámenes.',
    acciones: 'Realizar toma de exámenes como corresponde, asistir a citas programadas, asistir a próximo control, seguir pautas indicadas en consulta actual.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Fortalecer herramientas para mejorar su SM.',
    acuerdo: 'Iniciar psicoterapia y análisis de detonantes.',
    acciones: 'Iniciar psicoterapia, análisis introspectivo de detonantes de síntomas, evitar situaciones de riesgo, definir planes de emergencia ante estresores.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Mejorar hábitos de alimentación saludable.',
    acuerdo: 'Incorporar más verduras y reducir frituras.',
    acciones: 'Incorporar > 3 porciones de verduras al día, consumir frutas como colación, preferir preparaciones cocidas/horno/vapor, reducir sal, azúcar y frituras.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Aumentar actividad física regular.',
    acuerdo: 'Realizar ejercicio físico de forma constante.',
    acciones: 'Caminar al menos 30 minutos 5 días/semana o actividad equivalente, iniciar de forma progresiva, registrar actividad en calendario o app, evitar sedentarismo prolongado.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Optimizar autocontrol de presión arterial.',
    acuerdo: 'Realizar registros de presión en domicilio.',
    acciones: 'Control domiciliario de PA según indicación, registrar valores en libreta, traer registros a controles, reconocer signos de alarma.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Optimizar autocontrol de glicemia.',
    acuerdo: 'Realizar registros de glicemia en domicilio.',
    acciones: 'Control domiciliario de glicemia según indicación, registrar valores en libreta, traer registros a controles, reconocer signos de alarma.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Disminuir consumo de tabaco.',
    acuerdo: 'Reducir o suspender el hábito tabáquico.',
    acciones: 'Definir fecha de suspensión, reducir consumo progresivo, evitar desencadenantes, apoyo familiar, considerar terapia farmacológica o programa cesación.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Reducir consumo de alcohol.',
    acuerdo: 'Limitar o suspender el consumo de alcohol.',
    acciones: 'Limitar consumo a ocasiones puntuales o suspender, evitar compra domiciliaria, identificar situaciones de riesgo, apoyo familiar, derivación a consejería si precisa.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Mejorar higiene del sueño.',
    acuerdo: 'Adoptar hábitos para un mejor descanso nocturno.',
    acciones: 'Horario regular para dormir/levantarse, evitar pantallas 1–2 h antes de dormir, reducir cafeína nocturna, ambiente oscuro/silencioso, evitar siestas prolongadas.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Fortalecer red de apoyo social.',
    acuerdo: 'Aumentar la vinculación con redes y familia.',
    acciones: 'Contacto semanal con familiares/amigos, participar en talleres o grupos comunitarios, informar necesidades de salud a cuidador principal.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Prevenir caídas (adulto mayor).',
    acuerdo: 'Adecuar el entorno y mejorar la estabilidad.',
    acciones: 'Recortar obstáculos del hogar, usar calzado antideslizante, buena iluminación, uso de ayudas técnicas indicadas, ejercicios de equilibrio/fuerza, revisión de fármacos sedantes.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Mejorar adherencia a controles preventivos.',
    acuerdo: 'Realizar exámenes y controles de salud pendientes.',
    acciones: 'Agendar exámenes pendientes (laboratorio, PAP, mamografía, EMPA/EMPAM), registrar fechas en calendario, asistir a controles programados.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Manejo del estrés y salud mental.',
    acuerdo: 'Aplicar técnicas de relajación y autocuidado.',
    acciones: 'Practicar técnicas de relajación/respiración 10–15 min diarios, actividades recreativas, organizar rutinas, consultar ante empeoramiento del ánimo o ansiedad.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Educación y autocuidado en diabetes.',
    acuerdo: 'Aprender y aplicar cuidados específicos de la DM.',
    acciones: 'Respetar horarios de alimentación, fraccionar comidas, revisar pies diariamente, usar calzado adecuado, reconocer signos de hipo/hiperglicemia.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Control de presión arterial.',
    acuerdo: 'Adherir a medidas para el control de la HTA.',
    acciones: 'Reducir sal (<5 g/día), adherir a fármacos, actividad física regular, control domiciliario 2–3 veces/semana, consultar ante cifras elevadas persistentes.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Organización del tratamiento farmacológico.',
    acuerdo: 'Mantener orden y claridad en la medicación.',
    acciones: 'Mantener lista actualizada de medicamentos, usar pastillero semanal, llevar fármacos a controles, no suspender sin indicación médica.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Autonomía y funcionalidad (adulto mayor).',
    acuerdo: 'Mantener la independencia en actividades diarias.',
    acciones: 'Realizar ejercicios de movilidad/fuerza, mantener actividades de la vida diaria de forma independiente, uso de ayudas técnicas cuando corresponda, kinesiterapia si está indicada.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  },
  {
    objetivo: 'Autocuidado de los pies (DM).',
    acuerdo: 'Realizar inspección y cuidado diario de pies.',
    acciones: 'Inspección diaria de pies, uso de calzado adecuado, secado cuidadoso entre dedos, no caminar descalzo.',
    plazo: 'Próximo control, para evaluar plan.',
    responsables: 'Persona.',
    seguimiento: 'En 2 meses.'
  }
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

const cicloVitalFamiliarOptions = [
  "Constitución de la pareja: Formación y establecimiento de la alianza.",
  "Nacimiento y crianza de los hijos: Familia en expansión, con roles parentales definidos.",
  "Hijos en edad escolar y adolescencia: Enfrentando la socialización y la búsqueda de autonomía.",
  "Salida de los hijos (nido vacío): La pareja se queda sola nuevamente, adaptándose a una nueva dinámica.",
  "Vejez y disolución: La pareja en edad madura o ancianidad, enfrentando la pérdida de uno de sus miembros y el final del ciclo."
];

const cicloVitalIndividualOptions = [
  "Primera Infancia (0-5 años): Máxima vulnerabilidad y desarrollo crucial.",
  "Infancia (6-11 años): Desarrollo escolar y social.",
  "Adolescencia (12-18 años): Cambios físicos y psicológicos importantes.",
  "Juventud (14-26 años): Transición a la adultez.",
  "Adultez (27-59 años): Plenitud de la vida laboral y familiar.",
  "Vejez/Persona Mayor (60+ años): Enfoque en la autonomía, participación y seguridad."
];

const tipologiaFamiliarOptions = [
  "Familia nuclear: Padres e hijos viviendo juntos, la forma más tradicional.",
  "Familia extensa: Incluye a otros parientes (abuelos, tíos) con previenen con el núcleo familiar.",
  "Familia monoparental: Formada por un solo progenitor (padre o madre) con sus hijos.",
  "Familia homoparental: Progenitores del mismo sexo con hijos.",
  "Familia reconstituida: Parejas donde uno o ambos miembros tienen hijos de relaciones anteriores (madrastras, padrastros).",
  "Familia sin hijos: Parejas sin descendencia.",
  "Familia adoptiva: Padres e hijos no biológicos.",
  "Familia de acogida: Acogen temporalmente a niños que no pueden estar con su familia de origen."
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
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const todayFormatted = `${yyyy}-${mm}-${dd}`;

const initialFormData: FichaControlEcicepFormData = {
  fechaControlActual: todayFormatted,
  fechaControlAnterior: '',
  ingresoControlAnterior: '',
  estadoSaludDesdeUltimoControl: 'Paciente refiere mantener buen estado de salud general desde el último control, sin hospitalizaciones, consultas de urgencia ni eventos agudos relevantes en el período.',
  cambiosDinamicaFamiliar: 'No',
  cambiosDinamicaFamiliarAclaracion: '',
  controlesExtrasistema: 'No',
  controlesExtrasistemaAclaracion: '',
  ram: 'No',
  ramAclaracion: '',
  requiereEducacionFarmacos: 'No',
  requiereEducacionFarmacosAclaracion: '',
  opcionesConversadas: '',
  planConsensuadoAnterior: '',
  objetivosAnteriores: [
    { objetivo: '', acuerdo: '', acciones: '', plazo: '', responsables: '', cumplio: '', aclaracionNoCumplimiento: '', seguimiento: '' }
  ],
  cumplioMetasPropuestas: '',
  duplaProfesional: '',
  duplaProfesionalOtroNombre: '',
  sinDupla: false,
  estratificacion: '',
  sexo: '',
  anamnesisGeneral: '',
  antecedentesPersonales: '',
  morbilidad: '',
  farmacos: '',
  adherenciaTratamiento: '',

  alergiasPresentes: false,
  alergiasDetalle: '',
  cirugiasPresentes: false,
  cirugiasDetalle: '',
  hospitalizacionesPresentes: false,
  hospitalizacionesDetalle: '',
  controlExtrasistemaPresente: false,
  controlExtrasistemaDetalle: '',

  empam: '',
  fondoOjo: '',
  podologo: '',
  evaluacionPie: '',
  // FIX: Added atencionesPsa to initialFormData to satisfy the FichaControlEcicepFormData interface.
  atencionesPsa: '',
  vacunas: 'Al día',

  alcoholPresente: false,
  alcoholDetalle: '',
  tabacoPresente: false,
  tabacoDetalle: '',
  drogasPresentes: false,
  drogasDetalle: '',
  actividadFisicaPresente: false,
  actividadFisicaDetalle: '',

  habitoMiccional: 'Normal',
  habitoDefecatorio: 'Normal',
  // FIX: Renamed actividadSexualProteccion to actividadSexual to match FichaControlEcicepFormData type definition.
  actividadSexual: '',
  encuestaAlimentaria: '',
  estadoSueno: 'Conservado',
  horasSueno: '',

  dificultadConciliacionPresente: false,
  dificultadConciliacionDetalle: '',
  dificultadMantencionPresente: false,
  dificultadMantencionDetalle: '',

  evolucionDesdeControlAnterior: '',

  phq9_interes: '',
  phq9_animo: '',
  phq9_sueno: '',
  phq9_energia: '',
  phq9_apetito: '',
  phq9_culpa: '',
  phq9_concentracion: '',
  phq9_motor: '',
  phq9_suicidio: '',

  escolaridad: '',
  ocupacion: '',
  antecedentesFamiliaresRelevantes: '',
  viveCon: '',
  factoresProtectores: '',
  estadoCivilHijos: '',
  redesApoyo: '',
  percepcionSituacionEconomica: '',
  espiritualidad: '',
  fechaExamenLaboratorio: '',
  resultadosLaboratorio: '',
  ekgFecha: '',
  ekgResultados: '',
  otrasImagenesFecha: '',
  otrasImagenesResultados: '',
  peso: '',
  talla: '',
  imc: '',
  pa: '',
  fc: '',
  cc: '',
  examenFisicoGeneralSegmentario: initialExamenFisicoText,

  integralIndividual: '',
  integralFamiliar: '',
  integralTipologia: '',
  integralCronicas: '',
  integralRiesgoCv: '',

  pccPersonaFamilia: '',
  pccEquipoSalud: '',
  tomaDecisionesCompartidas: '1. ',
  pccObjetivos: [],

  acuerdoPlanEquipo: 'Sí',
  acuerdoContactoSeguimiento: 'Sí',
  indicaciones: initialIndicaciones,
  planProximoControlDupla: '',
  planProximoControlTiempo: '',
  estadoAnimoDesc: '',
  habitoSuenoDesc: '',
  ideacionSuicidaDesc: '',
  incluirControlCardiovascular: false,
  incluirControlHipotiroidismo: false,
  incluirControlArtrosis: false,
  incluirControlEpilepsia: false,
  incluirControlSalaEra: false,
  incluirControlSalaIra: false,
  incluirControlDemencias: false,

  planEcicepLabsRutina: false,
  planEcicepEKG: false,
  planEcicepHBA1C: false,
  planEcicepHBA1CTiempo: '',
  planEcicepFondoOjo: false,
  planEcicepCtrlPiesEnf: false,
  planEcicepInterconsulta: false,
  planEcicepInterconsultaEspecialidad: '',
  indicacionesAdicionales: ''
};

interface CheckboxClarificationConfig {
  label: string;
  presenteKey: keyof FichaControlEcicepFormData;
  detalleKey: keyof FichaControlEcicepFormData;
  placeholder?: string;
}

const calculateIMC = (pesoStr: string, tallaStr: string): string => {
  const peso = parseFloat(pesoStr);
  const tallaCm = parseFloat(tallaStr);
  if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
    const tallaM = tallaCm / 100;
    return (peso / (tallaM * tallaM)).toFixed(2);
  }
  return '';
};

import { canUseAI } from '../utils/aiRestrictions';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const processFile = async (
  file: File,
  analysisType: 'laboratorio' | 'imagenes',
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  onSuccess: (result: { text: string; date?: string }) => void,
  loggedInUser: User | null
) => {
  // Check AI restrictions
  const check = canUseAI(loggedInUser);
  if (!check.allowed) {
    setError(check.reason || 'No tiene permiso para usar esta función.');
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  setError(null);

  const fileReader = new FileReader();
  fileReader.onload = async (event) => {
    if (!event.target?.result) {
      setError('Error al leer el archivo.');
      setIsLoading(false);
      return;
    }

    try {
      const dataUrl = event.target.result as string;
      const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);

      const ai = getAiClient();

      const filePart = {
        inlineData: {
          mimeType: file.type || 'application/pdf',
          data: base64Data,
        },
      };

      let prompt = '';
      if (analysisType === 'laboratorio') {
        prompt = `Analiza los resultados de exámenes de laboratorio del documento adjunto y genera un resumen limpio para una ficha clínica. Sigue estas reglas ESTRICTAMENTE:
1. OMITE CUALQUER DATO DEL PACIENTE (nombre, RUT, edad, etc.).
2. Para cada examen, formatea la salida en una nueva línea como: NOMBRE_EXAMEN_EN_MAYUSCULAS: [SÍMBOLO] VALOR UNIDADES.
3. Usa abreviaciones comunes para los nombres de los exámenes cuando sea posible (ej. CREATI para Creatinina).
4. OMITE POR COMPLETO los rangos de referencia. No los incluyas en la salida.
5. NO uses viñetas ni guiones.
6. Compara cada valor con su rango de referencia. Si el valor está POR ENCIMA del rango normal, precede el valor con el símbolo ▲. Si está POR DEBAJO del rango normal, precede el valor con el símbolo ▼. Si el valor está dentro del rango normal, no agregues ningún símbolo.
7. OMITE CUALQUER TÍTULO DE CATEGORÍA de examen (como "EXÁMENES BIOQUÍMICOS", "HEMOGRAMA", etc.). Solo incluye las líneas de resultados individuales.

Ejemplo de formato de salida deseado:
CREATI: 0.72 mg/dL
VFG: 104.2 ml/min/1.73m2
GLICEMIA: ▲103 mg/dL
POTASIO: ▼3.2 mEq/L`;
      } else { // imagenes
        prompt = `Analiza el informe de imagenología del documento adjunto y transcribe ÚNICAMENTE las secciones de "Hallazgos" e "Impresión radiológica". Sigue estas reglas ESTRICTAMENTE:
1. EXTRAE el nombre del estudio y la fecha del examen del documento. Formatea esto como un título en mayúsculas: NOMBRE_DEL_ESTUDIO DD/MM/AAAA.
2. OMITE POR COMPLETO cualquier dato personal del paciente (nombre, RUT, ID, fecha de nacimiento, médico tratante, etc.) y cualquier otra información administrativa.
3. Transcribe textualmente el contenido de las secciones "Hallazgos" e "Impresión radiológica" (o sus equivalentes, como "Informe" o "Conclusión"). Mantén la estructura de párrafos original.
4. Si las secciones tienen títulos, inclúyelos (ej. "Hallazgos:", "Impresión radiológica:").

Ejemplo de formato de salida deseado:
RESONANCIA MAGNÉTICA DE COLUMNA CERVICAL 02/09/2025
Hallazgos:
Unión craneocervical normal. Adecuado alineamiento vertebral...
...
Impresión radiológica:
Discopatía degenerativa C5-C6...`;
      }

      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: { parts: [filePart, textPart] },
      });

      const resultText = response.text || '';

      if (analysisType === 'imagenes' && resultText) {
        const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/;
        const match = resultText.match(dateRegex);
        let extractedDate: string | undefined = undefined;

        if (match && match[1]) {
          const [day, month, year] = match[1].split('/');
          const paddedDay = day.padStart(2, '0');
          const paddedMonth = month.padStart(2, '0');
          extractedDate = `${year}-${paddedMonth}-${paddedDay}`;
        }

        onSuccess({ text: resultText, date: extractedDate });
      } else {
        onSuccess({ text: resultText });
      }
    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      setError('Ocurrió un error al contactar la IA. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  fileReader.onerror = () => {
    setError('Error al leer el archivo.');
    setIsLoading(false);
  };
  fileReader.readAsDataURL(file);
};

interface CheckboxClarificationItem {
  keyBase: keyof FichaControlEcicepFormData;
  label: string;
}

// Fixed: Updated keyBase values to match FichaControlEcicepFormData keys
const habitosCheckboxConfig: CheckboxClarificationItem[] = [
  { keyBase: 'alcoholPresente', label: 'Alcohol' },
  { keyBase: 'tabacoPresente', label: 'Tabaco' },
  { keyBase: 'drogasPresentes', label: 'Drogas' },
];

interface FichaControlEcicepNuevoProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>;
  fechaControlProp?: string;
  onFechaControlChange?: (fecha: string) => void;
}

export const FichaControlEcicepNuevo: React.FC<FichaControlEcicepNuevoProps> = ({ 
  onBackToMenu, 
  loggedInUser,
  actionsRef,
  fechaControlProp,
  onFechaControlChange,
}) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlEcicepFormData>('local_FichaControlEcicepNuevo', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isPhq9ModalOpen, setIsPhq9ModalOpen] = useState(false);
  const [showIngresoFields, setShowIngresoFields] = useState(false);
  const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);
  const [isPredefinedPlanOpen, setIsPredefinedPlanOpen] = useState(false);
  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);
  const [planSearchTerm, setPlanSearchTerm] = useState('');

  const [isLabLoading, setIsLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const [isEkgLoading, setIsEkgLoading] = useState(false);
  const [ekgError, setEkgError] = useState<string | null>(null);
  const ekgFileRef = useRef<HTMLInputElement>(null);

  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const predefinedPlanRef = useRef<HTMLDivElement>(null);

  // Synchronize App.tsx state updates to local form state ONLY on initial mount/reset
  // (not on every keystroke to avoid overwriting what the user is typing)
  useEffect(() => {
    const d = new Date();
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!formData.fechaControlActual) {
      setFormData(prev => ({ ...prev, fechaControlActual: fechaControlProp || isoDate }));
    } else if (fechaControlProp && formData.fechaControlActual !== fechaControlProp) {
      setFormData(prev => ({ ...prev, fechaControlActual: fechaControlProp }));
    }
  }, [fechaControlProp]);

  // Synchronize local form state to App.tsx only when date is complete (10 chars = DD-MM-AAAA)
  useEffect(() => {
    if (formData.fechaControlActual?.length === 10 && onFechaControlChange) {
      onFechaControlChange(formData.fechaControlActual);
    }
  }, [formData.fechaControlActual, onFechaControlChange]);

  useEffect(() => {
    if (!formData.tomaDecisionesCompartidas) {
      setFormData(prev => ({ ...prev, tomaDecisionesCompartidas: '1. ' }));
    }
  }, []);

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: handleExportPdf,
        newForm: handleNewDocument,
        imprimirResumen: () => generateEcicepResumenPdf(formData as any, loggedInUser as any),
        editarDrive: handleDriveEdit
      };
    }
  }, [actionsRef, formData, loggedInUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (predefinedPlanRef.current && !predefinedPlanRef.current.contains(event.target as Node)) {
        setIsPredefinedPlanOpen(false);
        setPlanSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'laboratorio', setIsLabLoading, setLabError, (result) => {
      setFormData(prev => ({ ...prev, resultadosLaboratorio: result.text }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
  };

  const handleEkgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'imagenes', setIsEkgLoading, setEkgError, (result) => {
      setFormData(prev => ({
        ...prev,
        ekgResultados: result.text,
        ...(result.date && { ekgFecha: result.date }),
      }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
  };

  const handleImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'imagenes', setIsImgLoading, setImgError, (result) => {
      setFormData(prev => ({
        ...prev,
        otrasImagenesResultados: result.text,
        ...(result.date && { otrasImagenesFecha: result.date }),
      }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    const newImc = calculateIMC(formData.peso, formData.talla);
    if (newImc !== formData.imc) {
      setFormData(prev => ({ ...prev, imc: newImc }));
    }
  }, [formData.peso, formData.talla, formData.imc]);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    // DD-MM-AAAA format (new)
    if (parts[2].length === 4) return dateString;
    // AAAA-MM-DD format (legacy)
    const [year, month, day] = parts;
    if (!year || !month || !day || year.length !== 4) return dateString;
    return `${day}-${month}-${year}`;
  };

  const phq9Score = useMemo(() => {
    return phq9Questions.reduce((total, question) => {
      const value = formData[question.key as keyof FichaControlEcicepFormData];
      return total + (parseInt(value as string, 10) || 0);
    }, 0);
  }, [formData]);

  const phq9Interpretation = useMemo(() => {
    const score = phq9Score;
    let severity = '';
    let action = '';

    if (score >= 0 && score <= 4) {
      severity = 'Depresión mínima';
      action = 'No requiere acción. Reevaluar si hay cambios.';
    } else if (score >= 5 && score <= 9) {
      severity = 'Depresión Leve';
      action = 'Vigilancia; reevaluar en seguimiento. Considerar consejería.';
    } else if (score >= 10 && score <= 14) {
      severity = 'Depresión Moderada';
      action = 'Considerar tratamiento activo (psicoterapia y/o farmacoterapia).';
    } else if (score >= 15 && score <= 19) {
      severity = 'Depresión Moderadamente Severa';
      action = 'Iniciar tratamiento activo (farmacoterapia y/o psicoterapia).';
    } else if (score >= 20) {
      severity = 'Depresión Severa';
      action = 'Tratamiento activo inmediato (farmacoterapia y psicoterapia). Considerar derivación a especialista.';
    }

    const suicidioScore = parseInt(formData.phq9_suicidio as string, 10) || 0;
    if (suicidioScore > 0) {
      action += '\n¡ATENCIÓN! Respuesta positiva a ideación suicida. Evaluar riesgo y tomar medidas inmediatas según protocolo.';
    }

    return { score, severity, action };
  }, [phq9Score, formData.phq9_suicidio]);

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    const addCheckboxFieldToSummary = (label: string, presenteKey: keyof FichaControlEcicepFormData, detalleKey: keyof FichaControlEcicepFormData) => {
      const isPresente = formData[presenteKey];
      const detalle = formData[detalleKey] as string;
      let line = `${label}: ${isPresente ? 'Sí' : 'Niega'}`;
      if (isPresente && detalle) {
        line += ` - ${detalle}`;
      }
      return line + '\n';
    };

    anamnesis += `FICHA CONTROL ECICEP\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA CONTROL: ${formatDateForDisplay(formData.fechaControlActual)}\n`;
    anamnesis += `ÚLTIMO CONTROL ECICEP: ${formData.fechaControlAnterior || '(No ingresado)'}\n`;
    let duplaText = formData.sinDupla ? "(Sin dupla)" : `Médico + ${formData.duplaProfesional || "(No seleccionado)"}`;
    anamnesis += `DUPLA PROFESIONAL: ${duplaText}\n`;
    if (loggedInUser) {
      let profRespText = loggedInUser.fullName;
      if (!formData.sinDupla && formData.duplaProfesional && formData.duplaProfesionalOtroNombre) {
        profRespText += ` + ${formData.duplaProfesionalOtroNombre}`;
      }
      anamnesis += `PROFESIONAL RESPONSABLE: ${profRespText}\n`;
    }
    anamnesis += `ESTRATIFICACIÓN: ${formData.estratificacion || '(No seleccionado)'}\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `EVALUACIÓN DESDE ÚLTIMO CONTROL:\n`;
    anamnesis += `Estado de salud: ${formData.estadoSaludDesdeUltimoControl || '(No ingresado)'}\n`;
    const formatSiNo = (valor: string, aclaracion: string) => {
      if (!valor) return '(No seleccionado)';
      if (valor === 'No') return 'No';
      return aclaracion ? `Sí. ${aclaracion}` : 'Sí';
    };
    anamnesis += `¿Hubo cambios en su dinámica familiar? ${formatSiNo(formData.cambiosDinamicaFamiliar, formData.cambiosDinamicaFamiliarAclaracion)}\n`;
    anamnesis += `¿Tuvo controles extrasistema? ${formatSiNo(formData.controlesExtrasistema, formData.controlesExtrasistemaAclaracion)}\n`;
    anamnesis += `¿Sufrió RAM a medicamentos? ${formatSiNo(formData.ram, formData.ramAclaracion)}\n`;
    anamnesis += `¿Requiere educación sobre fármacos? ${formatSiNo(formData.requiereEducacionFarmacos, formData.requiereEducacionFarmacosAclaracion)}\n\n`;

    anamnesis += `PLAN Y METAS ANTERIORES:\n`;
    if (formData.objetivosAnteriores && formData.objetivosAnteriores.length > 0) {
      formData.objetivosAnteriores.forEach((obj, idx) => {
        if (!obj.objetivo) return;
        anamnesis += `OBJETIVO #${idx + 1}:\n`;
        anamnesis += `  Objetivo: ${obj.objetivo || '(No ingresado)'}\n`;
        anamnesis += `  ¿Cumplió?: ${obj.cumplio || '(Sin evaluar)'}${(obj.cumplio === 'Sí' || obj.cumplio === 'No') ? ` - Aclaración: ${obj.aclaracionNoCumplimiento || '(Sin aclarar)'}` : ''}\n\n`;
      });
    } else {
      anamnesis += `(Sin registros del plan anterior)\n\n`;
    }

    anamnesis += `ATENCIONES VIGENTES (REVISIÓN):\n`;
    anamnesis += `EMPAM: ${stripStatusBracket(formData.empam || '') || '(No ingresado)'}\n`;
    anamnesis += `Fondo de ojo: ${stripStatusBracket(formData.fondoOjo || '') || '(No ingresado)'}\n`;
    anamnesis += `Podólogo: ${stripStatusBracket(formData.podologo || '') || '(No ingresado)'}\n`;
    anamnesis += `Evaluación de pie: ${stripStatusBracket(formData.evaluacionPie || '') || '(No ingresado)'}\n`;
    if (formData.sexo === 'Masculino') {
      anamnesis += `PSA: ${formData.atencionesPsa || '(No ingresado)'}\n`;
    }
    anamnesis += `Vacunas: ${formData.vacunas || '(No ingresado)'}\n\n`;

    anamnesis += `REGISTRO DE CONTROL ANTERIOR: \n${formData.ingresoControlAnterior || '(No ingresado)'}\n\n`;

    // --- CONTROLES ADICIONALES ---
    const fd = formData as any;
    const controlesActivos = [
      fd.incluirControlCardiovascular && 'Cardiovascular',
      fd.incluirControlHipotiroidismo && 'Hipotiroidismo',
      fd.incluirControlArtrosis && 'Artrosis',
      fd.incluirControlEpilepsia && 'Epilepsia',
      fd.incluirControlSalaEra && 'Sala ERA',
      fd.incluirControlSalaIra && 'Sala IRA',
      fd.incluirControlDemencias && 'Demencias',
      fd.incluirControlSm && 'Salud Mental',
    ].filter(Boolean);

    if (controlesActivos.length > 0) {
      anamnesis += `CONTROLES ADICIONALES ACTIVOS: ${controlesActivos.join(', ')}\n\n`;
    }

    if (fd.incluirControlCardiovascular) {
      anamnesis += `SÍNTOMAS CARDIOVASCULARES:\n`;
      [
        {k:'cv_sintoma_ortopnea',l:'Ortopnea'},{k:'cv_sintoma_dpn',l:'DPN'},{k:'cv_sintoma_nicturia',l:'Nicturia'},
        {k:'cv_sintoma_edema',l:'Edema en MM.II.'},{k:'cv_sintoma_angor',l:'Ángor'},{k:'cv_sintoma_palpitaciones',l:'Palpitaciones'},
        {k:'cv_sintoma_polidipsia',l:'Polidipsia'},{k:'cv_sintoma_poliuria',l:'Poliuria'},{k:'cv_sintoma_polifagia',l:'Polifagia'},{k:'cv_sintoma_perdida_peso',l:'Pérdida de peso'},
      ].forEach(i => anamnesis += `- ${i.l}: ${fd[i.k] ? 'Sí' : 'Niega'}\n`);
      anamnesis += `\n`;
    }
    if (fd.incluirControlHipotiroidismo) {
      anamnesis += `CONTROL HIPOTIROIDISMO:\n`;
      const hipoS = [{k:'hipo_sintoma_astenias',l:'Astenia'},{k:'hipo_sintoma_somnolencia',l:'Somnolencia'},{k:'hipo_sintoma_constipacion',l:'Constipación'},{k:'hipo_sintoma_intolerancia_frio',l:'Intolerancia al frío'},{k:'hipo_sintoma_edema',l:'Edema'},{k:'hipo_sintoma_aumento_peso',l:'Aumento de peso'},{k:'hipo_sintoma_piel_seca',l:'Piel seca'},{k:'hipo_sintoma_caida_cabello',l:'Caída de cabello'},{k:'hipo_sintoma_calambres',l:'Calambres'}];
      anamnesis += `Síntomas: ${hipoS.filter(s=>fd[s.k]).map(s=>s.l).join(', ') || 'Niega'}\n`;
      if (fd.hipo_tsh_fecha || fd.hipo_tsh_resultado) anamnesis += `TSH (${fd.hipo_tsh_fecha||'sin fecha'}): ${fd.hipo_tsh_resultado||'(no ingresado)'}\n`;
      if (fd.hipo_t4l_resultado) anamnesis += `T4 libre: ${fd.hipo_t4l_resultado}\n`;
      anamnesis += `Adherencia Levotiroxina: ${fd.hipo_adherencia_levotiroxina||'(No)'} | Ayuno correcto: ${fd.hipo_ayuno_correcto||'(No)'} | Fármacos interferentes: ${fd.hipo_farmacos_interferentes||'(No)'}\n`;
      if (fd.hipo_observaciones) anamnesis += `Obs: ${fd.hipo_observaciones}\n`;
      anamnesis += `\n`;
    }
    if (fd.incluirControlArtrosis) {
      anamnesis += `CONTROL ARTROSIS:\n`;
      anamnesis += `Articulaciones: ${fd.art_articulaciones_afectadas||'(No ingresado)'} | EVA: ${fd.art_dolor_eva||'0'}/10\n`;
      anamnesis += `Limitación funcional: ${fd.art_limitacion_funcional||'(No ingresado)'}\n`;
      anamnesis += `Analgésicos: ${fd.art_uso_analgesicos||'No'}${fd.art_analgesicos_cuales ? ` (${fd.art_analgesicos_cuales})` : ''} | Kinesi: ${fd.art_kinesiterapia||'No'} | Ayudas técnicas: ${fd.art_ayudas_tecnicas||'No'}\n`;
      if (fd.art_radiografia_fecha || fd.art_radiografia_resultado) anamnesis += `Radiografía (${fd.art_radiografia_fecha||'sin fecha'}): ${fd.art_radiografia_resultado||'(no ingresado)'}\n`;
      if (fd.art_observaciones) anamnesis += `Obs: ${fd.art_observaciones}\n`;
      anamnesis += `\n`;
    }
    if (fd.incluirControlEpilepsia) {
      anamnesis += `CONTROL EPILEPSIA:\n`;
      anamnesis += `Tipo de crisis: ${fd.epi_tipo_crisis||'(No ingresado)'} | Última: ${fd.epi_ultima_crisis_fecha||'(No)'} | Frecuencia: ${fd.epi_frecuencia_crisis||'(No)'}\n`;
      anamnesis += `FAE: ${fd.epi_farmaco_antiepiléptico||'(No ingresado)'} | Adherencia: ${fd.epi_adherencia||'(No)'}\n`;
      if (fd.epi_niveles_plasmaticos_resultado) anamnesis += `Niveles plasmáticos (${fd.epi_niveles_plasmaticos_fecha||'sin fecha'}): ${fd.epi_niveles_plasmaticos_resultado}\n`;
      anamnesis += `Efectos secundarios: ${fd.epi_efectos_secundarios||'Niega'} | Restricción conducción: ${fd.epi_restricciones_conduccion||'(No)'}\n`;
      if (fd.epi_observaciones) anamnesis += `Obs: ${fd.epi_observaciones}\n`;
      anamnesis += `\n`;
    }
    if (fd.incluirControlSalaEra) {
      anamnesis += `SÍNTOMAS RESPIRATORIOS (SALA ERA):\n`;
      [{k:'era_sintoma_tos',l:'Tos'},{k:'era_sintoma_opresion',l:'Opresión torácica'},{k:'era_sintoma_rinorrea',l:'Rinorrea'},{k:'era_sintoma_estornudos',l:'Estornudos en salva'},{k:'era_sintoma_prurito',l:'Prurito'},{k:'era_sintoma_limitan',l:'Limitan actividades'},{k:'era_sintoma_diarios',l:'Diarios'},{k:'era_sintoma_nocturnos',l:'Nocturnos'},{k:'era_sintoma_sbt_sos',l:'SBT SOS'},{k:'era_sintoma_urgencias',l:'Urgencias'},{k:'era_sintoma_corticoides',l:'Corticoides sistémicos'}].forEach(i => anamnesis += `- ${i.l}: ${fd[i.k] ? 'Sí' : 'Niega'}\n`);
      anamnesis += `Desencadenantes: `;
      const desenc = [{k:'era_desencadenante_mascotas',l:'Mascotas'},{k:'era_desencadenante_higiene',l:'Higiene hogar'},{k:'era_desencadenante_alfombras',l:'Alfombras'},{k:'era_desencadenante_tabaco_ambiental',l:'Tabaco ambiental'},{k:'era_desencadenante_cocina',l:'Cocina leña'},{k:'era_desencadenante_calefaccion',l:'Calefacción'}];
      anamnesis += desenc.filter(d=>fd[d.k]).map(d=>d.l).join(', ') || 'Ninguno';
      anamnesis += `\n\n`;
    }
    if (fd.incluirControlSalaIra) {
      anamnesis += `CONTROL SALA IRA:\n`;
      anamnesis += `Diagnóstico: ${fd.ira_diagnostico||'(No ingresado)'}\n`;
      const iraS = [{k:'ira_sintoma_tos',l:'Tos'},{k:'ira_sintoma_fiebre',l:'Fiebre'},{k:'ira_sintoma_rinorrea',l:'Rinorrea'},{k:'ira_sintoma_odinofagia',l:'Odinofagia'},{k:'ira_sintoma_disnea',l:'Disnea'}];
      anamnesis += `Síntomas: ${iraS.filter(s=>fd[s.k]).map(s=>s.l).join(', ')||'Niega'}\n`;
      if (fd.ira_saturacion) anamnesis += `Saturación: ${fd.ira_saturacion}% | FR: ${fd.ira_fr||'(No)'} resp/min\n`;
      anamnesis += `Broncodilatador: ${fd.ira_uso_broncodilatador||'No'}${fd.ira_broncodilatador_cual ? ` (${fd.ira_broncodilatador_cual})` : ''} | Nebulización: ${fd.ira_nebulizacion||'No'} | Rx: ${fd.ira_rx_torax||'No realizada'}${fd.ira_rx_resultado ? ` - ${fd.ira_rx_resultado}` : ''}\n`;
      if (fd.ira_observaciones) anamnesis += `Obs: ${fd.ira_observaciones}\n`;
      anamnesis += `\n`;
    }
    if (fd.incluirControlDemencias) {
      anamnesis += `CONTROL DEMENCIAS:\n`;
      anamnesis += `Diagnóstico: ${fd.dem_diagnostico||'(No ingresado)'} | Estadio: ${fd.dem_estadio||'(No)'}\n`;
      if (fd.dem_mmse_puntaje) anamnesis += `MMSE (${fd.dem_mmse_fecha||'sin fecha'}): ${fd.dem_mmse_puntaje} | Barthel: ${fd.dem_barthel_puntaje||'(No)'}\n`;
      anamnesis += `Cuidador: ${fd.dem_cuidador_principal||'(No)'} | Sobrecarga: ${fd.dem_sobrecarga_cuidador||'No'}\n`;
      const demS = [{k:'dem_sintoma_deambulacion',l:'Alt.deambulación'},{k:'dem_sintoma_alimentacion',l:'Alt.alimentación'},{k:'dem_sintoma_continencia',l:'Incontinencia'},{k:'dem_sintoma_conductas',l:'Conductas disruptivas'},{k:'dem_sintoma_agitacion',l:'Agitación'}];
      anamnesis += `Síntomas: ${demS.filter(s=>fd[s.k]).map(s=>s.l).join(', ')||'Sin síntomas'}\n`;
      if (fd.dem_farmaco_antidemencia) anamnesis += `FAD: ${fd.dem_farmaco_antidemencia} | Adherencia: ${fd.dem_adherencia||'(No)'}\n`;
      anamnesis += `Derivación: ${fd.dem_derivacion_especialidad||'No'}\n`;
      if (fd.dem_observaciones) anamnesis += `Obs: ${fd.dem_observaciones}\n`;
      anamnesis += `\n`;
    }
    if (fd.incluirControlSm) {
      anamnesis += `SÍNTOMAS SALUD MENTAL:\n`;
      anamnesis += `- Ánimo: ${fd.sm_sintoma_animo||'(No)'}\n- Ansiosos: ${fd.sm_sintoma_ansiosos||'(No)'}\n- Somatizaciones: ${fd.sm_sintoma_somatizaciones||'(No)'}\n- Sueño: ${fd.sm_sintoma_sueno||'(No)'}\n- Psicóticos: ${fd.sm_sintoma_psicoticos||'(No)'}\n- Ideación suicida: ${fd.sm_sintoma_suicidio||'(No)'}\n\n`;
    }

    exploracion += `EXÁMENES RECIENTES:\n`;
    exploracion += `Laboratorio (Fecha: ${formatDateForDisplay(formData.fechaExamenLaboratorio)}): ${formData.resultadosLaboratorio || '(No ingresado)'}\n`;
    exploracion += `EKG (Fecha: ${formatDateForDisplay(formData.ekgFecha)}): ${formData.ekgResultados || '(No ingresado)'}\n`;
    exploracion += `Otras Imágenes (Fecha: ${formatDateForDisplay(formData.otrasImagenesFecha)}): ${formData.otrasImagenesResultados || '(No ingresado)'}\n\n`;

    exploracion += `EXAMEN FÍSICO:\n`;
    exploracion += `- Peso: ${formData.peso || '(No ingresado)'} kg\n`;
    exploracion += `- Talla: ${formData.talla || '(No ingresado)'} cm\n`;
    exploracion += `- IMC: ${formData.imc || '(No calculado)'} kg/m²\n`;
    exploracion += `- PA: ${formData.pa || '(No ingresado)'} mmHg\n`;
    exploracion += `- FC: ${formData.fc || '(No ingresado)'} lpm\n`;
    exploracion += `- CC: ${formData.cc || '(No ingresado)'} cm\n\n`;
    exploracion += `Examen Físico General/Segmentario:\n${formData.examenFisicoGeneralSegmentario || '(No ingresado)'}\n\n`;

    const extractMacroTitle = (str: string | undefined): string => {
      if (!str) return '(No ingresado)';
      const colonIndex = str.indexOf(':');
      return colonIndex !== -1 ? `${str.substring(0, colonIndex)}.` : str;
    };

    // VALORACIÓN INTEGRAL
    actuacion += `VALORACIÓN INTEGRAL:\n`;
    actuacion += `Ciclo vital individual: ${extractMacroTitle(formData.integralIndividual)}\n`;
    actuacion += `Ciclo vital familiar: ${extractMacroTitle(formData.integralFamiliar)}\n`;
    actuacion += `Tipología familiar: ${extractMacroTitle(formData.integralTipologia)}\n`;
    actuacion += `Condiciones crónicas y problemáticas: ${formData.integralCronicas || '(No ingresado)'}\n`;
    actuacion += `Estratificación de riesgo cardiovascular: ${formData.integralRiesgoCv || '(No seleccionado)'}\n\n`;

    // PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS
    actuacion += `PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS:\n`;
    actuacion += `PROBLEMAS VISUALIZADOS:\n`;
    actuacion += `Persona y familia: ${formData.pccPersonaFamilia || '(No ingresado)'}\n`;
    actuacion += `Equipo de salud: ${formData.pccEquipoSalud || '(No ingresado)'}\n\n`;

    if (formData.tomaDecisionesCompartidas) {
      actuacion += `PRIORIZACIÓN DE PROBLEMAS:\n${formData.tomaDecisionesCompartidas}\n\n`;
    }

    if (formData.opcionesConversadas) {
      actuacion += `OPCIONES CONVERSADAS Y ACTIVOS COMUNITARIOS:\n${formData.opcionesConversadas}\n\n`;
    }

    actuacion += `PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS:\n`;
    if (formData.pccObjetivos && formData.pccObjetivos.length > 0) {
      formData.pccObjetivos.forEach((obj, idx) => {
        actuacion += `OBJETIVO/META #${idx + 1}:\n`;
        actuacion += `  Objetivo: ${obj.objetivo || '(No ingresado)'}\n`;
        actuacion += `  Acuerdo: ${obj.acuerdo || '(No ingresado)'}\n`;
        actuacion += `  Acciones específicas: ${obj.acciones || '(No ingresado)'}\n`;
        actuacion += `  Plazo: ${obj.plazo || '(No ingresado)'}\n`;
        actuacion += `  Responsable/s: ${obj.responsables || '(No ingresado)'}\n`;
        actuacion += `  Seguimiento: ${obj.seguimiento || '(No ingresado)'}\n\n`;
      });
    } else {
      actuacion += `(Sin objetivos agregados)\n\n`;
    }

    actuacion += `¿Está de acuerdo con el plan elaborado en conjunto con el equipo ECICEP?: ${formData.acuerdoPlanEquipo || '(No seleccionado)'}\n`;
    actuacion += `¿Está de acuerdo con que lo contactemos para seguimiento?: ${formData.acuerdoContactoSeguimiento || '(No seleccionado)'}\n\n`;

    actuacion += `INDICACIONES ADICIONALES:\n`;
    if (formData.indicaciones && formData.indicaciones.trim() !== '') {
      actuacion += `${formData.indicaciones.trim()}\n`;
    }

    if (formData.planProximoControlDupla || formData.planProximoControlTiempo) {
      let futureMonthText = '';
      if (formData.planProximoControlTiempo) {
        const monthsMatch = formData.planProximoControlTiempo.match(/\d+/);
        if (monthsMatch) {
          const numMonths = parseInt(monthsMatch[0], 10);
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + numMonths);
          futureMonthText = ` (${futureDate.toLocaleString('es-CL', { month: 'long' })} ${futureDate.getFullYear()})`;
        }
      }
      actuacion += `- Próximo control con Médico + ${formData.planProximoControlDupla || '(dupla no especificada)'} en ${formData.planProximoControlTiempo || '(tiempo no especificado)'}${futureMonthText}.\n`;
    }

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim()
    };
  }, [formData, loggedInUser, phq9Interpretation, showIngresoFields]);

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

  const handleInputChange = useCallback((name: keyof FichaControlEcicepFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleSelectDuplaUser = useCallback((user: User) => {
    setFormData(prev => ({
      ...prev,
      duplaProfesional: professionLabels[user.profession] || user.profession,
      duplaProfesionalOtroNombre: user.fullName,
    }));
  }, [setFormData]);

  const handleClearDuplaUser = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      duplaProfesional: '',
      duplaProfesionalOtroNombre: '',
    }));
  }, [setFormData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => {
        const newState = { ...prev, [name]: checked };
        if (!checked) {
          const detailKey = name.replace('Presentes', 'Detalle');
          if (detailKey in newState) {
            (newState as any)[detailKey] = '';
          }
        }
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  }, []);

  const handleRadioChange = useCallback((name: keyof FichaControlEcicepFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleUpdatePccObjetivo = (index: number, field: keyof PccObjetivo, value: string) => {
    setFormData(prev => {
      const newObjetivos = [...(prev.pccObjetivos || [])];
      newObjetivos[index] = { ...newObjetivos[index], [field]: value };
      return { ...prev, pccObjetivos: newObjetivos };
    });
  };

  const handleUpdateObjetivoAnterior = (index: number, field: keyof ObjetivoAnterior, value: string) => {
    setFormData(prev => {
      const newObjetivos = [...prev.objetivosAnteriores];
      newObjetivos[index] = { ...newObjetivos[index], [field]: value };
      return { ...prev, objetivosAnteriores: newObjetivos };
    });
  };

  const handleAddPccObjetivo = () => {
    setFormData(prev => ({ ...prev, pccObjetivos: [...(prev.pccObjetivos || []), { objetivo: '', acuerdo: '', acciones: '', plazo: '', responsables: '', seguimiento: '' }] }));
  };

  const handleAddObjetivoAnterior = () => {
    setFormData(prev => ({
      ...prev,
      objetivosAnteriores: [...prev.objetivosAnteriores, { objetivo: '', acuerdo: '', acciones: '', plazo: '', responsables: '', cumplio: '', aclaracionNoCumplimiento: '' }]
    }));
  };

  const handleRemoveObjetivoAnterior = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objetivosAnteriores: prev.objetivosAnteriores.filter((_, i) => i !== index)
    }));
  };

  const handleAddPredefinedPlan = (plan: PccObjetivo) => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [...(prev.pccObjetivos || []), { ...plan }]
    }));
    setIsPredefinedPlanOpen(false);
    setPlanSearchTerm('');
  };

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert(`'${partName}' copiado al portapapeles.`))
      .catch(err => alert('Error al copiar texto.'));
  };

  const handleNewDocument = () => {
    window.localStorage.removeItem('local_FichaControlEcicepNuevo');
    setFormData(JSON.parse(JSON.stringify(initialFormData)));
    
    if (onFechaControlChange) onFechaControlChange(initialFormData.fechaControlActual);
    
    setShowIngresoFields(false);
    setAnamnesisText('');
    setExploracionText('');
    setActuacionText('');
    setStatus(FormStatus.Idle);
    setIsPhq9ModalOpen(false);
    setIsRiskCalculatorOpen(false);
    setIsPredefinedPlanOpen(false);
    
    if (labFileRef.current) labFileRef.current.value = '';
    if (ekgFileRef.current) ekgFileRef.current.value = '';
    if (imgFileRef.current) imgFileRef.current.value = '';
  };

  const handleExportPdf = async () => {
    if (!loggedInUser) {
      alert('Error: Usuario no identificado. No se puede generar el PDF.');
      return;
    }

    setStatus(FormStatus.Generating);
    try {
      const fullContent = `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}`;
      await generateClinicalRecordPdf(
        {
          title: 'Ficha Clínica: Control ECICEP',
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

  const handleDriveEdit = () => {
    const monthsMatch = formData.planProximoControlTiempo.match(/\d+/);
    const monthsToAdd = monthsMatch ? parseInt(monthsMatch[0]) : 0;

    const date = new Date();
    date.setMonth(date.getMonth() + monthsToAdd);
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const futureMonthName = monthNames[date.getMonth()];

    const textToCopy = `Próximo control en ${formData.planProximoControlTiempo || 'X meses'} (${futureMonthName}) con ${formData.planProximoControlDupla.toLowerCase() || 'profesional'}.`;

    navigator.clipboard.writeText(textToCopy);

    // Determine the Drive link based on the user's sector
    let driveLink = 'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0'; // Default to Verde if not specified

    if (loggedInUser?.sector === 'Naranjo') {
      driveLink = 'https://docs.google.com/spreadsheets/d/17cNcOTdn8qupYchtc10ouMG45ve_BpaZZmTGEdos-4Q/edit?gid=152571995#gid=152571995';
    } else if (loggedInUser?.sector === 'Amarillo') {
      driveLink = 'https://docs.google.com/spreadsheets/d/1paEDMTrLz2Ig_jpayPoc1z1GsnJTfSAR/edit?gid=1909397780#gid=1909397780';
    } else if (loggedInUser?.sector === 'Verde') {
      driveLink = 'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0';
    }

    window.open(driveLink, '_blank');
  };

  const renderRadioGroup = (
    label: string,
    name: string,
    options: { value: string, label: string }[],
    currentValue?: string,
    onChangeHandler?: (val: string) => void
  ) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}:</label>
        <div className="flex items-center space-x-4">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center text-sm">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={(currentValue !== undefined ? currentValue : (formData as any)[name]) === opt.value}
                onChange={() => onChangeHandler ? onChangeHandler(opt.value) : handleRadioChange(name as any, opt.value)}
                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderCheckboxClarificationField = (config: CheckboxClarificationConfig) => {
    const isChecked = formData[config.presenteKey] as boolean;
    return (
      <div key={String(config.presenteKey)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={String(config.presenteKey)}
            name={String(config.presenteKey)}
            checked={isChecked}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
          />
          <label htmlFor={String(config.presenteKey)} className="ml-2 text-sm font-medium text-slate-700">
            {config.label}
          </label>
        </div>
        {isChecked && (
          <FormField
            label="Aclaración:"
            id={String(config.detalleKey)}
            name={String(config.detalleKey)}
            value={formData[config.detalleKey] as string}
            onChange={handleChange}
            placeholder={config.placeholder || "Aclare aquí..."}
            isTextArea
            rows={1}
            containerClassName="mt-2"
          />
        )}
      </div>
    );
  };

  const duplaProfesionalOptions = [
    { value: '', label: 'Seleccione...' },
    { value: 'Enfermera', label: 'Enfermera' },
    { value: 'Nutricionista', label: 'Nutricionista' },
    { value: 'Psicóloga', label: 'Psicóloga' },
    { value: 'Kinesiólogo', label: 'Kinesiólogo' },
    { value: 'Matrona', label: 'Matrona' },
    { value: 'TENS', label: 'TENS' },
    { value: 'Químico farmacéutico', label: 'Químico farmacéutico' },
    { value: 'Asistente social', label: 'Asistente social' },
  ];

  const filteredPredefinedPlans = useMemo(() => {
    if (!planSearchTerm.trim()) return predefinedPccPlans;
    const term = planSearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return predefinedPccPlans.filter(p =>
      p.acuerdo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term)
    );
  }, [planSearchTerm]);

  const tiempoControlOptions = [
    { value: '', label: 'Seleccione...' },
    { value: '1 mes', label: '1 mes' },
    { value: '2 meses', label: '2 meses' },
    { value: '3 meses', label: '3 meses' },
    { value: '4 meses', label: '4 meses' },
    { value: '5 meses', label: '5 meses' },
    { value: '6 meses', label: '6 meses' },
    { value: '12 meses', label: '12 meses' },
  ];

  const cicloVitalFamiliarOptions = [
    "Constitución de la pareja: Formación y establecimiento de la alianza.",
    "Nacimiento y crianza de los hijos: Familia en expansión, con roles parentales definidos.",
    "Hijos en edad escolar y adolescencia: Enfrentando la socialización y la búsqueda de autonomía.",
    "Salida de los hijos (nido vacío): La pareja se queda sola nuevamente, adaptándose a una nueva dinámica.",
    "Vejez y disolución: La pareja en edad madura o ancianidad, enfrentando la pérdida de uno de sus miembros y el final del ciclo."
  ];

  const cicloVitalIndividualOptions = [
    "Primera Infancia (0-5 años): Máxima vulnerabilidad y desarrollo crucial.",
    "Infancia (6-11 años): Desarrollo escolar y social.",
    "Adolescencia (12-18 años): Cambios físicos y psicológicos importantes.",
    "Juventud (14-26 años): Transición a la adultez.",
    "Adultez (27-59 años): Plenitud de la vida laboral y familiar.",
    "Vejez/Persona Mayor (60+ años): Enfoque en la autonomía, participación y seguridad."
  ];

  const tipologiaFamiliarOptions = [
    "Familia nuclear: Padres e hijos viviendo juntos, la forma más tradicional.",
    "Familia extensa: Incluye a otros parientes (abuelos, tíos) que conviven con el núcleo familiar.",
    "Familia monoparental: Formada por un solo progenitor (padre o madre) con sus hijos.",
    "Familia homoparental: Progenitores del mismo sexo con hijos.",
    "Familia reconstituida: Parejas donde uno o ambos miembros tienen hijos de relaciones anteriores (madrastras, padrastros).",
    "Familia sin hijos: Parejas sin descendencia.",
    "Familia adoptiva: Padres e hijos no biológicos.",
    "Familia de acogida: Acogen temporalmente a niños que no pueden estar con su familia de origen."
  ];

  return (
    <>
      <div className="w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">
                  
                <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-1">Identificación</h3>


                  <div className="mt-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dupla Profesional:</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center flex-grow">
                        <span className="mr-2 text-slate-700 whitespace-nowrap text-sm font-bold">Médico +</span>
                        <div className="flex-grow">
                          <UserAutocomplete
                            value={formData.duplaProfesionalOtroNombre || ''}
                            onSelect={handleSelectDuplaUser}
                            onChange={(val: any) => handleInputChange('duplaProfesionalOtroNombre', val)}
                            onClear={handleClearDuplaUser}
                            placeholder="Buscar o escribir nombre del profesional..."
                            disabled={formData.sinDupla}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mt-2 animate-fadeIn">
                        <div className={`flex-grow transition-opacity duration-300 ${formData.sinDupla ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                          <label htmlFor="duplaProfesional" className="block text-[10px] font-black text-sky-800 uppercase mb-1.5 tracking-widest leading-none">Profesión de la Dupla:</label>
                          <select
                            id="duplaProfesional"
                            name="duplaProfesional"
                            value={formData.duplaProfesional || ''}
                            onChange={handleChange as any}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                          >
                            <option value="">Seleccione profesión...</option>
                            {duplaProfesionalOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData.sinDupla ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                            <input
                              type="checkbox"
                              name="sinDupla"
                              checked={formData.sinDupla}
                              onChange={handleChange as any}
                              className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                            />
                            <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Sin dupla</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-4 mt-4">
                    <div className="flex-grow">
                      {renderRadioGroup("Estratificación", "estratificacion", [{ value: "G1", label: "G1" }, { value: "G2", label: "G2" }, { value: "G3", label: "G3" }])}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRiskCalculatorOpen(true)}
                      className="mb-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M12 4L4 20H20L12 4Z" />
                      </svg>
                      CALCULAR
                    </button>
                  </div>

                  {/* ===== CONTROLES ADICIONALES ===== */}
                  {(() => {
                    const additionalControlsItems = [
                      { key: 'incluirControlCardiovascular', label: 'Control cardiovascular' },
                      { key: 'incluirControlHipotiroidismo', label: 'Control hipotiroidismo' },
                      { key: 'incluirControlArtrosis', label: 'Control artrosis' },
                      { key: 'incluirControlEpilepsia', label: 'Control epilepsia' },
                      { key: 'incluirControlSalaEra', label: 'Control SALA ERA' },
                      { key: 'incluirControlSalaIra', label: 'Control SALA IRA' },
                      { key: 'incluirControlDemencias', label: 'Control demencias' },
                      { key: 'incluirControlSm', label: 'Control SM' },
                    ];
                    const cvSymptomsItems = [
                      {key:'cv_sintoma_ortopnea',label:'Ortopnea'},{key:'cv_sintoma_dpn',label:'DPN'},{key:'cv_sintoma_nicturia',label:'Nicturia'},
                      {key:'cv_sintoma_edema',label:'Edema en MM.II.'},{key:'cv_sintoma_angor',label:'Ángor'},{key:'cv_sintoma_palpitaciones',label:'Palpitaciones'},
                      {key:'cv_sintoma_polidipsia',label:'Polidipsia'},{key:'cv_sintoma_poliuria',label:'Poliuria'},{key:'cv_sintoma_polifagia',label:'Polifagia'},{key:'cv_sintoma_perdida_peso',label:'Pérdida de peso'},
                    ];
                    const eraSymptomsItems = [
                      {key:'era_sintoma_tos',label:'Tos con risa/ejercicio/frío'},{key:'era_sintoma_opresion',label:'Opresión torácica'},{key:'era_sintoma_rinorrea',label:'Rinorrea'},
                      {key:'era_sintoma_estornudos',label:'Estornudos en salva'},{key:'era_sintoma_prurito',label:'Prurito nasal/ocular'},{key:'era_sintoma_limitan',label:'Limitan actividades'},
                      {key:'era_sintoma_diarios',label:'Síntomas diarios'},{key:'era_sintoma_nocturnos',label:'Síntomas nocturnos'},{key:'era_sintoma_sbt_sos',label:'SBT SOS'},
                      {key:'era_sintoma_urgencias',label:'Consultas urgencias'},{key:'era_sintoma_corticoides',label:'Corticoides sistémicos'},
                    ];
                    const eraTriggersItems = [
                      {key:'era_desencadenante_mascotas',label:'Mascotas'},{key:'era_desencadenante_higiene',label:'Higiene de hogar'},{key:'era_desencadenante_alfombras',label:'Alfombras'},
                      {key:'era_desencadenante_tabaco_ambiental',label:'Tabaco ambiental'},{key:'era_desencadenante_cocina',label:'Cocina a leña/carbón'},{key:'era_desencadenante_calefaccion',label:'Calefacción'},
                    ];
                    const fd = formData as any;
                    return (
                      <div className="mt-2 border-t border-slate-200 pt-2">
                        <button type="button" onClick={() => setIsAdditionalControlsOpen(!isAdditionalControlsOpen)}
                          className="w-full flex justify-between items-center py-2 text-sm font-bold text-sky-800 uppercase tracking-tighter">
                          <span>Controles Adicionales</span>
                          <svg className={`h-5 w-5 transform transition-transform ${isAdditionalControlsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isAdditionalControlsOpen && (
                          <div className="mt-2 bg-white p-3 rounded-lg border border-sky-100 shadow-inner animate-fadeIn">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Marcar todos los controles que apliquen:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {additionalControlsItems.map(item => (
                                <label key={item.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm font-medium select-none ${fd[item.key] ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50/50'}`}>
                                  <input type="checkbox" name={item.key} checked={!!fd[item.key]} onChange={handleChange as any}
                                    className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0" />
                                  <span>{item.label}</span>
                                </label>
                              ))}
                            </div>

                            {/* Panel: Cardiovascular */}
                            {fd.incluirControlCardiovascular && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Cardiovasculares</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                  {cvSymptomsItems.map(item => (<div key={item.key} className="flex items-center gap-2 py-1"><input type="checkbox" id={`cv-ctrl-${item.key}`} name={item.key} checked={!!fd[item.key]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`cv-ctrl-${item.key}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label></div>))}
                                </div>
                              </div>
                            )}

                            {/* Panel: Hipotiroidismo */}
                            {fd.incluirControlHipotiroidismo && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Hipotiroidismo</h4>
                                <div>
                                  <p className="text-xs font-semibold text-slate-600 mb-2">Síntomas actuales:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                    {[{k:'hipo_sintoma_astenias',l:'Astenia/fatiga'},{k:'hipo_sintoma_somnolencia',l:'Somnolencia'},{k:'hipo_sintoma_constipacion',l:'Constipación'},{k:'hipo_sintoma_intolerancia_frio',l:'Intolerancia al frío'},{k:'hipo_sintoma_edema',l:'Edema (mixedema)'},{k:'hipo_sintoma_aumento_peso',l:'Aumento de peso'},{k:'hipo_sintoma_piel_seca',l:'Piel seca'},{k:'hipo_sintoma_caida_cabello',l:'Caída de cabello'},{k:'hipo_sintoma_calambres',l:'Calambres'}].map(item => (<div key={item.k} className="flex items-center gap-2 py-0.5"><input type="checkbox" id={`hipo-${item.k}`} name={item.k} checked={!!fd[item.k]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`hipo-${item.k}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.l}</label></div>))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="Fecha TSH" id="hipo_tsh_fecha" name="hipo_tsh_fecha" value={fd.hipo_tsh_fecha||''} onChange={handleChange as any} placeholder="DD-MM-AAAA" />
                                  <FormField label="TSH (resultado)" id="hipo_tsh_resultado" name="hipo_tsh_resultado" value={fd.hipo_tsh_resultado||''} onChange={handleChange as any} placeholder="ej. 4.5 mUI/L" />
                                  <FormField label="T4 libre" id="hipo_t4l_resultado" name="hipo_t4l_resultado" value={fd.hipo_t4l_resultado||''} onChange={handleChange as any} placeholder="ej. 1.2 ng/dL" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {renderRadioGroup("Adherencia Levotiroxina", "hipo_adherencia_levotiroxina", [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}], fd.hipo_adherencia_levotiroxina)}
                                  {renderRadioGroup("Ayuno correcto", "hipo_ayuno_correcto", [{value:'Sí',label:'Sí'},{value:'No',label:'No'}], fd.hipo_ayuno_correcto)}
                                  {renderRadioGroup("Fármacos interferentes", "hipo_farmacos_interferentes", [{value:'Niega',label:'Niega'},{value:'Sí',label:'Sí'}], fd.hipo_farmacos_interferentes)}
                                </div>
                                <AutoExpandingTextArea label="Observaciones" id="hipo_observaciones" name="hipo_observaciones" value={fd.hipo_observaciones||''} onChange={handleChange as any} placeholder="Observaciones hipotiroidismo..." />
                              </div>
                            )}

                            {/* Panel: Artrosis */}
                            {fd.incluirControlArtrosis && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Artrosis</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <AutoExpandingTextArea label="Articulaciones afectadas" id="art_articulaciones_afectadas" name="art_articulaciones_afectadas" value={fd.art_articulaciones_afectadas||''} onChange={handleChange as any} placeholder="ej. Rodillas bilaterales, cadera izquierda..." />
                                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Dolor (EVA 0-10):</label><div className="flex items-center gap-3"><input type="range" min="0" max="10" step="1" value={fd.art_dolor_eva||0} onChange={(e) => setFormData(prev => ({...prev, art_dolor_eva: e.target.value} as any))} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" /><span className="text-lg font-bold text-sky-700 w-6 text-center">{fd.art_dolor_eva||0}</span></div></div>
                                </div>
                                <AutoExpandingTextArea label="Limitación funcional" id="art_limitacion_funcional" name="art_limitacion_funcional" value={fd.art_limitacion_funcional||''} onChange={handleChange as any} placeholder="ej. Dificultad para subir escaleras..." />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {renderRadioGroup("Analgésicos", "art_uso_analgesicos", [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Ocasional',label:'Ocasional'}], fd.art_uso_analgesicos)}
                                  {renderRadioGroup("Kinesiterapia", "art_kinesiterapia", [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Derivado',label:'Derivado'}], fd.art_kinesiterapia)}
                                  {renderRadioGroup("Ayudas técnicas", "art_ayudas_tecnicas", [{value:'Sí',label:'Sí'},{value:'No',label:'No'}], fd.art_ayudas_tecnicas)}
                                </div>
                                {fd.art_uso_analgesicos === 'Sí' && (<FormField label="¿Cuáles analgésicos?" id="art_analgesicos_cuales" name="art_analgesicos_cuales" value={fd.art_analgesicos_cuales||''} onChange={handleChange as any} placeholder="ej. Paracetamol 1g..." />)}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><FormField label="Radiografía (fecha)" id="art_radiografia_fecha" name="art_radiografia_fecha" value={fd.art_radiografia_fecha||''} onChange={handleChange as any} placeholder="DD-MM-AAAA" /><div className="sm:col-span-2"><AutoExpandingTextArea label="Resultado radiografía" id="art_radiografia_resultado" name="art_radiografia_resultado" value={fd.art_radiografia_resultado||''} onChange={handleChange as any} placeholder="ej. Pinzamiento articular..." /></div></div>
                                <AutoExpandingTextArea label="Observaciones" id="art_observaciones" name="art_observaciones" value={fd.art_observaciones||''} onChange={handleChange as any} placeholder="Observaciones artrosis..." />
                              </div>
                            )}

                            {/* Panel: Epilepsia */}
                            {fd.incluirControlEpilepsia && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Epilepsia</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <AutoExpandingTextArea label="Tipo de crisis" id="epi_tipo_crisis" name="epi_tipo_crisis" value={fd.epi_tipo_crisis||''} onChange={handleChange as any} placeholder="ej. Crisis tónico-clónicas..." />
                                  <AutoExpandingTextArea label="Fármaco antiepiléptico" id="epi_farmaco_antiepiléptico" name="epi_farmaco_antiepiléptico" value={fd.epi_farmaco_antiepiléptico||''} onChange={handleChange as any} placeholder="ej. Ácido Valproico 500mg..." />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="Última crisis" id="epi_ultima_crisis_fecha" name="epi_ultima_crisis_fecha" value={fd.epi_ultima_crisis_fecha||''} onChange={handleChange as any} placeholder="DD-MM-AAAA" />
                                  <FormField label="Frecuencia" id="epi_frecuencia_crisis" name="epi_frecuencia_crisis" value={fd.epi_frecuencia_crisis||''} onChange={handleChange as any} placeholder="ej. Sin crisis en 6 meses" />
                                  {renderRadioGroup("Adherencia FAE", "epi_adherencia", [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}], fd.epi_adherencia)}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="Niveles plasmáticos (fecha)" id="epi_niveles_plasmaticos_fecha" name="epi_niveles_plasmaticos_fecha" value={fd.epi_niveles_plasmaticos_fecha||''} onChange={handleChange as any} placeholder="DD-MM-AAAA" />
                                  <FormField label="Niveles plasmáticos (resultado)" id="epi_niveles_plasmaticos_resultado" name="epi_niveles_plasmaticos_resultado" value={fd.epi_niveles_plasmaticos_resultado||''} onChange={handleChange as any} placeholder="ej. VPA 75 μg/mL" />
                                  {renderRadioGroup("Efectos secundarios", "epi_efectos_secundarios", [{value:'Niega',label:'Niega'},{value:'Sí',label:'Sí'}], fd.epi_efectos_secundarios)}
                                </div>
                                {renderRadioGroup("Restricción para conducir", "epi_restricciones_conduccion", [{value:'Sí, informado',label:'Sí, informado'},{value:'No aplica',label:'No aplica'}], fd.epi_restricciones_conduccion)}
                                <AutoExpandingTextArea label="Observaciones" id="epi_observaciones" name="epi_observaciones" value={fd.epi_observaciones||''} onChange={handleChange as any} placeholder="Observaciones epilepsia..." />
                              </div>
                            )}

                            {/* Panel: Sala ERA */}
                            {fd.incluirControlSalaEra && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Respiratorios (Sala ERA)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                  {eraSymptomsItems.map(item => (<div key={item.key} className="flex items-center gap-2 py-1"><input type="checkbox" id={`era-${item.key}`} name={item.key} checked={!!fd[item.key]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`era-${item.key}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label></div>))}
                                </div>
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mt-4 mb-3 tracking-widest border-b border-sky-100 pb-1">Desencadenantes Ambientales</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                  {eraTriggersItems.map(item => (<div key={item.key} className="flex items-center gap-2 py-1"><input type="checkbox" id={`era-t-${item.key}`} name={item.key} checked={!!fd[item.key]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`era-t-${item.key}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label></div>))}
                                </div>
                              </div>
                            )}

                            {/* Panel: Sala IRA */}
                            {fd.incluirControlSalaIra && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Sala IRA</h4>
                                <AutoExpandingTextArea label="Diagnóstico IRA" id="ira_diagnostico" name="ira_diagnostico" value={fd.ira_diagnostico||''} onChange={handleChange as any} placeholder="ej. Neumonía adquirida en la comunidad..." />
                                <div><p className="text-xs font-semibold text-slate-600 mb-2">Síntomas actuales:</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">{[{k:'ira_sintoma_tos',l:'Tos'},{k:'ira_sintoma_fiebre',l:'Fiebre'},{k:'ira_sintoma_rinorrea',l:'Rinorrea'},{k:'ira_sintoma_odinofagia',l:'Odinofagia'},{k:'ira_sintoma_disnea',l:'Disnea'}].map(item => (<div key={item.k} className="flex items-center gap-2 py-0.5"><input type="checkbox" id={`ira-${item.k}`} name={item.k} checked={!!fd[item.k]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`ira-${item.k}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.l}</label></div>))}</div></div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="Saturación O₂ (%)" id="ira_saturacion" name="ira_saturacion" value={fd.ira_saturacion||''} onChange={handleChange as any} placeholder="ej. 97" />
                                  <FormField label="FR (resp/min)" id="ira_fr" name="ira_fr" value={fd.ira_fr||''} onChange={handleChange as any} placeholder="ej. 18" />
                                  {renderRadioGroup("Broncodilatador", "ira_uso_broncodilatador", [{value:'Sí',label:'Sí'},{value:'No',label:'No'}], fd.ira_uso_broncodilatador)}
                                </div>
                                {fd.ira_uso_broncodilatador === 'Sí' && (<FormField label="¿Cuál broncodilatador?" id="ira_broncodilatador_cual" name="ira_broncodilatador_cual" value={fd.ira_broncodilatador_cual||''} onChange={handleChange as any} placeholder="ej. Salbutamol 100mcg..." />)}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {renderRadioGroup("Nebulización", "ira_nebulizacion", [{value:'Sí',label:'Sí'},{value:'No',label:'No'}], fd.ira_nebulizacion)}
                                  {renderRadioGroup("Rx Tórax", "ira_rx_torax", [{value:'Normal',label:'Normal'},{value:'Alterada',label:'Alterada'},{value:'No realizada',label:'No realizada'}], fd.ira_rx_torax)}
                                </div>
                                {fd.ira_rx_torax === 'Alterada' && (<AutoExpandingTextArea label="Resultado Rx Tórax" id="ira_rx_resultado" name="ira_rx_resultado" value={fd.ira_rx_resultado||''} onChange={handleChange as any} placeholder="Descripción del hallazgo radiológico..." />)}
                                <AutoExpandingTextArea label="Observaciones" id="ira_observaciones" name="ira_observaciones" value={fd.ira_observaciones||''} onChange={handleChange as any} placeholder="Observaciones IRA..." />
                              </div>
                            )}

                            {/* Panel: Demencias */}
                            {fd.incluirControlDemencias && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Demencias</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <AutoExpandingTextArea label="Diagnóstico" id="dem_diagnostico" name="dem_diagnostico" value={fd.dem_diagnostico||''} onChange={handleChange as any} placeholder="ej. Enfermedad de Alzheimer..." />
                                  {renderRadioGroup("Estadio", "dem_estadio", [{value:'Leve',label:'Leve'},{value:'Moderado',label:'Moderado'},{value:'Severo',label:'Severo'}], fd.dem_estadio)}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <FormField label="MMSE (fecha)" id="dem_mmse_fecha" name="dem_mmse_fecha" value={fd.dem_mmse_fecha||''} onChange={handleChange as any} placeholder="DD-MM-AAAA" />
                                  <FormField label="MMSE (puntaje /30)" id="dem_mmse_puntaje" name="dem_mmse_puntaje" value={fd.dem_mmse_puntaje||''} onChange={handleChange as any} placeholder="ej. 22/30" />
                                  <FormField label="Barthel (/100)" id="dem_barthel_puntaje" name="dem_barthel_puntaje" value={fd.dem_barthel_puntaje||''} onChange={handleChange as any} placeholder="ej. 85/100" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <FormField label="Cuidador principal" id="dem_cuidador_principal" name="dem_cuidador_principal" value={fd.dem_cuidador_principal||''} onChange={handleChange as any} placeholder="ej. Hija, cónyuge..." />
                                  {renderRadioGroup("Sobrecarga cuidador", "dem_sobrecarga_cuidador", [{value:'No',label:'No'},{value:'Leve',label:'Leve'},{value:'Severa',label:'Severa'}], fd.dem_sobrecarga_cuidador)}
                                </div>
                                <div><p className="text-xs font-semibold text-slate-600 mb-2">Síntomas conductuales y funcionales:</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">{[{k:'dem_sintoma_deambulacion',l:'Alt. deambulación'},{k:'dem_sintoma_alimentacion',l:'Alt. alimentación'},{k:'dem_sintoma_continencia',l:'Incontinencia'},{k:'dem_sintoma_conductas',l:'Conductas disruptivas'},{k:'dem_sintoma_agitacion',l:'Agitación'}].map(item => (<div key={item.k} className="flex items-center gap-2 py-0.5"><input type="checkbox" id={`dem-${item.k}`} name={item.k} checked={!!fd[item.k]} onChange={handleChange as any} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded" /><label htmlFor={`dem-${item.k}`} className="text-xs font-medium text-slate-700 cursor-pointer">{item.l}</label></div>))}</div></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <FormField label="Fármaco antidemencia" id="dem_farmaco_antidemencia" name="dem_farmaco_antidemencia" value={fd.dem_farmaco_antidemencia||''} onChange={handleChange as any} placeholder="ej. Donepezilo 10mg..." />
                                  {renderRadioGroup("Adherencia FAD", "dem_adherencia", [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}], fd.dem_adherencia)}
                                </div>
                                {renderRadioGroup("Derivación especialidad", "dem_derivacion_especialidad", [{value:'No',label:'No'},{value:'Neurología',label:'Neurología'},{value:'Psiquiatría',label:'Psiquiatría'},{value:'Geriatría',label:'Geriatría'}], fd.dem_derivacion_especialidad)}
                                <AutoExpandingTextArea label="Observaciones" id="dem_observaciones" name="dem_observaciones" value={fd.dem_observaciones||''} onChange={handleChange as any} placeholder="Observaciones demencias..." />
                              </div>
                            )}

                            {/* Panel: SM */}
                            {fd.incluirControlSm && (
                              <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Salud Mental</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <AutoExpandingTextArea label="Ánimo" id="sm_sintoma_animo" name="sm_sintoma_animo" value={fd.sm_sintoma_animo||''} onChange={handleChange as any} />
                                  <AutoExpandingTextArea label="Síntomas ansiosos" id="sm_sintoma_ansiosos" name="sm_sintoma_ansiosos" value={fd.sm_sintoma_ansiosos||''} onChange={handleChange as any} />
                                  <AutoExpandingTextArea label="Somatizaciones" id="sm_sintoma_somatizaciones" name="sm_sintoma_somatizaciones" value={fd.sm_sintoma_somatizaciones||''} onChange={handleChange as any} />
                                  <AutoExpandingTextArea label="Alteraciones del sueño" id="sm_sintoma_sueno" name="sm_sintoma_sueno" value={fd.sm_sintoma_sueno||''} onChange={handleChange as any} />
                                  <AutoExpandingTextArea label="Síntomas psicóticos" id="sm_sintoma_psicoticos" name="sm_sintoma_psicoticos" value={fd.sm_sintoma_psicoticos||''} onChange={handleChange as any} />
                                  <AutoExpandingTextArea label="Ideación suicida" id="sm_sintoma_suicidio" name="sm_sintoma_suicidio" value={fd.sm_sintoma_suicidio||''} onChange={handleChange as any} />
                                </div>
                                <h4 className="text-[10px] font-black text-sky-800 uppercase mt-2 mb-3 tracking-widest border-b border-sky-100 pb-1">Examen Mental</h4>
                                <AutoExpandingTextArea label="Descripción inicial" id="sm_em_descripcion" name="sm_em_descripcion" value={fd.sm_em_descripcion||''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Conciencia/orientación/memoria" id="sm_em_conciencia" name="sm_em_conciencia" value={fd.sm_em_conciencia||''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Lenguaje" id="sm_em_lenguaje" name="sm_em_lenguaje" value={fd.sm_em_lenguaje||''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Psicomotricidad" id="sm_em_psicomotricidad" name="sm_em_psicomotricidad" value={fd.sm_em_psicomotricidad||''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Juicio de realidad" id="sm_em_juicio" name="sm_em_juicio" value={fd.sm_em_juicio||''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Insight" id="sm_em_insight" name="sm_em_insight" value={fd.sm_em_insight||''} onChange={handleChange as any} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </section>

                <section id="sec-evaluacion-ultimo-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Evaluación desde último control</h3>
                  <FormField label="Estado de salud" id="estadoSaludDesdeUltimoControl" name="estadoSaludDesdeUltimoControl" value={formData.estadoSaludDesdeUltimoControl} onChange={handleChange as any} isTextArea rows={2} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {renderRadioGroup("¿Hubo cambios en su dinámica familiar?", "cambiosDinamicaFamiliar", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {formData.cambiosDinamicaFamiliar === 'Sí' && (
                        <FormField label="Aclaración:" id="cambiosDinamicaFamiliarAclaracion" name="cambiosDinamicaFamiliarAclaracion" value={formData.cambiosDinamicaFamiliarAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" placeholder="¿Qué cambios hubo?" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Tuvo controles extrasistema?", "controlesExtrasistema", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {formData.controlesExtrasistema === 'Sí' && (
                        <FormField label="Aclaración:" id="controlesExtrasistemaAclaracion" name="controlesExtrasistemaAclaracion" value={formData.controlesExtrasistemaAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" placeholder="¿En qué especialidad o prestación?" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Sufrió RAM a medicamentos?", "ram", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {formData.ram === 'Sí' && (
                        <FormField label="Aclaración:" id="ramAclaracion" name="ramAclaracion" value={formData.ramAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" placeholder="¿Qué fármaco y qué reacción?" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Requiere educación sobre fármacos?", "requiereEducacionFarmacos", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {formData.requiereEducacionFarmacos === 'Sí' && (
                        <FormField label="Aclaración:" id="requiereEducacionFarmacosAclaracion" name="requiereEducacionFarmacosAclaracion" value={formData.requiereEducacionFarmacosAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" placeholder="¿Sobre qué fármaco o tema?" />
                      )}
                    </div>
                  </div>
                </section>

                <section id="sec-plan-metas-anteriores" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Plan y metas anteriores</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {formData.objetivosAnteriores.map((obj, idx) => (
                      <div key={idx} className="p-4 bg-white border border-sky-100 rounded-2xl shadow-sm relative animate-fadeIn flex flex-col gap-4 h-full">
                        <button
                          type="button"
                          onClick={() => handleRemoveObjetivoAnterior(idx)}
                          className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h5 className="text-[10px] font-black text-sky-600 bg-sky-50 px-2.5 py-1 inline-block rounded-full uppercase tracking-widest self-start">OBJETIVO #{idx + 1}</h5>

                        <div className="flex-grow flex flex-col">
                          <AutoExpandingTextArea label="Objetivo" id={`ant-objetivo-${idx}`} name={`ant-objetivo-${idx}`} value={obj.objetivo || ''} onChange={(e) => handleUpdateObjetivoAnterior(idx, 'objetivo', e.target.value)} containerClassName="flex-grow min-h-full" />
                        </div>

                        <div className="mt-2 pt-4 border-t border-slate-100">
                          {renderRadioGroup(`¿Cumplió el objetivo?`, `cumplio_${idx}`, [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }], obj.cumplio, (val) => handleUpdateObjetivoAnterior(idx, 'cumplio', val))}
                          {(obj.cumplio === 'Sí' || obj.cumplio === 'No') && (
                            <AutoExpandingTextArea label={obj.cumplio === 'Sí' ? "Aclaración cumplimiento" : "Aclaración no cumplimiento"} id={`acl-ant-meta-${idx}`} name={`acl-ant-meta-${idx}`} value={obj.aclaracionNoCumplimiento} onChange={(e) => handleUpdateObjetivoAnterior(idx, 'aclaracionNoCumplimiento', e.target.value)} containerClassName="flex-grow min-h-full mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={handleAddObjetivoAnterior}
                      className="inline-flex items-center px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-full hover:bg-sky-100 transition-colors uppercase tracking-widest"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Añadir otro objetivo anterior
                    </button>
                  </div>
                </section>

                <section id="sec-atenciones" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Atenciones Vigentes</h3>
                  {[
                    { label: "EMPAM", name: "empam", placeholder: "Escribe @ para seleccionar estado (NORMAL, ALTERADO, NO VIGENTE)...", options: empamSmartOptions },
                    { label: "Fondo de ojo", name: "fondoOjo", placeholder: "Escribe @ para seleccionar estado (NORMAL, ALTERADO, NO VIGENTE)...", options: fondoOjoSmartOptions },
                    { label: "Podólogo", name: "podologo", placeholder: "Escribe @ para seleccionar estado (NORMAL, ALTERADO, NO VIGENTE)...", options: podologoSmartOptions },
                    { label: "Evaluación de pie", name: "evaluacionPie", placeholder: "Escribe @ para seleccionar estado (NORMAL, ALTERADO, NO VIGENTE)...", options: evaluacionPieSmartOptions },
                  ].map(field => (
                    <div className="flex items-start gap-2" key={field.name}>
                      <div className="flex-grow min-w-0">
                        <SmartAtencionVigenteInput
                          label={field.label}
                          id={field.name}
                          name={field.name}
                          value={(formData[field.name as keyof FichaControlEcicepFormData] as string) || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                          placeholder={field.placeholder}
                          disabled={formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.'}
                          options={field.options}
                        />
                      </div>
                      <div className="flex-shrink-0 self-start mt-[26px]">
                        <button
                          type="button"
                          onClick={() => {
                            const isNA = formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.';
                            setFormData(prev => ({ ...prev, [field.name]: isNA ? '' : 'No aplica.' }));
                          }}
                          className={`flex flex-col items-center justify-center gap-0.5 w-10 h-[60px] rounded-lg border transition-colors select-none ${formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.' ? 'bg-sky-500 border-sky-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:border-sky-300 hover:text-sky-500'}`}
                        >
                          <span className="text-[9px] font-black uppercase leading-none">N/A</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.sexo === 'Masculino' && (
                    <FormField label="PSA" id="atencionesPsa" name="atencionesPsa" value={formData.atencionesPsa || ''} onChange={handleChange as any} placeholder="Resultado o fecha" />
                  )}
                  <FormField label="Vacunas" id="vacunas" name="vacunas" value={formData.vacunas || ''} onChange={handleChange as any} />
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de control anterior</label>
                    <input
                      type="text"
                      placeholder="DD-MM-AAAA"
                      maxLength={10}
                      value={formData.fechaControlAnterior || ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 8) val = val.slice(0, 8);
                        let formatted = val;
                        if (val.length > 2) formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
                        if (val.length > 4) formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
                        handleInputChange('fechaControlAnterior', formatted);
                      }}
                      className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                    />
                  </div>
                  <FormField label="Registro de control anterior" id="ingresoControlAnterior" name="ingresoControlAnterior" value={formData.ingresoControlAnterior} onChange={handleChange as any} isTextArea rows={4} placeholder="Pega aquí el texto del control anterior..." />
                </section>

                <section id="sec-estudios-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-sky-700">Estudios Recientes (Lab, EKG, Imágenes)</h3>
                  </div>

                  <div className="mb-2">
                    <h4 className="text-md font-medium text-slate-600">Laboratorio</h4>
                    <input type="file" ref={labFileRef} onChange={handleLabFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {labError && <p className="text-red-500 text-xs mb-2">{labError}</p>}
                  <DateField label="Fecha Examen Laboratorio" id="fechaExamenLaboratorio" name="fechaExamenLaboratorio" value={formData.fechaExamenLaboratorio} onChange={handleChange as any} containerClassName="mb-2" />
                  <FormField label="" id="resultadosLaboratorio" name="resultadosLaboratorio" value={formData.resultadosLaboratorio} onChange={handleChange as any} isTextArea rows={3} placeholder="Resultados del último laboratorio..." />

                  <div className="mt-6 mb-2">
                    <h4 className="text-md font-medium text-slate-600">EKG</h4>
                    <input type="file" ref={ekgFileRef} onChange={handleEkgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {ekgError && <p className="text-red-500 text-xs mt-1 mb-2">{ekgError}</p>}
                  <DateField label="Fecha EKG" id="ekgFecha" name="ekgFecha" value={formData.ekgFecha} onChange={handleChange as any} containerClassName="mb-2" />
                  <FormField label="" id="ekgResultados" name="ekgResultados" value={formData.ekgResultados} onChange={handleChange as any} isTextArea rows={2} />

                  <div className="mt-6 mb-2">
                    <h4 className="text-md font-medium text-slate-600">Estudios de imágenes</h4>
                    <input type="file" id="img-upload-control" ref={imgFileRef} onChange={handleImgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {imgError && <p className="text-red-500 text-xs mt-1 mb-2">{imgError}</p>}
                  <DateField label="Fecha Imágenes" id="otrasImagenesFecha" name="otrasImagenesFecha" value={formData.otrasImagenesFecha} onChange={handleChange as any} containerClassName="mb-2" />
                  <FormField label="" id="otrasImagenesResultados" name="otrasImagenesResultados" value={formData.otrasImagenesResultados} onChange={handleChange as any} isTextArea rows={2} />
                </section>

                <section id="sec-examen-fisico-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Físico</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange as any} type="number" step="0.1" />
                    <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange as any} type="number" />
                    <FormField label="IMC (kg/m²)" id="imc" name="imc" value={formData.imc} onChange={() => { }} readOnly disabled />
                    <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa} onChange={handleChange as any} />
                    <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc} onChange={handleChange as any} type="number" />
                    <FormField label="CC (cm)" id="cc" name="cc" value={formData.cc} onChange={handleChange as any} type="number" />
                  </div>
                  <FormField label="Examen Físico General/Segmentario" id="examenFisicoGeneralSegmentario" name="examenFisicoGeneralSegmentario" value={formData.examenFisicoGeneralSegmentario} onChange={handleChange as any} isTextArea rows={10} containerClassName="mt-4" />
                </section>

                <section id="sec-valoracion-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Valoración integral</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="integralIndividual" className="block text-sm font-medium text-slate-700 mb-1.5">Ciclo vital individual:</label>
                      <select
                        id="integralIndividual"
                        name="integralIndividual"
                        value={formData.integralIndividual || ''}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700 outline-none"
                      >
                        <option value="">Seleccione...</option>
                        {cicloVitalIndividualOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="integralFamiliar" className="block text-sm font-medium text-slate-700 mb-1.5">Ciclo vital familiar:</label>
                      <select
                        id="integralFamiliar"
                        name="integralFamiliar"
                        value={formData.integralFamiliar || ''}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700 outline-none"
                      >
                        <option value="">Seleccione...</option>
                        {cicloVitalFamiliarOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="integralTipologia" className="block text-sm font-medium text-slate-700 mb-1.5">Tipología familiar:</label>
                      <select
                        id="integralTipologia"
                        name="integralTipologia"
                        value={formData.integralTipologia || ''}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700 outline-none"
                      >
                        <option value="">Seleccione...</option>
                        {tipologiaFamiliarOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <AutoExpandingTextArea label="Condiciones crónicas y problemáticas" id="integralCronicas" name="integralCronicas" value={formData.integralCronicas || ''} onChange={handleChange as any} />
                  </div>
                </section>

                <section id="sec-plan-cuidado-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS</h3>

                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-3 uppercase text-sm tracking-wider">PROBLEMAS VISUALIZADOS</h4>
                    <div className="space-y-3">
                      <AutoExpandingTextArea label="Persona y familia" id="pccPersonaFamilia" name="pccPersonaFamilia" value={formData.pccPersonaFamilia || ''} onChange={handleChange as any} />
                      <AutoExpandingTextArea label="Equipo de salud" id="pccEquipoSalud" name="pccEquipoSalud" value={formData.pccEquipoSalud || ''} onChange={handleChange as any} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-3 uppercase text-sm tracking-wider">PRIORIZACIÓN DE PROBLEMAS</h4>
                    <AutoExpandingTextArea
                      label=""
                      id="tomaDecisionesCompartidas"
                      name="tomaDecisionesCompartidas"
                      value={formData.tomaDecisionesCompartidas || ''}
                      onChange={handleChange as any}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const value = textarea.value;

                          // Count existing lines to determine next number
                          const lines = value.split('\n');
                          const nextNumber = lines.length + 1;

                          const newValue = value.substring(0, start) + '\n' + nextNumber + '. ' + value.substring(end);

                          setFormData(prev => ({ ...prev, tomaDecisionesCompartidas: newValue }));

                          // Set cursor position after update
                          setTimeout(() => {
                            const newPos = start + String(nextNumber).length + 3;
                            textarea.setSelectionRange(newPos, newPos);
                          }, 0);
                        }
                      }}
                      placeholder="¿Cómo lo haremos?"
                    />
                  </div>

                  <div className="mb-6">
                    <h4 className="text-md font-bold text-slate-800 mb-3 uppercase text-sm tracking-wider">OPCIONES CONVERSADAS (AGREGAR ACTIVOS COMUNITARIOS)</h4>
                    <AutoExpandingTextArea
                      label=""
                      id="opcionesConversadas"
                      name="opcionesConversadas"
                      value={formData.opcionesConversadas || ''}
                      onChange={handleChange as any}
                      placeholder="Opciones conversadas..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-bold text-slate-800 uppercase text-sm tracking-wider">PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS</h4>
                      <div className="flex gap-2">
                        <div className="relative" ref={predefinedPlanRef}>
                          <button
                            type="button"
                            onClick={() => setIsPredefinedPlanOpen(!isPredefinedPlanOpen)}
                            className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            AGREGAR PLAN PREDETERMINADO
                          </button>
                          {isPredefinedPlanOpen && (
                            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                              <div className="p-3 bg-slate-100 border-b border-slate-200">
                                <input
                                  type="text"
                                  value={planSearchTerm}
                                  onChange={(e) => setPlanSearchTerm(e.target.value)}
                                  placeholder="Buscar plan..."
                                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                              </div>
                              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {filteredPredefinedPlans.map((plan, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddPredefinedPlan(plan)}
                                    className="w-full text-left px-4 py-3 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-slate-50 last:border-b-0 transition-colors"
                                  >
                                    <span className="font-bold block leading-tight">{plan.acuerdo}</span>
                                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">{plan.acciones}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPccObjetivo}
                          className="flex items-center px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-md hover:bg-sky-700 transition-colors shadow-sm"
                        >
                          AGREGAR OBJETIVO
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {(formData.pccObjetivos || []).map((obj, index) => (
                        <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-lg shadow-sm relative animate-fadeIn h-full">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pccObjetivos: (prev.pccObjetivos || []).filter((_, i) => i !== index) }))}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <h5 className="text-[10px] font-bold text-sky-800 mb-4 bg-sky-50 px-2 py-1 inline-block rounded uppercase tracking-widest">OBJETIVO/META #${index + 1}</h5>
                          <div className="space-y-4 flex-grow flex flex-col">
                            <AutoExpandingTextArea label="Objetivo" id={`obj-objetivo-${index}`} name={`obj-objetivo-${index}`} value={obj.objetivo || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'objetivo', e.target.value)} containerClassName="flex-grow min-h-full" />
                            <AutoExpandingTextArea label="Acuerdo" id={`obj-acuerdo-${index}`} name={`obj-acuerdo-${index}`} value={obj.acuerdo} onChange={(e) => handleUpdatePccObjetivo(index, 'acuerdo', e.target.value)} containerClassName="flex-grow min-h-full" />
                            <AutoExpandingTextArea label="Acciones específicas" id={`obj-acciones-${index}`} name={`obj-acciones-${index}`} value={obj.acciones} onChange={(e) => handleUpdatePccObjetivo(index, 'acciones', e.target.value)} containerClassName="flex-grow min-h-full" />
                            <AutoExpandingTextArea label="Plazo" id={`obj-plazo-${index}`} name={`obj-plazo-${index}`} value={obj.plazo} onChange={(e) => handleUpdatePccObjetivo(index, 'plazo', e.target.value)} containerClassName="flex-grow min-h-full" />
                            <AutoExpandingTextArea label="Responsable/s" id={`obj-resp-${index}`} name={`obj-resp-${index}`} value={obj.responsables} onChange={(e) => handleUpdatePccObjetivo(index, 'responsables', e.target.value)} containerClassName="flex-grow min-h-full" />
                            <AutoExpandingTextArea label="Seguimiento" id={`obj-seguimiento-${index}`} name={`obj-seguimiento-${index}`} value={obj.seguimiento || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'seguimiento', e.target.value)} containerClassName="flex-grow min-h-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    {renderRadioGroup("¿Está de acuerdo con el plan elaborado?", "acuerdoPlanEquipo", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                    {renderRadioGroup("¿Está de acuerdo con contacto para seguimiento?", "acuerdoContactoSeguimiento", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                  </div>
                </section>

                <section id="sec-proximo-control-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-2 text-sky-700 border-b border-sky-200 pb-2">Próximo Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="planProximoControlTiempo" className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                      <select
                        id="planProximoControlTiempo"
                        name="planProximoControlTiempo"
                        value={formData.planProximoControlTiempo}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 text-sm font-medium animate-fadeIn outline-none"
                      >
                        <option value="">Seleccione...</option>
                        {tiempoControlOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="planProximoControlDupla" className="block text-sm font-medium text-slate-700 mb-1.5">Dupla para próximo control</label>
                      <select
                        id="planProximoControlDupla"
                        name="planProximoControlDupla"
                        value={formData.planProximoControlDupla}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 text-sm font-medium animate-fadeIn outline-none"
                      >
                        {duplaProfesionalOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section id="sec-indicaciones-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-2 text-sky-700 border-b border-sky-200 pb-2">Indicaciones Adicionales</h3>
                  <FormField label="" id="indicaciones" name="indicaciones" value={formData.indicaciones || ''} onChange={handleChange as any} isTextArea rows={4} placeholder="Ingrese indicaciones adicionales o detalles del plan aquí..." />
                </section>
              </form>
          </div>

          {/* Columna Derecha: Marco Blanco con tarjeta #F8FAFC + Botones sin negrita alineados */}
          <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
            {/* Tarjeta de Resumen */}
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
                <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                {/* Bloque Anamnesis */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                    <CopyButton textToCopy={anamnesisText} />
                  </div>
                  <textarea
                    value={anamnesisText}
                    onChange={(e) => setAnamnesisText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Anamnesis - editable"
                  />
                </div>
                {/* Bloque Exploración */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                    <CopyButton textToCopy={exploracionText} />
                  </div>
                  <textarea
                    value={exploracionText}
                    onChange={(e) => setExploracionText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Exploración - editable"
                  />
                </div>
                {/* Bloque Actuación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                    <CopyButton textToCopy={actuacionText} />
                  </div>
                  <textarea
                    value={actuacionText}
                    onChange={(e) => setActuacionText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Actuación - editable"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción: RESUMEN PDF, EDITAR DRIVE, BORRAR TODO (fuente text-[11px]) */}
            <div className="grid grid-cols-3 gap-1.5 w-full shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!loggedInUser) {
                    alert('Error: Usuario no identificado.');
                    return;
                  }
                  generateEcicepResumenPdf(formData as any, loggedInUser);
                }}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Imprimir PDF Resumen ECICEP"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">RESUMEN PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDriveEdit}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Abrir Planilla Drive ECICEP"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">EDITAR DRIVE</span>
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
      <PHQ9Modal
        isOpen={isPhq9ModalOpen}
        onClose={() => setIsPhq9ModalOpen(false)}
        formData={formData}
        handleRadioChange={handleRadioChange as any}
      />
      <EcicepRiskCalculatorModal
        isOpen={isRiskCalculatorOpen}
        onClose={() => setIsRiskCalculatorOpen(false)}
        onCalculate={(result) => setFormData(prev => ({ ...prev, estratificacion: result }))}
      />
    </>
  );
};

export default FichaControlEcicepNuevo;
