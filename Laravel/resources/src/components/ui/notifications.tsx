import { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Bell, 
  Calendar, 
  MessageCircle, 
  Star, 
  DollarSign,
  AlertCircle} from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationsProps {
  userType: 'customer' | 'photographer';
}

export function Notifications({ userType }: NotificationsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Buổi chụp được xác nhận',
      message: 'Nhiếp ảnh gia Minh Tuấn đã xác nhận buổi chụp BK001',
      time: '10 phút trước',
      isRead: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: '2',
      type: 'message',
      title: 'Tin nhắn mới',
      message: 'Bạn có tin nhắn mới từ khách hàng Nguyễn Văn A',
      time: '1 giờ trước',
      isRead: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Thanh toán thành công',
      message: 'Đã nhận thanh toán 3,000,000 VNĐ cho buổi chụp BK001',
      time: '2 giờ trước',
      isRead: true
    },
    {
      id: '4',
      type: 'review',
      title: 'Đánh giá mới',
      message: 'Bạn nhận được đánh giá 5 sao từ khách hàng',
      time: '1 ngày trước',
      isRead: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: '5',
      type: 'system',
      title: 'Cập nhật hệ thống',
      message: 'Ứng dụng đã được cập nhật lên phiên bản mới với nhiều tính năng',
      time: '2 ngày trước',
      isRead: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return Calendar;
      case 'message': return MessageCircle;
      case 'payment': return DollarSign;
      case 'review': return Star;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600';
      case 'message': return 'text-green-600';
      case 'payment': return 'text-purple-600';
      case 'review': return 'text-yellow-600';
      case 'system': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-blue-600 text-sm"
                >
                  Đánh dấu đã đọc
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    !notification.isRead 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.avatar ? (
                      <ImageWithFallback
                        src={notification.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {notification.actionText && (
                          <Button variant="ghost" size="sm" className="text-blue-600 text-xs h-auto p-0">
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có thông báo nào</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}