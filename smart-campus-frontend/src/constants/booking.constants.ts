import type { BookingStatus } from '../types/booking.types';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked In',
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
  CHECKED_IN: 'bg-blue-100 text-blue-700',
};

export const BOOKING_STATUS_FILTERS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Pending',     value: 'PENDING' },
  { label: 'Approved',    value: 'APPROVED' },
  { label: 'Rejected',    value: 'REJECTED' },
  { label: 'Cancelled',   value: 'CANCELLED' },
  { label: 'Checked In',  value: 'CHECKED_IN' },
];

/**
 * Business rule: a user can only edit their own bookings while the booking
 * is still PENDING. Approved, rejected, cancelled or checked-in bookings
 * are locked.
 */
export function canEditBooking(status: BookingStatus): boolean {
  return status === 'PENDING';
}

export function getEditDisabledReason(status: BookingStatus): string {
  switch (status) {
    case 'APPROVED':   return 'Approved bookings cannot be edited.';
    case 'REJECTED':   return 'Rejected bookings cannot be edited.';
    case 'CANCELLED':  return 'Cancelled bookings cannot be edited.';
    case 'CHECKED_IN': return 'Checked-in bookings cannot be edited.';
    default:           return '';
  }
}
