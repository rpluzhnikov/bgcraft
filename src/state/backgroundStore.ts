/**
 * Background Store
 * Single source of truth for background state with typed selectors
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  BackgroundState,
  BackgroundType,
  GradientConfig,
  PatternConfig,
  GradientStop
} from '../types/background';
import {
  DEFAULT_BACKGROUND_STATE
} from '../types/background';
import { generateRandomGradient } from '../lib/fillGenerators';
import { addRecentColor, getSavedSwatches, getColorPalettes } from '../lib/colorStorage';

const STORAGE_KEY = 'linkedin-cover-gen:background-state';
const HISTORY_THROTTLE_MS = 300; // Throttle history entries during drag

interface BackgroundStore {
  // State
  current: BackgroundState;
  history: BackgroundState[];
  historyIndex: number;
  lastHistoryTime: number;

  // Actions
  setType: (type: BackgroundType) => void;
  setSolidColor: (color: string) => void;
  setGradient: (config: GradientConfig) => void;
  setGradientKind: (kind: GradientConfig['kind']) => void;
  addGradientStop: (stop: GradientStop) => void;
  removeGradientStop: (index: number) => void;
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
  randomizeGradient: () => void;
  setPattern: (config: PatternConfig) => void;
  setUpload: (dataUrl: string) => void;

  // Palette actions
  addRecentColor: (color: string) => void;
  syncPalettes: () => void;

  // History actions
  saveHistory: (throttle?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;

  // Reset
  reset: () => void;
}

export const useBackgroundStore = create<BackgroundStore>()(
  immer((set, get) => ({
    // Initial state
    current: DEFAULT_BACKGROUND_STATE,
    history: [DEFAULT_BACKGROUND_STATE],
    historyIndex: 0,
    lastHistoryTime: 0,

    // Set background type
    setType: (type) => {
      set((state) => {
        state.current.type = type;
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Set solid color
    setSolidColor: (color) => {
      set((state) => {
        state.current.solid.color = color;
      });
      get().addRecentColor(color);
      get().saveHistory();
      get().saveToStorage();
    },

    // Set gradient configuration
    setGradient: (config) => {
      set((state) => {
        state.current.gradient = config;
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Toggle gradient kind (for keyboard shortcut)
    setGradientKind: (kind) => {
      set((state) => {
        const current = state.current.gradient;
        state.current.gradient = {
          ...current,
          kind
        };
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Add gradient stop
    addGradientStop: (stop) => {
      set((state) => {
        if (state.current.gradient.stops.length >= 10) return;
        state.current.gradient.stops.push(stop);
        // Sort by position
        state.current.gradient.stops.sort((a, b) => a.pos - b.pos);
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Remove gradient stop
    removeGradientStop: (index) => {
      set((state) => {
        if (state.current.gradient.stops.length <= 2) return;
        state.current.gradient.stops.splice(index, 1);
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Update gradient stop (with optional throttling for drag)
    updateGradientStop: (index, updates) => {
      set((state) => {
        const stop = state.current.gradient.stops[index];
        if (stop) {
          Object.assign(stop, updates);
        }
      });
      // Throttle history during drag
      get().saveHistory(true);
      get().saveToStorage();
    },

    // Randomize gradient from active palette
    randomizeGradient: () => {
      const seed = Date.now();
      const randomConfig = generateRandomGradient(seed);

      // Convert to unified format
      const unifiedConfig: GradientConfig = {
        kind: randomConfig.type as GradientConfig['kind'],
        angle: ('angle' in randomConfig) ? randomConfig.angle : 0,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops: randomConfig.stops.map(s => ({
          pos: s.position / 100,
          color: s.color
        })),
        seed
      };

      if (randomConfig.type === 'radial') {
        unifiedConfig.center = {
          x: (randomConfig as any).focalPosition.x / 100,
          y: (randomConfig as any).focalPosition.y / 100
        };
        unifiedConfig.shape = (randomConfig as any).shape;
      } else if (randomConfig.type === 'conic') {
        unifiedConfig.center = {
          x: (randomConfig as any).center.x / 100,
          y: (randomConfig as any).center.y / 100
        };
        unifiedConfig.repeat = (randomConfig as any).repeat;
      }

      set((state) => {
        state.current.gradient = unifiedConfig;
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Set pattern configuration
    setPattern: (config) => {
      set((state) => {
        state.current.pattern = config;
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Set upload
    setUpload: (dataUrl) => {
      set((state) => {
        state.current.upload = { dataUrl };
      });
      get().saveHistory();
      get().saveToStorage();
    },

    // Add color to recents
    addRecentColor: (color) => {
      addRecentColor(color);
      get().syncPalettes();
    },

    // Sync palettes from storage
    syncPalettes: () => {
      const saved = getSavedSwatches();
      const palettes = getColorPalettes();

      set((state) => {
        state.current.palettes.saved = saved;
        // Get active palette from first palette
        if (palettes.length > 0) {
          state.current.palettes.active = palettes[0].colors;
        }
      });
    },

    // Save to history with optional throttling
    saveHistory: (throttle = false) => {
      const now = Date.now();
      const { lastHistoryTime } = get();

      // Throttle if requested and within throttle window
      if (throttle && now - lastHistoryTime < HISTORY_THROTTLE_MS) {
        // Update the current history entry instead of creating new one
        set((state) => {
          if (state.historyIndex >= 0) {
            state.history[state.historyIndex] = JSON.parse(JSON.stringify(state.current));
          }
        });
        return;
      }

      set((state) => {
        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1);

        // Add new history entry
        state.history.push(JSON.parse(JSON.stringify(state.current)));

        // Limit history size
        if (state.history.length > 50) {
          state.history.shift();
        } else {
          state.historyIndex++;
        }

        state.lastHistoryTime = now;
      });
    },

    // Undo
    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        set((state) => {
          state.historyIndex--;
          state.current = JSON.parse(JSON.stringify(history[state.historyIndex]));
        });
        get().saveToStorage();
      }
    },

    // Redo
    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        set((state) => {
          state.historyIndex++;
          state.current = JSON.parse(JSON.stringify(history[state.historyIndex]));
        });
        get().saveToStorage();
      }
    },

    // Check if can undo
    canUndo: () => {
      return get().historyIndex > 0;
    },

    // Check if can redo
    canRedo: () => {
      const { historyIndex, history } = get();
      return historyIndex < history.length - 1;
    },

    // Load from localStorage
    loadFromStorage: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set((state) => {
            state.current = parsed;
            state.history = [parsed];
            state.historyIndex = 0;
          });
        }
      } catch (error) {
        console.error('Failed to load background state:', error);
      }
      get().syncPalettes();
    },

    // Save to localStorage
    saveToStorage: () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(get().current));
      } catch (error) {
        console.error('Failed to save background state:', error);
      }
    },

    // Reset to defaults
    reset: () => {
      set((state) => {
        state.current = DEFAULT_BACKGROUND_STATE;
        state.history = [DEFAULT_BACKGROUND_STATE];
        state.historyIndex = 0;
      });
      get().saveToStorage();
    }
  }))
);

// Typed selectors
export const selectBackgroundState = (state: BackgroundStore) => state.current;
export const selectBackgroundType = (state: BackgroundStore) => state.current.type;
export const selectSolidConfig = (state: BackgroundStore) => state.current.solid;
export const selectGradientConfig = (state: BackgroundStore) => state.current.gradient;
export const selectPatternConfig = (state: BackgroundStore) => state.current.pattern;
export const selectUploadConfig = (state: BackgroundStore) => state.current.upload;
export const selectPalettes = (state: BackgroundStore) => state.current.palettes;
export const selectCanUndo = (state: BackgroundStore) => state.canUndo();
export const selectCanRedo = (state: BackgroundStore) => state.canRedo();

// Initialize on first import
if (typeof window !== 'undefined') {
  useBackgroundStore.getState().loadFromStorage();
}