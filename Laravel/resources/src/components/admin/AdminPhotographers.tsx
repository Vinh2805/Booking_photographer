import { useState } from "react";
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
    "warn" | "suspend" | "ban" | "verify" | "reject" | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [sortBy, setSortBy] = useState<"joinDate" | "totalEarnings" | "rating">(
    "joinDate"
  );

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

  // Mock photographer data
  const photographers: AdminPhotographer[] = [
    {
      id: "PHOTO001",
      name: "Minh Tuấn",
      email: "minhtuan@gmail.com",
      phone: "0987654321",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2025-01-12",
      location: "Hà Nội",
      specialties: ["Cưới", "Chân dung", "Sự kiện"],
      totalBookings: 127,
      completedBookings: 125,
      totalEarnings: 380000000,
      averageRating: 4.9,
      reviewCount: 89,
      flags: ["verified", "top_performer"],
      warningCount: 0,
      verificationStatus: "verified",
      riskLevel: "low",
      portfolio: {
        imageCount: 156,
        lastUpdate: "2025-01-10",
      },
    },
    {
      id: "PHOTO002",
      name: "Đức Anh",
      email: "ducanh@gmail.com",
      phone: "0976543210",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      status: "active",
      joinDate: "2024-03-20",
      lastActive: "2025-01-11",
      location: "TP.HCM",
      specialties: ["Gia đình", "Trẻ em", "Maternity"],
      totalBookings: 89,
      completedBookings: 87,
      totalEarnings: 156000000,
      averageRating: 4.8,
      reviewCount: 56,
      flags: ["verified"],
      warningCount: 0,
      verificationStatus: "verified",
      riskLevel: "low",
      portfolio: {
        imageCount: 98,
        lastUpdate: "2025-01-08",
      },
    },
    {
      id: "PHOTO003",
      name: "Lan Hương",
      email: "lanhuong@gmail.com",
      phone: "0965432109",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face",
      status: "pending",
      joinDate: "2025-01-05",
      lastActive: "2025-01-12",
      location: "Đà Nẵng",
      specialties: ["Maternity", "Newborn", "Gia đình"],
      totalBookings: 0,
      completedBookings: 0,
      totalEarnings: 0,
      averageRating: 0,
      reviewCount: 0,
      flags: ["new_photographer"],
      warningCount: 0,
      verificationStatus: "pending",
      riskLevel: "low",
      portfolio: {
        imageCount: 23,
        lastUpdate: "2025-01-05",
      },
    },
    {
      id: "PHOTO004",
      name: "Thu Hà",
      email: "thuha@gmail.com",
      phone: "0954321098",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face",
      status: "suspended",
      joinDate: "2024-06-10",
      lastActive: "2025-01-01",
      location: "Hà Nội",
      specialties: ["Sự kiện", "Corporate", "Fashion"],
      totalBookings: 45,
      completedBookings: 38,
      totalEarnings: 95000000,
      averageRating: 3.2,
      reviewCount: 28,
      flags: ["quality_issues", "multiple_complaints"],
      warningCount: 3,
      verificationStatus: "verified",
      riskLevel: "high",
      portfolio: {
        imageCount: 67,
        lastUpdate: "2024-12-15",
      },
    },
    {
      id: "PHOTO005",
      name: "Ngọc Tuyền",
      email: "ngoctuyen@gmail.com",
      phone: "0943210987",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face",
      status: "inactive",
      joinDate: "2024-04-25",
      lastActive: "2024-11-30",
      location: "Hải Phòng",
      specialties: ["Couple", "Fashion", "Lifestyle"],
      totalBookings: 34,
      completedBookings: 32,
      totalEarnings: 78000000,
      averageRating: 4.5,
      reviewCount: 24,
      flags: ["inactive"],
      warningCount: 0,
      verificationStatus: "verified",
      riskLevel: "medium",
      portfolio: {
        imageCount: 89,
        lastUpdate: "2024-11-20",
      },
    },
  ];

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
    action: "warn" | "suspend" | "ban" | "verify" | "reject",
    photographer: AdminPhotographer
  ) => {
    setSelectedPhotographer(photographer);
    setActionType(action);
    setShowActionDialog(true);
  };

  const executeAction = () => {
    if (!selectedPhotographer || !actionType) return;

    const actionLabels = {
      warn: "Gửi cảnh báo",
      suspend: "Tạm khóa",
      ban: "Cấm vĩnh viễn",
      verify: "Xác minh",
      reject: "Từ chối xác minh",
    };

    alert(
      `${actionLabels[actionType]} tài khoản ${selectedPhotographer.name}\nLý do: ${actionReason}`
    );
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterDialog(true)}
            className={
              hasActiveFilters()
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : ""
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            Lọc
            {hasActiveFilters() && (
              <Badge className="ml-1 h-4 px-1 bg-blue-500">
                {filters.statuses.length +
                  filters.verificationStatuses.length +
                  filters.riskLevels.length +
                  filters.locations.length +
                  filters.specialties.length +
                  (filters.hasWarnings ? 1 : 0) +
                  (filters.hasFlags ? 1 : 0)}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email, chuyên môn, ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Photographers List */}
      <div className="space-y-3">
        {filteredPhotographers.map((photographer) => {
          const statusInfo = getStatusInfo(photographer.status);
          const verificationInfo = getVerificationInfo(
            photographer.verificationStatus
          );

          return (
            <Card
              key={photographer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPhotographer(photographer)}
            >
              <CardContent className="p-4">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-medium">{photographer.name}</h3>
                        <p className="text-sm text-gray-600">
                          {photographer.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Badge className={verificationInfo.color}>
                          {verificationInfo.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{photographer.location}</span>
                      </div>
                      {photographer.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{photographer.averageRating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-wrap gap-1">
                        {photographer.specialties
                          .slice(0, 2)
                          .map((specialty, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        {photographer.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{photographer.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-pink-600">
                          {photographer.totalEarnings.toLocaleString("vi-VN")}{" "}
                          VNĐ
                        </p>
                        <p className="text-xs text-gray-500">
                          {photographer.totalBookings} booking
                        </p>
                      </div>
                    </div>

                    {/* Warning indicator */}
                    {photographer.warningCount > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-700">
                          {photographer.warningCount} cảnh báo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPhotographers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
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
