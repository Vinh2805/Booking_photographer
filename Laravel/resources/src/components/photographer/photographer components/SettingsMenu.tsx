import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ChevronRight } from "lucide-react";

interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  iconColor?: string;
}

interface SettingsMenuProps {
  menuItems: MenuItem[];
  onItemClick: (itemId: string) => void;
}

export function SettingsMenu({
  menuItems,
  onItemClick,
}: SettingsMenuProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 ${item.iconColor || "text-gray-600"}`}
                />
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`font-medium ${item.title || ""}`}
                >
                  {item.title}
                </p>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}