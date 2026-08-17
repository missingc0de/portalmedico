const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/App.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('CertificadoMedicoForm') || line.includes('RecetaMedicaForm')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
