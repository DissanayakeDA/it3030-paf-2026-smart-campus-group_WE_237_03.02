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

/**
 * Payload used when a user updates their own booking.
 * Isolated from the create DTO so the exact backend endpoint/shape
 * can be adjusted in one place when wired up.
 */
export interface BookingReviewRequest {
  reason?: string;
  actingUserId: number;
  actorRole: 'USER' | 'ADMIN' | 'TECHNICIAN';
}

export interface BookingListFilters {
  status?: BookingStatus;
  bookingDate?: string;
  resourceId?: number;
  userId?: number;
}

export interface BookingUpdateRequest {
  resourceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  actingUserId?: number;
}
