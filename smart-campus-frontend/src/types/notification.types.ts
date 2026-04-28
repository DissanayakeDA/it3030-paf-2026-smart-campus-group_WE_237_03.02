export type NotificationType =
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_COMMENT_ADDED';

export interface NotificationResponse {
  id: number;
  recipientUserId: number;
  type: NotificationType;
  message: string;
  referenceId: number | null;
  read: boolean;
  createdAt: string;
}
