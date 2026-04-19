import { useCallback, useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/booking.service';
import { resourceService } from '../services/resource.service';
import type { BookingResponse, BookingStatus } from '../types/booking.types';
import type { ResourceResponse } from '../types/resource.types';
import {
  BOOKING_STATUS_FILTERS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
} from '../constants/booking.constants';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
function formatTime(t: string) {
  return t?.slice(0, 5) ?? '';
}

type ReviewAction = 'APPROVE' | 'REJECT';

interface ReviewModalState {
  booking: BookingResponse;
  action: ReviewAction;
}

function ReviewModal({
  state,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  state: ReviewModalState;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [reason, setReason] = useState('');
  const isReject = state.action === 'REJECT';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReject && !reason.trim()) return;
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-[#061A40]">
            {isReject ? 'Reject Booking' : 'Approve Booking'} #{state.booking.id}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isReject
              ? 'Provide a reason so the requester understands the decision.'
              : 'Optionally add a note visible to the requester.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {isReject ? 'Rejection Reason' : 'Approval Note (optional)'}
              {isReject && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              rows={4}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isReject ? 'Why is this booking being rejected?' : 'Add a note (optional)'}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition resize-none"
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (isReject && !reason.trim())}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0353A4] hover:bg-[#003559]'
              }`}
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  {isReject ? 'Rejecting...' : 'Approving...'}
                </>
              ) : isReject ? 'Confirm Reject' : 'Confirm Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [resourceMap, setResourceMap] = useState<Record<number, ResourceResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'ALL'>('PENDING');
  const [review, setReview] = useState<ReviewModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      bookingService.getAll(user.id, user.role),
      resourceService.getAll(),
    ])
      .then(([bs, rs]) => {
        setBookings(bs);
        const map: Record<number, ResourceResponse> = {};
        rs.forEach(r => { map[r.id] = r; });
        setResourceMap(map);
      })
      .catch(err => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load bookings.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return bookings;
    return bookings.filter(b => b.status === activeFilter);
  }, [bookings, activeFilter]);

  async function submitReview(reason: string) {
    if (!review || !user) return;
    setSubmitting(true);
    setModalError(null);
    try {
      const payload = { reason: reason || undefined, actingUserId: user.id, actorRole: user.role };
      if (review.action === 'APPROVE') {
        await bookingService.approve(review.booking.id, payload);
      } else {
        await bookingService.reject(review.booking.id, payload);
      }
      setReview(null);
      fetch();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || err?.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <SectionTitle
        title="All Bookings"
        subtitle={loading ? 'Loading…' : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''}`}
      />

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

      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading bookings…" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={fetch}
            className="px-4 py-2 text-sm font-medium bg-[#0353A4] text-white rounded-lg hover:bg-[#003559] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No bookings found"
            description={
              activeFilter === 'ALL'
                ? 'There are no booking requests yet.'
                : `No bookings with status "${BOOKING_STATUS_LABELS[activeFilter as BookingStatus]}".`
            }
          />
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requester</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Resource</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Attendees</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const resource = resourceMap[b.resourceId];
                  const isPending = b.status === 'PENDING';
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-400">#{b.id}</td>
                      <td className="px-6 py-4 text-gray-700">{b.userName ?? `User #${b.userId}`}</td>
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
                      <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{b.expectedAttendees}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_STYLES[b.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => { setReview({ booking: b, action: 'APPROVE' }); setModalError(null); }}
                                className="text-xs font-semibold text-green-700 hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setReview({ booking: b, action: 'REJECT' }); setModalError(null); }}
                                className="text-xs font-semibold text-red-600 hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
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

      {review && (
        <ReviewModal
          state={review}
          onClose={() => setReview(null)}
          onSubmit={submitReview}
          submitting={submitting}
          error={modalError}
        />
      )}
    </PageContainer>
  );
}
