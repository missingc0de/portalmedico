import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { FichaControlPscvFormData, FormStatus, User, PccObjetivo } from '../types';
import { FileText, PlusCircle } from 'lucide-react';
import FormField from './FormField';
import DateField from './DateField';
import AvisHojaRutaWizard from './AvisHojaRutaWizard';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import ImportModal from './ImportModal';
import CopyButton from './CopyButton';
import BorgScaleModal from './BorgScaleModal';

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

const calculateIMC = (pesoStr: string, tallaStr: string): string => {
  const peso = parseFloat(pesoStr);
  const tallaCm = parseFloat(tallaStr);
  if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
    const tallaM = tallaCm / 100;
    return (peso / (tallaM * tallaM)).toFixed(2);
  }
  return '';
};

const FACTORES_RIESGO_OPTIONS = [
  "Crisis no normativas", "Cesantía jefe de hogar o sostenedor", "VIF", "Embarazo de riesgo",
  "Consumo OH - Drogas", "Conductas delictuales", "Deficiencia vivienda y/o hacinamiento",
  "Patología o Trastorno psiquiatrico", "Mal nutrición", "Discapacidad - dependencia (desmovilizado)",
  "Enfermedad crónica descompensada", "Hospitalizaciones frecuentes", "Disfunción familiar",
  "Familia monoparental", "Abandono, aislamiento o situación de calle", "Bajo nivel socio cultural",
  "Abuso sexual y/o violación", "Deficiencia red de apoyo comunitario", "Entorno social de riesgo",
  "Deficiencias saneamiento básico", "Deficiencia equipamiento urbano y comunitario",
  "Sobreendeudamiento", "Estrés laboral", "Disfunción laboral", "Sedentarismo", "Tabaquismo"
];

const initialFormData: FichaControlPscvFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  fechaControl: new Date().toISOString().split('T')[0],
  estratificacion: '',
  tipoControlCronico: '',
  // Hipotiroidismo
  hipotiroidismoConstipacion: false, hipotiroidismoConstipacionAclaracion: '',
  hipotiroidismoIntoleranciaFrio: false, hipotiroidismoIntoleranciaFrioAclaracion: '',
  hipotiroidismoDebilidadFanereos: false, hipotiroidismoDebilidadFanereosAclaracion: '',
  hipotiroidismoIncrementoPeso: false, hipotiroidismoIncrementoPesoAclaracion: '',
  hipotiroidismoAdinamia: false, hipotiroidismoAdinamiaAclaracion: '',
  hipotiroidismoRamLevotiroxina: false, hipotiroidismoRamLevotiroxinaAclaracion: '',
  hipotiroidismoActividadFisica: false, hipotiroidismoActividadFisicaAclaracion: '',
  // Epilepsia
  epilepsiaUltimaCrisis: '',
  epilepsiaDesencadenante: '',
  epilepsiaControlesNeurologo: '',
  epilepsiaIndicacionesSecundaria: '',
  // Artrosis
  artrosisDolor: false, artrosisDolorAclaracion: '',
  artrosisRigidezArticular: false, artrosisRigidezArticularAclaracion: '',
  artrosisFracasoAnalgesia: false, artrosisFracasoAnalgesiaAclaracion: '',
  artrosisKinesioterapia: false, artrosisKinesioterapiaAclaracion: '',
  artrosisActividadFisica: false, artrosisActividadFisicaAclaracion: '',
  edad: '',
  sexo: '',
  anamnesisGeneral: '',
  antecedentesPersonales: '',
  morbilidad: '',
  ramFarmacos: 'No',
  ramFarmacosAclaracion: '',
  alergias: 'Niega',
  cirugias: 'Niega',
  hospitalizaciones: 'Niega',
  controlExtrasistema: 'Niega',
  factoresRiesgo: [],
  antecedentesMedicos: '',
  farmacos: '',
  historiaPreviaAcv: false,
  historiaPreviaAcvAclaracion: '',
  historiaPreviaIam: false,
  historiaPreviaIamAclaracion: '',
  antecedentesFamiliaresCv: '',
  adherenciaTratamiento: '',
  dieta: '',
  tabaco: false,
  tabacoAclaracion: '',
  ipaNroCigarrillos: '',
  ipaNroAnos: '',
  ipaResultado: '',
  oh: false,
  ohAclaracion: '',
  drogas: false,
  drogasAclaracion: '',
  actividadFisica: false,
  actividadFisicaAclaracion: '',
  sintomaOrtopnea: false,
  sintomaOrtopneaAclaracion: '',
  sintomaDpn: false,
  sintomaDpnAclaracion: '',
  sintomaNicturia: false,
  sintomaNicturiaAclaracion: '',
  sintomaEdemaEeii: false,
  sintomaEdemaEeiiAclaracion: '',
  sintomaAngor: false,
  sintomaAngorAclaracion: '',
  sintomaPalpitaciones: false,
  sintomaPalpitacionesAclaracion: '',
  sintomaPolidipsia: false,
  sintomaPolidipsiaAclaracion: '',
  sintomaPoliuria: false,
  sintomaPoliuriaAclaracion: '',
  sintomaPolifagia: false,
  sintomaPolifagiaAclaracion: '',
  sintomaBajaPeso: false,
  sintomaBajaPesoAclaracion: '',
  ultimoLaboratorioFecha: '',
  ultimoLaboratorioResultados: '',
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
  efGeneralSegmentario: initialExamenFisicoText,
  borgScaleResult: '',
  integralIndividual: '',
  integralFamiliar: '',
  integralTipologia: '',
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
  planProximoControlTiempo: '',
  planProximoControlDupla: '',
  indicaciones: initialIndicaciones,
};

interface CheckboxClarificationItem {
  key: keyof FichaControlPscvFormData;
  clarificationKey: keyof FichaControlPscvFormData;
  label: string;
}

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
  { value: 'Enfermera', label: 'Enfermera' },
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

const predefinedPccPlans = [
  { objetivo: 'Perder peso.', acuerdo: 'Aumentar actividad física y ejercicios.', acciones: 'Asistir a taller de actividad física, iniciar caminata diaria, hacer ejercicios de estiramientos.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Mejorar adherencia a fármacos.', acuerdo: 'Seguir pauta escrita en horario y frecuencia.', acciones: 'Seguir pauta escrita en horario y frecuencia, poner alarmas y/o armar pastillero.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Retomar controles.', acuerdo: 'Asistir a citas programadas y toma de exámenes.', acciones: 'Realizar toma de exámenes como corresponde, asistir a citas programadas, asistir a próximo control, seguir pautas indicadas en consulta actual.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Fortalecer herramientas para mejorar su SM.', acuerdo: 'Iniciar psicoterapia y análisis de detonantes.', acciones: 'Iniciar psicoterapia, análisis introspectivo de detonantes de síntomas, evitar situaciones de riesgo, definir planes de emergencia ante estresores.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Mejorar hábitos de alimentación saludable.', acuerdo: 'Incorporar más verduras y reducir frituras.', acciones: 'Incorporar > 3 porciones de verduras al día, consumir frutas como colación, preferir preparaciones cocidas/horno/vapor, reducir sal, azúcar y frituras.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Aumentar actividad física regular.', acuerdo: 'Realizar ejercicio físico de forma constante.', acciones: 'Caminar al menos 30 minutos 5 días/semana o actividad equivalente, iniciar de forma progresiva, registrar actividad en calendario o app, evitar sedentarismo prolongado.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Optimizar autocontrol de presión arterial.', acuerdo: 'Realizar registros de presión en domicilio.', acciones: 'Control domiciliario de PA según indicación, registrar valores en libreta, traer registros a controles, reconocer signos de alarma.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Optimizar autocontrol de glicemia.', acuerdo: 'Realizar registros de glicemia en domicilio.', acciones: 'Control domiciliario de glicemia según indicación, registrar valores en libreta, traer registros a controles, reconocer signos de alarma.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Disminuir consumo de tabaco.', acuerdo: 'Reducir o suspender el hábito tabáquico.', acciones: 'Definir fecha de suspensión, reducir consumo progresivo, evitar desencadenantes, apoyo familiar, considerar terapia farmacológica o programa cesación.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Reducir consumo de alcohol.', acuerdo: 'Limitar o suspender el consumo de alcohol.', acciones: 'Limitar consumo a ocasiones puntuales o suspender, evitar compra domiciliaria, identificar situaciones de riesgo, apoyo familiar, derivación a consejería si precisa.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Mejorar higiene del sueño.', acuerdo: 'Adoptar hábitos para un mejor descanso nocturno.', acciones: 'Horario regular para dormir/levantarse, evitar pantallas 1–2 h antes de dormir, reducir cafeína nocturna, ambiente oscuro/silencioso, evitar siestas prolongadas.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Fortalecer red de apoyo social.', acuerdo: 'Aumentar la vinculación con redes y familia.', acciones: 'Contacto semanal con familiares/amigos, participar en talleres o grupos comunitarios, informar necesidades de salud a cuidador principal.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Prevenir caídas (adulto mayor).', acuerdo: 'Adecuar el entorno y mejorar la estabilidad.', acciones: 'Recortar obstáculos del hogar, usar calzado antideslizante, buena iluminación, uso de ayudas técnicas indicadas, ejercicios de equilibrio/fuerza, revisión de fármacos sedantes.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Mejorar adherencia a controles preventivos.', acuerdo: 'Realizar exámenes y controles de salud pendientes.', acciones: 'Agendar exámenes pendientes (laboratorio, PAP, mamografía, EMPA/EMPAM), registrar fechas en calendario, asistir a controles programados.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Manejo del estrés y salud mental.', acuerdo: 'Aplicar técnicas de relajación y autocuidado.', acciones: 'Practicar técnicas de relajación/respiración 10–15 min diarios, actividades recreativas, organizar rutinas, consultar ante empeoramiento del ánimo o ansiedad.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Educación y autocuidado en diabetes.', acuerdo: 'Aprender y aplicar cuidados específicos de la DM.', acciones: 'Respetar horarios de alimentación, fraccionar comidas, revisar pies diariamente, usar calzado adecuado, reconocer signos de hipo/hiperglicemia.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Control de presión arterial.', acuerdo: 'Adherir a medidas para el control de la HTA.', acciones: 'Reducir sal (<5 g/día), adherir a fármacos, actividad física regular, control domiciliario 2–3 veces/semana, consultar ante cifras elevadas persistentes.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Organización del tratamiento farmacológico.', acuerdo: 'Mantener orden y claridad en la medicación.', acciones: 'Mantener lista actualizada de medicamentos, usar pastillero semanal, llevar fármacos a controles, no suspender sin indicación médica.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Autonomía y funcionalidad (adulto mayor).', acuerdo: 'Mantener la independencia en actividades diarias.', acciones: 'Realizar ejercicios de movilidad/fuerza, mantener actividades de la vida diaria de forma independiente, uso de ayudas técnicas cuando corresponda, kinesiterapia si está indicada.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' },
  { objetivo: 'Autocuidado de los pies (DM).', acuerdo: 'Realizar inspección y cuidado diario de pies.', acciones: 'Inspección diaria de pies, uso de calzado adecuado, secado cuidadoso entre dedos, no caminar descalzo.', plazo: 'Próximo control, para evaluar plan.', responsables: 'Persona.', seguimiento: 'En 2 meses.' }
];

const planCheckboxItemsEcicepConfig = [
  { key: 'planEcicepLabsRutina' as keyof FichaControlPscvFormData, label: 'Laboratorios de Rutina', textPrefix: '- Solicito laboratorios de rutina.' },
  { key: 'planEcicepEKG' as keyof FichaControlPscvFormData, label: 'EKG', textPrefix: '- Solicito EKG.' },
  { key: 'planEcicepHBA1C' as keyof FichaControlPscvFormData, label: 'HBA1C', textPrefix: '- Solicito Hemoglobina Glicosilada, realizar en ', detailKey: 'planEcicepHBA1CTiempo' as keyof FichaControlPscvFormData, detailPlaceholder: 'X meses (o según meta)', textSuffix: '.' },
  { key: 'planEcicepFondoOjo' as keyof FichaControlPscvFormData, label: 'Fondo de ojo', textPrefix: '- Solicito Fondo de ojo.' },
  { key: 'planEcicepCtrlPiesEnf' as keyof FichaControlPscvFormData, label: 'Control de pies (Enf.)', textPrefix: '- Derivo a control de pies con Enfermera.' },
  { key: 'planEcicepInterconsulta' as keyof FichaControlPscvFormData, label: 'Interconsulta', textPrefix: '- Solicito interconsulta con ', detailKey: 'planEcicepInterconsultaEspecialidad' as keyof FichaControlPscvFormData, detailPlaceholder: 'especialidad', textSuffix: '.' },
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

const checkboxClarificationConfig: CheckboxClarificationItem[] = [
  { key: 'historiaPreviaAcv', clarificationKey: 'historiaPreviaAcvAclaracion', label: 'ACV' },
  { key: 'historiaPreviaIam', clarificationKey: 'historiaPreviaIamAclaracion', label: 'IAM' },
  { key: 'tabaco', clarificationKey: 'tabacoAclaracion', label: 'Tabaco' },
  { key: 'oh', clarificationKey: 'ohAclaracion', label: 'OH (Alcohol)' },
  { key: 'drogas', clarificationKey: 'drogasAclaracion', label: 'Drogas' },
  { key: 'actividadFisica', clarificationKey: 'actividadFisicaAclaracion', label: 'Actividad Física' },
  { key: 'sintomaOrtopnea', clarificationKey: 'sintomaOrtopneaAclaracion', label: 'Ortopnea' },
  { key: 'sintomaDpn', clarificationKey: 'sintomaDpnAclaracion', label: 'DPN' },
  { key: 'sintomaNicturia', clarificationKey: 'sintomaNicturiaAclaracion', label: 'Nicturia' },
  { key: 'sintomaEdemaEeii', clarificationKey: 'sintomaEdemaEeiiAclaracion', label: 'Edema EEII' },
  { key: 'sintomaAngor', clarificationKey: 'sintomaAngorAclaracion', label: 'Ángor' },
  { key: 'sintomaPalpitaciones', clarificationKey: 'sintomaPalpitacionesAclaracion', label: 'Palpitaciones' },
  { key: 'sintomaPolidipsia', clarificationKey: 'sintomaPolidipsiaAclaracion', label: 'Polidipsia' },
  { key: 'sintomaPoliuria', clarificationKey: 'sintomaPoliuriaAclaracion', label: 'Poliuria' },
  { key: 'sintomaPolifagia', clarificationKey: 'sintomaPolifagiaAclaracion', label: 'Polifagia' },
  { key: 'sintomaBajaPeso', clarificationKey: 'sintomaBajaPesoAclaracion', label: 'Baja de Peso' },
];

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
7. OMITE CUALQUER TÍTULO DE CATEGORÍA de examen (como "EXÁMENES BIOQUÍMICOS", "HEMOGRAMA", etc.). Solo incluye las líneas de resultados individuales.`;
      } else {
        prompt = `Analiza el informe de imagenología o EKG adjunto y transcribe ÚNICAMENTE las secciones de "Hallazgos" e "Impresión/Conclusión". Sigue estas reglas ESTRICTAMENTE:
1. EXTRAE el nombre del estudio y la fecha del examen del documento. Formatea esto como un título en mayúsculas: NOMBRE_DEL_ESTUDIO DD/MM/AAAA.
2. OMITE POR COMPLETO cualquier dato personal del paciente (nombre, RUT, ID, fecha de nacimiento, médico tratante, etc.) y cualquier otra información administrativa.
3. Transcribe textualmente el contenido de las secciones "Hallazgos", "Informe", "Impresión radiológica" o "Conclusión". Mantén la estructura de párrafos original.
4. Si las secciones tienen títulos, inclúyelos (ej. "Hallazgos:", "Conclusión:").`;
      }

      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'Groq-flash-latest',
        contents: { parts: [filePart, textPart] },
      });

      const resultText = response.text || '';
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

interface FichaControlPscvProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  tipoControl?: string;
  fechaControl?: string;
  onTipoControlChange?: (val: string) => void;
  onFechaControlChange?: (val: string) => void;
  actionsRef?: React.MutableRefObject<{ exportPdf: () => void; newForm: () => void } | null>;
}

const FichaControlPscv: React.FC<FichaControlPscvProps> = ({
  onBackToMenu,
  loggedInUser,
  tipoControl,
  fechaControl,
  onTipoControlChange,
  onFechaControlChange,
  actionsRef
}) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlPscvFormData>('local_FichaControlPscv', initialFormData);



  const handleNewDocument = () => {
    if (window.confirm("¿Seguro que desea borrar el formulario actual?")) {
      setFormData(initialFormData);
      setStatus(FormStatus.Idle);
    }
  };

  const ignoreTipoChangeRef = useRef(false);
  const ignoreFechaChangeRef = useRef(false);

  useEffect(() => {
    if (tipoControl !== undefined && tipoControl !== formData.tipoControlCronico) {
      ignoreTipoChangeRef.current = true;
      setFormData(prev => ({ ...prev, tipoControlCronico: tipoControl }));
    }
  }, [tipoControl]);

  useEffect(() => {
    if (fechaControl !== undefined && fechaControl !== formData.fechaControl) {
      ignoreFechaChangeRef.current = true;
      setFormData(prev => ({ ...prev, fechaControl: fechaControl }));
    }
  }, [fechaControl]);

  useEffect(() => {
    if (formData.tipoControlCronico && onTipoControlChange && !tipoControl) {
      onTipoControlChange(formData.tipoControlCronico);
    }
    if (formData.fechaControl && onFechaControlChange && !fechaControl) {
      onFechaControlChange(formData.fechaControl);
    }
  }, []);

  useEffect(() => {
    if (ignoreTipoChangeRef.current) {
      ignoreTipoChangeRef.current = false;
      return;
    }
    if (onTipoControlChange && formData.tipoControlCronico !== tipoControl) {
      onTipoControlChange(formData.tipoControlCronico || '');
    }
  }, [formData.tipoControlCronico, onTipoControlChange, tipoControl]);

  useEffect(() => {
    if (ignoreFechaChangeRef.current) {
      ignoreFechaChangeRef.current = false;
      return;
    }
    if (onFechaControlChange && formData.fechaControl !== fechaControl) {
      onFechaControlChange(formData.fechaControl || '');
    }
  }, [formData.fechaControl, onFechaControlChange, fechaControl]);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiImporting, setIsAiImporting] = useState(false);
  const [isFactoresRiesgoModalOpen, setIsFactoresRiesgoModalOpen] = useState(false);
  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);
  const [isBorgModalOpen, setIsBorgModalOpen] = useState(false);
  const [isPredefinedPlanOpen, setIsPredefinedPlanOpen] = useState(false);

  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const imgFileRef = useRef<HTMLInputElement>(null);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const predefinedPlanRef = useRef<HTMLDivElement>(null);

  const [isLabLoading, setIsLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const [isEkgLoading, setIsEkgLoading] = useState(false);
  const [ekgError, setEkgError] = useState<string | null>(null);
  const ekgFileRef = useRef<HTMLInputElement>(null);


  const handleEkgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'imagenes', setIsEkgLoading, setEkgError, (result) => {
      setFormData(prev => ({ ...prev, ekgResultados: result.text, ...(result.date && { ekgFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
  };

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'laboratorio', setIsLabLoading, setLabError, (result) => {
      setFormData(prev => ({ ...prev, ultimoLaboratorioResultados: result.text, ...(result.date && { ultimoLaboratorioFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
  };

  const handleImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'imagenes', setIsImgLoading, setImgError, (result) => {
      setFormData(prev => ({ ...prev, otrasImagenesResultados: result.text, ...(result.date && { otrasImagenesFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = '';
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
      const ai = getAiClient();
      const schema = {
        type: Type.OBJECT,
        properties: {
          antecedentesMedicos: { type: Type.STRING },
          farmacos: { type: Type.STRING },
          antecedentesFamiliaresCv: { type: Type.STRING },
          adherenciaTratamiento: { type: Type.STRING },
          dieta: { type: Type.STRING },
          ultimoLaboratorioResultados: { type: Type.STRING },
          ekgResultados: { type: Type.STRING },
          peso: { type: Type.STRING },
          talla: { type: Type.STRING },
          pa: { type: Type.STRING },
          fc: { type: Type.STRING },
          cc: { type: Type.STRING },
          examenFisicoPscv: { type: Type.STRING },
          planPscv: { type: Type.STRING },
        },
      };
      const response = await ai.models.generateContent({
        model: 'llama-3.2-90b-vision-preview',
        contents: `Analiza el texto de control PSCV y extrae JSON relevante. Texto: "${pastedText.replace(/"/g, "'")}"`,
        config: { responseMimeType: 'application/json', responseSchema: schema },
      });
      const parsedData = JSON.parse(response.text.trim());
      const updatedFields: Partial<FichaControlPscvFormData> = {};
      Object.keys(parsedData).forEach(key => { if (parsedData[key]) (updatedFields as any)[key] = parsedData[key]; });
      setFormData(prev => ({ ...prev, ...updatedFields }));
      alert('Datos importados exitosamente.');
      setIsImportModalOpen(false);
    } catch (error) {
      alert("Error al importar datos.");
    } finally { setIsAiImporting(false); }
  };

  useEffect(() => {
    const newImc = calculateIMC(formData.peso || '', formData.talla || '');
    if (newImc !== formData.imc) setFormData(prev => ({ ...prev, imc: newImc }));
  }, [formData.peso, formData.talla]);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day || year.length !== 4) return dateString;
    return `${day}/${month}/${year}`;
  };

  const formatWithDashes = (text: string) => {
    if (!text) return '(No ingresado)';
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith('-') ? line : `- ${line}`)
      .join('\n');
  };

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    const documentTitle = formData.tipoControlCronico
      ? `FICHA ${formData.tipoControlCronico.toUpperCase()}`
      : 'FICHA CONTROL CRÓNICO';

    anamnesis += `${documentTitle}\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA CONTROL: ${formatDateForDisplay(formData.fechaControl)}\n`;
    if (loggedInUser) anamnesis += `PROFESIONAL RESPONSABLE: ${loggedInUser.fullName}\n`;

    anamnesis += `MOTIVO DE CONSULTA: ${formData.tipoControlCronico ? formData.tipoControlCronico.toUpperCase() : 'CONTROL CRÓNICO'}\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `ANTECEDENTES GENERALES\n`;
    anamnesis += `Edad: ${formData.edad || '(No ingresado)'}\n`;
    anamnesis += `Sexo: ${formData.sexo || '(No seleccionado)'}\n`;
    anamnesis += `Anamnesis General:\n${formatWithDashes(formData.anamnesisGeneral)}\n\n`;
    anamnesis += `Antecedentes Personales:\n${formatWithDashes(formData.antecedentesPersonales)}\n\n`;
    anamnesis += `Morbilidad:\n${formatWithDashes(formData.morbilidad)}\n\n`;
    anamnesis += `Fármacos:\n${formatWithDashes(formData.farmacos)}\n\n`;

    anamnesis += `Factores de Riesgo: ${formData.factoresRiesgo?.length > 0 ? formData.factoresRiesgo.join(', ') : 'Ninguno'}\n`;
    anamnesis += `Adherencia a tratamiento: ${formData.adherenciaTratamiento || '(No seleccionado)'}\n`;
    anamnesis += `RAM a fármacos: ${formData.ramFarmacos === 'Sí' ? `Sí - ${formData.ramFarmacosAclaracion || '(Sin aclarar)'}` : formData.ramFarmacos || '(No seleccionado)'}\n\n`;

    anamnesis += `Alergias: ${formData.alergias || '(No ingresado)'}\n`;
    anamnesis += `Hospitalizaciones: ${formData.hospitalizaciones || '(No ingresado)'}\n`;
    anamnesis += `Cirugías: ${formData.cirugias || '(No ingresado)'}\n`;
    anamnesis += `Controles fuera de CESFAM: ${formData.controlExtrasistema || '(No ingresado)'}\n\n`;

    anamnesis += `HISTORIA PREVIA:\n`;
    checkboxClarificationConfig.slice(0, 2).forEach(item => {
      anamnesis += `${item.label}: ${formData[item.key] ? 'Sí' : 'Niega'}`;
      if (formData[item.key] && formData[item.clarificationKey]) anamnesis += ` - Aclaración: ${formData[item.clarificationKey]}`;
      anamnesis += `\n`;
    });
    anamnesis += `\n`;

    anamnesis += `Antecedentes familiares CV en 1° grado: ${formData.antecedentesFamiliaresCv || '(No ingresado)'}\n`;
    anamnesis += `Encuesta alimentaria: ${formData.dieta || '(No ingresado)'}\n\n`;

    anamnesis += `HÁBITOS:\n`;
    anamnesis += `Tabaco: ${formData.tabaco ? 'Sí' : 'Niega'}${formData.tabaco && formData.ipaResultado ? ` (IPA: ${formData.ipaResultado})` : ''}\n`;
    anamnesis += `OH (Alcohol): ${formData.oh ? 'Sí' : 'Niega'}\n`;
    anamnesis += `Drogas: ${formData.drogas ? 'Sí' : 'Niega'}\n`;
    anamnesis += `Actividad Física: ${formData.actividadFisica ? 'Sí' : 'Niega'}\n\n`;

    anamnesis += `SÍNTOMAS (${formData.tipoControlCronico || 'No especificado'}):\n`;
    if (formData.tipoControlCronico === 'Control cardiovascular') {
      checkboxClarificationConfig.slice(6, 16).forEach(item => {
        anamnesis += `${item.label}: ${formData[item.key] ? 'Sí' : 'Niega'}`;
        if (formData[item.key] && formData[item.clarificationKey]) anamnesis += ` - Aclaración: ${formData[item.clarificationKey]}`;
        anamnesis += `\n`;
      });
    } else if (formData.tipoControlCronico === 'Control hipotiroidismo') {
      [
        { key: 'hipotiroidismoConstipacion', clarificationKey: 'hipotiroidismoConstipacionAclaracion', label: 'Constipación' },
        { key: 'hipotiroidismoIntoleranciaFrio', clarificationKey: 'hipotiroidismoIntoleranciaFrioAclaracion', label: 'Intolerancia al frío' },
        { key: 'hipotiroidismoDebilidadFanereos', clarificationKey: 'hipotiroidismoDebilidadFanereosAclaracion', label: 'Debilidad de fanéreos' },
        { key: 'hipotiroidismoIncrementoPeso', clarificationKey: 'hipotiroidismoIncrementoPesoAclaracion', label: 'Incremento de peso' },
        { key: 'hipotiroidismoAdinamia', clarificationKey: 'hipotiroidismoAdinamiaAclaracion', label: 'Adinamia' },
        { key: 'hipotiroidismoRamLevotiroxina', clarificationKey: 'hipotiroidismoRamLevotiroxinaAclaracion', label: 'RAM a levotiroxina' },
        { key: 'hipotiroidismoActividadFisica', clarificationKey: 'hipotiroidismoActividadFisicaAclaracion', label: 'Actividad física' },
      ].forEach((item: any) => {
        anamnesis += `${item.label}: ${formData[item.key] ? 'Sí' : 'Niega'}`;
        if (formData[item.key] && formData[item.clarificationKey]) anamnesis += ` - Aclaración: ${formData[item.clarificationKey]}`;
        anamnesis += `\n`;
      });
    } else if (formData.tipoControlCronico === 'Control epilepsia') {
      anamnesis += `Última crisis: ${formData.epilepsiaUltimaCrisis || '(No especificado)'}\n`;
      anamnesis += `Desencadenante: ${formData.epilepsiaDesencadenante || '(No especificado)'}\n`;
      anamnesis += `Controles con neurólogo: ${formData.epilepsiaControlesNeurologo || '(No especificado)'}\n`;
      anamnesis += `Indicaciones atención secundaria: ${formData.epilepsiaIndicacionesSecundaria || '(No especificado)'}\n`;
    } else if (formData.tipoControlCronico === 'Control artrosis') {
      [
        { key: 'artrosisDolor', clarificationKey: 'artrosisDolorAclaracion', label: 'Dolor' },
        { key: 'artrosisRigidezArticular', clarificationKey: 'artrosisRigidezArticularAclaracion', label: 'Rigidez articular' },
        { key: 'artrosisFracasoAnalgesia', clarificationKey: 'artrosisFracasoAnalgesiaAclaracion', label: 'Fracaso de analgesia' },
        { key: 'artrosisKinesioterapia', clarificationKey: 'artrosisKinesioterapiaAclaracion', label: 'Kinesioterapia' },
        { key: 'artrosisActividadFisica', clarificationKey: 'artrosisActividadFisicaAclaracion', label: 'Actividad física' },
      ].forEach((item: any) => {
        anamnesis += `${item.label}: ${formData[item.key] ? 'Sí' : 'Niega'}`;
        if (formData[item.key] && formData[item.clarificationKey]) anamnesis += ` - Aclaración: ${formData[item.clarificationKey]}`;
        anamnesis += `\n`;
      });
    }
    anamnesis += `\n`;

    exploracion += `ÚLTIMO LABORATORIO (${formatDateForDisplay(formData.ultimoLaboratorioFecha)}):\n${formData.ultimoLaboratorioResultados || '(No ingresado)'}\n\n`;
    exploracion += `EKG (${formatDateForDisplay(formData.ekgFecha)}):\n${formData.ekgResultados || '(No ingresado)'}\n\n`;
    if (formData.otrasImagenesResultados) {
      exploracion += `OTRAS IMÁGENES (${formatDateForDisplay(formData.otrasImagenesFecha || '')}):\n${formData.otrasImagenesResultados}\n\n`;
    }

    exploracion += `EXAMEN FÍSICO:\n`;
    exploracion += `- Peso: ${formData.peso ? formData.peso + ' kg' : '(No ingresado) kg'}\n`;
    exploracion += `- Talla: ${formData.talla ? formData.talla + ' cm' : '(No ingresado) cm'}\n`;
    exploracion += `- IMC: ${formData.imc ? formData.imc + ' kg/m²' : '(No calculado) kg/m²'}\n`;
    exploracion += `- PA: ${formData.pa ? formData.pa + ' mmHg' : '(No ingresado) mmHg'}\n`;
    exploracion += `- FC: ${formData.fc ? formData.fc + ' lpm' : '(No ingresado) lpm'}\n`;
    exploracion += `- CC: ${formData.cc ? formData.cc + ' cm' : '(No ingresado) cm'}\n\n`;

    if (formData.borgScaleResult) {
      exploracion += `ESCALA DE BORG MODIFICADA:\nResultado: ${formData.borgScaleResult}\n\n`;
    }

    exploracion += `Examen Físico General/Segmentario:\n${formatWithDashes(formData.efGeneralSegmentario || '')}\n\n`;

    actuacion += `PLAN E INDICACIONES MÉDICAS:\n`;
    actuacion += `${formatWithDashes(formData.indicaciones || '')}\n\n`;

    if (formData.planProximoControlDupla || formData.planProximoControlTiempo) {
      actuacion += `PRÓXIMO CONTROL:\n`;
      if (formData.planProximoControlDupla) actuacion += `- Con: ${formData.planProximoControlDupla}\n`;
      if (formData.planProximoControlTiempo) actuacion += `- Tiempo estimado: ${formData.planProximoControlTiempo}\n`;
      actuacion += `\n`;
    }

    return { anamnesis: anamnesis.trim(), exploracion: exploracion.trim(), actuacion: actuacion.trim() };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
    setStatus(FormStatus.TextGenerated);
  }, [formData, calculateGeneratedTextParts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRadioChange = useCallback((name: keyof FichaControlPscvFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const renderRadioGroup = (
    label: string,
    name: keyof FichaControlPscvFormData,
    options: { value: string, label: string }[],
    clarificationName?: keyof FichaControlPscvFormData,
    clarificationPlaceholder?: string
  ) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}:</label>
        <div className="flex items-center space-x-4">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center text-sm">
              <input
                type="radio"
                name={name as string}
                value={opt.value}
                checked={formData[name] === opt.value}
                onChange={() => handleRadioChange(name, opt.value)}
                className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {clarificationName && formData[name] === 'Sí' && (
          <input
            type="text"
            name={clarificationName as string}
            value={(formData[clarificationName] as string) || ''}
            onChange={handleChange}
            placeholder={clarificationPlaceholder || "Aclare (opcional)"}
            className="mt-2 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-400 text-slate-700"
          />
        )}
      </div>
    );
  };

  const renderAntecedentCheckbox = (label: string, name: keyof FichaControlPscvFormData) => {
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
            inputClassName="!h-[42px]"
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



  const handleExportPdf = async () => {
    if (!loggedInUser) return;
    setStatus(FormStatus.Generating);
    try {
      const fullContent = `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}`;
      const documentTitle = formData.tipoControlCronico ? `Ficha Clínica: ${formData.tipoControlCronico}` : 'Ficha Clínica: Control Crónico';
      await generateClinicalRecordPdf({ title: documentTitle, content: fullContent }, loggedInUser);
    } finally { setStatus(FormStatus.Idle); }
  };

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: handleExportPdf,
        newForm: () => setFormData(initialFormData),
      };
    }
    return () => {
      if (actionsRef) {
        actionsRef.current = null;
      }
    };
  }, [actionsRef, handleExportPdf, setFormData]);

  const renderCheckboxClarificationField = (item: CheckboxClarificationItem) => (
    <div key={item.key as string} className="p-3 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow transition-shadow h-full">
      <div className="flex items-center gap-2">
        <input type="checkbox" id={item.key as string} name={item.key as string} checked={formData[item.key] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
        <label htmlFor={item.key as string} className="text-sm font-medium text-slate-700 cursor-pointer">{item.label}</label>
      </div>
      {formData[item.key] && (
        <textarea name={item.clarificationKey as string} value={formData[item.clarificationKey] as string} onChange={handleChange as any} rows={2} className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-black outline-none focus:ring-1 focus:ring-sky-500" placeholder="Detalle hallazgo..." />
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      {isAiImporting && (
        <div className="w-full text-center p-3 bg-sky-100 border border-sky-300 rounded-lg mb-4 flex-shrink-0 animate-pulse">
          <p className="text-sky-700 font-semibold">Importando datos... Esto puede tardar unos segundos.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden">
        {/* Columna Central (Formulario) */}
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">


            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
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
                  inputClassName="!h-[42px]"
                  containerClassName="mb-4"
                />
                {renderRadioGroup("Sexo", "sexo", [{ value: "Masculino", label: "Masculino" }, { value: "Femenino", label: "Femenino" }])}
              </div>
              <FormField label="Anamnesis General" id="anamnesisGeneral" name="anamnesisGeneral" value={formData.anamnesisGeneral || ''} onChange={handleChange as any} isTextArea rows={3} placeholder="Detalle de anamnesis..." />
              <SmartAntecedentesTextarea
                label="Antecedentes Personales"
                id="antecedentesPersonales"
                name="antecedentesPersonales"
                value={formData.antecedentesPersonales || ''}
                onChange={(val) => setFormData(prev => ({ ...prev, antecedentesPersonales: val }))}
                rows={2}
                placeholder="Antecedentes personales relevantes..."
              />
              <FormField label="Morbilidad" id="morbilidad" name="morbilidad" value={formData.morbilidad || ''} onChange={handleChange as any} isTextArea rows={2} placeholder="Morbilidades existentes..." />
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
                <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={(v) => setFormData(p => ({ ...p, farmacos: v }))} />
                <div className="mt-3 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setIsFactoresRiesgoModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out flex items-center gap-2"
                  >
                    <AlertTriangle size={20} />
                    Factores de riesgo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">
                {renderRadioGroup("Adherencia a tratamiento", "adherenciaTratamiento", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                <div className="flex flex-col gap-2">
                  {renderRadioGroup("RAM a fármacos", "ramFarmacos", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                  {formData.ramFarmacos === 'Sí' && (
                    <FormField
                      label="Aclaración RAM"
                      id="ramFarmacosAclaracion"
                      name="ramFarmacosAclaracion"
                      value={formData.ramFarmacosAclaracion || ''}
                      onChange={handleChange as any}
                      placeholder="Describa la RAM..."
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {renderAntecedentCheckbox("Alergias", "alergias")}
                {renderAntecedentCheckbox("Hospitalizaciones", "hospitalizaciones")}
                {renderAntecedentCheckbox("Cirugías", "cirugias")}
                {renderAntecedentCheckbox("Controles fuera de CESFAM", "controlExtrasistema")}
              </div>
            </section>

            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Eventos previos y hábitos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkboxClarificationConfig.slice(0, 6).map(renderCheckboxClarificationField)}
              </div>
              <div className="mt-4 space-y-4">
                <FormField label="Antecedentes CV familiares" id="antecedentesFamiliaresCv" name="antecedentesFamiliaresCv" value={formData.antecedentesFamiliaresCv} onChange={handleChange as any} isTextArea rows={2} inputClassName="text-black" />
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Encuesta alimentaria" id="dieta" name="dieta" value={formData.dieta} onChange={handleChange as any} isTextArea rows={3} inputClassName="text-black" placeholder="Resumen alimentación..." />
                </div>
              </div>
            </section>

            {/* SÍNTOMAS DINÁMICOS */}
            {formData.tipoControlCronico === 'Control cardiovascular' && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Signos y síntomas cardiovasculares</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {checkboxClarificationConfig.slice(6, 16).map(renderCheckboxClarificationField)}
                </div>
              </section>
            )}

            {formData.tipoControlCronico === 'Control hipotiroidismo' && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Signos y síntomas - Hipotiroidismo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'hipotiroidismoConstipacion', clarificationKey: 'hipotiroidismoConstipacionAclaracion', label: 'Constipación' },
                    { key: 'hipotiroidismoIntoleranciaFrio', clarificationKey: 'hipotiroidismoIntoleranciaFrioAclaracion', label: 'Intolerancia al frío' },
                    { key: 'hipotiroidismoDebilidadFanereos', clarificationKey: 'hipotiroidismoDebilidadFanereosAclaracion', label: 'Debilidad de fanéreos' },
                    { key: 'hipotiroidismoIncrementoPeso', clarificationKey: 'hipotiroidismoIncrementoPesoAclaracion', label: 'Incremento de peso' },
                    { key: 'hipotiroidismoAdinamia', clarificationKey: 'hipotiroidismoAdinamiaAclaracion', label: 'Adinamia' },
                    { key: 'hipotiroidismoRamLevotiroxina', clarificationKey: 'hipotiroidismoRamLevotiroxinaAclaracion', label: 'RAM a levotiroxina' },
                    { key: 'hipotiroidismoActividadFisica', clarificationKey: 'hipotiroidismoActividadFisicaAclaracion', label: 'Actividad física' },
                  ].map((item: any) => renderCheckboxClarificationField(item))}
                </div>
              </section>
            )}

            {formData.tipoControlCronico === 'Control epilepsia' && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Signos y Síntomas - Epilepsia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Última crisis" id="epilepsiaUltimaCrisis" name="epilepsiaUltimaCrisis" value={formData.epilepsiaUltimaCrisis || ''} onChange={handleChange as any} placeholder="Fecha o descripción..." />
                  <FormField label="Desencadenante" id="epilepsiaDesencadenante" name="epilepsiaDesencadenante" value={formData.epilepsiaDesencadenante || ''} onChange={handleChange as any} placeholder="Desencadenante de crisis..." />
                  <FormField label="Controles con neurólogo" id="epilepsiaControlesNeurologo" name="epilepsiaControlesNeurologo" value={formData.epilepsiaControlesNeurologo || ''} onChange={handleChange as any} placeholder="Detalle de controles..." />
                  <FormField label="Indicaciones desde atención secundaria" id="epilepsiaIndicacionesSecundaria" name="epilepsiaIndicacionesSecundaria" value={formData.epilepsiaIndicacionesSecundaria || ''} onChange={handleChange as any} placeholder="Indicaciones..." />
                </div>
              </section>
            )}

            {formData.tipoControlCronico === 'Control artrosis' && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Signos y síntomas - Artrosis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'artrosisDolor', clarificationKey: 'artrosisDolorAclaracion', label: 'Dolor' },
                    { key: 'artrosisRigidezArticular', clarificationKey: 'artrosisRigidezArticularAclaracion', label: 'Rigidez articular' },
                    { key: 'artrosisFracasoAnalgesia', clarificationKey: 'artrosisFracasoAnalgesiaAclaracion', label: 'Fracaso de analgesia' },
                    { key: 'artrosisKinesioterapia', clarificationKey: 'artrosisKinesioterapiaAclaracion', label: 'Kinesioterapia' },
                    { key: 'artrosisActividadFisica', clarificationKey: 'artrosisActividadFisicaAclaracion', label: 'Actividad física' },
                  ].map((item: any) => renderCheckboxClarificationField(item))}
                </div>
              </section>
            )}

            {/* 1. ESTUDIOS RECIENTES */}
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
                  id="ultimoLaboratorioFecha"
                  name="ultimoLaboratorioFecha"
                  value={formData.ultimoLaboratorioFecha || ''}
                  onChange={handleChange as any}
                  containerClassName="mb-0 flex-grow"
                  labelPrefix={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-700 shrink-0 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  }
                />
              </div>
              <textarea value={formData.ultimoLaboratorioResultados || ''} onChange={handleChange as any} name="ultimoLaboratorioResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]" placeholder="Resultados del último laboratorio..."></textarea>

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
              <textarea value={formData.ekgResultados || ''} onChange={handleChange as any} name="ekgResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"></textarea>

              <div className="flex items-center gap-1.5 mb-1 mt-1">
                <h4 className="block text-sm font-medium text-slate-700">Imágenes y otros estudios</h4>
              </div>
              {imgError && <p className="text-red-500 text-xs mt-1 mb-1">{imgError}</p>}
              <textarea value={formData.otrasImagenesResultados || ''} onChange={handleChange as any} name="otrasImagenesResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"></textarea>
            </section>

            {/* 2. EXPLORACIÓN FÍSICA */}
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Exploración Física</h3>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange as any} type="number" step="0.1" inputClassName="text-slate-700" />
                <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange as any} type="number" inputClassName="text-slate-700" />
                <FormField label="IMC (kg/m²)" id="imc" name="imc" value={formData.imc} readOnly disabled inputClassName="text-slate-500 bg-slate-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa} onChange={handleChange as any} inputClassName="text-slate-700 font-bold" />
                <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc} onChange={handleChange as any} type="number" inputClassName="text-slate-700" />
                <FormField label="CC (cm)" id="cc" name="cc" value={formData.cc} onChange={handleChange as any} type="number" inputClassName="text-slate-700" />
              </div>

              <div className="mt-4">
                <AutoExpandingTextArea
                  label="General / Segmentario"
                  id="efGeneralSegmentario"
                  name="efGeneralSegmentario"
                  value={formData.efGeneralSegmentario || ''}
                  onChange={handleChange as any}
                  placeholder="Examen físico general y segmentario..."
                />
              </div>
            </section>

            {/* 3. PRÓXIMO CONTROL */}
            <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
              <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2 flex items-center gap-2">
                Próximo Control
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Profesional responsable:</label>
                  <select
                    value={formData.planProximoControlDupla || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, planProximoControlDupla: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700"
                  >
                    {duplaProfesionalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">En tiempo:</label>
                  <select
                    value={formData.planProximoControlTiempo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, planProximoControlTiempo: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700"
                  >
                    {tiempoControlOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <AutoExpandingTextArea
                label="Indicaciones Generales / Adicionales"
                id="indicaciones"
                name="indicaciones"
                value={formData.indicaciones || ''}
                onChange={handleChange as any}
                placeholder="Detalle indicaciones adicionales..."
              />
            </section>
          </div>

        </div>

        {/* Columna Derecha: Resumen Sticky */}
        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                  <CopyButton textToCopy={anamnesisText} />
                </div>
                <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                  <CopyButton textToCopy={exploracionText} />
                </div>
                <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                  <CopyButton textToCopy={actuacionText} />
                </div>
                <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="grid grid-cols-2 gap-1.5 w-full shrink-0">
            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
              title="Exportar Resumen PDF"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">EXPORTAR PDF</span>
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
          </div>
        </div>
      </div>

      <AvisHojaRutaWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onConfirmImport={handleAiImport} isImporting={isAiImporting} title="Importar Registro Anterior" description="Pegue el registro clínico anterior para autocompletar la ficha mediante IA." />
      <FactoresRiesgoModal
        isOpen={isFactoresRiesgoModalOpen}
        onClose={() => setIsFactoresRiesgoModalOpen(false)}
        selectedFactors={formData.factoresRiesgo || []}
        onChange={(factors) => setFormData(prev => ({ ...prev, factoresRiesgo: factors }))}
      />
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

export default FichaControlPscv;

