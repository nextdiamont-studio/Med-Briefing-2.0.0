// ============================================================================
// PROMPT TEMPLATES v3.0 - METODOLOGIA OFICIAL COMPLETA
// Sistema de templates baseado nos 6 Passos de Vendas Consultivas
// ============================================================================

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ============================================================================
// FRAMEWORK v3.0 - 15 ETAPAS
// ============================================================================

export const FRAMEWORK_V3_15_STEPS = {
  version: '3.0',
  methodology: 'Vendas Consultivas - Metodologia Oficial Completa (6 Passos)',
  totalSteps: 15,
  maxScore: 150,
  steps: [
    { number: 1, name: 'Primeira Impressão & Preparação' },
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
// TEMPLATE: ANÁLISE DE VENDA PERDIDA v3.0
// ============================================================================

export function generateLostSalePromptV3(params: {
  patientName: string;
  duration?: string;
  transcription: string;
}): string {
  return `Você é um especialista em análise de vendas consultivas para medicina estética, com expertise em análise de performance, psicologia de vendas, SPIN Selling e perfis comportamentais DISC.

Sua análise deve ser honesta, acionável e focada em fornecer scripts prontos para correção imediata.

IMPORTANTE: Use linguagem profissional e minimalista. NÃO use emojis em nenhuma parte da análise. Use apenas texto objetivo e direto.

# CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Resultado: VENDA PERDIDA

# TRANSCRIÇÃO DA CONSULTA
${params.transcription}

# METODOLOGIA OFICIAL - 6 PASSOS DE VENDAS CONSULTIVAS (15 ETAPAS)

## PASSO 1: PRIMEIRA IMPRESSÃO & PREPARAÇÃO (Etapa 1)
**AVALIE:**
- Médico preparou-se ANTES da consulta? (Olhou Instagram, leu ficha cadastral, identificou pontos em comum?)
- Recepção foi calorosa e energética?
- Usou o NOME do paciente repetidamente?
- Ofereceu água/café?

## PASSO 2: CONEXÃO GENUÍNA (Etapa 2) - CRÍTICO: 10 MINUTOS OBRIGATÓRIOS

**Padrão Correto:**
1. Perguntas ABERTAS - nunca sim/não
2. Estratégia escolhida:
   - FAMÍLIA: "Você é casada? Tem filhos? Como se chamam? Quantos anos?"
   - INSTAGRAM: "Vi que o Miguel fez aniversário. Que festa linda."
   - PACIENTE FECHADO: "Percebi que você está tensa. É normal. Pode ficar tranquila."
3. Validação emocional constante: "Imagino que seja puxado", "Entendo você"
4. Transição natural: "Agora que te conheço, deixa eu entender sua queixa"

**AVALIE:**
- Fez perguntas abertas ou fechadas (sim/não)?
- Quanto tempo durou? (Mínimo 10 minutos)
- Paciente se abriu ou ficou fechado?
- Houve validação emocional genuína?
- Score: 0-10

## PASSO 3: MAPEAMENTO - 5 PERGUNTAS OBRIGATÓRIAS (Etapas 3-7)

### ETAPA 3 - PERGUNTA 1: DORES (Frequência Emocional BAIXA)

**Script Correto:**
"${params.patientName}, o que mais tem te incomodado no seu [rosto/corpo]?"

**Aprofundamento OBRIGATÓRIO:**
- "E o que você SENTE com isso?"
- "Como isso IMPACTA você no dia a dia?"
- "Tem quanto tempo que isso te incomoda?"
- "Seu marido/família já comentou algo?"

**Frequência Emocional Correta:**
- TOM BAIXO, voz séria
- Olho no olho
- SEM sorriso (respeitar a dor)
- Postura empática

**Objetivo:** Extrair frases emocionais EXATAS:
- "Me sinto mais velha"
- "Evito tirar foto de lado"
- "Meu marido comentou que estou envelhecendo"

**AVALIE:**
- Médico fez a pergunta principal de dores? (Sim/Não)
- Aprofundou emocionalmente ou ficou superficial?
- Usou frequência baixa (tom sério) ou foi neutro/alto?
- Capturou as palavras exatas do paciente para usar depois?
- Score: 0-10

### ETAPA 4 - PERGUNTA 2: DESEJOS (Frequência Emocional ALTA)

**Script Correto:**
"E ${params.patientName}, o que você QUERIA melhorar? Como você se IMAGINA depois?"

**Aprofundamento OBRIGATÓRIO:**
- "Nossa. Que legal. Já estou imaginando algumas coisas aqui." (EMPOLGADO)
- "Como você se SENTIRIA com isso?"
- "Como seria pra você?"

**Frequência Emocional Correta:**
- TOM ALTO, energia elevada
- SORRINDO, empolgado
- Linguagem corporal aberta
- Fazendo paciente SONHAR acordado

**Objetivo:** Capturar palavras de DESEJO:
- "Mais contorno"
- "Mais confiante"
- "Olhar mais jovem"

**AVALIE:**
- Médico fez a pergunta de desejos? (Sim/Não)
- Aprofundou fazendo paciente visualizar?
- Usou frequência alta (empolgado, sorrindo)?
- Fez paciente sonhar acordado?
- Score: 0-10

### ETAPA 5 - PERGUNTA 3: NÍVEL DE CONSCIÊNCIA

**Script Correto:**
"Você já chegou aqui pensando em algum procedimento específico? Já pesquisou?"

**3 Tipos de Paciente:**
1. **ANALÍTICO:** Já foi em 3+ médicos, comparando → Educar sobre "tratamento vs procedimento"
2. **ABERTO:** Não sabe nada → Educar do zero (melhor cenário!)
3. **INFLUENCIADO:** "Vi no Instagram que 2 ampolas é ideal" → Educar que cada rosto é único

**AVALIE:**
- Médico perguntou sobre conhecimento prévio?
- Identificou o tipo de paciente?
- Adaptou o discurso ao tipo?
- Score: 0-10

### ETAPA 6 - PERGUNTA 4: HISTÓRICO (Descobrir Objeções Escondidas)

**Script Correto:**
"Você já fez algum procedimento estético antes? Como foi?"

**Se SIM:** "Você gostou do resultado? Teve algum problema?"
**Se NÃO:** "Você tem algum receio de fazer pela primeira vez?"

**Objetivo:** Descobrir OBJEÇÕES que ela NÃO contaria espontaneamente:
- "Achei pesado" = MEDO de não ficar natural
- "Não durou nada" = FRUSTRAÇÃO com durabilidade
- "Doeu muito" = MEDO de dor

**AVALIE:**
- Médico perguntou sobre histórico?
- Descobriu objeções escondidas?
- Anotou para quebrar antes do preço?
- Score: 0-10

### ETAPA 7 - PERGUNTA 5: RECEIOS/MEDOS

**Script Correto:**
"${params.patientName}, pra gente fechar aqui: você tem algum RECEIO? Alguma DÚVIDA sobre procedimentos estéticos?"

**Medos Comuns:**
- Medo de não ficar natural
- Medo de dor
- Medo de não durar
- Medo de gastar e não ter resultado

**AVALIE:**
- Médico perguntou sobre receios?
- Deixou paciente expor todos os medos?
- Anotou para quebrar antes do preço?
- Score: 0-10

**SCORE TOTAL DO MAPEAMENTO: 0-50 pontos**

## PASSO 4: DIRECIONAMENTO - 6 SUB-PASSOS (Etapas 8-13)

### ETAPA 8 - INDIVIDUALIZAÇÃO

**Script Correto:**
"${params.patientName}, com o acesso ao conhecimento hoje (Instagram, Google), algumas pacientes chegam dizendo: 'Doutora, quero 2 ampolas porque a influencer disse'.

Mas ${params.patientName}, conforme você acabou de me citar - [USAR DORES EXATAS DELA], [USAR DESEJOS EXATOS DELA] - eu vou criar um tratamento INDIVIDUALIZADO e PERSONALIZADO para VOCÊ, não um copia e cola. Faz sentido?"

**AVALIE:**
- Médico falou sobre individualização?
- Usou as palavras exatas do mapeamento?
- Diferenciou de "influencers" e "copia e cola"?
- Score: 0-10

### ETAPA 9 - POSICIONAMENTO DE RESULTADO

**Script Correto:**
"${params.patientName}, tem muita franquia por aí só preocupada em bater meta. Eu escolhi um posicionamento DIFERENTE: minha carreira se resume em entregar RESULTADO de verdade. A partir de hoje, eu quero ser a SUA doutora, cuidar de você, da sua família. Esse é meu real desejo."

**AVALIE:**
- Médico se diferenciou da concorrência?
- Focou em RESULTADO (não em dinheiro)?
- Criou vínculo: "quero ser SUA doutora"?
- Score: 0-10

### ETAPA 10 - EDUCAÇÃO (Tratamento vs Procedimento)

**Método Correto:** EXEMPLO PRÁTICO - não teoria!

**Script Clássico "Conta de 1 a 10":**
"${params.patientName}, se você fizer somente o Botox terço superior e nada mais, não vai adiantar nada. Vou te provar.

[Dá espelho] Conta pra mim de 1 até 10 olhando no espelho.

[Paciente conta]

Percebe que você mexeu MUITO MAIS a parte INFERIOR? Então qual a lógica de tratar só a superior que você usa menos? Não faz sentido, né?

Como eu quero te entregar resultado de VERDADE, nós só conseguimos isso com TRATAMENTO. Sessão após sessão, etapa após etapa."

**AVALIE:**
- Médico educou sobre tratamento vs procedimento?
- Usou exemplo PRÁTICO ou só teoria?
- Plantou seed: "sessão após sessão"?
- Score: 0-10

### ETAPA 11 - DEMONSTRAÇÃO DE PROVAS (Antes/Depois)

**Método Correto:** Mostrar foto + CONTAR HISTÓRIA EMOCIONAL

**Script Correto:**
"${params.patientName}, olha essa paciente aqui [mostra foto ANTES com empatia, tom baixo]:
Olha como estava, olha esse bigode chinês, olha a flacidez.

[Mostra DEPOIS com empolgação, tom ALTO]:
Olha AGORA. Olha como ficou. O bigode sumiu, o olhar abriu. Ficou lindo, né?

E sabe o mais legal? Ela me disse que o marido falou: 'Você parece 10 anos mais jovem'. Ela chegou insegura, saiu daqui renovada."

**AVALIE:**
- Médico mostrou antes/depois?
- Contou história emocional ou só mostrou foto?
- Usou frequência alta (empolgação)?
- Score: 0-10

### ETAPA 12 - COMPARAÇÃO (Barato que Sai Caro)

**Script Correto:**
"${params.patientName}, percebe que R$ 1.300 no terço superior SAI MAIS CARO que R$ 2.500 no Full Face?

Por quê? Porque no terço superior, daqui 30 dias quando você voltar, você vai voltar ARREPENDIDA. Não teve resultado, só jogou dinheiro no lixo.

É um barato que sai caro. E eu não quero isso pra você."

**AVALIE:**
- Médico fez a comparação de valor?
- Explicou por que "barato sai caro"?
- Criou senso de desperdício?
- Score: 0-10

### ETAPA 13 - APRESENTAÇÃO DO PROTOCOLO

**CRÍTICO:** USAR AS PALAVRAS EXATAS DO PACIENTE

**Script Correto:**
"Então ${params.patientName}, a primeira etapa nós vamos começar HOJE, que é o Botox Full Face. Ele vai tratar [USAR DORES EXATAS: 'esse olhar cansado que você falou', 'essas rugas que te incomodam'].

Daqui 30 dias você volta e fazemos o preenchimento para [USAR DESEJOS EXATOS: 'aquele contorno que você tanto quer', 'deixar o rosto mais definido como você imaginou'].

E ${params.patientName}, você falou que tem [USAR OBJEÇÃO DELA: 'medo de não ficar natural']. Um dos PILARES do meu trabalho é a ELEGÂNCIA e NATURALIDADE. Você não vai ficar com cara de preenchida. Você vai ficar com a MELHOR VERSÃO DE VOCÊ.

Faz sentido?"

**AVALIE:**
- Médico apresentou protocolo?
- Usou palavras exatas do paciente (dores + desejos)?
- Quebrou objeções antes do preço?
- Plantou seeds de retorno (30 dias)?
- Score: 0-10

**SCORE TOTAL DO DIRECIONAMENTO: 0-60 pontos**

## PASSO 5: NEGOCIAÇÃO/FECHAMENTO (Etapa 14)

### ESTRUTURA MATEMÁTICA CORRETA:

1. **Ancoragem:** "O Botox Full Face custa R$ 3.100"
2. **Condição especial:** "Para começar HOJE, vou te fazer a R$ 2.900" (NUNCA diga "desconto")
3. **Abatimento:** "E vou abater a consulta de R$ 700"
4. **Valor final:** "Então fica R$ 2.200"
5. **Pergunta de fechamento:** "Como ficaria bom pra você, ${params.patientName}?"
6. **FECHAR A BOCA E OLHAR PARA ELA** (CRÍTICO!)

**REGRA DE OURO:** Quem fala primeiro perde.

**TÉCNICA DE DEVOLUÇÃO:**
- Paciente: "Divide no cartão?"
- Médico: "Se eu dividir em 3x sem juros, a gente fecha agora?" (DEVOLVE com pergunta!)

**OBJEÇÃO DE PREÇO:**
- Paciente: "Tá caro, faz mais barato?"
- Médico: "Esse já é o melhor valor. O que você tinha em mente investir?"
- [Se muito abaixo]: "Esse valor eu não consigo, ficaria no prejuízo."
- [Cria urgência]: "Se deixar pra depois, volta pro valor cheio."

**AVALIE:**
- Médico usou estrutura correta (ancoragem + condição + abatimento)?
- Fez pergunta de fechamento?
- Manteve silêncio após perguntar?
- Devolveu objeções com perguntas?
- Cedeu desconto facilmente ou justificou valor?
- Score: 0-10

## PASSO 6: RECORRÊNCIA (Etapa 15)

**AVALIE:**
- Médico plantou seeds durante a consulta? ("daqui 30 dias você volta")
- Tentou agendar próxima sessão ANTES de paciente sair?
- Criou expectativa de protocolo contínuo?
- Score: 0-10

# ANÁLISE DE PERFIL COMPORTAMENTAL (DISC)

**Identifique o perfil baseado em palavras-chave e comportamento:**

**DOMINANTE:** "resultado", "rápido", "objetivo", "eficiente" | Direto, impaciente
**INFLUENTE:** "pessoas", "social", "opinião", "amigos" | Sociável, expressivo
**ESTÁVEL:** "segurança", "garantia", "risco", "calma" | Cauteloso, precisa tempo
**ANALÍTICO:** "técnica", "estudo", "dados", "comprovado" | Detalhista, questiona

**PARA CADA PERFIL, AVALIE SE MÉDICO ADAPTOU:**

- **DOMINANTE:** Foi direto? Ou enrolou com conexão de 15 minutos?
- **INFLUENTE:** Usou prova social massiva? Ou foi técnico demais?
- **ESTÁVEL:** Transmitiu segurança? Ou pressionou pra decidir rápido?
- **ANALÍTICO:** Forneceu dados técnicos? Ou foi vago e superficial?

# TAREFA: GERAR ANÁLISE COMPLETA EM JSON

Retorne APENAS o JSON (sem markdown):

{
  "frameworkVersion": "3.0",
  "overallPerformance": {
    "score": 0-150,
    "rating": "Crítico|Insuficiente|Regular|Bom|Excelente",
    "mainConclusion": "2 frases sobre POR QUÊ perdeu a venda"
  },
  "rootCause": "Causa raiz FUNDAMENTAL da perda (1 frase direta)",
  "criticalErrors": [
    {
      "errorName": "Nome do erro fatal",
      "stepNumber": 1-15,
      "stepName": "Nome da etapa",
      "severity": "Fatal|Grave|Moderada",
      "whyItWasFatal": "Explicação do impacto direto na perda",
      "whatWasSaid": "Trecho EXATO da transcrição (citar palavra por palavra)",
      "whatShouldHaveBeenSaid": "Script ideal COMPLETO (30-60 segundos palavra por palavra) usando nome ${params.patientName}",
      "crucialDifference": "Por que a diferença foi determinante"
    }
  ],
  "frequencyAnalysis": {
    "connectionPhase": {
      "wasEmotionallyWarm": boolean,
      "usedOpenQuestions": boolean,
      "estimatedDuration": "X minutos",
      "rating": "Inadequado|Superficial|Adequado|Excelente"
    },
    "painDiscovery": {
      "usedLowFrequency": boolean,
      "wasEmpathetic": boolean,
      "wentDeep": boolean,
      "capturedExactWords": boolean,
      "rating": "Crítico|Superficial|Adequado|Profundo"
    },
    "desireExploration": {
      "usedHighFrequency": boolean,
      "wasEnthusiastic": boolean,
      "madePatientDream": boolean,
      "rating": "Apático|Neutro|Bom|Entusiasmado"
    }
  },
  "mappingAnalysis": {
    "question1_Pains": {
      "asked": boolean,
      "wentDeep": boolean,
      "capturedEmotionalPhrases": boolean,
      "usedCorrectFrequency": boolean,
      "score": 0-10,
      "exactMoment": "Trecho onde deveria ter aprofundado",
      "idealScript": "Script completo de como fazer certo (60 seg)"
    },
    "question2_Desires": {
      "asked": boolean,
      "madePatientVisualize": boolean,
      "usedCorrectFrequency": boolean,
      "score": 0-10,
      "idealScript": "Script completo (60 seg)"
    },
    "question3_Awareness": {
      "asked": boolean,
      "identifiedPatientType": "Analítico|Aberto|Influenciado|Não identificou",
      "adaptedApproach": boolean,
      "score": 0-10
    },
    "question4_History": {
      "asked": boolean,
      "discoveredHiddenObjections": boolean,
      "tookNotes": boolean,
      "score": 0-10
    },
    "question5_Fears": {
      "asked": boolean,
      "letPatientExpressFears": boolean,
      "score": 0-10
    },
    "overallMappingScore": 0-50
  },
  "directioningAnalysis": {
    "usedIndividualization": boolean,
    "usedExactPatientsWords": boolean,
    "educatedAboutTreatment": boolean,
    "usedPracticalExample": boolean,
    "showedBeforeAfter": boolean,
    "toldEmotionalStories": boolean,
    "brokeObjectionsBeforePrice": boolean,
    "plantedReturnSeeds": boolean,
    "score": 0-60
  },
  "closingAnalysis": {
    "usedCorrectPriceStructure": boolean,
    "madeClosingQuestion": boolean,
    "shutUpAfterAsking": boolean,
    "returnedObjectionsWithQuestions": boolean,
    "gaveDiscountEasily": boolean,
    "score": 0-10
  },
  "recurrenceAnalysis": {
    "plantedSeeds": boolean,
    "attemptedScheduling": boolean,
    "score": 0-10
  },
  "behavioralProfileAnalysis": {
    "detectedProfile": "Dominante|Influente|Estável|Analítico|Misto|Não detectado",
    "profileIndicators": ["Indicador 1", "Indicador 2"],
    "confidence": 0-10,
    "doctorAdapted": boolean,
    "adaptationAnalysis": "Médico adaptou ou desalinhado com perfil?",
    "fatalMismatch": "Erro fatal de não adaptar (se aplicável)",
    "howToSellToThisProfile": {
      "dos": ["Fazer 1", "Fazer 2", "Fazer 3"],
      "donts": ["Não fazer 1", "Não fazer 2"],
      "exampleScript": "Script completo de 60-90 segundos adaptado ao perfil usando nome ${params.patientName}"
    }
  },
  "dominoEffect": {
    "sequence": ["Erro inicial → Consequência 1 → Consequência 2 → Perda"],
    "narrativeExplanation": "2-3 parágrafos explicando cascata de falhas"
  },
  "correctionStrategy": {
    "immediatePriority": {
      "topCriticalSteps": [número, número, número],
      "reasonWhy": "Por que esses passos são prioridade máxima"
    },
    "trainingScripts": [
      {
        "stepNumber": número,
        "stepName": "Nome da etapa",
        "scriptTitle": "Título do script",
        "fullScript": "Script COMPLETO palavra por palavra (1-2 min) usando ${params.patientName}",
        "practiceInstructions": "Como treinar esse script"
      }
    ],
    "nextConsultationFocus": ["Foco 1", "Foco 2", "Foco 3"],
    "lifeboatScript": {
      "situation": "Quando usar (ex: objeção de preço difícil)",
      "script": "Script de emergência completo"
    }
  },
  "phaseByPhaseAnalysis": [
    {
      "stepNumber": 1,
      "stepName": "Primeira Impressão & Preparação",
      "score": 0-10,
      "rating": "Crítico|Insuficiente|Regular|Bom|Excelente",
      "whatHappened": "O que médico fez",
      "strengths": ["Ponto forte com citação"],
      "weaknesses": ["Ponto fraco com citação"],
      "impact": "Como impactou resultado final",
      "coachingNote": "Nota acionável"
    }
    ... (repetir 15 etapas)
  ]
}

# INSTRUÇÕES FINAIS

1. Seja honesto e direto - não amenize erros
2. Cite trechos exatos da transcrição como evidência
3. Forneça scripts completos palavra por palavra (não teoria)
4. Use ${params.patientName} nos scripts
5. Identifique perfil DISC e mostre adaptação necessária
6. Avalie todas as 15 etapas obrigatoriamente
7. Foco em ação imediata, não conceitos abstratos
8. NÃO use emojis em nenhuma parte da resposta
9. Use linguagem profissional e minimalista
10. Evite pontos de exclamação excessivos

Retorne APENAS o JSON, sem markdown.`;
}

// ============================================================================
// TEMPLATE: ANÁLISE DE VENDA REALIZADA v3.0
// ============================================================================

export function generateCompletedSalePromptV3(params: {
  patientName: string;
  duration?: string;
  protocolSold?: string;
  saleValue?: number;
  transcription: string;
}): string {
  return `Você é um especialista em análise de qualidade de vendas consultivas para medicina estética.

Sua tarefa é avaliar se a venda foi de alta qualidade (natural, genuína) ou baixa qualidade (forçada, com pressão).

IMPORTANTE: Use linguagem profissional e minimalista. NÃO use emojis em nenhuma parte da análise. Use apenas texto objetivo e direto.

# CONTEXTO DA CONSULTA
- Paciente: ${params.patientName}
- Duração: ${params.duration || 'Não informada'}
- Resultado: VENDA REALIZADA
- Protocolo vendido: ${params.protocolSold || 'Não informado'}
- Valor: R$ ${params.saleValue || 'Não informado'}

# TRANSCRIÇÃO DA CONSULTA
${params.transcription}

# CRITÉRIOS DE QUALIDADE

## INDICADORES DE BAIXA QUALIDADE (VENDA FORÇADA):
- Linguagem hesitante ao aceitar: "Ah, tá... vamos tentar"
- Múltiplos descontos oferecidos sem justificativa
- Urgência/escassez artificial excessiva
- Falta de mapeamento profundo (5 perguntas)
- Não usou palavras exatas do paciente
- Decisão rápida sem construção de valor
- Médico falou 80% do tempo (deveria ouvir 60%)

## INDICADORES DE ALTA QUALIDADE (VENDA NATURAL):
- Linguagem confiante: "Adorei. Vamos fazer. Estou animada."
- Construção sólida de valor ANTES do preço
- Mapeamento profundo completo (5 perguntas)
- Usou palavras EXATAS do paciente
- Conexão genuína de 10 minutos
- Quebrou objeções ANTES do preço
- Fechamento natural sem resistência
- Paciente convencido EMOCIONALMENTE

# METODOLOGIA DE AVALIAÇÃO (Mesmas 15 etapas)

[Usar mesma estrutura detalhada do prompt de venda perdida]

${generateLostSalePromptV3(params).split('# TAREFA:')[0]}

# TAREFA: DETERMINAR QUALIDADE E GERAR JSON

Primeiro, DETERMINE: Esta venda foi de BAIXA ou ALTA qualidade?

Analise a frase de fechamento do paciente e o tom geral.

## SE BAIXA QUALIDADE (VENDA FORÇADA), retorne:

{
  "frameworkVersion": "3.0",
  "qualityAssessment": {
    "isHighQuality": false,
    "qualityLevel": "Baixa - Venda Forçada",
    "riskScore": 0-10,
    "mainConcern": "Preocupação principal",
    "cancellationRisk": "Baixo|Médio|Alto|Crítico",
    "refundRisk": "Baixo|Médio|Alto|Crítico"
  },
  "whySaleHappened": {
    "pressureTacticsUsed": ["Tática 1", "Tática 2"],
    "patientResignationIndicators": ["Indicador 1 (citação)", "Indicador 2"],
    "risks": ["Risco 1", "Risco 2", "Risco 3"]
  },
  "exactMomentAnalysis": {
    "closingPhrase": "Frase EXATA do paciente ao aceitar",
    "toneAnalysis": "Resignação, dúvida ou entusiasmo?",
    "hesitationSignals": ["Sinal 1", "Sinal 2"],
    "missingEnthusiasm": "O que faltou"
  },
  "whatWentWrong": {
    "skippedSteps": [números],
    "superficialMapping": boolean,
    "didNotUseExactWords": boolean,
    "rushedToPrice": boolean,
    "gaveDiscountEasily": boolean
  },
  "improvementPlan": {
    "criticalChanges": ["Mudança 1", "Mudança 2"],
    "followUpStrategy": "Como fazer follow-up com ${params.patientName}",
    "nextConsultationFocus": ["Foco 1", "Foco 2"]
  },
  "overallPerformance": { "score": 0-150, "rating": "string", "mainConclusion": "string" },
  "phaseByPhaseAnalysis": [{ ... 15 etapas ... }]
}

## SE ALTA QUALIDADE (VENDA GENUÍNA), retorne:

{
  "frameworkVersion": "3.0",
  "qualityAssessment": {
    "isHighQuality": true,
    "qualityLevel": "Alta - Venda Natural",
    "strengthScore": 0-10,
    "mainSuccess": "Fator principal de sucesso"
  },
  "successFactors": ["Fator 1", "Fator 2", "Fator 3"],
  "excellentMoments": [
    {
      "stepNumber": número,
      "stepName": "string",
      "whatHappenedRight": "Citação da transcrição",
      "impact": "Como impactou",
      "replicateScript": "Script para replicar"
    }
  ],
  "patientEnthusiasmAnalysis": {
    "closingPhrase": "Frase EXATA mostrando entusiasmo",
    "enthusiasmIndicators": ["Indicador 1", "Indicador 2"],
    "emotionalBuyIn": "Como comprou emocionalmente"
  },
  "whatWasWellExecuted": {
    "deepMapping": boolean,
    "usedExactWords": boolean,
    "brokeObjectionsEarly": boolean,
    "naturalClosing": boolean,
    "adaptedToBehavioralProfile": boolean
  },
  "replicationStrategy": {
    "keyScripts": [
      {
        "stepNumber": número,
        "scriptTitle": "string",
        "script": "Script completo que funcionou"
      }
    ],
    "bestPractices": ["Best practice 1", "Best practice 2"]
  },
  "overallPerformance": { "score": 0-150, "rating": "Excelente|Muito Bom", "mainConclusion": "string" },
  "phaseByPhaseAnalysis": [{ ... 15 etapas ... }]
}

# INSTRUÇÕES FINAIS

1. Seja honesto sobre qualidade
2. Se houve hesitação, classifique baixa qualidade
3. Se desconto múltiplo sem justificativa, baixa
4. Se faltou mapeamento profundo, baixa
5. Cite trechos exatos
6. Forneça scripts para replicar/corrigir
7. Avalie todas as 15 etapas
8. NÃO use emojis em nenhuma parte da resposta
9. Use linguagem profissional e minimalista
10. Evite pontos de exclamação excessivos

Retorne APENAS o JSON, sem markdown.`;
}

export { generateLostSalePromptV3 as generateLostSalePrompt };
export { generateCompletedSalePromptV3 as generateCompletedSalePrompt };
