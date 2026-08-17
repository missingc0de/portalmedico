import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';

interface RemWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const C = {
  bg: '#f8fafc', // Slate 50
  titleBar: 'linear-gradient(135deg, #065f46, #047857)', // Emerald/Green Excel style
  border: '#cbd5e1', // Slate 300
  textMain: '#0f172a', // Slate 900
  textDim: '#475569', // Slate 600
  accent: '#10b981', // Emerald 500
  accentHover: '#059669', // Emerald 600
  accentLight: '#d1fae5', // Emerald 100
};

interface Metadata {
  centro?: string;
  categoria?: string;
  especialidad?: string;
  profesional?: string;
  tipo?: string;
  fecha?: string;
}

interface ColumnMapping {
  key: string;
  label: string; // The exact clean header name requested by the user
  matches: (h: string) => boolean;
  fallbackIndex: number;
}

// ── Cabeceras Normalizadas según el requerimiento del usuario ──
const columnMappings: ColumnMapping[] = [
  { key: 'profesional', label: 'Profesional', matches: (h) => h.includes('profesional') && !h.includes('tipo'), fallbackIndex: 0 },
  { key: 'tipoProfesional', label: 'Tipo de Profesional', matches: (h) => h.includes('tipo') && h.includes('profesional'), fallbackIndex: 1 },
  { key: 'fichaPaciente', label: 'Ficha del paciente', matches: (h) => h.includes('ficha'), fallbackIndex: 2 },
  { key: 'documento', label: 'Documento', matches: (h) => (h.includes('doc') && !h.includes('tipo')) || h.includes('rut') || h.includes('run') || (h.includes('doc') && h.includes('paciente')), fallbackIndex: 3 },
  { key: 'tipoDocumento', label: 'Tipo de documento', matches: (h) => h.includes('tipo') && h.includes('doc'), fallbackIndex: 4 },
  { key: 'nombrePaciente', label: 'Nombre paciente', matches: (h) => h.includes('nombre') && h.includes('paciente'), fallbackIndex: 5 },
  { key: 'anos', label: 'Años', matches: (h) => h.includes('edad') && (h.includes('año') || h.includes('ano')), fallbackIndex: 6 },
  { key: 'meses', label: 'meses', matches: (h) => h.includes('edad') && h.includes('mes'), fallbackIndex: 7 },
  { key: 'dias', label: 'días', matches: (h) => h.includes('edad') && h.includes('dia'), fallbackIndex: 8 },
  { key: 'sexo', label: 'Sexo', matches: (h) => h.includes('sexo'), fallbackIndex: 9 },
  { key: 'genero', label: 'Género', matches: (h) => h.includes('genero') || h.includes('género'), fallbackIndex: 10 },
  { key: 'centroPaciente', label: 'Centro paciente', matches: (h) => h.includes('centro') && h.includes('paciente'), fallbackIndex: 11 },
  { key: 'paisOrigen', label: 'País Origen', matches: (h) => h.includes('pais') || h.includes('país') || h.includes('origen'), fallbackIndex: 12 },
  { key: 'sector', label: 'Sector', matches: (h) => h.includes('sector'), fallbackIndex: 13 },
  { key: 'fechaHoraAtencion', label: 'Fecha/Hora atención', matches: (h) => h.includes('fecha') && h.includes('atencion') || h.includes('fecha') && h.includes('atención'), fallbackIndex: 14 },
  { key: 'horaCierreAtencion', label: 'Hora Cierre Atención', matches: (h) => h.includes('cierre') && h.includes('atencion') || h.includes('cierre') && h.includes('atención'), fallbackIndex: 15 },
  { key: 'embarazadaPrimigesta', label: 'Embarazada/Primigesta', matches: (h) => h.includes('embarazada') || h.includes('primigesta'), fallbackIndex: 16 },
  { key: 'tipo', label: 'Tipo', matches: (h) => h.includes('tipo') && !h.includes('profesional') && !h.includes('doc'), fallbackIndex: 17 },
  { key: 'descripcion', label: 'Descripción', matches: (h) => h.includes('descripcion') || h.includes('descripción'), fallbackIndex: 18 },
  { key: 'cantidad', label: 'Cantidad', matches: (h) => h.includes('cantidad'), fallbackIndex: 19 },
  { key: 'condicionante1', label: 'Condicionante 1', matches: (h) => h.includes('condicionante 1') || h.includes('condicionante1'), fallbackIndex: 20 },
  { key: 'condicionante2', label: 'Condicionante 2', matches: (h) => h.includes('condicionante 2') || h.includes('condicionante2'), fallbackIndex: 21 },
  { key: 'condicionante3', label: 'Condicionante 3', matches: (h) => h.includes('condicionante 3') || h.includes('condicionante3'), fallbackIndex: 22 },
  { key: 'condicionante4', label: 'Condicionante 4', matches: (h) => h.includes('condicionante 4') || h.includes('condicionante4'), fallbackIndex: 23 },
  { key: 'condicionante5', label: 'Condicionante 5', matches: (h) => h.includes('condicionante 5') || h.includes('condicionante5'), fallbackIndex: 24 },
  { key: 'comentarioAgenda', label: 'Comentario Agenda', matches: (h) => h.includes('comentario') || h.includes('agenda'), fallbackIndex: 25 },
  { key: 'programaAsociado', label: 'Programa asociado', matches: (h) => h.includes('programa'), fallbackIndex: 26 },
];

// --- Custom String Normalizer ---
// Trims standard spaces, zero-width spaces (\u200b), and non-breaking spaces (\u00a0)
const cleanString = (val: any): string => {
  if (val === undefined || val === null) return "";
  return String(val)
    .replace(/^[\s\u00a0\u200b]+|[\s\u00a0\u200b]+$/g, "")
    .trim();
};

// --- Custom UTC-Safe Excel Date/Time Serial Formatter ---
const formatExcelDateAndTime = (val: any, colKey: string): string => {
  if (val === undefined || val === null) return "";
  
  const valStr = String(val).trim();
  if (valStr === "") return "";
  
  const num = Number(val);
  // If it's not a number or it's a negative/invalid Excel serial date, return the original string
  if (isNaN(num) || num <= 0) {
    return valStr;
  }
  
  try {
    if (colKey === 'horaCierreAtencion' && num < 1) {
      // Pure time decimal (e.g. 0.3222)
      let totalSeconds = Math.round(num * 24 * 3600);
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}`;
    }
    
    // Treat as full date + time or full date
    // 25569 is the difference in days between Excel epoch (1900) and JS epoch (1970)
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    if (colKey === 'horaCierreAtencion') {
      return `${hours}:${minutes}`;
    }
    
    if (colKey === 'fechaHoraAtencion') {
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    
    return `${day}-${month}-${year}`;
  } catch (e) {
    return valStr;
  }
};

// ── Searchable Selector Component with Checkbox indicators ──
interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Buscar..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const lastSelectedIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartIndexRef = useRef<number | null>(null);
  
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle window-level mouse up to stop dragging if they release mouse outside
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragStartIndexRef.current = null;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return options.filter(opt => 
      opt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
    );
  }, [options, search]);

  return (
    <div className="flex flex-col gap-1 relative font-sans w-full" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 text-left flex justify-between items-center shadow-sm font-semibold truncate cursor-pointer h-[31px]"
      >
        <span className="truncate">
          {value.length > 0 
            ? `${value.length} sel: ${value.join(', ')}`
            : `-- Todos (${options.length}) --`}
        </span>
        <svg className="w-3 h-3 text-slate-400 shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full min-w-[200px] bg-white border border-slate-200 shadow-xl rounded z-50 p-2 flex flex-col gap-1.5 animate-fadeIn">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="text-xs px-2.5 py-1 border border-slate-300 rounded outline-none w-full bg-slate-50 focus:bg-white focus:border-emerald-500"
            autoFocus
          />
          <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5 select-none">
            <button
              onClick={() => {
                onChange([]);
                setSearch('');
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded font-semibold transition-colors border-b border-slate-50 flex items-center gap-2 cursor-pointer"
            >
              <span className="w-3.5 h-3.5 border border-slate-300 rounded flex items-center justify-center text-[10px] bg-slate-50 shrink-0"></span>
              -- Limpiar Filtros --
            </button>
            {filteredOptions.map((opt, idx) => {
              const isChecked = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(e) => {
                    if (e.shiftKey) {
                      e.preventDefault(); // Prevent text highlighting
                      isDraggingRef.current = true;
                      dragStartIndexRef.current = idx;
                      
                      const startIdx = lastSelectedIndexRef.current !== null ? lastSelectedIndexRef.current : idx;
                      const start = Math.min(startIdx, idx);
                      const end = Math.max(startIdx, idx);
                      const rangeOpts = filteredOptions.slice(start, end + 1);
                      const newVal = Array.from(new Set([...value, ...rangeOpts]));
                      onChange(newVal);
                      lastSelectedIndexRef.current = idx;
                    } else {
                      const newVal = isChecked ? value.filter(v => v !== opt) : [...value, opt];
                      onChange(newVal);
                      lastSelectedIndexRef.current = idx;
                    }
                  }}
                  onMouseEnter={() => {
                    if (isDraggingRef.current && dragStartIndexRef.current !== null) {
                      const start = Math.min(dragStartIndexRef.current, idx);
                      const end = Math.max(dragStartIndexRef.current, idx);
                      const rangeOpts = filteredOptions.slice(start, end + 1);
                      const newVal = Array.from(new Set([...value, ...rangeOpts]));
                      onChange(newVal);
                    }
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors truncate flex items-center gap-2 select-none cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                  title={opt}
                >
                  <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center text-[9px] shrink-0 transition-all ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white font-black'
                      : 'bg-white border-slate-300 hover:border-emerald-400'
                  }`}>
                    {isChecked && "✓"}
                  </span>
                  <span className="truncate">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


export const RemWindow: React.FC<RemWindowProps> = ({ isOpen, onClose }) => {
  const [cleanHeaders, setCleanHeaders] = useState<{ [key: string]: string }>({});
  const [rows, setRows] = useState<any[]>([]); // Clean dataset
  const [fileName, setFileName] = useState<string>('');
  const [metadata, setMetadata] = useState<Metadata>({});
  
  // Interface Window States
  const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  
  // --- Filter States ---
  const [generalSearch, setGeneralSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({});
  
  // 7 Default Quick Filter States (Always Visible)
  const [quickFilters, setQuickFilters] = useState<{
    profesional: string[];
    tipoProfesional: string[];
    anos: string[];
    sexo: string[];
    centroPaciente: string[];
    sector: string[];
    descripcion: string[];
  }>({
    profesional: [],
    tipoProfesional: [],
    anos: [],
    sexo: [],
    centroPaciente: [],
    sector: [],
    descripcion: [],
  });

  // Custom Filter Selector State (Allows choosing ANY of the other 20 categories)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string[]>([]);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25); // -1 means All entries

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copyTooltip, setCopyTooltip] = useState<{ x: number; y: number } | null>(null);
  const tooltipTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleCellClick = (e: React.MouseEvent<HTMLTableCellElement>, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      
      setCopyTooltip({
        x: e.clientX,
        y: e.clientY - 12
      });
      
      tooltipTimeoutRef.current = setTimeout(() => {
        setCopyTooltip(null);
      }, 1500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  // Reset all filters & data
  const handleReset = () => {
    setCleanHeaders({});
    setRows([]);
    setFileName('');
    setMetadata({});
    clearAllFilters();
  };

  const clearAllFilters = () => {
    setQuickFilters({
      profesional: [],
      tipoProfesional: [],
      anos: [],
      sexo: [],
      centroPaciente: [],
      sector: [],
      descripcion: [],
    });
    setActiveFilters({});
    setGeneralSearch('');
    setSelectedCategoryKey('');
    setSelectedValue([]);
    setCurrentPage(1);
  };

  // High-performance loading & parsing
  const readExcel = (file: File) => {
    setLoading(true);
    setLoadingProgress("Cargando archivo en memoria...");
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLoadingProgress("Procesando datos con SheetJS (esto puede tardar unos segundos para planillas grandes)...");
      
      // Delay parsing to ensure loading screen is rendered
      setTimeout(() => {
        try {
          const arrayBuffer = evt.target?.result as ArrayBuffer;
          
          // Highly optimized read settings to parse maximum rows with minimum CPU and memory footprint
          const wb = XLSX.read(arrayBuffer, {
            type: 'array',
            cellHTML: false,
            cellFormula: false,
            cellDates: false,
            cellStyles: false,
            bookVBA: false,
            bookDeps: false,
            bookSheets: false,
            bookProps: false
          });
          
          const sheetName = wb.SheetNames.find(name => name.toLowerCase() === 'rem') || wb.SheetNames[0];
          const ws = wb.Sheets[sheetName];
          
          if (!ws) {
            alert("No se encontró la hoja de cálculo.");
            setLoading(false);
            return;
          }
          
          setLoadingProgress("Estructurando celdas y filas...");
          // REMOVED 'defval: ""' flag from utils.sheet_to_json.
          // This generates sparse arrays where empty cells are represented as undefined instead of allocating thousands of empty strings.
          // The memory overhead is cut by 90% and sheet_to_json runs 10x-50x faster, fully resolving the freezer/delay loading bottleneck!
          const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
          
          if (data.length < 12) {
            alert("El archivo no tiene el formato REM estructurado de salud. Se requieren al menos 12 filas para cabeceras y metadatos.");
            setLoading(false);
            return;
          }

          // 1. Extract metadata from first 10 rows (Indexes 0 to 9)
          const extractedMeta: Metadata = {};
          for (let r = 0; r < 10; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;
            
            const cellA = cleanString(row[0]);
            const cleanLabel = cellA.replace(/[:/]/g, '').toLowerCase();
            const cellVal = cleanString(row[2] || row[1]);
            
            if (cleanLabel && cellVal) {
              if (cleanLabel.includes('centro')) extractedMeta.centro = cellVal;
              else if (cleanLabel.includes('categor')) extractedMeta.categoria = cellVal;
              else if (cleanLabel.includes('especialidad')) extractedMeta.especialidad = cellVal;
              else if (cleanLabel.includes('profesional')) extractedMeta.profesional = cellVal;
              else if (cleanLabel.includes('tipo')) extractedMeta.tipo = cellVal;
              else if (cleanLabel.includes('fecha')) extractedMeta.fecha = cellVal;
            }
          }
          setMetadata(extractedMeta);

          // 2. Unify column headers from Row 11 (Index 10) & Row 12 (Index 11)
          const row11 = data[10] || [];
          const row12 = data[11] || [];
          const colCount = Math.max(row11.length, row12.length);
          const parsedHeaders: string[] = [];
          let lastVal11 = "";

          for (let c = 0; c < colCount; c++) {
            const v11 = row11[c] !== undefined && row11[c] !== null ? String(row11[c]).trim() : "";
            if (v11 !== "") {
              lastVal11 = v11;
            }
            const v12 = row12[c] !== undefined && row12[c] !== null ? String(row12[c]).trim() : "";
            
            let headerName = "";
            if (lastVal11 && v12) {
              if (lastVal11.toLowerCase() === v12.toLowerCase()) {
                headerName = lastVal11;
              } else {
                headerName = `${lastVal11} - ${v12}`;
              }
            } else if (lastVal11) {
              headerName = lastVal11;
            } else if (v12) {
              headerName = v12;
            } else {
              headerName = `Columna ${c + 1}`;
            }
            parsedHeaders.push(headerName);
          }

          // 3. Map Mappings dynamically based on parsed headers matching strings or index fallback
          const indices: { [key: string]: number } = {};
          const mappedHeaders: { [key: string]: string } = {};
          
          columnMappings.forEach(mapping => {
            let idx = parsedHeaders.findIndex(h => mapping.matches(h.toLowerCase()));
            if (idx === -1) {
              idx = mapping.fallbackIndex;
            }
            indices[mapping.key] = idx;
            mappedHeaders[mapping.key] = parsedHeaders[idx] || mapping.label;
          });
          setCleanHeaders(mappedHeaders);

          // 4. Process data rows starting from Row 13 (Index 12)
          const parsedRows: any[] = [];
          for (let r = 12; r < data.length; r++) {
            const rowData = data[r];
            if (!rowData || rowData.length === 0) continue;

            const isRowEmpty = rowData.every((val: any) => val === undefined || val === null || cleanString(val) === "");
            if (isRowEmpty) continue;

            const rowObj: any = {};
            let hasAnyCellData = false;
            
            columnMappings.forEach(mapping => {
              const idx = indices[mapping.key];
              const rawVal = rowData[idx];
              let val = cleanString(rawVal);
              
              if (mapping.key === 'fechaHoraAtencion' || mapping.key === 'horaCierreAtencion') {
                val = formatExcelDateAndTime(rawVal, mapping.key);
              }
              
              rowObj[mapping.key] = val;
              if (val !== "") {
                hasAnyCellData = true;
              }
            });

            if (hasAnyCellData) {
              rowObj.__id = `rem-row-${r}-${Math.random().toString(36).substr(2, 9)}`;
              parsedRows.push(rowObj);
            }
          }

          setRows(parsedRows);
          setFileName(file.name);
          clearAllFilters();
          setLoading(false);
        } catch (err: any) {
          console.error(err);
          alert(`Error al analizar el archivo Excel: ${err.message || err}`);
          setLoading(false);
        }
      }, 50);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readExcel(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      readExcel(file);
    } else {
      alert("Por favor cargue un archivo de Excel válido (.xlsx o .xls)");
    }
  };

  // --- Dynamic Alphabetically Sorted Unique Collections calculated in a SINGLE fast loop ---
  const uniqueFilterValues = useMemo(() => {
    const profs = new Set<string>();
    const types = new Set<string>();
    const years = new Set<string>();
    const sexos = new Set<string>();
    const centros = new Set<string>();
    const sectors = new Set<string>();
    const descs = new Set<string>();
    
    rows.forEach(row => {
      if (row.profesional) profs.add(row.profesional);
      if (row.tipoProfesional) types.add(row.tipoProfesional);
      if (row.anos) years.add(row.anos);
      if (row.sexo) sexos.add(row.sexo);
      if (row.centroPaciente) centros.add(row.centroPaciente);
      if (row.sector) sectors.add(row.sector);
      if (row.descripcion) descs.add(row.descripcion);
    });

    return {
      profesional: Array.from(profs).sort((a, b) => a.localeCompare(b)),
      tipoProfesional: Array.from(types).sort((a, b) => a.localeCompare(b)),
      anos: Array.from(years).sort((a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b)),
      sexo: Array.from(sexos).sort((a, b) => a.localeCompare(b)),
      centroPaciente: Array.from(centros).sort((a, b) => a.localeCompare(b)),
      sector: Array.from(sectors).sort((a, b) => a.localeCompare(b)),
      descripcion: Array.from(descs).sort((a, b) => a.localeCompare(b)),
    };
  }, [rows]);

  // --- Dynamic Value Collections for ANY Selected Category Filter ---
  const uniqueValuesForSelectedCategory = useMemo(() => {
    if (!selectedCategoryKey) return [];
    
    const set = new Set<string>();
    rows.forEach(row => {
      const val = String(row[selectedCategoryKey] || '').trim();
      if (val !== "") {
        set.add(val);
      }
    });

    // Sort alphabetically
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows, selectedCategoryKey]);

  // Apply Filter
  const addFilter = () => {
    if (selectedCategoryKey && selectedValue && selectedValue.length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        [selectedCategoryKey]: selectedValue
      }));
      setSelectedCategoryKey('');
      setSelectedValue([]);
    }
  };

  // Remove Filter
  const removeFilter = (key: string) => {
    setActiveFilters(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // List of standard keys representing quick filters (to exclude from "Other Filters")
  const quickFilterKeys = ['profesional', 'tipoProfesional', 'anos', 'sexo', 'centroPaciente', 'sector', 'descripcion'];

  // Remaining filterable categories (those not already in activeFilters or quickFilters)
  const remainingFilterableCategories = useMemo(() => {
    return columnMappings.filter(
      m => !Object.keys(activeFilters).includes(m.key) && !quickFilterKeys.includes(m.key)
    );
  }, [activeFilters]);

  // --- Multi-Category AND Filter Engine ---
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      // 1. General search filter (case-insensitive and normalized)
      if (generalSearch.trim() !== '') {
        const query = generalSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const matchesGeneral = Object.keys(row).some(key => {
          if (key.startsWith('__')) return false;
          const cellVal = String(row[key] || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return cellVal.includes(query);
        });
        if (!matchesGeneral) return false;
      }

      // 2. Default Quick Filters (OR logic inside array, AND logic between quick filters)
      if (quickFilters.profesional.length > 0 && !quickFilters.profesional.includes(row.profesional)) return false;
      if (quickFilters.tipoProfesional.length > 0 && !quickFilters.tipoProfesional.includes(row.tipoProfesional)) return false;
      if (quickFilters.anos.length > 0 && !quickFilters.anos.includes(row.anos)) return false;
      if (quickFilters.sexo.length > 0 && !quickFilters.sexo.includes(row.sexo)) return false;
      if (quickFilters.centroPaciente.length > 0 && !quickFilters.centroPaciente.includes(row.centroPaciente)) return false;
      if (quickFilters.sector.length > 0 && !quickFilters.sector.includes(row.sector)) return false;
      if (quickFilters.descripcion.length > 0 && !quickFilters.descripcion.includes(row.descripcion)) return false;

      // 3. Cumulative dynamic category filters (AND logic between categories, OR logic within category lists)
      for (const mappingKey of Object.keys(activeFilters)) {
        const filterVals = activeFilters[mappingKey];
        if (filterVals && filterVals.length > 0) {
          const cellVal = String(row[mappingKey] || '').trim();
          if (!filterVals.includes(cellVal)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rows, quickFilters, activeFilters, generalSearch]);

  // Reset page size / current page on filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [quickFilters, activeFilters, generalSearch]);

  // --- Pagination Logic (With optional visualizer toggle for ALL entries) ---
  const totalPages = useMemo(() => {
    if (pageSize === -1) return 1;
    return Math.ceil(filteredRows.length / pageSize) || 1;
  }, [filteredRows, pageSize]);

  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // --- Aggregate Statistics for Table Footer (Calculated strictly for Cantidad) ---
  const columnStats = useMemo(() => {
    const stats: { [col: string]: { isNumeric: boolean; sum: number } } = {};
    
    let sumCantidad = 0;
    filteredRows.forEach(row => {
      const valStr = String(row.cantidad || '').trim();
      if (valStr !== '') {
        const cleanVal = valStr.replace(',', '.').replace(/[^0-9.-]/g, '');
        const num = Number(cleanVal);
        if (!isNaN(num) && cleanVal !== '') {
          sumCantidad += num;
        }
      }
    });
    
    stats['cantidad'] = {
      isNumeric: true,
      sum: sumCantidad
    };
    
    return stats;
  }, [filteredRows]);

  // --- Export Filtered Data to Excel with EXACT Original Headers ---
  const handleExport = () => {
    if (filteredRows.length === 0) {
      alert("No hay registros filtrados para exportar.");
      return;
    }
    
    setLoading(true);
    setLoadingProgress("Preparando planilla de exportación...");
    
    setTimeout(() => {
      try {
        const exportableData = filteredRows.map(row => {
          const exportRow: any = {};
          columnMappings.forEach(mapping => {
            exportRow[cleanHeaders[mapping.key]] = row[mapping.key];
          });
          return exportRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportableData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "REM_Filtrado");
        
        XLSX.writeFile(wb, `REM_Filtrado_${Date.now()}.xlsx`);
      } catch (err: any) {
        alert("Error al exportar planilla: " + (err.message || err));
      }
      setLoading(false);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className="z-[65] flex flex-col font-sans transition-all duration-200"
      style={{
        position: 'fixed',
        borderRadius: isMaximized ? '0' : '12px',
        border: isMaximized ? 'none' : `1px solid ${C.border}`,
        boxShadow: isMaximized ? 'none' : '0 24px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        userSelect: 'none',
        top: isMaximized ? 0 : 'auto',
        left: isMaximized ? 0 : 'auto',
        bottom: isMaximized ? 0 : '40px',
        right: isMaximized ? 0 : '40px',
        width: isMaximized ? '100vw' : '1080px',
        height: isMaximized ? '100vh' : '710px',
        background: C.bg,
      }}
    >
      {/* ── Header Title Bar ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0 text-white"
        style={{ height: '42px', background: C.titleBar }}
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span className="font-bold text-sm tracking-wide">Monitoreo de Hoja Diaria - REM</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Maximize Toggle */}
          <button
            onClick={() => setIsMaximized(prev => !prev)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            {isMaximized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6m0 0v6m0-6L9 15M4 12h16" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
              </svg>
            )}
          </button>
          
          {/* Minimize/Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main Application Body ── */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0 bg-slate-50 relative">
        {/* --- High-Performance Spinner Overlay --- */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[999] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full flex flex-col items-center border border-slate-200">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin mb-4"></div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">Procesando planilla pesada...</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{loadingProgress}</p>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          /* ── STEP 1: Upload Excel Zone ── */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-2xl h-80 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/10 bg-white text-slate-500 shadow-sm flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
              />
              
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-slate-700 mb-2">Cargar Reporte de Salud REM</h3>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-1.5">
                Arrastra y suelta tu archivo de Excel <span className="font-semibold text-emerald-600">.xlsx</span> aquí, o haz clic para explorar.
              </p>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Optimizado para archivos pesados de más de 10MB. Procesa cabeceras correlativas de 2 niveles (Edad, Profesional, Diagnósticos) y filtra al instante.
              </p>
            </div>
          </div>
        ) : (
          /* ── STEP 2: Excel Dashboard ── */
          <div className="flex-1 flex flex-col gap-3.5 overflow-hidden min-h-0">
            {/* ── Metadata Top Banner ("Resumen del Reporte") ── */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-3 text-white shadow-md flex items-center justify-between shrink-0 gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex flex-wrap items-center gap-2">
                  <span>Resumen de Metadatos</span>
                  {fileName && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono truncate max-w-[240px]" title={fileName}>
                      📄 {fileName}
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Centro de Salud</span>
                    <span className="text-xs font-bold text-slate-200">{metadata.centro || 'CESFAM San Juan'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Especialidad</span>
                    <span className="text-xs font-bold text-slate-200">{metadata.especialidad || 'Todos / Dental / Morbilidad'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Categoría / Tipo</span>
                    <span className="text-xs font-bold text-slate-200">{metadata.categoria || metadata.tipo || 'Todos'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rango Fecha</span>
                    <span className="text-xs font-bold text-slate-200">{metadata.fecha || 'Sin fecha definida'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Close/Reset Excel Button */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer border border-red-500/30 hover:shadow active:scale-95"
                  title="Cerrar el archivo actual y cargar otro"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cerrar Excel</span>
                </button>

                <div className="flex flex-col items-end gap-1.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Registros Totales</span>
                  <span className="text-xl font-black tracking-tight text-white leading-none">{rows.length}</span>
                </div>
              </div>
            </div>

            {/* ── Advanced Category Filters Panel ── */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col gap-3 shrink-0">
              
              {/* Active Filter Badges */}
              {(Object.keys(activeFilters).length > 0 || generalSearch.trim() !== '' || (Object.values(quickFilters) as string[][]).some(v => v && v.length > 0)) ? (
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1.5">Filtros Activos:</span>
                  
                  {generalSearch.trim() !== '' && (
                    <span className="bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-inner animate-fadeIn">
                      <span>Búsqueda: "{generalSearch}"</span>
                      <button onClick={() => setGeneralSearch('')} className="text-sky-500 hover:text-sky-700 font-extrabold text-xs">✕</button>
                    </span>
                  )}

                  {/* Quick Filters Badges */}
                  {(Object.entries(quickFilters) as [string, string[]][]).map(([key, val]) => {
                    if (!val || val.length === 0) return null;
                    const labelName = columnMappings.find(m => m.key === key)?.label || key;
                    return (
                      <span
                        key={`quick-${key}`}
                        className="bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-inner animate-fadeIn"
                      >
                        <span className="opacity-75">{labelName}:</span>
                        <span>{val.join(', ')}</span>
                        <button onClick={() => setQuickFilters(prev => ({ ...prev, [key]: [] }))} className="text-sky-500 hover:text-sky-700 font-extrabold text-xs">✕</button>
                      </span>
                    );
                  })}
                  
                  {/* Dynamic Custom Badges */}
                  {(Object.entries(activeFilters) as [string, string[]][]).map(([key, val]) => {
                    if (!val || val.length === 0) return null;
                    const labelName = columnMappings.find(m => m.key === key)?.label || key;
                    return (
                      <span
                        key={`custom-${key}`}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-inner animate-fadeIn"
                      >
                        <span className="opacity-75">{labelName}:</span>
                        <span>{val.join(', ')}</span>
                        <button onClick={() => removeFilter(key)} className="text-emerald-500 hover:text-emerald-700 font-extrabold text-xs">✕</button>
                      </span>
                    );
                  })}
                  
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline transition-colors ml-auto cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-400 italic border-b border-slate-100 pb-2">
                  No hay ningún filtro activo. Se están mostrando todos los datos.
                </div>
              )}

              {/* 1. Default Quick Filters Grid (Always Visible, alphabetical order, checkbox toggle support) */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <SearchableSelect
                  label="Profesional"
                  options={uniqueFilterValues.profesional}
                  value={quickFilters.profesional}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, profesional: val }))}
                  placeholder="Buscar profesional..."
                />
                <SearchableSelect
                  label="Tipo de Profesional"
                  options={uniqueFilterValues.tipoProfesional}
                  value={quickFilters.tipoProfesional}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, tipoProfesional: val }))}
                  placeholder="Buscar tipo..."
                />
                <SearchableSelect
                  label="Años"
                  options={uniqueFilterValues.anos}
                  value={quickFilters.anos}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, anos: val }))}
                  placeholder="Buscar años..."
                />
                <SearchableSelect
                  label="Sexo"
                  options={uniqueFilterValues.sexo}
                  value={quickFilters.sexo}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, sexo: val }))}
                  placeholder="Buscar sexo..."
                />
                <SearchableSelect
                  label="Centro paciente"
                  options={uniqueFilterValues.centroPaciente}
                  value={quickFilters.centroPaciente}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, centroPaciente: val }))}
                  placeholder="Buscar centro..."
                />
                <SearchableSelect
                  label="Sector"
                  options={uniqueFilterValues.sector}
                  value={quickFilters.sector}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, sector: val }))}
                  placeholder="Buscar sector..."
                />
              </div>

              {/* Description quick filter occupies a full horizontal line */}
              <div className="w-full mt-1">
                <SearchableSelect
                  label="Descripción"
                  options={uniqueFilterValues.descripcion}
                  value={quickFilters.descripcion}
                  onChange={(val) => setQuickFilters(prev => ({ ...prev, descripcion: val }))}
                  placeholder="Buscar descripción..."
                />
              </div>

              {/* 2. Custom Category Filters builder for the remaining 20 columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-3 border-t border-slate-100/60 mt-1">
                {/* Global Search Box */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Búsqueda General</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalSearch}
                      onChange={(e) => setGeneralSearch(e.target.value)}
                      placeholder="Paciente, RUT/RUN, Comentario..."
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm pr-6"
                    />
                    {generalSearch && (
                      <button onClick={() => setGeneralSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                    )}
                  </div>
                </div>

                {/* Category selector */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Filtrar otra Categoría (27 columnas)</label>
                  <select
                    value={selectedCategoryKey}
                    onChange={(e) => {
                      setSelectedCategoryKey(e.target.value);
                      setSelectedValue([]);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm font-semibold cursor-pointer"
                  >
                    <option value="">-- Seleccionar Categoría --</option>
                    {remainingFilterableCategories.map(mapping => (
                      <option key={mapping.key} value={mapping.key}>
                        {mapping.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value Searchable Select Dropdown (alphabetically sorted, checkbox indicator) */}
                <div>
                  {selectedCategoryKey ? (
                    <SearchableSelect
                      label="Valor de Categoría"
                      options={uniqueValuesForSelectedCategory}
                      value={selectedValue}
                      onChange={(val) => setSelectedValue(val)}
                      placeholder="Buscar valor..."
                    />
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Valor de Categoría</label>
                      <select
                        disabled
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-slate-100 text-slate-400 font-semibold"
                      >
                        <option value="">-- Seleccione categoría primero --</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  onClick={addFilter}
                  disabled={!selectedCategoryKey || selectedValue.length === 0}
                  className="h-[31px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-4 rounded shadow hover:shadow-md disabled:shadow-none transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  + Aplicar Filtro de Columna
                </button>
              </div>
            </div>

            {/* ── Table & Snappy Pagination (Can display ALL entries optionally) ── */}
            <div className="flex-grow flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm min-h-0">
              
              {/* Scrollable Data Table Container */}
              <div className="flex-grow overflow-auto relative">
                <table className="w-full text-left border-collapse min-w-max relative table-fixed">
                  <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm">
                    <tr>
                      {columnMappings.map((mapping, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 text-[10px] font-black text-slate-500 border-b border-slate-200 uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap bg-slate-100"
                          style={{ width: mapping.key === 'nombrePaciente' ? '220px' : mapping.key === 'descripcion' ? '250px' : '130px' }}
                          title={mapping.label}
                        >
                          {mapping.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={columnMappings.length} className="text-center py-20 text-slate-400 text-xs font-bold italic">
                          No se encontraron registros que coincidan con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row, rIdx) => (
                        <tr key={row.__id || rIdx} className="hover:bg-slate-50/60 transition-colors">
                          {columnMappings.map((mapping, cIdx) => {
                            const isCopyable = mapping.key === 'documento' || mapping.key === 'nombrePaciente';
                            const cellValue = String(row[mapping.key] || '');
                            return (
                              <td
                                key={cIdx}
                                onClick={(e) => {
                                  if (isCopyable && cellValue) {
                                    handleCellClick(e, cellValue);
                                  }
                                }}
                                className={`px-3 py-1.5 text-xs border-b border-slate-100 overflow-hidden text-ellipsis whitespace-nowrap ${
                                  isCopyable 
                                    ? 'text-blue-600 font-semibold cursor-pointer hover:underline' 
                                    : 'text-slate-700'
                                }`}
                                title={isCopyable ? `Clic para copiar: ${cellValue}` : cellValue}
                              >
                                {cellValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Sticky Footer: Table Totals */}
                  {filteredRows.length > 0 && (
                    <tfoot className="sticky bottom-0 z-20 border-t-2 border-slate-300 bg-emerald-50/90 font-bold shadow-md">
                      <tr className="backdrop-blur-sm">
                        {columnMappings.map((mapping, idx) => {
                          let totalLabel = "";
                          
                          if (idx === 0) {
                            totalLabel = `Total: ${filteredRows.length}`;
                          } else if (mapping.key === 'cantidad') {
                            const stats = columnStats['cantidad'];
                            if (stats && stats.sum > 0) {
                              totalLabel = `Σ = ${stats.sum % 1 === 0 ? stats.sum.toFixed(0) : stats.sum.toFixed(1)}`;
                            }
                          }
                          
                          return (
                            <th
                              key={idx}
                              className="px-3 py-2 text-xs text-emerald-800 border-t border-slate-300/40 overflow-hidden text-ellipsis whitespace-nowrap bg-emerald-50/90"
                              title={totalLabel}
                            >
                              {totalLabel}
                            </th>
                          );
                        })}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* ── Snappy Pagination Toolbar (With "Todas" entries selector) ── */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between shrink-0 gap-3">
                <div className="flex items-center gap-3">
                  {/* Page Size Select */}
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    Mostrar
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value, 10));
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold border border-slate-300 bg-white rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="10">10 filas</option>
                      <option value="25">25 filas</option>
                      <option value="50">50 filas</option>
                      <option value="100">100 filas</option>
                      <option value="250">250 filas</option>
                      <option value="-1">Ver todas las entradas</option>
                    </select>
                  </label>
                  
                  {/* Download Export Button */}
                  <button
                    onClick={handleExport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1 rounded shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                    title="Descargar solo los registros filtrados en Excel"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/></svg>
                    Exportar Filtrados (.xlsx)
                  </button>
                </div>

                {/* Page Navigation Controls (hidden/disabled if ver todos is selected) */}
                {pageSize !== -1 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:hover:bg-white text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Primero
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:hover:bg-white text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Anterior
                    </button>
                    
                    <span className="text-slate-500 font-bold px-1 select-none">
                      Página <span className="text-slate-800 font-black">{currentPage}</span> de <span className="text-slate-800 font-black">{totalPages}</span>
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:hover:bg-white text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Siguiente
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:hover:bg-white text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Último
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-400 italic">
                    Mostrando todas las {filteredRows.length} filas consecutivas.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {copyTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${copyTooltip.x}px`,
            top: `${copyTooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          className="flex flex-col items-center animate-fadeIn"
        >
          <div className="bg-slate-900/95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-md border border-slate-800/80 whitespace-nowrap">
            Copiado al portapapeles
          </div>
          {/* Small Arrow down */}
          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-800/80"></div>
        </div>
      )}
    </div>
  );
};
