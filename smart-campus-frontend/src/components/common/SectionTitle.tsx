interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-[#061A40]">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
