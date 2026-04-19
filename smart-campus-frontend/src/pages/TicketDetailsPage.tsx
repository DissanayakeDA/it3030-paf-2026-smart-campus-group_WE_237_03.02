import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticket.service';
import { userService } from '../services/user.service';
import type { Role, UserResponse } from '../types/auth.types';
import type {
  ActorRole,
  TicketAttachmentResponse,
  TicketCategory,
  TicketCommentResponse,
  TicketPriority,
  TicketResponse,
  TicketStatus,
} from '../types/ticket.types';
import {
  TICKET_CATEGORY_LABELS,
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_PRIORITY_STYLES,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_OPTIONS,
} from '../constants/ticket.constants';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function toActorRole(role: Role): ActorRole {
  if (role === 'USER') return 'STUDENT';
  return role;
}

function toRoleLabel(role: Role): string {
  return role.toLowerCase();
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    const apiMessage = err.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof err.message === 'string' && err.message.trim()) return err.message;
  }
  return fallback;
}

interface DetailRowProps { label: string; value: ReactNode }

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
      <dt className="text-sm text-gray-400">{label}</dt>
      <dd className="text-sm font-medium text-gray-700 text-right">{value}</dd>
    </div>
  );
}

type EditableTicketForm = {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  preferredContact: string;
  locationText: string;
  resourceId: string;
};

function toEditForm(ticket: TicketResponse): EditableTicketForm {
  return {
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    preferredContact: ticket.preferredContact,
    locationText: ticket.locationText,
    resourceId: ticket.resourceId == null ? '' : String(ticket.resourceId),
  };
}

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [comments, setComments] = useState<TicketCommentResponse[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachmentResponse[]>([]);
  const [technicians, setTechnicians] = useState<UserResponse[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserResponse>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditableTicketForm | null>(null);
  const [commentText, setCommentText] = useState('');
  const [statusSelection, setStatusSelection] = useState<TicketStatus>('IN_PROGRESS');
  const [rejectionReason, setRejectionReason] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isPrivileged = isAdmin || isTechnician;
  const actorRole = user ? toActorRole(user.role) : null;
  const isOwner = !!(user && ticket && ticket.createdByUserId === user.id);
  const canUserEdit = !!(
    !isPrivileged &&
    isOwner &&
    ticket &&
    ticket.status === 'OPEN' &&
    ticket.firstResponseAt === null
  );
  const canUserDelete = !!(
    !isPrivileged &&
    isOwner &&
    ticket &&
    (ticket.status === 'CLOSED' || ticket.status === 'REJECTED')
  );

  useEffect(() => {
    if (!id || !user) return;
    const currentUser = user;
    const ticketId = Number(id);
    if (Number.isNaN(ticketId)) {
      setError('Invalid ticket id.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      setActionError(null);
      try {
        let data = await ticketService.getById(ticketId);

        if ((currentUser.role === 'ADMIN' || currentUser.role === 'TECHNICIAN') && data.status === 'OPEN') {
          data = await ticketService.updateStatus(ticketId, {
            status: 'IN_PROGRESS',
            actingUserId: currentUser.id,
            actorRole: toActorRole(currentUser.role),
          });
        }

        const [commentsData, attachmentsData] = await Promise.all([
          ticketService.listComments(ticketId),
          ticketService.getAttachments(ticketId),
        ]);

        if (cancelled) return;
        setTicket(data);
        setComments(commentsData);
        setAttachments(attachmentsData);
        setEditForm(toEditForm(data));
        setStatusSelection(data.status);
        setRejectionReason(data.rejectionReason ?? '');
        setTechnicianId(data.assignedTechnicianId == null ? '' : String(data.assignedTechnicianId));
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load ticket details.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  useEffect(() => {
    if (!isAdmin) {
      setUsersById({});
      setTechnicians([]);
      return;
    }

    userService
      .getAll()
      .then((users) => {
        const userMap = users.reduce<Record<number, UserResponse>>((acc, current) => {
          acc[current.id] = current;
          return acc;
        }, {});
        setUsersById(userMap);
        setTechnicians(users.filter((u) => u.role === 'TECHNICIAN'));
      })
      .catch(() => {
        setUsersById({});
        setTechnicians([]);
      });
  }, [isAdmin]);

  function getCommentAuthorLabel(authorUserId: number): string {
    const author = usersById[authorUserId];
    if (!author) return `User #${authorUserId}`;
    return `${author.name}(${toRoleLabel(author.role)})`;
  }

  function getCommentAuthorInitial(authorUserId: number): string {
    const author = usersById[authorUserId];
    if (!author || !author.name.trim()) return 'U';
    return author.name.trim().charAt(0).toUpperCase();
  }

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  );

  async function handlePostComment(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !user) return;
    const content = commentText.trim();
    if (!content) return;

    setBusyAction('comment');
    setActionError(null);
    try {
      const saved = await ticketService.addComment(ticket.id, {
        content,
        authorUserId: user.id,
      });
      setComments(prev => [...prev, saved]);
      setCommentText('');
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to post comment.'));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleAssignTechnician(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !user || !actorRole) return;
    const selected = Number(technicianId);
    if (!selected) return;

    setBusyAction('assign');
    setActionError(null);
    try {
      const updated = await ticketService.assignTechnician(ticket.id, {
        technicianId: selected,
        actingUserId: user.id,
        actorRole,
      });
      setTicket(updated);
      setTechnicianId(updated.assignedTechnicianId == null ? '' : String(updated.assignedTechnicianId));
      setStatusSelection(updated.status);
      setRejectionReason(updated.rejectionReason ?? '');
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to assign technician.'));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleStatusUpdate(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !user || !actorRole) return;

    setBusyAction('status');
    setActionError(null);
    try {
      const updated = await ticketService.updateStatus(ticket.id, {
        status: statusSelection,
        rejectionReason: statusSelection === 'REJECTED' ? rejectionReason.trim() : undefined,
        actingUserId: user.id,
        actorRole,
      });
      setTicket(updated);
      setStatusSelection(updated.status);
      setRejectionReason(updated.rejectionReason ?? '');
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to update ticket status.'));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResolutionNotes(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !user || !actorRole) return;
    const notes = resolutionNotes.trim();
    if (!notes) return;

    setBusyAction('resolution');
    setActionError(null);
    try {
      const updated = await ticketService.addResolutionNotes(ticket.id, {
        resolutionNotes: notes,
        actingUserId: user.id,
        actorRole,
      });
      setTicket(updated);
      setResolutionNotes('');
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to add resolution notes.'));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSaveTicketEdits(e: FormEvent) {
    e.preventDefault();
    if (!ticket || !user || !editForm) return;

    setBusyAction('edit');
    setActionError(null);
    try {
      const updated = await ticketService.update(ticket.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        priority: editForm.priority,
        preferredContact: editForm.preferredContact.trim(),
        locationText: editForm.locationText.trim(),
        resourceId: editForm.resourceId.trim() ? Number(editForm.resourceId.trim()) : undefined,
        actingUserId: user.id,
      });
      setTicket(updated);
      setEditForm(toEditForm(updated));
      setIsEditing(false);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to update ticket.'));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteTicket() {
    if (!ticket || !user) return;
    const confirmed = window.confirm(
      `Delete ticket #${ticket.id}? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusyAction('delete');
    setActionError(null);
    try {
      await ticketService.delete(ticket.id, { actingUserId: user.id });
      navigate('/tickets');
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, 'Failed to delete ticket.'));
      setBusyAction(null);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading ticket details…" />
        </div>
      </PageContainer>
    );
  }

  if (error || !ticket) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600 mb-3">{error ?? 'Ticket not found.'}</p>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Back to Tickets
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle
        title={`Ticket #${ticket.id}`}
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

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm text-green-700 whitespace-pre-line">{ticket.resolutionNotes}</p>
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Attachments ({attachments.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-lg overflow-hidden border border-gray-100 hover:border-[#0353A4] transition-colors"
                  >
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="w-full h-28 object-cover"
                    />
                    <div className="px-2 py-1.5 bg-white">
                      <p className="text-xs text-gray-500 truncate">{attachment.fileName}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Comments ({sortedComments.length})
            </h4>

            {sortedComments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {sortedComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#B9D6F2] flex items-center justify-center shrink-0">
                      <span className="text-[#003559] text-xs font-semibold">
                        {getCommentAuthorInitial(comment.authorUserId)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {getCommentAuthorLabel(comment.authorUserId)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handlePostComment} className="mt-4 pt-4 border-t border-gray-100">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={busyAction === 'comment' || !commentText.trim()}
                  className="px-4 py-1.5 bg-[#0353A4] text-white text-xs font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#003559] transition-colors"
                >
                  {busyAction === 'comment' ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>

          {isEditing && editForm && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Edit Ticket</h4>
              <form onSubmit={handleSaveTicketEdits} className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, title: e.target.value } : prev)}
                    required
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-category" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                      id="edit-category"
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, category: e.target.value as TicketCategory } : prev)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                    >
                      {TICKET_CATEGORY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-priority" className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <select
                      id="edit-priority"
                      value={editForm.priority}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, priority: e.target.value as TicketPriority } : prev)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                    >
                      {TICKET_PRIORITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-location" className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <input
                      id="edit-location"
                      value={editForm.locationText}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, locationText: e.target.value } : prev)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-contact" className="block text-xs font-medium text-gray-600 mb-1">Preferred Contact</label>
                    <input
                      id="edit-contact"
                      value={editForm.preferredContact}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, preferredContact: e.target.value } : prev)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="edit-resource" className="block text-xs font-medium text-gray-600 mb-1">Resource ID (optional)</label>
                    <input
                      id="edit-resource"
                      value={editForm.resourceId}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, resourceId: e.target.value } : prev)}
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    required
                    maxLength={4000}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm(toEditForm(ticket));
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busyAction === 'edit'}
                    className="px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {busyAction === 'edit' ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
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
              <DetailRow
                label="Reported By"
                value={ticket.createdByUserName?.trim() || `User #${ticket.createdByUserId}`}
              />
              <DetailRow label="Assigned To" value={ticket.assignedTechnicianId ? `Tech #${ticket.assignedTechnicianId}` : '—'} />
              <DetailRow label="Created" value={formatDate(ticket.createdAt)} />
              <DetailRow label="First Response" value={formatDate(ticket.firstResponseAt)} />
              <DetailRow label="Updated" value={formatDate(ticket.updatedAt)} />
              {ticket.resolvedAt && <DetailRow label="Resolved" value={formatDate(ticket.resolvedAt)} />}
            </dl>
          </div>

          {isPrivileged && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
              <h4 className="text-sm font-semibold text-gray-700">
                {isAdmin ? 'Admin Actions' : 'Technician Actions'}
              </h4>

              {isAdmin && (
                <form onSubmit={handleAssignTechnician} className="space-y-2">
                  <label htmlFor="assign-tech" className="block text-xs font-medium text-gray-600">
                    Assign Technician
                  </label>
                  <select
                    id="assign-tech"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                  >
                    <option value="">Select technician</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={busyAction === 'assign' || !technicianId}
                    className="w-full px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {busyAction === 'assign' ? 'Assigning…' : 'Assign Technician'}
                  </button>
                </form>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-2">
                <label htmlFor="ticket-status" className="block text-xs font-medium text-gray-600">
                  Update Status
                </label>
                <select
                  id="ticket-status"
                  value={statusSelection}
                  onChange={(e) => setStatusSelection(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                >
                  {TICKET_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {TICKET_STATUS_LABELS[option.value]}
                    </option>
                  ))}
                </select>
                {statusSelection === 'REJECTED' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Rejection reason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                  />
                )}
                <button
                  type="submit"
                  disabled={busyAction === 'status' || (statusSelection === 'REJECTED' && !rejectionReason.trim())}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {busyAction === 'status' ? 'Updating…' : 'Save Status'}
                </button>
              </form>

              <form onSubmit={handleResolutionNotes} className="space-y-2">
                <label htmlFor="resolution-notes" className="block text-xs font-medium text-gray-600">
                  Add Resolution Notes
                </label>
                <textarea
                  id="resolution-notes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add resolution notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={busyAction === 'resolution' || !resolutionNotes.trim()}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {busyAction === 'resolution' ? 'Saving…' : 'Add Notes'}
                </button>
              </form>
            </div>
          )}

          {isOwner && !isPrivileged && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Your Actions</h4>
              {!canUserEdit && (
                <p className="text-xs text-gray-500">
                  Ticket editing is allowed only before admin/technician response.
                </p>
              )}
              <button
                type="button"
                disabled={!canUserEdit || busyAction !== null}
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Edit Ticket
              </button>
              <button
                type="button"
                disabled={!canUserDelete || busyAction === 'delete'}
                onClick={handleDeleteTicket}
                className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busyAction === 'delete' ? 'Deleting…' : 'Delete Ticket'}
              </button>
              {!canUserDelete && (
                <p className="text-xs text-gray-500">
                  Ticket can be deleted only when status is Closed or Rejected.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
