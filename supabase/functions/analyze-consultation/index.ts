Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { transcription, patientName, outcome, protocolSold, saleValue, duration } = await req.json();

    if (!transcription || !patientName || !outcome) {
      throw new Error('Transcrição, nome do paciente e resultado são obrigatórios');
    }

    // Obter chave da API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Determinar tipo de análise
    const isLostSale = outcome === 'venda_perdida';
    const isCompletedSale = outcome === 'venda_realizada';

    let prompt = '';

    if (isLostSale) {
      prompt = `Você é um coach especialista em análise de performance de vendas consultivas para medicina estética.

## CONTEXTO DA CONSULTA
- Paciente: ${patientName}
- Duração: ${duration} minutos
- Resultado: VENDA PERDIDA

## TRANSCRIÇÃO DA CONSULTA
${transcription}

## METODOLOGIA DE AVALIAÇÃO (16 Etapas)
Avalie a consulta usando as 16 etapas da metodologia de vendas consultivas.
Para cada etapa, atribua uma nota de 0 a 10.

1. Conexão Genuína (Rapport Emocional)
2. Quebra de Resistência Inicial
3. Investigação de Dores Emocionais (SPIN Selling)
4. Amplificação da Dor (Criação de Urgência)
5. Apresentação do Futuro Ideal
6. Diagnóstico Visual Profissional
7. Educação sobre Causas (Authority Building)
8. Introdução de Soluções (Protocolo)
9. Explicação Técnica Detalhada
10. Demonstração de Resultados (Provas)
11. Ancoragem de Valor
12. Apresentação de Investimento
13. Quebra de Objeções Antecipadas
14. Criação de Escassez
15. Facilitação de Decisão
16. Fechamento Assumido

## TAREFA
Analise a transcrição e gere um diagnóstico COMPLETO em JSON:

{
  "overallPerformance": {
    "score": 0-160,
    "rating": "Crítico|Precisa Melhorar|Bom|Excelente",
    "mainConclusion": "1-2 frases sobre o problema geral"
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
      "whyItWasFatal": "Explicação do impacto",
      "coachingNarrative": {
        "whatWasSaid": "Trecho exato da transcrição",
        "whatShouldHaveBeenSaid": "Script ideal para aquela situação",
        "crucialDifference": "Explicação da diferença"
      }
    }
  ],
  "dominoEffect": {
    "sequence": ["Erro inicial → Consequência 1 → Consequência 2 → Perda da venda"],
    "explanation": "Narrativa explicando a cascata de falhas"
  },
  "rootCause": "A causa raiz fundamental da perda (1 frase)",
  "behavioralProfileAnalysis": {
    "detectedProfile": "Perfil identificado na linguagem do paciente",
    "profileIndicators": ["Indicador 1", "Indicador 2"],
    "doctorAdaptationAnalysis": "Análise de como o médico (des)alinhou com o perfil",
    "howToSellToProfile": {
      "whatToSay": ["Frase 1", "Frase 2"],
      "whatNotToSay": ["Frase 1", "Frase 2"],
      "exampleScript": "Script de exemplo adaptado"
    }
  },
  "correctionStrategy": {
    "immediateFocus": {
      "criticalSteps": [1, 3, 11],
      "trainingScripts": ["Script 1 para treinar", "Script 2"]
    },
    "nextConsultationFocus": ["Etapa X", "Etapa Y"],
    "lifeboatScript": "Script de último recurso para objeções difíceis"
  },
  "phaseAnalysis": [
    {
      "stepNumber": 1,
      "stepName": "Nome da Etapa",
      "score": 0-10,
      "strengths": ["Ponto forte 1"],
      "improvements": ["Ponto de melhoria 1"]
    }
  ]
}

Retorne APENAS o JSON, sem explicações adicionais.`;
    } else if (isCompletedSale) {
      prompt = `Você é um coach especialista em análise de qualidade de vendas consultivas para medicina estética.

## CONTEXTO DA CONSULTA
- Paciente: ${patientName}
- Duração: ${duration} minutos
- Resultado: VENDA REALIZADA ✅
- Protocolo vendido: ${protocolSold}
- Valor: R$ ${saleValue}

## TRANSCRIÇÃO DA CONSULTA
${transcription}

## TAREFA CRÍTICA
Sua tarefa é avaliar a QUALIDADE da venda, não apenas o resultado.

## INDICADORES DE BAIXA QUALIDADE
- Linguagem hesitante do paciente
- Múltiplos descontos oferecidos
- Uso de pressão de urgência/escassez artificial
- Falta de exploração de dores emocionais

## INDICADORES DE ALTA QUALIDADE
- Linguagem confiante do paciente
- Construção sólida de valor antes do preço
- Rapport genuíno estabelecido
- Fechamento natural sem objeções

## TAREFA
Primeiro, DETERMINE se a venda foi de baixa ou alta qualidade.
Depois, gere o JSON apropriado:

SE BAIXA QUALIDADE:
{
  "qualityAssessment": {
    "isLowQuality": true,
    "qualityLevel": "Baixa",
    "riskScore": 0-10,
    "mainConcern": "Preocupação principal"
  },
  "whySaleHappened": {
    "pressureTacticsUsed": ["Tática 1", "Tática 2"],
    "risks": ["Risco de cancelamento/arrependimento"]
  },
  "exactMomentAnalysis": {
    "closingPhrase": "Frase exata do paciente ao aceitar",
    "whatWasSaid": "Análise de sinais de resignação",
    "whatWasNotSaid": "Sinais de entusiasmo que faltaram"
  },
  "overallPerformance": {
    "score": 0-160,
    "rating": "string",
    "mainConclusion": "string"
  },
  "phaseAnalysis": []
}

SE ALTA QUALIDADE:
{
  "qualityAssessment": {
    "isLowQuality": false,
    "qualityLevel": "Alta",
    "strengthScore": 0-10,
    "mainSuccess": "Fator de sucesso principal"
  },
  "successFactors": ["Fator 1", "Fator 2"],
  "highlightMoments": [
    {
      "moment": "Descrição do momento",
      "quote": "Citação da transcrição",
      "impact": "Por que foi bom"
    }
  ],
  "topPerformingSteps": [
    {
      "stepNumber": 1,
      "stepName": "Nome",
      "score": 9,
      "whyItWorked": "Explicação"
    }
  ],
  "minorImprovements": ["Pequeno ajuste 1"],
  "celebration": "Mensagem positiva de parabéns"
}

Retorne APENAS o JSON, sem explicações adicionais.`;
    }

    // Chamar API do Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
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

    return new Response(
      JSON.stringify({
        data: analysisData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao analisar consulta:', error);

    return new Response(
      JSON.stringify({
        error: {
          code: 'CONSULTATION_ANALYSIS_FAILED',
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
