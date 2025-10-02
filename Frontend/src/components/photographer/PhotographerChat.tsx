import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ThreeWayChat } from '../ui/three-way-chat';
import { 
  Search, 
  MoreVertical, 
  Send, 
  ArrowLeft, 
  Image as ImageIcon,
  Paperclip,
  Info,
  Users,
  Shield,
  MessageCircle
} from 'lucide-react';

interface ChatRoom {
  id: string;
  bookingId?: string;
  type: 'direct' | 'three_way' | 'support';
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
  sender: 'customer' | 'photographer' | 'coordinator' | 'support';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'booking';
  bookingInfo?: any;
}

interface PhotographerOnBack {
  onBack?: () => void;
}

export function PhotographerChat({onBack}: PhotographerOnBack) {
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showThreeWayChat, setShowThreeWayChat] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'customer',
      content: 'Chào anh! Em có vài câu hỏi về buổi chụp ngày mai',
      timestamp: '10:00',
      type: 'text'
    },
    {
      id: '2',
      sender: 'photographer',
      content: 'Chào em! Cứ hỏi thoải mái, anh sẽ trả lời ngay',
      timestamp: '10:02',
      type: 'text'
    },
    {
      id: '3',
      sender: 'customer',
      content: 'Em nên mặc trang phục gì cho phù hợp ạ?',
      timestamp: '10:03',
      type: 'text'
    },
    {
      id: '4',
      sender: 'photographer',
      content: 'Em nên mặc trang phục màu sáng, tránh màu quá sặc sỡ. Anh sẽ gửi em vài gợi ý nữa',
      timestamp: '10:05',
      type: 'text'
    }
  ]);

  // Mock chat rooms data with support and 3-way chats
  const chatRooms: ChatRoom[] = [
    // Support chat - always at top
    {
      id: 'support',
      type: 'support',
      participants: [
        {
          name: 'Hỗ trợ Momentia',
          avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face',
          role: 'Hỗ trợ nhiếp ảnh gia'
        }
      ],
      title: 'Hỗ trợ nhiếp ảnh gia',
      lastMessage: 'Chào anh! Tôi có thể giúp gì cho anh không?',
      lastMessageTime: '11:30',
      unreadCount: 0,
      isOnline: true
    },
    // Three-way chat for booking changes
    {
      id: '3way_1',
      bookingId: 'BK001',
      type: 'three_way',
      participants: [
        {
          name: 'Nguyễn Văn A',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
          role: 'Khách hàng'
        },
        {
          name: 'Thu Hương',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85bb44f?w=50&h=50&fit=crop&crop=face',
          role: 'Điều phối viên'
        }
      ],
      title: 'Thảo luận thay đổi BK001',
      lastMessage: 'Điều phối viên: Đã xác nhận thay đổi địa điểm',
      lastMessageTime: '10:40',
      unreadCount: 1,
      hasBookingChanges: true
    },
    // Direct chats with customers
    {
      id: '1',
      bookingId: 'BK002',
      type: 'direct',
      participants: [
        {
          name: 'Trần Thị B',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85bb44f?w=50&h=50&fit=crop&crop=face',
          role: 'Khách hàng'
        }
      ],
      title: 'Trần Thị B',
      lastMessage: 'Em đã chuẩn bị trang phục theo yêu cầu ạ',
      lastMessageTime: '09:15',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      bookingId: 'BK003',
      type: 'direct',
      participants: [
        {
          name: 'Hoàng Thị C',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face',
          role: 'Khách hàng'
        }
      ],
      title: 'Hoàng Thị C',
      lastMessage: 'Cảm ơn anh đã chụp rất đẹp!',
      lastMessageTime: 'Hôm qua',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      bookingId: 'BK005',
      type: 'direct',
      participants: [
        {
          name: 'Lê Văn D',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          role: 'Khách hàng'
        }
      ],
      title: 'Lê Văn D',
      lastMessage: 'Buổi chụp mai anh có thể đến sớm 30 phút không?',
      lastMessageTime: '2 ngày trước',
      unreadCount: 0,
      isOnline: true
    }
  ];

  const filteredChatRooms = chatRooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (room.bookingId && room.bookingId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'photographer',
        content: messageInput.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
        currentUser="photographer"
        onBack={() => setShowThreeWayChat(false)}
      />
    );
  }

  // Chat detail view
  if (selectedChat) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
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
              {selectedChat.type === 'support' ? (
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
                    <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
              ) : selectedChat.type === 'three_way' ? (
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedChat.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedChat.participants.map(p => p.name).join(', ')}
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
                    <h3 className="font-medium">{selectedChat.title}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.bookingId && `${selectedChat.bookingId} • `}
                      {selectedChat.isOnline ? 'Đang online' : 'Offline'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedChat.type !== 'support' && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'photographer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === 'photographer'
                    ? 'bg-pink-500 text-white'
                    : message.sender === 'support'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-white text-gray-900 border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'photographer' ? 'text-pink-100' : 'text-gray-500'
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
                onChange={(e) => setMessageInput(e.target.value)}
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

  return (
    <div className="p-4 space-y-4">
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
      <div className="space-y-2">
        {filteredChatRooms.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              room.hasBookingChanges ? 'border-orange-200 bg-orange-50' : 
              room.type === 'support' ? 'border-blue-200 bg-blue-50' : ''
            }`}
            onClick={() => {
              if (room.type === 'three_way') {
                openThreeWayChat(room.bookingId!);
              } else {
                setSelectedChat(room);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {room.type === 'support' ? (
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
                ) : room.type === 'three_way' ? (
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
                      {room.type === 'three_way' && (
                        <Badge variant="outline" className="text-xs">
                          Nhóm
                        </Badge>
                      )}
                      {room.type === 'support' && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Hỗ trợ
                        </Badge>
                      )}
                      {room.hasBookingChanges && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Thay đổi
                        </Badge>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{room.lastMessageTime}</span>
                      {room.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p
                    className={`text-sm truncate ${
                      room.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
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