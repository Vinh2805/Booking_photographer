import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Camera,
  DollarSign,
  Download,
  ArrowLeft,
  X,
  MessageCircle,
  Edit,
  Ban,
  AlertTriangle,
  Eye,
  RefreshCw,
  FileText,
  Phone,
} from "lucide-react";

type BookingStatus =
  | "pending_confirmation"
  | "pending_deposit"
  | "upcoming"
  | "ongoing"
  | "pending_payment"
  | "processing_photos"
  | "photos_ready"
  | "completed"
  | "cancelled"
  | "disputed";

interface AdminBooking {
  id: string;
  status: BookingStatus;
  title: string;
  customer: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    email: string;
  };
  photographer: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    rating: number;
  };
  type: string;
  location: string;
  date: string;
  time: string;
  price: number;
  description: string;
  createdAt: string;
  lastUpdate: string;
  priority: "low" | "medium" | "high";
  flags: string[];
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

interface AdminBookingsProps {
  selectedBookingId?: string;
  onClearSelection?: () => void;
}

export function AdminBookings({
  selectedBookingId,
  onClearSelection,
}: AdminBookingsProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"date" | "priority" | "value">("date");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // Popup filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [tmpStatus, setTmpStatus] = useState<BookingStatus | "all">(
    selectedStatus
  );
  const [tmpSortBy, setTmpSortBy] = useState<"date" | "priority" | "value">(
    sortBy
  );
  const [tmpPriority, setTmpPriority] = useState<
    "all" | "high" | "medium" | "low"
  >(filterPriority);

  // API Data
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionBooking, setActionBooking] = useState<AdminBooking | null>(null);

  const confirmCancel = async () => {
    if (!actionBooking) return;

    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      // Extract ID from BKxxx -> BCxxx
      const numericId = actionBooking.id.replace(/^BK/, '');

      const res = await fetch(`/api/admin/bookings/${numericId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "Đã hủy",
          reason: cancelReason
        })
      });

      if (res.ok) {
        setCancelDialogOpen(false);
        setCancelReason("");
        fetchBookings();
        // Update selectedBooking if matches
        if (selectedBooking && selectedBooking.id === actionBooking.id) {
          setSelectedBooking({
            ...selectedBooking,
            status: "cancelled"
          });
        }
        alert("Đã hủy booking thành công");
      } else {
        alert("Cập nhật thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi hệ thống");
    }
  };

  const mapStatus = (dbStatus: string): BookingStatus => {
    const map: Record<string, BookingStatus> = {
      'Chờ xác nhận': 'pending_confirmation',
      'Chờ đặt cọc': 'pending_deposit',
      'Sắp diễn ra': 'upcoming',
      'Đang diễn ra': 'ongoing',
      'Chờ thanh toán': 'pending_payment',
      'Đang xử lý': 'processing_photos',
      'Hoàn thành': 'completed',
      'Đã hủy': 'cancelled',
      'Tranh chấp': 'disputed'
    };
    return map[dbStatus] || 'pending_confirmation';
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.data) {
        const transformed = data.data.map((item: any) => ({
          id: `BK${item.Ma_BC}`,
          status: mapStatus(item.Trang_Thai),
          title: `Booking #${item.Ma_BC}`, // Or derive from type/date
          customer: {
            id: `CUST${item.Ma_KH}`,
            name: item.khach_hang?.tai_khoan?.Ho_Ten || "Unknown",
            avatar: item.khach_hang?.tai_khoan?.avatar_url || "",
            phone: item.khach_hang?.tai_khoan?.So_ĐT || "",
            email: item.khach_hang?.tai_khoan?.Email_TK || "",
          },
          photographer: {
            id: `PHOTO${item.Ma_NAG}`,
            name: item.nha_nhiep_anh?.tai_khoan?.Ho_Ten || "Unknown",
            avatar: item.nha_nhiep_anh?.tai_khoan?.avatar_url || "",
            phone: item.nha_nhiep_anh?.tai_khoan?.So_ĐT || "",
            rating: 5.0, // Mock or fetch if available
          },
          type: "Chụp ảnh", // Could extract from description or add category field
          location: item.Dia_Diem,
          date: item.Bat_Dau_Chup || item.Ngay_Tao, // Fallback to Ngay_Tao if Bat_Dau_Chup is null
          time: item.Bat_Dau_Chup ? new Date(item.Bat_Dau_Chup).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "00:00",
          price: parseFloat(item.Tong_Tien) || 0,
          description: item.Yeu_Cau_Cu_The || "",
          createdAt: item.Ngay_Tao,
          lastUpdate: item.Ngay_Tao, // Or updated_at if available
          priority: "medium", // Logic to determine priority
          flags: [],
          review: item.danh_gia ? {
            rating: item.danh_gia.So_Sao,
            comment: item.danh_gia.Noi_Dung,
            createdAt: item.danh_gia.Ngay_ĐG
          } : undefined
        }));
        setBookings(transformed);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // mở chi tiết theo id
  useEffect(() => {
    if (selectedBookingId) {
      const booking = bookings.find((b) => b.id === selectedBookingId);
      if (booking) setSelectedBooking(booking);
    }
  }, [selectedBookingId]);

  const getStatusInfo = (status: BookingStatus) => {
    const statusMap = {
      pending_confirmation: {
        label: "Chờ xác nhận",
        color:
          "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
        icon: AlertCircle,
      },
      pending_deposit: {
        label: "Chờ đặt cọc",
        color:
          "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
        icon: DollarSign,
      },
      upcoming: {
        label: "Sắp diễn ra",
        color:
          "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
        icon: Calendar,
      },
      ongoing: {
        label: "Đang diễn ra",
        color:
          "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        icon: Camera,
      },
      pending_payment: {
        label: "Chờ thanh toán",
        color:
          "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
        icon: DollarSign,
      },
      processing_photos: {
        label: "Đang xử lý ảnh",
        color:
          "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300",
        icon: RefreshCw,
      },
      photos_ready: {
        label: "Ảnh đã sẵn sàng",
        color:
          "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300",
        icon: FileText,
      },
      completed: {
        label: "Đã hoàn thành",
        color:
          "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        color:
          "bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300",
        icon: X,
      },
      disputed: {
        label: "Tranh chấp",
        color: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
        icon: AlertTriangle,
      },
    } as const;
    return statusMap[status];
  };

  const getPriorityInfo = (priority: "high" | "medium" | "low" | string) => {
    switch (priority) {
      case "high":
        return {
          label: "Cao",
          color: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
        };
      case "medium":
        return {
          label: "Trung bình",
          color:
            "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
        };
      case "low":
        return {
          label: "Thấp",
          color:
            "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
        };
      default:
        return {
          label: "Không xác định",
          color:
            "bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300",
        };
    }
  };

  const filteredBookings = React.useMemo(() => {
    const priorityRank: Record<"high" | "medium" | "low", number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const list = bookings.filter((b) => {
      const byStatus = selectedStatus === "all" || b.status === selectedStatus;
      const byPriority =
        filterPriority === "all" || b.priority === filterPriority;
      const q = searchQuery.trim().toLowerCase();
      const bySearch =
        !q ||
        b.id.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.photographer.name.toLowerCase().includes(q);
      return byStatus && byPriority && bySearch;
    });

    list.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "priority") {
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      if (sortBy === "value") {
        return b.price - a.price;
      }
      return 0;
    });

    return list;
  }, [bookings, selectedStatus, filterPriority, searchQuery, sortBy]);

  const handleAction = async (action: string, bookingId: string) => {
    const token = localStorage.getItem("admin_token");
    let newStatus = "";

    switch (action) {
      case "approve":
        newStatus = "Sắp diễn ra"; // or 'pending_deposit' based on logic
        break;
      case "reject":
        newStatus = "Đã hủy";
        break;
      case "resolve":
        newStatus = "Hoàn thành"; // Example resolution
        break;
      case "cancel":
        const bookingToCancel = bookings.find(b => b.id === bookingId) || selectedBooking;
        setActionBooking(bookingToCancel || null);
        setCancelDialogOpen(true);
        return;
      case "contact_customer":
        alert(`Liên hệ khách hàng booking ${bookingId}`);
        return;
      case "contact_photographer":
        alert(`Liên hệ nhiếp ảnh gia booking ${bookingId}`);
        return;
      default:
        return;
    }

    if (newStatus) {
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId.replace('BK', '')}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
          fetchBookings();
          if (selectedBooking) {
            setSelectedBooking({
              ...selectedBooking,
              status: mapStatus(newStatus)
            });
          }
          alert("Đã cập nhật trạng thái booking");
        } else {
          alert("Cập nhật thất bại");
        }
      } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống");
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
    onClearSelection?.();
  };

  // === Detail view ===
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (selectedBooking) {
    const statusInfo = getStatusInfo(selectedBooking.status);
    const priorityInfo = getPriorityInfo(selectedBooking.priority);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseDetail}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-slate-800 dark:text-slate-100">
                Quản lý buổi chụp
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mã: {selectedBooking.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusInfo.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
              <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-24">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700">
              <TabsTrigger
                value="details"
                className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:!bg-blue-600"
              >
                Chi tiết
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:!bg-blue-600"
              >
                Người tham gia
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:!bg-blue-600"
              >
                Hành động
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Thông tin buổi chụp
                  </h3>

                  <div>
                    <h4 className="font-semibold text-xl text-slate-800 dark:text-slate-100 mb-2">
                      {selectedBooking.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedBooking.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 mb-1">
                        Thể loại
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {selectedBooking.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 mb-1">
                        Giá trị
                      </p>
                      <p className="font-medium text-pink-600 dark:text-pink-400">
                        {selectedBooking.price.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      Địa điểm
                    </p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {selectedBooking.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3" />
                        Ngày
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {new Date(selectedBooking.date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        Giờ
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">
                        {selectedBooking.time}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-100">
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Tạo booking:
                        </span>
                        <span className="text-slate-800 dark:text-slate-100">
                          {new Date(
                            selectedBooking.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Cập nhật cuối:
                        </span>
                        <span className="text-slate-800 dark:text-slate-100">
                          {new Date(
                            selectedBooking.lastUpdate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.flags.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-100">
                        Cờ đánh dấu
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.flags.map((flag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-slate-300 dark:border-slate-600"
                          >
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBooking.review && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Đánh giá của khách hàng
                        <Badge variant="outline" className="ml-auto flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {selectedBooking.review.rating}/5
                        </Badge>
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                          "{selectedBooking.review.comment || "Không có nội dung"}"
                        </p>
                        <p className="text-xs text-slate-400 mt-2 text-right">
                          {new Date(selectedBooking.review.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4 mt-4">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    Thông tin khách hàng
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src={selectedBooking.customer.avatar}
                      alt={selectedBooking.customer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        {selectedBooking.customer.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        ID: {selectedBooking.customer.id}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800 dark:text-slate-100">
                        {selectedBooking.customer.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800 dark:text-slate-100">
                        {selectedBooking.customer.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAction("contact_customer", selectedBooking.id)
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Liên hệ
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem hồ sơ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    Thông tin nhiếp ảnh gia
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src={selectedBooking.photographer.avatar}
                      alt={selectedBooking.photographer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        {selectedBooking.photographer.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{selectedBooking.photographer.rating}</span>
                        <span>•</span>
                        <span>ID: {selectedBooking.photographer.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800 dark:text-slate-100">
                        {selectedBooking.photographer.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAction("contact_photographer", selectedBooking.id)
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Liên hệ
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem hồ sơ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-4">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-6 text-slate-800 dark:text-slate-100">
                    Hành động quản trị
                  </h3>

                  <div className="space-y-3">
                    {selectedBooking.status === "pending_confirmation" && (
                      <>
                        <Button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() =>
                            handleAction("approve", selectedBooking.id)
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Phê duyệt booking
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                          onClick={() =>
                            handleAction("reject", selectedBooking.id)
                          }
                        >
                          <X className="w-4 h-4 mr-2" />
                          Từ chối booking
                        </Button>
                      </>
                    )}

                    {selectedBooking.status === "disputed" && (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() =>
                          handleAction("resolve", selectedBooking.id)
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Giải quyết tranh chấp
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() =>
                        handleAction("suspend", selectedBooking.id)
                      }
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Tạm dừng booking
                    </Button>

                    {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'disputed' && (
                      <Button
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleAction("cancel", selectedBooking.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Hủy Booking
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Xuất báo cáo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-sm mx-4 p-2">
            <DialogHeader>
              <DialogTitle>Xác nhận hủy Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Bạn đang thực hiện hủy booking{" "}
                  {actionBooking && (
                    <span className="font-medium">
                      {actionBooking.title}
                    </span>
                  )}
                </p>
                <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
                  Lý do hủy <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do hủy booking..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 !bg-red-600 hover:!bg-red-700 text-white"
                  onClick={confirmCancel}
                  disabled={!cancelReason.trim()}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // === List view ===

  return (
    <>
      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm mx-4 p-2">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Bạn đang thực hiện hủy booking{" "}
                {actionBooking && (
                  <span className="font-medium">
                    {actionBooking.title}
                  </span>
                )}
              </p>
              <Label htmlFor="reason" className="text-sm font-medium mb-2 block">
                Lý do hủy <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do hủy booking..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCancelDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 !bg-red-600 hover:!bg-red-700 text-white"
                onClick={confirmCancel}
                disabled={!cancelReason.trim()}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* List View */}
      <div className="p-4 space-y-4 pb-24 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quản lý buổi chụp
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTmpStatus(selectedStatus);
                setTmpSortBy(sortBy);
                setTmpPriority(filterPriority);
                setFilterOpen(true);
              }}
              className="hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo mã booking, tên khách hàng, nhiếp ảnh gia..."
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const priorityInfo = getPriorityInfo(booking.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={booking.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={() => setSelectedBooking(booking)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex -space-x-2">
                      <ImageWithFallback
                        src={booking.customer.avatar}
                        alt={booking.customer.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                      />
                      <ImageWithFallback
                        src={booking.photographer.avatar}
                        alt={booking.photographer.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold truncate text-slate-800 dark:text-slate-100">
                            {booking.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {booking.customer.name} ↔ {booking.photographer.name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(booking.date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{booking.time}</span>
                        </div>
                        <span className="font-semibold text-pink-600 dark:text-pink-400">
                          {booking.price.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-40">
                            {booking.location}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {booking.id}
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
                {/* Quick Actions Footer */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                    <Eye className="w-4 h-4 mr-1" /> Chi tiết
                  </Button>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction("cancel", booking.id)}>
                      <X className="w-4 h-4 mr-1" /> Hủy
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium mb-2">
                Không tìm thấy buổi chụp nào
              </p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Filter Dialog */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bộ lọc</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Trạng thái */}
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                  Trạng thái
                </label>
                <Select
                  value={tmpStatus}
                  onValueChange={(v: string) =>
                    setTmpStatus(v as BookingStatus | "all")
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Tất cả ({bookings.length})
                    </SelectItem>
                    <SelectItem value="pending_confirmation">
                      Chờ xác nhận
                    </SelectItem>
                    <SelectItem value="pending_deposit">Chờ đặt cọc</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                    <SelectItem value="pending_payment">
                      Chờ thanh toán
                    </SelectItem>
                    <SelectItem value="processing_photos">
                      Chờ xử lý ảnh
                    </SelectItem>
                    <SelectItem value="photos_ready">Đã xử lý ảnh</SelectItem>
                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                    <SelectItem value="disputed">Tranh chấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sắp xếp theo */}
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                  Sắp xếp theo
                </label>
                <Select
                  value={tmpSortBy}
                  onValueChange={(v: string) =>
                    setTmpSortBy(v as "date" | "priority" | "value")
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="Chọn tiêu chí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Ngày tạo</SelectItem>
                    <SelectItem value="priority">Độ ưu tiên</SelectItem>
                    <SelectItem value="value">Giá trị</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Độ ưu tiên */}
              <div>
                <label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">
                  Độ ưu tiên
                </label>
                <Select
                  value={tmpPriority}
                  onValueChange={(v: string) =>
                    setTmpPriority(v as "all" | "high" | "medium" | "low")
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTmpStatus("all");
                    setTmpSortBy("date");
                    setTmpPriority("all");
                  }}
                >
                  Đặt lại
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => {
                    setSelectedStatus(tmpStatus);
                    setSortBy(tmpSortBy);
                    setFilterPriority(tmpPriority);
                    setFilterOpen(false);
                  }}
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
