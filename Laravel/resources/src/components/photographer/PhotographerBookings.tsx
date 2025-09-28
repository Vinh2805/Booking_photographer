import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
    Calendar,
    MapPin,
    Clock,
    Star,
    CheckCircle,
    AlertCircle,
    Camera,
    DollarSign,
    Upload,
    ArrowLeft,
    Search,
    X,
    Image as ImageIcon,
    MessageCircle,
    XCircle,
    Edit,
    Play,
    Check,
    FileX,
    ChevronDown,
} from "lucide-react";

type BookingStatus =
    | "pending_confirmation" // Chờ xác nhận
    | "pending_deposit" // Chờ đặt cọc
    | "upcoming" // Sắp diễn ra
    | "ongoing" // Đang diễn ra
    | "pending_payment" // Chờ thanh toán
    | "pending_processing" // Chờ xử lý ảnh
    | "processed" // Đã xử lý ảnh
    | "completed" // Đã hoàn thành
    | "cancelled"; // Đã hủy

interface Booking {
    id: string;
    status: BookingStatus;
    title: string;
    customer: {
        name: string;
        avatar: string;
    };
    type: string;
    location: string;
    date: string;
    time: string;
    price: number;
    description: string;
    services: string[];
    duration: string;
    guestCount: string;
    specialRequests?: string;
    uploadedRaw?: boolean;
    uploadedEdited?: boolean;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "customer";
    timestamp: string;
}

interface ChangeRequest {
    field: "time" | "location" | "date" | "other";
    currentValue: string;
    newValue: string;
    reason: string;
}

interface PhotographerBookingsProps {
    selectedBookingId?: string;
    onNavigate?: (view: any) => void;
    onClearSelection?: () => void;
}

export function PhotographerBookings({
    selectedBookingId,
    onClearSelection,
}: PhotographerBookingsProps) {
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">(
        "all"
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null
    );
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showChangeDialog, setShowChangeDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [uploadType, setUploadType] = useState<"raw" | "edited" | null>(null);
    const [uploadUrl, setUploadUrl] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [Bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
        // THÊM: Hàm fetch bookings từ API
    const fetchBookings = async (status: string = selectedStatus, search: string = searchQuery) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (status !== 'all') params.append('status', status);
            if (search) params.append('search', search);
            
            const response = await fetch(`/api/buoi-chup?${params}`);
            const result = await response.json();
            
            if (result.success) {
                setBookings(result.data);
            } else {
                setError(result.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi tải bookings:', error);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // THÊM: Fetch bookings khi component mount và khi filter thay đổi
    useEffect(() => {
        fetchBookings();
    }, [selectedStatus, searchQuery]);

    // THÊM: Fetch chi tiết booking khi có selectedBookingId
    useEffect(() => {
        const fetchBookingDetail = async (bookingId: string) => {
            try {
                const response = await fetch(`/api/buoi-chup/${bookingId}`);
                const result = await response.json();
                
                if (result.success) {
                    setSelectedBooking(result.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải chi tiết booking:', error);
            }
        };

        if (selectedBookingId) {
            fetchBookingDetail(selectedBookingId);
        }
    }, [selectedBookingId]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "1",
            text: "Xin chào, tôi muốn hỏi về buổi chụp",
            sender: "customer",
            timestamp: "10:30",
        },
        {
            id: "2",
            text: "Chào bạn! Tôi sẵn sàng hỗ trợ bạn",
            sender: "user",
            timestamp: "10:32",
        },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [changeRequest, setChangeRequest] = useState<ChangeRequest>({
        field: "time",
        currentValue: "",
        newValue: "",
        reason: "",
    });
    const [cancelReason, setCancelReason] = useState("");

    // Cho phép bấm "Bắt đầu buổi chụp" từ 30' trước giờ hẹn đến 4h sau
    const [isReadyToStart, setIsReadyToStart] = useState(false);

    useEffect(() => {
        if (!selectedBooking?.time) {
            setIsReadyToStart(false);
            return;
        }

        // selectedBooking.time dạng "HH:mm"
        const [h, m] = selectedBooking.time.split(":").map(Number);
        const now = new Date();
        const scheduled = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            h,
            m,
            0,
            0
        );
        const openFrom = new Date(scheduled.getTime() - 30 * 60 * 1000); // -30'
        const openUntil = new Date(scheduled.getTime() + 4 * 60 * 60 * 1000); // +4h

        const compute = () => {
            const t = new Date();
            setIsReadyToStart(t >= openFrom && t <= openUntil);
        };

        compute(); // tính ngay lần đầu
        const timer = setInterval(compute, 60 * 1000); // cập nhật mỗi phút
        return () => clearInterval(timer);
    }, [selectedBooking?.time]);

    // Effect to handle selectedBookingId from props
    useEffect(() => {
        if (selectedBookingId) {
            const booking = bookings.find((b) => b.id === selectedBookingId);
            if (booking) {
                setSelectedBooking(booking);
            }
        }
    }, [selectedBookingId]);

    // Enhanced booking data with all 9 statuses
    const bookings: Booking[] = [            
    ];

    const getStatusInfo = (status: BookingStatus) => {
        const statusMap = {
            pending_confirmation: {
                label: "Chờ xác nhận",
                color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
                icon: AlertCircle,
            },
            pending_deposit: {
                label: "Chờ đặt cọc",
                color: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300",
                icon: DollarSign,
            },
            upcoming: {
                label: "Sắp diễn ra",
                color: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
                icon: Calendar,
            },
            ongoing: {
                label: "Đang diễn ra",
                color: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
                icon: Camera,
            },
            pending_payment: {
                label: "Chờ thanh toán",
                color: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
                icon: DollarSign,
            },
            pending_processing: {
                label: "Chờ xử lý ảnh",
                color: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
                icon: ImageIcon,
            },
            processed: {
                label: "Đã xử lý ảnh",
                color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300",
                icon: Star,
            },
            completed: {
                label: "Đã hoàn thành",
                color: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
                icon: CheckCircle,
            },
            cancelled: {
                label: "Đã huỷ",
                color: "bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300",
                icon: X,
            },
        };
        return statusMap[status];
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
        const matchesSearch = searchQuery === "" ||
            booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Status counts for badges
    const statusCounts: Record<BookingStatus | "all", number> = {
                all: bookings.length,
        pending_confirmation: bookings.filter((b) => b.status === "pending_confirmation").length,
        pending_deposit: bookings.filter((b) => b.status === "pending_deposit").length,
        upcoming: bookings.filter((b) => b.status === "upcoming").length,
        ongoing: bookings.filter((b) => b.status === "ongoing").length,
        pending_payment: bookings.filter((b) => b.status === "pending_payment").length,
        pending_processing: bookings.filter((b) => b.status === "pending_processing").length,
        processed: bookings.filter((b) => b.status === "processed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,

    };

    // Filter options for dropdown
    const filterOptions = [
        {
            id: "all",
            status: "all" as const,
            label: "Tất cả buổi chụp",
            color: "bg-slate-500",
            icon: Camera,
        },
        {
            id: "pending_confirmation",
            status: "pending_confirmation" as const,
            label: "Chờ xác nhận",
            color: "bg-yellow-500",
            icon: AlertCircle,
        },
        {
            id: "pending_deposit",
            status: "pending_deposit" as const,
            label: "Chờ đặt cọc",
            color: "bg-orange-500",
            icon: DollarSign,
        },
        {
            id: "upcoming",
            status: "upcoming" as const,
            label: "Sắp diễn ra",
            color: "bg-blue-500",
            icon: Calendar,
        },
        {
            id: "ongoing",
            status: "ongoing" as const,
            label: "Đang diễn ra",
            color: "bg-green-500",
            icon: Camera,
        },
        {
            id: "pending_payment",
            status: "pending_payment" as const,
            label: "Chờ thanh toán",
            color: "bg-red-500",
            icon: DollarSign,
        },
        {
            id: "pending_processing",
            status: "pending_processing" as const,
            label: "Chờ xử lý ảnh",
            color: "bg-purple-500",
            icon: ImageIcon,
        },
        {
            id: "processed",
            status: "processed" as const,
            label: "Đã xử lý ảnh",
            color: "bg-indigo-500",
            icon: Star,
        },
        {
            id: "completed",
            status: "completed" as const,
            label: "Đã hoàn thành",
            color: "bg-emerald-500",
            icon: CheckCircle,
        },
        {
            id: "cancelled",
            status: "cancelled" as const,
            label: "Đã huỷ",
            color: "bg-slate-500",
            icon: X,
        },
    ];
    
    // Get selected filter option
    const selectedFilterOption =
        filterOptions.find((option) => option.status === selectedStatus) ||
        filterOptions[0];

    // Handle filter selection
    const handleFilterSelect = (status: BookingStatus | "all") => {
        setSelectedStatus(status);
    };

    const handleConfirmBooking = (bookingId: string) => {
        alert(`Xác nhận buổi chụp ${bookingId}`);
    };

    const handleRejectBooking = (bookingId: string) => {
        alert(`Từ chối buổi chụp ${bookingId}`);
    };

    const handleRequestChange = (bookingId: string) => {
        if (!selectedBooking) return;

        // Set current value based on field
        let currentValue = "";
        switch (changeRequest.field) {
            case "time":
                currentValue = selectedBooking.time;
                break;
            case "location":
                currentValue = selectedBooking.location;
                break;
            case "date":
                currentValue = new Date(
                    selectedBooking.date
                ).toLocaleDateString("vi-VN");
                break;
        }

        setChangeRequest((prev) => ({ ...prev, currentValue }));
        setShowChangeDialog(true);
    };

    const handleRequestCancel = (bookingId: string) => {
        setShowCancelDialog(true);
    };

    const submitChangeRequest = () => {
        alert(
            `Yêu cầu thay đổi ${changeRequest.field}: ${changeRequest.newValue}\nLý do: ${changeRequest.reason}`
        );
        setShowChangeDialog(false);
        setChangeRequest({
            field: "time",
            currentValue: "",
            newValue: "",
            reason: "",
        });
    };

    const submitCancelRequest = () => {
        alert(
            `Yêu cầu hủy buổi chụp ${selectedBooking?.id}\nLý do: ${cancelReason}`
        );
        setShowCancelDialog(false);
        setCancelReason("");
    };

    const handleUploadPhotos = (bookingId: string, type: "raw" | "edited") => {
        setUploadType(type);
        setShowUploadDialog(true);
    };

    const submitUpload = () => {
        if (!uploadUrl.trim()) {
            alert("Vui lòng nhập link tải xuống!");
            return;
        }

        alert(
            `Upload ảnh ${
                uploadType === "raw" ? "gốc" : "hậu kỳ"
            } thành công!\nLink: ${uploadUrl}`
        );
        setShowUploadDialog(false);
        setUploadType(null);
        setUploadUrl("");
    };

    const openChat = (customerName: string) => {
        setShowChat(true);
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            text: newMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setChatMessages([...chatMessages, message]);
        setNewMessage("");
    };

    const handleCloseDetail = () => {
        setSelectedBooking(null);
        if (onClearSelection) {
            onClearSelection();
        }
    };

    // Chat Dialog
    if (showChat) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                {/* Header */}
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChat(false)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2 flex-1">
                            <ImageWithFallback
                                src={selectedBooking?.customer.avatar || ""}
                                alt={selectedBooking?.customer.name || ""}
                                className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                            />
                            <div>
                                <h1 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                                    {selectedBooking?.customer.name}
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Trực tuyến
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {chatMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-2xl ${
                                    message.sender === "user"
                                        ? "bg-pink-500 text-white"
                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p
                                    className={`text-xs mt-1 ${
                                        message.sender === "user"
                                            ? "text-pink-100"
                                            : "text-slate-500 dark:text-slate-400"
                                    }`}
                                >
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50 p-4">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Nhập tin nhắn..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && sendMessage()
                            }
                            className="flex-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        />
                        <Button
                            onClick={sendMessage}
                            size="sm"
                            className="bg-pink-500 hover:bg-pink-600"
                        >
                            Gửi
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Booking detail view
    if (selectedBooking) {
        const statusInfo = getStatusInfo(selectedBooking.status);
        const StatusIcon = statusInfo.icon;

        return (
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                {/* Chat Header */}
                <div className="bg-card dark:bg-card border-b border-border p-4 text-black dark:text-slate-200">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseDetail}
                            className="p-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <div className="flex-1">
                            <h1 className="font-medium flex items-center gap-1">
                                Chi tiết buổi chụp
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Mã: {selectedBooking.id}
                            </p>
                        </div>
                        <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                        </Badge>
                    </div>
                </div>

                <div className="p-4 space-y-4 pb-24">
                    {/* Customer Info */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4">
                            <h3 className="font-medium mb-3 text-slate-800 dark:text-slate-100">
                                Thông tin khách hàng
                            </h3>
                            <div className="flex items-center gap-3">
                                <ImageWithFallback
                                    src={selectedBooking.customer.avatar}
                                    alt={selectedBooking.customer.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {selectedBooking.customer.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Khách hàng
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        openChat(selectedBooking.customer.name)
                                    }
                                    className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Details */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100">
                                Thông tin buổi chụp
                            </h3>

                            <div>
                                <h4 className="font-medium text-lg text-slate-800 dark:text-slate-100">
                                    {selectedBooking.title}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {selectedBooking.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Thể loại
                                    </p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {selectedBooking.type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Thời lượng
                                    </p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {selectedBooking.duration}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Số người
                                    </p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {selectedBooking.guestCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Giá trị
                                    </p>
                                    <p className="font-medium text-pink-600 dark:text-pink-400">
                                        {selectedBooking.price.toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        VNĐ
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    Địa điểm
                                </p>
                                <p className="font-medium text-slate-800 dark:text-slate-100">
                                    {selectedBooking.location}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                                        <Calendar className="w-3 h-3" />
                                        Ngày
                                    </p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {new Date(
                                            selectedBooking.date
                                        ).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                                        <Clock className="w-3 h-3" />
                                        Giờ
                                    </p>
                                    <p className="font-medium text-slate-800 dark:text-slate-100">
                                        {selectedBooking.time}
                                    </p>
                                </div>
                            </div>

                            {selectedBooking.services.length > 0 && (
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                                        Dịch vụ đi kèm
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedBooking.services.map(
                                            (service, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="text-xs border-slate-300 dark:border-slate-600"
                                                >
                                                    {service}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedBooking.specialRequests && (
                                <div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                                        Yêu cầu đặc biệt
                                    </p>
                                    <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-4 border-yellow-400 dark:border-yellow-600 text-slate-800 dark:text-slate-100">
                                        {selectedBooking.specialRequests}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upload Status (for certain statuses) */}
                    {(selectedBooking.status === "pending_processing" ||
                        selectedBooking.status === "processed" ||
                        selectedBooking.status === "completed" ||
                        selectedBooking.status === "pending_payment") && (
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-4">
                                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                    <ImageIcon className="w-4 h-4" />
                                    Trạng thái upload ảnh
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        className={`p-3 rounded-lg border-2 ${
                                            selectedBooking.uploadedRaw
                                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                                                : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    selectedBooking.uploadedRaw
                                                        ? "bg-green-500"
                                                        : "bg-slate-400"
                                                }`}
                                            ></div>
                                            <span className="font-medium text-sm text-slate-800 dark:text-slate-100">
                                                Ảnh gốc
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {selectedBooking.uploadedRaw
                                                ? "Đã upload"
                                                : "Chưa upload"}
                                        </p>
                                    </div>

                                    <div
                                        className={`p-3 rounded-lg border-2 ${
                                            selectedBooking.uploadedEdited
                                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                                                : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    selectedBooking.uploadedEdited
                                                        ? "bg-green-500"
                                                        : "bg-slate-400"
                                                }`}
                                            ></div>
                                            <span className="font-medium text-sm text-slate-800 dark:text-slate-100">
                                                Ảnh hậu kỳ
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {selectedBooking.uploadedEdited
                                                ? "Đã upload"
                                                : "Chưa upload"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {selectedBooking.status === "pending_confirmation" && (
                            <>
                                <Button
                                    onClick={() =>
                                        handleConfirmBooking(selectedBooking.id)
                                    }
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Xác nhận buổi chụp
                                </Button>
                                <Button
                                    onClick={() =>
                                        handleRejectBooking(selectedBooking.id)
                                    }
                                    variant="destructive"
                                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 h-12"
                                >
                                    <XCircle className="w-5 h-5 mr-2" />
                                    Từ chối buổi chụp
                                </Button>
                            </>
                        )}

                        {selectedBooking.status === "upcoming" && (
                            <div className="space-y-3 pb-6">
                                <Button
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12"
                                    disabled={!isReadyToStart}
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Bắt đầu buổi chụp
                                </Button>
                                {!isReadyToStart && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        Nút sẽ mở từ 30 phút trước giờ hẹn tới 4
                                        giờ sau.
                                    </p>
                                )}
                            </div>
                        )}

                        {selectedBooking.status === "ongoing" && (
                            <div className="space-y-3 pb-6">
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12"
                                    onClick={() =>
                                        alert("Kết thúc buổi chụp thành công!")
                                    }
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Kết thúc buổi chụp
                                </Button>
                                {!isReadyToStart && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        Nhấn kết thúc sau khi kết thúc quá trình
                                        chụp
                                    </p>
                                )}
                            </div>
                        )}

                        {selectedBooking.status === "pending_processing" ||
                            (selectedBooking.status === "pending_payment" && (
                                <div className="space-y-2">
                                    <Button
                                        onClick={() =>
                                            handleUploadPhotos(
                                                selectedBooking.id,
                                                "raw"
                                            )
                                        }
                                        variant="outline"
                                        className="w-full h-12 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        disabled={selectedBooking.uploadedRaw}
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {selectedBooking.uploadedRaw
                                            ? "Đã upload ảnh gốc"
                                            : "Upload ảnh gốc"}
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleUploadPhotos(
                                                selectedBooking.id,
                                                "edited"
                                            )
                                        }
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12"
                                        disabled={
                                            selectedBooking.uploadedEdited
                                        }
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {selectedBooking.uploadedEdited
                                            ? "Đã upload ảnh hậu kỳ"
                                            : "Upload ảnh hậu kỳ"}
                                    </Button>
                                </div>
                            ))}

                        {(selectedBooking.status === "upcoming" ||
                            selectedBooking.status === "pending_deposit") && (
                            <div className="space-y-3">
                                {/* Nút Yêu cầu thay đổi — outline, nền xám nhạt, pill */}
                                <Button
                                    onClick={() =>
                                        handleRequestChange(selectedBooking.id)
                                    }
                                    variant="outline"
                                    className="
        w-full h-14 rounded-2xl
        bg-slate-50 border border-slate-200
        text-slate-700
        hover:bg-slate-100
        dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700
        flex items-center justify-center
      "
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Yêu cầu thay đổi
                                </Button>

                                {/* Nút Yêu cầu hủy — đỏ đặc, pill */}
                                <Button
                                    onClick={() =>
                                        handleRequestCancel(selectedBooking.id)
                                    }
                                    className="
        w-full h-14 rounded-2xl
        bg-red-500 hover:bg-red-600
        text-white
        flex items-center justify-center
      "
                                >
                                    <FileX className="w-4 h-4 mr-2" />
                                    Yêu cầu hủy
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialogs */}
                <Dialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                >
                    <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-slate-800 dark:text-slate-100">
                                Upload{" "}
                                {uploadType === "raw"
                                    ? "ảnh gốc"
                                    : "ảnh hậu kỳ"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                                Nhập link tải xuống ảnh từ Google Drive hoặc
                                Dropbox
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={uploadUrl}
                                onChange={(e) => setUploadUrl(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUploadDialog(false)}
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={submitUpload}
                                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    Upload
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showChangeDialog}
                    onOpenChange={setShowChangeDialog}
                >
                    <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-slate-800 dark:text-slate-100">
                                Yêu cầu thay đổi
                            </DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                                Gửi yêu cầu thay đổi thông tin buổi chụp cho
                                khách hàng
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Thay đổi
                                </label>
                                <Select
                                    value={changeRequest.field}
                                    onValueChange={(value: any) =>
                                        setChangeRequest((prev) => ({
                                            ...prev,
                                            field: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="time">
                                            Giờ
                                        </SelectItem>
                                        <SelectItem value="date">
                                            Ngày
                                        </SelectItem>
                                        <SelectItem value="location">
                                            Địa điểm
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Khác
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Giá trị mới
                                </label>
                                <Input
                                    placeholder="Nhập giá trị mới..."
                                    value={changeRequest.newValue}
                                    onChange={(e) =>
                                        setChangeRequest((prev) => ({
                                            ...prev,
                                            newValue: e.target.value,
                                        }))
                                    }
                                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Lý do
                                </label>
                                <Input
                                    placeholder="Lý do thay đổi..."
                                    value={changeRequest.reason}
                                    onChange={(e) =>
                                        setChangeRequest((prev) => ({
                                            ...prev,
                                            reason: e.target.value,
                                        }))
                                    }
                                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowChangeDialog(false)}
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={submitChangeRequest}
                                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                >
                                    Gửi yêu cầu
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                >
                    <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-slate-800 dark:text-slate-100">
                                Yêu cầu hủy buổi chụp
                            </DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                                Gửi yêu cầu hủy buổi chụp này cho khách hàng
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Lý do hủy
                                </label>
                                <Input
                                    placeholder="Nhập lý do hủy..."
                                    value={cancelReason}
                                    onChange={(e) =>
                                        setCancelReason(e.target.value)
                                    }
                                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelDialog(false)}
                                    className="flex-1"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={submitCancelRequest}
                                    variant="destructive"
                                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                                >
                                    Gửi yêu cầu hủy
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 pb-24 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                {/* Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="justify-between bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-border hover:shadow-md hover-lift transition-all duration-200"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${selectedFilterOption.color}`}
                                />
                                <selectedFilterOption.icon className="h-4 w-4" />
                                <span className="text-sm text-foreground">
                                    {selectedFilterOption.label}
                                </span>
                                <Badge
                                    variant={
                                        statusCounts[selectedStatus] > 0
                                            ? "default"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {statusCounts[selectedStatus]}
                                </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-64 max-h-80 overflow-y-auto bg-card border-border"
                        align="start"
                    >
                        <div className="px-3 py-2 border-b border-border">
                            <p className="font-medium text-sm text-card-foreground">
                                Chọn trạng thái buổi chụp
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tất cả: {statusCounts.all} buổi chụp
                            </p>
                        </div>

                        {filterOptions.map((option, index) => (
                            <React.Fragment key={option.id}>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleFilterSelect(option.status)
                                    }
                                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors duration-200 ${
                                        selectedStatus === option.status
                                            ? "bg-accent"
                                            : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${option.color}`}
                                        />
                                        <option.icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {option.label}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={
                                            statusCounts[option.status] > 0
                                                ? "default"
                                                : "secondary"
                                        }
                                        className={`text-xs ${
                                            selectedStatus === option.status
                                                ? "bg-primary text-primary-foreground"
                                                : ""
                                        }`}
                                    >
                                        {statusCounts[option.status]}
                                    </Badge>
                                </DropdownMenuItem>

                                {/* Separator after certain groups */}
                                {(index === 0 ||
                                    index === 3 ||
                                    index === 6) && <DropdownMenuSeparator />}
                            </React.Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm buổi chụp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input-background border-border"
                    />
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
                {filteredBookings.map((booking) => {
                    const statusInfo = getStatusInfo(booking.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <Card
                            key={booking.id}
                            className="cursor-pointer hover:shadow-lg hover-lift transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group"
                            onClick={() => setSelectedBooking(booking)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <ImageWithFallback
                                        src={booking.customer.avatar}
                                        alt={booking.customer.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 group-hover:scale-110 transition-transform duration-200"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-medium truncate text-slate-800 dark:text-slate-100">
                                                    {booking.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {booking.customer.name}
                                                </p>
                                            </div>
                                            <Badge className={statusInfo.color}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusInfo.label}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {new Date(
                                                        booking.date
                                                    ).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{booking.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Camera className="w-3 h-3" />
                                                <span>{booking.type}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span className="font-semibold text-pink-600 dark:text-pink-400">
                                                    {booking.price.toLocaleString(
                                                        "vi-VN"
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">
                                                {booking.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredBookings.length === 0 && (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-lg font-medium mb-2">
                            Không tìm thấy buổi chụp nào
                        </p>
                        <p className="text-sm">
                            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
