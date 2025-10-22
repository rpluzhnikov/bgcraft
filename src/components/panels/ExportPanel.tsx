import { useCallback, useState, useRef } from 'react';
import type Konva from 'konva';
import { useEditorStore, selectProject } from '../../state/editorStore';
import { exportAndDownload, exportMultipleScales } from '../../lib/export';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Download, Save, FolderOpen, CheckCircle2 } from 'lucide-react';

type ExportScale = '1x' | '2x' | 'both';

const SCALE_OPTIONS = [
  { value: '1x', label: '1x (1584×396)' },
  { value: '2x', label: '2x (3168×792)' },
  { value: 'both', label: 'Both (1x + 2x)' },
];

interface ExportPanelProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export const ExportPanel = ({ stageRef }: ExportPanelProps) => {
  const project = useEditorStore(selectProject);
  const loadProject = useEditorStore((state) => state.loadProject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filename, setFilename] = useState('link-preview');
  const [scale, setScale] = useState<ExportScale>('1x');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);

  // Estimate file size based on canvas dimensions and scale
  const estimatedSize = useCallback((selectedScale: ExportScale) => {
    const baseSize = 250; // KB for 1x (1584×396)
    if (selectedScale === '1x') return baseSize;
    if (selectedScale === '2x') return baseSize * 4; // 4x pixels = ~4x size
    return baseSize * 5; // Both files
  }, []);

  const handleExport = useCallback(async () => {
    if (!stageRef.current) {
      console.error('Stage ref not available');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const stage = stageRef.current;

      // Hide guides during export
      const guidesLayer = stage.findOne((node: any) => node.name() === 'guides-layer');
      const guidesVisible = guidesLayer?.visible();
      if (guidesLayer) {
        guidesLayer.visible(false);
      }

      let totalSize = 0;

      if (scale === 'both') {
        // Export both 1x and 2x
        const results = await exportMultipleScales(stage, ['1x', '2x'], filename);
        results.forEach((result) => {
          if (result.success && result.blob) {
            totalSize += result.blob.size;
          }
        });
      } else {
        // Export single scale
        const result = await exportAndDownload(stage, {
          scale: scale as '1x' | '2x',
          filename: `${filename}.png`,
        });

        if (result.success && result.blob) {
          totalSize = result.blob.size;
        }
      }

      // Restore guides visibility
      if (guidesLayer && guidesVisible !== undefined) {
        guidesLayer.visible(guidesVisible);
      }

      setFileSize(Math.round(totalSize / 1024)); // Convert to KB
      setExportSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [filename, scale, stageRef]);

  const handleSaveProject = useCallback(() => {
    // Convert project to JSON and download
    const projectJson = JSON.stringify(project, null, 2);
    const blob = new Blob([projectJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, [project]);

  const handleLoadProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        loadProject(projectData);
      } catch (error) {
        console.error('Failed to load project:', error);
        alert('Failed to load project. Invalid file format.');
      }
    };
    reader.readAsText(file);
  }, [loadProject]);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Export Image</h3>

        <Input
          label="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="link-preview"
          fullWidth
        />

        <Select
          label="Export Scale"
          options={SCALE_OPTIONS}
          value={scale}
          onChange={(e) => setScale(e.target.value as ExportScale)}
          fullWidth
        />

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Estimated size:</span>
          <span className="font-medium">{estimatedSize(scale)} KB</span>
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleExport}
          disabled={isExporting || !filename.trim()}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export PNG
            </>
          )}
        </Button>

        {exportSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Export successful!
              </p>
              {fileSize && (
                <p className="text-xs text-green-600 mt-0.5">
                  {fileSize} KB exported
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Project Files</h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleSaveProject}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleLoadProject}
            className="hidden"
          />

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load Project
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Save your project as JSON to continue later</p>
          <p>Load a previously saved project file</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Tips</h3>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li>• 1x scale (1584×396) is the standard LinkedIn cover size</li>
          <li>• 2x scale (3168×792) provides better quality for high-DPI displays</li>
          <li>• Export both scales for optimal compatibility</li>
          <li>• PNG format preserves transparency and quality</li>
        </ul>
      </div>
    </div>
  );
};
