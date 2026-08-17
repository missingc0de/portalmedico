import React, { useEffect, useRef } from 'react';

interface SmartDietaTextareaProps {
  label: string;
  id: string;
  name?: string;
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}

const SmartDietaTextarea: React.FC<SmartDietaTextareaProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  rows = 10,
  placeholder,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    const minH = rows * 24;
    textareaRef.current.style.height = 'auto';
    const targetH = Math.max(textareaRef.current.scrollHeight, minH);
    textareaRef.current.style.height = `${targetH}px`;
    if (backdropRef.current) {
      backdropRef.current.style.height = `${targetH}px`;
    }
  }, [value, rows]);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const highlightDietaLine = (line: string, index: number) => {
    const match = line.match(/^(\s*-\s*)(PAN|LÍQUIDOS|LÁCTEOS|INFUSIONES|AZÚCAR|FRUTAS|ENSALADAS|ARROZ\/FIDEOS|GOLOSINAS)(.*?)$/i);
    if (match) {
      const prefix = match[1];
      const word = match[2];
      const rest = match[3];

      let colorClass = 'bg-slate-200 text-transparent rounded px-0.5 inline';
      const wordUpper = word.toUpperCase();
      if (wordUpper === 'PAN') colorClass = 'bg-amber-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'LÍQUIDOS') colorClass = 'bg-cyan-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'LÁCTEOS') colorClass = 'bg-sky-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'INFUSIONES') colorClass = 'bg-emerald-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'AZÚCAR') colorClass = 'bg-rose-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'FRUTAS') colorClass = 'bg-red-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'ENSALADAS') colorClass = 'bg-green-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'ARROZ/FIDEOS') colorClass = 'bg-yellow-200/80 text-transparent rounded px-0.5 inline';
      else if (wordUpper === 'GOLOSINAS') colorClass = 'bg-purple-200/80 text-transparent rounded px-0.5 inline';

      return (
        <div key={index} className="min-h-[1.25rem]">
          <span className="text-transparent">{prefix}</span>
          <span className={colorClass}>{word}</span>
          <span className="text-transparent">{rest}</span>
        </div>
      );
    }
    return <div key={index} className="text-transparent min-h-[1.25rem]">{line || ' '}</div>;
  };

  return (
    <div className="w-full relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>

      <div className={`w-full bg-white rounded-lg border shadow-sm transition-all relative overflow-hidden ${disabled ? 'opacity-50 border-slate-200' : 'border-slate-300 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500'}`}>
        {/* Layer de Fondo */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 px-3.5 py-2 pointer-events-none overflow-hidden font-sans text-sm leading-normal whitespace-pre-wrap break-words select-none z-0 bg-transparent text-transparent"
        >
          {value.split('\n').map((line, idx) => highlightDietaLine(line, idx))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className="relative z-10 w-full px-3.5 py-2 bg-transparent border-0 outline-none focus:ring-0 text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm font-normal resize-none"
        />
      </div>
    </div>
  );
};

export default SmartDietaTextarea;
