/**
 * Stage Component
 * Main Konva Stage container with keyboard handlers and transformer
 */

import { useRef, useEffect, forwardRef, useState } from 'react'
import { Stage as KonvaStage, Layer as KonvaLayer, Transformer } from 'react-konva'
import Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../state/constants'
import { Layers } from './Layers'
import { Guides } from './Guides'
import { configureTransformer } from './transforms'
import { calculateAlignmentGuides } from '../../lib/geometry'

interface StageProps {
  showGrid?: boolean
  showSafeZone?: boolean
  showCenterLines?: boolean
  className?: string
  onScaleChange?: (scale: number) => void
  controlledScale?: number
}

export const Stage = forwardRef<Konva.Stage, StageProps>(
  ({ showGrid, showSafeZone, showCenterLines, className, onScaleChange, controlledScale }, ref) => {
    const stageRef = useRef<Konva.Stage>(null)
    const transformerRef = useRef<Konva.Transformer>(null)
    const [alignmentGuides, setAlignmentGuides] = useState<any[]>([])
    const [stageScale, setStageScale] = useState(1)

    // Handle controlled scale changes
    useEffect(() => {
      if (controlledScale !== undefined && controlledScale !== stageScale) {
        setStageScale(controlledScale)
      }
    }, [controlledScale, stageScale])

    const selectedLayer = useEditorStore(selectSelectedLayer)
    const layers = useEditorStore((state) => state.project.layers)
    const deleteLayer = useEditorStore((state) => state.deleteLayer)
    const clearSelection = useEditorStore((state) => state.clearSelection)
    const updateLayer = useEditorStore((state) => state.updateLayer)
    const undo = useEditorStore((state) => state.undo)
    const redo = useEditorStore((state) => state.redo)
    const canUndo = useEditorStore((state) => state.canUndo())
    const canRedo = useEditorStore((state) => state.canRedo())

    // Expose stage ref
    useEffect(() => {
      if (ref && stageRef.current) {
        if (typeof ref === 'function') {
          ref(stageRef.current)
        } else {
          ref.current = stageRef.current
        }
      }
    }, [ref])

    // Make canvas background transparent
    useEffect(() => {
      if (stageRef.current) {
        const canvas = stageRef.current.container().querySelector('canvas')
        if (canvas) {
          canvas.style.backgroundColor = 'transparent'
        }
      }
    }, [])

    // Update transformer when selection changes
    useEffect(() => {
      const transformer = transformerRef.current
      const stage = stageRef.current

      if (!transformer || !stage) return

      if (selectedLayer && selectedLayer.type !== 'background') {
        // Find the node for the selected layer
        const node = stage.findOne(`#${selectedLayer.id}`)

        if (node) {
          configureTransformer(transformer, node, selectedLayer)
          transformer.show()
          transformer.moveToTop()
        } else {
          transformer.nodes([])
          transformer.hide()
        }
      } else {
        transformer.nodes([])
        transformer.hide()
      }

      stage.batchDraw()
    }, [selectedLayer])

    // Calculate alignment guides when dragging
    useEffect(() => {
      if (!selectedLayer || selectedLayer.type === 'background') {
        setAlignmentGuides([])
        return
      }

      const guides = calculateAlignmentGuides(
        selectedLayer,
        layers.filter((l) => l.id !== selectedLayer.id),
        { w: CANVAS_WIDTH, h: CANVAS_HEIGHT }
      )

      setAlignmentGuides(guides)
    }, [selectedLayer, layers])

    // Keyboard event handlers
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if typing in input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return
        }

        // Delete key
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayer) {
          if (selectedLayer.type !== 'background' && !selectedLayer.locked) {
            e.preventDefault()
            deleteLayer(selectedLayer.id)
          }
        }

        // Escape - clear selection
        if (e.key === 'Escape') {
          e.preventDefault()
          clearSelection()
        }

        // Arrow keys - move selected layer
        if (selectedLayer && !selectedLayer.locked) {
          const step = e.shiftKey ? 10 : 1

          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault()
              updateLayer(selectedLayer.id, {
                position: {
                  x: selectedLayer.position.x - step,
                  y: selectedLayer.position.y,
                },
              })
              break
            case 'ArrowRight':
              e.preventDefault()
              updateLayer(selectedLayer.id, {
                position: {
                  x: selectedLayer.position.x + step,
                  y: selectedLayer.position.y,
                },
              })
              break
            case 'ArrowUp':
              e.preventDefault()
              updateLayer(selectedLayer.id, {
                position: {
                  x: selectedLayer.position.x,
                  y: selectedLayer.position.y - step,
                },
              })
              break
            case 'ArrowDown':
              e.preventDefault()
              updateLayer(selectedLayer.id, {
                position: {
                  x: selectedLayer.position.x,
                  y: selectedLayer.position.y + step,
                },
              })
              break
          }
        }

        // Undo/Redo
        if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          if (canUndo) {
            undo()
          }
        }

        if (
          (e.metaKey || e.ctrlKey) &&
          (e.key === 'y' || (e.key === 'z' && e.shiftKey))
        ) {
          e.preventDefault()
          if (canRedo) {
            redo()
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [
      selectedLayer,
      deleteLayer,
      clearSelection,
      updateLayer,
      undo,
      redo,
      canUndo,
      canRedo,
    ])

    // Handle stage click to deselect
    const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
      // Deselect when clicking on empty area
      if (e.target === e.target.getStage()) {
        clearSelection()
      }
    }

    // Handle scroll wheel zoom
    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()

      const scaleBy = 1.1
      const oldScale = stageScale

      // Determine zoom direction
      const direction = e.evt.deltaY > 0 ? -1 : 1
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Limit zoom levels (min: 25%, max: 400%)
      const limitedScale = Math.min(Math.max(newScale, 0.25), 4)

      setStageScale(limitedScale)

      // Notify parent of scale change
      if (onScaleChange) {
        onScaleChange(limitedScale)
      }
    }

    return (
      <div
        className={className}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          display: 'inline-block',
          padding: 0,
          margin: 0,
          boxSizing: 'content-box',
          overflow: 'hidden',
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
          backgroundColor: 'transparent'
        }}
      >
        <KonvaStage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onWheel={handleWheel}
          draggable={false}
        >
          {/* Main content layers */}
          <Layers />

          {/* Transformer layer */}
          <KonvaLayer name="transformer-layer">
            <Transformer ref={transformerRef} />
          </KonvaLayer>

          {/* Guides overlay */}
          <Guides
            showGrid={showGrid}
            showSafeZone={showSafeZone}
            showCenterLines={showCenterLines}
            alignmentGuides={alignmentGuides}
          />
        </KonvaStage>
      </div>
    )
  }
)

Stage.displayName = 'Stage'
