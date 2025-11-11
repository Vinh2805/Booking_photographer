import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import {
  validateEmail,
  validatePhone,
  normalizeName,
  validateName,
  formatPhone,
  formatDate,
  parseDate,
  validateImageFile,
  createCircularImage,
  getDeviceInfo,
} from "../../utils/profileValidation";
import customerApi from "../services/customerApi";
import React from "react";

interface CustomerEditProfileProps {
  onBack?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  bio: string;
  avatar: string;
  favoriteGenres: string[];
  favoriteLocations: string[];
}

const AVAILABLE_GENRES = [
  "Gia đình",
  "Cưới",
  "Couple",
  "Chân dung",
  "Maternity",
  "Sự kiện",
  "Fashion",
  "Lifestyle",
  "Trẻ em",
  "Newborn",
  "Pre-wedding",
  "Engagement",
  "Doanh nghiệp",
  "Sản phẩm",
  "Food",
  "Kiến trúc",
  "Thể thao",
  "Du lịch",
  "Nghệ thuật",
  "Street",
];

const AVAILABLE_LOCATIONS = [
  "Studio",
  "Ngoài trời",
  "Bãi biển",
  "Công viên",
  "Phố cổ",
  "Café",
  "Tại nhà",
  "Resort",
  "Núi rừng",
  "Thành phố",
  "Nông thôn",
  "Sân vườn",
  "Quán cà phê",
  "Nhà hàng",
  "Khách sạn",
  "Bảo tàng",
  "Trung tâm thương mại",
  "Công viên giải trí",
  "Sân bay",
  "Ga tàu",
];

const POPULAR_LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nha Trang",
  "Huế",
  "Vũng Tàu",
  "Phú Quốc",
  "Đà Lạt",
];

export function CustomerEditProfile({ onBack }: CustomerEditProfileProps) {
  const [originalData, setOriginalData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    bio: "",
    avatar: "",
    favoriteGenres: [],
    favoriteLocations: [],
  });

  const [formData, setFormData] = useState<FormData>({ ...originalData });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);

  // Avatar upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
  );

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await customerApi.getProfile();
        const data: FormData = {
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          dateOfBirth: profile.dateOfBirth || "",
          bio: profile.bio || "",
          avatar: profile.avatar || "",
          favoriteGenres: profile.favoriteGenres || [],
          favoriteLocations: profile.favoriteLocations || [],
        };
        setOriginalData(data);
        setFormData(data);
        if (data.dateOfBirth) {
          // Parse YYYY-MM-DD to Date, avoiding timezone issues
          const dateParts = data.dateOfBirth.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
            const day = parseInt(dateParts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              setSelectedDate(date);
            }
          }
        } else {
          setSelectedDate(undefined);
        }
      } catch (error: any) {
        toast.error("Lỗi khi tải thông tin hồ sơ: " + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    } else if (!validateName(formData.name)) {
      newErrors.name = "Họ và tên không được chứa ký tự đặc biệt";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      // Check if it's in YYYY-MM-DD format (from calendar) or dd/mm/yyyy (from input)
      let dateToValidate: Date | null = null;
      
      if (formData.dateOfBirth.includes('/')) {
        // dd/mm/yyyy format
        dateToValidate = parseDate(formData.dateOfBirth);
        if (!dateToValidate) {
          newErrors.dateOfBirth = "Ngày không hợp lệ. Vui lòng nhập đúng định dạng dd/mm/yyyy";
        }
      } else if (formData.dateOfBirth.includes('-')) {
        // YYYY-MM-DD format
        const dateParts = formData.dateOfBirth.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const day = parseInt(dateParts[2], 10);
          dateToValidate = new Date(year, month, day);
          if (isNaN(dateToValidate.getTime())) {
            newErrors.dateOfBirth = "Ngày không hợp lệ";
          }
        }
      }
      
      if (dateToValidate && !isNaN(dateToValidate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateToValidate > today) {
          newErrors.dateOfBirth = "Không thể chọn ngày trong tương lai";
        }
      }
    }

    // Bio validation
    if (formData.bio.length > 500) {
      newErrors.bio = "Giới thiệu không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: any) => {
    let processedValue = value;

    if (field === "name") {
      processedValue = normalizeName(value);
    } else if (field === "phone") {
      // Only allow numbers
      processedValue = value.replace(/\D/g, "");
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    } else if (field === "bio") {
      if (value.length > 500) {
        return; // Don't allow typing beyond limit
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle location input
  const handleLocationChange = (value: string) => {
    handleInputChange("location", value);
    if (value.length > 0) {
      const filtered = POPULAR_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowLocationSuggestions(filtered.length > 0);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  // Format date input (dd/mm/yyyy)
  const formatDateInput = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 8 digits (ddmmyyyy)
    const limited = digits.slice(0, 8);
    
    // Add slashes
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  // Handle date input change
  const handleDateInputChange = (value: string) => {
    const formatted = formatDateInput(value);
    
    // Update display value (dd/mm/yyyy format)
    setFormData((prev) => ({ ...prev, dateOfBirth: formatted }));
    
    // If complete date (dd/mm/yyyy), validate and convert to YYYY-MM-DD
    if (formatted.length === 10) {
      const parsed = parseDate(formatted);
      if (parsed) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsed > today) {
          setErrors((prev) => ({
            ...prev,
            dateOfBirth: "Không thể chọn ngày trong tương lai",
          }));
          return;
        }
        // Convert to YYYY-MM-DD for storage
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        const isoDate = `${year}-${month}-${day}`;
        setFormData((prev) => ({ ...prev, dateOfBirth: isoDate }));
        setSelectedDate(parsed);
        // Clear error
        if (errors.dateOfBirth) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.dateOfBirth;
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          dateOfBirth: "Ngày không hợp lệ. Vui lòng nhập đúng định dạng dd/mm/yyyy",
        }));
      }
    } else if (formatted.length > 0) {
      // Clear error if user is still typing
      if (errors.dateOfBirth && errors.dateOfBirth.includes("tương lai")) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
      }
    }
  };

  // Handle date change from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (selectedDateOnly > today) {
        toast.error("Không thể chọn ngày trong tương lai");
        return;
      }
      setSelectedDate(selectedDateOnly);
      // Format as YYYY-MM-DD without timezone issues
      const year = selectedDateOnly.getFullYear();
      const month = String(selectedDateOnly.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDateOnly.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      handleInputChange("dateOfBirth", formatted);
      setDatePickerOpen(false);
    } else {
      setSelectedDate(undefined);
      handleInputChange("dateOfBirth", "");
      setDatePickerOpen(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setAvatarError(null);
    setAvatarUploading(true);
    setAvatarProgress(0);

    try {
      // Validate image
      const validation = await validateImageFile(file, {
        maxSizeMB: 5,
        minWidth: 400,
        minHeight: 400,
      });

      if (!validation.valid) {
        setAvatarError(validation.error || "Lỗi không xác định");
        setAvatarUploading(false);
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setAvatarProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create circular cropped image and convert to File
      const croppedUrl = await createCircularImage(file, 400);
      
      // Convert blob URL to File for upload
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], file.name, { type: file.type });

      // Upload to server
      const result = await customerApi.uploadAvatar(croppedFile);
      setAvatarProgress(100);
      clearInterval(progressInterval);

      // Update form data with server URL
      setFormData((prev) => ({ ...prev, avatar: result.avatar }));
      setOriginalData((prev) => ({ ...prev, avatar: result.avatar }));

      toast.success("Tải ảnh đại diện thành công!");
    } catch (error: any) {
      setAvatarError(
        error.response?.data?.message || error.message || "Lỗi khi tải ảnh"
      );
      toast.error("Lỗi khi tải ảnh đại diện");
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
    }
  };

  // Toggle genre chip
  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const current = prev.favoriteGenres;
      if (current.includes(genre)) {
        const updated = current.filter((g) => g !== genre);
        logAuditChange("favoriteGenres", genre, "removed");
        return { ...prev, favoriteGenres: updated };
      } else {
        if (current.length >= 20) {
          toast.error("Tối đa 20 thể loại yêu thích");
          return prev;
        }
        const updated = [...current, genre];
        logAuditChange("favoriteGenres", genre, "added");
        return { ...prev, favoriteGenres: updated };
      }
    });
  };

  // Toggle location chip
  const toggleLocation = (location: string) => {
    setFormData((prev) => {
      const current = prev.favoriteLocations;
      if (current.includes(location)) {
        const updated = current.filter((l) => l !== location);
        logAuditChange("favoriteLocations", location, "removed");
        return { ...prev, favoriteLocations: updated };
      } else {
        if (current.length >= 20) {
          toast.error("Tối đa 20 địa điểm yêu thích");
          return prev;
        }
        const updated = [...current, location];
        logAuditChange("favoriteLocations", location, "added");
        return { ...prev, favoriteLocations: updated };
      }
    });
  };

  // Audit log
  const logAuditChange = (
    field: string,
    value: string,
    action: "added" | "removed" | "updated" | "uploaded"
  ) => {
    const deviceInfo = getDeviceInfo();
    console.log("Audit Log:", {
      field,
      value,
      action,
      timestamp: new Date().toISOString(),
      device: deviceInfo.device,
      userAgent: deviceInfo.userAgent,
    });
    // TODO: Send to API
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng sửa các lỗi trước khi lưu");
      return;
    }

    setIsSaving(true);
    try {
      // Convert dateOfBirth to YYYY-MM-DD format if needed
      let dateOfBirthValue = formData.dateOfBirth;
      if (dateOfBirthValue && dateOfBirthValue.includes('/')) {
        const parsed = parseDate(dateOfBirthValue);
        if (parsed) {
          const year = parsed.getFullYear();
          const month = String(parsed.getMonth() + 1).padStart(2, '0');
          const day = String(parsed.getDate()).padStart(2, '0');
          dateOfBirthValue = `${year}-${month}-${day}`;
        }
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        dateOfBirth: dateOfBirthValue || null,
        bio: formData.bio,
        favoriteGenres: formData.favoriteGenres,
        favoriteLocations: formData.favoriteLocations,
      };

      const result = await customerApi.updateProfile(updateData);
      
      // Update with server response
      if (result.profile) {
        const data: FormData = {
          name: result.profile.name || "",
          email: result.profile.email || "",
          phone: result.profile.phone || "",
          location: result.profile.location || "",
          dateOfBirth: result.profile.dateOfBirth || "",
          bio: result.profile.bio || "",
          avatar: result.profile.avatar || "",
          favoriteGenres: result.profile.favoriteGenres || [],
          favoriteLocations: result.profile.favoriteLocations || [],
        };
        setOriginalData(data);
        setFormData(data);
        // Update selectedDate after save
        if (data.dateOfBirth) {
          const dateParts = data.dateOfBirth.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const day = parseInt(dateParts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              setSelectedDate(date);
            }
          }
        } else {
          setSelectedDate(undefined);
        }
      } else {
        setOriginalData({ ...formData });
      }

      setHasUnsavedChanges(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      let errorMessage = "Lỗi khi cập nhật hồ sơ. Vui lòng thử lại.";
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && typeof error.response.data.errors === 'object') {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.length > 0 ? errors.join(", ") : errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back with confirmation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingBack(true);
      setShowConfirmDialog(true);
    } else {
      onBack?.();
    }
  };

  const confirmBack = () => {
    setShowConfirmDialog(false);
    setPendingBack(false);
    onBack?.();
  };

  const cancelBack = () => {
    setShowConfirmDialog(false);
    setPendingBack(false);
  };

  const isFormValid = () => {
    return (
      validateName(formData.name) &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      formData.bio.length <= 500
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-card-foreground">
            Chỉnh sửa hồ sơ
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Avatar Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <ImageWithFallback
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                <Button
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-pink-600 hover:bg-pink-700"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  aria-label="Tải lên ảnh đại diện"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium">Ảnh đại diện</h3>
                <p className="text-sm text-muted-foreground">
                  JPG/PNG, tối đa 5MB, tối thiểu 400×400px
                </p>
                {avatarUploading && (
                  <div className="w-full max-w-xs space-y-1">
                    <Progress value={avatarProgress} />
                    <p className="text-xs text-muted-foreground text-center">
                      Đang tải... {avatarProgress}%
                    </p>
                  </div>
                )}
                {avatarError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{avatarError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập họ và tên"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Nhập email"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại (10 số)"
                  className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                  placeholder="Nhập địa chỉ"
                  className="pl-10"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-accent"
                        onClick={() => {
                          handleInputChange("location", loc);
                          setShowLocationSuggestions(false);
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    value={
                      formData.dateOfBirth && formData.dateOfBirth.includes('-')
                        ? formatDate(formData.dateOfBirth)
                        : formData.dateOfBirth
                    }
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                    className={`pl-10 ${errors.dateOfBirth ? "border-destructive" : ""}`}
                  />
                </div>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        // Disable only future dates (after today)
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        dateOnly.setHours(0, 0, 0, 0);
                        return dateOnly > today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive mt-1">{errors.dateOfBirth}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Nhập trực tiếp hoặc chọn từ lịch. Định dạng: dd/mm/yyyy
              </p>
            </div>

            <div>
              <Label htmlFor="bio">
                Giới thiệu bản thân ({formData.bio.length}/500)
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                rows={3}
                className={errors.bio ? "border-destructive" : ""}
              />
              {errors.bio && (
                <p className="text-sm text-destructive mt-1">{errors.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Sở thích chụp ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>
                Thể loại yêu thích ({formData.favoriteGenres.length}/20)
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = formData.favoriteGenres.includes(genre);
                  return (
                    <Badge
                      key={genre}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>
                Địa điểm yêu thích ({formData.favoriteLocations.length}/20)
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_LOCATIONS.map((location) => {
                  const isSelected = formData.favoriteLocations.includes(
                    location
                  );
                  return (
                    <Badge
                      key={location}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleLocation(location)}
                    >
                      {location}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!isFormValid() || !hasUnsavedChanges || isSaving}
          className="w-full h-12 bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận rời trang</DialogTitle>
            <DialogDescription>
              Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời trang không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelBack}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmBack}>
              Rời trang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
