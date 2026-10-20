const fs = require('fs');
const path = require('path');

const dir = 'components';
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().includes('ninosano') || f.toLowerCase().includes('nutricional'));

let updated = 0;

const buttonHtml = `
          <div className="pt-2 mt-1 border-t border-slate-200/80 flex-shrink-0">
            <button
              type="button"
              onClick={handleNewDocument}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
              id="btn-borrar-todo-right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              BORRAR TODO
            </button>
          </div>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('btn-borrar-todo-right')) {
    console.log('Already has button:', file);
    return;
  }

  const searchStr = 'Resumen Ficha Clínica (Editable)';
  const pos = content.indexOf(searchStr);
  if (pos === -1) {
    console.log('No clinical summary header found in:', file);
    return;
  }

  // Find where textareas end inside the inner container div of lg:col-span-4
  // In generated files, the textareas are wrapped in:
  // <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden"> ... </div>
  // followed by </div> (inner container) </div> (outer lg:col-span-4 container)
  const innerDivEnd = content.indexOf('</div>\n      </div>\n    </div>', pos);
  const innerDivEndAlt = content.indexOf('</div>\n        </div>\n      </div>\n    </div>', pos);
  const innerDivEndAlt2 = content.indexOf('</div>\n      </div>\n    </div>', pos);

  // Fallback regex match for closing right panel
  const match = content.slice(pos).match(/(\s*<\/div>\s*<\/div>\s*<\/div>)/);

  if (match) {
    const relativeIndex = match.index;
    const absoluteIndex = pos + relativeIndex;
    content = content.slice(0, absoluteIndex) + buttonHtml + content.slice(absoluteIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', file);
    updated++;
  } else {
    console.log('Could not find match structure for:', file);
  }
});

console.log('Total updated files:', updated);
