interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  /** When true renders only the ring with no wrapper padding — use inside buttons */
  inline?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({ size = 'md', message, inline = false }: LoadingSpinnerProps) {
  const ring = (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full border-[#B9D6F2] border-t-[#0353A4] animate-spin`}
    />
  );

  if (inline) return ring;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {ring}
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
