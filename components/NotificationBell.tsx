import React, { useState, useEffect, useRef } from 'react';
import {
  db,
} from '../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import { User } from '../types';
import { users as allUsers } from '../data/userData';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  recipientUsername: string;
  type: 'new_post' | 'like' | 'comment' | 'mention';
  actorUsername: string;
  actorName: string;
  postId: string;
  postPreview: string;
  commentPreview?: string;
  createdAt: any;
  read: boolean;
}

// ─── Notification creators (exported for use in SocialFeed) ──────────────────

/** Notifies all users (except poster) about a new comunidad post. */
export const createNewPostNotifications = async (
  actorUsername: string,
  actorName: string,
  postId: string,
  postContent: string,
) => {
  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const user of allUsers) {
      if (user.username === actorUsername) continue;
      const notifRef = doc(collection(db, 'notifications'));
      batch.set(notifRef, {
        recipientUsername: user.username,
        type: 'new_post',
        actorUsername,
        actorName,
        postId,
        postPreview: postContent.substring(0, 100),
        read: false,
        createdAt: new Date(),
      });
      count++;
      if (count >= 480) break; // Firestore batch limit safety
    }
    await batch.commit();
  } catch (err) {
    console.error('createNewPostNotifications error:', err);
  }
};

/** Creates/overwrites a like notification (idempotent by doc ID). */
export const createLikeNotification = async (
  actorUsername: string,
  actorName: string,
  authorUsername: string,
  postId: string,
  postContent: string,
) => {
  if (actorUsername === authorUsername) return;
  try {
    const docId = `like_${postId}_${actorUsername}`;
    await setDoc(doc(db, 'notifications', docId), {
      recipientUsername: authorUsername,
      type: 'like',
      actorUsername,
      actorName,
      postId,
      postPreview: postContent.substring(0, 100),
      read: false,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('createLikeNotification error:', err);
  }
};

/** Creates a comment notification for the post author. */
export const createCommentNotification = async (
  actorUsername: string,
  actorName: string,
  authorUsername: string,
  postId: string,
  postContent: string,
  commentText: string,
) => {
  if (actorUsername === authorUsername) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientUsername: authorUsername,
      type: 'comment',
      actorUsername,
      actorName,
      postId,
      postPreview: postContent.substring(0, 100),
      commentPreview: commentText.substring(0, 80),
      read: false,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('createCommentNotification error:', err);
  }
};

/** Detects @username mentions and creates mention notifications. */
export const createMentionNotifications = async (
  content: string,
  actorUsername: string,
  actorName: string,
  postId: string,
) => {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return;
  const mentioned = [...new Set(matches.map(m => m.slice(1)))];
  for (const username of mentioned) {
    if (username === actorUsername) continue;
    const exists = allUsers.some(u => u.username === username);
    if (!exists) continue;
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientUsername: username,
        type: 'mention',
        actorUsername,
        actorName,
        postId,
        postPreview: content.substring(0, 100),
        read: false,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('createMentionNotification error:', err);
    }
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatNotifDate = (date: any): string => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `Hace ${hours}h`;
  return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getNotifEmoji = (type: AppNotification['type']): string => {
  switch (type) {
    case 'new_post': return '📢';
    case 'like':     return '❤️';
    case 'comment':  return '💬';
    case 'mention':  return '🔔';
  }
};

const getNotifMessage = (n: AppNotification): string => {
  switch (n.type) {
    case 'new_post': return `${n.actorName} publicó en Comunidad`;
    case 'like':     return `${n.actorName} marcó "Me gusta" en tu publicación`;
    case 'comment':  return `${n.actorName} comentó tu publicación`;
    case 'mention':  return `${n.actorName} te mencionó en una publicación`;
  }
};

// ─── Bell Icon SVG ────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

interface NotificationBellProps {
  loggedInUser: User;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ loggedInUser }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Firestore listener ──
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('recipientUsername', '==', loggedInUser.username),
    );
    const unsub = onSnapshot(q,
      (snap) => {
        const list: AppNotification[] = [];
        snap.forEach(d => list.push({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) }));
        list.sort((a, b) => {
          const getTs = (n: AppNotification) => {
            if (!n || !n.createdAt) return 0;
            if (typeof n.createdAt?.toDate === 'function') {
              try { return n.createdAt.toDate().getTime(); } catch (e) { return 0; }
            }
            if (n.createdAt instanceof Date) return n.createdAt.getTime();
            const d = new Date(n.createdAt);
            return isNaN(d.getTime()) ? 0 : d.getTime();
          };
          return getTs(b) - getTs(a);
        });
        setNotifications(list.slice(0, 40));
      },
      (err) => console.error('notifications listener:', err),
    );
    return unsub;
  }, [loggedInUser.username]);

  // ── Close on outside click ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Mark all unread as read ──
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
    } catch (err) {
      console.error('markAllRead error:', err);
    }
  };

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && unreadCount > 0) markAllRead();
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        title="Notificaciones"
        className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 shadow border border-sky-700 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-[200] overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          {/* Panel header */}
          <div className="px-4 h-12 border-b border-slate-150 bg-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 text-slate-800">
              <BellIcon />
              <h3 className="text-[14px] font-bold tracking-wide">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shadow leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer transition-colors"
            >
              Todo leído
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-sm font-bold text-slate-700">Sin notificaciones</p>
                <p className="text-xs text-slate-400 mt-1">Las novedades del equipo aparecerán aquí</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 items-start transition-colors ${!n.read ? 'bg-sky-50/70' : 'bg-white hover:bg-slate-50'}`}
                >
                  <span className="text-xl shrink-0 mt-0.5 select-none">{getNotifEmoji(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 leading-snug">{getNotifMessage(n)}</p>
                    {(n.commentPreview || n.postPreview) && (
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2 italic font-medium">
                        "{n.commentPreview || n.postPreview}"
                      </p>
                    )}
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wide">{formatNotifDate(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5 shadow-sm" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-semibold">Mostrando las últimas {notifications.length} notificaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
