import { useCallback } from 'react';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { TextLayer, Layer } from '../../types';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { Slider } from '../ui/Slider';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Type } from 'lucide-react';

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light (300)' },
  { value: 'normal', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semibold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
];

export const TextPanel = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectedLayer = useEditorStore(selectSelectedLayer);

  const textLayer = selectedLayer?.type === 'text' ? (selectedLayer as TextLayer) : undefined;

  const handleAddText = useCallback(() => {
    addLayer({
      type: 'text',
      text: 'New Text',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 'normal',
      color: '#000000',
      position: { x: 100, y: 100 },
      rotation: 0,
      opacity: 1,
      name: 'Text Layer',
      visible: true,
      width: 200,
      height: 48,
    } as Omit<Layer, 'id'>);
  }, [addLayer]);

  const handleTextChange = useCallback((field: string, value: string | number | boolean) => {
    if (!textLayer) return;
    updateLayer(textLayer.id, { [field]: value });
  }, [textLayer, updateLayer]);

  const handleShadowToggle = useCallback((enabled: boolean) => {
    if (!textLayer) return;

    updateLayer(textLayer.id, {
      shadow: {
        enabled,
        blur: textLayer.shadow?.blur ?? 4,
        offset: textLayer.shadow?.offset ?? { x: 2, y: 2 },
        color: textLayer.shadow?.color ?? '#000000',
      },
    });
  }, [textLayer, updateLayer]);

  const handleShadowChange = useCallback((field: string, value: number | string) => {
    if (!textLayer || !textLayer.shadow) return;

    if (field === 'offsetX') {
      updateLayer(textLayer.id, {
        shadow: {
          ...textLayer.shadow,
          offset: { ...textLayer.shadow.offset, x: value as number },
        },
      });
    } else if (field === 'offsetY') {
      updateLayer(textLayer.id, {
        shadow: {
          ...textLayer.shadow,
          offset: { ...textLayer.shadow.offset, y: value as number },
        },
      });
    } else {
      updateLayer(textLayer.id, {
        shadow: {
          ...textLayer.shadow,
          [field]: value,
        },
      });
    }
  }, [textLayer, updateLayer]);

  const handlePlateToggle = useCallback((enabled: boolean) => {
    if (!textLayer) return;

    updateLayer(textLayer.id, {
      plate: {
        enabled,
        padding: textLayer.plate?.padding ?? 16,
        radius: textLayer.plate?.radius ?? 8,
        color: textLayer.plate?.color ?? '#ffffff',
        alpha: textLayer.plate?.alpha ?? 0.9,
      },
    });
  }, [textLayer, updateLayer]);

  const handlePlateChange = useCallback((field: string, value: number | string) => {
    if (!textLayer || !textLayer.plate) return;

    updateLayer(textLayer.id, {
      plate: {
        ...textLayer.plate,
        [field]: value,
      },
    });
  }, [textLayer, updateLayer]);

  return (
    <div className="p-5 space-y-6">
      <div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleAddText}
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text Layer
        </Button>
      </div>

      {textLayer && (
        <>
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Text Content
            </h3>

            <div>
              <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-2">
                Text
              </label>
              <textarea
                id="text-content"
                value={textLayer.text}
                onChange={(e) => handleTextChange('text', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-base rounded-md border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter your text..."
              />
            </div>

            <Select
              label="Font Family"
              options={FONT_FAMILIES}
              value={textLayer.fontFamily}
              onChange={(e) => handleTextChange('fontFamily', e.target.value)}
              fullWidth
            />

            <Slider
              label="Font Size"
              min={12}
              max={120}
              step={1}
              value={textLayer.fontSize}
              onChange={(value) => handleTextChange('fontSize', value)}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />

            <Select
              label="Font Weight"
              options={FONT_WEIGHTS}
              value={String(textLayer.fontWeight)}
              onChange={(e) => handleTextChange('fontWeight', e.target.value)}
              fullWidth
            />

            <ColorPicker
              label="Text Color"
              value={textLayer.color}
              onChange={(value) => handleTextChange('color', value)}
              fullWidth
            />
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
                Text Shadow
              </h3>
              <Toggle
                checked={textLayer.shadow?.enabled ?? false}
                onChange={handleShadowToggle}
              />
            </div>

            {textLayer.shadow?.enabled && (
              <div className="space-y-4 pl-4">
                <Slider
                  label="Blur"
                  min={0}
                  max={20}
                  step={1}
                  value={textLayer.shadow.blur}
                  onChange={(value) => handleShadowChange('blur', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <Slider
                  label="Offset X"
                  min={-20}
                  max={20}
                  step={1}
                  value={textLayer.shadow.offset.x}
                  onChange={(value) => handleShadowChange('offsetX', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <Slider
                  label="Offset Y"
                  min={-20}
                  max={20}
                  step={1}
                  value={textLayer.shadow.offset.y}
                  onChange={(value) => handleShadowChange('offsetY', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <ColorPicker
                  label="Shadow Color"
                  value={textLayer.shadow.color}
                  onChange={(value) => handleShadowChange('color', value)}
                  fullWidth
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-green-600 rounded-full"></div>
                Background Plate
              </h3>
              <Toggle
                checked={textLayer.plate?.enabled ?? false}
                onChange={handlePlateToggle}
              />
            </div>

            {textLayer.plate?.enabled && (
              <div className="space-y-4 pl-4">
                <Slider
                  label="Padding"
                  min={0}
                  max={40}
                  step={1}
                  value={textLayer.plate.padding}
                  onChange={(value) => handlePlateChange('padding', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <Slider
                  label="Border Radius"
                  min={0}
                  max={40}
                  step={1}
                  value={textLayer.plate.radius}
                  onChange={(value) => handlePlateChange('radius', value)}
                  valueFormatter={(v) => `${v}px`}
                  fullWidth
                />

                <ColorPicker
                  label="Plate Color"
                  value={textLayer.plate.color}
                  onChange={(value) => handlePlateChange('color', value)}
                  fullWidth
                />

                <Slider
                  label="Opacity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={textLayer.plate.alpha}
                  onChange={(value) => handlePlateChange('alpha', value)}
                  valueFormatter={(v) => `${Math.round(v * 100)}%`}
                  fullWidth
                />
              </div>
            )}
          </div>
        </>
      )}

      {!textLayer && (
        <div className="text-center text-sm text-gray-500 py-8">
          Add a text layer or select an existing one to edit
        </div>
      )}
    </div>
  );
};
