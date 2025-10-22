import { forwardRef, InputHTMLAttributes, ChangeEvent } from 'react';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      onChange,
      checked,
      defaultChecked,
      className = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const isChecked = checked ?? defaultChecked ?? false;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={`flex items-center ${className}`.trim()}>
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-labelledby={label ? `${toggleId}-label` : undefined}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              const newChecked = !isChecked;
              onChange?.(newChecked);
            }
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isChecked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span className="sr-only">{label || 'Toggle'}</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isChecked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
          {...props}
        />
        {label && (
          <label
            id={`${toggleId}-label`}
            htmlFor={toggleId}
            className={`ml-3 text-sm font-medium text-gray-700 cursor-pointer ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
