import React, { useState } from 'react';
import { User, View } from '../types';
import { 
  StickyNote, 
  AlarmClock, 
  UserCheck, 
  Building2, 
  ArrowLeft,
  Plus, 
  X, 
  Check, 
  Bell, 
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

interface BitacoraProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
  onNavigate?: (view: View) => void;
  onOpenNotes?: () => void;
}

export const Bitacora: React.FC<BitacoraProps> = ({ 
  onBackToMenu, 
  loggedInUser,
  onNavigate,
  onOpenNotes 
}) => {
  const [activeModal, setActiveModal] = useState<'notas' | 'alarmas' | 'consultorias' | 'hospitalDigital' | null>(null);

  // Quick notes state
  const [quickNotes, setQuickNotes] = useState<string>(() => {
    return localStorage.getItem(`bitacora_notas_${loggedInUser?.username || 'user'}`) || '';
  });
  const [isSavedNote, setIsSavedNote] = useState(false);

  // Alarms state
  const [alarms, setAlarms] = useState<Array<{ id: string; time: string; text: string; active: boolean }>>(() => {
    const saved = localStorage.getItem(`bitacora_alarmas_${loggedInUser?.username || 'user'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { id: '1', time: '11:30', text: 'Revisión exámenes Laboratorio', active: true },
      { id: '2', time: '16:00', text: 'Cierre de citas y llamado de rescate', active: true }
    ];
  });
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [newAlarmText, setNewAlarmText] = useState('');

  const handleSaveNotes = () => {
    localStorage.setItem(`bitacora_notas_${loggedInUser?.username || 'user'}`, quickNotes);
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 2000);
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime || !newAlarmText.trim()) return;
    const updated = [...alarms, { id: Date.now().toString(), time: newAlarmTime, text: newAlarmText.trim(), active: true }];
    setAlarms(updated);
    localStorage.setItem(`bitacora_alarmas_${loggedInUser?.username || 'user'}`, JSON.stringify(updated));
    setNewAlarmTime('');
    setNewAlarmText('');
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAlarms(updated);
    localStorage.setItem(`bitacora_alarmas_${loggedInUser?.username || 'user'}`, JSON.stringify(updated));
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    localStorage.setItem(`bitacora_alarmas_${loggedInUser?.username || 'user'}`, JSON.stringify(updated));
  };

  return (
    <div className="w-full h-full flex flex-col flex-1 bg-[#f4f7fb] overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToMenu}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">
              Bitácora Clínica
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Gestión de actividades y utilidades de soporte</p>
          </div>
        </div>
      </div>

      {/* 4 Blocks Grid - Occupying 100% of the frame space */}
      <div className="flex-1 p-3 grid grid-cols-2 grid-rows-2 gap-3 min-h-0 overflow-hidden">
        {/* BLOQUE 1: NOTAS */}
        <div 
          onClick={() => {
            if (onOpenNotes) {
              onOpenNotes();
            } else {
              setActiveModal('notas');
            }
          }}
          className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-300/80 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-amber-200 transition-all mb-2">
              <StickyNote className="w-8 h-8 md:w-9 md:h-9 stroke-[2.2]" />
            </div>
            <h3 className="text-base md:text-lg font-black text-amber-950 tracking-tight leading-tight">
              Notas
            </h3>
            <p className="text-[10px] md:text-xs text-amber-900/70 font-medium mt-1 max-w-[140px] leading-tight">
              Apuntes rápidos y notas personales
            </p>
          </div>
          <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
            Abrir Notas
          </span>
        </div>

        {/* BLOQUE 2: ALARMAS */}
        <div 
          onClick={() => setActiveModal('alarmas')}
          className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white border-2 border-rose-300/80 hover:border-rose-400 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-rose-200 transition-all mb-2">
              <AlarmClock className="w-8 h-8 md:w-9 md:h-9 stroke-[2.2]" />
            </div>
            <h3 className="text-base md:text-lg font-black text-rose-950 tracking-tight leading-tight">
              Alarmas
            </h3>
            <p className="text-[10px] md:text-xs text-rose-900/70 font-medium mt-1 max-w-[140px] leading-tight">
              Recordatorios con aviso y alerta
            </p>
          </div>
          <span className="text-[9px] font-bold text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
            {alarms.filter(a => a.active).length} activas
          </span>
        </div>

        {/* BLOQUE 3: CONSULTORÍAS */}
        <div 
          onClick={() => {
            if (onNavigate) {
              onNavigate('fichaConsultoria');
            } else {
              setActiveModal('consultorias');
            }
          }}
          className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-white border-2 border-teal-300/80 hover:border-teal-400 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-teal-200 transition-all mb-2">
              <UserCheck className="w-8 h-8 md:w-9 md:h-9 stroke-[2.2]" />
            </div>
            <h3 className="text-base md:text-lg font-black text-teal-950 tracking-tight leading-tight">
              Consultorías
            </h3>
            <p className="text-[10px] md:text-xs text-teal-900/70 font-medium mt-1 max-w-[140px] leading-tight">
              Discusión con especialista y SM
            </p>
          </div>
          <span className="text-[9px] font-bold text-teal-700 bg-teal-100/90 border border-teal-200 px-2 py-0.5 rounded-full shrink-0">
            Ingresar
          </span>
        </div>

        {/* BLOQUE 4: HOSPITAL DIGITAL */}
        <div 
          onClick={() => setActiveModal('hospitalDigital')}
          className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-white border-2 border-sky-300/80 hover:border-sky-400 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-sky-200 transition-all mb-2">
              <Building2 className="w-8 h-8 md:w-9 md:h-9 stroke-[2.2]" />
            </div>
            <h3 className="text-base md:text-lg font-black text-sky-950 tracking-tight leading-tight">
              Hospital digital
            </h3>
            <p className="text-[10px] md:text-xs text-sky-900/70 font-medium mt-1 max-w-[140px] leading-tight">
              Telemedicina Dermatología, DM y más
            </p>
          </div>
          <span className="text-[9px] font-bold text-sky-700 bg-sky-100/90 border border-sky-200 px-2 py-0.5 rounded-full shrink-0">
            Ver Células
          </span>
        </div>
      </div>

      {/* MODAL: NOTAS */}
      {activeModal === 'notas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800">Notas Rápidas</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Escriba aquí sus apuntes clínicos o pendientes..."
              rows={8}
              className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-400 transition-all font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isSavedNote ? <Check className="w-4 h-4" /> : null}
                <span>{isSavedNote ? 'Guardado' : 'Guardar Nota'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALARMAS */}
      {activeModal === 'alarmas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <AlarmClock className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-800">Alarmas y Recordatorios</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAlarm} className="flex gap-2 shrink-0">
              <input
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                required
              />
              <input
                type="text"
                value={newAlarmText}
                onChange={(e) => setNewAlarmText(e.target.value)}
                placeholder="Descripción del recordatorio..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                required
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 cursor-pointer shadow-xs shrink-0"
                title="Agregar alarma"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {alarms.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6 font-medium">No hay alarmas configuradas</p>
              ) : (
                alarms.map(alarm => (
                  <div key={alarm.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${alarm.active ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold ${alarm.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                          {alarm.time}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate">{alarm.text}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HOSPITAL DIGITAL */}
      {activeModal === 'hospitalDigital' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-800">Células Hospital Digital</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Acceso a interconsultas sincrónicas y asincrónicas de Hospital Digital Minsal:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { title: 'Teledermatología', desc: 'Evaluación y derivación con imágenes diagnósticas' },
                { title: 'Teleoftalmología (Diabetes)', desc: 'Lectura de fondo de ojo con cámara no midriática' },
                { title: 'Telegeriatría y Demencias', desc: 'Apoyo diagnóstico en pacientes mayores' },
                { title: 'Teleendocrinología', desc: 'Casos complejos de diabetes descompensada' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-sky-50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bitacora;
