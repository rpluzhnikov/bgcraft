/**
 * Curated gradient presets
 */

import type { GradientPreset } from '../types/fills';

export const GRADIENT_PRESETS: GradientPreset[] = [
  // Linear Gradients
  {
    id: 'linear-purple-dream',
    name: 'Purple Dream',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#667EEA', position: 0 },
        { id: '2', color: '#764BA2', position: 100 }
      ]
    }
  },
  {
    id: 'linear-ocean-blue',
    name: 'Ocean Blue',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#4FACFE', position: 0 },
        { id: '2', color: '#00F2FE', position: 100 }
      ]
    }
  },
  {
    id: 'linear-sunset',
    name: 'Sunset',
    config: {
      type: 'linear',
      angle: 180,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#FA709A', position: 0 },
        { id: '2', color: '#FEE140', position: 100 }
      ]
    }
  },
  {
    id: 'linear-forest',
    name: 'Forest',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#0BA360', position: 0 },
        { id: '2', color: '#3CBA92', position: 100 }
      ]
    }
  },
  {
    id: 'linear-peach',
    name: 'Peach',
    config: {
      type: 'linear',
      angle: 90,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#FFECD2', position: 0 },
        { id: '2', color: '#FCB69F', position: 100 }
      ]
    }
  },
  {
    id: 'linear-night-sky',
    name: 'Night Sky',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#2C3E50', position: 0 },
        { id: '2', color: '#4CA1AF', position: 100 }
      ]
    }
  },
  {
    id: 'linear-cherry',
    name: 'Cherry',
    config: {
      type: 'linear',
      angle: 90,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#EB3349', position: 0 },
        { id: '2', color: '#F45C43', position: 100 }
      ]
    }
  },
  {
    id: 'linear-mint',
    name: 'Mint',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#D299C2', position: 0 },
        { id: '2', color: '#FEF9D7', position: 100 }
      ]
    }
  },

  // Radial Gradients
  {
    id: 'radial-aurora',
    name: 'Aurora',
    config: {
      type: 'radial',
      shape: 'circle',
      focalPosition: { x: 50, y: 50 },
      size: 100,
      stops: [
        { id: '1', color: '#A8EDEA', position: 0 },
        { id: '2', color: '#FED6E3', position: 100 }
      ]
    }
  },
  {
    id: 'radial-cosmic',
    name: 'Cosmic',
    config: {
      type: 'radial',
      shape: 'ellipse',
      focalPosition: { x: 30, y: 30 },
      size: 120,
      stops: [
        { id: '1', color: '#667DB6', position: 0 },
        { id: '2', color: '#0082C8', position: 50 },
        { id: '3', color: '#0082C8', position: 100 }
      ]
    }
  },
  {
    id: 'radial-flame',
    name: 'Flame',
    config: {
      type: 'radial',
      shape: 'circle',
      focalPosition: { x: 50, y: 80 },
      size: 100,
      stops: [
        { id: '1', color: '#FFB347', position: 0 },
        { id: '2', color: '#FFCC33', position: 50 },
        { id: '3', color: '#FF7F00', position: 100 }
      ]
    }
  },
  {
    id: 'radial-mystic',
    name: 'Mystic',
    config: {
      type: 'radial',
      shape: 'ellipse',
      focalPosition: { x: 50, y: 50 },
      size: 100,
      stops: [
        { id: '1', color: '#B993D6', position: 0 },
        { id: '2', color: '#8CA6DB', position: 100 }
      ]
    }
  },

  // Complex Linear with Multiple Stops
  {
    id: 'linear-rainbow',
    name: 'Rainbow',
    config: {
      type: 'linear',
      angle: 90,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#FF0080', position: 0 },
        { id: '2', color: '#FF8C00', position: 20 },
        { id: '3', color: '#FFD700', position: 40 },
        { id: '4', color: '#00FF00', position: 60 },
        { id: '5', color: '#00CED1', position: 80 },
        { id: '6', color: '#9400D3', position: 100 }
      ]
    }
  },
  {
    id: 'linear-pastel',
    name: 'Pastel',
    config: {
      type: 'linear',
      angle: 45,
      reverse: false,
      dithering: true,
      stops: [
        { id: '1', color: '#FFE4E1', position: 0 },
        { id: '2', color: '#E6E6FA', position: 25 },
        { id: '3', color: '#F0FFFF', position: 50 },
        { id: '4', color: '#F5FFFA', position: 75 },
        { id: '5', color: '#FFFACD', position: 100 }
      ]
    }
  },

  // Conic Gradients
  {
    id: 'conic-spectrum',
    name: 'Spectrum Wheel',
    config: {
      type: 'conic',
      angle: 0,
      center: { x: 50, y: 50 },
      repeat: false,
      stops: [
        { id: '1', color: '#FF0000', position: 0 },
        { id: '2', color: '#FF7F00', position: 14 },
        { id: '3', color: '#FFFF00', position: 28 },
        { id: '4', color: '#00FF00', position: 42 },
        { id: '5', color: '#0000FF', position: 56 },
        { id: '6', color: '#4B0082', position: 70 },
        { id: '7', color: '#9400D3', position: 84 },
        { id: '8', color: '#FF0000', position: 100 }
      ]
    }
  },
  {
    id: 'conic-pie',
    name: 'Pie Chart',
    config: {
      type: 'conic',
      angle: 0,
      center: { x: 50, y: 50 },
      repeat: false,
      stops: [
        { id: '1', color: '#3B82F6', position: 0 },
        { id: '2', color: '#3B82F6', position: 25 },
        { id: '3', color: '#10B981', position: 25 },
        { id: '4', color: '#10B981', position: 50 },
        { id: '5', color: '#F59E0B', position: 50 },
        { id: '6', color: '#F59E0B', position: 75 },
        { id: '7', color: '#EF4444', position: 75 },
        { id: '8', color: '#EF4444', position: 100 }
      ]
    }
  },

  // More Linear Gradients
  {
    id: 'linear-midnight',
    name: 'Midnight',
    config: {
      type: 'linear',
      angle: 180,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#020024', position: 0 },
        { id: '2', color: '#090979', position: 35 },
        { id: '3', color: '#00D4FF', position: 100 }
      ]
    }
  },
  {
    id: 'linear-lavender',
    name: 'Lavender',
    config: {
      type: 'linear',
      angle: 135,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#E8B4F3', position: 0 },
        { id: '2', color: '#B8B3F2', position: 100 }
      ]
    }
  },
  {
    id: 'linear-gold-rush',
    name: 'Gold Rush',
    config: {
      type: 'linear',
      angle: 45,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#F4E2D8', position: 0 },
        { id: '2', color: '#BA5370', position: 100 }
      ]
    }
  },
  {
    id: 'linear-electric',
    name: 'Electric',
    config: {
      type: 'linear',
      angle: 90,
      reverse: false,
      dithering: false,
      stops: [
        { id: '1', color: '#330867', position: 0 },
        { id: '2', color: '#30CFD0', position: 100 }
      ]
    }
  },

  // More Radial Gradients
  {
    id: 'radial-spotlight',
    name: 'Spotlight',
    config: {
      type: 'radial',
      shape: 'circle',
      focalPosition: { x: 50, y: 20 },
      size: 80,
      stops: [
        { id: '1', color: '#FFFFFF', position: 0 },
        { id: '2', color: '#000000', position: 100 }
      ]
    }
  },
  {
    id: 'radial-bubble',
    name: 'Bubble',
    config: {
      type: 'radial',
      shape: 'circle',
      focalPosition: { x: 30, y: 30 },
      size: 60,
      stops: [
        { id: '1', color: '#FFFFFF', position: 0 },
        { id: '2', color: '#87CEEB', position: 50 },
        { id: '3', color: '#4682B4', position: 100 }
      ]
    }
  },
  {
    id: 'radial-warm-glow',
    name: 'Warm Glow',
    config: {
      type: 'radial',
      shape: 'ellipse',
      focalPosition: { x: 50, y: 50 },
      size: 100,
      stops: [
        { id: '1', color: '#FFD89B', position: 0 },
        { id: '2', color: '#19547B', position: 100 }
      ]
    }
  },

  // Additional Conic
  {
    id: 'conic-clock',
    name: 'Clock Face',
    config: {
      type: 'conic',
      angle: 90,
      center: { x: 50, y: 50 },
      repeat: true,
      stops: [
        { id: '1', color: '#FFFFFF', position: 0 },
        { id: '2', color: '#E5E7EB', position: 8.33 },
        { id: '3', color: '#FFFFFF', position: 16.66 }
      ]
    }
  }
];