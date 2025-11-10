import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  Mic,
  Calendar
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  getAdvancedMetrics,
  formatCurrency,
  formatPercentage,
  formatNumber,
  type AdvancedMetrics
} from '../lib/reports-service'

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
}

const PROFILE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    if (user) {
      loadMetrics()
    }
  }, [user, period])

  const loadMetrics = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getAdvancedMetrics(user.id, period)
      setMetrics(data)
    } catch (error) {
      console.error('Error loading metrics:', error)
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

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Relatórios</h1>
          <p className="text-neutral-600 mt-1">Erro ao carregar métricas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Relatórios</h1>
          <p className="text-neutral-600 mt-1">
            Análise de performance e métricas detalhadas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 7
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 30
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 90
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Analyses */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {formatNumber(metrics.overview.totalAnalyses)}
          </h3>
          <p className="text-sm text-neutral-600">Análises Realizadas</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {formatPercentage(metrics.overview.conversionRate)}
          </h3>
          <p className="text-sm text-neutral-600">Taxa de Conversão</p>
        </div>

        {/* Average Ticket */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {formatCurrency(metrics.overview.averageTicket)}
          </h3>
          <p className="text-sm text-neutral-600">Ticket Médio</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {formatCurrency(metrics.overview.totalRevenue)}
          </h3>
          <p className="text-sm text-neutral-600">Receita Total</p>
        </div>

        {/* Total Recordings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <Mic className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">
            {formatNumber(metrics.overview.totalRecordings)}
          </h3>
          <p className="text-sm text-neutral-600">Gravações</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        {metrics.trends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Tendências ao Longo do Tempo
                </h3>
                <p className="text-sm text-neutral-600">
                  Análises e vendas por período
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="analyses"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Análises"
                  dot={{ fill: COLORS.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="Vendas"
                  dot={{ fill: COLORS.success }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sales Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Distribuição de Resultados
              </h3>
              <p className="text-sm text-neutral-600">Vendas ganhas vs perdidas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Vendas Ganhas', value: metrics.salesBreakdown.won },
                  { name: 'Vendas Perdidas', value: metrics.salesBreakdown.lost },
                  { name: 'Follow-up', value: metrics.salesBreakdown.followUp },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.danger} />
                <Cell fill={COLORS.warning} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Errors */}
        {metrics.topErrors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Principais Erros
                </h3>
                <p className="text-sm text-neutral-600">
                  Erros mais frequentes detectados
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topErrors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="errorName"
                  stroke="#666"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Behavioral Profiles */}
        {metrics.behavioralProfiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Perfis Comportamentais
                </h3>
                <p className="text-sm text-neutral-600">
                  Distribuição de perfis atendidos
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.behavioralProfiles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.profile}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.behavioralProfiles.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PROFILE_COLORS[index % PROFILE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Performance Score */}
      {metrics.performanceScore.overall > 0 && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white text-primary-600 rounded-lg shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Performance Geral
              </h3>
              <p className="text-sm text-neutral-700">
                Score médio de todas as análises
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg p-6">
              <p className="text-sm text-neutral-600 mb-2">Score Geral</p>
              <div className="flex items-end gap-2">
                <h2 className="text-5xl font-bold text-primary-600">
                  {metrics.performanceScore.overall.toFixed(1)}
                </h2>
                <span className="text-2xl text-neutral-400 mb-1">/10</span>
              </div>
              <div className="mt-4 w-full bg-neutral-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(metrics.performanceScore.overall / 10) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Phase Scores */}
            <div className="bg-white rounded-lg p-6">
              <p className="text-sm text-neutral-600 mb-4">Scores por Fase</p>
              <div className="space-y-3">
                {metrics.performanceScore.byPhase.slice(0, 5).map((phase) => (
                  <div key={phase.phase}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-700 font-medium truncate max-w-[200px]">
                        {phase.phase}
                      </span>
                      <span className="text-primary-600 font-bold">
                        {phase.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(phase.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {metrics.overview.totalAnalyses === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Comece a Analisar
          </h2>
          <p className="text-neutral-600 max-w-md mx-auto">
            Realize suas primeiras análises para começar a visualizar relatórios
            detalhados e métricas de performance.
          </p>
        </div>
      )}
    </div>
  )
}
