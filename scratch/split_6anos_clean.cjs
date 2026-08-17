const fs = require("fs");

let code = fs.readFileSync("components/FichaControlNinoSano6Anos.tsx", "utf-8");

// 1. Add User import if missing
code = code.replace(
  "import { FichaControlNinoSano6AnosFormData } from '../types';",
  "import { FichaControlNinoSano6AnosFormData, User } from '../types';"
);

// 2. Update props interface
code = code.replace(
  "interface FichaControlNinoSano6AnosProps {\n    onBackToMenu: () => void;\n}",
  "interface FichaControlNinoSano6AnosProps {\n    onBackToMenu: () => void;\n    loggedInUser: User | null;\n}"
);

// 3. Update component signature
code = code.replace(
  "const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu }) => {",
  "const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu, loggedInUser }) => {"
);

// 4. Update state variables (replace generatedText)
code = code.replace(
  "const [generatedText, setGeneratedText] = useState('');",
  "const [anamnesisText, setAnamnesisText] = useState('');\n    const [exploracionText, setExploracionText] = useState('');\n    const [actuacionText, setActuacionText] = useState('');"
);

// 5. Replace generateSummary with generateSummaryParts
const genStart = code.indexOf("    const generateSummary = useCallback(() => {");
const genEnd = code.indexOf("    }, [formData]);", genStart) + "    }, [formData]);".length;

if (genStart !== -1 && genEnd !== -1) {
  const newSummaryFunc = `    const generateSummaryParts = useCallback(() => {
        const todayStr = new Date().toLocaleDateString('es-ES');
        let anamnesis = \`FICHA CONTROL NIÑO SANO 6 AÑOS\\n---------------------------------------\\nFECHA INGRESO: \${todayStr}\\nPROFESIONAL RESPONSABLE: \${loggedInUser?.fullName || ''}\\nMOTIVO DE CONSULTA: CONTROL NIÑO SANO 6 AÑOS\\n---------------------------------------\\n\\n\`;
        let exploracion = \`\`;
        let actuacion = \`\`;

        const processSection = (title: string) => {
            const section = formSections.find(s => s.title === title);
            if (!section) return '';
            let sectionText = \`\${section.title.toUpperCase()}:\\n\`;
            let hasContent = false;
            section.fields.forEach(field => {
                const value = formData[field.name as keyof FichaControlNinoSano6AnosFormData] as string;
                if (value && value.trim()) {
                    sectionText += \`- \${field.label}: \${value}\\n\`;
                    hasContent = true;
                }
            });
            return hasContent ? \`\${sectionText}\\n\` : '';
        };

        // ANAMNESIS
        anamnesis += processSection("Antecedentes");
        anamnesis += processSection("Nutrición");
        anamnesis += processSection("Higiene y Actividad Física");
        anamnesis += processSection("Patrones de Eliminación");
        anamnesis += processSection("Sueño");
        anamnesis += processSection("Contexto Familiar y Social");
        anamnesis += processSection("Conducta");

        // EXPLORACIÓN
        exploracion += processSection("Examen Físico");

        // ACTUACIÓN
        actuacion += processSection("Diagnósticos e Indicaciones");

        return {
            anamnesis: anamnesis.trim(),
            exploracion: exploracion.trim(),
            actuacion: actuacion.trim()
        };
    }, [formData, loggedInUser]);`;

  code = code.substring(0, genStart) + newSummaryFunc + code.substring(genEnd);
}

// 6. Replace the useEffect for generatedText
code = code.replace(
  `    useEffect(() => {
        setGeneratedText(generateSummary());
    }, [formData, generateSummary]);`,
  `    useEffect(() => {
        const { anamnesis, exploracion, actuacion } = generateSummaryParts();
        setAnamnesisText(anamnesis);
        setExploracionText(exploracion);
        setActuacionText(actuacion);
    }, [formData, generateSummaryParts]);`
);

// 7. Update handleCopyToClipboard and handleCopyToClipboard usages
code = code.replace(
  `    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedText).then(() => {
            alert('Resumen copiado al portapapeles.');
        }).catch(err => {
            console.error('Error al copiar texto: ', err);
            alert('Error al copiar texto.');
        });
    };`,
  `    const handleCopyToClipboard = (text: string, title: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert(\`'\${title}' copiado al portapapeles.\`);
        }).catch(err => {
            console.error('Error al copiar texto: ', err);
            alert('Error al copiar texto.');
        });
    };`
);

// 8. Replace Right Column Layout
const rightColStartStr = `            {/* Columna Derecha: Vista Previa */}`;
const rightColEndStr = `            </div>
        </div>
    );
};`;

const rColStart = code.indexOf(rightColStartStr);
const rColEnd = code.indexOf(rightColEndStr, rColStart);

if (rColStart !== -1 && rColEnd !== -1) {
  const newRightCol = `            {/* Columna Derecha: Vista Previa */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
                    <div className="border-b border-slate-150 pb-2 mb-3 w-full flex-shrink-0">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen Ficha Clínica</h3>
                    </div>
                    <div className="flex-grow w-full gap-4 flex flex-col min-h-0">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-1 flex-shrink-0">
                                <label className="block text-xs font-semibold text-slate-800">ANAMNESIS</label>
                                <button onClick={() => handleCopyToClipboard(anamnesisText, 'Anamnesis')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea
                                value={anamnesisText}
                                onChange={(e) => setAnamnesisText(e.target.value)}
                                className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-1 flex-shrink-0">
                                <label className="block text-xs font-semibold text-slate-800">EXPLORACIÓN</label>
                                <button onClick={() => handleCopyToClipboard(exploracionText, 'Exploración')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea
                                value={exploracionText}
                                onChange={(e) => setExploracionText(e.target.value)}
                                className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                            />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-1 flex-shrink-0">
                                <label className="block text-xs font-semibold text-slate-800">ACTUACIÓN</label>
                                <button onClick={() => handleCopyToClipboard(actuacionText, 'Actuación')} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                            </div>
                            <textarea
                                value={actuacionText}
                                onChange={(e) => setActuacionText(e.target.value)}
                                className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-slate-800 font-mono outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 resize-none"
                            />
                        </div>
                    </div>
                </div>`;
  
  code = code.substring(0, rColStart) + newRightCol + code.substring(rColEnd);
}

// 9. Fix outer wrappers inside FichaControlNinoSano6Anos.tsx
if (code.includes('<div className="w-full relative">')) {
  code = code.replace(
    /<div className="w-full relative">([\s\S]*?)<form onSubmit=\{\(e\) => e.preventDefault\(\)\} className="flex flex-col gap-6">/,
    `<div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">`
  );
}

code = code.replace(/<section key=\{section\.title\} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">/g, `<section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">`);

// Replace form/div closures
code = code.replace(
  `                    </form>
                </div>`,
  `              </form>
            </div>`
);

// Replace final page closures
code = code.replace(
  `        </div>
        </>
    );
};`,
  `          </div>
        </div>
      </div>
    </div>
  );
};`
);

fs.writeFileSync("components/FichaControlNinoSano6Anos.tsx", code, "utf-8");
console.log("6Anos split clean finished");
