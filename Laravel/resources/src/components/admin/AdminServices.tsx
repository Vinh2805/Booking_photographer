import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import apiClient from "../services/apiClient";

interface ServiceItem {
    Ma_DV: string;
    Ten_DV: string;
    Mo_Ta: string;
    Loai_DV: number;
    Hoat_Dong: boolean;
    created_at?: string;
}

export function AdminServices() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<ServiceItem | null>(null);
    const [formData, setFormData] = useState({
        Ten_DV: "",
        Mo_Ta: "",
        Loai_DV: 0, // 0: Extra, 1: Genre, 3: Context
        Hoat_Dong: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Alert State
    const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

    useEffect(() => {
        fetchServices();
    }, [searchQuery]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/admin/services", {
                params: { search: searchQuery }
            });
            setServices(response.data.data);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Không thể tải danh sách dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (service?: ServiceItem) => {
        if (service) {
            setCurrentService(service);
            setFormData({
                Ten_DV: service.Ten_DV,
                Mo_Ta: service.Mo_Ta || "",
                Loai_DV: service.Loai_DV,
                Hoat_Dong: !!service.Hoat_Dong
            });
        } else {
            setCurrentService(null);
            setFormData({
                Ten_DV: "",
                Mo_Ta: "",
                Loai_DV: 1,
                Hoat_Dong: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.Ten_DV) {
            toast.error("Vui lòng nhập tên dịch vụ");
            return;
        }

        try {
            setIsSubmitting(true);

            if (currentService) {
                // Update
                await apiClient.put(`/admin/services/${currentService.Ma_DV}`, formData);
                toast.success("Đã cập nhật dịch vụ");
            } else {
                // Create
                await apiClient.post("/admin/services", formData);
                toast.success("Đã tạo dịch vụ mới");
            }

            setIsDialogOpen(false);
            fetchServices();
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Lỗi khi lưu dịch vụ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;

        try {
            await apiClient.delete(`/admin/services/${serviceToDelete.Ma_DV}`);
            toast.success("Đã xóa dịch vụ");
            setServiceToDelete(null);
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Không thể xóa dịch vụ này (có thể đang được sử dụng)");
        }
    };

    const getLoaiDVLabel = (loai: number) => {
        switch (loai) {
            case 1: return <Badge className="bg-blue-500">Gói chụp</Badge>;
            case 3: return <Badge className="bg-purple-500">Bối cảnh</Badge>;
            default: return <Badge variant="secondary">Dịch vụ thêm</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Dịch vụ</h2>
                    <p className="text-muted-foreground">
                        Danh sách các dịch vụ hệ thống cung cấp
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm dịch vụ
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm dịch vụ..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Mã DV</TableHead>
                            <TableHead>Tên dịch vụ</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    Không tìm thấy dịch vụ nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            services.map((service) => (
                                <TableRow key={service.Ma_DV}>
                                    <TableCell className="font-medium">{service.Ma_DV}</TableCell>
                                    <TableCell>{service.Ten_DV}</TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={service.Mo_Ta}>
                                        {service.Mo_Ta}
                                    </TableCell>
                                    <TableCell>{getLoaiDVLabel(service.Loai_DV)}</TableCell>
                                    <TableCell>
                                        {service.Hoat_Dong ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">Hoạt động</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <XCircle className="w-4 h-4" />
                                                <span className="text-sm">Ẩn</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(service)}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setServiceToDelete(service)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="p-3">
                    <DialogHeader>
                        <DialogTitle>
                            {currentService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin chi tiết cho dịch vụ
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên dịch vụ</Label>
                            <Input
                                id="name"
                                value={formData.Ten_DV}
                                onChange={(e) => setFormData({ ...formData, Ten_DV: e.target.value })}
                                placeholder="Ví dụ: Chụp ảnh Kỷ yếu"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Loại dịch vụ</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.Loai_DV}
                                onChange={(e) => setFormData({ ...formData, Loai_DV: parseInt(e.target.value) })}
                            >
                                <option value={1}>Gói chụp (Genre)</option>
                                <option value={3}>Bối cảnh (Context)</option>
                                <option value={0}>Dịch vụ thêm (Extra)</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.Mo_Ta}
                                onChange={(e) => setFormData({ ...formData, Mo_Ta: e.target.value })}
                                placeholder="Mô tả chi tiết về dịch vụ..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="active"
                                checked={formData.Hoat_Dong}
                                onCheckedChange={(checked) => setFormData({ ...formData, Hoat_Dong: checked })}
                            />
                            <Label htmlFor="active">Đang hoạt động</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dịch vụ "{serviceToDelete?.Ten_DV}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Xóa dịch vụ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
