import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type { BookingResponse, BookingCreateRequest } from '../types/booking.types';

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

  getAll(): Promise<BookingResponse[]> {
    return api.get<BookingResponse[]>(BASE).then(r => r.data);
  },

  getById(id: number): Promise<BookingResponse> {
    return api.get<BookingResponse>(`${BASE}/${id}`).then(r => r.data);
  },

  getMyBookings(): Promise<BookingResponse[]> {
    return api.get<BookingResponse[]>(`${BASE}/mine`).then(r => r.data);
  }
};
