import { useState } from "react";
import { AdminAuth } from "./admin/AdminAuth";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminCustomers } from "./admin/AdminCustomers";
import { AdminPhotographers } from "./admin/AdminPhotographers";
import { AdminBookings } from "./admin/AdminBookings";
import { AdminSettings } from "./admin/AdminSettings";
import { AdminWallet } from "./admin/AdminWallet";
import { AdminChat } from "./admin/AdminChat";
import { ThemeToggle } from "./ui/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminServices } from "./admin/AdminServices";

interface AdminAppProps {
  onBack: () => void;
}

type AdminTab =
  | "dashboard"
  | "customers"
  | "photographers"
  | "bookings"
  | "chat"
  | "services"
  | "settings"
  | "wallet";

export function AdminApp({ onBack }: AdminAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [selectedBookingId, setSelectedBookingId] = useState<
    string | undefined
  >();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      await fetch('/api/logout', { // Or /api/admin/logout if you separate them
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    } catch (e) { console.error("Logout failed", e); }

    localStorage.removeItem("admin_token");
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
      case "wallet":
        return <AdminWallet />;
      case "chat":
        return <AdminChat />;
      case "services":
        return <AdminServices />;
      case "settings":
        return <AdminSettings onLogout={handleLogout} />;
      default:
        return (
          <AdminDashboard onNavigateToBookings={handleNavigateToBookings} />
        );
    }
  };

  const getPageTitle = (tab: AdminTab) => {
    switch (tab) {
      case "dashboard": return "Tổng quan hệ thống";
      case "customers": return "Quản lý khách hàng";
      case "photographers": return "Quản lý nhiếp ảnh gia";
      case "bookings": return "Quản lý buổi chụp";
      case "settings": return "Cài đặt hệ thống";
      case "wallet": return "Ví cá nhân";
      case "chat": return "Hỗ trợ trực tuyến";
      default: return "Admin Panel";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminLayout
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab as AdminTab);
          if (tab !== "bookings") setSelectedBookingId(undefined);
        }}
        onLogout={handleLogout}
        title={getPageTitle(activeTab)}
      >
        {renderContent()}
      </AdminLayout>
    </div>
  );
}
