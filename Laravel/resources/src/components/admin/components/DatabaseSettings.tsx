import { Button } from "../../ui/button";
import { Download, Upload, Eye, Trash2 } from "lucide-react";
import { BACKUP_HISTORY } from "../constants/adminSettingsData";

export function DatabaseSettings() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Download className="w-4 h-4" />
          <span className="text-xs">Sao lưu</span>
        </Button>
        <Button variant="outline" className="h-12 flex-col gap-1">
          <Upload className="w-4 h-4" />
          <span className="text-xs">Khôi phục</span>
        </Button>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-1">Lần sao lưu cuối</h4>
        <p className="text-sm text-blue-700">15/01/2025 - 02:00 AM</p>
        <p className="text-sm text-blue-700">Kích thước: 1.2 GB</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Lịch sử sao lưu</h4>
        {BACKUP_HISTORY.map((date, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span className="text-sm">{date}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Eye className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Download className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
