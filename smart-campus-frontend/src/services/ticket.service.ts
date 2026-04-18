import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
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
  TicketStatus,
} from '../types/ticket.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => {
    window.dispatchEvent(new Event('sc-activity'));
    return response;
  },
  error => {
    window.dispatchEvent(new Event('sc-activity'));
    if (error?.response?.status === 401) {
      localStorage.removeItem('sc_access_token');
      localStorage.removeItem('sc_refresh_token');
      localStorage.removeItem('sc_user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

const BASE = '/api/tickets';

// ── Ticket CRUD ───────────────────────────────────────────────────────────────

export type TicketListFilters = {
  status?: TicketStatus;
  createdByUserId?: number;
};

export const ticketService = {
  getAll(filters?: TicketListFilters): Promise<TicketResponse[]> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.createdByUserId != null) params.createdByUserId = filters.createdByUserId;
    return api.get<TicketResponse[]>(BASE, { params }).then(r => r.data);
  },

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

  deleteComment(commentId: number): Promise<void> {
    return api.delete(`/api/ticket-comments/${commentId}`).then(() => undefined);
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
