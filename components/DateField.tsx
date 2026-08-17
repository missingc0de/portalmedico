import React from 'react';

interface DateFieldProps {
  label: string;
  id: string;
  name: string;
  value: string; // Expects YYYY-MM-DD
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD
  containerClassName?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  required = false,
  disabled = false,
  min,
  max,
  containerClassName,
}) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
        aria-required={required}
        aria-label={label}
      />
    </div>
  );
};

export default DateField;
