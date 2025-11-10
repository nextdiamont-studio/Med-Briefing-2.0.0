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
    const { patientName, patientAge, mainComplaint, additionalNotes } = await req.json();

    if (!patientName || !mainComplaint) {
      throw new Error('Nome do paciente e queixa principal são obrigatórios');
    }

    // Obter chave da API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    // Construir prompt estruturado
    const prompt = `Você é um especialista em vendas consultivas para medicina estética.
Seu papel é criar um briefing estratégico COMPLETO para preparar um médico para uma consulta.

## DADOS DO PACIENTE
- Nome: ${patientName}
- Idade: ${patientAge} anos
- Queixa Principal: ${mainComplaint}
${additionalNotes ? `- Observações: ${additionalNotes}` : ''}

## METODOLOGIA DE REFERÊNCIA
A consulta deve seguir 16 etapas fundamentais:
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

## PLAYBOOK DE PERFIS COMPORTAMENTAIS
- **Dominante (D)**: Direto, resultados, controle, competitivo
  - Palavras-chave: Resultado, Eficiência, Líder, Rápido, Melhor
  - Medos: Perder controle, ser manipulado
  - Abordagem: Seja direto, mostre resultados, deixe ele decidir

- **Influente (I)**: Social, expressivo, entusiasta, emocional
  - Palavras-chave: Feliz, Bonito, Admiração, Jovem, Confiança
  - Medos: Rejeição social, aparência artificial
  - Abordagem: Seja empático, use emoção, celebre resultados

- **Estável (S)**: Calmo, paciente, segurança, relacional
  - Palavras-chave: Seguro, Confiável, Natural, Cuidado, Família
  - Medos: Mudança brusca, riscos, dor
  - Abordagem: Seja paciente, dê garantias, não pressione

- **Analítico (C)**: Detalhista, lógico, preciso, científico
  - Palavras-chave: Estudos, Comprovado, Técnica, Científico, Preciso
  - Medos: Erro médico, falta de informação
  - Abordagem: Seja técnico, mostre dados, explique tudo

## TAREFA
Gere um briefing estratégico COMPLETO em JSON com a seguinte estrutura:

{
  "executiveSummary": {
    "patientProfile": "Descrição do perfil inferido (1-2 frases)",
    "mainPainPoint": "Dor/desejo emocional principal",
    "recommendedProtocol": "Nome do protocolo recomendado",
    "estimatedInvestment": "Faixa de R$ X a R$ Y",
    "conversionProbability": "Alta/Média/Baixa",
    "estimatedConsultationTime": "X minutos"
  },
  "behavioralTriggers": {
    "identifiedProfile": "Dominante|Influente|Estável|Analítico",
    "keywords": ["palavra1", "palavra2", "palavra3"], 
    "deepMotivations": ["motivação1", "motivação2"],
    "probableFears": ["medo1", "medo2"]
  },
  "consultationGoal": [
    "Meta 1",
    "Meta 2",
    "Meta 3"
  ],
  "phases": [
    {
      "phaseName": "Fase X",
      "steps": [
        {
          "stepNumber": 1,
          "stepName": "Nome da Etapa",
          "duration": "X min",
          "objective": "Objetivo claro da etapa",
          "script": "Script COMPLETO palavra por palavra, usando o NOME do paciente e as PALAVRAS-GATILHO identificadas. Mínimo 150 palavras.",
          "toneOfVoice": "Descrição do tom (caloroso/técnico/entusiasta)",
          "mandatoryQuestions": ["Pergunta 1?", "Pergunta 2?"],
          "fatalErrors": ["Erro fatal 1", "Erro fatal 2"],
          "validationChecklist": ["✓ Item 1", "✓ Item 2"],
          "transitionScript": "Frase de transição para próxima etapa"
        }
      ]
    }
  ]
}

INSTRUÇÕES CRÍTICAS:
1. O campo "script" deve ser um roteiro COMPLETO, NÃO um template genérico
2. SEMPRE use o nome do paciente (${patientName}) no script
3. SEMPRE inclua as palavras-gatilho identificadas no script
4. Os scripts devem soar naturais, como uma conversa real
5. Adapte TUDO ao perfil comportamental identificado
6. Seja específico na queixa (${mainComplaint})

Retorne APENAS o JSON, sem explicações adicionais.`;

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
    const briefingData = JSON.parse(cleanedText);

    return new Response(
      JSON.stringify({
        data: briefingData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao gerar briefing:', error);

    return new Response(
      JSON.stringify({
        error: {
          code: 'BRIEFING_GENERATION_FAILED',
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
