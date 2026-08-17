import React, { useState } from 'react';
import { Profession, CESFAM, Sector, User } from '../types';
import RutInput, { formatRutChilean } from './RutInput';
import { registerCloudUser } from '../services/userService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFESION_OPTIONS: { value: Profession; label: string }[] = [
  { value: 'medicina', label: 'Médico' },
  { value: 'enfermeria', label: 'Enfermero/a' },
  { value: 'tens', label: 'TENS' },
  { value: 'matroneria', label: 'Matrón/a' },
  { value: 'odontologia', label: 'Odontólogo/a' },
  { value: 'asistente_social', label: 'Trabajador social' },
  { value: 'quimico_farmaceutico', label: 'Químico farmacéutico' },
  { value: 'nutricion', label: 'Nutricionista' },
  { value: 'psicologia', label: 'Psicólogo/a' },
  { value: 'kinesiologo', label: 'Kinesiólogo/a' }
];

const CESFAM_OPTIONS: CESFAM[] = [
  'CESFAM San Juan', 'CESFAM Santa Cecilia', 'CESFAM Sergio Aguilar', 
  'CESFAM Tierras Blancas', 'CESFAM Tongoy', 'CESFAM Pan de Azúcar', 
  'CESFAM El Sauce', 'CESFAM Lila Cortés', 'CECOSF Punta Mira'
];

const SECTOR_OPTIONS: Sector[] = [
  'Verde', 'Amarillo', 'Naranjo', 'No especificado'
];

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    rut: '',
    profession: 'medicina' as Profession,
    cesfam: 'CESFAM San Juan' as CESFAM,
    sector: 'Verde' as Sector,
    username: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-uppercase for FULL NAME
    let parsedValue = value;
    if (name === 'fullName') parsedValue = value.toUpperCase();
    if (name === 'username') parsedValue = value.toLowerCase().replace(/\s+/g, ''); // no spaces for username
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleRutChange = (rut: string) => {
    setFormData(prev => ({ ...prev, rut }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (!formData.fullName || !formData.username || !formData.password || !formData.rut) {
         throw new Error('Todos los campos son obligatorios.');
      }
      
      const newUser: User = {
        ...formData
      };
      
      await registerCloudUser(newUser);
      setSuccessMsg(`¡Usuario ${newUser.username} creado exitosamente!`);
      
      setTimeout(() => {
        setIsLoading(false);
        setFormData({
            fullName: '', rut: '', profession: 'medicina',
            cesfam: 'CESFAM San Juan', sector: 'Verde', username: '', password: ''
        });
        setSuccessMsg('');
        onClose();
      }, 2000);
      
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Error al intentar registrar el usuario en la nube.');
       setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="flex justify-between items-center p-5 border-b border-sky-100 bg-sky-50">
          <h2 className="text-xl font-bold text-sky-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Registro de Nuevo Usuario
          </h2>
          <button onClick={onClose} className="text-sky-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        
        <div className="flex-grow overflow-y-auto p-6 max-h-[80vh] custom-scrollbar">
          {successMsg ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-fadeIn">
                 <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h3 className="text-lg font-bold text-emerald-700 text-center">{successMsg}</h3>
                 <p className="text-sm text-slate-500 text-center">Iniciando sesión automáticamente...</p>
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase" placeholder="EJ: JUAN PÉREZ DÍAZ" />
              </div>

              <div>
                <RutInput label="RUT" id="rut" name="rut" required value={formData.rut} onChange={handleRutChange} placeholder="12.345.678-9" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Profesión</label>
                    <select name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white">
                      {PROFESION_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Sector Principal</label>
                    <select name="sector" value={formData.sector} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white">
                      {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CESFAM Base</label>
                <select name="cesfam" value={formData.cesfam} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white">
                  {CESFAM_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <hr className="border-slate-200 my-4" />

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de Usuario (Login)</label>
                    <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-slate-50" placeholder="jperez" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
                    <input required minLength={4} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="••••••••" />
                  </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                   <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span>{error}</span>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-slate-600 font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">
                    Cancelar
                 </button>
                 <button type="submit" disabled={isLoading} className={`px-5 py-2.5 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center min-w-[120px] ${isLoading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'CREAR USUARIO'}
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
