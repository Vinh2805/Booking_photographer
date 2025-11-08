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
  Download,
  ArrowLeft,
  Clock,
  Camera,
  DollarSign,
  UserX,
  Users,
} from "lucide-react";

type CustomerStatus = "active" | "suspended" | "banned" | "new" | "inactive";

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: CustomerStatus;
  joinDate: string;
  lastActive: string;
  location: string;
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageRating: number;
  flags: string[];
  warningCount: number;
  riskLevel: "low" | "medium" | "high";
}

interface FilterOptions {
  statuses: string[];
  riskLevels: string[];
  locations: string[];
  spentRange: [number, number];
  bookingRange: [number, number];
  joinDateFrom: Date | null;
  joinDateTo: Date | null;
  hasWarnings: boolean;
  hasFlags: boolean;
}

export function AdminCustomers() {
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [actionType, setActionType] = useState<
    "warn" | "suspend" | "ban" | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [sortBy, setSortBy] = useState<"joinDate" | "totalSpent" | "riskLevel">(
    "joinDate"
  );

  const [filters, setFilters] = useState<FilterOptions>({
    statuses: [],
    riskLevels: [],
    locations: [],
    spentRange: [0, 50000000],
    bookingRange: [0, 50],
    joinDateFrom: null,
    joinDateTo: null,
    hasWarnings: false,
    hasFlags: false,
  });

  // Mock customer data
  const customers: AdminCustomer[] = [
    {
      id: "CUST001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0901234567",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
      status: "active",
      joinDate: "2024-03-15",
      lastActive: "2025-01-12",
      location: "Hà Nội",
      totalBookings: 8,
      completedBookings: 6,
      totalSpent: 15000000,
      averageRating: 4.8,
      flags: ["vip_customer"],
      warningCount: 0,
      riskLevel: "low",
    },
    {
      id: "CUST002",
      name: "Trần Thị B",
      email: "tranthib@gmail.com",
      phone: "0912345678",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face",
      status: "new",
      joinDate: "2025-01-10",
      lastActive: "2025-01-12",
      location: "TP.HCM",
      totalBookings: 1,
      completedBookings: 0,
      totalSpent: 0,
      averageRating: 0,
      flags: ["new_user"],
      warningCount: 0,
      riskLevel: "low",
    },
    {
      id: "CUST003",
      name: "Hoàng Thị C",
      email: "hoangthic@gmail.com",
      phone: "0923456789",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face",
      status: "suspended",
      joinDate: "2024-08-20",
      lastActive: "2025-01-05",
      location: "Đà Nẵng",
      totalBookings: 12,
      completedBookings: 8,
      totalSpent: 8500000,
      averageRating: 3.2,
      flags: ["payment_issues", "multiple_complaints"],
      warningCount: 2,
      riskLevel: "high",
    },
    {
      id: "CUST004",
      name: "Lê Văn D",
      email: "levand@company.com",
      phone: "0934567890",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      status: "active",
      joinDate: "2024-01-10",
      lastActive: "2025-01-11",
      location: "Hà Nội",
      totalBookings: 25,
      completedBookings: 23,
      totalSpent: 45000000,
      averageRating: 4.9,
      flags: ["corporate_client", "high_value"],
      warningCount: 0,
      riskLevel: "low",
    },
    {
      id: "CUST005",
      name: "Phạm Thị E",
      email: "phamthie@gmail.com",
      phone: "0945678901",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      status: "inactive",
      joinDate: "2024-05-15",
      lastActive: "2024-11-20",
      location: "Hải Phòng",
      totalBookings: 3,
      completedBookings: 3,
      totalSpent: 4200000,
      averageRating: 4.5,
      flags: ["inactive_user"],
      warningCount: 0,
      riskLevel: "medium",
    },
  ];

  const getStatusInfo = (status: CustomerStatus) => {
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
      new: { label: "Mới", color: "bg-blue-100 text-blue-800" },
      inactive: {
        label: "Không hoạt động",
        color: "bg-gray-100 text-gray-800",
      },
    };
    return statusMap[status];
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

  const applyFilters = (customer: AdminCustomer) => {
    // Status filter
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(customer.status)
    ) {
      return false;
    }

    // Risk level filter
    if (
      filters.riskLevels.length > 0 &&
      !filters.riskLevels.includes(customer.riskLevel)
    ) {
      return false;
    }

    // Location filter
    if (
      filters.locations.length > 0 &&
      !filters.locations.includes(customer.location)
    ) {
      return false;
    }

    // Spent range filter
    if (
      customer.totalSpent < filters.spentRange[0] ||
      customer.totalSpent > filters.spentRange[1]
    ) {
      return false;
    }

    // Booking range filter
    if (
      customer.totalBookings < filters.bookingRange[0] ||
      customer.totalBookings > filters.bookingRange[1]
    ) {
      return false;
    }

    // Warnings filter
    if (filters.hasWarnings && customer.warningCount === 0) {
      return false;
    }

    // Flags filter
    if (filters.hasFlags && customer.flags.length === 0) {
      return false;
    }

    return true;
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus =
      selectedStatus === "all" || customer.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = applyFilters(customer);

    return matchesStatus && matchesSearch && matchesFilters;
  });

  const handleAction = (
    action: "warn" | "suspend" | "ban",
    customer: AdminCustomer
  ) => {
    setSelectedCustomer(customer);
    setActionType(action);
    setShowActionDialog(true);
  };

  const executeAction = () => {
    if (!selectedCustomer || !actionType) return;

    const actionLabels = {
      warn: "Gửi cảnh báo",
      suspend: "Tạm khóa",
      ban: "Cấm vĩnh viễn",
    };

    alert(
      `${actionLabels[actionType]} tài khoản ${selectedCustomer.name}\nLý do: ${actionReason}`
    );
    setShowActionDialog(false);
    setActionType(null);
    setActionReason("");
    setSelectedCustomer(null);
  };

  const clearFilters = () => {
    setFilters({
      statuses: [],
      riskLevels: [],
      locations: [],
      spentRange: [0, 50000000],
      bookingRange: [0, 50],
      joinDateFrom: null,
      joinDateTo: null,
      hasWarnings: false,
      hasFlags: false,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.statuses.length > 0 ||
      filters.riskLevels.length > 0 ||
      filters.locations.length > 0 ||
      filters.spentRange[0] > 0 ||
      filters.spentRange[1] < 50000000 ||
      filters.bookingRange[0] > 0 ||
      filters.bookingRange[1] < 50 ||
      filters.joinDateFrom ||
      filters.joinDateTo ||
      filters.hasWarnings ||
      filters.hasFlags
    );
  };

  // Customer detail view
  if (selectedCustomer && !showActionDialog) {
    const statusInfo = getStatusInfo(selectedCustomer.status);
    const riskInfo = getRiskInfo(selectedCustomer.riskLevel);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">Quản lý khách hàng</h1>
              <p className="text-sm text-gray-600">ID: {selectedCustomer.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              <Badge className={riskInfo.color}>Rủi ro: {riskInfo.label}</Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-24">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động</TabsTrigger>
              <TabsTrigger value="actions">Hành động</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              {/* Profile Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedCustomer.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedCustomer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Tham gia:{" "}
                        {new Date(selectedCustomer.joinDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Hoạt động cuối:{" "}
                        {new Date(
                          selectedCustomer.lastActive
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Warning Count */}
                  {selectedCustomer.warningCount > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">
                          {selectedCustomer.warningCount} cảnh báo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Flags */}
                  {selectedCustomer.flags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Cờ đánh dấu</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.flags.map((flag, index) => (
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
                      {selectedCustomer.totalBookings}
                    </p>
                    <p className="text-sm text-gray-600">Tổng booking</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">
                      {selectedCustomer.totalSpent.toLocaleString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.completedBookings}
                    </p>
                    <p className="text-sm text-gray-600">Đã hoàn thành</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedCustomer.averageRating > 0
                        ? selectedCustomer.averageRating
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">Đánh giá TB</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              {/* Recent Activity */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Hoạt động gần đây</h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Đặt booking mới</p>
                        <p className="text-sm text-gray-600">
                          Booking BK005 - Chụp ảnh gia đình
                        </p>
                        <p className="text-xs text-gray-500">2 ngày trước</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Thanh toán thành công
                        </p>
                        <p className="text-sm text-gray-600">
                          1,500,000 VNĐ cho booking BK004
                        </p>
                        <p className="text-xs text-gray-500">1 tuần trước</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Đánh giá nhiếp ảnh gia
                        </p>
                        <p className="text-sm text-gray-600">
                          5 sao cho Minh Tuấn
                        </p>
                        <p className="text-xs text-gray-500">2 tuần trước</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Lịch sử booking</h3>

                  <div className="space-y-2">
                    {["BK001", "BK003", "BK007", "BK012"].map(
                      (bookingId, index) => (
                        <div
                          key={bookingId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{bookingId}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              Hoàn thành
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    )}
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
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAction("warn", selectedCustomer)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Gửi cảnh báo
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                      onClick={() => handleAction("suspend", selectedCustomer)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Tạm khóa tài khoản
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleAction("ban", selectedCustomer)}
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
        <h1 className="text-xl font-bold">Quản lý khách hàng</h1>
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
                  filters.riskLevels.length +
                  filters.locations.length +
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
            placeholder="Tìm kiếm theo tên, email, số điện thoại, ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.map((customer) => {
          const statusInfo = getStatusInfo(customer.status);
          const riskInfo = getRiskInfo(customer.riskLevel);

          return (
            <Card
              key={customer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ImageWithFallback
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-gray-600">
                          {customer.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Badge className={riskInfo.color}>
                          {riskInfo.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{customer.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-pink-600">
                          {customer.totalSpent.toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.totalBookings} booking
                        </p>
                      </div>
                    </div>

                    {/* Warning indicator */}
                    {customer.warningCount > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-700">
                          {customer.warningCount} cảnh báo
                        </span>
                      </div>
                    )}

                    {/* Flags */}
                    {customer.flags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {customer.flags.slice(0, 2).map((flag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {flag}
                          </Badge>
                        ))}
                        {customer.flags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{customer.flags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không tìm thấy khách hàng nào</p>
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[85vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Bộ lọc khách hàng</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <h4 className="font-medium mb-3">Trạng thái</h4>
              <div className="space-y-2">
                {[
                  { value: "active", label: "Hoạt động" },
                  { value: "new", label: "Mới" },
                  { value: "suspended", label: "Tạm khóa" },
                  {
                    value: "inactive",
                    label: "Không hoạt động",
                  },
                  { value: "banned", label: "Cấm" },
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

            {/* Spent Range */}
            <div>
              <h4 className="font-medium mb-3">Tổng chi tiêu (VNĐ)</h4>
              <div className="space-y-3">
                <Slider
                  value={filters.spentRange}
                  onValueChange={(value: [number, number]) =>
                    setFilters((prev) => ({
                      ...prev,
                      spentRange: value as [number, number],
                    }))
                  }
                  max={50000000}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {filters.spentRange[0].toLocaleString("vi-VN")} VNĐ
                  </span>
                  <span>
                    {filters.spentRange[1].toLocaleString("vi-VN")} VNĐ
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
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.bookingRange[0]} booking</span>
                  <span>{filters.bookingRange[1]} booking</span>
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
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Bạn đang thực hiện hành động đối với tài khoản{" "}
                <span className="font-medium">{selectedCustomer?.name}</span>
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
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
                onClick={executeAction}
                disabled={!actionReason.trim()}
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
