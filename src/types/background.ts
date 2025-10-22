/**
 * Unified Background Data Model
 * Single source of truth for background state
 */

// Background type discriminator
export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'upload';

// Gradient kinds
export type GradientKind = 'linear' | 'radial' | 'conic';

// Pattern names
export type PatternName = 'dots' | 'stripes' | 'grid' | 'noise';

// Position type (normalized 0-1)
export interface Position {
  x: number;
  y: number;
}

// Gradient stop
export interface GradientStop {
  pos: number; // 0-1 normalized position
  color: string;
}

// Solid configuration
export interface SolidConfig {
  color: string;
}

// Gradient configuration
export interface GradientConfig {
  kind: GradientKind;
  angle: number; // 0-360 degrees
  center: Position; // 0-1 normalized
  shape: 'circle' | 'ellipse';
  repeat: boolean;
  stops: GradientStop[];
  seed?: number; // For randomize feature
}

// Pattern configuration
export interface PatternConfig {
  name: PatternName;
  fg: string; // Foreground color
  bg: string; // Background color (can be transparent with alpha)
  scale: number; // Scale multiplier (1 = 100%)
  rotation: number; // 0-360 degrees
  opacity: number; // 0-1 normalized
  params: {
    // Dots
    radius?: number;
    // Stripes
    thickness?: number;
    // Grid
    lineWidth?: number;
    cellSize?: number;
    // Noise
    intensity?: number;
    roughness?: number;
    // Common
    spacing?: number;
  };
}

// Upload configuration
export interface UploadConfig {
  dataUrl: string;
  filename?: string;
  naturalSize?: { w: number; h: number };
}

// Palette state
export interface PaletteState {
  recents: string[]; // Max 12
  saved: Array<{ id: string; name: string; color: string }>; // Max 24
  active: string[]; // Currently active palette colors
}

// Unified background state
export interface BackgroundState {
  type: BackgroundType;
  solid: SolidConfig;
  gradient: GradientConfig;
  pattern: PatternConfig;
  upload?: UploadConfig;
  palettes: PaletteState;
}

// Default configurations
export const DEFAULT_SOLID: SolidConfig = {
  color: '#FFFFFF'
};

export const DEFAULT_GRADIENT: GradientConfig = {
  kind: 'linear',
  angle: 135,
  center: { x: 0.5, y: 0.5 },
  shape: 'circle',
  repeat: false,
  stops: [
    { pos: 0, color: '#667EEA' },
    { pos: 1, color: '#764BA2' }
  ]
};

export const DEFAULT_PATTERN: PatternConfig = {
  name: 'dots',
  fg: '#E5E7EB',
  bg: '#FFFFFF',
  scale: 1,
  rotation: 0,
  opacity: 1,
  params: {
    radius: 3,
    spacing: 20
  }
};

export const DEFAULT_PALETTES: PaletteState = {
  recents: [],
  saved: [],
  active: []
};

export const DEFAULT_BACKGROUND_STATE: BackgroundState = {
  type: 'gradient',
  solid: DEFAULT_SOLID,
  gradient: DEFAULT_GRADIENT,
  pattern: DEFAULT_PATTERN,
  palettes: DEFAULT_PALETTES
};

// Helper type guards
export function isSolidBackground(state: BackgroundState): state is BackgroundState & { type: 'solid' } {
  return state.type === 'solid';
}

export function isGradientBackground(state: BackgroundState): state is BackgroundState & { type: 'gradient' } {
  return state.type === 'gradient';
}

export function isPatternBackground(state: BackgroundState): state is BackgroundState & { type: 'pattern' } {
  return state.type === 'pattern';
}

export function isUploadBackground(state: BackgroundState): state is BackgroundState & { type: 'upload' } {
  return state.type === 'upload';
}