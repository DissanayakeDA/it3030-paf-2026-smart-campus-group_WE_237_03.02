// ── Enums ─────────────────────────────────────────────────────────────────────
// Values match the Java enum names exactly (SCREAMING_SNAKE_CASE).

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketCategory =
  | 'ELECTRICAL'
  | 'NETWORK'
  | 'PROJECTOR'
  | 'LAB_EQUIPMENT'
  | 'CLEANING'
  | 'FURNITURE'
  | 'OTHER';

export type ActorRole = 'ADMIN' | 'TECHNICIAN' | 'STUDENT';

// ── Response DTOs ─────────────────────────────────────────────────────────────
// Java Instant fields are serialised as ISO-8601 strings by Jackson.

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  preferredContact: string;
  resourceId: number | null;
  locationText: string;
  createdByUserId: number;
  assignedTechnicianId: number | null;
  rejectionReason: string | null;
  resolutionNotes: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCommentResponse {
  id: number;
  ticketId: number;
  authorUserId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachmentResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  publicId: string;
  uploadedAt: string;
}

export interface TicketSlaResponse {
  ticketId: number;
  timeToFirstResponseMinutes: number | null;
  timeToResolutionMinutes: number | null;
}

export interface TicketSummaryResponse {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageFirstResponseMinutes: number | null;
  averageResolutionMinutes: number | null;
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  preferredContact: string;
  resourceId?: number;
  locationText: string;
  createdByUserId: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  preferredContact: string;
  resourceId?: number;
  locationText: string;
  actingUserId: number;
}

export interface DeleteTicketRequest {
  actingUserId: number;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
  rejectionReason?: string;
  actingUserId: number;
  actorRole: ActorRole;
}

export interface AssignTechnicianRequest {
  technicianId: number;
  actingUserId: number;
  actorRole: ActorRole;
}

export interface AddResolutionNotesRequest {
  resolutionNotes: string;
  actingUserId: number;
  actorRole: ActorRole;
}

export interface AddTicketCommentRequest {
  content: string;
  authorUserId: number;
}

export interface UpdateTicketCommentRequest {
  content: string;
  actingUserId: number;
  actorRole: ActorRole;
}

export interface DeleteTicketCommentRequest {
  actingUserId: number;
  actorRole: ActorRole;
}
