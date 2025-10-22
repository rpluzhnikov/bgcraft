import { useState } from 'react';
import { useEditorStore, selectLayers, selectSelectedLayerId } from '../../state/editorStore';
import { Layer } from '../../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronRight,
  Layers as LayersIcon,
  GripVertical,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export const RightSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const layers = useEditorStore(selectLayers);
  const selectedLayerId = useEditorStore(selectSelectedLayerId);
  const selectLayer = useEditorStore((state) => state.selectLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const deleteLayer = useEditorStore((state) => state.deleteLayer);
  const reorderLayers = useEditorStore((state) => state.reorderLayers);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderLayers(result.source.index, result.destination.index);
  };

  const handleLayerClick = (layerId: string) => {
    selectLayer(layerId === selectedLayerId ? null : layerId);
  };

  const handleToggleVisibility = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const handleToggleLock = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const handleDelete = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLayer(layerId);
  };

  const getLayerIcon = (layer: Layer) => {
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

  return (
    <aside
      className={cn(
        'bg-white border-l border-gray-200 transition-all duration-300 flex',
        collapsed ? 'w-12' : 'w-64'
      )}
    >
      {/* Collapse toggle */}
      <div className="w-12 border-r border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
          title={collapsed ? 'Expand layers' : 'Collapse layers'}
        >
          <ChevronRight
            className={cn(
              'w-4 h-4 text-gray-500 transition-transform',
              !collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Layers panel content */}
      {!collapsed && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Layers</h2>
              <span className="ml-auto text-xs text-gray-500">{layers.length}</span>
            </div>
          </div>

          {/* Layers list */}
          <div className="flex-1 overflow-y-auto">
            {layers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No layers yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Use the tools to add elements
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="layers">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-2 space-y-1"
                    >
                      {[...layers].reverse().map((layer, index) => {
                        const actualIndex = layers.length - 1 - index;
                        const isSelected = layer.id === selectedLayerId;
                        const isBackground = layer.type === 'background';

                        return (
                          <Draggable
                            key={layer.id}
                            draggableId={layer.id}
                            index={actualIndex}
                            isDragDisabled={isBackground || layer.locked}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onClick={() => handleLayerClick(layer.id)}
                                className={cn(
                                  'group flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer',
                                  'hover:bg-gray-50',
                                  isSelected && 'bg-blue-50 ring-1 ring-blue-200',
                                  snapshot.isDragging && 'shadow-lg bg-white opacity-90',
                                  layer.locked && 'opacity-60',
                                  !layer.visible && 'opacity-40'
                                )}
                              >
                                {/* Drag handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    'opacity-0 group-hover:opacity-100 transition-opacity',
                                    isBackground && 'invisible'
                                  )}
                                >
                                  <GripVertical className="w-3 h-3 text-gray-400" />
                                </div>

                                {/* Layer icon */}
                                <div
                                  className={cn(
                                    'w-6 h-6 flex items-center justify-center text-xs font-medium rounded',
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-600'
                                  )}
                                >
                                  {getLayerIcon(layer)}
                                </div>

                                {/* Layer name */}
                                <span className="flex-1 text-xs font-medium text-gray-700 truncate">
                                  {layer.name || `${layer.type} layer`}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* Visibility toggle */}
                                  <button
                                    onClick={(e) => handleToggleVisibility(layer, e)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                                  >
                                    {layer.visible ? (
                                      <Eye className="w-3 h-3 text-gray-500" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>

                                  {/* Lock toggle */}
                                  <button
                                    onClick={(e) => handleToggleLock(layer, e)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                                  >
                                    {layer.locked ? (
                                      <Lock className="w-3 h-3 text-gray-500" />
                                    ) : (
                                      <Unlock className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>

                                  {/* Delete */}
                                  {!isBackground && (
                                    <button
                                      onClick={(e) => handleDelete(layer.id, e)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors"
                                      title="Delete layer"
                                    >
                                      <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-600" />
                                    </button>
                                  )}
                                </div>
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

          {/* Footer info */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Drag to reorder • Click to select
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};