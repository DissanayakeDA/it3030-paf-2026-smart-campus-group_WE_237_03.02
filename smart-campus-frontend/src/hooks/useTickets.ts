import { useState, useEffect, useCallback } from 'react';
import { ticketService, type TicketListFilters } from '../services/ticket.service';
import type { TicketResponse } from '../types/ticket.types';
import { useAuth } from '../context/AuthContext';
import type { ActorRole } from '../types/ticket.types';

interface UseTicketsResult {
  tickets: TicketResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTickets(filters: TicketListFilters = {}): UseTicketsResult {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status, createdByUserId, actingUserId, actorRole } = filters;

  const resolvedActingUserId = actingUserId ?? user?.id;
  const resolvedActorRole: ActorRole | undefined = actorRole ?? (
    user ? (user.role === 'USER' ? 'STUDENT' : user.role) : undefined
  );

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    ticketService
      .getAll({
        status,
        createdByUserId,
        actingUserId: resolvedActingUserId,
        actorRole: resolvedActorRole,
      })
      .then(setTickets)
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load tickets.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [status, createdByUserId, resolvedActingUserId, resolvedActorRole]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { tickets, loading, error, refetch: fetch };
}
