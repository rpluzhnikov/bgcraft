/**
 * Guides Component
 * Renders alignment guides, grid overlay, and safe zone indicators
 */

import { Layer, Line, Rect, Group, Text } from 'react-konva'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SAFE_ZONE_LEFT,
  GRID_SIZE,
} from '../../state/constants'
import type { AlignmentGuide } from '../../lib/geometry'

interface GuidesProps {
  showGrid?: boolean
  showSafeZone?: boolean
  showCenterLines?: boolean
  alignmentGuides?: AlignmentGuide[]
}

export function Guides({
  showGrid = false,
  showSafeZone = true,
  showCenterLines = false,
  alignmentGuides = [],
}: GuidesProps) {
  return (
    <Layer listening={false} name="guides-layer">
      {/* Grid Overlay */}
      {showGrid && (
        <Group>
          {/* Vertical grid lines */}
          {Array.from(
            { length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) + 1 },
            (_, i) => (
              <Line
                key={`grid-v-${i}`}
                points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
                stroke="#e5e7eb"
                strokeWidth={0.5}
                dash={[2, 2]}
              />
            )
          )}

          {/* Horizontal grid lines */}
          {Array.from(
            { length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1 },
            (_, i) => (
              <Line
                key={`grid-h-${i}`}
                points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]}
                stroke="#e5e7eb"
                strokeWidth={0.5}
                dash={[2, 2]}
              />
            )
          )}
        </Group>
      )}

      {/* Safe Zone Indicator */}
      {showSafeZone && (
        <Group>
          {/* Left safe zone (avatar area) */}
          <Rect
            x={0}
            y={0}
            width={SAFE_ZONE_LEFT}
            height={CANVAS_HEIGHT}
            fill="rgba(239, 68, 68, 0.1)"
            stroke="#ef4444"
            strokeWidth={1}
            dash={[4, 4]}
          />

          {/* Label */}
          <Rect
            x={8}
            y={8}
            width={120}
            height={24}
            fill="#ef4444"
            cornerRadius={4}
          />
          <Text
            x={8}
            y={8}
            width={120}
            height={24}
            text="Avatar Safe Zone"
            fontSize={11}
            fontFamily="Inter, sans-serif"
            fill="#ffffff"
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}

      {/* Center Lines */}
      {showCenterLines && (
        <Group>
          {/* Vertical center line */}
          <Line
            points={[
              CANVAS_WIDTH / 2,
              0,
              CANVAS_WIDTH / 2,
              CANVAS_HEIGHT,
            ]}
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[4, 4]}
          />

          {/* Horizontal center line */}
          <Line
            points={[
              0,
              CANVAS_HEIGHT / 2,
              CANVAS_WIDTH,
              CANVAS_HEIGHT / 2,
            ]}
            stroke="#3b82f6"
            strokeWidth={1}
            dash={[4, 4]}
          />
        </Group>
      )}

      {/* Dynamic Alignment Guides */}
      {alignmentGuides.map((guide, index) => {
        if (guide.type === 'vertical') {
          return (
            <Line
              key={`guide-${index}`}
              points={[guide.position, 0, guide.position, CANVAS_HEIGHT]}
              stroke="#8b5cf6"
              strokeWidth={1.5}
              dash={[6, 3]}
            />
          )
        } else {
          return (
            <Line
              key={`guide-${index}`}
              points={[0, guide.position, CANVAS_WIDTH, guide.position]}
              stroke="#8b5cf6"
              strokeWidth={1.5}
              dash={[6, 3]}
            />
          )
        }
      })}
    </Layer>
  )
}
