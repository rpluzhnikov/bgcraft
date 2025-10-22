// Canvas dimensions for LinkedIn cover
export const CANVAS_WIDTH = 1584
export const CANVAS_HEIGHT = 396

// Safe zone - left side reserved for avatar
export const SAFE_ZONE_LEFT = 288
export const SAFE_ZONE_PADDING = 24

// Grid and snapping
export const GRID_SIZE = 8
export const SNAP_THRESHOLD = 10

// Default layer properties
export const DEFAULT_TEXT_LAYER = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 48,
  fontWeight: 'bold' as const,
  color: '#000000',
}

export const DEFAULT_CONTACT_LAYER = {
  style: 'solid' as const,
  gap: 8,
  size: 24,
  color: '#0077B5',
}

export const DEFAULT_QR_LAYER = {
  size: 120,
  foreColor: '#000000',
  backColor: '#ffffff',
  quietZone: 4,
}

// Export scales
export const EXPORT_SCALES = {
  '1x': 1,
  '2x': 2,
}

// History limit
export const MAX_HISTORY = 50

// Autosave interval (ms)
export const AUTOSAVE_INTERVAL = 5000

// Font options
export const FONT_FAMILIES = [
  'Inter, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Helvetica, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
]

// Font weights
export const FONT_WEIGHTS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
  { label: '300', value: 300 },
  { label: '400', value: 400 },
  { label: '500', value: 500 },
  { label: '600', value: 600 },
  { label: '700', value: 700 },
  { label: '800', value: 800 },
  { label: '900', value: 900 },
]
