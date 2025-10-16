import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Star, MapPin, Calendar, ArrowRight } from "lucide-react";

interface FeaturedPhotographersProps {
  onViewAll: () => void;
  onBookPhotographer: (photographerId: string) => void;
}

const featuredPhotographers = [
  {
    id: "1",
    name: "Trần Thị B",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=100&h=100&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop",
    rating: 4.9,
    reviewCount: 127,
    location: "Quận 1, TP.HCM",
    specialties: ["Cưới hỏi", "Gia đình"],
    price: 800000,
    completedShoots: 250,
    isActive: true,
  },
  {
    id: "2",
    name: "Thu Hương",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=250&fit=crop",
    rating: 4.8,
    reviewCount: 95,
    location: "Quận 3, TP.HCM",
    specialties: ["Chân dung", "Fashion"],
    price: 1200000,
    completedShoots: 180,
    isActive: false,
  },
  {
    id: "3",
    name: "Thu Hà",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=250&fit=crop",
    rating: 5.0,
    reviewCount: 203,
    location: "Quận 7, TP.HCM",
    specialties: ["Sự kiện", "Doanh nghiệp"],
    price: 1500000,
    completedShoots: 340,
    isActive: true,
  },
];

export function FeaturedPhotographers({
  onViewAll,
  onBookPhotographer,
}: FeaturedPhotographersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Nhiếp ảnh gia xuất sắc</h2>
            <p className="text-muted-foreground text-lg">
              Những tài năng được đánh giá cao nhất trên nền tảng
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Photographer Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {featuredPhotographers.map((photographer) => (
            <Card
              key={photographer.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                {/* Cover Image */}
                <ImageWithFallback
                  src={photographer.coverImage}
                  alt={photographer.name}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Active Badge */}
                {photographer.isActive && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                    Đang hoạt động
                  </Badge>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-primary text-white px-3 py-1 rounded-lg font-semibold">
                    {formatPrice(photographer.price)}
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Photographer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                    <AvatarImage src={photographer.avatar} />
                    <AvatarFallback>
                      {photographer.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {photographer.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{photographer.location}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(photographer.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="font-medium ml-1">
                      {photographer.rating}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({photographer.reviewCount})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {photographer.completedShoots} buổi chụp
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {photographer.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 sky-gradient text-white hover:opacity-90"
                    onClick={() => onBookPhotographer(photographer.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt lịch
                  </Button>
                  <Button variant="outline" className="px-4">
                    Xem hồ sơ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
