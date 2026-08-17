const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/App.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  const l = line.toLowerCase();
  if (l.includes('drive') || l.includes('calculadora') || l.includes('bloc') || l.includes('notas') || l.includes('notes')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
