import React, { useState, useMemo, useEffect } from 'react';
import { User, OnCallSchedule, SpecialEvent, View } from '../types';
import OnCallCalendar from './OnCallCalendar';
import AutomaticTranscriber from './AutomaticTranscriber';
import { 
  CheckSquare, 
  Plus, 
  CheckCircle2, 
  Circle, 
  UserCheck, 
  Sparkles,
  X,
  Trash2,
  LogOut,
  User as UserIcon,
  Check,
  Clock,
  Megaphone,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface Aviso {
  id: string;
  username?: string;
  userFullName: string;
  userProfession: string;
  profilePictureUrl?: string;
  content: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate: string;
  completed: boolean;
}

interface MainMenuDashboardProps {
  loggedInUser: User;
  onSelectMenuItem: (view: View) => void;
  onCallScheduleData: OnCallSchedule;
  specialEventsData: Record<number, Record<number, Record<number, SpecialEvent[]>>>;
  dynamicEvents: SpecialEvent[];
  onOpenRem?: () => void;
  onOpenProfileModal?: () => void;
  onLogout?: () => void;
}

const MainMenuDashboard: React.FC<MainMenuDashboardProps> = ({
  loggedInUser,
  onSelectMenuItem,
  onCallScheduleData,
  specialEventsData,
  dynamicEvents,
  onOpenRem,
  onOpenProfileModal,
  onLogout,
}) => {
  const today = useMemo(() => new Date(), []);
  const isFriday = useMemo(() => today.getDay() === 5, [today]);

  // Real-time synchronization of Avisos from Firebase
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'dashboard_avisos'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Aviso[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          username: data.username,
          userFullName: data.userFullName,
          userProfession: data.userProfession,
          profilePictureUrl: data.profilePictureUrl,
          content: data.content,
          createdAt: data.createdAt || ''
        });
      });
      setAvisos(list);
    }, (error) => {
      console.error("Error fetching dashboard_avisos from Firestore:", error);
    });
    return () => unsub();
  }, []);

  const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);
  const [isAddAvisoOpen, setIsAddAvisoOpen] = useState(false);
  const [newAvisoContent, setNewAvisoContent] = useState('');
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);

  const handleEditActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (currentAviso) {
      const isOwner = currentAviso.username 
        ? currentAviso.username === loggedInUser.username 
        : currentAviso.userFullName === loggedInUser.fullName;
      if (!isOwner) {
        alert("Solo puedes editar tus propios avisos.");
        return;
      }
      setEditingAviso(currentAviso);
      setNewAvisoContent(currentAviso.content);
      setIsAddAvisoOpen(true);
    }
  };

  const handleDeleteActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (!currentAviso) return;
    const isOwner = currentAviso.username 
      ? currentAviso.username === loggedInUser.username 
      : currentAviso.userFullName === loggedInUser.fullName;
    if (!isOwner) {
      alert("Solo puedes borrar tus propios avisos.");
      return;
    }
    if (window.confirm("¿Seguro que desea eliminar este aviso?")) {
      deleteDoc(doc(db, 'dashboard_avisos', currentAviso.id))
        .then(() => {
          setActiveAvisoIndex(0);
        })
        .catch(err => {
          console.error("Error deleting aviso:", err);
        });
    }
  };

  useEffect(() => {
    if (avisos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAvisoIndex(prev => (prev + 1) % avisos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [avisos.length]);

  const handleCreateAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvisoContent.trim()) return;
    
    if (editingAviso) {
      updateDoc(doc(db, 'dashboard_avisos', editingAviso.id), {
        content: newAvisoContent.trim()
      })
      .then(() => {
        setEditingAviso(null);
      })
      .catch(err => {
        console.error("Error updating aviso:", err);
      });
    } else {
      const d = new Date();
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      
      addDoc(collection(db, 'dashboard_avisos'), {
        username: loggedInUser.username,
        userFullName: loggedInUser.fullName,
        userProfession: loggedInUser.profession,
        profilePictureUrl: loggedInUser.profilePictureUrl || '',
        content: newAvisoContent.trim(),
        createdAt: formattedDate,
        timestamp: serverTimestamp()
      })
      .then(() => {
        setActiveAvisoIndex(0);
      })
      .catch(err => {
        console.error("Error creating aviso:", err);
      });
    }
    
    setNewAvisoContent('');
    setIsAddAvisoOpen(false);
  };

  // Clock live timer
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeekString = useMemo(() => {
    return now.toLocaleDateString('es-CL', { weekday: 'long' }).toUpperCase();
  }, [now]);

  const dateFormattedString = useMemo(() => {
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }, [now]);

  const timeFormattedString = useMemo(() => {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [now]);

  // Tasks state - BLANK by default as requested
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`portal_tasks_${loggedInUser.username}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`portal_tasks_${loggedInUser.username}`, JSON.stringify(tasks));
  }, [tasks, loggedInUser.username]);

  // Task modal state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Hoy');

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsAddTaskOpen(false);
  };

  // Today's turnos computation for Resumen del Día
  const todayTurnos = useMemo(() => {
    const yr = today.getFullYear();
    const mo = today.getMonth();
    const dy = today.getDate();
    const currentYearData = onCallScheduleData[yr] || {};
    const currentMonthData = currentYearData[mo] || {};
    return currentMonthData[dy] || [];
  }, [today, onCallScheduleData]);

  const todayEvents = useMemo(() => {
    const yr = today.getFullYear();
    const mo = today.getMonth();
    const dy = today.getDate();
    const legacyEventsMap = (specialEventsData[yr] && specialEventsData[yr][mo]) || {};
    const legacyEvents = legacyEventsMap[dy] || [];
    const dynamicDayEvents = dynamicEvents.filter(e => e.year === yr && e.month === mo && e.day === dy);
    return [...legacyEvents, ...dynamicDayEvents];
  }, [today, specialEventsData, dynamicEvents]);

  // Tasks grouped into EN CURSO and COMPLETADAS
  const inProgressTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  return (
    <div className="w-full h-full flex flex-col gap-5 font-sans overflow-y-auto pr-1 pb-6 custom-scrollbar text-slate-800">
      
      {/* Main Grid Layout: Balanced 50/50 columns (lg:grid-cols-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full items-start">
        
        {/* COLUMN 1 (50% width): Calendario de Urgencia */}
        <div className="flex flex-col gap-5 w-full">
          <OnCallCalendar
            onCallData={onCallScheduleData}
            specialEventsData={specialEventsData}
            dynamicEvents={dynamicEvents}
            loggedInUser={loggedInUser}
            compact={true}
          />
        </div>

        {/* COLUMN 2 (50% width): Resumen del Día + Perfil en la parte superior (50/50), Mis Tareas debajo */}
        <div className="flex flex-col gap-5 w-full">
          
          {/* Top Row: RESUMEN DEL DÍA (50%) + PERFIL DE USUARIO Card (50%) matching attached photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full items-stretch">
            
            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-3 flex flex-col justify-between gap-1.5 h-[160px] max-h-[160px] min-h-[160px] overflow-hidden">
              <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAviso(null);
                        setNewAvisoContent('');
                        setIsAddAvisoOpen(true);
                      }}
                      className="w-5.5 h-5.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Crear aviso"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    {avisos.length > 0 && (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      const isOwner = currentAviso && (currentAviso.username 
                        ? currentAviso.username === loggedInUser.username 
                        : currentAviso.userFullName === loggedInUser.fullName);
                      return isOwner ? (
                        <>
                          <button 
                            onClick={handleEditActiveAviso}
                            className="w-5.5 h-5.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                            title="Editar aviso actual"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={handleDeleteActiveAviso}
                            className="w-5.5 h-5.5 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                            title="Borrar aviso actual"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Avisos Carousel */}
                <div className="flex-grow flex flex-col justify-center min-h-0 overflow-hidden">
                  {avisos.length > 0 ? (
                    (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      if (!currentAviso) return null;
                      const authorName = currentAviso.userFullName || 'Usuario';
                      const authorAvatar = currentAviso.profilePictureUrl 
                        || (currentAviso.username && localStorage.getItem(`profile_picture_${currentAviso.username}`))
                        || (currentAviso.username && localStorage.getItem(`user_avatar_${currentAviso.username}`))
                        || (currentAviso.username === loggedInUser.username ? loggedInUser.profilePictureUrl : undefined);

                      return (
                        <div key={currentAviso.id} className="flex flex-col gap-1 animate-fadeIn w-full flex-1 min-h-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 w-full shrink-0">
                            <div className="p-[1.5px] rounded-full animate-color-fluctuate shrink-0 shadow-sm">
                              <div className="p-[1px] rounded-full bg-white">
                                {authorAvatar ? (
                                  <img 
                                    src={authorAvatar} 
                                    alt={authorName} 
                                    className="w-6.5 h-6.5 rounded-full object-cover block shrink-0" 
                                    onError={(e) => {
                                      // Fallback on error
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-6.5 h-6.5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] border border-sky-200 shrink-0 font-sans">
                                    {authorName.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center leading-none">
                              <span className="text-[12.5px] font-bold text-slate-900 block truncate font-sans">
                                {authorName}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 font-sans">
                                {currentAviso.createdAt || ''}
                              </span>
                            </div>
                          </div>
                          {/* Yellow Content Box with Hover-Activated Overlay Arrows */}
                          <div className="relative group w-full flex-1 min-h-0">
                            {/* Previous Button (Left) */}
                            {avisos.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAvisoIndex(prev => (prev - 1 + avisos.length) % avisos.length);
                                }}
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-amber-200/90 hover:bg-amber-300 text-amber-950 border border-amber-300/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90"
                                title="Aviso anterior"
                              >
                                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}

                            {/* Next Button (Right) */}
                            {avisos.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAvisoIndex(prev => (prev + 1) % avisos.length);
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-amber-200/90 hover:bg-amber-300 text-amber-950 border border-amber-300/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-90"
                                title="Siguiente aviso"
                              >
                                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                              </button>
                            )}

                            <div className="text-xs font-sans leading-snug text-amber-950 w-full h-full break-words bg-yellow-50 py-1.5 px-2 rounded-lg border border-yellow-200/80 overflow-y-auto custom-scrollbar flex items-center">
                              <span className="w-full">{currentAviso.content}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4 shrink-0 font-sans">
                      <p className="text-[10.5px] text-slate-400 font-medium italic">No hay avisos publicados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 50%: RELOJ DIGITAL ESTILO CAPTURA */}
            <div className="bg-[#182030] rounded-2xl shadow-sm border border-slate-700/60 p-4 sm:p-5 flex items-center justify-center gap-3 sm:gap-4.5 h-full min-h-[160px] max-h-[160px] select-none overflow-hidden">
              {/* Icono de Reloj Azul en Círculo Único */}
              <Clock className="w-10 h-10 sm:w-11 sm:h-11 text-[#38bdf8] shrink-0 stroke-[2.2]" />

              {/* Texto: Fecha Arriba + Hora HH:MM:SS en Azul */}
              <div className="flex flex-col min-w-0 justify-center flex-1 overflow-hidden">
                <span className="text-[11px] sm:text-xs font-bold text-[#38bdf8]/80 tracking-widest uppercase truncate max-w-full block">
                  {dayOfWeekString} {dateFormattedString}
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#38bdf8] font-mono tracking-wider leading-none whitespace-nowrap overflow-hidden block">
                  {timeFormattedString}
                </span>
              </div>
            </div>

          </div>

          {/* Transcriptor Automático de Exámenes (reemplaza Mis Tareas) */}
          <AutomaticTranscriber loggedInUser={loggedInUser} />

        </div>

      </div>

      {/* Task Creation Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fadeIn font-sans">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Crear Nueva Tarea</span>
              </div>
              <button 
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nombre de la Tarea
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Preparar informe mensual ECICEP"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Fecha Objetivo
                  </label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ej: Hoy, En 3 días"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center shadow"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Aviso Creation Modal */}
      {isAddAvisoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fadeIn font-sans">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>{editingAviso ? 'Editar Aviso' : 'Publicar Nuevo Aviso'}</span>
              </div>
              <button 
                onClick={() => setIsAddAvisoOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAviso} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Contenido del Aviso
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba el aviso que desea compartir con los demás usuarios..."
                  value={newAvisoContent}
                  onChange={e => setNewAvisoContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none text-slate-800 leading-normal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAvisoOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center shadow"
                >
                  Publicar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default MainMenuDashboard;
