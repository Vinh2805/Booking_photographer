import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  AlertTriangle,
  Ban,
  Eye,
  MessageCircle,
  FileText,
  Download,
  ArrowLeft,
  Clock,
  Camera,
  DollarSign,
  UserX,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

type PhotographerStatus =
  | "active"
  | "suspended"
  | "banned"
  | "pending"
  | "inactive"
  | "verified";

interface AdminPhotographer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: PhotographerStatus;
  joinDate: string;
  lastActive: string;
  location: string;
  specialties: string[];
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  flags: string[];
  warningCount: number;
  verificationStatus: "verified" | "pending" | "rejected";
  riskLevel: "low" | "medium" | "high";
  portfolio: {
    imageCount: number;
    lastUpdate: string;
  };
}

interface FilterOptions {
  statuses: string[];
  verificationStatuses: string[];
  riskLevels: string[];
  locations: string[];
  specialties: string[];
  earningsRange: [number, number];
  bookingRange: [number, number];
  ratingRange: [number, number];
  joinDateFrom: Date | null;
  joinDateTo: Date | null;
  hasWarnings: boolean;
  hasFlags: boolean;
}

export function AdminPhotographers() {
  const [selectedStatus, setSelectedStatus] = useState<
    PhotographerStatus | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<AdminPhotographer | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "warn" | "suspend" | "ban" | "verify" | "reject" | "delete" | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [sortBy, setSortBy] = useState<"joinDate" | "totalEarnings" | "rating">(
    "joinDate"
  );
  const [activeTab, setActiveTab] = useState<"list" | "approvals">("list");

  const [filters, setFilters] = useState<FilterOptions>({
    statuses: [],
    verificationStatuses: [],
    riskLevels: [],
    locations: [],
    specialties: [],
    earningsRange: [0, 500000000],
    bookingRange: [0, 200],
    ratingRange: [0, 5],
    joinDateFrom: null,
    joinDateTo: null,
    hasWarnings: false,
    hasFlags: false,
  });

  // API Data
  const [photographers, setPhotographers] = useState<AdminPhotographer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch photographers from API
  const fetchPhotographers = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/admin/photographers", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        
        // Transform API data to AdminPhotographer shape
        if (data.data) {
            const transformed = data.data.map((item: any) => {
                let status: PhotographerStatus = "pending";
                if (item.Trang_Thai === 'Approved') status = "active";
                else if (item.Trang_Thai === 'Locked') status = "banned";
                else if (item.Trang_Thai === 'Rejected') status = "inactive";
                else if (item.Trang_Thai === 'Pending') status = "pending";

                let verifyStatus: "verified" | "pending" | "rejected" = "pending";
                if (item.Trang_Thai === 'Approved') verifyStatus = "verified";
                else if (item.Trang_Thai === 'Rejected') verifyStatus = "rejected";

                return {
                    id: item.Ma_NAG,
                    name: item.tai_khoan?.Ho_Ten || "N/A",
                    email: item.tai_khoan?.Email_TK || "N/A",
                    phone: item.tai_khoan?.So_Dien_Thoai || "N/A",
                    avatar: item.tai_khoan?.Avatar ? `/storage/avatars/${item.tai_khoan.Avatar}` : "https://github.com/shadcn.png",
                    status: status,
                    joinDate: item.tai_khoan?.created_at || "2024-01-01",
                    lastActive: "2024-01-01",
                    location: item.Dia_Diem_Hoat_Dong || "Chưa cập nhật",
                    specialties: [], 
                    totalBookings: 0,
                    completedBookings: 0,
                    totalEarnings: item.So_Du || 0,
                    averageRating: 0,
                    reviewCount: 0,
                    flags: [],
                    warningCount: 0,
                    verificationStatus: verifyStatus,
                    riskLevel: "low",
                    portfolio: {
                        imageCount: 0,
                        lastUpdate: "N/A"
                    }
                };
            });
            setPhotographers(transformed);
        }
    } catch (err) {
        console.error("Failed to fetch photographers", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const getStatusInfo = (status: PhotographerStatus) => {
    const statusMap = {
      active: {
        label: "Hoạt động",
        color: "bg-green-100 text-green-800",
      },
      suspended: {
        label: "Tạm khóa",
        color: "bg-orange-100 text-orange-800",
      },
      banned: {
        label: "Cấm vĩnh viễn",
        color: "bg-red-100 text-red-800",
      },
      pending: {
        label: "Chờ duyệt",
        color: "bg-yellow-100 text-yellow-800",
      },
      inactive: {
        label: "Không hoạt động",
        color: "bg-gray-100 text-gray-800",
      },
      verified: {
        label: "Đã xác minh",
        color: "bg-blue-100 text-blue-800",
      },
    };
    return statusMap[status];
  };

  const getVerificationInfo = (verification: string) => {
    switch (verification) {
      case "verified":
        return {
          label: "Đã xác minh",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Chờ xác minh",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "rejected":
        return {
          label: "Bị từ chối",
          color: "bg-red-100 text-red-800",
          icon: XCircle,
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
          icon: AlertTriangle,
        };
    }
  };

  const getRiskInfo = (risk: string) => {
    switch (risk) {
      case "high":
        return {
          label: "Cao",
          color: "bg-red-100 text-red-800",
        };
      case "medium":
        return {
          label: "Trung bình",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "low":
        return {
          label: "Thấp",
          color: "bg-green-100 text-green-800",
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const applyFilters = (photographer: AdminPhotographer) => {
    // Status filter
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(photographer.status)
    ) {
      return false;
    }

    // Verification status filter
    if (
      filters.verificationStatuses.length > 0 &&
      !filters.verificationStatuses.includes(photographer.verificationStatus)
    ) {
      return false;
    }

    // Risk level filter
    if (
      filters.riskLevels.length > 0 &&
      !filters.riskLevels.includes(photographer.riskLevel)
    ) {
      return false;
    }

    // Location filter
    if (
      filters.locations.length > 0 &&
      !filters.locations.includes(photographer.location)
    ) {
      return false;
    }

    // Specialties filter
    if (
      filters.specialties.length > 0 &&
      !filters.specialties.some((s) => photographer.specialties.includes(s))
    ) {
      return false;
    }

    // Earnings range filter
    if (
      photographer.totalEarnings < filters.earningsRange[0] ||
      photographer.totalEarnings > filters.earningsRange[1]
    ) {
      return false;
    }

    // Booking range filter
    if (
      photographer.totalBookings < filters.bookingRange[0] ||
      photographer.totalBookings > filters.bookingRange[1]
    ) {
      return false;
    }

    // Rating range filter
    if (
      photographer.averageRating > 0 &&
      (photographer.averageRating < filters.ratingRange[0] ||
        photographer.averageRating > filters.ratingRange[1])
    ) {
      return false;
    }

    // Warnings filter
    if (filters.hasWarnings && photographer.warningCount === 0) {
      return false;
    }

    // Flags filter
    if (filters.hasFlags && photographer.flags.length === 0) {
      return false;
    }

    return true;
  };


  const filteredPhotographers = photographers.filter((photographer) => {
    // Tab filtering
    if (activeTab === "approvals" && photographer.verificationStatus !== "pending") return false;
    if (activeTab === "list" && photographer.verificationStatus === "pending") return false;

    const matchesStatus =
      selectedStatus === "all" || photographer.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photographer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photographer.phone.includes(searchQuery) ||
      photographer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photographer.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesFilters = applyFilters(photographer);

    return matchesStatus && matchesSearch && matchesFilters;
  });

  const handleAction = (
    action: "warn" | "suspend" | "ban" | "verify" | "reject" | "delete",
    photographer: AdminPhotographer
  ) => {
    setSelectedPhotographer(photographer);
    setActionType(action as any);
    setShowActionDialog(true);
  };

  const executeAction = async () => {
    if (!selectedPhotographer || !actionType) return;

    try {
        const token = localStorage.getItem("admin_token");
        
        if (actionType === 'delete') {
            const res = await fetch(`/api/admin/photographers/${selectedPhotographer.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchPhotographers();
            else alert("Xóa thất bại");
        } else {
            let newStatus = "";
            // Map Admin Action to DB Status
            if (actionType === 'verify') newStatus = 'Approved';
            else if (actionType === 'reject') newStatus = 'Rejected';
            else if (actionType === 'suspend') newStatus = 'Locked';
            else if (actionType === 'ban') newStatus = 'Locked';

            if (newStatus) {
                 const res = await fetch(`/api/admin/photographers/${selectedPhotographer.id}/status`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (res.ok) {
                    fetchPhotographers();
                } else {
                    alert("Cập nhật thất bại!");
                }
            }
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống");
    }

    setShowActionDialog(false);
    setActionType(null);
    setActionReason("");
    setSelectedPhotographer(null);
  };

  const clearFilters = () => {
    setFilters({
      statuses: [],
      verificationStatuses: [],
      riskLevels: [],
      locations: [],
      specialties: [],
      earningsRange: [0, 500000000],
      bookingRange: [0, 200],
      ratingRange: [0, 5],
      joinDateFrom: null,
      joinDateTo: null,
      hasWarnings: false,
      hasFlags: false,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.statuses.length > 0 ||
      filters.verificationStatuses.length > 0 ||
      filters.riskLevels.length > 0 ||
      filters.locations.length > 0 ||
      filters.specialties.length > 0 ||
      filters.earningsRange[0] > 0 ||
      filters.earningsRange[1] < 500000000 ||
      filters.bookingRange[0] > 0 ||
      filters.bookingRange[1] < 200 ||
      filters.ratingRange[0] > 0 ||
      filters.ratingRange[1] < 5 ||
      filters.joinDateFrom ||
      filters.joinDateTo ||
      filters.hasWarnings ||
      filters.hasFlags
    );
  };

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

    // Photographer detail view
    if (selectedPhotographer && !showActionDialog) {
    const statusInfo = getStatusInfo(selectedPhotographer.status);
    const verificationInfo = getVerificationInfo(
      selectedPhotographer.verificationStatus
    );
    const riskInfo = getRiskInfo(selectedPhotographer.riskLevel);
    const VerificationIcon = verificationInfo.icon;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPhotographer(null)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Quản lý nhiếp ảnh gia</h1>
              <p className="text-sm text-gray-600">
                ID: {selectedPhotographer.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              <Badge className={verificationInfo.color}>
                <VerificationIcon className="w-3 h-3 mr-1" />
                {verificationInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-24">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
              <TabsTrigger value="actions">Hành động</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              {/* Profile Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <ImageWithFallback
                        src={selectedPhotographer.avatar}
                        alt={selectedPhotographer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {selectedPhotographer.verificationStatus ===
                        "verified" && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedPhotographer.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedPhotographer.location}</span>
                        {selectedPhotographer.averageRating > 0 && (
                          <>
                            <span>•</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>
                              {selectedPhotographer.averageRating} (
                              {selectedPhotographer.reviewCount} đánh giá)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedPhotographer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {selectedPhotographer.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Tham gia:{" "}
                        {new Date(
                          selectedPhotographer.joinDate
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Hoạt động cuối:{" "}
                        {new Date(
                          selectedPhotographer.lastActive
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Chuyên môn</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPhotographer.specialties.map(
                        (specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  {/* Warning Count */}
                  {selectedPhotographer.warningCount > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">
                          {selectedPhotographer.warningCount} cảnh báo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Risk Level */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Mức độ rủi ro:
                      </span>
                      <Badge className={riskInfo.color}>{riskInfo.label}</Badge>
                    </div>
                  </div>

                  {/* Flags */}
                  {selectedPhotographer.flags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Cờ đánh dấu</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPhotographer.flags.map((flag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedPhotographer.totalBookings}
                    </p>
                    <p className="text-sm text-gray-600">Tổng booking</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {selectedPhotographer.totalEarnings.toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Tổng thu nhập</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedPhotographer.completedBookings}
                    </p>
                    <p className="text-sm text-gray-600">Đã hoàn thành</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedPhotographer.averageRating > 0
                        ? selectedPhotographer.averageRating
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">Đánh giá TB</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4 mt-4">
              {/* Portfolio Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Thông tin Portfolio</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-bold text-lg">
                        {selectedPhotographer.portfolio.imageCount}
                      </p>
                      <p className="text-sm text-gray-600">Ảnh portfolio</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <p className="font-bold text-sm">
                        {new Date(
                          selectedPhotographer.portfolio.lastUpdate
                        ).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-gray-600">Cập nhật cuối</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem portfolio đầy đủ
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              {/* Recent Activity */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Hoạt động gần đây</h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Hoàn thành booking
                        </p>
                        <p className="text-sm text-gray-600">
                          Booking BK005 - Chụp ảnh gia đình
                        </p>
                        <p className="text-xs text-gray-500">1 ngày trước</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Upload ảnh hậu kỳ</p>
                        <p className="text-sm text-gray-600">
                          45 ảnh cho booking BK004
                        </p>
                        <p className="text-xs text-gray-500">3 ngày trước</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Nhận đánh giá mới</p>
                        <p className="text-sm text-gray-600">
                          5 sao từ Nguyễn Văn A
                        </p>
                        <p className="text-xs text-gray-500">1 tuần trước</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Hiệu suất tháng này</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Booking mới</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">95%</p>
                      <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">4.8</p>
                      <p className="text-sm text-gray-600">Đánh giá TB</p>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded-lg">
                      <p className="text-2xl font-bold text-pink-600">2.5M</p>
                      <p className="text-sm text-gray-600">Thu nhập (VNĐ)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4 mt-4">
              {/* Admin Actions */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Hành động quản trị</h3>

                  <div className="space-y-3">
                    {selectedPhotographer.verificationStatus === "pending" && (
                      <>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleAction("verify", selectedPhotographer)
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Xác minh tài khoản
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() =>
                            handleAction("reject", selectedPhotographer)
                          }
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối xác minh
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAction("warn", selectedPhotographer)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Gửi cảnh báo
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                      onClick={() =>
                        handleAction("suspend", selectedPhotographer)
                      }
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Tạm khóa tài khoản
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleAction("ban", selectedPhotographer)}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Cấm vĩnh viễn
                    </Button>

                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Gửi tin nhắn
                    </Button>

                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Xuất báo cáo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý nhiếp ảnh gia</h1>
         <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
             <TabsList>
                 <TabsTrigger value="list">Danh sách ({photographers.filter(p => p.verificationStatus !== "pending").length})</TabsTrigger>
                 <TabsTrigger value="approvals" className="relative">
                     Xét duyệt 
                     {photographers.filter(p => p.verificationStatus === "pending").length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {photographers.filter(p => p.verificationStatus === "pending").length}
                        </span>
                     )}
                 </TabsTrigger>
             </TabsList>
         </Tabs>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Tìm kiếm theo tên, email, chuyên môn, ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
             <Button
                variant="outline"
                className={hasActiveFilters() ? "bg-blue-50 border-blue-200" : ""}
                onClick={() => setShowFilterDialog(true)}
            >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
                {hasActiveFilters() && (
                <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
            </Button>
            {hasActiveFilters() && (
               <Button variant="ghost" onClick={clearFilters}>
                   Xóa lọc
               </Button>
            )}
        </div>
      </div>

      {/* Photographers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPhotographers.map((photographer) => {
          const statusInfo = getStatusInfo(photographer.status);
          const verificationInfo = getVerificationInfo(
            photographer.verificationStatus
          );
          const VerificationIcon = verificationInfo.icon;

          return (
            <Card
              key={photographer.id}
              className="cursor-pointer hover:shadow-md transition-shadow group relative"
              onClick={() => setSelectedPhotographer(photographer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ImageWithFallback
                            src={photographer.avatar}
                            alt={photographer.name}
                            className="w-12 h-12 rounded-full object-cover"
                            />
                            {photographer.verificationStatus === "verified" && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            )}
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                            {photographer.name}
                            </h3>
                            <p className="text-xs text-gray-500">ID: {photographer.id}</p>
                        </div>
                    </div>
                  <Badge className={statusInfo?.color}>
                    {statusInfo?.label}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                   <p className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" /> {photographer.location}
                   </p>
                   <p className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {photographer.averageRating > 0 ? photographer.averageRating : "New"} • {photographer.totalBookings} bookings
                   </p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {photographer.specialties
                    .slice(0, 3)
                    .map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  {photographer.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{photographer.specialties.length - 3}
                    </Badge>
                  )}
                </div>

                 {/* Quick Actions (Prevent bubbling) */}
                 <div className="flex justify-end gap-2 mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPhotographer(photographer)}>
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                    </Button>

                        {activeTab === 'approvals' ? (
                            <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={(e) => { e.stopPropagation(); handleAction('verify', photographer); }}>
                                    <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={(e) => { e.stopPropagation(); handleAction('reject', photographer); }}>
                                    <XCircle className="w-4 h-4 mr-1" /> Từ chối
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-8 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleAction('delete', photographer); }}>
                                <UserX className="w-4 h-4 mr-1" /> Xóa
                            </Button>
                        )}
                </div>

              </CardContent>
            </Card>
          );
        })}

        {filteredPhotographers.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không tìm thấy nhiếp ảnh gia nào</p>
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[85vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Bộ lọc nhiếp ảnh gia</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <h4 className="font-medium mb-3">Trạng thái</h4>
              <div className="space-y-2">
                {[
                  { value: "active", label: "Hoạt động" },
                  { value: "pending", label: "Chờ duyệt" },
                  { value: "suspended", label: "Tạm khóa" },
                  {
                    value: "inactive",
                    label: "Không hoạt động",
                  },
                  { value: "banned", label: "Cấm" },
                  { value: "verified", label: "Đã xác minh" },
                ].map((status) => (
                  <div
                    key={status.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={(checked: any) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            statuses: [...prev.statuses, status.value],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            statuses: prev.statuses.filter(
                              (s) => s !== status.value
                            ),
                          }));
                        }
                      }}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-sm"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Level Filter */}
            <div>
              <h4 className="font-medium mb-3">Mức độ rủi ro</h4>
              <div className="space-y-2">
                {[
                  { value: "low", label: "Thấp" },
                  { value: "medium", label: "Trung bình" },
                  { value: "high", label: "Cao" },
                ].map((risk) => (
                  <div key={risk.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`risk-${risk.value}`}
                      checked={filters.riskLevels.includes(risk.value)}
                      onCheckedChange={(checked: any) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            riskLevels: [...prev.riskLevels, risk.value],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            riskLevels: prev.riskLevels.filter(
                              (r) => r !== risk.value
                            ),
                          }));
                        }
                      }}
                    />
                    <label htmlFor={`risk-${risk.value}`} className="text-sm">
                      {risk.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h4 className="font-medium mb-3">Địa điểm</h4>
              <div className="space-y-2">
                {["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"].map(
                  (location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={filters.locations.includes(location)}
                        onCheckedChange={(checked: any) => {
                          if (checked) {
                            setFilters((prev) => ({
                              ...prev,
                              locations: [...prev.locations, location],
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              locations: prev.locations.filter(
                                (l) => l !== location
                              ),
                            }));
                          }
                        }}
                      />
                      <label
                        htmlFor={`location-${location}`}
                        className="text-sm"
                      >
                        {location}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Specialties Filter */}
            <div>
              <h4 className="font-medium mb-3">Chuyên môn</h4>
              <div className="space-y-2">
                {[
                  "Cưới",
                  "Chân dung",
                  "Gia đình",
                  "Trẻ em",
                  "Maternity",
                  "Sự kiện",
                  "Corporate",
                  "Fashion",
                  "Couple",
                  "Lifestyle",
                ].map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={filters.specialties.includes(specialty)}
                      onCheckedChange={(checked: any) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            specialties: [...prev.specialties, specialty],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            specialties: prev.specialties.filter(
                              (s) => s !== specialty
                            ),
                          }));
                        }
                      }}
                    />
                    <label
                      htmlFor={`specialty-${specialty}`}
                      className="text-sm"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Range */}
            <div>
              <h4 className="font-medium mb-3">Tổng thu nhập (VNĐ)</h4>
              <div className="space-y-3">
                <Slider
                  value={filters.earningsRange}
                  onValueChange={(value: [number, number]) =>
                    setFilters((prev) => ({
                      ...prev,
                      earningsRange: value as [number, number],
                    }))
                  }
                  max={500000000}
                  step={10000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {(filters.earningsRange[0] / 1000000).toFixed(0)}M VNĐ
                  </span>
                  <span>
                    {(filters.earningsRange[1] / 1000000).toFixed(0)}M VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Range */}
            <div>
              <h4 className="font-medium mb-3">Số booking</h4>
              <div className="space-y-3">
                <Slider
                  value={filters.bookingRange}
                  onValueChange={(value: [number, number]) =>
                    setFilters((prev) => ({
                      ...prev,
                      bookingRange: value as [number, number],
                    }))
                  }
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.bookingRange[0]} booking</span>
                  <span>{filters.bookingRange[1]} booking</span>
                </div>
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <h4 className="font-medium mb-3">Đánh giá</h4>
              <div className="space-y-3">
                <Slider
                  value={filters.ratingRange}
                  onValueChange={(value: [number, number]) =>
                    setFilters((prev) => ({
                      ...prev,
                      ratingRange: value as [number, number],
                    }))
                  }
                  max={5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.ratingRange[0].toFixed(1)} sao</span>
                  <span>{filters.ratingRange[1].toFixed(1)} sao</span>
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <h4 className="font-medium mb-3">Bộ lọc khác</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-warnings"
                    checked={filters.hasWarnings}
                    onCheckedChange={(checked: any) =>
                      setFilters((prev) => ({
                        ...prev,
                        hasWarnings: !!checked,
                      }))
                    }
                  />
                  <label htmlFor="has-warnings" className="text-sm">
                    Có cảnh báo
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-flags"
                    checked={filters.hasFlags}
                    onCheckedChange={(checked: any) =>
                      setFilters((prev) => ({
                        ...prev,
                        hasFlags: !!checked,
                      }))
                    }
                  />
                  <label htmlFor="has-flags" className="text-sm">
                    Có cờ đánh dấu
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Xóa bộ lọc
            </Button>
            <Button
              onClick={() => setShowFilterDialog(false)}
              className="flex-1"
            >
              Áp dụng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {actionType === "warn" && "Gửi cảnh báo"}
              {actionType === "suspend" && "Tạm khóa tài khoản"}
              {actionType === "ban" && "Cấm vĩnh viễn tài khoản"}
              {actionType === "verify" && "Xác minh tài khoản"}
              {actionType === "reject" && "Từ chối xác minh"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Bạn đang thực hiện hành động đối với tài khoản{" "}
                <span className="font-medium">
                  {selectedPhotographer?.name}
                </span>
              </p>
              <label className="text-sm font-medium mb-2 block">Lý do</label>
              <Input
                placeholder="Nhập lý do..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>

            {actionType === "ban" && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Cảnh báo:</strong> Hành động này sẽ cấm vĩnh viễn tài
                  khoản và không thể hoàn tác.
                </p>
              </div>
            )}

            {actionType === "verify" && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  Tài khoản sẽ được xác minh và có thể nhận booking từ khách
                  hàng.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowActionDialog(false)}
              >
                Hủy
              </Button>
              <Button
                className={`flex-1 ${
                  actionType === "ban"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionType === "suspend"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : actionType === "verify"
                    ? "bg-green-600 hover:bg-green-700"
                    : actionType === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
                onClick={executeAction}
                disabled={!actionReason}
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
