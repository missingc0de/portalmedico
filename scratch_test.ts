import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF('p', 'mm', 'a4');
let currentY = 30;

autoTable(doc, {
    startY: currentY,
    head: [['Nombre', 'Edad']],
    body: [['Juan', '30']]
});

console.log('lastAutoTable exists:', !!(doc as any).lastAutoTable);
console.log('finalY:', (doc as any).lastAutoTable?.finalY);
