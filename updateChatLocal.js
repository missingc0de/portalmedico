const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Interfaces & State
content = content.replace(
  /timestamp: any;\n\}/g,
  `timestamp: any;\n  sharedId?: string;\n  status?: 'sent' | 'received' | 'read';\n}`
);

content = content.replace(
  /const \[onlineUsers, setOnlineUsers\] = useState<PresenceUser\[\]>\(\[\]\);/g,
  `const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);\n  const [historicalUsers, setHistoricalUsers] = useState<PresenceUser[]>([]);\n  const [channelUnread, setChannelUnread] = useState<Record<string, { count: number, lastTime: any }>>({});`
);

// 2. Clear unread on general/noticias channel open + Auto scroll
content = content.replace(
  /useEffect\(\(\) => \{\n    activeChannelRef\.current = activeChannel;\n    if \(isOpen\) scrollToBottom\(\);\n  \}, \[activeChannel, isOpen\]\);/g,
  `useEffect(() => {
    activeChannelRef.current = activeChannel;
    if (isOpen) {
      scrollToBottom();
      setChannelUnread(prev => ({ ...prev, [activeChannel]: { count: 0, lastTime: null } }));
    }
  }, [activeChannel, isOpen]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messagesGeneral, messagesNoticias, messagesPrivate, isOpen, activeChannel]);
  
  useEffect(() => {
    if (isOpen && activeChannel.startsWith('private_')) {
      const partnerUsername = activeChannel.replace('private_', '');
      const unreadMsgs = messagesPrivate.filter(m => m.senderUsername === partnerUsername && m.status !== 'read');
      if (unreadMsgs.length > 0) {
        unreadMsgs.forEach(m => {
          if (m.sharedId) {
             setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', m.sharedId), { status: 'read' }, { merge: true }).catch(()=>{});
             setDoc(doc(db, 'inbox', partnerUsername, 'messages', m.sharedId), { status: 'read' }, { merge: true }).catch(()=>{});
          }
        });
        setUnreadCount(prev => Math.max(0, prev - unreadMsgs.length));
      }
    }
  }, [isOpen, activeChannel, messagesPrivate]);`
);

// 3. Presence -> chat_users and historical subscription
content = content.replace(
  /await setDoc\(userPresenceRef, \{\n\s*fullName: loggedInUser\.fullName,\n\s*profession: loggedInUser\.profession,\n\s*box: computerBox,\n\s*sector: computerSector,\n\s*lastSeen: serverTimestamp\(\)\n\s*\}\);/g,
  `const payload = {
            fullName: loggedInUser.fullName,
            profession: loggedInUser.profession,
            box: computerBox,
            sector: computerSector,
            lastSeen: serverTimestamp()
          };
          await setDoc(userPresenceRef, payload);
          await setDoc(doc(db, 'chat_users', loggedInUser.username), payload, { merge: true });`
);

content = content.replace(
  /setPresenceOnline\(\);\n\s*const handleBeforeUnload = \(\) => setPresenceOffline\(\);/g,
  `setPresenceOnline();
    const handleBeforeUnload = () => setPresenceOffline();
    
    // Listen to historical users
    const unsubscribeHistory = onSnapshot(query(collection(db, 'chat_users')), (snapshot) => {
      const usersData: PresenceUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as PresenceUser);
      });
      setHistoricalUsers(usersData);
    });`
);

content = content.replace(
  /return \(\) => \{\n\s*window\.removeEventListener\('beforeunload', handleBeforeUnload\);\n\s*setPresenceOffline\(\);\n\s*\};/g,
  `return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setPresenceOffline();
      unsubscribeHistory();
    };`
);

// 4. Channel unread increments
content = content.replace(
  /if \(!isOpenRef\.current \|\| activeChannelRef\.current !== 'general'\) \{\n\s*setUnreadCount\(prev => prev \+ 1\);\n\s*\}/g,
  `if (!isOpenRef.current || activeChannelRef.current !== 'general') {
              setUnreadCount(prev => prev + 1);
              setChannelUnread(prev => ({
                ...prev,
                ['general']: { count: (prev['general']?.count || 0) + 1, lastTime: newMsg.timestamp }
              }));
            }`
);

content = content.replace(
  /if \(!isOpenRef\.current \|\| activeChannelRef\.current !== 'noticias'\) \{\n\s*setUnreadCount\(prev => prev \+ 1\);\n\s*\}/g,
  `if (!isOpenRef.current || activeChannelRef.current !== 'noticias') {
              setUnreadCount(prev => prev + 1);
              setChannelUnread(prev => ({
                ...prev,
                ['noticias']: { count: (prev['noticias']?.count || 0) + 1, lastTime: newMsg.timestamp }
              }));
            }`
);

// 5. Private message receipt handling
content = content.replace(
  /snapshot\.docChanges\(\)\.forEach\(change => \{\n\s*if \(change\.type === 'added' && !isFirstLoadPrivate\.current\) \{/g,
  `snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
           const newMsg = change.doc.data() as Message;
           if (newMsg.receiverUsername === loggedInUser.username && newMsg.status === 'sent' && newMsg.sharedId) {
             setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', newMsg.sharedId), { status: 'received' }, { merge: true }).catch(()=>{});
             setDoc(doc(db, 'inbox', newMsg.senderUsername, 'messages', newMsg.sharedId), { status: 'received' }, { merge: true }).catch(()=>{});
           }
        }
        
        if (change.type === 'added' && !isFirstLoadPrivate.current) {`
);

// 6. sendMessage payload modifications
content = content.replace(
  /const payload = \{\n\s*text: text,\n\s*senderName: myProfile\.visibleName \|\| loggedInUser\.fullName,\n\s*senderUsername: loggedInUser\.username,\n\s*senderProfession: loggedInUser\.profession,\n\s*senderBox: computerBox,\n\s*senderSector: computerSector,\n\s*isNudge: isNudge,\n\s*timestamp: serverTimestamp\(\),\n\s*\};/g,
  `const sharedId = Date.now().toString() + Math.random().toString(36).substring(2);
      const payload: any = {
        text: text,
        senderName: myProfile.visibleName || loggedInUser.fullName,
        senderUsername: loggedInUser.username,
        senderProfession: loggedInUser.profession,
        senderBox: computerBox,
        senderSector: computerSector,
        isNudge: isNudge,
        timestamp: serverTimestamp(),
        status: 'sent',
        sharedId: sharedId
      };`
);

content = content.replace(
  /\/\/ Write to Partner's inbox\n\s*await addDoc\(collection\(db, 'inbox', partnerUsername, 'messages'\), \{ \.\.\.payload, receiverUsername: partnerUsername \}\);\n\s*\/\/ Write to My Inbox \(so I can see my own sent messages\)\n\s*await addDoc\(collection\(db, 'inbox', loggedInUser\.username, 'messages'\), \{ \.\.\.payload, receiverUsername: partnerUsername \}\);/g,
  `// Write to Partner's inbox
        payload.receiverUsername = partnerUsername;
        await setDoc(doc(db, 'inbox', partnerUsername, 'messages', sharedId), payload);
        // Write to My Inbox
        await setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', sharedId), payload);`
);

// 7. sorting and user badge rendering logic
content = content.replace(
  /const getFilteredUsersList = \(\) => \{\n\s*const term = normalizeText\(searchTerm\);\n\s*return onlineUsers\.filter\(user => \n\s*user\.id !== loggedInUser\.username && \n\s*normalizeText\(user\.fullName\)\.includes\(term\)\n\s*\);\n\s*\};/g,
  `const lastMessageTime: Record<string, number> = {};
  messagesPrivate.forEach(m => {
    const otherUser = m.senderUsername === loggedInUser.username ? m.receiverUsername : m.senderUsername;
    if (otherUser && m.timestamp) {
      const time = m.timestamp.toMillis ? m.timestamp.toMillis() : 0;
      if (!lastMessageTime[otherUser] || time > lastMessageTime[otherUser]) {
        lastMessageTime[otherUser] = time;
      }
    }
  });

  const getUnreadForUser = (userId: string) => {
    const unread = messagesPrivate.filter(m => m.senderUsername === userId && m.status !== 'read');
    if (unread.length === 0) return null;
    const lastMsg = unread[unread.length - 1]; 
    return { count: unread.length, lastTime: lastMsg.timestamp };
  };

  const getSortedFilteredUsers = (usersList: PresenceUser[]) => {
    const term = normalizeText(searchTerm);
    return usersList
      .filter(user => user.id !== loggedInUser.username && normalizeText(user.fullName).includes(term))
      .sort((a, b) => {
        const timeA = lastMessageTime[a.id] || 0;
        const timeB = lastMessageTime[b.id] || 0;
        if (timeB !== timeA) return timeB - timeA;
        return a.fullName.localeCompare(b.fullName);
      });
  };

  const onlineFiltered = getSortedFilteredUsers(onlineUsers);
  const offlineFiltered = getSortedFilteredUsers(
    historicalUsers.filter(hu => !onlineUsers.some(ou => ou.id === hu.id))
  );`
);

// 8. Replace left sidebar users rendering
content = content.replace(
  /Conectados \(\{getFilteredUsersList\(\)\.length\}\)\n\s*<\/div>\n\n\s*{\/\* Usuarios Activos para Chats Privados \*\/}\n\s*\{getFilteredUsersList\(\)\.length === 0 \? \(\n\s*<p className="text-xs text-slate-400 text-center mt-2 pb-4">Nadie conectado\.<\/p>\n\s*\) : \(\n\s*getFilteredUsersList\(\)\.map\(user => \(/g,
  `Conectados ({onlineFiltered.length})
                  </div>

                  {onlineFiltered.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center mt-2 pb-4">Nadie conectado.</p>
                  ) : (
                    onlineFiltered.map(user => {
                      const unread = getUnreadForUser(user.id);
                      return (`
);

// End mapping parenthesis for list
content = content.replace(
  /<\!-- Usuarios Activos para Chats Privados -->/,
  `// Should not match`
);
// We need to inject the unread badge into the user list render and do disconnected list.
// We'll replace the full component from `<div className="w-full md:w-[220px]` down to the end of sidebar.
// But it's easier to just use string substitutions for specific lines.
content = content.replace(
  /<div className="flex-1 min-w-0">\n\s*<p className={`text-xs font-bold truncate \$\{activeChannel === `private_\$\{user.id\}` \? 'text-sky-800' : 'text-slate-700'\}`} title=\{user.fullName\}>\{user.fullName\}<\/p>/g,
  `<div className="flex-1 min-w-0 flex justify-between items-start">
                             <p className={\`text-xs font-bold truncate \${activeChannel === \`private_\${user.id}\` ? 'text-sky-800' : 'text-slate-700'}\`} title={user.fullName}>{user.fullName}</p>
                             {unread && (
                               <div className="flex flex-col items-end shrink-0 ml-1">
                                 <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{unread.count}</div>
                                 <span className="text-[8px] text-slate-400 mt-0.5">{formatTime(unread.lastTime)}</span>
                               </div>
                             )}
                           </div>`
);

// At the end of the mapped online users:
content = content.replace(
  / \)\)\n\s*\)}\n\s*<\/div>/g,
  ` )
                    })
                  )}

                  {offlineFiltered.length > 0 && (
                    <>
                      <div className="bg-slate-200/50 p-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-2">
                        Desconectado/a ({offlineFiltered.length})
                      </div>
                      {offlineFiltered.map(user => {
                        const unread = getUnreadForUser(user.id);
                        return (
                          <div 
                            key={user.id} 
                            onClick={() => setActiveChannel(\`private_\${user.id}\`)}
                            className={\`flex items-start space-x-2 p-2 px-3 transition-colors cursor-pointer border-y opacity-70 \${activeChannel === \`private_\${user.id}\` ? 'bg-sky-50 border-sky-200 opacity-100' : 'bg-transparent border-transparent hover:bg-slate-100 hover:opacity-100'}\`}
                          >
                            <div 
                              className="relative shrink-0 cursor-pointer transform hover:scale-105 transition-transform"
                              onClick={(e) => handleViewProfile(user, e)}
                              title="Ver Perfil"
                            >
                              <div className="w-8 h-8 rounded bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm border border-slate-300">
                                  {user.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0 flex justify-between items-start">
                              <div className="min-w-0">
                                <p className={\`text-xs font-bold truncate \${activeChannel === \`private_\${user.id}\` ? 'text-sky-800' : 'text-slate-600'}\`} title={user.fullName}>{user.fullName}</p>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  <span className="text-[9px] text-slate-400 bg-white px-1 rounded border border-slate-200 shadow-sm truncate max-w-full">SECTOR {user.sector.toUpperCase()}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 truncate mt-0.5 uppercase tracking-wide" title={user.profession}>{user.profession} · BOX {user.box}</p>
                              </div>
                              {unread && (
                                <div className="flex flex-col items-end shrink-0 ml-1">
                                  <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{unread.count}</div>
                                  <span className="text-[8px] text-slate-400 mt-0.5">{formatTime(unread.lastTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>`
);

// General/Noticias Badges on left sidebar
content = content.replace(
  /<p className=\{(.*?)'text-slate-700'\}\}>Noticias<\/p>/g,
  `<p className={$1'text-slate-700'}\}>Noticias</p>
                      {channelUnread['noticias']?.count > 0 && (
                        <div className="absolute right-2 top-2 flex flex-col items-end">
                           <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{channelUnread['noticias'].count}</div>
                           <span className="text-[8px] text-slate-500 mt-0.5">{formatTime(channelUnread['noticias'].lastTime)}</span>
                        </div>
                      )}`
);

content = content.replace(
  /<p className=\{(.*?)'text-slate-700'\}\}>Grupo General<\/p>/g,
  `<p className={$1'text-slate-700'}\}>Grupo General</p>
                      {channelUnread['general']?.count > 0 && (
                        <div className="absolute right-2 top-2 flex flex-col items-end">
                           <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{channelUnread['general'].count}</div>
                           <span className="text-[8px] text-slate-500 mt-0.5">{formatTime(channelUnread['general'].lastTime)}</span>
                        </div>
                      )}`
);
// Make general wrapper relative to contain absolute badge
content = content.replace(
  /className=\{(.*?)>Noticias/g,
  `className={$1 relative>Noticias`
);
// General channel wrapper
content = content.replace(
  /className=\{(.*?)>Grupo General/g,
  `className={$1 relative>Grupo General`
);
// For the replacement to work cleanly, I will just do:
content = content.replace(
  /className={`flex items-center space-x-2 p-2 px-3 mx-1 mb-2 rounded cursor-pointer transition-colors border/g,
  `className={\`relative flex items-center space-x-2 p-2 px-3 mx-1 mb-2 rounded cursor-pointer transition-colors border`
);
content = content.replace(
  /className={`flex items-center space-x-2 p-2 px-3 mx-1 rounded cursor-pointer transition-colors border/g,
  `className={\`relative flex items-center space-x-2 p-2 px-3 mx-1 rounded cursor-pointer transition-colors border`
);


// 9. Messages Grouping and Rendering
content = content.replace(
  /activeMessages\.map\(\(msg\) => \{/g,
  `activeMessages.map((msg, index) => {
                      const prevMsg = index > 0 ? activeMessages[index - 1] : null;
                      const isConsecutive = prevMsg && prevMsg.senderUsername === msg.senderUsername && !msg.isNudge && !prevMsg?.isNudge && (msg.timestamp?.toMillis ? msg.timestamp.toMillis() : 0) - (prevMsg.timestamp?.toMillis ? prevMsg.timestamp.toMillis() : 0) < 5 * 60 * 1000;
                      `
);


content = content.replace(
  /return \(\n\s*<div key=\{msg\.id\} className=\{\`flex flex-col \$\{isMe \? 'items-end' : 'items-start'\}\`\}>\n\s*<div className="flex items-baseline space-x-1 mb-1 px-1">/g,
  `return (
                          <div key={msg.id} className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'} \${isConsecutive ? 'mt-0.5' : 'mt-3'}\`}>
                            {!isConsecutive && (
                              <div className="flex items-baseline space-x-1 mb-1 px-1">`
);

content = content.replace(
  /\} \(\w+ \{msg\.senderBox\}\)\n\s*<\/span>\n\s*\)}/g,
  `} (BOX {msg.senderBox})
                                 </span>
                              )}`
);

content = content.replace(
  /\} \(\w+ \{msg\.senderBox\}\)\n\s*<\/span>\n\s*\)\}/g, // fix if already closed
  `} (BOX {msg.senderBox})
                                 </span>
                              )}`
);

content = content.replace(
  /<\/div>\n\s*<div\n\s*className=\{\`px-3 py-2/g,
  `</div>\n                            )}\n                            <div\n                              className={\`px-3 py-2`
);


// Handle read receipts for private messages (only ticks if senderUsername === loggedInUser.username)
content = content.replace(
  /<span className="text-\[9px\] text-slate-400 mt-0\.5 px-1">\n\s*\{formatTime\(msg\.timestamp\)\}\n\s*<\/span>\n\s*<\/div>/g,
  `<div className={\`flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5 px-1 \${isMe ? 'justify-end' : 'justify-start'}\`}>
                              <span>{formatTime(msg.timestamp)}</span>
                              {isMe && activeChannel.startsWith('private_') && (
                                <span className={\`font-bold text-xs tracking-tighter leading-none \${msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}\`}>
                                  {msg.status === 'read' ? '✓✓' : msg.status === 'received' ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>`
);


fs.writeFileSync(filePath, content);
console.log("ChatLocal.tsx updated successfully.");
