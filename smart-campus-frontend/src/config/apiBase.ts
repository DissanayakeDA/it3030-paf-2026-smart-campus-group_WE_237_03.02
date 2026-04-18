/** Dev: same-origin + Vite proxy (ignores VITE_API_BASE_URL). Prod: `VITE_API_BASE_URL` or ''. */
export function getApiBaseURL(): string {
  if (import.meta.env.DEV) return '';
  return import.meta.env.VITE_API_BASE_URL ?? '';
}
