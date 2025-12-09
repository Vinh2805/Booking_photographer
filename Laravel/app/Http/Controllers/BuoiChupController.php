<?php 

namespace App\Http\Controllers;

use App\Models\BuoiChup;
use App\Models\NhiepAnhGia;
use App\Models\ThanhToan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Traits\AutoUpdateBookingStatus;

class BuoiChupController extends Controller
{
    use AutoUpdateBookingStatus;

    /**
     * Helper method để lấy Ma_NAG từ user đã đăng nhập
     */
    private function getPhotographerId()
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return null;
        }
        
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        return $nag?->Ma_NAG;
    }

    /**
     * Danh sách buổi chụp (vẫn giữ nguyên cho frontend)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Tự động cập nhật trạng thái trước khi lấy danh sách
            $this->autoUpdateBookingStatus();
            
            $perPage = (int) $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'Ngay_Tao');
            $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
            $statusParam = $request->get('status', 'all');
            $onlyMine = (bool) $request->get('only_mine', false);

            $query = BuoiChup::query();

            // Giới hạn danh sách buổi chụp của nhiếp ảnh gia đang đăng nhập (nếu có)
            if ($onlyMine) {
                $maNag = $this->getPhotographerId();
                if (!$maNag) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không phải nhiếp ảnh gia hoặc chưa đăng nhập.'
                    ], 403);
                }
                $query->where('Ma_NAG', $maNag);
            }

            // Tìm kiếm
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('Ma_BC', 'like', "%{$search}%")
                      ->orWhere('Dia_Diem', 'like', "%{$search}%")
                      ->orWhere('Loai_Chup', 'like', "%{$search}%")
                      ->orWhereHas('khachHang.taiKhoan', function ($tk) use ($search) {
                          $tk->where('Ho_Ten', 'like', "%{$search}%");
                      });
                });
            }

            // Lọc trạng thái
            if ($statusParam !== 'all') {
                $dbStatus = $this->mapStatusToDatabase($statusParam);
                $query->where('Trang_Thai', $dbStatus);
            }

            // Sắp xếp và phân trang
            $query->orderBy($sortBy, $sortOrder)
                  ->with(['khachHang.taiKhoan', 'nhaNhiepAnh']);

            $paginator = $query->paginate($perPage)->appends($request->query());

            $items = $paginator->getCollection()->map(function ($booking) {
                return $this->transformBookingSummary($booking);
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $items,
                'meta' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết buổi chụp
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Tự động cập nhật trạng thái trước khi lấy chi tiết
            $this->autoUpdateBookingStatus();
            
            $booking = BuoiChup::with(['khachHang.taiKhoan', 'nhaNhiepAnh'])
                ->where('Ma_BC', $id)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy buổi chụp'
            ], 404);
        }
    }

    /**
     * Bắt đầu buổi chụp (Start)
     */
    public function start(Request $request, string $id): JsonResponse
    {
        try {
            $maNag = $this->getPhotographerId();
            if (!$maNag) {
                return response()->json(['success' => false, 'message' => 'Bạn không phải nhiếp ảnh gia'], 403);
            }
            
            $booking = BuoiChup::findOrFail($id);
            if ($booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            // Chấp nhận cả "Chờ thanh toán" và "Chờ xử lý ảnh"
            if (!in_array($booking->Trang_Thai, ['Chờ thanh toán', 'Chờ xử lý ảnh'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp phải ở trạng thái "Chờ thanh toán" hoặc "Chờ xử lý ảnh" để bắt đầu'
                ], 400);
            }

            // Kiểm tra xem buổi chụp đã từng được kết thúc chưa (không cho phép bắt đầu lại)
            $sessionEnded = false;
            if ($booking->Ghi_Chu) {
                try {
                    $ghiChuData = json_decode($booking->Ghi_Chu, true);
                    if (is_array($ghiChuData) && isset($ghiChuData['session_ended']) && $ghiChuData['session_ended'] === true) {
                        $sessionEnded = true;
                    }
                } catch (\Exception $e) {
                    // Nếu không parse được, bỏ qua
                }
            }

            if ($sessionEnded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp đã được kết thúc. Không thể bắt đầu lại.'
                ], 400);
            }

            // Kiểm tra thanh toán: phải có đặt cọc HOẶC thanh toán đầy đủ
            // Nếu trạng thái là "Chờ thanh toán" thì coi như đã đặt cọc
            // Nếu trạng thái là "Chờ xử lý ảnh" thì coi như đã thanh toán đầy đủ
            $hasDeposit = ($booking->Trang_Thai === 'Chờ thanh toán');
            $hasFullPayment = ($booking->Trang_Thai === 'Chờ xử lý ảnh');
            
            // Nếu chưa xác định được từ trạng thái, kiểm tra từ bảng thanh_toan
            if (!$hasDeposit && !$hasFullPayment) {
                $payments = ThanhToan::where('Ma_BC', $booking->Ma_BC)
                    ->where('Trang_Thai', 'Thành công')
                    ->get();
                
                foreach ($payments as $payment) {
                    $ghiChu = json_decode($payment->Ghi_Chu, true);
                    if (isset($ghiChu['type'])) {
                        if ($ghiChu['type'] === 'deposit') {
                            $hasDeposit = true;
                        } elseif ($ghiChu['type'] === 'final') {
                            $hasFullPayment = true;
                        }
                    }
                }
            }

            if (!$hasDeposit && !$hasFullPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp chưa được thanh toán hoặc đặt cọc. Vui lòng đợi khách hàng thanh toán trước khi bắt đầu.'
                ], 400);
            }

            // Kiểm tra thời gian: cho phép bắt đầu trong khoảng từ 30 phút trước đến 30 phút sau giờ hẹn
            $scheduledTime = $booking->Bat_Dau_Chup instanceof Carbon 
                ? $booking->Bat_Dau_Chup 
                : Carbon::parse($booking->Bat_Dau_Chup);
            $now = Carbon::now();
            $minutesUntilStart = $now->diffInMinutes($scheduledTime, false);

            // Cho phép nếu: -30 <= minutesUntilStart <= 30
            // Nghĩa là: từ 30 phút trước giờ hẹn đến 30 phút sau giờ hẹn
            if ($minutesUntilStart > 30) {
            return response()->json([
                'success' => false,
                    'message' => 'Chỉ có thể bắt đầu buổi chụp trong khoảng từ 30 phút trước đến 30 phút sau thời gian hẹn. Còn ' . $minutesUntilStart . ' phút nữa mới đến giờ hẹn.'
                ], 400);
            }
            
            if ($minutesUntilStart < -30) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp đã muộn quá 30 phút. Buổi chụp sẽ tự động bị hủy.'
                ], 400);
            }

            // Lưu trạng thái cũ vào Ghi_Chu dưới dạng JSON (nếu chưa có)
            $oldStatus = $booking->Trang_Thai;
            $booking->Trang_Thai = 'Đang diễn ra';
            
            // Lưu trạng thái cũ vào Ghi_Chu để quay lại sau
            $ghiChuData = [];
            if ($booking->Ghi_Chu) {
                try {
                    $ghiChuData = json_decode($booking->Ghi_Chu, true);
                    if (!is_array($ghiChuData)) {
                        $ghiChuData = ['original_note' => $booking->Ghi_Chu];
                    }
                } catch (\Exception $e) {
                    $ghiChuData = ['original_note' => $booking->Ghi_Chu];
                }
            }
            $ghiChuData['previous_status'] = $oldStatus;
            $booking->Ghi_Chu = json_encode($ghiChuData, JSON_UNESCAPED_UNICODE);
            
            $booking->save();

            return response()->json([
                'success' => true,
                'message' => 'Buổi chụp đã bắt đầu',
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi bắt đầu buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kết thúc buổi chụp (End)
     */
    public function end(Request $request, string $id): JsonResponse
    {
        try {
            $maNag = $this->getPhotographerId();
            if (!$maNag) {
                return response()->json(['success' => false, 'message' => 'Bạn không phải nhiếp ảnh gia'], 403);
            }
            
            $booking = BuoiChup::findOrFail($id);
            if ($booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Đang diễn ra') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái đang diễn ra'
                ], 400);
            }

            // Lấy trạng thái cũ từ Ghi_Chu
            $previousStatus = null;
            if ($booking->Ghi_Chu) {
                try {
                    $ghiChuData = json_decode($booking->Ghi_Chu, true);
                    if (is_array($ghiChuData) && isset($ghiChuData['previous_status'])) {
                        $previousStatus = $ghiChuData['previous_status'];
                    }
                } catch (\Exception $e) {
                    // Nếu không parse được JSON, bỏ qua
                }
            }

            // Nếu không tìm thấy trạng thái cũ trong Ghi_Chu, xác định dựa trên thanh toán
            if (!$previousStatus) {
                // Kiểm tra từ bảng thanh_toan
                $payments = ThanhToan::where('Ma_BC', $booking->Ma_BC)
                    ->where('Trang_Thai', 'Thành công')
                    ->get();
                
                $hasDeposit = false;
                $hasFullPayment = false;
                
                foreach ($payments as $payment) {
                    $ghiChu = json_decode($payment->Ghi_Chu, true);
                    if (isset($ghiChu['type'])) {
                        if ($ghiChu['type'] === 'deposit') {
                            $hasDeposit = true;
                        } elseif ($ghiChu['type'] === 'final') {
                            $hasFullPayment = true;
                        }
                    }
                }

                // Xác định trạng thái cũ dựa trên thanh toán
                // Nếu đã thanh toán đầy đủ → "Chờ xử lý ảnh"
                // Nếu chỉ đặt cọc hoặc có đặt cọc → "Chờ thanh toán"
                // Nếu không có gì → mặc định "Chờ thanh toán" (fallback)
                if ($hasFullPayment) {
                    $previousStatus = 'Chờ xử lý ảnh';
                } elseif ($hasDeposit) {
                    $previousStatus = 'Chờ thanh toán';
                } else {
                    // Fallback: mặc định là "Chờ thanh toán" nếu không xác định được
                    $previousStatus = 'Chờ thanh toán';
                }
            }

            // Quay lại trạng thái cũ
            $booking->Trang_Thai = $previousStatus;
            
            // Khôi phục Ghi_Chu gốc (loại bỏ previous_status) và đánh dấu đã kết thúc session
            $ghiChuData = [];
            if ($booking->Ghi_Chu) {
                try {
                    $ghiChuData = json_decode($booking->Ghi_Chu, true);
                    if (!is_array($ghiChuData)) {
                        $ghiChuData = ['original_note' => $booking->Ghi_Chu];
                    }
                } catch (\Exception $e) {
                    $ghiChuData = ['original_note' => $booking->Ghi_Chu];
                }
            }
            
            // Loại bỏ previous_status và đánh dấu đã kết thúc session
            unset($ghiChuData['previous_status']);
            $ghiChuData['session_ended'] = true;
            
            // Nếu có original_note, giữ lại nó
            if (isset($ghiChuData['original_note'])) {
                $originalNote = $ghiChuData['original_note'];
                $ghiChuData = ['original_note' => $originalNote, 'session_ended' => true];
            }
            
            $booking->Ghi_Chu = json_encode($ghiChuData, JSON_UNESCAPED_UNICODE);
            
            $booking->save();

            return response()->json([
                'success' => true,
                'message' => 'Buổi chụp đã kết thúc',
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kết thúc buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hoàn thành xử lý ảnh - Chuyển từ "Chờ xử lý ảnh" sang "Đã xử lý ảnh"
     */
    public function completeProcessing(Request $request, string $id): JsonResponse
    {
        try {
            $maNag = $this->getPhotographerId();
            if (!$maNag) {
                return response()->json(['success' => false, 'message' => 'Bạn không phải nhiếp ảnh gia'], 403);
            }
            
            $booking = BuoiChup::findOrFail($id);
            if ($booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Chờ xử lý ảnh') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái chờ xử lý ảnh'
                ], 400);
            }

            $booking->Trang_Thai = 'Đã xử lý ảnh';
            $booking->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã hoàn thành xử lý ảnh',
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi hoàn thành xử lý ảnh',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================================
    // Các hàm tiện ích giữ nguyên
    // ==========================================================

    private function transformBookingSummary($booking): array
    {
        $start = $booking->Bat_Dau_Chup instanceof Carbon ? $booking->Bat_Dau_Chup : Carbon::parse($booking->Bat_Dau_Chup);
        $taiKhoan = optional(optional($booking->khachHang)->taiKhoan);

        return [
            'id' => $booking->Ma_BC,
            'status' => $this->mapStatusToFe($booking->Trang_Thai),
            'title' => trim(($booking->Loai_Chup ?: '') . ' - ' . ($booking->Dia_Diem ?: '')),
            'customer' => [
                'name' => $taiKhoan->Ho_Ten ?? 'Khách hàng',
            ],
            'date' => $start->toDateString(),
            'time' => $start->format('H:i'),
            'price' => (float) $booking->Tong_Tien,
        ];
    }

    private function transformBookingDetail($booking): array
    {
        $start = $booking->Bat_Dau_Chup instanceof Carbon ? $booking->Bat_Dau_Chup : Carbon::parse($booking->Bat_Dau_Chup);

        // Safely access nested relationships
        $taiKhoan = optional(optional($booking->khachHang)->taiKhoan);

        // Kiểm tra thanh toán
        $payments = ThanhToan::where('Ma_BC', $booking->Ma_BC)
            ->where('Trang_Thai', 'Thành công')
            ->get();
        
        $hasDeposit = false;
        $hasFullPayment = false;
        $totalPaid = 0;
        
        foreach ($payments as $payment) {
            $totalPaid += (float) $payment->So_Tien;
            $ghiChu = json_decode($payment->Ghi_Chu, true);
            if (isset($ghiChu['type'])) {
                if ($ghiChu['type'] === 'deposit') {
                    $hasDeposit = true;
                } elseif ($ghiChu['type'] === 'final') {
                    $hasFullPayment = true;
                }
            }
        }
        
        // Nếu trạng thái là "Chờ thanh toán" thì coi như đã đặt cọc
        if ($booking->Trang_Thai === 'Chờ thanh toán') {
            $hasDeposit = true;
        }
        
        // Nếu trạng thái là "Chờ xử lý ảnh" thì coi như đã thanh toán đầy đủ
        if ($booking->Trang_Thai === 'Chờ xử lý ảnh') {
            $hasFullPayment = true;
        }

        // Kiểm tra xem buổi chụp đã từng được kết thúc chưa
        $sessionEnded = false;
        if ($booking->Ghi_Chu) {
            try {
                $ghiChuData = json_decode($booking->Ghi_Chu, true);
                if (is_array($ghiChuData) && isset($ghiChuData['session_ended']) && $ghiChuData['session_ended'] === true) {
                    $sessionEnded = true;
                }
            } catch (\Exception $e) {
                // Nếu không parse được, bỏ qua
            }
        }

        $end = $booking->Ket_Thuc_Chup instanceof Carbon ? $booking->Ket_Thuc_Chup : Carbon::parse($booking->Ket_Thuc_Chup);

        return [
            'id' => $booking->Ma_BC,
            'status' => $this->mapStatusToFe($booking->Trang_Thai),
            'title' => $booking->Loai_Chup,
            'customer' => [
                'name' => $taiKhoan->Ho_Ten ?? 'Khách hàng',
                'avatar' => null, // Avatar field doesn't exist in tai_khoan table
                'email' => $taiKhoan->Email_TK ?? null,
                'phone' => $taiKhoan->So_ĐT ?? null,
            ],
            'type' => $booking->Loai_Chup,
            'location' => $booking->Dia_Diem,
            'date' => $start->toDateString(),
            'time' => $start->format('H:i'),
            'startDateTime' => $start->toDateTimeString(),
            'endTime' => $end->format('H:i'),
            'endDate' => $end->toDateString(),
            'endDateTime' => $end->toDateTimeString(),
            'price' => (float) $booking->Tong_Tien,
            'description' => $this->extractOriginalNote($booking->Ghi_Chu),
            'duration' => $this->calculateDuration($booking->Bat_Dau_Chup, $booking->Ket_Thuc_Chup),
            'guestCount' => '1', // Sửa: Chưa có cột
            'specialRequests' => $this->extractOriginalNote($booking->Ghi_Chu) ?? '',
            'uploadedRaw' => false, // TODO: Check filesystem
            'uploadedEdited' => false,
            'images' => [],
            'createdAt' => ($booking->Ngay_Tao instanceof Carbon) ? $booking->Ngay_Tao->toDateTimeString() : Carbon::parse($booking->Ngay_Tao)->toDateTimeString(),
            'depositRate' => (float) $booking->Ti_Le_Coc,
            'cancelReason' => $booking->Ly_Do_Huy,
            'changeReason' => $booking->Ly_Do_Thay_Doi,
            'hasDeposit' => $hasDeposit,
            'hasFullPayment' => $hasFullPayment,
            'totalPaid' => $totalPaid,
            'scheduledDateTime' => $start->toDateTimeString(), // Thêm thời gian hẹn để frontend kiểm tra
            'sessionEnded' => $sessionEnded, // Đánh dấu buổi chụp đã từng được kết thúc
        ];
    }

    private function calculateDuration($start, $end): string
    {
        try {
            if (!$start || !$end) return '';

            $s = $start instanceof Carbon ? $start : Carbon::parse($start);
            $e = $end instanceof Carbon ? $end : Carbon::parse($end);

            if ($s->greaterThan($e)) return '';

            $totalMinutes = $s->diffInMinutes($e);
            $hours = intdiv($totalMinutes, 60);
            $minutes = $totalMinutes % 60;

            return $hours > 0
                ? ($minutes > 0 ? "{$hours} giờ {$minutes} phút" : "{$hours} giờ")
                : "{$minutes} phút";
        } catch (\Throwable $e) {
            return '';
        }
    }

    /**
     * Trích xuất ghi chú gốc từ Ghi_Chu (có thể là JSON chứa previous_status)
     */
    private function extractOriginalNote($ghiChu): ?string
    {
        if (!$ghiChu) return null;
        
        try {
            $data = json_decode($ghiChu, true);
            if (is_array($data)) {
                if (isset($data['original_note'])) {
                    return $data['original_note'];
                }
                // Nếu không có original_note, trả về null (vì đây là JSON metadata)
                return null;
            }
        } catch (\Exception $e) {
            // Nếu không phải JSON, trả về ghi chú gốc
        }
        
        return $ghiChu;
    }

    private function mapStatusToDatabase(string $feStatus): string
    {
        return [
            'pending_confirmation' => 'Chờ xác nhận',
            'pending_deposit' => 'Chờ đặt cọc',
            'pending_payment' => 'Chờ thanh toán',
            'upcoming' => 'Sắp diễn ra',
            'ongoing' => 'Đang diễn ra',
            'pending_processing' => 'Chờ xử lý ảnh',
            'processed' => 'Đã xử lý ảnh',
            'completed' => 'Đã hoàn thành',
            'cancelled' => 'Đã hủy',
        ][$feStatus] ?? $feStatus;
    }

    private function mapStatusToFe(string $dbStatus): string
    {
        return [
            'Chờ xác nhận' => 'pending_confirmation',
            'Chờ đặt cọc' => 'pending_deposit',
            'Chờ thanh toán' => 'pending_payment',
            'Sắp diễn ra' => 'upcoming',
            'Đang diễn ra' => 'ongoing',
            'Chờ xử lý ảnh' => 'pending_processing',
            'Đã xử lý ảnh' => 'processed',
            'Đã hoàn thành' => 'completed',
            'Đã hủy' => 'cancelled',
        ][$dbStatus] ?? 'pending_confirmation';
    }
}

