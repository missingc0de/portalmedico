import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlNinoSanoFormData, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const indicacionesPorEdadData = {
  '1-2 meses': "- Cuidados generales: baño, piel, corte de uñas, muda.\n- Aseo bucal.\n- LME libre demanda o en el caso de fórmula de inicio dejar estipuladas las dosis.\n- Cuidado de los pezones.\n- Retiro de leche purita mamá.\n- Retiro de vitaminas ACD 10 gotas/día por VO.\n- Prevención de enfermedades respiratorias.\n- Prevención de accidentes.\n- Orden radiografía de caderas (2 meses).\n- Se deriva a vacuna 2 meses. Cuidados post vacuna (2 - 3 gotas de paracetamol/kg./ 8 horas (según indicación médica) en caso de fiebre, compresas tibias en el sitio de punción). Sugerir tetanalgesia.\n- Estimulación del DSM.\n- Entrega de guías anticipatorias para menores de 1 año.\n- Revisar si en control de 1 mes con medico se aplicó pauta neurosensorial, en caso no figurar formulario enfermera/o deberá aplicar instrumento.\n- Próximo control con: 2 meses con enfermera.",
  '4 meses': "- Cuidados generales: baño, piel, corte de uñas, muda.\n- Aseo bucal.\n- LME c/4 horas día y noche o en el caso de fórmula de inicio dejar estipuladas las dosis.\n- Retiro leche purita mamá.\n- Retiro vitaminas ACD 10 gotas/día por VO.\n- Retiro sulfato ferroso 1 gota/kg./día (solo si se mantiene LME, en caso de no haber sido indicado por médico, gestionar receta).\n- Estimulación del DSM.\n- Prevención de diarreas por dentición.\n- Derivo a vacuna 4 meses. Cuidados post vacuna (2 - 3 gotas de paracetamol/kg. / 8 horas en caso de fiebre, compresas tibias en el sitio de punción).\n- Entrega de guias anticipatorias para menores de 1 año.\n- Entrega de material Chcc.\n- Próximo control: nutricionista 5to mes y enfermera 6 meses.\n- Control según resultado instrumento reevaluar (flujograma pauta breve).",
  '6 meses': "- Cuidados generales: baño, piel, corte de uñas, muda.\n- Aseo bucal.\n- LM 4 veces/día + 1 comida (puré de carne con verduras + puré de frutas). O en el caso de fórmula de inicio dejar estipuladas las dosis.\n- Retiro vitaminas ACD 10 gotas/día.\n- Derivo a vacuna 6 meses. Cuidados post vacuna (2 - 3 gotas de paracetamol/kg./ 8 horas en caso de fiebre (según indicación medica), compresas tibias en el sitio de punción).\n- No comprar/usar andador, uso de corral para permitir desarrollo motor autónomo del lactante.\n- Prevención de accidentes.\n- Estimulación del DSM.\n- Entrega leche purita fortificada.\n- Entrega de guías anticipatorias para menores de 1 año.\n- Próximo control: enfermera 8 meses EEDP.",
  '8 meses': "- Cuidados generales: baño, piel, corte de uñas, muda.\n- Aseo bucal.\n- LM 3 veces/día + 2 comida (11-12, 19-20 horas: puré de verduras con agregado de los distintos tipos de carnes + puré de frutas). Inicio de cena o LPF. Inicio del consumo de legumbres.\n- Retiro vitaminas ACD 10 gotas/día.\n- Estimulación del DSM.\n- No comprar/usar andador, uso de corral para permitir desarrollo motor autónomo del lactante.\n- Prevención de accidentes en el hogar.\n- Entrega leche purita fortificada.\n- Entrega de guías anticipatorias para menores de 1 año.\n- Próximo control: enfermera 12 meses.\n- Derivar según resultado EEDP (flujograma EEDP).",
  '12 meses': "- Cuidados generales: baño, piel, corte de uñas, muda.\n- LM 3 veces/día + 2 comida (- 11-12, 19-20 horas: picada y molida con tenedor, verduras con agregado de los distintos tipos de carnes) + molido o picado de frutas). ÎŸ LPF.\n- Derivo a vacuna 12 meses. Cuidados post vacuna (2 - 3 gotas de paracetamol/kg./8 horas en caso de fiebre (según indicación medica), compresas tibias en el sitio de punción).\n- Estimulación del DSM.\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Prevención de accidentes en el hogar (escalera, balcones, cocina, baño, recipientes con agua caliente).\n- No comprar/usar andador, uso de corral para permitir desarrollo motor autónomo del lactante.\n- Entrega leche purita fortificada.\n- Entrega material Chcc.\n- Entrega guías anticipatorias para mayores de 1 año.\n- Próximo control:\n- Taller normas de crianza y límites\n- Control enfermera 1 año 6 meses EEDP\n- Derivar según resultado pauta breve (flujograma)",
  '1 año 6 meses': "- LM 3 veces/día + 2 comida (11-12, 19-20 horas: picada (mas entera) con tenedor, verduras con agregado de los distintos tipos de carnes con fideos, sémola, mote o arroz + frutas). O LPC se suspende leche de la noche.\n- Comenzar el entrenamiento para dejar los pañales, control de esfinter (sugerir).\n- Estimulación del DSM.\n- Derivo a vacuna 18 meses. Cuidados post vacuna (2 - 3 gotas de paracetamol/kg./ 8 horas en caso de fiebre (según indicación medica), compresas tibias en el sitio de punción).\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Prevención de accidentes en el hogar (escaleras, balcones, baño, cocina, recipientes con agua caliente).\n- Prevención de abusos sexuales.\n- Entrega leche purita cereal.\n- Entrega de guías anticipatoria mayores de 1 año.\n- Próximo control: enfermera 2 años.\n- Derivación según resultado de EEDP (sala estimulación según flujograma).",
  '2 años': "- LA 3 veces/día + 2 comida (11-12, 19-20 horas: picada (mas entera) con tenedor, verduras con agregado de los distintos tipos de carnes (evitar el cerdo) con fideos, sémola, mote o arroz + frutas).\n- Restringir consumo de dulces.\n- Eliminar uso de chupete (en caso que lo utilice).\n- Promover el control de esfínter.\n- Estimulación del DSM.\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Ejercicios para la formación del arco plantar.\n- Prevención de accidentes en el hogar.\n- Prevención de abusos sexuales.\n- Entrega leche purita cereal.\n- Normas de crianza y límites.\n- Estimular ingreso a jardín infantil.\n- Entrega de set Chcc.\n- Próximo control: TEPSI con enfermera 3 años.\n- Derivar según resultado pauta breve (flujograma).",
  '3 años': "- LA 3 veces/día + 2 comida (11-12, 19-20 horas: picada (mas entera) con tenedor, verduras con agregado de los distintos tipos de carnes (evitar el cerdo) con fideos, sémola, mote o arroz + frutas).\n- Restringir consumo de dulces.\n- Eliminar uso de chupete (en caso que lo utilice).\n- Promover el control de esfínter.\n- Estimulación del DSM.\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Ejercicios para la formación del arco plantar.\n- Prevención de accidentes en el hogar.\n- Prevención de abusos sexuales.\n- Entrega leche purita cereal.\n- Normas de crianza y límites.\n- Estimular ingreso a jardín infantil.\n- Entrega de set Chcc.\n- Próximo control: enfermera 4 años.\n- Derivar según resultado pauta breve (flujograma).",
  '4 años': "- LA 3 veces/día + 2 comida.\n- Restringir consumo de dulces.\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Prevención de accidentes en el hogar (escaleras, balcones, baño, cocina, recipientes con agua caliente).\n- Prevención de abusos sexuales.\n- Normas de crianza y límites.\n- Entrega de material Chcc.\n- Entrega de guías anticipatorias para mayores de 1 año.\n- Próximo control: enfermera 5 años.",
  '5-7-8-9 años': "- LA 3 veces/día + 2 comida.\n- Restringir consumo de dulces.\n- Hábitos de higiene (lavado de dientes, lavado de manos, baño).\n- Obediencia.\n- Prevención de accidentes en el hogar (escaleras, balcones, baño, cocina, recipientes con agua caliente).\n- Prevención de abusos sexuales.\n- Restringir consumo de dulces.\n- Entrega de guías anticipatorias para mayores de 1 año.\n- Próximo control: 6 años con medico.\n- Posterior al control con médico, los siguientes controles corresponden a enfermería hasta los 9 años en el cual la enfermera realiza egreso del programa y deriva a control adolescente."
};

const initialFormData: FichaControlNinoSanoFormData = {
  fechaControl: new Date().toISOString().split('T')[0],
  edadCorregidaCronologica: '',
  naneas: false,
  naneasPatologia: '',
  grupoEtario: '',
  acompanadoPor: '',
  acompanadoPorOtros: '',
  estadoGeneral: 'Sin alteraciones.',
  consultasPreviasUrgencia: 'Niega.',
  viveCon: '',
  trabajoPadresCuidador: '',
  antecedentesFamiliaresECNT: 'Niega.',
  antecedentesMorbidosAlergicos: 'Niega.',
  antecedentesQuirurgicosHospitalizacion: 'Niega.',
  asisteA: '',
  asisteAOtro: '',
  tipoAlimentacion: '',
  tipoAlimentacionAclaracion: '',
  numComidasDiarias: '',
  eliminacion: 'Micción normal, diuresis sin mal olor. Deposiciones X veces al día.',
  higieneCorporal: 'Baño completo todos los días/ día por medio. Aseo corporal diario.',
  higieneBucal: 'Después de cada comida con...',
  reposoSueno: '',
  medicamentosSuplementos: '- Vitaminas ACD 20 gotas/día.\n- Sulfato Ferroso X gotas/día.',
  vacunasAlDia: true,
  esquemaIncompleto: false,
  esquemaIncompletoDetalle: '',
  dsmResultado: '',
  asisteSet: false,
  usoMacMadre: false,
  usoMacMadreAclaracion: '',
  resultadoEdimburgo: '',
  resultadoScoreIRA: '',
  resultadoMalnutricionExceso: '',
  resultadoPautaSeguridadInfantil: '',
  telefonoContacto: '',
  edadIndicaciones: '',
  indicacionesPorEdad: '',
};

interface FichaControlNinoSanoProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlNinoSano: React.FC<FichaControlNinoSanoProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlNinoSanoFormData>('local_FichaControlNinoSano', initialFormData);
    const [anamnesisText, setAnamnesisText] = useState('');
    const [exploracionText, setExploracionText] = useState('');
    const [actuacionText, setActuacionText] = useState('');

    const generateSummary = useCallback(() => {
        let anamnesis = `FICHA CONTROL NIÑO SANO\n`;
        anamnesis += `---------------------------------------\n`;
        anamnesis += `FECHA CONTROL: ${new Date(formData.fechaControl + 'T00:00:00').toLocaleDateString('es-ES')}\n`;
        anamnesis += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || ''}\n`;
        anamnesis += `MOTIVO DE CONSULTA: Control de Salud Infantil ${formData.edadCorregidaCronologica || ''}\n`;
        anamnesis += `---------------------------------------\n\n`;

        anamnesis += `ESTADO ACTUAL:\n`;
        anamnesis += `- Edad (Corregida/Cronológica): ${formData.edadCorregidaCronologica || 'N/A'}\n`;
        anamnesis += `- NANEAS: ${formData.naneas ? `Sí, ${formData.naneasPatologia}` : 'No'}\n`;
        let acompanante = formData.acompanadoPor;
        if (acompanante === 'Otros' && formData.acompanadoPorOtros) acompanante += `: ${formData.acompanadoPorOtros}`;
        anamnesis += `- Asiste a control (${formData.grupoEtario}) acompañado de: ${acompanante}\n`;
        anamnesis += `- Estado general: ${formData.estadoGeneral}\n`;
        anamnesis += `- Consultas previas de urgencia: ${formData.consultasPreviasUrgencia}\n\n`;

        anamnesis += `ANTECEDENTES:\n`;
        anamnesis += `- Vive con: ${formData.viveCon}\n`;
        anamnesis += `- Trabajo de los padres y/o cuidador: ${formData.trabajoPadresCuidador}\n`;
        anamnesis += `- Antecedentes familiares de ECNT: ${formData.antecedentesFamiliaresECNT}\n`;
        anamnesis += `- Antecedentes mórbidos o alérgicos: ${formData.antecedentesMorbidosAlergicos}\n`;
        anamnesis += `- Antecedentes quirúrgicos y/o hospitalización: ${formData.antecedentesQuirurgicosHospitalizacion}\n`;
        let asiste = formData.asisteA;
        if (asiste === 'Otro' && formData.asisteAOtro) asiste += `: ${formData.asisteAOtro}`;
        anamnesis += `- Asiste a: ${asiste}\n\n`;

        anamnesis += `ALIMENTACIÓN Y HÁBITOS:\n`;
        let alimentacion = formData.tipoAlimentacion;
        if ((alimentacion === 'Fórmula + otros' || alimentacion === 'LM + otros') && formData.tipoAlimentacionAclaracion) {
            alimentacion += `: ${formData.tipoAlimentacionAclaracion}`;
        }
        anamnesis += `- Tipo de alimentación: ${alimentacion}\n`;
        anamnesis += `- N° de comidas diarias: ${formData.numComidasDiarias}\n`;
        anamnesis += `- Eliminación: ${formData.eliminacion}\n`;
        anamnesis += `- Higiene corporal: ${formData.higieneCorporal}\n`;
        anamnesis += `- Higiene bucal: ${formData.higieneBucal}\n`;
        anamnesis += `- Reposo y sueño: ${formData.reposoSueno}\n\n`;

        let exploracion = `OTROS ANTECEDENTES Y RESULTADOS:\n`;
        exploracion += `- Medicamentos/Suplementos vitamínicos: ${formData.medicamentosSuplementos}\n`;
        let inmunizacion = formData.vacunasAlDia ? 'Vacunas al día.' : '';
        if (formData.esquemaIncompleto) inmunizacion += ` Esquema incompleto: ${formData.esquemaIncompletoDetalle}`;
        exploracion += `- Calendario de inmunización: ${inmunizacion}\n`;
        exploracion += `- DSM Resultado, primera evaluación o reevaluación: ${formData.dsmResultado}\n`;
        exploracion += `- Asiste a SET: ${formData.asisteSet ? 'Sí' : 'No'}\n`;
        let mac = formData.usoMacMadre ? 'Sí' : 'No';
        if (formData.usoMacMadre && formData.usoMacMadreAclaracion) mac += `: ${formData.usoMacMadreAclaracion}`;
        exploracion += `- Uso MAC madre: ${mac}\n\n`;

        exploracion += `RESULTADO DE FORMULARIOS APLICADOS:\n`;
        exploracion += `- Edimburgo: ${formData.resultadoEdimburgo}\n`;
        exploracion += `- Score IRA: ${formData.resultadoScoreIRA}\n`;
        exploracion += `- Malnutrición por exceso: ${formData.resultadoMalnutricionExceso}\n`;
        exploracion += `- Pauta de Seguridad Infantil: ${formData.resultadoPautaSeguridadInfantil}\n\n`;
        
        exploracion += `DATOS DE CONTACTO:\n`;
        exploracion += `- Teléfono: ${formData.telefonoContacto}\n\n`;

        let actuacion = `INDICACIONES POR EDAD (${formData.edadIndicaciones || 'No seleccionada'}):\n`;
        actuacion += `${formData.indicacionesPorEdad}`;

        return { anamnesis: anamnesis.trim(), exploracion: exploracion.trim(), actuacion: actuacion.trim() };
    }, [formData, loggedInUser]);

    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = generateSummary();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, generateSummary]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
             if (name === 'edadIndicaciones') {
                const newIndicaciones = indicacionesPorEdadData[value as keyof typeof indicacionesPorEdadData] || '';
                setFormData(prev => ({ ...prev, indicacionesPorEdad: newIndicaciones }));
            }
        }
    }, []);

    const handleCopyToClipboard = (text: string, part: string) => {
        navigator.clipboard.writeText(text).then(() => alert(`${part} copiado al portapapeles.`));
    };

    const handleNewDocument = () => {
        setFormData(initialFormData);
    };

    return (
        <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
            <header className="mb-6 text-center">
                <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Niño Sano</h2>
                <p className="text-slate-500 mt-2">Complete los campos. El resumen se generará automáticamente.</p>
            </header>

            <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
                <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
                    <section className="p-4 bg-white rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos Generales</h3>
                        <DateField label="Fecha de Control" id="fechaControl" name="fechaControl" value={formData.fechaControl} onChange={handleChange} />
                    </section>
                    
                     <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Estado Actual</h3>
                        <FormField label="Edad (Corregida/Cronológica)" id="edadCorregidaCronologica" name="edadCorregidaCronologica" value={formData.edadCorregidaCronologica} onChange={handleChange} isTextArea rows={1} />
                         <div className="flex items-center">
                            <input type="checkbox" id="naneas" name="naneas" checked={formData.naneas} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" />
                            <label htmlFor="naneas" className="ml-2 text-sm text-slate-700">NANEAS</label>
                            {formData.naneas && <FormField label="" id="naneasPatologia" name="naneasPatologia" value={formData.naneasPatologia} onChange={handleChange} placeholder="Patología" containerClassName="ml-4 flex-grow" isTextArea rows={2}/>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Grupo Etario</label>
                               <select name="grupoEtario" value={formData.grupoEtario} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                                   <option value="">Seleccione...</option>
                                   <option value="Lactante Menor">Lactante Menor</option>
                                   <option value="Lactante Medio">Lactante Medio</option>
                                   <option value="Lactante Mayor">Lactante Mayor</option>
                                   <option value="Preescolar">Preescolar</option>
                                   <option value="Escolar">Escolar</option>
                               </select>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Acompañado por</label>
                               <select name="acompanadoPor" value={formData.acompanadoPor} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                                   <option value="">Seleccione...</option>
                                   <option value="Madre">Madre</option>
                                   <option value="Madre y padre">Madre y padre</option>
                                   <option value="Otros">Otros</option>
                               </select>
                               {formData.acompanadoPor === 'Otros' && <FormField label="" id="acompanadoPorOtros" name="acompanadoPorOtros" value={formData.acompanadoPorOtros} onChange={handleChange} placeholder="Aclare" containerClassName="mt-1" isTextArea rows={1}/>}
                           </div>
                        </div>
                        <FormField label="Estado general" id="estadoGeneral" name="estadoGeneral" value={formData.estadoGeneral} onChange={handleChange} isTextArea rows={2} />
                        <FormField label="Consultas previas de urgencia" id="consultasPreviasUrgencia" name="consultasPreviasUrgencia" value={formData.consultasPreviasUrgencia} onChange={handleChange} isTextArea rows={2} />
                    </section>
                    
                    <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antecedentes</h3>
                         <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Trabajo de los padres y/o cuidador" id="trabajoPadresCuidador" name="trabajoPadresCuidador" value={formData.trabajoPadresCuidador} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Antecedentes familiares de ECNT" id="antecedentesFamiliaresECNT" name="antecedentesFamiliaresECNT" value={formData.antecedentesFamiliaresECNT} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Antecedentes mórbidos o alérgicos" id="antecedentesMorbidosAlergicos" name="antecedentesMorbidosAlergicos" value={formData.antecedentesMorbidosAlergicos} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Antecedentes quirúrgicos y/o hospitalización" id="antecedentesQuirurgicosHospitalizacion" name="antecedentesQuirurgicosHospitalizacion" value={formData.antecedentesQuirurgicosHospitalizacion} onChange={handleChange} isTextArea rows={2} />
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Asiste a</label>
                            <select name="asisteA" value={formData.asisteA} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                               <option value="">Seleccione...</option>
                               <option value="Sala cuna">Sala cuna</option>
                               <option value="Jardín infantil">Jardín infantil</option>
                               <option value="Colegio">Colegio</option>
                               <option value="Otro">Otro</option>
                           </select>
                           {formData.asisteA === 'Otro' && <FormField label="" id="asisteAOtro" name="asisteAOtro" value={formData.asisteAOtro} onChange={handleChange} placeholder="Aclare" containerClassName="mt-1" isTextArea rows={1}/>}
                         </div>
                    </section>
                    
                    <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Alimentación y Hábitos</h3>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de alimentación</label>
                            <select name="tipoAlimentacion" value={formData.tipoAlimentacion} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                                <option value="">Seleccione...</option>
                                <option value="LME">LME</option>
                                <option value="LM + Fórmula">LM + Fórmula</option>
                                <option value="Fórmula + otros">Fórmula + otros (aclare)</option>
                                <option value="LM + otros">LM + otros (aclare)</option>
                            </select>
                            {(formData.tipoAlimentacion === 'Fórmula + otros' || formData.tipoAlimentacion === 'LM + otros') && (
                                <FormField 
                                    label="" 
                                    id="tipoAlimentacionAclaracion" 
                                    name="tipoAlimentacionAclaracion" 
                                    value={formData.tipoAlimentacionAclaracion} 
                                    onChange={handleChange} 
                                    placeholder="Aclare aquí..." 
                                    containerClassName="mt-1"
                                    isTextArea
                                    rows={2}
                                />
                            )}
                        </div>
                         <FormField label="N° de comidas diarias" id="numComidasDiarias" name="numComidasDiarias" value={formData.numComidasDiarias} onChange={handleChange} isTextArea rows={1} />
                         <FormField label="Eliminación" id="eliminacion" name="eliminacion" value={formData.eliminacion} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Higiene corporal" id="higieneCorporal" name="higieneCorporal" value={formData.higieneCorporal} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Higiene bucal" id="higieneBucal" name="higieneBucal" value={formData.higieneBucal} onChange={handleChange} isTextArea rows={2} />
                         <FormField label="Reposo y sueño" id="reposoSueno" name="reposoSueno" value={formData.reposoSueno} onChange={handleChange} isTextArea rows={2} />
                    </section>
                    
                    <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Otros Antecedentes</h3>
                         <FormField label="Medicamentos/Suplementos vitamínicos" id="medicamentosSuplementos" name="medicamentosSuplementos" value={formData.medicamentosSuplementos} onChange={handleChange} isTextArea rows={2}/>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Calendario de inmunización</label>
                            <div className="flex items-center"><input type="checkbox" id="vacunasAlDia" name="vacunasAlDia" checked={formData.vacunasAlDia} onChange={handleChange} className="h-4 w-4" /><label htmlFor="vacunasAlDia" className="ml-2 text-sm text-slate-700">Vacunas al día</label></div>
                            <div className="flex items-center mt-1"><input type="checkbox" id="esquemaIncompleto" name="esquemaIncompleto" checked={formData.esquemaIncompleto} onChange={handleChange} className="h-4 w-4" /><label htmlFor="esquemaIncompleto" className="ml-2 text-sm text-slate-700">Esquema incompleto</label></div>
                            {formData.esquemaIncompleto && <FormField label="" id="esquemaIncompletoDetalle" name="esquemaIncompletoDetalle" value={formData.esquemaIncompletoDetalle} onChange={handleChange} placeholder="Aclarar cuáles faltan" containerClassName="mt-1" isTextArea rows={2}/>}
                         </div>
                         <FormField label="DSM Resultado, primera evaluación o reevaluación" id="dsmResultado" name="dsmResultado" value={formData.dsmResultado} onChange={handleChange} isTextArea rows={2} />
                         <div className="flex items-center"><input type="checkbox" id="asisteSet" name="asisteSet" checked={formData.asisteSet} onChange={handleChange} className="h-4 w-4" /><label htmlFor="asisteSet" className="ml-2 text-sm text-slate-700">Asiste a SET</label></div>
                         <div className="flex items-center"><input type="checkbox" id="usoMacMadre" name="usoMacMadre" checked={formData.usoMacMadre} onChange={handleChange} className="h-4 w-4" /><label htmlFor="usoMacMadre" className="ml-2 text-sm text-slate-700">Uso MAC madre</label>
                         {formData.usoMacMadre && <FormField label="" id="usoMacMadreAclaracion" name="usoMacMadreAclaracion" value={formData.usoMacMadreAclaracion} onChange={handleChange} placeholder="Aclare" containerClassName="ml-4 flex-grow" isTextArea rows={1}/>}
                         </div>
                    </section>

                    <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Resultado de Formularios Aplicados</h3>
                          <FormField label="Edimburgo" id="resultadoEdimburgo" name="resultadoEdimburgo" value={formData.resultadoEdimburgo} onChange={handleChange} />
                          <FormField label="Score IRA" id="resultadoScoreIRA" name="resultadoScoreIRA" value={formData.resultadoScoreIRA} onChange={handleChange} />
                          <FormField label="Malnutrición por exceso" id="resultadoMalnutricionExceso" name="resultadoMalnutricionExceso" value={formData.resultadoMalnutricionExceso} onChange={handleChange} />
                          <FormField label="Pauta de Seguridad Infantil" id="resultadoPautaSeguridadInfantil" name="resultadoPautaSeguridadInfantil" value={formData.resultadoPautaSeguridadInfantil} onChange={handleChange} />
                    </section>
                    
                    <section className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos de Contacto</h3>
                         <FormField label="Teléfono" id="telefonoContacto" name="telefonoContacto" value={formData.telefonoContacto} onChange={handleChange} />
                    </section>

                    <section className="p-4 bg-white rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Indicaciones por Edad</h3>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Seleccione Edad</label>
                        <select name="edadIndicaciones" value={formData.edadIndicaciones} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg mb-2">
                           <option value="">Seleccione edad para cargar indicaciones...</option>
                           {Object.keys(indicacionesPorEdadData).map(edad => <option key={edad} value={edad}>{edad}</option>)}
                        </select>
                        <FormField label="Indicaciones" id="indicacionesPorEdad" name="indicacionesPorEdad" value={formData.indicacionesPorEdad} onChange={handleChange} isTextArea rows={15} />
                    </section>
                </div>

                <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">Resumen Ficha Clínica (Editable)</h3>
                    <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden w-full">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label><button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                            <textarea value={anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Exploración</label><button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                            <textarea value={exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0"><label className="block text-[11px] font-semibold text-slate-800">Actuación</label><button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] bg-slate-200 rounded font-bold">Copiar</button></div>
                            <textarea value={actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
                <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">Volver</button>
                <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg">Limpiar Formulario</button>
            </div>
        </div>
    );
};

export default FichaControlNinoSano;
