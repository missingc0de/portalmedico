import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

const generalDeviationOptions = ['≥ +2DE', 'Entre +2DE y +1DE', 'Entre +1DE y -1DE', 'Entre -1DE y -2DE', '≤ -2DE'];
const headCircumferenceDeviationOptions = ['≥ +2DE', '> -1,9 y +1,9', '≤ -2DE'];

interface CurvasCrecimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResults: (results: { nutricional: string; estatural: string; perimetro: string; }) => void;
  initialData: {
    sexo: 'femenino' | 'masculino' | '';
    edad: string;
    peso: string;
    talla: string;
    pc: string;
  };
}

const CurvasCrecimientoModal: React.FC<CurvasCrecimientoModalProps> = ({ isOpen, onClose, onResults, initialData }) => {
  const [sexo, setSexo] = useState(initialData.sexo);
  const [points, setPoints] = useState<Record<string, { x: number; y: number } | null>>({});
  const [deviations, setDeviations] = useState<Record<string, string>>({});
  const [patientData, setPatientData] = useState({
    edad: initialData.edad,
    peso: initialData.peso,
    talla: initialData.talla,
    pc: initialData.pc,
  });

  useEffect(() => {
    if (isOpen) {
      setSexo(initialData.sexo);
      setPatientData({
        edad: initialData.edad,
        peso: initialData.peso,
        talla: initialData.talla,
        pc: initialData.pc,
      });
      // Reset points and deviations when modal is opened with new data
      setPoints({});
      setDeviations({});
    }
  }, [isOpen, initialData]);
  
  const handleChartClick = (event: React.MouseEvent<HTMLDivElement>, chartSrc: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
    setPoints(prev => ({ ...prev, [chartSrc]: { x: xPercent, y: yPercent } }));
  };

  const handleDeviationSelect = (chartTitle: string, deviation: string) => {
    setDeviations(prev => ({ ...prev, [chartTitle]: deviation }));
  };

  const nutritionalClassification = useMemo(() => {
    const ptDeviation = deviations['Peso por Talla'];
    const peDeviation = deviations['Peso por Edad'];
    if (ptDeviation === '≥ +2DE') return 'Obesidad';
    if (ptDeviation === 'Entre +2DE y +1DE') return 'Sobrepeso';
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

  const handleSaveResults = () => {
    onResults({
      nutricional: nutritionalClassification,
      estatural: statureClassification,
      perimetro: headCircumferenceClassification,
    });
    onClose();
  };

  if (!isOpen) return null;
  const selectedCharts = sexo ? chartImages[sexo] : [];
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog" aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-semibold text-sky-700">Calculadora Curvas de Crecimiento</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          {!sexo ? (
            <div className="flex items-center justify-center h-full"><p className="text-slate-500">Por favor, seleccione el sexo en la ficha de control para ver las curvas.</p></div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-y-8">
                {selectedCharts.map(chart => (
                  <div key={chart.src} className="w-full">
                    <h4 className="text-lg font-semibold text-slate-700 text-center mb-3">{chart.title}</h4>
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="relative cursor-crosshair flex-grow" onClick={(e) => handleChartClick(e, chart.src)}>
                        <img src={chart.src} alt={chart.title} className="w-full h-auto object-contain rounded-md border border-slate-300" loading="lazy" />
                        {points[chart.src] && (
                           <div
                             className="absolute w-2 h-2 bg-red-600 rounded-full border border-white shadow-md pointer-events-none"
                             style={{ left: `${points[chart.src]!.x}%`, top: `${points[chart.src]!.y}%`, transform: 'translate(-50%, -50%)' }}
                           ></div>
                        )}
                      </div>
                      <div className="flex flex-col flex-shrink-0 w-full md:w-52 space-y-2">
                        {(chart.title.toLowerCase().includes('perímetro cefálico') ? headCircumferenceDeviationOptions : generalDeviationOptions).map(opt => (
                           <button
                             key={opt}
                             onClick={() => handleDeviationSelect(chart.title, opt)}
                             className={`w-full px-3 py-1.5 text-xs rounded-md shadow-sm transition-all duration-150 ${
                               deviations[chart.title] === opt ? 'bg-sky-600 text-white font-semibold ring-2 ring-sky-400' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                             }`}
                           >
                             {opt}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="max-w-lg mx-auto p-4 bg-slate-100 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Resultados de Clasificación</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"><span>Calificación nutricional:</span><span className="font-semibold text-sky-600">{nutritionalClassification}</span></div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"><span>Calificación estatural:</span><span className="font-semibold text-sky-600">{statureClassification}</span></div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"><span>Evaluación del perímetro cefálico:</span><span className="font-semibold text-sky-600">{headCircumferenceClassification}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <footer className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
                Cancelar
            </button>
            <button onClick={handleSaveResults} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md">
                Guardar Resultados en Ficha
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CurvasCrecimientoModal;

