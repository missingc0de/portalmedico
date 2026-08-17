
const fs = require("fs");

const ingresoPath = "components/FichaIngresoEcicep.tsx";
const controlPath = "components/FichaControlEcicepNuevo.tsx";

let ingreso = fs.readFileSync(ingresoPath, "utf-8");
let control = fs.readFileSync(controlPath, "utf-8");

function extractBlock(content, startStr, endStr) {
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) throw new Error("Start not found: " + startStr);
  const endIndex = content.indexOf(endStr, startIndex);
  if (endIndex === -1) throw new Error("End not found: " + endStr);
  return content.substring(startIndex, endIndex);
}

const atenciones = extractBlock(ingreso, "<section id=\"sec-atenciones\"", "<section id=\"sec-gineco\"");
const estudios = extractBlock(ingreso, "<section id=\"sec-estudios\"", "<section id=\"sec-examen-fisico\"");
const examen = extractBlock(ingreso, "<section id=\"sec-examen-fisico\"", "<section id=\"sec-valoracion\"");
const valoracion = extractBlock(ingreso, "<section id=\"sec-valoracion\"", "<section id=\"sec-pci\"");
const pci = extractBlock(ingreso, "<section id=\"sec-pci\"", "<section id=\"sec-proximo-control\"");
const proximo = extractBlock(ingreso, "<section id=\"sec-proximo-control\"", "<section id=\"sec-indicaciones\"");
const indicaciones = extractBlock(ingreso, "<section id=\"sec-indicaciones\"", "</form>");

let atencionesAdapted = atenciones.replace(/id="sec-atenciones"/, `id="sec-atenciones-vigentes"`);
let estudiosAdapted = estudios.replace(/id="sec-estudios"/, `id="sec-estudios-control"`)
  .replace(/laboratorioFecha/g, "fechaExamenLaboratorio")
  .replace(/laboratorioResultados/g, "resultadosLaboratorio")
  .replace(/ekgResultado/g, "ekgResultados");
let examenAdapted = examen.replace(/id="sec-examen-fisico"/, `id="sec-examen-fisico-control"`)
  .replace(/efGeneralSegmentario/g, "examenFisicoGeneralSegmentario");
let valoracionAdapted = valoracion.replace(/id="sec-valoracion"/, `id="sec-valoracion-control"`);
let pciAdapted = pci.replace(/id="sec-pci"/, `id="sec-plan-cuidado-control"`);
let proximoAdapted = proximo.replace(/id="sec-proximo-control"/, `id="sec-proximo-control-control"`);
let indicacionesAdapted = indicaciones.replace(/id="sec-indicaciones"/, `id="sec-indicaciones-control"`);

function replaceBlock(content, startStr, endStr, newBlock) {
  const startIndex = content.indexOf(startStr);
  if (startIndex === -1) throw new Error("Start not found: " + startStr);
  const endIndex = content.indexOf(endStr, startIndex);
  if (endIndex === -1) throw new Error("End not found: " + endStr);
  return content.substring(0, startIndex) + newBlock + content.substring(endIndex);
}

control = replaceBlock(control, "<section id=\"sec-atenciones-vigentes\"", "<section id=\"sec-estudios-control\"", atencionesAdapted);
control = replaceBlock(control, "<section id=\"sec-estudios-control\"", "<section id=\"sec-examen-fisico-control\"", estudiosAdapted);
control = replaceBlock(control, "<section id=\"sec-examen-fisico-control\"", "<section id=\"sec-valoracion-control\"", examenAdapted);
control = replaceBlock(control, "<section id=\"sec-valoracion-control\"", "<section id=\"sec-plan-cuidado-control\"", valoracionAdapted);
control = replaceBlock(control, "<section id=\"sec-plan-cuidado-control\"", "<section id=\"sec-proximo-control-control\"", pciAdapted);
control = replaceBlock(control, "<section id=\"sec-proximo-control-control\"", "<section id=\"sec-indicaciones-control\"", proximoAdapted);
control = replaceBlock(control, "<section id=\"sec-indicaciones-control\"", "</form>", indicacionesAdapted);

fs.writeFileSync(controlPath, control, "utf-8");
console.log("Blocks replaced successfully");

