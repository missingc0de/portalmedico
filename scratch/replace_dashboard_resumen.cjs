const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// 1. Define Aviso interface and initial state
const avisoDef = `interface Aviso {
  id: string;
  userFullName: string;
  userProfession: string;
  profilePictureUrl?: string;
  content: string;
  createdAt: string;
}`;

code = code.replace(
  "interface Task {",
  avisoDef + "\n\ninterface Task {"
);

// 2. Add state hooks inside MainMenuDashboard component
const dashboardStateHooks = `  // Avisos state
  const [avisos, setAvisos] = useState<Aviso[]>(() => {
    const saved = localStorage.getItem('portal_avisos');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        userFullName: 'Dr. Alejandro Gómez',
        userProfession: 'medicina',
        profilePictureUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=80&h=80&q=80',
        content: 'Recordar completar las fichas del programa cardiovascular antes del viernes a las 17:00.',
        createdAt: '12/08/2026 14:30'
      },
      {
        id: '2',
        userFullName: 'Enf. María José Valenzuela',
        userProfession: 'enfermeria',
        profilePictureUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=80&h=80&q=80',
        content: 'Se liberaron nuevas horas de control de niño sano para el sector amarillo en agenda.',
        createdAt: '12/08/2026 10:15'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('portal_avisos', JSON.stringify(avisos));
  }, [avisos]);

  const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);
  const [isAddAvisoOpen, setIsAddAvisoOpen] = useState(false);
  const [newAvisoContent, setNewAvisoContent] = useState('');

  useEffect(() => {
    if (avisos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAvisoIndex(prev => (prev + 1) % avisos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [avisos.length]);

  const handleCreateAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvisoContent.trim()) return;
    
    const d = new Date();
    const formattedDate = \`\${String(d.getDate()).padStart(2, '0')}/\${String(d.getMonth() + 1).padStart(2, '0')}/\${d.getFullYear()} \${String(d.getHours()).padStart(2, '0')}:\${String(d.getMinutes()).padStart(2, '0')}\`;
    
    const newAviso: Aviso = {
      id: Date.now().toString(),
      userFullName: loggedInUser.fullName,
      userProfession: loggedInUser.profession,
      profilePictureUrl: loggedInUser.profilePictureUrl,
      content: newAvisoContent.trim(),
      createdAt: formattedDate
    };
    
    setAvisos(prev => [newAviso, ...prev]);
    setNewAvisoContent('');
    setActiveAvisoIndex(0);
    setIsAddAvisoOpen(false);
  };`;

code = code.replace(
  "  // Clock live timer",
  dashboardStateHooks + "\n\n  // Clock live timer"
);

// 3. Replace the Left 50% Resumen del día card markup
const oldCardMarkup = `            {/* Left 50%: RESUMEN DEL DÍA Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-4 flex flex-col justify-between gap-3 h-full">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                  <UserCheck className="w-4 h-4 text-sky-600" />
                  <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">RESUMEN DEL DÍA</h2>
                </div>

                {/* Today's Turnos */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    HOY DE LLAMADO:
                  </span>
                  {todayTurnos.length > 0 ? (
                    <ul className="space-y-1">
                      {todayTurnos.map((doc, idx) => (
                        <li key={idx} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-150">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium italic">Sin medicos asignados</span>
                  )}
                </div>

                {/* Friday Continuity */}
                {isFriday && (
                  <div className="space-y-1 border-t border-slate-100 pt-2 mt-2">
                    <span className="text-[9.5px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>CONTINUIDAD:</span>
                    </span>
                    {todayTurnos.length > 0 ? (
                      <ul className="space-y-1">
                        {todayTurnos.map((doc, idx) => (
                          <li key={idx} className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="truncate">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">Sin continuidad</span>
                    )}
                  </div>
                )}
              </div>

              {/* Today's Events */}
              <div className="space-y-1 border-t border-slate-100 pt-2">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  EVENTOS DE HOY:
                </span>
                {todayEvents.length > 0 ? (
                  <ul className="space-y-1">
                    {todayEvents.map((evt, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-150">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{evt.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium italic">Sin eventos hoy</span>
                )}
              </div>
            </div>`;

const newCardMarkup = `            {/* Left 50%: AVISOS Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-4 flex flex-col justify-between gap-3 h-full min-h-[160px]">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <h2 className="text-xs font-bold text-slate-800 tracking-tight uppercase">AVISOS</h2>
                  </div>
                  <button 
                    onClick={() => setIsAddAvisoOpen(true)}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    Crear aviso
                  </button>
                </div>

                {/* Avisos Carousel */}
                <div className="flex-grow flex flex-col justify-center min-h-0">
                  {avisos.length > 0 ? (
                    (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      if (!currentAviso) return null;
                      return (
                        <div key={currentAviso.id} className="flex gap-3 items-start animate-fadeIn">
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
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-slate-800 truncate">
                                {currentAviso.userFullName}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                {currentAviso.createdAt}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 block -mt-0.5 mb-1.5 uppercase">
                              {currentAviso.userProfession === 'medicina' ? 'Médico' : currentAviso.userProfession === 'enfermeria' ? 'Enfermera/o' : currentAviso.userProfession}
                            </span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed break-words">
                              {currentAviso.content}
                            </p>
                          </div>
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

code = code.replace(oldCardMarkup, newCardMarkup);

// 4. Add the Create Aviso Modal before the closing tag of MainMenuDashboard
const modalAvisoMarkup = `      {/* Aviso Creation Modal */}
      {isAddAvisoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fadeIn font-sans">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Publicar Nuevo Aviso</span>
              </div>
              <button 
                onClick={() => setIsAddAvisoOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAviso} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Contenido del Aviso
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escriba el aviso que desea compartir con los demás usuarios..."
                  value={newAvisoContent}
                  onChange={e => setNewAvisoContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none text-slate-800 leading-normal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAvisoOpen(false)}
                  className="flex-1 py-2 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center shadow"
                >
                  Publicar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>`;

code = code.replace(
  "    </div>\n  );\n};",
  modalAvisoMarkup + "\n  );\n};"
);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Dashboard Resumen del Día replaced with Avisos carousel");
