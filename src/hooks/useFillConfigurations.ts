/**
 * Hook for managing and persisting fill configurations
 */

import { useState, useEffect, useCallback } from 'react';
import type { FillStateStore } from '../types/fills';
import {
  DEFAULT_LINEAR_GRADIENT,
  DEFAULT_DOTS_PATTERN
} from '../types/fills';

const STORAGE_KEY = 'linkedin-cover-gen:fill-configs';

// Default configuration state
const defaultFillState: FillStateStore = {
  solid: {
    color: '#ffffff'
  },
  gradient: DEFAULT_LINEAR_GRADIENT,
  pattern: DEFAULT_DOTS_PATTERN
};

export function useFillConfigurations() {
  const [configurations, setConfigurations] = useState<FillStateStore>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return {
          ...defaultFillState,
          ...parsed
        };
      }
    } catch (error) {
      console.error('Failed to load fill configurations:', error);
    }
    return defaultFillState;
  });

  // Save to localStorage whenever configurations change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configurations));
    } catch (error) {
      console.error('Failed to save fill configurations:', error);
    }
  }, [configurations]);

  const updateSolidConfig = useCallback((color: string) => {
    setConfigurations(prev => ({
      ...prev,
      solid: { color }
    }));
  }, []);

  const updateGradientConfig = useCallback((config: FillStateStore['gradient']) => {
    setConfigurations(prev => ({
      ...prev,
      gradient: config
    }));
  }, []);

  const updatePatternConfig = useCallback((config: FillStateStore['pattern']) => {
    setConfigurations(prev => ({
      ...prev,
      pattern: config
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfigurations(defaultFillState);
  }, []);

  return {
    configurations,
    updateSolidConfig,
    updateGradientConfig,
    updatePatternConfig,
    resetToDefaults
  };
}