/**
 * ImageRenderer Component
 * Renders uploaded image layers with object-fit support
 */

import { useEffect, useState } from 'react'
import { Group, Image as KonvaImage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { ImageLayer } from '../../types/index'

interface ImageRendererProps {
  layer: ImageLayer
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  id: string
}

export function ImageRenderer({
  layer,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  id,
}: ImageRendererProps) {
  const {
    position,
    rotation,
    opacity,
    src,
    objectFit,
    width,
    height,
    naturalSize,
    locked,
  } = layer

  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Load image
  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      setImage(img)
    }

    img.onerror = () => {
      console.error('Failed to load image:', src)
      setImage(null)
    }

    img.src = src
  }, [src])

  if (!image) {
    // Render placeholder while loading
    return null
  }

  // Use layer's defined dimensions, fallback to natural size
  const targetWidth = width || naturalSize?.w || 200
  const targetHeight = height || naturalSize?.h || 200

  // Get the natural dimensions of the loaded image
  const imageNaturalWidth = image.naturalWidth || image.width
  const imageNaturalHeight = image.naturalHeight || image.height

  let renderWidth = targetWidth
  let renderHeight = targetHeight
  let cropX = 0
  let cropY = 0
  let cropWidth = imageNaturalWidth
  let cropHeight = imageNaturalHeight

  if (objectFit === 'cover') {
    // Calculate scale to cover the entire area
    const scaleX = targetWidth / imageNaturalWidth
    const scaleY = targetHeight / imageNaturalHeight
    const scale = Math.max(scaleX, scaleY)

    // Calculate crop dimensions (portion of original image to show)
    cropWidth = targetWidth / scale
    cropHeight = targetHeight / scale

    // Center the crop
    cropX = (imageNaturalWidth - cropWidth) / 2
    cropY = (imageNaturalHeight - cropHeight) / 2
  } else if (objectFit === 'contain') {
    // Calculate scale to fit within the area while maintaining aspect ratio
    const scaleX = targetWidth / imageNaturalWidth
    const scaleY = targetHeight / imageNaturalHeight
    const scale = Math.min(scaleX, scaleY)

    // Calculate render dimensions to fit within target bounds
    renderWidth = imageNaturalWidth * scale
    renderHeight = imageNaturalHeight * scale
  }

  return (
    <Group
      id={id}
      name="image-layer"
      x={position.x}
      y={position.y}
      rotation={rotation}
      opacity={opacity}
      draggable={!locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      width={targetWidth}
      height={targetHeight}
    >
      <KonvaImage
        image={image}
        x={objectFit === 'contain' ? (targetWidth - renderWidth) / 2 : 0}
        y={objectFit === 'contain' ? (targetHeight - renderHeight) / 2 : 0}
        width={renderWidth}
        height={renderHeight}
        crop={
          objectFit === 'cover'
            ? {
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight,
              }
            : undefined
        }
      />
    </Group>
  )
}
