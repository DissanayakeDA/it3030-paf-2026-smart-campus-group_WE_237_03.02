import { useAuth } from "../../context/AuthContext";
import SidebarItem from "./SidebarItem";

function IconDashboard() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  );
}

function IconResource() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.742-.479 3 3 0 00-4.682-2.72m.94 3.198v-.001c0-1.113-.285-2.16-.787-3.07m0 0A5.987 5.987 0 0012 12.75a5.987 5.987 0 00-5.213 2.898m10.426 0A5.987 5.987 0 0012 12.75a5.987 5.987 0 00-5.213 2.898m0 0a3 3 0 00-4.681 2.72 9.091 9.091 0 003.74.477m.94-3.197a5.987 5.987 0 00-.787 3.069m10.426-8.448a4.5 4.5 0 11-8.848 0 4.5 4.5 0 018.848 0z"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  );
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#003559] flex flex-col transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#0353A4] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0353A4] flex items-center justify-center">
              <span className="text-[#B9D6F2] font-bold text-sm">SC</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              SmartCampus
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <SidebarItem
            to="/dashboard"
            label="Dashboard"
            icon={<IconDashboard />}
          />
          <SidebarItem to="/tickets" label="Tickets" icon={<IconTicket />} />

          <SidebarItem
            to="/resources"
            label="Resources"
            icon={<IconResource />}
          />
          {user?.role === "ADMIN" && (
            <SidebarItem
              to="/users"
              label="User Management"
              icon={<IconUsers />}
            />
          )}
          <SidebarItem
            to="/profile"
            label="My Profile"
            icon={<IconProfile />}
          />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-[#0353A4] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0353A4] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {user?.name ?? "—"}
              </p>
              <p className="text-[#B9D6F2] text-xs truncate">
                {user?.email ?? "—"}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="shrink-0 text-[#B9D6F2] hover:text-white transition-colors"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
