/**
 * Background rendering utilities for new unified model
 */

import type { GradientConfig, PatternConfig } from '../types/background';
import { hexToRgb } from './color';

/**
 * Convert unified GradientConfig to CSS gradient string
 */
export function gradientToCSS(config: GradientConfig): string {
  const sortedStops = [...config.stops].sort((a, b) => a.pos - b.pos);
  const colorStops = sortedStops.map(stop => `${stop.color} ${Math.round(stop.pos * 100)}%`).join(', ');

  switch (config.kind) {
    case 'linear': {
      return `linear-gradient(${config.angle}deg, ${colorStops})`;
    }

    case 'radial': {
      const shape = config.shape;
      const position = `${Math.round(config.center.x * 100)}% ${Math.round(config.center.y * 100)}%`;
      return `radial-gradient(${shape} at ${position}, ${colorStops})`;
    }

    case 'conic': {
      const position = `at ${Math.round(config.center.x * 100)}% ${Math.round(config.center.y * 100)}%`;
      const gradientType = config.repeat ? 'repeating-conic-gradient' : 'conic-gradient';
      return `${gradientType}(from ${config.angle}deg ${position}, ${colorStops})`;
    }

    default:
      return `linear-gradient(90deg, ${colorStops})`;
  }
}

/**
 * Render gradient to canvas using unified format
 */
export function renderGradientToCanvasUnified(
  ctx: CanvasRenderingContext2D,
  config: GradientConfig,
  width: number,
  height: number
): void {
  let gradient: CanvasGradient;
  const sortedStops = [...config.stops].sort((a, b) => a.pos - b.pos);

  switch (config.kind) {
    case 'linear': {
      const angleRad = ((config.angle - 90) * Math.PI) / 180;
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = Math.cos(angleRad) * Math.max(width, height);
      const dy = Math.sin(angleRad) * Math.max(width, height);

      gradient = ctx.createLinearGradient(
        centerX - dx / 2,
        centerY - dy / 2,
        centerX + dx / 2,
        centerY + dy / 2
      );
      break;
    }

    case 'radial': {
      const x = config.center.x * width;
      const y = config.center.y * height;
      const radius = Math.min(width, height) / 2;
      const radiusX = config.shape === 'ellipse' ? radius * (width / height) : radius;

      gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
      break;
    }

    case 'conic': {
      // Conic gradients approximated with segments
      renderConicGradient(ctx, config, width, height);
      return;
    }

    default:
      gradient = ctx.createLinearGradient(0, 0, width, 0);
  }

  // Add color stops
  sortedStops.forEach(stop => {
    gradient.addColorStop(stop.pos, stop.color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Render conic gradient approximation
 */
function renderConicGradient(
  ctx: CanvasRenderingContext2D,
  config: GradientConfig,
  width: number,
  height: number
): void {
  const centerX = config.center.x * width;
  const centerY = config.center.y * height;
  const startAngle = (config.angle * Math.PI) / 180;
  const segments = 360;

  const sortedStops = [...config.stops].sort((a, b) => a.pos - b.pos);

  for (let i = 0; i < segments; i++) {
    const angle1 = startAngle + (i / segments) * Math.PI * 2;
    const angle2 = startAngle + ((i + 1) / segments) * Math.PI * 2;

    const position = i / segments;
    let color = sortedStops[0].color;

    // Find color for this segment
    for (let j = 0; j < sortedStops.length - 1; j++) {
      if (position >= sortedStops[j].pos && position <= sortedStops[j + 1].pos) {
        const range = sortedStops[j + 1].pos - sortedStops[j].pos;
        const factor = (position - sortedStops[j].pos) / range;
        color = interpolateColors(sortedStops[j].color, sortedStops[j + 1].color, factor);
        break;
      }
    }

    if (position > sortedStops[sortedStops.length - 1].pos) {
      color = sortedStops[sortedStops.length - 1].color;
    }

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, Math.max(width, height), angle1, angle2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/**
 * Interpolate between two colors
 */
function interpolateColors(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Render pattern to canvas using unified format
 */
export function renderPatternToCanvasUnified(
  ctx: CanvasRenderingContext2D,
  config: PatternConfig,
  width: number,
  height: number
): void {
  // Fill background
  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, width, height);

  // Apply transformations
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((config.rotation * Math.PI) / 180);
  ctx.scale(config.scale, config.scale);
  ctx.translate(-width / 2, -height / 2);
  ctx.globalAlpha = config.opacity;

  ctx.fillStyle = config.fg;
  ctx.strokeStyle = config.fg;

  // Extended area for rotation
  const extendedWidth = width * 2;
  const extendedHeight = height * 2;
  const offsetX = -width / 2;
  const offsetY = -height / 2;

  switch (config.name) {
    case 'dots': {
      const radius = config.params.radius || 3;
      const spacing = config.params.spacing || 20;

      for (let y = offsetY; y < extendedHeight; y += spacing) {
        for (let x = offsetX; x < extendedWidth; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'stripes': {
      const thickness = config.params.thickness || 10;
      const spacing = config.params.spacing || 20;
      const totalSpacing = thickness + spacing;

      for (let x = offsetX; x < extendedWidth; x += totalSpacing) {
        ctx.fillRect(x, offsetY, thickness, extendedHeight);
      }
      break;
    }

    case 'grid': {
      const lineWidth = config.params.lineWidth || 1;
      const cellSize = config.params.cellSize || 20;
      ctx.lineWidth = lineWidth;

      // Vertical lines
      for (let x = offsetX; x <= extendedWidth; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, extendedHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = offsetY; y <= extendedHeight; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(extendedWidth, y);
        ctx.stroke();
      }
      break;
    }

    case 'noise': {
      ctx.restore(); // Restore for pixel-perfect noise
      ctx.globalAlpha = config.opacity;

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      const fgRgb = hexToRgb(config.fg);
      const bgRgb = hexToRgb(config.bg);

      const intensity = (config.params.intensity || 50) / 100;
      const roughness = (config.params.roughness || 50) / 100;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();
        const threshold = roughness;

        let factor: number;
        if (noise < threshold) {
          factor = noise * intensity;
        } else {
          factor = 1 - ((noise - threshold) / (1 - threshold)) * intensity;
        }

        data[i] = bgRgb.r * (1 - factor) + fgRgb.r * factor;
        data[i + 1] = bgRgb.g * (1 - factor) + fgRgb.g * factor;
        data[i + 2] = bgRgb.b * (1 - factor) + fgRgb.b * factor;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      return;
    }
  }

  ctx.restore();
}