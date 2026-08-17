const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/components/FichaPreingresoEcicep.tsx', 'utf8');
const lines = content.split('\n');
let found = false;
lines.forEach((line, idx) => {
  if (line.includes('return (') && idx > 500 && !found) {
    console.log(`${idx + 1}: ${line}`);
  }
});
