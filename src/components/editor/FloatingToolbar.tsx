import { useEffect, useState, useRef } from 'react';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const FloatingToolbar = () => {
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const deleteLayer = useEditorStore((state) => state.deleteLayer);
  const duplicateLayer = useEditorStore((state) => state.duplicateLayer);
  const layers = useEditorStore((state) => state.project?.layers || []);
  const reorderLayers = useEditorStore((state) => state.reorderLayers);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Calculate position based on selected layer
  useEffect(() => {
    if (!selectedLayer || selectedLayer.type === 'background') {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Position toolbar above the selected element
    const canvasContainer = document.querySelector('.shadow-2xl');
    if (canvasContainer) {
      const rect = canvasContainer.getBoundingClientRect();
      const layerX = selectedLayer.position?.x || 0;
      const layerY = selectedLayer.position?.y || 0;

      // Calculate position relative to viewport
      // Scale factor: Canvas is 1584px wide
      const scaleX = rect.width / 1584;
      const scaleY = rect.height / 396;

      const toolbarX = rect.left + layerX * scaleX;
      const toolbarY = rect.top + layerY * scaleY - 50; // Position above

      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 400, toolbarX)),
        y: Math.max(10, toolbarY),
      });
    }
  }, [selectedLayer]);

  if (!visible || !selectedLayer || selectedLayer.type === 'background') {
    return null;
  }

  const layerIndex = layers.findIndex((l) => l.id === selectedLayer.id);
  const canMoveUp = layerIndex > 1; // Can't move above background
  const canMoveDown = layerIndex < layers.length - 1;

  const handleDuplicate = () => {
    duplicateLayer(selectedLayer.id);
  };

  const handleDelete = () => {
    deleteLayer(selectedLayer.id);
  };

  const handleToggleLock = () => {
    updateLayer(selectedLayer.id, { locked: !selectedLayer.locked });
  };

  const handleToggleVisibility = () => {
    updateLayer(selectedLayer.id, { visible: !selectedLayer.visible });
  };

  const handleMoveUp = () => {
    if (canMoveUp) {
      reorderLayers(layerIndex, layerIndex - 1);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      reorderLayers(layerIndex, layerIndex + 1);
    }
  };

  const handleAlign = (alignment: 'left' | 'center' | 'right') => {
    const canvasWidth = 1584;
    let x = selectedLayer.position?.x || 0;

    switch (alignment) {
      case 'left':
        x = 50;
        break;
      case 'center':
        x = canvasWidth / 2 - 100; // Assuming element width ~200px
        break;
      case 'right':
        x = canvasWidth - 250;
        break;
    }

    updateLayer(selectedLayer.id, { position: { ...selectedLayer.position, x } });
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-1 flex items-center gap-1',
        'animate-in fade-in zoom-in-95 duration-200'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="p-2 rounded hover:bg-gray-100 transition-colors group"
        title="Duplicate layer (Ctrl+D)"
      >
        <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Alignment */}
      <div className="flex items-center">
        <button
          onClick={() => handleAlign('left')}
          className="p-2 rounded hover:bg-gray-100 transition-colors group"
          title="Align left"
        >
          <AlignLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        </button>
        <button
          onClick={() => handleAlign('center')}
          className="p-2 rounded hover:bg-gray-100 transition-colors group"
          title="Align center"
        >
          <AlignCenter className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        </button>
        <button
          onClick={() => handleAlign('right')}
          className="p-2 rounded hover:bg-gray-100 transition-colors group"
          title="Align right"
        >
          <AlignRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Layer order */}
      <button
        onClick={handleMoveUp}
        disabled={!canMoveUp}
        className={cn(
          'p-2 rounded transition-colors group',
          canMoveUp ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
        )}
        title="Move layer up"
      >
        <MoveUp className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
      </button>
      <button
        onClick={handleMoveDown}
        disabled={!canMoveDown}
        className={cn(
          'p-2 rounded transition-colors group',
          canMoveDown ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
        )}
        title="Move layer down"
      >
        <MoveDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Visibility */}
      <button
        onClick={handleToggleVisibility}
        className="p-2 rounded hover:bg-gray-100 transition-colors group"
        title={selectedLayer.visible ? 'Hide layer' : 'Show layer'}
      >
        {selectedLayer.visible ? (
          <Eye className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        ) : (
          <EyeOff className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        )}
      </button>

      {/* Lock */}
      <button
        onClick={handleToggleLock}
        className="p-2 rounded hover:bg-gray-100 transition-colors group"
        title={selectedLayer.locked ? 'Unlock layer' : 'Lock layer'}
      >
        {selectedLayer.locked ? (
          <Lock className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        ) : (
          <Unlock className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        )}
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="p-2 rounded hover:bg-red-100 transition-colors group"
        title="Delete layer (Del)"
      >
        <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
      </button>
    </div>
  );
};