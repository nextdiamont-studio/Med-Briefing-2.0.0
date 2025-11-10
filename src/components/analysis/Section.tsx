// Section Component - Reusable card section wrapper for reports

import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Section({
  title,
  subtitle,
  children,
  variant = 'default',
  className = '',
}: SectionProps) {
  const variantClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950',
    danger: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950',
  };

  const headerColors = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-green-900 dark:text-green-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    danger: 'text-red-900 dark:text-red-100',
    info: 'text-blue-900 dark:text-blue-100',
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 ${variantClasses[variant]} ${className}`}
    >
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${headerColors[variant]}`}>{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
