import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData = {
  "edad": "2 años",
  "acompanante": "",
  "parentesco": "",
  "profesional": "Enfermero/a – Médico/a",
  "enfermedadesUltimoControl": "Niega.",
  "urgenciasHospitalizaciones": "Niega.",
  "medicamentos": "Niega.",
  "alergias": "Niega.",
  "vacunas": "Al día.",
  "tipoAlimentacion": "Dieta familiar completa (4 comidas al día)",
  "consumoLacteos": "2-3 porciones de lácteos al día",
  "habitoMiccionalControlEsfinteer": "Inicio de interés / Sin control aún",
  "habitoDeposicional": "Normal.",
  "suenoHoras": "11-12 horas/día (sueño nocturno + 1 siesta)",
  "combinaDosPalabras": "Sí (frases de 2 palabras ej. \"más leche\", \"vamos afuera\")",
  "correYPateaPelota": "Sí",
  "subeEscalerasConApoyo": "Sí",
  "copiaLineaVertical": "Sí / Garabatea espontáneamente",
  "autonomiaAlimentacion": "Come solo/a con cuchara",
  "pantallasHorasDia": "< 1 hora / Niega",
  "peso": "",
  "talla": "",
  "imc": "",
  "imcz": "",
  "tez": "",
  "diagnosticoNutricional": "Eutrófico/a",
  "diagnosticoTalla": "Talla normal",
  "pa": "",
  "fc": "",
  "fr": "",
  "efGeneral": "Buen estado general, activo/a, lenguaje comprensible.",
  "efDenticion": "Dentición temporal completa o en fase final de molares (20 piezas).",
  "efCardiopulmonar": "RR2T sin soplos, MP (+) bilateral.",
  "efAbdomen": "Blando, depresible, indoloro.",
  "efGenitales": "Normoconfigurados.",
  "efColumnaPies": "Pie plano fisiológico del lactante/preescolar.",
  "efMarcha": "Marcha y carrera armónica.",
  "evaluacionTEPSI": "Evaluación de desarrollo a los 2 años normal",
  "diagnosticos": "1. Preescolar de 2 años en control de salud infantil.\n2. Estado nutricional: Eutrófico/a.\n3. Talla: Normal.\n4. Desarrollo lenguaje y motor adecuado.\n5. Salud oral: Dentición temporal en buenas condiciones.",
  "indicaciones": "- Mantener alimentación saludable en familia. Evitar azúcares añadidos y ultraprocesados.\n- Fomentar la autonomía en el comer, vestirse y lavarse las manos.\n- Cepillado dental supervisado por un adulto 2 veces al día con pasta de 1000 a 1450 ppm de flúor (cantidad tamaño arveja).\n- Control odontológico infantil de rutina.\n- Fomentar el juego al aire libre y actividad física diaria.\n- Limitar pantallas a máximo 1 hora al día de contenido de calidad y acompañado.\n- Iniciar educación sobre control de esfínteres sin presiones cuando el niño/a muestre señales de madurez.\n- Próximo control: 3 años con médico/a.",
  "proximoControl": "3 años con médico/a"
};

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const fichaControlNinoSano2Anos: React.FC<Props> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage('local_fichaControlNinoSano2Anos', initialFormData);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  const generateSummaryParts = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('es-ES');
    let anamnesis = `CONTROL DE SALUD INFANTIL – 2 AÑOS (24 MESES)\n---------------------------------------\nFECHA CONTROL: ${todayStr}\nPROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || 'Profesional de Salud'}\n---------------------------------------\n\nANAMNESIS:\n`;
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
                  <FormField
                    label="Porciones Diarias de Lácteos"
                    id="consumoLacteos"
                    name="consumoLacteos"
                    value={formData.consumoLacteos || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="habitoMiccionalControlEsfinteer" className="block text-sm font-medium text-slate-700">Control de Esfínter Anal / Vesical:</label>
                  <select
                    id="habitoMiccionalControlEsfinteer"
                    name="habitoMiccionalControlEsfinteer"
                    value={formData.habitoMiccionalControlEsfinteer || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="No iniciado">No iniciado</option><option value="En proceso">En proceso</option><option value="Logrado diurno">Logrado diurno</option><option value="Logrado completo">Logrado completo</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Hábito Deposicional"
                    id="habitoDeposicional"
                    name="habitoDeposicional"
                    value={formData.habitoDeposicional || ''}
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
                  <label htmlFor="combinaDosPalabras" className="block text-sm font-medium text-slate-700">Combina 2 o Más Palabras en Frases:</label>
                  <select
                    id="combinaDosPalabras"
                    name="combinaDosPalabras"
                    value={formData.combinaDosPalabras || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="correYPateaPelota" className="block text-sm font-medium text-slate-700">Corre y Patea una Pelota:</label>
                  <select
                    id="correYPateaPelota"
                    name="correYPateaPelota"
                    value={formData.correYPateaPelota || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="subeEscalerasConApoyo" className="block text-sm font-medium text-slate-700">Sube Escaleras con Apoyo:</label>
                  <select
                    id="subeEscalerasConApoyo"
                    name="subeEscalerasConApoyo"
                    value={formData.subeEscalerasConApoyo || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="copiaLineaVertical" className="block text-sm font-medium text-slate-700">Copia Línea Vertical / Garabatea:</label>
                  <select
                    id="copiaLineaVertical"
                    name="copiaLineaVertical"
                    value={formData.copiaLineaVertical || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="No">No</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="autonomiaAlimentacion" className="block text-sm font-medium text-slate-700">Autonomía en Alimentación:</label>
                  <select
                    id="autonomiaAlimentacion"
                    name="autonomiaAlimentacion"
                    value={formData.autonomiaAlimentacion || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí</option><option value="Requiere ayuda">Requiere ayuda</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <label htmlFor="pantallasHorasDia" className="block text-sm font-medium text-slate-700">Tiempo Diario Exposición a Pantallas:</label>
                  <select
                    id="pantallasHorasDia"
                    name="pantallasHorasDia"
                    value={formData.pantallasHorasDia || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none h-[42px]"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Menos de 1 hora/día">Menos de 1 hora/día</option><option value="1 a 2 horas/día">1 a 2 horas/día</option><option value="Más de 2 horas/día">Más de 2 horas/día</option><option value="Sin pantallas">Sin pantallas</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Evaluación TEPSI"
                    id="evaluacionTEPSI"
                    name="evaluacionTEPSI"
                    value={formData.evaluacionTEPSI || ''}
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
                    label="Índice de Masa Corporal (IMC kg/m²)"
                    id="imc"
                    name="imc"
                    value={formData.imc || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="IMC/E Puntuación Z"
                    id="imcz"
                    name="imcz"
                    value={formData.imcz || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="T/E Puntuación Z"
                    id="tez"
                    name="tez"
                    value={formData.tez || ''}
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
                    label="Columna y Estructura de Pies"
                    id="efColumnaPies"
                    name="efColumnaPies"
                    value={formData.efColumnaPies || ''}
                    onChange={handleChange}
                    inputClassName="text-slate-700"
                  />
                </div>
                <div className="w-full flex flex-col gap-1.5">
                  <FormField
                    label="Ef Marcha"
                    id="efMarcha"
                    name="efMarcha"
                    value={formData.efMarcha || ''}
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

export default fichaControlNinoSano2Anos;
