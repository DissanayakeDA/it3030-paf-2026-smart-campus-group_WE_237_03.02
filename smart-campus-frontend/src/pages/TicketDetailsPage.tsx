import { Link, useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import StatusPill from '../components/common/StatusPill';

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PageContainer>
      <SectionTitle
        title={`Ticket ${id ?? ''}`}
        subtitle="Facility request details"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-[#061A40]">Lab A/C not working in Block C</h3>
            <StatusPill status="open" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            The air conditioning unit in Lab 3, Block C has stopped functioning. Students and staff are
            unable to use the lab during the hot hours. This needs urgent attention.
          </p>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity</h4>
            <p className="text-sm text-gray-400 italic">Activity log integration coming soon.</p>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Details</h4>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Ticket ID', value: id },
                { label: 'Priority', value: 'High' },
                { label: 'Location', value: 'Block C – Lab 3' },
                { label: 'Category', value: 'HVAC / Electrical' },
                { label: 'Reported By', value: 'Campus User' },
                { label: 'Created', value: '2026-04-17' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-gray-400">{label}</dt>
                  <dd className="font-medium text-gray-700 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Actions</h4>
            <div className="space-y-2">
              <button disabled className="w-full px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium opacity-50 cursor-not-allowed">
                Assign to Staff
              </button>
              <button disabled className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
