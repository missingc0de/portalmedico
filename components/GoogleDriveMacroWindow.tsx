import React, { useState, useRef, useEffect } from 'react';

const GOOGLE_DRIVE_MACRO_URL = 'https://script.google.com/macros/s/AKfycbx16nfHiSKgHA04JlZnjjNn4JVri_kPO9fI4LC0sgwfP-42IGoYRFaXZ9XDGuwgRuYSCw/exec?acceso=2977cdbfec174d649a5992fd8b672b39f5eef66670fc4eaa9da71f2766e02512';

const DEFAULT_WIDTH = 850;
const DEFAULT_HEIGHT = 650;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

interface GoogleDriveMacroWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveColorIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 87.3 78" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H6.6c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.45z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85l5.5 9.5z" fill="#ea4335"/>
    <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d"/>
    <path d="M59.85 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.2 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

export const GoogleDriveWhiteIcon: React.FC<{ className?: string }> = ({ className = "w-[22px] h-[22px]" }) => (
  <svg viewBox="0 0 87.3 78" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.9 1.2L4.5 45.2C3.7 46.6 3.3 48.15 3.3 49.7H30.75L43.65 25L29.9 1.2Z" fill="white" fillOpacity="0.85"/>
    <path d="M57.4 1.2C56.05 0.4 54.5 0 52.9 0H34.4C32.8 0 31.25 0.4 29.9 1.2L43.65 25L57.4 1.2Z" fill="white"/>
    <path d="M84 45.2L73.4 26.5L60.7 4.5C59.9 3.1 58.75 2 57.4 1.2L43.65 25L59.85 53H82.8C82.8 51.45 82.4 49.9 81.6 48.5L84 45.2Z" fill="white" fillOpacity="0.9"/>
    <path d="M59.85 53H27.5L13.75 76.8C15.1 77.6 16.65 78 18.25 78H69.05C70.65 78 72.2 77.6 73.55 76.8L59.85 53Z" fill="white" fillOpacity="0.95"/>
    <path d="M6.6 66.85L10.45 73.5C11.25 74.9 12.4 76 13.75 76.8L27.5 53H0C0 54.55 0.4 56.1 1.2 57.5L6.6 66.85Z" fill="white" fillOpacity="0.75"/>
    <path d="M82.8 53H59.85L73.55 76.8C74.9 76 76.05 74.9 76.85 73.5L86.1 57.5C86.9 56.1 87.3 54.55 87.3 53H82.8Z" fill="white" fillOpacity="0.7"/>
  </svg>
);

export const GoogleDriveMacroWindow: React.FC<GoogleDriveMacroWindowProps> = ({
  isOpen,
  onClose,
}) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [xOffset, setXOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMovingRef = useRef(false);
  const [isMoving, setIsMoving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const moveStart = useRef({ x: 0, xOffset: 0 });

  const webviewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isElectron = () => typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, width, height };
    e.preventDefault();
  };

  const handleTopBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
    isMovingRef.current = true;
    setIsMoving(true);
    moveStart.current = { x: e.clientX, xOffset };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = dragStart.current.x - e.clientX;
        const dy = dragStart.current.y - e.clientY;
        setWidth(Math.max(MIN_WIDTH, dragStart.current.width + dx));
        setHeight(Math.max(MIN_HEIGHT, dragStart.current.height + dy));
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

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    if (isElectron()) {
      const webview = webviewRef.current as any;
      if (webview && !webview.dataset.driveListeners) {
        webview.dataset.driveListeners = 'true';
        webview.addEventListener('did-start-loading', () => setIsLoading(true));
        webview.addEventListener('did-stop-loading', () => setIsLoading(false));
        webview.addEventListener('dom-ready', () => setIsLoading(false));
      }
    }
  }, [isOpen]);

  const handleReload = () => {
    setIsLoading(true);
    if (isElectron()) {
      const webview = webviewRef.current as any;
      if (webview && typeof webview.reload === 'function') {
        webview.reload();
      }
    } else if (iframeRef.current) {
      iframeRef.current.src = GOOGLE_DRIVE_MACRO_URL;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[60] bg-white dark:bg-[#16161E] rounded-xl shadow-2xl flex flex-col border border-slate-300 dark:border-[#2E303E] overflow-hidden animate-fadeIn"
      style={{
        width,
        height,
        transform: `translateX(${xOffset}px)`
      }}
    >
      {/* Redimensionador superior izquierdo */}
      <div
        className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20"
        onMouseDown={handleResizeMouseDown}
        title="Arrastrar para redimensionar"
      >
        <div className="w-0 h-0 border-t-[10px] border-l-[10px] border-t-slate-400 dark:border-t-slate-500 border-l-slate-400 dark:border-l-slate-500 border-r-[10px] border-r-transparent border-b-[10px] border-b-transparent opacity-60" />
      </div>

      {/* Barra de título / Header */}
      <div
        onMouseDown={handleTopBarMouseDown}
        className={`bg-slate-100 dark:bg-[#1A1B26] border-b border-slate-300 dark:border-[#2E303E] flex items-center px-3 py-2 relative shrink-0 select-none ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Logo Google Drive + Título */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#16161E] shadow-2xs border border-slate-200 dark:border-[#2E303E] flex items-center justify-center shrink-0 p-1">
            <GoogleDriveColorIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
              Google Drive
            </span>
            <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-1.5 py-0.5 rounded-full shrink-0">
              Macro
            </span>
          </div>

          {isLoading && (
            <svg className="animate-spin h-3.5 w-3.5 text-sky-500 shrink-0 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Botón Recargar */}
          <button
            type="button"
            onClick={handleReload}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E1F2A] transition-colors cursor-pointer"
            title="Recargar página"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Botón Abrir en pestaña nueva */}
          <button
            type="button"
            onClick={() => window.open(GOOGLE_DRIVE_MACRO_URL, '_blank')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
            title="Abrir en pestaña externa del navegador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          {/* Botón Minimizar / Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Minimizar ventana"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 12H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido / Iframe o Webview */}
      <div className="flex-1 bg-white dark:bg-[#16161E] relative overflow-hidden">
        {isElectron() ? (
          <div className="absolute inset-0">
            {/* @ts-ignore */}
            <webview
              ref={(el: any) => { if (el) webviewRef.current = el; }}
              src={GOOGLE_DRIVE_MACRO_URL}
              className="w-full h-full border-none"
              style={{ width: '100%', height: '100%' }}
              allowpopups="true"
            />
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={GOOGLE_DRIVE_MACRO_URL}
            className="w-full h-full border-none"
            title="Google Drive Macro"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        )}
      </div>

      {/* Overlay transparente durante arrastre/redimensión para no perder eventos del mouse */}
      {(isDragging || isMoving) && (
        <div
          className="absolute inset-0 z-50"
          style={{ cursor: isDragging ? 'nwse-resize' : (isMoving ? 'grabbing' : 'auto') }}
        />
      )}
    </div>
  );
};

export default GoogleDriveMacroWindow;
