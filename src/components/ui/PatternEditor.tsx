import React, { useCallback, useEffect, useRef } from 'react';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import type { AnyPatternConfig } from '../../types/fills';
import { Slider } from './Slider';

interface PatternEditorProps {
  config: AnyPatternConfig;
  onChange: (config: AnyPatternConfig) => void;
  className?: string;
}

export const PatternEditor: React.FC<PatternEditorProps> = ({
  config,
  onChange,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate pattern on canvas for preview
  const renderPattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 200;
    const height = 100;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = config.background;
    ctx.fillRect(0, 0, width, height);

    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.scale(config.scale / 100, config.scale / 100);
    ctx.translate(-width / 2, -height / 2);
    ctx.globalAlpha = config.opacity / 100;

    ctx.fillStyle = config.foreground;
    ctx.strokeStyle = config.foreground;

    switch (config.type) {
      case 'dots': {
        const { radius, spacing } = config;
        for (let y = 0; y < height + spacing; y += spacing) {
          for (let x = 0; x < width + spacing; x += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'stripes': {
        const { thickness, spacing } = config;
        const totalSpacing = thickness + spacing;
        ctx.fillStyle = config.foreground;

        for (let i = -height; i < width + height; i += totalSpacing) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(i, -height, thickness, height * 3);
          ctx.fill();
          ctx.restore();
        }
        break;
      }

      case 'grid': {
        const { lineWidth, cellSize } = config;
        ctx.lineWidth = lineWidth;

        // Vertical lines
        for (let x = 0; x <= width + cellSize; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height + cellSize; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      }

      case 'noise': {
        const { intensity, roughness } = config;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generate noise pattern
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * intensity / 100;

          // Mix with base colors
          const fgRgb = hexToRgb(config.foreground);
          const bgRgb = hexToRgb(config.background);

          if (fgRgb && bgRgb) {
            const factor = Math.random() < (roughness / 100) ? noise : 1 - noise;
            data[i] = bgRgb.r * (1 - factor) + fgRgb.r * factor;
            data[i + 1] = bgRgb.g * (1 - factor) + fgRgb.g * factor;
            data[i + 2] = bgRgb.b * (1 - factor) + fgRgb.b * factor;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        break;
      }
    }

    ctx.restore();
  }, [config]);

  // Render pattern when config changes
  useEffect(() => {
    renderPattern();
  }, [renderPattern]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pattern Preview */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-24 rounded border border-gray-300"
          style={{ imageRendering: config.type === 'noise' ? 'auto' : 'crisp-edges' }}
        />
      </div>

      {/* Common Controls */}
      <div className="space-y-3">
        <AdvancedColorPicker
          label="Foreground Color"
          value={config.foreground}
          onChange={(color) => onChange({ ...config, foreground: color })}
          showEyeDropper={true}
          fullWidth
        />

        <AdvancedColorPicker
          label="Background Color"
          value={config.background}
          onChange={(color) => onChange({ ...config, background: color })}
          showEyeDropper={true}
          fullWidth
        />

        <Slider
          label="Scale"
          min={10}
          max={200}
          step={5}
          value={config.scale}
          onChange={(value) => onChange({ ...config, scale: value })}
          valueFormatter={(v) => `${v}%`}
          fullWidth
        />

        <Slider
          label="Rotation"
          min={0}
          max={360}
          step={15}
          value={config.rotation}
          onChange={(value) => onChange({ ...config, rotation: value })}
          valueFormatter={(v) => `${v}°`}
          fullWidth
        />

        <Slider
          label="Opacity"
          min={0}
          max={100}
          step={5}
          value={config.opacity}
          onChange={(value) => onChange({ ...config, opacity: value })}
          valueFormatter={(v) => `${v}%`}
          fullWidth
        />
      </div>

      {/* Pattern-specific Controls */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700">Pattern Settings</h4>

        {config.type === 'dots' && (
          <>
            <Slider
              label="Dot Radius"
              min={1}
              max={50}
              step={1}
              value={config.radius}
              onChange={(value) => onChange({ ...config, radius: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />

            <Slider
              label="Spacing"
              min={10}
              max={100}
              step={5}
              value={config.spacing}
              onChange={(value) => onChange({ ...config, spacing: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />
          </>
        )}

        {config.type === 'stripes' && (
          <>
            <Slider
              label="Stripe Thickness"
              min={1}
              max={50}
              step={1}
              value={config.thickness}
              onChange={(value) => onChange({ ...config, thickness: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />

            <Slider
              label="Spacing"
              min={10}
              max={100}
              step={5}
              value={config.spacing}
              onChange={(value) => onChange({ ...config, spacing: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />
          </>
        )}

        {config.type === 'grid' && (
          <>
            <Slider
              label="Line Width"
              min={1}
              max={10}
              step={0.5}
              value={config.lineWidth}
              onChange={(value) => onChange({ ...config, lineWidth: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />

            <Slider
              label="Cell Size"
              min={10}
              max={100}
              step={5}
              value={config.cellSize}
              onChange={(value) => onChange({ ...config, cellSize: value })}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />
          </>
        )}

        {config.type === 'noise' && (
          <>
            <Slider
              label="Intensity"
              min={0}
              max={100}
              step={5}
              value={config.intensity}
              onChange={(value) => onChange({ ...config, intensity: value })}
              valueFormatter={(v) => `${v}%`}
              fullWidth
            />

            <Slider
              label="Roughness"
              min={0}
              max={100}
              step={5}
              value={config.roughness}
              onChange={(value) => onChange({ ...config, roughness: value })}
              valueFormatter={(v) => `${v}%`}
              fullWidth
            />
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}