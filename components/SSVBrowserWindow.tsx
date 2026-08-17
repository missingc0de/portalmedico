import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Tab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
  urlHistory: string[];
}

interface SSVBrowserWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const INITIAL_URL = 'https://sscoquimbo.avislatam.com/modulos/login/index.cfm';
const DEFAULT_WIDTH = 900; // 1/5 más ancho que 750 (750 * 1.2 = 900)
const DEFAULT_HEIGHT = 730; // 1/3 más alto que 550 (550 * 4/3 = 733.3)
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

export const SSVBrowserWindow: React.FC<SSVBrowserWindowProps> = ({ isOpen, onClose, onOpen }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'main-tab', url: INITIAL_URL, title: 'AVIS SSCoquimbo', loading: true, urlHistory: [INITIAL_URL] }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('main-tab');
  const [popoutCount, setPopoutCount] = useState(0);

  // Resizing and Dragging state
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [xOffset, setXOffset] = useState(0);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMovingRef = useRef(false);
  const [isMoving, setIsMoving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const moveStart = useRef({ x: 0, xOffset: 0 });

  const webviewRefs = useRef<{ [key: string]: any }>({});
  const navigateRef = useRef<(url: string) => void>();
  const lastNavigatedRef = useRef<{ url: string; time: number }>({ url: '', time: 0 });

  // Reset popoutCount to 0 when there is only one tab and it is at INITIAL_URL
  useEffect(() => {
    if (tabs.length === 1 && tabs[0].url === INITIAL_URL) {
      setPopoutCount(0);
    }
  }, [tabs]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: width,
      height: height
    };
    e.preventDefault();
  };

  const handleTopBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    isMovingRef.current = true;
    setIsMoving(true);
    moveStart.current = {
      x: e.clientX,
      xOffset: xOffset
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = dragStart.current.x - e.clientX;
        const dy = dragStart.current.y - e.clientY;
        
        const newWidth = Math.max(MIN_WIDTH, dragStart.current.width + dx);
        const newHeight = Math.max(MIN_HEIGHT, dragStart.current.height + dy);
        
        setWidth(newWidth);
        setHeight(newHeight);
      } else if (isMovingRef.current) {
        const dx = e.clientX - moveStart.current.x;
        setXOffset(moveStart.current.xOffset + dx);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      isMovingRef.current = false;
      setIsMoving(false);
    };

    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  const getTabTitle = (url: string) => {
    if (url.includes('hojaRuta')) return 'Hoja de Ruta';
    if (url.includes('receta')) return 'Receta';
    if (url.includes('ficha')) return 'Ficha';
    return 'Módulo AVIS';
  };

  useEffect(() => {
    const handleNavigate = (url: string) => {
      const now = Date.now();
      if (lastNavigatedRef.current.url === url && now - lastNavigatedRef.current.time < 1000) {
        return;
      }
      lastNavigatedRef.current = { url, time: now };

      setTabs(prev => {
        // Si no se ha generado ningún popout, sobrescribimos la pestaña principal
        if (popoutCount === 0) {
          setPopoutCount(1);
          return prev.map(tab => {
            if (tab.id === 'main-tab') {
              const newHistory = [...tab.urlHistory, url];
              return { 
                ...tab, 
                url, 
                title: getTabTitle(url), 
                loading: true, 
                urlHistory: newHistory 
              };
            }
            return tab;
          });
        } else {
          // Si ya hay popouts activos, los abrimos como nuevas pestañas
          const newTabId = 'tab-' + Date.now();
          const newTab: Tab = {
            id: newTabId,
            url,
            title: getTabTitle(url),
            loading: true,
            urlHistory: [url]
          };
          setActiveTabId(newTabId);
          return [...prev, newTab];
        }
      });
      
      if (onOpen) {
        onOpen();
      }
    };

    (window as any).__navigateAvisFrame = handleNavigate;
    (window as any).__openAvisTab = handleNavigate;
    navigateRef.current = handleNavigate;

    return () => {
      delete (window as any).__navigateAvisFrame;
      delete (window as any).__openAvisTab;
    };
  }, [popoutCount, onOpen]);

  const handleDidStartLoading = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => tab.id === tabId ? { ...tab, loading: true } : tab));
  }, []);

  const handleDidStopLoading = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => tab.id === tabId ? { ...tab, loading: false } : tab));
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const tabToRemove = prev.find(t => t.id === tabId);
      if (!tabToRemove) return prev;

      // Si es la pestaña principal, cerramos/minimizamos la ventana completa y la reiniciamos
      if (tabId === 'main-tab') {
        onClose();
        setTimeout(() => {
          setTabs([
            { id: 'main-tab', url: INITIAL_URL, title: 'AVIS SSCoquimbo', loading: true, urlHistory: [INITIAL_URL] }
          ]);
          setActiveTabId('main-tab');
          setPopoutCount(0);
        }, 100);
        return prev;
      }

      // Si es una pestaña secundaria, la eliminamos de la lista
      const newTabs = prev.filter(t => t.id !== tabId);
      
      // Si la pestaña cerrada era la activa, cambiamos a otra activa
      if (activeTabId === tabId) {
        const closedIndex = prev.findIndex(t => t.id === tabId);
        const nextActiveIndex = Math.max(0, closedIndex - 1);
        if (newTabs[nextActiveIndex]) {
          setActiveTabId(newTabs[nextActiveIndex].id);
        } else if (newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
        }
      }

      return newTabs;
    });
  }, [activeTabId, onClose]);

  useEffect(() => {
    tabs.forEach(tab => {
      const webview = webviewRefs.current[tab.id] as any;
      if (webview && !webview.dataset.listenersAttached) {
        webview.dataset.listenersAttached = 'true';
        
        const startLoading = () => handleDidStartLoading(tab.id);
        const stopLoading = () => handleDidStopLoading(tab.id);
        const handleClose = () => closeTab(tab.id);
        const handleNewWindow = (e: any) => {
          e.preventDefault(); // Evitar que Electron abra una nueva ventana nativa
          const url = e.url;
          if (url && navigateRef.current) {
            navigateRef.current(url);
          }
        };

        webview.addEventListener('did-start-loading', startLoading);
        webview.addEventListener('did-stop-loading', stopLoading);
        webview.addEventListener('dom-ready', stopLoading);
        webview.addEventListener('close', handleClose);
        webview.addEventListener('new-window', handleNewWindow);
      }
    });
  }, [tabs, handleDidStartLoading, handleDidStopLoading, closeTab]);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && electronAPI.onIframeClose) {
      const unsubscribe = electronAPI.onIframeClose((data: { tabId: string; url: string }) => {
        if (data && data.tabId) {
          closeTab(data.tabId);
        }
      });
      return unsubscribe;
    }
  }, [closeTab]);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && electronAPI.onWebviewNewWindow) {
      const unsubscribe = electronAPI.onWebviewNewWindow((data: { url: string }) => {
        if (data && data.url && navigateRef.current) {
          navigateRef.current(data.url);
        }
      });
      return unsubscribe;
    }
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const showBackButton = activeTab && activeTab.urlHistory.length > 1;

  const handleBack = () => {
    if (activeTab && activeTab.urlHistory.length > 1) {
      setTabs(prev => prev.map(tab => {
        if (tab.id === activeTabId) {
          const newHistory = tab.urlHistory.slice(0, -1);
          const newUrl = newHistory[newHistory.length - 1];
          
          if (tab.id === 'main-tab' && newUrl === INITIAL_URL) {
            setPopoutCount(0);
          }
          
          return {
            ...tab,
            url: newUrl,
            title: getTabTitle(newUrl),
            urlHistory: newHistory,
            loading: true
          };
        }
        return tab;
      }));
    }
  };

  const handleResetAndClose = () => {
    setTabs([
      { id: 'main-tab', url: INITIAL_URL, title: 'AVIS SSCoquimbo', loading: true, urlHistory: [INITIAL_URL] }
    ]);
    setActiveTabId('main-tab');
    setPopoutCount(0);
    onClose();
  };

  const handleReload = () => {
    const webview = webviewRefs.current[activeTabId] as any;
    if (webview && typeof webview.reload === 'function') {
      webview.reload();
    }
  };

  const isElectron = () => {
    return navigator.userAgent.toLowerCase().includes('electron');
  };

  return (
    <div 
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[60] bg-white rounded-lg shadow-2xl flex flex-col border border-slate-300 overflow-hidden"
      style={{ 
        width: width, 
        height: height, 
        display: isOpen ? 'flex' : 'none',
        transform: `translateX(${xOffset}px)`
      }}
    >
      {/* Redimensionador (esquina superior izquierda) */}
      <div 
        className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-10"
        onMouseDown={handleMouseDown}
        title="Arrastrar para redimensionar"
      >
        <div className="w-0 h-0 border-t-[10px] border-l-[10px] border-t-slate-400 border-l-slate-400 border-r-[10px] border-r-transparent border-b-[10px] border-b-transparent opacity-50"></div>
      </div>

      {/* Barra de título y pestañas */}
      <div 
        onMouseDown={handleTopBarMouseDown}
        className={`bg-slate-200 border-b border-slate-300 flex items-center pr-2 relative pl-3 pt-1 shrink-0 ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        
        {/* Botón Volver */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-1 mr-2 mb-1.5 rounded-full hover:bg-slate-300 text-slate-700 transition-colors flex items-center justify-center shrink-0"
            title="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Pestañas */}
        <div className="flex-1 flex overflow-x-auto no-scrollbar space-x-1">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center max-w-[200px] min-w-[120px] px-3 py-1.5 rounded-t-lg border border-b-0 text-xs font-medium cursor-pointer transition-colors ${
                activeTabId === tab.id 
                  ? 'bg-white border-slate-300 text-slate-800' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-50'
              }`}
              style={{ 
                 marginBottom: activeTabId === tab.id ? '-1px' : '0', 
                 zIndex: activeTabId === tab.id ? 10 : 1 
              }}
            >
              <div className="flex-1 truncate mr-2 flex items-center gap-1">
                {tab.loading && (
                   <svg className="animate-spin h-3 w-3 text-sky-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                )}
                <span className="truncate" title={tab.title}>{tab.title}</span>
              </div>
              {tab.id !== 'main-tab' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-300 ${activeTabId === tab.id ? 'text-slate-600' : 'text-slate-400'}`}
                  title="Cerrar pestaña"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Botón recargar */}
        <button
          onClick={handleReload}
          className="ml-2 p-1.5 rounded-full hover:bg-green-500 hover:text-white text-slate-500 transition-colors shrink-0"
          title="Recargar página"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Botón abrir en pestaña externa */}
        <button 
          onClick={() => {
            if (activeTab) {
              window.open(activeTab.url, '_blank');
            }
          }}
          className="ml-2 p-1.5 rounded-full hover:bg-sky-500 hover:text-white text-slate-500 transition-colors shrink-0"
          title="Abrir en pestaña nueva externa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>

        {/* Botón minimizar general */}
        <button 
          onClick={onClose}
          className="ml-2 p-1.5 rounded-full hover:bg-slate-300 text-slate-500 transition-colors shrink-0"
          title="Minimizar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
          </svg>
        </button>

        {/* Botón cerrar completo */}
        <button 
          onClick={handleResetAndClose}
          className="ml-1 p-1.5 rounded-full hover:bg-red-500 hover:text-white text-slate-500 transition-colors shrink-0"
          title="Cerrar y reiniciar portal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido Webview/Iframes */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {!isElectron() ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3 border border-amber-200 shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Restricción del Navegador (CSP)</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              Estás usando un navegador web externo. Por seguridad, el servidor de <b>AVIS Coquimbo</b> prohíbe incrustarse en otras páginas web (bloqueo X-Frame/CSP).
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <button
                onClick={() => {
                  if (activeTab) {
                    window.open(activeTab.url, '_blank');
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                Abrir AVIS en Pestaña Nueva
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 mt-1">
                Para usarlo de forma 100% integrada sin salir de la app, ejecútalo en la versión de escritorio de la aplicación con:
                <code className="block mt-1 bg-slate-100 p-1 rounded font-mono text-[9px] text-slate-700">npm run electron:dev</code>
              </div>
            </div>
          </div>
        ) : (
          tabs.map(tab => (
            <div 
              key={tab.id}
              className="absolute inset-0"
              style={{ 
                display: activeTabId === tab.id ? 'block' : 'none',
                zIndex: activeTabId === tab.id ? 10 : 1
              }}
            >
              {/* @ts-ignore */}
              <webview
                ref={(el: any) => {
                  if (el) webviewRefs.current[tab.id] = el;
                }}
                src={tab.url}
                className="w-full h-full border-none"
                style={{ width: '100%', height: '100%' }}
                allowpopups="false"
              />
            </div>
          ))
        )}
      </div>
      
      {/* Overlay transparente durante el drag/move para no perder los eventos del mouse sobre los webviews */}
      {(isDragging || isMoving) && (
        <div 
          className="absolute inset-0 z-50" 
          style={{ cursor: isDragging ? 'nwse-resize' : (isMoving ? 'grabbing' : 'auto') }}
        ></div>
      )}
      
    </div>
  );
};
