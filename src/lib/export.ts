/**
 * Export Utilities
 * Handles exporting canvas to PNG at various scales with metadata handling
 */

import type Konva from 'konva'
import { EXPORT_SCALES } from '../state/constants'

export type ExportScale = keyof typeof EXPORT_SCALES
export type ExportFormat = 'png' | 'jpg' | 'jpeg'

export interface ExportOptions {
  scale: ExportScale
  format?: ExportFormat
  quality?: number
  filename?: string
  stripMetadata?: boolean
}

export interface ExportResult {
  success: boolean
  dataUrl?: string
  blob?: Blob
  filename?: string
  error?: string
}

/**
 * Export Konva stage to PNG at specified scale
 * @param stage - Konva stage instance
 * @param scale - Export scale (1x or 2x)
 * @returns Data URL of exported image
 */
export function exportStageToPNG(
  stage: Konva.Stage,
  scale: ExportScale = '1x'
): string {
  const pixelRatio = EXPORT_SCALES[scale]

  return stage.toDataURL({
    pixelRatio,
    mimeType: 'image/png',
  })
}

/**
 * Export Konva stage to JPEG at specified scale
 * @param stage - Konva stage instance
 * @param scale - Export scale (1x or 2x)
 * @param quality - JPEG quality (0-1)
 * @returns Data URL of exported image
 */
export function exportStageToJPEG(
  stage: Konva.Stage,
  scale: ExportScale = '1x',
  quality: number = 0.95
): string {
  const pixelRatio = EXPORT_SCALES[scale]

  return stage.toDataURL({
    pixelRatio,
    mimeType: 'image/jpeg',
    quality,
  })
}

/**
 * Convert data URL to Blob
 * @param dataUrl - Data URL string
 * @returns Blob object
 */
export function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(parts[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Strip metadata from image data URL
 * Creates a new canvas, draws the image, and exports clean data
 * @param dataUrl - Original data URL
 * @returns Clean data URL without metadata
 */
export async function stripMetadata(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)

      // Export with minimal metadata
      const cleanDataUrl = canvas.toDataURL('image/png')
      resolve(cleanDataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for metadata stripping'))
    }

    img.src = dataUrl
  })
}

/**
 * Download a data URL as a file
 * @param dataUrl - Data URL to download
 * @param filename - Filename for download
 */
export function downloadDataURL(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download a Blob as a file
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Generate filename for export
 * @param projectName - Project name
 * @param scale - Export scale
 * @param format - Export format
 * @returns Generated filename
 */
export function generateExportFilename(
  projectName: string,
  scale: ExportScale,
  format: ExportFormat = 'png'
): string {
  // Sanitize project name
  const safeName = projectName
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const scaleStr = scale === '1x' ? '' : `@${scale}`

  return `${safeName}-${timestamp}${scaleStr}.${format}`
}

/**
 * Export stage with full options and error handling
 * @param stage - Konva stage instance
 * @param options - Export options
 * @returns Export result with success/error info
 */
export async function exportStage(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const {
      scale = '1x',
      format = 'png',
      quality = 0.95,
      filename,
      stripMetadata: shouldStripMetadata = true,
    } = options

    // Export based on format
    let dataUrl: string
    if (format === 'jpg' || format === 'jpeg') {
      dataUrl = exportStageToJPEG(stage, scale, quality)
    } else {
      dataUrl = exportStageToPNG(stage, scale)
    }

    // Strip metadata if requested
    if (shouldStripMetadata) {
      try {
        dataUrl = await stripMetadata(dataUrl)
      } catch (error) {
        console.warn('Failed to strip metadata:', error)
        // Continue with original dataUrl
      }
    }

    // Convert to blob
    const blob = dataURLToBlob(dataUrl)

    // Generate filename if not provided
    const finalFilename =
      filename || generateExportFilename('linkedin-cover', scale, format)

    return {
      success: true,
      dataUrl,
      blob,
      filename: finalFilename,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    }
  }
}

/**
 * Export and download stage in one operation
 * @param stage - Konva stage instance
 * @param options - Export options
 * @returns Export result
 */
export async function exportAndDownload(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<ExportResult> {
  const result = await exportStage(stage, options)

  if (result.success && result.blob && result.filename) {
    downloadBlob(result.blob, result.filename)
  }

  return result
}

/**
 * Export stage at multiple scales
 * @param stage - Konva stage instance
 * @param scales - Array of scales to export
 * @param projectName - Project name for filenames
 * @returns Array of export results
 */
export async function exportMultipleScales(
  stage: Konva.Stage,
  scales: ExportScale[] = ['1x', '2x'],
  projectName: string = 'linkedin-cover'
): Promise<ExportResult[]> {
  const results: ExportResult[] = []

  for (const scale of scales) {
    const filename = generateExportFilename(projectName, scale, 'png')
    const result = await exportAndDownload(stage, { scale, filename })
    results.push(result)

    // Add small delay between exports to prevent UI freezing
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Get estimated file size from data URL
 * @param dataUrl - Data URL to measure
 * @returns Estimated size in bytes
 */
export function getEstimatedFileSize(dataUrl: string): number {
  // Base64 encoding increases size by ~33%
  const base64Length = dataUrl.split(',')[1].length
  return Math.ceil((base64Length * 3) / 4)
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Validate export options
 * @param options - Export options to validate
 * @returns Validation result with errors
 */
export function validateExportOptions(options: ExportOptions): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate scale
  if (!Object.keys(EXPORT_SCALES).includes(options.scale)) {
    errors.push(`Invalid scale: ${options.scale}`)
  }

  // Validate format
  if (options.format && !['png', 'jpg', 'jpeg'].includes(options.format)) {
    errors.push(`Invalid format: ${options.format}`)
  }

  // Validate quality
  if (
    options.quality !== undefined &&
    (options.quality < 0 || options.quality > 1)
  ) {
    errors.push('Quality must be between 0 and 1')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
