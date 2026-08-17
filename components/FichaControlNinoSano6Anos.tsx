import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlNinoSano6AnosFormData, User } from '../types';
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaControlNinoSano6AnosFormData = {
  antecedentesFarmacos: 'Niega',
  antecedentesCirugias: 'Niega',
  antecedentesAlergias: 'Niega',
  antecedentesHospitalizacion: 'Niega',
  antecedentesVacunas: 'PAI al día.',
  nutricionAlimentacion: '4 veces al día + colaciones, saludable y variada. Sin selectividad.',
  nutricionAmbiente: 'Familiar, come de forma independiente, sin distractores.',
  nutricionChatarra: 'No, muy rara vez en celebraciones.',
  nutricionHidratacion: 'Principalmente agua, escaso consumo de jugos. No consume bebidas.',
  higieneBano: 'Día por medio. En vías de independencia de aseo personal.',
  higieneVestimenta: 'Se viste y desviste sin ayuda.',
  higieneManos: 'Independiente vigilado.',
  higieneDental: 'Independiente vigilado.',
  actividadFisica: '',
  eliminacionPatrones: 'Adecuado control esfínteres (sin pañales desde los 2 años), sin enuresis ni encopresis diurna, enuresis nocturna aislada.\nOrina de características normales. Deposiciones 1 a 2 veces al día, de características normales, limpieza asistida por madre.',
  suenoHigiene: 'Comparte pieza con hermano, duerme en su propia cama.',
  suenoDificultades: '(-)',
  suenoParasomnias: 'Ronquidos (-), apneas (-), bruxismo (-), terrores nocturnos (-), enuresis (-) y encopresis (-).',
  hogarFamilia: 'Vive con madre y hermanos.',
  hogarEstresores: 'No.',
  conductaRelaciones: '',
  conductaRendimiento: '',
  conductaAutoridad: '',
  conductaRecreativas: 'Juego al aire libre diario, con hermanos, con participación y/o acompañamiento de madre.',
  conductaAccidentes: 'Niega.',
  conductaPantallas: 'Menos de 1h al día, supervisado.',
  efPeso: '',
  efTalla: '',
  efImc: '',
  efPercentilImc: '',
  efGeneral: 'Buenas condiciones generales, bien hidratado y perfundido.',
  efTiroides: 'Sin alteraciones.',
  efTorax: 'Simétrico, sin retracciones, RR2TSS, MP(+)SRA.',
  efAbdomen: 'RHA(+), BDI, sin masas ni visceromegalias.',
  efEeii: 'Pulsos (+), simétricos, edema (-).',
  efMarcha: 'Sin alteraciones, genu valgo fisiológico.',
  efTestAdams: 'Sin alteraciones.',
  efPiePlano: 'Pie plano flexible.',
  diagnosticos: 'Preescolar sano\nEutrófico, talla normal\nDesarrollo psicomotor normal',
  indicaciones: 'Se educa sobre hábitos de vida saludable, dieta y ejercicio.\nAlimentación saludable y variada, nutrición con agua.\nLavado dental luego de cada comida.\nSe educa sobre cuidados de la piel, prevención trauma acústico, hrs/pantalla, prevención accidentes y prevención oh/tabaco.\nActividad física acorde a edad, juego al aire libre y actividades familiares.\nUso de pantallas limitado, no mayor a 2 horas al día, nunca antes de dormir.\nHigiene del sueño, promover de 8 a 10 horas de dormir.\nEvitar exposición directa al sol: uso de bloqueador fps 50+, gorro, lentes de sol.\nConsulta salud bucal de los 6 años.\nHigiene personal promoviendo autonomía progresiva.\nUso de silla de seguridad hasta los 9 años, en asiento trasero hasta los 12 años.\nControl de salud anual.\nControl de salud bucal anual.\nConsultar en urgencias sos.',
};

const formSections = [
    { title: "Antecedentes", fields: [ {name: 'antecedentesFarmacos', label: 'Fármacos'}, {name: 'antecedentesCirugias', label: 'Cirugías'}, {name: 'antecedentesAlergias', label: 'Alergias'}, {name: 'antecedentesHospitalizacion', label: 'Hospitalización'}, {name: 'antecedentesVacunas', label: 'Vacunas'} ] },
    { title: "Nutrición", fields: [ {name: 'nutricionAlimentacion', label: 'Alimentación'}, {name: 'nutricionAmbiente', label: 'Ambiente y horarios'}, {name: 'nutricionChatarra', label: 'Chatarra/Golosinas'}, {name: 'nutricionHidratacion', label: 'Hidratación'} ] },
    { title: "Higiene y Actividad Física", fields: [ {name: 'higieneBano', label: 'Baño'}, {name: 'higieneVestimenta', label: 'Se viste y desviste'}, {name: 'higieneManos', label: 'Aseo de manos'}, {name: 'higieneDental', label: 'Lavado dental'}, {name: 'actividadFisica', label: 'Actividad Física'} ] },
    { title: "Patrones de Eliminación", fields: [ {name: 'eliminacionPatrones', label: 'Control de esfínteres, orina y deposiciones'} ] },
    { title: "Sueño", fields: [ {name: 'suenoHigiene', label: 'Higiene del sueño y ambiente'}, {name: 'suenoDificultades', label: 'Dificultades en el descanso'}, {name: 'suenoParasomnias', label: 'Ronquidos, apneas, etc.'} ] },
    { title: "Contexto Familiar y Social", fields: [ {name: 'hogarFamilia', label: 'Características hogar/familia'}, {name: 'hogarEstresores', label: 'Estresores o cambios recientes'} ] },
    { title: "Conducta", fields: [ {name: 'conductaRelaciones', label: 'Relaciones/Amistades'}, {name: 'conductaRendimiento', label: 'Curso/Rendimiento escolar'}, {name: 'conductaAutoridad', label: 'Figura de autoridad/sanciones'}, {name: 'conductaRecreativas', label: 'Act. recreativas'}, {name: 'conductaAccidentes', label: 'Accidentes'}, {name: 'conductaPantallas', label: 'Horas de pantalla'} ] },
    { title: "Examen Físico", fields: [ {name: 'efPeso', label: 'Peso (kg)'}, {name: 'efTalla', label: 'Talla (cm)'}, {name: 'efImc', label: 'IMC', readOnly: true}, {name: 'efPercentilImc', label: 'Percentil IMC'}, {name: 'efGeneral', label: 'General'}, {name: 'efTiroides', label: 'Tiroides'}, {name: 'efTorax', label: 'Tórax'}, {name: 'efAbdomen', label: 'Abdomen'}, {name: 'efEeii', label: 'EEII'}, {name: 'efMarcha', label: 'Marcha'}, {name: 'efTestAdams', label: 'Test de Adams'}, {name: 'efPiePlano', label: 'Pie plano'} ] },
    { title: "Diagnósticos e Indicaciones", fields: [ {name: 'diagnosticos', label: 'Diagnósticos'}, {name: 'indicaciones', label: 'Indicaciones'} ] },
];

interface FichaControlNinoSano6AnosProps {
    onBackToMenu: () => void;
    loggedInUser: User | null;
}

const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlNinoSano6AnosFormData>('local_FichaControlNinoSano6Anos', initialFormData);
    const [anamnesisText, setAnamnesisText] = useState('');
    const [exploracionText, setExploracionText] = useState('');
    const [actuacionText, setActuacionText] = useState('');

    const calculateIMC = useCallback((pesoStr: string, tallaStr: string): string => {
        const peso = parseFloat(pesoStr);
        const tallaCm = parseFloat(tallaStr);
        if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
          const tallaM = tallaCm / 100;
          return (peso / (tallaM * tallaM)).toFixed(2);
        }
        return '';
    }, []);

    const generateSummaryParts = useCallback(() => {
        const todayStr = new Date().toLocaleDateString('es-ES');
        let anamnesis = `FICHA CONTROL NIÑO SANO 6 AÑOS\n---------------------------------------\nFECHA INGRESO: ${todayStr}\nPROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || ''}\nMOTIVO DE CONSULTA: CONTROL NIÑO SANO 6 AÑOS\n---------------------------------------\n\n`;
        let exploracion = ``;
        let actuacion = ``;

        const processSection = (title: string) => {
            const section = formSections.find(s => s.title === title);
            if (!section) return '';
            let sectionText = `${section.title.toUpperCase()}:\n`;
            let hasContent = false;
            section.fields.forEach(field => {
                const value = formData[field.name as keyof FichaControlNinoSano6AnosFormData] as string;
                if (value && value.trim()) {
                    sectionText += `- ${field.label}: ${value}\n`;
                    hasContent = true;
                }
            });
            return hasContent ? `${sectionText}\n` : '';
        };

        // ANAMNESIS
        anamnesis += processSection("Antecedentes");
        anamnesis += processSection("Nutrición");
        anamnesis += processSection("Higiene y Actividad Física");
        anamnesis += processSection("Patrones de Eliminación");
        anamnesis += processSection("Sueño");
        anamnesis += processSection("Contexto Familiar y Social");
        anamnesis += processSection("Conducta");

        // EXPLORACIÓN
        exploracion += processSection("Examen Físico");

        // ACTUACIÓN
        actuacion += processSection("Diagnósticos e Indicaciones");

        return {
            anamnesis: anamnesis.trim(),
            exploracion: exploracion.trim(),
            actuacion: actuacion.trim()
        };
    }, [formData, loggedInUser]);

    useEffect(() => {
        const newImc = calculateIMC(formData.efPeso, formData.efTalla);
        if (newImc !== formData.efImc) {
            setFormData(prev => ({ ...prev, efImc: newImc }));
        }
    }, [formData.efPeso, formData.efTalla, formData.efImc, calculateIMC]);

    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = generateSummaryParts();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, generateSummaryParts]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    return (
        <div className="w-full h-auto lg:h-full flex flex-col">
      <div className="flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden">
        <div className="flex-grow lg:flex-1 overflow-visible lg:overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">
                    {formSections.map(section => (
                        <section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">{section.title}</h3>
                            <div className="space-y-3">
                                {section.fields.map(field => (
                                    <FormField
                                        key={field.name}
                                        label={field.label}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name as keyof FichaControlNinoSano6AnosFormData] as string}
                                        onChange={handleChange}
                                        isTextArea={field.name.toLowerCase().includes('indicaciones') || field.name.toLowerCase().includes('diagnosticos') || field.name.toLowerCase().includes('patrones') || field.name.toLowerCase().includes('higiene') || field.name.toLowerCase().includes('alimentacion')}
                                        rows={field.name.toLowerCase().includes('indicaciones') ? 8 : (field.name.toLowerCase().includes('patrones') ? 4 : 2)}
                                        readOnly={field.readOnly}
                                        disabled={field.readOnly}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
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
        </div>
      </div>
  );
};

export default FichaControlNinoSano6Anos;

