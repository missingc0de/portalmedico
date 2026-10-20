const fs = require('fs');
const path = require('path');

const dir = 'components';
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().includes('ninosano') || f.toLowerCase().includes('nutricional'));

let updated = 0;

const uppercaseCheckboxJsx = `
            <div className="mb-2 flex items-center gap-1.5 flex-shrink-0">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isUppercase}
                  onChange={e => setIsUppercase(e.target.checked)}
                  className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500 cursor-pointer"
                />
                <span>MAYÚSCULAS</span>
              </label>
            </div>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('MAYÚSCULAS') || content.includes('isUppercase')) {
    console.log('Already has MAYUSCULAS:', file);
    return;
  }

  // 1. Add const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const statePos = content.indexOf('const [anamnesisText');
  const statePosAlt = content.indexOf('useState');

  if (statePos !== -1) {
    content = content.slice(0, statePos) + 'const [isUppercase, setIsUppercase] = useState<boolean>(false);\n  ' + content.slice(statePos);
  } else if (statePosAlt !== -1) {
    const lineEnd = content.indexOf('\n', statePosAlt);
    content = content.slice(0, lineEnd + 1) + '  const [isUppercase, setIsUppercase] = useState<boolean>(false);\n' + content.slice(lineEnd + 1);
  } else {
    console.log('Could not find state insertion point for:', file);
    return;
  }

  // 2. Insert the MAYUSCULAS checkbox inside right column summary
  const headerPos = content.indexOf('Resumen Ficha Clínica (Editable)</h3>\n            </div>');
  const headerPosAlt = content.indexOf('Resumen Ficha Clínica (Editable)</h3>');

  if (headerPos !== -1) {
    const insertIdx = headerPos + 'Resumen Ficha Clínica (Editable)</h3>\n            </div>'.length;
    content = content.slice(0, insertIdx) + uppercaseCheckboxJsx + content.slice(insertIdx);
  } else if (headerPosAlt !== -1) {
    const parentDivEnd = content.indexOf('</div>', headerPosAlt);
    const insertIdx = parentDivEnd + '</div>'.length;
    content = content.slice(0, insertIdx) + uppercaseCheckboxJsx + content.slice(insertIdx);
  }

  // 3. Update textareas to apply isUppercase
  content = content.replace(/value=\{anamnesisText\}/g, 'value={isUppercase ? anamnesisText.toUpperCase() : anamnesisText}');
  content = content.replace(/value=\{exploracionText\}/g, 'value={isUppercase ? exploracionText.toUpperCase() : exploracionText}');
  content = content.replace(/value=\{actuacionText\}/g, 'value={isUppercase ? actuacionText.toUpperCase() : actuacionText}');

  // 4. Update copy button logic if present
  if (content.includes('handleCopyToClipboard')) {
    content = content.replace(
      /const handleCopyToClipboard = \((text: string, title: string)\) => \{/g,
      'const handleCopyToClipboard = (text: string, title: string) => {\n    const textToCopy = isUppercase ? text.toUpperCase() : text;'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added MAYUSCULAS to:', file);
  updated++;
});

console.log('Total updated files:', updated);
