import React, { useState, useCallback, useEffect } from 'react';
import { FichaControlAdultoMayorFormData, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaControlAdultoMayorFormData = {
  fechaControl: new Date().toISOString().split('T')[0],
  edad: '',
  sexo: '',
  asisteCompaniaDe: '',
  usoAyudasTecnicas: '',
  viveCon: '',
  ocupacion: '',
  redesApoyo: '',
  // FIX: Renamed 'escolaridad' to 'setEscolaridad' to match type definition in types.ts.
  setEscolaridad: '',
  antecedentesMorbidos: '',
  tratamientoFarmacologicoActual: '',
  alimentacion: '',
  ingestaLiquidos: '',
  oh: 'Niega',
  tabaquismo: 'Niega',
  actividadFisica: '',
  sueno: '',
  orina: '',
  deposiciones: '',
  incontinencia: '',
  usoLaxantes: '',
  actividadSexual: '',
  examenMamas: '',
  vacunas: '',
  sintomatologia: '',
  alteracionVisual: '',
  alteracionAuditiva: '',
  participacionSocial: '',
  hobbiesBienestar: '',
  derivacionVacunatorio: false,
  derivacionPacam: false,
  derivacionControlesPendientes: false,
  consejeriaAlimentacionSaludable: false,
  refuerzaEstimulacionCognitiva: false,
  derivacionMasAma: false,
  tallerCaidas: false,
  derivacionMedicoDepresion: false,
  derivacionMedicoDemencia: false,
  derivacionMedicoInterconsulta: false,
  proximoControlMeses: '',
  tomaDecisionesCompartidas: '',
};

interface FichaControlAdultoMayorProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaControlAdultoMayor: React.FC<FichaControlAdultoMayorProps> = ({ onBackToMenu, loggedInUser }) => {
    const [formData, setFormData] = useFormLocalStorage<FichaControlAdultoMayorFormData>('local_FichaControlAdultoMayor', initialFormData);
    const [anamnesisText, setAnamnesisText] = useState('');
    const [exploracionText, setExploracionText] = useState('');
    const [actuacionText, setActuacionText] = useState('');

    const calculateGeneratedTextParts = useCallback(() => {
        let anamnesis = '';
        let exploracion = '';
        let actuacion = '';

        anamnesis += `FICHA CONTROL ADULTO MAYOR\n`;
        anamnesis += `---------------------------------------\n`;
        anamnesis += `FECHA CONTROL: ${new Date(formData.fechaControl + 'T00:00:00').toLocaleDateString('es-ES')}\n`;
        if (loggedInUser) {
          anamnesis += `PROFESIONAL RESPONSABLE: ${loggedInUser.fullName}\n`;
        }
        anamnesis += `MOTIVO DE CONSULTA: Control adulto mayor\n`;
        anamnesis += `---------------------------------------\n\n`;

        anamnesis += `IDENTIFICACIÓN:\n`;
        anamnesis += `- Edad: ${formData.edad || 'N/A'}\n`;
        anamnesis += `- Sexo: ${formData.sexo || 'N/A'}\n\n`;

        anamnesis += `ANAMNESIS GENERAL:\n`;
        anamnesis += `- Asiste en compañía de: ${formData.asisteCompaniaDe || 'N/A'}\n`;
        anamnesis += `- Uso de ayudas técnicas: ${formData.usoAyudasTecnicas || 'N/A'}\n`;
        anamnesis += `- Vive con: ${formData.viveCon || 'N/A'}\n`;
        anamnesis += `- Ocupación: ${formData.ocupacion || 'N/A'}\n`;
        anamnesis += `- Redes de apoyo: ${formData.redesApoyo || 'N/A'}\n`;
        // FIX: Renamed property access to 'setEscolaridad'.
        anamnesis += `- Escolaridad: ${formData.setEscolaridad || 'N/A'}\n`;
        anamnesis += `- Antecedentes mórbidos: ${formData.antecedentesMorbidos || 'N/A'}\n`;
        anamnesis += `- Tratamiento farmacológico actual: ${formData.tratamientoFarmacologicoActual || 'N/A'}\n\n`;
        
        anamnesis += `HÁBITOS:\n`;
        anamnesis += `- Alimentación: ${formData.alimentacion || 'N/A'}\n`;
        anamnesis += `- Ingesta de líquidos: ${formData.ingestaLiquidos || 'N/A'}\n`;
        anamnesis += `- OH: ${formData.oh || 'N/A'}\n`;
        anamnesis += `- Tabaquismo: ${formData.tabaquismo || 'N/A'}\n`;
        anamnesis += `- Actividad física: ${formData.actividadFisica || 'N/A'}\n`;
        anamnesis += `- Sueño: ${formData.sueno || 'N/A'}\n`;
        anamnesis += `- Orina: ${formData.orina || 'N/A'}\n`;
        anamnesis += `- Deposiciones: ${formData.deposiciones || 'N/A'}\n`;
        anamnesis += `- Incontinencia: ${formData.incontinencia || 'N/A'}\n`;
        anamnesis += `- Uso de laxantes: ${formData.usoLaxantes || 'N/A'}\n`;
        anamnesis += `- Actividad sexual: ${formData.actividadSexual || 'N/A'}\n`;
        
        exploracion += `OTRAS EXPLORACIONES:\n`;
        exploracion += `- Examen de mamas: ${formData.examenMamas || 'N/A'}\n`;
        exploracion += `- Vacunas: ${formData.vacunas || 'N/A'}\n`;
        exploracion += `- Sintomatología: ${formData.sintomatologia || 'N/A'}\n`;
        exploracion += `- Alteración visual: ${formData.alteracionVisual || 'N/A'}\n`;
        exploracion += `- Alteración auditiva: ${formData.alteracionAuditiva || 'N/A'}\n`;
        exploracion += `- Participación social: ${formData.participacionSocial || 'N/A'}\n`;
        exploracion += `- Hobbies/actividad de bienestar: ${formData.hobbiesBienestar || 'N/A'}\n`;
        
        actuacion += `PLAN / INDICACIONES:\n`;
        let indicationsAdded = false;
        if (formData.derivacionVacunatorio) { actuacion += `- Derivación a vacunatorio.\n`; indicationsAdded = true; }
        if (formData.derivacionPacam) { actuacion += `- Derivación a PACAM.\n`; indicationsAdded = true; }
        if (formData.derivacionControlesPendientes) { actuacion += `- Derivación a controles pendientes.\n`; indicationsAdded = true; }
        if (formData.consejeriaAlimentacionSaludable) { actuacion += `- Consejería alimentación saludable.\n`; indicationsAdded = true; }
        if (formData.refuerzaEstimulacionCognitiva) { actuacion += `- Se refuerza estimulación cognitiva.\n`; indicationsAdded = true; }
        if (formData.derivacionMasAma) { actuacion += `- Derivación más AMA (caso de autovalente con riesgo, autovalente sin riesgo, riesgo dependencia).\n`; indicationsAdded = true; }
        if (formData.tallerCaidas) { actuacion += `- Taller de caídas (eu o tug alterado).\n`; indicationsAdded = true; }
        if (formData.derivacionMedicoDepresion) { actuacion += `- Derivación médico por sospecha depresión (yesavage alterado).\n`; indicationsAdded = true; }
        if (formData.derivacionMedicoDemencia) { actuacion += `- Derivación medico por sospecha demencia (minimental alterado).\n`; indicationsAdded = true; }
        if (formData.derivacionMedicoInterconsulta) { actuacion += `- Derivación a médico para interconsulta.\n`; indicationsAdded = true; }
        if (formData.proximoControlMeses) { actuacion += `- Próximo control del adulto mayor en ${formData.proximoControlMeses} meses.\n`; indicationsAdded = true; }
        if (formData.tomaDecisionesCompartidas) { actuacion += `- Toma de decisiones compartidas, compromisos de automanejo, acuerdos, etc: ${formData.tomaDecisionesCompartidas}\n`; indicationsAdded = true; }
        if (!indicationsAdded) { actuacion += `(Sin indicaciones especiales)\n`; }

        return { 
            anamnesis: anamnesis.trim(),
            exploracion: exploracion.trim(),
            actuacion: actuacion.trim()
        };
    }, [formData, loggedInUser]);

    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = calculateGeneratedTextParts();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, calculateGeneratedTextParts]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleCopyToClipboard = (textToCopy: string, partName: string) => {
        navigator.clipboard.writeText(textToCopy).then(() => alert(`'${partName}' copiado al portapapeles.`));
    };

    const handleNewDocument = () => {
        setFormData(initialFormData);
    };
    
    const indicacionCheckboxes = [
        { key: 'derivacionVacunatorio', label: 'Derivación a vacunatorio' },
        { key: 'derivacionPacam', label: 'Derivación a PACAM' },
        { key: 'derivacionControlesPendientes', label: 'Derivación a controles pendientes' },
        { key: 'consejeriaAlimentacionSaludable', label: 'Consejería alimentación saludable' },
        { key: 'refuerzaEstimulacionCognitiva', label: 'Se refuerza estimulación cognitiva' },
        { key: 'derivacionMasAma', label: 'Derivación más AMA' },
        { key: 'tallerCaidas', label: 'Taller de caídas (eu o tug alterado)' },
        { key: 'derivacionMedicoDepresion', label: 'Derivación médico por sospecha depresión (yesavage alterado)' },
        { key: 'derivacionMedicoDemencia', label: 'Derivación medico por sospecha demencia (minimental alterado)' },
        { key: 'derivacionMedicoInterconsulta', label: 'Derivación a médico para interconsulta' },
    ];


    return (
        <div className="w-full bg-white shadow-xl rounded-xl p-4 sm:p-6">
            <header className="mb-6 text-center">
                <h2 className="text-3xl font-semibold text-slate-700">Ficha Control Adulto Mayor (Enfermería)</h2>
                <p className="text-slate-500 mt-2">Complete los campos. El resumen se generará automáticamente.</p>
            </header>

            <div className="flex flex-col lg:flex-row lg:gap-8 mt-6">
                <div className="lg:w-3/5 xl:w-7/12 space-y-4 flex-shrink-0 pr-4">
                    <DateField label="Fecha de Control" id="fechaControl" name="fechaControl" value={formData.fechaControl} onChange={handleChange} />
                    
                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 -mb-2">Anamnesis</h2>
                        <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Identificación</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500">
                                        <option value="">Seleccione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Anamnesis General</h3>
                            <FormField label="Asiste en compañía de" id="asisteCompaniaDe" name="asisteCompaniaDe" value={formData.asisteCompaniaDe} onChange={handleChange} />
                            <FormField label="Uso de ayudas técnicas" id="usoAyudasTecnicas" name="usoAyudasTecnicas" value={formData.usoAyudasTecnicas} onChange={handleChange} />
                            <FormField label="Vive con" id="viveCon" name="viveCon" value={formData.viveCon} onChange={handleChange} />
                            <FormField label="Ocupación" id="ocupacion" name="ocupacion" value={formData.ocupacion} onChange={handleChange} />
                            <FormField label="Redes de apoyo" id="redesApoyo" name="redesApoyo" value={formData.redesApoyo} onChange={handleChange} isTextArea rows={2}/>
                            {/* FIX: Renamed name and value to use 'setEscolaridad'. */}
                            <FormField label="Escolaridad" id="escolaridad" name="setEscolaridad" value={formData.setEscolaridad} onChange={handleChange} />
                            <FormField label="Antecedentes mórbidos" id="antecedentesMorbidos" name="antecedentesMorbidos" value={formData.antecedentesMorbidos} onChange={handleChange} isTextArea rows={3}/>
                            <FormField label="Tratamiento farmacológico actual" id="tratamientoFarmacologicoActual" name="tratamientoFarmacologicoActual" value={formData.tratamientoFarmacologicoActual} onChange={handleChange} isTextArea rows={3}/>
                        </section>
                        
                        <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Hábitos</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Alimentación" id="alimentacion" name="alimentacion" value={formData.alimentacion} onChange={handleChange} />
                                <FormField label="Ingesta de líquidos" id="ingestaLiquidos" name="ingestaLiquidos" value={formData.ingestaLiquidos} onChange={handleChange} />
                                <FormField label="OH" id="oh" name="oh" value={formData.oh} onChange={handleChange} />
                                <FormField label="Tabaquismo" id="tabaquismo" name="tabaquismo" value={formData.tabaquismo} onChange={handleChange} />
                                <FormField label="Actividad física" id="actividadFisica" name="actividadFisica" value={formData.actividadFisica} onChange={handleChange} />
                                <FormField label="Sueño" id="sueno" name="sueno" value={formData.sueno} onChange={handleChange} />
                                <FormField label="Orina" id="orina" name="orina" value={formData.orina} onChange={handleChange} />
                                <FormField label="Deposiciones" id="deposiciones" name="deposiciones" value={formData.deposiciones} onChange={handleChange} />
                                <FormField label="Incontinencia" id="incontinencia" name="incontinencia" value={formData.incontinencia} onChange={handleChange} />
                                <FormField label="Uso de laxantes" id="usoLaxantes" name="usoLaxantes" value={formData.usoLaxantes} onChange={handleChange} />
                                <FormField label="Actividad sexual" id="actividadSexual" name="actividadSexual" value={formData.actividadSexual} onChange={handleChange} />
                            </div>
                        </section>
                    </div>

                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 space-y-4">
                         <h2 className="text-xl font-bold text-slate-800 -mb-2">Exploración</h2>
                         <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Otras Exploraciones</h3>
                            <FormField label="Examen de mamas" id="examenMamas" name="examenMamas" value={formData.examenMamas} onChange={handleChange} />
                            <FormField label="Vacunas" id="vacunas" name="vacunas" value={formData.vacunas} onChange={handleChange} />
                            <FormField label="Sintomatología" id="sintomatologia" name="sintomatologia" value={formData.sintomatologia} onChange={handleChange} isTextArea rows={2}/>
                            <FormField label="Alteración visual" id="alteracionVisual" name="alteracionVisual" value={formData.alteracionVisual} onChange={handleChange} />
                            <FormField label="Alteración auditiva" id="alteracionAuditiva" name="alteracionAuditiva" value={formData.alteracionAuditiva} onChange={handleChange} />
                            <FormField label="Participación social" id="participacionSocial" name="participacionSocial" value={formData.participacionSocial} onChange={handleChange} />
                            <FormField label="Hobbies/actividad de bienestar" id="hobbiesBienestar" name="hobbiesBienestar" value={formData.hobbiesBienestar} onChange={handleChange} />
                        </section>
                    </div>

                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 -mb-2">Actuación / Plan</h2>
                        <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold mb-3 text-sky-700 border-b border-sky-200 pb-2">Indicaciones</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {indicacionCheckboxes.map(item => (
                                    <div key={item.key} className="flex items-center">
                                        <input type="checkbox" id={item.key} name={item.key} checked={formData[item.key as keyof FichaControlAdultoMayorFormData] as boolean} onChange={handleChange} className="h-4 w-4 text-sky-600 rounded" />
                                        <label htmlFor={item.key} className="ml-2 text-sm text-slate-700">{item.label}</label>
                                    </div>
                                ))}
                            </div>
                            <FormField label="Próximo control del adulto mayor en (meses)" id="proximoControlMeses" name="proximoControlMeses" value={formData.proximoControlMeses} onChange={handleChange} type="number" containerClassName="mt-4" />
                            <FormField label="Toma de decisiones compartidas, compromisos, etc." id="tomaDecisionesCompartidas" name="tomaDecisionesCompartidas" value={formData.tomaDecisionesCompartidas} onChange={handleChange} isTextArea rows={3} containerClassName="mt-3" />
                        </section>
                    </div>
                </div>
                
                <div className="mt-8 lg:mt-0 lg:w-2/5 xl:w-5/12 lg:sticky lg:top-20 flex flex-col lg:h-[calc(100vh-215px)] lg:max-h-[calc(100vh-215px)] mb-12 overflow-hidden bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 border-b border-sky-200/80 pb-1 flex-shrink-0">Resumen Ficha Clínica (Editable)</h3>
                    <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden w-full">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                                <label htmlFor="anamnesisText" className="block text-[11px] font-semibold text-slate-800">Anamnesis</label>
                                <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea id="anamnesisText" value={anamnesisText} onChange={(e) => setAnamnesisText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" aria-label="Anamnesis - editable" />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                                <label htmlFor="exploracionText" className="block text-[11px] font-semibold text-slate-800">Exploración</label>
                                <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea id="exploracionText" value={exploracionText} onChange={(e) => setExploracionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" aria-label="Exploración - editable" />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-0.5 flex-shrink-0">
                                <label htmlFor="actuacionText" className="block text-[11px] font-semibold text-slate-800">Actuación</label>
                                <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea id="actuacionText" value={actuacionText} onChange={(e) => setActuacionText(e.target.value)} className="flex-1 w-full p-1.5 py-1 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[10.5px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none" aria-label="Actuación - editable" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
                <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg" aria-label="Volver al menú principal">Volver al Menú</button>
                <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg" aria-label="Limpiar formulario para crear una nueva ficha">Limpiar Formulario</button>
            </div>
        </div>
    );
};

export default FichaControlAdultoMayor;
