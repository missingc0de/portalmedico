const fs = require("fs");

let code = fs.readFileSync("components/FichaVisitaDomiciliaria.tsx", "utf-8");

// 1. Replace the return statement start
const startSearch = `  return (
    <>
      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">

          {/* === Columna Izquierda: Formulario === */}
          <div className="lg:col-span-8 flex flex-col gap-6">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">`;

const startReplace = `  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4">

            {/* === Columna Izquierda: Formulario === */}
            <div className="lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
              <form onSubmit={(e) => e.preventDefault()} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-4">`;

code = code.replace(startSearch, startReplace);

// 2. Replace the divider between columns
const midSearch = `              </form>
          </div>

          {/* === Columna Derecha: Ficha Generada (Distribución Dinámica) === */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 lg:h-[calc(100vh-180px)]">`;

const midReplace = `              </form>
            </div>

            {/* === Columna Derecha: Ficha Generada (Distribución Dinámica) === */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0 bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden relative shadow-inner">`;

code = code.replace(midSearch, midReplace);

// 3. Update the inner header of right column to look like Nino Sano (block uppercase labels)
code = code.replace(
  `<label htmlFor="anamnesisText" className="block text-sm font-medium text-slate-700 flex items-center gap-2">\n                      Anamnesis\n                    </label>`,
  `<label className="block text-xs font-semibold text-slate-800">ANAMNESIS</label>`
);
code = code.replace(
  `<label htmlFor="exploracionText" className="block text-sm font-medium text-slate-700 flex items-center gap-2">\n                      Exploración\n                    </label>`,
  `<label className="block text-xs font-semibold text-slate-800">EXPLORACIÓN</label>`
);
code = code.replace(
  `<label htmlFor="actuacionText" className="block text-sm font-medium text-slate-700 flex items-center gap-2">\n                      Actuación\n                    </label>`,
  `<label className="block text-xs font-semibold text-slate-800">ACTUACIÓN</label>`
);

// also let's check the copy button and copy button container in VDI to make it uppercase labels, or block text-slate-800
// let's adjust class of textarea:
code = code.replace(
  /className="flex-grow w-full gap-4 flex flex-col min-h-0"/g,
  `className="flex-grow w-full gap-4 flex flex-col min-h-0"`
);

// 4. Replace the end of columns and footer
const endSearch = `            </div>
          </div>

        </div>
      </div>

      {/* === Footer Fijo === */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-6 rounded-xl shadow-sm">`;

const endReplace = `            </div>
          </div>
        </div>
      </div>

      {/* === Footer Fijo === */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6 border border-slate-200 bg-white mt-6 rounded-xl shadow-sm">`;

code = code.replace(endSearch, endReplace);

// 5. Replace final closing tags
const finalSearch = `          </div>
        </div>
    </>
  );
}`;

const finalReplace = `          </div>
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(finalSearch, finalReplace);

fs.writeFileSync("components/FichaVisitaDomiciliaria.tsx", code, "utf-8");
console.log("Visita layout fixed");
