import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
    Search,
    Send,
    ArrowLeft,
    Loader,
    MessageCircle,
    User,
    Paperclip,
    Image as ImageIcon,
    Info,
    Shield
} from "lucide-react";
import chatApi from "../services/chatApi";
import Echo from "../../echo";
import { toast } from "sonner";

interface ChatUser {
    id: string; // Ma_KH or Ma_NAG
    name: string;
    avatar: string;
    type: "customer" | "photographer";
    lastMessage?: string;
    lastMessageTime?: string;
}

interface Message {
    id: string;
    sender: "admin" | "customer" | "photographer";
    content: string;
    timestamp: string;
    type: "text" | "image";
    Trang_Thai?: string;
    Pham_Vi?: "general" | "admin_customer" | "admin_photographer";
}

interface AdminChatProps {
    onBack?: () => void;
}

export function AdminChat({ onBack }: AdminChatProps) {
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [activeTab, setActiveTab] = useState<"customer" | "photographer">("customer");
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    const [customers, setCustomers] = useState<ChatUser[]>([]);
    const [photographers, setPhotographers] = useState<ChatUser[]>([]);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const echoChannelRef = useRef<any>(null);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Load messages when user selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
        }
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await chatApi.getConversations();

            const mapUser = (u: any, type: "customer" | "photographer"): ChatUser => ({
                id: u.id,
                name: u.name,
                avatar: u.avatar || "", // Handle null avatar
                type,
                lastMessage: "Bấm để xem tin nhắn", // Placeholder since API doesn't return last msg yet
                lastMessageTime: ""
            });

            setCustomers((data?.customers || []).map((c: any) => mapUser(c, "customer")));
            setPhotographers((data?.photographers || []).map((p: any) => mapUser(p, "photographer")));

        } catch (error) {
            console.error("Failed to fetch conversations", error);
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const res = await chatApi.getMessagesByUser(userId);
            const formatted: Message[] = res.map(m => {
                let sender: "admin" | "customer" | "photographer" = "customer";
                if (m.Ma_Admin) sender = "admin";
                else if (m.Ma_NAG) sender = "photographer";

                return {
                    id: m.Ma_TN,
                    sender,
                    content: m.Noi_Dung,
                    timestamp: m.Gui_Luc ? new Date(m.Gui_Luc).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "",
                    type: "text",
                    Pham_Vi: m.Pham_Vi
                };
            });
            setMessages(formatted);
        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải tin nhắn");
        }
    };

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedUser || sending) return;
        try {
            setSending(true);
            const token = localStorage.getItem("admin_token");

            const res = await chatApi.sendMessage({
                Noi_Dung: messageInput.trim(),
                ReceiverId: selectedUser.id,
            }, token || undefined);

            const newMsg: Message = {
                id: res.Ma_TN,
                sender: "admin",
                content: res.Noi_Dung,
                timestamp: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
                type: "text",
                Pham_Vi: res.Pham_Vi
            };
            setMessages(prev => [...prev, newMsg]);
            setMessageInput("");
        } catch (e) {
            console.error(e);
            toast.error("Gửi tin thất bại");
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

    const filteredUsers = (activeTab === "customer" ? customers : photographers).filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render Chat Detail View
    if (selectedUser) {
        return (
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="bg-card border-b border-border p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 -ml-2 hover:bg-muted"
                            onClick={() => setSelectedUser(null)}
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ImageWithFallback
                                    src={selectedUser.avatar}
                                    alt={selectedUser.name}
                                    className="w-10 h-10 rounded-full object-cover border border-border"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                                    {selectedUser.name}
                                    <Badge variant={selectedUser.type === 'customer' ? 'secondary' : 'outline'} className="ml-1 text-[10px] font-normal px-1.5 h-5">
                                        {selectedUser.type === 'customer' ? 'Khách hàng' : 'NAG'}
                                    </Badge>
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    ID: {selectedUser.id}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Info className="w-5 h-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/30">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
                            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện với {selectedUser.name}</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] lg:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'admin'
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                    : 'bg-white dark:bg-card text-foreground border border-border rounded-tl-sm'
                                    }`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border">
                    <div className="flex items-end gap-2 max-w-5xl mx-auto w-full">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <ImageIcon className="w-5 h-5" />
                        </Button>

                        <div className="flex-1 relative">
                            <Input
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="pr-10 py-5 bg-background border-input focus-visible:ring-1"
                            />
                        </div>

                        <Button
                            onClick={sendMessage}
                            disabled={sending || !messageInput.trim()}
                            className="w-10 h-10 rounded-full p-0 shadow-sm"
                        >
                            {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Chat List View
    return (
        <div className="h-full bg-background flex flex-col">
            <div className="p-4 border-b border-border space-y-4 bg-card">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-card-foreground">Hội thoại</h2>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-700">

                        {/* CUSTOMER */}
                        <TabsTrigger
                            value="customer"
                            className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:!bg-blue-600"
                        >
                            Khách hàng
                        </TabsTrigger>

                        {/* PHOTOGRAPHER */}
                        <TabsTrigger
                            value="photographer"
                            className="data-[state=active]:!bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:!bg-blue-600"
                        >
                            NAG
                        </TabsTrigger>

                    </TabsList>
                </Tabs>


                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="pl-10 text-foreground bg-background"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-background">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader className="animate-spin text-muted-foreground w-6 h-6" /></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <User className="w-12 h-12 mb-3 opacity-20" />
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <Card
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className="cursor-pointer transition-all duration-200 border border-transparent hover:border-border hover:shadow-md hover:-translate-y-0.5"
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="relative">
                                    <ImageWithFallback
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full object-cover border border-border"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-card-foreground truncate">{user.name}</h3>
                                        <span className="text-xs text-muted-foreground"></span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                        <span>Bấm để trò chuyện</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground">
                                            {user.id}
                                        </Badge>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

export default AdminChat;
