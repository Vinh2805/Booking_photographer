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
};
