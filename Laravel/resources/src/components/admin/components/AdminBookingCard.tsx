import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { getStatusInfo } from "../utils/adminBookingsUtils";
import {
  Calendar,
  MapPin,
  Eye,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import type { AdminBooking } from "../types/adminBookingTypes";

interface AdminBookingCardProps {
  booking: AdminBooking;
  onViewDetails: (booking: AdminBooking) => void;
  onChatRedirect: (bookingId: string) => void;
}

export function AdminBookingCard({
  booking,
  onViewDetails,
  onChatRedirect,
}: AdminBookingCardProps) {
  const statusInfo = getStatusInfo(booking.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ImageWithFallback
                src={booking.customer.avatar}
                alt={booking.customer.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <ImageWithFallback
                src={booking.photographer.avatar}
                alt={booking.photographer.name}
                className="w-6 h-6 rounded-full object-cover absolute -bottom-1 -right-1 border-2 border-white"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{booking.title}</h3>
              <p className="text-sm text-gray-600">ID: {booking.id}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{booking.customer.name}</span>
                <span>→</span>
                <span>{booking.photographer.name}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            {booking.issues && booking.issues.length > 0 && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(booking.date).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>₫{booking.price.toLocaleString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{booking.location}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(booking)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Chi tiết
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChatRedirect(booking.id)}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
