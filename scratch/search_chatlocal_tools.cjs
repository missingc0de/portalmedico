const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/components/ChatLocal.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  const l = line.toLowerCase();
  if (l.includes('calculator') || l.includes('notes') || l.includes('drive') || l.includes('bloc') || l.includes('calculadora') || l.includes('campana') || l.includes('bell')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
