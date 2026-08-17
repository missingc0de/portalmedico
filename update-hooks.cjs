const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const useFormImport = "import { useFormLocalStorage } from '../hooks/useFormLocalStorage';";

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if we already imported (idempotent)
  if (content.includes('useFormLocalStorage(')) {
    continue;
  }

  // Regex to find `const [formData, setFormData] = useState<Whatever>(initialFormData);`
  // We need to capture the Type and the fact that it uses initialFormData
  const regex = /const\s+\[formData,\s*setFormData\]\s*=\s*useState(<[^>]+>)?\(initialFormData\);/g;
  
  if (regex.test(content)) {
    // We found it! Let's inject the import at the top of the file
    // Find the last import
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            lastImportIdx = i;
        }
    }
    
    if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, useFormImport);
        content = lines.join('\n');
    } else {
        content = useFormImport + '\n' + content;
    }

    // Now replace the useState
    content = content.replace(regex, (match, typeGroup) => {
        const type = typeGroup || '';
        const key = `'local_${file.replace('.tsx', '')}'`;
        return `const [formData, setFormData] = useFormLocalStorage${type}(${key}, initialFormData);`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
}

console.log(`Done. Updated ${updatedCount} files.`);
