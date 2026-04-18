import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  disabled?: boolean;
}

export default function QuickActionCard({
  title,
  description,
  to,
  icon,
  disabled = false,
}: QuickActionCardProps) {
  const content = (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 h-full transition-all ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:border-[#B9D6F2] cursor-pointer'
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-[#B9D6F2] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#061A40]">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        {disabled && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-2">
            Coming soon
          </p>
        )}
      </div>
    </div>
  );

  if (disabled) return <div>{content}</div>;
  return <Link to={to}>{content}</Link>;
}
