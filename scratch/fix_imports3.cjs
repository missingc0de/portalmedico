
const fs = require("fs");

let cert = fs.readFileSync("components/CertificadoMedicoForm.tsx", "utf-8");
cert = cert.replace(
  "import React, { useState, useCallback, useEffect } from 'react';",
  "import React, { useState, useCallback, useEffect } from 'react';\nimport { CertificadoMedicoFormData, FormStatus, User } from '../types';"
);
fs.writeFileSync("components/CertificadoMedicoForm.tsx", cert, "utf-8");

let rec = fs.readFileSync("components/RecetaMedicaForm.tsx", "utf-8");
rec = rec.replace(
  " { useState, useCallback, useEffect } from 'react';",
  "import { Trash2, FileText } from 'lucide-react';\nimport React, { useState, useCallback, useEffect } from 'react';"
);
fs.writeFileSync("components/RecetaMedicaForm.tsx", rec, "utf-8");
console.log("Fixed missing imports");

