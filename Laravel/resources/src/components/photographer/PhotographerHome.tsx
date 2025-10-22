import React, { useMemo, useState } from "react";
import { motion } from "motion/react";

/* UI (shadcn/ui) */
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../ui/popover";
import { Calendar as CalendarUI } from "../ui/calendar";

/* utils */
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/* misc */
import { ImageWithFallback } from "../figma/ImageWithFallback";

/* icons */
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Clock,
  Upload,
  Eye,
  Heart,
  Share2,
  Award,
  MapPin,
  ChevronRight,
  Target,
  Camera,
  X,
  Plus,
  Trash2,
} from "lucide-react";

interface PhotographerHomeProps {
  onNavigate: (view: string) => void;
}

type DateRange = { from?: Date; to?: Date };

export function PhotographerHome({
  onNavigate,
}: PhotographerHomeProps) {
  /* ---------- STATES ---------- */
  const [timeframe, setTimeframe] = useState<
    "week" | "month" | "year"
  >("month");

  // NHIỀU khoảng ngày rảnh
  const [ranges, setRanges] = useState<DateRange[]>([]);
  // khoảng ngày tạm thời đang chọn trong popover
  const [draftRange, setDraftRange] = useState<DateRange>({});

  const canAddDraft = useMemo(
    () => !!draftRange.from && !!draftRange.to,
    [draftRange],
  );

  const addDraftToRanges = () => {
    if (!canAddDraft || !draftRange.from || !draftRange.to)
      return;
    // Chuẩn hóa: from <= to
    const from =
      draftRange.from.getTime() <= draftRange.to.getTime()
        ? draftRange.from
        : draftRange.to;
    const to =
      draftRange.to.getTime() >= draftRange.from.getTime()
        ? draftRange.to
        : draftRange.from;

    setRanges((prev) => [...prev, { from, to }]);
    setDraftRange({});
  };

  const removeRange = (idx: number) => {
    setRanges((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAllRanges = () => {
    setRanges([]);
    setDraftRange({});
  };

  const handleSaveAvailability = () => {
    // TODO: gọi API lưu ranges
    console.log(
      "Availability ranges:",
      ranges.map((r) => ({
        from: r.from?.toISOString().slice(0, 10),
        to: r.to?.toISOString().slice(0, 10),
      })),
    );
  };

  /* ---------- MOCK DATA ---------- */
  const stats = {
    week: {
      bookings: 12,
      revenue: 8_500_000,
      rating: 4.9,
      newClients: 8,
    },
    month: {
      bookings: 45,
      revenue: 32_500_000,
      rating: 4.9,
      newClients: 28,
    },
    year: {
      bookings: 340,
      revenue: 285_000_000,
      rating: 4.9,
      newClients: 180,
    },
  };
  const currentStats = stats[timeframe];

  const upcomingBookings = [
    {
      id: 1,
      clientName: "Nguyễn Thị Hương",
      clientAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=40&h=40&fit=crop&crop=face",
      date: "2025-01-20",
      time: "14:00",
      type: "Chụp gia đình",
      location: "Công viên Tao Đàn, Quận 1",
      price: 1_200_000,
      status: "confirmed",
    },
    {
      id: 2,
      clientName: "Trần Văn Minh",
      clientAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      date: "2025-01-22",
      time: "09:00",
      type: "Chụp cưới",
      location: "Nhà thờ Đức Bà, Quận 1",
      price: 2_500_000,
      status: "pending",
    },
    {
      id: 3,
      clientName: "Lê Thị Mai",
      clientAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      date: "2025-01-25",
      time: "16:00",
      type: "Chụp chân dung",
      location: "Studio, Quận 3",
      price: 800_000,
      status: "confirmed",
    },
  ];

  const recentPhotos = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop&crop=center",
      title: "Ảnh cưới Hương & Minh",
      date: "2025-01-15",
      likes: 45,
      views: 234,
      bookingId: "BK001",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=300&h=200&fit=crop&crop=center",
      title: "Ảnh gia đình Trần",
      date: "2025-01-12",
      likes: 32,
      views: 187,
      bookingId: "BK002",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop&crop=center",
      title: "Event công ty ABC",
      date: "2025-01-10",
      likes: 28,
      views: 156,
      bookingId: "BK003",
    },
  ];

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
      icon: Camera,
      color: "text-blue-600",
    },
  ];

  /* ---------- HELPERS ---------- */
  const fmtRange = (r: DateRange) =>
    r.from && r.to
      ? `${format(r.from, "dd/MM/yyyy", { locale: vi })} → ${format(
          r.to,
          "dd/MM/yyyy",
          {
            locale: vi,
          },
        )}`
      : "Chưa chọn";

  /* ---------- RENDER ---------- */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Chào buổi sáng,{" "}
              <span className="text-blue-600">Minh Tuấn</span>!
              ☀️
            </h1>
            <p className="text-muted-foreground mb-4">
              Bạn có 3 buổi chụp trong tuần này và 7 tin nhắn
              mới
            </p>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Xem lịch hôm nay
              </Button>
              <Button variant="outline">
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

      {/* CHỌN LỊCH RẢNH: Nhiều khoảng ngày */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-dashed border-pink-200 dark:border-pink-700 bg-white dark:bg-slate-800">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Chọn lịch rảnh
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Thêm <b>nhiều khoảng ngày</b> bạn nhận
                    booking
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearAllRanges}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
                <Button
                  onClick={handleSaveAvailability}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Lưu cấu hình
                </Button>
              </div>
            </div>

            {/* Trigger + Popover Calendar */}
            <div className="flex flex-col md:flex-row gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start w-full md:w-96"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {canAddDraft
                      ? fmtRange(draftRange)
                      : "Chọn khoảng ngày"}
                  </Button>
                </PopoverTrigger>

                {/* FIX hiển thị: z-50, sideOffset, align-start */}
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className="z-50 p-2 w-auto"
                >
                  <div className="p-2">
                    <CalendarUI
                      mode="range"
                      numberOfMonths={2}
                      selected={draftRange}
                      defaultMonth={draftRange.from}
                      onSelect={(
                        range: DateRange | undefined,
                      ) => setDraftRange(range ?? {})}
                      locale={vi}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDraftRange({})}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Xóa chọn
                      </Button>
                      <Button
                        size="sm"
                        onClick={addDraftToRanges}
                        disabled={!canAddDraft}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm khoảng
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Danh sách khoảng ngày đã thêm */}
              <div className="flex-1 min-h-[44px] flex flex-wrap gap-2 items-center">
                {ranges.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Chưa có khoảng ngày nào. Hãy bấm “Chọn
                    khoảng ngày” để thêm.
                  </span>
                ) : (
                  ranges.map((r, i) => (
                    <span
                      key={`${r.from?.toISOString()}-${r.to?.toISOString()}-${i}`}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-accent/50"
                    >
                      {fmtRange(r)}
                      <button
                        aria-label="Xoá khoảng"
                        className="hover:text-red-600"
                        onClick={() => removeRange(i)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Gợi ý trạng thái */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
              {ranges.length > 0 ? (
                <span>
                  Sẽ nhận booking trong <b>{ranges.length}</b>{" "}
                  khoảng ngày đã chọn.
                </span>
              ) : (
                <span>
                  Chưa chọn khoảng ngày. Hãy thêm ít nhất một
                  khoảng.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Tổng quan hoạt động
          </h2>
          <div className="flex gap-2">
            <Button
              variant={
                timeframe === "week" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setTimeframe("week")}
            >
              Tuần
            </Button>
            <Button
              variant={
                timeframe === "month" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setTimeframe("month")}
            >
              Tháng
            </Button>
            <Button
              variant={
                timeframe === "year" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setTimeframe("year")}
            >
              Năm
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentStats.bookings}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Booking
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +12%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(currentStats.revenue / 1_000_000).toFixed(
                      1,
                    )}
                    M₫
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thu nhập
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +18%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentStats.rating}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Đánh giá
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +0.1
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {currentStats.newClients}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Khách mới
                  </p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="w-3 h-3" />
                    +25%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
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
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
              >
                <ImageWithFallback
                  src={booking.clientAvatar}
                  alt={booking.clientName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {booking.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.type}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {booking.date} • {booking.time}
                    <MapPin className="w-3 h-3 ml-1" />
                    {booking.location.split(",")[0]}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Chờ xác nhận"}
                  </Badge>
                  <p className="text-sm font-medium mt-1">
                    {booking.price.toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ảnh gần đây</span>
              <Button variant="ghost" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Tải lên
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
              >
                <ImageWithFallback
                  src={photo.image}
                  alt={photo.title}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {photo.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {photo.date}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {photo.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {photo.views}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Thành tích & Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <achievement.icon
                    className={`w-8 h-8 ${achievement.color}`}
                  />
                </div>
                <h3 className="font-semibold mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Goals */}
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