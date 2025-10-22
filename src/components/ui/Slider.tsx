import { forwardRef, InputHTMLAttributes, ChangeEvent } from 'react';

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  onChange?: (value: number) => void;
  fullWidth?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      showValue = true,
      valueFormatter,
      onChange,
      fullWidth = false,
      className = '',
      id,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const sliderId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;
    const currentValue = value ?? defaultValue ?? min;

    const displayValue = valueFormatter
      ? valueFormatter(Number(currentValue))
      : String(currentValue);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onChange?.(newValue);
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label
                htmlFor={sliderId}
                className={`text-sm font-medium text-gray-700 ${
                  disabled ? 'opacity-60' : ''
                }`}
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                className={`text-sm font-medium text-gray-600 ${
                  disabled ? 'opacity-60' : ''
                }`}
                aria-live="polite"
              >
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          id={sliderId}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={handleChange}
          className={`${widthStyles} h-2 rounded-md appearance-none cursor-pointer transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:hover:bg-blue-700 ${className}`.trim()}
          aria-valuemin={Number(min)}
          aria-valuemax={Number(max)}
          aria-valuenow={Number(currentValue)}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
