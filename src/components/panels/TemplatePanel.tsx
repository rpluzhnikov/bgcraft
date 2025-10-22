import { Loader2 } from 'lucide-react';

export const TemplatePanel = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Under Development
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Template gallery is coming soon. Stay tuned for pre-designed layouts and styles!
          </p>
        </div>
      </div>
    </div>
  );
};
