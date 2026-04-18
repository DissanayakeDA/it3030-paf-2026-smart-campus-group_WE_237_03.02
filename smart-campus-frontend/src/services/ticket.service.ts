import axios from 'axios';
import type {
  TicketResponse,
  TicketCommentResponse,
  TicketAttachmentResponse,
  TicketSlaResponse,
  TicketSummaryResponse,
  CreateTicketRequest,
  UpdateTicketStatusRequest,
  AssignTechnicianRequest,
  AddResolutionNotesRequest,
  AddTicketCommentRequest,
  UpdateTicketCommentRequest,
  DeleteTicketCommentRequest,
} from '../types/ticket.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

const BASE = '/api/tickets';

// ── Ticket CRUD ───────────────────────────────────────────────────────────────

export const ticketService = {
  create(data: CreateTicketRequest): Promise<TicketResponse> {
    return api.post<TicketResponse>(BASE, data).then(r => r.data);
  },

  getById(id: number): Promise<TicketResponse> {
    return api.get<TicketResponse>(`${BASE}/${id}`).then(r => r.data);
  },

  getSla(id: number): Promise<TicketSlaResponse> {
    return api.get<TicketSlaResponse>(`${BASE}/${id}/sla`).then(r => r.data);
  },

  getSlaSummary(): Promise<TicketSummaryResponse> {
    return api.get<TicketSummaryResponse>(`${BASE}/admin/sla-summary`).then(r => r.data);
  },

  updateStatus(id: number, data: UpdateTicketStatusRequest): Promise<TicketResponse> {
    return api.patch<TicketResponse>(`${BASE}/${id}/status`, data).then(r => r.data);
  },

  assignTechnician(id: number, data: AssignTechnicianRequest): Promise<TicketResponse> {
    return api.patch<TicketResponse>(`${BASE}/${id}/assign-technician`, data).then(r => r.data);
  },

  addResolutionNotes(id: number, data: AddResolutionNotesRequest): Promise<TicketResponse> {
    return api.patch<TicketResponse>(`${BASE}/${id}/resolution-notes`, data).then(r => r.data);
  },

  // ── Comments ────────────────────────────────────────────────────────────────

  addComment(ticketId: number, data: AddTicketCommentRequest): Promise<TicketCommentResponse> {
    return api.post<TicketCommentResponse>(`${BASE}/${ticketId}/comments`, data).then(r => r.data);
  },

  listComments(ticketId: number): Promise<TicketCommentResponse[]> {
    return api.get<TicketCommentResponse[]>(`${BASE}/${ticketId}/comments`).then(r => r.data);
  },

  updateComment(commentId: number, data: UpdateTicketCommentRequest): Promise<TicketCommentResponse> {
    return api
      .put<TicketCommentResponse>(`/api/ticket-comments/${commentId}`, data)
      .then(r => r.data);
  },

  deleteComment(commentId: number, data: DeleteTicketCommentRequest): Promise<void> {
    return api.delete(`/api/ticket-comments/${commentId}`, { data }).then(() => undefined);
  },

  // ── Attachments ─────────────────────────────────────────────────────────────
  // Backend accepts multipart/form-data with a single "file" field (image/* only, max 3).

  uploadAttachment(ticketId: number, file: File): Promise<TicketAttachmentResponse> {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<TicketAttachmentResponse>(`${BASE}/${ticketId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data);
  },

  getAttachments(ticketId: number): Promise<TicketAttachmentResponse[]> {
    return api
      .get<TicketAttachmentResponse[]>(`${BASE}/${ticketId}/attachments`)
      .then(r => r.data);
  },
};
