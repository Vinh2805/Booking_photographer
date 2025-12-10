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
  AlertCircle,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import apiClient from "../services/apiClient";
import { toast } from "sonner";
import { BankAPI, Bank } from "../services/BankAPI";

interface PhotographerWalletProps {
  onBack?: () => void;
}

interface WalletTransaction {
  id: number;
  Loai_Giao_Dich: string;
  So_Tien: number;
  So_Du_Truoc: number;
  So_Du_Sau: number;
  Ma_BC: string | null;
  Ghi_Chu: string | null;
  So_Tai_Khoan: string | null;
  Ten_Ngan_Hang: string | null;
  Ten_Chu_Tai_Khoan: string | null;
  Transaction_ID: string | null;
  Thoi_Gian: string;
}

export function PhotographerWallet({ onBack }: PhotographerWalletProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [banks, setBanks] = useState<Bank[]>([]);

  // Load wallet balance and transactions
  useEffect(() => {
    loadBalance();
    loadTransactions();
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    const bankList = await BankAPI.getBanks();
    setBanks(bankList);
  };

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/wallet/balance");
      setBalance(response.data.balance || 0);
    } catch (error: any) {
      console.error("Lỗi tải số dư:", error);
      toast.error(error.response?.data?.message || "Không thể tải số dư ví");
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await apiClient.get("/wallet/transactions?limit=50");
      setTransactions(response.data.transactions || []);
    } catch (error: any) {
      console.error("Lỗi tải lịch sử giao dịch:", error);
      toast.error(error.response?.data?.message || "Không thể tải lịch sử giao dịch");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 50000) {
      toast.error("Số tiền rút tối thiểu là 50,000 đ");
      return;
    }

    if (amount > balance) {
      toast.error("Số dư không đủ để rút tiền");
      return;
    }

    if (!bankAccount || bankAccount.length < 8) {
      toast.error("Số tài khoản không hợp lệ");
      return;
    }

    if (!accountHolderName) {
      toast.error("Vui lòng nhập tên chủ tài khoản");
      return;
    }

    try {
      setWithdrawLoading(true);
      const response = await apiClient.post("/wallet/withdraw", {
        amount: amount,
        bank_account: bankAccount,
        bank_name: bankName || undefined,
        account_holder_name: accountHolderName,
      });

      toast.success(
        response.data.message ||
          "Rút tiền thành công! Tiền đã được trừ khỏi ví của bạn."
      );
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      setBankAccount("");
      setBankName("");
      setAccountHolderName("");
      loadBalance(); // Reload balance
      loadTransactions(); // Reload transactions
    } catch (error: any) {
      console.error("Lỗi tạo yêu cầu rút tiền:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
      );
    } finally {
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
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (type: string) => {
    if (type === "nhan_tien") {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (type === "rut_tien") {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border p-4 flex items-center gap-3 shadow-sm">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 hover:bg-accent"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="font-semibold text-lg flex-1 text-foreground">
          Ví cá nhân
        </h1>
      </div>

      {/* Balance Card */}
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Số dư hiện tại
          </CardTitle>
          <CardContent className="p-0 pt-4">
            {loading ? (
              <div className="text-2xl font-bold">Đang tải...</div>
            ) : (
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(balance)}
              </div>
            )}
          </CardContent>
        </CardHeader>
      </Card>

      {/* Action Button - Chỉ có rút tiền */}
      <div className="flex justify-center">
        <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-auto py-6 px-8 flex flex-col gap-2"
              variant="outline"
              onClick={() => {
                setWithdrawAmount("");
                setBankAccount("");
                setBankName("");
                setAccountHolderName("");
              }}
            >
              <ArrowUpCircle className="w-6 h-6" />
              <span>Rút tiền</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 p-3 m-2 max-w-sm">
            <DialogHeader>
              <DialogTitle>Rút tiền từ ví</DialogTitle>
              <DialogDescription>
                Vui lòng điền thông tin tài khoản ngân hàng để rút tiền
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Số tiền muốn rút (VNĐ)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Nhập số tiền (tối thiểu 50,000 đ)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="50000"
                  max={balance}
                />
                <p className="text-xs text-muted-foreground">
                  Số dư khả dụng: {formatCurrency(balance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-account">Số tài khoản *</Label>
                <Input
                  id="bank-account"
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                 <Label htmlFor="bank-name">Tên ngân hàng</Label>
                 <Select
                   value={bankName}
                   onValueChange={(value) => setBankName(value)}
                 >
                   <SelectTrigger id="bank-name">
                     <SelectValue placeholder="Chọn ngân hàng" />
                   </SelectTrigger>
                   <SelectContent>
                     {banks.map((bank) => (
                       <SelectItem key={bank.id} value={bank.shortName}>
                         <div className="flex items-center gap-2">
                           <img 
                             src={bank.logo} 
                             alt={bank.shortName} 
                             className="w-8 h-8 object-contain bg-white rounded-sm p-0.5 border" 
                           />
                           <span>{bank.shortName} - {bank.name}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Tên chủ tài khoản *</Label>
                <Input
                  id="account-holder"
                  type="text"
                  placeholder="Nhập tên chủ tài khoản"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Sau khi bấm "Xác nhận rút tiền", tiền sẽ được trừ khỏi ví của bạn ngay lập tức.
                  Vui lòng đảm bảo thông tin tài khoản ngân hàng chính xác.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {withdrawLoading ? "Đang xử lý..." : "Xác nhận rút tiền"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Thông tin ví</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>
              Tiền sẽ tự động được cộng vào ví khi khách hàng thanh toán (đã trừ 20% chiết khấu)
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Rút tiền về tài khoản ngân hàng của bạn</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
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
                    <TableHead>Số dư trước</TableHead>
                    <TableHead>Số dư sau</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.Loai_Giao_Dich)}
                          <span>{getTransactionTypeLabel(tx.Loai_Giao_Dich)}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={
                          tx.Loai_Giao_Dich === "nhan_tien"
                            ? "text-green-600 font-medium"
                            : tx.Loai_Giao_Dich === "rut_tien"
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {tx.Loai_Giao_Dich === "nhan_tien" ? "+" : "-"}
                        {formatCurrency(tx.So_Tien)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(tx.So_Du_Truoc)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(tx.So_Du_Sau)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(tx.Thoi_Gian)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {tx.Ghi_Chu || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
