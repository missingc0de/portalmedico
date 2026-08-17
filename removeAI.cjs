const fs = require('fs');
const file = 'c:\\Users\\missi\\.gemini\\antigravity\\scratch\\PORTALMEDICO_CLIENTEWEB\\App.tsx';
let content = fs.readFileSync(file, 'utf-8');

const start = content.indexOf('const AIExamAnalyzer: React.FC<{ loggedInUser: User | null }> = ({ loggedInUser }) => {');
const end = content.indexOf('const FloatingBackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {');

// Remove the AIExamAnalyzer component
content = content.slice(0, start) + content.slice(end);

// Remove specific imports
content = content.replace("import { GoogleGenAI } from '@google/genai';\n", "");
content = content.replace("import { getAiClient } from './utils/aiClient';\n", "");

// Replace the UI part
const uiTarget = `            {/* Bottom Row: AI Analyzer, Tasks, and Email Generator */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8 w-full">
              <div className="lg:w-1/4 flex">
                <AIExamAnalyzer loggedInUser={loggedInUser} />
              </div>
              <div className="lg:w-1/2 flex">
                <SpirometryAnalyzer loggedInUser={loggedInUser} />
              </div>
              <div className="lg:w-1/4 flex">
                <EmailGenerator loggedInUser={loggedInUser} />
              </div>
            </div>`;

const uiReplacement = `            {/* Bottom Row: Tasks, and Email Generator */}
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8 w-full">
              <div className="lg:w-1/2 flex">
                <SpirometryAnalyzer loggedInUser={loggedInUser} />
              </div>
              <div className="lg:w-1/2 flex">
                <EmailGenerator loggedInUser={loggedInUser} />
              </div>
            </div>`;

content = content.replace(uiTarget, uiReplacement);
fs.writeFileSync(file, content);
console.log('App.tsx updated.');
