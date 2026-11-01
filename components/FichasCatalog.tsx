import React, { useState, useMemo } from 'react';
import { View } from '../types';
import { 
  Search, 
  Baby, 
  HeartPulse, 
  Brain, 
  Wind, 
  Activity, 
  FileText, 
  Stethoscope, 
  ChevronRight, 
  ArrowLeft, 
  Users, 
  ShieldAlert, 
  ClipboardList, 
  Home as HomeIcon, 
  FolderOpen,
  Calculator
} from 'lucide-react';

interface FichaItem {
  id: View;
  title: string;
  category: string;
  subCategory?: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

interface MacroCategory {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgLight: string;
  borderLight: string;
  icon: React.ReactNode;
}

interface FichasCatalogProps {
  onSelectFicha: (view: View) => void;
  onBack: () => void;
  onRegisterBackHandler?: (handler: () => boolean) => void;
}

const MACRO_CATEGORIES: MacroCategory[] = [
  {
    id: 'ecicep',
    title: 'ECICEP',
    subtitle: 'Preingreso, Ingreso, Control y Seguimiento',
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    icon: <Activity className="w-6 h-6 text-emerald-600" />
  },
  {
    id: 'padds',
    title: 'PADDS',
    subtitle: 'Ingreso y Control domiciliario con estipendio',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    icon: <ShieldAlert className="w-6 h-6 text-blue-700" />
  },
  {
    id: 'visita_domiciliaria',
    title: 'Visita Domiciliaria',
    subtitle: 'Equipo de cabecera y Visita Domiciliaria Integral (VDI)',
    color: 'text-orange-600',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    icon: <HomeIcon className="w-6 h-6 text-orange-600" />
  },
  {
    id: 'cronicos',
    title: 'Control Crónico y Cardiovascular',
    subtitle: 'PSCV, Diabetes, HTA, Hipotiroidismo, Epilepsia, Artrosis',
    color: 'text-rose-600',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    icon: <HeartPulse className="w-6 h-6 text-rose-600" />
  },
  {
    id: 'salud_mental',
    title: 'Salud Mental y PASMI',
    subtitle: 'Ingreso, Control, PASMI y Consultorías psiquiátricas',
    color: 'text-teal-600',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    icon: <Brain className="w-6 h-6 text-teal-600" />
  },
  {
    id: 'ira_era',
    title: 'Salud Respiratoria (IRA / ERA)',
    subtitle: 'Sala ERA Adultos y Sala IRA Infantil',
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-200',
    icon: <Wind className="w-6 h-6 text-cyan-600" />
  },
  {
    id: 'nino_sano',
    title: 'Control Niño Sano',
    subtitle: '19 fichas por edad desde Recién Nacido hasta 9 años',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    icon: <Baby className="w-6 h-6 text-amber-600" />
  },
  {
    id: 'urgencia_morbilidad',
    title: 'Morbilidad y Urgencias',
    subtitle: 'Atención general, Ficha Polichoque y Portal SAPU',
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    icon: <Stethoscope className="w-6 h-6 text-indigo-600" />
  },
  {
    id: 'documentos',
    title: 'Documentos y Solicitudes',
    subtitle: 'Recetas, Certificados, Laboratorio, Rayos y GES',
    color: 'text-sky-600',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    icon: <FileText className="w-6 h-6 text-sky-600" />
  },
  {
    id: 'hospital',
    title: 'Hospital Digital',
    subtitle: 'Interconsultas Dermatología, Diabetes, Endocrinología',
    color: 'text-purple-600',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    icon: <FolderOpen className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'calculadoras',
    title: 'Calculadoras Clínicas',
    subtitle: 'Leches, Curvas OMS, Dosis Pediatría, Alimentos',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    icon: <Calculator className="w-6 h-6 text-emerald-700" />
  }
];

export const FichasCatalog: React.FC<FichasCatalogProps> = ({ onSelectFicha, onBack, onRegisterBackHandler }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMacroId, setSelectedMacroId] = useState<string | null>(null);

  // Register back button handler for Android / App back navigation
  useEffect(() => {
    if (onRegisterBackHandler) {
      onRegisterBackHandler(() => {
        if (searchTerm) {
          setSearchTerm('');
          return true;
        }
        if (selectedMacroId) {
          setSelectedMacroId(null);
          return true;
        }
        return false;
      });
    }
  }, [onRegisterBackHandler, selectedMacroId, searchTerm]);

  const allFichas: (FichaItem & { macroId: string })[] = useMemo(() => [
    // 1. ECICEP (Solo ECICEP sin Demencias)
    { macroId: 'ecicep', id: 'fichaPreingresoEcicep', title: 'Preingreso ECICEP', category: 'ECICEP', description: 'Estratificación biopsicosocial G1, G2 y G3', badge: 'Estratificación', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'ecicep', id: 'fichaIngresoEcicep', title: 'Ingreso Integral ECICEP', category: 'ECICEP', description: 'Plan de Cuidado Compartido (PCC) y acuerdos', badge: 'Modelo APS', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'ecicep', id: 'fichaControlEcicepNuevo', title: 'Control Seguimiento ECICEP', category: 'ECICEP', description: 'Evaluación y cumplimiento de acuerdos del PCC', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'ecicep', id: 'fichaSeguimientoEcicep', title: 'Seguimiento Telefónico / Remoto ECICEP', category: 'ECICEP', description: 'Monitoreo de metas y contacto continuo con el paciente', icon: <Activity className="w-5 h-5 text-emerald-600" /> },

    // 2. PADDS (Solo PADDS)
    { macroId: 'padds', id: 'fichaIngresoPadds', title: 'Ingreso PADDS', category: 'PADDS', description: 'Atención a personas con dependencia severa', badge: 'Estipendio', icon: <ShieldAlert className="w-5 h-5 text-blue-700" /> },
    { macroId: 'padds', id: 'fichaControlPadds', title: 'Control / Seguimiento PADDS', category: 'PADDS', description: 'Evaluación periódica y entrega de estipendio', icon: <ShieldAlert className="w-5 h-5 text-blue-700" /> },

    // 3. Visita Domiciliaria (Solo Visita Domiciliaria)
    { macroId: 'visita_domiciliaria', id: 'fichaVisitaDomiciliaria', title: 'Visita Domiciliaria Integral (VDI)', category: 'Visita Domiciliaria', description: 'Registro de visita domiciliaria del equipo de cabecera', badge: 'VDI', icon: <HomeIcon className="w-5 h-5 text-orange-600" /> },
    { macroId: 'visita_domiciliaria', id: 'fichaControlAdultoMayor', title: 'Control de Salud Integral Adulto Mayor', category: 'Visita Domiciliaria', description: 'EMPAM, Barthel, Pfeiffer, riesgo de caídas', badge: 'EMPAM', icon: <Activity className="w-5 h-5 text-orange-600" /> },

    // 4. Control Crónico y Cardiovascular
    { macroId: 'cronicos', id: 'fichaControlPscv', title: 'Control Crónico / PSCV', category: 'Control Crónico', description: 'Atención médica y seguimiento del programa cardiovascular', badge: 'Médico', icon: <HeartPulse className="w-5 h-5 text-rose-600" /> },
    { macroId: 'cronicos', id: 'fichaControlCardiovascular', title: 'Control Cardiovascular (Enfermería)', category: 'Control Crónico', description: 'HTA, DM2, dislipidemia, riesgo cardiovascular y metas', badge: 'Frecuente', icon: <HeartPulse className="w-5 h-5 text-rose-600" /> },
    { macroId: 'cronicos', id: 'fichaControlHipotiroidismo', title: 'Control Hipotiroidismo', category: 'Control Crónico', description: 'Dosis Levotiroxina, perfil TSH/T4L y clínica', icon: <HeartPulse className="w-5 h-5 text-purple-600" /> },
    { macroId: 'cronicos', id: 'fichaControlEpilepsia', title: 'Control Epilepsia', category: 'Control Crónico', description: 'Frecuencia de crisis y fármacos anticrisis', icon: <Brain className="w-5 h-5 text-indigo-600" /> },
    { macroId: 'cronicos', id: 'fichaControlArtrosis', title: 'Control Artrosis (Cadera/Rodilla)', category: 'Control Crónico', description: 'Escalón analgésico, EVA y funcionalidad', icon: <Activity className="w-5 h-5 text-amber-700" /> },
    { macroId: 'cronicos', id: 'fichaFondoOjo', title: 'Fondo de Ojo Diabético', category: 'Control Crónico', description: 'Cámara no midriática para tamizaje de retinopatía', icon: <Stethoscope className="w-5 h-5 text-sky-600" /> },
    { macroId: 'cronicos', id: 'fichaGrupalDiabetes', title: 'Taller Grupal Diabetes', category: 'Control Crónico', description: 'Sesiones educativas grupales para personas con DM2', badge: 'Grupal', icon: <Users className="w-5 h-5 text-rose-600" /> },
    { macroId: 'cronicos', id: 'derivacionesPscv', title: 'Derivaciones PSCV', category: 'Control Crónico', description: 'Generador de interconsultas y derivaciones', icon: <FileText className="w-5 h-5 text-teal-600" /> },

    // 5. Salud Mental y PASMI
    { macroId: 'salud_mental', id: 'fichaIngresoSm', title: 'Ingreso Salud Mental', category: 'Salud Mental', description: 'Diagnóstico CIE-10 y plan terapéutico integral', badge: 'Ingreso', icon: <Brain className="w-5 h-5 text-teal-600" /> },
    { macroId: 'salud_mental', id: 'fichaControlSm', title: 'Control Salud Mental', category: 'Salud Mental', description: 'Evolución clínica, adherencia y psicoterapia', icon: <Brain className="w-5 h-5 text-teal-600" /> },
    { macroId: 'salud_mental', id: 'fichaConsultaPasmi', title: 'Consulta PASMI', category: 'Salud Mental', description: 'Atención especializada infanto-adolescente', badge: 'PASMI', icon: <Brain className="w-5 h-5 text-teal-600" /> },
    { macroId: 'salud_mental', id: 'fichaConsultoria', title: 'Consultoría de Salud Mental', category: 'Salud Mental', description: 'Discusión de casos clínicos con especialista', icon: <Users className="w-5 h-5 text-teal-600" /> },

    // 6. Salud Respiratoria (IRA / ERA)
    { macroId: 'ira_era', id: 'fichaControlSalaEra', title: 'Control Sala ERA (Adultos)', category: 'Salud Respiratoria', description: 'Asma, EPOC, espirometría y técnica inhalatoria', badge: 'Adultos', icon: <Wind className="w-5 h-5 text-cyan-600" /> },
    { macroId: 'ira_era', id: 'fichaControlSalaIra', title: 'Control Sala IRA (Infantil)', category: 'Salud Respiratoria', description: 'SBOR, asma infantil, score Tal y rescates', badge: 'Infantil', icon: <Wind className="w-5 h-5 text-cyan-600" /> },

    // 7. Control Niño Sano (19 Fichas)
    { macroId: 'nino_sano', id: 'fichaControlNinoSanoRN', title: 'Control RN (Recién Nacido)', category: 'Control Niño Sano', subCategory: 'Lactante Menor', description: 'Evaluación neonatal, reflejos arcaicos y tamizajes', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano1Mes', title: 'Control 1° Mes', category: 'Control Niño Sano', subCategory: 'Lactante Menor', description: 'Incremento ponderal, lactancia materna exclusiva', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano2Meses', title: 'Control 2° Mes', category: 'Control Niño Sano', subCategory: 'Lactante Menor', description: 'Primeras vacunas, sostén cefálico y sonrisa social', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano3Mes', title: 'Control 3° Mes', category: 'Control Niño Sano', subCategory: 'Lactante Menor', description: 'Estimulación, seguimiento pauta DSM', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano4Meses', title: 'Control 4° Mes', category: 'Control Niño Sano', subCategory: 'Lactante Menor', description: 'Cuarto mes, vacunas y pauta breve EEDP', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'consultaNutricional5Meses', title: 'Consulta Nutricional 5 Meses', category: 'Control Niño Sano', subCategory: 'Nutricional', description: 'Preparación de alimentación complementaria', badge: 'Nutrición', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano6Meses', title: 'Control 6 Meses', category: 'Control Niño Sano', subCategory: 'Lactante Medio', description: 'Inicio alimentación sólida y sedestación', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano8Meses', title: 'Control 8 Meses', category: 'Control Niño Sano', subCategory: 'Lactante Medio', description: 'Gateo, erupción dentaria y pauta DSM', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano12Meses', title: 'Control 12 Meses (1 Año)', category: 'Control Niño Sano', subCategory: 'Lactante Mayor', description: 'Bipedestación, lenguaje inicial y vacunas al año', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano18Meses', title: 'Control 18 Meses', category: 'Control Niño Sano', subCategory: 'Lactante Mayor', description: 'EEDP formal, marcha autónoma y lenguaje', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano2Anos', title: 'Control 2 Años', category: 'Control Niño Sano', subCategory: 'Preescolar', description: 'Autonomía, control de esfínteres incipiente', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano3Anos', title: 'Control 3 Años', category: 'Control Niño Sano', subCategory: 'Preescolar', description: 'Aplicación TEPSI, control esfínter diurno', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'consultaNutricional3Anos6Meses', title: 'Consulta Nutricional 3 Años 6 Meses', category: 'Control Niño Sano', subCategory: 'Nutricional', description: 'Antropometría y tamizaje de obesidad preescolar', badge: 'Nutrición', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano4Anos', title: 'Control 4 Años', category: 'Control Niño Sano', subCategory: 'Preescolar', description: 'Evaluación motora fina y gruesa, visión', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano5Anos', title: 'Control 5 Años', category: 'Control Niño Sano', subCategory: 'Preescolar', description: 'Transición a etapa escolar y agudeza visual', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano6Anos', title: 'Control Salud Infantil 6 Años', category: 'Control Niño Sano', subCategory: 'Escolar', description: 'Ingreso escolar, presión arterial y columna', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano7Anos', title: 'Control Salud Infantil 7 Años', category: 'Control Niño Sano', subCategory: 'Escolar', description: 'Rendimiento escolar y salud bucal', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano8Anos', title: 'Control Salud Infantil 8 Años', category: 'Control Niño Sano', subCategory: 'Escolar', description: 'Crecimiento, actividad física y alimentación', icon: <Baby className="w-5 h-5 text-amber-600" /> },
    { macroId: 'nino_sano', id: 'fichaControlNinoSano9Anos', title: 'Control Salud Infantil 9 Años', category: 'Control Niño Sano', subCategory: 'Escolar', description: 'Preadolescencia, hábitos y tamizaje psicosocial', icon: <Baby className="w-5 h-5 text-amber-600" /> },

    // 8. Morbilidad y Urgencias
    { macroId: 'urgencia_morbilidad', id: 'fichaMorbilidad', title: 'Ficha de Morbilidad General', category: 'Morbilidad y Urgencias', description: 'Atención médica ambulatoria estructurada SOAP', badge: 'Uso Diario', icon: <Stethoscope className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'urgencia_morbilidad', id: 'fichaPolichoque', title: 'Ficha Polichoque / Atención Aguda', category: 'Morbilidad y Urgencias', description: 'Estabilización inicial del paciente descompensado', icon: <ShieldAlert className="w-5 h-5 text-red-600" /> },
    { macroId: 'urgencia_morbilidad', id: 'sapu', title: 'Portal Clínico SAPU', category: 'Morbilidad y Urgencias', description: 'Módulo de urgencia ambulatoria de APS', icon: <ShieldAlert className="w-5 h-5 text-rose-600" /> },

    // 9. Documentos y Solicitudes
    { macroId: 'documentos', id: 'recetaMedica', title: 'Emitir Receta Médica', category: 'Documentos', description: 'Arsenal farmacológico APS con posología sugerida', badge: 'Rápido', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'certificadoMedico', title: 'Emitir Certificado Médico', category: 'Documentos', description: 'Certificado de reposo y atenciones clínicas', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'ordenLaboratorio', title: 'Solicitud Exámenes de Laboratorio', category: 'Documentos', description: 'Perfil bioquímico, orina, hemograma y cultivos', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'ordenExamenRadiologico', title: 'Orden Imagenología / Radiología', category: 'Documentos', description: 'Radiografías, ecotomografías y mamografías', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'constanciaAtencion', title: 'Constancia de Atención de Salud', category: 'Documentos', description: 'Comprobante formal para empleador o establecimiento', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'certificadoEscolar', title: 'Certificado Escolar', category: 'Documentos', description: 'Certificado de salud escolar o jardín infantil', icon: <FileText className="w-5 h-5 text-sky-600" /> },
    { macroId: 'documentos', id: 'fichaFirmarGes', title: 'Firmar Notificación GES', category: 'Documentos', description: 'Constancia de notificación obligatoria GES al paciente', icon: <FileText className="w-5 h-5 text-amber-600" /> },

    // 10. Hospital Digital
    { macroId: 'hospital', id: 'hdDermatologia', title: 'Interconsulta Dermatología', category: 'Hospital Digital', description: 'Plantilla de derivación para teledermatología', icon: <FolderOpen className="w-5 h-5 text-purple-600" /> },
    { macroId: 'hospital', id: 'hdDiabetes', title: 'Interconsulta Diabetes', category: 'Hospital Digital', description: 'Plantilla de derivación para teleoftalmología / diabetes', icon: <FolderOpen className="w-5 h-5 text-purple-600" /> },
    { macroId: 'hospital', id: 'hdEndocrinologia', title: 'Interconsulta Endocrinología', category: 'Hospital Digital', description: 'Plantilla de derivación para endocrinología digital', icon: <FolderOpen className="w-5 h-5 text-purple-600" /> },
    { macroId: 'hospital', id: 'hdGeriatria', title: 'Interconsulta Geriatría', category: 'Hospital Digital', description: 'Plantilla de derivación para geriatría integral', icon: <FolderOpen className="w-5 h-5 text-purple-600" /> },
    { macroId: 'hospital', id: 'hdReumatologia', title: 'Interconsulta Reumatología', category: 'Hospital Digital', description: 'Plantilla de derivación para reumatología', icon: <FolderOpen className="w-5 h-5 text-purple-600" /> },

    // 11. Calculadoras Clínicas
    { macroId: 'calculadoras', id: 'calculoLeches', title: 'Cálculo de Leches (PNAC)', category: 'Calculadoras', description: 'Entrega de fórmulas lácteas por peso y edad', icon: <Calculator className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'calculadoras', id: 'curvasCrecimiento', title: 'Curvas de Crecimiento OMS', category: 'Calculadoras', description: 'Tablas antropométricas P/E, T/E, P/T', icon: <Calculator className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'calculadoras', id: 'dosisPediatria', title: 'Dosis en Pediatría', category: 'Calculadoras', description: 'Posología rápida calculada por peso corporal', icon: <Calculator className="w-5 h-5 text-emerald-600" /> },
    { macroId: 'calculadoras', id: 'tablaComposicionAlimentos', title: 'Composición de Alimentos', category: 'Calculadoras', description: 'Calorías y macronutrientes de alimentos comunes', icon: <Calculator className="w-5 h-5 text-emerald-600" /> },
  ], []);

  // Filtered by search if active
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const query = searchTerm.toLowerCase().trim();
    return allFichas.filter(f => 
      f.title.toLowerCase().includes(query) || 
      f.description.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query)
    );
  }, [allFichas, searchTerm]);

  // Active macro-category details
  const currentMacro = useMemo(() => {
    if (!selectedMacroId) return null;
    return MACRO_CATEGORIES.find(m => m.id === selectedMacroId) || null;
  }, [selectedMacroId]);

  // Fichas inside the selected macro-category
  const macroFichas = useMemo(() => {
    if (!selectedMacroId) return [];
    return allFichas.filter(f => f.macroId === selectedMacroId);
  }, [allFichas, selectedMacroId]);

  return (
    <div className="w-full min-h-full flex flex-col bg-[#f4f7fb]">
      {/* Top Bar with Search & Title - Sticky at top */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <button
            onClick={() => {
              if (selectedMacroId) {
                setSelectedMacroId(null);
              } else {
                onBack();
              }
            }}
            className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={selectedMacroId ? "Volver a Categorías" : "Volver al Menú"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ClipboardList className="w-5 h-5 text-sky-600 shrink-0" />
            <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight truncate">
              {selectedMacroId && currentMacro ? currentMacro.title : 'Fichas Clínicas'}
            </h2>
          </div>
          {selectedMacroId && (
            <span className="text-[11px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full shrink-0">
              {macroFichas.length} {macroFichas.length === 1 ? 'ficha' : 'fichas'}
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ficha clínica en todo el sistema..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area - Flows naturally inside scrollable root with bottom padding */}
      <div className="p-3 space-y-2.5 pb-40">
        {/* If user is searching: show search results directly */}
        {searchResults !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Resultados de búsqueda ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron fichas que coincidan con "{searchTerm}".
              </div>
            ) : (
              searchResults.map(ficha => (
                <div
                  key={ficha.id}
                  onClick={() => onSelectFicha(ficha.id)}
                  className="bg-white border border-slate-200/80 hover:border-sky-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors">
                      {ficha.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                        {ficha.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ficha.description}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {ficha.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0" />
                </div>
              ))
            )}
          </div>
        ) : selectedMacroId === null ? (
          /* LEVEL 1: MACRO-CATEGORIES GRID */
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Seleccione una categoría clínica
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {MACRO_CATEGORIES.map(macro => {
                const count = allFichas.filter(f => f.macroId === macro.id).length;
                return (
                  <div
                    key={macro.id}
                    onClick={() => setSelectedMacroId(macro.id)}
                    className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl ${macro.bgLight} border ${macro.borderLight} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        {macro.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-sky-600 transition-colors">
                            {macro.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate font-normal">
                          {macro.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 px-2 py-0.5 rounded-full transition-colors">
                        {count} {count === 1 ? 'ficha' : 'fichas'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LEVEL 2: SUBCATEGORIES / FICHAS OF SELECTED MACRO-CATEGORY */
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <button
                onClick={() => setSelectedMacroId(null)}
                className="hidden md:flex text-xs font-bold text-sky-600 hover:text-sky-700 items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a categorías</span>
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {currentMacro?.title}
              </span>
            </div>

            <div className="space-y-2">
              {macroFichas.map(ficha => (
                <div
                  key={ficha.id}
                  onClick={() => onSelectFicha(ficha.id)}
                  className="bg-white border border-slate-200/80 hover:border-sky-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors">
                      {ficha.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                          {ficha.title}
                        </h4>
                        {ficha.badge && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-md shrink-0">
                            {ficha.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ficha.description}
                      </p>
                      {ficha.subCategory && (
                        <span className="inline-block mt-1 text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {ficha.subCategory}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FichasCatalog;
