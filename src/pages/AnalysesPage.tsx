// Analyses Page - View and manage all analyses

import { useState, useEffect } from 'react';
import { Plus, FileText, Brain, Calendar, Filter, ArrowLeft, Trash2 } from 'lucide-react';
import { AnalysisUploadModal } from '@/components/analysis/AnalysisUploadModal';
import { LostSaleReport } from '@/components/analysis/LostSaleReport';
import { RealizedSaleReport } from '@/components/analysis/RealizedSaleReport';
import { SpinQualificationInterface } from '@/components/analysis/SpinQualificationInterface';
import { ProfileBadge } from '@/components/analysis/ProfileBadge';
import { getUserAnalyses, getPerformanceAnalysisById, getSpinQualificationById, deleteAnalysis } from '@/lib/analysis-db';
import { useAuth } from '@/hooks/useAuth';
import type { Analysis, PerformanceAnalysis, SpinQualification } from '@/lib/analysis-types';

export function AnalysesPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'performance' | 'spin'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Analysis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAnalyses();
  }, [user]);

  const loadAnalyses = async () => {
    if (!user) return;

    setIsLoading(true);
    const data = await getUserAnalyses(user.id);
    setAnalyses(data);
    setIsLoading(false);
  };

  const handleDelete = async (analysis: Analysis) => {
    setIsDeleting(true);
    try {
      await deleteAnalysis(analysis.id);
      setConfirmDelete(null);
      await loadAnalyses();
      alert('✅ Análise excluída com sucesso!');
    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      alert(`❌ Erro ao excluir análise: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (filterType === 'all') return true;
    return analysis.analysis_type === filterType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedAnalysis) {
    return (
      <AnalysisDetailView
        analysis={selectedAnalysis}
        onBack={() => setSelectedAnalysis(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Análises
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Gerencie e visualize todas as suas análises de consultas
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Nova Análise
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('performance')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                filterType === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setFilterType('spin')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                filterType === 'spin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Briefing SPIN
            </button>
          </div>
        </div>
      </div>

      {/* Analyses List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando análises...
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma análise encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comece criando sua primeira análise
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Criar Análise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow relative group"
            >
              <button
                onClick={() => setSelectedAnalysis(analysis)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {analysis.analysis_type === 'performance' ? (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      analysis.analysis_type === 'performance'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                        : 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-200'
                    }`}
                  >
                    {analysis.analysis_type === 'performance' ? 'Performance' : 'Briefing'}
                  </span>
                  {analysis.analysis_type === 'performance' && analysis.outcome && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        analysis.outcome === 'Venda Realizada'
                          ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {analysis.outcome === 'Venda Realizada' ? 'Vendida' : 'Perdida'}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                {analysis.patient_name}
              </h3>

              {analysis.file_name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📄 {analysis.file_name}
                </p>
              )}

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(analysis.created_at)}</span>
                </div>
              </button>

              {/* Delete button - Bottom Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(analysis);
                }}
                className="absolute bottom-4 right-4 p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Excluir análise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnalysisUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadAnalyses();
        }}
      />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Excluir Análise?
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {confirmDelete.patient_name}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Tipo: {confirmDelete.analysis_type === 'performance' ? 'Performance' : 'Briefing'}</p>
                  <p>Criado em: {formatDate(confirmDelete.created_at)}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>⚠️ Atenção:</strong> Todos os dados desta análise serão permanentemente excluídos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Excluir Permanentemente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to load and display full analysis details
function AnalysisDetailView({ analysis, onBack }: { analysis: Analysis; onBack: () => void }) {
  const [fullAnalysis, setFullAnalysis] = useState<PerformanceAnalysis | SpinQualification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFullAnalysis();
  }, [analysis.id]);

  const loadFullAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (analysis.analysis_type === 'performance') {
        const data = await getPerformanceAnalysisById(analysis.id);
        if (data) {
          setFullAnalysis(data);
        } else {
          setError('Não foi possível carregar os dados da análise.');
        }
      } else if (analysis.analysis_type === 'spin') {
        const data = await getSpinQualificationById(analysis.id);
        if (data) {
          setFullAnalysis(data);
        } else {
          setError('Não foi possível carregar os dados do briefing SPIN.');
        }
      }
    } catch (err) {
      console.error('Error loading full analysis:', err);
      setError('Erro ao carregar análise. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista de análises
        </button>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando análise completa...</p>
        </div>
      </div>
    );
  }

  if (error || !fullAnalysis) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista de análises
        </button>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao Carregar Análise
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadFullAnalysis}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para lista de análises
      </button>

      {fullAnalysis.analysis_type === 'performance' ? (
        <>
          {(fullAnalysis as PerformanceAnalysis).performanceData.outcome === 'Venda Realizada' ? (
            <RealizedSaleReport analysis={(fullAnalysis as PerformanceAnalysis).performanceData} />
          ) : (
            <LostSaleReport analysis={(fullAnalysis as PerformanceAnalysis).performanceData} />
          )}
        </>
      ) : (
        <SpinQualificationInterface
          qualification={(fullAnalysis as SpinQualification).spinData}
          patientName={fullAnalysis.patient_name}
        />
      )}
    </div>
  );
}
