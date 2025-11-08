import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
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
} from "lucide-react";
import chatApi, { ChatMessage } from "../services/chatApi";


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
  sender: "support" | "customer" | "photographer" | "coordinator";
  content: string;
  timestamp: string;
  type: "text" | "image" | "booking";
}

interface CustomerChatProps {
  onBack?: () => void;
}

export function CustomerChat({ onBack }: CustomerChatProps) {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // 🟩 Lấy danh sách tin nhắn khi mở 1 chat cụ thể
  useEffect(() => {
    if (!selectedChat?.bookingId) return;

    (async () => {
      try {
        const data = await chatApi.getMessagesByBooking(selectedChat.bookingId!);
        setMessages(
          data.map((m): Message => ({
            id: m.Ma_TN,
            sender: m.Ma_KH ? "customer" : "photographer",
            content: m.Noi_Dung,
            timestamp: m.Gui_Luc ?? "",
            type: (m.Loai_Tin as any) || "text",
          }))
        );
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
      }
    })();
  }, [selectedChat]);

  // 🟦 Lắng nghe realtime với Laravel Echo
  useEffect(() => {
    if (!selectedChat?.bookingId) return;

    const channel = window.Echo.private(`chat.${selectedChat.bookingId}`);
    channel.listen(".message.sent", (event: any) => {
      const msg = event.message;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.Ma_TN,
          sender: msg.Ma_KH ? "customer" : "photographer",
          content: msg.Noi_Dung,
          timestamp: msg.Thoi_Gian,
          type: msg.Loai_Tin || "text",
        },
      ]);
    });

    return () => {
      window.Echo.leave(`chat.${selectedChat.bookingId}`);
    };
  }, [selectedChat]);

  // 🟨 Gửi tin nhắn mới
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat?.bookingId) return;
    const text = messageInput.trim();
    setMessageInput("");

    try {
      const newMsg = await chatApi.sendMessage({
        Ma_BC: selectedChat.bookingId!,
        Noi_Dung: text,
        Ma_KH: "KH001", // ⚠️ Tạm hardcode, sau thay bằng user thật
        Loai_Tin: "text",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.Ma_TN,
          sender: "customer",
          content: newMsg.Noi_Dung,
          timestamp:
            newMsg.Gui_Luc ??
            new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          type: "text",
        },
      ]);
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ⚪ Chat detail view
  if (selectedChat) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex-1">
            <h3 className="font-medium">{selectedChat.title}</h3>
            <p className="text-sm text-gray-500">
              {selectedChat.bookingId ? `Mã booking: ${selectedChat.bookingId}` : ""}
            </p>
          </div>

          <Button variant="ghost" size="sm" className="p-2">
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === "customer"
                    ? "bg-pink-500 text-white"
                    : msg.sender === "support"
                    ? "bg-blue-100 text-blue-900 border border-blue-200"
                    : "bg-white text-gray-900 border"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === "customer" ? "text-pink-100" : "text-gray-500"
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4 flex gap-2 items-end">
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
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={sendMessage} disabled={!messageInput.trim()} className="bg-pink-500">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ⚪ Chat list view (tạm mock)
  const chatRooms: ChatRoom[] = [
    {
      id: "1",
      bookingId: "BC0001",
      type: "direct",
      participants: [{ name: "Nhiếp ảnh gia Đức Anh", avatar: "", role: "photographer" }],
      title: "Đức Anh",
      lastMessage: "Em chuẩn bị trang phục nhé!",
      lastMessageTime: "09:15",
      unreadCount: 0,
      isOnline: true,
    },
  ];

  const filteredChatRooms = chatRooms.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 h-screen overflow-hidden flex flex-col">
      <h1 className="text-xl font-bold">Tin nhắn</h1>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
        {filteredChatRooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedChat(room)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={room.participants[0].avatar || "https://via.placeholder.com/50"}
                  alt={room.participants[0].name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{room.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{room.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">Mã booking: {room.bookingId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredChatRooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không tìm thấy cuộc trò chuyện nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
