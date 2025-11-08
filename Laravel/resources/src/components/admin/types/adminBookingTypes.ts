export type BookingStatus = 
  | 'pending' 
  | 'deposit' 
  | 'upcoming' 
  | 'ongoing' 
  | 'payment' 
  | 'processing' 
  | 'processed' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export interface AdminBooking {
  id: string;
  status: BookingStatus;
  title: string;
  customer: {
    name: string;
    avatar: string;
    id: string;
  };
  photographer: {
    name: string;
    avatar: string;
    id: string;
  };
  type: string;
  location: string;
  date: string;
  time: string;
  price: number;
  createdAt: string;
  issues?: string[];
  notes?: string;
}

export interface StatusInfo {
  label: string;
  color: string;
}