// ============================================================================
// DIRECT AI SERVICE - Substituição das Edge Functions
// Análise direta usando Gemini API sem Edge Functions
// ============================================================================

import type {
  PerformanceAnalysisData,
  PerformanceAnalysisFormData,
  AIAnalysisResponse,
} from './analysis-types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY não configurada no arquivo .env');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize behavioral profile to match database enum values
 * Converts "D - Dominante" to "Dominante", etc.
 */
function normalizeBehavioralProfile(profile: string): string {
  if (!profile) return 'Não Identificado';

  // Remove letter prefix (D -, I -, S -, C -) if present
  const cleaned = profile.replace(/^[DISC]\s*-\s*/i, '').trim();

  // Map to valid enum values
  const validProfiles = ['Dominante', 'Influente', 'Estável', 'Analítico'];

  // Case-insensitive match
  const matched = validProfiles.find(
    valid => valid.toLowerCase() === cleaned.toLowerCase()
  );

  return matched || 'Não Identificado';
}

/**
 * Normalize performance rating to match database enum values
 * Maps various rating formats to: 'Crítico', 'Precisa Melhorar', 'Moderado', 'Bom', 'Excelente'
 */
function normalizePerformanceRating(rating: string): string {
  if (!rating) return 'Crítico';

  const ratingLower = rating.toLowerCase().trim();

  // Map common variations
  const ratingMap: Record<string, string> = {
    'crítico': 'Crítico',
    'critico': 'Crítico',
    'insuficiente': 'Crítico',
    'inadequado': 'Crítico',
    'apático': 'Crítico',
    'precisa melhorar': 'Precisa Melhorar',
    'superficial': 'Precisa Melhorar',
    'moderado': 'Moderado',
    'regular': 'Moderado',
    'adequado': 'Moderado',
    'neutro': 'Moderado',
    'bom': 'Bom',
    'muito bom': 'Bom',
    'profundo': 'Bom',
    'excelente': 'Excelente',
    'entusiasmado': 'Excelente',
  };

  return ratingMap[ratingLower] || 'Moderado';
}

// ============================================================================
// FRAMEWORK v3.0 - 15 ETAPAS (Metodologia Oficial Completa)
// ============================================================================

const FRAMEWORK_V3_15_STEPS = {
  version: '3.0',
  methodology: 'Vendas Consultivas - Metodologia Oficial Completa (6 Passos)',
  totalSteps: 15,
  maxScore: 150,
  steps: [
    { number: 1, name: 'Primeira Impressão e Preparação' },
    { number: 2, name: 'Conexão Genuína (10 min obrigatórios)' },
    { number: 3, name: 'Mapeamento - Pergunta 1: Dores (Frequência Baixa)' },
    { number: 4, name: 'Mapeamento - Pergunta 2: Desejos (Frequência Alta)' },
    { number: 5, name: 'Mapeamento - Pergunta 3: Nível de Consciência' },
    { number: 6, name: 'Mapeamento - Pergunta 4: Histórico' },
    { number: 7, name: 'Mapeamento - Pergunta 5: Receios/Medos' },
    { number: 8, name: 'Direcionamento - Individualização' },
    { number: 9, name: 'Direcionamento - Posicionamento de Resultado' },
    { number: 10, name: 'Direcionamento - Educação (Tratamento vs Procedimento)' },
    { number: 11, name: 'Direcionamento - Demonstração de Provas' },
    { number: 12, name: 'Direcionamento - Comparação (Barato que Sai Caro)' },
    { number: 13, name: 'Direcionamento - Apresentação do Protocolo' },
    { number: 14, name: 'Negociação - Estrutura de Preço e Fechamento' },
    { number: 15, name: 'Recorrência - Planejamento de Retorno' },
  ],
};

// ============================================================================
// GERAÇÃO DE PROMPTS
// ============================================================================

function generateLostSalePrompt(params: {
  patientName: string;
  duration?: string;
  transcription: string;
}): string {
  return `Você é um especialista em análise de vendas consultivas para medicina estética, com expertise em análise de performance, psicologia de vendas, SPIN Selling e perfis comportamentais DISC.

Sua análise deve ser honesta, acionável e focada em fornecer scripts prontos para correção imediata.

REGRAS ABSOLUTAS:
- NUNCA use emojis em nenhuma parte da análise
- Use apenas linguagem técnica e profissional
- Análise completa de TODAS as 15 etapas obrigatoriamente

CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Resultado: VENDA PERDIDA

TRANSCRIÇÃO DA CONSULTA
${params.transcription}

METODOLOGIA OFICIAL - 6 PASSOS DE VENDAS CONSULTIVAS (15 ETAPAS)

PASSO 1: PRIMEIRA IMPRESSÃO E PREPARAÇÃO (Etapa 1)
AVALIE:
- Médico preparou-se ANTES da consulta? (Olhou Instagram, leu ficha cadastral, identificou pontos em comum?)
- Recepção foi calorosa e energética?
- Usou o NOME do paciente repetidamente?
- Ofereceu água/café?

PASSO 2: CONEXÃO GENUÍNA (Etapa 2) - CRÍTICO: 10 MINUTOS OBRIGATÓRIOS

Padrão Correto:
1. Perguntas ABERTAS - nunca sim/não
2. Estratégia escolhida:
   - FAMÍLIA: "Você é casada? Tem filhos? Como se chamam? Quantos anos?"
   - INSTAGRAM: "Vi que o Miguel fez aniversário. Que festa linda."
   - PACIENTE FECHADO: "Percebi que você está tensa. É normal. Pode ficar tranquila."
3. Validação emocional constante: "Imagino que seja puxado", "Entendo você"
4. Transição natural: "Agora que te conheço, deixa eu entender sua queixa"

AVALIE:
- Fez perguntas abertas ou fechadas (sim/não)?
- Quanto tempo durou? (Mínimo 10 minutos)
- Paciente se abriu ou ficou fechado?
- Houve validação emocional genuína?
- Score: 0-10

PASSO 3: MAPEAMENTO - 5 PERGUNTAS OBRIGATÓRIAS (Etapas 3-7)

ETAPA 3 - PERGUNTA 1: DORES (Frequência Emocional BAIXA)
Script Correto: "${params.patientName}, o que mais tem te incomodado no seu [rosto/corpo]?"

Aprofundamento OBRIGATÓRIO:
- "E o que você SENTE com isso?"
- "Como isso IMPACTA você no dia a dia?"
- "Tem quanto tempo que isso te incomoda?"
- "Seu marido/família já comentou algo?"

Frequência Emocional Correta:
- TOM BAIXO, voz séria
- Expressar empatia através do tom grave
- Validar a dor: "Nossa, deve ser muito difícil..."

ETAPA 4 - PERGUNTA 2: DESEJOS (Frequência Emocional ALTA)
Script Correto: "E quando você se imagina resolvendo isso, o que você mais quer sentir? Como quer se ver?"

Aprofundamento OBRIGATÓRIO:
- "E o que isso vai mudar na sua vida?"
- "O que você vai poder fazer que hoje não faz?"
- "Como você imagina se sentindo depois?"

Frequência Emocional Correta:
- TOM ALTO, voz animada
- Expressar esperança e possibilidade
- Pintar o quadro positivo: "Imagina você se olhando no espelho e..."

ETAPA 5 - PERGUNTA 3: NÍVEL DE CONSCIÊNCIA
Script Correto: "Você já pesquisou sobre tratamentos? Já viu sobre [procedimento X]?"

ETAPA 6 - PERGUNTA 4: HISTÓRICO
Script Correto: "Você já fez algum tratamento estético antes? O que? Como foi sua experiência?"

ETAPA 7 - PERGUNTA 5: RECEIOS/MEDOS
Script Correto: "E o que mais te preocupa em fazer um tratamento? Existe algum medo?"

Aprofundamento OBRIGATÓRIO:
- "Você tem medo de [cirurgia/anestesia/dor/resultado]?"
- Validar cada medo: "Eu entendo. Esse é um receio super comum e válido."

PASSO 4: DIRECIONAMENTO (Etapas 8-13)

ETAPA 8 - INDIVIDUALIZAÇÃO
O médico deve repetir as PALAVRAS EXATAS do paciente ao apresentar a solução.

Exemplo Correto:
Paciente disse: "Quero me sentir confiante em fotos"
Médico deve dizer: "Então o protocolo vai fazer você se sentir CONFIANTE EM FOTOS"

AVALIE: O médico usou as palavras exatas do paciente?

ETAPA 9 - POSICIONAMENTO DE RESULTADO
Apresentar ANTES E DEPOIS real (fotos/vídeos de casos similares)

ETAPA 10 - EDUCAÇÃO (Tratamento vs Procedimento)
Explicar: "Não é um procedimento isolado, é um TRATAMENTO completo"

ETAPA 11 - DEMONSTRAÇÃO DE PROVAS
Mostrar cases reais, depoimentos, resultados anteriores

ETAPA 12 - COMPARAÇÃO (Barato que Sai Caro)
Comparar opção ideal vs opções mais baratas (mostrar diferença de resultados)

ETAPA 13 - APRESENTAÇÃO DO PROTOCOLO
Apresentar sessão por sessão com detalhamento completo

PASSO 5: NEGOCIAÇÃO (Etapa 14)

ETAPA 14 - ESTRUTURA DE PREÇO E FECHAMENTO
Estrutura correta:
1. Apresentar valor cheio primeiro
2. Oferecer facilidades (parcelamento)
3. Fechar com convicção: "Quando você quer começar?"

PASSO 6: RECORRÊNCIA (Etapa 15)

ETAPA 15 - PLANEJAMENTO DE RETORNO
Agendar próxima consulta/retorno antes do paciente sair

===================================================================
🚨 ATENÇÃO CRÍTICA - OBRIGATÓRIO:
===================================================================

O array "phaseByPhaseAnalysis" DEVE conter EXATAMENTE 15 objetos, NEM MAIS, NEM MENOS.

PARA CADA UMA DAS 15 ETAPAS, você DEVE OBRIGATORIAMENTE:

1. ✅ Analisar COMPLETAMENTE o que aconteceu naquela etapa específica
2. ✅ Listar PELO MENOS 2-3 pontos fortes (strengths) OU indicar lista vazia se não houver
3. ✅ Listar PELO MENOS 2-3 pontos fracos (weaknesses) OU indicar lista vazia se perfeito
4. ✅ Escrever "whatHappened" com PELO MENOS 50 caracteres descrevendo o que ocorreu
5. ✅ Escrever "coachingNote" com frase DIRETA em primeira pessoa (mínimo 80 caracteres)
6. ✅ Escrever "impact" com análise do impacto (mínimo 40 caracteres)
7. ✅ Atribuir score de 0-10 baseado na performance real
8. ✅ Atribuir rating: "Crítico", "Precisa Melhorar", "Moderado", "Bom" ou "Excelente"

Se alguma etapa NÃO foi executada pelo médico:
- score: 0
- rating: "Crítico"
- strengths: []
- weaknesses: ["Etapa não foi executada", "Pulou esta parte da metodologia"]
- whatHappened: "O médico não executou esta etapa da metodologia."
- coachingNote: "[Nome do paciente], [frase de como deveria fazer esta etapa]..."
- impact: "CRÍTICO - Etapa fundamental não executada, comprometendo todo o processo."

⛔ ANÁLISE INCOMPLETA SERÁ REJEITADA
⛔ ETAPAS VAZIAS OU SUPERFICIAIS SERÃO REJEITADAS
⛔ RESPOSTAS COM MENOS DE 15 ETAPAS SERÃO REJEITADAS

===================================================================

🚨 ERROS CRÍTICOS/FATAIS - OBRIGATÓRIO PARA VENDA PERDIDA:
===================================================================

Para análises de VENDA PERDIDA, o array "criticalErrors" é OBRIGATÓRIO e deve conter:

MÍNIMO: 3-5 erros críticos identificados
MÁXIMO: 10 erros críticos

Para CADA erro crítico, você DEVE incluir:
- errorName: Nome claro do erro (ex: "Não fez mapeamento de dores")
- severity: "Fatal" (erros que mataram a venda) OU "Grave" (contribuíram) OU "Moderada"
- whatWasSaid: Transcrição EXATA do que foi dito pelo médico
- whyItWasFatal: Explicação de POR QUE isso causou a perda da venda
- whatShouldHaveBeenSaid: Frase DIRETA que deveria ter sido dita

PRIORIZE erros com severity="Fatal" - estes são os que MATARAM a venda:
- Não fazer as 5 perguntas de mapeamento
- Pular conexão genuína (10min)
- Não usar palavras exatas do paciente
- Apresentar preço sem ancoragem de valor
- Não fazer follow-up emocional

⛔ VENDA PERDIDA SEM criticalErrors SERÁ REJEITADA
⛔ Menos de 3 erros críticos SERÁ REJEITADO

===================================================================

🚨 PLANO DE COACHING FINAL - OBRIGATÓRIO:
===================================================================

O objeto "final_coaching_plan" é OBRIGATÓRIO e deve conter 3 checklists:

1. PRE_CALL_CHECKLIST (pre_call_checklist): Array com 3-5 itens
   - Preparações ANTES da consulta
   - Exemplo: "Revisar Instagram do paciente", "Ler ficha cadastral completa"

2. DURING_CALL_CHECKLIST (during_call_checklist): Array com 5-8 itens
   - Ações DURANTE a consulta
   - Exemplo: "Fazer as 5 perguntas de mapeamento", "Usar palavras exatas do paciente"

3. POST_CALL_CHECKLIST (post_call_checklist): Array com 2-4 itens
   - Ações APÓS a consulta
   - Exemplo: "Enviar resumo personalizado", "Agendar follow-up em 24h"

FORMATO de cada item no checklist:
{
  "item": "Descrição clara da ação",
  "why": "Por que isso é importante",
  "how": "Como executar especificamente"
}

⛔ PLANO SEM CHECKLISTS SERÁ REJEITADO
⛔ CHECKLISTS VAZIOS SERÃO REJEITADOS

===================================================================

ANÁLISE DE PERFIL COMPORTAMENTAL (DISC)

Identificar o perfil DISC do paciente:
- D (Dominante): Objetivo, direto, quer resultados rápidos
- I (Influente): Social, animado, busca validação
- S (Estável): Calmo, precisa de segurança, não gosta de pressão
- C (Cauteloso): Detalhista, analítico, pesquisa muito

AVALIE:
- Qual o perfil identificado?
- O médico adaptou sua comunicação ao perfil?
- Se NÃO adaptou, houve "Fatal Mismatch" (erro fatal de perfil)?

FORMATO DE RESPOSTA JSON

Responda APENAS com JSON válido, seguindo exatamente esta estrutura:

{
  "frameworkVersion": "3.0",
  "outcome": "Venda Perdida",
  "overallPerformance": {
    "score": 65,
    "rating": "Regular",
    "mainConclusion": "Análise geral do desempenho"
  },
  "frequencyAnalysis": {
    "connectionPhase": {
      "rating": "Bom/Regular/Crítico",
      "details": "Descrição objetiva"
    },
    "painDiscovery": {
      "usedLowFrequency": true,
      "evidence": "Trecho da transcrição",
      "impact": "Impacto observado"
    },
    "desireAmplification": {
      "usedHighFrequency": false,
      "evidence": "Trecho ou N/A",
      "impact": "Impacto negativo"
    }
  },
  "mappingAnalysis": {
    "question1Dores": {
      "asked": true,
      "deepened": false,
      "score": 6
    },
    "question2Desejos": {
      "asked": false,
      "deepened": false,
      "score": 0
    },
    "question3Consciencia": {
      "asked": true,
      "score": 8
    },
    "question4Historico": {
      "asked": true,
      "score": 7
    },
    "question5Receios": {
      "asked": false,
      "score": 0
    },
    "overallMappingScore": 21
  },
  "directioningAnalysis": {
    "usedExactPatientsWords": false,
    "showedBeforeAfter": true,
    "explainedTreatmentVsProcedure": false,
    "showedSocialProof": true,
    "madeComparisons": false,
    "presentedCompleteProtocol": true,
    "usedIndividualization": false
  },
  "closingAnalysis": {
    "presentedFullPrice": true,
    "offeredFacilities": true,
    "closedWithConviction": false,
    "scheduledReturn": false
  },
  "behavioralProfileAnalysis": {
    "detectedProfile": "I - Influente",
    "profileIndicators": ["fala muito", "busca validação"],
    "adaptationAnalysis": "Médico não adaptou comunicação",
    "fatalMismatch": "Sim. Paciente I precisa de atenção e validação, mas médico foi técnico demais",
    "howToSellToThisProfile": {
      "dos": ["Use histórias de sucesso", "Mostre fotos de resultados"],
      "donts": ["Não seja muito técnico", "Não apresse"],
      "exampleScript": "Script de exemplo adaptado ao perfil"
    }
  },
  "phaseByPhaseAnalysis": [
    {
      "stepNumber": 1,
      "stepName": "Primeira Impressão e Preparação",
      "score": 7,
      "rating": "Bom",
      "strengths": ["Recepção calorosa", "Usou nome do paciente"],
      "weaknesses": ["Não ofereceu água/café", "Não demonstrou preparo prévio"],
      "whatHappened": "Médico recebeu o paciente com sorriso e utilizou o nome dele 2 vezes durante a introdução",
      "coachingNote": "Olá Maria! Seja muito bem-vinda! Que bom te ter aqui. Você já tomou água lá na recepção? Deixa eu te oferecer um café. Ah, eu vi no seu Instagram que você adora viajar, que legal! Onde foi sua última viagem?",
      "impact": "Primeira impressão positiva mas sem diferencial que gerasse conexão imediata"
    },
    {
      "stepNumber": 2,
      "stepName": "Conexão Genuína",
      "score": 4,
      "rating": "Precisa Melhorar",
      "strengths": ["Tentou conversar sobre assuntos pessoais"],
      "weaknesses": ["Duração insuficiente (apenas 3 minutos)", "Perguntas fechadas", "Sem validação emocional"],
      "whatHappened": "Médico fez apenas perguntas superficiais por 3 minutos, sem aprofundamento",
      "coachingNote": "Maria, antes de falarmos sobre sua queixa, quero te conhecer um pouquinho melhor, tá? Como foi seu dia hoje? Você veio direto do trabalho? Ah que legal! E você trabalha com o quê? E quando sobra um tempinho livre, o que você gosta de fazer para relaxar? Imagino que seja puxado, né? Você é casada? Tem filhos?",
      "impact": "Paciente não se abriu emocionalmente, mantendo postura defensiva durante toda consulta"
    },
    {
      "stepNumber": 3,
      "stepName": "Mapeamento - Pergunta 1: Dores",
      "score": 6,
      "rating": "Moderado",
      "strengths": ["Fez a pergunta de dores"],
      "weaknesses": ["Não aprofundou", "Não usou frequência emocional baixa"],
      "whatHappened": "Médico perguntou sobre o incômodo mas não explorou o impacto emocional",
      "coachingNote": "Maria, o que mais tem te incomodado no seu rosto? E o que você SENTE com isso? Como isso IMPACTA você no dia a dia? Tem quanto tempo que isso te incomoda? Seu marido ou família já comentou algo sobre isso?",
      "impact": "Perdeu oportunidade de acessar a dor emocional real do paciente"
    },
    {
      "stepNumber": 4,
      "stepName": "Mapeamento - Pergunta 2: Desejos",
      "score": 2,
      "rating": "Crítico",
      "strengths": [],
      "weaknesses": ["Não fez a pergunta", "Não explorou desejos", "Não usou frequência emocional alta"],
      "whatHappened": "Médico pulou completamente esta etapa, não perguntou sobre desejos e aspirações",
      "coachingNote": "E quando você se imagina resolvendo isso, Maria, o que você mais quer sentir? Como você se vê? O que isso vai mudar na sua vida? O que você vai poder fazer que hoje não faz? Como você imagina se sentindo depois?",
      "impact": "CRÍTICO - Sem mapear desejos, o paciente não visualizou o resultado positivo"
    },
    {
      "stepNumber": 5,
      "stepName": "Mapeamento - Pergunta 3: Nível de Consciência",
      "score": 7,
      "rating": "Bom",
      "strengths": ["Perguntou sobre pesquisas anteriores", "Identificou nível de conhecimento"],
      "weaknesses": ["Não explorou expectativas"],
      "whatHappened": "Médico perguntou se paciente já havia pesquisado sobre tratamentos",
      "coachingNote": "Maria, você já chegou aqui pensando em algum procedimento específico que gostaria de fazer? Ou veio mais para entender as possibilidades e o que seria ideal para você? Você pesquisou em mais algum lugar? Conversou com outros profissionais?",
      "impact": "Identificou nível de consciência mas não ajustou abordagem às expectativas"
    },
    {
      "stepNumber": 6,
      "stepName": "Mapeamento - Pergunta 4: Histórico",
      "score": 8,
      "rating": "Bom",
      "strengths": ["Perguntou sobre experiências anteriores", "Validou experiências negativas"],
      "weaknesses": ["Não explorou aprendizados"],
      "whatHappened": "Médico investigou tratamentos anteriores e validou experiências ruins do paciente",
      "coachingNote": "E você gostou desse resultado da toxina, Maria? O que mais te agradou? E o que você aprendeu com essa experiência? Alguma coisa que te deixou mais segura ou com algum receio?",
      "impact": "Criou confiança ao validar experiências mas perdeu insights valiosos"
    },
    {
      "stepNumber": 7,
      "stepName": "Mapeamento - Pergunta 5: Receios/Medos",
      "score": 3,
      "rating": "Crítico",
      "strengths": ["Perguntou sobre medos"],
      "weaknesses": ["Não aprofundou", "Não validou medos", "Resposta superficial"],
      "whatHappened": "Médico fez pergunta sobre medos mas não explorou nem validou as preocupações",
      "coachingNote": "Maria, e o que mais te preocupa em fazer um tratamento? Existe algum medo? Você tem medo de cirurgia? De anestesia? De dor? Do resultado? Eu entendo perfeitamente. Esse é um receio super comum e muito válido, viu?",
      "impact": "Medos não resolvidos criaram barreira invisível no fechamento"
    },
    {
      "stepNumber": 8,
      "stepName": "Direcionamento - Individualização",
      "score": 2,
      "rating": "Crítico",
      "strengths": [],
      "weaknesses": ["Não usou palavras exatas do paciente", "Apresentação genérica"],
      "whatHappened": "Médico apresentou protocolo com linguagem técnica genérica",
      "coachingNote": "Então Maria, o protocolo que vou criar para você vai fazer você se sentir DESCANSADA novamente. Você vai olhar no espelho e ver a Maria REJUVENESCIDA, vai poder tirar foto SEM MEDO, e as pessoas vão te elogiar dizendo que você está LINDA e JOVEM. Usando suas próprias palavras.",
      "impact": "CRÍTICO - Paciente não se viu na solução apresentada"
    },
    {
      "stepNumber": 9,
      "stepName": "Direcionamento - Posicionamento de Resultado",
      "score": 5,
      "rating": "Moderado",
      "strengths": ["Mostrou fotos de antes e depois"],
      "weaknesses": ["Fotos não eram similares ao caso", "Sem vídeos de depoimentos"],
      "whatHappened": "Médico mostrou fotos mas de casos muito diferentes do paciente",
      "coachingNote": "Maria, deixa eu te PROVAR que isso funciona. Olha essa paciente aqui, ela tinha EXATAMENTE a mesma preocupação que você. Vê essa foto de antes? Olha a expressão cansada. Agora olha ela 3 meses depois. Percebe como ficou natural? As pessoas falam 'Nossa, você está linda!' É esse resultado que quero para VOCÊ.",
      "impact": "Paciente não se identificou com os resultados mostrados"
    },
    {
      "stepNumber": 10,
      "stepName": "Direcionamento - Educação",
      "score": 4,
      "rating": "Precisa Melhorar",
      "strengths": ["Explicou que não é procedimento isolado"],
      "weaknesses": ["Explicação muito técnica", "Não comparou com concorrência"],
      "whatHappened": "Médico tentou explicar diferença entre tratamento e procedimento mas foi muito técnico",
      "coachingNote": "Maria, não é um procedimento isolado, é um TRATAMENTO completo. É como construir uma casa: você não faz só o telhado, precisa da base, das paredes, tudo trabalhando junto. Aqui é a mesma coisa, trabalhamos todas as camadas da pele para um resultado completo e natural.",
      "impact": "Paciente não entendeu completamente o valor agregado"
    },
    {
      "stepNumber": 11,
      "stepName": "Direcionamento - Demonstração de Provas",
      "score": 6,
      "rating": "Moderado",
      "strengths": ["Mostrou alguns depoimentos"],
      "weaknesses": ["Poucos depoimentos", "Não mostrou provas sociais fortes"],
      "whatHappened": "Médico mostrou 2 depoimentos escritos rapidamente",
      "coachingNote": "Maria, olha esses depoimentos de pacientes que fizeram o mesmo protocolo. Vê esse vídeo aqui? Ela estava com a mesma preocupação que você e olha o resultado. Tenho vários casos assim para te mostrar, todos com resultados naturais.",
      "impact": "Prova social insuficiente para gerar confiança plena"
    },
    {
      "stepNumber": 12,
      "stepName": "Direcionamento - Comparação",
      "score": 1,
      "rating": "Crítico",
      "strengths": [],
      "weaknesses": ["Não fez comparações", "Não explicou diferencial"],
      "whatHappened": "Médico não comparou opção premium com alternativas mais baratas",
      "coachingNote": "Maria, vou ser sincera com você. Tem lugares que oferecem opções mais baratas, mas sabe o que acontece? O produto é de qualidade inferior, o resultado dura menos, e você acaba gastando MAIS refazendo. Aqui eu trabalho com produtos premium que duram mais e ficam naturais. É investir certo desde o início.",
      "impact": "CRÍTICO - Paciente não entendeu por que pagar mais"
    },
    {
      "stepNumber": 13,
      "stepName": "Direcionamento - Apresentação do Protocolo",
      "score": 7,
      "rating": "Bom",
      "strengths": ["Apresentou protocolo detalhado", "Explicou cada sessão"],
      "weaknesses": ["Muito técnico", "Não conectou com desejos do paciente"],
      "whatHappened": "Médico detalhou o protocolo sessão por sessão mas com linguagem técnica",
      "coachingNote": "Na primeira sessão, Maria, vamos trabalhar essa questão que te incomoda tanto de parecer cansada. Na segunda, vamos refinar e você já vai começar a receber os elogios que tanto quer. E na terceira, finalizamos para você se sentir completamente confiante e rejuvenescida, como você me disse que deseja.",
      "impact": "Paciente entendeu o processo mas não sentiu emoção"
    },
    {
      "stepNumber": 14,
      "stepName": "Negociação - Estrutura de Preço",
      "score": 5,
      "rating": "Moderado",
      "strengths": ["Apresentou valor e parcelamento"],
      "weaknesses": ["Fechamento sem convicção", "Não criou urgência"],
      "whatHappened": "Médico apresentou preço de forma tímida e perguntou se paciente queria pensar",
      "coachingNote": "O investimento para o protocolo completo é de R$ 8.000,00. Posso parcelar em até 6 vezes sem juros para você, ficando R$ 1.333 por mês. Como ficaria bom para você, Maria? Quando você quer começar sua transformação?",
      "impact": "Falta de convicção transmitiu insegurança e permitiu objeção"
    },
    {
      "stepNumber": 15,
      "stepName": "Recorrência - Planejamento de Retorno",
      "score": 0,
      "rating": "Crítico",
      "strengths": [],
      "weaknesses": ["Não agendou retorno", "Deixou paciente sair sem compromisso"],
      "whatHappened": "Médico não agendou retorno nem próxima consulta",
      "coachingNote": "Perfeito, Maria! Então vamos agendar seu retorno. Após a primeira sessão, você volta em 30 dias. Qual dia da semana funciona melhor para você? Deixa eu já bloquear na agenda para garantir seu horário.",
      "impact": "CRÍTICO - Perdeu completamente a oportunidade de recorrência"
    }
  ],
  "criticalErrors": [
    {
      "errorName": "Nome do erro",
      "severity": "Fatal/Grave/Moderada",
      "whatWasSaid": "O que foi dito",
      "whyItWasFatal": "Por que foi crítico",
      "whatShouldHaveBeenSaid": "O que deveria ter sido dito"
    }
  ],
  "rootCause": "Causa raiz principal da perda",
  "dominoEffect": {
    "narrativeExplanation": "Explicação do efeito dominó"
  },
  "correctionStrategy": {
    "immediatePriority": {
      "focusArea": "Área de foco",
      "reasonWhy": "Por que essa prioridade"
    },
    "trainingScripts": [
      {
        "scriptTitle": "Título do script",
        "situation": "Quando usar",
        "fullScript": "Script completo linha por linha"
      }
    ],
    "nextConsultationFocus": ["Foco 1", "Foco 2"],
    "lifeboatScript": {
      "whenToUse": "Momento de usar",
      "script": "Script salva-vidas completo"
    }
  },
  "qualityAssessment": {
    "isHighQuality": false,
    "reasoning": "Por que a venda foi/não foi de qualidade"
  }
}

IMPORTANTE:
1. Use linguagem PROFISSIONAL e TÉCNICA - NUNCA use emojis
2. Seja objetivo e direto
3. Forneça scripts completos e prontos para uso
4. Análise deve ser acionável e prática
5. Retorne APENAS o JSON, sem texto adicional antes ou depois
6. TODAS as 15 etapas devem estar presentes no array "phaseByPhaseAnalysis"
7. Cada etapa deve ter análise COMPLETA e DETALHADA

CRÍTICO - CAMPO "coachingNote":
O campo "coachingNote" deve SEMPRE conter a FRASE EXATA em PRIMEIRA PESSOA que o médico deveria ter dito ao paciente.
- NUNCA escreva "Deveria ter feito X" ou "O médico deveria Y"
- SEMPRE escreva como se fosse o médico falando diretamente: "Maria, o que mais tem te incomodado no seu rosto?"
- Use o NOME DO PACIENTE na frase
- A frase deve ser PRONTA para ser REPETIDA literalmente ao cliente
- Exemplo CORRETO: "Maria, quando você se imagina resolvendo isso, o que você mais quer sentir? Como você se vê?"
- Exemplo ERRADO: "Deveria ter perguntado sobre os desejos da paciente"
`;
}

function generateCompletedSalePrompt(params: {
  patientName: string;
  duration?: string;
  protocolSold?: string;
  saleValue?: number;
  transcription: string;
}): string {
  return `Você é um especialista em análise de vendas consultivas para medicina estética, com expertise em análise de performance, psicologia de vendas, SPIN Selling e perfis comportamentais DISC.

Sua análise deve ser honesta, acionável e focada em identificar se a venda foi de qualidade ou se aconteceu por pressão.

REGRAS ABSOLUTAS:
- NUNCA use emojis em nenhuma parte da análise
- Use apenas linguagem técnica e profissional
- Análise completa de TODAS as 15 etapas obrigatoriamente

CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Protocolo vendido: ${params.protocolSold || 'Não informado'}
- Valor: R$ ${params.saleValue || 'Não informado'}
- Resultado: VENDA REALIZADA

TRANSCRIÇÃO DA CONSULTA
${params.transcription}

CRITÉRIO CRÍTICO: VENDA DE QUALIDADE vs VENDA POR PRESSÃO

VENDA DE QUALIDADE (Desejável):
- Conexão emocional genuína (mínimo 10 minutos)
- Mapeamento completo (5 perguntas feitas E aprofundadas)
- Paciente convencido pelo VALOR, não pela pressão
- Baixo risco de cancelamento/no-show

VENDA POR PRESSÃO (Problemática):
- Conexão superficial ou inexistente
- Perguntas de mapeamento não feitas ou não aprofundadas
- Foco em preço e urgência ao invés de valor
- Alto risco de cancelamento/no-show/arrependimento

Use os mesmos critérios de análise do prompt de venda perdida, mas avalie também:

QUALIDADE DA VENDA:
1. A venda aconteceu por construção de valor ou pressão?
2. Qual o risco de cancelamento? (Baixo/Médio/Alto)
3. O paciente saiu realmente convencido ou pressionado?

FORMATO DE RESPOSTA JSON

Use a mesma estrutura do prompt de venda perdida, mas adicione:

{
  "qualityAssessment": {
    "isHighQuality": true/false,
    "reasoning": "Explicação objetiva",
    "cancellationRisk": "Baixo/Médio/Alto",
    "patientConviction": "Descrição do nível de convencimento"
  }
}

IMPORTANTE:
1. Use linguagem PROFISSIONAL e TÉCNICA - NUNCA use emojis
2. Seja honesto sobre a qualidade da venda
3. Se a venda foi por pressão, trate como "venda de baixa qualidade"
4. Forneça scripts de follow-up para reforçar o valor e reduzir risco de cancelamento
5. Retorne APENAS o JSON, sem texto adicional antes ou depois
6. TODAS as 15 etapas devem estar presentes no array "phaseByPhaseAnalysis"
7. Cada etapa deve ter análise COMPLETA e DETALHADA

===================================================================
ATENÇÃO: O array "phaseByPhaseAnalysis" DEVE conter EXATAMENTE 15 objetos
Cada objeto representa uma das 15 etapas da metodologia
Se alguma etapa não foi executada, indique score 0 e rating "Crítico"
NUNCA omita etapas - análise incompleta será rejeitada
===================================================================
`;
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE ANÁLISE
// ============================================================================

export async function analyzeConsultationDirect(
  formData: PerformanceAnalysisFormData
): Promise<AIAnalysisResponse> {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  console.log('[Direct AI Service] ========================================');
  console.log('[Direct AI Service] 🚀 INICIANDO ANÁLISE DE CONSULTA');
  console.log('[Direct AI Service] ========================================');
  console.log('[Direct AI Service] Dados recebidos:', {
    patient_name: formData.patient_name,
    outcome: formData.outcome,
    ticket_value: formData.ticket_value,
    transcript_length: formData.transcript?.length || 0,
    file_name: formData.file_name,
  });

  if (!formData.transcript || formData.transcript.trim().length === 0) {
    console.error('[Direct AI Service] ❌ ERRO: Transcrição vazia!');
    return {
      success: false,
      error: 'A transcrição está vazia. Por favor, forneça o conteúdo da consulta para análise.',
    };
  }

  console.log('[Direct AI Service] ✅ Transcrição presente:', formData.transcript.substring(0, 200) + '...');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log('[Direct AI Service] ========================================');
      console.log(`[Direct AI Service] 🔄 Tentativa ${attempt}/${MAX_RETRIES}`);
      console.log('[Direct AI Service] ========================================');

      if (!GEMINI_API_KEY) {
        console.error('[Direct AI Service] ❌ GEMINI_API_KEY não configurada');
        throw new Error('GEMINI_API_KEY não configurada');
      }

      console.log('[Direct AI Service] ✅ API Key configurada');

      // Map outcome to format
      const outcomeMapping: Record<string, string> = {
        'Venda Perdida': 'venda_perdida',
        'Venda Realizada': 'venda_realizada',
      };

      const mappedOutcome = outcomeMapping[formData.outcome] || formData.outcome.toLowerCase().replace(' ', '_');

      // Generate prompt (com instruções adicionais de retry se necessário)
      let prompt: string;
      if (mappedOutcome === 'venda_perdida') {
        prompt = generateLostSalePrompt({
          patientName: formData.patient_name,
          duration: undefined,
          transcription: formData.transcript,
        });
      } else {
        prompt = generateCompletedSalePrompt({
          patientName: formData.patient_name,
          duration: undefined,
          protocolSold: undefined,
          saleValue: formData.ticket_value,
          transcription: formData.transcript,
        });
      }

      // Se não é a primeira tentativa, adicionar aviso sobre o erro anterior
      if (attempt > 1 && lastError) {
        prompt += `\n\n🚨 ATENÇÃO CRÍTICA - TENTATIVA ${attempt}/${MAX_RETRIES}:\n\nA análise anterior foi REJEITADA devido ao seguinte erro:\n"${lastError.message}"\n\n⚠️ VERIFIQUE ESPECIALMENTE:\n- O campo "stepName" DEVE estar presente em TODAS as 15 etapas\n- O campo "stepName" DEVE ter pelo menos 5 caracteres\n- Use os nomes exatos das etapas conforme o framework (ex: "Primeira Impressão e Preparação", "Conexão Genuína", etc.)\n- NÃO deixe campos vazios ou com valores como "", null, ou undefined\n\nPor favor, CORRIJA especificamente este problema e forneça uma análise COMPLETA e VÁLIDA com TODAS as 15 etapas preenchidas corretamente.`;
      }

      console.log('[Direct AI Service] 📤 Preparando chamada para Gemini API...');
      console.log('[Direct AI Service] Tamanho do prompt:', prompt.length, 'caracteres');

    // Call Gemini API directly
    console.log('[Direct AI Service] 🌐 Chamando Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.4, // Reduzido para mais consistência e precisão
          maxOutputTokens: 16384, // DOBRADO para garantir análise COMPLETA das 15 etapas
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Direct AI Service] ❌ Erro HTTP na API Gemini:', response.status);
      console.error('[Direct AI Service] ❌ Detalhes:', errorText);
      throw new Error(`Erro na API Gemini (${response.status}): ${errorText}`);
    }

    console.log('[Direct AI Service] ✅ Resposta HTTP OK');

    const geminiData = await response.json();
    console.log('[Direct AI Service] ✅ JSON parseado da resposta da API');
    console.log('[Direct AI Service] Estrutura da resposta:', {
      hasCandidates: !!geminiData.candidates,
      candidatesCount: geminiData.candidates?.length || 0,
    });

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('[Direct AI Service] ❌ Nenhum candidate na resposta');
      throw new Error('API Gemini não retornou nenhum resultado');
    }

    // Extract and clean response
    const responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('[Direct AI Service] ✅ Texto extraído da resposta:', responseText.length, 'caracteres');

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('[Direct AI Service] ✅ Texto limpo:', cleanedText.length, 'caracteres');

    // Parse JSON
    let analysisData;
    try {
      console.log('[Direct AI Service] Parseando JSON...');
      analysisData = JSON.parse(cleanedText);
      console.log('[Direct AI Service] ✅ JSON parseado com sucesso');
    } catch (parseError) {
      console.error('[Direct AI Service] ❌ Erro ao parsear JSON:', parseError);
      console.error('[Direct AI Service] ❌ Resposta (primeiros 1000 chars):', cleanedText.substring(0, 1000));
      throw new Error('Falha ao parsear resposta da IA: JSON inválido');
    }

    console.log('[Direct AI Service] Análise concluída com sucesso');
    console.log('[Direct AI Service] Estrutura do analysisData:', {
      hasPhaseByPhaseAnalysis: !!analysisData.phaseByPhaseAnalysis,
      phaseCount: analysisData.phaseByPhaseAnalysis?.length,
      hasBehavioralProfile: !!analysisData.behavioralProfileAnalysis,
      hasOverallPerformance: !!analysisData.overallPerformance,
      outcome: analysisData.outcome,
    });

    // ============================================================================
    // AUTO-CORREÇÃO: Preencher stepNames vazios com nomes padrão do framework
    // ============================================================================
    const STANDARD_STEP_NAMES = [
      'Primeira Impressão e Preparação',
      'Conexão Genuína',
      'Mapeamento - Pergunta 1: Dores',
      'Mapeamento - Pergunta 2: Desejos',
      'Mapeamento - Pergunta 3: Consciência',
      'Mapeamento - Pergunta 4: Histórico',
      'Mapeamento - Pergunta 5: Receios',
      'Individualização',
      'Posicionamento de Resultado',
      'Educação (Tratamento vs Procedimento)',
      'Demonstração de Provas',
      'Comparação (Barato que Sai Caro)',
      'Apresentação do Protocolo',
      'Estrutura de Preço e Fechamento',
      'Planejamento de Retorno'
    ];

    if (analysisData.phaseByPhaseAnalysis && Array.isArray(analysisData.phaseByPhaseAnalysis)) {
      for (let i = 0; i < analysisData.phaseByPhaseAnalysis.length; i++) {
        const step = analysisData.phaseByPhaseAnalysis[i];

        // Se stepName está vazio ou muito curto, usar nome padrão
        if (!step.stepName || step.stepName.trim().length < 5) {
          const fallbackName = STANDARD_STEP_NAMES[i] || `Etapa ${i + 1}`;
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo stepName vazio na etapa ${i + 1}: "${fallbackName}"`);
          step.stepName = fallbackName;
        }

        // Garantir que stepNumber está correto
        if (!step.stepNumber || step.stepNumber !== i + 1) {
          console.warn(`[Direct AI Service] ⚠️ Corrigindo stepNumber na etapa ${i + 1}: ${step.stepNumber} → ${i + 1}`);
          step.stepNumber = i + 1;
        }

        // Auto-corrigir campos críticos vazios com valores mínimos
        if (!step.whatHappened || step.whatHappened.trim().length < 30) {
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo whatHappened na etapa ${i + 1}`);
          step.whatHappened = 'Esta etapa não foi adequadamente executada ou analisada na transcrição fornecida.';
        }

        if (!step.coachingNote || step.coachingNote.trim().length < 50) {
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo coachingNote na etapa ${i + 1}`);
          step.coachingNote = 'Você precisa implementar esta etapa do framework de forma completa e estruturada conforme a metodologia.';
        }

        if (!step.impact || step.impact.trim().length < 20) {
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo impact na etapa ${i + 1}`);
          step.impact = 'Impacto não identificado na análise.';
        }

        if (typeof step.score !== 'number' || step.score < 0 || step.score > 10) {
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo score na etapa ${i + 1}: ${step.score} → 0`);
          step.score = 0;
        }

        if (!step.rating || !['Crítico', 'Precisa Melhorar', 'Moderado', 'Bom', 'Excelente'].includes(step.rating)) {
          console.warn(`[Direct AI Service] ⚠️ Auto-corrigindo rating na etapa ${i + 1}: "${step.rating}" → "Crítico"`);
          step.rating = 'Crítico';
        }

        // Garantir arrays existem
        if (!Array.isArray(step.strengths)) {
          step.strengths = [];
        }
        if (!Array.isArray(step.weaknesses)) {
          step.weaknesses = [];
        }
      }
    }

    // ============================================================================
    // VALIDAÇÃO CRÍTICA: Garantir que TODAS as 15 etapas estão presentes
    // ============================================================================
    if (!analysisData.phaseByPhaseAnalysis || !Array.isArray(analysisData.phaseByPhaseAnalysis)) {
      throw new Error('ERRO CRÍTICO: phaseByPhaseAnalysis não encontrado ou não é um array');
    }

    const stepsCount = analysisData.phaseByPhaseAnalysis.length;
    if (stepsCount !== 15) {
      console.error('[Direct AI Service] ❌ ERRO: Análise incompleta!');
      console.error(`[Direct AI Service] Esperado: 15 etapas, Recebido: ${stepsCount} etapas`);
      console.error('[Direct AI Service] Etapas recebidas:', analysisData.phaseByPhaseAnalysis.map((s: any) => `${s.stepNumber}: ${s.stepName}`));
      throw new Error(`ANÁLISE INCOMPLETA: Esperado 15 etapas, mas recebeu apenas ${stepsCount} etapas. A análise deve cobrir TODAS as 15 etapas da metodologia.`);
    }

    // Validar se todas as etapas têm conteúdo mínimo
    for (let i = 0; i < analysisData.phaseByPhaseAnalysis.length; i++) {
      const step = analysisData.phaseByPhaseAnalysis[i];
      const stepNum = i + 1;

      // Log detalhado da etapa para diagnóstico
      console.log(`[Direct AI Service] Validando etapa ${stepNum}:`, {
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        stepNameLength: step.stepName?.length || 0,
        allFields: Object.keys(step),
      });

      if (!step.stepName || step.stepName.trim().length < 5) {
        console.error(`[Direct AI Service] ❌ Erro na etapa ${stepNum}:`, JSON.stringify(step, null, 2));
        throw new Error(`Etapa ${stepNum}: stepName vazio ou muito curto (recebido: "${step.stepName || 'VAZIO'}")`);
      }

      if (!step.whatHappened || step.whatHappened.trim().length < 30) {
        throw new Error(`Etapa ${stepNum}: whatHappened muito curto (mínimo 30 caracteres)`);
      }

      if (!step.coachingNote || step.coachingNote.trim().length < 50) {
        throw new Error(`Etapa ${stepNum}: coachingNote muito curto (mínimo 50 caracteres). Deve ser uma frase direta em primeira pessoa.`);
      }

      if (!step.impact || step.impact.trim().length < 20) {
        throw new Error(`Etapa ${stepNum}: impact muito curto (mínimo 20 caracteres)`);
      }

      if (typeof step.score !== 'number' || step.score < 0 || step.score > 10) {
        throw new Error(`Etapa ${stepNum}: score inválido (deve ser 0-10)`);
      }

      if (!step.rating || !['Crítico', 'Precisa Melhorar', 'Moderado', 'Bom', 'Excelente'].includes(step.rating)) {
        throw new Error(`Etapa ${stepNum}: rating inválido`);
      }
    }

    console.log('[Direct AI Service] ✅ Validação completa: Todas as 15 etapas estão presentes e válidas');

    // ============================================================================
    // VALIDAÇÃO CRÍTICA: Garantir criticalErrors para VENDA PERDIDA
    // ============================================================================
    if (analysisData.outcome === 'Venda Perdida') {
      if (!analysisData.criticalErrors || !Array.isArray(analysisData.criticalErrors)) {
        throw new Error('VENDA PERDIDA: Array criticalErrors é obrigatório mas não foi encontrado');
      }

      if (analysisData.criticalErrors.length < 3) {
        throw new Error(`VENDA PERDIDA: Deve ter no mínimo 3 erros críticos, mas recebeu apenas ${analysisData.criticalErrors.length}`);
      }

      // Validar estrutura de cada erro crítico
      for (let i = 0; i < analysisData.criticalErrors.length; i++) {
        const err = analysisData.criticalErrors[i];
        const errNum = i + 1;

        if (!err.errorName || err.errorName.trim().length < 5) {
          throw new Error(`Erro crítico ${errNum}: errorName vazio ou muito curto`);
        }

        if (!err.severity || !['Fatal', 'Grave', 'Moderada'].includes(err.severity)) {
          throw new Error(`Erro crítico ${errNum}: severity inválida (deve ser Fatal, Grave ou Moderada)`);
        }

        if (!err.whatWasSaid || err.whatWasSaid.trim().length < 10) {
          throw new Error(`Erro crítico ${errNum}: whatWasSaid muito curto`);
        }

        if (!err.whyItWasFatal || err.whyItWasFatal.trim().length < 20) {
          throw new Error(`Erro crítico ${errNum}: whyItWasFatal muito curto (mínimo 20 caracteres)`);
        }

        if (!err.whatShouldHaveBeenSaid || err.whatShouldHaveBeenSaid.trim().length < 30) {
          throw new Error(`Erro crítico ${errNum}: whatShouldHaveBeenSaid muito curto (mínimo 30 caracteres)`);
        }
      }

      console.log(`[Direct AI Service] ✅ Validação de erros críticos: ${analysisData.criticalErrors.length} erros identificados`);
    }

    // Map v3 structure to existing PerformanceAnalysisData
    const performanceData: Partial<PerformanceAnalysisData> = {
      outcome: formData.outcome,
      is_low_quality_sale: analysisData.qualityAssessment?.isHighQuality === false || false,
      ticket_value: formData.ticket_value,

      // Map v3 overall performance to v2 structure
      overall_performance: {
        score: analysisData.overallPerformance?.score || 0,
        rating: normalizePerformanceRating(analysisData.overallPerformance?.rating || 'Crítico'),
        summary: analysisData.overallPerformance?.mainConclusion || '',
      },

      // Map v3 behavioral profile to v2 structure
      behavioral_profile_analysis: {
        profile: normalizeBehavioralProfile(analysisData.behavioralProfileAnalysis?.detectedProfile || 'Não Identificado'),
        justification: analysisData.behavioralProfileAnalysis?.adaptationAnalysis || '',
        doctor_adaptation_analysis: analysisData.behavioralProfileAnalysis?.fatalMismatch || '',
        communication_recommendations: {
          phrases: analysisData.behavioralProfileAnalysis?.howToSellToThisProfile?.dos || [],
          keywords: analysisData.behavioralProfileAnalysis?.profileIndicators || [],
        },
      },

      // Map v3 phases (15 steps)
      phases: mapV3PhasesToV2(analysisData.phaseByPhaseAnalysis || []),

      // Map v3 lost sale details
      lost_sale_details: (analysisData.outcome === 'Venda Perdida' || analysisData.qualityAssessment?.isHighQuality === false) ? {
        error_pattern: (analysisData.criticalErrors && Array.isArray(analysisData.criticalErrors))
          ? analysisData.criticalErrors.reduce((acc: any, err: any) => {
              const severity = err.severity || 'Moderada';
              if (severity === 'Fatal') acc.critical = (acc.critical || 0) + 1;
              else if (severity === 'Grave') acc.deficient = (acc.deficient || 0) + 1;
              else if (severity === 'Moderada') acc.good = (acc.good || 0) + 1;
              return acc;
            }, { excellent: 0, good: 0, deficient: 0, critical: 0 })
          : { excellent: 0, good: 0, deficient: 0, critical: 0 },

        critical_errors: (analysisData.criticalErrors || []).map((err: any, index: number) => ({
          error_order: index + 1,
          error_title: err.errorName,
          what_happened: err.whatWasSaid,
          why_critical: err.whyItWasFatal,
          coaching_narrative: err.whatShouldHaveBeenSaid,
        })),

        domino_effect: analysisData.dominoEffect?.narrativeExplanation || '',
        exact_moment: analysisData.rootCause || '',
        root_cause: analysisData.rootCause || '',

        correction_strategy: {
          immediate_focus: {
            description: analysisData.correctionStrategy?.immediatePriority?.reasonWhy || '',
            training_scripts: (analysisData.correctionStrategy?.trainingScripts || []).map((script: any) => ({
              script_title: script.scriptTitle,
              script_content: script.fullScript,
              practice_recommendation: '10x',
            })),
          },
          next_call_focus: {
            description: (analysisData.correctionStrategy?.nextConsultationFocus || []).join('; '),
            training_scripts: [],
          },
          lifesaver_script: analysisData.correctionStrategy?.lifeboatScript?.script || '',
        },

        behavioral_report: {
          how_doctor_sold: analysisData.behavioralProfileAnalysis?.adaptationAnalysis || '',
          how_should_sell_to_profile: analysisData.behavioralProfileAnalysis?.howToSellToThisProfile?.exampleScript || '',
        },

        identified_strengths: analysisData.identifiedStrengths || [],
        errors_for_correction: analysisData.errorsForCorrection || [],
        final_coaching_plan: {
          pre_call_checklist: (analysisData.finalCoachingPlan?.preCallChecklist || []).map((item: any) => ({
            item: item.item || item,
            why: item.why || '',
            how: item.how || '',
          })),
          during_call_checklist: (analysisData.finalCoachingPlan?.duringCallChecklist || []).map((item: any) => ({
            item: item.item || item,
            why: item.why || '',
            how: item.how || '',
          })),
          post_call_checklist: (analysisData.finalCoachingPlan?.postCallChecklist || []).map((item: any) => ({
            item: item.item || item,
            why: item.why || '',
            how: item.how || '',
          })),
        },
      } : undefined,

      indication_baseline: {
        emotional_connection_extract: analysisData.frequencyAnalysis?.connectionPhase?.details || '',
        value_building_extract: analysisData.directioningAnalysis?.usedIndividualization ? 'Sim' : 'Não',
        social_proof_extract: analysisData.directioningAnalysis?.showedSocialProof ? 'Sim' : 'Não',
      },

      critical_observations: {
        essential_control_points: [
          {
            point_description: 'Conexão Emocional (10min)',
            was_observed: analysisData.frequencyAnalysis?.connectionPhase?.rating === 'Bom',
          },
          {
            point_description: 'Mapeamento Completo (5 Perguntas)',
            was_observed: (analysisData.mappingAnalysis?.overallMappingScore || 0) >= 35,
          },
          {
            point_description: 'Uso das Palavras Exatas do Paciente',
            was_observed: analysisData.directioningAnalysis?.usedExactPatientsWords || false,
          },
        ],
        fatal_errors: (analysisData.criticalErrors || [])
          .filter((err: any) => err.severity === 'Fatal')
          .map((err: any) => ({
            error_description: err.errorName,
            was_observed: true,
          })),
      },
    };

      // Se chegou aqui, a análise está válida!
      console.log(`[Direct AI Service] ✅ Análise completa e válida na tentativa ${attempt}!`);
      return {
        success: true,
        data: performanceData as PerformanceAnalysisData,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Direct AI Service] ❌ Erro na tentativa ${attempt}/${MAX_RETRIES}:`, lastError.message);

      // Se ainda tiver tentativas, aguardar antes de tentar novamente
      if (attempt < MAX_RETRIES) {
        const waitTime = 2000 * attempt; // 2s, 4s, 6s
        console.log(`[Direct AI Service] ⏳ Aguardando ${waitTime}ms antes de refazer a análise...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        console.log(`[Direct AI Service] 🔄 Refazendo análise com correções...`);
      }
    }
  }

  // Todas as tentativas falharam
  console.error(`[Direct AI Service] ❌ Falha após ${MAX_RETRIES} tentativas`);
  return {
    success: false,
    error: `Falha ao gerar análise completa após ${MAX_RETRIES} tentativas. Último erro: ${lastError?.message || 'Desconhecido'}`,
  };
}

// ============================================================================
// MAPEAMENTO DE FASES V3 PARA V2
// ============================================================================

function mapV3PhasesToV2(v3Steps: any[]): any[] {
  console.log('[mapV3PhasesToV2] Recebeu steps:', v3Steps?.length || 0);
  const phases: any[] = [];

  // Phase 1: Preparação e Conexão (steps 1-2)
  const phase1Steps = v3Steps.filter((s: any) => s.stepNumber >= 1 && s.stepNumber <= 2);
  if (phase1Steps.length > 0) {
    phases.push({
      phase_number: 1,
      phase_title: 'Preparação e Conexão',
      steps: phase1Steps.map(mapV3StepToV2),
    });
  }

  // Phase 2: Mapeamento (steps 3-7)
  const phase2Steps = v3Steps.filter((s: any) => s.stepNumber >= 3 && s.stepNumber <= 7);
  if (phase2Steps.length > 0) {
    phases.push({
      phase_number: 2,
      phase_title: 'Mapeamento (5 Perguntas)',
      steps: phase2Steps.map(mapV3StepToV2),
    });
  }

  // Phase 3: Direcionamento (steps 8-13)
  const phase3Steps = v3Steps.filter((s: any) => s.stepNumber >= 8 && s.stepNumber <= 13);
  if (phase3Steps.length > 0) {
    phases.push({
      phase_number: 3,
      phase_title: 'Direcionamento',
      steps: phase3Steps.map(mapV3StepToV2),
    });
  }

  // Phase 4: Negociação e Recorrência (steps 14-15)
  const phase4Steps = v3Steps.filter((s: any) => s.stepNumber >= 14 && s.stepNumber <= 15);
  if (phase4Steps.length > 0) {
    phases.push({
      phase_number: 4,
      phase_title: 'Negociação e Recorrência',
      steps: phase4Steps.map(mapV3StepToV2),
    });
  }

  console.log('[mapV3PhasesToV2] Total de fases mapeadas:', phases.length);
  return phases;
}

function mapV3StepToV2(v3Step: any): any {
  return {
    step_number: v3Step.stepNumber,
    step_title: v3Step.stepName,
    score: v3Step.score,
    rating: normalizePerformanceRating(v3Step.rating),
    what_did_well: v3Step.strengths || [],
    improvement_points: v3Step.weaknesses || [],
    coaching_narrative: {
      what_was_said: v3Step.whatHappened || '',
      what_should_have_been_said: v3Step.coachingNote || '',
      crucial_differences: [v3Step.impact || ''],
    },
  };
}
