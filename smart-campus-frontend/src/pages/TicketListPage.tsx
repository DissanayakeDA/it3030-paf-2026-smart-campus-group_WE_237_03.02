import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';
import EmptyState from '../components/common/EmptyState';
import type { TicketStatus } from '../components/common/StatusPill';

interface TicketRow {
  id: string;
  title: string;
  location: string;
  status: TicketStatus;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

const MOCK_TICKETS: TicketRow[] = [
  { id: 'TKT-001', title: 'Lab A/C not working in Block C', location: 'Block C - Lab 3', status: 'open', priority: 'High', createdAt: '2026-04-17' },
  { id: 'TKT-002', title: 'Projector bulb replacement needed', location: 'Lecture Hall 1', status: 'in-progress', priority: 'Medium', createdAt: '2026-04-16' },
  { id: 'TKT-003', title: 'Network port B-204 unresponsive', location: 'Block B - Room 204', status: 'resolved', priority: 'Medium', createdAt: '2026-04-15' },
  { id: 'TKT-004', title: 'Water leakage near staircase 2', location: 'Ground Floor', status: 'pending', priority: 'High', createdAt: '2026-04-14' },
  { id: 'TKT-005', title: 'Whiteboard markers not available', location: 'Block A - Room 101', status: 'closed', priority: 'Low', createdAt: '2026-04-13' },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: 'text-red-600 bg-red-50',
  Medium: 'text-yellow-600 bg-yellow-50',
  Low: 'text-gray-500 bg-gray-100',
};

export default function TicketListPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="All Tickets"
        subtitle={`${MOCK_TICKETS.length} total requests`}
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

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Open', 'In Progress', 'Resolved', 'Pending', 'Closed'].map(filter => (
          <button
            key={filter}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600
              hover:border-[#0353A4] hover:text-[#0353A4] transition-colors first:bg-[#0353A4] first:text-white first:border-[#0353A4]"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      {MOCK_TICKETS.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No tickets found"
            description="There are no facility requests yet. Create one to get started."
            action={
              <Link to="/tickets/create" className="px-4 py-2 bg-[#0353A4] text-white text-sm font-medium rounded-lg hover:bg-[#003559] transition-colors">
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
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Priority</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_TICKETS.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">{ticket.title}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{ticket.location}</td>
                    <td className="px-6 py-4"><StatusPill status={ticket.status} /></td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{ticket.createdAt}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-[#0353A4] hover:underline text-xs font-medium"
                      >
                        View
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
