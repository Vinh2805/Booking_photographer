import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Settings,
  ChevronRight,
  Save,
  LogOut,
  Key,
  Download,
  FileText,
  RotateCcw,
  AlertTriangle,
  Users,
  Database,
  Activity,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Check,
  XCircle,
  Info,
} from "lucide-react";
import {
  ADMIN_SETTING_SECTIONS,
  USER_ROLES,
  FEATURE_FLAGS,
  AI_SETTINGS,
} from "./constants/adminSettingsData";
import { NotificationSettings } from "./components/NotificationSettings";
import { SystemSettings } from "./components/SystemSettings";
import { DatabaseSettings } from "./components/DatabaseSettings";

import { UserRoleSettings } from "./components/UserRoleSettings";
import { PermissionLogs } from "./components/PermissionLogs";
import { AiPrivacySettings } from "./components/AiPrivacySettings";
import { AiAlertSettings } from "./components/AiAlertSettings";
import { FeatureToggleSettings } from "./components/FeatureToggleSettings";
import { TermsUISettings } from "./components/TermsUISettings";
import {
  handleNotificationChange,
  handleSystemSettingChange,
} from "./utils/adminSettingsUtils";

interface AdminSettingsProps {
  onLogout?: () => void;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  ipWhitelist: string[];
  loginAttempts: number;
  securityAlerts: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: "success" | "error" | "warning";
  details: string;
}

interface CacheStats {
  totalSize: string;
  hitRate: number;
  missRate: number;
  keys: number;
  lastCleared: string;
}

export function AdminSettings({ onLogout }: AdminSettingsProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [notifications, setNotifications] = useState({
    newBookings: true,
    payments: true,
    issues: true,
    reports: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
    loginAttempts: 5,
    securityAlerts: true,
  });

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "user_read",
      name: "Xem người dùng",
      description: "Quyền xem thông tin người dùng",
      category: "Người dùng",
      enabled: true,
    },
    {
      id: "user_write",
      name: "Chỉnh sửa người dùng",
      description: "Quyền chỉnh sửa thông tin người dùng",
      category: "Người dùng",
      enabled: true,
    },
    {
      id: "booking_read",
      name: "Xem booking",
      description: "Quyền xem thông tin booking",
      category: "Booking",
      enabled: true,
    },
    {
      id: "booking_write",
      name: "Quản lý booking",
      description: "Quyền quản lý booking",
      category: "Booking",
      enabled: false,
    },
    {
      id: "system_admin",
      name: "Quản trị hệ thống",
      description: "Quyền quản trị toàn bộ hệ thống",
      category: "Hệ thống",
      enabled: false,
    },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      timestamp: "2025-01-14 10:30:25",
      user: "admin@momentia.com",
      action: "Đăng nhập",
      resource: "Admin Panel",
      status: "success",
      details: "Đăng nhập thành công từ IP 192.168.1.100",
    },
    {
      id: "2",
      timestamp: "2025-01-14 10:25:15",
      user: "manager@momentia.com",
      action: "Cập nhật booking",
      resource: "BK001",
      status: "success",
      details: "Cập nhật trạng thái booking thành hoàn thành",
    },
    {
      id: "3",
      timestamp: "2025-01-14 10:20:45",
      user: "admin@momentia.com",
      action: "Tạo người dùng",
      resource: "PHOTO006",
      status: "error",
      details: "Lỗi: Email đã tồn tại trong hệ thống",
    },
    {
      id: "4",
      timestamp: "2025-01-14 10:15:30",
      user: "support@momentia.com",
      action: "Xem báo cáo",
      resource: "Monthly Report",
      status: "success",
      details: "Tải xuống báo cáo tháng 12/2024",
    },
  ]);

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: "2.4 GB",
    hitRate: 89.5,
    missRate: 10.5,
    keys: 15234,
    lastCleared: "2025-01-13 14:30:00",
  });

  const [userRoles, setUserRoles] = useState(USER_ROLES);
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);
  const [aiSettings, setAiSettings] = useState(AI_SETTINGS);

  // Enhanced settings sections with colors
  const enhancedSections = ADMIN_SETTING_SECTIONS.map((section) => {
    switch (section.id) {
      case "notifications":
        return {
          ...section,
          color:
            "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        };
      case "security":
        return {
          ...section,
          color: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
        };
      case "system":
        return {
          ...section,
          color:
            "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        };
      case "database":
        return {
          ...section,
          color:
            "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
        };
      case "user-roles":
        return {
          ...section,
          color:
            "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
        };
      case "permissions":
        return {
          ...section,
          color: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
        };
      case "permission-logs":
        return {
          ...section,
          color:
            "bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400",
        };
      case "ai-privacy":
        return {
          ...section,
          color:
            "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
        };
      case "ai-alerts":
        return {
          ...section,
          color:
            "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400",
        };
      case "feature-toggle":
        return {
          ...section,
          color:
            "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400",
        };
      case "terms-ui":
        return {
          ...section,
          color:
            "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400",
        };
      default:
        return {
          ...section,
          color:
            "bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400",
        };
    }
  });

  // Add new sections (without duplicate security)
  const newSections = [
    {
      id: "export-reports",
      title: "Xuất báo cáo",
      description: "Tạo và tải xuống báo cáo",
      icon: Download,
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    },
    {
      id: "view-logs",
      title: "Xem logs",
      description: "Theo dõi hoạt động hệ thống",
      icon: FileText,
      color:
        "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
    },
    {
      id: "advanced-settings",
      title: "Cài đặt nâng cao",
      description: "Cấu hình chi tiết hệ thống",
      icon: Settings,
      color:
        "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    },
    {
      id: "cache-refresh",
      title: "Làm mới Cache",
      description: "Quản lý bộ nhớ đệm",
      icon: RotateCcw,
      color:
        "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
    },
  ];

  const allSections = [...enhancedSections, ...newSections];

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    setShowDialog(true);
  };

  const handleClearCache = (type: string) => {
    alert(`Đã xóa ${type} cache thành công!`);
    // Update cache stats
    setCacheStats((prev) => ({
      ...prev,
      lastCleared: new Date().toLocaleString("vi-VN"),
      keys: Math.floor(prev.keys * 0.1), // Simulate clearing
    }));
  };

  const handleExportReport = (type: string, format: string) => {
    alert(`Đang xuất báo cáo ${type} định dạng ${format}...`);
  };

  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">
            Xác thực 2 bước
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bảo mật bổ sung cho tài khoản admin
          </p>
        </div>
        <Switch
          checked={securitySettings.twoFactorAuth}
          onCheckedChange={(checked: any) =>
            setSecuritySettings((prev) => ({
              ...prev,
              twoFactorAuth: checked,
            }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Thời gian hết hạn phiên (phút)
        </label>
        <Input
          type="number"
          value={securitySettings.sessionTimeout}
          onChange={(e) =>
            setSecuritySettings((prev) => ({
              ...prev,
              sessionTimeout: parseInt(e.target.value),
            }))
          }
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Chu kỳ đổi mật khẩu (ngày)
        </label>
        <Input
          type="number"
          value={securitySettings.passwordExpiry}
          onChange={(e) =>
            setSecuritySettings((prev) => ({
              ...prev,
              passwordExpiry: parseInt(e.target.value),
            }))
          }
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Số lần đăng nhập sai tối đa
        </label>
        <Input
          type="number"
          value={securitySettings.loginAttempts}
          onChange={(e) =>
            setSecuritySettings((prev) => ({
              ...prev,
              loginAttempts: parseInt(e.target.value),
            }))
          }
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Whitelist IP (mỗi dòng một IP/subnet)
        </label>
        <Textarea
          value={securitySettings.ipWhitelist.join("\n")}
          onChange={(e) =>
            setSecuritySettings((prev) => ({
              ...prev,
              ipWhitelist: e.target.value.split("\n").filter((ip) => ip.trim()),
            }))
          }
          rows={4}
          placeholder="192.168.1.0/24&#10;10.0.0.0/8"
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">
            Cảnh báo bảo mật
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nhận thông báo về các sự kiện bảo mật
          </p>
        </div>
        <Switch
          checked={securitySettings.securityAlerts}
          onCheckedChange={(checked: any) =>
            setSecuritySettings((prev) => ({
              ...prev,
              securityAlerts: checked,
            }))
          }
        />
      </div>
    </div>
  );

  const renderEnhancedPermissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-slate-800 dark:text-slate-100">
          Quản lý phân quyền
        </h4>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Key className="w-4 h-4 mr-2" />
          Tạo quyền mới
        </Button>
      </div>

      <div className="space-y-3">
        {["Người dùng", "Booking", "Hệ thống"].map((category) => (
          <div key={category}>
            <h5 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
              {category}
            </h5>
            <div className="space-y-2 pl-4">
              {permissions
                .filter((p) => p.category === category)
                .map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-100">
                          {permission.name}
                        </p>
                        <Badge
                          variant={permission.enabled ? "default" : "secondary"}
                        >
                          {permission.enabled ? "Bật" : "Tắt"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {permission.description}
                      </p>
                    </div>
                    <Switch
                      checked={permission.enabled}
                      onCheckedChange={(checked: any) => {
                        setPermissions((prev) =>
                          prev.map((p) =>
                            p.id === permission.id
                              ? { ...p, enabled: checked }
                              : p
                          )
                        );
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Thay đổi phân quyền có thể ảnh hưởng đến hoạt động của hệ thống
          </p>
        </div>
      </div>
    </div>
  );

  const renderExportReports = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {[
          {
            type: "Báo cáo người dùng",
            description: "Thống kê khách hàng và nhiếp ảnh gia",
            icon: Users,
            color:
              "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
          },
          {
            type: "Báo cáo booking",
            description: "Dữ liệu đặt lịch và hoàn thành",
            icon: Calendar,
            color:
              "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          },
          {
            type: "Báo cáo tài chính",
            description: "Doanh thu và giao dịch",
            icon: Activity,
            color:
              "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
          },
          {
            type: "Báo cáo hệ thống",
            description: "Hiệu suất và logs",
            icon: Database,
            color:
              "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
          },
        ].map((report, index) => (
          <Card
            key={index}
            className="p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}
              >
                <report.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-800 dark:text-slate-100">
                  {report.type}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {report.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleExportReport(report.type, "PDF")}
              >
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleExportReport(report.type, "Excel")}
              >
                Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleExportReport(report.type, "CSV")}
              >
                CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Báo cáo sẽ được gửi qua email sau khi tạo xong
          </p>
        </div>
      </div>
    </div>
  );

  const renderViewLogs = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm logs..."
            className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Lọc
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    log.status === "success"
                      ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : log.status === "error"
                      ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                      : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                  }
                >
                  {log.status === "success" ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : log.status === "error" ? (
                    <XCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {log.status === "success"
                    ? "Thành công"
                    : log.status === "error"
                    ? "Lỗi"
                    : "Cảnh báo"}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {log.timestamp}
                </span>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {log.user} • {log.action}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Tài nguyên: {log.resource}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {log.details}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Xuất toàn bộ logs
        </Button>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-4">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="storage">Lưu trữ</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Giới hạn kết nối đồng thời
            </label>
            <Input
              type="number"
              defaultValue="1000"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Timeout API (giây)
            </label>
            <Input
              type="number"
              defaultValue="30"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                Nén response
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Giảm băng thông sử dụng
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Rate limit (requests/phút)
            </label>
            <Input
              type="number"
              defaultValue="100"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              API Version
            </label>
            <Select defaultValue="v2">
              <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">API v1 (Legacy)</SelectItem>
                <SelectItem value="v2">API v2 (Current)</SelectItem>
                <SelectItem value="v3">API v3 (Beta)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                API Logs
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ghi log tất cả API calls
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Dung lượng tối đa ảnh (MB)
            </label>
            <Input
              type="number"
              defaultValue="50"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Thời gian lưu trữ backup (ngày)
            </label>
            <Input
              type="number"
              defaultValue="30"
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                Auto cleanup
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tự động xóa file cũ
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCacheRefresh = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {cacheStats.totalSize}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tổng dung lượng
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {cacheStats.hitRate}%
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tỷ lệ hit
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {cacheStats.keys.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Số keys</p>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {cacheStats.missRate}%
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tỷ lệ miss
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleClearCache("application")}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Xóa Application Cache
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleClearCache("session")}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Xóa Session Cache
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleClearCache("database")}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Xóa Database Cache
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleClearCache("all")}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Xóa tất cả Cache
        </Button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Lần xóa cuối:</strong> {cacheStats.lastCleared}
        </p>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "security":
        return renderSecuritySettings();

      case "permissions":
        return renderEnhancedPermissions();

      case "export-reports":
        return renderExportReports();

      case "view-logs":
        return renderViewLogs();

      case "advanced-settings":
        return renderAdvancedSettings();

      case "cache-refresh":
        return renderCacheRefresh();

      case "notifications":
        return (
          <NotificationSettings
            notifications={notifications}
            onNotificationChange={(key, value) =>
              handleNotificationChange(key, value, setNotifications)
            }
          />
        );

      case "system":
        return (
          <SystemSettings
            systemSettings={systemSettings}
            onSystemSettingChange={(key, value) =>
              handleSystemSettingChange(key, value, setSystemSettings)
            }
          />
        );

      case "database":
        return <DatabaseSettings />;

      case "user-roles":
        return (
          <UserRoleSettings
            userRoles={userRoles}
          />
        );

      case "permission-logs":
        return <PermissionLogs />;

      case "ai-privacy":
        return (
          <AiPrivacySettings
            aiSettings={aiSettings}
            setAiSettings={setAiSettings}
          />
        );

      case "ai-alerts":
        return (
          <AiAlertSettings
            aiSettings={aiSettings}
            setAiSettings={setAiSettings}
          />
        );

      case "feature-toggle":
        return (
          <FeatureToggleSettings
            featureFlags={featureFlags}
            setFeatureFlags={setFeatureFlags}
          />
        );

      case "terms-ui":
        return <TermsUISettings />;

      default:
        return (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Chọn một mục cài đặt để xem chi tiết
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Cài đặt hệ thống
        </h1>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-3">
        {allSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              onClick={() => handleSectionClick(section.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {section.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Logout Button */}
      <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700">
        <CardContent className="p-4">
          <Button
            variant="destructive"
            className="w-full h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                alert("Đăng xuất thành công");
              }
            }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-semibold">Đăng xuất</span>
          </Button>
        </CardContent>
      </Card>

      {/* Dialog for Settings Detail */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              {selectedSection && (
                <>
                  {React.createElement(
                    allSections.find((s) => s.id === selectedSection)?.icon ||
                      Settings,
                    { className: "w-5 h-5" }
                  )}
                  {allSections.find((s) => s.id === selectedSection)?.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {selectedSection &&
                allSections.find((s) => s.id === selectedSection)?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">{renderSectionContent()}</div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                alert("Đã lưu cài đặt thành công!");
                setShowDialog(false);
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSettings;
