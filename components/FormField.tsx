
import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  isTextArea?: boolean;
  rows?: number;
  step?: string | number;
  readOnly?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  inputClassName?: string; // Added inputClassName prop
  labelClassName?: string; // Added labelClassName prop
  labelPrefix?: React.ReactNode; // Optional icon/element to prepend to the label
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  name,
  value = '',
  onChange,
  placeholder,
  type = 'text',
  required = false,
  isTextArea = false,
  rows = 4,
  step,
  readOnly,
  disabled,
  containerClassName,
  inputClassName, // Destructure inputClassName
  labelClassName, // Destructure labelClassName
  labelPrefix, // Destructure labelPrefix
}) => {
  const commonProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    step,
    readOnly,
    disabled,
    className: `w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-150 ease-in-out text-slate-800 placeholder-slate-400 placeholder:opacity-50 leading-normal font-sans text-sm ${disabled ? 'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed' : ''} ${inputClassName || ''}`, // Apply inputClassName
    "aria-required": required,
    "aria-disabled": disabled,
    "aria-readonly": readOnly,
  };

  return (
    <div className={`w-full ${containerClassName || ''}`}>
      <label htmlFor={id} className={`flex items-center gap-1.5 ${labelClassName || 'text-sm font-medium text-slate-700 mb-1.5'}`}>
        {labelPrefix && labelPrefix}
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default FormField;

