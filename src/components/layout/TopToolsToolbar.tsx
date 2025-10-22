import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Tool, useUILayoutStore, selectActiveTool } from '../../state/uiLayoutStore';

interface ToolItem {
  id: Tool;
  label: string;
  shortcut?: string;
}

const tools: ToolItem[] = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'text', label: 'Text', shortcut: 'T' },
  { id: 'image', label: 'Image', shortcut: 'I' },
  { id: 'contact', label: 'Contact', shortcut: 'C' },
  { id: 'qr', label: 'QR Code', shortcut: 'Q' },
  { id: 'background', label: 'Background', shortcut: 'B' },
  { id: 'template', label: 'Templates', shortcut: 'P' },
];

export const TopToolsToolbar: React.FC = () => {
  const activeTool = useUILayoutStore(selectActiveTool);
  const setActiveTool = useUILayoutStore((state) => state.setActiveTool);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      const tool = tools.find((t) => t.shortcut === key);

      if (tool && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setActiveTool(tool.id);
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        setActiveTool(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  // Keyboard navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!toolbarRef.current) return;

      // Only handle arrow keys when toolbar or a tool is focused
      if (
        !toolbarRef.current.contains(document.activeElement) &&
        document.activeElement !== toolbarRef.current
      ) {
        return;
      }

      const currentIndex = tools.findIndex((t) => t.id === activeTool);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < tools.length - 1) {
            const nextTool = tools[currentIndex + 1];
            setActiveTool(nextTool.id);
            toolRefs.current.get(nextTool.id)?.focus();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            const prevTool = tools[currentIndex - 1];
            setActiveTool(prevTool.id);
            toolRefs.current.get(prevTool.id)?.focus();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (document.activeElement instanceof HTMLButtonElement) {
            document.activeElement.click();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setActiveTool]);

  const handleToolClick = (toolId: Tool) => {
    // Toggle tool - clicking again deselects
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  return (
    <div
      ref={toolbarRef}
      className="border-b border-gray-200 bg-white flex-shrink-0"
      role="toolbar"
      aria-label="Drawing tools"
    >
      <div className="flex h-12 items-center gap-1 px-4">
        {/* Tool buttons */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                ref={(el) => {
                  if (el) toolRefs.current.set(tool.id, el);
                }}
                onClick={() => handleToolClick(tool.id)}
                className={cn(
                  'group relative px-4 py-2 rounded-lg transition-all text-sm font-medium',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  !isActive && 'text-gray-700 hover:text-gray-900'
                )}
                aria-label={`${tool.label} tool${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                aria-pressed={isActive}
                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
              >
                <span>{tool.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 h-0.5 w-full max-w-[80%] -translate-x-1/2 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};