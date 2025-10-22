import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

interface CustomerEditProfileProps {
  onBack?: () => void;
}

export function CustomerEditProfile({ onBack }: CustomerEditProfileProps) {
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    location: 'Hà Nội',
    dateOfBirth: '1990-05-15',
    bio: 'Yêu thích chụp ảnh gia đình và những khoảnh khắc đẹp trong cuộc sống.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    alert('Cập nhật hồ sơ thành công!');
    if (onBack) onBack();
  };

  const handleAvatarChange = () => {
    alert('Chọn ảnh đại diện mới');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">Chỉnh sửa hồ sơ</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Avatar Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <ImageWithFallback
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <Button
                  size="sm"
                  onClick={handleAvatarChange}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-pink-600 hover:bg-pink-700"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-medium">Ảnh đại diện</h3>
                <p className="text-sm text-gray-600">Nhấn vào biểu tượng camera để thay đổi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Nhập email"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Giới thiệu bản thân</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Sở thích chụp ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Thể loại yêu thích</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  'Gia đình', 'Cưới', 'Couple', 'Chân dung', 
                  'Maternity', 'Sự kiện', 'Fashion', 'Lifestyle'
                ].map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Địa điểm yêu thích</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  'Studio', 'Ngoài trời', 'Bãi biển', 'Công viên', 
                  'Phố cổ', 'Café', 'Tại nhà'
                ].map((location) => (
                  <Button
                    key={location}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSaveProfile}
          className="w-full h-12 bg-pink-600 hover:bg-pink-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}