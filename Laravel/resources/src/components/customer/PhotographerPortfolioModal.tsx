import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { Calendar, Upload, X } from "lucide-react";
import apiClient from "../services/apiClient";
import { createBooking, CreateBookingRequest } from "../services/BookingAPI";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface PhotographerPortfolioModalProps {
  photographerId: string | null;
  open: boolean;
  onClose: () => void;
  onBookingSuccess?: () => void;
}

interface PhotographerData {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  portfolio: string[];
  styles: string[];
  equipment: string[];
  priceMin: number;
  priceMax: number;
  location: string;
  experience: number;
  bio: string;
  rating: number;
  reviewCount: number;
  completedBookings: number;
}

export function PhotographerPortfolioModal({
  photographerId,
  open,
  onClose,
  onBookingSuccess,
}: PhotographerPortfolioModalProps) {
  const [photographer, setPhotographer] = useState<PhotographerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    Tieu_De: "",
    The_Loai_Chup: [] as string[],
    Boi_Canh_Chup: "" as "Ngoài trời" | "Trong nhà" | "Kết hợp" | "",
    Dia_Diem: "",
    Bat_Dau_Chup: "",
    Ket_Thuc_Chup: "",
    Ghi_Chu: "",
    Dich_Vu: [] as string[],
    Anh_Minh_Hoa: null as File | null,
  });
  const [services, setServices] = useState<any[]>([]);
  const [basePrice, setBasePrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load photographer data and services
  useEffect(() => {
    if (open && photographerId) {
      loadPhotographer();
      loadServices();
    } else {
      setPhotographer(null);
      setShowBookingForm(false);
      setBookingData({
        Tieu_De: "",
        The_Loai_Chup: [],
        Boi_Canh_Chup: "",
        Dia_Diem: "",
        Bat_Dau_Chup: "",
        Ket_Thuc_Chup: "",
        Ghi_Chu: "",
        Dich_Vu: [],
        Anh_Minh_Hoa: null,
      });
      setPreviewImage(null);
    }
  }, [open, photographerId]);

  const loadServices = async () => {
    try {
      const response = await apiClient.get("/dich-vu");
      setServices(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dịch vụ:", error);
      setServices([]);
    }
  };

  const loadPhotographer = async () => {
    if (!photographerId) {
      console.warn("No photographer ID provided");
      return;
    }
    try {
      setLoading(true);
      console.log("Loading photographer:", photographerId);
      const response = await apiClient.get(`/nhiep-anh-gia/${photographerId}`);
      console.log("Photographer data:", response.data);
      console.log("Portfolio data:", response.data.portfolio);
      console.log("Portfolio length:", response.data.portfolio?.length);
      console.log("Portfolio is array:", Array.isArray(response.data.portfolio));
      setPhotographer(response.data);
      // Set base price from photographer
      setBasePrice(response.data.priceMin || response.data.priceValue || 0);
    } catch (error: any) {
      console.error("Lỗi khi tải thông tin nhiếp ảnh gia:", error);
      toast.error("Không thể tải thông tin nhiếp ảnh gia");
    } finally {
      setLoading(false);
    }
  };

  // Genre options
  const genres = [
    "Chân dung",
    "Cưới hỏi",
    "Gia đình",
    "Sự kiện",
    "Sản phẩm",
    "Thời trang",
    "Phong cảnh",
    "Đường phố",
  ];

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = basePrice;
    bookingData.Dich_Vu.forEach((serviceId) => {
      const service = services.find((s) => s.Ma_DV === serviceId);
      if (service) {
        total += parseFloat(service.Gia || 0);
      }
    });
    return total;
  };

  const handleGenreToggle = (genre: string) => {
    setBookingData((prev) => ({
      ...prev,
      The_Loai_Chup: prev.The_Loai_Chup.includes(genre)
        ? prev.The_Loai_Chup.filter((g) => g !== genre)
        : [...prev.The_Loai_Chup, genre],
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setBookingData((prev) => ({
      ...prev,
      Dich_Vu: prev.Dich_Vu.includes(serviceId)
        ? prev.Dich_Vu.filter((id) => id !== serviceId)
        : [...prev.Dich_Vu, serviceId],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file JPG/PNG");
        return;
      }
      setBookingData((prev) => ({ ...prev, Anh_Minh_Hoa: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBookingData((prev) => ({ ...prev, Anh_Minh_Hoa: null }));
    setPreviewImage(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const isFormValid = () => {
    return (
      bookingData.The_Loai_Chup.length > 0 &&
      bookingData.Boi_Canh_Chup !== "" &&
      bookingData.Dia_Diem.trim() !== "" &&
      bookingData.Bat_Dau_Chup !== "" &&
      bookingData.Ket_Thuc_Chup !== ""
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photographerId) return;

    // Validate required fields
    if (bookingData.The_Loai_Chup.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thể loại chụp ảnh");
      return;
    }

    if (!bookingData.Boi_Canh_Chup) {
      toast.error("Vui lòng chọn bối cảnh chụp ảnh");
      return;
    }

    if (!bookingData.Dia_Diem.trim()) {
      toast.error("Vui lòng nhập địa điểm");
      return;
    }

    if (!bookingData.Bat_Dau_Chup || !bookingData.Ket_Thuc_Chup) {
      toast.error("Vui lòng chọn ngày giờ bắt đầu và kết thúc");
      return;
    }

    const startDate = new Date(bookingData.Bat_Dau_Chup);
    const endDate = new Date(bookingData.Ket_Thuc_Chup);
    const now = new Date();

    if (startDate < now) {
      toast.error("Không thể chọn thời gian trong quá khứ");
      return;
    }

    if (endDate <= startDate) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("Ma_NAG", photographerId);
      formData.append("Tieu_De", bookingData.Tieu_De || "");
      formData.append("The_Loai_Chup", JSON.stringify(bookingData.The_Loai_Chup));
      formData.append("Boi_Canh_Chup", bookingData.Boi_Canh_Chup);
      formData.append("Dia_Diem", bookingData.Dia_Diem);
      formData.append("Bat_Dau_Chup", startDate.toISOString());
      formData.append("Ket_Thuc_Chup", endDate.toISOString());
      formData.append("Ghi_Chu", bookingData.Ghi_Chu || "");
      formData.append("Dich_Vu", JSON.stringify(bookingData.Dich_Vu));
      formData.append("Tong_Tien", calculateTotalPrice().toString());
      
      if (bookingData.Anh_Minh_Hoa) {
        formData.append("Anh_Minh_Hoa", bookingData.Anh_Minh_Hoa);
      }

      const response = await apiClient.post("/booking/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message || "Đặt lịch thành công!");
      setShowBookingForm(false);
      setBookingData({
        Tieu_De: "",
        The_Loai_Chup: [],
        Boi_Canh_Chup: "",
        Dia_Diem: "",
        Bat_Dau_Chup: "",
        Ket_Thuc_Chup: "",
        Ghi_Chu: "",
        Dich_Vu: [],
        Anh_Minh_Hoa: null,
      });
      setPreviewImage(null);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error: any) {
      console.error("Lỗi khi đặt lịch:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Không thể đặt lịch. Vui lòng thử lại.";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Có lỗi xảy ra khi đặt lịch"
      );
    } finally {
      setSubmitting(false);
    }
  };

  console.log("Modal render - open:", open, "photographerId:", photographerId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] !flex !flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle>
            {photographer ? photographer.name : "Nhiếp ảnh gia"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 min-h-0" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : photographer ? (
            <div className="space-y-6">
            {/* Photographer Info */}
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={photographer.avatar}
                alt={photographer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{photographer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {photographer.location} • {photographer.experience} năm kinh nghiệm
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">
                    ⭐ {photographer.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({photographer.reviewCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Grid */}
            {(() => {
              console.log("Rendering portfolio section");
              console.log("photographer.portfolio:", photographer.portfolio);
              console.log("Is array:", Array.isArray(photographer.portfolio));
              console.log("Length:", photographer.portfolio?.length);
              
              const portfolio = photographer.portfolio || [];
              const hasPortfolio = Array.isArray(portfolio) && portfolio.length > 0;
              
              if (hasPortfolio) {
                return (
                  <div>
                    <h4 className="font-semibold mb-4">Portfolio ({portfolio.length} ảnh)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {portfolio.map((img: string, index: number) => {
                        console.log(`Portfolio image ${index}:`, img);
                        return (
                          <div key={index} className="relative aspect-square">
                            <ImageWithFallback
                              src={img}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Chưa có portfolio</p>
                    <p className="text-xs mt-2">Debug: portfolio = {JSON.stringify(portfolio)}</p>
                  </div>
                );
              }
            })()}

            {/* Booking Form */}
            {!showBookingForm ? (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Đặt lịch hẹn
                </Button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-6 pt-4 border-t">
                <h4 className="font-semibold text-lg">Thông tin đặt lịch</h4>
                
                {/* Tiêu đề */}
                <div>
                  <Label htmlFor="tieu_de">Tiêu đề (tùy chọn)</Label>
                  <Input
                    id="tieu_de"
                    value={bookingData.Tieu_De}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, Tieu_De: e.target.value })
                    }
                    placeholder="Nhập tiêu đề cho buổi chụp..."
                  />
                </div>

                {/* Thể loại chụp ảnh - Bắt buộc */}
                <div>
                  <Label>
                    Thể loại chụp ảnh <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map((genre) => (
                      <div
                        key={genre}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={bookingData.The_Loai_Chup.includes(genre)}
                          onCheckedChange={() => handleGenreToggle(genre)}
                        />
                        <Label
                          htmlFor={`genre-${genre}`}
                          className="font-normal cursor-pointer"
                        >
                          {genre}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {bookingData.The_Loai_Chup.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      Vui lòng chọn ít nhất một thể loại
                    </p>
                  )}
                </div>

                {/* Bối cảnh chụp ảnh - Bắt buộc */}
                <div>
                  <Label>
                    Bối cảnh chụp ảnh <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={bookingData.Boi_Canh_Chup}
                    onValueChange={(value) =>
                      setBookingData({
                        ...bookingData,
                        Boi_Canh_Chup: value as "Ngoài trời" | "Trong nhà" | "Kết hợp",
                      })
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Ngoài trời" id="boi_canh_ngoai_troi" />
                      <Label htmlFor="boi_canh_ngoai_troi" className="font-normal cursor-pointer">
                        Ngoài trời
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Trong nhà" id="boi_canh_trong_nha" />
                      <Label htmlFor="boi_canh_trong_nha" className="font-normal cursor-pointer">
                        Trong nhà
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Kết hợp" id="boi_canh_ket_hop" />
                      <Label htmlFor="boi_canh_ket_hop" className="font-normal cursor-pointer">
                        Kết hợp
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Địa điểm - Bắt buộc */}
                <div>
                  <Label htmlFor="dia_diem">
                    Địa điểm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dia_diem"
                    value={bookingData.Dia_Diem}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, Dia_Diem: e.target.value })
                    }
                    placeholder="Nhập địa điểm chụp"
                    required
                  />
                </div>

                {/* Thời gian - Bắt buộc */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bat_dau">
                      Thời gian bắt đầu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bat_dau"
                      type="datetime-local"
                      value={bookingData.Bat_Dau_Chup}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          Bat_Dau_Chup: e.target.value,
                        })
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ket_thuc">
                      Thời gian kết thúc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ket_thuc"
                      type="datetime-local"
                      value={bookingData.Ket_Thuc_Chup}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          Ket_Thuc_Chup: e.target.value,
                        })
                      }
                      min={bookingData.Bat_Dau_Chup || new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>

                {/* Mô tả chi tiết */}
                <div>
                  <Label htmlFor="ghi_chu">Mô tả chi tiết (tùy chọn)</Label>
                  <Textarea
                    id="ghi_chu"
                    value={bookingData.Ghi_Chu}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, Ghi_Chu: e.target.value })
                    }
                    placeholder="Mô tả chi tiết về buổi chụp, concept, yêu cầu đặc biệt..."
                    rows={4}
                  />
                </div>

                {/* Dịch vụ đi kèm */}
                {services.length > 0 && (
                  <div>
                    <Label>Dịch vụ đi kèm (tùy chọn)</Label>
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {services.map((service) => (
                        <div
                          key={service.Ma_DV}
                          className="flex items-center justify-between p-2 hover:bg-accent rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service.Ma_DV}`}
                              checked={bookingData.Dich_Vu.includes(service.Ma_DV)}
                              onCheckedChange={() => handleServiceToggle(service.Ma_DV)}
                            />
                            <Label
                              htmlFor={`service-${service.Ma_DV}`}
                              className="font-normal cursor-pointer"
                            >
                              {service.Ten_DV}
                            </Label>
                          </div>
                          <span className="text-sm font-medium">
                            {formatPrice(parseFloat(service.Gia || 0))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ảnh minh họa */}
                <div>
                  <Label>Ảnh minh họa (tùy chọn)</Label>
                  <div className="mt-2">
                    {previewImage ? (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click để upload</span> hoặc kéo thả
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Tổng chi phí */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Giá cơ bản:</span>
                    <span className="font-semibold">{formatPrice(basePrice)}</span>
                  </div>
                  {bookingData.Dich_Vu.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Dịch vụ đã chọn:</div>
                      {bookingData.Dich_Vu.map((serviceId) => {
                        const service = services.find((s) => s.Ma_DV === serviceId);
                        if (!service) return null;
                        return (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span>• {service.Ten_DV}</span>
                            <span>{formatPrice(parseFloat(service.Gia || 0))}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Tổng chi phí:</span>
                    <span className="text-primary">{formatPrice(calculateTotalPrice())}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !isFormValid()}
                    className="flex-1"
                  >
                    {submitting ? "Đang gửi..." : "Xác nhận đặt lịch"}
                  </Button>
                </div>
              </form>
            )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

