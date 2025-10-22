import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      className = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseSelectStyles =
      'px-3 py-2 pr-10 text-base rounded-md border transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = hasError
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500';

    const widthStyles = fullWidth ? 'w-full' : '';

    const selectClassName = `${baseSelectStyles} ${errorStyles} ${widthStyles} ${className}`.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium mb-1 ${
              hasError ? 'text-red-600' : 'text-gray-700'
            } ${disabled ? 'opacity-60' : ''}`}
          >
            {label}
          </label>
        )}
        <div className={`relative ${widthStyles}`}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={selectClassName}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown
              className={`w-5 h-5 ${
                hasError ? 'text-red-500' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
