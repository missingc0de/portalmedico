
const fs = require("fs");

function fix(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Fix react import
  content = content.replace("import React, { useState } from 'react';\\nimport { Trash2, FileText } from 'lucide-react';\\n//", "");
  content = content.replace(/import React, \{ useState \} from .react.;\nimport \{ Trash2, FileText \} from .lucide-react.;\n\/\//, "");

  if (!content.includes("Trash2")) {
      content = content.replace("import React,", "import { Trash2, FileText } from 'lucide-react';\nimport React,");
  }

  content = content.replace(/filePath\.includes\("Certificado"\) \? "EMITIR CERTIFICADO" : "EMITIR RECETA"/, filePath.includes("Certificado") ? `"EMITIR CERTIFICADO"` : `"EMITIR RECETA"`);

  fs.writeFileSync(filePath, content, "utf-8");
}

fix("components/CertificadoMedicoForm.tsx");
fix("components/RecetaMedicaForm.tsx");

