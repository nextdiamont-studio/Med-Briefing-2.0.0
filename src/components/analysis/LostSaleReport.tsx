// Lost Sale Report Component - Comprehensive analysis for lost/low-quality sales

import { Section } from './Section';
import { ScoreDisplay } from './ScoreDisplay';
import { StepAccordion } from './StepAccordion';
import { BehavioralProfileCard } from './BehavioralProfileCard';
import type { PerformanceAnalysisData } from '@/lib/analysis-types';
import { AlertTriangle, TrendingDown, Target, BookOpen, CheckCircle } from 'lucide-react';

interface LostSaleReportProps {
  analysis: PerformanceAnalysisData;
}

export function LostSaleReport({ analysis }: LostSaleReportProps) {
  const lostSale = analysis.lost_sale_details;

  if (!lostSale) {
    return (
      <div className="text-center p-8 text-gray-500">
        Dados de venda perdida não disponíveis
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-lg shadow-lg print:bg-red-700">
        <h1 className="text-3xl font-bold mb-2">
          Análise de Venda Perdida {analysis.is_low_quality_sale && '(Venda de Baixa Qualidade)'}
        </h1>
        <p className="text-red-100">
          Diagnóstico completo com estratégias de correção imediata
        </p>
      </div>

      {/* Overall Performance */}
      <Section title="Performance Geral" variant="warning">
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

      {/* Error Pattern */}
      <Section title="Padrão de Erros" variant="danger">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {lostSale.error_pattern.excellent}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Passos Excelentes
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {lostSale.error_pattern.good}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Passos Bons
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {lostSale.error_pattern.deficient}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Passos Deficientes
            </div>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {lostSale.error_pattern.critical}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Passos Críticos
            </div>
          </div>
        </div>
      </Section>

      {/* Critical Errors */}
      <Section title="Erros Críticos (Mais Fatais)" variant="danger">
        <div className="space-y-4">
          {lostSale.critical_errors.map((error) => (
            <div
              key={error.id}
              className="border-l-4 border-red-500 bg-red-50 dark:bg-red-950 p-4 rounded"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 dark:text-red-100 text-lg mb-2">
                    #{error.error_order} - {error.error_title}
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-red-800 dark:text-red-200">
                        O que aconteceu:
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {error.what_happened}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-red-800 dark:text-red-200">
                        Por que é crítico:
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        {error.why_critical}
                      </p>
                    </div>

                    <div className="border-t border-red-200 dark:border-red-800 pt-3">
                      <span className="font-semibold text-red-800 dark:text-red-200">
                        💬 Narrativa de Coaching:
                      </span>
                      <p className="text-gray-800 dark:text-gray-200 mt-1 italic">
                        {error.coaching_narrative}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Domino Effect & Root Cause */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Efeito Dominó" variant="warning">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {lostSale.domino_effect}
            </p>
          </div>
        </Section>

        <Section title="Momento Exato da Perda" variant="danger">
          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {lostSale.exact_moment}
            </p>
          </div>
        </Section>
      </div>

      <Section title="Causa Raiz" variant="danger">
        <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
          {lostSale.root_cause}
        </p>
      </Section>

      {/* Correction Strategy */}
      <Section title="Estratégia de Correção" variant="info">
        <div className="space-y-6">
          {/* Immediate Focus */}
          <div>
            <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
              🎯 Foco Imediato
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {lostSale.correction_strategy.immediate_focus.description}
            </p>

            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
              Scripts de Treinamento:
            </h5>
            <div className="space-y-3">
              {lostSale.correction_strategy.immediate_focus.training_scripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                >
                  <h6 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                    {script.script_title}
                  </h6>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-white dark:bg-gray-900 p-3 rounded">
                    {script.script_content}
                  </pre>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 font-semibold">
                    ⚡ Recomendação: Pratique {script.practice_recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Call Focus */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">
              📞 Foco na Próxima Chamada
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {lostSale.correction_strategy.next_call_focus.description}
            </p>

            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
              Scripts de Treinamento:
            </h5>
            <div className="space-y-3">
              {lostSale.correction_strategy.next_call_focus.training_scripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <h6 className="font-bold text-green-900 dark:text-green-100 mb-2">
                    {script.script_title}
                  </h6>
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-white dark:bg-gray-900 p-3 rounded">
                    {script.script_content}
                  </pre>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-2 font-semibold">
                    ⚡ Recomendação: Pratique {script.practice_recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lifesaver Script */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">
              🆘 Script Salva-Vidas
            </h4>
            <div className="bg-purple-50 dark:bg-purple-950 border-2 border-purple-300 dark:border-purple-800 rounded-lg p-4">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                {lostSale.correction_strategy.lifesaver_script}
              </pre>
            </div>
          </div>
        </div>
      </Section>

      {/* Behavioral Report */}
      <Section title="Relatório Comportamental" variant="warning">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h5 className="font-bold text-red-900 dark:text-red-100 mb-3">
              ❌ Como o médico vendeu (ERRADO)
            </h5>
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
              {lostSale.behavioral_report.how_doctor_sold}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h5 className="font-bold text-green-900 dark:text-green-100 mb-3">
              ✅ Como vender para este perfil (CERTO)
            </h5>
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
              {lostSale.behavioral_report.how_should_sell_to_profile}
            </p>
          </div>
        </div>
      </Section>

      {/* Behavioral Profile */}
      <BehavioralProfileCard analysis={analysis.behavioral_profile_analysis} />

      {/* Identified Strengths */}
      {lostSale.identified_strengths.length > 0 && (
        <Section title="Pontos Fortes Identificados" variant="success">
          <div className="space-y-4">
            {lostSale.identified_strengths.map((strength) => (
              <div
                key={strength.id}
                className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950 p-4 rounded"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">
                      {strength.strength_title}
                    </h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                      <span className="font-semibold">Evidência:</span> {strength.evidence}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Como aproveitar:</span>{' '}
                      {strength.how_to_leverage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Errors for Correction */}
      {lostSale.errors_for_correction.length > 0 && (
        <Section title="Erros para Correção" variant="warning">
          <div className="space-y-3">
            {lostSale.errors_for_correction.map((error) => (
              <div
                key={error.id}
                className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4"
              >
                <h5 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {error.error_title}
                </h5>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-orange-800 dark:text-orange-200">
                      O que fez:
                    </span>{' '}
                    {error.what_did}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-orange-800 dark:text-orange-200">
                      Impacto:
                    </span>{' '}
                    {error.impact}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      Correção:
                    </span>{' '}
                    {error.correction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Final Coaching Plan */}
      <Section title="Plano de Coaching Final" variant="info">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Pré-Chamada
            </h5>
            <ul className="space-y-2">
              {lostSale.final_coaching_plan.pre_call_checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Durante a Chamada
            </h5>
            <ul className="space-y-2">
              {lostSale.final_coaching_plan.during_call_checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Pós-Chamada
            </h5>
            <ul className="space-y-2">
              {lostSale.final_coaching_plan.post_call_checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

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
        <Section title="Observações Críticas" variant="warning">
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
    </div>
  );
}
