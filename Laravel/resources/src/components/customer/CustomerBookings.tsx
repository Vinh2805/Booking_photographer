import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { BookingDetail } from "../other/BookingDetail";
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
    rawPhotos?: string;
    editedPhotos?: string;
  };
}

interface ChangeRequest {
  field: "time" | "location" | "date" | "other";
  currentValue: string;
  newValue: string;
  reason: string;
}

interface CustomerBookingsProps {
  onNavigate?: (view: string) => void;
  onBack?: () => void;
}

// Filter options for booking status
interface FilterOption {
  id: string;
  label: string;
  status: BookingStatus | "all";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const filterOptions: FilterOption[] = [
  {
    id: 'all',
    label: 'Tất cả',
    status: 'all',
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    id: 'pending-confirmation',
    label: 'Chờ xác nhận',
    status: 'pending_confirmation',
    icon: Clock,
    color: 'bg-yellow-500'
  },
  {
    id: 'pending-deposit',
    label: 'Chờ đặt cọc',
    status: 'pending_deposit',
    icon: CreditCard,
    color: 'bg-orange-500'
  },
  {
    id: 'upcoming',
    label: 'Sắp diễn ra',
    status: 'upcoming',
    icon: AlertCircle,
    color: 'bg-blue-500'
  },
  {
    id: 'in-progress',
    label: 'Đang diễn ra',
    status: 'ongoing',
    icon: PlayCircle,
    color: 'bg-green-500'
  },
  {
    id: 'pending-payment',
    label: 'Chờ thanh toán',
    status: 'pending_payment',
    icon: CreditCard,
    color: 'bg-red-500'
  },
  {
    id: 'pending-processing',
    label: 'Chờ xử lý ảnh',
    status: 'pending_processing',
    icon: Camera,
    color: 'bg-purple-500'
  },
  {
    id: 'processed',
    label: 'Đã xử lý ảnh',
    status: 'photos_ready',
    icon: CheckCircle,
    color: 'bg-indigo-500'
  },
  {
    id: 'completed',
    label: 'Đã hoàn thành',
    status: 'completed',
    icon: CheckCircle,
    color: 'bg-green-600'
  },
  {
    id: 'cancelled',
    label: 'Đã hủy',
    status: 'cancelled',
    icon: XCircle,
    color: 'bg-gray-500'
  }
];

export function CustomerBookings({ onNavigate, onBack }: CustomerBookingsProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [changeRequest, setChangeRequest] = useState<ChangeRequest>({
    field: "time",
    currentValue: "",
    newValue: "",
    reason: "",
  });
  const [cancelReason, setCancelReason] = useState("");

  // Demo deposit dialog state - removed wallet dependencies
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositMethod, setDepositMethod] = useState<"card" | "bank">("card");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const maskedCard = "**** **** **** 1234";
  const depositPercent = 0.3; // 30%

  const bookings: Booking[] = [
    {
      id: "BK001",
      status: "upcoming",
      title: "Chụp ảnh cưới pre-wedding",
      photographer: {
        name: "Minh Tuấn",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
        rating: 4.9,
        completedSessions: 127,
      },
      type: "Cưới",
      location: "Hồ Gươm, Hà Nội",
      date: "2025-01-15",
      time: "08:00",
      price: 3000000,
      description: "Chụp ảnh cưới tại khu vực hồ Gươm với concept cổ điển.",
      services: ["Makeup", "Thuê váy cưới"],
      duration: "3 giờ",
      guestCount: "2 người",
      specialRequests: "Chụp vào golden hour, tránh người đông",
    },
    {
      id: "BK002",
      status: "completed",
      title: "Chụp ảnh gia đình",
      photographer: {
        name: "Đức Anh",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        rating: 4.8,
        completedSessions: 89,
      },
      type: "Gia đình",
      location: "Công viên Thống Nhất",
      date: "2025-01-08",
      time: "14:00",
      price: 1500000,
      description: "Chụp ảnh gia đình với 4 thành viên.",
      services: [],
      duration: "2 giờ",
      guestCount: "4 người",
      photos: {
        rawPhotos: "https://drive.google.com/raw-photos-bk002",
        editedPhotos: "https://drive.google.com/edited-photos-bk002",
      },
    },
    {
      id: "BK003",
      status: "pending_confirmation",
      title: "Chụp ảnh maternity",
      photographer: {
        name: "Lan Hương",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face",
        rating: 4.7,
        completedSessions: 156,
      },
      type: "Maternity",
      location: "Bờ hồ Tây, Hà Nội",
      date: "2025-01-20",
      time: "16:30",
      price: 1800000,
      description: "Chụp ảnh thai sản với concept nhẹ nhàng.",
      services: ["Makeup nhẹ"],
      duration: "2 giờ",
      guestCount: "2 người",
    },
    {
      id: "BK004",
      status: "pending_deposit",
      title: "Chụp ảnh chân dung",
      photographer: {
        name: "Thu Hà",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face",
        rating: 4.9,
        completedSessions: 203,
      },
      type: "Chân dung",
      location: "Studio ABC, Q1, TP.HCM",
      date: "2025-01-25",
      time: "14:00",
      price: 2000000,
      description: "Chụp ảnh chân dung nghệ thuật.",
      services: ["Makeup chuyên nghiệp"],
      duration: "1.5 giờ",
      guestCount: "1 người",
    },
    {
      id: "BK005",
      status: "pending_processing",
      title: "Chụp ảnh couple",
      photographer: {
        name: "Ngọc Tuyền",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face",
        rating: 4.8,
        completedSessions: 98,
      },
      type: "Couple",
      location: "Đà Nẵng Beach",
      date: "2025-01-10",
      time: "17:00",
      price: 2200000,
      description: "Chụp ảnh couple tại bãi biển với concept lãng mạn.",
      services: ["Makeup nhẹ"],
      duration: "2.5 giờ",
      guestCount: "2 người",
      photos: {
        rawPhotos: "https://drive.google.com/raw-photos-bk005",
      },
    },
    {
      id: "BK006",
      status: "photos_ready",
      title: "Chụp ảnh sự kiện",
      photographer: {
        name: "Minh Đức",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        rating: 4.6,
        completedSessions: 134,
      },
      type: "Sự kiện",
      location: "Khách sạn Sheraton",
      date: "2025-01-05",
      time: "19:00",
      price: 2800000,
      description: "Chụp ảnh sự kiện công ty.",
      services: ["Chỉnh sửa nhanh"],
      duration: "4 giờ",
      guestCount: "100 người",
      photos: {
        rawPhotos: "https://drive.google.com/raw-photos-bk006",
        editedPhotos: "https://drive.google.com/edited-photos-bk006",
      },
    },
  ];

  const getStatusInfo = (status: BookingStatus) => {
    const statusMap = {
      pending_confirmation: {
        label: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
      },
      pending_deposit: {
        label: "Chờ đặt cọc",
        color: "bg-orange-100 text-orange-800",
        icon: DollarSign,
      },
      upcoming: {
        label: "Sắp diễn ra",
        color: "bg-blue-100 text-blue-800",
        icon: Calendar,
      },
      ongoing: {
        label: "Đang diễn ra",
        color: "bg-green-100 text-green-800",
        icon: Camera,
      },
      pending_payment: {
        label: "Chờ thanh toán",
        color: "bg-purple-100 text-purple-800",
        icon: DollarSign,
      },
      pending_processing: {
        label: "Chờ xử lý ảnh",
        color: "bg-indigo-100 text-indigo-800",
        icon: Loader,
      },
      photos_ready: {
        label: "Đã xử lý ảnh",
        color: "bg-teal-100 text-teal-800",
        icon: ImageIcon,
      },
      completed: {
        label: "Đã hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-gray-100 text-gray-800",
        icon: X,
      },
    };
    return statusMap[status];
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      booking.title.toLowerCase().includes(q) ||
      booking.photographer.name.toLowerCase().includes(q) ||
      booking.id.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const statusCounts: Record<BookingStatus | "all", number> = React.useMemo(() => {
    const init: Record<BookingStatus | "all", number> = {
      all: bookings.length,
      pending_confirmation: 0,
      pending_deposit: 0,
      upcoming: 0,
      ongoing: 0,
      pending_payment: 0,
      pending_processing: 0,
      photos_ready: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      init[b.status] += 1;
    });
    return init;
  }, [bookings]);

  const handleFilterSelect = (status: BookingStatus | "all") => {
    setSelectedStatus(status);
  };

  const selectedFilterOption = filterOptions.find(option => option.status === selectedStatus) || filterOptions[0];

  // Show booking detail if selected
  if (selectedBooking) {
    return (
      <BookingDetail 
        onBack={() => setSelectedBooking(null)}
      />
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="font-semibold flex-1">Buổi chụp của tôi</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter and Search */}
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedFilterOption.color}`} />
                  <selectedFilterOption.icon className="h-4 w-4" />
                  <span className="text-sm">{selectedFilterOption.label}</span>
                  <Badge variant={statusCounts[selectedStatus] > 0 ? "default" : "secondary"} className="text-xs">
                    {statusCounts[selectedStatus]}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto" align="start">
              <div className="px-3 py-2 border-b">
                <p className="font-medium text-sm">Chọn trạng thái buổi chụp</p>
                <p className="text-xs text-muted-foreground">Tất cả: {statusCounts.all} buổi chụp</p>
              </div>
              
              {filterOptions.map((option, index) => (
                <React.Fragment key={option.id}>
                  <DropdownMenuItem
                    onClick={() => handleFilterSelect(option.status)}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer ${
                      selectedStatus === option.status ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <Badge 
                      variant={statusCounts[option.status] > 0 ? "default" : "secondary"}
                      className={`text-xs ${selectedStatus === option.status ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {statusCounts[option.status]}
                    </Badge>
                  </DropdownMenuItem>
                  
                  {/* Separator after certain groups */}
                  {(index === 0 || index === 3 || index === 6) && (
                    <DropdownMenuSeparator />
                  )}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm buổi chụp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={booking.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={booking.photographer.avatar}
                      alt={booking.photographer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{booking.title}</h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span>{booking.photographer.name}</span>
                        <span>•</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{booking.photographer.rating}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{booking.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Không tìm thấy buổi chụp</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}