/**
 * Tests for Simple QR Generator
 */

import { describe, it, expect } from 'vitest';
import { generateSimpleQRSVG, svgToDataURL } from './simpleQRGenerator';
import { DEFAULT_SIMPLE_QR_CONFIG } from '../types/qr';

describe('Simple QR Generator', () => {
  it('should generate valid SVG string', () => {
    const config = { ...DEFAULT_SIMPLE_QR_CONFIG };
    const result = generateSimpleQRSVG(config);

    expect(result.svgString).toBeTruthy();
    expect(result.svgString).toContain('<svg');
    expect(result.svgString).toContain('</svg>');
    expect(result.dimensions.width).toBe(config.size);
  });

  it('should include caption when enabled', () => {
    const config = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      caption: {
        enabled: true,
        text: 'Scan me!',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'bold' as const,
      },
    };

    const result = generateSimpleQRSVG(config);
    expect(result.svgString).toContain('Scan me!');
    expect(result.svgString).toContain('<text');
    expect(result.dimensions.height).toBeGreaterThan(config.size);
  });

  it('should not include caption when disabled', () => {
    const config = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      caption: {
        enabled: false,
        text: 'Scan me!',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'bold' as const,
      },
    };

    const result = generateSimpleQRSVG(config);
    expect(result.svgString).not.toContain('Scan me!');
    expect(result.svgString).not.toContain('<text');
    expect(result.dimensions.height).toBe(config.size);
  });

  it('should handle different dot shapes', () => {
    const shapes = ['square', 'rounded', 'circle', 'dots'] as const;

    for (const shape of shapes) {
      const config = {
        ...DEFAULT_SIMPLE_QR_CONFIG,
        dotShape: shape,
      };

      const result = generateSimpleQRSVG(config);
      expect(result.svgString).toBeTruthy();
      expect(result.svgString).toContain('<svg');
    }
  });

  it('should handle transparent background', () => {
    const config = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      backgroundColor: 'transparent',
    };

    const result = generateSimpleQRSVG(config);
    expect(result.svgString).toBeTruthy();
    // Should not have a background rect
    expect(result.svgString.match(/<rect.*fill="#FFFFFF"/)).toBeFalsy();
  });

  it('should convert SVG to data URL', () => {
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
    const dataURL = svgToDataURL(svgString);

    expect(dataURL).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it('should handle logo when enabled', () => {
    const config = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      logo: {
        enabled: true,
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        size: 20,
      },
    };

    const result = generateSimpleQRSVG(config);
    expect(result.svgString).toContain('<image');
    expect(result.svgString).toContain('href="data:image/png;base64,');
  });

  it('should handle different sizes', () => {
    const sizes = [100, 300, 500];

    for (const size of sizes) {
      const config = {
        ...DEFAULT_SIMPLE_QR_CONFIG,
        size,
      };

      const result = generateSimpleQRSVG(config);
      expect(result.dimensions.width).toBe(size);
      expect(result.svgString).toContain(`viewBox="0 0 ${size}`);
    }
  });

  it('should respect quiet zone setting', () => {
    const config1 = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      quietZone: 2,
    };

    const config2 = {
      ...DEFAULT_SIMPLE_QR_CONFIG,
      quietZone: 8,
    };

    const result1 = generateSimpleQRSVG(config1);
    const result2 = generateSimpleQRSVG(config2);

    // Both should generate valid SVG
    expect(result1.svgString).toBeTruthy();
    expect(result2.svgString).toBeTruthy();

    // With larger quiet zone, the QR modules should be smaller (more space for padding)
    expect(result1.svgString.length).not.toBe(result2.svgString.length);
  });
});
