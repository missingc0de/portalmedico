import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = {
  "edad": "Recién Nacido",
  "acompanante": "",
  "parentesco": "",
  "profesional": "Matrón/a – Médico/a",
  "egSemanas": "",
  "embarazoDetalle": "",
  "partoDetalle": "",
  "pnGramos": "",
  "tnCm": "",
  "ccCm": "",
  "apgar": "",
  "hospitalizacionNeonatal": "No",
  "hospitalizacionMotivo": "",
  "morbilidadNeonatal": "Niega.",
  "altaDias": "",
  "contactoPielConPiel": "Sí",
  "inicioLactanciaPrimeraHora": "Sí",
  "tamizajesNeonatales": "PKU/TSH realizado, Screening auditivo normal.",
  "inmunizaciones": "BCG y Hepatitis B al día.",
  "alimentacionActual": "LME",
  "frecuenciaAlimentacion": "Libre demanda (8-12 veces/día)",
  "acopleSuccion": "Adecuados",
  "dolorAmamantar": "No",
  "grietas": "No",
  "produccionLactea": "Percepción adecuada",
  "diuresisPañalesDia": "6 pañales/día",
  "deposicionesDia": "3-4/día, pastosas amarillas",
  "regurgitacionVomitos": "Ocasional / Niega",
  "suenoPatron": "Normal, 16-18 horas/día",
  "lugarSueno": "Cuna propia",
  "posicionSueno": "Decúbito supino",
  "madreEstadoGeneral": "Bueno",
  "madreAnimo": "Tranquila, buen vínculo",
  "madreDolorSangrado": "Loquios fisiológicos, dolor controlado",
  "redApoyo": "Presente y activa",
  "participacionPadre": "Activa",
  "factoresRiesgoBiopsicosocial": "Sin riesgo",
  "dudasFamiliares": "Atendidas",
  "efPesoActual": "",
  "efVariacionPesoNacimiento": "",
  "efTalla": "",
  "efPerimetroCefalico": "",
  "efEstadoGeneral": "Activo, reactivo, bien perfundido.",
  "efPielIctericia": "No",
  "efPielCianosis": "No",
  "efPielLesiones": "Sin lesiones",
  "efCabezaFontanela": "Normotensa, suturas afrontadas",
  "efOjosReflejoRojo": "Presente bilateral",
  "efBocaPaladar": "Mucosas húmedas, paladar indemne, succión vigorosa",
  "efCuelloClaviculas": "Indemnes, sin fractura de clavícula",
  "efFc": "",
  "efFr": "",
  "efCardiovascular": "RCR 2T, sin soplos, pulsos femorales presentes y simétricos",
  "efPulmonar": "MP (+) bilateral simétrico, sin ruidos agregados",
  "efAbdomenOmbligo": "Blando, depresible. Cordón umbilical en proceso de momificación, limpio",
  "efGenitalesAno": "Normoconfigurados según sexo, ano permeable",
  "efCaderasOrtolaniBarlow": "Ortolani y Barlow negativos, abducción simétrica",
  "efExtremidades": "Simétricas, movilidad espontánea adecuada",
  "efNeurologicoTono": "Alerta, tono y reflejos arcaicos presentes y simétricos",
  "scoreRiesgoNeumonia": "Bajo riesgo",
  "pautaRiesgoBiopsicosocial": "Sin riesgo",
  "diagnostico1": "RN en control de salud de la díada",
  "diagnosticoNutricional": "Recuperación ponderal adecuada",
  "diagnosticoAlimentacion": "Lactancia materna exclusiva",
  "diagnosticoBiopsicosocial": "Sin riesgo biopsicosocial",
  "indicaciones": "- Reforzar lactancia materna exclusiva a libre demanda y técnica de amamantamiento.\n- Educar respecto a signos de hambre/saciedad y adecuada transferencia de leche.\n- Reforzar sueño seguro (decúbito supino, cuna sin almohadas ni peluches), prevención de muerte súbita y evitar humo de tabaco.\n- Cuidados del cordón umbilical con alcohol al 70% e higiene diaria.\n- Reforzar vínculo, contacto piel con piel, respuesta sensible al llanto y corresponsabilidad.\n- Recomendaciones de prevención de accidentes.\n- Explicar signos de alarma del RN: rechazo alimentario, fiebre/hipotermia, dificultad respiratoria, cianosis, ictericia progresiva.\n- Próximo control: Control de salud infantil 1° mes.",
  "proximoControl": "1° mes con enfermera/médico"
};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const fichaControlNinoSanoRN: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('local_fichaControlNinoSanoRN', initialFormData);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = `CONTROL DE SALUD DE LA DÍADA / RECIÉN NACIDO\n---------------------------------------\nFECHA CONTROL: ${todayStr}\nPROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || 'Profesional de Salud'}\n---------------------------------------\n\nANAMNESIS:\n`;
    let exploracion = `EXPLORACIÓN FÍSICA Y PARÁMETROS:\n`;
    let actuacion = `ACTUACIÓN Y DIAGNÓSTICOS:\n`;

    Object.keys(formData).forEach(key => {
      const val = formData[key];
      if (val && typeof val === 'string' && val.trim()) {
        if (key.startsWith('ef') || ['peso', 'talla', 'perimetroCefalico', 'imc', 'pa', 'fc', 'fr', 'peZ', 'teZ', 'ptZ', 'diagnosticoNutricional', 'diagnosticoTalla', 'scoreRiesgoNeumonia'].includes(key)) {
          exploracion += `- ${key}: ${val}\n`;
        } else if (['diagnosticos', 'indicaciones', 'proximoControl'].includes(key)) {
          actuacion += `- ${key.toUpperCase()}:\n${val}\n\n`;
        } else {
          anamnesis += `- ${key}: ${val}\n`;
        }
      }
    });

    return {
      anamnesis: anamnesis.trim(),
      exploracion: exploracion.trim(),
      actuacion: actuacion.trim(),
    };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = generateSummaryParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
  }, [formData, generateSummaryParts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleCopyToClipboard = (text: string, title: string) => {
    const textToCopy = isUppercase ? text.toUpperCase() : text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`'${title}' copiado al portapapeles.`);
    }).catch(err => {
      console.error('Error al copiar: ', err);
    });
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">
            
            {/* SECCIÓN IDENTIFICACIÓN */}
            {true && (
              <section id="sec-identificacion" className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                <div className="flex flex-col gap-3">
                  
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Edad / Control"
                    id="edad"
                    name="edad"
                    value={formData.edad || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Acompañante"
                    id="acompanante"
                    name="acompanante"
                    value={formData.acompanante || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Parentesco"
                    id="parentesco"
                    name="parentesco"
                    value={formData.parentesco || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Profesional Responsable"
                    id="profesional"
                    name="profesional"
                    value={formData.profesional || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                </div>
              </section>
            )}

            {/* SECCIÓN ANAMNESIS */}
            {true && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Anamnesis y Antecedentes</h3>
                <div className="flex flex-col gap-3">
                  
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Edad Gestacional (semanas)"
                    id="egSemanas"
                    name="egSemanas"
                    value={formData.egSemanas || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Detalles del Embarazo"
                    id="embarazoDetalle"
                    name="embarazoDetalle"
                    value={formData.embarazoDetalle || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Detalles del Parto"
                    id="partoDetalle"
                    name="partoDetalle"
                    value={formData.partoDetalle || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Peso Nacimiento (g)"
                    id="pnGramos"
                    name="pnGramos"
                    value={formData.pnGramos || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Talla Nacimiento (cm)"
                    id="tnCm"
                    name="tnCm"
                    value={formData.tnCm || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="C. Cefálico Nacimiento (cm)"
                    id="ccCm"
                    name="ccCm"
                    value={formData.ccCm || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Apgar (1 min / 5 min)"
                    id="apgar"
                    name="apgar"
                    value={formData.apgar || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="hospitalizacionNeonatal" className="block text-sm font-medium text-slate-700">Hospitalización Neonatal:</label>
                  <select
                    id="hospitalizacionNeonatal"
                    name="hospitalizacionNeonatal"
                    value={formData.hospitalizacionNeonatal || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No">No</option><option value="Sí">Sí</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Motivo Hospitalización Neonatal"
                    id="hospitalizacionMotivo"
                    name="hospitalizacionMotivo"
                    value={formData.hospitalizacionMotivo || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Morbilidad / Antecedentes Neonatales"
                    id="morbilidadNeonatal"
                    name="morbilidadNeonatal"
                    value={formData.morbilidadNeonatal || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Alta Hospitalaria (días de vida)"
                    id="altaDias"
                    name="altaDias"
                    value={formData.altaDias || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="contactoPielConPiel" className="block text-sm font-medium text-slate-700">Contacto Piel con Piel en Parto:</label>
                  <select
                    id="contactoPielConPiel"
                    name="contactoPielConPiel"
                    value={formData.contactoPielConPiel || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="inicioLactanciaPrimeraHora" className="block text-sm font-medium text-slate-700">Inicio Lactancia Primera Hora:</label>
                  <select
                    id="inicioLactanciaPrimeraHora"
                    name="inicioLactanciaPrimeraHora"
                    value={formData.inicioLactanciaPrimeraHora || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Tamizajes Neonatales (PKU / TSH / Audición)"
                    id="tamizajesNeonatales"
                    name="tamizajesNeonatales"
                    value={formData.tamizajesNeonatales || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Inmunizaciones / Vacunas"
                    id="inmunizaciones"
                    name="inmunizaciones"
                    value={formData.inmunizaciones || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Alimentacion Actual"
                    id="alimentacionActual"
                    name="alimentacionActual"
                    value={formData.alimentacionActual || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia de Tomas / Comidas"
                    id="frecuenciaAlimentacion"
                    name="frecuenciaAlimentacion"
                    value={formData.frecuenciaAlimentacion || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="acopleSuccion" className="block text-sm font-medium text-slate-700">Acople y Succión al Pecho:</label>
                  <select
                    id="acopleSuccion"
                    name="acopleSuccion"
                    value={formData.acopleSuccion || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Adecuados">Adecuados</option><option value="Dificultades">Dificultades</option><option value="No aplica">No aplica</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="dolorAmamantar" className="block text-sm font-medium text-slate-700">Dolor al Amamantar:</label>
                  <select
                    id="dolorAmamantar"
                    name="dolorAmamantar"
                    value={formData.dolorAmamantar || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No">No</option><option value="Sí">Sí</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="grietas" className="block text-sm font-medium text-slate-700">Presencia de Grietas en Pezón:</label>
                  <select
                    id="grietas"
                    name="grietas"
                    value={formData.grietas || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No">No</option><option value="Sí">Sí</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="produccionLactea" className="block text-sm font-medium text-slate-700">Percepción de Producción Láctea:</label>
                  <select
                    id="produccionLactea"
                    name="produccionLactea"
                    value={formData.produccionLactea || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Suficiente / Adecuada">Suficiente / Adecuada</option><option value="Insuficiente">Insuficiente</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Número de Pañales Mojados al Día"
                    id="diuresisPañalesDia"
                    name="diuresisPañalesDia"
                    value={formData.diuresisPañalesDia || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia y Aspecto de Deposiciones"
                    id="deposicionesDia"
                    name="deposicionesDia"
                    value={formData.deposicionesDia || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Regurgitación o Vómitos"
                    id="regurgitacionVomitos"
                    name="regurgitacionVomitos"
                    value={formData.regurgitacionVomitos || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Patrón y Calidad del Sueño"
                    id="suenoPatron"
                    name="suenoPatron"
                    value={formData.suenoPatron || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="lugarSueno" className="block text-sm font-medium text-slate-700">Lugar para Dormir:</label>
                  <select
                    id="lugarSueno"
                    name="lugarSueno"
                    value={formData.lugarSueno || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Cuna propia">Cuna propia</option><option value="Cama propia">Cama propia</option><option value="Cama de padres">Cama de padres</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="posicionSueno" className="block text-sm font-medium text-slate-700">Posición al Dormir:</label>
                  <select
                    id="posicionSueno"
                    name="posicionSueno"
                    value={formData.posicionSueno || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Decúbito supino (espalda)">Decúbito supino (espalda)</option><option value="Decúbito lateral">Decúbito lateral</option><option value="Decúbito prono (boca abajo)">Decúbito prono (boca abajo)</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Estado General de la Madre"
                    id="madreEstadoGeneral"
                    name="madreEstadoGeneral"
                    value={formData.madreEstadoGeneral || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Ánimo Materno / Vínculo"
                    id="madreAnimo"
                    name="madreAnimo"
                    value={formData.madreAnimo || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Molestias Fisiológicas o Dolor Materno"
                    id="madreDolorSangrado"
                    name="madreDolorSangrado"
                    value={formData.madreDolorSangrado || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Redes de Apoyo Familiar y Social"
                    id="redApoyo"
                    name="redApoyo"
                    value={formData.redApoyo || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="participacionPadre" className="block text-sm font-medium text-slate-700">Participación Activa del Padre o Cuidador:</label>
                  <select
                    id="participacionPadre"
                    name="participacionPadre"
                    value={formData.participacionPadre || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Activa">Activa</option><option value="Parcial">Parcial</option><option value="Ausente">Ausente</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Riesgo Biopsicosocial Identificado"
                    id="factoresRiesgoBiopsicosocial"
                    name="factoresRiesgoBiopsicosocial"
                    value={formData.factoresRiesgoBiopsicosocial || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Dudas o Preocupaciones Expresadas por la Familia"
                    id="dudasFamiliares"
                    name="dudasFamiliares"
                    value={formData.dudasFamiliares || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="scoreRiesgoNeumonia" className="block text-sm font-medium text-slate-700">Score Riesgo Neumonía Ira/Era:</label>
                  <select
                    id="scoreRiesgoNeumonia"
                    name="scoreRiesgoNeumonia"
                    value={formData.scoreRiesgoNeumonia || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Bajo riesgo">Bajo riesgo</option><option value="Riesgo moderado">Riesgo moderado</option><option value="Alto riesgo">Alto riesgo</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="pautaRiesgoBiopsicosocial" className="block text-sm font-medium text-slate-700">Pauta de Riesgo Biopsicosocial:</label>
                  <select
                    id="pautaRiesgoBiopsicosocial"
                    name="pautaRiesgoBiopsicosocial"
                    value={formData.pautaRiesgoBiopsicosocial || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sin riesgo">Sin riesgo</option><option value="Con riesgo psicosocial">Con riesgo psicosocial</option>
                  </select>
                </div>
                </div>
              </section>
            )}

            {/* SECCIÓN ANTROPOMETRÍA Y SIGNOS VITALES */}
            {true && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Parámetros Clínicos y Antropometría</h3>
                <div className="flex flex-col gap-3">
                  
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="diagnosticoNutricional" className="block text-sm font-medium text-slate-700">Diagnóstico Nutricional Integrado:</label>
                  <select
                    id="diagnosticoNutricional"
                    name="diagnosticoNutricional"
                    value={formData.diagnosticoNutricional || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Eutrófico/a">Eutrófico/a</option><option value="Riesgo de desnutrición">Riesgo de desnutrición</option><option value="Desnutrido/a">Desnutrido/a</option><option value="Sobrepeso">Sobrepeso</option><option value="Obesidad">Obesidad</option>
                  </select>
                </div>
                </div>
              </section>
            )}

            {/* SECCIÓN EXAMEN FÍSICO */}
            {true && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Examen Físico Segmentario</h3>
                <div className="flex flex-col gap-3">
                  
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Peso Actual Registrado (g / kg)"
                    id="efPesoActual"
                    name="efPesoActual"
                    value={formData.efPesoActual || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Variación % respecto a Peso Nacimiento"
                    id="efVariacionPesoNacimiento"
                    name="efVariacionPesoNacimiento"
                    value={formData.efVariacionPesoNacimiento || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Talla Medida (cm)"
                    id="efTalla"
                    name="efTalla"
                    value={formData.efTalla || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Perímetro Cefálico Medido (cm)"
                    id="efPerimetroCefalico"
                    name="efPerimetroCefalico"
                    value={formData.efPerimetroCefalico || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Examen Físico General"
                    id="efEstadoGeneral"
                    name="efEstadoGeneral"
                    value={formData.efEstadoGeneral || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="efPielIctericia" className="block text-sm font-medium text-slate-700">Ictericia Cutánea:</label>
                  <select
                    id="efPielIctericia"
                    name="efPielIctericia"
                    value={formData.efPielIctericia || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No">No</option><option value="Sí (Zona I-V)">Sí (Zona I-V)</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="efPielCianosis" className="block text-sm font-medium text-slate-700">Cianosis:</label>
                  <select
                    id="efPielCianosis"
                    name="efPielCianosis"
                    value={formData.efPielCianosis || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No">No</option><option value="Central">Central</option><option value="Periférica">Periférica</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Lesiones Cutáneas / Marcas de Nacimiento"
                    id="efPielLesiones"
                    name="efPielLesiones"
                    value={formData.efPielLesiones || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Cráneo y Fontanelas"
                    id="efCabezaFontanela"
                    name="efCabezaFontanela"
                    value={formData.efCabezaFontanela || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="efOjosReflejoRojo" className="block text-sm font-medium text-slate-700">Reflejo Rojo Pupilar:</label>
                  <select
                    id="efOjosReflejoRojo"
                    name="efOjosReflejoRojo"
                    value={formData.efOjosReflejoRojo || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Presente bilateral">Presente bilateral</option><option value="Alterado / Ausente">Alterado / Ausente</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Cavidad Oral, Mucosas y Paladar"
                    id="efBocaPaladar"
                    name="efBocaPaladar"
                    value={formData.efBocaPaladar || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Cuello y Clavículas"
                    id="efCuelloClaviculas"
                    name="efCuelloClaviculas"
                    value={formData.efCuelloClaviculas || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia Cardíaca Medida (lpm)"
                    id="efFc"
                    name="efFc"
                    value={formData.efFc || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia Respiratoria Medida (rpm)"
                    id="efFr"
                    name="efFr"
                    value={formData.efFr || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Examen Cardiovascular"
                    id="efCardiovascular"
                    name="efCardiovascular"
                    value={formData.efCardiovascular || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Examen Pulmonar"
                    id="efPulmonar"
                    name="efPulmonar"
                    value={formData.efPulmonar || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Abdomen y Cordón Umbilical"
                    id="efAbdomenOmbligo"
                    name="efAbdomenOmbligo"
                    value={formData.efAbdomenOmbligo || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Genitales Externos y Permeabilidad Anal"
                    id="efGenitalesAno"
                    name="efGenitalesAno"
                    value={formData.efGenitalesAno || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="efCaderasOrtolaniBarlow" className="block text-sm font-medium text-slate-700">Evaluación de Caderas (Ortolani / Barlow):</label>
                  <select
                    id="efCaderasOrtolaniBarlow"
                    name="efCaderasOrtolaniBarlow"
                    value={formData.efCaderasOrtolaniBarlow || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Ortolani y Barlow negativos">Ortolani y Barlow negativos</option><option value="Ortolani positivo">Ortolani positivo</option><option value="Barlow positivo">Barlow positivo</option><option value="Limitación abducción">Limitación abducción</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Extremidades y Movilidad"
                    id="efExtremidades"
                    name="efExtremidades"
                    value={formData.efExtremidades || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Tono Muscular y Reflejos"
                    id="efNeurologicoTono"
                    name="efNeurologicoTono"
                    value={formData.efNeurologicoTono || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                </div>
              </section>
            )}

            {/* SECCIÓN ACTUACIÓN E INDICACIONES */}
            {true && (
              <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
                <h3 className="text-lg font-semibold mb-1 text-sky-700 border-b border-sky-200 pb-2">Actuación, Diagnósticos e Indicaciones</h3>
                <div className="flex flex-col gap-3">
                  
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Diagnóstico Principal"
                    id="diagnostico1"
                    name="diagnostico1"
                    value={formData.diagnostico1 || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Diagnóstico Nutricional de Lactancia/Dieta"
                    id="diagnosticoAlimentacion"
                    name="diagnosticoAlimentacion"
                    value={formData.diagnosticoAlimentacion || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Diagnóstico de Riesgo Biopsicosocial"
                    id="diagnosticoBiopsicosocial"
                    name="diagnosticoBiopsicosocial"
                    value={formData.diagnosticoBiopsicosocial || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Indicaciones e Indicadores de Alarma"
                    id="indicaciones"
                    name="indicaciones"
                    value={formData.indicaciones || ''}
                    onChange={handleChange}
                    isTextArea
                    rows={4}
                    inputClassName="text-slate-700 font-mono text-xs"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Programación de Próximo Control"
                    id="proximoControl"
                    name="proximoControl"
                    value={formData.proximoControl || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-slate-200 bg-white rounded-xl shadow-sm mt-2">
              <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs uppercase tracking-widest cursor-pointer">
                Volver al Menú
              </button>
              <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all uppercase text-xs tracking-widest cursor-pointer">
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
                <textarea value={isUppercase ? anamnesisText.toUpperCase() : anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">EXPLORACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={isUppercase ? exploracionText.toUpperCase() : exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">ACTUACIÓN</label>
                  <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                </div>
                <textarea value={isUppercase ? actuacionText.toUpperCase() : actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                <div className="pt-2 mt-1 border-t border-slate-200/80 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleNewDocument}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                    id="btn-borrar-todo-right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    BORRAR TODO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default fichaControlNinoSanoRN;
