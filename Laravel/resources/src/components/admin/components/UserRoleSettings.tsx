import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

interface UserRoleSettingsProps {
  userRoles: UserRole[];
}

export function UserRoleSettings({ userRoles }: UserRoleSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Vai trò người dùng</h4>
        <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-1" />
          Tạo vai trò
        </Button>
      </div>

      {userRoles.map((role) => (
        <div key={role.id} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">{role.name}</h5>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{role.userCount} người dùng</span>
            <Badge variant="outline" className="text-xs">
              {role.permissions.length} quyền
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
