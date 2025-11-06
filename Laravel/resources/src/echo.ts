import Echo from "laravel-echo";
import Pusher from "pusher-js";

// @ts-ignore
window.Pusher = Pusher;

// @ts-ignore
window.Echo = new Echo({
  broadcaster: "pusher",
  key: (import.meta as any).env.VITE_PUSHER_APP_KEY,
  cluster: (import.meta as any).env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,
  
});
