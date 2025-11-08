// frontend/src/components/PhotographerBookings.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Calendar,
  MapPin,
  Clock,
  Camera,
  DollarSign,
  Search,
  ChevronDown,
  AlertCircle,
  X,
  Star,
  CheckCircle,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

type BookingStatus =
  | "pending_confirmation"
  | "pending_deposit"
  | "upcoming"
  | "ongoing"
  | "pending_payment"
  | "pending_processing"
  | "processed"
  | "completed"
  | "cancelled";

interface Booking {
  id: string;
  status: BookingStatus;
  title: string;
  customer: {
    name: string;
    avatar: string;
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
  uploadedRaw?: boolean;
  uploadedEdited?: boolean;
}

interface PhotographerBookingsProps {
  selectedBookingId?: string;
  onNavigate?: (view: any) => void;
  onClearSelection?: () => void;
}

export function PhotographerBookings({
  selectedBookingId,
  onClearSelection,
}: PhotographerBookingsProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Lấy token từ localStorage (Sanctum)
  const getToken = () => {
    return localStorage.getItem("auth_token") || "";
  };

  // Fetch bookings từ API
  const fetchBookings = async (status: string = selectedStatus, search: string = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (search) params.append("search", search);

      const token = getToken();
      const response = await fetch(`http://127.0.0.1:8000/api/buoi-chup?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      // Kiểm tra nếu server trả về HTML (lỗi 500, 404, v.v.)
      const text = await response.text();
      if (text.trim().startsWith("<!DOCTYPE") || text.includes("<html")) {
        console.error("Server trả về HTML:", text.substring(0, 200));
        throw new Error("Lỗi server: trả về HTML thay vì JSON. Kiểm tra backend.");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Dữ liệu trả về không phải JSON hợp lệ.");
      }

      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.message || "Có lỗi xảy ra khi tải danh sách buổi chụp");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải bookings:", error);
      const msg = error.message.includes("Failed to fetch")
        ? "Không thể kết nối đến server. Kiểm tra Laravel có đang chạy không."
        : error.message || "Lỗi không xác định";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch khi mount hoặc filter thay đổi
  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, searchQuery]);

  const getStatusInfo = (status: BookingStatus) => {
    const statusMap = {
      pending_confirmation: {
        label: "Chờ xác nhận",
        color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
        icon: AlertCircle,
      },
      pending_deposit: {
        label: "Chờ đặt cọc",
        color: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
        icon: DollarSign,
      },
      upcoming: {
        label: "Sắp diễn ra",
        color: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
        icon: Calendar,
      },
      ongoing: {
        label: "Đang diễn ra",
        color: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        icon: Camera,
      },
      pending_payment: {
        label: "Chờ thanh toán",
        color: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
        icon: DollarSign,
      },
      pending_processing: {
        label: "Chờ xử lý ảnh",
        color: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
        icon: ImageIcon,
      },
      processed: {
        label: "Đã xử lý ảnh",
        color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300",
        icon: Star,
      },
      completed: {
        label: "Đã hoàn thành",
        color: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã huỷ",
        color: "bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300",
        icon: X,
      },
    };
    return statusMap[status];
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts: Record<BookingStatus | "all", number> = {
    all: bookings.length,
    pending_confirmation: bookings.filter((b) => b.status === "pending_confirmation").length,
    pending_deposit: bookings.filter((b) => b.status === "pending_deposit").length,
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    ongoing: bookings.filter((b) => b.status === "ongoing").length,
    pending_payment: bookings.filter((b) => b.status === "pending_payment").length,
    pending_processing: bookings.filter((b) => b.status === "pending_processing").length,
    processed: bookings.filter((b) => b.status === "processed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const filterOptions = [
    { id: "all", status: "all" as const, label: "Tất cả buổi chụp", color: "bg-slate-500", icon: Camera },
    { id: "pending_confirmation", status: "pending_confirmation" as const, label: "Chờ xác nhận", color: "bg-yellow-500", icon: AlertCircle },
    { id: "pending_deposit", status: "pending_deposit" as const, label: "Chờ đặt cọc", color: "bg-orange-500", icon: DollarSign },
    { id: "upcoming", status: "upcoming" as const, label: "Sắp diễn ra", color: "bg-blue-500", icon: Calendar },
    { id: "ongoing", status: "ongoing" as const, label: "Đang diễn ra", color: "bg-green-500", icon: Camera },
    { id: "pending_payment", status: "pending_payment" as const, label: "Chờ thanh toán", color: "bg-red-500", icon: DollarSign },
    { id: "pending_processing", status: "pending_processing" as const, label: "Chờ xử lý ảnh", color: "bg-purple-500", icon: ImageIcon },
    { id: "processed", status: "processed" as const, label: "Đã xử lý ảnh", color: "bg-indigo-500", icon: Star },
    { id: "completed", status: "completed" as const, label: "Đã hoàn thành", color: "bg-emerald-500", icon: CheckCircle },
    { id: "cancelled", status: "cancelled" as const, label: "Đã huỷ", color: "bg-slate-500", icon: X },
  ];

  const selectedFilterOption = filterOptions.find((option) => option.status === selectedStatus) || filterOptions[0];

  const handleFilterSelect = (status: BookingStatus | "all") => {
    setSelectedStatus(status);
  };

  // Loading state
  if (loading && bookings.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2">Đang tải danh sách buổi chụp...</span>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="p-4 text-center text-red-600 space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
        <p className="font-medium">{error}</p>
        <Button onClick={() => fetchBookings()} variant="default" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-border hover:shadow-md hover-lift transition-all duration-200"
            >
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
                  onClick={() => handleFilterSelect(option.status)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors duration-200 ${
                    selectedStatus === option.status ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                  </div>
                  <Badge
                    variant={statusCounts[option.status] > 0 ? "default" : "secondary"}
                    className={`text-xs ${selectedStatus === option.status ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {statusCounts[option.status]}
                  </Badge>
                </DropdownMenuItem>
                {(index === 0 || index === 3 || index === 6) && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
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

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.map((booking) => {
          const statusInfo = getStatusInfo(booking.status);
          const StatusIcon = statusInfo.icon;

          return (
            <Card
              key={booking.id}
              className="cursor-pointer hover:shadow-lg hover-lift transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group"
              onClick={() => navigate(`/buoi-chup/${booking.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ImageWithFallback
                    src={booking.customer.avatar}
                    alt={booking.customer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium truncate text-slate-800 dark:text-slate-100">
                          {booking.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {booking.customer.name}
                        </p>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{booking.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-semibold text-pink-600 dark:text-pink-400">
                          {booking.price.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-medium mb-2">Không tìm thấy buổi chụp nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}