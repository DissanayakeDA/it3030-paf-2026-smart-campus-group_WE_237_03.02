import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';

function IconBuilding() {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.2}
      stroke="currentColor"
      className="w-12 h-12 text-gray-300"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

export default function ResourceListPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Resources"
        subtitle="Campus facilities and equipment"
        action={
          <Link
            to="/resources/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <EmptyState
          title="No resources yet"
          description="Add your first campus facility or equipment to get started."
          icon={<IconBuilding />}
          action={
            <Link
              to="/resources/create"
              className="px-4 py-2 bg-[#0353A4] text-white text-sm font-medium rounded-lg hover:bg-[#003559] transition-colors"
            >
              Add Resource
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
}
