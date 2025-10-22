import { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { useEditorStore, selectProject, selectSelectedLayer } from '../../state/editorStore';
import { autosaveProject } from '../../lib/storage';
import { AUTOSAVE_INTERVAL, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../state/constants';
import { Stage } from '../canvas/Stage';
import { UnifiedSidebar } from './UnifiedSidebar';
import { RightSidebar } from './RightSidebar';
import { FloatingToolbar } from './FloatingToolbar';
import { ExportPanel } from '../panels/ExportPanel';
import { Button } from '../ui/Button';
import { useResponsive } from '../../hooks/useResponsive';
import {
  Undo2,
  Redo2,
  Grid3x3,
  Crosshair,
  Eye,
  Save,
  Download,
  Menu,
  X,
  Layers as LayersIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ResponsiveEditor = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showCenterLines, setShowCenterLines] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const project = useEditorStore(selectProject);
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo());
  const canRedo = useEditorStore((state) => state.canRedo());

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

  // Close mobile panels when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false);
      setMobileLayersOpen(false);
    }
  }, [isDesktop]);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  // Reset zoom to 100%
  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-sm font-semibold">LinkedIn Cover</h1>

          <button
            onClick={() => setMobileLayersOpen(true)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <LayersIcon className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Desktop/Tablet Header */}
      {!isMobile && (
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h1 className={cn('font-bold text-gray-900', isTablet ? 'text-base' : 'text-lg')}>
              LinkedIn Cover Generator
            </h1>
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

            {isDesktop && (
              <>
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

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(zoomLevel * 1.1, 4))}
                    title="Zoom In (Scroll Up)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetZoom}
                    title="Reset Zoom (100%)"
                    className="min-w-[60px] text-xs"
                  >
                    {Math.round(zoomLevel * 100)}%
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(zoomLevel / 1.1, 0.25))}
                    title="Zoom Out (Scroll Down)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            <span className="text-gray-300">|</span>

            {/* Export */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className={cn('gap-1', isMobile && 'px-2')}
            >
              <Download className="w-3.5 h-3.5" />
              {!isMobile && <span>Export</span>}
            </Button>

            {/* Autosave indicator */}
            {!isMobile && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Save className="w-3 h-3" />
                <span>{lastSaved ? formatLastSaved() : 'Auto'}</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {isDesktop && <UnifiedSidebar />}

        {/* Tablet Overlay Sidebar */}
        {isTablet && mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 z-50 animate-in slide-in-from-left">
              <UnifiedSidebar />
            </div>
          </>
        )}

        {/* Mobile Bottom Sheet Sidebar */}
        {isMobile && mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed left-0 right-0 bottom-0 h-[70vh] bg-white rounded-t-xl z-50 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-base font-semibold">Tools & Properties</h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-auto pb-20">
                <UnifiedSidebar />
              </div>
            </div>
          </>
        )}

        {/* Center - Canvas */}
        <main
          className={cn(
            'flex-1 flex items-center justify-center overflow-auto',
            isDesktop ? 'p-8' : isTablet ? 'p-4' : 'p-2'
          )}
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          <div
            className={cn(
              isMobile && 'transform scale-75'
            )}
          >
            <Stage
              ref={stageRef}
              showGrid={showGrid}
              showSafeZone={showSafeZone}
              showCenterLines={showCenterLines}
              onScaleChange={setZoomLevel}
              controlledScale={zoomLevel}
            />
          </div>

          {/* Floating Toolbar - Desktop only */}
          {isDesktop && <FloatingToolbar />}
        </main>

        {/* Desktop Right Sidebar - Layers */}
        {isDesktop && <RightSidebar />}

        {/* Mobile Layers Bottom Sheet */}
        {isMobile && mobileLayersOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileLayersOpen(false)}
            />
            <div className="fixed left-0 right-0 bottom-0 h-[50vh] bg-white rounded-t-xl z-50 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-base font-semibold">Layers</h2>
                <button
                  onClick={() => setMobileLayersOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-auto pb-20">
                <RightSidebar />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      {isMobile && (
        <div className="flex items-center justify-around p-2 bg-white border-t border-gray-200">
          <Button
            variant={showGrid ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="flex-col gap-0 h-auto py-1"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="text-[10px]">Grid</span>
          </Button>
          <Button
            variant={showSafeZone ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowSafeZone(!showSafeZone)}
            className="flex-col gap-0 h-auto py-1"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[10px]">Safe</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="flex-col gap-0 h-auto py-1"
          >
            <Undo2 className="w-4 h-4" />
            <span className="text-[10px]">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="flex-col gap-0 h-auto py-1"
          >
            <Redo2 className="w-4 h-4" />
            <span className="text-[10px]">Redo</span>
          </Button>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={cn(
              'bg-white rounded-lg shadow-xl max-h-[80vh] overflow-auto',
              isMobile ? 'w-full' : 'w-96'
            )}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Export Design</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExportPanel stageRef={stageRef} />
          </div>
        </div>
      )}
    </div>
  );
};