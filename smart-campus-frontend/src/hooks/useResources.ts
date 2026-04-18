import { useState, useEffect, useCallback } from 'react';
import { resourceService } from '../services/resource.service';
import type { ResourceResponse, ResourceListFilters } from '../types/resource.types';

interface UseResourcesResult {
  resources: ResourceResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useResources(filters: ResourceListFilters = {}): UseResourcesResult {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { type, minCapacity, location, status } = filters;

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    resourceService
      .getAll({ type, minCapacity, location, status })
      .then(setResources)
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load resources.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [type, minCapacity, location, status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { resources, loading, error, refetch: fetch };
}
