// Edge Function: generate-spin-briefing
// Gera briefing SPIN pré-consulta usando Google Gemini API
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
    const { patient_name, patient_age, patient_concern, patient_pain_points, patient_desires, behavioral_triggers } =
      await req.json();

    if (!patient_name || !patient_concern) {
      throw new Error('Dados obrigatórios faltando: patient_name, patient_concern');
    }

    // Obter chave da API Gemini do ambiente SEGURO do Supabase
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada no Supabase');
    }

    // Construir prompt SPIN
    const prompt = `Você é um especialista em vendas consultivas para medicina estética.

# TAREFA: GERAR BRIEFING INTELIGENTE PRÉ-CONSULTA (SPIN QUALIFICATION)

Crie um roadmap estratégico completo para a consulta do seguinte paciente:

## DADOS DO PACIENTE
- **Nome:** ${patient_name}
${patient_age ? `- **Idade:** ${patient_age} anos` : ''}
- **Preocupação Principal:** ${patient_concern}
${patient_pain_points ? `- **Dores/Problemas:** ${patient_pain_points}` : ''}
${patient_desires ? `- **Desejos/Objetivos:** ${patient_desires}` : ''}
${behavioral_triggers ? `- **Gatilhos Comportamentais:** ${behavioral_triggers}` : ''}

---

## INSTRUÇÕES

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

\`\`\`json
{
  "executive_summary": {
    "primary_concern": "<preocupação principal>",
    "primary_pain": "<dor principal>",
    "primary_desire": "<desejo principal>",
    "recommended_protocol": "<protocolo recomendado>",
    "estimated_investment": "<investimento estimado>",
    "expected_conversion_rate": "<taxa de conversão esperada>",
    "total_consultation_time": "<tempo total estimado>"
  },
  "behavioral_triggers": {
    "keywords": ["<palavra-chave 1>", "<palavra-chave 2>"],
    "deep_motivations": ["<motivação 1>", "<motivação 2>"],
    "probable_fears": ["<medo 1>", "<medo 2>"]
  },
  "consultation_goals": [
    "<objetivo 1>",
    "<objetivo 2>",
    "<objetivo 3>"
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
            "script": "<script palavra por palavra usando o nome ${patient_name}>",
            "mandatory_questions": ["<pergunta obrigatória 1>"],
            "fatal_errors": ["<erro fatal 1>"],
            "validation_checklist": ["<item checklist 1>"],
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
4. Use o nome do paciente (${patient_name}) nos scripts
5. Seja específico e prático
6. Cubra todas as 16 etapas da metodologia`;

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
    const spinData = JSON.parse(cleanedText);

    // Adicionar metadata
    const qualificationData = {
      patient_age: patient_age,
      patient_concern: patient_concern,
      ...spinData,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: qualificationData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao gerar briefing SPIN:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'SPIN_GENERATION_FAILED',
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
