import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
    ArrowLeft,
    Send,
    Paperclip,
    Image as ImageIcon,
    Shield,
    Calendar,
} from "lucide-react";

interface ThreeWayMessage {
    id: string;
    sender: "customer" | "photographer" | "coordinator";
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    type: "text" | "booking_change" | "system";
    bookingChange?: {
        field: string;
        oldValue: string;
        newValue: string;
        status: "pending" | "approved" | "rejected";
    };
}

interface ThreeWayChatProps {
    bookingId: string;
    currentUser: "customer" | "photographer" | "coordinator";
    onBack: () => void;
}

export function ThreeWayChat({
    bookingId,
    currentUser,
    onBack,
}: ThreeWayChatProps) {
    const [messageInput, setMessageInput] = useState("");

    const participants = {
        customer: {
            name: "Nguyễn Văn A",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face",
            role: "Khách hàng",
        },
        photographer: {
            name: "Minh Tuấn",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
            role: "Nhiếp ảnh gia",
        },
        coordinator: {
            name: "Thu Hương",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face",
            role: "Điều phối viên",
        },
    };

    const [messages] = useState<ThreeWayMessage[]>([
        {
            id: "1",
            sender: "coordinator",
            senderName: participants.coordinator.name,
            senderAvatar: participants.coordinator.avatar,
            content:
                "Chào mọi người! Tôi là điều phối viên phụ trách buổi chụp này. Có gì cần hỗ trợ xin liên hệ.",
            timestamp: "10:00",
            type: "text",
        },
        {
            id: "2",
            sender: "customer",
            senderName: participants.customer.name,
            senderAvatar: participants.customer.avatar,
            content:
                "Em muốn đổi địa điểm chụp từ Hồ Gươm sang Công viên Thống Nhất được không ạ?",
            timestamp: "10:30",
            type: "text",
        },
        {
            id: "3",
            sender: "customer",
            senderName: participants.customer.name,
            senderAvatar: participants.customer.avatar,
            content: "",
            timestamp: "10:31",
            type: "booking_change",
            bookingChange: {
                field: "Địa điểm",
                oldValue: "Hồ Gươm, Hà Nội",
                newValue: "Công viên Thống Nhất, Hà Nội",
                status: "pending",
            },
        },
        {
            id: "4",
            sender: "photographer",
            senderName: participants.photographer.name,
            senderAvatar: participants.photographer.avatar,
            content:
                "Được em, anh ok với địa điểm mới. Công viên Thống Nhất cũng có nhiều góc đẹp để chụp.",
            timestamp: "10:35",
            type: "text",
        },
        {
            id: "5",
            sender: "coordinator",
            senderName: participants.coordinator.name,
            senderAvatar: participants.coordinator.avatar,
            content:
                "Tôi đã xác nhận thay đổi địa điểm. Buổi chụp sẽ diễn ra tại Công viên Thống Nhất.",
            timestamp: "10:40",
            type: "text",
        },
        {
            id: "6",
            sender: "coordinator",
            senderName: participants.coordinator.name,
            senderAvatar: participants.coordinator.avatar,
            content: "",
            timestamp: "10:40",
            type: "booking_change",
            bookingChange: {
                field: "Địa điểm",
                oldValue: "Hồ Gươm, Hà Nội",
                newValue: "Công viên Thống Nhất, Hà Nội",
                status: "approved",
            },
        },
    ]);

    const sendMessage = () => {
        if (messageInput.trim()) {
            alert(`Gửi tin nhắn: ${messageInput}`);
            setMessageInput("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getSenderRole = (sender: string) =>
        participants[sender as keyof typeof participants]?.role || sender;

    // badge trạng thái có dark:
    const getChangeStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300";
        }
    };

    const getChangeStatusText = (status: string) =>
        status === "approved"
            ? "Đã chấp nhận"
            : status === "rejected"
            ? "Đã từ chối"
            : status === "pending"
            ? "Đang chờ"
            : status;

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* Header */}
             <div className="bg-card border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="p-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex-1">
                        <h1 className="font-semibold">
                            Thảo luận thay đổi booking
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Mã: {bookingId} • 3 người tham gia
                        </p>
                    </div>
                </div>

                {/* Participants chips */}
                <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                    {Object.entries(participants).map(([key, participant]) => (
                        <div
                            key={key}
                            className="flex items-center gap-2 rounded-full px-3 py-1 whitespace-nowrap
           bg-slate-100 dark:bg-slate-800
           text-slate-700 dark:text-slate-200
           border border-transparent dark:border-slate-700"
                        >
                            <ImageWithFallback
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40 dark:ring-white/20"
                            />
                            <div className="text-sm">
                                <span className="font-medium">
                                    {participant.name}
                                </span>
                                <span className="text-gray-600 dark:text-slate-200">
                                    {" "}
                                    • {participant.role}
                                </span>
                            </div>
                            {key === "coordinator" && (
                                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {messages.map((message) => {
                    if (message.type === "booking_change") {
                        return (
                            <div
                                key={message.id}
                                className="flex justify-center"
                            >
                                <Card className="max-w-xs border-2 border-dashed border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-slate-800">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                            <span className="font-medium text-blue-900 dark:text-blue-200">
                                                Thay đổi booking
                                            </span>
                                            <Badge
                                                className={getChangeStatusColor(
                                                    message.bookingChange!
                                                        .status
                                                )}
                                            >
                                                {getChangeStatusText(
                                                    message.bookingChange!
                                                        .status
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-slate-400">
                                                    Thay đổi:{" "}
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        message.bookingChange!
                                                            .field
                                                    }
                                                </span>
                                            </div>

                                            <div className="bg-white dark:bg-slate-900 p-2 rounded border-l-4 border-red-400 dark:border-red-500">
                                                <div className="text-gray-600 dark:text-slate-400">
                                                    Cũ:
                                                </div>
                                                <div className="font-medium line-through text-red-600 dark:text-red-400">
                                                    {
                                                        message.bookingChange!
                                                            .oldValue
                                                    }
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-slate-900 p-2 rounded border-l-4 border-green-400 dark:border-green-500">
                                                <div className="text-gray-600 dark:text-slate-400">
                                                    Mới:
                                                </div>
                                                <div className="font-medium text-green-600 dark:text-green-400">
                                                    {
                                                        message.bookingChange!
                                                            .newValue
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 flex items-center justify-between">
                                            <span>
                                                Bởi {message.senderName}
                                            </span>
                                            <span>{message.timestamp}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    }

                    const isMine = message.sender === currentUser;
                    const isCoordinator = message.sender === "coordinator";

                    return (
                        <div
                            key={message.id}
                            className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                            }`}
                        >
                            {!isMine && (
                                <ImageWithFallback
                                    src={message.senderAvatar}
                                    alt={message.senderName}
                                    className="w-8 h-8 rounded-full object-cover mr-2 mt-auto"
                                />
                            )}

                            <div
                                className={[
                                    "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl border",
                                    isMine
                                        ? "bg-pink-500 text-white border-pink-500 dark:bg-pink-500 dark:border-pink-500"
                                        : isCoordinator
                                        ? "bg-blue-100 text-blue-900 border-blue-200 dark:bg-slate-800 dark:text-blue-200 dark:border-slate-700"
                                        : "bg-white text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
                                ].join(" ")}
                            >
                                {!isMine && (
                                    <div className="flex items-center gap-1 mb-1">
                                        <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                            {getSenderRole(message.sender)}
                                        </p>
                                        {isCoordinator && (
                                            <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                )}

                                <p className="text-sm">{message.content}</p>
                                <p
                                    className={[
                                        "text-xs mt-1",
                                        isMine
                                            ? "text-pink-100"
                                            : "text-gray-500 dark:text-slate-400",
                                    ].join(" ")}
                                >
                                    {message.timestamp}
                                </p>
                            </div>

                            {isMine && (
                                <ImageWithFallback
                                    src={message.senderAvatar}
                                    alt={message.senderName}
                                    className="w-8 h-8 rounded-full object-cover ml-2 mt-auto"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Message Input */}
            <div className="bg-card border-t border-border p-4">
                <div className="flex items-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </Button>

                    <div className="flex-1">
                        <Input
                            placeholder="Nhập tin nhắn..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="bg-input-background border-border"
                        />
                    </div>

                    <Button
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-pink-500 hover:bg-pink-600 text-white p-3 disabled:opacity-60"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
