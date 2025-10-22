import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseInputStyles =
      'px-3 py-2 text-base rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = hasError
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500';

    const widthStyles = fullWidth ? 'w-full' : '';

    const inputClassName = `${baseInputStyles} ${errorStyles} ${widthStyles} ${className}`.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 ${
              hasError ? 'text-red-600' : 'text-gray-700'
            } ${disabled ? 'opacity-60' : ''}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClassName}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
