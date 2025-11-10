// Analysis Service - Gemini API Integration for Med Briefing 2.0
// Handles AI analysis using Google Gemini API instead of Firebase

import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';
import type {
  PerformanceAnalysisData,
  SpinQualificationData,
  PerformanceAnalysisFormData,
  SpinQualificationFormData,
  AIAnalysisResponse,
  KnowledgeBase,
} from './analysis-types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY || '',
});

// Model configurations
const GENERATION_MODEL = 'gemini-2.5-pro'; // For analysis generation
const TRANSCRIPTION_MODEL = 'gemini-2.5-pro'; // For audio transcription

/**
 * Get knowledge base content from Supabase
 */
async function getKnowledgeBase(): Promise<KnowledgeBase[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching knowledge base:', error);
    return [];
  }

  return data || [];
}

/**
 * Build master document prompt from knowledge base
 */
function buildMasterDocumentPrompt(knowledgeBase: KnowledgeBase[]): string {
  if (knowledgeBase.length === 0) {
    return 'Você é um especialista em análise de consultas médicas estéticas.';
  }

  let prompt = '# DOCUMENTOS MESTRES PARA ANÁLISE\n\n';

  knowledgeBase.forEach((kb, index) => {
    prompt += `## Material ${index + 1}: ${kb.title}\n\n`;
    prompt += `${kb.content}\n\n`;
    prompt += '---\n\n';
  });

  return prompt;
}

/**
 * Analyze consultation performance using Gemini AI
 */
export async function analyzeConsultationPerformance(
  formData: PerformanceAnalysisFormData
): Promise<AIAnalysisResponse> {
  try {
    // Get knowledge base
    const knowledgeBase = await getKnowledgeBase();
    const masterDocument = buildMasterDocumentPrompt(knowledgeBase);

    // Build analysis prompt
    const analysisPrompt = `
${masterDocument}

# TAREFA: ANÁLISE DE CONSULTA MÉDICA ESTÉTICA

Analise a seguinte transcrição de consulta e forneça uma análise detalhada de performance.

## DADOS DA CONSULTA
- **Paciente:** ${formData.patient_name}
- **Resultado:** ${formData.outcome}
${formData.ticket_value ? `- **Valor do Ticket:** R$ ${formData.ticket_value.toFixed(2)}` : ''}

## TRANSCRIÇÃO
${formData.transcript}

---

## INSTRUÇÕES DE ANÁLISE

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

\`\`\`json
{
  "overall_performance": {
    "score": <número de 0 a 160>,
    "rating": "<Crítico|Precisa Melhorar|Moderado|Bom|Excelente>",
    "summary": "<resumo executivo da performance>"
  },
  "behavioral_profile_analysis": {
    "profile": "<Dominante|Influente|Estável|Analítico|Não Identificado>",
    "justification": "<justificativa detalhada>",
    "doctor_adaptation_analysis": "<análise de como o médico se adaptou>",
    "communication_recommendations": {
      "phrases": ["<frase 1>", "<frase 2>", ...],
      "keywords": ["<palavra-chave 1>", "<palavra-chave 2>", ...]
    }
  },
  "phases": [
    {
      "phase_number": 1,
      "phase_title": "<título da fase>",
      "steps": [
        {
          "step_number": 1,
          "step_title": "<título do passo>",
          "score": <0-10>,
          "rating": "<Crítico|Precisa Melhorar|Moderado|Bom|Excelente>",
          "what_did_well": ["<ponto positivo 1>", ...],
          "improvement_points": ["<ponto de melhoria 1>", ...],
          "coaching_narrative": {
            "what_was_said": "<o que foi dito>",
            "what_should_have_been_said": "<o que deveria ter sido dito>",
            "crucial_differences": ["<diferença 1>", ...]
          }
        }
      ]
    }
  ],
  "indication_baseline": {
    "emotional_connection_extract": "<trecho que demonstra conexão emocional>",
    "value_building_extract": "<trecho que demonstra construção de valor>",
    "social_proof_extract": "<trecho que demonstra prova social>"
  },
  "critical_observations": {
    "essential_control_points": [
      {
        "point_description": "<descrição do ponto de controle>",
        "was_observed": <true|false>
      }
    ],
    "fatal_errors": [
      {
        "error_description": "<descrição do erro fatal>",
        "was_observed": <true|false>
      }
    ]
  }
  ${formData.outcome === 'Venda Perdida' || formData.outcome === 'Venda Realizada' ? `
  ,"lost_sale_details": {
    "error_pattern": {
      "excellent": <número de passos excelentes>,
      "good": <número de passos bons>,
      "deficient": <número de passos deficientes>,
      "critical": <número de passos críticos>
    },
    "critical_errors": [
      {
        "error_order": 1,
        "error_title": "<título do erro>",
        "what_happened": "<o que aconteceu>",
        "why_critical": "<por que é crítico>",
        "coaching_narrative": "<narrativa de coaching>"
      }
    ],
    "domino_effect": "<efeito dominó dos erros>",
    "exact_moment": "<momento exato da perda>",
    "root_cause": "<causa raiz>",
    "correction_strategy": {
      "immediate_focus": {
        "description": "<foco imediato>",
        "training_scripts": [
          {
            "script_title": "<título do script>",
            "script_content": "<conteúdo do script>",
            "practice_recommendation": "10x"
          }
        ]
      },
      "next_call_focus": {
        "description": "<foco na próxima chamada>",
        "training_scripts": [...]
      },
      "lifesaver_script": "<script salva-vidas>"
    },
    "behavioral_report": {
      "how_doctor_sold": "<como o médico vendeu>",
      "how_should_sell_to_profile": "<como deveria vender para este perfil>"
    },
    "identified_strengths": [
      {
        "strength_title": "<título da força>",
        "evidence": "<evidência>",
        "how_to_leverage": "<como aproveitar>"
      }
    ],
    "errors_for_correction": [
      {
        "error_title": "<título do erro>",
        "what_did": "<o que fez>",
        "impact": "<impacto>",
        "correction": "<correção>"
      }
    ],
    "final_coaching_plan": {
      "pre_call_checklist": ["<item 1>", ...],
      "during_call_checklist": ["<item 1>", ...],
      "post_call_checklist": ["<item 1>", ...]
    }
  }` : ''}
}
\`\`\`

IMPORTANTE:
1. Retorne APENAS o JSON, sem texto adicional
2. Avalie todos os 16 passos da metodologia
3. Seja específico e detalhado em cada análise
4. Use evidências da transcrição
5. Para vendas perdidas, forneça análise profunda com lost_sale_details
`;

    // Generate analysis using new GoogleGenAI API
    const response = await genAI.models.generateContent({
      model: GENERATION_MODEL,
      contents: analysisPrompt,
    });
    const text = response.text;

    // Parse JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Add metadata
    const performanceData: Partial<PerformanceAnalysisData> = {
      outcome: formData.outcome,
      is_low_quality_sale: false, // TODO: Implement low quality detection
      ticket_value: formData.ticket_value,
      overall_performance: analysisData.overall_performance,
      behavioral_profile_analysis: analysisData.behavioral_profile_analysis,
      phases: analysisData.phases || [],
      lost_sale_details: analysisData.lost_sale_details,
      indication_baseline: analysisData.indication_baseline,
      critical_observations: analysisData.critical_observations,
    };

    return {
      success: true,
      data: performanceData as PerformanceAnalysisData,
    };
  } catch (error) {
    console.error('Error analyzing consultation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate SPIN qualification (pre-call briefing) using Gemini AI
 */
export async function generateSpinQualification(
  formData: SpinQualificationFormData
): Promise<AIAnalysisResponse> {
  try {
    // Get knowledge base
    const knowledgeBase = await getKnowledgeBase();
    const masterDocument = buildMasterDocumentPrompt(knowledgeBase);

    // Build SPIN prompt
    const spinPrompt = `
${masterDocument}

# TAREFA: GERAR BRIEFING INTELIGENTE PRÉ-CONSULTA (SPIN QUALIFICATION)

Crie um roadmap estratégico completo para a consulta do seguinte paciente:

## DADOS DO PACIENTE
- **Nome:** ${formData.patient_name}
${formData.patient_age ? `- **Idade:** ${formData.patient_age} anos` : ''}
- **Preocupação Principal:** ${formData.patient_concern}
${formData.patient_pain_points ? `- **Dores/Problemas:** ${formData.patient_pain_points}` : ''}
${formData.patient_desires ? `- **Desejos/Objetivos:** ${formData.patient_desires}` : ''}
${formData.behavioral_triggers ? `- **Gatilhos Comportamentais:** ${formData.behavioral_triggers}` : ''}

---

## INSTRUÇÕES

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

\`\`\`json
{
  "executive_summary": {
    "profile": "<Dominante|Influente|Estável|Analítico|Não Identificado>",
    "primary_concern": "<preocupação principal>",
    "primary_pain": "<dor principal>",
    "primary_desire": "<desejo principal>",
    "recommended_protocol": "<protocolo recomendado>",
    "estimated_investment": "<investimento estimado>",
    "expected_conversion_rate": "<taxa de conversão esperada>",
    "total_consultation_time": "<tempo total estimado>"
  },
  "behavioral_triggers": {
    "keywords": ["<palavra-chave 1>", "<palavra-chave 2>", ...],
    "deep_motivations": ["<motivação 1>", "<motivação 2>", ...],
    "probable_fears": ["<medo 1>", "<medo 2>", ...]
  },
  "consultation_goals": [
    "<objetivo 1>",
    "<objetivo 2>",
    ...
  ],
  "phases": [
    {
      "phase_number": 1,
      "phase_title": "<título da fase>",
      "steps": [
        {
          "step_number": 1,
          "step_title": "<título do passo>",
          "details": {
            "duration": "<duração estimada>",
            "objective": "<objetivo do passo>",
            "tone_of_voice": "<tom de voz recomendado>",
            "visual_contact": "<contato visual recomendado>",
            "posture": "<postura recomendada>",
            "script": "<script palavra por palavra>",
            "mandatory_questions": ["<pergunta obrigatória 1>", ...],
            "fatal_errors": ["<erro fatal 1>", ...],
            "validation_checklist": ["<item checklist 1>", ...],
            "transition_script": "<script de transição>"
          }
        }
      ]
    }
  ]
}
\`\`\`

IMPORTANTE:
1. Retorne APENAS o JSON, sem texto adicional
2. Crie um plano detalhado fase por fase
3. Forneça scripts palavra por palavra para cada passo
4. Identifique o perfil comportamental provável
5. Seja específico e prático
`;

    // Generate qualification using new GoogleGenAI API
    const response = await genAI.models.generateContent({
      model: GENERATION_MODEL,
      contents: spinPrompt,
    });
    const text = response.text;

    // Parse JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const spinData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Add metadata
    const qualificationData: Partial<SpinQualificationData> = {
      patient_age: formData.patient_age,
      patient_concern: formData.patient_concern,
      executive_summary: spinData.executive_summary,
      behavioral_triggers: spinData.behavioral_triggers,
      consultation_goals: spinData.consultation_goals,
      phases: spinData.phases || [],
    };

    return {
      success: true,
      data: qualificationData as SpinQualificationData,
    };
  } catch (error) {
    console.error('Error generating SPIN qualification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate Intelligent Briefing analysis from transcript using Gemini AI
 */
export async function generateIntelligentBriefing(
  patientName: string,
  patientAge: string | undefined,
  mainComplaint: string | undefined,
  conversationText: string
): Promise<AIAnalysisResponse> {
  try {
    // Get knowledge base
    const knowledgeBase = await getKnowledgeBase();
    const masterDocument = buildMasterDocumentPrompt(knowledgeBase);

    // Build Intelligent Briefing prompt
    const briefingPrompt = `
${masterDocument}

# TAREFA: GERAR BRIEFING INTELIGENTE A PARTIR DE TRANSCRIÇÃO

Analise a transcrição de consulta abaixo e gere um roadmap estratégico completo:

## INFORMAÇÕES DO PACIENTE
- **Nome:** ${patientName}
${patientAge ? `- **Idade:** ${patientAge} anos` : ''}
${mainComplaint ? `- **Queixa Principal:** ${mainComplaint}` : ''}

## TRANSCRIÇÃO DA CONSULTA
${conversationText}

---

## INSTRUÇÕES

Com base na transcrição real da consulta, você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

\`\`\`json
{
  "executive_summary": {
    "profile": "<Dominante|Influente|Estável|Analítico|Não Identificado>",
    "primary_concern": "<preocupação principal identificada na conversa>",
    "primary_pain": "<dor principal identificada>",
    "primary_desire": "<desejo principal identificado>",
    "recommended_protocol": "<protocolo recomendado baseado na análise>",
    "estimated_investment": "<investimento estimado>",
    "expected_conversion_rate": "<taxa de conversão esperada>",
    "total_consultation_time": "<tempo estimado para próximas consultas>"
  },
  "behavioral_triggers": {
    "keywords": ["<palavra-chave identificada 1>", "<palavra-chave identificada 2>", ...],
    "deep_motivations": ["<motivação profunda 1>", "<motivação profunda 2>", ...],
    "probable_fears": ["<medo provável 1>", "<medo provável 2>", ...]
  },
  "consultation_goals": [
    "<objetivo estratégico 1>",
    "<objetivo estratégico 2>",
    ...
  ],
  "phases": [
    {
      "phase_number": 1,
      "phase_title": "<título da fase>",
      "steps": [
        {
          "step_number": 1,
          "step_title": "<título do passo>",
          "details": {
            "duration": "<duração estimada>",
            "objective": "<objetivo do passo>",
            "tone_of_voice": "<tom de voz recomendado>",
            "visual_contact": "<contato visual recomendado>",
            "posture": "<postura recomendada>",
            "script": "<script palavra por palavra otimizado>",
            "mandatory_questions": ["<pergunta obrigatória 1>", ...],
            "fatal_errors": ["<erro fatal a evitar 1>", ...],
            "validation_checklist": ["<item checklist 1>", ...],
            "transition_script": "<script de transição>"
          }
        }
      ]
    }
  ]
}
\`\`\`

IMPORTANTE:
1. Retorne APENAS o JSON, sem texto adicional
2. Analise a transcrição para identificar o perfil comportamental real do paciente
3. Extraia as preocupações, dores e desejos mencionados na conversa
4. Crie um plano detalhado fase por fase para otimizar futuras consultas
5. Forneça scripts palavra por palavra baseados no que funcionaria melhor com este perfil
6. Seja específico e use evidências da transcrição
`;

    // Generate analysis using new GoogleGenAI API
    const response = await genAI.models.generateContent({
      model: GENERATION_MODEL,
      contents: briefingPrompt,
    });
    const text = response.text;

    // Parse JSON response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const briefingData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Add metadata
    const qualificationData: Partial<SpinQualificationData> = {
      patient_age: patientAge ? parseInt(patientAge) : undefined,
      patient_concern: mainComplaint || briefingData.executive_summary.primary_concern,
      executive_summary: briefingData.executive_summary,
      behavioral_triggers: briefingData.behavioral_triggers,
      consultation_goals: briefingData.consultation_goals,
      phases: briefingData.phases || [],
    };

    return {
      success: true,
      data: qualificationData as SpinQualificationData,
    };
  } catch (error) {
    console.error('Error generating Intelligent Briefing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Transcribe audio file using Gemini AI
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const prompt = `
Transcreva o seguinte áudio de uma consulta médica estética.

Forneça uma transcrição completa e precisa do diálogo.
Identifique os falantes como "Médico:" e "Paciente:".

Retorne apenas a transcrição, sem comentários adicionais.
`;

    // Generate transcription using new GoogleGenAI API with file data
    const response = await genAI.models.generateContent({
      model: TRANSCRIPTION_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // This would typically use a PDF parsing library
  // For now, we'll return a placeholder
  // TODO: Implement PDF text extraction using pdf.js or similar
  throw new Error('PDF extraction not yet implemented. Please use TXT files or manual entry.');
}
