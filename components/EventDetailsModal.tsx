import React from 'react';
import { SpecialEvent, User } from '../types';
import { users as allUsersData } from '../data/userData';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SpecialEvent;
  loggedInUser: User;
  onEdit: (event: SpecialEvent) => void;
  onDelete: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event, loggedInUser, onEdit, onDelete }) => {
  if (!isOpen) return null;

  const canEditOrDelete = loggedInUser.username === event.creator;

  const getInviteeLabel = (inv: string) => {
    if (inv === 'all') return 'Todos';
    if (inv.startsWith('profession:')) return `Estamento: ${inv.split(':')[1].toUpperCase()}`;
    if (inv.startsWith('cesfam:')) return `CESFAM: ${inv.split(':')[1]}`;
    const user = allUsersData.find(u => u.username === inv);
    if (user) return user.fullName.split(' ')[0] + ' ' + (user.fullName.split(' ')[1] || '');
    return inv;
  };

  const handleDelete = () => {
    if (window.confirm("¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.")) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 animate-fadeIn overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header con el color del evento */}
        <div className="h-4 w-full" style={{ backgroundColor: event.color }}></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800" style={{ color: event.color }}>{event.title}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {event.day}/{event.month + 1}/{event.year} a las {event.startTime}
              </p>
            </div>
            {event.isPrivate && (
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full border border-slate-200 font-semibold uppercase">Privado</span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase">Ubicación</p>
                <p className="text-sm text-slate-700">{event.location || 'No especificada'}</p>
              </div>
            </div>

            {!event.isPrivate && (
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Invitados</p>
                  <div className="flex flex-wrap gap-1">
                    {event.invitees.length > 0 ? event.invitees.map((inv, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                        {getInviteeLabel(inv)}
                      </span>
                    )) : <span className="text-sm text-slate-500 italic">Ninguno</span>}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase">Creado por</p>
                <p className="text-sm text-slate-700">{event.creator === 'system' ? 'Sistema' : event.creator}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            {canEditOrDelete && event.creator !== 'system' ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => { onClose(); onEdit(event); }} 
                  className="px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={handleDelete} 
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ) : (
                <div></div> // Placeholder para mantener justify-between
            )}
            <button 
              onClick={onClose} 
              className="px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
