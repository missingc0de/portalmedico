const fs = require("fs");

let code = fs.readFileSync("components/FichaControlNinoSano6Anos.tsx", "utf-8");

// replace generatedText state with the three states
code = code.replace(
    "const [generatedText, setGeneratedText] = useState('');",
    "const [anamnesisText, setAnamnesisText] = useState('');\n    const [exploracionText, setExploracionText] = useState('');\n    const [actuacionText, setActuacionText] = useState('');"
);

// replace generateSummary function
const originalSummaryFunc = `    const generateSummary = useCallback(() => {
        let summary = \`CONTROL NIÑO SANO 6 AÑOS:\\n\\n\`;
        formSections.forEach(section => {
            summary += \`\${section.title.toUpperCase()}:\\n\`;
            section.fields.forEach(field => {
                const value = formData[field.name as keyof FichaControlNinoSano6AnosFormData] as string;
                if (value && value.trim()) {
                    summary += \`- \${field.label}: \${value}\\n\`;
                }
            });
            summary += \`\\n\`;
        });
        return summary.trim();
    }, [formData]);`;

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

code = code.replace(originalSummaryFunc, newSummaryFunc);

// replace useEffect setting generatedText
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

// replace handleCopyToClipboard to copy general or allow copy by parameter?
// Let us rewrite handleCopyToClipboard to take text and title
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

// replace right column layout
const oldRightCol = `            {/* Columna Derecha: Vista Previa */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
                        <div className="border-b border-slate-150 pb-2 mb-3 w-full flex-shrink-0">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen Ficha Clínica</h3>
                        </div>
                        <div className="flex-grow w-full gap-4 flex flex-col min-h-0">
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-1 flex-shrink-0">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen</label>
                                    <button onClick={handleCopyToClipboard} className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-200 rounded uppercase hover:bg-slate-300">Copiar</button>
                                </div>
                                <textarea
                                    value={generatedText}
                                    readOnly
                                    className="flex-1 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm custom-scrollbar text-[11px] text-black focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                                    aria-label="Resumen de la ficha clínica"
                                />
                            </div>
                        </div>
                    </div>
                </div>`;

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
                </div>
            </div>`;

code = code.replace(oldRightCol, newRightCol);

// Make sure to add loggedInUser to the props deconstruction if missing
if (!code.includes("const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu, loggedInUser }) =>")) {
    code = code.replace(
        "const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu }) =>",
        "const FichaControlNinoSano6Anos: React.FC<FichaControlNinoSano6AnosProps> = ({ onBackToMenu, loggedInUser }) =>"
    );
    // update interface as well
    code = code.replace(
        "interface FichaControlNinoSano6AnosProps {\n    onBackToMenu: () => void;\n}",
        "interface FichaControlNinoSano6AnosProps {\n    onBackToMenu: () => void;\n    loggedInUser: User | null;\n}"
    );
    // add import of User if missing
    if (!code.includes("User")) {
        code = code.replace(
            "import { FichaControlNinoSano6AnosFormData } from '../types';",
            "import { FichaControlNinoSano6AnosFormData, User } from '../types';"
        );
    }
}

fs.writeFileSync("components/FichaControlNinoSano6Anos.tsx", code, "utf-8");
console.log("6Anos split finished");
