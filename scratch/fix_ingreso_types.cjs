
const fs = require("fs");
const typesPath = "types.ts";
let types = fs.readFileSync(typesPath, "utf-8");

const searchStr = "export interface FichaIngresoEcicepFormData {";
const startIndex = types.indexOf(searchStr);
if (startIndex !== -1 && !types.substring(startIndex, startIndex + 500).includes("borgScaleResult?: string;")) {
  const insertStr = "    borgScaleResult?: string;\n";
  types = types.substring(0, startIndex + searchStr.length + 1) + insertStr + types.substring(startIndex + searchStr.length + 1);
}

fs.writeFileSync(typesPath, types, "utf-8");
console.log("Ingreso types fixed");

