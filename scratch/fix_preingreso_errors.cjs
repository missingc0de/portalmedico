
const fs = require("fs");

let pre = fs.readFileSync("components/FichaPreingresoEcicep.tsx", "utf-8");

// Fix states
if (!pre.includes("const [isPhq9Completed")) {
  pre = pre.replace(
    "const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);",
    "const [isRiskCalculatorOpen, setIsRiskCalculatorOpen] = useState(false);\n  const [isPhq9Completed, setIsPhq9Completed] = useState(false);"
  );
}

// Rename back to the original Preingreso fields for the JSX
pre = pre.replace(/name="antecedentesFamiliaresRelevantes"/g, "name=\"antecedentesFamiliares\"");
pre = pre.replace(/value=\{formData\.antecedentesFamiliaresRelevantes/g, "value={formData.antecedentesFamiliares");
pre = pre.replace(/handleInputChange\('antecedentesFamiliaresRelevantes'/g, "handleInputChange('antecedentesFamiliares'");

pre = pre.replace(/name="percepcionSituacionEconomica"/g, "name=\"percepcionEconomica\"");
pre = pre.replace(/value=\{formData\.percepcionSituacionEconomica/g, "value={formData.percepcionEconomica");
pre = pre.replace(/handleInputChange\('percepcionSituacionEconomica'/g, "handleInputChange('percepcionEconomica'");

fs.writeFileSync("components/FichaPreingresoEcicep.tsx", pre, "utf-8");
console.log("Fixed Preingreso JSX");

let types = fs.readFileSync("types.ts", "utf-8");
if (!types.includes("estadoCivilHijos?: string;") && types.includes("export interface FichaPreingresoEcicepFormData")) {
  types = types.replace(
    "export interface FichaPreingresoEcicepFormData {",
    "export interface FichaPreingresoEcicepFormData {\n    estadoCivilHijos?: string;\n    factoresProtectores?: string;"
  );
  fs.writeFileSync("types.ts", types, "utf-8");
  console.log("Fixed types");
}

