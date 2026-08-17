const fs = require('fs');

let file = 'services/pdfGenerator.ts';
let content = fs.readFileSync(file, 'utf8');

const regexReceta = /const safeFileName = `Receta_Medica_\$\{\(data\.nombrePaciente \|\| 'Paciente'\)\.replace\(\/\[<>:"\/\\\|\\?\*\]\+\/g, ''\)\.replace\(\/\\\\s\+\/g, '_'\)\}\.pdf`;\s*const baseUrl = window\.location\.origin !== "null" && !window\.location\.origin\.includes\("file:\/\/"\) \? window\.location\.origin : '\.';\s*const bgUrl = `\$\{baseUrl\}\/certificado_background\.pdf`\.replace\('\/\/certificado', '\/certificado'\);\s*await applyBackgroundAndSave\(doc, bgUrl, safeFileName\);/g;

const targetReceta = `const safeFileName = \`Receta_Medica_\${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\\\|?*]+/g, '').replace(/\\s+/g, '_')}.pdf\`;
  if (data.hideLogos) {
    await savePdf(doc, safeFileName);
  } else {
    const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") ? window.location.origin : '.';
    const bgUrl = \`\${baseUrl}/certificado_background.pdf\`.replace('//certificado', '/certificado');
    await applyBackgroundAndSave(doc, bgUrl, safeFileName);
  }`;

const regexCertificado = /const safeFileName = `Certificado_Medico_\$\{\(data\.nombrePaciente \|\| 'Paciente'\)\.replace\(\/\[<>:"\/\\\|\\?\*\]\+\/g, ''\)\.replace\(\/\\\\s\+\/g, '_'\)\}\.pdf`;\s*const baseUrl = window\.location\.origin !== "null" && !window\.location\.origin\.includes\("file:\/\/"\) \? window\.location\.origin : '\.';\s*const bgUrl = `\$\{baseUrl\}\/certificado_background\.pdf`\.replace\('\/\/certificado', '\/certificado'\);\s*await applyBackgroundAndSave\(doc, bgUrl, safeFileName\);/g;

const targetCertificado = `const safeFileName = \`Certificado_Medico_\${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\\\|?*]+/g, '').replace(/\\s+/g, '_')}.pdf\`;
  if (data.hideLogos) {
    await savePdf(doc, safeFileName);
  } else {
    const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") ? window.location.origin : '.';
    const bgUrl = \`\${baseUrl}/certificado_background.pdf\`.replace('//certificado', '/certificado');
    await applyBackgroundAndSave(doc, bgUrl, safeFileName);
  }`;

if (content.match(regexReceta)) {
  content = content.replace(regexReceta, targetReceta);
  console.log('Fixed Receta');
} else {
  console.log('Receta regex failed');
}

if (content.match(regexCertificado)) {
  content = content.replace(regexCertificado, targetCertificado);
  console.log('Fixed Certificado');
} else {
  console.log('Certificado regex failed');
}

fs.writeFileSync(file, content);
