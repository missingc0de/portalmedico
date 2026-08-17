const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// 1. Add Pencil to lucide-react imports if not present
code = code.replace(
  "  Clock,\n  Megaphone\n} from 'lucide-react';",
  "  Clock,\n  Megaphone,\n  Pencil\n} from 'lucide-react';"
);

// 2. Replace the Left 50% Avisos card markup
const oldCardMarkup = `            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-3 flex flex-col justify-between gap-2.5 h-[160px] max-h-[160px] min-h-[160px] overflow-hidden">
              <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <h2 className="text-[10px] font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAviso(null);
                        setNewAvisoContent('');
                        setIsAddAvisoOpen(true);
                      }}
                      className="w-5.5 h-5.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 text-sm font-bold shrink-0"
                      title="Crear aviso"
                    >
                      +
                    </button>
                    {avisos.length > 0 && (
                      <button 
                        onClick={handleDeleteActiveAviso}
                        className="w-5.5 h-5.5 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                        title="Borrar aviso actual"
                      >
                        <Trash2 className="w-3 h-3" />
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
                        <div key={currentAviso.id} className="flex flex-col gap-1 animate-fadeIn w-full min-h-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 w-full shrink-0">
                            {currentAviso.profilePictureUrl ? (
                              <img 
                                src={currentAviso.profilePictureUrl} 
                                alt={currentAviso.userFullName} 
                                className="w-6.5 h-6.5 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" 
                              />
                            ) : (
                              <div className="w-6.5 h-6.5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] border border-sky-200 shrink-0 font-sans">
                                {currentAviso.userFullName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-slate-900 block truncate font-sans">
                                {currentAviso.userFullName}
                              </span>
                              <span className="text-[8.5px] font-semibold text-slate-400 block -mt-1 font-sans">
                                {currentAviso.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10.5px] font-sans leading-normal text-slate-700 w-full break-words bg-slate-50 p-1.5 rounded-lg border border-slate-100/80 overflow-y-auto max-h-[76px] custom-scrollbar shrink-0">
                            {currentAviso.content}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4 shrink-0 font-sans">
                      <p className="text-[10.5px] text-slate-400 font-medium italic">No hay avisos publicados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

const newCardMarkup = `            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-3 flex flex-col justify-between gap-2.5 h-[160px] max-h-[160px] min-h-[160px] overflow-hidden">
              <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingAviso(null);
                        setNewAvisoContent('');
                        setIsAddAvisoOpen(true);
                      }}
                      className="w-5.5 h-5.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Crear aviso"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    {avisos.length > 0 && (
                      <>
                        <button 
                          onClick={handleEditActiveAviso}
                          className="w-5.5 h-5.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                          title="Editar aviso actual"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={handleDeleteActiveAviso}
                          className="w-5.5 h-5.5 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                          title="Borrar aviso actual"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
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
                        <div key={currentAviso.id} className="flex flex-col gap-1 animate-fadeIn w-full min-h-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 w-full shrink-0">
                            <div className="p-[1.5px] rounded-full animate-color-fluctuate shrink-0 shadow-sm">
                              <div className="p-[1px] rounded-full bg-white">
                                {currentAviso.profilePictureUrl ? (
                                  <img 
                                    src={currentAviso.profilePictureUrl} 
                                    alt={currentAviso.userFullName} 
                                    className="w-6.5 h-6.5 rounded-full object-cover block shrink-0" 
                                  />
                                ) : (
                                  <div className="w-6.5 h-6.5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] border border-sky-200 shrink-0 font-sans">
                                    {currentAviso.userFullName.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-slate-900 block truncate font-sans">
                                {currentAviso.userFullName}
                              </span>
                              <span className="text-[8.5px] font-semibold text-slate-400 block -mt-1 font-sans">
                                {currentAviso.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10.5px] font-sans leading-normal text-amber-950 w-full break-words bg-yellow-50 p-1.5 rounded-lg border border-yellow-200/80 overflow-y-auto max-h-[76px] custom-scrollbar shrink-0">
                            {currentAviso.content}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4 shrink-0 font-sans">
                      <p className="text-[10.5px] text-slate-400 font-medium italic">No hay avisos publicados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>`;

code = code.replace(oldCardMarkup, newCardMarkup);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Pencil icon added, megaphone and text sizes adjusted, profile picture border set to fluctuate");
