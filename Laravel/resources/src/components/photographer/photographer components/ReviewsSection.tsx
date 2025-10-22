import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Star } from 'lucide-react';

interface Review {
  id: number;
  customer: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  bookingType: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Đánh giá gần đây</span>
          <Button variant="ghost" size="sm">
            Xem tất cả
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="border-b pb-3 last:border-b-0">
            <div className="flex items-start gap-3">
              <ImageWithFallback
                src={review.avatar}
                alt={review.customer}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="font-medium text-sm">{review.customer}</p>
                    <p className="text-xs text-gray-600">{review.bookingType}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}