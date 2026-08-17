
const fs = require("fs");

const files = [
  "components/FichaControlNinoSano1Mes.tsx",
  "components/FichaControlNinoSano3Mes.tsx",
  "components/FichaControlNinoSano6Anos.tsx"
];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf-8");

  // Fix outer wrappers
  // Replace from return ( up to <form
  const wrapperRegex = /return \(\s*<div className="w-full relative">\s*<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">\s*\{\/\* Columna Central: Formulario \(col-span-8\) \*\/\}\s*<div className="lg:col-span-8 flex flex-col gap-6">\s*<form onSubmit=\{\(e\) => e\.preventDefault\(\)\} className="flex flex-col gap-6">/;
  
  const newWrapper = `return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">
            {/* Formulario */}
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">`;
              
  content = content.replace(wrapperRegex, newWrapper);

  // If the previous regex fails due to slight variations:
  if (!content.includes("className=\"bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4\"")) {
    content = content.replace(
      /<div className="w-full relative">([\s\S]*?)<div className="lg:col-span-8 flex flex-col gap-6">\s*<form onSubmit=\{\(e\) => e.preventDefault\(\)\} className="flex flex-col gap-6">/,
      `<div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">`
    );
  }

  // Fix sections
  // Replace <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  // with <section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">
  content = content.replace(/<section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">/g, `<section className="bg-[#F8FAFC] rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-2">`);
  
  // Fix right column wrapper
  const rightColRegex = /<\/form>\s*<\/div>\s*\{\/\* Columna Derecha: Vista Previa y Botones \(col-span-4\) \*\/\}\s*<div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">/;
  const newRightCol = `              </form>
            </div>

            {/* Vista Previa */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">`;
  content = content.replace(rightColRegex, newRightCol);
  
  if (!content.includes(`className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner"`)) {
      content = content.replace(/<\/form>\s*<\/div>\s*<div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">/, newRightCol);
  }

  // Fix the closing divs of the whole return block
  // It originally had:
  //           </div>
  //       </div>
  //   );
  
  // Now it needs:
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  const closingRegex = /<\/div>\s*<\/div>\s*\);\s*\}[\s]*$/;
  const newClosing = `          </div>
        </div>
      </div>
    </div>
  );
}`;
  content = content.replace(closingRegex, newClosing);
  if (content.match(/<\/div>\s*<\/div>\s*\);\s*$/)) {
      content = content.replace(/<\/div>\s*<\/div>\s*\);\s*$/, newClosing.replace("}\n",""));
  }

  fs.writeFileSync(file, content, "utf-8");
  console.log("Fixed " + file);
});

