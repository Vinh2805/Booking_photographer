import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Camera,
  User,
  MessageCircle,
  Phone,
  Edit3,
  Star,
  Heart,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface BookingDetailProps {
  onBack: () => void;
}

export function BookingDetail({ onBack }: BookingDetailProps) {
  // Mock data cho booking detail
  const booking = {
    id: "BK001",
    title: "Chụp ảnh cưới Minh & Hương",
    status: "confirmed", // confirmed, pending, completed, cancelled
    date: "2024-12-25",
    time: "09:00 - 15:00",
    duration: "6 giờ",
    location: "Hồ Hoàn Kiếm, Hà Nội",
    type: "Cưới",
    expectedPhotos: 200,
    price: "15,000,000",
    paymentStatus: "paid", // paid, pending, unpaid
    notes: "Yêu cầu chụp ảnh tại 3 địa điểm: Hồ Hoàn Kiếm, Nhà thờ Lớn, và Studio. Muốn phong cách romantic và tự nhiên.",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
    photographer: {
      id: "P001",
      name: "Minh Tuấn",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      rating: 4.9,
      completedBookings: 127,
      phone: "0901234567",
      specialties: ["Cưới", "Pre-wedding", "Couple"],
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Đã xác nhận",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Đang chờ xác nhận",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          icon: AlertCircle,
        };
      case "completed":
        return {
          label: "Hoàn thành",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          icon: CheckCircle,
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          icon: XCircle,
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-sky-gradient">Chi tiết buổi chụp</h1>
            <p className="text-sm text-muted-foreground">#{booking.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Ảnh và thông tin chính */}
        <Card className="overflow-hidden shadow-lg">
          <div className="relative h-48 bg-gradient-to-br from-sky-100 to-cyan-100">
            <img
              src={booking.image}
              alt={booking.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-white mb-2">{booking.title}</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Thông tin buổi chụp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Ngày chụp</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Thời gian</p>
                  <p className="text-sm text-muted-foreground">{booking.time}</p>
                  <p className="text-xs text-muted-foreground">Thời lượng: {booking.duration}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Địa điểm</p>
                  <p className="text-sm text-muted-foreground">{booking.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Loại chụp</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="border-primary text-primary">
                      {booking.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Số lượng ảnh dự kiến</p>
                  <p className="text-sm text-muted-foreground">{booking.expectedPhotos} ảnh</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin nhiếp ảnh gia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Nhiếp ảnh gia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={booking.photographer.avatar}
                  alt={booking.photographer.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold">{booking.photographer.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{booking.photographer.rating}</span>
                  <span>•</span>
                  <span>{booking.photographer.completedBookings} buổi chụp</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {booking.photographer.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Nhắn tin
              </Button>
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Gọi điện
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ghi chú đặc biệt */}
        {booking.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                Ghi chú đặc biệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {booking.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Thông tin thanh toán */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-white">₫</span>
              </div>
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Tổng chi phí</span>
              <span className="font-semibold text-lg text-primary">
                {booking.price.toLocaleString()} VNĐ
              </span>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span>Trạng thái thanh toán</span>
              <Badge 
                variant={booking.paymentStatus === "paid" ? "default" : "destructive"}
                className={booking.paymentStatus === "paid" ? "bg-green-500" : ""}
              >
                {booking.paymentStatus === "paid" ? "Đã thanh toán" : 
                 booking.paymentStatus === "pending" ? "Đang chờ" : "Chưa thanh toán"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          {booking.status === "confirmed" && (
            <Button className="w-full sky-gradient text-white" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Liên hệ nhiếp ảnh gia
            </Button>
          )}
          
          {booking.status === "pending" && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg">
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button variant="destructive" size="lg">
                <XCircle className="w-4 h-4 mr-2" />
                Hủy lịch
              </Button>
            </div>
          )}

          {booking.status === "completed" && (
            <Button className="w-full" variant="outline" size="lg">
              <Star className="w-5 h-5 mr-2" />
              Đánh giá buổi chụp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}