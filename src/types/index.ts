import type { AnyGradientConfig, AnyPatternConfig } from './fills'
import type { SimpleQRConfig } from './qr'

export type Vec2 = { x: number; y: number }

export type LayerBase = {
  id: string
  type: 'background' | 'text' | 'contact' | 'qr' | 'image'
  position: Vec2
  rotation: number
  opacity: number
  locked?: boolean
  name?: string
  visible?: boolean
}

export type TextLayer = LayerBase & {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number | 'normal' | 'bold'
  color: string
  shadow?: {
    enabled: boolean
    blur: number
    offset: Vec2
    color: string
  }
  plate?: {
    enabled: boolean
    padding: number
    radius: number
    color: string
    alpha: number
  }
  width?: number
  height?: number
}

export type ContactLayer = LayerBase & {
  type: 'contact'
  platform: 'linkedin' | 'telegram' | 'github' | 'email' | 'website' | 'phone' | 'custom'
  label: string
  style: 'solid' | 'outline' | 'minimal'
  gap: number
  size: number
  color: string
  customIcon?: string // Data URL for custom icon image
}

export type QRLayer = LayerBase & {
  type: 'qr'
  // Simplified QR configuration
  simpleConfig?: SimpleQRConfig
}

export type ImageLayer = LayerBase & {
  type: 'image'
  src: string
  naturalSize?: { w: number; h: number }
  objectFit: 'contain' | 'cover'
  width?: number
  height?: number
}

export type BackgroundLayer = LayerBase & {
  type: 'background'
  mode: 'preset' | 'upload' | 'solid' | 'gradient' | 'pattern'
  value: string // Legacy field for backward compatibility
  // Enhanced configurations for different modes
  solidConfig?: {
    color: string
  }
  gradientConfig?: AnyGradientConfig
  patternConfig?: AnyPatternConfig
  filters?: {
    blur: number
    brightness: number
    contrast: number
    tint?: string
    tintAlpha?: number
  }
}

export type Layer =
  | TextLayer
  | ContactLayer
  | QRLayer
  | ImageLayer
  | BackgroundLayer

export type Project = {
  id: string
  name: string
  size: { w: number; h: number }
  layers: Layer[]
  selectedId?: string
  seed?: number
  createdAt: number
  updatedAt: number
}

export type Template = {
  id: string
  name: string
  description?: string
  background: Omit<BackgroundLayer, 'id' | 'position' | 'rotation' | 'opacity'>
  layers: Omit<Layer, 'type'>[]
  palette?: string[]
  fonts?: string[]
}

export type HistoryState = {
  layers: Layer[]
  selectedId?: string
}
