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

interface MomentiaSidebarProps {
    onNavigate: (section: string) => void;
    userRole?: "customer" | "photographer";
    currentView?: string;
}

const customerMenuItems = [
    { id: "home", title: "Trang chủ", icon: Home },
    { id: "bookings", title: "Buổi chụp", icon: Calendar, badge: "3" },
    {
        id: "messages",
        title: "Tin nhắn",
        icon: MessageCircle,
        badge: "5",
        badgeColor: "bg-red-500",
    },
    { id: "profile", title: "Hồ sơ", icon: User },
];

const photographerMenuItems = [
    { id: "home", title: "Trang chủ", icon: Home },
    { id: "bookings", title: "Buổi chụp", icon: Calendar, badge: "8" },
    {
        id: "messages",
        title: "Tin nhắn",
        icon: MessageCircle,
        badge: "12",
        badgeColor: "bg-red-500",
    },
    { id: "profile", title: "Hồ sơ", icon: User },
];

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

    const userData =
        userRole === "photographer"
            ? {
                  name: "Minh Tuấn",
                  role: "Nhiếp ảnh gia",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                  fallback: "MT",
              }
            : {
                  name: "Nguyễn Thị Hương",
                  role: "Khách hàng",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                  fallback: "NTH",
              };

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
    userRole = "customer",
    currentView = "home",
}: MomentiaSidebarProps) {
    const { state } = useSidebar();
    const menuItems =
        userRole === "photographer" ? photographerMenuItems : customerMenuItems;

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
                                            onClick={() => onNavigate(item.id)}
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
