import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  disabled?: boolean;
  iconBg?: string;
  badge?: string;
}

export default function QuickActionCard({
  title,
  description,
  to,
  icon,
  disabled = false,
  iconBg = 'bg-[#B9D6F2]',
  badge,
}: QuickActionCardProps) {
  const content = (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 h-full transition-all group ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:border-[#B9D6F2] cursor-pointer'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#061A40]">{title}</p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 leading-none">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {disabled && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-2">Coming soon</p>
        )}
      </div>
      {!disabled && (
        <div className="shrink-0 self-center">
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-[#0353A4] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      )}
    </div>
  );

  if (disabled) return <div>{content}</div>;
  return <Link to={to}>{content}</Link>;
}
