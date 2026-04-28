import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentTicketsTable from '../components/dashboard/RecentTicketsTable';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { useResources } from '../hooks/useResources';
import { useMyBookings } from '../hooks/useMyBookings';
import { ticketService } from '../services/ticket.service';
import { bookingService } from '../services/booking.service';
import type { TicketResponse, TicketSummaryResponse } from '../types/ticket.types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatMinutes(min: number | null): string {
  if (min === null) return '—';
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function formatBookingDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconOpen = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#0353A4" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const IconProgress = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#d97706" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const IconResolved = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#16a34a" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconResolution = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#ea580c" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
  </svg>
);

const IconAssigned = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#0f766e" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5v15H3.75zM8.25 9h7.5M8.25 12h7.5M8.25 15h4.5" />
  </svg>
);

const IconTicket = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
  </svg>
);

const IconResource = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const IconBooking = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const IconPendingBooking = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#ea580c" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const IconUsers = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const IconProfile = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconAddResource = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#003559" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── Role badge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    TECHNICIAN: 'bg-purple-100 text-purple-700',
    USER: 'bg-[#B9D6F2] text-[#003559]',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[role] ?? styles.USER}`}>
      {role}
    </span>
  );
}

// ── Urgency alert ─────────────────────────────────────────────────────────────

function UrgencyAlert({ tickets }: { tickets: TicketResponse[] }) {
  const urgent = tickets.filter(
    (t) => (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status === 'OPEN'
  );
  if (urgent.length === 0) return null;

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-amber-600 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-sm font-semibold text-amber-700">
          {urgent.length} urgent ticket{urgent.length !== 1 ? 's' : ''} need{urgent.length === 1 ? 's' : ''} attention
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {urgent.slice(0, 4).map((t) => (
          <Link
            key={t.id}
            to={`/tickets/${t.id}`}
            className="inline-flex items-center gap-1.5 text-xs bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                t.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
              }`}
            />
            #{t.id} {t.title.length > 28 ? `${t.title.slice(0, 28)}…` : t.title}
          </Link>
        ))}
        {urgent.length > 4 && (
          <Link to="/tickets" className="text-xs text-amber-600 hover:underline self-center">
            +{urgent.length - 4} more
          </Link>
        )}
      </div>
    </div>
  );
}

// ── User dashboard ────────────────────────────────────────────────────────────

function UserDashboard({ userId, userName, role }: { userId: number; userName: string; role: string }) {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets({ createdByUserId: userId });
  const { bookings, resourceMap, loading: bookingsLoading } = useMyBookings();

  const ticketStats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return { open, inProgress, resolved };
  }, [tickets]);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'PENDING').length,
    [bookings]
  );

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings
      .filter((b) => b.status === 'APPROVED' && new Date(b.bookingDate) >= today)
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
      .slice(0, 3);
  }, [bookings]);

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            {getGreeting()}, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">Here's a quick look at your tickets and campus tools.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="My Open Tickets"
          value={ticketStats.open}
          delta="Awaiting response"
          color="bg-blue-50"
          icon={IconOpen}
          accentColor="#0353A4"
        />
        <StatCard
          label="In Progress"
          value={ticketStats.inProgress}
          delta="Being worked on"
          color="bg-yellow-50"
          icon={IconProgress}
          accentColor="#d97706"
        />
        <StatCard
          label="Resolved"
          value={ticketStats.resolved}
          delta="Successfully closed"
          color="bg-green-50"
          icon={IconResolved}
          accentColor="#16a34a"
        />
        <StatCard
          label="Pending Bookings"
          value={bookingsLoading ? '…' : pendingBookings}
          delta="Awaiting approval"
          color="bg-orange-50"
          icon={IconPendingBooking}
          accentColor="#ea580c"
        />
      </div>

      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Jump straight into what you need" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Report an Issue"
            description="Create a new maintenance ticket"
            to="/tickets/create"
            icon={IconTicket}
          />
          <QuickActionCard
            title="My Bookings"
            description="View and manage your reservations"
            to="/bookings"
            icon={IconBooking}
          />
          <QuickActionCard
            title="Request Booking"
            description="Reserve a room or campus resource"
            to="/bookings/new"
            icon={IconResource}
          />
        </div>
      </div>

      {!bookingsLoading && upcomingBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionTitle
              title="Upcoming Bookings"
              subtitle="Your approved upcoming reservations"
              action={
                <Link to="/bookings" className="text-sm text-[#0353A4] hover:underline font-medium">
                  View all
                </Link>
              }
            />
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingBookings.map((booking) => {
              const resource = resourceMap[booking.resourceId];
              return (
                <div key={booking.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#16a34a" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#061A40] truncate">
                        {resource?.name ?? `Resource #${booking.resourceId}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatBookingDate(booking.bookingDate)} · {booking.startTime} – {booking.endTime}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 shrink-0">
                    Approved
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="My Recent Tickets"
            subtitle="Your latest submissions"
            action={
              <Link to="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </Link>
            }
          />
        </div>
        {ticketsLoading ? (
          <LoadingSpinner message="Loading your tickets…" />
        ) : ticketsError ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{ticketsError}</div>
        ) : (
          <RecentTicketsTable tickets={recentTickets} emptyMessage="You haven't submitted any tickets yet." />
        )}
      </div>
    </>
  );
}

// ── Admin dashboard ────────────────────────────────────────────────────────────

function AdminDashboard({ userId, userName, role }: { userId: number; userName: string; role: string }) {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets();
  const [summary, setSummary] = useState<TicketSummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [pendingBookings, setPendingBookings] = useState<number | null>(null);

  useEffect(() => {
    ticketService
      .getSlaSummary()
      .then(setSummary)
      .catch((err) => {
        setSummaryError(err instanceof Error ? err.message : 'Failed to load summary.');
      });
  }, []);

  useEffect(() => {
    bookingService
      .getAll(userId, 'ADMIN', { status: 'PENDING' })
      .then((b) => setPendingBookings(b.length))
      .catch(() => setPendingBookings(0));
  }, [userId]);

  const inProgress = useMemo(
    () => tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    [tickets]
  );

  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            {getGreeting()}, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">System overview and recent ticket activity.</p>
      </div>

      <UrgencyAlert tickets={tickets} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Tickets"
          value={summary?.openTickets ?? '—'}
          delta={summary ? `${summary.totalTickets} total` : (summaryError ?? 'Loading…')}
          color="bg-blue-50"
          icon={IconOpen}
          accentColor="#0353A4"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          delta="Currently being handled"
          color="bg-yellow-50"
          icon={IconProgress}
          accentColor="#d97706"
        />
        <StatCard
          label="Resolved"
          value={summary?.resolvedTickets ?? '—'}
          delta={`Avg ${formatMinutes(summary?.averageResolutionMinutes ?? null)} resolution`}
          color="bg-green-50"
          icon={IconResolved}
          accentColor="#16a34a"
        />
        <StatCard
          label="Pending Bookings"
          value={pendingBookings ?? '—'}
          delta="Awaiting your review"
          color="bg-orange-50"
          icon={IconPendingBooking}
          accentColor="#ea580c"
        />
      </div>

      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Manage the campus at a glance" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="All Tickets"
            description="Review and manage every request"
            to="/tickets"
            icon={IconTicket}
          />
          <QuickActionCard
            title="User Management"
            description="Manage campus user accounts"
            to="/users"
            icon={IconUsers}
          />
          <QuickActionCard
            title="All Bookings"
            description="Review and approve booking requests"
            to="/admin/bookings"
            icon={IconBooking}
            badge={
              pendingBookings !== null && pendingBookings > 0
                ? String(pendingBookings)
                : undefined
            }
          />
          <QuickActionCard
            title="Manage Resources"
            description="View and update the catalogue"
            to="/resources"
            icon={IconResource}
          />
          <QuickActionCard
            title="Add Resource"
            description="Register a new room or asset"
            to="/resources/create"
            icon={IconAddResource}
          />
          <QuickActionCard
            title="My Profile"
            description="View and update your account"
            to="/profile"
            icon={IconProfile}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="Recent Tickets"
            subtitle="Latest facility requests across campus"
            action={
              <Link to="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </Link>
            }
          />
        </div>
        {ticketsLoading ? (
          <LoadingSpinner message="Loading tickets…" />
        ) : ticketsError ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{ticketsError}</div>
        ) : (
          <RecentTicketsTable tickets={recent} />
        )}
      </div>
    </>
  );
}

// ── Technician dashboard ──────────────────────────────────────────────────────

function TechnicianDashboard({ userId, userName, role }: { userId: number; userName: string; role: string }) {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets({
    assignedTechnicianId: userId,
  });
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources();

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const assignedResourceIds = new Set(
      tickets.map((t) => t.resourceId).filter((id): id is number => id != null)
    );
    return { open, inProgress, resolved, total: tickets.length, resourceCount: assignedResourceIds.size };
  }, [tickets]);

  const recentAssigned = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  const assignedResources = useMemo(() => {
    const assignedIds = new Set(
      tickets.map((t) => t.resourceId).filter((id): id is number => id != null)
    );
    return resources.filter((r) => assignedIds.has(r.id));
  }, [resources, tickets]);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            {getGreeting()}, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">Your assigned maintenance work and related resources.</p>
      </div>

      <UrgencyAlert tickets={tickets} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Assigned Open"
          value={stats.open}
          delta="Needs action"
          color="bg-blue-50"
          icon={IconOpen}
          accentColor="#0353A4"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          delta="Currently working"
          color="bg-yellow-50"
          icon={IconProgress}
          accentColor="#d97706"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          delta="Completed"
          color="bg-green-50"
          icon={IconResolved}
          accentColor="#16a34a"
        />
        <StatCard
          label="Assigned Resources"
          value={stats.resourceCount}
          delta={`${stats.total} tickets total`}
          color="bg-teal-50"
          icon={IconAssigned}
          accentColor="#0f766e"
        />
      </div>

      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Jump directly into your assigned work" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Assigned Tickets"
            description="Review tickets assigned to you"
            to="/tickets"
            icon={IconTicket}
          />
          <QuickActionCard
            title="Browse Resources"
            description="View resources linked to your tickets"
            to="/resources"
            icon={IconResource}
          />
          <QuickActionCard
            title="My Profile"
            description="View and update your account"
            to="/profile"
            icon={IconProfile}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="My Assigned Tickets"
            subtitle="Recently updated assignments"
            action={
              <Link to="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </Link>
            }
          />
        </div>
        {ticketsLoading ? (
          <LoadingSpinner message="Loading assigned tickets…" />
        ) : ticketsError ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{ticketsError}</div>
        ) : (
          <RecentTicketsTable
            tickets={recentAssigned}
            emptyMessage="No tickets have been assigned to you yet."
          />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="Assigned Resources"
            subtitle="Resources connected to your tickets"
          />
        </div>
        {resourcesLoading ? (
          <LoadingSpinner message="Loading assigned resources…" />
        ) : resourcesError ? (
          <div className="px-6 py-8 text-center text-sm text-red-600">{resourcesError}</div>
        ) : assignedResources.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No resources linked to your assigned tickets yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignedResources.map((resource) => (
              <Link
                key={resource.id}
                to="/resources"
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#061A40] truncate">{resource.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {resource.type} · {resource.location}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                    resource.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading…" />
      </PageContainer>
    );
  }

  const isAdmin = user.role === 'ADMIN';
  const isTechnician = user.role === 'TECHNICIAN';

  return (
    <PageContainer>
      {isAdmin ? (
        <AdminDashboard userId={user.id} userName={user.name} role={user.role} />
      ) : isTechnician ? (
        <TechnicianDashboard userId={user.id} userName={user.name} role={user.role} />
      ) : (
        <UserDashboard userId={user.id} userName={user.name} role={user.role} />
      )}
    </PageContainer>
  );
}
