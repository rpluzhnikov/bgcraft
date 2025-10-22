import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  useUILayoutStore,
  selectActiveTool,
  Tool
} from '../../state/uiLayoutStore';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { Layer } from '../../types';

// Import existing panel components
import { BackgroundPanelEnhanced } from '../panels/BackgroundPanelEnhanced';
import { TextPanel } from '../panels/TextPanel';
import { ContactsPanel } from '../panels/ContactsPanel';
import { QRPanelSimple } from '../panels/QRPanelSimple';
import { ImagePanel } from '../panels/ImagePanel';
import { TemplatePanel } from '../panels/TemplatePanel';


// Empty state when no selection
const NoSelectionPanel: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
    <Info className="h-12 w-12 text-gray-300 mb-3" />
    <h3 className="text-sm font-medium text-gray-700 mb-2">No Selection</h3>
    <p className="text-xs text-gray-500 max-w-[200px]">
      Select a tool from the toolbar or click on an element on the canvas to see its properties
    </p>
  </div>
);

interface PanelContentProps {
  activeTool: Tool | null;
  selectedLayer: Layer | undefined;
}

const PanelContent: React.FC<PanelContentProps> = ({ activeTool, selectedLayer }) => {
  // If a layer is selected and we're in select mode, show layer properties
  if (selectedLayer && (!activeTool || activeTool === 'select')) {
    switch (selectedLayer.type) {
      case 'background':
        return <BackgroundPanelEnhanced />;
      case 'text':
        return <TextPanel />;
      case 'contact':
        return <ContactsPanel />;
      case 'qr':
        return <QRPanelSimple />;
      case 'image':
        return <ImagePanel />;
      default:
        return <NoSelectionPanel />;
    }
  }

  // Show tool-specific panel when a tool is active
  switch (activeTool) {
    case 'text':
      return <TextPanel />;
    case 'image':
      return <ImagePanel />;
    case 'contact':
      return <ContactsPanel />;
    case 'qr':
      return <QRPanelSimple />;
    case 'background':
      return <BackgroundPanelEnhanced />;
    case 'template':
      return <TemplatePanel />;
    default:
      return <NoSelectionPanel />;
  }
};

const PANEL_WIDTH = 360; // Fixed width as per requirements

export const PropertiesPanel: React.FC = () => {
  const activeTool = useUILayoutStore(selectActiveTool);
  const selectedLayer = useEditorStore(selectSelectedLayer);

  // Get panel title
  const getPanelTitle = () => {
    if (selectedLayer && (!activeTool || activeTool === 'select')) {
      switch (selectedLayer.type) {
        case 'background':
          return 'Background Properties';
        case 'text':
          return 'Text Properties';
        case 'contact':
          return 'Contact Properties';
        case 'qr':
          return 'QR Code Properties';
        case 'image':
          return 'Image Properties';
        default:
          return 'Properties';
      }
    }

    switch (activeTool) {
      case 'text':
        return 'Add Text';
      case 'image':
        return 'Add Image';
      case 'contact':
        return 'Add Contact';
      case 'qr':
        return 'Add QR Code';
      case 'background':
        return 'Background';
      case 'template':
        return 'Templates';
      default:
        return 'Properties';
    }
  };

  return (
    <div
      className="w-[360px] h-full bg-white border-l border-gray-200 flex flex-col flex-shrink-0"
      style={{ width: `${PANEL_WIDTH}px` }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{getPanelTitle()}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <PanelContent activeTool={activeTool} selectedLayer={selectedLayer} />
      </div>

      {/* Footer with context info */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        {selectedLayer ? (
          <span>Editing: {selectedLayer.name || `${selectedLayer.type} layer`}</span>
        ) : activeTool ? (
          <span>Tool: {activeTool}</span>
        ) : (
          <span>No selection</span>
        )}
      </div>
    </div>
  );
};