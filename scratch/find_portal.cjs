const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/App.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('portal') && line.toLowerCase().includes('médico') || line.toLowerCase().includes('portal medico')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
