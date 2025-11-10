// Profile Badge Component - Behavioral profile tag/badge

import type { BehavioralProfileType } from '@/lib/analysis-types';

interface ProfileBadgeProps {
  profile: BehavioralProfileType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ProfileBadge({ profile, size = 'md', showIcon = true }: ProfileBadgeProps) {
  const profileConfig: Record<
    BehavioralProfileType,
    { color: string; icon: string; label: string }
  > = {
    'Dominante': {
      color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-300 dark:border-red-800',
      icon: '🎯',
      label: 'Dominante',
    },
    'Influente': {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800',
      icon: '✨',
      label: 'Influente',
    },
    'Estável': {
      color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border-green-300 dark:border-green-800',
      icon: '🤝',
      label: 'Estável',
    },
    'Analítico': {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-800',
      icon: '📊',
      label: 'Analítico',
    },
    'Não Identificado': {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
      icon: '❓',
      label: 'Não Identificado',
    },
  };

  const config = profileConfig[profile] || profileConfig['Não Identificado'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
