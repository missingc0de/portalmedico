
const fs = require("fs");

function fixFile(file) {
  let content = fs.readFileSync(file, "utf-8");
  
  // Cut everything from `return (`
  const returnIndex = content.indexOf("    return (");
  if (returnIndex === -1) return;
  
  const beforeReturn = content.substring(0, returnIndex);
  
  // We know the structure we want. Let us extract the form content, the right col content, the action bar, and the modals.
  
  // 1. Extract form content
  const formContentRegex = /<form[^>]*>([\s\S]*?)<\/form>/;
  const formMatch = content.match(formContentRegex);
  const formContent = formMatch ? formMatch[0] : "";
  
  // 2. Extract right column textareas
  const rightColRegex = /<div className="flex-grow w-full gap-4 flex flex-col min-h-0">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
  const rightColMatch = content.match(rightColRegex);
  // Actually, let us just extract the three textareas containers.
  const anamnesisRegex = /<div className="flex-1 flex flex-col min-h-0">[\s\S]*?<\/textarea>\s*<\/div>/;
  const anamMatch = content.match(anamnesisRegex);
  
  const expRegex = /<div>\s*<div className="flex justify-between items-center mb-1">\s*<label[^>]*>Exploracin<\/label>[\s\S]*?<\/textarea>\s*<\/div>/;
  const expMatch = content.match(expRegex);
  
  const actRegex = /<div>\s*<div className="flex justify-between items-center mb-1">\s*<label[^>]*>Actuacin<\/label>[\s\S]*?<\/textarea>\s*<\/div>/;
  const actMatch = content.match(actRegex);
  
  const rightColContent = (anamMatch ? anamMatch[0] : "") + "\n" + (expMatch ? expMatch[0] : "") + "\n" + (actMatch ? actMatch[0] : "");
  
  // For 6Anos it has "Resumen" text area
  const resumenRegex = /<div className="flex-1 flex flex-col min-h-0">[\s\S]*?<label[^>]*>Resumen<\/label>[\s\S]*?<\/textarea>\s*<\/div>/;
  const resMatch = content.match(resumenRegex);
  let finalRightCol = rightColContent;
  if (!rightColContent.trim() && resMatch) finalRightCol = resMatch[0];

  // 3. Extract action bar
  const actionBarRegex = /<div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-6 rounded-xl shadow-sm">([\s\S]*?)<\/div>/;
  const actionBarMatch = content.match(actionBarRegex);
  const actionBar = actionBarMatch ? actionBarMatch[0] : "";
  
  // 4. Extract Modals
  const modalsRegex = /<CurvasCrecimientoModal[\s\S]*?edadMeses=\{[^\}]+\}\s*\/>/;
  let modalsMatch = content.match(modalsRegex);
  let modals = modalsMatch ? modalsMatch[0] : "";
  
  if (!modalsMatch) {
      // 6Anos only has CurvasCrecimientoModal maybe?
      const curRegex = /<CurvasCrecimientoModal[\s\S]*?initialData=\{[\s\S]*?\}\s*\/>/;
      const curMatch = content.match(curRegex);
      modals = curMatch ? curMatch[0] : "";
  }

  // Construct new return block
  const newReturn = `    return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">
            {/* Formulario */}
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              \${formContent}
              
              \${actionBar}
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
                    <div className="border-b border-slate-150 pb-2 mb-3 w-full flex-shrink-0">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen Ficha Clínica</h3>
                    </div>
                    <div className="flex-grow w-full gap-4 flex flex-col min-h-0">
                        \${finalRightCol}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      \${modals}
    </div>
  );
};

export default \${file.split("/")[1].replace(".tsx", "")};
`;

  fs.writeFileSync(file, beforeReturn + newReturn, "utf-8");
  console.log("Rewrote " + file);
}

fixFile("components/FichaControlNinoSano1Mes.tsx");
fixFile("components/FichaControlNinoSano3Mes.tsx");
fixFile("components/FichaControlNinoSano6Anos.tsx");

