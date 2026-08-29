import React, { useState, useEffect, useRef, Component } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { User, Profession } from '../types';
import { users as allUsers } from '../data/userData';

// ─── Profession helpers ──────────────────────────────────────────────────────

const getPrefix = (profession: Profession): string => {
  switch (profession) {
    case 'medicina': return 'Dr. ';
    case 'nutricion': return 'Nta. ';
    case 'psicologia': return 'Ps. ';
    case 'enfermeria': return 'Enf. ';
    case 'tens': return 'TENS. ';
    case 'asistente_social': return 'TS. ';
    case 'quimico_farmaceutico': return 'QF ';
    case 'odontologia': return 'OD ';
    case 'kinesiologo': return 'Kn. ';
    case 'matroneria': return 'Mat. ';
    default: return '';
  }
};

const getProfessionLabel = (profession: Profession): string => {
  const map: Record<Profession, string> = {
    medicina: 'Médico',
    enfermeria: 'Enfermero/a',
    tens: 'TENS',
    matroneria: 'Matrón/a',
    odontologia: 'Odontólogo/a',
    asistente_social: 'Trabajador social',
    quimico_farmaceutico: 'Químico farmacéutico',
    nutricion: 'Nutricionista',
    psicologia: 'Psicólogo/a',
    kinesiologo: 'Kinesiólogo/a',
  };
  return map[profession] || profession;
};

// ─── Date formatter ──────────────────────────────────────────────────────────

const formatSocialDate = (date: any): string => {
  if (!date) return 'Ahora mismo';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `Hoy a las ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface SocialPost {
  id: string;
  authorUsername: string;
  authorName: string;
  authorProfession: Profession;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  feedType: 'comunidad' | 'perfil';
  likes: string[];
  reactions?: Record<string, string>;
  commentsCount: number;
  createdAt: any;
}

interface SocialComment {
  id: string;
  postId: string;
  authorUsername: string;
  authorName: string;
  authorProfession: Profession;
  authorAvatar: string;
  content: string;
  createdAt: any;
}

// ─── Default avatar ──────────────────────────────────────────────────────────

const DefaultAvatar: React.FC<{ size?: string }> = ({ size = 'w-full h-full' }) => (
  <div className={`${size} bg-gradient-to-b from-white to-slate-200 relative flex flex-col items-center justify-end overflow-hidden`}>
    <div className="w-[45%] aspect-square bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-[5%] shadow-sm"></div>
    <div className="w-[90%] h-[40%] bg-gradient-to-t from-green-400 to-green-500 rounded-t-full shadow-sm"></div>
  </div>
);

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconHeart: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const IconComment = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

// ─── Error Boundary ──────────────────────────────────────────────────────────

class FeedErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;
  setState: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 text-sm font-bold mb-1">Error al cargar el muro</p>
          <p className="text-red-500 text-xs">{this.state.error}</p>
          <button onClick={() => this.setState({ hasError: false, error: '' })} className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Avatar wrapper ──────────────────────────────────────────────────────────

const UserAvatar: React.FC<{ src?: string; size?: string; className?: string }> = ({ src, size = 'w-10 h-10', className = '' }) => (
  <div className={`${size} rounded-full overflow-hidden border border-slate-200 shrink-0 ${className}`}>
    {src ? <img src={src} className="w-full h-full object-cover" alt="" /> : <DefaultAvatar />}
  </div>
);

// ─── Post Comments ───────────────────────────────────────────────────────────

const PostComments: React.FC<{ postId: string; loggedInUser: User }> = ({ postId, loggedInUser }) => {
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch all comments ordered by date, filter client-side to avoid composite index
    const q = query(collection(db, 'social_comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: SocialComment[] = [];
      snap.forEach(d => {
        const data = d.data() as Omit<SocialComment, 'id'>;
        if (data.postId === postId) list.push({ id: d.id, ...data });
      });
      setComments(list);
    }, (err) => console.error('comments listener error:', err));
    return unsub;
  }, [postId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const text = commentText;
    setCommentText('');
    try {
      await addDoc(collection(db, 'social_comments'), {
        postId,
        authorUsername: loggedInUser.username,
        authorName: loggedInUser.fullName,
        authorProfession: loggedInUser.profession,
        authorAvatar: (loggedInUser as any).profilePictureUrl || '',
        content: text,
        createdAt: new Date(),
      });
      await updateDoc(doc(db, 'social_posts', postId), { commentsCount: comments.length + 1 });
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    try {
      await deleteDoc(doc(db, 'social_comments', commentId));
      await updateDoc(doc(db, 'social_posts', postId), { commentsCount: Math.max(0, comments.length - 1) });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
      {comments.map(c => (
        <div key={c.id} className="flex gap-2 items-start text-xs group">
          <UserAvatar src={c.authorAvatar} size="w-7 h-7" />
          <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm relative">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-bold text-slate-800">{getPrefix(c.authorProfession)}{c.authorName}</span>
              <span className="text-[9px] text-slate-400 ml-2 shrink-0">{formatSocialDate(c.createdAt)}</span>
            </div>
            <p className="text-slate-700 leading-snug break-words whitespace-pre-wrap">{c.content}</p>
            {c.authorUsername === loggedInUser.username && (
              <button onClick={() => handleDelete(c.id)} className="absolute right-2 bottom-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                <IconTrash />
              </button>
            )}
          </div>
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex gap-2 items-center">
        <UserAvatar src={(loggedInUser as any).profilePictureUrl} size="w-8 h-8" />
        <div className="flex-1 flex gap-1.5 items-center bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 shadow-sm">
          <input
            type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="Escribe un comentario..." disabled={isSubmitting}
            className="flex-1 text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
          />
          <button type="submit" disabled={!commentText.trim() || isSubmitting} className="text-sky-600 hover:text-sky-700 disabled:opacity-40 p-0.5">
            <IconSend />
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Post Card ───────────────────────────────────────────────────────────────

const PostCard: React.FC<{ post: SocialPost; loggedInUser: User; onViewUser: (u: string) => void }> = ({ post, loggedInUser, onViewUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = post.reactions || {};
  const likes = post.likes || [];
  
  const allReactions = { ...reactions };
  likes.forEach(user => {
    if (!allReactions[user]) allReactions[user] = 'like';
  });

  const myReaction = allReactions[loggedInUser.username];

  const handleReaction = async (type: string) => {
    setShowReactions(false);
    try {
      if (myReaction === type) {
        const newReactions = { ...reactions };
        delete newReactions[loggedInUser.username];
        await updateDoc(doc(db, 'social_posts', post.id), {
          reactions: newReactions,
          likes: arrayRemove(loggedInUser.username)
        });
      } else {
        await updateDoc(doc(db, 'social_posts', post.id), {
          [`reactions.${loggedInUser.username}`]: type,
          likes: arrayRemove(loggedInUser.username)
        });
      }
    } catch (err) { console.error(err); }
  };

  const reactionIcons: Record<string, string> = {
    like: '👍', love: '❤️', haha: '😂', wow: '😲', sad: '😢', angry: '😡'
  };
  const reactionColors: Record<string, string> = {
    like: 'text-blue-600', love: 'text-red-500', haha: 'text-yellow-500', wow: 'text-yellow-500', sad: 'text-yellow-500', angry: 'text-orange-500'
  };
  const reactionLabels: Record<string, string> = {
    like: 'Me gusta', love: 'Me encanta', haha: 'Me divierte', wow: 'Me asombra', sad: 'Me entristece', angry: 'Me enoja'
  };

  const reactionCounts = Object.values(allReactions).reduce((acc, curr) => {
    const key = String(curr);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topReactions = Object.entries(reactionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  const totalReactions = Object.keys(allReactions).length;

  const deletePost = async () => {
    if (!window.confirm('¿Eliminar esta publicación?')) return;
    try { await deleteDoc(doc(db, 'social_posts', post.id)); } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div onClick={() => onViewUser(post.authorUsername)} className="cursor-pointer hover:scale-105 transition-transform">
            <UserAvatar src={post.authorAvatar} size="w-10 h-10" />
          </div>
          <div>
            <h4 onClick={() => onViewUser(post.authorUsername)} className="font-bold text-slate-800 text-sm hover:text-sky-600 cursor-pointer transition-colors">
              {getPrefix(post.authorProfession)}{post.authorName}
            </h4>
            <p className="text-[10px] text-slate-400">@{post.authorUsername} · {formatSocialDate(post.createdAt)}</p>
          </div>
        </div>
        {post.authorUsername === loggedInUser.username && (
          <button onClick={deletePost} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-slate-50">
            <IconTrash />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="px-4 pb-3 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>}

      {/* Image */}
      {post.imageUrl && (
        <div className="px-4 pb-3">
          <div className="rounded-lg overflow-hidden border border-slate-100 max-h-96 bg-slate-50 flex justify-center">
            <img src={post.imageUrl} className="w-full object-cover max-h-96" alt="Attachment" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-1.5">
          {totalReactions > 0 ? (
            <>
              <div className="flex -space-x-1">
                {topReactions.map(r => (
                  <span key={r} className="bg-slate-50 border border-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm z-10">{reactionIcons[r]}</span>
                ))}
              </div>
              <span className="ml-1">{totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}</span>
            </>
          ) : (
            <span>0 reacciones</span>
          )}
        </div>
        <button onClick={() => setShowComments(v => !v)} className="hover:text-sky-600 transition-colors cursor-pointer">
          {post.commentsCount || 0} comentarios
        </button>
      </div>

      {/* Actions */}
      <div className="px-1 border-t border-slate-100 flex relative">
        <div 
          className="flex-1 relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {showReactions && (
            <div className="absolute bottom-full left-2 pb-2 z-50">
              <div className="bg-white border border-slate-200 shadow-xl rounded-full px-3 py-1.5 flex gap-2">
                {Object.entries(reactionIcons).map(([key, icon]) => (
                  <button
                    key={key}
                    onClick={(e) => { e.stopPropagation(); handleReaction(key); }}
                    className="text-2xl hover:scale-150 hover:-translate-y-3 transition-all duration-200 origin-bottom cursor-pointer transform"
                    title={reactionLabels[key]}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button 
            onClick={() => handleReaction('like')} 
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors hover:bg-slate-50 ${myReaction ? reactionColors[myReaction] : 'text-slate-500 hover:text-slate-600'}`}
          >
            {myReaction ? <span className="text-sm">{reactionIcons[myReaction]}</span> : <IconHeart filled={false} />}
            <span className="uppercase">{myReaction ? reactionLabels[myReaction] : 'ME GUSTA'}</span>
          </button>
        </div>
        <button onClick={() => setShowComments(v => !v)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 hover:bg-slate-50 cursor-pointer transition-colors">
          <IconComment /><span>COMENTAR</span>
        </button>
      </div>

      {showComments && <PostComments postId={post.id} loggedInUser={loggedInUser} />}
    </div>
  );
};

// ─── Tab Nav Bar ─────────────────────────────────────────────────────────────

interface TabNavBarProps {
  activeTab: 'inicio' | 'comunidad' | 'perfil';
  setActiveTab: (t: 'inicio' | 'comunidad' | 'perfil') => void;
}

export const TabNavBar: React.FC<TabNavBarProps> = ({ activeTab, setActiveTab }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex justify-between gap-1 w-full select-none shrink-0">
    {([['inicio', 'INICIO', <IconHome />], ['comunidad', 'COMUNIDAD', <IconUsers />], ['perfil', 'PERFIL', <IconUser />]] as const).map(([tab, label, icon]) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${activeTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
      >
        {icon}<span>{label}</span>
      </button>
    ))}
  </div>
);

// ─── Comunidad Feed ──────────────────────────────────────────────────────────

export const ComunidadFeed: React.FC<{ loggedInUser: User; onViewUserProfile: (u: string) => void }> = ({ loggedInUser, onViewUserProfile }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Order by createdAt DESC; filter feedType client-side (no composite index needed)
    const q = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => {
        const list: SocialPost[] = [];
        snap.forEach(d => {
          const data = d.data() as Omit<SocialPost, 'id'>;
          if (data.feedType === 'comunidad') list.push({ id: d.id, ...data });
        });
        setPosts(list);
        setLoadError('');
      },
      (err) => {
        console.error('Comunidad feed error:', err);
        setLoadError(err.message);
      }
    );
    return unsub;
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setSelectedImage(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !selectedImage) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'social_posts'), {
        authorUsername: loggedInUser.username,
        authorName: loggedInUser.fullName,
        authorProfession: loggedInUser.profession,
        authorAvatar: (loggedInUser as any).profilePictureUrl || '',
        content: postText,
        imageUrl: selectedImage || '',
        feedType: 'comunidad',
        likes: [],
        reactions: {},
        commentsCount: 0,
        createdAt: new Date(),
      });
      setPostText(''); setSelectedImage(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  if (loadError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-700 text-sm font-bold mb-1">Error al cargar publicaciones</p>
      <p className="text-red-400 text-xs">{loadError}</p>
    </div>
  );

  return (
    <FeedErrorBoundary>
      <div className="flex flex-col gap-4">
        {/* Create Post */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-3 items-start">
              <UserAvatar src={(loggedInUser as any).profilePictureUrl} size="w-10 h-10" />
              <textarea
                value={postText} onChange={e => setPostText(e.target.value)}
                placeholder="¿Qué estás pensando?"
                disabled={isSubmitting}
                className="flex-1 text-sm outline-none resize-none bg-transparent placeholder-slate-400 text-slate-800 py-1.5 min-h-[60px]"
              />
            </div>

            {selectedImage && (
              <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200 max-h-48 shadow-sm ml-13">
                <img src={selectedImage} className="h-44 w-auto object-cover" alt="Preview" />
                <button type="button" onClick={() => { setSelectedImage(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full p-1 cursor-pointer shadow">
                  <IconX />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={isSubmitting}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                <IconImage /><span className="text-green-600">Añadir foto</span>
              </button>
              <input type="file" ref={fileRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button type="submit" disabled={(!postText.trim() && !selectedImage) || isSubmitting}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 px-5 rounded-lg shadow disabled:opacity-50 transition-colors cursor-pointer">
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <div className="flex justify-center mb-2"><IconUsers /></div>
            <p className="text-sm font-medium">Aún no hay publicaciones en Comunidad.</p>
            <p className="text-xs mt-1">¡Sé el primero en compartir algo con el equipo!</p>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} loggedInUser={loggedInUser} onViewUser={onViewUserProfile} />)
        )}
      </div>
    </FeedErrorBoundary>
  );
};

// ─── Perfil Feed ─────────────────────────────────────────────────────────────

export const PerfilFeed: React.FC<{
  loggedInUser: User;
  selectedUsername: string;
  setSelectedUsername: (u: string) => void;
  onViewUserProfile: (u: string) => void;
}> = ({ loggedInUser, selectedUsername, setSelectedUsername, onViewUserProfile }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadError, setLoadError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const targetUser = allUsers.find(u => u.username === selectedUsername) || loggedInUser;
  const isOwnProfile = selectedUsername === loggedInUser.username;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    // Order by createdAt DESC; filter feedType + authorUsername client-side
    const q = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q,
      (snap) => {
        const list: SocialPost[] = [];
        snap.forEach(d => {
          const data = d.data() as Omit<SocialPost, 'id'>;
          // Show all posts (comunidad + perfil) by the selected user
          if (data.authorUsername === selectedUsername) {
            list.push({ id: d.id, ...data });
          }
        });
        setPosts(list);
        setLoadError('');
      },
      (err) => {
        console.error('Perfil feed error:', err);
        setLoadError(err.message);
      }
    );
    return unsub;
  }, [selectedUsername]);

  const handleTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'social_posts'), {
        authorUsername: loggedInUser.username,
        authorName: loggedInUser.fullName,
        authorProfession: loggedInUser.profession,
        authorAvatar: (loggedInUser as any).profilePictureUrl || '',
        content: postText,
        imageUrl: '',
        feedType: 'perfil',
        likes: [],
        commentsCount: 0,
        createdAt: new Date(),
      });
      setPostText('');
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const filteredUsers = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20);

  if (loadError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-red-700 text-sm font-bold mb-1">Error al cargar el perfil</p>
      <p className="text-red-400 text-xs">{loadError}</p>
    </div>
  );

  return (
    <FeedErrorBoundary>
      <div className="flex flex-col gap-4">
        {/* User search bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="flex-1 relative">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 focus-within:bg-white shadow-inner gap-2">
              <IconSearch />
              <input
                type="text" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Buscar perfil de un compañero..."
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setShowSuggestions(false); }} className="text-slate-400 hover:text-slate-600">
                  <IconX />
                </button>
              )}
            </div>
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">No se encontraron compañeros.</p>
                ) : filteredUsers.map(u => (
                  <div key={u.username} onClick={() => { setSelectedUsername(u.username); setSearchTerm(''); setShowSuggestions(false); }}
                    className="px-3 py-2 text-xs border-b border-slate-50 hover:bg-sky-500 hover:text-white text-slate-700 cursor-pointer flex justify-between items-center transition-colors">
                    <span className="font-bold">{getPrefix(u.profession)}{u.fullName}</span>
                    <span className="opacity-60 text-[10px]">@{u.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isOwnProfile && (
            <button onClick={() => setSelectedUsername(loggedInUser.username)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 py-1.5 px-3 rounded-lg border border-sky-200 hover:bg-sky-50 transition-all cursor-pointer whitespace-nowrap">
              Mi perfil
            </button>
          )}
        </div>


        {/* Tweet box (own profile only) */}
        {isOwnProfile && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <form onSubmit={handleTweet} className="space-y-3">
              <div className="flex gap-3 items-start">
                <UserAvatar src={(loggedInUser as any).profilePictureUrl} size="w-8 h-8" />
                <textarea value={postText} onChange={e => setPostText(e.target.value)}
                  placeholder="¿Qué estás pensando?" disabled={isSubmitting}
                  className="flex-1 text-sm outline-none resize-none bg-transparent placeholder-slate-400 text-slate-800 py-1 min-h-[50px]"
                />
              </div>
              <div className="flex justify-end border-t border-slate-100 pt-2.5">
                <button type="submit" disabled={!postText.trim() || isSubmitting}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow disabled:opacity-50 transition-colors cursor-pointer">
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            <div className="flex justify-center mb-2"><IconUser /></div>
            <p className="text-sm font-medium">Aún no hay publicaciones en este perfil.</p>
            <p className="text-xs mt-1">{isOwnProfile ? '¡Escribe tu primera actualización de estado!' : 'Este compañero aún no ha publicado nada.'}</p>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} loggedInUser={loggedInUser} onViewUser={onViewUserProfile} />)
        )}
      </div>
    </FeedErrorBoundary>
  );
};

// ─── ComunidadView Unified Component ──────────────────────────────────────────

interface ComunidadViewProps {
  loggedInUser: User;
  onBackToMenu: () => void;
}

interface InstaNote {
  id: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: any;
}

export const ComunidadView: React.FC<ComunidadViewProps> = ({ loggedInUser, onBackToMenu }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [notes, setNotes] = useState<InstaNote[]>([]);
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'notes' | 'emails' | 'calls' | 'tasks' | 'meetings'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Selected profile to show on details (defaults to loggedInUser)
  const [viewedUser, setViewedUser] = useState<User>(loggedInUser);
  const [leftTab, setLeftTab] = useState<'about' | 'address'>('about');

  // Rich post elements state
  const [codeSnippet, setCodeSnippet] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  useEffect(() => {
    // 1. Fetch posts
    const qPosts = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts,
      (snap) => {
        const list: any[] = [];
        snap.forEach(d => {
          const data = d.data();
          list.push({ id: d.id, ...data });
        });
        setPosts(list);
        setLoadError('');
      },
      (err) => {
        console.error('Comunidad posts error:', err);
        setLoadError(err.message);
      }
    );

    // 2. Fetch Instagram-like notes
    const qNotes = query(collection(db, 'social_notes'), orderBy('createdAt', 'desc'));
    const unsubNotes = onSnapshot(qNotes,
      (snap) => {
        const list: any[] = [];
        snap.forEach(d => {
          list.push({ id: d.id, ...d.data() });
        });
        setNotes(list);
      },
      (err) => console.error('Comunidad notes error:', err)
    );

    return () => {
      unsubPosts();
      unsubNotes();
    };
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !postTitle.trim() && !codeSnippet && !fileName && !meetingTitle) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'social_posts'), {
        authorUsername: loggedInUser.username,
        authorName: loggedInUser.fullName,
        authorProfession: loggedInUser.profession,
        authorAvatar: (loggedInUser as any).profilePictureUrl || '',
        title: postTitle.trim() || 'Publicación',
        content: postText,
        imageUrl: '',
        feedType: 'comunidad',
        likes: [],
        reactions: {},
        commentsCount: 0,
        createdAt: new Date(),
        codeSnippet: codeSnippet || '',
        fileName: fileName || '',
        fileSize: fileSize || '',
        meetingTitle: meetingTitle || '',
        meetingTime: meetingTime || '',
        isSystemEvent: false,
      });

      // Clear fields
      setPostText('');
      setPostTitle('');
      setCodeSnippet('');
      setFileName('');
      setFileSize('');
      setMeetingTitle('');
      setMeetingTime('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNote = async () => {
    const existingNote = notes.find(n => n.authorUsername === loggedInUser.username);
    const textPrompt = window.prompt(
      '¿Qué nota/estado quieres compartir hoy? (Máx 60 caracteres):',
      existingNote ? existingNote.text : ''
    );
    
    if (textPrompt === null) return;
    
    if (textPrompt.trim() === '') {
      try {
        await deleteDoc(doc(db, 'social_notes', loggedInUser.username));
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await setDoc(doc(db, 'social_notes', loggedInUser.username), {
          authorUsername: loggedInUser.username,
          authorName: loggedInUser.fullName,
          authorAvatar: (loggedInUser as any).profilePictureUrl || '',
          text: textPrompt.substring(0, 60),
          createdAt: new Date()
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'notes' && p.meetingTitle) return false;
    if (activeFilter === 'meetings' && !p.meetingTitle) return false;
    if (activeFilter === 'emails' && !p.fileName) return false;
    
    if (searchQuery.trim() === '') return true;
    const queryLower = searchQuery.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(queryLower)) ||
      (p.content && p.content.toLowerCase().includes(queryLower)) ||
      (p.authorName && p.authorName.toLowerCase().includes(queryLower))
    );
  });

  const ownNote = notes.find(n => n.authorUsername === loggedInUser.username);
  const otherNotes = notes.filter(n => n.authorUsername !== loggedInUser.username);

  return (
    <div className="w-full bg-[#F3F4F6] h-full overflow-hidden flex flex-col font-sans text-slate-800 select-none">
      
      {/* Top Header */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 z-10 shadow-3xs">
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1 text-sky-600">💬 Comunidad</span>
          <span className="text-slate-350">/</span>
          <span className="text-slate-700">Muro Clínico</span>
        </div>
        <button onClick={onBackToMenu} className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-3xs">
          Cerrar e Ir al Menú
        </button>
      </div>

      {/* Main Workspace: 2 Columns matching the layout of the mockup */}
      <div className="flex-1 flex overflow-hidden w-full relative p-4 gap-4">
        
        {/* === COLUMN 1: Stories row, Composer & Feed (Left - 70% width) === */}
        <div className="flex-grow w-2/3 flex flex-col overflow-y-auto custom-scrollbar gap-4">
          
          {/* Mockup Top: Stories row */}
          <div className="bg-white rounded-xl border border-slate-250/60 p-4 flex gap-4 overflow-x-auto custom-scrollbar flex-shrink-0 items-center">
            
            {/* Logged in User story note bubble */}
            <div className="flex flex-col items-center relative cursor-pointer flex-shrink-0" onClick={handleCreateNote}>
              <div className="relative mb-1">
                <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-sky-400 to-indigo-500">
                  <UserAvatar src={(loggedInUser as any).profilePictureUrl} size="w-full h-full border-2 border-white" />
                </div>
                <span className="absolute -bottom-1 -right-0.5 w-5.5 h-5.5 bg-sky-600 border-2 border-white text-white font-bold text-xs rounded-full flex items-center justify-center shadow-xs">+</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">Tu nota</span>

              {ownNote && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-md text-[9px] max-w-[85px] font-semibold text-slate-700 text-center truncate">
                  💭 {ownNote.text}
                </div>
              )}
            </div>

            {/* Other colleagues notes */}
            {otherNotes.map(n => {
              const colleague = allUsers.find(u => u.username === n.authorUsername);
              return (
                <div 
                  key={n.id} 
                  className="flex flex-col items-center relative cursor-pointer flex-shrink-0"
                  onClick={() => {
                    if (colleague) setViewedUser(colleague);
                  }}
                >
                  <div className="relative mb-1">
                    <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-400 to-indigo-500">
                      <UserAvatar src={n.authorAvatar} size="w-full h-full border-2 border-white" />
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-slate-650 font-bold truncate max-w-[70px]">
                    {n.authorName.split(' ')[0]}
                  </span>

                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-md text-[9px] max-w-[85px] font-semibold text-slate-700 text-center truncate">
                    {n.text}
                  </div>
                </div>
              );
            })}

            {otherNotes.length === 0 && !ownNote && (
              <p className="text-[11px] text-slate-400 italic pl-2">Deja una nota para iniciar la conversación...</p>
            )}
          </div>

          {/* Mockup Middle: Post Composer Card */}
          <div className="bg-white rounded-xl border border-slate-250/60 p-4 flex-shrink-0 flex flex-col gap-3.5 shadow-3xs">
            <div className="flex gap-3 items-center">
              <UserAvatar src={(loggedInUser as any).profilePictureUrl} size="w-10 h-10" />
              <input
                type="text"
                placeholder="¿Qué estás pensando compartir con tu equipo?"
                value={postText}
                onChange={e => setPostText(e.target.value)}
                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs outline-none text-slate-800 placeholder-slate-400 border border-transparent focus:border-slate-200 focus:bg-white transition-all"
              />
              <button 
                onClick={handleCreatePost}
                disabled={(!postText.trim() && !codeSnippet && !fileName && !meetingTitle) || isSubmitting}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Publicando...' : 'Compartir Post'}
              </button>
            </div>

            {/* Composer toolbar */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-slate-500 text-xs font-semibold">
              <div className="flex gap-4">
                <button type="button" onClick={() => setFileName(prompt('Nombre del archivo:') || '')} className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                  <span>📎</span> Documento
                </button>
                <button type="button" onClick={() => setMeetingTitle(prompt('Título de la reunión:') || '')} className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                  <span>🎥</span> Reunión
                </button>
                <button type="button" onClick={() => setCodeSnippet(prompt('Código / Pauta clínica:') || '')} className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                  <span>💻</span> Código / Pauta
                </button>
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Comunidad CESFAM
              </div>
            </div>

            {/* Attachment alerts inside composer */}
            {(fileName || meetingTitle) && (
              <div className="flex gap-2 flex-wrap pt-1.5 border-t border-slate-50">
                {fileName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[10.5px] font-bold text-sky-700">
                    📄 {fileName}
                    <button type="button" onClick={() => { setFileName(''); setFileSize(''); }} className="ml-1 text-red-500 font-bold hover:text-red-700">✕</button>
                  </span>
                )}
                {meetingTitle && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10.5px] font-bold text-emerald-700">
                    🎥 {meetingTitle}
                    <button type="button" onClick={() => { setMeetingTitle(''); setMeetingTime(''); }} className="ml-1 text-red-500 font-bold hover:text-red-700">✕</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs italic shadow-3xs">
                No hay publicaciones registradas.
              </div>
            ) : (
              filteredPosts.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-250/60 p-4 shadow-3xs flex flex-col gap-3 relative hover:border-slate-350 transition-all group">
                  
                  {/* Post Header */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <UserAvatar src={p.authorAvatar} size="w-9 h-9 border border-slate-100 shadow-3xs" />
                      <div>
                        <p className="font-bold text-slate-800 hover:underline hover:text-sky-600 cursor-pointer" onClick={() => {
                          const colleague = allUsers.find(u => u.username === p.authorUsername);
                          if (colleague) setViewedUser(colleague);
                        }}>
                          {getPrefix(p.authorProfession)}{p.authorName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{getProfessionLabel(p.authorProfession)} · {formatSocialDate(p.createdAt)}</p>
                      </div>
                    </div>
                    {p.authorUsername === loggedInUser.username && (
                      <button
                        onClick={async () => {
                          if (window.confirm("¿Deseas eliminar este post?")) {
                            try {
                              await deleteDoc(doc(db, 'social_posts', p.id));
                            } catch (err) { console.error(err); }
                          }
                        }}
                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Post Body Text */}
                  <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-1">
                    {p.content}
                  </div>

                  {/* Google Meet Card */}
                  {p.meetingTitle && (
                    <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-3xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">🎥</span>
                        <div className="text-[11px] truncate">
                          <p className="font-bold text-slate-800 truncate">{p.meetingTitle}</p>
                          <p className="text-slate-400 text-[9.5px] truncate">{p.meetingTime || 'Agenda por definir'}</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer shrink-0 shadow-3xs">
                        Unirse
                      </button>
                    </div>
                  )}

                  {/* File Card */}
                  {p.fileName && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-3xs max-w-xs">
                      <span className="text-base shrink-0">📄</span>
                      <div className="text-[11px] truncate">
                        <p className="font-bold text-slate-800 truncate">{p.fileName}</p>
                        <p className="text-slate-400 text-[9.5px] truncate">{p.fileSize || 'Descargar'}</p>
                      </div>
                    </div>
                  )}

                  {/* Code snippet block */}
                  {p.codeSnippet && (
                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto text-[10px] font-mono text-emerald-400 shadow-inner">
                      <pre className="whitespace-pre">{p.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Reactions bar */}
                  <div className="border-t border-slate-100 pt-3 flex gap-8 text-slate-450 text-[11px] font-bold">
                    <button
                      onClick={async () => {
                        const hasLiked = p.likes.includes(loggedInUser.username);
                        try {
                          await updateDoc(doc(db, 'social_posts', p.id), {
                            likes: hasLiked ? arrayRemove(loggedInUser.username) : arrayUnion(loggedInUser.username)
                          });
                        } catch (e) { console.error(e); }
                      }}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        p.likes.includes(loggedInUser.username) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <span>{p.likes.includes(loggedInUser.username) ? '❤️' : '🤍'}</span>
                      <span>{p.likes.length} Likes</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-sky-650 transition-colors cursor-pointer">
                      <span>💬</span>
                      <span>{p.commentsCount || 0} Comentarios</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* === COLUMN 2: Messages & Events Sidebar (Right - 30% width) === */}
        <div className="w-[320px] flex flex-col gap-4 flex-shrink-0 overflow-y-auto custom-scrollbar">
          
          {/* Mockup Card 1: Messages / Active colleagues */}
          <div className="bg-white rounded-xl border border-slate-250/60 p-4 flex flex-col gap-3 shadow-3xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-850 border-b border-slate-100 pb-2.5">
              <span>Colegas Conectados</span>
              <button className="text-sky-600 font-bold hover:underline cursor-pointer">Nuevo</button>
            </div>
            
            {/* Colleagues list */}
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {allUsers.map(u => (
                <div
                  key={u.username}
                  onClick={() => setViewedUser(u)}
                  className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <UserAvatar src={u.profilePictureUrl} size="w-8 h-8 border border-slate-200" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
                    </div>
                    <div className="text-[11px] leading-tight min-w-0">
                      <p className="font-bold text-slate-800 truncate">{getPrefix(u.profession)}{u.fullName}</p>
                      <p className="text-[9.5px] text-slate-400 truncate">{getProfessionLabel(u.profession)}</p>
                    </div>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-semibold">Mensaje</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Card 2: Events / Reuniones */}
          <div className="bg-white rounded-xl border border-slate-250/60 p-4 flex flex-col gap-3 shadow-3xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-850 border-b border-slate-100 pb-2.5">
              <span>Próximas Reuniones</span>
              <span className="text-slate-400">🕒</span>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {posts.filter(p => p.meetingTitle).map(p => (
                <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-normal flex flex-col gap-1 shadow-3xs">
                  <p className="font-bold text-slate-800 truncate">📅 {p.meetingTitle}</p>
                  <div className="text-[9.5px] text-slate-400">
                    <p>Horario: {p.meetingTime || 'Por agendar'}</p>
                    <p className="mt-0.5">Organiza: @{p.authorUsername}</p>
                  </div>
                </div>
              ))}
              {posts.filter(p => p.meetingTitle).length === 0 && (
                <p className="text-[10px] text-slate-400 italic text-center py-2">No hay reuniones calendarizadas.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
