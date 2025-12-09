import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Shield, Eye, EyeOff, Mail } from "lucide-react";

interface AdminAuthProps {
  onLogin: () => void;
}

export function AdminAuth({ onLogin }: AdminAuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(loginForm)
        });

        const data = await response.json();

        if (response.ok) {
            // Save token
            localStorage.setItem("admin_token", data.token);
            localStorage.setItem("admin_info", JSON.stringify(data.user));
            onLogin();
        } else {
            setError(data.message || "Đăng nhập thất bại");
        }
    } catch (err) {
        setError("Lỗi kết nối server");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-center mb-8 pt-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Momentia Admin
        </h1>
        <p className="text-gray-600">Quản lý hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập quản trị</CardTitle>
          <CardDescription>Truy cập bảng điều khiển quản trị</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Nhập email quản trị"
                  className="pl-10"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean) =>
                    setRememberMe(Boolean(checked))
                  }
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Lưu mật khẩu
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="link"
              className="w-full text-sm"
              onClick={() =>
                alert("Liên hệ quản trị cấp cao để khôi phục mật khẩu!")
              }
            >
              Quên mật khẩu?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
