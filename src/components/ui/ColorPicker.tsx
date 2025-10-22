import { forwardRef, InputHTMLAttributes, useState, ChangeEvent } from 'react';

export interface ColorPickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  onChange?: (color: string) => void;
  showHexInput?: boolean;
  fullWidth?: boolean;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      label,
      onChange,
      value,
      defaultValue = '#000000',
      showHexInput = true,
      fullWidth = false,
      className = '',
      id,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const pickerId =
      id || `color-picker-${Math.random().toString(36).substr(2, 9)}`;
    const [internalValue, setInternalValue] = useState(
      (value as string) || (defaultValue as string) || '#000000'
    );

    const currentValue = (value as string) || internalValue;

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setInternalValue(newColor);
      onChange?.(newColor);
    };

    const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      let newColor = e.target.value;

      // Ensure it starts with #
      if (!newColor.startsWith('#')) {
        newColor = '#' + newColor;
      }

      // Validate hex color format
      if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor)) {
        setInternalValue(newColor);

        // Only trigger onChange if it's a complete hex color
        if (newColor.length === 7) {
          onChange?.(newColor);
        }
      }
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={pickerId}
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              disabled ? 'opacity-60' : ''
            }`}
          >
            {label}
          </label>
        )}
        <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
          <div className="relative">
            <input
              ref={ref}
              type="color"
              id={pickerId}
              value={currentValue}
              onChange={handleColorChange}
              disabled={disabled}
              className={`w-12 h-10 rounded-md border-2 border-gray-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
              {...props}
            />
          </div>
          {showHexInput && (
            <input
              type="text"
              value={currentValue}
              onChange={handleHexInputChange}
              disabled={disabled}
              placeholder="#000000"
              maxLength={7}
              className={`px-3 py-2 text-sm font-mono uppercase rounded-md border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 ${
                fullWidth ? 'flex-1' : 'w-24'
              }`}
              aria-label="Hex color value"
            />
          )}
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
