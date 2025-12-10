import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "../ui/separator";
import { ThemeToggle } from "../ui/theme-toggle";
import { NotificationDropdown } from "../NotificationDropdown";

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onNavigate: (tab: any) => void;
    onLogout: () => void;
    title?: string;
}

export function AdminLayout({
    children,
    activeTab,
    onNavigate,
    onLogout,
    title = "Dashboard",
}: AdminLayoutProps) {
    return (
        <SidebarProvider>
            <AdminSidebar
                currentTab={activeTab}
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <SidebarInset className="bg-slate-50 dark:bg-slate-900">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" />
                            <Separator orientation="vertical" className="h-4 bg-slate-300 dark:bg-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                {title}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
