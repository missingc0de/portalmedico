const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Message Grouping (Refined)
// Update consecutive message logic to make bubbles connect seamlessly
content = content.replace(
  /const isConsecutive = prevMsg && prevMsg\.senderUsername === msg\.senderUsername(.*?);/g,
  `const isConsecutive = prevMsg && prevMsg.senderUsername === msg.senderUsername && !msg.isNudge && !prevMsg?.isNudge && (msg.timestamp?.toMillis ? msg.timestamp.toMillis() : 0) - (prevMsg.timestamp?.toMillis ? prevMsg.timestamp.toMillis() : 0) < 5 * 60 * 1000;
                      const nextMsg = index < activeMessages.length - 1 ? activeMessages[index + 1] : null;
                      const isNextConsecutive = nextMsg && nextMsg.senderUsername === msg.senderUsername && !msg.isNudge && !nextMsg?.isNudge && (nextMsg.timestamp?.toMillis ? nextMsg.timestamp.toMillis() : 0) - (msg.timestamp?.toMillis ? msg.timestamp.toMillis() : 0) < 5 * 60 * 1000;`
);

// Update message container rendering to use rounded corners dynamically based on consecutiveness
content = content.replace(
  /<div key=\{msg\.id\} className=\{\`flex flex-col \$\{isMe \? 'items-end' : 'items-start'\} \$\{isConsecutive \? 'mt-\[1px\]' : 'mt-3'\}\`\}>/g,
  `<div key={msg.id} className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'} \${isConsecutive ? 'mt-0.5' : 'mt-3'}\`}>`
);

// Update bubble rendering classes
const roundedRegex = /className=\{\`px-3 py-2 flex flex-col relative min-w-\[80px\] rounded-lg shadow-sm text-sm break-words max-w-\[85%\] border \$\{amIMentioned([\s\S]*?)border-slate-200 rounded-tl-none'\n\s*\}\`\}/g;
content = content.replace(roundedRegex, `className={\`px-3 py-2 flex flex-col relative min-w-[80px] shadow-sm text-sm break-words max-w-[85%] border \${
                                    amIMentioned ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400 text-slate-800'
                                    : isMe ? 'bg-sky-100 text-slate-800 border-sky-300 shadow-sky-100/50'
                                    : 'bg-white text-slate-800 border-slate-200'
                                  } \${
                                    isMe 
                                     ? (isConsecutive && isNextConsecutive ? 'rounded-l-lg rounded-r-sm' : isConsecutive ? 'rounded-tl-lg rounded-bl-lg rounded-tr-sm rounded-br-lg' : isNextConsecutive ? 'rounded-tl-lg rounded-bl-lg rounded-tr-lg rounded-br-sm' : 'rounded-lg rounded-tr-none')
                                     : (isConsecutive && isNextConsecutive ? 'rounded-r-lg rounded-l-sm' : isConsecutive ? 'rounded-tr-lg rounded-br-lg rounded-tl-sm rounded-bl-lg' : isNextConsecutive ? 'rounded-tr-lg rounded-br-lg rounded-tl-lg rounded-bl-sm' : 'rounded-lg rounded-tl-none')
                                  }\`}`);


// 4. Read Receipts logic: 1 grey tick sent, 2 grey received, 2 blue read
const receiptsRegex = /\{msg\.status === 'read' \? '✓✓' : msg\.status === 'received' \? '✓✓' : '✓'\}/g;
content = content.replace(receiptsRegex, `
                                    {msg.status === 'read' ? (
                                      <span className="text-blue-500 text-[10px] tracking-tighter">✓✓</span>
                                    ) : msg.status === 'received' ? (
                                      <span className="text-slate-400 text-[10px] tracking-tighter">✓✓</span>
                                    ) : (
                                      <span className="text-slate-400 text-[10px]">✓</span>
                                    )}
                                  `);

// Remove old class from the span wrapping the ticks
content = content.replace(/<span className=\{\`font-bold tracking-tighter leading-none \$\{msg\.status === 'read' \? 'text-blue-500' : 'text-sky-700\/50'\}\`\}>/g, `<span className="font-bold leading-none flex items-center h-full">`);


// 5. Autoscroll behavior improvements (smooth when open, auto when first loaded)
const scrollRegex = /const scrollToBottom = \(\) => \{\n\s*messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);\n\s*\};/g;
content = content.replace(scrollRegex, `const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };`);

// Update the useEffect that triggers scroll
const useEffectScrollRegex = /useEffect\(\(\) => \{\n\s*if \(isOpen\) scrollToBottom\(\);\n\s*\}, \[messagesGeneral, messagesNoticias, messagesPrivate, isOpen, activeChannel\]\);/g;
content = content.replace(useEffectScrollRegex, `useEffect(() => {
    if (isOpen) {
       // Si es la primera vez que se abre en este render, usa auto para no hacer animación brusca
       scrollToBottom('smooth');
    }
  }, [messagesGeneral, messagesNoticias, messagesPrivate, isOpen, activeChannel]);`);


fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully refined chat functionality for a fresh prompt execution.');
