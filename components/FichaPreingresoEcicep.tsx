import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FichaPreingresoEcicepFormData, User, FormStatus } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import EcicepRiskCalculatorModal from './EcicepRiskCalculatorModal';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import ImportModal from './ImportModal';
import CopyButton from './CopyButton';
import PHQ9Modal from './PHQ9Modal';
import RutInput from './RutInput';
import UserAutocomplete from './UserAutocomplete';
import { AlertTriangle, X, Printer, ExternalLink, PlusCircle, FileText, CheckSquare } from 'lucide-react';
import SmartAtencionVigenteInput, { SmartAtencionOption } from './SmartAtencionVigenteInput';
import SmartDietaTextarea from './SmartDietaTextarea';

const initialIndicaciones = `- Se solicitan exámenes.
- Se renueva su receta crónica.
- Traer exámenes extrasistema y documentos importantes.
- Traer medicamentos (para verificar).
- Se gestiona hora con dupla acorde a necesidades del usuario.
- En caso de no disponer de exámenes y/o estudios, indicar que retire órdenes en su sector.`;

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
    description: 'No realizado o fuera del período de vigencia establecido. Se deriva.'
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
    description: 'Fondo de ojo no realizado o fuera del período de vigencia establecido. Se deriva.'
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

const escolaridadOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Enseñanza básica incompleta.', label: 'Enseñanza básica incompleta.' },
  { value: 'Enseñanza básica completa.', label: 'Enseñanza básica completa.' },
  { value: 'Enseñanza media incompleta.', label: 'Enseñanza media incompleta.' },
  { value: 'Enseñanza media completa.', label: 'Enseñanza media completa.' },
  { value: 'Educación superior.', label: 'Educación superior.' },
];

const ocupacionOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Trabajador dependiente.', label: 'Trabajador dependiente.' },
  { value: 'Trabajador independiente.', label: 'Trabajador independiente.' },
  { value: 'Cesante.', label: 'Cesante.' },
  { value: 'Jubilado.', label: 'Jubilado.' },
];

const espiritualidadOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Ateo/agnóstico.', label: 'Ateo/agnóstico.' },
  { value: 'Cristiano.', label: 'Cristiano.' },
  { value: 'Católico.', label: 'Católico.' },
  { value: 'Evangélico.', label: 'Evangélico.' },
  { value: 'Mormón.', label: 'Mormón.' },
  { value: 'Testigo de Jehová.', label: 'Testigo de Jehová.' },
  { value: 'Otra', label: 'Otra' },
];

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

const FACTORES_RIESGO_OPTIONS = [
  "Crisis no normativas",
  "Cesantía jefe de hogar o sostenedor",
  "VIF",
  "Embarazo de riesgo",
  "Consumo OH - Drogas",
  "Conductas delictuales",
  "Deficiencia vivienda y/o hacinamiento",
  "Patología o Trastorno psiquiatrico",
  "Mal nutrición",
  "Discapacidad - dependencia (desmovilizado)",
  "Enfermedad crónica descompensada",
  "Hospitalizaciones frecuentes",
  "Disfunción familiar",
  "Familia monoparental",
  "Abandono, aislamiento o situación de calle",
  "Bajo nivel socio cultural",
  "Abuso sexual y/o violación",
  "Otras situaciones de riesgo",
];

const habitosCheckboxConfig = [
  { keyBase: 'alcohol', label: 'Alcohol' },
  { keyBase: 'tabaco', label: 'Tabaco' },
  { keyBase: 'drogas', label: 'Drogas' },
];

const actividadFisicaOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Sedentario.', label: 'Sedentario.' },
  { value: 'Actividad física ligera (1-2 veces/semana).', label: 'Actividad física ligera (1-2 veces/semana).' },
  { value: 'Actividad física moderada (3-4 veces/semana).', label: 'Actividad física moderada (3-4 veces/semana).' },
  { value: 'Actividad física intensa (5+ veces/semana).', label: 'Actividad física intensa (5+ veces/semana).' },
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
  "Familia extensa: Incluye a otros parientes (abuelos, tíos) que conviven con el núcleo familiar.",
  "Familia monoparental: Formada por un solo progenitor (padre o madre) con sus hijos.",
  "Familia homoparental: Progenitores del mismo sexo con hijos.",
  "Familia reconstituida: Parejas donde uno o ambos miembros tienen hijos de relaciones anteriores (madrastras, padrastros).",
  "Familia sin hijos: Parejas sin descendencia.",
  "Familia adoptiva: Padres e hijos no biológicos.",
  "Familia de acogida: Acogen temporalmente a niños que no pueden estar con su familia de origen."
];

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

const initialFormData: FichaPreingresoEcicepFormData = {
  fechaIngreso: new Date().toISOString().split('T')[0],
  profesionalResponsable: '',
  duplaProfesionalOtro: '',
  duplaProfesionalOtroNombre: '',
  sinDupla: false,
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
  anamnesisGeneral: '',
  antecedentesPersonales: '',
  morbilidad: '',
  adherenciaTratamiento: 'Sí',
  ramFarmacos: 'No',
  ramFarmacosAclaracion: '',
  alergias: 'Niega.',
  cirugias: 'Niega.',
  hospitalizaciones: 'Niega.',
  controlExtrasistema: 'Niega.',
  factoresRiesgo: [],
  antecedentesMedicos: '',
  farmacos: '',
  alergiasPresentes: false,
  alergiasDetalle: '',
  cirugiasPresentes: false,
  cirugiasDetalle: '',
  hospitalizacionesPresentes: false,
  hospitalizacionesDetalle: '',
  controlExtrasistemaPresentes: false,
  controlExtrasistemaDetalle: '',
  consultasUrgenciasPresentes: false,
  consultasUrgenciasDetalle: '',
  adherenciaTratamientoPresentes: false,
  adherenciaTratamientoDetalle: '',
  encuestaAlimentaria: '- PAN: \n- LÍQUIDOS: \n- LÁCTEOS: \n- INFUSIONES: \n- AZÚCAR: \n- FRUTAS: \n- ENSALADAS: \n- ARROZ/FIDEOS: \n- GOLOSINAS: \n',
  adhierePautaNutricional: '',
  escolaridad: '',
  ocupacion: '',
  antecedentesFamiliares: 'Sin antecedentes familiares de jerarquía.',
  viveCon: '',
  redesApoyo: '',
  percepcionEconomica: '',
  espiritualidad: '',
  alcohol: false,
  alcoholAclaracion: '',
  tabaco: false,
  tabacoAclaracion: '',
  ipaNroCigarrillos: '',
  ipaNroAnos: '',
  ipaResultado: '',
  drogas: false,
  drogasAclaracion: '',
  actividadFisicaHabito: 'Sin actividad física',
  habitoMiccional: 'Diuresis espontánea, normocuantitativa, sin disuria ni alteraciones referidas.',
  habitoDefecatorio: 'Catarsis conservada, deposiciones habituales, sin diarrea ni constipación.',
  actividadSexualProteccion: '',
  antecedentesGineco: '',
  fum: '',
  sintomasClimaterio: '',
  mamografiaDia: 'Vigente, sin hallazgos patológicos',
  papVigente: 'Vigente, sin hallazgos patológicos',
  empam: '',
  fondoOjo: '',
  podologo: '',
  evaluacionPie: '',
  atencionesPsa: '',
  examenesFecha: '',
  examenes: '',
  vacunas: 'Al día.',
  ekgFecha: '',
  ekgResultados: '',
  otrasImagenesFecha: '',
  otrasImagenesResultados: '',
  telefonoPrefijo: '+569',
  telefonoNumero: '',
  gestionIngresoEstado: '',
  gestionIngresoMes: '',
  gestionIngresoPunto: '',
  gestionIngresoDupla: '',
  indicaciones: initialIndicaciones,
  phq9_interes: '',
  phq9_animo: '',
  phq9_sueno: '',
  phq9_energia: '',
  phq9_apetito: '',
  phq9_culpa: '',
  phq9_concentracion: '',
  phq9_motor: '',
  phq9_suicidio: '',
  animo_estadoAnimo: 'Eutímico, ánimo estable y congruente con el contexto, sin síntomas afectivos evidentes.',
  animo_habitoSueno: 'Conservado. Refiere sueño reparador, con conciliación y mantención adecuadas, sin insomnio, hipersomnia ni despertares frecuentes.',
  animo_percepcionSalud: 'Salud, autonomía y funcionalidad conservadas.',
  animo_ideacionSuicida: 'Niega.',
  integralIndividual: '',
  integralFamiliar: '',
  integralTipologia: '',
  integralCronicas: '',
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

      const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });

      const filePart = {
        inlineData: {
          mimeType: file.type,
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
        model: 'llama-3.2-90b-vision-preview',
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
      console.error("Error calling Groq API:", apiError);
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

interface FichaPreingresoEcicepProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<{
    exportPdf: () => void;
    newForm: () => void;
    driveEdit: () => void;
    remClick: () => void;
    printResumen: () => void;
  } | null>;
  fechaIngresoProp?: string;
  onFechaIngresoChange?: (val: string) => void;
}

const FichaPreingresoEcicep: React.FC<FichaPreingresoEcicepProps> = ({ onBackToMenu, loggedInUser, actionsRef, fechaIngresoProp, onFechaIngresoChange }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaPreingresoEcicepFormData>('local_FichaPreingresoEcicep', initialFormData);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');
  const [status, setStatus] = useState<FormStatus>(FormStatus.TextGenerated);
  const [showRemActive, setShowRemActive] = useState(false);

  const [isEscolaridadLibre, setIsEscolaridadLibre] = useState(false);
  const [isOcupacionLibre, setIsOcupacionLibre] = useState(false);
  const [isEspiritualidadLibre, setIsEspiritualidadLibre] = useState(false);
  const [isActividadFisicaLibre, setIsActividadFisicaLibre] = useState(false);

  const [isLabLoading, setIsLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const [isEkgLoading, setIsEkgLoading] = useState(false);
  const [ekgError, setEkgError] = useState<string | null>(null);
  const ekgFileRef = useRef<HTMLInputElement>(null);

  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);
  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);
  const [isFactoresRiesgoModalOpen, setIsFactoresRiesgoModalOpen] = useState(false);
  const [isPhq9ModalOpen, setIsPhq9ModalOpen] = useState(false);

  // Sync external fecha prop -> formData
  useEffect(() => {
    if (fechaIngresoProp && fechaIngresoProp !== formData.fechaIngreso) {
      setFormData(prev => ({ ...prev, fechaIngreso: fechaIngresoProp }));
    }
  }, [fechaIngresoProp]);

  // Register actions in ref - use stable handler refs to avoid infinite loops
  const handlersRef = React.useRef<{
    exportPdf?: () => void;
    newForm?: () => void;
    driveEdit?: () => void;
    remClick?: () => void;
    printResumen?: () => void;
  }>({});

  // Update handlersRef on every render (no state change = no re-render loop)
  // Then set actionsRef to stable wrapper functions only once on mount
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: () => handlersRef.current.exportPdf?.(),
        newForm: () => handlersRef.current.newForm?.(),
        driveEdit: () => handlersRef.current.driveEdit?.(),
        remClick: () => handlersRef.current.remClick?.(),
        printResumen: () => handlersRef.current.printResumen?.(),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  const isPhq9Completed = React.useMemo(() => {
    return phq9Questions.some(question => {
      const value = formData[question.key as keyof FichaPreingresoEcicepFormData];
      return value !== undefined && value !== null && value !== '';
    });
  }, [formData]);

  const phq9Score = React.useMemo(() => {
    return phq9Questions.reduce((total, question) => {
      const value = formData[question.key as keyof FichaPreingresoEcicepFormData];
      return total + (parseInt(value as string, 10) || 0);
    }, 0);
  }, [formData]);

  const phq9Interpretation = React.useMemo(() => {
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

    const suicidioScore = parseInt(formData.phq9_suicidio, 10) || 0;
    if (suicidioScore > 0) {
      action += '\n¡ATENCIÓN! Respuesta positiva a ideación suicida. Evaluar riesgo y tomar medidas inmediatas según protocolo.';
    }

    return { score, severity, action };
  }, [phq9Score, formData.phq9_suicidio]);

  const renderAnimoSuicidaCheckbox = () => {
    const isNiega = formData.animo_ideacionSuicida === 'Niega.';
    return (
      <div className="flex items-end gap-3 mt-4">
        <div className="flex-grow">
          <FormField
            label="Ideación Suicida"
            id="animo_ideacionSuicida"
            name="animo_ideacionSuicida"
            value={formData.animo_ideacionSuicida || ''}
            onChange={handleChange as any}
            placeholder="Describa riesgo..."
            disabled={isNiega}
            inputClassName="!h-[42px]"
          />
        </div>
        <div className="flex items-center flex-shrink-0">
          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${isNiega ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
            <input
              type="checkbox"
              checked={isNiega}
              onChange={(e) => {
                const val = e.target.checked ? 'Niega.' : '';
                setFormData(prev => ({ ...prev, animo_ideacionSuicida: val }));
              }}
              className="h-4 w-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
            />
            <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Niega</span>
          </label>
        </div>
      </div>
    );
  };

  const renderAntecedentCheckbox = (label: string, name: keyof FichaPreingresoEcicepFormData) => {
    return (
      <div key={name} className="flex items-end gap-3">
        <div className="flex-grow">
          <FormField
            label={label}
            id={name}
            name={name}
            value={(formData[name] as string) || ''}
            onChange={handleChange as any}
            placeholder={`Detalle de ${label.toLowerCase()}...`}
            disabled={formData[name] === 'Niega.'}
            inputClassName="!h-[42px]"
          />
        </div>
        <div className="flex items-center flex-shrink-0">
          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData[name] === 'Niega.' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
            <input
              type="checkbox"
              checked={formData[name] === 'Niega.'}
              onChange={(e) => {
                const val = e.target.checked ? 'Niega.' : '';
                setFormData(prev => ({ ...prev, [name]: val }));
              }}
              className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
            <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Niega</span>
          </label>
        </div>
      </div>
    );
  };

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
    { key: 'cv_sintoma_ortopnea', label: 'Ortopnea' },
    { key: 'cv_sintoma_dpn', label: 'DPN' },
    { key: 'cv_sintoma_nicturia', label: 'Nicturia' },
    { key: 'cv_sintoma_edema', label: 'Edema en MM.II.' },
    { key: 'cv_sintoma_angor', label: 'Ángor' },
    { key: 'cv_sintoma_palpitaciones', label: 'Palpitaciones' },
    { key: 'cv_sintoma_polidipsia', label: 'Polidipsia' },
    { key: 'cv_sintoma_poliuria', label: 'Poliuria' },
    { key: 'cv_sintoma_polifagia', label: 'Polifagia' },
    { key: 'cv_sintoma_perdida_peso', label: 'Pérdida de peso' },
  ];

  const eraSymptomsItems = [
    { key: 'era_sintoma_tos', label: 'Tos con risa/ejercicio/frío' },
    { key: 'era_sintoma_opresion', label: 'Sensación opresión torácica' },
    { key: 'era_sintoma_rinorrea', label: 'Rinorrea' },
    { key: 'era_sintoma_estornudos', label: 'Estornudos en salva' },
    { key: 'era_sintoma_prurito', label: 'Prurito nasal/ocular' },
    { key: 'era_sintoma_limitan', label: 'Limitan actividades' },
    { key: 'era_sintoma_diarios', label: 'Síntomas diarios (>2 veces/semana)' },
    { key: 'era_sintoma_nocturnos', label: 'Síntomas nocturnos' },
    { key: 'era_sintoma_sbt_sos', label: 'Requerimiento SBT SOS' },
    { key: 'era_sintoma_urgencias', label: 'Consultas en urgencias' },
    { key: 'era_sintoma_corticoides', label: 'Uso de corticoides sistémicos (actual/reciente)' },
  ];

  const eraTriggersItems = [
    { key: 'era_desencadenante_mascotas', label: 'Mascotas' },
    { key: 'era_desencadenante_higiene', label: 'Higiene de hogar' },
    { key: 'era_desencadenante_alfombras', label: 'Alfombras' },
    { key: 'era_desencadenante_tabaco_ambiental', label: 'Hábito tabáquico ambiental' },
    { key: 'era_desencadenante_cocina', label: 'Cocina a leña/carbón' },
    { key: 'era_desencadenante_calefaccion', label: 'Calefacción a leña/carbón' },
  ];

  const handleSelectDuplaUser = (user: User) => {
    setFormData(prev => ({
      ...prev,
      duplaProfesionalOtroNombre: user.fullName,
      duplaProfesionalOtro: user.profession === 'medicina' ? 'Médico' : (user.profession.charAt(0).toUpperCase() + user.profession.slice(1))
    }));
  };

  const handleClearDuplaUser = () => {
    setFormData(prev => ({
      ...prev,
      duplaProfesionalOtroNombre: '',
      duplaProfesionalOtro: ''
    }));
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (loggedInUser && !formData.profesionalResponsable) {
      setFormData(prev => ({
        ...prev,
        profesionalResponsable: loggedInUser.fullName
      }));
    }
  }, [loggedInUser, formData.profesionalResponsable]);

  const generatedIndicationRegex = /- Se gestiona hora para INGRESO ECICEP \+ .*?\.|-? No se realiza INGRESO ECICEP por no cumplir criterios de inclusión\./;
  const placeholderIndication = "- Se gestiona hora con dupla acorde a necesidades del usuario.";

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
          edad: { type: Type.STRING, description: "Edad del paciente." },
          sexo: { type: Type.STRING, description: "Sexo del paciente ('Masculino' o 'Femenino')." },
          antecedentesMedicos: { type: Type.STRING, description: "Lista de antecedentes médicos crónicos." },
          farmacos: { type: Type.STRING, description: "Lista de fármacos habituales y dosis." },
          antecedentesFamiliares: { type: Type.STRING, description: "Antecedentes familiares relevantes." },
          viveCon: { type: Type.STRING, description: "Con quién vive el paciente." },
          redesApoyo: { type: Type.STRING, description: "Redes de apoyo disponibles." },
          escolaridad: { type: Type.STRING, description: "Nivel de escolaridad." },
          ocupacion: { type: Type.STRING, description: "Ocupación actual." },
          percepcionEconomica: { type: Type.STRING, description: "Percepción de la situación económica." },
          espiritualidad: { type: Type.STRING, description: "Creencias espirituales." },
          examenes: { type: Type.STRING, description: "Resumen de últimos resultados de laboratorio." },
          alergiasDetalle: { type: Type.STRING, description: "Detalle de alergias si existen." },
          cirugiasDetalle: { type: Type.STRING, description: "Detalle de cirugías si existen." },
          hospitalizacionesDetalle: { type: Type.STRING, description: "Detalle de hospitalizaciones si existen." },
          encuestaAlimentaria: { type: Type.STRING, description: "Detalle de la encuesta alimentaria o dieta del paciente." }
        },
      };

      const response = await ai.models.generateContent({
        model: 'llama-3.2-90b-vision-preview',
        contents: `Analiza el siguiente texto de un registro clínico (puede ser morbilidad o control cardiovascular) y extrae la información relevante para completar una ficha de PREINGRESO ECICEP. Devuelve solo un objeto JSON. Texto: "${pastedText.replace(/"/g, "'")}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const jsonString = response.text.trim();
      const parsedData = JSON.parse(jsonString);
      const updatedFields: Partial<FichaPreingresoEcicepFormData> = {};

      Object.keys(parsedData).forEach(key => {
        if (parsedData[key]) {
          (updatedFields as any)[key] = parsedData[key];
        }
      });

      if (parsedData.alergiasDetalle) updatedFields.alergiasPresentes = true;
      if (parsedData.cirugiasDetalle) updatedFields.cirugiasPresentes = true;
      if (parsedData.hospitalizacionesDetalle) updatedFields.hospitalizacionesPresentes = true;

      setFormData(prev => ({ ...prev, ...updatedFields }));
      setIsImportModalOpen(false);
      alert('Datos importados exitosamente.');

    } catch (error) {
      console.error("Error al importar datos:", error);
      alert("No se pudo procesar el texto. Verifique el formato o intente de nuevo.");
    } finally {
      setIsAiImporting(false);
    }
  };

  useEffect(() => {
    const edadNum = parseInt(formData.edad);
    if (!isNaN(edadNum) && edadNum < 65) {
      if (formData.empam !== 'No aplica.') {
        setFormData(prev => ({ ...prev, empam: 'No aplica.' }));
      }
    }
  }, [formData.edad, formData.empam]);

  useEffect(() => {
    if (formData.edad) {
      const edadNum = parseInt(formData.edad, 10);
      if (!isNaN(edadNum)) {
        let cicloIndex = -1;
        if (edadNum >= 0 && edadNum <= 5) cicloIndex = 0;
        else if (edadNum >= 6 && edadNum <= 11) cicloIndex = 1;
        else if (edadNum >= 12 && edadNum <= 18) cicloIndex = 2;
        else if (edadNum >= 19 && edadNum <= 26) cicloIndex = 3;
        else if (edadNum >= 27 && edadNum <= 59) cicloIndex = 4;
        else if (edadNum >= 60) cicloIndex = 5;
        
        if (cicloIndex !== -1 && cicloVitalIndividualOptions[cicloIndex]) {
          setFormData(prev => ({ ...prev, integralIndividual: cicloVitalIndividualOptions[cicloIndex] }));
        }
      }
    }
  }, [formData.edad]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, integralCronicas: prev.antecedentesPersonales }));
  }, [formData.antecedentesPersonales]);

  useEffect(() => {
    const { gestionIngresoEstado, gestionIngresoMes, gestionIngresoPunto, gestionIngresoDupla } = formData;

    setFormData(prev => {
      let newIndicationsText = prev.indicaciones;
      let newIndication = '';

      if (gestionIngresoEstado === 'Ingresa a ECICEP' && gestionIngresoMes && gestionIngresoPunto && gestionIngresoDupla) {
        const puntoMesMap: Record<string, string> = {
          inicios: 'inicios de',
          quincena: 'quincena de',
          finales: 'finales de'
        };
        const currentYear = new Date().getFullYear();
        newIndication = `- Se gestiona hora para INGRESO ECICEP + ${gestionIngresoDupla.toUpperCase()} para ${puntoMesMap[gestionIngresoPunto]} ${gestionIngresoMes} ${currentYear}.`;
      } else if (gestionIngresoEstado === 'No se ingresa') {
        newIndication = "- No se realiza INGRESO ECICEP por no cumplir criterios de inclusión.";
      }

      if (newIndication) {
        if (generatedIndicationRegex.test(newIndicationsText)) {
          newIndicationsText = newIndicationsText.replace(generatedIndicationRegex, newIndication);
        } else if (newIndicationsText.includes(placeholderIndication)) {
          newIndicationsText = newIndicationsText.replace(placeholderIndication, newIndication);
        } else {
          newIndicationsText += `\n${newIndication}`;
        }
      } else {
        if (generatedIndicationRegex.test(newIndicationsText)) {
          newIndicationsText = newIndicationsText.replace(generatedIndicationRegex, placeholderIndication);
        }
      }

      return { ...prev, indicaciones: newIndicationsText };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gestionIngresoEstado, formData.gestionIngresoMes, formData.gestionIngresoPunto, formData.gestionIngresoDupla]);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return '(Fecha inválida)';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    anamnesis += `FICHA PREINGRESO ECICEP\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA PREINGRESO: ${formatDateForDisplay(formData.fechaIngreso)}\n`;
    anamnesis += `PROFESIONAL RESPONSABLE: ${formData.profesionalResponsable || '(No ingresado)'}\n`;
    anamnesis += `ESTRATIFICACIÓN: ${formData.estratificacion || '(No seleccionado)'}\n`;
    anamnesis += `MOTIVO DE CONSULTA: Preingreso ECICEP\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `DIMENSIÓN BIOLÓGICA\n`;
    anamnesis += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    anamnesis += `Sexo: ${formData.sexo || '(No seleccionado)'}\n`;
    anamnesis += `Anamnesis General: ${formData.anamnesisGeneral || '(No ingresado)'}\n`;
    anamnesis += `Antecedentes Personales: ${formData.antecedentesPersonales || '(No ingresado)'}\n`;
    anamnesis += `Morbilidad: ${formData.morbilidad || '(No ingresado)'}\n`;
    anamnesis += `Fármacos: ${formData.farmacos || '(No ingresado)'}\n`;
    anamnesis += `Adherencia a tratamiento: ${formData.adherenciaTratamiento || '(No seleccionado)'}\n`;
    anamnesis += `RAM a fármacos: ${formData.ramFarmacos}${formData.ramFarmacos === 'Sí' && formData.ramFarmacosAclaracion ? ` (${formData.ramFarmacosAclaracion})` : ''}\n`;
    anamnesis += `Alergias: ${formData.alergias || 'Niega.'}\n`;
    anamnesis += `Cirugías: ${formData.cirugias || 'Niega.'}\n`;
    anamnesis += `Hospitalizaciones: ${formData.hospitalizaciones || 'Niega.'}\n`;
    anamnesis += `Controles fuera de CESFAM: ${formData.controlExtrasistema || 'Niega.'}\n\n`;

    if (formData.factoresRiesgo && formData.factoresRiesgo.length > 0) {
      anamnesis += `FACTORES DE RIESGO:\n`;
      formData.factoresRiesgo.forEach(factor => {
        anamnesis += `- ${factor}.\n`;
      });
      anamnesis += `\n`;
    }

    anamnesis += `HÁBITOS:\n`;
    habitosCheckboxConfig.forEach(config => {
      const name = config.keyBase as keyof FichaPreingresoEcicepFormData;
      const clarificationName = `${config.keyBase}Aclaracion` as keyof FichaPreingresoEcicepFormData;
      const isChecked = formData[name];
      const clarification = formData[clarificationName];
      if (isChecked) {
        anamnesis += `- ${config.label}: Sí.${clarification ? ` ${clarification}` : ''}\n`;
        if (config.keyBase === 'tabaco') {
          const cigs = parseFloat(formData.ipaNroCigarrillos);
          const anos = parseFloat(formData.ipaNroAnos);
          if (!isNaN(cigs) && !isNaN(anos)) {
            const res = (cigs * anos) / 20;
            anamnesis += `  IPA: ${res.toFixed(1)}\n`;
          }
        }
      } else {
        anamnesis += `- ${config.label}: Niega.\n`;
      }
    });
    anamnesis += `Actividad Física: ${formData.actividadFisicaHabito || '(No ingresado)'}\n`;
    anamnesis += `Hábito Miccional: ${formData.habitoMiccional || '(No ingresado)'}\n`;
    anamnesis += `Hábito Defecatorio: ${formData.habitoDefecatorio || '(No ingresado)'}\n`;
    anamnesis += `Actividad Sexual (protección): ${formData.actividadSexualProteccion || '(No ingresado)'}\n\n`;

    anamnesis += `ALIMENTACIÓN:\n`;
    anamnesis += `Encuesta alimentaria: ${formData.encuestaAlimentaria || '(No ingresado)'}\n\n`;

    if (formData.sexo === 'Femenino') {
      anamnesis += `ANTECEDENTES GINECO-OBSTÉTRICOS\n`;
      anamnesis += `Antecedentes gineco obstétricos: ${formData.antecedentesGineco || '(No ingresado)'}\n`;
      anamnesis += `FUM: ${formData.fum || '(No ingresado)'}\n`;
      anamnesis += `Síntomas climatéricos/menopausia: ${formData.sintomasClimaterio || '(No ingresado)'}\n`;
      anamnesis += `Mamografía al día: ${formData.mamografiaDia || '(No ingresado)'}\n`;
      anamnesis += `PAP Vigente: ${formData.papVigente || '(No ingresado)'}\n\n`;
    }

    anamnesis += `ATENCIONES VIGENTES:\n`;
    anamnesis += `EMPAM: ${formData.empam || '(No ingresado)'}\n`;
    anamnesis += `Fondo de ojo: ${formData.fondoOjo || '(No ingresado)'}\n`;
    anamnesis += `Podólogo: ${formData.podologo || '(No ingresado)'}\n`;
    anamnesis += `Evaluación de pie: ${formData.evaluacionPie || '(No ingresado)'}\n`;
    if (formData.sexo === 'Masculino') {
      anamnesis += `PSA: ${formData.atencionesPsa || '(No ingresado)'}\n`;
    }
    anamnesis += `Vacunas: ${formData.vacunas || '(No ingresado)'}\n\n`;

    anamnesis += `DIMENSIÓN PSICOLÓGICA, ESPIRITUAL Y FUNCIONAL:\n`;
    anamnesis += `- Estado anímico: ${formData.animo_estadoAnimo || '(No ingresado)'}\n`;
    anamnesis += `- Hábito de sueño: ${formData.animo_habitoSueno || '(No ingresado)'}\n`;
    anamnesis += `- Percepción salud: ${formData.animo_percepcionSalud || '(No ingresado)'}\n`;
    anamnesis += `- Ideación suicida: ${formData.animo_ideacionSuicida || '(No ingresado)'}\n`;
    if (phq9Score > 0 || (parseInt(formData.phq9_suicidio, 10) || 0) > 0) {
      anamnesis += `- PHQ-9: Puntaje ${phq9Interpretation.score} (${phq9Interpretation.severity})\n`;
    }
    anamnesis += `\n`;

    anamnesis += `DIMENSIÓN SOCIAL, FAMILIAR Y COMUNITARIA:\n`;
    anamnesis += `- Escolaridad: ${formData.escolaridad || '(No ingresado)'}\n`;
    anamnesis += `- Ocupación: ${formData.ocupacion || '(No ingresado)'}\n`;
    anamnesis += `- Antecedentes familiares: ${formData.antecedentesFamiliares || '(No ingresado)'}\n`;
    anamnesis += `- Vive con: ${formData.viveCon || '(No ingresado)'}\n`;
    anamnesis += `- Factores protectores: ${formData.factoresProtectores || '(No ingresado)'}\n`;
    anamnesis += `- Estado civil/hijos: ${formData.estadoCivilHijos || '(No ingresado)'}\n`;
    anamnesis += `- Redes de apoyo: ${formData.redesApoyo || '(No ingresado)'}\n`;
    anamnesis += `- Percepción económica: ${formData.percepcionEconomica || '(No ingresado)'}\n`;
    anamnesis += `- Espiritualidad: ${formData.espiritualidad || '(No ingresado)'}\n\n`;

    anamnesis += `DATOS DE CONTACTO:\n`;
    anamnesis += `Teléfono: ${formData.telefonoPrefijo || ''} ${formData.telefonoNumero || '(No ingresado)'}\n\n`;

    exploracion += `ÚLTIMO LABORATORIO:\n`;
    exploracion += `Fecha Examen: ${formData.examenesFecha ? formatDateForDisplay(formData.examenesFecha) : '(No ingresado)'}\n`;
    exploracion += `Resultados Laboratorio: ${formData.examenes.trim() || '(No ingresado)'}\n`;
    exploracion += `EKG (Fecha: ${formData.ekgFecha ? formatDateForDisplay(formData.ekgFecha) : '(No ingresado)'}): ${formData.ekgResultados.trim() || '(No ingresado)'}\n`;
    exploracion += `Otras Imágenes (Fecha: ${formData.otrasImagenesFecha ? formatDateForDisplay(formData.otrasImagenesFecha) : '(No ingresado)'}): ${formData.otrasImagenesResultados?.trim() || '(No ingresado)'}\n`;

    actuacion += `VALORACIÓN INTEGRAL:\n`;
    actuacion += `- Ciclo vital individual: ${formData.integralIndividual || '(No ingresado)'}\n`;
    actuacion += `- Ciclo vital familiar: ${formData.integralFamiliar || '(No ingresado)'}\n`;
    actuacion += `- Tipología familiar: ${formData.integralTipologia || '(No ingresado)'}\n`;
    actuacion += `- Condiciones crónicas y problemáticas: ${formData.integralCronicas || '(No ingresado)'}\n\n`;

    actuacion += `GESTIÓN DE INGRESO:\n`;
    actuacion += `Estado: ${formData.gestionIngresoEstado || '(No seleccionado)'}\n`;
    if (formData.gestionIngresoEstado === 'Ingresa a ECICEP') {
      actuacion += `Mes de ingreso: ${formData.gestionIngresoMes || '(No seleccionado)'}\n`;
      actuacion += `Momento del mes: ${formData.gestionIngresoPunto || '(No seleccionado)'}\n`;
      actuacion += `Dupla: ${formData.gestionIngresoDupla || '(No seleccionado)'}\n`;
    }
    actuacion += `\n`;

    actuacion += `PLAN E INDICACIONES:\n${formData.indicaciones || '(Sin indicaciones)'}\n`;

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim()
    };
  }, [formData]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
  }, [formData, calculateGeneratedTextParts]);

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'laboratorio', setIsLabLoading, setLabError, (result) => {
      setFormData(prev => ({
        ...prev,
        examenes: result.text,
        ...(result.date && { examenesFecha: result.date }),
      }));
    }, loggedInUser);
    if (e.target) {
      e.target.value = '';
    }
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
    if (e.target) {
      e.target.value = '';
    }
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
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => {
        const newState = { ...prev, [name]: checked };
        const detailKey = `${name.replace('Presentes', '')}Detalle` as keyof FichaPreingresoEcicepFormData;
        if (!checked && detailKey in newState) {
          (newState as any)[detailKey] = '';
        }
        return newState;
      });
    } else if (name === "telefonoNumero") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`'${partName}' copiado al portapapeles.`);
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      alert('Error al copiar texto.');
    });
  };

  const handleNewDocument = () => {
    const resp = loggedInUser?.fullName || '';
    setFormData({ ...initialFormData, profesionalResponsable: resp });
    setAnamnesisText('');
    setExploracionText('');
    setActuacionText('');
    setStatus(FormStatus.Idle);
    setIsEscolaridadLibre(false);
    setIsOcupacionLibre(false);
    setIsEspiritualidadLibre(false);
  };

  // FIX: Added missing handleDriveEdit to resolve "Cannot find name 'handleDriveEdit'" error.
  const handleDriveEdit = () => {
    const textToCopy = `Preingreso ECICEP gestionado para el paciente ${formData.edad} años, ${formData.sexo}.`;
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

  // FIX: Added missing handleRemClick to resolve "Cannot find name 'handleRemClick'" error.
  const handleRemClick = () => {
    setShowRemActive(true);
    setTimeout(() => {
      setShowRemActive(false);
    }, 3000);
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
          title: 'Ficha Clínica: Preingreso ECICEP',
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

  const handlePrintResumen = () => {
    const fullText = [anamnesisText, exploracionText, actuacionText].filter(Boolean).join('\n\n');
    if (!fullText.trim()) {
      alert('No hay contenido en el resumen para imprimir.');
      return;
    }
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    const escaped = fullText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    win.document.write(`<!DOCTYPE html><html><head><title>Resumen Preingreso ECICEP</title><style>body{font-family:monospace;font-size:12px;padding:20px;white-space:pre-wrap;line-height:1.5}@media print{body{padding:10mm}}</style></head><body>${escaped}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  // Update handlersRef with latest function implementations (doesn't cause re-renders)
  handlersRef.current.exportPdf = handleExportPdf;
  handlersRef.current.newForm = handleNewDocument;
  handlersRef.current.driveEdit = handleDriveEdit;
  handlersRef.current.remClick = handleRemClick;
  handlersRef.current.printResumen = handlePrintResumen;

  const renderCheckboxClarificationField = (item: any) => {
    const checkboxKey = item.keyBase;
    const aclaracionKey = `${String(item.keyBase)}Aclaracion` as keyof FichaPreingresoEcicepFormData;

    const isChecked = formData[checkboxKey as keyof FichaPreingresoEcicepFormData] as boolean;
    const aclaracionValue = formData[aclaracionKey] as string;

    return (
      <div key={String(item.keyBase)} className="mb-1.5 p-2.5 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={String(checkboxKey)}
            name={String(checkboxKey)}
            checked={isChecked}
            onChange={handleChange as any}
            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            aria-labelledby={`${String(checkboxKey)}-label`}
          />
          <label id={`${String(checkboxKey)}-label`} htmlFor={String(checkboxKey)} className="text-sm font-normal text-slate-700 tracking-tight">
            {item.label}
          </label>
        </div>
        {isChecked && (
          <div className="mt-3 space-y-3">
            <textarea
              name={String(aclaracionKey)}
              value={aclaracionValue}
              onChange={handleChange as any}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 outline-none min-h-[80px] text-black font-medium"
              placeholder={`Detalle de ${item.label.toLowerCase()}...`}
            />
            {checkboxKey === 'tabaco' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <FormField
                  label="N° Cigarrillos/día"
                  id="ipaNroCigarrillos"
                  name="ipaNroCigarrillos"
                  value={formData.ipaNroCigarrillos}
                  onChange={handleChange as any}
                  placeholder="Ej: 10"
                  inputClassName="!h-[38px] text-xs"
                />
                <FormField
                  label="N° Años fumando"
                  id="ipaNroAnos"
                  name="ipaNroAnos"
                  value={formData.ipaNroAnos}
                  onChange={handleChange as any}
                  placeholder="Ej: 20"
                  inputClassName="!h-[38px] text-xs"
                />
                <div className="flex flex-col">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">IPA Resultante</label>
                  <div className="h-[38px] flex items-center px-3 bg-white border border-slate-300 rounded-lg font-bold text-sky-700 text-sm shadow-sm">
                    {(() => {
                      const cigs = parseFloat(formData.ipaNroCigarrillos);
                      const anos = parseFloat(formData.ipaNroAnos);
                      if (!isNaN(cigs) && !isNaN(anos)) {
                        const res = (cigs * anos) / 20;
                        return res.toFixed(1);
                      }
                      return '0.0';
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRadioGroup = (
    label: string,
    name: keyof FichaPreingresoEcicepFormData,
    options: { value: string, label: string }[]
  ) => (
    <div className="mb-1">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}:</label>
      <div className="flex items-center space-x-2.5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center text-sm cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={formData[name] === opt.value}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const mesesOptions = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const puntoMesOptions = [{ value: "inicios", label: "Inicios" }, { value: "quincena", label: "Quincena" }, { value: "finales", label: "Finales" }];
  const duplaOptions = ["Enfermera", "Nutricionista", "Psicóloga", "Matrona", "TENS", "Técnico en farmacia", "Asistente social"];

  return (
    <>
      <div className="w-full flex flex-col">
        {isAiImporting && (
          <div className="w-full text-center p-3 bg-sky-100 border border-sky-300 rounded-lg mb-4 flex-shrink-0 animate-pulse">
            <p className="text-sky-700 font-semibold">Importando datos... Esto puede tardar unos segundos.</p>
          </div>
        )}

        {/* Grid de contenido: mismo esquema que FichaIngresoEcicep */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">

          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">

                 <section id="sec-identificacion-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-2 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>

                  <div className="flex items-end gap-2.5 mt-0">
                    <div className="flex-grow">
                      {renderRadioGroup("Estratificación", "estratificacion", [{ value: "G1", label: "G1" }, { value: "G2", label: "G2" }, { value: "G3", label: "G3" }])}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRiskCalculatorOpen(true)}
                      className="mb-1 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M12 4L4 20H20L12 4Z" />
                      </svg>
                      CALCULAR
                    </button>
                  </div>

                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdditionalControlsOpen(!isAdditionalControlsOpen)}
                      className="w-full flex justify-between items-center py-2 text-sm font-bold text-sky-800 uppercase tracking-tighter"
                    >
                      <span>Controles Adicionales</span>
                      <svg className={`h-5 w-5 transform transition-transform ${isAdditionalControlsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isAdditionalControlsOpen && (
                      <div className="mt-2 bg-white p-3 rounded-lg border border-sky-100 shadow-inner animate-fadeIn">
                        <label htmlFor="additionalControlSelect" className="block text-sm font-medium text-slate-700 mb-1.5">Seleccionar Control Específico</label>
                        <select
                          id="additionalControlSelect"
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 outline-none text-sm font-sans font-normal"
                          onChange={(e) => {
                            const selectedKey = e.target.value;
                            setFormData(prev => {
                              const newState = { ...prev };
                              additionalControlsItems.forEach(item => {
                                (newState as any)[item.key] = false;
                              });
                              if (selectedKey) {
                                (newState as any)[selectedKey] = true;
                              }
                              return newState;
                            });
                          }}
                          value={additionalControlsItems.find(item => formData[item.key as keyof FichaPreingresoEcicepFormData])?.key || ''}
                        >
                          <option value="">Ninguno / Solo ECICEP</option>
                          {additionalControlsItems.map(item => (
                            <option key={item.key} value={item.key}>{item.label}</option>
                          ))}
                        </select>

                        {formData.incluirControlCardiovascular && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Cardiovasculares</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {cvSymptomsItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input
                                    type="checkbox"
                                    id={item.key}
                                    name={item.key}
                                    checked={formData[item.key as keyof FichaPreingresoEcicepFormData] as boolean}
                                    onChange={handleChange as any}
                                    className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                  />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                    {item.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.incluirControlSalaEra && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Respiratorios</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {eraSymptomsItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input
                                    type="checkbox"
                                    id={item.key}
                                    name={item.key}
                                    checked={formData[item.key as keyof FichaPreingresoEcicepFormData] as boolean}
                                    onChange={handleChange as any}
                                    className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                  />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                    {item.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mt-4 mb-3 tracking-widest border-b border-sky-100 pb-1">Desencadenantes Ambientales</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {eraTriggersItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input
                                    type="checkbox"
                                    id={item.key}
                                    name={item.key}
                                    checked={formData[item.key as keyof FichaPreingresoEcicepFormData] as boolean}
                                    onChange={handleChange as any}
                                    className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                                  />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">
                                    {item.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <section id="sec-antecedentes-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Antecedentes Generales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Edad"
                      id="edad"
                      name="edad"
                      value={formData.edad || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, edad: val }));
                      }}
                      placeholder="Edad en años..."
                      inputClassName="!h-[42px] !text-slate-800 placeholder:opacity-50"
                      containerClassName="mb-1"
                    />
                    {renderRadioGroup("Sexo", "sexo", [
                      { value: "Masculino", label: "Masculino" },
                      { value: "Femenino", label: "Femenino" },
                    ])}
                  </div>
                  <FormField label="Anamnesis General" id="anamnesisGeneral" name="anamnesisGeneral" value={formData.anamnesisGeneral || ''} onChange={handleChange} isTextArea rows={3} placeholder="Detalle de anamnesis..." inputClassName="!text-slate-800 placeholder:opacity-50" />
                  <SmartAntecedentesTextarea
                    label="Antecedentes Personales"
                    id="antecedentesPersonales"
                    name="antecedentesPersonales"
                    value={formData.antecedentesPersonales || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, antecedentesPersonales: val }))}
                    rows={2}
                    placeholder="Antecedentes personales relevantes..."
                  />
                  <FormField label="Morbilidad" id="morbilidad" name="morbilidad" value={formData.morbilidad || ''} onChange={handleChange} isTextArea rows={2} placeholder="Morbilidades existentes..." inputClassName="!text-slate-800 placeholder:opacity-50" />
                  <div>
                    <SmartFarmacosTextarea
                      label="Fármacos"
                      id="farmacos"
                      name="farmacos"
                      value={formData.farmacos || ''}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, farmacos: newValue }))}
                      rows={4}
                      placeholder="Fármacos en uso..."
                    />
                    <div className="mt-3 flex justify-start">
                      <button
                        type="button"
                        onClick={() => setIsFactoresRiesgoModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors duration-150 ease-in-out flex items-center gap-2"
                      >
                        <AlertTriangle size={17} />
                        Factores de riesgo
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-0 mb-0">
                    {renderRadioGroup("Adherencia a tratamiento", "adherenciaTratamiento", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                    <div className="flex flex-col gap-2">
                      {renderRadioGroup("RAM a fármacos", "ramFarmacos", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                      {formData.ramFarmacos === 'Sí' && (
                        <FormField
                          label="Aclaración RAM"
                          id="ramFarmacosAclaracion"
                          name="ramFarmacosAclaracion"
                          value={formData.ramFarmacosAclaracion || ''}
                          onChange={handleChange}
                          placeholder="Describa la RAM..."
                          inputClassName="!text-slate-800 placeholder:opacity-50"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {renderAntecedentCheckbox("Alergias", "alergias")}
                    {renderAntecedentCheckbox("Hospitalizaciones", "hospitalizaciones")}
                    {renderAntecedentCheckbox("Cirugías", "cirugias")}
                    {renderAntecedentCheckbox("Controles fuera de CESFAM", "controlExtrasistema")}
                  </div>
                </section>

                <section id="sec-habitos-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Hábitos</h3>
                  {habitosCheckboxConfig.map(renderCheckboxClarificationField)}

                  <div className="flex items-end gap-3 mb-0">
                    <div className="flex-grow">
                      <label htmlFor="actividadFisicaHabito" className="block text-sm font-medium text-slate-700 mb-1.5">Actividad Física</label>
                      {isActividadFisicaLibre ? (
                        <input
                          type="text"
                          name="actividadFisicaHabito"
                          value={formData.actividadFisicaHabito || ''}
                          onChange={handleChange as any}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-700"
                          placeholder="Describa actividad física..."
                        />
                      ) : (
                        <select
                          id="actividadFisicaHabito"
                          name="actividadFisicaHabito"
                          value={formData.actividadFisicaHabito || ''}
                          onChange={handleChange}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm font-normal"
                        >
                          {actividadFisicaOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${isActividadFisicaLibre ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                        <input
                          type="checkbox"
                          checked={isActividadFisicaLibre}
                          onChange={(e) => {
                            setIsActividadFisicaLibre(e.target.checked);
                            if (!e.target.checked) setFormData(prev => ({ ...prev, actividadFisicaHabito: '' }));
                          }}
                          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Redactar</span>
                      </label>
                    </div>
                  </div>

                  <FormField label="Hábito Miccional" id="habitoMiccional" name="habitoMiccional" value={formData.habitoMiccional || ''} onChange={handleChange} />
                  <FormField label="Hábito Defecatorio" id="habitoDefecatorio" name="habitoDefecatorio" value={formData.habitoDefecatorio || ''} onChange={handleChange} />
                  <FormField label="Actividad Sexual (medidas de protección)" id="actividadSexualProteccion" name="actividadSexualProteccion" value={formData.actividadSexualProteccion || ''} onChange={handleChange} isTextArea rows={2} />
                </section>

                {formData.sexo === 'Femenino' && (
                  <section id="sec-gineco-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Gineco-Obstetricia</h3>
                    <FormField label="Antecedentes Gineco-Obstétricos" id="antecedentesGineco" name="antecedentesGineco" value={formData.antecedentesGineco || ''} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="FUM (Fecha Última Menstruación)" id="fum" name="fum" value={formData.fum || ''} onChange={handleChange} placeholder="Ej: 15-05-2023 o 'Hace 2 meses'" />
                    <FormField label="Síntomas Climaterio" id="sintomasClimaterio" name="sintomasClimaterio" value={formData.sintomasClimaterio || ''} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Mamografía al día" id="mamografiaDia" name="mamografiaDia" value={formData.mamografiaDia || ''} onChange={handleChange} placeholder="Sí/No o fecha último examen" />
                    <FormField label="PAP Vigente" id="papVigente" name="papVigente" value={formData.papVigente || ''} onChange={handleChange} placeholder="Sí/No o fecha último examen" />
                  </section>
                )}

                <section id="sec-atenciones-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4"><h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Atenciones Vigentes</h3>
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
                          value={(formData[field.name as keyof FichaPreingresoEcicepFormData] as string) || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                          placeholder={field.placeholder}
                          disabled={formData[field.name as keyof FichaPreingresoEcicepFormData] === 'No aplica.'}
                          options={field.options}
                        />
                      </div>
                      {/* Botón N/A: altura fija que coincide con el bloque de texto por defecto, no crece */}
                      <div className="flex-shrink-0 self-start mt-[26px]">
                        <button
                          type="button"
                          onClick={() => {
                            const isNA = formData[field.name as keyof FichaPreingresoEcicepFormData] === 'No aplica.';
                            setFormData(prev => ({ ...prev, [field.name]: isNA ? '' : 'No aplica.' }));
                          }}
                          className={`flex flex-col items-center justify-center gap-0.5 w-10 h-[60px] rounded-lg border transition-colors select-none ${formData[field.name as keyof FichaPreingresoEcicepFormData] === 'No aplica.' ? 'bg-sky-500 border-sky-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:border-sky-300 hover:text-sky-500'}`}
                        >
                          <span className="text-[9px] font-black uppercase leading-none">N/A</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.sexo === 'Masculino' && (
                    <FormField label="PSA" id="atencionesPsa" name="atencionesPsa" value={formData.atencionesPsa || ''} onChange={handleChange} placeholder="Resultado o fecha" />
                  )}
                  <FormField label="Vacunas" id="vacunas" name="vacunas" value={formData.vacunas || ''} onChange={handleChange} />
                </section>

                <section id="sec-alimentacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Alimentación</h3>
                  <SmartDietaTextarea
                    label="Encuesta alimentaria"
                    id="encuestaAlimentaria"
                    name="encuestaAlimentaria"
                    value={formData.encuestaAlimentaria || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, encuestaAlimentaria: val }))}
                    rows={10}
                  />
                </section>

                <section id="sec-animo-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Ánimo</h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsPhq9ModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out"
                    >
                      Evaluar PHQ-9
                    </button>
                    <FormField label="Estado anímico" id="animo_stateAnimo" name="animo_estadoAnimo" value={formData.animo_estadoAnimo || ''} onChange={handleChange} isTextArea rows={2} placeholder="Describir estado anímico..." />
                    <FormField label="Hábito de sueño" id="animo_habitoSueno" name="animo_habitoSueno" value={formData.animo_habitoSueno || ''} onChange={handleChange} isTextArea rows={2} placeholder="Describir hábito de sueño..." />
                    <FormField label="Percepción del estado de salud" id="animo_percepcionSalud" name="animo_percepcionSalud" value={formData.animo_percepcionSalud || ''} onChange={handleChange} isTextArea rows={2} placeholder="Describir percepción del estado de salud..." />
                    {renderAnimoSuicidaCheckbox()}
                    <div className="mt-2">
                      <div className="flex items-end gap-3 mb-0">
                        <div className="flex-grow">
                          <label htmlFor="espiritualidad" className="block text-sm font-medium text-slate-700 mb-1.5">Espiritualidad</label>
                          {isEspiritualidadLibre ? (
                            <input
                              type="text"
                              name="espiritualidad"
                              value={formData.espiritualidad || ''}
                              onChange={handleChange as any}
                              className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-700"
                              placeholder="Espiritualidad personalizada..."
                            />
                          ) : (
                            <select
                              id="espiritualidad"
                              name="espiritualidad"
                              value={formData.espiritualidad === 'Otra' || formData.espiritualidad.startsWith('Otra') ? 'Otra' : formData.espiritualidad || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ ...prev, espiritualidad: val }));
                              }}
                              className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm font-normal"
                            >
                              {espiritualidadOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${isEspiritualidadLibre ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                            <input
                              type="checkbox"
                              checked={isEspiritualidadLibre}
                              onChange={(e) => {
                                setIsEspiritualidadLibre(e.target.checked);
                                if (!e.target.checked) setFormData(prev => ({ ...prev, espiritualidad: '' }));
                              }}
                              className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                            />
                            <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Redactar</span>
                          </label>
                        </div>
                      </div>

                      {!isEspiritualidadLibre && formData.espiritualidad.startsWith('Otra') && (
                        <FormField
                          label="Aclare Espiritualidad"
                          id="espiritualidadAclaracion"
                          name="espiritualidadAclaracion"
                          value={formData.espiritualidad.includes('(') ? formData.espiritualidad.split('(')[1].replace(')', '') : ''}
                          onChange={(e) => {
                            const detail = e.target.value;
                            setFormData(prev => ({ ...prev, espiritualidad: `Otra (${detail})` }));
                          }}
                          placeholder="Especifique creencia..."
                          containerClassName="mt-2"
                        />
                      )}
                    </div>
                    <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg">
                      <h4 className="text-md font-semibold text-sky-800">Resumen PHQ-9</h4>
                      {isPhq9Completed ? (
                        <>
                          <p className="text-slate-700 text-sm"><strong>Puntaje Total:</strong> <span className="font-bold">{phq9Interpretation.score}</span></p>
                          <p className="text-slate-700 text-sm"><strong>Nivel de Severidad:</strong> <span className="font-bold">{phq9Interpretation.severity}</span></p>
                          {(parseInt(formData.phq9_suicidio, 10) || 0) > 0 && (
                            <p className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md font-semibold text-xs">
                              ¡ATENCIÓN! Respuesta positiva a ideación suicida. Evaluar riesgo y tomar medidas inmediatas según protocolo.
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section id="sec-dimension-social-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Dimensión Social, Familiar y Comunitaria</h3>
                  <div className="flex items-end gap-3 mb-0">
                    <div className="flex-grow">
                      <label htmlFor="escolaridad" className="block text-sm font-medium text-slate-700 mb-1.5">Escolaridad</label>
                      {isEscolaridadLibre ? (
                        <input
                          type="text"
                          name="escolaridad"
                          value={formData.escolaridad || ''}
                          onChange={handleChange as any}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm"
                          placeholder="Escolaridad personalizada..."
                        />
                      ) : (
                        <select
                          id="escolaridad"
                          name="escolaridad"
                          value={formData.escolaridad || ''}
                          onChange={handleChange}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm"
                        >
                          {escolaridadOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${isEscolaridadLibre ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                        <input
                          type="checkbox"
                          checked={isEscolaridadLibre}
                          onChange={(e) => {
                            setIsEscolaridadLibre(e.target.checked);
                            if (!e.target.checked) setFormData(prev => ({ ...prev, escolaridad: '' }));
                          }}
                          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Redactar</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mb-0">
                    <div className="flex-grow">
                      <label htmlFor="ocupacion" className="block text-sm font-medium text-slate-700 mb-1.5">Ocupación</label>
                      {isOcupacionLibre ? (
                        <input
                          type="text"
                          name="ocupacion"
                          value={formData.ocupacion || ''}
                          onChange={handleChange as any}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm"
                          placeholder="Ocupación personalizada..."
                        />
                      ) : (
                        <select
                          id="ocupacion"
                          name="ocupacion"
                          value={formData.ocupacion.startsWith('Trabajador') ? formData.ocupacion.split(' (')[0] : formData.ocupacion || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({ ...prev, ocupacion: val }));
                          }}
                          className="w-full px-4 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm"
                        >
                          {ocupacionOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${isOcupacionLibre ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                        <input
                          type="checkbox"
                          checked={isOcupacionLibre}
                          onChange={(e) => {
                            setIsOcupacionLibre(e.target.checked);
                            if (!e.target.checked) setFormData(prev => ({ ...prev, ocupacion: '' }));
                          }}
                          className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Redactar</span>
                      </label>
                    </div>
                  </div>

                  {!isOcupacionLibre && formData.ocupacion.startsWith('Trabajador') && (
                    <FormField
                      label="Aclare Ocupación"
                      id="ocupacionAclaracion"
                      name="ocupacionAclaracion"
                      value={formData.ocupacion.includes('(') ? formData.ocupacion.split('(')[1].replace(')', '') : ''}
                      onChange={(e) => {
                        const detail = e.target.value;
                        const base = formData.ocupacion.split(' (')[0];
                        setFormData(prev => ({ ...prev, ocupacion: `${base} (${detail})` }));
                      }}
                      placeholder="Especifique labor..."
                      containerClassName="mt-1 mb-0"
                    />
                  )}

                  <FormField label="Antecedentes familiares relevantes" id="antecedentesFamiliaresRelevantes" name="antecedentesFamiliares" value={formData.antecedentesFamiliares || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon || ''} onChange={handleChange} />
                  <FormField label="Factores protectores" id="factoresProtectores" name="factoresProtectores" value={formData.factoresProtectores || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Estado civil/hijos" id="estadoCivilHijos" name="estadoCivilHijos" value={formData.estadoCivilHijos || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Redes de apoyo" id="redesApoyo" name="redesApoyo" value={formData.redesApoyo || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Percepción de situación económica" id="percepcionSituacionEconomica" name="percepcionEconomica" value={formData.percepcionEconomica || ''} onChange={handleChange} />


                </section>

                <section id="sec-contacto-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Datos de Contacto</h3>
                  <div className="flex items-center gap-2">
                    <select name="telefonoPrefijo" value={formData.telefonoPrefijo} onChange={handleChange} className="px-3 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-800 font-medium h-[42px] focus:ring-2 focus:ring-sky-500 outline-none">
                      <option value="+569" className="text-slate-800">+569</option>
                      <option value="+56 2" className="text-slate-800">+56 2</option>
                    </select>
                    <input type="text" name="telefonoNumero" value={formData.telefonoNumero} onChange={handleChange as any} maxLength={8} className="flex-grow px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder:opacity-50 font-medium h-[42px] outline-none" placeholder="12345678" />
                  </div>
                </section>

                <section id="sec-examenes-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-sky-700">Exámenes (Laboratorio)</h3>
                    <button
                      type="button"
                      onClick={() => labFileRef.current?.click()}
                      disabled={isLabLoading || loggedInUser?.profession !== 'medicina'}
                      className="flex items-center px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black rounded-md hover:bg-sky-200 disabled:bg-slate-200 uppercase"
                    >
                      {isLabLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                    <input type="file" ref={labFileRef} onChange={handleLabFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {labError && <p className="text-red-500 text-xs mt-1 mb-2">{labError}</p>}
                  <DateField label="Fecha Exámenes" id="examenesFecha" name="examenesFecha" value={formData.examenesFecha} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="" id="examenes" name="examenes" value={formData.examenes} onChange={handleChange as any} isTextArea rows={4} placeholder="Detallar resultados de exámenes relevantes..." inputClassName="text-black" />

                  {/* EKG */}
                  <div className="flex justify-between items-center mt-6 mb-2 border-t border-slate-100 pt-4">
                    <h3 className="text-lg font-semibold text-sky-700">EKG</h3>
                    <button
                      type="button"
                      onClick={() => ekgFileRef.current?.click()}
                      disabled={isEkgLoading || loggedInUser?.profession !== 'medicina'}
                      className="flex items-center px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black rounded-md hover:bg-sky-200 disabled:bg-slate-200 uppercase"
                    >
                      {isEkgLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                    <input type="file" ref={ekgFileRef} onChange={handleEkgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {ekgError && <p className="text-red-500 text-xs mt-1 mb-2">{ekgError}</p>}
                  <DateField label="Fecha EKG" id="ekgFecha" name="ekgFecha" value={formData.ekgFecha} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="" id="ekgResultados" name="ekgResultados" value={formData.ekgResultados} onChange={handleChange as any} isTextArea rows={3} placeholder="Detallar resultados de EKG..." inputClassName="text-black" />

                  {/* Otras Imágenes */}
                  <div className="flex justify-between items-center mt-6 mb-2 border-t border-slate-100 pt-4">
                    <h3 className="text-lg font-semibold text-sky-700">Otras Imágenes</h3>
                    <button
                      type="button"
                      onClick={() => imgFileRef.current?.click()}
                      disabled={isImgLoading || loggedInUser?.profession !== 'medicina'}
                      className="flex items-center px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black rounded-md hover:bg-sky-200 disabled:bg-slate-200 uppercase"
                    >
                      {isImgLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                    <input type="file" ref={imgFileRef} onChange={handleImgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>
                  {imgError && <p className="text-red-500 text-xs mt-1 mb-2">{imgError}</p>}
                  <DateField label="Fecha Otras Imágenes" id="otrasImagenesFecha" name="otrasImagenesFecha" value={formData.otrasImagenesFecha} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="" id="otrasImagenesResultados" name="otrasImagenesResultados" value={formData.otrasImagenesResultados || ''} onChange={handleChange as any} isTextArea rows={3} placeholder="Detallar resultados de otras imágenes..." inputClassName="text-black" />
                </section>

                <section id="sec-valoracion-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">VALORACIÓN INTEGRAL</h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="integralIndividual" className="block text-sm font-medium text-slate-700 mb-1.5">Ciclo vital individual:</label>
                      <select
                        id="integralIndividual"
                        name="integralIndividual"
                        value={formData.integralIndividual || ''}
                        onChange={handleChange}
                        className="w-full px-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-800 h-[42px] text-sm font-sans leading-normal"
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
                        onChange={handleChange}
                        className="w-full px-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-800 h-[42px] text-sm font-sans leading-normal"
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
                        onChange={handleChange}
                        className="w-full px-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-800 h-[42px] text-sm font-sans leading-normal"
                      >
                        <option value="">Seleccione...</option>
                        {tipologiaFamiliarOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <FormField label="Condiciones crónicas y problemáticas" id="integralCronicas" name="integralCronicas" value={formData.integralCronicas || ''} onChange={handleChange} isTextArea rows={2} placeholder="Describir condiciones crónicas y problemáticas..." />
                  </div>
                </section>

                <section id="sec-gestion-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-0">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Gestión de ingreso ECICEP</h3>
                  {renderRadioGroup("Estado de Ingreso", "gestionIngresoEstado", [{ value: "Ingresa a ECICEP", label: "Ingresa a ECICEP" }, { value: "No se ingresa", label: "No se ingresa" }])}
                  {formData.gestionIngresoEstado === 'Ingresa a ECICEP' && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="gestionIngresoMes" className="block text-sm font-medium text-slate-700 mb-1.5">Mes</label>
                          <select id="gestionIngresoMes" name="gestionIngresoMes" value={formData.gestionIngresoMes} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm h-[42px] text-slate-800 font-sans font-normal focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="" className="text-slate-400">Seleccione...</option>
                            {mesesOptions.map(m => <option key={m} value={m} className="text-slate-800">{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="gestionIngresoPunto" className="block text-sm font-medium text-slate-700 mb-1.5">Momento</label>
                          <select id="gestionIngresoPunto" name="gestionIngresoPunto" value={formData.gestionIngresoPunto} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm h-[42px] text-slate-800 font-sans font-normal focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="" className="text-slate-400">Seleccione...</option>
                            {puntoMesOptions.map(p => <option key={p.value} value={p.value} className="text-slate-800">{p.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="gestionIngresoDupla" className="block text-sm font-medium text-slate-700 mb-1.5">Dupla</label>
                          <select id="gestionIngresoDupla" name="gestionIngresoDupla" value={formData.gestionIngresoDupla} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm h-[42px] text-slate-800 font-sans font-normal focus:ring-2 focus:ring-sky-500 outline-none">
                            <option value="" className="text-slate-400">Seleccione...</option>
                            {duplaOptions.map(d => <option key={d} value={d} className="text-slate-800">{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section id="sec-indicaciones-pre" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-0">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Indicaciones</h3>
                  <FormField label="" id="indicaciones" name="indicaciones" value={formData.indicaciones} onChange={handleChange as any} isTextArea rows={8} inputClassName="!text-slate-800 placeholder:opacity-50 font-sans text-sm leading-normal" />
                </section>
              </form>
          </div>

          {/* Columna Derecha: Resumen Sticky - igual que FichaIngresoEcicep */}
          <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
            {/* Tarjeta de Resumen 1/3 más alta */}
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

            {/* Botones de Acción: EXPORTAR PDF, PLANILLA DRIVE, NUEVO PREINGRESO, REGISTRAR REM */}
            <div className="grid grid-cols-2 gap-1.5 w-full shrink-0">
              <button
                type="button"
                onClick={handleExportPdf}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Exportar Ficha Clínica PDF"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">EXPORTAR PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDriveEdit}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Abrir Planilla Drive ECICEP"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">PLANILLA DRIVE</span>
              </button>

              <button
                type="button"
                onClick={handleNewDocument}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Limpiar Formulario y Crear Nuevo"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">NUEVO FORM</span>
              </button>

              <button
                type="button"
                onClick={handleRemClick}
                className={`w-full flex items-center justify-center gap-1 px-1 py-1.5 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden ${showRemActive ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                title="Registrar en REM"
              >
                <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{showRemActive ? '¡REGISTRADO!' : 'REGISTRAR REM'}</span>
              </button>
            </div>
          </div>
        </div>

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onConfirmImport={handleAiImport}
          isImporting={isAiImporting}
          title="Importar desde Registro Anterior"
          description="Pegue aquí el texto de un registro previo (morbilidad o cardiovascular) para autocompletar la ficha."
        />

        <EcicepRiskCalculatorModal
          isOpen={isRiskCalculatorOpen}
          onClose={() => setIsRiskCalculatorOpen(false)}
          onCalculate={(result) => setFormData(prev => ({ ...prev, estratificacion: result }))}
        />
        <FactoresRiesgoModal
          isOpen={isFactoresRiesgoModalOpen}
          onClose={() => setIsFactoresRiesgoModalOpen(false)}
          selectedFactors={formData.factoresRiesgo || []}
          onChange={(factors) => setFormData(prev => ({ ...prev, factoresRiesgo: factors }))}
        />
        <PHQ9Modal
          isOpen={isPhq9ModalOpen}
          onClose={() => setIsPhq9ModalOpen(false)}
          formData={formData}
          handleRadioChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        />
      </div>
    </>
  );
};

const FactoresRiesgoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedFactors: string[];
  onChange: (factors: string[]) => void;
}> = ({ isOpen, onClose, selectedFactors, onChange }) => {
  if (!isOpen) return null;

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      onChange(selectedFactors.filter(f => f !== factor));
    } else {
      onChange([...selectedFactors, factor]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-200 flex justify-between items-center bg-red-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
            <AlertTriangle size={24} />
            Factores de Riesgo
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-4 italic">
            Seleccione los factores de riesgo identificados en la evaluación:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FACTORES_RIESGO_OPTIONS.map(factor => (
              <label key={factor} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedFactors.includes(factor) ? 'bg-red-50 border-red-200 text-red-900 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <input
                  type="checkbox"
                  checked={selectedFactors.includes(factor)}
                  onChange={() => toggleFactor(factor)}
                  className="h-5 w-5 text-red-600 border-slate-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium leading-tight">{factor}</span>
              </label>
            ))}
          </div>
        </main>

        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            Confirmar Selección
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FichaPreingresoEcicep;

