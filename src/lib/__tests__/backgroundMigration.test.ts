/**
 * Unit tests for background migration
 */

import { describe, it, expect } from 'vitest';
import {
  migrateBackgroundLayer,
  backgroundStateToLayer,
  validateBackgroundState
} from '../backgroundMigration';
import type { BackgroundLayer } from '../../types';
import type { BackgroundState, GradientConfig } from '../../types/background';
import { DEFAULT_BACKGROUND_STATE } from '../../types/background';

describe('backgroundMigration', () => {
  describe('migrateBackgroundLayer', () => {
    it('should migrate solid color layer', () => {
      const layer: Partial<BackgroundLayer> = {
        id: 'test',
        type: 'background',
        mode: 'solid',
        value: '#FF0000',
        position: { x: 0, y: 0 },
        rotation: 0,
        opacity: 1
      };

      const result = migrateBackgroundLayer(layer as BackgroundLayer);

      expect(result.type).toBe('solid');
      expect(result.solid.color).toBe('#FF0000');
    });

    it('should migrate gradient layer with new config', () => {
      const layer: Partial<BackgroundLayer> = {
        id: 'test',
        type: 'background',
        mode: 'gradient',
        value: '',
        gradientConfig: {
          type: 'linear',
          angle: 135,
          reverse: false,
          dithering: false,
          stops: [
            { id: '1', color: '#FF0000', position: 0 },
            { id: '2', color: '#00FF00', position: 100 }
          ]
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        opacity: 1
      };

      const result = migrateBackgroundLayer(layer as BackgroundLayer);

      expect(result.type).toBe('gradient');
      expect(result.gradient.kind).toBe('linear');
      expect(result.gradient.angle).toBe(135);
      expect(result.gradient.stops).toHaveLength(2);
      expect(result.gradient.stops[0].pos).toBe(0);
      expect(result.gradient.stops[1].pos).toBe(1);
    });

    it('should migrate pattern layer', () => {
      const layer: Partial<BackgroundLayer> = {
        id: 'test',
        type: 'background',
        mode: 'pattern',
        value: '',
        patternConfig: {
          type: 'dots',
          foreground: '#000000',
          background: '#FFFFFF',
          scale: 100,
          rotation: 0,
          opacity: 100,
          radius: 5,
          spacing: 20
        },
        position: { x: 0, y: 0 },
        rotation: 0,
        opacity: 1
      };

      const result = migrateBackgroundLayer(layer as BackgroundLayer);

      expect(result.type).toBe('pattern');
      expect(result.pattern.name).toBe('dots');
      expect(result.pattern.scale).toBe(1); // Converted from percentage
      expect(result.pattern.params.radius).toBe(5);
    });

    it('should migrate upload layer', () => {
      const dataUrl = 'data:image/png;base64,abc123';
      const layer: Partial<BackgroundLayer> = {
        id: 'test',
        type: 'background',
        mode: 'upload',
        value: dataUrl,
        position: { x: 0, y: 0 },
        rotation: 0,
        opacity: 1
      };

      const result = migrateBackgroundLayer(layer as BackgroundLayer);

      expect(result.type).toBe('upload');
      expect(result.upload?.dataUrl).toBe(dataUrl);
    });
  });

  describe('backgroundStateToLayer', () => {
    it('should convert solid state back to layer format', () => {
      const state: BackgroundState = {
        ...DEFAULT_BACKGROUND_STATE,
        type: 'solid',
        solid: { color: '#00FF00' }
      };

      const existingLayer = {} as BackgroundLayer;
      const result = backgroundStateToLayer(state, existingLayer);

      expect(result.mode).toBe('solid');
      expect(result.value).toBe('#00FF00');
      expect(result.solidConfig).toEqual({ color: '#00FF00' });
    });

    it('should convert gradient state back to layer format', () => {
      const state: BackgroundState = {
        ...DEFAULT_BACKGROUND_STATE,
        type: 'gradient',
        gradient: {
          kind: 'radial',
          angle: 0,
          center: { x: 0.3, y: 0.7 },
          shape: 'ellipse',
          repeat: false,
          stops: [
            { pos: 0, color: '#FF0000' },
            { pos: 1, color: '#0000FF' }
          ]
        }
      };

      const existingLayer = {} as BackgroundLayer;
      const result = backgroundStateToLayer(state, existingLayer);

      expect(result.mode).toBe('gradient');
      expect(result.gradientConfig).toBeDefined();
      expect(result.gradientConfig?.type).toBe('radial');
      expect(result.gradientConfig?.focalPosition.x).toBe(30);
      expect(result.gradientConfig?.focalPosition.y).toBe(70);
    });
  });

  describe('validateBackgroundState', () => {
    it('should validate correct solid state', () => {
      const state: BackgroundState = {
        ...DEFAULT_BACKGROUND_STATE,
        type: 'solid',
        solid: { color: '#FF0000' }
      };

      expect(validateBackgroundState(state)).toBe(true);
    });

    it('should validate correct gradient state', () => {
      const state: BackgroundState = {
        ...DEFAULT_BACKGROUND_STATE,
        type: 'gradient',
        gradient: {
          kind: 'linear',
          angle: 90,
          center: { x: 0.5, y: 0.5 },
          shape: 'circle',
          repeat: false,
          stops: [
            { pos: 0, color: '#000000' },
            { pos: 1, color: '#FFFFFF' }
          ]
        }
      };

      expect(validateBackgroundState(state)).toBe(true);
    });

    it('should reject invalid state - no type', () => {
      const state = {
        solid: { color: '#FF0000' }
      };

      expect(validateBackgroundState(state)).toBe(false);
    });

    it('should reject invalid state - gradient with one stop', () => {
      const state = {
        type: 'gradient',
        gradient: {
          kind: 'linear',
          stops: [{ pos: 0, color: '#FF0000' }]
        }
      };

      expect(validateBackgroundState(state)).toBe(false);
    });

    it('should reject invalid state - solid without color', () => {
      const state = {
        type: 'solid',
        solid: {}
      };

      expect(validateBackgroundState(state)).toBe(false);
    });
  });
});