import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useResources } from '../hooks/useResources';
import type { ResourceStatus, ResourceType } from '../types/resource.types';

const STATUS_STYLES: Record<ResourceStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  OUT_OF_SERVICE: 'bg-red-50 text-red-600',
};

const STATUS_LABELS: Record<ResourceStatus, string> = {
  ACTIVE: 'Active',
  OUT_OF_SERVICE: 'Out of Service',
};

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: 'Lecture Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting Room',
  EQUIPMENT: 'Equipment',
};

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
  const { resources, loading, error, refetch } = useResources();

  return (
    <PageContainer>
      <SectionTitle
        title="Resources"
        subtitle={loading ? 'Loading…' : `${resources.length} resource${resources.length !== 1 ? 's' : ''}`}
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

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading resources…" />
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
      {!loading && !error && resources.length === 0 && (
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
      )}

      {/* Table */}
      {!loading && !error && resources.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Capacity</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resources.map(resource => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{resource.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                      <p className="truncate">{resource.name}</p>
                      {resource.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{resource.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {TYPE_LABELS[resource.type]}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{resource.location}</td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{resource.capacity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[resource.status]}`}>
                        {STATUS_LABELS[resource.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
