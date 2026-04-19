import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticket.service';
import { bookingService } from '../../services/booking.service';
import type { TicketResponse } from '../../types/ticket.types';
import type { BookingResponse } from '../../types/booking.types';

interface AppHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function AppHeader({ title, onMenuToggle }: AppHeaderProps) {
  const { user } = useAuth();
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [pendingTickets, setPendingTickets] = useState<TicketResponse[]>([]);
  const [newArrivals, setNewArrivals] = useState<TicketResponse[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingResponse[]>([]);
  const [newBookingArrivals, setNewBookingArrivals] = useState<BookingResponse[]>([]);
  const knownTicketIdsRef = useRef<Set<number>>(new Set());
  const knownBookingIdsRef = useRef<Set<number>>(new Set());
  const hasFetchedOnceRef = useRef(false);
  const hasFetchedBookingsOnceRef = useRef(false);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isPrivileged || !user) {
      setPendingTickets([]);
      setNewArrivals([]);
      knownTicketIdsRef.current = new Set();
      hasFetchedOnceRef.current = false;
      return;
    }

    let cancelled = false;

    const fetchOpenUnresponded = async () => {
      try {
        const openTickets = await ticketService.getAll({
          status: 'OPEN',
          assignedTechnicianId: user.role === 'TECHNICIAN' ? user.id : undefined,
          actingUserId: user.id,
          actorRole: user.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'ADMIN',
        });
        const unresponded = openTickets
          .filter((ticket) => ticket.firstResponseAt == null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (cancelled) return;

        const knownIds = knownTicketIdsRef.current;
        if (hasFetchedOnceRef.current) {
          const unseen = unresponded.filter((ticket) => !knownIds.has(ticket.id));
          if (unseen.length > 0) {
            setNewArrivals((prev) => {
              const merged = [...unseen, ...prev];
              const unique = merged.filter(
                (ticket, index, list) => list.findIndex((t) => t.id === ticket.id) === index
              );
              return unique.slice(0, 8);
            });
          }
        }

        knownTicketIdsRef.current = new Set(unresponded.map((ticket) => ticket.id));
        hasFetchedOnceRef.current = true;
        setPendingTickets(unresponded);
      } catch {
        if (!cancelled) {
          setPendingTickets([]);
        }
      }
    };

    fetchOpenUnresponded();
    const intervalId = window.setInterval(fetchOpenUnresponded, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isPrivileged, user]);

  useEffect(() => {
    if (!isAdmin || !user) {
      setPendingBookings([]);
      setNewBookingArrivals([]);
      knownBookingIdsRef.current = new Set();
      hasFetchedBookingsOnceRef.current = false;
      return;
    }

    let cancelled = false;

    const fetchPendingBookings = async () => {
      try {
        const list = await bookingService.getAll(user.id, user.role, { status: 'PENDING' });
        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (cancelled) return;

        const knownIds = knownBookingIdsRef.current;
        if (hasFetchedBookingsOnceRef.current) {
          const unseen = sorted.filter((b) => !knownIds.has(b.id));
          if (unseen.length > 0) {
            setNewBookingArrivals((prev) => {
              const merged = [...unseen, ...prev];
              const unique = merged.filter(
                (b, i, list) => list.findIndex((x) => x.id === b.id) === i
              );
              return unique.slice(0, 8);
            });
          }
        }

        knownBookingIdsRef.current = new Set(sorted.map((b) => b.id));
        hasFetchedBookingsOnceRef.current = true;
        setPendingBookings(sorted);
      } catch {
        if (!cancelled) setPendingBookings([]);
      }
    };

    fetchPendingBookings();
    const intervalId = window.setInterval(fetchPendingBookings, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isAdmin, user]);

  const latestPending = useMemo(
    () => pendingTickets.slice(0, 5),
    [pendingTickets]
  );

  const latestPendingBookings = useMemo(
    () => pendingBookings.slice(0, 5),
    [pendingBookings]
  );

  const hasUnreadNewTickets = newArrivals.length > 0;
  const hasUnreadNewBookings = newBookingArrivals.length > 0;
  const totalBadgeCount = pendingTickets.length + (isAdmin ? pendingBookings.length : 0);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      <h1 className="flex-1 text-lg font-semibold text-[#061A40] truncate">{title}</h1>

      <div className="flex items-center gap-2">
        {user?.role && (
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#B9D6F2] text-[#003559]">
            {user.role}
          </span>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setIsBellOpen((prev) => !prev);
              setNewArrivals([]);
              setNewBookingArrivals([]);
            }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {isPrivileged && totalBadgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
              </span>
            )}
            {isPrivileged && (hasUnreadNewTickets || hasUnreadNewBookings) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            )}
          </button>

          {isBellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-40">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                {isPrivileged ? (
                  <p className="text-xs text-gray-500">
                    {pendingTickets.length} ticket{pendingTickets.length !== 1 ? 's' : ''} awaiting response
                    {isAdmin && <> · {pendingBookings.length} booking{pendingBookings.length !== 1 ? 's' : ''} pending</>}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">No admin notifications for this role.</p>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {isAdmin && latestPendingBookings.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Pending Bookings
                    </p>
                    {latestPendingBookings.map((b) => (
                      <Link
                        key={`b-${b.id}`}
                        to="/admin/bookings"
                        onClick={() => setIsBellOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {b.userName ?? `User #${b.userId}`} · {b.purpose}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Booking #{b.id} • {formatDate(b.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {isPrivileged && latestPending.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      Open Tickets
                    </p>
                    {latestPending.map((ticket) => (
                      <Link
                        key={`t-${ticket.id}`}
                        to={`/tickets/${ticket.id}`}
                        onClick={() => setIsBellOpen(false)}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{ticket.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ticket #{ticket.id} • {formatDate(ticket.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {isPrivileged && latestPending.length === 0 && (!isAdmin || latestPendingBookings.length === 0) && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500">No new notifications.</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/tickets"
                  onClick={() => setIsBellOpen(false)}
                  className="text-xs font-medium text-[#0353A4] hover:underline"
                >
                  Tickets
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/bookings"
                    onClick={() => setIsBellOpen(false)}
                    className="text-xs font-medium text-[#0353A4] hover:underline"
                  >
                    All Bookings
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          title={user?.name ?? ''}
          className="w-8 h-8 rounded-full bg-[#0353A4] flex items-center justify-center cursor-default select-none"
        >
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
