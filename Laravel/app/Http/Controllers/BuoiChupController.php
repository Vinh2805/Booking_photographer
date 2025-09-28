<?php

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BuoiChupController extends Controller
{
    /**
     * Lọc và sắp xếp buổi chụp theo FE requirements
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = BuoiChup::with(['khachHang', 'nhaNhiepAnh'])
                ->where('Ma_NAG', auth()->id()) // Chỉ lấy booking của photographer hiện tại
                ->when($request->filled('search'), function ($q) use ($request) {
                    $search = $request->search;
                    $q->where(function ($subQuery) use ($search) {
                        $subQuery->where('Ma_BC', 'like', "%{$search}%")
                                ->orWhere('Dia_Diem', 'like', "%{$search}%")
                                ->orWhere('Loai_Chup', 'like', "%{$search}%")
                                ->orWhereHas('khachHang', function ($customerQuery) use ($search) {
                                    $customerQuery->where('HoTen', 'like', "%{$search}%");
                                });
                    });
                })
                ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                    $q->where('Trang_Thai', $this->mapStatusToDatabase($request->status));
                });

            // Sắp xếp
            $sortBy = $request->get('sort_by', 'Ngay_Tao');
            $sortOrder = $request->get('sort_order', 'desc');
            
            $query->orderBy($sortBy, $sortOrder);

            $bookings = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $this->transformBookings($bookings->items()),
                'meta' => [
                    'total' => $bookings->total(),
                    'per_page' => $bookings->perPage(),
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chi tiết buổi chụp
     */
    public function show(string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::with([
                'khachHang',
                'nhaNhiepAnh',
                'dichVu' => function ($query) {
                    $query->select('Ma_DV', 'Ten_DV', 'Gia');
                },
                'anh' => function ($query) {
                    $query->select('Ma_Anh', 'Ma_BC', 'Loai_Anh', 'Duong_Dan');
                }
            ])->where('Ma_BC', $id)
              ->where('Ma_NAG', auth()->id())
              ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy buổi chụp'
            ], 404);
        }
    }

    /**
     * Map FE status to database status
     */
    private function mapStatusToDatabase(string $feStatus): string
    {
        $statusMap = [
            'pending_confirmation' => 'Chờ xác nhận',
            'pending_deposit' => 'Chờ đặt cọc',
            'upcoming' => 'Sắp diễn ra',
            'ongoing' => 'Đang diễn ra',
            'pending_payment' => 'Chờ thanh toán',
            'pending_processing' => 'Chờ xử lý ảnh',
            'processed' => 'Đã xử lý ảnh',
            'completed' => 'Đã hoàn thành',
            'cancelled' => 'Đã hủy'
        ];

        return $statusMap[$feStatus] ?? $feStatus;
    }

    /**
     * Map database status to FE status
     */
    private function mapStatusToFe(string $dbStatus): string
    {
        $statusMap = [
            'Chờ xác nhận' => 'pending_confirmation',
            'Chờ đặt cọc' => 'pending_deposit',
            'Sắp diễn ra' => 'upcoming',
            'Đang diễn ra' => 'ongoing',
            'Chờ thanh toán' => 'pending_payment',
            'Chờ xử lý ảnh' => 'pending_processing',
            'Đã xử lý ảnh' => 'processed',
            'Đã hoàn thành' => 'completed',
            'Đã hủy' => 'cancelled',
            'Thay đổi' => 'pending_confirmation' // Map về chờ xác nhận
        ];

        return $statusMap[$dbStatus] ?? $dbStatus;
    }

    /**
     * Transform bookings for FE
     */
    private function transformBookings(array $bookings): array
    {
        return array_map(function ($booking) {
            return [
                'id' => $booking->Ma_BC,
                'status' => $this->mapStatusToFe($booking->Trang_Thai),
                'title' => $booking->Loai_Chup . ' - ' . $booking->Dia_Diem,
                'customer' => [
                    'name' => $booking->khachHang->HoTen ?? 'Khách hàng',
                    'avatar' => $booking->khachHang->Anh_Dai_Dien ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                ],
                'type' => $booking->Loai_Chup,
                'location' => $booking->Dia_Diem,
                'date' => $booking->Bat_Dau_Chup->format('Y-m-d'),
                'time' => $booking->Bat_Dau_Chup->format('H:i'),
                'price' => (float) $booking->Tong_Tien,
                'description' => $booking->Ghi_Chu ?? 'Không có mô tả',
                'services' => $booking->dichVu->pluck('Ten_DV')->toArray() ?? [],
                'duration' => $this->calculateDuration($booking->Bat_Dau_Chup, $booking->Ket_Thuc_Chup),
                'guestCount' => '2 người', // Cần thêm trường So_Luong_Nguoi trong DB
                'specialRequests' => $booking->Ghi_Chu,
                'uploadedRaw' => $booking->anh->where('Loai_Anh', 'raw')->isNotEmpty(),
                'uploadedEdited' => $booking->anh->where('Loai_Anh', 'edited')->isNotEmpty(),
            ];
        }, $bookings);
    }

    /**
     * Transform booking detail for FE
     */
    private function transformBookingDetail($booking): array
    {
        return [
            'id' => $booking->Ma_BC,
            'status' => $this->mapStatusToFe($booking->Trang_Thai),
            'title' => $booking->Loai_Chup,
            'customer' => [
                'name' => $booking->khachHang->HoTen ?? 'Khách hàng',
                'avatar' => $booking->khachHang->Anh_Dai_Dien ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'email' => $booking->khachHang->Email ?? '',
                'phone' => $booking->khachHang->So_Dien_Thoai ?? '',
            ],
            'type' => $booking->Loai_Chup,
            'location' => $booking->Dia_Diem,
            'date' => $booking->Bat_Dau_Chup->format('Y-m-d'),
            'time' => $booking->Bat_Dau_Chup->format('H:i'),
            'price' => (float) $booking->Tong_Tien,
            'description' => $booking->Ghi_Chu ?? 'Không có mô tả',
            'services' => $booking->dichVu->map(function ($service) {
                return [
                    'name' => $service->Ten_DV,
                    'price' => (float) $service->Gia
                ];
            })->toArray(),
            'duration' => $this->calculateDuration($booking->Bat_Dau_Chup, $booking->Ket_Thuc_Chup),
            'guestCount' => '2 người',
            'specialRequests' => $booking->Ghi_Chu,
            'uploadedRaw' => $booking->anh->where('Loai_Anh', 'raw')->isNotEmpty(),
            'uploadedEdited' => $booking->anh->where('Loai_Anh', 'edited')->isNotEmpty(),
            'images' => $booking->anh->map(function ($image) {
                return [
                    'type' => $image->Loai_Anh,
                    'url' => $image->Duong_Dan
                ];
            })->toArray(),
            'createdAt' => $booking->Ngay_Tao->format('Y-m-d H:i:s'),
            'depositRate' => (float) $booking->Ti_Le_Coc,
            'cancelReason' => $booking->Ly_Do_Huy,
            'changeReason' => $booking->Ly_Do_Thay_Doi,
        ];
    }

    /**
     * Calculate duration in hours
     */
    private function calculateDuration($start, $end): string
    {
        $hours = $start->diffInHours($end);
        $minutes = $start->diffInMinutes($end) % 60;
        
        if ($minutes > 0) {
            return "{$hours} giờ {$minutes} phút";
        }
        return "{$hours} giờ";
    }
}