import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import fontkit from '@pdf-lib/fontkit'; // Removed because standard fonts don't need it and it can crash the bundler
import { FormData, OrdenExamenRadiologicoFormData, CertificadoEscolarFormData, DerivacionesPscvFormData, OrdenLaboratorioFormData, RecetaMedicaFormData, User, FichaConsultoriaFormData, PccObjetivo } from '../types';
import { formatRutChilean } from '../components/RutInput'; // Import the formatter
import { labCategoriesConfig, LabTestCategory, labTestDetails } from '../data/labTestData'; // Import the configuration

const LOGO_LEFT_URL = '/images/img_coquimbo.png'; // CESFAM San Juan logo
const LOGO_RIGHT_URL = '/images/img_muni.png';
const ROD_ASCLEPIUS_URL = '/images/rod_of_asclepius.png'; // Watermark image

const sanitizeFilename = (name: string) => name.replace(/[<>:"/\\\\|?*]+/g, '').replace(/\\s+/g, '_');

const openPdfInNewTab = (pdfData: jsPDF | Blob | Uint8Array | ArrayBuffer | string, fileName: string = 'documento.pdf') => {
  try {
    let blob: Blob;
    let base64String: string | null = null;
    const safeFileName = sanitizeFilename(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);

    if (typeof pdfData === 'string') {
      if (pdfData.startsWith('data:application/pdf')) {
        base64String = pdfData;
        const base64Content = pdfData.split(',')[1];
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: 'application/pdf' });
      } else {
        blob = new Blob([pdfData], { type: 'application/pdf' });
      }
    } else if (pdfData instanceof Blob) {
      blob = pdfData.type === 'application/pdf' ? pdfData : new Blob([pdfData], { type: 'application/pdf' });
    } else if (pdfData instanceof Uint8Array || pdfData instanceof ArrayBuffer) {
      blob = new Blob([pdfData as BlobPart], { type: 'application/pdf' });
    } else if (pdfData && typeof (pdfData as any).output === 'function') {
      const arr = (pdfData as jsPDF).output('arraybuffer');
      blob = new Blob([arr], { type: 'application/pdf' });
    } else {
      return;
    }

    const pyApi = (window as any).pywebview?.api;
    if (pyApi && (typeof pyApi.save_and_open_pdf === 'function' || typeof pyApi.open_pdf === 'function')) {
      const fn = pyApi.save_and_open_pdf || pyApi.open_pdf;
      if (base64String) {
        fn(base64String, safeFileName);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        if (b64) {
          fn(b64, safeFileName);
        }
      };
      reader.readAsDataURL(blob);
      return;
    }

    // Fallback for standard browsers & Electron
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.download = safeFileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    }
  } catch (err) {
    console.error('Error opening PDF automatically:', err);
  }
};

const savePdf = async (doc: jsPDF, defaultFileName: string) => {
  const safeFileName = sanitizeFilename(defaultFileName.endsWith('.pdf') ? defaultFileName : `${defaultFileName}.pdf`);

  const arrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

  // Python desktop app: save directly to Desktop + open system reader
  const pyApi = (window as any).pywebview?.api;
  if (pyApi && (typeof pyApi.save_and_open_pdf === 'function' || typeof pyApi.open_pdf === 'function')) {
    const fn = pyApi.save_and_open_pdf || pyApi.open_pdf;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (b64) {
        fn(b64, safeFileName);
      }
    };
    reader.readAsDataURL(blob);
    return;
  }

  // Web browser fallback: single download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = safeFileName;
  link.click();
};

async function loadImageAsBase64(url: string): Promise<string> {
  // Ignoramos las imágenes para evitar conflictos de corrupción en jsPDF sin internet
  return '';
}

const applyBackgroundAndSave = async (jsPdfDoc: jsPDF, bgUrl: string, fileName: string) => {
    const safeFileName = sanitizeFilename(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    const jsPdfBytes = jsPdfDoc.output('arraybuffer');
    
    let bgPdfBytes;
    try {
        let res = await fetch('certificado_background.pdf');
        if (!res.ok) {
            res = await fetch('/certificado_background.pdf');
        }
        if (!res.ok) {
            res = await fetch(bgUrl);
        }
        if (!res.ok) throw new Error("HTTP timeout/error");
        bgPdfBytes = await res.arrayBuffer();
    } catch (e) {
        console.warn("Background PDF not found, falling back to standard jsPDF.", e);
        await savePdf(jsPdfDoc, safeFileName);
        return;
    }

    const bgDoc = await PDFDocument.load(bgPdfBytes);
    const fgDoc = await PDFDocument.load(jsPdfBytes);
    const embeddedFgPages = await bgDoc.embedPdf(fgDoc);
    
    const bgPages = bgDoc.getPages();
    const bgPage1 = bgPages[0];
    
    if (embeddedFgPages.length > 0 && bgPage1) {
        const fgPage = embeddedFgPages[0];
        const scale = Math.min(
            bgPage1.getWidth() / fgPage.width,
            bgPage1.getHeight() / fgPage.height
        );
        const newWidth = fgPage.width * scale;
        const newHeight = fgPage.height * scale;
        const xOffset = (bgPage1.getWidth() - newWidth) / 2;
        const yOffset = (bgPage1.getHeight() - newHeight) / 2;

        bgPage1.drawPage(fgPage, {
            x: xOffset, 
            y: yOffset,
            width: newWidth,
            height: newHeight,
        });
    }

    const finalPdfBytes = await bgDoc.save();
    const blob = new Blob([finalPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

    // Desktop app integration: Save to Desktop + Open in System PDF Reader
    const pyApi = (window as any).pywebview?.api;
    if (pyApi && (typeof pyApi.save_and_open_pdf === 'function' || typeof pyApi.open_pdf === 'function')) {
        const fn = pyApi.save_and_open_pdf || pyApi.open_pdf;
        const reader = new FileReader();
        reader.onloadend = () => {
            const b64 = reader.result as string;
            if (b64) {
                fn(b64, safeFileName);
            }
        };
        reader.readAsDataURL(blob);
        return;
    }

    // Web browser fallback
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = safeFileName;
    link.click();
};

// Helper to format YYYY-MM-DD to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
};

// Helper to format date for "Coquimbo, [D] de [Month] de [YYYY]"
const formatDateForHeader = (dateString: string): string => {
  if (!dateString) return 'Coquimbo, ___ de ____________ de 202_';
  try {
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    if (isNaN(date.getTime())) return 'Coquimbo, ___ de ____________ de 202_';
    return `Coquimbo, ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } catch (e) {
    return 'Coquimbo, ___ de ____________ de 202_';
  }
};


export const generateCertificatePdf = async (
  data: FormData, 
  headerDateString: string,
  user: User,
  outputType: 'newwindow' | 'datauristring' | 'blob' = 'newwindow'
): Promise<void | string | Blob> => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const horizontalMargin = pageWidth / 8;
  const verticalMargin = pageHeight / 8;

  const contentWidth = pageWidth - 2 * horizontalMargin;
  const lineSpacing = 7; 
  const baseFontSize = 12;

  let logoLeftBase64: string, logoRightBase64: string, rodAsclepiusBase64: string;
  try {
    [logoLeftBase64, logoRightBase64, rodAsclepiusBase64] = await Promise.all([
      loadImageAsBase64(LOGO_LEFT_URL),
      loadImageAsBase64(LOGO_RIGHT_URL),
      loadImageAsBase64(ROD_ASCLEPIUS_URL)
    ]);
  } catch (e) {
    console.error("Failed to load one or more images, PDF generation might be affected.", e);
    logoLeftBase64 = logoLeftBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    logoRightBase64 = logoRightBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    rodAsclepiusBase64 = rodAsclepiusBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
  
  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif') && !rodAsclepiusBase64.startsWith('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
    const watermarkImageWidth = 100; 
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (pageHeight - watermarkImageHeight) / 2;

    doc.saveGraphicsState(); 
    // @ts-ignore GState is available on jsPDF instance but types might be incomplete
    const GState = doc.GState;
    if (GState) { 
       // @ts-ignore
      doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 })); 
    } else { 
      console.warn("jsPDF GState not available for setting watermark opacity. Watermark might be fully opaque.");
    }
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState(); 
  }


  let currentY = verticalMargin; 

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(headerDateString, horizontalMargin, currentY);
  currentY += lineSpacing; 
  
  if (!data.hideLogos) {
    const logoSharedY = currentY; 
    const logoLeftWidth = 25; 
    const logoLeftHeight = 25;
    const logoRightWidth = 30;
    const logoRightHeight = 25;

    if (logoLeftBase64 && !logoLeftBase64.startsWith('data:image/gif') && !logoLeftBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoLeftBase64, 'PNG', horizontalMargin, logoSharedY, logoLeftWidth, logoLeftHeight);
    }
    if (logoRightBase64 && !logoRightBase64.startsWith('data:image/gif') && !logoRightBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoRightBase64, 'PNG', pageWidth - horizontalMargin - logoRightWidth, logoSharedY, logoRightWidth, logoRightHeight);
    }
    currentY += Math.max(logoLeftHeight, logoRightHeight) + lineSpacing; 
  } else {
    currentY += lineSpacing; // Add some space if logos are hidden, before title
  }


  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  const titleText = "CERTIFICADO";
  const titleWidth = doc.getStringUnitWidth(titleText) * 18 / doc.internal.scaleFactor;
  doc.text(titleText, (pageWidth - titleWidth) / 2, currentY);
  currentY += lineSpacing * 2;  

  doc.setFontSize(baseFontSize);

  const docNameValue = data.docName || '[Nombre Médico]';
  const text1P1 = "Yo, ";
  const text1P3 = `, médico cirujano del CESFAM de San Juan, certifico que ${data.fullName || '[Nombre Paciente]'}, RUT ${formatRutChilean(data.rut) || '[RUT Paciente]'}, con domicilio en ${data.address || '[Dirección Paciente]'}, ${data.city || '[Ciudad Paciente]'}, recibe atención en el CESFAM San Juan.`;
  
  let accumulatedX = horizontalMargin;
  doc.setFont('Helvetica', 'normal');
  doc.text(text1P1, accumulatedX, currentY);
  accumulatedX += doc.getStringUnitWidth(text1P1) * baseFontSize / doc.internal.scaleFactor;

  doc.setFont('Helvetica', 'bold');
  doc.text(docNameValue, accumulatedX, currentY);
  accumulatedX += doc.getStringUnitWidth(docNameValue) * baseFontSize / doc.internal.scaleFactor;
  
  doc.setFont('Helvetica', 'normal');
  const remainingText1Width = contentWidth - (accumulatedX - horizontalMargin);
  const splitText1P3 = doc.splitTextToSize(text1P3, remainingText1Width);

  doc.text(splitText1P3[0], accumulatedX, currentY); 
  currentY += lineSpacing;

  if (splitText1P3.length > 1) {
      const restOfP3 = splitText1P3.slice(1).join(" ");
      const fullRestOfP3Lines = doc.splitTextToSize(restOfP3, contentWidth);
      doc.text(fullRestOfP3Lines, horizontalMargin, currentY);
      currentY += fullRestOfP3Lines.length * lineSpacing;
  }
  currentY += lineSpacing; 

  const text2P1Bold = "CERTIFICO";
  const text2P2Normal = ` que la persona fue atendida el día de la fecha por un cuadro de ${data.diagnosis || '[Diagnóstico]'}.`;

  accumulatedX = horizontalMargin;
  doc.setFont('Helvetica', 'bold');
  doc.text(text2P1Bold, accumulatedX, currentY);
  accumulatedX += doc.getStringUnitWidth(text2P1Bold) * baseFontSize / doc.internal.scaleFactor;

  doc.setFont('Helvetica', 'normal');
  const remainingText2Width = contentWidth - (accumulatedX - horizontalMargin);
  const splitText2P2 = doc.splitTextToSize(text2P2Normal, remainingText2Width);
  
  doc.text(splitText2P2[0], accumulatedX, currentY);
  currentY += lineSpacing;

  if (splitText2P2.length > 1) {
      const restOfP2 = splitText2P2.slice(1).join(" ");
      const fullRestOfP2Lines = doc.splitTextToSize(restOfP2, contentWidth);
      doc.text(fullRestOfP2Lines, horizontalMargin, currentY);
      currentY += fullRestOfP2Lines.length * lineSpacing;
  }
  currentY += lineSpacing; 

  doc.setFont('Helvetica', 'normal');
  const text3 = "Se extiende el presente certificado a quien estime conveniente.";
  const splitText3 = doc.splitTextToSize(text3, contentWidth);
  doc.text(splitText3, horizontalMargin, currentY);
  currentY += splitText3.length * lineSpacing;

  const signatureGapMultiplier = 5; 
  
  const gapBeforeSignatureBlock = signatureGapMultiplier * lineSpacing;
  const heightOfSignatureElementsAndPostBuffer = lineSpacing * (1 + 3 + 1); 

  const totalSpaceNeededForSignatureArea = gapBeforeSignatureBlock + heightOfSignatureElementsAndPostBuffer;

  if (currentY + totalSpaceNeededForSignatureArea > pageHeight - verticalMargin) {
    currentY = pageHeight - verticalMargin - totalSpaceNeededForSignatureArea - 5; 
  }
  
  currentY += gapBeforeSignatureBlock;

  const signatureLineY = currentY + lineSpacing; 

  doc.setFontSize(11); 

  const signatureLineWidth = 80; 
  const signatureLineX = (pageWidth - signatureLineWidth) / 2;
  doc.line(signatureLineX, signatureLineY, signatureLineX + signatureLineWidth, signatureLineY);

  if (user.electronicSignature && user.electronicSignature.trim() !== '') {
    const signatureLines = user.electronicSignature.split('\n');
    let currentSignatureY = signatureLineY + lineSpacing;
    signatureLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const lineWidth = doc.getStringUnitWidth(trimmedLine) * 11 / doc.internal.scaleFactor;
        doc.text(trimmedLine, (pageWidth - lineWidth) / 2, currentSignatureY);
        currentSignatureY += lineSpacing * 0.9;
      }
    });
  } else {
    // Fallback
    const docNameSigText = user.fullName || '[Nombre Médico]';
    const docNameSigWidth = doc.getStringUnitWidth(docNameSigText) * 11 / doc.internal.scaleFactor;
    doc.text(docNameSigText, (pageWidth - docNameSigWidth) / 2, signatureLineY + lineSpacing);

    const docTitleSigText = 'Médico Cirujano';
    const docTitleSigWidth = doc.getStringUnitWidth(docTitleSigText) * 11 / doc.internal.scaleFactor;
    doc.text(docTitleSigText, (pageWidth - docTitleSigWidth) / 2, signatureLineY + lineSpacing * 2);

    let docRutDisplay = '[RUT Médico]';
    if (user.rut && user.rut.trim() !== '') {
      docRutDisplay = formatRutChilean(user.rut);
    }
    const docRutSigWidth = doc.getStringUnitWidth(docRutDisplay) * 11 / doc.internal.scaleFactor;
    doc.text(docRutDisplay, (pageWidth - docRutSigWidth) / 2, signatureLineY + lineSpacing * 3);
  }

  const safeFileName = `Certificado_${(data.fullName || 'Paciente').replace(/\\s+/g, '_')}.pdf`;
  if (data.hideLogos) {
    switch (outputType) {
      case 'datauristring':
        return doc.output('datauristring');
      case 'blob':
        return doc.output('blob');
      case 'newwindow':
      default:
        await savePdf(doc, safeFileName);
        return;
    }
  } else {
    const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") ? window.location.origin : '.';
    const bgUrl = `${baseUrl}/certificado_background.pdf`.replace('//certificado', '/certificado');
    await applyBackgroundAndSave(doc, bgUrl, safeFileName);
  }
};

export const generateClinicalRecordPdf = async (
  { title, content }: { title: string; content: string; },
  user: User
): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const lineSpacing = 4.5;
  const baseFontSize = 9;

  let logoLeftBase64: string, logoRightBase64: string, rodAsclepiusBase64: string;
  try {
    [logoLeftBase64, logoRightBase64, rodAsclepiusBase64] = await Promise.all([
      loadImageAsBase64(LOGO_LEFT_URL),
      loadImageAsBase64(LOGO_RIGHT_URL),
      loadImageAsBase64(ROD_ASCLEPIUS_URL)
    ]);
  } catch (e) {
    console.error("Failed to load images for PDF", e);
    logoLeftBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    logoRightBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    rodAsclepiusBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }

  const addHeaderAndFooter = (pageNumber: number) => {
    if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif') && !rodAsclepiusBase64.startsWith('data:image/png;base64,iV')) {
      const watermarkImageWidth = 100;
      const watermarkImageHeight = 150;
      const watermarkX = (pageWidth - watermarkImageWidth) / 2;
      const watermarkY = (pageHeight - watermarkImageHeight) / 2;
      doc.saveGraphicsState();
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 0.07 }));
      doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
      doc.restoreGraphicsState();
    }
    
    const logoHeight = 20;
    const logoWidth = 20;
    if (logoLeftBase64 && !logoLeftBase64.startsWith('data:image/gif') && !logoLeftBase64.startsWith('data:image/png;base64,iV')) {
        doc.addImage(logoLeftBase64, 'PNG', margin, margin - 10, logoWidth, logoHeight);
    }
    if (logoRightBase64 && !logoRightBase64.startsWith('data:image/gif') && !logoRightBase64.startsWith('data:image/png;base64,iV')) {
        doc.addImage(logoRightBase64, 'PNG', pageWidth - margin - logoWidth - 5, margin - 10, logoWidth + 5, logoHeight);
    }

    doc.setFontSize(8);
    doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };
  
  addHeaderAndFooter(1);
  let yPos = margin + 20;

  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text(title.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  doc.setFontSize(baseFontSize);
  doc.setFont('Courier', 'normal');

  const lines = doc.splitTextToSize(content, contentWidth);
  let currentPage = 1;

  lines.forEach((line: string) => {
    if (yPos > pageHeight - margin - 15) {
      doc.addPage();
      currentPage++;
      addHeaderAndFooter(currentPage);
      yPos = margin + 15;
    }
    doc.text(line, margin, yPos);
    yPos += lineSpacing;
  });

  const signatureSpaceNeeded = 30;
  if (yPos > pageHeight - margin - signatureSpaceNeeded) {
    doc.addPage();
    currentPage++;
    addHeaderAndFooter(currentPage);
    yPos = margin + 30; // Reset yPos for the new page signature
  } else {
    yPos = pageHeight - margin - 25 - 10; // Position signature on current page
  }
  
  const signatureY = yPos + 15;
  const signatureLineLength = 70;
  const signatureLineX = (pageWidth - signatureLineLength) / 2;

  doc.line(signatureLineX, signatureY, signatureLineX + signatureLineLength, signatureY);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(user.fullName, signatureLineX + (signatureLineLength / 2), signatureY + 6, { align: 'center' });
  let professionTitle = user.profession.charAt(0).toUpperCase() + user.profession.slice(1);
  if (professionTitle === 'Medicina') {
      professionTitle = 'Médico Cirujano';
  } else if (professionTitle === 'Enfermeria') {
      professionTitle = 'Enfermero/a';
  }
  doc.text(professionTitle, signatureLineX + (signatureLineLength / 2), signatureY + 11, { align: 'center' });
  if (user.rut) {
    doc.text(formatRutChilean(user.rut), signatureLineX + (signatureLineLength / 2), signatureY + 16, { align: 'center' });
  }

  await savePdf(doc, `Registro_Clinico.pdf`);
};

export const generateOrdenExamenRadiologicoPdf = async (data: OrdenExamenRadiologicoFormData, currentDate: string, user: User): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); 
  const pageHeight = doc.internal.pageSize.getHeight(); 

  const margin = 15; 
  const contentWidth = pageWidth - 2 * margin; 
  
  const lineSpacing = 7.5; 
  const smallLineSpacing = 5.5; 
  const fieldLabelFontSize = 10;
  const fieldValueFontSize = 10;
  const titleFontSize = 12;
  const headerFontSize = 10;
  const smallNoteFontSize = 8;
  const tableFontSize = 9;

  let rodAsclepiusBase64: string;
  try {
    rodAsclepiusBase64 = await loadImageAsBase64(ROD_ASCLEPIUS_URL);
  } catch (e) {
    console.error("Failed to load watermark image, PDF generation might be affected.", e);
    rodAsclepiusBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  
  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif')) {
    const watermarkImageWidth = 100;
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (pageHeight - watermarkImageHeight) / 2;
    doc.saveGraphicsState();
    // @ts-ignore
    const GState = doc.GState;
    if (GState) { // @ts-ignore
      doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 }));
    } else {
      console.warn("jsPDF GState not available for setting watermark opacity.");
    }
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState();
  }

  let yPos = margin; 

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(headerFontSize);
  doc.text("MINISTERIO DE SALUD PÚBLICA", pageWidth / 2, yPos, { align: 'center' });
  yPos += 5; 
  doc.text("SERVICIO DE SALUD", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 1.5; 

  const globalYShift = 8; 
  yPos += globalYShift;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(titleFontSize);
  const mainTitleText = "SOLICITUD DE EXAMEN RADIOLÓGICO";
  const mainTitleWidth = doc.getStringUnitWidth(mainTitleText) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(mainTitleText, pageWidth / 2, yPos, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line((pageWidth - mainTitleWidth) / 2, yPos + 1, (pageWidth + mainTitleWidth) / 2, yPos + 1); 
  yPos += lineSpacing * 2.5; // Increased spacing here

  doc.setFontSize(fieldLabelFontSize);
  doc.setFont('Helvetica', 'normal');
  const fieldLineYOffset = 1; 

  const nombreLabel = "Nombre:";
  const nombreValue = data.nombrePaciente;
  const fechaLabel = "Fecha:";
  const fechaValue = currentDate;
  
  doc.text(nombreLabel, margin, yPos);
  const nombreLabelWidth = doc.getStringUnitWidth(nombreLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const nombreValueX = margin + nombreLabelWidth + 2;
  const fechaLabelWidth = doc.getStringUnitWidth(fechaLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const fechaValueWidth = doc.getStringUnitWidth(fechaValue) * doc.getFontSize() / doc.internal.scaleFactor;
  const fechaXStart = pageWidth - margin - fechaValueWidth - fechaLabelWidth - 2;

  doc.setFont('Helvetica', 'bold');
  doc.text(nombreValue, nombreValueX, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.setLineWidth(0.3);
  doc.line(nombreValueX, yPos + fieldLineYOffset, fechaXStart - 5, yPos + fieldLineYOffset); 
  
  doc.text(fechaLabel, fechaXStart, yPos);
  doc.setFont('Helvetica', 'bold');
  doc.text(fechaValue, fechaXStart + fechaLabelWidth + 2, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.line(fechaXStart + fechaLabelWidth + 2, yPos + fieldLineYOffset, pageWidth - margin, yPos + fieldLineYOffset); 
  yPos += lineSpacing;

  const nFichaLabel = "N° Ficha Clínica:";
  const nFichaValue = data.numeroFichaClinica;
  const nFichaValueWidth = Math.max(30, doc.getStringUnitWidth(nFichaValue) * doc.getFontSize() / doc.internal.scaleFactor + 4); // +4 for padding
  const nFichaLabelWidth = doc.getStringUnitWidth(nFichaLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const nFichaX = margin + nFichaLabelWidth + 2;

  const edadLabel = "Edad:";
  const edadValue = data.edadPaciente;
  const edadLabelWidth = doc.getStringUnitWidth(edadLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const edadValueWidth = doc.getStringUnitWidth(edadValue) * doc.getFontSize() / doc.internal.scaleFactor;
  const edadXStart = margin + nFichaLabelWidth + 2 + nFichaValueWidth + 10; // 10 for spacing

  doc.text(nFichaLabel, margin, yPos);
  doc.setFont('Helvetica', 'bold');
  doc.text(nFichaValue, nFichaX, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.line(nFichaX, yPos + fieldLineYOffset, nFichaX + nFichaValueWidth, yPos + fieldLineYOffset);

  doc.text(edadLabel, edadXStart, yPos);
  doc.setFont('Helvetica', 'bold');
  doc.text(edadValue, edadXStart + edadLabelWidth + 2, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.line(edadXStart + edadLabelWidth + 2, yPos + fieldLineYOffset, pageWidth - margin, yPos + fieldLineYOffset);
  yPos += lineSpacing;

  const procedenciaLabel = "Procedencia:";
  const procedenciaValue = "CESFAM San Juan"; // Static
  doc.text(procedenciaLabel, margin, yPos);
  const procedenciaLabelWidth = doc.getStringUnitWidth(procedenciaLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.setFont('Helvetica', 'bold');
  doc.text(procedenciaValue, margin + procedenciaLabelWidth + 2, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.line(margin + procedenciaLabelWidth + 2, yPos + fieldLineYOffset, pageWidth - margin, yPos + fieldLineYOffset);
  yPos += lineSpacing;

  const salaLabel = "Sala:";
  const salaValue = "___________"; // Static
  const camaLabel = "Cama N°:";
  const camaValue = "___________"; // Static
  const salaLabelWidth = doc.getStringUnitWidth(salaLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const salaX = margin + salaLabelWidth + 2;
  const camaLabelWidth = doc.getStringUnitWidth(camaLabel) * doc.getFontSize() / doc.internal.scaleFactor;
  const camaXStart = pageWidth / 2 + 5;

  doc.text(salaLabel, margin, yPos);
  doc.setFont('Helvetica', 'bold');
  doc.text(salaValue, salaX, yPos);
  doc.setFont('Helvetica', 'normal');
  // doc.line(salaX, yPos + fieldLineYOffset, camaXStart - 5, yPos + fieldLineYOffset);
  
  doc.text(camaLabel, camaXStart, yPos);
  doc.setFont('Helvetica', 'bold');
  doc.text(camaValue, camaXStart + camaLabelWidth + 2, yPos);
  doc.setFont('Helvetica', 'normal');
  // doc.line(camaXStart + camaLabelWidth + 2, yPos + fieldLineYOffset, pageWidth - margin, yPos + fieldLineYOffset);
  yPos += lineSpacing * 1.5;

  doc.setFont('Helvetica', 'bold');
  doc.text("EXAMEN SOLICITADO:", margin, yPos);
  doc.setFont('Helvetica', 'normal');
  yPos += smallLineSpacing;
  doc.setFont('Helvetica', 'bold');
  const examenLines = doc.splitTextToSize(data.examenSolicitado, contentWidth);
  doc.text(examenLines, margin + 5, yPos); // Indent requested exam
  doc.setFont('Helvetica', 'normal');
  yPos += examenLines.length * smallLineSpacing + lineSpacing * 0.5;


  doc.setFont('Helvetica', 'bold');
  doc.text("DIAGNÓSTICO E SÍNTOMAS PRINCIPALES:", margin, yPos);
  doc.setFont('Helvetica', 'normal');
  yPos += smallLineSpacing;
  doc.setFont('Helvetica', 'bold');
  const diagnosticoLines = doc.splitTextToSize(data.diagnosticoSintomas, contentWidth);
  doc.text(diagnosticoLines, margin + 5, yPos); // Indent diagnosis
  doc.setFont('Helvetica', 'normal');
  yPos += diagnosticoLines.length * smallLineSpacing + lineSpacing;


  const tableStartY = yPos;
  const rowHeight = 6;
  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2;
  const tableBottomMargin = 10;
  
  doc.setFontSize(tableFontSize);
  doc.text("PARA USO EXCLUSIVO DEL SERVICIO DE RAYOS", margin, yPos, { align: 'center', maxWidth: contentWidth });
  yPos += rowHeight * 1.5;

  const drawCell = (text: string, x: number, y: number, width: number, height: number, isHeader = false) => {
    doc.rect(x, y, width, height);
    doc.setFont('Helvetica', isHeader ? 'bold' : 'normal');
    doc.text(text, x + 2, y + height - 2);
  };
  
  const cellWidth = (contentWidth - 10) / 2; // Adjusted for table within margins
  
  // Simplified table structure like the image
  drawCell("Día de Citación", col1X, yPos, cellWidth, rowHeight, true);
  drawCell("", col2X, yPos, cellWidth, rowHeight);
  yPos += rowHeight;
  drawCell("Hora", col1X, yPos, cellWidth, rowHeight, true);
  drawCell("", col2X, yPos, cellWidth, rowHeight);
  yPos += rowHeight;
  drawCell("N° de Radiografía", col1X, yPos, cellWidth, rowHeight, true);
  drawCell("", col2X, yPos, cellWidth, rowHeight);
  yPos += rowHeight;
  drawCell("N° de Placa", col1X, yPos, cellWidth, rowHeight, true);
  drawCell("", col2X, yPos, cellWidth, rowHeight);
  yPos += rowHeight * 2; // Extra space before next section

  doc.setFontSize(fieldValueFontSize); // Reset font size
  
  // Signature area
  const signatureLineY = yPos + 15;
  const signatureLineLength = 70;
  const signatureLineX = pageWidth - margin - signatureLineLength;
  
  doc.line(signatureLineX, signatureLineY, signatureLineX + signatureLineLength, signatureLineY);
  doc.setFontSize(fieldLabelFontSize);
  
  if (user.electronicSignature && user.electronicSignature.trim() !== '') {
    const signatureLines = user.electronicSignature.split('\n');
    let currentSignatureY = signatureLineY + 5;
    signatureLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            doc.text(trimmedLine, signatureLineX + (signatureLineLength / 2), currentSignatureY, { align: 'center' });
            currentSignatureY += smallLineSpacing;
        }
    });
  } else {
    // Fallback
    doc.text(user.fullName || "Dr(a). [Nombre Médico]", signatureLineX + (signatureLineLength / 2), signatureLineY + 5, { align: 'center' });
    doc.text("Médico Solicitante", signatureLineX + (signatureLineLength / 2), signatureLineY + 10, { align: 'center' });
  }
  yPos = signatureLineY + 15;

  // Footer notes
  doc.setFontSize(smallNoteFontSize);
  doc.text("NOTA: El resultado del examen debe ser retirado por el paciente en SOME.", margin, yPos);
  yPos += 4;
  doc.text("La radiografía debe tomarse antes de 48 horas, de lo contrario se considerará nula.", margin, yPos);

  await savePdf(doc, `Orden_Radiologica_${(data.nombrePaciente || 'Paciente').replace(/\\s+/g, '_')}.pdf`);
};

export const generateCertificadoEscolarPdf = async (data: CertificadoEscolarFormData, user: User): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const lineSpacing = 7;
  const baseFontSize = 12;

  let rodAsclepiusBase64: string;
  try {
    rodAsclepiusBase64 = await loadImageAsBase64(ROD_ASCLEPIUS_URL);
  } catch (e) {
    console.error("Failed to load watermark image for Certificado Escolar.", e);
    rodAsclepiusBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  
  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif')) {
    const watermarkImageWidth = 100;
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (doc.internal.pageSize.getHeight() - watermarkImageHeight) / 2; // Centered
    doc.saveGraphicsState(); // @ts-ignore
    const GState = doc.GState; // @ts-ignore
    if (GState) { doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 }));} // @ts-ignore
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState();
  }

  let yPos = margin + 10;

  // Header: CESFAM SAN JUAN - COQUIMBO
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("CESFAM SAN JUAN - COQUIMBO", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 1.5;

  // Title: CERTIFICADO ESCOLAR
  doc.setFontSize(18);
  doc.text("CERTIFICADO ESCOLAR", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 2;

  // Fecha del Documento
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(baseFontSize);
  const fechaEmision = formatDateForHeader(data.fechaDocumento);
  doc.text(fechaEmision, pageWidth - margin, yPos, { align: 'right' });
  yPos += lineSpacing * 2;

  // Certifico que
  const certificoText = `Certifico que ${data.nombrePaciente || '[Nombre Paciente]'} ha sido atendido(a) en este establecimiento de salud por presentar un cuadro de ${data.diagnostico || '[Diagnóstico]'}.`;
  const splitCertificoText = doc.splitTextToSize(certificoText, contentWidth);
  doc.text(splitCertificoText, margin, yPos);
  yPos += splitCertificoText.length * lineSpacing + lineSpacing;

  // Por lo cual, se indica:
  doc.setFont('Helvetica', 'bold');
  doc.text("POR LO CUAL, SE INDICA:", margin, yPos);
  yPos += lineSpacing;
  doc.setFont('Helvetica', 'normal');

  let atLeastOneOptionSelected = false;

  if (data.asistioCentroSalud) {
    doc.text("- Asistió al Centro de Salud.", margin + 5, yPos);
    yPos += lineSpacing;
    atLeastOneOptionSelected = true;
  }
  if (data.noRequiereReposo) {
    doc.text("- No requiere reposo.", margin + 5, yPos);
    yPos += lineSpacing;
    atLeastOneOptionSelected = true;
  }
  if (data.reposo) {
    const desde = formatDateToDDMMYYYY(data.reposoDesde);
    const hasta = formatDateToDDMMYYYY(data.reposoHasta);
    doc.text(`- Reposo desde el ${desde} hasta el ${hasta}.`, margin + 5, yPos);
    yPos += lineSpacing;
    atLeastOneOptionSelected = true;
  }
  if (data.noEducacionFisica) {
    const desde = formatDateToDDMMYYYY(data.noEducacionFisicaDesde);
    const hasta = formatDateToDDMMYYYY(data.noEducacionFisicaHasta);
    doc.text(`- No realizar Educación Física desde el ${desde} hasta el ${hasta}.`, margin + 5, yPos);
    yPos += lineSpacing;
    atLeastOneOptionSelected = true;
  }
  if (data.otro && data.otroDetalle.trim()) {
    const otroTextLines = doc.splitTextToSize(`- Otro: ${data.otroDetalle.trim()}`, contentWidth - 5); // -5 for indent
    doc.text(otroTextLines, margin + 5, yPos);
    yPos += otroTextLines.length * lineSpacing;
    atLeastOneOptionSelected = true;
  }

  if (!atLeastOneOptionSelected) {
     doc.text("- (No se especificaron indicaciones adicionales).", margin + 5, yPos);
     yPos += lineSpacing;
  }

  yPos += lineSpacing * 2; // Space before signature

  // Signature area
  const signatureLineY = yPos + 15; 
  const signatureLineLength = 70;
  const signatureLineX = (pageWidth - signatureLineLength) / 2;
  
  doc.line(signatureLineX, signatureLineY, signatureLineX + signatureLineLength, signatureLineY);
  doc.setFontSize(11);
  if (user.electronicSignature && user.electronicSignature.trim() !== '') {
    const signatureLines = user.electronicSignature.split('\n');
    let currentSignatureY = signatureLineY + 5;
    signatureLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            doc.text(trimmedLine, signatureLineX + (signatureLineLength / 2), currentSignatureY, { align: 'center' });
            currentSignatureY += lineSpacing * 0.8;
        }
    });
  } else {
    // Fallback
    doc.text(user.fullName, signatureLineX + (signatureLineLength / 2), signatureLineY + 5, { align: 'center' });
    let professionTitle = user.profession.charAt(0).toUpperCase() + user.profession.slice(1);
    if (professionTitle === 'Medicina') {
        professionTitle = 'Médico Cirujano';
    } else if (professionTitle === 'Enfermeria') {
        professionTitle = 'Enfermero/a';
    }
    doc.text(professionTitle, signatureLineX + (signatureLineLength / 2), signatureLineY + 10, { align: 'center' });
    if (user.rut) {
      doc.text(formatRutChilean(user.rut), signatureLineX + (signatureLineLength / 2), signatureLineY + 15, { align: 'center' });
    } else {
      doc.text(user.cesfam, signatureLineX + (signatureLineLength / 2), signatureLineY + 15, { align: 'center' });
    }
  }
  
  await savePdf(doc, `Certificado_Escolar_${(data.nombrePaciente || 'Paciente').replace(/\\s+/g, '_')}.pdf`);
};

export const generateDerivacionesPscvPdf = async (data: DerivacionesPscvFormData, user: User): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const lineSpacing = 6; // Slightly reduced line spacing
  const titleFontSize = 16;
  const headerFontSize = 10;
  const labelFontSize = 10;
  const valueFontSize = 10;
  const checkboxFontSize = 9;
  const checkboxIndent = 5;

  let rodAsclepiusBase64: string;
  try {
    rodAsclepiusBase64 = await loadImageAsBase64(ROD_ASCLEPIUS_URL);
  } catch (e) {
    console.error("Failed to load watermark image for Derivaciones.", e);
    rodAsclepiusBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  
  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif')) {
    const watermarkImageWidth = 100;
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (doc.internal.pageSize.getHeight() - watermarkImageHeight) / 2; // Centered
    doc.saveGraphicsState(); // @ts-ignore
    const GState = doc.GState; // @ts-ignore
    if (GState) { doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 }));} // @ts-ignore
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState();
  }

  let yPos = margin;

  // Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(headerFontSize);
  doc.text("CESFAM SAN JUAN", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 0.8;
  doc.setFont('Helvetica', 'normal');
  doc.text("DEPARTAMENTO DE SALUD", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 1.5;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(titleFontSize);
  doc.text("DERIVACIONES", pageWidth / 2, yPos, { align: 'center' });
  yPos += lineSpacing * 1.5;

  // Date
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(labelFontSize);
  doc.text(`Fecha: ${data.fecha}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += lineSpacing * 1.5;

  // Patient Info Section
  const patientInfoRectHeight = lineSpacing * 3.5;
  doc.setFillColor(230, 230, 230); // Light gray
  doc.rect(margin, yPos, contentWidth, patientInfoRectHeight, 'F');
  doc.setDrawColor(150, 150, 150);
  doc.rect(margin, yPos, contentWidth, patientInfoRectHeight, 'S');
  
  yPos += lineSpacing * 0.8; // Inner padding for text
  const halfContentWidth = contentWidth / 2;

  doc.setFont('Helvetica', 'bold');
  doc.text("Nombre:", margin + 5, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.text(data.nombrePaciente || '[Nombre Paciente]', margin + 5 + doc.getStringUnitWidth("Nombre:") * labelFontSize / doc.internal.scaleFactor + 2, yPos);
  
  doc.setFont('Helvetica', 'bold');
  doc.text("RUT:", margin + halfContentWidth, yPos);
  doc.setFont('Helvetica', 'normal');
  doc.text(formatRutChilean(data.rutPaciente) || '[RUT Paciente]', margin + halfContentWidth + doc.getStringUnitWidth("RUT:") * labelFontSize / doc.internal.scaleFactor + 2, yPos);
  yPos += lineSpacing * 1.5; // End of patient info box (approx)
  
  yPos += lineSpacing * 0.5; // Space after patient info box


  // Checkbox Section
  const checkboxOptions = [
    { key: 'ingresoCardiovascular', label: 'Ingreso cardiovascular (médico/a)' },
    { key: 'controlCardiovascular', label: 'Control cardiovascular (médico/a)' },
    { key: 'ingresoEcicep', label: 'Ingreso a ECICEP' },
    { key: 'controlNutricionista', label: 'Control con nutricionista' },
    { key: 'controlEnfermero', label: 'Control con enfermero/a' },
    { key: 'podologo', label: 'Podólogo/a' },
    { key: 'evaluacionPieDiabetico', label: 'Evaluación de pie diabético (enfermero/a)' },
    { key: 'empaEmpamEfam', label: 'EMPA/EMPAM/EFAM' },
    { key: 'poliChoque', label: 'Poli choque' },
    { key: 'pedirHoraMorbilidad', label: 'Pedir hora de morbilidad' },
    { key: 'electrocardiograma', label: 'Electrocardiograma' },
    { key: 'perfilPresionArterial', label: 'Perfil de presión arterial' },
  ];

  doc.setFontSize(checkboxFontSize);
  const numCheckboxes = checkboxOptions.length;
  const checkboxesPerColumn = Math.ceil(numCheckboxes / 2);
  const columnWidth = contentWidth / 2 - checkboxIndent;

  checkboxOptions.forEach((option, index) => {
    const col = index < checkboxesPerColumn ? 0 : 1;
    const row = index % checkboxesPerColumn;
    const x = margin + col * (columnWidth + checkboxIndent*2) + checkboxIndent;
    const currentY = yPos + row * lineSpacing * 1.2;

    doc.rect(x, currentY - 2.5, 3, 3); // Draw checkbox square
    if (data[option.key as keyof DerivacionesPscvFormData]) {
      doc.setFont('ZapfDingbats', 'normal'); // Or use a simple 'X'
      doc.text('4', x + 0.5, currentY -0.5); // Checkmark (ZapfDingbats checkmark)
      // doc.text('X', x + 0.8, currentY); // Alternative X
      doc.setFont('Helvetica', 'normal');
    }
    doc.text(option.label, x + 5, currentY);
  });

  yPos += checkboxesPerColumn * lineSpacing * 1.2 + lineSpacing; // Space after checkboxes

  // Observaciones
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(labelFontSize);
  doc.text("Observaciones:", margin, yPos);
  yPos += lineSpacing * 0.8;
  doc.setFont('Helvetica', 'normal');
  const observacionesLines = doc.splitTextToSize(data.observaciones || '(Sin observaciones)', contentWidth);
  doc.text(observacionesLines, margin + checkboxIndent, yPos);
  yPos += observacionesLines.length * lineSpacing * 0.8 + lineSpacing;

  // Signature area
  const signatureLineY = Math.max(yPos, doc.internal.pageSize.getHeight() - margin - 30); // Ensure it's not too high
  const signatureLineLength = 70;
  const signatureLineX = (pageWidth - signatureLineLength) / 2;
  
  doc.line(signatureLineX, signatureLineY, signatureLineX + signatureLineLength, signatureLineY);
  doc.setFontSize(10);
  if (user.electronicSignature && user.electronicSignature.trim() !== '') {
    const signatureLines = user.electronicSignature.split('\n');
    let currentSignatureY = signatureLineY + 5;
    signatureLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            doc.text(trimmedLine, signatureLineX + (signatureLineLength / 2), currentSignatureY, { align: 'center' });
            currentSignatureY += lineSpacing * 0.8;
        }
    });
  } else {
    // Fallback
    doc.text(user.fullName, signatureLineX + (signatureLineLength / 2), signatureLineY + 5, { align: 'center' });
    let professionTitle = user.profession.charAt(0).toUpperCase() + user.profession.slice(1);
    if (professionTitle === 'Medicina') {
        professionTitle = 'Médico Cirujano';
    } else if (professionTitle === 'Enfermeria') {
        professionTitle = 'Enfermero/a';
    }
    doc.text(professionTitle, signatureLineX + (signatureLineLength / 2), signatureLineY + 10, { align: 'center' });
    if (user.rut) {
      doc.text(formatRutChilean(user.rut), signatureLineX + (signatureLineLength / 2), signatureLineY + 15, { align: 'center' });
    }
  }

  await savePdf(doc, `Derivacion_PSCV_${(data.nombrePaciente || 'Paciente').replace(/\\s+/g, '_')}.pdf`);
};


export const generateOrdenLaboratorioPdf = async (data: OrdenLaboratorioFormData, loggedInUser: User): Promise<void> => {
  const now = new Date();
  const dateVal = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const timeVal = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 18;

  // Header Titles
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CORPORACIÓN MUNICIPAL GABRIEL GONZÁLEZ VIDELA', margin, currentY);
  currentY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CESFAM San Juan - Coquimbo', margin, currentY);
  doc.text(`Fecha Emisión: ${dateVal} ${timeVal}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;

  // Main Document Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEN DE EXÁMENES DE LABORATORIO', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  // Patient Info Box
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { fontSize: 9, font: 'helvetica', textColor: [0, 0, 0], cellPadding: 1.5 },
    body: [
      [
        { content: `Paciente: ${data.nombrePaciente || 'N/I'}`, styles: { fontStyle: 'bold' } },
        { content: `RUT: ${formatRutChilean(data.rutPaciente || '')}`, styles: { fontStyle: 'bold' } },
        { content: `NHC / Ficha: ${data.nhcPaciente || data.numeroFicha || 'N/I'}` }
      ],
      [
        { content: `Fecha Nac: ${formatDateToDDMMYYYY(data.fechaNacimiento)}` },
        { content: `Edad: ${data.edad || 'N/I'}` },
        { content: `Sexo: ${data.sexo || 'N/I'}` }
      ],
      [
        { content: `Dirección: ${data.direccion || 'N/I'}`, colSpan: 2 },
        { content: `Teléfono: ${data.telefono || 'N/I'}` }
      ],
      [
        { content: `Diagnóstico: ${data.diagnostico || 'CONTROL GENERAL DE SALUD DE RUTINA'}`, colSpan: 3, styles: { fontStyle: 'italic' } }
      ]
    ]
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Build Selected Examinations Table Rows
  const tableBody: string[][] = [];
  Object.keys(data).forEach(key => {
    if ((key.startsWith('hematologia_') || 
         key.startsWith('bioquimica_') ||
         key.startsWith('hormonas_') ||
         key.startsWith('orina_') ||
         key.startsWith('deposiciones_') ||
         key.startsWith('inmunologia_') ||
         key.startsWith('microbiologia_') ||
         key.startsWith('parasitologia_') ||
         key.startsWith('epilepsia_')) && data[key] === true) {
      
      const details = labTestDetails[key];
      if (details) {
        const code = details.code.startsWith('0') ? details.code.slice(1) : details.code;
        tableBody.push([
          code,
          details.group,
          details.label,
          'Normal',
          data.observacionesGlobales || ''
        ]);
      }
    }
  });

  if (tableBody.length === 0) {
    tableBody.push(['---', '---', 'Sin exámenes seleccionados', '---', '---']);
  }

  // Examinations autoTable
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['CÓDIGO', 'CATEGORÍA', 'EXAMEN SOLICITADO', 'PRIORIDAD', 'OBSERVACIONES']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8.5, lineColor: [0, 0, 0], lineWidth: 0.1 },
    bodyStyles: { fontSize: 8.5, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 45 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // Check page overflow for signatures
  if (currentY + 35 > 280) {
    doc.addPage();
    currentY = 30;
  }

  // Professional Signature block
  let profTitle = 'MÉDICO TRATANTE';
  if (loggedInUser.profession === 'enfermeria') profTitle = 'ENFERMERO/A TRATANTE';
  else if (loggedInUser.profession === 'nutricion') profTitle = 'NUTRICIONISTA TRATANTE';
  else if (loggedInUser.profession === 'matroneria') profTitle = 'MATRÓN/A TRATANTE';
  else if (loggedInUser.profession === 'kinesiologo') profTitle = 'KINESIÓLOGO TRATANTE';
  else if (loggedInUser.profession === 'psicologia') profTitle = 'PSICÓLOGO/A TRATANTE';
  else if (loggedInUser.profession === 'asistente_social') profTitle = 'ASISTENTE SOCIAL';

  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2 - 35, currentY, pageWidth / 2 + 35, currentY);
  currentY += 4;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(loggedInUser.fullName || 'PROFESIONAL RESPONSABLE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profTitle} - RUT: ${formatRutChilean(loggedInUser.rut || '')}`, pageWidth / 2, currentY, { align: 'center' });

  const safeFileName = `Orden_Laboratorio_${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_')}.pdf`;
  await savePdf(doc, safeFileName);
};

export const generateRecetaMedicaPdf = async (data: RecetaMedicaFormData, loggedInUser: User): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight(); // For watermark centering
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const lineSpacing = 7;
  const smallLineSpacing = 5;
  const titleFontSize = 16;
  const headerFontSize = 10;
  const labelFontSize = 10;
  const valueFontSize = 10;
  const rpFontSize = 11;

  let logoLeftBase64 = '', logoRightBase64 = '', rodAsclepiusBase64 = '';

  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif') && !rodAsclepiusBase64.startsWith('data:image/png;base64,iV')) {
    const watermarkImageWidth = 100; 
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (pageHeight - watermarkImageHeight) / 2;
    doc.saveGraphicsState(); // @ts-ignore
    const GState = doc.GState; // @ts-ignore
    if (GState) { doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 }));} // @ts-ignore
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState();
  }

  let yPos = margin;

  if (!data.hideLogos) {
    const logoHeight = 20;
    const logoWidth = 20;
    if (logoLeftBase64 && !logoLeftBase64.startsWith('data:image/gif') && !logoLeftBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoLeftBase64, 'PNG', margin, yPos, logoWidth, logoHeight);
    }
    if (logoRightBase64 && !logoRightBase64.startsWith('data:image/gif') && !logoRightBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoRightBase64, 'PNG', pageWidth - margin - logoWidth, yPos, logoWidth + 5, logoHeight); // Muni logo can be wider
    }
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.text("CESFAM SAN JUAN", pageWidth / 2, yPos + logoHeight / 3, { align: 'center' });
    doc.setFontSize(titleFontSize);
    doc.text("RECETA MÉDICA", pageWidth / 2, yPos + logoHeight / 3 + lineSpacing, { align: 'center' });
    yPos += logoHeight + lineSpacing * 1.5;
  } else {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(headerFontSize);
      doc.text("CESFAM SAN JUAN", pageWidth / 2, yPos + lineSpacing * 0.5, { align: 'center' });
      doc.setFontSize(titleFontSize);
      doc.text("RECETA MÉDICA", pageWidth / 2, yPos + lineSpacing * 1.5, { align: 'center' });
      yPos += lineSpacing * 3; // Approximate space if logos are hidden
  }
  
  // Date (Top Right)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(labelFontSize);
  const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Fecha: ${currentDate}`, pageWidth - margin - (doc.getStringUnitWidth(`Fecha: ${currentDate}`) * labelFontSize / doc.internal.scaleFactor), yPos);
  yPos += lineSpacing * 1.5;

  // Patient Info Box
  const patientBoxStartY = yPos;
  doc.setDrawColor(0); // Black border for box
  doc.setLineWidth(0.3);
  
  const patientInfoPairs = [
    { label: "Nombre:", value: data.nombrePaciente },
    { label: "RUT:", value: formatRutChilean(data.rutPaciente) },
    { label: "Dirección:", value: data.direccionPaciente },
    { label: "Edad:", value: data.edadPaciente || '(No especificada)' },
    { label: "Diagnóstico:", value: data.diagnostico },
  ];
  
  let patientInfoBoxHeight = smallLineSpacing * 0.5; // Initial padding
  patientInfoPairs.forEach(pair => {
      const valueLines = doc.splitTextToSize(pair.value, contentWidth - (doc.getStringUnitWidth(pair.label) * labelFontSize / doc.internal.scaleFactor) - 12); // 12 for indent and spacing
      patientInfoBoxHeight += valueLines.length * smallLineSpacing * 1.1;
  });
  patientInfoBoxHeight += smallLineSpacing * 0.5; // Bottom padding

  doc.rect(margin, patientBoxStartY, contentWidth, patientInfoBoxHeight);
  yPos += smallLineSpacing; // Inner padding for text

  patientInfoPairs.forEach(pair => {
    doc.setFont('Helvetica', 'bold');
    doc.text(pair.label, margin + 3, yPos);
    doc.setFont('Helvetica', 'normal');
    const valueX = margin + 3 + doc.getStringUnitWidth(pair.label) * labelFontSize / doc.internal.scaleFactor + 2;
    const valueMaxWidth = contentWidth - (valueX - margin) - 3; // 3 for right padding
    const valueLines = doc.splitTextToSize(pair.value, valueMaxWidth);
    doc.text(valueLines, valueX, yPos);
    yPos += valueLines.length * smallLineSpacing * 1.1;
  });
  yPos = patientBoxStartY + patientInfoBoxHeight + lineSpacing; // Ensure yPos is after the box

  // RP Section Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(titleFontSize - 2); // Slightly smaller title for RP
  doc.text("RP:", margin, yPos);
  yPos += lineSpacing * 0.8;

  // RP Content
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(rpFontSize);
  const rpLines = doc.splitTextToSize(data.rp, contentWidth - 5); // -5 for small indent
  const rpSectionHeight = rpLines.length * smallLineSpacing * 1.1;
  const minRpHeight = lineSpacing * 10; // Minimum height for RP section
  const actualRpHeight = Math.max(rpSectionHeight, minRpHeight);
  
  doc.setDrawColor(150); // Lighter border for RP content area
  doc.rect(margin, yPos, contentWidth, actualRpHeight); // Box for RP content
  doc.text(rpLines, margin + 2, yPos + smallLineSpacing*0.8); // Indent text inside box
  yPos += actualRpHeight + lineSpacing;

  // Signature Area
  const signatureYPos = Math.max(yPos, pageHeight - margin - 35); // Ensure it's at the bottom
  const signatureLineLength = 70;
  const signatureLineX = pageWidth - margin - signatureLineLength - 5; // Align to right with a small offset
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(0); // Black for signature line
  doc.line(signatureLineX, signatureYPos, signatureLineX + signatureLineLength, signatureYPos);
  
  doc.setFontSize(labelFontSize);
  
  if (loggedInUser.electronicSignature && loggedInUser.electronicSignature.trim() !== '') {
    const signatureLines = loggedInUser.electronicSignature.split('\n');
    let currentSignatureY = signatureYPos + 5; // Start 5mm below the signature line
    signatureLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Center each line individually under the signature line
        const lineWidth = doc.getStringUnitWidth(trimmedLine) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(trimmedLine, signatureLineX + (signatureLineLength / 2) - (lineWidth / 2), currentSignatureY);
        currentSignatureY += smallLineSpacing; // Move down for the next line (5mm)
      }
    });
  } else {
    // Fallback to old method if electronicSignature is not defined or is empty
    doc.text(loggedInUser.fullName, signatureLineX + (signatureLineLength / 2), signatureYPos + 5, { align: 'center' });
    doc.text("Médico Cirujano", signatureLineX + (signatureLineLength / 2), signatureYPos + 10, { align: 'center' });
    if (loggedInUser.rut) {
      doc.text(formatRutChilean(loggedInUser.rut), signatureLineX + (signatureLineLength / 2), signatureYPos + 15, { align: 'center' });
    }
  }
  
  const safeFileName = `Receta_Medica_${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_')}.pdf`;
  
  if (data.hideLogos) {
    await savePdf(doc, safeFileName);
  } else {
    const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") ? window.location.origin : '.';
    const bgUrl = `${baseUrl}/certificado_background.pdf`.replace('//certificado', '/certificado');
    await applyBackgroundAndSave(doc, bgUrl, safeFileName);
  }
};

export const generateCertificadoMedicoPdf = async (data: RecetaMedicaFormData, loggedInUser: User): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight(); // For watermark centering
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const lineSpacing = 7;
  const smallLineSpacing = 5;
  const titleFontSize = 16;
  const headerFontSize = 10;
  const labelFontSize = 10;
  const valueFontSize = 10;
  const rpFontSize = 11;

  let logoLeftBase64 = '', logoRightBase64 = '', rodAsclepiusBase64 = '';

  if (rodAsclepiusBase64 && !rodAsclepiusBase64.startsWith('data:image/gif') && !rodAsclepiusBase64.startsWith('data:image/png;base64,iV')) {
    const watermarkImageWidth = 100; 
    const watermarkImageHeight = 150; 
    const watermarkX = (pageWidth - watermarkImageWidth) / 2;
    const watermarkY = (pageHeight - watermarkImageHeight) / 2;
    doc.saveGraphicsState(); // @ts-ignore
    const GState = doc.GState; // @ts-ignore
    if (GState) { doc.setGState(new GState({ opacity: 0.07, "stroke-opacity": 0.07 }));} // @ts-ignore
    doc.addImage(rodAsclepiusBase64, 'PNG', watermarkX, watermarkY, watermarkImageWidth, watermarkImageHeight);
    doc.restoreGraphicsState();
  }

  let yPos = margin;

  if (!data.hideLogos) {
    const logoHeight = 20;
    const logoWidth = 20;
    if (logoLeftBase64 && !logoLeftBase64.startsWith('data:image/gif') && !logoLeftBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoLeftBase64, 'PNG', margin, yPos, logoWidth, logoHeight);
    }
    if (logoRightBase64 && !logoRightBase64.startsWith('data:image/gif') && !logoRightBase64.startsWith('data:image/png;base64,iV')) {
      doc.addImage(logoRightBase64, 'PNG', pageWidth - margin - logoWidth, yPos, logoWidth + 5, logoHeight); // Muni logo can be wider
    }
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.text("CESFAM SAN JUAN", pageWidth / 2, yPos + logoHeight / 3, { align: 'center' });
    doc.setFontSize(titleFontSize);
    doc.text("CERTIFICADO MÉDICO", pageWidth / 2, yPos + logoHeight / 3 + lineSpacing, { align: 'center' });
    yPos += logoHeight + lineSpacing * 1.5;
  } else {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(headerFontSize);
      doc.text("CESFAM SAN JUAN", pageWidth / 2, yPos + lineSpacing * 0.5, { align: 'center' });
      doc.setFontSize(titleFontSize);
      doc.text("CERTIFICADO MÉDICO", pageWidth / 2, yPos + lineSpacing * 1.5, { align: 'center' });
      yPos += lineSpacing * 3; // Approximate space if logos are hidden
  }
  
  // Date (Top Right)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(labelFontSize);
  const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Fecha: ${currentDate}`, pageWidth - margin - (doc.getStringUnitWidth(`Fecha: ${currentDate}`) * labelFontSize / doc.internal.scaleFactor), yPos);
  yPos += lineSpacing * 1.5;

  // Patient Info Box
  const patientBoxStartY = yPos;
  doc.setDrawColor(0); // Black border for box
  doc.setLineWidth(0.3);
  
  const patientInfoPairs = [
    { label: "Nombre:", value: data.nombrePaciente },
    { label: "RUT:", value: formatRutChilean(data.rutPaciente) },
    { label: "Dirección:", value: data.direccionPaciente },
    { label: "Edad:", value: data.edadPaciente || '(No especificada)' },
    { label: "Diagnóstico:", value: data.diagnostico },
  ];
  
  let patientInfoBoxHeight = smallLineSpacing * 0.5; // Initial padding
  patientInfoPairs.forEach(pair => {
      const valueLines = doc.splitTextToSize(pair.value, contentWidth - (doc.getStringUnitWidth(pair.label) * labelFontSize / doc.internal.scaleFactor) - 12); // 12 for indent and spacing
      patientInfoBoxHeight += valueLines.length * smallLineSpacing * 1.1;
  });
  patientInfoBoxHeight += smallLineSpacing * 0.5; // Bottom padding

  doc.rect(margin, patientBoxStartY, contentWidth, patientInfoBoxHeight);
  yPos += smallLineSpacing; // Inner padding for text

  patientInfoPairs.forEach(pair => {
    doc.setFont('Helvetica', 'bold');
    doc.text(pair.label, margin + 3, yPos);
    doc.setFont('Helvetica', 'normal');
    const valueX = margin + 3 + doc.getStringUnitWidth(pair.label) * labelFontSize / doc.internal.scaleFactor + 2;
    const valueMaxWidth = contentWidth - (valueX - margin) - 3; // 3 for right padding
    const valueLines = doc.splitTextToSize(pair.value, valueMaxWidth);
    doc.text(valueLines, valueX, yPos);
    yPos += valueLines.length * smallLineSpacing * 1.1;
  });
  yPos = patientBoxStartY + patientInfoBoxHeight + lineSpacing; // Ensure yPos is after the box

  // Content Area
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(rpFontSize);
  const rpLines = doc.splitTextToSize(data.rp, contentWidth - 5); // -5 for small indent
  const rpSectionHeight = rpLines.length * smallLineSpacing * 1.1;
  const minRpHeight = lineSpacing * 10; // Minimum height for RP section
  const actualRpHeight = Math.max(rpSectionHeight, minRpHeight);
  
  doc.setDrawColor(150); // Lighter border for RP content area
  doc.rect(margin, yPos, contentWidth, actualRpHeight); // Box for RP content
  doc.text(rpLines, margin + 2, yPos + smallLineSpacing*0.8); // Indent text inside box
  yPos += actualRpHeight + lineSpacing;

  // Signature Area
  const signatureYPos = Math.max(yPos, pageHeight - margin - 35); // Ensure it's at the bottom
  const signatureLineLength = 70;
  const signatureLineX = pageWidth - margin - signatureLineLength - 5; // Align to right with a small offset
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(0); // Black for signature line
  doc.line(signatureLineX, signatureYPos, signatureLineX + signatureLineLength, signatureYPos);
  
  doc.setFontSize(labelFontSize);
  
  if (loggedInUser.electronicSignature && loggedInUser.electronicSignature.trim() !== '') {
    const signatureLines = loggedInUser.electronicSignature.split('\n');
    let currentSignatureY = signatureYPos + 5; // Start 5mm below the signature line
    signatureLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Center each line individually under the signature line
        const lineWidth = doc.getStringUnitWidth(trimmedLine) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(trimmedLine, signatureLineX + (signatureLineLength / 2) - (lineWidth / 2), currentSignatureY);
        currentSignatureY += smallLineSpacing; // Move down for the next line (5mm)
      }
    });
  } else {
    // Fallback to old method if electronicSignature is not defined or is empty
    doc.text(loggedInUser.fullName, signatureLineX + (signatureLineLength / 2), signatureYPos + 5, { align: 'center' });
    doc.text("Médico Cirujano", signatureLineX + (signatureLineLength / 2), signatureYPos + 10, { align: 'center' });
    if (loggedInUser.rut) {
      doc.text(formatRutChilean(loggedInUser.rut), signatureLineX + (signatureLineLength / 2), signatureYPos + 15, { align: 'center' });
    }
  }
  
  const safeFileName = `Certificado_Medico_${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_')}.pdf`;
  
  if (data.hideLogos) {
    await savePdf(doc, safeFileName);
  } else {
    const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") ? window.location.origin : '.';
    const bgUrl = `${baseUrl}/certificado_background.pdf`.replace('//certificado', '/certificado');
    await applyBackgroundAndSave(doc, bgUrl, safeFileName);
  }
};

export const generateFichaConsultoriaPdf = async (data: FichaConsultoriaFormData, genogramaImageBase64: string | null): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  const FONT_SIZE_NORMAL = 9;
  const FONT_SIZE_TITLE = 11;
  const FONT_SIZE_MAIN_TITLE = 12;

  let y = MARGIN;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Main Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(FONT_SIZE_MAIN_TITLE);
  doc.text("FICHA CONSULTORÍA", PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  // --- Section I: ANTECEDENTES PERSONALES ---
  doc.setFontSize(FONT_SIZE_TITLE);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 7, 'S'); // Title box
  doc.text("I.- ANTECEDENTES PERSONALES", PAGE_WIDTH / 2, y + 5, { align: 'center' });
  y += 7;

  doc.setLineWidth(0.2);
  doc.setFontSize(FONT_SIZE_NORMAL);

  const PADDING_H = 2;
  const FIXED_ROW_HEIGHT = 5.25; 

  const tableRows = [
    [{ label: "Nombre", key: "nombre", colSpan: 2 }],
    [{ label: "Fecha de Ingreso", key: "fechaIngreso", colSpan: 2, isDate: true }],
    [{ label: "Fecha de Nac.", key: "fechaNac", colSpan: 1, isDate: true }, { label: "Edad", key: "edad", colSpan: 1 }],
    [{ label: "R.U.N.", key: "run", colSpan: 1, isRut: true }, { label: "HC Hospital", key: "hcHospital", colSpan: 1 }],
    [{ label: "Domicilio- Ciudad", key: "domicilioCiudad", colSpan: 2 }],
    [{ label: "Teléfonos", key: "telefonos", colSpan: 2 }],
    [{ label: "Previsión", key: "prevision", colSpan: 2 }],
    [{ label: "Nivel de educación", key: "nivelEducacion", colSpan: 2 }],
    [{ label: "Lugar de derivación", key: "lugarDerivacion", colSpan: 1 }, { label: "Canasta", key: "canasta", colSpan: 1 }],
    [{ label: "GES", key: "ges", colSpan: 1 }, { label: "Fecha I. Proceso Diagnóstico", key: "fechaProcesoDiagnostico", colSpan: 1, isDate: true }],
  ];

  const colWidth1 = CONTENT_WIDTH * 0.6;
  const colWidth2 = CONTENT_WIDTH * 0.4;

  const tableStartY = y;
  doc.line(MARGIN, tableStartY, MARGIN + CONTENT_WIDTH, tableStartY); // Top border of table
  
  for (const row of tableRows) {
    const maxRowHeight = FIXED_ROW_HEIGHT;

    checkPageBreak(maxRowHeight);
    
    const textY = y + (maxRowHeight / 2);

    let currentX = MARGIN;
    row.forEach((cell, index) => {
        const cellWidth = cell.colSpan === 2 ? CONTENT_WIDTH : (index === 0 ? colWidth1 : colWidth2);
        
        const value = data[cell.key as keyof FichaConsultoriaFormData] || '';
        let formattedValue = value;
        if (cell.isDate) formattedValue = formatDateToDDMMYYYY(value);
        if (cell.isRut) formattedValue = formatRutChilean(value);

        const labelText = `${cell.label}: `;
        const valueText = formattedValue;
        const labelWidth = doc.getStringUnitWidth(labelText) * FONT_SIZE_NORMAL / doc.internal.scaleFactor;
        const cellContentWidth = cellWidth - (PADDING_H * 2);
        
        const textOptions = { maxWidth: cellContentWidth, baseline: 'middle' as const };

        doc.setFont('Helvetica', 'bold');
        doc.text(labelText, currentX + PADDING_H, textY, textOptions);
        doc.setFont('Helvetica', 'normal');
        doc.text(valueText, currentX + PADDING_H + labelWidth, textY, { ...textOptions, maxWidth: cellContentWidth - labelWidth });
        
        currentX += cellWidth;
    });

    doc.line(MARGIN, y + maxRowHeight, MARGIN + CONTENT_WIDTH, y + maxRowHeight);
    
    if (row.length > 1) {
        doc.line(MARGIN + colWidth1, y, MARGIN + colWidth1, y + maxRowHeight);
    }
    y += maxRowHeight;
  }
  doc.line(MARGIN, tableStartY, MARGIN, y);
  doc.line(MARGIN + CONTENT_WIDTH, tableStartY, MARGIN + CONTENT_WIDTH, y);
  y += 8;
  
  const drawTitledBoxWithContent = (title: string | string[], content: string) => {
      const CONTENT_PADDING = 4;
      const CONTENT_LINE_HEIGHT = 5;
      const FONT_SIZE_IN_MM = FONT_SIZE_NORMAL / doc.internal.scaleFactor;
      
      const titleLines = (Array.isArray(title) ? title : [title]).map(t => t.toUpperCase());
      const titleLineHeight = (FONT_SIZE_TITLE / doc.internal.scaleFactor) * 1.15;
      const titlePaddingV = 3;
      const titleBoxHeight = titleLines.length * titleLineHeight + (titlePaddingV * 2);

      checkPageBreak(titleBoxHeight + CONTENT_LINE_HEIGHT + CONTENT_PADDING); 

      const titleBoxY = y;
      doc.rect(MARGIN, titleBoxY, CONTENT_WIDTH, titleBoxHeight, 'S');
      doc.setFontSize(FONT_SIZE_TITLE).setFont('Helvetica', 'bold');
      const titleTextY = titleBoxY + titlePaddingV + titleLineHeight * 0.8;
      doc.text(titleLines, PAGE_WIDTH / 2, titleTextY, { align: 'center' });
      y += titleBoxHeight;

      doc.setFontSize(FONT_SIZE_NORMAL).setFont('Helvetica', 'normal');
      const contentText = content.trim() || '(Sin información)';
      const lines = doc.splitTextToSize(contentText, CONTENT_WIDTH - (CONTENT_PADDING * 2));
      
      let boxStartY = y;
      let remainingLines = [...lines];

      while (remainingLines.length > 0) {
        const availableHeight = PAGE_HEIGHT - MARGIN - y;
        const linesThatFit = Math.floor((availableHeight - (CONTENT_PADDING * 2)) / CONTENT_LINE_HEIGHT);

        if (linesThatFit <= 0) {
            doc.addPage();
            y = MARGIN;
            boxStartY = y;
            continue;
        }

        const linesToDraw = remainingLines.splice(0, linesThatFit);
        const segmentHeight = (linesToDraw.length * CONTENT_LINE_HEIGHT) + (CONTENT_PADDING * 2);
        
        doc.rect(MARGIN, boxStartY, CONTENT_WIDTH, segmentHeight, 'S');
        
        let lineY = boxStartY + CONTENT_PADDING + FONT_SIZE_IN_MM;
        for(const line of linesToDraw) {
            doc.text(line, MARGIN + CONTENT_PADDING, lineY);
            lineY += CONTENT_LINE_HEIGHT;
        }

        y = boxStartY + segmentHeight;

        if (remainingLines.length > 0) {
            doc.addPage();
            y = MARGIN;
            boxStartY = y;
        }
      }
      
      y += 8;
  };

  {
    const CONTENT_PADDING = 4;
    const CONTENT_LINE_HEIGHT = 5;
    const FONT_SIZE_IN_MM = FONT_SIZE_NORMAL / doc.internal.scaleFactor;
    
    const titleLines = ["II.- GENOGRAMA"];
    const titleLineHeight = (FONT_SIZE_TITLE / doc.internal.scaleFactor) * 1.15;
    const titlePaddingV = 3;
    const titleBoxHeight = titleLines.length * titleLineHeight + (titlePaddingV * 2);

    checkPageBreak(titleBoxHeight);

    doc.rect(MARGIN, y, CONTENT_WIDTH, titleBoxHeight, 'S');
    doc.setFontSize(FONT_SIZE_TITLE).setFont('Helvetica', 'bold');
    const titleTextY = y + titlePaddingV + titleLineHeight * 0.8;
    doc.text(titleLines, PAGE_WIDTH / 2, titleTextY, { align: 'center' });
    y += titleBoxHeight;

    let totalContentHeight = CONTENT_PADDING;
    let imgHeight = 0;
    let imgWidth = 0;
    if (genogramaImageBase64) {
        const imageMaxHeight = 80;
        const imgProps = doc.getImageProperties(genogramaImageBase64);
        const aspectRatio = imgProps.width / imgProps.height;
        imgWidth = CONTENT_WIDTH - (CONTENT_PADDING * 2);
        imgHeight = imgWidth / aspectRatio;
        if (imgHeight > imageMaxHeight) {
            imgHeight = imageMaxHeight;
            imgWidth = imgHeight * aspectRatio;
        }
        totalContentHeight += imgHeight + CONTENT_PADDING;
    }

    const descriptionText = data.genogramaDescripcion.trim() || '(Sin información)';
    const descriptionLines = doc.splitTextToSize(descriptionText, CONTENT_WIDTH - (CONTENT_PADDING * 2));
    if (descriptionLines.length > 0 && (descriptionLines[0] !== '(Sin información)' || !genogramaImageBase64)) {
        totalContentHeight += (descriptionLines.length * CONTENT_LINE_HEIGHT);
    }
    totalContentHeight += CONTENT_PADDING;

    checkPageBreak(totalContentHeight);
    doc.rect(MARGIN, y, CONTENT_WIDTH, totalContentHeight, 'S');
    let contentY = y + CONTENT_PADDING;
    
    if (genogramaImageBase64 && imgHeight > 0) {
        const imgX = MARGIN + (CONTENT_WIDTH - imgWidth) / 2;
        doc.addImage(genogramaImageBase64, 'PNG', imgX, contentY, imgWidth, imgHeight);
        contentY += imgHeight + CONTENT_PADDING;
    }
    
    doc.setFontSize(FONT_SIZE_NORMAL).setFont('Helvetica', 'normal');
    if (descriptionLines.length > 0 && (descriptionLines[0] !== '(Sin información)' || !genogramaImageBase64)) {
        contentY += FONT_SIZE_IN_MM;
        for (const line of descriptionLines) {
            doc.text(line, MARGIN + CONTENT_PADDING, contentY);
            contentY += CONTENT_LINE_HEIGHT;
        }
    }

    y += totalContentHeight;
  }
  y += 8;
  
  drawTitledBoxWithContent("III.- MOTIVO DE CONSULTA", data.motivoConsulta);
  drawTitledBoxWithContent("IV.- IMPRESIÓN CLÍNICA (SÍNTOMAS PRINCIPALES, ANAMNESIS)", data.impresionClinica);
  drawTitledBoxWithContent(
    ["V.- ANTECEDENTES MÓRBIDOS RELEVANTES PERSONALES Y FAMILIARES", "(TRATAMIENTOS ANTERIORES Y ACTUAL)"],
    data.antecedentesMorbidos
  );
  drawTitledBoxWithContent("VI.- HIPÓTESIS DIAGNÓSTICA (EJES)", data.hipotesisDiagnostica);
  drawTitledBoxWithContent("VII.- PLAN DE TRATAMIENTO PROPUESTO (MÉDICO, PSICÓLOGO, OTROS)", data.planTratamiento);
  drawTitledBoxWithContent("VIII.- EVOLUCIÓN DURANTE EL PERIODO DE TRATAMIENTO", data.evolucionTratamiento);

  const ixContent = `${data.motivoConsultoria || ''}\n\n1.- Equipo Responsable del Caso: ${data.equipoResponsable || ''}\n2.- Equipo de Consultoría: ${data.equipoConsultoria || ''}`;
  drawTitledBoxWithContent("IX.- MOTIVO DE CONSULTORÍA", ixContent);

  await savePdf(doc, `Ficha_Consultoria.pdf`);
};

export const generateFichaConsultoriaWord = async (data: FichaConsultoriaFormData, genogramaImageBase64: string | null): Promise<void> => {
    const tableCellStyle = "border: 1px solid black; padding: 5px; font-family: 'Times New Roman', Times, serif; font-size: 10pt; vertical-align: top;";
    const titleCellStyle = "border: 1px solid black; padding: 5px; font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-weight: bold; text-align: center;";
    const contentCellStyle = "border: 1px solid black; padding: 8px; font-family: 'Times New Roman', Times, serif; font-size: 10pt; min-height: 40px; white-space: pre-wrap;";

    const TitledBox = (title: string, content: string, multiLineTitle: string[] = []) => {
        const titleContent = multiLineTitle.length > 0 ? multiLineTitle.join('<br/>') : title;
        const processedContent = content.trim() ? content.replace(/\n/g, '<br/>') : '(Sin información)';
        return `
            <table style="width:100%; border-collapse: collapse; margin-bottom: 8px;" border="1">
                <tr><td style="${titleCellStyle}">${titleContent}</td></tr>
                <tr><td style="${contentCellStyle}">${processedContent}</td></tr>
            </table>`;
    };

    const genogramaBox = () => {
        const imageHtml = genogramaImageBase64 ? `<p style="text-align:center;"><img src="${genogramaImageBase64}" style="max-width:90%; height:auto;" /></p>` : '';
        const descriptionHtml = data.genogramaDescripcion.trim() ? data.genogramaDescripcion.replace(/\n/g, '<br/>') : (genogramaImageBase64 ? '' : '(Sin información)');
        const content = imageHtml + descriptionHtml;
        return TitledBox('II.- GENOGRAMA', content);
    };

    const ixContent = `${data.motivoConsultoria || ''}\n\n1.- Equipo Responsable del Caso: ${data.equipoResponsable || ''}\n2.- Equipo de Consultoría: ${data.equipoConsultoria || ''}`;
    
    const htmlBody = `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; max-width: 800px; margin: auto;">
            <h1 style="text-align: center; font-size: 14pt; font-weight: bold;">FICHA CONSULTORÍA</h1>
            <br/>
            
            <table style="width:100%; border-collapse: collapse; margin-bottom: 8px;" border="1">
                <tr><td colspan="2" style="${titleCellStyle}">I.- ANTECEDENTES PERSONALES</td></tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Nombre:</strong> ${data.nombre || ''}</td></tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Fecha de Ingreso:</strong> ${formatDateToDDMMYYYY(data.fechaIngreso) || ''}</td></tr>
                <tr>
                    <td style="${tableCellStyle} width: 60%;"><strong>Fecha de Nac.:</strong> ${formatDateToDDMMYYYY(data.fechaNac) || ''}</td>
                    <td style="${tableCellStyle} width: 40%;"><strong>Edad:</strong> ${data.edad || ''}</td>
                </tr>
                <tr>
                    <td style="${tableCellStyle}"><strong>R.U.N.:</strong> ${formatRutChilean(data.run) || ''}</td>
                    <td style="${tableCellStyle}"><strong>HC Hospital:</strong> ${data.hcHospital || ''}</td>
                </tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Domicilio- Ciudad:</strong> ${data.domicilioCiudad || ''}</td></tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Teléfonos:</strong> ${data.telefonos || ''}</td></tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Previsión:</strong> ${data.prevision || ''}</td></tr>
                <tr><td colspan="2" style="${tableCellStyle}"><strong>Nivel de educación:</strong> ${data.nivelEducacion || ''}</td></tr>
                <tr>
                    <td style="${tableCellStyle}"><strong>Lugar de derivación:</strong> ${data.lugarDerivacion || ''}</td>
                    <td style="${tableCellStyle}"><strong>Canasta:</strong> ${data.canasta || ''}</td>
                </tr>
                <tr>
                    <td style="${tableCellStyle}"><strong>GES:</strong> ${data.ges || ''}</td>
                    <td style="${tableCellStyle}"><strong>Fecha I. Proceso Diagnóstico:</strong> ${formatDateToDDMMYYYY(data.fechaProcesoDiagnostico) || ''}</td>
                </tr>
            </table>

            ${genogramaBox()}
            ${TitledBox('III.- MOTIVO DE CONSULTA', data.motivoConsulta)}
            ${TitledBox('IV.- IMPRESIÓN CLÍNICA (SÍNTOMAS PRINCIPALES, ANAMNESIS)', data.impresionClinica)}
            ${TitledBox('', data.antecedentesMorbidos, ["V.- ANTECEDENTES MÓRBIDOS RELEVANTES PERSONALES Y FAMILIARES", "(TRATAMIENTOS ANTERIORES Y ACTUAL)"])}
            ${TitledBox('VI.- HIPÓTESIS DIAGNÓSTICA (EJES)', data.hipotesisDiagnostica)}
            ${TitledBox('VII.- PLAN DE TRATAMIENTO PROPUESTO (MÉDICO, PSICÓLOGO, OTROS)', data.planTratamiento)}
            ${TitledBox('VIII.- EVOLUCIÓN DURANTE EL PERIODO DE TRATAMIENTO', data.evolucionTratamiento)}
            ${TitledBox('IX.- MOTIVO DE CONSULTORÍA', ixContent)}
        </div>
    `;

    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ficha Consultoría - ${data.nombre || 'Paciente'}</title>
            <meta name=ProgId content=Word.Document>
            <meta name=Generator content="Microsoft Word 15">
            <meta name=Originator content="Microsoft Word 15">
            <xml>
                <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                </w:WordDocument>
            </xml>
        </head>
        <body>
            ${htmlBody}
        </body>
        </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ficha_Consultoria_${(data.nombre || 'paciente').replace(/ /g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const generateEcicepResumenPdf = async (data: any, user: User): Promise<void> => {
    try {
        // En Electron (file://), la ruta a los assets en public requiere ser relativa. En web (http://), absoluto funciona.
        const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") 
           ? window.location.origin 
           : '.';
        const url = `${baseUrl}/base_ecicep.pdf`.replace('//base', '/base'); // ensure no double slash

        let existingPdfBytes;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} al cargar plantilla`);
            existingPdfBytes = await res.arrayBuffer();
        } catch (fetchErr) {
            console.error("Error fetching PDF template:", fetchErr);
            throw new Error(`No se pudo cargar la plantilla PDF (base_ecicep.pdf). Intente recargar la página. Detalle: ${fetchErr}`);
        }

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        const titleText = `RESUMEN DE ATENCIÓN ECICEP ${formattedDate}`;
        
        // Helper to wrap text robustly
        const drawWrappedText = (text: string, x: number, y: number, font: any, size: number, maxWidth: number) => {
            if (!text || typeof text !== 'string') text = 'No ingresado';
            
            const words = text.split(' ');
            let line = '';
            let currentY = y;
            for (let i = 0; i < words.length; i++) {
                const word = words[i].replace(/\n/g, ''); // ignore internal newlines for horizontal breaks
                const testLine = line + word + ' ';
                const testWidth = font.widthOfTextAtSize(testLine, size);
                if (testWidth > maxWidth && i > 0) {
                    firstPage.drawText(line, { x, y: currentY, size, font, color: rgb(0,0,0) });
                    line = word + ' ';
                    currentY -= (size + 4);
                } else {
                    line = testLine;
                }
            }
            if (line.trim()) {
                firstPage.drawText(line, { x, y: currentY, size, font, color: rgb(0,0,0) });
                currentY -= (size + 4);
            }
            return currentY;
        };

        const marginX = 50;
        const availableWidth = width - (marginX * 2);
        let startY = height - 120; // Title offset

        firstPage.drawText(titleText, {
            x: width / 2 - (helveticaBold.widthOfTextAtSize(titleText, 14) / 2),
            y: startY,
            size: 14,
            font: helveticaBold,
            color: rgb(0.04, 0.4, 0.61), // sky-700 approx
        });
        startY -= 30;

        const getVal = (val: any) => (val === undefined || val === null || String(val).trim() === '') ? 'No ingresado' : String(val);

        // Metricas
        const metricasLine = `Peso: ${getVal(data.peso)} kg    Talla: ${getVal(data.talla)} cm    IMC: ${getVal(data.imc)} kg/m2    P.A: ${getVal(data.pa)} mmHg    F.C: ${getVal(data.fc)} lpm`;
        firstPage.drawText(metricasLine, {
            x: marginX,
            y: startY,
            size: 10,
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });
        startY -= 35;

        // Titulo PCI
        firstPage.drawText(`PLAN DE CUIDADO INTEGRAL (PCI) Y TOMA DE DECISIONES COMPARTIDAS:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
        startY -= 20;

        // Problemas 
        firstPage.drawText(`PROBLEMAS VISUALIZADOS:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
        startY -= 15;
        startY = drawWrappedText(`Persona y familia: ${getVal(data.pccPersonaFamilia)}`, marginX, startY, helveticaFont, 10, availableWidth);
        startY -= 5;
        startY = drawWrappedText(`Equipo de salud: ${getVal(data.pccEquipoSalud)}`, marginX, startY, helveticaFont, 10, availableWidth);
        startY -= 15;

        // Priorizacion Problemas
        firstPage.drawText(`PRIORIZACIÓN DE PROBLEMAS:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
        startY -= 15;
        startY = drawWrappedText(getVal(data.tomaDecisionesCompartidas), marginX, startY, helveticaFont, 10, availableWidth);
        startY -= 15;
        
        if (data.opcionesConversadas) {
            firstPage.drawText(`OPCIONES CONVERSADAS:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
            startY -= 15;
            startY = drawWrappedText(getVal(data.opcionesConversadas), marginX, startY, helveticaFont, 10, availableWidth);
            startY -= 15;
        }

        // Priorizacion Objetivos
        firstPage.drawText(`PRIORIZACION DE OBJETIVOS, DIMENSIONES Y METAS:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
        startY -= 15;

        const objetivos: PccObjetivo[] = data.pccObjetivos || [];
        if (objetivos.length === 0) {
            startY = drawWrappedText(`No hay objetivos registrados.`, marginX, startY, helveticaFont, 10, availableWidth);
        } else {
            for (let i = 0; i < objetivos.length; i++) {
                const obj = objetivos[i];
                firstPage.drawText(`OBJETIVO/META #${i + 1}: ${getVal(obj.objetivo)}`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
                startY -= 15;
                startY = drawWrappedText(`Acuerdo: ${getVal(obj.acuerdo)}`, marginX + 10, startY, helveticaFont, 10, availableWidth - 10);
                startY -= 5;
                startY = drawWrappedText(`Acciones específicas: ${getVal(obj.acciones)}`, marginX + 10, startY, helveticaFont, 10, availableWidth - 10);
                startY -= 10;
            }
        }
        startY -= 10;
        
        // Plan Adicional
        if (data.indicaciones?.trim()) {
            firstPage.drawText(`PLAN ADICIONAL / DETALLES:`, { x: marginX, y: startY, size: 10, font: helveticaBold, color: rgb(0, 0, 0) });
            startY -= 15;
            
            const lines = data.indicaciones.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                const bulletLine = trimmedLine.startsWith('-') ? trimmedLine : `- ${trimmedLine}`;
                startY = drawWrappedText(bulletLine, marginX, startY, helveticaFont, 10, availableWidth);
            }
            startY -= 15;
        }

        // Proximo control
        const propControlText = `PRÓXIMO CONTROL EN ${getVal(data.planProximoControlTiempo)} CON MÉDICO + ${getVal(data.planProximoControlDupla)}`.toUpperCase();
        firstPage.drawText(propControlText, {
            x: marginX,
            y: startY,
            size: 14, // Fuente un poco mas grande (14 vs 10/11)
            font: helveticaBold,
            color: rgb(0, 0, 0),
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const safeFileName = `Resumen_ECICEP_${(data.nombrePaciente || 'Paciente').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_')}.pdf`;
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        
        openPdfInNewTab(blob, safeFileName);
        
    } catch (err: any) {
        console.error("Error generating ECICEP Resumen", err);
        alert(`Ocurrió un error al generar el PDF de resumen.\n\nDetalle técnico: ${err.message}`);
    }
};

export const generateGesPdf = async (data: any, user: User): Promise<void> => {
    try {
        const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") 
           ? window.location.origin 
           : '.';
        const url = `${baseUrl}/formulario_ges.pdf`.replace('//form', '/form');

        let existingPdfBytes;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} al cargar plantilla`);
            existingPdfBytes = await res.arrayBuffer();
        } catch (fetchErr) {
            console.error("Error fetching PDF template:", fetchErr);
            throw new Error(`No se pudo cargar la plantilla GES (formulario_ges.pdf). Detalle: ${fetchErr}`);
        }

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        
        // Función ayudante para calcular fácilmente posiciones ajustables
        const drawField = (text: string, x: number, y: number, isXs = false) => {
            if (!text) return;
            firstPage.drawText(text, {
                x, 
                y, 
                size: isXs ? 14 : 9, 
                font: isXs ? helveticaBold : helveticaFont, 
                color: rgb(0,0,0)
            });
        };

        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        /* =========================================
           COORDENADAS MATRIX EXACTAS (Calculadas sobre Baseline)
        ========================================= */
        
        // 1. Datos del Establecimiento
        drawField(data.institucion, 260, 700); // Institución (Más a la derecha y un poco más arriba)
        drawField(data.direccionEstablecimiento, 98, 673); // Mueve a la derecha
        drawField('Coquimbo', 434, 670); // Ciudad (Derecha un poquitito)
        drawField(data.notificaNombre, 188, 648); // Nombre Notifica (Derecha un poquito)
        drawField(data.notificaRut, 70, 623); // RUN Notifica (Izquierda un poquitito)

        // 2. Antecedentes del/la Paciente
        drawField(data.nombreLegal, 120, 576); // Sube
        drawField(data.nombreSocial, 120, 551); // Sube
        drawField(data.rut, 70, 523); // RUN Paciente (Izquierda un poquitito)
        
        // Fonasa / Isapre
        if (data.prevision === 'FONASA') drawField('X', 390, 523, true); // Sube
        if (data.prevision === 'ISAPRE') drawField('X', 455, 523, true); // Sube
        
        drawField(data.direccion, 100, 501); // Dirección derecha
        drawField(data.comuna, 425, 501); // Comuna alineada a correo
        drawField('Coquimbo', 80, 476); // Región
        drawField(data.telefono, 237, 476); // Teléfono (Izquierda un poquitito)
        drawField(data.correo, 425, 476); // Correo derecha

        // 3. Información Médica
        if (data.tipoGes === 'GENERAL' && data.gesProblema) {
            drawField(data.gesProblema, 160, 432); // Sube un poquitito
            drawField('X', 160, 401, true); // Confirmación General Sube
        } else if (data.tipoGes === 'ONCOLOGICO' && data.gesOncologicoProblema) {
            drawField(data.gesOncologicoProblema, 210, 350);
            if (data.oncoSospecha) drawField('X', 110, 325, true);
            if (data.oncoConfirmacion) drawField('X', 210, 325, true);
            if (data.oncoEtapificacion) drawField('X', 310, 325, true);
            if (data.oncoTratamiento) drawField('X', 410, 325, true);
            if (data.oncoSeguimiento) drawField('X', 490, 325, true);
            if (data.oncoRehabilitacion) drawField('X', 570, 325, true);
        }

        // Tipo de atención
        drawField('X', 235, 304, true); // Presencial X Sube un poquitito

        // Fecha y Hora de Notificación
        const datetimeStr = `${formattedDate}  -  ${formattedTime} hrs.`;
        drawField(datetimeStr, 180, 235); // Sube +3

        // 4. Representante Legal (Abajo)
        if (data.isMenorEdad) {
            drawField(data.repNombre, 110, 105);
            drawField(data.repRut, 440, 105);
            drawField(data.repTelefono, 110, 75);
            drawField(data.repCorreo, 300, 75);
        } 
        
        const pdfBytes = await pdfDoc.save();
        const safeFileName = `Constancia_GES_${(data.nombreLegal || 'Paciente').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_')}.pdf`;
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        openPdfInNewTab(blob, safeFileName);

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = safeFileName;
        link.click();
        
    } catch (err: any) {
        console.error("Error generating GES PDF", err);
        alert(`Ocurrió un error al generar la Constancia GES.\n\nDetalle técnico: ${err.message}`);
    }
};

export const generateFichaVdiPdf = async (
  data: any,
  user: User,
  anamnesisText: string,
  exploracionText: string,
  actuacionText: string
): Promise<void> => {
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        const topMargin = 60;
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 40;

        const addText = (text: string, fontSize: number, isBold: boolean = false) => {
            doc.setFontSize(fontSize);
            doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
            
            const lines = doc.splitTextToSize(String(text || ''), pageWidth - 2 * margin);
            
            for (let idx = 0; idx < lines.length; idx++) {
                if (currentY > 275) {
                    doc.addPage();
                    currentY = topMargin;
                }
                doc.text(lines[idx], margin, currentY);
                currentY += 5;
            }
            currentY += 2;
        };

    // [TÍTULO]
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Pauta Visita Domiciliaria Integral (VDI)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
    doc.text('CESFAM San Juan', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Bullets (Arial 12)
    addText(`- Sector: ${data.sector || ''}`, 12);
    addText(`- Dirección: ${data.direccion || ''}`, 12);
    addText(`- Funcionario(s) que realizan la VDI: ${data.prestadores || ''}`, 12);
    addText(`- Funcionario(s) que deriva(n) el caso índice: ${data.derivadoPor || ''}`, 12);
    addText(`- Familia: ${data.familia || ''}`, 12);

    let viaTexto = '';
    if (data.viaDerivacion === 'Correo') viaTexto = 'Sí';
    else if (data.viaDerivacion === 'Otra') viaTexto = `No (Aclaración: ${data.viaDerivacionAclare})`;
    addText(`- ¿Se recibió la derivación del caso por correo? ${viaTexto}`, 12);
    
    addText(`- Fecha de realización de la VDI: ${data.fechaVdi || ''}`, 12);
    addText(`- Fecha de realización de pauta VDI: ${data.fechaPautaVdi || ''}`, 12);
    currentY += 5;

    // 1. Integrantes
    addText('1. Integrantes del grupo familiar que participan en la entrevista', 12, true);
    const integrantesBody = data.integrantes?.length > 0 
        ? data.integrantes.map((int: any) => [int.nombre || '', int.edad || '', int.parentesco || ''])
        : [['', '', '']];
    
    if (currentY > 260) { doc.addPage(); currentY = topMargin; }
    autoTable(doc, {
        startY: currentY,
        margin: { top: topMargin, left: margin, right: margin },
        head: [['Nombre', 'Edad', 'Vínculo con el caso índice']],
        body: integrantesBody,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' }
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 2. Objetivos
    addText('2. Objetivo(s) de la VDI (plan de intervención familiar)', 12, true);
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    (data.objetivos || []).forEach((obj: string, idx: number) => {
        if (obj.trim() !== '') {
            addText(`${alpha[idx]}) ${obj}`, 12);
        }
    });
    currentY += 5;

    // 3. Expectativas
    addText('3. Expectativas de la familia frente a la visita', 12, true);
    addText(data.expectativasFamilia || ' ', 12);
    currentY += 5;

    // 4. Antecedentes del cuidador
    addText('4. Antecedentes del cuidador', 12, true);
    addText(`- Cuidador principal: ${data.cuidadorPrincipal || ''}`, 12);
    addText(`- Edad del cuidador: ${data.cuidadorEdad || ''}`, 12);
    addText(`- Enfermedades: ${data.cuidadorEnfermedades || ''}`, 12);
    currentY += 5;

    // 5. Vivienda y entorno
    addText('5. Vivienda y entorno', 12, true);
    addText('Tenencia (determinar SI/NO y si existe alguna observación)', 12);
    if (currentY > 250) { doc.addPage(); currentY = topMargin; }
    autoTable(doc, {
        startY: currentY,
        margin: { top: topMargin, left: margin, right: margin },
        body: [
            ['Propia', data.viviendaTenencia === 'Propia' ? `SÍ. ${data.viviendaTenenciaObs || ''}` : 'NO'],
            ['Arrendada', data.viviendaTenencia === 'Arrendada' ? `SÍ. ${data.viviendaTenenciaObs || ''}` : 'NO'],
            ['Allegado', data.viviendaTenencia === 'Allegado' ? `SÍ. ${data.viviendaTenenciaObs || ''}` : 'NO'],
            ['Otras', data.viviendaTenencia === 'Otras' ? `SÍ. ${data.viviendaTenenciaObs || ''}` : 'NO'],
            ['Observaciones', data.viviendaTenenciaObs || '']
        ],
        theme: 'grid',
        styles: { textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' }
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;

    addText(`Problemas y/o riesgos de la vivienda percibidos por la familia:`, 12);
    addText(data.problemasViviendaFamilia || ' ', 12);
    currentY += 5;

    addText(`Problemas y/o riesgos de la vivienda percibidos por el equipo:`, 12);
    addText(data.problemasViviendaEquipo || ' ', 12);
    currentY += 5;

    addText('Servicios disponibles (Determinar SI/NO y si existe alguna observación)', 12);
    if (currentY > 250) { doc.addPage(); currentY = topMargin; }
    autoTable(doc, {
        startY: currentY,
        margin: { top: topMargin, left: margin, right: margin },
        body: [
            ['Sistema de agua potable', data.serviciosAguaPotable ? `SÍ. ${data.serviciosObs || ''}` : 'NO'],
            ['Sistema eléctrico', data.serviciosSistemaElectrico ? `SÍ. ${data.serviciosObs || ''}` : 'NO'],
            ['Sistema de disposición de desechos', data.serviciosDisposicionDesechos ? `SÍ. ${data.serviciosObs || ''}` : 'NO'],
            ['Observaciones', data.serviciosObs || '']
        ],
        theme: 'grid',
        styles: { textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' },
        columnStyles: { 0: { cellWidth: 80 } }
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 6. Análisis y priorización
    addText('6. Análisis y priorización de problemas', 12, true);
    const probsBody = data.problemasPriorizados?.length > 0 
        ? data.problemasPriorizados.map((p: any) => [p.problema || '', '', '', '', '', p.puntaje || ''])
        : [['', '', '', '', '', '']];

    if (currentY > 250) { doc.addPage(); currentY = topMargin; }
    autoTable(doc, {
        startY: currentY,
        margin: { top: topMargin, left: margin, right: margin },
        head: [['Listado de problemas', 'Urgencia de trabajar', 'Viabilidad', 'Período de resolución', 'Grado de dificultad para APS', 'Total']],
        body: probsBody,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' },
        bodyStyles: { textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' }
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 7. Recursos
    addText('7. Identificación de los recursos', 12, true);
    addText(`A) Personales: ${data.recursosPersonales || ''}`, 12);
    addText(`B) Materiales: ${data.recursosMateriales || ''}`, 12);
    addText(`C) Funcionales: ${data.recursosFuncionales || ''}`, 12);
    addText(`D) Otros: ${data.recursosOtros || ''}`, 12);
    currentY += 5;

    // 8. Intervenciones
    addText('8. ¿Existen otras intervenciones del intersector?', 12, true);
    addText(`SÍ (aclare): ${data.otrasIntervenciones === 'Sí' ? data.otrasIntervencionesAclare || '' : ''}`, 12);
    addText(`NO: ${data.otrasIntervenciones === 'No' ? 'X' : ''}`, 12);
    currentY += 5;

    // 9. Instrumentos
    addText('9. Instrumentos de evaluación familiar aplicados', 12, true);
    addText(`- ¿Se realiza tarjetón familiar? ${data.realizaTarjeton === 'Sí' ? 'SÍ' : (data.realizaTarjeton === 'No' ? 'NO' : 'SÍ/NO')}`, 12);
    let otrosStr = data.otrosInstrumentos === 'Sí' ? `SÍ ¿cuál? ${data.otrosInstrumentosAclare || ''}` : (data.otrosInstrumentos === 'No' ? 'NO' : 'SÍ ¿cuál? / NO');
    addText(`- Otros: ${otrosStr}`, 12);
    addText(`- ¿Firmó consentimiento en tarjetón familiar? ${data.firmoConsentimiento === 'Sí' ? 'SÍ' : (data.firmoConsentimiento === 'No' ? 'NO' : 'SÍ/NO')}`, 12);
    currentY += 5;

    // 10. Plan de continuidad
    addText('10. Plan de continuidad de la atención consensuado con la familia', 12, true);
    addText(`¿Se registra PCI en tarjetón familiar? ${data.registraPci === 'Sí' ? 'SÍ' : (data.registraPci === 'No' ? 'NO' : 'SÍ/NO')}`, 12);
    addText(`Observaciones: ${data.continuidadAtencionObs || ''}`, 12);
    currentY += 5;

    addText('En caso de NO realizar PCI en tarjetón familiar adjunte plan de cuidado consensuado con la persona y familia al reverso de esta hoja.\nRecuerde agregar opciones ofrecidas, meta, acuerdos, plazos y responsables', 12);
    currentY += 5;

    // 11. Ev. Final
    addText('11. Evaluación (al final de la visita)', 12, true);
    addText(`¿Se lograron los objetivos de la VDI? ${data.logroObjetivos === 'Sí' ? 'SÍ' : (data.logroObjetivos === 'No' ? 'NO' : 'SÍ/NO')}`, 12);
    addText(`Observaciones: ${data.logroObjetivosObs || ''}`, 12);
    addText(`¿Se cumplieron las expectativas de la familia? ${data.logroExpectativas === 'Sí' ? 'SÍ' : (data.logroExpectativas === 'No' ? 'NO' : 'SÍ/NO')}`, 12);
    currentY += 10;

    // Signatures
    if (currentY + 60 > 280) {
        doc.addPage();
        currentY = topMargin;
    }
    autoTable(doc, {
        startY: currentY,
        margin: { top: topMargin, left: margin, right: margin },
        body: [
            ['\n\n\n\n', '\n\n\n\n'], // Empty space for signature
            ['Nombre y firma funcionario(s) responsable', 'Nombre y firma representante familia']
        ],
        theme: 'grid',
        styles: { halign: 'center', valign: 'middle', textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.1, font: 'helvetica' }
    });

    const cleanName = (data.familia || 'Generado').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
    const safeFileName = `VDI_${cleanName}.pdf`;

    try {
        const baseUrl = window.location.origin !== "null" && !window.location.origin.includes("file://") 
           ? window.location.origin : '.';
        const imgUrl = `${baseUrl}/encabezado.png`;
        const res = await fetch(imgUrl);
        if (res.ok) {
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            const img = new Image();
            img.src = base64;
            await new Promise((resolve) => { img.onload = resolve; });
            
            const targetWidth = 30.25; 
            const targetHeight = (img.height * targetWidth) / img.width;

            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.addImage(base64, 'PNG', pageWidth - 10 - targetWidth, 5, targetWidth, targetHeight);
            }
        }
    } catch (e) {
        console.warn("Could not load encabezado.png", e);
    }

    await savePdf(doc, safeFileName);

  } catch (err: any) {
    console.error("Error generating VDI PDF", err);
    throw new Error(err.message);
  }
};