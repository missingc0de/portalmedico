import React, { useState, useCallback, useEffect, useRef } from 'react';
import { OrdenLaboratorioFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import DateField from './DateField';
import { generateOrdenLaboratorioPdf } from '../services/pdfGenerator';
import { labCategoriesConfig, LabTestCategory, labTestDetails } from '../data/labTestData'; 
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

// Helper to calculate exact age in Chilean format: "X Años Y Meses Z Días"
const calculateAge = (birthDateString: string): string => {
  if (!birthDateString) return '';
  try {
    const birthDate = new Date(birthDateString + 'T00:00:00');
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      // Days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Año' : 'Años'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'Mes' : 'Meses'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'Día' : 'Días'}`);
    
    return parts.join(' ') || '0 Días';
  } catch (e) {
    return '';
  }
};

// Helper to calculate age in years as a number
const getAgeInYears = (birthDateString: string): number => {
  if (!birthDateString) return 0;
  try {
    const birthDate = new Date(birthDateString + 'T00:00:00');
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return 0;
  }
};

const getCategoryName = (key: string): string => {
  const cat = key.split('_')[0];
  switch (cat) {
    case 'hematologia': return 'Hematología';
    case 'bioquimica': return 'Bioquímica';
    case 'hormonas': return 'Hormonas';
    case 'orina': return 'Orina';
    case 'deposiciones': return 'Deposiciones';
    case 'inmunologia': return 'Inmunología';
    case 'microbiologia': return 'Microbiología';
    case 'parasitologia': return 'Parasitología';
    case 'epilepsia': return 'Epilepsia / Niveles';
    default: return cat.toUpperCase();
  }
};

const getCategoryBadgeStyle = (category: string): string => {
  switch (category) {
    case 'Hematología': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Bioquímica': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Hormonas': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Orina': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Deposiciones': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Inmunología': return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'Microbiología': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Parasitología': return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Epilepsia / Niveles': return 'bg-violet-50 text-violet-700 border-violet-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// Flatten all exams from labTestDetails for searching
const allExamsList = Object.entries(labTestDetails).map(([key, value]) => ({
  key: key as keyof OrdenLaboratorioFormData,
  code: value.code,
  label: value.label,
  group: value.group,
  category: getCategoryName(key),
}));

// Predefined panels configuration
interface ClinicalPanel {
  id: string;
  title: string;
  description: string;
  exams: (keyof OrdenLaboratorioFormData)[];
  hasPsa: boolean;
  colorClass: string;
  badgeClass: string;
}

const CLINICAL_PANELS: ClinicalPanel[] = [
  {
    id: 'cardiovascular',
    title: '❤️ CARDIOVASCULAR',
    description: 'Hemograma, perfil lipídico, glucosa, función renal, electrolitos y orina.',
    exams: [
      'hematologia_hemograma', // Updated from hematologia_hematocrito
      'bioquimica_glicemia',
      'bioquimica_perfil_lipidico',
      'bioquimica_creatinina',
      'bioquimica_uremia',
      'bioquimica_electrolitos_plasmaticos',
      'orina_completa',
      'orina_microalbuminuria_creatinuria',
      'hematologia_hemoglobina_glicosilada'
    ],
    hasPsa: true,
    colorClass: 'hover:border-sky-300 hover:shadow-sky-50 bg-gradient-to-br from-white to-sky-50/20 border-slate-200',
    badgeClass: 'bg-sky-100 text-sky-855'
  },
  {
    id: 'demencia',
    title: '🧠 DEMENCIA',
    description: 'Estudio de base metabólica, vitamínica, hepática y urocultivo completo.',
    exams: [
      'hematologia_hemograma', // Updated from hematologia_hematocrito
      'bioquimica_glicemia',
      'bioquimica_perfil_lipidico',
      'bioquimica_creatinina',
      'bioquimica_uremia',
      'bioquimica_electrolitos_plasmaticos',
      'orina_completa',
      'orina_microalbuminuria_creatinuria',
      'hematologia_hemoglobina_glicosilada',
      'epilepsia_vitamina_b12',
      'epilepsia_perfil_hepatico',
      'microbiologia_urocultivo'
    ],
    hasPsa: true,
    colorClass: 'hover:border-indigo-300 hover:shadow-indigo-50 bg-gradient-to-br from-white to-indigo-50/20 border-slate-200',
    badgeClass: 'bg-indigo-100 text-indigo-855'
  },
  {
    id: 'hipotiroidismo',
    title: '🦋 HIPOTIROIDISMO',
    description: 'Perfil de control hormonal tiroideo, hemograma y glicemia básica.',
    exams: [
      'hormonas_tsh',
      'hematologia_hemograma',
      'bioquimica_perfil_lipidico',
      'bioquimica_glicemia'
    ],
    hasPsa: true,
    colorClass: 'hover:border-teal-300 hover:shadow-teal-50 bg-gradient-to-br from-white to-teal-50/20 border-slate-200',
    badgeClass: 'bg-teal-100 text-teal-855'
  },
  {
    id: 'epilepsia',
    title: '⚡ EPILEPSIA',
    description: 'Monitoreo terapéutico de fármacos anticonvulsivantes y perfil hepático.',
    exams: [
      'epilepsia_perfil_hepatico',
      'epilepsia_acido_valproico',
      'epilepsia_carbamazepina',
      'epilepsia_fenitoina',
      'epilepsia_fenobarbital',
      'epilepsia_lamotrigina'
    ],
    hasPsa: true,
    colorClass: 'hover:border-violet-300 hover:shadow-violet-50 bg-gradient-to-br from-white to-violet-50/20 border-slate-200',
    badgeClass: 'bg-violet-100 text-violet-855'
  }
];

const initialFormData: OrdenLaboratorioFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  numeroFicha: '',
  procedencia: 'CESFAM San Juan',
  edad: '',
  fechaNacimiento: '',
  fechaExamen: '', // Handled automatically at emission

  // Hidden admin properties initialized with defaults requested
  nroSolicitud: '',
  horaExamen: '',
  sectorPaciente: 'NO INFORMADO',
  nhcPaciente: '',
  prevision: 'DESCONOCIDO',
  direccion: '',
  telefono: '',
  diagnostico: 'CONTROL GENERAL DE SALUD DE RUTINA DE SUBPOBLACIONES DEFINIDAS',
  programaSalud: '--- NO DISPONIBLE ---',
  laboratorioNombre: '--- NO DISPONIBLE ---',
  laboratorioTipo: 'EXTERNO',
  laboratorioDireccion: '--- NO DISPONIBLE ---',
  laboratorioTelefono: '--- NO DISPONIBLE ---',
  prioridadGlobal: 'Normal',
  observacionesGlobales: '',

  // Diagnostic checkboxes to condition exams
  dm2: false,
  hta: false,
  erc: false,

  hematologia_hematocrito: false,
  hematologia_hemoglobina: false,
  hematologia_hemograma: false,
  hematologia_hemoglobina_glicosilada: false,
  hematologia_vhs: false,
  hematologia_protrombina: false,
  hematologia_ttpk: false,
  hematologia_recuento_plaquetas: false,
  hematologia_recuento_leucocitos: false,

  bioquimica_acido_urico: false,
  bioquimica_calcio: false,
  bioquimica_bilirrubina_total_conjugada: false,
  bioquimica_colesterol_total: false,
  bioquimica_colesterol_hdl: false,
  bioquimica_ldh: false,
  bioquimica_creatinina: false,
  bioquimica_clearance_creatinina: false,
  bioquimica_fosfatasa_alcalina: false,
  bioquimica_glicemia: false,
  bioquimica_ptgo: false,
  bioquimica_ggt: false,
  bioquimica_proteinas_totales: false,
  bioquimica_albumina: false,
  bioquimica_tgo_ast: false,
  bioquimica_tgp_alt: false,
  bioquimica_trigliceridos: false,
  bioquimica_uremia: false,
  bioquimica_ck_total: false,
  bioquimica_electrolitos_plasmaticos: false,
  bioquimica_perfil_lipidico: false,
  bioquimica_fosforo: false,

  hormonas_tsh: false,
  hormonas_t4l: false,
  hormonas_antigeno_prostatico_total: false,

  orina_deteccion_embarazo: false,
  orina_fisico_quimico: false,
  orina_completa: false,
  orina_proteinuria_24hr: false,
  orina_microalbuminuria_creatinuria: false,

  deposiciones_leucositos_fecales: false,
  deposiciones_hemorragias_ocultas: false,
  deposiciones_azucares_reductores: false,
  deposiciones_test_helicobacter: false,

  inmunologia_factor_reumatoideo: false,

  microbiologia_rpr: false,
  microbiologia_vdrl: false,
  microbiologia_secrecion_uretral: false,
  microbiologia_urocultivo: false,
  microbiologia_sedimento_orina: false,
  microbiologia_cultivo_gonococo: false,
  microbiologia_antibiograma_gonococo: false,
  microbiologia_strepto_b: false,
  microbiologia_cultivo_herida: false,
  microbiologia_examen_directo_fresco: false,
  microbiologia_gram_flujo_vaginal: false,
  microbiologia_flujo_vaginal: false,

  parasitologia_coproparasitologico_seriado: false,
  parasitologia_examen_graham: false,
  parasitologia_diagnostico_gusanos: false,

  epilepsia_perfil_hepatico: false,
  epilepsia_acido_valproico: false,
  epilepsia_carbamazepina: false,
  epilepsia_vitamina_b12: false,
  epilepsia_fenitoina: false,
  epilepsia_fenobarbital: false,
  epilepsia_lamotrigina: false,
};

interface OrdenLaboratorioFormProps {
  onBackToMenu: () => void;
  loggedInUser: User | null; 
}

const OrdenLaboratorioForm: React.FC<OrdenLaboratorioFormProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<OrdenLaboratorioFormData>('local_OrdenLaboratorioForm', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Search and selection states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Automatically calculate age whenever fechaNacimiento changes
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const calculatedAge = calculateAge(formData.fechaNacimiento);
      if (calculatedAge && calculatedAge !== formData.edad) {
        setFormData(prev => ({ ...prev, edad: calculatedAge }));
      }
    }
  }, [formData.fechaNacimiento, formData.edad, setFormData]);

  // Automatically calculate NHC from RUTPaciente
  useEffect(() => {
    if (formData.rutPaciente) {
      const cleanRut = formData.rutPaciente.replace(/[^0-9Kk]/g, '');
      if (cleanRut && cleanRut !== formData.nhcPaciente) {
        setFormData(prev => ({ ...prev, nhcPaciente: cleanRut }));
      }
    }
  }, [formData.rutPaciente, formData.nhcPaciente, setFormData]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time diagnostics enforcement (does not apply to DEMENCIA panel)
  useEffect(() => {
    const isDemenciaActive = formData.epilepsia_vitamina_b12 === true && 
                             formData.microbiologia_urocultivo === true && 
                             formData.epilepsia_perfil_hepatico === true;

    if (!isDemenciaActive) {
      setFormData(prev => {
        let updated = false;
        const next = { ...prev };
        
        // Remove HBA1C if not diabetic (DM2)
        if (!prev.dm2 && prev.hematologia_hemoglobina_glicosilada) {
          next.hematologia_hemoglobina_glicosilada = false;
          updated = true;
        }
        // Remove RAC if neither diabetic (DM2) nor hypertensive (HTA)
        if (!prev.dm2 && !prev.hta && prev.orina_microalbuminuria_creatinuria) {
          next.orina_microalbuminuria_creatinuria = false;
          updated = true;
        }
        // Remove Electrolitos if not chronic kidney disease (ERC)
        if (!prev.erc && prev.bioquimica_electrolitos_plasmaticos) {
          next.bioquimica_electrolitos_plasmaticos = false;
          updated = true;
        }

        return updated ? next : prev;
      });
    }
  }, [formData.dm2, formData.hta, formData.erc, formData.epilepsia_vitamina_b12, formData.microbiologia_urocultivo, formData.epilepsia_perfil_hepatico, setFormData]);

  // Handle Form validation
  useEffect(() => {
    const { nombrePaciente, rutPaciente, fechaNacimiento } = formData;
    const atLeastOneTestSelected = Object.keys(formData).some(key => 
      (key.startsWith('hematologia_') || 
      key.startsWith('bioquimica_') ||
      key.startsWith('hormonas_') ||
      key.startsWith('orina_') ||
      key.startsWith('deposiciones_') ||
      key.startsWith('inmunologia_') ||
      key.startsWith('microbiologia_') ||
      key.startsWith('parasitologia_') ||
      key.startsWith('epilepsia_')) && formData[key] === true
    );
    
    setIsFormValid(
      nombrePaciente.trim() !== '' &&
      rutPaciente.trim() !== '' &&
      fechaNacimiento.trim() !== '' &&
      atLeastOneTestSelected
    );
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleRutChange = useCallback((name: keyof OrdenLaboratorioFormData, value: string) => {
    const cleanRut = value.replace(/[^0-9Kk]/g, '');
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      nhcPaciente: cleanRut
    }));
  }, [setFormData]);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Por favor, complete todos los datos del paciente y seleccione al menos un examen.");
      return;
    }
    if (!loggedInUser) {
      alert("Error: No se ha podido identificar al médico. Por favor, inicie sesión nuevamente.");
      return;
    }
    setStatus(FormStatus.Generating);
    try {
      await generateOrdenLaboratorioPdf(formData, loggedInUser);
      setStatus(FormStatus.Idle);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus(FormStatus.Error);
      alert("Error al generar la orden de laboratorio PDF. Verifique la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
    setStatus(FormStatus.Idle);
    setSearchQuery('');
  };

  // Exam Selection Management
  const addExam = (key: keyof OrdenLaboratorioFormData) => {
    // Guiding alerts for conditional exams based on user active diagnoses
    if (key === 'hematologia_hemoglobina_glicosilada' && !formData.dm2) {
      alert("Para solicitar Hemoglobina Glicosilada (HBA1C), debe activar el diagnóstico DM2 (Diabetes Mellitus Tipo 2) en la sección de Datos del Paciente.");
      return;
    }
    if (key === 'orina_microalbuminuria_creatinuria' && !formData.dm2 && !formData.hta) {
      alert("Para solicitar RAC (Microalbuminuria/Creatinuria), debe activar el diagnóstico DM2 (Diabetes Mellitus) o HTA (Hipertensión Arterial) en la sección de Datos del Paciente.");
      return;
    }
    if (key === 'bioquimica_electrolitos_plasmaticos' && !formData.erc) {
      alert("Para solicitar Electrolitos Plasmáticos, debe activar el diagnóstico ERC (Enfermedad Renal Crónica) en la sección de Datos del Paciente.");
      return;
    }

    setFormData(prev => ({ ...prev, [key]: true }));
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const removeExam = (key: keyof OrdenLaboratorioFormData) => {
    setFormData(prev => ({ ...prev, [key]: false }));
  };

  const clearExams = () => {
    setFormData(prev => {
      const reset = { ...prev };
      Object.keys(reset).forEach(k => {
        if (
          k.startsWith('hematologia_') || 
          k.startsWith('bioquimica_') ||
          k.startsWith('hormonas_') ||
          k.startsWith('orina_') ||
          k.startsWith('deposiciones_') ||
          k.startsWith('inmunologia_') ||
          k.startsWith('microbiologia_') ||
          k.startsWith('parasitologia_') ||
          k.startsWith('epilepsia_')
        ) {
          reset[k] = false;
        }
      });
      return reset;
    });
  };

  // Apply Clinical Panels with PSA logic & diagnoses conditions
  const applyPanel = (panel: ClinicalPanel) => {
    const age = getAgeInYears(formData.fechaNacimiento);
    const isMale = formData.sexo === 'Hombre';
    const meetsPsa = isMale && age >= 40 && age <= 69;
    const isDemencia = panel.id === 'demencia';

    setFormData(prev => {
      const updated = { ...prev };
      
      // Select all standard exams from panel applying logic conditions
      panel.exams.forEach(examKey => {
        if (isDemencia) {
          // Demencia overrides all diagnostics conditions, loads everything
          updated[examKey] = true;
        } else {
          if (examKey === 'hematologia_hemoglobina_glicosilada') {
            if (prev.dm2) updated[examKey] = true;
          } else if (examKey === 'orina_microalbuminuria_creatinuria') {
            if (prev.dm2 || prev.hta) updated[examKey] = true;
          } else if (examKey === 'bioquimica_electrolitos_plasmaticos') {
            if (prev.erc) updated[examKey] = true;
          } else {
            updated[examKey] = true;
          }
        }
      });

      // Apply PSA exam if patient meets criteria
      if (panel.hasPsa) {
        if (meetsPsa) {
          updated['hormonas_antigeno_prostatico_total'] = true;
        } else {
          updated['hormonas_antigeno_prostatico_total'] = false;
        }
      }

      return updated;
    });

    // Alert feedback detailing the inclusion / exclusion of PSA & conditional exams
    const addedExams: string[] = [];
    const omittedExams: string[] = [];

    if (!isDemencia) {
      if (panel.exams.includes('hematologia_hemoglobina_glicosilada')) {
        if (formData.dm2) addedExams.push('HBA1C (por diagnóstico DM2)');
        else omittedExams.push('HBA1C (requiere DM2 activo)');
      }
      if (panel.exams.includes('orina_microalbuminuria_creatinuria')) {
        if (formData.dm2 || formData.hta) addedExams.push('RAC (por diagnóstico DM2 o HTA)');
        else omittedExams.push('RAC (requiere DM2 o HTA activo)');
      }
      if (panel.exams.includes('bioquimica_electrolitos_plasmaticos')) {
        if (formData.erc) addedExams.push('Electrolitos Plasmáticos (por diagnóstico ERC)');
        else omittedExams.push('Electrolitos Plasmáticos (requiere ERC activo)');
      }
    } else {
      addedExams.push('HBA1C, RAC, Electrolitos Plasmáticos (Cargados por defecto en panel DEMENCIA)');
    }

    let msg = `Panel "${panel.title}" seleccionado.\n\n`;

    if (addedExams.length > 0) {
      msg += `✅ Exámenes Condicionales Solicitados:\n${addedExams.map(x => `• ${x}`).join('\n')}\n\n`;
    }
    if (omittedExams.length > 0) {
      msg += `⚠️ Exámenes Condicionales Omitidos:\n${omittedExams.map(x => `• ${x}`).join('\n')}\n(Active el diagnóstico correspondiente en Datos del Paciente si desea inyectarlos)\n\n`;
    }

    if (panel.hasPsa) {
      if (!formData.sexo || !formData.fechaNacimiento) {
        msg += `⚠️ NOTA PSA: No se pudo verificar el criterio para Antígeno Prostático (PSA) debido a que el Sexo o la Fecha de Nacimiento no han sido ingresados.`;
      } else if (!isMale) {
        msg += `ℹ️ NOTA PSA: El examen de Antígeno Prostático (PSA) NO se agregó ya que el paciente no es varón.`;
      } else if (age < 40 || age > 69) {
        msg += `ℹ️ NOTA PSA: El examen de Antígeno Prostático (PSA) NO se incluyó ya que el paciente tiene ${age} años (criterio obligatorio: varón entre 40 y 69 años).`;
      } else {
        msg += `✅ NOTA PSA: Se incluyó el Antígeno Prostático (PSA) automáticamente ya que el paciente cumple con el criterio (Varón de ${age} años).`;
      }
    }
    
    alert(msg);
  };

  // Get currently selected exams list
  const selectedExams = allExamsList.filter(exam => formData[exam.key] === true);

  // Suggestions search logic (labels, codes or categories)
  const filteredSuggestions = searchQuery.trim() === ''
    ? []
    : allExamsList.filter(exam => {
        const query = searchQuery.toLowerCase();
        const matchLabel = exam.label.toLowerCase().includes(query);
        const matchCode = exam.code.toLowerCase().includes(query);
        const matchCat = exam.category.toLowerCase().includes(query);
        return (matchLabel || matchCode || matchCat) && !formData[exam.key];
      }).slice(0, 8);

  return (
    <div className="w-[98%] max-w-[98%] bg-white shadow-2xl rounded-2xl p-4 sm:p-5 border border-slate-100 mx-auto pt-6">
      <style>{`
        .compact-section label {
          font-size: 15px !important;
          font-weight: 700 !important;
          margin-bottom: 6px !important;
          color: #1e293b !important;
        }
        .compact-section input:not([type="checkbox"]), .compact-section select {
          padding: 8px 14px !important;
          font-size: 15px !important;
          height: 44px !important;
          border-radius: 8px !important;
        }
        .compact-section input[type="checkbox"] {
          width: 18px !important;
          height: 18px !important;
          cursor: pointer !important;
        }
      `}</style>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* LEFT COLUMN: Ficha y Datos del Paciente (Wider: 48%) */}
          <div className="w-full lg:w-[44%] shrink-0 bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-sm compact-section">
            <h3 className="text-base sm:text-lg font-black mb-4 text-sky-800 border-b border-slate-200 pb-2.5 flex items-center">
              <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ficha y Datos del Paciente
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Nombre Completo" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} placeholder="Ingrese nombre completo del paciente" required />
              </div>
              
              <div className="col-span-1">
                <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={(value) => handleRutChange('rutPaciente', value)} required />
              </div>

              <div className="col-span-1">
                <label htmlFor="sexo" className="block text-slate-700">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-355 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm h-[38px]"
                >
                  <option value="">-- Sexo --</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="col-span-1">
                <DateField label="Fecha Nacimiento" id="fechaNacimiento" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
              </div>

              <div className="col-span-1">
                <FormField label="Teléfono(s)" id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} placeholder="Ej: 986076741" />
              </div>

              <div className="col-span-2">
                <FormField label="Dirección Completa" id="direccion" name="direccion" value={formData.direccion || ''} onChange={handleChange} placeholder="Ej: Coquimbo, Sitio 35" />
              </div>

              {/* Diagnósticos Condicionantes (Small row inline checkboxes) */}
              <div className="col-span-2 mt-4 pt-4 border-t border-slate-200">
                <label className="block text-sky-850 mb-2 font-bold" style={{ fontSize: '15px' }}>Diagnósticos Activos</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center justify-center p-2.5 bg-white rounded-md border border-slate-200 hover:border-sky-300 transition-colors shadow-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="dm2"
                      name="dm2"
                      checked={formData.dm2 === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, dm2: e.target.checked }))}
                      className="h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer animate-none"
                    />
                    <span className="ml-2 text-sm font-bold text-slate-700">DM2</span>
                  </label>
                  <label className="flex items-center justify-center p-2.5 bg-white rounded-md border border-slate-200 hover:border-sky-300 transition-colors shadow-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="hta"
                      name="hta"
                      checked={formData.hta === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, hta: e.target.checked }))}
                      className="h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer animate-none"
                    />
                    <span className="ml-2 text-sm font-bold text-slate-700">HTA</span>
                  </label>
                  <label className="flex items-center justify-center p-2.5 bg-white rounded-md border border-slate-200 hover:border-sky-300 transition-colors shadow-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="erc"
                      name="erc"
                      checked={formData.erc === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, erc: e.target.checked }))}
                      className="h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer animate-none"
                    />
                    <span className="ml-2 text-sm font-bold text-slate-700">ERC</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Paneles y Buscador (Narrower: 52%) */}
          <div className="w-full lg:w-[56%] flex flex-col gap-4">
            {/* Upper Right: Paneles por Programa */}
            <section className="p-3.5 bg-slate-50/30 rounded-xl border border-slate-200/50 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {CLINICAL_PANELS.map(panel => {
                  const activeExamsCount = panel.exams.filter(key => formData[key] === true).length;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => applyPanel(panel)}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-sky-400 hover:shadow-sm transition-all duration-150 group w-full text-left"
                    >
                      <span className="text-xs font-bold text-slate-700 group-hover:text-sky-700 transition-colors uppercase tracking-wide truncate pr-2">
                        {panel.title}
                      </span>
                      {activeExamsCount > 0 ? (
                        <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full shrink-0 shadow-sm leading-none">
                          {activeExamsCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold group-hover:text-sky-500 shrink-0 uppercase tracking-wider">
                          Aplicar
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Lower Right: Buscador y Selección de Exámenes */}
            <section className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex-grow flex flex-col min-h-0">
              <h3 className="text-sm sm:text-base font-bold text-sky-800 flex items-center mb-3.5">
                <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscador y Selección de Exámenes
              </h3>

              <div className="relative w-full" ref={dropdownRef}>
                <input
                  id="search-exam"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Escriba el nombre o código del examen (ej. Hemograma, TSH...)"
                  className="w-full pl-10 pr-8 py-2 border border-slate-350 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm placeholder:text-slate-400 h-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Autocomplete Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {filteredSuggestions.map(exam => (
                      <button
                        key={exam.key}
                        type="button"
                        onClick={() => addExam(exam.key)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-sm"
                      >
                        <div className="truncate pr-3">
                          <span className="font-semibold text-slate-700">{exam.label}</span>
                          <span className="text-[10px] font-bold text-slate-400 ml-2">CÓD: {exam.code}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getCategoryBadgeStyle(exam.category)}`}>
                          {exam.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Exams List (Max-height to prevent scrolling of page) */}
              <div className="border-t border-slate-100 mt-4 pt-3.5 flex-grow flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center">
                    Exámenes Seleccionados
                    <span className="ml-2 px-2.5 py-0.5 bg-sky-100 text-sky-850 rounded-full text-xs font-black">
                      {selectedExams.length}
                    </span>
                  </h4>
                  {selectedExams.length > 0 && (
                    <button
                      type="button"
                      onClick={clearExams}
                      className="text-xs font-bold text-red-500 hover:text-red-750 flex items-center transition-colors"
                    >
                      Quitar Todos
                    </button>
                  )}
                </div>

                {selectedExams.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex-grow flex flex-col items-center justify-center min-h-[120px]">
                    <p className="text-sm font-semibold text-slate-400">Ningún examen seleccionado</p>
                    <p className="text-xs text-slate-400 mt-1">Use los botones de paneles o el buscador para agregar exámenes.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1 min-h-[120px] flex-grow">
                    {selectedExams.map(exam => (
                      <div
                        key={exam.key}
                        className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 hover:border-slate-350 transition-all text-sm h-[64px] min-h-[64px]"
                      >
                        <div className="truncate pr-3">
                          <h5 className="font-bold text-slate-700 truncate" title={exam.label}>
                            {exam.label}
                          </h5>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-bold">
                            <span className={`px-1.5 py-0.2 rounded border ${getCategoryBadgeStyle(exam.category)} font-bold text-[9px]`}>
                              {exam.category}
                            </span>
                            <span>CÓD: {exam.code}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExam(exam.key)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                          aria-label={`Eliminar examen ${exam.label}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* CONTROLES */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg shadow-sm flex items-center justify-center text-sm transition-all duration-150 active:scale-98"
            aria-label="Volver al menú principal"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Menú
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleNewDocument}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg shadow-sm text-sm transition-all duration-150 active:scale-98"
              aria-label="Limpiar formulario y empezar nueva orden"
            >
              Limpiar Formulario
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === FormStatus.Generating || !isFormValid}
              className={`w-full sm:w-auto px-7 py-2.5 font-bold rounded-lg shadow-md text-sm flex items-center justify-center transition-all duration-150 active:scale-98
                ${isFormValid ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                ${status === FormStatus.Generating ? 'opacity-70 cursor-wait' : ''}`}
              aria-label="Emitir orden de laboratorio en formato PDF"
            >
              {status === FormStatus.Generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Emitir Solicitud PDF
                </>
              )}
            </button>
          </div>
        </div>
        {status === FormStatus.Error && (
          <p role="alert" className="text-red-500 text-center font-semibold mt-2.5 text-sm">
            Hubo un error al generar el PDF. Por favor, intente de nuevo.
          </p>
        )}
      </form>
    </div>
  );
};

export default OrdenLaboratorioForm;
