import React, { useState, useEffect } from 'react';
import { User, CESFAM } from '../types';
import FormField from './FormField';
import RutInput, { formatRutChilean } from './RutInput';
import UserAutocomplete from './UserAutocomplete';
import { patologiasGesGenerales, patologiasGesOncologicas } from '../data/gesData';
import { generateGesPdf } from '../services/pdfGenerator';

interface FichaFirmarGesProps {
  loggedInUser: User;
  onClose: () => void;
}

const CESFAM_OPTIONS: CESFAM[] = [
  'CESFAM San Juan', 'CESFAM Santa Cecilia', 'CESFAM Sergio Aguilar', 
  'CESFAM Tierras Blancas', 'CESFAM Tongoy', 'CESFAM Pan de Azúcar', 
  'CESFAM El Sauce', 'CESFAM Lila Cortés', 'CECOSF Punta Mira'
];

const stripAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const FichaFirmarGes: React.FC<FichaFirmarGesProps> = ({ loggedInUser, onClose }) => {
  const [useOtroEmisor, setUseOtroEmisor] = useState(false);
  const [isEstablecimientoOpen, setIsEstablecimientoOpen] = useState(false);

  const [formData, setFormData] = useState({
    institucion: 'CESFAM San Juan' as CESFAM,
    direccionEstablecimiento: 'Jaime Juan Oliver S/N',
    isMenorEdad: false,
    
    // Notificador
    notificaNombre: loggedInUser?.fullName || '',
    notificaRut: loggedInUser?.rut || '',

    // Paciente
    nombreLegal: '',
    nombreSocial: '',
    rut: '',
    direccion: '',
    comuna: 'Coquimbo',
    telefono: '',
    correo: '',
    
    // Prevision
    prevision: 'FONASA' as 'FONASA' | 'ISAPRE',
    
    // Representante (Si es menor)
    repNombre: '',
    repRut: '',
    repTelefono: '',
    repCorreo: '',

    // Tipos de GES
    tipoGes: 'GENERAL' as 'GENERAL' | 'ONCOLOGICO',
    
    // GES General
    gesProblema: '',
    tipoArtrosis: '' as '' | 'COXARTROSIS' | 'GONARTROSIS',
    
    // GES Oncologico
    gesOncologicoProblema: '',
    oncoSospecha: false,
    oncoConfirmacion: false,
    oncoEtapificacion: false,
    oncoTratamiento: false,
    oncoSeguimiento: false,
    oncoRehabilitacion: false,
  });

  const [searchGeneral, setSearchGeneral] = useState('');
  const [searchOnco, setSearchOnco] = useState('');
  const [isGeneralOpen, setIsGeneralOpen] = useState(false);
  const [isOncoOpen, setIsOncoOpen] = useState(false);

  // Sync notificador if checkbox is unchecked
  const handleOtroEmisorToggle = (checked: boolean) => {
    setUseOtroEmisor(checked);
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        notificaNombre: loggedInUser?.fullName || '',
        notificaRut: loggedInUser?.rut || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        notificaNombre: '',
        notificaRut: ''
      }));
    }
  };

  // Sync inputs with state if preset
  useEffect(() => {
    if (formData.gesProblema && searchGeneral !== formData.gesProblema) setSearchGeneral(formData.gesProblema);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gesProblema]);

  useEffect(() => {
    if (formData.gesOncologicoProblema && searchOnco !== formData.gesOncologicoProblema) setSearchOnco(formData.gesOncologicoProblema);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gesOncologicoProblema]);

  const [summaryText, setSummaryText] = useState('');

  useEffect(() => {
    let summary = `CONSTANCIA AL PACIENTE DE LAS GARANTÍAS EXPLÍCITAS EN SALUD (GES)
--------------------------------------------------
ESTABLECIMIENTO: ${formData.institucion}
DIRECCIÓN: ${formData.direccionEstablecimiento}
CIUDAD: Coquimbo
--------------------------------------------------
DATOS DEL NOTIFICADOR:
- Nombre: ${formData.notificaNombre}
- RUN: ${formData.notificaRut}

DATOS DEL PACIENTE:
- Nombre Legal: ${formData.nombreLegal}
- Nombre Social: ${formData.nombreSocial || '(No registra)'}
- RUN: ${formData.rut}
- Previsión: ${formData.prevision}
- Dirección: ${formData.direccion}, ${formData.comuna}
- Teléfono: ${formData.telefono}
- Correo: ${formData.correo}
`;

    if (formData.isMenorEdad) {
      summary += `\nREPRESENTANTE LEGAL:
- Nombre: ${formData.repNombre}
- RUN: ${formData.repRut}
- Teléfono: ${formData.repTelefono}
- Correo: ${formData.repCorreo}
`;
    }

    let patologiaStr = formData.tipoGes === 'GENERAL' ? (formData.gesProblema || '(No seleccionada)') : (formData.gesOncologicoProblema || '(No seleccionada)');
    if (formData.tipoGes === 'GENERAL' && formData.tipoArtrosis && (formData.gesProblema.toLowerCase().includes('artrosis de cadera') || formData.gesProblema.toLowerCase().includes('55 años'))) {
      patologiaStr += ` (${formData.tipoArtrosis.toUpperCase()})`;
    }

    summary += `\nPROBLEMA DE SALUD GES:
- Tipo: ${formData.tipoGes}
- Patología: ${patologiaStr}
`;

    if (formData.tipoGes === 'ONCOLOGICO') {
      const etapas = [];
      if (formData.oncoSospecha) etapas.push('Sospecha');
      if (formData.oncoConfirmacion) etapas.push('Confirmación');
      if (formData.oncoEtapificacion) etapas.push('Etapificación');
      if (formData.oncoTratamiento) etapas.push('Tratamiento');
      if (formData.oncoSeguimiento) etapas.push('Seguimiento');
      if (formData.oncoRehabilitacion) etapas.push('Rehabilitación');
      summary += `- Etapas: ${etapas.join(', ') || '(Ninguna seleccionada)'}\n`;
    }

    setSummaryText(summary);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRutChange = (rut: string) => {
    setFormData(prev => ({ ...prev, rut }));
  };
  const handleRepRutChange = (repRut: string) => {
    setFormData(prev => ({ ...prev, repRut }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateGesPdf(formData, loggedInUser);
  };

  const isArtrosisCaderaRodilla = formData.tipoGes === 'GENERAL' && formData.gesProblema && 
    (formData.gesProblema.toLowerCase().includes('artrosis de cadera') || formData.gesProblema.toLowerCase().includes('55 años'));

  return (
    <>
      <div className="w-full relative text-xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 w-full">
    
          {/* BLOQUE INSTITUCION */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
            <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEstablecimientoOpen(!isEstablecimientoOpen)}
                  className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-bold text-xs"
                >
                  {isEstablecimientoOpen ? '▼' : '►'}
                </button>
                <h3 
                  onClick={() => setIsEstablecimientoOpen(!isEstablecimientoOpen)} 
                  className="text-[11px] font-bold text-slate-700 cursor-pointer select-none"
                >
                  Datos del Establecimiento
                </h3>
              </div>
              <div className="flex items-center gap-1">
                 <input 
                    type="checkbox" 
                    id="otroEmisor" 
                    checked={useOtroEmisor} 
                    onChange={(e) => handleOtroEmisorToggle(e.target.checked)} 
                    className="h-3.5 w-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer" 
                 />
                 <label htmlFor="otroEmisor" className="text-[10px] font-medium text-slate-700 cursor-pointer">
                    Generar a nombre de otro profesional
                 </label>
              </div>
            </div>

             {isEstablecimientoOpen ? (
              <>
                <div className="grid grid-cols-3 gap-1.5">
                   <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">INSTITUCCIÓN (CESFAM)</label>
                      <select name="institucion" value={formData.institucion} onChange={handleChange} className="w-full px-2.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 text-[13px] h-[32px]">
                        {CESFAM_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">DIRECCIÓN</label>
                      <input type="text" name="direccionEstablecimiento" value={formData.direccionEstablecimiento} onChange={handleChange} className="w-full px-2.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 text-[13px] h-[32px]" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">REGIÓN O CIUDAD</label>
                      <input type="text" name="comunaEstab" value="Coquimbo" readOnly disabled className="w-full px-2.5 bg-slate-100 border border-slate-300 rounded-md text-slate-500 cursor-not-allowed text-[13px] h-[32px]" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                   {useOtroEmisor ? (
                     <div className="col-span-1">
                       <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">BUSCAR PROFESIONAL EMISOR</label>
                       <UserAutocomplete 
                         value={formData.notificaNombre}
                         placeholder="🔍 Buscar por nombre de médico..."
                         inputClassName="w-full !px-2.5 bg-white border border-slate-300 !rounded-md focus:ring-1 focus:ring-sky-500 text-[13px] outline-none shadow-none leading-normal h-[32px]"
                         onSelect={(user) => {
                           setFormData(p => ({
                             ...p,
                             notificaNombre: user.fullName,
                             notificaRut: user.rut || ''
                           }));
                         }}
                         onChange={(val) => setFormData(p => ({ ...p, notificaNombre: val }))}
                         onClear={() => setFormData(p => ({ ...p, notificaNombre: '', notificaRut: '' }))}
                       />
                     </div>
                   ) : (
                     <FormField label="NOMBRE NOTIFICADOR" id="notificaNombre" name="notificaNombre" value={formData.notificaNombre} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                   )}
                   <RutInput label="RUN NOTIFICADOR" id="notificaRut" name="notificaRut" value={formData.notificaRut} onChange={(val) => setFormData(p => ({ ...p, notificaRut: val }))} placeholder="12.345.678-9" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                </div>
              </>
            ) : (
              <div className="pt-0.5">
                {useOtroEmisor ? (
                  <div className="grid grid-cols-2 gap-1.5 my-0.5">
                     <div className="col-span-1">
                       <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">BUSCAR PROFESIONAL EMISOR</label>
                       <UserAutocomplete 
                         value={formData.notificaNombre}
                         placeholder="🔍 Buscar por nombre de médico..."
                         inputClassName="w-full !px-2.5 bg-white border border-slate-300 !rounded-md focus:ring-1 focus:ring-sky-500 text-[13px] outline-none shadow-none leading-normal h-[32px]"
                         onSelect={(user) => {
                           setFormData(p => ({
                             ...p,
                             notificaNombre: user.fullName,
                             notificaRut: user.rut || ''
                           }));
                         }}
                         onChange={(val) => setFormData(p => ({ ...p, notificaNombre: val }))}
                         onClear={() => setFormData(p => ({ ...p, notificaNombre: '', notificaRut: '' }))}
                       />
                     </div>
                     <RutInput label="RUN NOTIFICADOR" id="notificaRut" name="notificaRut" value={formData.notificaRut} onChange={(val) => setFormData(p => ({ ...p, notificaRut: val }))} placeholder="12.345.678-9" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-2">
                    <span><strong>EMISOR:</strong> {formData.notificaNombre || '(No especificado)'}</span>
                    {formData.notificaRut && <span className="text-slate-400">({formData.notificaRut})</span>}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* BLOQUE PACIENTE */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
            <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-0.5">
              <h3 className="text-[11px] font-bold text-slate-700">Identificación del Paciente</h3>
              <div className="flex items-center gap-3">
                  <div className="flex gap-1 items-center">
                     <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-0.5">PREVISIÓN:</span>
                     <label className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-0.5 border border-slate-200 rounded bg-white hover:bg-sky-50 text-[10px]">
                        <input type="radio" name="prevision" value="FONASA" checked={formData.prevision === 'FONASA'} onChange={handleChange} className="h-3 w-3 text-sky-600 focus:ring-sky-500" />
                        <span className="font-semibold text-slate-700">FONASA</span>
                     </label>
                     <label className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-0.5 border border-slate-200 rounded bg-white hover:bg-sky-50 text-[10px]">
                        <input type="radio" name="prevision" value="ISAPRE" checked={formData.prevision === 'ISAPRE'} onChange={handleChange} className="h-3 w-3 text-sky-600 focus:ring-sky-500" />
                        <span className="font-semibold text-slate-700">ISAPRE</span>
                     </label>
                  </div>
                  <div className="h-3.5 w-px bg-slate-200"></div>
                  <div className="flex items-center gap-1">
                      <input type="checkbox" id="isMenor" name="isMenorEdad" checked={formData.isMenorEdad} onChange={handleChange} className="h-3.5 w-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                      <label htmlFor="isMenor" className="text-[10px] font-medium text-slate-700 cursor-pointer">Menor/Interdicto</label>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5">
              <div className="col-span-4">
                <RutInput label="RUN PACIENTE" id="rut" name="rut" required value={formData.rut} onChange={handleRutChange} placeholder="12.345.678-9" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              <div className="col-span-4">
                <FormField label="NOMBRE LEGAL" id="nombreLegal" name="nombreLegal" value={formData.nombreLegal} onChange={handleChange} placeholder="Ej: Pedro Soto" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              <div className="col-span-4">
                <FormField label="NOMBRE SOCIAL" id="nombreSocial" name="nombreSocial" value={formData.nombreSocial} onChange={handleChange} placeholder="Opcional" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              
              <div className="col-span-4">
                <FormField label="DIRECCIÓN / DOMICILIO" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              <div className="col-span-2">
                <FormField label="COMUNA" id="comuna" name="comuna" value={formData.comuna} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              <div className="col-span-3">
                <FormField label="TELÉFONO" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9..." inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
              <div className="col-span-3">
                <FormField label="CORREO ELECTRÓNICO" id="correo" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
              </div>
            </div>
          </section>

          {/* BLOQUE PROBLEMA GES Y ACCION */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
            <div className="flex gap-2 mb-1.5 border-b border-slate-200 pb-0.5 items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-700">Problema de Salud GES</h3>
              <div className="flex bg-slate-100 rounded p-0.5 border border-slate-200">
                 <button type="button" onClick={() => setFormData(p => ({...p, tipoGes: 'GENERAL'}))} className={`px-2 py-0.5 text-[10px] rounded ${formData.tipoGes === 'GENERAL' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>General</button>
                 <button type="button" onClick={() => setFormData(p => ({...p, tipoGes: 'ONCOLOGICO'}))} className={`px-2 py-0.5 text-[10px] rounded ${formData.tipoGes === 'ONCOLOGICO' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Oncológico</button>
              </div>
            </div>

            {formData.tipoGes === 'GENERAL' && isArtrosisCaderaRodilla && (
              <div className="mb-2 pb-1.5 border-b border-slate-150 flex items-center gap-2 animate-fadeIn">
                 <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ESPECIFICACIÓN DE ARTROSIS:</span>
                 <div className="flex gap-1 items-center">
                    <label className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-0.5 border border-slate-200 rounded bg-white hover:bg-sky-50 text-[10px]">
                       <input 
                          type="radio" 
                          name="tipoArtrosis" 
                          value="COXARTROSIS" 
                          checked={formData.tipoArtrosis === 'COXARTROSIS'} 
                          onChange={handleChange} 
                          className="h-3 w-3 text-sky-600 focus:ring-sky-500" 
                       />
                       <span className="font-semibold text-slate-700">Coxartrosis</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer px-1.5 py-0.5 border border-slate-200 rounded bg-white hover:bg-sky-50 text-[10px]">
                       <input 
                          type="radio" 
                          name="tipoArtrosis" 
                          value="GONARTROSIS" 
                          checked={formData.tipoArtrosis === 'GONARTROSIS'} 
                          onChange={handleChange} 
                          className="h-3 w-3 text-sky-600 focus:ring-sky-500" 
                       />
                       <span className="font-semibold text-slate-700">Gonartrosis</span>
                    </label>
                 </div>
              </div>
            )}

            <div className="flex gap-2.5 items-end w-full">
              {formData.tipoGes === 'GENERAL' ? (
                <>
                  <div className="flex-1 animate-fadeIn min-w-0">
                     <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">PATOLOGÍA GENERAL</label>
                     <div className="relative w-full">
                        <input 
                            type="text" 
                            value={searchGeneral} 
                            onChange={e => {
                                setSearchGeneral(e.target.value);
                                setIsGeneralOpen(true);
                                if (e.target.value === '') setFormData(p => ({ ...p, gesProblema: '' }));
                            }}
                            onFocus={() => setIsGeneralOpen(true)}
                            onBlur={() => setTimeout(() => setIsGeneralOpen(false), 200)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 shadow-none text-[13px] animate-none h-[32px]"
                            placeholder="🔍 Buscar patología general..."
                        />
                        {isGeneralOpen && searchGeneral && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-36 overflow-y-auto">
                                {patologiasGesGenerales.filter(p => stripAccents(p).includes(stripAccents(searchGeneral))).map((p, i) => (
                                    <div 
                                        key={i} 
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => ({ ...prev, gesProblema: p }));
                                            setSearchGeneral(p);
                                            setIsGeneralOpen(false);
                                        }}
                                        className="px-2 py-1 hover:bg-sky-50 cursor-pointer text-[11px] text-slate-700 border-b border-slate-100 last:border-0"
                                    >
                                        {p}
                                    </div>
                                ))}
                                {patologiasGesGenerales.filter(p => stripAccents(p).includes(stripAccents(searchGeneral))).length === 0 && (
                                    <div className="px-2 py-1 text-slate-500 text-[11px]">No se encontraron patologías.</div>
                                )}
                            </div>
                        )}
                     </div>
                  </div>
                  <div className="shrink-0">
                    <button 
                        onClick={handleSubmit}
                        type="button" 
                        className="px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded shadow active:scale-95 uppercase text-xs flex items-center justify-center gap-1.5 h-[32px] cursor-pointer whitespace-nowrap shrink-0"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                         GENERAR Y FIRMAR
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-5 animate-fadeIn">
                     <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">PATOLOGÍA ONCOLÓGICA</label>
                     <div className="relative">
                        <input 
                            type="text" 
                            value={searchOnco} 
                            onChange={e => {
                                setSearchOnco(e.target.value);
                                setIsOncoOpen(true);
                                if (e.target.value === '') setFormData(p => ({ ...p, gesOncologicoProblema: '' }));
                            }}
                            onFocus={() => setIsOncoOpen(true)}
                            onBlur={() => setTimeout(() => setIsOncoOpen(false), 200)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-rose-500 shadow-none text-[13px] h-[32px]"
                            placeholder="🔍 Buscar cáncer..."
                        />
                        {isOncoOpen && searchOnco && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-36 overflow-y-auto">
                                {patologiasGesOncologicas.filter(p => stripAccents(p).includes(stripAccents(searchOnco))).map((p, i) => (
                                    <div 
                                        key={i} 
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setFormData(prev => ({ ...prev, gesOncologicoProblema: p }));
                                            setSearchOnco(p);
                                            setIsOncoOpen(false);
                                        }}
                                        className="px-2 py-1 hover:bg-rose-50 cursor-pointer text-[11px] text-slate-700 border-b border-slate-100 last:border-0"
                                    >
                                        {p}
                                    </div>
                                ))}
                                {patologiasGesOncologicas.filter(p => stripAccents(p).includes(stripAccents(searchOnco))).length === 0 && (
                                    <div className="px-2 py-1 text-slate-500 text-[11px]">No se encontraron patologías.</div>
                                )}
                            </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="col-span-4 animate-fadeIn">
                     <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">ETAPA ONCOLÓGICA</label>
                     <div className="grid grid-cols-2 gap-0.5 bg-slate-50 p-1 rounded border border-slate-200">
                        {[
                          { name: 'oncoSospecha', label: 'Sospecha' },
                          { name: 'oncoConfirmacion', label: 'Confirmación' },
                          { name: 'oncoEtapificacion', label: 'Etapificación' },
                          { name: 'oncoTratamiento', label: 'Tratamiento' },
                          { name: 'oncoSeguimiento', label: 'Seguimiento' },
                          { name: 'oncoRehabilitacion', label: 'Rehabilitación' }
                        ].map(st => (
                            <label key={st.name} className="flex items-center gap-1 cursor-pointer p-0.5 hover:bg-white hover:shadow-xs rounded transition-all">
                               <input type="checkbox" name={st.name} checked={(formData as any)[st.name]} onChange={handleChange} className="h-2.5 w-2.5 text-rose-600 focus:ring-rose-500 border-slate-300 rounded" />
                               <span className="text-[9px] font-medium text-slate-700">{st.label}</span>
                            </label>
                        ))}
                     </div>
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        type="button" 
                        className="px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded shadow active:scale-95 uppercase text-xs flex items-center justify-center gap-1.5 h-[32px] cursor-pointer whitespace-nowrap shrink-0"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                         GENERAR Y FIRMAR
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* BLOQUE REPRESENTANTE (CONDICIONAL) */}
          {formData.isMenorEdad && (
              <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 animate-fadeIn">
                <h3 className="text-[11px] font-bold text-sky-800 mb-1 border-b border-sky-200 pb-0.5 uppercase">DATOS DEL REPRESENTANTE (TOMA CONOCIMIENTO)</h3>
                <div className="grid grid-cols-4 gap-1.5">
                   <FormField label="NOMBRE" id="repNombre" name="repNombre" value={formData.repNombre} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                   <RutInput label="RUN" id="repRut" name="repRut" value={formData.repRut} onChange={handleRepRutChange} placeholder="12.345.678-9" inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                   <FormField label="TELÉFONO" id="repTelefono" name="repTelefono" value={formData.repTelefono} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                   <FormField label="CORREO" id="repCorreo" name="repCorreo" value={formData.repCorreo} onChange={handleChange} inputClassName="!h-[32px] !py-0 !px-2.5 !text-[13px] !rounded-md shadow-none" labelClassName="!text-[10px] !font-semibold text-slate-500 uppercase tracking-wider !mb-0.5" />
                </div>
              </section>
          )}
        </form>
      </div>
    </>
  );
};

export default FichaFirmarGes;
