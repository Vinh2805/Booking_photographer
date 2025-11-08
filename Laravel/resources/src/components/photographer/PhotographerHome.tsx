import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import apiClient from "../services/apiClient";

import {
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
  Camera,
  MessageCircle,
  Upload,
  Eye,
  Heart,
  Share2,
  Award,
  MapPin,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";

interface PhotographerHomeProps {
  onNavigate: (view: any) => void;
  user?: any;
}

export function PhotographerHome({ onNavigate, user }: PhotographerHomeProps) {
  // ---------------- STATE ----------------
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [stats, setStats] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD DATA FROM API ----------------
  useEffect(() => {
    if (!user?.Ma_TK) return;

    const fetchData = async () => {
      try {
        // Gọi API song song
        const [dashboardRes, bookingsRes] = await Promise.all([
          apiClient.get(`/photographer/dashboard/${user.Ma_TK}`),
          apiClient.get(`/photographer/${user.Ma_TK}/bookings`),
        ]);

        setStats(dashboardRes.data);
        setUpcomingBookings(bookingsRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu photographer dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  // ---------------- SAFE DEFAULT ----------------
  const currentStats = {
    bookings: stats?.bookings ?? 0,
    revenue: stats?.revenue ?? 0,
    rating: stats?.rating ?? 0,
    newClients: stats?.newClients ?? 0,
  };

  // ---------------- QUICK ACTIONS ----------------
  const quickActions = [
    {
      title: "Tải ảnh mới",
      description: "Upload ảnh từ buổi chụp gần nhất",
      icon: Upload,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      action: () => {},
    },
    {
      title: "Cập nhật lịch",
      description: "Thêm/chỉnh sửa lịch trống",
      icon: Calendar,
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      action: () => onNavigate("bookings"),
    },
    {
      title: "Phản hồi tin nhắn",
      description: `${stats?.unreadMessages ?? 0} tin nhắn chưa đọc`,
      icon: MessageCircle,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      action: () => onNavigate("messages"),
    },
  ];

  // ---------------- ACHIEVEMENTS ----------------
  const achievements = [
    {
      title: "Top Photographer",
      description: "Top 5% nhiếp ảnh gia xuất sắc tháng này",
      icon: Award,
      color: "text-yellow-600",
    },
    {
      title: "Khách hàng trung thành",
      description: "85% khách hàng quay lại sử dụng dịch vụ",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "Phản hồi nhanh",
      description: "Thời gian phản hồi trung bình < 30 phút",
      icon: Zap,
      color: "text-blue-600",
    },
  ];

  // ---------------- RENDER ----------------
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-black dark:text-slate-200">
              Chào buổi sáng,{" "}
              <span className="text-blue-600">{user?.Ho_Ten}</span> ☀️
            </h1>
            <p className="text-muted-foreground mb-4">
              Bạn có {stats?.bookings ?? 0} buổi chụp và{" "}
              {stats?.unreadMessages ?? 0} tin nhắn mới
            </p>
            <div className="flex gap-3">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => onNavigate("bookings")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Xem lịch hôm nay
              </Button>
              <Button variant="outline" onClick={() => onNavigate("messages")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Phản hồi tin nhắn
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={action.action}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-slate-200">
            Tổng quan hoạt động
          </h2>
          <div className="flex gap-2">
            <Button
              variant={timeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("week")}
            >
              Tuần
            </Button>
            <Button
              variant={timeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("month")}
            >
              Tháng
            </Button>
            <Button
              variant={timeframe === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("year")}
            >
              Năm
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Booking count */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentStats.bookings}</p>
                  <p className="text-sm text-muted-foreground">Booking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {((currentStats.revenue || 0) / 1000000).toFixed(1)}M₫
                  </p>
                  <p className="text-sm text-muted-foreground">Thu nhập</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentStats.rating}</p>
                  <p className="text-sm text-muted-foreground">Đánh giá</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New clients */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentStats.newClients}</p>
                  <p className="text-sm text-muted-foreground">Khách mới</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lịch sắp tới</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("bookings")}
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((b) => (
              <div
                key={b.Ma_BC || b.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {b.Ten_Buoi_Chup || b.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {b.Ngay_Chup} • {b.Dia_Diem}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {b.Thoi_Gian_Bat_Dau || "—"}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      b.Trang_Thai === "Đã xác nhận" ? "default" : "secondary"
                    }
                  >
                    {b.Trang_Thai}
                  </Badge>
                  {b.So_Tien && (
                    <p className="text-sm font-medium mt-1">
                      {Number(b.So_Tien).toLocaleString()}₫
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Không có buổi chụp sắp tới
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Thành tích & Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((a, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <a.icon className={`w-8 h-8 ${a.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Goals (giữ nguyên cứng) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mục tiêu tháng này
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Booking (45/50)</span>
              <span>90%</span>
            </div>
            <Progress value={90} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Thu nhập (32.5M/35M)</span>
              <span>93%</span>
            </div>
            <Progress value={93} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Đánh giá 5 sao (38/45)</span>
              <span>84%</span>
            </div>
            <Progress value={84} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
