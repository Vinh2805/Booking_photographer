import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  UserPlus,
  RotateCcw,
  Activity,
  FileText,
  ExternalLink,
} from "lucide-react";

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "booking" | "user" | "payment" | "alert";
  title: string;
  description: string;
  time: string;
  status?: string;
  bookingId?: string; // Add booking ID for navigation
}

interface AdminDashboardProps {
  onNavigateToBookings?: (bookingId?: string) => void;
}

export function AdminDashboard({ onNavigateToBookings }: AdminDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">(
    "month"
  );

  // Enhanced dashboard metrics based on time period
  const getMetricsForPeriod = (period: string) => {
    const baseMetrics = {
      day: {
        totalBookings: { value: "89", change: "+12%" },
        processingBookings: { value: "23", change: "+5%" },
        revenue: { value: "45M VNĐ", change: "+18%" },
        completionRate: { value: "94.2%", change: "+2.1%" },
        refunds: { value: "2", change: "-50%" },
        newCustomers: { value: "15", change: "+25%" },
      },
      week: {
        totalBookings: { value: "627", change: "+8%" },
        processingBookings: { value: "89", change: "+12%" },
        revenue: { value: "315M VNĐ", change: "+15%" },
        completionRate: { value: "92.8%", change: "+1.5%" },
        refunds: { value: "8", change: "-30%" },
        newCustomers: { value: "127", change: "+22%" },
      },
      month: {
        totalBookings: { value: "2,847", change: "+12.5%" },
        processingBookings: { value: "142", change: "+8%" },
        revenue: { value: "890M VNĐ", change: "+15.3%" },
        completionRate: { value: "91.2%", change: "+3.2%" },
        refunds: { value: "28", change: "-15%" },
        newCustomers: { value: "456", change: "+18%" },
      },
    };
    return baseMetrics[period as keyof typeof baseMetrics];
  };

  const currentMetrics = getMetricsForPeriod(timePeriod);

  const metrics: DashboardMetric[] = [
    {
      label: "Tổng buổi chụp",
      value: currentMetrics.totalBookings.value,
      change: currentMetrics.totalBookings.change,
      changeType: "positive",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Đang xử lý",
      value: currentMetrics.processingBookings.value,
      change: currentMetrics.processingBookings.change,
      changeType: "positive",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Doanh thu",
      value: currentMetrics.revenue.value,
      change: currentMetrics.revenue.change,
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Tỉ lệ hoàn thành",
      value: currentMetrics.completionRate.value,
      change: currentMetrics.completionRate.change,
      changeType: "positive",
      icon: CheckCircle,
      color: "text-purple-600",
    },
    {
      label: "Hoàn tiền",
      value: currentMetrics.refunds.value,
      change: currentMetrics.refunds.change,
      changeType: "positive",
      icon: RotateCcw,
      color: "text-red-600",
    },
    {
      label: "Khách hàng mới",
      value: currentMetrics.newCustomers.value,
      change: currentMetrics.newCustomers.change,
      changeType: "positive",
      icon: UserPlus,
      color: "text-pink-600",
    },
  ];

  // Mock recent activities with booking IDs
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "alert",
      title: "Cảnh báo đánh giá thấp",
      description: "Nhiếp ảnh gia Minh Tuấn nhận đánh giá 2 sao từ khách hàng",
      time: "5 phút trước",
      status: "warning",
      bookingId: "BK003",
    },
    {
      id: "2",
      type: "booking",
      title: "Buổi chụp cần xử lý",
      description: "Yêu cầu thay đổi địa điểm cho booking BK001",
      time: "15 phút trước",
      status: "pending",
      bookingId: "BK001",
    },
    {
      id: "3",
      type: "payment",
      title: "Thanh toán bất thường",
      description: "Giao dịch 5,000,000 VNĐ cần xác minh",
      time: "1 giờ trước",
      status: "alert",
      bookingId: "BK005",
    },
    {
      id: "4",
      type: "booking",
      title: "Khiếu nại khách hàng",
      description: "Khách hàng không hài lòng với chất lượng ảnh",
      time: "2 giờ trước",
      status: "alert",
      bookingId: "BK007",
    },
    {
      id: "5",
      type: "booking",
      title: "Booking trễ hạn",
      description: "Buổi chụp đã quá thời gian hoàn thành",
      time: "3 giờ trước",
      status: "alert",
      bookingId: "BK002",
    },
  ];

  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case "day":
        return "Hôm nay";
      case "week":
        return "Tuần này";
      case "month":
        return "Tháng này";
      default:
        return "Tháng này";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return Calendar;
      case "user":
        return Users;
      case "payment":
        return DollarSign;
      case "alert":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "booking":
        return "text-blue-600 dark:text-blue-400";
      case "user":
        return "text-green-600 dark:text-green-400";
      case "payment":
        return "text-purple-600 dark:text-purple-400";
      case "alert":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
            Chờ xử lý
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300">
            Cảnh báo
          </Badge>
        );
      case "alert":
        return (
          <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
            Khẩn cấp
          </Badge>
        );
      case "new":
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
            Mới
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleQuickAction = (activity: RecentActivity) => {
    if (activity.bookingId && onNavigateToBookings) {
      onNavigateToBookings(activity.bookingId);
    } else {
      alert(`Xử lý: ${activity.title}`);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Tổng quan hệ thống
        </h1>
        <div className="flex items-center gap-2">
          <Select
            value={timePeriod}
            onValueChange={(value: any) => setTimePeriod(value)}
          >
            <SelectTrigger className="w-32 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Hiệu suất {getTimePeriodLabel(timePeriod).toLowerCase()}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center ${metric.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        metric.changeType === "positive"
                          ? "text-green-600 dark:text-green-400"
                          : metric.changeType === "negative"
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {metric.changeType === "positive" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : metric.changeType === "negative" ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      <span>{metric.change}</span>
                    </div>
                  </div>
                  <p className="font-bold text-xl text-slate-800 dark:text-slate-100">
                    {metric.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              5
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Cần xử lý
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              142
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Đã xử lý hôm nay
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              2
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Khẩn cấp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Hoạt động cần chú ý
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-600"
              >
                <div
                  className={`w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm ${iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {activity.title}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                    {activity.bookingId && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(activity)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Xử lý ngay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            className="w-full mt-4 hover:bg-slate-50 dark:hover:bg-slate-700"
            onClick={() => onNavigateToBookings && onNavigateToBookings()}
          >
            Xem tất cả hoạt động
          </Button>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-slate-100">
            Tình trạng hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                Server Status
              </span>
            </div>
            <span className="text-green-700 dark:text-green-400 font-medium">
              Hoạt động bình thường
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                Database
              </span>
            </div>
            <span className="text-green-700 dark:text-green-400 font-medium">
              Kết nối tốt
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                AI Services
              </span>
            </div>
            <span className="text-yellow-700 dark:text-yellow-400 font-medium">
              Đang bảo trì
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
