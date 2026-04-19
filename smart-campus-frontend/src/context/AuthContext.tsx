import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { UserDTO } from '../types/auth.types';

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEY_ACCESS  = 'sc_access_token';
const KEY_REFRESH = 'sc_refresh_token';
const KEY_USER    = 'sc_user';

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  setCurrentUser: (nextUser: UserDTO) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem(KEY_ACCESS)
  );
  const [user, setUser] = useState<UserDTO | null>(() => {
    const raw = localStorage.getItem(KEY_USER);
    if (!raw) return null;
    try { return JSON.parse(raw) as UserDTO; } catch { return null; }
  });

  // Persist to localStorage whenever values change
  useEffect(() => {
    if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
    else localStorage.removeItem(KEY_ACCESS);
  }, [accessToken]);

  useEffect(() => {
    if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
    else localStorage.removeItem(KEY_USER);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await authService.login({ email: normalizedEmail, password });
    localStorage.setItem(KEY_ACCESS,  response.accessToken);
    localStorage.setItem(KEY_REFRESH, response.refreshToken);
    localStorage.setItem(KEY_USER,    JSON.stringify(response.user));
    setAccessToken(response.accessToken);
    setUser(response.user);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const setCurrentUser = useCallback((nextUser: UserDTO) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    localStorage.removeItem(KEY_USER);
    setAccessToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthenticated: !!accessToken && !!user, login, setCurrentUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
