// Behavioral Profile Card Component - Displays complete behavioral profile analysis

import { Section } from './Section';
import { ProfileBadge } from './ProfileBadge';
import type { PerformanceAnalysisData } from '@/lib/analysis-types';

interface BehavioralProfileCardProps {
  analysis: PerformanceAnalysisData['behavioral_profile_analysis'];
}

export function BehavioralProfileCard({ analysis }: BehavioralProfileCardProps) {
  return (
    <Section title="Perfil Comportamental do Paciente" variant="info">
      <div className="space-y-4">
        {/* Profile badge */}
        <div className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Perfil Identificado:
          </span>
          <ProfileBadge profile={analysis.profile} size="lg" />
        </div>

        {/* Justification */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            📋 Justificativa
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.justification}
          </p>
        </div>

        {/* Doctor adaptation analysis */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            🎭 Análise de Adaptação do Médico
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.doctor_adaptation_analysis}
          </p>
        </div>

        {/* Communication recommendations */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            💡 Recomendações de Comunicação
          </h4>

          {/* Recommended phrases */}
          {analysis.communication_recommendations.phrases.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">
                ✅ Frases recomendadas
              </h5>
              <div className="space-y-2">
                {analysis.communication_recommendations.phrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-3"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                      "{phrase}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {analysis.communication_recommendations.keywords.length > 0 && (
            <div>
              <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                🔑 Palavras-chave para usar
              </h5>
              <div className="flex flex-wrap gap-2">
                {analysis.communication_recommendations.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Playbook insights (if available) */}
        {analysis.playbook_insights && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              📖 Playbook do Perfil
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Characteristics */}
              {analysis.playbook_insights.characteristics.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Características
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.playbook_insights.characteristics.map((char, idx) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fears */}
              {analysis.playbook_insights.fears.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medos
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.playbook_insights.fears.map((fear, idx) => (
                      <li key={idx}>{fear}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Motivations */}
              {analysis.playbook_insights.motivations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivações
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.playbook_insights.motivations.map((mot, idx) => (
                      <li key={idx}>{mot}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Selling strategies */}
              {analysis.playbook_insights.selling_strategies.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estratégias de Venda
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {analysis.playbook_insights.selling_strategies.map((strat, idx) => (
                      <li key={idx}>{strat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
