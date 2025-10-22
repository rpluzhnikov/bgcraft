/**
 * Simple QR Code Generator
 * Clean, user-friendly QR code generation with SVG output
 */

import QRCodeGenerator from 'qrcode-generator';
import type { SimpleQRConfig, QRErrorCorrectionLevel } from '../types/qr';

interface QRModule {
  row: number;
  col: number;
  isDark: boolean;
}

/**
 * Generate QR code matrix data
 */
function generateQRMatrix(data: string, errorCorrection: QRErrorCorrectionLevel): QRModule[][] {
  // Map error correction level to qrcode-generator format
  const eccMap: Record<QRErrorCorrectionLevel, 'L' | 'M' | 'Q' | 'H'> = {
    L: 'L',
    M: 'M',
    Q: 'Q',
    H: 'H',
  };

  // Create QR code with automatic version selection
  const qr = QRCodeGenerator(0, eccMap[errorCorrection]);
  qr.addData(data);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const matrix: QRModule[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    const rowData: QRModule[] = [];
    for (let col = 0; col < moduleCount; col++) {
      rowData.push({
        row,
        col,
        isDark: qr.isDark(row, col),
      });
    }
    matrix.push(rowData);
  }

  return matrix;
}

/**
 * Check if a module is part of a finder pattern (eye)
 */
function isFinderPattern(row: number, col: number, size: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true;
  return false;
}

/**
 * Render a single module based on shape
 */
function renderModule(
  row: number,
  col: number,
  moduleSize: number,
  shape: SimpleQRConfig['dotShape'],
  cornerRadius: number
): string {
  const x = col * moduleSize;
  const y = row * moduleSize;

  switch (shape) {
    case 'square':
      return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;

    case 'rounded': {
      const radius = moduleSize * cornerRadius;
      return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}"/>`;
    }

    case 'circle': {
      const cx = x + moduleSize / 2;
      const cy = y + moduleSize / 2;
      const r = moduleSize / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
    }

    case 'dots': {
      const cx = x + moduleSize / 2;
      const cy = y + moduleSize / 2;
      const r = moduleSize * 0.35; // Smaller dots for more spacing
      return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
    }

    default:
      return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;
  }
}

/**
 * Render finder pattern (eye)
 */
function renderFinderPattern(
  startRow: number,
  startCol: number,
  moduleSize: number,
  shape: SimpleQRConfig['dotShape']
): string {
  const size = 7 * moduleSize;
  const x = startCol * moduleSize;
  const y = startRow * moduleSize;

  // Outer square (7x7)
  const outerSize = size;
  // Inner square (3x3) - centered
  const innerSize = 3 * moduleSize;
  const innerOffset = 2 * moduleSize;

  if (shape === 'circle' || shape === 'dots') {
    // Circular eyes
    const outerR = outerSize / 2;
    const innerR = innerSize / 2;
    const centerX = x + outerSize / 2;
    const centerY = y + outerSize / 2;

    return `
      <circle cx="${centerX}" cy="${centerY}" r="${outerR}" fill="none" stroke="currentColor" stroke-width="${moduleSize}"/>
      <circle cx="${centerX}" cy="${centerY}" r="${innerR}"/>
    `;
  } else if (shape === 'rounded') {
    // Rounded eyes
    const radius = moduleSize * 0.5;
    return `
      <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${radius}" ry="${radius}" fill="none" stroke="currentColor" stroke-width="${moduleSize}"/>
      <rect x="${x + innerOffset}" y="${y + innerOffset}" width="${innerSize}" height="${innerSize}" rx="${radius * 0.5}" ry="${radius * 0.5}"/>
    `;
  } else {
    // Square eyes
    return `
      <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" fill="none" stroke="currentColor" stroke-width="${moduleSize}"/>
      <rect x="${x + innerOffset}" y="${y + innerOffset}" width="${innerSize}" height="${innerSize}"/>
    `;
  }
}


/**
 * Generate SVG string for QR code
 */
export function generateSimpleQRSVG(config: SimpleQRConfig): {
  svgString: string;
  dimensions: { width: number; height: number };
} {
  // Generate QR matrix
  const matrix = generateQRMatrix(config.data, config.errorCorrection);
  const moduleCount = matrix.length;

  // Calculate sizes
  const quietZone = config.quietZone;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = config.size / totalModules;
  const offset = quietZone * moduleSize;

  // Caption dimensions
  let captionHeight = 0;
  let captionY = 0;
  if (config.caption.enabled && config.caption.text) {
    captionHeight = config.caption.fontSize * 1.2; // Reduced spacing for closer text
    captionY = config.size + config.caption.fontSize * 0.8;
  }

  const totalHeight = config.size + captionHeight;

  // Parse background color for opacity
  const bgColor = config.backgroundColor;
  const isTransparent = bgColor === 'transparent' || bgColor.startsWith('rgba');

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.size} ${totalHeight}" width="${config.size}" height="${totalHeight}">`;

  // Background
  if (!isTransparent && bgColor !== 'transparent') {
    svg += `<rect width="${config.size}" height="${config.size}" fill="${bgColor}"/>`;
  }

  // QR modules group
  svg += `<g transform="translate(${offset}, ${offset})" fill="${config.dotColor}">`;

  // Render finder patterns (eyes)
  const finderPositions = [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: moduleCount - 7 }, // Top-right
    { row: moduleCount - 7, col: 0 }, // Bottom-left
  ];

  for (const pos of finderPositions) {
    svg += renderFinderPattern(pos.row, pos.col, moduleSize, config.dotShape);
  }

  // Render data modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const module = matrix[row][col];

      // Skip if not dark
      if (!module.isDark) continue;

      // Skip finder patterns
      if (isFinderPattern(row, col, moduleCount)) continue;

      svg += renderModule(row, col, moduleSize, config.dotShape, config.cornerRadius);
    }
  }

  svg += '</g>';

  // Add caption if enabled
  if (config.caption.enabled && config.caption.text) {
    const fontWeight = config.caption.fontWeight === 'bold' ? 'bold' : 'normal';
    svg += `<text x="${config.size / 2}" y="${captionY}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="${config.caption.fontSize}" font-weight="${fontWeight}" fill="${config.caption.color}">${escapeXml(config.caption.text)}</text>`;
  }

  svg += '</svg>';

  return {
    svgString: svg,
    dimensions: { width: config.size, height: totalHeight },
  };
}

/**
 * Convert SVG string to data URL
 */
export function svgToDataURL(svgString: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
