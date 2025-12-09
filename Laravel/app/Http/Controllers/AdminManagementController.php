<?php

namespace App\Http\Controllers;

use App\Models\NhiepAnhGia;
use App\Models\KhachHang;
use App\Models\BuoiChup;
use App\Models\Admin;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminManagementController extends Controller
{
    // =============================
    // 📸 PHOTOGRAPHER MANAGEMENT
    // =============================

    /**
     * List all photographers with optional status filter
     */
    public function getPhotographers(Request $request)
    {
        $status = $request->query('status'); // 'Pending', 'Approved', 'Rejected', 'Locked'

        $query = NhiepAnhGia::with('taiKhoan');

        if ($status) {
            $query->where('Trang_Thai', $status);
        }

        $photographers = $query->orderBy('Ma_NAG', 'desc')->paginate(20);

        return response()->json($photographers);
    }

    /**
     * Approve or Reject a photographer
     */
    public function updatePhotographerStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected,Locked,Pending',
            'reason' => 'nullable|string' // For rejection
        ]);

        $nag = NhiepAnhGia::findOrFail($id);
        $nag->Trang_Thai = $validated['status'];
        $nag->save();
        
        // Update User account status as well if Locked
        // if ($validated['status'] === 'Locked') {
        //     $nag->taiKhoan->update(['Trang_Thai' => 'Locked']);
        // }

        return response()->json([
            'message' => "Đã cập nhật trạng thái thành công: {$validated['status']}",
            'photographer' => $nag
        ]);
    }
    
    public function deletePhotographer($id) {
        $nag = NhiepAnhGia::findOrFail($id);
        // Soft delete or hard delete logic
        // For now, we might want to just Lock them instead of deleting to preserve history
        // But if user requested CRUD delete, we can delete.
        // Warning: Deleting might break foreign keys in bookings.
        // Safer to just delete the Account (User)?
        
        // Let's implement Delete as Deleting the User account (Cascade)
        $user = $nag->taiKhoan;
        if ($user) {
             $user->delete(); // This should cascade if set up, or we manually delete
        }
        $nag->delete();
        
        return response()->json(['message' => 'Đã xóa nhiếp ảnh gia']);
    }

    // =============================
    // 👤 CUSTOMER MANAGEMENT
    // =============================

    public function getCustomers(Request $request)
    {
        $search = $request->query('search');

        $query = KhachHang::with('taiKhoan');

        if ($search) {
            $query->whereHas('taiKhoan', function($q) use ($search) {
                $q->where('Ho_Ten', 'like', "%{$search}%")
                  ->orWhere('Email_TK', 'like', "%{$search}%");
            });
        }
        
        $customers = $query->orderBy('Ma_KH', 'desc')->paginate(20);

        return response()->json($customers);
    }
    
    public function updateCustomerStatus(Request $request, $id) 
    {
        $validated = $request->validate([
             'status' => 'required|in:Active,Locked'
        ]);
        
        $customer = KhachHang::findOrFail($id);
        $user = $customer->taiKhoan;
        
        if ($user) {
            $user->Trang_Thai = $validated['status'] === 'Active' ? 'Active' : 'Locked'; // Enum pending check
            $user->save();
        }
        
        return response()->json(['message' => 'Đã cập nhật trạng thái khách hàng']);
    }
    
    public function deleteCustomer($id) {
        $customer = KhachHang::findOrFail($id);
        if ($customer->taiKhoan) {
            $customer->taiKhoan->delete();
        }
        $customer->delete();
        return response()->json(['message' => 'Đã xóa khách hàng']);
    }
    
    // =============================
    // 📅 BOOKING MANAGEMENT
    // =============================
    
    public function getBookings(Request $request)
    {
         $status = $request->query('status');
         
         $query = BuoiChup::with(['khachHang.taiKhoan', 'nhaNhiepAnh.taiKhoan']);
         
         if ($status) {
             $query->where('Trang_Thai', $status);
         }
         
         $bookings = $query->orderBy('Ngay_Tao', 'desc')->paginate(20);
         
         return response()->json($bookings);
    }
    
    public function updateBookingStatus(Request $request, $id)
    {
        $validated = $request->validate([
             'status' => 'required|string'
        ]);
        
        $booking = BuoiChup::findOrFail($id);
        $booking->Trang_Thai = $validated['status'];
        $booking->save();
        
        return response()->json(['message' => 'Đã cập nhật trạng thái booking']);
    }

    // =============================
    // 💰 ADMIN WALLET
    // =============================

    public function getWalletInfo(Request $request) 
    {
        // Assume single admin or use authenticated admin
        // For simplicity, finding first admin or based on auth user
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $admin = Admin::where('Ma_TK', $user->Ma_TK)->first();

        if (!$admin) {
             // Fallback: Try to find ANY admin record if system is single-admin based on setup
             // But security-wise better to stick to auth.
             // If seed didn't work for current user, return 0
             return response()->json([
                 'balance' => 0,
                 'transactions' => []
             ]);
        }

        $transactions = WalletTransaction::where('Loai_Nguoi_Dung', 'admin')
            ->where('Ma_Nguoi_Dung', $admin->Ma_Admin)
            ->orderBy('Thoi_Gian', 'desc')
            ->take(50)
            ->get();

        return response()->json([
            'balance' => $admin->So_Du,
            'transactions' => $transactions
        ]);
    }





    /**
     * Rút tiền: Yêu cầu thông tin ngân hàng giống WalletController
     */
    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50000',
            'bank_account' => 'required|string',
            'bank_name' => 'nullable|string',
            'account_holder_name' => 'required|string'
        ]);

        $user = $request->user();
        // Helper logic to find OR create admin profile
        $admin = Admin::where('Ma_TK', $user->Ma_TK)->first();
        
        if (!$admin) {
            // Auto-create Admin profile if missing (Lazy Creation)
            $admin = new Admin();
            $admin->Ma_Admin = 'ADM' . now()->format('YmdHis') . rand(10, 99);
            $admin->Ma_TK = $user->Ma_TK;
            $admin->So_Du = 0;
            $admin->save();
        }

        $amount = (float) $validated['amount'];

        if ($admin->So_Du < $amount) {
            return response()->json(['message' => 'Số dư không đủ'], 400);
        }

        $soDuTruoc = (float) $admin->So_Du;
        $admin->So_Du = $soDuTruoc - $amount;
        $admin->save();

        $withdrawalId = 'WTH-' . now()->format('YmdHis') . rand(100, 999);

        WalletTransaction::createTransaction(
            'admin',
            $admin->Ma_Admin,
            'rut_tien',
            $amount,
            $soDuTruoc,
            $admin->So_Du,
            null,
            null,
            "Rút tiền: " . number_format($amount, 0, ',', '.') . ' đ',
            $validated['bank_account'],
            $validated['bank_name'],
            $validated['account_holder_name'],
            $withdrawalId
        );

        return response()->json([
            'success' => true,
            'message' => 'Rút tiền thành công',
            'balance' => $admin->So_Du
        ]);
    }
}
