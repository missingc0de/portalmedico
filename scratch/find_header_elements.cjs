const fs = require('fs');
const content = fs.readFileSync('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB/App.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('NotificationBell') || line.includes('campana') || line.includes('bell') || line.includes('Bloc de notas') || line.includes('calculadora')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
