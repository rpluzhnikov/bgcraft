/**
 * Background Migration Utilities
 * Converts legacy background formats to new unified model
 */

import type { BackgroundLayer } from '../types';
import type {
  BackgroundState,
  GradientConfig,
  PatternConfig,
  GradientStop,
  PatternName
} from '../types/background';
import {
  DEFAULT_BACKGROUND_STATE,
  DEFAULT_SOLID,
  DEFAULT_GRADIENT,
  DEFAULT_PATTERN
} from '../types/background';

/**
 * Migrate legacy BackgroundLayer to new BackgroundState
 */
export function migrateBackgroundLayer(layer: BackgroundLayer): BackgroundState {
  const state: BackgroundState = {
    ...DEFAULT_BACKGROUND_STATE
  };

  // Determine type from layer.mode
  switch (layer.mode) {
    case 'solid':
    case 'preset':
      state.type = 'solid';
      state.solid = {
        color: layer.solidConfig?.color || layer.value || '#FFFFFF'
      };
      break;

    case 'gradient':
      state.type = 'gradient';
      if (layer.gradientConfig) {
        // New format - convert to unified model
        state.gradient = convertGradientConfig(layer.gradientConfig);
      } else {
        // Legacy CSS gradient string - parse it
        state.gradient = parseCSSGradient(layer.value) || DEFAULT_GRADIENT;
      }
      break;

    case 'pattern':
      state.type = 'pattern';
      if (layer.patternConfig) {
        // New format - convert to unified model
        state.pattern = convertPatternConfig(layer.patternConfig);
      } else {
        // Legacy - use defaults
        state.pattern = DEFAULT_PATTERN;
      }
      break;

    case 'upload':
      state.type = 'upload';
      state.upload = {
        dataUrl: layer.value,
        naturalSize: undefined
      };
      break;
  }

  return state;
}

/**
 * Convert gradient config from fills.ts format to background.ts format
 */
function convertGradientConfig(config: any): GradientConfig {
  // Convert stops from percentage (0-100) to normalized (0-1)
  const stops: GradientStop[] = config.stops.map((stop: any) => ({
    pos: stop.position / 100,
    color: stop.color
  }));

  const result: GradientConfig = {
    kind: config.type as 'linear' | 'radial' | 'conic',
    angle: config.angle || 0,
    center: { x: 0.5, y: 0.5 },
    shape: 'circle',
    repeat: false,
    stops
  };

  // Type-specific fields
  if (config.type === 'radial') {
    result.center = {
      x: (config.focalPosition?.x || 50) / 100,
      y: (config.focalPosition?.y || 50) / 100
    };
    result.shape = config.shape || 'circle';
  } else if (config.type === 'conic') {
    result.center = {
      x: (config.center?.x || 50) / 100,
      y: (config.center?.y || 50) / 100
    };
    result.repeat = config.repeat || false;
  }

  return result;
}

/**
 * Convert pattern config from fills.ts format to background.ts format
 */
function convertPatternConfig(config: any): PatternConfig {
  const result: PatternConfig = {
    name: config.type as PatternName,
    fg: config.foreground,
    bg: config.background,
    scale: config.scale / 100, // Convert percentage to multiplier
    rotation: config.rotation,
    opacity: config.opacity / 100, // Convert percentage to 0-1
    params: {}
  };

  // Type-specific params
  switch (config.type) {
    case 'dots':
      result.params = {
        radius: config.radius,
        spacing: config.spacing
      };
      break;
    case 'stripes':
      result.params = {
        thickness: config.thickness,
        spacing: config.spacing
      };
      break;
    case 'grid':
      result.params = {
        lineWidth: config.lineWidth,
        cellSize: config.cellSize
      };
      break;
    case 'noise':
      result.params = {
        intensity: config.intensity,
        roughness: config.roughness
      };
      break;
  }

  return result;
}

/**
 * Parse legacy CSS gradient string to GradientConfig
 */
function parseCSSGradient(cssString: string): GradientConfig | null {
  try {
    // Try to parse linear-gradient
    const linearMatch = cssString.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
    if (linearMatch) {
      const angle = parseInt(linearMatch[1]);
      const stops = parseColorStops(linearMatch[2]);

      return {
        kind: 'linear',
        angle,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops
      };
    }

    // Try to parse radial-gradient
    const radialMatch = cssString.match(/radial-gradient\((.*?),\s*(.+)\)/);
    if (radialMatch) {
      const stops = parseColorStops(radialMatch[2]);

      return {
        kind: 'radial',
        angle: 0,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops
      };
    }

    // Fallback
    return null;
  } catch (error) {
    console.error('Failed to parse CSS gradient:', error);
    return null;
  }
}

/**
 * Parse color stops from CSS gradient string
 */
function parseColorStops(stopsString: string): GradientStop[] {
  const stops: GradientStop[] = [];

  // Match color and percentage pairs
  const matches = stopsString.matchAll(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+(\d+)%/g);

  for (const match of matches) {
    stops.push({
      color: match[1],
      pos: parseInt(match[2]) / 100
    });
  }

  // If no stops found, create default
  if (stops.length === 0) {
    stops.push({ color: '#000000', pos: 0 });
    stops.push({ color: '#FFFFFF', pos: 1 });
  }

  return stops;
}

/**
 * Convert BackgroundState back to BackgroundLayer for compatibility
 */
export function backgroundStateToLayer(
  state: BackgroundState,
  existingLayer: BackgroundLayer
): Partial<BackgroundLayer> {
  const updates: Partial<BackgroundLayer> = {};

  switch (state.type) {
    case 'solid':
      updates.mode = 'solid';
      updates.value = state.solid.color;
      updates.solidConfig = state.solid;
      break;

    case 'gradient':
      updates.mode = 'gradient';
      updates.gradientConfig = convertToLegacyGradient(state.gradient);
      updates.value = ''; // Clear legacy value
      break;

    case 'pattern':
      updates.mode = 'pattern';
      updates.patternConfig = convertToLegacyPattern(state.pattern);
      updates.value = ''; // Clear legacy value
      break;

    case 'upload':
      updates.mode = 'upload';
      updates.value = state.upload?.dataUrl || '';
      break;
  }

  return updates;
}

/**
 * Convert unified gradient config to legacy format
 */
function convertToLegacyGradient(config: GradientConfig): any {
  return {
    type: config.kind,
    angle: config.angle,
    reverse: false,
    dithering: false,
    shape: config.shape,
    focalPosition: {
      x: config.center.x * 100,
      y: config.center.y * 100
    },
    center: {
      x: config.center.x * 100,
      y: config.center.y * 100
    },
    size: 100,
    repeat: config.repeat,
    stops: config.stops.map(stop => ({
      id: `stop-${Math.random().toString(36).substr(2, 9)}`,
      color: stop.color,
      position: stop.pos * 100
    }))
  };
}

/**
 * Convert unified pattern config to legacy format
 */
function convertToLegacyPattern(config: PatternConfig): any {
  return {
    type: config.name,
    foreground: config.fg,
    background: config.bg,
    scale: config.scale * 100,
    rotation: config.rotation,
    opacity: config.opacity * 100,
    radius: config.params.radius,
    spacing: config.params.spacing,
    thickness: config.params.thickness,
    lineWidth: config.params.lineWidth,
    cellSize: config.params.cellSize,
    intensity: config.params.intensity,
    roughness: config.params.roughness
  };
}

/**
 * Validate background state structure
 */
export function validateBackgroundState(state: any): state is BackgroundState {
  if (!state || typeof state !== 'object') return false;
  if (!['solid', 'gradient', 'pattern', 'upload'].includes(state.type)) return false;

  // Type-specific validation
  if (state.type === 'solid' && (!state.solid || typeof state.solid.color !== 'string')) {
    return false;
  }

  if (state.type === 'gradient') {
    if (!state.gradient || !Array.isArray(state.gradient.stops)) return false;
    if (state.gradient.stops.length < 2) return false;
  }

  if (state.type === 'pattern') {
    if (!state.pattern || !state.pattern.name) return false;
  }

  return true;
}