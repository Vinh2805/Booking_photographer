import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { MomentiaSidebar } from "./MomentiaSidebar";
import { Separator } from "./ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ui/theme-toggle";
import { Bell, TrendingUp } from "lucide-react";

interface AppLayoutWithSidebarProps {
    children: React.ReactNode;
    onNavigate: (section: string) => void;
    onBack?: () => void;
    onLogout?: () => void; // ✅ thêm prop logout thật
    title?: string;
    breadcrumbs?: Array<{
        label: string;
        href?: string;
    }>;
    userRole?: "customer" | "photographer";
    currentView?: string;
}

export function AppLayoutWithSidebar({
    children,
    onNavigate,
    onBack,
    onLogout, // ✅ nhận prop logout thật từ CustomerApp / PhotographerApp
    title = "Trang chủ",
    breadcrumbs = [],
    userRole = "customer",
    currentView = "home",
}: AppLayoutWithSidebarProps) {
    const handleSidebarNavigation = (section: string) => {
        console.log("Sidebar navigation:", section);

        switch (section) {
            case "home":
                onNavigate("home");
                break;
            case "bookings":
                onNavigate("bookings");
                break;
            case "messages":
                onNavigate("messages");
                break;
            case "profile":
                onNavigate("profile");
                break;
            case "settings":
                onNavigate("settings");
                break;
            case "wallet":
                onNavigate("profile");
                break;
            case "logout":
                // ✅ gọi đúng hàm onLogout được truyền từ trên xuống
                if (onLogout) {
                    onLogout();
                } else if (onBack) {
                    onBack();
                }
                break;
            default:
                onNavigate(section);
                break;
        }
    };

    return (
        <SidebarProvider>
            <MomentiaSidebar
                onNavigate={handleSidebarNavigation}
                userRole={userRole}
                currentView={currentView}
                onLogout={onLogout} // ✅ truyền prop thật xuống Sidebar
            />

            <SidebarInset>
                {/* Header */}
                <header className="bg-card border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1 text-black dark:text-slate-200" />
                            <Separator orientation="vertical" className="h-4" />

                            <div className="flex items-center gap-4 text-black dark:text-slate-200">
                                <h2 className="text-xl font-semibold">
                                    {title}
                                </h2>

                                {title === "Trang chủ" &&
                                    userRole === "customer" && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                            Khám phá nhiếp ảnh gia mới
                                        </Badge>
                                    )}

                                {title === "Tổng quan" &&
                                    userRole === "photographer" && (
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                            +15% so với tuần trước
                                        </Badge>
                                    )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative"
                            >
                                <Bell className="w-5 h-5 text-black dark:text-slate-200" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                                >
                                    {userRole === "photographer" ? "12" : "5"}
                                </Badge>
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>

                    {breadcrumbs.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink
                                            href="#"
                                            onClick={onBack}
                                        >
                                            Momentia
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>

                                    {breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={index}>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                {crumb.href ? (
                                                    <BreadcrumbLink
                                                        href={crumb.href}
                                                    >
                                                        {crumb.label}
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>
                                                        {crumb.label}
                                                    </BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                        </React.Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
