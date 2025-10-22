/**
 * BackgroundRenderer Component
 * Renders background layers with support for solid colors, gradients, patterns, and images
 */

import { useEffect, useState } from 'react'
import { Rect, Image as KonvaImage } from 'react-konva'
import type { BackgroundLayer } from '../../types/index'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../state/constants'
import { renderGradientToCanvas, renderPatternToCanvas, gradientToCSS } from '../../lib/fillGenerators'
import {
  DEFAULT_LINEAR_GRADIENT,
  DEFAULT_DOTS_PATTERN
} from '../../types/fills'

interface BackgroundRendererProps {
  layer: BackgroundLayer
}

export function BackgroundRenderer({ layer }: BackgroundRendererProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(null)

  // Load uploaded images
  useEffect(() => {
    if (layer.mode === 'upload' && layer.value) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setImage(img)
      img.onerror = () => setImage(null)
      img.src = layer.value
    } else {
      setImage(null)
    }
  }, [layer.mode, layer.value])

  // Generate gradient or pattern
  useEffect(() => {
    if (layer.mode === 'gradient' || layer.mode === 'pattern') {
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_WIDTH
      canvas.height = CANVAS_HEIGHT
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      if (layer.mode === 'gradient') {
        // Use new gradientConfig if available, otherwise fall back to parsing value
        if (layer.gradientConfig) {
          renderGradientToCanvas(ctx, layer.gradientConfig, CANVAS_WIDTH, CANVAS_HEIGHT)
        } else {
          // Legacy support - parse gradient from CSS gradient string
          parseAndApplyGradient(ctx, layer.value, CANVAS_WIDTH, CANVAS_HEIGHT)
        }
      } else if (layer.mode === 'pattern') {
        // Use new patternConfig if available
        if (layer.patternConfig) {
          renderPatternToCanvas(ctx, layer.patternConfig, CANVAS_WIDTH, CANVAS_HEIGHT)
        } else {
          // Legacy support
          applyPattern(ctx, layer.value, CANVAS_WIDTH, CANVAS_HEIGHT)
        }
      }

      // Apply filters if any
      if (layer.filters) {
        applyFilters(ctx, layer.filters, CANVAS_WIDTH, CANVAS_HEIGHT)
      }

      setPatternImage(canvas)
    } else {
      setPatternImage(null)
    }
  }, [layer.mode, layer.value, layer.gradientConfig, layer.patternConfig, layer.filters])

  // Simple solid color mode
  if (layer.mode === 'solid') {
    return (
      <Rect
        x={0}
        y={0}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        fill={layer.solidConfig?.color || layer.value}
        listening={false}
      />
    )
  }

  // Preset mode (same as gradient)
  if (layer.mode === 'preset') {
    if (patternImage) {
      return (
        <KonvaImage
          x={0}
          y={0}
          image={patternImage}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          listening={false}
        />
      )
    }
    return null
  }

  // Gradient mode
  if (layer.mode === 'gradient') {
    if (patternImage) {
      return (
        <KonvaImage
          x={0}
          y={0}
          image={patternImage}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          listening={false}
        />
      )
    }
    return null
  }

  // Pattern mode
  if (layer.mode === 'pattern') {
    if (patternImage) {
      return (
        <KonvaImage
          x={0}
          y={0}
          image={patternImage}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          listening={false}
        />
      )
    }
    return null
  }

  // Upload mode
  if (layer.mode === 'upload' && image) {
    return (
      <KonvaImage
        x={0}
        y={0}
        image={image}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        listening={false}
      />
    )
  }

  // Fallback - white background
  return (
    <Rect
      x={0}
      y={0}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      fill="#ffffff"
      listening={false}
    />
  )
}

/**
 * Parse CSS gradient string and apply to canvas context
 */
function parseAndApplyGradient(
  ctx: CanvasRenderingContext2D,
  gradientString: string,
  width: number,
  height: number
) {
  // Simple parser for linear-gradient
  // Example: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"

  const match = gradientString.match(
    /linear-gradient\(([^,]+),\s*(.+)\)/
  )

  if (!match) {
    // Fallback to solid color if parsing fails
    ctx.fillStyle = gradientString
    ctx.fillRect(0, 0, width + 1, height + 1)
    return
  }

  const angle = parseInt(match[1]) || 0
  const stops = match[2]

  // Parse color stops
  const stopMatches = stops.matchAll(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+(\d+)%/g)
  const colorStops: Array<{ color: string; offset: number }> = []

  for (const stopMatch of stopMatches) {
    colorStops.push({
      color: stopMatch[1],
      offset: parseInt(stopMatch[2]) / 100,
    })
  }

  if (colorStops.length === 0) {
    // Fallback
    ctx.fillStyle = '#cccccc'
    ctx.fillRect(0, 0, width + 1, height + 1)
    return
  }

  // Convert angle to radians and calculate gradient direction
  const angleRad = ((angle - 90) * Math.PI) / 180
  const x0 = width / 2 - (Math.cos(angleRad) * width) / 2
  const y0 = height / 2 - (Math.sin(angleRad) * height) / 2
  const x1 = width / 2 + (Math.cos(angleRad) * width) / 2
  const y1 = height / 2 + (Math.sin(angleRad) * height) / 2

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)

  colorStops.forEach((stop) => {
    gradient.addColorStop(stop.offset, stop.color)
  })

  ctx.fillStyle = gradient
  // Add 1px extra to ensure full coverage and avoid rounding issues
  ctx.fillRect(0, 0, width + 1, height + 1)
}

/**
 * Apply pattern to canvas context
 */
function applyPattern(
  ctx: CanvasRenderingContext2D,
  patternValue: string,
  width: number,
  height: number
) {
  // For now, treat patterns as solid colors or gradients
  // In a full implementation, you'd generate actual patterns (dots, stripes, etc.)

  // Check if it's a gradient pattern
  if (patternValue.startsWith('linear-gradient')) {
    parseAndApplyGradient(ctx, patternValue, width, height)
  } else {
    // Solid color pattern
    ctx.fillStyle = patternValue
    // Add 1px extra to ensure full coverage and avoid rounding issues
    ctx.fillRect(0, 0, width + 1, height + 1)
  }
}

/**
 * Apply filters to canvas
 */
function applyFilters(
  ctx: CanvasRenderingContext2D,
  filters: NonNullable<BackgroundLayer['filters']>,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Apply blur (simplified - real blur would need convolution)
  if (filters.blur && filters.blur > 0) {
    ctx.filter = `blur(${filters.blur}px)`
  }

  // Apply brightness
  if (filters.brightness !== undefined && filters.brightness !== 1) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * filters.brightness)
      data[i + 1] = Math.min(255, data[i + 1] * filters.brightness)
      data[i + 2] = Math.min(255, data[i + 2] * filters.brightness)
    }
  }

  // Apply contrast
  if (filters.contrast !== undefined && filters.contrast !== 1) {
    const factor = (259 * (filters.contrast * 255 + 255)) / (255 * (259 - filters.contrast * 255))
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
    }
  }

  // Apply tint
  if (filters.tint && filters.tintAlpha) {
    const tintColor = hexToRgb(filters.tint)
    if (tintColor) {
      const alpha = filters.tintAlpha
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * (1 - alpha) + tintColor.r * alpha
        data[i + 1] = data[i + 1] * (1 - alpha) + tintColor.g * alpha
        data[i + 2] = data[i + 2] * (1 - alpha) + tintColor.b * alpha
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}
