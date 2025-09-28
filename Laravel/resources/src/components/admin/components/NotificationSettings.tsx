import { Switch } from "../../ui/switch";

interface NotificationSettingsProps {
  notifications: {
    newBookings: boolean;
    payments: boolean;
    issues: boolean;
    reports: boolean;
  };
  onNotificationChange: (key: string, value: boolean) => void;
}

export function NotificationSettings({
  notifications,
  onNotificationChange,
}: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Booking mới</p>
          <p className="text-sm text-gray-600">Thông báo khi có booking mới</p>
        </div>
        <Switch
          checked={notifications.newBookings}
          onCheckedChange={(checked: boolean) =>
            onNotificationChange("newBookings", checked)
          }
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Thanh toán</p>
          <p className="text-sm text-gray-600">
            Thông báo giao dịch thanh toán
          </p>
        </div>
        <Switch
          checked={notifications.payments}
          onCheckedChange={(checked: boolean) =>
            onNotificationChange("payments", checked)
          }
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Sự cố hệ thống</p>
          <p className="text-sm text-gray-600">Cảnh báo lỗi và sự cố</p>
        </div>
        <Switch
          checked={notifications.issues}
          onCheckedChange={(checked: boolean) =>
            onNotificationChange("issues", checked)
          }
        />
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">Báo cáo</p>
          <p className="text-sm text-gray-600">Báo cáo hàng ngày/tuần</p>
        </div>
        <Switch
          checked={notifications.reports}
          onCheckedChange={(checked: boolean) =>
            onNotificationChange("reports", checked)
          }
        />
      </div>
    </div>
  );
}
