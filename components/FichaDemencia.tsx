
import React, { useState, useCallback, useEffect } from 'react';
import { FichaDemenciaFormData, User } from '../types';
import FormField from './FormField';
import RutInput from './RutInput';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaDemenciaFormData = {
  nombrePaciente: '',
  rutPaciente: '',
  // FIX: Added missing edad and sexo properties to match FichaDemenciaFormData interface
  edad: '',
  sexo: '',
  omitOptional: false,
  hospitalizacionesRecientes: '',
  eventosCardiovasculares: '',
  antecedentesFamiliares: '',
  farmacosHabituales: '',
  cirugias: '',
  alergias: '',
  oh: '',
  tabaco: '',
  drogas: '',
  historiaTEC: '',
  viveCon: '',
  cuidadorPrincipal: '',
  redesApoyo: '',
  actividadesComunitarias: '',
  actividadesFamiliares: '',
  alimentacion: '',
  deglucion: '',
  deposiciones: '',
  miccion: '',
  dolor: '',
  caidas: '',
  examenesDemenciaSecundaria: 'Perfil lipídico, función renal, hemograma, TSH, B12, VDRL, VIH (test rápido), ECG de reposo, EOC, UC, RAC, perfil hepático',
  historiaDeficitCognitivo: '',
  olvidosFrecuentes: '',
  orientacionTemporoEspacial: '',
  atencion: '',
  organizacionMental: '',
  sueno: '',
  npiq_delirios: false,
  npiq_alucinaciones: false,
  npiq_agitacion: false,
  npiq_depresion: false,
  npiq_ansiedad: false,
  npiq_euforia: false,
  npiq_apatia: false,
  npiq_inhibicion: false,
  npiq_irritabilidad: false,
  npiq_motor: false,
  npiq_nocturnas: false,
  npiq_apetito: false,
  animo_phq9: '',
  animo_yesavage: '',
  impacto_zarit: '',
  impacto_readiness: '',
  funcional_biografia: '',
  escolaridad: '',
  alfabetismo: '',
  abvd_barthel: '',
  aivd_lawton: '',
  tAdlq: '',
  examenFisico_general: 'Mucosa oral y palpebral rosada e hidratada. Llene capilar menor a dos segundos.\nYugulares no ingurgitadas\nRitmo regular en dos tiempos, sin soplos.\nMurmullo pulmonar presente, sin ruidos agregados.\nAbdomen blando, depresible e indoloro. Ruidos hidroaéreos presentes. No palpo masas ni visceromegalias. Sin signos de irritación peritoneal.\nExtremidades sin edema ni signos de TVP. Pulsos periféricos presentes.',
  neuro_paresia: 'Minima paresia EESS y EEll negativo.',
  neuro_rot: 'ROT conservados, simétricos. Tono muscular conservado.',
  neuro_diadococinesia: 'Diadococinesia y metria conservadas.',
  neuro_marcha: 'Marcha conservada.',
  neuro_paresCraneales: 'Pares craneales conservados.',
  test_mmse: false,
  test_mis: false,
  test_moca: false,
  test_reloj: false,
  test_fototest: false,
  test_rudas: false,
  diagnostico: '',
  demencia_tipo_alzheimer: false,
  demencia_tipo_vascular: false,
  demencia_tipo_lewy: false,
  demencia_tipo_frontotemporal: false,
  demencia_tipo_pseudodemencia: false,
  demencia_severidad: '',
  demencia_sintomasAsociados: '',
  demencia_funcionalidad: '',
  sg_caidas: false,
  sg_incontinencia: false,
  sg_hipotension: false,
  sg_polifarmacia: false,
  sg_fragilidad: false,
  sg_sarcopenia: false,
  comorbilidades: '',
  plan_ges: false,
  plan_taller_cuidadores: false,
  plan_taller_cuidadores_lugar: 'CESFAM (lugar por confirmar)',
  plan_taller_caidas: false,
  plan_manejo_multidisciplinario: false,
  plan_manejo_especifico: false,
  plan_derivacion_cedem: false,
};

interface FichaDemenciaProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaDemencia: React.FC<FichaDemenciaProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaDemenciaFormData>('local_FichaDemencia', initialFormData);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, rutPaciente: value }));
  }, []);

  const handleNewDocument = () => {
    setFormData(initialFormData);
  };

  const renderSection = (title: string, isOptional: boolean, children: React.ReactNode) => {
    if (isOptional && formData.omitOptional) return null;
    return (
      <details open={!isOptional} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <summary className="text-lg font-semibold text-sky-700 cursor-pointer">{title}</summary>
        <div className="mt-4 space-y-4 pt-4 border-t border-slate-200">
          {children}
        </div>
      </details>
    );
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha de Evaluación de Demencia</h2>
        <p className="text-slate-500 mt-2">Complete los campos para generar el registro clínico.</p>
      </header>

      <div className="flex items-center p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
        <input type="checkbox" id="omitOptional" name="omitOptional" checked={formData.omitOptional} onChange={handleChange} className="h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
        <label htmlFor="omitOptional" className="ml-3 text-md font-medium text-slate-700">Omitir campos opcionales (no en negrita)</label>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold mb-3 text-sky-700">Datos del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nombre Paciente" id="nombrePaciente" name="nombrePaciente" value={formData.nombrePaciente} onChange={handleChange} required />
            <RutInput label="RUT Paciente" id="rutPaciente" name="rutPaciente" value={formData.rutPaciente} onChange={handleRutChange} required />
          </div>
          {/* FIX: Added edad and sexo fields to the UI for completeness and to fix initial value binding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} required />
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange as any}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 text-slate-700 outline-none"
                required
              >
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>
        </section>

        {renderSection("Antecedentes", true, (
          <>
            <FormField isTextArea rows={2} id="hospitalizacionesRecientes" label="Hospitalizaciones recientes" name="hospitalizacionesRecientes" value={formData.hospitalizacionesRecientes} onChange={handleChange} />
            <FormField isTextArea rows={2} id="eventosCardiovasculares" label="Eventos cardiovasculares" name="eventosCardiovasculares" value={formData.eventosCardiovasculares} onChange={handleChange} />
            <FormField isTextArea rows={2} id="antecedentesFamiliares" label="Antecedentes familiares" name="antecedentesFamiliares" value={formData.antecedentesFamiliares} onChange={handleChange} />
            <FormField isTextArea rows={2} id="farmacosHabituales" label="Fármacos de uso habitual" name="farmacosHabituales" value={formData.farmacosHabituales} onChange={handleChange} />
            <FormField isTextArea rows={2} id="cirugias" label="Cirugías" name="cirugias" value={formData.cirugias} onChange={handleChange} />
            <FormField isTextArea rows={2} id="alergias" label="Alergias" name="alergias" value={formData.alergias} onChange={handleChange} />
            <FormField isTextArea rows={2} id="oh" label="OH / Tabaco / Drogas" name="oh" value={formData.oh} onChange={handleChange} />
            <FormField isTextArea rows={2} id="historiaTEC" label="Historia de TEC" name="historiaTEC" value={formData.historiaTEC} onChange={handleChange} />
          </>
        ))}

        {renderSection("Social", false, (
          <>
            <FormField isTextArea rows={2} id="viveCon" label="Vive con" name="viveCon" value={formData.viveCon} onChange={handleChange} />
            <FormField isTextArea rows={2} id="cuidadorPrincipal" label="Cuidador(es) principal y relación" name="cuidadorPrincipal" value={formData.cuidadorPrincipal} onChange={handleChange} />
            {!formData.omitOptional && (
              <>
                <FormField isTextArea rows={2} id="redesApoyo" label="Redes de apoyo principales" name="redesApoyo" value={formData.redesApoyo} onChange={handleChange} />
                <FormField isTextArea rows={2} id="actividadesComunitarias" label="Actividades comunitarias" name="actividadesComunitarias" value={formData.actividadesComunitarias} onChange={handleChange} />
                <FormField isTextArea rows={2} id="actividadesFamiliares" label="Actividades familiares" name="actividadesFamiliares" value={formData.actividadesFamiliares} onChange={handleChange} />
              </>
            )}
          </>
        ))}

        {renderSection("Biológico", true, (
          <>
            <FormField isTextArea rows={2} id="alimentacion" label="Alimentación" name="alimentacion" value={formData.alimentacion} onChange={handleChange} />
            <FormField isTextArea rows={2} id="deglucion" label="Deglución" name="deglucion" value={formData.deglucion} onChange={handleChange} />
            <FormField isTextArea rows={2} id="deposiciones" label="Deposiciones" name="deposiciones" value={formData.deposiciones} onChange={handleChange} />
            <FormField isTextArea rows={2} id="miccion" label="Micción" name="miccion" value={formData.miccion} onChange={handleChange} />
            <FormField isTextArea rows={2} id="dolor" label="Dolor" name="dolor" value={formData.dolor} onChange={handleChange} />
            <FormField isTextArea rows={2} id="caidas" label="Caídas" name="caidas" value={formData.caidas} onChange={handleChange} />
          </>
        ))}

        {renderSection("Exámenes", false, (
          <FormField isTextArea rows={3} id="examenesDemenciaSecundaria" label="Exámenes de demencia secundaria" name="examenesDemenciaSecundaria" value={formData.examenesDemenciaSecundaria} onChange={handleChange} />
        ))}
        
        {renderSection("Mental", false, (
            <>
                <FormField isTextArea rows={2} id="historiaDeficitCognitivo" label="Historia de déficit cognitivo" name="historiaDeficitCognitivo" value={formData.historiaDeficitCognitivo} onChange={handleChange} />
                <FormField isTextArea rows={2} id="olvidosFrecuentes" label="Olvidos frecuentes" name="olvidosFrecuentes" value={formData.olvidosFrecuentes} onChange={handleChange} />
                <FormField isTextArea rows={2} id="orientacionTemporoEspacial" label="Orientación temporo-espacial" name="orientacionTemporoEspacial" value={formData.orientacionTemporoEspacial} onChange={handleChange} />
                <FormField isTextArea rows={2} id="atencion" label="Atención" name="atencion" value={formData.atencion} onChange={handleChange} />
                <FormField isTextArea rows={2} id="organizacionMental" label="Organización mental (función ejecutiva)" name="organizacionMental" value={formData.organizacionMental} onChange={handleChange} />
                <FormField isTextArea rows={2} id="sueno" label="Sueño" name="sueno" value={formData.sueno} onChange={handleChange} />
                <div className="p-3 border border-slate-200 rounded-md bg-white">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">NPI-Q (Síntomas Psico-Conductuales)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.keys(initialFormData).filter(k => k.startsWith('npiq_')).map(key => (
                            <div key={key} className="flex items-center">
                                <input type="checkbox" id={key} name={key} checked={formData[key as keyof FichaDemenciaFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" />
                                <label htmlFor={key} className="ml-2 text-sm text-slate-700 capitalize">{key.replace('npiq_', '').replace('inhibicion', 'pérdida de inhibición')}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ))}
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
          <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
            Volver al Menú
          </button>
          <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm">
            Limpiar Formulario
          </button>
        </div>
      </form>
    </div>
  );
};

export default FichaDemencia;

