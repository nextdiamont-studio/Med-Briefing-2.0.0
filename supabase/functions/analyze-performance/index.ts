// Edge Function: analyze-performance
// Analisa performance de consultas usando Google Gemini API
// A API key está segura no backend (Deno.env.get('GEMINI_API_KEY'))

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Receber dados do frontend
    const { patient_name, outcome, ticket_value, transcript } = await req.json();

    if (!patient_name || !outcome || !transcript) {
      throw new Error('Dados obrigatórios faltando: patient_name, outcome, transcript');
    }

    // Obter chave da API Gemini do ambiente SEGURO do Supabase
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada no Supabase');
    }

    // Construir prompt de análise
    const prompt = `Você é um especialista em análise de consultas médicas estéticas.

# TAREFA: ANÁLISE DE CONSULTA MÉDICA ESTÉTICA

Analise a seguinte transcrição de consulta e forneça uma análise detalhada de performance.

## DADOS DA CONSULTA
- **Paciente:** ${patient_name}
- **Resultado:** ${outcome}
${ticket_value ? `- **Valor do Ticket:** R$ ${ticket_value.toFixed(2)}` : ''}

## TRANSCRIÇÃO
${transcript}

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
      "phrases": ["<frase 1>", "<frase 2>"],
      "keywords": ["<palavra-chave 1>", "<palavra-chave 2>"]
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
          "what_did_well": ["<ponto positivo 1>"],
          "improvement_points": ["<ponto de melhoria 1>"],
          "coaching_narrative": {
            "what_was_said": "<o que foi dito>",
            "what_should_have_been_said": "<o que deveria ter sido dito>",
            "crucial_differences": ["<diferença 1>"]
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
  }${outcome === 'Venda Perdida' ? `,
  "lost_sale_details": {
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
        "training_scripts": []
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
      "pre_call_checklist": ["<item 1>"],
      "during_call_checklist": ["<item 1>"],
      "post_call_checklist": ["<item 1>"]
    }
  }` : ''}
}
\`\`\`

IMPORTANTE:
1. Retorne APENAS o JSON, sem texto adicional
2. Avalie todos os 16 passos da metodologia
3. Seja específico e detalhado em cada análise
4. Use evidências da transcrição
5. Para vendas perdidas, forneça análise profunda com lost_sale_details`;

    // Chamar API do Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();

    // Extrair texto da resposta
    const responseText = geminiData.candidates[0].content.parts[0].text;

    // Limpar markdown code blocks se houver
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parsear JSON
    const analysisData = JSON.parse(cleanedText);

    // Adicionar metadata
    const performanceData = {
      outcome: outcome,
      is_low_quality_sale: false, // TODO: Implementar detecção de baixa qualidade
      ticket_value: ticket_value,
      ...analysisData,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: performanceData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao analisar consulta:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
