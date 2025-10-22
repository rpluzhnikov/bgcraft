import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  MoreVertical,
  Copy,
  Edit2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  useUILayoutStore,
  selectIsLayersOpen,
} from '../../state/uiLayoutStore';
import { useEditorStore, selectLayers, selectSelectedLayerId } from '../../state/editorStore';
import { Layer } from '../../types';

// Layer icon based on type
const getLayerIcon = (layer: Layer): string => {
  switch (layer.type) {
    case 'background':
      return '🎨';
    case 'text':
      return 'T';
    case 'image':
      return '🖼';
    case 'contact':
      return '@';
    case 'qr':
      return '◼';
    default:
      return '□';
  }
};

// Get display name for layer
const getLayerDisplayName = (layer: Layer, index: number): string => {
  if (layer.name) return layer.name;

  switch (layer.type) {
    case 'background':
      return 'Background';
    case 'text':
      return `Text ${index}`;
    case 'image':
      return `Image ${index}`;
    case 'contact':
      return `Contact ${index}`;
    case 'qr':
      return `QR Code ${index}`;
    default:
      return `Layer ${index}`;
  }
};

interface LayerItemProps {
  layer: Layer;
  index: number;
  isSelected: boolean;
  isDragging?: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({ layer, index, isSelected, isDragging }) => {
  const {
    updateLayer,
    deleteLayer,
    selectLayer,
    duplicateLayer,
  } = useEditorStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(layer.name || '');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleRename = () => {
    if (newName.trim() && newName !== layer.name) {
      updateLayer(layer.id, { name: newName.trim() });
    }
    setIsRenaming(false);
  };

  const toggleVisibility = () => {
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const toggleLock = () => {
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const isBackground = layer.type === 'background';

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
        'hover:bg-gray-50',
        isSelected && 'bg-blue-50 ring-2 ring-blue-500 ring-inset',
        isDragging && 'opacity-50',
        layer.locked && 'opacity-60'
      )}
      onClick={() => !isRenaming && selectLayer(layer.id)}
    >
      {/* Drag handle */}
      {!isBackground && (
        <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {isBackground && <div className="w-4" />}

      {/* Layer icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-sm font-medium">
        {getLayerIcon(layer)}
      </div>

      {/* Layer name */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setNewName(layer.name || '');
                setIsRenaming(false);
              }
            }}
            className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm font-medium text-gray-700 truncate">
            {getLayerDisplayName(layer, index)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility();
          }}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible !== false ? (
            <Eye className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLock();
          }}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? (
            <Lock className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <Unlock className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>

        {/* More menu */}
        {!isBackground && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    duplicateLayer(layer.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    deleteLayer(layer.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MODAL_HEIGHT = 280; // Fixed height for the modal

export const LayersDrawer: React.FC = () => {
  const isOpen = useUILayoutStore(selectIsLayersOpen);
  const toggleLayers = useUILayoutStore((state) => state.toggleLayers);
  const setLayersOpen = useUILayoutStore((state) => state.setLayersOpen);

  const layers = useEditorStore(selectLayers);
  const selectedId = useEditorStore(selectSelectedLayerId);
  const reorderLayers = useEditorStore((state) => state.reorderLayers);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const fromIndex = result.source.index;
    const toIndex = result.destination.index;

    if (fromIndex !== toIndex) {
      // Convert from display index to actual layer index (reversed)
      const actualFromIndex = layers.length - 1 - fromIndex;
      const actualToIndex = layers.length - 1 - toIndex;
      reorderLayers(actualFromIndex, actualToIndex);
    }
  };

  // Keyboard shortcut for Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        const activeElement = document.activeElement;
        // Only close if the drawer or its children have focus
        const drawer = document.getElementById('layers-drawer');
        if (drawer && drawer.contains(activeElement)) {
          setLayersOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setLayersOpen]);

  // Reverse layers for display (top layer first)
  const displayLayers = [...layers].reverse();

  return (
    <>
      {/* Toggle button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={toggleLayers}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-md',
            'hover:bg-gray-50 transition-all',
            isOpen && 'bg-blue-50 border-blue-500'
          )}
          aria-label={isOpen ? 'Close layers panel' : 'Open layers panel'}
          aria-expanded={isOpen}
        >
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Layers</span>
          {layers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">
              {layers.length}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          )}
        </button>
      </div>

      {/* Modal overlay - doesn't affect layout */}
      {isOpen && (
        <>
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setLayersOpen(false)}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div
            id="layers-drawer"
            className="fixed bottom-0 left-4 right-4 bg-white border border-gray-200 rounded-t-lg shadow-2xl z-40"
            style={{ height: `${MODAL_HEIGHT}px`, maxWidth: '800px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Layers ({layers.length})
              </h2>
              <button
                onClick={() => setLayersOpen(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Close layers panel"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Layers list */}
            <div className="overflow-y-auto p-4" style={{ height: `${MODAL_HEIGHT - 60}px` }}>
              {layers.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No layers yet. Add elements from the toolbar above.
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="layers">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-1"
                      >
                        {displayLayers.map((layer, index) => {
                          const actualIndex = layers.length - 1 - index;
                          const isBackground = layer.type === 'background';

                          if (isBackground) {
                            // Background layer is not draggable
                            return (
                              <LayerItem
                                key={layer.id}
                                layer={layer}
                                index={actualIndex}
                                isSelected={layer.id === selectedId}
                              />
                            );
                          }

                          return (
                            <Draggable
                              key={layer.id}
                              draggableId={layer.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <LayerItem
                                    layer={layer}
                                    index={actualIndex}
                                    isSelected={layer.id === selectedId}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};