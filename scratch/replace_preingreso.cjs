
const fs = require("fs");

const ingresoPath = "components/FichaIngresoEcicep.tsx";
const preingresoPath = "components/FichaPreingresoEcicep.tsx";

let ingreso = fs.readFileSync(ingresoPath, "utf-8");
let pre = fs.readFileSync(preingresoPath, "utf-8");

function extractBlock(content, startRegex, endRegex) {
  const matchStart = content.match(startRegex);
  if (!matchStart) throw new Error("Start not found for " + startRegex);
  const startIndex = matchStart.index;
  const contentFromStart = content.substring(startIndex);
  const matchEnd = contentFromStart.match(endRegex);
  if (!matchEnd) throw new Error("End not found for " + endRegex);
  return content.substring(startIndex, startIndex + matchEnd.index);
}

const antecedentes = extractBlock(ingreso, /<section id="sec-antecedentes"/, /<\/section>\s*<section id="sec-atenciones"/);
const atenciones = extractBlock(ingreso, /<section id="sec-atenciones"/, /<\/section>\s*\{formData\.sexo === .Femenino./);
const gineco = extractBlock(ingreso, /<section id="sec-gineco"/, /<\/section>\s*\)\}\s*<section id="sec-habitos"/);
const habitos = extractBlock(ingreso, /<section id="sec-habitos"/, /<\/section>\s*<section id="sec-animo"/);
const animo = extractBlock(ingreso, /<section id="sec-animo"/, /<\/section>\s*<section id="sec-dimension-social"/);
const dimensionSocial = extractBlock(ingreso, /<section id="sec-dimension-social"/, /<\/section>\s*<section id="sec-estudios"/);
const valoracion = extractBlock(ingreso, /<section id="sec-valoracion"/, /<\/section>\s*<section id="sec-pci"/);


function adapt(str, oldId, newId) {
  return str.replace(new RegExp(`id="${oldId}"`), `id="${newId}"`)
    .replace(/FichaIngresoEcicepFormData/g, "FichaPreingresoEcicepFormData");
}

let antA = adapt(antecedentes, "sec-antecedentes", "sec-antecedentes-pre");
let atencA = adapt(atenciones, "sec-atenciones", "sec-atenciones-pre");
let ginA = adapt(gineco, "sec-gineco", "sec-gineco-pre");
let habA = adapt(habitos, "sec-habitos", "sec-habitos-pre");
let aniA = adapt(animo, "sec-animo", "sec-animo-pre");
let dimA = adapt(dimensionSocial, "sec-dimension-social", "sec-dimension-social-pre");
let valA = adapt(valoracion, "sec-valoracion", "sec-valoracion-pre");

function replaceBlock(content, startRegex, endRegex, newBlock) {
  const matchStart = content.match(startRegex);
  if (!matchStart) throw new Error("Start not found for " + startRegex);
  const startIndex = matchStart.index;
  const contentFromStart = content.substring(startIndex);
  const matchEnd = contentFromStart.match(endRegex);
  if (!matchEnd) throw new Error("End not found for " + endRegex);
  const endIndex = startIndex + matchEnd.index;
  return content.substring(0, startIndex) + newBlock + content.substring(endIndex);
}

pre = replaceBlock(pre, /<section id="sec-antecedentes-pre"/, /<\/section>\s*<section id="sec-atenciones-pre"/, antA);
pre = replaceBlock(pre, /<section id="sec-atenciones-pre"/, /<\/section>\s*\{formData\.sexo === .Femenino./, atencA);
pre = replaceBlock(pre, /<section id="sec-gineco-pre"/, /<\/section>\s*\)\}\s*<section id="sec-habitos-pre"/, ginA);
pre = replaceBlock(pre, /<section id="sec-habitos-pre"/, /<\/section>\s*<section id="sec-animo-pre"/, habA);
pre = replaceBlock(pre, /<section id="sec-animo-pre"/, /<\/section>\s*<section id="sec-dimension-social-pre"/, aniA);
pre = replaceBlock(pre, /<section id="sec-dimension-social-pre"/, /<\/section>\s*<section id="sec-contacto-pre"/, dimA);
pre = replaceBlock(pre, /<section id="sec-valoracion-pre"/, /<\/section>\s*<section id="sec-gestion-pre"/, valA);

fs.writeFileSync(preingresoPath, pre, "utf-8");
console.log("Blocks replaced in Preingreso");

