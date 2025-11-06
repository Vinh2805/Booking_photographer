import Echo from "laravel-echo";
import Pusher from "pusher-js";

export {};

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}
