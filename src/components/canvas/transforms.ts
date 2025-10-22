/**
 * Transform and Event Handler Utilities
 * Provides handlers for drag and transform events with snapping support
 */

import Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Layer } from '../../types/index'
import { smartSnap, clampToCanvas } from '../../lib/geometry'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../state/constants'

interface DragEndHandlerOptions {
  layer: Layer
  allLayers: Layer[]
  updateLayer: (id: string, updates: Partial<Layer>) => void
  enableSnapping?: boolean
}

/**
 * Handle drag end with snapping
 */
export function handleDragEnd(
  e: KonvaEventObject<DragEvent>,
  options: DragEndHandlerOptions
) {
  const { layer, allLayers, updateLayer, enableSnapping = true } = options
  const node = e.target

  let finalPosition = {
    x: node.x(),
    y: node.y(),
  }

  // Apply snapping if enabled
  if (enableSnapping) {
    const snapped = smartSnap(
      finalPosition,
      layer,
      allLayers,
      { w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
      { enableGrid: true, enableCenter: true, enableElements: true }
    )
    finalPosition = { x: snapped.x, y: snapped.y }
  }

  // Clamp to canvas bounds
  finalPosition = clampToCanvas(finalPosition, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
  })

  // Update node position
  node.position(finalPosition)

  // Update store
  updateLayer(layer.id, {
    position: finalPosition,
  })
}

interface TransformEndHandlerOptions {
  layer: Layer
  updateLayer: (id: string, updates: Partial<Layer>) => void
}

/**
 * Handle transform end (scale, rotate)
 */
export function handleTransformEnd(
  e: KonvaEventObject<Event>,
  options: TransformEndHandlerOptions
) {
  const { layer, updateLayer } = options
  const node = e.target

  // Get transform values
  const scaleX = node.scaleX()
  const scaleY = node.scaleY()
  const rotation = node.rotation()

  // For text and images, update dimensions instead of scale
  if (layer.type === 'text' || layer.type === 'image') {
    const width = node.width() * scaleX
    const height = node.height() * scaleY

    // Reset scale to 1 and apply to dimensions
    node.scaleX(1)
    node.scaleY(1)
    node.width(width)
    node.height(height)

    updateLayer(layer.id, {
      width,
      height,
      rotation,
      position: {
        x: node.x(),
        y: node.y(),
      },
    })
  } else if (layer.type === 'qr') {
    // For QR codes, maintain aspect ratio and update size in simpleConfig
    const avgScale = (scaleX + scaleY) / 2
    const currentSize = layer.simpleConfig?.size || 200
    const newSize = Math.round(currentSize * avgScale)

    // Reset scale
    node.scaleX(1)
    node.scaleY(1)

    // Update the simpleConfig.size
    updateLayer(layer.id, {
      simpleConfig: {
        ...layer.simpleConfig,
        size: newSize,
      },
      rotation,
      position: {
        x: node.x(),
        y: node.y(),
      },
    })
  } else if (layer.type === 'contact') {
    // For contact chips, update size based on scale
    const avgScale = (scaleX + scaleY) / 2
    const newSize = layer.size * avgScale

    // Reset scale
    node.scaleX(1)
    node.scaleY(1)

    updateLayer(layer.id, {
      size: newSize,
      rotation,
      position: {
        x: node.x(),
        y: node.y(),
      },
    })
  } else {
    // For other types, just update position and rotation
    updateLayer(layer.id, {
      rotation,
      position: {
        x: node.x(),
        y: node.y(),
      },
    })
  }
}

/**
 * Calculate selection rectangle bounds
 */
export function getSelectionRect(node: Konva.Node): {
  x: number
  y: number
  width: number
  height: number
  rotation: number
} {
  const rect = node.getClientRect({ skipTransform: false })

  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    rotation: node.rotation(),
  }
}

/**
 * Configure transformer for a node
 */
export function configureTransformer(
  transformer: Konva.Transformer,
  node: Konva.Node,
  layer: Layer
) {
  transformer.nodes([node])

  // Configure based on layer type
  switch (layer.type) {
    case 'text':
      // Text can be resized horizontally and vertically
      transformer.enabledAnchors([
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ])
      transformer.rotateEnabled(false)
      transformer.keepRatio(false)
      break

    case 'qr':
      // QR codes maintain aspect ratio
      transformer.enabledAnchors([
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ])
      transformer.rotateEnabled(false)
      transformer.keepRatio(true)
      break

    case 'contact':
      // Contact chips can be scaled uniformly
      transformer.enabledAnchors([
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ])
      transformer.rotateEnabled(true)
      transformer.keepRatio(true)
      break

    case 'image':
      // Images can be resized and rotated
      transformer.enabledAnchors([
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ])
      transformer.rotateEnabled(true)
      transformer.keepRatio(false)
      break

    default:
      transformer.enabledAnchors([])
      transformer.rotateEnabled(false)
  }

  // Common settings
  transformer.borderStroke('#2563eb')
  transformer.borderStrokeWidth(2)
  transformer.anchorFill('#2563eb')
  transformer.anchorStroke('#ffffff')
  transformer.anchorSize(8)
  transformer.anchorCornerRadius(2)
}
