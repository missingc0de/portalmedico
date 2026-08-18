import React, { useState, useEffect } from 'react';
import { FichaVisitaDomiciliariaFormData, FormStatus, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import UserAutocomplete from './UserAutocomplete';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import { generateFichaVdiPdf } from '../services/pdfGenerator';
import { FileText, Trash2, ArrowLeft } from 'lucide-react';

interface Props {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const initialFormData: FichaVisitaDomiciliariaFormData = {
  sector: '',
  direccion: '',
  prestadores: '',
  derivadoPor: '',
  familia: '',
  viaDerivacion: '',
  viaDerivacionAclare: '',
  fechaVdi: new Date().toISOString().split('T')[0],
  fechaPautaVdi: new Date().toISOString().split('T')[0],
  integrantes: [],
  objetivos: [''],
  expectativasFamilia: '',
  cuidadorPrincipal: '',
  cuidadorEdad: '',
  cuidadorEnfermedades: '',
  viviendaTenencia: '',
  viviendaTenenciaObs: '',
  problemasViviendaFamilia: '',
  problemasViviendaEquipo: '',
  serviciosAguaPotable: false,
  serviciosSistemaElectrico: false,
  serviciosDisposicionDesechos: false,
  serviciosObs: '',
  problemasPriorizados: [],
  recursosPersonales: '',
  recursosMateriales: '',
  recursosFuncionales: '',
  recursosOtros: '',
  otrasIntervenciones: '',
  otrasIntervencionesAclare: '',
  realizaTarjeton: '',
  otrosInstrumentos: '',
  otrosInstrumentosAclare: '',
  firmoConsentimiento: '',
  registraPci: '',
  continuidadAtencionObs: '',
  logroObjetivos: '',
  logroObjetivosObs: '',
  logroExpectativas: '',
};

const sectorOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Verde', label: 'Verde' },
  { value: 'Amarillo', label: 'Amarillo' },
  { value: 'Naranjo', label: 'Naranjo' },
];

const tenenciaOptions = [
  { value: '', label: 'Seleccione...' },
  { value: 'Propia', label: 'Propia' },
  { value: 'Arrendada', label: 'Arrendada' },
  { value: 'Allegado', label: 'Allegado' },
  { value: 'Otras', label: 'Otras' },
];

const AutoExpandingTextArea: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  containerClassName?: string;
}> = ({ label, id, name, value = '', onChange, placeholder, containerClassName }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={`w-full ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={1}
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-150 ease-in-out text-slate-700 placeholder-slate-400 overflow-hidden min-h-[42px]"
      />
    </div>
  );
};

const CopyButton: React.FC<{ textToCopy: string; className?: string }> = ({ textToCopy, className }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] sm:text-xs font-bold rounded transition-colors ${className || ''}`}>
      {copied ? (
        <>
          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ¡COPIADO!
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          COPIAR
        </>
      )}
    </button>
  );
};

export default function FichaVisitaDomiciliaria({ onBackToMenu, loggedInUser }: Props) {
  const [formData, setFormData] = useFormLocalStorage<FichaVisitaDomiciliariaFormData>(
    'local_FichaVisitaDomiciliaria',
    initialFormData
  );
  const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);

  const [showTenenciaObs, setShowTenenciaObs] = useState(false);
  const [showServiciosObs, setShowServiciosObs] = useState(false);

  const [anamnesisText, setAnamnesisText] = useState('');
  const [exploracionText, setExploracionText] = useState('');
  const [actuacionText, setActuacionText] = useState('');

  useEffect(() => {
    let anamnesis = `FICHA VISITA DOMICILIARIA INTEGRAL (VDI)
---------------------------------------\n`;
    if (formData.sector) anamnesis += `SECTOR: ${formData.sector}\n`;
    if (formData.direccion) anamnesis += `DIRECCIÓN: ${formData.direccion}\n`;
    if (formData.prestadores) anamnesis += `PRESTADORES: ${formData.prestadores}\n`;
    if (formData.derivadoPor) anamnesis += `DERIVADO POR: ${formData.derivadoPor}\n`;
    if (formData.familia) anamnesis += `FAMILIA: ${formData.familia}\n`;
    if (formData.viaDerivacion) anamnesis += `VÍA DE DERIVACIÓN: ${formData.viaDerivacion} ${formData.viaDerivacion === 'Otra' ? `(${formData.viaDerivacionAclare})` : ''}\n`;
    anamnesis += `FECHA VDI: ${formData.fechaVdi}\nFECHA PAUTA: ${formData.fechaPautaVdi}\n---------------------------------------\n`;

    if (formData.integrantes.length > 0) {
      anamnesis += `\nINTEGRANTES DEL GRUPO FAMILIAR\n`;
      formData.integrantes.forEach(int => {
        if (int.nombre || int.edad || int.parentesco) {
          anamnesis += `- ${int.nombre} | ${int.edad} años | ${int.parentesco}\n`;
        }
      });
      anamnesis += `\n`;
    }

    if (formData.objetivos.filter(o => o.trim()).length > 0) {
      anamnesis += `OBJETIVOS DE LA VDI\n`;
      formData.objetivos.filter(o => o.trim()).forEach((obj, i) => {
        anamnesis += `${i + 1}. ${obj}\n`;
      });
      anamnesis += `\n`;
    }

    if (formData.expectativasFamilia) anamnesis += `Expectativas familia: ${formData.expectativasFamilia}\n`;

    if (formData.cuidadorPrincipal || formData.cuidadorEnfermedades) {
      anamnesis += `\nCUIDADOR PRINCIPAL\nNombre: ${formData.cuidadorPrincipal} | Edad: ${formData.cuidadorEdad}\nEnfermedades: ${formData.cuidadorEnfermedades}\n`;
    }

    anamnesis += `\nVIVIENDA Y ENTORNO\n`;
    anamnesis += `Tenencia: ${formData.viviendaTenencia} ${formData.viviendaTenenciaObs ? `(${formData.viviendaTenenciaObs})` : ''}\n`;
    if (formData.problemasViviendaFamilia) anamnesis += `Riesgos percibidos por familia: ${formData.problemasViviendaFamilia}\n`;
    if (formData.problemasViviendaEquipo) anamnesis += `Riesgos percibidos por equipo: ${formData.problemasViviendaEquipo}\n`;

    const servicios = [];
    if (formData.serviciosAguaPotable) servicios.push('Agua potable');
    if (formData.serviciosSistemaElectrico) servicios.push('Sistema eléctrico');
    if (formData.serviciosDisposicionDesechos) servicios.push('Disposición desechos');
    if (servicios.length > 0) {
      anamnesis += `Servicios básicos: ${servicios.join(', ')}. ${formData.serviciosObs}\n`;
    }

    setAnamnesisText(anamnesis.trim());

    let exploracion = `ANÁLISIS Y PRIORIZACIÓN DE PROBLEMAS\n`;
    if (formData.problemasPriorizados.length > 0) {
      formData.problemasPriorizados.forEach((p, i) => {
        if (p.problema) {
          exploracion += `${i + 1}. ${p.problema} [Puntaje: ${p.puntaje}]\n`;
        }
      });
    }
    exploracion += `\nIDENTIFICACIÓN DE RECURSOS\n`;
    exploracion += `Personales: ${formData.recursosPersonales || '-'}\n`;
    exploracion += `Materiales: ${formData.recursosMateriales || '-'}\n`;
    exploracion += `Funcionales: ${formData.recursosFuncionales || '-'}\n`;
    exploracion += `Otros: ${formData.recursosOtros || '-'}\n\n`;
    exploracion += `¿Otras intervenciones intersector?: ${formData.otrasIntervenciones || '-'} ${formData.otrasIntervenciones === 'Sí' ? `(${formData.otrasIntervencionesAclare})` : ''}\n`;
    
    setExploracionText(exploracion.trim());

    let actuacion = `INSTRUMENTOS\n`;
    actuacion += `¿Realiza tarjetón familiar?: ${formData.realizaTarjeton || '-'}\n`;
    actuacion += `¿Firmó consentimiento?: ${formData.firmoConsentimiento || '-'}\n`;
    actuacion += `¿Otros instrumentos?: ${formData.otrosInstrumentos || '-'} ${formData.otrosInstrumentos === 'Sí' ? `(${formData.otrosInstrumentosAclare})` : ''}\n\n`;

    actuacion += `PLAN DE CONTINUIDAD\n`;
    actuacion += `¿Registra PCI en tarjetón?: ${formData.registraPci || '-'}\n`;
    actuacion += `Observaciones: ${formData.continuidadAtencionObs || '-'}\n\n`;

    actuacion += `EVALUACIÓN FINAL\n`;
    actuacion += `¿Se lograron objetivos VDI?: ${formData.logroObjetivos || '-'}\n`;
    actuacion += `Obs. logro objetivos: ${formData.logroObjetivosObs || '-'}\n`;
    actuacion += `¿Se lograron expectativas familiares?: ${formData.logroExpectativas || '-'}\n`;

    setActuacionText(actuacion.trim());
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIntegrantesChange = (index: number, field: keyof typeof formData.integrantes[0], value: string) => {
    const newIntegrantes = [...formData.integrantes];
    newIntegrantes[index] = { ...newIntegrantes[index], [field]: value };
    setFormData((prev) => ({ ...prev, integrantes: newIntegrantes }));
  };

  const addIntegrante = () => {
    setFormData((prev) => ({
      ...prev,
      integrantes: [...prev.integrantes, { nombre: '', edad: '', parentesco: '' }],
    }));
  };

  const removeIntegrante = (index: number) => {
    const newIntegrantes = formData.integrantes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, integrantes: newIntegrantes }));
  };

  const handleObjetivoChange = (index: number, value: string) => {
    const newObjetivos = [...formData.objetivos];
    newObjetivos[index] = value;
    setFormData((prev) => ({ ...prev, objetivos: newObjetivos }));
  };

  const addObjetivo = () => {
    setFormData((prev) => ({ ...prev, objetivos: [...prev.objetivos, ''] }));
  };

  const removeObjetivo = (index: number) => {
    const newObjetivos = formData.objetivos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, objetivos: newObjetivos }));
  };

  const handleProblemaChange = (index: number, field: 'problema' | 'puntaje', value: string) => {
    const newProblemas = [...formData.problemasPriorizados];
    newProblemas[index] = { ...newProblemas[index], [field]: value };
    setFormData((prev) => ({ ...prev, problemasPriorizados: newProblemas }));
  };

  const addProblema = () => {
    setFormData((prev) => ({
      ...prev,
      problemasPriorizados: [...prev.problemasPriorizados, { problema: '', puntaje: '' }],
    }));
  };

  const removeProblema = (index: number) => {
    const newProblemas = formData.problemasPriorizados.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, problemasPriorizados: newProblemas }));
  };

  const handleClearForm = () => {
    if (window.confirm('¿Está seguro de limpiar el formulario por completo?')) {
      setFormData(initialFormData);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      setStatus(FormStatus.Generating);
      await generateFichaVdiPdf(formData, loggedInUser!, anamnesisText, exploracionText, actuacionText);
      setStatus(FormStatus.Idle);
    } catch (e: any) {
      console.error(e);
      alert('Ocurrió un error compilando el documento VDI. Detalle: ' + e.message);
      setStatus(FormStatus.Error);
    }
  };

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full items-start h-auto lg:h-[calc(100vh-72px)] lg:overflow-hidden relative">
        {/* === Columna Izquierda: Formulario === */}
        <div className="lg:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4 pb-16">

                {/* IDENTIFICACIÓN */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Sector</label>
                      <select name="sector" value={formData.sector} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                        {sectorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <FormField label="Dirección" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Prestadores</label>
                      <UserAutocomplete value={formData.prestadores} onChange={val => setFormData(p => ({ ...p, prestadores: val }))} onSelect={user => setFormData(p => ({ ...p, prestadores: user.fullName }))} onClear={() => setFormData(p => ({ ...p, prestadores: '' }))} />
                    </div>
                    <FormField label="Derivado por" id="derivadoPor" name="derivadoPor" value={formData.derivadoPor} onChange={handleChange} />
                    <FormField label="Familia" id="familia" name="familia" value={formData.familia} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Vía de derivación</label>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="viaDerivacion" value="Correo" checked={formData.viaDerivacion === 'Correo'} onChange={handleChange} />Correo</label>
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="viaDerivacion" value="Otra" checked={formData.viaDerivacion === 'Otra'} onChange={handleChange} />Otra</label>
                        {formData.viaDerivacion === 'Otra' && <div className="flex-1 min-w-[200px]"><FormField label="" placeholder="Especificar otra vía de derivación..." id="viaDerivacionAclare" name="viaDerivacionAclare" value={formData.viaDerivacionAclare} onChange={handleChange} /></div>}
                      </div>
                    </div>
                    <DateField label="Fecha de VDI" id="fechaVdi" name="fechaVdi" value={formData.fechaVdi} onChange={handleChange} />
                    <DateField label="Fecha de Realización de Pauta" id="fechaPautaVdi" name="fechaPautaVdi" value={formData.fechaPautaVdi} onChange={handleChange} />
                  </div>
                </section>

                {/* INTEGRANTES DEL GRUPO FAMILIAR */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-center mb-3 border-b border-sky-200 pb-2">
                    <h3 className="text-lg font-semibold text-sky-700">Integrantes del Grupo Familiar</h3>
                    <button onClick={addIntegrante} className="text-white bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded-md text-xs font-bold">+ AGREGAR</button>
                  </div>
                  <div className="space-y-4">
                    {formData.integrantes.length === 0 && <p className="text-sm text-slate-500">No hay integrantes registrados.</p>}
                    {formData.integrantes.map((int, i) => (
                      <div key={i} className="flex flex-wrap lg:flex-nowrap gap-4 items-end bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex-1 w-full"><FormField label="Nombre" id={`int_n_${i}`} name="nombre" value={int.nombre} onChange={(e) => handleIntegrantesChange(i, 'nombre', e.target.value)} /></div>
                        <div className="w-24 shrink-0"><FormField label="Edad" id={`int_e_${i}`} name="edad" value={int.edad} onChange={(e) => handleIntegrantesChange(i, 'edad', e.target.value)} /></div>
                        <div className="flex-1 w-full"><FormField label="Parentesco" id={`int_p_${i}`} name="parentesco" value={int.parentesco} onChange={(e) => handleIntegrantesChange(i, 'parentesco', e.target.value)} /></div>
                        <button onClick={() => removeIntegrante(i)} className="p-2 h-[42px] w-[42px] shrink-0 mb-auto lg:mb-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg flex items-center justify-center font-bold">X</button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* OBJETIVOS Y EXPECTATIVAS */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Objetivos y Expectativas</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Objetivos de la VDI</label>
                        <button onClick={addObjetivo} className="text-sky-600 hover:text-sky-700 text-xs font-bold">+ AGREGAR OBJETIVO</button>
                      </div>
                      {formData.objetivos.map((obj, i) => (
                        <div key={i} className="flex gap-2 items-center mb-2">
                          <span className="text-sm text-slate-500 font-bold">{i + 1}.</span>
                          <input type="text" className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-sm" value={obj} onChange={(e) => handleObjetivoChange(i, e.target.value)} placeholder="Describa el objetivo..." />
                          <button onClick={() => removeObjetivo(i)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                        </div>
                      ))}
                    </div>
                    <AutoExpandingTextArea label="Expectativas de la familia frente a la visita" id="expectativasFamilia" name="expectativasFamilia" value={formData.expectativasFamilia} onChange={handleChange} />
                  </div>
                </section>

                {/* CUIDADOR */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antecedentes de Cuidador</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Cuidador principal" id="cuidadorPrincipal" name="cuidadorPrincipal" value={formData.cuidadorPrincipal} onChange={handleChange} />
                    <FormField label="Edad del cuidador" id="cuidadorEdad" name="cuidadorEdad" value={formData.cuidadorEdad} onChange={handleChange} />
                    <div className="md:col-span-2"><FormField label="Enfermedades" id="cuidadorEnfermedades" name="cuidadorEnfermedades" value={formData.cuidadorEnfermedades} onChange={handleChange} /></div>
                  </div>
                </section>

                {/* VIVIENDA Y ENTORNO */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Vivienda y Entorno</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Tenencia</label>
                      <div className="flex gap-2 w-full sm:w-1/2">
                        <select name="viviendaTenencia" value={formData.viviendaTenencia} onChange={handleChange} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500">
                          {tenenciaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => setShowTenenciaObs(!showTenenciaObs)} className="bg-slate-200 hover:bg-slate-300 px-3 py-1 text-sm font-medium rounded-lg shrink-0 transition-colors">Obs.</button>
                      </div>
                      {showTenenciaObs && <div className="mt-2"><FormField label="Observaciones Tenencia" id="viviendaTenenciaObs" name="viviendaTenenciaObs" value={formData.viviendaTenenciaObs} onChange={handleChange} /></div>}
                    </div>

                    <AutoExpandingTextArea label="Problemas y/o riesgos de la vivienda percibidos por la familia" id="problemasViviendaFamilia" name="problemasViviendaFamilia" value={formData.problemasViviendaFamilia} onChange={handleChange} />
                    <AutoExpandingTextArea label="Problemas y/o riesgos de la vivienda percibidos por el equipo" id="problemasViviendaEquipo" name="problemasViviendaEquipo" value={formData.problemasViviendaEquipo} onChange={handleChange} />

                    <div className="pt-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Servicios disponibles</label>
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <label className="flex items-center gap-2"><input type="checkbox" name="serviciosAguaPotable" checked={formData.serviciosAguaPotable} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" /> Agua potable</label>
                        <label className="flex items-center gap-2"><input type="checkbox" name="serviciosSistemaElectrico" checked={formData.serviciosSistemaElectrico} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" /> Sistema Eléctrico</label>
                        <label className="flex items-center gap-2"><input type="checkbox" name="serviciosDisposicionDesechos" checked={formData.serviciosDisposicionDesechos} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" /> Disposición desechos</label>
                        <button onClick={() => setShowServiciosObs(!showServiciosObs)} className="bg-slate-200 hover:bg-slate-300 px-3 py-1 text-sm font-medium rounded-lg transition-colors ml-auto">Obs.</button>
                      </div>
                      {showServiciosObs && <FormField label="Observaciones Servicios" id="serviciosObs" name="serviciosObs" value={formData.serviciosObs} onChange={handleChange} />}
                    </div>
                  </div>
                </section>

                {/* PRIORIZACIÓN DE PROBLEMAS */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-center mb-3 border-b border-sky-200 pb-2">
                    <h3 className="text-lg font-semibold text-sky-700">Análisis y Priorización de Problemas</h3>
                    <button onClick={addProblema} className="text-white bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded-md text-xs font-bold transition-colors">+ AGREGAR</button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 mb-2 italic">Coloque el puntaje donde 3 es de mayor relevancia, 2 mediana relevancia y 1 menor relevancia.</p>
                    {formData.problemasPriorizados.map((prob, i) => (
                      <div key={i} className="flex gap-4 items-end mb-2">
                        <span className="text-sm font-bold text-slate-500 mb-3">{i + 1}.</span>
                        <div className="flex-1"><FormField label="Problema priorizado" id={`prob_${i}`} name="problema" value={prob.problema} onChange={(e) => handleProblemaChange(i, 'problema', e.target.value)} /></div>
                        <div className="w-24 shrink-0">
                          <label className="block text-[11px] font-medium text-slate-700 mb-1">Punto (1-3)</label>
                          <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-sky-500" value={prob.puntaje} onChange={(e) => handleProblemaChange(i, 'puntaje', e.target.value)}>
                            <option value=""></option><option value="1">1</option><option value="2">2</option><option value="3">3</option>
                          </select>
                        </div>
                        <button onClick={() => removeProblema(i)} className="text-red-500 font-bold px-2 hover:bg-red-50 rounded h-10 mb-1 transition-colors">X</button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* IDENTIFICACIÓN DE RECURSOS */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación de los Recursos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Personales" id="recursosPersonales" name="recursosPersonales" value={formData.recursosPersonales} onChange={handleChange} />
                    <FormField label="Materiales" id="recursosMateriales" name="recursosMateriales" value={formData.recursosMateriales} onChange={handleChange} />
                    <FormField label="Funcionales" id="recursosFuncionales" name="recursosFuncionales" value={formData.recursosFuncionales} onChange={handleChange} />
                    <FormField label="Otros" id="recursosOtros" name="recursosOtros" value={formData.recursosOtros} onChange={handleChange} />
                  </div>
                </section>

                {/* OTRAS INTERVENCIONES E INSTRUMENTOS */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Intervenciones e Instrumentos</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-slate-700">Otras Intervenciones del Intersector</p>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="otrasIntervenciones" value="Sí" checked={formData.otrasIntervenciones === 'Sí'} onChange={handleChange} className="text-sky-600 focus:ring-sky-500" /> Sí</label>
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="otrasIntervenciones" value="No" checked={formData.otrasIntervenciones === 'No'} onChange={handleChange} className="text-sky-600 focus:ring-sky-500" /> No</label>
                      </div>
                      {formData.otrasIntervenciones === 'Sí' && <FormField label="Aclaración" id="otrasIntervencionesAclare" name="otrasIntervencionesAclare" value={formData.otrasIntervencionesAclare} onChange={handleChange} placeholder="Especifique..." />}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <p className="font-semibold text-sm text-slate-700">Instrumentos de Evaluación Familiar</p>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm w-48 text-slate-600">¿Se realiza tarjetón familiar?</span>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="realizaTarjeton" value="Sí" checked={formData.realizaTarjeton === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="realizaTarjeton" value="No" checked={formData.realizaTarjeton === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm w-48 text-slate-600">¿Firmó consentimiento?</span>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="firmoConsentimiento" value="Sí" checked={formData.firmoConsentimiento === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="firmoConsentimiento" value="No" checked={formData.firmoConsentimiento === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                      </div>
                      <div>
                        <div className="flex gap-4 items-center mb-2">
                          <span className="text-sm w-48 text-slate-600">Otros instrumentos</span>
                          <label className="flex items-center gap-1 text-sm"><input type="radio" name="otrosInstrumentos" value="Sí" checked={formData.otrosInstrumentos === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                          <label className="flex items-center gap-1 text-sm"><input type="radio" name="otrosInstrumentos" value="No" checked={formData.otrosInstrumentos === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                        </div>
                        {formData.otrosInstrumentos === 'Sí' && <FormField label="Aclaración" id="otrosInstrumentosAclare" name="otrosInstrumentosAclare" value={formData.otrosInstrumentosAclare} onChange={handleChange} placeholder="Especifique..." />}
                      </div>
                    </div>
                  </div>
                </section>

                {/* PLAN Y EVALUACIÓN FINAL */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Plan y Evaluación Final</h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="font-semibold text-sm text-slate-700">Plan de Continuidad de Atención</p>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm w-48 text-slate-600">¿Registra PCI en tarjetón?</span>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="registraPci" value="Sí" checked={formData.registraPci === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                        <label className="flex items-center gap-1 text-sm"><input type="radio" name="registraPci" value="No" checked={formData.registraPci === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                      </div>
                      <AutoExpandingTextArea label="Observaciones del Plan" id="continuidadAtencionObs" name="continuidadAtencionObs" value={formData.continuidadAtencionObs} onChange={handleChange} placeholder="Añada aquí observaciones respecto al plan..." />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <p className="font-semibold text-sm text-slate-700">Evaluación Final</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex gap-4 items-center">
                            <span className="text-sm w-48 text-slate-600">¿Se lograron obj. de la VDI?</span>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="logroObjetivos" value="Sí" checked={formData.logroObjetivos === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="logroObjetivos" value="No" checked={formData.logroObjetivos === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                          </div>
                          <AutoExpandingTextArea label="Observaciones Logro Objetivos" id="logroObjetivosObs" name="logroObjetivosObs" value={formData.logroObjetivosObs} onChange={handleChange} />
                        </div>

                        <div className="space-y-4">
                          <div className="flex gap-4 items-center">
                            <span className="text-sm w-48 text-slate-600">¿Se lograron expectativas?</span>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="logroExpectativas" value="Sí" checked={formData.logroExpectativas === 'Sí'} onChange={handleChange} className="text-sky-600" /> Sí</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="logroExpectativas" value="No" checked={formData.logroExpectativas === 'No'} onChange={handleChange} className="text-sky-600" /> No</label>
                          </div>
                        </div>
                      </div>
                    </div>
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
                {/* 1. ANAMNESIS */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">ANAMNESIS</label>
                    <CopyButton textToCopy={anamnesisText} />
                  </div>
                  <textarea
                    id="anamnesisText"
                    value={anamnesisText}
                    onChange={(e) => setAnamnesisText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono resize-none leading-relaxed"
                    aria-label="Anamnesis - editable"
                  />
                </div>

                {/* 2. EXPLORACIÓN */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">EXPLORACIÓN</label>
                    <CopyButton textToCopy={exploracionText} />
                  </div>
                  <textarea
                    id="exploracionText"
                    value={exploracionText}
                    onChange={(e) => setExploracionText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono resize-none leading-relaxed"
                    aria-label="Exploración - editable"
                  />
                </div>

                {/* 3. ACTUACIÓN */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                    <label className="block text-[11px] font-semibold text-slate-800">ACTUACIÓN</label>
                    <CopyButton textToCopy={actuacionText} />
                  </div>
                  <textarea
                    id="actuacionText"
                    value={actuacionText}
                    onChange={(e) => setActuacionText(e.target.value)}
                    className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none font-mono resize-none leading-relaxed"
                    aria-label="Actuación - editable"
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-3 gap-1.5 w-full shrink-0">
              <button
                type="button"
                onClick={handleGenerateDocument}
                disabled={status === FormStatus.Generating}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden disabled:bg-slate-400"
                title="Exportar Resumen PDF"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{status === FormStatus.Generating ? 'EXPORTANDO...' : 'EXPORTAR PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Limpiar Formulario y Crear Nuevo"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">BORRAR TODO</span>
              </button>

              <button
                type="button"
                onClick={onBackToMenu}
                className="w-full flex items-center justify-center gap-1 px-1 py-1.5 bg-slate-500 hover:bg-slate-600 text-white font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-2xs transition-all duration-150 cursor-pointer h-[32px] overflow-hidden"
                title="Volver al Menú Principal"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">MENÚ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
