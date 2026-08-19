import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FichaIngresoEcicepFormData, FormStatus, User, PccObjetivo, Profession } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import AvisHojaRutaWizard from './AvisHojaRutaWizard';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import PHQ9Modal from './PHQ9Modal';
import RutInput from './RutInput';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { AlertTriangle, X, Printer, ExternalLink, Trash2 } from 'lucide-react';
import CopyButton from './CopyButton';
import { generateClinicalRecordPdf, generateEcicepResumenPdf } from '../services/pdfGenerator';
import ImportModal from './ImportModal';
import EcicepRiskCalculatorModal from './EcicepRiskCalculatorModal';
import UserAutocomplete from './UserAutocomplete';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import SmartAtencionVigenteInput, { SmartAtencionOption, stripStatusBracket } from './SmartAtencionVigenteInput';
import BorgScaleModal from './BorgScaleModal';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import SmartDietaTextarea from './SmartDietaTextarea';
import { patientStore, PatientRecord } from '../services/patientStore';

const MsnMessengerIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0.5">
    <path d="M12 2C9.24 2 7 4.24 7 7c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.76-2.24-5-5-5zm0 12c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
  </svg>
);

const FloppyDiskIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H6V5h9v4z"/>
  </svg>
);

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

const professionLabels: Record<Profession, string> = {
  medicina: 'Médico',
  enfermeria: 'Enfermera/o',
  nutricion: 'Nutricionista',
  psicologia: 'Psicóloga',
  kinesiologo: 'Kinesiólogo',
  matroneria: 'Matrona',
  tens: 'TENS',
  quimico_farmaceutico: 'Químico farmacéutico',
  asistente_social: 'Asistente social',
  odontologia: 'Odontólogo',
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

const initialExamenFisicoText = `- Buenas condiciones generales.
- Hidratado, bien perfundido.
- Faringe sin lesiones.
- Cuellos sin adenopatías palpables, yugulares planas.
- Cardiovascular: RR2T, SS.
- Pulmonar: MP(+) SRA.
- Abdomen: RHA (+), blando, deprimible, indoloro, sin signos de irritación peritoneal.
- Extremidades: EEII simétricas, sin edema, sin signos de TVP. Sensibilidad (+), bien perfundido a distal. Sin lesiones.
- Neurológico: Conservado, GCS 15/15.`;

const initialIndicaciones = `- Se solicitan exámenes.
- Se renueva su receta crónica.
- Traer exámenes extrasistema y documentos importantes.
- Traer medicamentos (para verificar).`;

const todayDDMMYYYY = (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`; })();

const initialFormData: FichaIngresoEcicepFormData = {
  fechaIngreso: todayDDMMYYYY,
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
  anamnesisGeneral: 'Paciente asiste acompañado/a a control, vestido/a acorde a la ocasión, orientado/a en tiempo, espacio y persona (TEP).',
  antecedentesPersonales: '',
  morbilidad: '',
  farmacos: '',
  adherenciaTratamiento: 'Sí',
  ramFarmacos: 'No',
  ramFarmacosAclaracion: '',
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
  vacunas: 'Esquema de vacunación 2026 vigente.',
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
  actividadFisicaHabito: 'Sin actividad física.',
  habitoMiccional: 'Diuresis espontánea, normocuantitativa, sin disuria ni alteraciones referidas.',
  habitoDefecatorio: 'Catarsis conservada, deposiciones habituales, sin diarrea ni constipación.',
  actividadSexualProteccion: '',
  encuestaAlimentaria: '- PAN: \n- LÍQUIDOS: \n- LÁCTEOS: \n- INFUSIONES: \n- AZÚCAR: \n- FRUTAS: \n- ENSALADAS: \n- ARROZ/FIDEOS: \n- GOLOSINAS: \n',
  estadoSueno: 'Conservado.',
  horasSueno: '',
  dificultadConciliacion: 'Niega.',
  dificultadMantencion: 'Niega.',

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

  escolaridad: '',
  ocupacion: '',
  antecedentesFamiliaresRelevantes: '',
  viveCon: '',
  factoresProtectores: '',
  estadoCivilHijos: '',
  redesApoyo: 'Familiares directos y personas cercanas.',
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
  borgScaleResult: '',

  integralIndividual: '',
  integralFamiliar: '',
  integralTipologia: 'Familia nuclear: Padres e hijos viviendo juntos, la forma más tradicional.',
  integralCronicas: '',

  pccPersonaFamilia: '',
  pccEquipoSalud: '',
  tomaDecisionesCompartidas: '1. ',
  opcionesConversadas: '',
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

  indicaciones: initialIndicaciones,
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
  sm_sintoma_animo: 'Eutímico.',
  sm_sintoma_ansiosos: 'Niega.',
  sm_sintoma_somatizaciones: 'Niega.',
  sm_sintoma_sueno: 'Niega.',
  sm_sintoma_psicoticos: 'Niega.',
  sm_sintoma_suicidio: 'Niega.',
  sm_em_descripcion: 'Apariencia acorde a edad, vestido e higiene adecuados. Postura y actividad motora normales. Expresión facial y contacto ocular apropiados. Colaborador, actitud abierta con el entrevistador.',
  sm_em_conciencia: 'Vigil; orientado en persona, lugar, tiempo y situación. Memoria inmediata, reciente y remota conservadas.',
  sm_em_lenguaje: 'Espontáneo, fluido, bien articulado, comprensible. Sin parafasias ni afasia. Comprensión adecuada.',
  sm_em_psicomotricidad: 'Sin agitación ni retardo; sin movimientos anormales; inicia y mantiene conductas dirigidas a metas.',
  sm_em_pensamiento: 'Producción adecuada, curso lógico, lineal y dirigido a objetivo. Sin ideas delirantes, obsesivas, fóbicas ni ideación suicida/homicida.',
  sm_em_percepcion: 'Niega alucinaciones; no se observan respuestas a estímulos internos.',
  sm_em_intelectual: 'Atención y concentración conservadas. Abstracción y conocimientos generales acordes a escolaridad.',
  sm_em_juicio: 'Interpretación adecuada de situaciones y consecuencias. Toma de decisiones adaptativa.',
  sm_em_insight: 'Reconoce sus dificultades de salud, la necesidad de tratamiento y acepta recomendaciones.',
  // Hipotiroidismo
  hipo_sintoma_astenias: false,
  hipo_sintoma_somnolencia: false,
  hipo_sintoma_constipacion: false,
  hipo_sintoma_intolerancia_frio: false,
  hipo_sintoma_edema: false,
  hipo_sintoma_aumento_peso: false,
  hipo_sintoma_piel_seca: false,
  hipo_sintoma_caida_cabello: false,
  hipo_sintoma_calambres: false,
  hipo_tsh_fecha: '',
  hipo_tsh_resultado: '',
  hipo_t4l_resultado: '',
  hipo_adherencia_levotiroxina: 'Sí',
  hipo_ayuno_correcto: 'Sí',
  hipo_farmacos_interferentes: 'Niega',
  hipo_observaciones: '',
  // Artrosis
  art_articulaciones_afectadas: '',
  art_dolor_eva: '',
  art_limitacion_funcional: '',
  art_uso_analgesicos: 'Sí',
  art_analgesicos_cuales: '',
  art_kinesiterapia: 'No',
  art_ayudas_tecnicas: 'No',
  art_ayudas_tecnicas_cuales: '',
  art_radiografia_fecha: '',
  art_radiografia_resultado: '',
  art_observaciones: '',
  // Epilepsia
  epi_tipo_crisis: '',
  epi_ultima_crisis_fecha: '',
  epi_frecuencia_crisis: '',
  epi_farmaco_antiepiléptico: '',
  epi_adherencia: 'Sí',
  epi_niveles_plasmaticos_fecha: '',
  epi_niveles_plasmaticos_resultado: '',
  epi_efectos_secundarios: 'Niega',
  epi_restricciones_conduccion: 'Sí',
  epi_observaciones: '',
  // Sala IRA
  ira_diagnostico: '',
  ira_sintoma_tos: false,
  ira_sintoma_fiebre: false,
  ira_sintoma_rinorrea: false,
  ira_sintoma_odinofagia: false,
  ira_sintoma_disnea: false,
  ira_saturacion: '',
  ira_fr: '',
  ira_uso_broncodilatador: 'No',
  ira_broncodilatador_cual: '',
  ira_nebulizacion: 'No',
  ira_rx_torax: 'No realizada',
  ira_rx_resultado: '',
  ira_observaciones: '',
  // Demencias
  dem_diagnostico: '',
  dem_estadio: '',
  dem_mmse_fecha: '',
  dem_mmse_puntaje: '',
  dem_barthel_puntaje: '',
  dem_cuidador_principal: '',
  dem_sobrecarga_cuidador: 'No',
  dem_sintoma_deambulacion: false,
  dem_sintoma_alimentacion: false,
  dem_sintoma_continencia: false,
  dem_sintoma_conductas: false,
  dem_sintoma_agitacion: false,
  dem_farmaco_antidemencia: '',
  dem_adherencia: 'Sí',
  dem_derivacion_especialidad: 'No',
  dem_observaciones: '',
};

const actividadFisicaOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Sin actividad física.', label: 'Sin actividad física.' },
  { value: 'Ejercicio ligero: Elongamiento, caminata suave.', label: 'Ejercicio ligero: Elongamiento, caminata suave.' },
  { value: 'Ejercicio moderado: Rutinas de ejercicio y/o asiste a gimnasio.', label: 'Ejercicio moderado: Rutinas de ejercicio y/o asiste a gimnasio.' },
  { value: 'Ejercicio intenso: Calistenia, cardiovascular, musculación.', label: 'Ejercicio intenso: Calistenia, cardiovascular, musculación.' },
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
  { value: 'Dueña/o de casa.', label: 'Dueña/o de casa.' },
];

const espiritualidadOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Ateo/agnóstico.', label: 'Ateo/agnóstico.' },
  { value: 'Cristiano.', label: 'Cristiano.' },
  { value: 'Católico.', label: 'Católico.' },
  { value: 'Evangélico.', label: 'Evangélico.' },
  { value: 'Mormón.', label: 'Mormón.' },
  { value: 'Testigo de Jehová.', label: 'Testigo de Jehová.' },
  { value: 'Adventista.', label: 'Adventista.' },
  { value: 'Bahái.', label: 'Bahái.' },
  { value: 'Iglesia de Jesucristo de los Santos de los Últimos Días.', label: 'Iglesia de Jesucristo de los Santos de los Últimos Días.' },
  { value: 'Islam.', label: 'Islam.' },
  { value: 'Judaísmo.', label: 'Judaísmo.' },
  { value: 'Otra', label: 'Otra' },
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
  "Deficiencia red de apoyo comunitario",
  "Entorno social de riesgo",
  "Deficiencias saneamiento básico",
  "Deficiencia equipamiento urbano y comunitario",
  "Sobreendeudamiento",
  "Estrés laboral",
  "Disfunción laboral",
  "Sedentarismo",
  "Tabaquismo"
];

interface PlanCheckboxEcicepConfig {
  key: keyof FichaIngresoEcicepFormData;
  label: string;
  textPrefix: string;
  detailKey?: keyof FichaIngresoEcicepFormData;
  detailPlaceholder?: string;
  textSuffix?: string;
}

interface CheckboxClarificationItem {
  keyBase: keyof FichaIngresoEcicepFormData;
  label: string;
}

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

const processFile = async (
  file: File,
  analysisType: 'laboratorio' | 'imagenes',
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  onSuccess: (result: { text: string; date?: string }) => void
) => {
  setIsLoading(true);
  setError(null);

  const supportedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const mimeType = file.type || 'application/pdf';
  if (!supportedMimeTypes.includes(mimeType)) {
    setError('Tipo de archivo no soportado. Por favor suba un PDF o una imagen (JPEG, PNG).');
    setIsLoading(false);
    return;
  }

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
          mimeType: mimeType,
          data: base64Data,
        },
      };

      let prompt = '';
      if (analysisType === 'laboratorio') {
        prompt = `Analiza los resultados de exámenes de laboratorio del documento adjunto y genera un resumen limpio para una ficha clínica. Sigue estas reglas ESTRICTAMENTE:
1. EXTRAE la fecha del examen del documento. Formatea esto como la primera línea de la respuesta: FECHA_EXAMEN: DD/MM/AAAA.
2. OMITE CUALQUER DATO DEL PACIENTE (nombre, RUT, edad, etc.).
3. Para cada examen, formatea la salida en una nueva línea como: NOMBRE_EXAMEN_EN_MAYUSCULAS: [SÍMBOLO] VALOR UNIDADES.
4. Usa abreviaciones comunes para los nombres de los exámenes cuando sea posible (ej. CREATI para Creatinina).
5. OMITE POR COMPLETO los rangos de referencia. No los incluyas en la salida.
6. NO uses viñetas ni guiones.
7. Compara cada valor con su rango de referencia. Si el valor está POR ENCIMA del rango normal, precede el valor con el símbolo "↑". Si está POR DEBAJO del rango normal, precede el valor con el símbolo "↓". Si el valor está dentro del rango normal, no agregues ningún símbolo.
8. OMITE CUALQUER TÍTULO DE CATEGORÍA de examen (como "EXÁMENES BIOQUÍMICOS", "HEMOGRAMA", etc.). Solo incluye las líneas de resultados individuales.

Ejemplo de formato de salida deseado:
FECHA_EXAMEN: 01/01/2023
CREATI: 0.72 mg/dL
VFG: 104.2 ml/min/1.73m2
GLICEMIA: ↑103 mg/dL
POTASIO: ↓3.2 mEq/L`;
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
        model: 'llama3-70b-8192',
        contents: [{ parts: [filePart, textPart] }],
      });

      const resultText = response.text || '';

      let extractedDate: string | undefined = undefined;

      if (analysisType === 'laboratorio' && resultText) {
        const dateRegex = /FECHA_EXAMEN: (\d{1,2}\/\d{1,2}\/\d{4})/;
        const match = resultText.match(dateRegex);
        if (match && match[1]) {
          const [day, month, year] = match[1].split('/');
          const paddedDay = day.padStart(2, '0');
          const paddedMonth = month.padStart(2, '0');
          extractedDate = `${year}-${paddedMonth}-${paddedDay}`;
        }
        // Remove the date line from the resultText before passing it to onSuccess
        const cleanedText = resultText.replace(/FECHA_EXAMEN: \d{1,2}\/\d{1,2}\/\d{4}\n?/, '').trim();
        onSuccess({ text: cleanedText, date: extractedDate });
      } else if (analysisType === 'imagenes' && resultText) {
        const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})/;
        const match = resultText.match(dateRegex);
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

const duplaProfesionalOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Enfermera', label: 'Enfermera/o' },
  { value: 'Nutricionista', label: 'Nutricionista' },
  { value: 'Psicóloga', label: 'Psicóloga' },
  { value: 'Kinesiólogo', label: 'Kinesiólogo' },
  { value: 'Matrona', label: 'Matrona' },
  { value: 'TENS', label: 'TENS' },
  { value: 'Químico farmacéutico', label: 'Químico farmacéutico' },
  { value: 'Asistente social', label: 'Asistente social' },
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
    acciones: 'Horario regular para dormir/levantarse, evitar pantallas 1-2 h antes de dormir, reducir cafeína nocturna, ambiente oscuro/silencioso, evitar siestas prolongadas.',
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
    acciones: 'Practicar técnicas de relajación/respiración 10-15 min diarios, actividades recreativas, organizar rutinas, consultar ante empeoramiento del ánimo o ansiedad.',
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
    acciones: 'Reducir sal (<5 g/día), adherir a fármacos, actividad física regular, control domiciliario 2-3 veces/semana, consultar ante cifras elevadas persistentes.',
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

const planCheckboxItemsEcicepConfig: PlanCheckboxEcicepConfig[] = [
  { key: 'planEcicepLabsRutina', label: 'Laboratorios de Rutina', textPrefix: '- Solicito laboratorios de rutina.' },
  { key: 'planEcicepEKG', label: 'EKG', textPrefix: '- Solicito EKG.' },
  { key: 'planEcicepHBA1C', label: 'HBA1C', textPrefix: '- Solicito Hemoglobina Glicosilada, realizar en ', detailKey: 'planEcicepHBA1CTiempo', detailPlaceholder: 'X meses (o según meta)', textSuffix: '.' },
  { key: 'planEcicepFondoOjo', label: 'Fondo de ojo', textPrefix: '- Solicito Fondo de ojo.' },
  { key: 'planEcicepCtrlPiesEnf', label: 'Control de pies (Enf.)', textPrefix: '- Derivo a control de pies con Enfermera.' },
  { key: 'planEcicepInterconsulta', label: 'Interconsulta', textPrefix: '- Solicito interconsulta con ', detailKey: 'planEcicepInterconsultaEspecialidad', detailPlaceholder: 'especialidad', textSuffix: '.' },
];

const habitosCheckboxConfig: CheckboxClarificationItem[] = [
  { keyBase: 'alcohol', label: 'Alcohol' },
  { keyBase: 'tabaco', label: 'Tabaco' },
  { keyBase: 'drogas', label: 'Drogas' },
];

// Icon helper for antecedentes section labels (matching title/label color text-slate-700)
const getAntecedentIcon = (label: string) => {
  if (label === 'Alergias') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-700 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
  if (label === 'Cirugías') return (
    /* Cuadrilátero / Cuadrado para Cirugías */
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-700 shrink-0">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M12 9v6" />
    </svg>
  );
  if (label === 'Hospitalizaciones') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-700 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
    </svg>
  );
  if (label === 'Controles fuera de CESFAM') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-700 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  return null;
};

interface FichaIngresoEcicepProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<{
    exportPdf: () => void;
    newForm: () => void;
    imprimirResumen?: () => void;
    editarDrive?: () => void;
  } | null>;
  fechaIngresoProp?: string;
  onFechaIngresoChange?: (val: string) => void;
  patientData?: PatientRecord | null;
}

export const FichaIngresoEcicep: React.FC<FichaIngresoEcicepProps> = ({ onBackToMenu, loggedInUser, actionsRef, fechaIngresoProp, onFechaIngresoChange, patientData }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaIngresoEcicepFormData>('local_FichaIngresoEcicep', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.TextGenerated);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isPhq9ModalOpen, setIsPhq9ModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);
  const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);
  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);
  const [isPredefinedPlanOpen, setIsPredefinedPlanOpen] = useState(false);
  const [isBorgModalOpen, setIsBorgModalOpen] = useState(false);
  const [isFactoresRiesgoModalOpen, setIsFactoresRiesgoModalOpen] = useState(false);
  const [planSearchTerm, setPlanSearchTerm] = useState('');

  const filteredPredefinedPlans = useMemo(() => {
    if (!planSearchTerm.trim()) return predefinedPccPlans;
    const term = planSearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return predefinedPccPlans.filter(p =>
      p.acuerdo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term)
    );
  }, [planSearchTerm]);

  const [isEscolaridadLibre, setIsEscolaridadLibre] = useState(false);
  const [isOcupacionLibre, setIsOcupacionLibre] = useState(false);
  const [isEspiritualidadLibre, setIsEspiritualidadLibre] = useState(false);
  const [isActividadFisicaLibre, setIsActividadFisicaLibre] = useState(false);

  // Modals for Create/Import & Save Patient Ficha
  const [isImportPatientModalOpen, setIsImportPatientModalOpen] = useState(false);
  const [isSavePatientModalOpen, setIsSavePatientModalOpen] = useState(false);
  const [activeImportedPatient, setActiveImportedPatient] = useState<PatientRecord | null>(patientData || null);

  const handleOpenSavePatientModal = () => {
    setIsSavePatientModalOpen(true);
  };

  const handleSelectImportPatient = (patient: PatientRecord, fichaSnapshot?: any) => {
    setFormData(prev => ({
      ...prev,
      // If we have a full ficha snapshot, merge all its fields directly
      ...(fichaSnapshot ? fichaSnapshot : {
        edad: patient.edad || prev.edad,
        sexo: (patient.sexo as any) || prev.sexo,
        antecedentesPersonales: patient.antecedentesPersonales || prev.antecedentesPersonales,
        morbilidad: patient.morbilidad || prev.morbilidad,
        farmacos: patient.farmacos || prev.farmacos,
        alergias: patient.alergias || prev.alergias,
        cirugias: patient.cirugias || prev.cirugias,
        hospitalizaciones: patient.hospitalizaciones || prev.hospitalizaciones,
        ramFarmacos: patient.ramFarmacos || prev.ramFarmacos,
        ramFarmacosAclaracion: patient.ramFarmacosAclaracion || prev.ramFarmacosAclaracion,
        controlExtrasistema: patient.controlExtrasistema || prev.controlExtrasistema,
        adherenciaTratamiento: patient.adherenciaTratamiento || prev.adherenciaTratamiento,
        estratificacion: patient.estratificacion || prev.estratificacion,
        duplaProfesionalOtro: patient.duplaProfesional || prev.duplaProfesionalOtro,
        actividadFisicaHabito: patient.actividadFisicaHabito || prev.actividadFisicaHabito,
        habitoMiccional: patient.habitoMiccional || prev.habitoMiccional,
        habitoDefecatorio: patient.habitoDefecatorio || prev.habitoDefecatorio,
        actividadSexualProteccion: patient.actividadSexualProteccion || prev.actividadSexualProteccion,
        encuestaAlimentaria: patient.encuestaAlimentaria || prev.encuestaAlimentaria,
        empam: patient.empam || prev.empam,
        fondoOjo: patient.fondoOjo || prev.fondoOjo,
        podologo: patient.podologo || prev.podologo,
        evaluacionPie: patient.evaluacionPie || prev.evaluacionPie,
        atencionesPsa: patient.atencionesPsa || prev.atencionesPsa,
        vacunas: patient.vacunas || prev.vacunas,
        antecedentesGineco: patient.antecedentesGineco || prev.antecedentesGineco,
        fum: patient.fum || prev.fum,
        sintomasClimaterio: patient.sintomasClimaterio || prev.sintomasClimaterio,
        mamografiaDia: patient.mamografiaDia || prev.mamografiaDia,
        papVigente: patient.papVigente || prev.papVigente,
        animo_estadoAnimo: patient.animo_estadoAnimo || prev.animo_estadoAnimo,
        animo_habitoSueno: patient.animo_habitoSueno || prev.animo_habitoSueno,
        animo_percepcionSalud: patient.animo_percepcionSalud || prev.animo_percepcionSalud,
        animo_ideacionSuicida: patient.animo_ideacionSuicida || prev.animo_ideacionSuicida,
        espiritualidad: patient.espiritualidad || prev.espiritualidad,
        escolaridad: patient.escolaridad || prev.escolaridad,
        ocupacion: patient.ocupacion || prev.ocupacion,
        antecedentesFamiliaresRelevantes: patient.antecedentesFamiliaresRelevantes || prev.antecedentesFamiliaresRelevantes,
        viveCon: patient.viveCon || prev.viveCon,
        factoresProtectores: patient.factoresProtectores || prev.factoresProtectores,
        estadoCivilHijos: patient.estadoCivilHijos || prev.estadoCivilHijos,
        redesApoyo: patient.redesApoyo || prev.redesApoyo,
        percepcionSituacionEconomica: patient.percepcionSituacionEconomica || prev.percepcionSituacionEconomica,
        laboratorioResultados: patient.laboratorio || prev.laboratorioResultados,
        laboratorioFecha: patient.laboratorioFecha || prev.laboratorioFecha,
        ekgResultado: patient.electrocardiograma || prev.ekgResultado,
        ekgFecha: patient.ekgFecha || prev.ekgFecha,
        otrasImagenesResultados: patient.imagenes || prev.otrasImagenesResultados,
        otrasImagenesFecha: patient.otrasImagenesFecha || prev.otrasImagenesFecha,
        peso: patient.peso || prev.peso,
        talla: patient.talla || prev.talla,
        imc: patient.imc || prev.imc,
        pa: patient.pa || prev.pa,
        fc: patient.fc || prev.fc,
        cc: patient.cc || prev.cc,
        integralIndividual: patient.integralIndividual || prev.integralIndividual,
        integralFamiliar: patient.integralFamiliar || prev.integralFamiliar,
        integralTipologia: patient.integralTipologia || prev.integralTipologia,
        integralCronicas: patient.integralCronicas || prev.integralCronicas,
      }),
    }));

    setIsImportPatientModalOpen(false);
    if (fichaSnapshot) {
      alert(`Ficha importada exitosamente para el paciente ${patient.nombre}.`);
    } else {
      alert(`Datos del paciente ${patient.nombre} importados exitosamente.`);
    }
  };

  // Auto-fill from patientData prop
  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        edad: patientData.edad || prev.edad,
        sexo: (patientData.sexo as any) || prev.sexo,
        antecedentesPersonales: patientData.antecedentesPersonales || prev.antecedentesPersonales,
        morbilidad: patientData.morbilidad || prev.morbilidad,
        farmacos: patientData.farmacos || prev.farmacos,
        alergias: patientData.alergias || prev.alergias,
        cirugias: patientData.cirugias || prev.cirugias,
        hospitalizaciones: patientData.hospitalizaciones || prev.hospitalizaciones,
        ramFarmacos: patientData.ramFarmacos || prev.ramFarmacos,
        ramFarmacosAclaracion: patientData.ramFarmacosAclaracion || prev.ramFarmacosAclaracion,
        controlExtrasistema: patientData.controlExtrasistema || prev.controlExtrasistema,
        adherenciaTratamiento: patientData.adherenciaTratamiento || prev.adherenciaTratamiento,
        estratificacion: patientData.estratificacion || prev.estratificacion,
        duplaProfesionalOtro: patientData.duplaProfesional || prev.duplaProfesionalOtro,
        actividadFisicaHabito: patientData.actividadFisicaHabito || prev.actividadFisicaHabito,
        habitoMiccional: patientData.habitoMiccional || prev.habitoMiccional,
        habitoDefecatorio: patientData.habitoDefecatorio || prev.habitoDefecatorio,
        actividadSexualProteccion: patientData.actividadSexualProteccion || prev.actividadSexualProteccion,
        encuestaAlimentaria: patientData.encuestaAlimentaria || prev.encuestaAlimentaria,
        empam: patientData.empam || prev.empam,
        fondoOjo: patientData.fondoOjo || prev.fondoOjo,
        podologo: patientData.podologo || prev.podologo,
        evaluacionPie: patientData.evaluacionPie || prev.evaluacionPie,
        atencionesPsa: patientData.atencionesPsa || prev.atencionesPsa,
        vacunas: patientData.vacunas || prev.vacunas,
        antecedentesGineco: patientData.antecedentesGineco || prev.antecedentesGineco,
        fum: patientData.fum || prev.fum,
        sintomasClimaterio: patientData.sintomasClimaterio || prev.sintomasClimaterio,
        mamografiaDia: patientData.mamografiaDia || prev.mamografiaDia,
        papVigente: patientData.papVigente || prev.papVigente,
        animo_estadoAnimo: patientData.animo_estadoAnimo || prev.animo_estadoAnimo,
        animo_habitoSueno: patientData.animo_habitoSueno || prev.animo_habitoSueno,
        animo_percepcionSalud: patientData.animo_percepcionSalud || prev.animo_percepcionSalud,
        animo_ideacionSuicida: patientData.animo_ideacionSuicida || prev.animo_ideacionSuicida,
        espiritualidad: patientData.espiritualidad || prev.espiritualidad,
        escolaridad: patientData.escolaridad || prev.escolaridad,
        ocupacion: patientData.ocupacion || prev.ocupacion,
        antecedentesFamiliaresRelevantes: patientData.antecedentesFamiliaresRelevantes || prev.antecedentesFamiliaresRelevantes,
        viveCon: patientData.viveCon || prev.viveCon,
        factoresProtectores: patientData.factoresProtectores || prev.factoresProtectores,
        estadoCivilHijos: patientData.estadoCivilHijos || prev.estadoCivilHijos,
        redesApoyo: patientData.redesApoyo || prev.redesApoyo,
        percepcionSituacionEconomica: patientData.percepcionSituacionEconomica || prev.percepcionSituacionEconomica,
        laboratorioResultados: patientData.laboratorio || prev.laboratorioResultados,
        laboratorioFecha: patientData.laboratorioFecha || prev.laboratorioFecha,
        ekgResultado: patientData.electrocardiograma || prev.ekgResultado,
        ekgFecha: patientData.ekgFecha || prev.ekgFecha,
        otrasImagenesResultados: patientData.imagenes || prev.otrasImagenesResultados,
        otrasImagenesFecha: patientData.otrasImagenesFecha || prev.otrasImagenesFecha,
        peso: patientData.peso || prev.peso,
        talla: patientData.talla || prev.talla,
        imc: patientData.imc || prev.imc,
        pa: patientData.pa || prev.pa,
        fc: patientData.fc || prev.fc,
        cc: patientData.cc || prev.cc,
        integralIndividual: patientData.integralIndividual || prev.integralIndividual,
        integralFamiliar: patientData.integralFamiliar || prev.integralFamiliar,
        integralTipologia: patientData.integralTipologia || prev.integralTipologia,
        integralCronicas: patientData.integralCronicas || prev.integralCronicas,
      }));
    }
  }, [patientData]);

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

  const renderAntecedentCheckbox = (label: string, name: keyof FichaIngresoEcicepFormData) => {
    const icon = getAntecedentIcon(label);
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
            disabled={formData[name] === 'Niega'}
            inputClassName="!h-[42px] !text-slate-800 placeholder:opacity-50"
            labelPrefix={icon}
          />
        </div>
        <div className="flex items-center flex-shrink-0">
          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData[name] === 'Niega' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
            <input
              type="checkbox"
              checked={formData[name] === 'Niega'}
              onChange={(e) => {
                const val = e.target.checked ? 'Niega' : '';
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

  // Sync prop -> formData
  useEffect(() => {
    if (fechaIngresoProp && fechaIngresoProp !== formData.fechaIngreso) {
      setFormData(prev => ({ ...prev, fechaIngreso: fechaIngresoProp }));
    }
  }, [fechaIngresoProp]);

  // Sync formData -> prop
  useEffect(() => {
    if (formData.fechaIngreso && onFechaIngresoChange) {
      onFechaIngresoChange(formData.fechaIngreso);
    }
  }, [formData.fechaIngreso, onFechaIngresoChange]);

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: handleExportPdf,
        newForm: () => {
          if (window.confirm("¿Seguro que desea borrar todos los datos ingresados?")) {
            setFormData(initialFormData);
          }
        },
        imprimirResumen: () => generateEcicepResumenPdf(formData, loggedInUser),
        editarDrive: handleDriveEdit
      };
    }
  }, [formData, loggedInUser, actionsRef]);

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
    { key: 'era_desencadenante_calefaccion', label: 'Calefacción' },
  ];

  const handleAiImport = async (pastedText: string) => {
    setIsAiImporting(true);
    try {
      const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });

      const schema = {
        type: Type.OBJECT,
        properties: {
          antecedentesPersonales: { type: Type.STRING, description: "Lista de enfermedades crónicas del paciente (ej: HTA, DM2, DLP, ETC) extraída de 'Antecedentes médicos'." },
          farmacos: { type: Type.STRING, description: "Lista de medicamentos actuales del paciente y sus dosis." },
          alergias: { type: Type.STRING, description: "Detalle de alérgias. Si no hay, extrae 'Niega'." },
          cirugias: { type: Type.STRING, description: "Detalle de cirugías. Si no hay, extrae 'Niega'." },
          hospitalizaciones: { type: Type.STRING, description: "Detalle de hospitalizaciones. Si no hay, extrae 'Niega'." },
          controlExtrasistema: { type: Type.STRING, description: "Detalle de controles en extrasistema. Si no hay, extrae 'Niega'." },
          empam: { type: Type.STRING, description: "Resumen del estado y fecha del EMPAM." },
          fondoOjo: { type: Type.STRING, description: "Resumen del estado y fecha del Fondo de Ojo." },
          podologo: { type: Type.STRING, description: "Resumen del estado y fecha del control con podólogo." },
          evaluacionPie: { type: Type.STRING, description: "Resumen del estado y fecha de la evaluación de pie." },
          vacunas: { type: Type.STRING, description: "Resumen del estado de las vacunas." },
          escolaridad: { type: Type.STRING, description: "Nivel de escolaridad del paciente." },
          ocupacion: { type: Type.STRING, description: "Ocupación o trabajo actual del paciente." },
          antecedentesFamiliaresRelevantes: { type: Type.STRING, description: "Antecedentes familiares de importancia, extraído de 'Antecedentes familiares'." },
          viveCon: { type: Type.STRING, description: "Con quién vive el paciente." },
          factoresProtectores: { type: Type.STRING, description: "Factores protectores del paciente." },
          estadoCivilHijos: { type: Type.STRING, description: "Estado civil e hijos del paciente." },
          redesApoyo: { type: Type.STRING, description: "Las redes de apoyo del paciente." },
          percepcionSituacionEconomica: { type: Type.STRING, description: "Cómo percibe el paciente su situación económica, extraído de 'Percepción de situación económica'." },
          espiritualidad: { type: Type.STRING, description: "Creencias o prácticas espirituales del paciente." },
          laboratorioFecha: { type: Type.STRING, description: "Fecha del examen de laboratorio en formato YYYY-MM-DD." },
          laboratorioResultados: { type: Type.STRING, description: "Resumen de los resultados de exámenes de laboratorio, extraído de 'Exámenes'." },
        },
      };

      const response = await ai.models.generateContent({
        model: 'llama3-70b-8192',
        contents: `Analiza el siguiente texto de un registro clínico de 'FICHA PREINGRESO ECICEP' y extrae la información relevante. Devuelve solo un objeto JSON. Si una información no está presente en el texto, omite la clave del JSON. Texto a analizar: "${pastedText}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const jsonString = response.text.trim();
      const parsedData = JSON.parse(jsonString);

      const updatedFields: Partial<FichaIngresoEcicepFormData> = {};

      const fieldsToMap: (keyof FichaIngresoEcicepFormData)[] = [
        'antecedentesPersonales', 'farmacos', 'alergias', 'cirugias', 'hospitalizaciones',
        'controlExtrasistema', 'empam', 'fondoOjo', 'podologo', 'evaluacionPie',
        'vacunas', 'escolaridad', 'ocupacion', 'antecedentesFamiliaresRelevantes',
        'viveCon', 'factoresProtectores', 'estadoCivilHijos', 'redesApoyo', 'percepcionSituacionEconomica', 'espiritualidad',
        'laboratorioFecha', 'laboratorioResultados'
      ];

      for (const key of fieldsToMap) {
        if (parsedData[key]) {
          (updatedFields as any)[key] = parsedData[key];
        }
      }

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

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'laboratorio', setIsLabLoading, setLabError, (result) => {
      setFormData(prev => ({
        ...prev,
        laboratorioResultados: result.text,
        ...(result.date && { laboratorioFecha: formatDateForDisplay(result.date) }),
      }));
    });
    if (e.target) e.target.value = '';
  };

  const handleEkgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, 'imagenes', setIsEkgLoading, setEkgError, (result) => {
      setFormData(prev => ({
        ...prev,
        ekgResultado: result.text,
        ...(result.date && { ekgFecha: result.date }),
      }));
    });
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
    });
    if (e.target) e.target.value = '';
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
      const ipa = (cigs * years) / 20;
      setFormData(prev => ({ ...prev, ipaResultado: ipa.toFixed(1) }));
    } else if (formData.ipaResultado !== '') {
      setFormData(prev => ({ ...prev, ipaResultado: '' }));
    }
  }, [formData.ipaNroCigarrillos, formData.ipaNroAnos, formData.ipaResultado]);

  useEffect(() => {
    if (formData.fechaIngreso && formData.fechaIngreso.includes('-')) {
      const parts = formData.fechaIngreso.split('-');
      if (parts[0].length === 4) {
        const newDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setFormData(prev => ({ ...prev, fechaIngreso: newDate }));
      }
    }
  }, [formData.fechaIngreso]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, integralCronicas: prev.antecedentesPersonales }));
  }, [formData.antecedentesPersonales]);

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

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day || year.length !== 4 || month.length !== 2 || day.length !== 2) return dateString;
    return `${day}-${month}-${year}`;
  };

  const isPhq9Completed = useMemo(() => {
    return phq9Questions.some(question => {
      const value = formData[question.key as keyof FichaIngresoEcicepFormData];
      return value !== undefined && value !== null && value !== '';
    });
  }, [formData]);

  const phq9Score = useMemo(() => {
    return phq9Questions.reduce((total, question) => {
      const value = formData[question.key as keyof FichaIngresoEcicepFormData];
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

    const suicidioScore = parseInt(formData.phq9_suicidio, 10) || 0;
    if (suicidioScore > 0) {
      action += '\n¡ATENCIÓN! Respuesta positiva a ideación suicida. Evaluar riesgo y tomar medidas inmediatas según protocolo.';
    }

    return { score, severity, action };
  }, [phq9Score, formData.phq9_suicidio]);

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    anamnesis += `FICHA INGRESO ECICEP\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA INGRESO: ${formatDateForDisplay(formData.fechaIngreso)}\n`;
    let duplaDisplay = formData.sinDupla ? 'MÉDICO (Sin dupla)' : `Médico + ${formData.duplaProfesionalOtro || '(No seleccionado)'}`;
    anamnesis += `DUPLA PROFESIONAL: ${duplaDisplay}\n`;
    if (loggedInUser) {
      let responsableText = loggedInUser.fullName;
      if (!formData.sinDupla && formData.duplaProfesionalOtroNombre) {
        responsableText += ` + ${formData.duplaProfesionalOtroNombre}`;
      }
      anamnesis += `PROFESIONAL RESPONSABLE: ${responsableText}\n`;
    }
    anamnesis += `ESTRATIFICACIÓN: ${formData.estratificacion || '(No seleccionado)'}\n`;
    anamnesis += `MOTIVO DE CONSULTA: Ingreso ECICEP ${formData.estratificacion || ''}\n`;
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
    anamnesis += `Alergias: ${formData.alergias}\n`;
    anamnesis += `Cirugías: ${formData.cirugias}\n`;
    anamnesis += `Hospitalizaciones: ${formData.hospitalizaciones}\n`;
    anamnesis += `Controles fuera de CESFAM: ${formData.controlExtrasistema}\n\n`;

    if (formData.factoresRiesgo && formData.factoresRiesgo.length > 0) {
      anamnesis += `FACTORES DE RIESGO:\n`;
      formData.factoresRiesgo.forEach(factor => {
        anamnesis += `- ${factor}.\n`;
      });
      anamnesis += `\n`;
    }

    if (formData.incluirControlCardiovascular) {
      anamnesis += `SÍNTOMAS CARDIOVASCULARES:\n`;
      cvSymptomsItems.forEach(item => {
        const isPresent = formData[item.key as keyof FichaIngresoEcicepFormData];
        anamnesis += `- ${item.label}: ${isPresent ? 'Sí' : 'Niega'}\n`;
      });
      anamnesis += `\n`;
    }

    if (formData.incluirControlHipotiroidismo) {
      const fd = formData as any;
      anamnesis += `CONTROL HIPOTIROIDISMO:\n`;
      const hipoSintomas = [
        {k:'hipo_sintoma_astenias',l:'Astenia/fatiga'},{k:'hipo_sintoma_somnolencia',l:'Somnolencia'},
        {k:'hipo_sintoma_constipacion',l:'Constipación'},{k:'hipo_sintoma_intolerancia_frio',l:'Intolerancia al frío'},
        {k:'hipo_sintoma_edema',l:'Edema (mixedema)'},{k:'hipo_sintoma_aumento_peso',l:'Aumento de peso'},
        {k:'hipo_sintoma_piel_seca',l:'Piel seca'},{k:'hipo_sintoma_caida_cabello',l:'Caída de cabello'},
        {k:'hipo_sintoma_calambres',l:'Calambres musculares'},
      ];
      anamnesis += `Síntomas actuales: ${hipoSintomas.filter(s=>fd[s.k]).map(s=>s.l).join(', ') || 'Niega síntomas'}\n`;
      if (fd.hipo_tsh_fecha || fd.hipo_tsh_resultado) anamnesis += `TSH (${fd.hipo_tsh_fecha||'sin fecha'}): ${fd.hipo_tsh_resultado||'(no ingresado)'}\n`;
      if (fd.hipo_t4l_resultado) anamnesis += `T4 libre: ${fd.hipo_t4l_resultado}\n`;
      anamnesis += `Adherencia a Levotiroxina: ${fd.hipo_adherencia_levotiroxina||'(No ingresado)'}\n`;
      anamnesis += `Ayuno correcto post dosis: ${fd.hipo_ayuno_correcto||'(No ingresado)'}\n`;
      anamnesis += `Fármacos que interfieren absorción: ${fd.hipo_farmacos_interferentes||'(No ingresado)'}\n`;
      if (fd.hipo_observaciones) anamnesis += `Observaciones: ${fd.hipo_observaciones}\n`;
      anamnesis += `\n`;
    }

    if (formData.incluirControlArtrosis) {
      const fd = formData as any;
      anamnesis += `CONTROL ARTROSIS:\n`;
      anamnesis += `Articulaciones afectadas: ${fd.art_articulaciones_afectadas||'(No ingresado)'}\n`;
      anamnesis += `Dolor EVA: ${fd.art_dolor_eva||'0'}/10\n`;
      anamnesis += `Limitación funcional: ${fd.art_limitacion_funcional||'(No ingresado)'}\n`;
      anamnesis += `Uso de analgésicos: ${fd.art_uso_analgesicos||'(No ingresado)'}${fd.art_analgesicos_cuales ? ` (${fd.art_analgesicos_cuales})` : ''}\n`;
      anamnesis += `Kinesiterapia: ${fd.art_kinesiterapia||'(No ingresado)'}\n`;
      anamnesis += `Ayudas técnicas: ${fd.art_ayudas_tecnicas||'(No ingresado)'}\n`;
      if (fd.art_radiografia_fecha || fd.art_radiografia_resultado) anamnesis += `Radiografía (${fd.art_radiografia_fecha||'sin fecha'}): ${fd.art_radiografia_resultado||'(no ingresado)'}\n`;
      if (fd.art_observaciones) anamnesis += `Observaciones: ${fd.art_observaciones}\n`;
      anamnesis += `\n`;
    }

    if (formData.incluirControlEpilepsia) {
      const fd = formData as any;
      anamnesis += `CONTROL EPILEPSIA:\n`;
      anamnesis += `Tipo de crisis: ${fd.epi_tipo_crisis||'(No ingresado)'}\n`;
      anamnesis += `Última crisis: ${fd.epi_ultima_crisis_fecha||'(No ingresado)'}\n`;
      anamnesis += `Frecuencia de crisis: ${fd.epi_frecuencia_crisis||'(No ingresado)'}\n`;
      anamnesis += `Fármaco antiepiléptico: ${fd.epi_farmaco_antiepiléptico||'(No ingresado)'}\n`;
      anamnesis += `Adherencia a FAE: ${fd.epi_adherencia||'(No ingresado)'}\n`;
      if (fd.epi_niveles_plasmaticos_fecha || fd.epi_niveles_plasmaticos_resultado) {
        anamnesis += `Niveles plasmáticos (${fd.epi_niveles_plasmaticos_fecha||'sin fecha'}): ${fd.epi_niveles_plasmaticos_resultado||'(no ingresado)'}\n`;
      }
      anamnesis += `Efectos secundarios referidos: ${fd.epi_efectos_secundarios||'(No ingresado)'}\n`;
      anamnesis += `Restricción para conducir: ${fd.epi_restricciones_conduccion||'(No ingresado)'}\n`;
      if (fd.epi_observaciones) anamnesis += `Observaciones: ${fd.epi_observaciones}\n`;
      anamnesis += `\n`;
    }

    if (formData.incluirControlSalaEra) {
      anamnesis += `SÍNTOMAS RESPIRATORIOS (SALA ERA):\n`;
      eraSymptomsItems.forEach(item => {
        const isPresent = formData[item.key as keyof FichaIngresoEcicepFormData];
        anamnesis += `- ${item.label}: ${isPresent ? 'Sí' : 'Niega'}\n`;
      });
      anamnesis += `\n`;
      anamnesis += `DESENCADENANTES AMBIENTALES:\n`;
      eraTriggersItems.forEach(item => {
        const isPresent = formData[item.key as keyof FichaIngresoEcicepFormData];
        anamnesis += `- ${item.label}: ${isPresent ? 'Sí' : 'Niega'}\n`;
      });
      anamnesis += `\n`;
    }

    if (formData.incluirControlSalaIra) {
      const fd = formData as any;
      anamnesis += `CONTROL SALA IRA:\n`;
      anamnesis += `Diagnóstico: ${fd.ira_diagnostico||'(No ingresado)'}\n`;
      const iraSintomas = [
        {k:'ira_sintoma_tos',l:'Tos'},{k:'ira_sintoma_fiebre',l:'Fiebre'},
        {k:'ira_sintoma_rinorrea',l:'Rinorrea'},{k:'ira_sintoma_odinofagia',l:'Odinofagia'},{k:'ira_sintoma_disnea',l:'Disnea'},
      ];
      anamnesis += `Síntomas: ${iraSintomas.filter(s=>fd[s.k]).map(s=>s.l).join(', ') || 'Niega síntomas activos'}\n`;
      if (fd.ira_saturacion) anamnesis += `Saturación O₂: ${fd.ira_saturacion}%\n`;
      if (fd.ira_fr) anamnesis += `FR: ${fd.ira_fr} resp/min\n`;
      anamnesis += `Broncodilatador: ${fd.ira_uso_broncodilatador||'No'}${fd.ira_broncodilatador_cual ? ` (${fd.ira_broncodilatador_cual})` : ''}\n`;
      anamnesis += `Nebulización: ${fd.ira_nebulizacion||'No'}\n`;
      anamnesis += `Rx Tórax: ${fd.ira_rx_torax||'No realizada'}${fd.ira_rx_resultado ? ` - ${fd.ira_rx_resultado}` : ''}\n`;
      if (fd.ira_observaciones) anamnesis += `Observaciones: ${fd.ira_observaciones}\n`;
      anamnesis += `\n`;
    }

    if (formData.incluirControlDemencias) {
      const fd = formData as any;
      anamnesis += `CONTROL DEMENCIAS:\n`;
      anamnesis += `Diagnóstico: ${fd.dem_diagnostico||'(No ingresado)'}\n`;
      anamnesis += `Estadio: ${fd.dem_estadio||'(No ingresado)'}\n`;
      if (fd.dem_mmse_fecha || fd.dem_mmse_puntaje) anamnesis += `MMSE (${fd.dem_mmse_fecha||'sin fecha'}): ${fd.dem_mmse_puntaje||'(no ingresado)'}\n`;
      if (fd.dem_barthel_puntaje) anamnesis += `Índice de Barthel: ${fd.dem_barthel_puntaje}\n`;
      anamnesis += `Cuidador principal: ${fd.dem_cuidador_principal||'(No ingresado)'}\n`;
      anamnesis += `Sobrecarga del cuidador: ${fd.dem_sobrecarga_cuidador||'No'}\n`;
      const demSintomas = [
        {k:'dem_sintoma_deambulacion',l:'Alt. deambulación'},{k:'dem_sintoma_alimentacion',l:'Alt. alimentación'},
        {k:'dem_sintoma_continencia',l:'Incontinencia'},{k:'dem_sintoma_conductas',l:'Conductas disruptivas'},{k:'dem_sintoma_agitacion',l:'Agitación'},
      ];
      anamnesis += `Síntomas conductuales/funcionales: ${demSintomas.filter(s=>fd[s.k]).map(s=>s.l).join(', ') || 'Sin síntomas significativos'}\n`;
      if (fd.dem_farmaco_antidemencia) anamnesis += `Fármaco antidemencia: ${fd.dem_farmaco_antidemencia}\n`;
      anamnesis += `Adherencia: ${fd.dem_adherencia||'(No ingresado)'}\n`;
      anamnesis += `Derivación a especialidad: ${fd.dem_derivacion_especialidad||'No'}\n`;
      if (fd.dem_observaciones) anamnesis += `Observaciones: ${fd.dem_observaciones}\n`;
      anamnesis += `\n`;
    }

    if (formData.incluirControlSm) {
      anamnesis += `SÍNTOMAS SALUD MENTAL:\n`;
      anamnesis += `- Ánimo: ${formData.sm_sintoma_animo || '(No ingresado)'}\n`;
      anamnesis += `- Síntomas ansiosos: ${formData.sm_sintoma_ansiosos || '(No ingresado)'}\n`;
      anamnesis += `- Somatizaciones: ${formData.sm_sintoma_somatizaciones || '(No ingresado)'}\n`;
      anamnesis += `- Alteraciones del sueño: ${formData.sm_sintoma_sueno || '(No ingresado)'}\n`;
      anamnesis += `- Síntomas psicóticos: ${formData.sm_sintoma_psicoticos || '(No ingresado)'}\n`;
      anamnesis += `- Ideación suicida: ${formData.sm_sintoma_suicidio || '(No ingresado)'}\n\n`;
    }

    anamnesis += `ATENCIONES VIGENTES:\n`;
    anamnesis += `EMPAM: ${stripStatusBracket(formData.empam || '') || '(No ingresado)'}\n`;
    anamnesis += `Fondo de ojo: ${stripStatusBracket(formData.fondoOjo || '') || '(No ingresado)'}\n`;
    anamnesis += `Podólogo: ${stripStatusBracket(formData.podologo || '') || '(No ingresado)'}\n`;
    anamnesis += `Evaluación de pie: ${stripStatusBracket(formData.evaluacionPie || '') || '(No ingresado)'}\n`;
    if (formData.sexo === 'Masculino') {
      anamnesis += `PSA: ${formData.atencionesPsa || '(No ingresado)'}\n`;
    }
    anamnesis += `Vacunas: ${formData.vacunas || '(No ingresado)'}\n\n`;

    if (formData.sexo === 'Femenino') {
      anamnesis += `GINECO-OBSTETRICIA:\n`;
      anamnesis += `Antecedentes gineco obstétricos: ${formData.antecedentesGineco || '(No ingresado)'}\n`;
      anamnesis += `FUM: ${formData.fum || '(No ingresado)'}\n`;
      anamnesis += `Síntomas climatéricos/menopausia: ${formData.sintomasClimaterio || '(No ingresado)'}\n`;
      anamnesis += `Mamografía al día: ${formData.mamografiaDia || '(No ingresado)'}\n`;
      anamnesis += `PAP Vigente: ${formData.papVigente || '(No ingresado)'}\n\n`;
    }

    anamnesis += `HÁBITOS:\n`;
    anamnesis += `Alcohol: ${formData.alcohol ? 'Sí' : 'Niega'}${formData.alcoholAclaracion ? `. ${formData.alcoholAclaracion}` : ''}\n`;
    let tabacoLine = `Tabaco: ${formData.tabaco ? 'Sí' : 'Niega'}`;
    if (formData.tabaco) {
      if (formData.tabacoAclaracion) {
        tabacoLine += `. ${formData.tabacoAclaracion}`;
      }
      if (formData.ipaResultado) {
        tabacoLine += ` (IPA: ${formData.ipaResultado})`;
      }
    }
    anamnesis += `${tabacoLine}\n`;
    anamnesis += `Drogas: ${formData.drogas ? 'Sí' : 'Niega'}${formData.drogasAclaracion ? `. ${formData.drogasAclaracion}` : ''}\n`;
    anamnesis += `Actividad física: ${formData.actividadFisicaHabito || '(No ingresado)'}\n`;
    anamnesis += `Hábito miccional: ${formData.habitoMiccional || '(No ingresado)'}\n`;
    anamnesis += `Hábito defecatorio: ${formData.habitoDefecatorio || '(No ingresado)'}\n`;
    anamnesis += `Actividad sexual (medidas de protección): ${formData.actividadSexualProteccion || '(No ingresado)'}\n\n`;

    anamnesis += `ALIMENTACIÓN:\n`;
    anamnesis += `Encuesta alimentaria: ${formData.encuestaAlimentaria || '(No ingresado)'}\n\n`;

    anamnesis += `ÁNIMO:\n`;
    if (isPhq9Completed) {
      anamnesis += `PHQ-9 Puntaje Total: ${phq9Interpretation.score} - ${phq9Interpretation.severity}\n`;
      anamnesis += `Acción Sugerida (PHQ-9): ${phq9Interpretation.action.replace('\n', ' ')}\n`;
    }
    anamnesis += `Estado Anímico (descripción): ${formData.animo_estadoAnimo || '(No ingresado)'}\n`;
    anamnesis += `Hábito de Sueño (descripción): ${formData.animo_habitoSueno || '(No ingresado)'}\n`;
    anamnesis += `Percepción del estado de salud: ${formData.animo_percepcionSalud || '(No ingresado)'}\n`;
    anamnesis += `Ideación Suicida: ${formData.animo_ideacionSuicida}\n`;
    anamnesis += `Espiritualidad: ${formData.espiritualidad || '(No ingresado)'}\n\n`;

    anamnesis += `DIMENSIÓN SOCIAL, FAMILIAR Y COMUNITARIA:\n`;
    anamnesis += `Escolaridad: ${formData.escolaridad || '(No ingresado)'}\n`;
    anamnesis += `Ocupación: ${formData.ocupacion || '(No ingresado)'}\n`;
    anamnesis += `Antecedentes familiares relevantes: ${formData.antecedentesFamiliaresRelevantes || '(No ingresado)'}\n`;
    anamnesis += `Vive con: ${formData.viveCon || '(No ingresado)'}\n`;
    anamnesis += `Factores protectores: ${formData.factoresProtectores || '(No ingresado)'}\n`;
    anamnesis += `Estado civil/hijos: ${formData.estadoCivilHijos || '(No ingresado)'}\n`;
    anamnesis += `Redes de apoyo: ${formData.redesApoyo || '(No ingresado)'}\n`;
    anamnesis += `Percepción de situación económica: ${formData.percepcionSituacionEconomica || '(No ingresado)'}\n\n`;

    exploracion += `ESTUDIOS RECIENTES:\n`;
    exploracion += `ÚLTIMO LABORATORIO ${formatDateForDisplay(formData.laboratorioFecha)}\n`;
    exploracion += `${formData.laboratorioResultados || '(No ingresado)'}\n`;
    if (formData.ekgResultado) {
      exploracion += `\nÚLTIMO EKG ${formatDateForDisplay(formData.ekgFecha)}\n`;
      exploracion += `${formData.ekgResultado}\n`;
    }
    if (formData.otrasImagenesResultados) {
      exploracion += `\nIMÁGENES Y OTROS ESTUDIOS\n`;
      exploracion += `${formData.otrasImagenesResultados}\n`;
    }
    exploracion += `\n`;

    exploracion += `EXAMEN FÍSICO:\n`;
    exploracion += `- Peso: ${formData.peso || '(No ingresado)'} kg\n`;
    exploracion += `- Talla: ${formData.talla || '(No ingresado)'} cm\n`;
    exploracion += `- IMC: ${formData.imc || '(No calculado)'} kg/m²\n`;
    exploracion += `- PA: ${formData.pa || '(No ingresado)'} mmHg\n`;
    exploracion += `- FC: ${formData.fc || '(No ingresado)'} lpm\n`;
    exploracion += `- CC: ${formData.cc || '(No ingresado)'} cm\n`;
    if (formData.borgScaleResult) {
      exploracion += `- ESCALA DE BORG: ${formData.borgScaleResult}\n`;
    }
    exploracion += `\nExamen Físico General/Segmentario:\n${formData.efGeneralSegmentario || '(No ingresado)'}\n\n`;

    if (formData.incluirControlSm) {
      exploracion += `EXAMEN MENTAL (SM):\n`;
      exploracion += `- Descripción inicial: ${formData.sm_em_descripcion || '(No ingresado)'}\n`;
      exploracion += `- Conciencia/orientación/memoria: ${formData.sm_em_conciencia || '(No ingresado)'}\n`;
      exploracion += `- Lenguaje: ${formData.sm_em_lenguaje || '(No ingresado)'}\n`;
      exploracion += `- Psicomotricidad o conación: ${formData.sm_em_psicomotricidad || '(No ingresado)'}\n`;
      exploracion += `- Pensamiento (producción/curso/contenido/ideas): ${formData.sm_em_pensamiento || '(No ingresado)'}\n`;
      exploracion += `- Percepción/sensorial: ${formData.sm_em_percepcion || '(No ingresado)'}\n`;
      exploracion += `- Intelectual: ${formData.sm_em_intelectual || '(No ingresado)'}\n`;
      exploracion += `- Juicio de realidad: ${formData.sm_em_juicio || '(No ingresado)'}\n`;
      exploracion += `- Conciencia de enfermedad (insight): ${formData.sm_em_insight || '(No ingresado)'}\n\n`;
    }

    const extractMacroTitle = (str: string | undefined): string => {
      if (!str) return '(No ingresado)';
      const colonIndex = str.indexOf(':');
      return colonIndex !== -1 ? `${str.substring(0, colonIndex)}.` : str;
    };

    actuacion += `VALORACIÓN INTEGRAL:\n`;
    actuacion += `Ciclo vital individual: ${extractMacroTitle(formData.integralIndividual)}\n`;
    actuacion += `Ciclo vital familiar: ${extractMacroTitle(formData.integralFamiliar)}\n`;
    actuacion += `Tipología familiar: ${extractMacroTitle(formData.integralTipologia)}\n`;
    actuacion += `Condiciones crónicas y problemáticas: ${formData.integralCronicas || '(No ingresado)'}\n\n`;

    actuacion += `PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS:\n`;
    actuacion += `PROBLEMAS VISUALIZADOS:\n`;
    actuacion += `Persona y familia: ${formData.pccPersonaFamilia || '(No ingresado)'}\n`;
    actuacion += `Equipo de salud: ${formData.pccEquipoSalud || '(No ingresado)'}\n\n`;

    actuacion += `PRIORIZACIÓN DE PROBLEMAS:\n`;
    actuacion += `${formData.tomaDecisionesCompartidas || '(No ingresado)'}\n\n`;

    if (formData.opcionesConversadas) {
      actuacion += `OPCIONES CONVERSADAS Y ACTIVOS COMUNITARIOS:\n${formData.opcionesConversadas}\n\n`;
    }


    actuacion += `PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS:\n`;
    if (formData.pccObjetivos.length > 0) {
      formData.pccObjetivos.forEach((obj, idx) => {
        actuacion += `OBJETIVO/META #${idx + 1}: ${obj.objetivo || '(No ingresado)'}\n`;
        actuacion += `  Acuerdo: ${obj.acuerdo || '(No ingresado)'}\n`;
        actuacion += `  Acciones específicas: ${obj.acciones || '(No ingresado)'}\n`;
        actuacion += `  Plazo: ${obj.plazo || '(No ingresado)'}\n`;
        actuacion += `  Responsable: ${obj.responsables || '(No ingresado)'}\n`;
        actuacion += `  Seguimiento: ${obj.seguimiento || '(No ingresado)'}\n\n`;
      });
    } else {
      actuacion += `(Sin objetivos agregados)\n\n`;
    }

    actuacion += `¿Está de acuerdo con el plan elaborado en conjunto con el equipo ECICEP?: ${formData.acuerdoPlanEquipo || '(No seleccionado)'}\n`;
    actuacion += `¿Está de acuerdo con que lo contactemos para seguimiento?: ${formData.acuerdoContactoSeguimiento || '(No seleccionado)'}\n\n`;

    actuacion += `INDICACIONES:\n`;
    planCheckboxItemsEcicepConfig.forEach(item => {
      if (formData[item.key] as boolean) {
        let planItemText = item.textPrefix;
        if (item.detailKey && formData[item.detailKey as keyof FichaIngresoEcicepFormData]) {
          planItemText += formData[item.detailKey as keyof FichaIngresoEcicepFormData] as string;
        } else if (item.detailKey && item.detailPlaceholder) {
          planItemText += item.detailPlaceholder;
        }
        if (item.textSuffix) {
          planItemText += item.textSuffix;
        }
        actuacion += `${planItemText}\n`;
      }
    });

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
      actuacion += `\nPRÓXIMO CONTROL:\n`;
      actuacion += `- Próximo control con Médico + ${formData.planProximoControlDupla || '(dupla no especificada)'} en ${formData.planProximoControlTiempo || '(tiempo no especificado)'}${futureMonthText}.\n`;
    }

    if (formData.indicaciones && formData.indicaciones.trim() !== '') {
      actuacion += `\nINDICACIONES ADICIONALES:\n`;
      actuacion += `${formData.indicaciones.trim()}\n`;
    }

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim()
    };
  }, [formData, loggedInUser, phq9Interpretation, isPhq9Completed]);

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

  // Force update summary when lab date changes (fix for issue)
  useEffect(() => {
    if (status === FormStatus.TextGenerated) {
      const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
      setAnamnesisText(anamnesis);
      setExploracionText(exploracion);
      setActuacionText(actuacion);
    }
  }, [formData.laboratorioFecha, calculateGeneratedTextParts, status]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => {
        const newState = { ...prev, [name]: checked };
        const isHabitCheckbox = ['alcohol', 'tabaco', 'drogas'].includes(name);
        if (isHabitCheckbox && !checked) {
          const aclaracionKey = `${name}Aclaracion` as keyof FichaIngresoEcicepFormData;
          if (newState.hasOwnProperty(aclaracionKey)) {
            (newState as any)[aclaracionKey] = '';
          }
        }
        if (name === 'tabaco' && !checked) {
          newState.ipaNroCigarrillos = '';
          newState.ipaNroAnos = '';
          newState.ipaResultado = '';
        }
        const planConfig = planCheckboxItemsEcicepConfig.find(p => p.key === name);
        if (planConfig && planConfig.detailKey && !checked) {
          (newState as any)[planConfig.detailKey] = '';
        }
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  }, []);

  const handleInputChange = useCallback((name: keyof FichaIngresoEcicepFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRadioChange = useCallback((name: keyof FichaIngresoEcicepFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleAddPccObjetivo = () => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [...prev.pccObjetivos, { objetivo: '', acuerdo: '', acciones: '', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.' }]
    }));
  };

  const handleAddPredefinedPlan = (plan: PccObjetivo) => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [...prev.pccObjetivos, { ...plan }]
    }));
    setIsPredefinedPlanOpen(false);
    setPlanSearchTerm('');
  };

  const handleUpdatePccObjetivo = (index: number, field: keyof PccObjetivo, value: string) => {
    setFormData(prev => {
      const newObjetivos = [...prev.pccObjetivos];
      newObjetivos[index] = { ...newObjetivos[index], [field]: value || '' };
      return { ...prev, pccObjetivos: newObjetivos };
    });
  };

  const handleRemovePccObjetivo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: prev.pccObjetivos.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (status !== FormStatus.Idle) {
      // generateAnamnesisText();
    }
  }, [formData, status]);

  const handleCopyToClipboard = (textToCopy: string, partName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy)
      .then(() => alert(`'${partName}' copiado al portapapeles.`))
      .catch(err => alert('Error al copiar texto.'));
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
    setAnamnesisText('');
    setExploracionText('');
    setActuacionText('');
    setStatus(FormStatus.Idle);
    setIsEscolaridadLibre(false);
    setIsOcupacionLibre(false);
    setIsEspiritualidadLibre(false);
    setIsActividadFisicaLibre(false);
  };

  const handleExportPdf = async () => {
    if (window.confirm("¿Seguro que desea exportar a PDF?")) {
      if (!loggedInUser) {
        alert('Error: Usuario no identificado. No se puede generar el PDF.');
        return;
      }

      setStatus(FormStatus.Generating);
      try {
        if (patientData && patientData.rut) {
          patientStore.savePatient({
            rut: patientData.rut,
            nombre: patientData.nombre,
            edad: formData.edad,
            sexo: formData.sexo as any,
            antecedentesPersonales: formData.antecedentesPersonales,
            morbilidad: formData.morbilidad,
            farmacos: formData.farmacos,
            alergias: formData.alergias,
            cirugias: formData.cirugias,
            hospitalizaciones: formData.hospitalizaciones,
            ramFarmacos: formData.ramFarmacos,
            ramFarmacosAclaracion: formData.ramFarmacosAclaracion,
            controlExtrasistema: formData.controlExtrasistema,
            adherenciaTratamiento: formData.adherenciaTratamiento,
            estratificacion: formData.estratificacion,
            duplaProfesional: formData.duplaProfesionalOtro,
            actividadFisicaHabito: formData.actividadFisicaHabito,
            habitoMiccional: formData.habitoMiccional,
            habitoDefecatorio: formData.habitoDefecatorio,
            actividadSexualProteccion: formData.actividadSexualProteccion,
            encuestaAlimentaria: formData.encuestaAlimentaria,
            empam: formData.empam,
            fondoOjo: formData.fondoOjo,
            podologo: formData.podologo,
            evaluacionPie: formData.evaluacionPie,
            atencionesPsa: formData.atencionesPsa,
            vacunas: formData.vacunas,
            antecedentesGineco: formData.antecedentesGineco,
            fum: formData.fum,
            sintomasClimaterio: formData.sintomasClimaterio,
            mamografiaDia: formData.mamografiaDia,
            papVigente: formData.papVigente,
            animo_estadoAnimo: formData.animo_estadoAnimo,
            animo_habitoSueno: formData.animo_habitoSueno,
            animo_percepcionSalud: formData.animo_percepcionSalud,
            animo_ideacionSuicida: formData.animo_ideacionSuicida,
            espiritualidad: formData.espiritualidad,
            escolaridad: formData.escolaridad,
            ocupacion: formData.ocupacion,
            antecedentesFamiliaresRelevantes: formData.antecedentesFamiliaresRelevantes,
            viveCon: formData.viveCon,
            factoresProtectores: formData.factoresProtectores,
            estadoCivilHijos: formData.estadoCivilHijos,
            redesApoyo: formData.redesApoyo,
            percepcionSituacionEconomica: formData.percepcionSituacionEconomica,
            laboratorio: formData.laboratorioResultados,
            laboratorioFecha: formData.laboratorioFecha,
            electrocardiograma: formData.ekgResultado,
            ekgFecha: formData.ekgFecha,
            imagenes: formData.otrasImagenesResultados,
            otrasImagenesFecha: formData.otrasImagenesFecha,
            peso: formData.peso,
            talla: formData.talla,
            imc: formData.imc,
            pa: formData.pa,
            fc: formData.fc,
            cc: formData.cc,
            integralIndividual: formData.integralIndividual,
            integralFamiliar: formData.integralFamiliar,
            integralTipologia: formData.integralTipologia,
            integralCronicas: formData.integralCronicas,
            fechaUltimaAtencion: formData.fechaIngreso || 'Hoy',
            ultimaPrestacion: 'Ingreso ECICEP',
            prestacionCategory: 'ecicep'
          });
        }

        const fullContent = `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}`;
        await generateClinicalRecordPdf(
          {
            title: 'Ficha Clínica: Ingreso ECICEP',
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
    name: keyof FichaIngresoEcicepFormData,
    options: { value: string, label: string, icon?: React.ReactNode }[],
    clarificationName?: keyof FichaIngresoEcicepFormData,
    clarificationPlaceholder?: string
  ) => {
    return (
      <div className="mb-1">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}:</label>
        <div className="flex items-center space-x-4">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center text-sm">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={formData[name] === opt.value}
                onChange={() => handleRadioChange(name, opt.value)}
                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
              />
              {opt.icon && <span className="ml-2">{opt.icon}</span>}
              <span className={opt.icon ? 'ml-1 text-slate-700' : 'ml-2 text-slate-700'}>{opt.label}</span>
            </label>
          ))}
        </div>
        {clarificationName && formData[name] === 'Sí' && (
          <input
            type="text"
            name={clarificationName}
            value={(formData[clarificationName] as string) || ''}
            onChange={handleChange}
            placeholder={clarificationPlaceholder || "Aclare (opcional)"}
            className="mt-2 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400 text-slate-700"
          />
        )}
      </div>
    );
  };

  const renderCheckboxClarificationField = (item: CheckboxClarificationItem) => {
    const checkboxKey = item.keyBase;
    const aclaracionKey = `${String(item.keyBase)}Aclaracion` as keyof FichaIngresoEcicepFormData;

    const isChecked = formData[checkboxKey] as boolean;
    const aclaracionValue = formData[aclaracionKey] as string;

    return (
      <div key={String(item.keyBase)} className="mb-1.5 p-2.5 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={String(checkboxKey)}
            name={String(checkboxKey)}
            checked={isChecked}
            onChange={handleChange}
            className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            aria-labelledby={`${String(checkboxKey)}-label`}
          />
          <label id={`${String(checkboxKey)}-label`} htmlFor={String(checkboxKey)} className="text-sm font-normal text-slate-700 tracking-tight">
            {item.label}
          </label>
        </div>
        {isChecked && (
          <textarea
            name={String(aclaracionKey)}
            value={aclaracionValue}
            onChange={handleChange as any}
            placeholder="Especifique..."
            className="mt-2 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 min-h-[60px] text-slate-900"
          />
        )}
        {item.keyBase === 'tabaco' && isChecked && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Cálculo de Índice Paquetes Año (IPA)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                label="Cigarrillos/día"
                id="ipaNroCigarrillos"
                name="ipaNroCigarrillos"
                type="number"
                value={formData.ipaNroCigarrillos || ''}
                onChange={handleChange}
                placeholder="N°"
              />
              <FormField
                label="Años fumando"
                id="ipaNroAnos"
                name="ipaNroAnos"
                type="number"
                value={formData.ipaNroAnos || ''}
                onChange={handleChange}
                placeholder="N°"
              />
              <FormField
                label="IPA (Resultado)"
                id="ipaResultado"
                name="ipaResultado"
                value={formData.ipaResultado || ''}
                onChange={() => { }} // no-op
                readOnly
                disabled
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSelectDuplaUser = (user: User) => {
    let professionLabel = professionLabels[user.profession] || user.profession;
    // Ensure select dropdown value matches 'Enfermera' option value for 'Enfermera/o'
    if (user.profession === 'enfermeria') {
      professionLabel = 'Enfermera';
    }
    setFormData(prev => ({
      ...prev,
      duplaProfesionalOtro: professionLabel,
      duplaProfesionalOtroNombre: user.fullName,
    }));
  };

  const handleClearDuplaUser = () => {
    setFormData(prev => ({
      ...prev,
      duplaProfesionalOtro: '',
      duplaProfesionalOtroNombre: '',
    }));
  };

  return (
    <>
      <div className="w-full relative">
        {isAiImporting && (
          <div className="w-full text-center p-3 bg-sky-100 border-b border-sky-300 flex-shrink-0 animate-pulse mb-6 rounded-xl">
            <p className="text-sky-700 font-semibold">Importando datos... Esto puede tardar unos segundos.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">



                <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>

                  <div className="mt-0">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dupla profesional:</label>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center flex-grow">
                        <span className="mr-2 text-slate-700 whitespace-nowrap text-sm font-bold">Médico +</span>
                        <div className="flex-grow">
                          <UserAutocomplete
                            value={formData.duplaProfesionalOtroNombre || ''}
                            onSelect={handleSelectDuplaUser}
                            onChange={(val) => handleInputChange('duplaProfesionalOtroNombre', val)}
                            onClear={handleClearDuplaUser}
                            placeholder="Buscar o escribir nombre del profesional..."
                            disabled={formData.sinDupla}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mt-1 animate-fadeIn">
                        <div className={`flex-grow transition-opacity duration-300 ${formData.sinDupla ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                          <label htmlFor="duplaProfesionalOtro" className="block text-sm font-medium text-slate-700 mb-1">Profesión de la dupla</label>
                          <select
                            id="duplaProfesionalOtro"
                            name="duplaProfesionalOtro"
                            value={formData.duplaProfesionalOtro || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 font-sans text-sm font-normal h-[42px]"
                          >
                            <option value="">Seleccione profesión...</option>
                            {duplaProfesionalOptions.map(opt => (
                              <option key={opt.value} value={opt.label}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                          <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData.sinDupla ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                            <input
                              type="checkbox"
                              name="sinDupla"
                              checked={formData.sinDupla}
                              onChange={handleChange}
                              className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                            />
                            <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Sin dupla</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2.5 mt-2 flex-wrap">
                    <div className="flex-grow">
                      {renderRadioGroup("Estratificación", "estratificacion", [{ value: "G1", label: "G1" }, { value: "G2", label: "G2" }, { value: "G3", label: "G3" }])}
                    </div>

                    {/* Botón CREAR/IMPORTAR */}
                    <button
                      type="button"
                      onClick={() => setIsImportPatientModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow transition-all h-[38px] cursor-pointer whitespace-nowrap"
                    >
                      <MsnMessengerIcon className="w-4 h-4 fill-white text-white" />
                      <span>CREAR/IMPORTAR</span>
                    </button>

                    {/* Botón GUARDAR */}
                    <button
                      type="button"
                      onClick={handleOpenSavePatientModal}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-all h-[38px] cursor-pointer whitespace-nowrap"
                    >
                      <FloppyDiskIcon className="w-4 h-4 text-white" />
                      <span>GUARDAR</span>
                    </button>

                    {/* Botón CALCULAR */}
                    <button
                      type="button"
                      onClick={() => setIsRiskCalculatorOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow transition-all h-[38px] cursor-pointer whitespace-nowrap"
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M12 4L4 20H20L12 4Z" />
                      </svg>
                      <span>CALCULAR</span>
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
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Marcar todos los controles que apliquen:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {additionalControlsItems.map(item => (
                            <label
                              key={item.key}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm font-medium select-none ${
                                formData[item.key as keyof FichaIngresoEcicepFormData]
                                  ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                name={item.key}
                                checked={!!formData[item.key as keyof FichaIngresoEcicepFormData]}
                                onChange={handleChange}
                                className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 shrink-0"
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        {/* Panel: Cardiovascular */}
                        {formData.incluirControlCardiovascular && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Cardiovasculares</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {cvSymptomsItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaIngresoEcicepFormData] as boolean} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Panel: Hipotiroidismo */}
                        {formData.incluirControlHipotiroidismo && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Hipotiroidismo</h4>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-2">Síntomas actuales:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                {[
                                  { key: 'hipo_sintoma_astenias', label: 'Astenia/fatiga' },
                                  { key: 'hipo_sintoma_somnolencia', label: 'Somnolencia' },
                                  { key: 'hipo_sintoma_constipacion', label: 'Constipación' },
                                  { key: 'hipo_sintoma_intolerancia_frio', label: 'Intolerancia al frío' },
                                  { key: 'hipo_sintoma_edema', label: 'Edema (mixedema)' },
                                  { key: 'hipo_sintoma_aumento_peso', label: 'Aumento de peso' },
                                  { key: 'hipo_sintoma_piel_seca', label: 'Piel seca' },
                                  { key: 'hipo_sintoma_caida_cabello', label: 'Caída de cabello' },
                                  { key: 'hipo_sintoma_calambres', label: 'Calambres musculares' },
                                ].map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-0.5">
                                    <input type="checkbox" id={item.key} name={item.key} checked={!!(formData as any)[item.key]} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="Fecha TSH" id="hipo_tsh_fecha" name="hipo_tsh_fecha" value={(formData as any).hipo_tsh_fecha || ''} onChange={handleChange} placeholder="DD-MM-AAAA" />
                              <FormField label="TSH (resultado)" id="hipo_tsh_resultado" name="hipo_tsh_resultado" value={(formData as any).hipo_tsh_resultado || ''} onChange={handleChange} placeholder="ej. 4.5 mUI/L" />
                              <FormField label="T4 libre (resultado)" id="hipo_t4l_resultado" name="hipo_t4l_resultado" value={(formData as any).hipo_t4l_resultado || ''} onChange={handleChange} placeholder="ej. 1.2 ng/dL" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {renderRadioGroup("Adherencia a Levotiroxina", "hipo_adherencia_levotiroxina" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}])}
                              {renderRadioGroup("Ayuno correcto (30 min post dosis)", "hipo_ayuno_correcto" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'}])}
                              {renderRadioGroup("Fármacos que interfieren absorción", "hipo_farmacos_interferentes" as any, [{value:'Niega',label:'Niega'},{value:'Sí',label:'Sí'}])}
                            </div>
                            <AutoExpandingTextArea label="Observaciones" id="hipo_observaciones" name="hipo_observaciones" value={(formData as any).hipo_observaciones || ''} onChange={handleChange as any} placeholder="Observaciones del control de hipotiroidismo..." />
                          </div>
                        )}

                        {/* Panel: Artrosis */}
                        {formData.incluirControlArtrosis && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Artrosis</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AutoExpandingTextArea label="Articulaciones afectadas" id="art_articulaciones_afectadas" name="art_articulaciones_afectadas" value={(formData as any).art_articulaciones_afectadas || ''} onChange={handleChange as any} placeholder="ej. Rodillas bilaterales, cadera izquierda..." />
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dolor (EVA 0-10):</label>
                                <div className="flex items-center gap-3">
                                  <input type="range" min="0" max="10" step="1" value={(formData as any).art_dolor_eva || 0} onChange={(e) => setFormData(prev => ({ ...prev, art_dolor_eva: e.target.value } as any))} className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600" />
                                  <span className="text-lg font-bold text-sky-700 w-6 text-center">{(formData as any).art_dolor_eva || 0}</span>
                                </div>
                              </div>
                            </div>
                            <AutoExpandingTextArea label="Limitación funcional" id="art_limitacion_funcional" name="art_limitacion_funcional" value={(formData as any).art_limitacion_funcional || ''} onChange={handleChange as any} placeholder="ej. Dificultad para subir escaleras, limitación para marcha prolongada..." />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {renderRadioGroup("Uso de analgésicos", "art_uso_analgesicos" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Ocasional',label:'Ocasional'}])}
                              {renderRadioGroup("Kinesiterapia", "art_kinesiterapia" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Derivado',label:'Derivado'}])}
                              {renderRadioGroup("Ayudas técnicas", "art_ayudas_tecnicas" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'}])}
                            </div>
                            {(formData as any).art_uso_analgesicos === 'Sí' && (
                              <FormField label="¿Cuáles analgésicos?" id="art_analgesicos_cuales" name="art_analgesicos_cuales" value={(formData as any).art_analgesicos_cuales || ''} onChange={handleChange} placeholder="ej. Paracetamol 1g, Ibuprofeno 400mg..." />
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="Radiografía (fecha)" id="art_radiografia_fecha" name="art_radiografia_fecha" value={(formData as any).art_radiografia_fecha || ''} onChange={handleChange} placeholder="DD-MM-AAAA" />
                              <div className="sm:col-span-2">
                                <AutoExpandingTextArea label="Resultado radiografía" id="art_radiografia_resultado" name="art_radiografia_resultado" value={(formData as any).art_radiografia_resultado || ''} onChange={handleChange as any} placeholder="ej. Pinzamiento del espacio articular..." />
                              </div>
                            </div>
                            <AutoExpandingTextArea label="Observaciones" id="art_observaciones" name="art_observaciones" value={(formData as any).art_observaciones || ''} onChange={handleChange as any} placeholder="Observaciones del control de artrosis..." />
                          </div>
                        )}

                        {/* Panel: Epilepsia */}
                        {formData.incluirControlEpilepsia && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Epilepsia</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AutoExpandingTextArea label="Tipo de crisis" id="epi_tipo_crisis" name="epi_tipo_crisis" value={(formData as any).epi_tipo_crisis || ''} onChange={handleChange as any} placeholder="ej. Crisis tónico-clónicas generalizadas, crisis focales..." />
                              <AutoExpandingTextArea label="Fármaco antiepiléptico" id="epi_farmaco_antiepiléptico" name="epi_farmaco_antiepiléptico" value={(formData as any).epi_farmaco_antiepiléptico || ''} onChange={handleChange as any} placeholder="ej. Ácido Valproico 500mg, Carbamazepina 200mg..." />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="Última crisis (fecha)" id="epi_ultima_crisis_fecha" name="epi_ultima_crisis_fecha" value={(formData as any).epi_ultima_crisis_fecha || ''} onChange={handleChange} placeholder="DD-MM-AAAA" />
                              <FormField label="Frecuencia de crisis" id="epi_frecuencia_crisis" name="epi_frecuencia_crisis" value={(formData as any).epi_frecuencia_crisis || ''} onChange={handleChange} placeholder="ej. Sin crisis en 6 meses, 1 al mes..." />
                              {renderRadioGroup("Adherencia a FAE", "epi_adherencia" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}])}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="Niveles plasmáticos (fecha)" id="epi_niveles_plasmaticos_fecha" name="epi_niveles_plasmaticos_fecha" value={(formData as any).epi_niveles_plasmaticos_fecha || ''} onChange={handleChange} placeholder="DD-MM-AAAA" />
                              <FormField label="Niveles plasmáticos (resultado)" id="epi_niveles_plasmaticos_resultado" name="epi_niveles_plasmaticos_resultado" value={(formData as any).epi_niveles_plasmaticos_resultado || ''} onChange={handleChange} placeholder="ej. VPA 75 μg/mL (normal)" />
                              {renderRadioGroup("Efectos secundarios referidos", "epi_efectos_secundarios" as any, [{value:'Niega',label:'Niega'},{value:'Sí',label:'Sí'}])}
                            </div>
                            {renderRadioGroup("Restricción para conducir vehículos", "epi_restricciones_conduccion" as any, [{value:'Sí, informado',label:'Sí, informado'},{value:'No aplica',label:'No aplica'}])}
                            <AutoExpandingTextArea label="Observaciones" id="epi_observaciones" name="epi_observaciones" value={(formData as any).epi_observaciones || ''} onChange={handleChange as any} placeholder="Observaciones del control de epilepsia..." />
                          </div>
                        )}

                        {/* Panel: Sala ERA */}
                        {formData.incluirControlSalaEra && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas Respiratorios (Sala ERA)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {eraSymptomsItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaIngresoEcicepFormData] as boolean} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                </div>
                              ))}
                            </div>
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mt-4 mb-3 tracking-widest border-b border-sky-100 pb-1">Desencadenantes Ambientales</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {eraTriggersItems.map(item => (
                                <div key={item.key} className="flex items-center gap-2 py-1">
                                  <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaIngresoEcicepFormData] as boolean} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                  <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Panel: Sala IRA */}
                        {formData.incluirControlSalaIra && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Sala IRA</h4>
                            <AutoExpandingTextArea label="Diagnóstico IRA" id="ira_diagnostico" name="ira_diagnostico" value={(formData as any).ira_diagnostico || ''} onChange={handleChange as any} placeholder="ej. Neumonía adquirida en la comunidad, Broncoespasmo..." />
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-2">Síntomas actuales:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                {[
                                  { key: 'ira_sintoma_tos', label: 'Tos' },
                                  { key: 'ira_sintoma_fiebre', label: 'Fiebre' },
                                  { key: 'ira_sintoma_rinorrea', label: 'Rinorrea' },
                                  { key: 'ira_sintoma_odinofagia', label: 'Odinofagia' },
                                  { key: 'ira_sintoma_disnea', label: 'Disnea' },
                                ].map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-0.5">
                                    <input type="checkbox" id={item.key} name={item.key} checked={!!(formData as any)[item.key]} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="Saturación O₂ (%)" id="ira_saturacion" name="ira_saturacion" value={(formData as any).ira_saturacion || ''} onChange={handleChange} placeholder="ej. 97" />
                              <FormField label="FR (resp/min)" id="ira_fr" name="ira_fr" value={(formData as any).ira_fr || ''} onChange={handleChange} placeholder="ej. 18" />
                              {renderRadioGroup("Broncodilatador", "ira_uso_broncodilatador" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'}])}
                            </div>
                            {(formData as any).ira_uso_broncodilatador === 'Sí' && (
                              <FormField label="¿Cuál broncodilatador?" id="ira_broncodilatador_cual" name="ira_broncodilatador_cual" value={(formData as any).ira_broncodilatador_cual || ''} onChange={handleChange} placeholder="ej. Salbutamol 100mcg, 2 puff c/8h" />
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {renderRadioGroup("Nebulización", "ira_nebulizacion" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'}])}
                              {renderRadioGroup("Rx Tórax", "ira_rx_torax" as any, [{value:'Normal',label:'Normal'},{value:'Alterada',label:'Alterada'},{value:'No realizada',label:'No realizada'}])}
                            </div>
                            {(formData as any).ira_rx_torax === 'Alterada' && (
                              <AutoExpandingTextArea label="Resultado Rx Tórax" id="ira_rx_resultado" name="ira_rx_resultado" value={(formData as any).ira_rx_resultado || ''} onChange={handleChange as any} placeholder="Descripción del hallazgo radiológico..." />
                            )}
                            <AutoExpandingTextArea label="Observaciones" id="ira_observaciones" name="ira_observaciones" value={(formData as any).ira_observaciones || ''} onChange={handleChange as any} placeholder="Observaciones del control IRA..." />
                          </div>
                        )}

                        {/* Panel: Demencias */}
                        {formData.incluirControlDemencias && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-4">
                            <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Control Demencias</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <AutoExpandingTextArea label="Diagnóstico" id="dem_diagnostico" name="dem_diagnostico" value={(formData as any).dem_diagnostico || ''} onChange={handleChange as any} placeholder="ej. Enfermedad de Alzheimer, Demencia vascular..." />
                              {renderRadioGroup("Estadio", "dem_estadio" as any, [{value:'Leve',label:'Leve'},{value:'Moderado',label:'Moderado'},{value:'Severo',label:'Severo'}])}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FormField label="MMSE (fecha)" id="dem_mmse_fecha" name="dem_mmse_fecha" value={(formData as any).dem_mmse_fecha || ''} onChange={handleChange} placeholder="DD-MM-AAAA" />
                              <FormField label="MMSE (puntaje /30)" id="dem_mmse_puntaje" name="dem_mmse_puntaje" value={(formData as any).dem_mmse_puntaje || ''} onChange={handleChange} placeholder="ej. 22/30" />
                              <FormField label="Barthel (puntaje /100)" id="dem_barthel_puntaje" name="dem_barthel_puntaje" value={(formData as any).dem_barthel_puntaje || ''} onChange={handleChange} placeholder="ej. 85/100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <FormField label="Cuidador principal" id="dem_cuidador_principal" name="dem_cuidador_principal" value={(formData as any).dem_cuidador_principal || ''} onChange={handleChange} placeholder="ej. Hija, cónyuge, cuidadora contratada..." />
                              {renderRadioGroup("Sobrecarga del cuidador", "dem_sobrecarga_cuidador" as any, [{value:'No',label:'No'},{value:'Leve',label:'Leve'},{value:'Severa',label:'Severa'}])}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-2">Síntomas conductuales y funcionales:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                                {[
                                  { key: 'dem_sintoma_deambulacion', label: 'Alt. deambulación' },
                                  { key: 'dem_sintoma_alimentacion', label: 'Alt. alimentación' },
                                  { key: 'dem_sintoma_continencia', label: 'Incontinencia' },
                                  { key: 'dem_sintoma_conductas', label: 'Conductas disruptivas' },
                                  { key: 'dem_sintoma_agitacion', label: 'Agitación' },
                                ].map(item => (
                                  <div key={item.key} className="flex items-center gap-2 py-0.5">
                                    <input type="checkbox" id={item.key} name={item.key} checked={!!(formData as any)[item.key]} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                                    <label htmlFor={item.key} className="text-xs font-medium text-slate-700 cursor-pointer">{item.label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <FormField label="Fármaco antidemencia" id="dem_farmaco_antidemencia" name="dem_farmaco_antidemencia" value={(formData as any).dem_farmaco_antidemencia || ''} onChange={handleChange} placeholder="ej. Donepezilo 10mg, Memantina 10mg..." />
                              {renderRadioGroup("Adherencia farmacológica", "dem_adherencia" as any, [{value:'Sí',label:'Sí'},{value:'No',label:'No'},{value:'Irregular',label:'Irregular'}])}
                            </div>
                            {renderRadioGroup("Derivación a especialidad", "dem_derivacion_especialidad" as any, [{value:'No',label:'No'},{value:'Neurología',label:'Neurología'},{value:'Psiquiatría',label:'Psiquiatría'},{value:'Geriatría',label:'Geriatría'}])}
                            <AutoExpandingTextArea label="Observaciones" id="dem_observaciones" name="dem_observaciones" value={(formData as any).dem_observaciones || ''} onChange={handleChange as any} placeholder="Observaciones del control de demencias..." />
                          </div>
                        )}

                        {/* Panel: SM */}
                        {formData.incluirControlSm && (
                          <div className="mt-4 p-4 bg-slate-50 border border-sky-200 rounded-xl shadow-sm animate-fadeIn space-y-6">
                            <div>
                              <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Síntomas SM</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AutoExpandingTextArea label="Ánimo" id="sm_sintoma_animo" name="sm_sintoma_animo" value={formData.sm_sintoma_animo || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Síntomas ansiosos" id="sm_sintoma_ansiosos" name="sm_sintoma_ansiosos" value={formData.sm_sintoma_ansiosos || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Somatizaciones" id="sm_sintoma_somatizaciones" name="sm_sintoma_somatizaciones" value={formData.sm_sintoma_somatizaciones || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Alteraciones del sueño" id="sm_sintoma_sueno" name="sm_sintoma_sueno" value={formData.sm_sintoma_sueno || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Síntomas psicóticos" id="sm_sintoma_psicoticos" name="sm_sintoma_psicoticos" value={formData.sm_sintoma_psicoticos || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Ideación suicida" id="sm_sintoma_suicidio" name="sm_sintoma_suicidio" value={formData.sm_sintoma_suicidio || ''} onChange={handleChange as any} />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-black text-sky-800 uppercase mb-3 tracking-widest border-b border-sky-100 pb-1">Examen Mental</h4>
                              <div className="space-y-4">
                                <AutoExpandingTextArea label="Descripción inicial" id="sm_em_descripcion" name="sm_em_descripcion" value={formData.sm_em_descripcion || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Conciencia/orientación/memoria" id="sm_em_conciencia" name="sm_em_conciencia" value={formData.sm_em_conciencia || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Lenguaje" id="sm_em_lenguaje" name="sm_em_lenguaje" value={formData.sm_em_lenguaje || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Psicomotricidad o conación" id="sm_em_psicomotricidad" name="sm_em_psicomotricidad" value={formData.sm_em_psicomotricidad || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Juicio de realidad" id="sm_em_juicio" name="sm_em_juicio" value={formData.sm_em_juicio || ''} onChange={handleChange as any} />
                                <AutoExpandingTextArea label="Conciencia de enfermedad (insight)" id="sm_em_insight" name="sm_em_insight" value={formData.sm_em_insight || ''} onChange={handleChange as any} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <section id="sec-antecedentes" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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



                <section id="sec-atenciones" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4"><h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Atenciones Vigentes</h3>
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
                          value={(formData[field.name as keyof FichaIngresoEcicepFormData] as string) || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                          placeholder={field.placeholder}
                          disabled={formData[field.name as keyof FichaIngresoEcicepFormData] === 'No aplica.'}
                          options={field.options}
                        />
                      </div>
                      {/* Botón N/A: altura fija que coincide con el bloque de texto por defecto, no crece */}
                      <div className="flex-shrink-0 self-start mt-[26px]">
                        <button
                          type="button"
                          onClick={() => {
                            const isNA = formData[field.name as keyof FichaIngresoEcicepFormData] === 'No aplica.';
                            setFormData(prev => ({ ...prev, [field.name]: isNA ? '' : 'No aplica.' }));
                          }}
                          className={`flex flex-col items-center justify-center gap-0.5 w-10 h-[60px] rounded-lg border transition-colors select-none ${formData[field.name as keyof FichaIngresoEcicepFormData] === 'No aplica.' ? 'bg-sky-500 border-sky-600 text-white' : 'bg-white border-slate-300 text-slate-400 hover:border-sky-300 hover:text-sky-500'}`}
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

                {formData.sexo === 'Femenino' && (
                  <section id="sec-gineco" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Gineco-Obstetricia</h3>
                    <FormField label="Antecedentes Gineco-Obstétricos" id="antecedentesGineco" name="antecedentesGineco" value={formData.antecedentesGineco || ''} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="FUM (Fecha Última Menstruación)" id="fum" name="fum" value={formData.fum || ''} onChange={handleChange} placeholder="Ej: 15-05-2023 o 'Hace 2 meses'" />
                    <FormField label="Síntomas Climaterio" id="sintomasClimaterio" name="sintomasClimaterio" value={formData.sintomasClimaterio || ''} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Mamografía al día" id="mamografiaDia" name="mamografiaDia" value={formData.mamografiaDia || ''} onChange={handleChange} placeholder="Sí/No o fecha último examen" />
                    <FormField label="PAP Vigente" id="papVigente" name="papVigente" value={formData.papVigente || ''} onChange={handleChange} placeholder="Sí/No o fecha último examen" />
                  </section>
                )}

                <section id="sec-habitos" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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

                <section id="sec-animo" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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


                <section id="sec-dimension-social" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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

                  <FormField label="Antecedentes familiares relevantes" id="antecedentesFamiliaresRelevantes" name="antecedentesFamiliaresRelevantes" value={formData.antecedentesFamiliaresRelevantes || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon || ''} onChange={handleChange} />
                  <FormField label="Factores protectores" id="factoresProtectores" name="factoresProtectores" value={formData.factoresProtectores || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Estado civil/hijos" id="estadoCivilHijos" name="estadoCivilHijos" value={formData.estadoCivilHijos || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Redes de apoyo" id="redesApoyo" name="redesApoyo" value={formData.redesApoyo || ''} onChange={handleChange} isTextArea rows={2} />
                  <FormField label="Percepción de situación económica" id="percepcionSituacionEconomica" name="percepcionSituacionEconomica" value={formData.percepcionSituacionEconomica || ''} onChange={handleChange} />


                </section>

                <section id="sec-estudios" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2 flex-grow">Estudios Recientes (Lab, EKG, Imágenes)</h3>
                    <input type="file" ref={labFileRef} onChange={handleLabFileChange} className="hidden" accept="application/pdf,image/*" />
                    <input type="file" ref={ekgFileRef} onChange={handleEkgFileChange} className="hidden" accept="application/pdf,image/*" />
                    <input type="file" ref={imgFileRef} onChange={handleImgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>

                  {labError && <p className="text-red-500 text-xs mb-0">{labError}</p>}
                  <div className="mb-0">
                    <DateField
                      label="Laboratorio"
                      id="laboratorioFecha"
                      name="laboratorioFecha"
                      value={formData.laboratorioFecha || ''}
                      onChange={handleChange as any}
                      containerClassName="mb-0 flex-grow"
                      labelPrefix={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-700 shrink-0 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      }
                    />
                  </div>
                  <textarea value={formData.laboratorioResultados || ''} onChange={handleChange as any} name="laboratorioResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]" placeholder="Resultados del último laboratorio..."></textarea>

                  {ekgError && <p className="text-red-500 text-xs mt-1 mb-0">{ekgError}</p>}
                  <DateField
                    label="Electrocardiograma"
                    id="ekgFecha"
                    name="ekgFecha"
                    value={formData.ekgFecha || ''}
                    onChange={handleChange as any}
                    containerClassName="mb-0 flex-grow"
                    labelPrefix={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-700 shrink-0 ml-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2l2-5 4 10 3-7 2 2h5" />
                      </svg>
                    }
                  />
                  <textarea value={formData.ekgResultado || ''} onChange={handleChange as any} name="ekgResultado" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"></textarea>

                  <div className="flex items-center gap-1.5 mb-1 mt-1">
                    <h4 className="block text-sm font-medium text-slate-700">Imágenes y otros estudios</h4>
                  </div>
                  {imgError && <p className="text-red-500 text-xs mt-1 mb-1">{imgError}</p>}
                  <textarea value={formData.otrasImagenesResultados || ''} onChange={handleChange as any} name="otrasImagenesResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"></textarea>
                </section>

                <section id="sec-examen-fisico" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Examen Físico</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso || ''} onChange={handleChange} type="number" step="0.1" inputClassName="!h-[42px]" />
                    <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla || ''} onChange={handleChange} type="number" inputClassName="!h-[42px]" />
                    <FormField label="IMC (kg/m²)" id="imc" name="imc" value={formData.imc || ''} onChange={handleChange} readOnly disabled inputClassName="!h-[42px]" />
                    <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa || ''} onChange={handleChange} inputClassName="!h-[42px]" />
                    <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc || ''} onChange={handleChange} type="number" inputClassName="!h-[42px]" />
                    <FormField label="CC (cm)" id="cc" name="cc" value={formData.cc || ''} onChange={handleChange} type="number" inputClassName="!h-[42px]" />
                  </div>
                  <FormField label="Examen Físico General/Segmentario" id="efGeneralSegmentario" name="efGeneralSegmentario" value={formData.efGeneralSegmentario || ''} onChange={handleChange} isTextArea rows={10} />

                  {formData.duplaProfesionalOtro === 'Kinesiólogo' && (
                    <div className="mt-4 p-4 bg-white border border-emerald-100 rounded-xl shadow-sm animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Escala de Borg Modificada</h4>
                          {formData.borgScaleResult ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                {formData.borgScaleResult}
                              </span>
                              <button
                                onClick={() => setFormData(prev => ({ ...prev, borgScaleResult: '' }))}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Eliminar resultado"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No se ha evaluado la escala aún.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBorgModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white font-black rounded-lg hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Evaluar Escala BORG
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <section id="sec-valoracion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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

                <section id="sec-pci" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2"><h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS</h3>

                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-1.5 uppercase text-xs tracking-wider">PROBLEMAS VISUALIZADOS</h4>
                    <div className="space-y-1.5">
                      <AutoExpandingTextArea label="Persona y familia" id="pccPersonaFamilia" name="pccPersonaFamilia" value={formData.pccPersonaFamilia || ''} onChange={handleChange as any} />
                      <AutoExpandingTextArea label="Equipo de salud" id="pccEquipoSalud" name="pccEquipoSalud" value={formData.pccEquipoSalud || ''} onChange={handleChange as any} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-1.5 uppercase text-xs tracking-wider">PRIORIZACIÓN DE PROBLEMAS</h4>
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

                  <div>
                    <h4 className="text-md font-bold text-slate-800 mb-1.5 uppercase text-xs tracking-wider mt-2">OPCIONES CONVERSADAS (AGREGAR ACTIVOS COMUNITARIOS)</h4>
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
                    <div className="flex flex-col gap-1.5 mb-1">
                      <h4 className="text-md font-bold text-slate-800 uppercase text-xs tracking-wider">PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS</h4>
                      <div className="flex gap-2">
                        <div className="relative" ref={predefinedPlanRef}>
                          <button
                            type="button"
                            onClick={() => setIsPredefinedPlanOpen(!isPredefinedPlanOpen)}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            AGREGAR PLAN PREDETERMINADO
                          </button>
                          {isPredefinedPlanOpen && (
                            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                              <div className="p-3 bg-slate-100 border-b border-slate-200">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={planSearchTerm}
                                    onChange={(e) => setPlanSearchTerm(e.target.value)}
                                    placeholder="Buscar plan..."
                                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none"
                                    autoFocus
                                  />
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                              </div>
                              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {filteredPredefinedPlans.length > 0 ? (
                                  filteredPredefinedPlans.map((plan, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleAddPredefinedPlan(plan)}
                                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-b border-slate-50 last:border-b-0 transition-colors"
                                    >
                                      <span className="font-bold block leading-tight">{plan.acuerdo}</span>
                                      <span className="text-[10px] text-slate-500 truncate block mt-0.5">{plan.acciones}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-xs text-slate-400 italic">No se encontraron planes.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPccObjetivo}
                          className="flex items-center px-4 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-md hover:bg-sky-700 transition-colors shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          AGREGAR OBJETIVO
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {formData.pccObjetivos.map((obj, index) => (
                        <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-lg shadow-sm relative animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => handleRemovePccObjetivo(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                            title="Eliminar objetivo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <h5 className="text-sm font-bold text-sky-800 mb-4 bg-sky-50 px-2 py-1 inline-block rounded">OBJETIVO/META #${index + 1}</h5>
                          <div className="space-y-4">
                            <AutoExpandingTextArea
                              label="Objetivo"
                              id={`obj-objetivo-${index}`}
                              name={`obj-objetivo-${index}`}
                              value={obj.objetivo || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'objetivo', e.target.value)}
                            />
                            <AutoExpandingTextArea
                              label="Acuerdo"
                              id={`obj-acuerdo-${index}`}
                              name={`obj-acuerdo-${index}`}
                              value={obj.acuerdo || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'acuerdo', e.target.value)}
                            />
                            <AutoExpandingTextArea
                              label="Acciones específicas"
                              id={`obj-acciones-${index}`}
                              name={`obj-acciones-${index}`}
                              value={obj.acciones || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'acciones', e.target.value)}
                            />
                            <AutoExpandingTextArea
                              label="Plazo"
                              id={`obj-plazo-${index}`}
                              name={`obj-plazo-${index}`}
                              value={obj.plazo || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'plazo', e.target.value)}
                            />
                            <AutoExpandingTextArea
                              label="Responsable/s"
                              id={`obj-resp-${index}`}
                              name={`obj-resp-${index}`}
                              value={obj.responsables || ''}
                              onChange={(e) => handleUpdatePccObjetivo(index, 'responsables', e.target.value)}
                            />
                            <AutoExpandingTextArea label="Seguimiento" id={`obj-seguimiento-${index}`} name={`obj-seguimiento-${index}`} value={obj.seguimiento || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'seguimiento', e.target.value)} containerClassName="flex-grow min-h-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    {renderRadioGroup("¿Está de acuerdo con el plan elaborado en conjunto con el equipo ECICEP?", "acuerdoPlanEquipo", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                    {renderRadioGroup("¿Está de acuerdo con que lo contactemos para seguimiento?", "acuerdoContactoSeguimiento", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                  </div>

                  <div className="p-3 border border-slate-200 rounded-md bg-white mb-4">
                    <h4 className="text-md font-medium text-slate-600 mb-2">Solicitudes y derivaciones adicionales:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      {planCheckboxItemsEcicepConfig.map(item => (
                        <div key={item.key as string} className="mb-2 pl-2 border-l-2 border-sky-100 py-1">
                          <div className="flex items-center">
                            <input type="checkbox" id={item.key as string} name={item.key as string} checked={formData[item.key]} onChange={handleChange} className="form-checkbox h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                            <label htmlFor={item.key as string} className="ml-2 text-sm font-medium text-slate-700">{item.label}</label>
                          </div>
                          {item.detailKey && (formData[item.key]) && (
                            <FormField
                              label=""
                              id={item.detailKey as string}
                              name={item.detailKey as string}
                              value={formData[item.detailKey as keyof FichaIngresoEcicepFormData] as string}
                              onChange={handleChange}
                              placeholder={item.detailPlaceholder || 'Ingrese detalle...'}
                              containerClassName="mt-1.5 ml-6 text-xs"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </section>

                <section id="sec-proximo-control" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-0"><h3 className="text-lg font-semibold mb-2 text-sky-700 border-b border-sky-200 pb-2">Próximo Control</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="planProximoControlTiempo" className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                        <select
                          id="planProximoControlTiempo"
                          name="planProximoControlTiempo"
                          value={formData.planProximoControlTiempo || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none"
                        >
                          <option value="">Seleccione...</option>
                          {tiempoControlOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="planProximoControlDupla" className="block text-sm font-medium text-slate-700 mb-1.5">Dupla para próximo control</label>
                        <select id="planProximoControlDupla" name="planProximoControlDupla" value={formData.planProximoControlDupla || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-800 font-sans text-sm font-normal outline-none">
                          {duplaProfesionalOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                </section>

                <section id="sec-indicaciones" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-0"><h3 className="text-lg font-semibold mb-2 text-sky-700 border-b border-sky-200 pb-2">Indicaciones Adicionales</h3>
                  <FormField label="" id="indicaciones" name="indicaciones" value={formData.indicaciones || ''} onChange={handleChange} isTextArea rows={4} placeholder="Ingrese indicaciones adicionales o detalles del plan aquí..." />
                </section>
              </form>
          </div>

            
          {/* Columna Derecha: Marco Blanco con tarjeta #F8FAFC + Botones sin negrita alineados */}
          <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
            {/* Tarjeta de Resumen 1/3 más alta */}
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
                  <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
                {/* Bloque Exploración */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                    <CopyButton textToCopy={exploracionText} />
                  </div>
                  <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
                {/* Bloque Actuación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                    <CopyButton textToCopy={actuacionText} />
                  </div>
                  <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
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
                  generateEcicepResumenPdf(formData, loggedInUser);
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

        <PHQ9Modal
          isOpen={isPhq9ModalOpen}
          onClose={() => setIsPhq9ModalOpen(false)}
          formData={formData}
          handleRadioChange={handleRadioChange as any}
        />
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onConfirmImport={handleAiImport}
          isImporting={isAiImporting}
          title="Importar desde Preingreso/Seguimiento ECICEP"
          description="Pegue aquí el texto del registro anterior para autocompletar la ficha."
        />
        <EcicepRiskCalculatorModal
          isOpen={isRiskCalculatorOpen}
          onClose={() => setIsRiskCalculatorOpen(false)}
          onCalculate={(result) => setFormData(prev => ({ ...prev, estratificacion: result }))}
        />
        <BorgScaleModal
          isOpen={isBorgModalOpen}
          onClose={() => setIsBorgModalOpen(false)}
          onSave={(val) => setFormData(prev => ({ ...prev, borgScaleResult: val }))}
        />
        <FactoresRiesgoModal
          isOpen={isFactoresRiesgoModalOpen}
          onClose={() => setIsFactoresRiesgoModalOpen(false)}
          selectedFactors={formData.factoresRiesgo || []}
          onChange={(factors) => setFormData(prev => ({ ...prev, factoresRiesgo: factors }))}
        />
        <CrearImportarPatientModal
          isOpen={isImportPatientModalOpen}
          onClose={() => setIsImportPatientModalOpen(false)}
          onSelectPatient={(patient, fichaSnapshot) => {
            setActiveImportedPatient(patient);
            handleSelectImportPatient(patient, fichaSnapshot);
          }}
        />
        <GuardarFichaModal
          isOpen={isSavePatientModalOpen}
          onClose={() => setIsSavePatientModalOpen(false)}
          activePatient={activeImportedPatient}
          onConfirmSave={(selectedPatient) => {
            const res = patientStore.addFichaToPatient(
              selectedPatient.rut,
              'Ingreso ECICEP',
              formData,
              formData.fechaIngreso,
              'ecicep'
            );
            if (res) {
              setActiveImportedPatient(res.patient);
              alert(`Ficha "${res.fichaEntry.nombreNominal}" guardada exitosamente para el paciente ${res.patient.nombre}.`);
            }
            setIsSavePatientModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

const CrearImportarPatientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: PatientRecord, fichaSnapshot?: any) => void;
}> = ({ isOpen, onClose, onSelectPatient }) => {
  const [activeTab, setActiveTab] = useState<'crear' | 'importar'>('importar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForImport, setSelectedPatientForImport] = useState<PatientRecord | null>(null);
  const [selectedFichaId, setSelectedFichaId] = useState<string>('');

  // New patient fields
  const [newFields, setNewFields] = useState({
    rut: '',
    nombre: '',
    edad: '',
    telefono: '+56 9 ',
    sexo: 'Masculino' as const,
    estratificacion: 'G1'
  });

  if (!isOpen) return null;

  const allPatients = patientStore.getPatients();
  const filtered = allPatients.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFields.rut.trim() || !newFields.nombre.trim()) {
      alert('Por favor ingrese RUT y Nombre del paciente.');
      return;
    }

    const saved = patientStore.savePatient({
      rut: newFields.rut.trim(),
      nombre: newFields.nombre.toUpperCase().trim(),
      edad: newFields.edad,
      sexo: newFields.sexo,
      telefono: newFields.telefono,
      estratificacion: newFields.estratificacion,
      fechaUltimaAtencion: 'Sin atenciones',
      ultimaPrestacion: 'No registra',
      prestacionCategory: 'none'
    });

    onSelectPatient(saved);
  };

  // Fichas of the selected patient, most recent first (already stored newest-first)
  const fichasDelPaciente = selectedPatientForImport?.fichasClinicas || [];
  const selectedFicha = fichasDelPaciente.find(f => f.id === selectedFichaId) || fichasDelPaciente[0] || null;

  const handleConfirmImport = () => {
    if (!selectedPatientForImport) return;
    onSelectPatient(selectedPatientForImport, selectedFicha?.formDataSnapshot);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        <header className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MsnMessengerIcon className="w-5 h-5 fill-white text-white" />
            <h2 className="text-base font-bold uppercase tracking-tight">Crear o Importar Paciente</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => { setActiveTab('importar'); setSelectedPatientForImport(null); setSelectedFichaId(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'importar'
                ? 'bg-white text-sky-700 shadow-sm border-t-2 border-sky-600'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Seleccionar Paciente Existente
          </button>
          <button
            onClick={() => setActiveTab('crear')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all ${
              activeTab === 'crear'
                ? 'bg-white text-sky-700 shadow-sm border-t-2 border-sky-600'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            + Crear Nuevo Paciente
          </button>
        </div>

        <main className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'importar' ? (
            <div className="space-y-4">
              {/* Patient search - only show if no patient selected yet */}
              {!selectedPatientForImport ? (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por RUT o Nombre del paciente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3.5 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {filtered.length > 0 ? (
                      filtered.map(patient => (
                        <div key={patient.id} className="p-3 bg-white hover:bg-sky-50/50 flex items-center justify-between transition-colors">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-xs">{patient.nombre.toUpperCase()}</span>
                            <span className="text-[11px] text-slate-500 font-medium">RUT: {patient.rut} | Edad: {patient.edad || 'S/I'} años</span>
                            {(patient.fichasClinicas?.length ?? 0) > 0 && (
                              <span className="text-[10px] text-sky-600 font-semibold mt-0.5">{patient.fichasClinicas!.length} ficha{patient.fichasClinicas!.length !== 1 ? 's' : ''} guardada{patient.fichasClinicas!.length !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPatientForImport(patient);
                              setSelectedFichaId(patient.fichasClinicas?.[0]?.id || '');
                            }}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Seleccionar
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 font-medium">
                        No se encontraron pacientes registrados.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Step 2: Ficha selection for chosen patient */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedPatientForImport(null); setSelectedFichaId(''); }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{selectedPatientForImport.nombre}</p>
                      <p className="text-[11px] text-slate-500">RUT: {selectedPatientForImport.rut}</p>
                    </div>
                  </div>

                  {fichasDelPaciente.length > 0 ? (
                    <>
                      <p className="text-xs text-slate-600 font-medium">Seleccione la ficha a importar <span className="text-sky-600">(más reciente primero):</span></p>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs max-h-60 overflow-y-auto">
                        {fichasDelPaciente.map((ficha, idx) => {
                          const isSelected = selectedFichaId ? selectedFichaId === ficha.id : idx === 0;
                          return (
                            <div
                              key={ficha.id}
                              onClick={() => setSelectedFichaId(ficha.id)}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected ? 'bg-sky-50 border-l-4 border-sky-500' : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <FloppyDiskIcon className="w-3.5 h-3.5 text-sky-500" />
                                  <span className="font-bold text-slate-900">{ficha.nombreNominal}</span>
                                  {idx === 0 && <span className="px-1.5 py-0.5 text-[9px] font-black bg-sky-100 text-sky-700 rounded-full uppercase tracking-wider">Más reciente</span>}
                                </div>
                                <span className="text-[11px] text-slate-500">Fecha: {ficha.fecha}</span>
                              </div>
                              <input
                                type="radio"
                                checked={isSelected}
                                onChange={() => setSelectedFichaId(ficha.id)}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center text-slate-500">
                      <p className="font-medium">Este paciente no tiene fichas guardadas.</p>
                      <p className="mt-1">Se importarán solo los datos del perfil del paciente.</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedPatientForImport(null); setSelectedFichaId(''); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {fichasDelPaciente.length > 0 ? 'Importar Ficha Seleccionada' : 'Importar Perfil del Paciente'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateNewSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500 text-xs">Ingrese los datos personales para crear el registro de un nuevo paciente:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">RUT *</label>
                  <input
                    type="text"
                    required
                    placeholder="12.345.678-9"
                    value={newFields.rut}
                    onChange={(e) => setNewFields(prev => ({ ...prev, rut: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="NOMBRE COMPLETO"
                    value={newFields.nombre}
                    onChange={(e) => setNewFields(prev => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-extrabold uppercase text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Edad</label>
                  <input
                    type="text"
                    placeholder="Ej: 64"
                    value={newFields.edad}
                    onChange={(e) => setNewFields(prev => ({ ...prev, edad: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+56 9 8765 4321"
                    value={newFields.telefono}
                    onChange={(e) => setNewFields(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sexo</label>
                  <select
                    value={newFields.sexo}
                    onChange={(e) => setNewFields(prev => ({ ...prev, sexo: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer"
                >
                  Crear e Importar a Ficha
                </button>
              </div>
            </form>
          )}
        </main>

        <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

const GuardarFichaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activePatient: PatientRecord | null;
  onConfirmSave: (selectedPatient: PatientRecord) => void;
}> = ({ isOpen, onClose, activePatient, onConfirmSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRut, setSelectedRut] = useState<string>('');

  useEffect(() => {
    if (activePatient) {
      setSelectedRut(activePatient.rut);
    }
  }, [activePatient, isOpen]);

  const allPatients = patientStore.getPatients();

  const sortedPatients = useMemo(() => {
    let list = [...allPatients];
    if (activePatient) {
      const idx = list.findIndex(p => p.rut.toLowerCase() === activePatient.rut.toLowerCase());
      if (idx > 0) {
        const [target] = list.splice(idx, 1);
        list.unshift(target);
      }
    }
    return list;
  }, [allPatients, activePatient]);

  const filtered = useMemo(() => {
    return sortedPatients.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rut.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedPatients, searchTerm]);

  const selectedPatient = useMemo(() => {
    return allPatients.find(p => p.rut === selectedRut) || activePatient || filtered[0];
  }, [allPatients, selectedRut, activePatient, filtered]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <header className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <FloppyDiskIcon className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold uppercase tracking-tight">Guardar Ficha en Paciente</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Seleccione el paciente al que desea guardar esta ficha clínica (se almacenará en su historial individual de prestaciones):
          </p>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por RUT o Nombre del paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {filtered.map(patient => {
              const isSelected = (selectedRut ? selectedRut === patient.rut : (selectedPatient && selectedPatient.rut === patient.rut));
              const isDefaultTop = activePatient && activePatient.rut === patient.rut;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedRut(patient.rut)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{patient.nombre.toUpperCase()}</span>
                      {isDefaultTop && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                          Importado en Ficha
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">RUT: {patient.rut} | Edad: {patient.edad || 'S/I'} años</span>
                  </div>

                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedRut(patient.rut)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedPatient}
              onClick={() => selectedPatient && onConfirmSave(selectedPatient)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              Guardar Ficha en Paciente
            </button>
          </div>
        </div>
      </div>
    </div>
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



