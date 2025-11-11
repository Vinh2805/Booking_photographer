import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  MapPin,
  Star,
  Camera,
  Calendar,
  Heart,
  Share2,
  ArrowRight,
  ChevronRight,
  Zap,
  Sparkles,
  Users,
  Search,
  Filter,
  ChevronDown,
  Grid3X3,
  List,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import apiClient from "../services/apiClient";
import React from "react";
import { PhotographerPortfolioModal } from "./PhotographerPortfolioModal";

interface CustomerHomeProps {
  onNavigate: (view: string) => void;
  user?: {
    Ma_TK: string;
    Ho_Ten: string;
    Email_TK: string;
  };
}

export function CustomerHome({ onNavigate, user }: CustomerHomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "popularity" | "newest">("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [dashboard, setDashboard] = useState<any>(null);
  const [allPhotographers, setAllPhotographers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

  // 📡 Gọi API dashboard + photographer song song
  useEffect(() => {
    console.log("🔍 CustomerHome - useEffect triggered, user:", user);
    
    if (!user) {
      console.warn("⚠️ CustomerHome - User không tồn tại, đang thử load từ localStorage...");
      const userData = localStorage.getItem("customer_info");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("✅ CustomerHome - Đã load user từ localStorage:", parsedUser);
          // Không set user ở đây vì nó là prop, chỉ log để debug
        } catch (error) {
          console.error("❌ CustomerHome - Lỗi parse user data:", error);
        }
      }
      return;
    }
    
    if (!user.Ma_TK) {
      console.warn("⚠️ CustomerHome - User.Ma_TK không tồn tại:", user);
      console.log("📦 User object keys:", Object.keys(user || {}));
      return;
    }
    
    console.log("🔍 CustomerHome - Đang gọi API dashboard với Ma_TK:", user.Ma_TK);
    console.log("🔑 Token hiện tại:", localStorage.getItem("customer_token") ? "Có" : "Không");
    
    setLoading(true);

    Promise.all([
      apiClient.get(`/customer/dashboard/${user.Ma_TK}`),
      apiClient.get(`/nhiep-anh-gia/noi-bat`)
    ])
      .then(([dashRes, photoRes]) => {
        console.log("✅ CustomerHome - Response từ dashboard API:", dashRes.data);
        console.log("✅ CustomerHome - Response từ photographer API:", photoRes.data);
        setDashboard(dashRes.data);
        setAllPhotographers(photoRes.data || []);
      })
      .catch((err) => {
        console.error("❌ CustomerHome - Lỗi tải dữ liệu:", err);
        console.error("❌ CustomerHome - Error response:", err.response?.data);
        console.error("❌ CustomerHome - Error status:", err.response?.status);
        if (err.response?.status === 401) {
          console.error("❌ CustomerHome - Unauthorized - Token có thể không hợp lệ");
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        setAllPhotographers([]); // tránh vỡ UI
      })
      .finally(() => setLoading(false));
  }, [user]);

  const categories = [
    { id: "all", name: "Tất cả", icon: Camera },
    { id: "wedding", name: "Cưới hỏi", icon: Heart },
    { id: "family", name: "Gia đình", icon: Users },
    { id: "portrait", name: "Chân dung", icon: Camera },
    { id: "event", name: "Sự kiện", icon: Calendar },
  ];

  const priceRanges = [
    { label: "Tất cả", value: null },
    { label: "Dưới 1 triệu", value: "under-1m", min: 0, max: 1000000 },
    { label: "1 - 2 triệu", value: "1m-2m", min: 1000000, max: 2000000 },
    { label: "Trên 2 triệu", value: "over-2m", min: 2000000, max: Infinity },
  ];

  const locations = [
    "Tất cả",
    "Quận 1, TP.HCM",
    "Quận 2, TP.HCM",
    "Quận 3, TP.HCM",
    "Quận 7, TP.HCM",
    "Quận 10, TP.HCM",
  ];

  const ratingFilters = [
    { label: "Tất cả", value: null },
    { label: "4.5+ sao", value: "4.5+" },
    { label: "4.0+ sao", value: "4.0+" },
    { label: "3.5+ sao", value: "3.5+" },
  ];

  // 📊 Filter logic
  const filteredPhotographers = useMemo(() => {
    let filtered = allPhotographers.filter((p) => {
      if (selectedCategory !== "all") {
        const map = {
          wedding: ["Cưới hỏi", "Pre-wedding"],
          family: ["Gia đình", "Trẻ em"],
          portrait: ["Chân dung", "Fashion", "Lifestyle"],
          event: ["Sự kiện", "Doanh nghiệp"],
        };
        const match = map[selectedCategory as keyof typeof map] || [];
        if (!p.specialties?.some((s: string) => match.includes(s))) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.name?.toLowerCase().includes(q) &&
          !p.location?.toLowerCase().includes(q) &&
          !p.description?.toLowerCase().includes(q)
        )
          return false;
      }

      if (priceRange) {
        const range = priceRanges.find((r) => r.value === priceRange);
        if (range && (p.priceValue < range.min! || p.priceValue > range.max!))
          return false;
      }

      if (locationFilter && locationFilter !== "Tất cả") {
        if (p.location !== locationFilter) return false;
      }

      if (ratingFilter) {
        const min = parseFloat(ratingFilter.replace("+", ""));
        if (p.rating < min) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "price": return a.priceValue - b.priceValue;
        case "popularity": return b.completedBookings - a.completedBookings;
        case "newest":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default: return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, priceRange, locationFilter, ratingFilter, sortBy, allPhotographers]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Master": return "bg-purple-500 text-white";
      case "Expert": return "bg-orange-500 text-white";
      case "Professional": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const searchSectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInputRef.current?.focus(), 700);
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* 🌟 Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl"></div>
        <div className="relative bg-gradient-to-r from-white/80 to-white/60 dark:from-card/80 dark:to-card/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Nền tảng đặt lịch chụp ảnh #1
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-black dark:text-slate-200">
                Chào mừng trở lại,{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {user?.Ho_Ten || "Khách hàng"}
                </span>{" "}
                👋
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto lg:mx-0">
                {loading ? (
                  <>Đang tải dữ liệu của bạn...</>
                ) : (
                  <>
                    Bạn có{" "}
                    <b>{dashboard?.bookings ?? 0}</b> buổi chụp và{" "}
                    <b>{dashboard?.unreadMessages ?? 0}</b> tin nhắn mới ✉️
                  </>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={scrollToSearch}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Đặt lịch chụp ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5"
                  onClick={scrollToSearch}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Khám phá nhiếp ảnh gia
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-2xl animate-float">
                  <Camera className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div
                  className="absolute -bottom-2 -left-4 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow"
                  style={{ animationDelay: "1s" }}
                >
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     <div ref={searchSectionRef} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-slate-200">Chọn dịch vụ phù hợp</h2>
          <p className="text-muted-foreground">
            Tìm nhiếp ảnh gia chuyên nghiệp cho từng loại hình chụp ảnh
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-all duration-300" />
            <Input
              ref={searchInputRef}
              placeholder="Tìm kiếm theo tên, địa điểm, chuyên môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-primary/20 focus:border-primary transition-all duration-200 focus:shadow-lg focus:shadow-primary/20"
            />
            {searchQuery && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          {/* Helpful hint */}
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              💡 Gõ để tìm nhiếp ảnh gia theo tên, địa điểm hoặc chuyên môn
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedCategory === category.id
                    ? "ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-primary/30"
                    : "border-border/50 hover:border-primary/30 dark:hover:border-primary/50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedCategory === category.id
                        ? "bg-primary text-white shadow-lg"
                        : "bg-primary/10 dark:bg-primary/20 text-primary"
                    }`}
                  >
                    <category.icon className="w-6 h-6" />
                  </div>
                  <p
                    className={`font-medium text-sm ${
                      selectedCategory === category.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {category.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-muted/30 dark:bg-muted/20 rounded-2xl p-6 border border-primary/10 dark:border-primary/20">
          <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {/* Price Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/20 dark:border-primary/30"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {priceRanges.find((r) => r.value === priceRange)?.label ||
                      "Giá"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {priceRanges.map((range) => (
                    <DropdownMenuItem
                      key={range.value || "all"}
                      onClick={() => setPriceRange(range.value)}
                    >
                      {range.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Location Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/20 dark:border-primary/30"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {locationFilter || "Địa điểm"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {locations.map((location) => (
                    <DropdownMenuItem
                      key={location}
                      onClick={() =>
                        setLocationFilter(
                          location === "Tất cả" ? null : location
                        )
                      }
                    >
                      {location}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Rating Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/20 dark:border-primary/30"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {ratingFilters.find((r) => r.value === ratingFilter)
                      ?.label || "Đánh giá"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {ratingFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.value || "all"}
                      onClick={() => setRatingFilter(filter.value)}
                    >
                      {filter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {(searchQuery ||
                priceRange ||
                locationFilter ||
                ratingFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setPriceRange(null);
                    setLocationFilter(null);
                    setRatingFilter(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/20 dark:border-primary/30"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Sắp xếp
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>
                    Đánh giá cao nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price")}>
                    Giá thấp nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("popularity")}>
                    Phổ biến nhất
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Mới gia nhập
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg border-primary/20 dark:border-primary/30 text-black dark:text-slate-200">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="mt-4 pt-4 border-t border-primary/10 dark:border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tìm thấy{" "}
                <span className="font-semibold text-foreground">
                  {filteredPhotographers.length}
                </span>{" "}
                nhiếp ảnh gia
                {searchQuery && ` cho "${searchQuery}"`}
              </p>

              {/* Active Filters Display */}
              {(priceRange || locationFilter || ratingFilter) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Bộ lọc:</span>
                  {priceRange && (
                    <Badge variant="secondary" className="text-xs">
                      {priceRanges.find((r) => r.value === priceRange)?.label}
                      <button
                        onClick={() => setPriceRange(null)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {locationFilter && (
                    <Badge variant="secondary" className="text-xs">
                      {locationFilter}
                      <button
                        onClick={() => setLocationFilter(null)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {ratingFilter && (
                    <Badge variant="secondary" className="text-xs">
                      {
                        ratingFilters.find((r) => r.value === ratingFilter)
                          ?.label
                      }
                      <button
                        onClick={() => setRatingFilter(null)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Photographers */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-slate-200">Nhiếp ảnh gia xuất sắc</h2>
            <p className="text-muted-foreground">
              Những tài năng được đánh giá cao nhất trên nền tảng
            </p>
          </div>
          <Button
            variant="outline"
            className="border-primary/20 dark:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {filteredPhotographers.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Không tìm thấy nhiếp ảnh gia
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setPriceRange(null);
                setLocationFilter(null);
                setRatingFilter(null);
                setSelectedCategory("all");
              }}
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div
              className={`gap-6 ${
                viewMode === "grid"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }`}
            >
              {filteredPhotographers.slice(0, 6).map((photographer, index) =>
                viewMode === "grid" ? (
                  // Grid Card Layout
                  <Card
                    key={photographer.id}
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={photographer.coverImage}
                        alt={photographer.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {photographer.isOnline && (
                          <Badge className="bg-green-500 hover:bg-green-600 shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full mr-2" />
                            Online
                          </Badge>
                        )}
                        {photographer.isVerified && (
                          <Badge className="bg-blue-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge
                          className={`${getLevelColor(photographer.level)}`}
                        >
                          {photographer.level}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-9 h-9 p-0 backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/20 dark:bg-black/20 dark:hover:bg-black/30 dark:border-black/20"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-9 h-9 p-0 backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/20 dark:bg-black/20 dark:hover:bg-black/30 dark:border-black/20"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </Button>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-primary text-white font-semibold text-sm px-3 py-1 shadow-lg">
                          {photographer.price}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="relative cursor-pointer hover:ring-4 hover:ring-primary transition-all rounded-full"
                          onClick={() => {
                            console.log("Avatar clicked in CustomerHome:", photographer.id);
                            setSelectedPhotographerId(photographer.id);
                            setPortfolioModalOpen(true);
                          }}
                        >
                          <ImageWithFallback
                            src={photographer.avatar}
                            alt={photographer.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                          />
                          {photographer.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-card"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">
                            {photographer.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {photographer.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <div className="flex">
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
                          </div>
                          <span className="font-semibold text-sm ml-1">
                            {photographer.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({photographer.reviews})
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                          {photographer.completedBookings} buổi
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {photographer.specialties
                          .slice(0, 2)
                          .map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs bg-primary/10 text-primary border-0"
                            >
                              {specialty}
                            </Badge>
                          ))}
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Phản hồi {photographer.responseTime}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => {
                            console.log("Đặt lịch clicked in grid view:", photographer.id);
                            setSelectedPhotographerId(photographer.id);
                            setPortfolioModalOpen(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Đặt lịch
                        </Button>
                        <Button
                          variant="outline"
                          className="px-3 border-primary/20 dark:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 text-primary"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // List Layout
                  <Card
                    key={photographer.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="relative">
                          <ImageWithFallback
                            src={photographer.coverImage}
                            alt={photographer.name}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <div 
                            className="absolute -bottom-2 -right-2 cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-full"
                            onClick={() => {
                              console.log("Avatar clicked in list view:", photographer.id);
                              setSelectedPhotographerId(photographer.id);
                              setPortfolioModalOpen(true);
                            }}
                          >
                            <ImageWithFallback
                              src={photographer.avatar}
                              alt={photographer.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-xl">
                                  {photographer.name}
                                </h3>
                                {photographer.isVerified && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                                <Badge
                                  className={`${getLevelColor(
                                    photographer.level
                                  )}`}
                                >
                                  {photographer.level}
                                </Badge>
                                {photographer.isOnline && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="text-sm text-green-600">
                                      Online
                                    </span>
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
                              <span className="font-medium">
                                {photographer.rating}
                              </span>
                              <span className="text-muted-foreground">
                                ({photographer.reviews} đánh giá)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Camera className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {photographer.completedBookings} buổi chụp
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Phản hồi {photographer.responseTime}
                              </span>
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
                              <span className="font-semibold text-xl text-primary">
                                {photographer.price}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline">Xem hồ sơ</Button>
                              <Button
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => {
                                  console.log("Đặt lịch clicked in list view button:", photographer.id);
                                  setSelectedPhotographerId(photographer.id);
                                  setPortfolioModalOpen(true);
                                }}
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
                )
              )}
            </div>

            {/* View More Button */}
            {filteredPhotographers.length > 6 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => onNavigate("bookings")}
                >
                  Xem thêm {filteredPhotographers.length - 6} nhiếp ảnh gia
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl"></div>
        <Card className="relative border-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative">
              <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">
                Bắt đầu hành trình của bạn
              </h3>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                Hàng nghìn nhiếp ảnh gia tài năng đang chờ để ghi lại những
                khoảnh khắc đẹp nhất của bạn
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => onNavigate("bookings")}
              >
                <Camera className="w-5 h-5 mr-2" />
                Khám phá ngay
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>

      {/* Portfolio Modal */}
      <PhotographerPortfolioModal
        photographerId={selectedPhotographerId}
        open={portfolioModalOpen}
        onClose={() => {
          setPortfolioModalOpen(false);
          setSelectedPhotographerId(null);
        }}
        onBookingSuccess={() => {
          // Refresh data if needed
          if (user?.Ma_TK) {
            apiClient.get(`/customer/dashboard/${user.Ma_TK}`).then((res) => {
              setDashboard(res.data);
            });
          }
        }}
      />
    </div>
  );
}
