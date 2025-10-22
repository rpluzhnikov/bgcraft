import React, { useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Stage } from '../canvas/Stage';
import {
  useUILayoutStore,
  selectViewOptions,
  selectZoomLevel,
  Tool,
} from '../../state/uiLayoutStore';
import { useEditorStore, selectSelectedLayerId } from '../../state/editorStore';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

interface CanvasWorkspaceProps {
  className?: string;
  stageRef?: React.RefObject<Konva.Stage>;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ className, stageRef: externalStageRef }) => {
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // UI Layout state
  const viewOptions = useUILayoutStore(selectViewOptions);
  const zoomLevel = useUILayoutStore(selectZoomLevel);
  const activeTool = useUILayoutStore((state) => state.activeTool);
  const setActiveTool = useUILayoutStore((state) => state.setActiveTool);

  // Editor state
  const selectedId = useEditorStore(selectSelectedLayerId);
  const selectLayer = useEditorStore((state: any) => state.selectLayer);
  const addLayer = useEditorStore((state: any) => state.addLayer);

  // Canvas workspace uses full available space
  // Note: Properties panel is now a sibling element, not overlapping

  // Note: Canvas click handling is managed internally by the Stage component
  // Tool interactions are handled through the Properties panel

  // Handle tool-specific actions
  const handleToolAction = (tool: Tool, position: { x: number; y: number }) => {
    switch (tool) {
      case 'text':
        addLayer({
          type: 'text',
          text: 'New Text',
          position,
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: '#000000',
          width: 200,
          height: 50,
        });
        // Switch to select tool after adding
        setActiveTool('select');
        break;

      case 'shapes':
        // Add a default rectangle shape (placeholder)
        addLayer({
          type: 'text', // Using text as placeholder for shapes
          text: '▢',
          position,
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: '#000000',
          width: 100,
          height: 100,
        });
        setActiveTool('select');
        break;

      case 'qr':
        addLayer({
          type: 'qr',
          position,
          simpleConfig: {
            url: 'https://example.com',
            size: 150,
            foreColor: '#000000',
            backColor: '#ffffff',
            quietZone: 10,
          },
        });
        setActiveTool('select');
        break;

      // Other tools would open their panels in the properties section
      // rather than directly adding to canvas
      default:
        break;
    }
  };

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Zoom controls
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          useUILayoutStore.getState().setZoomLevel(
            Math.min(200, zoomLevel + 10)
          );
        } else if (e.key === '-') {
          e.preventDefault();
          useUILayoutStore.getState().setZoomLevel(
            Math.max(25, zoomLevel - 10)
          );
        } else if (e.key === '0') {
          e.preventDefault();
          useUILayoutStore.getState().resetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel]);

  // Calculate scale from zoom level
  const scale = zoomLevel / 100;

  return (
    <div
      ref={containerRef}
      className={cn('canvas-workspace flex-1 flex items-center justify-center overflow-hidden relative bg-gray-200', className)}
    >
      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div>
            Zoom: <span className="font-medium">{zoomLevel}%</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            Canvas: <span className="font-medium">1584×396px</span>
          </div>
          {selectedId && (
            <>
              <div className="h-4 w-px bg-gray-300" />
              <div className="text-blue-600 font-medium">
                1 layer selected
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stage container */}
      <div className="relative">
        <Stage
          ref={stageRef}
          showGrid={viewOptions.showGrid}
          showSafeZone={viewOptions.showSafeZone}
          showCenterLines={viewOptions.showCenterLines}
          controlledScale={scale}
          onScaleChange={(newScale) => {
            const zoomPercent = Math.round(newScale * 100);
            useUILayoutStore.getState().setZoomLevel(zoomPercent);
          }}
        />
      </div>

      {/* Cursor style based on active tool */}
      <style>{`
        .canvas-workspace {
          cursor: ${activeTool && activeTool !== 'select' ? 'crosshair' : 'default'};
        }
      `}</style>
    </div>
  );
};