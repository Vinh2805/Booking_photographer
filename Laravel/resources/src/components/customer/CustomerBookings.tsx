'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Camera,
  DollarSign,
  ArrowLeft,
  Search,
  X,
  Image as ImageIcon,
  CreditCard,
  Loader,
  ChevronDown,
  PlayCircle,
  XCircle,
} from "lucide-react";
import apiClient from "../services/apiClient";
import { depositBooking, getFinalQuote, payFinal } from "../services/PaymentAPI";
import { cancelBooking, requestChange } from "../services/BookingAPI";
import { downloadPhoto } from "../services/PhotoAPI";
import { ChangeRequestList } from "../shared/ChangeRequestList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

type BookingStatus =
  | "pending_confirmation"
  | "pending_deposit"
  | "upcoming"
  | "ongoing"
  | "pending_payment"
  | "pending_processing"
  | "photos_ready"
  | "completed"
  | "cancelled";

interface Booking {
  id: string;
  status: BookingStatus;
  title: string;
  photographer: {
    name: string;
    avatar: string;
    rating: number;
    completedSessions: number;
  };
  type: string;
  location: string;
  date: string;
  time: string;
  price: number;
  description: string;
  services: string[];
  duration: string;
  guestCount: string;
  specialRequests?: string;
  photos?: {
    rawPhotos?: number;
    editedPhotos?: number;
  };
}

interface ChangeRequest {
  field: "time" | "location" | "date" | "other";
  newStartTime: string;
  newEndTime: string;
  reason: string;
}

interface FilterOption {
  id: string;
  label: string;
  status: BookingStatus | "all";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const filterOptions: FilterOption[] = [
  { id: "all", label: "Tất cả", status: "all", icon: Calendar, color: "bg-primary" },
  { id: "pending-confirmation", label: "Chờ xác nhận", status: "pending_confirmation", icon: Clock, color: "bg-yellow-500" },
  { id: "pending-deposit", label: "Chờ đặt cọc", status: "pending_deposit", icon: CreditCard, color: "bg-orange-500" },
  { id: "upcoming", label: "Sắp diễn ra", status: "upcoming", icon: AlertCircle, color: "bg-primary" },
  { id: "in-progress", label: "Đang diễn ra", status: "ongoing", icon: PlayCircle, color: "bg-green-500" },
  { id: "pending-payment", label: "Chờ thanh toán", status: "pending_payment", icon: CreditCard, color: "bg-red-500" },
  { id: "pending-processing", label: "Chờ xử lý ảnh", status: "pending_processing", icon: Camera, color: "bg-purple-500" },
  { id: "processed", label: "Đã xử lý ảnh", status: "photos_ready", icon: CheckCircle, color: "bg-indigo-500" },
  { id: "completed", label: "Đã hoàn thành", status: "completed", icon: CheckCircle, color: "bg-green-600" },
  { id: "cancelled", label: "Đã hủy", status: "cancelled", icon: XCircle, color: "bg-muted-foreground" },
];

export function CustomerBookings({ onBack }: { onBack?: () => void }) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Dialog states
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showFinalPaymentDialog, setShowFinalPaymentDialog] = useState(false);
  const [changeRequest, setChangeRequest] = useState<ChangeRequest>({
    field: "time",
    newStartTime: "",
    newEndTime: "",
    reason: "",
  });
  const [changeValidationError, setChangeValidationError] = useState<string>("");

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
  const [cancelReason, setCancelReason] = useState("");
  const [depositMethod, setDepositMethod] = useState<"card" | "bank">("card");
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<"card" | "bank">("bank");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [finalQuote, setFinalQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const response = await apiClient.get("/customer/bookings", { params });
      setBookings(response.data);
    } catch (error: any) {
      console.error("Lỗi tải buổi chụp:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, searchQuery]);

  // Load quote khi dialog mở và có selectedBooking
  useEffect(() => {
    if (showFinalPaymentDialog && selectedBooking) {
      console.log("🔵 useEffect: Loading final quote for booking:", selectedBooking.id);
      setLoadingQuote(true);
      setPayError(null);
      const paymentMethod = finalPaymentMethod === "card" ? "vi_ca_nhan" : "vnpay";
      console.log("🔵 useEffect: Calling getFinalQuote with:", { ma_bc: selectedBooking.id, method: paymentMethod });
      getFinalQuote(selectedBooking.id, paymentMethod)
        .then((quote) => {
          console.log("✅ useEffect: Final quote loaded successfully:", quote);
          setFinalQuote(quote);
          setLoadingQuote(false);
          setPayError(null);
        })
        .catch((error: any) => {
          console.error("❌ useEffect: Error loading final quote:", error);
          console.error("❌ useEffect: Error response:", error.response?.data);
          console.error("❌ useEffect: Error status:", error.response?.status);
          console.error("❌ useEffect: Error message:", error.message);
          const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Không thể tải thông tin thanh toán";
          console.error("❌ useEffect: Error message to display:", errorMessage);
          setPayError(errorMessage);
          setLoadingQuote(false);
          // Chỉ hiển thị toast nếu không phải lỗi validation thông thường
          if (error.response?.status !== 400) {
            toast.error(errorMessage);
          } else {
            console.log("⚠️ useEffect: Validation error (400):", errorMessage);
          }
        });
    } else if (!showFinalPaymentDialog) {
      // Reset khi dialog đóng
      setFinalQuote(null);
      setLoadingQuote(false);
      setPayError(null);
      setAgreePolicy(false);
    }
  }, [showFinalPaymentDialog, selectedBooking?.id, finalPaymentMethod]);

  const getStatusInfo = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, { label: string; color: string; icon: any }> = {
      pending_confirmation: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: AlertCircle },
      pending_deposit: { label: "Chờ đặt cọc", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: DollarSign },
      upcoming: { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Calendar },
      ongoing: { label: "Đang diễn ra", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: Camera },
      pending_payment: { label: "Chờ thanh toán", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: DollarSign },
      pending_processing: { label: "Chờ xử lý ảnh", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", icon: Loader },
      photos_ready: { label: "Đã xử lý ảnh", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300", icon: ImageIcon },
      completed: { label: "Đã hoàn thành", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
      cancelled: { label: "Đã hủy", color: "bg-muted text-muted-foreground", icon: X },
    };
    return statusMap[status];
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        booking.title.toLowerCase().includes(q) ||
        booking.photographer.name.toLowerCase().includes(q) ||
        booking.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, selectedStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const init: Record<BookingStatus | "all", number> = {
      all: bookings.length,
      pending_confirmation: 0, pending_deposit: 0, upcoming: 0,
      ongoing: 0, pending_payment: 0, pending_processing: 0, photos_ready: 0,
      completed: 0, cancelled: 0,
    };
    bookings.forEach((b) => {
      if (init[b.status] !== undefined) init[b.status]++;
    });
    return init;
  }, [bookings]);

  const selectedFilterOption = filterOptions.find(o => o.status === selectedStatus) || filterOptions[0];

  // Chi tiết buổi chụp (thay thế BookingDetail)
  if (selectedBooking) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Quay lại
          </Button>

          {/* Yêu cầu thay đổi chờ duyệt */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Yêu cầu thay đổi chờ duyệt
              </h3>
              <ChangeRequestList onRefresh={fetchBookings} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <ImageWithFallback
                  src={selectedBooking.photographer.avatar}
                  alt={selectedBooking.photographer.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{selectedBooking.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{selectedBooking.photographer.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedBooking.photographer.rating}</span>
                    </div>
                    <span>• {selectedBooking.photographer.completedSessions} buổi hoàn thành</span>
                  </div>
                </div>
                {(() => {
                  const info = getStatusInfo(selectedBooking.status);
                  const Icon = info.icon;
                  return <Badge className={info.color}><Icon className="w-4 h-4 mr-1" />{info.label}</Badge>;
                })()}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Thông tin buổi chụp</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{new Date(selectedBooking.date).toLocaleDateString("vi-VN")}</span></div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{selectedBooking.time}</span></div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{selectedBooking.location}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Chi tiết</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Loại:</span><span className="font-medium">{selectedBooking.type}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Thời lượng:</span><span className="font-medium">{selectedBooking.duration}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Số người:</span><span className="font-medium">{selectedBooking.guestCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Giá:</span><span className="font-medium text-primary">{selectedBooking.price.toLocaleString("vi-VN")}₫</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dịch vụ</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.services.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>
                  {selectedBooking.specialRequests && (
                    <div>
                      <h3 className="font-semibold mb-2">Yêu cầu đặc biệt</h3>
                      <p className="text-sm text-muted-foreground">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                  {selectedBooking.photos && (
                    <div>
                      <h3 className="font-semibold mb-2">Ảnh</h3>
                      <div className="space-y-1 text-sm">
                        {selectedBooking.photos.rawPhotos !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Thô:</span><span className="font-medium">{selectedBooking.photos.rawPhotos} ảnh</span></div>}
                        {selectedBooking.photos.editedPhotos !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Đã chỉnh:</span><span className="font-medium">{selectedBooking.photos.editedPhotos} ảnh</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{selectedBooking.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                {selectedBooking.status === "pending_deposit" && (
                  <Button
                    className="w-full"
                    onClick={() => setShowDepositDialog(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Đặt cọc
                  </Button>
                )}
                {selectedBooking.status === "pending_payment" && (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setShowFinalPaymentDialog(true)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán phần còn lại
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          await downloadPhoto("raw", selectedBooking.id);
                          toast.success("Đang tải ảnh gốc...");
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || "Lỗi khi tải ảnh");
                        }
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Tải ảnh gốc
                    </Button>
                  </div>
                )}
                {selectedBooking.status === "photos_ready" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await downloadPhoto("raw", selectedBooking.id);
                          toast.success("Đang tải ảnh gốc...");
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || "Lỗi khi tải ảnh");
                        }
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Tải ảnh gốc
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await downloadPhoto("edited", selectedBooking.id);
                          toast.success("Đang tải ảnh hậu kỳ...");
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || "Lỗi khi tải ảnh");
                        }
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Tải ảnh hậu kỳ
                    </Button>
                  </div>
                )}
                {(() => {
                  // Các trạng thái không cho phép thay đổi
                  const cannotChangeStatuses = [
                    "ongoing",
                    "pending_processing",
                    "photos_ready",
                    "completed",
                    "cancelled"
                  ];
                  
                  // Kiểm tra trạng thái và sessionEnded flag
                  // Nếu buổi chụp đã từng được bắt đầu (sessionEnded = true), không cho phép thay đổi
                  const canChange = !cannotChangeStatuses.includes(selectedBooking.status) 
                    && !(selectedBooking as any).sessionEnded;
                  
                  return canChange && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowChangeDialog(true)}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Yêu cầu thay đổi
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy buổi chụp
                      </Button>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Dialog */}
        <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đặt cọc buổi chụp</DialogTitle>
              <DialogDescription>
                Vui lòng chọn phương thức thanh toán và đồng ý với điều khoản
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={depositMethod} onValueChange={(v) => setDepositMethod(v as "card" | "bank")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Ví cá nhân</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank">VNPay</Label>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreePolicy}
                  onChange={(e) => setAgreePolicy(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="agree" className="text-sm">
                  Tôi đồng ý với điều khoản đặt cọc và chính sách hoàn tiền
                </Label>
              </div>
              {payError && (
                <div className="text-sm text-destructive">{payError}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
                Hủy
              </Button>
              <Button
                disabled={isPaying || !agreePolicy}
                onClick={async () => {
                  if (!selectedBooking) return;
                  setIsPaying(true);
                  setPayError(null);
                  try {
                    const response = await depositBooking(selectedBooking.id, {
                      payment_method: depositMethod === "card" ? "vi_ca_nhan" : "vnpay",
                      agree_terms: agreePolicy,
                    });
                    if (response.status === "redirect" && response.redirect_url) {
                      window.location.href = response.redirect_url;
                    } else {
                      const successMessage = response.message || "Đặt cọc thành công!";
                      console.log("✅ Deposit success:", successMessage);
                      toast.success(successMessage, {
                        duration: 5000,
                      });
                      setShowDepositDialog(false);
                      fetchBookings();
                    }
                  } catch (error: any) {
                    const errorMessage = error.response?.data?.message || "Lỗi khi đặt cọc";
                    console.error("❌ Deposit error:", error);
                    setPayError(errorMessage);
                    toast.error(errorMessage, {
                      duration: 5000,
                    });
                  } finally {
                    setIsPaying(false);
                  }
                }}
              >
                {isPaying ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Xác nhận đặt cọc
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
                <Label htmlFor="cancel-reason">Lý do hủy</Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy buổi chụp..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                disabled={!cancelReason.trim() || isPaying}
                onClick={async () => {
                  if (!selectedBooking || !cancelReason.trim()) return;
                  setIsPaying(true);
                  try {
                    const response = await cancelBooking(selectedBooking.id, {
                      ly_do: cancelReason,
                    });
                    const successMessage = response.message || "Hủy buổi chụp thành công!";
                    console.log("✅ Cancel booking success:", successMessage);
                    toast.success(successMessage, {
                      duration: 5000,
                    });
                    setShowCancelDialog(false);
                    setCancelReason("");
                    fetchBookings();
                    setSelectedBooking(null);
                  } catch (error: any) {
                    const errorMessage = error.response?.data?.message || "Lỗi khi hủy buổi chụp";
                    console.error("❌ Cancel booking error:", error);
                    toast.error(errorMessage, {
                      duration: 5000,
                    });
                  } finally {
                    setIsPaying(false);
                  }
                }}
              >
                {isPaying ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Request Dialog */}
        <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yêu cầu thay đổi buổi chụp</DialogTitle>
              <DialogDescription>
                Vui lòng điền thông tin cần thay đổi và lý do
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <div>
                <Label>Khoảng thời gian hiện tại</Label>
                <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                  {(() => {
                    if (!selectedBooking) return "N/A";
                    if (changeRequest.field === "time") {
                      return (
                        <>
                          <div><strong>Bắt đầu:</strong> {selectedBooking.date} {selectedBooking.time}</div>
                          <div><strong>Kết thúc:</strong> {(selectedBooking as any).endDate || selectedBooking.date} {(selectedBooking as any).endTime || "N/A"}</div>
                          {selectedBooking.duration && (
                            <div className="text-xs text-muted-foreground mt-1">Thời lượng: {selectedBooking.duration}</div>
                          )}
                        </>
                      );
                    } else if (changeRequest.field === "location") {
                      return selectedBooking.location || "Chưa có";
                    }
                    return "N/A";
                  })()}
                </div>
              </div>

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
                <div>
                  <Label>Giá trị mới</Label>
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
                  || isPaying 
                  || !!changeValidationError
                }
                onClick={async () => {
                  if (!selectedBooking || !changeRequest.reason.trim()) return;
                  
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
                  
                  setIsPaying(true);
                  try {
                    const thayDoi: Record<string, any> = {};
                    if (changeRequest.field === "time") {
                      // Giá trị đã đúng định dạng YYYY-MM-DD HH:mm, chỉ cần thêm :00 cho giây
                      thayDoi["Bat_Dau_Chup"] = changeRequest.newStartTime + ":00";
                      thayDoi["Ket_Thuc_Chup"] = changeRequest.newEndTime + ":00";
                    } else if (changeRequest.field === "location") {
                      thayDoi["Dia_Diem"] = changeRequest.newStartTime.trim();
                    }
                    const response = await requestChange(selectedBooking.id, {
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
                    fetchBookings();
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
                    setIsPaying(false);
                  }
                }}
              >
                {isPaying ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Gửi yêu cầu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Final Payment Dialog */}
        <Dialog open={showFinalPaymentDialog} onOpenChange={(open) => {
          console.log("🔵 Final Payment Dialog - onOpenChange:", { open, selectedBooking: selectedBooking?.id });
          setShowFinalPaymentDialog(open);
          if (!open) {
            setFinalPaymentMethod("bank"); // Reset về VNPay
            // Reset sẽ được xử lý bởi useEffect
          } else if (!selectedBooking) {
            console.error("❌ No selectedBooking when opening final payment dialog");
            setPayError("Không tìm thấy thông tin buổi chụp");
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thanh toán phần còn lại</DialogTitle>
              <DialogDescription>
                Vui lòng kiểm tra thông tin thanh toán và đồng ý với điều khoản
              </DialogDescription>
            </DialogHeader>
            {loadingQuote ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải thông tin...</span>
              </div>
            ) : payError ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-destructive">{payError}</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedBooking) {
                      setPayError(null);
                      setLoadingQuote(true);
                      getFinalQuote(selectedBooking.id, finalPaymentMethod === "card" ? "vi_ca_nhan" : "vnpay")
                        .then((quote) => {
                          setFinalQuote(quote);
                          setLoadingQuote(false);
                        })
                        .catch((error: any) => {
                          const errorMessage = error.response?.data?.message || error.message || "Lỗi khi lấy báo giá";
                          setPayError(errorMessage);
                          setLoadingQuote(false);
                        });
                    }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            ) : finalQuote ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tổng tiền:</span>
                    <span className="font-medium">{finalQuote.booking.Tong_Tien.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tỷ lệ cọc:</span>
                    <span className="font-medium">{finalQuote.booking["Ti_Le_Coc(%)"]}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Số tiền còn lại:</span>
                    <span className="font-medium text-primary">{finalQuote.costs.so_tien_con_lai.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí dịch vụ:</span>
                    <span className="font-medium">{finalQuote.costs.phi_dich_vu.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng thanh toán:</span>
                    <span className="text-primary">{finalQuote.costs.tong_thanh_toan.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
                <div>
                  <Label>Phương thức thanh toán</Label>
                  <RadioGroup 
                    value={finalPaymentMethod} 
                    onValueChange={(v) => {
                      console.log("🔵 Payment method changed to:", v);
                      setFinalPaymentMethod(v as "card" | "bank");
                      // Quote sẽ được reload tự động bởi useEffect khi finalPaymentMethod thay đổi
                    }}
                  >
                    <div className="flex items-center space-x-2 mt-2">
                      <RadioGroupItem value="card" id="final-card" />
                      <Label htmlFor="final-card">Ví cá nhân</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank" id="final-bank" />
                      <Label htmlFor="final-bank">VNPay</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="agree-final"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="agree-final" className="text-sm">
                    Tôi đồng ý với điều khoản thanh toán và chính sách hoàn tiền
                  </Label>
                </div>
                {payError && (
                  <div className="text-sm text-destructive">{payError}</div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Không thể tải thông tin thanh toán
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowFinalPaymentDialog(false);
                setFinalQuote(null);
              }}>
                Hủy
              </Button>
              <Button
                disabled={isPaying || !agreePolicy || !finalQuote}
                onClick={async () => {
                  if (!selectedBooking || !finalQuote) return;
                  setIsPaying(true);
                  setPayError(null);
                  try {
                    const response = await payFinal(selectedBooking.id, {
                      payment_method: finalPaymentMethod === "card" ? "vi_ca_nhan" : "vnpay",
                      agree_terms: agreePolicy,
                    });
                    if (response.status === "redirect" && response.redirect_url) {
                      window.location.href = response.redirect_url;
                    } else {
                      const successMessage = response.message || "Thanh toán thành công!";
                      console.log("✅ Final payment success:", successMessage);
                      toast.success(successMessage, {
                        duration: 5000,
                      });
                      setShowFinalPaymentDialog(false);
                      setFinalQuote(null);
                      fetchBookings();
                    }
                  } catch (error: any) {
                    const errorMessage = error.response?.data?.message || "Lỗi khi thanh toán";
                    console.error("❌ Final payment error:", error);
                    setPayError(errorMessage);
                    toast.error(errorMessage, {
                      duration: 5000,
                    });
                  } finally {
                    setIsPaying(false);
                  }
                }}
              >
                {isPaying ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                Xác nhận thanh toán
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {onBack && (
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-border hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedFilterOption.color}`} />
                  <selectedFilterOption.icon className="h-4 w-4" />
                  <span className="text-sm text-foreground">{selectedFilterOption.label}</span>
                  <Badge variant={statusCounts[selectedStatus] > 0 ? "default" : "secondary"} className="text-xs">
                    {statusCounts[selectedStatus]}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto bg-card border-border" align="start">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium text-sm text-card-foreground">Chọn trạng thái buổi chụp</p>
                <p className="text-xs text-muted-foreground">Tất cả: {statusCounts.all} buổi chụp</p>
              </div>
              {filterOptions.map((option, index) => (
                <React.Fragment key={option.id}>
                  <DropdownMenuItem
                    onClick={() => setSelectedStatus(option.status)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer ${selectedStatus === option.status ? "bg-accent" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                    </div>
                    <Badge variant={statusCounts[option.status] > 0 ? "default" : "secondary"} className={`text-xs ${selectedStatus === option.status ? "bg-primary text-primary-foreground" : ""}`}>
                      {statusCounts[option.status]}
                    </Badge>
                  </DropdownMenuItem>
                  {(index === 0 || index === 3 || index === 6) && <DropdownMenuSeparator />}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm buổi chụp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background border-border"
            />
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2 text-foreground">Không tìm thấy buổi chụp</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className="relative cursor-pointer overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group hover:shadow-xl hover:shadow-sky-500/10 dark:hover:shadow-sky-400/10 hover:border-sky-300 dark:hover:border-sky-500 transition-all duration-300"
                >
                  <span aria-hidden className="shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-white/0 via-white/30 to-white/0 dark:via-white/10 -skew-x-12" />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={booking.photographer.avatar}
                        alt={booking.photographer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate text-card-foreground">{booking.title}</h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <span className="text-foreground font-medium">{booking.photographer.name}</span>
                          <span>•</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{booking.photographer.rating}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{booking.time}</span></div>
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate max-w-[120px]">{booking.location}</span></div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                        className="border-border"
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}