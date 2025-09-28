import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";
import {
  handleAiRatingChange,
  handleThresholdChange,
} from "../utils/adminSettingsUtils";

interface AiAlertSettingsProps {
  aiSettings: {
    ratingAlert: {
      enabled: boolean;
      threshold: number;
      alertAdmins: boolean;
      autoNotifyPhotographer: boolean;
    };
  };
  setAiSettings: (fn: (prev: any) => any) => void;
}

export function AiAlertSettings({
  aiSettings,
  setAiSettings,
}: AiAlertSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Cảnh báo AI đánh giá</h4>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Bật cảnh báo tự động</p>
          <p className="text-sm text-gray-600">
            Gửi cảnh báo khi đánh giá nhỏ hơn ngưỡng
          </p>
        </div>
        <Switch
          checked={aiSettings.ratingAlert.enabled}
          onCheckedChange={(checked: boolean) =>
            handleAiRatingChange("enabled", checked, setAiSettings)
          }
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Ngưỡng đánh giá</label>
          <Input
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={aiSettings.ratingAlert.threshold.toString()}
            onChange={(e) =>
              handleThresholdChange(e.target.value, setAiSettings)
            }
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Thông báo Admin</span>
          <Switch
            checked={aiSettings.ratingAlert.alertAdmins}
            onCheckedChange={(checked: boolean) =>
              handleAiRatingChange("alertAdmins", checked, setAiSettings)
            }
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Tự động thông báo nhiếp ảnh gia</span>
          <Switch
            checked={aiSettings.ratingAlert.autoNotifyPhotographer}
            onCheckedChange={(checked: boolean) =>
              handleAiRatingChange(
                "autoNotifyPhotographer",
                checked,
                setAiSettings
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
