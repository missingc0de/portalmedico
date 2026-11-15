import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import PautaAlimentariaSelector, { PautaAlimentariaData } from './PautaAlimentariaSelector';
import { generateSoloPautaAlimentariaPdf } from '../services/pdfGenerator';
import { Drumstick, Printer, X } from 'lucide-react';

const DEFAULT_WIDTH = 740;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH = 420;
const MIN_HEIGHT = 350;

interface PautasAlimentariasWindowProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser: User | null;
}

export const PautasAlimentariasWindow: React.FC<PautasAlimentariasWindowProps> = ({
  isOpen,
  onClose,
  loggedInUser,
}) => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [xOffset, setXOffset] = useState(0);

  const [pautaData, setPautaData] = useState<PautaAlimentariaData>({
    id: '',
    nombre: '',
    favorecer: '',
    evitar: '',
    recomendaciones: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.closest('textarea')) return;
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
      setWidth(Math.min(window.innerWidth - 32, DEFAULT_WIDTH));
      setHeight(Math.min(window.innerHeight - 60, DEFAULT_HEIGHT));
      setXOffset(0);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasActiveDiet = Boolean(
    pautaData.id ||
    pautaData.nombre.trim() ||
    pautaData.favorecer.trim() ||
    pautaData.evitar.trim()
  );

  const handlePrintPdf = async () => {
    if (!hasActiveDiet) {
      alert('Por favor seleccione una pauta alimentaria del menú antes de imprimir.');
      return;
    }

    setIsGenerating(false);
    setIsGenerating(true);
    try {
      await generateSoloPautaAlimentariaPdf(pautaData, loggedInUser);
    } finally {
      setIsGenerating(false);
    }
  };

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
          <Drumstick className="w-4 h-4 text-white shrink-0" />
          <span className="text-sm font-bold tracking-tight text-white uppercase truncate">
            PAUTAS ALIMENTARIAS Y RECOMENDACIONES NUTRICIONALES
          </span>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors shrink-0 cursor-pointer"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Contenido Selector */}
      <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar p-3">
        <PautaAlimentariaSelector
          pautaId={pautaData.id}
          pautaNombre={pautaData.nombre}
          pautaFavorecer={pautaData.favorecer}
          pautaEvitar={pautaData.evitar}
          pautaRecomendaciones={pautaData.recomendaciones}
          onChange={setPautaData}
        />
      </div>

      {/* Barra de acción inferior */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="text-xs text-slate-600 min-w-0 flex-1 truncate">
          {pautaData.nombre ? (
            <span>Pauta seleccionada: <strong className="text-sky-800">{pautaData.nombre}</strong></span>
          ) : (
            <span className="italic text-slate-400">Seleccione una pauta del menú para imprimir</span>
          )}
        </div>
        <button
          type="button"
          onClick={handlePrintPdf}
          disabled={!hasActiveDiet || isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-sky-600 disabled:active:scale-100 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>{isGenerating ? 'Generando PDF...' : 'Imprimir Pauta Alimentaria (PDF)'}</span>
        </button>
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

export default PautasAlimentariasWindow;
