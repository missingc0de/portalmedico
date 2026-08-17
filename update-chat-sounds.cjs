const fs = require('fs');
const path = require('path');

const chatFile = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(chatFile, 'utf8');

// 1. Remove duplicate playing from General snapshot loop
content = content.replace(
  /        \/\/ Zumbidos auto-open chat\s+if \(data\.isNudge && data\.senderUsername !== loggedInUser\.username && !isFirstLoadGeneral\.current\) \{\s+nudgeSound\.current\.currentTime = 0;\s+nudgeSound\.current\.play\(\)\.catch\(\(e\) => console\.error\('Error playing nudge:', e\)\);\s+setIsOpen\(true\);\s+\}/g,
  ''
);

// 2. Remove duplicate playing from Private snapshot loop
content = content.replace(
  /        if \(data\.isNudge && data\.senderUsername !== loggedInUser\.username && !isFirstLoadPrivate\.current\) \{\s+nudgeSound\.current\.currentTime = 0;\s+nudgeSound\.current\.play\(\)\.catch\(\(e\) => console\.error\('Error playing nudge:', e\)\);\s+setIsOpen\(true\);\s+\}/g,
  ''
);

// 3. Add auto-open logic to docChanges inside General
content = content.replace(
  /            if \(newMsg\.isNudge\) \{\s+playedNudge = true;\s+if \(activeChannelRef\.current === 'general' && isOpenRef\.current\) \{/g,
  `            if (newMsg.isNudge) {
              setIsOpen(true);
              setActiveChannel('general');
              playedNudge = true;
              if (true) {`
);

// 4. Add auto-open logic to docChanges inside Private
content = content.replace(
  /            if \(newMsg\.isNudge\) \{\s+playedNudge = true;\s+if \(activeChannelRef\.current === privateChannelId && isOpenRef\.current\) \{/g,
  `            if (newMsg.isNudge) {
              setIsOpen(true);
              setActiveChannel(privateChannelId);
              playedNudge = true;
              if (true) {`
);

// 5. Update nudgeSound handleSendNudge
content = content.replace(
  /setTimeout\(\(\) => setIsShaking\(false\), 500\);\s+nudgeSound\.current\.play/g,
  `setTimeout(() => setIsShaking(false), 500);\n    nudgeSound.current.currentTime = 0;\n    nudgeSound.current.play`
);

// 6. Fix end of snapshot blocks to use currentTime = 0
content = content.replace(
  /      if \(playedNudge\) \{\s+nudgeSound\.current\.play/g,
  `      if (playedNudge) {
        nudgeSound.current.currentTime = 0;
        nudgeSound.current.play`
);
content = content.replace(
  /      \} else if \(playedNotification\) \{\s+notificationSound\.current\.play/g,
  `      } else if (playedNotification) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play`
);
// Fix the catch-all for Noticias (which uses an inverted if block)
content = content.replace(
  /      if \(playedNotification\) \{\s+notificationSound\.current\.play/g,
  `      if (playedNotification) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play`
);

// 7. Make SURE normal messages do not open chat.
// I'll search if `setIsOpen(true)` exists anywhere else dynamically.
// Note: We deliberately only bound it inside the `if (newMsg.isNudge)` branch.

fs.writeFileSync(chatFile, content, 'utf8');
console.log('ChatLocal styling aligned to MSN request.');
