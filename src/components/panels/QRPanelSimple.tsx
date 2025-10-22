/**
 * Simplified QR Code Panel
 * Clean, user-friendly interface for QR code creation
 */

import { useCallback } from 'react';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { QRLayer } from '../../types';
import { DEFAULT_SIMPLE_QR_CONFIG, type SimpleQRConfig, type SimpleQRDotShape } from '../../types/qr';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { QrCode } from 'lucide-react';

export const QRPanelSimple = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectedLayer = useEditorStore(selectSelectedLayer);

  const qrLayer = selectedLayer?.type === 'qr' ? (selectedLayer as QRLayer) : undefined;

  // Get config (use simpleConfig or create from defaults)
  const config = qrLayer?.simpleConfig || DEFAULT_SIMPLE_QR_CONFIG;

  const handleAddQR = useCallback(() => {
    addLayer({
      type: 'qr',
      simpleConfig: { ...DEFAULT_SIMPLE_QR_CONFIG },
      position: { x: 100, y: 100 },
      rotation: 0,
      opacity: 1,
      name: 'QR Code',
      visible: true,
    });
  }, [addLayer]);

  const updateConfig = useCallback((updates: Partial<SimpleQRConfig>) => {
    if (!qrLayer) return;
    const newConfig = { ...config, ...updates };
    updateLayer(qrLayer.id, { simpleConfig: newConfig });
  }, [qrLayer, config, updateLayer]);

  const updateNestedConfig = useCallback((path: string, value: any) => {
    if (!qrLayer) return;
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    updateLayer(qrLayer.id, { simpleConfig: newConfig });
  }, [qrLayer, config, updateLayer]);

  const dotShapes: { value: SimpleQRDotShape; label: string; icon: string }[] = [
    { value: 'square', label: 'Square', icon: '⬛' },
    { value: 'rounded', label: 'Rounded', icon: '▢' },
    { value: 'circle', label: 'Circle', icon: '●' },
    { value: 'dots', label: 'Dots', icon: '⚫' },
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Add QR Button */}
      {!qrLayer && (
        <div>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleAddQR}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Add QR Code
          </Button>
        </div>
      )}

      {qrLayer && (
        <>
          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Content
            </h3>

            <Input
              label="URL or Text"
              value={config.data}
              onChange={(e) => updateConfig({ data: e.target.value })}
              placeholder="https://example.com"
              type="text"
              fullWidth
            />
          </div>

          {/* Size Section */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
              Size
            </h3>

            <Slider
              label="QR Code Size"
              min={100}
              max={600}
              step={10}
              value={config.size}
              onChange={(value) => updateConfig({ size: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />
          </div>

          {/* Appearance Section */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-green-600 rounded-full"></div>
              Appearance
            </h3>

            {/* Dot Shape */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dot Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dotShapes.map((shape) => (
                  <button
                    key={shape.value}
                    onClick={() => updateConfig({ dotShape: shape.value })}
                    className={`px-3 py-2 rounded-lg border-2 flex items-center gap-2 transition-colors ${
                      config.dotShape === shape.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{shape.icon}</span>
                    <span className="text-sm font-medium">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius (for rounded) */}
            {config.dotShape === 'rounded' && (
              <Slider
                label="Corner Radius"
                min={0}
                max={0.5}
                step={0.05}
                value={config.cornerRadius}
                onChange={(value) => updateConfig({ cornerRadius: value })}
                valueFormatter={(v) => `${Math.round(v * 100)}%`}
                fullWidth
              />
            )}

            {/* Dot Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dot Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.dotColor.startsWith('#') ? config.dotColor : '#000000'}
                  onChange={(e) => updateConfig({ dotColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={config.dotColor}
                  onChange={(e) => updateConfig({ dotColor: e.target.value })}
                  placeholder="#000000 or rgba()"
                  fullWidth
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.backgroundColor.startsWith('#') ? config.backgroundColor : '#FFFFFF'}
                  onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                  placeholder="#FFFFFF or transparent"
                  fullWidth
                />
              </div>
              <button
                onClick={() => updateConfig({ backgroundColor: 'transparent' })}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Make transparent
              </button>
            </div>
          </div>

          {/* Caption Section */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-pink-600 rounded-full"></div>
                Text Caption
              </h3>
              <button
                onClick={() => updateNestedConfig('caption.enabled', !config.caption.enabled)}
                className={`text-xs font-medium px-3 py-1 rounded ${
                  config.caption.enabled
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {config.caption.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {config.caption.enabled && (
              <div className="space-y-3">
                <Input
                  label="Caption Text"
                  value={config.caption.text}
                  onChange={(e) => updateNestedConfig('caption.text', e.target.value)}
                  placeholder="Scan me"
                  fullWidth
                />

                <Slider
                  label="Font Size"
                  min={12}
                  max={24}
                  step={1}
                  value={config.caption.fontSize}
                  onChange={(value) => updateNestedConfig('caption.fontSize', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Font Weight
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNestedConfig('caption.fontWeight', 'normal')}
                      className={`flex-1 px-3 py-2 rounded border-2 ${
                        config.caption.fontWeight === 'normal'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm">Normal</span>
                    </button>
                    <button
                      onClick={() => updateNestedConfig('caption.fontWeight', 'bold')}
                      className={`flex-1 px-3 py-2 rounded border-2 ${
                        config.caption.fontWeight === 'bold'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-bold">Bold</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.caption.color.startsWith('#') ? config.caption.color : '#000000'}
                      onChange={(e) => updateNestedConfig('caption.color', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={config.caption.color}
                      onChange={(e) => updateNestedConfig('caption.color', e.target.value)}
                      placeholder="#000000"
                      fullWidth
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
              Advanced
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Error Correction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'L', label: 'Low (7%)' },
                  { value: 'M', label: 'Medium (15%)' },
                  { value: 'Q', label: 'High (25%)' },
                  { value: 'H', label: 'Highest (30%)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateConfig({ errorCorrection: option.value as any })}
                    className={`px-3 py-2 rounded border-2 text-sm ${
                      config.errorCorrection === option.value
                        ? 'border-blue-600 bg-blue-50 font-medium'
                        : 'border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Higher error correction allows scanning even if QR is partially damaged
              </p>
            </div>

            <Slider
              label="Quiet Zone (Padding)"
              min={2}
              max={8}
              step={1}
              value={config.quietZone}
              onChange={(value) => updateConfig({ quietZone: value })}
              valueFormatter={(v) => `${v} modules`}
              fullWidth
            />
          </div>
        </>
      )}

      {!qrLayer && (
        <div className="text-center text-sm text-gray-500 py-8">
          Add a QR code to start customizing
        </div>
      )}
    </div>
  );
};
