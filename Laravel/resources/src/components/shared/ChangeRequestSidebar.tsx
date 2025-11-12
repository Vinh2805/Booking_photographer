'use client';

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getPendingChangeRequests, approveChangeRequest, rejectChangeRequest } from "../services/BookingAPI";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface ChangeRequestSidebarProps {
  onRefresh?: () => void;
}

export function ChangeRequestSidebar({ onRefresh }: ChangeRequestSidebarProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getPendingChangeRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error: any) {
      console.error("❌ Error fetching change requests:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu thay đổi", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (requestId: number) => {
    setProcessing(requestId);
    try {
      const response = await approveChangeRequest(requestId);
      toast.success(response.message || "Đã duyệt yêu cầu thay đổi", { duration: 5000 });
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Lỗi khi duyệt yêu cầu";
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessing(selectedRequest.id);
    try {
      const response = await rejectChangeRequest(selectedRequest.id, {
        ly_do: rejectReason || "Không có lý do cụ thể"
      });
      toast.success(response.message || "Đã từ chối yêu cầu thay đổi", { duration: 5000 });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequest(null);
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Lỗi khi từ chối yêu cầu";
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 hover:bg-accent rounded-md transition-colors">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Yêu cầu thay đổi</span>
            {requests.length > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                {requests.length}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          <div className="px-2 space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Không có yêu cầu chờ duyệt</p>
              </div>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-500 text-sm">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xs font-semibold truncate">
                          #{request.id} - {request.booking.id}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {request.nguoi_gui === 'customer' ? 'Khách hàng' : 'Nhiếp ảnh gia'}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs shrink-0">
                        Chờ
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    <div className="text-xs">
                      <Label className="text-xs text-muted-foreground">Thay đổi:</Label>
                      <div className="mt-1 space-y-2">
                        {Object.entries(request.changes).slice(0, 2).map(([field, change]: [string, any]) => (
                          <div key={field} className="text-xs">
                            {field === 'Bat_Dau_Chup' && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="font-medium">Bắt đầu:</span>
                                </div>
                                <div className="flex items-center gap-1 pl-4">
                                  <span className="line-through text-muted-foreground text-[10px]">
                                    {change.cu ? new Date(change.cu).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) : 'N/A'}
                                  </span>
                                  <span>→</span>
                                  <span className="font-medium text-green-600 text-[10px]">
                                    {change.moi ? new Date(change.moi).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            )}
                            {field === 'Ket_Thuc_Chup' && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="font-medium">Kết thúc:</span>
                                </div>
                                <div className="flex items-center gap-1 pl-4">
                                  <span className="line-through text-muted-foreground text-[10px]">
                                    {change.cu ? new Date(change.cu).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) : 'N/A'}
                                  </span>
                                  <span>→</span>
                                  <span className="font-medium text-green-600 text-[10px]">
                                    {change.moi ? new Date(change.moi).toLocaleString('vi-VN', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            )}
                            {field === 'Dia_Diem' && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="line-through text-muted-foreground truncate text-[10px]">{change.cu}</span>
                                <span>→</span>
                                <span className="font-medium text-green-600 truncate text-[10px]">{change.moi}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                      >
                        {processing === request.id ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Duyệt
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 h-7 text-xs"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                        disabled={processing === request.id}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu thay đổi</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lý do từ chối</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectReason("");
              setSelectedRequest(null);
            }}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing === selectedRequest?.id}
            >
              {processing === selectedRequest?.id ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Xác nhận từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

