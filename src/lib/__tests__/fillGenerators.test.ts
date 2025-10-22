/**
 * Unit tests for fill generators
 */

import { describe, it, expect } from 'vitest';
import { gradientToCSS } from '../backgroundRenderers';
import { generateRandomGradient } from '../fillGenerators';
import type { GradientConfig } from '../../types/background';

describe('fillGenerators', () => {
  describe('gradientToCSS - gradient stop math', () => {
    it('should convert linear gradient with 2 stops', () => {
      const config: GradientConfig = {
        kind: 'linear',
        angle: 90,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops: [
          { pos: 0, color: '#FF0000' },
          { pos: 1, color: '#0000FF' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('linear-gradient');
      expect(css).toContain('90deg');
      expect(css).toContain('#FF0000 0%');
      expect(css).toContain('#0000FF 100%');
    });

    it('should handle multiple gradient stops', () => {
      const config: GradientConfig = {
        kind: 'linear',
        angle: 180,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops: [
          { pos: 0, color: '#FF0000' },
          { pos: 0.33, color: '#00FF00' },
          { pos: 0.66, color: '#0000FF' },
          { pos: 1, color: '#FFFF00' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('#FF0000 0%');
      expect(css).toContain('#00FF00 33%');
      expect(css).toContain('#0000FF 66%');
      expect(css).toContain('#FFFF00 100%');
    });

    it('should sort stops by position', () => {
      const config: GradientConfig = {
        kind: 'linear',
        angle: 0,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops: [
          { pos: 1, color: '#0000FF' },
          { pos: 0, color: '#FF0000' },
          { pos: 0.5, color: '#00FF00' }
        ]
      };

      const css = gradientToCSS(config);
      const redIndex = css.indexOf('#FF0000');
      const greenIndex = css.indexOf('#00FF00');
      const blueIndex = css.indexOf('#0000FF');

      expect(redIndex).toBeLessThan(greenIndex);
      expect(greenIndex).toBeLessThan(blueIndex);
    });

    it('should convert radial gradient with center position', () => {
      const config: GradientConfig = {
        kind: 'radial',
        angle: 0,
        center: { x: 0.25, y: 0.75 },
        shape: 'circle',
        repeat: false,
        stops: [
          { pos: 0, color: '#FFFFFF' },
          { pos: 1, color: '#000000' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('radial-gradient');
      expect(css).toContain('circle');
      expect(css).toContain('at 25% 75%');
    });

    it('should handle ellipse shape for radial', () => {
      const config: GradientConfig = {
        kind: 'radial',
        angle: 0,
        center: { x: 0.5, y: 0.5 },
        shape: 'ellipse',
        repeat: false,
        stops: [
          { pos: 0, color: '#FF0000' },
          { pos: 1, color: '#0000FF' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('ellipse');
    });

    it('should convert conic gradient with angle', () => {
      const config: GradientConfig = {
        kind: 'conic',
        angle: 45,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: false,
        stops: [
          { pos: 0, color: '#FF0000' },
          { pos: 0.5, color: '#00FF00' },
          { pos: 1, color: '#0000FF' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('conic-gradient');
      expect(css).toContain('from 45deg');
      expect(css).toContain('at 50% 50%');
    });

    it('should handle repeating conic gradient', () => {
      const config: GradientConfig = {
        kind: 'conic',
        angle: 0,
        center: { x: 0.5, y: 0.5 },
        shape: 'circle',
        repeat: true,
        stops: [
          { pos: 0, color: '#FFFFFF' },
          { pos: 0.5, color: '#000000' }
        ]
      };

      const css = gradientToCSS(config);
      expect(css).toContain('repeating-conic-gradient');
    });
  });

  describe('generateRandomGradient - palette generators', () => {
    it('should generate reproducible gradient with seed', () => {
      const seed = 12345;
      const gradient1 = generateRandomGradient(seed);
      const gradient2 = generateRandomGradient(seed);

      expect(gradient1.type).toBe(gradient2.type);
      if (gradient1.type === 'linear') {
        expect(gradient1.angle).toBe((gradient2 as any).angle);
      }
      expect(gradient1.stops).toEqual(gradient2.stops);
    });

    it('should generate different gradients with different seeds', () => {
      const gradient1 = generateRandomGradient(100);
      const gradient2 = generateRandomGradient(200);

      // Should be different (though there's a tiny chance they could be the same)
      const anglesDifferent = (gradient1.type === 'linear' && gradient2.type === 'linear')
        ? (gradient1 as any).angle !== (gradient2 as any).angle
        : false;
      const isDifferent =
        gradient1.type !== gradient2.type ||
        anglesDifferent ||
        gradient1.stops.length !== gradient2.stops.length;

      expect(isDifferent).toBe(true);
    });

    it('should generate gradient with 2-5 stops', () => {
      for (let i = 0; i < 10; i++) {
        const gradient = generateRandomGradient(i * 1000);
        expect(gradient.stops.length).toBeGreaterThanOrEqual(2);
        expect(gradient.stops.length).toBeLessThanOrEqual(5);
      }
    });

    it('should generate stops with positions from 0 to 100', () => {
      const gradient = generateRandomGradient(999);

      const positions = gradient.stops.map(s => s.position);
      expect(Math.min(...positions)).toBe(0);
      expect(Math.max(...positions)).toBe(100);

      // All positions should be between 0 and 100
      positions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThanOrEqual(100);
      });
    });

    it('should generate valid gradient types', () => {
      const types = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const gradient = generateRandomGradient(i * 500);
        types.add(gradient.type);
      }

      // Should generate at least 2 different types in 20 tries
      expect(types.size).toBeGreaterThanOrEqual(2);

      // All types should be valid
      types.forEach(type => {
        expect(['linear', 'radial', 'conic']).toContain(type);
      });
    });

    it('should generate valid angles (0-359)', () => {
      for (let i = 0; i < 10; i++) {
        const gradient = generateRandomGradient(i * 777);
        if (gradient.type === 'linear') {
          expect((gradient as any).angle).toBeGreaterThanOrEqual(0);
          expect((gradient as any).angle).toBeLessThan(360);
        }
      }
    });

    it('should generate valid color hex codes', () => {
      const gradient = generateRandomGradient(42);
      const hexPattern = /^#[0-9A-F]{6}$/i;

      gradient.stops.forEach(stop => {
        expect(hexPattern.test(stop.color)).toBe(true);
      });
    });
  });
});