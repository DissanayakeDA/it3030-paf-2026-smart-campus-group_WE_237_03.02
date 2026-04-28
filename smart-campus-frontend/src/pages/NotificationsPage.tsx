import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notification.service';
import { ticketService } from '../services/ticket.service';
import { bookingService } from '../services/booking.service';
import type { NotificationResponse, NotificationType } from '../types/notification.types';
import type { TicketResponse } from '../types/ticket.types';
import type { BookingResponse } from '../types/booking.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function notificationLink(n: NotificationResponse): string {
  if (n.type === 'BOOKING_APPROVED' || n.type === 'BOOKING_REJECTED') return '/bookings';
  return n.referenceId ? `/tickets/${n.referenceId}` : '/tickets';
}

const TYPE_META: Record<NotificationType, { label: string; dot: string; badge: string; icon: string }> = {
  BOOKING_APPROVED: {
    label: 'Booking Approved',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  BOOKING_REJECTED: {
    label: 'Booking Rejected',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  TICKET_STATUS_CHANGED: {
    label: 'Ticket Status',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
  },
  TICKET_COMMENT_ADDED: {
    label: 'New Comment',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
  },
};

type TabKey = 'ALL' | 'BOOKINGS' | 'TICKETS' | 'PERSONAL';
type ReadFilter = 'ALL' | 'UNREAD' | 'READ';
type TypeFilter = 'ALL' | NotificationType;

// ─── sub-components ───────────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-gray-300 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
          <div className="h-4 bg-gray-200 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [pendingTickets, setPendingTickets] = useState<TicketResponse[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingResponse[]>([]);

  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [readFilter, setReadFilter] = useState<ReadFilter>('ALL');

  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';

  // ── data fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) { setNotifications([]); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    notificationService.getForUser(user.id)
      .then(list => { if (!cancelled) setNotifications(list); })
      .catch(() => { if (!cancelled) setError('Failed to load notifications.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, reloadKey]);

  useEffect(() => {
    if (!isPrivileged || !user) { setPendingTickets([]); return; }
    let cancelled = false;
    ticketService.getAll({
      status: 'OPEN',
      assignedTechnicianId: user.role === 'TECHNICIAN' ? user.id : undefined,
      actingUserId: user.id,
      actorRole: user.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'ADMIN',
    }).then(list => {
      if (!cancelled) setPendingTickets(
        list.filter(t => t.firstResponseAt == null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    }).catch(() => { if (!cancelled) setPendingTickets([]); });
    return () => { cancelled = true; };
  }, [isPrivileged, user, reloadKey]);

  useEffect(() => {
    if (!isAdmin || !user) { setPendingBookings([]); return; }
    let cancelled = false;
    bookingService.getAll(user.id, user.role, { status: 'PENDING' })
      .then(list => {
        if (!cancelled) setPendingBookings(
          [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      }).catch(() => { if (!cancelled) setPendingBookings([]); });
    return () => { cancelled = true; };
  }, [isAdmin, user, reloadKey]);

  // ── derived state ────────────────────────────────────────────────────────────

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredPersonal = useMemo(() => notifications.filter(n => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (readFilter === 'UNREAD' && n.read) return false;
    if (readFilter === 'READ' && !n.read) return false;
    return true;
  }), [notifications, typeFilter, readFilter]);

  const tabs = useMemo(() => {
    const list: { key: TabKey; label: string; count: number; color: string }[] = [
      { key: 'ALL', label: 'All', count: notifications.length + pendingTickets.length + pendingBookings.length, color: 'text-[#003559]' },
    ];
    if (isAdmin) list.push({ key: 'BOOKINGS', label: 'Pending Bookings', count: pendingBookings.length, color: 'text-amber-700' });
    if (isPrivileged) list.push({ key: 'TICKETS', label: 'Open Tickets', count: pendingTickets.length, color: 'text-blue-700' });
    list.push({ key: 'PERSONAL', label: 'My Notifications', count: notifications.length, color: 'text-violet-700' });
    return list;
  }, [notifications.length, pendingTickets.length, pendingBookings.length, isAdmin, isPrivileged]);

  const showBookings = activeTab === 'ALL' || activeTab === 'BOOKINGS';
  const showTickets = activeTab === 'ALL' || activeTab === 'TICKETS';
  const showPersonal = activeTab === 'ALL' || activeTab === 'PERSONAL';

  const hasAnything = notifications.length > 0 || pendingTickets.length > 0 || pendingBookings.length > 0;

  // ── actions ──────────────────────────────────────────────────────────────────

  function handleRefresh() {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    setReloadKey(v => v + 1);
  }

  async function handleMarkAllRead() {
    if (!user || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(id: number) {
    const n = notifications.find(x => x.id === id);
    if (!n || n.read) return;
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(x => (x.id === id ? { ...x, read: true } : x)));
  }

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'ALL', label: 'All Types' },
    { value: 'BOOKING_APPROVED', label: 'Booking Approved' },
    { value: 'BOOKING_REJECTED', label: 'Booking Rejected' },
    { value: 'TICKET_STATUS_CHANGED', label: 'Ticket Status' },
    { value: 'TICKET_COMMENT_ADDED', label: 'New Comment' },
  ];

  const readOptions: { value: ReadFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'UNREAD', label: 'Unread' },
    { value: 'READ', label: 'Read' },
  ];

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#061A40] tracking-tight">Notifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : unreadCount > 0 ? `${unreadCount} unread` : hasAnything ? 'You\'re all caught up' : 'Nothing here yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0353A4] border border-[#B9D6F2] bg-[#EEF5FF] hover:bg-[#ddeeff] disabled:opacity-50 transition-colors"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Mark all read
            </button>
          )}
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#0353A4] hover:bg-[#EEF5FF] transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
              className={`w-4 h-4 transition-transform duration-500 ${spinning ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filter panel ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        {/* Tab bar */}
        <div className="flex flex-wrap border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? `border-[#003559] ${tab.color}`
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-[#003559] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Personal notification filters — shown in PERSONAL or ALL tab */}
        {(activeTab === 'PERSONAL' || activeTab === 'ALL') && (
          <div className="px-4 py-3 space-y-2.5 bg-gray-50/60 border-b border-gray-100">
            {/* Type filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-14 shrink-0">Type</span>
              <div className="flex flex-wrap gap-1.5">
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                      typeFilter === opt.value
                        ? 'bg-[#003559] text-white border-[#003559] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#003559] hover:text-[#003559]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Read status filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-14 shrink-0">Status</span>
              <div className="flex gap-1.5">
                {readOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setReadFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                      readFilter === opt.value
                        ? 'bg-[#003559] text-white border-[#003559] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#003559] hover:text-[#003559]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {(typeFilter !== 'ALL' || readFilter !== 'ALL') && (
                <button
                  onClick={() => { setTypeFilter('ALL'); setReadFilter('ALL'); }}
                  className="ml-auto text-[11px] text-[#0353A4] hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-white border border-red-100 rounded-2xl px-6 py-10 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-600 mb-1">{error}</p>
          <p className="text-xs text-gray-400 mb-4">Check your connection and try again.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#0353A4] hover:bg-[#003559] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Pending Bookings section */}
          {isAdmin && showBookings && pendingBookings.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Bookings</h3>
                  <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                    {pendingBookings.length}
                  </span>
                </div>
                <Link to="/admin/bookings" className="text-xs font-semibold text-[#0353A4] hover:underline">
                  View all →
                </Link>
              </div>
              <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-amber-50">
                {pendingBookings.map(b => (
                  <Link
                    key={b.id}
                    to="/admin/bookings"
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-amber-50/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4.5 h-4.5 text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {b.userName ?? `User #${b.userId}`}
                        <span className="font-normal text-gray-500"> · {b.purpose}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Booking #{b.id} · {formatRelative(b.createdAt)}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">
                      PENDING
                    </span>
                    <ChevronRight />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Open Tickets section */}
          {isPrivileged && showTickets && pendingTickets.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Open Tickets Awaiting Response</h3>
                  <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {pendingTickets.length}
                  </span>
                </div>
                <Link to="/tickets" className="text-xs font-semibold text-[#0353A4] hover:underline">
                  View all →
                </Link>
              </div>
              <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-blue-50">
                {pendingTickets.map(t => (
                  <Link
                    key={t.id}
                    to={`/tickets/${t.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4.5 h-4.5 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ticket #{t.id} · {formatRelative(t.createdAt)}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
                      OPEN
                    </span>
                    <ChevronRight />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Personal notifications section */}
          {showPersonal && (
            <section>
              {(isPrivileged && (pendingBookings.length > 0 || pendingTickets.length > 0)) && notifications.length > 0 && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">My Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              )}

              {loading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : filteredPersonal.length > 0 ? (
                <div className="space-y-2">
                  {filteredPersonal.map(n => {
                    const meta = TYPE_META[n.type];
                    return (
                      <Link
                        key={n.id}
                        to={notificationLink(n)}
                        onClick={() => handleMarkRead(n.id)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all hover:shadow-sm group ${
                          !n.read
                            ? 'bg-[#F0F7FF] border-[#B9D6F2] hover:bg-[#e6f2ff]'
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {/* Icon circle */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          n.type === 'BOOKING_APPROVED' ? 'bg-emerald-100' :
                          n.type === 'BOOKING_REJECTED' ? 'bg-red-100' :
                          n.type === 'TICKET_STATUS_CHANGED' ? 'bg-blue-100' : 'bg-violet-100'
                        }`}>
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor"
                            className={`w-4.5 h-4.5 ${
                              n.type === 'BOOKING_APPROVED' ? 'text-emerald-600' :
                              n.type === 'BOOKING_REJECTED' ? 'text-red-600' :
                              n.type === 'TICKET_STATUS_CHANGED' ? 'text-blue-600' : 'text-violet-600'
                            }`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${meta.badge}`}>
                              {meta.label}
                            </span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0353A4] shrink-0" />
                            )}
                          </div>
                          <p className={`text-sm leading-snug truncate ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatRelative(n.createdAt)}</p>
                        </div>

                        <ChevronRight />
                      </Link>
                    );
                  })}
                </div>
              ) : notifications.length > 0 && (typeFilter !== 'ALL' || readFilter !== 'ALL') ? (
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">No notifications match your filters.</p>
                  <button
                    onClick={() => { setTypeFilter('ALL'); setReadFilter('ALL'); }}
                    className="mt-2 text-xs font-semibold text-[#0353A4] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}
            </section>
          )}

          {/* Full empty state */}
          {!hasAnything && !loading && (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor" className="w-7 h-7 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">You're all caught up</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications right now.</p>
            </div>
          )}

          {/* Tab-specific empty state */}
          {hasAnything && !loading && (
            <>
              {activeTab === 'BOOKINGS' && pendingBookings.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">No pending bookings.</p>
                </div>
              )}
              {activeTab === 'TICKETS' && pendingTickets.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">No open tickets awaiting response.</p>
                </div>
              )}
              {activeTab === 'PERSONAL' && notifications.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-500">No personal notifications yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
