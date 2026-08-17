
const fs = require("fs");

function fixButtons(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace buttons
  // Find the action buttons container and replace it entirely
  const startStr = "<div className=\"flex items-center justify-end gap-2 pt-0.5 shrink-0\">";
  const endStr = "{status === FormStatus.Error && (";
  const startIndex = content.indexOf(startStr);
  const endIndex = content.indexOf(endStr);
  if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find button block in " + filePath);
    return;
  }

  const newButtons = `
          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-0.5 shrink-0 mb-2">
            <button
              type="button"
              onClick={handleNewDocument}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              LIMPIAR FORMULARIO
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === FormStatus.Generating || !isFormValid}
              className={\`px-3 py-1.5 font-medium text-[11px] uppercase tracking-tight rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 \${
                isFormValid ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"
              } \${status === FormStatus.Generating ? "opacity-70 cursor-wait" : ""}\`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              {status === FormStatus.Generating ? "GENERANDO..." : filePath.includes("Certificado") ? "EMITIR CERTIFICADO" : "EMITIR RECETA"}
            </button>
          </div>
          `;

  content = content.substring(0, startIndex - 30) + newButtons + content.substring(endIndex);

  // add import if needed
  if (!content.includes("lucide-react")) {
    content = content.replace("import React,", "import React, { useState } from 'react';\nimport { Trash2, FileText } from 'lucide-react';\n//");
  } else {
     // Ensure Trash2 and FileText are imported
     if(!content.includes("Trash2")) {
        content = content.replace(/import \{([^}]+)\} from .lucide-react./, (match, p1) => {
           return `import { \${p1}, Trash2, FileText } from "lucide-react"`;
        });
     }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Fixed buttons in " + filePath);
}

fixButtons("components/CertificadoMedicoForm.tsx");
fixButtons("components/RecetaMedicaForm.tsx");

