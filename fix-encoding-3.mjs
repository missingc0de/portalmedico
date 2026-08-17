import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'components');

const fixSpecificFile = (filename, replacements) => {
    const filePath = path.join(componentsDir, filename);
    if (!fs.existsSync(filePath)) return;
    
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
        console.log(`Fixed ${filename}`);
    }
}

fixSpecificFile('GrupalDiabetesManager.tsx', { 'âš ï¸ ': '⚠️' });
fixSpecificFile('FichaMorbilidad.tsx', { 'âœ¨': '✨' });
fixSpecificFile('FichaIngresoEcicep.tsx', { 'â€“': '–' });
fixSpecificFile('EcicepRiskCalculatorModal.tsx', { 'â ¤ï¸ ': '❤️' });

console.log("Cleanup pass 3 complete");
