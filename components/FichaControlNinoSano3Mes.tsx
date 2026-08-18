import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlNinoSano3MesFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import CurvasCrecimientoModal from './CurvasCrecimientoModal';
import ScoreRMNModal from './ScoreRMNModal';
import ScoreNeurosensorialModal from './ScoreNeurosensorialModal';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaControlNinoSano3MesFormData = {
  sexo: '',
  peso: '',
  talla: '',
  perimetroCefalico: '',
  calificacionNutricional: '',
  calificacionEstatural: '',
  evaluacionPerimetroCefalico: '',

  edad: '3 meses', acudeJuntoA: '', estadoGeneral: 'Tranquilo, aparente BEG.',
  naneasPresente: false,
  naneasDetalle: '',

  perinatalGpa: '', perinatalControles: '', perinatalPatologias: '', perinatalParto: '', perinatalRnt: '', perinatalPatologiasRecienNacido: '', perinatalInmunizaciones: '', perinatalScreening: '', perinatalPkuTsh: '', perinatalAlta: '', perinatalPesoAlta: '',
  personalesEnfermedades: '', personalesHospitalizaciones: '', personalesAlimentacion: 'Lactancia materna exclusiva a libre demanda.', personalesHigiene: 'Baño día por medio dura 10 minutos, usa shampoo/jabon hipoalergénico, hidrata con crema/vaselina.', personalesHabitoMiccional: 'X pañales/día.', personalesHabitoIntestinal: 'X pañales/día; deposiciones amarillas liquida-pastosa, sin sangre ni moco.', personalesSueno: 'Alrededor de 2 a 3 horas de corrido. Duerme en cuna/colecho en el lado de mamá, con sus propias mantas sin almohada ni peluches, en decúbito supino.', personalesInmunizacionesAlDia: 'Sí, según PNI.', personalesSeguridad: 'Exposición al sol (-). Al viajar en auto usa silla, detrás del copiloto mirando hacia atrás, siempre acompañado.',
  socialesEdadPadres: '', socialesVivenCon: '', socialesCuidadoPor: '', socialesAsisteSalaCuna: 'No', socialesTabaquismoFamiliar: 'No', socialesMascotas: '',
  familiaresRelacion: '', familiaresPatologias: 'Niega', familiaresHipoacusia: 'Niega',

  reflejoMoro: 'Ausente',
  reflejoMoroDetalle: 'Ya debería haber desaparecido.',
  reflejoBusqueda: 'Presente',
  reflejoBusquedaDetalle: '',
  reflejoSuccion: 'Presente',
  reflejoSuccionDetalle: '',
  reflejoPrensionPalmar: 'Presente',
  reflejoPrensionPalmarDetalle: '',
  reflejoPrensionPlantar: 'Presente',
  reflejoPrensionPlantarDetalle: '',
  reflejoBabinski: 'Presente',
  reflejoBabinskiDetalle: '',
  reflejoGalant: 'Presente',
  reflejoGalantDetalle: '',
  reflejoTonicoCervical: 'Presente',
  reflejoTonicoCervicalDetalle: '',
  reflejoMarchaAutomatica: 'Ausente',
  reflejoMarchaAutomaticaDetalle: 'Ya debería haber desaparecido.',
  reflejoApoyoPositivo: 'Ausente',
  reflejoApoyoPositivoDetalle: 'Ya debería haber desaparecido.',

  vacunas: 'Al día según PNI.', 
  patologiasNacimientoPresente: false,
  patologiasNacimientoDetalle: '',
  hospitalizacionesPresente: false,
  hospitalizacionesDetalle: '',
  urgenciasPresente: false,
  urgenciasDetalle: '',
  accidentesPresente: false,
  accidentesDetalle: '',
  
  alimentacionLME: 'Lactancia materna exclusiva a libre demanda.', alimentacionOtrasLechesAgua: 'Otras leches (-) agua (-)', alimentacionVitaminasHierro: 'Uso de vitaminas o hierro: ',
  habitosHigiene: 'Baño día por medio dura 10 minutos, usa shampoo/jabon hipoalergénico, hidrata con crema/vaselina.', habitosDiuresis: 'x pañales/día', habitosIntestinal: 'pañales/día; deposiciones amarillas liquida-pastosa, sin sangre ni moco.', habitosSueno: 'Alrededor de 2 a 3 horas de corrido. Duerme en cuna/colecho en el lado de mamá, con sus propias mantas sin almohada ni peluches, en decúbito supino.', habitosSeguridad: 'Exposición al sol (-). Al viajar en auto usa silla, detrás del copiloto mirando hacia atrás, siempre acompañado.',
  efGeneral: 'Buen estado general, vigil y reactivo, tranquilo and atento a su entorno.', efPiel: 'Rosada e hidratada, sin ictericia ni cianosis, sin lesiones/describir lesiones e impresión.', efCabezaCuello: 'Cráneo sin asimetrías, fontanela anterior palpable a nivel x cm. Sin cabalgamiento de suturas ni lesiones en línea media. Cuello simétrico y movil, sin adenopatías.', efOftalmologico: 'Ojos simétricos, sin alteraciones, sin secreciones ni lesiones evidentes, rojo pupilar (+) bilateral. Fija la mirada y sigue objetos y personas.', efAuditivo: 'Otoscopia normal. Alerta a los sonidos, sobresalto con sonidos fuertes.', efMucosaOral: 'Mucosa oral rosada y sin lesiones, paladar indemne, sin brotes dentales. Reflejo succión (+) faringe sana.', efAdenopatias: '(-)', efCardiopulmonar: 'Sin apremio ventilatorio. RR2T SS. MP (+) simétrico, SRA.', efAbdomen: 'Sin distensión ni masas visibles. Blando, depresible, impresiona sin dolor a la palpación. Sin masas ni visceromegalias palpables.', efGenitoanal: 'Dermatitis del pañal ausente, ano permeable, genitales sin alteraciones, sin sinequias.', efNeurologico: 'Reflejos; Moro (-) prensión palmar (+) y plantar (+) marcha automática (-) búsqueda y succión (+). Tono adecuado, en flexión. Control cefálico (+) en decúbito prono logra sostén por algunos segundos, moviliza extremidades. Sin fosita pilonidal ni signos de malformación neural.', efSenalesMaltrato: '(-)',
  antropometria: '', 
  scoreRMN: '0', 
  scoreNeurosensorial: '// Desarrollo psicomotor: adecuado para su edad.',
  diagnosticos: 'Lactante menor sano\nEutrófico\nDesarrollo integral adecuado',
  patologia: 'No', riesgoPsicosocial: 'Sin factores de riesgo psicosocial',
  indicaciones: 'Lactancia materna exclusiva a libre demanda. Máximo tiempo de espera cada 3 horas durante el dia y la noche\nVitaminas ACD: 20 gotas al día hasta cumplir 1 año.\nHierro 2 gotas por día desde el 4° mes.\nSolicito radiografía de pelvis.\nDormir en cuna o colecho seguro, colchón sin inclinación, decúbito supino (de espalda mirando al techo). No colocar peluches o almohadas en cuna por riesgo de asfixia.\nBaño 2-3 veces por semana, uso de jabón neutro, lubricación diaria de la piel con vaselina o crema humectante hipoalergénica.\nEvitar uso de toallas húmedas.\nEstimulación: hablar, cantar, acunar.\nUso de silla en auto, en asiento trasero detrás del copiloto, y orientado hacia atrás.\nNo exponer al sol directo, no usar bloqueador hasta cumplir 6 meses. Proteger con ropa de algodón y gorro en caso de salidas.\nNo usar andador por riesgo de accidentes.\nEntrega de guía anticipatoria en: estimulación + masajes + porteo y uso del portabebé.\nControl 4° mes con enfermera.\nConsultar en servicio de urgencias si: t° axilar >38°, rechazo alimentario, dificultad respiratoria, irritabilidad.',
  proximoControl: '4° mes con enfermera',
};

const formSections = {
    anamnesis: [
        { title: "Identificación", fields: [{name: 'edad', label: 'Edad'}, {name: 'acudeJuntoA', label: 'Acude junto a'}, {name: 'estadoGeneral', label: 'Estado general'}]},
        { title: "Alimentación", fields: [{name: 'alimentacionLME', label: 'Lactancia Materna Exclusiva'}, {name: 'alimentacionOtrasLechesAgua', label: 'Otras leches / Agua'}, {name: 'alimentacionVitaminasHierro', label: 'Uso de Vitaminas o Hierro'}]},
        { title: "Hábitos", fields: [{name: 'habitosHigiene', label: 'Higiene'}, {name: 'habitosDiuresis', label: 'Diuresis'}, {name: 'habitosIntestinal', label: 'H. Intestinal'}, {name: 'habitosSueno', label: 'Sueño'}, {name: 'habitosSeguridad', label: 'Seguridad'}]},
    ],
    exploracion: [
        { title: "Examen Físico", fields: [{name: 'efGeneral', label: 'General'}, {name: 'efPiel', label: 'Piel'}, {name: 'efCabezaCuello', label: 'Cabeza y Cuello'}, {name: 'efOftalmologico', label: 'Oftalmológico'}, {name: 'efAuditivo', label: 'Auditivo'}, {name: 'efMucosaOral', label: 'Mucosa Oral'}, {name: 'efAdenopatias', label: 'Adenopatías'}, {name: 'efCardiopulmonar', label: 'Cardiopulmonar'}, {name: 'efAbdomen', label: 'Abdomen'}, {name: 'efGenitoanal', label: 'Genitoanal'}, {name: 'efNeurologico', label: 'Neurológico'}, {name: 'efSenalesMaltrato', label: 'Señales de maltrato'}]}
    ],
    actuacion: [
        { title: "Diagnósticos e Indicaciones", fields: [{name: 'diagnosticos', label: 'Diagnósticos'}, {name: 'patologia', label: 'Patología'}, {name: 'riesgoPsicosocial', label: 'Riesgo Psicosocial'}, {name: 'indicaciones', label: 'Indicaciones'}]}
    ]
};

const reflejosList = [
    { key: 'reflejoSuccion', label: 'Succión', expected: 'Presente' },
    { key: 'reflejoBusqueda', label: 'Búsqueda', expected: 'Presente' },
    { key: 'reflejoPrensionPalmar', label: 'Prensión Palmar', expected: 'Presente' },
    { key: 'reflejoTonicoCervical', label: 'Tónico cervical asimétrico', expected: 'Presente' },
    { key: 'reflejoMoro', label: 'Moro', expected: 'Ausente' },
    { key: 'reflejoMarchaAutomatica', label: 'Marcha automática', expected: 'Ausente' },
    { key: 'reflejoApoyoPositivo', label: 'Apoyo positivo primario', expected: 'Ausente' },
    { key: 'reflejoPrensionPlantar', label: 'Prensión Plantar', expected: 'Presente' },
];

const proximoControlOptions = [
    { value: '', label: 'Seleccione...' },
    { value: '4° mes con enfermera', label: '4° mes con enfermera' },
    { value: '5° mes con nutricionista', label: '5° mes con nutricionista' },
    { value: '6° mes con enfermera', label: '6° mes con enfermera' },
];

interface FichaControlNinoSano3MesProps {
    onBackToMenu: () => void;
    loggedInUser: User | null;
}

const FichaControlNinoSano3Mes: React.FC<FichaControlNinoSano3MesProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlNinoSano3MesFormData>('local_FichaControlNinoSano3Mes', initialFormData);
    const [anamnesisText, setAnamnesisText] = useState('');
    const [exploracionText, setExploracionText] = useState('');
    const [actuacionText, setActuacionText] = useState('');
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isRmnModalOpen, setIsRmnModalOpen] = useState(false);
    const [isNeuroModalOpen, setIsNeuroModalOpen] = useState(false);

    const generateSummaryParts = useCallback(() => {
        const todayStr = new Date().toLocaleDateString('es-ES');
        const naneasVal = formData.naneasPresente ? 'SÍ' : 'NO';
        
        let header = `FICHA CONTROL NIÑO SANO 3° MES\n`;
        header += `---------------------------------------\n`;
        header += `FECHA INGRESO: ${todayStr}\n`;
        header += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || '(No especificado)'}\n`;
        header += `NANEAS: ${naneasVal}\n`;
        header += `MOTIVO DE CONSULTA: CONTROL NIÑO SANO 3° MES\n`;
        header += `---------------------------------------\n\n`;

        const processBlock = (sections: any[]) => {
            let blockText = '';
            sections.forEach(section => {
                blockText += `${section.title.toUpperCase()}:\n`;
                section.fields.forEach((field: any) => {
                    const value = formData[field.name as keyof FichaControlNinoSano3MesFormData];
                    if (value && typeof value === 'string' && value.trim()) {
                        blockText += `- ${field.label}: ${value}\n`;
                    }
                });
                blockText += '\n';
            });
            return blockText;
        };

        // ANAMNESIS
        let anam = header;
        anam += processBlock(formSections.anamnesis);
        anam += `ANTECEDENTES MÓRBIDOS:\n`;
        const formatAntecedent = (label: string, presente: boolean, detalle: string) => {
            return `- ${label}: ${presente ? (detalle.trim() || 'Sí.') : 'Niega.'}\n`;
        };
        anam += formatAntecedent("Patologías nacimiento", formData.patologiasNacimientoPresente, formData.patologiasNacimientoDetalle);
        anam += formatAntecedent("Hospitalizaciones", formData.hospitalizacionesPresente, formData.hospitalizacionesDetalle);
        anam += formatAntecedent("Urgencias", formData.urgenciasPresente, formData.urgenciasDetalle);
        anam += formatAntecedent("Accidentes", formData.accidentesPresente, formData.accidentesDetalle);
        anam += `- Vacunas: ${formData.vacunas || 'Niega.'}\n`;

        // EXPLORACIÓN
        let expl = `ANTROPOMETRÍA Y SCORES:\n`;
        expl += `- Peso: ${formData.peso} kg\n`;
        expl += `- Talla: ${formData.talla} cm\n`;
        expl += `- P. Cefálico: ${formData.perimetroCefalico} cm\n`;
        expl += `- Calificación Nutricional: ${formData.calificacionNutricional || 'Sin clasificar'}\n`;
        expl += `- Calificación Estatural: ${formData.calificacionEstatural || 'Sin clasificar'}\n`;
        expl += `- Evaluación P. Cefálico: ${formData.evaluacionPerimetroCefalico || 'Sin clasificar'}\n`;
        expl += `- Score RMN: ${formData.scoreRMN || 'No calculado'}\n`;
        expl += `- Score Neurosensorial: ${formData.scoreNeurosensorial || 'No evaluado'}\n\n`;
        expl += processBlock(formSections.exploracion);
        expl += `REFLEJOS ARCAICOS:\n`;
        reflejosList.forEach(reflejo => {
            const val = formData[reflejo.key as keyof FichaControlNinoSano3MesFormData];
            const detalle = formData[`${reflejo.key}Detalle` as keyof FichaControlNinoSano3MesFormData];
            expl += `- ${reflejo.label}: ${val}${val === 'Alterado' && detalle ? ` (${detalle})` : ''}\n`;
        });

        // ACTUACIÓN
        let actu = processBlock(formSections.actuacion);
        if (formData.proximoControl) {
            actu += `PRÓXIMO CONTROL: ${formData.proximoControl}\n`;
        }

        return {
            anamnesis: anam.trim(),
            exploracion: expl.trim(),
            actuacion: actu.trim()
        };
    }, [formData, loggedInUser]);

    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = generateSummaryParts();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, generateSummaryParts]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleCopyToClipboard = (text: string, title: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert(`'${title}' copiado al portapapeles.`);
        });
    };

    const handleNewDocument = () => {
        setFormData(initialFormData);
    };

    const handleCalculatorResults = (results: { nutricional: string; estatural: string; perimetro: string; }) => {
        setFormData(prev => ({
            ...prev,
            calificacionNutricional: results.nutricional,
            calificacionEstatural: results.estatural,
            evaluacionPerimetroCefalico: results.perimetro,
        }));
    };
    
    const handleSaveRmnScore = (score: string) => {
      setFormData(prev => ({ ...prev, scoreRMN: score }));
      setIsRmnModalOpen(false);
    };

    const handleSaveNeuroScore = (evaluation: string) => {
      setFormData(prev => ({ ...prev, scoreNeurosensorial: evaluation }));
      setIsNeuroModalOpen(false);
    };

    const renderCheckboxClarification = (label: string, presenteName: string, detalleName: string) => (
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id={presenteName}
                    name={presenteName}
                    checked={formData[presenteName as keyof FichaControlNinoSano3MesFormData] as boolean}
                    onChange={handleChange}
                    className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor={presenteName} className="text-sm font-medium text-slate-700">{label}</label>
            </div>
            {formData[presenteName as keyof FichaControlNinoSano3MesFormData] && (
                <textarea
                    name={detalleName}
                    value={formData[detalleName as keyof FichaControlNinoSano3MesFormData] as string}
                    onChange={handleChange}
                    placeholder="Detallar hallazgo..."
                    className="mt-2 w-full text-xs p-2 border border-slate-300 rounded bg-slate-50 text-black outline-none focus:ring-1 focus:ring-sky-500"
                    rows={2}
                />
            )}
        </div>
    );

    return (
      <div className="w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
          <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación y Crecimiento</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                                <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-black">
                                    <option value="">Seleccione...</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="masculino">Masculino</option>
                                </select>
                            </div>
                            <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange} type="number" step="0.01" />
                            <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange} type="number" step="0.1" />
                            <FormField label="P. Cefálico (cm)" id="perimetroCefalico" name="perimetroCefalico" value={formData.perimetroCefalico} onChange={handleChange} type="number" step="0.1" />
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                           <button onClick={() => setIsCalculatorOpen(true)} className="flex-1 px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                                Calcular Curva de Crecimiento
                           </button>
                           <div className="flex items-center gap-3 flex-1 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <input type="checkbox" id="naneasPresente" name="naneasPresente" checked={formData.naneasPresente} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" />
                                <label htmlFor="naneasPresente" className="text-sm font-medium text-slate-700 whitespace-nowrap">NANEAS</label>
                                {formData.naneasPresente && <input type="text" name="naneasDetalle" value={formData.naneasDetalle} onChange={handleChange} placeholder="Aclarar diagnóstico" className="flex-grow text-xs p-1 border rounded text-black" />}
                           </div>
                       </div>
                    </section>

                    {/* ANTECEDENTES */}
                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antecedentes Médicos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderCheckboxClarification("Patologías desde nacimiento", "patologiasNacimientoPresente", "patologiasNacimientoDetalle")}
                            {renderCheckboxClarification("Hospitalizaciones", "hospitalizacionesPresente", "hospitalizacionesDetalle")}
                            {renderCheckboxClarification("Urgencias", "urgenciasPresente", "urgenciasDetalle")}
                            {renderCheckboxClarification("Accidentes", "accidentesPresente", "accidentesDetalle")}
                        </div>
                        <div className="mt-4">
                            <FormField label="Vacunas" id="vacunas" name="vacunas" value={formData.vacunas} onChange={handleChange} isTextArea rows={1} />
                        </div>
                    </section>

                    {/* BLOQUES ANAMNESIS RESTANTES */}
                    {formSections.anamnesis.map(section => (
                        <section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">{section.title}</h3>
                            <div className="space-y-3">
                                {section.fields.map(field => (
                                    <FormField
                                        key={field.name}
                                        label={field.label}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name as keyof FichaControlNinoSano3MesFormData] as string}
                                        onChange={handleChange}
                                        inputClassName="text-black"
                                        isTextArea={true}
                                        rows={2}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* BLOQUE EXPLORACIÓN */}
                    {formSections.exploracion.map(section => (
                        <section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">{section.title}</h3>
                            <div className="space-y-3">
                                {section.fields.map(field => (
                                    <FormField
                                        key={field.name}
                                        label={field.label}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name as keyof FichaControlNinoSano3MesFormData] as string}
                                        onChange={handleChange}
                                        inputClassName="text-black"
                                        isTextArea={true}
                                        rows={2}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Reflejos Arcaicos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reflejosList.map(reflejo => (
                                <div key={reflejo.key} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-slate-700">{reflejo.label}:</label>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${reflejo.expected === 'Presente' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            Espera: {reflejo.expected}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mb-2">
                                        {['Presente', 'Alterado', 'Ausente'].map(option => (
                                            <label key={option} className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={reflejo.key}
                                                    value={option}
                                                    checked={formData[reflejo.key as keyof FichaControlNinoSano3MesFormData] === option}
                                                    onChange={handleChange}
                                                    className={`form-radio h-4 w-4 ${option === 'Presente' ? 'text-green-600' : option === 'Ausente' ? 'text-slate-600' : 'text-red-600'}`}
                                                />
                                                <span className="ml-1.5 text-xs text-slate-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        name={`${reflejo.key}Detalle`}
                                        value={formData[`${reflejo.key}Detalle` as keyof FichaControlNinoSano3MesFormData] as string}
                                        onChange={handleChange}
                                        placeholder="Nota u observación..."
                                        className="w-full text-[10px] p-2 border border-slate-200 rounded bg-slate-50 text-black outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Scores de Desarrollo</h3>
                        <div className="space-y-3">
                             <div className="flex items-center gap-4">
                                <button onClick={() => setIsRmnModalOpen(true)} className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 text-sm">Calcular Score RMN</button>
                                <p className="flex-1 p-2 bg-white border rounded text-xs font-medium text-slate-800">{formData.scoreRMN || 'Sin calcular'}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <button onClick={() => setIsNeuroModalOpen(true)} className="flex-1 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-600 text-sm">Evaluar DSM</button>
                                <p className="flex-1 p-2 bg-white border rounded text-xs font-medium text-slate-800">{formData.scoreNeurosensorial || 'Sin evaluar'}</p>
                             </div>
                        </div>
                    </section>

                    {/* BLOQUE ACTUACIÓN */}
                    {formSections.actuacion.map(section => (
                        <section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">{section.title}</h3>
                            <div className="space-y-3">
                                {section.fields.map(field => (
                                    <FormField
                                        key={field.name}
                                        label={field.label}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name as keyof FichaControlNinoSano3MesFormData] as string}
                                        onChange={handleChange}
                                        inputClassName="text-black"
                                        isTextArea={true}
                                        rows={field.name === 'indicaciones' ? 8 : 3}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Próximo Control</h3>
                        <div className="p-3 border border-slate-200 rounded-md bg-white">
                            <label htmlFor="proximoControl" className="block text-sm font-medium text-slate-700 mb-1.5">Tiempo para próximo control</label>
                            <select 
                                id="proximoControl" 
                                name="proximoControl" 
                                value={formData.proximoControl} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-black"
                            >
                                {proximoControlOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </section>

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
                            className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 uppercase text-xs tracking-widest cursor-pointer"
                        >
                            BORRAR TODO
                        </button>
                    </div>
                    </form>
                </div>

            {/* Columna Derecha: Vista Previa */}
          <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
              <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
                <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                  <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                          <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                          <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                      </div>
                      <textarea
                          value={anamnesisText}
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
                          value={exploracionText}
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
                          value={actuacionText}
                          onChange={(e) => setActuacionText(e.target.value)}
                          className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                      />
                  </div>
              </div>
            </div>
          </div>
        </div>

        <CurvasCrecimientoModal
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            onResults={handleCalculatorResults}
            initialData={{
                sexo: (formData.sexo.toLowerCase() as "" | "femenino" | "masculino") || "",
                edad: "3", 
                peso: formData.peso,
                talla: formData.talla,
                pc: formData.perimetroCefalico,
            }}
        />
        <ScoreRMNModal isOpen={isRmnModalOpen} onClose={() => setIsRmnModalOpen(false)} onSave={handleSaveRmnScore} />
        <ScoreNeurosensorialModal isOpen={isNeuroModalOpen} onClose={() => setIsNeuroModalOpen(false)} onSave={handleSaveNeuroScore} edadMeses={3} />
      </div>
    );
};

export default FichaControlNinoSano3Mes;
