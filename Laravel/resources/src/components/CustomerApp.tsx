import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomerAuth } from "./customer/CustomerAuth";
import { CustomerHome } from "./customer/CustomerHome";
import { CustomerBookings } from "./customer/CustomerBookings";
import { CustomerChat } from "./customer/CustomerChat";
import { CustomerProfile } from "./customer/CustomerProfile";
import { CustomerEditProfile } from "./customer/CustomerEditProfile";
import { AppLayoutWithSidebar } from "./AppLayoutWithSidebar";
import { toast } from "sonner";

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
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<CustomerView>("home");
    const [chatBookingId, setChatBookingId] = useState<string | null>(null);

    // ✅ Load token và user khi mở lại trang
    useEffect(() => {
        const token = localStorage.getItem("customer_token");
        const userData = localStorage.getItem("customer_info");
        console.log("🔍 CustomerApp - Loading user data:", { token: token ? "Có" : "Không", userData: userData ? "Có" : "Không" });
        
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log("✅ CustomerApp - User đã được load:", parsedUser);
                setIsAuthenticated(true);
                setUser(parsedUser);
            } catch (error) {
                console.error("❌ CustomerApp - Lỗi parse user data:", error);
                // Xóa dữ liệu không hợp lệ
                localStorage.removeItem("customer_info");
                localStorage.removeItem("customer_token");
            }
        } else {
            console.warn("⚠️ CustomerApp - Không tìm thấy token hoặc user data");
        }
    }, []);

    // ✅ Xử lý query parameters từ VNPay callback
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const payment = searchParams.get("payment");
        const message = searchParams.get("message");
        const type = searchParams.get("type");
        const ma_bc = searchParams.get("ma_bc");
        const amount = searchParams.get("amount");
        const transaction_id = searchParams.get("transaction_id");

        if (payment === "success") {
            // Đảm bảo user đã được load trước khi xử lý
            const token = localStorage.getItem("customer_token");
            const userData = localStorage.getItem("customer_info");
            
            if (token && userData && !isAuthenticated) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("❌ CustomerApp - Lỗi parse user data:", error);
                }
            }
            
            // Chuyển về trang chủ (home) trước
            setCurrentView("home");
            
            // Xóa query parameters để tránh hiển thị lại thông báo
            navigate("/customer", { replace: true });
            
            // Hiển thị thông báo thành công
            const paymentType = type === "deposit" ? "Đặt cọc" : "Thanh toán phần còn lại";
            const successMessage = `${paymentType} thành công!${ma_bc ? ` Mã buổi chụp: ${ma_bc}` : ""}${amount ? ` Số tiền: ${amount}` : ""}${transaction_id ? ` Mã giao dịch: ${transaction_id}` : ""}`;
            
            toast.success(successMessage, {
                duration: 5000,
            });
        } else if (payment === "failed") {
            // Đảm bảo user đã được load trước khi xử lý
            const token = localStorage.getItem("customer_token");
            const userData = localStorage.getItem("customer_info");
            
            if (token && userData && !isAuthenticated) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("❌ CustomerApp - Lỗi parse user data:", error);
                }
            }
            
            // Chuyển về trang chủ (home)
            setCurrentView("home");
            
            // Xóa query parameters để tránh hiển thị lại thông báo
            navigate("/customer", { replace: true });
            
            // Hiển thị thông báo lỗi
            const errorMessage = message || "Thanh toán thất bại hoặc bị hủy";
            toast.error(errorMessage, {
                duration: 5000,
            });
        }
    }, [location.search, isAuthenticated, navigate]);

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
                    const token = localStorage.getItem("customer_token");
                    console.log("🔐 CustomerApp - onLogin callback triggered");
                    console.log("🔐 CustomerApp - Token:", token ? "Có" : "Không");
                    console.log("🔐 CustomerApp - User data:", userData);
                    
                    if (token && userData) {
                        try {
                            const parsedUser = JSON.parse(userData);
                            console.log("✅ CustomerApp - onLogin - User parsed:", parsedUser);
                            setUser(parsedUser);
                            setIsAuthenticated(true);
                        } catch (error) {
                            console.error("❌ CustomerApp - onLogin - Lỗi parse user:", error);
                            alert("❌ Lỗi: Dữ liệu người dùng không hợp lệ!");
                        }
                    } else {
                        console.error("❌ CustomerApp - onLogin - Không tìm thấy token hoặc user data");
                        alert("❌ Lỗi: Đăng nhập không thành công!");
                    }
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
                        user={user}
                        onNavigate={(view: string) =>
                            setCurrentView(view as CustomerView)
                        }
                    />
                );
            case "bookings":
                return (
                    <CustomerBookings
                        onBack={() => setCurrentView("home")}
                        onNavigate={(view: string, bookingId?: string) => {
                            if (view === "messages") {
                                setChatBookingId(bookingId || null);
                                setCurrentView("messages");
                            }
                        }}
                    />
                );
                
            case "messages":
                return (
                    <CustomerChat 
                        onBack={() => {
                            setCurrentView("home");
                            setChatBookingId(null);
                        }}
                        initialBookingId={chatBookingId || undefined}
                    />
                );
            case "profile":
                return (
                    <CustomerProfile
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
                        user={user}
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
            onLogout={handleLogout}
        >
            {renderContent()}
        </AppLayoutWithSidebar>
    );
}
