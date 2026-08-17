const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'ChatLocal.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Fix unread filter logic
code = code.replace(/m\.status !== 'read'/g, "(m.status === 'sent' || m.status === 'received')");

// 2. Fix the message bubble to include time and read receipts inside
const oldBubbleStart = `<div\\s*className=\\{[\\s\\S]*?px-3 py-2 rounded-lg shadow-sm text-sm break-words max-w-\\[85%\\] border.*?\\}\\}\`[\\s\\S]*?>[\\s\\S]*?\\{renderMessageText\\([\\s\\S]*?\\)\\}[\\s\\S]*?<\\/div>`;
const oldTicks = `<div className=\\{[\\s\\S]*?flex items-center space-x-1 text-\\[10px\\] text-slate-400 mt-0\\.5 px-1[\\s\\S]*?\\}>[\\s\\S]*?<span>\\{formatTime[\\s\\S]*?\\}<\\/span>[\\s\\S]*?\\{isMe && activeChannel\\.startsWith\\('private_'\\) && \\([\\s\\S]*?<span className=\\{.*?\\}>[\\s\\S]*?\\{msg\\.status === 'read'[\\s\\S]*?\\}[\\s\\S]*?<\\/span>[\\s\\S]*?\\)\\}[\\s\\S]*?<\\/div>`;

const regex = new RegExp(`(${oldBubbleStart})\\s*(${oldTicks})`, 'm');
code = code.replace(regex, (match) => {
  return `
                            <div
                              className={\`px-3 py-2 flex flex-col relative min-w-[80px] rounded-lg shadow-sm text-sm break-words max-w-[85%] border \${
                                amIMentioned
                                  ? 'bg-rose-50 border-rose-300 rounded-tl-none ring-1 ring-rose-400'
                                  : isMe
                                    ? 'bg-sky-100 text-slate-800 border-sky-300 rounded-tr-none shadow-sky-100/50'
                                    : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                              }\`}
                            >
                              <div className="mb-0.5">{renderMessageText(msg.text)}</div>
                              <div className={\`self-end flex items-center space-x-1 text-[9px] -mb-1 mt-0.5 \${isMe ? 'text-sky-700/60' : 'text-slate-400/80'}\`}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isMe && activeChannel.startsWith('private_') && (
                                  <span className={\`font-bold tracking-tighter leading-none \${msg.status === 'read' ? 'text-blue-500' : 'text-sky-700/50'}\`}>
                                    {msg.status === 'read' ? '✓✓' : msg.status === 'received' ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>`;
});


fs.writeFileSync(filePath, code);
console.log("UI updated!");
