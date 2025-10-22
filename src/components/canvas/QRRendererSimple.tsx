/**
 * Simple QR Renderer Component
 * Renders QR codes using the new simplified configuration
 */

import { useEffect, useState } from 'react';
import { Group, Image as KonvaImage } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { QRLayer } from '../../types/index';
import { DEFAULT_SIMPLE_QR_CONFIG } from '../../types/qr';
import { generateSimpleQRSVG, svgToDataURL } from '../../lib/simpleQRGenerator';

interface QRRendererSimpleProps {
  layer: QRLayer;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  id: string;
}

export function QRRendererSimple({
  layer,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  id,
}: QRRendererSimpleProps) {
  const { position, rotation, opacity, locked } = layer;
  const [qrImage, setQrImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Get config (use simpleConfig or defaults)
  const config = layer.simpleConfig || DEFAULT_SIMPLE_QR_CONFIG;

  // Generate QR code image
  useEffect(() => {
    if (!config.data) {
      setQrImage(null);
      return;
    }

    const generateQR = async () => {
      try {
        // Generate SVG
        const { svgString, dimensions: dims } = generateSimpleQRSVG(config);

        // Convert to data URL
        const dataURL = svgToDataURL(svgString);

        // Create image
        const img = new window.Image();
        img.onload = () => {
          setQrImage(img);
          setDimensions(dims);
        };
        img.onerror = () => {
          console.error('Failed to load QR code image');
          setQrImage(null);
        };
        img.src = dataURL;
      } catch (error) {
        console.error('QR Code generation error:', error);
        setQrImage(null);
      }
    };

    generateQR();
  }, [config]);

  if (!qrImage) {
    // Render placeholder while loading or if error
    return null;
  }

  return (
    <Group
      id={id}
      name="qr-layer"
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
      <KonvaImage
        image={qrImage}
        width={dimensions.width}
        height={dimensions.height}
      />
    </Group>
  );
}
