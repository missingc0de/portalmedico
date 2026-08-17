
import React, { useState, useEffect, useCallback } from 'react';

interface RutInputProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

export const formatRutChilean = (rut: string): string => {
  if (!rut) return "";
  let cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanRut.length === 0) return "";

  let verifier = cleanRut.slice(-1);
  let body = cleanRut.slice(0, -1);

  if (!body && verifier.match(/[0-9kK]/)) {
    return cleanRut; 
  }
  if(!body) return cleanRut;


  let formattedBody = "";
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedBody = "." + formattedBody;
    }
    formattedBody = body[i] + formattedBody;
  }
  
  return `${formattedBody}-${verifier}`;
};


const RutInput: React.FC<RutInputProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  placeholder,
  required = false,
  inputClassName,
  labelClassName,
}) => {
  const [displayValue, setDisplayValue] = useState(() => formatRutChilean(value));

  useEffect(() => {
    // This effect ensures that if the 'value' prop from the parent changes
    // (e.g., form is reset, or initial data is loaded),
    // the 'displayValue' of this input is updated accordingly and formatted.
    // It should NOT interfere with the user typing into the input.
    const formattedValueProp = formatRutChilean(value);
    if (displayValue !== formattedValueProp) {
      setDisplayValue(formattedValueProp);
    }
  }, [value]); // CRITICAL: Only depend on the 'value' prop.


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value); // Allows user to type freely
  };

  const handleBlur = useCallback(() => {
    const rawValue = displayValue.replace(/[^0-9kK]/g, "").toUpperCase();
    const formatted = formatRutChilean(rawValue); 
    setDisplayValue(formatted); 

    // Propagate change to parent if the meaningful value has changed
    // or if the input was cleared.
    if (value !== formatted) { 
      onChange(formatted); 
    } else if (!rawValue && value !== '') { // Handles case where input is cleared by user
      onChange('');
    }
  }, [displayValue, onChange, value]);

  return (
    <div className="w-full">
      <label htmlFor={id} className={labelClassName || "block text-sm font-medium text-slate-700 mb-1.5"}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-700 placeholder-slate-400 ${inputClassName || ''}`}
        aria-required={required}
      />
    </div>
  );
};

export default RutInput;

