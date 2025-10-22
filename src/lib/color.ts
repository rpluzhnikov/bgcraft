/**
 * Color Conversion and Manipulation Utilities
 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present and ensure uppercase
  const cleanHex = hex.replace('#', '').toUpperCase();

  // Handle 3-digit hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;

  const bigint = parseInt(fullHex, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HEX to HSL
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Validate and normalize HEX color
 */
export function validateHex(hex: string): string | null {
  // Remove # if present
  let cleanHex = hex.replace('#', '').toUpperCase();

  // Validate format
  if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(cleanHex)) {
    return null;
  }

  // Expand 3-digit hex
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }

  return `#${cleanHex}`;
}

/**
 * Clamp RGB values to 0-255 range
 */
export function clampRgb({ r, g, b }: RGB): RGB {
  return {
    r: Math.max(0, Math.min(255, Math.round(r))),
    g: Math.max(0, Math.min(255, Math.round(g))),
    b: Math.max(0, Math.min(255, Math.round(b))),
  };
}

/**
 * Clamp HSL values to valid ranges
 */
export function clampHsl({ h, s, l }: HSL): HSL {
  return {
    h: ((h % 360) + 360) % 360, // Wrap hue
    s: Math.max(0, Math.min(100, Math.round(s))),
    l: Math.max(0, Math.min(100, Math.round(l))),
  };
}

/**
 * Calculate relative luminance (for contrast calculations)
 */
export function getLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;

  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance levels
 */
export function getWCAGLevel(ratio: number): { AA: boolean; AAA: boolean; AALarge: boolean; AAALarge: boolean } {
  return {
    AA: ratio >= 4.5,        // Normal text AA
    AAA: ratio >= 7,         // Normal text AAA
    AALarge: ratio >= 3,     // Large text AA
    AAALarge: ratio >= 4.5,  // Large text AAA
  };
}

/**
 * Generate color palettes
 */
export function generatePalette(baseColor: string, type: 'monochrome' | 'complementary' | 'analogous' | 'triadic'): string[] {
  const hsl = hexToHsl(baseColor);
  const colors: string[] = [baseColor];

  switch (type) {
    case 'monochrome': {
      // Generate lighter and darker versions
      colors.push(hslToHex({ ...hsl, l: Math.min(100, hsl.l + 20) }));
      colors.push(hslToHex({ ...hsl, l: Math.min(100, hsl.l + 40) }));
      colors.push(hslToHex({ ...hsl, l: Math.max(0, hsl.l - 20) }));
      colors.push(hslToHex({ ...hsl, l: Math.max(0, hsl.l - 40) }));
      break;
    }

    case 'complementary': {
      // Add complementary color and variations
      const complement = { ...hsl, h: (hsl.h + 180) % 360 };
      colors.push(hslToHex(complement));
      colors.push(hslToHex({ ...hsl, l: Math.min(100, hsl.l + 15) }));
      colors.push(hslToHex({ ...complement, l: Math.min(100, complement.l + 15) }));
      colors.push(hslToHex({ ...complement, l: Math.max(0, complement.l - 15) }));
      break;
    }

    case 'analogous': {
      // Add neighboring colors on the color wheel
      colors.push(hslToHex({ ...hsl, h: (hsl.h + 30) % 360 }));
      colors.push(hslToHex({ ...hsl, h: (hsl.h + 60) % 360 }));
      colors.push(hslToHex({ ...hsl, h: (hsl.h - 30 + 360) % 360 }));
      colors.push(hslToHex({ ...hsl, h: (hsl.h - 60 + 360) % 360 }));
      break;
    }

    case 'triadic': {
      // Add colors 120 degrees apart
      colors.push(hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }));
      colors.push(hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }));
      // Add variations
      colors.push(hslToHex({ ...hsl, l: Math.min(100, hsl.l + 15) }));
      colors.push(hslToHex({ ...hsl, l: Math.max(0, hsl.l - 15) }));
      break;
    }
  }

  return colors.slice(0, 5); // Return exactly 5 colors
}

/**
 * Calculate average luminance of a canvas/image
 * Note: This is a placeholder - actual implementation would need canvas context
 */
export function getAverageLuminance(): number {
  // For now, return a default mid-tone value
  // In production, this would analyze the actual canvas pixels
  return 0.5;
}