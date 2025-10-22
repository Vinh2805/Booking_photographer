import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';

export function PhotographerChangePassword({ onBack }: { onBack: () => void }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<string[]>([]);

  const passwordRequirements = [
    { id: 'length', text: 'Ít nhất 8 ký tự', isValid: passwords.new.length >= 8 },
    { id: 'uppercase', text: 'Có chữ hoa', isValid: /[A-Z]/.test(passwords.new) },
    { id: 'lowercase', text: 'Có chữ thường', isValid: /[a-z]/.test(passwords.new) },
    { id: 'number', text: 'Có số', isValid: /\d/.test(passwords.new) },
    { id: 'special', text: 'Có ký tự đặc biệt', isValid: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new) }
  ];

  const updatePassword = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = () => {
    const newErrors: string[] = [];

    if (!passwords.current) {
      newErrors.push('Vui lòng nhập mật khẩu hiện tại');
    }

    if (!passwords.new) {
      newErrors.push('Vui lòng nhập mật khẩu mới');
    }

    if (passwords.new && passwords.new.length < 8) {
      newErrors.push('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    if (passwords.new && passwords.confirm && passwords.new !== passwords.confirm) {
      newErrors.push('Mật khẩu xác nhận không khớp');
    }

    if (!passwords.confirm) {
      newErrors.push('Vui lòng xác nhận mật khẩu mới');
    }

    const allRequirementsMet = passwordRequirements.every(req => req.isValid);
    if (passwords.new && !allRequirementsMet) {
      newErrors.push('Mật khẩu mới không đáp ứng đủ yêu cầu bảo mật');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleChangePassword = () => {
    if (validatePasswords()) {
      // Mock password change
      alert('Mật khẩu đã được thay đổi thành công!');
      onBack();
    }
  };

  const getStrengthColor = (isValid: boolean) => {
    return isValid ? 'text-green-600' : 'text-gray-400';
  };

  const getStrengthScore = () => {
    return passwordRequirements.filter(req => req.isValid).length;
  };

  const getStrengthText = () => {
    const score = getStrengthScore();
    if (score === 0) return { text: '', color: '' };
    if (score <= 2) return { text: 'Yếu', color: 'text-red-600' };
    if (score <= 3) return { text: 'Trung bình', color: 'text-yellow-600' };
    if (score <= 4) return { text: 'Mạnh', color: 'text-blue-600' };
    return { text: 'Rất mạnh', color: 'text-green-600' };
  };

  const strengthInfo = getStrengthText();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold">Đổi mật khẩu</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Bảo mật tài khoản</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Để bảo vệ tài khoản của bạn, hãy sử dụng mật khẩu mạnh và không chia sẻ với ai khác.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Thay đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mật khẩu hiện tại *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => updatePassword('current', e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => toggleShowPassword('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mật khẩu mới *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => updatePassword('new', e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => toggleShowPassword('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength */}
              {passwords.new && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < getStrengthScore() ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Xác nhận mật khẩu mới *
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => updatePassword('confirm', e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={() => toggleShowPassword('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Match Indicator */}
              {passwords.confirm && (
                <div className="mt-1">
                  {passwords.new === passwords.confirm ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Mật khẩu khớp
                    </p>
                  ) : (
                    <p className="text-xs text-red-600">
                      Mật khẩu không khớp
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yêu cầu mật khẩu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {passwordRequirements.map((requirement) => (
                <div key={requirement.id} className="flex items-center gap-2">
                  <CheckCircle 
                    className={`w-4 h-4 ${getStrengthColor(requirement.isValid)}`}
                  />
                  <span className={`text-sm ${getStrengthColor(requirement.isValid)}`}>
                    {requirement.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
            disabled={!passwords.current || !passwords.new || !passwords.confirm}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
}