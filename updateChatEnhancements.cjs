const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'ChatLocal.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Types update
code = code.replace(
  /sector: string;\n\s*lastSeen: any;\n\}/g,
  `sector: string;\n  lastSeen: any;\n  cesfam?: string;\n  status?: string;\n}`
);

// 2. Add dictionary
if (!code.includes('CESFAM_INITIALS')) {
  code = code.replace(
    /const PROFESSION_TAGS/,
    `const CESFAM_INITIALS: Record<string, string> = {
  'CESFAM San Juan': 'SJ',
  'CESFAM Tierras Blancas': 'TB',
  'CESFAM Lila Cortés': 'LC',
  'CESFAM Tongoy': 'TG',
  'CESFAM Santa Cecilia': 'SC',
  'CESFAM Sergio Aguilar': 'SA',
  'CESFAM El Sauce': 'ES',
  'CESFAM Punta Mira': 'PM',
  'CESFAM Pan de Azúcar': 'PA'
};

const PROFESSION_TAGS`
  );
}

// 3. Add useState for emoji
if (!code.includes('showEmojis')) {
  code = code.replace(
    /const \[isShaking, setIsShaking\] = useState\(false\);/,
    `const [isShaking, setIsShaking] = useState(false);\n  const [showEmojis, setShowEmojis] = useState(false);`
  );
}

// 4. Update presence payload and useEffect dependencies
code = code.replace(
  /const payload \= \{\n\s*fullName: loggedInUser\.fullName,\n\s*profession: loggedInUser\.profession,\n\s*box: computerBox,\n\s*sector: computerSector,\n\s*lastSeen: serverTimestamp\(\)\n\s*\};/g,
  `const payload = {
          fullName: loggedInUser.fullName,
          profession: loggedInUser.profession,
          box: computerBox,
          sector: computerSector,
          cesfam: loggedInUser.cesfam || '',
          status: myProfile.status || 'Disponible.',
          lastSeen: serverTimestamp()
        };`
);

code = code.replace(
  /\}, \[loggedInUser\.username, loggedInUser\.fullName, loggedInUser\.profession, computerBox, computerSector\]\);/g,
  `}, [loggedInUser.username, loggedInUser.fullName, loggedInUser.profession, loggedInUser.cesfam, computerBox, computerSector, myProfile.status]);`
);


// 5. ToolBar Emoji Button
code = code.replace(
  /<div className="bg-slate-200\/80 px-2 py-1 flex items-center border-y border-slate-300 shrink-0 shadow-sm z-10">\n\s*<button/g,
  `<div className="bg-slate-200/80 px-2 py-1 flex items-center border-y border-slate-300 shrink-0 shadow-sm z-10">
                     <div className="relative mr-2">
                       <button 
                         onClick={() => setShowEmojis(!showEmojis)}
                         className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded transition-colors shadow-sm bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0"
                         title="Emojis"
                         type="button"
                       >
                         <span className="text-[12px] leading-none">😃</span>
                       </button>
                       {showEmojis && (
                         <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-slate-200 shadow-xl rounded-lg grid grid-cols-3 gap-2 w-36 z-20">
                            {[':)', ':D', ':(', ':P', '(L)', '(Y)', '(N)', '(K)', '(H)'].map((em, idx) => (
                              <button 
                                key={idx}
                                onClick={() => { setNewMessage(prev => prev + em); setShowEmojis(false); textareaRef.current?.focus(); }}
                                className="hover:bg-slate-100 p-1 text-base rounded transition-colors"
                                type="button"
                              >
                                {replaceEmojis(em)}
                              </button>
                            ))}
                         </div>
                       )}
                     </div>
                     <button`
);

// Close emoji dropdown on click outside logic is usually needed but we'll let it toggle with button for simplicity.

// 6. Halve consecutive margin
// We currently have: `${isConsecutive ? 'mt-0.5' : 'mt-3'}` using regex replace
code = code.replace(
  /\$\{isConsecutive \? 'mt-0\.5' : 'mt-3'\}/g,
  `\${isConsecutive ? 'mt-[1px]' : 'mt-3'}`
);


// 7. Update User List Rendering (Sidebar) for Online and Offline users
// The best way is to inject properties in both `onlineFiltered.map` and `offlineFiltered.map`.
// Since both use identical logic for the badge and labels, I will use regex on both at once.
code = code.replace(
  /const unread = getUnreadForUser\(user\.id\);/g,
  `const unread = getUnreadForUser(user.id);
                      const lastMsg = messagesPrivate.filter(m => m.senderUsername === user.id || m.receiverUsername === user.id).pop();`
);

// Status and Cesfam text rendering in Sidebar
const oldSidebarDetails = `<p className=\\{\\\`text-xs font-bold truncate \\\\\\$\\{activeChannel === \\\`private_\\\\\\$\\{user.id\\}\\\` \\? 'text-sky-800' : 'text-slate-700'\\\\\\}\\}\\\` title=\\{user.fullName\\}>\\{user.fullName\\}</p>[\\s\\S]*?<div className="flex flex-wrap gap-1 mt-0\\.5">[\\s\\S]*?<span className="text-\\[9px\\] text-slate-500 bg-white px-1 rounded border border-slate-200 shadow-sm truncate max-w-full">SECTOR \\{user\\.sector\\.toUpperCase\\(\\)\\}<\\/span>[\\s\\S]*?<\\/div>[\\s\\S]*?<p className="text-\\[9px\\] text-slate-500 truncate mt-0\\.5 uppercase tracking-wide" title=\\{user\\.profession\\}>\\{user\\.profession\\} · BOX \\{user\\.box\\}<\\/p>`;

const oldSidebarDetailsOffline = `<p className=\\{\\\`text-xs font-bold truncate \\\\\\$\\{activeChannel === \\\`private_\\\\\\$\\{user.id\\}\\\` \\? 'text-sky-800' : 'text-slate-600'\\\\\\}\\}\\\` title=\\{user.fullName\\}>\\{user.fullName\\}</p>[\\s\\S]*?<div className="flex flex-wrap gap-1 mt-0\\.5">[\\s\\S]*?<span className="text-\\[9px\\] text-slate-400 bg-white px-1 rounded border border-slate-200 shadow-sm truncate max-w-full">SECTOR \\{user\\.sector\\.toUpperCase\\(\\)\\}<\\/span>[\\s\\S]*?<\\/div>[\\s\\S]*?<p className="text-\\[9px\\] text-slate-400 truncate mt-0\\.5 uppercase tracking-wide" title=\\{user\\.profession\\}>\\{user\\.profession\\} · BOX \\{user\\.box\\}<\\/p>`;

code = code.replace(
  /<p className=\{(.*?)'text-slate-700'(.*?)\}>\{user\.fullName\}<\/p>\s*<div className="flex flex-wrap gap-1 mt-0\.5">\s*<span className="(.*?)">SECTOR \{user\.sector\.toUpperCase\(\)\}<\/span>\s*<\/div>\s*<p className="(.*?)">\{user\.profession\} · BOX \{user\.box\}<\/p>/g,
  `<p className={$1'text-slate-800'$2}>{user.fullName}</p>
                                <p className="text-[10px] text-slate-500 italic mb-0.5 truncate">{user.status || 'Disponible.'}</p>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  <span className="$3">SECTOR {user.sector.toUpperCase()}</span>
                                  {user.cesfam && CESFAM_INITIALS[user.cesfam] && (
                                    <span className="$3">{CESFAM_INITIALS[user.cesfam]}</span>
                                  )}
                                </div>
                                <p className="$4">{user.profession} · BOX {user.box}</p>
                                {lastMsg && (
                                  <p className="text-[9px] text-slate-500 truncate mt-1 italic">
                                    {lastMsg.senderUsername === loggedInUser.username ? 'Tú: ' : ''}{lastMsg.text}
                                  </p>
                                )}`
);

code = code.replace(
  /<p className=\{(.*?)'text-slate-600'(.*?)\}>\{user\.fullName\}<\/p>\s*<div className="flex flex-wrap gap-1 mt-0\.5">\s*<span className="(.*?)">SECTOR \{user\.sector\.toUpperCase\(\)\}<\/span>\s*<\/div>\s*<p className="(.*?)">\{user\.profession\} · BOX \{user\.box\}<\/p>/g,
  `<p className={$1'text-slate-600'$2}>{user.fullName}</p>
                                <p className="text-[10px] text-slate-400 italic mb-0.5 truncate">{user.status || 'Disponible.'}</p>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  <span className="$3">SECTOR {user.sector.toUpperCase()}</span>
                                  {user.cesfam && CESFAM_INITIALS[user.cesfam] && (
                                    <span className="$3">{CESFAM_INITIALS[user.cesfam]}</span>
                                  )}
                                </div>
                                <p className="$4">{user.profession} · BOX {user.box}</p>
                                {lastMsg && (
                                  <p className="text-[9px] text-slate-400 truncate mt-1 italic">
                                    {lastMsg.senderUsername === loggedInUser.username ? 'Tú: ' : ''}{lastMsg.text}
                                  </p>
                                )}`
);


// 8. Fix the profile viewing logic to also show cesfam, though they can see it everywhere now, we can leave it as is. 

fs.writeFileSync(filePath, code);
console.log("Enhancements applied successfully.");
