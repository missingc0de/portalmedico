import React, { useState, useCallback, useEffect } from 'react';
import { FichaIngresoSmFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import CopyButton from './CopyButton';
import { generateClinicalRecordPdf } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import SmartAntecedentesTextarea from './SmartAntecedentesTextarea';
import SmartFarmacosTextarea from './SmartFarmacosTextarea';

const AutoExpandingTextArea: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  containerClassName?: string;
  rows?: number;
  placeholder?: string;
}> = ({ label, id, name, value, onChange, containerClassName, rows = 3, placeholder }) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700 placeholder-slate-400 placeholder:opacity-30 min-h-[80px]"
      />
    </div>
  );
};

const defaultExamenMentalText = `- Descripción inicial: Vigil, orientado en tiempo, espacio y persona. Aborda y coopera con la entrevista.
- Orientación T-E-P: Orientado en tiempo, espacio y persona.
- Lenguaje: Coherente, atingente, fluido.
- Afectos: Modulado, concordante.
- Psicomotricidad: Tranquilo.
- Pensamiento: Curso y contenido sin alteraciones.
- Percepción/sensorial: Sin alteraciones.
- Intelectual: Aparente, sin alteraciones.
- Juicio de realidad: Conservado.
- Conciencia de enfermedad (insight): Presente.`;

const initialFormData: FichaIngresoSmFormData = {
  edad: '',
  sexo: '',
  sexoOtroAclaracion: '',
  antecedentesMedicos: '',
  antecedePsicoterapia: 'No',
  antecedentePsicoterapiaPsicologo: '',
  farmacos: '',
  adherenciaTratamiento: 'Sí',
  alergias: false,
  alergiasAclaracion: '',
  anamnesisProxima: '',
  historyDeVida: '',
  historyFamiliar: '',
  habitoTabaco: false,
  habitoTabacoAclaracion: '',
  habitoOh: false,
  habitoOhAclaracion: '',
  habitoDrogas: false,
  habitoDrogasAclaracion: '',
  estudios: '',
  relacionesSociales: '',
  redesApoyo: '',
  expectativasFuturo: '',
  sintomatologiaAnimo: 'Eutímico, modulado y concordante con el relato. Adecuado nivel de afectividad.',
  sintomatologiaAnsiosos: 'Niega síntomas de ansiedad clínicamente significativos, crisis de pánico o inquietud psicomotora.',
  sintomatologiaSomatizaciones: 'Niega cefaleas, dolor corporal de etiología no clara, palpitaciones, o síntomas gastrointestinales funcionales.',
  sintomatologiaAlteracionesSueno: 'Sueño de carácter reparador, de conciliación normal y sin despertares nocturnos intermitentes.',
  sintomatologiaPsicoticos: 'Niega ideación delirante, alucinaciones auditivas, visuales o sensopercepciones alteradas. Juicio de realidad conservado.',
  sintomatologiaIdeacionSuicida: 'Niega de forma activa ideas de muerte, planificación o intencionalidad suicida actual.',
  examenMental: defaultExamenMentalText,
  planOtros: `- Educación sobre patología.
- Prevención de exposición a alérgenos.
- Se deriva a vacunatorio.
- Pautas de alarma.
- Acudir a urgencias SOS.`,
};

interface FichaIngresoSmProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

interface CheckboxClarificationItem {
  keyBase: keyof FichaIngresoSmFormData;
  label: string;
}

const habitosConfig: CheckboxClarificationItem[] = [
  { keyBase: 'habitoTabaco', label: 'Tabaco' },
  { keyBase: 'habitoOh', label: 'Alcohol (OH)' },
  { keyBase: 'habitoDrogas', label: 'Drogas' },
];

const FichaIngresoSm: React.FC<FichaIngresoSmProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaIngresoSmFormData>('local_FichaIngresoSm_v2', initialFormData);
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);
  const [anamnesisText, setAnamnesisText] = useState<string>('');
  const [exploracionText, setExploracionText] = useState<string>('');
  const [actuacionText, setActuacionText] = useState<string>('');

  const calculateGeneratedTextParts = useCallback(() => {
    let anam = `FICHA INGRESO SALUD MENTAL\n---------------------------------------\nFECHA: ${new Date().toLocaleDateString('es-ES')}\n`;
    if (loggedInUser) anam += `PROFESIONAL: ${loggedInUser.fullName}\n`;
    
    let sexoDisplay = formData.sexo || 's/i';
    if (formData.sexo === 'Otro' && formData.sexoOtroAclaracion) {
      sexoDisplay += ` (${formData.sexoOtroAclaracion})`;
    }
    anam += `---------------------------------------\n\nDATOS GENERALES:\nEdad: ${formData.edad || 's/i'} | Sexo: ${sexoDisplay}\n`;
    anam += `Antecedentes médicos:\n${formData.antecedentesMedicos.trim() || 'No ingresado.'}\n`;
    
    const farmacosVal = formData.farmacos.trim();
    if (farmacosVal) {
      anam += `Fármacos:\n${farmacosVal}\n`;
    } else {
      anam += `Fármacos: No ingresado.\n`;
    }

    const checkAlergias = formData.alergias as boolean;
    const aclAlergias = formData.alergiasAclaracion;
    if (checkAlergias) {
      anam += `Alergias: Sí.${aclAlergias ? ` ${aclAlergias}` : ''}\n`;
    } else {
      anam += `Alergias: Niega.\n`;
    }
    anam += `Adherencia a tratamiento: ${formData.adherenciaTratamiento || 's/i'}\n`;
    
    let psicoterapiaLine = `Psicoterapia previa: ${formData.antecedePsicoterapia || 'No'}`;
    if (formData.antecedePsicoterapia === 'Sí' && formData.antecedentePsicoterapiaPsicologo) {
      psicoterapiaLine += ` (Psicólogo: ${formData.antecedentePsicoterapiaPsicologo})`;
    }
    anam += `${psicoterapiaLine}\n\n`;

    anam += `ANAMNESIS PRÓXIMA:\n${formData.anamnesisProxima || 's/i'}\n\n`;
    anam += `HISTORIA DE VIDA Y FAMILIAR:\n`;
    if (formData.historyDeVida) anam += `- Historia de vida: ${formData.historyDeVida}\n`;
    if (formData.historyFamiliar) anam += `- Historia familiar: ${formData.historyFamiliar}\n`;
    anam += `\n`;

    const addCheckbox = (label: string, key: keyof FichaIngresoSmFormData, prefix: string = '- ') => {
      const check = formData[key] as boolean;
      const acl = formData[`${String(key)}Aclaracion` as keyof FichaIngresoSmFormData] as string;
      const isPeriodNiega = String(key).startsWith('habito');
      const defaultText = isPeriodNiega ? 'Niega.' : 'Niega';

      if (check) {
        anam += `${prefix}${label}: Sí.${acl ? ` ${acl}` : ''}\n`;
      } else {
        anam += `${prefix}${label}: ${defaultText}\n`;
      }
    };

    anam += `HÁBITOS:\n`;
    habitosConfig.forEach(h => addCheckbox(h.label, h.keyBase));
    anam += `\n`;

    if (formData.estudios) anam += `Estudios: ${formData.estudios}\n`;
    if (formData.relacionesSociales) anam += `Relaciones sociales: ${formData.relacionesSociales}\n`;
    if (formData.redesApoyo) anam += `Redes de apoyo: ${formData.redesApoyo}\n`;
    if (formData.expectativasFuturo) anam += `Expectativas a futuro: ${formData.expectativasFuturo}\n`;
    anam += `\n`;

    anam += `SINTOMATOLOGÍA ACTUAL:\n`;
    if (formData.sintomatologiaAnimo) anam += `- Ánimo: ${formData.sintomatologiaAnimo}\n`;
    if (formData.sintomatologiaAnsiosos) anam += `- Síntomas ansiosos: ${formData.sintomatologiaAnsiosos}\n`;
    if (formData.sintomatologiaSomatizaciones) anam += `- Somatizaciones: ${formData.sintomatologiaSomatizaciones}\n`;
    if (formData.sintomatologiaAlteracionesSueno) anam += `- Alteraciones del sueño: ${formData.sintomatologiaAlteracionesSueno}\n`;
    if (formData.sintomatologiaPsicoticos) anam += `- Síntomas psicóticos: ${formData.sintomatologiaPsicoticos}\n`;
    if (formData.sintomatologiaIdeacionSuicida) anam += `- Ideación suicida: ${formData.sintomatologiaIdeacionSuicida}\n`;

    let expl = `EXAMEN MENTAL:\n${formData.examenMental || 's/i'}\n`;
    let actu = formData.planOtros || '';

    return { anamnesis: anam.trim(), exploracion: expl.trim(), actuacion: actu.trim() };
  }, [formData, loggedInUser]);

  useEffect(() => {
    const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
    setAnamnesisText(anamnesis);
    setExploracionText(exploracion);
    setActuacionText(actuacion);
    setStatus(FormStatus.TextGenerated);
  }, [calculateGeneratedTextParts]);

  const handleExportPdf = async () => {
    if (window.confirm("¿Seguro que desea exportar a PDF?")) {
      if (!loggedInUser) return;
      setStatus(FormStatus.Generating);
      try {
        await generateClinicalRecordPdf({ title: 'Ficha Ingreso Salud Mental', content: `${anamnesisText}\n\n${exploracionText}\n\n${actuacionText}` }, loggedInUser);
      } finally { setStatus(FormStatus.Idle); }
    }
  };

  const handleNewDocument = () => {
    if (window.confirm("¿Seguro que desea borrar el formulario actual?")) {
      setFormData(initialFormData);
      setStatus(FormStatus.Idle);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    else setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleRadioChange = (name: keyof FichaIngresoSmFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderCompactCheckbox = (item: CheckboxClarificationItem) => {
    const isChecked = formData[item.keyBase] as boolean;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaIngresoSmFormData;
    return (
      <div key={String(item.keyBase)} className="mb-2 last:mb-0">
          <div className="flex items-center gap-3">
              <input type="checkbox" id={String(item.keyBase)} name={String(item.keyBase)} checked={isChecked} onChange={handleChange as any} className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
              <label htmlFor={String(item.keyBase)} className="text-sm font-normal text-slate-700">{item.label}</label>
          </div>
          {isChecked && (
              <textarea name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange as any} placeholder="Detalle..." className="mt-1.5 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-900" />
          )}
      </div>
    );
  };

  const renderCheckboxField = (item: CheckboxClarificationItem) => {
    const isChecked = formData[item.keyBase] as boolean;
    const aclKey = `${String(item.keyBase)}Aclaracion` as keyof FichaIngresoSmFormData;
    return (
        <div key={String(item.keyBase)} className="mb-4 p-3 border border-slate-200 rounded-md bg-white shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
                <input type="checkbox" id={String(item.keyBase)} name={String(item.keyBase)} checked={isChecked} onChange={handleChange as any} className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
                <label htmlFor={String(item.keyBase)} className="text-sm font-normal text-slate-700">{item.label}</label>
            </div>
            {isChecked && (
                <textarea name={String(aclKey)} value={formData[aclKey] as string} onChange={handleChange as any} placeholder="Detalle..." className="mt-2 w-full p-2 text-xs border border-slate-300 rounded outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50 text-slate-900" />
            )}
        </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        
        {/* Columna Central: Formulario */}
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            <div className="overflow-y-auto custom-scrollbar pr-1 flex-1" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Identificación del paciente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange as any} inputClassName="text-slate-900" />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                        <div className="flex items-center space-x-4 h-[42px]">
                          {['Masculino', 'Femenino', 'Otro'].map(opt => (
                            <label key={opt} className="flex items-center text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="sexo"
                                value={opt}
                                checked={formData.sexo === opt}
                                onChange={() => handleRadioChange('sexo', opt)}
                                className="form-radio h-4 w-4 text-sky-600 focus:ring-sky-500"
                              />
                              <span className="ml-2 text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                        {formData.sexo === 'Otro' && (
                          <FormField label="" id="sexoOtroAclaracion" name="sexoOtroAclaracion" value={formData.sexoOtroAclaracion} onChange={handleChange as any} placeholder="Aclare..." containerClassName="mt-2" />
                        )}
                      </div>
                    </div>
                </section>
                
                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Antecedentes</h3>
                  
                  <div className="mt-4">
                    <SmartAntecedentesTextarea
                      label="Antecedentes médicos"
                      id="antecedentesMedicos"
                      name="antecedentesMedicos"
                      value={formData.antecedentesMedicos}
                      onChange={(val) => setFormData(prev => ({ ...prev, antecedentesMedicos: val }))}
                      placeholder="Escriba antecedentes médicos..."
                      bulletListMode={true}
                    />
                  </div>

                  <div className="mt-4">
                    <SmartFarmacosTextarea
                      label="Fármacos"
                      id="farmacos"
                      name="farmacos"
                      value={formData.farmacos}
                      onChange={(val) => setFormData(prev => ({ ...prev, farmacos: val }))}
                      placeholder="Escriba fármacos..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Adherencia a tratamiento:</label>
                    <div className="flex gap-4">
                      {[
                        { value: 'Sí', label: 'Sí' },
                        { value: 'No', label: 'No' },
                      ].map((opt) => (
                        <label key={opt.value} className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="adherenciaTratamiento"
                            value={opt.value}
                            checked={formData.adherenciaTratamiento === opt.value}
                            onChange={handleChange}
                            className="form-radio h-4 w-4 text-sky-600 transition duration-150 ease-in-out"
                          />
                          <span className="ml-2 text-slate-700 text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    {renderCheckboxField({ keyBase: 'alergias', label: 'Alergias' })}
                  </div>

                  <div className="mt-4 p-3 border border-slate-200 rounded-md bg-white">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Psicoterapia previa</label>
                    <div className="flex items-center space-x-4 mt-2">
                      {['Sí', 'No'].map(opt => (
                        <label key={opt} className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="antecedePsicoterapia"
                            value={opt}
                            checked={formData.antecedePsicoterapia === opt}
                            onChange={() => handleRadioChange('antecedePsicoterapia', opt)}
                            className="form-radio h-4 w-4 text-sky-600"
                          />
                          <span className="ml-2 text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {formData.antecedePsicoterapia === 'Sí' && (
                      <FormField label="Psicólogo tratante" id="antecedentePsicoterapiaPsicologo" name="antecedentePsicoterapiaPsicologo" value={formData.antecedentePsicoterapiaPsicologo} onChange={handleChange as any} placeholder="Nombre del psicólogo" containerClassName="mt-3"/>
                    )}
                  </div>
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Anamnesis e historia</h3>
                  <AutoExpandingTextArea label="Anamnesis próxima" id="anamnesisProxima" name="anamnesisProxima" value={formData.anamnesisProxima} onChange={handleChange as any} />
                  <AutoExpandingTextArea label="Historia de vida" id="historyDeVida" name="historyDeVida" value={formData.historyDeVida} onChange={handleChange as any} containerClassName="mt-4" />
                  <AutoExpandingTextArea label="Historia familiar" id="historyFamiliar" name="historyFamiliar" value={formData.historyFamiliar} onChange={handleChange as any} containerClassName="mt-4" />
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Contexto</h3>
                  <FormField label="Estudios" id="estudios" name="estudios" value={formData.estudios} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="Relaciones sociales" id="relacionesSociales" name="relacionesSociales" value={formData.relacionesSociales} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="Redes de apoyo" id="redesApoyo" name="redesApoyo" value={formData.redesApoyo} onChange={handleChange as any} containerClassName="mb-3" />
                  <FormField label="Expectativas a futuro" id="expectativasFuturo" name="expectativasFuturo" value={formData.expectativasFuturo} onChange={handleChange as any} />
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Sintomatología actual</h3>
                  <AutoExpandingTextArea label="Ánimo" id="sintomatologiaAnimo" name="sintomatologiaAnimo" value={formData.sintomatologiaAnimo} onChange={handleChange as any} containerClassName="mb-3" />
                  <AutoExpandingTextArea label="Síntomas ansiosos" id="sintomatologiaAnsiosos" name="sintomatologiaAnsiosos" value={formData.sintomatologiaAnsiosos} onChange={handleChange as any} containerClassName="mb-3" />
                  <AutoExpandingTextArea label="Somatizaciones" id="sintomatologiaSomatizaciones" name="sintomatologiaSomatizaciones" value={formData.sintomatologiaSomatizaciones} onChange={handleChange as any} containerClassName="mb-3" />
                  <AutoExpandingTextArea label="Alteraciones del sueño" id="sintomatologiaAlteracionesSueno" name="sintomatologiaAlteracionesSueno" value={formData.sintomatologiaAlteracionesSueno} onChange={handleChange as any} containerClassName="mb-3" />
                  <AutoExpandingTextArea label="Síntomas psicóticos" id="sintomatologiaPsicoticos" name="sintomatologiaPsicoticos" value={formData.sintomatologiaPsicoticos} onChange={handleChange as any} containerClassName="mb-3" />
                  <AutoExpandingTextArea label="Ideación suicida" id="sintomatologiaIdeacionSuicida" name="sintomatologiaIdeacionSuicida" value={formData.sintomatologiaIdeacionSuicida} onChange={handleChange as any} />
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Examen mental</h3>
                  <AutoExpandingTextArea label="Examen mental" id="examenMental" name="examenMental" value={formData.examenMental} onChange={handleChange as any} rows={12} />
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Hábitos</h3>
                  <div className="flex flex-col gap-3">
                    {habitosConfig.map(renderCompactCheckbox)}
                  </div>
                </section>

                <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">Plan</h3>
                  <AutoExpandingTextArea label="Indicaciones" id="planOtros" name="planOtros" value={formData.planOtros} onChange={handleChange as any} />
                </section>

              </form>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Sticky */}
        <div className="lg:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-2 lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden">
          {/* Tarjeta de Resumen */}
          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden w-full">
            <div className="border-b border-sky-200/80 pb-1 mb-2 w-full flex-shrink-0">
              <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
              {/* Anamnesis */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                  <CopyButton textToCopy={anamnesisText} />
                </div>
                <textarea value={anamnesisText} onChange={e => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              {/* Exploración */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                  <CopyButton textToCopy={exploracionText} />
                </div>
                <textarea value={exploracionText} onChange={e => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
              {/* Actuación */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                  <label className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                  <CopyButton textToCopy={actuacionText} />
                </div>
                <textarea value={actuacionText} onChange={e => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm" aria-label="Volver al menú principal">Volver al Menú</button>
        <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm" aria-label="Limpiar formulario y empezar nueva ficha">Limpiar Formulario (Nueva Ficha)</button>
      </div>
    </div>
  );
};

export default FichaIngresoSm;
