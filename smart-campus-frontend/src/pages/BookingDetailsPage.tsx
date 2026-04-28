import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { bookingService } from '../services/booking.service';
import { resourceService } from '../services/resource.service';
import { useAuth } from '../context/AuthContext';
import type { BookingResponse } from '../types/booking.types';
import type { ResourceResponse } from '../types/resource.types';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  canEditBooking,
  getEditDisabledReason,
} from '../constants/booking.constants';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function formatTime(t: string) {
  return t?.slice(0, 5) ?? '';
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [resource, setResource] = useState<ResourceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!booking || !user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await bookingService.delete(booking.id, user.id);
      navigate('/bookings');
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || err?.message || 'Failed to delete booking.');
      setDeleting(false);
    }
  }

  useEffect(() => {
    async function load() {
      if (!user || !id) return;
      setLoading(true);
      setError(null);
      try {
        const b = await bookingService.getById(Number(id), user.id, user.role);
        setBooking(b);
        try {
          const r = await resourceService.getById(b.resourceId);
          setResource(r);
        } catch {
          setResource(null);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load booking.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading booking…" />
        </div>
      </PageContainer>
    );
  }

  if (error || !booking) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600 mb-3">{error ?? 'Booking not found.'}</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 text-sm font-medium bg-[#0353A4] text-white rounded-lg hover:bg-[#003559] transition-colors"
          >
            Back to My Bookings
          </button>
        </div>
      </PageContainer>
    );
  }

  const editable = canEditBooking(booking.status);
  const editDisabledReason = editable ? '' : getEditDisabledReason(booking.status);

  return (
    <PageContainer>
      <SectionTitle
        title={`Booking #${booking.id}`}
        subtitle={resource?.name ?? `Resource #${booking.resourceId}`}
        action={
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0353A4] transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to My Bookings
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#061A40]">Booking Details</h3>
              <p className="text-xs text-gray-400 mt-0.5">Schedule and request information</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow label="Resource" value={resource?.name ?? `#${booking.resourceId}`} />
            <DetailRow label="Location" value={resource?.location ?? '—'} />
            <DetailRow label="Booking Date" value={formatDate(booking.bookingDate)} />
            <DetailRow
              label="Time"
              value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
            />
            <DetailRow label="Expected Attendees" value={booking.expectedAttendees} />
            <DetailRow label="Requested By" value={booking.userName ?? '—'} />
            <div className="sm:col-span-2">
              <DetailRow
                label="Purpose"
                value={<p className="whitespace-pre-line">{booking.purpose}</p>}
              />
            </div>
            {booking.adminReason && (
              <div className="sm:col-span-2">
                <DetailRow
                  label="Admin Note"
                  value={<p className="whitespace-pre-line text-gray-700">{booking.adminReason}</p>}
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              Created {formatDateTime(booking.createdAt)}
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <> · Updated {formatDateTime(booking.updatedAt)}</>
              )}
            </div>
            <div className="flex items-center gap-3">
              {editable && (
                <button
                  type="button"
                  onClick={() => { setConfirmDelete(true); setDeleteError(null); }}
                  className="px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
              {editable ? (
                <Link
                  to={`/bookings/${booking.id}/edit`}
                  className="px-5 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-semibold hover:bg-[#003559] transition-colors shadow-sm"
                >
                  Edit Booking
                </Link>
              ) : (
                <span
                  title={editDisabledReason}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
                >
                  Edit Booking
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-[#061A40] mb-3">Status</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_STYLES[booking.status]}`}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
            {!editable && (
              <p className="mt-3 text-xs text-gray-500">{editDisabledReason}</p>
            )}
          </div>

          {resource && (
            <div className="bg-[#E6F0F9] rounded-xl border border-[#CCE3F1] p-6 leading-relaxed">
              <h3 className="text-sm font-bold text-[#0353A4] mb-2">{resource.name}</h3>
              <p className="text-xs text-[#0353A4]/70">
                {resource.location} · Capacity {resource.capacity}
              </p>
              {resource.description && (
                <p className="text-xs text-[#0353A4]/70 mt-2">{resource.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-[#061A40]">Delete Booking #{booking.id}</h3>
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
                onClick={() => setConfirmDelete(false)}
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
