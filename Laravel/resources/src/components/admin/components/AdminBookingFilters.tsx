import { Button } from "../../ui/button";
import { getStatusOptions } from "../utils/adminBookingsUtils";
import type { BookingStatus } from "../types/adminBookingTypes";

interface AdminBookingFiltersProps {
  selectedStatus: BookingStatus | "all";
  onStatusChange: (status: BookingStatus | "all") => void;
  showFilters: boolean;
  onToggleFilters: (show: boolean) => void;
}

export function AdminBookingFilters({
  selectedStatus,
  onStatusChange,
  showFilters,
  onToggleFilters,
}: AdminBookingFiltersProps) {
  const statusOptions = getStatusOptions();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {statusOptions.map(({ value, label }) => (
        <Button
          key={value}
          variant={selectedStatus === value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(value)}
          className="whitespace-nowrap"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
