
const fs = require("fs");

let types = fs.readFileSync("types.ts", "utf-8");
types = types.replace("export type View = CertificateType | 'login' | 'menu' | 'misPacientes';", "export type View = CertificateType | 'login' | 'menu' | 'misPacientes' | 'sapu';");
fs.writeFileSync("types.ts", types, "utf-8");

let sidebar = fs.readFileSync("components/Sidebar.tsx", "utf-8");
const misPacientesBtn = `            <button
              onClick={() => onSelectMenuItem('misPacientes')}
              className={\`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all group \${
                currentView === 'misPacientes'
                ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }\`}
              title="Mis pacientes"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Users className={\`w-4 h-4 shrink-0 \${currentView === 'misPacientes' ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}\`} />
                {!isCollapsed && <span className="truncate">Mis pacientes</span>}
              </div>
            </button>`;
const sapuBtn = `
            <button
              onClick={() => onSelectMenuItem('sapu')}
              className={\`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all group \${
                currentView === 'sapu'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }\`}
              title="SAPU"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" className={\`w-4 h-4 shrink-0 \${currentView === 'sapu' ? 'text-white' : 'text-slate-500 group-hover:text-red-600'}\`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                {!isCollapsed && <span className="truncate">SAPU</span>}
              </div>
            </button>`;

if (sidebar.includes(misPacientesBtn)) {
  sidebar = sidebar.replace(misPacientesBtn, misPacientesBtn + sapuBtn);
} else {
  // If exact match fails, use a fallback replace logic
  const match = sidebar.match(/<button[\s\S]*?onClick=\{\(\) => onSelectMenuItem\('misPacientes'\)\}[\s\S]*?<\/button>/);
  if (match) {
    sidebar = sidebar.replace(match[0], match[0] + sapuBtn);
  }
}
fs.writeFileSync("components/Sidebar.tsx", sidebar, "utf-8");

