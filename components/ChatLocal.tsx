import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, setDoc, deleteDoc, getDoc, where, getDocs } from 'firebase/firestore';
import { User, CESFAM, Profession, Sector } from '../types';
import { users as allUsersData } from '../data/userData';
import { SSVBrowserWindow } from './SSVBrowserWindow';
import { CYBBrowserWindow } from './CYBBrowserWindow';
import { NotesWindow } from './NotesWindow';
import { CalculatorWindow } from './CalculatorWindow';
import { DriveEcicepWindow } from './DriveEcicepWindow';
import { GmailWindow } from './GmailWindow';
import { soundService } from '../services/soundService';
import { LoginToast } from './LoginToast';
import { showUserConnectNotification, showChatMessageNotification, requestNotificationPermission } from '../services/notificationService';

interface Message {
  id: string;
  text: string;
  senderName: string;
  senderUsername: string; // added to identify user distinct from Name
  receiverUsername?: string; // added for private messages
  senderProfession: string;
  senderBox?: string;
  senderSector?: string;
  isNudge?: boolean;
  timestamp: any;
  sharedId?: string;
  status?: 'sent' | 'received' | 'read';
}

interface PresenceUser {
  id: string; // username
  fullName: string;
  profession: string;
  box: string;
  sector: string;
  lastSeen: any;
  cesfam?: string;
  status?: string;
  profilePictureUrl?: string;
  typingTo?: string; // canal activo de escritura "general" o username
  presenceStatus?: string;
}

interface UserProfile {
  visibleName: string;
  status: string;
  profilePictureUrl?: string; // added to local profile state
}

interface ChatLocalProps {
  loggedInUser: User;
  computerBox: string;
  computerSector: string;
  isLowResources?: boolean;
  onViewSocialProfile?: (username: string) => void;
  onOpenMyProfile?: () => void;
  isDriveOpen: boolean;
  setIsDriveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCalcOpen: boolean;
  setIsCalcOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNotesOpen: boolean;
  setIsNotesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PROFESSION_ALIAS_LIST = [
  'médicos', 'enfermeras', 'nutricionistas', 'psicólogas',
  'kinesiologos', 'matronas', 'tens', 'quimicos',
  'asistentesocial', 'administrativos'
];

export const getCesfamInitials = (cesfam?: string) => {
  if (!cesfam) return null;
  const upper = cesfam.toUpperCase();
  if (upper.includes('SAN JUAN')) return 'SJ';
  if (upper.includes('TIERRAS BLANCAS')) return 'TB';
  if (upper.includes('LILA CORTÉS')) return 'LC';
  if (upper.includes('TONGOY')) return 'TG';
  if (upper.includes('SANTA CECILIA')) return 'SC';
  if (upper.includes('SERGIO AGUILAR')) return 'SA';
  if (upper.includes('EL SAUCE')) return 'ES';
  if (upper.includes('PUNTA MIRA')) return 'PM';
  if (upper.includes('PAN DE AZÚCAR')) return 'PA';
  const parts = upper.split(' ').filter(p => p.length > 2 && p !== 'CESFAM');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
  return upper.substring(0, 2);
};

const PROFESSION_TAGS: Record<string, string[]> = {
  'medicina': ['@médicos', '@medicos', '@doctores'],
  'enfermeria': ['@enfermeras', '@enfermeros', '@enfermería'],
  'nutricion': ['@nutricionistas', '@nutricionista'],
  'psicologia': ['@psicólogas', '@psicologas', '@psicólogos', '@psicologos'],
  'kinesiologo': ['@kinesiologos', '@kinesiólogos'],
  'matroneria': ['@matronas', '@matrones'],
  'tens': ['@tens'],
  'quimico_farmaceutico': ['@quimicos', '@farmaceuticos'],
  'asistente_social': ['@asistentesocial', '@asistentes'],
  'administrativo': ['@administrativos']
};

const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const replaceEmojis = (text: string) => {
  let t = text;
  t = t.replace(/:\)/g, '🙂');
  t = t.replace(/:D/g, '😃');
  t = t.replace(/:\(/g, '🙁');
  t = t.replace(/:P/gi, '😛');
  t = t.replace(/\(L\)/gi, '❤️');
  t = t.replace(/\(K\)/gi, '💋');
  t = t.replace(/\(Y\)/gi, '👍');
  t = t.replace(/\(N\)/gi, '👎');
  t = t.replace(/\(H\)/gi, '😎');
  return t;
};

const MsnDefaultAvatar = () => (
  <div className="w-full h-full bg-gradient-to-b from-white to-slate-200 relative p-[5%] shadow-inner flex flex-col items-center justify-end overflow-hidden border border-slate-300">
    <div className="w-[45%] aspect-square bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-[5%] shadow-sm"></div>
    <div className="w-[90%] h-[40%] bg-gradient-to-t from-green-400 to-green-500 rounded-t-full shadow-sm"></div>
  </div>
);

export const LinkedInDefaultAvatar = () => (
  <div className="w-full h-full bg-[#e8e4df] flex items-center justify-center relative overflow-hidden">
    {/* Head */}
    <div className="w-[42%] h-[42%] rounded-full bg-[#788ea5] absolute top-[18%]"></div>
    {/* Shoulders */}
    <div className="w-[72%] h-[36%] rounded-t-full bg-[#788ea5] absolute bottom-0"></div>
  </div>
);

export const renderStatusBadge = (presenceStatus?: string, borderClass = "border-2 border-white") => {
  const baseClass = `absolute -bottom-0.5 -right-0.5 rounded-full ${borderClass} flex items-center justify-center shrink-0`;
  if (!presenceStatus || presenceStatus === 'online') {
    return <div className={`${baseClass} w-3.5 h-3.5 bg-emerald-600`}></div>;
  }
  if (presenceStatus === 'away') {
    return (
      <div className={`${baseClass} w-3.5 h-3.5 bg-amber-500 text-white`}>
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-9 8.3-9.8.5-.1 1 .3.9.8-.1.4-.2.8-.2 1.2 0 4.4 3.6 8 8 8 .4 0 .8-.1 1.2-.2.5-.1.9.4.8.9-.8 4.8-5 8.1-9.9 8.1z"/>
        </svg>
      </div>
    );
  }
  if (presenceStatus === 'dnd') {
    return (
      <div className={`${baseClass} w-3.5 h-3.5 bg-rose-600 text-white`}>
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
          <rect x="4" y="10" width="16" height="4" fill="white" rx="0.5" />
        </svg>
      </div>
    );
  }
  return <div className={`${baseClass} w-3.5 h-3.5 bg-slate-400`}></div>;
};


export const ChatLocal: React.FC<ChatLocalProps> = ({ 
  loggedInUser, 
  computerBox, 
  computerSector, 
  isLowResources = false, 
  onViewSocialProfile, 
  onOpenMyProfile,
  isDriveOpen,
  setIsDriveOpen,
  isCalcOpen,
  setIsCalcOpen,
  isNotesOpen,
  setIsNotesOpen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSSVBrowserOpen, setIsSSVBrowserOpen] = useState(false);
  const [isCYBBrowserOpen, setIsCYBBrowserOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [currentPane, setCurrentPane] = useState<'list' | 'chat'>('list');
  const [showContacts, setShowContacts] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'prioritarios' | 'otros'>('prioritarios');
  const [messagesGeneral, setMessagesGeneral] = useState<Message[]>([]);
  const [messagesPrivate, setMessagesPrivate] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [historicalUsers, setHistoricalUsers] = useState<PresenceUser[]>([]);
  const [channelUnread, setChannelUnread] = useState<Record<string, { count: number, lastTime: any }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  // Profile modales and state
  const [myProfile, setMyProfile] = useState<UserProfile>({ visibleName: '', status: '' });

  // User profile edit states
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isAvatarAnimating, setIsAvatarAnimating] = useState(false);

  const [profileFullName, setProfileFullName] = useState(loggedInUser.fullName);
  const [profileRut, setProfileRut] = useState(loggedInUser.rut || '');
  const [profileCesfam, setProfileCesfam] = useState<CESFAM>(loggedInUser.cesfam);
  const [profileProfession, setProfileProfession] = useState<Profession>(loggedInUser.profession);
  const [profileSector, setProfileSector] = useState<Sector>(loggedInUser.sector || 'No especificado');
  const [profileElectronicSignature, setProfileElectronicSignature] = useState(loggedInUser.electronicSignature || '');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmNewPassword, setProfileConfirmNewPassword] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileShowPasswordFields, setProfileShowPasswordFields] = useState(false);
  const [profilePic, setProfilePic] = useState(loggedInUser.profilePictureUrl || '');
  const [profileVisibleName, setProfileVisibleName] = useState(loggedInUser.fullName);
  const [profileStatus, setProfileStatus] = useState('');
  const [profilePresenceStatus, setProfilePresenceStatus] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');

  const [viewingProfileOf, setViewingProfileOf] = useState<PresenceUser | null>(null);
  const [viewedUserProfile, setViewedUserProfile] = useState<UserProfile | null>(null);

  // Autocomplete state
  const [mentionQuery, setMentionQuery] = useState<{ text: string, index: number } | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFirstLoadGeneral = useRef(true);
  const isFirstLoadPrivate = useRef(true);

  const isOpenRef = useRef(isOpen);
  const activeChannelRef = useRef(activeChannel);

  const sessionStartTime = useRef(Date.now());

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedNudges = useRef<Set<string>>(new Set());

  // Preload sounds immediately on mount
  useEffect(() => {
    soundService.preloadAll();
  }, []);

  // Play nudge sound file
  const playNudgeAudio = useCallback(() => {
    soundService.play('/nudge.mp3');
  }, []);

  const triggerNudge = useCallback((senderUsername: string, isGeneral: boolean = false) => {
    playNudgeAudio();
    setIsOpen(true);
    const targetChannel = isGeneral ? 'general' : `private_${senderUsername}`;
    setActiveChannel(targetChannel);
    setCurrentPane('chat');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 650);
  }, [playNudgeAudio]);

  // Declarative Nudge Auto-Open Handler
  useEffect(() => {
    [...messagesPrivate, ...messagesGeneral].forEach(msg => {
      if (msg.isNudge && msg.senderUsername !== loggedInUser.username && msg.id) {
        if (!processedNudges.current.has(msg.id)) {
          processedNudges.current.add(msg.id);
          const isGeneral = !msg.receiverUsername;

          // Only trigger if the nudge is new (timestamp is after session start)
          let msgTime = Date.now();
          if (msg.timestamp) {
            if (typeof msg.timestamp.toMillis === 'function') {
              msgTime = msg.timestamp.toMillis();
            } else if (msg.timestamp.seconds) {
              msgTime = msg.timestamp.seconds * 1000;
            }
          }

          if (msgTime > sessionStartTime.current - 5000) {
            triggerNudge(msg.senderUsername, isGeneral);
          }
        }
      }
    });
  }, [messagesPrivate, messagesGeneral, loggedInUser.username, triggerNudge]);

  interface LoginToastItem {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  }
  const [loginToasts, setLoginToasts] = useState<LoginToastItem[]>([]);
  const prevOnlineUsernamesRef = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // MSN LOGIN POPUP EFFECT
  const isInitialOnlineSyncDone = useRef(false);

  useEffect(() => {
    const currentOnlineNames = new Set(onlineUsers.map(u => u.id));

    if (!isInitialOnlineSyncDone.current) {
      if (onlineUsers.length > 0) {
        prevOnlineUsernamesRef.current = currentOnlineNames;
        isInitialOnlineSyncDone.current = true;
      }
      return;
    }

    currentOnlineNames.forEach(username => {
      if (!prevOnlineUsernamesRef.current.has(username)) {
        if (String(username).toLowerCase().trim() !== loggedInUser.username.toLowerCase().trim()) {
          const userObj = onlineUsers.find(u => u.id === username);
          if (userObj) {
            const notifType = showUserConnectNotification(userObj.fullName, userObj.profilePictureUrl);
            if (notifType === 'in-app') {
              const toastId = Date.now().toString() + Math.random();
              setLoginToasts(prev => [...prev, { id: toastId, username, fullName: userObj.fullName, avatarUrl: userObj.profilePictureUrl }]);
            }
          }
        }
      }
    });
    prevOnlineUsernamesRef.current = currentOnlineNames;
  }, [onlineUsers, loggedInUser.username]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    // Always reset profile panel when chat closes
    if (!isOpen) {
      setIsProfileExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
          setUnreadCount(0);
        }
        if (isSSVBrowserOpen) {
          setIsSSVBrowserOpen(false);
        }
        if (isCYBBrowserOpen) {
          setIsCYBBrowserOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSSVBrowserOpen, isCYBBrowserOpen]);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
    if (isOpen) {
      scrollToBottom();
      setChannelUnread(prev => ({ ...prev, [activeChannel]: { count: 0, lastTime: null } }));
    }
  }, [activeChannel, isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('smooth');
    }
  }, [messagesGeneral, messagesPrivate, isOpen, activeChannel]);

  useEffect(() => {
    if (isOpen && activeChannel.startsWith('private_')) {
      const partnerUsername = activeChannel.replace('private_', '');
      const unreadMsgs = messagesPrivate.filter(m => m.senderUsername === partnerUsername && (m.status === 'sent' || m.status === 'received'));
      if (unreadMsgs.length > 0) {
        unreadMsgs.forEach(m => {
          if (m.sharedId) {
            setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', m.sharedId), { status: 'read' }, { merge: true }).catch(() => { });
            setDoc(doc(db, 'inbox', partnerUsername, 'messages', m.sharedId), { status: 'read' }, { merge: true }).catch(() => { });
          }
        });
        setUnreadCount(prev => Math.max(0, prev - unreadMsgs.length));
      }
    }
  }, [isOpen, activeChannel, messagesPrivate]);

  // Real-time listener for My Profile
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'user_profiles', loggedInUser.username), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const visName = data.visibleName || loggedInUser.fullName;
        const stat = data.status || '';
        const picUrl = data.profilePictureUrl || loggedInUser.profilePictureUrl || '';
        const presStatus = data.presenceStatus || 'online';
        setMyProfile({
          visibleName: visName,
          status: stat,
          profilePictureUrl: picUrl,
          presenceStatus: presStatus
        });
        setProfileVisibleName(visName);
        setProfileStatus(stat);
        setProfilePic(picUrl);
        setProfilePresenceStatus(presStatus);
      } else {
        setMyProfile({
          visibleName: loggedInUser.fullName,
          status: '',
          profilePictureUrl: loggedInUser.profilePictureUrl || '',
          presenceStatus: 'online'
        });
        setProfileVisibleName(loggedInUser.fullName);
        setProfileStatus('');
        setProfilePic(loggedInUser.profilePictureUrl || '');
        setProfilePresenceStatus('online');
      }
    });
    return () => unsubscribe();
  }, [loggedInUser.username, loggedInUser.fullName, loggedInUser.profilePictureUrl]);

  useEffect(() => {
    setProfileFullName(loggedInUser.fullName);
    setProfileRut(loggedInUser.rut || '');
    setProfileCesfam(loggedInUser.cesfam);
    setProfileProfession(loggedInUser.profession);
    setProfileSector(loggedInUser.sector || 'No especificado');
    setProfileElectronicSignature(loggedInUser.electronicSignature || '');
  }, [loggedInUser]);

  // Presence system setup
  useEffect(() => {
    const userPresenceRef = doc(db, 'presence', loggedInUser.username);
    let pingInterval: NodeJS.Timeout;

    const setPresenceOnline = async () => {
      try {
        const pStatus = myProfile.presenceStatus || 'online';
        if (pStatus === 'invisible') {
          await deleteDoc(userPresenceRef);
          return;
        }

        const payload: any = {
          fullName: myProfile.visibleName || loggedInUser.fullName,
          profession: loggedInUser.profession,
          box: computerBox,
          sector: computerSector,
          cesfam: loggedInUser.cesfam || '',
          status: myProfile.status || 'Disponible.',
          presenceStatus: pStatus,
          lastSeen: serverTimestamp()
        };
        if (myProfile.profilePictureUrl) {
          payload.profilePictureUrl = myProfile.profilePictureUrl;
        }
        await setDoc(userPresenceRef, payload, { merge: true });
        await setDoc(doc(db, 'chat_users', loggedInUser.username), payload, { merge: true });
      } catch (e) {
        console.error("Error setting presence", e);
      }
    };

    const setPresenceOffline = async () => {
      try {
        await deleteDoc(userPresenceRef);
      } catch (e) {
        console.error("Error deleting presence", e);
      }
    };

    setPresenceOnline();

    pingInterval = setInterval(() => {
      setPresenceOnline();
    }, 5 * 60 * 1000); // 5 minutos

    const handleBeforeUnload = () => setPresenceOffline();

    // Listen to historical users
    const unsubscribeHistory = onSnapshot(query(collection(db, 'chat_users')), (snapshot) => {
      const usersData: PresenceUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as PresenceUser);
      });
      setHistoricalUsers(usersData);
    });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (pingInterval) clearInterval(pingInterval);
      setPresenceOffline();
      unsubscribeHistory();
    };
  }, [loggedInUser.username, loggedInUser.fullName, loggedInUser.profession, loggedInUser.cesfam, computerBox, computerSector, myProfile.status, myProfile.visibleName, myProfile.profilePictureUrl]);

  // Listen to online users
  useEffect(() => {
    const presenceQuery = query(collection(db, 'presence'));
    const unsubscribePresence = onSnapshot(presenceQuery, (snapshot) => {
      const usersData: PresenceUser[] = [];
      const now = Date.now();
      snapshot.forEach((doc) => {
        const data = doc.data() as PresenceUser;
        let lastSeenMs = now;
        if (data.lastSeen && data.lastSeen.toMillis) {
          lastSeenMs = data.lastSeen.toMillis();
        } else if (data.lastSeen && data.lastSeen.seconds) {
          lastSeenMs = data.lastSeen.seconds * 1000;
        }

        // Considerar online solo si han pasado menos de 60 minutos
        if (now - lastSeenMs < 60 * 60 * 1000) {
          usersData.push({ id: doc.id, ...data });
        }
      });
      setOnlineUsers(usersData);
    });
    return () => unsubscribePresence();
  }, []);

  const checkIfMentioned = (text: string) => {
    if (!text) return false;
    const lowerText = normalizeText(text);

    // First name
    const firstName = normalizeText(loggedInUser.fullName).split(' ')[0];
    if (lowerText.includes(`@${firstName}`)) return true;

    // Full name strict
    const fullNameNoSpace = normalizeText(loggedInUser.fullName).replace(/\s+/g, '');
    if (lowerText.replace(/\s+/g, '').includes(`@${fullNameNoSpace}`)) return true;

    // Profession
    const myTags = PROFESSION_TAGS[loggedInUser.profession] || [];
    for (const tag of myTags) {
      if (lowerText.includes(normalizeText(tag))) return true;
    }
    return false;
  };

  // Cleanup old messages
  useEffect(() => {
    const cleanupOldMessages = async () => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 3);

        const inboxQuery = query(collection(db, 'inbox', loggedInUser.username, 'messages'), where('timestamp', '<', cutoffDate), limit(100));
        const inboxSnap = await getDocs(inboxQuery);
        inboxSnap.forEach(d => deleteDoc(d.ref));

        const generalQuery = query(collection(db, 'messages'), where('timestamp', '<', cutoffDate), limit(100));
        const generalSnap = await getDocs(generalQuery);
        generalSnap.forEach(d => deleteDoc(d.ref));
      } catch (e) {
        console.warn("Cleanup old messages failed", e);
      }
    };

    const timer = setTimeout(() => {
      cleanupOldMessages();
    }, 10000);

    return () => clearTimeout(timer);
  }, [loggedInUser.username]);

  // Listen to General messages
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(80));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData: Message[] = [];
      let playedNotification = false;
      let notificationMsg: Message | null = null;

      snapshot.forEach((doc) => {
        const data = doc.data() as Message;
        msgsData.push({ id: doc.id, ...data } as Message);
      });
      setMessagesGeneral(msgsData.reverse());

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' && !isFirstLoadGeneral.current) {
          const newMsg = change.doc.data() as Message;
          if (newMsg.senderUsername?.toLowerCase().trim() !== loggedInUser.username?.toLowerCase().trim()) {
            if (!isOpenRef.current || activeChannelRef.current !== 'general') {
              setUnreadCount(prev => prev + 1);
              setChannelUnread(prev => ({
                ...prev,
                ['general']: { count: (prev['general']?.count || 0) + 1, lastTime: newMsg.timestamp }
              }));
            }
            if (!newMsg.isNudge) {
              playedNotification = true;
              notificationMsg = newMsg;
            }
          }
        }
      });

      if (playedNotification && notificationMsg) {
        showChatMessageNotification((notificationMsg as Message).senderName, (notificationMsg as Message).text);
      }
      isFirstLoadGeneral.current = false;
    });
    return () => unsubscribe();
  }, [loggedInUser.username, loggedInUser.profession]);



  // Listen to Private Inbox messages
  useEffect(() => {
    const q = query(collection(db, 'inbox', loggedInUser.username, 'messages'), orderBy('timestamp', 'desc'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData: Message[] = [];
      let playedNotification = false;
      let notificationMsg: Message | null = null;

      snapshot.forEach((doc) => {
        const data = doc.data() as Message;
        msgsData.push({ id: doc.id, ...data } as Message);
      });
      setMessagesPrivate(msgsData.reverse());

      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const newMsg = change.doc.data() as Message;
          if (newMsg.receiverUsername === loggedInUser.username && newMsg.status === 'sent' && newMsg.sharedId) {
            setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', newMsg.sharedId), { status: 'received' }, { merge: true }).catch(() => { });
            setDoc(doc(db, 'inbox', newMsg.senderUsername, 'messages', newMsg.sharedId), { status: 'received' }, { merge: true }).catch(() => { });
          }
        }

        if (change.type === 'added' && !isFirstLoadPrivate.current) {
          const newMsg = change.doc.data() as Message;
          if (newMsg.senderUsername?.toLowerCase().trim() !== loggedInUser.username?.toLowerCase().trim()) {
            const privateChannelId = `private_${newMsg.senderUsername}`;
            if (!isOpenRef.current || activeChannelRef.current !== privateChannelId) {
              setUnreadCount(prev => prev + 1);
            }
            if (!newMsg.isNudge) {
              playedNotification = true;
              notificationMsg = newMsg;
            }
          }
        }
      });

      if (playedNotification && notificationMsg) {
        showChatMessageNotification((notificationMsg as Message).senderName, (notificationMsg as Message).text);
      }
      isFirstLoadPrivate.current = false;
    });
    return () => unsubscribe();
  }, [loggedInUser.username]);


  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const sendMessage = async (text: string, isNudge: boolean = false) => {
    try {
      const sharedId = Date.now().toString() + Math.random().toString(36).substring(2);
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
      };

      if (activeChannel === 'general') {
        await addDoc(collection(db, 'messages'), payload);
      } else if (activeChannel.startsWith('private_')) {
        const partnerUsername = activeChannel.replace('private_', '');

        // Write to Partner's inbox
        payload.receiverUsername = partnerUsername;
        await setDoc(doc(db, 'inbox', partnerUsername, 'messages', sharedId), payload);
        // Write to My Inbox
        await setDoc(doc(db, 'inbox', loggedInUser.username, 'messages', sharedId), payload);
      }
    } catch (error: any) {
      console.error("Error sending message: ", error);
      alert(`ERROR DEL SERVIDOR: No se pudo enviar el mensaje.\n\nMensaje técnico de Firebase: "${error?.message || error}"`);
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!profileFullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido.';
    }
    if (profileRut.trim() && !/^\d{1,2}(\.\d{3}){2}-[\dkK]$/.test(profileRut.trim())) {
      newErrors.rut = 'Formato de RUT inválido.';
    }

    if (profileNewPassword || profileCurrentPassword) {
      if (!profileCurrentPassword) {
        newErrors.currentPassword = 'La contraseña actual es requerida.';
      } else if (profileCurrentPassword !== loggedInUser.password) {
        newErrors.currentPassword = 'La contraseña actual es incorrecta.';
      }
      if (!profileNewPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida.';
      } else if (profileNewPassword.length < 4) {
        newErrors.newPassword = 'Debe tener al menos 4 caracteres.';
      }
      if (profileNewPassword !== profileConfirmNewPassword) {
        newErrors.confirmNewPassword = 'Las contraseñas no coinciden.';
      }
    }
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProfile()) {
      const updatedData = {
        fullName: profileFullName.trim(),
        rut: profileRut.trim() || undefined,
        cesfam: profileCesfam,
        profession: profileProfession,
        electronicSignature: profileElectronicSignature.trim(),
        sector: profileSector,
        visibleName: profileVisibleName.trim() || profileFullName.trim(),
        status: profileStatus.trim(),
        profilePictureUrl: profilePic,
      };
      const passToUpdate = (profileNewPassword && profileCurrentPassword === loggedInUser.password) ? profileNewPassword : undefined;
      
      try {
        sessionStorage.setItem('loggedInUserFullName', updatedData.fullName);
        sessionStorage.setItem('loggedInUserRut', updatedData.rut || '');
        sessionStorage.setItem('loggedInUserCesfam', updatedData.cesfam);
        sessionStorage.setItem('loggedInUserProfession', updatedData.profession);
        sessionStorage.setItem('loggedInUserElectronicSignature', updatedData.electronicSignature || '');
        sessionStorage.setItem('loggedInUserSector', updatedData.sector || 'No especificado');
        if (passToUpdate) {
          sessionStorage.setItem('loggedInUserPassword', passToUpdate);
          loggedInUser.password = passToUpdate;
        }
        
        loggedInUser.fullName = updatedData.fullName;
        loggedInUser.rut = updatedData.rut;
        loggedInUser.cesfam = updatedData.cesfam;
        loggedInUser.profession = updatedData.profession;
        loggedInUser.electronicSignature = updatedData.electronicSignature;
        loggedInUser.sector = updatedData.sector;
        loggedInUser.profilePictureUrl = updatedData.profilePictureUrl;

        await setDoc(doc(db, 'user_profiles', loggedInUser.username), {
          visibleName: updatedData.visibleName,
          status: updatedData.status,
          profilePictureUrl: updatedData.profilePictureUrl,
          presenceStatus: profilePresenceStatus
        }, { merge: true });

        if (profilePresenceStatus !== 'invisible') {
          await setDoc(doc(db, 'presence', loggedInUser.username), {
            fullName: updatedData.visibleName,
            profession: updatedData.profession,
            box: computerBox,
            sector: updatedData.sector,
            cesfam: updatedData.cesfam,
            status: updatedData.status,
            profilePictureUrl: updatedData.profilePictureUrl,
            presenceStatus: profilePresenceStatus,
            lastSeen: serverTimestamp()
          }, { merge: true });
        } else {
          await deleteDoc(doc(db, 'presence', loggedInUser.username));
        }

        await setDoc(doc(db, 'chat_users', loggedInUser.username), {
          fullName: updatedData.visibleName,
          profession: updatedData.profession,
          box: computerBox,
          sector: updatedData.sector,
          cesfam: updatedData.cesfam,
          status: updatedData.status,
          profilePictureUrl: updatedData.profilePictureUrl,
          presenceStatus: profilePresenceStatus,
          lastSeen: serverTimestamp()
        }, { merge: true });

        alert("Perfil actualizado con éxito.");
        setIsProfileExpanded(false);
      } catch (err) {
        console.error("Error updating profile from chat", err);
        alert("Error al guardar cambios del perfil.");
      }
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAvatarAnimating(true);
    setTimeout(() => {
      setIsAvatarAnimating(false);
    }, 300);

    setIsOpen(true);
    setUnreadCount(0);
    setIsProfileExpanded(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const textToSend = newMessage;
    setNewMessage('');
    setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: '' }, { merge: true });
    setMentionQuery(null);
    await sendMessage(textToSend, false);
  };

  const handleSendNudge = async () => {
    playNudgeAudio();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 650);
    await sendMessage('Zumbido', true);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text: string) => {
    const textWithEmojis = replaceEmojis(text);
    return textWithEmojis.split(/(@[\w\u00C0-\u017F]+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-sky-700 font-bold bg-sky-100/80 px-1 rounded-sm shadow-sm">{part}</span>;
      }
      return part;
    });
  };

  const handleViewProfile = async (user: PresenceUser, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering activeChannel
    try {
      const snap = await getDoc(doc(db, 'user_profiles', user.id));
      if (snap.exists()) {
        setViewedUserProfile(snap.data() as UserProfile);
      } else {
        setViewedUserProfile(null); // No profile explicitly set
      }
      setViewingProfileOf(user);
    } catch (e) { console.error(e); }
  };

  // --- Autocomplete Handling ---
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const channelTarget = activeChannel.startsWith('private_') ? activeChannel.replace('private_', '') : activeChannel;
    setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: channelTarget }, { merge: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setDoc(doc(db, 'chat_presence', loggedInUser.username), { typingTo: '' }, { merge: true });
    }, 2000);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@([\w\u00C0-\u017F]*)$/);

    if (match) {
      const queryText = match[1];
      setMentionQuery({ text: queryText, index: match.index! });

      const normalizedQuery = normalizeText(queryText);
      const suggestions: string[] = [];

      PROFESSION_ALIAS_LIST.forEach(prof => {
        if (normalizeText(prof).includes(normalizedQuery)) suggestions.push(prof);
      });

      onlineUsers.forEach(user => {
        if (user.id !== loggedInUser.username) {
          const firstName = user.fullName.split(' ')[0];
          if (normalizeText(firstName).includes(normalizedQuery)) {
            if (!suggestions.includes(firstName)) suggestions.push(firstName);
          }
        }
      });

      setMentionSuggestions(suggestions);
      setSelectedSuggestionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const acceptSuggestion = (suggestion: string) => {
    if (!mentionQuery) return;
    const val = newMessage;
    const beforeAt = val.slice(0, mentionQuery.index);
    const afterCursor = val.slice(mentionQuery.index + mentionQuery.text.length + 1);

    const newValue = `${beforeAt}@${suggestion} ${afterCursor}`;
    setNewMessage(newValue);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % mentionSuggestions.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        acceptSuggestion(mentionSuggestions[selectedSuggestionIndex]);
        return;
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) handleSendMessage(e as any);
    }
  };

  const isVega = loggedInUser.username.toLowerCase() === 'vega';
  const canSendMessages = true;

  let activeMessages: Message[] = [];
  let chatTitle = "Messenger";

  if (activeChannel === 'general') {
    activeMessages = messagesGeneral;
    chatTitle = "Grupo General";
  } else {
    // Private chat
    const partnerUsername = activeChannel.replace('private_', '');
    const partner = onlineUsers.find(u => u.id === partnerUsername) || historicalUsers.find(u => u.id === partnerUsername);
    if (partner) chatTitle = partner.fullName;

    activeMessages = messagesPrivate.filter(m =>
      (m.senderUsername === loggedInUser.username && m.receiverUsername === partnerUsername) ||
      (m.senderUsername === partnerUsername)
    );
  }

  const lastMessageTime: Record<string, number> = {};
  messagesPrivate.forEach(m => {
    const otherUser = m.senderUsername === loggedInUser.username ? m.receiverUsername : m.senderUsername;
    if (otherUser && m.timestamp) {
      const time = m.timestamp.toMillis ? m.timestamp.toMillis() : 0;
      if (!lastMessageTime[otherUser] || time > lastMessageTime[otherUser]) {
        lastMessageTime[otherUser] = time;
      }
    }
  });

  const getLastPrivateMessage = (partnerUsername: string) => {
    const privateMsgs = messagesPrivate.filter(m =>
      (m.senderUsername === loggedInUser.username && m.receiverUsername === partnerUsername) ||
      (m.senderUsername === partnerUsername && m.receiverUsername === loggedInUser.username)
    );
    if (privateMsgs.length === 0) return null;
    return privateMsgs[privateMsgs.length - 1];
  };

  const formatLastMessageDateTime = (timestamp: any) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    
    const timeStr = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    
    if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return timeStr;
    } else {
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      return `${timeStr} - ${d.getDate()} ${months[d.getMonth()]}`;
    }
  };

  const getUnreadForUser = (userId: string) => {
    const unread = messagesPrivate.filter(m => m.senderUsername === userId && (m.status === 'sent' || m.status === 'received'));
    if (unread.length === 0) return null;
    const lastMsg = unread[unread.length - 1];
    return { count: unread.length, lastTime: lastMsg.timestamp };
  };

  const getSortedFilteredUsers = (usersList: PresenceUser[]) => {
    const term = normalizeText(searchTerm);
    return usersList
      .filter(user => user.id !== loggedInUser.username && normalizeText(user.fullName).includes(term))
      .sort((a, b) => {
        const unreadA = getUnreadForUser(a.id) ? 1 : 0;
        const unreadB = getUnreadForUser(b.id) ? 1 : 0;
        if (unreadA !== unreadB) return unreadB - unreadA;

        const timeA = lastMessageTime[a.id] || 0;
        const timeB = lastMessageTime[b.id] || 0;
        if (timeB !== timeA) return timeB - timeA;
        return a.fullName.localeCompare(b.fullName);
      });
  };

  const onlineFiltered = getSortedFilteredUsers(onlineUsers);
  const offlineFiltered = getSortedFilteredUsers(
    historicalUsers.filter(hu => !onlineUsers.some(ou => ou.id === hu.id))
  );

  const activeChatUsernames = useMemo(() => {
    const usernames = new Set<string>();
    messagesPrivate.forEach(m => {
      const other = m.senderUsername === loggedInUser.username ? m.receiverUsername : m.senderUsername;
      if (other) usernames.add(other);
    });
    return usernames;
  }, [messagesPrivate, loggedInUser.username]);

  const isSearching = searchTerm.trim().length > 0;
  const shouldShowContacts = showContacts || isSearching || (activeChatUsernames.size > 0);

  const EmptyIllustration = () => (
    <svg viewBox="0 0 200 130" className="w-44 h-28 mx-auto mb-2 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="65" r="45" fill="#f0fdf4" />
      <path d="M125 75h45v3H125z" fill="#cbd5e1" />
      <path d="M132 78v20h-3V78zM163 78v20h-3V78z" fill="#94a3b8" />
      <path d="M140 85h15v2h-15z" fill="#475569" />
      <path d="M147 87v10h2V87z" fill="#475569" />
      <path d="M152 70h3v15h-3z" fill="#334155" />
      <circle cx="145" cy="58" r="5" fill="#fbcfe8" />
      <path d="M138 68c0-5 3-7 7-7s7 2 7 7v10h-14V68z" fill="#db2777" />
      <rect x="132" y="62" width="16" height="10" rx="1" fill="#1e293b" />
      <path d="M138 72h4v3h-4z" fill="#475569" />
      <circle cx="85" cy="55" r="5" fill="#ffedd5" />
      <path d="M78 65c0-4 3-6 7-6s7 2 7 6v15h-14V65z" fill="#1e3a8a" />
      <path d="M80 51h10l2 2H80v-2z" fill="#d97706" />
      <path d="M81 80v15h3V80zM89 80v15h3V80z" fill="#b45309" />
      <rect x="55" y="70" width="20" height="15" rx="2" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="58" cy="88" r="3" fill="#334155" />
      <circle cx="72" cy="88" r="3" fill="#334155" />
      <path d="M75 72h5v10" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="58" y="73" width="10" height="6" rx="0.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
      <path d="M58 73l5 3 5-3" stroke="#94a3b8" strokeWidth="0.8" />
    </svg>
  );

  return (
    <>
      {/* Floating Buttons removed (now in header) */}

      {/* Auxiliary Windows */}
      {!isLowResources && (
        <>
          <SSVBrowserWindow isOpen={isSSVBrowserOpen} onClose={() => setIsSSVBrowserOpen(false)} onOpen={() => setIsSSVBrowserOpen(true)} />
          <GmailWindow isOpen={isGmailOpen} onMinimize={() => setIsGmailOpen(false)} />
        </>
      )}
      <NotesWindow isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} username={loggedInUser.username} />
      <CalculatorWindow isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Main Animated Messenger Box */}
      <div
        className={`fixed bottom-0 right-0 md:right-6 z-50 border border-slate-300 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] flex transition-all duration-300 ease-in-out overflow-hidden ${isShaking ? 'animate-shake' : ''} ${isOpen ? 'w-full md:w-[360px] h-[520px] rounded-t-2xl bg-[#E3EFFE] border-[#7A96DF]' : 'w-full md:w-[360px] h-12 rounded-t-xl cursor-pointer bg-white hover:bg-slate-50'}`}
        onClick={!isOpen ? () => { setIsOpen(true); setIsProfileExpanded(false); setUnreadCount(0); } : undefined}
      >
        {/* Profile Panel */}
        {isOpen && isProfileExpanded && (
          <div className="w-full md:w-[360px] flex flex-col h-full bg-white select-none shrink-0 animate-fadeIn">
            {/* Header of Profile Panel */}
            <div className="bg-white p-3 h-12 flex justify-between items-center text-slate-800 shadow-sm border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-sm text-shadow-sm truncate">Mi Perfil de Usuario</h3>
              <button 
                onClick={() => setIsProfileExpanded(false)}
                className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded hover:bg-slate-100 cursor-pointer flex items-center justify-center shrink-0"
                title="Cerrar perfil"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Scrollable content of Profile Panel */}
            <form onSubmit={handleProfileSubmit} className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4 bg-slate-50">
              {/* Row 1: Profile Pic + apodo/status */}
              <div className="flex gap-3 items-start pb-3 border-b border-slate-200/60">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-md mb-1.5">
                    {profilePic ? (
                      <img src={profilePic} className="w-full h-full object-cover" alt="Vista previa" />
                    ) : (
                      <div className="w-full h-full"><MsnDefaultAvatar /></div>
                    )}
                  </div>
                  <label className="cursor-pointer text-[9px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-wider text-center">
                    <span>Cambiar foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = 102;
                              canvas.height = 102;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                const size = Math.min(img.width, img.height);
                                const sx = (img.width - size) / 2;
                                const sy = (img.height - size) / 2;
                                ctx.drawImage(img, sx, sy, size, size, 0, 0, 102, 102);
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                                setProfilePic(compressedBase64);
                              }
                            };
                            img.src = ev.target.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                <div className="flex-grow space-y-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Nombre visible (apodo)</label>
                    <input 
                      type="text" 
                      value={profileVisibleName} 
                      onChange={(e) => setProfileVisibleName(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-black outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Mensaje de Estado</label>
                    <input 
                      type="text" 
                      value={profileStatus} 
                      onChange={(e) => setProfileStatus(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-black outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                      placeholder="Disponible"
                    />
                  </div>
                </div>
              </div>

              {/* Status List Selection Menu */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Seleccionar Estado</label>
                <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden shadow-sm">
                  {[
                    { value: 'online', label: 'Disponible', desc: 'En línea', icon: <div className="w-3.5 h-3.5 rounded-full bg-emerald-600"></div> },
                    { value: 'away', label: 'Ausente', desc: 'Temporalmente inactivo', icon: (
                      <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-9 8.3-9.8.5-.1 1 .3.9.8-.1.4-.2.8-.2 1.2 0 4.4 3.6 8 8 8 .4 0 .8-.1 1.2-.2.5-.1.9.4.8.9-.8 4.8-5 8.1-9.9 8.1z"/>
                      </svg>
                    )},
                    { value: 'dnd', label: 'No molestar', desc: 'No recibirás notificaciones de escritorio', icon: (
                      <svg className="w-3.5 h-3.5 text-rose-600 fill-current" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <rect x="6" y="11" width="12" height="2" fill="white" rx="0.5" />
                      </svg>
                    )},
                    { value: 'invisible', label: 'Invisible', desc: 'Aparecerás Desconectado', icon: (
                      <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="8" />
                        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                      </svg>
                    )}
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProfilePresenceStatus(opt.value as any)}
                      className={`w-full flex items-center justify-between p-2.5 transition-colors text-left hover:bg-slate-50 ${profilePresenceStatus === opt.value ? 'bg-sky-50/50' : 'bg-white'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="shrink-0 flex items-center justify-center w-5 h-5">
                          {opt.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                          {opt.desc && <div className="text-[9px] text-slate-400 leading-none mt-0.5">{opt.desc}</div>}
                        </div>
                      </div>
                      {profilePresenceStatus === opt.value && (
                        <svg className="w-3.5 h-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>



              {/* Submit buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200/60 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsProfileExpanded(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  onClick={handleProfileSubmit}
                  className="px-4 py-1.5 bg-gradient-to-b from-sky-500 to-sky-600 text-white font-bold rounded hover:from-sky-400 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 shadow-md text-xs transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}

        {(!isOpen || !isProfileExpanded) && (
          <div className="flex flex-col h-full w-full md:w-[360px] shrink-0">
          {/* Unified Header: Visible when closed, or when open and in list pane */}
          {(!isOpen || currentPane === 'list') && (
            <div
              onClick={!isOpen ? () => { setIsOpen(true); setIsProfileExpanded(false); setUnreadCount(0); } : undefined}
              className={`px-3 h-12 flex justify-between items-center shrink-0 select-none ${!isOpen ? 'w-full h-full bg-gradient-to-b from-[#e1ecfc] to-[#cbdffb]' : 'border-b border-[#a6c1e3] bg-gradient-to-b from-[#e1ecfc] to-[#cbdffb]'}`}
            >
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOpen) {
                    setIsOpen(false);
                  } else {
                    setIsOpen(true);
                    setIsProfileExpanded(false);
                    setUnreadCount(0);
                  }
                }}
              >
                <div 
                  className="relative w-8 h-8 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0"
                >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    {loggedInUser.profilePictureUrl ? (
                      <img src={loggedInUser.profilePictureUrl} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <LinkedInDefaultAvatar />
                    )}
                  </div>
                  {renderStatusBadge(myProfile.presenceStatus, "border-2 border-white")}
                </div>
                <span className="font-bold text-slate-800 text-[14px] tracking-wide select-none">Mensajes</span>
                {unreadCount > 0 && !isOpen && (
                  <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shadow leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <button
                  className="hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                  title="Mi Perfil"
                  onClick={(e) => { e.stopPropagation(); setIsProfileExpanded(prev => !prev); }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#5e5e5e] hover:text-slate-800">
                    <path d="M12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-6 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm12 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                  </svg>
                </button>
                <button
                  className="hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                  title="Nuevo mensaje"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOpen) {
                      setIsOpen(true);
                      setUnreadCount(0);
                    }
                    setIsProfileExpanded(false);
                    setShowContacts(true);
                    setSearchTerm('');
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#5e5e5e] hover:text-slate-800">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  className="hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
                  title={isOpen ? "Minimizar" : "Expandir"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                    setIsProfileExpanded(false);
                    if (!isOpen) setUnreadCount(0);
                  }}
                >
                  {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#5e5e5e] hover:text-slate-800">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#5e5e5e] hover:text-slate-800">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

        {/* List Pane View */}
        {isOpen && currentPane === 'list' && (
          <div className="flex-grow flex flex-col min-h-0 bg-[#E3EFFE]">
            {/* Search messages bar */}
            <div className="px-3 py-2 bg-white shrink-0">
              <div className="flex items-center bg-[#f3f6f8] rounded-lg px-2.5 py-1.5 gap-2 border border-slate-200/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar mensajes"
                  className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-500 font-medium"
                />
                <button className="text-slate-500 hover:text-slate-700 transition-colors p-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-[#abc6e9] text-xs font-semibold text-[#183c7d] bg-[#f0f5fc] shrink-0 select-none">
              <button
                onClick={() => setActiveTabSub('prioritarios')}
                className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${activeTabSub === 'prioritarios' ? 'text-[#183c7d] border-b-2 border-[#183c7d] font-bold bg-[#cbdffb]/40' : 'hover:bg-slate-50/50'}`}
              >
                En línea
              </button>
              <button
                onClick={() => setActiveTabSub('otros')}
                className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${activeTabSub === 'otros' ? 'text-[#183c7d] border-b-2 border-[#183c7d] font-bold bg-[#cbdffb]/40' : 'hover:bg-slate-50/50'}`}
              >
                Desconectados
              </button>
            </div>

            {/* Scrollable list body */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white border border-[#abc6e9] rounded-lg m-2">
              <div className="divide-y divide-slate-100">
                  {/* Under Prioritarios: General channel + online contacts */}
                  {activeTabSub === 'prioritarios' && (
                    <>
                      {/* General channel */}
                      {(!isSearching || normalizeText("Grupo General").includes(normalizeText(searchTerm))) && (
                        <div
                          onClick={() => {
                            setActiveChannel('general');
                            setCurrentPane('chat');
                          }}
                          className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer bg-white hover:bg-slate-50 ${activeChannel === 'general' ? 'border-l-4 border-emerald-600 bg-emerald-50/10' : ''}`}
                        >
                          <div className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-sky-500 shadow-sm border border-sky-600 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V21H21V5C21 3.89543 20.1046 3 19 3Z" />
                              <path d="M12 9V15" /><path d="M9 12H15" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            {(() => {
                              const lastGeneralMsg = messagesGeneral[messagesGeneral.length - 1];
                              const unreadCount = channelUnread['general']?.count || 0;
                              return (
                                <>
                                  <div className="flex justify-between items-baseline">
                                    <h4 className="text-xs font-bold text-slate-800 truncate">Grupo General</h4>
                                    {lastGeneralMsg && (
                                      <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-1">
                                        {formatLastMessageDateTime(lastGeneralMsg.timestamp)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-[10px] text-slate-500 truncate pr-2">
                                      {lastGeneralMsg ? (
                                        <>
                                          <span className="font-semibold">{lastGeneralMsg.senderUsername === loggedInUser.username ? 'Tú' : lastGeneralMsg.senderName}:</span> {lastGeneralMsg.isNudge ? '📢 Zumbido' : lastGeneralMsg.text}
                                        </>
                                      ) : (
                                        'Chat con todo el equipo médico'
                                      )}
                                    </p>
                                    {unreadCount > 0 && (
                                      <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none shadow-sm shrink-0 border border-white">
                                        {unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Online contacts */}
                      {onlineFiltered.map(user => {
                          const unread = getUnreadForUser(user.id);
                          const lastPrivateMsg = getLastPrivateMessage(user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => {
                                setActiveChannel(`private_${user.id}`);
                                setCurrentPane('chat');
                              }}
                              className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer bg-white hover:bg-slate-50 ${activeChannel === `private_${user.id}` ? 'border-l-4 border-emerald-600 bg-emerald-50/10' : ''}`}
                            >
                              <div className="relative shrink-0 w-9 h-9">
                                <div className="w-full h-full rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden">
                                  {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} className="w-full h-full object-cover" />
                                  ) : (
                                    <LinkedInDefaultAvatar />
                                  )}
                                </div>
                                {renderStatusBadge(user.presenceStatus, "border-2 border-white")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <h4 className="text-xs font-bold text-slate-800 truncate">{user.fullName}</h4>
                                  {lastPrivateMsg && (
                                    <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-1">
                                      {formatLastMessageDateTime(lastPrivateMsg.timestamp)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <p className="text-[10px] text-slate-400 truncate pr-2">
                                    {lastPrivateMsg ? (
                                      <>
                                        <span className="font-semibold text-slate-500">{lastPrivateMsg.senderUsername === loggedInUser.username ? 'Tú' : lastPrivateMsg.senderName}:</span> <span className="text-slate-500">{lastPrivateMsg.isNudge ? '📢 Zumbido' : lastPrivateMsg.text}</span>
                                      </>
                                    ) : (
                                      user.status || 'Disponible.'
                                    )}
                                  </p>
                                  {unread && (
                                    <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none shadow-sm shrink-0 border border-white">
                                      {unread.count}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {onlineFiltered.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">No hay contactos conectados.</div>
                      )}
                    </>
                  )}

                  {/* Under Otros: Offline contacts */}
                  {activeTabSub === 'otros' && (
                    <>
                      {offlineFiltered.map(user => {
                          const unread = getUnreadForUser(user.id);
                          const lastPrivateMsg = getLastPrivateMessage(user.id);
                          return (
                            <div
                              key={user.id}
                              onClick={() => {
                                setActiveChannel(`private_${user.id}`);
                                setCurrentPane('chat');
                              }}
                              className={`flex items-center space-x-3 p-3 transition-colors cursor-pointer bg-white hover:bg-slate-50 opacity-75 hover:opacity-100 ${activeChannel === `private_${user.id}` ? 'border-l-4 border-emerald-600 bg-emerald-50/10' : ''}`}
                            >
                              <div className="relative shrink-0 w-9 h-9">
                                <div className="w-full h-full rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs overflow-hidden">
                                  {user.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} className="w-full h-full object-cover grayscale opacity-80" />
                                  ) : (
                                    <LinkedInDefaultAvatar />
                                  )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-slate-400 border-2 border-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <h4 className="text-xs font-bold text-slate-600 truncate">{user.fullName}</h4>
                                  {lastPrivateMsg && (
                                    <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-1">
                                      {formatLastMessageDateTime(lastPrivateMsg.timestamp)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <p className="text-[10px] text-slate-400 truncate pr-2">
                                    {lastPrivateMsg ? (
                                      <>
                                        <span className="font-semibold text-slate-400">{lastPrivateMsg.senderUsername === loggedInUser.username ? 'Tú' : lastPrivateMsg.senderName}:</span> <span className="text-slate-400">{lastPrivateMsg.isNudge ? '📢 Zumbido' : lastPrivateMsg.text}</span>
                                      </>
                                    ) : (
                                      user.status || 'Desconectado.'
                                    )}
                                  </p>
                                  {unread && (
                                    <span className="bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none shadow-sm shrink-0 border border-white">
                                      {unread.count}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {offlineFiltered.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">No hay contactos desconectados.</div>
                      )}
                    </>
                  )}
                </div>
            </div>
          </div>
        )}

        {/* Chat pane view */}
        {isOpen && currentPane === 'chat' && (
          <div className="flex-grow flex flex-col min-h-0 bg-white">
            {/* Chat header */}
            <div className="bg-gradient-to-b from-[#e1ecfc] to-[#cbdffb] p-3 h-12 flex justify-between items-center text-[#183c7d] border-b border-[#a6c1e3] shrink-0 select-none">
              <div className="flex items-center space-x-2.5 min-w-0">
                <button
                  onClick={() => {
                    setCurrentPane('list');
                    setShowContacts(false);
                  }}
                  className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  title="Volver a la lista"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-shadow-sm truncate max-w-[170px]" title={chatTitle}>
                    {chatTitle}
                  </h3>
                  <span className="text-[9px] text-slate-500 block -mt-0.5">
                    {activeChannel.startsWith('private_')
                      ? (onlineUsers.some(u => u.id === activeChannel.replace('private_', '')) ? 'En línea' : 'Desconectado')
                      : 'Chat de grupo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setUnreadCount(0);
                }}
                className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded hover:bg-slate-100 shrink-0 cursor-pointer"
                title="Minimizar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-4 shadow-inner bg-white border border-sky-200 rounded-lg m-2 min-h-0">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs font-semibold">No hay mensajes aún.</p>
                </div>
              ) : (
                activeMessages.map((msg, index) => {
                  const prevMsg = index > 0 ? activeMessages[index - 1] : null;
                  const isConsecutive = prevMsg && prevMsg.senderUsername === msg.senderUsername && !msg.isNudge && !prevMsg?.isNudge && (msg.timestamp?.toMillis ? msg.timestamp.toMillis() : 0) - (prevMsg.timestamp?.toMillis ? prevMsg.timestamp.toMillis() : 0) < 5 * 60 * 1000;
                  const nextMsg = index < activeMessages.length - 1 ? activeMessages[index + 1] : null;
                  const isNextConsecutive = nextMsg && nextMsg.senderUsername === msg.senderUsername && !msg.isNudge && !nextMsg?.isNudge && (nextMsg.timestamp?.toMillis ? nextMsg.timestamp.toMillis() : 0) - (msg.timestamp?.toMillis ? msg.timestamp.toMillis() : 0) < 5 * 60 * 1000;

                  const isMe = msg.senderUsername === loggedInUser.username;
                  const amIMentioned = activeChannel === 'general' && !isMe && checkIfMentioned(msg.text);

                  if (msg.isNudge) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-200 shadow-sm flex items-center space-x-1">
                          <span className="text-base text-red-500 animate-pulse">📢</span>
                          <span>{isMe ? 'Has enviado un zumbido.' : `¡${msg.senderName} te ha enviado un zumbido!`}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
                        {!isConsecutive && (
                          <div className="flex items-baseline space-x-1 mb-1 px-1">
                            <span className={`text-[11px] font-bold ${amIMentioned ? 'text-rose-600' : 'text-slate-700'}`}>
                              {isMe ? 'Tú' : msg.senderName}
                            </span>
                            {!isMe && msg.senderSector && msg.senderBox && (
                              <span className="text-[9px] text-slate-400 font-semibold truncate shrink-0 max-w-[120px]">
                                · SECTOR {msg.senderSector.toUpperCase()} (BOX {msg.senderBox})
                              </span>
                            )}
                          </div>
                        )}
                        <div
                          className={`px-3 py-2 flex flex-col relative min-w-[80px] shadow-sm text-sm break-words border max-w-[85%] ${amIMentioned ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400 text-slate-800'
                              : isMe ? 'bg-sky-100 text-slate-800 border-sky-300 shadow-sky-100/50'
                                : 'bg-white text-slate-800 border-slate-200'
                            } ${isMe
                              ? (isConsecutive && isNextConsecutive ? 'rounded-l-lg rounded-r-sm' : isConsecutive ? 'rounded-tl-lg rounded-bl-lg rounded-tr-sm rounded-br-lg' : isNextConsecutive ? 'rounded-tl-lg rounded-bl-lg rounded-tr-lg rounded-br-sm' : 'rounded-lg rounded-tr-none')
                              : (isConsecutive && isNextConsecutive ? 'rounded-r-lg rounded-l-sm' : isConsecutive ? 'rounded-tr-lg rounded-br-lg rounded-tl-sm rounded-bl-lg' : isNextConsecutive ? 'rounded-tr-lg rounded-br-lg rounded-tl-lg rounded-bl-sm' : 'rounded-lg rounded-tl-none')
                            }`}
                        >
                          <div className="mb-0.5 break-all">{renderMessageText(msg.text)}</div>
                          <div className={`self-end flex items-center space-x-1 text-[9px] -mb-1 mt-0.5 ${isMe ? 'text-sky-700/60' : 'text-slate-400/80'}`}>
                            <span>{formatTime(msg.timestamp)}</span>
                            {isMe && activeChannel.startsWith('private_') && (
                              <span className="font-bold leading-none flex items-center h-full">
                                {msg.status === 'read' ? (
                                  <span className="text-blue-500 text-[10px] tracking-tighter">✓✓</span>
                                ) : msg.status === 'received' ? (
                                  <span className="text-slate-400 text-[10px] tracking-tighter">✓✓</span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            <div className="h-5 px-3 bg-[#e8f2fc] text-[10px] text-[#2c539e] italic flex items-center border-t border-[#c6d7ed] shrink-0 select-none">
              {onlineUsers.some(u => u.id !== loggedInUser.username && u.typingTo === (activeChannel.startsWith('private_') ? loggedInUser.username : activeChannel))
                ? onlineUsers.find(u => u.id !== loggedInUser.username && u.typingTo === (activeChannel.startsWith('private_') ? loggedInUser.username : activeChannel))?.fullName + " está escribiendo..."
                : ""}
            </div>

            {/* Toolbar */}
            {canSendMessages && (
              <div className="bg-gradient-to-b from-[#f3f7fd] to-[#d7e5f9] px-2 py-1 flex items-center border-y border-[#b4cbe7] shrink-0 shadow-xs z-10 select-none">
                <div className="relative mr-2">
                  <button
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded transition-colors shadow-sm bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0 cursor-pointer"
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
                          className="hover:bg-slate-100 p-1 text-base rounded transition-colors cursor-pointer"
                          type="button"
                        >
                          {replaceEmojis(em)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendNudge}
                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded transition-colors shadow-sm bg-slate-100 border border-slate-300 flex items-center space-x-1 cursor-pointer"
                  title="Enviar un zumbido"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-[10px] font-bold">Zumbido</span>
                </button>
              </div>
            )}

            {/* Input form */}
            {canSendMessages ? (
              <form onSubmit={handleSendMessage} className="relative p-2 md:p-3 bg-[#f0f5fc] border-t border-[#b6cef1] shrink-0 flex flex-col">
                {mentionQuery && mentionSuggestions.length > 0 && activeChannel === 'general' && (
                  <div className="absolute left-2 bottom-[100%] mb-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20">
                    <div className="px-3 py-1.5 bg-sky-50 text-xs font-bold text-sky-800 border-b border-sky-100 flex justify-between select-none">
                      <span>Mencionar...</span>
                      <span className="text-sky-600/50 font-normal">Esc para cancelar</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {mentionSuggestions.map((sug, i) => (
                        <div
                          key={sug}
                          onClick={() => acceptSuggestion(sug)}
                          onMouseEnter={() => setSelectedSuggestionIndex(i)}
                          className={`px-3 py-2 text-sm cursor-pointer border-b border-slate-50 last:border-0 ${i === selectedSuggestionIndex ? 'bg-sky-500 text-white font-medium' : 'hover:bg-sky-50 text-slate-700'}`}
                        >
                          @{sug}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2 relative">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={activeChannel === 'general' ? "Escribe al grupo (Usa @ para autocompletar, :) para emojis)" : "Escribe tu mensaje privado..."}
                    rows={2}
                    style={{ resize: 'none' }}
                    className="w-full px-3 py-2 bg-white border border-[#abc6e9] focus:border-[#7A96DF] focus:ring-1 focus:ring-[#7A96DF] rounded text-sm outline-none transition-all"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-[9px] text-slate-400 font-medium select-none">
                      Ej: :) :D :( :P (L) (Y) (N) (K)
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-1.5 bg-gradient-to-b from-[#e3effe] to-[#b9d7fa] text-[#183c7d] font-bold rounded border border-[#7A96DF] hover:from-[#c8ddfa] hover:to-[#a0c5f5] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm transition-all cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 shrink-0 italic">
                Escribir en este canal está deshabilitado para tu cuenta.
              </div>
            )}
          </div>
        )}
        </div>
        )}
      </div>

      {/* Profile Viewing Modal */}
      {viewingProfileOf && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingProfileOf(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-r from-sky-400 to-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h10v10H0V0zm10 10h10v10H10V10z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg">
                {viewingProfileOf.profilePictureUrl ? (
                  <img src={viewingProfileOf.profilePictureUrl} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-sky-200 to-sky-400 flex items-center justify-center text-white text-3xl font-extrabold">
                    {viewingProfileOf.fullName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-14 text-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {viewedUserProfile?.visibleName || viewingProfileOf.fullName}
                </h2>
                <p className="text-sm font-medium text-sky-600 mt-1 uppercase">{viewingProfileOf.profession}</p>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-inner">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Estado</p>
                  <p className="text-sm text-slate-700 italic">"{viewedUserProfile?.status || 'Disponible'}"</p>
                </div>
                <div className="flex justify-center space-x-2 mt-4 text-xs font-semibold text-slate-600">
                  <span className="px-2 py-1 bg-slate-200 rounded">BOX {viewingProfileOf.box}</span>
                  <span className="px-2 py-1 bg-slate-200 rounded">SECTOR {viewingProfileOf.sector.toUpperCase()}</span>
                </div>
                {onViewSocialProfile && (
                  <button
                    onClick={() => {
                      onViewSocialProfile(viewingProfileOf.id);
                      setViewingProfileOf(null);
                      setIsOpen(false);
                    }}
                    className="w-full mt-4 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow text-xs transition-colors cursor-pointer focus:outline-none"
                  >
                    Ver muro de publicaciones
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unificated Profile Dialog handled globally */}

      {/* LOGIN TOASTS FALLBACK */}
      <div className="fixed bottom-[64px] right-0 flex flex-col gap-2 z-[99999]" style={{ pointerEvents: 'none' }}>
        {loginToasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <LoginToast 
              userName={toast.fullName} 
              avatarUrl={toast.avatarUrl} 
              onClose={() => setLoginToasts(prev => prev.filter(t => t.id !== toast.id))} 
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};
