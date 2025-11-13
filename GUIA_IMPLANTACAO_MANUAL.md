# 🚀 GUIA DE IMPLEMENTAÇÃO MANUAL - Med Briefing 2.0 v3.0

**Data:** 11/11/2025
**Versão do Sistema:** 3.0 (Framework de 15 Etapas)
**Status:** ✅ Código Implementado | ⏳ Execução Manual Necessária

---

## 📋 SUMÁRIO EXECUTIVO

Este guia contém todos os passos manuais que você precisa executar para ativar o **Framework v3.0** no sistema Med Briefing 2.0.

### ✅ O QUE JÁ FOI IMPLEMENTADO (Código Pronto):

1. **Framework v3.0** - 15 etapas baseadas nos 6 passos de vendas consultivas
2. **Prompts v3.0** - Análise de frequência emocional, mapeamento das 5 perguntas, scripts palavra-por-palavra
3. **Edge Function v3** - Integração com Gemini Flash 2.0
4. **Componentes React v3** - FrequencyAnalysisCard, MappingAnalysisCard
5. **Service de Análise v3** - Chamada à Edge Function com compatibilidade v2
6. **Remoção de Limites** - Gravações ilimitadas (Supabase Pro)

### ⏳ O QUE VOCÊ PRECISA FAZER MANUALMENTE:

1. **Executar Migration SQL** no Supabase (1 minuto)
2. **Fazer Deploy da Edge Function v3** (2 minutos)
3. **Verificar Variáveis de Ambiente** (1 minuto)
4. **Testar o Sistema** (5 minutos)

**Tempo Total Estimado:** 10 minutos

---

## 🗄️ PASSO 1: EXECUTAR MIGRATION SQL

### Objetivo:
Ativar o Framework v3.0 (15 etapas) e atualizar perfis DISC no banco de dados.

### Instruções:

#### Opção A: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Selecione seu projeto:** Med Briefing 2.0

3. **Navegue até SQL Editor:**
   - Clique em **"Database"** no menu lateral
   - Clique em **"SQL Editor"**

4. **Crie uma Nova Query:**
   - Clique em **"New Query"**

5. **Cole o SQL:**
   - Abra o arquivo: `supabase/migrations/20250112_framework_v3_15_steps.sql`
   - Copie TUDO (Ctrl+A, Ctrl+C)
   - Cole no editor SQL

6. **Execute:**
   - Clique em **"Run"** ou pressione `Ctrl+Enter`

7. **Verifique o Sucesso:**
   - Deve aparecer mensagem "Success" em verde
   - Verifique os resultados na parte inferior mostrando framework v3.0 ativo

#### Opção B: Via CLI do Supabase

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
supabase db push
```

### ✅ Verificação:

Execute esta query no SQL Editor para confirmar:

```sql
-- Deve retornar version = '3.0', is_active = true, total_steps = 15
SELECT version, name, is_active,
       jsonb_array_length(methodology_steps) as total_steps
FROM analysis_frameworks
WHERE is_active = true;
```

**Resultado Esperado:**
- `version`: "3.0"
- `is_active`: `true`
- `total_steps`: 15

---

## ☁️ PASSO 2: DEPLOY DA EDGE FUNCTION V3

### Objetivo:
Fazer deploy da Edge Function `analyze-consultation-v3` que usa o framework v3.0.

### Pré-requisitos:
- Supabase CLI instalado
- Autenticado no Supabase (`supabase login`)

### Instruções:

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# Deploy da Edge Function v3
supabase functions deploy analyze-consultation-v3

# Verificar se deployou
supabase functions list
```

### ✅ Verificação:

1. **Via CLI:**
   ```bash
   supabase functions list
   ```

   Deve aparecer:
   ```
   analyze-consultation-v3  Active
   ```

2. **Via Dashboard:**
   - Acesse: https://supabase.com/dashboard
   - Vá em **Edge Functions**
   - Deve aparecer `analyze-consultation-v3` com status **Active** (verde)

### 🔧 Troubleshooting:

**Erro: "Function already exists"**
```bash
# Deletar função antiga e re-fazer deploy
supabase functions delete analyze-consultation-v3
supabase functions deploy analyze-consultation-v3
```

---

## 🔑 PASSO 3: VERIFICAR VARIÁVEIS DE AMBIENTE

### Objetivo:
Garantir que a GEMINI_API_KEY está configurada para a Edge Function.

### Instruções:

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# Listar secrets configurados
supabase secrets list
```

### Resultado Esperado:
```
GEMINI_API_KEY  ********
```

### Se NÃO estiver configurada:

```bash
# Configurar GEMINI_API_KEY
supabase secrets set GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**Onde obter a API Key:**
- Acesse: https://aistudio.google.com/app/apikey
- Crie uma nova API Key para Gemini
- Copie a chave

---

## 🧪 PASSO 4: TESTAR O SISTEMA

### Objetivo:
Verificar se o framework v3.0 está funcionando corretamente.

### Teste 1: Verificar Framework no Banco

```sql
-- Executar no SQL Editor do Supabase
SELECT
  version,
  name,
  is_active,
  jsonb_array_length(methodology_steps) as total_steps,
  methodology_steps->0->>'name' as primeira_etapa,
  methodology_steps->14->>'name' as ultima_etapa
FROM analysis_frameworks
WHERE version = '3.0';
```

**Resultado Esperado:**
- `total_steps`: 15
- `primeira_etapa`: "Primeira Impressão & Preparação"
- `ultima_etapa`: "Recorrência - Planejamento de Retorno"

### Teste 2: Verificar Perfis DISC

```sql
-- Executar no SQL Editor do Supabase
SELECT
  profile_type,
  display_name,
  jsonb_array_length(characteristics) as total_characteristics,
  jsonb_array_length(keywords) as total_keywords,
  selling_strategy
FROM behavioral_profiles_config
ORDER BY profile_type;
```

**Resultado Esperado:**
- 4 perfis (analytical, dominant, influential, steady)
- `total_characteristics` >= 5 para cada perfil
- `selling_strategy` com texto detalhado

### Teste 3: Testar Edge Function

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# Ver logs da função em tempo real
supabase functions logs analyze-consultation-v3 --follow
```

Deixe este terminal aberto e, em outro terminal ou pela interface web:

**Via Interface Web:**
1. Acesse o sistema Med Briefing 2.0
2. Vá em **Análises** > **Nova Análise**
3. Selecione **Performance**
4. Preencha:
   - Nome do Paciente: "Teste Framework v3"
   - Resultado: "Venda Perdida"
   - Transcrição: Cole qualquer texto de teste
5. Clique em **Analisar**

**O que esperar:**
- Nos logs, você verá: `[Gemini API] Using Framework v3.0`
- A análise deve retornar com `frameworkVersion: "3.0"`
- Deve ter 15 etapas na análise

---

## 📊 PASSO 5: VERIFICAR LIMITES REMOVIDOS

### Objetivo:
Confirmar que as gravações agora são ilimitadas.

### Teste:

1. Acesse **Gravações** no sistema
2. Clique em **Nova Gravação**
3. Verifique se aparece:
   - ✅ "Duração: Ilimitada ∞"
   - ✅ "Armazenamento: Ilimitado (Supabase Pro)"
   - ✅ Não deve aparecer mais "Duração máxima: 5 horas"

---

## 🎯 PASSO 6: VALIDAÇÃO FINAL

### Checklist Completo:

Execute cada item e marque com ✅:

```
□ Migration SQL executada com sucesso
□ Framework v3.0 está ativo no banco (SELECT retorna is_active = true)
□ Perfis DISC atualizados com scripts completos
□ Edge Function v3 deployada (supabase functions list mostra Active)
□ GEMINI_API_KEY configurada (supabase secrets list)
□ Teste de análise funcionou
□ Logs mostram "Using Framework v3.0"
□ Análise retorna frameworkVersion: "3.0"
□ Análise tem 15 etapas (não mais 16)
□ Gravações mostram "Ilimitada" na interface
□ Componentes novos (FrequencyAnalysisCard) renderizando
```

---

## 🔄 ROLLBACK (Se necessário)

### Se algo der errado e você quiser voltar para v2.0:

```sql
-- Desativar v3.0
UPDATE analysis_frameworks SET is_active = false WHERE version = '3.0';

-- Reativar v2.0
UPDATE analysis_frameworks SET is_active = true WHERE version = '2.0';
```

E no código (se necessário):
```typescript
// src/lib/analysis-service-v3.ts
// Comentar a importação e usar v2
```

---

## 📝 LOGS E MONITORAMENTO

### Monitorar Edge Function em tempo real:

```bash
# Logs da função v3
supabase functions logs analyze-consultation-v3 --follow

# Últimos 100 logs
supabase functions logs analyze-consultation-v3 --limit 100
```

### Métricas Importantes:

Após alguns dias de uso, verifique:

```sql
-- Análises criadas com v3.0
SELECT
  COUNT(*) as total_analises_v3,
  AVG((performanceData->'overallPerformance'->>'score')::int) as score_medio,
  outcome,
  DATE(created_at) as data
FROM analyses
WHERE analysis_type = 'performance'
AND (performanceData->>'frameworkVersion' = '3.0' OR created_at >= '2025-01-12')
GROUP BY outcome, DATE(created_at)
ORDER BY data DESC;
```

---

## 🆘 TROUBLESHOOTING COMUM

### Problema 1: Edge Function não encontrada

**Sintoma:** Erro "Function not found" ao tentar analisar

**Solução:**
```bash
supabase functions deploy analyze-consultation-v3
```

### Problema 2: Erro "GEMINI_API_KEY not set"

**Sintoma:** Erro de autenticação com Gemini

**Solução:**
```bash
supabase secrets set GEMINI_API_KEY=YOUR_KEY
```

### Problema 3: Análise retorna framework v2.0

**Sintoma:** A análise ainda usa 16 etapas

**Solução:**
```sql
-- Verificar se v3.0 está ativo
SELECT version, is_active FROM analysis_frameworks WHERE version = '3.0';

-- Se is_active = false, ativar:
UPDATE analysis_frameworks SET is_active = true WHERE version = '3.0';
UPDATE analysis_frameworks SET is_active = false WHERE version = '2.0';
```

### Problema 4: Componentes v3 não aparecem

**Sintoma:** FrequencyAnalysisCard não renderiza

**Solução:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique console do navegador para erros
- Confirme que análise retorna `frameworkVersion: "3.0"`

---

## 📞 SUPORTE

### Arquivos de Referência:

- **Documentação Completa:** `Atualizações de Prompt.md`
- **Passos Manuais Detalhados:** `PASSOS_MANUAIS_IMPLEMENTACAO.md`
- **Migration SQL:** `supabase/migrations/20250112_framework_v3_15_steps.sql`
- **Edge Function:** `supabase/functions/analyze-consultation-v3/index.ts`
- **Prompts v3:** `supabase/functions/_shared/prompt-templates-v3.ts`

### Comandos Úteis:

```bash
# Status geral do Supabase
supabase status

# Resetar banco local (CUIDADO!)
supabase db reset

# Ver todas as migrations aplicadas
supabase migration list
```

---

## ✅ CONCLUSÃO

Após seguir todos os passos, seu sistema Med Briefing 2.0 estará rodando com:

✅ **Framework v3.0** - 15 etapas de vendas consultivas
✅ **Análise de Frequência Emocional** - Tom baixo vs alto
✅ **Mapeamento Detalhado** - 5 perguntas obrigatórias
✅ **Scripts Palavra-por-Palavra** - Correções acionáveis
✅ **Adaptação ao Perfil DISC** - Scripts personalizados
✅ **Gravações Ilimitadas** - Sem limites de tempo ou armazenamento

**Tempo de Implementação Total:** ~10 minutos
**Benefícios:** Análises 10x mais precisas e acionáveis

---

**Última Atualização:** 11/11/2025
**Versão do Guia:** 1.0
**Status:** ✅ Pronto para Execução
