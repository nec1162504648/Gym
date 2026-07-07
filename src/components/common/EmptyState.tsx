import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = '📋',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
