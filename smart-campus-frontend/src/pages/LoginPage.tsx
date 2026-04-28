import { useMemo, useState, type FormEvent } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthError = useMemo(() => {
    const raw = searchParams.get('oauth2Error');
    if (!raw) return null;
    return raw.replaceAll('+', ' ');
  }, [searchParams]);

  const googleOAuthUrl = useMemo(() => {
    const configuredBaseUrl = import.meta.env.VITE_OAUTH_BASE_URL?.trim()
      || import.meta.env.VITE_API_BASE_URL?.trim()
      || 'http://localhost:8080';
    return `${configuredBaseUrl.replace(/\/+$/, '')}/auth/oauth2/authorization/google`;
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? 'Invalid email or password. Please try again.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left panel: illustration ── */}
      <div className="hidden lg:flex lg:w-[58%] relative flex-col items-center justify-between bg-[#061A40] overflow-hidden px-12 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-120 h-120 rounded-full bg-[#0353A4] opacity-20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-120 h-120 rounded-full bg-[#006DAA] opacity-25 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-[#0353A4] opacity-5 blur-[120px]" />

        {/* Brand mark */}
        <div className="relative z-10 w-full flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0353A4]">
            <span className="text-white font-bold text-base tracking-tight">SC</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Smart Campus</p>
            <p className="text-[#B9D6F2] text-[11px] leading-none mt-0.5">Facilities Portal</p>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full py-6">
          <img
            src="/In the office-pana (1).svg"
            alt="Office illustration"
            className="w-full max-w-120 drop-shadow-2xl select-none"
            draggable={false}
          />
        </div>

        {/* Tagline */}
        <div className="relative z-10 w-full text-center pb-2">
          <h2 className="text-white text-2xl font-bold leading-snug">
            Everything your campus<br />needs, in one place.
          </h2>
          <p className="text-[#B9D6F2] text-sm mt-2 opacity-80">
            Book facilities, raise tickets, and stay connected — all from a single portal.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Room Booking', 'Support Tickets', 'Notifications', 'Resource Management'].map(f => (
              <span
                key={f}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-[#B9D6F2] border border-white/10 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-white relative">
        {/* Mobile brand (hidden on lg) */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0353A4]">
            <span className="text-white font-bold text-base">SC</span>
          </div>
          <div>
            <p className="text-[#061A40] font-semibold text-sm leading-none">Smart Campus</p>
            <p className="text-[#0353A4] text-[11px] leading-none mt-0.5">Facilities Portal</p>
          </div>
        </div>

        <div className="w-full max-w-100">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#061A40]">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to access your campus portal</p>
          </div>

          {/* Error banner */}
          {(error || oauthError) && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 leading-snug">{error ?? oauthError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/30 focus:border-[#0353A4] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
                    bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/30 focus:border-[#0353A4] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0353A4] hover:bg-[#003559] active:bg-[#002844] text-white font-semibold py-2.5 rounded-xl
                text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0353A4]/50 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#0353A4]/20 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google OAuth */}
            <a
              href={googleOAuthUrl}
              className="w-full border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl text-sm
                transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0353A4]/30 focus:ring-offset-2
                flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4.5 h-4.5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-10">
            Smart Campus — IT3030 PAF 2026 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
