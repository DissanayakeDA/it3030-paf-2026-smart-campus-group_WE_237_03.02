import { useState, useEffect, useCallback } from 'react';
import { ticketService, type TicketListFilters } from '../services/ticket.service';
import type { TicketResponse } from '../types/ticket.types';

interface UseTicketsResult {
  tickets: TicketResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTickets(filters: TicketListFilters = {}): UseTicketsResult {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status, createdByUserId } = filters;

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    ticketService
      .getAll({ status, createdByUserId })
      .then(setTickets)
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load tickets.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [status, createdByUserId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tickets, loading, error, refetch: fetch };
}
