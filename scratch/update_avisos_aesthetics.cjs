const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// 1. Clean up default avisos state to be blank [] and add editingAviso state
const oldState = `  // Avisos state
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
  });`;

const newState = `  // Avisos state
  const [avisos, setAvisos] = useState<Aviso[]>(() => {
    const saved = localStorage.getItem('portal_avisos');
    return saved ? JSON.parse(saved) : [];
  });`;

code = code.replace(oldState, newState);

// 2. Insert editingAviso state and edit/delete functions next to activeAvisoIndex
const oldStateIndex = `  const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);
  const [isAddAvisoOpen, setIsAddAvisoOpen] = useState(false);
  const [newAvisoContent, setNewAvisoContent] = useState('');`;

const newStateIndex = `  const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);
  const [isAddAvisoOpen, setIsAddAvisoOpen] = useState(false);
  const [newAvisoContent, setNewAvisoContent] = useState('');
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);

  const handleEditActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (currentAviso) {
      setEditingAviso(currentAviso);
      setNewAvisoContent(currentAviso.content);
      setIsAddAvisoOpen(true);
    }
  };

  const handleDeleteActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (!currentAviso) return;
    if (window.confirm("¿Seguro que desea eliminar este aviso?")) {
      setAvisos(prev => prev.filter(a => a.id !== currentAviso.id));
      setActiveAvisoIndex(0);
    }
  };`;

code = code.replace(oldStateIndex, newStateIndex);

// 3. Update handleCreateAviso to handle editing
const oldHandleCreate = `  const handleCreateAviso = (e: React.FormEvent) => {
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

const newHandleCreate = `  const handleCreateAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvisoContent.trim()) return;
    
    if (editingAviso) {
      setAvisos(prev => prev.map(a => a.id === editingAviso.id ? { ...a, content: newAvisoContent.trim() } : a));
      setEditingAviso(null);
    } else {
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
      setActiveAvisoIndex(0);
    }
    
    setNewAvisoContent('');
    setIsAddAvisoOpen(false);
  };`;

code = code.replace(oldHandleCreate, newHandleCreate);

// 4. Update the card markup to align metadata and content
const oldCardMarkup = `            {/* Left 50%: AVISOS Card */}
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

const newCardMarkup = `            {/* Left 50%: AVISOS Card */}
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

code = code.replace(oldCardMarkup, newCardMarkup);

// 5. Update Modal title to react to editingAviso state
code = code.replace(
  "<span>Publicar Nuevo Aviso</span>",
  "<span>{editingAviso ? 'Editar Aviso' : 'Publicar Nuevo Aviso'}</span>"
);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Aesthetics, layout, and editing of Avisos updated");
