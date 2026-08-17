
const fs = require("fs");
const typesPath = "types.ts";
let types = fs.readFileSync(typesPath, "utf-8");

types = types.replace(/talla: string;\n    borgScaleResult\?: string; \/\/ NUEVO CAMPO PARA BORG EN CONTROL/g, "talla: string;");
types = types.replace(/borgScaleResult\?: string; \/\/ NUEVO CAMPO PARA BORG/g, "");

// Now add borgScaleResult precisely into FichaControlEcicepFormData
// I will find "export interface FichaControlEcicepFormData" and then add it inside that block, perhaps right after "estratificacion: string;"
if (!types.includes("borgScaleResult?: string; /* ONLY FOR CONTROL */")) {
  types = types.replace("estratificacion: string;", "estratificacion: string;\n    borgScaleResult?: string; /* ONLY FOR CONTROL */");
}

fs.writeFileSync(typesPath, types, "utf-8");
console.log("Fixed types manually");

