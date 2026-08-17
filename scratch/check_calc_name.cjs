const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/components/ChatLocal.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('isCalcOpen')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
