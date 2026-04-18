import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Auth integration goes here
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#061A40] flex items-center justify-center px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#0353A4] opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#006DAA] opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0353A4] mb-4">
            <span className="text-[#B9D6F2] font-bold text-2xl">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Campus</h1>
          <p className="text-[#B9D6F2] text-sm mt-1">Internal Facilities Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-[#061A40] mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#0353A4]" />
                Remember me
              </label>
              <a href="#" className="text-[#0353A4] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0353A4] hover:bg-[#003559] text-white font-semibold py-2.5 rounded-lg
                text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-[#B9D6F2] text-xs mt-6">
          Smart Campus — IT3030 PAF 2026 &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
