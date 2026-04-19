export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CHECKED_IN';

export interface BookingResponse {
  id: number;
  resourceId: number;
  userId: number;
  userName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: BookingStatus;
  adminReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  resourceId: number;
  userId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
}
