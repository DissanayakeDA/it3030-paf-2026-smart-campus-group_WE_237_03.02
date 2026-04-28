import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useMyBookings } from '../hooks/useMyBookings';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/booking.service';
import {
  BOOKING_STATUS_FILTERS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  canEditBooking,
  getEditDisabledReason,
} from '../constants/booking.constants';
import type { BookingResponse, BookingStatus } from '../types/booking.types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(t: string) {
  // Accept "HH:mm" or "HH:mm:ss"
  return t?.slice(0, 5) ?? '';
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, resourceMap, loading, error, refetch } = useMyBookings();
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [confirmDelete, setConfirmDelete] = useState<BookingResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDelete || !user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await bookingService.delete(confirmDelete.id, user.id);
      setConfirmDelete(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete booking.');
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return bookings;
    return bookings.filter(b => b.status === activeFilter);
  }, [bookings, activeFilter]);

  return (
    <PageContainer>
      <SectionTitle
        title="My Bookings"
        subtitle={loading ? 'Loading…' : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''}`}
        action={
          <Link
            to="/bookings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Booking
          </Link>
        }
      />

      {/* Status filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {BOOKING_STATUS_FILTERS.map(f => (
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
          <LoadingSpinner message="Loading your bookings…" />
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
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No bookings found"
            description={
              activeFilter === 'ALL'
                ? 'You have no bookings yet. Request one to reserve a campus resource.'
                : `No bookings with status "${BOOKING_STATUS_LABELS[activeFilter as BookingStatus]}".`
            }
            action={
              activeFilter === 'ALL' ? (
                <Link
                  to="/bookings/new"
                  className="px-4 py-2 bg-[#0353A4] text-white text-sm font-medium rounded-lg hover:bg-[#003559] transition-colors"
                >
                  Request Booking
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Resource</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Purpose</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Attendees</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Created</th>
                  <th className="px-6 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const resource = resourceMap[b.resourceId];
                  const editable = canEditBooking(b.status);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">#{b.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                        <p className="truncate">{resource?.name ?? `Resource #${b.resourceId}`}</p>
                        {resource?.location && (
                          <p className="text-xs text-gray-400 truncate">{resource.location}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(b.bookingDate)}</td>
                      <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell max-w-xs">
                        <p className="truncate">{b.purpose}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{b.expectedAttendees}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_STYLES[b.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{formatDate(b.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/bookings/${b.id}`}
                            className="text-[#0353A4] hover:underline text-xs font-medium"
                          >
                            View →
                          </Link>
                          {editable ? (
                            <Link
                              to={`/bookings/${b.id}/edit`}
                              className="text-xs font-medium text-gray-600 hover:text-[#0353A4]"
                            >
                              Edit
                            </Link>
                          ) : (
                            <span
                              title={getEditDisabledReason(b.status)}
                              className="text-xs font-medium text-gray-300 cursor-not-allowed"
                            >
                              Edit
                            </span>
                          )}
                          {editable && (
                            <button
                              onClick={() => { setConfirmDelete(b); setDeleteError(null); }}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-[#061A40]">Delete Booking #{confirmDelete.id}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                This action cannot be undone. Only pending bookings can be deleted.
              </p>
            </div>
            <div className="p-6 text-sm text-gray-600">
              Are you sure you want to delete this booking request?
              {deleteError && <p className="mt-3 text-xs text-red-500 font-medium">{deleteError}</p>}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" inline />
                    Deleting...
                  </>
                ) : 'Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
