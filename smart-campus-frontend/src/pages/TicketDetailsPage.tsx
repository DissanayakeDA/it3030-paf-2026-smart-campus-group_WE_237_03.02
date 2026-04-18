import { Link, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';
import type { TicketResponse, TicketCommentResponse } from '../types/ticket.types';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLES,
} from '../constants/ticket.constants';

// Mock ticket — replace with useTicket(id) hook when API is wired.
// All field names match TicketResponse exactly.
const MOCK_TICKET: TicketResponse = {
  id: 1,
  title: 'Lab A/C not working in Block C',
  description:
    'The air conditioning unit in Lab 3, Block C has stopped functioning completely. Students and staff are unable to use the lab during peak hours due to the heat. This issue started on 2026-04-17 and needs urgent attention.',
  category: 'ELECTRICAL',
  priority: 'HIGH',
  preferredContact: 'email',
  resourceId: null,
  locationText: 'Block C – Lab 3',
  createdByUserId: 42,
  assignedTechnicianId: null,
  rejectionReason: null,
  resolutionNotes: null,
  firstResponseAt: null,
  resolvedAt: null,
  status: 'OPEN',
  createdAt: '2026-04-17T08:30:00Z',
  updatedAt: '2026-04-17T08:30:00Z',
};

// Mock comments — replace with useTicketComments(id) hook when API is wired.
const MOCK_COMMENTS: TicketCommentResponse[] = [
  {
    id: 101,
    ticketId: 1,
    authorUserId: 10,
    content: "I've logged this with the facilities team. Technician will be assigned shortly.",
    createdAt: '2026-04-17T09:00:00Z',
    updatedAt: '2026-04-17T09:00:00Z',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface DetailRowProps { label: string; value: React.ReactNode }
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className="text-sm font-medium text-gray-700 text-right">{value}</dd>
    </div>
  );
}

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const ticket = MOCK_TICKET; // swap with API data later

  return (
    <PageContainer>
      <SectionTitle
        title={`Ticket #${id}`}
        subtitle={ticket.title}
        action={
          <Link
            to="/tickets"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0353A4] transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Tickets
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: description + comments ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusPill status={ticket.status} />
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_PRIORITY_STYLES[ticket.priority]}`}>
                {TICKET_PRIORITY_LABELS[ticket.priority]}
              </span>
              <span className="text-xs text-gray-400">{TICKET_CATEGORY_LABELS[ticket.category]}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{ticket.description}</p>

            {ticket.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{ticket.rejectionReason}</p>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-xs font-semibold text-green-600 mb-1">Resolution Notes</p>
                <p className="text-sm text-green-700">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Comments card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Comments ({MOCK_COMMENTS.length})
            </h4>

            {MOCK_COMMENTS.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {MOCK_COMMENTS.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#B9D6F2] flex items-center justify-center shrink-0">
                      <span className="text-[#003559] text-xs font-semibold">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">User #{comment.authorUserId}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment — wired to addComment() endpoint later */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <textarea
                disabled
                placeholder="Add a comment… (API integration coming)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 resize-none bg-gray-50 cursor-not-allowed"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button disabled className="px-4 py-1.5 bg-[#0353A4] text-white text-xs font-medium rounded-lg opacity-40 cursor-not-allowed">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: metadata + actions ─────────────────────────────────── */}
        <div className="space-y-4">

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Details</h4>
            <dl>
              <DetailRow label="Ticket ID" value={`#${ticket.id}`} />
              <DetailRow label="Status" value={<StatusPill status={ticket.status} />} />
              <DetailRow label="Priority" value={
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${TICKET_PRIORITY_STYLES[ticket.priority]}`}>
                  {TICKET_PRIORITY_LABELS[ticket.priority]}
                </span>
              } />
              <DetailRow label="Category" value={TICKET_CATEGORY_LABELS[ticket.category]} />
              <DetailRow label="Location" value={ticket.locationText} />
              <DetailRow label="Contact" value={ticket.preferredContact} />
              <DetailRow label="Reported By" value={`User #${ticket.createdByUserId}`} />
              <DetailRow label="Assigned To" value={ticket.assignedTechnicianId ? `Tech #${ticket.assignedTechnicianId}` : '—'} />
              <DetailRow label="Created" value={formatDate(ticket.createdAt)} />
              <DetailRow label="Updated" value={formatDate(ticket.updatedAt)} />
              {ticket.resolvedAt && <DetailRow label="Resolved" value={formatDate(ticket.resolvedAt)} />}
            </dl>
          </div>

          {/* Actions — wired to status/assign endpoints later */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Actions</h4>
            <div className="space-y-2">
              <button disabled className="w-full px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium opacity-40 cursor-not-allowed">
                Assign Technician
              </button>
              <button disabled className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                Update Status
              </button>
              <button disabled className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                Add Resolution Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
