/**
 * Fill generation utilities for gradients and patterns
 */

import type { AnyGradientConfig, AnyPatternConfig, GradientStop } from '../types/fills';
import {
  DEFAULT_LINEAR_GRADIENT,
  DEFAULT_RADIAL_GRADIENT,
  DEFAULT_CONIC_GRADIENT,
  DEFAULT_DOTS_PATTERN,
  DEFAULT_STRIPES_PATTERN,
  DEFAULT_GRID_PATTERN,
  DEFAULT_NOISE_PATTERN
} from '../types/fills';
import { getColorPalettes } from './colorStorage';

/**
 * Convert gradient config to CSS gradient string
 */
export function gradientToCSS(config: AnyGradientConfig): string {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

  switch (config.type) {
    case 'linear': {
      const angle = config.reverse ? (config.angle + 180) % 360 : config.angle;
      return `linear-gradient(${angle}deg, ${colorStops})`;
    }
    case 'radial': {
      const shape = config.shape;
      const position = `${config.focalPosition.x}% ${config.focalPosition.y}%`;
      const size = config.size > 100 ? `${config.size}% ${config.size}%` : '';
      return `radial-gradient(${shape} ${size} at ${position}, ${colorStops})`;
    }
    case 'conic': {
      const position = `at ${config.center.x}% ${config.center.y}%`;
      const angle = config.angle;
      if (config.repeat && config.stops.length >= 2) {
        // For repeating conic, ensure the last stop matches the first for seamless repeat
        const repeatingStops = [...sortedStops];
        if (repeatingStops[0].position !== 0) {
          repeatingStops.unshift({ ...repeatingStops[0], position: 0 });
        }
        if (repeatingStops[repeatingStops.length - 1].position !== 100) {
          repeatingStops.push({ ...repeatingStops[0], position: 100 });
        }
        const repeatColorStops = repeatingStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        return `repeating-conic-gradient(from ${angle}deg ${position}, ${repeatColorStops})`;
      }
      return `conic-gradient(from ${angle}deg ${position}, ${colorStops})`;
    }
    default:
      return `linear-gradient(90deg, ${colorStops})`;
  }
}

/**
 * Render gradient to canvas
 */
export function renderGradientToCanvas(
  ctx: CanvasRenderingContext2D,
  config: AnyGradientConfig,
  width: number,
  height: number
): void {
  let gradient: CanvasGradient;
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);

  switch (config.type) {
    case 'linear': {
      const angle = config.reverse ? (config.angle + 180) % 360 : config.angle;
      const angleRad = ((angle - 90) * Math.PI) / 180;
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
      const x = (config.focalPosition.x / 100) * width;
      const y = (config.focalPosition.y / 100) * height;
      const radius = (config.size / 100) * Math.min(width, height) / 2;
      const radiusX = config.shape === 'ellipse' ? radius * (width / height) : radius;

      gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
      break;
    }
    case 'conic': {
      // Conic gradients are not natively supported in Canvas 2D
      // We'll approximate with a series of linear segments
      renderConicGradient(ctx, config, width, height);
      return;
    }
    default:
      gradient = ctx.createLinearGradient(0, 0, width, 0);
  }

  // Add color stops
  sortedStops.forEach(stop => {
    gradient.addColorStop(stop.position / 100, stop.color);
  });

  // Apply dithering if enabled (for linear gradients)
  if (config.type === 'linear' && config.dithering) {
    ctx.filter = 'url(#dither)'; // This would need an SVG filter definition
  }

  ctx.fillStyle = gradient;
  // Add 1px extra to ensure full coverage and avoid rounding issues
  ctx.fillRect(0, 0, width + 1, height + 1);
}

/**
 * Render conic gradient approximation
 */
function renderConicGradient(
  ctx: CanvasRenderingContext2D,
  config: Extract<AnyGradientConfig, { type: 'conic' }>,
  width: number,
  height: number
): void {
  const centerX = (config.center.x / 100) * width;
  const centerY = (config.center.y / 100) * height;
  const startAngle = (config.angle * Math.PI) / 180;
  const segments = 360; // Number of segments for approximation

  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);

  for (let i = 0; i < segments; i++) {
    const angle1 = startAngle + (i / segments) * Math.PI * 2;
    const angle2 = startAngle + ((i + 1) / segments) * Math.PI * 2;

    // Find the color for this segment
    const position = (i / segments) * 100;
    let color = sortedStops[0].color;

    for (let j = 0; j < sortedStops.length - 1; j++) {
      if (position >= sortedStops[j].position && position <= sortedStops[j + 1].position) {
        // Interpolate between stops
        const range = sortedStops[j + 1].position - sortedStops[j].position;
        const factor = (position - sortedStops[j].position) / range;
        color = interpolateColors(sortedStops[j].color, sortedStops[j + 1].color, factor);
        break;
      }
    }

    if (position > sortedStops[sortedStops.length - 1].position) {
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

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Render pattern to canvas
 */
export function renderPatternToCanvas(
  ctx: CanvasRenderingContext2D,
  config: AnyPatternConfig,
  width: number,
  height: number
): void {
  // Fill background
  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, width + 1, height + 1);

  // Apply transformations
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((config.rotation * Math.PI) / 180);
  const scale = config.scale / 100;
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);
  ctx.globalAlpha = config.opacity / 100;

  ctx.fillStyle = config.foreground;
  ctx.strokeStyle = config.foreground;

  // Extend pattern beyond visible area for rotation
  const extendedWidth = width * 2;
  const extendedHeight = height * 2;
  const offsetX = -width / 2;
  const offsetY = -height / 2;

  switch (config.type) {
    case 'dots': {
      for (let y = offsetY; y < extendedHeight; y += config.spacing) {
        for (let x = offsetX; x < extendedWidth; x += config.spacing) {
          ctx.beginPath();
          ctx.arc(x, y, config.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'stripes': {
      const totalSpacing = config.thickness + config.spacing;
      for (let x = offsetX; x < extendedWidth; x += totalSpacing) {
        ctx.fillRect(x, offsetY, config.thickness, extendedHeight);
      }
      break;
    }

    case 'grid': {
      ctx.lineWidth = config.lineWidth;

      // Vertical lines
      for (let x = offsetX; x <= extendedWidth; x += config.cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, extendedHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = offsetY; y <= extendedHeight; y += config.cellSize) {
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(extendedWidth, y);
        ctx.stroke();
      }
      break;
    }

    case 'noise': {
      // Restore for noise as we need pixel-perfect rendering
      ctx.restore();
      ctx.globalAlpha = config.opacity / 100;

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      const fgRgb = hexToRgb(config.foreground);
      const bgRgb = hexToRgb(config.background);

      if (fgRgb && bgRgb) {
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random();
          const threshold = config.roughness / 100;
          const intensity = config.intensity / 100;

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
      }

      ctx.putImageData(imageData, 0, 0);
      return; // Early return as we already restored context
    }
  }

  ctx.restore();
}

/**
 * Generate random gradient from palette
 */
export function generateRandomGradient(seed: number): AnyGradientConfig {
  // Use seed for reproducible randomness
  const random = mulberry32(seed);

  // Get palettes and pick one
  const palettes = getColorPalettes();
  if (palettes.length === 0) {
    return DEFAULT_LINEAR_GRADIENT;
  }

  const palette = palettes[Math.floor(random() * palettes.length)];
  const colors = palette.colors;

  // Randomly choose gradient type
  const types: ('linear' | 'radial')[] = ['linear', 'radial'];
  const type = types[Math.floor(random() * types.length)];

  // Generate 2-5 stops from palette colors
  const stopCount = Math.floor(random() * 4) + 2; // 2 to 5 stops
  const stops: GradientStop[] = [];

  for (let i = 0; i < stopCount; i++) {
    stops.push({
      id: `stop-${i}`,
      color: colors[Math.floor(random() * colors.length)],
      position: (i / (stopCount - 1)) * 100
    });
  }

  // Generate config based on type
  if (type === 'linear') {
    return {
      type: 'linear',
      angle: Math.floor(random() * 360),
      reverse: random() > 0.5,
      dithering: random() > 0.8,
      stops
    };
  } else {
    return {
      type: 'radial',
      shape: random() > 0.5 ? 'circle' : 'ellipse',
      focalPosition: {
        x: Math.floor(random() * 100),
        y: Math.floor(random() * 100)
      },
      size: Math.floor(random() * 100) + 50, // 50-150
      stops
    };
  }
}

/**
 * Seeded random number generator
 */
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Convert hex to RGB
 */
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