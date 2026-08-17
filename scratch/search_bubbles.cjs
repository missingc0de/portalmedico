const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('bloc de notas') || content.toLowerCase().includes('drive') || content.toLowerCase().includes('calculadora')) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

searchDir('c:/Users/missi/.gemini/antigravity/scratch/PORTALMEDICO_CLIENTEWEB');
