import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tickets': 'Tickets',
  '/tickets/create': 'Create Ticket',
  '/resources': 'Resources',
  '/resources/create': 'Add Resource',
  '/users': 'User Management',
  '/profile': 'My Profile',
  '/bookings/new': 'New Booking Request',
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/tickets/')) return 'Ticket Details';
  if (pathname.startsWith('/resources/edit/')) return 'Edit Resource';
  return 'Smart Campus';
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Spacer: invisible on mobile (sidebar is an overlay),
        visible on desktop to reserve exactly 256 px so flex-1
        gets the correct remaining width — no overflow.
      */}
      <div className="hidden lg:block w-64 shrink-0" aria-hidden="true" />

      {/* Main column — correctly sized to viewport minus sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader title={title} onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
