import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlCardiovascularFormData, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';
import CopyButton from './CopyButton';

const initialFormData: FichaControlCardiovascularFormData = {
  fechaControl: new Date().toISOString().split('T')[0],
  antecedentesMorbidos: '',
  antecedentesHospitalizaciones: '',
  iam: false,
  acv: false,
  asisteAcompanado: '',
  viveCon: '',
  dinamicaFamiliar: '',
  tipoTrabajoPensionados: '',
  pap: false,
  vacunas: false,
  baciloscopia: false,
  htaTinitus: false,
  htaFotopsia: false,
  htaEdema: false,
  htaPrecordalgia: false,
  htaMareos: false,
  htaCefalea: false,
  dmPoliuria: false,
  dmPolidipsia: false,
  dmPolifagia: false,
  medicamentos: '',
  alimentacion: 'Refiere seguir indicaciones nutricionales, consumo diario de agua.',
  alcohol: '',
  tabaco: '',
  actividadFisica: '',
  sueno: '',
  suenoAclaracion: '',
  eliminacion: 'Diuresis, ITU, deposiciones () al día/semana, con dificultad.',
  proximoControl: '',
  derivacion: 'PAP, vacuna neumo, influenza, podólogo (dm), dental, basiloscopia.',
};

const fixedIndicationsText = `- Se realiza breve consejería de alimentación saludable y actividad física.
- Refuerzo régimen hiposódico, hipograso, hipoglucídico.
- Solicitud de exámenes anuales o los que estén solicitando.
- Autorización PACAM en adulto mayor.
- Refuerzo adherencia a tratamiento farmacológico y no farmacológico.
- Educación sobre cuidados de los pies.`;


interface FichaControlCardiovascularProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlCardiovascular: React.FC<FichaControlCardiovascularProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlCardiovascularFormData>('local_FichaControlCardiovascular', initialFormData);
    const [generatedText, setGeneratedText] = useState('');

    const generateSummary = useCallback(() => {
        let summary = `FICHA CONTROL CARDIOVASCULAR\n`;
        summary += `---------------------------------------\n`;
        summary += `FECHA CONTROL: ${new Date(formData.fechaControl + 'T00:00:00').toLocaleDateString('es-ES')}\n`;
        summary += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || ''}\n`;
        summary += `MOTIVO DE CONSULTA: Control cardiovascular\n`;
        summary += `---------------------------------------\n\n`;

        summary += `ANTECEDENTES PERSONALES:\n`;
        summary += `- Antecedentes mórbidos: ${formData.antecedentesMorbidos || 'Niega'}\n`;
        summary += `- Antecedentes de hospitalizaciones: ${formData.antecedentesHospitalizaciones || 'Niega'}\n`;
        summary += `- IAM: ${formData.iam ? 'Sí' : 'Niega'}\n`;
        summary += `- ACV: ${formData.acv ? 'Sí' : 'Niega'}\n`;
        summary += `- Asiste acompañado: ${formData.asisteAcompanado || 'N/A'}\n`;
        summary += `- Vive con: ${formData.viveCon || 'N/A'}\n`;
        summary += `- Dinámica familiar: ${formData.dinamicaFamiliar || 'N/A'}\n`;
        summary += `- Tipo de trabajo o pensionados: ${formData.tipoTrabajoPensionados || 'N/A'}\n`;
        summary += `- PAP: ${formData.pap ? 'Sí' : 'Niega'}\n`;
        summary += `- Vacunas: ${formData.vacunas ? 'Sí' : 'Niega'}\n`;
        summary += `- Baciloscopia: ${formData.baciloscopia ? 'Sí' : 'Niega'}\n\n`;

        summary += `SIGNOS Y SÍNTOMAS:\n`;
        const htaSymptoms = [
            { label: 'Tinitus', key: 'htaTinitus' as keyof FichaControlCardiovascularFormData },
            { label: 'Fotopsia', key: 'htaFotopsia' as keyof FichaControlCardiovascularFormData },
            { label: 'Edema', key: 'htaEdema' as keyof FichaControlCardiovascularFormData },
            { label: 'Precordalgia', key: 'htaPrecordalgia' as keyof FichaControlCardiovascularFormData },
            { label: 'Mareos', key: 'htaMareos' as keyof FichaControlCardiovascularFormData },
            { label: 'Cefalea', key: 'htaCefalea' as keyof FichaControlCardiovascularFormData },
        ];
        const dmSymptoms = [
            { label: 'Poliuria', key: 'dmPoliuria' as keyof FichaControlCardiovascularFormData },
            { label: 'Polidipsia', key: 'dmPolidipsia' as keyof FichaControlCardiovascularFormData },
            { label: 'Polifagia', key: 'dmPolifagia' as keyof FichaControlCardiovascularFormData },
        ];
        summary += `- HTA: ${htaSymptoms.every(s => !formData[s.key]) ? 'Niega' : htaSymptoms.filter(s => formData[s.key]).map(s => s.label).join(', ')}\n`;
        summary += `- DM: ${dmSymptoms.every(s => !formData[s.key]) ? 'Niega' : dmSymptoms.filter(s => formData[s.key]).map(s => s.label).join(', ')}\n\n`;

        summary += `HÁBITOS:\n`;
        summary += `- Medicamentos: ${formData.medicamentos || 'N/A'}\n`;
        summary += `- Alimentación: ${formData.alimentacion || 'N/A'}\n`;
        summary += `- Alcohol: ${formData.alcohol || 'N/A'}\n`;
        summary += `- Tabaco: ${formData.tabaco || 'N/A'}\n`;
        summary += `- Actividad física: ${formData.actividadFisica || 'N/A'}\n`;
        let sueno = formData.sueno;
        if (sueno === 'No reparador' && formData.suenoAclaracion) {
            sueno += `: ${formData.suenoAclaracion}`;
        }
        summary += `- Sueño: ${sueno || 'N/A'}\n`;
        summary += `- Eliminación: ${formData.eliminacion || 'N/A'}\n\n`;

        summary += `INDICACIONES:\n`;
        summary += `${fixedIndicationsText}\n`;
        summary += `- Próximo control: ${formData.proximoControl || 'N/A'}\n`;
        summary += `- Derivación: ${formData.derivacion}\n`;

        return summary.trim();
    }, [formData, loggedInUser]);

    useEffect(() => {
        setGeneratedText(generateSummary());
    }, [formData, generateSummary]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);



    const handleNewDocument = () => {
        setFormData(initialFormData);
    };

    return (
        <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
            <header className="mb-6 text-center">
                <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Cardiovascular (Enfermería)</h2>
                <p className="text-slate-500 mt-2">Complete los campos para generar el resumen.</p>
            </header>

            <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
                <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
                    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Datos Generales</h3>
                        <DateField label="Fecha de Control" id="fechaControl" name="fechaControl" value={formData.fechaControl} onChange={handleChange} />
                    </section>
                    
                    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Antecedentes Personales</h3>
                        <FormField isTextArea rows={2} label="Antecedentes mórbidos" id="antecedentesMorbidos" name="antecedentesMorbidos" value={formData.antecedentesMorbidos} onChange={handleChange} />
                        <FormField isTextArea rows={2} label="Antecedentes de hospitalizaciones" id="antecedentesHospitalizaciones" name="antecedentesHospitalizaciones" value={formData.antecedentesHospitalizaciones} onChange={handleChange} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            <div className="flex items-center"><input type="checkbox" id="iam" name="iam" checked={formData.iam} onChange={handleChange} className="h-4 w-4" /><label htmlFor="iam" className="ml-2 text-sm text-slate-700">IAM</label></div>
                            <div className="flex items-center"><input type="checkbox" id="acv" name="acv" checked={formData.acv} onChange={handleChange} className="h-4 w-4" /><label htmlFor="acv" className="ml-2 text-sm text-slate-700">ACV</label></div>
                            <div className="flex items-center"><input type="checkbox" id="pap" name="pap" checked={formData.pap} onChange={handleChange} className="h-4 w-4" /><label htmlFor="pap" className="ml-2 text-sm text-slate-700">PAP</label></div>
                            <div className="flex items-center"><input type="checkbox" id="vacunas" name="vacunas" checked={formData.vacunas} onChange={handleChange} className="h-4 w-4" /><label htmlFor="vacunas" className="ml-2 text-sm text-slate-700">Vacunas</label></div>
                            <div className="flex items-center"><input type="checkbox" id="baciloscopia" name="baciloscopia" checked={formData.baciloscopia} onChange={handleChange} className="h-4 w-4" /><label htmlFor="baciloscopia" className="ml-2 text-sm text-slate-700">Baciloscopia</label></div>
                        </div>
                         <FormField label="Asiste acompañado" id="asisteAcompanado" name="asisteAcompanado" value={formData.asisteAcompanado} onChange={handleChange} />
                         <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon} onChange={handleChange} />
                         <FormField isTextArea rows={2} label="Dinámica familiar" id="dinamicaFamiliar" name="dinamicaFamiliar" value={formData.dinamicaFamiliar} onChange={handleChange} />
                         <FormField label="Tipo de trabajo o pensionados" id="tipoTrabajoPensionados" name="tipoTrabajoPensionados" value={formData.tipoTrabajoPensionados} onChange={handleChange} />
                    </section>

                    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Signos y Síntomas</h3>
                        <div>
                            <p className="font-medium text-sm text-slate-600">HTA:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                <div className="flex items-center"><input type="checkbox" id="htaTinitus" name="htaTinitus" checked={formData.htaTinitus} onChange={handleChange} /><label htmlFor="htaTinitus" className="ml-2 text-sm text-slate-700">Tinitus</label></div>
                                <div className="flex items-center"><input type="checkbox" id="htaFotopsia" name="htaFotopsia" checked={formData.htaFotopsia} onChange={handleChange} /><label htmlFor="htaFotopsia" className="ml-2 text-sm text-slate-700">Fotopsia</label></div>
                                <div className="flex items-center"><input type="checkbox" id="htaEdema" name="htaEdema" checked={formData.htaEdema} onChange={handleChange} /><label htmlFor="htaEdema" className="ml-2 text-sm text-slate-700">Edema</label></div>
                                <div className="flex items-center"><input type="checkbox" id="htaPrecordalgia" name="htaPrecordalgia" checked={formData.htaPrecordalgia} onChange={handleChange} /><label htmlFor="htaPrecordalgia" className="ml-2 text-sm text-slate-700">Precordalgia</label></div>
                                <div className="flex items-center"><input type="checkbox" id="htaMareos" name="htaMareos" checked={formData.htaMareos} onChange={handleChange} /><label htmlFor="htaMareos" className="ml-2 text-sm text-slate-700">Mareos</label></div>
                                <div className="flex items-center"><input type="checkbox" id="htaCefalea" name="htaCefalea" checked={formData.htaCefalea} onChange={handleChange} /><label htmlFor="htaCefalea" className="ml-2 text-sm text-slate-700">Cefalea</label></div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="font-medium text-sm text-slate-600">DM:</p>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                <div className="flex items-center"><input type="checkbox" id="dmPoliuria" name="dmPoliuria" checked={formData.dmPoliuria} onChange={handleChange} /><label htmlFor="dmPoliuria" className="ml-2 text-sm text-slate-700">Poliuria</label></div>
                                <div className="flex items-center"><input type="checkbox" id="dmPolidipsia" name="dmPolidipsia" checked={formData.dmPolidipsia} onChange={handleChange} /><label htmlFor="dmPolidipsia" className="ml-2 text-sm text-slate-700">Polidipsia</label></div>
                                <div className="flex items-center"><input type="checkbox" id="dmPolifagia" name="dmPolifagia" checked={formData.dmPolifagia} onChange={handleChange} /><label htmlFor="dmPolifagia" className="ml-2 text-sm text-slate-700">Polifagia</label></div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                         <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Hábitos</h3>
                         <FormField isTextArea rows={2} label="Medicamentos" id="medicamentos" name="medicamentos" value={formData.medicamentos} onChange={handleChange} />
                         <FormField isTextArea rows={2} label="Alimentación" id="alimentacion" name="alimentacion" value={formData.alimentacion} onChange={handleChange} />
                         <FormField label="Alcohol" id="alcohol" name="alcohol" value={formData.alcohol} onChange={handleChange} />
                         <FormField label="Tabaco" id="tabaco" name="tabaco" value={formData.tabaco} onChange={handleChange} />
                         <FormField label="Actividad física" id="actividadFisica" name="actividadFisica" value={formData.actividadFisica} onChange={handleChange} />
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sueño</label>
                            <select name="sueno" value={formData.sueno} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                               <option value="">Seleccione...</option>
                               <option value="Reparador">Reparador</option>
                               <option value="No reparador">No reparador (aclare)</option>
                           </select>
                           {formData.sueno === 'No reparador' && <FormField label="" id="suenoAclaracion" name="suenoAclaracion" value={formData.suenoAclaracion} onChange={handleChange} placeholder="Aclare" containerClassName="mt-1" isTextArea rows={1}/>}
                         </div>
                         <FormField isTextArea rows={2} label="Eliminación" id="eliminacion" name="eliminacion" value={formData.eliminacion} onChange={handleChange} />
                    </section>
                    
                    <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Indicaciones y Plan</h3>
                        <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-md text-sm text-sky-800">
                            <p className="font-semibold mb-1">Las siguientes indicaciones se agregarán automáticamente al resumen:</p>
                            <pre className="whitespace-pre-wrap font-sans text-xs">{fixedIndicationsText}</pre>
                        </div>
                        <FormField isTextArea rows={2} label="Próximo control" id="proximoControl" name="proximoControl" value={formData.proximoControl} onChange={handleChange} />
                        <FormField isTextArea rows={2} label="Derivación" id="derivacion" name="derivacion" value={formData.derivacion} onChange={handleChange} containerClassName="mt-4" />
                    </section>
                </div>

                <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">
                        <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Resumen Ficha Clínica (Editable)</h3>
                        <CopyButton textToCopy={generatedText} />
                    </div>
                    <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" />
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
                <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg">Volver</button>
                <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg">Limpiar Formulario</button>
            </div>
        </div>
    );
};

export default FichaControlCardiovascular;
