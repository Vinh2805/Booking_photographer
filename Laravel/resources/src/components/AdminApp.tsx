import { useState } from "react";
import { AdminAuth } from "./admin/AdminAuth";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminCustomers } from "./admin/AdminCustomers";
import { AdminPhotographers } from "./admin/AdminPhotographers";
import { AdminBookings } from "./admin/AdminBookings";
import { AdminSettings } from "./admin/AdminSettings";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Camera,
  Calendar,
  Settings,
} from "lucide-react";

interface AdminAppProps {
  onBack: () => void;
}

type AdminTab =
  | "dashboard"
  | "customers"
  | "photographers"
  | "bookings"
  | "settings";

export function AdminApp({ onBack }: AdminAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [selectedBookingId, setSelectedBookingId] = useState<
    string | undefined
  >();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("dashboard");
    onBack();
  };

  const handleNavigateToBookings = (bookingId?: string) => {
    setSelectedBookingId(bookingId);
    setActiveTab("bookings");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-white/50 dark:border-slate-700/50">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h1 className="font-semibold text-slate-800 dark:text-slate-100">
            Quản trị viên
          </h1>
          <ThemeToggle />
        </div>
        <AdminAuth onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <AdminDashboard onNavigateToBookings={handleNavigateToBookings} />
        );
      case "customers":
        return <AdminCustomers />;
      case "photographers":
        return <AdminPhotographers />;
      case "bookings":
        return (
          <AdminBookings
            selectedBookingId={selectedBookingId}
            onClearSelection={() => setSelectedBookingId(undefined)}
          />
        );
      case "settings":
        return <AdminSettings onLogout={handleLogout} />;
      default:
        return (
          <AdminDashboard onNavigateToBookings={handleNavigateToBookings} />
        );
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "customers", label: "Khách hàng", icon: Users },
    { id: "photographers", label: "Nhiếp ảnh gia", icon: Camera },
    { id: "bookings", label: "Buổi chụp", icon: Calendar },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">{renderContent()}</div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="grid grid-cols-5 text-xs max-w-md mx-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as AdminTab);
                if (id !== "bookings") {
                  setSelectedBookingId(undefined);
                }
              }}
              className={`relative py-3 px-2 text-center transition-all duration-200 ${
                activeTab === id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon
                className={`w-4 h-4 mx-auto mb-1 transition-transform duration-200 ${
                  activeTab === id ? "scale-110" : ""
                }`}
              />
              <div className="font-medium">{label}</div>
              {activeTab === id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
