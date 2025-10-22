import { useCallback } from 'react';
import { useEditorStore, selectLayers } from '../../state/editorStore';
import { Layer } from '../../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Type,
  Image as ImageIcon,
  QrCode,
  UserPlus,
  Layers as LayersIcon,
} from 'lucide-react';

const getLayerIcon = (type: Layer['type']) => {
  switch (type) {
    case 'text':
      return Type;
    case 'image':
      return ImageIcon;
    case 'qr':
      return QrCode;
    case 'contact':
      return UserPlus;
    case 'background':
      return LayersIcon;
    default:
      return LayersIcon;
  }
};

const getLayerName = (layer: Layer): string => {
  if (layer.name) return layer.name;

  switch (layer.type) {
    case 'text':
      return 'text' in layer ? (layer.text.slice(0, 20) || 'Text Layer') : 'Text Layer';
    case 'image':
      return 'Image';
    case 'qr':
      return 'QR Code';
    case 'contact':
      return 'contact' in layer ? `${layer.platform} Contact` : 'Contact';
    case 'background':
      return 'Background';
    default:
      return 'Layer';
  }
};

export const LayersPanel = () => {
  const layers = useEditorStore(selectLayers);
  const selectedId = useEditorStore((state) => state.project.selectedId);
  const selectLayer = useEditorStore((state) => state.selectLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const deleteLayer = useEditorStore((state) => state.deleteLayer);

  const handleToggleVisibility = useCallback((layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  }, [updateLayer]);

  const handleToggleLock = useCallback((layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  }, [updateLayer]);

  const handleDelete = useCallback((layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();

    // Don't allow deleting background
    if (layer.type === 'background') {
      return;
    }

    if (confirm(`Delete "${getLayerName(layer)}"?`)) {
      deleteLayer(layer.id);
    }
  }, [deleteLayer]);

  const handleSelectLayer = useCallback((layer: Layer) => {
    // Don't select locked layers
    if (layer.locked) return;

    selectLayer(layer.id);
  }, [selectLayer]);

  // Reverse layers for display (top layer first)
  const displayLayers = [...layers].reverse();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Layers</h3>
        <span className="text-xs text-gray-500">{layers.length} total</span>
      </div>

      <div className="space-y-1">
        {displayLayers.map((layer) => {
          const Icon = getLayerIcon(layer.type);
          const isSelected = layer.id === selectedId;
          const isVisible = layer.visible ?? true;
          const isLocked = layer.locked ?? false;
          const isBackground = layer.type === 'background';

          return (
            <div
              key={layer.id}
              onClick={() => handleSelectLayer(layer)}
              className={`group flex items-center gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isLocked ? 'cursor-not-allowed opacity-75' : ''} ${
                !isVisible ? 'opacity-60' : ''
              }`}
            >
              {/* Layer icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Layer name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getLayerName(layer)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{layer.type}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Visibility toggle */}
                <button
                  onClick={(e) => handleToggleVisibility(layer, e)}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title={isVisible ? 'Hide layer' : 'Show layer'}
                >
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-gray-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Lock toggle */}
                <button
                  onClick={(e) => handleToggleLock(layer, e)}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title={isLocked ? 'Unlock layer' : 'Lock layer'}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Delete button (not for background) */}
                {!isBackground && (
                  <button
                    onClick={(e) => handleDelete(layer, e)}
                    className="p-1.5 rounded hover:bg-red-100 transition-colors"
                    title="Delete layer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {layers.length === 1 && (
        <div className="text-center text-sm text-gray-500 py-8">
          <LayersIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Add layers using the panels above</p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Click a layer to select it</p>
          <p>• Toggle visibility with the eye icon</p>
          <p>• Lock layers to prevent changes</p>
          <p>• Background layer cannot be deleted</p>
        </div>
      </div>
    </div>
  );
};
