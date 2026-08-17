
const fs = require("fs");
let content = fs.readFileSync("components/CertificadoMedicoForm.tsx", "utf-8");
content = content.replace("import { CertificadoMedicoFormData, FormStatus, User } from '../types';", "import { RecetaMedicaFormData, FormStatus, User } from '../types';");
fs.writeFileSync("components/CertificadoMedicoForm.tsx", content, "utf-8");
console.log("Fixed cert types");

