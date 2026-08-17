import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface CalculatorWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Paleta: Tonos Claros y Coherentes con el Messenger ───────────────────────
const C = {
  bg: '#f1f5f9', // Slate 100
  titleBar: '#e2e8f0', // Slate 200
  display: '#ffffff', // White display
  numBtn: '#ffffff', // White number keys
  numHover: '#f1f5f9', // Slate 100 on hover
  numActive: '#e2e8f0', // Slate 200 on click
  opBtn: '#e0f2fe', // Sky 100 (light blue accent)
  opHover: '#bae6fd', // Sky 200
  opActive: '#7dd3fc', // Sky 300
  fnBtn: '#f8fafc', // Slate 50
  fnHover: '#f1f5f9', // Slate 100
  fnActive: '#e2e8f0', // Slate 200
  eqBtn: '#0284c7', // Sky 600 (MSN accent primary blue)
  eqHover: '#0369a1', // Sky 700
  eqActive: '#075985', // Sky 800
  memBtn: '#f1f5f9',
  memHover: '#e2e8f0',
  border: '#cbd5e1', // Slate 300 (thin grey dividers)
  textMain: '#0f172a', // Slate 900
  textDim: '#475569', // Slate 600
  textMem: '#64748b', // Slate 500
};

type CalcOp = '+' | '-' | '×' | '÷' | null;

const CalcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="2" fill="rgba(2,132,199,0.05)" stroke="rgba(71,85,105,0.85)" strokeWidth="1.5" />
    <rect x="6" y="5" width="12" height="4" rx="1" fill="rgba(2,132,199,0.15)" stroke="rgba(71,85,105,0.6)" strokeWidth="0.5" />
    <rect x="6" y="12" width="3" height="3" rx="0.5" fill="rgba(71,85,105,0.6)" />
    <rect x="10" y="12" width="3" height="3" rx="0.5" fill="rgba(71,85,105,0.6)" />
    <rect x="14" y="12" width="4" height="3" rx="0.5" fill="rgba(71,85,105,0.85)" />
    <rect x="6" y="17" width="3" height="3" rx="0.5" fill="rgba(71,85,105,0.6)" />
    <rect x="10" y="17" width="3" height="3" rx="0.5" fill="rgba(71,85,105,0.6)" />
    <rect x="14" y="17" width="4" height="6" rx="0.5" fill="rgba(71,85,105,0.8)" />
  </svg>
);

// ── Reusable button ─────────────────────────────────────────────────────────
interface BtnProps {
  label: React.ReactNode;
  onClick: () => void;
  bg?: string;
  bgHover?: string;
  bgActive?: string;
  textColor?: string;
  wide?: boolean;
  tall?: boolean;
  fontSize?: number;
  title?: string;
}

const Btn: React.FC<BtnProps> = ({
  label, onClick,
  bg = C.numBtn, bgHover = C.numHover, bgActive = C.numActive,
  textColor = C.textMain,
  wide = false, tall = false,
  fontSize = 16,
  title,
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={title}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick(); }}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed ? bgActive : bg,
        color: textColor,
        borderRadius: 4,
        fontSize,
        fontWeight: 400,
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        transition: 'background 0.08s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gridColumn: wide ? 'span 2' : undefined,
        gridRow: tall ? 'span 2' : undefined,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = pressed ? bgActive : bgHover)}
    >
      {label}
    </button>
  );
};

// ── Pediatric Dosing Types & Data (from DosisPediatria.tsx) ──────────────────
interface Formulation {
  type: string;
  concentration: string;
  unit: string;
  calculate: (doseInMg: number, weightInKg: number) => number;
}

interface Drug {
  id: string;
  name: string;
  calculateDosePerAdmin?: (weightInKg: number) => number;
  multiDoseCalculation?: (weightInKg: number) => Record<string, number>;
  frequency: string;
  note?: string;
  formulations: Formulation[];
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange';
}

const drugs: Drug[] = [
  {
    id: 'paracetamol',
    name: 'Paracetamol',
    calculateDosePerAdmin: (weight) => weight * 15,
    frequency: 'Cada 6 hrs',
    color: 'red',
    formulations: [
      { type: 'Gotas', concentration: '100mg/ml', unit: 'gotas', calculate: (dose, weight) => dose / 5 },
      { type: 'Supositorio', concentration: '125mg', unit: 'N° supositorios', calculate: (dose, weight) => dose / 125 },
      { type: 'Jarabe', concentration: '120mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 120) * 5 },
      { type: 'Jarabe', concentration: '250mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 250) * 5 },
      { type: 'Comprimido', concentration: '80mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 80 },
      { type: 'Comprimido', concentration: '500mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 500 },
    ],
  },
  {
    id: 'ibuprofeno',
    name: 'Ibuprofeno',
    calculateDosePerAdmin: (weight) => Math.round(weight * 7.5),
    frequency: 'Cada 6 hrs',
    color: 'blue',
    formulations: [
      { type: 'Gotas', concentration: '100mg/ml', unit: 'gotas', calculate: (dose, weight) => (dose / 100) * 20 },
      { type: 'Supositorio', concentration: '125mg', unit: 'N° supositorios', calculate: (dose, weight) => dose / 125 },
      { type: 'Jarabe', concentration: '100mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 100) * 5 },
      { type: 'Jarabe', concentration: '200mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 200) * 5 },
      { type: 'Comprimido', concentration: '200mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 200 },
      { type: 'Comprimido', concentration: '400mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 400 },
    ],
  },
  {
    id: 'amoxicilina',
    name: 'Amoxicilina (Max 500mg/dosis)',
    calculateDosePerAdmin: (weight) => Math.min(500, (weight * 50) / 3),
    frequency: 'Cada 8 hrs',
    color: 'green',
    formulations: [
      { type: 'Jarabe', concentration: '125mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 125) * 5 },
      { type: 'Jarabe', concentration: '250mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 250) * 5 },
      { type: 'Jarabe', concentration: '500mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 500) * 5 },
      { type: 'Cápsula', concentration: '500mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 500 },
    ],
  },
  {
    id: 'azitromicina',
    name: 'Azitromicina',
    multiDoseCalculation: (weight) => ({
      'Día 1 (10mg/kg)': weight * 10,
      'Días 2-5 (5mg/kg)': weight * 5,
    }),
    frequency: 'Cada 24 hrs por 5 días',
    color: 'orange',
    formulations: [
      { type: 'Solución Oral', concentration: '200mg/5ml', unit: 'ml', calculate: (dose, weight) => (dose / 200) * 5 },
    ],
  },
  {
    id: 'ondansetron',
    name: 'Ondansetrón',
    calculateDosePerAdmin: (weight) => Math.min(8, weight * 0.15),
    frequency: 'Cada 8 hrs',
    note: 'Dosis: 0.15 mg/kg (Máx 8mg/dosis)',
    color: 'purple',
    formulations: [
      { type: 'Ampolla IV', concentration: '4mg/2ml', unit: 'ml', calculate: (dose, weight) => (dose / 4) * 2 },
      { type: 'Comprimido', concentration: '8mg', unit: 'N° comprimidos', calculate: (dose, weight) => dose / 8 },
    ],
  },
];

// ── Main component ──────────────────────────────────────────────────────────
export const CalculatorWindow: React.FC<CalculatorWindowProps> = ({ isOpen, onClose }) => {
  // Mode switcher states
  const [mode, setMode] = useState<'standard' | 'dosis' | 'insulina'>('standard');
  const [showModeMenu, setShowModeMenu] = useState(false);

  // Standard Calculator states
  const [display, setDisplay] = useState('0');
  const [operand, setOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<CalcOp>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState('');

  // Drug Dosage Calculator states
  const [search, setSearch] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [weight, setWeight] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState<'meses' | 'años'>('meses');

  // Insulin Calculator states
  const [insulinWeight, setInsulinWeight] = useState('');
  const [dosePerKg, setDosePerKg] = useState<number>(0.2);
  const [customDose, setCustomDose] = useState('0.2');
  const [isDoubleDose, setIsDoubleDose] = useState(false);

  const currentValue = parseFloat(display) || 0;

  // ── Input digit (Standard) ──────────────────────────────────────────────────
  const inputDigit = useCallback((d: string) => {
    if (waitingForOperand) {
      setDisplay(d === '.' ? '0.' : d);
      setWaitingForOperand(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display === '0' && d !== '.' ? d : display + d);
    }
  }, [display, waitingForOperand]);

  // ── Operator (Standard) ─────────────────────────────────────────────────────
  const handleOperator = useCallback((op: CalcOp) => {
    const val = parseFloat(display);
    if (operator && !waitingForOperand && operand !== null) {
      const result = calculate(operand, val, operator);
      setDisplay(formatResult(result));
      setHistory(`${result} ${op}`);
      setOperand(result);
    } else {
      setOperand(val);
      setHistory(`${val} ${op}`);
    }
    setOperator(op);
    setWaitingForOperand(true);
  }, [display, operator, operand, waitingForOperand]);

  // ── Calculate (Standard) ────────────────────────────────────────────────────
  const calculate = (a: number, b: number, op: CalcOp): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      default: return b;
    }
  };

  const formatResult = (n: number): string => {
    if (isNaN(n)) return 'No puedo dividir por 0';
    if (!isFinite(n)) return 'Desbordamiento';
    const s = parseFloat(n.toPrecision(12)).toString();
    return s;
  };

  // ── Equals (Standard) ───────────────────────────────────────────────────────
  const handleEquals = useCallback(() => {
    const val = parseFloat(display);
    if (operator && operand !== null) {
      const result = calculate(operand, val, operator);
      setHistory(`${operand} ${operator} ${val} =`);
      setDisplay(formatResult(result));
      setOperand(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, operator, operand]);

  // ── Functions (Standard) ────────────────────────────────────────────────────
  const toggleSign = () => setDisplay(d => formatResult(-parseFloat(d)));
  const percent = () => {
    const pct = operand !== null ? (operand * parseFloat(display)) / 100 : parseFloat(display) / 100;
    setDisplay(formatResult(pct));
    setWaitingForOperand(true);
  };
  const reciprocal = () => { const v = parseFloat(display); setDisplay(v !== 0 ? formatResult(1 / v) : 'No puedo dividir por 0'); setWaitingForOperand(true); };
  const square = () => { setDisplay(formatResult(Math.pow(parseFloat(display), 2))); setWaitingForOperand(true); };
  const squareRoot = () => { setDisplay(formatResult(Math.sqrt(parseFloat(display)))); setWaitingForOperand(true); };
  const clearEntry = () => setDisplay('0');
  const clearAll = () => { setDisplay('0'); setOperand(null); setOperator(null); setWaitingForOperand(false); setHistory(''); };
  const backspace = () => {
    if (waitingForOperand) return;
    const s = display.slice(0, -1);
    setDisplay(s === '' || s === '-' ? '0' : s);
  };

  // ── Memory (Standard) ───────────────────────────────────────────────────────
  const memClear = () => setMemory(0);
  const memRecall = () => { setDisplay(formatResult(memory)); setWaitingForOperand(true); };
  const memAdd = () => setMemory(m => m + currentValue);
  const memSub = () => setMemory(m => m - currentValue);
  const memStore = () => setMemory(currentValue);

  // ── Keyboard support ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || mode !== 'standard') return;
    const handler = (e: KeyboardEvent) => {
      if ('0123456789.'.includes(e.key)) { inputDigit(e.key); return; }
      if (e.key === '+') { handleOperator('+'); return; }
      if (e.key === '-') { handleOperator('-'); return; }
      if (e.key === '*') { handleOperator('×'); return; }
      if (e.key === '/') { e.preventDefault(); handleOperator('÷'); return; }
      if (e.key === 'Enter' || e.key === '=') { handleEquals(); return; }
      if (e.key === 'Backspace') { backspace(); return; }
      if (e.key === 'Escape') { clearAll(); return; }
      if (e.key === 'Delete') { clearEntry(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, mode, inputDigit, handleOperator, handleEquals]);

  // Click outside to close mode menu
  useEffect(() => {
    if (!showModeMenu) return;
    const hide = () => setShowModeMenu(false);
    window.addEventListener('click', hide);
    return () => window.removeEventListener('click', hide);
  }, [showModeMenu]);

  // ── Drug Dosage Computations ────────────────────────────────────────────────
  const filteredDrugs = useMemo(() => {
    if (!search) return drugs;
    const query = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return drugs.filter(d =>
      d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)
    );
  }, [search]);

  const weightNum = parseFloat(weight) || 0;

  const ageInMonths = useMemo(() => {
    const num = parseFloat(age);
    if (isNaN(num) || num <= 0) return null;
    return ageUnit === 'años' ? num * 12 : num;
  }, [age, ageUnit]);

  const ageWarning = useMemo(() => {
    if (ageInMonths === null || !selectedDrug) return null;
    
    if (selectedDrug.id === 'ibuprofeno' && ageInMonths < 6) {
      return {
        type: 'danger',
        message: '⚠️ CONTRAINDICACIÓN: El Ibuprofeno no está recomendado en lactantes menores de 6 meses.'
      };
    }
    
    if (selectedDrug.id === 'ondansetron' && ageInMonths < 24) {
      return {
        type: 'warning',
        message: '⚠️ PRECAUCIÓN: Ondansetrón no se recomienda de rutina en menores de 2 años (24 meses) en APS sin indicación del especialista.'
      };
    }
    
    if (selectedDrug.id === 'amoxicilina' && ageInMonths < 1) {
      return {
        type: 'warning',
        message: '⚠️ PRECAUCIÓN CRÍTICA: Paciente menor de 1 mes (neonato). Se sugiere evaluar derivación o consultar dosificación con especialista.'
      };
    }
    
    return null;
  }, [selectedDrug, ageInMonths]);

  const singleDoseResults = useMemo(() => {
    if (!selectedDrug || weightNum <= 0 || !selectedDrug.calculateDosePerAdmin) return null;
    const dosePerAdmin = selectedDrug.calculateDosePerAdmin(weightNum);
    const formulations = selectedDrug.formulations.map(form => {
      const calculatedValue = form.calculate(dosePerAdmin, weightNum);
      const isDrops = form.unit === 'gotas';
      const resultString = isDrops ? Math.round(calculatedValue).toString() : calculatedValue.toFixed(1);
      return { ...form, result: resultString };
    });
    return { dosePerAdmin: dosePerAdmin.toFixed(1), formulations };
  }, [selectedDrug, weightNum]);

  const multiDoseResults = useMemo(() => {
    if (!selectedDrug || weightNum <= 0 || !selectedDrug.multiDoseCalculation) return null;
    const doses = selectedDrug.multiDoseCalculation(weightNum);
    const formulations = selectedDrug.formulations.map(form => {
      const calculatedValues: Record<string, string> = {};
      for (const key in doses) {
        const doseValue = doses[key];
        const result = form.calculate(doseValue, weightNum);
        calculatedValues[key] = result.toFixed(1);
      }
      return { ...form, results: calculatedValues };
    });
    const formattedDoses = Object.entries(doses).reduce((acc, [key, val]) => ({ ...acc, [key]: (val as number).toFixed(1) }), {} as Record<string, string>);
    return { doses: formattedDoses, formulations };
  }, [selectedDrug, weightNum]);

  // ── Insulin Computations ──────────────────────────────────────────────────
  const insulinWeightNum = parseFloat(insulinWeight) || 0;
  const totalDailyDose = insulinWeightNum * dosePerKg;
  const doseAM = totalDailyDose * (2 / 3);
  const dosePM = totalDailyDose * (1 / 3);
  const hasLimitWarning = dosePerKg >= 1.0;

  const formatInsulinValue = (val: number) => {
    if (val === 0) return '0';
    return val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
  };

  const colorStyles = {
    red: { bg: '#ef4444', text: '#b91c1c', border: '#fca5a5', headerBg: '#fee2e2' },
    blue: { bg: '#0284c7', text: '#0369a1', border: '#7dd3fc', headerBg: '#e0f2fe' },
    green: { bg: '#10b981', text: '#047857', border: '#6ee7b7', headerBg: '#d1fae5' },
    purple: { bg: '#8b5cf6', text: '#6d28d9', border: '#c4b5fd', headerBg: '#f3e8ff' },
    orange: { bg: '#f97316', text: '#c2410c', border: '#fed7aa', headerBg: '#ffedd5' },
  };

  const colors = selectedDrug ? colorStyles[selectedDrug.color] : null;

  if (!isOpen) return null;

  // Display font size: shrink for long numbers (Standard)
  const displayFontSize = display.length > 14 ? 20 : display.length > 10 ? 26 : display.length > 7 ? 32 : 42;

  return (
    <div
      className="z-[65] flex flex-col"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: 400,
        height: 550,
        background: C.bg,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
        userSelect: 'none',
      }}
    >
      {/* ── Title bar ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 34, background: C.titleBar, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2">
          <CalcIcon />
          <span style={{ color: C.textDim, fontSize: 12 }}>Calculadora</span>
        </div>
        <div className="flex items-center">
          {/* Minimizar (Keep ONLY minimize as requested) */}
          <button
            style={{ width: 46, height: 34, color: C.textDim, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 12px 0 0' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={onClose}
            title="Minimizar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Menu bar (Estándar dropdown trigger) ─────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 shrink-0 relative"
        style={{ height: 40, background: C.bg }}
      >
        <div className="flex items-center gap-2">
          {/* Mode Switcher Hamburger Menu Dropdown */}
          <div className="relative">
            <button
              style={{ color: C.textDim, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={e => (e.currentTarget.style.background = C.fnHover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={(e) => { e.stopPropagation(); setShowModeMenu(!showModeMenu); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span style={{ color: C.textMain, fontSize: 14, fontWeight: 600 }}>
                {mode === 'standard' ? 'Estándar' : mode === 'dosis' ? 'Dosis de Fármacos' : 'Insulina'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showModeMenu && (
              <div
                className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 shadow-xl rounded py-1 z-[999] font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setMode('standard'); setShowModeMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${mode === 'standard' ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'}`}
                >
                  <span>Calculadora Estándar</span>
                  {mode === 'standard' && <span>✓</span>}
                </button>
                <button
                  onClick={() => { setMode('dosis'); setShowModeMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${mode === 'dosis' ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'}`}
                >
                  <span>Dosis de Fármacos</span>
                  {mode === 'dosis' && <span>✓</span>}
                </button>
                <button
                  onClick={() => { setMode('insulina'); setShowModeMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${mode === 'insulina' ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'}`}
                >
                  <span>Insulina</span>
                  {mode === 'insulina' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Icon (Standard only) */}
        {mode === 'standard' && (
          <button
            style={{ color: C.textDim, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 4 }}
            onMouseEnter={e => (e.currentTarget.style.background = C.fnHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title="Historial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body Panel (Standard Mode vs Dosis Pediátrica) ────────────────────── */}
      {mode === 'standard' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Display */}
          <div style={{ background: C.display, padding: '12px 20px 16px', minHeight: 110 }} className="shrink-0">
            <div style={{ color: C.textDim, fontSize: 14, textAlign: 'right', minHeight: 20, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {history || '\u00a0'}
            </div>
            <div style={{ color: C.textMain, fontSize: displayFontSize, textAlign: 'right', fontWeight: 300, lineHeight: 1.1, wordBreak: 'break-all' }}>
              {display}
            </div>
          </div>

          {/* Memory row */}
          <div
            className="shrink-0"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
              background: C.bg,
              padding: '6px 10px 4px',
            }}
          >
            {[
              { label: 'MC', action: memClear, disabled: memory === 0 },
              { label: 'MR', action: memRecall, disabled: memory === 0 },
              { label: 'M+', action: memAdd, disabled: false },
              { label: 'M\u2212', action: memSub, disabled: false },
              { label: 'MS', action: memStore, disabled: false },
            ].map(({ label, action, disabled }) => (
              <button
                key={label}
                onClick={disabled ? undefined : action}
                style={{
                  background: 'transparent',
                  color: disabled ? '#cbd5e1' : C.textMem,
                  border: 'none',
                  cursor: disabled ? 'default' : 'pointer',
                  fontSize: 13,
                  padding: '8px 0',
                  borderRadius: 4,
                  fontFamily: 'inherit',
                  transition: 'background 0.08s',
                }}
                onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.memHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Button grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(6, 1fr)',
              gap: 2,
              padding: '4px 10px 12px',
              background: C.bg,
              flex: 1,
            }}
          >
            <Btn label="%" onClick={percent} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} fontSize={18} />
            <Btn label="CE" onClick={clearEntry} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} fontSize={18} />
            <Btn label="C" onClick={clearAll} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} fontSize={18} />
            <Btn
              label={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              }
              onClick={backspace} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain}
              title="Retroceso"
            />

            <Btn label={<span style={{ fontSize: 14 }}>¹⁄ₓ</span>} onClick={reciprocal} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} title="Recíproco" />
            <Btn label={<span style={{ fontSize: 15 }}>x²</span>} onClick={square} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} title="Cuadrado" />
            <Btn label={<span style={{ fontSize: 15 }}>²√x</span>} onClick={squareRoot} bg={C.fnBtn} bgHover={C.fnHover} bgActive={C.fnActive} textColor={C.textMain} title="Raíz cuadrada" />
            <Btn label="÷" onClick={() => handleOperator('÷')} bg={C.opBtn} bgHover={C.opHover} bgActive={C.opActive} textColor={C.textMain} fontSize={24} />

            <Btn label="7" onClick={() => inputDigit('7')} fontSize={20} />
            <Btn label="8" onClick={() => inputDigit('8')} fontSize={20} />
            <Btn label="9" onClick={() => inputDigit('9')} fontSize={20} />
            <Btn label="×" onClick={() => handleOperator('×')} bg={C.opBtn} bgHover={C.opHover} bgActive={C.opActive} textColor={C.textMain} fontSize={24} />

            <Btn label="4" onClick={() => inputDigit('4')} fontSize={20} />
            <Btn label="5" onClick={() => inputDigit('5')} fontSize={20} />
            <Btn label="6" onClick={() => inputDigit('6')} fontSize={20} />
            <Btn label="−" onClick={() => handleOperator('-')} bg={C.opBtn} bgHover={C.opHover} bgActive={C.opActive} textColor={C.textMain} fontSize={24} />

            <Btn label="1" onClick={() => inputDigit('1')} fontSize={20} />
            <Btn label="2" onClick={() => inputDigit('2')} fontSize={20} />
            <Btn label="3" onClick={() => inputDigit('3')} fontSize={20} />
            <Btn label="+" onClick={() => handleOperator('+')} bg={C.opBtn} bgHover={C.opHover} bgActive={C.opActive} textColor={C.textMain} fontSize={24} />

            <Btn label="+/−" onClick={toggleSign} fontSize={16} />
            <Btn label="0" onClick={() => inputDigit('0')} fontSize={20} />
            <Btn label="," onClick={() => inputDigit('.')} fontSize={24} />
            <Btn
              label="="
              onClick={handleEquals}
              bg={C.eqBtn} bgHover={C.eqHover} bgActive={C.eqActive}
              textColor="#fff"
              fontSize={24}
            />
          </div>
        </div>
      ) : mode === 'dosis' ? (
        /* Dosis de Fármacos Panel */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 font-sans select-none" style={{ background: '#f8fafc' }}>
          {/* Search bar */}
          <div className="relative shrink-0">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Buscar Fármaco
            </label>
            <div className="flex items-center relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDrugDropdown(true);
                  if (selectedDrug && e.target.value !== selectedDrug.name) {
                    setSelectedDrug(null);
                  }
                }}
                onFocus={() => setShowDrugDropdown(true)}
                placeholder="Escribe el nombre del fármaco..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all pr-8 font-semibold text-slate-700 shadow-sm"
              />
              {selectedDrug && (
                <button
                  onClick={() => { setSelectedDrug(null); setSearch(''); }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showDrugDropdown && filteredDrugs.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded z-[999] py-1">
                {filteredDrugs.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDrug(d);
                      setSearch(d.name);
                      setShowDrugDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50 last:border-b-0 text-slate-700"
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weight and Age fields side-by-side */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Peso (KG)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 12.5"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 text-sm font-bold bg-yellow-50/50 border border-slate-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-800 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Edad del Paciente
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Ej: 6"
                  min="0"
                  className="w-20 px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-800 shadow-sm flex-grow"
                />
                <select
                  value={ageUnit}
                  onChange={(e) => setAgeUnit(e.target.value as 'meses' | 'años')}
                  className="px-1.5 py-2 text-xs font-bold bg-white border border-slate-300 rounded focus:border-sky-500 outline-none transition-all text-slate-700 shadow-sm"
                >
                  <option value="meses">Meses</option>
                  <option value="años">Años</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-1 shrink-0"></div>

          {/* Results section */}
          <div className="flex-grow overflow-y-auto min-h-0">
            {!selectedDrug || weightNum <= 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <p className="text-xs font-bold tracking-wide uppercase opacity-75">Seleccione fármaco e ingrese peso</p>
              </div>
            ) : ageWarning && ageWarning.type === 'danger' ? (
              /* DANGER ALERT - blocks calculations strictly for clinical safety */
              <div className="space-y-4 p-2 animate-fadeIn">
                <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-md font-semibold text-xs leading-relaxed flex flex-col items-center text-center space-y-2.5">
                  <span className="text-3xl">🚫</span>
                  <span>{ageWarning.message}</span>
                  <div className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-2 border-t border-red-200 pt-2 w-full">
                    CÁLCULOS OCULTOS POR SEGURIDAD CLÍNICA
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* WARNING / PRECAUTION ALERT BANNER */}
                {ageWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-md font-semibold text-xs leading-relaxed shadow-sm">
                    {ageWarning.message}
                  </div>
                )}

                {/* Result header card */}
                <div
                  className="p-3 text-white flex flex-col rounded-md shadow-md"
                  style={{ background: colors?.bg }}
                >
                  <div className="text-xs font-black uppercase tracking-widest opacity-90">Dosis por administración</div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    {singleDoseResults && (
                      <span className="font-black text-3xl tracking-tight">{singleDoseResults.dosePerAdmin} mg</span>
                    )}
                    {multiDoseResults && (
                      <div className="flex flex-col text-xs space-y-0.5">
                        {Object.entries(multiDoseResults.doses).map(([key, val]) => (
                          <span key={key} className="font-bold">{key.split(' ')[0]}: <span className="font-black text-sm">{val} mg</span></span>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] font-black uppercase bg-black/20 px-2 py-0.5 rounded tracking-widest">
                      {selectedDrug.frequency}
                    </span>
                  </div>
                  {selectedDrug.note && (
                    <div className="text-xs mt-2.5 border-t border-white/20 pt-1.5 opacity-90 leading-relaxed font-semibold">
                      {selectedDrug.note}
                    </div>
                  )}
                </div>

                {/* Formulations list rendered as a simple table */}
                <div className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-left text-xs font-bold text-slate-500 select-none">
                        <th className="p-2 border-r border-slate-200">Presentación</th>
                        <th className="p-2 border-r border-slate-200 text-center">Conc.</th>
                        {multiDoseResults ? (
                          Object.keys(multiDoseResults.doses).map(key => (
                            <th key={key} className="p-2 border-r border-slate-200 text-center">{key.split(' ')[0]}</th>
                          ))
                        ) : (
                          <th className="p-2 border-r border-slate-200 text-center">Cant.</th>
                        )}
                        <th className="p-2 text-right">Unidad</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700">
                      {singleDoseResults && singleDoseResults.formulations.map((form, index) => (
                        <tr key={index} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/55 transition-colors">
                          <td className="p-2.5 font-bold border-r border-slate-200 text-slate-800">{form.type}</td>
                          <td className="p-2.5 text-center border-r border-slate-200 text-[10px] text-slate-500 font-semibold">{form.concentration}</td>
                          <td className="p-2.5 text-center font-black border-r border-slate-200 text-sm bg-sky-50/20 text-sky-700" style={{ color: colors?.text }}>
                            {form.result}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-400 text-[10.5px] uppercase tracking-wide">{form.unit}</td>
                        </tr>
                      ))}

                      {multiDoseResults && multiDoseResults.formulations.map((form, index) => (
                        <tr key={index} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/55 transition-colors">
                          <td className="p-2.5 font-bold border-r border-slate-200 text-slate-800">{form.type}</td>
                          <td className="p-2.5 text-center border-r border-slate-200 text-[10px] text-slate-500 font-semibold">{form.concentration}</td>
                          {Object.values(form.results).map((res, i) => (
                            <td key={i} className="p-2.5 text-center font-black border-r border-slate-200 text-sm bg-sky-50/20 text-sky-700" style={{ color: colors?.text }}>
                              {res}
                            </td>
                          ))}
                          <td className="p-2.5 text-right font-bold text-slate-400 text-[10.5px] uppercase tracking-wide">{form.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider py-1.5 bg-slate-50 rounded border border-slate-200 select-none">
                  Recordatorio: 20 Gotas = 1 mL
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Insulina Panel */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 font-sans select-none animate-fadeIn" style={{ background: '#f8fafc' }}>
          {/* Weight & Dose per Kg side-by-side */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Peso del Paciente (KG)
              </label>
              <input
                type="number"
                value={insulinWeight}
                onChange={(e) => setInsulinWeight(e.target.value)}
                placeholder="Ej: 70"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 text-sm font-bold bg-yellow-50/50 border border-slate-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-800 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Dosis por Kilo
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={customDose}
                  onChange={(e) => {
                    setCustomDose(e.target.value);
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed) && parsed >= 0) {
                      setDosePerKg(parsed);
                    }
                  }}
                  step="0.01"
                  min="0"
                  placeholder="Ej: 0.15"
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all text-slate-700 shadow-sm pr-12"
                />
                <span className="absolute right-2 text-[9px] font-black text-slate-400 uppercase tracking-wider pointer-events-none">
                  UI/kg/d
                </span>
              </div>
            </div>
          </div>

          {/* Sensitivity Select */}
          <div className="shrink-0">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Sensibilidad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sensible', label: 'Sensible', dose: 0.1 },
                { id: 'normal', label: 'Normal', dose: 0.2 },
                { id: 'resistente', label: 'Resistente', dose: 0.3 },
              ].map((opt) => {
                const isActive = Math.abs(dosePerKg - opt.dose) < 0.0001;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setDosePerKg(opt.dose);
                      setCustomDose(opt.dose.toString());
                    }}
                    className={`px-2 py-2.5 text-xs font-bold rounded border transition-all text-center leading-tight shadow-sm ${
                      isActive
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sky-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                    <div className={`text-[9px] font-normal block mt-0.5 ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                      ({opt.dose.toString().replace('.', ',')} UI/kg)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dividir en doble dosis button */}
          <div className="shrink-0">
            <button
              onClick={() => setIsDoubleDose(!isDoubleDose)}
              className={`w-full py-2.5 px-4 rounded font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-sm ${
                isDoubleDose
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sky-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isDoubleDose ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>Dividir en doble dosis</span>
            </button>
          </div>

          {/* Results card/warnings */}
          <div className="flex-grow overflow-y-auto min-h-0 space-y-3">
            {insulinWeightNum <= 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <p className="text-xs font-bold tracking-wide uppercase opacity-75">Ingrese peso del paciente</p>
              </div>
            ) : (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Safety Warning */}
                {hasLimitWarning && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-md font-semibold text-xs leading-relaxed flex items-start gap-2.5 shadow-sm animate-fadeIn">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-black uppercase tracking-wider text-[9px] text-red-700">
                        Alerta de Seguridad
                      </span>
                      <span>
                        La dosis de <strong>{customDose.replace('.', ',')} UI/kg/día</strong> alcanza o supera el límite de <strong>1,0 UI/kg/día</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {/* Dose Card */}
                <div className="bg-sky-600 text-white p-3.5 rounded-md shadow-md flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-90 block">
                      Dosis Total de Insulina Diaria
                    </span>
                    <span className="font-black text-3xl tracking-tight block mt-1">
                      {formatInsulinValue(totalDailyDose)} UI
                    </span>
                  </div>

                  {isDoubleDose && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/20 grid grid-cols-2 gap-3 text-xs font-semibold">
                      <div className="bg-white/10 p-2.5 rounded border border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-85 block text-sky-100">
                          Mañana - AM (2/3)
                        </span>
                        <span className="text-base font-black block mt-0.5">
                          {formatInsulinValue(doseAM)} UI
                        </span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded border border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-85 block text-sky-100">
                          Tarde - PM (1/3)
                        </span>
                        <span className="text-base font-black block mt-0.5">
                          {formatInsulinValue(dosePM)} UI
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation and responsive styling overlay */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
