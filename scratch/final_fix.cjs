
const fs = require("fs");
const controlPath = "components/FichaControlEcicepNuevo.tsx";
const typesPath = "types.ts";

let control = fs.readFileSync(controlPath, "utf-8");
let types = fs.readFileSync(typesPath, "utf-8");

// 1. Add borgScaleResult to types
if (!types.includes("borgScaleResult?: string")) {
  types = types.replace("pccObjetivos: PccObjetivo[];", "borgScaleResult?: string;\n    pccObjetivos: PccObjetivo[];");
  fs.writeFileSync(typesPath, types, "utf-8");
}

// 2. Add handleRemovePccObjetivo
if (!control.includes("const handleRemovePccObjetivo = (index: number) => {")) {
  const insertFunc = `
  const handleRemovePccObjetivo = (index: number) => {
    setFormData((prev: any) => {
      const newObjs = [...(prev.pccObjetivos || [])];
      newObjs.splice(index, 1);
      return { ...prev, pccObjetivos: newObjs };
    });
  };
`;
  control = control.replace("const handleAddPccObjetivo = () => {", insertFunc + "\n  const handleAddPccObjetivo = () => {");
}

// 3. Add BorgModal state and component
if (!control.includes("const [isBorgModalOpen")) {
  control = control.replace("const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);", "const [status, setStatus] = useState<FormStatus>(FormStatus.Idle);\n    const [isBorgModalOpen, setIsBorgModalOpen] = useState(false);");
}

if (!control.includes("import BorgScaleModal")) {
  control = control.replace("import UserAutocomplete from './UserAutocomplete';", "import UserAutocomplete from './UserAutocomplete';\nimport BorgScaleModal from './BorgScaleModal';");
}

if (!control.includes("<BorgScaleModal")) {
  const modalComp = `
        <BorgScaleModal
          isOpen={isBorgModalOpen}
          onClose={() => setIsBorgModalOpen(false)}
          onSave={(score) => setFormData((prev: any) => ({ ...prev, borgScaleResult: score }))}
        />
  `;
  control = control.replace("{isAiImporting && (", modalComp + "\n          {isAiImporting && (");
}

fs.writeFileSync(controlPath, control, "utf-8");
console.log("Final fix applied");

