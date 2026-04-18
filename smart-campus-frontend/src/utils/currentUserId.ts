/**
 * Reads the authenticated user's ID from localStorage (written by AuthContext on login).
 * Prefer `useAuth().user?.id` inside React components.
 * Use this only in non-component contexts (hooks, services).
 */
export function getCurrentUserId(): number | undefined {
  try {
    const raw = localStorage.getItem('sc_user');
    if (!raw) return undefined;
    const user = JSON.parse(raw) as { id?: number };
    return typeof user.id === 'number' ? user.id : undefined;
  } catch {
    return undefined;
  }
}
