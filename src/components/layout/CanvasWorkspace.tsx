import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Stage } from '../canvas/Stage';
import {
  useUILayoutStore,
  selectViewOptions,
  selectZoomLevel,
} from '../../state/uiLayoutStore';
import { useEditorStore, selectSelectedLayerId } from '../../state/editorStore';
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

  // Editor state
  const selectedId = useEditorStore(selectSelectedLayerId);

  // Canvas workspace uses full available space
  // Note: Properties panel is now a sibling element, not overlapping

  // Note: Canvas click handling is managed internally by the Stage component
  // Tool interactions are handled through the Properties panel

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