import apiClient from "./apiClient";

export interface ChatMessage {
  Ma_TN: string;
  Ma_BC: string;
  Noi_Dung: string;
  Ma_KH?: string;
  Ma_NAG?: string;
  Loai_Tin?: string;
  Trang_Thai?: string;
  Gui_Luc?: string;
}

export interface SendMessagePayload {
  Ma_BC: string;
  Noi_Dung: string;
  Loai_Tin?: string;
  // Không cần Ma_KH và Ma_NAG nữa, backend tự động xác định từ token
}

const chatApi = {
  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const res = await apiClient.post<ChatMessage>("/chat", payload);
    return res.data;
  },

  async getMessagesByBooking(Ma_BC: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(`/chat/${Ma_BC}`);
    return res.data;
  },

  async getUnreadMessages(): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(`/chat/unread`);
    return res.data;
  },

  async markAsRead(payload: { Ma_BC?: string; ids?: string[] }): Promise<{ message: string; updated: number }> {
    const res = await apiClient.post<{ message: string; updated: number }>(`/chat/mark-read`, payload);
    return res.data;
  },
};

export default chatApi;
