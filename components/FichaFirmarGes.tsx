import React, { useState, useEffect } from 'react';
import { User, CESFAM } from '../types';
import FormField from './FormField';
import RutInput, { formatRutChilean } from './RutInput';
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
    comuna: '',
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

    summary += `\nPROBLEMA DE SALUD GES:
- Tipo: ${formData.tipoGes}
- Patología: ${formData.tipoGes === 'GENERAL' ? (formData.gesProblema || '(No seleccionada)') : (formData.gesOncologicoProblema || '(No seleccionada)')}
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

  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Columna Central: Formulario */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* BLOQUE INSTITUCION */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b border-slate-200 pb-2">Datos del Establecimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Institución (CESFAM)</label>
                <select name="institucion" value={formData.institucion} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                  {CESFAM_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
                <input type="text" name="direccionEstablecimiento" value={formData.direccionEstablecimiento} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Región o Ciudad</label>
                <input type="text" name="comunaEstab" value="Coquimbo" readOnly disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <FormField label="Nombre Persona que Notifica" name="notificaNombre" value={formData.notificaNombre} onChange={handleChange} />
             <RutInput label="RUN Persona que Notifica" id="notificaRut" name="notificaRut" value={formData.notificaRut} onChange={(val) => setFormData(p => ({ ...p, notificaRut: val }))} placeholder="12.345.678-9" />
          </div>
        </section>

        {/* BLOQUE PACIENTE */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
            <h3 className="text-lg font-semibold text-slate-700">Identificación del Paciente</h3>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="isMenor" name="isMenorEdad" checked={formData.isMenorEdad} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                <label htmlFor="isMenor" className="text-sm font-medium text-slate-700">¿Es Menor de Edad o Interdictado?</label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RutInput label="RUN Paciente" id="rut" name="rut" required value={formData.rut} onChange={handleRutChange} placeholder="12.345.678-9" />
            <FormField label="Nombre Legal" name="nombreLegal" value={formData.nombreLegal} onChange={handleChange} placeholder="Ej: Pedro Soto" />
            <FormField label="Nombre Social" name="nombreSocial" value={formData.nombreSocial} onChange={handleChange} placeholder="Opcional" />
            
            <FormField label="Dirección / Domicilio" name="direccion" value={formData.direccion} onChange={handleChange} />
            <FormField label="Comuna" name="comuna" value={formData.comuna} onChange={handleChange} />
            <FormField label="Teléfono Fijo o Móvil" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9..." />
            <FormField label="Correo Electrónico" name="correo" value={formData.correo} onChange={handleChange} placeholder="correo@ejemplo.com" />
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Previsión de Salud</label>
              <div className="flex gap-6">
                 <label className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg bg-white hover:bg-sky-50 w-full justify-center">
                    <input type="radio" name="prevision" value="FONASA" checked={formData.prevision === 'FONASA'} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                    <span className="font-semibold text-slate-700">FONASA</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg bg-white hover:bg-sky-50 w-full justify-center">
                    <input type="radio" name="prevision" value="ISAPRE" checked={formData.prevision === 'ISAPRE'} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" />
                    <span className="font-semibold text-slate-700">ISAPRE</span>
                 </label>
              </div>
            </div>
          </div>
        </section>

        {/* BLOQUE REPRESENTANTE (CONDICIONAL) */}
        {formData.isMenorEdad && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-sky-800 mb-4 border-b border-sky-200 pb-2">Datos del Representante (Toma Conocimiento)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField label="Nombre y Apellidos" name="repNombre" value={formData.repNombre} onChange={handleChange} />
                 <RutInput label="RUN Representante" id="repRut" name="repRut" value={formData.repRut} onChange={handleRepRutChange} placeholder="12.345.678-9" />
                 <FormField label="Teléfono" name="repTelefono" value={formData.repTelefono} onChange={handleChange} />
                 <FormField label="Correo Electrónico" name="repCorreo" value={formData.repCorreo} onChange={handleChange} />
              </div>
            </section>
        )}

            </form>
          </div>

          {/* Columna Derecha: Diagnóstico GES y Botón de Firma */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
                  <div>
                      <div className="flex gap-4 mb-4 border-b border-slate-200 pb-2 items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800">Problema de Salud GES</h3>
                        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                           <button type="button" onClick={() => setFormData(p => ({...p, tipoGes: 'GENERAL'}))} className={`px-2.5 py-1 text-xs rounded-md ${formData.tipoGes === 'GENERAL' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Gen</button>
                           <button type="button" onClick={() => setFormData(p => ({...p, tipoGes: 'ONCOLOGICO'}))} className={`px-2.5 py-1 text-xs rounded-md ${formData.tipoGes === 'ONCOLOGICO' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Onco</button>
                        </div>
                      </div>

                      {formData.tipoGes === 'GENERAL' ? (
                          <div className="animate-fadeIn">
                             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Patología General</label>
                             <div className="relative">
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
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 shadow-sm text-sm"
                                    placeholder="🔍 Buscar patología..."
                                />
                                {isGeneralOpen && searchGeneral && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                                        {patologiasGesGenerales.filter(p => stripAccents(p).includes(stripAccents(searchGeneral))).map((p, i) => (
                                            <div 
                                                key={i} 
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setFormData(prev => ({ ...prev, gesProblema: p }));
                                                    setSearchGeneral(p);
                                                    setIsGeneralOpen(false);
                                                }}
                                                className="px-3 py-2 hover:bg-sky-50 cursor-pointer text-xs text-slate-700 border-b border-slate-100 last:border-0"
                                            >
                                                {p}
                                            </div>
                                        ))}
                                        {patologiasGesGenerales.filter(p => stripAccents(p).includes(stripAccents(searchGeneral))).length === 0 && (
                                            <div className="px-3 py-2 text-slate-500 text-xs">No se encontraron patologías.</div>
                                        )}
                                    </div>
                                )}
                             </div>
                          </div>
                      ) : (
                          <div className="animate-fadeIn space-y-4">
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Patología Oncológica</label>
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
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 shadow-sm text-sm"
                                        placeholder="🔍 Buscar cáncer..."
                                    />
                                    {isOncoOpen && searchOnco && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                                            {patologiasGesOncologicas.filter(p => stripAccents(p).includes(stripAccents(searchOnco))).map((p, i) => (
                                                <div 
                                                    key={i} 
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setFormData(prev => ({ ...prev, gesOncologicoProblema: p }));
                                                        setSearchOnco(p);
                                                        setIsOncoOpen(false);
                                                    }}
                                                    className="px-3 py-2 hover:bg-rose-50 cursor-pointer text-xs text-slate-700 border-b border-slate-100 last:border-0"
                                                >
                                                    {p}
                                                </div>
                                            ))}
                                            {patologiasGesOncologicas.filter(p => stripAccents(p).includes(stripAccents(searchOnco))).length === 0 && (
                                                <div className="px-3 py-2 text-slate-500 text-xs">No se encontraron patologías.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                             </div>
                             
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Etapa Oncológica</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                   {[
                                     { name: 'oncoSospecha', label: 'Sospecha' },
                                     { name: 'oncoConfirmacion', label: 'Confirmación' },
                                     { name: 'oncoEtapificacion', label: 'Etapificación' },
                                     { name: 'oncoTratamiento', label: 'Tratamiento' },
                                     { name: 'oncoSeguimiento', label: 'Seguimiento' },
                                     { name: 'oncoRehabilitacion', label: 'Rehabilitación' }
                                   ].map(st => (
                                       <label key={st.name} className="flex items-center gap-1.5 cursor-pointer p-1 hover:bg-white hover:shadow-sm rounded transition-all">
                                          <input type="checkbox" name={st.name} checked={(formData as any)[st.name]} onChange={handleChange} className="h-3.5 w-3.5 text-rose-600 focus:ring-rose-500 border-slate-300 rounded" />
                                          <span className="text-[11px] font-semibold text-slate-700">{st.label}</span>
                                       </label>
                                   ))}
                                </div>
                             </div>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={handleSubmit}
                      type="button" 
                      className="w-full px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                       GENERAR Y FIRMAR PDF
                  </button>
              </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FichaFirmarGes;
