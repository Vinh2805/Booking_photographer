import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Plus,
  X,
  Upload,
} from "lucide-react";

interface PhotographerProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  experience: number;
  location: string;
  styles: string[];
  equipment: string[];
  priceRange: {
    min: number;
    max: number;
  };
  avatar: string;
  coverImage: string;
  portfolio: string[];
}

export function PhotographerEditProfile({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<PhotographerProfile>({
    name: "Minh Tuấn",
    email: "minhtuan@photographer.com",
    phone: "0912345678",
    bio: "Nhiếp ảnh gia chuyên nghiệp với 5 năm kinh nghiệm, chuyên chụp ảnh cưới và gia đình. Từng tham gia nhiều dự án lớn và có phong cách chụp tự nhiên, lãng mạn.",
    experience: 5,
    location: "Hà Nội",
    styles: ["Cưới", "Chân dung", "Gia đình"],
    equipment: ["Canon R5", "Sony A7IV", "Profoto B10"],
    priceRange: {
      min: 2000000,
      max: 5000000,
    },
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    coverImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b3?w=400&h=200&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=200&h=200&fit=crop",
    ],
  });

  const [newStyle, setNewStyle] = useState("");
  const [newEquipment, setNewEquipment] = useState("");

  const availableStyles = [
    "Cưới",
    "Chân dung",
    "Gia đình",
    "Fashion",
    "Nghệ thuật",
    "Sự kiện",
    "Maternity",
    "Newborn",
    "Street style",
    "Doanh nghiệp",
    "Food",
    "Kiến trúc",
  ];

  const updateProfile = (field: keyof PhotographerProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addStyle = (style: string) => {
    if (style && !profile.styles.includes(style)) {
      updateProfile("styles", [...profile.styles, style]);
      setNewStyle("");
    }
  };

  const removeStyle = (style: string) => {
    updateProfile(
      "styles",
      profile.styles.filter((s) => s !== style)
    );
  };

  const addEquipment = () => {
    if (newEquipment && !profile.equipment.includes(newEquipment)) {
      updateProfile("equipment", [...profile.equipment, newEquipment]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    updateProfile(
      "equipment",
      profile.equipment.filter((e) => e !== equipment)
    );
  };

  const handleSave = () => {
    alert("Thông tin cá nhân đã được cập nhật!");
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">Chỉnh sửa hồ sơ</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Images */}
        <Card>
          <CardHeader>
            <CardTitle>Ảnh hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover Image */}
            <div className="relative">
              <ImageWithFallback
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                size="sm"
                className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Đổi ảnh bìa
              </Button>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <ImageWithFallback
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full bg-pink-600 hover:bg-pink-700"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <p className="font-medium">Ảnh đại diện</p>
                <p className="text-sm text-gray-600">
                  Khuyên dùng ảnh vuông, tối thiểu 400x400px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                Họ và tên
              </label>
              <Input
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Số điện thoại
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Khu vực làm việc
              </label>
              <Input
                value={profile.location}
                onChange={(e) => updateProfile("location", e.target.value)}
                placeholder="VD: Hà Nội, TP.HCM"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Số năm kinh nghiệm
              </label>
              <Input
                type="number"
                value={profile.experience}
                onChange={(e) =>
                  updateProfile("experience", parseInt(e.target.value) || 0)
                }
                placeholder="Nhập số năm kinh nghiệm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Giới thiệu bản thân
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Viết giới thiệu về bản thân, phong cách chụp, kinh nghiệm..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle>Khoảng giá dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Giá từ (VNĐ)
                </label>
                <Input
                  type="number"
                  value={profile.priceRange.min}
                  onChange={(e) =>
                    updateProfile("priceRange", {
                      ...profile.priceRange,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Giá thấp nhất"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Giá đến (VNĐ)
                </label>
                <Input
                  type="number"
                  value={profile.priceRange.max}
                  onChange={(e) =>
                    updateProfile("priceRange", {
                      ...profile.priceRange,
                      max: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Giá cao nhất"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Styles */}
        <Card>
          <CardHeader>
            <CardTitle>Bối cảnh chụp ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.styles.map((style) => (
                <Badge
                  key={style}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {style}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeStyle(style)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 p-2 border rounded-lg"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
              >
                <option value="">Chọn bối cảnh</option>
                {availableStyles
                  .filter((style) => !profile.styles.includes(style))
                  .map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
              </select>
              <Button
                onClick={() => addStyle(newStyle)}
                disabled={!newStyle}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết bị chụp ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.equipment.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {item}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeEquipment(item)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="VD: Canon R5, Sony A7IV..."
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEquipment();
                  }
                }}
              />
              <Button
                onClick={addEquipment}
                disabled={!newEquipment}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {profile.portfolio.map((image, index) => (
                <div key={index} className="relative group">
                  <ImageWithFallback
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Thêm ảnh</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pb-6">
          <Button
            onClick={handleSave}
            className="w-full h-12 bg-pink-600 hover:bg-pink-700"
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
