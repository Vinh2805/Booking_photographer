import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Switch } from "../ui/switch";
import { PhotographerEditProfile } from "./PhotographerEditProfile";
import { PhotographerChangePassword } from "./PhotographerChangePassword";
import { ProfileHeader } from "../photographer/photographer components/ProfileHeader";
import { ReviewsSection } from "../photographer/photographer components/ReviewsSection";
import { SettingsMenu } from "../photographer/photographer components/SettingsMenu";
import { ShieldCheck, Smartphone, ArrowLeft } from "lucide-react";
import {
  PHOTOGRAPHER_DATA,
  RECENT_REVIEWS,
} from "./constants/photographerProfileData";
import {
  MAIN_MENU_ITEMS,
  SETTINGS_MENU_ITEMS,
} from "./constants/profileMenuItems";

export interface PhotographerProfileProps {
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

export function PhotographerProfile({
  onLogout,
  onNavigate,
}: PhotographerProfileProps) {
  const [currentView, setCurrentView] = useState<
    "profile" | "edit" | "password" | "security"
  >("profile");

  const handleMainMenuClick = (itemId: string) => {
    switch (itemId) {
      case "security":
        setCurrentView("security");
        break;
      case "edit":
        setCurrentView("edit");
        break;
      default:
        break;
    }
  };

  // ================== Security Settings View ==================
  const HeaderBar: React.FC<{
    title: string;
    onBack?: () => void;
  }> = ({ title, onBack }) => {
    return (
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="font-semibold">{title}</h1>
        </div>
      </div>
    );
  };
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

    const revoke = (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      alert(`Đã đăng xuất phiên ${id}`);
    };

    const save = () => alert("Đã lưu cài đặt bảo mật (demo)");

    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderBar title="Bảo mật tài khoản" onBack={onBack} />
        <div className="p-4 max-w-2xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Tổng quan bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-sm text-gray-600 flex items-center justify-between mb-1">
                  <span>Bật xác thực 2 bước</span>
                  <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                </div>
                <p className="text-xs text-gray-500">
                  Tăng bảo vệ bằng mã OTP qua ứng dụng/SMS.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <div className="text-sm text-gray-600 flex items-center justify-between mb-1">
                  <span>Cảnh báo đăng nhập mới</span>
                  <Switch
                    checked={loginAlerts}
                    onCheckedChange={setLoginAlerts}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Gửi thông báo khi tài khoản đăng nhập trên thiết bị lạ.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" /> Phiên hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white"
                >
                  <div>
                    <p className="font-medium text-sm">{s.device}</p>
                    <p className="text-xs text-gray-500">
                      Hoạt động: {s.lastActive}
                      {s.thisDevice ? " · Thiết bị này" : ""}
                    </p>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không còn phiên hoạt động nào</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={save}>Lưu cài đặt</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  const handleSettingsMenuClick = (itemId: string) => {
    switch (itemId) {
      case "password":
        setCurrentView("password");
        break;
      case "notifications":
        alert("Mở cài đặt thông báo");
        break;
      case "security":
        setCurrentView("security");
        break;
      case "support":
        alert("Mở trang hỗ trợ");
        break;
      default:
        break;
    }
  };

  if (currentView === "edit") {
    return <PhotographerEditProfile onBack={() => setCurrentView("profile")} />;
  }

  if (currentView === "password") {
    return (
      <PhotographerChangePassword onBack={() => setCurrentView("profile")} />
    );
  }
  if (currentView === "security") {
    return <SecuritySettingsView onBack={() => setCurrentView("profile")} />;
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <h1 className="text-xl font-bold">Hồ sơ của tôi</h1>

      <ProfileHeader
        photographer={PHOTOGRAPHER_DATA}
        onEdit={() => setCurrentView("edit")}
      />

      {/* Main Menu Items - Sửa hồ sơ */}
      <div className="grid grid-cols-1 gap-4">
        {MAIN_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              onClick={() => handleMainMenuClick(item.id)}
              variant="outline"
              className={`h-16 flex-col gap-2 ${item.bgColor || ""}`}
            >
              <Icon className="w-6 h-6" />
              {item.title}
            </Button>
          );
        })}
      </div>

      <ReviewsSection reviews={RECENT_REVIEWS} />

      {/* Settings Section */}
      <div className="space-y-4">
        <SettingsMenu
          menuItems={SETTINGS_MENU_ITEMS}
          onItemClick={handleSettingsMenuClick}
        />
      </div>
    </div>
  );
}
