const fs = require('fs');
const path = require('path');

// 1. UPDATE data/onCallScheduleData.ts
const dataFile = path.join(__dirname, 'data', 'onCallScheduleData.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

dataContent = dataContent.replace(
  /    3: \{ \/\/ April \(0-indexed\)[\s\S]*?\}\s+\]/g,
  `    3: { // April (0-indexed)
      1: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      2: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      3: [],
      6: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      7: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      8: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      9: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"],
      10: ["BENJAMIN ROJAS", "CAROLINA MADARIAGA", "HENRY PATIÑO"],
      13: ["VICTOR VEGA", "RODRIGO PIZARRO", "GABRIELA CUELLO"],
      14: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      15: ["BENJAMIN ROJAS", "DAVID CORTES", "BASTIAN CORDOVA"],
      16: ["FRANCO MILOS", "CECILIA YEPEZ", "LUCIANO RAMOS"],
      17: ["BASTIAN CORDOVA", "HENRY PATIÑO", "CAROLINA MADARIAGA"],
      20: ["GABRIELA CUELLO", "VICTOR VEGA", "RODRIGO PIZARRO"],
      21: ["ROMINA LOPEZ", "CAMILA ROJAS"],
      22: ["BASTIAN CORDOVA", "BENJAMIN ROJAS", "DAVID CORTES"],
      23: ["LUCIANO RAMOS", "FRANCO MILOS", "CECILIA YEPEZ"],
      24: ["FRANCO MILOS", "CAROLINA MADARIAGA", "HENRY PATIÑO"],
      27: ["RODRIGO PIZARRO", "GABRIELA CUELLO", "VICTOR VEGA"],
      28: ["CAMILA ROJAS", "ROMINA LOPEZ"],
      29: ["DAVID CORTES", "BASTIAN CORDOVA", "BENJAMIN ROJAS"],
      30: ["CECILIA YEPEZ", "LUCIANO RAMOS", "FRANCO MILOS"]
    }
  }`
);

dataContent = dataContent.replace(
  /      27: generateLegacyEvent\('27', 2026, 2, 27, "CONTINUIDAD: CUELLO"\)\n    \}\n  \}\n\};/g,
  `      27: generateLegacyEvent('27', 2026, 2, 27, "CONTINUIDAD: CUELLO")
    },
    3: { // April
      3: generateLegacyEvent('28', 2026, 3, 3, "FERIADO"),
      10: generateLegacyEvent('29', 2026, 3, 10, "CONTINUIDAD ATENCIÓN: DR. ROJAS"),
      17: generateLegacyEvent('30', 2026, 3, 17, "CONTINUIDAD ATENCIÓN: DR. CORDOVA"),
      23: generateLegacyEvent('31', 2026, 3, 23, "REUNION DELEGADOS"),
      24: generateLegacyEvent('32', 2026, 3, 24, "CONTINUIDAD ATENCIÓN: DR. MILOS")
    },
    4: { // May
      1: generateLegacyEvent('33', 2026, 4, 1, "FERIADO")
    }
  }
};`
);
fs.writeFileSync(dataFile, dataContent, 'utf8');


// 2. UPDATE components/OnCallCalendar.tsx
const calFile = path.join(__dirname, 'components', 'OnCallCalendar.tsx');
let calContent = fs.readFileSync(calFile, 'utf8');

// Set default view to 'month'
calContent = calContent.replace(
  /const \[viewMode, setViewMode\] = useState<ViewMode>\('week'\);/g,
  `const [viewMode, setViewMode] = useState<ViewMode>('month');`
);

// Remove the red doctors label chunk in `renderMonthView()`
// This goes from `{doctors.length > 0 && (` to the closing `)}` right before `</div> </div> </div> ); }`
// The original code was:
/*
                    {doctors.length > 0 && (
                        <div 
                            className="mt-auto shrink-0 w-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDoctorsDay(expandedDoctorsDay === day ? null : day);
                            }}
                        >
*/
// It's quite long, so I'll just use regex to replace everything between `{doctors.length > 0 && (` and its matching closing `)}` above the final divs.
// It's safer to find the closing div of "flex-1 flex flex-col overflow-y-auto custom-scrollbar" instead, and then replace the doctors rendering block.

const docRenderRegex = /\{doctors\.length > 0 && \([\s\S]*?<div className="px-1 py-0\.5 rounded-\[3px\] text-\[9px\] leading-tight font-semibold cursor-pointer truncate shadow-sm border bg-\[#f02d3a\] text-white border-\[#d62432\] w-full text-center">[\s\S]*?<\/div>\n[\s\S]*?\)\}\n[\s\S]*?<\/div>\n[\s\S]*?\)\}/g;

const inlineDoctorsRender = `{doctors.length > 0 && (
                        <div className="mt-1 flex flex-col space-y-0.5">
                            {doctors.map((docName, idx) => {
                                const displayName = getLastName(docName).toUpperCase();
                                return (
                                    <div key={idx} className={\`text-[10px] leading-tight truncate \${idx === 0 ? 'font-bold text-sky-900 tracking-tight' : 'text-slate-600'}\`} title={docName}>
                                        {displayName}
                                    </div>
                                );
                            })}
                        </div>
                    )}`;

calContent = calContent.replace(docRenderRegex, inlineDoctorsRender);

fs.writeFileSync(calFile, calContent, 'utf8');
console.log('Calendar updating done.');
