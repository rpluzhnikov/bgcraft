import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { exportStageToPNG, exportStageToJPEG } from '../../lib/export';
import Konva from 'konva';
import { useEditorStore } from '../../state/editorStore';
import { useUILayoutStore } from '../../state/uiLayoutStore';

interface ExportModalProps {
  stageRef: React.RefObject<Konva.Stage>;
  onClose: () => void;
}

type ExportFormat = 'png' | 'jpeg';

export const ExportModal: React.FC<ExportModalProps> = ({ stageRef, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90); // JPEG quality
  const [isExporting, setIsExporting] = useState(false);

  const clearSelection = useEditorStore((state) => state.clearSelection);
  const selectLayer = useEditorStore((state) => state.selectLayer);
  const selectedId = useEditorStore((state) => state.project.selectedId);

  const showGrid = useUILayoutStore((state) => state.showGrid);
  const showSafeZone = useUILayoutStore((state) => state.showSafeZone);
  const showCenterLines = useUILayoutStore((state) => state.showCenterLines);
  const setShowGrid = useUILayoutStore((state) => state.setShowGrid);
  const setShowSafeZone = useUILayoutStore((state) => state.setShowSafeZone);
  const setShowCenterLines = useUILayoutStore((state) => state.setShowCenterLines);

  const handleExport = async () => {
    if (!stageRef.current) return;

    setIsExporting(true);
    try {
      const stage = stageRef.current;

      // Store original state
      const originalSelectedId = selectedId;
      const originalShowGrid = showGrid;
      const originalShowSafeZone = showSafeZone;
      const originalShowCenterLines = showCenterLines;

      // Clear selection and hide all guides
      clearSelection();
      setShowGrid(false);
      setShowSafeZone(false);
      setShowCenterLines(false);

      // Force redraw to apply visibility changes
      stage.batchDraw();

      // Small delay to ensure render completes
      await new Promise(resolve => setTimeout(resolve, 100));

      let dataUrl: string;

      if (format === 'png') {
        dataUrl = await exportStageToPNG(stage, '1x');
      } else {
        dataUrl = await exportStageToJPEG(stage, '1x', quality / 100);
      }

      // Restore original state
      setShowGrid(originalShowGrid);
      setShowSafeZone(originalShowSafeZone);
      setShowCenterLines(originalShowCenterLines);
      if (originalSelectedId) {
        selectLayer(originalSelectedId);
      }
      stage.batchDraw();

      // Create download link
      const link = document.createElement('a');
      link.download = `linkedin-cover-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      // Close modal after successful export
      setTimeout(onClose, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold">Export Image</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          {/* Support Section */}
          <div className="px-6 pb-4 space-y-3">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                This project runs purely on enthusiasm and caffeine.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                One cup = one more late-night commit ☕💻
              </p>
            </div>
            <div className="flex justify-center">
              <a
                href="https://www.buymeacoffee.com/rpluzhnikov"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png"
                  alt="Buy Me A Coffee"
                  style={{ height: '60px', width: '217px' }}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Format selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={cn(
                  'px-4 py-3 rounded-lg border-2 transition-all',
                  format === 'png'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="font-medium">PNG</div>
                <div className="text-xs text-gray-500 mt-1">
                  Transparent background
                </div>
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={cn(
                  'px-4 py-3 rounded-lg border-2 transition-all',
                  format === 'jpeg'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="font-medium">JPEG</div>
                <div className="text-xs text-gray-500 mt-1">
                  Smaller file size
                </div>
              </button>
            </div>
          </div>

          {/* JPEG Quality */}
          {format === 'jpeg' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower quality</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2',
              isExporting && 'opacity-75 cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};