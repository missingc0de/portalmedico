import React, { useState, useCallback, useRef, useMemo } from 'react';
import { UniversalAIClient, Type } from '../utils/aiClient';
import { getAiClient } from '../utils/aiClient';

import { canUseAI } from '../utils/aiRestrictions';
import { User } from '../types';

const SpirometryAnalyzer: React.FC<{ loggedInUser: User | null }> = ({ loggedInUser }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const dropzoneRef = useRef<HTMLLabelElement>(null);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type.startsWith('application/pdf') || selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Por favor, seleccione un archivo PDF o de imagen válido.');
        setFile(null);
      }
    }
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files ? e.target.files[0] : null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current?.classList.add('border-sky-500', 'bg-sky-100');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current?.classList.remove('border-sky-500', 'bg-sky-100');
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current?.classList.remove('border-sky-500', 'bg-sky-100');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleProcessSpirometry = async () => {
    // Check AI restrictions
    const check = canUseAI(loggedInUser);
    if (!check.allowed) {
      setError(check.reason || 'No tiene permiso para usar esta función.');
      return;
    }

    if (!file) {
      setError('No se ha seleccionado ningún archivo.');
      return;
    }
    if (!navigator.onLine) {
      setError('La función de IA requiere conexión a internet.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setInterpretation('');

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        setError('Error al leer el archivo.');
        setIsLoading(false);
        return;
      }

      try {
        const dataUrl = event.target.result as string;
        const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
        const ai = getAiClient();
        
        const filePart = { inlineData: { mimeType: file.type, data: base64Data } };

        const schema = {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              description: "Array de resultados de parámetros de espirometría.",
              items: {
                type: Type.OBJECT,
                properties: {
                  parametro: { type: Type.STRING, description: "Nombre del parámetro (ej. FVC (L))." },
                  mejorPrevia: { type: Type.STRING, description: "El valor de 'Mejor previa'." },
                  prePrev: { type: Type.STRING, description: "El valor de '% pre. prev.'." },
                  mejorPost: { type: Type.STRING, description: "El valor de 'Mejor post.'." },
                  prePostChange: { type: Type.STRING, description: "El valor de '% pre/post'." }
                },
                required: ["parametro", "mejorPrevia", "prePrev", "mejorPost", "prePostChange"]
              }
            },
            interpretation: {
              type: Type.STRING,
              description: "Un resumen breve de una a dos oraciones interpretando los resultados EN ESPAÑOL. Menciona patrones potenciales (obstructivo, restrictivo) y respuesta significativa al broncodilatador."
            }
          }
        };
        
        const prompt = `Analiza el informe de espirometría adjunto. OMITE ABSOLUTAMENTE TODOS los datos personales del paciente (nombre, ID, edad, etc.).
1. Extrae los datos de la tabla de 'Resultados'. Para cada 'Parámetro' (FVC, FEV1, etc.), extrae los siguientes valores y mapealos a las claves JSON correspondientes:
    - 'Mejor previa' -> mejorPrevia
    - '% pre. prev.' -> prePrev
    - 'Mejor post.' -> mejorPost
    - '% pre/post' -> prePostChange
    Devuelve estos datos en un array JSON bajo la clave 'results'.
2. Genera una breve interpretación de una o dos frases sobre los hallazgos (patrón y respuesta a broncodilatador) y ponla en la clave 'interpretation'.
LA INTERPRETACIÓN DEBE ESTAR OBLIGATORIAMENTE EN ESPAÑOL.`;

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
          model: 'llama-3.2-90b-vision-preview',
          contents: { parts: [filePart, textPart] },
          config: { responseMimeType: 'application/json', responseSchema: schema },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);

        if (parsedData.results && parsedData.interpretation) {
          setResults(parsedData.results);
          setInterpretation(parsedData.interpretation);
        } else {
          throw new Error("La respuesta de la IA no tiene el formato esperado.");
        }
      } catch (apiError: any) {
        console.error("Error en la API de Groq:", apiError);
        setError(apiError.message || 'Ocurrió un error al analizar el documento. Intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };
    fileReader.onerror = () => {
      setError('Error al leer el archivo.');
      setIsLoading(false);
    };
    fileReader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('Transcripción copiada al portapapeles.'));
  };

  const summaryText = useMemo(() => {
    if (results.length === 0) return '';
    let text = 'ESPIROMETRÍA:\n';
    const headers = ['Parámetro', 'Mejor Pre', '% Pred', 'Mejor Post', '% Cambio'];
    const colWidths = [17, 12, 8, 12, 10]; 
    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('| ');
    const separator = '-'.repeat(headerLine.length);
    
    text += `${separator}\n${headerLine}\n${separator}\n`;
    results.forEach(row => {
        const rowData = [
            (row.parametro || '').substring(0, 16),
            row.mejorPrevia || '',
            row.prePrev || '',
            row.mejorPost || '',
            row.prePostChange || ''
        ];
        text += `${rowData.map((d, i) => d.toString().padEnd(colWidths[i])).join('| ')}\n`;
    });
    text += `${separator}\n`;
    if (interpretation) text += `Interpretación: ${interpretation}\n`;
    return text;
  }, [results, interpretation]);

  const isDoctor = loggedInUser?.profession === 'medicina';

  return (
    <div className="w-full h-full bg-slate-50 border-2 border-slate-200 rounded-xl p-6 shadow-md flex flex-col">
      <h3 className="text-xl font-bold text-sky-800 mb-4 text-left uppercase">ANÁLISIS DE ESPIROMETRÍA</h3>
      <div className="flex flex-col gap-4 flex-grow">
        <input type="file" id="spiro-upload-main" className="hidden" accept="application/pdf,image/*" onChange={onFileInputChange} disabled={!isDoctor} />
        <label
          ref={dropzoneRef}
          htmlFor={isDoctor ? "spiro-upload-main" : ""}
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-lg h-28 transition-colors ${isDoctor ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          onDragOver={isDoctor ? handleDragOver : undefined}
          onDragLeave={isDoctor ? handleDragLeave : undefined}
          onDrop={isDoctor ? handleDrop : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-1 text-sm text-slate-600">
            {isDoctor ? (
                <span className="font-semibold text-sky-600">Cargar documento</span>
            ) : (
                <span className="font-semibold text-amber-600 uppercase tracking-widest">No disponible</span>
            )}
          </p>
        </label>
        
        {file && (
          <div className="p-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 truncate">
            <strong>Archivo:</strong> {file.name}
          </div>
        )}
        {error && <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">{error}</div>}
        
        <button
          onClick={handleProcessSpirometry}
          disabled={!file || isLoading || !isDoctor}
          className="w-full px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-300 transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analizando...</>
          ) : (isDoctor ? 'Procesar Espirometría' : 'No disponible')}
        </button>

        <div className="flex flex-col flex-grow space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
            <table className="w-full text-[10px] sm:text-xs text-left">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase">
                <tr>
                  <th className="px-2 py-2">Parámetro</th>
                  <th className="px-2 py-2 text-center">Mejor Pre</th>
                  <th className="px-2 py-2 text-center">% Pred</th>
                  <th className="px-2 py-2 text-center">Mejor Post</th>
                  <th className="px-2 py-2 text-center">% Cambio</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {results.length > 0 ? (
                  results.map((row, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="px-2 py-1.5 font-medium text-slate-900">{row.parametro}</td>
                      <td className="px-2 py-1.5 text-center text-slate-900">{row.mejorPrevia}</td>
                      <td className="px-2 py-1.5 text-center text-slate-900">{row.prePrev}</td>
                      <td className="px-2 py-1.5 text-center text-slate-900">{row.mejorPost}</td>
                      <td className="px-2 py-1.5 text-center text-slate-900">{row.prePostChange}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-4 text-slate-500 italic">Los resultados aparecerán aquí.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col h-40">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight">Transcripción</label>
                <button 
                  onClick={() => copyToClipboard(summaryText)} 
                  disabled={!summaryText || isLoading}
                  className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-200 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
                >
                  Copiar
                </button>
            </div>
            <textarea
              readOnly
              value={summaryText}
              placeholder={isLoading ? 'Generando transcripción...' : 'La transcripción aparecerá aquí...'}
              className="w-full flex-grow p-2 bg-white border border-slate-300 rounded-md shadow-inner text-[10px] font-mono text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpirometryAnalyzer;
