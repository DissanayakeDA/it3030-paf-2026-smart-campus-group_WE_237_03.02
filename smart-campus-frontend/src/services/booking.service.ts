import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type {
  BookingResponse,
  BookingCreateRequest,
  BookingUpdateRequest,
  BookingReviewRequest,
  BookingListFilters,
} from '../types/booking.types';
import type { Role } from '../types/auth.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BASE = '/api/bookings';

export const bookingService = {
  create(request: BookingCreateRequest): Promise<BookingResponse> {
    return api.post<BookingResponse>(BASE, request).then(r => r.data);
  },

  getAll(actingUserId: number, actorRole: Role, filters?: BookingListFilters): Promise<BookingResponse[]> {
    const params: Record<string, string | number> = { actingUserId, actorRole };
    if (filters?.status) params.status = filters.status;
    if (filters?.bookingDate) params.bookingDate = filters.bookingDate;
    if (filters?.resourceId != null) params.resourceId = filters.resourceId;
    if (filters?.userId != null) params.userId = filters.userId;
    return api.get<BookingResponse[]>(BASE, { params }).then(r => r.data);
  },

  approve(id: number, request: BookingReviewRequest): Promise<BookingResponse> {
    return api.patch<BookingResponse>(`${BASE}/${id}/approve`, request).then(r => r.data);
  },

  reject(id: number, request: BookingReviewRequest): Promise<BookingResponse> {
    return api.patch<BookingResponse>(`${BASE}/${id}/reject`, request).then(r => r.data);
  },

  cancel(id: number, request: BookingReviewRequest): Promise<BookingResponse> {
    return api.patch<BookingResponse>(`${BASE}/${id}/cancel`, request).then(r => r.data);
  },

  getById(id: number, actingUserId: number, actorRole: Role): Promise<BookingResponse> {
    return api
      .get<BookingResponse>(`${BASE}/${id}`, { params: { actingUserId, actorRole } })
      .then(r => r.data);
  },

  getMyBookings(actingUserId: number): Promise<BookingResponse[]> {
    return api
      .get<BookingResponse[]>(`${BASE}/my`, { params: { actingUserId } })
      .then(r => r.data);
  },

  /**
   * Update a booking owned by the current user.
   *
   * NOTE: The backend endpoint for user-side updates is not finalised yet.
   * We assume `PUT /api/bookings/{id}` with a body matching BookingUpdateRequest.
   * Keep this method as the single integration point — only this line needs
   * to change when the exact endpoint/verb/path is confirmed.
   */
  update(id: number, request: BookingUpdateRequest): Promise<BookingResponse> {
    return api.put<BookingResponse>(`${BASE}/${id}`, request).then(r => r.data);
  },

  delete(id: number, actingUserId: number): Promise<void> {
    return api.delete(`${BASE}/${id}`, { params: { actingUserId } }).then(() => undefined);
  },
};
