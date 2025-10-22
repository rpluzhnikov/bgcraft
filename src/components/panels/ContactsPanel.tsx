import { useCallback, useRef, ChangeEvent } from 'react';
import { useEditorStore, selectSelectedLayer } from '../../state/editorStore';
import { ContactLayer, Layer } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import { Slider } from '../ui/Slider';
import { UserPlus, Github, Send, Mail, Globe, Phone, Link, Upload } from 'lucide-react';

const PLATFORMS = [
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'custom', label: 'Custom', icon: Link },
] as const;

const STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'minimal', label: 'Minimal' },
] as const;

export const ContactsPanel = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const selectedLayer = useEditorStore(selectSelectedLayer);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const contactLayer = selectedLayer?.type === 'contact' ? (selectedLayer as ContactLayer) : undefined;

  const handleAddContact = useCallback(() => {
    addLayer({
      type: 'contact',
      platform: 'github',
      label: 'github.com/username',
      style: 'solid',
      size: 32,
      gap: 8,
      color: '#333333',
      position: { x: 100, y: 100 },
      rotation: 0,
      opacity: 1,
      name: 'Contact Chip',
      visible: true,
    } as Omit<Layer, 'id'>);
  }, [addLayer]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    if (!contactLayer) return;
    updateLayer(contactLayer.id, { [field]: value });
  }, [contactLayer, updateLayer]);

  const handlePlatformChange = useCallback((platform: ContactLayer['platform']) => {
    if (!contactLayer) return;

    // Set default colors based on platform
    const defaultColors: Record<ContactLayer['platform'], string> = {
      linkedin: '#0077b5',  // Keep for backward compatibility with existing projects
      github: '#333333',
      telegram: '#0088cc',
      email: '#ea4335',
      website: '#3b82f6',
      phone: '#10b981',
      custom: '#6b7280',
    };

    updateLayer(contactLayer.id, {
      platform,
      color: defaultColors[platform],
    });
  }, [contactLayer, updateLayer]);

  const handleIconUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contactLayer) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateLayer(contactLayer.id, { customIcon: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [contactLayer, updateLayer]);

  return (
    <div className="p-5 space-y-6">
      <div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleAddContact}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact Chip
        </Button>
      </div>

      {contactLayer && (
        <>
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
              Contact Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.slice(0, 5).map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = contactLayer.platform === platform.value;

                  return (
                    <button
                      key={platform.value}
                      onClick={() => handlePlatformChange(platform.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {platform.label}
                    </button>
                  );
                })}
              </div>
              {/* Custom button - full width */}
              <button
                onClick={() => handlePlatformChange('custom')}
                className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                  contactLayer.platform === 'custom'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Link className="w-4 h-4" />
                Custom
              </button>
            </div>

            <Input
              label="Label / Username"
              value={contactLayer.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              placeholder="Enter contact info..."
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((style) => {
                  const isSelected = contactLayer.style === style.value;

                  return (
                    <button
                      key={style.value}
                      onClick={() => handleFieldChange('style', style.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ColorPicker
              label="Color"
              value={contactLayer.color}
              onChange={(value) => handleFieldChange('color', value)}
              fullWidth
            />

            {/* Custom icon upload for custom platform */}
            {contactLayer.platform === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Icon
                </label>
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                {contactLayer.customIcon ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <img
                        src={contactLayer.customIcon}
                        alt="Custom icon"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => iconInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Icon
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => iconInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Icon
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
              Layout
            </h3>

            <Slider
              label="Icon Size"
              min={16}
              max={64}
              step={2}
              value={contactLayer.size}
              onChange={(value) => handleFieldChange('size', value)}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />

            <Slider
              label="Gap"
              min={0}
              max={24}
              step={1}
              value={contactLayer.gap}
              onChange={(value) => handleFieldChange('gap', value)}
              valueFormatter={(v) => `${v}px`}
              fullWidth
            />
          </div>
        </>
      )}

      {!contactLayer && (
        <div className="text-center text-sm text-gray-500 py-8">
          Add a contact chip or select an existing one to edit
        </div>
      )}
    </div>
  );
};
