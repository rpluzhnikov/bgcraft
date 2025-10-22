import { useState, useEffect } from 'react';
import { ToolRail } from './ToolRail';
import { ContextPanel } from './ContextPanel';
import { ToolId } from './types';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { cn } from '../../lib/utils';

interface UnifiedSidebarProps {
  className?: string;
}

export const UnifiedSidebar = ({ className }: UnifiedSidebarProps) => {
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [collapsed, setCollapsed] = useState(false);
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const selectLayer = useEditorStore((state) => state.selectLayer);

  // Auto-switch to select tool when a layer is selected
  useEffect(() => {
    if (selectedLayer) {
      setActiveTool('select');
      // Expand the panel to show the selected layer's properties
      setCollapsed(false);
    }
  }, [selectedLayer]);

  // Handle tool changes
  const handleToolChange = (toolId: ToolId) => {
    setActiveTool(toolId);

    // Clear selection when switching to a creation tool
    if (toolId !== 'select' && toolId !== 'background' && toolId !== 'template') {
      selectLayer(undefined);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      switch (key) {
        case 'V':
          setActiveTool('select');
          break;
        case 'T':
          setActiveTool('text');
          break;
        case 'I':
          setActiveTool('image');
          break;
        case 'C':
          setActiveTool('contact');
          break;
        case 'Q':
          setActiveTool('qr');
          break;
        case 'B':
          setActiveTool('background');
          break;
        case 'P':
          setActiveTool('template');
          break;
        case '[':
          // Toggle sidebar collapse with bracket key
          if (e.metaKey || e.ctrlKey) {
            setCollapsed((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <aside className={cn('flex h-full bg-white border-r border-gray-200', className)}>
      <ToolRail activeTool={activeTool} onToolChange={handleToolChange} />
      <ContextPanel
        activeTool={activeTool}
        collapsed={collapsed}
        onClose={() => setCollapsed(true)}
      />
    </aside>
  );
};