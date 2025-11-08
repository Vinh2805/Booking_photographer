import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  FolderPlus,
  Heart,
  Clock,
  CheckCircle,
  Camera,
} from "lucide-react";

interface Photo {
  id: string;
  src: string;
  title: string;
  description?: string;
  tags: string[];
  uploadDate: string;
  bookingId?: string;
  clientName?: string;
  status: "processing" | "ready" | "delivered";
  likes: number;
  views: number;
  isPublic: boolean;
  category:
    | "wedding"
    | "portrait"
    | "family"
    | "event"
    | "commercial"
    | "other";
}

interface Album {
  id: string;
  name: string;
  description: string;
  photos: Photo[];
  coverPhoto: string;
  createdDate: string;
  clientName?: string;
  bookingId?: string;
  isPublic: boolean;
}

interface PhotographerGalleryProps {
  onNavigate: (view: string) => void;
}

export function PhotographerGallery({ onNavigate }: PhotographerGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTab, setSelectedTab] = useState("photos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Mock data
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: "1",
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      title: "Ảnh cưới Minh & Lan",
      description: "Buổi chụp cưới ngoại cảnh tại Đà Lạt",
      tags: ["cưới", "ngoại cảnh", "đà lạt"],
      uploadDate: "2024-01-15",
      bookingId: "BK001",
      clientName: "Minh & Lan",
      status: "delivered",
      likes: 45,
      views: 120,
      isPublic: true,
      category: "wedding",
    },
    {
      id: "2",
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      title: "Chân dung doanh nhân",
      description: "Bộ ảnh profile chuyên nghiệp",
      tags: ["chân dung", "doanh nhân", "profile"],
      uploadDate: "2024-01-14",
      bookingId: "BK002",
      clientName: "Anh Tuấn",
      status: "ready",
      likes: 23,
      views: 67,
      isPublic: false,
      category: "portrait",
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop",
      title: "Ảnh gia đình",
      description: "Khoảnh khắc hạnh phúc bên gia đình",
      tags: ["gia đình", "trẻ em", "hạnh phúc"],
      uploadDate: "2024-01-13",
      status: "processing",
      likes: 12,
      views: 34,
      isPublic: true,
      category: "family",
    },
  ]);

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: "1",
      name: "Cưới Minh & Lan",
      description: "Album cưới hoàn chỉnh tại Đà Lạt",
      photos: [photos[0]],
      coverPhoto: photos[0].src,
      createdDate: "2024-01-15",
      clientName: "Minh & Lan",
      bookingId: "BK001",
      isPublic: true,
    },
  ]);

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "wedding", label: "Cưới hỏi" },
    { value: "portrait", label: "Chân dung" },
    { value: "family", label: "Gia đình" },
    { value: "event", label: "Sự kiện" },
    { value: "commercial", label: "Thương mại" },
    { value: "other", label: "Khác" },
  ];

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (photo.clientName &&
        photo.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    toast.success(`Đang tải lên ${files.length} ảnh...`);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setShowUploadDialog(false);
      toast.success("Tải lên thành công!");
    }, 2000);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
    toast.success("Đã xóa ảnh!");
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const StatusBadge = ({ status }: { status: Photo["status"] }) => {
    const config = {
      processing: {
        label: "Đang xử lý",
        variant: "secondary" as const,
        icon: Clock,
      },
      ready: {
        label: "Sẵn sàng",
        variant: "default" as const,
        icon: CheckCircle,
      },
      delivered: {
        label: "Đã giao",
        variant: "outline" as const,
        icon: CheckCircle,
      },
    };

    const { label, variant, icon: Icon } = config[status];

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thư viện ảnh</h1>
          <p className="text-muted-foreground">
            Quản lý và chia sẻ tác phẩm của bạn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="hover-lift">
                <Upload className="w-4 h-4 mr-2" />
                Tải lên ảnh
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tải lên ảnh mới</DialogTitle>
                <DialogDescription>
                  Chọn ảnh từ thiết bị của bạn để tải lên
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Kéo thả ảnh vào đây hoặc
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      Chọn file
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                      />
                    </label>
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Hỗ trợ: JPG, PNG, GIF. Tối đa 10MB mỗi file.
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid3X3 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos">Ảnh ({photos.length})</TabsTrigger>
          <TabsTrigger value="albums">Album ({albums.length})</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm ảnh, album..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <TabsContent value="photos" className="space-y-4">
          {selectedPhotos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Đã chọn {selectedPhotos.length} ảnh
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa {selectedPhotos.length} ảnh đã
                            chọn? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              selectedPhotos.forEach((id) =>
                                handleDeletePhoto(id)
                              );
                              setSelectedPhotos([]);
                            }}
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card
                  key={photo.id}
                  className="hover-lift group overflow-hidden"
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={photo.status} />
                    </div>
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate">{photo.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {photo.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {photo.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {photo.likes}
                        </span>
                      </div>
                      <Badge
                        variant={photo.isPublic ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {photo.isPublic ? "Công khai" : "Riêng tư"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="w-4 h-4"
                      />
                      <ImageWithFallback
                        src={photo.src}
                        alt={photo.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{photo.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {photo.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <StatusBadge status={photo.status} />
                          {photo.clientName && (
                            <span className="text-xs text-muted-foreground">
                              Khách hàng: {photo.clientName}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {photo.uploadDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {photo.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {photo.likes}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có ảnh nào</h3>
              <p className="text-muted-foreground mb-4">
                Tải lên ảnh đầu tiên để bắt đầu xây dựng thư viện của bạn
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Tải lên ảnh
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Card key={album.id} className="hover-lift overflow-hidden">
                <div className="relative">
                  <ImageWithFallback
                    src={album.coverPhoto}
                    alt={album.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-medium">{album.name}</h3>
                    <p className="text-sm opacity-90">
                      {album.photos.length} ảnh
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {album.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {album.createdDate}
                    </span>
                    <Badge
                      variant={album.isPublic ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {album.isPublic ? "Công khai" : "Riêng tư"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create Album Card */}
            <Card className="hover-lift border-dashed border-2 cursor-pointer">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <FolderPlus className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">Tạo album mới</h3>
                <p className="text-sm text-muted-foreground">
                  Tổ chức ảnh thành các bộ sưu tập
                </p>
              </CardContent>
            </Card>
          </div>

          {albums.length === 0 && (
            <div className="text-center py-12">
              <FolderPlus className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có album nào</h3>
              <p className="text-muted-foreground mb-4">
                Tạo album để tổ chức và chia sẻ ảnh với khách hàng
              </p>
              <Button>
                <FolderPlus className="w-4 h-4 mr-2" />
                Tạo album đầu tiên
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
