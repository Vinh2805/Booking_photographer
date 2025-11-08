import type { AdminBooking } from '../types/adminBookingTypes';

export const ADMIN_BOOKINGS_DATA: AdminBooking[] = [
  {
    id: 'BK001',
    status: 'pending',
    title: 'Chụp ảnh cưới pre-wedding',
    customer: {
      name: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face',
      id: 'CU001'
    },
    photographer: {
      name: 'Minh Tuấn',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      id: 'PH001'
    },
    type: 'Cưới',
    location: 'Hồ Gươm, Hà Nội',
    date: '2025-01-15',
    time: '08:00',
    price: 3000000,
    createdAt: '2025-01-12',
    notes: 'Khách hàng yêu cầu chụp vào golden hour'
  },
  {
    id: 'BK002',
    status: 'disputed',
    title: 'Chụp ảnh gia đình',
    customer: {
      name: 'Trần Thị B',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b85bb44?w=50&h=50&fit=crop&crop=face',
      id: 'CU002'
    },
    photographer: {
      name: 'Thu Hương',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face',
      id: 'PH002'
    },
    type: 'Gia đình',
    location: 'Công viên Thống Nhất',
    date: '2025-01-10',
    time: '16:00',
    price: 1500000,
    createdAt: '2025-01-08',
    issues: ['Khách hàng không hài lòng với chất lượng ảnh', 'Nhiếp ảnh gia đến muộn 30 phút'],
    notes: 'Cần can thiệp xử lý tranh chấp'
  },
  {
    id: 'BK003',
    status: 'completed',
    title: 'Chụp ảnh chân dung',
    customer: {
      name: 'Lê Văn C',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      id: 'CU003'
    },
    photographer: {
      name: 'Đức Anh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
      id: 'PH003'
    },
    type: 'Chân dung',
    location: 'Studio ABC',
    date: '2025-01-05',
    time: '14:00',
    price: 2000000,
    createdAt: '2025-01-02'
  },
  {
    id: 'BK004',
    status: 'ongoing',
    title: 'Chụp ảnh sự kiện',
    customer: {
      name: 'Phạm Thị D',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      id: 'CU004'
    },
    photographer: {
      name: 'Mai Lan',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=50&h=50&fit=crop&crop=face',
      id: 'PH004'
    },
    type: 'Sự kiện',
    location: 'Nhà hàng Golden Palace',
    date: '2025-01-12',
    time: '19:00',
    price: 2500000,
    createdAt: '2025-01-09'
  },
  {
    id: 'BK005',
    status: 'processing',
    title: 'Chụp ảnh maternity',
    customer: {
      name: 'Hoàng Thị E',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face',
      id: 'CU005'
    },
    photographer: {
      name: 'Hoàng Long',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&crop=face',
      id: 'PH005'
    },
    type: 'Maternity',
    location: 'Bờ hồ Tây',
    date: '2025-01-08',
    time: '16:30',
    price: 1800000,
    createdAt: '2025-01-05'
  }
];