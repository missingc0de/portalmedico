import React, { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import RegisterModal from './RegisterModal';

interface LoginFormProps {
  onLoginSuccess: (username: string, rememberMe: boolean, box: string, sector: string) => void;
  users: User[];
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, users }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [box, setBox] = useState(localStorage.getItem('computerBox') || '');
  const [sector, setSector] = useState(localStorage.getItem('computerSector') || '');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [lowResources, setLowResources] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    if (remembered) {
      setUsernameInput(localStorage.getItem('rememberedUsername') || '');
      setPasswordInput(localStorage.getItem('rememberedPassword') || '');
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const foundUser = users.find(
      (user) => user.username.toLowerCase() === usernameInput.trim().toLowerCase()
    );

    if (foundUser) {
      if (foundUser.password === passwordInput.trim()) {
        // Save box and sector
        localStorage.setItem('computerBox', box);
        localStorage.setItem('computerSector', sector);

        // Save credentials if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedUsername', usernameInput.trim());
          localStorage.setItem('rememberedPassword', passwordInput.trim());
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
        }

        // Save low resources state
        localStorage.setItem('lowResources', lowResources ? 'true' : 'false');

        onLoginSuccess(foundUser.username, rememberMe, box, sector);
      } else {
        setError('Contraseña incorrecta.');
      }
    } else {
      setError('Usuario no encontrado.');
    }
  }, [usernameInput, passwordInput, users, onLoginSuccess, rememberMe, box, sector, lowResources]);

  const handleGuestLogin = () => {
    // Save low resources state for guest login too
    localStorage.setItem('lowResources', lowResources ? 'true' : 'false');

    const guestUser = users.find(u => u.username === 'house');
    if (guestUser) {
      onLoginSuccess(guestUser.username, false, box || '1', sector || 'VERDE');
    } else {
      onLoginSuccess('house', false, box || '1', sector || 'VERDE');
      console.warn("Gregory House user not found in users list, using hardcoded fallback for guest login.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-180px)] w-full relative py-4">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden min-h-[500px] z-10 relative border border-slate-100">

          {/* Left Side: Decorative Medical Theme */}
          <div className="hidden md:flex flex-col w-5/12 bg-sky-600 text-white p-8 relative overflow-hidden justify-between">
            {/* Background elements */}
            <div className="absolute top-10 -left-10 w-40 h-40 bg-sky-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              {/* Floating Cards simulating medical dashboard */}
              <div className="relative w-full max-w-[280px] h-56 mt-4">

                {/* Card 1 */}
                <div className="absolute top-0 left-2 bg-white text-slate-800 p-4 rounded-xl shadow-lg w-48 transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <div className="text-xs font-bold text-slate-700">Ingreso ECICEP</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-4/5"></div>
                    <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="absolute bottom-0 right-0 bg-white text-slate-800 p-3 rounded-xl shadow-lg w-44 transform rotate-3 transition-transform hover:rotate-0 hover:scale-105 duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 leading-tight">Receta médica</div>
                      <div className="text-[8px] text-slate-400">Genera el documento .pdf</div>
                    </div>
                  </div>
                </div>

                {/* Card 3 (Center) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-slate-800 p-4 rounded-2xl shadow-xl transition-transform hover:scale-110 duration-300">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                </div>

              </div>
            </div>

            <div className="relative z-10 text-center mt-auto pb-2">
              <h3 className="text-lg font-bold mb-1">¡La herramienta definitiva!</h3>
              <p className="text-sky-100 text-xs leading-relaxed">
                Genera rápidamente fichas clínicas, recetas médicas, certificados, documentos y mucho más.
              </p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-center bg-white relative">
            <div className="w-full max-w-sm mx-auto">
              <div className="flex flex-col items-center text-center space-y-1 mb-4">
                <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mb-1 shadow-sm border border-sky-100">
                  <svg className="h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="30" y="10" width="40" height="80" rx="5" />
                    <rect x="10" y="30" width="80" height="40" rx="5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">¡Bienvenido!</h2>
                <p className="text-xs text-slate-500">Portal de Profesionales - CESFAM San Juan</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Usuario (Ej: House)"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Contraseña"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      id="box"
                      value={box}
                      onChange={(e) => setBox(e.target.value)}
                      required
                      className="w-full pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    >
                      <option value="" disabled hidden>Box</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>Box {i + 1}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      id="sector"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      required
                      className="w-full pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    >
                      <option value="" disabled hidden>Sector</option>
                      {['VERDE', 'AMARILLO', 'NARANJO', 'AZUL', 'ROJO', 'FARMACIA', 'ZÓCALO', 'SOME CENTRAL', 'PUNTA MIRA'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-0.5 gap-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 transition-colors cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Recordar usuario</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={lowResources}
                      onChange={(e) => setLowResources(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 transition-colors cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Bajos recursos</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs font-medium p-2.5 rounded-lg flex items-center space-x-2 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all cursor-pointer"
                  >
                    Iniciar sesión
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 group cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span>Ingresar como invitado</span>
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                ¿No tienes una cuenta aún?{' '}
                <button onClick={() => setIsRegisterModalOpen(true)} className="text-sky-600 font-bold hover:text-sky-700 hover:underline transition-colors focus:outline-none cursor-pointer">
                  Regístrate
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
    </>
  );
};

export default LoginForm;
