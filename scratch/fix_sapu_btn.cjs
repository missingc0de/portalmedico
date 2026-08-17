
const fs = require("fs");

let sidebar = fs.readFileSync("components/Sidebar.tsx", "utf-8");

// replace import
if (!sidebar.includes("Hospital")) {
  sidebar = sidebar.replace(/import \{([^}]+)\} from .lucide-react.;/, (match, p1) => {
    return `import { ${p1}, Hospital } from "lucide-react";`;
  });
}

const oldSapuBtn = /<button[\s\S]*?onClick=\{\(\) => onSelectMenuItem\('sapu'\)\}[\s\S]*?<\/button>/;

const newSapuBtn = `            <button
              onClick={() => onSelectMenuItem('sapu')}
              className={\`w-full flex items-center justify-between px-2.5 py-2 text-left font-bold text-xs tracking-tight transition-all duration-150 cursor-pointer group rounded-xl \${
                currentView === 'sapu'
                ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }\`}
              title="SAPU"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Hospital className={\`w-4 h-4 shrink-0 \${currentView === 'sapu' ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'}\`} />
                {!isCollapsed && <span className="truncate">SAPU</span>}
              </div>
            </button>`;

sidebar = sidebar.replace(oldSapuBtn, newSapuBtn);

fs.writeFileSync("components/Sidebar.tsx", sidebar, "utf-8");
console.log("SAPU button fixed");

