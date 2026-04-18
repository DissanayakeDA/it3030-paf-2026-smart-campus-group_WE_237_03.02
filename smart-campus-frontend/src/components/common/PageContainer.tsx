interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`p-6 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}
