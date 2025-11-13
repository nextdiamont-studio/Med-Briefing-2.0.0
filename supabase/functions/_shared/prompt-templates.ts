// ============================================================================
// PROMPT TEMPLATES MANAGER
// Sistema centralizado de templates de prompts com versionamento
// ============================================================================

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ============================================================================
// TIPOS E SCHEMAS
// ============================================================================

export const AnalysisFrameworkSchema = z.object({
  version: z.string(),
  methodology: z.string(),
  steps: z.array(z.object({
    number: z.number(),
    name: z.string(),
    description: z.string(),
    maxScore: z.number(),
  })),
});

export type AnalysisFramework = z.infer<typeof AnalysisFrameworkSchema>;

// ============================================================================
// FRAMEWORK DE 16 ETAPAS (OFICIAL)
// ============================================================================

export const OFFICIAL_16_STEP_FRAMEWORK: AnalysisFramework = {
  version: '2.0',
  methodology: 'Vendas Consultivas em Medicina Estética',
  steps: [
    {
      number: 1,
      name: 'Conexão Genuína (Rapport Emocional)',
      description: 'Estabelecer confiança e conexão emocional autêntica com o paciente',
      maxScore: 10,
    },
    {
      number: 2,
      name: 'Quebra de Resistência Inicial',
      description: 'Reduzir barreiras e criar ambiente de abertura',
      maxScore: 10,
    },
    {
      number: 3,
      name: 'Investigação de Dores Emocionais (SPIN Selling)',
      description: 'Descobrir as dores emocionais profundas usando metodologia SPIN',
      maxScore: 10,
    },
    {
      number: 4,
      name: 'Amplificação da Dor (Criação de Urgência)',
      description: 'Tornar a dor consciente e criar senso de urgência genuíno',
      maxScore: 10,
    },
    {
      number: 5,
      name: 'Apresentação do Futuro Ideal',
      description: 'Pintar visão clara do resultado desejado',
      maxScore: 10,
    },
    {
      number: 6,
      name: 'Diagnóstico Visual Profissional',
      description: 'Realizar avaliação técnica e visual da condição',
      maxScore: 10,
    },
    {
      number: 7,
      name: 'Educação sobre Causas (Authority Building)',
      description: 'Explicar causas do problema estabelecendo autoridade',
      maxScore: 10,
    },
    {
      number: 8,
      name: 'Introdução de Soluções (Protocolo)',
      description: 'Apresentar soluções técnicas adequadas',
      maxScore: 10,
    },
    {
      number: 9,
      name: 'Explicação Técnica Detalhada',
      description: 'Detalhar procedimentos e tecnologias',
      maxScore: 10,
    },
    {
      number: 10,
      name: 'Demonstração de Resultados (Provas)',
      description: 'Mostrar casos de sucesso e resultados reais',
      maxScore: 10,
    },
    {
      number: 11,
      name: 'Ancoragem de Valor',
      description: 'Estabelecer percepção de valor antes do preço',
      maxScore: 10,
    },
    {
      number: 12,
      name: 'Apresentação de Investimento',
      description: 'Apresentar preço de forma estratégica',
      maxScore: 10,
    },
    {
      number: 13,
      name: 'Quebra de Objeções Antecipadas',
      description: 'Antecipar e neutralizar objeções comuns',
      maxScore: 10,
    },
    {
      number: 14,
      name: 'Criação de Escassez',
      description: 'Criar escassez genuína (não artificial)',
      maxScore: 10,
    },
    {
      number: 15,
      name: 'Facilitação de Decisão',
      description: 'Facilitar processo de tomada de decisão',
      maxScore: 10,
    },
    {
      number: 16,
      name: 'Fechamento Assumido',
      description: 'Fechar assumindo que a decisão foi tomada',
      maxScore: 10,
    },
  ],
};

// ============================================================================
// PERFIS COMPORTAMENTAIS (DISC)
// ============================================================================

export const BEHAVIORAL_PROFILES = {
  DOMINANT: {
    name: 'Dominante',
    characteristics: [
      'Direto e objetivo',
      'Foca em resultados',
      'Toma decisões rápidas',
      'Valoriza eficiência',
    ],
    keywords: ['resultado', 'rápido', 'objetivo', 'eficiente', 'prático'],
    sellingSttrategy: 'Seja direto, mostre resultados rápidos, evite enrolação',
  },
  INFLUENTIAL: {
    name: 'Influente',
    characteristics: [
      'Sociável e expressivo',
      'Valoriza relacionamentos',
      'Busca aprovação social',
      'Entusiasmado',
    ],
    keywords: ['pessoas', 'social', 'opinião', 'tendência', 'experiência'],
    sellingSttrategy: 'Use prova social, mostre transformações visuais, crie entusiasmo',
  },
  STEADY: {
    name: 'Estável',
    characteristics: [
      'Paciente e leal',
      'Busca segurança',
      'Avesso a riscos',
      'Precisa de garantias',
    ],
    keywords: ['segurança', 'garantia', 'confiável', 'tempo', 'cuidado'],
    sellingSttrategy: 'Transmita segurança, forneça garantias, não pressione',
  },
  ANALYTICAL: {
    name: 'Analítico',
    characteristics: [
      'Meticuloso e detalhista',
      'Busca informações técnicas',
      'Toma decisões baseadas em dados',
      'Questiona e investiga',
    ],
    keywords: ['técnica', 'estudo', 'comprovado', 'detalhes', 'dados'],
    sellingSttrategy: 'Forneça dados técnicos, estudos científicos, detalhes',
  },
};

// ============================================================================
// TEMPLATE: ANÁLISE DE VENDA PERDIDA
// ============================================================================

export function generateLostSalePrompt(params: {
  patientName: string;
  duration?: string;
  transcription: string;
}): string {
  const stepsDescription = OFFICIAL_16_STEP_FRAMEWORK.steps
    .map((step) => `${step.number}. ${step.name} - ${step.description}`)
    .join('\n');

  return `Você é um coach especialista em análise de performance de vendas consultivas para medicina estética.
Sua análise DEVE seguir RIGOROSAMENTE o framework oficial de 16 etapas da metodologia.

# CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Resultado: VENDA PERDIDA ⚠️

# TRANSCRIÇÃO DA CONSULTA
${params.transcription}

# METODOLOGIA OFICIAL (Framework v${OFFICIAL_16_STEP_FRAMEWORK.version})
${OFFICIAL_16_STEP_FRAMEWORK.methodology}

## 16 ETAPAS OBRIGATÓRIAS PARA AVALIAÇÃO
${stepsDescription}

Cada etapa vale de 0 a 10 pontos. Score total máximo: 160 pontos.

# TAREFA CRÍTICA
Analise a transcrição e gere um diagnóstico COMPLETO seguindo EXATAMENTE esta estrutura JSON:

\`\`\`json
{
  "frameworkVersion": "${OFFICIAL_16_STEP_FRAMEWORK.version}",
  "overallPerformance": {
    "score": 0-160,
    "rating": "Crítico|Precisa Melhorar|Moderado|Bom|Excelente",
    "mainConclusion": "Conclusão principal em 1-2 frases"
  },
  "errorPattern": {
    "critical": 0,
    "needsImprovement": 0,
    "good": 0,
    "excellent": 0
  },
  "criticalErrors": [
    {
      "errorName": "Nome do erro crítico",
      "stepNumber": 1-16,
      "whyItWasFatal": "Explicação do impacto na perda da venda",
      "coachingNarrative": {
        "whatWasSaid": "Trecho EXATO da transcrição mostrando o erro",
        "whatShouldHaveBeenSaid": "Script ideal palavra por palavra para aquela situação",
        "crucialDifference": "Por que a diferença foi crítica"
      }
    }
  ],
  "dominoEffect": {
    "sequence": ["Erro inicial → Consequência 1 → Consequência 2 → Perda da venda"],
    "explanation": "Narrativa explicando a cascata de falhas (2-3 parágrafos)"
  },
  "rootCause": "A causa raiz FUNDAMENTAL da perda (1 frase direta)",
  "behavioralProfileAnalysis": {
    "detectedProfile": "Dominante|Influente|Estável|Analítico|Não Identificado",
    "profileIndicators": ["Indicador 1 da transcrição", "Indicador 2"],
    "profileConfidence": 0-10,
    "doctorAdaptationAnalysis": "Análise crítica: médico alinhou ou desalinhou com o perfil?",
    "howToSellToProfile": {
      "whatToSay": ["Frase ideal 1", "Frase ideal 2", "Frase ideal 3"],
      "whatNotToSay": ["Frase que afasta 1", "Frase que afasta 2"],
      "exampleScript": "Script completo de 30-60 segundos adaptado ao perfil"
    }
  },
  "correctionStrategy": {
    "immediateFocus": {
      "topCriticalSteps": [3, 11, 12],
      "trainingScripts": [
        {
          "stepNumber": 3,
          "scriptTitle": "Como fazer SPIN selling correto",
          "script": "Script palavra por palavra para treinar"
        }
      ]
    },
    "nextConsultationFocus": ["Etapa X", "Etapa Y"],
    "lifeboatScript": "Script de último recurso para objeções difíceis (2-3 frases)"
  },
  "phaseAnalysis": [
    {
      "stepNumber": 1,
      "stepName": "${OFFICIAL_16_STEP_FRAMEWORK.steps[0].name}",
      "score": 0-10,
      "rating": "Crítico|Precisa Melhorar|Moderado|Bom|Excelente",
      "strengths": ["Ponto forte identificado na transcrição"],
      "improvements": ["Ponto de melhoria específico"],
      "coachingNote": "Nota de coaching personalizada (opcional)"
    }
  ]
}
\`\`\`

# INSTRUÇÕES CRÍTICAS
1. Retorne APENAS o JSON válido, sem texto antes ou depois
2. Avalie TODAS as 16 etapas obrigatoriamente (phaseAnalysis deve ter 16 items)
3. Use o nome do paciente (${params.patientName}) nas sugestões de script
4. Seja BRUTALMENTE HONESTO nas críticas
5. Forneça coaching ACIONÁVEL, não teoria genérica
6. Cite TRECHOS EXATOS da transcrição como evidência

Retorne APENAS o JSON, sem markdown code blocks.`;
}

// ============================================================================
// TEMPLATE: ANÁLISE DE VENDA REALIZADA
// ============================================================================

export function generateCompletedSalePrompt(params: {
  patientName: string;
  duration?: string;
  protocolSold?: string;
  saleValue?: number;
  transcription: string;
}): string {
  const stepsDescription = OFFICIAL_16_STEP_FRAMEWORK.steps
    .map((step) => `${step.number}. ${step.name}`)
    .join('\n');

  return `Você é um coach especialista em análise de QUALIDADE de vendas consultivas para medicina estética.
Sua tarefa é avaliar se a venda foi de ALTA ou BAIXA qualidade.

# CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Resultado: VENDA REALIZADA ✅
- Protocolo vendido: ${params.protocolSold || 'Não informado'}
- Valor: R$ ${params.saleValue || 'Não informado'}

# TRANSCRIÇÃO DA CONSULTA
${params.transcription}

# METODOLOGIA OFICIAL (Framework v${OFFICIAL_16_STEP_FRAMEWORK.version})
${stepsDescription}

# INDICADORES DE BAIXA QUALIDADE (VENDA FORÇADA)
- ⚠️ Linguagem hesitante do paciente ao aceitar
- ⚠️ Múltiplos descontos oferecidos (sinal de pressão)
- ⚠️ Uso excessivo de urgência/escassez artificial
- ⚠️ Falta de exploração de dores emocionais (etapas 3-4)
- ⚠️ Decisão rápida sem construção de valor

# INDICADORES DE ALTA QUALIDADE (VENDA NATURAL)
- ✅ Linguagem confiante e entusiasmada do paciente
- ✅ Construção sólida de valor antes do preço (etapas 5-11)
- ✅ Rapport genuíno estabelecido (etapa 1)
- ✅ Fechamento natural sem objeções (etapa 16)
- ✅ Paciente convencido emocionalmente

# TAREFA
Primeiro, DETERMINE se a venda foi de baixa ou alta qualidade.
Depois, gere o JSON apropriado:

## SE BAIXA QUALIDADE (VENDA FORÇADA):
\`\`\`json
{
  "frameworkVersion": "${OFFICIAL_16_STEP_FRAMEWORK.version}",
  "qualityAssessment": {
    "isLowQuality": true,
    "qualityLevel": "Baixa",
    "riskScore": 0-10,
    "mainConcern": "Preocupação principal com esta venda"
  },
  "whySaleHappened": {
    "pressureTacticsUsed": ["Tática de pressão 1", "Tática 2"],
    "risks": [
      "Risco de cancelamento",
      "Risco de arrependimento",
      "Risco de reclamação"
    ]
  },
  "exactMomentAnalysis": {
    "closingPhrase": "Frase EXATA do paciente ao aceitar",
    "toneAnalysis": "Análise do tom (resignação vs entusiasmo)",
    "whatWasSaid": "O que foi dito que indica hesitação",
    "whatWasNotSaid": "Sinais de entusiasmo que faltaram"
  },
  "overallPerformance": {
    "score": 0-160,
    "rating": "string",
    "mainConclusion": "Conclusão sobre a qualidade da venda"
  },
  "phaseAnalysis": [
    {
      "stepNumber": 1,
      "stepName": "${OFFICIAL_16_STEP_FRAMEWORK.steps[0].name}",
      "score": 0-10,
      "rating": "string",
      "improvements": ["O que poderia ter sido melhor"]
    }
  ]
}
\`\`\`

## SE ALTA QUALIDADE (VENDA GENUÍNA):
\`\`\`json
{
  "frameworkVersion": "${OFFICIAL_16_STEP_FRAMEWORK.version}",
  "qualityAssessment": {
    "isLowQuality": false,
    "qualityLevel": "Alta",
    "strengthScore": 0-10,
    "mainSuccess": "Fator de sucesso principal"
  },
  "successFactors": [
    "Fator 1 que levou ao sucesso",
    "Fator 2",
    "Fator 3"
  ],
  "highlightMoments": [
    {
      "moment": "Descrição do momento decisivo",
      "quote": "Citação EXATA da transcrição",
      "impact": "Por que este momento foi crucial",
      "stepNumber": 1-16
    }
  ],
  "topPerformingSteps": [
    {
      "stepNumber": 1,
      "stepName": "${OFFICIAL_16_STEP_FRAMEWORK.steps[0].name}",
      "score": 9-10,
      "whyItWorked": "Explicação do sucesso",
      "replicate": "Como replicar em outras consultas"
    }
  ],
  "minorImprovements": ["Pequeno ajuste 1", "Pequeno ajuste 2"],
  "celebration": "Mensagem positiva e motivadora de parabéns"
}
\`\`\`

Retorne APENAS o JSON válido, sem markdown.`;
}

// ============================================================================
// TEMPLATE: BRIEFING SPIN PRÉ-CONSULTA
// ============================================================================

export function generateSpinBriefingPrompt(params: {
  patientName: string;
  patientAge?: string;
  patientConcern: string;
  patientPainPoints?: string;
  patientDesires?: string;
  behavioralTriggers?: string;
}): string {
  const stepsDescription = OFFICIAL_16_STEP_FRAMEWORK.steps
    .map((step) => `${step.number}. ${step.name}`)
    .join('\n');

  return `Você é um especialista em vendas consultivas para medicina estética.

# TAREFA: GERAR BRIEFING INTELIGENTE PRÉ-CONSULTA (SPIN QUALIFICATION)

Crie um roadmap estratégico completo usando o framework oficial de 16 etapas.

## DADOS DO PACIENTE
- **Nome:** ${params.patientName}
${params.patientAge ? `- **Idade:** ${params.patientAge} anos` : ''}
- **Preocupação Principal:** ${params.patientConcern}
${params.patientPainPoints ? `- **Dores/Problemas:** ${params.patientPainPoints}` : ''}
${params.patientDesires ? `- **Desejos/Objetivos:** ${params.patientDesires}` : ''}
${params.behavioralTriggers ? `- **Gatilhos Comportamentais:** ${params.behavioralTriggers}` : ''}

## METODOLOGIA OFICIAL (Framework v${OFFICIAL_16_STEP_FRAMEWORK.version})
${stepsDescription}

# ESTRUTURA JSON OBRIGATÓRIA

\`\`\`json
{
  "frameworkVersion": "${OFFICIAL_16_STEP_FRAMEWORK.version}",
  "executive_summary": {
    "primary_concern": "Preocupação principal identificada",
    "primary_pain": "Dor emocional principal",
    "primary_desire": "Desejo principal",
    "recommended_protocol": "Protocolo recomendado",
    "estimated_investment": "R$ X.XXX - R$ X.XXX",
    "expected_conversion_rate": "Alta|Média|Baixa",
    "total_consultation_time": "X minutos"
  },
  "behavioral_profile": {
    "predicted_profile": "Dominante|Influente|Estável|Analítico",
    "confidence": 0-10,
    "reasoning": "Por que este perfil foi identificado",
    "keywords": ["palavra-chave 1", "palavra-chave 2"],
    "deep_motivations": ["motivação 1", "motivação 2"],
    "probable_fears": ["medo 1", "medo 2"]
  },
  "consultation_goals": [
    "Objetivo 1 da consulta",
    "Objetivo 2",
    "Objetivo 3"
  ],
  "phases": [
    {
      "phase_number": 1,
      "phase_title": "Fase de Conexão e Rapport",
      "steps": [
        {
          "step_number": 1,
          "step_title": "${OFFICIAL_16_STEP_FRAMEWORK.steps[0].name}",
          "details": {
            "duration": "5-7 minutos",
            "objective": "Objetivo específico deste passo",
            "tone_of_voice": "Tom de voz recomendado (ex: caloroso, profissional)",
            "visual_contact": "Nível de contato visual (ex: frequente e caloroso)",
            "posture": "Postura corporal (ex: inclinado para frente)",
            "script": "Olá ${params.patientName}, [script palavra por palavra usando nome]",
            "mandatory_questions": [
              "Pergunta obrigatória 1",
              "Pergunta obrigatória 2"
            ],
            "fatal_errors": [
              "Erro fatal 1 a evitar",
              "Erro fatal 2"
            ],
            "validation_checklist": [
              "✓ Item de validação 1",
              "✓ Item 2"
            ],
            "transition_script": "Script para transição para próximo passo"
          }
        }
      ]
    }
  ]
}
\`\`\`

# INSTRUÇÕES CRÍTICAS
1. Retorne APENAS o JSON válido
2. Organize as 16 etapas em 4-6 fases lógicas
3. Use o nome ${params.patientName} em TODOS os scripts
4. Seja específico e prático
5. Forneça scripts palavra por palavra
6. Adapte ao perfil comportamental provável

Retorne APENAS o JSON, sem markdown.`;
}

// ============================================================================
// VALIDAÇÃO DE RESPOSTA
// ============================================================================

export const LostSaleResponseSchema = z.object({
  frameworkVersion: z.string(),
  overallPerformance: z.object({
    score: z.number().min(0).max(160),
    rating: z.enum(['Crítico', 'Precisa Melhorar', 'Moderado', 'Bom', 'Excelente']),
    mainConclusion: z.string(),
  }),
  errorPattern: z.object({
    critical: z.number(),
    needsImprovement: z.number(),
    good: z.number(),
    excellent: z.number(),
  }),
  criticalErrors: z.array(z.object({
    errorName: z.string(),
    stepNumber: z.number().min(1).max(16).optional(),
    whyItWasFatal: z.string(),
    coachingNarrative: z.object({
      whatWasSaid: z.string(),
      whatShouldHaveBeenSaid: z.string(),
      crucialDifference: z.string(),
    }),
  })),
  phaseAnalysis: z.array(z.object({
    stepNumber: z.number().min(1).max(16),
    stepName: z.string(),
    score: z.number().min(0).max(10),
    rating: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
  })).length(16), // DEVE ter exatamente 16 etapas
});

export type LostSaleResponse = z.infer<typeof LostSaleResponseSchema>;

// ============================================================================
// HELPER: VALIDAR RESPOSTA DA IA
// ============================================================================

export function validateAnalysisResponse(data: unknown, schema: z.ZodSchema) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Resposta da IA não segue o framework oficial',
          details: error.errors,
        },
      };
    }
    throw error;
  }
}
