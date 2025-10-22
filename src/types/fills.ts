/**
 * Enhanced fill type definitions for backgrounds
 */

// Gradient Stop
export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
}

// Gradient Base Configuration
export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  stops: GradientStop[];
}

// Linear Gradient Configuration
export interface LinearGradientConfig extends GradientConfig {
  type: 'linear';
  angle: number; // 0-360
  reverse: boolean;
  dithering: boolean;
}

// Radial Gradient Configuration
export interface RadialGradientConfig extends GradientConfig {
  type: 'radial';
  shape: 'circle' | 'ellipse';
  focalPosition: {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
  };
  size: number; // 0-100 percentage
}

// Conic Gradient Configuration
export interface ConicGradientConfig extends GradientConfig {
  type: 'conic';
  angle: number; // 0-360
  center: {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
  };
  repeat: boolean;
}

export type AnyGradientConfig = LinearGradientConfig | RadialGradientConfig | ConicGradientConfig;

// Pattern Types
export type PatternType = 'dots' | 'stripes' | 'grid' | 'noise';

// Pattern Base Configuration
export interface PatternConfig {
  type: PatternType;
  foreground: string;
  background: string;
  scale: number; // 10-200 percentage
  rotation: number; // 0-360 degrees
  opacity: number; // 0-100 percentage
}

// Dots Pattern Configuration
export interface DotsPatternConfig extends PatternConfig {
  type: 'dots';
  radius: number; // 1-50 pixels
  spacing: number; // 10-100 pixels
}

// Stripes Pattern Configuration
export interface StripesPatternConfig extends PatternConfig {
  type: 'stripes';
  thickness: number; // 1-50 pixels
  spacing: number; // 10-100 pixels
}

// Grid Pattern Configuration
export interface GridPatternConfig extends PatternConfig {
  type: 'grid';
  lineWidth: number; // 1-10 pixels
  cellSize: number; // 10-100 pixels
}

// Noise Pattern Configuration
export interface NoisePatternConfig extends PatternConfig {
  type: 'noise';
  intensity: number; // 0-100 percentage
  roughness: number; // 0-100 percentage
}

export type AnyPatternConfig =
  | DotsPatternConfig
  | StripesPatternConfig
  | GridPatternConfig
  | NoisePatternConfig;

// Fill State Management - stores configurations for each mode
export interface FillStateStore {
  solid: {
    color: string;
  };
  gradient: AnyGradientConfig;
  pattern: AnyPatternConfig;
}

// Gradient Preset
export interface GradientPreset {
  id: string;
  name: string;
  config: AnyGradientConfig;
  thumbnail?: string; // Optional pre-rendered thumbnail
}

// Default configurations
export const DEFAULT_LINEAR_GRADIENT: LinearGradientConfig = {
  type: 'linear',
  angle: 135,
  reverse: false,
  dithering: false,
  stops: [
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 }
  ]
};

export const DEFAULT_RADIAL_GRADIENT: RadialGradientConfig = {
  type: 'radial',
  shape: 'circle',
  focalPosition: { x: 50, y: 50 },
  size: 100,
  stops: [
    { id: '1', color: '#4facfe', position: 0 },
    { id: '2', color: '#00f2fe', position: 100 }
  ]
};

export const DEFAULT_CONIC_GRADIENT: ConicGradientConfig = {
  type: 'conic',
  angle: 0,
  center: { x: 50, y: 50 },
  repeat: false,
  stops: [
    { id: '1', color: '#ff0000', position: 0 },
    { id: '2', color: '#ffff00', position: 25 },
    { id: '3', color: '#00ff00', position: 50 },
    { id: '4', color: '#0000ff', position: 75 },
    { id: '5', color: '#ff0000', position: 100 }
  ]
};

export const DEFAULT_DOTS_PATTERN: DotsPatternConfig = {
  type: 'dots',
  foreground: '#e5e7eb',
  background: '#ffffff',
  scale: 100,
  rotation: 0,
  opacity: 100,
  radius: 3,
  spacing: 20
};

export const DEFAULT_STRIPES_PATTERN: StripesPatternConfig = {
  type: 'stripes',
  foreground: '#e5e7eb',
  background: '#ffffff',
  scale: 100,
  rotation: 45,
  opacity: 100,
  thickness: 10,
  spacing: 20
};

export const DEFAULT_GRID_PATTERN: GridPatternConfig = {
  type: 'grid',
  foreground: '#e5e7eb',
  background: '#ffffff',
  scale: 100,
  rotation: 0,
  opacity: 100,
  lineWidth: 1,
  cellSize: 20
};

export const DEFAULT_NOISE_PATTERN: NoisePatternConfig = {
  type: 'noise',
  foreground: '#000000',
  background: '#ffffff',
  scale: 100,
  rotation: 0,
  opacity: 100,
  intensity: 50,
  roughness: 50
};