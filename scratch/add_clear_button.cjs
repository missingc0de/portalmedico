const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('components').filter(f => 
  f.startsWith('fichaControlNinoSano') || 
  f.startsWith('FichaControlNinoSano') || 
  f.startsWith('consultaNutricional')
);

let count = 0;

files.forEach(file => {
  const filePath = path.join('components', file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if button is already added in the right column
  if (content.includes('id="btn-borrar-todo-right"')) {
    return;
  }

  const targetAnchor = `                    </div>
              </div>
            </div>
          </div>`;

  const buttonSnippet = `                    </div>
              </div>
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
              </div>
            </div>
          </div>`;

  if (content.includes(targetAnchor)) {
    content = content.replace(targetAnchor, buttonSnippet);
    fs.writeFileSync(filePath, content, 'utf-8');
    count++;
    console.log(`Updated ${file}`);
  } else {
    // Try relaxed regex match for right col end
    const altRegex = /(<\/textarea>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/;
    if (altRegex.test(content)) {
      content = content.replace(altRegex, `</textarea>\n                  </div>\n              </div>\n              <div className="pt-2 mt-1 border-t border-slate-200/80 flex-shrink-0">\n                <button type="button" onClick={handleNewDocument} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5" id="btn-borrar-todo-right">\n                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>\n                  BORRAR TODO\n                </button>\n              </div>\n            </div>\n          </div>`);
      fs.writeFileSync(filePath, content, 'utf-8');
      count++;
      console.log(`Updated (alt) ${file}`);
    } else {
      console.log(`Could not find anchor in ${file}`);
    }
  }
});

console.log(`Total files updated: ${count}`);
