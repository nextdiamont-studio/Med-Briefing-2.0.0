# 🎯 GUIA DEFINITIVO: ONDE MEXER PARA IMPLEMENTAR NOVAS ANÁLISES

## 📊 SITUAÇÃO ATUAL

Seu sistema está usando **Framework v3.0** com 15 etapas.

### Fluxo Completo:
```
Frontend (React) → analysis-service-v3.ts → Edge Function (analyze-consultation-v3) → Gemini AI → Validação → Banco de Dados
```

---

## 🔥 ARQUIVOS QUE VOCÊ PRECISA MEXER (EM ORDEM)

### 1️⃣ **PROMPTS (ONDE A IA APRENDE O QUE FAZER)**

**Arquivo:** `supabase/functions/_shared/prompt-templates-v3.ts`

**O QUE MEXER:**
- Linha 40-600: Função `generateLostSalePromptV3()` - Define como analisar vendas perdidas
- Linha 600-1200: Função `generateCompletedSalePromptV3()` - Define como analisar vendas realizadas

**EXEMPLO DE MUDANÇA:**
```typescript
// ANTES
## PASSO 3: MAPEAMENTO - 5 PERGUNTAS OBRIGATÓRIAS (Etapas 3-7)

### ETAPA 3 - PERGUNTA 1: DORES (Frequência Emocional BAIXA)

// DEPOIS (SUAS ALTERAÇÕES)
## PASSO 3: MAPEAMENTO - 7 PERGUNTAS OBRIGATÓRIAS (Etapas 3-9)

### ETAPA 3 - PERGUNTA 1: CONTEXTO FAMILIAR
**Script Correto:**
"Me conta sobre sua família..."
```

**⚠️ ATENÇÃO:**
- Cada mudança aqui afeta o que a IA retorna
- Mantenha o formato JSON no final do prompt EXATAMENTE igual ao schema
- Se adicionar nova análise, adicione também no JSON de exemplo

---

### 2️⃣ **SCHEMAS DE VALIDAÇÃO (ESTRUTURA DE DADOS)**

**Arquivo:** `supabase/functions/_shared/validation-schemas-v3.ts`

**O QUE MEXER:**
- Linhas 12-32: `FrequencyAnalysisSchema` - Análise de frequência emocional
- Linhas 34-63: `MappingAnalysisSchema` - Mapeamento (5 perguntas)
- Linhas 65-75: `DirectioningAnalysisSchema` - Direcionamento
- Linhas 77-84: `ClosingAnalysisSchema` - Fechamento
- Linhas 86-90: `RecurrenceAnalysisSchema` - Recorrência
- Linhas 92-104: `BehavioralProfileAnalysisSchema` - Perfil DISC
- Linhas 153-171: `LostSaleResponseSchemaV3` - Schema completo venda perdida
- Linhas 177-222: `LowQualitySaleSchemaV3` - Venda de baixa qualidade
- Linhas 228-277: `HighQualitySaleSchemaV3` - Venda de alta qualidade

**EXEMPLO DE MUDANÇA:**
```typescript
// ANTES
export const MappingAnalysisSchema = z.object({
  question1_Pains: MappingQuestionSchema.extend({
    wentDeep: z.boolean(),
    capturedEmotionalPhrases: z.boolean(),
    usedCorrectFrequency: z.boolean(),
    exactMoment: z.string().optional(),
  }),
  // ... 4 perguntas mais

// DEPOIS (ADICIONANDO NOVA PERGUNTA)
export const MappingAnalysisSchema = z.object({
  question1_Family: MappingQuestionSchema.extend({
    builtConnection: z.boolean(),
    discoveredEmotionalContext: z.boolean(),
  }),
  question2_Pains: MappingQuestionSchema.extend({
    wentDeep: z.boolean(),
    capturedEmotionalPhrases: z.boolean(),
    usedCorrectFrequency: z.boolean(),
    exactMoment: z.string().optional(),
  }),
  // ... outras perguntas
```

**⚠️ ATENÇÃO:**
- Se você mudar o schema, a validação vai FALHAR até você atualizar o prompt também
- Todo campo novo precisa ter um tipo definido (z.string(), z.boolean(), z.number(), etc.)

---

### 3️⃣ **MAPEAMENTO DE DADOS (CONVERTER v3 PARA BANCO)**

**Arquivo:** `src/lib/analysis-service-v3.ts`

**O QUE MEXER:**
- Linhas 60-170: Função `analyzeConsultationPerformanceV3()` - Mapeia resposta da IA para estrutura do banco

**ONDE MAPEAR:**
```typescript
// Linha 89-138: Lost Sale Details
lost_sale_details: data.data?.outcome === 'Venda Perdida' ? {
  error_pattern: { ... },
  critical_errors: [ ... ],
  domino_effect: data.data?.dominoEffect?.narrativeExplanation || '',
  // ADICIONE SEUS NOVOS CAMPOS AQUI
  // nova_analise: data.data?.novaAnalise || {},
}

// Linha 141-146: V3 Specific Data (metadata)
v3Data: {
  frequencyAnalysis: data.data?.frequencyAnalysis,
  mappingAnalysis: data.data?.mappingAnalysis,
  // ADICIONE SEUS NOVOS CAMPOS AQUI
  // novaAnalise: data.data?.novaAnalise,
}
```

**⚠️ ATENÇÃO:**
- Este arquivo é a "ponte" entre a IA e o banco de dados
- Se você não mapear aqui, os dados não chegam no banco

---

### 4️⃣ **EDGE FUNCTION (NÃO PRECISA MEXER MUITO)**

**Arquivo:** `supabase/functions/analyze-consultation-v3/index.ts`

**O QUE PODE MEXER:**
- Linha 75-95: Geração de prompt (já usa os templates corretos)
- Linha 120-126: Configuração do Gemini (temperatura, tokens, etc.)

**QUANDO MEXER:**
- Se quiser aumentar/diminuir criatividade da IA: mude `temperature` (linha 121)
- Se a resposta estiver cortada: aumente `maxOutputTokens` (linha 122)

---

### 5️⃣ **COMPONENTES DE VISUALIZAÇÃO (FRONTEND)**

**Arquivos:**
- `src/components/analysis/LostSaleReport.tsx` - Exibe venda perdida
- `src/components/analysis/RealizedSaleReport.tsx` - Exibe venda realizada

**O QUE MEXER:**
```typescript
// ADICIONAR NOVA SEÇÃO DE ANÁLISE
<Section title="Nova Análise Personalizada" variant="info">
  <div className="space-y-4">
    <p>{analysis.lost_sale_details?.nova_analise?.descricao}</p>
    {/* Adicione visualizações dos novos dados */}
  </div>
</Section>
```

---

## 🚀 PASSO A PASSO PARA IMPLEMENTAR NOVA ANÁLISE

### Exemplo: Adicionar "Análise de Empatia"

#### 1. **Atualizar Prompt** (`prompt-templates-v3.ts`)
```typescript
// Adicione na função generateLostSalePromptV3
### NOVA ANÁLISE: EMPATIA

**AVALIE:**
- O médico demonstrou empatia genuína?
- Usou frases de validação emocional?
- Espelhou as emoções do paciente?

Score: 0-10
```

#### 2. **Atualizar Schema** (`validation-schemas-v3.ts`)
```typescript
// Adicione novo schema
export const EmpathyAnalysisSchema = z.object({
  demonstratedGenuineEmpathy: z.boolean(),
  usedValidationPhrases: z.boolean(),
  mirroredEmotions: z.boolean(),
  score: z.number().min(0).max(10),
});

// Adicione ao LostSaleResponseSchemaV3
export const LostSaleResponseSchemaV3 = z.object({
  frameworkVersion: z.literal('3.0'),
  // ... campos existentes
  empathyAnalysis: EmpathyAnalysisSchema, // ← NOVO
});
```

#### 3. **Atualizar Mapeamento** (`analysis-service-v3.ts`)
```typescript
v3Data: {
  frequencyAnalysis: data.data?.frequencyAnalysis,
  mappingAnalysis: data.data?.mappingAnalysis,
  empathyAnalysis: data.data?.empathyAnalysis, // ← NOVO
}
```

#### 4. **Atualizar Componente** (`LostSaleReport.tsx`)
```typescript
<Section title="Análise de Empatia" variant="info">
  <ScoreDisplay
    score={analysis.v3Data?.empathyAnalysis?.score || 0}
    maxScore={10}
    label="Score de Empatia"
  />
  <div className="space-y-2">
    <p>
      Empatia Genuína: {analysis.v3Data?.empathyAnalysis?.demonstratedGenuineEmpathy ? '✓' : '✗'}
    </p>
    <p>
      Frases de Validação: {analysis.v3Data?.empathyAnalysis?.usedValidationPhrases ? '✓' : '✗'}
    </p>
  </div>
</Section>
```

#### 5. **Deploy da Edge Function**
```bash
cd supabase
supabase functions deploy analyze-consultation-v3
```

---

## 🔄 ORDEM DE DEPLOY

1. ✅ Mexe nos arquivos locais (prompts, schemas, componentes)
2. ✅ Testa localmente se compila (npm run dev)
3. ✅ Faz deploy da Edge Function:
   ```bash
   supabase functions deploy analyze-consultation-v3
   ```
4. ✅ Testa uma análise real

---

## ⚠️ ERROS COMUNS

### ❌ "Validation Error"
**Causa:** Schema não bate com o que a IA retornou
**Solução:** Verifique se o JSON de exemplo no prompt tem TODOS os campos do schema

### ❌ "Cannot read properties of null"
**Causa:** Tentou acessar campo que não existe
**Solução:** Use optional chaining (`?.`) e valores padrão (`|| 0`)

### ❌ "Edge Function não atualiza"
**Causa:** Deploy não foi feito
**Solução:** Rode `supabase functions deploy analyze-consultation-v3`

### ❌ "Análise demora muito"
**Causa:** Prompt muito longo ou `maxOutputTokens` muito alto
**Solução:** Reduza o prompt ou ajuste tokens em `analyze-consultation-v3/index.ts:122`

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Atualizei o prompt em `prompt-templates-v3.ts`
- [ ] Atualizei o schema em `validation-schemas-v3.ts`
- [ ] Atualizei o mapeamento em `analysis-service-v3.ts`
- [ ] Atualizei os componentes visuais
- [ ] Testei localmente (npm run dev)
- [ ] Fiz deploy da Edge Function
- [ ] Testei com uma análise real
- [ ] Verifiquei se os dados aparecem no relatório

---

## 🆘 DÚVIDAS FREQUENTES

**Q: Por que minha mudança não aparece?**
A: Você provavelmente só mudou o prompt mas não fez deploy da Edge Function.

**Q: Como sei qual arquivo mexer?**
A: Se é sobre "o que a IA analisa" → prompt. Se é sobre "estrutura de dados" → schema. Se é sobre "visualização" → componentes.

**Q: Preciso mexer no banco de dados?**
A: Não, se você só quer adicionar análises dentro do JSON `v3Data`. Se quiser criar colunas novas, aí sim precisa de migration.

**Q: Como debugar erros da IA?**
A: Veja os logs da Edge Function em Supabase Dashboard → Edge Functions → Logs

---

## 📞 SUPORTE

Se algo não funcionar:
1. Veja os logs no Supabase Dashboard
2. Verifique se o deploy foi feito
3. Teste o schema com dados de exemplo
4. Confira se todos os arquivos foram salvos

Boa sorte! 🚀
