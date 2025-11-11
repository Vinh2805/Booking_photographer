import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, 
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    // Ưu tiên customer_token, sau đó photographer_token
    const customerToken = localStorage.getItem("customer_token");
    const photographerToken = localStorage.getItem("photographer_token");
    const token = customerToken || photographerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: chỉ log trong development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔑 [${config.method?.toUpperCase()}] ${config.url} - Token: ${token.substring(0, 20)}...`);
      }
    } else {
      console.warn("⚠️ Không tìm thấy token trong localStorage cho request:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và redirect về trang đăng nhập
      localStorage.removeItem("customer_token");
      localStorage.removeItem("photographer_token");
      localStorage.removeItem("customer_info");
      localStorage.removeItem("photographer_info");
      // Có thể redirect về trang đăng nhập ở đây nếu cần
    }
    return Promise.reject(error);
  }
);

export default apiClient;
