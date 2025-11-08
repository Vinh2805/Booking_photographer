import { Switch } from "../../ui/switch";
import { Badge } from "../../ui/badge";
import { SYSTEM_INFO } from "../constants/adminSettingsData";

interface SystemSettingsProps {
  systemSettings: {
    maintenanceMode: boolean;
    autoBackup: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  onSystemSettingChange: (key: string, value: boolean) => void;
}

export function SystemSettings({
  systemSettings,
  onSystemSettingChange,
}: SystemSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Chế độ bảo trì</p>
          <p className="text-sm text-gray-600">Tạm dừng hệ thống để bảo trì</p>
        </div>
        <Switch
          checked={systemSettings.maintenanceMode}
          onCheckedChange={(checked: boolean) =>
            onSystemSettingChange("maintenanceMode", checked)
          }
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Sao lưu tự động</p>
          <p className="text-sm text-gray-600">
            Tự động sao lưu dữ liệu hàng ngày
          </p>
        </div>
        <Switch
          checked={systemSettings.autoBackup}
          onCheckedChange={(checked: boolean) =>
            onSystemSettingChange("autoBackup", checked)
          }
        />
      </div>

      <div className="space-y-3 pt-4 border-t">
        <h4 className="font-medium">Thông tin phiên bản</h4>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phiên bản:</span>
            <span className="font-medium">{SYSTEM_INFO.version}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cập nhật:</span>
            <span className="font-medium">{SYSTEM_INFO.lastUpdate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Trạng thái:</span>
            <Badge className="bg-green-100 text-green-800">
              {SYSTEM_INFO.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
