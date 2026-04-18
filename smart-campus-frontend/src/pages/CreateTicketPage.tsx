import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';

export default function CreateTicketPage() {
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <p className="text-sm text-gray-500">Ticket form implementation coming soon.</p>
        </div>

        {/* Form placeholder */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {['Title', 'Location', 'Category', 'Priority'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field}</label>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button disabled className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
              Cancel
            </button>
            <button
              disabled
              className="px-5 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
