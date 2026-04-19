import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import { resourceService } from '../services/resource.service';
import type { BookingResponse } from '../types/booking.types';
import type { ResourceResponse } from '../types/resource.types';
import { useAuth } from '../context/AuthContext';

interface UseMyBookingsResult {
  bookings: BookingResponse[];
  resourceMap: Record<number, ResourceResponse>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyBookings(): UseMyBookingsResult {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [resourceMap, setResourceMap] = useState<Record<number, ResourceResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    Promise.all([
      bookingService.getMyBookings(user.id),
      resourceService.getAll(),
    ])
      .then(([myBookings, resources]) => {
        setBookings(myBookings);
        const map: Record<number, ResourceResponse> = {};
        resources.forEach(r => { map[r.id] = r; });
        setResourceMap(map);
      })
      .catch(err => {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load your bookings.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bookings, resourceMap, loading, error, refetch: fetch };
}
