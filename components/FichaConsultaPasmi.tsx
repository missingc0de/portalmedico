import React, { useState, useCallback, useEffect } from 'react';
import { FichaConsultaPasmiFormData, FormStatus, User, PccObjetivo } from '../types';
import FormField from './FormField';
import CopyButton from './CopyButton';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import AutoExpandingTextArea from './AutoExpandingTextArea';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import ColegioAutocomplete from './ColegioAutocomplete';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { FileText, PlusCircle } from 'lucide-react';

const mentalHealthDiagnoses = [
  "TRASTORNO DEL ESPECTRO AUTISTA (TEA), NO ESPECIFICADO",
  "TRASTORNO DEL ESPECTRO AUTISTA (TEA), NIVEL 1 DE APOYO",
  "TRASTORNO DEL ESPECTRO AUTISTA (TEA), NIVEL 2 DE APOYO",
  "TRASTORNO DEL ESPECTRO AUTISTA (TEA), NIVEL 3 DE APOYO",
  "TRASTORNO DE DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDAH), PRESENTACIÓN COMBINADA",
  "TRASTORNO DE DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDAH), PRESENTACIÓN PREDOMINANTEMENTE INATENTA",
  "TRASTORNO DE DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDAH), PRESENTACIÓN PREDOMINANTEMENTE HIPERACTIVA/IMPULSIVA",
  "TRASTORNO ESPECÍFICO DEL APRENDIZAJE CON DIFICULTADES EN LA LECTURA",
  "TRASTORNO ESPECÍFICO DEL APRENDIZAJE CON DIFICULTADES EN LA EXPRESIÓN ESCRITA",
  "TRASTORNO ESPECÍFICO DEL APRENDIZAJE CON DIFICULTADES EN LAS MATEMÁTICAS",
  "TRASTORNO DEL DESARROLLO DEL LENGUAJE",
  "TRASTORNO FONOLÓGICO",
  "TRASTORNO DE LA COMUNICACIÓN SOCIAL (PRAGMÁTICA)",
  "DISCAPACIDAD INTELECTUAL LEVE",
  "DISCAPACIDAD INTELECTUAL MODERADA",
  "DISCAPACIDAD INTELECTUAL GRAVE",
  "RETRASO GLOBAL DEL DESARROLLO",
  "TRASTORNO DEL DESARROLLO DE LA COORDINACIÓN",
  "TRASTORNO DE TICS MOTORES O VOCALES PERSISTENTES",
  "SÍNDROME DE TOURETTE",
  "TRASTORNO OPOSICIONISTA DESAFIANTE",
  "TRASTORNO DISOCIAL",
  "TRASTORNO DE ANSIEDAD POR SEPARACIÓN",
  "TRASTORNO DE ANSIEDAD GENERALIZADA",
  "FOBIA SOCIAL",
  "FOBIA ESPECÍFICA",
  "TRASTORNO DE PÁNICO",
  "MUTISMO SELECTIVO",
  "TRASTORNO OBSESIVO-COMPULSIVO",
  "TRASTORNO DEPRESIVO MAYOR",
  "TRASTORNO DEPRESIVO PERSISTENTE (DISTIMIA)",
  "TRASTORNO DE DESREGULACIÓN DISRUPTIVA DEL ESTADO DE ÁNIMO",
  "TRASTORNO ADAPTATIVO",
  "TRASTORNO REACTIVO DEL APEGO",
  "TRASTORNO POR ESTRÉS POSTRAUMÁTICO",
  "TRASTORNO DEL SUEÑO-VIGILIA",
  "ENURESIS",
  "ENCOPRESIS",
  "TRASTORNO DE LA CONDUCTA ALIMENTARIA NO ESPECIFICADO",
  "ANOREXIA NERVIOSA",
  "BULIMIA NERVIOSA",
  "TRASTORNO POR ATRACÓN",
  "DIFICULTADES EMOCIONALES Y DEL COMPORTAMIENTO ASOCIADAS A CONFLICTOS FAMILIARES",
  "DIFICULTADES DE REGULACIÓN EMOCIONAL",
  "VÍCTIMA DE ACOSO ESCOLAR (BULLYING)",
  "PROBLEMAS RELACIONADOS CON EL RENDIMIENTO ESCOLAR",
  "SOSPECHA DE TRASTORNO DEL NEURODESARROLLO EN ESTUDIO",
  "SOSPECHA DE TRASTORNO DEL ESPECTRO AUTISTA EN EVALUACIÓN",
  "SOSPECHA DE TRASTORNO DE DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD EN EVALUACIÓN",
  "TRASTORNO MENTAL NO ESPECIFICADO DEL DESARROLLO PSICOLÓGICO"
];

const todayDDMMYYYY = (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`; })();

const initialFormData: FichaConsultaPasmiFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  fechaConsulta: todayDDMMYYYY,
  profesionalResponsable: '',
  motivoConsulta: 'CONSULTA PASMI',

  // Antecedentes Personales
  edad: '',
  antecedentesMedicos: '',
  alergias: 'Niega',
  farmacos: 'Niega',
  hospitalizaciones: 'Niega',
  consultasUrgencias: 'Niega',
  derivaciones: '',

  // Contexto Escolar
  colegio: '',
  curso: '',
  rendimiento: 'Rendimiento académico acorde a la edad y nivel escolar. Comprende y ejecuta adecuadamente las actividades propuestas en el aula.',
  comportamiento: 'Conducta generalmente adecuada en el contexto escolar y familiar. Respeta normas y límites habituales para su edad.',
  relacionPares: 'Mantiene relaciones positivas con sus compañeros, participa en juegos y actividades grupales de forma adecuada.',
  relacionSuperiores: 'Presenta una relación respetuosa y colaborativa con profesores, asistentes de la educación y adultos significativos.',
  tareasEscolares: 'Realiza las tareas y actividades escolares de manera regular, con supervisión acorde a su etapa del desarrollo.',
  bullying: 'Niega situaciones de acoso escolar como víctima, agresor o testigo relevante.',
  pie: 'No refiere.',

  // Contexto Domiciliario
  integrantesGrupoFamiliar: '',
  ocupacionPadres: '',
  intereses: '',
  actividadesExtraprogramaticas: '',
  alimentacion: 'Alimentación variada y adecuada para la edad, sin dificultades significativas reportadas.',
  apetito: 'Apetito conservado, sin cambios recientes ni preocupaciones relacionadas con la ingesta.',
  sueno: 'Sueño adecuado para la edad, con horarios relativamente regulares y descanso reparador.',

  // Contexto Psicosocial
  psicosocialImpulsividad: 'No se observan dificultades significativas en el control de impulsos. Manejo adecuado de la frustración para su etapa del desarrollo.',
  psicosocialAnimo: 'Ánimo eutímico, estable y acorde al contexto. Participa en actividades habituales con interés.',
  psicosocialAnsiosos: 'No se evidencian síntomas ansiosos clínicamente significativos. Afronta adecuadamente las situaciones cotidianas.',
  psicosocialSomatizaciones: 'No refiere síntomas físicos recurrentes asociados a malestar emocional.',
  psicosocialIdeacionSuicida: 'Niega ideación suicida, deseos de muerte o conductas autolesivas. Riesgo suicida no pesquisado al momento de la evaluación.',

  // Examen Mental
  examenMentalVigilancia: 'Vigil, orientado en tiempo, espacio y persona.',
  examenMentalContacto: 'Aborda y coopera con la entrevista.',
  examenMentalLenguaje: 'Coherente, atingente, fluido.',
  examenMentalAfectos: 'Modulado, concordante.',
  examenMentalPsicomotricidad: 'Tranquilo.',
  examenMentalPensamiento: 'Curso y contenido sin alteraciones.',
  examenMentalPercepcion: 'Sin alteraciones.',
  examenMentalIntelectual: 'Aparente, sin alteraciones.',
  examenMentalJuicio: 'Conservado.',
  examenMentalInsight: 'Presente.',

  // PCI
  pccPersonaFamilia: '',
  pccEquipoSalud: '',
  tomaDecisionesCompartidas: '1. ',
  opcionesConversadas: '',
  pccObjetivos: [],
  // Plan
  planControlMensual: false,
  planInterconsulta: false,
  planExamenes: false,
  planObservacion: false,
  planAltaMedica: false,
  planIndicacionesAdicionales: '',
  planProximoControlTiempo: '',
  planProximoControlDupla: '',
  indicaciones: '- Se solicitan exámenes.\n- Se renueva su receta hasta próximo control.\n- Traer contrarreferencias extrasistema y/u otros documentos importantes.\n- Venir acompañado de cuidador principal.',

  // Acuerdos
  acuerdoPlanEquipo: 'Sí',
  acuerdoContactoSeguimiento: 'Sí'
};

interface FichaConsultaPasmiProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<any>;
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
  { value: 'Médico', label: 'Médico' },
  { value: 'Trabajador/a Social', label: 'Trabajador/a Social' }
];

const cursosList = [
  "Prekinder.",
  "Kinder.",
  "Primero básico.",
  "Segundo básico.",
  "Tercero básico.",
  "Cuarto básico.",
  "Quinto básico.",
  "Sexto básico."
];

const pasmiPredefinedPlans: PccObjetivo[] = [
  {
    titulo: "Fortalecimiento de habilidades socioemocionales",
    objetivo: "Favorecer el reconocimiento y expresión adecuada de emociones en distintos contextos.",
    acuerdo: "Generar espacios de conversación sobre emociones y experiencias cotidianas.",
    acciones: "Identificar y expresar emociones de manera verbal durante las actividades diarias. Reforzar positivamente la expresión emocional y modelar estrategias adecuadas de regulación. Recibir orientación del equipo de salud según necesidad.",
    plazo: "Próximo control.",
    responsables: "Niño, padres o cuidadores y equipo de salud.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Desarrollo de rutinas y hábitos saludables",
    objetivo: "Consolidar hábitos de autocuidado acordes a la edad.",
    acuerdo: "Mantener rutinas estables de alimentación, sueño y recreación.",
    acciones: "Respetar horarios de alimentación y sueño acordes a la edad. Participar en actividades recreativas diarias. Limitar el uso de pantallas previo al horario de dormir. Supervisar el cumplimiento de las rutinas establecidas.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Fortalecimiento de habilidades sociales",
    objetivo: "Favorecer interacciones positivas con pares y adultos.",
    acuerdo: "Promover espacios de socialización y práctica de habilidades sociales.",
    acciones: "Participar en actividades grupales acordes a la edad. Practicar conductas de saludo, respeto de turnos y resolución pacífica de conflictos. Reforzar conductas prosociales observadas en el hogar y contexto escolar.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Manejo de impulsividad y frustración",
    objetivo: "Mejorar las estrategias de regulación emocional frente a situaciones frustrantes.",
    acuerdo: "Incorporar estrategias de manejo emocional frente al enojo y la frustración.",
    acciones: "Practicar técnicas simples de regulación emocional, tales como respiración profunda, pausa breve o solicitud de ayuda a un adulto. Reforzar el uso de estrategias adaptativas de afrontamiento. Recibir orientación y acompañamiento del equipo de salud cuando corresponda.",
    plazo: "Próximo control.",
    responsables: "Niño, padres o cuidadores y equipo de salud.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Apoyo al desempeño escolar",
    objetivo: "Favorecer hábitos de estudio y participación escolar acordes a la edad.",
    acuerdo: "Mantener un espacio y horario definido para actividades escolares.",
    acciones: "Realizar tareas y actividades escolares con supervisión acorde a la edad. Mantener un ambiente adecuado para el estudio. Reforzar el esfuerzo y la constancia en las actividades académicas.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Fortalecimiento del vínculo familiar",
    objetivo: "Promover interacciones familiares positivas y espacios de convivencia.",
    acuerdo: "Favorecer instancias regulares de encuentro y participación familiar.",
    acciones: "Participar en actividades recreativas familiares. Compartir espacios de conversación y juego durante la semana. Fortalecer la comunicación y expresión de necesidades dentro del grupo familiar.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Disminución de síntomas ansiosos",
    objetivo: "Favorecer el desarrollo de estrategias de afrontamiento frente a preocupaciones y situaciones estresantes.",
    acuerdo: "Identificar situaciones que generen preocupación y favorecer espacios de contención emocional.",
    acciones: "Expresar preocupaciones a adultos de confianza cuando sea necesario. Validar emociones y promover estrategias de afrontamiento adecuadas. Participar en actividades recreativas y de relajación. Recibir acompañamiento y orientación del equipo de salud según evolución.",
    plazo: "Próximo control.",
    responsables: "Niño, padres o cuidadores y equipo de salud.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Promoción de actividad física y recreación",
    objetivo: "Incrementar la participación en actividades recreativas y de movimiento acordes a la edad.",
    acuerdo: "Incorporar actividades físicas y recreativas de manera regular.",
    acciones: "Participar en juegos activos o actividades deportivas varias veces por semana. Favorecer actividades al aire libre cuando sea posible. Limitar el tiempo de pantallas de acuerdo con las recomendaciones para la edad.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Fortalecimiento de la autoestima",
    objetivo: "Favorecer una percepción positiva de sí mismo y de sus capacidades.",
    acuerdo: "Reconocer fortalezas, logros y esfuerzos en las actividades cotidianas.",
    acciones: "Identificar cualidades personales y logros alcanzados. Reforzar verbalmente los avances observados. Promover experiencias que favorezcan la autonomía y sensación de competencia.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  },
  {
    titulo: "Fortalecimiento de la comunicación familiar",
    objetivo: "Mejorar la comunicación entre el niño y sus cuidadores.",
    acuerdo: "Favorecer espacios de escucha activa y diálogo respetuoso dentro del hogar.",
    acciones: "Expresar necesidades, emociones y opiniones de forma adecuada. Dedicar momentos de conversación libre de distractores. Validar emociones y fomentar la resolución dialogada de conflictos.",
    plazo: "Próximo control.",
    responsables: "Niño y padres o cuidadores.",
    seguimiento: "Dentro de 2 meses."
  }
];

const colegiosList = [
  "Liceo Diego Portales",
  "Liceo Fernando Binvignat Marín",
  "Liceo Bicentenario de Excelencia Instituto Superior de Comercio de Coquimbo",
  "Escuela Coquimbo",
  "Escuela Básica Manuel de Salas",
  "Escuela Básica República de Italia",
  "Escuela Peñuelas",
  "Escuela Básica Mario Muñoz Silva",
  "Escuela José Agustín Alfaro",
  "Escuela El Sauce",
  "Escuela Juan Pablo II",
  "Escuela San Rafael",
  "Colegio de Artes Claudio Arrau",
  "Particulares subvencionados y particulares",
  "Cristóbal Colón College",
  "Colegio Bernardo O'Higgins",
  "Colegio Español de Coquimbo",
  "Colegio San Luis de Coquimbo",
  "Colegio Santa Marta de Coquimbo",
  "San Lorenzo College",
  "La Herradura College",
  "Colegio Los Carrera",
  "Colegio José Martí Pérez",
  "Colegio Miguel de Cervantes",
  "Colegio Miguel de Cervantes, Sede San Ramón",
  "Colegio María de Andacollo",
  "Francis School",
  "Particular Calasanz School N 136",
  "Colegio Altazor",
  "Colegio del Alba",
  "Colegio Saint Mary's School",
  "Colegio Amazing Grace"
];

const FichaConsultaPasmi: React.FC<FichaConsultaPasmiProps> = ({ onBackToMenu, loggedInUser, actionsRef }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaConsultaPasmiFormData>('local_FichaConsultaPasmi', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');

  const [isPredefinedPlanOpen, setIsPredefinedPlanOpen] = useState(false);
  const [planSearchTerm, setPlanSearchTerm] = useState('');

  const filteredPredefinedPlans = React.useMemo(() => {
    if (!planSearchTerm.trim()) return pasmiPredefinedPlans;
    const term = planSearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return pasmiPredefinedPlans.filter(p =>
      (p.titulo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term) ||
      (p.acuerdo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term) ||
      (p.acciones || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(term)
    );
  }, [planSearchTerm]);

  // Handle local changes and auto-saveble only on first mount if not set
  useEffect(() => {
    if (formData.fechaConsulta && formData.fechaConsulta.includes('-')) {
      const parts = formData.fechaConsulta.split('-');
      if (parts[0].length === 4) {
        const newDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setFormData(prev => ({ ...prev, fechaConsulta: newDate }));
      }
    }
  }, [formData.fechaConsulta]);

  useEffect(() => {
    if (loggedInUser && !formData.profesionalResponsable) {
      setFormData(prev => ({ ...prev, profesionalResponsable: loggedInUser.fullName }));
    }
  }, [loggedInUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateGeneratedText = () => {
    let textA = `FICHA CONSULTA PASMI\n`;
    textA += `---------------------------------------\n`;
    textA += `FECHA CONSULTA: ${(formData.fechaConsulta || '').split('-').reverse().join('-')}\n`;
    textA += `PROFESIONAL RESPONSABLE: ${formData.profesionalResponsable || ''}\n`;
    textA += `MOTIVO DE CONSULTA: ${formData.motivoConsulta || ''}\n`;
    textA += `---------------------------------------\n\n`;

    textA += `ANTECEDENTES PERSONALES\n`;
    textA += `Edad: ${formData.edad || ''}\n`;
    textA += `Antecedentes médicos: \n${formData.antecedentesMedicos || ''}\n`;
    textA += `Alergias: ${formData.alergias || ''}\n`;
    textA += `Fármacos: ${formData.farmacos || ''}\n`;
    textA += `Hospitalizaciones: ${formData.hospitalizaciones || ''}\n`;
    textA += `Consultas en urgencias: ${formData.consultasUrgencias || ''}\n`;
    textA += `Derivaciones: ${formData.derivaciones || ''}\n\n`;

    let colegioFormatted = formData.colegio || '';
    if (colegioFormatted && !colegioFormatted.trim().endsWith('.')) {
      colegioFormatted = colegioFormatted.trim() + '.';
    }

    textA += `CONTEXTO ESCOLAR\n`;
    textA += `Colegio: ${colegioFormatted}\n`;
    textA += `Curso: ${formData.curso || ''}\n`;
    textA += `Rendimiento: ${formData.rendimiento || ''}\n`;
    textA += `Comportamiento: ${formData.comportamiento || ''}\n`;
    textA += `Relación con pares: ${formData.relacionPares || ''}\n`;
    textA += `Relación con superiores: ${formData.relacionSuperiores || ''}\n`;
    textA += `Tareas escolares: ${formData.tareasEscolares || ''}\n`;
    textA += `Bullying: ${formData.bullying || ''}\n`;
    textA += `Programa de Integración Escolar (PIE): ${formData.pie || ''}\n\n`;

    textA += `CONTEXTO DOMICILIARIO\n`;
    textA += `Integrantes del grupo familiar:\n${formData.integrantesGrupoFamiliar || ''}\n`;
    textA += `Ocupación de padres:\n${formData.ocupacionPadres || ''}\n`;
    textA += `Intereses:\n${formData.intereses || ''}\n`;
    textA += `Actividades extraprogramáticas:\n${formData.actividadesExtraprogramaticas || ''}\n`;
    textA += `Alimentación: ${formData.alimentacion || ''}\n`;
    textA += `Apetito: ${formData.apetito || ''}\n`;
    textA += `Sueño: ${formData.sueno || ''}\n\n`;

    textA += `CONTEXTO PSICOSOCIAL\n`;
    textA += `- Impulsividad/rabia: ${formData.psicosocialImpulsividad || ''}\n`;
    textA += `- Ánimo: ${formData.psicosocialAnimo || ''}\n`;
    textA += `- Síntomas ansiosos: ${formData.psicosocialAnsiosos || ''}\n`;
    textA += `- Somatizaciones: ${formData.psicosocialSomatizaciones || ''}\n`;
    textA += `- Ideación suicida: ${formData.psicosocialIdeacionSuicida || ''}\n`;

    let textE = `EXAMEN MENTAL\n`;
    textE += `- Vigilancia: ${formData.examenMentalVigilancia || ''}\n`;
    textE += `- Contacto: ${formData.examenMentalContacto || ''}\n`;
    textE += `- Lenguaje: ${formData.examenMentalLenguaje || ''}\n`;
    textE += `- Afectos: ${formData.examenMentalAfectos || ''}\n`;
    textE += `- Psicomotricidad: ${formData.examenMentalPsicomotricidad || ''}\n`;
    textE += `- Pensamiento: ${formData.examenMentalPensamiento || ''}\n`;
    textE += `- Percepción: ${formData.examenMentalPercepcion || ''}\n`;
    textE += `- Funcionamiento Intelectual: ${formData.examenMentalIntelectual || ''}\n`;
    textE += `- Juicio de realidad: ${formData.examenMentalJuicio || ''}\n`;
    textE += `- Insight: ${formData.examenMentalInsight || ''}\n`;

    let textAc = '';
    textAc += `PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS:\n`;
    textAc += `PROBLEMAS VISUALIZADOS:\n`;
    textAc += `Persona y familia: ${formData.pccPersonaFamilia || '(No ingresado)'}\n`;
    textAc += `Equipo de salud: ${formData.pccEquipoSalud || '(No ingresado)'}\n\n`;

    textAc += `PRIORIZACIÓN DE PROBLEMAS:\n`;
    textAc += `${formData.tomaDecisionesCompartidas || ''}\n\n`;

    if (formData.opcionesConversadas) {
      textAc += `OPCIONES CONVERSADAS (ACTIVOS COMUNITARIOS):\n${formData.opcionesConversadas}\n\n`;
    }

    textAc += `PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS:\n`;
    if ((formData.pccObjetivos || []).length > 0) {
      (formData.pccObjetivos || []).forEach((obj, idx) => {
        textAc += `Objetivo #${idx + 1}:\n`;
        if (obj.objetivo) textAc += `  Objetivo: ${obj.objetivo}\n`;
        if (obj.acuerdo) textAc += `  Acuerdo: ${obj.acuerdo}\n`;
        if (obj.acciones) textAc += `  Acciones: ${obj.acciones}\n`;
        if (obj.plazo) textAc += `  Plazo: ${obj.plazo}\n`;
        if (obj.responsables) textAc += `  Responsable/s: ${obj.responsables}\n`;
        if (obj.seguimiento) textAc += `  Seguimiento: ${obj.seguimiento}\n`;
        textAc += '\n';
      });
    } else {
      textAc += `(Sin objetivos agregados)\n\n`;
    }

    textAc += `¿Está de acuerdo con el plan elaborado en conjunto con el equipo ECICEP?: ${formData.acuerdoPlanEquipo || 'No ingresado'}\n`;
    textAc += `¿Está de acuerdo con que lo contactemos para seguimiento?: ${formData.acuerdoContactoSeguimiento || 'No ingresado'}\n\n`;

    if (formData.planProximoControlTiempo) {
      textAc += `PRÓXIMO CONTROL:\n`;
      textAc += `${formData.planProximoControlTiempo || '-'}\n\n`;
    }

    textAc += `INDICACIONES:\n`;
    if (formData.indicaciones) {
      textAc += `${formData.indicaciones}\n`;
    }

    setAnamnesisText(textA);
    setExploracionText(textE);
    setActuacionText(textAc);
    setStatus(FormStatus.TextGenerated);
  };

  const handleClear = React.useCallback(() => {
    const resetData = { ...initialFormData, profesionalResponsable: loggedInUser?.fullName || '' };
    setFormData(resetData);
    setAnamnesisText('');
    setExploracionText('');
    setActuacionText('');
    setStatus(FormStatus.Idle);
  }, [loggedInUser, setFormData]);

  const handleExportPdf = async () => {
    if (!loggedInUser) return;
    setStatus(FormStatus.Generating);
    try {
      await generateClinicalRecordPdf({ title: 'Ficha Consulta PASMI', content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}` }, loggedInUser);
    } catch (err) {
      console.error(err);
    } finally {
      setStatus(FormStatus.Idle);
    }
  };

  React.useImperativeHandle(actionsRef, () => ({
    newForm: handleClear,
    exportPdf: handleExportPdf,
  }), [handleClear, handleExportPdf]);

  useEffect(() => {
    calculateGeneratedText();
  }, [formData, calculateGeneratedText]);

  const handleAddPccObjetivo = () => {
    setFormData(prev => ({
      ...prev,
      pccObjetivos: [...(prev.pccObjetivos || []), { objetivo: '', acuerdo: '', acciones: '', plazo: '', responsables: '', seguimiento: '' }]
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

  const handleUpdatePccObjetivo = (index: number, field: keyof PccObjetivo, value: string) => {
    const updated = [...(formData.pccObjetivos || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, pccObjetivos: updated }));
  };

  const handleRemovePccObjetivo = (index: number) => {
    const updated = [...(formData.pccObjetivos || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, pccObjetivos: updated }));
  };

  const renderRadioGroup = (label: string, field: keyof FichaConsultaPasmiFormData, options: { value: string, label: string }[]) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              value={opt.value}
              checked={formData[field] === opt.value}
              onChange={handleChange}
              className="text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderNiegaField = (label: string, name: keyof FichaConsultaPasmiFormData) => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            name={name}
            value={(formData[name] as string) || ''}
            onChange={handleChange}
            placeholder="Describa..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
            disabled={formData[name] === 'Niega'}
          />
        </div>
        <label className={`flex items-center justify-center gap-2 cursor-pointer border px-3 rounded-lg shadow-sm transition-colors h-[42px] ${formData[name] === 'Niega' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
          <input
            type="checkbox"
            className="hidden"
            checked={formData[name] === 'Niega'}
            onChange={(e) => {
              const val = e.target.checked ? 'Niega' : '';
              setFormData(prev => ({ ...prev, [name]: val }));
            }}
          />
          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${formData[name] === 'Niega' ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 bg-white'}`}>
            {formData[name] === 'Niega' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-[10px] font-black uppercase whitespace-nowrap tracking-tighter">Niega</span>
        </label>
      </div>
    </div>
  );


  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        
        {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                
                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antecedentes Personales</h3>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 14 años" />
                  </div>
                  
                  <SmartAntecedentesTextarea
                    label="Antecedentes médicos"
                    id="antecedentesMedicos"
                    name="antecedentesMedicos"
                    value={formData.antecedentesMedicos}
                    onChange={(val) => setFormData(prev => ({ ...prev, antecedentesMedicos: val }))}
                    rows={2}
                    customData={mentalHealthDiagnoses}
                    customTitle="Diagnósticos de Salud Mental"
                    bulletListMode={true}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {renderNiegaField('Alergias', 'alergias')}
                    {renderNiegaField('Hospitalizaciones', 'hospitalizaciones')}
                    {renderNiegaField('Fármacos', 'farmacos')}
                    {renderNiegaField('Consultas en urgencias', 'consultasUrgencias')}
                  </div>
                  
                  <div className="mt-4">
                    <FormField label="Derivaciones" id="derivaciones" name="derivaciones" value={formData.derivaciones} onChange={handleChange} placeholder="Ej: Desde COSAM, colegio, etc." />
                  </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Contexto Escolar</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <ColegioAutocomplete
                        label="Colegio"
                        id="colegio"
                        name="colegio"
                        value={formData.colegio}
                        onChange={handleChange}
                        options={colegiosList}
                      />
                    </div>
                    <div className="flex flex-col">
                      <ColegioAutocomplete
                        label="Curso"
                        id="curso"
                        name="curso"
                        value={formData.curso}
                        onChange={handleChange}
                        options={cursosList}
                      />
                    </div>
                    <FormField label="Rendimiento" id="rendimiento" name="rendimiento" value={formData.rendimiento} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Comportamiento" id="comportamiento" name="comportamiento" value={formData.comportamiento} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Relación con pares" id="relacionPares" name="relacionPares" value={formData.relacionPares} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Relación con superiores" id="relacionSuperiores" name="relacionSuperiores" value={formData.relacionSuperiores} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Tareas escolares" id="tareasEscolares" name="tareasEscolares" value={formData.tareasEscolares} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Bullying" id="bullying" name="bullying" value={formData.bullying} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Programa de Integración Escolar (PIE)" id="pie" name="pie" value={formData.pie} onChange={handleChange} isTextArea rows={2} />
                  </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Contexto Domiciliario</h3>
                  <div className="space-y-4">
                    <FormField label="Integrantes del grupo familiar" id="integrantesGrupoFamiliar" name="integrantesGrupoFamiliar" value={formData.integrantesGrupoFamiliar} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Ocupación de padres" id="ocupacionPadres" name="ocupacionPadres" value={formData.ocupacionPadres} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Intereses" id="intereses" name="intereses" value={formData.intereses} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Actividades extraprogramáticas" id="actividadesExtraprogramaticas" name="actividadesExtraprogramaticas" value={formData.actividadesExtraprogramaticas} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Alimentación" id="alimentacion" name="alimentacion" value={formData.alimentacion} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Apetito" id="apetito" name="apetito" value={formData.apetito} onChange={handleChange} isTextArea rows={2} />
                    <FormField label="Sueño" id="sueno" name="sueno" value={formData.sueno} onChange={handleChange} isTextArea rows={2} />
                  </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Contexto Psicosocial</h3>
                  <div className="space-y-4">
                    <AutoExpandingTextArea label="Impulsividad/rabia" id="psicosocialImpulsividad" name="psicosocialImpulsividad" value={formData.psicosocialImpulsividad || ''} onChange={handleChange as any} />
                    <AutoExpandingTextArea label="Ánimo" id="psicosocialAnimo" name="psicosocialAnimo" value={formData.psicosocialAnimo || ''} onChange={handleChange as any} />
                    <AutoExpandingTextArea label="Síntomas ansiosos" id="psicosocialAnsiosos" name="psicosocialAnsiosos" value={formData.psicosocialAnsiosos || ''} onChange={handleChange as any} />
                    <AutoExpandingTextArea label="Somatizaciones" id="psicosocialSomatizaciones" name="psicosocialSomatizaciones" value={formData.psicosocialSomatizaciones || ''} onChange={handleChange as any} />
                    <AutoExpandingTextArea label="Ideación suicida" id="psicosocialIdeacionSuicida" name="psicosocialIdeacionSuicida" value={formData.psicosocialIdeacionSuicida || ''} onChange={handleChange as any} />
                  </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Mental</h3>
                  <div className="space-y-4">
                    <FormField label="Vigilancia y orientación" id="examenMentalVigilancia" name="examenMentalVigilancia" value={formData.examenMentalVigilancia} onChange={handleChange} />
                    <FormField label="Contacto e interacción" id="examenMentalContacto" name="examenMentalContacto" value={formData.examenMentalContacto} onChange={handleChange} />
                    <FormField label="Lenguaje" id="examenMentalLenguaje" name="examenMentalLenguaje" value={formData.examenMentalLenguaje} onChange={handleChange} />
                    <FormField label="Afectos" id="examenMentalAfectos" name="examenMentalAfectos" value={formData.examenMentalAfectos} onChange={handleChange} />
                    <FormField label="Psicomotricidad" id="examenMentalPsicomotricidad" name="examenMentalPsicomotricidad" value={formData.examenMentalPsicomotricidad} onChange={handleChange} />
                    <FormField label="Pensamiento" id="examenMentalPensamiento" name="examenMentalPensamiento" value={formData.examenMentalPensamiento} onChange={handleChange} />
                    <FormField label="Percepción/sensorial" id="examenMentalPercepcion" name="examenMentalPercepcion" value={formData.examenMentalPercepcion} onChange={handleChange} />
                    <FormField label="Intelectual" id="examenMentalIntelectual" name="examenMentalIntelectual" value={formData.examenMentalIntelectual} onChange={handleChange} />
                    <FormField label="Juicio de realidad" id="examenMentalJuicio" name="examenMentalJuicio" value={formData.examenMentalJuicio} onChange={handleChange} />
                    <FormField label="Insight (conciencia de enfermedad)" id="examenMentalInsight" name="examenMentalInsight" value={formData.examenMentalInsight} onChange={handleChange} />
                  </div>
                </section>

                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
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
                          const lines = value.split('\n');
                          const nextNumber = lines.length + 1;
                          const newValue = value.substring(0, start) + '\n' + nextNumber + '. ' + value.substring(end);
                          setFormData(prev => ({ ...prev, tomaDecisionesCompartidas: newValue }));
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
                    <h4 className="text-md font-bold text-slate-800 mb-3 uppercase text-sm tracking-wider mt-6">OPCIONES CONVERSADAS (AGREGAR ACTIVOS COMUNITARIOS)</h4>
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
                      <div className="flex gap-2 relative">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsPredefinedPlanOpen(!isPredefinedPlanOpen)}
                            className="flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md hover:bg-emerald-200 transition-colors shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            PLANES PREDETERMINADOS
                          </button>
                          {isPredefinedPlanOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
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
                                      <span className="font-bold block leading-tight">{plan.titulo || plan.acuerdo}</span>
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
                          className="flex items-center px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-md hover:bg-sky-700 transition-colors shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          AGREGAR OBJETIVO
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {(formData.pccObjetivos || []).map((obj, index) => (
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
                            <AutoExpandingTextArea label="Objetivo" id={`obj-objetivo-${index}`} name={`obj-objetivo-${index}`} value={obj.objetivo || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'objetivo', e.target.value)} />
                            <AutoExpandingTextArea label="Acuerdo" id={`obj-acuerdo-${index}`} name={`obj-acuerdo-${index}`} value={obj.acuerdo || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'acuerdo', e.target.value)} />
                            <AutoExpandingTextArea label="Acciones específicas" id={`obj-acciones-${index}`} name={`obj-acciones-${index}`} value={obj.acciones || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'acciones', e.target.value)} />
                            <AutoExpandingTextArea label="Plazo" id={`obj-plazo-${index}`} name={`obj-plazo-${index}`} value={obj.plazo || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'plazo', e.target.value)} />
                            <AutoExpandingTextArea label="Responsable/s" id={`obj-resp-${index}`} name={`obj-resp-${index}`} value={obj.responsables || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'responsables', e.target.value)} />
                            <AutoExpandingTextArea label="Seguimiento" id={`obj-seguimiento-${index}`} name={`obj-seguimiento-${index}`} value={obj.seguimiento || ''} onChange={(e) => handleUpdatePccObjetivo(index, 'seguimiento', e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    {renderRadioGroup("¿Está de acuerdo con el plan elaborado en conjunto con el equipo?", "acuerdoPlanEquipo", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                    {renderRadioGroup("¿Está de acuerdo con que lo contactemos para seguimiento?", "acuerdoContactoSeguimiento", [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }])}
                  </div>

                  <div className="p-3 border border-slate-200 rounded-md bg-white mb-4 mt-6">
                    <h4 className="text-md font-medium text-slate-700 mb-2">Próximo control:</h4>
                    <div>
                      <label htmlFor="planProximoControlTiempo" className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                      <select
                        id="planProximoControlTiempo"
                        name="planProximoControlTiempo"
                        value={formData.planProximoControlTiempo || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700"
                      >
                        {tiempoControlOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <FormField label="Indicaciones adicionales:" id="indicaciones" name="indicaciones" value={formData.indicaciones || ''} onChange={handleChange} isTextArea rows={4} placeholder="Ingrese indicaciones adicionales o detalles del plan aquí..." />
                </section>

              </form>
          </div>

        {/* Columna Derecha: Resumen Sticky */}
        <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2.5 lg:h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] overflow-hidden">
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1.5 mb-2.5 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-hidden">
              {/* Bloque Anamnesis */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                  <label className="block text-xs font-semibold text-slate-800">Anamnesis</label>
                  <CopyButton textToCopy={anamnesisText} />
                </div>
                <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              {/* Bloque Exploración */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                  <label className="block text-xs font-semibold text-slate-800">Exploración</label>
                  <CopyButton textToCopy={exploracionText} />
                </div>
                <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              {/* Bloque Actuación */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                  <label className="block text-xs font-semibold text-slate-800">Actuación</label>
                  <CopyButton textToCopy={actuacionText} />
                </div>
                <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
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
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
              title="Limpiar Formulario y Crear Nuevo"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">NUEVO FORM</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FichaConsultaPasmi;
