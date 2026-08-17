
import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlNinoSano1MesFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import CurvasCrecimientoModal from './CurvasCrecimientoModal';
import ScoreRMNModal from './ScoreRMNModal';
import ScoreNeurosensorialModal from './ScoreNeurosensorialModal';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaControlNinoSano1MesFormData = {
  sexo: '',
  peso: '',
  talla: '',
  perimetroCefalico: '',
  calificacionNutricional: '',
  calificacionEstatural: '',
  evaluacionPerimetroCefalico: '',

  edad: '1 mes', acudeJuntoA: '', estadoGeneral: 'Tranquilo, vigil y reactivo.',
  naneasPresente: false,
  naneasDetalle: '',
  perinatalGpa: '', perinatalControles: '', perinatalPatologias: '', perinatalParto: '', perinatalRnt: '', perinatalPatologiasRecienNacido: '', perinatalInmunizaciones: '', perinatalScreening: '', perinatalPkuTsh: '', perinatalAlta: '', perinatalPesoAlta: '',
  personalesEnfermedades: '', personalesHospitalizaciones: '', personalesAlimentacion: 'LM exclusiva libre demanda.', personalesHigiene: 'Baño 2-3 veces por semana.', personalesHabitoMiccional: 'Normal.', personalesHabitoIntestinal: 'Normal.', personalesSueno: 'Normal, despierta para alimentarse.', personalesInmunizacionesAlDia: 'Sí', personalesSeguridad: 'Uso de silla nido.',
  socialesEdadPadres: '', socialesVivenCon: '', socialesCuidadoPor: '', socialesAsisteSalaCuna: 'No', socialesTabaquismoFamiliar: 'No', socialesMascotas: '',
  familiaresRelacion: '', familiaresPatologias: 'Niega', familiaresHipoacusia: 'Niega',
  
  // Examen Físico con hallazgos normales por defecto
  efGeneral: 'Vigil, reactivo, tranquilo. Buen estado general.',
  efPiel: 'Rosada, hidratada, sin ictericia ni cianosis.',
  efCabezaCuello: 'Cráneo normoconfigurado, fontanela anterior normotensa. Cuello móvil, sin masas.',
  efOftalmologico: 'Ojos simétricos, rojo pupilar (+) bilateral.',
  efAuditivo: 'Alerta a sonidos, sobresalto presente.',
  efMucosaOral: 'Mucosa oral rosada e hidratada. Paladar indemne.',
  efAdenopatias: 'No se palpan.',
  efCardiopulmonar: 'RR2T sin soplos. MP(+) simétrico, sin ruidos agregados.',
  efAbdomen: 'Blando, depresible, indoloro. Ratios hidroaéreos presentes.',
  efGenitoanal: 'Genitales normoconfigurados según sexo. Ano permeable.',
  efNeurologico: 'Tono adecuado para la edad. Movimientos simétricos.',
  efSenalesMaltrato: 'Ausentes.',
  
  // Reflejos arcaicos por defecto
  reflejoMoro: 'Presente',
  reflejoMoroDetalle: '',
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

  antropometria: '', 
  scoreRMN: '', 
  scoreNeurosensorial: '',
  diagnosticos: 'Lactante menor sano\nDesarrollo integral adecuado',
  patologia: 'No',
  riesgoPsicosocial: 'Sin riesgo',
  indicaciones: 'Lactancia materna exclusiva a libre demanda. Máximo tiempo de espera cada 3 horas durante el dia y la noche.\nVitaminas ACD: 20 gotas al día hasta cumplir 1 año.\nDormir en cuna o colecho seguro, colchón sin inclinación, decúbito supino (de espalda mirando al techo). No colocar peluches o almohadas en cuna por riesgo de asfixia.\nBaño 2-3 veces por semana, uso de jabón neutro, lubricación diaria de la piel con vaselina o crema humectante hipoalergénica.\nEstimulación: hablar, cantar, acunar.\nUso de silla en auto, en asiento trasero detrás del copiloto, y orientado hacia atrás.\nNo exponer al sol directo, no usar bloqueador hasta cumplir 6 meses. Proteger con por ropa de algodón y gorro en caso de salidas.\nNo usar andador por riesgo de accidentes.\nControl 2° mes con enfermera.\nConsultar en servicio de urgencias si: t° axilar >38°, rechazo alimentario, dificultad respiratoria, irritabilidad.',
  proximoControl: '2° mes con enfermera',
};

const formSections = {
    anamnesis: [
        { title: "Identificación", fields: [ {name: 'edad', label: 'Edad'}, {name: 'acudeJuntoA', label: 'Acude junto a'}, {name: 'estadoGeneral', label: 'Estado general'} ] },
        { title: "Antecedentes Perinatales", fields: [ {name: 'perinatalGpa', label: 'GPA'}, {name: 'perinatalControles', label: 'Controles'}, {name: 'perinatalPatologias', label: 'Patologías o complicaciones'}, {name: 'perinatalParto', label: 'Parto'}, {name: 'perinatalRnt', label: 'RNT'}, {name: 'perinatalPatologiasRecienNacido', label: 'Patologías en periodo recién nacido'}, {name: 'perinatalInmunizaciones', label: 'Inmunizaciones'}, {name: 'perinatalScreening', label: 'Screening auditivo'}, {name: 'perinatalPkuTsh', label: 'PKU, TSH'}, {name: 'perinatalAlta', label: 'Alta con madre/hosp'}, {name: 'perinatalPesoAlta', label: 'Peso al alta'} ]},
        { title: "Antecedentes Personales", fields: [ {name: 'personalesEnfermedades', label: 'Enfermedades previas'}, {name: 'personalesHospitalizaciones', label: 'Hospitalizaciones'}, {name: 'personalesAlimentacion', label: 'Alimentación'}, {name: 'personalesHigiene', label: 'Higiene'}, {name: 'personalesHabitoMiccional', label: 'Hábito miccional'}, {name: 'personalesHabitoIntestinal', label: 'H. intestinal'}, {name: 'personalesSueno', label: 'Sueño'}, {name: 'personalesInmunizacionesAlDia', label: 'Inmunizaciones'}, {name: 'personalesSeguridad', label: 'Seguridad'} ]},
        { title: "Antecedentes Sociales", fields: [ {name: 'socialesEdadPadres', label: 'Edad padres'}, {name: 'socialesVivenCon', label: 'Viven con'}, {name: 'socialesCuidadoPor', label: 'Cuidado por'}, {name: 'socialesAsisteSalaCuna', label: 'Asiste a sala cuna'}, {name: 'socialesTabaquismoFamiliar', label: 'Tabaquismo familiar'}, {name: 'socialesMascotas', label: 'Mascotas'} ]},
        { title: "Antecedentes Familiares", fields: [ {name: 'familiaresRelacion', label: 'Relación familiar'}, {name: 'familiaresPatologias', label: 'Patologías familiares de 1°grado'}, {name: 'familiaresHipoacusia', label: 'Hipoacusia en familiares'} ]},
    ],
    exploracion: [
        { title: "Examen Físico", fields: [ {name: 'efGeneral', label: 'General'}, {name: 'efPiel', label: 'Piel'}, {name: 'efCabezaCuello', label: 'Cabeza y cuello'}, {name: 'efOftalmologico', label: 'Oftalmológico'}, {name: 'efAuditivo', label: 'Auditivo'}, {name: 'efMucosaOral', label: 'Mucosa oral'}, {name: 'efAdenopatias', label: 'Adenopatías'}, {name: 'efCardiopulmonar', label: 'Cardiopulmonar'}, {name: 'efAbdomen', label: 'Abdomen'}, {name: 'efGenitoanal', label: 'Genitoanal'}, {name: 'efNeurologico', label: 'Neurológico'}, {name: 'efSenalesMaltrato', label: 'Señales de maltrato'} ]},
    ],
    actuacion: [
        { title: "Diagnósticos e Indicaciones", fields: [ {name: 'diagnosticos', label: 'Diagnósticos'}, {name: 'patologia', label: 'Patología'}, {name: 'riesgoPsicosocial', label: 'Riesgo psicosocial'}, {name: 'indicaciones', label: 'Indicaciones'} ] }
    ]
};

const reflejosList = [
    { key: 'reflejoMoro', label: 'Moro' },
    { key: 'reflejoBusqueda', label: 'Búsqueda' },
    { key: 'reflejoSuccion', label: 'Succión' },
    { key: 'reflejoPrensionPalmar', label: 'Prensión Palmar' },
    { key: 'reflejoPrensionPlantar', label: 'Prensión Plantar' },
    { key: 'reflejoBabinski', label: 'Babinski' },
    { key: 'reflejoGalant', label: 'Galant' },
];

const proximoControlOptions = [
    { value: '', label: 'Seleccione...' },
    { value: '2° mes con enfermera', label: '2° mes con enfermera' },
    { value: '3° mes con médico', label: '3° mes con médico' },
    { value: '4° mes con enfermera', label: '4° mes con enfermera' },
    { value: '5° mes con nutricionista', label: '5° mes con nutricionista' },
    { value: '6° mes con enfermera', label: '6° mes con enfermera' },
];

interface FichaControlNinoSano1MesProps {
    onBackToMenu: () => void;
    loggedInUser: User | null;
}

const FichaControlNinoSano1Mes: React.FC<FichaControlNinoSano1MesProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlNinoSano1MesFormData>('local_FichaControlNinoSano1Mes', initialFormData);
    const [anamnesisText, setAnamnesisText] = useState('');
    const [exploracionText, setExploracionText] = useState('');
    const [actuacionText, setActuacionText] = useState('');
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isRmnModalOpen, setIsRmnModalOpen] = useState(false);
    const [isNeuroModalOpen, setIsNeuroModalOpen] = useState(false);

    const generateSummaryParts = useCallback(() => {
        const todayStr = new Date().toLocaleDateString('es-ES');
        const naneasVal = formData.naneasPresente ? `SÍ (${formData.naneasDetalle || 'No especificado'})` : 'NO';
        
        let anamnesis = `FICHA CONTROL NIÑO SANO 1° MES\n---------------------------------------\nFECHA INGRESO: ${todayStr}\nPROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || ''}\nNANEAS: ${naneasVal}\nMOTIVO DE CONSULTA: CONTROL NIÑO SANO 1° MES\n---------------------------------------\n\n`;
        let exploracion = '';
        let actuacion = '';
        
        const processBlock = (sections: any[]) => {
            let blockText = '';
            sections.forEach(section => {
                blockText += `${section.title.toUpperCase()}:\n`;
                section.fields.forEach((field: any) => {
                    const value = formData[field.name as keyof FichaControlNinoSano1MesFormData];
                    if (value && typeof value === 'string' && value.trim()) {
                        blockText += `- ${field.label}: ${value}\n`;
                    }
                });
                blockText += '\n';
            });
            return blockText;
        };

        // ANAMNESIS
        anamnesis += processBlock(formSections.anamnesis);

        // EXPLORACIÓN (Antropometría y Scores + Examen Físico + Reflejos)
        exploracion += `ANTROPOMETRÍA Y SCORES:\n`;
        exploracion += `- Peso: ${formData.peso} kg\n`;
        exploracion += `- Talla: ${formData.talla} cm\n`;
        exploracion += `- P. Cefálico: ${formData.perimetroCefalico} cm\n`;
        exploracion += `- Calificación Nutricional: ${formData.calificacionNutricional || 'Sin clasificar'}\n`;
        exploracion += `- Calificación Estatural: ${formData.calificacionEstatural || 'Sin clasificar'}\n`;
        exploracion += `- Evaluación P. Cefálico: ${formData.evaluacionPerimetroCefalico || 'Sin clasificar'}\n`;
        exploracion += `- Score RMN: ${formData.scoreRMN || 'No calculado'}\n`;
        exploracion += `- Score Neurosensorial: ${formData.scoreNeurosensorial || 'No evaluado'}\n\n`;
        
        exploracion += processBlock(formSections.exploracion);

        exploracion += `REFLEJOS ARCAICOS:\n`;
        reflejosList.forEach(reflejo => {
            const val = formData[reflejo.key as keyof FichaControlNinoSano1MesFormData];
            const detalle = formData[`${reflejo.key}Detalle` as keyof FichaControlNinoSano1MesFormData];
            exploracion += `- ${reflejo.label}: ${val}${val === 'Alterado' && detalle ? ` (${detalle})` : ''}\n`;
        });
        exploracion += '\n';

        // ACTUACIÓN
        actuacion += processBlock(formSections.actuacion);
        if (formData.proximoControl) {
            actuacion += `PRÓXIMO CONTROL: ${formData.proximoControl}\n`;
        }

        return {
            anamnesis: anamnesis.trim(),
            exploracion: exploracion.trim(),
            actuacion: actuacion.trim()
        };
    }, [formData, loggedInUser]);

    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = generateSummaryParts();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, generateSummaryParts]);
    
    useEffect(() => {
        const antropometriaString = `Peso: ${formData.peso} kg / Talla: ${formData.talla} cm / CC: ${formData.perimetroCefalico} cm`;
        setFormData(prev => ({...prev, antropometria: antropometriaString}));
    }, [formData.peso, formData.talla, formData.perimetroCefalico]);

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
        }).catch(err => {
            console.error('Error al copiar texto: ', err);
            alert('Error al copiar texto.');
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

    return (
        <div className="w-full h-auto lg:h-full flex flex-col">
      <div className="flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden">
        <div className="flex-grow lg:flex-1 overflow-visible lg:overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                      <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación y Crecimiento</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                            <select 
                                id="sexo" 
                                name="sexo" 
                                value={formData.sexo} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-black appearance-none"
                                style={{ color: 'black' }}
                            >
                                <option value="" className="text-black">Seleccione...</option>
                                <option value="femenino" className="text-black">Femenino</option>
                                <option value="masculino" className="text-black">Masculino</option>
                            </select>
                        </div>
                        <FormField label="Peso (kg)" id="peso" name="peso" value={formData.peso} onChange={handleChange} type="number" step="0.01" inputClassName="text-black" />
                        <FormField label="Talla (cm)" id="talla" name="talla" value={formData.talla} onChange={handleChange} type="number" step="0.1" inputClassName="text-black" />
                        <FormField label="P. Cefálico (cm)" id="perimetroCefalico" name="perimetroCefalico" value={formData.perimetroCefalico} onChange={handleChange} type="number" step="0.1" inputClassName="text-black" />
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

                    {/* BLOQUE ANAMNESIS */}
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
                                        value={formData[field.name as keyof FichaControlNinoSano1MesFormData] as string}
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
                                        value={formData[field.name as keyof FichaControlNinoSano1MesFormData] as string}
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
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{reflejo.label}:</label>
                                    <div className="flex gap-4 mb-2">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={reflejo.key}
                                                value="Presente"
                                                checked={formData[reflejo.key as keyof FichaControlNinoSano1MesFormData] === 'Presente'}
                                                onChange={handleChange}
                                                className="form-radio h-4 w-4 text-sky-600 focus:ring-sky-500"
                                            />
                                            <span className="ml-2 text-sm text-slate-700">Presente</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name={reflejo.key}
                                                value="Alterado"
                                                checked={formData[reflejo.key as keyof FichaControlNinoSano1MesFormData] === 'Alterado'}
                                                onChange={handleChange}
                                                className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-sm text-slate-700">Alterado</span>
                                        </label>
                                    </div>
                                    {formData[reflejo.key as keyof FichaControlNinoSano1MesFormData] === 'Alterado' && (
                                        <input
                                            type="text"
                                            name={`${reflejo.key}Detalle`}
                                            value={formData[`${reflejo.key}Detalle` as keyof FichaControlNinoSano1MesFormData] as string}
                                            onChange={handleChange}
                                            placeholder="Aclarar hallazgo..."
                                            className="w-full text-xs p-2 border border-red-200 rounded bg-red-50 text-black focus:ring-1 focus:ring-red-500 outline-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antropometría y Scores</h3>
                        <div className="space-y-4">
                             <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-1">Scores</h4>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => setIsRmnModalOpen(true)} className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-colors">Calcular Score RMN</button>
                                    <p className="flex-1 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm min-h-[40px] flex items-center justify-center font-medium text-blue-800">{formData.scoreRMN || 'Sin calcular'}</p>
                                </div>
                                <div className="flex items-center space-x-4 mt-3">
                                    <button onClick={() => setIsNeuroModalOpen(true)} className="flex-1 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-600 transition-colors">Evaluar Desarrollo</button>
                                    <p className="flex-1 p-2 bg-purple-50 border border-purple-200 rounded-md text-sm min-h-[40px] flex items-center justify-center font-medium text-purple-800">{formData.scoreNeurosensorial || 'Sin evaluar'}</p>
                                </div>
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
                                        value={formData[field.name as keyof FichaControlNinoSano1MesFormData] as string}
                                        onChange={handleChange}
                                        inputClassName="text-black"
                                        isTextArea={true}
                                        rows={field.name.toLowerCase().includes('indicaciones') ? 5 : 2}
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
                                  </form>
            </div>

        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
                        <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                                    <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                                    <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300 transition-colors">Copiar</button>
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
                                    <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300 transition-colors">Copiar</button>
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
                                    <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300 transition-colors">Copiar</button>
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

        {/* Barra de Acciones Inferior */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-6 rounded-xl shadow-sm">
            <button 
                type="button" 
                onClick={onBackToMenu} 
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm uppercase text-xs tracking-widest"
            >
                Volver al Menú
            </button>
            <button 
                type="button" 
                onClick={handleNewDocument} 
                className="w-full sm:w-auto px-8 py-3 bg-slate-700 text-white font-black rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
                BORRAR TODO
            </button>
        </div>
            
            <CurvasCrecimientoModal
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                onResults={handleCalculatorResults}
                initialData={{
                    sexo: (formData.sexo.toLowerCase() as "" | "femenino" | "masculino") || "",
                    edad: "1", 
                    peso: formData.peso,
                    talla: formData.talla,
                    pc: formData.perimetroCefalico,
                }}
            />
             <ScoreRMNModal 
                isOpen={isRmnModalOpen}
                onClose={() => setIsRmnModalOpen(false)}
                onSave={handleSaveRmnScore}
            />
            <ScoreNeurosensorialModal 
                isOpen={isNeuroModalOpen}
                onClose={() => setIsNeuroModalOpen(false)}
                onSave={handleSaveNeuroScore}
                edadMeses={1}
            />
          </div>
        </div>
      </div>
    
  );
};

export default FichaControlNinoSano1Mes;

