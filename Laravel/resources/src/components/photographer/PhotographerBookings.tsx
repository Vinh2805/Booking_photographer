// frontend/src/components/PhotographerBookings.tsx
import React, { useState } from "react";
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
  const [bookings] = useState<Booking[]>([]); // trống
  const navigate = useNavigate();

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

  return (
    <div className="p-4 space-y-4 pb-24 bg-slate-50 dark:bg-slate-900">
      {/* Filter & Search */}
      <div className="flex items-center gap-3">
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
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-medium mb-2">Không có buổi chụp nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}
