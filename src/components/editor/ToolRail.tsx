import { MousePointer, Type, Image, Users, QrCode, Palette, LayoutTemplate } from 'lucide-react';
import { Tool, ToolId } from './types';
import { cn } from '../../lib/utils';

const TOOLS: Tool[] = [
  { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'contact', icon: Users, label: 'Contacts', shortcut: 'C' },
  { id: 'qr', icon: QrCode, label: 'QR Code', shortcut: 'Q' },
  { id: 'background', icon: Palette, label: 'Background', shortcut: 'B' },
  { id: 'template', icon: LayoutTemplate, label: 'Templates', shortcut: 'P' },
];

interface ToolRailProps {
  activeTool: ToolId;
  onToolChange: (toolId: ToolId) => void;
}

export const ToolRail = ({ activeTool, onToolChange }: ToolRailProps) => {
  return (
    <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col py-2">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              'relative w-full h-12 flex items-center justify-center group transition-all',
              'hover:bg-gray-100',
              isActive && 'bg-blue-600 hover:bg-blue-700'
            )}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <Icon
              className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
              )}
            />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {tool.label}
              {tool.shortcut && (
                <span className="ml-2 text-gray-300">({tool.shortcut})</span>
              )}
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r" />
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div className="flex-1" />

      {/* Help section at bottom */}
      <div className="border-t border-gray-200 pt-2 mt-2">
        <button
          className="w-full h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Keyboard shortcuts"
        >
          <span className="text-xs font-medium">?</span>
        </button>
      </div>
    </div>
  );
};