import { useCallback, useRef, ChangeEvent, useState, useEffect } from 'react';
import { useEditorStore, selectLayers } from '../../state/editorStore';
import { BackgroundLayer } from '../../types';
import type { AnyGradientConfig } from '../../types/fills';
import { Button } from '../ui/Button';
import { GradientEditor } from '../ui/GradientEditor';
import { Tabs, TabList, Tab, TabPanel } from '../ui/Tabs';
import { useFillConfigurations } from '../../hooks/useFillConfigurations';
import { generateRandomGradient } from '../../lib/fillGenerators';
import { GRADIENT_PRESETS } from '../../data/gradientPresets';
import { migrateBackgroundLayer } from '../../lib/backgroundMigration';
import {
  DEFAULT_LINEAR_GRADIENT,
  DEFAULT_RADIAL_GRADIENT
} from '../../types/fills';
import {
  Upload,
  Shuffle,
  ChevronDown
} from 'lucide-react';

export const BackgroundPanelEnhanced = () => {
  const layers = useEditorStore(selectLayers);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fill configurations state
  const {
    configurations,
    updateGradientConfig
  } = useFillConfigurations();

  // UI state
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [showPresets, setShowPresets] = useState(false);
  const [randomSeed, setRandomSeed] = useState(Date.now());

  const backgroundLayer = layers.find((l) => l.type === 'background') as BackgroundLayer | undefined;

  // Migrate legacy background on mount if needed
  useEffect(() => {
    if (!backgroundLayer) return;

    // Check if this is a legacy gradient (has value but no gradientConfig)
    if (backgroundLayer.mode === 'gradient' && backgroundLayer.value && !backgroundLayer.gradientConfig) {
      console.log('Migrating legacy gradient background...');
      const migratedState = migrateBackgroundLayer(backgroundLayer);

      // Update the layer with the migrated gradientConfig
      updateLayer(backgroundLayer.id, {
        gradientConfig: migratedState.gradient as any,
      });

      // Update the configurations to match
      if (migratedState.gradient) {
        updateGradientConfig(migratedState.gradient as any);
        setGradientType(migratedState.gradient.kind === 'linear' ? 'linear' : 'radial');
      }
    }
  }, [backgroundLayer?.id]); // Only run when background layer changes

  const handleModeChange = useCallback((mode: BackgroundLayer['mode']) => {
    if (!backgroundLayer) return;

    let updates: Partial<BackgroundLayer> = { mode };

    // Apply stored configurations when switching modes
    if (mode === 'gradient') {
      updates.gradientConfig = configurations.gradient;
      updates.value = ''; // Clear legacy value
    }

    updateLayer(backgroundLayer.id, updates);
  }, [backgroundLayer, updateLayer, configurations]);

  // Gradient handlers
  const handleGradientTypeChange = useCallback((type: 'linear' | 'radial') => {
    setGradientType(type);

    // Get default config for the type
    const defaultConfig: AnyGradientConfig = type === 'radial'
      ? DEFAULT_RADIAL_GRADIENT
      : DEFAULT_LINEAR_GRADIENT;

    updateGradientConfig(defaultConfig);

    if (backgroundLayer) {
      updateLayer(backgroundLayer.id, {
        gradientConfig: defaultConfig
      });
    }
  }, [backgroundLayer, updateLayer, updateGradientConfig]);

  const handleGradientChange = useCallback((config: AnyGradientConfig) => {
    if (!backgroundLayer) return;

    updateGradientConfig(config);
    updateLayer(backgroundLayer.id, {
      gradientConfig: config
    });
  }, [backgroundLayer, updateLayer, updateGradientConfig]);

  const handlePresetSelect = useCallback((preset: typeof GRADIENT_PRESETS[0]) => {
    handleGradientChange(preset.config);
    setGradientType(preset.config.type);
  }, [handleGradientChange]);

  const handleRandomGradient = useCallback(() => {
    const newSeed = Date.now();
    setRandomSeed(newSeed);

    const randomConfig = generateRandomGradient(newSeed);
    handleGradientChange(randomConfig);
    setGradientType(randomConfig.type);
  }, [handleGradientChange]);

  // File upload handler
  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !backgroundLayer) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateLayer(backgroundLayer.id, { mode: 'upload', value: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [backgroundLayer, updateLayer]);

  if (!backgroundLayer) {
    return (
      <div className="p-4 text-center text-gray-500">
        No background layer found
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          Background Style
        </h3>

        <Tabs
          defaultValue={backgroundLayer.mode}
          value={backgroundLayer.mode}
          onValueChange={(value) => handleModeChange(value as BackgroundLayer['mode'])}
        >
          <TabList className="mb-4">
            <Tab value="gradient">Gradient</Tab>
            <Tab value="upload">Upload</Tab>
          </TabList>

          {/* GRADIENT TAB */}
          <TabPanel value="gradient" className="space-y-3">
            {/* Gradient type selector */}
            <div className="flex gap-2 mb-3">
              {(['linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleGradientTypeChange(type)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                    gradientType === type
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex-1 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronDown className={`w-4 h-4 inline mr-1 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                Presets ({GRADIENT_PRESETS.length})
              </button>
              <button
                onClick={handleRandomGradient}
                className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                title={`Seed: ${randomSeed}`}
              >
                <Shuffle className="w-4 h-4 inline mr-1" />
                Randomize
              </button>
            </div>

            {/* Presets grid */}
            {showPresets && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="h-12 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
                    style={{
                      background: preset.config.type === 'linear'
                        ? `linear-gradient(90deg, ${preset.config.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                        : `linear-gradient(90deg, ${preset.config.stops[0].color}, ${preset.config.stops[preset.config.stops.length - 1].color})`
                    }}
                    title={preset.name}
                  >
                    <span className="sr-only">{preset.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Gradient editor */}
            <GradientEditor
              config={backgroundLayer.gradientConfig || configurations.gradient}
              onChange={handleGradientChange}
            />
          </TabPanel>

          {/* UPLOAD TAB */}
          <TabPanel value="upload" className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {backgroundLayer.mode === 'upload' && backgroundLayer.value.startsWith('data:') ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={backgroundLayer.value}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            )}
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};