import { useState, useEffect, useCallback } from 'react';
import {
  getRecentColors,
  getSavedSwatches,
  addSavedSwatch,
  deleteSavedSwatch,
  updateSwatchName,
  getColorPalettes,
  addColorPalette,
  SavedSwatch,
  ColorPalette,
} from '../../lib/colorStorage';
import { generatePalette } from '../../lib/color';
import {
  Plus,
  X,
  Edit2,
  Save,
  Palette,
  Clock,
  Bookmark,
  Sparkles,
  Check,
  Trash2
} from 'lucide-react';

interface ColorSwatchesProps {
  onColorSelect: (color: string) => void;
  currentColor: string;
  fullWidth?: boolean;
}

type Tab = 'recent' | 'saved' | 'palettes';

export const ColorSwatches: React.FC<ColorSwatchesProps> = ({
  onColorSelect,
  currentColor,
  fullWidth = false,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('recent');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [savedSwatches, setSavedSwatches] = useState<SavedSwatch[]>([]);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [editingSwatchId, setEditingSwatchId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showAddSwatch, setShowAddSwatch] = useState(false);
  const [newSwatchName, setNewSwatchName] = useState('');
  const [selectedPaletteType, setSelectedPaletteType] = useState<'monochrome' | 'complementary' | 'analogous' | 'triadic'>('monochrome');

  // Load data on mount and when tabs change
  useEffect(() => {
    loadSwatchData();
  }, []);

  const loadSwatchData = useCallback(() => {
    setRecentColors(getRecentColors());
    setSavedSwatches(getSavedSwatches());
    setPalettes(getColorPalettes());
  }, []);

  // Handle saving current color as a swatch
  const handleSaveCurrentColor = useCallback(() => {
    const name = newSwatchName || currentColor;
    const swatch = addSavedSwatch(currentColor, name);

    if (swatch) {
      setSavedSwatches(getSavedSwatches());
      setShowAddSwatch(false);
      setNewSwatchName('');
    }
  }, [currentColor, newSwatchName]);

  // Handle deleting a saved swatch
  const handleDeleteSwatch = useCallback((id: string) => {
    if (deleteSavedSwatch(id)) {
      setSavedSwatches(getSavedSwatches());
    }
  }, []);

  // Handle editing swatch name
  const handleStartEdit = useCallback((swatch: SavedSwatch) => {
    setEditingSwatchId(swatch.id);
    setEditingName(swatch.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingSwatchId && editingName) {
      updateSwatchName(editingSwatchId, editingName);
      setSavedSwatches(getSavedSwatches());
      setEditingSwatchId(null);
      setEditingName('');
    }
  }, [editingSwatchId, editingName]);

  // Generate palette from current color
  const handleGeneratePalette = useCallback(() => {
    const colors = generatePalette(currentColor, selectedPaletteType);
    addColorPalette({
      name: `${selectedPaletteType} from ${currentColor}`,
      colors,
      type: selectedPaletteType,
    });
    setPalettes(getColorPalettes());
  }, [currentColor, selectedPaletteType]);

  return (
    <div className={`space-y-3 ${fullWidth ? 'w-full' : ''}`}>
      {/* Tab Navigation */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'recent'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-3 h-3" />
          Recent
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          Saved
        </button>
        <button
          onClick={() => setActiveTab('palettes')}
          className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
            activeTab === 'palettes'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Palette className="w-3 h-3" />
          Palettes
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[120px]">
        {/* Recent Colors */}
        {activeTab === 'recent' && (
          <div className="space-y-2">
            {recentColors.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => onColorSelect(color)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      color === currentColor
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent colors yet. Colors will appear here as you use them.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Last {recentColors.length} colors used (auto-saved)
            </p>
          </div>
        )}

        {/* Saved Swatches */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {/* Add new swatch */}
            {!showAddSwatch ? (
              <button
                onClick={() => setShowAddSwatch(true)}
                className="w-full px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Save Current Color
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSwatchName}
                  onChange={(e) => setNewSwatchName(e.target.value)}
                  placeholder="Name (optional)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentColor()}
                />
                <button
                  onClick={handleSaveCurrentColor}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowAddSwatch(false);
                    setNewSwatchName('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Swatch grid */}
            {savedSwatches.length > 0 ? (
              <div className="space-y-2">
                {savedSwatches.map((swatch) => (
                  <div
                    key={swatch.id}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <button
                      onClick={() => onColorSelect(swatch.color)}
                      className={`w-10 h-10 rounded-lg border-2 flex-shrink-0 ${
                        swatch.color === currentColor
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: swatch.color }}
                    />
                    {editingSwatchId === swatch.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex-1">
                        <p className="text-sm font-medium">{swatch.name}</p>
                        <p className="text-xs text-gray-500">{swatch.color}</p>
                      </div>
                    )}
                    <div className="flex gap-1">
                      {editingSwatchId === swatch.id ? (
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(swatch)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSwatch(swatch.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No saved swatches yet. Save colors for quick access.
              </p>
            )}
            {savedSwatches.length > 0 && (
              <p className="text-xs text-gray-500">
                {savedSwatches.length}/24 swatches saved
              </p>
            )}
          </div>
        )}

        {/* Palettes */}
        {activeTab === 'palettes' && (
          <div className="space-y-3">
            {/* Generate palette controls */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Generate from current color</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedPaletteType}
                  onChange={(e) => setSelectedPaletteType(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monochrome">Monochrome</option>
                  <option value="complementary">Complementary</option>
                  <option value="analogous">Analogous</option>
                  <option value="triadic">Triadic</option>
                </select>
                <button
                  onClick={handleGeneratePalette}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Palette list */}
            <div className="space-y-2">
              {palettes.map((palette) => (
                <div
                  key={palette.id}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{palette.name}</span>
                    {palette.createdAt > 0 && (
                      <span className="text-xs text-gray-500 capitalize">
                        {palette.type}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {palette.colors.map((color, index) => (
                      <button
                        key={`${palette.id}-${index}`}
                        onClick={() => onColorSelect(color)}
                        className={`flex-1 h-8 rounded border-2 transition-all ${
                          color === currentColor
                            ? 'border-blue-600 ring-1 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};