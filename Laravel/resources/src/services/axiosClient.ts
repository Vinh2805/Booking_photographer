import axios, { AxiosInstance } from "axios";

/**
 * ==========================================
 * CẤU HÌNH AXIOS INSTANCE CHUNG
 * ==========================================
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

/**
 * ==========================================
 * INTERCEPTORS XỬ LÝ LỖI CHUNG
 * ==========================================
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || "Đã có lỗi xảy ra";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error("Không thể kết nối đến server"));
    } else {
      return Promise.reject(error);
    }
  }
);
// axiosClient.interceptors.request.use((config: AxiosRequestConfig) => {
//   const token = localStorage.getItem("token");
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
export default axiosClient;
