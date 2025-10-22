export interface ColorPalette {
  id: string
  name: string
  colors: string[]
}

export const palettes: ColorPalette[] = [
  {
    id: 'professional',
    name: 'Professional',
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#ffffff'],
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#fecaca', '#fed7aa', '#fde68a', '#d9f99d', '#bfdbfe', '#ddd6fe'],
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: ['#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#f9fafb'],
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#ffffff'],
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: ['#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#7c2d12', '#c2410c', '#ea580c', '#fb923c', '#fdba74', '#fed7aa'],
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#86efac'],
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    colors: ['#581c87', '#7e22ce', '#9333ea', '#a855f7', '#c084fc', '#e9d5ff'],
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    colors: ['#881337', '#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
  },
  {
    id: 'mint',
    name: 'Fresh Mint',
    colors: ['#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#a7f3d0'],
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    colors: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24'],
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    colors: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#cbd5e1'],
  },
  {
    id: 'lavender',
    name: 'Soft Lavender',
    colors: ['#5b21b6', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    colors: ['#991b1b', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  },
]

// Helper to get palette by id
export const getPaletteById = (id: string): ColorPalette | undefined => {
  return palettes.find((p) => p.id === id)
}

// Helper to get random palette
export const getRandomPalette = (): ColorPalette => {
  return palettes[Math.floor(Math.random() * palettes.length)]
}

// Helper to get complementary color (simplified)
export const getComplementaryColor = (hex: string): string => {
  // Remove # if present
  const color = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)

  // Invert
  const invR = (255 - r).toString(16).padStart(2, '0')
  const invG = (255 - g).toString(16).padStart(2, '0')
  const invB = (255 - b).toString(16).padStart(2, '0')

  return `#${invR}${invG}${invB}`
}

// Helper to check if color is dark
export const isColorDark = (hex: string): boolean => {
  const color = hex.replace('#', '')
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}
