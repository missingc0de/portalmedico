
import { View } from '../types';

export interface SiteTool {
  name: string;
  view: View;
  keywords: string[];
  description: string;
}

export const siteToolsData: SiteTool[] = [
  // Documentos
  { name: 'Constancia de Atención', view: 'constanciaAtencion', keywords: ['constancia', 'atencion', 'certificado', 'simple'], description: 'Generar una constancia simple de atención médica.' },
  { name: 'Orden de Estudios de Imágenes', view: 'ordenExamenRadiologico', keywords: ['orden', 'examen', 'radiologico', 'rayos', 'rx', 'imagenes'], description: 'Generar una orden para exámenes radiológicos.' },
  { name: 'Orden de Laboratorio', view: 'ordenLaboratorio', keywords: ['orden', 'laboratorio', 'examenes', 'sangre', 'orina'], description: 'Generar una orden para exámenes de laboratorio.' },
  { name: 'Certificado Escolar', view: 'certificadoEscolar', keywords: ['certificado', 'escolar', 'colegio', 'justificante'], description: 'Emitir un certificado para justificar ausencia escolar.' },
  { name: 'Derivaciones PSCV', view: 'derivacionesPscv', keywords: ['derivaciones', 'pscv', 'cardiovascular', 'interconsulta'], description: 'Hoja de derivaciones del Programa de Salud Cardiovascular.' },
  { name: 'Receta Médica', view: 'recetaMedica', keywords: ['receta', 'medica', 'medicamentos', 'farmacos'], description: 'Generar una receta médica estándar.' },
  { name: 'Certificado Médico', view: 'certificadoMedico', keywords: ['certificado', 'medico', 'general'], description: 'Generar un certificado médico estándar.' },
  { name: 'Ficha de Consultoría SM', view: 'fichaConsultoria', keywords: ['ficha', 'consultoria', 'salud mental', 'sm'], description: 'Generar ficha de consultoría de especialidad SM.' },

  // Fichas Clínicas
  { name: 'Ficha Control Hipotiroidismo', view: 'fichaControlHipotiroidismo', keywords: ['ficha', 'control', 'hipotiroidismo', 'tiroides'], description: 'Registro de control para pacientes con hipotiroidismo.' },
  { name: 'Ficha Preingreso ECICEP', view: 'fichaPreingresoEcicep', keywords: ['ficha', 'preingreso', 'ecicep', 'cronicos'], description: 'Registro de preingreso para el programa ECICEP.' },
  { name: 'Ficha Ingreso ECICEP', view: 'fichaIngresoEcicep', keywords: ['ficha', 'ingreso', 'ecicep', 'cronicos'], description: 'Registro de ingreso para el programa ECICEP.' },
  { name: 'Ficha Control ECICEP', view: 'fichaControlEcicepNuevo', keywords: ['ficha', 'control', 'ecicep', 'cronicos'], description: 'Registro de control para pacientes en ECICEP.' },
  { name: 'Ficha Seguimiento ECICEP', view: 'fichaSeguimientoEcicep', keywords: ['ficha', 'seguimiento', 'ecicep', 'cronicos'], description: 'Registro de seguimiento para pacientes en ECICEP.' },
  { name: 'Ficha Control Sala ERA', view: 'fichaControlSalaEra', keywords: ['ficha', 'control', 'sala', 'era', 'respiratorio', 'adulto'], description: 'Registro de control para pacientes en sala ERA.' },
  { name: 'Ficha Control Sala IRA', view: 'fichaControlSalaIra', keywords: ['ficha', 'control', 'sala', 'ira', 'respiratorio', 'infantil', 'pediatria'], description: 'Registro de control para pacientes en sala IRA.' },
  { name: 'Ficha Control Niño Sano', view: 'fichaControlNinoSano', keywords: ['ficha', 'control', 'niño', 'sano', 'pediatria'], description: 'Registro de control de niño sano general.' },
  { name: 'Ficha Control Cardiovascular (Enf.)', view: 'fichaControlCardiovascular', keywords: ['ficha', 'control', 'cardiovascular', 'pscv', 'enfermeria'], description: 'Registro de control cardiovascular de enfermería.' },
  { name: 'Ficha Control Adulto Mayor (Enf.)', view: 'fichaControlAdultoMayor', keywords: ['ficha', 'control', 'adulto', 'mayor', 'anciano', 'enfermeria'], description: 'Registro de control de adulto mayor de enfermería.' },
  { name: 'Ficha Morbilidad', view: 'fichaMorbilidad', keywords: ['ficha', 'morbilidad', 'consulta', 'general'], description: 'Registro de consulta de morbilidad general.' },
  { name: 'Ficha Control PSCV (Médico)', view: 'fichaControlPscv', keywords: ['ficha', 'control', 'pscv', 'cardiovascular', 'medico'], description: 'Registro de control PSCV médico.' },
  { name: 'Ficha Ingreso Salud Mental', view: 'fichaIngresoSm', keywords: ['ficha', 'ingreso', 'salud', 'mental', 'sm'], description: 'Registro de ingreso a salud mental.' },
  { name: 'Ficha Control Epilepsia', view: 'fichaControlEpilepsia', keywords: ['ficha', 'control', 'epilepsia', 'neurologia'], description: 'Registro de control para pacientes con epilepsia.' },
  { name: 'Ficha Control Artrosis', view: 'fichaControlArtrosis', keywords: ['ficha', 'control', 'artrosis', 'cadera', 'rodilla'], description: 'Registro de control para pacientes con artrosis.' },
  { name: 'Ficha Fondo de Ojo', view: 'fichaFondoOjo', keywords: ['ficha', 'fondo', 'ojo', 'oftalmologia'], description: 'Registro de resultado de fondo de ojo.' },
  { name: 'Ficha Grupal Diabetes', view: 'fichaGrupalDiabetes', keywords: ['ficha', 'grupal', 'diabetes', 'dm2'], description: 'Registro para actividad grupal de diabetes.' },
  { name: 'Bitácora de Tareas', view: 'bitacora', keywords: ['bitacora', 'tareas', 'pendientes'], description: 'Bitácora personal de tareas clínicas pendientes.' },

  // Calculadoras y Herramientas
  { name: 'Cálculo de Leches', view: 'calculoLeches', keywords: ['calculadora', 'leche', 'pediatria', 'formula'], description: 'Calculadora para fórmulas lácteas pediátricas.' },
  { name: 'Curvas de Crecimiento', view: 'curvasCrecimiento', keywords: ['calculadora', 'curvas', 'crecimiento', 'pediatria', 'percentiles'], description: 'Visualizar curvas de crecimiento pediátricas.' },
  { name: 'Tabla de Composición de Alimentos', view: 'tablaComposicionAlimentos', keywords: ['tabla', 'composicion', 'alimentos', 'nutricion'], description: 'Consultar composición nutricional de alimentos.' },
  { name: 'Arsenal Farmacológico', view: 'arsenalFarmacologico', keywords: ['arsenal', 'farmacologico', 'farmacia', 'medicamentos'], description: 'Consultar el arsenal de fármacos disponibles.' },
  { name: 'Buscador de Exámenes de Laboratorio', view: 'buscadorExamenesLab', keywords: ['buscador', 'examenes', 'laboratorio', 'portales'], description: 'Enlaces y credenciales para portales de laboratorios.' },
  { name: 'Grupal de Diabetes', view: 'grupalDiabetesManager', keywords: ['grupal', 'diabetes', 'hgt', 'hemoglucotest', 'analisis'], description: 'Gestión y análisis grupal de hemoglucotest.' },
];
