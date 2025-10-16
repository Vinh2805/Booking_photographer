import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Camera,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
  Sparkles,
  Shield,
  Award,
  Lock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

interface PhotographerAuthProps {
  onLogin: () => void;
  onBack?: () => void;
}

export function PhotographerAuth({
  onLogin,
  onBack,
}: PhotographerAuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    workLocation: "",
    experience: "",
    equipment: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleSocialLogin = (provider: string) => {
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sky-gradient-soft to-accent/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/3 animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-primary/10 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full bg-primary/8 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header with back button */}
      <div className="p-4 relative z-10">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-primary/10 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chính
          </Button>
        )}
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md mx-auto p-6 relative z-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/20">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-sky-gradient">Momentia</span>{" "}
              <span className="text-primary">Pro</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Nền tảng dành cho nhiếp ảnh gia chuyên nghiệp
            </p>
            
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/20">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Tăng thu nhập</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Bảo mật cao</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Công cụ Pro</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Đăng nhập
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Đăng ký
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                  <CardDescription className="text-base">
                    Truy cập tài khoản nhiếp ảnh gia của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">
                        Email nhiếp ảnh gia
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="photographer@momentia.vn"
                          className="pl-11 h-12 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50"
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
                      <Label htmlFor="login-password" className="text-sm font-medium">
                        Mật khẩu
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-primary/60" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-11 pr-11 h-12 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/50"
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
                          className="absolute right-3 top-3 text-primary/60 hover:text-primary transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      {/* Remember me */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                              setRememberMe(Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor="remember"
                            className="text-sm text-muted-foreground"
                          >
                            Ghi nhớ đăng nhập
                          </Label>
                        </div>
                        <Button
                          variant="link"
                          className="text-sm p-0 h-auto text-primary hover:text-primary/80"
                          onClick={() =>
                            alert("Đã gửi email khôi phục mật khẩu!")
                          }
                        >
                          Quên mật khẩu?
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Đăng nhập
                    </Button>
                  </form>

                  <div className="mt-6 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground">
                          Hoặc đăng nhập bằng
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        onClick={() => handleSocialLogin("google")}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>

                      <Button
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        onClick={() => handleSocialLogin("apple")}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Card className="border-primary/20 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
                  <CardDescription className="text-base">
                    Tham gia cộng đồng nhiếp ảnh gia Momentia Pro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Thông tin cá nhân */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-sm">Thông tin cá nhân</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-sm font-medium">
                            Họ và tên *
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                              id="register-name"
                              placeholder="Nguyễn Văn A"
                              className="pl-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              value={registerForm.fullName}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  fullName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="register-email">Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="email@example.com"
                                className="pl-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={registerForm.email}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    email: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-phone">
                              Số điện thoại *
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                              <Input
                                id="register-phone"
                                type="tel"
                                placeholder="0912345678"
                                className="pl-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={registerForm.phone}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    phone: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-dob">
                            Ngày sinh *
                          </Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                              id="register-dob"
                              type="date"
                              className="pl-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              value={registerForm.dateOfBirth}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  dateOfBirth: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin nghề nghiệp */}
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-sm">Thông tin nghề nghiệp</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-work-location">
                            Địa điểm làm việc chính *
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                              id="register-work-location"
                              placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
                              className="pl-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              value={registerForm.workLocation}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  workLocation: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-experience">
                            Kinh nghiệm chụp ảnh *
                          </Label>
                          <Select
                            value={registerForm.experience}
                            onValueChange={(value) =>
                              setRegisterForm({
                                ...registerForm,
                                experience: value,
                              })
                            }
                            required
                          >
                            <SelectTrigger className="border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Chọn số năm kinh nghiệm" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newbie">Mới bắt đầu (dưới 1 năm)</SelectItem>
                              <SelectItem value="year-1">1 năm</SelectItem>
                              <SelectItem value="year-2">2 năm</SelectItem>
                              <SelectItem value="year-3">3 năm</SelectItem>
                              <SelectItem value="year-4">4 năm</SelectItem>
                              <SelectItem value="year-5-plus">5+ năm</SelectItem>
                              <SelectItem value="expert">Chuyên gia (10+ năm)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-equipment">
                            Thiết bị chụp ảnh chính *
                          </Label>
                          <Input
                            id="register-equipment"
                            placeholder="Canon R5, Sony A7IV, Nikon Z7..."
                            className="border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={registerForm.equipment}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                equipment: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bảo mật */}
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-sm">Bảo mật tài khoản</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-password">
                            Mật khẩu *
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              value={registerForm.password}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  password: e.target.value,
                                })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(!showPassword)
                              }
                              className="absolute right-3 top-3 text-primary/60 hover:text-primary"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password">
                            Xác nhận mật khẩu *
                          </Label>
                          <div className="relative">
                            <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-primary/60" />
                            <Input
                              id="register-confirm-password"
                              type={
                                showConfirmPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="••••••••"
                              className="pl-10 pr-10 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              value={registerForm.confirmPassword}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(
                                  !showConfirmPassword,
                                )
                              }
                              className="absolute right-3 top-3 text-primary/60 hover:text-primary"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Đăng ký tài khoản Pro
                    </Button>

                    {/* Terms */}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Bằng việc đăng ký, bạn đồng ý với{" "}
                      <Button variant="link" className="p-0 h-auto text-xs text-primary">
                        Điều khoản dịch vụ
                      </Button>{" "}
                      và{" "}
                      <Button variant="link" className="p-0 h-auto text-xs text-primary">
                        Chính sách bảo mật
                      </Button>{" "}
                      của Momentia Pro.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}