import {
  Lock,
  Bell,
  ShieldCheck,
  HelpCircle,
  User,
} from "lucide-react";

export const MAIN_MENU_ITEMS = [
  {
    id: "edit",
    icon: User,
    title: "Sửa hồ sơ",
    color: "text-gray-600",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    border: "border border-gray-200",
  },
];

// Các mục cài đặt tài khoản
export const SETTINGS_MENU_ITEMS = [
  {
    id: "password",
    icon: Lock,
    title: "Đổi mật khẩu",
    description: "Thay đổi mật khẩu đăng nhập",
    iconColor: "text-orange-600",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Cài đặt thông báo",
    description: "Quản lý thông báo từ ứng dụng",
    iconColor: "text-purple-600",
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Bảo mật tài khoản",
    description: "2FA, Cảnh báo đăng nhập",
    iconColor: "text-green-600",
  },
  {
    id: "support",
    icon: HelpCircle,
    title: "Hỗ trợ",
    description: "Liên hệ với đội ngũ hỗ trợ",
    iconColor: "text-yellow-600",
  },
];

// Giữ nguyên export cũ để tương thích ngược
export const PROFILE_MENU_ITEMS = [
  ...MAIN_MENU_ITEMS,
  ...SETTINGS_MENU_ITEMS,
];