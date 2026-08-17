const fs = require('fs');
const path = require('path');

const chatFile = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(chatFile, 'utf8');

// 1. Remove inline avatars
content = content.replace(
  /\{!\s*isConsecutive\s+&&\s+\(\s*<div\s+className="shrink-0\s+flex\s+flex-col\s+mx-2\s+relative\s+group\s+z-10">[\s\S]*?<\/div>\s*\)\}/g,
  ''
);

// 2. Remove the spacer for consecutive messages
content = content.replace(
  /\{isConsecutive\s+&&\s+<div\s+className="w-\[66px\]\s+shrink-0"\s+\/>\}/g,
  ''
);

// 3. Reset flex layout of messages to be simple
content = content.replace(
  /className=\{`flex \$\{isMe \? 'flex-row-reverse' : 'flex-row'\} items-end \$\{isConsecutive \? 'mt-0\.5' : 'mt-3'\}`\}/g,
  'className={`flex flex-col ${isMe ? \'items-end\' : \'items-start\'} ${isConsecutive ? \'mt-0.5\' : \'mt-3\'}`}'
);

// 4. Remove the inner <div className="flex flex-col ... max-w-[75%]"
content = content.replace(
  /<div className=\{`flex flex-col \$\{isMe \? 'items-end' : 'items-start'\} max-w-\[75%\]`\}>/g,
  ''
);

// 5. Remove the extra closing </div> that wrapped the above inner div
// The old block ended with:
/*
                               </div>
                             </div>
                           </div>
                         </div>
                       );
                     }
*/
content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/g,
  '</div>\n                            </div>\n                          </div>\n                        );\n                      }'
);

content = content.replace(
  /className=\{`px-3 py-2 flex flex-col relative min-w-\[80px\] shadow-sm text-sm break-words border w-full/g,
  'className={`px-3 py-2 flex flex-col relative min-w-[80px] shadow-sm text-sm break-words border max-w-[85%]'
);


// 6. WRAP "Right Side: Chat Window" to have the new sidebar
content = content.replace(
  /<div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">/g,
  `<div className="flex-1 flex flex-row min-w-0 bg-slate-50 relative">
     <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200 shadow-inner">`
);

// 7. Inject the right sidebar
// The chat block ends exactly before: {/* LOGIN TOASTS */}
// So we insert right before that.
// First ensure we find the end of the `<div className="w-full md:w-[220px]...` which is the left panel
const msnSidebar = `
               </div>
               
               {/* MSN AVATARS RIGHT PANEL */}
               <div className="w-[110px] md:w-[130px] bg-slate-100/50 flex flex-col items-center justify-between py-4 shrink-0 shadow-inner overflow-hidden">
                 {/* Top Avatar (Recipient/Group) */}
                 <div className="w-full flex justify-center mt-2 px-2">
                    <div className="bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 p-[3px] w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-sm shadow relative">
                        {(() => {
                           if (activeChannel.startsWith('private_')) {
                               const targetUser = activeChannel.replace('private_', '');
                               const u = allUsersData.find(x => x.username === targetUser) || onlineUsers.find(x => x.id === targetUser);
                               if (u && (u as any).profilePictureUrl) return <img src={(u as any).profilePictureUrl} className="w-full h-full object-cover border border-slate-500 rounded-sm" />;
                               return <MsnDefaultAvatar />;
                           }
                           // Group icon for general/noticias
                           return <div className="w-full h-full bg-slate-300 border border-slate-400 flex items-center justify-center text-slate-500 text-[10px] font-bold text-center leading-tight p-1">GRUPO</div>;
                        })()}
                    </div>
                 </div>

                 {/* Bottom Avatar (Me) */}
                 <div className="w-full flex justify-center mb-6 px-2">
                    <div className="bg-gradient-to-b from-sky-50 to-slate-200 border border-slate-400 p-[3px] w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-sm shadow relative">
                        {myProfile.profilePictureUrl ? <img src={myProfile.profilePictureUrl} className="w-full h-full object-cover border border-slate-500 rounded-sm" /> : <MsnDefaultAvatar />}
                    </div>
                 </div>
               </div>
             </div>
`;

// It should replace the </div> that closes the form container before LOGIN TOASTS
// Wait, the main chat interface is wrapped inside:
/*
      {isOpen && (
        <div className="fixed inset-4 md:inset-10 lg:inset-y-12 lg:inset-x-32 ...
          <div className="bg-white w-full h-[95%] ...
            <div className="flex h-full min-h-0 bg-slate-50 relative">
               <LEFT_PANEL />
               <div className="flex-1 flex flex-row min-w-0 bg-slate-50 relative">
                  <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200 shadow-inner">
                     ...
                  </div>
*/
content = content.replace(
  /                  <\/div>\n                \)\}\n              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      \)\}/g,
  `                  </div>
                )}
` + msnSidebar + `
            </div>
          </div>
        </div>
      )}`
);

fs.writeFileSync(chatFile, content, 'utf8');
console.log('ChatLocal styling aligned to MSN request.');
