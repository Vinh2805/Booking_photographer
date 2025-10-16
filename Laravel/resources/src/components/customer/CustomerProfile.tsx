import { useMemo, useState } from "react";
import { CustomerEditProfile } from "./CustomerEditProfile";
import { CustomerBookings } from "./CustomerBookings";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  User,
  Star,
  Calendar,
  MapPin,
  Mail,
  Heart,
  Camera,
  Settings,
  Bell,
  ShieldCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  UserRound,
  Camera as CameraIcon,
  Trash2,
  KeyRound,
  Smartphone,
} from "lucide-react";

// ================== Types ==================
interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  totalBookings: number;
  completedBookings: number;
  favoritePhotographers: number;
}


export interface CustomerProfileProps {
  onNavigateToBookings?: (filter?: string) => void;
  onNavigateToFavorites?: () => void;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

// ================== Reusable header ==================
const HeaderBar: React.FC<{
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}> = ({ title, onBack, right }) => (
  <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4 flex items-center gap-3 shadow-sm">
    {onBack && (
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
    )}
    <h1 className="font-semibold text-lg flex-1 text-slate-800 dark:text-slate-100">
      {title}
    </h1>
    {right}
  </div>
);

// ================== Favorites View ==================
type Photographer = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  completed: number;
  location: string;
  specialties: string[];
};

const FavoritePhotographersView: React.FC<{
  onBack?: () => void;
}> = ({ onBack }) => {
  const [query, setQuery] = useState("");
  const [onlyTopRated, setOnlyTopRated] = useState(false);

  const favorites: Photographer[] = [
    {
      id: "P001",
      name: "Minh Tuấn",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face",
      rating: 4.9,
      completed: 127,
      location: "Hà Nội",
      specialties: ["Cưới", "Couple", "Pre-wedding"],
    },
    {
      id: "P002",
      name: "Đức Anh",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
      rating: 4.8,
      completed: 89,
      location: "TP.HCM",
      specialties: ["Gia đình", "Sự kiện"],
    },
    {
      id: "P003",
      name: "Thu Hằng",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b5ba5948?w=120&h=120&fit=crop&crop=face",
      rating: 4.9,
      completed: 156,
      location: "Đà Nẵng",
      specialties: ["Portrait", "Fashion", "Street"],
    },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return favorites.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.specialties.join(" ").toLowerCase().includes(q);
      const matchesTop = !onlyTopRated || p.rating >= 4.8;
      return matchesQ && matchesTop;
    });
  }, [query, onlyTopRated]);

  const openChat = (p: Photographer) => alert(`Mở chat với ${p.name}`);
  const removeFavorite = (p: Photographer) => alert(`Bỏ yêu thích: ${p.name}`);
  const viewProfile = (p: Photographer) => alert(`Xem hồ sơ của ${p.name}`);
  const bookNow = (p: Photographer) => alert(`Đặt lịch với ${p.name}`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderBar title="Nhiếp ảnh gia yêu thích" onBack={onBack} />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Tìm theo tên, địa điểm, thể loại…"
              className="pl-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Label
              htmlFor="topRated"
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              4.8★+
            </Label>
            <Switch
              id="topRated"
              checked={onlyTopRated}
              onCheckedChange={setOnlyTopRated}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-slate-800 dark:text-slate-100">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {p.rating}
                          </span>
                          <span>•</span>
                          <span>{p.completed} buổi chụp</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{p.location}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.specialties.map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="text-[11px] border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-400"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openChat(p)}
                            className="gap-2 border-slate-300 dark:border-slate-600"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewProfile(p)}
                            className="gap-2 border-slate-300 dark:border-slate-600"
                          >
                            <UserRound className="w-4 h-4" />
                            Xem
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => bookNow(p)}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
                          >
                            <CameraIcon className="w-4 h-4" />
                            Đặt lịch
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavorite(p)}
                            aria-label="Bỏ yêu thích"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium mb-2">
                Chưa có nhiếp ảnh gia yêu thích
              </p>
              <p className="text-sm">
                Hãy khám phá và lưu các nhiếp ảnh gia bạn thích!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================== Change Password View ==================
const ChangePasswordView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const strength = useMemo(() => {
    let score = 0;
    if (next.length >= 8) score++;
    if (/[A-Z]/.test(next)) score++;
    if (/[a-z]/.test(next)) score++;
    if (/[0-9]/.test(next)) score++;
    if (/[^A-Za-z0-9]/.test(next)) score++;
    return score; // 0..5
  }, [next]);

  const submit = () => {
    if (!current || !next || !confirm)
      return alert("Vui lòng nhập đủ thông tin");
    if (next !== confirm) return alert("Mật khẩu xác nhận không khớp");
    if (strength < 3) return alert("Mật khẩu mới chưa đủ mạnh (tối thiểu 3/5)");
    alert("Đổi mật khẩu thành công (demo)");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderBar title="Đổi mật khẩu" onBack={onBack} />
      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <KeyRound className="w-5 h-5 text-purple-600" />
              Thiết lập mật khẩu mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">
                Mật khẩu hiện tại
              </Label>
              <Input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">
                Mật khẩu mới
              </Label>
              <Input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength <= 2
                      ? "bg-red-500 w-2/5"
                      : strength === 3
                      ? "bg-yellow-500 w-3/5"
                      : strength === 4
                      ? "bg-green-500 w-4/5"
                      : strength === 5
                      ? "bg-green-600 w-full"
                      : "w-1/5 bg-red-400"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gợi ý: dùng chữ hoa, số và ký tự đặc biệt để mạnh hơn.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">
                Xác nhận mật khẩu mới
              </Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Huỷ
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={submit}
            >
              Lưu mật khẩu
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// ================== Security Settings View ==================
const SecuritySettingsView: React.FC<{
  onBack?: () => void;
}> = ({ onBack }) => {
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessions, setSessions] = useState([
    {
      id: "SESS-1",
      device: "iPhone 16",
      lastActive: "Vừa xong",
      thisDevice: true,
    },
    {
      id: "SESS-2",
      device: "iPhone 15 Promax",
      lastActive: "Hôm qua 14:21",
      thisDevice: false,
    },
  ]);


  const save = () => alert("Đã lưu cài đặt bảo mật (demo)");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <HeaderBar title="Bảo mật tài khoản" onBack={onBack} />
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Tổng quan bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <span>Bật xác thực 2 bước</span>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tăng bảo vệ bằng mã OTP qua ứng dụng/SMS.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
              <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <span>Cảnh báo đăng nhập mới</span>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gửi thông báo khi tài khoản đăng nhập trên thiết bị lạ.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Phiên hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
              >
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100">
                    {s.device}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hoạt động: {s.lastActive}
                    {s.thisDevice ? " · Thiết bị này" : ""}
                  </p>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">Không còn phiên hoạt động nào</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={save}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Lưu cài đặt
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// ================== Main: CustomerProfile ==================
export function CustomerProfile({
  onNavigateToFavorites,
}: CustomerProfileProps) {
  const [currentView, setCurrentView] = useState<
    | "profile"
    | "favorites"
    | "change_password"
    | "security"
    | "edit"
    | "bookings"
  >("profile");

  // Mock customer data with better avatar
  const customerData: CustomerData = {
    id: "CUST001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face",
    location: "Hà Nội",
    joinDate: "2024-03-15",
    totalBookings: 8,
    completedBookings: 6,
    favoritePhotographers: 3,
  };

  const openSupportChat = () => alert("Mở chat hỗ trợ khách hàng");

  // Sub-routes
  if (currentView === "favorites") {
    return (
      <FavoritePhotographersView onBack={() => setCurrentView("profile")} />
    );
  }
  if (currentView === "change_password") {
    return <ChangePasswordView onBack={() => setCurrentView("profile")} />;
  }
  if (currentView === "security") {
    return <SecuritySettingsView onBack={() => setCurrentView("profile")} />;
  }
  // Wallet view removed - wallet features disabled
  if (currentView === "edit") {
    return <CustomerEditProfile onBack={() => setCurrentView("profile")} />;
  }
  if (currentView === "bookings") {
    return <CustomerBookings onBack={() => setCurrentView("profile")} />;
  }

  // Profile main
  return (
    <div className="p-4 space-y-6 pb-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Hồ sơ của tôi
        </h1>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <img
                src={customerData.avatar}
                alt={customerData.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-600 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 border-3 border-white dark:border-slate-700 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {customerData.name}
              </h2>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{customerData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Tham gia từ{" "}
                  {new Date(customerData.joinDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4" />
              <span>{customerData.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={() => setCurrentView("edit")}
          variant="outline"
          className="h-20 flex-col gap-3 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg"
        >
          <User className="w-7 h-7 text-slate-600 dark:text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Sửa hồ sơ
          </span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
          onClick={() => setCurrentView("bookings")}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {customerData.totalBookings}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Tổng buổi chụp
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700"
          onClick={() => {
            if (onNavigateToFavorites) onNavigateToFavorites();
            else setCurrentView("favorites");
          }}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
              {customerData.favoritePhotographers}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Yêu thích
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Menu */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Cài đặt tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              id: "notifications",
              label: "Cài đặt thông báo",
              icon: Bell,
              description: "Quản lý thông báo ứng dụng",
              color: "text-purple-600 dark:text-purple-400",
              bgColor: "bg-purple-100 dark:bg-purple-900/50",
            },
            {
              id: "favorites",
              label: "Nhiếp ảnh gia yêu thích",
              icon: Heart,
              description: "Danh sách nhiếp ảnh gia đã lưu",
              color: "text-pink-600 dark:text-pink-400",
              bgColor: "bg-pink-100 dark:bg-pink-900/50",
            },
            {
              id: "change_password",
              label: "Đổi mật khẩu",
              icon: KeyRound,
              description: "Thay đổi mật khẩu đăng nhập",
              color: "text-orange-600 dark:text-orange-400",
              bgColor: "bg-orange-100 dark:bg-orange-900/50",
            },
            {
              id: "security",
              label: "Bảo mật tài khoản",
              icon: ShieldCheck,
              description: "2FA, Cảnh báo đăng nhập",
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-100 dark:bg-green-900/50",
            },
            {
              id: "support",
              label: "Hỗ trợ",
              icon: HelpCircle,
              description: "Liên hệ đội ngũ hỗ trợ",
              color: "text-blue-600 dark:text-blue-400",
              bgColor: "bg-blue-100 dark:bg-blue-900/50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-auto p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl"
                onClick={() => {
                  if (item.id === "favorites") {
                    if (onNavigateToFavorites) onNavigateToFavorites();
                    else setCurrentView("favorites");
                  } else if (item.id === "change_password") {
                    setCurrentView("change_password");
                  } else if (item.id === "security") {
                    setCurrentView("security");
                  } else if (item.id === "notifications") {
                    alert("Mở cài đặt thông báo");
                  } else if (item.id === "support") {
                    openSupportChat();
                  }
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerProfile;
