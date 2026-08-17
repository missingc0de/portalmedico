const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'ChatLocal.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. MsnDefaultAvatar update
content = content.replace(
  /const MsnDefaultAvatar = \(\) => \([\s\S]*?<\/div>\s*\n\);/,
  `const MsnDefaultAvatar = () => (
  <div className="w-full h-full bg-gradient-to-b from-white to-slate-200 relative p-[5%] shadow-inner flex flex-col items-center justify-end overflow-hidden border border-slate-300">
    <div className="w-[45%] aspect-square bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-[5%] shadow-sm"></div>
    <div className="w-[90%] h-[40%] bg-gradient-to-t from-green-400 to-green-500 rounded-t-full shadow-sm"></div>
  </div>
);`
);

// 2. Avatar cropping logic update
// Find the block:
/*
                           const img = new Image();
                           img.onload = () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = 100;
                              canvas.height = 100;
                              const ctx = canvas.getContext('2d');
                              if(ctx){ ctx.drawImage(img, 0, 0, 100, 100);
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                              setMyProfile(prev => ({...prev, profilePictureUrl: compressedBase64})); }
                           };
*/

const oldImgLoadRegex = /const img = new Image\(\);\s*img\.onload = \(\) => \{\s*const canvas = document\.createElement\('canvas'\);\s*canvas\.width = \d+;\s*canvas\.height = \d+;\s*const ctx = canvas\.getContext\('2d'\);\s*if\(ctx\)\{\s*ctx\.drawImage[\s\S]*?setMyProfile[\s\S]*?\}\s*\};\s*img\.src/g;

const newImgLoadCode = `const img = new Image();
                           img.onload = async () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = 102;
                              canvas.height = 102;
                              const ctx = canvas.getContext('2d');
                              if(ctx){ 
                                 const size = Math.min(img.width, img.height);
                                 const sx = (img.width - size) / 2;
                                 const sy = (img.height - size) / 2;
                                 ctx.drawImage(img, sx, sy, size, size, 0, 0, 102, 102);
                                 const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                                 setMyProfile(prev => ({...prev, profilePictureUrl: compressedBase64})); 
                                 // Force propagate
                                 try {
                                    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                                    const { db } = await import('../firebase');
                                    await setDoc(doc(db, 'presence', loggedInUser.username), { profilePictureUrl: compressedBase64, lastSeen: serverTimestamp() }, { merge: true });
                                    await setDoc(doc(db, 'chat_users', loggedInUser.username), { profilePictureUrl: compressedBase64, lastSeen: serverTimestamp() }, { merge: true });
                                 } catch(e) { console.error('Error forcing pic upload:', e); }
                              }
                           };
                           img.src`;

content = content.replace(oldImgLoadRegex, newImgLoadCode);

// 3. To make sure the small avatar replacement also gets the bigger default sizing, we need to check lines like:
// {myProfile.profilePictureUrl ? <img src={myProfile.profilePictureUrl} className="w-full h-full object-cover" /> : <div className="w-10 h-10 bg-gradient-to-b from-white to-slate-200 relative p-1 flex flex-col items-center justify-end overflow-hidden border border-slate-300"><div className="w-4 h-4 bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-0.5" /><div className="w-8 h-4 bg-gradient-to-t from-green-400 to-green-500 rounded-t-full" /></div>}
// We should replace that ugly inline div with <MsnDefaultAvatar />
content = content.replace(
  /<div className="w-10 h-10 bg-gradient-to-b from-white to-slate-200 relative p-1 flex flex-col items-center justify-end overflow-hidden border border-slate-300"><div className="w-4 h-4 bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-0.5" \/><div className="w-8 h-4 bg-gradient-to-t from-green-400 to-green-500 rounded-t-full" \/><\/div>/g,
  '<div className="w-full h-full"><MsnDefaultAvatar /></div>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('ChatLocal updated successfully');
