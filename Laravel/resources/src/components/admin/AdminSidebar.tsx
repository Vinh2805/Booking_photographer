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
    useSidebar,
} from "../ui/sidebar";
import {
    BarChart3,
    Users,
    Camera,
    Calendar,
    Settings,
    LogOut,
    Shield,
    Wallet,
    MessageCircle,
    Layers
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { TooltipProvider } from "../ui/tooltip";

interface AdminSidebarProps {
    onNavigate: (section: any) => void;
    onLogout?: () => void;
    currentTab?: string;
}

export function AdminSidebar({
    onNavigate,
    onLogout,
    currentTab = "dashboard",
}: AdminSidebarProps) {
    const { state } = useSidebar();

    const menuItems = [
        { id: "dashboard", title: "Tổng quan", icon: BarChart3 },
        { id: "customers", title: "Khách hàng", icon: Users },
        { id: "photographers", title: "Nhiếp ảnh gia", icon: Camera },
        { id: "bookings", title: "Buổi chụp", icon: Calendar },
        { id: "chat", title: "Hỗ trợ", icon: MessageCircle },
        { id: "wallet", title: "Ví cá nhân", icon: Wallet },
        { id: "services", title: "Dịch vụ", icon: Layers },
        { id: "settings", title: "Cài đặt", icon: Settings },
    ];

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon" className="border-r bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SidebarHeader className="p-0 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 px-4 py-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        {state === "expanded" && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Admin Panel
                                </span>
                            </div>
                        )}
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-2 py-4">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const isActive = currentTab === item.id;
                                    return (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                onClick={() => onNavigate(item.id)}
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`w-full justify-start gap-3 px-3 py-2 transition-all duration-200 ${isActive
                                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                                                {state === "expanded" && (
                                                    <span>{item.title}</span>
                                                )}
                                                {isActive && state === "expanded" && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup className="mt-auto">
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={onLogout}
                                        tooltip="Đăng xuất"
                                        className="w-full justify-start gap-3 px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        {state === "expanded" && (
                                            <span>Đăng xuất</span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-indigo-100">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700">AD</AvatarFallback>
                        </Avatar>
                        {state === "expanded" && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                    Administrator
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    admin@momentia.com
                                </span>
                            </div>
                        )}
                    </div>
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}
