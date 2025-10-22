import { forwardRef, useState, useEffect, useCallback, ChangeEvent } from 'react';
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  validateHex,
  clampRgb,
  clampHsl,
  RGB,
  HSL
} from '../../lib/color';
import { addRecentColor } from '../../lib/colorStorage';
import { Pipette, Copy, Check } from 'lucide-react';

export interface AdvancedColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  showEyeDropper?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

declare global {
  interface Window {
    EyeDropper?: new () => {
      open(): Promise<{ sRGBHex: string }>;
    };
  }
}

export const AdvancedColorPicker = forwardRef<HTMLDivElement, AdvancedColorPickerProps>(
  ({ label, value, onChange, showEyeDropper = true, fullWidth = false, disabled = false }, ref) => {
    const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
    const [hexInput, setHexInput] = useState(value);
    const [rgbInput, setRgbInput] = useState<RGB>(hexToRgb(value));
    const [hslInput, setHslInput] = useState<HSL>(hexToHsl(value));
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [supportsEyeDropper, setSupportsEyeDropper] = useState(false);

    // Check EyeDropper API support
    useEffect(() => {
      setSupportsEyeDropper('EyeDropper' in window);
    }, []);

    // Update local state when value prop changes
    useEffect(() => {
      const validated = validateHex(value);
      if (validated) {
        setHexInput(validated);
        setRgbInput(hexToRgb(validated));
        setHslInput(hexToHsl(validated));
        setError('');
      }
    }, [value]);

    // Handle HEX input
    const handleHexChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.trim();
      setHexInput(input);
      setError('');

      // Add # if not present
      if (input && !input.startsWith('#')) {
        input = '#' + input;
      }

      // Validate and apply
      const validated = validateHex(input);
      if (validated) {
        setHexInput(validated);
        setRgbInput(hexToRgb(validated));
        setHslInput(hexToHsl(validated));
        onChange(validated);
        addRecentColor(validated);
      } else if (input.length > 1) {
        setError('Invalid HEX format');
      }
    }, [onChange]);

    // Handle RGB inputs
    const handleRgbChange = useCallback((channel: keyof RGB, valueStr: string) => {
      const numValue = parseInt(valueStr) || 0;
      const newRgb = { ...rgbInput, [channel]: numValue };

      setRgbInput(newRgb);
      setError('');

      // Clamp and convert
      const clamped = clampRgb(newRgb);
      const hex = rgbToHex(clamped);

      setHexInput(hex);
      setHslInput(hexToHsl(hex));
      onChange(hex);
      addRecentColor(hex);
    }, [rgbInput, onChange]);

    // Handle HSL inputs
    const handleHslChange = useCallback((channel: keyof HSL, valueStr: string) => {
      const numValue = parseInt(valueStr) || 0;
      const newHsl = { ...hslInput, [channel]: numValue };

      setHslInput(newHsl);
      setError('');

      // Clamp and convert
      const clamped = clampHsl(newHsl);
      const hex = hslToHex(clamped);

      setHexInput(hex);
      setRgbInput(hexToRgb(hex));
      onChange(hex);
      addRecentColor(hex);
    }, [hslInput, onChange]);

    // Handle eyedropper
    const handleEyeDropper = useCallback(async () => {
      if (!window.EyeDropper) return;

      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        const color = result.sRGBHex;

        setHexInput(color);
        setRgbInput(hexToRgb(color));
        setHslInput(hexToHsl(color));
        onChange(color);
        addRecentColor(color);
      } catch (error) {
        console.error('EyeDropper failed:', error);
      }
    }, [onChange]);

    // Handle color copy
    const handleCopyColor = useCallback(() => {
      navigator.clipboard.writeText(hexInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [hexInput]);

    // Handle native color picker change
    const handleNativePickerChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setHexInput(color);
      setRgbInput(hexToRgb(color));
      setHslInput(hexToHsl(color));
      onChange(color);
      addRecentColor(color);
    }, [onChange]);

    return (
      <div ref={ref} className={`space-y-3 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className={`block text-sm font-medium text-gray-700 ${disabled ? 'opacity-60' : ''}`}>
            {label}
          </label>
        )}

        {/* Color display and native picker */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hexInput}
            onChange={handleNativePickerChange}
            disabled={disabled}
            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-600 uppercase">{hexInput}</span>
              <button
                type="button"
                onClick={handleCopyColor}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy color"
                disabled={disabled}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-600" />
                )}
              </button>
              {showEyeDropper && supportsEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Pick color from screen"
                  disabled={disabled}
                >
                  <Pipette className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['hex', 'rgb', 'hsl'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={disabled}
              className={`flex-1 px-3 py-1 text-xs font-medium uppercase transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Input fields based on mode */}
        <div className={`space-y-2 ${fullWidth ? 'w-full' : ''}`}>
          {mode === 'hex' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">HEX Code</label>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                disabled={disabled}
                placeholder="#000000"
                maxLength={7}
                className={`w-full px-3 py-2 text-sm font-mono uppercase rounded-md border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            </div>
          )}

          {mode === 'rgb' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbInput.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbInput.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgbInput.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  disabled={disabled}
                  className="w-full px-2 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          )}

          {mode === 'hsl' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hue: {hslInput.h}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hslInput.h}
                  onChange={(e) => handleHslChange('h', e.target.value)}
                  disabled={disabled}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right,
                      hsl(0, 100%, 50%),
                      hsl(60, 100%, 50%),
                      hsl(120, 100%, 50%),
                      hsl(180, 100%, 50%),
                      hsl(240, 100%, 50%),
                      hsl(300, 100%, 50%),
                      hsl(360, 100%, 50%))`,
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Saturation: {hslInput.s}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslInput.s}
                  onChange={(e) => handleHslChange('s', e.target.value)}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lightness: {hslInput.l}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslInput.l}
                  onChange={(e) => handleHslChange('l', e.target.value)}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AdvancedColorPicker.displayName = 'AdvancedColorPicker';