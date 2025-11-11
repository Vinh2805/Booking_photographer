import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    useSidebar,
} from "./ui/sidebar";
import {
    Home,
    Calendar,
    MessageCircle,
    User,
    LogOut,
    Camera,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { TooltipProvider } from "./ui/tooltip";
import { useState, useEffect } from "react";
import apiClient from "./services/apiClient";
import chatApi from "./services/chatApi";

interface MomentiaSidebarProps {
    onNavigate: (section: string) => void;
    onLogout?: () => void; // ✅ thêm callback logout
    userRole?: "customer" | "photographer";
    currentView?: string;
}

// Menu items sẽ được tạo động với badges từ API

const settingsItems = [
    {
        id: "logout",
        title: "Đăng xuất",
        icon: LogOut,
        variant: "destructive" as const,
    },
];

function SidebarUserInfo({
    userRole,
}: {
    userRole?: "customer" | "photographer";
}) {
    const { state } = useSidebar();
    const [userData, setUserData] = useState<{
        name: string;
        role: string;
        avatar: string;
        fallback: string;
    } | null>(null);

    useEffect(() => {
        try {
            const infoKey = userRole === "photographer" ? "photographer_info" : "customer_info";
            const storedInfo = localStorage.getItem(infoKey);
            
            if (storedInfo) {
                const info = JSON.parse(storedInfo);
                const name = info.Ho_Ten || info.name || (userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng");
                const role = userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng";
                
                // Tạo fallback từ tên
                const nameParts = name.split(" ");
                const fallback = nameParts.length >= 2 
                    ? (nameParts[nameParts.length - 2][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : name.substring(0, 2).toUpperCase();
                
                setUserData({
                    name,
                    role,
                    avatar: info.avatar || "",
                    fallback,
                });
            } else {
                // Fallback nếu không có thông tin
                setUserData({
                    name: userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng",
                    role: userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng",
                    avatar: "",
                    fallback: userRole === "photographer" ? "NAG" : "KH",
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
            setUserData({
                name: userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng",
                role: userRole === "photographer" ? "Nhiếp ảnh gia" : "Khách hàng",
                avatar: "",
                fallback: userRole === "photographer" ? "NAG" : "KH",
            });
        }
    }, [userRole]);

    if (!userData) {
        return null;
    }

    return (
        <div className="px-2 py-3 border-b">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userData.fallback}
                    </AvatarFallback>
                </Avatar>

                {state === "expanded" && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                            {userData.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {userData.role}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function SidebarBrand() {
    const { state } = useSidebar();

    return (
        <div className="flex items-center gap-2 px-2 py-3 border-b">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Camera className="h-4 w-4 text-primary-foreground" />
            </div>
            {state === "expanded" && (
                <div className="flex flex-col">
                    <span className="font-semibold text-lg">Momentia</span>
                    <span className="text-xs text-muted-foreground">
                        Kết nối khoảnh khắc
                    </span>
                </div>
            )}
        </div>
    );
}

export function MomentiaSidebar({
    onNavigate,
    onLogout, // ✅ nhận prop logout
    userRole = "customer",
    currentView = "home",
}: MomentiaSidebarProps) {
    const { state } = useSidebar();
    const [bookingsCount, setBookingsCount] = useState<number>(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

    // Fetch số lượng bookings và tin nhắn chưa đọc
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy số lượng bookings
                if (userRole === "photographer") {
                    const bookingsRes = await apiClient.get("/buoi-chup", {
                        params: { only_mine: "true" },
                    });
                    if (bookingsRes.data.success && bookingsRes.data.data) {
                        setBookingsCount(Array.isArray(bookingsRes.data.data) ? bookingsRes.data.data.length : 0);
                    }
                } else {
                    const bookingsRes = await apiClient.get("/customer/bookings");
                    if (Array.isArray(bookingsRes.data)) {
                        setBookingsCount(bookingsRes.data.length);
                    }
                }

                // Lấy số tin nhắn chưa đọc
                try {
                    const unreadMessages = await chatApi.getUnreadMessages();
                    setUnreadMessagesCount(unreadMessages.length);
                } catch (error) {
                    console.error("Lỗi khi lấy tin nhắn chưa đọc:", error);
                    setUnreadMessagesCount(0);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu sidebar:", error);
            }
        };

        fetchData();
        
        // Refresh mỗi 30 giây
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [userRole]);

    // Tạo menu items động với badges
    const menuItems = [
        { id: "home", title: "Trang chủ", icon: Home },
        { 
            id: "bookings", 
            title: "Buổi chụp", 
            icon: Calendar, 
            badge: bookingsCount > 0 ? bookingsCount.toString() : undefined 
        },
        {
            id: "messages",
            title: "Tin nhắn",
            icon: MessageCircle,
            badge: unreadMessagesCount > 0 ? unreadMessagesCount.toString() : undefined,
            badgeColor: "bg-red-500",
        },
        { id: "profile", title: "Hồ sơ", icon: User },
    ];

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon" className="border-r">
                <SidebarHeader className="p-0">
                    <SidebarBrand />
                    <SidebarUserInfo userRole={userRole} />
                </SidebarHeader>

                <SidebarContent className="px-2">
                    {/* Main Navigation */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const isActive = currentView === item.id;
                                    return (
                                        <SidebarMenuItem
                                            key={item.id}
                                            className={`sidebar-menu-item ${
                                                isActive ? "active" : ""
                                            }`}
                                        >
                                            <div
                                                onClick={() =>
                                                    onNavigate(item.id)
                                                }
                                                className="cursor-pointer relative z-10"
                                            >
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    tooltip={item.title}
                                                    className="relative w-full group"
                                                >
                                                    <item.icon
                                                        className={`transition-transform duration-200 ${
                                                            state === "expanded"
                                                                ? "h-5 w-5"
                                                                : "h-6 w-6 group-hover:scale-125"
                                                        }`}
                                                    />
                                                    {state === "expanded" && (
                                                        <span className="sidebar-menu-text">
                                                            {item.title}
                                                        </span>
                                                    )}
                                                    {item.badge && (
                                                        <SidebarMenuBadge
                                                            className={`sidebar-menu-badge ${
                                                                item.badgeColor ||
                                                                "bg-primary text-primary-foreground"
                                                            } text-xs`}
                                                        >
                                                            {item.badge}
                                                        </SidebarMenuBadge>
                                                    )}
                                                </SidebarMenuButton>
                                            </div>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Settings Section */}
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {settingsItems.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <div
                                            onClick={() => {
                                                if (item.id === "logout") {
                                                    if (onLogout)
                                                        onLogout(); // ✅ gọi callback thật sự
                                                    else
                                                        onNavigate("logout"); // fallback
                                                } else {
                                                    onNavigate(item.id);
                                                }
                                            }}
                                            className="cursor-pointer relative z-10"
                                        >
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                className={`group ${
                                                    item.variant ===
                                                    "destructive"
                                                        ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        : ""
                                                }`}
                                            >
                                                <item.icon
                                                    className={`transition-transform duration-200 ${
                                                        state === "expanded"
                                                            ? "h-5 w-5"
                                                            : "h-6 w-6 group-hover:scale-125"
                                                    }`}
                                                />
                                                {state === "expanded" && (
                                                    <span>{item.title}</span>
                                                )}
                                            </SidebarMenuButton>
                                        </div>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t">
                    {state === "expanded" && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                            <div className="opacity-70">Momentia</div>
                        </div>
                    )}
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}
