import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import type { GradientStop, AnyGradientConfig } from '../../types/fills';

interface GradientEditorProps {
  config: AnyGradientConfig;
  onChange: (config: AnyGradientConfig) => void;
  className?: string;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
  config,
  onChange,
  className = ''
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    config.stops[0]?.id || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Get selected stop
  const selectedStop = config.stops.find(s => s.id === selectedStopId);

  // Generate gradient CSS for preview
  const getGradientCSS = useCallback(() => {
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

    switch (config.type) {
      case 'linear':
        return `linear-gradient(${config.angle}deg, ${colorStops})`;
      case 'radial':
        const shape = config.shape;
        const position = `${config.focalPosition.x}% ${config.focalPosition.y}%`;
        return `radial-gradient(${shape} at ${position}, ${colorStops})`;
      case 'conic':
        const conicPosition = `at ${config.center.x}% ${config.center.y}%`;
        return `conic-gradient(from ${config.angle}deg ${conicPosition}, ${colorStops})`;
      default:
        return `linear-gradient(90deg, ${colorStops})`;
    }
  }, [config]);

  // Add a new stop
  const addStop = useCallback(() => {
    if (config.stops.length >= 10) return; // Max 10 stops

    // Find the largest gap between stops
    const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
    let maxGap = 0;
    let newPosition = 50;

    for (let i = 0; i < sortedStops.length - 1; i++) {
      const gap = sortedStops[i + 1].position - sortedStops[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        newPosition = sortedStops[i].position + gap / 2;
      }
    }

    const newStop: GradientStop = {
      id: `stop-${Date.now()}`,
      color: '#808080',
      position: newPosition
    };

    onChange({
      ...config,
      stops: [...config.stops, newStop]
    });

    setSelectedStopId(newStop.id);
  }, [config, onChange]);

  // Remove a stop
  const removeStop = useCallback((stopId: string) => {
    if (config.stops.length <= 2) return; // Min 2 stops

    const newStops = config.stops.filter(s => s.id !== stopId);
    onChange({
      ...config,
      stops: newStops
    });

    if (selectedStopId === stopId) {
      setSelectedStopId(newStops[0].id);
    }
  }, [config, onChange, selectedStopId]);

  // Update stop color
  const updateStopColor = useCallback((stopId: string, color: string) => {
    onChange({
      ...config,
      stops: config.stops.map(s =>
        s.id === stopId ? { ...s, color } : s
      )
    });
  }, [config, onChange]);

  // Update stop position
  const updateStopPosition = useCallback((stopId: string, position: number) => {
    // Clamp position between 0 and 100
    const clampedPosition = Math.max(0, Math.min(100, position));

    onChange({
      ...config,
      stops: config.stops.map(s =>
        s.id === stopId ? { ...s, position: clampedPosition } : s
      )
    });
  }, [config, onChange]);

  // Handle dragging stops
  const handleMouseDown = useCallback((e: React.MouseEvent, stopId: string) => {
    e.preventDefault();
    setSelectedStopId(stopId);
    setIsDragging(true);

    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const x = e.clientX - trackRect.left;
        const position = (x / trackRect.width) * 100;
        updateStopPosition(stopId, position);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateStopPosition]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Gradient Preview */}
      <div
        className="h-16 rounded-lg border-2 border-gray-300"
        style={{ background: getGradientCSS() }}
      />

      {/* Gradient Track with Stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Color Stops</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {config.stops.length}/10 stops
            </span>
            <button
              onClick={addStop}
              disabled={config.stops.length >= 10}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add stop"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gradient Track */}
        <div className="relative">
          <div
            ref={trackRef}
            className="h-8 rounded-md border border-gray-300 relative cursor-pointer"
            style={{ background: getGradientCSS() }}
          >
            {/* Stop markers */}
            {config.stops.map(stop => (
              <div
                key={stop.id}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ left: `${stop.position}%` }}
                onMouseDown={(e) => handleMouseDown(e, stop.id)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 shadow-md transition-transform ${
                    selectedStopId === stop.id
                      ? 'border-blue-500 scale-125 ring-2 ring-blue-200'
                      : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: stop.color }}
                  title={`${stop.color} at ${Math.round(stop.position)}%`}
                />
              </div>
            ))}
          </div>

          {/* Position labels */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">50%</span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>
      </div>

      {/* Selected Stop Controls */}
      {selectedStop && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stop Settings</span>
            <button
              onClick={() => removeStop(selectedStop.id)}
              disabled={config.stops.length <= 2}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove stop"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>

          <AdvancedColorPicker
            label="Stop Color"
            value={selectedStop.color}
            onChange={(color) => updateStopColor(selectedStop.id, color)}
            showEyeDropper={true}
            fullWidth
          />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Position
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={selectedStop.position}
                onChange={(e) => updateStopPosition(selectedStop.id, parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(selectedStop.position)}
                onChange={(e) => updateStopPosition(selectedStop.id, parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Type Controls */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Gradient Settings</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        {/* Type-specific controls */}
        {config.type === 'linear' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Angle: {config.angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={config.angle}
                onChange={(e) => onChange({ ...config, angle: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reverse"
                checked={config.reverse}
                onChange={(e) => onChange({ ...config, reverse: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="reverse" className="text-sm text-gray-700">
                Reverse direction
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dithering"
                checked={config.dithering}
                onChange={(e) => onChange({ ...config, dithering: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="dithering" className="text-sm text-gray-700">
                Enable dithering
              </label>
            </div>
          </div>
        )}

        {config.type === 'radial' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Shape
              </label>
              <select
                value={config.shape}
                onChange={(e) => onChange({ ...config, shape: e.target.value as 'circle' | 'ellipse' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Focal Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">X: {config.focalPosition.x}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.focalPosition.x}
                    onChange={(e) => onChange({
                      ...config,
                      focalPosition: { ...config.focalPosition, x: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y: {config.focalPosition.y}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.focalPosition.y}
                    onChange={(e) => onChange({
                      ...config,
                      focalPosition: { ...config.focalPosition, y: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Size: {config.size}%
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={config.size}
                onChange={(e) => onChange({ ...config, size: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {config.type === 'conic' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Starting Angle: {config.angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={config.angle}
                onChange={(e) => onChange({ ...config, angle: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Center Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">X: {config.center.x}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.center.x}
                    onChange={(e) => onChange({
                      ...config,
                      center: { ...config.center, x: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Y: {config.center.y}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.center.y}
                    onChange={(e) => onChange({
                      ...config,
                      center: { ...config.center, y: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="repeat"
                checked={config.repeat}
                onChange={(e) => onChange({ ...config, repeat: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="repeat" className="text-sm text-gray-700">
                Repeat pattern
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};