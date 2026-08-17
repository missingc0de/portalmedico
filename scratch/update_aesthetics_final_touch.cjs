const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// Replace the card markup with the shrunken styles
const oldCardMarkup = `            {/* Left 50%: AVISOS Card */}
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

const newCardMarkup = `            {/* Left 50%: AVISOS Card */}
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

code = code.replace(oldCardMarkup, newCardMarkup);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Aesthetics refined: header, avatar, buttons, and font size shrunken");
