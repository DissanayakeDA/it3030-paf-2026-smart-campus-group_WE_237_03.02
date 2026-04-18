import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  color: string;
  icon: ReactNode;
}

export default function StatCard({ label, value, delta, color, icon }: StatCardProps) {
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
