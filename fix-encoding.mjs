import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

const dataDir = path.join(process.cwd(), 'data');
const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

const allFiles = [...files.map(f => path.join(componentsDir, f)), ...dataFiles.map(f => path.join(dataDir, f))];

const replacements = {
    'Ã“': 'Ó',
    'Ã‘': 'Ñ',
    'Ã‰': 'É',
    'Ãš': 'Ú',
    'Ã\u008d': 'Í',
    'Ã\u0081': 'Á',

    // Punctuation & Math
    'â–²': '▲',
    'â–¼': '▼',
    'âˆ’': '−',
    'â€¢': '•',
    'â‰¥': '≥',
    'â‰¤': '≤',
    'â€¦': '…',
    
    // Emojis and complex variants
    'â ¤ï¸ ': '❤️',
    'âš\u00A0ï¸ ': '⚠️', // âš is usually U+26A0, but it gets mangled. Let's rely on grep finding: âš ï¸ 
};

// Also let's capture the exact literal string from grep:
replacements['âš ï¸ '] = '⚠️';

let filesChanged = 0;

allFiles.forEach(filePath => {
   let content = fs.readFileSync(filePath, 'utf8');
   
   let changed = false;
   for (const [corrupt, fixed] of Object.entries(replacements)) {
       if (content.includes(corrupt)) {
           content = content.split(corrupt).join(fixed);
           changed = true;
       }
   }

   if (changed) {
       fs.writeFileSync(filePath, content, 'utf8');
       filesChanged++;
       console.log(`Fixed encoding in ${path.basename(filePath)}`);
   }
});

console.log(`\nSuccessfully fixed ${filesChanged} files (Pass 2).`);
