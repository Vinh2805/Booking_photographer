import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Download, FileText, Settings, RefreshCw } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs"
            onClick={() => alert("Xuất báo cáo hệ thống")}
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </Button>
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs"
            onClick={() => alert("Xem logs hệ thống")}
          >
            <FileText className="w-5 h-5" />
            Xem logs
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs"
            onClick={() => alert("Cài đặt nâng cao")}
          >
            <Settings className="w-5 h-5" />
            Cài đặt nâng cao
          </Button>
          <Button
            variant="outline"
            className="h-14 flex-col gap-1 text-xs"
            onClick={() => alert("Làm mới cache")}
          >
            <RefreshCw className="w-5 h-5" />
            Làm mới cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
