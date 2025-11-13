// ============================================================================
// VALIDATION SCHEMAS v3.0
// Schemas Zod para validação de respostas da IA
// ============================================================================

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ============================================================================
// SCHEMA: ANÁLISE DE VENDA PERDIDA v3.0
// ============================================================================

export const FrequencyAnalysisSchema = z.object({
  connectionPhase: z.object({
    wasEmotionallyWarm: z.boolean(),
    usedOpenQuestions: z.boolean(),
    estimatedDuration: z.string(),
    rating: z.enum(['Inadequado', 'Superficial', 'Adequado', 'Excelente']),
  }),
  painDiscovery: z.object({
    usedLowFrequency: z.boolean(),
    wasEmpathetic: z.boolean(),
    wentDeep: z.boolean(),
    capturedExactWords: z.boolean(),
    rating: z.enum(['Crítico', 'Superficial', 'Adequado', 'Profundo']),
  }),
  desireExploration: z.object({
    usedHighFrequency: z.boolean(),
    wasEnthusiastic: z.boolean(),
    madePatientDream: z.boolean(),
    rating: z.enum(['Apático', 'Neutro', 'Bom', 'Entusiasmado']),
  }),
});

export const MappingQuestionSchema = z.object({
  asked: z.boolean(),
  score: z.number().min(0).max(10),
  idealScript: z.string(),
});

export const MappingAnalysisSchema = z.object({
  question1_Pains: MappingQuestionSchema.extend({
    wentDeep: z.boolean(),
    capturedEmotionalPhrases: z.boolean(),
    usedCorrectFrequency: z.boolean(),
    exactMoment: z.string().optional(),
  }),
  question2_Desires: MappingQuestionSchema.extend({
    madePatientVisualize: z.boolean(),
    usedCorrectFrequency: z.boolean(),
  }),
  question3_Awareness: MappingQuestionSchema.extend({
    identifiedPatientType: z.enum(['Analítico', 'Aberto', 'Influenciado', 'Não identificou']),
    adaptedApproach: z.boolean(),
  }),
  question4_History: MappingQuestionSchema.extend({
    discoveredHiddenObjections: z.boolean(),
    tookNotes: z.boolean(),
  }),
  question5_Fears: MappingQuestionSchema.extend({
    letPatientExpressFears: z.boolean(),
  }),
  overallMappingScore: z.number().min(0).max(50),
});

export const DirectioningAnalysisSchema = z.object({
  usedIndividualization: z.boolean(),
  usedExactPatientsWords: z.boolean(),
  educatedAboutTreatment: z.boolean(),
  usedPracticalExample: z.boolean(),
  showedBeforeAfter: z.boolean(),
  toldEmotionalStories: z.boolean(),
  brokeObjectionsBeforePrice: z.boolean(),
  plantedReturnSeeds: z.boolean(),
  score: z.number().min(0).max(60),
});

export const ClosingAnalysisSchema = z.object({
  usedCorrectPriceStructure: z.boolean(),
  madeClosingQuestion: z.boolean(),
  shutUpAfterAsking: z.boolean(),
  returnedObjectionsWithQuestions: z.boolean(),
  gaveDiscountEasily: z.boolean(),
  score: z.number().min(0).max(10),
});

export const RecurrenceAnalysisSchema = z.object({
  plantedSeeds: z.boolean(),
  attemptedScheduling: z.boolean(),
  score: z.number().min(0).max(10),
});

export const BehavioralProfileAnalysisSchema = z.object({
  detectedProfile: z.enum(['Dominante', 'Influente', 'Estável', 'Analítico', 'Misto', 'Não detectado']),
  profileIndicators: z.array(z.string()),
  confidence: z.number().min(0).max(10),
  doctorAdapted: z.boolean(),
  adaptationAnalysis: z.string(),
  fatalMismatch: z.string().optional(),
  howToSellToThisProfile: z.object({
    dos: z.array(z.string()),
    donts: z.array(z.string()),
    exampleScript: z.string(),
  }),
});

export const CriticalErrorSchema = z.object({
  errorName: z.string(),
  stepNumber: z.number().min(1).max(15),
  stepName: z.string(),
  severity: z.enum(['Fatal', 'Grave', 'Moderada']),
  whyItWasFatal: z.string(),
  whatWasSaid: z.string(),
  whatShouldHaveBeenSaid: z.string(),
  crucialDifference: z.string(),
});

export const DominoEffectSchema = z.object({
  sequence: z.array(z.string()),
  narrativeExplanation: z.string(),
});

export const CorrectionStrategySchema = z.object({
  immediatePriority: z.object({
    topCriticalSteps: z.array(z.number()),
    reasonWhy: z.string(),
  }),
  trainingScripts: z.array(z.object({
    stepNumber: z.number(),
    stepName: z.string(),
    scriptTitle: z.string(),
    fullScript: z.string(),
    practiceInstructions: z.string(),
  })),
  nextConsultationFocus: z.array(z.string()),
  lifeboatScript: z.object({
    situation: z.string(),
    script: z.string(),
  }),
});

export const PhaseAnalysisSchema = z.object({
  stepNumber: z.number().min(1).max(15),
  stepName: z.string(),
  score: z.number().min(0).max(10),
  rating: z.enum(['Crítico', 'Insuficiente', 'Regular', 'Bom', 'Excelente']),
  whatHappened: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  impact: z.string(),
  coachingNote: z.string().optional(),
});

export const LostSaleResponseSchemaV3 = z.object({
  frameworkVersion: z.literal('3.0'),
  overallPerformance: z.object({
    score: z.number().min(0).max(150),
    rating: z.enum(['Crítico', 'Insuficiente', 'Regular', 'Bom', 'Excelente']),
    mainConclusion: z.string(),
  }),
  rootCause: z.string(),
  criticalErrors: z.array(CriticalErrorSchema),
  frequencyAnalysis: FrequencyAnalysisSchema,
  mappingAnalysis: MappingAnalysisSchema,
  directioningAnalysis: DirectioningAnalysisSchema,
  closingAnalysis: ClosingAnalysisSchema,
  recurrenceAnalysis: RecurrenceAnalysisSchema,
  behavioralProfileAnalysis: BehavioralProfileAnalysisSchema,
  dominoEffect: DominoEffectSchema,
  correctionStrategy: CorrectionStrategySchema,
  phaseByPhaseAnalysis: z.array(PhaseAnalysisSchema).length(15),
});

// ============================================================================
// SCHEMA: ANÁLISE DE VENDA REALIZADA v3.0 (BAIXA QUALIDADE)
// ============================================================================

export const LowQualitySaleSchemaV3 = z.object({
  frameworkVersion: z.literal('3.0'),
  qualityAssessment: z.object({
    isHighQuality: z.literal(false),
    qualityLevel: z.literal('Baixa - Venda Forçada'),
    riskScore: z.number().min(0).max(10),
    mainConcern: z.string(),
    cancellationRisk: z.enum(['Baixo', 'Médio', 'Alto', 'Crítico']),
    refundRisk: z.enum(['Baixo', 'Médio', 'Alto', 'Crítico']),
  }),
  whySaleHappened: z.object({
    pressureTacticsUsed: z.array(z.string()),
    patientResignationIndicators: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  exactMomentAnalysis: z.object({
    closingPhrase: z.string(),
    toneAnalysis: z.string(),
    hesitationSignals: z.array(z.string()),
    missingEnthusiasm: z.string(),
  }),
  whatWentWrong: z.object({
    skippedSteps: z.array(z.number()),
    superficialMapping: z.boolean(),
    didNotUseExactWords: z.boolean(),
    rushedToPrice: z.boolean(),
    gaveDiscountEasily: z.boolean(),
  }),
  improvementPlan: z.object({
    criticalChanges: z.array(z.string()),
    followUpStrategy: z.string(),
    nextConsultationFocus: z.array(z.string()),
  }),
  overallPerformance: z.object({
    score: z.number().min(0).max(150),
    rating: z.string(),
    mainConclusion: z.string(),
  }),
  phaseByPhaseAnalysis: z.array(z.object({
    stepNumber: z.number().min(1).max(15),
    stepName: z.string(),
    score: z.number().min(0).max(10),
    rating: z.string(),
    improvements: z.array(z.string()),
  })).length(15),
});

// ============================================================================
// SCHEMA: ANÁLISE DE VENDA REALIZADA v3.0 (ALTA QUALIDADE)
// ============================================================================

export const HighQualitySaleSchemaV3 = z.object({
  frameworkVersion: z.literal('3.0'),
  qualityAssessment: z.object({
    isHighQuality: z.literal(true),
    qualityLevel: z.literal('Alta - Venda Natural'),
    strengthScore: z.number().min(0).max(10),
    mainSuccess: z.string(),
  }),
  successFactors: z.array(z.string()),
  excellentMoments: z.array(z.object({
    stepNumber: z.number(),
    stepName: z.string(),
    whatHappenedRight: z.string(),
    impact: z.string(),
    replicateScript: z.string(),
  })),
  patientEnthusiasmAnalysis: z.object({
    closingPhrase: z.string(),
    enthusiasmIndicators: z.array(z.string()),
    emotionalBuyIn: z.string(),
  }),
  whatWasWellExecuted: z.object({
    deepMapping: z.boolean(),
    usedExactWords: z.boolean(),
    brokeObjectionsEarly: z.boolean(),
    naturalClosing: z.boolean(),
    adaptedToBehavioralProfile: z.boolean(),
  }),
  replicationStrategy: z.object({
    keyScripts: z.array(z.object({
      stepNumber: z.number(),
      scriptTitle: z.string(),
      script: z.string(),
    })),
    bestPractices: z.array(z.string()),
  }),
  overallPerformance: z.object({
    score: z.number().min(0).max(150),
    rating: z.enum(['Excelente', 'Muito Bom']),
    mainConclusion: z.string(),
  }),
  phaseByPhaseAnalysis: z.array(z.object({
    stepNumber: z.number().min(1).max(15),
    stepName: z.string(),
    score: z.number().min(0).max(10),
    rating: z.string(),
    strengths: z.array(z.string()),
    minorImprovements: z.array(z.string()).optional(),
  })).length(15),
});

// ============================================================================
// SCHEMA UNIÃO: VENDA REALIZADA (ALTA OU BAIXA)
// ============================================================================

export const CompletedSaleResponseSchemaV3 = z.union([
  LowQualitySaleSchemaV3,
  HighQualitySaleSchemaV3,
]);

// ============================================================================
// FUNÇÃO DE VALIDAÇÃO
// ============================================================================

export function validateAnalysisResponse(data: unknown, schema: z.ZodSchema) {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: {
          name: 'ValidationError',
          message: 'Resposta da IA não está no formato esperado',
          issues: error.issues,
        },
      };
    }
    return {
      success: false,
      data: null,
      error: {
        name: 'UnknownError',
        message: String(error),
        issues: [],
      },
    };
  }
}

// Exports
export {
  LostSaleResponseSchemaV3 as LostSaleResponseSchema,
  CompletedSaleResponseSchemaV3 as CompletedSaleResponseSchema,
};
