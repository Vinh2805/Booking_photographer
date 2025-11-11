    // resources/src/components/photographer/BookingDetail.tsx
    import React, { useEffect, useState } from "react";
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
    DialogFooter,
    } from "../ui/dialog";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "../ui/select";
    import { Input } from "../ui/input";
    import { Textarea } from "../ui/textarea";
    import { Label } from "../ui/label";
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
    PlayCircle,
    StopCircle,
    Loader,
    } from "lucide-react";
    import apiClient from "../services/apiClient";
    import { confirmBooking, rejectBooking, startBooking, endBooking } from "../services/BookingAPI";
    import { uploadPhoto } from "../services/PhotoAPI";
    import { toast } from "sonner";

    interface BookingDetailProps {
        bookingId: string;
        onBack: () => void;
    }

    export type BookingStatus = 
      | "pending_confirmation"
      | "pending_deposit"
      | "upcoming"
      | "ongoing"
      | "pending_payment"
      | "pending_processing"
      | "processed"
      | "completed"
      | "cancelled";

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

    export function BookingDetail({ bookingId, onBack }: BookingDetailProps) {
        const [booking, setBooking] = useState<BookingDetailData | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [uploadType, setUploadType] = useState<"raw" | "edited">("raw");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // GỌI API – SỬA ĐÚNG URL + DỮ LIỆU
 useEffect(() => {
  const fetchBooking = async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/buoi-chup/${bookingId}`);
      console.log("DỮ LIỆU TỪ BE (chi tiết):", JSON.stringify(response.data, null, 2));

      if (!response.data.success) {
        throw new Error(response.data.message || "Lỗi từ server");
      }

      const bookingData = response.data.data;
      console.log("DỮ LIỆU THẬT (result.data):", JSON.stringify(bookingData, null, 2));

      setBooking(bookingData);
      console.log("ĐÃ SET BOOKING THÀNH CÔNG");
    } catch (err: any) {
      console.error("LỖI:", err);
      setError(err.response?.data?.message || err.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  fetchBooking();
}, [bookingId]);

  // Refresh booking after action
  const refreshBooking = async () => {
    if (!bookingId) return;
    try {
      const response = await apiClient.get(`/buoi-chup/${bookingId}`);
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi refresh booking:", error);
    }
  };

  // Status config
  const getStatusInfo = (status: BookingStatus) => {
    const config: Record<BookingStatus, { label: string; bgColor: string; textColor: string; icon: any }> = {
      pending_confirmation: {
        label: "Chờ xác nhận",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: AlertCircle,
      },
      pending_deposit: {
        label: "Chờ đặt cọc",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        icon: DollarSign,
      },
      upcoming: {
        label: "Sắp diễn ra",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: Calendar,
      },
      ongoing: {
        label: "Đang diễn ra",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        icon: Camera,
      },
      pending_payment: {
        label: "Chờ thanh toán",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        icon: DollarSign,
      },
      pending_processing: {
        label: "Chờ xử lý ảnh",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-700",
        icon: ImageIcon,
      },
      processed: {
        label: "Đã xử lý ảnh",
        bgColor: "bg-teal-50",
        textColor: "text-teal-700",
        icon: CheckCircle,
      },
      completed: {
        label: "Đã hoàn thành",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: XCircle,
      },
    };
    return config[status] || config.pending_confirmation;
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
                                            Số người
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.guestCount || "Chưa cập nhật"} người
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin khách hàng */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={booking.customer.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face"}
                                        alt={booking.customer.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold">
                                        {booking.customer.name}
                                    </h3>
                                    {booking.customer.email && (
                                        <p className="text-sm text-muted-foreground mb-1">
                                            {booking.customer.email}
                                        </p>
                                    )}
                                    {booking.customer.phone && (
                                        <p className="text-sm text-muted-foreground">
                                            {booking.customer.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Nhắn tin
                                </Button>
                                {booking.customer.phone && (
                                    <Button variant="outline" className="gap-2" asChild>
                                        <a href={`tel:${booking.customer.phone}`}>
                                            <Phone className="w-4 h-4" />
                                            Gọi điện
                                        </a>
                                    </Button>
                                )}
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
                        {booking.status === "pending_confirmation" && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    size="lg"
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        if (!bookingId) return;
                                        setIsProcessing(true);
                                        try {
                                            const response = await confirmBooking(bookingId);
                                            const successMessage = response.message || "Xác nhận thành công!";
                                            console.log("✅ Confirm booking success:", successMessage);
                                            toast.success(successMessage, {
                                                duration: 5000,
                                            });
                                            await refreshBooking();
                                        } catch (error: any) {
                                            const errorMessage = error.response?.data?.message || "Lỗi khi xác nhận";
                                            console.error("❌ Confirm booking error:", error);
                                            toast.error(errorMessage, {
                                                duration: 5000,
                                            });
                                        } finally {
                                            setIsProcessing(false);
                                        }
                                    }}
                                >
                                    {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    Xác nhận
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    disabled={isProcessing}
                                    onClick={() => setShowRejectDialog(true)}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Từ chối
                                </Button>
                            </div>
                        )}

                        {booking.status === "upcoming" && (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                size="lg"
                                disabled={isProcessing}
                                onClick={async () => {
                                    if (!bookingId) return;
                                    setIsProcessing(true);
                                    try {
                                        const response = await startBooking(bookingId);
                                        if (response.success) {
                                            const successMessage = "Bắt đầu buổi chụp thành công!";
                                            console.log("✅ Start booking success:", successMessage);
                                            toast.success(successMessage, {
                                                duration: 5000,
                                            });
                                            await refreshBooking();
                                        } else {
                                            const errorMessage = response.message || "Lỗi khi bắt đầu buổi chụp";
                                            console.error("❌ Start booking error:", errorMessage);
                                            toast.error(errorMessage, {
                                                duration: 5000,
                                            });
                                        }
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.message || "Lỗi khi bắt đầu buổi chụp";
                                        console.error("❌ Start booking error:", error);
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                                Bắt đầu buổi chụp
                            </Button>
                        )}

                        {booking.status === "ongoing" && (
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                size="lg"
                                disabled={isProcessing}
                                onClick={async () => {
                                    if (!bookingId) return;
                                    setIsProcessing(true);
                                    try {
                                        const response = await endBooking(bookingId);
                                        if (response.success) {
                                            const successMessage = "Kết thúc buổi chụp thành công!";
                                            console.log("✅ End booking success:", successMessage);
                                            toast.success(successMessage, {
                                                duration: 5000,
                                            });
                                            await refreshBooking();
                                        } else {
                                            const errorMessage = response.message || "Lỗi khi kết thúc buổi chụp";
                                            console.error("❌ End booking error:", errorMessage);
                                            toast.error(errorMessage, {
                                                duration: 5000,
                                            });
                                        }
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.message || "Lỗi khi kết thúc buổi chụp";
                                        console.error("❌ End booking error:", error);
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <StopCircle className="w-4 h-4 mr-2" />}
                                Kết thúc buổi chụp
                            </Button>
                        )}

                        {booking.status === "pending_processing" && (
                            <div className="space-y-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => {
                                        setUploadType("raw");
                                        setShowUploadDialog(true);
                                    }}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload ảnh gốc
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                    onClick={() => {
                                        setUploadType("edited");
                                        setShowUploadDialog(true);
                                    }}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload ảnh hậu kỳ
                                </Button>
                            </div>
                        )}

                        {booking.status === "processed" && (
                            <Button className="w-full" variant="outline" size="lg" disabled>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Đã hoàn thành xử lý ảnh
                            </Button>
                        )}
                    </div>
                </div>

                {/* Reject Dialog */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Từ chối buổi chụp</DialogTitle>
                            <DialogDescription>
                                Vui lòng nhập lý do từ chối buổi chụp này
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="reject-reason">Lý do từ chối</Label>
                                <Textarea
                                    id="reject-reason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!rejectReason.trim() || isProcessing}
                                onClick={async () => {
                                    if (!bookingId || !rejectReason.trim()) return;
                                    setIsProcessing(true);
                                    try {
                                        const response = await rejectBooking(bookingId, { ly_do: rejectReason });
                                        const successMessage = response.message || "Từ chối thành công!";
                                        console.log("✅ Reject booking success:", successMessage);
                                        toast.success(successMessage, {
                                            duration: 5000,
                                        });
                                        setShowRejectDialog(false);
                                        setRejectReason("");
                                        await refreshBooking();
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.message || "Lỗi khi từ chối";
                                        console.error("❌ Reject booking error:", error);
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Xác nhận từ chối
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Upload Photo Dialog */}
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload {uploadType === "raw" ? "ảnh gốc" : "ảnh hậu kỳ"}</DialogTitle>
                            <DialogDescription>
                                Vui lòng chọn file ZIP chứa ảnh để upload (tối đa 1GB)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Loại ảnh</Label>
                                <Select value={uploadType} onValueChange={(v) => setUploadType(v as "raw" | "edited")}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="raw">Ảnh gốc</SelectItem>
                                        <SelectItem value="edited">Ảnh hậu kỳ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>File ZIP</Label>
                                <Input
                                    type="file"
                                    accept=".zip"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 1024 * 1024 * 1024) {
                                                const errorMessage = "File quá lớn! Tối đa 1GB";
                                                console.error("❌ Upload error:", errorMessage);
                                                toast.error(errorMessage, {
                                                    duration: 5000,
                                                });
                                                return;
                                            }
                                            setUploadFile(file);
                                        }
                                    }}
                                />
                                {uploadFile && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Đã chọn: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Mô tả (tùy chọn)</Label>
                                <Textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    placeholder="Nhập mô tả..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setShowUploadDialog(false);
                                setUploadFile(null);
                                setUploadDescription("");
                            }}>
                                Hủy
                            </Button>
                            <Button
                                disabled={!uploadFile || isProcessing}
                                onClick={async () => {
                                    if (!bookingId || !uploadFile) return;
                                    setIsProcessing(true);
                                    try {
                                        const response = await uploadPhoto(uploadType, bookingId, {
                                            file: uploadFile,
                                            description: uploadDescription || undefined,
                                        });
                                        const successMessage = response.message || "Upload thành công!";
                                        console.log("✅ Upload photo success:", successMessage);
                                        toast.success(successMessage, {
                                            duration: 5000,
                                        });
                                        setShowUploadDialog(false);
                                        setUploadFile(null);
                                        setUploadDescription("");
                                        await refreshBooking();
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.message || "Lỗi khi upload";
                                        console.error("❌ Upload photo error:", error);
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
