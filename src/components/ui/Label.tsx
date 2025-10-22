import { forwardRef, LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      required = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'block text-sm font-medium text-gray-700 transition-colors';
    const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed' : '';

    const combinedClassName = `${baseStyles} ${disabledStyles} ${className}`.trim();

    return (
      <label ref={ref} className={combinedClassName} {...props}>
        {children}
        {required && (
          <span className="ml-1 text-red-600" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
