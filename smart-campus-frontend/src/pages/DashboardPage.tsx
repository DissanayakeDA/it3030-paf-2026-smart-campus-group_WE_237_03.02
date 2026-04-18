import PageContainer from "../components/common/PageContainer";
import SectionTitle from "../components/common/SectionTitle";
import StatusPill from "../components/common/StatusPill";
import type { TicketStatus } from "../components/common/StatusPill";

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
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
}

interface RecentTicketRow {
  id: string;
  title: string;
  status: TicketStatus;
  date: string;
}

const RECENT_TICKETS: RecentTicketRow[] = [
  {
    id: "TKT-001",
    title: "Lab A/C not working in Block C",
    status: "open",
    date: "2026-04-17",
  },
  {
    id: "TKT-002",
    title: "Projector bulb replacement needed",
    status: "in-progress",
    date: "2026-04-16",
  },
  {
    id: "TKT-003",
    title: "Network port B-204 unresponsive",
    status: "resolved",
    date: "2026-04-15",
  },
  {
    id: "TKT-004",
    title: "Water leakage near staircase 2",
    status: "pending",
    date: "2026-04-14",
  },
];

export default function DashboardPage() {
  return (
    <PageContainer>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Tickets"
          value={12}
          delta="3 added this week"
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
          label="In Progress"
          value={5}
          delta="2 updated today"
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
          label="Resolved"
          value={38}
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
          label="Pending Review"
          value={4}
          delta="Awaiting assignment"
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
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
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
          {RECENT_TICKETS.map((ticket) => (
            <div
              key={ticket.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                  {ticket.id}
                </span>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {ticket.title}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <StatusPill status={ticket.status} />
                <span className="text-xs text-gray-400 hidden sm:block">
                  {ticket.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
