import React, { useState, useEffect } from 'react';
import { SpecialEvent, User } from '../types';
import { users as allUsersData } from '../data/userData';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<SpecialEvent, 'id'>, notifyUsernames: string[]) => void;
  initialDate: { year: number; month: number; day: number };
  loggedInUser: User;
  editingEvent?: SpecialEvent;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#64748b'
];

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, initialDate, loggedInUser, editingEvent }) => {
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [color, setColor] = useState(editingEvent?.color || '#3b82f6');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '08:00');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '09:00');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [isPrivate, setIsPrivate] = useState(editingEvent?.isPrivate || false);
  const [invitees, setInvitees] = useState<string[]>(editingEvent?.invitees || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector state
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setColor(editingEvent.color);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime || '09:00');
      setLocation(editingEvent.location);
      setIsPrivate(editingEvent.isPrivate);
      setInvitees(editingEvent.invitees);
    } else {
      setTitle('');
      setColor('#3b82f6');
      setStartTime('08:00');
      setEndTime('09:00');
      setLocation('');
      setIsPrivate(false);
      setInvitees([]);
    }
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const eventPayload: Omit<SpecialEvent, 'id'> = {
      year: initialDate.year,
      month: initialDate.month,
      day: initialDate.day,
      title: title.trim(),
      color,
      startTime,
      endTime,
      location: location.trim(),
      invitees: isPrivate ? [] : invitees,
      isPrivate,
      creator: loggedInUser.username
    };

    // Calculate specific usernames to notify (skip creator and groups, only actual existing users if selected individual, 
    // or expand if group? The prompt says "Si un usuario es agregado a un evento publico será notificado".
    // We should expand groups to notify everyone.
    let notifyUsernames = new Set<string>();
    
    if (!isPrivate) {
      invitees.forEach(inv => {
        if (inv === 'all') {
          allUsersData.forEach(u => notifyUsernames.add(u.username));
        } else if (inv.startsWith('profession:')) {
          const prof = inv.split(':')[1];
          allUsersData.filter(u => u.profession === prof).forEach(u => notifyUsernames.add(u.username));
        } else if (inv.startsWith('cesfam:')) {
          const cesfam = inv.split(':')[1];
          allUsersData.filter(u => u.cesfam === cesfam).forEach(u => notifyUsernames.add(u.username));
        } else {
          notifyUsernames.add(inv);
        }
      });
    }
    
    notifyUsernames.delete(loggedInUser.username); // Don't notify creator

    onSave(eventPayload, Array.from(notifyUsernames));
    setIsSubmitting(false);
    onClose();
  };

  const addInvitee = (value: string) => {
    if (value && !invitees.includes(value)) {
      setInvitees([...invitees, value]);
    }
    setSelectedGroup('');
  };

  const removeInvitee = (value: string) => {
    setInvitees(invitees.filter(i => i !== value));
  };

  const renderInviteeTag = (inv: string) => {
    let label = inv;
    if (inv === 'all') label = 'Todos';
    else if (inv.startsWith('profession:')) label = `Estamento: ${inv.split(':')[1].toUpperCase()}`;
    else if (inv.startsWith('cesfam:')) label = `CESFAM: ${inv.split(':')[1]}`;
    else {
      const user = allUsersData.find(u => u.username === inv);
      if (user) label = user.fullName.split(' ')[0] + ' ' + (user.fullName.split(' ')[1] || '');
    }

    return (
      <span key={inv} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded border border-sky-200">
        {label}
        <button type="button" onClick={() => removeInvitee(inv)} className="text-sky-500 hover:text-sky-700 font-bold ml-1">×</button>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
          {editingEvent ? 'Editar Evento' : 'Agregar Evento'} - {initialDate.day}/{initialDate.month + 1}/{initialDate.year}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Reunión de equipo, Cumpleaños..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Hora Inicio</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => {
                  setStartTime(e.target.value);
                  // Auto-increment end time logic
                  if (e.target.value) {
                    const [h, m] = e.target.value.split(':');
                    const nextHour = (parseInt(h) + 1).toString().padStart(2, '0');
                    if (parseInt(h) < 23) {
                       setEndTime(`${nextHour}:${m}`);
                    } else {
                       setEndTime(`23:59`);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Hora Fin</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Color Destacado</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-110 shadow-sm'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ej. Box 3, Casino, Sala de reuniones"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input 
                type="checkbox" 
                checked={isPrivate} 
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500"
              />
              <span className="text-sm font-semibold text-slate-700">Evento Solo Para Mí (Privado)</span>
            </label>

            {!isPrivate && (
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Invitar Usuarios (Opcional)</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedGroup}
                    onChange={(e) => addInvitee(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Seleccionar para invitar --</option>
                    <optgroup label="Grupos Generales">
                      <option value="all">Todos en la plataforma</option>
                      <option value="cesfam:CESFAM San Juan">Todo CESFAM San Juan</option>
                    </optgroup>
                    <optgroup label="Estamentos">
                      <option value="profession:medicina">Médicos</option>
                      <option value="profession:enfermeria">Enfermería</option>
                      <option value="profession:nutricion">Nutricionistas</option>
                      <option value="profession:psicologia">Psicólogas</option>
                      <option value="profession:kinesiologo">Kinesiólogos</option>
                      <option value="profession:tens">TENS</option>
                    </optgroup>
                    <optgroup label="Usuarios Específicos">
                      {allUsersData.filter(u => u.username !== loggedInUser.username).map(u => (
                        <option key={u.username} value={u.username}>{u.fullName}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                {invitees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {invitees.map(renderInviteeTag)}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 leading-tight">
                  Se notificará a estos usuarios por messenger y verán el evento en sus calendarios semanales.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors break-words">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-sky-500 hover:bg-sky-600 rounded shadow transition-colors break-words">
              {isSubmitting ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
