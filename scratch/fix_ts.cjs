
const fs = require("fs");
const controlPath = "components/FichaControlEcicepNuevo.tsx";
let control = fs.readFileSync(controlPath, "utf-8");

control = control.replace(/FichaIngresoEcicepFormData/g, "FichaControlEcicepFormData");
control = control.replace(/duplaProfesionalOtro/g, "duplaProfesional");

// Add handleRemovePccObjetivo if it is missing
if (!control.includes("handleRemovePccObjetivo")) {
  const insertFunc = `
  const handleRemovePccObjetivo = (index: number) => {
    setFormData(prev => {
      const newObjs = [...prev.pccObjetivos];
      newObjs.splice(index, 1);
      return { ...prev, pccObjetivos: newObjs };
    });
  };
`;
  control = control.replace("const handleAddPccObjetivo = () => {", insertFunc + "\n  const handleAddPccObjetivo = () => {");
}

fs.writeFileSync(controlPath, control, "utf-8");
console.log("Fixed TS errors");

