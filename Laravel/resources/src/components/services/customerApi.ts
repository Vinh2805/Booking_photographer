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

  // Profile management
  async getProfile() {
    const response = await apiClient.get("/profile/customer");
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await apiClient.put("/profile/customer", data);
    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient.post("/profile/customer/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default customerApi;
