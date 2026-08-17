
const fs = require("fs");

const files = [
  "components/FichaControlNinoSano1Mes.tsx",
  "components/FichaControlNinoSano3Mes.tsx",
  "components/FichaControlNinoSano6Anos.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf-8");

  // Fix outer wrappers
  let newContent = content;
  
  if (content.includes(`<div className="w-full relative">`)) {
      newContent = newContent.replace(
          /<div className="w-full relative">([\s\S]*?)<form onSubmit=\{\(e\) => e.preventDefault\(\)\} className="flex flex-col gap-6">/,
          `<div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">`
      );
  }

  // Fix sections
  newContent = newContent.replace(/<section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">/g, `<section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">`);
  // For 6Anos which has section key=...
  newContent = newContent.replace(/<section key=\{section\.title\} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">/g, `<section key={section.title} className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">`);
  
  // Fix right column wrapper
  newContent = newContent.replace(
      /<\/form>\s*<\/div>\s*\{\/\* Columna Derecha[\s\S]*?\*\/\}\s*<div className="lg:col-span-4 lg:sticky lg:top-20 lg:h-\[calc\(100vh-180px\)\]">/,
      `              </form>
            </div>

            {/* Columna Derecha: Vista Previa */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">`
  );
  
  // Replace the closing tags of the file
  if (file.includes("6Anos")) {
      newContent = newContent.replace(
          /<\/button>\s*<\/div>\s*<\/>\s*\);\s*\};\s*export default FichaControlNinoSano6Anos;/,
          `</button>\
          </div>\
        </div>\
      </div>\
    </div>\
  );\
};\
\
export default FichaControlNinoSano6Anos;`
      );
  } else {
      // 1Mes and 3Mes
      const modalRegex = /(<ScoreNeurosensorialModal[\s\S]*?\/>)\s*<\/div>\s*\);\s*\};\s*export default (FichaControlNinoSano\dMes);/;
      const modalMatch = newContent.match(modalRegex);
      if (modalMatch) {
          newContent = newContent.replace(
              modalRegex,
              `$1\
          </div>\
        </div>\
      </div>\
    </div>\
  );\
};\
\
export default $2;`
          );
      }
  }

  fs.writeFileSync(file, newContent, "utf-8");
  console.log("Fixed " + file);
});

