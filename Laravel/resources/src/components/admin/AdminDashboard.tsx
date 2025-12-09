import { useState, useEffect } from "react";
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
  Clock,
  RefreshCw,
  Activity,
  FileText,
  ExternalLink,
  CheckCircle,
  Plus, // Newly added
  Minus, // Newly added
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

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
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("month");
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [quickStats, setQuickStats] = useState({
    processing: "0",
    processedToday: "0",
    urgent: "0"
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [wallet, setWallet] = useState<{balance: number, transactions: any[]}>({balance: 0, transactions: []});
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        // 1. Fetch Stats
        const statsRes = await fetch(`/api/admin/dashboard?period=${timePeriod}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        if (statsData.stats) {
            const newMetrics: DashboardMetric[] = [
                {
                    label: "Tổng buổi chụp",
                    value: statsData.stats.bookings.value,
                    change: statsData.stats.bookings.change,
                    changeType: statsData.stats.bookings.trend,
                    icon: Calendar,
                    color: "text-blue-600",
                },
                {
                    label: "Doanh thu",
                    value: statsData.stats.revenue.value,
                    change: statsData.stats.revenue.change,
                    changeType: statsData.stats.revenue.trend,
                    icon: DollarSign,
                    color: "text-green-600",
                },
                {
                    label: "Khách hàng mới",
                    value: statsData.stats.customers.value,
                    change: statsData.stats.customers.change,
                    changeType: statsData.stats.customers.trend,
                    icon: Users,
                    color: "text-pink-600",
                },
                {
                    label: "Đang xử lý",
                    value: statsData.stats.processing.value,
                    change: "Active",
                    changeType: "neutral",
                    icon: Clock,
                    color: "text-orange-600",
                }
            ];
            setMetrics(newMetrics);
            setQuickStats({
                processing: statsData.stats.processing.value,
                processedToday: statsData.stats.processed_today || "0",
                urgent: statsData.stats.urgent_count || "0"
            });
        }

        // 2. Fetch Activities
        const actRes = await fetch(`/api/admin/activities`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const actData = await actRes.json();
        if (actData.activities) {
            setRecentActivities(actData.activities);
        }

        // 3. Fetch Wallet
        const walletRes = await fetch(`/api/admin/wallet`, {
             headers: { "Authorization": `Bearer ${token}` }
        });
        const walletData = await walletRes.json();
        if (walletData) {
             setWallet({
                 balance: parseFloat(walletData.balance),
                 transactions: walletData.transactions || []
             });
        }

    } catch (error) {
        console.error("Failed to fetch admin dashboard", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timePeriod]);

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
            {loading && <span className="text-sm text-slate-500 animate-pulse">Đang tải...</span>}
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
              {quickStats.processing}
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
              {quickStats.processedToday}
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
              {quickStats.urgent}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Khẩn cấp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-indigo-100">Số dư khả dụng</h3>
                      <div className="p-2 bg-white/20 rounded-lg">
                          <DollarSign className="w-5 h-5 text-white" />
                      </div>
                  </div>
                  <div className="mb-6">
                      <p className="text-3xl font-bold">{wallet.balance.toLocaleString('vi-VN')} VNĐ</p>
                      <p className="text-sm text-indigo-100 mt-1 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +15.3% so với tháng trước
                      </p>
                  </div>
                  <div className="flex gap-2">


                       {/* Withdraw Dialog */}
                       <Dialog>
                           <DialogTrigger asChild>
                               <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10" size="sm">
                                   <Minus className="w-4 h-4 mr-1" /> Rút tiền
                               </Button>
                           </DialogTrigger>
                           <DialogContent className="bg-white dark:bg-slate-800">
                               <DialogHeader>
                                   <DialogTitle>Rút tiền từ ví</DialogTitle>
                               </DialogHeader>
                               <div className="space-y-4 py-4">
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium">Số tiền rút (VNĐ)</label>
                                       <Input 
                                            type="number" 
                                            placeholder="Tối thiểu 50.000..." 
                                            max={wallet.balance}
                                            onChange={(e) => window.walletAmount = parseFloat(e.target.value)}
                                       />
                                       <p className="text-xs text-gray-500">Số dư khả dụng: {wallet.balance.toLocaleString('vi-VN')} VNĐ</p>
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium">Ngân hàng</label>
                                       <Input placeholder="VIB, Vietcombank..." onChange={(e) => window.bankName = e.target.value} />
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium">Số tài khoản</label>
                                       <Input placeholder="0000xxxx" onChange={(e) => window.bankAccount = e.target.value} />
                                   </div>
                                   <div className="space-y-2">
                                       <label className="text-sm font-medium">Tên người thụ hưởng</label>
                                       <Input placeholder="NGUYEN VAN A" onChange={(e) => window.accountHolder = e.target.value} />
                                   </div>

                                    <Button variant="destructive" className="w-full" onClick={async () => {
                                        const amount = window.walletAmount;
                                        if (!amount || !window.bankAccount || !window.accountHolder) {
                                            alert("Vui lòng điền đầy đủ thông tin");
                                            return;
                                        }
                                        try {
                                            const token = localStorage.getItem("admin_token");
                                            const res = await fetch('/api/admin/wallet/withdraw', {
                                                method: 'POST',
                                                headers: { 
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'Authorization': `Bearer ${token}` 
                                                },
                                                body: JSON.stringify({ 
                                                    amount,
                                                    bank_account: window.bankAccount,
                                                    bank_name: window.bankName || 'Unknown',
                                                    account_holder_name: window.accountHolder
                                                })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert("Rút tiền thành công!");
                                                fetchDashboardData();
                                            } else {
                                                alert(data.message || "Lỗi khi rút tiền");
                                            }
                                        } catch(e) { console.error(e); alert("Lỗi hệ thống"); }
                                    }}>
                                       Xác nhận rút
                                    </Button>
                               </div>
                           </DialogContent>
                       </Dialog>
                  </div>
              </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100 flex items-center justify-between">
                      <span>Giao dịch gần đây</span>
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                      {wallet.transactions.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">Chưa có giao dịch</p>
                      ) : (
                          wallet.transactions.map((tx: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-full ${tx.Loai_Giao_Dich === 'cong_money' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                          {tx.Loai_Giao_Dich === 'cong_money' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                      </div>
                                      <div>
                                          <p className="font-medium text-slate-800 dark:text-slate-100">
                                              {tx.Mo_Ta || (tx.Loai_Giao_Dich === 'cong_money' ? 'Nhận tiền' : 'Rút tiền')}
                                          </p>
                                          <p className="text-xs text-slate-500">{new Date(tx.Thoi_Gian).toLocaleString('vi-VN')}</p>
                                      </div>
                                  </div>
                                  <span className={`font-bold ${tx.Loai_Giao_Dich === 'cong_money' ? 'text-green-600' : 'text-red-600'}`}>
                                      {tx.Loai_Giao_Dich === 'cong_money' ? '+' : '-'}{parseFloat(tx.So_Tien).toLocaleString('vi-VN')}
                                  </span>
                              </div>
                          ))
                      )}
                  </div>
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
