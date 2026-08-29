import React, { useState, useEffect, useCallback } from 'react';
import { User, CESFAM, Profession, Sector } from '../types';
import FormField from './FormField';
import RutInput, { formatRutChilean } from './RutInput';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profilePictureUrl: string;
  profileName: string;
  profileStatus: string;
  onUpdateUser: (
    updatedData: Pick<User, 'fullName' | 'rut' | 'cesfam' | 'electronicSignature' | 'profession' | 'sector'> & {
      visibleName: string;
      status: string;
      profilePictureUrl: string;
    },
    newPassword?: string
  ) => void;
}

const cesfamOptions: CESFAM[] = [
  'CESFAM San Juan',
  'CESFAM Santa Cecilia',
  'CESFAM Sergio Aguilar',
  'CESFAM Tierras Blancas',
  'CESFAM Tongoy',
  'CESFAM Pan de Azúcar',
  'CESFAM El Sauce'
];

const professionOptions: { value: Profession; label: string }[] = [
  { value: 'medicina', label: 'Médico' },
  { value: 'enfermeria', label: 'Enfermero/a' },
  { value: 'tens', label: 'TENS' },
  { value: 'matroneria', label: 'Matrón/a' },
  { value: 'odontologia', label: 'Odontólogo/a' },
  { value: 'asistente_social', label: 'Trabajador social' },
  { value: 'quimico_farmaceutico', label: 'Químico farmacéutico' },
  { value: 'nutricion', label: 'Nutricionista' },
  { value: 'psicologia', label: 'Psicólogo/a' },
  { value: 'kinesiologo', label: 'Kinesiólogo/a' },
];

const sectorOptions: Sector[] = [
  'Verde',
  'Amarillo',
  'Naranjo',
  'Punta Mira',
  'No especificado'
];

const MsnDefaultAvatar = () => (
  <div className="w-full h-full bg-gradient-to-b from-white to-slate-200 relative p-[5%] shadow-inner flex flex-col items-center justify-end overflow-hidden border border-slate-300">
    <div className="w-[45%] aspect-square bg-gradient-to-b from-green-300 to-green-500 rounded-full mb-[5%] shadow-sm"></div>
    <div className="w-[90%] h-[40%] bg-gradient-to-t from-green-400 to-green-500 rounded-t-full shadow-sm"></div>
  </div>
);

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profilePictureUrl: initialPic,
  profileName: initialVisibleName,
  profileStatus: initialStatus,
  onUpdateUser
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [rut, setRut] = useState(user.rut || '');
  const [cesfam, setCesfam] = useState<CESFAM>(user.cesfam);
  const [profession, setProfession] = useState<Profession>(user.profession);
  const [sector, setSector] = useState<Sector>(user.sector || 'No especificado');
  const [electronicSignature, setElectronicSignature] = useState(user.electronicSignature || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Messenger states
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialPic || '');
  const [visibleName, setVisibleName] = useState(initialVisibleName || '');
  const [status, setStatus] = useState(initialStatus || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFullName(user.fullName);
      setRut(user.rut || '');
      setCesfam(user.cesfam);
      setProfession(user.profession);
      setSector(user.sector || 'No especificado');
      setElectronicSignature(user.electronicSignature || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      setProfilePictureUrl(initialPic || user.profilePictureUrl || '');
      setVisibleName(initialVisibleName || user.fullName);
      setStatus(initialStatus || '');
      setShowPasswordFields(false);
      
      setErrors({});
    }
  }, [isOpen, user, initialPic, initialVisibleName, initialStatus]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido.';
    }

    const trimmedRut = rut.trim();
    if (trimmedRut) {
      const formattedRut = formatRutChilean(trimmedRut);
      if (!/^\d{1,2}(\.\d{3}){2}-[\dkK]$/.test(formattedRut)) {
        newErrors.rut = 'Formato de RUT inválido (ej: 12.345.678-9).';
      }
    }

    if (newPassword || currentPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'La contraseña actual es requerida.';
      } else if (currentPassword !== user.password) {
        newErrors.currentPassword = 'La contraseña actual es incorrecta.';
      }
      if (!newPassword) {
        newErrors.newPassword = 'La nueva contraseña es requerida.';
      } else if (newPassword.length < 4) {
        newErrors.newPassword = 'Debe tener al menos 4 caracteres.';
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Las contraseñas no coinciden.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, rut, currentPassword, newPassword, confirmNewPassword, user.password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const formattedRut = rut.trim() ? formatRutChilean(rut.trim()) : undefined;
      const updatedData = {
        fullName: fullName.trim(),
        rut: formattedRut,
        cesfam: cesfam,
        profession: profession,
        electronicSignature: electronicSignature.trim(),
        sector: sector,
        visibleName: visibleName.trim() || fullName.trim(),
        status: status.trim(),
        profilePictureUrl: profilePictureUrl,
      };
      const passToUpdate = (newPassword && currentPassword === user.password) ? newPassword : undefined;
      onUpdateUser(updatedData, passToUpdate);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 transition-all duration-300 ease-in-out backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Estilo General de Menú Principal */}
        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-sky-600 to-sky-700 shadow-sm shrink-0 text-white">
          <h2 id="user-profile-modal-title" className="text-lg font-bold uppercase tracking-wider">
            Modificar Datos de Perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-sky-200 transition-colors p-1 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        {/* Scrollable Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-grow overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar flex-grow p-6 space-y-5">
            
            {/* Fila superior: Foto de perfil arriba a la izquierda y Apodo/Estado al lado */}
            <div className="flex flex-col sm:flex-row gap-4 items-start pb-2.5 border-b border-slate-100">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center shrink-0 w-24">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center shadow-md mb-2">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} className="w-full h-full object-cover" alt="Vista previa" />
                  ) : (
                    <div className="w-full h-full"><MsnDefaultAvatar /></div>
                  )}
                </div>
                <label className="cursor-pointer text-[10px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest text-center">
                  <span>Cambiar foto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = 102;
                            canvas.height = 102;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const size = Math.min(img.width, img.height);
                              const sx = (img.width - size) / 2;
                              const sy = (img.height - size) / 2;
                              ctx.drawImage(img, sx, sy, size, size, 0, 0, 102, 102);
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                              setProfilePictureUrl(compressedBase64);
                            }
                          };
                          img.src = ev.target.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Apodo y Mensaje de Estado al lado */}
              <div className="flex-1 w-full space-y-3">
                <FormField
                  label="Nombre visible (apodo)"
                  id="profileVisibleName"
                  name="profileVisibleName"
                  value={visibleName}
                  onChange={(e) => setVisibleName(e.target.value)}
                  placeholder={fullName}
                  inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                />

                <FormField
                  label="Mensaje de Estado"
                  id="profileStatusText"
                  name="profileStatusText"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Disponible"
                  inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Resto de campos del perfil */}
            <div className="space-y-4">
              <div>
                <FormField
                  label="Nombre completo"
                  id="profileFullName"
                  name="profileFullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                  required
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <RutInput
                    label="RUT (para certificados)"
                    id="profileRut"
                    name="profileRut"
                    value={rut}
                    onChange={setRut}
                    placeholder="Ej: 12.345.678-9"
                    inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                  />
                  {errors.rut && <p className="text-xs text-red-500 mt-1 font-bold">{errors.rut}</p>}
                </div>
                <div>
                  <label htmlFor="profileProfession" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Profesión
                  </label>
                  <select 
                    id="profileProfession" 
                    name="profileProfession" 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value as Profession)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-sm text-slate-700 h-9.5 font-medium"
                  >
                    {professionOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profileCesfam" className="block text-sm font-medium text-slate-700 mb-1.5">
                    CESFAM
                  </label>
                  <select 
                    id="profileCesfam" 
                    name="profileCesfam" 
                    value={cesfam} 
                    onChange={(e) => setCesfam(e.target.value as CESFAM)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm text-slate-700 h-9.5 font-medium outline-none"
                  >
                    {cesfamOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="profileSector" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Sector
                  </label>
                  <select 
                    id="profileSector" 
                    name="profileSector" 
                    value={sector} 
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm text-slate-700 h-9.5 font-medium outline-none"
                  >
                    {sectorOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FormField
                label="Firma electrónica"
                id="profileElectronicSignature"
                name="electronicSignature"
                value={electronicSignature}
                onChange={(e) => setElectronicSignature(e.target.value)}
                isTextArea
                rows={3}
                placeholder="Nombre Completo&#10;RUT 12.345.678-9&#10;Médico Cirujano"
                inputClassName="text-xs p-2.5 font-mono text-black leading-relaxed border-slate-300 rounded-lg"
              />
            </div>

            {/* Sección de cambio de contraseña */}
            {showPasswordFields && (
              <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                <FormField
                  label="Contraseña Actual"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                />
                {errors.currentPassword && <p className="text-xs text-red-500 -mt-3 font-bold">{errors.currentPassword}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FormField
                      label="Nueva Contraseña"
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                    />
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1 font-bold">{errors.newPassword}</p>}
                  </div>
                  <div>
                    <FormField
                      label="Confirmar Nueva Contraseña"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      inputClassName="text-sm h-9.5 p-2.5 text-black border-slate-300 rounded-lg"
                    />
                    {errors.confirmNewPassword && <p className="text-xs text-red-500 mt-1 font-bold">{errors.confirmNewPassword}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <footer className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-between items-center rounded-b-xl">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm uppercase tracking-wider transition-colors cursor-pointer outline-none"
            >
              {showPasswordFields ? 'Ocultar' : 'Cambiar Contraseña'}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-sm transition-colors cursor-pointer outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer outline-none shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
