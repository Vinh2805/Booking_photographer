import React from "react";
import { Button } from "./ui/button";
import {
  X,
  Home,
  Calendar,
  MessageCircle,
  User,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

type TabKey =
  | "home"
  | "bookings"
  | "messages"
  | "profile"
  | "settings"
  | "logout";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  /** tab hiện tại do parent điều khiển */
  currentSection: Exclude<TabKey, "logout">;
}

export function UserSidebar({
  isOpen,
  onClose,
  onNavigate,
  currentSection,
}: UserSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // ESC để đóng
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const firstButton =
        sidebarRef.current.querySelector("button");
      if (firstButton)
        setTimeout(
          () => (firstButton as HTMLButtonElement).focus(),
          80,
        );
    }
  }, [isOpen]);

  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Ripple effect
  const makeRipple = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.left = x + "px";
    span.style.top = y + "px";
    target.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  };

  const active = currentSection; // <- HIGHLIGHT lấy từ parent

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-slate-200 dark:border-slate-700`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  NTH
                </span>
              </div>
              <div>
                <h3
                  id="sidebar-title"
                  className="font-semibold text-sm"
                >
                  Nguyễn Thị Hương
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium">
                    VIP
                  </span>
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      2.5Mđ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            {/* CSS inline cho active + indicator + ripple */}
            <style>{`
              .nav-btn { position: relative; overflow: hidden; }
              .nav-btn .active-bg {
                position:absolute; inset:0;
                background: linear-gradient(90deg, rgba(56,189,248,0.14), rgba(99,102,241,0.10));
                opacity:0; transform: scale(0.98);
                transition: opacity .22s ease, transform .22s ease;
                pointer-events:none; border-radius: 0.75rem;
              }
              .nav-btn[data-active="true"] .active-bg { opacity:1; transform: scale(1); }

              .nav-btn .indicator {
                position:absolute; left:10px; top:50%; width:4px; height:60%;
                border-radius:9999px; transform:translateY(-50%) scaleY(0);
                background: linear-gradient(180deg, #22d3ee, #6366f1);
                box-shadow: 0 0 12px rgba(56,189,248,.35);
                transition: transform .22s ease;
              }
              .nav-btn[data-active="true"] .indicator { transform:translateY(-50%) scaleY(1); }

              .nav-btn .ripple {
                position:absolute; border-radius:9999px; transform:translate(-50%,-50%);
                background: currentColor; opacity:.18; pointer-events:none;
                animation: ripple .6s ease-out forwards; mix-blend: screen;
              }
              @keyframes ripple {
                from { width:0; height:0; opacity:.18; }
                to { width:420px; height:420px; opacity:0; }
              }
            `}</style>

            <nav className="space-y-2">
              {/* TẤT CẢ ĐỀU variant="ghost". Nền chỉ hiện khi data-active=true */}
              <Button
                variant="ghost"
                data-active={active === "home"}
                onMouseDown={makeRipple}
                className={`nav-btn w-full justify-start gap-3 h-12 rounded-xl
                            ${
                              active === "home"
                                ? "text-foreground bg-white/10 dark:bg-white/5 ring-1 ring-sky-400/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                onClick={() => {
                  onNavigate("home");
                  onClose();
                }}
              >
                <span className="active-bg" aria-hidden />
                <span className="indicator" aria-hidden />
                <Home className="w-5 h-5" />
                Trang chủ
              </Button>

              <Button
                variant="ghost"
                data-active={active === "bookings"}
                onMouseDown={makeRipple}
                className={`nav-btn w-full justify-start gap-3 h-12 rounded-xl
                            ${
                              active === "bookings"
                                ? "text-foreground bg-white/10 dark:bg-white/5 ring-1 ring-sky-400/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                onClick={() => {
                  onNavigate("bookings");
                  onClose();
                }}
              >
                <span className="active-bg" aria-hidden />
                <span className="indicator" aria-hidden />
                <Calendar className="w-5 h-5" />
                Buổi chụp
                <div className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 text-white text-[12px] px-2">
                  8
                </div>
              </Button>

              <Button
                variant="ghost"
                data-active={active === "messages"}
                onMouseDown={makeRipple}
                className={`nav-btn w-full justify-start gap-3 h-12 rounded-xl relative
                            ${
                              active === "messages"
                                ? "text-foreground bg-white/10 dark:bg-white/5 ring-1 ring-sky-400/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                onClick={() => {
                  onNavigate("messages");
                  onClose();
                }}
              >
                <span className="active-bg" aria-hidden />
                <span className="indicator" aria-hidden />
                <MessageCircle className="w-5 h-5" />
                Tin nhắn
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  12
                </div>
              </Button>

              <Button
                variant="ghost"
                data-active={active === "profile"}
                onMouseDown={makeRipple}
                className={`nav-btn w-full justify-start gap-3 h-12 rounded-xl
                            ${
                              active === "profile"
                                ? "text-foreground bg-white/10 dark:bg-white/5 ring-1 ring-sky-400/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                onClick={() => {
                  onNavigate("profile");
                  onClose();
                }}
              >
                <span className="active-bg" aria-hidden />
                <span className="indicator" aria-hidden />
                <User className="w-5 h-5" />
                Hồ sơ
              </Button>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="ghost"
                  data-active={active === "settings"}
                  onMouseDown={makeRipple}
                  className={`nav-btn w-full justify-start gap-3 h-12 rounded-xl
                              ${
                                active === "settings"
                                  ? "text-foreground bg-white/10 dark:bg-white/5 ring-1 ring-sky-400/30"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                              }`}
                  onClick={() => {
                    onNavigate("settings");
                    onClose();
                  }}
                >
                  <span className="active-bg" aria-hidden />
                  <span className="indicator" aria-hidden />
                  <Settings className="w-5 h-5" />
                  Cài đặt
                </Button>

                <Button
                  variant="ghost"
                  onMouseDown={makeRipple}
                  className="nav-btn w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  onClick={() => {
                    onNavigate("logout");
                    onClose();
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </Button>
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-muted-foreground text-center">
              Momentia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}