import {
  Bell,
  ShieldCheck,
  DollarSign,
  Users,
  Mail,
  Database,
  Globe,
  UserCheck,
  Key,
  FileText,
  Bot,
  Settings,
  ToggleLeft,
  ScrollText,
} from "lucide-react";

export interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action?: string;
}

export const ADMIN_SETTING_SECTIONS: SettingItem[] = [
  {
    id: "notifications",
    title: "Thông báo",
    description: "Cài đặt thông báo hệ thống",
    icon: Bell,
    color: "text-blue-600",
    action: "configure",
  },
  {
    id: "security",
    title: "Bảo mật",
    description: "Cài đặt bảo mật và quyền truy cập",
    icon: ShieldCheck,
    color: "text-red-600",
    action: "configure",
  },
  {
    id: "user-roles",
    title: "Vai trò người dùng",
    description: "Tạo và quản lý vai trò người dùng",
    icon: UserCheck,
    color: "text-purple-600",
    action: "configure",
  },
  {
    id: "permissions",
    title: "Phân quyền",
    description: "Xem và chỉnh sửa quyền tài khoản",
    icon: Key,
    color: "text-orange-600",
    action: "configure",
  },
  {
    id: "permission-logs",
    title: "Nhật ký phân quyền",
    description: "Theo dõi lịch sử thay đổi quyền",
    icon: FileText,
    color: "text-indigo-600",
    action: "configure",
  },
  {
    id: "ai-privacy",
    title: "AI bảo vệ thông tin",
    description: "Tự động ẩn SĐT và thông tin cá nhân",
    icon: Bot,
    color: "text-cyan-600",
    action: "configure",
  },
  {
    id: "ai-alerts",
    title: "Cảnh báo AI",
    description: "Gửi cảnh báo khi rate < 4 sao",
    icon: Bot,
    color: "text-red-600",
    action: "configure",
  },
  {
    id: "feature-toggle",
    title: "Bật/Tắt tính năng",
    description: "Điều khiển tính năng và chiến dịch",
    icon: ToggleLeft,
    color: "text-yellow-600",
    action: "configure",
  },
  {
    id: "terms-ui",
    title: "Điều khoản dịch vụ",
    description: "Chỉnh sửa giao diện điều khoản",
    icon: ScrollText,
    color: "text-gray-600",
    action: "configure",
  },
  {
    id: "database",
    title: "Cơ sở dữ liệu",
    description: "Sao lưu và khôi phục dữ liệu",
    icon: Database,
    color: "text-indigo-600",
    action: "configure",
  },
  {
    id: "system",
    title: "Hệ thống",
    description: "Cài đặt chung hệ thống",
    icon: Globe,
    color: "text-gray-600",
    action: "configure",
  },
];

export const BACKUP_HISTORY = [
  "14/01/2025",
  "13/01/2025",
  "12/01/2025",
];

export const SYSTEM_INFO = {
  version: "v2.1.0",
  lastUpdate: "15/01/2025",
  status: "Ổn định",
};

export const USER_ROLES = [
  {
    id: "1",
    name: "Super Admin",
    permissions: ["all"],
    userCount: 2,
  },
  {
    id: "2",
    name: "Content Manager",
    permissions: ["content.read", "content.write"],
    userCount: 5,
  },
  {
    id: "3",
    name: "Support Agent",
    permissions: ["support.read", "support.write"],
    userCount: 12,
  },
  {
    id: "4",
    name: "Photographer Reviewer",
    permissions: ["photographer.review"],
    userCount: 3,
  },
];

export const FEATURE_FLAGS = [
  {
    id: "chat_feature",
    name: "Tính năng chat",
    enabled: true,
    description: "Cho phép chat giữa người dùng",
  },
  {
    id: "booking_auto_confirm",
    name: "Tự động xác nhận booking",
    enabled: false,
    description: "Tự động xác nhận booking không cần duyệt",
  },
  {
    id: "rating_system",
    name: "Hệ thống đánh giá",
    enabled: true,
    description: "Cho phép đánh giá và review",
  },
  {
    id: "promotion_banner",
    name: "Banner khuyến mãi",
    enabled: true,
    description: "Hiển thị banner quảng cáo",
  },
  {
    id: "ai_recommendation",
    name: "Gợi ý AI",
    enabled: false,
    description: "Sử dụng AI để gợi ý nhiếp ảnh gia",
  },
];

export const AI_SETTINGS = {
  privacyFilter: {
    enabled: true,
    phoneRegex: true,
    emailRegex: true,
    addressRegex: false,
  },
  ratingAlert: {
    enabled: true,
    threshold: 4.0,
    alertAdmins: true,
    autoNotifyPhotographer: false,
  },
};