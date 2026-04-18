import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { UserDTO } from '../types/auth.types';

const KEY_ACCESS = 'sc_access_token';
const KEY_REFRESH = 'sc_refresh_token';
const KEY_USER = 'sc_user';

const INACTIVITY_MS = 60 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

interface AuthContextValue {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  touchActivity: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const lastActivityRef = useRef(Date.now());

  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem(KEY_ACCESS)
  );
  const [user, setUser] = useState<UserDTO | null>(() => {
    const raw = localStorage.getItem(KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDTO;
    } catch {
      return null;
    }
  });

  const touchActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    localStorage.removeItem(KEY_USER);
    setAccessToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (accessToken) localStorage.setItem(KEY_ACCESS, accessToken);
    else localStorage.removeItem(KEY_ACCESS);
  }, [accessToken]);

  useEffect(() => {
    if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
    else localStorage.removeItem(KEY_USER);
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    lastActivityRef.current = Date.now();
  }, [accessToken]);

  useEffect(() => {
    const bump = () => touchActivity();
    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, bump, { passive: true }));
    const onApi = () => touchActivity();
    window.addEventListener('sc-activity', onApi);
    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, bump));
      window.removeEventListener('sc-activity', onApi);
    };
  }, [touchActivity]);

  useEffect(() => {
    if (!accessToken) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_MS) {
        logout();
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [accessToken, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await authService.login({ email: normalizedEmail, password });
      localStorage.setItem(KEY_ACCESS, response.accessToken);
      localStorage.setItem(KEY_REFRESH, response.refreshToken);
      localStorage.setItem(KEY_USER, JSON.stringify(response.user));
      lastActivityRef.current = Date.now();
      setAccessToken(response.accessToken);
      setUser(response.user);
      navigate('/dashboard', { replace: true });
    },
    [navigate]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const response = await authService.loginWithGoogle({ idToken });
      localStorage.setItem(KEY_ACCESS, response.accessToken);
      localStorage.setItem(KEY_REFRESH, response.refreshToken);
      localStorage.setItem(KEY_USER, JSON.stringify(response.user));
      lastActivityRef.current = Date.now();
      setAccessToken(response.accessToken);
      setUser(response.user);
      navigate('/dashboard', { replace: true });
    },
    [navigate]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        login,
        loginWithGoogle,
        logout,
        touchActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
