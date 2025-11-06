    // resources/src/components/photographer/BookingDetail.tsx
    import React, { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { Button } from "../ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
    import { Badge } from "../ui/badge";
    import { Separator } from "../ui/separator";
    import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    } from "../ui/dialog";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "../ui/select";
    import { Input } from "../ui/input";
    import {
    ArrowLeft,
    MapPin,
    Calendar,
    Clock,
    Camera,
    User,
    MessageCircle,
    Phone,
    Edit3,
    Star,
    Heart,
    Share2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Image as ImageIcon,
    DollarSign,
    Upload,
    FileX,
    } from "lucide-react";
    interface BookingDetailProps {
        onBack: () => void;
    }

    export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BookingImage {
  type: "raw" | "edited";
  url: string;
}

export interface BookingCustomer {
  name: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
}

export interface BookingDetailData {
  id: string;
  status: BookingStatus;
  title: string;
  customer: BookingCustomer;
  type: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  price: number;
  description: string | null;
  duration: string;
  guestCount: string;
  specialRequests: string | null;
  uploadedRaw: boolean;
  uploadedEdited: boolean;
  images: BookingImage[];
  createdAt: string;
  depositRate: number;
  cancelReason: string | null;
  changeReason: string | null;
}

    export function BookingDetail({ onBack }: BookingDetailProps) {
        // Mock data cho booking detail
        const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GỌI API – SỬA ĐÚNG URL + DỮ LIỆU
 useEffect(() => {
  const fetchBooking = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const url = `http://127.0.0.1:8000/api/buoi-chup/${id}`;
      console.log("GỌI API:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        console.error("HTML LỖI:", text.substring(0, 300));
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("DỮ LIỆU TỪ BE (chi tiết):", JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.message || "Lỗi từ server");
      }

      const bookingData = result.data;
      console.log("DỮ LIỆU THẬT (result.data):", JSON.stringify(bookingData, null, 2));

      setBooking(bookingData);
      console.log("ĐÃ SET BOOKING THÀNH CÔNG");
    } catch (err: any) {
      console.error("LỖI:", err);
      setError(err.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  fetchBooking();
}, [id]);

  // Status config
  const getStatusInfo = (status: BookingStatus) => {
    const config = {
      confirmed: {
        label: "Đã xác nhận",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        icon: CheckCircle,
      },
      pending: {
        label: "Đang chờ xác nhận",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: AlertCircle,
      },
      completed: {
        label: "Hoàn thành",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: XCircle,
      },
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">{error || "Không tìm thấy buổi chụp"}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  // Lấy ảnh đầu tiên làm ảnh bìa (ưu tiên edited > raw)
  const coverImage = booking.images.find(img => img.type === "edited")?.url
    || booking.images.find(img => img.type === "raw")?.url
    || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop";

        return (
                <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="bg-card border-b p-4 text-black dark:text-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>


                        <div className="flex-1">
                            <h1 className="font-medium flex items-center gap-1">
                                Chi tiết buổi chụp
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                #{booking.id}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-6 pb-24">
                    {/* Ảnh và thông tin chính */}
                    <Card className="overflow-hidden shadow-lg">
                        <div className="relative h-48 bg-gradient-to-br from-sky-100 to-cyan-100">
                            <img
                                src={coverImage}
                                alt={booking.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-white mb-2">{booking.title}</h2>
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor}`}
                                >
                                    <StatusIcon
                                        className={`w-4 h-4 ${statusInfo.textColor}`}
                                    />
                                    <span
                                        className={`text-sm font-medium ${statusInfo.textColor}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Thông tin cơ bản */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Thông tin buổi chụp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Ngày tạo</p>
                                    <p className="text-sm text-muted-foreground">
                                    {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Ngày chụp</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                booking.date
                                            ).toLocaleDateString("vi-VN", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Thời gian</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.time}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Thời lượng: {booking.duration}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Địa điểm</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Camera className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Loại chụp</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge
                                                variant="outline"
                                                className="border-primary text-primary"
                                            >
                                                {booking.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            Số lượng ảnh dự kiến
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.guestCount} người
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin nhiếp ảnh gia */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Nhiếp ảnh gia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        // src={booking.photographer.avatar}
                                        // alt={booking.photographer.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold">
                                        {/* {booking.photo} */}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        {/* <span>{booking.photographer.rating}</span> */}
                                        <span>•</span>
                                        <span>
                                            {/* {booking.photographer.completedBookings}{" "} */}
                                            buổi chụp
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {/* {booking.photographer.specialties.map(
                                            (specialty) => (
                                                <Badge
                                                    key={specialty}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {specialty}
                                                </Badge>
                                            )
                                        )} */}Test data
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Nhắn tin
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Phone className="w-4 h-4" />
                                    Gọi điện
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ghi chú đặc biệt */}
                    {/* {booking.notes && ( */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit3 className="w-5 h-5 text-primary" />
                                    Ghi chú đặc biệt
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {booking.description || "Không có ghi chú"}                                </p>
                            </CardContent>
                        </Card>
                    {/* )} */}

                    {/* Thông tin thanh toán */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-xs text-white">₫</span>
                                </div>
                                Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Tổng chi phí</span>
                                <span className="font-semibold text-lg text-primary">
                                    {booking.price.toLocaleString()} VNĐ
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span>Tỷ lệ đặt cọc</span>
                                    <span className="font-medium">
                                        {booking.depositRate}%
                                    </span>
                                <Badge
                                    // variant={
                                    //     booking.paymentStatus === "paid"
                                    //         ? "default"
                                    //         : "destructive"
                                    // }
                                    // className={
                                    //     booking.paymentStatus === "paid"
                                    //         ? "bg-green-500"
                                    //         : ""
                                    // }
                                >
                                    {/* {booking.paymentStatus === "paid"
                                        ? "Đã thanh toán"
                                        : booking.paymentStatus === "pending"
                                        ? "Đang chờ"
                                        : "Chưa thanh toán"} */}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <div className="space-y-3">
                        {booking.status === "confirmed" && (
                            <Button
                                className="w-full sky-gradient text-white"
                                size="lg"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Liên hệ nhiếp ảnh gia
                            </Button>
                        )}

                        {booking.status === "pending" && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" size="lg">
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                </Button>
                                <Button variant="destructive" size="lg">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Hủy lịch
                                </Button>
                            </div>
                        )}

                        {booking.status === "completed" && (
                            <Button className="w-full" variant="outline" size="lg">
                                <Star className="w-5 h-5 mr-2" />
                                Đánh giá buổi chụp
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
