/**
 * Snapping and Alignment Utilities
 * Provides functions for snapping elements to grid, guides, and other elements
 */

import type { Vec2, Layer } from '../types/index'
import { GRID_SIZE, SNAP_THRESHOLD } from '../state/constants'

export interface SnapResult {
  x: number
  y: number
  snappedX: boolean
  snappedY: boolean
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal'
  position: number
  source: 'center' | 'edge' | 'grid'
  label?: string
}

/**
 * Snap a position to grid
 * @param position - Position to snap
 * @param gridSize - Grid size (default from constants)
 * @returns Snapped position
 */
export function snapToGrid(
  position: Vec2,
  gridSize: number = GRID_SIZE
): Vec2 {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  }
}

/**
 * Snap a single value to grid
 * @param value - Value to snap
 * @param gridSize - Grid size
 * @returns Snapped value
 */
export function snapValueToGrid(
  value: number,
  gridSize: number = GRID_SIZE
): number {
  return Math.round(value / gridSize) * gridSize
}

/**
 * Snap position to canvas center lines
 * @param position - Position to snap
 * @param canvasSize - Canvas dimensions
 * @param threshold - Snap distance threshold
 * @returns Snap result with flags
 */
export function snapToCenter(
  position: Vec2,
  canvasSize: { w: number; h: number },
  threshold: number = SNAP_THRESHOLD
): SnapResult {
  const centerX = canvasSize.w / 2
  const centerY = canvasSize.h / 2

  const snappedX = Math.abs(position.x - centerX) <= threshold
  const snappedY = Math.abs(position.y - centerY) <= threshold

  return {
    x: snappedX ? centerX : position.x,
    y: snappedY ? centerY : position.y,
    snappedX,
    snappedY,
  }
}

/**
 * Get bounding box for a layer
 * @param layer - Layer to get bounds for
 * @returns Bounding box { x, y, width, height }
 */
export function getLayerBounds(layer: Layer): {
  x: number
  y: number
  width: number
  height: number
} {
  const x = layer.position.x
  const y = layer.position.y

  let width = 0
  let height = 0

  switch (layer.type) {
    case 'text':
      width = layer.width || 200
      height = layer.height || layer.fontSize * 1.2
      break
    case 'qr':
      width = layer.simpleConfig?.size || 200
      height = layer.simpleConfig?.size || 200
      break
    case 'contact':
      width = 200 // Estimated
      height = layer.size + 16
      break
    case 'image':
      width = layer.width || layer.naturalSize?.w || 200
      height = layer.height || layer.naturalSize?.h || 200
      break
    case 'background':
      width = 0
      height = 0
      break
  }

  return { x, y, width, height }
}

/**
 * Snap position to other elements
 * @param position - Position to snap
 * @param currentLayer - Current layer being moved
 * @param otherLayers - Other layers to snap to
 * @param threshold - Snap distance threshold
 * @returns Snap result with flags
 */
export function snapToElements(
  position: Vec2,
  currentLayer: Layer,
  otherLayers: Layer[],
  threshold: number = SNAP_THRESHOLD
): SnapResult {
  let snappedX = false
  let snappedY = false
  let finalX = position.x
  let finalY = position.y

  const currentBounds = getLayerBounds(currentLayer)

  // Calculate edges of current element
  const currentLeft = position.x
  const currentRight = position.x + currentBounds.width
  const currentCenterX = position.x + currentBounds.width / 2
  const currentTop = position.y
  const currentBottom = position.y + currentBounds.height
  const currentCenterY = position.y + currentBounds.height / 2

  // Check snap against each other layer
  for (const other of otherLayers) {
    if (other.id === currentLayer.id || other.type === 'background') continue

    const otherBounds = getLayerBounds(other)
    const otherLeft = other.position.x
    const otherRight = other.position.x + otherBounds.width
    const otherCenterX = other.position.x + otherBounds.width / 2
    const otherTop = other.position.y
    const otherBottom = other.position.y + otherBounds.height
    const otherCenterY = other.position.y + otherBounds.height / 2

    // Snap X axis (left, right, center)
    if (!snappedX) {
      // Left to left
      if (Math.abs(currentLeft - otherLeft) <= threshold) {
        finalX = otherLeft
        snappedX = true
      }
      // Right to right
      else if (Math.abs(currentRight - otherRight) <= threshold) {
        finalX = otherRight - currentBounds.width
        snappedX = true
      }
      // Left to right
      else if (Math.abs(currentLeft - otherRight) <= threshold) {
        finalX = otherRight
        snappedX = true
      }
      // Right to left
      else if (Math.abs(currentRight - otherLeft) <= threshold) {
        finalX = otherLeft - currentBounds.width
        snappedX = true
      }
      // Center to center
      else if (Math.abs(currentCenterX - otherCenterX) <= threshold) {
        finalX = otherCenterX - currentBounds.width / 2
        snappedX = true
      }
    }

    // Snap Y axis (top, bottom, center)
    if (!snappedY) {
      // Top to top
      if (Math.abs(currentTop - otherTop) <= threshold) {
        finalY = otherTop
        snappedY = true
      }
      // Bottom to bottom
      else if (Math.abs(currentBottom - otherBottom) <= threshold) {
        finalY = otherBottom - currentBounds.height
        snappedY = true
      }
      // Top to bottom
      else if (Math.abs(currentTop - otherBottom) <= threshold) {
        finalY = otherBottom
        snappedY = true
      }
      // Bottom to top
      else if (Math.abs(currentBottom - otherTop) <= threshold) {
        finalY = otherTop - currentBounds.height
        snappedY = true
      }
      // Center to center
      else if (Math.abs(currentCenterY - otherCenterY) <= threshold) {
        finalY = otherCenterY - currentBounds.height / 2
        snappedY = true
      }
    }

    // Early exit if both axes snapped
    if (snappedX && snappedY) break
  }

  return {
    x: finalX,
    y: finalY,
    snappedX,
    snappedY,
  }
}

/**
 * Calculate alignment guides for a layer
 * @param layer - Layer to calculate guides for
 * @param otherLayers - Other layers to align with
 * @param canvasSize - Canvas dimensions
 * @returns Array of alignment guides to render
 */
export function calculateAlignmentGuides(
  layer: Layer,
  otherLayers: Layer[],
  canvasSize: { w: number; h: number }
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = []
  const bounds = getLayerBounds(layer)

  const left = layer.position.x
  const right = layer.position.x + bounds.width
  const centerX = layer.position.x + bounds.width / 2
  const top = layer.position.y
  const bottom = layer.position.y + bounds.height
  const centerY = layer.position.y + bounds.height / 2

  // Canvas center guides
  const canvasCenterX = canvasSize.w / 2
  const canvasCenterY = canvasSize.h / 2

  if (Math.abs(centerX - canvasCenterX) < SNAP_THRESHOLD) {
    guides.push({
      type: 'vertical',
      position: canvasCenterX,
      source: 'center',
      label: 'Center',
    })
  }

  if (Math.abs(centerY - canvasCenterY) < SNAP_THRESHOLD) {
    guides.push({
      type: 'horizontal',
      position: canvasCenterY,
      source: 'center',
      label: 'Center',
    })
  }

  // Alignment with other layers
  for (const other of otherLayers) {
    if (other.id === layer.id || other.type === 'background') continue

    const otherBounds = getLayerBounds(other)
    const otherLeft = other.position.x
    const otherRight = other.position.x + otherBounds.width
    const otherCenterX = other.position.x + otherBounds.width / 2
    const otherTop = other.position.y
    const otherBottom = other.position.y + otherBounds.height
    const otherCenterY = other.position.y + otherBounds.height / 2

    // Vertical guides (X axis)
    if (Math.abs(left - otherLeft) < SNAP_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: otherLeft,
        source: 'edge',
        label: 'Align Left',
      })
    }
    if (Math.abs(right - otherRight) < SNAP_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: otherRight,
        source: 'edge',
        label: 'Align Right',
      })
    }
    if (Math.abs(centerX - otherCenterX) < SNAP_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: otherCenterX,
        source: 'edge',
        label: 'Align Center',
      })
    }

    // Horizontal guides (Y axis)
    if (Math.abs(top - otherTop) < SNAP_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: otherTop,
        source: 'edge',
        label: 'Align Top',
      })
    }
    if (Math.abs(bottom - otherBottom) < SNAP_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: otherBottom,
        source: 'edge',
        label: 'Align Bottom',
      })
    }
    if (Math.abs(centerY - otherCenterY) < SNAP_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: otherCenterY,
        source: 'edge',
        label: 'Align Middle',
      })
    }
  }

  // Remove duplicate guides
  return guides.filter(
    (guide, index, self) =>
      index ===
      self.findIndex(
        (g) => g.type === guide.type && g.position === guide.position
      )
  )
}

/**
 * Combine all snapping methods
 * @param position - Position to snap
 * @param layer - Current layer
 * @param otherLayers - Other layers
 * @param canvasSize - Canvas dimensions
 * @param enableGrid - Enable grid snapping
 * @param enableCenter - Enable center snapping
 * @param enableElements - Enable element snapping
 * @returns Final snapped position with flags
 */
export function smartSnap(
  position: Vec2,
  layer: Layer,
  otherLayers: Layer[],
  canvasSize: { w: number; h: number },
  options: {
    enableGrid?: boolean
    enableCenter?: boolean
    enableElements?: boolean
  } = {}
): SnapResult {
  const { enableGrid = true, enableCenter = true, enableElements = true } = options

  let result: SnapResult = {
    x: position.x,
    y: position.y,
    snappedX: false,
    snappedY: false,
  }

  // Priority order: Elements > Center > Grid

  // Try snapping to other elements first
  if (enableElements) {
    const elementSnap = snapToElements(
      { x: result.x, y: result.y },
      layer,
      otherLayers
    )
    if (elementSnap.snappedX || elementSnap.snappedY) {
      result = elementSnap
    }
  }

  // If not snapped to elements, try center lines
  if (enableCenter && (!result.snappedX || !result.snappedY)) {
    const centerSnap = snapToCenter({ x: result.x, y: result.y }, canvasSize)
    if (!result.snappedX && centerSnap.snappedX) {
      result.x = centerSnap.x
      result.snappedX = true
    }
    if (!result.snappedY && centerSnap.snappedY) {
      result.y = centerSnap.y
      result.snappedY = true
    }
  }

  // Finally, snap to grid if enabled and nothing else snapped
  if (enableGrid && (!result.snappedX || !result.snappedY)) {
    const gridSnap = snapToGrid({ x: result.x, y: result.y })
    if (!result.snappedX) {
      result.x = gridSnap.x
    }
    if (!result.snappedY) {
      result.y = gridSnap.y
    }
  }

  return result
}

/**
 * Calculate distance between two points
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance
 */
export function distance(p1: Vec2, p2: Vec2): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Clamp position within canvas bounds
 * @param position - Position to clamp
 * @param canvasSize - Canvas dimensions
 * @returns Clamped position
 */
export function clampToCanvas(
  position: Vec2,
  canvasSize: { w: number; h: number }
): Vec2 {
  return {
    x: Math.max(0, Math.min(position.x, canvasSize.w)),
    y: Math.max(0, Math.min(position.y, canvasSize.h)),
  }
}
