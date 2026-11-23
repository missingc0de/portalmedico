import React, { useState, useEffect, useRef } from 'react';
import { Camera, RotateCw, ZoomIn, ZoomOut, Download, Copy, RefreshCw, X, Trash2, FlipHorizontal, FlipVertical, Layers, FileDown } from 'lucide-react';

interface OtoscopioWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SequenceSnapItem {
  id: string;
  dataUrl: string;
  time: string;
  canvas: HTMLCanvasElement;
}

export const OtoscopioWindow: React.FC<OtoscopioWindowProps> = ({ isOpen, onClose }) => {
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  
  // Selection box state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Multiple captures / Sequence state
  const [sequenceSnaps, setSequenceSnaps] = useState<SequenceSnapItem[]>([]);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  // Live timestamp for ecography/ultrasound HUD
  const [currentTime, setCurrentTime] = useState<string>('');

  const [streamUrl, setStreamUrl] = useState<string>('http://127.0.0.1:8765/api/otoscopio/stream');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Live clock updating every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check otoscope status periodically
  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      const endpoints = [
        'http://127.0.0.1:8765/api/otoscopio',
        '/api/otoscopio'
      ];

      for (const base of endpoints) {
        try {
          const res = await fetch(`${base}/status`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setIsConnected(Boolean(data.connected));
            setStreamUrl(`${base}/stream`);
            return;
          }
        } catch {
          // try next
        }
      }
      setIsConnected(false);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRotation = rotation;

  // Box drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);
    setSelectionBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setSelectionBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (selectionBox && (selectionBox.width < 10 || selectionBox.height < 10)) {
        setSelectionBox(null);
      }
    }
  };

  const showToast = (msg: string) => {
    setLastActionToast(msg);
    setTimeout(() => setLastActionToast(null), 3000);
  };

  // Safe save as triggering pywebview native save dialog, python backend dialog, and browser download
  const triggerSaveAs = async (dataUrl: string, defaultName: string) => {
    // 1. Try pywebview native desktop save dialog
    try {
      if ((window as any).pywebview?.api?.save_image_dialog) {
        const res = await (window as any).pywebview.api.save_image_dialog(dataUrl, defaultName);
        if (res && res.success) {
          showToast(`Guardado en: ${res.path}`);
          return;
        } else if (res && res.cancelled) {
          // User clicked Cancel in the save dialog
          return;
        }
      }
    } catch (err) {
      console.warn("pywebview save_image_dialog notice:", err);
    }

    // 2. Try python backend endpoints
    const endpoints = ['/api/otoscopio/save_dialog', 'http://127.0.0.1:8765/api/otoscopio/save_dialog'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: defaultName })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            showToast(`Guardado en: ${data.path}`);
            return;
          } else if (data.cancelled) {
            return;
          }
        }
      } catch {
        continue;
      }
    }

    // 3. Try window.showSaveFilePicker if supported
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [{
            description: 'Imagen Médica PNG',
            accept: { 'image/png': ['.png'] }
          }]
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        showToast('Archivo guardado correctamente');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 4. Fallback standard anchor click
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);
    showToast('Descarga iniciada');
  };

  // Safe helper to obtain a clean HTMLImageElement without CORS taint
  const getCleanFrameImage = async (): Promise<HTMLImageElement | null> => {
    const endpoints = [
      `/api/otoscopio/snapshot?t=${Date.now()}`,
      `http://127.0.0.1:8765/api/otoscopio/snapshot?t=${Date.now()}`
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { cache: 'no-store' });
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 200) {
            const blobUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
              img.onload = () => resolve(img);
              img.onerror = reject;
            });
            img.src = blobUrl;
            const loaded = await Promise.race([
              loadPromise,
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
            ]);
            if (loaded) return loaded;
          }
        }
      } catch {
        continue;
      }
    }

    // Fallback to live image element
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      return imgRef.current;
    }
    return null;
  };

  // Helper to render the camera frame with current transformations & selections to a canvas preserving exact natural resolution
  const renderCurrentFrameToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const img = await getCleanFrameImage();
    if (!img) return null;

    const naturalW = img.naturalWidth || 640;
    const naturalH = img.naturalHeight || 480;

    // Preserve exact original resolution and aspect ratio, swapping only on 90/270 rotation
    const isRotated90or270 = currentRotation === 90 || currentRotation === 270;
    const targetW = isRotated90or270 ? naturalH : naturalW;
    const targetH = isRotated90or270 ? naturalW : naturalH;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Apply rotation, zoom, flipH, flipV centered without stretching
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
    ctx.restore();

    // Draw selection box if present
    if (selectionBox && viewportRef.current) {
      const vRect = viewportRef.current.getBoundingClientRect();
      const scaleX = canvas.width / vRect.width;
      const scaleY = canvas.height / vRect.height;
      const bx = selectionBox.x * scaleX;
      const by = selectionBox.y * scaleY;
      const bw = selectionBox.width * scaleX;
      const bh = selectionBox.height * scaleY;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(bx, by, bw, bh);

      const clen = Math.min(14, bw / 3, bh / 3);
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(bx, by + clen); ctx.lineTo(bx, by); ctx.lineTo(bx + clen, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw - clen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + clen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + bh - clen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + clen, by + bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw - clen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - clen); ctx.stroke();
    }

    return canvas;
  };

  // Helper to safely get dataUrl from canvas with fallback
  const getSafeDataUrl = async (canvas: HTMLCanvasElement): Promise<string> => {
    try {
      return canvas.toDataURL('image/png');
    } catch {
      // If canvas is tainted, read snapshot directly via FileReader
      const endpoints = [`/api/otoscopio/snapshot?t=${Date.now()}`, `http://127.0.0.1:8765/api/otoscopio/snapshot?t=${Date.now()}`];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const blob = await res.blob();
            return await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        } catch {
          continue;
        }
      }
      throw new Error("No se pudo exportar la imagen");
    }
  };

  // 1. Single Capture with external clinical header (outside image)
  const handleCaptureSingle = async () => {
    try {
      const frameCanvas = await renderCurrentFrameToCanvas();
      if (!frameCanvas) {
        showToast('No se pudo acceder a la imagen de la cámara');
        return;
      }

      const headerHeight = 56;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = frameCanvas.width;
      finalCanvas.height = frameCanvas.height + headerHeight;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = '#060A12';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Clinical top banner outside the image
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, finalCanvas.width, headerHeight);

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, headerHeight);
      ctx.lineTo(finalCanvas.width, headerHeight);
      ctx.stroke();

      // Left Titles
      ctx.font = 'bold 13px "Courier New", Courier, monospace';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('PORTAL MÉDICO APS', 16, 23);
      ctx.font = '11px "Courier New", Courier, monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('EXAMEN OTOSCÓPICO DIGITAL', 16, 42);

      // Right Header Metadata outside the image
      ctx.textAlign = 'right';
      ctx.font = 'bold 15px "Courier New", Courier, monospace';
      ctx.fillStyle = '#10B981';
      ctx.fillText(currentTime, finalCanvas.width - 16, 23);

      ctx.font = 'bold 11px "Courier New", Courier, monospace';
      ctx.fillStyle = '#6EE7B7';
      const flipInfo = `${flipH ? 'FLIP-H ' : ''}${flipV ? 'FLIP-V ' : ''}`.trim();
      ctx.fillText(`NE3-HD • ROT: ${currentRotation}° ${flipInfo ? `• ${flipInfo} ` : ''}• ZOOM: ${zoom.toFixed(1)}x`, finalCanvas.width - 16, 42);
      ctx.textAlign = 'left';

      // Draw camera image strictly below the banner
      ctx.drawImage(frameCanvas, 0, headerHeight);

      const dataUrl = await getSafeDataUrl(finalCanvas);
      setCapturedImage(dataUrl);

      const fileName = `otoscopia_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.png`;
      await triggerSaveAs(dataUrl, fileName);
    } catch (e) {
      console.error("Error al capturar imagen:", e);
      showToast('Error al capturar imagen');
    }
  };

  // 2. Add to Multiple Sequence (takes a snap and stores in list)
  const handleAddToSequence = async () => {
    try {
      const frameCanvas = await renderCurrentFrameToCanvas();
      if (!frameCanvas) {
        showToast('No se pudo capturar fotograma para secuencia');
        return;
      }

      const dataUrl = await getSafeDataUrl(frameCanvas);
      const newSnap: SequenceSnapItem = {
        id: Math.random().toString(36).substring(2, 9),
        dataUrl,
        time: currentTime.split(' ')[1] || currentTime,
        canvas: frameCanvas
      };

      setSequenceSnaps(prev => {
        const next = [...prev, newSnap];
        showToast(`Foto #${next.length} añadida a la secuencia`);
        return next;
      });
    } catch (e) {
      console.error("Error al añadir a secuencia:", e);
      showToast('Error al capturar');
    }
  };

  // 3. Generate Composite Multi-panel Sheet (Ultrasound style) and trigger Save As
  const handleGenerateSequenceComposite = async () => {
    if (sequenceSnaps.length === 0) return;

    try {
      const count = sequenceSnaps.length;
      let cols = 1;
      let rows = 1;

      if (count === 2) {
        cols = 2; rows = 1;
      } else if (count === 3 || count === 4) {
        cols = 2; rows = 2;
      } else if (count === 5 || count === 6) {
        cols = 3; rows = 2;
      } else {
        cols = 3;
        rows = Math.ceil(count / 3);
      }

      // Maintain original aspect ratio and resolution of camera snaps
      const sampleCanvas = sequenceSnaps[0]?.canvas;
      const cellW = sampleCanvas?.width || 640;
      const cellH = sampleCanvas?.height || 480;
      const gap = 14;
      const headerH = 68;
      const pad = 16;

      const totalW = pad * 2 + cols * cellW + (cols - 1) * gap;
      const totalH = pad * 2 + headerH + rows * cellH + (rows - 1) * gap;

      const canvas = document.createElement('canvas');
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, totalW, totalH);

      // Top Clinical Banner
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(pad, pad, totalW - pad * 2, headerH - 8);

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pad, pad, totalW - pad * 2, headerH - 8);

      // Header text left
      ctx.font = 'bold 16px "Courier New", Courier, monospace';
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('PORTAL MÉDICO APS - UNIDAD OTOLÓGICA', pad + 16, pad + 26);
      ctx.font = '12px "Courier New", Courier, monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('ESTUDIO OTOSCÓPICO MULTIPANEL • SECUENCIA DIAGNÓSTICA', pad + 16, pad + 46);

      // Header text right
      ctx.textAlign = 'right';
      ctx.font = 'bold 17px "Courier New", Courier, monospace';
      ctx.fillStyle = '#10B981';
      ctx.fillText(currentTime, totalW - pad - 16, pad + 26);
      ctx.font = 'bold 12px "Courier New", Courier, monospace';
      ctx.fillStyle = '#6EE7B7';
      ctx.fillText(`TOTAL TOMAS: ${count} • MODELO: NE3-HD • TIPO: OTOSCOPÍA DIGITAL`, totalW - pad - 16, pad + 46);
      ctx.textAlign = 'left';

      // Render each snap in the grid
      sequenceSnaps.forEach((snap, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);

        const x = pad + c * (cellW + gap);
        const y = pad + headerH + r * (cellH + gap);

        // Frame border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, cellW, cellH);

        // Draw image
        ctx.drawImage(snap.canvas, x, y, cellW, cellH);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellW, cellH);

        // Snap Tag in top-left of each sub-frame
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(x + 8, y + 8, 120, 24);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 8, y + 8, 120, 24);

        ctx.font = 'bold 12px "Courier New", Courier, monospace';
        ctx.fillStyle = '#34D399';
        ctx.fillText(`SNAP #${idx + 1} (${snap.time})`, x + 14, y + 24);
      });

      const dataUrl = await getSafeDataUrl(canvas);
      setCapturedImage(dataUrl);

      const fileName = `secuencia_otoscopica_${count}snaps_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.png`;
      await triggerSaveAs(dataUrl, fileName);
    } catch (e) {
      console.error("Error al generar lámina compuesta:", e);
      showToast('Error al exportar secuencia');
    }
  };

  const handleCopyToClipboard = async () => {
    if (!capturedImage) return;
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar al portapapeles:", err);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    triggerSaveAs(capturedImage, `otoscopia_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.png`);
  };

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-14 right-6 z-[200] bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-800 transition-all select-none animate-fadeIn"
      >
        <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="text-xs font-bold font-sans">Otoscopio Clínico (Minimizado)</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="text-slate-400 hover:text-white ml-2 text-base font-bold leading-none"
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn font-sans">
      {/* Large Clinical Window taking almost full window space */}
      <div className={`bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-200 ${
        isMaximized 
          ? 'w-full h-full' 
          : 'w-[96vw] max-w-[1400px] h-[92vh] max-h-[95vh]'
      }`}>
        
        {/* Header Bar */}
        <div className="bg-slate-900/95 px-4 py-3 flex items-center justify-between border-b border-slate-800 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer" onClick={onClose} title="Cerrar" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer" onClick={() => setIsMinimized(true)} title="Minimizar" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} title="Maximizar / Restaurar" />
            <span className="ml-2 text-sm font-bold tracking-wide text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              Otoscopio Clínico de Alta Definición (NE3)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastActionToast && (
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3 py-0.5 rounded-full text-xs font-bold animate-fadeIn">
                {lastActionToast}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isConnected ? 'EN VIVO (60 FPS)' : 'Desconectado'}
            </span>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold leading-none p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Main Content Area: Video on Left (Max Vertical), Controls on Right */}
        <div className="flex-1 flex flex-row overflow-hidden min-h-0 bg-slate-950">
          
          {/* Left Side: Video Viewport taking maximum vertical space */}
          <div 
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="flex-1 h-full min-h-0 bg-black relative flex items-center justify-center overflow-hidden cursor-crosshair select-none"
          >
            {isConnected ? (
              <>
                {/* Ultrasound / Ecography HUD Overlay (Top-Right Corner) */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none bg-black/60 backdrop-blur-xs border border-emerald-500/50 rounded-lg px-3 py-2 text-right font-mono shadow-lg select-none">
                  <div className="text-emerald-400 font-bold text-sm tracking-wider">
                    {currentTime}
                  </div>
                  <div className="text-[11px] text-emerald-300/90 font-medium">
                    PORTAL MÉDICO APS
                  </div>
                  <div className="text-[10px] text-slate-400 tracking-tight">
                    NE3-HD • ROT: {currentRotation}° {flipH ? '• FLIP-H ' : ''}{flipV ? '• FLIP-V ' : ''}• ZOOM: {zoom.toFixed(1)}x
                  </div>
                </div>

                {/* Guide hint at bottom center */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900/70 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 px-3 py-1 rounded-full shadow select-none flex items-center gap-2">
                  {selectionBox ? (
                    <span>Zona señalada • Haz clic para reubicarla</span>
                  ) : (
                    <span>Haz clic y arrastra para señalar una zona</span>
                  )}
                  {sequenceSnaps.length > 0 && (
                    <span className="font-bold text-amber-300 border-l border-slate-600 pl-2">
                      Secuencia activa: {sequenceSnaps.length} fotos
                    </span>
                  )}
                </div>

                {/* Rotated, Flipped & Zoomed Video Element - Fits Maximum Vertical Space without Stretching */}
                <div 
                  className="relative transition-transform duration-150 flex items-center justify-center w-full h-full pointer-events-none"
                  style={{
                    transform: `rotate(${currentRotation}deg) scale(${zoom}) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                >
                  <img 
                    ref={imgRef}
                    crossOrigin="anonymous"
                    src={streamUrl} 
                    alt="Stream Otoscopio" 
                    className="max-w-full max-h-full object-contain rounded select-none"
                    onError={() => setIsConnected(false)}
                  />
                </div>

                {/* Interactive Bounding Box Quadrilateral Overlay */}
                {selectionBox && (
                  <div
                    className="absolute pointer-events-none border-2 border-amber-400 bg-amber-400/15 shadow-[0_0_15px_rgba(245,158,11,0.35)] z-10 transition-all duration-75"
                    style={{
                      left: `${selectionBox.x}px`,
                      top: `${selectionBox.y}px`,
                      width: `${selectionBox.width}px`,
                      height: `${selectionBox.height}px`,
                    }}
                  >
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-200"></div>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-200"></div>
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-200"></div>
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-200"></div>
                    <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded shadow">
                      ZONA
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center max-w-lg space-y-4 cursor-default">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-xl">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Esperando conexión del Otoscopio</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Asegúrate de que el otoscopio esté encendido y tu PC conectada a su red Wi-Fi:
                </p>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-sky-400 text-sm">1.</span>
                    <span>Enciende el otoscopio NE3 manteniendo presionado el botón.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-sky-400 text-sm">2.</span>
                    <span>En Windows, conecta el Wi-Fi a <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded">HNDEC_55-94E0D0</strong>.</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetch('http://127.0.0.1:8765/api/otoscopio/reconnect', { method: 'POST' }).catch(() => {});
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reconectar Señal
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Controls and UI Sidebar */}
          <div className="w-80 lg:w-88 bg-slate-900/95 border-l border-slate-800 flex flex-col justify-between p-4 overflow-y-auto select-none shrink-0 custom-scrollbar gap-4">
            
            <div className="space-y-4">
              {/* Capture Actions Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Acciones de Captura
                </span>
                
                {/* Single Capture button */}
                <button
                  onClick={handleCaptureSingle}
                  disabled={!isConnected}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Imagen</span>
                </button>

                {/* Multiple Sequence Capture Button */}
                <button
                  onClick={handleAddToSequence}
                  disabled={!isConnected}
                  title="Añadir toma actual a la secuencia multipanel"
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Layers className="w-4 h-4 text-amber-200" />
                  <span>Capturar Múltiples {sequenceSnaps.length > 0 ? `(${sequenceSnaps.length})` : ''}</span>
                </button>

                {/* Export Button (appears when sequence has items) */}
                {sequenceSnaps.length > 0 && (
                  <button
                    onClick={handleGenerateSequenceComposite}
                    className="w-full px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-fadeIn border border-sky-400/40"
                    title="Generar y guardar collage con todas las fotos tomadas"
                  >
                    <FileDown className="w-4 h-4 text-sky-200" />
                    <span>Exportar ({sequenceSnaps.length})</span>
                  </button>
                )}
              </div>

              {/* Adjustments Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Ajustes de Imagen
                </span>

                {/* Rotate Button (Manual Only) */}
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title="Girar imagen 90 grados"
                  className="w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-xl text-slate-200 transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
                >
                  <RotateCw className="w-4 h-4 text-sky-400" />
                  <span>Girar 90° ({rotation}°)</span>
                </button>

                {/* Invert H and Invert V */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFlipH(!flipH)}
                    title="Invertir horizontalmente (Modo Espejo)"
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-sm ${
                      flipH 
                        ? 'bg-sky-600/30 border-sky-400 text-sky-200' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4 text-sky-400" />
                    <span>Invertir H</span>
                  </button>

                  <button
                    onClick={() => setFlipV(!flipV)}
                    title="Invertir verticalmente"
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-sm ${
                      flipV 
                        ? 'bg-sky-600/30 border-sky-400 text-sky-200' 
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4 text-sky-400" />
                    <span>Invertir V</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-between bg-slate-800 rounded-xl p-1.5 border border-slate-700 shadow-sm">
                  <button
                    onClick={() => setZoom(z => Math.max(z - 0.25, 1))}
                    disabled={zoom <= 1}
                    title="Alejar"
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-slate-100">Zoom: {zoom.toFixed(1)}x</span>
                  <button
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    disabled={zoom >= 3}
                    title="Acercar"
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Clear Selection Box Button */}
                {selectionBox && (
                  <button
                    onClick={() => setSelectionBox(null)}
                    title="Quitar zona marcada"
                    className="w-full px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-amber-300 hover:text-rose-300 border border-amber-500/40 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar Zona Marcada</span>
                  </button>
                )}
              </div>

              {/* Active Sequence Snaps List */}
              {sequenceSnaps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      Secuencia ({sequenceSnaps.length})
                    </span>
                    <button
                      onClick={() => setSequenceSnaps([])}
                      className="text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1 bg-slate-950/50 rounded-xl border border-slate-800">
                    {sequenceSnaps.map((snap, i) => (
                      <div key={snap.id} className="relative group rounded overflow-hidden border border-slate-700">
                        <img src={snap.dataUrl} alt={`Snap ${i + 1}`} className="w-full h-12 object-cover" />
                        <span className="absolute bottom-0 left-0 bg-black/80 text-[8px] font-mono text-emerald-400 font-bold px-1 rounded-bl">
                          #{i + 1}
                        </span>
                        <button
                          onClick={() => setSequenceSnaps(prev => prev.filter(s => s.id !== snap.id))}
                          className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow cursor-pointer transition-all"
                          title="Eliminar este snap"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Preview if single captured */}
            {capturedImage && (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2 animate-fadeIn shrink-0">
                <div className="flex items-center gap-2">
                  <img src={capturedImage} alt="Captura" className="w-14 h-10 object-cover rounded border border-slate-700 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-200 truncate">Foto Capturada</p>
                    <p className="text-[10px] text-emerald-400">Listo para ficha</p>
                  </div>
                  <button 
                    onClick={() => setCapturedImage(null)}
                    className="text-slate-400 hover:text-white p-1"
                    title="Descartar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-2 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copySuccess ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
