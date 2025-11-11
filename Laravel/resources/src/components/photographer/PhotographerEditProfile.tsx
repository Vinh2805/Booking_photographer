import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Plus,
  X,
  Upload,
  Loader2,
  AlertCircle,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  formatCurrency,
  parseCurrency,
  validateImageFile,
  createCircularImage,
  createCoverImage,
  getDeviceInfo,
} from "../../utils/profileValidation";
import React from "react";
import { photographerApi } from "../services/photographerApi";

interface PhotographerProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  experience: number;
  location: string;
  styles: string[];
  equipment: string[];
  priceRange: {
    min: number;
    max: number;
  };
  avatar: string;
  coverImage: string;
  portfolio: string[];
}

const AVAILABLE_STYLES = [
  "Cưới",
  "Chân dung",
  "Gia đình",
  "Fashion",
  "Nghệ thuật",
  "Sự kiện",
  "Maternity",
  "Newborn",
  "Street style",
  "Doanh nghiệp",
  "Food",
  "Kiến trúc",
  "Thể thao",
  "Du lịch",
  "Pre-wedding",
  "Engagement",
  "Trẻ em",
  "Lifestyle",
  "Sản phẩm",
  "Quảng cáo",
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
  "Quận 1, TP.HCM",
  "Quận 3, TP.HCM",
  "Quận 7, TP.HCM",
  "Quận Bình Thạnh, TP.HCM",
];

export function PhotographerEditProfile({ onBack }: { onBack: () => void }) {
  const [originalData, setOriginalData] = useState<PhotographerProfile>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    experience: 0,
    location: "",
    styles: [],
    equipment: [],
    priceRange: {
      min: 0,
      max: 0,
    },
    avatar: "",
    coverImage: "",
    portfolio: [],
  });

  const [profile, setProfile] = useState<PhotographerProfile>({
    ...originalData,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);

  // Image upload states
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Portfolio states
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioProgress, setPortfolioProgress] = useState<Record<number, number>>({});
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form states
  const [newStyle, setNewStyle] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [priceMinDisplay, setPriceMinDisplay] = useState(
    formatCurrency(profile.priceRange.min)
  );
  const [priceMaxDisplay, setPriceMaxDisplay] = useState(
    formatCurrency(profile.priceRange.max)
  );

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await photographerApi.getProfile();
        const data: PhotographerProfile = {
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          experience: profileData.experience || 0,
          location: profileData.location || "",
          styles: profileData.styles || [],
          equipment: profileData.equipment || [],
          priceRange: {
            min: profileData.priceRange?.min || 0,
            max: profileData.priceRange?.max || 0,
          },
          avatar: profileData.avatar || "",
          coverImage: profileData.coverImage || "",
          portfolio: profileData.portfolio || [],
        };
        setOriginalData(data);
        setProfile(data);
        setPriceMinDisplay(formatCurrency(data.priceRange.min));
        setPriceMaxDisplay(formatCurrency(data.priceRange.max));
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
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [profile, originalData]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    } else if (!validateName(profile.name)) {
      newErrors.name = "Họ và tên không được chứa ký tự đặc biệt";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!validateEmail(profile.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!profile.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!validatePhone(profile.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (profile.experience < 0 || profile.experience > 60) {
      newErrors.experience = "Số năm kinh nghiệm phải từ 0 đến 60";
    }

    if (profile.bio.length > 500) {
      newErrors.bio = "Giới thiệu không được vượt quá 500 ký tự";
    }

    if (profile.priceRange.min < 0) {
      newErrors.priceMin = "Giá từ phải lớn hơn hoặc bằng 0";
    }

    if (profile.priceRange.max < profile.priceRange.min) {
      newErrors.priceMax = "Giá đến phải lớn hơn hoặc bằng giá từ";
    }

    if (profile.styles.length > 20) {
      newErrors.styles = "Tối đa 20 bối cảnh chụp ảnh";
    }

    if (profile.portfolio.length > 12) {
      newErrors.portfolio = "Tối đa 12 ảnh trong portfolio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update profile
  const updateProfile = (field: keyof PhotographerProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle name change
  const handleNameChange = (value: string) => {
    updateProfile("name", normalizeName(value));
  };

  // Handle phone change
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      updateProfile("phone", cleaned);
    }
  };

  // Handle location change
  const handleLocationChange = (value: string) => {
    updateProfile("location", value);
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

  // Handle price change
  const handlePriceMinChange = (value: string) => {
    const numValue = parseCurrency(value);
    setPriceMinDisplay(formatCurrency(numValue));
    updateProfile("priceRange", { ...profile.priceRange, min: numValue });
  };

  const handlePriceMaxChange = (value: string) => {
    const numValue = parseCurrency(value);
    setPriceMaxDisplay(formatCurrency(numValue));
    updateProfile("priceRange", { ...profile.priceRange, max: numValue });
  };

  // Handle cover image upload
  const handleCoverUpload = async (file: File) => {
    setCoverError(null);
    setCoverUploading(true);
    setCoverProgress(0);

    try {
      const validation = await validateImageFile(file, {
        maxSizeMB: 5,
      });

      if (!validation.valid) {
        setCoverError(validation.error || "Lỗi không xác định");
        setCoverUploading(false);
        return;
      }

      const progressInterval = setInterval(() => {
        setCoverProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const croppedUrl = await createCoverImage(file, 1200, 675);
      
      // Convert blob URL to File for upload
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], file.name, { type: file.type });

      // Upload to server
      const result = await photographerApi.uploadCover(croppedFile);
      setCoverProgress(100);
      clearInterval(progressInterval);

      updateProfile("coverImage", result.coverImage);
      setOriginalData((prev) => ({ ...prev, coverImage: result.coverImage }));
      toast.success("Tải ảnh bìa thành công!");
    } catch (error: any) {
      setCoverError(
        error.response?.data?.message || error.message || "Lỗi khi tải ảnh"
      );
      toast.error("Lỗi khi tải ảnh bìa");
    } finally {
      setCoverUploading(false);
      setCoverProgress(0);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    setAvatarError(null);
    setAvatarUploading(true);
    setAvatarProgress(0);

    try {
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

      const progressInterval = setInterval(() => {
        setAvatarProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const croppedUrl = await createCircularImage(file, 400);
      
      // Convert blob URL to File for upload
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], file.name, { type: file.type });

      // Upload to server
      const result = await photographerApi.uploadAvatar(croppedFile);
      setAvatarProgress(100);
      clearInterval(progressInterval);

      updateProfile("avatar", result.avatar);
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

  // Handle portfolio upload
  const handlePortfolioUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    const totalFiles = files.length;
    let completed = 0;

    if (profile.portfolio.length + totalFiles > 12) {
      toast.error("Tối đa 12 ảnh trong portfolio");
      return;
    }

    setPortfolioUploading(true);

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const index = profile.portfolio.length + i;

        // Validate
        const validation = await validateImageFile(file, {
          maxSizeMB: 5,
        });

        if (!validation.valid) {
          toast.error(`Ảnh ${i + 1}: ${validation.error}`);
          continue;
        }

        // Simulate upload
        setPortfolioProgress((prev) => ({
          ...prev,
          [index]: 0,
        }));

        const progressInterval = setInterval(() => {
          setPortfolioProgress((prev) => ({
            ...prev,
            [index]: Math.min((prev[index] || 0) + 20, 90),
          }));
        }, 200);

        completed++;
        setPortfolioProgress((prev) => ({
          ...prev,
          [index]: 100,
        }));
        clearInterval(progressInterval);
      }

      // Upload all files to server
      const fileArray = Array.from(files).slice(0, completed);
      const result = await photographerApi.uploadPortfolio(fileArray);
      
      updateProfile("portfolio", result.portfolio);
      setOriginalData((prev) => ({ ...prev, portfolio: result.portfolio }));
      toast.success(`Đã thêm ${completed} ảnh vào portfolio!`);
    } catch (error: any) {
      toast.error("Lỗi khi tải ảnh portfolio: " + (error.response?.data?.message || error.message));
    } finally {
      setPortfolioUploading(false);
      setPortfolioProgress({});
    }
  };

  // Remove portfolio image
  const removePortfolioImage = (index: number) => {
    const newPortfolio = profile.portfolio.filter((_, i) => i !== index);
    updateProfile("portfolio", newPortfolio);
    logAuditChange("portfolio", `Ảnh ${index + 1}`, "removed");
    toast.success("Đã xóa ảnh khỏi portfolio");
  };

  // Drag and drop portfolio
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newPortfolio = [...profile.portfolio];
    const draggedItem = newPortfolio[draggedIndex];
    newPortfolio.splice(draggedIndex, 1);
    newPortfolio.splice(index, 0, draggedItem);

    setProfile((prev) => ({ ...prev, portfolio: newPortfolio }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    logAuditChange("portfolio", "Sắp xếp lại", "updated");
  };

  // Add style
  const addStyle = (style: string) => {
    if (!style) return;
    if (profile.styles.includes(style)) {
      toast.error("Bối cảnh này đã được thêm");
      return;
    }
    if (profile.styles.length >= 20) {
      toast.error("Tối đa 20 bối cảnh chụp ảnh");
      return;
    }
    updateProfile("styles", [...profile.styles, style]);
    setNewStyle("");
    logAuditChange("styles", style, "added");
  };

  // Remove style
  const removeStyle = (style: string) => {
    updateProfile(
      "styles",
      profile.styles.filter((s) => s !== style)
    );
    logAuditChange("styles", style, "removed");
  };

  // Add equipment
  const addEquipment = () => {
    if (!newEquipment.trim()) return;
    if (profile.equipment.includes(newEquipment.trim())) {
      toast.error("Thiết bị này đã được thêm");
      return;
    }
    if (newEquipment.trim().length > 50) {
      toast.error("Tên thiết bị quá dài (tối đa 50 ký tự)");
      return;
    }
    updateProfile("equipment", [...profile.equipment, newEquipment.trim()]);
    setNewEquipment("");
    logAuditChange("equipment", newEquipment.trim(), "added");
  };

  // Remove equipment
  const removeEquipment = (equipment: string) => {
    updateProfile(
      "equipment",
      profile.equipment.filter((e) => e !== equipment)
    );
    logAuditChange("equipment", equipment, "removed");
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
      const updateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        experience: profile.experience,
        bio: profile.bio,
        styles: profile.styles,
        equipment: profile.equipment,
        priceRange: profile.priceRange,
        portfolio: profile.portfolio,
      };

      const result = await photographerApi.updateProfile(updateData);
      
      // Update with server response
      if (result.profile) {
        const data: PhotographerProfile = {
          name: result.profile.name || "",
          email: result.profile.email || "",
          phone: result.profile.phone || "",
          bio: result.profile.bio || "",
          experience: result.profile.experience || 0,
          location: result.profile.location || "",
          styles: result.profile.styles || [],
          equipment: result.profile.equipment || [],
          priceRange: {
            min: result.profile.priceRange?.min || 0,
            max: result.profile.priceRange?.max || 0,
          },
          avatar: result.profile.avatar || "",
          coverImage: result.profile.coverImage || "",
          portfolio: result.profile.portfolio || [],
        };
        setOriginalData(data);
        setProfile(data);
        setPriceMinDisplay(formatCurrency(data.priceRange.min));
        setPriceMaxDisplay(formatCurrency(data.priceRange.max));
      } else {
        setOriginalData({ ...profile });
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
      validateName(profile.name) &&
      validateEmail(profile.email) &&
      validatePhone(profile.phone) &&
      profile.experience >= 0 &&
      profile.experience <= 60 &&
      profile.bio.length <= 500 &&
      profile.priceRange.min >= 0 &&
      profile.priceRange.max >= profile.priceRange.min &&
      profile.styles.length <= 20 &&
      profile.portfolio.length <= 12
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
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-semibold text-card-foreground">Chỉnh sửa hồ sơ</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Profile Images */}
        <Card>
          <CardHeader>
            <CardTitle>Ảnh hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover Image */}
            <div className="relative">
              <ImageWithFallback
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={coverUploading}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                >
                  {coverUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Đổi ảnh bìa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    updateProfile("coverImage", "");
                    logAuditChange("coverImage", "Ảnh bìa", "removed");
                  }}
                  className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleCoverUpload(file);
                  }
                }}
              />
              {coverUploading && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm rounded-b-lg">
                  <Progress value={coverProgress} className="mb-1" />
                  <p className="text-xs text-white text-center">
                    Đang tải... {coverProgress}%
                  </p>
                </div>
              )}
              {coverError && (
                <div className="absolute top-2 left-2 right-2 flex items-center gap-2 text-sm text-destructive bg-background/90 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>{coverError}</span>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <ImageWithFallback
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
                <Button
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full bg-pink-600 hover:bg-pink-700"
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                />
                {avatarUploading && (
                  <div className="absolute -top-2 left-0 right-0">
                    <Progress value={avatarProgress} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">Ảnh đại diện</p>
                <p className="text-sm text-muted-foreground">
                  Khuyên dùng ảnh vuông, tối thiểu 400×400px (JPG/PNG ≤ 5MB)
                </p>
                {avatarError && (
                  <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{avatarError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                Họ và tên <span className="text-destructive">*</span>
              </label>
              <Input
                value={profile.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nhập họ và tên"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                placeholder="Nhập email"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Số điện thoại <span className="text-destructive">*</span>
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Nhập số điện thoại (10 số)"
                maxLength={10}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Khu vực làm việc
              </label>
              <div className="relative">
                <Input
                  value={profile.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                  placeholder="VD: Hà Nội, TP.HCM"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-accent"
                        onClick={() => {
                          updateProfile("location", loc);
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
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Số năm kinh nghiệm
              </label>
              <Input
                type="number"
                min="0"
                max="60"
                value={profile.experience}
                onChange={(e) =>
                  updateProfile("experience", parseInt(e.target.value) || 0)
                }
                placeholder="Nhập số năm kinh nghiệm"
                className={errors.experience ? "border-destructive" : ""}
              />
              {errors.experience && (
                <p className="text-sm text-destructive mt-1">
                  {errors.experience}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Giới thiệu bản thân ({profile.bio.length}/500)
              </label>
              <Textarea
                className={errors.bio ? "border-destructive" : ""}
                rows={4}
                value={profile.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    updateProfile("bio", e.target.value);
                  }
                }}
                placeholder="Viết giới thiệu về bản thân, phong cách chụp, kinh nghiệm..."
              />
              {errors.bio && (
                <p className="text-sm text-destructive mt-1">{errors.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle>Khoảng giá dịch vụ (VND)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Giá từ
                </label>
                <Input
                  value={priceMinDisplay}
                  onChange={(e) => handlePriceMinChange(e.target.value)}
                  placeholder="0"
                  className={errors.priceMin ? "border-destructive" : ""}
                />
                {errors.priceMin && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.priceMin}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Giá đến
                </label>
                <Input
                  value={priceMaxDisplay}
                  onChange={(e) => handlePriceMaxChange(e.target.value)}
                  placeholder="0"
                  className={errors.priceMax ? "border-destructive" : ""}
                />
                {errors.priceMax && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.priceMax}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Styles */}
        <Card>
          <CardHeader>
            <CardTitle>
              Bối cảnh chụp ảnh ({profile.styles.length}/20)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.styles.map((style) => (
                <Badge
                  key={style}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {style}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeStyle(style)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={newStyle} onValueChange={setNewStyle}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn bối cảnh" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_STYLES.filter(
                    (style) => !profile.styles.includes(style)
                  ).map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => addStyle(newStyle)}
                disabled={!newStyle}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết bị chụp ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.equipment.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {item}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeEquipment(item)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="VD: Canon R5, Sony A7IV..."
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEquipment();
                  }
                }}
                maxLength={50}
              />
              <Button
                onClick={addEquipment}
                disabled={!newEquipment.trim()}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>
              Portfolio ({profile.portfolio.length}/12)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.portfolio.map((image, index) => (
                <div
                  key={index}
                  className="relative group"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded p-1">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePortfolioImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {portfolioProgress[index] !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 backdrop-blur-sm rounded-b-lg">
                      <Progress value={portfolioProgress[index]} />
                    </div>
                  )}
                </div>
              ))}

              {profile.portfolio.length < 12 && (
                <div
                  className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors"
                  onClick={() => portfolioInputRef.current?.click()}
                >
                  <div className="text-center">
                    {portfolioUploading ? (
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {portfolioUploading ? "Đang tải..." : "Thêm ảnh"}
                    </p>
                  </div>
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => handlePortfolioUpload(e.target.files)}
                  />
                </div>
              )}
            </div>
            {errors.portfolio && (
              <p className="text-sm text-destructive">{errors.portfolio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              JPG/PNG, tối đa 5MB mỗi ảnh. Kéo thả để sắp xếp lại.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pb-6">
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
              "Lưu thay đổi"
            )}
          </Button>
        </div>
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
