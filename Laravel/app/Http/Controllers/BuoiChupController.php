<?php 
namespace App\Http\Controllers;

use App\Models\BuoiChup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BuoiChupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = (int) $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'Ngay_Tao');
            $sortOrder = strtolower($request->get('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';
            $statusParam = $request->get('status', 'all');
            $onlyMine = (bool) $request->get('only_mine', false);

            $query = BuoiChup::query();

            // Sửa: Kiểm tra quyền nhiếp ảnh gia chính xác
            if ($onlyMine && auth()->check()) {
                $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
                if ($maNag) {
                    $query->where('Ma_NAG', $maNag);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn không phải nhiếp ảnh gia'
                    ], 403);
                }
            }

            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('Ma_BC', 'like', "%{$search}%")
                      ->orWhere('Dia_Diem', 'like', "%{$search}%")
                      ->orWhere('Loai_Chup', 'like', "%{$search}%")
                      // Sửa: Tìm kiếm tên khách hàng qua tai_khoan
                      ->orWhereHas('khachHang.taiKhoan', function ($tk) use ($search) {
                          $tk->where('Ho_Ten', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('status') && $statusParam !== 'all') {
                $dbStatus = $this->mapStatusToDatabase($statusParam);
                $query->where('Trang_Thai', $dbStatus);
            }

            if ($request->filled('start_date') || $request->filled('end_date')) {
                $start = $request->filled('start_date') ? Carbon::parse($request->get('start_date'))->startOfDay() : null;
                $end = $request->filled('end_date') ? Carbon::parse($request->get('end_date'))->endOfDay() : null;

                if ($start && $end) {
                    $query->whereBetween('Bat_Dau_Chup', [$start, $end]);
                } elseif ($start) {
                    $query->where('Bat_Dau_Chup', '>=', $start);
                } elseif ($end) {
                    $query->where('Bat_Dau_Chup', '<=', $end);
                }
            }

            if ($request->filled('min_price') || $request->filled('max_price')) {
                $min = $request->filled('min_price') ? (float) $request->get('min_price') : 0;
                $max = $request->filled('max_price') ? (float) $request->get('max_price') : null;

                if (!is_null($max)) {
                    $query->whereBetween('Tong_Tien', [$min, $max]);
                } else {
                    $query->where('Tong_Tien', '>=', $min);
                }
            }

            if ($request->filled('type')) {
                $query->where('Loai_Chup', $request->get('type'));
            }

            if ($request->filled('uploaded')) {
                $uploaded = $request->get('uploaded');
                if ($uploaded === 'raw') {
                    $query->whereHas('anh', function ($q) {
                        $q->where('Loai_Anh', 'raw');
                    });
                } elseif ($uploaded === 'edited') {
                    $query->whereHas('anh', function ($q) {
                        $q->where('Loai_Anh', 'edited');
                    });
                } elseif ($uploaded === 'both') {
                    $query->whereHas('anh', function ($q) {
                        $q->where('Loai_Anh', 'raw');
                    })->whereHas('anh', function ($q) {
                        $q->where('Loai_Anh', 'edited');
                    });
                }
            }

            $allowedSort = ['Ngay_Tao', 'Bat_Dau_Chup', 'Tong_Tien'];
            if (!in_array($sortBy, $allowedSort)) {
                $sortBy = 'Ngay_Tao';
            }
            $query->orderBy($sortBy, $sortOrder);

            $query->with(['khachHang.taiKhoan', 'nhaNhiepAnh', 'anh']);

            $paginator = $query->paginate($perPage)->appends($request->query());

            $items = $paginator->getCollection()->map(function ($booking) {
                return $this->transformBookingSummary($booking);
            })->toArray();

            $statusCountsRaw = BuoiChup::select('Trang_Thai', DB::raw('count(*) as count'))
                ->groupBy('Trang_Thai')
                ->pluck('count', 'Trang_Thai')
                ->toArray();

            $allFeStatuses = [
                'all' => array_sum($statusCountsRaw),
                'pending_confirmation' => $statusCountsRaw['Chờ xác nhận'] ?? 0,
                'pending_deposit' => $statusCountsRaw['Chờ đặt cọc'] ?? 0,
                'upcoming' => $statusCountsRaw['Sắp diễn ra'] ?? 0,
                'ongoing' => $statusCountsRaw['Đang diễn ra'] ?? 0,
                'pending_payment' => $statusCountsRaw['Chờ thanh toán'] ?? 0,
                'pending_processing' => $statusCountsRaw['Chờ xử lý ảnh'] ?? 0,
                'processed' => $statusCountsRaw['Đã xử lý ảnh'] ?? 0,
                'completed' => $statusCountsRaw['Đã hoàn thành'] ?? 0,
                'cancelled' => $statusCountsRaw['Đã hủy'] ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $items,
                'meta' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                ],
                'counts' => $allFeStatuses,
                'filters' => [
                    'applied' => $request->all(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tải danh sách buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::with(['khachHang.taiKhoan', 'nhaNhiepAnh', 'anh'])
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

    public function confirm(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Chờ xác nhận') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái chờ xác nhận'
                ], 400);
            }
            $booking->Trang_Thai = 'Chờ đặt cọc';
            $booking->save();

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xác nhận buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Chờ xác nhận') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái chờ xác nhận'
                ], 400);
            }
            $booking->Trang_Thai = 'Đã hủy';
            $booking->Ly_Do_Huy = $request->input('reason', 'Không có lý do cụ thể');
            $booking->save();

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi từ chối buổi chụp',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changeRequest(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if (!in_array($booking->Trang_Thai, ['Chờ đặt cọc', 'Sắp diễn ra'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể yêu cầu thay đổi ở trạng thái này'
                ], 400);
            }

            $request->validate([
                'field' => 'required|in:time,location,date,other',
                'newValue' => 'required|string',
                'reason' => 'required|string',
            ]);

            $booking->Ly_Do_Thay_Doi = $request->input('reason');
            $booking->Trang_Thai = 'Chờ xác nhận';
            $booking->save();

            // Tạm thời comment nếu chưa có bảng
            // DB::table('change_requests')->insert([
            //     'Ma_BC' => $id,
            //     'Field' => $request->input('field'),
            //     'New_Value' => $request->input('newValue'),
            //     'Reason' => $request->input('reason'),
            //     'Created_At' => now(),
            // ]);

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gửi yêu cầu thay đổi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancelRequest(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if (!in_array($booking->Trang_Thai, ['Chờ đặt cọc', 'Sắp diễn ra'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể hủy ở trạng thái này'
                ], 400);
            }

            $request->validate([
                'reason' => 'required|string',
            ]);

            $booking->Trang_Thai = 'Đã hủy';
            $booking->Ly_Do_Huy = $request->input('reason');
            $booking->save();

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gửi yêu cầu hủy',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function upload(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if (!in_array($booking->Trang_Thai, ['Chờ xử lý ảnh', 'Chờ thanh toán'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể upload ảnh ở trạng thái này'
                ], 400);
            }

            $request->validate([
                'type' => 'required|in:raw,edited',
                'url' => 'required|url',
            ]);

            DB::table('anh')->insert([
                'Ma_BC' => $id,
                'Loai_Anh' => $request->input('type'),
                'Duong_Dan' => $request->input('url'),
                'Ngay_Upload' => now(),
            ]);

            if ($request->input('type') === 'edited') {
                $booking->Trang_Thai = 'Đã xử lý ảnh';
                $booking->save();
            }

            return response()->json([
                'success' => true,
                'data' => $this->transformBookingDetail($booking)
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi upload ảnh',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function start(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Sắp diễn ra') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái sắp diễn ra'
                ], 400);
            }
            $booking->Trang_Thai = 'Đang diễn ra';
            $booking->save();

            return response()->json([
                'success' => true,
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

    public function end(Request $request, string $id): JsonResponse
    {
        try {
            $booking = BuoiChup::findOrFail($id);
            $maNag = auth()->user()->nhiepAnhGia?->Ma_NAG;
            if (!$maNag || $booking->Ma_NAG !== $maNag) {
                return response()->json(['success' => false, 'message' => 'Không có quyền'], 403);
            }

            if ($booking->Trang_Thai !== 'Đang diễn ra') {
                return response()->json([
                    'success' => false,
                    'message' => 'Buổi chụp không ở trạng thái đang diễn ra'
                ], 400);
            }
            $booking->Trang_Thai = 'Chờ xử lý ảnh';
            $booking->save();

            return response()->json([
                'success' => true,
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

    private function transformBookingSummary($booking): array
    {
        $start = $booking->Bat_Dau_Chup instanceof Carbon ? $booking->Bat_Dau_Chup : Carbon::parse($booking->Bat_Dau_Chup);

        return [
            'id' => $booking->Ma_BC,
            'status' => $this->mapStatusToFe($booking->Trang_Thai),
            'title' => trim(($booking->Loai_Chup ?: '') . ' - ' . ($booking->Dia_Diem ?: '')),
            'customer' => [
                'name' => $booking->khachHang->taiKhoan->Ho_Ten ?? 'Khách hàng',
                'avatar' => $booking->khachHang->taiKhoan->Avatar ?? null,
            ],
            'type' => $booking->Loai_Chup,
            'location' => $booking->Dia_Diem,
            'date' => $start->toDateString(),
            'time' => $start->format('H:i'),
            'price' => (float) $booking->Tong_Tien,
            'duration' => $this->calculateDuration($booking->Bat_Dau_Chup, $booking->Ket_Thuc_Chup),
            'uploadedRaw' => $booking->anh->where('Loai_Anh', 'raw')->isNotEmpty(),
            'uploadedEdited' => $booking->anh->where('Loai_Anh', 'edited')->isNotEmpty(),
        ];
    }

    private function transformBookingDetail($booking): array
    {
        $start = $booking->Bat_Dau_Chup instanceof Carbon ? $booking->Bat_Dau_Chup : Carbon::parse($booking->Bat_Dau_Chup);

        return [
            'id' => $booking->Ma_BC,
            'status' => $this->mapStatusToFe($booking->Trang_Thai),
            'title' => $booking->Loai_Chup,
            'customer' => [
                'name' => $booking->khachHang->taiKhoan->Ho_Ten ?? 'Khách hàng',
                'avatar' => $booking->khachHang->taiKhoan->Avatar ?? null,
                'email' => $booking->khachHang->taiKhoan->Email ?? null,
                'phone' => $booking->khachHang->taiKhoan->So_Dien_Thoai ?? null,
            ],
            'type' => $booking->Loai_Chup,
            'location' => $booking->Dia_Diem,
            'date' => $start->toDateString(),
            'time' => $start->format('H:i'),
            'price' => (float) $booking->Tong_Tien,
            'description' => $booking->Ghi_Chu,
            'duration' => $this->calculateDuration($booking->Bat_Dau_Chup, $booking->Ket_Thuc_Chup),
            'guestCount' => '1', // Sửa: Chưa có cột
            'specialRequests' => $booking->Ghi_Chu ?? '', // Sửa: Chưa có cột
            'uploadedRaw' => $booking->anh->where('Loai_Anh', 'raw')->isNotEmpty(),
            'uploadedEdited' => $booking->anh->where('Loai_Anh', 'edited')->isNotEmpty(),
            'images' => $booking->anh->map(function ($image) {
                return [
                    'type' => $image->Loai_Anh,
                    'url' => $image->Duong_Dan
                ];
            })->toArray(),
            'createdAt' => ($booking->Ngay_Tao instanceof Carbon) ? $booking->Ngay_Tao->toDateTimeString() : Carbon::parse($booking->Ngay_Tao)->toDateTimeString(),
            'depositRate' => (float) $booking->Ti_Le_Coc,
            'cancelReason' => $booking->Ly_Do_Huy,
            'changeReason' => $booking->Ly_Do_Thay_Doi,
        ];
    }

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
            'cancelled' => 'Đã hủy',
        ];
        return $statusMap[$feStatus] ?? $feStatus;
    }

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
        ];
        return $statusMap[$dbStatus] ?? 'pending_confirmation';
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
}