// Reports Service - Advanced metrics and analytics
import { supabase } from './supabase';

export interface AdvancedMetrics {
  overview: {
    totalAnalyses: number;
    conversionRate: number;
    averageTicket: number;
    totalRevenue: number;
    totalRecordings: number;
  };
  trends: {
    date: string;
    analyses: number;
    sales: number;
    revenue: number;
  }[];
  topErrors: {
    errorName: string;
    count: number;
    impact: 'critical' | 'high' | 'medium' | 'low';
  }[];
  behavioralProfiles: {
    profile: string;
    count: number;
    conversionRate: number;
  }[];
  salesBreakdown: {
    won: number;
    lost: number;
    followUp: number;
  };
  performanceScore: {
    overall: number;
    byPhase: {
      phase: string;
      score: number;
    }[];
  };
}

/**
 * Get advanced metrics for reports page
 * @param userId - User ID
 * @param period - Time period (7, 30, 90 days)
 */
export async function getAdvancedMetrics(
  userId: string,
  period: number = 30
): Promise<AdvancedMetrics> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. Get consultations data
    const { data: consultations, error: consultationsError } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (consultationsError) throw consultationsError;

    // 2. Get recordings data
    const { data: recordings, error: recordingsError } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (recordingsError) throw recordingsError;

    // 3. Calculate overview metrics
    const totalAnalyses = consultations?.length || 0;
    const totalRecordings = recordings?.length || 0;

    const salesConsultations = consultations?.filter(
      (c) => c.outcome === 'venda_realizada'
    ) || [];
    const lostConsultations = consultations?.filter(
      (c) => c.outcome === 'venda_perdida'
    ) || [];
    const followUpConsultations = consultations?.filter(
      (c) => c.outcome === 'follow_up'
    ) || [];

    const totalRevenue = salesConsultations.reduce(
      (sum, c) => sum + (c.sale_value || 0),
      0
    );
    const conversionRate =
      totalAnalyses > 0
        ? (salesConsultations.length / totalAnalyses) * 100
        : 0;
    const averageTicket =
      salesConsultations.length > 0
        ? totalRevenue / salesConsultations.length
        : 0;

    // 4. Calculate trends (group by date)
    const trendsByDate = new Map<string, { analyses: number; sales: number; revenue: number }>();

    consultations?.forEach((c) => {
      const date = new Date(c.created_at).toISOString().split('T')[0];
      const existing = trendsByDate.get(date) || { analyses: 0, sales: 0, revenue: 0 };

      existing.analyses += 1;
      if (c.outcome === 'venda_realizada') {
        existing.sales += 1;
        existing.revenue += c.sale_value || 0;
      }

      trendsByDate.set(date, existing);
    });

    const trends = Array.from(trendsByDate.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Calculate top errors
    const errorCounts = new Map<string, number>();

    consultations?.forEach((c) => {
      if (c.ai_analysis?.criticalErrors) {
        c.ai_analysis.criticalErrors.forEach((error: any) => {
          const count = errorCounts.get(error.errorName) || 0;
          errorCounts.set(error.errorName, count + 1);
        });
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([errorName, count]) => ({
        errorName,
        count,
        impact: count > 5 ? 'critical' : count > 3 ? 'high' : count > 1 ? 'medium' : 'low' as const,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 6. Calculate behavioral profiles distribution
    const profileCounts = new Map<string, { total: number; sales: number }>();

    consultations?.forEach((c) => {
      const profile =
        c.ai_analysis?.behavioralProfileAnalysis?.detectedProfile || 'Não identificado';
      const existing = profileCounts.get(profile) || { total: 0, sales: 0 };

      existing.total += 1;
      if (c.outcome === 'venda_realizada') {
        existing.sales += 1;
      }

      profileCounts.set(profile, existing);
    });

    const behavioralProfiles = Array.from(profileCounts.entries())
      .map(([profile, data]) => ({
        profile,
        count: data.total,
        conversionRate: data.total > 0 ? (data.sales / data.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 7. Sales breakdown
    const salesBreakdown = {
      won: salesConsultations.length,
      lost: lostConsultations.length,
      followUp: followUpConsultations.length,
    };

    // 8. Performance score
    const scoresWithValues = consultations
      ?.map((c) => c.overall_score)
      .filter((score): score is number => score !== null && score !== undefined);

    const overallScore =
      scoresWithValues && scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length
        : 0;

    // Calculate phase scores
    const phaseScores = new Map<string, number[]>();

    consultations?.forEach((c) => {
      if (c.ai_analysis?.phaseAnalysis) {
        c.ai_analysis.phaseAnalysis.forEach((phase: any) => {
          const scores = phaseScores.get(phase.stepName) || [];
          scores.push(phase.score || 0);
          phaseScores.set(phase.stepName, scores);
        });
      }
    });

    const byPhase = Array.from(phaseScores.entries())
      .map(([phase, scores]) => ({
        phase,
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      }))
      .sort((a, b) => a.phase.localeCompare(b.phase));

    return {
      overview: {
        totalAnalyses,
        conversionRate,
        averageTicket,
        totalRevenue,
        totalRecordings,
      },
      trends,
      topErrors,
      behavioralProfiles,
      salesBreakdown,
      performanceScore: {
        overall: overallScore,
        byPhase,
      },
    };
  } catch (error) {
    console.error('[ReportsService] Error getting advanced metrics:', error);
    throw error;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number for display
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
