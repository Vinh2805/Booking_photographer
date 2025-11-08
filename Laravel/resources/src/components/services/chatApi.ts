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
  Ma_KH?: string;
  Ma_NAG?: string;
  Loai_Tin?: string;
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

  async getUnreadMessages(Ma_TK: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(`/chat/unread/${Ma_TK}`);
    return res.data;
  },

  async markAsRead(Ma_BC: string): Promise<void> {
    await apiClient.post(`/chat/mark-as-read`, { Ma_BC });
  },
};

export default chatApi;
