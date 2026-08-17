import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CalculoLechesFormData } from '../types'; 
import FormField from './FormField';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: CalculoLechesFormData = {
  vecesPecho: '',
  vecesMamadera: '',
  vecesComida: '',
  edadMeses: '',
  pesoLactante: '',
  volumenPorTomaAjustado: '',
  sexo: '',
  usarPesoIdeal: false,
};

interface CalculoLechesFormProps {
  onBackToMenu: () => void;
}

const idealWeightDataGirls: Record<number, number> = {
  0: 3.2, 1: 4.2, 2: 5.1, 3: 5.8, 4: 6.4, 5: 6.9, 6: 7.3,
  7: 7.6, 8: 7.9, 9: 8.2, 10: 8.5, 11: 8.7, 12: 8.9,
};

const idealWeightDataBoys: Record<number, number> = {
  0: 3.3, 1: 4.5, 2: 5.6, 3: 6.4, 4: 7.0, 5: 7.5, 6: 7.9,
  7: 8.3, 8: 8.6, 9: 8.9, 10: 9.2, 11: 9.4, 12: 9.6,
};


export const CalculoLechesForm: React.FC<CalculoLechesFormProps> = ({ onBackToMenu }) => {
  const [formData, setFormData] = useFormLocalStorage<CalculoLechesFormData>('local_CalculoLechesForm', initialFormData);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = (target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value; 
    const type = (target as HTMLInputElement).type;

    if (type === 'checkbox' && target instanceof HTMLInputElement) {
        const { checked } = target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (target.tagName.toLowerCase() === 'select') {
        setFormData(prev => ({ ...prev, [name]: value as any }));
    }
    else {
        if ((name === 'pesoLactante' || name === 'volumenPorTomaAjustado') && value && !/^\d*\.?\d*$/.test(value)) {
            return;
        }
        if ((name === 'vecesPecho' || name === 'vecesMamadera' || name === 'vecesComida' || name === 'edadMeses') && value && !/^\d*$/.test(value)) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);
  
  const parsedInput = useMemo(() => {
    return {
      vecesPecho: parseInt(formData.vecesPecho, 10) || 0,
      vecesMamadera: parseInt(formData.vecesMamadera, 10) || 0,
      vecesComida: parseInt(formData.vecesComida, 10) || 0,
      edadMeses: parseInt(formData.edadMeses, 10), // Keep as NaN if empty or invalid for specific checks
      pesoLactante: parseFloat(formData.pesoLactante.replace(',', '.')) || 0,
      volumenPorTomaAjustado: parseFloat(formData.volumenPorTomaAjustado.replace(',', '.')) || 0,
      sexo: formData.sexo,
      usarPesoIdeal: formData.usarPesoIdeal,
    };
  }, [formData]);

  // Autofill pesoLactante if usarPesoIdeal is checked
  useEffect(() => {
    if (parsedInput.usarPesoIdeal && !isNaN(parsedInput.edadMeses) && parsedInput.sexo) {
      let idealWeight = 0;
      const age = Math.max(0, Math.min(12, parsedInput.edadMeses)); // Cap age between 0 and 12 for table lookup

      if (parsedInput.sexo === 'Femenino') {
        idealWeight = idealWeightDataGirls[age] || idealWeightDataGirls[12]; // Fallback to 12 months if age > 12
      } else if (parsedInput.sexo === 'Masculino') {
        idealWeight = idealWeightDataBoys[age] || idealWeightDataBoys[12]; // Fallback to 12 months
      }

      if (idealWeight > 0) {
        setFormData(prev => ({ ...prev, pesoLactante: idealWeight.toString() }));
      }
    }
  }, [parsedInput.usarPesoIdeal, parsedInput.edadMeses, parsedInput.sexo]);

  // Disable and clear 'vecesComida' if age is less than 6 months
  useEffect(() => {
    if (!isNaN(parsedInput.edadMeses) && parsedInput.edadMeses < 6) {
      if (formData.vecesComida !== '') {
        setFormData(prev => ({ ...prev, vecesComida: '' }));
      }
    }
  }, [parsedInput.edadMeses, formData.vecesComida]);


  const totalTomas = useMemo(() => {
    return parsedInput.vecesPecho + parsedInput.vecesMamadera + parsedInput.vecesComida;
  }, [parsedInput.vecesPecho, parsedInput.vecesMamadera, parsedInput.vecesComida]);

  const porcentajeLactancia = useMemo(() => {
    if (totalTomas === 0) return 0;
    return (parsedInput.vecesPecho * 100) / totalTomas;
  }, [parsedInput.vecesPecho, totalTomas]);

  const interpretacionPorcentajeLactancia = useMemo(() => {
    const p = porcentajeLactancia;
    if (p === 100) return 'LME (Lactancia Materna Exclusiva)';
    if (p >= 50) return 'LMP (Lactancia Materna Predominante)';
    if (p >= 10) return 'FP (Fórmula Predominante)';
    return 'FE (Fórmula Exclusiva)';
  }, [porcentajeLactancia]);

  const volumenTotalDia = useMemo(() => {
    return parsedInput.pesoLactante * 150; // cc
  }, [parsedInput.pesoLactante]);

  const volumenPorTomaCalculado = useMemo(() => { // This is the "guía"
    if (parsedInput.vecesMamadera === 0) return 0;
    return volumenTotalDia / parsedInput.vecesMamadera; // cc
  }, [volumenTotalDia, parsedInput.vecesMamadera]);

  // Auto-calculate and round AJUSTE (volumenPorTomaAjustado)
   useEffect(() => {
    if (parsedInput.vecesMamadera > 0 && parsedInput.pesoLactante > 0) {
      const guideVolumen = volumenPorTomaCalculado;
      const roundedVolumen = Math.ceil(guideVolumen / 30) * 30;
      
      if (roundedVolumen > 0 && roundedVolumen.toString() !== formData.volumenPorTomaAjustado) {
          setFormData(prev => ({
            ...prev,
            volumenPorTomaAjustado: roundedVolumen.toString()
          }));
      } else if (roundedVolumen <= 0 && formData.volumenPorTomaAjustado !== (guideVolumen > 0 ? '0' : '')) {
           setFormData(prev => ({
            ...prev,
            volumenPorTomaAjustado: guideVolumen > 0 ? '0' : ''
          }));
      }
    } else if (formData.volumenPorTomaAjustado !== '') {
        setFormData(prev => ({
            ...prev,
            volumenPorTomaAjustado: ''
        }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedInput.pesoLactante, parsedInput.vecesMamadera, volumenPorTomaCalculado]);


  const kgrFormulaMes = useMemo(() => {
    return ((parsedInput.volumenPorTomaAjustado * parsedInput.vecesMamadera) * 0.14) * 30; // grams
  }, [parsedInput.volumenPorTomaAjustado, parsedInput.vecesMamadera]);

  const tarrosMes = useMemo(() => {
    if (kgrFormulaMes === 0) return 0;
    return kgrFormulaMes / 900; // assuming 900g per can
  }, [kgrFormulaMes]);

  const handleNewCalculation = () => {
    setFormData(initialFormData);
  };

  const ejemploEdadTomas = [
    { edad: "<3 MESES", nTomas: "10-12" },
    { edad: "3-6 MESES", nTomas: "8" },
    { edad: "6 MESES", nTomas: "6" },
    { edad: ">7 MESES", nTomas: "6" },
    { edad: "1 AÑO", nTomas: "2" },
  ];

  const volumenMamaderaFL = [
    { volumen: 30, medidas: 1 },
    { volumen: 60, medidas: 2 },
    { volumen: 90, medidas: 3 },
    { volumen: 120, medidas: 4 },
    { volumen: 150, medidas: 5 },
    { volumen: 180, medidas: 6 },
    { volumen: 210, medidas: 7 },
    { volumen: 240, medidas: 8 },
  ];

  const isVecesComidaDisabled = isNaN(parsedInput.edadMeses) || parsedInput.edadMeses < 6;

  const ResultCard: React.FC<{ label: string; value: string | number; subtext?: string; className?: string }> = ({ label, value, subtext, className }) => (
    <div className={`p-3 bg-blue-100 border border-blue-200 rounded-lg ${className}`}>
      <label className="block text-sm font-medium text-blue-700">{label}</label>
      <p className="text-blue-800 font-bold text-lg">{value}</p>
      {subtext && <p className="text-xxs text-blue-600 mt-1">{subtext}</p>}
    </div>
  );

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-sky-700">
          CÁLCULO DE FÓRMULA DE INICIO
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Inputs */}
        <div className="space-y-4 flex flex-col">
          <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-md font-semibold text-slate-700 mb-3">1. DATOS DEL LACTANTE</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Edad (meses)" id="edadMeses" name="edadMeses" type="number" value={formData.edadMeses} onChange={handleChange} placeholder="Ej: 2" inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" />
                <div>
                  <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                  <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-red-500 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-700">
                    <option value="">Seleccione...</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center pt-2">
                <input type="checkbox" id="usarPesoIdeal" name="usarPesoIdeal" checked={formData.usarPesoIdeal} onChange={handleChange} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
                <label htmlFor="usarPesoIdeal" className="ml-2 text-sm text-slate-700">Usar Peso Ideal</label>
              </div>
              <FormField label="Peso del lactante (kg)" id="pesoLactante" name="pesoLactante" type="text" value={formData.pesoLactante} onChange={handleChange} placeholder="Ej: 5.1" required inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" disabled={formData.usarPesoIdeal} />
            </div>
          </section>
          
          <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex-grow">
            <h3 className="text-md font-semibold text-slate-700 mb-3">2. FRECUENCIA (en 24h)</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Veces que toma pecho" id="vecesPecho" name="vecesPecho" type="number" value={formData.vecesPecho} onChange={handleChange} required inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" />
                <FormField label="Veces que toma mamadera" id="vecesMamadera" name="vecesMamadera" type="number" value={formData.vecesMamadera} onChange={handleChange} required inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" />
              </div>
              <FormField label="Veces que come (>6 meses)" id="vecesComida" name="vecesComida" type="number" value={formData.vecesComida} onChange={handleChange} required inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" disabled={isVecesComidaDisabled} />
            </div>
          </section>
        </div>

        {/* Column 2: References */}
        <div className="space-y-4 flex flex-col">
           <section className="p-3 bg-purple-50 border border-purple-200 rounded-md">
              <h4 className="text-sm font-semibold text-purple-700 mb-1">Ejemplo Tomas/Día por Edad:</h4>
              <table className="w-full text-xs">
                <thead className="text-purple-700"><tr><th className="text-left py-0.5">EDAD</th><th className="text-right py-0.5">N° TOMAS</th></tr></thead>
                <tbody className="text-purple-600">{ejemploEdadTomas.map(item => <tr key={item.edad}><td className="py-0.5">{item.edad}</td><td className="text-right py-0.5">{item.nTomas}</td></tr>)}</tbody>
              </table>
            </section>
            
            <section className="p-3 bg-teal-50 border border-teal-200 rounded-md">
                <h4 className="text-sm font-semibold text-teal-700 mb-1">Preparación Mamadera:</h4>
                <table className="w-full text-xs">
                    <thead className="text-teal-700"><tr><th className="text-left py-1">Volumen (ml)</th><th className="text-right py-1">Medidas FL</th></tr></thead>
                    <tbody className="text-teal-600">{volumenMamaderaFL.map(item => <tr key={item.volumen}><td className="py-0.5">{item.volumen}</td><td className="text-right py-0.5">{item.medidas}</td></tr>)}</tbody>
                </table>
            </section>
            
            <section className="p-3 bg-pink-50 border border-pink-200 rounded-md h-auto">
                 <h4 className="text-sm font-semibold text-pink-700 mb-1">Categorías Lactancia:</h4>
                 <ul className="text-xs text-pink-600 space-y-0.5">
                     <li><span className="font-bold">FE (&lt;10%):</span> Fórmula Exclusiva</li>
                     <li><span className="font-bold">FP (10-49%):</span> Fórmula Predominante</li>
                     <li><span className="font-bold">LMP (50-90%):</span> Lactancia Materna Predominante</li>
                     <li><span className="font-bold">LME (100%):</span> Lactancia Materna Exclusiva</li>
                 </ul>
            </section>
        </div>

        {/* Column 3: Results */}
        <div className="space-y-4 flex flex-col">
            <section className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 flex-grow">
               <h3 className="text-md font-semibold text-slate-700 mb-3">3. RESULTADOS</h3>
               
                <div className="grid grid-cols-2 gap-3">
                    <ResultCard label="N° Total de Tomas / Comidas" value={totalTomas} className="h-full" />
                    <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg text-center flex flex-col justify-center h-full">
                        <label className="block text-sm font-medium text-purple-700">Porcentaje de Lactancia</label>
                        <p className="text-purple-800 font-bold text-2xl my-1">{porcentajeLactancia.toFixed(0)}%</p>
                        <p className="text-sm font-semibold text-purple-700">{interpretacionPorcentajeLactancia}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <ResultCard label="Volumen total/día (cc)" value={volumenTotalDia.toFixed(0)} subtext="Peso x 150cc" />
                    <ResultCard label="Volumen por toma (cc) (guía)" value={volumenPorTomaCalculado > 0 ? volumenPorTomaCalculado.toFixed(0) : 'N/A'} subtext="Vol. total / N° mamaderas" />
                </div>
                
                <div className="pt-2">
                    <FormField label="AJUSTE - Volumen por toma (ml)" id="volumenPorTomaAjustado" name="volumenPorTomaAjustado" type="number" step="30" value={formData.volumenPorTomaAjustado} onChange={handleChange} required inputClassName="border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500" />
                    <p className="text-xxs text-red-600 mt-1">*Ajustar a múltiplo de 30 (se auto-redondeará).</p>
                </div>

                <div className="p-3 bg-green-100 border border-green-300 rounded-md text-center mt-2">
                    <p className="text-sm font-medium text-green-700">PRESCRIPCIÓN</p>
                    <p className="text-green-800 font-bold text-lg">
                        LM + FL {parsedInput.vecesMamadera || 0} x {parsedInput.volumenPorTomaAjustado || 0}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <ResultCard label="KGR FL por Mes" value={`${kgrFormulaMes.toFixed(0)} g`} />
                    <ResultCard label="Tarros por Mes" value={tarrosMes.toFixed(2)} subtext="Tarros de 900g" />
                </div>
            </section>
        </div>

      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-300">
        <button
          type="button"
          onClick={onBackToMenu}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm"
        >
          Volver al Menú
        </button>
        <button
          type="button"
          onClick={handleNewCalculation}
          className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md"
        >
          Nueva Simulación
        </button>
      </div>
    </div>
  );
};

