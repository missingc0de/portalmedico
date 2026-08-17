import React, { useState, useEffect, useRef } from 'react';
import { quickInsertOptions, QuickInsertItem } from '../data/quickInsertData';

const ContextMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [targetElement, setTargetElement] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);

  // Width and height estimations for collision detection
  const MENU_WIDTH = 220;
  const MENU_HEIGHT = 200;
  const SUBMENU_WIDTH = 220;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow standard context menu in developer tools or specific exceptions if any, 
      // but otherwise prevent default.
      e.preventDefault();

      let activeInput: HTMLInputElement | HTMLTextAreaElement | null = null;
      
      // Determine if right-click was on an input or textarea
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        activeInput = target;
        // Focus the element to make cursor insertion natural
        target.focus();
      } else {
        // Fallback: is the active element an input/textarea?
        const active = document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
          activeInput = active;
        }
      }

      setTargetElement(activeInput);

      // Check if there is text selected in either the active input or the window
      let selectionExists = false;
      if (activeInput) {
        const start = activeInput.selectionStart ?? 0;
        const end = activeInput.selectionEnd ?? 0;
        selectionExists = start !== end;
      } else {
        const winSel = window.getSelection()?.toString();
        selectionExists = !!winSel && winSel.length > 0;
      }
      setHasSelection(selectionExists);

      // Calculate safe coordinates
      let x = e.clientX;
      let y = e.clientY;

      // Keep menu within viewport
      if (x + MENU_WIDTH > window.innerWidth) {
        x = window.innerWidth - MENU_WIDTH - 8;
      }
      if (y + MENU_HEIGHT > window.innerHeight) {
        y = window.innerHeight - MENU_HEIGHT - 8;
      }

      // Safeguard negative bounds
      x = Math.max(8, x);
      y = Math.max(8, y);

      setPos({ x, y });
      setVisible(true);
      setShowSubMenu(false); // Reset submenu visibility on new right click
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!visible) return null;

  const isInput = !!targetElement;

  const updateInputValue = (newValue: string, newCursorPos: number) => {
    if (!targetElement) return;

    // Use property descriptor setter to bypass React's virtual DOM caching
    const nativeSetter = Object.getOwnPropertyDescriptor(
      targetElement instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(targetElement, newValue);
    } else {
      targetElement.value = newValue;
    }

    // Trigger both input and change events so React forms recognize the updates
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    targetElement.dispatchEvent(new Event('change', { bubbles: true }));

    // Restore focus and cursor selection
    setTimeout(() => {
      targetElement.focus();
      targetElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCut = () => {
    if (!targetElement) return;
    const start = targetElement.selectionStart ?? 0;
    const end = targetElement.selectionEnd ?? 0;
    const val = targetElement.value;
    const text = val.substring(start, end);
    
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        const newVal = val.substring(0, start) + val.substring(end);
        updateInputValue(newVal, start);
      }).catch(err => console.error('Error al cortar:', err));
    }
    setVisible(false);
  };

  const handleCopy = () => {
    let text = '';
    if (targetElement) {
      const start = targetElement.selectionStart ?? 0;
      const end = targetElement.selectionEnd ?? 0;
      text = targetElement.value.substring(start, end);
    } else {
      text = window.getSelection()?.toString() || '';
    }

    if (text) {
      navigator.clipboard.writeText(text).catch(err => console.error('Error al copiar:', err));
    }
    setVisible(false);
  };

  const handlePaste = async () => {
    if (!targetElement) return;
    try {
      const text = await navigator.clipboard.readText();
      const start = targetElement.selectionStart ?? 0;
      const end = targetElement.selectionEnd ?? 0;
      const val = targetElement.value;
      
      const newVal = val.substring(0, start) + text + val.substring(end);
      updateInputValue(newVal, start + text.length);
    } catch (err) {
      console.error('Error al pegar:', err);
      alert('Por favor, permite el acceso al portapapeles en tu navegador o usa Ctrl+V.');
    }
    setVisible(false);
  };

  const handleSelectAll = () => {
    if (!targetElement) return;
    targetElement.focus();
    targetElement.select();
    setVisible(false);
  };

  const handleInsert = (item: QuickInsertItem) => {
    if (!targetElement) return;
    const start = targetElement.selectionStart ?? 0;
    const end = targetElement.selectionEnd ?? 0;
    const val = targetElement.value;
    
    const newVal = val.substring(0, start) + item.content + val.substring(end);
    updateInputValue(newVal, start + item.content.length);
    setVisible(false);
  };

  // Submenu placement computation (avoids overflows)
  const isSubMenuOnLeft = pos.x + MENU_WIDTH + SUBMENU_WIDTH > window.innerWidth;
  const subMenuPositionStyles: React.CSSProperties = isSubMenuOnLeft
    ? { right: '100%', marginRight: '-4px' }
    : { left: '100%', marginLeft: '-4px' };

  return (
    <div
      ref={menuRef}
      style={{ top: pos.y, left: pos.x }}
      className="fixed z-[9999] w-[210px] bg-white border border-slate-300 shadow-xl py-1 text-slate-700 text-[11px] sm:text-xs font-normal font-sans animate-scaleIn select-none rounded-none"
    >
      {/* Cortar */}
      <button
        onClick={handleCut}
        disabled={!isInput || !hasSelection}
        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-between group disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <div className="flex items-center space-x-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243zm0-5.758a3 3 0 11-4.243-4.243 3 3 0 014.243 4.243z" />
          </svg>
          <span className="font-semibold">Cortar</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
      </button>

      {/* Copiar */}
      <button
        onClick={handleCopy}
        disabled={!hasSelection}
        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-between group disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <div className="flex items-center space-x-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <span className="font-semibold">Copiar</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
      </button>

      {/* Pegar */}
      <button
        onClick={handlePaste}
        disabled={!isInput}
        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-between group disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <div className="flex items-center space-x-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-semibold">Pegar</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
      </button>

      {/* Seleccionar Todo */}
      <button
        onClick={handleSelectAll}
        disabled={!isInput}
        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-between group disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <div className="flex items-center space-x-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-semibold">Seleccionar todo</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
      </button>

      {/* Separator */}
      <div className="border-t border-slate-200 my-1"></div>

      {/* Insertar (Submenu Trigger) */}
      <div
        className="relative"
        onMouseEnter={() => isInput && setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <button
          disabled={!isInput}
          className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-between group disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          <div className="flex items-center space-x-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Insertar</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Submenu list */}
        {showSubMenu && (
          <div
            ref={subMenuRef}
            style={{ top: -6, ...subMenuPositionStyles }}
            className="absolute z-[10000] w-[210px] bg-white border border-slate-300 shadow-xl py-1 text-slate-700 text-[11px] sm:text-xs font-normal animate-scaleIn select-none rounded-none"
          >
            <div className="px-3.5 py-1.5 text-[9px] font-black text-sky-600 uppercase tracking-widest border-b border-sky-100 mb-1 bg-sky-50">
              Textos Rápidos
            </div>
            {quickInsertOptions.length === 0 ? (
              <div className="px-3.5 py-2 text-slate-500 italic">No hay plantillas disponibles</div>
            ) : (
              quickInsertOptions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsert(item)}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-colors block truncate font-semibold"
                  title={item.content}
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ContextMenu;
