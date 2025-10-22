import { useEffect, useState } from 'react';
import { getContrastRatio, getWCAGLevel } from '../../lib/color';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ContrastCheckerProps {
  foregroundColor: string;
  backgroundColor?: string;
  className?: string;
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({
  foregroundColor,
  backgroundColor = '#FFFFFF', // Default to white background if not provided
  className = '',
}) => {
  const [contrastRatio, setContrastRatio] = useState(1);
  const [wcagLevel, setWcagLevel] = useState({
    AA: false,
    AAA: false,
    AALarge: false,
    AAALarge: false,
  });

  useEffect(() => {
    // Calculate contrast ratio in <20ms requirement
    const startTime = performance.now();

    const ratio = getContrastRatio(foregroundColor, backgroundColor);
    const level = getWCAGLevel(ratio);

    setContrastRatio(ratio);
    setWcagLevel(level);

    // Log performance for verification
    const elapsed = performance.now() - startTime;
    if (elapsed >= 20) {
      console.warn(`Contrast calculation took ${elapsed.toFixed(2)}ms`);
    }
  }, [foregroundColor, backgroundColor]);

  // Determine the overall compliance status
  const getComplianceStatus = () => {
    if (wcagLevel.AAA) return { label: 'AAA', color: 'green', icon: CheckCircle };
    if (wcagLevel.AA) return { label: 'AA', color: 'yellow', icon: AlertCircle };
    return { label: 'Fail', color: 'red', icon: XCircle };
  };

  const status = getComplianceStatus();
  const StatusIcon = status.icon;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main contrast ratio display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs font-medium text-gray-600">Contrast Ratio</p>
          <p className="text-lg font-bold">{contrastRatio.toFixed(2)}:1</p>
        </div>

        {/* Main compliance badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            status.color === 'green'
              ? 'bg-green-100 text-green-800'
              : status.color === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">WCAG {status.label}</span>
        </div>
      </div>

      {/* Detailed compliance levels */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          Compliance Details
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Normal Text */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Normal Text</p>
            <div className="flex gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  wcagLevel.AA
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {wcagLevel.AA ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                AA
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  wcagLevel.AAA
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {wcagLevel.AAA ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                AAA
              </div>
            </div>
          </div>

          {/* Large Text */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Large Text</p>
            <div className="flex gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  wcagLevel.AALarge
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {wcagLevel.AALarge ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                AA
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  wcagLevel.AAALarge
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {wcagLevel.AAALarge ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                AAA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• AA Normal: ≥4.5:1 | AAA Normal: ≥7:1</p>
        <p>• AA Large: ≥3:1 | AAA Large: ≥4.5:1</p>
        <p className="text-xs italic mt-2">
          Testing against {backgroundColor === '#FFFFFF' ? 'white' : 'artboard'} background
        </p>
      </div>
    </div>
  );
};