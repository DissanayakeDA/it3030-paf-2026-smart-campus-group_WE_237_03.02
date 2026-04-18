import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TICKET_CATEGORY_OPTIONS, TICKET_PRIORITY_OPTIONS } from '../constants/ticket.constants';
import { ticketService } from '../services/ticket.service';
import type { CreateTicketRequest, TicketCategory, TicketPriority } from '../types/ticket.types';

const EMPTY_FORM: CreateTicketRequest = {
  title: '',
  description: '',
  category: '' as TicketCategory,
  priority: '' as TicketPriority,
  preferredContact: '',
  locationText: '',
  resourceId: undefined,
};

const MAX_FILES = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter(f => ACCEPTED_TYPES.includes(f.type));
    const combined = [...files, ...valid].slice(0, MAX_FILES);
    setFiles(combined);
    // reset input so the same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Step 1 — create ticket
      const ticket = await ticketService.create(form);

      // Step 2 — upload attachments sequentially (max 3)
      for (const file of files) {
        await ticketService.uploadAttachment(ticket.id, file);
      }

      navigate(`/tickets/${ticket.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const isValid =
    form.title.trim() &&
    form.description.trim() &&
    form.category &&
    form.priority &&
    form.preferredContact.trim() &&
    form.locationText.trim();

  return (
    <PageContainer>
      <SectionTitle
        title="Create New Ticket"
        subtitle="Submit a new campus facility request"
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

          {/* ── Form fields ──────────────────────────────────────────────── */}
          <div className="p-6 space-y-5">

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={255}
                value={form.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
                >
                  <option value="">Select category</option>
                  {TICKET_CATEGORY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
                >
                  <option value="">Select priority</option>
                  {TICKET_PRIORITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="locationText" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="locationText"
                  name="locationText"
                  type="text"
                  required
                  value={form.locationText}
                  onChange={handleChange}
                  placeholder="e.g. Block C – Lab 3"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
                />
              </div>

              {/* Preferred Contact */}
              <div>
                <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Contact <span className="text-red-500">*</span>
                </label>
                <input
                  id="preferredContact"
                  name="preferredContact"
                  type="text"
                  required
                  value={form.preferredContact}
                  onChange={handleChange}
                  placeholder="e.g. email or phone number"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={4000}
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail…"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.description.length} / 4000
              </p>
            </div>

            {/* ── Attachments ────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attachments
                <span className="ml-1.5 text-xs text-gray-400 font-normal">
                  (optional — images only, max {MAX_FILES})
                </span>
              </label>

              {/* File previews */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative group w-20 h-20">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-400 mt-1 truncate w-20">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button — hidden when max reached */}
              {files.length < MAX_FILES && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg
                      text-sm text-gray-500 hover:border-[#0353A4] hover:text-[#0353A4] cursor-pointer transition-colors"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Choose images ({files.length}/{MAX_FILES})
                  </label>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* ── Footer actions ───────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              to="/tickets"
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0353A4] hover:bg-[#003559]
                text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  {files.length > 0 ? 'Uploading…' : 'Submitting…'}
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
