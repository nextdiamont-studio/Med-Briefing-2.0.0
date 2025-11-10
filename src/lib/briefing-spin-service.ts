import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface BriefingSPINInput {
  patientName: string;
  patientAge?: string;
  mainComplaint?: string;
  conversationText: string;
}

export interface BehavioralProfile {
  primaryType: 'Influente' | 'Dominante' | 'Estável' | 'Analítico';
  secondaryType?: 'Influente' | 'Dominante' | 'Estável' | 'Analítico';
  description: string;
  characteristics: string[];
}

export interface SPINDiagnosis {
  situacao: string;
  problema: string;
  implicacao: string;
  necessidade: string;
}

export interface EmotionalTriggers {
  motivacoes: Array<{ text: string; color: string }>;
  medos: Array<{ text: string; color: string }>;
  palavrasGatilho: Array<{ text: string; color: string }>;
}

export interface ClosingStrategy {
  ancoramentoValor: string;
  ofertaPrincipal: string;
  garantia: string;
  urgencia: string;
}

export interface SalesScript {
  titulo: string;
  conteudo: string;
}

export interface ConversationGuide {
  passo1_conexao: string;
  passo2_diagnostico: string;
  passo3_solucao: string;
  passo4_fechamento: string;
}

export interface BriefingSPINResult {
  id?: string;
  patientName: string;
  patientAge?: string;
  mainComplaint?: string;
  behavioralProfile: BehavioralProfile;
  spinDiagnosis: SPINDiagnosis;
  emotionalTriggers: EmotionalTriggers;
  closingStrategy: ClosingStrategy;
  salesScripts: SalesScript[];
  conversationGuide: ConversationGuide;
  createdAt?: string;
}

export async function analyzeBriefingSPIN(
  input: BriefingSPINInput,
  onProgress?: (message: string) => void
): Promise<BriefingSPINResult> {
  try {
    onProgress?.('Iniciando análise com IA...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
Você é um especialista em análise comportamental e vendas consultivas para medicina estética. Analise a conversa abaixo e gere um relatório completo seguindo EXATAMENTE este framework:

**INFORMAÇÕES DO PACIENTE:**
Nome: ${input.patientName}
${input.patientAge ? `Idade: ${input.patientAge}` : ''}
${input.mainComplaint ? `Queixa Principal: ${input.mainComplaint}` : ''}

**TRANSCRIÇÃO DA CONSULTA:**
${input.conversationText}

---

**INSTRUÇÕES DE ANÁLISE:**

1. **PERFIL COMPORTAMENTAL (DISC)**
   Identifique o perfil dominante e secundário (se houver):
   - **Influente (I)**: Sociável, expressivo, entusiasta, impulsivo, busca aprovação social
   - **Dominante (D)**: Direto, assertivo, focado em resultados, decisões rápidas, competitivo
   - **Estável (S)**: Paciente, leal, confiável, busca segurança, decide devagar
   - **Analítico (C)**: Detalhista, perfeccionista, busca evidências, decide com dados

   Forneça descrição detalhada e 4-6 características específicas observadas.

2. **DIAGNÓSTICO SPIN**
   - **Situação**: Contexto atual do paciente (vida pessoal, profissional, rotina)
   - **Problema**: Dor específica identificada (física, emocional, social)
   - **Implicação**: Consequências do problema não resolvido (impacto na vida)
   - **Necessidade**: Solução/transformação que o paciente realmente busca

3. **GATILHOS EMOCIONAIS**
   Liste 3-5 itens para cada categoria com cores:
   - **Motivações** (verde - #10b981): O que move o paciente
   - **Medos** (vermelho - #ef4444): O que o paciente teme
   - **Palavras-Gatilho** (roxo - #a855f7): Termos que ressoam emocionalmente

4. **ESTRATÉGIA DE FECHAMENTO**
   - **Ancoragem de Valor**: Script que posiciona o valor real (não apenas preço)
   - **Oferta Principal**: Apresentação do tratamento/protocolo específico
   - **Garantia**: Segurança e compromisso oferecido
   - **Urgência**: Gatilho de escassez ou oportunidade temporal

5. **6 SCRIPTS DE VENDA**
   Crie scripts prontos para:
   a) **Individualização**: Personalização do tratamento
   b) **Posicionamento**: Autoridade e expertise
   c) **Educação**: Informação que agrega valor
   d) **Transformação Antes/Depois**: Resultados esperados
   e) **Comparação**: Diferencial competitivo
   f) **Protocolo Completo**: Jornada do tratamento

6. **PLANO GUIA COMPLETO**
   Detalhamento dos 4 passos:
   - **Passo 1 - Conexão Emocional**: Como criar rapport
   - **Passo 2 - Diagnóstico Aprofundado**: Perguntas SPIN específicas
   - **Passo 3 - Apresentação da Solução**: Como mostrar o tratamento
   - **Passo 4 - Fechamento Consultivo**: Scripts de fechamento

---

**IMPORTANTE**: Responda APENAS em formato JSON válido seguindo esta estrutura EXATA:

{
  "behavioralProfile": {
    "primaryType": "Influente|Dominante|Estável|Analítico",
    "secondaryType": "Influente|Dominante|Estável|Analítico (ou null)",
    "description": "descrição detalhada de 2-3 frases",
    "characteristics": ["característica 1", "característica 2", ...]
  },
  "spinDiagnosis": {
    "situacao": "texto completo",
    "problema": "texto completo",
    "implicacao": "texto completo",
    "necessidade": "texto completo"
  },
  "emotionalTriggers": {
    "motivacoes": [
      { "text": "motivação 1", "color": "#10b981" },
      { "text": "motivação 2", "color": "#10b981" }
    ],
    "medos": [
      { "text": "medo 1", "color": "#ef4444" },
      { "text": "medo 2", "color": "#ef4444" }
    ],
    "palavrasGatilho": [
      { "text": "palavra 1", "color": "#a855f7" },
      { "text": "palavra 2", "color": "#a855f7" }
    ]
  },
  "closingStrategy": {
    "ancoramentoValor": "script completo de ancoragem",
    "ofertaPrincipal": "apresentação da oferta",
    "garantia": "garantia oferecida",
    "urgencia": "gatilho de urgência"
  },
  "salesScripts": [
    { "titulo": "Individualização", "conteudo": "script completo" },
    { "titulo": "Posicionamento", "conteudo": "script completo" },
    { "titulo": "Educação", "conteudo": "script completo" },
    { "titulo": "Transformação Antes/Depois", "conteudo": "script completo" },
    { "titulo": "Comparação", "conteudo": "script completo" },
    { "titulo": "Protocolo Completo", "conteudo": "script completo" }
  ],
  "conversationGuide": {
    "passo1_conexao": "detalhamento completo",
    "passo2_diagnostico": "detalhamento completo",
    "passo3_solucao": "detalhamento completo",
    "passo4_fechamento": "detalhamento completo"
  }
}

Seja específico, use informações reais da conversa, e crie scripts prontos para uso imediato.
`;

    onProgress?.('Analisando conversa com IA...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    onProgress?.('Processando resultado...');

    // Extract JSON from response
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysisData = JSON.parse(jsonText);

    const briefingResult: BriefingSPINResult = {
      patientName: input.patientName,
      patientAge: input.patientAge,
      mainComplaint: input.mainComplaint,
      behavioralProfile: analysisData.behavioralProfile,
      spinDiagnosis: analysisData.spinDiagnosis,
      emotionalTriggers: analysisData.emotionalTriggers,
      closingStrategy: analysisData.closingStrategy,
      salesScripts: analysisData.salesScripts,
      conversationGuide: analysisData.conversationGuide,
      createdAt: new Date().toISOString(),
    };

    onProgress?.('Salvando análise...');

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('briefing_spin_analyses')
      .insert({
        user_id: user.id,
        patient_name: input.patientName,
        patient_age: input.patientAge,
        main_complaint: input.mainComplaint,
        conversation_text: input.conversationText,
        analysis_result: briefingResult,
      })
      .select()
      .single();

    if (error) throw error;

    briefingResult.id = data.id;

    onProgress?.('Análise concluída!');

    return briefingResult;
  } catch (error) {
    console.error('Erro ao analisar Briefing SPIN:', error);
    throw error;
  }
}

export async function getBriefingSPINAnalyses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('briefing_spin_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteBriefingSPINAnalysis(id: string) {
  const { error } = await supabase
    .from('briefing_spin_analyses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
