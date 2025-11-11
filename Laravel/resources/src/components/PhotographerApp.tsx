import { useState, useEffect } from "react";
import { PhotographerAuth } from "./photographer/PhotographerAuth";
import { PhotographerHome } from "./photographer/PhotographerHome";
import { PhotographerBookings } from "./photographer/PhotographerBookings";
import { PhotographerChat } from "./photographer/PhotographerChat";
import { PhotographerProfile } from "./photographer/PhotographerProfile";
import { PhotographerEditProfile } from "./photographer/PhotographerEditProfile";
import { PhotographerChangePassword } from "./photographer/PhotographerChangePassword";
import { BookingDetail } from "./photographer/BookingDetail";
import { AppLayoutWithSidebar } from "./AppLayoutWithSidebar";
import React from "react";

// ✅ Đổi prop từ onBack → onLogout để đồng bộ với App.tsx
interface PhotographerAppProps {
    onLogout: () => void;
}

type PhotographerView =
    | "home"
    | "bookings"
    | "booking-detail"
    | "messages"
    | "profile"
    | "edit-profile"
    | "change-password";

export function PhotographerApp({ onLogout }: PhotographerAppProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<PhotographerView>("home");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // ✅ Đọc token và user từ localStorage khi mở lại trang
    useEffect(() => {
        const token = localStorage.getItem("photographer_token");
        const userData = localStorage.getItem("photographer_info");
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    // ✅ Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("photographer_token");
        localStorage.removeItem("photographer_info");
        setIsAuthenticated(false);
        onLogout(); // ✅ quay lại trang Home
    };

    // ✅ Nếu chưa đăng nhập thì hiển thị form Auth
    if (!isAuthenticated) {
        return (
            <PhotographerAuth
                onLogin={() => {
                    const userData = localStorage.getItem("photographer_info");
                    if (userData) setUser(JSON.parse(userData));
                    setIsAuthenticated(true);
                }}
                onBack={() => onLogout()} // logout quay về landing
            />
        );
    }

    // ✅ Xử lý điều hướng sidebar
    const handleNavigate = (section: string) => {
        switch (section) {
            case "home":
                setCurrentView("home");
                setSelectedBookingId(null);
                break;
            case "bookings":
                setCurrentView("bookings");
                setSelectedBookingId(null);
                break;
            case "messages":
                setCurrentView("messages");
                setSelectedBookingId(null);
                break;
            case "profile":
                setCurrentView("profile");
                setSelectedBookingId(null);
                break;
            case "settings":
                setCurrentView("profile");
                setSelectedBookingId(null);
                break;
            case "logout":
                handleLogout();
                break;
            default:
                break;
        }
    };

    // ✅ Tên trang hiển thị
    const getPageTitle = () => {
        switch (currentView) {
            case "home":
                return "Tổng quan";
            case "bookings":
                return "Buổi chụp";
            case "booking-detail":
                return "Chi tiết buổi chụp";
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

    // ✅ Breadcrumb
    const getBreadcrumbs = () => {
        switch (currentView) {
            case "booking-detail":
                return [
                    { label: "Buổi chụp", href: "#" },
                    { label: "Chi tiết" },
                ];
            case "edit-profile":
                return [{ label: "Hồ sơ", href: "#" }, { label: "Chỉnh sửa" }];
            case "change-password":
                return [
                    { label: "Hồ sơ", href: "#" },
                    { label: "Đổi mật khẩu" },
                ];
            default:
                return [];
        }
    };

    // ✅ Render nội dung từng tab
    const renderContent = () => {
        switch (currentView) {
            case "home":
                return (
                    <PhotographerHome user={user} onNavigate={setCurrentView} />
                );
            case "bookings":
                return (
                    <PhotographerBookings
                        user={user}
                        onNavigate={setCurrentView}
                        selectedBookingId={selectedBookingId || undefined}
                        onSelectBooking={(bookingId: string) => {
                            setSelectedBookingId(bookingId);
                            setCurrentView("booking-detail");
                        }}
                        onClearSelection={() => {
                            setSelectedBookingId(null);
                            setCurrentView("bookings");
                        }}
                    />
                );
            case "booking-detail":
                return (
                    <BookingDetail
                        bookingId={selectedBookingId || ""}
                        onBack={() => {
                            setCurrentView("bookings");
                            setSelectedBookingId(null);
                        }}
                    />
                );
            case "messages":
                return (
                    <PhotographerChat
                        onBack={() => setCurrentView("home")}
                    />
                );
            case "profile":
                return (
                    <PhotographerProfile
                        user={user}
                        onNavigate={setCurrentView}
                    />
                );
            case "edit-profile":
                return (
                    <PhotographerEditProfile
                        onBack={() => setCurrentView("profile")}
                    />
                );
            case "change-password":
                return (
                    <PhotographerChangePassword
                        onBack={() => setCurrentView("profile")}
                    />
                );
            default:
                return (
                    <PhotographerHome user={user} onNavigate={setCurrentView} />
                );
        }
    };

    return (
        <AppLayoutWithSidebar
            onNavigate={handleNavigate}
            title={getPageTitle()}
            breadcrumbs={getBreadcrumbs()}
            userRole="photographer"
            currentView={currentView}
            onLogout={handleLogout} // ✅ THÊM DÒNG NÀY
        >
            {renderContent()}
        </AppLayoutWithSidebar>
    );
}
