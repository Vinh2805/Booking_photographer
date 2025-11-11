"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={5}
      zIndex={9999}
      toastOptions={{
        duration: 5000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      }}
    />
  );
};

export { Toaster };
