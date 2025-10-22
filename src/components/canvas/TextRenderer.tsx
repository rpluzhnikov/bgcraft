/**
 * TextRenderer Component
 * Renders text layers with shadow, plate (background box), and transform support
 */

import { useRef, useEffect } from 'react'
import { Group, Text, Rect } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { TextLayer } from '../../types/index'
import { useEditorStore } from '../../state/editorStore'

interface TextRendererProps {
  layer: TextLayer
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  id: string
}

export function TextRenderer({
  layer,
  onSelect,
  onDragEnd,
  onTransformEnd,
  id,
}: TextRendererProps) {
  const {
    text,
    position,
    rotation,
    opacity,
    fontFamily,
    fontSize,
    fontWeight,
    color,
    shadow,
    plate,
    width,
    height,
    locked,
  } = layer

  const textRef = useRef<Konva.Text>(null)
  const groupRef = useRef<Konva.Group>(null)
  const updateLayer = useEditorStore((state) => state.updateLayer)

  // Calculate text dimensions
  const textWidth = width || 200

  // Auto-calculate height based on actual text content
  useEffect(() => {
    const textNode = textRef.current
    const groupNode = groupRef.current

    if (textNode && groupNode) {
      // Get the actual rendered height of the text
      const actualHeight = textNode.height()

      // Set the group's size to match the text dimensions
      // This allows the transformer to properly show resize handles
      groupNode.size({
        width: textWidth,
        height: actualHeight,
      })

      // Update the layer height in the store if it changed significantly
      // (avoid tiny updates that cause re-renders)
      if (Math.abs((height || 0) - actualHeight) > 1) {
        updateLayer(layer.id, { height: actualHeight })
      }
    }
  }, [text, textWidth, fontSize, fontFamily, fontWeight, layer.id, height, updateLayer])

  // Use stored height or fallback to calculated minimum
  const displayHeight = height || fontSize * 1.5

  return (
    <Group
      ref={groupRef}
      id={id}
      name="text-layer"
      x={position.x}
      y={position.y}
      rotation={rotation}
      opacity={opacity}
      draggable={!locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      width={textWidth}
      height={displayHeight}
    >
      {/* Plate (background box) */}
      {plate?.enabled && (
        <Rect
          x={-plate.padding}
          y={-plate.padding}
          width={textWidth + plate.padding * 2}
          height={displayHeight + plate.padding * 2}
          fill={plate.color}
          opacity={plate.alpha}
          cornerRadius={plate.radius}
        />
      )}

      {/* Text */}
      <Text
        ref={textRef}
        text={text}
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontStyle={fontWeight === 'bold' ? 'bold' : typeof fontWeight === 'number' ? 'normal' : fontWeight}
        fill={color}
        width={textWidth}
        align="left"
        verticalAlign="top"
        wrap="word"
        ellipsis={false}
        // Shadow
        shadowEnabled={shadow?.enabled || false}
        shadowBlur={shadow?.blur || 0}
        shadowOffsetX={shadow?.offset.x || 0}
        shadowOffsetY={shadow?.offset.y || 0}
        shadowColor={shadow?.color || '#000000'}
        shadowOpacity={shadow?.enabled ? 1 : 0}
      />
    </Group>
  )
}
