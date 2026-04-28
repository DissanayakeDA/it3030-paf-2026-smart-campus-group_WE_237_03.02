/** In all envs, use `VITE_API_BASE_URL` when provided; otherwise dev uses same-origin + Vite proxy. */
export function getApiBaseURL(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) return configured;
  if (import.meta.env.DEV) return '';
  return '';
}
