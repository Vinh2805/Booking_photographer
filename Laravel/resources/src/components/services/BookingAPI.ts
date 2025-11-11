import apiClient from "./apiClient";

/**
 * ==========================================
 * TYPES CHO API BOOKING ACTIONS
 * ==========================================
 */

export interface ConfirmResponse {
  status: "success";
  message: string;
  data: {
    ma_buoi_chup: string;
    trang_thai: string;
    thong_bao: string;
    icon: string;
  };
}

export interface RejectRequest {
  ly_do: string;
}

export interface RejectResponse {
  status: "success";
  message: string;
  data: {
    ma_buoi_chup: string;
    ly_do: string;
    thong_bao: string;
    icon: string;
  };
}

export interface CancelRequest {
  ly_do: string;
}

export interface CancelResponse {
  status: "success";
  title: string;
  message: string;
  data: {
    ma_buoi_chup: string;
    ly_do: string;
    thoi_gian_con_lai: string;
    tien_coc: number;
    so_tien_hoan: number;
    ghi_chu: string;
    icon: string;
    canh_bao: string;
  };
}

export interface ChangeRequest {
  thay_doi: Record<string, any>;
  ly_do: string;
}

export interface ChangeResponse {
  status: "success";
  title: string;
  message: string;
  data: {
    ma_buoi_chup: string;
    thay_doi: Record<string, { cu: any; moi: any }>;
    ly_do: string;
  };
  icon: string;
}

export interface StartEndResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ChangeApprovalRequest {
  ly_do?: string;
}

export interface ChangeApprovalResponse {
  status: "success";
  message: string;
  icon: string;
}

/**
 * ==========================================
 * API XÁC NHẬN BUỔI CHỤP (Nhiếp ảnh gia)
 * POST /booking/{ma_bc}/confirm
 * ==========================================
 */
export async function confirmBooking(ma_bc: string): Promise<ConfirmResponse> {
  const response = await apiClient.post<ConfirmResponse>(
    `/booking/${ma_bc}/confirm`
  );
  return response.data;
}

/**
 * ==========================================
 * API TỪ CHỐI BUỔI CHỤP (Nhiếp ảnh gia)
 * POST /booking/{ma_bc}/reject
 * ==========================================
 */
export async function rejectBooking(
  ma_bc: string,
  data: RejectRequest
): Promise<RejectResponse> {
  const response = await apiClient.post<RejectResponse>(
    `/booking/${ma_bc}/reject`,
    data
  );
  return response.data;
}

/**
 * ==========================================
 * API HỦY BUỔI CHỤP (Khách hàng)
 * POST /booking/{ma_bc}/cancel
 * ==========================================
 */
export async function cancelBooking(
  ma_bc: string,
  data: CancelRequest
): Promise<CancelResponse> {
  const response = await apiClient.post<CancelResponse>(
    `/booking/${ma_bc}/cancel`,
    data
  );
  return response.data;
}

/**
 * ==========================================
 * API YÊU CẦU THAY ĐỔI BUỔI CHỤP (Khách hàng)
 * POST /booking/{ma_bc}/change
 * ==========================================
 */
export async function requestChange(
  ma_bc: string,
  data: ChangeRequest
): Promise<ChangeResponse> {
  const response = await apiClient.post<ChangeResponse>(
    `/booking/${ma_bc}/change`,
    data
  );
  return response.data;
}

/**
 * ==========================================
 * API LẤY DANH SÁCH YÊU CẦU THAY ĐỔI CHỜ DUYỆT
 * GET /booking/change-requests/pending
 * ==========================================
 */
export interface PendingChangeRequest {
  id: number;
  ma_bc: string;
  booking: {
    id: string;
    title: string;
    location: string;
    date: string;
  };
  changes: Record<string, { cu: any; moi: any }>;
  ly_do: string;
  nguoi_gui: 'customer' | 'photographer';
  ngay_tao: string;
}

export interface PendingChangeRequestsResponse {
  success: boolean;
  data: PendingChangeRequest[];
}

export async function getPendingChangeRequests(): Promise<PendingChangeRequestsResponse> {
  const response = await apiClient.get<PendingChangeRequestsResponse>(
    '/booking/change-requests/pending'
  );
  return response.data;
}

/**
 * ==========================================
 * API DUYỆT YÊU CẦU THAY ĐỔI (Cả khách hàng và nhiếp ảnh gia)
 * PUT /booking/change/{id}/approve
 * ==========================================
 */
export async function approveChangeRequest(
  id: number
): Promise<ChangeApprovalResponse> {
  const response = await apiClient.put<ChangeApprovalResponse>(
    `/booking/change/${id}/approve`
  );
  return response.data;
}

/**
 * ==========================================
 * API TỪ CHỐI YÊU CẦU THAY ĐỔI (Nhiếp ảnh gia)
 * PUT /booking/change/{id}/reject
 * ==========================================
 */
export async function rejectChangeRequest(
  id: number,
  data?: ChangeApprovalRequest
): Promise<ChangeApprovalResponse> {
  const response = await apiClient.put<ChangeApprovalResponse>(
    `/booking/change/${id}/reject`,
    data || {}
  );
  return response.data;
}

/**
 * ==========================================
 * API BẮT ĐẦU BUỔI CHỤP (Nhiếp ảnh gia)
 * POST /buoi-chup/{id}/start
 * ==========================================
 */
export async function startBooking(id: string): Promise<StartEndResponse> {
  const response = await apiClient.post<StartEndResponse>(
    `/buoi-chup/${id}/start`
  );
  return response.data;
}

/**
 * ==========================================
 * API TẠO YÊU CẦU ĐẶT LỊCH (Khách hàng)
 * POST /booking/create
 * ==========================================
 */
export interface CreateBookingRequest {
  Ma_NAG: string;
  Loai_Chup?: string;
  Dia_Diem?: string;
  Bat_Dau_Chup: string; // ISO date string
  Ket_Thuc_Chup: string; // ISO date string
  Ghi_Chu?: string;
}

export interface CreateBookingResponse {
  status: 'success';
  message: string;
  data: {
    ma_buoi_chup: string;
    trang_thai: string;
  };
}

export async function createBooking(
  data: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const response = await apiClient.post<CreateBookingResponse>(
    '/booking/create',
    data
  );
  return response.data;
}

/**
 * ==========================================
 * API KẾT THÚC BUỔI CHỤP (Nhiếp ảnh gia)
 * POST /buoi-chup/{id}/end
 * ==========================================
 */
export async function endBooking(id: string): Promise<StartEndResponse> {
  const response = await apiClient.post<StartEndResponse>(
    `/buoi-chup/${id}/end`
  );
  return response.data;
}

/**
 * ==========================================
 * API HOÀN THÀNH XỬ LÝ ẢNH (Nhiếp ảnh gia)
 * POST /buoi-chup/{id}/complete-processing
 * ==========================================
 */
export async function completeProcessing(id: string): Promise<StartEndResponse> {
  const response = await apiClient.post<StartEndResponse>(
    `/buoi-chup/${id}/complete-processing`
  );
  return response.data;
}

/**
 * ==========================================
 * API ĐÁNH GIÁ NHIẾP ẢNH GIA
 * ==========================================
 */
export interface CreateReviewRequest {
  So_Sao: number; // 1-5
  Noi_Dung?: string;
}

export interface CreateReviewResponse {
  status: 'success';
  message: string;
  data: {
    ma_danh_gia: string;
    so_sao: number;
    noi_dung: string | null;
  };
}

export interface GetReviewResponse {
  hasReview: boolean;
  review: {
    ma_danh_gia: string;
    so_sao: number;
    noi_dung: string | null;
    ngay_danh_gia: string;
  } | null;
}

export async function createReview(
  ma_bc: string,
  data: CreateReviewRequest
): Promise<CreateReviewResponse> {
  const response = await apiClient.post<CreateReviewResponse>(
    `/booking/${ma_bc}/review`,
    data
  );
  return response.data;
}

export async function getReview(ma_bc: string): Promise<GetReviewResponse> {
  const response = await apiClient.get<GetReviewResponse>(
    `/booking/${ma_bc}/review`
  );
  return response.data;
}

/**
 * ==========================================
 * EXPORT MẶC ĐỊNH
 * ==========================================
 */
export default {
  confirmBooking,
  rejectBooking,
  cancelBooking,
  requestChange,
  approveChangeRequest,
  rejectChangeRequest,
  startBooking,
  endBooking,
  completeProcessing,
  createReview,
  getReview,
};

