/**
 * WCAG Contrast Utilities
 * Provides functions for calculating color contrast ratios and checking WCAG compliance
 */

export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * Convert hex color to RGB object
 * @param hex - Hex color string (with or without #)
 * @returns RGB object with values 0-255
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '')

  // Handle shorthand hex (e.g., #fff)
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex

  const num = parseInt(fullHex, 16)

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param rgb - RGB color object
 * @returns Relative luminance value (0-1)
 */
export function getRelativeLuminance(rgb: RGB): number {
  // Convert RGB values to sRGB
  const rsRGB = rgb.r / 255
  const gsRGB = rgb.g / 255
  const bsRGB = rgb.b / 255

  // Apply gamma correction
  const r =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const g =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const b =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  // Calculate relative luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param color1 - First color (hex string or RGB object)
 * @param color2 - Second color (hex string or RGB object)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(
  color1: string | RGB,
  color2: string | RGB
): number {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2

  const lum1 = getRelativeLuminance(rgb1)
  const lum2 = getRelativeLuminance(rgb2)

  // Lighter color should be in numerator
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA compliance for large text
 * WCAG AA requires a contrast ratio of at least 3.0:1 for large text (18pt+ or 14pt+ bold)
 * @param color1 - First color (hex string or RGB object)
 * @param color2 - Second color (hex string or RGB object)
 * @param threshold - Minimum contrast ratio (default: 3.0 for large text)
 * @returns True if contrast meets threshold
 */
export function isWcagAaCompliant(
  color1: string | RGB,
  color2: string | RGB,
  threshold: number = 3.0
): boolean {
  const ratio = getContrastRatio(color1, color2)
  return ratio >= threshold
}

/**
 * Check if contrast ratio meets WCAG AA compliance for normal text
 * WCAG AA requires a contrast ratio of at least 4.5:1 for normal text
 */
export function isWcagAaNormalText(
  color1: string | RGB,
  color2: string | RGB
): boolean {
  return isWcagAaCompliant(color1, color2, 4.5)
}

/**
 * Check if contrast ratio meets WCAG AAA compliance for large text
 * WCAG AAA requires a contrast ratio of at least 4.5:1 for large text
 */
export function isWcagAaaLargeText(
  color1: string | RGB,
  color2: string | RGB
): boolean {
  return isWcagAaCompliant(color1, color2, 4.5)
}

/**
 * Check if contrast ratio meets WCAG AAA compliance for normal text
 * WCAG AAA requires a contrast ratio of at least 7:1 for normal text
 */
export function isWcagAaaNormalText(
  color1: string | RGB,
  color2: string | RGB
): boolean {
  return isWcagAaCompliant(color1, color2, 7.0)
}

/**
 * Get a descriptive contrast rating
 * @param ratio - Contrast ratio
 * @returns Human-readable rating
 */
export function getContrastRating(ratio: number): string {
  if (ratio >= 7.0) return 'Excellent (AAA Normal)'
  if (ratio >= 4.5) return 'Good (AA Normal / AAA Large)'
  if (ratio >= 3.0) return 'Fair (AA Large)'
  return 'Poor (Fails WCAG)'
}

/**
 * Validate if a color string is a valid hex color
 * @param color - Color string to validate
 * @returns True if valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
}

/**
 * Normalize hex color to always include # and be 6 characters
 * @param hex - Hex color string
 * @returns Normalized hex color
 */
export function normalizeHexColor(hex: string): string {
  const cleanHex = hex.replace(/^#/, '')

  // Convert 3-char to 6-char
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex

  return `#${fullHex.toUpperCase()}`
}
