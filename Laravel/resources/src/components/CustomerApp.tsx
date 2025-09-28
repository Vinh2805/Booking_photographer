import { useState } from "react";
import { CustomerAuth } from "./customer/CustomerAuth";
import { CustomerHome } from "./customer/CustomerHome";
import { CustomerBookings } from "./customer/CustomerBookings";
import { CustomerChat } from "./customer/CustomerChat";
import { CustomerProfile } from "./customer/CustomerProfile";
import { CustomerEditProfile } from "./customer/CustomerEditProfile";
import { AppLayoutWithSidebar } from "./AppLayoutWithSidebar";

interface CustomerAppProps {
  onBack: () => void;
}

type CustomerView =
  | "home"
  | "bookings"
  | "messages"
  | "profile"
  | "edit-profile";

export function CustomerApp({ onBack }: CustomerAppProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<CustomerView>("home");

  if (!isAuthenticated) {
    return (
      <CustomerAuth onBack={onBack} onLogin={() => setIsAuthenticated(true)} />
    );
  }

  const handleNavigate = (section: string) => {
    console.log("CustomerApp handleNavigate:", section);
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
      case "wallet":
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
        return "Trang chủ";
      case "bookings":
        return "Buổi chụp";
      case "messages":
        return "Tin nhắn";
      case "profile":
        return "Hồ sơ";
      case "edit-profile":
        return "Chỉnh sửa hồ sơ";
      default:
        return "Momentia";
    }
  };

  const getBreadcrumbs = () => {
    switch (currentView) {
      case "edit-profile":
        return [{ label: "Hồ sơ", href: "#" }, { label: "Chỉnh sửa" }];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return (
          <CustomerHome
            onNavigate={(view: string) => setCurrentView(view as CustomerView)}
          />
        );
      case "bookings":
        return (
          <CustomerBookings
            onNavigate={(view: string) => setCurrentView(view as CustomerView)}
          />
        );
      case "messages":
        return <CustomerChat onBack={() => setCurrentView("home")} />;
      case "profile":
        return (
          <CustomerProfile
            onNavigate={(view: string) => setCurrentView(view as CustomerView)}
          />
        );
      case "edit-profile":
        return <CustomerEditProfile onBack={() => setCurrentView("profile")} />;
      default:
        return (
          <CustomerHome
            onNavigate={(view: string) => setCurrentView(view as CustomerView)}
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
      userRole="customer"
      currentView={currentView}
    >
      {renderContent()}
    </AppLayoutWithSidebar>
  );
}
