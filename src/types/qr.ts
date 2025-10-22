/**
 * QR Code Type Definitions
 * Simple, user-friendly QR code configuration
 */

export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type SimpleQRDotShape = 'square' | 'rounded' | 'circle' | 'dots';

export interface SimpleQRConfig {
  // Content
  data: string; // URL or text to encode

  // Size
  size: number; // Size in pixels (100-800)

  // Appearance
  dotShape: SimpleQRDotShape; // Shape of the QR dots
  dotColor: string; // Color of the dots (supports rgba)
  backgroundColor: string; // Background color (supports rgba for transparency)

  // Caption
  caption: {
    enabled: boolean;
    text: string;
    fontSize: number; // 12-24
    color: string;
    fontWeight: 'normal' | 'bold';
  };

  // Advanced (optional)
  errorCorrection: QRErrorCorrectionLevel; // L, M, Q, H
  quietZone: number; // Padding around QR (modules)
  cornerRadius: number; // Corner radius for dots (0-0.5, only for rounded)
}

export const DEFAULT_SIMPLE_QR_CONFIG: SimpleQRConfig = {
  data: 'https://example.com',
  size: 300,
  dotShape: 'rounded',
  dotColor: '#000000',
  backgroundColor: '#FFFFFF',
  caption: {
    enabled: false,
    text: 'Scan me',
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  errorCorrection: 'M',
  quietZone: 4,
  cornerRadius: 0.4,
};
