import { Switch } from "../../ui/switch";

export function PermissionSettings() {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Quản lý phân quyền</h4>
      <div className="space-y-3">
        {[
          "Xem tất cả booking",
          "Chỉnh sửa thông tin nhiếp ảnh gia",
          "Xử lý thanh toán",
          "Quản lý nội dung",
        ].map((permission, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <span className="text-sm">{permission}</span>
            <Switch defaultChecked={index < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}
