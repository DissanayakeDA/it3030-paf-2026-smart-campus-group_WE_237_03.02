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

function IconPlus() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
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
        <div className="h-16 flex items-center px-6 border-b border-[#0353A4] flex-shrink-0">
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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#0353A4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0353A4] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">U</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                Campus User
              </p>
              <p className="text-[#B9D6F2] text-xs truncate">user@campus.edu</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
