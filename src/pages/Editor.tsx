import { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { useEditorStore, selectProject, selectSelectedLayer } from '../state/editorStore';
import { autosaveProject } from '../lib/storage';
import { AUTOSAVE_INTERVAL } from '../state/constants';
import { Stage } from '../components/canvas/Stage';
import { BackgroundPanelEnhanced as BackgroundPanel } from '../components/panels/BackgroundPanelEnhanced';
import { TextPanel } from '../components/panels/TextPanel';
import { ContactsPanel } from '../components/panels/ContactsPanel';
import { QRPanelSimple as QRPanel } from '../components/panels/QRPanelSimple';
import { ImagePanel } from '../components/panels/ImagePanel';
import { TemplatePanel } from '../components/panels/TemplatePanel';
import { ExportPanel } from '../components/panels/ExportPanel';
import { LayersPanel } from '../components/panels/LayersPanel';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import {
  Undo2,
  Redo2,
  Grid3x3,
  Crosshair,
  Eye,
  Save,
  Palette,
  Type,
  Users,
  QrCode,
  Image as ImageIcon,
  LayoutTemplate,
  Layers as LayersIcon,
  Download,
} from 'lucide-react';

type PanelTab =
  | 'background'
  | 'text'
  | 'contacts'
  | 'qr'
  | 'image'
  | 'templates'
  | 'layers'
  | 'export';

const PANEL_TABS = [
  { id: 'background', label: 'Background', icon: Palette },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'layers', label: 'Layers', icon: LayersIcon },
  { id: 'export', label: 'Export', icon: Download },
] as const;

export const Editor = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('background');
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showCenterLines, setShowCenterLines] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `Saved ${minutes}m ago`;
  };

  // Render properties panel for selected layer
  const renderPropertiesPanel = () => {
    if (!selectedLayer) {
      return (
        <div className="p-4 text-sm text-gray-500">
          <p>Select a layer to edit its properties</p>
        </div>
      );
    }

    // Show appropriate panel based on selected layer type
    switch (selectedLayer.type) {
      case 'background':
        return <BackgroundPanel />;
      case 'text':
        return <TextPanel />;
      case 'contact':
        return <ContactsPanel />;
      case 'qr':
        return <QRPanel />;
      case 'image':
        return <ImagePanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            LinkedIn Cover Generator
          </h1>
        </div>

        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            <Button
              variant={showGrid ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              title="Show Grid"
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

          {/* Autosave indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Save className="w-3 h-3" />
            <span>{lastSaved ? formatLastSaved() : 'Autosave enabled'}</span>
          </div>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Panel Tabs */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PanelTab)}
            defaultValue="background"
          >
            <TabList>
              {PANEL_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab key={tab.id} value={tab.id}>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </div>
                  </Tab>
                );
              })}
            </TabList>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <TabPanel value="background">
                <BackgroundPanel />
              </TabPanel>
              <TabPanel value="text">
                <TextPanel />
              </TabPanel>
              <TabPanel value="contacts">
                <ContactsPanel />
              </TabPanel>
              <TabPanel value="qr">
                <QRPanel />
              </TabPanel>
              <TabPanel value="image">
                <ImagePanel />
              </TabPanel>
              <TabPanel value="templates">
                <TemplatePanel />
              </TabPanel>
              <TabPanel value="layers">
                <LayersPanel />
              </TabPanel>
              <TabPanel value="export">
                <ExportPanel stageRef={stageRef} />
              </TabPanel>
            </div>
          </Tabs>
        </aside>

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
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto scrollbar-thin">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Properties</h2>
          </div>
          {renderPropertiesPanel()}
        </aside>
      </div>
    </div>
  );
};
