'use client';

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Loader,
  RefreshCw,
} from "lucide-react";
import { getPendingChangeRequests, approveChangeRequest, rejectChangeRequest } from "../services/BookingAPI";
import { toast } from "sonner";

interface ChangeRequestListProps {
  onRefresh?: () => void;
}

export function ChangeRequestList({ onRefresh }: ChangeRequestListProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p className="text-muted-foreground">Không có yêu cầu thay đổi nào chờ duyệt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Yêu cầu thay đổi chờ duyệt ({requests.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Yêu cầu thay đổi #{request.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Buổi chụp: {request.booking.title} - {request.booking.id}
                </p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Chờ duyệt
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Người gửi</Label>
                <p className="text-sm font-medium">
                  {request.nguoi_gui === 'customer' ? 'Khách hàng' : 'Nhiếp ảnh gia'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ngày gửi</Label>
                <p className="text-sm font-medium">
                  {new Date(request.ngay_tao).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Lý do thay đổi</Label>
              <p className="text-sm mt-1 p-2 bg-muted rounded">{request.ly_do}</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Chi tiết thay đổi</Label>
              <div className="space-y-2">
                {Object.entries(request.changes).map(([field, change]: [string, any]) => (
                  <div key={field} className="p-3 bg-muted rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      {field === 'Bat_Dau_Chup' && <Calendar className="w-4 h-4 text-primary" />}
                      {field === 'Dia_Diem' && <MapPin className="w-4 h-4 text-primary" />}
                      <span className="text-sm font-medium">
                        {field === 'Bat_Dau_Chup' ? 'Thời gian' : field === 'Dia_Diem' ? 'Địa điểm' : field}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cũ: </span>
                        <span className="line-through">{change.cu || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mới: </span>
                        <span className="font-medium text-green-600">{change.moi || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(request.id)}
                disabled={processing === request.id}
              >
                {processing === request.id ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Chấp nhận
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowRejectDialog(true);
                }}
                disabled={processing === request.id}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

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

