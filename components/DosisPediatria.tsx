import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Define the structure for a drug's formulation
interface Formulation {
  type: string;
  concentration: string;
  unit: string;
  // The calculate function takes the dose in mg and returns the required amount
  calculate: (doseInMg: number, weightInKg: number) => number;
}

// Define the structure for a drug
interface Drug {
  id: string;
  name: string;
  calculateDosePerAdmin?: (weightInKg: number) => number; // Optional for single dose
  multiDoseCalculation?: (weightInKg: number) => Record<string, number>; // For multi-step dosing
  frequency: string;
  note?: string;
  formulations: Formulation[];
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange';
}

// Define drug data based on standard pediatric dosing and spreadsheet analysis
const drugs: Drug[] = [
  {
    id: 'paracetamol',
    name: 'Paracetamol',
    calculateDosePerAdmin: (weight) => weight * 15,
    frequency: 'Cada 6 hrs',
    color: 'red',
    formulations: [
      { type: 'Gotas', concentration: '100mg/ml', unit: 'gotas', calculate: (dose, weight) => dose / 5 },
      { type: 'Supositorio', concentration: '125mg', unit: 'N° supositorios', calculate: (dose, weight) => dose / 125 },
      { type: 'Jarabe', concentration: '120mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 120) * 5 },
      { type: 'Jarabe', concentration: '250mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 250) * 5 },
      { type: 'Comprimido', concentration: '80mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 80 },
      { type: 'Comprimido', concentration: '500mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 500 },
    ],
  },
  {
    id: 'ibuprofeno',
    name: 'Ibuprofeno',
    calculateDosePerAdmin: (weight) => Math.round(weight * 7.5),
    frequency: 'Cada 6 hrs',
    color: 'blue',
    formulations: [
      { type: 'Gotas', concentration: '100mg/ml', unit: 'gotas', calculate: (dose, weight) => (dose / 100) * 20 },
      { type: 'Supositorio', concentration: '125mg', unit: 'N° supositorios', calculate: (dose, weight) => dose / 125 },
      { type: 'Jarabe', concentration: '100mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 100) * 5 },
      { type: 'Jarabe', concentration: '200mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 200) * 5 },
      { type: 'Comprimido', concentration: '200mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 200 },
      { type: 'Comprimido', concentration: '400mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 400 },
    ],
  },
  {
    id: 'amoxicilina',
    name: 'Amoxicilina (Max 500mg/dosis)',
    calculateDosePerAdmin: (weight) => Math.min(500, (weight * 50) / 3),
    frequency: 'Cada 8 hrs',
    color: 'green',
    formulations: [
      { type: 'Jarabe', concentration: '125mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 125) * 5 },
      { type: 'Jarabe', concentration: '250mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 250) * 5 },
      { type: 'Jarabe', concentration: '500mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 500) * 5 },
      { type: 'Cápsula', concentration: '500mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 500 },
    ],
  },
  {
    id: 'azitromicina',
    name: 'Azitromicina',
    multiDoseCalculation: (weight) => ({
      'Día 1 (10mg/kg)': weight * 10,
      'Días 2-5 (5mg/kg)': weight * 5,
    }),
    frequency: 'Cada 24 hrs por 5 días',
    color: 'orange',
    formulations: [
      { type: 'Solución Oral', concentration: '200mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 200) * 5 },
    ],
  },
  {
    id: 'ondansetron',
    name: 'Ondansetrón',
    calculateDosePerAdmin: (weight) => Math.min(8, weight * 0.15),
    frequency: 'Cada 8 hrs',
    note: 'Dosis: 0.15 mg/kg (Máx 8mg/dosis)',
    color: 'purple',
    formulations: [
      { type: 'Ampolla IV', concentration: '4mg/2ml', unit: 'ml', calculate: (dose, weight) => (dose / 4) * 2 },
      { type: 'Comprimido', concentration: '8mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 8 },
    ],
  },
];

const colorClasses = {
  red: { bg: 'bg-red-600', text: 'text-red-800', border: 'border-red-300', headerBg: 'bg-red-100' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-800', border: 'border-blue-300', headerBg: 'bg-blue-100' },
  green: { bg: 'bg-green-600', text: 'text-green-800', border: 'border-green-300', headerBg: 'bg-green-100' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-800', border: 'border-purple-300', headerBg: 'bg-purple-100' },
  orange: { bg: 'bg-orange-600', text: 'text-orange-800', border: 'border-orange-300', headerBg: 'bg-orange-100' },
};


const DrugCard: React.FC<{ drug: Drug; weight: number }> = ({ drug, weight }) => {
  const singleDoseResults = useMemo(() => {
    if (!weight || weight <= 0 || !drug.calculateDosePerAdmin) return null;

    const dosePerAdmin = drug.calculateDosePerAdmin(weight);

    const formulations = drug.formulations.map(form => {
      const calculatedValue = form.calculate(dosePerAdmin, weight);
      const isDrops = form.unit === 'gotas';
      const resultString = isDrops ? Math.round(calculatedValue).toString() : calculatedValue.toFixed(1);

      return {
        ...form,
        result: resultString,
      };
    });

    return {
      dosePerAdmin: dosePerAdmin.toFixed(1),
      formulations,
    };
  }, [drug, weight]);

  const multiDoseResults = useMemo(() => {
    if (!weight || weight <= 0 || !drug.multiDoseCalculation) return null;
    const doses = drug.multiDoseCalculation(weight); 

    const formulations = drug.formulations.map(form => {
        const calculatedValues: Record<string, string> = {};
        for (const key in doses) {
            const doseValue = doses[key];
            const result = form.calculate(doseValue, weight);
             calculatedValues[key] = result.toFixed(1);
        }
        return {
            ...form,
            results: calculatedValues,
        };
    });

    const formattedDoses = Object.entries(doses).reduce((acc, [key, val]) => ({...acc, [key]: (val as number).toFixed(2)}), {} as Record<string, string>);

    return {
      doses: formattedDoses,
      formulations,
    };
  }, [drug, weight]);

  const colors = colorClasses[drug.color];

  return (
    <div className={`border-2 ${colors.border} rounded-lg shadow-md flex flex-col`}>
      <h3 className={`text-xl font-bold p-3 rounded-t-md text-white text-center ${colors.bg}`}>
        {drug.name}
      </h3>
      <div className="p-4 bg-white flex-grow">
        {weight > 0 && (singleDoseResults || multiDoseResults) ? (
          <div className="space-y-3 animate-fadeIn">
            {singleDoseResults && (
              <>
                <div className={`flex flex-col sm:flex-row justify-between items-baseline gap-4 p-4 rounded-lg text-white ${colors.bg}`}>
                  <div className="text-lg">
                    <span className="font-semibold">MG X DOSIS =</span>
                    <span className="font-bold text-3xl ml-2">{singleDoseResults.dosePerAdmin} mg</span>
                  </div>
                  <span className="font-semibold text-lg">{drug.frequency.toUpperCase()}</span>
                </div>
                {drug.note && <p className="text-xs text-slate-600 mt-2 text-center font-semibold">{drug.note}</p>}
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-bold text-slate-500 px-3">
                    <div className="col-span-2">Presentación</div>
                    <div className="text-center">Dosis</div>
                    <div>Unidad</div>
                  </div>
                  {singleDoseResults.formulations.map((form, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center p-3 bg-slate-50 rounded-md shadow-sm">
                      <div className="font-semibold text-slate-800">{form.type}</div>
                      <div className="text-slate-600 text-xs text-center">{form.concentration}</div>
                      <div className={`font-bold text-lg text-center ${colors.text}`}>{form.result}</div>
                      <div className="text-slate-500 text-sm whitespace-nowrap">{form.unit}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {multiDoseResults && (
              <>
                <div className={`flex flex-col gap-4 p-4 rounded-lg text-white ${colors.bg}`}>
                  <div className="space-y-2 text-center">
                    {Object.entries(multiDoseResults.doses).map(([key, value]) => (
                        <div key={key} className="text-md">
                            <span className="font-semibold">{key}:</span>
                            <span className="font-bold text-2xl ml-2">{value} mg</span>
                        </div>
                    ))}
                  </div>
                  <span className="font-semibold text-lg text-center">{drug.frequency.toUpperCase()}</span>
                </div>
                {drug.note && <p className="text-xs text-slate-600 mt-2 text-center font-semibold">{drug.note}</p>}
                <div className="mt-4 space-y-2">
                   <div className="grid grid-cols-4 gap-2 text-xs font-bold text-slate-500 px-3">
                      <div className="col-span-2">Presentación</div>
                      {Object.keys(multiDoseResults.doses).map(key => (
                         <div key={key} className="text-center">{key.split(' ')[0]} ({multiDoseResults.formulations[0].unit})</div>
                      ))}
                   </div>
                   {multiDoseResults.formulations.map((form, index) => (
                     <div key={index} className="grid grid-cols-4 gap-2 items-center p-3 bg-slate-50 rounded-md shadow-sm">
                        <div className="font-semibold text-slate-800">{form.type}</div>
                        <div className="text-slate-600 text-xs text-center">{form.concentration}</div>
                        {Object.values(form.results).map((res, i) => (
                           <div key={i} className={`font-bold text-lg text-center ${colors.text}`}>{res}</div>
                        ))}
                     </div>
                   ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Ingrese un peso para calcular.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const DosisPediatria: React.FC<{ onBackToMenu: () => void }> = ({ onBackToMenu }) => {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'meses' | 'años'>('meses');

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 text-center">CALCULADORA DE DOSIS PEDIATRÍA EDITION</h2>
      </header>
      
      <div className="space-y-6">
          <div className="p-4 bg-slate-100 rounded-lg flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                {/* Age Input */}
                <div className="flex items-center gap-4">
                    <label htmlFor="patient-age" className="text-lg font-medium text-slate-700 whitespace-nowrap">EDAD =</label>
                    <input
                        id="patient-age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="0"
                        className="w-24 px-4 py-2 text-xl font-bold text-black bg-white border-2 border-slate-400 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        min="0"
                    />
                    <div className="flex flex-col space-y-1">
                        <label className="flex items-center text-sm">
                            <input
                                type="radio"
                                name="ageUnit"
                                value="meses"
                                checked={ageUnit === 'meses'}
                                onChange={() => setAgeUnit('meses')}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                            />
                            <span className="ml-2 text-slate-700">Meses</span>
                        </label>
                        <label className="flex items-center text-sm">
                            <input
                                type="radio"
                                name="ageUnit"
                                value="años"
                                checked={ageUnit === 'años'}
                                onChange={() => setAgeUnit('años')}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                            />
                            <span className="ml-2 text-slate-700">Años</span>
                        </label>
                    </div>
                </div>

                {/* Weight Input */}
                <div className="flex items-center gap-4">
                  <label htmlFor="patient-weight" className="text-lg font-medium text-slate-700 whitespace-nowrap">PESO (KG) =</label>
                  <input
                    id="patient-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-32 px-4 py-2 text-xl font-bold text-black border-2 border-slate-400 bg-yellow-100 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    autoFocus
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>

              <div className="p-2 bg-slate-200 rounded-md text-sm font-semibold text-slate-700">
                RECORDAR: 20 GOTAS = 1 ML
              </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {drugs.map(drug => (
                  <DrugCard key={drug.id} drug={drug} weight={parseFloat(weight) || 0} />
              ))}
          </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onBackToMenu}
          className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm"
        >
          Volver al Menú
        </button>
      </div>
       <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
       `}</style>
    </div>
  );
};

export default DosisPediatria;
