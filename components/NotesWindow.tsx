import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesWindowProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

// ── Paleta: Tonos Claros y Coherentes con el Messenger ───────────────────────
const N = {
  bg: '#f1f5f9', // Slate 100
  titleBar: '#e2e8f0', // Slate 200
  editor: '#ffffff', // White
  menuBar: '#f1f5f9', // Slate 100
  sidebar: '#f8fafc', // Slate 50
  textMain: 'rgba(15,23,42,1)', // Slate 900
  textDim: 'rgba(71,85,105,1)', // Slate 600
  textMuted: 'rgba(148,163,184,1)', // Slate 400
  textFaint: 'rgba(148,163,184,0.6)', // Slate 400 with opacity
  textMenu: 'rgba(51,65,85,1)', // Slate 700
  accent: '#0284c7', // Sky 600 (Messenger sky-blue)
  border: 'rgba(226,232,240,1)', // Slate 200 (border-slate-200)
  hover: 'rgba(226,232,240,0.6)', // Slate 200 with opacity
  hoverItem: 'rgba(226,232,240,0.4)', // Slate 200 with opacity
  active: 'rgba(226,232,240,0.8)', // Slate 200 with opacity
};

const STORAGE_KEY = 'portalmedico_notes';
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
};

// ── Icons (tonos oscuros/sky) ────────────────────────────────────────────────
const NotepadIcon = ({ sz = 15 }: { sz?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={sz} height={sz} fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2"
      fill="rgba(2,132,199,0.04)" stroke="rgba(71,85,105,0.8)" strokeWidth="1.5" />
    <line x1="8" y1="7" x2="16" y2="7" stroke="rgba(71,85,105,0.8)" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="8" y1="11" x2="16" y2="11" stroke="rgba(71,85,105,0.8)" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="8" y1="15" x2="12" y2="15" stroke="rgba(71,85,105,0.8)" strokeWidth="1.4" strokeLinecap="round" />
    <rect x="9" y="0" width="6" height="4" rx="1"
      fill="rgba(2,132,199,0.15)" stroke="rgba(71,85,105,0.6)" strokeWidth="1" />
  </svg>
);

const CloseX = ({ sz = 11 }: { sz?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = ({ sz = 14 }: { sz?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = ({ sz = 11 }: { sz?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const SidebarIcon = ({ sz = 15 }: { sz?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

// ── Confirmation dialog ───────────────────────────────────────────────────────
interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmDialog: React.FC<ConfirmProps> = ({ message, onConfirm, onCancel }) => (
  <div
    className="absolute inset-0 flex items-center justify-center z-50"
    style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
    onClick={onCancel}
  >
    <div
      className="rounded-lg p-5 flex flex-col gap-4"
      style={{
        background: '#ffffff',
        border: `1px solid ${N.border}`,
        boxShadow: '0 16px 48px rgba(15,23,42,0.12)',
        minWidth: 300,
        maxWidth: 360,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
          style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div>
          <p style={{ color: N.textMain, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Eliminar nota
          </p>
          <p style={{ color: N.textDim, fontSize: 13, lineHeight: 1.5 }}>{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          style={{
            padding: '6px 16px', borderRadius: 5, fontSize: 13, cursor: 'pointer',
            background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '6px 16px', borderRadius: 5, fontSize: 13, cursor: 'pointer',
            background: '#dc2626', color: '#fff', border: '1px solid #ef4444', fontFamily: 'inherit',
            fontWeight: 600,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
          onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────────
export const NotesWindow: React.FC<NotesWindowProps> = ({ isOpen, onClose, username }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persistence & Sync ──────────────────────────────────────────────────────────
  const persist = useCallback((list: Note[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* quota */ }
    if (username) {
      const maxUpdated = list.reduce((max, n) => Math.max(max, n.updatedAt || 0), 0);
      setDoc(doc(db, 'notes_backup', username), {
        notes: list,
        updatedAt: maxUpdated
      }, { merge: true }).catch(err => {
        console.error("Error backing up notes to cloud:", err);
      });
    }
  }, [username]);

  useEffect(() => {
    // 1. Initial load from localStorage
    let localList: Note[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Note[] = JSON.parse(raw);
        if (parsed.length > 0) {
          localList = parsed;
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading local notes:", e);
    }

    if (localList.length === 0) {
      const welcome: Note = { id: generateId(), title: 'Sin título', content: '', createdAt: Date.now(), updatedAt: Date.now() };
      localList = [welcome];
      setNotes(localList);
      setActiveNoteId(welcome.id);
      persist(localList);
    }

    // 2. Fetch from cloud database and merge/sync
    const fetchCloudNotes = async () => {
      if (!username) return;
      try {
        const docRef = doc(db, 'notes_backup', username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          const cloudList: Note[] = cloudData.notes || [];
          const cloudUpdatedAt: number = cloudData.updatedAt || 0;

          // Compute max updatedAt of local notes
          const localMaxUpdated = localList.reduce((max, n) => Math.max(max, n.updatedAt || 0), 0);

          // If cloud notes exist and cloud is newer, OR local is just the default single empty welcome note and cloud is not empty
          const isLocalDefault = localList.length === 1 && localList[0].title === 'Sin título' && localList[0].content === '';

          if (cloudList.length > 0 && (cloudUpdatedAt > localMaxUpdated || isLocalDefault)) {
            setNotes(cloudList);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudList)); } catch { }
            if (cloudList.length > 0) {
              setActiveNoteId(cloudList[0].id);
            }
          } else if (localList.length > 0 && localMaxUpdated > cloudUpdatedAt) {
            // Local is newer, upload local notes to cloud
            await setDoc(doc(db, 'notes_backup', username), {
              notes: localList,
              updatedAt: localMaxUpdated
            }, { merge: true });
          }
        } else {
          // No cloud notes found, let's back up the current local ones
          if (localList.length > 0) {
            const localMaxUpdated = localList.reduce((max, n) => Math.max(max, n.updatedAt || 0), 0);
            await setDoc(doc(db, 'notes_backup', username), {
              notes: localList,
              updatedAt: localMaxUpdated
            }, { merge: true });
          }
        }
      } catch (err) {
        console.error("Error fetching/syncing cloud notes:", err);
      }
    };

    fetchCloudNotes();
  }, [username]);

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const createNote = () => {
    const n: Note = { id: generateId(), title: 'Sin título', content: '', createdAt: Date.now(), updatedAt: Date.now() };
    const list = [n, ...notes];
    setNotes(list); setActiveNoteId(n.id); persist(list);
    setTimeout(() => textareaRef.current?.focus(), 60);
  };

  // Pide confirmación antes de borrar
  const requestDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete({ id, title });
  };

  const confirmDeleteNote = () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    if (notes.length === 1) {
      const reset = { ...notes[0], title: 'Sin título', content: '', updatedAt: Date.now() };
      const list = [reset]; setNotes(list); persist(list); return;
    }
    const list = notes.filter(n => n.id !== id);
    setNotes(list); persist(list);
    if (activeNoteId === id) setActiveNoteId(list[0].id);
  };

  const updateContent = (content: string) => {
    if (!activeNoteId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setNotes(prev => {
      const list = prev.map(n => n.id === activeNoteId ? { ...n, content, updatedAt: Date.now() } : n);
      saveTimeout.current = setTimeout(() => persist(list), 400);
      return list;
    });
  };

  const commitTitleEdit = (id: string, title: string) => {
    const trimmed = title.trim() || 'Sin título';
    setNotes(prev => {
      const list = prev.map(n => n.id === id ? { ...n, title: trimmed, updatedAt: Date.now() } : n);
      persist(list); return list;
    });
    setEditingTitleId(null);
  };

  useEffect(() => {
    if (editingTitleId) setTimeout(() => titleInputRef.current?.select(), 30);
  }, [editingTitleId]);

  useEffect(() => {
    if (!showMenu) return;
    const h = () => setShowMenu(null);
    window.addEventListener('click', h); return () => window.removeEventListener('click', h);
  }, [showMenu]);

  if (!isOpen) return null;

  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeNote?.content.length ?? 0;
  const lineCount = activeNote ? activeNote.content.split('\n').length : 1;

  // ── Icono botón en titlebar ───────────────────────────────────────────────────
  const TitleBarBtn = ({
    onClick, title: ttl, children, danger = false,
  }: { onClick: () => void; title: string; children: React.ReactNode; danger?: boolean }) => (
    <button
      onClick={onClick} title={ttl}
      style={{
        width: 40, height: 34, color: N.textDim, background: 'transparent',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? '#c42b1c' : N.hover;
        if (danger) e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = N.textDim;
      }}
    >
      {children}
    </button>
  );

  // ── Menu defs ────────────────────────────────────────────────────────────────
  const menus: Record<string, { label: string; action: () => void; shortcut?: string }[]> = {
    Archivo: [
      { label: 'Nueva nota', action: createNote, shortcut: 'Ctrl+N' },
      { label: '─────────', action: () => { } },
      { label: 'Cerrar', action: onClose, shortcut: 'Ctrl+W' },
    ],
    Editar: [
      { label: 'Seleccionar todo', action: () => textareaRef.current?.select(), shortcut: 'Ctrl+A' },
    ],
    Ver: [
      { label: showSidebar ? '✓ Lista de notas' : 'Lista de notas', action: () => setShowSidebar(v => !v) },
    ],
  };

  return (
    <div
      className="z-[65] flex flex-col"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: 750,
        height: 550,
        background: N.bg,
        borderRadius: 8,
        border: `1px solid ${N.border}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Confirm dialog overlay ─────────────────────────────────────────── */}
      {confirmDelete && (
        <ConfirmDialog
          message={`¿Seguro que quieres eliminar "${confirmDelete.title || 'Sin título'}"? Esta acción es irreversible.`}
          onConfirm={confirmDeleteNote}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Title bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0"
        style={{ height: 34, background: N.titleBar, borderBottom: `1px solid ${N.border}` }}>

        {/* Left: sidebar toggle + icon + title */}
        <div className="flex items-center" style={{ paddingLeft: 4 }}>
          <TitleBarBtn onClick={() => setShowSidebar(v => !v)} title="Panel de notas">
            <SidebarIcon />
          </TitleBarBtn>
          <div className="flex items-center gap-2" style={{ paddingLeft: 4 }}>
            <NotepadIcon sz={15} />
            <span style={{ color: N.textDim, fontSize: 12 }}>
              {activeNote?.title || 'Sin título'} – Bloc de Notas
            </span>
          </div>
        </div>

        {/* Right: + nueva nota | minimizar */}
        <div className="flex items-center">
          <TitleBarBtn onClick={createNote} title="Nueva nota (Ctrl+N)">
            <PlusIcon sz={15} />
          </TitleBarBtn>
          <TitleBarBtn onClick={onClose} title="Minimizar">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </TitleBarBtn>
        </div>
      </div>

      {/* ── Menu bar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center px-2 shrink-0 relative"
        style={{ height: 28, background: N.menuBar, borderBottom: `1px solid ${N.border}`, gap: 2 }}>
        {Object.entries(menus).map(([name, items]) => (
          <div key={name} className="relative">
            <button className="px-2 py-0.5 text-xs rounded"
              style={{
                color: showMenu === name ? N.textMain : N.textMenu,
                background: showMenu === name ? N.active : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
              onClick={e => { e.stopPropagation(); setShowMenu(showMenu === name ? null : name); }}
              onMouseEnter={e => {
                if (!showMenu || showMenu !== name) return;
                setShowMenu(name);
              }}>
              {name}
            </button>
            {showMenu === name && (
              <div className="absolute left-0 top-full z-50 rounded py-1"
                style={{
                  background: '#ffffff', border: `1px solid ${N.border}`,
                  boxShadow: '0 8px 24px rgba(15,23,42,0.12)', minWidth: 190,
                }}
                onClick={e => e.stopPropagation()}>
                {items.map((item, i) =>
                  item.label.startsWith('─') ? (
                    <div key={i} style={{ height: 1, background: N.border, margin: '4px 8px' }} />
                  ) : (
                    <button key={i} className="w-full flex items-center justify-between px-3 py-1.5 text-xs"
                      style={{ color: N.textMenu, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.background = N.hover)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => { item.action(); setShowMenu(null); }}>
                      <span>{item.label}</span>
                      {item.shortcut && <span style={{ color: N.textMuted, marginLeft: 24 }}>{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        {/* Decorative right toolbar (like Notepad photo) */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 rounded border"
            style={{ color: N.textMuted, borderColor: N.border, height: 20, fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>H1</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <button className="flex items-center gap-0.5 px-1.5 rounded border"
            style={{ color: N.textMuted, borderColor: N.border, height: 20, background: 'transparent', cursor: 'pointer', border: `1px solid ${N.border}` }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="flex items-center justify-center rounded"
            style={{ width: 20, height: 20, color: N.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        {showSidebar && (
          <div className="flex flex-col shrink-0 overflow-hidden"
            style={{ width: 190, background: N.sidebar, borderRight: `1px solid ${N.border}` }}>

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 shrink-0"
              style={{ borderBottom: `1px solid ${N.border}` }}>
              <span style={{ color: N.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Notas ({notes.length})
              </span>
              <button onClick={createNote}
                style={{ width: 20, height: 20, color: N.textDim, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
                title="Nueva nota"
                onMouseEnter={e => (e.currentTarget.style.background = N.hover)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <PlusIcon sz={14} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notes.map(note => {
                const isAct = note.id === activeNoteId;
                const isEditing = editingTitleId === note.id;
                return (
                  <div key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className="group flex items-start justify-between px-3 py-2 cursor-pointer"
                    style={{
                      background: isAct ? N.active : 'transparent',
                      borderLeft: isAct ? `2px solid ${N.accent}` : '2px solid transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = N.hoverItem; }}
                    onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = 'transparent'; }}>

                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          ref={titleInputRef}
                          value={editingTitleVal}
                          onChange={e => setEditingTitleVal(e.target.value)}
                          onBlur={() => commitTitleEdit(note.id, editingTitleVal)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitTitleEdit(note.id, editingTitleVal);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '100%', background: '#ffffff',
                            color: N.textMain,
                            border: `1px solid ${N.accent}`, borderRadius: 3,
                            fontSize: 14, fontWeight: 600, padding: '1px 4px',
                            outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                      ) : (
                        <p className="text-sm font-semibold truncate"
                          style={{ color: isAct ? N.textMain : N.textDim }}
                          title="Doble clic para editar el nombre"
                          onDoubleClick={e => {
                            e.stopPropagation();
                            setEditingTitleId(note.id);
                            setEditingTitleVal(note.title || 'Sin título');
                          }}>
                          {note.title || 'Sin título'}
                        </p>
                      )}
                      <p className="text-xs truncate mt-0.5" style={{ color: N.textMuted }}>
                        {note.content.replace(/\n/g, ' ').substring(0, 35) || 'Nota vacía'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: N.textFaint }}>
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>

                    <button
                      onClick={e => requestDelete(note.id, note.title, e)}
                      className="shrink-0 ml-1 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      style={{ width: 15, height: 15, color: N.textMuted, background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 2 }}
                      title="Eliminar nota"
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = N.textMuted; e.currentTarget.style.background = 'transparent'; }}>
                      <TrashIcon sz={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: N.editor }}>
          {activeNote ? (
            <textarea
              ref={textareaRef}
              value={activeNote.content}
              onChange={e => updateContent(e.target.value)}
              onKeyDown={e => {
                if (e.ctrlKey && e.key === 'n') { e.preventDefault(); createNote(); }
                if (e.ctrlKey && e.key === 'w') { e.preventDefault(); onClose(); }
              }}
              className="flex-1 w-full resize-none outline-none p-4"
              style={{
                background: N.editor, color: N.textMain,
                fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
                fontSize: 16, lineHeight: 1.65,
                caretColor: N.accent, border: 'none',
              }}
              placeholder="Empieza a escribir..."
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ color: N.textMuted }}>
              <p className="text-sm">Ninguna nota seleccionada</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 24, background: 'rgba(0,0,0,0.35)', borderTop: `1px solid ${N.border}`, fontSize: 11, color: N.textMuted }}>
        <span>Ln {lineCount}, Col {(activeNote?.content.split('\n').pop()?.length ?? 0) + 1}</span>
        <div className="flex items-center gap-4">
          <span>{charCount} car.</span>
          <span>{wordCount} palabras</span>
          <span>UTF-8</span>
          <span style={{ color: N.textDim }}>💾 Auto-guardado</span>
        </div>
      </div>
    </div>
  );
};
