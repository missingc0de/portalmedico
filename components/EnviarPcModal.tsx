import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User } from '../types';
import { sendToPcCloud } from '../services/pcTransferService';
import { users as allUsersData } from '../data/userData';
import { db } from '../services/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { 
  Laptop, 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  Paperclip, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Trash2,
  User as UserIcon,
  UserCheck,
  Search,
  ChevronDown
} from 'lucide-react';

interface EnviarPcModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: User;
}

export const EnviarPcModal: React.FC<EnviarPcModalProps> = ({
  isOpen,
  onClose,
  loggedInUser
}) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target user selection state (defaults to self)
  const [selectedTargetUsername, setSelectedTargetUsername] = useState<string>(loggedInUser.username);
  const [historicalUsers, setHistoricalUsers] = useState<Array<{ id: string; fullName?: string; profession?: string }>>([]);
  const [searchUserFilter, setSearchUserFilter] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Listen to Firestore chat_users for dynamic user registration or name updates
  useEffect(() => {
    try {
      const unsub = onSnapshot(query(collection(db, 'chat_users')), (snapshot) => {
        const list: Array<{ id: string; fullName?: string; profession?: string }> = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({ id: doc.id, fullName: data.fullName, profession: data.profession });
        });
        setHistoricalUsers(list);
      }, (err) => console.warn('Error reading chat_users in EnviarPcModal:', err));
      return () => unsub();
    } catch (e) {
      console.warn('chat_users listener error:', e);
    }
  }, []);

  // Merged and deduplicated user list
  const allAvailableUsers = useMemo(() => {
    const map = new Map<string, { username: string; fullName: string; profession?: string }>();
    allUsersData.forEach(u => {
      if (u.username) {
        map.set(u.username.toLowerCase(), {
          username: u.username,
          fullName: u.fullName || u.username,
          profession: u.profession
        });
      }
    });
    historicalUsers.forEach(hu => {
      if (hu.id) {
        const key = hu.id.toLowerCase();
        const existing = map.get(key);
        map.set(key, {
          username: hu.id,
          fullName: hu.fullName || existing?.fullName || hu.id,
          profession: hu.profession || existing?.profession
        });
      }
    });
    return Array.from(map.values());
  }, [historicalUsers]);

  // List of other users sorted alphabetically by fullName
  const otherUsers = useMemo(() => {
    const list = allAvailableUsers.filter(
      u => u.username.toLowerCase() !== loggedInUser.username.toLowerCase()
    );
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }));
  }, [allAvailableUsers, loggedInUser.username]);

  // Filtered other users by search query
  const filteredOtherUsers = useMemo(() => {
    if (!searchUserFilter.trim()) return otherUsers;
    const q = searchUserFilter.toLowerCase().trim();
    return otherUsers.filter(u => 
      u.fullName.toLowerCase().includes(q) || 
      (u.profession && u.profession.toLowerCase().includes(q))
    );
  }, [otherUsers, searchUserFilter]);

  // Current recipient details
  const selectedRecipient = useMemo(() => {
    if (!selectedTargetUsername || selectedTargetUsername.toLowerCase() === loggedInUser.username.toLowerCase()) {
      return {
        username: loggedInUser.username,
        fullName: loggedInUser.fullName,
        isSelf: true
      };
    }
    const found = allAvailableUsers.find(u => u.username.toLowerCase() === selectedTargetUsername.toLowerCase());
    return {
      username: found?.username || selectedTargetUsername,
      fullName: found?.fullName || selectedTargetUsername,
      isSelf: false
    };
  }, [selectedTargetUsername, allAvailableUsers, loggedInUser]);

  if (!isOpen) return null;

  const handleFilesAdded = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const newFiles = Array.from(filesList);

    // Generate previews for images
    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews((prev) => ({
            ...prev,
            [file.name + file.size]: e.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage('');
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    if (!text.trim() && selectedFiles.length === 0) {
      setErrorMessage('Agrega al menos una foto, archivo o escribe un texto para enviar.');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    setProgressStatus('Iniciando transferencia...');

    try {
      await sendToPcCloud(
        {
          username: loggedInUser.username,
          fullName: loggedInUser.fullName
        },
        text,
        selectedFiles,
        (status) => setProgressStatus(status),
        selectedTargetUsername
      );

      setSendSuccess(true);
      setTimeout(() => {
        // Reset and close
        setText('');
        setSelectedFiles([]);
        setFilePreviews({});
        setSelectedTargetUsername(loggedInUser.username);
        setSearchUserFilter('');
        setSendSuccess(false);
        setIsSending(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Error sending to PC:', err);
      setErrorMessage(err.message || 'Error al enviar a la nube.');
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                Enviar a PC
                <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Nube Temporal
                </span>
              </h3>
              <p className="text-[11px] text-sky-100 font-medium">
                Sesión: <strong className="text-white underline">{loggedInUser.fullName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Recipient Selection (Destinatario) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Destinatario (Enviar a)</span>
              </label>
              {!selectedRecipient.isSelf ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetUsername(loggedInUser.username);
                    setSearchUserFilter('');
                  }}
                  className="text-[10px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 transition-colors cursor-pointer"
                >
                  ↩ Volver a mí mismo
                </button>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Por defecto: Uno mismo
                </span>
              )}
            </div>

            {/* Quick search input to filter users by name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchUserFilter}
                onChange={(e) => setSearchUserFilter(e.target.value)}
                placeholder="Escribe el nombre de un colega para buscar..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-700 placeholder-slate-400"
              />
              {searchUserFilter && (
                <button
                  type="button"
                  onClick={() => setSearchUserFilter('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Select dropdown showing user full names */}
            <div className="relative">
              <select
                value={selectedTargetUsername}
                onChange={(e) => setSelectedTargetUsername(e.target.value)}
                disabled={isSending}
                className="w-full pl-8 pr-8 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none truncate"
              >
                <option value={loggedInUser.username}>
                  👤 Para mí mismo ({loggedInUser.fullName}) [Por defecto]
                </option>
                <optgroup label={searchUserFilter ? "── Resultados encontrados ──" : "── Enviar a otro usuario (por nombre) ──"}>
                  {filteredOtherUsers.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.fullName} {user.profession ? `• ${user.profession}` : ''}
                    </option>
                  ))}
                  {filteredOtherUsers.length === 0 && searchUserFilter && (
                    <option disabled value="">
                      No se encontraron usuarios con "{searchUserFilter}"
                    </option>
                  )}
                </optgroup>
              </select>
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4 text-sky-600" />
              </div>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Helper status text */}
            <p className="text-[10px] text-slate-500 leading-tight">
              {selectedRecipient.isSelf ? (
                <span>
                  🟢 El archivo se descargará en tu propio PC (<strong className="text-slate-700">{loggedInUser.fullName}</strong>).
                </span>
              ) : (
                <span>
                  🔵 El archivo se enviará al computador o sesión de <strong className="text-sky-700 font-bold">{selectedRecipient.fullName}</strong>.
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons to Attach */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Adjuntar contenido
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Tomar Foto */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isSending}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 active:scale-95 transition-all text-sky-700 cursor-pointer shadow-2xs"
              >
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Cámara</span>
                <span className="text-[9px] text-sky-600/80 font-medium">Tomar foto</span>
              </button>

              {/* Galería */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isSending}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 active:scale-95 transition-all text-indigo-700 cursor-pointer shadow-2xs"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Fotos</span>
                <span className="text-[9px] text-indigo-600/80 font-medium">Galería</span>
              </button>

              {/* Archivo / Documento */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={isSending}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 active:scale-95 transition-all text-emerald-700 cursor-pointer shadow-2xs"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Archivos</span>
                <span className="text-[9px] text-emerald-600/80 font-medium">PDF o docs</span>
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              ref={docInputRef}
              accept="*/*"
              multiple
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />
          </div>

          {/* List of Attached Files */}
          {selectedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">
                  Archivos adjuntos ({selectedFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Quitar todos
                </button>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5 custom-scrollbar">
                {selectedFiles.map((file, idx) => {
                  const previewUrl = filePreviews[file.name + file.size];
                  const isImg = file.type.startsWith('image/');
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImg && previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        disabled={isSending}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text Message Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mensaje o nota para tu PC <span className="text-[10px] text-slate-400 lowercase font-normal">(opcional)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSending}
              rows={3}
              placeholder="Escribe texto, un RUT, enlace o indicaciones para tu computador..."
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Privacy & Storage Notice */}
          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2">
            <span className="text-xs">💡</span>
            <p className="text-[11px] text-amber-900 leading-tight">
              Los archivos se envían a través de la nube y se <strong>descargan automáticamente en la memoria de tu PC</strong>. Una vez recibidos, se borran de la nube de inmediato para ahorrar espacio.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {sendSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {selectedRecipient.isSelf 
                  ? '¡Enviado a tu PC! Aparecerá en el chat «Archivos recibidos».'
                  : `¡Enviado con éxito a ${selectedRecipient.fullName}! Aparecerá en sus archivos recibidos.`}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || (!text.trim() && selectedFiles.length === 0)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressStatus || 'Enviando...'}</span>
              </>
            ) : sendSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Enviado!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {selectedRecipient.isSelf 
                    ? 'Enviar a PC' 
                    : `Enviar a ${selectedRecipient.fullName.split(' ')[0]}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnviarPcModal;
