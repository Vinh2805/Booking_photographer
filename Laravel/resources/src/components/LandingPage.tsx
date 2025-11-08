import React from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { ContinuousTypingEffect } from "./ui/continuous-typing-effect";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FeaturedPhotographers } from "./FeaturedPhotographers";
import { UserSidebar } from "./UserSidebar";
import {
    Camera,
    Users,
    Star,
    Check,
    Phone,
    Mail,
    Sparkles,
    Heart,
    Award,
    Shield,
    Clock,
    ArrowRight,
    Play,
    Quote,
    TrendingUp,
    Calendar,
    Search,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
    onDiscoverPhotographers?: () => void;
    onViewAllPhotographers?: () => void;
    onBookPhotographer?: (photographerId: string) => void;
}

export function LandingPage({
    onDiscoverPhotographers,
    onViewAllPhotographers,
    onBookPhotographer,
}: LandingPageProps) {
    const onNavigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [currentTab, setCurrentTab] = React.useState<
        "home" | "bookings" | "messages" | "profile" | "settings"
    >("home");

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleUserNavigation = (section: string) => {
        switch (section) {
            case "home":
                onNavigate("/");
                break;
            case "bookings":
            case "messages":
            case "profile":
            case "settings":
            case "logout":
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-cyan-900/20" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-sky-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
                <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-cyan-200 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000" />
                <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-blue-200 to-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-2000" />
                <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500" />
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-sky-300 rounded rotate-45 opacity-60" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300 rounded-full opacity-60" />
                <div className="absolute bottom-1/3 left-1/4 w-6 h-6 bg-blue-300 rounded rotate-12 opacity-60" />
                <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-teal-300 rounded-full opacity-60" />
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
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className="md:hidden p-2 transition-colors"
                            title={sidebarOpen ? "Đóng menu" : "Mở menu"}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        <div className="hidden md:flex items-center gap-8">
                            <a
                                href="#features"
                                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-300 relative group py-2"
                            >
                                Tính năng
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-600 dark:bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a
                                href="#testimonials"
                                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-300 relative group py-2"
                            >
                                Đánh giá
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-600 dark:bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a
                                href="#contact"
                                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-300 relative group py-2"
                            >
                                Liên hệ
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-600 dark:bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <Button
                                onClick={() => onNavigate("/photographer-auth-login")}
                                className="hidden sm:flex sky-gradient text-white hover:opacity-90 hover-lift transition-all duration-300 hover:shadow-lg"
                            >
                                Dành cho Nhiếp ảnh gia
                            </Button>
                            <Button
                                onClick={() => onNavigate("/customer-auth-login")}
                                className="sky-gradient hover:opacity-90 hover-lift transition-all duration-300 hover:shadow-lg"
                            >
                                Đặt lịch ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* User Sidebar */}
            <UserSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={(section) => {
                    if (section !== "logout") {
                        setCurrentTab(section as any);
                        handleUserNavigation(section);
                    } else {
                        setSidebarOpen(false);
                    }
                }}
                currentSection={currentTab}
            />

            {/* Hero Section */}
            <section className="pt-24 pb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-start mt-4">
                        {/* Left column */}
                        <div className="text-center lg:text-left mt-8">
                            <div className="inline-flex items-center gap-2 sky-gradient-soft text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4" />
                                Trang đặt lịch chụp ảnh
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-sky-600 dark:text-sky-300">
                                Momentia
                            </h1>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                                <ContinuousTypingEffect
                                    text="Kết nối những khoảnh khắc đẹp"
                                    speed={60}
                                    pauseDuration={2000}
                                    className="text-center lg:text-left"
                                />
                            </h2>

                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl">
                                Đặt lịch chụp ảnh với những nhiếp ảnh gia chuyên
                                nghiệp nhất. Từ ảnh cưới, gia đình đến sự kiện
                                doanh nghiệp.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Button
                                    onClick={() => onNavigate("/customer-auth-login")}
                                    size="lg"
                                    className="sky-gradient hover:opacity-90 text-lg px-8 py-4 h-auto text-white hover-lift transition-all duration-300 hover:shadow-2xl group"
                                >
                                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    Đặt lịch chụp ngay
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>

                                <Button
                                    onClick={() => onNavigate("/photographer-auth-login")}
                                    size="lg"
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-4 h-auto hover-lift transition-all duration-300 hover:shadow-xl group"
                                >
                                    <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    Dành cho nhiếp ảnh gia
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

                        {/* Right column – Hero image with effects */}
                        <div className="relative flex items-center justify-center mt-12">
                            <div className="relative group isolate">
                                {/* Soft background gradients */}
                                <div className="pointer-events-none absolute inset-0 -m-20 bg-gradient-to-br from-purple-100/70 via-blue-50/50 to-pink-100/70 dark:from-purple-900/30 dark:via-blue-900/20 dark:to-pink-900/30 rounded-full blur-3xl opacity-80 transition-all duration-700 motion-safe:animate-pulse-slow group-hover:opacity-100" />
                                <div className="pointer-events-none absolute inset-0 -m-12 bg-gradient-to-t from-purple-200/50 via-transparent to-blue-200/50 dark:from-purple-800/20 dark:to-blue-800/20 rounded-full blur-2xl" />

                                {/* Floating container */}
                                <div className="relative motion-safe:animate-float">
                                    {/* Soft shadow under the floating card */}
                                    <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-6 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent dark:via-gray-600/30 rounded-full blur-xl opacity-60 animate-pulse-slow" />

                                    {/* Image card + hover micro motion */}
                                    <div className="relative transform transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-1">
                                        <div className="relative rounded-3xl overflow-hidden shadow-2xl z-10">
                                            <ImageWithFallback
                                                src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=800&fit=crop&crop=center"
                                                alt="Professional photographer at work"
                                                className="w-full h-[500px] object-cover transition-all duration-500 group-hover:brightness-110"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                            <div className="absolute bottom-6 left-6 text-white">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                        <Play className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm">
                                                        Xem video giới thiệu
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    Trải nghiệm chụp ảnh chuyên
                                                    nghiệp
                                                </p>
                                            </div>
                                        </div>

                                        {/* Floating cards */}
                                        <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-20 hover-float cursor-pointer group transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 group-hover:scale-110 transition-all duration-300">
                                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 text-black dark:text-slate-200">
                                                        Đặt lịch thành công
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                                                        Chỉ trong 30 giây
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute -bottom-6 -right-8 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 z-20 hover-float cursor-pointer group transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 group-hover:scale-110 transition-all duration-300">
                                                    <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                                        100% hài lòng
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                                                        Hoặc hoàn tiền
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative particles */}
                                <div className="pointer-events-none absolute top-8 -left-6 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg motion-safe:animate-bounce-slow opacity-80" />
                                <div className="pointer-events-none absolute top-24 -right-8 w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg motion-safe:animate-bounce-slow opacity-70 [animation-delay:1s]" />
                                <div className="pointer-events-none absolute bottom-20 -left-8 w-3 h-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full shadow-md motion-safe:animate-bounce-slow opacity-60 [animation-delay:2s]" />
                                <div className="pointer-events-none absolute bottom-32 -right-6 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg motion-safe:animate-bounce-slow opacity-50 [animation-delay:.5s]" />

                                {/* Orbiting dots */}
                                <div className="pointer-events-none absolute inset-0 motion-safe:animate-spin-slow">
                                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-pulse" />
                                </div>
                                <div className="pointer-events-none absolute inset-0 motion-safe:animate-reverse-spin-slow">
                                    <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-30 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
                            Tại sao chọn{" "}
                            <span className="text-purple-600">Momentia</span> ?
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Chúng tôi mang đến trải nghiệm chụp ảnh hoàn hảo với
                            công nghệ hiện đại và dịch vụ tận tâm.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Nhiếp ảnh gia chuyên nghiệp
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                Hơn 5,000 nhiếp ảnh gia được xác minh và đánh
                                giá cao bởi khách hàng
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark:border-pink-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Đặt lịch nhanh chóng
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                Đặt lịch chụp ảnh chỉ trong vài phút với giao
                                diện thân thiện
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Thanh toán an toàn
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                Hệ thống thanh toán bảo mật và an toàn
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Chất lượng đảm bảo
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                Cam kết 100% hài lòng hoặc hoàn tiền toàn bộ
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Hỗ trợ 24/7
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                Đội ngũ hỗ trợ khách hàng chuyên nghiệp luôn sẵn
                                sàng giúp đỡ
                            </p>
                        </div>

                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50 hover-lift hover-border-glow cursor-pointer group">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 text-black dark:text-slate-200">
                                Chỉnh sửa ảnh 
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
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
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
                            Con số ấn tượng về{" "}
                            <span className="text-sky-600">Momentia</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Chúng tôi tự hào về những thành tựu đã đạt được cùng
                            cộng đồng
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/50 group-hover:scale-110 transition-all duration-300">
                                    <TrendingUp className="w-8 h-8 text-sky-600 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors duration-300" />
                                </div>
                                <div className="text-3xl font-bold text-sky-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                    5,000+
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                    Nhiếp ảnh gia
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 group-hover:scale-110 transition-all duration-300">
                                    <Users className="w-8 h-8 text-purple-600 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300" />
                                </div>
                                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                    50,000+
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                    Khách hàng
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 group-hover:scale-110 transition-all duration-300">
                                    <Camera className="w-8 h-8 text-green-600 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-300" />
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                    100,000+
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                    Buổi chụp
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 group-hover:scale-110 transition-all duration-300">
                                    <Star className="w-8 h-8 text-orange-600 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors duration-300" />
                                </div>
                                <div className="text-3xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                    4.9/5
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
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
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
                            Cách hoạt động đơn giản
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Chỉ 3 bước đơn giản để có những bức ảnh tuyệt vời
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="text-center relative group">
                            <div className="relative">
                                <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/50 group-hover:scale-110 transition-all duration-300">
                                    <Search className="w-10 h-10 text-sky-600 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors duration-300" />
                                </div>
                                <div className="absolute top-10 -right-8 w-16 h-0.5 bg-sky-200 dark:bg-sky-800 hidden md:block group-hover:bg-sky-400 dark:group-hover:bg-sky-600 transition-colors duration-300"></div>
                            </div>
                            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-200 dark:border-sky-800 hover-lift hover-border-glow cursor-pointer">
                                <h3 className="text-xl font-semibold mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300 text-black dark:text-slate-200">
                                    1. Tìm nhiếp ảnh gia
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                    Duyệt qua hàng nghìn portfolio, đánh giá và
                                    chọn nhiếp ảnh gia phù hợp nhất.
                                </p>
                            </div>
                        </div>

                        <div className="text-center relative group">
                            <div className="relative">
                                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 group-hover:scale-110 transition-all duration-300">
                                    <Calendar className="w-10 h-10 text-purple-600 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300" />
                                </div>
                                <div className="absolute top-10 -right-8 w-16 h-0.5 bg-purple-200 dark:bg-purple-800 hidden md:block group-hover:bg-purple-400 dark:group-hover:bg-purple-600 transition-colors duration-300"></div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 hover-lift hover-border-glow cursor-pointer">
                                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                    2. Đặt lịch chụp
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                    Chọn ngày giờ phù hợp, thảo luận concept và
                                    thanh toán an toàn qua ứng dụng.
                                </p>
                            </div>
                        </div>

                        <div className="text-center group">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 group-hover:scale-110 transition-all duration-300">
                                <ImageIcon className="w-10 h-10 text-green-600 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-300" />
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 hover-lift hover-border-glow cursor-pointer">
                                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 text-black dark:text-slate-200">
                                    3. Nhận ảnh đẹp
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
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
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
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
                            onClick={() => onNavigate("/customer-auth-login")}
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
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
                            Câu hỏi thường gặp
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Những thắc mắc phổ biến về dịch vụ của chúng tôi
                        </p>
                    </div>

                    <div className="space-y-6 text-black dark:text-slate-200">
                        {[
                            {
                                question: "Làm thế nào để đặt lịch chụp ảnh?",
                                answer: "Bạn chỉ cần tải ứng dụng Momentia, duyệt qua danh sách nhiếp ảnh gia, chọn người phù hợp và đặt lịch trực tiếp. Quá trình rất đơn giản và nhanh chóng.",
                            },
                            {
                                question: "Chi phí chụp ảnh như thế nào?",
                                answer: "Chi phí sẽ tùy thuộc vào nhiếp ảnh gia, loại hình chụp và thời gian. Chúng tôi có đầy đủ các mức giá từ cơ bản đến cao cấp để phù hợp với mọi ngân sách.",
                            },
                            {
                                question:
                                    "Tôi có thể hủy hoặc thay đổi lịch hẹn không?",
                                answer: "Có, bạn có thể hủy hoặc thay đổi lịch hẹn trước 24 giờ mà không mất phí. Với các trường hợp đặc biệt, vui lòng liên hệ với chúng tôi để được hỗ trợ.",
                            },
                            {
                                question:
                                    "Bao lâu thì tôi nhận được ảnh sau khi chụp?",
                                answer: "Thông thường bạn sẽ nhận được ảnh đã chỉnh sửa trong vòng 48-72 giờ sau buổi chụp. Một số nhiếp ảnh gia có thể giao ảnh nhanh hơn tùy vào gói dịch vụ.",
                            },
                            {
                                question:
                                    "Ứng dụng có hỗ trợ thanh toán như thế nào?",
                                answer: "Momentia hỗ trợ nhiều hình thức thanh toán: ví điện tử, thẻ ngân hàng, chuyển khoản. Tất cả giao dịch đều được mã hóa và bảo mật tuyệt đối.",
                            },
                            {
                                question:
                                    "Tôi có thể làm nhiếp ảnh gia trên Momentia không?",
                                answer: "Tất nhiên! Bạn chỉ cần đăng ký tài khoản nhiếp ảnh gia, upload portfolio và chờ phê duyệt. Chúng tôi sẽ hỗ trợ bạn tiếp cận với hàng nghìn khách hàng tiềm năng.",
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
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black dark:text-slate-200">
                            Khách hàng nói gì về chúng tôi
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Hơn 10,000 khách hàng đã tin tướng và hài lòng với
                            dịch vụ của Momentia
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <Quote className="w-8 h-8 text-purple-600 mb-4 group-hover:text-purple-700 dark:group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
                            <p className="text-slate-600 dark:text-slate-300 mb-6 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                "Dịch vụ tuyệt vời! Nhiếp ảnh gia rất chuyên
                                nghiệp và ảnh cưới của chúng tôi thật hoàn hảo.
                                Highly recommend Momentia!"
                            </p>
                            <div className="flex items-center gap-3">
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=40&h=40&fit=crop&crop=face"
                                    alt="Customer"
                                    className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div>
                                    <p className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                        Nguyễn Thị Hương
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                                        Cô dâu hạnh phúc
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <Quote className="w-8 h-8 text-purple-600 mb-4 group-hover:text-purple-700 dark:group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
                            <p className="text-slate-600 dark:text-slate-300 mb-6 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                "App rất dễ sử dụng, thanh toán an toàn và nhiếp
                                ảnh gia đến đúng giờ. Ảnh gia đình chúng tôi
                                thật tuyệt vời!"
                            </p>
                            <div className="flex items-center gap-3">
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                                    alt="Customer"
                                    className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div>
                                    <p className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                        Trần Văn Minh
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                                        Ông bố 2 con
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover-lift hover-glow cursor-pointer group">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <Quote className="w-8 h-8 text-purple-600 mb-4 group-hover:text-purple-700 dark:group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300" />
                            <p className="text-slate-600 dark:text-slate-300 mb-6 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                "Tôi là nhiếp ảnh gia và rất thích platform này.
                                Nhiều khách hàng chất lượng và hệ thống quản lý
                                booking rất tiện lợi."
                            </p>
                            <div className="flex items-center gap-3">
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                                    alt="Photographer"
                                    className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div>
                                    <p className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-black dark:text-slate-200">
                                        Lê Quang Dũng
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
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
                        Hãy đăng ký ngay tại đây và đặt lịch chụp ảnh với những
                        nhiếp ảnh gia tốt nhất nhé!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => onNavigate("/customer-auth-login")}
                            size="lg"
                            className="bg-white text-sky-600 hover:bg-sky-50 text-lg px-8 py-4 h-auto"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            Đăng ký khách hàng
                        </Button>
                        <Button
                            onClick={() => onNavigate("/photographer-auth-login")}
                            size="lg"
                            className="bg-white text-sky-600 hover:bg-sky-50 border border-sky-200 text-lg px-8 py-4 h-auto"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            Đăng ký trở thành nhiếp ảnh gia
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 text-white py-16">
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
                                        8888 6666
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-slate-300">
                                        takecare@momentia.vn
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
                            © 2025 Momentia
                        </p>
                        <div className="flex items-center gap-2 mt-4 md:mt-0 text-slate-400 text-sm">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-400" />
                            <span>in Vietnam</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* === Inline CSS for animations (no tailwind.config needed) === */}
            <style>{`
        @keyframes float { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-8px)} }
        @keyframes pulse-slow { 0%,100% {opacity:.8} 50% {opacity:1} }
        @keyframes bounce-slow { 0%,100% {transform:translateY(0)} 50% {transform:translateY(-6px)} }
        @keyframes spin-slow { to {transform:rotate(360deg)} }
        @keyframes reverse-spin-slow { to {transform:rotate(-360deg)} }

        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3.2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 18s linear infinite; }
        .animate-reverse-spin-slow { animation: reverse-spin-slow 22s linear infinite; }

        /* Giả lập motion-safe: dùng class có dấu ":" (escape trong CSS) */
        .motion-safe\\:animate-float { animation: float 4s ease-in-out infinite; }
        .motion-safe\\:animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .motion-safe\\:animate-bounce-slow { animation: bounce-slow 3.2s ease-in-out infinite; }
        .motion-safe\\:animate-spin-slow { animation: spin-slow 18s linear infinite; }
        .motion-safe\\:animate-reverse-spin-slow { animation: reverse-spin-slow 22s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-float,
          .motion-safe\\:animate-pulse-slow,
          .motion-safe\\:animate-bounce-slow,
          .motion-safe\\:animate-spin-slow,
          .motion-safe\\:animate-reverse-spin-slow { animation: none !important; }
        }
      `}</style>
        </div>
    );
}
