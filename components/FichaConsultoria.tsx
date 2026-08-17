import React, { useState, useCallback, useEffect } from 'react';
import { FichaConsultoriaFormData, User } from '../types';
import FormField from './FormField';
import DateField from './DateField';
import RutInput from './RutInput';
import { generateFichaConsultoriaPdf, generateFichaConsultoriaWord } from '../services/pdfGenerator';
import { useFormLocalStorage } from '../hooks/useFormLocalStorage';

const initialFormData: FichaConsultoriaFormData = {
  nombre: '',
  fechaIngreso: '',
  fechaNac: '',
  edad: '',
  run: '',
  hcHospital: '',
  domicilioCiudad: '',
  telefonos: '',
  prevision: '',
  nivelEducacion: '',
  lugarDerivacion: '',
  canasta: '',
  ges: '',
  fechaProcesoDiagnostico: '',
  genogramaDescripcion: '',
  motivoConsulta: '',
  impresionClinica: '',
  antecedentesMorbidos: '',
  hipotesisDiagnostica: '',
  planTratamiento: '',
  evolucionTratamiento: 'Sin evolución',
  motivoConsultoria: '',
  equipoResponsable: '',
  equipoConsultoria: 'CESFAM San Juan', 
};

interface FichaConsultoriaProps {
  onBackToMenu: () => void;
  loggedInUser: User | null;
}

const FichaConsultoria: React.FC<FichaConsultoriaProps> = ({ onBackToMenu, loggedInUser }) => {
  const [formData, setFormData] = useFormLocalStorage<FichaConsultoriaFormData>('local_FichaConsultoria', initialFormData);
  const [genogramaImage, setGenogramaImage] = useState<File | null>(null);
  const [genogramaImageUrl, setGenogramaImageUrl] = useState<string | null>(null);
  
  const [responsables, setResponsables] = useState<{ tipo: string; nombre: string }[]>([]);
  const [newResponsable, setNewResponsable] = useState({ tipo: 'Médico', nombre: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const prefixMap: { [key: string]: string } = {
        'Médico': 'Dr.',
        'Psicólogo/a': 'Ps.',
        'Asistente social': 'A.S.',
    };
    const responsablesString = responsables
        .map(r => `${prefixMap[r.tipo] || ''} ${r.nombre}`)
        .join(' + ');

    setFormData(prev => ({ ...prev, equipoResponsable: responsablesString }));
  }, [responsables]);

  const handleAddResponsable = () => {
    if (newResponsable.nombre.trim() && newResponsable.tipo) {
        setResponsables([...responsables, newResponsable]);
        setNewResponsable({ tipo: 'Médico', nombre: '' });
    } else {
        alert('Por favor, seleccione un tipo de profesional y escriba un nombre.');
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setNewResponsable(responsables[index]);
  };

  const handleUpdateResponsable = () => {
    if (editingIndex === null) return;
    if (!newResponsable.nombre.trim()) {
        alert('El nombre no puede estar vacío.');
        return;
    }
    const updatedResponsables = [...responsables];
    updatedResponsables[editingIndex] = newResponsable;
    setResponsables(updatedResponsables);
    setEditingIndex(null);
    setNewResponsable({ tipo: 'Médico', nombre: '' });
  };
  
  const handleConfirmAction = () => {
      if (editingIndex !== null) {
          handleUpdateResponsable();
      } else {
          handleAddResponsable();
      }
  };


  const handleRemoveResponsable = (indexToRemove: number) => {
    setResponsables(responsables.filter((_, index) => index !== indexToRemove));
  };
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault(); 
  };
  
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const draggedItem = responsables[draggedIndex];
    const remainingItems = responsables.filter((_, index) => index !== draggedIndex);
    
    const newResponsables = [
        ...remainingItems.slice(0, dropIndex),
        draggedItem,
        ...remainingItems.slice(dropIndex)
    ];

    setResponsables(newResponsables);
    setDraggedIndex(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleRutChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, run: value }));
  }, []);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setGenogramaImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setGenogramaImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setGenogramaImage(null);
        setGenogramaImageUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setGenogramaImage(null);
    setGenogramaImageUrl(null);
    const input = document.getElementById('genogramaImage') as HTMLInputElement;
    if (input) {
        input.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.run.trim()) {
      alert("Por favor, complete al menos el Nombre y R.U.N. del paciente.");
      return;
    }
    try {
      await generateFichaConsultoriaPdf(formData, genogramaImageUrl);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Ocurrió un error al generar el PDF. Revise la consola para más detalles.");
    }
  };
  
  const handleExportToWord = async () => {
    if (!formData.nombre.trim() || !formData.run.trim()) {
      alert("Por favor, complete al menos el Nombre y R.U.N. del paciente.");
      return;
    }
    try {
      await generateFichaConsultoriaWord(formData, genogramaImageUrl);
    } catch (error) {
      console.error("Error generating WORD file:", error);
      alert("Ocurrió un error al generar el archivo .word. Revise la consola para más detalles.");
    }
  };

  const handleNewDocument = () => {
    setFormData(initialFormData);
    setResponsables([]);
    handleRemoveImage();
  };
  
  const consultoriaOptions = [
    "CESFAM San Juan",
    "CESFAM Santa Cecilia",
    "CESFAM Sergio Aguilar",
    "CESFAM Tierras Blancas",
    "CESFAM Tongoy",
    "CESFAM Pan de Azúcar",
    "CESFAM El Sauce",
    "CESFAM Lila Cortés Godoy"
  ];

  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-10">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-700">Ficha de Consultoría</h2>
        <p className="text-slate-500 mt-2">Complete los datos para generar la ficha en formato PDF o Word.</p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-6 text-sky-700 border-b border-sky-200 pb-2">I.- Antecedentes Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <FormField label="Nombre" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            <DateField label="Fecha de Ingreso" id="fechaIngreso" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} />
            <DateField label="Fecha de Nac." id="fechaNac" name="fechaNac" value={formData.fechaNac} onChange={handleChange} />
            <FormField label="Edad" id="edad" name="edad" value={formData.edad} onChange={handleChange} />
            <RutInput label="R.U.N." id="run" name="run" value={formData.run} onChange={handleRutChange} required />
            <FormField label="HC Hospital" id="hcHospital" name="hcHospital" value={formData.hcHospital} onChange={handleChange} />
            <FormField label="Domicilio - Ciudad" id="domicilioCiudad" name="domicilioCiudad" value={formData.domicilioCiudad} onChange={handleChange} containerClassName="md:col-span-2" />
            <FormField label="Teléfonos" id="telefonos" name="telefonos" value={formData.telefonos} onChange={handleChange} />
            <FormField label="Previsión" id="prevision" name="prevision" value={formData.prevision} onChange={handleChange} />
            <FormField label="Nivel de educación" id="nivelEducacion" name="nivelEducacion" value={formData.nivelEducacion} onChange={handleChange} />
            <FormField label="Lugar de derivación" id="lugarDerivacion" name="lugarDerivacion" value={formData.lugarDerivacion} onChange={handleChange} />
            <FormField label="Canasta" id="canasta" name="canasta" value={formData.canasta} onChange={handleChange} />
            <FormField label="GES" id="ges" name="ges" value={formData.ges} onChange={handleChange} />
            <DateField label="Fecha I. Proceso Diagnóstico" id="fechaProcesoDiagnostico" name="fechaProcesoDiagnostico" value={formData.fechaProcesoDiagnostico} onChange={handleChange} />
          </div>
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">II.- Genograma</h3>
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Agregar Imagen de Genograma (Opcional)</label>
                  <label htmlFor="genogramaImage" className="cursor-pointer inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Seleccionar Archivo
                  </label>
                  <input type="file" id="genogramaImage" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {genogramaImageUrl && (
                      <div className="mt-4 relative w-fit">
                          <p className="text-xs text-slate-500 mb-1">Vista previa:</p>
                          <img src={genogramaImageUrl} alt="Vista previa del Genograma" className="max-h-48 rounded border border-slate-300 shadow-sm" />
                          <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold" aria-label="Eliminar imagen">&times;</button>
                      </div>
                  )}
              </div>
              <FormField label="Descripción del Genograma y Estructura Familiar" id="genogramaDescripcion" name="genogramaDescripcion" value={formData.genogramaDescripcion} onChange={handleChange} isTextArea rows={5} placeholder="Describa la estructura familiar, relaciones, y eventos importantes. Esta descripción aparecerá en el PDF debajo de la imagen (si se sube)." />
          </div>
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">III.- Motivo de Consulta</h3>
          <FormField id="motivoConsulta" name="motivoConsulta" value={formData.motivoConsulta} onChange={handleChange} isTextArea rows={4} label="" />
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">IV.- Impresión Clínica (Síntomas, Anamnesis, Evolución)</h3>
          <FormField id="impresionClinica" name="impresionClinica" value={formData.impresionClinica} onChange={handleChange} isTextArea rows={15} label="" placeholder="Detalle aquí la historia clínica completa, evolución por sistemas, diagnóstico de egreso, etc."/>
        </section>
        
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">V.- Antecedentes Mórbidos Relevantes</h3>
          <FormField id="antecedentesMorbidos" name="antecedentesMorbidos" value={formData.antecedentesMorbidos} onChange={handleChange} isTextArea rows={4} label="" />
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">VI.- Hipótesis Diagnóstica (Ejes)</h3>
          <FormField id="hipotesisDiagnostica" name="hipotesisDiagnostica" value={formData.hipotesisDiagnostica} onChange={handleChange} isTextArea rows={6} label="" />
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">VII.- Plan de Tratamiento Propuesto</h3>
          <FormField id="planTratamiento" name="planTratamiento" value={formData.planTratamiento} onChange={handleChange} isTextArea rows={5} label="" />
        </section>

        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">VIII.- Evolución Durante el Periodo de Tratamiento</h3>
          <FormField id="evolucionTratamiento" name="evolucionTratamiento" value={formData.evolucionTratamiento} onChange={handleChange} isTextArea rows={3} label="" />
        </section>
        
        <section className="p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-xl font-semibold mb-4 text-sky-700 border-b border-sky-200 pb-2">IX.- Motivo de Consultoría</h3>
          <FormField id="motivoConsultoria" name="motivoConsultoria" value={formData.motivoConsultoria} onChange={handleChange} isTextArea rows={4} label="" />
          
          <div className="mt-4">
              <h4 className="block text-sm font-medium text-slate-700 mb-1.5">Equipo Responsable del Caso</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-md space-y-3">
                  {responsables.length > 0 ? (
                      <ul className="space-y-1">
                          {responsables.map((r, index) => (
                              <li 
                                key={index} 
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={handleDragEnd}
                                className={`flex justify-between items-center bg-sky-100 p-2 rounded cursor-grab transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                              >
                                  <span className="text-sm text-slate-800"><strong>{r.tipo}:</strong> {r.nombre}</span>
                                  <div className="flex items-center gap-1">
                                      <button onClick={() => handleStartEdit(index)} className="p-1 text-slate-600 hover:text-sky-600" aria-label={`Editar a ${r.nombre}`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                                      </button>
                                      <button onClick={() => handleRemoveResponsable(index)} className="p-1 text-red-500 hover:text-red-700 font-bold text-lg" aria-label={`Eliminar a ${r.nombre}`}>&times;</button>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-xs text-slate-500 text-center py-2">Aún no se han agregado profesionales.</p>
                  )}

                  <div className="flex items-end gap-2 pt-2 border-t border-slate-100">
                      <div className="flex-grow">
                          <label htmlFor="responsableTipo" className="block text-xs font-medium text-slate-600 mb-1">Profesional</label>
                          <select
                              id="responsableTipo"
                              value={newResponsable.tipo}
                              onChange={e => setNewResponsable({ ...newResponsable, tipo: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-700"
                          >
                              <option>Médico</option>
                              <option>Psicólogo/a</option>
                              <option>Asistente social</option>
                          </select>
                      </div>
                      <div className="flex-grow">
                           <label htmlFor="responsableNombre" className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                          <input
                              id="responsableNombre"
                              type="text"
                              value={newResponsable.nombre}
                              onChange={e => setNewResponsable({ ...newResponsable, nombre: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-700"
                              placeholder="Nombre del profesional"
                          />
                      </div>
                      <button
                          onClick={handleConfirmAction}
                          type="button"
                          className={`p-2 text-white rounded-md shadow-sm h-[38px] w-[38px] flex-shrink-0 flex items-center justify-center transition-colors ${editingIndex !== null ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}
                          aria-label={editingIndex !== null ? 'Actualizar profesional' : 'Agregar profesional'}
                      >
                         {editingIndex !== null ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                           : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                         }
                      </button>
                  </div>
              </div>
          </div>
          
          <div className="mt-4">
              <label htmlFor="equipoConsultoria" className="block text-sm font-medium text-slate-700 mb-1.5">Equipo de Consultoría</label>
              <select
                  id="equipoConsultoria"
                  name="equipoConsultoria"
                  value={formData.equipoConsultoria}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700"
              >
                  {consultoriaOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                  ))}
              </select>
          </div>
        </section>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-300">
          <button type="button" onClick={onBackToMenu} className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm">
            Volver al Menú
          </button>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button type="button" onClick={handleNewDocument} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-sm">
              Limpiar Formulario
            </button>
            <button type="button" onClick={handleExportToWord} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md">
              Guardar como WORD
            </button>
            <button type="button" onClick={handleSubmit} className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md">
              Generar PDF
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FichaConsultoria;
