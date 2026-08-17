import React, { useState, useMemo, useEffect } from 'react';
import { OnCallSchedule, SpecialEvent, User } from '../types';
import { EventFormModal } from './EventFormModal';
import { EventDetailsModal } from './EventDetailsModal';
import { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, notifyUsersAboutEvent } from '../services/eventsService';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface OnCallCalendarProps {
  initialDate?: Date;
  onCallData: OnCallSchedule;
  specialEventsData: Record<number, Record<number, Record<number, SpecialEvent[]>>>;
  dynamicEvents: SpecialEvent[];
  loggedInUser: User;
  compact?: boolean;
}

const OnCallCalendar: React.FC<OnCallCalendarProps> = ({ 
  initialDate, 
  onCallData, 
  specialEventsData, 
  dynamicEvents, 
  loggedInUser,
  compact = false
}) => {
  // Always default to August 2026 as requested
  const august2026Default = useMemo(() => new Date(2026, 7, 1), []);
  const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(initialDate || august2026Default);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  const today = useMemo(() => new Date(), []);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SpecialEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<SpecialEvent | undefined>(undefined);

  const monthName = useMemo(() => {
    return currentDisplayDate.toLocaleDateString('es-ES', { month: 'long' });
  }, [currentDisplayDate]);

  const year = useMemo(() => {
    return currentDisplayDate.getFullYear();
  }, [currentDisplayDate]);

  const daysInMonth = useMemo(() => {
    return new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() + 1, 0).getDate();
  }, [currentDisplayDate]);

  const firstDayOfMonth = useMemo(() => {
    const day = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentDisplayDate]);

  // ALL UPPERCASE last name formatter (e.g. "ROJAS", "VEGA", "CUELLO")
  const getLastNameUpper = (fullName: string): string => {
    if (!fullName) return "";
    const nameWithoutAnnotation = fullName.split('[')[0].trim();
    const parts = nameWithoutAnnotation.split(' ');
    const lastName = parts[parts.length - 1];
    if (!lastName) return "";
    return lastName.toUpperCase();
  };

  const handleOpenForm = (day: number, month?: number, yr?: number) => {
    setSelectedDateForEvent({ 
      year: yr ?? year, 
      month: month ?? currentDisplayDate.getMonth(), 
      day 
    });
    setEditingEvent(undefined);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (event: SpecialEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleEditEvent = (event: SpecialEvent) => {
    setSelectedDateForEvent({ year: event.year, month: event.month, day: event.day });
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<SpecialEvent, 'id'>, notifyUsernames: string[]) => {
    if (editingEvent) {
      await updateCalendarEvent(editingEvent.id, eventData);
    } else {
      await addCalendarEvent(eventData);
    }
    
    if (notifyUsernames.length > 0) {
      notifyUsersAboutEvent(notifyUsernames, eventData.title);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteCalendarEvent(eventId);
  };

  const canSeeEvent = (event: SpecialEvent) => {
    if (!event) return false;
    if (event.creator === 'system') return true; 
    if (loggedInUser && event.creator === loggedInUser.username) return true;
    if (event.isPrivate) return false;
    const invitees = Array.isArray(event.invitees) ? event.invitees : [];
    if (invitees.includes('all')) return true;
    if (loggedInUser && invitees.includes(loggedInUser.username)) return true;
    if (loggedInUser && invitees.includes(`profession:${loggedInUser.profession}`)) return true;
    if (loggedInUser && invitees.includes(`cesfam:${loggedInUser.cesfam}`)) return true;
    
    return false;
  };

  const getDayEvents = (targetDate: Date) => {
      const tgtYear = targetDate.getFullYear();
      const tgtMonth = targetDate.getMonth();
      const tgtDay = targetDate.getDate();

      const legacyEventsMap = (specialEventsData[tgtYear] && specialEventsData[tgtYear][tgtMonth]) || {};
      const currentYearData = onCallData[tgtYear] || {};
      const currentMonthData = currentYearData[tgtMonth] || {};
      
      const doctors = currentMonthData[tgtDay] || [];
      const legacyEvents = legacyEventsMap[tgtDay] || [];
      const dynamicDayEvents = dynamicEvents.filter(e => e.year === tgtYear && e.month === tgtMonth && e.day === tgtDay && canSeeEvent(e));

      const filteredDoctors = searchQuery
        ? doctors.filter(d => typeof d === 'string' && d.toLowerCase().includes(searchQuery.toLowerCase()))
        : doctors;

      const filteredEvents = searchQuery
        ? [...legacyEvents, ...dynamicDayEvents].filter(e => e && e.title && typeof e.title === 'string' && e.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : [...legacyEvents, ...dynamicDayEvents];

      return {
          doctors: filteredDoctors,
          legacyEvents,
          dynamicDayEvents,
          allEvents: filteredEvents
      };
  };

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDisplayDate(new Date());
      return;
    }
    setCurrentDisplayDate(prev => {
        const d = new Date(prev);
        d.setMonth(direction === 'prev' ? d.getMonth() - 1 : d.getMonth() + 1);
        return d;
    });
  };

  // Render Month View: day numbers in top-left corner, Sat & Sun with subtle reddish tint
  const renderMonthView = () => {
    const cells = [];
    const isAugust2026 = year === 2026 && currentDisplayDate.getMonth() === 7;

    const startDayNumber = isAugust2026 ? 3 : 1;
    const paddingCells = isAugust2026 ? 0 : firstDayOfMonth;

    // Empty padding cells for Monday-first layout
    for (let i = 0; i < paddingCells; i++) {
        cells.push(<div key={`empty-${i}`} className="bg-transparent border-none"></div>);
    }

    for (let day = startDayNumber; day <= daysInMonth; day++) {
        const tgtDate = new Date(year, currentDisplayDate.getMonth(), day);
        const dayOfWeekIndex = tgtDate.getDay(); // 0 is Sun, 6 is Sat
        const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

        const { doctors, legacyEvents, dynamicDayEvents } = getDayEvents(tgtDate);

        const isCurrentDay = today.getDate() === day &&
                             today.getMonth() === currentDisplayDate.getMonth() &&
                             today.getFullYear() === year;

        const hasFeriado = legacyEvents.some(e => !e.noBackground);

        // Rectangular cell styling: Sat/Sun highlighted with subtle reddish tint bg-rose-50/70 border-rose-200/80
        let cellClasses = "relative p-1.5 h-[78px] sm:h-[86px] flex flex-col text-xs overflow-hidden rounded-md shadow-2xs border transition-all duration-150 group";
        
        if (isCurrentDay) {
            cellClasses += " ring-2 ring-sky-500 bg-sky-50 border-sky-300";
        } else if (hasFeriado) {
            cellClasses += " bg-emerald-100/90 border-emerald-300 text-emerald-900 font-semibold";
        } else if (isWeekend) {
            cellClasses += " bg-rose-50/70 border-rose-200/80 hover:border-rose-300 hover:shadow-xs";
        } else {
            cellClasses += " bg-white border-slate-300 hover:border-slate-400 hover:shadow-xs";
        }

        cells.push(
            <div 
                key={day} 
                className={cellClasses}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
            >
                {/* Day Header number positioned in TOP-LEFT corner closer to edges */}
                <div className="flex justify-between items-center mb-0.5 shrink-0 pl-0.5 pt-0.5">
                    <span className={`font-semibold text-[11px] ${
                      isCurrentDay 
                        ? 'bg-sky-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-semibold font-sans shadow-2xs text-[10px]' 
                        : (isWeekend ? 'text-rose-800 font-bold' : 'text-slate-800')
                    }`}>
                        {day}
                    </span>

                    {hoveredDay === day && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenForm(day); }}
                        className="bg-sky-500 text-white rounded-md p-0.5 hover:bg-sky-600 transition-colors shadow-2xs cursor-pointer z-10"
                        title="Agregar Evento"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                </div>

                {/* Day cell body listing doctors in ALL UPPERCASE (ROJAS) */}
                <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar pr-0.5 pl-0.5">
                    
                    {/* Feriado Banner */}
                    {legacyEvents.filter(e => e && e.title && typeof e.title === 'string' && e.creator === 'system' && !e.title.toUpperCase().startsWith('CONTINUIDAD') && !e.title.toUpperCase().startsWith('[C]')).map(evt => (
                      <div 
                        key={evt.id}
                        onClick={(e) => handleOpenDetails(evt, e)}
                        className={`text-[9px] uppercase font-semibold tracking-tight leading-tight cursor-pointer ${
                          evt.noBackground ? 'text-sky-900' : 'text-emerald-800'
                        }`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}

                    {/* Doctors on call: ALL UPPERCASE (ROJAS, VEGA) - reduced font by 1 unit to text-[10px] */}
                    {doctors.length > 0 && doctors.map((docName, idx) => {
                      const displayName = getLastNameUpper(docName);
                      return (
                        <div 
                          key={idx} 
                          className={`text-[10px] font-normal leading-tight truncate ${
                            idx === 0 ? 'font-bold text-slate-900' : 'font-normal text-slate-500'
                          }`} 
                          title={docName}
                        >
                          {displayName}
                        </div>
                      );
                    })}

                    {/* Custom Dynamic Events */}
                    {dynamicDayEvents.filter(e => e && e.title && typeof e.title === 'string' && !e.title.toUpperCase().startsWith('CONTINUIDAD') && !e.title.toUpperCase().startsWith('[C]')).map((evt) => (
                      <div 
                        key={evt.id}
                        onClick={(e) => handleOpenDetails(evt, e)}
                        className="px-1 py-0.5 rounded text-[9.5px] leading-tight font-normal text-slate-600 cursor-pointer truncate shadow-2xs border bg-sky-50/80 border-sky-200 mt-0.5"
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}

                </div>
            </div>
        );
    }

    const daysOfWeek = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    return (
        <div className="bg-white rounded-xl shadow-md border-[1.5px] border-slate-300 p-4 sm:p-5 pt-3 sm:pt-3.5 flex flex-col w-full font-sans">
            
            {/* Top Card Header with Calendar Icon */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarIcon className="w-4 h-4 text-sky-600 shrink-0" />
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight uppercase truncate">
                  URGENCIA NO PROGRAMADA: {monthName} DE {year}
                </h3>
              </div>

              {/* Month Navigation Buttons */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs shrink-0">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateDate('next')}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Siguiente mes"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week Header (LUN - DOM: 7 columns) */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 shrink-0">
                {daysOfWeek.map((d, idx) => (
                  <div key={d} className={idx >= 5 ? 'text-rose-700 font-bold' : ''}>
                    {d}
                  </div>
                ))}
            </div>

            {/* Grid of Days */}
            <div className="grid grid-cols-7 gap-2 flex-1">
                {cells}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full font-sans">
      {renderMonthView()}

      {isFormOpen && selectedDateForEvent && (
        <EventFormModal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveEvent} 
          initialDate={selectedDateForEvent} 
          loggedInUser={loggedInUser}
          editingEvent={editingEvent}
        />
      )}

      {isDetailsOpen && selectedEvent && (
        <EventDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          event={selectedEvent}
          loggedInUser={loggedInUser}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default OnCallCalendar;
