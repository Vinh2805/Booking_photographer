import { useState, useEffect } from "react";
import { Bell, Wallet, Calendar, Star, Camera, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  icon: string;
  action_url: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Lấy token từ localStorage (ưu tiên admin, rồi đến photographer, customer)
            const token = localStorage.getItem("admin_token") || localStorage.getItem("photographer_token") || localStorage.getItem("customer_token");
            
            if (!token) return;

            const response = await fetch("/api/notifications", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto load khi component mount và mỗi 60s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'wallet': return <Wallet className="w-4 h-4 text-green-500" />;
            case 'booking_request': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
            case 'activity': return <Camera className="w-4 h-4 text-purple-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5 text-black dark:text-slate-200" />
                    {notifications.length > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                        >
                            {notifications.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border">
                    <h4 className="font-semibold text-sm">Thông báo</h4>
                </div>
                <ScrollArea className="h-[300px]">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có thông báo mới
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setOpen(false);
                                        // TODO: Handle navigation here if needed
                                        // navigate(notification.action_url);
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/80">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
