# Canvas Components

This directory contains the Konva canvas components for rendering the LinkedIn cover editor.

## Architecture Overview

The canvas system is built on react-konva and follows a layered architecture:

1. **Stage** - Main container with keyboard handlers and transformer
2. **Layers** - Orchestrates rendering of all layer types
3. **Renderers** - Individual components for each layer type
4. **Guides** - Visual aids for alignment and safe zones
5. **Transforms** - Utilities for drag/transform operations

## Components

### Stage.tsx

Main Konva Stage component that serves as the root container.

**Features:**
- Fixed size 1584x396 (LinkedIn cover dimensions)
- White background
- Keyboard event handlers:
  - Delete/Backspace: Delete selected layer
  - Escape: Clear selection
  - Arrow keys: Move layer (Shift for 10px steps)
  - Cmd/Ctrl+Z: Undo
  - Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y: Redo
- Transformer integration for visual transform handles
- Click on empty area to deselect
- Ref forwarding for export functionality

**Props:**
```typescript
interface StageProps {
  showGrid?: boolean
  showSafeZone?: boolean
  showCenterLines?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { Stage } from './components/canvas'

const stageRef = useRef<Konva.Stage>(null)

<Stage
  ref={stageRef}
  showGrid={true}
  showSafeZone={true}
  className="shadow-lg"
/>
```

### Layers.tsx

Orchestrates rendering of all layers from the editor store.

**Features:**
- Maps over layers array from store
- Renders appropriate renderer component based on layer.type
- Handles layer selection
- Passes drag/transform event handlers
- Respects visibility and locked state
- Skips invisible layers

**Responsibilities:**
- Layer iteration and filtering
- Event handler creation and passing
- Component selection based on type

### BackgroundRenderer.tsx

Renders the background layer with various modes and filters.

**Supported Modes:**
- `solid` - Solid color fill
- `gradient` - Linear gradients (parsed from CSS gradient strings)
- `pattern` - Repeating patterns
- `upload` - User-uploaded images
- `preset` - Pre-configured background styles

**Filters:**
- Blur (canvas filter)
- Brightness adjustment
- Contrast adjustment
- Tint overlay with alpha

**Implementation Notes:**
- Uses canvas-based rendering for gradients and patterns
- CSS gradient string parser for linear-gradient syntax
- Filters applied via pixel manipulation
- Always renders at full canvas size
- Non-interactive (listening: false)

### TextRenderer.tsx

Renders text layers with rich styling options.

**Features:**
- Font family, size, weight, color
- Shadow with blur, offset, and color
- Plate (background box) with padding, radius, and alpha
- Draggable and transformable
- Word wrapping
- Width constraint

**Transform Behavior:**
- Can be resized freely (width/height independent)
- Rotation supported
- Selection handles on 6 anchor points

**Props:**
```typescript
interface TextRendererProps {
  layer: TextLayer
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  id: string
}
```

### ContactRenderer.tsx

Renders contact chip layers with platform icons.

**Supported Platforms:**
- LinkedIn
- GitHub
- Telegram
- Email
- Website

**Styles:**
- `solid` - Filled background with white icon/text
- `outline` - Border only with colored icon/text
- `minimal` - No background, colored icon/text only

**Icon Rendering:**
- Simplified geometric shapes for performance
- Platform-specific designs
- Scalable based on size prop
- Can be replaced with SVG paths or icon fonts

**Transform Behavior:**
- Scaled uniformly (maintains aspect ratio)
- Rotation supported
- Draggable as a single unit

### QRRenderer.tsx

Renders QR code layers using the qrcode library.

**Features:**
- Dynamic QR code generation from URL
- Configurable foreground/background colors
- Quiet zone (margin) support
- Error correction level: M (medium)
- Canvas-based generation with HTMLImage conversion

**Implementation:**
- Uses qrcode library's toCanvas method
- Converts canvas to data URL for Konva Image
- Fallback placeholder on error
- Async generation with loading state

**Transform Behavior:**
- Maintains aspect ratio (square)
- No rotation (typically not needed for QR codes)
- Uniform scaling

### ImageRenderer.tsx

Renders uploaded image layers with object-fit support.

**Object-Fit Modes:**
- `contain` - Scale to fit within bounds, maintain aspect ratio
- `cover` - Scale to fill bounds, crop overflow, maintain aspect ratio

**Features:**
- Cross-origin image loading
- Crop calculation for cover mode
- Centering for contain mode
- Width/height constraints
- Natural size fallback
- Error handling with null render

**Transform Behavior:**
- Can be resized freely (width/height independent)
- Rotation supported
- Full transform anchor set (8 points)

### Guides.tsx

Renders visual guides and overlays.

**Guide Types:**

1. **Grid Overlay**
   - 8px grid spacing
   - Dashed lines (#e5e7eb)
   - Covers entire canvas
   - Toggle via `showGrid` prop

2. **Safe Zone Indicator**
   - Left 240px highlighted (avatar area)
   - Red tinted overlay (rgba(239, 68, 68, 0.1))
   - Dashed border
   - Label: "Avatar Safe Zone"
   - Toggle via `showSafeZone` prop

3. **Center Lines**
   - Vertical and horizontal center lines
   - Blue dashed lines (#3b82f6)
   - Toggle via `showCenterLines` prop

4. **Dynamic Alignment Guides**
   - Purple dashed lines (#8b5cf6)
   - Show when snapping to elements
   - Calculated from `calculateAlignmentGuides` utility

**Props:**
```typescript
interface GuidesProps {
  showGrid?: boolean
  showSafeZone?: boolean
  showCenterLines?: boolean
  alignmentGuides?: AlignmentGuide[]
}
```

### transforms.ts

Utility functions for handling drag and transform events.

**Functions:**

#### handleDragEnd
```typescript
function handleDragEnd(
  e: KonvaEventObject<DragEvent>,
  options: DragEndHandlerOptions
): void
```

Handles drag end with smart snapping:
- Snaps to grid (8px)
- Snaps to canvas center lines
- Snaps to other elements (edges, centers)
- Clamps to canvas bounds
- Updates store with final position

**Priority:** Elements > Center > Grid

#### handleTransformEnd
```typescript
function handleTransformEnd(
  e: KonvaEventObject<Event>,
  options: TransformEndHandlerOptions
): void
```

Handles transform end (scale, rotate):
- For text/images: Updates width/height, resets scale to 1
- For QR codes: Maintains aspect ratio, updates size
- For contact chips: Uniform scaling, updates size
- Updates rotation
- Updates position
- Saves to store

#### configureTransformer
```typescript
function configureTransformer(
  transformer: Konva.Transformer,
  node: Konva.Node,
  layer: Layer
): void
```

Configures transformer based on layer type:
- Text: 6 anchors, rotation enabled, free resize
- QR: 4 corners, no rotation, aspect ratio locked
- Contact: 4 corners, rotation enabled, aspect ratio locked
- Image: 8 anchors, rotation enabled, free resize

**Styling:**
- Border: #2563eb (blue)
- Anchors: Blue fill with white stroke
- Anchor size: 8px
- Corner radius: 2px

## Performance Considerations

1. **Layer Visibility**
   - Invisible layers are skipped entirely
   - No DOM nodes created for hidden layers

2. **Image Loading**
   - Images load asynchronously
   - Null render while loading
   - Error handling prevents crashes

3. **QR Code Generation**
   - Cached in canvas element
   - Only regenerates on prop changes
   - Dynamic import for code splitting

4. **Background Rendering**
   - Complex backgrounds pre-rendered to canvas
   - Canvas converted to image for Konva
   - Filters applied once during generation

5. **Event Handling**
   - Locked layers are non-draggable
   - Background layer has listening: false
   - Click handlers only on interactive elements

## Snapping Behavior

The snapping system provides visual feedback and automatic alignment:

1. **Grid Snapping** (8px)
   - Always active when dragging
   - Lowest priority

2. **Center Line Snapping** (10px threshold)
   - Snaps to canvas center X and Y
   - Medium priority

3. **Element Snapping** (10px threshold)
   - Snaps to edges (left, right, top, bottom)
   - Snaps to centers (horizontal, vertical)
   - Highest priority
   - Shows purple alignment guides

## Export Integration

The Stage component forwards a ref to the Konva.Stage instance for export:

```tsx
const stageRef = useRef<Konva.Stage>(null)

// Export as image
const handleExport = () => {
  if (stageRef.current) {
    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2, // 2x scale for high DPI
    })
    // Use dataUrl for download or sharing
  }
}
```

## State Management

All layer data flows from the Zustand editor store:

```tsx
// Read layers
const layers = useEditorStore((state) => state.project.layers)
const selectedId = useEditorStore((state) => state.project.selectedId)

// Update layer
const updateLayer = useEditorStore((state) => state.updateLayer)
updateLayer(layerId, { position: { x: 100, y: 100 } })

// Delete layer
const deleteLayer = useEditorStore((state) => state.deleteLayer)
deleteLayer(layerId)

// Selection
const selectLayer = useEditorStore((state) => state.selectLayer)
selectLayer(layerId)
```

## Type Safety

All components use TypeScript with strict typing:

- Layer types from `../../types/index`
- Konva event types from `konva/lib/Node`
- Store types from `../../state/editorStore`
- Utility types from `../../lib/geometry`

## Extending

### Adding a New Layer Type

1. Add type to `../../types/index.ts`
2. Create renderer component (e.g., `ShapeRenderer.tsx`)
3. Add case to switch in `Layers.tsx`
4. Add transform configuration in `transforms.ts`
5. Export from `index.ts`

### Adding New Features

1. **New Transform Behavior**: Update `transforms.ts`
2. **New Guide Type**: Add to `Guides.tsx`
3. **New Snapping Rule**: Update `../../lib/geometry.ts`
4. **New Filter**: Add to `BackgroundRenderer.tsx`

## Dependencies

- `react-konva` - React bindings for Konva
- `konva` - Canvas rendering library
- `qrcode` - QR code generation
- Zustand store from `../../state/editorStore`
- Geometry utilities from `../../lib/geometry`
- Type definitions from `../../types/index`

## File Structure

```
canvas/
├── README.md                    # This file
├── index.ts                     # Barrel exports
├── Stage.tsx                    # Main stage container
├── Layers.tsx                   # Layer orchestrator
├── Guides.tsx                   # Visual guides
├── transforms.ts                # Transform utilities
├── BackgroundRenderer.tsx       # Background layer
├── TextRenderer.tsx             # Text layer
├── ContactRenderer.tsx          # Contact chip layer
├── QRRenderer.tsx               # QR code layer
└── ImageRenderer.tsx            # Image layer
```
