import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import RecetaMedicaForm from './RecetaMedicaForm';

const DEFAULT_WIDTH = 680;
const DEFAULT_HEIGHT = 520;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

interface RecetaMedicaWindowProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: User | null;
}

export const RecetaMedicaWindow: React.FC<RecetaMedicaWindowProps> = ({
  isOpen,
  onClose,
  loggedInUser,
}) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [xOffset, setXOffset] = useState(0);

  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMovingRef = useRef(false);
  const [isMoving, setIsMoving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const moveStart = useRef({ x: 0, xOffset: 0 });

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[60] bg-white rounded-lg shadow-2xl flex flex-col border border-slate-300 overflow-hidden"
      style={{
        width,
        height,
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
        className={`bg-gradient-to-r from-sky-600 to-sky-700 text-white border-b border-sky-800 flex items-center justify-between px-3.5 py-2.5 shrink-0 shadow-sm ${
          isMoving ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2h8v3H8z" />
            <path d="M9 5v3a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2V5" />
            <line x1="12" y1="12" x2="12" y2="16" />
            <line x1="10" y1="14" x2="14" y2="14" />
          </svg>
          <span className="text-sm font-bold tracking-tight text-white uppercase">
            GENERAR RECETA MÉDICA
          </span>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors shrink-0 cursor-pointer"
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenido Formulario */}
      <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar p-3">
        <RecetaMedicaForm onBackToMenu={onClose} loggedInUser={loggedInUser} />
      </div>

      {/* Overlay durante drag/move */}
      {(isDragging || isMoving) && (
        <div
          className="absolute inset-0 z-50"
          style={{ cursor: isDragging ? 'nwse-resize' : isMoving ? 'grabbing' : 'auto' }}
        />
      )}
    </div>
  );
};
