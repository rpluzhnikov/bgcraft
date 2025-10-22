import React from 'react';
import { X, MousePointer, Type, Image, AtSign, QrCode, Palette, FileText, Download, Undo2, ZoomIn, Grid3x3, Clipboard } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const tools = [
  {
    icon: MousePointer,
    name: 'Select Tool',
    shortcut: 'V',
    description: 'Click to select and move layers on the canvas. Drag to reposition, use handles to resize and rotate elements.',
  },
  {
    icon: Type,
    name: 'Text Tool',
    shortcut: 'T',
    description: 'Add custom text to your cover. Choose from multiple fonts, adjust size, color, and add shadows or background plates for better readability.',
  },
  {
    icon: Image,
    name: 'Image Tool',
    shortcut: 'I',
    description: 'Upload and place images on your cover. Supports drag-and-drop, resize, and positioning. Perfect for logos or decorative elements.',
  },
  {
    icon: AtSign,
    name: 'Contact Tool',
    shortcut: 'C',
    description: 'Add contact chips for GitHub, Telegram, Email, Website, Phone, or custom platforms. Choose from solid, outline, or minimal styles.',
  },
  {
    icon: QrCode,
    name: 'QR Code Tool',
    shortcut: 'Q',
    description: 'Generate QR codes for any URL or text. Customize colors, size, and style. Great for linking to your portfolio or social profiles.',
  },
  {
    icon: Palette,
    name: 'Background Tool',
    shortcut: 'B',
    description: 'Set your cover background with solid colors, gradients, patterns, or upload custom images. Apply filters like blur and brightness.',
  },
  {
    icon: FileText,
    name: 'Templates',
    shortcut: 'P',
    description: 'Browse and apply pre-designed templates to quickly start your cover design. Each template includes coordinated colors and layouts.',
  },
];

const shortcuts = [
  {
    icon: Clipboard,
    name: 'Paste Image',
    keys: 'Ctrl+V',
    description: 'Paste an image directly from your clipboard. Copy any image and press Ctrl+V to add it to your canvas.',
  },
  {
    icon: Undo2,
    name: 'Undo / Redo',
    keys: 'Ctrl+Z / Ctrl+Y',
    description: 'Step backward or forward through your editing history.',
  },
  {
    icon: Download,
    name: 'Export',
    keys: 'Ctrl+E',
    description: 'Download your cover as PNG or JPEG. Choose quality settings for optimal file size.',
  },
  {
    icon: Grid3x3,
    name: 'Toggle Grid',
    keys: 'G',
    description: 'Show or hide the alignment grid to help position elements precisely.',
  },
  {
    icon: ZoomIn,
    name: 'Zoom',
    keys: 'Ctrl +/- or 0',
    description: 'Zoom in/out or reset to 100% view. Use the zoom controls in the top toolbar.',
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">How to Use [BG]Craft</h2>
            <p className="text-sm text-gray-500 mt-1">Quick guide to creating your perfect LinkedIn cover</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close help"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {/* Getting Started */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              LinkedIn covers are displayed at <strong>1584×396 pixels</strong>. The left 240px is reserved for your profile picture (shown as the safe zone).
              Use the tools below to add text, images, contacts, and QR codes to create a professional cover that stands out.
            </p>
          </section>

          {/* Tools */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tools</h3>
            <div className="space-y-4">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.name} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{tool.name}</h4>
                        <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                          {tool.shortcut}
                        </kbd>
                      </div>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-4">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <div key={shortcut.name} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{shortcut.name}</h4>
                        <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                          {shortcut.keys}
                        </kbd>
                      </div>
                      <p className="text-sm text-gray-600">{shortcut.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tips */}
          <section className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pro Tips</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  Use the <strong>grid</strong> (press G) to align elements perfectly
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  Keep important content <strong>outside the safe zone</strong> (first 240px) to avoid overlap with your profile picture
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  Use <strong>Ctrl+D</strong> to duplicate selected layers quickly
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  Layers panel (right side) lets you reorder, hide, or lock elements
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  Export as <strong>PNG</strong> for transparency or <strong>JPEG</strong> for smaller file sizes
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
