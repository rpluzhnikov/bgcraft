import { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { useEditorStore, selectProject } from '../state/editorStore';
import { autosaveProject } from '../lib/storage';
import { AUTOSAVE_INTERVAL } from '../state/constants';
import type { Layer } from '../types/index';
import { Stage } from '../components/canvas/Stage';
import { UnifiedSidebar } from '../components/editor/UnifiedSidebar';
import { RightSidebar } from '../components/editor/RightSidebar';
import { FloatingToolbar } from '../components/editor/FloatingToolbar';
import { ExportPanel } from '../components/panels/ExportPanel';
import { Button } from '../components/ui/Button';
import {
  Undo2,
  Redo2,
  Grid3x3,
  Crosshair,
  Eye,
  Save,
  Download,
  Type,
  Image as ImageIcon,
  Users,
  QrCode,
} from 'lucide-react';

export const EditorNew = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showCenterLines, setShowCenterLines] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const project = useEditorStore(selectProject);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo());
  const canRedo = useEditorStore((state) => state.canRedo());
  const addLayer = useEditorStore((state) => state.addLayer);

  // Autosave functionality
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (project) {
        const success = autosaveProject(project);
        if (success) {
          setLastSaved(new Date());
        }
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [project]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      }

      // G for grid toggle
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          setShowGrid((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `Saved ${minutes}m ago`;
  };

  // Quick add functions
  const handleQuickAddText = () => {
    addLayer({
      type: 'text',
      text: 'New Text',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 'normal',
      color: '#000000',
      position: { x: 100, y: 100 },
      rotation: 0,
      opacity: 1,
      name: 'Text Layer',
      visible: true,
    } as Omit<Layer, 'id'>);
  };

  const handleQuickAddContact = () => {
    addLayer({
      type: 'contact',
      platform: 'linkedin',
      label: 'Connect on LinkedIn',
      style: 'solid',
      color: '#0077B5',
      gap: 8,
      size: 32,
      position: { x: 100, y: 200 },
      rotation: 0,
      opacity: 1,
      name: 'Contact Layer',
      visible: true,
    } as Omit<Layer, 'id'>);
  };

  const handleQuickAddQR = () => {
    addLayer({
      type: 'qr',
      simpleConfig: {
        url: 'https://example.com',
        size: 120,
        foreColor: '#000000',
        backColor: '#FFFFFF',
        quietZone: 2,
      },
      position: { x: 100, y: 100 },
      rotation: 0,
      opacity: 1,
      name: 'QR Code',
      visible: true,
    } as Omit<Layer, 'id'>);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900">
            LinkedIn Cover Generator
          </h1>

          {/* Quick Add Actions */}
          <div className="flex items-center gap-1 pl-4 border-l border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickAddText}
              title="Add Text (T)"
              className="gap-1"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs">Text</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              title="Add Image (I)"
              className="gap-1"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Image</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickAddContact}
              title="Add Contact (C)"
              className="gap-1"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Contact</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickAddQR}
              title="Add QR Code (Q)"
              className="gap-1"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-xs">QR</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <span className="text-gray-300">|</span>

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={showGrid ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              title="Show Grid (G)"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={showSafeZone ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowSafeZone(!showSafeZone)}
              title="Show Safe Zone"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={showCenterLines ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowCenterLines(!showCenterLines)}
              title="Show Center Lines"
            >
              <Crosshair className="w-4 h-4" />
            </Button>
          </div>

          <span className="text-gray-300">|</span>

          {/* Export */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>

          {/* Autosave indicator */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Save className="w-3 h-3" />
            <span>{lastSaved ? formatLastSaved() : 'Autosave'}</span>
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Unified Left Sidebar */}
        <UnifiedSidebar />

        {/* Center - Canvas */}
        <main className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
          <div>
            <Stage
              ref={stageRef}
              showGrid={showGrid}
              showSafeZone={showSafeZone}
              showCenterLines={showCenterLines}
            />
          </div>

          {/* Floating Toolbar */}
          <FloatingToolbar />
        </main>

        {/* Right Sidebar - Layers */}
        <RightSidebar />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Export Design</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <ExportPanel stageRef={stageRef} />
          </div>
        </div>
      )}
    </div>
  );
};