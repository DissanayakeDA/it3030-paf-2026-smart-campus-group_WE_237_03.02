import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useResources } from '../hooks/useResources';
import { resourceService } from '../services/resource.service';
import type { ResourceStatus, ResourceType } from '../types/resource.types';

const STATUS_STYLES: Record<ResourceStatus, string> = {
  ACTIVE:
    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  OUT_OF_SERVICE:
    'bg-red-50 text-red-600 border border-red-200',
};

const STATUS_DOT: Record<ResourceStatus, string> = {
  ACTIVE: 'bg-emerald-500',
  OUT_OF_SERVICE: 'bg-red-500',
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

/* ── Summary stat card ── */
function StatCard({
  label,
  value,
  icon,
  accentColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex items-center gap-4 min-w-0">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[#061A40] leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ResourceListPage() {
  const { resources: fetchedResources, loading, error, refetch } = useResources();
  const [resources, setResources] = useState(fetchedResources);

  useEffect(() => {
    setResources(fetchedResources);
  }, [fetchedResources]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.delete(id);
      setResources(prev => prev.filter(r => r.id !== id));
      alert('Resource deleted successfully.');
    } catch {
      alert('Failed to delete resource. Please try again.');
    }
  };

  const totalCount = resources.length;
  const activeCount = resources.filter(r => r.status === 'ACTIVE').length;
  const oosCount = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

  return (
    <PageContainer>
      <SectionTitle
        title="Resources"
        subtitle={
          loading
            ? 'Loading…'
            : `${totalCount} resource${totalCount !== 1 ? 's' : ''} registered`
        }
        action={
          <Link
            to="/resources/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0353A4] to-[#003559] hover:from-[#003559] hover:to-[#002740] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#0353A4]/20 hover:shadow-lg hover:shadow-[#0353A4]/25 transition-all duration-200 active:scale-[0.98]"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </Link>
        }
      />

      {/* ── Summary Cards ── */}
      {!loading && !error && resources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Resources"
            value={totalCount}
            accentColor="bg-blue-50 text-[#0353A4]"
            icon={
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
          />
          <StatCard
            label="Active"
            value={activeCount}
            accentColor="bg-emerald-50 text-emerald-600"
            icon={
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Out of Service"
            value={oosCount}
            accentColor="bg-red-50 text-red-500"
            icon={
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <LoadingSpinner message="Loading resources…" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-sm font-medium bg-[#0353A4] text-white rounded-xl hover:bg-[#003559] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && resources.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <EmptyState
            title="No resources yet"
            description="Add your first campus facility or equipment to get started."
            icon={<IconBuilding />}
            action={
              <Link
                to="/resources/create"
                className="px-5 py-2.5 bg-gradient-to-r from-[#0353A4] to-[#003559] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#0353A4]/20 hover:shadow-lg transition-all duration-200"
              >
                Add Resource
              </Link>
            }
          />
        </div>
      )}

      {/* ── Table Card ── */}
      {!loading && !error && resources.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#061A40]">All Resources</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage registered campus facilities and equipment
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gradient-to-r from-gray-50/80 to-gray-50/40">
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Capacity
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {resources.map(resource => (
                  <tr
                    key={resource.id}
                    className="group hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-gray-100 text-[11px] font-mono font-medium text-gray-500">
                        {resource.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-[#061A40] truncate text-[13px] leading-tight">
                        {resource.name}
                      </p>
                      {resource.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">
                          {resource.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-500 text-[13px]">
                        {TYPE_LABELS[resource.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-500 text-[13px]">{resource.location}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-500 font-medium text-[13px]">
                        {resource.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[resource.status]}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[resource.status]}`}
                        />
                        {STATUS_LABELS[resource.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/resources/edit/${resource.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0353A4] bg-[#0353A4]/5 hover:bg-[#0353A4]/10 border border-[#0353A4]/10 hover:border-[#0353A4]/20 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                        >
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                            />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                        >
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
