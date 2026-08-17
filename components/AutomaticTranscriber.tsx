import React, { useState } from 'react';

const promptText = `Analiza los resultados de exámenes de laboratorio del documento adjunto y genera un resumen limpio para una ficha clínica. Sigue estas reglas ESTRICTAMENTE:
1. EXTRAE la fecha del examen del documento. Formatea esto como la primera línea de la respuesta: ÚLTIMO LABORATORIO DD/MM/AAAA. Si en el documento aparecen múltiples fechas, respeta la más antigua, o la que se aclare como la fecha en la que se tomó la muestra.
2. OMITE CUALQUER DATO DEL PACIENTE (nombre, RUT, edad, etc.).
3. Para cada examen, formatea la salida en una nueva línea como: NOMBRE_EXAMEN_EN_MAYUSCULAS: [SÍMBOLO] VALOR UNIDADES.
4. Usa abreviaciones comunes para los nombres de los exámenes cuando sea posible (ej. CREATI para Creatinina).
5. OMITE POR COMPLETO los rangos de referencia. No los incluyas en la salida.
6. NO uses viñetas ni guiones.
7. Compara cada valor con su rango de referencia. Si el valor está POR ENCIMA del rango normal, precede el valor con el símbolo ▲. Si está POR DEBAJO del rango normal, precede el valor con el símbolo ▼. Si el valor está dentro del rango normal, no agregues ningún símbolo.
8. OMITE CUALQUIER TÍTULO DE CATEGORÍA de examen (como "EXÁMENES BIOQUÍMICOS", "HEMOGRAMA", etc.). Solo incluye las líneas de resultados individuales.

Ejemplo de formato de salida deseado:
ÚLTIMO LABORATORIO 01/01/2023
CREATI: 0.72 mg/dL
VFG: 104.2 ml/min/1.73m2
GLICEMIA: ▲103 mg/dL
POTASIO: ▼3.2 mEq/L`;

interface AutomaticTranscriberProps {
  loggedInUser?: { fullName: string; profession: string } | null;
  profilePictureUrl?: string;
  profileName?: string;
}

const AutomaticTranscriber: React.FC<AutomaticTranscriberProps> = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
      {/* Encabezado con línea inferior */}
      <div className="border-b border-slate-100 pb-1.5 mb-2 w-full flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transcriptor automático de exámenes</h3>
      </div>

      {/* Guía Desplegada */}
      <div className="text-slate-700 text-xs space-y-2">
        <p className="font-semibold text-slate-800 text-[11.5px]">Pasos para transcribir exámenes rápidamente:</p>
        <div className="space-y-1.5 pl-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sky-600 shrink-0 text-xs">1.</span>
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              <span className="text-[11.5px] truncate">Entra a Copilot de Microsoft.</span>
              <a
                href="https://copilot.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-md text-[10.5px] border border-sky-100 transition-colors cursor-pointer shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir Copilot
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sky-600 shrink-0 text-xs">2.</span>
            <span className="text-[11.5px]">Añade o arrastra el PDF/imagen del examen a la conversación.</span>
          </div>
          
          <div className="flex items-start gap-1.5">
            <span className="font-bold text-sky-600 shrink-0 text-xs mt-0.5">3.</span>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px]">Copia y pega el prompt de transcriptor en el chat:</span>
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-bold rounded-md text-[10.5px] border transition-colors cursor-pointer shrink-0 ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-sky-600 hover:bg-sky-700 text-white border-transparent'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  {copied ? '¡Copiado!' : 'Copiar Prompt'}
                </button>
              </div>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-2 max-h-16 overflow-y-auto font-mono text-[10px] text-slate-600 leading-snug whitespace-pre-wrap select-all shadow-inner custom-scrollbar">
                {promptText}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sky-600 shrink-0 text-xs">4.</span>
            <span className="text-[11.5px]">Envía el mensaje en Copilot y espera el resultado.</span>
          </div>
          
          <div className="flex items-start gap-1.5">
            <span className="font-bold text-sky-600 shrink-0 text-xs mt-0.5">5.</span>
            <span className="font-medium text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-150 leading-tight text-[11px] flex-1">
              Copia el resultado de Copilot y pégalo directamente en la ficha clínica del paciente.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticTranscriber;
