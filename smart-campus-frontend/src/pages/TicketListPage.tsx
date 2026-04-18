import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';
import EmptyState from '../components/common/EmptyState';
import type { TicketResponse, TicketStatus } from '../types/ticket.types';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLES,
} from '../constants/ticket.constants';

// Mock data — replace with useTickets() hook when API is wired.
// Field names match TicketResponse exactly.
const MOCK_TICKETS: Pick<
  TicketResponse,
  'id' | 'title' | 'locationText' | 'status' | 'category' | 'priority' | 'createdAt'
>[] = [
  { id: 1, title: 'Lab A/C not working in Block C', locationText: 'Block C – Lab 3', status: 'OPEN', category: 'ELECTRICAL', priority: 'HIGH', createdAt: '2026-04-17T08:30:00Z' },
  { id: 2, title: 'Projector bulb replacement needed', locationText: 'Lecture Hall 1', status: 'IN_PROGRESS', category: 'PROJECTOR', priority: 'MEDIUM', createdAt: '2026-04-16T10:15:00Z' },
  { id: 3, title: 'Network port B-204 unresponsive', locationText: 'Block B – Room 204', status: 'RESOLVED', category: 'NETWORK', priority: 'MEDIUM', createdAt: '2026-04-15T14:00:00Z' },
  { id: 4, title: 'Water leakage near staircase 2', locationText: 'Ground Floor', status: 'OPEN', category: 'OTHER', priority: 'CRITICAL', createdAt: '2026-04-14T09:45:00Z' },
  { id: 5, title: 'Whiteboard markers not available', locationText: 'Block A – Room 101', status: 'CLOSED', category: 'OTHER', priority: 'LOW', createdAt: '2026-04-13T11:00:00Z' },
  { id: 6, title: 'Lab PC power supply failure', locationText: 'Block D – Lab 2', status: 'REJECTED', category: 'ELECTRICAL', priority: 'HIGH', createdAt: '2026-04-12T16:20:00Z' },
];

const STATUS_FILTERS: { label: string; value: TicketStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Pending', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TicketListPage() {
  const [activeFilter, setActiveFilter] = useState<TicketStatus | 'ALL'>('ALL');

  const filtered = activeFilter === 'ALL'
    ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => t.status === activeFilter);

  return (
    <PageContainer>
      <SectionTitle
        title="All Tickets"
        subtitle={`${filtered.length} request${filtered.length !== 1 ? 's' : ''}`}
        action={
          <Link
            to="/tickets/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No tickets found"
            description="No requests match the selected filter."
            action={
              <Link
                to="/tickets/create"
                className="px-4 py-2 bg-[#0353A4] text-white text-sm font-medium rounded-lg hover:bg-[#003559] transition-colors"
              >
                Create Ticket
              </Link>
            }
          />
        </div>
      ) : (
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
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                      <p className="truncate">{ticket.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{ticket.locationText}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{TICKET_CATEGORY_LABELS[ticket.category]}</td>
                    <td className="px-6 py-4"><StatusPill status={ticket.status} /></td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_PRIORITY_STYLES[ticket.priority]}`}>
                        {TICKET_PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{formatDate(ticket.createdAt)}</td>
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
