/**
 * Layers Component
 * Renders all layers with appropriate renderer based on type
 */

import { Layer as KonvaLayer } from 'react-konva'
import { useEditorStore } from '../../state/editorStore'
import { BackgroundRenderer } from './BackgroundRenderer'
import { TextRenderer } from './TextRenderer'
import { ContactRenderer } from './ContactRenderer'
import { QRRendererSimple } from './QRRendererSimple'
import { ImageRenderer } from './ImageRenderer'
import { handleDragEnd, handleTransformEnd } from './transforms'

export function Layers() {
  const layers = useEditorStore((state) => state.project.layers)
  const selectedId = useEditorStore((state) => state.project.selectedId)
  const selectLayer = useEditorStore((state) => state.selectLayer)
  const updateLayer = useEditorStore((state) => state.updateLayer)

  return (
    <KonvaLayer name="content-layer">
      {layers.map((layer) => {
        // Skip invisible layers
        if (layer.visible === false) {
          return null
        }

        const isSelected = layer.id === selectedId

        // Common handlers
        const onSelect = () => {
          if (!layer.locked) {
            selectLayer(layer.id)
          }
        }

        const onDragEnd = (e: any) => {
          handleDragEnd(e, {
            layer,
            allLayers: layers,
            updateLayer,
            enableSnapping: true,
          })
        }

        const onTransformEnd = (e: any) => {
          handleTransformEnd(e, {
            layer,
            updateLayer,
          })
        }

        // Render based on layer type
        switch (layer.type) {
          case 'background':
            return (
              <BackgroundRenderer
                key={layer.id}
                layer={layer}
              />
            )

          case 'text':
            return (
              <TextRenderer
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onSelect={onSelect}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
                id={layer.id}
              />
            )

          case 'contact':
            return (
              <ContactRenderer
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onSelect={onSelect}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
                id={layer.id}
              />
            )

          case 'qr':
            return (
              <QRRendererSimple
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onSelect={onSelect}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
                id={layer.id}
              />
            )

          case 'image':
            return (
              <ImageRenderer
                key={layer.id}
                layer={layer}
                isSelected={isSelected}
                onSelect={onSelect}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
                id={layer.id}
              />
            )

          default:
            return null
        }
      })}
    </KonvaLayer>
  )
}
