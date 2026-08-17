const fs = require('fs');
const path = require('path');

const chatFile = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(chatFile, 'utf8');

// 1. Add MSN Default Profile Picture SVG Helper
if (!content.includes('MsnDefaultAvatar')) {
  const avatarSvg = `
const MsnDefaultAvatar = () => (
  <div className="w-10 h-10 border border-slate-300 bg-gradient-to-b from-white to-slate-200 relative p-1 shadow-inner flex flex-col items-center justify-end overflow-hidden">
    <div className="w-4 h-4 bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-0.5 shadow-sm 1"></div>
    <div className="w-8 h-4 bg-gradient-to-t from-green-400 to-green-500 rounded-t-full shadow-sm 2"></div>
  </div>
);
`;
  content = content.replace('export const ChatLocal: React.FC', avatarSvg + '\nexport const ChatLocal: React.FC');
}

// 2. Add Login Toast State and Audio
if (!content.includes('loginSound')) {
  const stateToAdd = `
  interface LoginToast {
    id: string;
    username: string;
    fullName: string;
  }
  const [loginToasts, setLoginToasts] = useState<LoginToast[]>([]);
  const prevOnlineUsernamesRef = useRef<Set<string>>(new Set());
  const loginSound = useRef(new Audio('./msn_login.mp3'));
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
`;
  content = content.replace('const [showEmojis, setShowEmojis] = useState(false);', 'const [showEmojis, setShowEmojis] = useState(false);\n' + stateToAdd);
}

// 3. Effect for Login Popups
if (!content.includes('// MSN LOGIN POPUP EFFECT')) {
  const popupEffect = `
  // MSN LOGIN POPUP EFFECT
  useEffect(() => {
    const currentOnlineNames = new Set(onlineUsers.filter(u => u.status === 'online').map(u => u.id));
    
    currentOnlineNames.forEach(username => {
       if (!prevOnlineUsernamesRef.current.has(username) && prevOnlineUsernamesRef.current.size > 0) {
          if (username !== loggedInUser.username) {
             const userObj = onlineUsers.find(u => u.id === username);
             if (userObj) {
                loginSound.current.currentTime = 0;
                loginSound.current.play().catch(e => console.log('Audio error:', e));
                
                const toastId = Date.now().toString() + Math.random();
                setLoginToasts(prev => [...prev, { id: toastId, username, fullName: userObj.fullName }]);
                
                setTimeout(() => {
                   setLoginToasts(prev => prev.filter(t => t.id !== toastId));
                }, 5000);
             }
          }
       }
    });
    prevOnlineUsernamesRef.current = currentOnlineNames;
  }, [onlineUsers]);
`;
  content = content.replace('useEffect(() => {', popupEffect + '\n  useEffect(() => {');
}

// 4. Force open on Nudge
// Search for handleReceiveMessage logic where isNudge is checked
if (content.includes('if (data.isNudge')) {
  content = content.replace(
    /if \(data\.isNudge\)([\s\S]*?)nudgeSound\.current\.play\(\)\.catch\(\(e\) => console\.error\('Error playing nudge:', e\)\);/g, 
    "if (data.isNudge)$1nudgeSound.current.play().catch((e) => console.error('Error playing nudge:', e));\n            if (data.receiverUsername === loggedInUser.username) { setIsOpen(true); }"
  );
} else {
    // If we couldn't find the exact match, inject inside the snapshot loop where message is checked
    content = content.replace(
      /nudgeSound\.current\.play\(\)\.catch\(\(\w+\) => console\.error\('Error playing nudge:', \w+\)\);/,
      "$& \n            if (data.receiverUsername === loggedInUser.username) { setIsOpen(true); }"
    );
}

// 5. Typing indicator UI
const typingIndicatorHtml = `
                {/* Typing Indicator */}
                <div className="h-4 px-3 bg-white text-[10px] text-slate-500 italic pb-1">
                  {onlineUsers.some(u => u.id !== loggedInUser.username && u.typingTo === (activeChannel.startsWith('private_') ? loggedInUser.username : activeChannel)) 
                    ? onlineUsers.find(u => u.id !== loggedInUser.username && u.typingTo === (activeChannel.startsWith('private_') ? loggedInUser.username : activeChannel))?.fullName + " está escribiendo un mensaje..."
                    : ""}
                </div>
`;
content = content.replace('{/* Toolbar WLM Style */}', typingIndicatorHtml + '\n                {/* Toolbar WLM Style */}');

// Add Typing logic to handleTextChange
content = content.replace(
  'const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {',
  `const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const channelTarget = activeChannel.startsWith('private_') ? activeChannel.replace('private_', '') : activeChannel;
    setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: channelTarget }, { merge: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
        setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: '' }, { merge: true });
    }, 2000);
`
);

// Add typing stop on send
content = content.replace(
  'setNewMessage(\'\');',
  `setNewMessage('');\n    setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: '' }, { merge: true });`
);


// 6. Profiles and Frame (Replace rendering loops)
content = content.replace(
  /<div key=\{msg\.id\} className=\{`flex flex-col \$\{isMe \? 'items-end' : 'items-start'\} \$\{isConsecutive \? 'mt-0\.5' : 'mt-3'\}`\}>/g,
  `<div key={msg.id} className={\`flex \${isMe ? 'flex-row-reverse' : 'flex-row'} items-end \${isConsecutive ? 'mt-0.5' : 'mt-3'}\`}>
      {!isConsecutive && (
          <div className="shrink-0 w-12 h-12 flex flex-col mx-2">
            <div className={\`bg-gradient-to-b \${isMe ? 'from-sky-200 to-slate-200' : 'from-slate-200 to-slate-300'} border border-slate-400 flex items-center justify-center p-0.5 w-[42px] h-[42px] shadow-sm relative rounded\`}>
                <div className={\`absolute top-2 w-1.5 h-3 bg-slate-300 border-y border-slate-400 \${isMe ? '-left-1' : '-right-1'}\`} />
                {(() => {
                   const u = allUsersData.find(x => x.username === msg.senderUsername) || onlineUsers.find(x => x.id === msg.senderUsername);
                   if (u && (u as any).profilePictureUrl) return <img src={(u as any).profilePictureUrl} className="w-full h-full object-cover border border-slate-500 rounded-sm" />;
                   return <MsnDefaultAvatar />;
                })()}
            </div>
          </div>
      )}
      {isConsecutive && <div className="w-[58px]" />}
      <div className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'} max-w-[80%]\`}>`
);

content = content.replace( // Close the extra div
  /<\/div>\s*<\/div>\s*\);\s*\}\s*\}\)\s*\)\}/g,
  `</div></div>\n                        );\n                      }\n                    })\n                  )}`
);

// Fix My Profile Modal to add Image Loader
const profileUploadCode = `
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">Imagen de Perfil</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                {myProfile.profilePictureUrl ? <img src={myProfile.profilePictureUrl} className="w-full h-full object-cover" /> : <MsnDefaultAvatar />}
              </div>
              <input type="file" accept="image/*" className="text-sm text-slate-600" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                       // Resize on Canvas
                       const img = new Image();
                       img.onload = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = 100;
                          canvas.height = 100;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, 100, 100);
                          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                          setMyProfile(prev => ({...prev, profilePictureUrl: compressedBase64}));
                       };
                       img.src = ev.target.result as string;
                    };
                    reader.readAsDataURL(file);
                 }
              }} />
            </div>
          </div>
`;

content = content.replace(
  '<div className="mb-4">\n            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Visible (Apodo)</label>',
  profileUploadCode + '\n          <div className="mb-4">\n            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Visible (Apodo)</label>'
);

// Save Profile Fix
content = content.replace(
  `setDoc(doc(db, 'chat_presence', loggedInUser.username), {`,
  `setDoc(doc(db, 'chat_presence', loggedInUser.username), {\n      profilePictureUrl: myProfile.profilePictureUrl,`
);
content = content.replace(
  `setDoc(doc(db, 'users', loggedInUser.username), {`,
  `setDoc(doc(db, 'users', loggedInUser.username), {\n          profilePictureUrl: myProfile.profilePictureUrl,`
);

// Add TOAST rendering before the final fragment closing
const toastRender = `
      {/* LOGIN TOASTS */}
      <div className="fixed bottom-[80px] right-6 flex flex-col gap-2 z-[99999]" style={{ pointerEvents: 'none' }}>
         {loginToasts.map(toast => (
            <div key={toast.id} className="bg-gradient-to-b from-blue-100 to-white w-72 border border-blue-900 rounded-lg shadow-xl shadow-blue-900/20 flex items-center p-3 animate-slide-up-fade" style={{ animation: 'slideInRight 0.3s ease-out' }}>
                <div className="w-10 h-10 object-cover border border-blue-200 p-0.5 rounded mr-3 bg-white shrink-0">
                  {(() => {
                     const u = allUsersData.find(x => x.username === toast.username) || onlineUsers.find(x => x.id === toast.username);
                     if (u && (u as any).profilePictureUrl) return <img src={(u as any).profilePictureUrl} className="w-full h-full object-cover rounded-sm" />;
                     return <MsnDefaultAvatar />;
                  })()}
                </div>
                <div className="text-sm font-sans flex-1">
                    <div className="text-blue-900 font-bold truncate pr-2">{toast.fullName}</div>
                    <div className="text-blue-700/80 text-xs mt-0.5">acaba de iniciar sesión.</div>
                </div>
            </div>
         ))}
      </div>
      <style>{\`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      \`}</style>
`;
content = content.replace('</>\n  );\n};\n', '\n' + toastRender + '\n</>\n  );\n};\n');


fs.writeFileSync(chatFile, content, 'utf8');
console.log('ChatLocal.tsx updated successfully.');
