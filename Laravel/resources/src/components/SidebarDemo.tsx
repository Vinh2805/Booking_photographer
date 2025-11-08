import React from 'react';
import { AppLayoutWithSidebar } from './AppLayoutWithSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Star,
  MapPin,
  Camera,
  Heart,
  MessageCircle,
  Calendar
} from 'lucide-react';

interface SidebarDemoProps {
  onBack: () => void;
}

export function SidebarDemo({ onBack }: SidebarDemoProps) {
  const [currentSection, setCurrentSection] = React.useState('home');

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    console.log('Navigating to:', section);
  };

  const getPageTitle = () => {
    switch (currentSection) {
      case 'home':
        return 'Trang chủ';
      case 'bookings':
        return 'Buổi chụp của tôi';
      case 'messages':
        return 'Tin nhắn';
      case 'profile':
        return 'Hồ sơ cá nhân';
      case 'settings':
        return 'Cài đặt';
      default:
        return 'Momentia';
    }
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Minh Studio</CardTitle>
                        <CardDescription>Chuyên ảnh cưới</CardDescription>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 cursor-pointer" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                    <span className="text-muted-foreground">(127 đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Quận 1, TP.HCM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Cưới hỏi</Badge>
                      <Badge variant="outline">Gia đình</Badge>
                    </div>
                    <span className="font-semibold text-primary">1.5M - 3M</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Lan Photography</CardTitle>
                        <CardDescription>Chuyên chân dung</CardDescription>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 cursor-pointer" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(89 đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Quận 3, TP.HCM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Chân dung</Badge>
                      <Badge variant="outline">Fashion</Badge>
                    </div>
                    <span className="font-semibold text-primary">800K - 2M</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Đức Events</CardTitle>
                        <CardDescription>Sự kiện doanh nghiệp</CardDescription>
                      </div>
                    </div>
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 cursor-pointer" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.7</span>
                    <span className="text-muted-foreground">(156 đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Quận 7, TP.HCM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">Sự kiện</Badge>
                      <Badge variant="outline">Doanh nghiệp</Badge>
                    </div>
                    <span className="font-semibold text-primary">2M - 5M</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buổi chụp sắp tới</CardTitle>
                <CardDescription>Các buổi chụp đã đặt lịch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Minh Studio - Chụp ảnh cưới</p>
                        <p className="text-sm text-muted-foreground">15/12/2024 • 09:00 AM</p>
                      </div>
                    </div>
                    <Badge>Đã xác nhận</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tin nhắn</CardTitle>
                <CardDescription>Trò chuyện với nhiếp ảnh gia</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chức năng tin nhắn đang được phát triển...</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hồ sơ cá nhân</CardTitle>
                <CardDescription>Quản lý thông tin tài khoản</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Thông tin hồ sơ...</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
                <CardDescription>Tùy chỉnh ứng dụng theo ý bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Cài đặt ứng dụng...</p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Chọn một mục từ sidebar để bắt đầu</div>;
    }
  };

  return (
    <AppLayoutWithSidebar
      onNavigate={handleNavigate}
      onBack={onBack}
      title={getPageTitle()}
    >
      {renderContent()}
    </AppLayoutWithSidebar>
  );
}