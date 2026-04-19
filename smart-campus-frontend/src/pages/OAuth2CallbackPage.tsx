import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2CallbackPage() {
  const { loginWithOAuthTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError('OAuth login response is incomplete. Please try again.');
      return;
    }

    window.history.replaceState({}, document.title, '/oauth2/callback');
    loginWithOAuthTokens(accessToken, refreshToken)
      .catch(() => setError('Unable to complete OAuth login. Please try again.'));
  }, [loginWithOAuthTokens]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#061A40] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-xl font-semibold text-[#061A40] mb-3">OAuth sign-in failed</h1>
          <p className="text-sm text-gray-700 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full rounded-lg bg-[#0353A4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003559] transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061A40] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto mb-4 h-7 w-7 rounded-full border-2 border-[#0353A4]/30 border-t-[#0353A4] animate-spin" />
        <h1 className="text-lg font-semibold text-[#061A40]">Completing OAuth sign-in...</h1>
      </div>
    </div>
  );
}
