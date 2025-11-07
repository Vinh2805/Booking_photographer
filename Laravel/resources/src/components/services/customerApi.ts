import apiClient from "./apiClient";

const customerApi = {
  // Lấy thống kê dashboard
  async getDashboard() {
    return apiClient.get("/khach-hang/dashboard");
  },

  // Lấy danh sách nhiếp ảnh gia gợi ý hoặc nổi bật
  async getTopPhotographers() {
    return apiClient.get("/nhiep-anh-gia/noi-bat");
  },

  // Lấy tin nhắn chưa đọc
  async getUnreadMessages() {
    return apiClient.get("/tin-nhan/chua-doc");
  },
};

export default customerApi;
