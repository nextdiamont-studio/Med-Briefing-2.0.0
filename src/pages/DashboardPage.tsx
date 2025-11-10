import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Mic,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  Brain,
  Target,
} from 'lucide-react'
import type { DashboardMetrics as OldDashboardMetrics, Consultation } from '../lib/types'
import type { DashboardMetrics, Analysis } from '../lib/analysis-types'
import { getDashboardMetrics, getUserAnalyses } from '../lib/analysis-db'
import { ProfileBadge } from '../components/analysis/ProfileBadge'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [oldMetrics, setOldMetrics] = useState<OldDashboardMetrics>({
    conversionRate: 0,
    averageTicket: 0,
    totalConsultations: 0,
    totalSales: 0,
    totalLostSales: 0,
  })
  const [analysisMetrics, setAnalysisMetrics] = useState<DashboardMetrics | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      if (!user) return

      // Carregar métricas de análise
      const metrics = await getDashboardMetrics(user.id)
      setAnalysisMetrics(metrics)

      // Carregar análises recentes
      const analyses = await getUserAnalyses(user.id)
      setRecentAnalyses(analyses.slice(0, 5))

      // Usar métricas das análises para os KPIs
      setOldMetrics({
        conversionRate: metrics.conversion_rate,
        averageTicket: metrics.average_ticket,
        totalConsultations: metrics.performance_analyses,
        totalSales: metrics.total_revenue > 0 ? Math.round(metrics.performance_analyses * (metrics.conversion_rate / 100)) : 0,
        totalLostSales: metrics.performance_analyses - Math.round(metrics.performance_analyses * (metrics.conversion_rate / 100)),
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Visão geral da sua clínica de estética</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/analises')}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-neutral-800 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all font-semibold shadow-sm text-sm sm:text-base"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Análises/Relatórios</span>
          </button>
          <button
            onClick={() => navigate('/gravacoes')}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-rose-600/40 text-sm sm:text-base"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Nova Gravação</span>
          </button>
        </div>
      </div>

      {/* Métricas de Análise (Novo Sistema) */}
      {analysisMetrics && analysisMetrics.total_analyses > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Análises com IA
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-purple-200 text-xs sm:text-sm mb-1">Total de Análises</p>
              <p className="text-2xl sm:text-3xl font-bold">{analysisMetrics.total_analyses}</p>
              <p className="text-purple-200 text-xs mt-1">
                {analysisMetrics.analyses_this_week} esta semana
              </p>
            </div>
            <div>
              <p className="text-purple-200 text-xs sm:text-sm mb-1">Taxa de Conversão</p>
              <p className="text-2xl sm:text-3xl font-bold">{analysisMetrics.conversion_rate.toFixed(1)}%</p>
              <p className="text-purple-200 text-xs mt-1">
                {analysisMetrics.performance_analyses} análises
              </p>
            </div>
            <div>
              <p className="text-purple-200 text-xs sm:text-sm mb-1">Receita Total</p>
              <p className="text-2xl sm:text-3xl font-bold">
                R$ {analysisMetrics.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-purple-200 text-xs mt-1">
                Ticket: R$ {analysisMetrics.average_ticket.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-purple-200 text-xs sm:text-sm mb-1">Perfil Mais Frequente</p>
              <div className="mt-2">
                <ProfileBadge profile={analysisMetrics.most_frequent_profile} size="md" />
              </div>
              <p className="text-purple-200 text-xs mt-2">
                {analysisMetrics.spin_qualifications} briefings SPIN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Grid - Métricas Essenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <KPICard
          title="Taxa de Conversão"
          value={`${oldMetrics.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={`${oldMetrics.totalSales} vendas realizadas`}
          trendUp={oldMetrics.conversionRate > 50}
          color="success"
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${oldMetrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={`Baseado em ${oldMetrics.totalSales} vendas`}
          color="aesthetic"
        />
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatusCard
          title="Análises com IA"
          value={analysisMetrics?.total_analyses || 0}
          description="Performance + Briefings SPIN"
          icon={Brain}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatusCard
          title="Este Mês"
          value={analysisMetrics?.analyses_this_month || 0}
          description="Análises geradas este mês"
          icon={Target}
          iconBg="bg-success-50"
          iconColor="text-success-500"
        />
      </div>

      {/* Análises Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Análises Recentes</h2>
              <p className="text-sm text-neutral-600 mt-1">Últimas análises realizadas com IA</p>
            </div>
            <button
              onClick={() => navigate('/analises')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {recentAnalyses.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-medium mb-2">Nenhuma análise registrada</p>
              <p className="text-sm text-neutral-500 mb-4">
                Crie sua primeira análise para começar a usar IA
              </p>
              <button
                onClick={() => navigate('/analises')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Nova Análise
              </button>
            </div>
          ) : (
            recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => navigate('/analises')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Type badge */}
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        analysis.analysis_type === 'performance'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {analysis.analysis_type === 'performance' ? 'Performance' : 'Briefing'}
                      </span>
                      {analysis.analysis_type === 'performance' && analysis.outcome && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          analysis.outcome === 'Venda Realizada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {analysis.outcome === 'Venda Realizada' ? 'Vendida' : 'Perdida'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {analysis.patient_name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {new Date(analysis.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Value/Icon */}
                  <div className="text-right">
                    {analysis.analysis_type === 'performance' && analysis.ticket_value ? (
                      <p className="text-lg font-semibold text-neutral-900">
                        R$ {analysis.ticket_value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ações Rápidas Grid - Foco em Estética Médica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <QuickActionCard
          title="Análises com IA"
          description="Visualizar e criar análises de consultas com inteligência artificial"
          icon={Brain}
          onClick={() => navigate('/analises')}
          gradient="from-purple-500 to-purple-600"
        />
        <QuickActionCard
          title="Gravações"
          description="Gravar, transcrever e analisar consultas de pacientes"
          icon={Mic}
          onClick={() => navigate('/gravacoes')}
          gradient="from-rose-500 to-pink-600"
        />
      </div>
    </div>
  )
}

// Componente KPI Card
function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
  color: 'primary' | 'aesthetic' | 'success' | 'warning'
}) {
  const colorClasses = {
    primary: 'bg-primary-600',
    aesthetic: 'bg-aesthetic-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${colorClasses[color]} rounded-lg shadow-lg`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp !== undefined ? (trendUp ? 'text-success-600' : 'text-error-500') : 'text-neutral-500 dark:text-neutral-400'}`}>
            {trendUp !== undefined && (
              <ArrowUpRight className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${!trendUp && 'rotate-90'}`} />
            )}
            <span className="hidden sm:inline">{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
    </div>
  )
}

// Componente Status Card
function StatusCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string
  value: number
  description: string
  icon: any
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${iconBg} dark:opacity-90 rounded-lg`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">{value}</p>
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  )
}

// Componente Quick Action Card
function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  gradient,
}: {
  title: string
  description: string
  icon: any
  onClick: () => void
  gradient: string
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 text-left hover:shadow-lg transition-all overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
      <div className="relative">
        <div className={`inline-flex p-2 sm:p-3 bg-gradient-to-br ${gradient} rounded-lg shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 text-base sm:text-lg">{title}</h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
    </button>
  )
}
