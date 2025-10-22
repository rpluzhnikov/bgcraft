import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { ToolId } from './types';
import { BackgroundPanelEnhanced as BackgroundPanel } from '../panels/BackgroundPanelEnhanced';
import { TextPanel } from '../panels/TextPanel';
import { ContactsPanel } from '../panels/ContactsPanel';
import { QRPanelSimple as QRPanel } from '../panels/QRPanelSimple';
import { ImagePanel } from '../panels/ImagePanel';
import { TemplatePanel } from '../panels/TemplatePanel';
import { ChevronLeft, Plus, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContextPanelProps {
  activeTool: ToolId;
  onClose?: () => void;
  collapsed?: boolean;
}

export const ContextPanel = ({ activeTool, onClose, collapsed = false }: ContextPanelProps) => {
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const addLayer = useEditorStore((state) => state.addLayer);

  // Determine what content to show based on context
  const getContent = () => {
    // If a layer is selected and we're in select mode, show its properties
    if (activeTool === 'select' && selectedLayer) {
      switch (selectedLayer.type) {
        case 'background':
          return {
            title: 'Background Settings',
            icon: Settings,
            content: <BackgroundPanel />,
          };
        case 'text':
          return {
            title: 'Text Properties',
            icon: Settings,
            content: <TextPanel />,
          };
        case 'contact':
          return {
            title: 'Contact Properties',
            icon: Settings,
            content: <ContactsPanel />,
          };
        case 'qr':
          return {
            title: 'QR Code Properties',
            icon: Settings,
            content: <QRPanel />,
          };
        case 'image':
          return {
            title: 'Image Properties',
            icon: Settings,
            content: <ImagePanel />,
          };
      }
    }

    // Otherwise show tool-specific panels
    switch (activeTool) {
      case 'text':
        return {
          title: 'Add Text',
          icon: Plus,
          content: <TextPanel />,
          description: 'Click "Add Text Layer" to create a new text element',
        };
      case 'image':
        return {
          title: 'Add Image',
          icon: Plus,
          content: <ImagePanel />,
          description: 'Upload an image to add it to your design',
        };
      case 'contact':
        return {
          title: 'Add Contacts',
          icon: Plus,
          content: <ContactsPanel />,
          description: 'Add social media contact information',
        };
      case 'qr':
        return {
          title: 'Add QR Code',
          icon: Plus,
          content: <QRPanel />,
          description: 'Generate a QR code for your URL',
        };
      case 'background':
        return {
          title: 'Background',
          icon: Settings,
          content: <BackgroundPanel />,
          description: 'Customize the canvas background',
        };
      case 'template':
        return {
          title: 'Templates',
          icon: Settings,
          content: <TemplatePanel />,
          description: 'Choose from pre-designed templates',
        };
      case 'select':
      default:
        return {
          title: 'Properties',
          icon: Settings,
          content: (
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No Selection</h3>
                <p className="text-xs text-gray-500">
                  Select a layer to view and edit its properties
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-2">Quick tip:</p>
                <p className="text-xs text-gray-600">
                  Use the tools on the left to add new elements to your design
                </p>
              </div>
            </div>
          ),
        };
    }
  };

  const panelContent = getContent();
  const Icon = panelContent.icon;

  return (
    <div
      className={cn(
        'w-72 bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300',
        collapsed && 'w-0 overflow-hidden'
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-900">{panelContent.title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Close panel"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Panel Description */}
      {panelContent.description && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-700">{panelContent.description}</p>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {panelContent.content}
      </div>
    </div>
  );
};