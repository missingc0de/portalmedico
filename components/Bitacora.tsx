
import React, { useState, useEffect, useCallback } from 'react';
import { BitacoraTask, User } from '../types'; // Import User
import RutInput from './RutInput';
import DateField from './DateField';
import * as XLSX from 'xlsx';

// STORAGE_KEY will be dynamic based on the logged-in user
// const STATIC_STORAGE_KEY = 'portalMedicoBitacoraTasks'; 

const initialNewTaskData: Omit<BitacoraTask, 'id' | 'isCompleted'> = {
  patientName: '',
  patientRut: '',
  careDate: new Date().toISOString().split('T')[0],
  careType: '',
  pendingTasksDetails: '',
};

const careTypeOptions = [
  { value: '', label: 'Seleccione tipo...' },
  { value: 'Morbilidad', label: 'Morbilidad' },
  { value: 'PSCV', label: 'PSCV' },
  { value: 'ECICEP', label: 'ECICEP' },
  { value: 'Sala ERA', label: 'Sala ERA' },
  { value: 'Sala IRA', label: 'Sala IRA' },
  { value: 'Niño sano', label: 'Niño sano' },
  { value: 'Salud mental', label: 'Salud mental' },
  { value: 'Hospital digital', label: 'Hospital digital' },
];

interface BitacoraProps {
  onBackToMenu: () => void;
  loggedInUser: User | null; // Add loggedInUser prop
}

const Bitacora: React.FC<BitacoraProps> = ({ onBackToMenu, loggedInUser }) => {
  const [tasks, setTasks] = useState<BitacoraTask[]>([]);
  const [newTaskData, setNewTaskData] = useState<Omit<BitacoraTask, 'id' | 'isCompleted'>>(initialNewTaskData);

  const getDynamicStorageKey = useCallback(() => {
    if (loggedInUser) {
      return `portalMedicoBitacoraTasks_${loggedInUser.username}`;
    }
    // Fallback or handle case where user is not logged in, though App.tsx flow should prevent this.
    // For safety, return a generic key or null if no user, and handle appropriately.
    // console.warn("Bitacora: LoggedInUser is null, using a generic key or tasks might not persist correctly.");
    return 'portalMedicoBitacoraTasks_guest'; // Or handle as an error/disabled state
  }, [loggedInUser]);

  useEffect(() => {
    if (!loggedInUser) {
        setTasks([]); // Clear tasks if user logs out or is not identified
        return;
    }
    const STORAGE_KEY = getDynamicStorageKey();
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        setTasks([]);
      }
    } else {
      setTasks([]); // Initialize with empty array if no tasks for this user
    }
  }, [loggedInUser, getDynamicStorageKey]);

  const saveTasksToLocalStorage = useCallback((updatedTasks: BitacoraTask[]) => {
    if (!loggedInUser) {
        console.warn("Bitacora: Cannot save tasks, no user logged in.");
        return;
    }
    const STORAGE_KEY = getDynamicStorageKey();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
  }, [loggedInUser, getDynamicStorageKey]);

  const handleNewTaskInputChange = (
    field: keyof Omit<BitacoraTask, 'id' | 'isCompleted' | 'patientRut'>,
    value: string
  ) => {
    setNewTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewTaskRutChange = (value: string) => {
    setNewTaskData(prev => ({ ...prev, patientRut: value }));
  };
  
  const handleNewTaskDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskData(prev => ({ ...prev, careDate: e.target.value }));
  };

  const handleNewTaskCareTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTaskData(prev => ({ ...prev, careType: e.target.value }));
  };


  const handleAddTask = () => {
    if (!newTaskData.patientName.trim() || !newTaskData.careType.trim()) {
        alert("Por favor, complete al menos el nombre del paciente y el tipo de atención para agregar una tarea.");
        return;
    }
    if (!loggedInUser) {
        alert("No se puede agregar tarea: usuario no identificado.");
        return;
    }
    const newTaskToAdd: BitacoraTask = {
      id: Date.now().toString(),
      ...newTaskData,
      isCompleted: false,
    };
    const updatedTasks = [...tasks, newTaskToAdd];
    setTasks(updatedTasks);
    setNewTaskData(initialNewTaskData); 
  };

  const handleTaskChange = (taskId: string, field: keyof Omit<BitacoraTask, 'id' | 'isCompleted'>, value: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  };
  
  const handleRutTaskChange = (taskId: string, value: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, patientRut: value } : task
      )
    );
  };
  
  const handleTaskDateChange = (taskId: string, value: string) => {
     setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, careDate: value } : task
      )
    );
  };
  
  const handleTaskCareTypeChange = (taskId: string, value: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, careType: value } : task
      )
    );
  };


  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.")) {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
    }
  };

  const handleSaveAllChanges = () => {
    if (!loggedInUser) {
        alert("No se pueden guardar los cambios: usuario no identificado.");
        return;
    }
    saveTasksToLocalStorage(tasks);
    alert('Bitácora guardada con éxito.');
  };

  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-'); 
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString; 
  };

  const handleExportToExcel = () => {
    if (!loggedInUser) {
        alert("No se pueden exportar tareas: usuario no identificado.");
        return;
    }
    if (tasks.length === 0) {
      alert("No hay tareas para exportar.");
      return;
    }

    const tasksToSheetData = (taskList: BitacoraTask[]) => {
      return taskList.map(task => ({
        "Nombre Paciente": task.patientName,
        "RUT": task.patientRut,
        "Fecha Atención": formatDateToDDMMYYYY(task.careDate),
        "Tipo Atención": task.careType,
        "Tareas / Detalles": task.pendingTasksDetails,
      }));
    };

    const currentPendingTasks = tasks.filter(task => !task.isCompleted);
    const currentCompletedTasks = tasks.filter(task => task.isCompleted);

    const pendingSheetData = tasksToSheetData(currentPendingTasks);
    const completedSheetData = tasksToSheetData(currentCompletedTasks);

    const wsPending = XLSX.utils.json_to_sheet(pendingSheetData);
    const wsCompleted = XLSX.utils.json_to_sheet(completedSheetData);

    const setColumnWidths = (ws: XLSX.WorkSheet) => {
        const columnWidths = [
            { wch: 30 }, 
            { wch: 15 }, 
            { wch: 15 }, 
            { wch: 20 }, 
            { wch: 50 }, 
        ];
        ws['!cols'] = columnWidths;
    };

    setColumnWidths(wsPending);
    setColumnWidths(wsCompleted);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsPending, "Tareas Pendientes");
    XLSX.utils.book_append_sheet(wb, wsCompleted, "Tareas Completadas");

    XLSX.writeFile(wb, `Bitacora_Tareas_${loggedInUser.username}.xlsx`);
    alert("Tareas exportadas a Excel con éxito.");
  };


  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  const renderTaskTable = (taskList: BitacoraTask[], title: string, isPendingTable: boolean) => (
    <section className="mb-8">
      <h4 className="text-xl font-semibold text-slate-700 mb-4 border-b border-slate-300 pb-2">{title}</h4>
      {taskList.length === 0 ? (
        <p className="text-slate-500 p-4 bg-slate-50 border border-slate-200 rounded-md text-center">No hay tareas en esta sección.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar bg-white shadow-md rounded-lg border border-slate-200">
          <table className="w-full min-w-[950px] text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-3 min-w-[180px]">Nombre Paciente</th>
                <th scope="col" className="px-3 py-3 min-w-[120px]">RUT</th>
                <th scope="col" className="px-3 py-3 min-w-[140px]">Fecha Atención</th>
                <th scope="col" className="px-3 py-3 min-w-[180px]">Tipo Atención</th>
                <th scope="col" className="px-3 py-3 min-w-[200px]">Tareas / Detalles</th>
                <th scope="col" className="px-3 py-3 w-48 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map((task) => (
                <tr key={task.id} className={`border-b border-slate-200 hover:bg-slate-50 ${task.isCompleted ? 'bg-green-50 hover:bg-green-100' : 'bg-white'}`}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={task.patientName}
                      onChange={(e) => handleTaskChange(task.id, 'patientName', e.target.value)}
                      placeholder="Nombre"
                      className="w-full px-2 py-1.5 bg-transparent border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                      aria-label={`Nombre del paciente para tarea ${task.id}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                     <RutInput
                        label="" 
                        id={`rut-${task.id}`}
                        name={`rut-${task.id}`}
                        value={task.patientRut}
                        onChange={(value) => handleRutTaskChange(task.id, value)}
                        placeholder="RUT"
                      />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={task.careDate}
                      onChange={(e) => handleTaskDateChange(task.id, e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                      aria-label={`Fecha de atención para tarea ${task.id}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                     <select
                        value={task.careType}
                        onChange={(e) => handleTaskCareTypeChange(task.id, e.target.value)}
                        className="w-full px-2 py-1.5 bg-transparent border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                        aria-label={`Tipo de atención para tarea ${task.id}`}
                      >
                        {careTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                  </td>
                  <td className="px-3 py-2">
                    <textarea
                      value={task.pendingTasksDetails}
                      onChange={(e) => handleTaskChange(task.id, 'pendingTasksDetails', e.target.value)}
                      placeholder="Detalles"
                      rows={2}
                      className="w-full px-2 py-1.5 bg-transparent border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm resize-y min-h-[40px]"
                      aria-label={`Detalles de tareas pendientes para ${task.patientName}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-center space-x-1">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 ${
                        isPendingTable 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400'
                      }`}
                      aria-label={isPendingTable ? `Marcar tarea de ${task.patientName} como completada` : `Marcar tarea de ${task.patientName} como pendiente`}
                    >
                      {isPendingTable ? 'Completada' : 'Pendiente'}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Eliminar tarea de ${task.patientName}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  if (!loggedInUser) {
    return (
        <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Acceso Denegado a Bitácora</h2>
            <p className="text-slate-600 mb-6">Debe iniciar sesión para acceder a la bitácora de tareas.</p>
            <button
                onClick={onBackToMenu}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                aria-label="Volver al menú principal"
            >
                Volver al Menú
            </button>
        </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-300">
        <h2 className="text-3xl font-semibold text-slate-700">Bitácora de Tareas ({loggedInUser.username})</h2>
        <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={handleExportToExcel}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400"
                aria-label="Exportar todas las tareas a un archivo Excel"
            >
                Exportar a Excel
            </button>
            <button
                onClick={handleSaveAllChanges}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label="Guardar todos los cambios en la bitácora"
                >
                Guardar Todos los Cambios
            </button>
         </div>
      </header>

      <section className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
        <h3 className="text-xl font-semibold text-sky-700 mb-4 border-b border-sky-200 pb-2">Ingresar Nueva Tarea</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="newTaskPatientName" className="block text-sm font-medium text-slate-700 mb-1">Nombre Paciente <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="newTaskPatientName"
              value={newTaskData.patientName}
              onChange={(e) => handleNewTaskInputChange('patientName', e.target.value)}
              placeholder="Nombre completo del paciente"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
              aria-required="true"
            />
          </div>
          <div>
            <RutInput
              label="RUT Paciente"
              id="newTaskPatientRut"
              name="newTaskPatientRut"
              value={newTaskData.patientRut}
              onChange={handleNewTaskRutChange}
              placeholder="RUT del paciente"
            />
          </div>
          <div>
            <DateField
              label="Fecha Atención"
              id="newTaskCareDate"
              name="newTaskCareDate"
              value={newTaskData.careDate}
              onChange={handleNewTaskDateChange}
            />
          </div>
          <div>
            <label htmlFor="newTaskCareType" className="block text-sm font-medium text-slate-700 mb-1">Tipo Atención <span className="text-red-500">*</span></label>
            <select
              id="newTaskCareType"
              name="newTaskCareType"
              value={newTaskData.careType}
              onChange={handleNewTaskCareTypeChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
              aria-required="true"
            >
              {careTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="newTaskPendingTasksDetails" className="block text-sm font-medium text-slate-700 mb-1">Tareas Pendientes / Detalles</label>
          <textarea
            id="newTaskPendingTasksDetails"
            value={newTaskData.pendingTasksDetails}
            onChange={(e) => handleNewTaskInputChange('pendingTasksDetails', e.target.value)}
            placeholder="Describa las tareas o detalles pendientes"
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm resize-y"
          />
        </div>
        <div className="text-right">
            <button
            onClick={handleAddTask}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Agregar nueva tarea a la lista de pendientes"
            >
            Agregar Tarea
            </button>
        </div>
      </section>
      
      {renderTaskTable(pendingTasks, "Tareas Pendientes", true)}
      {renderTaskTable(completedTasks, "Tareas Completadas", false)}

    </div>
  );
};

export default Bitacora;

