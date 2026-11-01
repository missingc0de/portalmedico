import React, { useState } from 'react';
import { User, Sector } from '../types';
import { 
  Settings, 
  MapPin, 
  Bell, 
  Volume2, 
  Vibrate, 
  User as UserIcon, 
  LogOut, 
  Check, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { requestNotificationPermission } from '../services/notificationService';

interface AppSettingsViewProps {
  onBack: () => void;
  loggedInUser: User | null;
  computerBox: string;
  setComputerBox: (box: string) => void;
  computerSector: Sector;
  setComputerSector: (sector: Sector) => void;
  onOpenUserProfile: () => void;
  onLogout: () => void;
  appVersion?: string;
}

export const AppSettingsView: React.FC<AppSettingsViewProps> = ({
  onBack,
  loggedInUser,
  computerBox,
  setComputerBox,
  computerSector,
  setComputerSector,
  onOpenUserProfile,
  onLogout,
  appVersion = '1.4.29'
}) => {
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
    <div className="w-full h-full flex flex-col flex-1 bg-[#f4f7fb] overflow-hidden select-none">
      {/* Header Full-Screen */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Volver al Menú"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base tracking-wide leading-tight">Ajustes</h2>
            <p className="text-[10px] text-sky-100 font-medium">Configuración de la aplicación y estación</p>
          </div>
        </div>
      </div>

      {/* Full-Screen Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 custom-scrollbar max-w-xl mx-auto w-full">
        {/* Station / Location Settings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs pb-1 border-b border-slate-100">
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
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Guardado con éxito</span>
                  </>
                ) : (
                  <span>Guardar Estación</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications & System settings */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs pb-1 border-b border-slate-100">
            <Bell className="w-4 h-4 text-sky-600" />
            <span>Notificaciones y Sistema de Alertas</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">Vibración Nativa del Sistema</p>
                  <p className="text-[10px] text-slate-500">2 pulsos en mensajes recibidos • 1s continuo en zumbidos</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                Activa
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">Sonido de Notificación Nativo</p>
                  <p className="text-[10px] text-slate-500">Flujo de notificación de Android (inclusive con pantalla bloqueada)</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full shrink-0">
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
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Probar Notificaciones y Vibración</span>
            </button>
          </div>
        </div>

        {/* Profile & Account shortcut */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs pb-1 border-b border-slate-100">
            <UserIcon className="w-4 h-4 text-sky-600" />
            <span>Cuenta y Perfil</span>
          </div>

          {loggedInUser && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate">{loggedInUser.fullName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                  {loggedInUser.profession} • {loggedInUser.cesfam}
                </p>
              </div>
              <button
                onClick={onOpenUserProfile}
                className="px-3 py-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-white hover:bg-sky-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
              >
                <span>Editar Foto/Apodo</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-200/60"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer with App Version */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs tracking-wider">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>PORTAL MÉDICO</span>
            <span className="text-sky-600 font-bold">v{appVersion}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Compilación 29 • Sistema Clínico de Atención Primaria de Salud
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Departamento de Salud • Coquimbo
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsView;
