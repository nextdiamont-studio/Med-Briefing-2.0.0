// SPIN Qualification Interface - Pre-call strategic briefing display

import { Section } from './Section';
import { ProfileBadge } from './ProfileBadge';
import type { SpinQualificationData } from '@/lib/analysis-types';
import { Target, Brain, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SpinQualificationInterfaceProps {
  qualification: SpinQualificationData;
  patientName: string;
}

export function SpinQualificationInterface({ qualification, patientName }: SpinQualificationInterfaceProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['phase-1']));

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-lg shadow-lg print:bg-purple-700">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8" />
          Briefing Inteligente - Pré-Consulta
        </h1>
        <p className="text-purple-100 text-lg">
          Roadmap estratégico completo para {patientName}
        </p>
        {qualification.patient_age && (
          <p className="text-purple-200 mt-2">
            Idade: {qualification.patient_age} anos
          </p>
        )}
      </div>

      {/* Executive Summary */}
      <Section title="Resumo Executivo" variant="info">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ProfileBadge profile={qualification.executive_summary.profile} size="lg" />
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Preocupação Principal
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {qualification.executive_summary.primary_concern}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                🩹 Dor Principal
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {qualification.executive_summary.primary_pain}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Desejo Principal
              </h5>
              <p className="text-gray-700 dark:text-gray-300">
                {qualification.executive_summary.primary_desire}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Protocolo Recomendado
              </h5>
              <p className="text-gray-800 dark:text-gray-200">
                {qualification.executive_summary.recommended_protocol}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h5 className="font-bold text-green-900 dark:text-green-100 mb-2">
                💰 Investimento Estimado
              </h5>
              <p className="text-gray-800 dark:text-gray-200">
                {qualification.executive_summary.estimated_investment}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Taxa de Conversão Esperada
              </h5>
              <p className="text-gray-800 dark:text-gray-200">
                {qualification.executive_summary.expected_conversion_rate}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h5 className="font-bold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tempo Total Estimado
              </h5>
              <p className="text-gray-800 dark:text-gray-200">
                {qualification.executive_summary.total_consultation_time}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Behavioral Triggers */}
      <Section title="Gatilhos Comportamentais" variant="warning">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
              🔑 Palavras-Chave para Usar
            </h5>
            <div className="flex flex-wrap gap-2">
              {qualification.behavioral_triggers.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-green-900 dark:text-green-100 mb-3">
              💚 Motivações Profundas
            </h5>
            <ul className="space-y-2">
              {qualification.behavioral_triggers.deep_motivations.map((motivation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <span>{motivation}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-red-900 dark:text-red-100 mb-3">
              😰 Medos Prováveis
            </h5>
            <ul className="space-y-2">
              {qualification.behavioral_triggers.probable_fears.map((fear, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                  <span>{fear}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Consultation Goals */}
      <Section title="Objetivos da Consulta" variant="success">
        <div className="grid md:grid-cols-2 gap-3">
          {qualification.consultation_goals.map((goal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-800 dark:text-gray-200">{goal}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Consultation Roadmap */}
      <Section title="Roadmap Detalhado da Consulta">
        <div className="space-y-4">
          {qualification.phases.map((phase) => {
            const phaseId = `phase-${phase.phase_number}`;
            const isExpanded = expandedPhases.has(phaseId);

            return (
              <div key={phase.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePhase(phaseId)}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
                      {phase.phase_number}
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white text-left">
                      {phase.phase_title}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-6 bg-white dark:bg-gray-900 space-y-6">
                    {phase.steps.map((step) => (
                      <div
                        key={step.id}
                        className="border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-800 p-5 rounded"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold text-sm flex-shrink-0">
                            {step.step_number}
                          </span>
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                              {step.step_title}
                            </h5>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">⏱️ Duração:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{step.details.duration}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">🎯 Objetivo:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{step.details.objective}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">🗣️ Tom de Voz:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{step.details.tone_of_voice}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">👁️ Contato Visual:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{step.details.visual_contact}</span>
                              </div>
                              <div className="text-sm md:col-span-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">🧍 Postura:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">{step.details.posture}</span>
                              </div>
                            </div>

                            {/* Script */}
                            <div className="mb-4">
                              <h6 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                                📝 Script Palavra por Palavra
                              </h6>
                              <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded p-4">
                                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                                  {step.details.script}
                                </pre>
                              </div>
                            </div>

                            {/* Mandatory Questions */}
                            {step.details.mandatory_questions && step.details.mandatory_questions.length > 0 && (
                              <div className="mb-4">
                                <h6 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                                  ❓ Perguntas Obrigatórias
                                </h6>
                                <ul className="space-y-2">
                                  {step.details.mandatory_questions.map((question, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                      <span>{question}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Fatal Errors */}
                            <div className="mb-4">
                              <h6 className="font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Erros Fatais a Evitar
                              </h6>
                              <ul className="space-y-2">
                                {step.details.fatal_errors.map((error, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-950 p-2 rounded border-l-4 border-red-500">
                                    <span className="text-red-600 dark:text-red-400 mt-0.5">⚠️</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Validation Checklist */}
                            <div className="mb-4">
                              <h6 className="font-bold text-green-900 dark:text-green-100 mb-2">
                                ✅ Checklist de Validação
                              </h6>
                              <ul className="space-y-2">
                                {step.details.validation_checklist.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-950 p-2 rounded">
                                    <span className="text-green-600 dark:text-green-400 mt-0.5">☐</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Transition Script */}
                            {step.details.transition_script && (
                              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h6 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                                  🔄 Script de Transição
                                </h6>
                                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded p-3">
                                  <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                                    "{step.details.transition_script}"
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Quick Reference Card */}
      <Section title="Cartão de Referência Rápida" variant="info">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6 print:bg-purple-100">
          <h4 className="font-bold text-xl text-purple-900 dark:text-purple-100 mb-4 text-center">
            Lembre-se Durante a Consulta
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">Perfil</div>
              <ProfileBadge profile={qualification.executive_summary.profile} size="md" />
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">Duração Total</div>
              <div className="text-gray-700 dark:text-gray-300">
                {qualification.executive_summary.total_consultation_time}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold text-gray-900 dark:text-white mb-1">Investimento</div>
              <div className="text-gray-700 dark:text-gray-300">
                {qualification.executive_summary.estimated_investment}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
