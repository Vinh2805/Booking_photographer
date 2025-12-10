
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import apiClient from "../services/apiClient";
import { toast } from "sonner";

interface ServiceItem {
    Ma_DV: string;
    Ten_DV: string;
    Mo_Ta: string;
    Loai_DV: number;
    is_active: boolean;
    price: number;
}

export default function PhotographerServiceManagement() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/profile/photographer/services");
            setServices(response.data);
        } catch (error) {
            console.error("Lỗi khi tải bảng giá:", error);
            toast.error("Không thể tải bảng giá dịch vụ");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = (id: string, active: boolean) => {
        setServices((prev) =>
            prev.map((s) => (s.Ma_DV === id ? { ...s, is_active: active } : s))
        );
    };

    const handlePriceChange = (id: string, price: string) => {
        setServices((prev) =>
            prev.map((s) => (s.Ma_DV === id ? { ...s, price: parseFloat(price) || 0 } : s))
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = services.map(s => ({
                Ma_DV: s.Ma_DV,
                price: s.price,
                is_active: s.is_active
            }));

            await apiClient.post("/profile/photographer/services",
                { services: payload }
            );

            toast.success("Đã cập nhật bảng giá thành công");
            fetchServices(); // Refresh
        } catch (error) {
            console.error("Lỗi khi lưu bảng giá:", error);
            toast.error("Lỗi khi cập nhật bảng giá");
        } finally {
            setSaving(false);
        }
    };

    const renderServiceList = (loaiDv: number) => {
        const items = services.filter((s) => s.Loai_DV === loaiDv);

        if (items.length === 0) {
            return <div className="text-center text-muted-foreground p-4">Không có dịch vụ nào trong mục này</div>;
        }

        return (
            <div className="grid gap-4">
                {items.map((service) => (
                    <div key={service.Ma_DV} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <Label className="text-base font-semibold cursor-pointer" htmlFor={`switch-${service.Ma_DV}`}>
                                    {service.Ten_DV}
                                </Label>
                                {service.is_active && <Badge variant="secondary">Đang cung cấp</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{service.Mo_Ta}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <Label htmlFor={`price-${service.Ma_DV}`} className="text-xs text-muted-foreground">Giá dịch vụ (VNĐ)</Label>
                                <Input
                                    id={`price-${service.Ma_DV}`}
                                    type="number"
                                    value={service.price}
                                    onChange={(e) => handlePriceChange(service.Ma_DV, e.target.value)}
                                    disabled={!service.is_active}
                                    className="w-32 text-right"
                                    min={0}
                                    step={1000}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`switch-${service.Ma_DV}`}
                                    checked={service.is_active}
                                    onCheckedChange={(checked) => handleToggleActive(service.Ma_DV, checked)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý Bảng giá Dịch vụ</h2>
                    <p className="text-muted-foreground">Cập nhật giá và trạng thái các dịch vụ bạn cung cấp</p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </div>

            <Tabs defaultValue="genres" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="genres">Gói Chụp (Genres)</TabsTrigger>
                    <TabsTrigger value="contexts">Bối Cảnh (Contexts)</TabsTrigger>
                    <TabsTrigger value="extras">Dịch Vụ Thêm (Extras)</TabsTrigger>
                </TabsList>

                <TabsContent value="genres" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gói chụp cơ bản</CardTitle>
                            <CardDescription>Các thể loại chụp ảnh chính mà bạn cung cấp (Loại 1)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderServiceList(1)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contexts" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bối cảnh chụp</CardTitle>
                            <CardDescription>Các bối cảnh chụp ảnh (Loại 3)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderServiceList(3)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="extras" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dịch vụ đi kèm</CardTitle>
                            <CardDescription>Các dịch vụ hỗ trợ khác (Loại 2)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderServiceList(0)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
