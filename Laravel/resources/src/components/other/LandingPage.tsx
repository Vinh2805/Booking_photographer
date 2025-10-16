import React from "react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { FeaturedPhotographers } from "./FeaturedPhotographers";
import {
  Camera,
  Users,
  Star,
  Check,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Heart,
  Award,
  Shield,
  Clock,
  Smartphone,
  Download,
  ArrowRight,
  Play,
  Quote,
  TrendingUp,
  Calendar,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Zap,
  Target,
  Menu,
  X,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (role: "customer" | "photographer") => void;
  onDiscoverPhotographers?: () => void;
  onViewAllPhotographers?: () => void;
  onBookPhotographer?: (photographerId: string) => void;
}

export function LandingPage({
  onNavigate,
  onDiscoverPhotographers,
  onViewAllPhotographers,
  onBookPhotographer,
}: LandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<
    number | null
  >(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-cyan-900/20" />

        {/* Floating blur effects */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-sky-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-cyan-200 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-blue-200 to-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500" />

        {/* Geometric elements */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-sky-300 rounded transform rotate-45 opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300 rounded-full opacity-60" />
        <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-blue-300 rounded transform rotate-12 opacity-60" />
        <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-teal-300 rounded-full opacity-60" />

        {/* Plus signs */}
        <div className="absolute top-20 left-1/2 text-sky-300 opacity-50 text-2xl">
          +
        </div>
        <div className="absolute bottom-32 left-1/3 text-cyan-300 opacity-50 text-xl">
          +
        </div>
        <div className="absolute top-1/2 right-1/4 text-blue-300 opacity-50 text-lg">
          +
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden p-2 transition-colors"
              title={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                Tính năng
              </a>
              <a
                href="#testimonials"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                Đánh giá
              </a>
              <a
                href="#contact"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                Liên hệ
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <Button
                onClick={() => onNavigate("photographer")}
                className="hidden sm:flex sky-gradient text-white hover:opacity-90"
              >
                Dành cho Nhiếp ảnh gia
              </Button>
              <Button
                onClick={() => onNavigate("customer")}
                className="sky-gradient hover:opacity-90"
              >
                Đặt lịch ngay
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold">Menu</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <nav className="space-y-4">
              <a
                href="#features"
                className="block text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tính năng
              </a>
              <a
                href="#testimonials"
                className="block text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đánh giá
              </a>
              <a
                href="#contact"
                className="block text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </a>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate("customer");
                  }}
                  className="w-full mb-3 sky-gradient text-white"
                >
                  Đặt lịch ngay
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate("photographer");
                  }}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Dành cho Nhiếp ảnh gia
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 sky-gradient-soft text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Ứng dụng chụp ảnh #1 tại Việt Nam
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-900 via-sky-600 to-cyan-600 bg-clip-text text-transparent dark:from-white dark:via-sky-400 dark:to-cyan-400">
                  Kết nối những
                </span>
                <br />
                <span className="text-sky-gradient">
                  khoảnh khắc đẹp
                </span>
              </h2>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl">
                Đặt lịch chụp ảnh với những nhiếp ảnh gia chuyên
                nghiệp nhất. Từ ảnh cưới, gia đình đến sự kiện
                doanh nghiệp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={() => onNavigate("customer")}
                  size="lg"
                  className="sky-gradient hover:opacity-90 text-lg px-8 py-4 h-auto text-white"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Đặt lịch chụp ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={onDiscoverPhotographers}
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 h-auto"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Khám phá nhiếp ảnh gia
                </Button>
              </div>

              <div className="flex justify-center mb-8">
                <Button
                  onClick={() => onNavigate("photographer")}
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Dành cho Nhiếp ảnh gia
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9/5 từ 10,000+ đánh giá</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>5,000+ nhiếp ảnh gia</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=800&fit=crop&crop=center"
                  alt="Professional photographer at work"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                    <span className="text-sm">
                      Xem video giới thiệu
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    Trải nghiệm chụp ảnh chuyên nghiệp
                  </p>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Đặt lịch thành công
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chỉ trong 30 giây
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-8 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      100% hài lòng
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Hoặc hoàn tiền
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tại sao chọn{" "}
              <span className="text-purple-600">Momentia</span>?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm chụp ảnh hoàn hảo
              với công nghệ hiện đại và dịch vụ tận tâm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/50">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Nhiếp ảnh gia chuyên nghiệp
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Hơn 5,000 nhiếp ảnh gia được xác minh và đánh
                giá cao bởi khách hàng
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-700/50">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Đặt lịch nhanh chóng
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Đặt lịch chụp ảnh chỉ trong vài phút với giao
                diện thân thiện
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Thanh toán an toàn
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Hệ thống ví điện tử bảo mật với nhiều phương
                thức thanh toán
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700/50">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Chất lượng đảm bảo
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Cam kết 100% hài lòng hoặc hoàn tiền toàn bộ
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700/50">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Hỗ trợ 24/7
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Đội ngũ hỗ trợ khách hàng chuyên nghiệp luôn sẵn
                sàng giúp đỡ
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Giao hàng nhanh
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Nhận ảnh chỉnh sửa chuyên nghiệp trong vòng 48
                giờ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Con số ấn tượng về{" "}
              <span className="text-sky-600">Momentia</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Chúng tôi tự hào về những thành tựu đã đạt được
              cùng cộng đồng
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-sky-600" />
                </div>
                <div className="text-3xl font-bold text-sky-600 mb-2">
                  5,000+
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Nhiếp ảnh gia
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  50,000+
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Khách hàng
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  100,000+
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Buổi chụp
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  4.9/5
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Đánh giá
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cách hoạt động đơn giản
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Chỉ 3 bước đơn giản để có những bức ảnh tuyệt vời
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <Search className="w-10 h-10 text-sky-600" />
                </div>
                <div className="absolute top-10 -right-8 w-16 h-0.5 bg-sky-200 dark:bg-sky-800 hidden md:block"></div>
              </div>
              <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-200 dark:border-sky-800">
                <h3 className="text-xl font-semibold mb-3">
                  1. Tìm nhiếp ảnh gia
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Duyệt qua hàng nghìn nhiếp ảnh gia chuyên
                  nghiệp. Xem portfolio, đánh giá và chọn người
                  phù hợp nhất.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <Calendar className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute top-10 -right-8 w-16 h-0.5 bg-purple-200 dark:bg-purple-800 hidden md:block"></div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-semibold mb-3">
                  2. Đặt lịch chụp
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Chọn ngày giờ phù hợp, thảo luận concept và
                  thanh toán an toàn qua ứng dụng.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-green-600" />
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold mb-3">
                  3. Nhận ảnh đẹp
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Tận hưởng buổi chụp và nhận ảnh chỉnh sửa
                  chuyên nghiệp trong vòng 48 giờ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photographers Section */}
      {onViewAllPhotographers && onBookPhotographer && (
        <FeaturedPhotographers
          onViewAll={onViewAllPhotographers}
          onBookPhotographer={onBookPhotographer}
        />
      )}

      {/* Gallery Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Những tác phẩm tuyệt vời
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Khám phá bộ sưu tập ảnh đẹp từ cộng đồng nhiếp ảnh
              gia Momentia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="col-span-2 row-span-2">
              <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=600&fit=crop"
                  alt="Wedding photography"
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">
                      Ảnh cưới lãng mạn
                    </p>
                    <p className="text-sm opacity-90">
                      by Minh Photographer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&h=300&fit=crop"
                alt="Family photography"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-sm font-semibold">
                    Ảnh gia đình
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=300&fit=crop"
                alt="Portrait photography"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-sm font-semibold">
                    Chân dung
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=300&h=300&fit=crop"
                alt="Nature photography"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-sm font-semibold">
                    Thiên nhiên
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg group">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=300&h=300&fit=crop"
                alt="Event photography"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-sm font-semibold">
                    Sự kiện
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 space-y-4">
            <Button
              onClick={onDiscoverPhotographers}
              className="sky-gradient hover:opacity-90 text-white px-8 py-3 mr-4"
            >
              Khám phá nhiếp ảnh gia
              <Search className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("customer")}
              className="px-8 py-3"
            >
              Xem thêm tác phẩm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Những thắc mắc phổ biến về dịch vụ của chúng tôi
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Làm thế nào để đặt lịch chụp ảnh?",
                answer:
                  "Bạn chỉ cần tải ứng dụng Momentia, duyệt qua danh sách nhiếp ảnh gia, chọn ngư��i phù hợp và đặt lịch trực tiếp. Quá trình rất đơn giản và nhanh chóng.",
              },
              {
                question: "Chi phí chụp ảnh như thế nào?",
                answer:
                  "Chi phí sẽ tùy thuộc vào nhiếp ảnh gia, loại hình chụp và thời gian. Chúng tôi có đầy đủ các mức giá từ cơ bản đến cao cấp để phù hợp với mọi ngân sách.",
              },
              {
                question:
                  "Tôi có thể hủy hoặc thay đổi lịch hẹn không?",
                answer:
                  "Có, bạn có thể hủy hoặc thay đổi lịch hẹn trước 24 giờ mà không mất phí. Với các trường hợp đặc biệt, vui lòng liên hệ với chúng tôi để được hỗ trợ.",
              },
              {
                question:
                  "Bao lâu thì tôi nhận được ảnh sau khi chụp?",
                answer:
                  "Thông thường bạn sẽ nhận được ảnh đã chỉnh sửa trong vòng 48-72 giờ sau buổi chụp. Một số nhiếp ảnh gia có thể giao ảnh nhanh hơn tùy vào gói dịch vụ.",
              },
              {
                question:
                  "Ứng dụng có hỗ trợ thanh toán như thế nào?",
                answer:
                  "Momentia hỗ trợ nhiều hình thức thanh toán: ví điện tử, thẻ ngân hàng, chuyển khoản. Tất cả giao dịch đều được mã hóa và bảo mật tuyệt đối.",
              },
              {
                question:
                  "Tôi có thể làm nhiếp ảnh gia trên Momentia không?",
                answer:
                  "Tất nhiên! Bạn chỉ cần đăng ký tài khoản nhiếp ảnh gia, upload portfolio và chờ phê duyệt. Chúng tôi sẽ hỗ trợ bạn tiếp cận với hàng nghìn khách hàng tiềm năng.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-2xl"
                >
                  <h3 className="text-lg font-semibold pr-4">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-sky-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-slate-50 dark:bg-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Hơn 10,000 khách hàng đã tin tướng và hài lòng với
              dịch vụ của Momentia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-8 h-8 text-purple-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                "Dịch vụ tuyệt vời! Nhiếp ảnh gia rất chuyên
                nghiệp và ảnh cưới của chúng tôi thật hoàn hảo.
                Highly recommend Momentia!"
              </p>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=40&h=40&fit=crop&crop=face"
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">
                    Nguyễn Thị Hương
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cô dâu hạnh phúc
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-8 h-8 text-purple-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                "App rất dễ sử dụng, thanh toán an toàn và nhiếp
                ảnh gia đến đúng giờ. Ảnh gia đình chúng tôi
                thật tuyệt vời!"
              </p>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Trần Văn Minh</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Ông bố 2 con
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-8 h-8 text-purple-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                "Tôi là nhiếp ảnh gia và rất thích platform này.
                Nhiều khách hàng chất lượng và hệ thống quản lý
                booking rất tiện lợi."
              </p>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="Photographer"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">Lê Quang Dũng</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nhiếp ảnh gia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sky-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Sẵn sàng tạo ra những khoảnh khắc đẹp?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Tải ứng dụng Momentia ngay hôm nay và đặt lịch chụp
            ảnh với những nhiếp ảnh gia tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate("customer")}
              size="lg"
              className="bg-white text-sky-600 hover:bg-sky-50 text-lg px-8 py-4 h-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              Đặt lịch ngay
            </Button>
            <Button
              onClick={() => onNavigate("photographer")}
              size="lg"
              className="bg-white text-sky-600 hover:bg-sky-50 border border-sky-200 text-lg px-8 py-4 h-auto"
            >
              <Camera className="w-5 h-5 mr-2" />
              Đăng ký nhiếp ảnh gia
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-slate-900 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">
                  Momentia
                </span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Kết nối bạn với những nhiếp ảnh gia chuyên
                nghiệp nhất để tạo ra những khoảnh khắc đẹp nhất
                trong cuộc đời.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-slate-300">
                    1900 1234
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-slate-300">
                    hello@momentia.vn
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dịch vụ</h4>
              <ul className="space-y-3 text-slate-300">
                <li>Chụp ảnh cưới</li>
                <li>Chụp ảnh gia đình</li>
                <li>Chụp ảnh sự kiện</li>
                <li>Chụp ảnh doanh nghiệp</li>
                <li>Chụp ảnh cá nhân</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-3 text-slate-300">
                <li>Về chúng tôi</li>
                <li>Nhiếp ảnh gia</li>
                <li>Blog</li>
                <li>Hỗ trợ</li>
                <li>Điều khoản</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 Momentia. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-2 mt-4 md:mt-0 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span>in Vietnam</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}