import { create } from 'zustand'
import { produce } from 'immer'
import { nanoid } from 'nanoid'
import type { Layer, Project, HistoryState } from '../types/index'
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HISTORY } from './constants'

interface EditorState {
  // Current project state
  project: Project

  // History for undo/redo
  history: HistoryState[]
  historyIndex: number

  // Actions
  addLayer: (layer: Omit<Layer, 'id'>) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  deleteLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  selectLayer: (id: string | undefined) => void
  clearSelection: () => void

  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Project actions
  loadProject: (project: Project) => void
  resetProject: () => void
  setProjectName: (name: string) => void
  updateProjectMetadata: (updates: Partial<Pick<Project, 'name' | 'updatedAt'>>) => void

  // Internal helper
  _saveHistory: () => void
}

// Create default background layer
const createDefaultBackground = (): Layer => ({
  id: nanoid(),
  type: 'background',
  mode: 'gradient',
  value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: { x: 0, y: 0 },
  rotation: 0,
  opacity: 1,
  locked: true,
  name: 'Background',
  visible: true,
})

// Create initial project
const createInitialProject = (): Project => ({
  id: nanoid(),
  name: 'Untitled Project',
  size: { w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
  layers: [createDefaultBackground()],
  selectedId: undefined,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  project: createInitialProject(),
  history: [],
  historyIndex: -1,

  // Save current state to history
  _saveHistory: () => {
    const { project, history, historyIndex } = get()

    // Create history snapshot
    const snapshot: HistoryState = {
      layers: project.layers,
      selectedId: project.selectedId,
    }

    // Remove any "future" history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1)

    // Add new snapshot
    newHistory.push(snapshot)

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  // Add a new layer
  addLayer: (layer) => {
    set(
      produce((state: EditorState) => {
        const newLayer: Layer = {
          ...layer,
          id: nanoid(),
        } as Layer

        state.project.layers.push(newLayer)
        state.project.selectedId = newLayer.id
        state.project.updatedAt = Date.now()
      })
    )
    get()._saveHistory()
  },

  // Update an existing layer
  updateLayer: (id, updates) => {
    set(
      produce((state: EditorState) => {
        const layerIndex = state.project.layers.findIndex((l) => l.id === id)
        if (layerIndex !== -1) {
          // Merge updates while preserving type
          Object.assign(state.project.layers[layerIndex], updates)
          state.project.updatedAt = Date.now()
        }
      })
    )
    get()._saveHistory()
  },

  // Delete a layer
  deleteLayer: (id) => {
    set(
      produce((state: EditorState) => {
        const layerIndex = state.project.layers.findIndex((l) => l.id === id)
        if (layerIndex !== -1) {
          // Don't allow deleting the background layer (first layer)
          if (layerIndex === 0) return

          state.project.layers.splice(layerIndex, 1)

          // Clear selection if deleted layer was selected
          if (state.project.selectedId === id) {
            state.project.selectedId = undefined
          }

          state.project.updatedAt = Date.now()
        }
      })
    )
    get()._saveHistory()
  },

  // Duplicate a layer
  duplicateLayer: (id) => {
    set(
      produce((state: EditorState) => {
        const layerIndex = state.project.layers.findIndex((l) => l.id === id)
        if (layerIndex !== -1) {
          const originalLayer = state.project.layers[layerIndex]
          const duplicatedLayer: Layer = {
            ...originalLayer,
            id: nanoid(),
            name: `${originalLayer.name || originalLayer.type} copy`,
            position: {
              x: (originalLayer.position?.x || 0) + 20,
              y: (originalLayer.position?.y || 0) + 20,
            },
          }

          // Insert the duplicated layer right after the original
          state.project.layers.splice(layerIndex + 1, 0, duplicatedLayer)

          // Select the new layer
          state.project.selectedId = duplicatedLayer.id
          state.project.updatedAt = Date.now()
        }
      })
    )
    get()._saveHistory()
  },

  // Reorder layers (drag and drop)
  reorderLayers: (fromIndex, toIndex) => {
    set(
      produce((state: EditorState) => {
        // Don't allow moving the background layer (index 0)
        if (fromIndex === 0 || toIndex === 0) return

        const [movedLayer] = state.project.layers.splice(fromIndex, 1)
        state.project.layers.splice(toIndex, 0, movedLayer)
        state.project.updatedAt = Date.now()
      })
    )
    get()._saveHistory()
  },

  // Select a layer
  selectLayer: (id) => {
    set(
      produce((state: EditorState) => {
        state.project.selectedId = id
      })
    )
  },

  // Clear selection
  clearSelection: () => {
    set(
      produce((state: EditorState) => {
        state.project.selectedId = undefined
      })
    )
  },

  // Undo
  undo: () => {
    const { history, historyIndex } = get()

    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]

      set(
        produce((state: EditorState) => {
          state.project.layers = prevState.layers
          state.project.selectedId = prevState.selectedId
          state.project.updatedAt = Date.now()
          state.historyIndex = historyIndex - 1
        })
      )
    }
  },

  // Redo
  redo: () => {
    const { history, historyIndex } = get()

    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]

      set(
        produce((state: EditorState) => {
          state.project.layers = nextState.layers
          state.project.selectedId = nextState.selectedId
          state.project.updatedAt = Date.now()
          state.historyIndex = historyIndex + 1
        })
      )
    }
  },

  // Check if undo is available
  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },

  // Check if redo is available
  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  // Load a project
  loadProject: (project) => {
    set({
      project: {
        ...project,
        updatedAt: Date.now(),
      },
      history: [],
      historyIndex: -1,
    })
  },

  // Reset to a new empty project
  resetProject: () => {
    set({
      project: createInitialProject(),
      history: [],
      historyIndex: -1,
    })
  },

  // Set project name
  setProjectName: (name) => {
    set(
      produce((state: EditorState) => {
        state.project.name = name
        state.project.updatedAt = Date.now()
      })
    )
  },

  // Update project metadata
  updateProjectMetadata: (updates) => {
    set(
      produce((state: EditorState) => {
        if (updates.name !== undefined) {
          state.project.name = updates.name
        }
        state.project.updatedAt = Date.now()
      })
    )
  },
}))

// Selectors for derived state
export const selectProject = (state: EditorState) => state.project
export const selectLayers = (state: EditorState) => state.project.layers
export const selectSelectedLayerId = (state: EditorState) => state.project.selectedId
export const selectSelectedLayer = (state: EditorState) => {
  const { layers, selectedId } = state.project
  return selectedId ? layers.find((l) => l.id === selectedId) : undefined
}
export const selectCanUndo = (state: EditorState) => state.historyIndex > 0
export const selectCanRedo = (state: EditorState) =>
  state.historyIndex < state.history.length - 1
