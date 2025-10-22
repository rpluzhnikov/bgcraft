import React, { useEffect, useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  Grid3x3,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Layer } from '../../types';
import { TopToolsToolbar } from './TopToolsToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersDrawer } from './LayersDrawer';
import { CanvasWorkspace } from './CanvasWorkspace';
import { ExportModal } from '../modals/ExportModal';
import { HelpModal } from '../modals/HelpModal';
import { WelcomeModal } from '../modals/WelcomeModal';
import { FeedbackButton } from '../ui/FeedbackButton';
import {
  useUILayoutStore,
  selectViewOptions,
  selectZoomLevel,
} from '../../state/uiLayoutStore';
import { useEditorStore, selectProject } from '../../state/editorStore';
import { autosaveProject } from '../../lib/storage';
import Konva from 'konva';

export const ModernEditor: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Welcome modal state with localStorage persistence
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('linkedin-cover-gen:has-seen-welcome');
    return hasSeenWelcome !== 'true';
  });

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('linkedin-cover-gen:has-seen-welcome', 'true');
  };

  // UI Layout state
  const viewOptions = useUILayoutStore(selectViewOptions);
  const toggleGrid = useUILayoutStore((state) => state.toggleGrid);
  const toggleSafeZone = useUILayoutStore((state) => state.toggleSafeZone);
  const zoomLevel = useUILayoutStore(selectZoomLevel);
  const setZoomLevel = useUILayoutStore((state) => state.setZoomLevel);
  const resetZoom = useUILayoutStore((state) => state.resetZoom);

  // Editor state
  const project = useEditorStore(selectProject);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);

  // Autosave
  useEffect(() => {
    const interval = setInterval(() => {
      if (project) {
        autosaveProject(project);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [project]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo()) undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo()) redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      }

      // Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      }

      // Grid toggle
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, toggleGrid]);

  // Clipboard paste handler
  const addLayer = useEditorStore((state) => state.addLayer);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Don't trigger when pasting in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      // Look for image in clipboard
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) continue;

          // Convert to data URL
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;

            // Create image to get natural dimensions
            const img = new Image();
            img.onload = () => {
              // Add image layer centered on canvas
              addLayer({
                type: 'image',
                src: dataUrl,
                naturalSize: { w: img.width, h: img.height },
                objectFit: 'contain',
                width: Math.min(400, img.width),
                height: Math.min(400, img.height) * (img.height / img.width),
                position: { x: 300, y: 100 },
                rotation: 0,
                opacity: 1,
                name: 'Pasted Image',
                visible: true,
              } as Omit<Layer, 'id'>);
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addLayer]);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100">
      {/* Top App Bar */}
      <header className="h-14 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">
              <span className="font-bold text-blue-600">[BG]</span>
              <span className="font-normal">Craft</span>
            </h1>
            <span className="text-sm text-gray-500 hidden md:inline">
              • Create useful LinkedIn background images in minutes
            </span>
          </div>

          {/* Center - History and view controls */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className={cn(
                  'p-2 rounded hover:bg-gray-100 transition-colors',
                  !canUndo() && 'opacity-50 cursor-not-allowed'
                )}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className={cn(
                  'p-2 rounded hover:bg-gray-100 transition-colors',
                  !canRedo() && 'opacity-50 cursor-not-allowed'
                )}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* View controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleGrid}
                className={cn(
                  'p-2 rounded hover:bg-gray-100 transition-colors',
                  viewOptions.showGrid && 'bg-blue-50 text-blue-600'
                )}
                title="Toggle Grid (G)"
                aria-label="Toggle grid"
                aria-pressed={viewOptions.showGrid}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={toggleSafeZone}
                className={cn(
                  'p-2 rounded hover:bg-gray-100 transition-colors',
                  viewOptions.showSafeZone && 'bg-blue-50 text-blue-600'
                )}
                title="Toggle Safe Zone"
                aria-label="Toggle safe zone"
                aria-pressed={viewOptions.showSafeZone}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Zoom Out (Ctrl+-)"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <div className="min-w-[60px] text-center text-sm font-medium">
                {zoomLevel}%
              </div>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Zoom In (Ctrl+=)"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                title="Reset Zoom (Ctrl+0)"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right side - Help, Feedback and Export actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              title="Help & Guide"
              aria-label="Open help guide"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help</span>
            </button>
            <FeedbackButton />
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              title="Export (Ctrl+E)"
              aria-label="Export image"
            >
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top Tools Toolbar */}
      <TopToolsToolbar />

      {/* Main content area - Canvas and Properties side by side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Workspace - takes remaining space */}
        <CanvasWorkspace stageRef={stageRef} />

        {/* Properties Panel (Right) - Fixed width */}
        <PropertiesPanel />
      </div>

      {/* Layers Drawer (Bottom) - Modal overlay */}
      <LayersDrawer />

      {/* Welcome Modal - Shows on first visit */}
      {showWelcomeModal && (
        <WelcomeModal onClose={handleCloseWelcome} />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          stageRef={stageRef}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
};