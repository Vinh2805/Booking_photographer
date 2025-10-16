import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from '../ui/theme-toggle';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Camera,
  Heart,
  Grid3X3,
  List,
  Eye,
  MessageCircle,
  CheckCircle,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AllPhotographersProps {
  onBack: () => void;
  onBookPhotographer: (photographerId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'rating' | 'price' | 'distance' | 'popularity' | 'newest';

interface Photographer {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  location: string;
  specialties: string[];
  basePrice: number;
  isVerified: boolean;
  isOnline: boolean;
  portfolioImages: string[];
  completedShoots: number;
  responseTime: string;
  description: string;
  joinedDate: string;
  isActive: boolean;
  level: 'Beginner' | 'Professional' | 'Expert' | 'Master';
}

const allPhotographers: Photographer[] = [
  {
    id: '1',
    name: 'Trần Thị B',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 127,
    location: 'Quận 1, TP.HCM',
    specialties: ['Cưới hỏi', 'Gia đình', 'Sự kiện'],
    basePrice: 800000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop'
    ],
    completedShoots: 250,
    responseTime: '< 1 giờ',
    description: 'Chuyên chụp ảnh cưới và gia đình với phong cách tự nhiên và lãng mạn',
    joinedDate: '2023-01-15',
    isActive: true,
    level: 'Expert'
  },
  {
    id: '2',
    name: 'Thu Hương',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=500&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 95,
    location: 'Quận 3, TP.HCM',
    specialties: ['Chân dung', 'Fashion', 'Lifestyle'],
    basePrice: 1200000,
    isVerified: true,
    isOnline: false,
    portfolioImages: [
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop'
    ],
    completedShoots: 180,
    responseTime: '< 2 giờ',
    description: 'Chuyên gia chụp ảnh chân dung và thời trang với góc nhìn nghệ thuật',
    joinedDate: '2023-03-20',
    isActive: false,
    level: 'Professional'
  },
  {
    id: '3',
    name: 'Thu Hà',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&h=300&fit=crop',
    rating: 5.0,
    reviewCount: 203,
    location: 'Quận 7, TP.HCM',
    specialties: ['Sự kiện', 'Doanh nghiệp', 'Hội thảo'],
    basePrice: 1500000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop'
    ],
    completedShoots: 340,
    responseTime: '< 30 phút',
    description: 'Chuyên gia chụp ảnh sự kiện và doanh nghiệp với kinh nghiệm 8+ năm',
    joinedDate: '2022-08-10',
    isActive: true,
    level: 'Master'
  },
  {
    id: '4',
    name: 'Minh Tuấn Photography',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 340,
    location: 'Quận Bình Thạnh, TP.HCM',
    specialties: ['Cưới hỏi', 'Pre-wedding', 'Engagement'],
    basePrice: 2500000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop'
    ],
    completedShoots: 450,
    responseTime: '< 30 phút',
    description: 'Studio chụp ảnh cưới hàng đầu với đội ngũ chuyên nghiệp',
    joinedDate: '2021-11-05',
    isActive: true,
    level: 'Master'
  },
  {
    id: '5',
    name: 'Hương Nguyễn Studio',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=300&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    location: 'Quận 2, TP.HCM',
    specialties: ['Gia đình', 'Trẻ em', 'Maternity'],
    basePrice: 1800000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&h=200&fit=crop'
    ],
    completedShoots: 280,
    responseTime: '< 1 giờ',
    description: 'Chuyên chụp ảnh gia đình và trẻ em với không gian studio hiện đại',
    joinedDate: '2022-12-20',
    isActive: true,
    level: 'Professional'
  },
  {
    id: '6',
    name: 'Đạt Lê Wedding',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=500&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 89,
    location: 'Quận 10, TP.HCM',
    specialties: ['Cưới hỏi', 'Tiệc cưới', 'Lễ đính hôn'],
    basePrice: 3200000,
    isVerified: false,
    isOnline: false,
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=200&fit=crop'
    ],
    completedShoots: 120,
    responseTime: '< 3 giờ',
    description: 'Chuyên chụp ảnh cưới với phong cách hiện đại và lãng mạn',
    joinedDate: '2024-01-10',
    isActive: false,
    level: 'Professional'
  },
  {
    id: '7',
    name: 'Thảo My Portrait',
    avatar: 'https://images.unsplash.com/photo-1619380061814-58f03707f082?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=500&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 67,
    location: 'Quận Gò Vấp, TP.HCM',
    specialties: ['Chân dung', 'Nghệ thuật', 'Concept'],
    basePrice: 1500000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=200&fit=crop'
    ],
    completedShoots: 95,
    responseTime: '< 2 giờ',
    description: 'Nhiếp ảnh gia trẻ với phong cách nghệ thuật độc đáo',
    joinedDate: '2023-09-15',
    isActive: true,
    level: 'Professional'
  },
  {
    id: '8',
    name: 'Nam Phạm Events',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 234,
    location: 'Quận 5, TP.HCM',
    specialties: ['Sự kiện', 'Hội nghị', 'Khai trương'],
    basePrice: 2000000,
    isVerified: true,
    isOnline: true,
    portfolioImages: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop'
    ],
    completedShoots: 380,
    responseTime: '< 1 giờ',
    description: 'Chuyên gia chụp ảnh sự kiện với thiết bị hiện đại',
    joinedDate: '2022-05-18',
    isActive: true,
    level: 'Expert'
  }
];

export function AllPhotographers({ onBack, onBookPhotographer }: AllPhotographersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);

  const specialties = ['Tất cả', 'Cưới hỏi', 'Gia đình', 'Chân dung', 'Sự kiện', 'Trẻ em', 'Fashion', 'Pre-wedding', 'Doanh nghiệp'];
  const levels = ['Tất cả', 'Beginner', 'Professional', 'Expert', 'Master'];

  // Enhanced search and filter logic
  const filteredPhotographers = useMemo(() => {
    return allPhotographers.filter(photographer => {
      // Search query matching
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        photographer.name.toLowerCase().includes(searchLower) ||
        photographer.location.toLowerCase().includes(searchLower) ||
        photographer.specialties.some(specialty => specialty.toLowerCase().includes(searchLower)) ||
        photographer.description.toLowerCase().includes(searchLower);

      // Specialty filter
      const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'Tất cả' || 
                               photographer.specialties.includes(selectedSpecialty);

      // Level filter
      const matchesLevel = !selectedLevel || selectedLevel === 'Tất cả' || 
                          photographer.level === selectedLevel;

      // Active filter
      const matchesActive = !showOnlyActive || photographer.isActive;

      // Verified filter
      const matchesVerified = !showOnlyVerified || photographer.isVerified;

      return matchesSearch && matchesSpecialty && matchesLevel && matchesActive && matchesVerified;
    });
  }, [searchQuery, selectedSpecialty, selectedLevel, showOnlyActive, showOnlyVerified]);

  // Sorting logic
  const sortedPhotographers = useMemo(() => {
    const sorted = [...filteredPhotographers].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.basePrice - b.basePrice;
        case 'popularity':
          return b.completedShoots - a.completedShoots;
        case 'newest':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredPhotographers, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Master': return 'bg-purple-500 text-white';
      case 'Expert': return 'bg-orange-500 text-white';
      case 'Professional': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Helper functions for dropdown filter
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedSpecialty) count++;
    if (selectedLevel) count++;
    if (showOnlyActive) count++;
    if (showOnlyVerified) count++;
    return count;
  };

  const getSpecialtyCount = (specialty: string) => {
    if (specialty === 'Tất cả') return allPhotographers.length;
    return allPhotographers.filter(p => p.specialties.includes(specialty)).length;
  };

  const clearAllFilters = () => {
    setSelectedSpecialty(null);
    setSelectedLevel(null);
    setShowOnlyActive(false);
    setShowOnlyVerified(false);
  };

  const PhotographerCard = ({ photographer }: { photographer: Photographer }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md">
      <div className="relative">
        <ImageWithFallback
          src={photographer.coverImage}
          alt={photographer.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {photographer.isActive && (
            <Badge className="bg-green-500 text-white">
              Đang hoạt động
            </Badge>
          )}
          {photographer.isVerified && (
            <Badge className="bg-blue-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Đã xác minh
            </Badge>
          )}
          <Badge className={getLevelColor(photographer.level)}>
            {photographer.level}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="bg-primary text-white px-3 py-1 rounded-lg font-semibold">
            {formatPrice(photographer.basePrice)}
          </div>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
              <AvatarImage src={photographer.avatar} />
              <AvatarFallback>{photographer.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{photographer.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">{photographer.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${photographer.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {photographer.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{photographer.rating}</span>
            <span className="text-muted-foreground text-sm">({photographer.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{photographer.completedShoots} buổi chụp</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {photographer.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {photographer.specialties.slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Phản hồi {photographer.responseTime}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 sky-gradient text-white hover:opacity-90"
            onClick={() => onBookPhotographer(photographer.id)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Đặt lịch
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Tất cả nhiếp ảnh gia</h1>
                <p className="text-muted-foreground">Khám phá và tìm kiếm nhiếp ảnh gia phù hợp</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filters */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Tìm kiếm theo tên, khu vực, chuyên môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
            {searchQuery && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Unified Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Lọc theo ({getActiveFiltersCount()})
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4 bg-card border-primary/20 shadow-xl" align="start">
                  <div className="space-y-6">
                    {/* Specialty Section */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Chuyên môn</label>
                      <div className="grid grid-cols-2 gap-2">
                        {specialties.map((specialty) => (
                          <Button
                            key={specialty}
                            variant={selectedSpecialty === specialty ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSpecialty(specialty === 'Tất cả' ? null : specialty)}
                            className="justify-start text-xs h-8 font-normal"
                          >
                            {specialty}
                            {getSpecialtyCount(specialty) > 0 && (
                              <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                {getSpecialtyCount(specialty)}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Status Section */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Trạng thái</label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant={showOnlyActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowOnlyActive(!showOnlyActive)}
                          className="justify-start text-xs h-8 font-normal"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Đang hoạt động
                          <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                            {allPhotographers.filter(p => p.isActive).length}
                          </span>
                        </Button>
                        <Button
                          variant={showOnlyVerified ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowOnlyVerified(!showOnlyVerified)}
                          className="justify-start text-xs h-8 font-normal"
                        >
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Đã xác minh
                          <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                            {allPhotographers.filter(p => p.isVerified).length}
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Level Section */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Trình độ</label>
                      <div className="grid grid-cols-2 gap-2">
                        {levels.map((level) => (
                          <Button
                            key={level}
                            variant={selectedLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedLevel(level === 'Tất cả' ? null : level)}
                            className="justify-start text-xs h-8 font-normal"
                          >
                            {level === 'Master' && <Award className="w-3 h-3 mr-1 text-purple-500" />}
                            {level === 'Expert' && <Award className="w-3 h-3 mr-1 text-orange-500" />}
                            {level === 'Professional' && <Award className="w-3 h-3 mr-1 text-blue-500" />}
                            {level === 'Beginner' && <Award className="w-3 h-3 mr-1 text-gray-500" />}
                            {level}
                            {level !== 'Tất cả' && (
                              <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                {allPhotographers.filter(p => p.level === level).length}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(selectedSpecialty || selectedLevel || showOnlyActive || showOnlyVerified) && (
                      <div className="pt-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="w-full text-muted-foreground hover:text-foreground"
                        >
                          Xóa tất cả bộ lọc
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sắp xếp theo
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('rating')}>
                    Đánh giá cao nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('price')}>
                    Giá thấp nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('popularity')}>
                    Phổ biến nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    Mới gia nhập
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count and Active Filters */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{sortedPhotographers.length}</span> nhiếp ảnh gia
              {searchQuery && ` cho "${searchQuery}"`}
            </p>
            
            {/* Active Filters Display */}
            {(selectedSpecialty || selectedLevel || showOnlyActive || showOnlyVerified) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Đang lọc:</span>
                {selectedSpecialty && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {selectedSpecialty}
                    <button 
                      onClick={() => setSelectedSpecialty(null)}
                      className="ml-1 hover:bg-primary/20 rounded-sm px-1"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedLevel && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {selectedLevel}
                    <button 
                      onClick={() => setSelectedLevel(null)}
                      className="ml-1 hover:bg-primary/20 rounded-sm px-1"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {showOnlyActive && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Đang hoạt động
                    <button 
                      onClick={() => setShowOnlyActive(false)}
                      className="ml-1 hover:bg-green-200 rounded-sm px-1"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {showOnlyVerified && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã xác minh
                    <button 
                      onClick={() => setShowOnlyVerified(false)}
                      className="ml-1 hover:bg-blue-200 rounded-sm px-1"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPhotographers.map((photographer) => (
              <PhotographerCard key={photographer.id} photographer={photographer} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPhotographers.map((photographer) => (
              <Card key={photographer.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="relative">
                      <ImageWithFallback
                        src={photographer.coverImage}
                        alt={photographer.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <Avatar className="absolute -bottom-2 -right-2 w-10 h-10 border-2 border-white">
                        <AvatarImage src={photographer.avatar} />
                        <AvatarFallback>{photographer.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-xl">{photographer.name}</h3>
                            {photographer.isVerified && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <Badge className={getLevelColor(photographer.level)}>
                              {photographer.level}
                            </Badge>
                            {photographer.isOnline && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm text-green-600">Online</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{photographer.location}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{photographer.rating}</span>
                          <span className="text-muted-foreground">({photographer.reviewCount} đánh giá)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Camera className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{photographer.completedShoots} buổi chụp</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phản hồi {photographer.responseTime}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {photographer.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {photographer.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground">Từ </span>
                          <span className="font-semibold text-xl text-primary">{formatPrice(photographer.basePrice)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Nhắn tin
                          </Button>
                          <Button variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Xem portfolio
                          </Button>
                          <Button 
                            className="sky-gradient text-white hover:opacity-90"
                            onClick={() => onBookPhotographer(photographer.id)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Đặt lịch
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedPhotographers.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy nhiếp ảnh gia</h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty(null);
                setSelectedLevel(null);
                setShowOnlyActive(false);
                setShowOnlyVerified(false);
              }}
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}