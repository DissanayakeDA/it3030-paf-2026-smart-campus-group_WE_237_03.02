import type { TicketStatus } from '../../types/ticket.types';
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
} from '../../constants/ticket.constants';

export type { TicketStatus };

interface StatusPillProps {
  status: TicketStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TICKET_STATUS_STYLES[status]}`}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
