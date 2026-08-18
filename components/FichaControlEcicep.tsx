
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FichaControlEcicepFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import PHQ9Modal from './PHQ9Modal';
import MedicamentoArsenalInput from './MedicamentoArsenalInput';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialExamenFisicoText = `- Buenas condiciones generales.
- Hidratado, bien perfundido.
- Faringe sin lesiones.
- Cuellos sin adenopatías palpables, yugulares planas.
- Cardiovascular: RR2T, SS.
- Pulmonar: MP(+) SRA.
- Abdomen: RHA (+), blando, depresible, indoloro, sin signos de irritación peritoneal.
- Extremidades: EEII simétricas, sin edema, sin signos de TVP. Sensibilidad (+), bien perfundido a distal. Sin lesiones.
- Neurológico: Conservado, GCS 15/15.`;

const initialPlanText = `- Se solicitan exámenes.
- Se renueva su receta crónica.
- Traer exámenes extrasistema y documentos importantes.
- Traer medicamentos (para verificar).`;

const initialFormData: FichaControlEcicepFormData = {
    fechaControlActual: new Date().toISOString().split('T')[0],
    fechaControlAnterior: '',
    ingresoControlAnterior: '',
    estadoSaludDesdeUltimoControl: '',
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
    // objetivosAnteriores was missing, added it here to resolve TypeScript error.
    objetivosAnteriores: [],
    cumplioMetasPropuestas: '',
    duplaProfesional: '',
    duplaProfesionalOtroNombre: '',
    estratificacion: '',
    // FIX: Added missing inclusion flags to satisfy FichaControlEcicepFormData type requirements.
    incluirControlCardiovascular: false,
    incluirControlHipotiroidismo: false,
    incluirControlArtrosis: false,
    incluirControlEpilepsia: false,
    incluirControlSalaEra: false,
    incluirControlSalaIra: false,
    incluirControlDemencias: false,
    // Added missing planEcicep fields to match FichaControlEcicepFormData type
    planEcicepLabsRutina: false,
    planEcicepEKG: false,
    planEcicepHBA1C: false,
    planEcicepHBA1CTiempo: '',
    planEcicepFondoOjo: false,
    planEcicepCtrlPiesEnf: false,
    planEcicepInterconsulta: false,
    planEcicepInterconsultaEspecialidad: '',
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
    estadoAnimoDesc: '',
    habitoSuenoDesc: '',
    ideacionSuicidaDesc: '',
    escolaridad: '',
    ocupacion: '',
    antecedentesFamiliaresRelevantes: '',
    viveCon: '',
    redesApoyo: '',
    percepcionSituacionEconomica: '',
    espiritualidad: '',
    factoresProtectores: '',
    estadoCivilHijos: '',
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
    // FIX: Added missing 'fc' property to match FichaControlEcicepFormData type.
    fc: '',
    cc: '',
    examenFisicoGeneralSegmentario: initialExamenFisicoText,
    // FIX: Added missing pcc properties to match the type definition.
    pccProblemasPersona: '',
    pccProblemasFamiliar: '',
    pccProblemasEquipo: '',
    pccPriorizacionEntorno: '',
    pccPriorizacionBiologico: '',
    pccPriorizacionSaludFisica: '',
    pccPriorizacionBienestarEmocional: '',
    planConsensuado: '',
    acuerdoPlanEquipo: 'Sí',
    acuerdoContactoSeguimiento: 'Sí',
    indicacionesAdicionales: initialPlanText,
    // FIX: Add missing properties to satisfy the FichaControlEcicepFormData type.
    planProximoControlDupla: '',
    planProximoControlTiempo: '',
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

interface CheckboxClarificationConfig {
  label: string;
  presenteKey: keyof FichaControlEcicepFormData;
  detalleKey: keyof FichaControlEcicepFormData;
  placeholder?: string;
}


interface FichaControlEcicepProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlEcicep: React.FC<FichaControlEcicepProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaControlEcicepFormData>('local_FichaControlEcicep', initialFormData);
  const [generatedText, setGeneratedText] = useState('');
  const [isPhq9ModalOpen, setIsPhq9ModalOpen] = useState(false);

  const calculateIMC = (pesoStr: string, tallaStr: string): string => {
    const peso = parseFloat(pesoStr);
    const tallaCm = parseFloat(tallaStr);
    if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
      const tallaM = tallaCm / 100;
      return (peso / (tallaM * tallaM)).toFixed(2);
    }
    return '';
  };
  
  useEffect(() => {
    const newImc = calculateIMC(formData.peso, formData.talla);
    if (newImc !== formData.imc) {
        setFormData(prev => ({ ...prev, imc: newImc }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.peso, formData.talla, formData.imc]);

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '(No ingresado)';
    const [year, month, day] = dateString.split('-');
    return (year && month && day) ? `${day}/${month}/${year}` : '(Fecha inválida)';
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

  const generateSummary = useCallback(() => {
    let summary = `FICHA CONTROL ECICEP\n`;
    summary += `---------------------------------------\n`;
    summary += `FECHA CONTROL ACTUAL: ${formatDateForDisplay(formData.fechaControlActual)}\n`;
    summary += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || '(No especificado)'}\n`;
    summary += `---------------------------------------\n\n`;
    
    const addField = (label: string, value: string | undefined, defaultValue = '(No ingresado)') => {
      summary += `${label}: ${value || defaultValue}\n`;
    };

    const addRadioField = (label: string, value: string | undefined, defaultValue = '(No seleccionado)') => {
      summary += `${label}: ${value || defaultValue}\n`;
    };

    // FIX: Added helper to correctly format checkbox-with-detail fields in the summary.
    const addCheckboxFieldToSummary = (label: string, presenteKey: keyof FichaControlEcicepFormData, detalleKey: keyof FichaControlEcicepFormData) => {
        const isPresente = formData[presenteKey];
        const detalle = formData[detalleKey] as string;
        let line = `${label}: ${isPresente ? 'Sí' : 'Niega'}`;
        if (isPresente && detalle) {
            line += ` - ${detalle}`;
        }
        return line + '\n';
    };

    summary += `IDENTIFICACIÓN DEL CONTROL (ECICEP):\n`;
    addField('Último control ECICEP', formatDateForDisplay(formData.fechaControlAnterior));
    summary += `\n`;

    summary += `EVALUACIÓN DESDE ÚLTIMO CONTROL (ECICEP):\n`;
    addField('Estado de salud desde último control', formData.estadoSaludDesdeUltimoControl);
    addRadioField('Cambios en la dinámica familiar', formData.cambiosDinamicaFamiliar);
    addRadioField('Controles en extrasistema (Control)', formData.controlesExtrasistema);
    addRadioField('RAM (Reacciones Adversas a Medicamentos)', formData.ram);
    addRadioField('¿Requiere educación sobre dosis/horarios/fármacos?', formData.requiereEducacionFarmacos);
    summary += `\n`;

    summary += `PLAN Y METAS ANTERIOORES (ECICEP):\n`;
    addField('Plan consensuado anterior', formData.planConsensuadoAnterior);
    addRadioField('¿Cumplió metas propuestas?', formData.cumplioMetasPropuestas);
    summary += `\n---------------------------------------\n\n`;

    summary += `IDENTIFICACIÓN Y MOTIVO (Control Actual ECICEP):\n`;
    let duplaText = `Médico + ${formData.duplaProfesional || '(No seleccionado)'}`;
    if (formData.duplaProfesional && formData.duplaProfesionalOtroNombre) {
        duplaText += ` (${formData.duplaProfesionalOtroNombre})`;
    }
    addField('Dupla Profesional (Control Actual)', duplaText, 'Médico + (No seleccionado)');
    addRadioField('Estratificación (Control Actual)', formData.estratificacion);
    addField('Motivo de Consulta (Control Actual)', 'Control ECICEP');
    summary += `\n`;

    summary += `ANTECEDENTES GENERALES (revisión en control):\n`;
    addRadioField('Sexo', formData.sexo);
    addField('Anamnesis General (revisión en control)', formData.anamnesisGeneral);
    addField('Antecedentes Personales (revisión en control)', formData.antecedentesPersonales);
    addField('Morbilidad (revisión en control)', formData.morbilidad);
    addField('Fármacos (revisión en control)', formData.farmacos);
    addRadioField('Adherencia a tratamiento (revisión en control)', formData.adherenciaTratamiento);
    // FIX: Replaced incorrect property access with helper function for new boolean/detail pairs.
    summary += addCheckboxFieldToSummary('Alergias (revisión en control)', 'alergiasPresentes', 'alergiasDetalle');
    summary += addCheckboxFieldToSummary('Cirugías (revisión en control)', 'cirugiasPresentes', 'cirugiasDetalle');
    summary += addCheckboxFieldToSummary('Hospitalizaciones (revisión en control)', 'hospitalizacionesPresentes', 'hospitalizacionesDetalle');
    summary += addCheckboxFieldToSummary('Control en extrasistema (revisión en control)', 'controlExtrasistemaPresente', 'controlExtrasistemaDetalle');
    summary += `\n`;
    
    summary += `ATENCIONES VIGENTES (revisión en control):\n`;
    addField('EMPAM', formData.empam);
    addField('Fondo de ojo', formData.fondoOjo);
    addField('Podólogo', formData.podologo);
    addField('Evaluación de pie', formData.evaluacionPie);
    addField('Vacunas', formData.vacunas);
    summary += `\n`;

    summary += `HÁBITOS (revisión en control):\n`;
    // FIX: Replaced incorrect property access with helper function for new boolean/detail pairs.
    summary += addCheckboxFieldToSummary('Alcohol', 'alcoholPresente', 'alcoholDetalle');
    summary += addCheckboxFieldToSummary('Tabaco', 'tabacoPresente', 'tabacoDetalle');
    summary += addCheckboxFieldToSummary('Drogas', 'drogasPresentes', 'drogasDetalle');
    summary += addCheckboxFieldToSummary('Actividad física', 'actividadFisicaPresente', 'actividadFisicaDetalle');
    addField('Hábito miccional', formData.habitoMiccional);
    addField('Hábito defecatorio', formData.habitoDefecatorio);
    addField('Activity sexual (medidas de protección)', formData.actividadSexual);
    summary += `\n`;

    summary += `ALIMENTACIÓN (revisión en control):\n`;
    addField('Encuesta alimentaria', formData.encuestaAlimentaria);
    summary += `\n`;

    summary += `SUEÑO (revisión en control):\n`;
    addRadioField('Estado', formData.estadoSueno);
    addField('Horas de sueño', formData.horasSueno);
    // FIX: Replaced incorrect property access with helper function for new boolean/detail pairs.
    summary += addCheckboxFieldToSummary('Dificultad en la conciliación', 'dificultadConciliacionPresente', 'dificultadConciliacionDetalle');
    summary += addCheckboxFieldToSummary('Dificultad en la mantención', 'dificultadMantencionPresente', 'dificultadMantencionDetalle');
    addField('Evolución desde control anterior', formData.evolucionDesdeControlAnterior);
    summary += `\n`;

    summary += `ÁNIMO Y SUEÑO (revisión en control):\n`;
    summary += `PHQ-9 Puntaje Total: ${phq9Interpretation.score} - ${phq9Interpretation.severity}\n`;
    summary += `Acción Sugerida (PHQ-9): ${phq9Interpretation.action.replace('\n', ' ')}\n`;
    addField('Estado Anímico (descripción)', formData.estadoAnimoDesc);
    addField('Hábito de Sueño (descripción)', formData.habitoSuenoDesc);
    addField('Ideación Suicida (descripción)', formData.ideacionSuicidaDesc);
    summary += `\n`;

    summary += `ANTECEDENTES SOCIALES (revisión en control):\n`;
    addField('Escolaridad', formData.escolaridad);
    addField('Ocupación', formData.ocupacion);
    addField('Antecedentes familiares relevantes', formData.antecedentesFamiliaresRelevantes);
    addField('Vive con', formData.viveCon);
    addField('Redes de apoyo', formData.redesApoyo);
    addField('Percepción de situación económica', formData.percepcionSituacionEconomica);
    addField('Espiritualidad', formData.espiritualidad);
    summary += `\n`;

    summary += `ÚLTIMO LABORATORIO / EKG / IMÁGENES (revisión en control):\n`;
    addField('Fecha Examen Laboratorio', formatDateForDisplay(formData.fechaExamenLaboratorio));
    addField('Resultados Laboratorio', formData.resultadosLaboratorio);
    addField(`EKG (Fecha: ${formatDateForDisplay(formData.ekgFecha)})`, formData.ekgResultados);
    addField(`Otras Imágenes (Fecha: ${formatDateForDisplay(formData.otrasImagenesFecha)})`, formData.otrasImagenesResultados);
    summary += `\n`;

    summary += `EXAMEN FÍSICO (Control Actual):\n`;
    addField('Peso', `${formData.peso} kg`);
    addField('Talla', `${formData.talla} cm`);
    addField('IMC', formData.imc);
    addField('PA', formData.pa);
    addField('CC', `${formData.cc} cm`);
    summary += `Examen Físico General/Segmentario (Control Actual):\n${formData.examenFisicoGeneralSegmentario || '(No ingresado)'}\n\n`;
    
    summary += `PLAN DE CUIDADOS COMPARTIDO (PCC) (Control Actual):\n`;
    addField('Plan Consensuado', formData.planConsensuado);
    addRadioField('¿Está de acuerdo con el plan elaborado en conjunto con el equipo ECICEP?', formData.acuerdoPlanEquipo);
    addRadioField('¿Está de acuerdo con que lo contactemos para seguimiento?', formData.acuerdoContactoSeguimiento);
    summary += `\n`;
    
    summary += `PLAN (Control Actual ECICEP):\n`;
    summary += `${formData.indicacionesAdicionales || '(Sin indicaciones)'}\n`;

    return summary.trim();
  }, [formData, loggedInUser, phq9Interpretation]);

  useEffect(() => {
    setGeneratedText(generateSummary());
  }, [formData, generateSummary]);

  // FIX: Updated handleChange to clear detail fields when their corresponding checkbox is unchecked.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => {
          const newState = { ...prev, [name]: checked };
          // If unchecking a checkbox, clear its detail field.
          if (!checked) {
            const detailKey = name.replace('Presentes', 'Detalle');
            if (detailKey in newState) {
              (newState as any)[detailKey] = '';
            }
          }
          return newState;
        });
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleCopyToClipboard = (text: string, part: string) => {
    navigator.clipboard.writeText(text).then(() => alert(`${part} copiado al portapapeles.`));
  };
  
  const handleNewDocument = () => {
      setFormData(initialFormData);
  };
  
  const handleRadioChange = useCallback((name: keyof FichaControlEcicepFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);
  
  const renderRadioGroup = (label: string, name: keyof FichaControlEcicepFormData, options: string[]) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}:</label>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {options.map(opt => (
                <label key={opt} className="flex items-center text-sm">
                    <input type="radio" name={name} value={opt} checked={formData[name] === opt} onChange={e => handleChange(e as any)} className="form-radio h-4 w-4 text-sky-600" />
                    <span className="ml-2 text-slate-700">{opt}</span>
                </label>
            ))}
        </div>
    </div>
  );

  // FIX: Added helper function to render checkbox with clarification field.
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

  // FIX: Added config for checkbox fields.
  const eficienteGeneralConfig: CheckboxClarificationConfig[] = [
    { label: 'Alergias', presenteKey: 'alergiasPresentes', detalleKey: 'alergiasDetalle' },
    { label: 'Cirugías', presenteKey: 'cirugiasPresentes', detalleKey: 'cirugiasDetalle' },
    { label: 'Hospitalizaciones', presenteKey: 'hospitalizacionesPresentes', detalleKey: 'hospitalizacionesDetalle' },
  ];

  const suenoConfig: CheckboxClarificationConfig[] = [
    { label: 'Dificultad en la conciliación', presenteKey: 'dificultadConciliacionPresente', detalleKey: 'dificultadConciliacionDetalle' },
    { label: 'Dificultad en la mantención', presenteKey: 'dificultadMantencionPresente', detalleKey: 'dificultadMantencionDetalle' },
  ];

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha Control ECICEP</h2>
        <p className="text-slate-500 mt-2">Complete los datos de la ficha. El resumen se generará automáticamente.</p>
      </header>

      <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
        <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4 pb-16">
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación General</h3>
                <DateField label="Fecha Control Actual" id="fechaControlActual" name="fechaControlActual" value={formData.fechaControlActual} onChange={handleChange} />
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de control anterior</label>
                  <input
                    type="text"
                    name="fechaControlAnterior"
                    placeholder="DD-MM-AAAA"
                    maxLength={10}
                    value={formData.fechaControlAnterior || ''}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 8) val = val.slice(0, 8);
                      let formatted = val;
                      if (val.length > 2) formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
                      if (val.length > 4) formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
                      setFormData(prev => ({ ...prev, fechaControlAnterior: formatted }));
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700 placeholder-slate-400"
                  />
                </div>
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Evaluación y Metas</h3>
                <FormField isTextArea rows={2} label="Estado de salud desde último control" id="estadoSaludDesdeUltimoControl" name="estadoSaludDesdeUltimoControl" value={formData.estadoSaludDesdeUltimoControl} onChange={handleChange} />
                {renderRadioGroup('Cambios en la dinámica familiar', 'cambiosDinamicaFamiliar', ['Sí', 'No'])}
                {renderRadioGroup('Controles en extrasistema', 'controlesExtrasistema', ['Sí', 'No'])}
                {renderRadioGroup('RAM', 'ram', ['Sí', 'No'])}
                {renderRadioGroup('Requiere educación sobre fármacos', 'requiereEducacionFarmacos', ['Sí', 'No'])}
                <FormField isTextArea rows={2} label="Plan consensuado anterior" id="planConsensuadoAnterior" name="planConsensuadoAnterior" value={formData.planConsensuadoAnterior} onChange={handleChange} />
                {renderRadioGroup('¿Cumplió metas propuestas?', 'cumplioMetasPropuestas', ['Sí', 'No'])}
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                 <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Antecedentes Generales (Revisión)</h3>
                 {renderRadioGroup('Sexo', 'sexo', ['Masculino', 'Femenino'])}
                 <FormField isTextArea rows={2} label="Anamnesis General" id="anamnesisGeneral" name="anamnesisGeneral" value={formData.anamnesisGeneral} onChange={handleChange} />
                 <FormField isTextArea rows={2} label="Fármacos" id="farmacos" name="farmacos" value={formData.farmacos} onChange={handleChange} />
                 <MedicamentoArsenalInput currentValue={formData.farmacos} onValueChange={(newValue) => setFormData(prev => ({...prev, farmacos: newValue}))} />
                 {/* FIX: Replaced FormFields with renderCheckboxClarificationField calls. */}
                 {eficienteGeneralConfig.map(renderCheckboxClarificationField)}
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Sueño (Revisión)</h3>
                {renderRadioGroup('Estado Sueño', 'estadoSueno', ['Conservado', 'Alterado'])}
                <FormField label="Horas de sueño" id="horasSueno" name="horasSueno" value={formData.horasSueno} onChange={handleChange} />
                {/* FIX: Replaced FormFields with renderCheckboxClarificationField calls. */}
                {suenoConfig.map(renderCheckboxClarificationField)}
                <FormField isTextArea rows={2} label="Evolución desde control anterior" id="evolucionDesdeControlAnterior" name="evolucionDesdeControlAnterior" value={formData.evolucionDesdeControlAnterior} onChange={handleChange} />
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Ánimo y Sueño (Revisión)</h3>
                 <button onClick={() => setIsPhq9ModalOpen(true)} className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-700">Evaluar PHQ-9</button>
                 <FormField isTextArea rows={2} label="Estado Anímico (descripción)" id="estadoAnimoDesc" name="estadoAnimoDesc" value={formData.estadoAnimoDesc} onChange={handleChange} />
                 <FormField isTextArea rows={2} label="Hábito de Sueño (descripción)" id="habitoSuenoDesc" name="habitoSuenoDesc" value={formData.habitoSuenoDesc} onChange={handleChange} />
                 <FormField isTextArea rows={2} label="Ideación Suicida (descripción)" id="ideacionSuicidaDesc" name="ideacionSuicidaDesc" value={formData.ideacionSuicidaDesc} onChange={handleChange} />
            </section>
            
            <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                 <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Examen Físico (Control Actual)</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange} type="number" step="0.1" />
                     <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange} type="number" />
                     <FormField label="IMC (kg/mÂ²)" id="imc" name="imc" value={formData.imc} onChange={handleChange} readOnly disabled />
                     <FormField label="PA (mmHg)" id="pa" name="pa" value={formData.pa} onChange={handleChange} />
                     <FormField label="FC (lpm)" id="fc" name="fc" value={formData.fc} onChange={handleChange} type="number" />
                     <FormField label="CC (cm)" id="cc" name="cc" value={formData.cc} onChange={handleChange} type="number" />
                 </div>
                 <FormField label="Examen Físico General/Segmentario" id="examenFisicoGeneralSegmentario" name="examenFisicoGeneralSegmentario" value={formData.examenFisicoGeneralSegmentario} onChange={handleChange} isTextArea rows={10}/>
            </section>

             <section className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                 <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2">Plan (Control Actual)</h3>
                 <FormField isTextArea rows={3} label="Plan Consensuado" id="planConsensuado" name="planConsensuado" value={formData.planConsensuado} onChange={handleChange}/>
                 {renderRadioGroup('¿Acuerdo con plan del equipo?', 'acuerdoPlanEquipo', ['Sí', 'No'])}
                 {renderRadioGroup('¿Acuerdo con contacto para seguimiento?', 'acuerdoContactoSeguimiento', ['Sí', 'No'])}
                 <FormField isTextArea rows={4} label="Indicaciones Adicionales" id="indicacionesAdicionales" name="indicacionesAdicionales" value={formData.indicacionesAdicionales} onChange={handleChange}/>
            </section>
        </div>

        <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            <button onClick={() => handleCopyToClipboard(generatedText, 'Ficha Completa')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar Todo</button>
          </div>
          <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">Volver</button>
        <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg">Limpiar Formulario</button>
      </div>
      
      <PHQ9Modal
            isOpen={isPhq9ModalOpen}
            onClose={() => setIsPhq9ModalOpen(false)}
            formData={formData}
            handleRadioChange={handleRadioChange as any} // Cast because it expects a union type
        />
    </div>
  );
};

export default FichaControlEcicep;

