const fs = require("fs");

let code = fs.readFileSync("components/MainMenuDashboard.tsx", "utf-8");

// 1. Update Aviso interface
code = code.replace(
  `interface Aviso {
  id: string;
  userFullName: string;`,
  `interface Aviso {
  id: string;
  username?: string;
  userFullName: string;`
);

// 2. Update newAviso object creation
code = code.replace(
  `      const newAviso: Aviso = {
        id: Date.now().toString(),
        userFullName: loggedInUser.fullName,`,
  `      const newAviso: Aviso = {
        id: Date.now().toString(),
        username: loggedInUser.username,
        userFullName: loggedInUser.fullName,`
);

// 3. Update handleEditActiveAviso and handleDeleteActiveAviso
const oldHandlers = `  const handleEditActiveAviso = () => {
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

const newHandlers = `  const handleEditActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (currentAviso) {
      const isOwner = currentAviso.username 
        ? currentAviso.username === loggedInUser.username 
        : currentAviso.userFullName === loggedInUser.fullName;
      if (!isOwner) {
        alert("Solo puedes editar tus propios avisos.");
        return;
      }
      setEditingAviso(currentAviso);
      setNewAvisoContent(currentAviso.content);
      setIsAddAvisoOpen(true);
    }
  };

  const handleDeleteActiveAviso = () => {
    const currentAviso = avisos[activeAvisoIndex % avisos.length];
    if (!currentAviso) return;
    const isOwner = currentAviso.username 
      ? currentAviso.username === loggedInUser.username 
      : currentAviso.userFullName === loggedInUser.fullName;
    if (!isOwner) {
      alert("Solo puedes borrar tus propios avisos.");
      return;
    }
    if (window.confirm("¿Seguro que desea eliminar este aviso?")) {
      setAvisos(prev => prev.filter(a => a.id !== currentAviso.id));
      setActiveAvisoIndex(0);
    }
  };`;

code = code.replace(oldHandlers, newHandlers);

// 4. Update the render buttons block to only render if owner
const oldButtonsMarkup = `                    {avisos.length > 0 && (
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
                    )}`;

const newButtonsMarkup = `                    {avisos.length > 0 && (() => {
                      const currentAviso = avisos[activeAvisoIndex % avisos.length];
                      const isOwner = currentAviso && (currentAviso.username 
                        ? currentAviso.username === loggedInUser.username 
                        : currentAviso.userFullName === loggedInUser.fullName);
                      return isOwner ? (
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
                      ) : null;
                    })()}`;

code = code.replace(oldButtonsMarkup, newButtonsMarkup);

fs.writeFileSync("components/MainMenuDashboard.tsx", code, "utf-8");
console.log("Avisos ownership rules successfully applied");
