import { Switch } from '../../ui/switch';
import { handleFeatureToggle } from '../utils/adminSettingsUtils';

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface FeatureToggleSettingsProps {
  featureFlags: FeatureFlag[];
  setFeatureFlags: (fn: (prev: FeatureFlag[]) => FeatureFlag[]) => void;
}

export function FeatureToggleSettings({ featureFlags, setFeatureFlags }: FeatureToggleSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Bật/Tắt tính năng</h4>
      
      {featureFlags.map((feature) => (
        <div key={feature.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h5 className="font-medium">{feature.name}</h5>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
            <Switch
              checked={feature.enabled}
              onCheckedChange={(checked: boolean) => handleFeatureToggle(feature.id, checked, setFeatureFlags)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}