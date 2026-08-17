
const fs = require("fs");
const controlPath = "components/FichaControlEcicepNuevo.tsx";
let control = fs.readFileSync(controlPath, "utf-8");

control = control.replace(/duplaProfesionalNombre/g, "duplaProfesionalOtroNombre");

fs.writeFileSync(controlPath, control, "utf-8");
console.log("Fixed accidental rename");

