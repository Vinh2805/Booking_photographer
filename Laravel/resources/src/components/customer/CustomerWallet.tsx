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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import apiClient from "../services/apiClient";
import { toast } from "sonner";

interface CustomerWalletProps {
  onBack?: () => void;
}

export function CustomerWallet({ onBack }: CustomerWalletProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankAccount, setBankAccount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Load wallet balance
  useEffect(() => {
    loadBalance();
  }, []);

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

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10000) {
      toast.error("Số tiền nạp tối thiểu là 10,000 đ");
      return;
    }

    try {
      setQrLoading(true);
      const response = await apiClient.post("/wallet/deposit", {
        amount: amount,
      });

      setQrUrl(response.data.qr_url);
      setTransactionId(response.data.transaction_id || "");
      toast.success("Mã QR đã được tạo. Vui lòng quét và chuyển khoản.");
    } catch (error: any) {
      console.error("Lỗi tạo yêu cầu nạp tiền:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu nạp tiền"
      );
    } finally {
      setQrLoading(false);
    }
  };

  const handleConfirmDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || isNaN(amount) || amount < 10000) {
      toast.error("Số tiền không hợp lệ. Vui lòng nhập số tiền tối thiểu 10,000 đ");
      return;
    }

    if (!qrUrl) {
      toast.error("Vui lòng tạo mã QR trước");
      return;
    }

    try {
      setConfirming(true);
      
      const payload: any = {
        amount: amount,
      };
      
      if (transactionId) {
        payload.transaction_id = transactionId;
      }

      const response = await apiClient.post("/wallet/deposit/confirm", payload);

      toast.success(response.data.message || "Nạp tiền thành công!");
      setDepositModalOpen(false);
      setDepositAmount("");
      setQrUrl("");
      setTransactionId("");
      loadBalance(); // Reload balance
    } catch (error: any) {
      console.error("Lỗi xác nhận nạp tiền:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMessage = "Không thể xác nhận nạp tiền";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setConfirming(false);
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
    } catch (error: any) {
      console.error("Lỗi tạo yêu cầu rút tiền:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-auto py-6 flex flex-col gap-2"
              variant="outline"
              onClick={() => {
                setDepositAmount("");
                setQrUrl("");
                setTransactionId("");
              }}
            >
              <ArrowDownCircle className="w-6 h-6" />
              <span>Nạp tiền</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nạp tiền vào ví</DialogTitle>
              <DialogDescription>
                Nhập số tiền bạn muốn nạp vào ví cá nhân
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!qrUrl ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Số tiền (VNĐ)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="Nhập số tiền (tối thiểu 10,000 đ)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10000"
                    />
                  </div>
                  <Button
                    onClick={handleDeposit}
                    disabled={qrLoading}
                    className="w-full"
                  >
                    {qrLoading ? "Đang tạo mã QR..." : "Tạo mã QR"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Quét mã QR để chuyển khoản
                    </p>
                    <div className="flex justify-center p-4 bg-muted rounded-lg">
                      <img
                        src={qrUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sau khi quét mã QR và chuyển khoản thành công, vui lòng bấm nút xác nhận bên dưới
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngân hàng:</span>
                      <span className="font-medium">VIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <span className="font-medium">335757499</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chủ tài khoản:</span>
                      <span className="font-medium">Admin</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền:</span>
                      <span className="font-medium text-primary">
                        {formatCurrency(parseFloat(depositAmount))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Nút xác nhận đã chuyển khoản */}
                  <Button
                    onClick={handleConfirmDeposit}
                    disabled={confirming}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {confirming ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Đang xác nhận...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác nhận đã chuyển khoản
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQrUrl("");
                        setDepositAmount("");
                        setTransactionId("");
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={() => {
                        copyToClipboard(qrUrl);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Sao chép link QR
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-auto py-6 flex flex-col gap-2"
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rút tiền từ ví</DialogTitle>
              <DialogDescription>
                Vui lòng điền thông tin tài khoản ngân hàng để rút tiền
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <Input
                  id="bank-name"
                  type="text"
                  placeholder="VD: VIB, Vietcombank, Techcombank..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
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
            <Wallet className="w-4 h-4" />
            <span>
              Ví cá nhân cho phép bạn thanh toán nhanh chóng cho các buổi chụp
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowDownCircle className="w-4 h-4" />
            <span>Nạp tiền qua mã QR hoặc chuyển khoản trực tiếp</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpCircle className="w-4 h-4" />
            <span>Rút tiền về tài khoản ngân hàng của bạn</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

