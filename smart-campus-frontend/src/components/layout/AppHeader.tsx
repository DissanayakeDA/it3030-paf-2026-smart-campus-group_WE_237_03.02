import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export default function AppHeader({ title, onMenuToggle }: AppHeaderProps) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-lg font-semibold text-[#061A40] truncate">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        {user?.role && (
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#B9D6F2] text-[#003559]">
            {user.role}
          </span>
        )}

        {/* Notification bell */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {/* Avatar with tooltip showing full name */}
        <div
          title={user?.name ?? ''}
          className="w-8 h-8 rounded-full bg-[#0353A4] flex items-center justify-center cursor-default select-none"
        >
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
