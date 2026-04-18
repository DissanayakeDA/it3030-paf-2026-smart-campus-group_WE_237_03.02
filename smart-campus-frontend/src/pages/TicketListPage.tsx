import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';
import type { TicketStatus } from '../types/ticket.types';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLES,
} from '../constants/ticket.constants';

const STATUS_FILTERS: { label: string; value: TicketStatus | 'ALL' }[] = [
  { label: 'All',         value: 'ALL' },
  { label: 'Open',        value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved',    value: 'RESOLVED' },
  { label: 'Closed',      value: 'CLOSED' },
  { label: 'Rejected',    value: 'REJECTED' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function TicketListPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const currentUserId = user?.id;

  const { tickets, loading, error, refetch } = useTickets({
    status: activeFilter === 'ALL' ? undefined : activeFilter,
    createdByUserId: isPrivileged ? undefined : currentUserId,
  });

  return (
    <PageContainer>
      <SectionTitle
        title={isPrivileged ? 'All Tickets' : 'My Tickets'}
        subtitle={loading ? 'Loading…' : `${tickets.length} request${tickets.length !== 1 ? 's' : ''}`}
        action={
          !isPrivileged ? (
            <Link
              to="/tickets/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </Link>
          ) : undefined
        }
      />

      {/* Status filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeFilter === f.value
                ? 'bg-[#0353A4] text-white border-[#0353A4]'
                : 'border-gray-200 text-gray-600 hover:border-[#0353A4] hover:text-[#0353A4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading tickets…" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium bg-[#0353A4] text-white rounded-lg hover:bg-[#003559] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No tickets found"
            description={
              activeFilter === 'ALL'
                ? (isPrivileged
                    ? 'No tickets are currently available.'
                    : 'No facility requests yet. Create one to get started.')
                : `No tickets with status "${activeFilter.replace('_', ' ')}".`
            }
            action={
              activeFilter === 'ALL' && !isPrivileged ? (
                <Link
                  to="/tickets/create"
                  className="px-4 py-2 bg-[#0353A4] text-white text-sm font-medium rounded-lg hover:bg-[#003559] transition-colors"
                >
                  Create Ticket
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Table */}
      {!loading && !error && tickets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Priority</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                      <p className="truncate">{ticket.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{ticket.locationText}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {TICKET_CATEGORY_LABELS[ticket.category]}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_PRIORITY_STYLES[ticket.priority]}`}>
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-[#0353A4] hover:underline text-xs font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
