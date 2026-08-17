import React, { useState, useRef, useEffect } from 'react';

const GMAIL_URL = 'https://mail.google.com/mail/u/1/#inbox';
const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 730;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

interface GmailWindowProps {
  isOpen: boolean;
  onMinimize: () => void;
}

export const GmailWindow: React.FC<GmailWindowProps> = ({ isOpen, onMinimize }) => {
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
    if (webview && !webview.dataset.gmailListeners) {
      webview.dataset.gmailListeners = 'true';
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
        {/* Icono Gmail (sobre) + Título */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: '#ea4335' }}>
            {/* Icono sobre blanco */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
              <path d="M2 7l10 7 10-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-700 truncate">Gmail — Bandeja de Entrada</span>
          {isLoading && (
            <svg className="animate-spin h-3 w-3 text-red-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          onClick={() => window.open(GMAIL_URL, '_blank')}
          className="ml-2 p-1.5 rounded-full hover:bg-red-500 hover:text-white text-slate-500 transition-colors shrink-0"
          title="Abrir Gmail en pestaña nueva"
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
      <div className="flex-1 bg-white relative overflow-hidden">
        {!isElectron() ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ background: '#ea4335' }}>
              {/* Sobre grande blanco */}
              <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.8"/>
                <path d="M2 7l10 7 10-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Gmail — Bandeja de Entrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
              Haz clic en el botón para abrir tu bandeja de Gmail en una pestaña externa.
            </p>
            <button
              onClick={() => window.open(GMAIL_URL, '_blank')}
              className="px-5 py-2.5 text-white font-semibold rounded-lg shadow-sm transition-all hover:opacity-90 text-sm flex items-center gap-2"
              style={{ background: '#ea4335' }}
            >
              Abrir Gmail
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
              src={GMAIL_URL}
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
