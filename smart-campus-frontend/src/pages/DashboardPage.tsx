import PageContainer from "../components/common/PageContainer";
import SectionTitle from "../components/common/SectionTitle";
import StatusPill from "../components/common/StatusPill";
import type {
  TicketStatus,
  TicketSummaryResponse,
  TicketResponse,
} from "../types/ticket.types";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_STYLES,
  TICKET_PRIORITY_LABELS,
} from "../constants/ticket.constants";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  color: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, delta, color, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-[#061A40] mt-1">{value}</p>
        {delta && <p className="text-xs text-gray-400 mt-1">{delta}</p>}
      </div>
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
}

// Mock summary — replace with useTicketSummary() hook when API is wired
const MOCK_SUMMARY: TicketSummaryResponse = {
  totalTickets: 59,
  openTickets: 12,
  resolvedTickets: 38,
  averageFirstResponseMinutes: 42,
  averageResolutionMinutes: 310,
};

// Mock recent tickets — replace with useTickets() hook when API is wired
const MOCK_RECENT: Pick<
  TicketResponse,
  "id" | "title" | "status" | "category" | "priority" | "createdAt"
>[] = [
  {
    id: 1,
    title: "Lab A/C not working in Block C",
    status: "OPEN",
    category: "ELECTRICAL",
    priority: "HIGH",
    createdAt: "2026-04-17T08:30:00Z",
  },
  {
    id: 2,
    title: "Projector bulb replacement needed",
    status: "IN_PROGRESS",
    category: "PROJECTOR",
    priority: "MEDIUM",
    createdAt: "2026-04-16T10:15:00Z",
  },
  {
    id: 3,
    title: "Network port B-204 unresponsive",
    status: "RESOLVED",
    category: "NETWORK",
    priority: "MEDIUM",
    createdAt: "2026-04-15T14:00:00Z",
  },
  {
    id: 4,
    title: "Water leakage near staircase 2",
    status: "OPEN",
    category: "OTHER",
    priority: "CRITICAL",
    createdAt: "2026-04-14T09:45:00Z",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMinutes(min: number | null): string {
  if (min === null) return "—";
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function DashboardPage() {
  const s = MOCK_SUMMARY;

  return (
    <PageContainer>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Tickets"
          value={s.openTickets}
          delta={`${s.totalTickets} total requests`}
          color="bg-blue-50"
          icon={
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="#0353A4"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          }
        />
        <StatCard
          label="Resolved"
          value={s.resolvedTickets}
          delta="This month"
          color="bg-green-50"
          icon={
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="#16a34a"
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
          label="Avg First Response"
          value={formatMinutes(s.averageFirstResponseMinutes)}
          delta="Time to first response"
          color="bg-yellow-50"
          icon={
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="#d97706"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Avg Resolution"
          value={formatMinutes(s.averageResolutionMinutes)}
          delta="Time to resolution"
          color="bg-orange-50"
          icon={
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="#ea580c"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z"
              />
            </svg>
          }
        />
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionTitle
            title="Recent Tickets"
            subtitle="Latest facility requests"
            action={
              <a
                href="/tickets"
                className="text-sm text-[#0353A4] hover:underline font-medium"
              >
                View all
              </a>
            }
          />
        </div>

        <div className="divide-y divide-gray-50">
          {MOCK_RECENT.map((ticket) => (
            <div
              key={ticket.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-gray-400 shrink-0">
                  #{ticket.id}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {TICKET_CATEGORY_LABELS[ticket.category]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium hidden sm:inline-flex ${TICKET_PRIORITY_STYLES[ticket.priority]}`}
                >
                  {TICKET_PRIORITY_LABELS[ticket.priority]}
                </span>
                <StatusPill status={ticket.status as TicketStatus} />
                <span className="text-xs text-gray-400 hidden lg:block">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
