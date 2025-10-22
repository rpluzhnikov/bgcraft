# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **frontend-only** LinkedIn Cover Generator - a client-side React application for composing and exporting LinkedIn cover images (1584×396px). The application features a modern, unified UI/UX design with a professional canvas-based editor using Konva.js for real-time rendering and comprehensive QR code capabilities.

**Key characteristics:**
- No backend - all operations are client-side
- Local persistence via localStorage with autosave
- Canvas dimensions: 1584×396 (LinkedIn cover spec)
- Safe-zone overlay: left 240px reserved for avatar
- Responsive design: Desktop, tablet, and mobile optimized
- Modern unified sidebar architecture (Figma/Canva-inspired)
- Advanced QR code generation with multiple libraries
- Comprehensive export options (PNG/JPEG at multiple scales)

## Tech Stack

### Core Framework
- **Framework:** React 18 + TypeScript + Vite
- **State Management:** Zustand with Immer for immutable updates
- **Canvas Rendering:** Konva.js (react-konva) for layered composition
- **Styling:** TailwindCSS + PostCSS

### UI Libraries
- **UI Utilities:** clsx + tailwind-merge for conditional classes
- **Drag & Drop:** @hello-pangea/dnd + @dnd-kit/* for layer reordering
- **Icons:** lucide-react
- **Color Manipulation:** polished

### QR Code Libraries
- **Primary:** qrcode.react
- **Advanced Styling:** qr-code-styling
- **Scanning:** jsqr, zxing-wasm
- **Validation & Utilities:** Custom QR validation system

### Export & Validation
- **Image Export:** Konva's native `toDataURL()` + html-to-image
- **Schema Validation:** zod
- **Testing:** Vitest + React Testing Library

## Common Commands

### Development
```bash
npm dev              # Start dev server on port 5173
npm build            # TypeScript compile + Vite build
npm preview          # Preview production build
```

### Code Quality
```bash
npm lint             # ESLint check (ts,tsx files)
npm format           # Format with Prettier (src/**/*.{ts,tsx,css})
```

### Testing
```bash
npm test             # Run Vitest tests
```

## Architecture

### UI/UX Architecture (Active - 2024 Redesign)

The application uses a modern unified interface with responsive layouts:

#### **Unified Sidebar System** (src/components/editor/)
- `UnifiedSidebar.tsx` - Main container (336px total width)
  - Combines 48px ToolRail + 288px ContextPanel
  - Keyboard shortcut handling (V, T, I, C, Q, B, P)
  - Auto-switches to select tool when layer selected

- `ToolRail.tsx` - 48px vertical tool selection bar
  - 7 tools: Select, Text, Image, Contacts, QR, Background, Templates
  - Active tool highlighted with blue-600
  - Tooltips display keyboard shortcuts

- `ContextPanel.tsx` - 288px collapsible dynamic panel
  - Smart context switching based on activeTool and selectedLayer
  - Shows layer properties when element selected
  - Shows creation panels when tool is active
  - Collapses with smooth animation (overflow-hidden)

#### **Layers Management** (Right Sidebar)
- `RightSidebar.tsx` - 256px panel (collapsible to 48px)
  - Drag-and-drop reordering via @hello-pangea/dnd
  - Displays layers in reverse order (top layer first)
  - Layer icons: T (text), @ (contacts), ◼ (QR), 🎨 (background), 🖼 (image)
  - Inline actions: visibility toggle, lock/unlock, delete
  - Background layer (index 0) protected from deletion/reordering
  - Shows total layer count

#### **Floating Toolbar**
- `FloatingToolbar.tsx` - Desktop-only context menu
  - Appears near selected elements (desktop only)
  - Actions: Duplicate, Align (left/center/right), Move up/down
  - Additional: Visibility toggle, Lock, Delete
  - Auto-hides when no selection

#### **Responsive Layouts**
- `ResponsiveEditor.tsx` - Main adaptive layout controller
  - **Desktop (≥1280px):** Full three-panel layout
  - **Tablet (768-1279px):** Overlay sidebar mode with modal backdrop
  - **Mobile (<768px):**
    - Bottom sheet panels
    - Canvas scaled to 75%
    - Simplified header with menu/title/layers buttons
    - Bottom toolbar for primary actions

### State Management (src/state/)

#### **editorStore.ts** - Primary Zustand store
**Project state:**
- layers: Layer[] - All canvas layers
- selectedId: string | null - Currently selected layer
- metadata: name, id, createdAt, updatedAt, canvasSize

**History management:**
- history: ProjectState[] - Undo/redo stack (max 50 states)
- historyIndex: number - Current position in history
- MAX_HISTORY: 50 - Maximum history states

**Core methods:**
- `addLayer(layer)` - Auto-generates ID with nanoid, selects new layer
- `updateLayer(id, updates)` - Applies partial updates, saves history
- `deleteLayer(id)` - Removes layer (skips index 0 - background)
- `duplicateLayer(id)` - Clones with +20px offset, inserts after original
- `reorderLayers(fromIndex, toIndex)` - Drag-drop ordering (protects index 0)
- `selectLayer(id)` - Sets selectedId
- `undo()/redo()` - Navigate history with bounds checking
- `loadProject(project)` - Loads and resets history

**Selectors (exported):**
- `selectProject` - Full project state
- `selectLayers` - All layers array
- `selectSelectedLayerId` - Current selection ID
- `selectSelectedLayer` - Selected layer object

#### **backgroundStore.ts** - Specialized background state
- Separate store for background-specific operations
- Independent undo/redo history
- Handles gradient, pattern, solid, upload modes
- Persists to 'linkedin-cover-gen:background-state'

#### **Constants** (src/state/constants.ts)
```typescript
CANVAS_WIDTH: 1584
CANVAS_HEIGHT: 396
SAFE_ZONE_LEFT: 240 // Avatar area
GRID_SIZE: 8
SNAP_THRESHOLD: 10
MAX_HISTORY: 50
AUTOSAVE_INTERVAL: 5000 // 5 seconds
```

**Font families:** Inter, Arial, Georgia, Times New Roman, Courier New, Verdana, Trebuchet MS, Impact

### Type System (src/types/)

#### Layer Types (Discriminated Union)
All layers extend `LayerBase` with common properties:

**BackgroundLayer**
- mode: 'solid' | 'gradient' | 'pattern' | 'upload'
- solidConfig, gradientConfig, patternConfig for each mode
- filters: blur, brightness, contrast, tint, tintAlpha
- value: string (legacy support)

**TextLayer**
- text, fontFamily, fontSize, fontWeight, color
- shadow: enabled, color, blur, offsetX, offsetY
- plate: enabled, color, opacity, padding
- width, height for text bounds

**ContactLayer**
- platform: 'linkedin' | 'telegram' | 'github' | 'email' | 'website'
- label: Display text
- style: 'solid' | 'outline' | 'minimal'
- gap, size, color configuration

**QRLayer**
- url: Data to encode
- size, foreColor, backColor, quietZone
- config: Advanced QR styling options

**ImageLayer**
- src: Image data URL
- naturalSize: { width, height } - Original dimensions
- objectFit: 'contain' | 'cover'
- width, height: Display dimensions

### Canvas System (src/components/canvas/)

#### **Stage.tsx** - Main canvas controller
- Fixed 1584×396 dimensions
- Exposes ref for export operations
- Keyboard handlers:
  - Delete: Remove selected layer
  - Ctrl/Cmd+D: Duplicate selected
  - Ctrl/Cmd+Z/Y: Undo/redo
  - Ctrl/Cmd+E: Export
- Alignment guide calculation
- Guide visibility controls (grid, safe zone, center lines)

#### **Renderers** - Layer-specific rendering
- `BackgroundRenderer.tsx` - All background modes with filter pipeline
- `TextRenderer.tsx` - Konva.Text with shadow/plate effects
- `ContactRenderer.tsx` - Platform-specific icon chips
- `QRRenderer.tsx` - QR code generation with multiple libraries
- `ImageRenderer.tsx` - Image layers with Transformer controls

### Export System (src/lib/export.ts)

#### Core Export Functions
- `exportStageToPNG(stage, scale)` - PNG export via Konva.toDataURL()
- `exportStageToJPEG(stage, scale, quality)` - JPEG with quality control
- `stripMetadata(dataUrl)` - Canvas redraw for clean output
- `exportAndDownload(stage, options)` - Full export pipeline
- `exportMultipleScales(stage)` - Generate 1x and 2x versions

#### Export Scales
- **1x:** 1584×396 - Standard web display
- **2x:** 3168×792 - Retina/high-DPI displays

#### Utilities
- `formatFileSize(bytes)` - Human-readable size display
- `validateExportOptions(options)` - Input validation
- Error handling with user-friendly messages

### Persistence (src/lib/storage.ts)

LocalStorage with 'linkedin-cover-gen' prefix:

#### Core Functions
- `saveProject(project)` - Save full project JSON
- `loadProject(id)` - Retrieve specific project
- `listProjects()` - Get all project metadata
- `deleteProject(id)` - Remove project
- `clearAllProjects()` - Clear all saved projects

#### Autosave System
- `autosaveProject(project)` - Save to autosave slot
- `loadAutosave()` - Recover autosaved state
- Triggers every 5 seconds (AUTOSAVE_INTERVAL)
- Separate slot from manual saves

#### Import/Export
- `exportProjectAsJSON(project)` - Download as .json file
- `importProjectFromJSON(file)` - Load from .json file

### UI Components Library (src/components/ui/)

#### Core Components
- `Button.tsx` - Primary, ghost, secondary, danger variants
- `Input.tsx`, `Label.tsx` - Form controls
- `Select.tsx`, `Tabs.tsx` - Selection interfaces
- `Toggle.tsx`, `Slider.tsx` - Boolean and range inputs

#### Color System
- `ColorPicker.tsx` - Basic color selection
- `AdvancedColorPicker.tsx` - Full color control
- `ColorSwatches.tsx` - Preset color palettes
- `GradientEditor.tsx` - Gradient creation
- `PatternEditor.tsx` - Pattern configuration

#### QR Utilities
- `QRScannabilityWidget.tsx` - Scan quality indicator
- `ContrastChecker.tsx` - Accessibility validation

### Property Panels (src/components/panels/)

Two versions exist for key panels:

#### Standard Panels
- `BackgroundPanel.tsx` - Basic background controls
- `TextPanel.tsx` - Text layer properties
- `ContactsPanel.tsx` - Contact chip configuration
- `QRPanel.tsx` - Basic QR settings
- `ImagePanel.tsx` - Image layer controls
- `TemplatePanel.tsx` - Template selection
- `ExportPanel.tsx` - Export configuration

#### Enhanced Panels
- `BackgroundPanelEnhanced.tsx` - Advanced gradient/pattern tools
- `QRPanelEnhanced.tsx` - Advanced QR styling options

### Additional Libraries (src/lib/)

#### Advanced Features
- `fillGenerators.ts` - Pattern and gradient generation
- `colorStorage.ts` - Color palette persistence
- `geometry.ts` - Canvas geometry calculations
- `qr/*.ts` - QR validation, error correction, styling

#### Test Coverage
- `src/lib/__tests__/` - Unit tests for utilities

## Keyboard Shortcuts

### Tool Selection
- `V` - Select tool
- `T` - Text tool
- `I` - Image tool
- `C` - Contact tool
- `Q` - QR code tool
- `B` - Background tool
- `P` - Templates panel

### Canvas Controls
- `G` - Toggle grid
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Ctrl/Cmd + E` - Export
- `Ctrl/Cmd + D` - Duplicate layer
- `Delete` - Delete selected layer
- `Ctrl/Cmd + [` - Toggle sidebar (tablet mode)

## Development Guidelines

### Layer Management Rules
1. **Background layer (index 0) is special:**
   - Always exists (created in `createDefaultBackground()`)
   - Cannot be deleted (enforced in `deleteLayer()`)
   - Cannot be reordered (enforced in `reorderLayers()`)
   - Always rendered first

2. **All layer mutations must:**
   - Use Immer's `produce()` for immutability
   - Update `project.updatedAt` timestamp
   - Call `_saveHistory()` after changes (except selection)
   - Validate layer type before operations

3. **Layer ID management:**
   - Generated with `nanoid()` - cryptographically secure
   - Never reuse or manually create IDs
   - IDs persist through undo/redo

### UI Component Patterns

#### Tool Rail Usage
```tsx
<ToolRail
  activeTool={activeTool}
  onToolChange={handleToolChange}
/>
```

#### Context Panel Usage
```tsx
<ContextPanel
  activeTool={activeTool}
  collapsed={collapsed}
  onClose={() => setCollapsed(true)}
/>
```

#### Responsive Hook
```tsx
const { isMobile, isTablet, isDesktop, breakpoint, windowSize } = useResponsive();
// Mobile: width < 768px
// Tablet: 768px ≤ width < 1280px
// Desktop: width ≥ 1280px
```

### Design System

#### Colors
- **Primary Active:** blue-600 (#2563eb)
- **Tool Rail BG:** gray-50 (#f9fafb)
- **Borders:** gray-200 (#e5e7eb)
- **Hover States:** gray-100 (#f3f4f6)
- **Danger:** red-600 (#dc2626)
- **Success:** green-600 (#16a34a)
- **Warning:** yellow-600 (#ca8a04)

#### Spacing
- **Panel Padding:** 16px (p-4)
- **Section Gaps:** 24px (gap-6)
- **Control Gaps:** 8px (gap-2)
- **Tool Rail Width:** 48px (w-12)
- **Context Panel Width:** 288px (w-72)
- **Layers Panel Width:** 256px (w-64)
- **Total Sidebar Width:** 336px (48 + 288)

#### Typography
- **Section Headers:** text-xs uppercase font-bold tracking-wider
- **Labels:** text-sm font-medium
- **Values:** text-sm font-normal
- **Tooltips:** text-xs
- **Button Text:** text-sm font-medium

#### Z-Index Hierarchy
- Canvas: 0
- Floating Toolbar: 10
- Sidebars: 20
- Modals: 30
- Tooltips: 40

## Feature Flags

Located in `src/App.tsx`:
- `USE_NEW_UI` - Enable unified sidebar design (default: true)
- `USE_RESPONSIVE` - Enable responsive layouts (default: true)

When both are `true` (default), the app uses `ResponsiveEditor.tsx`.
Set both to `false` to use the legacy `Editor.tsx` dual-panel interface.

## File Structure

```
src/
├── components/
│   ├── canvas/          # Konva rendering components
│   │   ├── Stage.tsx
│   │   ├── BackgroundRenderer.tsx
│   │   ├── TextRenderer.tsx
│   │   ├── ContactRenderer.tsx
│   │   ├── QRRenderer.tsx
│   │   └── ImageRenderer.tsx
│   ├── editor/          # Unified UI components
│   │   ├── UnifiedSidebar.tsx
│   │   ├── ToolRail.tsx
│   │   ├── ContextPanel.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── FloatingToolbar.tsx
│   │   └── ResponsiveEditor.tsx
│   ├── panels/          # Property panels for each layer type
│   │   ├── BackgroundPanel.tsx
│   │   ├── BackgroundPanelEnhanced.tsx
│   │   ├── TextPanel.tsx
│   │   ├── ContactsPanel.tsx
│   │   ├── QRPanel.tsx
│   │   ├── QRPanelEnhanced.tsx
│   │   ├── ImagePanel.tsx
│   │   ├── TemplatePanel.tsx
│   │   └── ExportPanel.tsx
│   └── ui/              # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── ColorPicker.tsx
│       ├── GradientEditor.tsx
│       └── ... (20+ components)
├── hooks/
│   ├── useResponsive.ts # Responsive breakpoint detection
│   └── useKeyboardShortcuts.ts
├── lib/
│   ├── export.ts        # Canvas export utilities
│   ├── storage.ts       # LocalStorage management
│   ├── utils.ts         # Utility functions (cn)
│   ├── fillGenerators.ts # Pattern/gradient generation
│   ├── colorStorage.ts  # Color palette persistence
│   ├── geometry.ts      # Canvas calculations
│   ├── qr/              # QR code utilities
│   │   ├── validation.ts
│   │   ├── errorCorrection.ts
│   │   └── styling.ts
│   └── __tests__/       # Unit tests
├── pages/
│   ├── Editor.tsx       # Legacy editor layout
│   └── EditorNew.tsx    # Modern unified layout
├── state/
│   ├── editorStore.ts   # Main Zustand store
│   ├── backgroundStore.ts # Background-specific store
│   ├── constants.ts     # App-wide constants
│   ├── palettes.ts      # Color palette definitions
│   └── templates.ts     # Template definitions
├── types/
│   ├── index.ts         # Main type exports
│   ├── fills.ts         # Fill type definitions
│   ├── qr.ts           # QR type definitions
│   └── background.ts    # Background type definitions
└── App.tsx              # Main app with feature flags
```

## Testing Priorities

### Critical Paths
- Canvas renders at exact 1584×396 pixels
- Export produces correct dimensions (1x: 1584×396, 2x: 3168×792)
- Layer CRUD operations maintain state integrity
- Undo/redo preserves full state including selection
- Background layer protection (cannot delete/reorder index 0)
- Autosave triggers every 5 seconds

### UI/UX Testing
- Keyboard shortcuts function in all contexts
- Responsive breakpoints trigger at 768px and 1280px
- Drag-and-drop layer reordering maintains order
- Context panel switches appropriately (tool vs selection)
- Floating toolbar appears only on desktop
- Mobile UI scales canvas to 75% and shows bottom sheets

### Export Testing
- PNG export maintains transparency
- JPEG export respects quality settings
- Metadata stripping works correctly
- File size formatting is accurate
- Multiple scale export generates both resolutions

### State Management
- Zustand subscriptions update UI correctly
- Immer mutations are immutable
- History stack respects MAX_HISTORY limit
- Selectors return correct derived state
- Background store syncs with main store

## Performance Considerations

### Optimization Targets
- Canvas rendering < 16ms for 60fps
- Layer operations < 100ms
- Export generation < 2s for 2x scale
- Autosave < 50ms
- Initial load < 3s

### Memory Management
- Clear unused image data URLs
- Limit history to 50 states
- Lazy load enhanced panels
- Dispose Konva nodes properly
- Clean up event listeners

## Known Patterns & Best Practices

### State Patterns
- **Store selectors** are always exported from store files
- **Immer produce** wraps all mutations
- **History saves** occur after mutations (not selections)
- **Timestamps** update on every project change

### UI Patterns
- **Feature flags** control UI version in App.tsx
- **Responsive hook** provides consistent breakpoint data
- **Context switching** in ContextPanel based on tool/selection
- **Floating positioning** calculated relative to viewport
- **Layer icons** use emoji/letter indicators for visual clarity

### Canvas Patterns
- **Konva refs** are passed down for imperative operations
- **Transform controls** appear only for selected layers
- **Alignment guides** calculate from layer bounds
- **Safe zone** overlay prevents content under avatar

### Export Patterns
- **Data URLs** are generated via Konva's native methods
- **Metadata stripping** uses canvas redraw technique
- **Scale options** provide 1x and 2x for different use cases
- **Download triggers** use temporary anchor elements

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required APIs
- Canvas 2D Context
- LocalStorage
- FileReader API
- Blob API
- URL.createObjectURL

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Format with Prettier
- Use conventional commits

### PR Requirements
- Update CLAUDE.md if changing architecture
- Add tests for new features
- Ensure all tests pass
- Update type definitions
- Document breaking changes

## Version History

### Current Version (2024)
- Unified sidebar architecture
- Responsive design for all devices
- Enhanced QR capabilities
- Advanced background options
- Floating toolbar for desktop

### Legacy Version
- Dual-panel interface
- Desktop-only design
- Basic QR generation
- Simple background options
- Fixed toolbar positions