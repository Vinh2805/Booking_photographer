import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { MapPin, Calendar, Star, Camera, Award } from "lucide-react";

interface ProfileHeaderProps {
  photographer: {
    name: string;
    avatar: string;
    coverImage: string;
    location: string;
    experience: number;
    rating: number;
    reviewCount: number;
    completedBookings: number;
    styles: string[];
    achievements: string[];
  };
  onEdit: () => void;
}

export function ProfileHeader({ photographer, onEdit }: ProfileHeaderProps) {
  return (
    <Card className="bg-card border-border">
      <div className="relative">
        <ImageWithFallback
          src={photographer.coverImage}
          alt="Cover"
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute -bottom-8 left-4">
          <ImageWithFallback
            src={photographer.avatar}
            alt={photographer.name}
            className="w-16 h-16 rounded-full border-4 border-card object-cover"
          />
        </div>
      </div>

      <CardContent className="pt-12 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">
              {photographer.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {photographer.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {photographer.experience} năm KN
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {photographer.styles.map((style) => (
            <Badge key={style} variant="secondary" className="text-xs">
              {style}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-card-foreground">
                {photographer.rating}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {photographer.reviewCount} đánh giá
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Camera className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-card-foreground">
                {photographer.completedBookings}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Hoàn thành</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-card-foreground">
                {photographer.achievements.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Thành tích</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
