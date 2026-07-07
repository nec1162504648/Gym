import type { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <main className={`max-w-4xl mx-auto px-4 md:px-6 py-6 ${className}`}>
      {children}
    </main>
  );
}
