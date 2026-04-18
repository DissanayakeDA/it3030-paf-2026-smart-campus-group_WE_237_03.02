import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { resourceService } from '../services/resource.service';

type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';
type ResourceCondition = 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'UNDER_MAINTENANCE';

interface FormData {
    name: string;
    description: string;
    type: ResourceType | '';
    capacity: string;
    location: string;
    availableFrom: string;
    availableTo: string;
    status: ResourceStatus;
    condition: ResourceCondition;
}

interface FormErrors {
    name?: string;
    type?: string;
    capacity?: string;
    location?: string;
    availableFrom?: string;
    availableTo?: string;
}

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.name.trim()) errors.name = 'Name is required.';
    if (!data.type) errors.type = 'Resource type is required.';
    const cap = parseInt(data.capacity, 10);
    if (!data.capacity || isNaN(cap) || cap < 1) errors.capacity = 'Capacity must be at least 1.';
    if (!data.location.trim()) errors.location = 'Location is required.';
    if (!data.availableFrom) errors.availableFrom = 'Start time is required.';
    if (!data.availableTo) errors.availableTo = 'End time is required.';
    if (data.availableFrom && data.availableTo && data.availableFrom >= data.availableTo) {
        errors.availableTo = 'End time must be after start time.';
    }
    return errors;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

/** Strip seconds portion ("HH:mm:ss" → "HH:mm") so the time input can display it. */
function toTimeInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.length > 5 ? value.slice(0, 5) : value;
}

export default function EditResourcePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [pageLoading, setPageLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [form, setForm] = useState<FormData>({
        name: '',
        description: '',
        type: '',
        capacity: '',
        location: '',
        availableFrom: '',
        availableTo: '',
        status: 'ACTIVE',
        condition: 'EXCELLENT',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Fetch existing resource ──
    useEffect(() => {
        if (!id) return;
        setPageLoading(true);
        setFetchError(null);
        resourceService
            .getById(Number(id))
            .then(res => {
                setForm({
                    name: res.name,
                    description: res.description ?? '',
                    type: res.type,
                    capacity: String(res.capacity),
                    location: res.location,
                    availableFrom: toTimeInput(res.availableFrom),
                    availableTo: toTimeInput(res.availableTo),
                    status: res.status,
                    condition: res.condition,
                });
            })
            .catch(() => setFetchError('Failed to load resource. It may not exist.'))
            .finally(() => setPageLoading(false));
    }, [id]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setApiError(null);

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                type: form.type,
                capacity: parseInt(form.capacity, 10),
                location: form.location.trim(),
                availableFrom: form.availableFrom + ':00',
                availableTo: form.availableTo + ':00',
                status: form.status,
                condition: form.condition,
            };

            await resourceService.update(Number(id), payload);
            setSuccess(true);
        } catch {
            setApiError('Failed to update resource. Please check your inputs and try again.');
        } finally {
            setSubmitting(false);
        }
    }

    function inputClass(field: keyof FormErrors) {
        const base =
            'w-full px-3.5 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition';
        return errors[field]
            ? `${base} border-red-400 bg-red-50 focus:ring-red-200`
            : `${base} border-gray-200 bg-white`;
    }

    // ── Loading state ──
    if (pageLoading) {
        return (
            <PageContainer>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <LoadingSpinner message="Loading resource…" />
                </div>
            </PageContainer>
        );
    }

    // ── Fetch error state ──
    if (fetchError) {
        return (
            <PageContainer>
                <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    <p className="text-sm text-red-600 mb-4">{fetchError}</p>
                    <Link
                        to="/resources"
                        className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#0353A4] to-[#003559] text-white rounded-xl shadow-md shadow-[#0353A4]/20 hover:shadow-lg transition-all duration-200"
                    >
                        Back to Resources
                    </Link>
                </div>
            </PageContainer>
        );
    }

    // ── Success state ──
    if (success) {
        return (
            <PageContainer>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-12 flex flex-col items-center gap-6 max-w-md mx-auto mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-emerald-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-[#061A40]">Resource Updated</h3>
                        <p className="text-sm text-gray-500 mt-1.5">
                            Resource <span className="font-semibold text-[#0353A4]">#{id}</span> has been
                            updated successfully.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={() => { setSuccess(false); }}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
                        >
                            Continue Editing
                        </button>
                        <button
                            onClick={() => navigate('/resources')}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0353A4] to-[#003559] text-white text-sm font-semibold shadow-md shadow-[#0353A4]/20 hover:shadow-lg transition-all duration-200"
                        >
                            View Resources
                        </button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // ── Edit form ──
    return (
        <PageContainer>
            <SectionTitle
                title="Edit Resource"
                subtitle={`Updating resource #${id}`}
                action={
                    <Link
                        to="/resources"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0353A4] transition-colors duration-150"
                    >
                        <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                        Back to Resources
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} noValidate>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    {/* ── Section 1: Basic Information ── */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-[#061A40]">Basic Information</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Name, type, and capacity details</p>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Lecture Hall A"
                                    className={inputClass('name')}
                                />
                                <FieldError message={errors.name} />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className={inputClass('type')}
                                >
                                    <option value="">Select resource type</option>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                                <FieldError message={errors.type} />
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Capacity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    min={1}
                                    placeholder="e.g. 60"
                                    className={inputClass('capacity')}
                                />
                                <FieldError message={errors.capacity} />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Block B – Ground Floor"
                                    className={inputClass('location')}
                                />
                                <FieldError message={errors.location} />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Optional notes about this resource…"
                                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition resize-none"
                            />
                        </div>
                    </div>

                    {/* ── Section 2: Availability & Status ── */}
                    <div className="px-6 py-4 border-t border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-[#061A40]">Availability &amp; Status</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Operating hours and current condition</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Available From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Available From <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="availableFrom"
                                    value={form.availableFrom}
                                    onChange={handleChange}
                                    className={inputClass('availableFrom')}
                                />
                                <FieldError message={errors.availableFrom} />
                            </div>

                            {/* Available To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Available To <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="availableTo"
                                    value={form.availableTo}
                                    onChange={handleChange}
                                    className={inputClass('availableTo')}
                                />
                                <FieldError message={errors.availableTo} />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                </select>
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Condition
                                </label>
                                <select
                                    name="condition"
                                    value={form.condition}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0353A4]/20 focus:border-[#0353A4] transition"
                                >
                                    <option value="EXCELLENT">Excellent</option>
                                    <option value="GOOD">Good</option>
                                    <option value="NEEDS_ATTENTION">Needs Attention</option>
                                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                        {/* API error */}
                        {apiError ? (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                                <span>{apiError}</span>
                            </div>
                        ) : (
                            <span />
                        )}

                        <div className="flex items-center gap-3 ml-auto">
                            <Link
                                to="/resources"
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0353A4] to-[#003559] hover:from-[#003559] hover:to-[#002740] text-white text-sm font-semibold shadow-md shadow-[#0353A4]/20 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting && (
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                )}
                                {submitting ? 'Updating…' : 'Update Resource'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </PageContainer>
    );
}
