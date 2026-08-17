import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import RutInput from './RutInput';
import DateField from './DateField';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { User } from '../types';

interface HgtRow {
  fecha: string;
  hora: string;
  valor: string;
  observacion: string;
}

interface HgtCardData {
  id: string;
  nombrePaciente: string;
  rut: string;
  edad: string;
  fechaAtencion: string;
  numeroSesiones: string;
  sensibilidad: string;
  antecedentesMedicos: string;
  farmacos: string;
  dosisAyunas: string;
  dosisNoche: string;
  peso: string;
  ultimoLabFecha: string;
  ultimoLabResultados: string;
  ayunasRows: HgtRow[];
  almuerzoRows: HgtRow[];
  planMantener: boolean;
  planAlta: boolean;
  planAgendar: boolean;
  planAsistir: boolean;
  planSolicitarHba1c: boolean;
  planSolicitarNuevoHgt: boolean;
}

const createEmptyRows = (count: number): HgtRow[] => 
  Array(count).fill(null).map(() => ({ fecha: '', hora: '', valor: '', observacion: '' }));

const createNewCard = (index: number): HgtCardData => ({
  id: `${Date.now()}-${index}`,
  nombrePaciente: '',
  rut: '',
  edad: '',
  fechaAtencion: new Date().toISOString().split('T')[0],
  numeroSesiones: Math.ceil(new Date().getDate() / 7).toString(),
  sensibilidad: '',
  antecedentesMedicos: 'DM2',
  farmacos: '',
  dosisAyunas: '',
  dosisNoche: '',
  peso: '',
  ultimoLabFecha: '',
  ultimoLabResultados: '',
  ayunasRows: createEmptyRows(3),
  almuerzoRows: createEmptyRows(3),
  planMantener: false,
  planAlta: false,
  planAgendar: false,
  planAsistir: false,
  planSolicitarHba1c: false,
  planSolicitarNuevoHgt: false,
});

const planCheckboxesConfig: { key: keyof HgtCardData; label: string }[] = [
  { key: 'planMantener', label: 'Mantener tratamiento' },
  { key: 'planAlta', label: 'Alta de grupal' },
  { key: 'planAgendar', label: 'Agendar hora para control cardiovascular con médico' },
  { key: 'planAsistir', label: 'Asistir a próximo encuentro del grupal' },
  { key: 'planSolicitarHba1c', label: 'Se solicita HBA1C' },
  { key: 'planSolicitarNuevoHgt', label: 'Se solicita nuevo HGT' },
];

const MaskedTableInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  separator: '/' | ':';
  placeholder: [string, string];
}> = ({ value, onChange, separator, placeholder }) => {
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [part1, part2] = useMemo(() => {
    const split = value.split(separator);
    return [split[0] || '', split[1] || ''];
  }, [value, separator]);

  const update = (p1: string, p2: string) => {
    if (!p1 && !p2) {
      onChange('');
    } else {
      onChange(`${p1}${separator}${p2}`);
    }
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    update(val, part2);
    if (val.length === 2) {
      secondInputRef.current?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 bg-white h-full w-full py-2.5">
      <input
        type="text"
        maxLength={2}
        value={part1}
        onChange={handlePart1Change}
        placeholder={placeholder[0]}
        className="w-7 bg-transparent text-center outline-none font-bold text-slate-800 placeholder-slate-200"
      />
      <span className="text-slate-400 font-black select-none">{separator}</span>
      <input
        type="text"
        maxLength={2}
        ref={secondInputRef}
        value={part2}
        onChange={(e) => update(part1, e.target.value.replace(/\D/g, ''))}
        placeholder={placeholder[1]}
        className="w-7 bg-transparent text-center outline-none font-bold text-slate-800 placeholder-slate-200"
      />
    </div>
  );
};

const HGTCard: React.FC<{ 
  data: HgtCardData; 
  onUpdate: (id: string, newData: HgtCardData) => void;
  onRemove: (id: string) => void;
  loggedInUser: User | null;
}> = ({ data, onUpdate, onRemove, loggedInUser }) => {

  const [anamnesis, setAnamnesis] = useState('');
  const [exploracion, setExploracion] = useState('');
  const [actuacion, setActuacion] = useState('');
  const [isLabLoading, setIsLabLoading] = useState(false);
  const labFileRef = useRef<HTMLInputElement>(null);

  const handleCopySection = (text: string, title: string) => {
    navigator.clipboard.writeText(text).then(() => alert(`${title} copiado al portapapeles.`));
  };

  const clinicalSuggestion = useMemo(() => {
    const weight = parseFloat(data.peso.replace(',', '.'));
    const amDose = parseInt(data.dosisAyunas) || 0;
    const pmDose = parseInt(data.dosisNoche) || 0;
    const tdd = amDose + pmDose; 
    
    const getRepresentativeValue = (rows: HgtRow[]) => {
      const vals = rows.map(r => parseInt(r.valor)).filter(v => !isNaN(v));
      return vals.length > 0 ? Math.min(...vals) : null;
    };

    const minAyunas = getRepresentativeValue(data.ayunasRows);
    const minAlmuerzo = getRepresentativeValue(data.almuerzoRows);

    if (minAyunas === null && minAlmuerzo === null) return "Ingrese valores de HGT para recibir una sugerencia.";
    if (tdd === 0) return "Ingrese la dosis actual de insulina para calcular el ajuste.";

    let adjustmentPercent = 0;
    let reason = "";

    if ((minAyunas !== null && minAyunas < 80) || (minAlmuerzo !== null && minAlmuerzo < 80)) {
        adjustmentPercent = -0.15; 
        reason = "Riesgo de Hipoglicemia (HGT < 80)";
    } 
    else if (minAyunas !== null && minAyunas > 130) {
        if (minAyunas > 180) {
            adjustmentPercent = 0.20;
            reason = "HGT Ayunas > 180 mg/dL";
        } else {
            adjustmentPercent = 0.10;
            reason = "HGT Ayunas entre 131 - 180 mg/dL";
        }
    }
    else if (minAlmuerzo !== null && minAlmuerzo > 130) {
        if (minAlmuerzo > 180) {
            adjustmentPercent = 0.20;
            reason = "HGT Pre-Almuerzo > 180 mg/dL";
        } else {
            adjustmentPercent = 0.10;
            reason = "HGT Pre-Almuerzo entre 131 - 180 mg/dL";
        }
    }

    if (adjustmentPercent !== 0) {
        const delta = Math.round(tdd * adjustmentPercent);
        const newTdd = tdd + delta;
        
        let msg = `Protocolo MINSAL sugiere ajustar la DOSIS TOTAL DIARIA (TDD): `;
        msg += `Actualmente ${tdd} UI -> Sugerido ${newTdd} UI `;
        msg += `(${delta > 0 ? 'aumento' : 'reducción'} de ${Math.abs(delta)} UI, equivalente al ${Math.abs(adjustmentPercent * 100)}% por ${reason}).`;
        
        if (weight > 0) {
            const maxDose = weight * 1.0;
            if (newTdd > maxDose) {
                msg = `⚠️ ALERTA: El ajuste sugerido de ${newTdd} UI superaría el tope de 1.0 UI/kg (${maxDose.toFixed(0)} UI). Mantener ${tdd} UI y reevaluar.`;
            }
        }
        return msg;
    }

    return "Mantener dosis actual (Valores en meta).";
  }, [data]);

  const uiKg = useMemo(() => {
    const totalUi = (parseInt(data.dosisAyunas) || 0) + (parseInt(data.dosisNoche) || 0);
    const pesoVal = parseFloat(data.peso.replace(',', '.'));
    return (totalUi > 0 && pesoVal > 0) ? (totalUi / pesoVal).toFixed(2) : '0.00';
  }, [data.dosisAyunas, data.dosisNoche, data.peso]);

  useEffect(() => {
    const ageValue = parseInt(data.edad);
    if (!isNaN(ageValue) && ageValue > 70 && data.sensibilidad !== 'Insulino sensible') {
      onUpdate(data.id, { ...data, sensibilidad: 'Insulino sensible' });
    }
  }, [data.edad, data.sensibilidad, data.id, onUpdate]);

  useEffect(() => {
    let anamText = `FICHA GRUPAL DM2\n---------------------------------------\n`;
    anamText += `FECHA DE ATENCIÓN: ${data.fechaAtencion || new Date().toLocaleDateString('es-CL')}\n`;
    anamText += `PROFESIONAL RESPONSABLE: ${loggedInUser?.fullName || '(No especificado)'}\n`;
    anamText += `NÚMERO DE SESIONES: ${data.numeroSesiones || '1'}\n`;
    anamText += `MOTIVO DE CONSULTA: GRUPAL DM2\n---------------------------------------\n\n`;
    anamText += `ANAMNESIS\nSensibilidad: ${data.sensibilidad || '(No especificada)'}\n`;
    anamText += `Antecedentes médicos: ${data.antecedentesMedicos || '(No explorado)'}\n`;
    
    let farmacosText = data.farmacos || '';
    if (data.dosisAyunas || data.dosisNoche) {
        const insulinLine = `Insulina NPH ${data.dosisAyunas || '0'} AM / ${data.dosisNoche || '0'} PM`;
        const dosePerWeightLine = `Dosis por peso: ${uiKg} UI/Kg`;
        farmacosText = farmacosText ? `${farmacosText}\n- ${insulinLine}\n- ${dosePerWeightLine}` : `${insulinLine}\n${dosePerWeightLine}`;
    }
    anamText += `Fármacos: ${farmacosText || '(No explorado)'}`;
    setAnamnesis(anamText);

    let explText = `ÚLTIMO LABORATORIO (${data.ultimoLabFecha || 'Fecha s/i'}):\n${data.ultimoLabResultados || 'Sin registros.'}\n\n`;
    explText += `EXAMEN FÍSICO:\n- Peso: ${data.peso || '(No ingresado)'} kg\n`;

    const formatHgtRows = (rows: HgtRow[]) => {
        return rows.filter(r => r.valor).map(r => {
            const hasFecha = r.fecha && r.fecha !== '/';
            const hasHora = r.hora && r.hora !== ':';
            let label = '';
            if (hasFecha) label += r.fecha;
            if (hasHora) label += (label ? ' ' : '') + r.hora;
            
            return label ? `${label}: ${r.valor} mg/dL` : `${r.valor} mg/dL`;
        }).join(', ');
    };
    explText += `- HGT AYUNAS: ${formatHgtRows(data.ayunasRows) || 's/r'}\n- HGT PRE-ALMUERZO: ${formatHgtRows(data.almuerzoRows) || 's/r'}`;
    setExploracion(explText);

    const selectedPlans = planCheckboxesConfig
        .filter(p => data[p.key as keyof HgtCardData])
        .map(p => `- ${p.label}.`);
    
    let actText = selectedPlans.length > 0 ? selectedPlans.join('\n') : '(Sin indicaciones seleccionadas)';
    setActuacion(actText);
  }, [data, loggedInUser, uiKg]);

  const handleInputChange = (field: keyof HgtCardData, value: any) => {
    onUpdate(data.id, { ...data, [field]: value });
  };

  const handleRowChange = (section: 'ayunas' | 'almuerzo', index: number, field: keyof HgtRow, value: string) => {
    const newAyunasRows = [...data.ayunasRows];
    const newAlmuerzoRows = [...data.almuerzoRows];

    if (section === 'ayunas') {
      newAyunasRows[index] = { ...newAyunasRows[index], [field]: value };
      if (field === 'fecha') {
        newAlmuerzoRows[index] = { ...newAlmuerzoRows[index], fecha: value };
      }
    } else {
      newAlmuerzoRows[index] = { ...newAlmuerzoRows[index], [field]: value };
    }

    onUpdate(data.id, { 
      ...data, 
      ayunasRows: newAyunasRows,
      almuerzoRows: newAlmuerzoRows
    });
  };

  const handleLabImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            if (!event.target?.result) return;
            const dataUrl = event.target.result as string;
            const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
            setIsLabLoading(true);
            try {
                const ai = new UniversalAIClient({ apiKey: process.env.GROQ_API_KEY! });
                const response = await ai.models.generateContent({
                  model: 'llama-3.2-90b-vision-preview',
                  contents: { parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: "Resume los resultados de laboratorio para ficha médica: NOMBRE: VALOR UNIDAD. Omite datos personales." }] },
                });
                handleInputChange('ultimoLabResultados', response.text);
            } catch (e) {
                alert("Error con IA");
            } finally {
                setIsLabLoading(false);
            }
        };
        fileReader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn grid grid-cols-1 xl:grid-cols-2">
      <button onClick={() => onRemove(data.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors z-20 p-2" title="Eliminar registro">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="p-8 border-r border-slate-100 bg-white space-y-8">
        <div className="grid grid-cols-[115px_1fr_150px_125px] border border-[#002855] bg-white overflow-hidden">
          <div className="flex items-center justify-center p-3 border-r border-[#002855] bg-slate-50">
            <svg className="w-14 h-14 text-[#002855]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><rect x="30" y="10" width="40" height="80" rx="5" /><rect x="10" y="30" width="80" height="40" rx="5" /></svg>
          </div>
          <div className="p-4 border-r border-[#002855] space-y-3">
            <div className="flex flex-col"><label className="text-[11px] font-black uppercase text-slate-500 mb-1 tracking-tight">Paciente:</label><input type="text" value={data.nombrePaciente} onChange={(e) => handleInputChange('nombrePaciente', e.target.value)} className="border-b border-dotted border-slate-400 outline-none text-base w-full bg-transparent font-bold text-black focus:border-emerald-500" placeholder="Nombre..." /></div>
            <div className="flex gap-4">
              <div className="flex flex-col flex-grow"><label className="text-[11px] font-black uppercase text-slate-500 mb-1 tracking-tight">RUT:</label><input type="text" value={data.rut} onChange={(e) => handleInputChange('rut', e.target.value)} placeholder="12345678-9" className="border-b border-dotted border-slate-400 outline-none text-base w-full bg-transparent font-bold text-black focus:border-emerald-500" /></div>
              <div className="flex flex-col w-16 flex-shrink-0"><label className="text-[11px] font-black uppercase text-slate-500 mb-1 tracking-tight">Edad:</label><input type="text" value={data.edad} onChange={(e) => handleInputChange('edad', e.target.value)} className="border-b border-dotted border-slate-400 outline-none text-base w-full bg-transparent font-bold text-black focus:border-emerald-500 text-left" maxLength={3} /></div>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 flex flex-col justify-center border-r border-[#002855]">
            <label className="text-[10px] font-black uppercase text-emerald-900 block leading-tight text-center mb-2">Insulina</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                  <input type="text" value={data.dosisAyunas} onChange={(e) => handleInputChange('dosisAyunas', e.target.value.replace(/\D/g, ''))} className="outline-none text-3xl w-14 bg-transparent text-center font-black text-emerald-900" maxLength={2} placeholder="0" />
                  <span className="text-[12px] font-black text-emerald-600">AM</span>
              </div>
              <div className="flex items-center justify-between">
                  <input type="text" value={data.dosisNoche} onChange={(e) => handleInputChange('dosisNoche', e.target.value.replace(/\D/g, ''))} className="outline-none text-3xl w-14 bg-transparent text-center font-black text-emerald-900" maxLength={2} placeholder="0" />
                  <span className="text-[12px] font-black text-emerald-600">PM</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-sky-50 flex flex-col justify-center">
              <label className="text-[10px] font-black uppercase text-sky-900 leading-none mb-1.5 text-center">Peso</label>
              <input type="text" value={data.peso} onChange={(e) => handleInputChange('peso', e.target.value.replace(/[^\d.,]/g, ''))} className="w-full bg-white border border-sky-200 rounded text-center text-lg font-black text-sky-900 outline-none" placeholder="0" />
              <div className="mt-2 border-t border-sky-200 pt-2 text-center"><span className="text-[10px] font-bold text-sky-600 block uppercase tracking-tighter">UI/kg</span><span className="text-sm font-black text-sky-700">{uiKg}</span></div>
          </div>
        </div>

        <div className="p-5 bg-amber-50 border-l-8 border-amber-500 rounded-xl shadow-md transition-all">
            <h4 className="text-sm font-black text-amber-900 uppercase mb-2 flex items-center gap-2 tracking-tighter">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Sugerencia de Ajuste (Dosis Total Diaria)
            </h4>
            <p className="text-[13px] text-amber-950 font-bold leading-relaxed italic">
                {clinicalSuggestion}
            </p>
        </div>

        <div className="hgt-table-container">
          <table className="w-full text-center text-sm table-fixed">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-[12px] text-slate-800">
                <th className="p-2 w-1/3">Fecha</th>
                <th className="p-2 w-1/3">Hora</th>
                <th className="p-2 w-1/3">Valor HGT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-200"><td colSpan={3} className="p-1 font-black text-[11px] uppercase text-slate-900 tracking-wider">AYUNAS (Basal)</td></tr>
              {data.ayunasRows.map((row, idx) => (
                <tr key={`ayunas-${idx}`}>
                  <td className="p-0 bg-white">
                    <MaskedTableInput value={row.fecha} separator="/" placeholder={['DD', 'MM']} onChange={(val) => handleRowChange('ayunas', idx, 'fecha', val)} />
                  </td>
                  <td className="p-0 bg-white">
                    <MaskedTableInput value={row.hora} separator=":" placeholder={['HH', 'MM']} onChange={(val) => handleRowChange('ayunas', idx, 'hora', val)} />
                  </td>
                  <td className="p-0 relative bg-white overflow-hidden">
                    <input type="text" value={row.valor} onChange={(e) => handleRowChange('ayunas', idx, 'valor', e.target.value.replace(/\D/g, ''))} className={`w-full py-2.5 pr-12 pl-3 outline-none bg-transparent text-center font-black text-xl ${row.valor && (parseInt(row.valor) < 80 || parseInt(row.valor) > 130) ? 'bg-red-50 text-red-600' : 'text-slate-900'}`} placeholder="---" />
                    {row.valor && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">mg/dL</span>}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-200"><td colSpan={3} className="p-1 font-black text-[11px] uppercase text-slate-900 tracking-wider">PRE-ALMUERZO (Prandial)</td></tr>
              {data.almuerzoRows.map((row, idx) => (
                <tr key={`almuerzo-${idx}`}>
                  <td className="p-0 bg-slate-50">
                    <MaskedTableInput value={row.fecha} separator="/" placeholder={['DD', 'MM']} onChange={(val) => handleRowChange('almuerzo', idx, 'fecha', val)} />
                  </td>
                  <td className="p-0 bg-white">
                    <MaskedTableInput value={row.hora} separator=":" placeholder={['HH', 'MM']} onChange={(val) => handleRowChange('almuerzo', idx, 'hora', val)} />
                  </td>
                  <td className="p-0 relative bg-white overflow-hidden">
                    <input type="text" value={row.valor} onChange={(e) => handleRowChange('almuerzo', idx, 'valor', e.target.value.replace(/\D/g, ''))} className={`w-full py-2.5 pr-12 pl-3 outline-none bg-transparent text-center font-black text-xl ${row.valor && (parseInt(row.valor) >= 180) ? 'bg-red-50 text-red-600' : 'text-slate-900'}`} placeholder="---" />
                    {row.valor && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">mg/dL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-4">
                <h4 className="text-xs font-black text-sky-800 uppercase border-b border-sky-100 pb-1">Identificación y Anamnesis</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Atención</label><input type="date" value={data.fechaAtencion} onChange={e => handleInputChange('fechaAtencion', e.target.value)} className="w-full text-sm p-1.5 border rounded-none border-slate-200 outline-none focus:border-sky-500 bg-white text-black" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">N° Sesión</label><select value={data.numeroSesiones} onChange={e => handleInputChange('numeroSesiones', e.target.value)} className="w-full text-sm p-1.5 border rounded-none border-slate-200 outline-none focus:border-sky-500 bg-white text-black">{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                </div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Sensibilidad</label><select value={data.sensibilidad} onChange={e => handleInputChange('sensibilidad', e.target.value)} className="w-full text-sm p-1.5 border rounded-none border-slate-200 outline-none focus:border-sky-500 bg-white text-black"><option value="">Seleccione...</option><option value="Insulino sensible">Insulino sensible</option><option value="Sensibilidad usual">Sensibilidad usual</option><option value="Insulino resistente">Insulino resistente</option></select></div>
                <textarea value={data.antecedentesMedicos} onChange={e => handleInputChange('antecedentesMedicos', e.target.value)} className="w-full text-xs p-2 border rounded-none border-slate-200 outline-none h-16 bg-white text-black" placeholder="Antecedentes médicos..." />
                <textarea value={data.farmacos} onChange={e => handleInputChange('farmacos', e.target.value)} className="w-full text-xs p-2 border rounded-none border-slate-200 outline-none h-16 bg-white text-black" placeholder="Fármacos..." />
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-sky-100 pb-1">
                    <h4 className="text-xs font-black text-sky-800 uppercase">Exploración / Laboratorio</h4>
                    <button 
                        onClick={() => labFileRef.current?.click()} 
                        disabled={isLabLoading || loggedInUser?.profession !== 'medicina'}
                        className="text-[9px] bg-sky-600 text-white px-2 py-0.5 rounded font-bold hover:bg-sky-700 transition-colors uppercase disabled:bg-slate-300"
                    >
                        {isLabLoading ? '...' : (loggedInUser?.profession === 'medicina' ? 'Importar' : 'No disponible')}
                    </button>
                    <input type="file" ref={labFileRef} onChange={handleLabImport} className="hidden" accept="application/pdf,image/*" />
                </div>
                <DateField label="Fecha Lab" id="ultimoLabFecha" name="ultimoLabFecha" value={data.ultimoLabFecha} onChange={e => handleInputChange('ultimoLabFecha', e.target.value)} />
                <textarea value={data.ultimoLabResultados} onChange={e => handleInputChange('ultimoLabResultados', e.target.value)} className="w-full text-[10px] p-2 border rounded-none border-slate-200 outline-none h-32 font-mono bg-white text-black" placeholder="Resultados laboratorio..." />
            </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-none">
            <h4 className="text-xs font-black text-sky-800 uppercase mb-4 tracking-widest">Actuación / Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planCheckboxesConfig.map(item => (
                    <label key={item.key} className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-none cursor-pointer hover:bg-sky-50 transition-colors shadow-sm"><input type="checkbox" checked={data[item.key as keyof HgtCardData] as boolean} onChange={e => handleInputChange(item.key as keyof HgtCardData, e.target.checked)} className="h-4 w-4 text-sky-600 rounded-none" /><span className="text-[11px] text-slate-700 font-medium padding-tight">{item.label}</span></label>
                ))}
            </div>
        </div>
      </div>

      <div className="p-8 bg-slate-50 flex flex-col gap-6">
        <h3 className="text-base font-black text-emerald-800 uppercase tracking-widest flex items-center gap-3 mb-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg> Ficha Individual Generada</h3>
        <div className="flex flex-col flex-1"><div className="flex justify-between items-center mb-1.5"><span className="text-[12px] font-black text-slate-400 uppercase tracking-tighter">Anamnesis</span><button onClick={() => handleCopySection(anamnesis, 'Anamnesis')} className="text-[11px] bg-slate-200 px-3 py-1 rounded font-bold text-slate-600 hover:bg-slate-300">COPIAR</button></div><textarea value={anamnesis} readOnly className="w-full flex-grow p-3 text-[11px] font-mono border border-slate-200 bg-white text-slate-800 rounded-xl outline-none shadow-inner min-h-[160px]" /></div>
        <div className="flex flex-col flex-1"><div className="flex justify-between items-center mb-1.5"><span className="text-[12px] font-black text-slate-400 uppercase tracking-tighter">Exploración</span><button onClick={() => handleCopySection(exploracion, 'Exploración')} className="text-[11px] bg-slate-200 px-3 py-1 rounded font-bold text-slate-600 hover:bg-slate-300">COPIAR</button></div><textarea value={exploracion} readOnly className="w-full flex-grow p-3 text-[11px] font-mono border border-slate-200 bg-white text-slate-800 rounded-xl outline-none shadow-inner min-h-[160px]" /></div>
        <div className="flex flex-col flex-1"><div className="flex justify-between items-center mb-1.5"><span className="text-[12px] font-black text-slate-400 uppercase tracking-tighter">Actuación / Plan</span><button onClick={() => handleCopySection(actuacion, 'Actuación')} className="text-[11px] bg-slate-200 px-3 py-1 rounded font-bold text-slate-600 hover:bg-slate-300">COPIAR</button></div><textarea value={actuacion} readOnly className="w-full flex-grow p-3 text-[11px] font-mono border border-slate-200 bg-white text-slate-800 rounded-xl outline-none shadow-inner min-h-[120px]" /></div>
      </div>
    </div>
  );
};

const GrupalDiabetesManager: React.FC<{ onBackToMenu: () => void; loggedInUser: User | null }> = ({ onBackToMenu, loggedInUser }) => {
  const [numPacientes, setNumPacientes] = useState('1');
  const [cards, setCards] = useState<HgtCardData[]>([createNewCard(0)]);

  // Sincronización automática de las tarjetas con el número de pacientes
  useEffect(() => {
    const targetCount = parseInt(numPacientes);
    if (isNaN(targetCount) || targetCount < 0) return;

    setCards(prevCards => {
      if (prevCards.length === targetCount) return prevCards;
      
      if (prevCards.length < targetCount) {
        // Añadir tarjetas nuevas preservando las existentes
        const cardsToAdd = targetCount - prevCards.length;
        const newCards = Array(cardsToAdd).fill(null).map((_, i) => createNewCard(prevCards.length + i));
        return [...prevCards, ...newCards];
      } else {
        // Recortar la lista
        return prevCards.slice(0, targetCount);
      }
    });
  }, [numPacientes]);

  const addCard = () => {
    setNumPacientes(prev => (parseInt(prev) + 1).toString());
  };

  const removeCard = (id: string) => {
    if (cards.length > 0) {
      if (window.confirm("¿Está seguro de eliminar este paciente?")) {
        setCards(prev => prev.filter(c => c.id !== id));
        setNumPacientes(prev => (Math.max(0, parseInt(prev) - 1)).toString());
      }
    }
  };

  const updateCard = (id: string, newData: HgtCardData) => {
    setCards(prev => prev.map(c => c.id === id ? newData : c));
  };

  const globalStats = useMemo(() => {
    const allValues: number[] = [];
    let highCount = 0; let lowCount = 0;
    cards.forEach(card => {
      [...card.ayunasRows, ...card.almuerzoRows].forEach(row => {
        const val = parseInt(row.valor);
        if (!isNaN(val)) {
          allValues.push(val);
          if (val > 180) highCount++;
          if (val < 70) lowCount++;
        }
      });
    });
    if (allValues.length === 0) return null;
    return {
      totalTests: allValues.length,
      average: Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length),
      highs: highCount, lows: lowCount, patientsCount: cards.length
    };
  }, [cards]);

  return (
    <div className="w-full bg-slate-100 min-h-screen p-4 sm:p-6 flex flex-col gap-8 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white shadow-md rounded-2xl p-8 border-l-8 border-[#002855] gap-6">
        <div>
          <h2 className="text-4xl font-black text-[#002855] tracking-tighter uppercase leading-none">Gestión Grupal Diabetes</h2>
          <p className="text-slate-500 font-medium italic mt-3 text-lg">Análisis masivo según protocolo de insulinización MINSAL.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 bg-slate-50 border p-2 rounded-xl">
             <label className="text-xs font-bold text-slate-500 uppercase px-2">N° Pacientes:</label>
             <input 
              type="number" 
              value={numPacientes} 
              onChange={e => setNumPacientes(e.target.value)} 
              className="w-16 p-2 text-center font-bold border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" 
              min="0" 
              max="50" 
             />
          </div>
          <button onClick={() => onBackToMenu()} className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all text-base uppercase shadow-sm">VOLVER</button>
        </div>
      </header>

      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fadeIn">
          <div className="text-center p-3"><p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Pacientes</p><p className="text-3xl font-black text-slate-800">{globalStats.patientsCount}</p></div>
          <div className="text-center p-3 border-l border-slate-100"><p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Promedio HGT</p><p className="text-3xl font-black text-sky-600">{globalStats.average} <span className="text-sm">mg/dl</span></p></div>
          <div className="text-center p-3 border-l border-slate-100"><p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Alertas (&gt;180)</p><p className="text-3xl font-black text-red-600">{globalStats.highs}</p></div>
          <div className="text-center p-3 border-l border-slate-100"><p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Hipoglicemias</p><p className="text-3xl font-black text-orange-600">{globalStats.lows}</p></div>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {cards.map(card => (
          <HGTCard key={card.id} data={card} onUpdate={updateCard} onRemove={removeCard} loggedInUser={loggedInUser} />
        ))}
        <button onClick={addCard} className="border-4 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-300 transition-all bg-white/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span className="text-xl font-black uppercase tracking-widest">Añadir paciente manual</span>
        </button>
      </div>

      {globalStats && (
          <div className="bg-white p-10 rounded-3xl text-slate-900 border-2 border-slate-200 shadow-2xl mt-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>
              <div><h4 className="text-3xl font-black uppercase tracking-tighter text-[#002855]">Análisis del Copiloto Grupal</h4><p className="text-slate-500 text-base font-medium italic">Sugerencias de conducta clínica para el grupo.</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner"><p className="text-emerald-700 font-black mb-3 uppercase text-[12px] tracking-widest">Metas Consolidadas</p><p className="text-base leading-relaxed text-slate-700">Promedio glucémico de <span className="text-sky-600 font-bold text-xl">{globalStats.average} mg/dl</span>. Se detectaron {globalStats.highs} hiperglicemias que requieren revisión de dosis total diaria.</p></div>
                </div>
                <div className="bg-emerald-50 p-8 rounded-2xl border-2 border-emerald-200 flex flex-col justify-center italic text-base text-emerald-800 leading-relaxed shadow-sm">"El ajuste de insulina NPH debe considerar la dosis total diaria (TDD). Si el promedio del menor valor de 3 días en ayunas supera los 180, se recomienda un alza del 20% del total. Inicie siempre ajustando la dosis nocturna para impactar la glicemia basal."</div>
            </div>
          </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        input::placeholder { color: #cbd5e1; font-weight: normal; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .hgt-table-container { border: none; border-radius: 0; overflow: hidden; }
        .hgt-table-container table { border-collapse: collapse; width: 100%; border: 1px solid #002855; }
        .hgt-table-container th, 
        .hgt-table-container td { 
          border: 1px solid #002855 !important; 
          border-radius: 0 !important; 
        }
        .hgt-table-container input { border: none !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
};

export default GrupalDiabetesManager;
