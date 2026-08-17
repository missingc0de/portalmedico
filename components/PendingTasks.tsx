import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Task, User, Priority, ActivityType } from '../types';

const priorityOrder: Record<Priority, number> = { 'Alta': 1, 'Mediana': 2, 'Baja': 3 };
const priorityClasses: Record<Priority, string> = {
  'Alta': 'bg-red-100 text-red-800 ring-red-600/20',
  'Mediana': 'bg-orange-100 text-orange-800 ring-orange-600/20',
  'Baja': 'bg-sky-100 text-sky-800 ring-sky-600/20',
};

const activityOptions: ActivityType[] = [
  'Otra',
  'Hospital digital', 
  'Consultoría SM', 
  'Receta', 
  'Sector rojo', 
  'Interconsulta', 
  'Derivación', 
  'SOME', 
  'GES', 
  'Llamado', 
];

interface PendingTasksProps {
  loggedInUser: User | null;
}

const PendingTasks: React.FC<PendingTasksProps> = ({ loggedInUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Mediana');
  const [editingTask, setEditingTask] = useState<{ id: string; text: string; priority: Priority; } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const getStorageKey = useCallback(() => {
    return loggedInUser ? `portalMedicoTasks_${loggedInUser.username}` : null;
  }, [loggedInUser]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      const storedTasks = localStorage.getItem(storageKey);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks([]);
      }
    } else {
      setTasks([]);
    }
  }, [getStorageKey]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [tasks, getStorageKey]);
  
  useEffect(() => {
    if (editingTask && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [editingTask]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.createdAt - b.createdAt; // Oldest first
    });
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      isCompleted: false,
      priority: newTaskPriority,
      activity: 'Otra', // Default activity
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setNewTaskPriority('Mediana');
    setIsAdding(false);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, isCompleted: !task.isCompleted } : task));
  };
  
  const handleStartEdit = (task: Task) => {
    setEditingTask({ id: task.id, text: task.text, priority: task.priority });
  };
  
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editingTask.text.trim()) return;
    setTasks(tasks.map(task =>
      task.id === editingTask.id
        ? { ...task, text: editingTask.text.trim(), priority: editingTask.priority }
        : task
    ));
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.")) {
        setTasks(tasks.filter(task => task.id !== id));
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  return (
    <div className="w-full h-full bg-slate-50 border-2 border-slate-200 rounded-xl p-6 shadow-md flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-sky-800 uppercase">TAREAS PENDIENTES</h3>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors flex-shrink-0" aria-label="Agregar nueva tarea">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4 flex-grow min-h-0">
        {isAdding && (
            <div className="p-3 bg-white border border-sky-300 rounded-lg shadow-sm space-y-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Descripción de la nueva tarea..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 flex-1 min-w-[120px]"
                  aria-label="Seleccionar prioridad"
                >
                  <option value="Alta">Prioridad: Alta</option>
                  <option value="Mediana">Prioridad: Mediana</option>
                  <option value="Baja">Prioridad: Baja</option>
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsAdding(false)} className="p-2 text-slate-500 hover:text-slate-700" aria-label="Cancelar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <button onClick={handleAddTask} className="p-2 text-green-600 hover:text-green-800" aria-label="Guardar tarea">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 min-w-[600px]">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 min-w-[250px]">Tarea</th>
                  <th scope="col" className="px-4 py-3">Creación</th>
                  <th scope="col" className="px-4 py-3">Prioridad</th>
                  <th scope="col" className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map(task => (
                  editingTask?.id === task.id ? (
                      // Edit Row
                      <tr key={task.id} className="bg-blue-50">
                          <td className="px-4 py-2" colSpan={2}>
                              <input
                              ref={editInputRef}
                              type="text"
                              value={editingTask.text}
                              onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-blue-300 rounded-md"
                              />
                          </td>
                          <td className="px-4 py-2">
                              <select
                              value={editingTask.priority}
                              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                              className="w-full text-sm border border-blue-300 rounded-md px-2 py-1"
                              >
                              <option value="Alta">Alta</option>
                              <option value="Mediana">Mediana</option>
                              <option value="Baja">Baja</option>
                              </select>
                          </td>
                          <td className="px-4 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                  <button onClick={handleCancelEdit} className="p-1 text-slate-500 hover:text-slate-700" aria-label="Cancelar edición"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                                  <button onClick={handleUpdateTask} className="p-1 text-green-600 hover:text-green-800" aria-label="Guardar cambios"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg></button>
                              </div>
                          </td>
                      </tr>
                  ) : (
                      // View Row
                      <tr key={task.id} className="bg-white border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-2 font-medium text-slate-800">
                             <div className="flex items-center justify-between gap-3">
                               <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={task.isCompleted}
                                    onChange={() => handleToggleComplete(task.id)}
                                    className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 flex-shrink-0"
                                    aria-labelledby={`task-text-${task.id}`}
                                />
                                <span id={`task-text-${task.id}`} className={task.isCompleted ? 'line-through text-slate-500' : ''}>
                                    {task.text}
                                </span>
                               </div>
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleStartEdit(task)} className="p-1 text-slate-500 hover:text-sky-600 transition-colors" aria-label="Editar tarea">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-500 hover:text-red-700 transition-colors" aria-label="Eliminar tarea">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                               </div>
                             </div>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-500">{formatTimestamp(task.createdAt)}</td>
                          <td className="px-4 py-2">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityClasses[task.priority]}`}>
                                  {task.priority}
                              </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`text-xs font-semibold ${task.isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                                  {task.isCompleted ? 'Completada' : 'Pendiente'}
                            </span>
                          </td>
                      </tr>
                  )
                ))}
              </tbody>
            </table>
            {sortedTasks.length === 0 && !isAdding && (
              <div className="text-center py-10">
                  <p className="text-slate-500">No hay tareas pendientes.</p>
                  <p className="text-sm text-slate-400">¡Haga clic en el '+' para agregar una!</p>
              </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingTasks;

