
const fs = require("fs");
const typesPath = "types.ts";
let types = fs.readFileSync(typesPath, "utf-8");

if (!types.includes("borgScaleResult?: string; // NUEVO CAMPO PARA BORG EN CONTROL")) {
  types = types.replace("talla: string;", "talla: string;\n    borgScaleResult?: string; // NUEVO CAMPO PARA BORG EN CONTROL");
  fs.writeFileSync(typesPath, types, "utf-8");
}
console.log("Fixed types.ts");

