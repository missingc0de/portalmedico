import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function analyzePdf(pdfPath: string) {
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  console.log(`Fields in ${pdfPath}:`);
  fields.forEach(field => {
    let name = field.getName();
    // try to get widget to get rect
    const widgets = field.acroField.getWidgets();
    const rect = widgets[0]?.getRectangle();
    console.log(`- Field: ${name} | Type: ${field.constructor.name} | Rect: ${JSON.stringify(rect)}`);
  });
  if (fields.length === 0) {
    console.log("No form fields found.");
  }
}

analyzePdf(path.join(process.cwd(), 'public', 'WORD.pdf')).catch(console.error);
