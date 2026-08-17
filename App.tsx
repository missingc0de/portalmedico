
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { doc, onSnapshot, setDoc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './services/firebase';
import MainMenu from './components/MainMenu';
import Sidebar from './components/Sidebar';
import ConstanciaAtencionForm from './components/ConstanciaAtencionForm';
import OrdenExamenRadiologicoForm from './components/OrdenExamenRadiologicoForm';
import CertificadoEscolarForm from './components/CertificadoEscolarForm';
import DerivacionesPscvForm from './components/DerivacionesPscvForm';
import OrdenLaboratorioForm from './components/OrdenLaboratorioForm';
import RecetaMedicaForm from './components/RecetaMedicaForm';
import CertificadoMedicoForm from './components/CertificadoMedicoForm';
import { CertificadoMedicoWindow } from './components/CertificadoMedicoWindow';
import { RecetaMedicaWindow } from './components/RecetaMedicaWindow';
import OnCallCalendar from './components/OnCallCalendar';
import MainMenuDashboard from './components/MainMenuDashboard';
import LoginForm from './components/LoginForm';
import UnderConstruction from './components/UnderConstruction';
import FichaControlHipotiroidismo from './components/FichaControlHipotiroidismo';
import FichaPreingresoEcicep from './components/FichaPreingresoEcicep';
import { FichaIngresoEcicep } from './components/FichaIngresoEcicep';
import FichaControlEcicepNuevo from './components/FichaControlEcicepNuevo';
import FichaSeguimientoEcicep from './components/FichaSeguimientoEcicep';
import FichaControlSalaEra from './components/FichaControlSalaEra';
import { LeftIndex } from './components/LeftIndex';
import FichaControlSalaIra from './components/FichaControlSalaIra';
import FichaControlNinoSano from './components/FichaControlNinoSano';
import FichaControlCardiovascular from './components/FichaControlCardiovascular';
import FichaControlAdultoMayor from './components/FichaControlAdultoMayor';
import FichaControlNinoSano1Mes from './components/FichaControlNinoSano1Mes';
import FichaControlNinoSano3Mes from './components/FichaControlNinoSano3Mes';
import FichaControlNinoSano6Anos from './components/FichaControlNinoSano6Anos';
import FichaMorbilidad from './components/FichaMorbilidad';
import FichaControlPscv from './components/FichaControlPscv';
import FichaIngresoSm from './components/FichaIngresoSm';
import FichaControlSm from './components/FichaControlSm';
import FichaConsultaPasmi from './components/FichaConsultaPasmi';
import FichaConsultoria from './components/FichaConsultoria';
import FichaControlEpilepsia from './components/FichaControlEpilepsia';
import { FichaControlArtrosis } from './components/FichaControlArtrosis';
import FichaFondoOjo from './components/FichaFondoOjo';
import FichaGrupalDiabetes from './components/FichaGrupalDiabetes';
import IngresoDemenciasForm from './components/IngresoDemenciasForm';
import FichaControlDemencias from './components/FichaControlDemencias';
import FichaVisitaDomiciliaria from './components/FichaVisitaDomiciliaria';
import UserProfileModal from './components/UserProfileModal';
import PhoneDirectoryModal from './components/PhoneDirectoryModal';
import UrgenciasModal from './components/UrgenciasModal';
import GrupalDiabetesManager from './components/GrupalDiabetesManager';
import { CalculoLechesForm } from './components/CalculoLechesForm';
import CurvasCrecimiento from './components/CurvasCrecimiento';
import DosisPediatria from './components/DosisPediatria';
import ArsenalFarmacologicoScreen from './components/ArsenalFarmacologicoScreen';
import BuscadorExamenesLab from './components/BuscadorExamenesLab';
import TablaComposicionAlimentos from './components/TablaComposicionAlimentos';
import FichaFirmarGes from './components/FichaFirmarGes';
import MisPacientes from './components/MisPacientes';
import { SapuMenu } from './components/SapuMenu';
import { PatientRecord } from './services/patientStore';
import { onCallScheduleData, specialEventsData } from './data/onCallScheduleData';
import { users as initialUsers } from './data/userData';
import { subscribeToCloudUsers } from './services/userService';
import { subscribeToCalendarEvents } from './services/eventsService';
import { View, User, CertificateType, Profession, CESFAM, Sector, SpecialEvent } from './types';
import Bitacora from './components/Bitacora';
import AutomaticTranscriber from './components/AutomaticTranscriber';
import { TabNavBar, ComunidadFeed, PerfilFeed } from './components/SocialFeed';
import NotificationBell from './components/NotificationBell';
import { RemWindow } from './components/RemWindow';
import EmailGenerator from './components/EmailGenerator';
import { ChatLocal, LinkedInDefaultAvatar } from './components/ChatLocal';
import ContextMenu from './components/ContextMenu';
import { DriveEcicepWindow } from './components/DriveEcicepWindow';
import { NotesWindow } from './components/NotesWindow';
import { CalculatorWindow } from './components/CalculatorWindow';
import { LoginToast } from './components/LoginToast';

const MaskedDateInput: React.FC<{ value: string; onChange: (val: string) => void; className?: string }> = ({ value, onChange, className }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const isTyping = useRef(false);
  const prevExternalValue = useRef(value || '');

  useEffect(() => {
    // Only sync from parent when: value is empty (reset), OR when value changed externally
    // and user is NOT actively typing
    if (!isTyping.current) {
      if (value !== prevExternalValue.current || value === '') {
        prevExternalValue.current = value || '';
        setLocalValue(value || '');
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTyping.current = true;
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
    }
    if (val.length > 4) {
      formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
    }
    
    prevExternalValue.current = formatted;
    setLocalValue(formatted);
    onChange(formatted);
  };

  const handleBlur = () => {
    isTyping.current = false;
  };

  return (
    <input
      type="text"
      placeholder="DD-MM-AAAA"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      maxLength={10}
    />
  );
};



const professionLabelsMap: Record<Profession, string> = {
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

const getProfessionPrefix = (profession: Profession): string => {
  switch (profession) {
    case 'medicina': return 'Dr.';
    case 'nutricion': return 'Nta.';
    case 'psicologia': return 'Ps.';
    case 'enfermeria': return 'Enf.';
    case 'tens': return 'TENS.';
    case 'asistente_social': return 'TS.';
    case 'quimico_farmaceutico': return 'QF';
    case 'odontologia': return 'OD';
    case 'kinesiologo': return 'Kn.';
    case 'matroneria': return 'Mat.';
    default: return '';
  }
};

const getSectorText = (sector?: Sector): string => {
  if (!sector || sector === 'No especificado') return 'Sector no especificado';
  if (sector === 'Naranjo') return 'Sector naranja';
  return `Sector ${sector.toLowerCase()}`;
};

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState('');
  const [dateDisplay, setDateDisplay] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const chileTime = now.toLocaleTimeString('es-CL', {
        timeZone: 'America/Santiago',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTime(chileTime);

      const dayOfWeek = now.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        weekday: 'long',
      });

      const dateString = now.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/-/g, '/');

      setDateDisplay(`${dayOfWeek.toUpperCase()} ${dateString}`);
    };

    updateDateTime(); // Initial call
    const timerId = setInterval(updateDateTime, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="flex-shrink-0 w-full bg-[#1a2130] rounded-xl p-5 flex items-center justify-center gap-4 shadow-sm border-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="#58c7fa"
        className="w-10 h-10 flex-shrink-0"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <div className="flex flex-col items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {dateDisplay || 'CARGANDO FECHA...'}
        </span>
        <div className="text-3xl sm:text-4xl font-mono font-black text-[#58c7fa] tracking-widest leading-none">
          {time || '00:00:00'}
        </div>
      </div>
    </div>
  );
};

const DRIVE_LINKS: Record<string, string> = {
  'Verde':      'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0',
  'Naranjo':    'https://docs.google.com/spreadsheets/d/17cNcOTdn8qupYchtc10ouMG45ve_BpaZZmTGEdos-4Q/edit?gid=152571995#gid=152571995',
  'Amarillo':   'https://docs.google.com/spreadsheets/d/1paEDMTrLz2Ig_jpayPoc1z1GsnJTfSAR/edit?gid=1909397780#gid=1909397780',
};

const tweets = [
  {
    id: 'static-1',
    date: '28 feb. 2026',
    text: '🚀 Plantillas no médicas en camino. Próximamente para Enfermería (ENF), Nutrición (NTA), Psicología (PS) y Kinesiología (KINE). ¡Atentos a las actualizaciones!',
    timestamp: new Date(2026, 1, 28, 12, 0, 0),
    isStatic: true
  },
  {
    id: 'static-2',
    date: '28 feb. 2026',
    text: '📂 Drive ECICEP activo: Acceso directo según sector asignado. Accede de forma rápida y segura a la planilla de tu sector.',
    timestamp: new Date(2026, 1, 28, 11, 0, 0),
    isStatic: true
  },
  {
    id: 'static-3',
    date: '28 feb. 2026',
    text: '📍 Nueva Sectorización: Los usuarios ya están divididos por sus sectores oficiales. Asegúrate de verificar tu sector en tu perfil.',
    timestamp: new Date(2026, 1, 28, 10, 0, 0),
    isStatic: true
  },
  {
    id: 'static-4',
    date: '25 oct. 2025',
    text: '📋 Importar controles previos: Copia y pega para autocompletado rápido de fichas. Ahorra tiempo en tus atenciones diarias.',
    timestamp: new Date(2025, 9, 25, 12, 0, 0),
    isStatic: true
  },
  {
    id: 'static-5',
    date: '13 sep. 2025',
    text: '⚙️ Control ECICEP actualizado: Omite o agrega datos de ingreso con un solo clic. Más flexibilidad para tus registros clínicos.',
    timestamp: new Date(2025, 8, 13, 12, 0, 0),
    isStatic: true
  },
  {
    id: 'static-6',
    date: '12 sep. 2025',
    text: '📄 Ficha de Consultoría de Salud Mental (SM): Exporta a formato PDF y Word editable. Optimiza la comunicación con especialidades.',
    timestamp: new Date(2025, 8, 12, 12, 0, 0),
    isStatic: true
  }
];

const formatFeedDate = (date: any): string => {
  if (!date) return 'Ahora mismo';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [animationState, setAnimationState] = useState<'idle' | 'fading-out' | 'invisible' | 'fading-in'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [dynamicEvents, setDynamicEvents] = useState<SpecialEvent[]>([]);
  const [computerBox, setComputerBox] = useState<string>(localStorage.getItem('computerBox') || '');
  const [computerSector, setComputerSector] = useState<string>(localStorage.getItem('computerSector') || '');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [lowResources, setLowResources] = useState<boolean>(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [profileStatus, setProfileStatus] = useState<string>('');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 5, 1));
  const [activeTab, setActiveTab] = useState<'inicio' | 'comunidad' | 'perfil'>('inicio');
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string>('');
  const [openExternalLinks, setOpenExternalLinks] = useState<Record<string, boolean>>({});
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [pscvTipo, setPscvTipo] = useState('');
  const [pscvFecha, setPscvFecha] = useState(new Date().toISOString().split('T')[0]);
  const pscvActionsRef = useRef<{ exportPdf: () => void; newForm: () => void } | null>(null);
  const [preingresoFecha, setPreingresoFecha] = useState(new Date().toISOString().split('T')[0]);
  const preingresoActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>(null);
  const todayDDMMYYYY = (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`; })();
  const [ingresoFecha, setIngresoFecha] = useState(() => todayDDMMYYYY);
  const ingresoActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>(null);
  const pasmiActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; } | null>(null);
  const [pasmiFecha, setPasmiFecha] = useState(todayDDMMYYYY);
  const [controlEcicepFecha, setControlEcicepFecha] = useState(todayDDMMYYYY);
  const controlEcicepActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>(null);
  const [seguimientoEcicepFecha, setSeguimientoEcicepFecha] = useState(todayDDMMYYYY);
  const [seguimientoEcicepUltimoFecha, setSeguimientoEcicepUltimoFecha] = useState('');
  const seguimientoEcicepActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>(null);
  const salaEraActionsRef = useRef<{ exportPdf: () => void; newForm: () => void; remClick?: () => void } | null>(null);
  const controlSmActionsRef = useRef<{ exportPdf: () => void; newForm: () => void } | null>(null);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('appZoomLevel');
    return saved ? parseInt(saved, 10) : 100;
  });

  useEffect(() => {
    (document.body.style as any).zoom = `${zoomLevel}%`;
    localStorage.setItem('appZoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    if (isAuthenticated) {
      const q = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: any[] = [];
        snap.forEach(d => {
          const data = d.data();
          list.push({
            id: d.id,
            authorName: data.authorName,
            authorUsername: data.authorUsername,
            authorProfession: data.authorProfession,
            authorAvatar: data.authorAvatar,
            text: data.content,
            imageUrl: data.imageUrl,
            timestamp: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            isStatic: false
          });
        });
        setUserPosts(list);
      }, (err) => {
        console.error("Error loading social posts for news feed:", err);
      });
      return unsub;
    }
  }, [isAuthenticated]);

  const mergedFeed = React.useMemo(() => {
    const combined = [...tweets, ...userPosts];
    return combined.sort((a, b) => {
      const getTs = (item: any) => {
        if (!item || !item.timestamp) return 0;
        if (item.timestamp instanceof Date) return item.timestamp.getTime();
        if (typeof item.timestamp?.toDate === 'function') {
          try { return item.timestamp.toDate().getTime(); } catch (e) { return 0; }
        }
        const d = new Date(item.timestamp);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getTs(b) - getTs(a);
    });
  }, [userPosts]);

  const [linksHeight, setLinksHeight] = useState<number | null>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && currentView === 'menu' && linksRef.current) {
      const updateHeight = () => {
        if (linksRef.current) {
          setLinksHeight(linksRef.current.offsetHeight);
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });

      resizeObserver.observe(linksRef.current);
      updateHeight();

      return () => resizeObserver.disconnect();
    }
  }, [isAuthenticated, currentView, openExternalLinks]);

  const toggleExternalLink = (key: string) => {
    setOpenExternalLinks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => alert(`${label} copiado al portapapeles.`),
      () => alert('Error al copiar al portapapeles.')
    );
  };

  const handleViewUserProfile = useCallback((username: string) => {
    setSelectedProfileUsername(username);
    setActiveTab('perfil');
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      setSelectedProfileUsername(loggedInUser.username);
    } else {
      setSelectedProfileUsername('');
    }
  }, [loggedInUser]);


  useEffect(() => {
    if (isAuthenticated && loggedInUser) {
      setProfilePictureUrl(loggedInUser.profilePictureUrl || '');
      setProfileName(loggedInUser.fullName || '');
      setProfileStatus('');
      const unsubscribe = onSnapshot(doc(db, 'user_profiles', loggedInUser.username), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.profilePictureUrl) {
            setProfilePictureUrl(data.profilePictureUrl);
            setLoggedInUser(prev => prev ? { ...prev, profilePictureUrl: data.profilePictureUrl } : null);
          }
          if (data.visibleName) {
            setProfileName(data.visibleName);
            setLoggedInUser(prev => prev ? { ...prev, fullName: data.visibleName } : null);
          }
          if (data.status) {
            setProfileStatus(data.status);
          }
        }
      });
      return () => unsubscribe();
    } else {
      setProfilePictureUrl('');
      setProfileName('');
      setProfileStatus('');
    }
  }, [isAuthenticated, loggedInUser]);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);
  const [isPhoneDirectoryModalOpen, setIsPhoneDirectoryModalOpen] = useState<boolean>(false);
  const [isUrgenciasModalOpen, setIsUrgenciasModalOpen] = useState<boolean>(false);
  const [isCertificadoWindowOpen, setIsCertificadoWindowOpen] = useState<boolean>(false);
  const [isRecetaWindowOpen, setIsRecetaWindowOpen] = useState<boolean>(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any | null>(null);
  const [loginToastUser, setLoginToastUser] = useState<{name: string, avatar?: string} | null>(null);
  const [isRemOpen, setIsRemOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleWindow = (windowName: string) => {
    if (windowName === 'drive') {
      setIsDriveOpen(!isDriveOpen);
      setIsCertificadoWindowOpen(false);
      setIsRecetaWindowOpen(false);
      setIsCalcOpen(false);
      setIsNotesOpen(false);
    } else if (windowName === 'certificado') {
      setIsCertificadoWindowOpen(!isCertificadoWindowOpen);
      setIsDriveOpen(false);
      setIsRecetaWindowOpen(false);
      setIsCalcOpen(false);
      setIsNotesOpen(false);
    } else if (windowName === 'receta') {
      setIsRecetaWindowOpen(!isRecetaWindowOpen);
      setIsDriveOpen(false);
      setIsCertificadoWindowOpen(false);
      setIsCalcOpen(false);
      setIsNotesOpen(false);
    } else if (windowName === 'calc') {
      setIsCalcOpen(!isCalcOpen);
      setIsDriveOpen(false);
      setIsCertificadoWindowOpen(false);
      setIsRecetaWindowOpen(false);
      setIsNotesOpen(false);
    } else if (windowName === 'notes') {
      setIsNotesOpen(!isNotesOpen);
      setIsDriveOpen(false);
      setIsCertificadoWindowOpen(false);
      setIsRecetaWindowOpen(false);
      setIsCalcOpen(false);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Real-time synchronization of users from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToCloudUsers((cloudUsers) => {
      setUsers((currentUsers) => {
        // Merge cloud users overriding/appending to initial static users
        const combinedMap = new Map<string, User>();

        // Load initial static users first
        initialUsers.forEach(u => combinedMap.set(u.username.toLowerCase(), u));

        // Overlay with dynamically registered cloud users
        cloudUsers.forEach(u => combinedMap.set(u.username.toLowerCase(), u));

        return Array.from(combinedMap.values());
      });
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Calendar Events
  useEffect(() => {
    if (isAuthenticated && loggedInUser) {
      const unsubscribeEvents = subscribeToCalendarEvents((events) => {
        setDynamicEvents(events);
      });
      return () => unsubscribeEvents();
    }
  }, [isAuthenticated, loggedInUser]);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setInstallPromptEvent(null);
  };


  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        // This event fires when the service worker controlling this page changes.
        // It's a good time to notify the user that the app has been updated.
        setShowUpdateNotification(true);
        setTimeout(() => {
          setShowUpdateNotification(false);
        }, 5000); // Hide after 5 seconds
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // La prevención de cierre accidental ha sido delegada a main.cjs (nativo de Electron).

  const isAuthenticatedRef = React.useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    const storedUsername = sessionStorage.getItem('loggedInUserUsername');
    const storedProfession = sessionStorage.getItem('loggedInUserProfession') as Profession;
    const storedCesfam = sessionStorage.getItem('loggedInUserCesfam') as CESFAM;
    const storedElectronicSignature = sessionStorage.getItem('loggedInUserElectronicSignature');
    const storedSector = sessionStorage.getItem('loggedInUserSector') as Sector;

    if (storedAuth === 'true' && storedUsername) {
      const userFromSource = users.find(u => u.username.toLowerCase() === storedUsername.toLowerCase());
      if (userFromSource) {
        const storedFullName = sessionStorage.getItem('loggedInUserFullName') || userFromSource.fullName;
        const storedRut = sessionStorage.getItem('loggedInUserRut');
        const storedPassword = sessionStorage.getItem('loggedInUserPassword') || userFromSource.password;

        const hydratedUser: User = {
          ...userFromSource,
          fullName: storedFullName,
          rut: storedRut === null || storedRut === '' ? undefined : storedRut,
          password: storedPassword,
          profession: storedProfession || userFromSource.profession,
          cesfam: storedCesfam || userFromSource.cesfam,
          electronicSignature: storedElectronicSignature || userFromSource.electronicSignature,
          sector: storedSector || userFromSource.sector || 'No especificado',
        };
        setIsAuthenticated(true);
        isAuthenticatedRef.current = true; // Keep ref in sync
        setLoggedInUser(hydratedUser);
        setCurrentView('menu');
      } else {
        sessionStorage.clear();
      }
    }
  }, [users]);

  const navigateTo = useCallback((view: View, patientData?: PatientRecord) => {
    if (patientData) {
      setActivePatient(patientData);
    }
    setAnimationState('fading-out');
    setTimeout(() => {
      // Set to invisible BEFORE mounting the new view to prevent flash
      setAnimationState('invisible');
      
      // Use ref to avoid stale closure - isAuthenticated may not have updated yet during login
      if (isAuthenticatedRef.current) {
        setCurrentView(view);
      } else {
        setCurrentView('login');
      }
      setIsProfileDropdownOpen(false);
      
      // Delay the fade-in slightly to let the browser mount the new view at opacity-0
      setTimeout(() => {
        setAnimationState('fading-in');
        
        // Remove animation class after fade-in completes (250ms)
        setTimeout(() => {
          setAnimationState('idle');
        }, 250);
      }, 50); // 50ms is enough to render the DOM invisibly
    }, 250);
  }, []);

  const loginUser = (user: User, rememberMe: boolean = false, box: string = '', sector: string = '') => {
    isAuthenticatedRef.current = true; // Update ref synchronously before React state updates
    setIsAuthenticated(true);
    setLoggedInUser(user);
    if (box) {
      setComputerBox(box);
      localStorage.setItem('computerBox', box);
    }
    if (sector) {
      setComputerSector(sector);
      localStorage.setItem('computerSector', sector);
    }
    setLowResources(localStorage.getItem('lowResources') === 'true');
    setCurrentView('menu');

    // Set session storage
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('loggedInUserUsername', user.username);
    sessionStorage.setItem('loggedInUserFullName', user.fullName);
    sessionStorage.setItem('loggedInUserRut', user.rut || '');
    sessionStorage.setItem('loggedInUserPassword', user.password || '');
    sessionStorage.setItem('loggedInUserProfession', user.profession);
    sessionStorage.setItem('loggedInUserCesfam', user.cesfam);
    sessionStorage.setItem('loggedInUserElectronicSignature', user.electronicSignature || '');
    sessionStorage.setItem('loggedInUserSector', user.sector || 'No especificado');

    // Handle "Remember Me" for traditional login
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedUsername', user.username);
      const activePwd = user.password || sessionStorage.getItem('loggedInUserPassword') || localStorage.getItem('rememberedPassword') || '';
      if (activePwd) {
        localStorage.setItem('rememberedPassword', activePwd);
      }
    } else {
      if (user.username !== 'house') {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }
    }
  }

  const handleLoginSuccess = (username: string, rememberMe: boolean, box: string, sector: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      loginUser(user, rememberMe, box, sector);
      
      // Simulate MSN login toast for the logged in user
      setTimeout(() => {
        setLoginToastUser({
          name: user.fullName,
          avatar: user.profilePictureUrl
        });
      }, 1000);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Seguro que desea cerrar sesión? Se borrarán los datos de la sesión actual.")) {
      setIsAuthenticated(false);
      setLoggedInUser(null);
      setCurrentView('login');
      setIsProfileDropdownOpen(false);

      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('loggedInUserUsername');
      sessionStorage.removeItem('loggedInUserFullName');
      sessionStorage.removeItem('loggedInUserRut');
      sessionStorage.removeItem('loggedInUserPassword');
      sessionStorage.removeItem('loggedInUserProfession');
      sessionStorage.removeItem('loggedInUserCesfam');
      sessionStorage.removeItem('loggedInUserElectronicSignature');
      sessionStorage.removeItem('loggedInUserSector');
    }
  };

  const handleUpdateUser = (updatedUserData: any, newPassword?: string) => {
    if (loggedInUser) {
      const newUserState: User = {
        ...loggedInUser,
        fullName: updatedUserData.fullName,
        rut: updatedUserData.rut || undefined, // Store undefined if empty
        cesfam: updatedUserData.cesfam,
        profession: updatedUserData.profession,
        electronicSignature: updatedUserData.electronicSignature,
        sector: updatedUserData.sector,
        profilePictureUrl: updatedUserData.profilePictureUrl
      };
      if (newPassword) {
        newUserState.password = newPassword;
      }
      setLoggedInUser(newUserState);
      setProfilePictureUrl(updatedUserData.profilePictureUrl || '');
      setUsers(prevUsers => prevUsers.map(u => u.username === loggedInUser.username ? newUserState : u));
      sessionStorage.setItem('loggedInUserFullName', newUserState.fullName);
      sessionStorage.setItem('loggedInUserRut', newUserState.rut || '');
      sessionStorage.setItem('loggedInUserCesfam', newUserState.cesfam);
      sessionStorage.setItem('loggedInUserProfession', newUserState.profession);
      sessionStorage.setItem('loggedInUserElectronicSignature', newUserState.electronicSignature || '');
      sessionStorage.setItem('loggedInUserSector', newUserState.sector || 'No especificado');
      if (newPassword) {
        sessionStorage.setItem('loggedInUserPassword', newPassword);
      }
      
      // Update Firestore user_profiles
      setDoc(doc(db, 'user_profiles', loggedInUser.username), {
        visibleName: updatedUserData.visibleName || updatedUserData.fullName,
        status: updatedUserData.status || '',
        profilePictureUrl: updatedUserData.profilePictureUrl || ''
      }, { merge: true }).catch(err => console.error("Error updating user_profiles in firestore:", err));

      // Update Firestore presence and chat_users
      setDoc(doc(db, 'presence', loggedInUser.username), {
        fullName: updatedUserData.visibleName || updatedUserData.fullName,
        status: updatedUserData.status || 'Disponible.',
        profilePictureUrl: updatedUserData.profilePictureUrl || '',
        lastSeen: serverTimestamp()
      }, { merge: true }).catch(err => console.error("Error updating presence:", err));

      setDoc(doc(db, 'chat_users', loggedInUser.username), {
        fullName: updatedUserData.visibleName || updatedUserData.fullName,
        status: updatedUserData.status || 'Disponible.',
        profilePictureUrl: updatedUserData.profilePictureUrl || '',
        lastSeen: serverTimestamp()
      }, { merge: true }).catch(err => console.error("Error updating chat_users:", err));

      alert("Datos actualizados con éxito.");
      setIsUserProfileModalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUnderConstructionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('Esta sección se encuentra actualmente en construcción.');
  };

  const renderLeftColumn = (
    showFeedAndLinks: boolean = true,
    isPscvMode: boolean = false,
    pscvTipo?: string,
    pscvFecha?: string,
    onPscvTipoChange?: (val: string) => void,
    onPscvFechaChange?: (val: string) => void,
    isPreingresoMode: boolean = false,
    preingresoFechaVal?: string,
    onPreingresoFechaChange?: (val: string) => void,
    preingresoActionsRefProp?: React.MutableRefObject<{ exportPdf: () => void; newForm: () => void; imprimirResumen?: () => void; editarDrive?: () => void } | null>,
    isIngresoMode: boolean = false,
    isControlEcicepMode: boolean = false,
    controlEcicepFechaVal?: string,
    onControlEcicepFechaChange?: (val: string) => void,
    controlEcicepActionsRefProp?: React.MutableRefObject<any>,
    isSeguimientoEcicepMode: boolean = false,
    seguimientoEcicepFechaVal?: string,
    onSeguimientoEcicepFechaChange?: (val: string) => void,
    seguimientoEcicepUltimoFechaVal?: string,
    onSeguimientoEcicepUltimoFechaChange?: (val: string) => void,
    seguimientoEcicepActionsRefProp?: React.MutableRefObject<any>,
    isSalaMode: boolean = false,
    isSmMode: boolean = false,
    isPasmiMode: boolean = false,
    pasmiFechaVal?: string,
    onPasmiFechaChange?: (val: string) => void,
    pasmiActionsRefProp?: React.MutableRefObject<any>,
    salaEraActionsRefProp?: React.MutableRefObject<any>,
    controlSmActionsRefProp?: React.MutableRefObject<any>
  ) => {
    if (!loggedInUser) return null;

    let pscvAvatarNode = null;
    if (isPscvMode) {
      if (pscvTipo === 'Control cardiovascular') {
        pscvAvatarNode = (
          <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-rose-50 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      } else if (pscvTipo === 'Control artrosis') {
        pscvAvatarNode = (
          <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}>
              <circle cx="4" cy="8" r="3.5" />
              <circle cx="4" cy="16" r="3.5" />
              <circle cx="20" cy="8" r="3.5" />
              <circle cx="20" cy="16" r="3.5" />
              <rect x="4" y="9.5" width="16" height="5" />
            </svg>
          </div>
        );
      } else if (pscvTipo === 'Control epilepsia') {
        pscvAvatarNode = (
          <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-sky-50 flex items-center justify-center shrink-0">
            {/* Rayo / Lightning bolt */}
            <svg className="w-12 h-12 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" />
            </svg>
          </div>
        );
      } else if (pscvTipo === 'Control hipotiroidismo') {
        pscvAvatarNode = (
          <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-teal-50 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-teal-600 tracking-tighter">TSH</span>
          </div>
        );
      } else {
        pscvAvatarNode = (
          <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 12h6m-3-3v6" />
            </svg>
          </div>
        );
      }
    }

    // Preingreso ECICEP avatar
    let preingresoAvatarNode = null;
    if (isPreingresoMode) {
      preingresoAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      );
    } else if (isIngresoMode) {
      preingresoAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
      );
    } else if (isControlEcicepMode) {
      preingresoAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      );
    } else if (isSeguimientoEcicepMode) {
      preingresoAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      );
    }

    let smAvatarNode = null;
    if (isSmMode || isPasmiMode) {
      smAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M12 5v14" />
            <path d="M12 12h6" />
            <path d="M12 12H6" />
          </svg>
        </div>
      );
    }

    let pasmiAvatarNode = null;
    if (isPasmiMode) {
      pasmiAvatarNode = (
        <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a5 5 0 100 10 5 5 0 000-10zm-2 4h.01M14 6h.01M9 8.5a3.5 3.5 0 006 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 13c-4.42 0-8 2.58-8 6v2h16v-2c0-3.42-3.58-6-8-6z" />
          </svg>
        </div>
      );
    }

    return (
      <div className={`lg:col-span-3 flex flex-col gap-4 ${(isPscvMode || isPreingresoMode || isIngresoMode || isControlEcicepMode || isSeguimientoEcicepMode || isSalaMode || isSmMode || isPasmiMode) ? 'lg:sticky lg:top-24 lg:h-[calc(100vh-130px)] lg:overflow-y-auto' : ''}`}>
        
        {/* Reloj Digital */}
        <DigitalClock />

        {/* Tarjeta de Perfil Estilo LinkedIn (En Columna Izquierda) */}
        {!isIngresoMode && !isControlEcicepMode && !isPreingresoMode && !isSalaMode && !isSmMode && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full">
            <div className="h-24 w-full bg-gradient-to-r from-sky-600 to-sky-700 relative overflow-hidden">
            </div>
          {/* Fila del Perfil */}
          <div className="px-4 pb-4 relative flex flex-col items-center w-full">
            
            {/* Avatar cuadrado superpuesto */}
            <div className="relative -mt-12 mb-3 z-10 shrink-0 flex justify-center">
              {isPscvMode ? pscvAvatarNode : (isPreingresoMode || isIngresoMode || isControlEcicepMode || isSeguimientoEcicepMode) ? preingresoAvatarNode : isSalaMode ? (
                <div className="w-24 h-24 rounded-xl border-4 border-white shadow-md bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C11.5 2 11 2.5 11 3V7.5C9 7.5 7 9.5 6 13C5.5 14.5 5 17 6.5 19C7.5 20.5 9.5 21 10.5 20C11.5 19 11 16 11 15V13C11 12.5 11.5 12 12 12C12.5 12 13 12.5 13 13V15C13 16 12.5 19 13.5 20C14.5 21 16.5 20.5 17.5 19C19 17 18.5 14.5 18 13C17 9.5 15 7.5 13 7.5V3C13 2.5 12.5 2 12 2ZM8.5 11.5C9.5 11.5 10 12.5 10 13.5C10 14.5 9 16 8 16C7.5 16 7 15.5 7 15C7 13.5 7.5 11.5 8.5 11.5ZM15.5 11.5C16.5 11.5 17 13.5 17 15C17 15.5 16.5 16 16 16C15 16 14 14.5 14 13.5C14 12.5 14.5 11.5 15.5 11.5Z" />
                  </svg>
                </div>
              ) : isPasmiMode ? pasmiAvatarNode : isSmMode ? smAvatarNode : (
                profilePictureUrl ? (
                  <img src={profilePictureUrl} className="w-24 h-24 rounded-xl border-4 border-white object-cover bg-white shadow-md" alt="Avatar" />
                ) : (
                  <div className="w-24 h-24 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
                    <LinkedInDefaultAvatar />
                  </div>
                )
              )}
            </div>

            {/* Contenido (Nombre y Estado) */}
            <div className="flex flex-col w-full items-center text-center">
              {isPscvMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  CONTROL CRÓNICO
                </h2>
              ) : isPreingresoMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  PREINGRESO ECICEP
                </h2>
              ) : isIngresoMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  FICHA INGRESO ECICEP
                </h2>
              ) : isControlEcicepMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  FICHA CONTROL ECICEP
                </h2>
              ) : isSeguimientoEcicepMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  SEGUIMIENTO ECICEP
                </h2>
              ) : isSalaMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {currentView === 'fichaControlSalaEra' || currentView === 'fichaControlSalaIra' ? 'FICHA SALA IRA/ERA' : 'SALA RESPIRATORIA'}
                </h2>
              ) : isSmMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {currentView === 'fichaControlSm' ? 'CONTROL SALUD MENTAL' : 'INGRESO SALUD MENTAL'}
                </h2>
              ) : isPasmiMode ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  CONSULTA PASMI
                </h2>
              ) : (currentView === 'fichaControlNinoSano1Mes' || currentView === 'fichaControlNinoSano3Mes' || currentView === 'fichaControlNinoSano6Anos') ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {currentView === 'fichaControlNinoSano1Mes' ? 'NIÑO SANO 1 MES (MÉDICO)' : currentView === 'fichaControlNinoSano3Mes' ? 'NIÑO SANO 3 MES (MÉDICO)' : 'NIÑO SANO 6 AÑOS (MÉDICO)'}
                </h2>
              ) : currentView === 'fichaVisitaDomiciliaria' ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  VISITA DOMICILIARIA
                </h2>
              ) : currentView === 'fichaFirmarGes' ? (
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  CONSTANCIA GES
                </h2>
              ) : (
                <>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap leading-tight">
                    <span className="text-slate-400 font-semibold">{getProfessionPrefix(loggedInUser.profession)}</span> {profileName || loggedInUser.fullName}
                    <svg className="w-5 h-5 text-blue-500 fill-current shrink-0" viewBox="0 0 20 20" aria-label="Verificado">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {professionLabelsMap[loggedInUser.profession] || loggedInUser.profession}
                    {(loggedInUser.sector && loggedInUser.sector !== 'No especificado') ? (
                      <> &mdash; Sector {loggedInUser.sector}</>
                    ) : computerSector ? (
                      <> &mdash; Sector {computerSector}</>
                    ) : null}
                  </p>

                  {/* Estado de Messenger */}
                  <div className="mt-2 text-xs font-semibold text-sky-600 bg-sky-50/50 border border-sky-100/70 rounded-lg px-2.5 py-1.5 inline-block shadow-sm leading-relaxed max-w-full">
                    Estado: <span className="font-bold text-slate-700">"{profileStatus || 'Disponible'}"</span>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 mt-3.5 w-full">
                    <button
                      onClick={() => setIsUserProfileModalOpen(true)}
                      className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full text-xs shadow transition-colors cursor-pointer text-center"
                    >
                      Editar perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full text-xs shadow transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
        )}

        {(isIngresoMode || isControlEcicepMode || isPreingresoMode || isSalaMode || isSmMode) && (
          <LeftIndex />
        )}

        {isPscvMode && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 pb-2">
                Datos de la Prestación
              </h3>
              {/* Tipo de control crónico */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1">Tipo de Control</label>
                <select
                  value={pscvTipo || ''}
                  onChange={(e) => onPscvTipoChange?.(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                >
                  <option value="">Seleccione...</option>
                  <option value="Control cardiovascular">Control cardiovascular</option>
                  <option value="Control hipotiroidismo">Control hipotiroidismo</option>
                  <option value="Control epilepsia">Control epilepsia</option>
                  <option value="Control artrosis">Control artrosis</option>
                </select>
              </div>
              {/* Fecha de Control */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1">Fecha de Control</label>
                <input
                  type="date"
                  value={pscvFecha || ''}
                  onChange={(e) => onPscvFechaChange?.(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Acciones de la Ficha Separadas */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-2">
              <button
                onClick={() => pscvActionsRef.current?.newForm()}
                className="w-full py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs cursor-pointer flex items-center justify-start px-4 gap-2 uppercase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                LIMPIAR FORMULARIO
              </button>
            </div>
          </>
        )}

        {(isPreingresoMode || isIngresoMode || isControlEcicepMode || isSeguimientoEcicepMode || isPasmiMode || isSalaMode) && (
          (() => {
            let dateVal = '';
            let onDateChange: ((val: string) => void) | undefined = undefined;
            let dateLabel = 'Fecha de Ingreso';
            let actionsRef: React.MutableRefObject<any> | null | undefined = null;

            if (isPreingresoMode || isIngresoMode) {
              dateVal = preingresoFechaVal || '';
              onDateChange = onPreingresoFechaChange;
              dateLabel = 'Fecha de Ingreso';
              actionsRef = preingresoActionsRefProp;
            } else if (isControlEcicepMode) {
              dateVal = controlEcicepFechaVal || '';
              onDateChange = onControlEcicepFechaChange;
              dateLabel = 'Fecha de Control';
              actionsRef = controlEcicepActionsRefProp;
            } else if (isSeguimientoEcicepMode) {
              dateVal = seguimientoEcicepFechaVal || '';
              onDateChange = onSeguimientoEcicepFechaChange;
              dateLabel = 'Fecha de Seguimiento';
              actionsRef = seguimientoEcicepActionsRefProp;
            } else if (isPasmiMode) {
              dateVal = pasmiFechaVal || '';
              onDateChange = onPasmiFechaChange;
              dateLabel = 'Fecha de Consulta';
              actionsRef = pasmiActionsRefProp;
            } else if (isSalaMode) {
              actionsRef = salaEraActionsRefProp;
            } else if (isSmMode) {
              actionsRef = controlSmActionsRefProp;
            }

            return (
              <>
                {!isIngresoMode && !isControlEcicepMode && !isPreingresoMode && !isSalaMode && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150 pb-2">
                      Datos de la Prestación
                    </h3>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-600 mb-1">{dateLabel}</label>
                      <MaskedDateInput
                        value={dateVal}
                        onChange={(val: string) => onDateChange?.(val)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                      />
                    </div>
                    {isSeguimientoEcicepMode && (
                      <div className="flex flex-col mt-2">
                        <label className="text-xs font-semibold text-slate-600 mb-1">Último Control ECICEP</label>
                        <MaskedDateInput
                          value={seguimientoEcicepUltimoFechaVal || ''}
                          onChange={(val: string) => onSeguimientoEcicepUltimoFechaChange?.(val)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones ECICEP / SALA ERA */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-2">
                  <button
                    onClick={() => actionsRef?.current?.newForm()}
                    className="w-full py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-lg shadow-sm transition-all active:scale-95 text-xs cursor-pointer flex items-center justify-start px-4 gap-2 uppercase"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    LIMPIAR FORMULARIO
                  </button>
                  {isSalaMode && (
                    <button
                      onClick={() => actionsRef?.current?.remClick?.()}
                      className="w-full py-2.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-bold rounded-lg shadow-sm flex items-center justify-start px-4 gap-2 transition-all active:scale-95 text-xs cursor-pointer uppercase"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      REM EN HOJA DIARIA
                    </button>
                  )}
                  {(isSalaMode || isSmMode) && (
                    <button
                      onClick={() => actionsRef?.current?.exportPdf?.()}
                      className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-lg shadow-sm flex items-center justify-start px-4 gap-2 transition-all active:scale-95 text-xs cursor-pointer uppercase"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      EXPORTAR A PDF
                    </button>
                  )}
                  {(isIngresoMode || isControlEcicepMode || isSeguimientoEcicepMode) && (
                    <>
                      <button
                        onClick={() => actionsRef?.current?.imprimirResumen?.()}
                        className="w-full py-2.5 bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 font-bold rounded-lg shadow-sm flex items-center justify-start px-4 gap-2 transition-all active:scale-95 text-xs cursor-pointer uppercase"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        IMPRIMIR RESUMEN
                      </button>
                      <button
                        onClick={() => actionsRef?.current?.editarDrive?.()}
                        className="w-full py-2.5 bg-white border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 font-bold rounded-lg shadow-sm flex items-center justify-start px-4 gap-2 transition-all active:scale-95 text-xs cursor-pointer uppercase"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12,3 2,21 22,21" />
                        </svg>
                        EDITAR DRIVE ECICEP
                      </button>
                    </>
                  )}
                </div>
              </>
            );
          })()
        )}

        {showFeedAndLinks && (
          <>
            {/* Tablero de Novedades (Twitter style) */}
        <div 
          style={{ height: linksHeight ? `${linksHeight}px` : '470px' }} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col w-full transition-all duration-300 ease-in-out"
        >
          <div className="border-b border-slate-150 pb-2 mb-3 shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tablero de Novedades</h3>
            <span className="text-sky-500 font-semibold text-xs flex items-center gap-1 font-sans">
              Feed
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            {mergedFeed.map(item => {
              const isStatic = item.isStatic;
              const authorName = isStatic ? 'PORTAL MÉDICO' : item.authorName;
              const authorUsername = isStatic ? 'portalmedico' : item.authorUsername;
              const authorProfession = isStatic ? '' : item.authorProfession;
              const professionPrefix = authorProfession ? getProfessionPrefix(authorProfession) : '';
              const dateStr = formatFeedDate(item.timestamp);

              // Avatar rendering
              let avatarNode;
              if (isStatic) {
                avatarNode = (
                  <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="30" y="10" width="40" height="80" rx="5" />
                      <rect x="10" y="30" width="80" height="40" rx="5" />
                    </svg>
                  </div>
                );
              } else {
                avatarNode = item.authorAvatar ? (
                  <img
                    src={item.authorAvatar}
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm border border-slate-200"
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full shadow-sm overflow-hidden shrink-0 border border-slate-200 bg-white">
                    <LinkedInDefaultAvatar />
                  </div>
                );
              }

              return (
                <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  {/* Avatar */}
                  {avatarNode}
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header info */}
                    <div className="flex items-center text-xs flex-wrap">
                      <span className="font-bold text-slate-800 hover:underline cursor-pointer truncate">
                        {professionPrefix ? `${professionPrefix} ` : ''}{authorName}
                      </span>
                      <span className="text-slate-500 ml-1 truncate">@{authorUsername}</span>
                      <span className="text-slate-400 mx-1.5">·</span>
                      <span className="text-slate-500 whitespace-nowrap">{dateStr}</span>
                    </div>
                    {/* Text */}
                    <p className="text-xs text-slate-700 mt-1 leading-normal whitespace-pre-wrap">
                      {item.text}
                    </p>
                    {/* Attached image if present */}
                    {!isStatic && item.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-150 max-h-60 bg-slate-50 flex items-center justify-center">
                        <img src={item.imageUrl} alt="Contenido de la publicación" className="max-w-full max-h-60 object-contain" />
                      </div>
                    )}
                    {/* Twitter Action Icons */}
                    <div className="flex items-center justify-between text-slate-400 max-w-[200px] mt-2.5">
                      {/* Reply */}
                      <button className="hover:text-sky-500 transition-colors p-1 -m-1 rounded-full hover:bg-sky-50 cursor-pointer" title="Responder">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.093.58-.415 1.284-.617 1.955-.617Z" />
                        </svg>
                      </button>
                      {/* Retweet */}
                      <button className="hover:text-green-500 transition-colors p-1 -m-1 rounded-full hover:bg-green-50 cursor-pointer" title="Retweetear">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.092-1.209.138-2.43.138-3.662ZM19.5 12l3-3m-3 3-3-3M4.5 12l-3 3m3-3 3 3" />
                        </svg>
                      </button>
                      {/* Like */}
                      <button className="hover:text-pink-500 transition-colors p-1 -m-1 rounded-full hover:bg-pink-50 cursor-pointer" title="Me gusta">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      </button>
                      {/* Share */}
                      <button className="hover:text-sky-500 transition-colors p-1 -m-1 rounded-full hover:bg-sky-50 cursor-pointer" title="Compartir">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186.002-.003.001-.002a2.25 2.25 0 0 1 3.869-2.01l3.5 2.02a2.25 2.25 0 1 1-.41 3.593l-3.5-2.02a2.25 2.25 0 0 1-3.869-2.01l-.002-.003Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enlaces Externos */}
        <div ref={linksRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col w-full relative overflow-hidden">
          <div className="border-b border-slate-150 pb-2 mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ENLACES EXTERNOS</h3>
          </div>
          <div className="flex flex-col gap-3">
            
            {/* LABORATORIO CYB */}
            <div className="w-full flex flex-col">
              <button
                onClick={() => toggleExternalLink('cyb')}
                className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 flex flex-col items-center justify-center text-center border border-sky-600/50 cursor-pointer"
                aria-expanded={!!openExternalLinks['cyb']}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">LABORATORIO CYB</span>
                  <span className="text-sm font-light">{openExternalLinks['cyb'] ? '−' : '+'}</span>
                </div>
                <span className="block text-[10px] font-normal text-sky-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Exámenes desde mayo de 2025 en adelante.</span>
              </button>
              {openExternalLinks['cyb'] && (
                <div className="mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Usuario: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">csanjuan</code></span>
                    <button onClick={() => handleCopyToClipboard('csanjuan', 'Usuario')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Usuario">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Contraseña: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">csanjuan</code></span>
                    <button onClick={() => handleCopyToClipboard('csanjuan', 'Contraseña')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Contraseña">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <a href="http://mvlabcyb.sistemadecontrol.cl:8080/LoginConveniosX.aspx" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-center rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs">
                      <span>Abrir Enlace</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <button onClick={() => handleCopyToClipboard('http://mvlabcyb.sistemadecontrol.cl:8080/LoginConveniosX.aspx', 'Enlace')} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center" title="Copiar Enlace">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* IMAGENSALUD */}
            <div className="w-full flex flex-col">
              <button
                onClick={() => toggleExternalLink('imagensalud')}
                className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 flex flex-col items-center justify-center text-center border border-teal-600/50 cursor-pointer"
                aria-expanded={!!openExternalLinks['imagensalud']}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">IMAGENSALUD</span>
                  <span className="text-sm font-light">{openExternalLinks['imagensalud'] ? '−' : '+'}</span>
                </div>
                <span className="block text-[10px] font-normal text-teal-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Exámenes desde mayo 2025 hacia atrás.</span>
              </button>
              {openExternalLinks['imagensalud'] && (
                <div className="mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Usuario: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">CMC SAN JUAN</code></span>
                    <button onClick={() => handleCopyToClipboard('CMC SAN JUAN', 'Usuario')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Usuario">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Contraseña: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">JUAN2023</code></span>
                    <button onClick={() => handleCopyToClipboard('JUAN2023', 'Contraseña')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Contraseña">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://resultados.laboratorioimagensalud.cl/Convenios.aspx" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-center rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs">
                      <span>Abrir Enlace</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <button onClick={() => handleCopyToClipboard('https://resultados.laboratorioimagensalud.cl/Convenios.aspx', 'Enlace')} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center" title="Copiar Enlace">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* IMÁGENES HSP COQUIMBO */}
            <div className="w-full flex flex-col">
              <button
                onClick={() => toggleExternalLink('hcoquimbo')}
                className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 flex flex-col items-center justify-center text-center border border-purple-600/50 cursor-pointer"
                aria-expanded={!!openExternalLinks['hcoquimbo']}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">IMÁGENES HSP COQUIMBO</span>
                  <span className="text-sm font-light">{openExternalLinks['hcoquimbo'] ? '−' : '+'}</span>
                </div>
                <span className="block text-[10px] font-normal text-purple-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Estudios por imágenes en Hospital San Pablo.</span>
              </button>
              {openExternalLinks['hcoquimbo'] && (
                <div className="mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Usuario: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">clinicoser</code></span>
                    <button onClick={() => handleCopyToClipboard('clinicoser', 'Usuario')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Usuario">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Contraseña: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">Hospital123</code></span>
                    <button onClick={() => handleCopyToClipboard('Hospital123', 'Contraseña')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Contraseña">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://sscssl.synapsetimed.cl/Synapse" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-center rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs">
                      <span>Abrir Enlace</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <button onClick={() => handleCopyToClipboard('https://sscssl.synapsetimed.cl/Synapse', 'Enlace')} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center" title="Copiar Enlace">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SAR TIERRAS BLANCAS */}
            <div className="w-full flex flex-col">
              <button
                onClick={() => toggleExternalLink('sartb')}
                className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 flex flex-col items-center justify-center text-center border border-amber-600/50 cursor-pointer"
                aria-expanded={!!openExternalLinks['sartb']}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">SAR TIERRAS BLANCAS</span>
                  <span className="text-sm font-light">{openExternalLinks['sartb'] ? '−' : '+'}</span>
                </div>
                <span className="block text-[10px] font-normal text-amber-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Radiografías tomadas en SAR.</span>
              </button>
              {openExternalLinks['sartb'] && (
                <div className="mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Usuario: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">sar.tierrasbl</code></span>
                    <button onClick={() => handleCopyToClipboard('sar.tierrasbl', 'Usuario')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Usuario">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-150">
                    <span className="text-slate-600 font-semibold">Contraseña: <code className="ml-1 text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded font-mono">Informes2!</code></span>
                    <button onClick={() => handleCopyToClipboard('Informes2!', 'Contraseña')} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Copiar Contraseña">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <a href="https://ris.chile.telemedicina.com/" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-center rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 text-xs">
                      <span>Abrir Enlace</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <button onClick={() => handleCopyToClipboard('https://ris.chile.telemedicina.com/', 'Enlace')} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center" title="Copiar Enlace">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DRIVE ECICEP */}
            <div className="w-full flex">
              <button
                onClick={() => {
                  const sector = loggedInUser?.sector || computerSector;
                  const driveUrl = DRIVE_LINKS[sector] || 'https://drive.google.com/';
                  window.open(driveUrl, '_blank');
                }}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 bg-gradient-to-r from-transparent to-black/10 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 flex flex-col items-center justify-center text-center border border-green-600/50 cursor-pointer"
              >
                <span className="block text-sm uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">DRIVE ECICEP</span>
                <span className="block text-[10px] font-normal text-green-100 mt-0.5 w-full whitespace-nowrap overflow-hidden text-ellipsis">Accede a la planilla de tu sector.</span>
              </button>
            </div>

          </div>
        </div>
          </>
        )}
      </div>
    );
  };

  const renderTableroNovedades = () => {
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col w-full h-[470px] transition-all duration-300 ease-in-out"
      >
        <div className="border-b border-slate-150 pb-2 mb-3 shrink-0 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tablero de Novedades</h3>
          <span className="text-sky-500 font-semibold text-xs flex items-center gap-1 font-sans">
            Feed
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {mergedFeed.map(item => {
            const isStatic = item.isStatic;
            const authorName = isStatic ? 'PORTAL MÉDICO' : item.authorName;
            const authorUsername = isStatic ? 'portalmedico' : item.authorUsername;
            const authorProfession = isStatic ? '' : item.authorProfession;
            const professionPrefix = authorProfession ? getProfessionPrefix(authorProfession) : '';
            const dateStr = formatFeedDate(item.timestamp);

            // Avatar rendering
            let avatarNode;
            if (isStatic) {
              avatarNode = (
                <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="30" y="10" width="40" height="80" rx="5" />
                    <rect x="10" y="30" width="80" height="40" rx="5" />
                  </svg>
                </div>
              );
            } else {
              avatarNode = item.authorAvatar ? (
                <img
                  src={item.authorAvatar}
                  className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm border border-slate-200"
                  alt="Avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-full shadow-sm overflow-hidden shrink-0 border border-slate-200 bg-white">
                  <LinkedInDefaultAvatar />
                </div>
              );
            }

            return (
              <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                {/* Avatar */}
                {avatarNode}
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header info */}
                  <div className="flex items-center text-xs flex-wrap">
                    <span className="font-bold text-slate-800 hover:underline cursor-pointer truncate">
                      {professionPrefix ? `${professionPrefix} ` : ''}{authorName}
                    </span>
                    <span className="text-slate-500 ml-1 truncate">@{authorUsername}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500 whitespace-nowrap">{dateStr}</span>
                  </div>
                  {/* Text */}
                  <p className="text-xs text-slate-700 mt-1 leading-normal whitespace-pre-wrap">
                    {item.text}
                  </p>
                  {/* Attached image if present */}
                  {!isStatic && item.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-150 max-h-60 bg-slate-50 flex items-center justify-center">
                      <img src={item.imageUrl} alt="Contenido de la publicación" className="max-w-full max-h-60 object-contain" />
                    </div>
                  )}
                  {/* Twitter Action Icons */}
                  <div className="flex items-center justify-between text-slate-400 max-w-[200px] mt-2.5">
                    {/* Reply */}
                    <button className="hover:text-sky-500 transition-colors p-1 -m-1 rounded-full hover:bg-sky-50 cursor-pointer" title="Responder">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.093.58-.415 1.284-.617 1.955-.617Z" />
                      </svg>
                    </button>
                    {/* Retweet */}
                    <button className="hover:text-green-500 transition-colors p-1 -m-1 rounded-full hover:bg-green-50 cursor-pointer" title="Retweetear">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.092-1.209.138-2.43.138-3.662ZM19.5 12l3-3m-3 3-3-3M4.5 12l-3 3m3-3 3 3" />
                      </svg>
                    </button>
                    {/* Like */}
                    <button className="hover:text-pink-500 transition-colors p-1 -m-1 rounded-full hover:bg-pink-50 cursor-pointer" title="Me gusta">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </button>
                    {/* Share */}
                    <button className="hover:text-sky-500 transition-colors p-1 -m-1 rounded-full hover:bg-sky-50 cursor-pointer" title="Compartir">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186.002-.003.001-.002a2.25 2.25 0 0 1 3.869-2.01l3.5 2.02a2.25 2.25 0 1 1-.41 3.593l-3.5-2.02a2.25 2.25 0 0 1-3.869-2.01l-.002-.003Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderView = () => {
    if (!isAuthenticated || !loggedInUser) {
      return <LoginForm onLoginSuccess={handleLoginSuccess} users={users} />;
    }

    switch (currentView) {
      case 'menu':
        return (
          <div className="flex flex-col w-full h-full overflow-y-auto">
            <MainMenuDashboard
              loggedInUser={loggedInUser}
              onSelectMenuItem={navigateTo}
              onCallScheduleData={onCallScheduleData}
              specialEventsData={specialEventsData}
              dynamicEvents={dynamicEvents}
              onOpenRem={() => setIsRemOpen(true)}
              onOpenProfileModal={() => setIsUserProfileModalOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        );

      case 'constanciaAtencion':
        return <ConstanciaAtencionForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'ordenExamenRadiologico':
        return <OrdenExamenRadiologicoForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'certificadoEscolar':
        return <CertificadoEscolarForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'derivacionesPscv':
        return <DerivacionesPscvForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'ordenLaboratorio':
        return <OrdenLaboratorioForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'recetaMedica':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
            {renderLeftColumn(false)}
            <div className="lg:col-span-9">
              <RecetaMedicaForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
            </div>
          </div>
        );
      case 'certificadoMedico':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
            {renderLeftColumn(false)}
            <div className="lg:col-span-9">
              <CertificadoMedicoForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
            </div>
          </div>
        );

      // Clinical Records
      case 'fichaControlHipotiroidismo':
        return <FichaControlHipotiroidismo onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaPreingresoEcicep':
        return (
          <div className="w-full">
            <FichaPreingresoEcicep
              onBackToMenu={() => navigateTo('menu')}
              loggedInUser={loggedInUser}
              actionsRef={preingresoActionsRef}
              fechaIngresoProp={preingresoFecha}
              onFechaIngresoChange={setPreingresoFecha}
            />
          </div>
        );
      case 'fichaIngresoEcicep':
        return (
          <div className="w-full">
            <FichaIngresoEcicep 
              onBackToMenu={() => navigateTo('menu')} 
              loggedInUser={loggedInUser} 
              actionsRef={ingresoActionsRef}
              fechaIngresoProp={ingresoFecha}
              onFechaIngresoChange={setIngresoFecha}
              patientData={activePatient}
            />
          </div>
        );
      case 'fichaControlEcicepNuevo':
        return (
          <div className="w-full">
            <FichaControlEcicepNuevo
              onBackToMenu={() => navigateTo('menu')}
              loggedInUser={loggedInUser}
              actionsRef={controlEcicepActionsRef}
              fechaControlProp={controlEcicepFecha}
              onFechaControlChange={setControlEcicepFecha}
            />
          </div>
        );
      case 'fichaSeguimientoEcicep':
        return (
          <div className="w-full">
            <FichaSeguimientoEcicep
              onBackToMenu={() => navigateTo('menu')}
              loggedInUser={loggedInUser}
              actionsRef={seguimientoEcicepActionsRef}
              fechaSeguimientoProp={seguimientoEcicepFecha}
              onFechaSeguimientoChange={setSeguimientoEcicepFecha}
              fechaUltimoControlProp={seguimientoEcicepUltimoFecha}
              onFechaUltimoControlChange={setSeguimientoEcicepUltimoFecha}
            />
          </div>
        );
      case 'fichaControlSalaEra':
        return (
          <div className="w-full">
            <FichaControlSalaEra onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} actionsRef={salaEraActionsRef} />
          </div>
        );
      case 'fichaControlSalaIra':
        return (
          <div className="w-full">
            <FichaControlSalaIra onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );
      case 'fichaControlNinoSano':
        return <FichaControlNinoSano onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlCardiovascular':
        return <FichaControlCardiovascular onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlAdultoMayor':
        return <FichaControlAdultoMayor onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlNinoSano1Mes':
        return (
          <div className="w-full h-auto lg:h-full flex flex-col lg:min-h-0 lg:overflow-hidden">
            <FichaControlNinoSano1Mes onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );
      case 'fichaControlNinoSano3Mes':
        return (
          <div className="w-full h-auto lg:h-full flex flex-col lg:min-h-0 lg:overflow-hidden">
            <FichaControlNinoSano3Mes onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );
      case 'fichaControlNinoSano6Anos':
        return (
          <div className="w-full h-auto lg:h-full flex flex-col lg:min-h-0 lg:overflow-hidden">
            <FichaControlNinoSano6Anos onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );
      case 'fichaMorbilidad':
        return <FichaMorbilidad onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlPscv':
        return (
          <div className="w-full">
            <FichaControlPscv
              onBackToMenu={() => navigateTo('menu')}
              loggedInUser={loggedInUser}
              tipoControl={pscvTipo}
              fechaControl={pscvFecha}
              onTipoControlChange={setPscvTipo}
              onFechaControlChange={setPscvFecha}
              actionsRef={pscvActionsRef}
            />
          </div>
        );
      case 'fichaIngresoSm':
        return (
          <div className="w-full">
            <FichaIngresoSm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );
      case 'fichaControlSm':
        return (
          <div className="w-full">
            <FichaControlSm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} actionsRef={controlSmActionsRef} />
          </div>
        );
      case 'fichaConsultaPasmi':
        return (
          <div className="w-full">
            <FichaConsultaPasmi 
              onBackToMenu={() => navigateTo('menu')} 
              loggedInUser={loggedInUser} 
              actionsRef={pasmiActionsRef}
            />
          </div>
        );
      case 'fichaConsultoria':
        return <FichaConsultoria onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlEpilepsia':
        return <FichaControlEpilepsia onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlArtrosis':
        return <FichaControlArtrosis onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaFondoOjo':
        return <FichaFondoOjo onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaGrupalDiabetes':
        return <FichaGrupalDiabetes onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'ingresoDemencias':
        return <IngresoDemenciasForm onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaControlDemencias':
        return <FichaControlDemencias onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaVisitaDomiciliaria':
        return (
          <div className="w-full h-auto lg:h-full flex flex-col lg:min-h-0 lg:overflow-hidden">
            <FichaVisitaDomiciliaria onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />
          </div>
        );

      // Main Menu Sections
      case 'grupalDiabetesManager':
        return <GrupalDiabetesManager onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'fichaFirmarGes':
        return (
          <div className="w-full">
            <FichaFirmarGes loggedInUser={loggedInUser} onClose={() => navigateTo('menu')} />
          </div>
        );
      case 'arsenalFarmacologico':
        return <ArsenalFarmacologicoScreen onBackToMenu={() => navigateTo('menu')} />;
      case 'buscadorExamenesLab':
        return <BuscadorExamenesLab onBackToMenu={() => navigateTo('menu')} />;
      case 'bitacora':
        return <Bitacora onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;
      case 'misPacientes':
        return <MisPacientes onSelectMenuItem={(view, patientData) => navigateTo(view, patientData)} loggedInUser={loggedInUser} />;
      case 'sapu':
        return <SapuMenu onBackToMenu={() => navigateTo('menu')} loggedInUser={loggedInUser} />;

      // Calculators
      case 'calculoLeches':
        return <CalculoLechesForm onBackToMenu={() => navigateTo('menu')} />;
      case 'curvasCrecimiento':
        return <CurvasCrecimiento onBackToMenu={() => navigateTo('menu')} />;
      case 'dosisPediatria':
        return <DosisPediatria onBackToMenu={() => navigateTo('menu')} />;
      case 'tablaComposicionAlimentos':
        return <TablaComposicionAlimentos onBackToMenu={() => navigateTo('menu')} />;
      case 'hojaDiariaRem':
        return <UnderConstruction certificateType="hojaDiariaRem" onBackToMenu={() => navigateTo('menu')} />;
      default:
        return <UnderConstruction certificateType={currentView} onBackToMenu={() => navigateTo('menu')} />;
    }
  };

  let globalAnimationClass = '';
  if (animationState === 'fading-out') {
    globalAnimationClass = 'fade-out-active';
  } else if (animationState === 'fading-in') {
    globalAnimationClass = 'fade-in-active';
  } else if (animationState === 'invisible') {
    globalAnimationClass = 'opacity-0';
  }

  const renderMainContent = () => {
    const isLockedView = currentView === 'menu' || currentView.startsWith('ficha') || currentView === 'sapu';
    return (
      <main 
        key={currentView}
        className={isLockedView 
          ? `container mx-auto p-3 sm:p-4 flex-grow flex flex-col h-auto lg:h-[calc(100vh-48px)] overflow-y-auto lg:overflow-hidden ${globalAnimationClass}` 
          : `container mx-auto p-2 sm:p-3 md:p-4 flex-grow ${globalAnimationClass}`}
      >
        <ErrorBoundary fallbackTitle="Error al cargar la vista actual">
          {renderView()}
        </ErrorBoundary>
      </main>
    );
  };

  return (
    <ErrorBoundary fallbackTitle="Se produjo un error en la aplicación">
      <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 shadow-md text-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-12 flex justify-between items-center gap-x-4">
          <div className="flex items-center flex-shrink-0">
            <svg className="w-6 h-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
              <rect x="30" y="10" width="40" height="80" rx="5" />
              <rect x="10" y="30" width="80" height="40" rx="5" />
            </svg>
            <h1 className={`text-base font-bold tracking-tight ${globalAnimationClass}`}>
              {currentView === 'fichaIngresoEcicep'
                ? 'PORTAL MÉDICO: FICHA INGRESO ECICEP'
                : currentView === 'fichaIngresoSm'
                  ? 'PORTAL MÉDICO: INGRESO SALUD MENTAL'
                  : currentView === 'fichaConsultaPasmi'
                    ? 'PORTAL MÉDICO: FICHA CONSULTA PASMI'
                    : currentView === 'fichaPreingresoEcicep'
                    ? 'PORTAL MÉDICO: FICHA PREINGRESO ECICEP'
                    : currentView === 'fichaSeguimientoEcicep'
                      ? 'PORTAL MÉDICO: FICHA SEGUIMIENTO ECICEP'
                      : currentView === 'fichaControlEcicepNuevo'
                        ? 'PORTAL MÉDICO: CONTROL ECICEP'
                        : currentView === 'fichaControlPscv'
                          ? 'PORTAL MÉDICO: FICHA CONTROL CRÓNICO'
                          : currentView === 'fichaControlSm'
                            ? 'PORTAL MÉDICO: CONTROL DE SALUD MENTAL'
                            : currentView === 'fichaVisitaDomiciliaria'
                              ? 'PORTAL MÉDICO: VISITA DOMICILIARIA'
                            : currentView === 'fichaControlSalaIra' || currentView === 'fichaControlSalaEra'
                              ? 'PORTAL MÉDICO: CONTROL SALA IRA/ERA'
                              : currentView === 'fichaControlNinoSano1Mes'
                                ? 'PORTAL MÉDICO: CONTROL NIÑO SANO 1° MES'
                                : currentView === 'fichaControlNinoSano3Mes'
                                  ? 'PORTAL MÉDICO: CONTROL NIÑO SANO 3° MES'
                                  : currentView === 'arsenalFarmacologico'
                                    ? 'PORTAL MÉDICO: ARSENAL FARMACOLÓGICO APS'
                                    : currentView === 'ordenLaboratorio'
                                      ? 'PORTAL MÉDICO: SOLICITUD DE EXÁMENES'
                                      : currentView === 'certificadoMedico'
                                        ? 'PORTAL MÉDICO: GENERAR CERTIFICADO MÉDICO'
                                        : currentView === 'recetaMedica'
                                          ? 'PORTAL MÉDICO: GENERAR RECETA MÉDICA'
                                          : currentView === 'fichaFirmarGes'
                                            ? 'PORTAL MÉDICO: FIRMAR GES'
                                            : currentView === 'sapu'
                                              ? 'PORTAL MÉDICO: PORTAL CLÍNICO SAPU'
                                              : 'PORTAL MÉDICO'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Controles de Zoom */}
            <div className="flex items-center bg-sky-900/40 hover:bg-sky-900/60 border border-sky-400/30 rounded-lg p-0.5 shadow-inner transition-colors mr-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 10, 70))}
                disabled={zoomLevel <= 70}
                title="Alejar (Disminuir Zoom)"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13 10H7" />
                </svg>
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                title="Restablecer Zoom (100%)"
                className="px-1.5 h-7 flex items-center justify-center rounded-md hover:bg-white/20 text-xs font-mono font-bold tracking-tighter transition-all cursor-pointer text-sky-100 hover:text-white"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
                disabled={zoomLevel >= 150}
                title="Acercar (Aumentar Zoom)"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10 7v6m3-3H7" />
                </svg>
              </button>
            </div>

            {isAuthenticated && loggedInUser && (
              <>
              {/* Drive ECICEP */}
              <button
                onClick={() => toggleWindow('drive')}
                title="Drive ECICEP"
                className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 2.5L1.5 14.5H7.5L14.5 2.5H8.5Z" />
                  <path d="M14.5 2.5L7.5 14.5H22.5L15.5 2.5H14.5Z" />
                  <path d="M1.5 14.5H22.5L19 21.5H5L1.5 14.5Z" />
                </svg>
              </button>

              {/* CYB Servicios Médicos */}
              <button
                onClick={() => {
                  if ((window as any).__openCybTab) {
                    (window as any).__openCybTab('https://portal.cybserviciosmedicos.cl/PortalLoginConvenio');
                  }
                }}
                title="CYB Servicios Médicos"
                className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center shrink-0"
              >
                <span className="text-xs font-black tracking-tighter leading-none text-white">CYB</span>
              </button>

              {/* Certificado Médico */}
              <button
                onClick={() => toggleWindow('certificado')}
                title="Certificado Médico"
                className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </button>

              {/* Receta Médica */}
              <button
                onClick={() => toggleWindow('receta')}
                title="Receta Médica"
                className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2h8v3H8z" />
                  <path d="M9 5v3a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2V5" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </button>

              {/* Calculadora */}
              <button
                onClick={() => toggleWindow('calc')}
                title="Calculadora"
                className="relative w-10 h-10 rounded-full text-white hover:text-white/85 hover:bg-white/10 transition-colors duration-150 cursor-pointer flex items-center justify-center shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="7" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="3" />
                </svg>
              </button>

              <NotificationBell loggedInUser={loggedInUser} />
            </>
          )}
          </div>
        </div>
      </header>

      {/* Update Notification Toast */}
      {showUpdateNotification && (
        <div
          className="fixed top-20 right-4 z-[100] bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg animate-fadeIn"
          role="alert"
        >
          <p className="font-bold">Sitio Actualizado</p>
          <p className="text-sm">El contenido nuevo está disponible y listo para usar sin conexión.</p>
        </div>
      )}

      
      {isAuthenticated && loggedInUser ? (
        <div className="flex flex-1 min-h-0 relative">
          <Sidebar
            loggedInUser={loggedInUser}
            onSelectMenuItem={navigateTo}
            onOpenRem={loggedInUser.profession === 'medicina' || loggedInUser.profession === 'enfermeria' ? (() => setIsRemOpen(true)) : undefined}
            profilePictureUrl={profilePictureUrl}
            profileName={profileName}
            onEditProfile={() => setIsUserProfileModalOpen(true)}
            onLogout={handleLogout}
            computerSector={computerSector}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            currentView={currentView}
          />
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto lg:overflow-hidden h-[calc(100vh-48px)] flex flex-col p-3">
            {renderMainContent()}
          </div>
        </div>
      ) : (
        renderMainContent()
      )}

      {isUserProfileModalOpen && loggedInUser && (
        <UserProfileModal
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          user={loggedInUser}
          profilePictureUrl={profilePictureUrl}
          profileName={profileName}
          profileStatus={profileStatus}
          onUpdateUser={handleUpdateUser}
        />
      )}
      {isPhoneDirectoryModalOpen && (
        <PhoneDirectoryModal
          isOpen={isPhoneDirectoryModalOpen}
          onClose={() => setIsPhoneDirectoryModalOpen(false)}
        />
      )}
      {isUrgenciasModalOpen && (
        <UrgenciasModal
          isOpen={isUrgenciasModalOpen}
          onClose={() => setIsUrgenciasModalOpen(false)}
        />
      )}

      {isAuthenticated && loggedInUser && (
        <>
          <RemWindow isOpen={isRemOpen} onClose={() => setIsRemOpen(false)} />
          <DriveEcicepWindow isOpen={isDriveOpen} onMinimize={() => setIsDriveOpen(false)} sector={loggedInUser.sector || computerSector} />
          <NotesWindow isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} username={loggedInUser.username} />
          <CalculatorWindow isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
          <ChatLocal 
            loggedInUser={loggedInUser} 
            computerBox={computerBox} 
            computerSector={computerSector} 
            isLowResources={lowResources} 
            onViewSocialProfile={handleViewUserProfile}
            onOpenMyProfile={() => setIsUserProfileModalOpen(true)}
            isDriveOpen={isDriveOpen}
            setIsDriveOpen={setIsDriveOpen}
            isCalcOpen={isCalcOpen}
            setIsCalcOpen={setIsCalcOpen}
            isNotesOpen={isNotesOpen}
            setIsNotesOpen={setIsNotesOpen}
          />
        </>
      )}
      <ContextMenu />
      {/* Floating Auxiliary Windows */}
      <CertificadoMedicoWindow isOpen={isCertificadoWindowOpen} onClose={() => setIsCertificadoWindowOpen(false)} loggedInUser={loggedInUser} />
      <RecetaMedicaWindow isOpen={isRecetaWindowOpen} onClose={() => setIsRecetaWindowOpen(false)} loggedInUser={loggedInUser} />
      
      {/* MSN Login Toast */}
      {loginToastUser && (
        <LoginToast 
          userName={loginToastUser.name} 
          avatarUrl={loginToastUser.avatar} 
          onClose={() => setLoginToastUser(null)} 
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default App;
