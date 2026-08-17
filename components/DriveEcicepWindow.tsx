import React, { useState, useRef, useEffect, useCallback } from 'react';

// Links del Drive por sector
const DRIVE_LINKS: Record<string, string> = {
  'Verde':      'https://docs.google.com/spreadsheets/d/1T9a8Z85iIvjZU1mq2wbGPTgrJo48e-CdkP95p5d0lSE/edit?gid=0#gid=0',
  'Naranjo':    'https://docs.google.com/spreadsheets/d/17cNcOTdn8qupYchtc10ouMG45ve_BpaZZmTGEdos-4Q/edit?gid=152571995#gid=152571995',
  'Amarillo':   'https://docs.google.com/spreadsheets/d/1paEDMTrLz2Ig_jpayPoc1z1GsnJTfSAR/edit?gid=1909397780#gid=1909397780',
};
const FALLBACK_DRIVE = 'https://drive.google.com/';

const DEFAULT_WIDTH = 680;
const DEFAULT_HEIGHT = 520;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

interface DriveEcicepWindowProps {
  isOpen: boolean;
  onMinimize: () => void;
  sector?: string;
}

const GoogleDriveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.3 78" className="w-5 h-5" fill="white">
    {/* Triángulo izquierdo (verde) */}
    <path d="M6.6 66.85 3.35 72.5a4.72 4.72 0 0 0 4.09 7.5h16.7L27.5 66.85Z" fill="white"/>
    {/* Triángulo derecho (azul) */}
    <path d="M78.1 72.5 74.85 66.85H59.8L63.2 80h16.7a4.72 4.72 0 0 0 4.09-7.5Z" fill="white"/>
    {/* Triángulo central (amarillo) */}
    <path d="M43.65 0 32.7 19.5l10.95 19 21.9-.05L54.6 19.5Z" fill="white"/>
    {/* Parte inferior izquierda */}
    <path d="M32.7 19.5 3.35 72.5l23.35-5.65 10.95-19 10.95 19 10.95 19-10.95-19Z" fill="white" opacity="0.85"/>
    {/* Simplificado como tres segmentos del logo drive */}
    <path d="M0 72.5a4.72 4.72 0 0 0 .62 2.33L3.85 69 6.6 63.85 27.5 27 43.65 0l-11-19.5L.62 16.17A4.72 4.72 0 0 0 0 18.5Z" fill="white" opacity="0"/>
  </svg>
);

// Versión simplificada y limpia del logo Drive
const DriveIconClean = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Triángulo izquierdo */}
    <path d="M8.5 20L2 9l4-7h8L8.5 20z" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Triángulo derecho */}
    <path d="M15.5 2h4l2.5 7-8 11-4.5-0.5L15.5 2z" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Base */}
    <path d="M2 9l6.5 11h7L22 9H2z" fill="rgba(255,255,255,0.5)" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

export const DriveEcicepWindow: React.FC<DriveEcicepWindowProps> = ({ isOpen, onMinimize, sector }) => {
  const driveUrl = DRIVE_LINKS[sector || ''] || FALLBACK_DRIVE;

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
    const webview = webviewRef.current as any;
    if (webview && !webview.dataset.driveListeners) {
      webview.dataset.driveListeners = 'true';
      webview.addEventListener('did-start-loading', () => setIsLoading(true));
      webview.addEventListener('did-stop-loading', () => setIsLoading(false));
      webview.addEventListener('dom-ready', () => setIsLoading(false));
    }
  }, [isOpen]);

  const isElectron = () => navigator.userAgent.toLowerCase().includes('electron');

  const handleReload = () => {
    const webview = webviewRef.current as any;
    if (webview && typeof webview.reload === 'function') {
      webview.reload();
    }
  };

  const sectorLabel = sector ? `Sector ${sector}` : 'ECICEP';

  return (
    <div
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[60] bg-white rounded-lg shadow-2xl flex flex-col border border-slate-300 overflow-hidden"
      style={{
        width,
        height,
        display: isOpen ? 'flex' : 'none',
        transform: `translateX(${xOffset}px)`,
      }}
    >
      {/* Redimensionador */}
      <div
        className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-10"
        onMouseDown={handleResizeMouseDown}
        title="Arrastrar para redimensionar"
      >
        <div className="w-0 h-0 border-t-[10px] border-l-[10px] border-t-slate-400 border-l-slate-400 border-r-[10px] border-r-transparent border-b-[10px] border-b-transparent opacity-50" />
      </div>

      {/* Barra de título */}
      <div
        onMouseDown={handleTopBarMouseDown}
        className={`bg-slate-200 border-b border-slate-300 flex items-center px-3 py-1.5 relative shrink-0 ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Icono Drive + Título */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: '#1a73e8' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 19.5L9 11.5H1.5L4.5 19.5Z" fill="white"/>
              <path d="M19.5 19.5L22.5 11.5H15L19.5 19.5Z" fill="white"/>
              <path d="M12 2L7.5 10H16.5L12 2Z" fill="white"/>
              <path d="M1.5 11.5H22.5L19.5 19.5H4.5L1.5 11.5Z" fill="rgba(255,255,255,0.4)"/>
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-700 truncate">
            Drive ECICEP — {sectorLabel}
          </span>
          {isLoading && (
            <svg className="animate-spin h-3 w-3 text-sky-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          )}
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

        {/* Botón abrir externo */}
        <button
          onClick={() => window.open(driveUrl, '_blank')}
          className="ml-2 p-1.5 rounded-full hover:bg-sky-500 hover:text-white text-slate-500 transition-colors shrink-0"
          title="Abrir en pestaña nueva"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>

        {/* Botón minimizar */}
        <button
          onClick={onMinimize}
          className="ml-2 p-1.5 rounded-full hover:bg-slate-300 text-slate-500 transition-colors shrink-0"
          title="Minimizar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div
        className="flex-1 bg-white relative overflow-hidden"
        onWheel={(e) => { e.stopPropagation(); }}
      >
        {!isElectron() ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #34a853, #1a73e8)' }}>
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                <path d="M4.5 19.5L9 11.5H1.5L4.5 19.5Z" fill="white"/>
                <path d="M19.5 19.5L22.5 11.5H15L19.5 19.5Z" fill="white"/>
                <path d="M12 2L7.5 10H16.5L12 2Z" fill="white"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Drive ECICEP — {sectorLabel}</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              Haz clic en el botón para abrir el Drive de tu sector en una pestaña externa.
            </p>
            <button
              onClick={() => window.open(driveUrl, '_blank')}
              className="px-5 py-2.5 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #34a853, #1a73e8)' }}
            >
              Abrir Drive ECICEP
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0">
            {/* @ts-ignore */}
            <webview
              ref={(el: any) => { if (el) webviewRef.current = el; }}
              src={driveUrl}
              className="w-full h-full border-none"
              style={{ width: '100%', height: '100%' }}
              allowpopups="false"
            />
          </div>
        )}
      </div>

      {/* Overlay durante drag/move */}
      {(isDragging || isMoving) && (
        <div
          className="absolute inset-0 z-50"
          style={{ cursor: isDragging ? 'nwse-resize' : (isMoving ? 'grabbing' : 'auto') }}
        />
      )}
    </div>
  );
};
