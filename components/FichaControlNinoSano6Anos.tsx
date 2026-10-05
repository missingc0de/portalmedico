import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlNinoSano6AnosFormData, User } from '../types';
import FormField from './FormField';
import CopyButton from './CopyButton';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaControlNinoSano6AnosFormData = {
  // Encabezado
  edad: '6 años',
  acompanante: '',
  parentesco: '',
  establecimientoEducacionalCurso: '',

  // Anamnesis - Antecedentes Generales
  antecedentesMorbidos: 'Niega.',
  cirugias: 'Niega.',
  hospitalizaciones: 'Niega.',
  medicamentos: 'Niega.',
  alergias: 'Niega.',
  controlesEspecialistas: 'Niega.',
  enfermedadesConsultasRecientes: 'Sin eventos recientes.',
  antecedentesFamiliaresRelevantes: 'Sin antecedentes relevantes.',
  vacunas: 'Al día.',

  // Escolaridad y Desarrollo
  escolaridadEstablecimiento: '',
  escolaridadCurso: '',
  escolaridadRendimiento: 'Adecuado.',
  escolaridadAsistencia: 'Adecuada.',
  escolaridadRelacionCompaneros: 'Buena relación con pares.',
  escolaridadRelacionProfesores: 'Buena relación.',
  escolaridadDificultadesAprendizaje: 'Niega.',
  escolaridadConducta: 'Adecuada para la edad.',
  escolaridadBullying: 'Niega.',
  escolaridadPreocupaciones: 'Sin preocupaciones referidas.',

  // Área Socioemocional
  socioemocionalAnimoHabitual: 'Eutímico, estable.',
  socioemocionalAnsiedadMiedos: 'Niega.',
  socioemocionalIrritabilidadAgresividad: 'Niega.',
  socioemocionalRelacionFamiliar: 'Buena dinámica familiar.',
  socioemocionalRedApoyo: 'Familia presente y activa.',
  socioemocionalEventosEstresores: 'Sin eventos estresores recientes.',
  socioemocionalSospechaMaltrato: 'No.',

  // Alimentación
  alimentacionComidasDiarias: '4 comidas diarias.',
  alimentacionDesayuno: 'Sí.',
  alimentacionFrutasVerduras: 'Diario.',
  alimentacionLacteos: '2-3 porciones/día.',
  alimentacionAgua: 'Consumo habitual de agua.',
  alimentacionBebidasJugos: 'Escaso / Ocasional.',
  alimentacionGolosinasSnacks: 'Ocasional.',
  alimentacionComidaRapida: 'Ocasional.',
  alimentacionConductasPreocupantes: 'Niega.',

  // Actividad Física y Sedentarismo
  actividadFisicaMinutosDia: '60 min/día.',
  actividadFisicaDeporte: 'Juego activo diario.',
  actividadFisicaHorasPantalla: '< 1 h/día.',
  actividadFisicaPantallasComidas: 'No.',

  // Sueño
  suenoHoras: '10 horas/noche.',
  suenoHorarioHabitual: '21:00 a 07:00.',
  suenoReparador: 'Sí.',
  suenoRonquidoApneas: 'Niega.',

  // Eliminación
  eliminacionDiuresis: 'Conservada.',
  eliminacionDeposiciones: 'Conservadas.',
  eliminacionEnuresis: 'Niega.',
  eliminacionEncopresis: 'Niega.',

  // Salud Bucal
  saludBucalCepillado: '2-3 veces/día.',
  saludBucalPastaFluorada: 'Sí.',
  saludBucalControlVigente: 'Sí.',
  saludBucalPautaCero: 'Realizada / Al día.',
  saludBucalDolorCaries: 'Niega.',

  // Visión / Audición
  visionDificultadVisual: 'Niega.',
  visionUsoLentes: 'No.',
  audicionDificultadAuditiva: 'Niega.',
  audicionOtitisRecurrente: 'Niega.',

  // Seguridad
  seguridadCinturonRetencion: 'Uso de sistema de retención infantil / cinturón al día.',
  seguridadCasco: 'Uso de casco en bicicleta/scooter.',
  seguridadHumoTabaco: 'Niega.',
  seguridadOtrosRiesgos: 'Sin riesgos ambientales identificados.',

  // Exploración - Antropometría
  efPeso: '',
  efTalla: '',
  efImc: '',
  efImcE: '',
  efTE: '',
  efDiagnosticoNutricional: 'Eutrófico/a.',
  efDiagnosticoTalla: 'Talla normal.',
  efEvolucionCurva: 'Normocrecimiento.',

  // Signos Vitales
  efPa: '',
  efPercentilPa: 'P50 (Normal).',
  efFc: '',
  efFr: '',

  // Examen General
  efGeneral: 'Buenas condiciones generales. Hidratado/a, bien perfundido/a.',
  efAnimoEnergia: 'Tranquilo/a, reactivo/a.',
  efInteraccionContactoVisual: 'Contacto visual adecuado, interactúa activamente.',

  // Piel y Fanéreos
  efPielMucosas: 'Piel y mucosas rosadas, limpias, hidratadas.',
  efLesionesDermatologicas: 'No.',
  efAcantosisNigricans: 'No.',
  efAlopeciaPediculosis: 'No.',
  efUnas: 'Normales.',
  efOlorAxilarAdrenarquia: 'Sin signos de adrenarquia.',

  // Cabeza y Cuello
  efCabezaCuello: 'Cabeza simétrica, sin deformidades evidentes.',
  efAdenopatias: 'No.',
  efTiroides: 'Sin alteraciones palpables.',

  // Oftalmológico
  efAgudezaVisualOd: '20/20',
  efAgudezaVisualOi: '20/20',
  efReflejoRojo: 'Simétrico.',
  efEstrabismo: 'No.',
  efMotilidadOcular: 'Conservada.',

  // Auditivo
  efEvaluacionAuditiva: 'Normal.',
  efOtoscopia: 'CAE libre, membrana timpánica indemne bilateral.',

  // Cavidad Oral
  efDenticion: 'Dentición mixta.',
  efRecambioDentario: 'Fisiológico.',
  efCariesVisibles: 'No.',
  efEncias: 'Sanas, sin gingivitis.',
  efMaloclusion: 'No.',
  efHigieneOral: 'Adecuada.',
  efPautaCeroRevisada: 'Sí.',

  // Cardiopulmonar
  efCardiovascular: 'RR2T, sin soplos.',
  efPulmonar: 'MP (+), sin ruidos agregados.',
  efSintomasAsmaEjercicio: 'Niega.',

  // Abdomen
  efAbdomen: 'RHA (+), blando, depresible, indoloro. Sin masas ni visceromegalias. Sin hernias.',

  // Genitourinario / Desarrollo Puberal
  efConsentimientoGenitales: 'Sí.',
  efGenitalesExternos: 'Tanner 1 (Prepúber), de aspecto normal.',
  efTanner: 'Tanner 1 (G1P1 / B1P1).',
  efSignosPubertadPrecoz: 'No.',
  efTesticulosDescendidos: 'Testículos descendidos bilateralmente.',

  // Musculoesquelético
  efMarcha: 'Normal, simétrica.',
  efSimetriaEeii: 'Conservada.',
  efActitudPostural: 'Normolineo.',
  efTestAdams: 'Negativo.',
  efEscoliosisSospechada: 'No.',
  efPies: 'Pie plano flexible fisiológico.',
  efDesgasteCalzado: 'No.',

  // Neurológico
  efNeurologico: 'Marcha y carrera simétricas. Sin déficit neurológico evidente.',
  efFuerzaMovilidad: 'Conservada en 4 extremidades.',
  efReflejosSimetria: 'ROT simétricos.',

  // Cuestionario de Salud Infantil y Pauta CERO
  cuestionarioSaludInfantil: 'Aplicado y revisado.',
  cuestionarioHallazgos: 'Sin hallazgos patológicos.',
  pautaCeroResultado: 'Bajo riesgo de caries.',

  // Diagnósticos
  diagnosticos: `1. Escolar de 6 años en control de salud infantil.
2. Estado nutricional: Eutrófico/a.
3. Talla: Normal.
4. Presión arterial: Normal.
5. Desarrollo integral y escolar adecuado.
6. Salud visual y auditiva normal.
7. Salud bucal adecuada (Pauta CERO al día).
8. Desarrollo puberal: Tanner 1 (Prepúber).
9. Evaluación musculoesquelética normal.
10. Riesgo biopsicosocial: Bajo.`,

  // Actuación / Indicaciones
  indicaciones: `- Entregar resultado del control al niño/a y cuidador, explicando hallazgos y acuerdos.
- Promover alimentación saludable, variada y adecuada a la edad.
- Favorecer consumo de agua y limitar bebidas azucaradas, golosinas y alimentos ultraprocesados.
- Promover actividad física diaria y disminuir conductas sedentarias/tiempo de pantalla.
- Mantener horarios regulares y sueño suficiente para la edad (10 a 11 horas nocturnas).
- Reforzar higiene corporal y lavado de manos.
- Cepillado dental al menos 2 veces al día con pasta fluorada y especialmente antes de dormir.
- Mantener controles odontológicos. Corresponde control de salud bucal CERO y atención odontológica GES de Salud Oral Integral de los 6 años.
- Reforzar seguridad vial, uso de cinturón/sistema de retención correspondiente y casco para bicicleta/scooter.
- Educar respecto a prevención de accidentes y autocuidado.
- Favorecer actividades familiares, sociales, recreativas y escolares saludables.
- Reforzar crianza respetuosa y comunicación familiar.
- Mantener esquema de inmunizaciones vigente.
- Próximo control de salud infantil: 7 años.`,
};

interface SectionConfig {
  title: string;
  fields: { name: keyof FichaControlNinoSano6AnosFormData; label: string; isTextArea?: boolean; rows?: number }[];
}

const formSections: SectionConfig[] = [
  {
    title: "1. Datos del Control",
    fields: [
      { name: 'edad', label: 'Edad' },
      { name: 'acompanante', label: 'Acompañante' },
      { name: 'parentesco', label: 'Parentesco' },
      { name: 'establecimientoEducacionalCurso', label: 'Establecimiento Educacional / Curso' },
    ]
  },
  {
    title: "2. Anamnesis - Antecedentes Generales",
    fields: [
      { name: 'antecedentesMorbidos', label: 'Antecedentes Mórbidos' },
      { name: 'cirugias', label: 'Cirugías' },
      { name: 'hospitalizaciones', label: 'Hospitalizaciones' },
      { name: 'medicamentos', label: 'Medicamentos' },
      { name: 'alergias', label: 'Alergias' },
      { name: 'controlesEspecialistas', label: 'Controles con Especialistas' },
      { name: 'enfermedadesConsultasRecientes', label: 'Enfermedades / Consultas Recientes' },
      { name: 'antecedentesFamiliaresRelevantes', label: 'Antecedentes Familiares Relevantes' },
      { name: 'vacunas', label: 'Vacunas' },
    ]
  },
  {
    title: "3. Escolaridad y Desarrollo",
    fields: [
      { name: 'escolaridadEstablecimiento', label: 'Establecimiento Educacional' },
      { name: 'escolaridadCurso', label: 'Curso' },
      { name: 'escolaridadRendimiento', label: 'Rendimiento Escolar' },
      { name: 'escolaridadAsistencia', label: 'Asistencia Escolar' },
      { name: 'escolaridadRelacionCompaneros', label: 'Relación con Compañeros' },
      { name: 'escolaridadRelacionProfesores', label: 'Relación con Profesores' },
      { name: 'escolaridadDificultadesAprendizaje', label: 'Dificultades de Aprendizaje / Concentración' },
      { name: 'escolaridadConducta', label: 'Conducta' },
      { name: 'escolaridadBullying', label: 'Antecedentes de Bullying / Acoso' },
      { name: 'escolaridadPreocupaciones', label: 'Preocupaciones del Niño/a o Cuidador' },
    ]
  },
  {
    title: "4. Área Socioemocional",
    fields: [
      { name: 'socioemocionalAnimoHabitual', label: 'Ánimo Habitual' },
      { name: 'socioemocionalAnsiedadMiedos', label: 'Ansiedad / Miedos' },
      { name: 'socioemocionalIrritabilidadAgresividad', label: 'Irritabilidad / Agresividad' },
      { name: 'socioemocionalRelacionFamiliar', label: 'Relación Familiar' },
      { name: 'socioemocionalRedApoyo', label: 'Red de Apoyo' },
      { name: 'socioemocionalEventosEstresores', label: 'Eventos Vitales / Estresores Recientes' },
      { name: 'socioemocionalSospechaMaltrato', label: 'Sospecha de Maltrato / Negligencia' },
    ]
  },
  {
    title: "5. Alimentación",
    fields: [
      { name: 'alimentacionComidasDiarias', label: 'Número de Comidas Diarias' },
      { name: 'alimentacionDesayuno', label: 'Desayuno (Sí/No)' },
      { name: 'alimentacionFrutasVerduras', label: 'Frutas y Verduras' },
      { name: 'alimentacionLacteos', label: 'Lácteos' },
      { name: 'alimentacionAgua', label: 'Consumo de Agua' },
      { name: 'alimentacionBebidasJugos', label: 'Bebidas / Jugos Azucarados' },
      { name: 'alimentacionGolosinasSnacks', label: 'Golosinas / Snacks' },
      { name: 'alimentacionComidaRapida', label: 'Comida Rápida / Ultraprocesados' },
      { name: 'alimentacionConductasPreocupantes', label: 'Conductas Alimentarias Preocupantes' },
    ]
  },
  {
    title: "6. Actividad Física y Sedentarismo",
    fields: [
      { name: 'actividadFisicaMinutosDia', label: 'Actividad Física / Juego Activo (min/día)' },
      { name: 'actividadFisicaDeporte', label: 'Deporte' },
      { name: 'actividadFisicaHorasPantalla', label: 'Tiempo de Pantallas (h/día)' },
      { name: 'actividadFisicaPantallasComidas', label: 'Pantallas durante Comidas (Sí/No)' },
    ]
  },
  {
    title: "7. Sueño y Eliminación",
    fields: [
      { name: 'suenoHoras', label: 'Horas de Sueño' },
      { name: 'suenoHorarioHabitual', label: 'Horario Habitual' },
      { name: 'suenoReparador', label: 'Sueño Reparador (Sí/No)' },
      { name: 'suenoRonquidoApneas', label: 'Ronquido Habitual / Apneas' },
      { name: 'eliminacionDiuresis', label: 'Diuresis' },
      { name: 'eliminacionDeposiciones', label: 'Deposiciones' },
      { name: 'eliminacionEnuresis', label: 'Enuresis' },
      { name: 'eliminacionEncopresis', label: 'Encopresis' },
    ]
  },
  {
    title: "8. Salud Bucal, Visión y Audición",
    fields: [
      { name: 'saludBucalCepillado', label: 'Cepillado Dental (veces/día)' },
      { name: 'saludBucalPastaFluorada', label: 'Pasta Fluorada (Sí/No)' },
      { name: 'saludBucalControlVigente', label: 'Control Odontológico Vigente (Sí/No)' },
      { name: 'saludBucalPautaCero', label: 'Pauta CERO' },
      { name: 'saludBucalDolorCaries', label: 'Dolor / Caries Referidas' },
      { name: 'visionDificultadVisual', label: 'Dificultad Visual Referida' },
      { name: 'visionUsoLentes', label: 'Uso de Lentes (Sí/No)' },
      { name: 'audicionDificultadAuditiva', label: 'Dificultad Auditiva Referida' },
      { name: 'audicionOtitisRecurrente', label: 'Antecedentes de Otitis Recurrente' },
    ]
  },
  {
    title: "9. Seguridad y Riesgos",
    fields: [
      { name: 'seguridadCinturonRetencion', label: 'Sistema de Retención / Cinturón de Seguridad' },
      { name: 'seguridadCasco', label: 'Uso de Casco (Bicicleta/Scooter)' },
      { name: 'seguridadHumoTabaco', label: 'Exposición a Humo de Tabaco' },
      { name: 'seguridadOtrosRiesgos', label: 'Otros Riesgos Ambientales' },
    ]
  },
  {
    title: "10. Exploración - Antropometría y Signos Vitales",
    fields: [
      { name: 'efPeso', label: 'Peso (kg)' },
      { name: 'efTalla', label: 'Talla (cm)' },
      { name: 'efImc', label: 'IMC (kg/m²)' },
      { name: 'efImcE', label: 'IMC/E (DE)' },
      { name: 'efTE', label: 'T/E (DE)' },
      { name: 'efDiagnosticoNutricional', label: 'Diagnóstico Nutricional' },
      { name: 'efDiagnosticoTalla', label: 'Diagnóstico de Talla' },
      { name: 'efEvolucionCurva', label: 'Evolución Curva de Crecimiento' },
      { name: 'efPa', label: 'Presión Arterial (PA mmHg)' },
      { name: 'efPercentilPa', label: 'Percentil PA según Edad/Sexo/Talla' },
      { name: 'efFc', label: 'Frecuencia Cardíaca (FC lpm)' },
      { name: 'efFr', label: 'Frecuencia Respiratoria (FR rpm)' },
    ]
  },
  {
    title: "11. Examen Físico Segmentario",
    fields: [
      { name: 'efGeneral', label: 'Examen General' },
      { name: 'efAnimoEnergia', label: 'Estado de Ánimo / Energía' },
      { name: 'efInteraccionContactoVisual', label: 'Interacción y Contacto Visual' },
      { name: 'efPielMucosas', label: 'Piel y Mucosas' },
      { name: 'efLesionesDermatologicas', label: 'Lesiones Dermatológicas' },
      { name: 'efAcantosisNigricans', label: 'Acantosis Nigricans' },
      { name: 'efAlopeciaPediculosis', label: 'Alopecia / Pediculosis' },
      { name: 'efUnas', label: 'Uñas' },
      { name: 'efOlorAxilarAdrenarquia', label: 'Olor Axilar / Adrenarquia' },
      { name: 'efCabezaCuello', label: 'Cabeza y Cuello' },
      { name: 'efAdenopatias', label: 'Adenopatías' },
      { name: 'efTiroides', label: 'Tiroides' },
    ]
  },
  {
    title: "12. Examen de Sentidos, Cavidad Oral y Cardiopulmonar",
    fields: [
      { name: 'efAgudezaVisualOd', label: 'Agudeza Visual OD (Cartilla E)' },
      { name: 'efAgudezaVisualOi', label: 'Agudeza Visual OI (Cartilla E)' },
      { name: 'efReflejoRojo', label: 'Reflejo Rojo' },
      { name: 'efEstrabismo', label: 'Estrabismo' },
      { name: 'efMotilidadOcular', label: 'Motilidad Ocular' },
      { name: 'efEvaluacionAuditiva', label: 'Evaluación Auditiva' },
      { name: 'efOtoscopia', label: 'Otoscopia' },
      { name: 'efDenticion', label: 'Dentición (Temporal/Mixta)' },
      { name: 'efRecambioDentario', label: 'Recambio Dentario' },
      { name: 'efCariesVisibles', label: 'Caries Visibles' },
      { name: 'efEncias', label: 'Encías' },
      { name: 'efMaloclusion', label: 'Maloclusión' },
      { name: 'efHigieneOral', label: 'Higiene Oral' },
      { name: 'efPautaCeroRevisada', label: 'Pauta CERO Revisada' },
      { name: 'efCardiovascular', label: 'Cardiovascular' },
      { name: 'efPulmonar', label: 'Pulmonar' },
      { name: 'efSintomasAsmaEjercicio', label: 'Síntomas Sugerentes de Asma con Ejercicio' },
    ]
  },
  {
    title: "13. Abdomen, Genitourinario y Musculoesquelético",
    fields: [
      { name: 'efAbdomen', label: 'Abdomen' },
      { name: 'efConsentimientoGenitales', label: 'Consentimiento/Asentimiento Examen Genital' },
      { name: 'efGenitalesExternos', label: 'Genitales Externos' },
      { name: 'efTanner', label: 'Tanner' },
      { name: 'efSignosPubertadPrecoz', label: 'Signos de Pubertad Precoz' },
      { name: 'efTesticulosDescendidos', label: 'Testículos Descendidos Bilateralmente' },
      { name: 'efMarcha', label: 'Marcha' },
      { name: 'efSimetriaEeii', label: 'Simetría EEII' },
      { name: 'efActitudPostural', label: 'Actitud Postural' },
      { name: 'efTestAdams', label: 'Test de Adams' },
      { name: 'efEscoliosisSospechada', label: 'Escoliosis Sospechada' },
      { name: 'efPies', label: 'Pies' },
      { name: 'efDesgasteCalzado', label: 'Desgaste Asimétrico del Calzado' },
      { name: 'efNeurologico', label: 'Neurológico' },
      { name: 'efFuerzaMovilidad', label: 'Fuerza / Movilidad' },
      { name: 'efReflejosSimetria', label: 'Reflejos / Simetría' },
    ]
  },
  {
    title: "14. Cuestionarios y Pautas",
    fields: [
      { name: 'cuestionarioSaludInfantil', label: 'Cuestionario de Salud Infantil (Aplicado/Revisado)' },
      { name: 'cuestionarioHallazgos', label: 'Hallazgos Relevantes Cuestionario' },
      { name: 'pautaCeroResultado', label: 'Resultado Pauta CERO' },
    ]
  },
  {
    title: "15. Diagnósticos e Indicaciones",
    fields: [
      { name: 'diagnosticos', label: 'Diagnósticos', isTextArea: true, rows: 6 },
      { name: 'indicaciones', label: 'Indicaciones', isTextArea: true, rows: 8 },
    ]
  }
];

interface FichaControlNinoSano6AnosProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlNinoSano6AnosFormData>('local_FichaControlNinoSano6Anos_v2', initialFormData);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');
  const [isUppercase, setIsUppercase] = useState<boolean>(false);

  const calculateIMC = useCallback((pesoStr: string, tallaStr: string): string => {
    const peso = parseFloat(pesoStr);
    const tallaCm = parseFloat(tallaStr);
    if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
      const tallaM = tallaCm / 100;
      return (peso / (tallaM * tallaM)).toFixed(2);
    }
    return '';
  }, []);

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    
    let anamnesis = `CONTROL DE SALUD INFANTIL – 6 AÑOS\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA CONTROL: ${todayStr}\n`;
    anamnesis += `EDAD: ${formData.edad || '6 años'}\n`;
    if (formData.acompanante) anamnesis += `ACOMPAÑANTE: ${formData.acompanante}\n`;
    if (formData.parentesco) anamnesis += `PARENTESCO: ${formData.parentesco}\n`;
    if (formData.establecimientoEducacionalCurso) anamnesis += `ESTABLECIMIENTO EDUCACIONAL/CURSO: ${formData.establecimientoEducacionalCurso}\n`;
    anamnesis += `PROFESIONAL: ${loggedInUser?.fullName || 'Médico/a / Enfermero/a'}\n`;
    anamnesis += `MOTIVO: Control de salud infantil de los 6 años\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `ANAMNESIS\n`;
    anamnesis += `ANTECEDENTES GENERALES:\n`;
    anamnesis += `- Antecedentes mórbidos: ${formData.antecedentesMorbidos || 'Niega'}\n`;
    anamnesis += `- Cirugías: ${formData.cirugias || 'Niega'}\n`;
    anamnesis += `- Hospitalizaciones: ${formData.hospitalizaciones || 'Niega'}\n`;
    anamnesis += `- Medicamentos: ${formData.medicamentos || 'Niega'}\n`;
    anamnesis += `- Alergias: ${formData.alergias || 'Niega'}\n`;
    anamnesis += `- Controles con especialistas: ${formData.controlesEspecialistas || 'Niega'}\n`;
    anamnesis += `- Enfermedades/consultas recientes: ${formData.enfermedadesConsultasRecientes || 'Sin eventos'}\n`;
    anamnesis += `- Antecedentes familiares relevantes: ${formData.antecedentesFamiliaresRelevantes || 'Sin antecedentes'}\n`;
    anamnesis += `- Vacunas: ${formData.vacunas || 'Al día'}\n\n`;

    anamnesis += `ESCOLARIDAD Y DESARROLLO:\n`;
    if (formData.escolaridadEstablecimiento) anamnesis += `- Establecimiento: ${formData.escolaridadEstablecimiento}\n`;
    if (formData.escolaridadCurso) anamnesis += `- Curso: ${formData.escolaridadCurso}\n`;
    anamnesis += `- Rendimiento escolar: ${formData.escolaridadRendimiento || 'Adecuado'}\n`;
    anamnesis += `- Asistencia escolar: ${formData.escolaridadAsistencia || 'Adecuada'}\n`;
    anamnesis += `- Relación con compañeros: ${formData.escolaridadRelacionCompaneros || 'Buena'}\n`;
    anamnesis += `- Relación con profesores: ${formData.escolaridadRelacionProfesores || 'Buena'}\n`;
    anamnesis += `- Dificultades de aprendizaje/concentración: ${formData.escolaridadDificultadesAprendizaje || 'Niega'}\n`;
    anamnesis += `- Conducta: ${formData.escolaridadConducta || 'Adecuada'}\n`;
    anamnesis += `- Antecedentes de bullying/acoso: ${formData.escolaridadBullying || 'Niega'}\n`;
    anamnesis += `- Preocupaciones del niño/a o cuidador: ${formData.escolaridadPreocupaciones || 'Sin preocupaciones'}\n\n`;

    anamnesis += `ÁREA SOCIOEMOCIONAL:\n`;
    anamnesis += `- Ánimo habitual: ${formData.socioemocionalAnimoHabitual || 'Eutímico'}\n`;
    anamnesis += `- Ansiedad/miedos: ${formData.socioemocionalAnsiedadMiedos || 'Niega'}\n`;
    anamnesis += `- Irritabilidad/agresividad: ${formData.socioemocionalIrritabilidadAgresividad || 'Niega'}\n`;
    anamnesis += `- Relación familiar: ${formData.socioemocionalRelacionFamiliar || 'Buena'}\n`;
    anamnesis += `- Red de apoyo: ${formData.socioemocionalRedApoyo || 'Presente'}\n`;
    anamnesis += `- Eventos vitales/estresores recientes: ${formData.socioemocionalEventosEstresores || 'Sin eventos'}\n`;
    anamnesis += `- Sospecha de maltrato/negligencia: ${formData.socioemocionalSospechaMaltrato || 'No'}\n\n`;

    anamnesis += `ALIMENTACIÓN:\n`;
    anamnesis += `- Número de comidas diarias: ${formData.alimentacionComidasDiarias || '4'}\n`;
    anamnesis += `- Desayuno: ${formData.alimentacionDesayuno || 'Sí'}\n`;
    anamnesis += `- Frutas/verduras: ${formData.alimentacionFrutasVerduras || 'Diario'}\n`;
    anamnesis += `- Lácteos: ${formData.alimentacionLacteos || '2-3 porciones/día'}\n`;
    anamnesis += `- Agua: ${formData.alimentacionAgua || 'Habitual'}\n`;
    anamnesis += `- Bebidas/jugos azucarados: ${formData.alimentacionBebidasJugos || 'Escaso'}\n`;
    anamnesis += `- Golosinas/snacks: ${formData.alimentacionGolosinasSnacks || 'Ocasional'}\n`;
    anamnesis += `- Comida rápida/ultraprocesados: ${formData.alimentacionComidaRapida || 'Ocasional'}\n`;
    anamnesis += `- Conductas alimentarias preocupantes: ${formData.alimentacionConductasPreocupantes || 'Niega'}\n\n`;

    anamnesis += `ACTIVIDAD FÍSICA Y SEDENTARISMO:\n`;
    anamnesis += `- Actividad física/juego activo: ${formData.actividadFisicaMinutosDia || '60 min/día'}\n`;
    anamnesis += `- Deporte: ${formData.actividadFisicaDeporte || 'Juego activo'}\n`;
    anamnesis += `- Tiempo de pantallas: ${formData.actividadFisicaHorasPantalla || '< 1 h/día'}\n`;
    anamnesis += `- Televisión/pantallas durante comidas: ${formData.actividadFisicaPantallasComidas || 'No'}\n\n`;

    anamnesis += `SUEÑO:\n`;
    anamnesis += `- Horas de sueño: ${formData.suenoHoras || '10 horas'}\n`;
    anamnesis += `- Horario habitual: ${formData.suenoHorarioHabitual || '21:00 a 07:00'}\n`;
    anamnesis += `- Sueño reparador: ${formData.suenoReparador || 'Sí'}\n`;
    anamnesis += `- Ronquido habitual/apneas: ${formData.suenoRonquidoApneas || 'Niega'}\n\n`;

    anamnesis += `ELIMINACIÓN:\n`;
    anamnesis += `- Diuresis: ${formData.eliminacionDiuresis || 'Conservada'}\n`;
    anamnesis += `- Deposiciones: ${formData.eliminacionDeposiciones || 'Conservadas'}\n`;
    anamnesis += `- Enuresis: ${formData.eliminacionEnuresis || 'Niega'}\n`;
    anamnesis += `- Encopresis: ${formData.eliminacionEncopresis || 'Niega'}\n\n`;

    anamnesis += `SALUD BUCAL:\n`;
    anamnesis += `- Cepillado dental: ${formData.saludBucalCepillado || '2-3 veces/día'}\n`;
    anamnesis += `- Pasta fluorada: ${formData.saludBucalPastaFluorada || 'Sí'}\n`;
    anamnesis += `- Control odontológico vigente: ${formData.saludBucalControlVigente || 'Sí'}\n`;
    anamnesis += `- Pauta CERO: ${formData.saludBucalPautaCero || 'Realizada'}\n`;
    anamnesis += `- Dolor/caries referidas: ${formData.saludBucalDolorCaries || 'Niega'}\n\n`;

    anamnesis += `VISIÓN/AUDICIÓN:\n`;
    anamnesis += `- Dificultad visual referida: ${formData.visionDificultadVisual || 'Niega'}\n`;
    anamnesis += `- Uso de lentes: ${formData.visionUsoLentes || 'No'}\n`;
    anamnesis += `- Dificultad auditiva: ${formData.audicionDificultadAuditiva || 'Niega'}\n`;
    anamnesis += `- Antecedentes de otitis recurrente: ${formData.audicionOtitisRecurrente || 'Niega'}\n\n`;

    anamnesis += `SEGURIDAD:\n`;
    anamnesis += `- Uso de sistema de retención/cinturón según corresponda: ${formData.seguridadCinturonRetencion || 'Sí'}\n`;
    anamnesis += `- Uso de casco bicicleta/scooter: ${formData.seguridadCasco || 'Sí'}\n`;
    anamnesis += `- Exposición a humo de tabaco: ${formData.seguridadHumoTabaco || 'Niega'}\n`;
    if (formData.seguridadOtrosRiesgos) anamnesis += `- Otros riesgos ambientales: ${formData.seguridadOtrosRiesgos}\n`;

    let exploracion = `EXPLORACIÓN\n`;
    exploracion += `ANTROPOMETRÍA:\n`;
    exploracion += `- Peso: ${formData.efPeso ? formData.efPeso + ' kg' : '___ kg'}\n`;
    exploracion += `- Talla: ${formData.efTalla ? formData.efTalla + ' cm' : '___ cm'}\n`;
    exploracion += `- IMC: ${formData.efImc ? formData.efImc + ' kg/m²' : '___ kg/m²'}\n`;
    if (formData.efImcE) exploracion += `- IMC/E: ${formData.efImcE} DE\n`;
    if (formData.efTE) exploracion += `- T/E: ${formData.efTE} DE\n`;
    exploracion += `- Diagnóstico nutricional: ${formData.efDiagnosticoNutricional || 'Eutrófico/a'}\n`;
    exploracion += `- Diagnóstico de talla: ${formData.efDiagnosticoTalla || 'Talla normal'}\n`;
    exploracion += `- Evolución curva de crecimiento: ${formData.efEvolucionCurva || 'Normocrecimiento'}\n\n`;

    exploracion += `SIGNOS VITALES:\n`;
    exploracion += `- PA: ${formData.efPa || '___ / ___ mmHg'}\n`;
    if (formData.efPercentilPa) exploracion += `- Percentil PA según edad/sexo/talla: ${formData.efPercentilPa}\n`;
    exploracion += `- FC: ${formData.efFc ? formData.efFc + ' lpm' : '___ lpm'}\n`;
    if (formData.efFr) exploracion += `- FR: ${formData.efFr} rpm\n`;
    exploracion += `\n`;

    exploracion += `EXAMEN GENERAL:\n`;
    exploracion += `${formData.efGeneral || 'Buenas condiciones generales. Hidratado/a, bien perfundido/a.'}\n`;
    if (formData.efAnimoEnergia) exploracion += `- Estado de ánimo/energía: ${formData.efAnimoEnergia}\n`;
    if (formData.efInteraccionContactoVisual) exploracion += `- Interacción y contacto visual: ${formData.efInteraccionContactoVisual}\n`;
    exploracion += `\n`;

    exploracion += `PIEL Y FANÉREOS:\n`;
    exploracion += `- Piel y mucosas: ${formData.efPielMucosas || 'Normales'}\n`;
    exploracion += `- Lesiones dermatológicas: ${formData.efLesionesDermatologicas || 'No'}\n`;
    exploracion += `- Acantosis nigricans: ${formData.efAcantosisNigricans || 'No'}\n`;
    exploracion += `- Alopecia/pediculosis: ${formData.efAlopeciaPediculosis || 'No'}\n`;
    exploracion += `- Uñas: ${formData.efUnas || 'Normales'}\n`;
    exploracion += `- Olor axilar/adrenarquia: ${formData.efOlorAxilarAdrenarquia || 'Sin adrenarquia'}\n\n`;

    exploracion += `CABEZA Y CUELLO:\n`;
    exploracion += `${formData.efCabezaCuello || 'Cabeza sin alteraciones evidentes.'}\n`;
    exploracion += `- Adenopatías: ${formData.efAdenopatias || 'No'}\n`;
    exploracion += `- Tiroides: ${formData.efTiroides || 'Sin alteraciones'}\n\n`;

    exploracion += `OFTALMOLÓGICO:\n`;
    exploracion += `Agudeza visual con cartilla E:\n`;
    exploracion += `- OD: ${formData.efAgudezaVisualOd || '20/20'}\n`;
    exploracion += `- OI: ${formData.efAgudezaVisualOi || '20/20'}\n`;
    exploracion += `- Reflejo rojo: ${formData.efReflejoRojo || 'Simétrico'}\n`;
    exploracion += `- Estrabismo: ${formData.efEstrabismo || 'No'}\n`;
    exploracion += `- Motilidad ocular: ${formData.efMotilidadOcular || 'Conservada'}\n\n`;

    exploracion += `AUDITIVO:\n`;
    exploracion += `- Evaluación auditiva: ${formData.efEvaluacionAuditiva || 'Normal'}\n`;
    exploracion += `- Otoscopia: ${formData.efOtoscopia || 'Normal bilateral'}\n\n`;

    exploracion += `CAVIDAD ORAL:\n`;
    exploracion += `- Dentición: ${formData.efDenticion || 'Mixta'}\n`;
    exploracion += `- Recambio dentario: ${formData.efRecambioDentario || 'Fisiológico'}\n`;
    exploracion += `- Caries visibles: ${formData.efCariesVisibles || 'No'}\n`;
    exploracion += `- Encías: ${formData.efEncias || 'Sanas'}\n`;
    exploracion += `- Maloclusión: ${formData.efMaloclusion || 'No'}\n`;
    exploracion += `- Higiene oral: ${formData.efHigieneOral || 'Adecuada'}\n`;
    exploracion += `- Pauta CERO revisada: ${formData.efPautaCeroRevisada || 'Sí'}\n\n`;

    exploracion += `CARDIOPULMONAR:\n`;
    exploracion += `- Cardiovascular: ${formData.efCardiovascular || 'RR2T, sin soplos.'}\n`;
    exploracion += `- Pulmonar: ${formData.efPulmonar || 'MP (+), sin ruidos agregados.'}\n`;
    exploracion += `- Síntomas sugerentes de asma con ejercicio u otras circunstancias: ${formData.efSintomasAsmaEjercicio || 'Niega'}\n\n`;

    exploracion += `ABDOMEN:\n`;
    exploracion += `${formData.efAbdomen || 'RHA (+), blando, depresible, indoloro. Sin masas ni visceromegalias. Sin hernias.'}\n\n`;

    exploracion += `GENITOURINARIO/DESARROLLO PUBERAL:\n`;
    exploracion += `- Examen realizado con consentimiento/asentimiento: ${formData.efConsentimientoGenitales || 'Sí'}\n`;
    exploracion += `- Genitales externos: ${formData.efGenitalesExternos || 'Aspecto normal'}\n`;
    exploracion += `- Tanner: ${formData.efTanner || 'Tanner 1 (Prepúber)'}\n`;
    exploracion += `- Signos de pubertad precoz: ${formData.efSignosPubertadPrecoz || 'No'}\n`;
    exploracion += `- Testículos descendidos bilateralmente: ${formData.efTesticulosDescendidos || 'Sí'}\n\n`;

    exploracion += `MUSCULOESQUELÉTICO:\n`;
    exploracion += `- Marcha: ${formData.efMarcha || 'Normal'}\n`;
    exploracion += `- Simetría EEII: ${formData.efSimetriaEeii || 'Conservada'}\n`;
    exploracion += `- Actitud postural: ${formData.efActitudPostural || 'Normolineo'}\n`;
    exploracion += `- Test de Adams: ${formData.efTestAdams || 'Negativo'}\n`;
    exploracion += `- Escoliosis sospechada: ${formData.efEscoliosisSospechada || 'No'}\n`;
    exploracion += `- Pies: ${formData.efPies || 'Pie plano flexible'}\n`;
    exploracion += `- Desgaste asimétrico del calzado: ${formData.efDesgasteCalzado || 'No'}\n\n`;

    exploracion += `NEUROLÓGICO:\n`;
    exploracion += `${formData.efNeurologico || 'Marcha y carrera simétricas. Sin déficit neurológico evidente.'}\n`;
    if (formData.efFuerzaMovilidad) exploracion += `- Fuerza/movilidad: ${formData.efFuerzaMovilidad}\n`;
    if (formData.efReflejosSimetria) exploracion += `- Reflejos/simetría: ${formData.efReflejosSimetria}\n`;
    exploracion += `\n`;

    exploracion += `CUESTIONARIO DE SALUD INFANTIL:\n`;
    exploracion += `- Aplicado/revisado: ${formData.cuestionarioSaludInfantil || 'Sí'}\n`;
    exploracion += `- Hallazgos relevantes: ${formData.cuestionarioHallazgos || 'Sin hallazgos patológicos'}\n\n`;

    exploracion += `PAUTA CERO:\n`;
    exploracion += `- Resultado: ${formData.pautaCeroResultado || 'Bajo riesgo de caries'}\n`;

    let actuacion = `DIAGNÓSTICOS:\n`;
    actuacion += `${formData.diagnosticos || 'Escolar de 6 años en control de salud.'}\n\n`;

    actuacion += `ACTUACIÓN\nINDICACIONES:\n`;
    actuacion += `${formData.indicaciones || ''}\n`;

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim()
    };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const newImc = calculateIMC(formData.efPeso, formData.efTalla);
    if (newImc !== formData.efImc) {
      setFormData(prev => ({ ...prev, efImc: newImc }));
    }
  }, [formData.efPeso, formData.efTalla, formData.efImc, calculateIMC]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = generateSummaryParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
  }, [formData, generateSummaryParts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCopyToClipboard = (text: string, title: string) => {
    const textToCopy = isUppercase ? text.toUpperCase() : text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`'${title}' copiado al portapapeles.`);
    }).catch(err => {
      console.error('Error al copiar texto: ', err);
      alert('Error al copiar texto.');
    });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
            {formSections.map(section => (
              <section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                <h3 className="text-base font-bold text-sky-700 border-b border-sky-200 pb-1.5">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  {section.fields.map(field => (
                    <div key={field.name} className={field.isTextArea ? "md:col-span-2" : ""}>
                      <FormField
                        label={field.label}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        isTextArea={field.isTextArea}
                        rows={field.rows || 2}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Barra de Acciones Inferior */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-2 rounded-xl shadow-sm mb-6">
              <button 
                type="button" 
                onClick={onBackToMenu} 
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm uppercase text-xs tracking-widest cursor-pointer"
              >
                Volver al Menú
              </button>
              <button 
                type="button" 
                onClick={handleNewDocument} 
                className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest cursor-pointer"
              >
                BORRAR TODO
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Resumen Ficha Clínica */}
        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="mb-2 flex items-center gap-1.5 flex-shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isUppercase}
                  onChange={e => setIsUppercase(e.target.checked)}
                  className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                />
                <span>MAYÚSCULAS</span>
              </label>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                  <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea
                  value={isUppercase ? anamnesisText.toUpperCase() : anamnesisText}
                  onChange={(e) => setAnamnesisText(e.target.value)}
                  className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">EXPLORACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea
                  value={isUppercase ? exploracionText.toUpperCase() : exploracionText}
                  onChange={(e) => setExploracionText(e.target.value)}
                  className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ACTUACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea
                  value={isUppercase ? actuacionText.toUpperCase() : actuacionText}
                  onChange={(e) => setActuacionText(e.target.value)}
                  className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaControlNinoSano6Anos;
