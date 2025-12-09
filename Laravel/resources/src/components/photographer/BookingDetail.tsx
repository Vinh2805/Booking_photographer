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
    Edit3,
    Heart,
    Share2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Image as ImageIcon,
    DollarSign,
    Upload,
    PlayCircle,
    StopCircle,
    Loader,
    } from "lucide-react";
import apiClient from "../services/apiClient";
import { confirmBooking, rejectBooking, startBooking, endBooking, completeProcessing, requestChange, cancelBooking } from "../services/BookingAPI";
import { uploadPhoto } from "../services/PhotoAPI";
import { toast } from "sonner";

    interface BookingDetailProps {
        bookingId: string;
        onBack: () => void;
        onNavigate?: (view: string, bookingId?: string) => void;
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
  hasDeposit?: boolean;
  hasFullPayment?: boolean;
  totalPaid?: number;
  scheduledDateTime?: string;
  sessionEnded?: boolean; // Đánh dấu buổi chụp đã từng được kết thúc
  startDateTime?: string; // YYYY-MM-DD HH:mm:ss
  endTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endDateTime?: string; // YYYY-MM-DD HH:mm:ss
}

    export function BookingDetail({ bookingId, onBack, onNavigate }: BookingDetailProps) {
        const [booking, setBooking] = useState<BookingDetailData | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [uploadType, setUploadType] = useState<"raw" | "edited">("raw");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [changeRequest, setChangeRequest] = useState({
    field: "time" as "time" | "location" | "date",
    newStartTime: "",
    newEndTime: "",
    reason: ""
  });
  const [changeValidationError, setChangeValidationError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Hàm validate khoảng thời gian
  const validateTimeRange = (startTime: string, endTime: string) => {
    if (!startTime && !endTime) {
      setChangeValidationError("");
      return;
    }

    // Validate định dạng thời gian bắt đầu
    if (startTime) {
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      if (!dateTimeRegex.test(startTime)) {
        setChangeValidationError("Định dạng thời gian bắt đầu không hợp lệ. Vui lòng nhập đúng định dạng: YYYY-MM-DD HH:mm");
        return;
      }

      const [datePart, timePart] = startTime.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      if (month < 1 || month > 12 || day < 1 || day > 31 || 
          hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        setChangeValidationError("Giá trị thời gian bắt đầu không hợp lệ. Tháng: 1-12, Ngày: 1-31, Giờ: 0-23, Phút: 0-59");
        return;
      }

      const testDate = new Date(year, month - 1, day, hours, minutes);
      if (testDate.getFullYear() !== year || 
          testDate.getMonth() !== month - 1 || 
          testDate.getDate() !== day) {
        setChangeValidationError("Ngày bắt đầu không hợp lệ (ví dụ: tháng 2 chỉ có 28/29 ngày)");
        return;
      }
    }

    // Validate định dạng thời gian kết thúc
    if (endTime) {
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      if (!dateTimeRegex.test(endTime)) {
        setChangeValidationError("Định dạng thời gian kết thúc không hợp lệ. Vui lòng nhập đúng định dạng: YYYY-MM-DD HH:mm");
        return;
      }

      const [datePart, timePart] = endTime.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);

      if (month < 1 || month > 12 || day < 1 || day > 31 || 
          hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        setChangeValidationError("Giá trị thời gian kết thúc không hợp lệ. Tháng: 1-12, Ngày: 1-31, Giờ: 0-23, Phút: 0-59");
        return;
      }

      const testDate = new Date(year, month - 1, day, hours, minutes);
      if (testDate.getFullYear() !== year || 
          testDate.getMonth() !== month - 1 || 
          testDate.getDate() !== day) {
        setChangeValidationError("Ngày kết thúc không hợp lệ (ví dụ: tháng 2 chỉ có 28/29 ngày)");
        return;
      }
    }

    // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    if (startTime && endTime) {
      const startDate = new Date(startTime.replace(' ', 'T'));
      const endDate = new Date(endTime.replace(' ', 'T'));
      
      if (endDate <= startDate) {
        setChangeValidationError("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }
    }

    setChangeValidationError("");
  };

  // GỌI API – SỬA ĐÚNG URL + DỮ LIỆU
 useEffect(() => {
  const fetchBooking = async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    // Kiểm tra token trước khi gọi API
    const customerToken = localStorage.getItem("customer_token");
    const photographerToken = localStorage.getItem("photographer_token");
    const token = customerToken || photographerToken;
    
    if (!token) {
      console.warn("⚠️ Không tìm thấy token trong localStorage");
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      console.log("🔵 Đang gọi API:", `/buoi-chup/${bookingId}`);
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
      console.error("Lỗi chi tiết:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        code: err.code,
      });
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Không tải được dữ liệu";
      
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server đang chạy.";
      } else if (err.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy buổi chụp này.";
      } else if (err.response?.status === 500) {
        errorMessage = "Lỗi server. Vui lòng thử lại sau.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      // Kiểm tra token trước khi refresh
      const customerToken = localStorage.getItem("customer_token");
      const photographerToken = localStorage.getItem("photographer_token");
      const token = customerToken || photographerToken;
      
      if (!token) {
        console.warn("⚠️ Không tìm thấy token khi refresh");
        return;
      }

      const response = await apiClient.get(`/buoi-chup/${bookingId}`);
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch (error: any) {
      console.error("Lỗi khi refresh booking:", error);
      // Không set error để tránh làm gián đoạn UI
      if (error.response?.status === 401) {
        console.warn("Token đã hết hạn khi refresh");
      }
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
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  // Debug: Log trạng thái để kiểm tra
  console.log("🔍 Booking status:", booking.status);
  console.log("🔍 Booking data:", booking);
  console.log("🔍 Should show upload card?", booking.status === "pending_processing");
  console.log("🔍 Should show end button?", booking.status === "ongoing");

  // Lấy ảnh đầu tiên làm ảnh bìa (ưu tiên edited > raw)
  const coverImage = booking.images.find(img => img.type === "edited")?.url
    || booking.images.find(img => img.type === "raw")?.url
    || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop";

        return (
                <div className="flex flex-col h-screen bg-background">
      <div className="bg-card border-b p-4 text-black dark:text-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
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

                <div className="p-4 space-y-6 pb-24 overflow-y-auto flex-1">
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

                            <div>
                                <Button 
                                    variant="outline" 
                                    className="gap-2 w-full"
                                    onClick={() => {
                                        if (onNavigate) {
                                            onNavigate("messages", bookingId);
                                        }
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Nhắn tin
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

                    {/* Upload ảnh - Hiển thị nổi bật khi ở trạng thái chờ xử lý ảnh */}
                    {booking.status === "pending_processing" ? (
                        <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg mb-4" style={{ display: 'block', visibility: 'visible' }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <Upload className="w-5 h-5 text-primary" />
                                    Upload ảnh
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        variant={booking.uploadedRaw ? "outline" : "default"}
                                        onClick={() => {
                                            if (!booking.uploadedRaw) {
                                                setUploadType("raw");
                                                setShowUploadDialog(true);
                                            }
                                        }}
                                    >
                                        {booking.uploadedRaw ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                Đã upload ảnh gốc
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload ảnh gốc
                                            </>
                                        )}
                                    </Button>
                                    {booking.uploadedRaw && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            ✓ Bạn đã upload ảnh gốc cho buổi chụp này
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        size="lg"
                                        onClick={() => {
                                            if (!booking.uploadedEdited) {
                                                setUploadType("edited");
                                                setShowUploadDialog(true);
                                            }
                                        }}
                                    >
                                        {booking.uploadedEdited ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                                Đã upload ảnh hậu kỳ
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload ảnh hậu kỳ
                                            </>
                                        )}
                                    </Button>
                                    {booking.uploadedEdited && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            ✓ Bạn đã upload ảnh hậu kỳ. Buổi chụp sẽ chuyển sang trạng thái "Đã xử lý ảnh"
                                        </p>
                                    )}
                                </div>
                                
                                {/* Nút hoàn thành - Hiển thị khi đã upload ảnh hậu kỳ */}
                                <div className="pt-4 border-t mt-4">
                                    {(() => {
                                        const showCompleteButton = booking.uploadedEdited;
                                        console.log("🔍 Upload status check:", {
                                            uploadedRaw: booking.uploadedRaw,
                                            uploadedEdited: booking.uploadedEdited,
                                            showCompleteButton,
                                            status: booking.status
                                        });
                                        
                                        // Hiển thị nút khi đã upload ảnh hậu kỳ
                                        if (showCompleteButton) {
                                            return (
                                                <>
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                                                        size="lg"
                                                        disabled={isProcessing}
                                                        onClick={async () => {
                                                            if (!bookingId) return;
                                                            setIsProcessing(true);
                                                            try {
                                                                const response = await completeProcessing(bookingId);
                                                                if (response.success) {
                                                                    const successMessage = response.message || "Đã hoàn thành xử lý ảnh!";
                                                                    console.log("✅ Complete processing success:", successMessage);
                                                                    toast.success(successMessage, {
                                                                        duration: 5000,
                                                                    });
                                                                    await refreshBooking();
                                                                } else {
                                                                    const errorMessage = response.message || "Lỗi khi hoàn thành xử lý ảnh";
                                                                    console.error("❌ Complete processing error:", errorMessage);
                                                                    toast.error(errorMessage, {
                                                                        duration: 5000,
                                                                    });
                                                                }
                                                            } catch (error: any) {
                                                                const errorMessage = error.response?.data?.message || "Lỗi khi hoàn thành xử lý ảnh";
                                                                console.error("❌ Complete processing error:", error);
                                                                toast.error(errorMessage, {
                                                                    duration: 5000,
                                                                });
                                                            } finally {
                                                                setIsProcessing(false);
                                                            }
                                                        }}
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                                Đang xử lý...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Hoàn thành xử lý ảnh
                                                            </>
                                                        )}
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                                        Bấm nút này để chuyển buổi chụp sang trạng thái "Đã xử lý ảnh"
                                                    </p>
                                                </>
                                            );
                                        }
                                        
                                        // Hiển thị thông báo nếu chưa upload ảnh hậu kỳ
                                        return (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-muted-foreground">
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div >
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3" style={{ minHeight: '100px', paddingBottom: '20px' }}>
                        {/* Debug: Test để kiểm tra */}
                        {(() => {
                            console.log("🔍 RENDERING Action buttons section. Status:", booking.status);
                            if (booking.status === "ongoing") {
                                console.log("✅ Status is ongoing - End button should render");
                            }
                            return null;
                        })()}
                        
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

                        {((booking.status === "pending_payment" || booking.status === "pending_processing") && !booking.sessionEnded) && (() => {
                            // Kiểm tra thời gian: phải còn ít nhất 30 phút TRƯỚC giờ chụp
                            let canStart = false;
                            let timeMessage = "";

                            if (booking.scheduledDateTime) {
                                const scheduledTime = new Date(booking.scheduledDateTime);
                                const now = new Date();
                                const minutesUntilStart = Math.floor((scheduledTime.getTime() - now.getTime()) / (1000 * 60));

                                // Cho phép bắt đầu trong khoảng từ 30 phút trước đến 30 phút sau giờ hẹn
                                if (minutesUntilStart > 30) {
                                    // Còn quá sớm (> 30 phút trước giờ hẹn) → không cho phép
                                    timeMessage = `Còn ${minutesUntilStart} phút nữa mới đến thời gian hẹn. Chỉ có thể bắt đầu trong khoảng từ 30 phút trước đến 30 phút sau giờ hẹn.`;
                                } else if (minutesUntilStart < -30) {
                                    // Muộn quá 30 phút → không cho phép, sẽ tự động hủy
                                    timeMessage = `Đã muộn quá 30 phút so với thời gian hẹn. Buổi chụp sẽ tự động bị hủy.`;
                                } else {
                                    // Trong khoảng từ 30 phút trước đến 30 phút sau giờ hẹn → cho phép bắt đầu
                                    canStart = true;
                                    if (minutesUntilStart < 0) {
                                        timeMessage = `Bạn đang muộn ${Math.abs(minutesUntilStart)} phút so với thời gian hẹn. Vẫn có thể bắt đầu buổi chụp.`;
                                    } else if (minutesUntilStart === 0) {
                                        timeMessage = `Đã đến giờ hẹn. Có thể bắt đầu buổi chụp.`;
                                    } else {
                                        timeMessage = `Còn ${minutesUntilStart} phút nữa đến giờ hẹn. Có thể bắt đầu buổi chụp.`;
                                    }
                                }
                            } else {
                                // Nếu không có scheduledDateTime, cho phép bắt đầu (fallback)
                                canStart = true;
                            }

                            return (
                                <div className="space-y-2">
                                    {!canStart && timeMessage && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <p className="text-sm text-blue-800">
                                                ⏰ {timeMessage}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        size="lg"
                                        disabled={isProcessing || !canStart}
                                        onClick={async () => {
                                            if (!bookingId) return;
                                            setIsProcessing(true);
                                            try {
                                                const response = await startBooking(bookingId);
                                                console.log("📦 Full start response:", response);
                                                
                                                if (response.success) {
                                                    const successMessage = "Bắt đầu buổi chụp thành công!";
                                                    console.log("✅ Start booking success:", successMessage);
                                                    console.log("📦 Response data:", response.data);
                                                    toast.success(successMessage, {
                                                        duration: 5000,
                                                    });
                                                    
                                                    // Cập nhật booking từ response data ngay lập tức
                                                    // Response có cấu trúc: { success: true, data: { ...booking data... } }
                                                    if (response.data) {
                                                        console.log("🔄 Updating booking from response:", response.data);
                                                        console.log("📊 New status from response:", response.data.status);
                                                        setBooking(response.data);
                                                    } else {
                                                        // Fallback: refresh nếu không có data trong response
                                                        console.log("🔄 Fallback: refreshing booking...");
                                                        await refreshBooking();
                                                    }
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
                                        {isProcessing ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="w-4 h-4 mr-2" />
                                                Bắt đầu buổi chụp
                                            </>
                                        )}
                                    </Button>

                                    {canStart && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            {booking.status === "pending_payment" 
                                                ? "Buổi chụp đã được đặt cọc và sẵn sàng để bắt đầu"
                                                : "Buổi chụp đã được thanh toán đầy đủ và sẵn sàng để bắt đầu"}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Nút Kết thúc - Hiển thị khi trạng thái là "ongoing" */}
                        {(() => {
                            const isOngoing = booking.status === "ongoing";
                            console.log("🎯 RENDERING End Button Check:", {
                                status: booking.status,
                                isOngoing,
                                bookingId: booking.id
                            });
                            
                            if (!isOngoing) {
                                return null;
                            }
                            
                            return (
                                <div className="space-y-2" style={{ 
                                    display: 'block', 
                                    visibility: 'visible', 
                                    position: 'relative', 
                                    zIndex: 10, 
                                    marginTop: '16px',
                                    marginBottom: '16px',
                                    padding: '8px',
                                    backgroundColor: '#fef2f2',
                                    border: '2px solid #dc2626',
                                    borderRadius: '8px'
                                }}>
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-red-700"
                                        size="lg"
                                        variant="default"
                                        disabled={isProcessing}
                                        style={{ 
                                            display: 'flex', 
                                            visibility: 'visible',
                                            backgroundColor: '#dc2626',
                                            color: '#ffffff',
                                            minHeight: '48px',
                                            opacity: isProcessing ? 0.6 : 1,
                                            width: '100%',
                                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                                        } as React.CSSProperties}
                                    onClick={async () => {
                                        if (!bookingId) return;
                                        setIsProcessing(true);
                                        try {
                                            console.log("🛑 Đang kết thúc buổi chụp:", bookingId);
                                            const response = await endBooking(bookingId);
                                            console.log("📦 Full end response:", response);
                                            
                                            if (response.success) {
                                                const successMessage = "Kết thúc buổi chụp thành công!";
                                                console.log("✅ End booking success:", successMessage);
                                                console.log("📦 Response data:", response.data);
                                                toast.success(successMessage, {
                                                    duration: 5000,
                                                });
                                                
                                                // Cập nhật booking từ response data ngay lập tức
                                                // Response có cấu trúc: { success: true, data: { ...booking data... } }
                                                if (response.data) {
                                                    console.log("🔄 Updating booking from response:", response.data);
                                                    console.log("📊 New status from response:", response.data.status);
                                                    setBooking(response.data);
                                                } else {
                                                    // Fallback: refresh nếu không có data trong response
                                                    console.log("🔄 Fallback: refreshing booking...");
                                                    await refreshBooking();
                                                }
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
                                    {isProcessing ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <StopCircle className="w-4 h-4 mr-2" />
                                            Kết thúc buổi chụp
                                        </>
                                    )}
                                </Button>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Buổi chụp đang diễn ra. Bấm nút để kết thúc và quay lại trạng thái trước đó.
                                    </p>
                                </div>
                            );
                        })()}

                        {/* Thông báo khi buổi chụp đã kết thúc và không thể bắt đầu lại */}
                        {((booking.status === "pending_payment" || booking.status === "pending_processing") && booking.sessionEnded) && (
                            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <p className="font-semibold text-yellow-800">Buổi chụp đã được kết thúc</p>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Buổi chụp này đã được kết thúc trước đó. Không thể bắt đầu lại.
                                </p>
                            </div>
                        )}

                        {booking.status === "processed" && (
                            <Button className="w-full" variant="outline" size="lg" disabled>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Đã hoàn thành xử lý ảnh
                            </Button>
                        )}

                        {/* Nút Yêu cầu thay đổi và Hủy - Chỉ hiển thị ở các trạng thái cho phép */}
                        {(() => {
                            // Chỉ cho phép thay đổi khi buổi chụp ở trạng thái "Chờ xác nhận" hoặc "Chờ đặt cọc"
                            const allowedChangeStatuses = ["pending_confirmation", "pending_deposit"];
                            
                            // Kiểm tra trạng thái và sessionEnded flag
                            // Nếu buổi chụp đã từng được bắt đầu (sessionEnded = true), không cho phép thay đổi
                            const canChange = allowedChangeStatuses.includes(booking.status) 
                                && !booking.sessionEnded;
                            
                            // Các trạng thái cho phép hủy: "Chờ đặt cọc" (cả 2 bên đều có thể hủy)
                            // Ở trạng thái "Chờ xác nhận", nhiếp ảnh gia đã có nút "Từ chối" rồi
                            const canCancel = (booking.status === "pending_deposit")
                                && !booking.sessionEnded;
                            
                            if (!canChange && !canCancel) {
                                return null;
                            }
                            
                            return (
                                <div className="space-y-2">
                                    {canChange && (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setShowChangeDialog(true)}
                                        >
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Yêu cầu thay đổi
                                        </Button>
                                    )}
                                    {canCancel && (
                                        <Button
                                            className="w-full"
                                            variant="destructive"
                                            size="lg"
                                            onClick={() => setShowCancelDialog(true)}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Hủy buổi chụp
                                        </Button>
                                    )}
                                </div>
                            );
                        })()}
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

                {/* Change Request Dialog */}
                <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
                    <DialogContent>
                        <DialogHeader className="p-2">
                            <DialogTitle className="text-2xl">Yêu cầu thay đổi buổi chụp</DialogTitle>
                            <DialogDescription>
                                Vui lòng điền thông tin cần thay đổi và lý do
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 p-2">
                            <div>
                                <Label>Loại thay đổi</Label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={changeRequest.field}
                                    onChange={(e) => {
                                        setChangeRequest({ ...changeRequest, field: e.target.value as any, newStartTime: "", newEndTime: "" });
                                        setChangeValidationError("");
                                    }}
                                >
                                    <option value="time">Thời gian bắt đầu</option>
                                    <option value="location">Địa điểm</option>
                                </select>
                            </div>
                            
                            {/* Hiển thị giá trị cũ */}
                            {changeRequest.field === "time" && (
                                <div>
                                    <Label>Khoảng thời gian hiện tại</Label>
                                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                                        {booking ? (
                                            <>
                                                <div><strong>Bắt đầu:</strong> {booking.startDateTime ? new Date(booking.startDateTime).toLocaleString('vi-VN', { 
                                                    year: 'numeric', 
                                                    month: '2-digit', 
                                                    day: '2-digit', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                }) : `${booking.date} ${booking.time}`}</div>
                                                <div><strong>Kết thúc:</strong> {booking.endDateTime ? new Date(booking.endDateTime).toLocaleString('vi-VN', { 
                                                    year: 'numeric', 
                                                    month: '2-digit', 
                                                    day: '2-digit', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                }) : (booking.endDate && booking.endTime ? `${booking.endDate} ${booking.endTime}` : "N/A")}</div>
                                                {booking.duration && (
                                                    <div className="text-xs text-muted-foreground mt-1">Thời lượng: {booking.duration}</div>
                                                )}
                                            </>
                                        ) : "N/A"}
                                    </div>
                                </div>
                            )}

                            {changeRequest.field === "time" ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label>Thời gian bắt đầu mới <span className="text-xs text-muted-foreground">(Định dạng: YYYY-MM-DD HH:mm, ví dụ: 2025-11-22 14:30)</span></Label>
                                        <Input
                                            type="text"
                                            value={changeRequest.newStartTime}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setChangeRequest({ ...changeRequest, newStartTime: value });
                                                validateTimeRange(value, changeRequest.newEndTime);
                                            }}
                                            placeholder="Nhập theo định dạng: 2025-11-22 14:30"
                                            pattern="\d{4}-\d{2}-\d{2} \d{2}:\d{2}"
                                        />
                                    </div>
                                    <div>
                                        <Label>Thời gian kết thúc mới <span className="text-xs text-muted-foreground">(Định dạng: YYYY-MM-DD HH:mm, ví dụ: 2025-11-22 17:30)</span></Label>
                                        <Input
                                            type="text"
                                            value={changeRequest.newEndTime}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setChangeRequest({ ...changeRequest, newEndTime: value });
                                                validateTimeRange(changeRequest.newStartTime, value);
                                            }}
                                            placeholder="Nhập theo định dạng: 2025-11-22 17:30"
                                            pattern="\d{4}-\d{2}-\d{2} \d{2}:\d{2}"
                                        />
                                    </div>
                                    {changeValidationError && (
                                        <p className="text-sm text-red-600 mt-1">{changeValidationError}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div>
                                        <Label>Địa điểm hiện tại</Label>
                                        <div className="p-3 bg-muted rounded-md text-sm">
                                            {booking?.location || "Chưa có"}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Địa điểm mới</Label>
                                        <Input
                                            value={changeRequest.newStartTime}
                                            onChange={(e) => {
                                                setChangeRequest({ ...changeRequest, newStartTime: e.target.value });
                                                setChangeValidationError("");
                                            }}
                                            placeholder="Nhập địa điểm mới..."
                                            maxLength={255}
                                        />
                                        {changeValidationError && (
                                            <p className="text-sm text-red-600 mt-1">{changeValidationError}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div>
                                <Label>Lý do thay đổi</Label>
                                <Textarea
                                    value={changeRequest.reason}
                                    onChange={(e) =>
                                        setChangeRequest({ ...changeRequest, reason: e.target.value })
                                    }
                                    placeholder="Nhập lý do thay đổi..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setShowChangeDialog(false);
                                setChangeRequest({ field: "time", newStartTime: "", newEndTime: "", reason: "" });
                                setChangeValidationError("");
                            }}>
                                Hủy
                            </Button>
                            <Button
                                disabled={
                                    (changeRequest.field === "time" 
                                        ? (!changeRequest.newStartTime.trim() || !changeRequest.newEndTime.trim())
                                        : !changeRequest.newStartTime.trim()) 
                                    || !changeRequest.reason.trim() 
                                    || isProcessing 
                                    || !!changeValidationError
                                }
                                onClick={async () => {
                                    if (!booking || !changeRequest.reason.trim()) return;
                                    
                                    // Validate lại trước khi gửi
                                    if (changeRequest.field === "time") {
                                        if (!changeRequest.newStartTime.trim() || !changeRequest.newEndTime.trim()) {
                                            setChangeValidationError("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc");
                                            return;
                                        }
                                        
                                        validateTimeRange(changeRequest.newStartTime, changeRequest.newEndTime);
                                        if (changeValidationError) {
                                            return;
                                        }
                                    }
                                    
                                    setIsProcessing(true);
                                    try {
                                        const thayDoi: Record<string, any> = {};
                                        if (changeRequest.field === "time") {
                                            // Giá trị đã đúng định dạng YYYY-MM-DD HH:mm, chỉ cần thêm :00 cho giây
                                            thayDoi["Bat_Dau_Chup"] = changeRequest.newStartTime + ":00";
                                            thayDoi["Ket_Thuc_Chup"] = changeRequest.newEndTime + ":00";
                                        } else if (changeRequest.field === "location") {
                                            thayDoi["Dia_Diem"] = changeRequest.newStartTime.trim();
                                        }
                                        const response = await requestChange(booking.id, {
                                            thay_doi: thayDoi,
                                            ly_do: changeRequest.reason,
                                        });
                                        const successMessage = response.message || "Yêu cầu thay đổi đã được gửi!";
                                        console.log("✅ Change request success:", successMessage);
                                        toast.success(successMessage, {
                                            duration: 5000,
                                        });
                                        setShowChangeDialog(false);
                                        setChangeRequest({ field: "time", newStartTime: "", newEndTime: "", reason: "" });
                                        setChangeValidationError("");
                                        await refreshBooking();
                                    } catch (error: any) {
                                        console.error("❌ Change request error:", error);
                                        console.error("❌ Error response:", error.response?.data);
                                        
                                        // Hiển thị lỗi chi tiết từ backend
                                        let errorMessage = "Lỗi khi gửi yêu cầu thay đổi";
                                        if (error.response?.data?.errors) {
                                            // Nếu có nhiều lỗi validation, hiển thị tất cả
                                            const errors = error.response.data.errors;
                                            const errorList = Object.values(errors).join(", ");
                                            errorMessage = `Lỗi validation: ${errorList}`;
                                        } else if (error.response?.data?.message) {
                                            errorMessage = error.response.data.message;
                                        }
                                        
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Gửi yêu cầu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Cancel Dialog */}
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hủy buổi chụp</DialogTitle>
                            <DialogDescription>
                                Vui lòng nhập lý do hủy buổi chụp
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Lý do hủy</Label>
                                <Textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy buổi chụp..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setShowCancelDialog(false);
                                setCancelReason("");
                            }}>
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!cancelReason.trim() || isProcessing}
                                onClick={async () => {
                                    if (!booking || !cancelReason.trim()) return;
                                    setIsProcessing(true);
                                    try {
                                        const response = await cancelBooking(booking.id, {
                                            ly_do: cancelReason,
                                        });
                                        const successMessage = response.message || "Hủy buổi chụp thành công!";
                                        console.log("✅ Cancel booking success:", successMessage);
                                        toast.success(successMessage, {
                                            duration: 5000,
                                        });
                                        setShowCancelDialog(false);
                                        setCancelReason("");
                                        await refreshBooking();
                                        // Quay lại danh sách sau khi hủy
                                        setTimeout(() => {
                                            onBack();
                                        }, 1500);
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.message || "Lỗi khi hủy buổi chụp";
                                        console.error("❌ Cancel booking error:", error);
                                        toast.error(errorMessage, {
                                            duration: 5000,
                                        });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Xác nhận hủy
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
