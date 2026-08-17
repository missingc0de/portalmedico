
const fs = require("fs");

const ingresoPath = "components/FichaIngresoEcicep.tsx";
const controlPath = "components/FichaControlEcicepNuevo.tsx";

let ingreso = fs.readFileSync(ingresoPath, "utf-8");
let control = fs.readFileSync(controlPath, "utf-8");

function extractCode(content, startRegex, endRegex) {
  const matchStart = content.match(startRegex);
  if (!matchStart) throw new Error("Start not found for " + startRegex);
  const startIndex = matchStart.index;
  const contentFromStart = content.substring(startIndex);
  const matchEnd = contentFromStart.match(endRegex);
  if (!matchEnd) throw new Error("End not found for " + endRegex);
  return content.substring(startIndex, startIndex + matchEnd.index + matchEnd[0].length);
}

const empamBlock = extractCode(ingreso, /const empamSmartOptions: SmartAtencionOption\[\] = \[/, /\];/);
const fondoOjoBlock = extractCode(ingreso, /const fondoOjoSmartOptions: SmartAtencionOption\[\] = \[/, /\];/);
const podologoBlock = extractCode(ingreso, /const podologoSmartOptions: SmartAtencionOption\[\] = \[/, /\];/);
const evaluacionPieBlock = extractCode(ingreso, /const evaluacionPieSmartOptions: SmartAtencionOption\[\] = \[/, /\];/);
const planCheckboxItemsEcicepConfigBlock = extractCode(ingreso, /const planCheckboxItemsEcicepConfig: PlanCheckboxEcicepConfig\[\] = \[/, /\];/);

let pciFix = planCheckboxItemsEcicepConfigBlock.replace(/FichaIngresoEcicepFormData/g, "FichaControlEcicepFormData");

const interfaceBlock = `
interface PlanCheckboxEcicepConfig {
  key: keyof FichaControlEcicepFormData;
  label: string;
  textPrefix: string;
  detailKey?: keyof FichaControlEcicepFormData;
  detailPlaceholder?: string;
  textSuffix?: string;
}
`;

const constantsBlock = `\n${empamBlock}\n\n${fondoOjoBlock}\n\n${podologoBlock}\n\n${evaluacionPieBlock}\n${interfaceBlock}\n${pciFix}\n`;

const importsToAdd = `import SmartAtencionVigenteInput, { SmartAtencionOption, stripStatusBracket } from "./SmartAtencionVigenteInput";\nimport SmartAntecedentesTextarea from "./SmartAntecedentesTextarea";\n`;

const injectIndexImports = control.indexOf("const initialIndicaciones");
control = control.substring(0, injectIndexImports) + importsToAdd + constantsBlock + "\n" + control.substring(injectIndexImports);

fs.writeFileSync(controlPath, control, "utf-8");
console.log("Imports and constants inserted");

