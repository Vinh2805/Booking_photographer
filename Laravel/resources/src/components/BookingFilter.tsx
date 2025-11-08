import React, { useState } from 'react';
import { 
  ChevronDown, 
  Filter,
  Calendar,
  Clock,
  CreditCard,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useSidebar } from './ui/sidebar';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const filterOptions: FilterOption[] = [
  {
    id: 'all',
    label: 'Tất cả',
    count: 6,
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    id: 'pending-confirmation',
    label: 'Chờ xác nhận',
    count: 1,
    icon: Clock,
    color: 'bg-yellow-500'
  },
  {
    id: 'pending-deposit',
    label: 'Chờ đặt cọc',
    count: 1,
    icon: CreditCard,
    color: 'bg-orange-500'
  },
  {
    id: 'upcoming',
    label: 'Sắp diễn ra',
    count: 1,
    icon: AlertCircle,
    color: 'bg-blue-500'
  },
  {
    id: 'in-progress',
    label: 'Đang diễn ra',
    count: 0,
    icon: PlayCircle,
    color: 'bg-green-500'
  },
  {
    id: 'pending-payment',
    label: 'Chờ thanh toán',
    count: 0,
    icon: CreditCard,
    color: 'bg-red-500'
  },
  {
    id: 'pending-processing',
    label: 'Chờ xử lý ảnh',
    count: 1,
    icon: Camera,
    color: 'bg-purple-500'
  },
  {
    id: 'processed',
    label: 'Đã xử lý ảnh',
    count: 1,
    icon: CheckCircle,
    color: 'bg-indigo-500'
  },
  {
    id: 'completed',
    label: 'Đã hoàn thành',
    count: 1,
    icon: CheckCircle,
    color: 'bg-green-600'
  },
  {
    id: 'cancelled',
    label: 'Đã hủy',
    count: 0,
    icon: XCircle,
    color: 'bg-gray-500'
  }
];

interface BookingFilterProps {
  onFilterChange?: (filterId: string) => void;
  selectedFilter?: string;
}

export function BookingFilter({ 
  onFilterChange = () => {}, 
  selectedFilter = 'all' 
}: BookingFilterProps) {
  const { state } = useSidebar();
  const [currentFilter, setCurrentFilter] = useState(selectedFilter);

  const selectedOption = filterOptions.find(option => option.id === currentFilter) || filterOptions[0];

  const handleFilterSelect = (filterId: string) => {
    setCurrentFilter(filterId);
    onFilterChange(filterId);
  };

  // Collapsed state - show filter icon only
  if (state === 'collapsed') {
    return (
      <div className="px-2 pb-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/50 hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            side="right" 
            align="start"
            className="w-64 max-h-80 overflow-y-auto"
          >
            <div className="px-3 py-2 border-b">
              <p className="font-medium text-sm">Lọc buổi chụp</p>
              <p className="text-xs text-muted-foreground">Chọn trạng thái</p>
            </div>
            
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleFilterSelect(option.id)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                  currentFilter === option.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${option.color}`} />
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{option.label}</span>
                </div>
                <Badge 
                  variant={option.count > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {option.count}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Expanded state - show full filter card
  return (
    <div className="px-2 pb-3 border-b">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Lọc buổi chụp
            </span>
          </div>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-800/30 border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedOption.color}`} />
                <selectedOption.icon className="h-4 w-4" />
                <span className="text-sm">{selectedOption.label}</span>
                <Badge 
                  variant={selectedOption.count > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {selectedOption.count}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-full max-h-80 overflow-y-auto"
            align="start"
          >
            <div className="px-3 py-2 border-b">
              <p className="font-medium text-sm">Chọn trạng thái buổi chụp</p>
              <p className="text-xs text-muted-foreground">Tất cả: {filterOptions.reduce((sum, option) => sum + option.count, 0)} buổi chụp</p>
            </div>
            
            {filterOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <DropdownMenuItem
                  onClick={() => handleFilterSelect(option.id)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer ${
                    currentFilter === option.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <Badge 
                    variant={option.count > 0 ? "default" : "secondary"}
                    className={`text-xs ${currentFilter === option.id ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {option.count}
                  </Badge>
                </DropdownMenuItem>
                
                {/* Separator after certain groups */}
                {(index === 0 || index === 3 || index === 6) && (
                  <DropdownMenuSeparator />
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick stats */}
        <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
          <span>Hoạt động: {filterOptions.filter(f => f.count > 0).length}</span>
          <span>Tổng: {filterOptions.reduce((sum, option) => sum + option.count, 0)}</span>
        </div>
      </div>
    </div>
  );
}