import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useResources } from '../hooks/useResources';
import { resourceService } from '../services/resource.service';
import { useAuth } from '../context/AuthContext';
import type { ResourceStatus, ResourceType, ResourceResponse, ResourceListFilters } from '../types/resource.types';

const STATUS_STYLES: Record<ResourceStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  OUT_OF_SERVICE: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_DOT: Record<ResourceStatus, string> = {
  ACTIVE: "bg-emerald-500",
  OUT_OF_SERVICE: "bg-red-500",
};

const STATUS_LABELS: Record<ResourceStatus, string> = {
  ACTIVE: "Active",
  OUT_OF_SERVICE: "Out of Service",
};

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
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
        <p className="text-2xl font-bold text-[#061A40] leading-none">
          {value}
        </p>
        <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ── Detail Row component for Side Panel ── */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-50 flex flex-col gap-1 last:border-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="text-sm font-medium text-[#061A40]">{value || '—'}</div>
    </div>
  );
}

export default function ResourceListPage() {
  const { user } = useAuth();
  const canManageResources = user?.role === 'ADMIN';

  // Filters data state
  const [filterInputs, setFilterInputs] = useState<ResourceListFilters>({
    type: undefined,
    minCapacity: undefined,
    location: '',
    status: undefined,
  });

  // Active filters for API call
  const [activeFilters, setActiveFilters] = useState<ResourceListFilters>({});

  // Details Side Panel state
  const [selectedResource, setSelectedResource] = useState<ResourceResponse | null>(null);

  const { resources: fetchedResources, loading, error, refetch } = useResources(activeFilters);
  const [resources, setResources] = useState(fetchedResources);

  useEffect(() => {
    setResources(fetchedResources);
  }, [fetchedResources]);

  const handleApplyFilters = () => {
    setActiveFilters({ ...filterInputs });
  };

  const handleResetFilters = () => {
    const emptyFilters: ResourceListFilters = {
      type: undefined,
      minCapacity: undefined,
      location: '',
      status: undefined,
    };
    setFilterInputs(emptyFilters);
    setActiveFilters({});
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Don't trigger row click
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
  const activeCount = resources.filter((r) => r.status === "ACTIVE").length;
  const oosCount = resources.filter(
    (r) => r.status === "OUT_OF_SERVICE",
  ).length;

  const getStatusBadge = (status: ResourceStatus) => (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );

  return (
    <PageContainer>
      <SectionTitle
        title="Resources"
        subtitle={
          loading
            ? "Loading…"
            : `${totalCount} resource${totalCount !== 1 ? "s" : ""} found`
        }
        action={
          canManageResources ? (
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Resource
            </Link>
          ) : undefined
        }
      />

      {/* ── Summary Cards ── */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Resources"
            value={totalCount}
            accentColor="bg-blue-50 text-[#0353A4]"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            }
          />
          <StatCard
            label="Active"
            value={activeCount}
            accentColor="bg-emerald-50 text-emerald-600"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            label="Out of Service"
            value={oosCount}
            accentColor="bg-red-50 text-red-500"
            icon={
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Filters Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>
          <h4 className="text-sm font-semibold text-[#061A40]">Filter Resources</h4>
          {Object.values(activeFilters).some(v => v !== undefined && v !== '') && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#0353A4] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
              Filters Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Type</label>
            <select
              value={filterInputs.type || ''}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, type: e.target.value as ResourceType || undefined }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition-all"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Min. Capacity</label>
            <input
              type="number"
              value={filterInputs.minCapacity || ''}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, minCapacity: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="e.g. 30"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Location</label>
            <input
              type="text"
              value={filterInputs.location || ''}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Search location..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Status</label>
            <select
              value={filterInputs.status || ''}
              onChange={(e) => setFilterInputs(prev => ({ ...prev, status: e.target.value as ResourceStatus || undefined }))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent transition-all"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-50">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-[#0353A4] hover:bg-[#003559] text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      </div>

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

      {/* Empty State */}
      {!loading && !error && resources.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <EmptyState
            title="No resources found"
            description="Try adjusting your filters or add a new resource."
            icon={<IconBuilding />}
            action={
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#061A40] text-sm font-semibold rounded-xl transition-all duration-200"
              >
                Clear all filters
              </button>
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
              <h3 className="text-sm font-semibold text-[#061A40]">
                All Resources
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Click a row to see full details
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
                {resources.map((resource) => (
                  <tr
                    key={resource.id}
                    onClick={() => setSelectedResource(resource)}
                    className="group hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer"
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
                      <span className="text-gray-500 text-[13px]">
                        {resource.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-gray-500 font-medium text-[13px]">
                        {resource.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(resource.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResource(resource);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          View
                        </button>
                        <Link
                          to={`/resources/edit/${resource.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0353A4] bg-[#0353A4]/5 hover:bg-[#0353A4]/10 border border-[#0353A4]/10 hover:border-[#0353A4]/20 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={(e) => handleDelete(e, resource.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
              Showing {resources.length} resource
              {resources.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── Resource Details Side Panel (Drawer) ── */}
      {selectedResource && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={() => setSelectedResource(null)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out p-0 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <span className="text-[10px] font-bold text-[#0353A4] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Resource Details
                </span>
                <h2 className="text-lg font-bold text-[#061A40] mt-1">{selectedResource.name}</h2>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 font-sans">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">General Information</h3>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-1">
                    <DetailRow label="Resource ID" value={`#${selectedResource.id}`} />
                    <DetailRow label="Type" value={TYPE_LABELS[selectedResource.type]} />
                    <DetailRow label="Location" value={selectedResource.location} />
                    <DetailRow label="Capacity" value={`${selectedResource.capacity} Persons`} />
                    <DetailRow label="Status" value={getStatusBadge(selectedResource.status)} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Availability</h3>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-1">
                    <DetailRow label="Available From" value={selectedResource.availableFrom} />
                    <DetailRow label="Available To" value={selectedResource.availableTo} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      {selectedResource.description || "No description provided for this resource."}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to={`/resources/edit/${selectedResource.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0353A4] hover:bg-[#003559] text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98]"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    Edit This Resource
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
              <p className="text-[10px] text-gray-400 text-center">
                Last updated automatically from campus asset registry
              </p>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
