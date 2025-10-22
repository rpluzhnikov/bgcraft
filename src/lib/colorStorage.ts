/**
 * Color Storage Service
 * Manages recent colors, saved swatches, and palettes in localStorage
 */

export interface SavedSwatch {
  id: string;
  color: string;
  name: string;
  createdAt: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  type: 'monochrome' | 'complementary' | 'analogous' | 'triadic' | 'custom';
  createdAt: number;
}

const STORAGE_PREFIX = 'linkedin-cover-gen:colors';
const RECENT_COLORS_KEY = `${STORAGE_PREFIX}:recent`;
const SAVED_SWATCHES_KEY = `${STORAGE_PREFIX}:swatches`;
const PALETTES_KEY = `${STORAGE_PREFIX}:palettes`;

const MAX_RECENT_COLORS = 12;
const MAX_SAVED_SWATCHES = 24;

/**
 * Get recent colors from storage
 */
export function getRecentColors(): string[] {
  try {
    const data = localStorage.getItem(RECENT_COLORS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load recent colors:', error);
    return [];
  }
}

/**
 * Add a color to recent colors
 * Automatically maintains max limit and removes duplicates
 */
export function addRecentColor(color: string): void {
  try {
    let recents = getRecentColors();

    // Remove existing instance if present
    recents = recents.filter(c => c.toLowerCase() !== color.toLowerCase());

    // Add to beginning
    recents.unshift(color);

    // Maintain max limit
    recents = recents.slice(0, MAX_RECENT_COLORS);

    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recents));
  } catch (error) {
    console.error('Failed to save recent color:', error);
  }
}

/**
 * Clear recent colors
 */
export function clearRecentColors(): void {
  try {
    localStorage.removeItem(RECENT_COLORS_KEY);
  } catch (error) {
    console.error('Failed to clear recent colors:', error);
  }
}

/**
 * Get saved swatches from storage
 */
export function getSavedSwatches(): SavedSwatch[] {
  try {
    const data = localStorage.getItem(SAVED_SWATCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved swatches:', error);
    return [];
  }
}

/**
 * Add a new saved swatch
 */
export function addSavedSwatch(color: string, name: string): SavedSwatch | null {
  try {
    const swatches = getSavedSwatches();

    // Check if at max limit
    if (swatches.length >= MAX_SAVED_SWATCHES) {
      console.warn('Maximum saved swatches reached');
      return null;
    }

    // Check for duplicate color
    if (swatches.some(s => s.color.toLowerCase() === color.toLowerCase())) {
      console.warn('Color already saved');
      return null;
    }

    const newSwatch: SavedSwatch = {
      id: `swatch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      color,
      name: name || color,
      createdAt: Date.now(),
    };

    swatches.push(newSwatch);
    localStorage.setItem(SAVED_SWATCHES_KEY, JSON.stringify(swatches));

    return newSwatch;
  } catch (error) {
    console.error('Failed to save swatch:', error);
    return null;
  }
}

/**
 * Update a saved swatch's name
 */
export function updateSwatchName(id: string, name: string): boolean {
  try {
    const swatches = getSavedSwatches();
    const index = swatches.findIndex(s => s.id === id);

    if (index === -1) return false;

    swatches[index].name = name;
    localStorage.setItem(SAVED_SWATCHES_KEY, JSON.stringify(swatches));

    return true;
  } catch (error) {
    console.error('Failed to update swatch name:', error);
    return false;
  }
}

/**
 * Delete a saved swatch
 */
export function deleteSavedSwatch(id: string): boolean {
  try {
    const swatches = getSavedSwatches();
    const filtered = swatches.filter(s => s.id !== id);

    if (filtered.length === swatches.length) return false;

    localStorage.setItem(SAVED_SWATCHES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete swatch:', error);
    return false;
  }
}

/**
 * Get color palettes from storage
 */
export function getColorPalettes(): ColorPalette[] {
  try {
    const data = localStorage.getItem(PALETTES_KEY);
    return data ? JSON.parse(data) : getDefaultPalettes();
  } catch (error) {
    console.error('Failed to load palettes:', error);
    return getDefaultPalettes();
  }
}

/**
 * Add a new color palette
 */
export function addColorPalette(palette: Omit<ColorPalette, 'id' | 'createdAt'>): ColorPalette {
  try {
    const palettes = getColorPalettes();

    const newPalette: ColorPalette = {
      ...palette,
      id: `palette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    palettes.push(newPalette);
    localStorage.setItem(PALETTES_KEY, JSON.stringify(palettes));

    return newPalette;
  } catch (error) {
    console.error('Failed to add palette:', error);
    throw error;
  }
}

/**
 * Delete a color palette
 */
export function deleteColorPalette(id: string): boolean {
  try {
    const palettes = getColorPalettes();
    const filtered = palettes.filter(p => p.id !== id);

    if (filtered.length === palettes.length) return false;

    localStorage.setItem(PALETTES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete palette:', error);
    return false;
  }
}

/**
 * Get default preset palettes
 */
function getDefaultPalettes(): ColorPalette[] {
  return [
    {
      id: 'default-professional',
      name: 'Professional',
      colors: ['#1E3A8A', '#3B82F6', '#60A5FA', '#DBEAFE', '#F3F4F6'],
      type: 'custom',
      createdAt: 0,
    },
    {
      id: 'default-creative',
      name: 'Creative',
      colors: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      type: 'custom',
      createdAt: 0,
    },
    {
      id: 'default-minimal',
      name: 'Minimal',
      colors: ['#000000', '#4B5563', '#9CA3AF', '#E5E7EB', '#FFFFFF'],
      type: 'monochrome',
      createdAt: 0,
    },
    {
      id: 'default-nature',
      name: 'Nature',
      colors: ['#14532D', '#166534', '#16A34A', '#86EFAC', '#F0FDF4'],
      type: 'analogous',
      createdAt: 0,
    },
  ];
}

/**
 * Reset palettes to defaults
 */
export function resetPalettesToDefaults(): void {
  try {
    localStorage.setItem(PALETTES_KEY, JSON.stringify(getDefaultPalettes()));
  } catch (error) {
    console.error('Failed to reset palettes:', error);
  }
}