import apiClient from "./apiClient";

export interface ChatMessage {
  Ma_TN: string;
  Ma_BC: string;
  Noi_Dung: string;
  Ma_KH?: string;
  Ma_NAG?: string;
  Ma_Admin?: string;
  Loai_Tin?: string;
  Trang_Thai?: string;
  Gui_Luc?: string;
  Pham_Vi?: "general" | "admin_customer" | "admin_photographer";
}

export interface SendMessagePayload {
  Ma_BC?: string | null;
  Noi_Dung: string;
  Loai_Tin?: string;
  Pham_Vi?: "general" | "admin_customer" | "admin_photographer";
  ReceiverId?: string; // ID người nhận (nếu chat user-centric)
}

const chatApi = {
  async getConversations(): Promise<{ customers: any[], photographers: any[] }> {
    const token = localStorage.getItem("admin_token");
    const res = await apiClient.get<{ customers: any[], photographers: any[] }>("/admin/conversations", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async getMessagesByUser(userId: string): Promise<ChatMessage[]> {
    const token = localStorage.getItem("admin_token");
    const res = await apiClient.get<ChatMessage[]>(`/admin/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  async sendMessage(payload: SendMessagePayload, token?: string): Promise<ChatMessage> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const res = await apiClient.post<ChatMessage>("/chat", payload, config);
    return res.data;
  },


  async getMessagesByBooking(Ma_BC: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(`/chat/${Ma_BC}`);
    return res.data;
  },

  async getSupportMessages(): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>("/chat/support");
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
