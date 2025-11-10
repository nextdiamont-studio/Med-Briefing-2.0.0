// Step Accordion Component - Collapsible step analysis viewer

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisStep } from '@/lib/analysis-types';
import { ScoreDisplay } from './ScoreDisplay';

interface StepAccordionProps {
  steps: AnalysisStep[];
  phaseTitle?: string;
}

export function StepAccordion({ steps, phaseTitle }: StepAccordionProps) {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setOpenSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      {phaseTitle && (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {phaseTitle}
        </h4>
      )}

      {steps.map((step) => {
        const isOpen = openSteps.has(step.id);

        return (
          <div
            key={step.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleStep(step.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-sm">
                  {step.step_number}
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-left">
                  {step.step_title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step.score}
                  <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="p-6 bg-white dark:bg-gray-900 space-y-6">
                {/* Score display */}
                <ScoreDisplay
                  score={step.score}
                  maxScore={10}
                  rating={step.rating}
                  label="Performance neste passo"
                  size="sm"
                />

                {/* What did well */}
                {step.what_did_well.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                      ✅ O que foi feito bem
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {step.what_did_well.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement points */}
                {step.improvement_points.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      🔄 Pontos de melhoria
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {step.improvement_points.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Coaching narrative */}
                {step.coaching_narrative && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h5 className="font-semibold text-purple-700 dark:text-purple-400 mb-3">
                      💬 Narrativa de Coaching
                    </h5>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* What was said */}
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h6 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                          ❌ O que foi dito
                        </h6>
                        <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                          "{step.coaching_narrative.what_was_said}"
                        </p>
                      </div>

                      {/* What should have been said */}
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h6 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                          ✅ O que deveria ter sido dito
                        </h6>
                        <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                          "{step.coaching_narrative.what_should_have_been_said}"
                        </p>
                      </div>
                    </div>

                    {/* Crucial differences */}
                    {step.coaching_narrative.crucial_differences.length > 0 && (
                      <div className="mt-4">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          🔍 Diferenças cruciais
                        </h6>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          {step.coaching_narrative.crucial_differences.map((diff, idx) => (
                            <li key={idx}>{diff}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
