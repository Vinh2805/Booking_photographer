<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\KhachHang;
use App\Models\NhiepAnhGia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Lấy thông tin profile của customer
     */
    public function getCustomerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Khách hàng') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
        if (!$khachHang) {
            return response()->json(['message' => 'Không tìm thấy thông tin khách hàng'], 404);
        }

        // Handle dateOfBirth - check if it's already a Carbon instance or string
        $dateOfBirth = null;
        if ($khachHang->Ngay_Sinh) {
            if (is_string($khachHang->Ngay_Sinh)) {
                $dateOfBirth = $khachHang->Ngay_Sinh;
            } else {
                $dateOfBirth = $khachHang->Ngay_Sinh->format('Y-m-d');
            }
        }

        // Get statistics
        $totalBookings = \App\Models\BuoiChup::where('Ma_KH', $khachHang->Ma_KH)->count();
        $completedBookings = \App\Models\BuoiChup::where('Ma_KH', $khachHang->Ma_KH)
            ->where('Trang_Thai', 'Đã hoàn thành')
            ->count();
        
        // TODO: Get favorite photographers count from yêu_thich table when available
        $favoritePhotographers = 0;

        // Get join date from Thoi_Diem_Tao_TK or created_at
        $joinDate = null;
        if ($user->Thoi_Diem_Tao_TK) {
            $joinDate = is_string($user->Thoi_Diem_Tao_TK) 
                ? date('Y-m-d', strtotime($user->Thoi_Diem_Tao_TK))
                : \Carbon\Carbon::parse($user->Thoi_Diem_Tao_TK)->format('Y-m-d');
        } elseif (isset($user->created_at) && $user->created_at) {
            $joinDate = is_string($user->created_at) 
                ? date('Y-m-d', strtotime($user->created_at))
                : \Carbon\Carbon::parse($user->created_at)->format('Y-m-d');
        }

        // Process avatar URL - file is stored in storage/app/private/public/avatars/
        $avatarUrl = $user->Avatar;
        if ($avatarUrl && !empty($avatarUrl)) {
            // File path in private storage: public/avatars/filename.jpg
            $filePath = str_replace('/storage/', 'public/', $avatarUrl);
            
            // Check if file exists in private storage (storage/app/private/public/avatars/)
            if (Storage::disk('local')->exists($filePath)) {
                // Generate URL to serve file from private storage
                $fileName = basename($avatarUrl);
                $avatarUrl = url('/api/storage/avatars/' . $fileName);
            } else {
                // File doesn't exist, set to null
                $avatarUrl = null;
            }
        }

        return response()->json([
            'id' => $khachHang->Ma_KH,
            'name' => $user->Ho_Ten,
            'email' => $user->Email_TK,
            'phone' => $user->So_ĐT,
            'avatar' => $avatarUrl,
            'location' => $khachHang->Dia_Chi,
            'dateOfBirth' => $dateOfBirth,
            'bio' => $user->Gioi_Thieu,
            'favoriteGenres' => $khachHang->So_Thich_The_Loai ? json_decode($khachHang->So_Thich_The_Loai, true) : [],
            'favoriteLocations' => $khachHang->So_Thich_Dia_Diem ? json_decode($khachHang->So_Thich_Dia_Diem, true) : [],
            'totalBookings' => $totalBookings,
            'completedBookings' => $completedBookings,
            'favoritePhotographers' => $favoritePhotographers,
            'joinDate' => $joinDate,
        ]);
    }

    /**
     * Cập nhật profile của customer
     */
    public function updateCustomerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Khách hàng') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:tai_khoan,Email_TK,' . $user->Ma_TK . ',Ma_TK',
            'phone' => 'required|string|max:15|unique:tai_khoan,So_ĐT,' . $user->Ma_TK . ',Ma_TK',
            'location' => 'nullable|string|max:255',
            'dateOfBirth' => [
                'nullable',
                'date',
                'date_format:Y-m-d',
                'before:today',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $date = \Carbon\Carbon::parse($value);
                        $today = \Carbon\Carbon::today();
                        if ($date->greaterThan($today)) {
                            $fail('Ngày sinh không thể là ngày trong tương lai.');
                        }
                        // Check if date is too old (e.g., more than 150 years ago)
                        $minDate = \Carbon\Carbon::today()->subYears(150);
                        if ($date->lessThan($minDate)) {
                            $fail('Ngày sinh không hợp lệ.');
                        }
                    }
                },
            ],
            'bio' => 'nullable|string|max:500',
            'favoriteGenres' => 'nullable|array|max:20',
            'favoriteGenres.*' => 'string|max:50',
            'favoriteLocations' => 'nullable|array|max:20',
            'favoriteLocations.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Cập nhật tai_khoan
            $oldData = [
                'name' => $user->Ho_Ten,
                'email' => $user->Email_TK,
                'phone' => $user->So_ĐT,
                'bio' => $user->Gioi_Thieu,
            ];

            $user->Ho_Ten = $request->name;
            $user->Email_TK = $request->email;
            $user->So_ĐT = $request->phone;
            $user->Gioi_Thieu = $request->bio;
            $user->save();

            // Cập nhật khach_hang
            $khachHang = KhachHang::where('Ma_TK', $user->Ma_TK)->first();
            if ($khachHang) {
                $oldData['location'] = $khachHang->Dia_Chi;
                $oldData['dateOfBirth'] = $khachHang->Ngay_Sinh;
                $oldData['favoriteGenres'] = $khachHang->So_Thich_The_Loai;
                $oldData['favoriteLocations'] = $khachHang->So_Thich_Dia_Diem;

                $khachHang->Dia_Chi = $request->location;
                $khachHang->Ngay_Sinh = $request->dateOfBirth;
                $khachHang->So_Thich_The_Loai = $request->favoriteGenres ? json_encode($request->favoriteGenres) : null;
                $khachHang->So_Thich_Dia_Diem = $request->favoriteLocations ? json_encode($request->favoriteLocations) : null;
                $khachHang->save();
            }

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, $oldData, $request->all(), 'updated');

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật hồ sơ thành công',
                'profile' => $this->getCustomerProfile($request)->getData()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi cập nhật hồ sơ: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload avatar cho customer
     */
    public function uploadCustomerAvatar(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Khách hàng') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,jpg,png|max:5120|dimensions:min_width=400,min_height=400',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $oldAvatar = $user->Avatar;
            $file = $request->file('avatar');
            $fileName = 'avatar_' . $user->Ma_TK . '_' . time() . '.' . $file->getClientOriginalExtension();
            // Store in local disk (storage/app/private/public/avatars/)
            $path = $file->storeAs('public/avatars', $fileName, 'local');

            // Save relative path, we'll generate serve URL when reading
            $user->Avatar = '/storage/avatars/' . $fileName;
            $user->save();

            // Xóa ảnh cũ nếu có
            if ($oldAvatar && Storage::exists(str_replace('/storage/', 'public/', $oldAvatar))) {
                Storage::delete(str_replace('/storage/', 'public/', $oldAvatar));
            }

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, ['avatar' => $oldAvatar], ['avatar' => $user->Avatar], 'uploaded');

            return response()->json([
                'message' => 'Tải ảnh đại diện thành công',
                'avatar' => $user->Avatar
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi tải ảnh: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Lấy thông tin profile của photographer
     */
    public function getPhotographerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Nhiếp ảnh gia') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
        if (!$nag) {
            return response()->json(['message' => 'Không tìm thấy thông tin nhiếp ảnh gia'], 404);
        }

        // Get statistics
        $totalBookings = \App\Models\BuoiChup::where('Ma_NAG', $nag->Ma_NAG)->count();
        $completedBookings = \App\Models\BuoiChup::where('Ma_NAG', $nag->Ma_NAG)
            ->where('Trang_Thai', 'Đã hoàn thành')
            ->count();
        
        // Get rating and review count
        $rating = \Illuminate\Support\Facades\DB::table('danh_gia')
            ->where('Ma_NAG', $nag->Ma_NAG)
            ->avg('So_Sao') ?? 0;
        $reviewCount = \Illuminate\Support\Facades\DB::table('danh_gia')
            ->where('Ma_NAG', $nag->Ma_NAG)
            ->count();

        // Get join date from Thoi_Diem_Tao_TK or created_at
        $joinDate = null;
        if ($user->Thoi_Diem_Tao_TK) {
            $joinDate = is_string($user->Thoi_Diem_Tao_TK) 
                ? date('Y-m-d', strtotime($user->Thoi_Diem_Tao_TK))
                : \Carbon\Carbon::parse($user->Thoi_Diem_Tao_TK)->format('Y-m-d');
        } elseif (isset($user->created_at) && $user->created_at) {
            $joinDate = is_string($user->created_at) 
                ? date('Y-m-d', strtotime($user->created_at))
                : \Carbon\Carbon::parse($user->created_at)->format('Y-m-d');
        }

        // Achievements (can be extended later)
        $achievements = [];
        if ($completedBookings >= 100) {
            $achievements[] = '100+ buổi chụp';
        }
        if ($rating >= 4.5 && $reviewCount >= 50) {
            $achievements[] = 'Đánh giá cao nhất';
        }
        if ($completedBookings >= 50) {
            $achievements[] = 'Top nhiếp ảnh gia';
        }

        // Process avatar URL - file is stored in storage/app/private/public/avatars/
        $avatarUrl = $user->Avatar;
        if ($avatarUrl && !empty($avatarUrl)) {
            // File path in private storage: public/avatars/filename.jpg
            $filePath = str_replace('/storage/', 'public/', $avatarUrl);
            
            // Check if file exists in private storage (storage/app/private/public/avatars/)
            if (Storage::disk('local')->exists($filePath)) {
                // Generate URL to serve file from private storage
                $fileName = basename($avatarUrl);
                $avatarUrl = url('/api/storage/avatars/' . $fileName);
            } else {
                // File doesn't exist, set to null
                $avatarUrl = null;
            }
        }

        // Process cover image URL - file is stored in storage/app/private/public/covers/
        $coverImageUrl = $nag->Anh_Bia;
        if ($coverImageUrl && !empty($coverImageUrl)) {
            $filePath = str_replace('/storage/', 'public/', $coverImageUrl);
            if (Storage::disk('local')->exists($filePath)) {
                $fileName = basename($coverImageUrl);
                $coverImageUrl = url('/api/storage/covers/' . $fileName);
            } else {
                $coverImageUrl = null;
            }
        }

        // Process portfolio URLs - files are stored in storage/app/private/public/portfolio/
        $portfolio = $nag->Portfolio ? json_decode($nag->Portfolio, true) : [];
        $processedPortfolio = [];
        foreach ($portfolio as $portfolioUrl) {
            if ($portfolioUrl && !empty($portfolioUrl)) {
                $filePath = str_replace('/storage/', 'public/', $portfolioUrl);
                if (Storage::disk('local')->exists($filePath)) {
                    $fileName = basename($portfolioUrl);
                    $processedPortfolio[] = url('/api/storage/portfolio/' . $fileName);
                }
            }
        }

        return response()->json([
            'id' => $nag->Ma_NAG,
            'name' => $user->Ho_Ten,
            'email' => $user->Email_TK,
            'phone' => $user->So_ĐT,
            'avatar' => $avatarUrl,
            'coverImage' => $coverImageUrl,
            'location' => $nag->Dia_Diem_Hoat_Dong,
            'experience' => $nag->Kinh_Nghiem,
            'bio' => $user->Gioi_Thieu,
            'styles' => $nag->Boi_Canh_Chup ? json_decode($nag->Boi_Canh_Chup, true) : [],
            'equipment' => $nag->Thiet_Bi ? json_decode($nag->Thiet_Bi, true) : [],
            'priceRange' => [
                'min' => (float) ($nag->Gia_Toi_Thieu ?? 0),
                'max' => (float) ($nag->Gia_Toi_Da ?? 0),
            ],
            'portfolio' => $processedPortfolio,
            'rating' => round((float) $rating, 1),
            'reviewCount' => $reviewCount,
            'totalBookings' => $totalBookings,
            'completedBookings' => $completedBookings,
            'achievements' => $achievements,
            'joinDate' => $joinDate,
        ]);
    }

    /**
     * Cập nhật profile của photographer
     */
    public function updatePhotographerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Nhiếp ảnh gia') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:tai_khoan,Email_TK,' . $user->Ma_TK . ',Ma_TK',
            'phone' => 'required|string|max:15|unique:tai_khoan,So_ĐT,' . $user->Ma_TK . ',Ma_TK',
            'location' => 'nullable|string|max:100',
            'experience' => 'nullable|integer|min:0|max:60',
            'bio' => 'nullable|string|max:500',
            'styles' => 'nullable|array|max:20',
            'styles.*' => 'string|max:50',
            'equipment' => 'nullable|array',
            'equipment.*' => 'string|max:50',
            'priceRange' => 'nullable|array',
            'priceRange.min' => 'nullable|numeric|min:0',
            'priceRange.max' => 'nullable|numeric|min:0',
            'portfolio' => 'nullable|array|max:12',
            'portfolio.*' => 'string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate price range
        if ($request->priceRange && $request->priceRange['min'] > $request->priceRange['max']) {
            return response()->json(['errors' => ['priceRange' => ['Giá từ phải nhỏ hơn hoặc bằng giá đến']]], 422);
        }

        DB::beginTransaction();
        try {
            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if (!$nag) {
                return response()->json(['message' => 'Không tìm thấy thông tin nhiếp ảnh gia'], 404);
            }

            // Lưu dữ liệu cũ để audit log
            $oldData = [
                'name' => $user->Ho_Ten,
                'email' => $user->Email_TK,
                'phone' => $user->So_ĐT,
                'bio' => $user->Gioi_Thieu,
                'location' => $nag->Dia_Diem_Hoat_Dong,
                'experience' => $nag->Kinh_Nghiem,
                'styles' => $nag->Boi_Canh_Chup,
                'equipment' => $nag->Thiet_Bi,
                'priceRange' => [
                    'min' => $nag->Gia_Toi_Thieu,
                    'max' => $nag->Gia_Toi_Da,
                ],
                'portfolio' => $nag->Portfolio,
            ];

            // Cập nhật tai_khoan
            $user->Ho_Ten = $request->name;
            $user->Email_TK = $request->email;
            $user->So_ĐT = $request->phone;
            $user->Gioi_Thieu = $request->bio;
            $user->save();

            // Cập nhật nhiep_anh_gia
            $nag->Dia_Diem_Hoat_Dong = $request->location;
            $nag->Kinh_Nghiem = $request->experience;
            $nag->Boi_Canh_Chup = $request->styles ? json_encode($request->styles) : null;
            $nag->Thiet_Bi = $request->equipment ? json_encode($request->equipment) : null;
            $nag->Gia_Toi_Thieu = $request->priceRange['min'] ?? null;
            $nag->Gia_Toi_Da = $request->priceRange['max'] ?? null;
            $nag->Portfolio = $request->portfolio ? json_encode($request->portfolio) : null;
            $nag->save();

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, $oldData, $request->all(), 'updated');

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật hồ sơ thành công',
                'profile' => $this->getPhotographerProfile($request)->getData()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi khi cập nhật hồ sơ: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload avatar cho photographer
     */
    public function uploadPhotographerAvatar(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Nhiếp ảnh gia') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,jpg,png|max:5120|dimensions:min_width=400,min_height=400',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $oldAvatar = $user->Avatar;
            $file = $request->file('avatar');
            $fileName = 'avatar_' . $user->Ma_TK . '_' . time() . '.' . $file->getClientOriginalExtension();
            // Store in local disk (storage/app/private/public/avatars/)
            $path = $file->storeAs('public/avatars', $fileName, 'local');

            // Save relative path, we'll generate serve URL when reading
            $user->Avatar = '/storage/avatars/' . $fileName;
            $user->save();

            // Xóa ảnh cũ nếu có
            if ($oldAvatar && Storage::exists(str_replace('/storage/', 'public/', $oldAvatar))) {
                Storage::delete(str_replace('/storage/', 'public/', $oldAvatar));
            }

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, ['avatar' => $oldAvatar], ['avatar' => $user->Avatar], 'uploaded');

            return response()->json([
                'message' => 'Tải ảnh đại diện thành công',
                'avatar' => $user->Avatar
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi tải ảnh: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload cover image cho photographer
     */
    public function uploadPhotographerCover(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Nhiếp ảnh gia') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'cover' => 'required|image|mimes:jpeg,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if (!$nag) {
                return response()->json(['message' => 'Không tìm thấy thông tin nhiếp ảnh gia'], 404);
            }

            $oldCover = $nag->Anh_Bia;
            $file = $request->file('cover');
            $fileName = 'cover_' . $user->Ma_TK . '_' . time() . '.' . $file->getClientOriginalExtension();
            // Store in local disk (storage/app/private/public/covers/)
            $path = $file->storeAs('public/covers', $fileName, 'local');

            // Save relative path, we'll generate serve URL when reading
            $nag->Anh_Bia = '/storage/covers/' . $fileName;
            $nag->save();

            // Xóa ảnh cũ nếu có
            if ($oldCover && Storage::exists(str_replace('/storage/', 'public/', $oldCover))) {
                Storage::delete(str_replace('/storage/', 'public/', $oldCover));
            }

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, ['coverImage' => $oldCover], ['coverImage' => $nag->Anh_Bia], 'uploaded');

            return response()->json([
                'message' => 'Tải ảnh bìa thành công',
                'coverImage' => $nag->Anh_Bia
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi tải ảnh: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload portfolio images cho photographer
     */
    public function uploadPhotographerPortfolio(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->Loai_TK !== 'Nhiếp ảnh gia') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'images' => 'required|array|max:12',
            'images.*' => 'image|mimes:jpeg,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $nag = NhiepAnhGia::where('Ma_TK', $user->Ma_TK)->first();
            if (!$nag) {
                return response()->json(['message' => 'Không tìm thấy thông tin nhiếp ảnh gia'], 404);
            }

            $currentPortfolio = $nag->Portfolio ? json_decode($nag->Portfolio, true) : [];
            if (count($currentPortfolio) + count($request->file('images')) > 12) {
                return response()->json(['message' => 'Tối đa 12 ảnh trong portfolio'], 422);
            }

            $uploadedUrls = [];
            foreach ($request->file('images') as $file) {
                $fileName = 'portfolio_' . $user->Ma_TK . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                // Store in local disk (storage/app/private/public/portfolio/)
                $path = $file->storeAs('public/portfolio', $fileName, 'local');
                // Save just the filename or relative path, not full URL
                // We'll generate the serve URL when reading
                $uploadedUrls[] = '/storage/portfolio/' . $fileName;
            }

            $newPortfolio = array_merge($currentPortfolio, $uploadedUrls);
            $nag->Portfolio = json_encode($newPortfolio);
            $nag->save();

            // Ghi audit log
            $this->logAudit($user->Ma_TK, $user->Loai_TK, ['portfolio' => $currentPortfolio], ['portfolio' => $newPortfolio], 'uploaded');

            return response()->json([
                'message' => 'Tải portfolio thành công',
                'portfolio' => $newPortfolio
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi tải portfolio: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Ghi audit log
     */
    private function logAudit($maTk, $loaiTk, $oldData, $newData, $action)
    {
        $device = $this->detectDevice(request()->header('User-Agent'));
        
        foreach ($newData as $field => $newValue) {
            $oldValue = $oldData[$field] ?? null;
            
            if ($oldValue != $newValue) {
                DB::table('profile_audit_log')->insert([
                    'Ma_TK' => $maTk,
                    'Loai_TK' => $loaiTk,
                    'Truong_Thay_Doi' => $field,
                    'Gia_Tri_Cu' => is_array($oldValue) ? json_encode($oldValue) : $oldValue,
                    'Gia_Tri_Moi' => is_array($newValue) ? json_encode($newValue) : $newValue,
                    'Hanh_Dong' => $action,
                    'Ip_Address' => request()->ip(),
                    'User_Agent' => request()->header('User-Agent'),
                    'Thiet_Bi' => $device,
                    'Thoi_Gian' => now(),
                ]);
            }
        }
    }

    /**
     * Phát hiện thiết bị
     */
    private function detectDevice($userAgent)
    {
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    /**
     * Serve avatar file from private storage (storage/app/private/public/avatars/)
     */
    public function serveAvatar($filename)
    {
        // File được lưu trong storage/app/private/public/avatars/
        $filePath = 'public/avatars/' . $filename;
        if (Storage::disk('local')->exists($filePath)) {
            $file = Storage::disk('local')->get($filePath);
            $mimeType = Storage::disk('local')->mimeType($filePath);
            return response($file, 200)->header('Content-Type', $mimeType);
        }
        return response()->json(['message' => 'File not found'], 404);
    }

    /**
     * Serve cover file from private storage (storage/app/private/public/covers/)
     */
    public function serveCover($filename)
    {
        // File được lưu trong storage/app/private/public/covers/
        $filePath = 'public/covers/' . $filename;
        if (Storage::disk('local')->exists($filePath)) {
            $file = Storage::disk('local')->get($filePath);
            $mimeType = Storage::disk('local')->mimeType($filePath);
            return response($file, 200)->header('Content-Type', $mimeType);
        }
        return response()->json(['message' => 'File not found'], 404);
    }

    /**
     * Serve portfolio file from private storage (storage/app/private/public/portfolio/)
     */
    public function servePortfolio($filename)
    {
        // File được lưu trong storage/app/private/public/portfolio/
        $filePath = 'public/portfolio/' . $filename;
        if (Storage::disk('local')->exists($filePath)) {
            $file = Storage::disk('local')->get($filePath);
            $mimeType = Storage::disk('local')->mimeType($filePath);
            return response($file, 200)->header('Content-Type', $mimeType);
        }
        return response()->json(['message' => 'File not found'], 404);
    }
}
