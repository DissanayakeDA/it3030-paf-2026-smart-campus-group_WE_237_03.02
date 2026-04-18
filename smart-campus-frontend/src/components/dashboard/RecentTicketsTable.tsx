import { Link } from 'react-router-dom';
import StatusPill from '../common/StatusPill';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLES,
} from '../../constants/ticket.constants';
import type { TicketResponse } from '../../types/ticket.types';

interface RecentTicketsTableProps {
  tickets: TicketResponse[];
  emptyMessage?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function RecentTicketsTable({
  tickets,
  emptyMessage = 'No tickets yet.',
}: RecentTicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          to={`/tickets/${ticket.id}`}
          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono text-gray-400 shrink-0">
              #{ticket.id}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {ticket.title}
              </p>
              <p className="text-xs text-gray-400">
                {TICKET_CATEGORY_LABELS[ticket.category]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium hidden sm:inline-flex ${TICKET_PRIORITY_STYLES[ticket.priority]}`}
            >
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </span>
            <StatusPill status={ticket.status} />
            <span className="text-xs text-gray-400 hidden lg:block">
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
