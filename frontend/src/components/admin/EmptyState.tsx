import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
  message?: string;
}

export default function EmptyState({
  onAction,
  actionLabel = 'Agregar primero',
  message = 'No hay registros',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-300 bg-white">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-francia rounded-lg hover:bg-francia-claro transition-colors min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
