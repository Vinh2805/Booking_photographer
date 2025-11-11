import Echo from "laravel-echo";
import Pusher from "pusher-js";

// @ts-ignore
window.Pusher = Pusher;

// Lấy token từ localStorage
const getAuthToken = () => {
  const customerToken = localStorage.getItem("customer_token");
  const photographerToken = localStorage.getItem("photographer_token");
  return customerToken || photographerToken;
};

// Lấy Ma_TK từ user info
const getUserIdentifier = () => {
  const customerInfo = localStorage.getItem("customer_info");
  const photographerInfo = localStorage.getItem("photographer_info");
  
  if (customerInfo) {
    try {
      const info = JSON.parse(customerInfo);
      return info.Ma_KH || info.Ma_TK;
    } catch (e) {
      return null;
    }
  }
  
  if (photographerInfo) {
    try {
      const info = JSON.parse(photographerInfo);
      return info.Ma_NAG || info.Ma_TK;
    } catch (e) {
      return null;
    }
  }
  
  return null;
};

// @ts-ignore
window.Echo = new Echo({
  broadcaster: "pusher",
  key: (import.meta as any).env.VITE_PUSHER_APP_KEY,
  cluster: (import.meta as any).env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "application/json",
    },
  },
});

export default window.Echo;
