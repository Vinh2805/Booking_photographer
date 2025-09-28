import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";

export function TermsUISettings() {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Giao diện điều khoản dịch vụ</h4>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Tiêu đề trang</label>
          <Input defaultValue="Điều khoản sử dụng dịch vụ" className="mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium">Màu chủ đạo</label>
          <div className="flex gap-2 mt-1">
            {["#ec4899", "#3b82f6", "#10b981", "#f59e0b"].map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Hiển thị logo</span>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Chế độ tối</span>
          <Switch />
        </div>
      </div>
    </div>
  );
}
