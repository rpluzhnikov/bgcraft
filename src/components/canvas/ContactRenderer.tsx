/**
 * ContactRenderer Component
 * Renders contact chip layers with platform icons and various styles
 */

import { Group, Path, Text, Rect, Circle, Image as KonvaImage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { ContactLayer } from '../../types/index'
import { useState, useEffect } from 'react'

// Import icon assets
import githubIcon from '../../assets/icons/github.svg'
import telegramIcon from '../../assets/icons/telegram.svg'
import emailIcon from '../../assets/icons/email.svg'
import websiteIcon from '../../assets/icons/website.svg'
import phoneIcon from '../../assets/icons/phone.svg'
import linkIcon from '../../assets/icons/link.svg'
import linkedinIcon from '../../assets/icons/linkedin.svg'

interface ContactRendererProps {
  layer: ContactLayer
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: KonvaEventObject<Event>) => void
  id: string
}

// Platform icon SVG paths (for future use with proper SVG rendering)
// Currently using simplified geometric shapes in renderIcon function
// Kept for reference and potential future enhancement

export function ContactRenderer({
  layer,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  id,
}: ContactRendererProps) {
  const {
    position,
    rotation,
    opacity,
    platform,
    label,
    style,
    gap,
    size,
    color,
    locked,
  } = layer

  // Calculate dimensions based on text
  const iconSize = size
  const textWidth = label.length * (size * 0.5) + gap * 2
  const totalWidth = iconSize + gap + textWidth
  const height = iconSize + 16

  // Color variants based on style
  const backgroundColor = style === 'solid' ? color : 'transparent'
  const borderColor = style === 'outline' ? color : 'transparent'
  const iconColor = color  // Always use the actual color for icon backgrounds
  const textColor = style === 'solid' ? '#ffffff' : color

  return (
    <Group
      id={id}
      name="contact-layer"
      x={position.x}
      y={position.y}
      rotation={rotation}
      opacity={opacity}
      draggable={!locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {/* Background container */}
      {style !== 'minimal' && (
        <Rect
          x={0}
          y={0}
          width={totalWidth}
          height={height}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={style === 'outline' ? 2 : 0}
          cornerRadius={height / 2}
        />
      )}

      {/* Icon background circle (for solid style) */}
      {style === 'solid' && (
        <Circle
          x={height / 2}
          y={height / 2}
          radius={iconSize / 2 + 2}
          fill="rgba(255, 255, 255, 0.2)"
        />
      )}

      {/* Icon - using simplified representation */}
      <Group
        x={8}
        y={8}
      >
        {renderIcon(platform, iconSize, iconColor, layer.customIcon)}
      </Group>

      {/* Label text */}
      <Text
        x={height / 2 + iconSize / 2 + gap}
        y={0}
        width={textWidth - gap}
        height={height}
        text={label}
        fontSize={size * 0.7}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
        fill={textColor}
        align="left"
        verticalAlign="middle"
      />
    </Group>
  )
}

/**
 * Render platform icon using actual SVG images
 */
function renderIcon(
  platform: ContactLayer['platform'],
  size: number,
  color: string,
  customIcon?: string
) {
  // For custom platform with uploaded icon
  if (platform === 'custom' && customIcon) {
    return <CustomIconImage src={customIcon} size={size} />
  }

  // Map platform to icon source
  const iconSources: Record<ContactLayer['platform'], string> = {
    github: githubIcon,
    telegram: telegramIcon,
    email: emailIcon,
    website: websiteIcon,
    phone: phoneIcon,
    custom: linkIcon,
    linkedin: linkedinIcon,
  }

  const iconSrc = iconSources[platform] || linkIcon

  return (
    <Group>
      {/* Background circle */}
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        fill={color}
      />
      {/* Icon image */}
      <IconImage
        src={iconSrc}
        size={size * 0.6}
        x={size * 0.2}
        y={size * 0.2}
      />
    </Group>
  )
}

/**
 * Icon image component for SVG icons
 */
function IconImage({ src, size, x, y }: { src: string; size: number; x: number; y: number }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => {
      setImage(img)
    }
  }, [src])

  if (!image) return null

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={size}
      height={size}
    />
  )
}

/**
 * Custom icon image component
 */
function CustomIconImage({ src, size }: { src: string; size: number }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => {
      setImage(img)
    }
  }, [src])

  if (!image) {
    return (
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        fill="#6b7280"
      />
    )
  }

  return (
    <Group>
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        fill="white"
      />
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={size}
        height={size}
        cornerRadius={size / 2}
      />
    </Group>
  )
}
