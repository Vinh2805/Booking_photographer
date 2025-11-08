import { useEffect, useState } from "react";
import { CustomerAuth } from "./customer/CustomerAuth";
import { CustomerHome } from "./customer/CustomerHome";
import { CustomerBookings } from "./customer/CustomerBookings";
import { CustomerChat } from "./customer/CustomerChat";
import { CustomerProfile } from "./customer/CustomerProfile";
import { CustomerEditProfile } from "./customer/CustomerEditProfile";
import { AppLayoutWithSidebar } from "./AppLayoutWithSidebar";

interface CustomerAppProps {
    onLogout: () => void; // ✅ đổi tên prop để khớp với App.tsx
}

type CustomerView =
    | "home"
    | "bookings"
    | "messages"
    | "profile"
    | "edit-profile";

export function CustomerApp({ onLogout }: CustomerAppProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<CustomerView>("home");

    // ✅ Load token và user khi mở lại trang
    useEffect(() => {
        const token = localStorage.getItem("customer_token");
        const userData = localStorage.getItem("customer_info");
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    // ✅ Hàm đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_info");
        setIsAuthenticated(false);
        onLogout(); // ✅ quay lại trang Home
    };

    // ✅ Nếu chưa đăng nhập thì hiển thị form login
    if (!isAuthenticated) {
        return (
            <CustomerAuth
                onBack={onLogout} // Quay về trang Landing
                onLogin={() => {
                    const userData = localStorage.getItem("customer_info");
                    if (userData) setUser(JSON.parse(userData));
                    setIsAuthenticated(true);
                }}
            />
        );
    }

    // ✅ Xử lý điều hướng sidebar
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
            case "settings":
            case "wallet":
                setCurrentView("profile");
                break;
            case "logout":
                handleLogout(); // ✅ Gọi hàm đăng xuất thật sự
                break;
            default:
                break;
        }
    };

    // ✅ Tên trang hiện tại
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

    // ✅ Breadcrumb
    const getBreadcrumbs = () => {
        switch (currentView) {
            case "edit-profile":
                return [{ label: "Hồ sơ", href: "#" }, { label: "Chỉnh sửa" }];
            default:
                return [];
        }
    };

    // ✅ Render nội dung từng phần
    const renderContent = () => {
        switch (currentView) {
            case "home":
                return (
                    <CustomerHome
                        onNavigate={(view: string) =>
                            setCurrentView(view as CustomerView)
                        }
                    />
                );
            case "bookings":
                return (
                    <CustomerBookings
                        user={user}
                        onNavigate={(view: string) =>
                            setCurrentView(view as CustomerView)
                        }
                    />
                );
            case "messages":
                return <CustomerChat onBack={() => setCurrentView("home")} />;
            case "profile":
                return (
                    <CustomerProfile
                        user={user}
                        onNavigate={(view: string) =>
                            setCurrentView(view as CustomerView)
                        }
                    />
                );
            case "edit-profile":
                return (
                    <CustomerEditProfile
                        onBack={() => setCurrentView("profile")}
                    />
                );
            default:
                return (
                    <CustomerHome
                        onNavigate={(view: string) =>
                            setCurrentView(view as CustomerView)
                        }
                    />
                );
        }
    };

    return (
        <AppLayoutWithSidebar
            onNavigate={handleNavigate}
            title={getPageTitle()}
            breadcrumbs={getBreadcrumbs()}
            userRole="customer"
            currentView={currentView}
            user={user}
            onLogout={handleLogout} // ✅ THÊM DÒNG NÀY
        >
            {renderContent()}
        </AppLayoutWithSidebar>
    );
}
