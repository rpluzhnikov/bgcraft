import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tool =
  | 'select'
  | 'text'
  | 'image'
  | 'contact'
  | 'qr'
  | 'background'
  | 'template';

interface UILayoutState {
  // Tool selection
  activeTool: Tool | null;

  // Panel visibility
  isPropertiesOpen: boolean;
  isLayersOpen: boolean;

  // Panel dimensions
  layersPanelHeight: number; // px, persisted
  propertiesPanelWidth: number; // px, persisted

  // View options
  showGrid: boolean;
  showSafeZone: boolean;
  showCenterLines: boolean;

  // Zoom
  zoomLevel: number; // percentage (100 = 100%)

  // Actions
  setActiveTool: (tool: Tool | null) => void;
  toggleProperties: () => void;
  setPropertiesOpen: (open: boolean) => void;
  toggleLayers: () => void;
  setLayersOpen: (open: boolean) => void;
  setLayersPanelHeight: (height: number) => void;
  setPropertiesPanelWidth: (width: number) => void;
  toggleGrid: () => void;
  setShowGrid: (show: boolean) => void;
  toggleSafeZone: () => void;
  setShowSafeZone: (show: boolean) => void;
  toggleCenterLines: () => void;
  setShowCenterLines: (show: boolean) => void;
  setZoomLevel: (level: number) => void;
  resetZoom: () => void;
}

const DEFAULT_LAYERS_HEIGHT = 200;
const DEFAULT_PROPERTIES_WIDTH = 320;
const MIN_LAYERS_HEIGHT = 120;
const MAX_LAYERS_HEIGHT = 500;
const MIN_PROPERTIES_WIDTH = 280;
const MAX_PROPERTIES_WIDTH = 400;

export const useUILayoutStore = create<UILayoutState>()(
  persist(
    (set) => ({
      // Initial state
      activeTool: 'background',
      isPropertiesOpen: true,
      isLayersOpen: false,
      layersPanelHeight: DEFAULT_LAYERS_HEIGHT,
      propertiesPanelWidth: DEFAULT_PROPERTIES_WIDTH,
      showGrid: false,
      showSafeZone: true,
      showCenterLines: false,
      zoomLevel: 100,

      // Actions
      setActiveTool: (tool) =>
        set((state) => ({
          activeTool: tool,
          // Auto-open properties when selecting a tool
          isPropertiesOpen: tool !== null ? true : state.isPropertiesOpen,
        })),

      toggleProperties: () =>
        set((state) => ({ isPropertiesOpen: !state.isPropertiesOpen })),

      setPropertiesOpen: (open) =>
        set({ isPropertiesOpen: open }),

      toggleLayers: () =>
        set((state) => ({ isLayersOpen: !state.isLayersOpen })),

      setLayersOpen: (open) =>
        set({ isLayersOpen: open }),

      setLayersPanelHeight: (height) =>
        set({
          layersPanelHeight: Math.max(
            MIN_LAYERS_HEIGHT,
            Math.min(MAX_LAYERS_HEIGHT, height)
          ),
        }),

      setPropertiesPanelWidth: (width) =>
        set({
          propertiesPanelWidth: Math.max(
            MIN_PROPERTIES_WIDTH,
            Math.min(MAX_PROPERTIES_WIDTH, width)
          ),
        }),

      toggleGrid: () =>
        set((state) => ({ showGrid: !state.showGrid })),

      setShowGrid: (show) =>
        set({ showGrid: show }),

      toggleSafeZone: () =>
        set((state) => ({ showSafeZone: !state.showSafeZone })),

      setShowSafeZone: (show) =>
        set({ showSafeZone: show }),

      toggleCenterLines: () =>
        set((state) => ({ showCenterLines: !state.showCenterLines })),

      setShowCenterLines: (show) =>
        set({ showCenterLines: show }),

      setZoomLevel: (level) =>
        set({ zoomLevel: Math.max(25, Math.min(200, level)) }),

      resetZoom: () =>
        set({ zoomLevel: 100 }),
    }),
    {
      name: 'linkedin-cover-gen:ui-layout',
      partialize: (state) => ({
        // Only persist these values
        isLayersOpen: state.isLayersOpen,
        layersPanelHeight: state.layersPanelHeight,
        propertiesPanelWidth: state.propertiesPanelWidth,
        showGrid: state.showGrid,
        showSafeZone: state.showSafeZone,
        showCenterLines: state.showCenterLines,
        zoomLevel: state.zoomLevel,
      }),
    }
  )
);

// Selectors
export const selectActiveTool = (state: UILayoutState) => state.activeTool;
export const selectIsPropertiesOpen = (state: UILayoutState) => state.isPropertiesOpen;
export const selectIsLayersOpen = (state: UILayoutState) => state.isLayersOpen;
export const selectLayersPanelHeight = (state: UILayoutState) => state.layersPanelHeight;
export const selectPropertiesPanelWidth = (state: UILayoutState) => state.propertiesPanelWidth;
export const selectViewOptions = (state: UILayoutState) => ({
  showGrid: state.showGrid,
  showSafeZone: state.showSafeZone,
  showCenterLines: state.showCenterLines,
});
export const selectZoomLevel = (state: UILayoutState) => state.zoomLevel;