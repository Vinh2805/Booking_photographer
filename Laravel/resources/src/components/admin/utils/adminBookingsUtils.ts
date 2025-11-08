import type { BookingStatus, AdminBooking, StatusInfo } from '../types/adminBookingTypes';

export const getStatusInfo = (status: BookingStatus): StatusInfo => {
  const statusMap: Record<BookingStatus, StatusInfo> = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    deposit: { label: 'Chờ đặt cọc', color: 'bg-orange-100 text-orange-800' },
    upcoming: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' },
    ongoing: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
    payment: { label: 'Chờ thanh toán', color: 'bg-red-100 text-red-800' },
    processing: { label: 'Chờ xử lý ảnh', color: 'bg-purple-100 text-purple-800' },
    processed: { label: 'Đã xử lý ảnh', color: 'bg-indigo-100 text-indigo-800' },
    completed: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' },
    disputed: { label: 'Tranh chấp', color: 'bg-red-200 text-red-900' }
  };
  return statusMap[status];
};

export const filterBookings = (
  bookings: AdminBooking[],
  selectedStatus: BookingStatus | 'all',
  searchQuery: string
): AdminBooking[] => {
  return bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.photographer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
};

export const getStatusOptions = (): Array<{ value: BookingStatus | 'all', label: string }> => [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'disputed', label: 'Tranh chấp' },
  { value: 'ongoing', label: 'Đang diễn ra' },
  { value: 'processing', label: 'Xử lý ảnh' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];