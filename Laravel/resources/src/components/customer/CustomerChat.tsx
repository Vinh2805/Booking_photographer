import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ThreeWayChat } from "../ui/three-way-chat";
import {
    Search,
    Send,
    ArrowLeft,
    Image as ImageIcon,
    Paperclip,
    Info,
    Users,
    Shield,
    MessageCircle,
    Loader,
} from "lucide-react";
import chatApi, { ChatMessage } from "../services/chatApi";
import apiClient from "../services/apiClient";
import Echo from "../../echo";
import { toast } from "sonner";

interface ChatRoom {
    id: string;
    bookingId?: string;
    type: "direct" | "three_way" | "support";
    participants: Array<{
        name: string;
        avatar: string;
        role: string;
    }>;
    title: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline?: boolean;
    hasBookingChanges?: boolean;
}

interface Message {
    id: string;
    sender: "customer" | "photographer" | "coordinator" | "support";
    content: string;
    timestamp: string;
    type: "text" | "image" | "booking";
    bookingInfo?: any;
    Ma_TN?: string;
    Ma_BC?: string;
    Trang_Thai?: string;
}

export function CustomerChat(_onBack: { onBack: () => void; initialBookingId?: string }) {
    const { onBack, initialBookingId } = _onBack;
    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showThreeWayChat, setShowThreeWayChat] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const echoChannelRef = useRef<any>(null);

    // Fetch bookings để tạo chat rooms
    useEffect(() => {
        fetchChatRooms();
    }, []);

    // Tự động chọn chat nếu có initialBookingId
    useEffect(() => {
        if (initialBookingId && chatRooms.length > 0 && !selectedChat) {
            const targetRoom = chatRooms.find(room => room.bookingId === initialBookingId);
            if (targetRoom) {
                setSelectedChat(targetRoom);
            }
        }
    }, [initialBookingId, chatRooms, selectedChat]);

    // Fetch tin nhắn khi chọn chat
    useEffect(() => {
        if (selectedChat) {
            if (selectedChat.type === "support") {
                fetchSupportMessages();
            } else if (selectedChat.bookingId) {
                fetchMessages(selectedChat.bookingId);
                subscribeToChat(selectedChat.bookingId);
                markAsRead(selectedChat.bookingId);
            }
        }
        
        return () => {
            // Unsubscribe khi unmount hoặc đổi chat
            if (echoChannelRef.current && selectedChat?.bookingId) {
                Echo.leave(`chat.booking.${selectedChat.bookingId}`);
                echoChannelRef.current = null;
            }
        };
    }, [selectedChat]);

    // Scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchChatRooms = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch support messages
            let supportRoom: ChatRoom;
            try {
                const supportMsgs = await chatApi.getSupportMessages();
                const lastMsg = supportMsgs.length > 0 ? supportMsgs[supportMsgs.length - 1] : null;
                
                supportRoom = {
                    id: "support",
                    type: "support" as const,
                    participants: [{
                        name: "Hỗ trợ Momentia",
                        avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
                        role: "Hỗ trợ khách hàng",
                    }],
                    title: "Hỗ trợ khách hàng",
                    lastMessage: lastMsg?.Noi_Dung || "Cảm ơn bạn đã liên hệ! Tôi có thể giúp gì cho bạn?",
                    lastMessageTime: lastMsg?.Gui_Luc 
                        ? new Date(lastMsg.Gui_Luc).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                        : new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                    unreadCount: 0, 
                    isOnline: true,
                };
            } catch (err) {
                console.error("Failed to fetch support messages", err);
                supportRoom = {
                     id: "support",
                     type: "support" as const,
                     participants: [{
                         name: "Hỗ trợ Momentia",
                         avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
                         role: "Hỗ trợ khách hàng",
                     }],
                     title: "Hỗ trợ khách hàng",
                     lastMessage: "Cảm ơn bạn đã liên hệ! Tôi có thể giúp gì cho bạn?",
                     lastMessageTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                     unreadCount: 0,
                     isOnline: true,
                };
            }

            // 2. Fetch bookings
            const response = await apiClient.get("/customer/bookings");
            const bookings = (response.data && Array.isArray(response.data)) ? response.data : [];

            // Lấy tin nhắn chưa đọc để tính unread count (support messages included?)
            // Currently unread API might not separate support messages easily, assuming booking-based.
            // Support logic for unread needs update in backend "unread" API if needed.

           const roomsPromises = bookings.map(async (booking: any) => {
                 try {
                     const bookingMessages = await chatApi.getMessagesByBooking(booking.id);
                     const lastMsg = bookingMessages[bookingMessages.length - 1];
                     return {
                         id: booking.id,
                         bookingId: booking.id,
                         type: "direct" as const,
                         participants: [{
                             name: booking.photographer?.name || "Nhiếp ảnh gia",
                             avatar: booking.photographer?.avatar || "",
                             role: "Nhiếp ảnh gia",
                         }],
                         title: booking.photographer?.name || "Nhiếp ảnh gia",
                         lastMessage: lastMsg?.Noi_Dung || "Chưa có tin nhắn",
                         lastMessageTime: lastMsg?.Gui_Luc ? new Date(lastMsg.Gui_Luc).toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"}) : "",
                         unreadCount: 0, // Simplified for now
                         isOnline: false,
                     };
                 } catch (e) {
                     return {
                         id: booking.id,
                         bookingId: booking.id,
                         type: "direct" as const,
                         participants: [{ name: "Nhiếp ảnh gia", avatar: "", role: "Nhiếp ảnh gia" }],
                         title: "Nhiếp ảnh gia",
                         lastMessage: "Chưa có tin nhắn",
                         lastMessageTime: "",
                         unreadCount: 0,
                         isOnline: false,
                     };
                 }
           });

           const bookingRooms = await Promise.all(roomsPromises);
           setChatRooms([supportRoom, ...bookingRooms]);

        } catch (error: any) {
            console.error("❌ Lỗi khi tải chat rooms:", error);
            toast.error("Không thể tải danh sách hội thoại");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (Ma_BC: string) => {
        try {
            const chatMessages = await chatApi.getMessagesByBooking(Ma_BC);
            
            // Convert ChatMessage sang Message format
            const formattedMessages: Message[] = chatMessages.map((msg) => {
                // Xác định sender dựa trên Ma_KH và Ma_NAG
                const sender: "customer" | "photographer" = msg.Ma_KH ? "customer" : "photographer";
                
                return {
                    id: msg.Ma_TN,
                    Ma_TN: msg.Ma_TN,
                    Ma_BC: msg.Ma_BC,
                    sender,
                    content: msg.Noi_Dung,
                    timestamp: msg.Gui_Luc 
                        ? new Date(msg.Gui_Luc).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "",
                    type: "text" as const,
                    Trang_Thai: msg.Trang_Thai,
                };
            });

            setMessages(formattedMessages);
        } catch (error: any) {
            console.error("Lỗi khi tải tin nhắn:", error);
            toast.error("Không thể tải tin nhắn");
        }
    };

    const fetchSupportMessages = async () => {
        try {
            const supportMsgs = await chatApi.getSupportMessages();
            const formatted: Message[] = supportMsgs.map(msg => {
                let sender: "customer" | "photographer" | "coordinator" | "support" = "customer";
                
                if (msg.Ma_Admin) {
                    sender = "support";
                } else if (msg.Ma_KH) {
                    sender = "customer";
                }
    
                return {
                    id: msg.Ma_TN,
                    Ma_TN: msg.Ma_TN,
                    Ma_BC: msg.Ma_BC,
                    sender,
                    content: msg.Noi_Dung,
                    timestamp: msg.Gui_Luc ? new Date(msg.Gui_Luc).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'}) : "",
                    type: "text",
                    Trang_Thai: msg.Trang_Thai
                };
            });
            setMessages(formatted);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tin nhắn hỗ trợ");
        }
    };

    const subscribeToChat = (Ma_BC: string) => {
        // Unsubscribe channel cũ nếu có
        if (echoChannelRef.current) {
            try {
                const oldChannelName = echoChannelRef.current.name || `chat.booking.${selectedChat?.bookingId}`;
                Echo.leave(oldChannelName);
            } catch (e) {
                console.error("Error leaving channel:", e);
            }
        }

        // Subscribe channel mới
        try {
            const channel = Echo.private(`chat.booking.${Ma_BC}`);
            echoChannelRef.current = channel;

            channel.listen(".message.sent", (data: any) => {
                const msg = data.message;
                
                // Chỉ xử lý tin nhắn của booking hiện tại
                if (msg.Ma_BC !== Ma_BC) return;
                
                const sender: "customer" | "photographer" = msg.Ma_KH ? "customer" : "photographer";
                
                const newMessage: Message = {
                    id: msg.Ma_TN,
                    Ma_TN: msg.Ma_TN,
                    Ma_BC: msg.Ma_BC,
                    sender,
                    content: msg.Noi_Dung,
                    timestamp: msg.Gui_Luc 
                        ? new Date(msg.Gui_Luc).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    type: "text" as const,
                    Trang_Thai: msg.Trang_Thai,
                };

                setMessages((prev) => {
                    // Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate)
                    if (prev.some(m => m.Ma_TN === msg.Ma_TN)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });
                
                // Cập nhật last message và unread count trong chat rooms
                setChatRooms((prev) =>
                    prev.map((room) => {
                        if (room.bookingId === Ma_BC) {
                            return {
                                ...room,
                                lastMessage: msg.Noi_Dung,
                                lastMessageTime: msg.Gui_Luc
                                    ? new Date(msg.Gui_Luc).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : new Date().toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }),
                                unreadCount: sender === "photographer" ? room.unreadCount + 1 : room.unreadCount,
                            };
                        }
                        return room;
                    })
                );
            });
        } catch (error) {
            console.error("Error subscribing to chat:", error);
        }
    };

    const markAsRead = async (Ma_BC: string) => {
        try {
            await chatApi.markAsRead({ Ma_BC });
            // Cập nhật unread count
            setChatRooms((prev) =>
                prev.map((room) =>
                    room.bookingId === Ma_BC ? { ...room, unreadCount: 0 } : room
                )
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    };

    const filteredChatRooms = chatRooms.filter(
        (room) =>
            room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.participants.some((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            (room.bookingId &&
                room.bookingId
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
    );

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedChat || sending) return;

        try {
            setSending(true);
            
            // Gửi tin nhắn qua API
            const newMessage = await chatApi.sendMessage({
                Ma_BC: selectedChat.bookingId || null,
                Noi_Dung: messageInput.trim(),
            });

            // Thêm tin nhắn vào danh sách
            const formattedMessage: Message = {
                id: newMessage.Ma_TN,
                Ma_TN: newMessage.Ma_TN,
                Ma_BC: newMessage.Ma_BC,
                sender: "customer",
                content: newMessage.Noi_Dung,
                timestamp: newMessage.Gui_Luc
                    ? new Date(newMessage.Gui_Luc).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : new Date().toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                type: "text",
                Trang_Thai: newMessage.Trang_Thai,
            };

            setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            setMessageInput("");

            // Cập nhật last message trong chat rooms
            setChatRooms((prev) =>
                prev.map((room) =>
                    room.bookingId === selectedChat.bookingId
                        ? {
                            ...room,
                            lastMessage: messageInput.trim(),
                            lastMessageTime: new Date().toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                        }
                        : room
                )
            );
        } catch (error: any) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            toast.error(error.response?.data?.message || "Không thể gửi tin nhắn");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const openThreeWayChat = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setShowThreeWayChat(true);
    };

    // Show three-way chat
    if (showThreeWayChat) {
        return (
            <ThreeWayChat
                bookingId={selectedBookingId}
                currentUser="customer"
                onBack={() => setShowThreeWayChat(false)}
            />
        );
    }

    // Chat detail view
    if (selectedChat) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                {/* Chat Header */}
                <div className="bg-card dark:bg-card border-b border-border p-4 text-black dark:text-slate-200">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChat(null)}
                            className="p-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex-1">
                            {selectedChat.type === "support" ? (
                                <div className="flex items-center gap-2">
                                    <ImageWithFallback
                                        src={
                                            selectedChat.participants[0].avatar
                                        }
                                        alt={selectedChat.participants[0].name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-medium flex items-center gap-1">
                                            {selectedChat.title}
                                            <Shield className="w-4 h-4 text-blue-600" />
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Luôn sẵn sàng hỗ trợ bạn
                                        </p>
                                    </div>
                                </div>
                            ) : selectedChat.type === "three_way" ? (
                                <div>
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {selectedChat.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedChat.participants
                                            .map((p) => p.name)
                                            .join(", ")}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <ImageWithFallback
                                            src={
                                                selectedChat.participants[0]
                                                    .avatar
                                            }
                                            alt={
                                                selectedChat.participants[0]
                                                    .name
                                            }
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {selectedChat.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-card rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            {selectedChat.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedChat.bookingId &&
                                                `${selectedChat.bookingId} • `}
                                            {selectedChat.isOnline
                                                ? "Đang online"
                                                : "Offline"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedChat.type !== "support" && (
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2"
                                >
                                    <Info className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {loading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "customer"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                    message.sender === "customer"
                                        ? "bg-primary text-primary-foreground"
                                        : message.sender === "support"
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                                        : "bg-card text-card-foreground border border-border"
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p
                                    className={`text-xs mt-1 ${
                                        message.sender === "customer"
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {message.timestamp}
                                </p>
                            </div>
                        </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-card dark:bg-card border-t border-border p-4 text-black dark:text-slate-200">
                    <div className="flex items-end gap-2">
                        <Button variant="ghost" size="sm" className="p-2">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                            <ImageIcon className="w-4 h-4" />
                        </Button>
                        <div className="flex-1">
                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={messageInput}
                                onChange={(e) =>
                                    setMessageInput(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                        <Button
                            onClick={sendMessage}
                            disabled={!messageInput.trim() || sending}
                            className="bg-primary hover:bg-primary/90 p-3"
                        >
                            {sending ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Chat list view
    return (
        <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Chat Rooms List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    filteredChatRooms.map((room) => (
                    <Card
                        key={room.id}
                        className="cursor-pointer hover:shadow-lg hover:bg-accent/50 transition-allcursor-pointer hover:shadow-lg hover-lift transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group"
                        onClick={() => {
                            if (room.type === "three_way") {
                                openThreeWayChat(room.bookingId!);
                            } else {
                                setSelectedChat(room);
                            }
                        }}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                {room.type === "support" ? (
                                    <div className="relative">
                                        <ImageWithFallback
                                            src={room.participants[0].avatar}
                                            alt={room.participants[0].name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                ) : room.type === "three_way" ? (
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        {room.hasBookingChanges && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"></div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <ImageWithFallback
                                            src={room.participants[0].avatar}
                                            alt={room.participants[0].name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        {room.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-card rounded-full"></div>
                                        )}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium truncate flex items-center gap-2">
                                            {room.title}
                                            {room.type === "three_way" && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Nhóm
                                                </Badge>
                                            )}
                                            {room.hasBookingChanges && (
                                                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs">
                                                    Thay đổi
                                                </Badge>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {room.lastMessageTime}
                                            </span>
                                            {room.unreadCount > 0 && (
                                                <div className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                                    {room.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p
                                        className={`text-sm truncate ${
                                            room.unreadCount > 0
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {room.lastMessage}
                                    </p>

                                    {room.bookingId && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Mã booking: {room.bookingId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    ))
                )}

                {!loading && filteredChatRooms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p>Không tìm thấy cuộc trò chuyện nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}
