import { MomentiaLogo } from "./MomentiaLogo";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export function LogoShowcase() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            Momentia Logo Showcase
          </h1>
          <p className="text-lg text-muted-foreground">
            Các biến thể logo được cải tiến cho ứng dụng Momentia
          </p>
        </div>

        {/* Variants Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Full Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Full Logo (Mặc định)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Kích thước khác nhau:</h4>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Small:</span>
                    <MomentiaLogo
                      variant="full"
                      size="sm"
                      userType="customer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Medium:</span>
                    <MomentiaLogo
                      variant="full"
                      size="md"
                      userType="customer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Large:</span>
                    <MomentiaLogo
                      variant="full"
                      size="lg"
                      userType="customer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">XL:</span>
                    <MomentiaLogo
                      variant="full"
                      size="xl"
                      userType="customer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">User Types:</h4>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="full" size="md" userType="customer" />
                  <MomentiaLogo
                    variant="full"
                    size="md"
                    userType="photographer"
                  />
                  <MomentiaLogo variant="full" size="md" userType="admin" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Animation:</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo
                    variant="full"
                    size="lg"
                    animated={true}
                    userType="customer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Image Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Sử dụng logo hình ảnh thực tế:</h4>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Small:</span>
                    <MomentiaLogo
                      variant="image"
                      size="sm"
                      userType="customer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Medium:</span>
                    <MomentiaLogo
                      variant="image"
                      size="md"
                      userType="customer"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">Large:</span>
                    <MomentiaLogo
                      variant="image"
                      size="lg"
                      userType="customer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Chỉ icon (không text):</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="image" size="lg" showText={false} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Animation:</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo
                    variant="image"
                    size="lg"
                    animated={true}
                    userType="photographer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Compact Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Phù hợp cho navigation:</h4>
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="compact" size="sm" />
                  <MomentiaLogo variant="compact" size="md" />
                  <MomentiaLogo variant="compact" size="lg" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Animation:</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="compact" size="lg" animated={true} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Icon Only Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Icon Only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Chỉ icon, không text:</h4>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="icon" size="sm" />
                  <MomentiaLogo variant="icon" size="md" />
                  <MomentiaLogo variant="icon" size="lg" />
                  <MomentiaLogo variant="icon" size="xl" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Animation:</h4>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <MomentiaLogo variant="icon" size="xl" animated={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Ví dụ sử dụng trong ứng dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Header Example */}
            <div className="space-y-4">
              <h4 className="font-medium">Header Navigation:</h4>
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center justify-between">
                  <MomentiaLogo variant="compact" size="md" animated={true} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                    <Button size="sm">Sign Up</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Example */}
            <div className="space-y-4">
              <h4 className="font-medium">Sidebar:</h4>
              <div className="p-6 bg-card border rounded-lg w-64">
                <MomentiaLogo
                  variant="full"
                  size="lg"
                  animated={true}
                  userType="customer"
                />
              </div>
            </div>

            {/* Mobile App Example */}
            <div className="space-y-4">
              <h4 className="font-medium">Mobile App Icon:</h4>
              <div className="p-4 bg-muted/50 rounded-lg">
                <MomentiaLogo variant="icon" size="lg" animated={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Hiển thị trên nền khác nhau</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Light Background */}
              <div className="space-y-4">
                <h4 className="font-medium">Nền sáng:</h4>
                <div className="p-6 bg-white border rounded-lg">
                  <MomentiaLogo
                    variant="full"
                    size="lg"
                    animated={true}
                    userType="customer"
                  />
                </div>
              </div>

              {/* Dark Background */}
              <div className="space-y-4">
                <h4 className="font-medium">Nền tối:</h4>
                <div className="p-6 bg-slate-900 rounded-lg">
                  <MomentiaLogo
                    variant="full"
                    size="lg"
                    animated={true}
                    userType="customer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
