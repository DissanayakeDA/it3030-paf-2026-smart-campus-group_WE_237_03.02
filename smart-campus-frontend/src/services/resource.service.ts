import axios from 'axios';
import { getApiBaseURL } from '../config/apiBase';
import type { ResourceResponse, ResourceListFilters } from '../types/resource.types';

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BASE = '/api/resources';

export const resourceService = {
  getAll(filters?: ResourceListFilters): Promise<ResourceResponse[]> {
    const params: Record<string, string | number> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.minCapacity != null) params.minCapacity = filters.minCapacity;
    if (filters?.location) params.location = filters.location;
    if (filters?.status) params.status = filters.status;
    return api.get<ResourceResponse[]>(BASE, { params }).then(r => r.data);
  },

  getById(id: number): Promise<ResourceResponse> {
    return api.get<ResourceResponse>(`${BASE}/${id}`).then(r => r.data);
  },
};
