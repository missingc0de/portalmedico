const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/components/FichaPreingresoEcicep.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Resumen') || line.includes('resumen') || line.includes('col-span-4')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
