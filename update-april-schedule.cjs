const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data', 'onCallScheduleData.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

dataContent = dataContent.replace(
  /    3: \{ \/\/ April \(0-indexed\)[\s\S]*?\}\s+}/g,
  `    3: { // April (0-indexed)
      1: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      2: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      3: [],
      6: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      7: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      8: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      9: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"],
      10: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      13: ["VICTOR VEGA", "RODRIGO PIZARRO", "GABRIELA CUELLO"],
      14: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      15: ["BENJAMIN ROJAS", "DAVID CORTES", "BASTIAN CORDOVA"],
      16: ["FRANCO MILOS", "CECILIA YEPEZ", "LUCIANO RAMOS"],
      17: ["HENRY PATIÑO", "CAROLINA MADARIAGA"],
      20: ["GABRIELA CUELLO", "VICTOR VEGA", "RODRIGO PIZARRO"],
      21: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      22: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      23: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      24: ["CAROLINA MADARIAGA", "HENRY PATIÑO"],
      27: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      28: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      29: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      30: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"]
    }
  }`
);

fs.writeFileSync(dataFile, dataContent, 'utf8');
console.log('April schedule accurately replaced based on prompt listing.');
