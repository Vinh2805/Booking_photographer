import apiClient from "./apiClient";

export const photographerApi = {
  async getDashboard(maTk: string) {
    const res = await apiClient.get(`/photographer/dashboard/${maTk}`);
    return res.data;
  },
  async getUpcomingBookings(maTk: string) {
    const res = await apiClient.get(`/photographer/${maTk}/bookings`);
    return res.data;
  },

  // Profile management
  async getProfile() {
    const response = await apiClient.get("/profile/photographer");
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await apiClient.put("/profile/photographer", data);
    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient.post("/profile/photographer/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadCover(file: File) {
    const formData = new FormData();
    formData.append("cover", file);
    const response = await apiClient.post("/profile/photographer/cover", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadPortfolio(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images[]", file);
    });
    const response = await apiClient.post("/profile/photographer/portfolio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
