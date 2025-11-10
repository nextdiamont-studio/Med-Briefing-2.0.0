// Realized Sale Report Component - Analysis for successful sales (can be low-quality)

import { Section } from './Section';
import { ScoreDisplay } from './ScoreDisplay';
import { StepAccordion } from './StepAccordion';
import { BehavioralProfileCard } from './BehavioralProfileCard';
import type { PerformanceAnalysisData } from '@/lib/analysis-types';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface RealizedSaleReportProps {
  analysis: PerformanceAnalysisData;
}

export function RealizedSaleReport({ analysis }: RealizedSaleReportProps) {
  const isLowQuality = analysis.is_low_quality_sale;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className={`text-white p-8 rounded-lg shadow-lg print:bg-green-700 ${
        isLowQuality
          ? 'bg-gradient-to-r from-orange-600 to-orange-700'
          : 'bg-gradient-to-r from-green-600 to-green-700'
      }`}>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          {isLowQuality ? (
            <>
              <AlertCircle className="w-8 h-8" />
              Venda Realizada - Baixa Qualidade
            </>
          ) : (
            <>
              <CheckCircle className="w-8 h-8" />
              Venda Realizada
            </>
          )}
        </h1>
        <p className={isLowQuality ? 'text-orange-100' : 'text-green-100'}>
          {isLowQuality
            ? 'Venda fechada por pressão. Alto risco de cancelamento ou insatisfação.'
            : 'Análise de performance com oportunidades de melhoria'}
        </p>
        {analysis.ticket_value && (
          <div className="mt-4 text-2xl font-bold">
            Valor: R$ {analysis.ticket_value.toFixed(2)}
          </div>
        )}
      </div>

      {/* Low Quality Warning */}
      {isLowQuality && (
        <Section title="⚠️ Alerta de Venda de Baixa Qualidade" variant="warning">
          <div className="space-y-3">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Esta venda foi fechada, mas a análise indica que foi por pressão e não por construção
              de valor genuíno. Isso representa alto risco de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Cancelamento do procedimento</li>
              <li>No-show (não comparecimento)</li>
              <li>Arrependimento do cliente</li>
              <li>Avaliações negativas</li>
              <li>Falta de indicações futuras</li>
            </ul>
            <p className="text-orange-800 dark:text-orange-200 font-semibold mt-4">
              ⚡ Ação recomendada: Aplicar as estratégias de correção imediatamente para melhorar
              a experiência do paciente e reduzir o risco de cancelamento.
            </p>
          </div>
        </Section>
      )}

      {/* Overall Performance */}
      <Section title="Performance Geral" variant={isLowQuality ? 'warning' : 'success'}>
        <ScoreDisplay
          score={analysis.overall_performance.score}
          maxScore={160}
          rating={analysis.overall_performance.rating}
          label="Pontuação Total (16 Passos × 10 Pontos)"
          size="lg"
        />
        <p className="text-gray-700 dark:text-gray-300 mt-4 leading-relaxed">
          {analysis.overall_performance.summary}
        </p>
      </Section>

      {/* Success Factors (if not low quality) */}
      {!isLowQuality && analysis.indication_baseline && (
        <Section title="Fatores de Sucesso" variant="success">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">
                  Conexão Emocional
                </h5>
                <p className="text-sm text-gray-800 dark:text-gray-200 italic bg-green-50 dark:bg-green-950 p-3 rounded">
                  "{analysis.indication_baseline.emotional_connection_extract}"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">
                  Construção de Valor
                </h5>
                <p className="text-sm text-gray-800 dark:text-gray-200 italic bg-green-50 dark:bg-green-950 p-3 rounded">
                  "{analysis.indication_baseline.value_building_extract}"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">
                  Prova Social
                </h5>
                <p className="text-sm text-gray-800 dark:text-gray-200 italic bg-green-50 dark:bg-green-950 p-3 rounded">
                  "{analysis.indication_baseline.social_proof_extract}"
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* For low quality sales, show correction details if available */}
      {isLowQuality && analysis.lost_sale_details && (
        <>
          {/* Error Pattern */}
          <Section title="Padrão de Erros" variant="warning">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.lost_sale_details.error_pattern.excellent}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Passos Excelentes
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analysis.lost_sale_details.error_pattern.good}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Passos Bons
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {analysis.lost_sale_details.error_pattern.deficient}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Passos Deficientes
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {analysis.lost_sale_details.error_pattern.critical}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Passos Críticos
                </div>
              </div>
            </div>
          </Section>

          {/* Why Sale Happened Despite Errors */}
          <Section title="Por que a venda aconteceu apesar dos erros?" variant="info">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.lost_sale_details.root_cause}
            </p>
          </Section>

          {/* Risks */}
          <Section title="Riscos Identificados" variant="danger">
            <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded">
              <p className="text-gray-800 dark:text-gray-200 mb-3">
                Mesmo com a venda realizada, os seguintes riscos foram identificados:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Alto risco de cancelamento antes do procedimento</li>
                <li>Possível no-show no dia agendado</li>
                <li>Paciente pode se arrepender da decisão</li>
                <li>Experiência ruim pode gerar avaliações negativas</li>
                <li>Baixa probabilidade de indicações futuras</li>
              </ul>
            </div>
          </Section>

          {/* Correction Strategy for Low Quality Sales */}
          <Section title="Estratégia de Correção Imediata" variant="warning">
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-300 dark:border-orange-800 rounded-lg p-4">
                <h5 className="font-bold text-orange-900 dark:text-orange-100 mb-3">
                  🎯 Ações Imediatas para Salvar Esta Venda
                </h5>
                <p className="text-gray-800 dark:text-gray-200 mb-4">
                  {analysis.lost_sale_details.correction_strategy.immediate_focus.description}
                </p>

                <h6 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Scripts de Follow-up:
                </h6>
                <div className="space-y-3">
                  {analysis.lost_sale_details.correction_strategy.immediate_focus.training_scripts.map((script) => (
                    <div key={script.id} className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 rounded p-3">
                      <h6 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                        {script.script_title}
                      </h6>
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                        {script.script_content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                  📞 Para Próximas Consultas
                </h5>
                <p className="text-gray-800 dark:text-gray-200">
                  {analysis.lost_sale_details.correction_strategy.next_call_focus.description}
                </p>
              </div>
            </div>
          </Section>

          {/* Behavioral Report */}
          <Section title="Relatório Comportamental" variant="warning">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h5 className="font-bold text-red-900 dark:text-red-100 mb-3">
                  ❌ Abordagem Utilizada (Pressão)
                </h5>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {analysis.lost_sale_details.behavioral_report.how_doctor_sold}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h5 className="font-bold text-green-900 dark:text-green-100 mb-3">
                  ✅ Abordagem Ideal (Valor)
                </h5>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {analysis.lost_sale_details.behavioral_report.how_should_sell_to_profile}
                </p>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* Behavioral Profile */}
      <BehavioralProfileCard analysis={analysis.behavioral_profile_analysis} />

      {/* 16-Step Analysis */}
      <Section title="Análise dos 16 Passos da Metodologia">
        {analysis.phases.map((phase) => (
          <div key={phase.id} className="mb-6 last:mb-0">
            <StepAccordion steps={phase.steps} phaseTitle={phase.phase_title} />
          </div>
        ))}
      </Section>

      {/* Critical Observations */}
      {analysis.critical_observations && (
        <Section title="Observações Críticas" variant={isLowQuality ? 'warning' : 'info'}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-3">
                ✅ Pontos de Controle Essenciais
              </h5>
              <div className="space-y-2">
                {analysis.critical_observations.essential_control_points.map((point) => (
                  <div
                    key={point.id}
                    className={`flex items-start gap-2 text-sm p-2 rounded ${
                      point.was_observed
                        ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                        : 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100'
                    }`}
                  >
                    <span className="mt-0.5">
                      {point.was_observed ? '✓' : '✗'}
                    </span>
                    <span>{point.point_description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-3">
                ❌ Checklist de Erros Fatais
              </h5>
              <div className="space-y-2">
                {analysis.critical_observations.fatal_errors.map((error) => (
                  <div
                    key={error.id}
                    className={`flex items-start gap-2 text-sm p-2 rounded ${
                      error.was_observed
                        ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100'
                        : 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                    }`}
                  >
                    <span className="mt-0.5">
                      {error.was_observed ? '⚠️' : '✓'}
                    </span>
                    <span>{error.error_description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Next Steps */}
      <Section title="Próximos Passos" variant={isLowQuality ? 'warning' : 'success'}>
        <div className="space-y-3">
          {isLowQuality ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Imediato:</strong> Enviar follow-up usando os scripts de correção para
                  reforçar o valor e reduzir ansiedade do paciente
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Esta semana:</strong> Revisar e praticar os scripts recomendados 10x
                  antes da próxima consulta
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Próxima consulta:</strong> Aplicar a abordagem correta de construção de
                  valor ao invés de pressão
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-gray-700 dark:text-gray-300">
                  Continuar reforçando os pontos fortes identificados
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <p className="text-gray-700 dark:text-gray-300">
                  Focar nos pontos de melhoria para aumentar ainda mais a taxa de conversão
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <p className="text-gray-700 dark:text-gray-300">
                  Aplicar as recomendações comportamentais para criar experiências ainda mais
                  personalizadas
                </p>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
