import { useCallback, useRef, ChangeEvent } from 'react';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { ImageLayer, Layer } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Upload, Lock, Unlock } from 'lucide-react';

const OBJECT_FIT_OPTIONS = [
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' },
];

export const ImagePanel = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageLayer = selectedLayer?.type === 'image' ? (selectedLayer as ImageLayer) : undefined;

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      // Get natural image dimensions
      const img = new Image();
      img.onload = () => {
        if (imageLayer) {
          // Replace existing image
          updateLayer(imageLayer.id, {
            src: dataUrl,
            naturalSize: { w: img.width, h: img.height },
          });
        } else {
          // Add new image layer
          addLayer({
            type: 'image',
            src: dataUrl,
            naturalSize: { w: img.width, h: img.height },
            objectFit: 'contain',
            width: 200,
            height: 200,
            position: { x: 100, y: 100 },
            rotation: 0,
            opacity: 1,
            name: 'Image',
            visible: true,
            locked: false,
          } as Omit<Layer, 'id'>);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [addLayer, imageLayer, updateLayer]);


  const handleFieldChange = useCallback((field: string, value: string | number | boolean) => {
    if (!imageLayer) return;
    updateLayer(imageLayer.id, { [field]: value });
  }, [imageLayer, updateLayer]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    if (!imageLayer) return;
    updateLayer(imageLayer.id, {
      position: {
        ...imageLayer.position,
        [axis]: value,
      },
    });
  }, [imageLayer, updateLayer]);

  return (
    <div className="p-5 space-y-6">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {imageLayer && (
        <>
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Image Preview
            </h3>

            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
              <img
                src={imageLayer.src}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace Image
            </Button>

            {imageLayer.naturalSize && (
              <div className="text-xs text-gray-500 text-center">
                Original: {imageLayer.naturalSize.w} × {imageLayer.naturalSize.h}px
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
              Display Settings
            </h3>

            <Select
              label="Object Fit"
              options={OBJECT_FIT_OPTIONS}
              value={imageLayer.objectFit}
              onChange={(e) => handleFieldChange('objectFit', e.target.value)}
              fullWidth
            />

            <Slider
              label="Opacity"
              min={0}
              max={1}
              step={0.01}
              value={imageLayer.opacity}
              onChange={(value) => handleFieldChange('opacity', value)}
              valueFormatter={(v) => `${Math.round(v * 100)}%`}
              fullWidth
            />

            <Slider
              label="Rotation"
              min={0}
              max={360}
              step={1}
              value={imageLayer.rotation}
              onChange={(value) => handleFieldChange('rotation', value)}
              valueFormatter={(v) => `${v}°`}
              fullWidth
            />
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-600 rounded-full"></div>
              Position
            </h3>

            <Input
              label="X Position"
              type="number"
              value={imageLayer.position.x}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              fullWidth
            />

            <Input
              label="Y Position"
              type="number"
              value={imageLayer.position.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              fullWidth
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-600 rounded-full"></div>
                  Lock Layer
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Prevent accidental movement
                </p>
              </div>
              <Toggle
                checked={imageLayer.locked ?? false}
                onChange={(value) => handleFieldChange('locked', value)}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              {imageLayer.locked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Layer is locked</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Layer is unlocked</span>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {!imageLayer && (
        <div className="text-center text-sm text-gray-500 py-8">
          Upload an image or select an existing one to edit
        </div>
      )}
    </div>
  );
};
