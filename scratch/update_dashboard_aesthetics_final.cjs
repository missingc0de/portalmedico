const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// 1. Add Megaphone to lucide-react imports
code = code.replace(
  "  Check,\n  Clock\n} from 'lucide-react';",
  "  Check,\n  Clock,\n  Megaphone\n} from 'lucide-react';"
);

// 2. Replace Left 50% Avisos card markup to match final requirements
const oldAvisosCard = `            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-4 flex flex-col justify-between gap-3 h-full min-h-[160px]">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAviso(null);
                        setNewAvisoContent('');
                        setIsAddAvisoOpen(true);
                      }}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Crear aviso
                    </button>
                    {avisos.length > 0 && (
                      <>
                        <button 
                          onClick={handleEditActiveAviso}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
                          title="Editar aviso actual"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={handleDeleteActiveAviso}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border border-red-200 shadow-2xs active:scale-95"
                          title="Borrar aviso actual"
                        >
                          Borrar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Avisos Carousel */}
                <div className="flex-grow flex flex-col justify-center min-h-0">
                  {avisos.length > 0 ? (
                    (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      if (!currentAviso) return null;
                      return (
                        <div key={currentAviso.id} className="flex flex-col gap-2.5 animate-fadeIn w-full">
                          <div className="flex items-center gap-2.5 w-full">
                            {currentAviso.profilePictureUrl ? (
                              <img 
                                src={currentAviso.profilePictureUrl} 
                                alt={currentAviso.userFullName} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs border border-sky-200 shrink-0">
                                {currentAviso.userFullName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-black text-slate-800 block truncate">
                                {currentAviso.userFullName}
                              </span>
                              <span className="text-[9.5px] font-bold text-slate-400 block -mt-0.5">
                                {currentAviso.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-sans leading-normal text-slate-700 w-full break-words bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {currentAviso.content}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[11px] text-slate-400 font-medium italic">No hay avisos publicados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

const newAvisosCard = `            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-4 flex flex-col justify-between gap-3 h-[160px] max-h-[160px] min-h-[160px] overflow-hidden">
              <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAviso(null);
                        setNewAvisoContent('');
                        setIsAddAvisoOpen(true);
                      }}
                      className="w-7 h-7 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 text-base font-bold shrink-0"
                      title="Crear aviso"
                    >
                      +
                    </button>
                    {avisos.length > 0 && (
                      <button 
                        onClick={handleDeleteActiveAviso}
                        className="w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        title="Borrar aviso actual"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Avisos Carousel */}
                <div className="flex-grow flex flex-col justify-center min-h-0 overflow-hidden">
                  {avisos.length > 0 ? (
                    (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      if (!currentAviso) return null;
                      return (
                        <div key={currentAviso.id} className="flex flex-col gap-1.5 animate-fadeIn w-full min-h-0 overflow-hidden">
                          <div className="flex items-center gap-2 w-full shrink-0">
                            {currentAviso.profilePictureUrl ? (
                              <img 
                                src={currentAviso.profilePictureUrl} 
                                alt={currentAviso.userFullName} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" 
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs border border-sky-200 shrink-0 font-sans">
                                {currentAviso.userFullName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-900 block truncate font-sans">
                                {currentAviso.userFullName}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block -mt-0.5 font-sans">
                                {currentAviso.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11.5px] font-sans leading-relaxed text-slate-700 w-full break-words bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-y-auto max-h-[64px] custom-scrollbar shrink-0">
                            {currentAviso.content}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4 shrink-0">
                      <p className="text-[11px] text-slate-400 font-medium italic font-sans">No hay avisos publicados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

code = code.replace(oldAvisosCard, newAvisosCard);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Megaphone, button styles, custom font, and scroll constraints updated in dashboard");
