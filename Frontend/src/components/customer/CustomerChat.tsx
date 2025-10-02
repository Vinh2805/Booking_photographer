import { useState } from "react";
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
} from "lucide-react";

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
  sender:
    | "customer"
    | "photographer"
    | "coordinator"
    | "support";
  content: string;
  timestamp: string;
  type: "text" | "image" | "booking";
  bookingInfo?: any;
}

interface CustomerChatProps
{
  onBack?: () => void;
}

export function CustomerChat({ onBack } : CustomerChatProps) {
  const [selectedChat, setSelectedChat] =
    useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showThreeWayChat, setShowThreeWayChat] =
    useState(false);
  const [selectedBookingId, setSelectedBookingId] =
    useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "photographer",
      content: "Chào em! Anh đã nhận được thông tin buổi chụp",
      timestamp: "10:00",
      type: "text",
    },
    {
      id: "2",
      sender: "customer",
      content: "Chào anh! Em có vài câu hỏi về buổi chụp",
      timestamp: "10:02",
      type: "text",
    },
    {
      id: "3",
      sender: "customer",
      content: "Anh có thể chụp thêm ảnh gia đình không ạ?",
      timestamp: "10:30",
      type: "text",
    },
    {
      id: "4",
      sender: "photographer",
      content:
        "Được em! Anh sẽ chụp thêm 20-30 ảnh gia đình nữa nhé",
      timestamp: "10:32",
      type: "text",
    },
  ]);

  // Mock chat rooms data with support and 3-way chats
  const chatRooms: ChatRoom[] = [
    // Support chat
    {
      id: "support",
      type: "support",
      participants: [
        {
          name: "Hỗ trợ Momentia",
          avatar:
            "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face",
          role: "Hỗ trợ khách hàng",
        },
      ],
      title: "Hỗ trợ khách hàng",
      lastMessage:
        "Cảm ơn bạn đã liên hệ! Tôi có thể giúp gì cho bạn?",
      lastMessageTime: "11:30",
      unreadCount: 0,
      isOnline: true,
    },
    // Three-way chat for booking changes
    {
      id: "3way_1",
      bookingId: "BK001",
      type: "three_way",
      participants: [
        {
          name: "Minh Tuấn",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
          role: "Nhiếp ảnh gia",
        },
        {
          name: "Thu Hương",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face",
          role: "Điều phối viên",
        },
      ],
      title: "Thảo luận thay đổi BK001",
      lastMessage:
        "Điều phối viên: Đã xác nhận thay đổi địa điểm",
      lastMessageTime: "10:40",
      unreadCount: 1,
      hasBookingChanges: true,
    },
    // Direct chat
    {
      id: "1",
      bookingId: "BK002",
      type: "direct",
      participants: [
        {
          name: "Đức Anh",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
          role: "Nhiếp ảnh gia",
        },
      ],
      title: "Đức Anh",
      lastMessage: "Em chuẩn bị trang phục màu sáng nhé!",
      lastMessageTime: "09:15",
      unreadCount: 0,
      isOnline: false,
    },
    // Another direct chat
    {
      id: "2",
      bookingId: "BK003",
      type: "direct",
      participants: [
        {
          name: "Lan Hương",
          avatar:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face",
          role: "Nhiếp ảnh gia",
        },
      ],
      title: "Lan Hương",
      lastMessage: "Cảm ơn em đã chọn chị ạ",
      lastMessageTime: "Hôm qua",
      unreadCount: 0,
      isOnline: true,
    },
  ];

  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      room.participants.some((p) =>
        p.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ) ||
      (room.bookingId &&
        room.bookingId
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "customer",
        content: messageInput.trim(),
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text",
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage,
      ]);
      setMessageInput("");
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
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
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
                    src={selectedChat.participants[0].avatar}
                    alt={selectedChat.participants[0].name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium flex items-center gap-1">
                      {selectedChat.title}
                      <Shield className="w-4 h-4 text-blue-600" />
                    </h3>
                    <p className="text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600">
                    {selectedChat.participants
                      .map((p) => p.name)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ImageWithFallback
                      src={selectedChat.participants[0].avatar}
                      alt={selectedChat.participants[0].name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {selectedChat.title}
                    </h3>
                    <p className="text-sm text-gray-600">
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === "customer"
                    ? "bg-pink-500 text-white"
                    : message.sender === "support"
                      ? "bg-blue-100 text-blue-900 border border-blue-200"
                      : "bg-white text-gray-900 border"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "customer"
                      ? "text-pink-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
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
              disabled={!messageInput.trim()}
              className="bg-pink-500 hover:bg-pink-600 p-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Chat list view
  return (
    <div className="p-4 space-y-4 h-screen overflow-hidden flex flex-col">
      <h1 className="text-xl font-bold">Tin nhắn</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Chat Rooms List */}
      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
        {filteredChatRooms.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              room.hasBookingChanges
                ? "border-orange-200 bg-orange-50"
                : ""
            }`}
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
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
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
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Thay đổi
                        </Badge>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {room.lastMessageTime}
                      </span>
                      {room.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-sm truncate ${
                      room.unreadCount > 0
                        ? "font-medium text-gray-900"
                        : "text-gray-600"
                    }`}
                  >
                    {room.lastMessage}
                  </p>

                  {room.bookingId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mã booking: {room.bookingId}
                    </p>
                  )}
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