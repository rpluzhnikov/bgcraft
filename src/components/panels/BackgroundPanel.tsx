import { useCallback, useRef, ChangeEvent, useState } from 'react';
import { useEditorStore, selectLayers } from '../../state/editorStore';
import { BackgroundLayer } from '../../types';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { AdvancedColorPicker } from '../ui/AdvancedColorPicker';
import { ColorSwatches } from '../ui/ColorSwatches';
import { ContrastChecker } from '../ui/ContrastChecker';
import { Slider } from '../ui/Slider';
import { Tabs, TabList, Tab, TabPanel } from '../ui/Tabs';
import { Upload, Image as ImageIcon, Settings2 } from 'lucide-react';

const GRADIENT_PRESETS = [
  { name: 'Purple Dream', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { name: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Night Sky', value: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)' },
  { name: 'Cherry', value: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
];

const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f3f4f6' },
  { name: 'Dark Gray', value: '#1f2937' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
];

const PATTERN_PRESETS = [
  { name: 'Dots', value: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', size: '20px 20px' },
  { name: 'Grid', value: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', size: '20px 20px' },
  { name: 'Diagonal', value: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 20px)', size: '' },
  { name: 'Waves', value: 'radial-gradient(ellipse at top, transparent 30%, #f3f4f6 60%)', size: '100% 50px' },
];

export const BackgroundPanel = () => {
  const layers = useEditorStore(selectLayers);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvancedColor, setShowAdvancedColor] = useState(false);
  const [showSwatches, setShowSwatches] = useState(false);
  const [showContrast, setShowContrast] = useState(false);

  const backgroundLayer = layers.find((l) => l.type === 'background') as BackgroundLayer | undefined;

  const handleModeChange = useCallback((mode: BackgroundLayer['mode']) => {
    if (!backgroundLayer) return;

    let defaultValue: string;

    // Set appropriate default based on mode - ALWAYS set a new value when switching modes
    if (mode === 'solid') {
      defaultValue = '#ffffff';
    } else if (mode === 'gradient') {
      defaultValue = GRADIENT_PRESETS[0].value;
    } else if (mode === 'preset') {
      defaultValue = COLOR_PRESETS[0].value;
    } else if (mode === 'pattern') {
      defaultValue = PATTERN_PRESETS[0].value;
    } else if (mode === 'upload') {
      // Keep current value for upload mode
      defaultValue = backgroundLayer.value;
    } else {
      defaultValue = '#ffffff';
    }

    updateLayer(backgroundLayer.id, { mode, value: defaultValue });
  }, [backgroundLayer, updateLayer]);

  const handleValueChange = useCallback((value: string) => {
    if (!backgroundLayer) return;
    updateLayer(backgroundLayer.id, { value });
  }, [backgroundLayer, updateLayer]);

  const handleFilterChange = useCallback((filterKey: string, value: number | string) => {
    if (!backgroundLayer) return;

    const currentFilters = backgroundLayer.filters || {
      blur: 0,
      brightness: 100,
      contrast: 100,
      tint: undefined,
      tintAlpha: 0.5,
    };

    updateLayer(backgroundLayer.id, {
      filters: {
        ...currentFilters,
        [filterKey]: value,
      },
    });
  }, [backgroundLayer, updateLayer]);

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !backgroundLayer) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateLayer(backgroundLayer.id, { mode: 'upload', value: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [backgroundLayer, updateLayer]);

  if (!backgroundLayer) {
    return (
      <div className="p-4 text-center text-gray-500">
        No background layer found
      </div>
    );
  }

  const filters = backgroundLayer.filters || {
    blur: 0,
    brightness: 100,
    contrast: 100,
    tint: undefined,
    tintAlpha: 0.5,
  };

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          Background Style
        </h3>

        <Tabs
          defaultValue={backgroundLayer.mode}
          value={backgroundLayer.mode}
          onValueChange={(value) => handleModeChange(value as BackgroundLayer['mode'])}
        >
          <TabList className="mb-4">
            <Tab value="solid">Solid</Tab>
            <Tab value="gradient">Gradient</Tab>
            <Tab value="preset">Preset</Tab>
            <Tab value="upload">Upload</Tab>
            <Tab value="pattern">Pattern</Tab>
          </TabList>

          <TabPanel value="solid" className="space-y-3">
            {/* Toggle buttons for advanced features */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowAdvancedColor(!showAdvancedColor)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  showAdvancedColor
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Settings2 className="w-3 h-3 inline mr-1" />
                Advanced Color
              </button>
              <button
                onClick={() => setShowSwatches(!showSwatches)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  showSwatches
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Swatches
              </button>
              <button
                onClick={() => setShowContrast(!showContrast)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  showContrast
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Contrast
              </button>
            </div>

            {/* Color picker - basic or advanced */}
            {showAdvancedColor ? (
              <AdvancedColorPicker
                label="Background Color"
                value={backgroundLayer.value.startsWith('#') ? backgroundLayer.value : '#ffffff'}
                onChange={handleValueChange}
                showEyeDropper={true}
                fullWidth
              />
            ) : (
              <ColorPicker
                label="Background Color"
                value={backgroundLayer.value.startsWith('#') ? backgroundLayer.value : '#ffffff'}
                onChange={handleValueChange}
                fullWidth
              />
            )}

            {/* Color swatches */}
            {showSwatches && (
              <div className="pt-3 border-t border-gray-200">
                <ColorSwatches
                  onColorSelect={handleValueChange}
                  currentColor={backgroundLayer.value}
                  fullWidth
                />
              </div>
            )}

            {/* Contrast checker */}
            {showContrast && (
              <div className="pt-3 border-t border-gray-200">
                <ContrastChecker
                  foregroundColor={backgroundLayer.value}
                  backgroundColor="#FFFFFF"
                />
              </div>
            )}
          </TabPanel>

          <TabPanel value="gradient" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((preset) => {
                // Normalize gradient strings for comparison (remove extra whitespace)
                const normalizeGradient = (str: string) => str.replace(/\s+/g, ' ').trim();
                const isSelected = normalizeGradient(backgroundLayer.value) === normalizeGradient(preset.value);

                return (
                  <button
                    key={preset.name}
                    onClick={() => handleValueChange(preset.value)}
                    className={`h-16 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ background: preset.value }}
                    title={preset.name}
                  >
                    <span className="sr-only">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Add swatches for gradient selection */}
            {showSwatches && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Select colors to create custom gradients
                </p>
                <ColorSwatches
                  onColorSelect={(color) => {
                    // Create a simple linear gradient with the selected color
                    const gradient = `linear-gradient(135deg, ${color} 0%, ${color}88 100%)`;
                    handleValueChange(gradient);
                  }}
                  currentColor={backgroundLayer.value}
                  fullWidth
                />
              </div>
            )}
          </TabPanel>

          <TabPanel value="preset" className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => {
                // Normalize color values for comparison (lowercase, remove whitespace)
                const normalizeColor = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();
                const isSelected = normalizeColor(backgroundLayer.value) === normalizeColor(preset.value);

                return (
                  <button
                    key={preset.name}
                    onClick={() => handleValueChange(preset.value)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  >
                    <span className="sr-only">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </TabPanel>
          <TabPanel value="upload" className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {backgroundLayer.mode === 'upload' && backgroundLayer.value.startsWith('data:') ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={backgroundLayer.value}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            )}
          </TabPanel>

          <TabPanel value="pattern" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {PATTERN_PRESETS.map((preset) => {
                // Normalize pattern values for comparison
                const normalizePattern = (str: string) => str.replace(/\s+/g, ' ').trim();
                const isSelected = normalizePattern(backgroundLayer.value) === normalizePattern(preset.value);

                return (
                  <button
                    key={preset.name}
                    onClick={() => handleValueChange(preset.value)}
                    className={`h-16 rounded-lg border-2 transition-all bg-white ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundImage: preset.value,
                      backgroundSize: preset.size,
                    }}
                    title={preset.name}
                  >
                    <span className="sr-only">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </TabPanel>
        </Tabs>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
          Filters
        </h3>

        <div className="space-y-4">
          <Slider
            label="Blur"
            min={0}
            max={20}
            step={1}
            value={filters.blur}
            onChange={(value) => handleFilterChange('blur', value)}
            valueFormatter={(v) => `${v}px`}
            fullWidth
          />

          <Slider
            label="Brightness"
            min={0}
            max={200}
            step={1}
            value={filters.brightness}
            onChange={(value) => handleFilterChange('brightness', value)}
            valueFormatter={(v) => `${v}%`}
            fullWidth
          />

          <Slider
            label="Contrast"
            min={0}
            max={200}
            step={1}
            value={filters.contrast}
            onChange={(value) => handleFilterChange('contrast', value)}
            valueFormatter={(v) => `${v}%`}
            fullWidth
          />

          <div className="space-y-2">
            {showAdvancedColor ? (
              <AdvancedColorPicker
                label="Tint Color"
                value={filters.tint || '#000000'}
                onChange={(value) => handleFilterChange('tint', value)}
                showEyeDropper={true}
                fullWidth
              />
            ) : (
              <ColorPicker
                label="Tint Color"
                value={filters.tint || '#000000'}
                onChange={(value) => handleFilterChange('tint', value)}
                fullWidth
              />
            )}

            <Slider
              label="Tint Opacity"
              min={0}
              max={1}
              step={0.01}
              value={filters.tintAlpha || 0}
              onChange={(value) => handleFilterChange('tintAlpha', value)}
              valueFormatter={(v) => `${Math.round(v * 100)}%`}
              fullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
};
