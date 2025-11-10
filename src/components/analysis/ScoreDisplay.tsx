// Score Display Component - Visual score representation with rating colors

import type { PerformanceRating } from '@/lib/analysis-types';

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  rating: PerformanceRating | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreDisplay({
  score,
  maxScore,
  rating,
  label,
  size = 'md',
}: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;

  const ratingColors: Record<string, string> = {
    'Crítico': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950',
    'Precisa Melhorar': 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950',
    'Moderado': 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950',
    'Bom': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950',
    'Excelente': 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950',
  };

  const progressColors: Record<string, string> = {
    'Crítico': 'bg-red-600',
    'Precisa Melhorar': 'bg-orange-600',
    'Moderado': 'bg-yellow-600',
    'Bom': 'bg-green-600',
    'Excelente': 'bg-emerald-600',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const scoreSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const color = ratingColors[rating] || ratingColors['Moderado'];
  const progressColor = progressColors[rating] || progressColors['Moderado'];

  return (
    <div className="space-y-2">
      {label && (
        <div className={`font-medium text-gray-700 dark:text-gray-300 ${sizeClasses[size]}`}>
          {label}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className={`font-bold ${scoreSizeClasses[size]} text-gray-900 dark:text-white`}>
          {score}
          <span className="text-gray-500 dark:text-gray-400">/{maxScore}</span>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}
        >
          {rating}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {percentage.toFixed(1)}% de aproveitamento
      </div>
    </div>
  );
}
