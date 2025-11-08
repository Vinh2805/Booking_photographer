import { Switch } from '../../ui/switch';
import { handleAiPrivacyChange } from '../utils/adminSettingsUtils';

interface AiPrivacySettingsProps {
  aiSettings: {
    privacyFilter: {
      enabled: boolean;
      phoneRegex: boolean;
      emailRegex: boolean;
      addressRegex: boolean;
    };
  };
  setAiSettings: (fn: (prev: any) => any) => void;
}

export function AiPrivacySettings({ aiSettings, setAiSettings }: AiPrivacySettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Cài đặt AI bảo vệ thông tin</h4>
      
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Bật AI bảo vệ thông tin</p>
          <p className="text-sm text-gray-600">Tự động ẩn SĐT và thông tin cá nhân trong chat</p>
        </div>
        <Switch
          checked={aiSettings.privacyFilter.enabled}
          onCheckedChange={(checked: boolean) => 
            setAiSettings(prev => ({
              ...prev,
              privacyFilter: { ...prev.privacyFilter, enabled: checked }
            }))
          }
        />
      </div>

      <div className="space-y-3 pt-2 border-t">
        <h5 className="font-medium text-sm">Loại thông tin cần ẩn:</h5>
        
        {[
          { key: 'phoneRegex', label: 'Số điện thoại', checked: aiSettings.privacyFilter.phoneRegex },
          { key: 'emailRegex', label: 'Email', checked: aiSettings.privacyFilter.emailRegex },
          { key: 'addressRegex', label: 'Địa chỉ', checked: aiSettings.privacyFilter.addressRegex }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2">
            <span className="text-sm">{item.label}</span>
            <Switch
              checked={item.checked}
              onCheckedChange={(checked: boolean) => handleAiPrivacyChange(item.key, checked, setAiSettings)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}