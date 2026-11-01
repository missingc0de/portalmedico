import React, { useState } from 'react';
import { User, Sector, CESFAM } from '../types';
import { 
  Settings, 
  X, 
  MapPin, 
  Bell, 
  Volume2, 
  Vibrate, 
  User as UserIcon, 
  LogOut, 
  Check, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { requestNotificationPermission } from '../services/notificationService';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: User | null;
  computerBox: string;
  setComputerBox: (box: string) => void;
  computerSector: Sector;
  setComputerSector: (sector: Sector) => void;
  onOpenUserProfile: () => void;
  onLogout: () => void;
  appVersion?: string;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  loggedInUser,
  computerBox,
  setComputerBox,
  computerSector,
  setComputerSector,
  onOpenUserProfile,
  onLogout,
  appVersion = '1.4.29'
}) => {
  if (!isOpen) return null;

  const [localBox, setLocalBox] = useState(computerBox || '');
  const [localSector, setLocalSector] = useState<Sector>(computerSector || 'Verde');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    setComputerBox(localBox);
    setComputerSector(localSector);
    localStorage.setItem('portalmedico_box', localBox);
    localStorage.setItem('portalmedico_sector', localSector);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Ajustes de la Aplicación</h3>
              <p className="text-[10px] text-sky-100 font-medium">Configuración general del dispositivo y sesión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
          {/* Station / Location Settings */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Estación de Trabajo Actual</span>
            </div>

            <form onSubmit={handleSaveStation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sector Asignado
                  </label>
                  <select
                    value={localSector}
                    onChange={(e) => setLocalSector(e.target.value as Sector)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Verde">Sector Verde</option>
                    <option value="Amarillo">Sector Amarillo</option>
                    <option value="Naranjo">Sector Naranjo</option>
                    <option value="Punta Mira">Punta Mira</option>
                    <option value="No especificado">No especificado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Box de Atención
                  </label>
                  <input
                    type="text"
                    value={localBox}
                    onChange={(e) => setLocalBox(e.target.value)}
                    placeholder="Ej: Box 4"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Guardado</span>
                    </>
                  ) : (
                    <span>Guardar Estación</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Notifications & Sound settings */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Bell className="w-4 h-4 text-sky-600" />
              <span>Notificaciones y Sistema</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 text-[11px]">Vibración Nativa</p>
                    <p className="text-[10px] text-slate-500">2 pulsos en mensajes, 1s continuo en zumbidos</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Activa
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 text-[11px]">Sonido de Notificación</p>
                    <p className="text-[10px] text-slate-500">Canal nativo del sistema (inclusive bloqueado)</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  Nativo
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  requestNotificationPermission();
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([100, 80, 100]);
                  }
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Probar Notificaciones y Vibración</span>
              </button>
            </div>
          </div>

          {/* Profile & Account shortcut */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <UserIcon className="w-4 h-4 text-sky-600" />
              <span>Cuenta y Perfil de Usuario</span>
            </div>

            {loggedInUser && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-xs truncate">{loggedInUser.fullName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {loggedInUser.profession} • {loggedInUser.cesfam}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUserProfile();
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Editar</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200/60"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Footer with App Version */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex flex-col items-center justify-center text-center shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700 font-black text-xs tracking-wider">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>PORTAL MÉDICO</span>
            <span className="text-sky-600 font-bold">v{appVersion}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Compilación 29 • Sistema Clínico de Atención Primaria de Salud
          </p>
          <p className="text-[9px] text-slate-400">
            Departamento de Salud • Coquimbo
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsModal;
