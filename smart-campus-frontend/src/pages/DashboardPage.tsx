import { useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentTicketsTable from '../components/dashboard/RecentTicketsTable';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import { useResources } from '../hooks/useResources';
import { ticketService } from '../services/ticket.service';
import type { TicketSummaryResponse } from '../types/ticket.types';

function formatMinutes(min: number | null): string {
  if (min === null) return '—';
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
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

const IconTotal = (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#6366f1" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
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

// ── User dashboard ────────────────────────────────────────────────────────────

function UserDashboard({ userId, userName, role }: { userId: number; userName: string; role: string }) {
  const { tickets, loading, error } = useTickets({ createdByUserId: userId });

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
    ).length;
    return { open, inProgress, resolved, total: tickets.length };
  }, [tickets]);

  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">
          Here's a quick look at your tickets and campus tools.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Open Tickets" value={stats.open} delta="Awaiting response" color="bg-blue-50" icon={IconOpen} />
        <StatCard label="In Progress" value={stats.inProgress} delta="Being worked on" color="bg-yellow-50" icon={IconProgress} />
        <StatCard label="Resolved" value={stats.resolved} delta="Successfully closed" color="bg-green-50" icon={IconResolved} />
        <StatCard label="Total Submitted" value={stats.total} delta="All time" color="bg-indigo-50" icon={IconTotal} />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Jump straight into what you need" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="Report an Issue" description="Create a new maintenance ticket" to="/tickets/create" icon={IconTicket} />
          <QuickActionCard title="Browse Resources" description="Explore rooms, labs, and equipment" to="/resources" icon={IconResource} />
          <QuickActionCard title="My Bookings" description="Reserve a resource for your session" to="/bookings" icon={IconBooking} disabled />
        </div>
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="My Recent Tickets"
            subtitle="Your latest submissions"
            action={
              <a href="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </a>
            }
          />
        </div>
        {loading ? (
          <LoadingSpinner message="Loading your tickets…" />
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{error}</div>
        ) : (
          <RecentTicketsTable tickets={recent} emptyMessage="You haven't submitted any tickets yet." />
        )}
      </div>
    </>
  );
}

// ── Admin dashboard ────────────────────────────────────────────────────────────

function AdminDashboard({ userName, role }: { userName: string; role: string }) {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets();
  const [summary, setSummary] = useState<TicketSummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    ticketService
      .getSlaSummary()
      .then(setSummary)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load summary.';
        setSummaryError(msg);
      });
  }, []);

  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tickets]
  );

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">System overview and recent ticket activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Tickets"
          value={summary?.openTickets ?? '—'}
          delta={summary ? `${summary.totalTickets} total` : summaryError ?? 'Loading…'}
          color="bg-blue-50"
          icon={IconOpen}
        />
        <StatCard
          label="Resolved"
          value={summary?.resolvedTickets ?? '—'}
          delta="All time"
          color="bg-green-50"
          icon={IconResolved}
        />
        <StatCard
          label="Avg First Response"
          value={summary ? formatMinutes(summary.averageFirstResponseMinutes) : '—'}
          delta="Time to first response"
          color="bg-yellow-50"
          icon={IconProgress}
        />
        <StatCard
          label="Avg Resolution"
          value={summary ? formatMinutes(summary.averageResolutionMinutes) : '—'}
          delta="Time to resolution"
          color="bg-orange-50"
          icon={IconResolution}
        />
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Manage the campus at a glance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="All Tickets" description="Review and manage every request" to="/tickets" icon={IconTicket} />
          <QuickActionCard title="Manage Resources" description="View and update the catalogue" to="/resources" icon={IconResource} />
          <QuickActionCard title="Add Resource" description="Register a new room or asset" to="/resources/create" icon={IconBooking} />
        </div>
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="Recent Tickets"
            subtitle="Latest facility requests across campus"
            action={
              <a href="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </a>
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
    const assignedResourceIds = new Set(tickets.map((ticket) => ticket.resourceId).filter((id): id is number => id != null));
    return {
      open,
      inProgress,
      resolved,
      total: tickets.length,
      resourceCount: assignedResourceIds.size,
    };
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
      tickets
        .map((ticket) => ticket.resourceId)
        .filter((resourceId): resourceId is number => resourceId != null)
    );
    return resources.filter((resource) => assignedIds.has(resource.id));
  }, [resources, tickets]);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#061A40]">
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <RoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-500">Your assigned maintenance work and related resources.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Open" value={stats.open} delta="Needs action" color="bg-blue-50" icon={IconOpen} />
        <StatCard label="In Progress" value={stats.inProgress} delta="Currently working" color="bg-yellow-50" icon={IconProgress} />
        <StatCard label="Resolved" value={stats.resolved} delta="Completed" color="bg-green-50" icon={IconResolved} />
        <StatCard label="Assigned Resources" value={stats.resourceCount} delta={`${stats.total} tickets`} color="bg-teal-50" icon={IconAssigned} />
      </div>

      <div className="mb-8">
        <SectionTitle title="Quick Actions" subtitle="Jump directly into your assigned work" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="Assigned Tickets" description="Review tickets assigned to you" to="/tickets" icon={IconTicket} />
          <QuickActionCard title="Assigned Resources" description="View resources linked to your tickets" to="/resources" icon={IconResource} />
          <QuickActionCard title="All Resources" description="Browse full resource catalogue" to="/resources" icon={IconBooking} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="My Assigned Tickets"
            subtitle="Recently updated assignments"
            action={
              <a href="/tickets" className="text-sm text-[#0353A4] hover:underline font-medium">
                View all
              </a>
            }
          />
        </div>
        {ticketsLoading ? (
          <LoadingSpinner message="Loading assigned tickets…" />
        ) : ticketsError ? (
          <div className="px-6 py-10 text-center text-sm text-red-600">{ticketsError}</div>
        ) : (
          <RecentTicketsTable tickets={recentAssigned} emptyMessage="No tickets have been assigned to you yet." />
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
              <div key={resource.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#061A40] truncate">{resource.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {resource.type} • {resource.location}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-[#B9D6F2] text-[#003559]">
                  #{resource.id}
                </span>
              </div>
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
        <AdminDashboard userName={user.name} role={user.role} />
      ) : isTechnician ? (
        <TechnicianDashboard userId={user.id} userName={user.name} role={user.role} />
      ) : (
        <UserDashboard userId={user.id} userName={user.name} role={user.role} />
      )}
    </PageContainer>
  );
}
