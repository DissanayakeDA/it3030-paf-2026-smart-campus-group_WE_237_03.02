import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type { NotificationResponse } from '../types/notification.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BASE = '/api/notifications';

export const notificationService = {
  getForUser(userId: number): Promise<NotificationResponse[]> {
    return api.get<NotificationResponse[]>(BASE, { params: { userId } }).then(r => r.data);
  },

  getUnreadCount(userId: number): Promise<number> {
    return api.get<number>(`${BASE}/unread-count`, { params: { userId } }).then(r => r.data);
  },

  markRead(id: number): Promise<void> {
    return api.patch(`${BASE}/${id}/read`).then(() => undefined);
  },

  markAllRead(userId: number): Promise<void> {
    return api.patch(`${BASE}/mark-all-read`, null, { params: { userId } }).then(() => undefined);
  },
};
