import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export const generateDocxTemplate = async (templateUrl: string, outputName: string, data: any): Promise<void> => {
    try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla desde ${templateUrl}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Configurar los datos de reemplazo
        doc.setData(data);

        // Renderizar el documento
        doc.render();

        const out = doc.getZip().generate({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Descargar el archivo
        saveAs(out, outputName);
    } catch (error) {
        console.error("Error al generar el documento DOCX:", error);
        throw error;
    }
};
