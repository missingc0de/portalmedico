
const fs = require("fs");
const typesPath = "types.ts";
let types = fs.readFileSync(typesPath, "utf-8");

// Remove my manual inserts
types = types.replace(/    borgScaleResult\?: string; \/\* ONLY FOR CONTROL \*\/\n/g, "");

// Add properly to FichaControlEcicepFormData
const searchStr = "export interface FichaControlEcicepFormData {";
const startIndex = types.indexOf(searchStr);
if (startIndex !== -1) {
  const insertStr = "    borgScaleResult?: string;\n";
  types = types.substring(0, startIndex + searchStr.length + 1) + insertStr + types.substring(startIndex + searchStr.length + 1);
}

fs.writeFileSync(typesPath, types, "utf-8");
console.log("Types cleaned and fixed");

