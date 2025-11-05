import axios from 'axios';

/**
 * ==========================================
 * CẤU HÌNH AXIOS INSTANCE CHUNG
 * ==========================================
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Đã có lỗi xảy ra';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server'));
    } else {
      return Promise.reject(error);
    }
  }
);

/**
 * ==========================================
 * TYPES CHO API THANH TOÁN
 * ==========================================
 */
export interface DepositRequest {
  payment_method: 'vi_ca_nhan' | 'vnpay';
  agree_terms: boolean;
  available?: number;
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
  redirect_url?: string;
}

/**
 * ==========================================
 * API ĐẶT CỌC
 * ==========================================
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

/**
 * ==========================================
 * TYPES CHO THANH TOÁN PHẦN CÒN LẠI
 * ==========================================
 */
export interface FinalQuoteResponse {
  booking: {
    Ma_BC: string;
    Trang_Thai: string;
    Tong_Tien: number;
    'Ti_Le_Coc(%)': number;
  };
  costs: {
    so_tien_con_lai: number;
    phi_dich_vu: number;
    tong_thanh_toan: number;
  };
  payment_methods: ('vi_ca_nhan' | 'vnpay')[];
  must_agree_terms: boolean;
}

export interface FinalPaymentResponse {
  status: 'success' | 'redirect';
  message?: string;
  booking_code: string;
  remain_amount: number;
  service_fee: number;
  total_charge: number;
  transaction_id?: string;
  paid_at?: string;
  redirect_url?: string;
}

/**
 * ==========================================
 * API LẤY BÁO GIÁ THANH TOÁN PHẦN CÒN LẠI
 * GET /buoi-chup/{ma_bc}/thanh-toan/bao-gia
 * ==========================================
 */
export async function getFinalQuote(
  ma_bc: string,
  method: 'vi_ca_nhan' | 'vnpay' = 'vnpay'
): Promise<FinalQuoteResponse> {
  const response = await apiClient.get<FinalQuoteResponse>(
    `/buoi-chup/${ma_bc}/thanh-toan/quote`,
    { params: { payment_method: method } }
  );
  return response.data;
}

/**
 * ==========================================
 * API THANH TOÁN PHẦN CÒN LẠI
 * POST /buoi-chup/{ma_bc}/thanh-toan
 * ==========================================
 */
export async function payFinal(
  ma_bc: string,
  data: DepositRequest
): Promise<FinalPaymentResponse> {
  const response = await apiClient.post<FinalPaymentResponse>(
    `/buoi-chup/${ma_bc}/thanh-toan`,
    data
  );
  return response.data;
}

/**
 * ==========================================
 * EXPORT MẶC ĐỊNH
 * ==========================================
 */
export default apiClient;
