import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = {
  "edad": "12 meses (1 año)",
  "acompanante": "",
  "parentesco": "",
  "profesional": "Enfermero/a – Médico/a",
  "enfermedadesUltimoControl": "Niega.",
  "urgenciasHospitalizaciones": "Niega.",
  "medicamentos": "Niega.",
  "alergias": "Niega.",
  "vacunas": "Al día (corresponden vacunas de los 12 meses: Tres Vírica, Meningocócica, Neumocócica).",
  "tipoAlimentacion": "Alimentación familiar + Lactancia / Leche Purita Fortificada / Fórmula",
  "incorporacionMesaFamiliar": "Sí, 3-4 comidas diarias",
  "consumoAguaYBebidas": "Agua pura. Niega bebidas azucaradas",
  "diuresis": "Conservada.",
  "deposiciones": "Conservadas.",
  "suenoHoras": "12-14 horas/día",
  "bipedestacionYMarcha": "Bipedestación con apoyo / Pasos independientes",
  "pinzaFina": "Sí (pinza fina lograda)",
  "primerasPalabrasConSignificado": "Sí (2 a 3 palabras con significado además de mamá/papá)",
  "comprendeOrdenesSimples": "Sí (ej. \"dame\", \"mira\")",
  "juegoInteractivo": "Imita gestos (chao, aplaude)",
  "peso": "",
  "talla": "",
  "perimetroCefalico": "",
  "peZ": "",
  "teZ": "",
  "ptZ": "",
  "diagnosticoNutricional": "Eutrófico/a",
  "diagnosticoTalla": "Talla normal",
  "pa": "",
  "fc": "",
  "fr": "",
  "efGeneral": "Buen estado general, activo, colaborador.",
  "efPiel": "Normal, sin lesiones.",
  "efDenticion": "Incisivos superiores e inferiores presentes (4 a 8 dientes).",
  "efCardiopulmonar": "RR2T sin soplos, MP (+) simétrico.",
  "efAbdomen": "Blando, depresible, indoloro.",
  "efGenitales": "Normoconfigurados.",
  "efMarchaBipedestacion": "Bipedestación estable, marcha inicial.",
  "evaluacionEDP": "EDP 12 meses aplicado - Normal",
  "evaluacionEEDP": "Pauta EEDP aplicada al año de vida",
  "diagnosticos": "1. Lactante mayor de 12 meses en control de salud infantil.\n2. Estado nutricional: Eutrófico/a.\n3. Talla: Normal.\n4. Desarrollo psicomotor (EEDP): Normal.\n5. Salud bucal: En desarrollo, cepillado al día.",
  "indicaciones": "- Integrar progresivamente a la dieta familiar saludable (sin sal ni azúcar añadidos).\n- Transición a taza o vaso de aprendizaje; desestimular el uso de mamadera.\n- Mantener lactancia materna si la díada lo desea o leche Purita Fortificada 26% / leche entera según pauta.\n- Suspender suplementación de vitaminas ACD al cumplir 12 meses si la dieta es variada y hay exposición solar segura.\n- Administrar vacunas del 1° año.\n- Cepillado dental obligatorio noche y mañana con pasta fluorada (1000 ppm, tamaño granito de arroz).\n- Fomentar la lectura de cuentos, nombrar objetos y estimular el lenguaje.\n- Próximo control: 18 meses con enfermera.",
  "proximoControl": "18° mes con enfermera"
};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const fichaControlNinoSano12Meses: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('local_fichaControlNinoSano12Meses', initialFormData);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = `CONTROL DE SALUD INFANTIL – 12 MESES (1 AÑO)\n---------------------------------------\nFECHA CONTROL: ${todayStr}\nPROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || 'Profesional de Salud'}\n---------------------------------------\n\nANAMNESIS:\n`;
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
                    label="Enfermedades desde Último Control"
                    id="enfermedadesUltimoControl"
                    name="enfermedadesUltimoControl"
                    value={formData.enfermedadesUltimoControl || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Consultas de Urgencia / Hospitalizaciones"
                    id="urgenciasHospitalizaciones"
                    name="urgenciasHospitalizaciones"
                    value={formData.urgenciasHospitalizaciones || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Medicamentos en Uso"
                    id="medicamentos"
                    name="medicamentos"
                    value={formData.medicamentos || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Alergias Conocidas"
                    id="alergias"
                    name="alergias"
                    value={formData.alergias || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="vacunas" className="block text-sm font-medium text-slate-700">Inmunizaciones / Vacunas Al Día:</label>
                  <select
                    id="vacunas"
                    name="vacunas"
                    value={formData.vacunas || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Al día">Al día</option><option value="Pendientes">Pendientes</option><option value="En regla">En regla</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="tipoAlimentacion" className="block text-sm font-medium text-slate-700">Tipo de Alimentación Actual:</label>
                  <select
                    id="tipoAlimentacion"
                    name="tipoAlimentacion"
                    value={formData.tipoAlimentacion || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Lactancia materna exclusiva">Lactancia materna exclusiva</option><option value="Lactancia mixta">Lactancia mixta</option><option value="Fórmula láctea">Fórmula láctea</option><option value="Alimentación familiar + Lactancia">Alimentación familiar + Lactancia</option><option value="Alimentación familiar completa">Alimentación familiar completa</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="incorporacionMesaFamiliar" className="block text-sm font-medium text-slate-700">Incorporación a la Mesa Familiar:</label>
                  <select
                    id="incorporacionMesaFamiliar"
                    name="incorporacionMesaFamiliar"
                    value={formData.incorporacionMesaFamiliar || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="En proceso">En proceso</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Ingesta de Líquidos (Agua / Bebidas / Jugos)"
                    id="consumoAguaYBebidas"
                    name="consumoAguaYBebidas"
                    value={formData.consumoAguaYBebidas || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Diuresis / Hábito Miccional"
                    id="diuresis"
                    name="diuresis"
                    value={formData.diuresis || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Deposiciones / Hábito Intestinal"
                    id="deposiciones"
                    name="deposiciones"
                    value={formData.deposiciones || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Horas Diarias de Sueño"
                    id="suenoHoras"
                    name="suenoHoras"
                    value={formData.suenoHoras || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="bipedestacionYMarcha" className="block text-sm font-medium text-slate-700">Bipedestación y Marcha:</label>
                  <select
                    id="bipedestacionYMarcha"
                    name="bipedestacionYMarcha"
                    value={formData.bipedestacionYMarcha || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Marcha independiente">Marcha independiente</option><option value="Bipedestación con apoyo">Bipedestación con apoyo</option><option value="Bipedestación inicial">Bipedestación inicial</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="pinzaFina" className="block text-sm font-medium text-slate-700">Logro de Pinza Fina:</label>
                  <select
                    id="pinzaFina"
                    name="pinzaFina"
                    value={formData.pinzaFina || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="primerasPalabrasConSignificado" className="block text-sm font-medium text-slate-700">Primeras Palabras con Significado:</label>
                  <select
                    id="primerasPalabrasConSignificado"
                    name="primerasPalabrasConSignificado"
                    value={formData.primerasPalabrasConSignificado || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí (2-3 palabras)">Sí (2-3 palabras)</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="comprendeOrdenesSimples" className="block text-sm font-medium text-slate-700">Comprende Órdenes Sencillas:</label>
                  <select
                    id="comprendeOrdenesSimples"
                    name="comprendeOrdenesSimples"
                    value={formData.comprendeOrdenesSimples || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="juegoInteractivo" className="block text-sm font-medium text-slate-700">Juego Interactivo (Imita gestos/aplaude):</label>
                  <select
                    id="juegoInteractivo"
                    name="juegoInteractivo"
                    value={formData.juegoInteractivo || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Evaluación EDP / EEDP"
                    id="evaluacionEDP"
                    name="evaluacionEDP"
                    value={formData.evaluacionEDP || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Evaluación EEDP Al Año"
                    id="evaluacionEEDP"
                    name="evaluacionEEDP"
                    value={formData.evaluacionEEDP || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
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
                  <FormField
                    label="Peso (kg)"
                    id="peso"
                    name="peso"
                    value={formData.peso || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Talla (cm)"
                    id="talla"
                    name="talla"
                    value={formData.talla || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Perímetro Cefálico (cm)"
                    id="perimetroCefalico"
                    name="perimetroCefalico"
                    value={formData.perimetroCefalico || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="P/E Puntuación Z"
                    id="peZ"
                    name="peZ"
                    value={formData.peZ || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="T/E Puntuación Z"
                    id="teZ"
                    name="teZ"
                    value={formData.teZ || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="P/T Puntuación Z"
                    id="ptZ"
                    name="ptZ"
                    value={formData.ptZ || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
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
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="diagnosticoTalla" className="block text-sm font-medium text-slate-700">Diagnóstico de Talla:</label>
                  <select
                    id="diagnosticoTalla"
                    name="diagnosticoTalla"
                    value={formData.diagnosticoTalla || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Talla normal">Talla normal</option><option value="Talla baja">Talla baja</option><option value="Riesgo de talla baja">Riesgo de talla baja</option><option value="Talla alta">Talla alta</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Presión Arterial (PA mmHg)"
                    id="pa"
                    name="pa"
                    value={formData.pa || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia Cardíaca (FC lpm)"
                    id="fc"
                    name="fc"
                    value={formData.fc || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Frecuencia Respiratoria (FR rpm)"
                    id="fr"
                    name="fr"
                    value={formData.fr || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
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
                    label="Ef General"
                    id="efGeneral"
                    name="efGeneral"
                    value={formData.efGeneral || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Estado de la Piel"
                    id="efPiel"
                    name="efPiel"
                    value={formData.efPiel || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Estado de Dentición / Caries"
                    id="efDenticion"
                    name="efDenticion"
                    value={formData.efDenticion || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Examen Cardiopulmonar"
                    id="efCardiopulmonar"
                    name="efCardiopulmonar"
                    value={formData.efCardiopulmonar || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Examen de Abdomen"
                    id="efAbdomen"
                    name="efAbdomen"
                    value={formData.efAbdomen || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Genitales Externos"
                    id="efGenitales"
                    name="efGenitales"
                    value={formData.efGenitales || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Ef Marcha Bipedestacion"
                    id="efMarchaBipedestacion"
                    name="efMarchaBipedestacion"
                    value={formData.efMarchaBipedestacion || ''}
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
                    label="Diagnósticos Clínicos Integrados"
                    id="diagnosticos"
                    name="diagnosticos"
                    value={formData.diagnosticos || ''}
                    onChange={handleChange}
                    isTextArea
                    rows={4}
                    inputClassName="text-slate-700 font-mono text-xs"
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

export default fichaControlNinoSano12Meses;
