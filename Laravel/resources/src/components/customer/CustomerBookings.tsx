'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { depositBooking, getFinalQuote, payFinal } from "../../services/PaymentAPI";
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
  CreditCard,
  Loader,
  ChevronDown,
  PlayCircle,
  XCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import axios from "axios";

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
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedBookingForDeposit, setSelectedBookingForDeposit] = useState<Booking | null>(null);
  const [depositMethod, setDepositMethod] = useState<"vi_ca_nhan" | "vnpay">("vi_ca_nhan");
  const [agreeDepositPolicy, setAgreeDepositPolicy] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(5000000);
  const [email, setEmail] = useState("");

  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [selectedBookingForFinal, setSelectedBookingForFinal] = useState<Booking | null>(null);
  const [finalMethod, setFinalMethod] = useState<"vi_ca_nhan" | "vnpay">("vi_ca_nhan");
  const [finalQuote, setFinalQuote] = useState<any>(null);
  const [isFinalPaying, setIsFinalPaying] = useState(false);
  const [finalError, setFinalError] = useState<string | null>(null);
  const [finalSuccess, setFinalSuccess] = useState(false);
  const [agreeFinalPolicy, setAgreeFinalPolicy] = useState(false);

  const depositPercent = 0.3;

  // --- Deposit dialog ---
  const handleOpenDepositDialog = (booking: Booking) => {
    setSelectedBookingForDeposit(booking);
    setShowDepositDialog(true);
    setAgreeDepositPolicy(false);
    setPayError(null);
    setPaySuccess(false);
    setIsPaying(false);
  };

  const handleCloseDepositDialog = () => {
    setShowDepositDialog(false);
    setSelectedBookingForDeposit(null);
    setAgreeDepositPolicy(false);
    setPayError(null);
    setPaySuccess(false);
    setIsPaying(false);
  };

  const handleDeposit = async () => {
    if (!selectedBookingForDeposit) return;
    if (!agreeDepositPolicy) {
      setPayError("Bạn phải đồng ý Điều khoản đặt cọc và Chính sách hoàn tiền.");
      return;
    }

    setIsPaying(true);
    setPayError(null);
    try {
      const response = await depositBooking(selectedBookingForDeposit.id, {
        payment_method: depositMethod,
        agree_terms: true,
        available: depositMethod === "vi_ca_nhan" ? walletBalance : undefined,
        email: email || undefined,
      });

      if (response.status === "redirect") {
        window.location.href = response.redirect_url!;
      } else if (response.status === "success") {
        setPaySuccess(true);
        setTimeout(() => handleCloseDepositDialog(), 2000);
      }
    } catch (err: any) {
      setPayError(err.message || "Đã có lỗi xảy ra khi đặt cọc.");
    } finally {
      setIsPaying(false);
    }
  };

  // --- Final payment dialog ---
  const handleOpenFinalDialog = async (booking: Booking) => {
    setSelectedBookingForFinal(booking);
    setShowFinalDialog(true);
    setFinalError(null);
    setFinalSuccess(false);
    setIsFinalPaying(false);
    try {
      const quote = await getFinalQuote(booking.id, finalMethod);
      setFinalQuote(quote);
    } catch {
      setFinalError("Không thể lấy báo giá. Vui lòng thử lại.");
    }
  };

  const handleCloseFinalDialog = () => {
    setShowFinalDialog(false);
    setSelectedBookingForFinal(null);
    setFinalQuote(null);
    setFinalError(null);
    setFinalSuccess(false);
    setIsFinalPaying(false);
  };

  const handleFinalPayment = async () => {
    if (!selectedBookingForFinal) return;
    if (!agreeFinalPolicy) {
      setFinalError("Bạn phải đồng ý Điều khoản thanh toán và Chính sách hoàn tiền.");
      return;
    }

    setIsFinalPaying(true);
    setFinalError(null);
    try {
      const response = await payFinal(selectedBookingForFinal.id, {
        payment_method: finalMethod,
        agree_terms: true,
        available: finalMethod === "vi_ca_nhan" ? walletBalance : undefined,
        email: email || undefined,
      });

      if (response.status === "redirect") {
        window.location.href = response.redirect_url!;
      } else if (response.status === "success") {
        setFinalSuccess(true);
        setTimeout(() => handleCloseFinalDialog(), 2000);
      }
    } catch (err: any) {
      setFinalError(err.message || "Đã có lỗi xảy ra khi thanh toán.");
    } finally {
      setIsFinalPaying(false);
    }
  };

  // --- Fetch bookings ---
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;
      const response = await axios.get("/api/customer/bookings", { params });
      setBookings(response.data);
    } catch (err: any) {
      console.error("Lỗi tải buổi chụp:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, searchQuery]);

  const getStatusInfo = (status: BookingStatus) => {
    const map: Record<BookingStatus, { label: string; color: string; icon: any }> = {
      pending_confirmation: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      pending_deposit: { label: "Chờ đặt cọc", color: "bg-orange-100 text-orange-800", icon: DollarSign },
      upcoming: { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800", icon: Calendar },
      ongoing: { label: "Đang diễn ra", color: "bg-green-100 text-green-800", icon: Camera },
      pending_payment: { label: "Chờ thanh toán", color: "bg-purple-100 text-purple-800", icon: DollarSign },
      pending_processing: { label: "Chờ xử lý ảnh", color: "bg-indigo-100 text-indigo-800", icon: Loader },
      photos_ready: { label: "Đã xử lý ảnh", color: "bg-teal-100 text-teal-800", icon: ImageIcon },
      completed: { label: "Đã hoàn thành", color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { label: "Đã hủy", color: "bg-muted text-muted-foreground", icon: X },
    };
    return map[status];
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        b.title.toLowerCase().includes(q) ||
        b.photographer.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, selectedStatus, searchQuery]);

  const selectedFilterOption = filterOptions.find((o) => o.status === selectedStatus) || filterOptions[0];

  return (
    <div className="min-h-screen bg-background">
      {onBack && (
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* --- Filter & Search --- */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                <div className="flex items-center gap-2">
                  <selectedFilterOption.icon className="h-4 w-4" />
                  <span>{selectedFilterOption.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {filterOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => setSelectedStatus(opt.status)}
                  className={selectedStatus === opt.status ? "bg-accent" : ""}
                >
                  <opt.icon className="w-4 h-4 mr-2" /> {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm buổi chụp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* --- Booking List --- */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Không tìm thấy buổi chụp</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const s = getStatusInfo(b.status);
            const Icon = s.icon;
            return (
              <Card key={b.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <ImageWithFallback
                    src={b.photographer.avatar}
                    alt={b.photographer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium truncate">{b.title}</h3>
                      <Badge className={s.color}>
                        <Icon className="w-3 h-3 mr-1" /> {s.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <span>{b.photographer.name}</span>•<Star className="w-3 h-3 fill-yellow-400" />
                      <span>{b.photographer.rating}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {new Date(b.date).toLocaleDateString("vi-VN")}
                      <Clock className="w-3 h-3" /> {b.time}
                      <MapPin className="w-3 h-3" /> {b.location}
                    </div>
                  </div>
                  {b.status === "pending_deposit" && (
                    <Button onClick={() => handleOpenDepositDialog(b)} className="bg-orange-500 hover:bg-orange-600">
                      <CreditCard className="w-4 h-4 mr-1" /> Đặt cọc
                    </Button>
                  )}
                  {b.status === "pending_payment" && (
                    <Button onClick={() => handleOpenFinalDialog(b)} className="bg-red-500 hover:bg-red-600">
                      <CreditCard className="w-4 h-4 mr-1" /> Thanh toán
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs giữ nguyên từ bản bạn gửi (deposit + final) */}
      {/* ... */}
    </div>
  );
}
