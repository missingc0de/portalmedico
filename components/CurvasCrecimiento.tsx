import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CurvasCrecimientoFormData } from '../types';
import FormField from './FormField';

const chartImages = {
  femenino: [
    { title: 'Peso por Talla', src: 'https://i.ibb.co/VY4gr9Nx/growth-chart-girls-weight-length.png' },
    { title: 'Talla por Edad', src: 'https://i.ibb.co/nsct4Vw0/growth-chart-girls-length-age.png' },
    { title: 'Peso por Edad', src: 'https://i.ibb.co/fY6N0NKS/growth-chart-girls-weight-age.png' },
    { title: 'Perímetro Cefálico por Edad', src: 'https://i.ibb.co/VpDRrPdP/growth-chart-girls-head-circumference-age.png' },
  ],
  masculino: [
    { title: 'Peso por Talla', src: 'https://i.ibb.co/p6y1mg96/growth-chart-boys-weight-length.png' },
    { title: 'Talla por Edad', src: 'https://i.ibb.co/hxG1Msf0/growth-chart-boys-length-age.png' },
    { title: 'Peso por Edad', src: 'https://i.ibb.co/HD42K0H1/growth-chart-boys-weight-age.png' },
    { title: 'Perímetro Cefálico por Edad', src: 'https://i.ibb.co/pv6TMb40/growth-chart-boys-head-circumference-age.png' },
  ],
};

const generalDeviationOptions = [
  '≥ +2DE',
  'Entre +2DE y +1DE',
  'Entre +1DE y -1DE',
  'Entre -1DE y -2DE',
  '≤ -2DE',
];

const headCircumferenceDeviationOptions = [
  '≥ +2DE',
  '> -1,9 y +1,9',
  '≤ -2DE',
];


const CurvasCrecimiento: React.FC<{ onBackToMenu: () => void }> = ({ onBackToMenu }) => {
  const [sexo, setSexo] = useState('');
  const [points, setPoints] = useState<Record<string, { x: number; y: number } | null>>({});
  const [deviations, setDeviations] = useState<Record<string, string>>({});
  const [patientData, setPatientData] = useState({
    edad: '',
    peso: '',
    talla: '',
    pc: '',
  });

  const handleSexoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSexo(e.target.value);
    setPoints({});
    setDeviations({});
  };

  const handleReset = () => {
    setSexo('');
    setPoints({});
    setDeviations({});
    setPatientData({ edad: '', peso: '', talla: '', pc: '' });
  };

  const handlePatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleChartClick = (
    event: React.MouseEvent<HTMLDivElement>,
    chartSrc: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setPoints(prevPoints => ({
      ...prevPoints,
      [chartSrc]: { x: xPercent, y: yPercent },
    }));
  };

  const handleDeviationSelect = (chartTitle: string, deviation: string) => {
    setDeviations(prev => ({
      ...prev,
      [chartTitle]: deviation,
    }));
  };

  const selectedCharts = sexo ? chartImages[sexo as keyof typeof chartImages] : [];

  const nutritionalClassification = useMemo(() => {
    const ptDeviation = deviations['Peso por Talla'];
    const peDeviation = deviations['Peso por Edad'];

    if (ptDeviation === '≥ +2DE') return 'Obesidad';
    if (ptDeviation === 'Entre +2DE y +1DE') return 'Sobrepeso';
    
    // If not overweight/obese, check for underweight/normal based on P/E
    if (peDeviation === '≤ -2DE') return 'Desnutrición';
    if (peDeviation === 'Entre -1DE y -2DE') return 'Riesgo de desnutrir';
    if (peDeviation === 'Entre +1DE y -1DE') return 'Normal o eutrófico';

    return 'No clasificable';
  }, [deviations]);

  const statureClassification = useMemo(() => {
    const teDeviation = deviations['Talla por Edad'];
    
    if (teDeviation === '≤ -2DE') return 'Talla baja';
    if (teDeviation === 'Entre -1DE y -2DE') return 'Talla normal baja';
    if (teDeviation === 'Entre +1DE y -1DE') return 'Normal';
    if (teDeviation === 'Entre +2DE y +1DE') return 'Talla normal alta';
    if (teDeviation === '≥ +2DE') return 'Talla alta';
    
    return 'No clasificable';
  }, [deviations]);

  const headCircumferenceClassification = useMemo(() => {
    const pcDeviation = deviations['Perímetro Cefálico por Edad'];

    if (pcDeviation === '≤ -2DE') return 'Microcefalia (-2DE)';
    if (pcDeviation === '> -1,9 y +1,9') return 'Normal';
    if (pcDeviation === '≥ +2DE') return 'Macrocefalia (+2DE)';

    return 'No clasificable';
  }, [deviations]);


  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 space-y-6 relative">
      <style>
        {`
          @keyframes pulse-red-dot {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
          .pulse-animation {
            animation: pulse-red-dot 1s infinite ease-in-out;
          }
        `}
      </style>
      <header className="text-center">
        <h2 className="text-3xl font-semibold text-sky-700">Curvas de Crecimiento Pediátrico</h2>
        <p className="text-slate-500 mt-2">Ingrese los datos, marque un punto en cada tabla y seleccione la Desviación Estándar correspondiente.</p>
      </header>

      <div className="p-6 bg-slate-100 rounded-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Datos del Paciente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
                <label htmlFor="sexo" className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
                <select id="sexo" name="sexo" value={sexo} onChange={handleSexoChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700">
                  <option value="">Seleccione...</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                </select>
            </div>
            <FormField label="Edad (meses)" id="edad" name="edad" value={patientData.edad} onChange={handlePatientDataChange} type="number" />
            <FormField label="Peso (kg)" id="peso" name="peso" value={patientData.peso} onChange={handlePatientDataChange} type="number" step="0.1" />
            <FormField label="Talla (cm)" id="talla" name="talla" value={patientData.talla} onChange={handlePatientDataChange} type="number" />
            <FormField label="P. Cefálico (cm)" id="pc" name="pc" value={patientData.pc} onChange={handlePatientDataChange} type="number" />
        </div>
      </div>

      {sexo && (
        <>
          <div className="grid grid-cols-1 gap-y-10">
            {selectedCharts.map(chart => {
              const point = points[chart.src];
              const currentSelection = deviations[chart.title];
              
              const isHeadCircumference = chart.title.toLowerCase().includes('perímetro cefálico');
              const optionsForThisChart = isHeadCircumference ? headCircumferenceDeviationOptions : generalDeviationOptions;

              return (
                <div key={chart.src} className="w-full mx-auto">
                  <h4 className="text-lg font-semibold text-slate-700 text-center mb-3">{chart.title}</h4>
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    {/* Chart Container */}
                    <div 
                      className="relative cursor-crosshair flex-grow"
                      onClick={(e) => handleChartClick(e, chart.src)}
                      aria-label={`Gráfico de ${chart.title}. Haga clic para marcar un punto.`}
                    >
                      <img src={chart.src} alt={chart.title} className="w-full h-auto object-contain rounded-md border border-slate-300" loading="lazy" />
                      {point && (
                        <div
                          className="absolute w-2 h-2 bg-red-600 rounded-full border border-white shadow-md pointer-events-none pulse-animation"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                          }}
                          title={`Punto manual`}
                        ></div>
                      )}
                    </div>
                    {/* Container for right-side elements */}
                    <div className="flex flex-col flex-shrink-0 w-full md:w-52">
                        {/* Deviation Selector */}
                        <div className="flex flex-col space-y-2">
                          {optionsForThisChart.map(opt => (
                            <button
                              key={opt}
                              onClick={() => handleDeviationSelect(chart.title, opt)}
                              className={`w-full px-3 py-1.5 text-xs rounded-md shadow-sm transition-all duration-150 ${
                                currentSelection === opt ? 'bg-sky-600 text-white font-semibold ring-2 ring-sky-400' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                              aria-pressed={currentSelection === opt}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {/* Data Summary Box */}
                        <div className="mt-4 p-3 bg-slate-100 border border-slate-300 rounded-lg shadow-inner">
                            <h5 className="text-sm font-semibold text-slate-700 text-center mb-2">Datos Ingresados:</h5>
                            <div className="space-y-1.5 text-xs text-slate-600">
                                <p><strong>Edad:</strong> <span className="font-mono">{patientData.edad || 'N/A'}</span> m</p>
                                <p><strong>Peso:</strong> <span className="font-mono">{patientData.peso || 'N/A'}</span> kg</p>
                                <p><strong>Talla:</strong> <span className="font-mono">{patientData.talla || 'N/A'}</span> cm</p>
                                <p><strong>PC:</strong> <span className="font-mono">{patientData.pc || 'N/A'}</span> cm</p>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
             <div className="max-w-lg mx-auto p-4 bg-slate-100 rounded-lg border border-slate-200">
                <h3 className="text-xl font-semibold text-sky-700 mb-4 text-center">Cuadro Resumen de Clasificación</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm p-3 bg-white rounded-md shadow-sm">
                        <span className="font-medium text-slate-800">Calificación nutricional:</span>
                        <span className="font-semibold text-sky-600 bg-sky-100 px-3 py-1 rounded-full">{nutritionalClassification}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-white rounded-md shadow-sm">
                        <span className="font-medium text-slate-800">Calificación estatural:</span>
                        <span className="font-semibold text-sky-600 bg-sky-100 px-3 py-1 rounded-full">{statureClassification}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-white rounded-md shadow-sm">
                        <span className="font-medium text-slate-800">Evaluación del perímetro cefálico:</span>
                        <span className="font-semibold text-sky-600 bg-sky-100 px-3 py-1 rounded-full">{headCircumferenceClassification}</span>
                    </div>
                </div>
              </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-4 border-t border-slate-300">
        <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
          Volver al Menú
        </button>
        <button type="button" onClick={handleReset} className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md">
          Limpiar y Empezar de Nuevo
        </button>
      </div>
    </div>
  );
};

export default CurvasCrecimiento;
