import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Wallet,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Copy,
  ChevronLeft
} from "lucide-react";
import { Badge } from "../ui/badge";
import { BankAPI, Bank } from "../services/BankAPI";

export function AdminWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Withdrawal State
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const walletRes = await fetch(`/api/admin/wallet`, {
             headers: { "Authorization": `Bearer ${token}` }
        });
        const walletData = await walletRes.json();
        if (walletData) {
             setBalance(parseFloat(walletData.balance));
             setTransactions(walletData.transactions || []);
        }
    } catch (error) {
        console.error("Failed to fetch admin wallet", error);
    } finally {
        setLoading(false);
    }
  };

  const fetchBanks = async () => {
    const bankList = await BankAPI.getBanks();
    setBanks(bankList);
  };

  useEffect(() => {
    fetchWalletData();
    fetchBanks();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || !bankAccount || !accountHolder) {
        alert("Vui lòng điền đầy đủ thông tin");
        return;
    }
    if (amount > balance) {
        alert("Số tiền rút vượt quá số dư khả dụng");
        return;
    }

    try {
        setWithdrawLoading(true);
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
                bank_account: bankAccount,
                bank_name: bankName || 'Unknown',
                account_holder_name: accountHolder
            })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Rút tiền thành công!");
            setWithdrawDialogOpen(false);
            setWithdrawAmount("");
            setBankAccount("");
            setBankName("");
            setAccountHolder("");
            fetchWalletData();
        } else {
            alert(data.message || "Lỗi khi rút tiền");
        }
    } catch(e) { console.error(e); alert("Lỗi hệ thống"); } finally {
        setWithdrawLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      nhan_tien: "Nhận tiền",
      rut_tien: "Rút tiền",
      thanh_toan: "Thanh toán",
      nap_tien: "Nạp tiền",
      cong_money: "Cộng tiền",
      tru_money: "Trừ tiền"
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (type: string) => {
    const isPositive = ['cong_money', 'nhan_tien', 'nap_tien'].includes(type);
    if (isPositive) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
         <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
           <Wallet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
         </div>
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ví cá nhân Admin</h1>
           <p className="text-slate-500 dark:text-slate-400">Quản lý số dư và lịch sử giao dịch</p>
         </div>
       </div>

      {/* Balance Card - Centered like Customer Wallet */}
      <Card className="border-2 border-indigo-100 dark:border-indigo-900/50">
        <CardHeader className="text-center">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Số dư hiện tại
          </CardTitle>
          <CardContent className="p-0 pt-4">
            {loading ? (
              <div className="text-2xl font-bold animate-pulse text-slate-300">Đang tải...</div>
            ) : (
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(balance)}
              </div>
            )}
          </CardContent>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Withdraw Button - Full width or half if we added Deposit */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-auto py-8 flex flex-col gap-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              variant="ghost"
              onClick={() => {
                setWithdrawAmount("");
                setBankAccount("");
                setBankName("");
                setAccountHolder("");
              }}
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                <ArrowUpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-semibold text-lg">Rút tiền về tài khoản</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 p-6 m-2 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Rút tiền từ ví Admin</DialogTitle>
              <DialogDescription>
                Vui lòng điền thông tin tài khoản ngân hàng để rút tiền
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Số tiền muốn rút (VNĐ)</Label>
                <div className="relative">
                    <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Nhập số tiền (tối thiểu 50,000 đ)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="50000"
                    max={balance}
                    className="pl-4 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">VNĐ</span>
                </div>
                <p className="text-xs text-sky-600 font-medium">
                  Số dư khả dụng: {formatCurrency(balance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Ngân hàng</Label>
                <Select
                  value={bankName}
                  onValueChange={(value) => setBankName(value)}
                >
                  <SelectTrigger id="bank-name">
                    <SelectValue placeholder="Chọn ngân hàng" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.shortName}>
                        <div className="flex items-center gap-3">
                          <img 
                            src={bank.logo} 
                            alt={bank.shortName} 
                            className="w-8 h-8 object-contain bg-white rounded-md p-0.5 border" 
                          />
                          <span className="font-medium">{bank.shortName}</span>
                          <span className="text-slate-400 text-xs truncate max-w-[150px] hidden sm:inline">- {bank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">Số tài khoản</Label>
                <Input
                  id="bank-account"
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Tên chủ tài khoản</Label>
                <Input
                  id="account-holder"
                  type="text"
                  placeholder="Viết hoa không dấu (VD: NGUYEN VAN A)"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Tiền sẽ được chuyển vào tài khoản của bạn sau khi yêu cầu được xử lý.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawDialogOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {withdrawLoading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Placeholder for future features or just Info */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center flex-col text-center gap-2">
             <AlertCircle className="w-8 h-8 text-slate-300" />
             <p className="font-medium text-slate-500">Tính năng mở rộng</p>
             <p className="text-sm text-slate-400">Các tính năng khác đang được phát triển</p>
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Lịch sử giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải lịch sử giao dịch...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có giao dịch nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead className="hidden md:table-cell">Số dư trước</TableHead>
                    <TableHead className="hidden md:table-cell">Số dư sau</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Mã Booking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, i) => {
                      const isPositive = ['cong_money', 'nhan_tien', 'nap_tien'].includes(tx.Loai_Giao_Dich);
                      return (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.Loai_Giao_Dich)}
                          <span className="font-medium">{getTransactionTypeLabel(tx.Loai_Giao_Dich)}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={
                          isPositive
                            ? "text-green-600 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {isPositive ? "+" : "-"}{formatCurrency(parseFloat(tx.So_Tien))}
                      </TableCell>
                      <TableCell className="text-slate-500 hidden md:table-cell">
                        {tx.So_Du_Truoc ? formatCurrency(parseFloat(tx.So_Du_Truoc)) : "-"}
                      </TableCell>
                      <TableCell className="font-medium hidden md:table-cell">
                        {tx.So_Du_Sau ? formatCurrency(parseFloat(tx.So_Du_Sau)) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(tx.Thoi_Gian)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                         {tx.Ma_BC ? (
                             <Badge variant="outline" className="font-mono">{tx.Ma_BC}</Badge>
                         ) : (
                             <span className="text-xs italic text-slate-400">Không có</span>
                         )}
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
