import type { TicketStatus, TicketPriority, TicketCategory } from '../types/ticket.types';

// ── Status ────────────────────────────────────────────────────────────────────

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-red-100 text-red-600',
};

// ── Priority ──────────────────────────────────────────────────────────────────

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const TICKET_PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: 'bg-gray-100 text-gray-500',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-red-50 text-red-600',
  CRITICAL: 'bg-red-100 text-red-700 font-semibold',
};

// ── Category ──────────────────────────────────────────────────────────────────

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  ELECTRICAL: 'Electrical',
  NETWORK: 'Network',
  PROJECTOR: 'Projector',
  LAB_EQUIPMENT: 'Lab Equipment',
  CLEANING: 'Cleaning',
  FURNITURE: 'Furniture',
  OTHER: 'Other',
};

// ── Select options (for forms) ────────────────────────────────────────────────

export const TICKET_STATUS_OPTIONS = (Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(
  value => ({ value, label: TICKET_STATUS_LABELS[value] })
);

export const TICKET_PRIORITY_OPTIONS = (Object.keys(TICKET_PRIORITY_LABELS) as TicketPriority[]).map(
  value => ({ value, label: TICKET_PRIORITY_LABELS[value] })
);

export const TICKET_CATEGORY_OPTIONS = (Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[]).map(
  value => ({ value, label: TICKET_CATEGORY_LABELS[value] })
);
