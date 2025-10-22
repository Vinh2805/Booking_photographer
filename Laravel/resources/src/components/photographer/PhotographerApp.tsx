import React, { useState } from "react";
import { PhotographerAuth } from "./PhotographerAuth";
import { PhotographerHome } from "./PhotographerHome";
import { PhotographerBookings } from "./PhotographerBookings";
import { PhotographerChat } from "./PhotographerChat";
import { PhotographerProfile } from "./PhotographerProfile";
import { PhotographerEditProfile } from "./PhotographerEditProfile";
import { PhotographerChangePassword } from "./PhotographerChangePassword";
import { AppLayoutWithSidebar } from "../other/AppLayoutWithSidebar";

interface PhotographerAppProps {
  onBack: () => void;
}

type PhotographerView =
  | "home"
  | "bookings"
  | "messages"
  | "profile"
  | "edit-profile"
  | "change-password";

export function PhotographerApp({ onBack }: PhotographerAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<PhotographerView>("home");

  if (!isAuthenticated) {
    return (
      <PhotographerAuth
        onLogin={() => setIsAuthenticated(true)}
        onBack={onBack}
      />
    );
  }

  const handleNavigate = (section: string) => {
    switch (section) {
      case "home":
        setCurrentView("home");
        break;
      case "bookings":
        setCurrentView("bookings");
        break;
      case "messages":
        setCurrentView("messages");
        break;
      case "profile":
        setCurrentView("profile");
        break;
      case "settings":
        setCurrentView("profile");
        break;
      case "logout":
        onBack();
        break;
      default:
        break;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case "home":
        return "Tổng quan";
      case "bookings":
        return "Buổi chụp";
      case "messages":
        return "Tin nhắn";
      case "profile":
        return "Hồ sơ";
      case "edit-profile":
        return "Chỉnh sửa hồ sơ";
      case "change-password":
        return "Đổi mật khẩu";
      default:
        return "Momentia Pro";
    }
  };

  const getBreadcrumbs = () => {
    switch (currentView) {
      case "edit-profile":
        return [{ label: "Hồ sơ", href: "#" }, { label: "Chỉnh sửa" }];
      case "change-password":
        return [{ label: "Hồ sơ", href: "#" }, { label: "Đổi mật khẩu" }];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return (
          <PhotographerHome
            onNavigate={(view) => setCurrentView(view as PhotographerView)}
          />
        );
      case "bookings":
        return (
          <PhotographerBookings
            onNavigate={(view) => setCurrentView(view as PhotographerView)}
          />
        );
      case "messages":
        return <PhotographerChat onBack={() => setCurrentView("home")} />;
      case "profile":
        return (
          <PhotographerProfile
            onNavigate={(view) => setCurrentView(view as PhotographerView)}
          />
        );
      case "edit-profile":
        return (
          <PhotographerEditProfile onBack={() => setCurrentView("profile")} />
        );
      case "change-password":
        return (
          <PhotographerChangePassword
            onBack={() => setCurrentView("profile")}
          />
        );
      default:
        return (
          <PhotographerHome
            onNavigate={(view) => setCurrentView(view as PhotographerView)}
          />
        );
    }
  };

  return (
    <AppLayoutWithSidebar
      onNavigate={handleNavigate}
      onBack={onBack}
      title={getPageTitle()}
      breadcrumbs={getBreadcrumbs()}
      userRole="photographer"
    >
      {renderContent()}
    </AppLayoutWithSidebar>
  );
}
