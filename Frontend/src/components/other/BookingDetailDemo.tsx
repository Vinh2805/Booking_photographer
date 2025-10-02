import { BookingDetail } from "./BookingDetail";

interface BookingDetailDemoProps {
  onBack: () => void;
}

export function BookingDetailDemo({ onBack }: BookingDetailDemoProps) {
  return <BookingDetail onBack={onBack} />;
}
