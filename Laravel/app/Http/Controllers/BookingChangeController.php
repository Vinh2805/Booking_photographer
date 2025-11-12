<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\BuoiChup;
use App\Models\KhachHang;
use App\Models\NhiepAnhGia;

class BookingChangeController extends Controller
{
    /**
     * Lấy danh sách yêu cầu thay đổi chờ duyệt
     */
    public function getPendingRequests(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();

        if (!$khachHang && !$nag) {
            return response()->json(['message' => 'Bạn không phải khách hàng hoặc nhiếp ảnh gia'], 403);
        }

        // Lấy danh sách buổi chụp của người dùng
        $bookings = [];
        if ($khachHang) {
            $bookings = BuoiChup::where('Ma_KH', $khachHang->Ma_KH)->pluck('Ma_BC')->toArray();
        } elseif ($nag) {
            $bookings = BuoiChup::where('Ma_NAG', $nag->Ma_NAG)->pluck('Ma_BC')->toArray();
        }

        if (empty($bookings)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Lấy các yêu cầu thay đổi chờ duyệt
        // Nếu là khách hàng → lấy yêu cầu từ nhiếp ảnh gia (Nguoi_Gui = 'photographer')
        // Nếu là nhiếp ảnh gia → lấy yêu cầu từ khách hàng (Nguoi_Gui = 'customer')
        $nguoiGui = $khachHang ? 'photographer' : 'customer';

        $yeuCauList = DB::table('yeu_cau_thay_doi')
            ->whereIn('Ma_BC', $bookings)
            ->where('Nguoi_Gui', $nguoiGui)
            ->where('Trang_Thai', 'Chờ duyệt')
            ->orderBy('Ngay_Tao', 'desc')
            ->get();

        $result = [];
        foreach ($yeuCauList as $yeuCau) {
            $booking = BuoiChup::find($yeuCau->Ma_BC);
            if (!$booking) continue;

            $changes = json_decode($yeuCau->Danh_Sach_Thay_Doi, true);
            
            $result[] = [
                'id' => $yeuCau->id,
                'ma_bc' => $yeuCau->Ma_BC,
                'booking' => [
                    'id' => $booking->Ma_BC,
                    'title' => $booking->Loai_Chup,
                    'location' => $booking->Dia_Diem,
                    'date' => $booking->Bat_Dau_Chup,
                ],
                'changes' => $changes,
                'ly_do' => $yeuCau->Ly_Do,
                'nguoi_gui' => $yeuCau->Nguoi_Gui,
                'ngay_tao' => $yeuCau->Ngay_Tao,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function requestChange(Request $request, string $ma_bc)
    {
        // Kiểm tra authentication - middleware auth:sanctum đã xác thực rồi
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'thay_doi' => 'required|array',
            'ly_do' => 'required|string|max:255'
        ], [
            'thay_doi.required' => 'Vui lòng chọn thông tin cần thay đổi.',
            'ly_do.required' => 'Vui lòng nhập lý do thay đổi.'
        ]);

        $booking = BuoiChup::find($ma_bc);
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy buổi chụp.'], 404);
        }

        // Kiểm tra trạng thái: chỉ cho phép thay đổi khi buổi chụp ở trạng thái "Chờ xác nhận" hoặc "Chờ đặt cọc"
        $allowedStatuses = ['Chờ xác nhận', 'Chờ đặt cọc'];
        
        if (!in_array($booking->Trang_Thai, $allowedStatuses)) {
            return response()->json([
                'message' => 'Buổi chụp chỉ có thể thay đổi khi ở trạng thái "Chờ xác nhận" hoặc "Chờ đặt cọc". Trạng thái hiện tại: ' . $booking->Trang_Thai
            ], 400);
        }

        // Kiểm tra xem buổi chụp đã từng được bắt đầu chưa (đã bấm nút "Bắt đầu buổi chụp")
        // Nếu đã bắt đầu và kết thúc (session_ended = true), không cho phép thay đổi
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
                'message' => 'Buổi chụp đã được bắt đầu trước đó. Không thể thay đổi nữa.'
            ], 400);
        }

        // Xác định người gửi: khách hàng hoặc nhiếp ảnh gia
        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        
        $nguoiGui = null;
        $maNguoiGui = null;
        
        if ($khachHang) {
            // Kiểm tra buổi chụp thuộc về khách hàng này
            if ($booking->Ma_KH !== $khachHang->Ma_KH) {
                return response()->json(['message' => 'Bạn không có quyền yêu cầu thay đổi buổi chụp này'], 403);
            }
            $nguoiGui = 'customer';
            $maNguoiGui = $khachHang->Ma_KH;
        } elseif ($nag) {
            // Kiểm tra buổi chụp thuộc về nhiếp ảnh gia này
            if ($booking->Ma_NAG !== $nag->Ma_NAG) {
                return response()->json(['message' => 'Bạn không có quyền yêu cầu thay đổi buổi chụp này'], 403);
            }
            $nguoiGui = 'photographer';
            $maNguoiGui = $nag->Ma_NAG;
        } else {
            return response()->json(['message' => 'Bạn không phải khách hàng hoặc nhiếp ảnh gia'], 403);
        }

        // Validate từng field trong thay_doi
        $allowedFields = [
            'Bat_Dau_Chup' => 'datetime',
            'Ket_Thuc_Chup' => 'datetime',
            'Dia_Diem' => 'string',
            'Loai_Chup' => 'string',
            'Tong_Tien' => 'decimal',
            'Ti_Le_Coc' => 'decimal'
        ];

        $changes = [];
        $validationErrors = [];

        foreach ($validated['thay_doi'] as $field => $newValue) {
            // Kiểm tra field có được phép thay đổi không
            if (!isset($allowedFields[$field])) {
                $validationErrors[$field] = "Trường '{$field}' không được phép thay đổi.";
                continue;
            }

            // Kiểm tra field có tồn tại trong model không
            // Trong Eloquent, các field database là attributes, không phải properties
            // Vì chúng ta đã có whitelist $allowedFields, các field này đã được xác nhận là hợp lệ
            // Chỉ cần kiểm tra xem field có trong fillable hoặc có thể truy cập được qua model
            $fillable = $booking->getFillable();
            
            // Nếu field không có trong fillable, vẫn cho phép nếu nó nằm trong allowedFields
            // (một số field có thể không cần mass assignment nhưng vẫn có thể set trực tiếp)
            // Bỏ qua kiểm tra này vì các field trong $allowedFields đã được xác nhận là hợp lệ từ database schema

            // Validate theo từng loại field
            $fieldType = $allowedFields[$field];
            $validationResult = $this->validateField($field, $newValue, $fieldType, $booking);
            
            if ($validationResult['valid']) {
                $changes[$field] = [
                    'cu' => $booking->$field,
                    'moi' => $validationResult['value'] // Sử dụng giá trị đã được format
                ];
            } else {
                $validationErrors[$field] = $validationResult['error'];
            }
        }

        // Nếu có lỗi validation, trả về lỗi
        if (!empty($validationErrors)) {
            return response()->json([
                'message' => 'Dữ liệu thay đổi không hợp lệ',
                'errors' => $validationErrors
            ], 422);
        }

        // Kiểm tra logic nghiệp vụ
        if (isset($changes['Bat_Dau_Chup']) && isset($changes['Ket_Thuc_Chup'])) {
            $batDau = Carbon::parse($changes['Bat_Dau_Chup']['moi']);
            $ketThuc = Carbon::parse($changes['Ket_Thuc_Chup']['moi']);
            
            // Kiểm tra thời gian phải trong tương lai
            if ($batDau->isPast()) {
                return response()->json([
                    'message' => 'Thời gian bắt đầu phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }
            
            if ($ketThuc->isPast()) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }
            
            if ($ketThuc->lte($batDau)) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải sau thời gian bắt đầu'
                ], 422);
            }
        } elseif (isset($changes['Ket_Thuc_Chup'])) {
            // Nếu chỉ thay đổi Ket_Thuc_Chup, kiểm tra với Bat_Dau_Chup hiện tại
            $batDau = Carbon::parse($booking->Bat_Dau_Chup);
            $ketThuc = Carbon::parse($changes['Ket_Thuc_Chup']['moi']);
            
            // Kiểm tra thời gian kết thúc phải trong tương lai
            if ($ketThuc->isPast()) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }
            
            if ($ketThuc->lte($batDau)) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải sau thời gian bắt đầu'
                ], 422);
            }
        } elseif (isset($changes['Bat_Dau_Chup'])) {
            // Nếu chỉ thay đổi Bat_Dau_Chup, kiểm tra với Ket_Thuc_Chup hiện tại
            $batDau = Carbon::parse($changes['Bat_Dau_Chup']['moi']);
            $ketThuc = Carbon::parse($booking->Ket_Thuc_Chup);
            
            // Kiểm tra thời gian bắt đầu phải trong tương lai
            if ($batDau->isPast()) {
                return response()->json([
                    'message' => 'Thời gian bắt đầu phải trong tương lai. Không thể đặt lịch ở quá khứ.'
                ], 422);
            }
            
            if ($ketThuc->lte($batDau)) {
                return response()->json([
                    'message' => 'Thời gian kết thúc phải sau thời gian bắt đầu'
                ], 422);
            }
        }

        // Kiểm tra Ti_Le_Coc phải từ 0-100
        if (isset($changes['Ti_Le_Coc'])) {
            $tiLeCoc = (float) $changes['Ti_Le_Coc']['moi'];
            if ($tiLeCoc < 0 || $tiLeCoc > 100) {
                return response()->json([
                    'message' => 'Tỷ lệ cọc phải từ 0 đến 100'
                ], 422);
            }
        }

        DB::table('yeu_cau_thay_doi')->insert([
            'Ma_BC' => $booking->Ma_BC,
            'Nguoi_Gui' => $nguoiGui,
            'Ma_Nguoi_Gui' => $maNguoiGui,
            'Danh_Sach_Thay_Doi' => json_encode($changes, JSON_UNESCAPED_UNICODE),
            'Ly_Do' => $validated['ly_do'],
            'Trang_Thai' => 'Chờ duyệt',
            'Ngay_Tao' => now()
        ]);

        $nguoiDuyet = $nguoiGui === 'customer' ? 'nhiếp ảnh gia' : 'khách hàng';
        
        DB::table('lich_su_giao_dich')->insert([
            'Ma_BC' => $booking->Ma_BC,
            'Loai_Giao_Dich' => 'Thay doi',
            'Mo_Ta' => "Yêu cầu thay đổi buổi chụp {$booking->Ma_BC} từ " . ($nguoiGui === 'customer' ? 'khách hàng' : 'nhiếp ảnh gia') . " đang chờ duyệt bởi {$nguoiDuyet}. Lý do: {$validated['ly_do']}",
            'Thoi_Gian' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'title' => 'Yêu cầu thay đổi đã được gửi',
            'message' => "Yêu cầu của bạn đang được xét duyệt bởi {$nguoiDuyet}.",
            'data' => [
                'ma_buoi_chup' => $booking->Ma_BC,
                'thay_doi' => $changes,
                'ly_do' => $validated['ly_do'],
                'nguoi_gui' => $nguoiGui
            ],
            'icon' => '📩'
        ]);
    }

    /**
     * Validate từng field theo loại dữ liệu
     */
    private function validateField(string $field, $value, string $type, BuoiChup $booking): array
    {
        switch ($type) {
            case 'datetime':
                try {
                    // Thử parse với nhiều format khác nhau
                    $dateTime = null;
                    
                    // Format 1: Y-m-d H:i:s (2025-11-22 14:30:00)
                    if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $value)) {
                        $dateTime = Carbon::createFromFormat('Y-m-d H:i:s', $value);
                    }
                    // Format 2: Y-m-d H:i (2025-11-22 14:30)
                    elseif (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value)) {
                        $dateTime = Carbon::createFromFormat('Y-m-d H:i', $value);
                    }
                    // Format 3: Y-m-d\TH:i:s (ISO format)
                    elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $value)) {
                        $dateTime = Carbon::parse($value);
                    }
                    // Format 4: Y-m-d\TH:i (ISO format without seconds)
                    elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $value)) {
                        $dateTime = Carbon::parse($value);
                    }
                    // Format 5: Thử parse tự động (fallback)
                    else {
                        $dateTime = Carbon::parse($value);
                    }
                    
                    if (!$dateTime || !$dateTime->isValid()) {
                        throw new \Exception("Invalid date");
                    }
                    
                    return [
                        'valid' => true,
                        'value' => $dateTime->format('Y-m-d H:i:s')
                    ];
                } catch (\Exception $e) {
                    return [
                        'valid' => false,
                        'error' => "Giá trị '{$value}' không phải là định dạng ngày giờ hợp lệ. Vui lòng nhập theo định dạng: YYYY-MM-DD HH:mm (ví dụ: 2025-11-22 14:30)"
                    ];
                }

            case 'string':
                $maxLength = match($field) {
                    'Dia_Diem' => 255,
                    'Loai_Chup' => 100,
                    default => 255
                };
                
                if (!is_string($value)) {
                    return [
                        'valid' => false,
                        'error' => "Trường '{$field}' phải là chuỗi ký tự"
                    ];
                }
                
                if (strlen($value) > $maxLength) {
                    return [
                        'valid' => false,
                        'error' => "Trường '{$field}' không được vượt quá {$maxLength} ký tự"
                    ];
                }
                
                return [
                    'valid' => true,
                    'value' => trim($value)
                ];

            case 'decimal':
                if (!is_numeric($value)) {
                    return [
                        'valid' => false,
                        'error' => "Trường '{$field}' phải là số"
                    ];
                }
                
                $decimalValue = (float) $value;
                
                // Kiểm tra số âm
                if ($decimalValue < 0) {
                    return [
                        'valid' => false,
                        'error' => "Trường '{$field}' không được là số âm"
                    ];
                }
                
                // Format theo số thập phân
                $decimals = match($field) {
                    'Tong_Tien' => 2,
                    'Ti_Le_Coc' => 2,
                    default => 2
                };
                
                return [
                    'valid' => true,
                    'value' => number_format($decimalValue, $decimals, '.', '')
                ];

            default:
                return [
                    'valid' => false,
                    'error' => "Loại dữ liệu '{$type}' không được hỗ trợ"
                ];
        }
    }
}
