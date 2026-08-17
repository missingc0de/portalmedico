import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FichaSeguimientoEcicepFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { getAiClient, Type } from '../utils/aiClient';
import { canUseAI } from '../utils/aiRestrictions';
import EcicepRiskCalculatorModal from './EcicepRiskCalculatorModal';
import CopyButton from './CopyButton';
import { Printer, ExternalLink, PlusCircle, FileText, CheckSquare } from 'lucide-react';

const initialPlanSeguimientoText = `- Asistir a su próxima cita de salud.
- Se fomenta adherencia a plan consensuado.
- Se reitera fecha de próxima consulta.
- Realizar exámenes o estudios pendientes, de haberlos.
- Pautas de alarma.
- Acudir a urgencias SOS.`;

const initialFormData: FichaSeguimientoEcicepFormData = {
  ultimoControlEcicepFecha: '',
  profesionalSeguimiento: '',
  edad: '',
  sexo: '',
  estratificacion: '',
  estadoSaludDesdeUltimoControl: 'Sin cambios desde el último control',
  planConsensuadoAnterior: '',
  cumplioMetasPropuestas: 'Sí', // Default Sí
  cumplioMetasPropuestasAclaracion: '',
  molestiasReferidas: 'No', // Default requested
  molestiasReferidasAclaracion: '',
  atencionesDesdeUltimo: 'No', // Default requested
  atencionesDesdeUltimoAclaracion: '',
  hospitalizacionesDesdeUltimo: 'No', // Default requested
  hospitalizacionesDesdeUltimoAclaracion: '',
  consultasUrgencias: 'No', // Default requested
  consultasUrgenciasAclaracion: '',
  farmacosEnUso: '',
  dificultadUsoFarmacos: 'No', // Default
  dificultadUsoFarmacosAclaracion: '',
  dudasFarmacos: 'No', // Default
  dudasFarmacosAclaracion: '',
  requiereApoyo: 'No', // Default
  requiereApoyoAclaracion: '',
  labFecha: '',
  labResultados: '',
  ekgFecha: '',
  ekgResultados: '',
  imgFecha: '',
  imgResultados: '',
  fechaProximoControl: '',
  planSeguimiento: initialPlanSeguimientoText,
  planProximoControlDupla: '',
  planProximoControlTiempo: '',
  incluirControlCardiovascular: false,
  incluirControlHipotiroidismo: false,
  incluirControlArtrosis: false,
  incluirControlEpilepsia: false,
  incluirControlSalaEra: false,
  incluirControlSalaIra: false,
  incluirControlDemencias: false,
  incluirControlSm: false,
};

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
              model: 'Groq-flash-latest',
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

interface RadioClarificationItem {
  keyBase: keyof FichaSeguimientoEcicepFormData;
  label: string;
}

interface FichaSeguimientoEcicepProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  actionsRef?: React.MutableRefObject<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>;
  fechaSeguimientoProp?: string;
  onFechaSeguimientoChange?: (fecha: string) => void;
  fechaUltimoControlProp?: string;
  onFechaUltimoControlChange?: (fecha: string) => void;
}

const FichaSeguimientoEcicep: React.FC<FichaSeguimientoEcicepProps> = ({ 
  onBackToMenu, 
  loggedInUser,
  actionsRef,
  fechaSeguimientoProp,
  onFechaSeguimientoChange,
  fechaUltimoControlProp,
  onFechaUltimoControlChange
}) => {
  const [formData, setFormData] = useFormLocalStorage<FichaSeguimientoEcicepFormData>('local_FichaSeguimientoEcicep', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');
  const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);
  const [showRemActive, setShowRemActive] = useState(false);
  const [isAdditionalControlsOpen, setIsAdditionalControlsOpen] = useState(false);

  const [isLabLoading, setIsLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const [isEkgLoading, setIsEkgLoading] = useState(false);
  const [ekgError, setEkgError] = useState<string | null>(null);
  const ekgFileRef = useRef<HTMLInputElement>(null);

  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  // Synchronize initial local storage to App.tsx state on mount
  useEffect(() => {
    let migrated = false;
    let newFormData = { ...formData };
    
    if (newFormData.ultimoControlEcicepFecha) {
      const parts = newFormData.ultimoControlEcicepFecha.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        newFormData.ultimoControlEcicepFecha = `${parts[2]}-${parts[1]}-${parts[0]}`;
        migrated = true;
      }
    }

    if (migrated) {
      setFormData(newFormData);
    }

    if (onFechaUltimoControlChange && newFormData.ultimoControlEcicepFecha) {
      onFechaUltimoControlChange(newFormData.ultimoControlEcicepFecha);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize App.tsx state updates to local form state
  useEffect(() => {
    if (fechaUltimoControlProp !== undefined && formData.ultimoControlEcicepFecha !== fechaUltimoControlProp) {
      setFormData(prev => ({ ...prev, ultimoControlEcicepFecha: fechaUltimoControlProp }));
    }
  }, [fechaUltimoControlProp]);

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

  const additionalControlsKeys = additionalControlsItems.map(item => item.key);

  const handleLabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'laboratorio', setIsLabLoading, setLabError, (result) => {
      setFormData(prev => ({ ...prev, labResultados: result.text, ...(result.date && { labFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = ''; 
  };

  const handleEkgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'imagenes', setIsEkgLoading, setEkgError, (result) => {
        setFormData(prev => ({ ...prev, ekgResultados: result.text, ...(result.date && { ekgFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = ''; 
  };

  const handleImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, 'imagenes', setIsImgLoading, setImgError, (result) => {
        setFormData(prev => ({ ...prev, imgResultados: result.text, ...(result.date && { imgFecha: result.date }) }));
    }, loggedInUser);
    if (e.target) e.target.value = ''; 
  };

  const calculateGeneratedTextParts = useCallback(() => {
    let anamnesis = '';
    let exploracion = '';
    let actuacion = '';

    anamnesis += `FICHA SEGUIMIENTO ECICEP\n`;
    anamnesis += `---------------------------------------\n`;
    anamnesis += `FECHA ÚLTIMO CONTROL: ${formatDateForDisplay(fechaUltimoControlProp || formData.ultimoControlEcicepFecha)}\n`;
    anamnesis += `PROFESIONAL DE SEGUIMIENTO: ${loggedInUser?.fullName || '(No ingresado)'}\n`;
    anamnesis += `ESTRATIFICACIÓN: ${formData.estratificacion || '(No seleccionado)'}\n`;
    anamnesis += `MOTIVO DE CONSULTA: SEGUIMIENTO TELEFÓNICO ECICEP\n`;
    anamnesis += `---------------------------------------\n\n`;

    anamnesis += `IDENTIFICACIÓN:\n`;
    anamnesis += `- Edad: ${formData.edad || 'N/A'}\n`;
    anamnesis += `- Sexo: ${formData.sexo || 'N/A'}\n\n`;

    anamnesis += `ANAMNESIS\n`;
    const estadoSaludDisplay = formData.estadoSaludDesdeUltimoControl === 'Sin cambios desde el último control' 
        ? 'Sin cambios.' 
        : formData.estadoSaludDesdeUltimoControl;
    anamnesis += `Estado de salud desde último control: ${estadoSaludDisplay || '(No ingresado)'}\n`;
    anamnesis += `Plan consensuado anterior: ${formData.planConsensuadoAnterior || '(No ingresado)'}\n`;
    anamnesis += `¿Cumplió metas propuestas?: ${formData.cumplioMetasPropuestas === 'No' ? 'Niega.' : (formData.cumplioMetasPropuestas || '(No seleccionado)')}${formData.cumplioMetasPropuestas === 'Sí' && formData.cumplioMetasPropuestasAclaracion ? ` (${formData.cumplioMetasPropuestasAclaracion})` : ''}${formData.cumplioMetasPropuestas === 'No' && formData.cumplioMetasPropuestasAclaracion ? ` - Aclaración: ${formData.cumplioMetasPropuestasAclaracion}` : ''}\n\n`;

    anamnesis += `ATENCIONES DE SALUD\n`;
    const formatValue = (val: string, aclaracion: string) => {
        if (val === 'No') return 'Niega.';
        if (val === 'Sí') return aclaracion ? `Sí (${aclaracion})` : 'Sí.';
        return '(No seleccionado)';
    };

    anamnesis += `Molestias referidas: ${formatValue(formData.molestiasReferidas, formData.molestiasReferidasAclaracion)}\n`;
    anamnesis += `Atenciones de salud desde último control: ${formatValue(formData.atencionesDesdeUltimo, formData.atencionesDesdeUltimoAclaracion)}\n`;
    anamnesis += `Hospitalizaciones desde último control: ${formatValue(formData.hospitalizacionesDesdeUltimo, formData.hospitalizacionesDesdeUltimoAclaracion)}\n`;
    anamnesis += `Consultas en urgencias: ${formatValue(formData.consultasUrgencias, formData.consultasUrgenciasAclaracion)}\n\n`;

    anamnesis += `REVISIÓN DE FÁRMACOS\n`;
    anamnesis += `Fármacos en uso: ${formData.farmacosEnUso || '(No ingresado)'}\n`;
    anamnesis += `Dificultad de uso: ${formatValue(formData.dificultadUsoFarmacos, formData.dificultadUsoFarmacosAclaracion)}\n`;
    anamnesis += `Dudas sobre fármacos: ${formatValue(formData.dudasFarmacos, formData.dudasFarmacosAclaracion)}\n`;
    anamnesis += `¿Requiere apoyo sobre temas tratados?: ${formatValue(formData.requiereApoyo, formData.requiereApoyoAclaracion)}\n`;

    exploracion += `ESTUDIOS RECIENTES:\n`;
    exploracion += `Laboratorio (Fecha: ${formatDateForDisplay(formData.labFecha)}): ${formData.labResultados || '(No ingresado)'}\n`;
    exploracion += `EKG (Fecha: ${formatDateForDisplay(formData.ekgFecha)}): ${formData.ekgResultados || '(No ingresado)'}\n`;
    exploracion += `Otras Imágenes (Fecha: ${formatDateForDisplay(formData.imgFecha)}): ${formData.imgResultados || '(No ingresado)'}\n`;

    actuacion += `PLAN DE SEGUIMIENTO:\n${formData.planSeguimiento || '(No ingresado)'}\n`;
    if (formData.planProximoControlDupla || formData.planProximoControlTiempo) {
        actuacion += `- Próximo control con Médico + ${formData.planProximoControlDupla || '(dupla no especificada)'} en ${formData.planProximoControlTiempo || '(tiempo no especificado)'}.\n`;
    }

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim()
    };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
    setStatus(FormStatus.TextGenerated);
  }, [formData, calculateGeneratedTextParts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRadioChange = useCallback((name: keyof FichaSeguimientoEcicepFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  }, []);

  const handleExportPdf = async () => {
    if (window.confirm("¿Seguro que desea exportar a PDF?")) {
      if (!loggedInUser) return;
      setStatus(FormStatus.Generating);
      try {
        const fullContent = `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}`;
        await generateClinicalRecordPdf({ title: 'Ficha Seguimiento ECICEP', content: fullContent }, loggedInUser);
      } finally {
        setStatus(FormStatus.Idle);
      }
    }
  };

  const handleNewDocument = () => {
    if (window.confirm('¿Está seguro de limpiar el formulario? Se perderán todos los datos no guardados.')) {
      setFormData({ ...initialFormData });
      if (onFechaSeguimientoChange) {
        const d = new Date();
        const formatted = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        onFechaSeguimientoChange(formatted);
      }
      if (onFechaUltimoControlChange) onFechaUltimoControlChange('');
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

    let driveLink = 'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0'; 
    
    if (loggedInUser?.sector === 'Naranjo') {
      driveLink = 'https://docs.google.com/spreadsheets/d/17cNcOTdn8qupYchtc10ouMG45ve_BpaZZmTGEdos-4Q/edit?gid=152571995#gid=152571995';
    } else if (loggedInUser?.sector === 'Amarillo') {
      driveLink = 'https://docs.google.com/spreadsheets/d/1paEDMTrLz2Ig_jpayPoc1z1GsnJTfSAR/edit?gid=1909397780#gid=1909397780';
    } else if (loggedInUser?.sector === 'Verde') {
      driveLink = 'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0';
    }

    window.open(driveLink, '_blank');
  };

  const handleRemClick = () => {
    setShowRemActive(prev => !prev);
  };

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        exportPdf: handleExportPdf,
        newForm: handleNewDocument,
        editarDrive: handleDriveEdit
      };
    }
  }, [actionsRef, formData, loggedInUser, anamnesisText, exploracionText, actuacionText]);

  const renderRadioGroup = (
    label: string, 
    name: keyof FichaSeguimientoEcicepFormData, 
    options: {value: string, label: string}[]
  ) => (
    <div className="mt-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}:</label>
      <div className="flex items-center space-x-4">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center text-sm cursor-pointer">
            <input
              type="radio"
              name={String(name)}
              value={opt.value}
              checked={formData[name] === opt.value}
              onChange={() => handleRadioChange(name, opt.value)}
              className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-slate-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderRadioClarification = (item: RadioClarificationItem, requiredValue: 'Sí' | 'No' = 'Sí') => {
    const value = formData[item.keyBase] as string;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaSeguimientoEcicepFormData;
    return (
      <div key={String(item.keyBase)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white shadow-sm hover:shadow transition-shadow">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{item.label}:</label>
        <div className="flex items-center space-x-4 mb-2">
          {['Sí', 'No'].map(opt => (
            <label key={opt} className="flex items-center text-sm cursor-pointer">
              <input type="radio" name={String(item.keyBase)} value={opt} checked={value === opt} onChange={() => handleRadioChange(item.keyBase, opt)} className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out" />
              <span className="ml-2 text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
        {value === requiredValue && (
          <input type="text" name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange} placeholder="Aclare aquí..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 outline-none h-[38px] bg-slate-50 font-medium text-black" />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          {/* Columna Central: Formulario (col-span-8) - Única columna scrolleable */}
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                
                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <FormField label="Edad" id="edad" name="edad" type="number" value={formData.edad} onChange={handleChange as any} inputClassName="!h-[42px] text-black" />
                            <div className="-mt-4">
                                {renderRadioGroup("Sexo", "sexo", [{value: "Masculino", label: "Masculino"}, {value: "Femenino", label: "Femenino"}])}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 mt-2">
                        <div className="flex-grow">
                            {renderRadioGroup("Estratificación", "estratificacion", [{value: "G1", label: "G1"}, {value: "G2", label: "G2"}, {value: "G3", label: "G3"}])}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRiskCalculatorOpen(true)}
                            className="mb-4 flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-[10px] font-bold rounded-lg shadow hover:bg-sky-700 transition-all h-[42px]"
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
                                additionalControlsKeys.forEach(key => {
                                  (newState as any)[key] = false;
                                });
                                if (selectedKey) {
                                  (newState as any)[selectedKey] = true;
                                }
                                return newState;
                              });
                            }}
                            value={additionalControlsItems.find(item => formData[item.key as keyof FichaSeguimientoEcicepFormData])?.key || ''}
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
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
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
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
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
                                      checked={formData[item.key as keyof FichaSeguimientoEcicepFormData] as boolean}
                                      onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
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

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Anamnesis</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Último Control ECICEP:</label>
                      <input
                        type="text"
                        placeholder="Ej: 12-05-2023"
                        value={formData.ultimoControlEcicepFecha || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({...prev, ultimoControlEcicepFecha: val}));
                          if (onFechaUltimoControlChange) onFechaUltimoControlChange(val);
                        }}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-sm h-[42px]"
                      />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="estadoSaludDesdeUltimoControl" className="block text-sm font-medium text-slate-700 mb-1.5">Estado de salud desde último control:</label>
                        <select
                            id="estadoSaludDesdeUltimoControl"
                            name="estadoSaludDesdeUltimoControl"
                            value={
                                formData.estadoSaludDesdeUltimoControl.startsWith('Alterado') ? 'Alterado' :
                                formData.estadoSaludDesdeUltimoControl.startsWith('Mejoría en estado de salud') ? 'Mejoría en estado de salud' :
                                formData.estadoSaludDesdeUltimoControl
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'Alterado') setFormData(prev => ({ ...prev, estadoSaludDesdeUltimoControl: 'Alterado: ' }));
                                else if (val === 'Mejoría en estado de salud') setFormData(prev => ({ ...prev, estadoSaludDesdeUltimoControl: 'Mejoría en estado de salud: ' }));
                                else setFormData(prev => ({ ...prev, estadoSaludDesdeUltimoControl: val }));
                            }}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-sm h-[42px]"
                        >
                            <option value="Sin cambios desde el último control">Sin cambios desde el último control</option>
                            <option value="Mejoría en estado de salud">Mejoría en estado de salud</option>
                            <option value="Alterado">Alterado</option>
                        </select>
                        {formData.estadoSaludDesdeUltimoControl.startsWith('Alterado') && (
                            <textarea
                                value={formData.estadoSaludDesdeUltimoControl.replace('Alterado: ', '')}
                                onChange={(e) => setFormData(prev => ({ ...prev, estadoSaludDesdeUltimoControl: `Alterado: ${e.target.value}` }))}
                                placeholder="Aclare cómo está alterado..."
                                rows={3}
                                className="mt-2 w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-sm transition-all"
                            />
                        )}
                        {formData.estadoSaludDesdeUltimoControl.startsWith('Mejoría en estado de salud') && (
                            <textarea
                                value={formData.estadoSaludDesdeUltimoControl.replace('Mejoría en estado de salud: ', '')}
                                onChange={(e) => setFormData(prev => ({ ...prev, estadoSaludDesdeUltimoControl: `Mejoría en estado de salud: ${e.target.value}` }))}
                                placeholder="Aclare en qué mejoró..."
                                rows={3}
                                className="mt-2 w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-black text-sm transition-all"
                            />
                        )}
                    </div>
                    <FormField isTextArea rows={2} label="Plan consensuado anterior" id="planConsensuadoAnterior" name="planConsensuadoAnterior" value={formData.planConsensuadoAnterior} onChange={handleChange as any} inputClassName="text-black" />
                    {renderRadioClarification({ keyBase: 'cumplioMetasPropuestas', label: '¿Cumplió metas propuestas?' }, 'No')}
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Atenciones de Salud</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderRadioClarification({ keyBase: 'molestiasReferidas', label: 'Molestias referidas' })}
                        {renderRadioClarification({ keyBase: 'atencionesDesdeUltimo', label: 'Atenciones de salud desde último control' })}
                        {renderRadioClarification({ keyBase: 'hospitalizacionesDesdeUltimo', label: 'Hospitalizaciones desde último control' })}
                        {renderRadioClarification({ keyBase: 'consultasUrgencias', label: 'Consultas en urgencias' })}
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Revisión de Fármacos</h3>
                    <SmartFarmacosTextarea 
                        label="Fármacos en uso" 
                        id="farmacosEnUso" 
                        name="farmacosEnUso" 
                        value={formData.farmacosEnUso} 
                        onChange={(v) => setFormData(p => ({...p, farmacosEnUso: v}))} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {renderRadioClarification({ keyBase: 'dificultadUsoFarmacos', label: 'Dificultad de uso' })}
                        {renderRadioClarification({ keyBase: 'dudasFarmacos', label: 'Dudas sobre fármacos' })}
                        {renderRadioClarification({ keyBase: 'requiereApoyo', label: '¿Requiere apoyo sobre temas tratados?' })}
                    </div>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-semibold text-sky-700 border-b border-sky-200 pb-2 flex-grow">Estudios Recientes (Lab, EKG, Imágenes)</h3>
                    <input type="file" ref={labFileRef} onChange={handleLabFileChange} className="hidden" accept="application/pdf,image/*" />
                    <input type="file" ref={ekgFileRef} onChange={handleEkgFileChange} className="hidden" accept="application/pdf,image/*" />
                    <input type="file" ref={imgFileRef} onChange={handleImgFileChange} className="hidden" accept="application/pdf,image/*" />
                  </div>

                  {labError && <p className="text-red-500 text-xs mb-0">{labError}</p>}
                  <div className="mb-0 flex items-center justify-between">
                    <DateField
                      label="Laboratorio"
                      id="labFecha"
                      name="labFecha"
                      value={formData.labFecha || ''}
                      onChange={handleChange as any}
                      containerClassName="mb-0 flex-grow"
                      labelPrefix={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-700 shrink-0 ml-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      }
                    />
                    <button type="button" onClick={() => labFileRef.current?.click()} disabled={isLabLoading || loggedInUser?.profession !== 'medicina'} className="text-[9px] bg-sky-100 text-sky-700 px-2 py-1 rounded font-black uppercase hover:bg-sky-200 disabled:bg-slate-200 disabled:text-slate-500 shrink-0 mt-6">
                      {isLabLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                  </div>
                  <textarea value={formData.labResultados || ''} onChange={handleChange as any} name="labResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]" placeholder="Resultados del último laboratorio..."></textarea>

                  {ekgError && <p className="text-red-500 text-xs mt-1 mb-0">{ekgError}</p>}
                  <div className="mb-0 flex items-center justify-between">
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
                    <button type="button" onClick={() => ekgFileRef.current?.click()} disabled={isEkgLoading || loggedInUser?.profession !== 'medicina'} className="text-[9px] bg-sky-100 text-sky-700 px-2 py-1 rounded font-black uppercase hover:bg-sky-200 disabled:bg-slate-200 disabled:text-slate-500 shrink-0 mt-6">
                      {isEkgLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                  </div>
                  <textarea value={formData.ekgResultados || ''} onChange={handleChange as any} name="ekgResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]" placeholder="Resultados EKG..."></textarea>

                  <div className="flex items-center justify-between gap-1.5 mb-1 mt-1">
                    <DateField
                      label="Fecha Otras Imágenes"
                      id="imgFecha"
                      name="imgFecha"
                      value={formData.imgFecha || ''}
                      onChange={handleChange as any}
                      containerClassName="mb-0 flex-grow"
                    />
                    <button type="button" onClick={() => imgFileRef.current?.click()} disabled={isImgLoading || loggedInUser?.profession !== 'medicina'} className="text-[9px] bg-sky-100 text-sky-700 px-2 py-1 rounded font-black uppercase hover:bg-sky-200 disabled:bg-slate-200 disabled:text-slate-500 shrink-0 mt-6">
                      {isImgLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                  </div>
                  {imgError && <p className="text-red-500 text-xs mt-1 mb-1">{imgError}</p>}
                  <textarea value={formData.imgResultados || ''} onChange={handleChange as any} name="imgResultados" className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar font-sans text-sm leading-normal text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[60px]" placeholder="Resultados de otras imágenes..."></textarea>
                </section>

                <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Actuación</h3>
                    <FormField isTextArea rows={4} label="Plan de Seguimiento" id="planSeguimiento" name="planSeguimiento" value={formData.planSeguimiento} onChange={handleChange as any} inputClassName="text-black" />
                    <div className="p-3 border border-slate-200 rounded-lg bg-white mt-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                                <select name="planProximoControlTiempo" value={formData.planProximoControlTiempo} onChange={handleChange as any} className="w-full px-4 py-2.5 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm font-sans font-normal text-slate-800">
                                    <option value="" className="text-slate-800">Seleccione...</option>
                                    {tiempoControlOptions.map(option => <option key={option.value} value={option.value} className="text-slate-800">{option.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dupla para próximo control</label>
                                <select name="planProximoControlDupla" value={formData.planProximoControlDupla} onChange={handleChange as any} className="w-full px-4 py-2.5 h-[42px] bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm font-sans font-normal text-slate-800">
                                    {duplaProfesionalOptions.map(option => <option key={option.value} value={option.value} className="text-slate-800">{option.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
              </form>
          </div>

          {/* Columna Derecha: Resumen Ficha Clínica (Editable) */}
          <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2.5 lg:h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] overflow-hidden">
            {/* Tarjeta de Resumen */}
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
                  <textarea
                    value={anamnesisText}
                    onChange={(e) => setAnamnesisText(e.target.value)}
                    className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Anamnesis - editable"
                  />
                </div>
                {/* Bloque Exploración */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1 flex-shrink-0">
                    <label className="block text-xs font-semibold text-slate-800">Exploración</label>
                    <CopyButton textToCopy={exploracionText} />
                  </div>
                  <textarea
                    value={exploracionText}
                    onChange={(e) => setExploracionText(e.target.value)}
                    className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Exploración - editable"
                  />
                </div>
                {/* Bloque Actuación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-1 flex-shrink-0">
                    <label className="block text-xs font-semibold text-slate-800">Actuación</label>
                    <CopyButton textToCopy={actuacionText} />
                  </div>
                  <textarea
                    value={actuacionText}
                    onChange={(e) => setActuacionText(e.target.value)}
                    className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    aria-label="Actuación - editable"
                  />
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
      </div>
      <EcicepRiskCalculatorModal 
          isOpen={isRiskCalculatorOpen} 
          onClose={() => setIsRiskCalculatorOpen(false)} 
          onCalculate={(result) => setFormData(prev => ({...prev, estratificacion: result}))} 
      />
    </>
  );
};

export default FichaSeguimientoEcicep;

