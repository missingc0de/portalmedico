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
const todayFormatted = `${dd}-${mm}-${yyyy}`;

const initialFormData: FichaControlEcicepFormData = {
  fechaControlActual: todayFormatted,
  fechaControlAnterior: '',
  ingresoControlAnterior: '',
  estadoSaludDesdeUltimoControl: '',
  cambiosDinamicaFamiliar: '',
  cambiosDinamicaFamiliarAclaracion: '',
  controlesExtrasistema: '',
  controlesExtrasistemaAclaracion: '',
  ram: '',
  ramAclaracion: '',
  requiereEducacionFarmacos: '',
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
    if (fechaControlProp && !formData.fechaControlActual) {
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
    anamnesis += `¿Hubo cambios en su dinámica familiar? ${formData.cambiosDinamicaFamiliar || '(No seleccionado)'}${formData.cambiosDinamicaFamiliar ? ` - Aclaración: ${formData.cambiosDinamicaFamiliarAclaracion || '(Sin aclarar)'}` : ''}\n`;
    anamnesis += `¿Tuvo controles extrasistema? ${formData.controlesExtrasistema || '(No seleccionado)'}${formData.controlesExtrasistema ? ` - Aclaración: ${formData.controlesExtrasistemaAclaracion || '(Sin aclarar)'}` : ''}\n`;
    anamnesis += `¿Sufrió RAM a medicamentos? ${formData.ram || '(No seleccionado)'}${formData.ram ? ` - Aclaración: ${formData.ramAclaracion || '(Sin aclarar)'}` : ''}\n`;
    anamnesis += `¿Requiere educación sobre fármacos? ${formData.requiereEducacionFarmacos || '(No seleccionado)'}${formData.requiereEducacionFarmacos ? ` - Aclaración: ${formData.requiereEducacionFarmacosAclaracion || '(Sin aclarar)'}` : ''}\n\n`;

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
    anamnesis += `EMPAM: ${formData.empam || '(No ingresado)'}\n`;
    anamnesis += `Fondo de ojo: ${formData.fondoOjo || '(No ingresado)'}\n`;
    anamnesis += `Podología: ${formData.podologo || '(No ingresado)'}\n`;
    anamnesis += `Evaluación de pie: ${formData.evaluacionPie || '(No ingresado)'}\n`;
    if (formData.sexo === 'Masculino') {
      anamnesis += `PSA: ${formData.atencionesPsa || '(No ingresado)'}\n`;
    }
    anamnesis += `Vacunas: ${formData.vacunas || '(No ingresado)'}\n\n`;

    anamnesis += `REGISTRO DE CONTROL ANTERIOR: \n${formData.ingresoControlAnterior || '(No ingresado)'}\n\n`;

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
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                  
                <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>

                  <DateField
                    label="Fecha de Control"
                    id="fechaControlActual"
                    name="fechaControlActual"
                    value={formData.fechaControlActual}
                    onChange={handleChange as any}
                    containerClassName="mb-4"
                  />

                  <div className="mt-4">
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
                </section>

                <section id="sec-evaluacion-ultimo-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Evaluación desde último control</h3>
                  <FormField label="Estado de salud" id="estadoSaludDesdeUltimoControl" name="estadoSaludDesdeUltimoControl" value={formData.estadoSaludDesdeUltimoControl} onChange={handleChange as any} isTextArea rows={2} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {renderRadioGroup("¿Hubo cambios en su dinámica familiar?", "cambiosDinamicaFamiliar", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {(formData.cambiosDinamicaFamiliar === 'Sí' || formData.cambiosDinamicaFamiliar === 'No') && (
                        <FormField label="Aclaración:" id="cambiosDinamicaFamiliarAclaracion" name="cambiosDinamicaFamiliarAclaracion" value={formData.cambiosDinamicaFamiliarAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Tuvo controles extrasistema?", "controlesExtrasistema", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {(formData.controlesExtrasistema === 'Sí' || formData.controlesExtrasistema === 'No') && (
                        <FormField label="Aclaración:" id="controlesExtrasistemaAclaracion" name="controlesExtrasistemaAclaracion" value={formData.controlesExtrasistemaAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Sufrió RAM a medicamentos?", "ram", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {(formData.ram === 'Sí' || formData.ram === 'No') && (
                        <FormField label="Aclaración:" id="ramAclaracion" name="ramAclaracion" value={formData.ramAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" />
                      )}
                    </div>
                    <div>
                      {renderRadioGroup("¿Requiere educación sobre fármacos?", "requiereEducacionFarmacos", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {(formData.requiereEducacionFarmacos === 'Sí' || formData.requiereEducacionFarmacos === 'No') && (
                        <FormField label="Aclaración:" id="requiereEducacionFarmacosAclaracion" name="requiereEducacionFarmacosAclaracion" value={formData.requiereEducacionFarmacosAclaracion} onChange={handleChange as any} isTextArea rows={1} containerClassName="-mt-2 mb-4" />
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

                <section id="sec-atenciones-vigentes" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Atenciones Vigentes</h3>
                  {[
                    { label: "EMPAM", name: "empam", placeholder: "Resultado o fecha EMPAM" },
                    { label: "Fondo de ojo", name: "fondoOjo", placeholder: "Resultado o fecha" },
                    { label: "Podólogo", name: "podologo", placeholder: "Última atención o indicación" },
                    { label: "Evaluación de pie", name: "evaluacionPie", placeholder: "Resultado o fecha" },
                  ].map(field => (
                    <div className="flex items-end gap-3" key={field.name}>
                      <div className="flex-grow">
                        <FormField
                          label={field.label}
                          id={field.name}
                          name={field.name}
                          value={(formData[field.name as keyof FichaControlEcicepFormData] as string) || ''}
                          onChange={handleChange as any}
                          placeholder={field.placeholder}
                          disabled={formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.'}
                          inputClassName="font-medium !h-[42px]"
                        />
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            checked={formData[field.name as keyof FichaControlEcicepFormData] === 'No aplica.'}
                            onChange={(e) => {
                              const val = e.target.checked ? 'No aplica.' : '';
                              setFormData(prev => ({ ...prev, [field.name]: val }));
                            }}
                            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                          />
                          <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">No aplica</span>
                        </label>
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
                  generateClinicalRecordPdf({ title: 'Ficha Clínica: Control ECICEP', content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}` }, loggedInUser);
                }}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Imprimir PDF Resumen ECICEP"
              >
                <span className="truncate">RESUMEN PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDriveEdit}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Abrir Planilla Drive ECICEP"
              >
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
