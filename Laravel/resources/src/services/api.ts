import axios from 'axios';

// Cấu hình axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      const message = error.response.data?.message || 'Đã có lỗi xảy ra';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return Promise.reject(new Error('Không thể kết nối đến server'));
    } else {
      // Lỗi khi setup request
      return Promise.reject(error);
    }
  }
);

// Types cho API
export interface DepositRequest {
  payment_method: 'vi_ca_nhan' | 'vnpay';
  agree_terms: boolean;
  available?: number; // Số tiền có sẵn trong ví (cho ví cá nhân)
  email?: string;
}

export interface DepositResponse {
  status: 'success' | 'redirect';
  message: string;
  booking_code: string;
  deposit_amount: number;
  service_fee: number;
  total_charge: number;
  transaction_id?: string;
  paid_at?: string;
  redirect_url?: string; // Chỉ có khi payment_method là 'vnpay'
}

/**
 * API đặt cọc
 * @param ma_bc Mã buổi chụp
 * @param data Dữ liệu đặt cọc
 */
export async function depositBooking(
  ma_bc: string,
  data: DepositRequest
): Promise<DepositResponse> {
  const response = await apiClient.post<DepositResponse>(
    `/buoi-chup/${ma_bc}/dat-coc`,
    data
  );
  return response.data;
}

export default apiClient;

