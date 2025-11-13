# PASSOS MANUAIS PARA IMPLEMENTAÇÃO - Framework v3.0

## SUMÁRIO

Este documento lista todos os passos que precisam ser executados manualmente para completar a implementação do Framework v3.0 de análise de consultas médicas.

**Status Atual:** Código implementado ✅ | Requer execução manual ⏳

---

## 1. BANCO DE DADOS (SUPABASE)

### 1.1 Executar Migration SQL ⏳

**Arquivo:** `supabase/migrations/20250112_framework_v3_15_steps.sql`

**Como executar:**

#### Opção A: Via Supabase Dashboard
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto Med Briefing 2.0
3. Vá em **Database** > **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `20250112_framework_v3_15_steps.sql`
6. Cole no editor
7. Clique em **Run** (ou Ctrl+Enter)
8. Verifique se apareceu "Success" sem erros

#### Opção B: Via CLI do Supabase
```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
supabase db push
```

**O que essa migration faz:**
- ✅ Desativa framework v2.0 (16 etapas)
- ✅ Cria framework v3.0 (15 etapas)
- ✅ Atualiza perfis comportamentais DISC com scripts completos
- ✅ Adiciona keyIndicators para cada etapa

**Verificação:**
Após executar, rode esta query para confirmar:

```sql
-- Deve retornar versão 3.0 como ativa
SELECT version, name, is_active,
       jsonb_array_length(methodology_steps) as total_steps
FROM analysis_frameworks
WHERE is_active = true;

-- Deve retornar 15 etapas
```

---

## 2. EDGE FUNCTIONS (SUPABASE)

### 2.1 Deploy da Nova Edge Function v3 ⏳

**Arquivos criados:**
- `supabase/functions/analyze-consultation-v3/index.ts`
- `supabase/functions/_shared/prompt-templates-v3.ts`
- `supabase/functions/_shared/validation-schemas-v3.ts`

**Como fazer deploy:**

#### Via Supabase CLI:
```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"

# Deploy da função v3
supabase functions deploy analyze-consultation-v3

# Verificar se deployou
supabase functions list
```

**Verificação:**
1. Acesse Supabase Dashboard > **Edge Functions**
2. Deve aparecer `analyze-consultation-v3` na lista
3. Status deve estar **Active** (verde)

### 2.2 Configurar Variáveis de Ambiente (se necessário) ⏳

Verifique se a `GEMINI_API_KEY` está configurada:

```bash
# Listar secrets
supabase secrets list

# Se não existir, adicionar:
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
```

---

## 3. FRONTEND (REACT)

### 3.1 Atualizar Importações nos Componentes Existentes ⏳

**Arquivos a serem modificados:**

#### 3.1.1 `src/pages/Analyses.tsx` ou página principal de análises

Adicionar imports:
```typescript
import FrequencyAnalysisCard from '../components/analysis-v3/FrequencyAnalysisCard';
import MappingAnalysisCard from '../components/analysis-v3/MappingAnalysisCard';
```

Adicionar renderização condicional:
```typescript
{analysisData.frameworkVersion === '3.0' && (
  <>
    <FrequencyAnalysisCard frequencyAnalysis={analysisData.frequencyAnalysis} />
    <MappingAnalysisCard mappingAnalysis={analysisData.mappingAnalysis} />
  </>
)}
```

#### 3.1.2 `src/services/analysis-service.ts` (ou similar)

Atualizar URL da API para usar v3:

```typescript
// ANTES:
const response = await fetch('/supabase/functions/analyze-consultation-v2', {...});

// DEPOIS (com feature flag opcional):
const useV3 = true; // ou ler de configuração
const apiVersion = useV3 ? 'v3' : 'v2';
const response = await fetch(`/supabase/functions/analyze-consultation-${apiVersion}`, {...});
```

### 3.2 Instalar Dependências (se necessário) ⏳

Caso tenha adicionado novos pacotes (neste caso não foi necessário):

```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
npm install
```

### 3.3 Build e Test Local ⏳

```bash
# Rodar em modo dev para testar
npm run dev

# Abrir http://localhost:5173 (ou porta configurada)
# Testar criando uma nova análise
```

---

## 4. TESTES

### 4.1 Teste de Análise de Venda Perdida ⏳

1. Acesse o sistema
2. Crie nova análise
3. Selecione "Venda Perdida"
4. Cole uma transcrição de teste
5. Envie
6. Verifique se aparecem os novos cards:
   - ✅ Análise de Frequência Emocional
   - ✅ Análise de Mapeamento (5 Perguntas)
   - ✅ Análise por Etapas (15 etapas)
   - ✅ Scripts de Correção

### 4.2 Teste de Análise de Venda Realizada ⏳

1. Repita o processo acima
2. Selecione "Venda Realizada"
3. Verifique se classifica corretamente:
   - Alta Qualidade OU
   - Baixa Qualidade (Venda Forçada)

### 4.3 Validação de Scores ⏳

Verifique se os scores estão corretos:
- Score total deve ser /150 (não mais /160)
- Mapeamento deve ser /50
- Direcionamento deve ser /60
- Cada etapa individual /10

---

## 5. MIGRAÇÃO DE DADOS EXISTENTES (OPCIONAL)

### 5.1 Atualizar Análises Antigas ⏳

Se você quiser manter compatibilidade com análises v2.0:

```sql
-- Marcar análises antigas com versão correta
UPDATE analyses
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{frameworkVersion}',
    '"2.0"'
)
WHERE created_at < '2025-01-12'  -- Data do deploy v3.0
AND (metadata->>'frameworkVersion') IS NULL;
```

---

## 6. MONITORAMENTO E LOGS

### 6.1 Ativar Logs da Edge Function ⏳

```bash
# Ver logs em tempo real
supabase functions logs analyze-consultation-v3 --follow

# Ver últimos logs
supabase functions logs analyze-consultation-v3 --limit 100
```

### 6.2 Métricas de Sucesso a Monitorar ⏳

Acompanhe:
- Taxa de sucesso das chamadas à API (deve ser >95%)
- Tempo médio de processamento (deve ser <15 segundos)
- Taxa de validação com sucesso (deve ser >90%)
- Erros de parse JSON (deve ser <5%)

---

## 7. ROLLBACK (SE NECESSÁRIO)

### 7.1 Reverter para v2.0 ⏳

Se houver problemas:

```sql
-- Desativar v3.0
UPDATE analysis_frameworks SET is_active = false WHERE version = '3.0';

-- Reativar v2.0
UPDATE analysis_frameworks SET is_active = true WHERE version = '2.0';
```

E no frontend:
```typescript
const useV3 = false; // Voltar para v2
```

---

## 8. DOCUMENTAÇÃO

### 8.1 Atualizar README ⏳

Adicionar no README.md do projeto:

```markdown
## Framework de Análise v3.0

O sistema utiliza a metodologia oficial de 6 Passos de Vendas Consultivas:

### Etapas (15 total):
1. Primeira Impressão & Preparação
2. Conexão Genuína (10 min)
3-7. Mapeamento (5 Perguntas Obrigatórias)
8-13. Direcionamento (6 Sub-passos)
14. Negociação
15. Recorrência

### Novos recursos v3.0:
- ✅ Análise de Frequência Emocional
- ✅ Mapeamento Detalhado das 5 Perguntas
- ✅ Scripts Palavra-por-Palavra
- ✅ Adaptação ao Perfil DISC
- ✅ Score máximo: 150 pontos
```

---

## 9. CHECKLIST FINAL

Antes de considerar completo, verifique:

- [ ] Migration SQL executada com sucesso
- [ ] Framework v3.0 está ativo no banco
- [ ] Perfis DISC atualizados
- [ ] Edge function v3 deployada
- [ ] Frontend atualizado para usar v3
- [ ] Componentes novos renderizando corretamente
- [ ] Teste com análise de venda perdida OK
- [ ] Teste com análise de venda realizada OK
- [ ] Scores calculando corretamente (/150)
- [ ] Scripts de correção aparecendo
- [ ] Análise de frequência emocional funcional
- [ ] Análise de mapeamento funcional
- [ ] Logs da edge function sem erros
- [ ] Performance adequada (<15s por análise)

---

## 10. PRÓXIMOS PASSOS (FUTURO)

Após implementação estável:

1. **Adicionar índices no banco** para melhorar performance de queries
2. **Implementar cache** para análises frequentes
3. **Criar dashboard de métricas** agregadas (taxa de conversão média, scores médios, etc.)
4. **Exportar PDF** com novo layout v3.0
5. **Treinamento de usuários** sobre novas funcionalidades
6. **A/B Testing** comparando resultados v2 vs v3

---

## SUPORTE

### Problemas Comuns:

**1. Migration falhou com erro de sintaxe**
- Verifique se copiou TODO o arquivo SQL
- Não execute linha por linha, execute tudo de uma vez

**2. Edge function não aparece após deploy**
- Aguarde 1-2 minutos (pode demorar para propagar)
- Verifique logs: `supabase functions logs`
- Verifique se GEMINI_API_KEY está configurada

**3. Frontend não mostra novos componentes**
- Limpe cache do navegador (Ctrl+Shift+Delete)
- Verifique console do navegador para erros
- Confirme que `frameworkVersion` na resposta é "3.0"

**4. Análise retorna erro 500**
- Verifique logs da edge function
- Confirme que Gemini API está respondendo
- Valide JSON de entrada

---

## CONTATO

Em caso de dúvidas durante implementação:
- Revisar `Atualizações de Prompt.md` (documento principal)
- Consultar código-fonte dos arquivos criados
- Verificar logs do Supabase Dashboard

**Data de criação:** 11/01/2025
**Versão:** 1.0
**Status:** Pronto para execução
