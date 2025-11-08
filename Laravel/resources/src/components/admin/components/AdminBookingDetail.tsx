import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { getStatusInfo } from "../utils/adminBookingsUtils";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  CheckCircle,
  X,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import type { AdminBooking } from "../types/adminBookingTypes";

interface AdminBookingDetailProps {
  booking: AdminBooking;
  onBack: () => void;
  onChatRedirect: (bookingId: string) => void;
  onPhotoApproval: (bookingId: string, action: "approve" | "reject") => void;
}

export function AdminBookingDetail({
  booking,
  onBack,
  onChatRedirect,
  onPhotoApproval,
}: AdminBookingDetailProps) {
  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Chi tiết buổi chụp</h1>
            <p className="text-sm text-gray-600">Mã: {booking.id}</p>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Issues Alert */}
        {booking.issues && booking.issues.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Vấn đề cần xử lý</h3>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {booking.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Thông tin tham gia</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={booking.customer.avatar}
                  alt={booking.customer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{booking.customer.name}</p>
                  <p className="text-sm text-gray-600">
                    Khách hàng • ID: {booking.customer.id}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Xem hồ sơ
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={booking.photographer.avatar}
                  alt={booking.photographer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{booking.photographer.name}</p>
                  <p className="text-sm text-gray-600">
                    Nhiếp ảnh gia • ID: {booking.photographer.id}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Xem hồ sơ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium">Chi tiết buổi chụp</h3>
            <div>
              <h4 className="font-medium text-lg">{booking.title}</h4>
              <p className="text-sm text-gray-600 mt-1">Loại: {booking.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>
                  {new Date(booking.date).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{booking.time}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{booking.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-gray-600">Giá trị</span>
              <span className="font-semibold text-lg flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {booking.price.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>

            {booking.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Ghi chú: {booking.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Hành động quản trị</h3>
            <div className="space-y-3">
              <Button
                onClick={() => onChatRedirect(booking.id)}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Xem chat group
              </Button>

              {booking.status === "processing" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onPhotoApproval(booking.id, "approve")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phê duyệt ảnh
                  </Button>
                  <Button
                    onClick={() => onPhotoApproval(booking.id, "reject")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Yêu cầu sửa
                  </Button>
                </div>
              )}

              {booking.status === "disputed" && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Xử lý tranh chấp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
