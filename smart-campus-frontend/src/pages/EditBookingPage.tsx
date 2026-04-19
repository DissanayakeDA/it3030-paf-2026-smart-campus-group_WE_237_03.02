import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { resourceService } from '../services/resource.service';
import { bookingService } from '../services/booking.service';
import { useAuth } from '../context/AuthContext';
import type { ResourceResponse } from '../types/resource.types';
import type { BookingResponse, BookingUpdateRequest } from '../types/booking.types';
import { canEditBooking, getEditDisabledReason } from '../constants/booking.constants';

interface BookingFormData {
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: string;
}

interface FormErrors {
  resourceId?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  expectedAttendees?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500 font-medium">{message}</p>;
}

function toTimeInput(t: string) {
  // Backend sends "HH:mm:ss" — input[type=time] expects "HH:mm"
  return t?.slice(0, 5) ?? '';
}

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [form, setForm] = useState<BookingFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user || !id) return;
      setLoading(true);
      setLoadError(null);
      try {
        const [b, rs] = await Promise.all([
          bookingService.getById(Number(id), user.id, user.role),
          resourceService.getAll({ status: 'ACTIVE' }),
        ]);
        setBooking(b);
        setResources(rs);
        setForm({
          resourceId: String(b.resourceId),
          bookingDate: b.bookingDate,
          startTime: toTimeInput(b.startTime),
          endTime: toTimeInput(b.endTime),
          purpose: b.purpose,
          expectedAttendees: String(b.expectedAttendees),
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load booking.';
        setLoadError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  function validate(data: BookingFormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.resourceId) errors.resourceId = 'Please select a resource.';
    if (!data.bookingDate) errors.bookingDate = 'Booking date is required.';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.bookingDate && new Date(data.bookingDate) < today) {
      errors.bookingDate = 'Booking date cannot be in the past.';
    }

    if (!data.startTime) errors.startTime = 'Start time is required.';
    if (!data.endTime) errors.endTime = 'End time is required.';
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = 'End time must be after start time.';
    }
    if (!data.purpose.trim()) {
      errors.purpose = 'Purpose is required.';
    } else if (data.purpose.trim().length < 5) {
      errors.purpose = 'Purpose must be at least 5 characters.';
    }

    const attendees = parseInt(data.expectedAttendees, 10);
    if (!data.expectedAttendees || isNaN(attendees) || attendees < 1) {
      errors.expectedAttendees = 'Attendees must be at least 1.';
    }

    return errors;
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => (prev ? { ...prev, [name]: value } : prev));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || !booking || !user) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const payload: BookingUpdateRequest = {
        resourceId: parseInt(form.resourceId, 10),
        bookingDate: form.bookingDate,
        startTime: form.startTime + ':00',
        endTime: form.endTime + ':00',
        purpose: form.purpose.trim(),
        expectedAttendees: parseInt(form.expectedAttendees, 10),
        actingUserId: user.id,
      };

      await bookingService.update(booking.id, payload);
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function inputClass(field: keyof FormErrors) {
    const base = 'w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition';
    return errors[field]
      ? `${base} border-red-400 bg-red-50 focus:ring-red-200`
      : `${base} border-gray-200 bg-white`;
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading booking…" />
        </div>
      </PageContainer>
    );
  }

  if (loadError || !booking || !form) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600 mb-3">{loadError ?? 'Booking not found.'}</p>
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

  // Enforce business rule at the page level as well
  if (!canEditBooking(booking.status)) {
    return (
      <PageContainer>
        <SectionTitle
          title={`Booking #${booking.id}`}
          subtitle="Editing is not available for this booking"
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
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
          <p className="text-sm text-amber-700">{getEditDisabledReason(booking.status)}</p>
        </div>
      </PageContainer>
    );
  }

  if (success) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-5 max-w-md mx-auto mt-8">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#061A40]">Booking Updated</h3>
            <p className="text-sm text-gray-500 mt-1">Your changes have been saved.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle
        title={`Edit Booking #${booking.id}`}
        subtitle="Update your booking request details"
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

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#061A40]">Booking Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">Selection and schedule information</p>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label htmlFor="resourceId" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select Resource <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="resourceId"
                    name="resourceId"
                    value={form.resourceId}
                    onChange={handleChange}
                    className={inputClass('resourceId')}
                  >
                    <option value="">Choose a resource...</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location} - Capacity: {r.capacity})
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.resourceId} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Booking Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bookingDate"
                      name="bookingDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.bookingDate}
                      onChange={handleChange}
                      className={inputClass('bookingDate')}
                    />
                    <FieldError message={errors.bookingDate} />
                  </div>

                  <div>
                    <label htmlFor="expectedAttendees" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expected Attendees <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="expectedAttendees"
                      name="expectedAttendees"
                      type="number"
                      min={1}
                      value={form.expectedAttendees}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      className={inputClass('expectedAttendees')}
                    />
                    <FieldError message={errors.expectedAttendees} />
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={handleChange}
                      className={inputClass('startTime')}
                    />
                    <FieldError message={errors.startTime} />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1.5">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={handleChange}
                      className={inputClass('endTime')}
                    />
                    <FieldError message={errors.endTime} />
                  </div>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Purpose of Booking <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    rows={4}
                    maxLength={2000}
                    value={form.purpose}
                    onChange={handleChange}
                    placeholder="Briefly explain why you need this resource..."
                    className={inputClass('purpose') + ' resize-none'}
                  />
                  <div className="flex justify-between mt-1">
                    <FieldError message={errors.purpose} />
                    <p className="text-xs text-gray-400">{form.purpose.length} / 2000</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
                {apiError ? (
                  <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{apiError}</span>
                  </div>
                ) : <span />}

                <div className="flex items-center gap-3">
                  <Link
                    to={`/bookings/${booking.id}`}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0353A4] hover:bg-[#003559]
                      text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" inline />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-[#061A40] mb-3 flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#0353A4]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Editing Rules
              </h3>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex gap-2">
                  <span className="text-[#0353A4]">•</span>
                  <span>Only pending bookings can be edited.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0353A4]">•</span>
                  <span>Edits resubmit the request for administrator approval.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0353A4]">•</span>
                  <span>End time must be after start time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
