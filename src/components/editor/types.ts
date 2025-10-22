export type ToolId =
  | 'select'
  | 'text'
  | 'image'
  | 'contact'
  | 'qr'
  | 'background'
  | 'template';

export interface Tool {
  id: ToolId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}

export interface EditorLayoutMode {
  mode: 'desktop' | 'tablet' | 'mobile';
  sidebarCollapsed: boolean;
  showFloatingToolbar: boolean;
}